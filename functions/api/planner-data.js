import { sbGet, sbSet } from './_supabase.js';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

const DEFAULTS = {
  workouts: [],
  zones: {
    ftpWatts: null,
    runThresholdSecPerKm: null,
    swimThresholdSecPer100m: null,
    maxHR: null,
    thresholdHR: null
  }
};

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json(200, {});

  if (request.method === 'GET') {
    try {
      const data = await sbGet(env, 'blob:planner-data') || DEFAULTS;
      return json(200, { workouts: data.workouts || [], zones: { ...DEFAULTS.zones, ...(data.zones || {}) } });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let payload;
  try { payload = JSON.parse(await request.text() || '{}'); }
  catch { return json(400, { error: 'Invalid JSON body' }); }

  const { action } = payload;
  let existing;
  try { existing = await sbGet(env, 'blob:planner-data') || { ...DEFAULTS }; }
  catch { existing = { ...DEFAULTS }; }
  existing.workouts = existing.workouts || [];
  existing.zones = { ...DEFAULTS.zones, ...(existing.zones || {}) };

  if (action === 'upsert-workout') {
    const w = payload.workout;
    if (!w || !w.date || !w.sport) return json(400, { error: 'workout must include date and sport' });
    if (!w.id) w.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    w.updatedAt = Date.now();
    const idx = existing.workouts.findIndex(x => x.id === w.id);
    if (idx >= 0) existing.workouts[idx] = { ...existing.workouts[idx], ...w };
    else existing.workouts.push(w);
  } else if (action === 'delete-workout') {
    if (!payload.id) return json(400, { error: 'Missing id' });
    existing.workouts = existing.workouts.filter(w => w.id !== payload.id);
  } else if (action === 'save-zones') {
    if (!payload.zones) return json(400, { error: 'Missing zones' });
    existing.zones = { ...existing.zones, ...payload.zones };
  } else {
    return json(400, { error: 'Unknown action' });
  }

  try {
    await sbSet(env, 'blob:planner-data', existing);
    return json(200, { workouts: existing.workouts, zones: existing.zones });
  } catch (err) {
    return json(500, { error: err.message });
  }
}
