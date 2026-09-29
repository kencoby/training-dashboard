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
  'apple_stand_time', 'apple_stand_hour', 'time_in_daylight', 'dietary_energy'
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

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = env.HEALTH_SECRET;
  if (secret && request.headers.get('x-health-secret') !== secret) {
    return json(401, { error: 'Unauthorized' });
  }

  let payload;
  try { payload = JSON.parse(await request.text() || '{}'); }
  catch { return json(400, { error: 'Invalid JSON body' }); }

  const metrics = (payload?.data?.metrics) || [];
  const workouts = (payload?.data?.workouts) || [];
  if ((!Array.isArray(metrics) || !metrics.length) && (!Array.isArray(workouts) || !workouts.length)) {
    return json(400, { error: 'No metrics or workouts found in payload (expected data.metrics[] or data.workouts[])' });
  }

  let existing;
  try { existing = await sbGet(env, 'blob:health-data') || {}; }
  catch { existing = {}; }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const metric of metrics) {
    const name = metric?.name;
    if (!name) continue;
    const prior = existing[name] || {};
    const byDate = prior.byDate || {};

    if (SUM_METRICS.has(name)) {
      const sums = {}, lastRaw = {};
      for (const point of (metric.data || [])) {
        const date = dateOnly(point.date);
        if (!date) continue;
        const value = pointValue(point);
        if (value === undefined) continue;
        sums[date] = (sums[date] || 0) + value;
        lastRaw[date] = point;
      }
      for (const date of Object.keys(sums)) {
        byDate[date] = { value: sums[date], raw: lastRaw[date] };
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
      byId[w.id] = w;
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
    return json(500, { error: err.message });
  }

  return json(200, { ok: true, metricsReceived: metrics.map(m => m.name), workoutsReceived: workouts.length });
}
