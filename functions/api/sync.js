import { sbGet, sbGetRow, sbSet } from './_supabase.js';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

// Keys whose pushes are merged into what's stored instead of replacing it, so two
// devices ticking habits don't overwrite each other (and a phone that's still on
// yesterday can't wipe today's ticks).
//   habit_log:    { date: { habitId: bool } }  → each date/habit sent is set; others kept
//   daily_habits: { date, ticked: { habitId: bool } } → same date: habits merged;
//                 newer date: replaces; older date: ignored
function mergeHabitLog(stored, incoming) {
  const out = (stored && typeof stored === 'object' && !Array.isArray(stored)) ? { ...stored } : {};
  for (const [d, ticks] of Object.entries(incoming || {})) {
    if (!ticks || typeof ticks !== 'object') continue;
    out[d] = { ...(out[d] || {}), ...ticks };
  }
  return out;
}
function mergeDaily(stored, incoming) {
  if (!incoming || !incoming.date) return stored;
  if (!stored || !stored.date || incoming.date > stored.date) return { date: incoming.date, ticked: { ...(incoming.ticked || {}) } };
  if (incoming.date < stored.date) return stored;
  return { date: stored.date, ticked: { ...(stored.ticked || {}), ...(incoming.ticked || {}) } };
}
const MERGERS = { habit_log: mergeHabitLog, daily_habits: mergeDaily };

async function sbGetMany(env, keys) {
  const list = keys.map(k => `"${k.replace(/"/g, '')}"`).join(',');
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/dashboard_kv?key=in.(${encodeURIComponent(list)})&select=key,data,ts`, {
    headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  const out = {};
  for (const r of await res.json()) out[r.key] = { data: r.data, _ts: r.ts };
  return out;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const keys = url.searchParams.get('keys');
  if (!key && !keys) return json(400, { error: 'Missing key parameter' });
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return json(500, { error: 'Supabase not configured' });

  if (request.method === 'GET') {
    try {
      // ?keys=a,b,c → every key in one request (used on page load)
      if (keys) return json(200, await sbGetMany(env, keys.split(',').filter(Boolean).slice(0, 200)));
      return json(200, await sbGetRow(env, key));
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  if (request.method === 'POST') {
    if (!key) return json(400, { error: 'Missing key parameter' });
    let body;
    try { body = JSON.parse(await request.text() || '{}'); } catch { return json(400, { error: 'Invalid JSON' }); }
    const ts = Date.now();
    let data = body.data !== undefined ? body.data : body;
    try {
      // Always merged — also protects against an older copy of the page still open
      // somewhere, which sends its whole list without the merge flag.
      if (MERGERS[key]) {
        data = MERGERS[key](await sbGet(env, key), data);
        await sbSet(env, key, data);
        return json(200, { ok: true, _ts: ts, data });
      }
      await sbSet(env, key, data);
      return json(200, { ok: true, _ts: ts });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  return json(405, { error: 'Method not allowed' });
}
