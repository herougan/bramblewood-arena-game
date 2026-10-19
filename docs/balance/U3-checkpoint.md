# U3 checkpoint (2026-10-19)
Owner UI notes 13:41-13:43 + item 6 (13:45). Status:
1. Home -> top-right cluster (#homeNavBtnPlay, 🌰), tab-bar Home removed. DONE (code, CSS nvStyles/u3Styles).
2. Phone map strip back, compact chips (cmi-num, cmi-tick), u3FitMapStrip, u3WireChipPeek, toast text. DONE.
3. Raid bramble: RAID_BRAMBLES / raidBrambleOf ("Kraken's Reef"), art/raids/krakens-reef.svg (tools/make_raid_bramble_art.py),
   castleHoverHTML, VS card, raid rules, FX.F tentacleSmack origin. DONE. Art brief doc: TODO.
4. Raid rows CSS (u3Styles 4), bottom-aligned. DONE. Sizes: 390 68x86, 430 77x96, 1366 64x80.
5. Turn pill faded + u3TurnFlash. DONE.
6. Castle float at fill end (hqFillEndX, u3ClampOnBar). DONE.
Tests: tests/e2e/u3_2026_10_19.py passes (map, raid, float). TODO: update tests/bu-2026-10-19.js, tests/e2e/battle_ui_2026_10_19.py,
tests/nv-2026-10-19.js, tests/mobile-nav-2026-10-19.js; new tests/u3-2026-10-19.js static; i18n (tools/i18n_2026_10_19_u3.py);
keyify/export_texts; CHANGELOG; art brief; merge main; final commit.
Scratch tooling: CSS source kept at scratchpad u3css.css, inserted by inscss.py (the template is canonical now).
