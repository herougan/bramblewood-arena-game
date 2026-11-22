# Old unit failures after release ddb42d7a8 (2026-11-22, TESTFIX4 triage)

GitHub full run 44915077641: 38 failing tests, the same 38 as the run before UIQ2 (44909706565), so nothing new.
Run locally the same day: mapfx1 and ui29 pass here (CI environment). TESTFIX4 fixed four tests whose checks predate later owner calls:
lvl10, easter-eggs, prayer, gi (out-of-play cards reported apart, as LISTFIX1 says; owner edits FOLD8, SKIN3, FOCUS2 respected).

Left, by cause (each needs a tool re-run or an owner call, not a test edit):
- **Out-of-play cards still in decks / lists** (DATAFIX 11-18 moved 21 cards to "basic pack, no list"): pvp1 (fixed by PVPFIX 2026-11-22: decks rebuilt;
  `node tools/pvp1/pvp1.js build` then `apply`, a long CPU job), bal7 M3 (they carry no `unattainable` flag), skir1, lead, pro.
- **Stored measures out of date after later refits**: pale-desert (side road 18-A), winrate-panel (Map 23), bal9 / bal12 / bal13 / bal14 /
  bal21 / bal25 (band lists), ref5 (Map 6 collection), deck1, df3, bf5, keywords-w3 (tower floors 44-49).
- **Budget over on in-play cards the owner holds** (DEC1): content2 / content12 (nutria-reedcutter, venomlord-serpent), bx (Otter Kit), budget2.
- **Content lists moved since the test's plan**: content16 (pack plan), rewards-pass, road-rarity (Maps 21+, out of scope), card-pool,
  thematic, unit-themes, side1 (card-power rows for 5 cards), eb (1-5's Badger Lumberjack), bal3 (13-4 / 20-4 boons, 21-3).

## TESTFIX8 (2026-11-22): after the Chromium path fix (browser parts run again)
The full run docs/tests/full-2026-11-22-browser.log had 6 failures not listed above. All are settled:
- fix6: the Tower pools gain a Super Rare tier (The Contradiction and the Fire Drake Hatchling are Super Rare now; KK20). This is a game fix. The 4-5 check accepts the Drowned Matriarch as the elite's showcase leader (REFIT4 took Shoal Shark out).
- ed B#9a, ux 8c, fx14 Pearls: each ran out of a fixed wait under the full run's load. They now wait for their condition (the checks are unchanged).
- lab-errors: `.fxcat/cards.json` was never captured locally. The test now runs capcards.py when it is missing, as CI's setup does. ui2 passes with the new Chromium.
- Side effect of the Super Rare tier: keywords-w3 drops from 6 failing tower checks to 3 (floors 48, 49 and "within 20", worst 67, was 170).

### e2e group (`node tests/run.js --e2e --only e2e`, local, 2 cores): 32 of 52 failed. None were listed before. Not fixed.
- **Load / timeouts** (re-run alone before acting): flows and emoji_perf (killed at 600 s), codex_perf (first frame 2.8-4 s against a 2.5 s limit), fx4 (passes alone), live_two_player (match still running after 13 rounds), coop_dungeon (round stuck 6 -> 6).
- **The new pack opener (#packOpenOverlay po2) intercepts the test's clicks**: pl2, codex_cx, map_2026_10_24, rw6; pref (its 3-REF click times out); flair1 (an element it clicks is null).
- **Status pips render icon-only** (no state class or number): en4 (Hemorrhage, Greater Poison), en5 (Timbered), en6 (Heat / Frost / Storm / Rain), eq2 (no durability bar or pips).
- **Card looks not seen**: en2 (Ironclaw's claw), bl and en5 (Bloom's spent chip and text), en7 (poison pool sink, Puffin aloft tag, the editor's poison / bleed boxes), df3 (Challenge and boon pills, Blind Fury log).
- **Board motion**: snaps (castle tiles jump 28 px at 1366, 4-3 and 4-5), bv (front-wave bounce, snap glides, squash), anim1 (a played card settles 2-3 px off its resting size at 1.5x / 2x), ui4 (a pool-card tap adds nothing; board cards rebuilt under the results).
- **Expectation predates later content** (same result when run alone): rw4 (Map 1 marks table skills besides Diurnal: MAPADD1 / map skill table), en3 (no Bramble Armor in the editor), ui48 (side maps' Suggested counts), rarity_limit_craft (no Forge duplicate board; the lesson text changed), rw5 (Map 0 cleared: 2x not in the speed cycle), ui46 (shop menu: the deal and Mystery Boosters missing), cs_d (a 149 px raid board card hides its name).
- **Co-op race**: coop2 (player 1 lands the slot though player 2 claimed first). It may be a real ordering bug and needs a look.
