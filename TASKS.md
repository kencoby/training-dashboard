# Training Dashboard — Task History

All 115 tasks completed across the full build. Now on Cloudflare Pages (https://training-dashboard-5qr.pages.dev/) with Supabase as the sync/storage backend — Netlify retired.

| # | Status | Task |
|---|--------|------|
| 1 | ✅ | Create missing netlify/functions/sync.js |
| 2 | ✅ | Install @netlify/blobs into node_modules |
| 3 | ✅ | Create netlify/functions/health-intake.js |
| 4 | ✅ | Create netlify/functions/health-data.js |
| 5 | ✅ | Add Health overview card to index.html |
| 6 | ✅ | Verify no hardcoded old-domain references in code |
| 7 | ✅ | Set BLOBS_SITE_ID / BLOBS_TOKEN on new Netlify site |
| 8 | ✅ | Set STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET on new Netlify site |
| 9 | ✅ | Update Strava Authorization Callback Domain |
| 10 | ✅ | Trigger redeploy and verify endpoints |
| 11 | ✅ | Fix health-intake.js data ingestion bugs |
| 12 | ✅ | Add Whoop tab nav + sub-tab HTML skeleton |
| 13 | ✅ | Add WHOOP-style CSS (dark cards, score rings, stage bars) |
| 14 | ✅ | Implement Recovery/Sleep/Strain calc + render JS |
| 15 | ✅ | Verify changes and redeploy |
| 16 | ✅ | Add Sleep Coach + Sleep Debt + consistency tracking |
| 17 | ✅ | Add Recovery/Strain Coach guidance card |
| 18 | ✅ | Add Health Monitor sub-tab (VO2 max, resp rate, SpO2, skin temp) |
| 19 | ✅ | Add weight trend chart to Whoop Monitor tab |
| 20 | ✅ | Split Training Calendar card, add activity time/sessions chart |
| 21 | ✅ | Add daily ECG quiz to Medicine tab |
| 22 | ✅ | Wire syncPush into all unsynced save functions |
| 23 | ✅ | Extend SYNC_KEYS with newly-wired keys |
| 24 | ✅ | Extend pull-on-load IIFE to re-render newly-synced keys |
| 25 | ✅ | Add visibilitychange re-sync handler |
| 26 | ✅ | Clarify Whoop score freshness labels |
| 27 | ✅ | Verify edits and ask permission to redeploy |
| 28 | ✅ | Build Recovery/Sleep/Strain trend charts |
| 29 | ✅ | Build weekly health/fitness rollup card |
| 30 | ✅ | Build overtraining / readiness alerts |
| 31 | ✅ | Build CTL/ATL fitness-fatigue trend model |
| 32 | ✅ | Re-authenticate Netlify CLI and deploy |
| 33 | ✅ | Embed Hevy strength log data + compute PB logic |
| 34 | ✅ | Build Strength PBs + 500kg Club HTML/CSS |
| 35 | ✅ | Wire render function + verify output |
| 36 | ✅ | Probe live Hevy API response shape |
| 37 | ✅ | Write Netlify function for live Hevy PB sync |
| 38 | ✅ | Wire client fetch + fallback to static embed |
| 39 | ✅ | Set HEVY_API_KEY Netlify env var + redeploy |
| 40 | ✅ | Build hevy-sessions.js Netlify function |
| 41 | ✅ | Add Session Analysis HTML section to train-strength subtab |
| 42 | ✅ | Add loadSessionAnalysis/renderSessionAnalysis JS |
| 43 | ✅ | Wire into main() and pendingCharts |
| 44 | ✅ | Verify and deploy |
| 45 | ✅ | Build hevy-progress.js (1RM trend, tonnage, rep PRs, last-trained) |
| 46 | ✅ | Add plateau/stall detection to hevy-sessions.js |
| 47 | ✅ | Add HTML cards for 1RM trend / tonnage / rep PRs |
| 48 | ✅ | Add client JS: loadProgress + 3 render functions |
| 49 | ✅ | Wire into main()/pendingCharts and verify |
| 50 | ✅ | Race countdown + pace check |
| 51 | ✅ | Daily briefing card |
| 52 | ✅ | Sleep to performance link |
| 53 | ✅ | Study streak tracker |
| 54 | ✅ | Verify and deploy |
| 55 | ✅ | Run PBs / Sub-19 5km Club (auto from Strava) |
| 56 | ✅ | Fix fetchActivities year-cutoff bug |
| 57 | ✅ | Session Analysis: collapsible accordion + 7-day filter |
| 58 | ✅ | Calorie target: source from Apple Health |
| 60 | ✅ | Switch Google Calendar feature from OAuth to scheduled Claude sync |
| 61 | ✅ | Build planner-data.js Netlify function (CRUD + zones) |
| 62 | ✅ | Add durationMin to hevy-sessions.js |
| 63 | ✅ | Per-sport TSS calc functions (client JS) |
| 64 | ✅ | Planner tab: Zones settings sub-tab |
| 65 | ✅ | Planner tab: weekly Calendar sub-tab |
| 66 | ✅ | Planner tab: Annual Training Plan sub-tab |
| 67 | ✅ | Wire Planner into main(), verify, deploy |
| 68 | ✅ | Diagnose whole-dashboard breakage after Planner changes |
| 69 | ✅ | Fix gcal-to-dashboard scheduled task (domain + payload shape) |
| 70 | ✅ | Rewrite gcal-dashboard-sync scheduled task with correct endpoint |
| 71 | ✅ | Report findings to user |
| 72 | ✅ | Add max_hr to normalizeActivity |
| 73 | ✅ | Add hrBadge helper + fix notesHtml event bubbling |
| 74 | ✅ | Add activity insight modal HTML/CSS |
| 75 | ✅ | Implement openActivityInsight/generateActivityInsight JS |
| 76 | ✅ | Wire HR badge + click-for-insight into all 6 activity row templates |
| 77 | ✅ | Verify edits and ask user to redeploy |
| 78 | ✅ | Update modal render for insight+advice split |
| 79 | ✅ | Add in-modal notes field |
| 80 | ✅ | Refactor saveNote into shared helper |
| 81 | ✅ | Add metric explanations to Whoop page |
| 82 | ✅ | Verify all edits and ask user to redeploy |
| 83 | ✅ | Determine Max/Threshold HR from Apple Health + Strava |
| 84 | ✅ | Save confirmed Planner Zones values |
| 85 | ✅ | Redeploy dashboard so today's changes go live |
| 86 | ✅ | Verify Google Calendar sync fix is live |
| 87 | ✅ | Set ANTHROPIC_API_KEY on Cloudflare + redeploy |
| 88 | ✅ | Add hit/miss graph for daily revision targets |
| 89 | ✅ | Allow retrospective revision logging |
| 90 | ✅ | Remove activity cap on Training Calendar days |
| 91 | ✅ | Make preset Rest days editable |
| 92 | ✅ | Investigate Current Streak showing 0 bug |
| 93 | ✅ | Make ACWR info tooltips reference real numbers |
| 94 | ✅ | Remove brick sessions feature |
| 95 | ✅ | Migrate Weekly Plan + Triathlon Plan to scheduled-task generation |
| 96 | ✅ | Report warm-up set filtering status to Phil |
| 97 | ✅ | Add Finance tab with bank statement upload |
| 98 | ✅ | Remove nutrition barcode scanner |
| 99 | ✅ | Sync nutrition data from Apple Health |
| 100 | ✅ | Build comprehensive daily overview card |
| 101 | ✅ | Add emoji icons to tab bar |
| 102 | ✅ | Fix Tasks dashboard card with live counts |
| 103 | ✅ | Add Today button to date nav |
| 104 | ✅ | Add placement empty state |
| 105 | ✅ | Wire revision log to study streak |
| 106 | ✅ | Add Clear completed button to Tasks tab |
| 107 | ✅ | Move Placement before Nutrition in briefing |
| 108 | ✅ | Habit streaks (🔥 day count) |
| 109 | ✅ | Weekly recap in Sunday briefing |
| 110 | ✅ | Mood/energy tap on home card |
| 111 | ✅ | Tutoring earnings tracker |
| 112 | ✅ | Journaling prompt on habit tick |
| 113 | ✅ | Smart training suggestion on home card |
| 114 | ✅ | Goal progress bars on home dashboard |
| 115 | ✅ | Optimal wake time calculator |
| 116 | ✅ | Confirmed live functions/api/* already migrated to Supabase (not @netlify/blobs) — sync.js, health-data.js etc. read/write via SUPABASE_URL/SUPABASE_KEY |
| 117 | ✅ | Removed dead netlify/functions/ directory and netlify.toml (unused since move to Cloudflare Pages) |
| 118 | ✅ | Removed @netlify/blobs dependency from package.json, regenerated package-lock.json |
| 119 | ✅ | Updated deploy.bat messaging/URL from Netlify to Cloudflare Pages |
| 120 | ✅ | Renamed app title "Philip's Training Dashboard" → "Life Dashboard" (index.html title/topbar/h1, manifest.json name/short_name) |
| 121 | ✅ | UI modernization: token-based CSS system (Inter font, --bg/--surface/--text/--radius/--shadow vars), restyle-only pass across all tabs |
| 122 | ✅ | Removed dead Google Calendar OAuth flow (sign-in button, token exchange, live 35-day agenda) — was the source of the "redirect_uri invalid" error and no longer had a configured OAuth client. Calendar tab now shows the same hourly-synced "today" snapshot as the Home card, no sign-in needed |
| 123 | ✅ | Deleted unused functions/api/google-calendar-auth.js |
| 124 | ✅ | Home: removed duplicate AM/PM training list from the top briefing card (kept in the interactive "Today's Training" checklist only); briefing now just shows the intensity call / rest-day state |
| 125 | ✅ | Added system-alerts banner to Home: surfaces Finance sync failures, stale/broken Calendar sync, and overdue tasks in one place instead of each tab silently failing |
| 126 | ✅ | Finance: sheets-proxy.js now retries up to 3x on Google Sheets edge-timeout errors ("error code: 524") and surfaces the real error message instead of a blank parse failure |
| 127 | ✅ | Added global quick-capture (floating button, any tab) — saves straight to Notes without switching tabs |
| 128 | ✅ | Notes: labeled the two untitled pasted links (Idea / Med) so they're not lost in the flat list |
| 129 | ✅ | Bumped sw.js cache to v3 so today's changes aren't masked by the stale service-worker cache |
| 130 | ⏳ | Tasks tab already has full priority tiers (critical/ondeck/someday/dashboard) with drag-drop + escalate/defer — just unused, everything currently sits in "critical". Left for Phil to re-triage himself; offered to help |
| 131 | ✅ | Habits: added a "Reset history" control (and `habit_reset_date` floor used by the heatmap, daily-score chart, and streak recompute) so old days — including auto-tracked ones from Strava/Health data — stop appearing instead of destructively wiping habit_log, which is merge-synced across devices. Fired the reset live so the tracker now starts clean from today (29/08) |
| 132 | ✅ | Bumped sw.js cache to v4 for this deploy |
| 133 | ✅ | Habits: added a faint live "x / 10,000" progress note next to the steps habit, sourced from today's synced Apple Health step count |
| 134 | ✅ | Fixed habit_reset_date not surviving cross-device/new-tab sync — the generic sync-pull path JSON-stringifies plain string values on write, but the reader expected a raw string, so a fresh session silently fell back to showing 30 days of history again. getHabitResetDate now parses either form; setHabitResetDate now stores JSON-encoded to match. Bumped sw.js to v5 then v6 |
| 135 | ✅ | Minimalist redesign, phase 1 (Home tab + shared design system, for review before rolling to the rest of the site): reworked the CSS tokens into neutral grey/white + one sage accent (formalizing the green already used informally everywhere) with a muted red reserved only for genuine alerts; collapsed the amber/blue "middle tier" badges, warnings, and priority-call colors into neutral grey; removed card drop-shadows in favor of a plain border; thinned the tab-nav divider. On Home specifically: quick-log bar and hydration buttons recolored from blue/green/purple to neutral, readiness-score chip collapsed from a 5-hue traffic light to 3 grey/sage/red tiers, task-tier dots changed from a 4-hue set to grayscale-by-urgency (red only for critical), goal progress bars and the sync-status dot aligned to the new tokens. Bumped sw.js to v7 then v8. Other tabs (Whoop, Training, Revision, Finance, etc.) still use the old hardcoded colors — same hex values as the new tokens so nothing clashes, but not yet touched; next phase once Phil's seen Home |
| 136 | ✅ | Found the real cause of "can't see the difference": this repo was still live-deploying to a second, separate Netlify site (linked via the original setup-github.bat instructions) on every push, alongside Cloudflare Pages — Phil was very likely looking at the stale Netlify copy, which has its own cache and never got any of these changes. Untracked netlify.toml and netlify/functions/ from git (.gitignore'd going forward) and pushed the removal — repo now only pushes what Cloudflare Pages serves. Note: the Netlify *site* itself is still linked and may keep auto-building from GitHub until Phil disconnects/deletes it from netlify.app himself (or asks for help doing so) |
| 137 | ✅ | Style pivot per reference mockup (light base + bold pastel accents, Home tab first, mobile bottom-nav+FAB): added `--primary` indigo/purple + pastel chip tokens (blue/orange/pink/purple soft fills) alongside the existing neutral/sage/danger set; recolored the Home quick-log-bar buttons to bold pastel pills, the "add task" button and quick-capture FAB/save button to the new primary indigo. Built a mobile-only (≤640px) bottom nav bar (Home/Health/Train + a raised center "＋" FAB reusing the existing quick-capture, + a "More" button) with a slide-up sheet for the remaining 8 tabs, replacing the old wrapping top tab strip on small screens; desktop keeps the existing top tab row untouched. Bumped sw.js to v9 |
| 138 | ✅ | Phil disliked #137's execution ("colors, bottom nav, doesn't match mockup — start over"). Built a standalone preview artifact first this time instead of guessing again live — approved. Rebuilt Home per the approved preview: reverted the 4-color quick-log confetti back to plain neutral pills; added two bold stat cards at the top of Home's right column (visible on mobile too, unlike the old weather-bar chip) — Readiness keeps its real sage/grey/red tier color, Habits-today uses one fixed decorative lavender (`--lavender`/`--lavender-text`, replacing the unused rainbow chip tokens) with a 🔥 streak or % done subtext; wired `renderHomeStatRow()` off both `renderHabits()` and `renderReadinessChip()` so it stays live. Refined the bottom nav to match the preview: pill background behind the active tab icon, bigger FAB with a `--bg`-colored ring border for a "lifted disk" look. Bumped sw.js to v10 |
| 139 | ✅ | PassMed data access: confirmed there's no public API and no way to auto-sync in the background — both `mcp__claude-in-chrome__*` (session-isolated by design, never shares Phil's real cookies) and the desktop's generic browser control (hard-capped to read-only/view-tier for browser apps) are deliberate platform boundaries, not gaps to route around. Instead, viewed Phil's real logged-in PassMed session read-only and read his Performance → By category chart (Your score vs. Average user score, 12 specialty categories, no numeric labels so values were read visually off the bars). Built a "PassMed Category Performance" snapshot tracker: `passmed_category_snapshots` (localStorage + synced, array of `{date, categories:[{name,you,avg}]}`), rendered as sorted-weakest-first horizontal bar rows with a delta arrow vs. the previous snapshot, plus an editable form ("Update from PassMed snapshot") to log new ones — either typed in by Phil or read in by Claude during a live session together. Seeded with the real numbers read on 2026-08-29 (Ethics & law untouched at 0%, weakest gap; Statistics/ENT both 100%). Since PassMed itself only shows current cumulative stats with no history, this snapshot-over-time view is genuinely new, not just a mirror. Bumped sw.js to v11 |
| 140 | ✅ | Phil sent the AnkiConnect README and asked to access his Anki data — unlike PassMed, this is a real local API (confirmed live on his machine, v.6). Tested a direct browser fetch from the deployed HTTPS dashboard to `http://127.0.0.1:8765`/`http://localhost:8765` and confirmed it's hard-blocked by Chrome (Private Network Access) before the request even leaves — not an AnkiConnect CORS setting, a browser policy with no config workaround. The device shell bridge (which could reach it via plain curl, no browser involved) was down for the rest of this session, so the live auto-fill build is deferred to when that's back. Phil then asked to replace the whole Medicine tab with the Anki/PassMed data, keeping only Signoffs. Removed entirely: the UKMLA Systems accordion/tracker sub-tab (kept the underlying `UKMLA_SYSTEMS` condition list, since the PassMed System Checklist still reads it — only the accordion UI/progress-rating functions and `ukmla_progress` sync key are gone), the Current Week card and 26-Week Phase Plan (topic-schedule UI, tied to the same system), the daily ECG Quiz sub-tab (`ECG_QUIZ_BANK` and its log/render functions, `ecg_quiz_log` sync key), and the placeholder Research & Conferences sub-tab. Medicine now has two sub-tabs: Signoffs (untouched) and "Anki & PassMed" (Log Today, Last 7 Days chart, PassMed System Checklist, PassMed Category Performance). Left the shared top-of-tab widgets (Study Streak, Daily Questions, Pomodoro, Topic Tracker) alone — not part of what was discussed. Underlying `ukmla_progress`/`ecg_quiz_log` localStorage data was left in place (just no longer synced or rendered), not wiped. Bumped sw.js to v12 |
| 141 | ✅ | Phil uploaded the GEM Year 4 2627 Provisional Assessment Schedule PDF and, in follow-up messages, pasted the MBBCh Scheme of Assessment requirements text and the JA (Junior Assistantship) placement letter. Three additions from this: (1) Year 4 calendar — mapped each 1st-attempt/formative assessment date onto its week row in the `TRAVEL` (Events column) array of `renderYear4Cal()` (Formative SBA wk413, CPSA Pt1–3 wk421, AKT P1&P2 wk423, PSA wk429 — merged into the existing Swansea HM entry since both land the same week, Portal deadlines — Mini-CEX/Skills log/Mandatory training/Out-of-hours all due 31 Mar — wk431, Elective report wk437, SA sign-off wk441); resit/supplementary rows from the PDF (Resit AKT, Supplementary CPSA, Re-Sit PSA) were deliberately excluded per Phil's instruction. Also removed the two now-past Events entries (Barcelona, Alex BBQ Notts — both before 29 Aug 2026) per his "delete Barcelona and any dates that have already happened" — scoped to the Year 4 calendar's Events column only, left the separate revision-schedule `REV_EXCL` Barcelona exclusion untouched since removing it would retroactively shift the daily topic-cycling Phil's already partway through. (2) Medicine tab — new third sub-tab "Assessment Info" with static reference cards per module (PM-367C/368C/369C) covering each assessment's format/requirements and resit policy from the pasted scheme text. (3) Medicine → Signoffs — added a new "Junior Assistantship (JA1–3)" accordion (`signoff_ja`, added to `SYNC_KEYS`) alongside the existing Clinical Skills Signoff, with 14 trackable items: Mini-CEX 1/2, End of placement clinician assessment, and Written student feedback for each of JA1 (1 Sep–9 Oct 2026)/JA2 (19 Oct–27 Nov 2026)/JA3 (15 Feb–26 Mar 2027), plus the two whole-year out-of-hours requirements (2 evening on-calls, 2 weekend days) — deadline set to 31 Mar 2027 to match the PDF's "Six Mini-CEX Passed" cutoff. Bumped sw.js to v13 |
| 142 | ✅ | Added three manual habit-tracker items per Phil's request: "100 Anki cards", "50 PassMed Qs", "2 OSCE prep" — added to `DAILY_HABITS` (checkbox items, same pattern as Journal/Read/3L water), so they pick up the existing habit-log history, streaks, home-tab habit count, and per-habit heatmap automatically with no other code changes needed. Bumped sw.js to v14 |
| 143 | ✅ | Added "Driving theory" as a manual habit-tracker item per Phil's request (`h-driving-theory`, same checkbox pattern as the Anki/PassMed/OSCE items just added). Bumped sw.js to v15 |
| 144 | ✅ | Removed the Nutrition and Hydration features completely, per Phil's request. Nutrition: deleted the Home "🍎 Nutrition" summary card, the entire dead Nutrition-tab JS block (macro targets, food log, Open Food Facts search, meal planner, grocery sync, pantry tracker, AI nutrition advice — none of it had had a reachable tab since an earlier redesign removed the `#tab-nutrition` markup, confirmed via full dependency grep before deleting), the "🍽️ Log food" quick-log button/panel and its Task #31 handlers, the food-log CSV export option, the Strava-calorie-fallback patch on the old kcal-target function, `nutr_*` SYNC_KEYS entries and their sync hooks, and the "& nutrition" mention in the morning push notification text. Hydration: deleted the Home hydration card/counter (`getHydrationData`/`addHydration`/`renderHydrationSection`), the "💧 +250ml" quick-log button, and the `renderDailyBriefing` override that injected it — kept the override itself (slimmed down) since it was the only place `renderAlertsBanner()` got called after each briefing render, which would otherwise have silently broken the system-alerts banner. The "3L water" habit-tracker checkbox stays (it's just manual now, no longer auto-ticked from the hydration counter). Verified zero dangling references (script syntax check + div-balance check both clean). Also fixed auto-push.bat, which only staged `functions/ _routes.json index.html TASKS.md` — missing sw.js, so a scheduled auto-push after a cache-version bump could push mismatched files; added sw.js to its git add list. And reconciled the Year 4 calendar with the JA placement letter: JA1 = Haematology·Singleton, JA2 = T&O·Glangwili, JA3 = Cardiff GP (confirmed by cross-checking each JA date range against the BLOCKS week rows) — added "JA1 ·"/"JA2 ·"/"JA3 ·" prefixes to those three BLOCKS labels and the matching placement name into each Signoffs → Junior Assistantship checklist item (was 0/14 ticked, so safe to relabel with no data loss). Bumped sw.js to v16 |
| 145 | ✅ | Habit tracker layout: the list had grown to 17 flat, undifferentiated items after this session's additions (Anki/PassMed/OSCE/Driving-Theory). Added a `group` field to each `DAILY_HABITS` entry and a `HABIT_GROUP_ORDER` array, and reworked `renderHabits()` to render small uppercase section headers between groups: Tracked automatically (Cardio/Strength/10k steps/8h sleep/Weigh in — unchanged, still first), Study (Anki/PassMed/OSCE/Driving-Theory), Wellness (Journal/Read/3L water), Personal care (Skin care AM/Creatine/Minoxidil/Skin care PM), Home (Water plants). Grouping is cosmetic only — storage/streak/sync keys are all unchanged, so it's a zero-data-risk reorder. Row dividers now only appear between two items of the same group, not right before the next header. Bumped sw.js to v17 |
| 146 | ✅ | Two new Home/system features built off the Year 4 calendar data, per Phil's approval. First hoisted the `BLOCKS`/`TRAVEL` arrays out of `renderYear4Cal()` to module-level `YR4_BLOCKS`/`YR4_TRAVEL` consts (plus a new `yr4WeekDate(week)` helper encoding the calendar's irregular week-399/400 + strict-7-day-from-401 date cadence) so they can be shared without duplicating data that could drift. (1) Upcoming assessment countdown: `renderSystemAlerts()` now flags each `YR4_TRAVEL` entry with `assessment:true` (Formative SBA, CPSA, AKT, Swansea HM·PSA, SA sign-off — travel/admin-deadline entries like California and Portal deadlines excluded) and surfaces a "📝 <name> in N days" system-alert banner once one falls within 21 days, linking to the Year 4 tab. (2) "Currently on placement" chip: `renderDailyBriefing()` now shows a small "📍 Currently" badge with today's `YR4_BLOCKS` label (e.g. "JA1 · Haematology · Singleton") whenever today falls inside a block's date range — kept deliberately separate from the existing "🏥 Placement" section (still driven by the older, date-limited `PLACEMENT_SCHEDULE`) so the two don't collide; the new chip picks up coverage for the whole Year 4 span once that older schedule runs out. Bumped sw.js to v18 |
| 147 | ✅ | Two genuinely-new features (not reorganizations), researched off other life-dashboard/med-student apps and built to fit Phil's Year 4 placements. (1) Medicine → new fourth sub-tab "Calculators": a quick-reference panel of clinical scores for placement — Wells Score (DVT/PE toggle), CURB-65, CHA₂DS₂-VASc, Glasgow Coma Scale, NEWS2 (SpO₂ Scale 1), and the Ottawa Ankle/Foot Rules — each a live-updating card (checkboxes/inputs recompute the score and risk-tier label on every change, no submit button). Formulas verified against MDCalc/RCP NEWS2 sources and spot-checked with test cases (e.g. NEWS2 sick-patient case scoring 19 → high risk; CHA₂DS₂-VASc female-sex-only case correctly scored low risk per guideline nuance) before shipping. (2) Home → new "💡 Insight" section: `computeCrossDomainInsight()` auto-correlates data already tracked separately — sleep hours (Apple Health `sleep_analysis`) and training minutes (Strava `_acts`) against revision-target completion (`rev_schedule_log`, the existing Anki/PassMed log) — over the last 30 days, and surfaces whichever comparison has the bigger gap, but only when both sides have ≥4 days of data and the gap is ≥8 percentage points (stays silent rather than reporting noise). Only shown on today's real view, not when browsing +/-days. Bumped sw.js to v19 |
| 148 | ✅ | Phil asked "when do my clinical skills need to be done by" — surfaced that the Clinical Skills Signoff deadline (24 Jul 2026) had already passed with only 2/15 items ticked, and flagged that the "Year 3 sign-offs due" banner had gone silent past the deadline instead of turning overdue-red. Phil corrected the deadline to 31 Mar 2027 (matching the JA accordion's GEM Portal deadline) and asked to split the single "Junior Assistantship (JA1–3)" checklist into three separate per-placement accordions — JA1 (Haematology, Singleton), JA2 (T&O, Glangwili), JA3 (Cardiff GP) — with the two whole-year out-of-hours items (2 evening on-calls, 2 weekend days) redistributed 1 evening + 1 weekend into JA1 and JA2 each, none into JA3/GP. Updated `ACCORDIONS`: `clinical` deadline → 2027-03-31; the old single `ja`/`signoff_ja` entry replaced with three new accordions (`ja1`/`signoff_ja1`, `ja2`/`signoff_ja2`, `ja3`/`signoff_ja3`), each titled with its placement/dates so the per-item labels could drop the repeated JA-prefix (now just "Mini-CEX 1", "Mini-CEX 2", "End of placement clinician assessment", "Written student feedback", plus the 2 out-of-hours items on JA1/JA2 only). Confirmed `signoff_ja` was still empty (0/14) before the split, so no data migration was needed. Updated `SYNC_KEYS` to swap `signoff_ja` for the three new keys. Left the Assessment Info PM-368C/369C reference cards untouched — their wording (6 mini-CEX total, 2 on-calls/2 weekend days across the year) still holds at the whole-year level. Bumped sw.js to v20 |
| 149 | ✅ | Added "Iron tablet" to the habit tracker (`h-iron`, Personal care group, alongside Skin care/Creatine/Minoxidil) per Phil's request. Bumped sw.js to v21 |
| 150 | ✅ | Five fixes/removals from one request. (1) Renamed the "Water plants" habit-tracker item to "Checked plants" (`h-water-plants`, label only — id/streak/history untouched). (2) Removed the Fitness sub-tab's "Activity Calendar" (GitHub-style contribution grid of Strava activity days) — deleted the HTML card, `renderActivityCalendar()`, and its call in `renderFitnessSubTab()`. (3) Fixed the readiness score being stuck at 23 every day — found two real bugs in `computeReadinessScore()`, not a data issue (Apple Health sync itself was confirmed fresh): the HRV/RHR baseline calc called `_avg()` directly on `_healthSeries()`'s `{date,value}` object array instead of `.map(p => p.value)` first, so the baseline was always `NaN` and both components silently fell through to their worst-case tier every single day (25 and 15); separately, `todayHrv`/`todayRhr`/`skinTemp` were used as the raw `{date,value}` object instead of `.value`, same `NaN` effect; and the sleep component divided `computeSleepForDate()`'s `totalSleep` by 3600 as if it were seconds, when it's already in hours, pinning sleep to its worst tier (10) too. Worst-case-everywhere (25×0.4 + 15×0.25 + 10×0.25 + 70×0.10 default temp) rounds to exactly 23 — matches Phil's report precisely. All three call sites fixed to match the `.map(p=>p.value)` / `.value` pattern used correctly everywhere else in the file. (4) Diagnosed and fixed Google Calendar sync being stale for ~10 days: the hourly "Sync Life Dashboard calendar" scheduled task was reporting success but the POST to `/api/gcal-intake` never actually landed — confirmed live that the cloud sandbox's own network egress can't reach training-dashboard-5qr.pages.dev at all (same domain block reproduced directly), while the endpoint itself works fine from a real browser. Recreated the trigger bound to Phil's own computer (`requires_local_device: true`) so the POST runs from his machine's real internet connection instead of the sandbox — same hourly cron, prompt updated to explicitly use the local device shell for the POST step and to report plainly (not silently fall back) if the computer's offline. Note: Cowork reported this new binding needs Phil's explicit approval before it'll actually run on his device — until approved it'll still fire in the cloud and fail the same way, so this needs Phil to approve the device binding. (5) Removed the "Anki & PassMed" sub-tab from the Medicine page (Log Today form, Last 7 Days chart, PassMed System Checklist, PassMed Category Performance snapshot tracker) — deleted the sub-tab nav button/pane and every function/localStorage key used only by it (`logRevToday`, `toggleRevPassmed`, `initRevSchedule`, `renderRevSchedule`, `renderRev7DayChart`, `renderRevPassmedChecklist`, `getRevPassmedDone`/`saveRevPassmedDone` + `rev_passmed_done`, the whole PassMed-category-snapshot block — `getPmCatSnapshots`/`savePmCatSnapshots`/`seedPmCatIfEmpty`/`renderPmCatChart`/`openPmCatForm`/`addPmCatRow`/`savePmCatForm`/`PM_CAT_DEFAULT` + `passmed_category_snapshots`), removed both keys from `SYNC_KEYS`. Kept `getRevLog()`/`rev_schedule_log` (data layer only, no more write path) since three other features still read historical Anki/PassMed numbers from it: the Home "📚 Revision" daily-briefing section, the `computeCrossDomainInsight()` sleep/training correlation, and the Medicine tab's Exam Countdown adherence % chip — all three will now just show whatever was last logged and stop updating, since there's no longer any UI to log new numbers; flagged this to Phil rather than silently touching those too, since the request was scoped to "the medicine page". Re-pointed the sync-pull handler for `rev_schedule_log` from the deleted `renderRevSchedule` to `renderDailyBriefing()` + `renderExamCountdown()` so cross-device sync of historical data still refreshes something real. Verified zero dangling references (script syntax check + div-balance check both clean). Bumped sw.js to v22 |
