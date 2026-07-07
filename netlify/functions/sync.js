/**
 * Generic cross-device sync store backed by Supabase PostgreSQL.
 * GET  /api/sync?key=<key>          -> { data, _ts } or null
 * POST /api/sync?key=<key>  body:{ data, _ts } -> upserts, last-write-wins
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  };
}

async function sbGet(key) {
  const url = `${SUPABASE_URL}/rest/v1/dashboard_kv?key=eq.${encodeURIComponent(key)}&select=data,ts`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  const rows = await res.json();
  return rows.length > 0 ? { data: rows[0].data, _ts: rows[0].ts } : null;
}

async function sbUpsert(key, data, ts) {
  const url = `${SUPABASE_URL}/rest/v1/dashboard_kv`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, data, ts })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert failed: ${res.status} ${text}`);
  }
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (!key) return json(400, { error: 'Missing key parameter' });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(500, { error: 'Supabase not configured' });

  if (event.httpMethod === 'GET') {
    try {
      const row = await sbGet(key);
      return json(200, row);
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }
    const ts = body._ts !== undefined ? body._ts : Date.now();
    const data = body.data !== undefined ? body.data : body;
    try {
      await sbUpsert(key, data, ts);
      return json(200, { ok: true, _ts: ts });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
