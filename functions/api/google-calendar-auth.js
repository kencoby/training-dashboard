const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://www.googleapis.com/calendar/v3';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const { action } = params;
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return json(500, { error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured' });
  }

  try {
    if (action === 'exchange' || action === 'refresh') {
      const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret });
      if (action === 'exchange') {
        if (!params.code) return json(400, { error: 'Missing code' });
        body.set('code', params.code);
        body.set('grant_type', 'authorization_code');
        body.set('redirect_uri', params.redirect_uri || '');
      } else {
        if (!params.refresh_token) return json(400, { error: 'Missing refresh_token' });
        body.set('refresh_token', params.refresh_token);
        body.set('grant_type', 'refresh_token');
      }
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const data = await res.json();
      if (!res.ok) return json(res.status, data);
      const out = { access_token: data.access_token, expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600) };
      if (data.refresh_token) out.refresh_token = data.refresh_token;
      return json(200, out);
    }

    if (action === 'proxy') {
      const { access_token, path } = params;
      if (!access_token || !path) return json(400, { error: 'Missing access_token or path' });
      const query = { ...params };
      delete query.action; delete query.access_token; delete query.path;
      const qs = new URLSearchParams(query).toString();
      const apiUrl = `${API_BASE}${path}${qs ? '?' + qs : ''}`;
      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${access_token}` } });
      return json(res.status, await res.json());
    }

    return json(400, { error: 'Unknown action' });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
