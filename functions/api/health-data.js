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
    if (blob && typeof blob === 'object') {
      for (const m of Object.values(blob)) {
        if (m && typeof m === 'object' && m.byDate && typeof m.byDate === 'object') {
          for (const day of Object.values(m.byDate)) if (day && typeof day === 'object') delete day.points;
        }
      }
    }
    return json(200, blob);
  } catch (err) {
    return json(500, { error: err.message });
  }
}
