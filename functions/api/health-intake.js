import { sbGet, sbSet } from './_supabase.js';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-health-secret'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

const KEEP_DAYS = 90;

function dateOnly(d) { return (d || '').slice(0, 10); }

const SUM_METRICS = new Set([
  'active_energy', 'basal_energy_burned', 'step_count', 'flights_climbed',
  'cycling_distance', 'walking_running_distance', 'apple_exercise_time',
  'apple_stand_time', 'apple_stand_hour', 'time_in_daylight', 'dietary_energy',
  // Macro/nutrition metrics (MacroFactor → Apple Health → Health Auto Export),
  // logged as one data point per meal — need summing per day for the same
  // reason dietary_energy does, or only the last meal of the day survives.
  'protein', 'carbohydrates', 'total_fat', 'saturated_fat',
  'monounsaturated_fat', 'polyunsaturated_fat', 'dietary_sugar', 'fiber',
  'cholesterol', 'sodium', 'dietary_water', 'caffeine'
]);

function pointValue(point) {
  if (point.qty !== undefined) return point.qty;
  if (point.totalSleep !== undefined) return point.totalSleep;
  if (point.Avg !== undefined) return point.Avg;
  if (point.avg !== undefined) return point.avg;
  if (point.asleep !== undefined) return point.asleep;
  if (point.value !== undefined) return point.value;
  return undefined;
}

// Workouts arrive with their full GPS route and per-second heart rate / energy /
// step arrays (~250 KB each). The dashboard only uses the summary fields, and
// keeping the arrays grew the stored blob to ~10 MB — every sync had to read,
// parse and rewrite all of it, which pushed the function past its limits and
// returned HTTP 500s to Health Auto Export. Arrays are dropped; summaries kept.
function slimWorkout(w) {
  const out = {};
  for (const [k, v] of Object.entries(w)) if (!Array.isArray(v)) out[k] = v;
  return out;
}

// Last few failures, so the cause of any 500 can be looked up afterwards.
async function logError(env, where, err, extra) {
  try {
    const prev = (await sbGet(env, 'health-intake-errors')) || [];
    const list = Array.isArray(prev) ? prev : [];
    list.unshift({ at: new Date().toISOString(), where, error: String(err && err.message || err), ...extra });
    await sbSet(env, 'health-intake-errors', list.slice(0, 20));
  } catch {}
}

export async function onRequest(context) {
  try {
    return await handle(context);
  } catch (err) {
    await logError(context.env, 'uncaught', err);
    return json(500, { error: err.message });
  }
}

