const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://www.googleapis.com/calendar/v3';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

// Mirrors strava-auth.js: 'exchange'/'refresh' talk to Google's OAuth token
// endpoint, 'proxy' forwards authenticated reads to the Calendar API. Client
// secret never leaves this function.
exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { action } = params;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

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

      // Normalise to the same {access_token, refresh_token, expires_at} shape
      // the client already uses for Strava tokens. Google only returns a
      // refresh_token on first consent — omit the key (not null) on refresh
      // so the client's {...tokens, ...data} merge keeps the original one.
      const out = {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
      };
      if (data.refresh_token) out.refresh_token = data.refresh_token;
      return json(200, out);
    }

    if (action === 'proxy') {
      const { access_token, path } = params;
      if (!access_token || !path) return json(400, { error: 'Missing access_token or path' });

      const query = { ...params };
      delete query.action;
      delete query.access_token;
      delete query.path;

      const qs = new URLSearchParams(query).toString();
      const url = `${API_BASE}${path}${qs ? '?' + qs : ''}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });
      const data = await res.json();
      return json(res.status, data);
    }

    return json(400, { error: 'Unknown action' });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
