import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore({ name: 'dashboard-sync', consistency: 'strong' });
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return new Response('Missing key', { status: 400 });

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (req.method === 'GET') {
    const data = await store.get(key);
    return new Response(data || 'null', { status: 200, headers });
  }

  if (req.method === 'POST') {
    const body = JSON.parse((await req.text()) || 'null');
    // last-write-wins: only overwrite if incoming timestamp is newer
    const existing = JSON.parse((await store.get(key)) || 'null');
    if (!existing || !body?._ts || !existing?._ts || body._ts >= existing._ts) {
      await store.set(key, JSON.stringify(body));
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response('Method not allowed', { status: 405 });
};