async function handle(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = env.HEALTH_SECRET;
  if (secret && request.headers.get('x-health-secret') !== secret) {
    return json(401, { error: 'Unauthorized' });
  }

  const text = await request.text();
  const bodyLen = text.length;

  // Fast path: hand the export straight to Postgres (health_ingest), which merges
  // it into the stored blob under a row lock. The Worker never parses or rewrites
  // the ~1 MB blob, which is what was pushing it past Cloudflare's CPU limit and
  // producing intermittent HTTP 500s in Health Auto Export.
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/health_ingest`, {
      method: 'POST',
      headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: `{"payload":${text || '{}'}}`
    });
    const out = await res.text();
    if (res.ok) {
      const ok = out.includes('"ok": true') || out.includes('"ok":true');
      return new Response(out, { status: ok ? 200 : 400, headers: CORS });
    }
    if (res.status === 400 && /invalid input syntax for type json|empty or invalid json|PGRST102/i.test(out)) return json(400, { error: 'Invalid JSON body' });
    await logError(env, 'rpc', `${res.status} ${out.slice(0, 300)}`, { bodyLen });
    // fall through to the in-Worker merge below
  } catch (err) {
    await logError(env, 'rpc', err, { bodyLen });
  }

  let payload;
  try { payload = JSON.parse(text || '{}'); }
  catch { return json(400, { error: 'Invalid JSON body' }); }

  const metrics = (payload?.data?.metrics) || [];
  const workouts = (payload?.data?.workouts) || [];
  if ((!Array.isArray(metrics) || !metrics.length) && (!Array.isArray(workouts) || !workouts.length)) {
    return json(400, { error: 'No metrics or workouts found in payload (expected data.metrics[] or data.workouts[])' });
  }

  // A failed read here must NOT silently fall through to an empty object —
  // doing so makes the merge below (and the final sbSet) overwrite the
  // stored blob with just this one sync's data, permanently wiping every
  // earlier day. (This is exactly what happened 2026-10-05: a transient
  // Supabase read failure during ingestion was swallowed, and the next
  // write replaced months of history with that sync's ~3 days.) Fail the
  // whole request instead — Health Auto Export will just retry on its next
  // scheduled sync, which is safe since ingestion is otherwise additive.
  let existing;
  try { existing = await sbGet(env, 'blob:health-data') || {}; }
  catch (err) {
    return json(502, { error: `Failed to read existing health data, aborting ingestion to avoid overwriting history: ${err.message}` });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const metric of metrics) {
    const name = metric?.name;
    if (!name) continue;
    const prior = existing[name] || {};
    const byDate = prior.byDate || {};

    if (SUM_METRICS.has(name)) {
      // Each data point (one per meal for MacroFactor, one per sample for
      // steps etc.) is stored by its timestamp + source and merged with what's
      // already there, so a sync that only carries part of a day (e.g. the
      // meals logged since the last sync) adds to the day instead of
      // replacing it, and a re-sent point just overwrites itself. The day's
      // value is the sum of its points. Days stored before this change have
      // no points yet; the first sync that includes them rebuilds them.
      const touched = new Set();
      // Days this export has data for. If it also has the day before, the export
      // window started before this day, so it carries the whole day: that day's
      // stored entries are replaced, which drops entries deleted or edited at
      // source (e.g. a meal removed in MacroFactor) instead of counting them forever.
      const pdates = new Set((metric.data || []).map(pt => dateOnly(pt.date)).filter(Boolean));
      const prevDay = ds => { const t = new Date(ds + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() - 1); return t.toISOString().slice(0, 10); };
      for (const point of (metric.data || [])) {
        const date = dateOnly(point.date);
        if (!date) continue;
        const value = pointValue(point);
        if (value === undefined) continue;
        const covered = pdates.has(prevDay(date));
        const day = touched.has(date) ? byDate[date] : (!covered && byDate[date] && byDate[date].points ? byDate[date] : { points: {} });
        day.points[`${point.date}|${point.source || ''}`] = value;
        day.raw = point;
        byDate[date] = day;
        touched.add(date);
      }
      // A point stamped exactly 00:00:00 is a whole-day summary (e.g. a manual
      // export); other points are individual entries. A day can end up with
      // both, so take whichever total is larger rather than adding them.
      // Same rule as Postgres health_day_value(): each timestamp counts once (the
      // same entry can arrive with and without a source name); a 00:00:00 value at
      // least half the size of the other entries is a whole-day summary.
      for (const date of touched) {
        const byTs = {};
        for (const [k, v] of Object.entries(byDate[date].points)) {
          const ts = k.split('|')[0];
          if (typeof v === 'number') byTs[ts] = Math.max(byTs[ts] ?? -Infinity, v);
        }
        let whole = 0, parts = 0;
        for (const [ts, v] of Object.entries(byTs)) { if (/ 00:00:00/.test(ts)) whole += v; else parts += v; }
        byDate[date].value = whole >= 0.5 * parts ? Math.max(whole, parts) : whole + parts;
      }
    } else {
      for (const point of (metric.data || [])) {
        const date = dateOnly(point.date);
        if (!date) continue;
        const value = pointValue(point);
        if (value === undefined) continue;
        byDate[date] = { value, raw: point };
      }
    }

    for (const d of Object.keys(byDate)) {
      if (d < cutoffStr) delete byDate[d];
    }
    existing[name] = { units: metric.units || prior.units || null, byDate };
  }

  // Individual workouts (Health Auto Export "Workouts" data type, distinct from
  // the summed daily quantity metrics above) — stored raw, keyed by the
  // workout's own id so re-sending the same workout (e.g. next sync cycle)
  // just overwrites it in place rather than duplicating. Used by the frontend
  // to fill in activity-type breakdowns for sessions that never reached Strava.
  if (Array.isArray(workouts) && workouts.length) {
    const priorW = existing._workouts || {};
    const byId = { ...(priorW.byId || {}) };
    for (const w of workouts) {
      if (!w || !w.id) continue;
      byId[w.id] = slimWorkout(w);
    }
    const workoutCutoffMs = Date.now() - KEEP_DAYS * 86400000;
    for (const id of Object.keys(byId)) {
      const t = byId[id].start ? Date.parse(byId[id].start) : NaN;
      if (!Number.isNaN(t) && t < workoutCutoffMs) delete byId[id];
    }
    existing._workouts = { byId };
  }

  existing._updatedAt = Date.now();

  try {
    await sbSet(env, 'blob:health-data', existing);
  } catch (err) {
    await logError(env, 'save', err, { bodyLen, metrics: metrics.length, workouts: workouts.length });
    return json(500, { error: err.message });
  }

  return json(200, { ok: true, metricsReceived: metrics.map(m => m.name), workoutsReceived: workouts.length });
}
