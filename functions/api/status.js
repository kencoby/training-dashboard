// Data health for the dashboard's status card: when each source last synced,
// the newest entry it sent, and recent failures.
//   GET /api/status → { health: {...}, calendar: {...}, sync: {...} }
import { sbGetRow, sbGet } from './_supabase.js';

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: CORS });

// Newest entry time for a summed metric (from its per-entry points), else its newest day.
function latest(blob, metric) {
  const m = blob && blob[metric];
  if (!m || !m.byDate) return null;
  const days = Object.keys(m.byDate).sort();
  if (!days.length) return null;
  const last = days[days.length - 1];
  const pts = m.byDate[last] && m.byDate[last].points;
  const lastTs = pts ? Object.keys(pts).map(k => k.split('|')[0]).sort().pop() : null;
  return { day: last, at: lastTs || null, value: m.byDate[last].value ?? null };
}

export async function onRequest(context) {
  const { env } = context;
  try {
    const [healthRow, errors, gcal] = await Promise.all([
      sbGetRow(env, 'blob:health-data'),
      sbGet(env, 'health-intake-errors'),
      sbGet(env, 'blob:gcal-data')
    ]);
    const blob = healthRow && healthRow.data;
    return json(200, {
      health: {
        updatedAt: blob && blob._updatedAt ? blob._updatedAt : (healthRow ? healthRow._ts : null),
        steps: latest(blob, 'step_count'),
        activeEnergy: latest(blob, 'active_energy'),
        food: latest(blob, 'dietary_energy'),
        sleep: latest(blob, 'sleep_analysis'),
        heartRateVariability: latest(blob, 'heart_rate_variability'),
        weight: latest(blob, 'body_mass'),
        errors: Array.isArray(errors) ? errors.slice(0, 5) : []
      },
      calendar: { updatedAt: gcal && gcal.updatedAt ? gcal.updatedAt : null, events: gcal && Array.isArray(gcal.events) ? gcal.events.length : 0 }
    });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
