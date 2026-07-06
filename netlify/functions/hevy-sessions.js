const { getStore } = require('@netlify/blobs');

const API_BASE = 'https://api.hevyapp.com/v1';
const SESSION_COUNT = 8; // most recent N sessions, newest-first
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — session list changes whenever a workout is logged

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

function round25(n) {
  return Math.round(n / 2.5) * 2.5;
}

// Per-exercise progression heuristic:
// - if the lifter increased weight mid-session, they've already self-progressed —
//   recommend starting the next session at the heaviest weight used.
// - else (flat weight across sets), look at the rep trend: if reps held steady or
//   rose, the weight was too light — recommend a bump. If reps declined under
//   fatigue, the weight is well-calibrated — hold and chase reps before adding load.
function analyzeExercise(sets) {
  if (!sets.length) return { verdict: 'no-data', nextWeight: null, note: 'No working sets logged.' };

  const weights = sets.map(s => s.weight_kg).filter(w => typeof w === 'number');
  if (!weights.length) {
    return { verdict: 'no-data', nextWeight: null, note: 'No weight logged for this exercise (bodyweight or time-based).' };
  }

  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);

  if (maxW > minW) {
    return {
      verdict: 'progressed',
      nextWeight: maxW,
      note: `Increased ${minW}kg → ${maxW}kg mid-session — start next time at ${maxW}kg across all sets.`
    };
  }

  const reps = sets.map(s => s.reps).filter(r => typeof r === 'number');
  if (!reps.length) {
    return { verdict: 'hold', nextWeight: maxW, note: `Held ${maxW}kg — no rep data to judge a change.` };
  }

  const declined = reps.some((r, i) => i > 0 && r < reps[i - 1]);
  const first = reps[0];
  const last = reps[reps.length - 1];

  if (!declined && last >= first) {
    const inc = maxW >= 10 ? 2.5 : 1.25;
    const next = round25(maxW + inc);
    return {
      verdict: 'increase',
      nextWeight: next,
      note: `Reps held steady at ${maxW}kg (${reps.join('/')}) — bump to ${next}kg next session.`
    };
  }

  return {
    verdict: 'hold',
    nextWeight: maxW,
    note: `Reps dropped across sets at ${maxW}kg (${reps.join('/')}) — weight's calibrated. Hold and chase more reps first.`
  };
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
  return workouts
    .map(w => {
      const exercises = (w.exercises || [])
        .map(ex => {
          const workingSets = (ex.sets || []).filter(s => s.type !== 'warmup' && typeof s.weight_kg === 'number');
          if (!workingSets.length) return null;
          const analysis = analyzeExercise(workingSets);
          return {
            title: ex.title,
            sets: workingSets.map(s => ({ weight: s.weight_kg, reps: s.reps })),
            ...analysis
          };
        })
        .filter(Boolean);

      const durationMin = (w.start_time && w.end_time)
        ? Math.round((new Date(w.end_time) - new Date(w.start_time)) / 60000)
        : null;

      return {
        id: w.id,
        title: w.title,
        date: w.start_time ? w.start_time.slice(0, 10) : null,
        durationMin,
        exercises
      };
    })
    .filter(s => s.exercises.length);
}

// Walks each exercise's occurrences across the returned sessions (newest-first)
// and flags a stall when the most recent run of consecutive sessions all came
// back "hold" — i.e. the lift hasn't moved in 3+ sessions despite being
// appropriately loaded each time. Annotates the most recent occurrence only,
// since that's the one surfaced at the top of the Session Analysis list.
function applyStallDetection(sessions) {
  const occurrences = {}; // title -> exercise objects, newest-first
  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      if (!occurrences[ex.title]) occurrences[ex.title] = [];
      occurrences[ex.title].push(ex);
    });
  });

  Object.values(occurrences).forEach(list => {
    let streak = 0;
    for (const ex of list) {
      if (ex.verdict === 'hold') streak++;
      else break;
    }
    if (streak >= 3) {
      const mostRecent = list[0];
      mostRecent.stallStreak = streak;
      mostRecent.stallWarning = true;
      mostRecent.note = `${mostRecent.note} Stalled for ${streak} sessions in a row — consider a deload (10-20% off for a week) or a rep-range change.`;
    }
  });

  return sessions;
}

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) return json(500, { error: 'HEVY_API_KEY not configured' });

  // pageSize lets callers ask for a wider history window than the default 8 —
  // e.g. the Planner's training-load calc requests ~90 days' worth of sessions
  // to feed the CTL/ATL model. Cache key includes the size so the small
  // "recent sessions" fetch (Session Analysis card) and the large historical
  // fetch (Planner) don't stomp on each other.
  const qp = event.queryStringParameters || {};
  let pageSize = parseInt(qp.pageSize, 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = SESSION_COUNT;
  pageSize = Math.min(pageSize, 100);

  const store = blobStore('hevy-sessions');
  const force = qp.force === '1';
  const cacheKey = `sessions_${pageSize}`;

  if (!force) {
    try {
      const cached = await store.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed._cachedAt < CACHE_TTL_MS) return json(200, parsed.data);
      }
    } catch {
      // ignore cache errors, fall through to live fetch
    }
  }

  try {
    const workouts = await fetchRecentSessions(apiKey, pageSize);
    const sessions = applyStallDetection(analyzeSessions(workouts));
    const data = { sessions, fetchedAt: new Date().toISOString() };
    try {
      await store.set(cacheKey, JSON.stringify({ data, _cachedAt: Date.now() }));
    } catch {
      // caching is best-effort
    }
    return json(200, data);
  } catch (err) {
    return json(502, { error: err.message });
  }
};
