# E5 determinism (package E5DET1, 2026-11-16)

Alpha checklist E5: "Same seed, same result, in the browser and the tools. Check: replay test." Verdict: **PASS** (raids pass after the fix below).

## How a fight is seeded
- Game: every match's engine gets `seededRng(currentMatchSeed)` (`nextMatchRng`, arena_app.js). The seed is random unless `forcedNextSeed` is set (tutorial, Admin repros, this test). The engine draws only from that `rnd`. Its own `Math.random` is a fallback when no `rnd` is given (no game path does that).
- Tools: `tools/lib_bramble.js` reads the game's own `referenceFightSetup` / `playReferenceGame` out of arena_app.js. Game g plays `seededRng(seed0 + 37g)`, the same games as the skirmish editor's win-rate panel. `tests/card-matrix.js` and the harness use `mulberry32(seed)`, the same generator.

## What was compared (`tests/e5det-2026-11-16.js`)
After every engine call that can change a fight (newPlayer, draw, roundStart, aiTakeTurn, resolveCombat, placeCard ...), the test hashes three things: both players' whole state, the call's new events and the RNG draw count. Display-only fields (castle art and flavour text) are left out.

| Check | Result |
|---|---|
| 30 fights, Maps 0-20 (21 main, 8 side, 1 dungeon floor; 51 fight rules incl. fields, weather, tides, dark, eruption, sandstorm), same seed twice in Node | 30/30 identical, call for call |
| Event recording on vs off (what effects read) | 30/30 same end |
| Another seed | 30/30 different logs |
| Built index.html in headless Chromium, the page's own reference path, same seed | 30/30 identical to Node, call for call |
| Real conquest fights (`startConquestMatch`, Auto-play, animations and timers), same seed at 8x and 40x | 3/3 identical; another seed 3/3 differ |
| What the page writes into the players between engine calls | only game flow: turn flags, Auto-play lending your leader, loop cards, bramble setup, the HUD's deck caches. No effect writes fight state. |
| Raids: tool path (`raid_full_sim.playOne`) twice; the game's raid (first 4 rounds) twice | identical (game raid: after the fix) |

The test runs in about 4 minutes, mostly animation wall time, at low CPU. `--no-browser` runs the Node part in about 25 s.

## Fixed
- **Raids were not replayable from their seed.** The raid start, `raidAllyOf`, `raidBossCommons`, `raidAllyPlays` and `buildRaidFullFight`'s board draws used `Math.random`. Two starts from one seed gave different allies' decks and boss rows (shown in the page before the fix). They use `raidRand` now: `seededRng(currentMatchSeed ^ 0x5A1DF00D)`, kept on the match. Tools pass no `raidRand` and keep their seeded `Math.random`. The raid tool's output is byte-identical (24 games compared).

## Not fixed (listed)
- `rules.phase: 'realtime'` reads the player's clock (by design; on no map).
- A resumed raid has no `raidRand` (Math.random for its remaining Commons and reshuffles). The trench minigame (Admin only) seeds itself, not through `currentMatchSeed`.
- Pre-fight picks outside the seed: "Reference (Random)" picks its ladder deck with Math.random, and a clicked (not dropped) leader picks its slot with Math.random. Both are inputs, not fight randomness.
- Found while reading: in `advanceDungeonWave`, the per-wave deck fill sits behind a `//` comment on the same line, so wave decks never apply (and never shuffle). This is a behaviour bug, not determinism. Left for the owner.
