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

// GET /api/health-data -> returns the stored health blob (or null if nothing synced yet)
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  const store = blobStore('health-data');
  try {
    const raw = await store.get('latest');
    return json(200, raw ? JSON.parse(raw) : null);
  } catch (err) {
    return json(500, { error: err.message });
  }
};
