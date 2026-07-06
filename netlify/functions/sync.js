const { getStore } = require('@netlify/blobs');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

// Falls back to explicit siteID/token if Netlify's automatic Blobs context
// isn't available in this deploy (set BLOBS_SITE_ID / BLOBS_TOKEN env vars to enable).
function blobStore(name) {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  return siteID && token ? getStore({ name, siteID, token }) : getStore(name);
}

// Generic cross-device sync store.
// GET  /api/sync?key=<key>          -> { data, _ts } or null
// POST /api/sync?key=<key>  body:{ data, _ts } -> stores as-is, last-write-wins (client compares _ts)
exports.handler = async (event) => {
  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (!key) return json(400, { error: 'Missing key parameter' });

  const store = blobStore('dashboard-sync');

  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get(key);
      return json(200, raw ? JSON.parse(raw) : null);
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
    if (body._ts === undefined) body._ts = Date.now();
    try {
      await store.set(key, JSON.stringify(body));
      return json(200, { ok: true, _ts: body._ts });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
