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

const KEEP_DAYS = 90;

// Health Auto Export sends dates like "2026-06-16 07:00:00 +0100" — take the date part.
function dateOnly(d) {
  return (d || '').slice(0, 10);
}

// These metrics are cumulative/incremental — each data point is a slice of the day's
// total (e.g. a few kJ of active energy burned in that interval), not a standalone
// reading. They must be SUMMED per day, not overwritten by the last sample. Every
// export call is treated as carrying the full day-so-far, so the payload's sum
// replaces (not adds to) the previously stored total for that date — this avoids
// double-counting on repeated syncs within the same day.
const SUM_METRICS = new Set([
  'active_energy', 'basal_energy_burned', 'step_count', 'flights_climbed',
  'cycling_distance', 'walking_running_distance', 'apple_exercise_time',
  'apple_stand_time', 'apple_stand_hour', 'time_in_daylight'
]);

// Pull a usable numeric value out of a Health Auto Export data point. Different
// metrics use different field names — qty is most common, totalSleep/asleep for
// sleep_analysis (totalSleep is reliable, asleep is often reported as 0), Avg for
// some aggregate heart-rate exports.
function pointValue(point) {
  if (point.qty !== undefined) return point.qty;
  if (point.totalSleep !== undefined) return point.totalSleep;
  if (point.Avg !== undefined) return point.Avg;
  if (point.avg !== undefined) return point.avg;
  if (point.asleep !== undefined) return point.asleep;
  if (point.value !== undefined) return point.value;
  return undefined;
}

// POST receiver for the Health Auto Export app's "REST API Automation".
// Point the automation at: https://<your-site>/api/health-intake
// Expected body shape: { data: { metrics: [ { name, units, data: [ { date, qty|asleep|... } ] } ] } }
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // Optional shared-secret check. Set HEALTH_SECRET in Netlify env vars + the
  // automation's custom header to enable. If unset, no auth is enforced.
  const secret = process.env.HEALTH_SECRET;
  if (secret && event.headers['x-health-secret'] !== secret) {
    return json(401, { error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const metrics = (payload && payload.data && payload.data.metrics) || [];
  if (!Array.isArray(metrics) || !metrics.length) {
    return json(400, { error: 'No metrics found in payload (expected data.metrics[])' });
  }

  const store = blobStore('health-data');
  let existing;
  try {
    const raw = await store.get('latest');
    existing = raw ? JSON.parse(raw) : {};
  } catch {
    existing = {};
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const metric of metrics) {
    const name = metric && metric.name;
    if (!name) continue;
    const prior = existing[name] || {};
    const byDate = prior.byDate || {};

    if (SUM_METRICS.has(name)) {
      // Group this payload's points by day and sum them, then replace whatever
      // was stored for that date (the payload represents the full day-so-far).
      const sums = {};
      const lastRaw = {};
      for (const point of (metric.data || [])) {
        const date = dateOnly(point.date);
        if (!date) continue;
        const value = pointValue(point);
        if (value === undefined) continue;
        sums[date] = (sums[date] || 0) + value;
        lastRaw[date] = point;
      }
      for (const date of Object.keys(sums)) {
        byDate[date] = { value: sums[date], raw: lastRaw[date] };
      }
    } else {
      // Instantaneous/point-in-time metrics: keep the latest sample for the day.
      for (const point of (metric.data || [])) {
        const date = dateOnly(point.date);
        if (!date) continue;
        const value = pointValue(point);
        if (value === undefined) continue;
        byDate[date] = { value, raw: point };
      }
    }

    // Trim anything older than the retention window.
    for (const d of Object.keys(byDate)) {
      if (d < cutoffStr) delete byDate[d];
    }

    existing[name] = { units: metric.units || prior.units || null, byDate };
  }

  existing._updatedAt = Date.now();

  try {
    await store.set('latest', JSON.stringify(existing));
  } catch (err) {
    return json(500, { error: err.message });
  }

  return json(200, { ok: true, metricsReceived: metrics.map(m => m.name) });
};
