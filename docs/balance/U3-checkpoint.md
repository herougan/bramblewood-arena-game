# U3 checkpoint (2026-10-19)
Owner UI notes 13:41-13:43 + item 6 (13:45). All done and committed ("Package U3: ...").
1. Home -> the top-right cluster (#homeNavBtnPlay, 🌰); the tab-bar Home is gone; the full-screen map's Home is an acorn too.
2. The phone map strip is back on the cluster's line (u3FitMapStrip; its own line under the cluster when under 110 px is left),
   with compact chips (.cmi-num, .cmi-tick), a touch-and-hold peek (u3WireChipPeek) and the toast wording.
3. The raid bramble "Kraken's Reef" (RAID_BRAMBLES / raidBrambleOf), art/raids/krakens-reef.svg (tools/make_raid_bramble_art.py),
   its info panel, VS card and raid rules, and the tentacle from its tile (FX.F tentacleSmack origin). The brief is
   docs/art/raid-bramble-art-brief.md.
4. Raid rows (u3Styles 4), bottom-aligned. Board cards: 390 68x86, 430 77x96, 1366 64x80 (were 67x84, 75x94, 61x77).
5. The turn pill is faded out and reads "Turn N"; u3TurnFlash plays the tick, plus the last-3-turns line.
6. Castle numbers at the HP fill's end (hqFillEndX, u3ClampOnBar).
Tests: tests/u3-2026-10-19.js (in run-all), tests/e2e/u3_2026_10_19.py; nv, mobile-nav, bu and the battle_ui e2e test are updated.
Screens: docs/screens/u3/.
