// Read-only export of the dashboard's live data, for the weekly Google Sheets
// backup (see apps-script/weekly-export.gs).
//
// GET /api/export with header  x-export-secret: <EXPORT_SECRET>
//   → { exportedAt, health: { metric: { units, byDate: { 'YYYY-MM-DD': value } } },
//       dashboard: { key: data, ... } }
//
// "dashboard" is every synced key in dashboard_kv (habits, mood, tasks, notes,
// logs, …) — i.e. everything that isn't a server-side "blob:" entry. Health
// is the Apple Health blob with the raw per-point payloads dropped.
//
// Unlike the other read endpoints this one returns everything in one go, so
// it fails closed: with no EXPORT_SECRET set it refuses every request.

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sbSelect(env, query) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/dashboard_kv?${query}`, {
    headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  return res.json();
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  if (!env.EXPORT_SECRET) return json(503, { error: 'Export disabled: EXPORT_SECRET is not configured' });
  if (!sameSecret(request.headers.get('x-export-secret') || '', env.EXPORT_SECRET)) {
    return json(401, { error: 'Unauthorized' });
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return json(500, { error: 'Supabase not configured' });

  try {
    const [healthRows, kvRows] = await Promise.all([
      sbSelect(env, 'key=eq.blob%3Ahealth-data&select=data'),
      sbSelect(env, 'key=not.like.blob%3A*&select=key,data,ts&order=key.asc')
    ]);

    const health = {};
    const blob = (healthRows[0] && healthRows[0].data) || {};
    for (const [metric, m] of Object.entries(blob)) {
      if (!m || !m.byDate) continue;
      const byDate = {};
      for (const [d, v] of Object.entries(m.byDate)) {
        if (v && typeof v.value === 'number') byDate[d] = v.value;
      }
      health[metric] = { units: m.units || null, byDate };
    }

    const dashboard = {};
    for (const row of kvRows) dashboard[row.key] = row.data;

    return json(200, { exportedAt: new Date().toISOString(), health, dashboard });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
