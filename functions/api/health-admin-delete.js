import { sbGet, sbSet } from './_supabase.js';

// One-time admin endpoint to remove a single bad reading from the health-data
// blob (e.g. a mis-synced Apple Health point that's since been deleted at the
// source). Added 2026-09-22 to delete a bad weight_body_mass reading for
// 2026-09-21. Not meant to be a permanent surface — delete this file once used.

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

const ADMIN_TOKEN = 'd940896eae999a28628f93697b04643c44adad22dee03090';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const metric = url.searchParams.get('metric');
  const date = url.searchParams.get('date');

  if (token !== ADMIN_TOKEN) return json(401, { error: 'Unauthorized' });
  if (!metric || !date) return json(400, { error: 'metric and date required' });

  let existing;
  try { existing = await sbGet(env, 'blob:health-data') || {}; }
  catch { existing = {}; }

  if (existing[metric] && existing[metric].byDate && Object.prototype.hasOwnProperty.call(existing[metric].byDate, date)) {
    const removed = existing[metric].byDate[date];
    delete existing[metric].byDate[date];
    existing._updatedAt = Date.now();
    try { await sbSet(env, 'blob:health-data', existing); }
    catch (err) { return json(500, { error: err.message }); }
    return json(200, { ok: true, deleted: { metric, date, removed } });
  }
  return json(200, { ok: true, deleted: null, note: 'No entry found for that metric/date' });
}
