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

const DEFAULTS = {
  workouts: [],
  zones: {
    ftpWatts: null,             // cycling: Functional Threshold Power
    runThresholdSecPerKm: null, // running: threshold pace, seconds per km
    swimThresholdSecPer100m: null, // swimming: threshold pace, seconds per 100m
    maxHR: null,
    thresholdHR: null
  }
};

// Single Blobs-backed store for the Planner feature (planned workouts + training
// zones). GET returns the whole blob; POST takes an `action` to mutate it —
// mirrors the shape of the other *-data.js / *-intake.js function pairs in this
// project, just collapsed into one file since both pieces are small and related.
exports.handler = async (event) => {
  const store = blobStore('planner-data');

  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get('latest');
      const data = raw ? JSON.parse(raw) : DEFAULTS;
      return json(200, { workouts: data.workouts || [], zones: { ...DEFAULTS.zones, ...(data.zones || {}) } });
    } catch (err) {
      return json(500, { error: err.message });
    }
  }

  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { action } = payload;

  let existing;
  try {
    const raw = await store.get('latest');
    existing = raw ? JSON.parse(raw) : { ...DEFAULTS };
  } catch {
    existing = { ...DEFAULTS };
  }
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
    await store.set('latest', JSON.stringify(existing));
  } catch (err) {
    return json(500, { error: err.message });
  }

  return json(200, { workouts: existing.workouts, zones: existing.zones });
};
