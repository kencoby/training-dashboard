import { sbSet } from './_supabase.js';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-gcal-secret'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = env.GCAL_SECRET;
  if (secret && request.headers.get('x-gcal-secret') !== secret) {
    return json(401, { error: 'Unauthorized' });
  }

  let payload;
  try { payload = JSON.parse(await request.text() || '{}'); }
  catch { return json(400, { error: 'Invalid JSON body' }); }

  if (!Array.isArray(payload.events)) {
    return json(400, { error: 'Missing events[] array' });
  }

  const data = {
    date: payload.date || null,
    timezone: payload.timezone || null,
    events: payload.events,
    updatedAt: Date.now()
  };

  try {
    await sbSet(env, 'blob:gcal-data', data);
    return json(200, { ok: true, eventsReceived: payload.events.length });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
