import { sbGet, sbSet } from './_supabase.js';

const API_BASE = 'https://api.hevyapp.com/v1';
const PAGE_SIZE = 10;
const GOAL_TOTAL = 500;
const CACHE_TTL_MS = 60 * 60 * 1000;
const TARGET_LIFTS = {
  'Bench Press (Barbell)': 'Bench Press',
  'Squat (Barbell)': 'Squat',
  'Deadlift (Barbell)': 'Deadlift'
};

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function bestEntry(entries) {
  return entries.reduce((best, e) => {
    if (!best) return e;
    if (e.weight > best.weight) return e;
    if (e.weight === best.weight && e.date > best.date) return e;
    return best;
  }, null);
}

async function fetchAllWorkouts(apiKey) {
  const log = { 'Bench Press (Barbell)': [], 'Squat (Barbell)': [], 'Deadlift (Barbell)': [] };
  let page = 1, pageCount = 1;
  do {
    const res = await fetch(`${API_BASE}/workouts?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: { 'api-key': apiKey, accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Hevy API error ${res.status}`);
    const data = await res.json();
    pageCount = data.page_count || 1;
    for (const workout of data.workouts || []) {
      const dateStr = workout.start_time ? workout.start_time.slice(0, 10) : null;
      if (!dateStr) continue;
      for (const ex of workout.exercises || []) {
        if (!(ex.title in log)) continue;
        let maxWeight = null;
        for (const set of ex.sets || []) {
          if (set.type === 'warmup') continue;
          if (typeof set.weight_kg !== 'number') continue;
          if (maxWeight === null || set.weight_kg > maxWeight) maxWeight = set.weight_kg;
        }
        if (maxWeight !== null) log[ex.title].push({ date: dateStr, weight: maxWeight });
      }
    }
    page++;
  } while (page <= pageCount);
  return log;
}

function computePBs(log) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const lifts = Object.keys(TARGET_LIFTS).map(key => {
    const entries = log[key] || [];
    const allTime = bestEntry(entries);
    const recent = entries.filter(e => e.date >= cutoffStr);
    const recentBest = recent.length ? bestEntry(recent) : null;
    const current = recentBest || allTime;
    return { label: TARGET_LIFTS[key], allTime, current, isLastKnown: !recentBest };
  });
  const allTimeTotal = lifts.reduce((s, l) => s + (l.allTime ? l.allTime.weight : 0), 0);
  const currentTotal = lifts.reduce((s, l) => s + (l.current ? l.current.weight : 0), 0);
  return { lifts, allTimeTotal, currentTotal, goal: GOAL_TOTAL, fetchedAt: new Date().toISOString() };
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET' && request.method !== 'OPTIONS') return json(405, { error: 'Method not allowed' });

  const apiKey = env.HEVY_API_KEY;
  if (!apiKey) return json(500, { error: 'HEVY_API_KEY not configured' });

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === '1';

  if (!force) {
    try {
      const cached = await sbGet(env, 'blob:hevy-pbs');
      if (cached && Date.now() - cached._cachedAt < CACHE_TTL_MS) return json(200, cached.data);
    } catch { /* ignore */ }
  }

  try {
    const log = await fetchAllWorkouts(apiKey);
    const data = computePBs(log);
    try { await sbSet(env, 'blob:hevy-pbs', { data, _cachedAt: Date.now() }); } catch { /* best-effort */ }
    return json(200, data);
  } catch (err) {
    return json(502, { error: err.message });
  }
}
