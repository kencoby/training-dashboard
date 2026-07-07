# Training Dashboard — Task History

All 115 tasks completed across the full build.

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
