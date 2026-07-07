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
  'apple_stand_time', 'apple_stand_hour', 'time_in_daylight'
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
  if (!Array.isArray(metrics) || !metrics.length) {
    return json(400, { error: 'No metrics found in payload (expected data.metrics[])' });
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

  existing._updatedAt = Date.now();

  try {
    await sbSet(env, 'blob:health-data', existing);
  } catch (err) {
    return json(500, { error: err.message });
  }

  return json(200, { ok: true, metricsReceived: metrics.map(m => m.name) });
}
