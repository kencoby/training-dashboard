import { sbGet, sbSet } from './_supabase.js';

const API_BASE = 'https://api.hevyapp.com/v1';
const PAGE_SIZE = 10;
const CACHE_TTL_MS = 60 * 60 * 1000;
const TONNAGE_WEEKS = 12;
const STALE_DAYS = 14;
const E1RM_LIFTS = ['Bench Press (Barbell)', 'Squat (Barbell)', 'Deadlift (Barbell)'];
const E1RM_HISTORY_LIMIT = 20;

const EXERCISE_MUSCLES = {
  'bench press': ['chest'], 'chest press': ['chest'], 'fly': ['chest'], 'flye': ['chest'],
  'incline': ['chest', 'shoulders'],
  'overhead press': ['shoulders'], 'ohp': ['shoulders'], 'military press': ['shoulders'],
  'lateral raise': ['shoulders'], 'front raise': ['shoulders'],
  'face pull': ['shoulders', 'back'],
  'row': ['back', 'biceps'], 'pull-up': ['back', 'biceps'], 'pullup': ['back', 'biceps'], 'lat pulldown': ['back', 'biceps'],
  'deadlift': ['back', 'hamstrings', 'glutes'],
  'rdl': ['hamstrings', 'glutes'], 'romanian': ['hamstrings', 'glutes'],
  'squat': ['quads', 'glutes', 'hamstrings'],
  'leg press': ['quads', 'glutes'], 'lunge': ['quads', 'glutes'],
  'leg curl': ['hamstrings'], 'hamstring curl': ['hamstrings'],
  'leg extension': ['quads'],
  'hip thrust': ['glutes'], 'glute bridge': ['glutes'],
  'calf raise': ['calves'],
  'curl': ['biceps'], 'bicep': ['biceps'],
  'tricep': ['triceps'], 'pushdown': ['triceps'], 'skull crusher': ['triceps'], 'dip': ['triceps'],
  'plank': ['core'], 'crunch': ['core'], 'ab': ['core'], 'sit-up': ['core']
};
const MUSCLE_KEYS_BY_LENGTH = Object.keys(EXERCISE_MUSCLES).sort((a, b) => b.length - a.length);

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

function muscleKeysFor(title) {
  const lower = title.toLowerCase();
  const key = MUSCLE_KEYS_BY_LENGTH.find(k => lower.includes(k));
  return key ? EXERCISE_MUSCLES[key] : [];
}

function isoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((d - firstThursday) / (7 * 864e5));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

