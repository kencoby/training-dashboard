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

// POST receiver for the scheduled Google Calendar sync (runs hourly via a
// Claude scheduled task, which has its own Calendar access — no OAuth flow
// needed in the dashboard itself). Expected body: { date, timezone, events }
// where events is an array of { summary, start, end, allDay }.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // Optional shared-secret check, same pattern as health-intake.js. Set
  // GCAL_SECRET in Netlify env vars + send it as x-gcal-secret to enable.
  const secret = process.env.GCAL_SECRET;
  if (secret && event.headers['x-gcal-secret'] !== secret) {
    return json(401, { error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  if (!Array.isArray(payload.events)) {
    return json(400, { error: 'Missing events[] array' });
  }

  const store = blobStore('gcal-data');
  const data = {
    date: payload.date || null,
    timezone: payload.timezone || null,
    events: payload.events,
    updatedAt: Date.now()
  };

  try {
    await store.set('latest', JSON.stringify(data));
  } catch (err) {
    return json(500, { error: err.message });
  }

  return json(200, { ok: true, eventsReceived: payload.events.length });
};
