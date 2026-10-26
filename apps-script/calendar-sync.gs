/**
 * Life Dashboard ← Google Calendar sync
 * =====================================
 * Sends your calendar events (all calendars you can see: personal, HCA bank
 * shifts, Uni, etc.) for the past 7 days and next 6 weeks to the dashboard,
 * every hour. The dashboard uses them for the study-time estimate and the
 * training/shift clash checker. Nothing in your calendars is changed.
 *
 * Setup (once)
 *   1. Go to script.google.com → New project. Replace Code.gs with this file.
 *   2. (Optional but recommended) In Cloudflare Pages → training-dashboard →
 *      Settings → Variables and secrets, add GCAL_SECRET (any long random
 *      string) and redeploy. Then here: Project Settings (cog) → Script
 *      properties → add GCAL_SECRET with the same value.
 *   3. Pick `setup` in the function menu and click Run. Approve the
 *      permissions prompt (read-only calendar access + calling the dashboard).
 *      That sends your events now and installs an hourly trigger.
 *
 * Run `syncCalendars` any time to send events straight away.
 *
 * "Sync now" button on the dashboard's Calendar page (optional)
 *   4. Deploy → New deployment → type "Web app". Execute as: Me, Who has
 *      access: Anyone. Deploy and copy the Web app URL (ends in /exec).
 *   5. In Cloudflare Pages → training-dashboard → Settings → Variables and
 *      secrets, add GCAL_SCRIPT_URL with that URL, then redeploy.
 *   The button calls the dashboard, which calls this URL server-side, so the
 *   URL never reaches the browser. All it can do is run the same sync as the
 *   hourly trigger (no calendar data is returned), at most once every 20 s.
 *   After editing this file later: Deploy → Manage deployments → edit →
 *   New version, so the URL stays the same.
 */
const DASHBOARD_URL = 'https://training-dashboard-5qr.pages.dev';
const TZ = 'Europe/London';
const DAYS_BACK = 7;
const DAYS_AHEAD = 42;

function setup() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'syncCalendars')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncCalendars').timeBased().everyHours(1).create();
  syncCalendars();
}

// Called by the dashboard's "Sync now" button (via /api/gcal-sync).
function doPost() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out_({ ok: false, error: 'A sync is already running, try again in a moment' });
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get('manual-sync')) return out_({ ok: false, error: 'Synced a few seconds ago, try again shortly' });
    cache.put('manual-sync', '1', 20);
    return out_(syncCalendars());
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function syncCalendars() {
  const now = new Date();
  const from = new Date(now.getTime() - DAYS_BACK * 864e5);
  const to = new Date(now.getTime() + DAYS_AHEAD * 864e5);
  const fmt = (d, p) => Utilities.formatDate(d, TZ, p);
  const events = [];
  CalendarApp.getAllCalendars().forEach(cal => {
    if (cal.isHidden()) return;
    cal.getEvents(from, to).forEach(ev => {
      const s = ev.getStartTime(), e = ev.getEndTime();
      events.push({
        calendar: cal.getName(),
        title: ev.getTitle(),
        description: (ev.getDescription() || '').slice(0, 300),
        allDay: ev.isAllDayEvent(),
        date: fmt(s, 'yyyy-MM-dd'),
        start: ev.isAllDayEvent() ? null : fmt(s, 'HH:mm'),
        endDate: fmt(e, 'yyyy-MM-dd'),
        end: ev.isAllDayEvent() ? null : fmt(e, 'HH:mm'),
      });
    });
  });
  const secret = PropertiesService.getScriptProperties().getProperty('GCAL_SECRET') || '';
  const res = UrlFetchApp.fetch(DASHBOARD_URL + '/api/gcal-intake', {
    method: 'post',
    contentType: 'application/json',
    headers: secret ? { 'x-gcal-secret': secret } : {},
    payload: JSON.stringify({ date: fmt(now, 'yyyy-MM-dd'), timezone: TZ, events: events }),
    muteHttpExceptions: true,
  });
  const status = res.getResponseCode();
  Logger.log('Sent ' + events.length + ' events → ' + status + ' ' + res.getContentText().slice(0, 200));
  return status === 200
    ? { ok: true, events: events.length }
    : { ok: false, events: events.length, error: 'Dashboard rejected the update (' + status + '): ' + res.getContentText().slice(0, 200) };
}
