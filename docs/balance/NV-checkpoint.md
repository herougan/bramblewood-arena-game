# Package NV checkpoint (2026-10-19)
Scope: Home button / conquest top strip; pre-battle VS screen; raid-complete emblem; raid results stats bug (turn-1 SSS) + labels; Playwright screens in docs/screens/nv/.
## Status
- [x] 1 Home: 🌰 Home at the left of the floating tab bar (renderPlay, #playHomeTabBtn); tab strip scrolls inside the bar (iOS clipped the fixed 🏠 cluster inside the scrolling bar); map strip hidden ≤820px (nvStyles in arena_template.html)
- [x] 2 VS screen v2 (showVsScreen): cards, raid side panel (you + allies + total), boss card, Start button; me.raidSide from startRaidFullBattle
- [x] 3 Raid emblem: raidRankEmblemHTML (+ window.bwRaidRankEmblemHTML for fx-f claim screen)
- [x] 4a root cause: Admin 👑 Win (adminAutoWin) on turn 1 → scored as overwhelm 10k + pushed. Fix: m.adminWin → raid not recorded (m.raidAdminTest). Also Play again on raid built a Quick Battle → raidReplayPart
- [x] 4b raidDamageCalcHTML breakdown, nv-full-reward-from, bramble span in stats, running stat tally (log cap 200 undercounted)
- [x] tests (tests/nv-2026-10-19.js 121/121), mobile-nav + raid-rv2 updated and passing; i18n-templates + game-texts pass
- [x] screenshots in docs/screens/nv/ reviewed
- [x] keyify/export, CHANGELOG, lang translations (12 packs)
- [x] merge main (MB2, SY), rebuild, final commit; nv 121/121, mobile-nav, raid-rv2, raid-br, i18n-templates, game-texts pass
## Notes
- scratch scripts: /tmp/claude-0/-home-claude/37fc5715-ea38-5d46-be56-06a8c754a559/scratchpad/nv/ (shots.js, spec-nv.js)
