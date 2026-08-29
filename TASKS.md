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
