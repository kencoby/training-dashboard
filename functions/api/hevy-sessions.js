import { sbGet, sbSet } from './_supabase.js';

const API_BASE = 'https://api.hevyapp.com/v1';
const SESSION_COUNT = 8;
const CACHE_TTL_MS = 30 * 60 * 1000;

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function round25(n) { return Math.round(n / 2.5) * 2.5; }

function analyzeExercise(sets) {
  if (!sets.length) return { verdict: 'no-data', nextWeight: null, note: 'No working sets logged.' };
  const weights = sets.map(s => s.weight_kg).filter(w => typeof w === 'number');
  if (!weights.length) return { verdict: 'no-data', nextWeight: null, note: 'No weight logged (bodyweight or time-based).' };
  const maxW = Math.max(...weights), minW = Math.min(...weights);
  if (maxW > minW) return { verdict: 'progressed', nextWeight: maxW, note: `Increased ${minW}kg → ${maxW}kg mid-session — start next time at ${maxW}kg.` };
  const reps = sets.map(s => s.reps).filter(r => typeof r === 'number');
  if (!reps.length) return { verdict: 'hold', nextWeight: maxW, note: `Held ${maxW}kg — no rep data.` };
  const declined = reps.some((r, i) => i > 0 && r < reps[i - 1]);
  if (!declined && reps[reps.length - 1] >= reps[0]) {
    const inc = maxW >= 10 ? 2.5 : 1.25;
    const next = round25(maxW + inc);
    return { verdict: 'increase', nextWeight: next, note: `Reps held at ${maxW}kg (${reps.join('/')}) — bump to ${next}kg.` };
  }
  return { verdict: 'hold', nextWeight: maxW, note: `Reps dropped at ${maxW}kg (${reps.join('/')}) — hold and chase reps.` };
}

async function fetchRecentSessions(apiKey, pageSize) {
  const res = await fetch(`${API_BASE}/workouts?page=1&pageSize=${pageSize}`, {
    headers: { 'api-key': apiKey, accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`Hevy API error ${res.status}`);
  const data = await res.json();
  return data.workouts || [];
}

function analyzeSessions(workouts) {
  return workouts.map(w => {
    const exercises = (w.exercises || []).map(ex => {
      const workingSets = (ex.sets || []).filter(s => s.type !== 'warmup' && typeof s.weight_kg === 'number');
      if (!workingSets.length) return null;
      return { title: ex.title, sets: workingSets.map(s => ({ weight: s.weight_kg, reps: s.reps })), ...analyzeExercise(workingSets) };
    }).filter(Boolean);
    const durationMin = (w.start_time && w.end_time) ? Math.round((new Date(w.end_time) - new Date(w.start_time)) / 60000) : null;
    return { id: w.id, title: w.title, date: w.start_time ? w.start_time.slice(0, 10) : null, durationMin, exercises };
  }).filter(s => s.exercises.length);
}

function applyStallDetection(sessions) {
  const occurrences = {};
  sessions.forEach(s => s.exercises.forEach(ex => {
    if (!occurrences[ex.title]) occurrences[ex.title] = [];
    occurrences[ex.title].push(ex);
  }));
  Object.values(occurrences).forEach(list => {
    let streak = 0;
    for (const ex of list) { if (ex.verdict === 'hold') streak++; else break; }
    if (streak >= 3) {
      list[0].stallStreak = streak;
      list[0].stallWarning = true;
      list[0].note = `${list[0].note} Stalled for ${streak} sessions — consider a deload or rep-range change.`;
    }
  });
  return sessions;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const apiKey = env.HEVY_API_KEY;
  if (!apiKey) return json(500, { error: 'HEVY_API_KEY not configured' });

  const url = new URL(request.url);
  let pageSize = parseInt(url.searchParams.get('pageSize'), 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = SESSION_COUNT;
  pageSize = Math.min(pageSize, 100);
  const force = url.searchParams.get('force') === '1';
  const cacheKey = `blob:hevy-sessions:${pageSize}`;

  if (!force) {
    try {
      const cached = await sbGet(env, cacheKey);
      if (cached && Date.now() - cached._cachedAt < CACHE_TTL_MS) return json(200, cached.data);
    } catch { /* ignore */ }
  }

  try {
    const workouts = await fetchRecentSessions(apiKey, pageSize);
    const sessions = applyStallDetection(analyzeSessions(workouts));
    const data = { sessions, fetchedAt: new Date().toISOString() };
    try { await sbSet(env, cacheKey, { data, _cachedAt: Date.now() }); } catch { /* best-effort */ }
    return json(200, data);
  } catch (err) {
    return json(502, { error: err.message });
  }
}
