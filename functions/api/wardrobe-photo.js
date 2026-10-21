// Wardrobe photos, stored in Phil's Google Drive via the Apps Script web app
// in apps-script/wardrobe-drive.gs. The browser only ever talks to this
// function; the script URL and shared secret stay server-side.
//
//   POST   /api/wardrobe-photo            { name, mimeType, data(base64) } → { id }
//   GET    /api/wardrobe-photo?id=<id>    → the image (cached at the edge)
//   DELETE /api/wardrobe-photo?id=<id>    → { ok }  (moves it to Drive's trash)
//
// Needs WARDROBE_SCRIPT_URL and WARDROBE_SECRET set in Cloudflare Pages.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

const MAX_B64 = 7 * 1024 * 1024; // ≈5 MB of image once decoded
const ID_RE = /^[\w-]{10,}$/;

async function callScript(env, payload) {
  // Apps Script answers a POST with a redirect to the actual response; fetch
  // follows it (as a GET), which is how Apps Script web apps are meant to be called.
  const res = await fetch(env.WARDROBE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, secret: env.WARDROBE_SECRET }),
    redirect: 'follow'
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Drive script returned ${res.status}: ${text.slice(0, 200)}`); }
  if (data.error) throw new Error(data.error);
  return data;
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (!env.WARDROBE_SCRIPT_URL || !env.WARDROBE_SECRET) {
    return json(503, { error: 'Photo storage not set up: WARDROBE_SCRIPT_URL / WARDROBE_SECRET missing' });
  }
  const url = new URL(request.url);
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/api/wardrobe-photo?id=${url.searchParams.get('id') || ''}`);

  try {
    if (request.method === 'POST') {
      let body;
      try { body = JSON.parse(await request.text() || '{}'); } catch { return json(400, { error: 'Invalid JSON body' }); }
      if (!body.data || typeof body.data !== 'string') return json(400, { error: 'Missing image data' });
      if (body.data.length > MAX_B64) return json(413, { error: 'Image too large (max ~5 MB)' });
      const { id } = await callScript(env, { action: 'upload', name: body.name, mimeType: body.mimeType, data: body.data });
      return json(200, { id });
    }

    const id = url.searchParams.get('id') || '';
    if (!ID_RE.test(id)) return json(400, { error: 'Missing or invalid id' });

    if (request.method === 'GET') {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
      const { mimeType, data } = await callScript(env, { action: 'get', id });
      const res = new Response(b64ToBytes(data), {
        headers: { ...CORS, 'Content-Type': mimeType || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' }
      });
      context.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    }

    if (request.method === 'DELETE') {
      await callScript(env, { action: 'delete', id });
      context.waitUntil(cache.delete(cacheKey));
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    const status = /not found/i.test(err.message) ? 404 : 502;
    return json(status, { error: err.message });
  }
}
