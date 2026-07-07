import { sbGet, sbSet } from './_supabase.js';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return json(400, { error: 'Missing key parameter' });
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return json(500, { error: 'Supabase not configured' });

  if (request.method === 'GET') {
    try {
      const row = await sbGet(env, key);
      return json(200, row);
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  if (request.method === 'POST') {
    let body;
    try { body = JSON.parse(await request.text() || '{}'); } catch { return json(400, { error: 'Invalid JSON' }); }
    const ts = body._ts !== undefined ? body._ts : Date.now();
    const data = body.data !== undefined ? body.data : body;
    try {
      await sbSet(env, key, data);
      return json(200, { ok: true, _ts: ts });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  return json(405, { error: 'Method not allowed' });
}
