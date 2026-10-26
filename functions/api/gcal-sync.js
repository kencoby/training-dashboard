// "Sync now" for the Calendar page: asks Phil's calendar Apps Script
// (apps-script/calendar-sync.gs, deployed as a web app) to run its sync, which
// pushes fresh events to /api/gcal-intake. The script URL stays server-side.
//
//   POST /api/gcal-sync → { ok, events } or { ok: false, error }
//
// Needs GCAL_SCRIPT_URL set in Cloudflare Pages.

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!env.GCAL_SCRIPT_URL) {
    return json(503, { ok: false, error: 'Sync button not set up yet: GCAL_SCRIPT_URL is missing in Cloudflare' });
  }
  try {
    // Apps Script answers with a redirect to the result; fetch follows it.
    const res = await fetch(env.GCAL_SCRIPT_URL, { method: 'POST', body: '{}', redirect: 'follow' });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      const hint = /accounts\.google|sign in/i.test(text) ? ' (is the web app set to "Who has access: Anyone"?)' : '';
      return json(502, { ok: false, error: `Calendar script returned an unexpected response${hint}` });
    }
    return json(data.ok ? 200 : 502, data);
  } catch (err) {
    return json(502, { ok: false, error: `Couldn't reach the calendar script: ${err.message}` });
  }
}
