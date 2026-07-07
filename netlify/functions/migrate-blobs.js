/**
 * One-shot migration helper: copies all SYNC_KEYS + extras from the old
 * Netlify site's /api/sync endpoint into this (new) site's Blobs store.
 *
 * GET /.netlify/functions/migrate-blobs
 *   -> { migrated: [...], skipped: [...], errors: [...] }
 *
 * Safe to call multiple times — only overwrites if old site has newer _ts.
 */

const { getStore } = require('@netlify/blobs');

const OLD_BASE = 'https://training-dashboard-philipc.netlify.app';

const KEYS = [
  'todo_items',
  'signoff_mandatory', 'signoff_minicex', 'signoff_sa67', 'signoff_sa8', 'signoff_clinical',
  'ukmla_progress',
  'gcal_events',
  'calendar_overrides',
  'activity_notes', 'daily_habits', 'progress_log', 'monthly_km_goal', 'pb_log',
  'ecg_quiz_log', 'finance_data', 'nutr_food_log', 'nutr_meal_plan', 'nutr_grocery', 'nutr_pantry',
  'study_activity_log', 'finance_transactions', 'finance_accounts',
  'rev_schedule_log', 'rev_passmed_done', 'tasks_priority',
  'shopping_items',
  'weekly_plan', 'tri_plan',
  'planner_zones', 'planner_events', 'planner_atp'
];

function blobStore(name) {
  const siteID = process.env.BLOBS_SITE_ID;
  const token  = process.env.BLOBS_TOKEN;
  return siteID && token ? getStore({ name, siteID, token }) : getStore(name);
}

exports.handler = async () => {
  const store = blobStore('dashboard-sync');
  const migrated = [], skipped = [], errors = [];

  await Promise.all(KEYS.map(async key => {
    try {
      // 1. Fetch from old site
      const res = await fetch(`${OLD_BASE}/api/sync?key=${encodeURIComponent(key)}`);
      if (!res.ok) { skipped.push(key + ':http' + res.status); return; }
      const remote = await res.json();
      if (!remote || remote._ts === undefined) { skipped.push(key + ':empty'); return; }

      // 2. Check if new site already has a newer copy
      try {
        const existing = await store.get(key);
        if (existing) {
          const parsed = JSON.parse(existing);
          if (parsed._ts >= remote._ts) { skipped.push(key + ':already-newer'); return; }
        }
      } catch { /* no existing entry — proceed */ }

      // 3. Write to new site blobs
      await store.set(key, JSON.stringify(remote));
      migrated.push(key);
    } catch (err) {
      errors.push(key + ':' + err.message);
    }
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ migrated, skipped, errors })
  };
};
