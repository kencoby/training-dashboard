/**
 * Netlify Functions v2 (ES module) version of the sync handler.
 * Backed by Supabase PostgreSQL — survives site migrations.
 * GET  /api/sync?key=<key>  -> { data, _ts } or null
 * POST /api/sync?key=<key>  body:{ data, _ts } -> upserts
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function respond(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

async function sbGet(key) {
  const url = `${SUPABASE_URL}/rest/v1/dashboard_kv?key=eq.${encodeURIComponent(key)}&select=data,ts`;
  const res = await fetch(url, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  const rows = await res.json();
  return rows.length > 0 ? { data: rows[0].data, _ts: rows[0].ts } : null;
}

async function sbUpsert(key, data, ts) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dashboard_kv`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, data, ts })
  });
  if (!res.ok) throw new Error(`Supabase upsert failed: ${res.status} ${await res.text()}`);
}

export default async (req) => {
  if (req.method === 'OPTIONS') return respond(200, {});

  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return respond(400, { error: 'Missing key parameter' });
  if (!SUPABASE_URL || !SUPABASE_KEY) return respond(500, { error: 'Supabase not configured' });

  if (req.method === 'GET') {
    try {
      return respond(200, await sbGet(key));
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (req.method === 'POST') {
    const body = JSON.parse((await req.text()) || '{}');
    const ts = body._ts !== undefined ? body._ts : Date.now();
    const data = body.data !== undefined ? body.data : body;
    try {
      await sbUpsert(key, data, ts);
      return respond(200, { ok: true, _ts: ts });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: 'Method not allowed' });
};
