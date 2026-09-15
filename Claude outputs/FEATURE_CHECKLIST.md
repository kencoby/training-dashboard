# Life Dashboard — Feature Checklist

Everything currently built, tab by tab, plus some new ideas at the bottom. Mark each line `[x]` to keep or `[ ]`/strike it to cut — or just reply in chat with the ones you want gone/added, whichever's easier.

## Home
- [ ] Daily briefing card — weather, ±day navigation, readiness chip
- [ ] Quick-log bar (+1 Q / +10 Qs revision-question shortcuts)
- [ ] Revision status line
- [ ] Finance snapshot line
- [ ] "Currently on placement" chip
- [ ] Critical Tasks list (inline add, right column)
- [ ] Habits Today stat card
- [ ] Daily task list (resets midnight)
- [ ] System alerts banner (sync failures, overdue tasks, stale calendar)
- [ ] Cross-domain Insight card (auto-correlates sleep/training vs revision completion when the gap is big enough to matter)
- [ ] Upcoming assessment countdown banner (fires within 21 days of a Year 4 exam/deadline)
- [ ] Goal/target event tracker (🎯 icon — set a race or event with a date)

## Health
- [ ] Recovery ring + score, Contributors, Coach text
- [ ] HRV Trend (14 days)
- [ ] Recovery Trend (30 days)
- [ ] Sleep Performance ring, Sleep Stages breakdown, Sleep Coach
- [ ] Sleep Trend (30 days)
- [ ] Sleep → Next-Day HRV Correlation
- [ ] Day Strain ring, Breakdown, Strain Coach, Workouts Today
- [ ] Strain Trend (30 days)
- [ ] Monitor: weekly summary, Health Monitor, Weight Trend (60d), Training Load, RHR/HRV 7-day rolling, Biomarkers
- [ ] Fitness: Cardio Focus (30d), Personal Records, Load Forecast, VO₂ Max Trend

## Training
- [ ] Training calendar (weekly view)
- [ ] Activity Time chart (time / sessions-per-week toggle)
- [ ] Streaks (current + longest)
- [ ] Load by Sport — ACWR per discipline (run/ride/swim)
- [ ] Heart Rate Zones — last 28 days
- [ ] Monthly Distance Goal, YTD Distance, Longest Run/Ride '26
- [ ] 8-Week Volume, ACWR Gauge
- [ ] This Week's Activities list, Easy/Hard Distribution
- [ ] Strength: distance/session, sessions this month, muscle coverage, weekly sessions, recent sessions, Strength PBs, session analysis, est. 1RM trend, weekly volume by muscle group, rep PRs
- [ ] Running: consistency, distance trend, recent runs, sleep→performance link, personal bests, run PBs
- [ ] Cycling: distance per session, PBs
- [ ] Swimming: distance per session, PBs
- [ ] Other activities log
- [ ] Injury & Niggle log
- [ ] Shoe mileage tracker
- [ ] Race results log

## Medicine
- [ ] Study Streak tracker
- [ ] Daily Questions counter + streak
- [ ] Pomodoro timer
- [ ] Topic Tracker (flag weak topics)
- [ ] Signoffs — MLA/AKT exam, OSCE/CPSA, Mini-CEX, PSA, Elective report, Skills log, Out-of-hours requirements, SSA (clinician assessment / DOPS / My Practice), mandatory training, Clinical Skills signoff
- [ ] Signoffs — JA1/JA2/JA3 per-placement checklists (Haematology, T&O, Cardiff GP)
- [ ] Assessment Info reference cards (PM-367C / 368C / 369C module requirements)
- [ ] Calculators — Wells Score, CURB-65, CHA₂DS₂-VASc, Glasgow Coma Scale, NEWS2, Ottawa Ankle & Foot Rules

## Finance
- [ ] Overview tiles — income / expenses / net / savings rate
- [ ] Total Bank Balance, Overdraft Goal progress
- [ ] Income vs Expenses chart, Expense Breakdown chart
- [ ] Income & Expenses — manual log + history
- [ ] Investments — log portfolio value, current value, all-time gain, entries logged
- [ ] Statements — upload bank statement (PDF/CSV import)
- [ ] Statements — spending breakdown, actual income vs expenses, budget vs actual, net worth/account balances, transactions list (all derived from uploaded statements)

## Tasks
- [ ] 4-tier priority board — Critical / On Deck / Someday / Dashboard Ideas, each with inline add + count badge
- [ ] Clear completed tasks
- [ ] Due-date alerts toggle

## Shopping
- [ ] Groceries list
- [ ] Buy Now list
- [ ] Soon list
- [ ] Wishlist
- [ ] Clear bought items

## Calendar
- [ ] Today's snapshot, synced hourly from Google Calendar (no sign-in needed)

## Notes
- [ ] Quick note capture + label chips (General / Idea / To-do / Med / Training)
- [ ] Filter by label / pinned / search
- [ ] Session Notes Search (search past training-session notes)

## Habits
- [ ] Daily score chart (last 30 days)
- [ ] Per-habit heatmap, grouped — Tracked automatically / Study / Wellness / Personal care / Home
- [ ] Reset history control
- [ ] Streak tracking per habit

## Year 4
- [ ] Placement/exam calendar with color-coded legend (placement, transition, exam, reading week, vacation, elective/SDL, SSA, travel, race)
- [ ] Year 3 deadline alert

## Reading
- [ ] RSVP speed-reader — upload EPUB/PDF/TXT
- [ ] Word-flash display with Spritz-style pivot-letter highlighting, speed slider, play/pause, chapter nav
- [ ] Voice read-along (synced to the flashing word)
- [ ] Library view — progress %, delete

## Cross-cutting / global
- [ ] Dark mode toggle (🌙)
- [ ] Export data menu (📤)
- [ ] Global quick-capture — floating ✎ button on every tab, saves straight to Notes
- [ ] Mobile bottom nav + "More" sheet
- [ ] Installable PWA / offline support
- [ ] Cross-device sync (most data; Reading library and voice settings are device-only — flagged before as too large to sync)
- [ ] Strava integration — currently broken, needs your call (see below)
- [ ] Google Calendar sync — currently pending your approval of the scheduled task running on your own device instead of the cloud sandbox
- [ ] Apple Health data sync

---

## Open items needing a decision (not a keep/cut, just unresolved)
- **Strava**: 403 Forbidden — Strava now requires a paid Strava subscription on the account that owns the API app. Subscribe + reactivate, or I make the failure quieter?
- **Google Calendar sync**: still needs you to approve the scheduled task running on your computer instead of the cloud sandbox (which can't reach the site).

## New feature ideas (not built yet — tick any you want)
- [ ] Triathlon race countdown on Home (days-to-race banner, similar to the assessment countdown, using the goal/target event you can already set)
- [ ] CT Surgery ST1 application tracker — a checklist of portfolio evidence needed across the scoring domains, similar in shape to the Medicine Signoffs accordions
- [ ] Weekly digest — one auto-generated summary each Sunday (training load, revision adherence, spend vs budget, habit completion) instead of having to check every tab
- [ ] Body-weight / composition trend on Health tab, alongside the existing Weight Trend, with a simple goal line
- [ ] Sleep-debt tracker — rolling deficit vs a target sleep duration, surfaced as a system alert when it builds up
- [ ] Exam-day countdown widget for each Year 4 assessment, shown as its own card rather than only a 21-day pre-alert
- [ ] "On this day last year" — resurfaces a training PB, a note, or a habit streak from 12 months ago, for a bit of motivation
- [ ] Budget alerts — a system-alert entry when a spending category is tracking to exceed its monthly budget, not just after the fact
