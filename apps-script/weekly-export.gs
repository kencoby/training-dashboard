/**
 * Life Dashboard → Google Sheets weekly export
 * ============================================
 * Runs in Google Apps Script, bound to a Google Sheet in your Drive. Once a
 * week it calls the dashboard's /api/export endpoint and APPENDS anything new
 * to two tabs. Nothing already in the sheet is changed or deleted.
 *
 *   Health     date | metric | value | units | exported_at
 *              One row per metric per day. Only days at least 2 days old are
 *              written (today and yesterday can still be filling in), and a
 *              day/metric pair already in the sheet is never written again.
 *              The dashboard only keeps 90 days of Apple Health data, so this
 *              tab becomes the long-term history.
 *
 *   Dashboard  exported_at | key | item_date | item | id
 *              Habits, mood, tasks, notes, logs etc. Lists and date-keyed
 *              records are split into one row per item; anything else is one
 *              row for the whole value. A row is only added when that exact
 *              item hasn't been exported before, so an edited item shows up
 *              again as a new row (its new version) and unchanged items don't.
 *
 * Setup (once)
 *   1. In Cloudflare Pages → training-dashboard → Settings → Variables and
 *      secrets, add EXPORT_SECRET (any long random string), then redeploy.
 *   2. Create a Google Sheet, then Extensions → Apps Script. Replace the
 *      contents of Code.gs with this file and save.
 *   3. Project Settings (cog) → Script properties → add EXPORT_SECRET with
 *      the same value as step 1.
 *   4. Back in the editor, pick `setup` in the function menu and click Run.
 *      Approve the permissions prompt. That runs a first export and installs
 *      the weekly trigger (Sundays around 21:00 UK time).
 *
 * Run `runExport` any time for an export now. Each run is logged on the
 * "Export log" tab.
 */

const DASHBOARD_URL = 'https://training-dashboard-5qr.pages.dev';
const SETTLE_DAYS = 2;          // skip today + yesterday for Health rows
const CELL_LIMIT = 49000;       // Sheets caps a cell at 50,000 characters
const TZ = 'Europe/London';

function setup() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runExport')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runExport').timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(21).inTimezone(TZ).create();
  runExport();
}

function runExport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = sheet_(ss, 'Export log', ['run_at', 'status', 'health_rows', 'dashboard_rows', 'note']);
  const runAt = new Date();
  try {
    const data = fetchExport_();
    const h = appendHealth_(ss, data.health || {}, data.exportedAt);
    const d = appendDashboard_(ss, data.dashboard || {}, data.exportedAt);
    log.appendRow([runAt, 'ok', h, d.rows, d.truncated ? d.truncated + ' item(s) over 49k characters were truncated' : '']);
  } catch (e) {
    log.appendRow([runAt, 'error', '', '', String(e && e.message || e)]);
    throw e; // so Apps Script emails you about the failed run
  }
}

function fetchExport_() {
  const secret = PropertiesService.getScriptProperties().getProperty('EXPORT_SECRET');
  if (!secret) throw new Error('Script property EXPORT_SECRET is not set (Project Settings → Script properties).');
  const res = UrlFetchApp.fetch(DASHBOARD_URL + '/api/export', {
    headers: { 'x-export-secret': secret }, muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code !== 200) throw new Error('Export endpoint returned ' + code + ': ' + res.getContentText().slice(0, 300));
  return JSON.parse(res.getContentText());
}

// ── Health ────────────────────────────────────────────────────────────────
function appendHealth_(ss, health, exportedAt) {
  const sh = sheet_(ss, 'Health', ['date', 'metric', 'value', 'units', 'exported_at']);
  const seen = new Set();
  const last = sh.getLastRow();
  if (last > 1) {
    sh.getRange(2, 1, last - 1, 2).getDisplayValues().forEach(r => seen.add(r[0] + '|' + r[1]));
  }
  const cutoff = Utilities.formatDate(new Date(Date.now() - SETTLE_DAYS * 864e5), TZ, 'yyyy-MM-dd');
  const rows = [];
  Object.keys(health).sort().forEach(metric => {
    const m = health[metric];
    Object.keys(m.byDate || {}).sort().forEach(date => {
      if (date > cutoff || seen.has(date + '|' + metric)) return;
      rows.push([date, metric, m.byDate[date], m.units || '', exportedAt]);
    });
  });
  rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1);
  write_(sh, rows, [1]);
  return rows.length;
}

// ── Dashboard data ────────────────────────────────────────────────────────
function appendDashboard_(ss, dashboard, exportedAt) {
  const sh = sheet_(ss, 'Dashboard', ['exported_at', 'key', 'item_date', 'item', 'id']);
  const seen = new Set();
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 5, last - 1, 1).getDisplayValues().forEach(r => seen.add(r[0]));
  const rows = [];
  let truncated = 0;
  Object.keys(dashboard).sort().forEach(key => {
    itemsOf_(dashboard[key]).forEach(it => {
      let text = typeof it.value === 'string' ? it.value : JSON.stringify(it.value);
      if (text === undefined) text = '';
      const id = hash_(key + '\u0000' + (it.date || '') + '\u0000' + text);
      if (seen.has(id)) return;
      seen.add(id);
      if (text.length > CELL_LIMIT) { text = text.slice(0, CELL_LIMIT) + ' …[truncated]'; truncated++; }
      rows.push([exportedAt, key, it.date || '', text, id]);
    });
  });
  write_(sh, rows, [3, 5]);
  return { rows: rows.length, truncated };
}

// Arrays → one item per element; objects keyed by dates → one item per
// date; anything else → a single item for the whole value.
function itemsOf_(v) {
  const isDate = s => /^\d{4}-\d{2}-\d{2}/.test(s);
  if (Array.isArray(v)) {
    return v.map(el => ({ date: dateOf_(el), value: el }));
  }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length && keys.every(isDate)) return keys.sort().map(k => ({ date: k.slice(0, 10), value: v[k] }));
  }
  return [{ date: '', value: v }];
}

function dateOf_(el) {
  if (!el || typeof el !== 'object') return '';
  for (const f of ['date', 'day', 'd', 'createdAt', 'created', 'ts', 'timestamp']) {
    const x = el[f];
    if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x)) return x.slice(0, 10);
    if (typeof x === 'number' && x > 1e12) return Utilities.formatDate(new Date(x), TZ, 'yyyy-MM-dd');
  }
  return '';
}

// ── helpers ───────────────────────────────────────────────────────────────
function sheet_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

// textCols (1-based): written as plain text so Sheets doesn't turn dates and
// ids into its own date/number values; the rest keep normal formatting.
function write_(sh, rows, textCols) {
  if (!rows.length) return;
  const start = sh.getLastRow() + 1;
  (textCols || []).forEach(c => sh.getRange(start, c, rows.length, 1).setNumberFormat('@'));
  sh.getRange(start, 1, rows.length, rows[0].length).setValues(rows);
}

function hash_(s) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.slice(0, 12).map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}
