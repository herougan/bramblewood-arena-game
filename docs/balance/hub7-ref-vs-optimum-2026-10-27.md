# Reference decks against each map's optimum, Maps 0-24 (package HUB7, 2026-10-27)

Owner 10-26 23:33: "a simple graphic of Map 0-24 difficulties: So the reference decks against all the map 0-24 most powerful deck you've constructed. All in 1 table, with heatmap." The heatmap is at the top of the hub's 🧬 Deck optimizer summary. Data: `hub7-ref-vs-optimum-2026-10-27.json`. Measurement only: `canonical/pro-skirmishes.json` is unchanged.

## How it was measured
- **Optimum** per main map: `optima[0]` of a `tools/opt/deckopt.js` map-true run (faction cards out, budget 16,000, `--ladder none`, 2 workers).
  - Re-run on 2026-10-27 against the current cards and engine (after CONTENT3, ENG9, ENG10): Maps 0-15 and 21-24 (tag `2026-10-27-hub7-maptrue`, files in `opt/`).
  - **Reused** from 2026-10-25 (PRO3, made before CONTENT3, ENG9 and ENG10): Maps 16-20. The re-run job reached its 2-hour limit during Map 16 and was not restarted.
- **Games**: `tools/opt/ref_vs_optimum.js --games 200`. It plays each pairing the way `tools/opt/pro_ease.js` plays a reference against a PRO fight. The reference plays at its scheduled level with no leader. The optimum plays as a PRO fight: Level 1, CPU Smart, its showcase leader from Map 2, the map's average field. 200 games a pairing, about ±7 points at 95%. Seeds are fixed per pairing.
- **References**: the map reference (`referenceDeckFor`) and Reference-2 (the Ant Deck, +5 levels a map). Reference-3 is pending (REF-3) and has no numbers.

## Reference win rate (%) against the map's optimum
| Map | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16* | 17* | 18* | 19* | 20* | 21 | 22 | 23 | 24 | Mean |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Map reference | 42 | 0 | 0 | 48 | 4 | 18 | 14 | 18 | 55 | 20 | 20 | 16 | 46 | 24 | 16 | 34 | 36 | 33 | 30 | 14 | 40 | 49 | 67 | 58 | 52 | 30 |
| Reference-2 | 96 | 68 | 51 | 67 | 44 | 84 | 74 | 54 | 42 | 38 | 37 | 42 | 70 | 25 | 12 | 33 | 38 | 60 | 48 | 25 | 66 | 64 | 74 | 33 | 78 | 53 |
| Reference-3 | pending |

\* the reused 10-25 optimum.

## Readings
- **The map reference loses to most optima** (mean 30%). Maps 1, 2 and 4 are near 0% (1/200, 1/200, 9/200): at Level 0 with the starter road deck, the map's best deck at Level 1 is out of reach there.
- **Reference-2 is about even** (mean 53%). It wins 70% or more on Maps 0, 5, 6, 12, 22 and 24 and hard on Maps 13, 14 and 19 (25% or under).
- **Maps 21-24 are easier than Maps 13-20 for both references** (map reference 57% against 28%, Reference-2 62% against 38%). Map 22's optimum is weak (59.3% in its own gauntlet). The references are also higher-levelled by then (Lv 4.1-4.6 and 5.1). This does not fit "roughly always harder" (DF-1b). It is a finding about those maps' pools, not a reason to change any PRO deck.
- **Map 23 splits the references**: the map reference wins 58%, Reference-2 33%.
- Re-run first if a cell matters: Maps 16-20 still use the 10-25 optimum.
