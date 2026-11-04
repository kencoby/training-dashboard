import { sbGet } from './_supabase.js';

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

// The stored blob keeps every individual entry ("points") per day so syncs can
// merge; the dashboard only needs each day's total, so points are dropped here
// (about 2.7 MB → 0.6 MB, which makes the dashboard load noticeably faster).
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const blob = await sbGet(env, 'blob:health-data');
    // Food and caffeine keep their entry times for the last 14 days (small), so the
    // dashboard can tell when you last ate and had caffeine each day.
    const KEEP_POINTS = new Set(['dietary_energy', 'caffeine']);
    const cut = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    if (blob && typeof blob === 'object') {
      for (const [name, m] of Object.entries(blob)) {
        if (m && typeof m === 'object' && m.byDate && typeof m.byDate === 'object') {
          for (const [d, day] of Object.entries(m.byDate)) {
            if (day && typeof day === 'object' && !(KEEP_POINTS.has(name) && d >= cut)) delete day.points;
          }
        }
      }
    }
    return json(200, blob);
  } catch (err) {
    return json(500, { error: err.message });
  }
}
