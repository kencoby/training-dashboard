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
  Logger.log('Sent ' + events.length + ' events → ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
}