async function fetchAllWorkouts(apiKey) {
  const workouts = [];
  let page = 1, pageCount = 1;
  do {
    const res = await fetch(`${API_BASE}/workouts?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: { 'api-key': apiKey, accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`Hevy API error ${res.status}`);
    const data = await res.json();
    pageCount = data.page_count || 1;
    workouts.push(...(data.workouts || []));
    page++;
  } while (page <= pageCount);
  return workouts;
}

function computeE1rmSeries(workouts) {
  const series = {};
  E1RM_LIFTS.forEach(l => { series[l] = []; });
  workouts.forEach(w => {
    const dateStr = w.start_time ? w.start_time.slice(0, 10) : null;
    if (!dateStr) return;
    (w.exercises || []).forEach(ex => {
      if (!E1RM_LIFTS.includes(ex.title)) return;
      let bestE1rm = null;
      (ex.sets || []).forEach(s => {
        if (s.type === 'warmup') return;
        if (typeof s.weight_kg !== 'number' || typeof s.reps !== 'number') return;
        const e1rm = s.weight_kg * (1 + s.reps / 30);
        if (bestE1rm === null || e1rm > bestE1rm) bestE1rm = e1rm;
      });
      if (bestE1rm !== null) series[ex.title].push({ date: dateStr, e1rm: Math.round(bestE1rm * 10) / 10 });
    });
  });
  Object.keys(series).forEach(l => {
    series[l].sort((a, b) => a.date.localeCompare(b.date));
    if (series[l].length > E1RM_HISTORY_LIMIT) series[l] = series[l].slice(-E1RM_HISTORY_LIMIT);
  });
  return series;
}

function computeTonnageByWeek(workouts) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TONNAGE_WEEKS * 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const byWeek = {};
  workouts.forEach(w => {
    const dateStr = w.start_time ? w.start_time.slice(0, 10) : null;
    if (!dateStr || dateStr < cutoffStr) return;
    const weekKey = isoWeekKey(dateStr);
    (w.exercises || []).forEach(ex => {
      const muscles = muscleKeysFor(ex.title);
      if (!muscles.length) return;
      (ex.sets || []).forEach(s => {
        if (s.type === 'warmup') return;
        if (typeof s.weight_kg !== 'number' || typeof s.reps !== 'number') return;
        const volume = s.weight_kg * s.reps;
        if (!byWeek[weekKey]) byWeek[weekKey] = { weekKey, muscles: {} };
        muscles.forEach(m => { byWeek[weekKey].muscles[m] = (byWeek[weekKey].muscles[m] || 0) + volume; });
      });
    });
  });
  return Object.values(byWeek).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

function computeRepPRsAndLastTrained(workouts) {
  const byExercise = {};
  workouts.forEach(w => {
    const dateStr = w.start_time ? w.start_time.slice(0, 10) : null;
    if (!dateStr) return;
    (w.exercises || []).forEach(ex => {
      const workingSets = (ex.sets || []).filter(s => s.type !== 'warmup' && typeof s.weight_kg === 'number' && typeof s.reps === 'number');
      if (!workingSets.length) return;
      if (!byExercise[ex.title]) byExercise[ex.title] = { weightReps: {}, lastDate: dateStr, currentWeight: null, sessionCount: 0 };
      const entry = byExercise[ex.title];
      entry.sessionCount++;
      if (dateStr > entry.lastDate) entry.lastDate = dateStr;
      if (entry.currentWeight === null) entry.currentWeight = Math.max(...workingSets.map(s => s.weight_kg));
      workingSets.forEach(s => {
        const key = String(s.weight_kg);
        if (!entry.weightReps[key] || s.reps > entry.weightReps[key]) entry.weightReps[key] = s.reps;
      });
    });
  });
  const now = new Date();
  return Object.keys(byExercise)
    .filter(title => byExercise[title].sessionCount >= 2)
    .map(title => {
      const e = byExercise[title];
      const repPR = e.currentWeight !== null ? (e.weightReps[String(e.currentWeight)] || null) : null;
      const daysSince = Math.round((now - new Date(e.lastDate + 'T00:00:00Z')) / 864e5);
      return { title, currentWeight: e.currentWeight, repPR, lastDate: e.lastDate, daysSince, stale: daysSince > STALE_DAYS };
    })
    .sort((a, b) => b.daysSince - a.daysSince);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const apiKey = env.HEVY_API_KEY;
  if (!apiKey) return json(500, { error: 'HEVY_API_KEY not configured' });

  const force = new URL(request.url).searchParams.get('force') === '1';

  if (!force) {
    try {
      const cached = await sbGet(env, 'blob:hevy-progress');
      if (cached && Date.now() - cached._cachedAt < CACHE_TTL_MS) return json(200, cached.data);
    } catch { /* ignore */ }
  }

  try {
    const workouts = await fetchAllWorkouts(apiKey);
    const data = {
      e1rmSeries: computeE1rmSeries(workouts),
      tonnageByWeek: computeTonnageByWeek(workouts),
      exercises: computeRepPRsAndLastTrained(workouts),
      fetchedAt: new Date().toISOString()
    };
    try { await sbSet(env, 'blob:hevy-progress', { data, _cachedAt: Date.now() }); } catch { /* best-effort */ }
    return json(200, data);
  } catch (err) {
    return json(502, { error: err.message });
  }
}
