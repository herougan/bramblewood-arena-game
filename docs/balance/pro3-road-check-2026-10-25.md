# Road check after EN8 (package PRO3, 2026-10-25)

Decision EN8-10 (still open): EN8 made the CPU stronger (it pitches cards for resources, guards against lethal, its brambles heal allies). This pass measures every fight of Maps 0-20 and their side maps against the agreed road curve (arena_app.js `roadCurveTarget` / `skirmishTargetBand`: a map's first skirmish ~90% stepping to ~60% before the boss, the boss 40% (30-49%), green = target ±8 points; side maps a step lower a map ahead) and retunes the road decks that fall outside, the smallest change first.

## How

- Measure: `node tools/skirmish_pass.js measure 40 <shard> 2 --tag=pro3-before|pro3-after --maxmap=20`: the reference player (the road deck for that map, at its reference level, Smart) against each fight as the game builds it, 40 games, seeds 9100 + 37g (the skirmish editor's win-rate panel plays the same games). Endless dungeon floors and the tutorial / Volcano Lair (no curve) are measured but not tuned.
- Tune: `node tools/skirmish_pass.js curve 40 --from=pro3-before --fixes=pro3-road-fixes --maxmap=20 --steps=4 --decks-only --keep-leaders --keep-first --keep-size --pool --distinct`: CPU deck swaps only, a card of the map's pool for another (a stronger card in when the fight is too easy, a weaker card of the map's own fights in when too hard; strength = the card pass's measured win rate, the 4-round yardstick in practice), up to 2 copies a move (a whole card when the 5-7 distinct-card rule needs it), each move kept only if it closes the gap by 2+ points on fresh tune seeds (7300 + 37g). The fight's leader / showcase, its first-clear card and its deck size are kept; no Shield or Health change.
- Raw rows: `docs/balance/skirmish-pass-pro3-before.jsonl`, `docs/balance/skirmish-pass-pro3-after.jsonl`, the moves in `docs/balance/pro3-road-fixes.jsonl`.

## Result

| | before | after |
|---|---|---|
| all 241 fights, mean new-player win rate | 67.8% | 69.1% |
| main-map fights (149), mean | 64% | 67.2% |
| on the curve: green / too easy / too hard | 68 / 77 / 81 | 117 / 56 / 53 |
| not on the curve (endless floors, tutorial, Volcano Lair) | 15 | 15 |

EN8-10's measure (tools/en8_cpu_pitch_2026_10_24.js, a wider fight list incl. every endless floor) was 76.0% before EN8 and 64.4% after; this tool's main-map mean was 64% at the start of this pass (the same engine as EN8's "after").

Decks changed: 131 of 158 fights tuned (the rest found no swap that helped by 2+ points). Measured at 40 games a fight a result is about ±15 points (95%), so a fight a few points outside its band may be noise.

## Fights still outside their band (after)

Most are too hard where a swap cannot reach the target: the decks are already the weakest cards of their map, and the CPU's new pitch is what carries them (Map 2, Map 4, Map 11 and Map 20's elites). They need a lever this pass did not use (dropping copies to shrink a deck, a lower enemy level or bramble, or the reference deck); see EN8-10.

| fight | kind | band (target) | before | after | moves |
|---|---|---|---|---|---|
| 0-2 (m1) | skirmish | 67-83 (75) | 87.5% | 87.5% easy | 0 |
| 0-3 (m1) | skirmish | 52-68 (60) | 45% | 45% hard | 0 |
| 0-4 (m1) | skirmish | 30-49 (45) | 60% | 60% easy | 0 |
| 0-B-1 (mo) | skirmish | 82-98 (90) | 100% | 100% easy | 1 |
| 0-B-3 (mo) | skirmish | 52-68 (60) | 97.5% | 92.5% easy | 1 |
| 0-B-4 (mo) | boss | 30-49 (40) | 82.5% | 70% easy | 3 |
| 1-A-2 (mq) | skirmish | 72-88 (80) | 90% | 67.5% hard | 1 |
| 1-A-5 (mq) | boss | 30-49 (40) | 85% | 85% easy | 2 |
| 2-1 (mb) | skirmish | 82-98 (90) | 70% | 70% hard | 0 |
| 2-2 (mb) | skirmish | 72-88 (80) | 65% | 70% hard | 2 |
| 2-3 (mb) | skirmish | 62-78 (70) | 17.5% | 57.5% hard | 3 |
| 2-4 (mb) | skirmish | 52-68 (60) | 35% | 35% hard | 0 |
| 2-5 (mb) | elite | 30-49 (40) | 10% | 7.5% hard | 1 |
| 2-A-1 (mp) | skirmish | 82-98 (90) | 60% | 60% hard | 0 |
| 2-A-2 (mp) | skirmish | 76-92 (84) | 57.5% | 57.5% hard | 0 |
| 2-A-3 (mp) | skirmish | 70-86 (78) | 67.5% | 67.5% hard | 0 |
| 2-A-4 (mp) | skirmish | 64-80 (72) | 97.5% | 85% easy | 2 |
| 2-A-5 (mp) | elite | 58-74 (66) | 25% | 47.5% hard | 4 |
| 2-B-2 (mg) | elite | 67-83 (75) | 95% | 87.5% easy | 3 |
| 2-B-3 (mg) | elite | 52-68 (60) | 80% | 85% easy | 2 |
| 2-B-4 (mg) | elite | 30-49 (40) | 97.5% | 97.5% easy | 1 |
| 3-5 (mc) | elite | 58-74 (66) | 75% | 77.5% easy | 1 |
| 3-6 (mc) | elite | 52-68 (60) | 85% | 77.5% easy | 2 |
| 3-7 (mc) | elite | 30-49 (40) | 80% | 72.5% easy | 2 |
| 4-1 (m2) | skirmish | 82-98 (90) | 12.5% | 12.5% hard | 0 |
| 4-2 (m2) | skirmish | 72-88 (80) | 17.5% | 17.5% hard | 0 |
| 4-3 (m2) | elite | 62-78 (70) | 20% | 32.5% hard | 1 |
| 4-4 (m2) | elite | 52-68 (60) | 12.5% | 15% hard | 1 |
| 5-4 (mw) | skirmish | 64-80 (72) | 97.5% | 97.5% easy | 1 |
| 5-5 (mw) | elite | 58-74 (66) | 100% | 82.5% easy | 1 |
| 5-6 (mw) | elite | 52-68 (60) | 97.5% | 90% easy | 3 |
| 5-7 (mw) | boss | 30-49 (40) | 90% | 80% easy | 3 |
| 5-A-1 (ms) | skirmish | 82-98 (90) | 100% | 100% easy | 1 |
| 5-A-2 (ms) | skirmish | 57-73 (65) | 95% | 95% easy | 1 |
| 5-A-3 (ms) | skirmish | 52-68 (60) | 100% | 100% easy | 0 |
| 5-A-4 (ms) | boss | 30-49 (40) | 97.5% | 100% easy | 1 |
| 6-2 (m8) | skirmish | 77-93 (85) | 97.5% | 97.5% easy | 0 |
| 6-3 (m8) | skirmish | 72-88 (80) | 92.5% | 92.5% easy | 0 |
| 6-4 (m8) | skirmish | 67-83 (75) | 92.5% | 92.5% easy | 0 |
| 6-5 (m8) | elite | 62-78 (70) | 60% | 60% hard | 0 |
| 6-6 (m8) | elite | 57-73 (65) | 80% | 55% hard | 2 |
| 6-7 (m8) | elite | 52-68 (60) | 20% | 47.5% hard | 2 |
| 7-A-4 (mz) | elite | 52-68 (60) | 40% | 45% hard | 1 |
| 7-A-5 (mz) | boss | 30-49 (40) | 12.5% | 27.5% hard | 2 |
| 8-3 (m4) | skirmish | 72-88 (80) | 65% | 65% hard | 0 |
| 8-7 (m4) | elite | 52-68 (60) | 42.5% | 40% hard | 1 |
| 8-8 (m4) | miniboss | 30-49 (40) | 95% | 92.5% easy | 1 |
| 8-A-2 (mn) | skirmish | 67-83 (75) | 97.5% | 92.5% easy | 1 |
| 8-A-4 (mn) | boss | 30-49 (40) | 65% | 67.5% easy | 1 |
| 9-4 (mk) | skirmish | 54-70 (62) | 32.5% | 37.5% hard | 1 |
| 9-7 (mk) | miniboss | 30-49 (40) | 52.5% | 50% easy | 1 |
| 10-1 (m7) | skirmish | 82-98 (90) | 60% | 65% hard | 2 |
| 10-2 (m7) | skirmish | 77.7-93.7 (85.7) | 57.5% | 65% hard | 4 |
| 10-3 (m7) | skirmish | 73.4-89.4 (81.4) | 52.5% | 70% hard | 2 |
| 10-9 (m7) | boss | 30-49 (40) | 62.5% | 62.5% easy | 0 |
| 10-A-1 (mj) | skirmish | 82-98 (90) | 100% | 100% easy | 1 |
| 11-2 (m10) | skirmish | 78.3-94.3 (86.3) | 22.5% | 37.5% hard | 1 |
| 11-3 (m10) | skirmish | 74.5-90.5 (82.5) | 30% | 30% hard | 0 |
| 11-4 (m10) | skirmish | 70.8-86.8 (78.8) | 42.5% | 37.5% hard | 3 |
| 11-5 (m10) | elite | 67-83 (75) | 27.5% | 27.5% hard | 0 |
| 11-6 (m10) | elite | 63.3-79.3 (71.3) | 17.5% | 60% hard | 3 |
| 11-7 (m10) | elite | 59.5-75.5 (67.5) | 5% | 57.5% hard | 3 |
| 11-8 (m10) | elite | 55.8-71.8 (63.8) | 25% | 27.5% hard | 1 |
| 11-10 (m10) | miniboss | 30-49 (40) | 17.5% | 17.5% hard | 0 |
| 11-A-2 (mv) | skirmish | 67-83 (75) | 37.5% | 35% hard | 1 |
| 12-1 (mh) | skirmish | 82-98 (90) | 80% | 77.5% hard | 1 |
| 12-2 (mh) | skirmish | 76-92 (84) | 47.5% | 47.5% hard | 0 |
| 12-6 (mh) | elite | 52-68 (60) | 85% | 70% easy | 1 |
| 12-7 (mh) | miniboss | 30-49 (40) | 90% | 75% easy | 2 |
| 13-6 (mr) | elite | 57-73 (65) | 77.5% | 77.5% easy | 2 |
| 13-8 (mr) | miniboss | 30-49 (40) | 80% | 75% easy | 3 |
| 14-2 (m5) | skirmish | 77-93 (85) | 67.5% | 72.5% hard | 1 |
| 14-5 (m5) | elite | 62-78 (70) | 30% | 42.5% hard | 3 |
| 14-6 (m5) | elite | 57-73 (65) | 37.5% | 45% hard | 4 |
| 14-7 (m5) | elite | 52-68 (60) | 47.5% | 45% hard | 1 |
| 14-A-3 (my) | skirmish | 62-78 (70) | 55% | 52.5% hard | 1 |
| 14-A-4 (my) | elite | 52-68 (60) | 92.5% | 87.5% easy | 3 |
| 14-A-5 (my) | boss | 30-49 (40) | 90% | 67.5% easy | 3 |
| 15-1 (ml) | skirmish | 82-98 (90) | 100% | 100% easy | 1 |
| 15-6 (ml) | elite | 52-68 (60) | 50% | 77.5% easy | 2 |
| 15-7 (ml) | boss | 30-49 (40) | 62.5% | 52.5% easy | 1 |
| 16-3 (mt) | skirmish | 60-76 (68) | 87.5% | 87.5% easy | 0 |
| 16-5 (mt) | elite | 58-74 (66) | 87.5% | 77.5% easy | 2 |
| 16-7 (mt) | miniboss | 30-49 (40) | 97.5% | 97.5% easy | 0 |
| 17-6 (m6) | elite | 57-73 (65) | 50% | 52.5% hard | 1 |
| 17-7 (m6) | elite | 52-68 (60) | 87.5% | 50% hard | 2 |
| 18-2 (md) | skirmish | 76-92 (84) | 100% | 92.5% easy | 2 |
| 18-3 (md) | skirmish | 70-86 (78) | 97.5% | 97.5% easy | 0 |
| 18-4 (md) | skirmish | 54-70 (62) | 72.5% | 72.5% easy | 0 |
| 18-5 (md) | elite | 58-74 (66) | 80% | 85% easy | 1 |
| 18-6 (md) | elite | 52-68 (60) | 75% | 85% easy | 1 |
| 18-7 (md) | miniboss | 30-49 (40) | 85% | 82.5% easy | 3 |
| 18-A-3 (mpd) | skirmish | 63.4-79.4 (71.4) | 100% | 85% easy | 1 |
| 18-A-6 (mpd) | skirmish | 60.6-76.6 (68.6) | 82.5% | 82.5% easy | 0 |
| 18-A-9 (mpd) | boss | 30-49 (40) | 72.5% | 62.5% easy | 1 |
| 19-2 (m3) | skirmish | 74.5-90.5 (82.5) | 97.5% | 95% easy | 1 |
| 19-3 (m3) | elite | 67-83 (75) | 32.5% | 32.5% hard | 0 |
| 19-6 (m3) | miniboss | 30-49 (40) | 90% | 85% easy | 4 |
| 19-A-4 (m9) | skirmish | 70.8-86.8 (78.8) | 100% | 95% easy | 1 |
| 20-2 (m11) | skirmish | 77.7-93.7 (85.7) | 62.5% | 62.5% hard | 1 |
| 20-3 (m11) | skirmish | 73.4-89.4 (81.4) | 65% | 65% hard | 1 |
| 20-6 (m11) | elite | 60.6-76.6 (68.6) | 5% | 17.5% hard | 2 |
| 20-7 (m11) | elite | 56.3-72.3 (64.3) | 85% | 55% hard | 1 |
| 20-8 (m11) | elite | 52-68 (60) | 5% | 40% hard | 2 |
| 20-9 (m11) | boss | 42-58 (50) | 22.5% | 37.5% hard | 1 |
| 20-A-2 (me) | elite | 73.3-89.3 (81.3) | 92.5% | 67.5% hard | 1 |
| 20-A-3 (me) | elite | 66.6-82.6 (74.6) | 90% | 65% hard | 1 |
| 20-A-4 (me) | dungeon | 26.2-44.3 (35.5) | 80% | 65% easy | 1 |
| 20-A-7 (me) | elite | 47.4-63.4 (55.4) | 92.5% | 80% easy | 1 |

## Every tuned fight

| fight | kind | target | before | after | verdict after | moves |
|---|---|---|---|---|---|---|
| 0-2 (m1) | skirmish | 75 | 87.5% | 87.5% | easy | none found |
| 0-3 (m1) | skirmish | 60 | 45% | 45% | hard | none found |
| 0-4 (m1) | skirmish | 45 | 60% | 60% | easy | none found |
| 0-B-1 (mo) | skirmish | 90 | 100% | 100% | easy | pond-trout→cottontail ×3 |
| 0-B-3 (mo) | skirmish | 60 | 97.5% | 92.5% | easy | burrow-rabbit→cottontail ×4 |
| 0-B-4 (mo) | boss | 40 | 82.5% | 70% | easy | glacier-wolf-pack→duckling ×2; otter-paddler→pond-duck ×2; trash-panda-trickster→silver-minnow ×2 |
| 1-A-1 (mq) | skirmish | 90 | 75% | 90% | green | harvest-mouse→burrow-rabbit ×2 |
| 1-A-2 (mq) | skirmish | 80 | 90% | 67.5% | hard | bee-forager→house-cat ×4 |
| 1-A-3 (mq) | skirmish | 70 | 85% | 65% | green | field-mouse→village-miller ×2; acorn-chipmunk→harvest-mouse ×2; meadow-frog→harvest-mouse ×1 |
| 1-A-4 (mq) | skirmish | 60 | 77.5% | 67.5% | green | honey-bee→house-cat ×2; field-vole→house-cat ×1 |
| 1-A-5 (mq) | boss | 40 | 85% | 85% | easy | acorn-chipmunk→house-cat ×2; cottontail→house-cat ×1 |
| 2-1 (mb) | skirmish | 90 | 70% | 70% | hard | none found |
| 2-2 (mb) | skirmish | 80 | 65% | 70% | hard | pincushion-urchin→conch-crawler ×4; open-ocean-hermit-crab→pincushion-urchin ×3 |
| 2-3 (mb) | skirmish | 70 | 17.5% | 57.5% | hard | driftwood-crab→conch-crawler ×3; conch-herald→conch-crawler ×1; open-ocean-hermit-crab→pincushion-urchin ×2 |
| 2-4 (mb) | skirmish | 60 | 35% | 35% | hard | none found |
| 2-5 (mb) | elite | 40 | 10% | 7.5% | hard | sea-turtle-elder→conch-crawler ×2 |
| 2-A-1 (mp) | skirmish | 90 | 60% | 60% | hard | none found |
| 2-A-2 (mp) | skirmish | 84 | 57.5% | 57.5% | hard | none found |
| 2-A-3 (mp) | skirmish | 78 | 67.5% | 67.5% | hard | none found |
| 2-A-4 (mp) | skirmish | 72 | 97.5% | 85% | easy | minnow-skitter→shallows-fry ×2; guppy→beaver-builder ×3 |
| 2-A-5 (mp) | elite | 66 | 25% | 47.5% | hard | shallows-fry→guppy ×1; fiddler-crab-swarm→guppy ×2; guppy→duckling ×2; guppy→elder-tortoise ×1 |
| 2-B-2 (mg) | elite | 75 | 95% | 87.5% | easy | gull-thief→sulfur-vent-crab ×3; trash-panda-trickster→mayfly-dancer ×4; sulfur-vent-crab→trash-panda-trickster ×3 |
| 2-B-3 (mg) | elite | 60 | 80% | 85% | easy | trash-panda-trickster→sulfur-vent-crab ×2; fiddler-crab-swarm→tidepool-trapper-crab ×2 |
| 2-B-4 (mg) | elite | 40 | 97.5% | 97.5% | easy | open-ocean-hermit-crab→sulfur-vent-crab ×2 |
| 3-3 (mc) | skirmish | 78 | 95% | 72.5% | green | kittiwake-flock→fulmar-spitter ×3 |
| 3-5 (mc) | elite | 66 | 75% | 77.5% | easy | razorbill→mountain-goat-climber ×2 |
| 3-6 (mc) | elite | 60 | 85% | 77.5% | easy | kittiwake-flock→razorbill ×2; peak-condor→fulmar-spitter ×2 |
| 3-7 (mc) | elite | 40 | 80% | 72.5% | easy | mountain-goat-climber→fulmar-spitter ×2; red-billed-chough→golden-eagle-diver ×2 |
| 4-1 (m2) | skirmish | 90 | 12.5% | 12.5% | hard | none found |
| 4-2 (m2) | skirmish | 80 | 17.5% | 17.5% | hard | none found |
| 4-3 (m2) | elite | 70 | 20% | 32.5% | hard | pyrenean-desman→water-vole ×2 |
| 4-4 (m2) | elite | 60 | 12.5% | 15% | hard | snapstick-turtle→water-vole ×2 |
| 5-2 (mw) | skirmish | 84 | 100% | 85% | green | caiman-hatchling→bog-leech ×2 |
| 5-4 (mw) | skirmish | 72 | 97.5% | 97.5% | easy | caiman-hatchling→moat-snapper ×4 |
| 5-5 (mw) | elite | 66 | 100% | 82.5% | easy | venomlord-serpent→bog-leech ×2 |
| 5-6 (mw) | elite | 60 | 97.5% | 90% | easy | venomlord-serpent→bog-leech ×2; venomlord-serpent→bog-leech ×2; snapper-hatchling→raft-spider ×2 |
| 5-7 (mw) | boss | 40 | 90% | 80% | easy | constrictor-coil→alligator-gar ×2; snapper-hatchling→bog-leech ×2; snapper-hatchling→bog-leech ×2 |
| 5-A-1 (ms) | skirmish | 90 | 100% | 100% | easy | caiman-hatchling→baby-horned-capybara ×3 |
| 5-A-2 (ms) | skirmish | 65 | 95% | 95% | easy | snapper-hatchling→bog-leech ×1 |
| 5-A-3 (ms) | skirmish | 60 | 100% | 100% | easy | none found |
| 5-A-4 (ms) | boss | 40 | 97.5% | 100% | easy | alligator-gar→baby-horned-capybara ×2 |
| 6-2 (m8) | skirmish | 85 | 97.5% | 97.5% | easy | none found |
| 6-3 (m8) | skirmish | 80 | 92.5% | 92.5% | easy | none found |
| 6-4 (m8) | skirmish | 75 | 92.5% | 92.5% | easy | none found |
| 6-5 (m8) | elite | 70 | 60% | 60% | hard | none found |
| 6-6 (m8) | elite | 65 | 80% | 55% | hard | constrictor-coil→raven-scout ×2; constrictor-coil→bogfire-newt ×2 |
| 6-7 (m8) | elite | 60 | 20% | 47.5% | hard | bogfire-newt→venomlord-serpent ×2; marsh-wisp→venomlord-serpent ×2 |
| 7-1 (mu) | skirmish | 90 | 75% | 90% | green | dung-beetle→bee-forager ×1; bee-forager→leafcutter-gardener ×2 |
| 7-4 (mu) | skirmish | 68 | 47.5% | 65% | green | leafcutter-gardener→compost-grub ×4 |
| 7-6 (mu) | miniboss | 40 | 2.5% | 37.5% | green | ant-warrior→compost-grub ×2; fungal-colossus→compost-grub ×2; fungal-colossus→hollow-oath-keeper ×1; trapdoor-spider→fungal-colossus ×2; fungal-colossus→hollow-oath-keeper ×2 |
| 7-A-3 (mz) | elite | 70 | 50% | 70% | green | wolf-spider-mother→garden-snail ×2 |
| 7-A-4 (mz) | elite | 60 | 40% | 45% | hard | compost-grub→swarm-matriarch ×1 |
| 7-A-5 (mz) | boss | 40 | 12.5% | 27.5% | hard | swarm-matriarch→garden-snail ×2; tunnel-ant→garden-snail ×2 |
| 8-1 (m4) | skirmish | 90 | 80% | 82.5% | green | stalactite-golem→quarry-mole ×2 |
| 8-2 (m4) | skirmish | 85 | 72.5% | 85% | green | vampire-bat→cave-olm ×3 |
| 8-3 (m4) | skirmish | 80 | 65% | 65% | hard | none found |
| 8-5 (m4) | skirmish | 60 | 45% | 52.5% | green | sulfur-cinder-moth→blind-cave-fish ×1 |
| 8-6 (m4) | skirmish | 65 | 90% | 65% | green | blind-cave-fish→sulfur-cinder-moth ×4; subterraneaner→vampire-bat ×1; subterraneaner→whip-spider ×1 |
| 8-7 (m4) | elite | 60 | 42.5% | 40% | hard | blind-cave-fish→giant-cave-huntsman ×2 |
| 8-8 (m4) | miniboss | 40 | 95% | 92.5% | easy | whip-spider→sulfur-cinder-moth ×2 |
| 8-A-1 (mn) | skirmish | 90 | 100% | 95% | green | blind-cave-fish→vampire-bat ×2 |
| 8-A-2 (mn) | skirmish | 75 | 97.5% | 92.5% | easy | cave-cricket→beetle-grunt ×4 |
| 8-A-4 (mn) | boss | 40 | 65% | 67.5% | easy | cave-bat-swarm→vampire-bat ×2 |
| 9-1 (mk) | skirmish | 90 | 80% | 82.5% | green | reef-shark→mangrove-monitor ×2; reef-shark→mangrove-monitor ×1 |
| 9-3 (mk) | skirmish | 78 | 42.5% | 82.5% | green | archerfish→minnow-skitter ×2; archerfish→reef-shark ×2 |
| 9-4 (mk) | skirmish | 62 | 32.5% | 37.5% | hard | reef-shark→minnow-skitter ×2 |
| 9-5 (mk) | elite | 66 | 55% | 67.5% | green | minnow-skitter→reef-shark ×2 |
| 9-7 (mk) | miniboss | 40 | 52.5% | 50% | easy | sunbittern-strider→mangrove-monitor ×2 |
| 10-1 (m7) | skirmish | 90 | 60% | 65% | hard | coral-reef-shark→orca-vanguard ×1; coral-reef-shark→lions-mane-jelly ×1 |
| 10-2 (m7) | skirmish | 86 | 57.5% | 65% | hard | parrotfish→kraken-spawnling ×1; clownfish-scout→kraken-spawnling ×2; clownfish-scout→kraken-spawnling ×1; clownfish-scout→electric-ray ×2 |
| 10-3 (m7) | skirmish | 81 | 52.5% | 70% | hard | parrotfish→clownfish-scout ×4; electric-ray→kraken-spawnling ×3 |
| 10-4 (m7) | skirmish | 77 | 62.5% | 80% | green | electric-ray→orca-vanguard ×2; electric-ray→orca-vanguard ×1; clownfish-scout→orca-vanguard ×1 |
| 10-5 (m7) | skirmish | 73 | 50% | 67.5% | green | crown-of-thorns-star→orca-vanguard ×2; crown-of-thorns-star→orca-vanguard ×2 |
| 10-7 (m7) | elite | 64 | 45% | 57.5% | green | parrotfish→orca-vanguard ×2; swordfish-spearman→orca-vanguard ×2 |
| 10-8 (m7) | elite | 60 | 35% | 57.5% | green | parrotfish→orca-vanguard ×2; great-barracuda→orca-vanguard ×2 |
| 10-9 (m7) | boss | 40 | 62.5% | 62.5% | easy | none found |
| 10-A-1 (mj) | skirmish | 90 | 100% | 100% | easy | kraken-spawnling→abyss-lantern-squid ×2 |
| 10-A-3 (mj) | skirmish | 70 | 80% | 65% | green | sulfur-vent-crab→parrotfish ×3 |
| 11-2 (m10) | skirmish | 86 | 22.5% | 37.5% | hard | seed-cache-squirrel→chipmunk-hoarder ×2 |
| 11-3 (m10) | skirmish | 83 | 30% | 30% | hard | none found |
| 11-4 (m10) | skirmish | 79 | 42.5% | 37.5% | hard | eyrie-warden→seed-cache-squirrel ×2; alpine-marmot→eyrie-warden ×1; mountain-hare→eyrie-warden ×1 |
| 11-5 (m10) | elite | 75 | 27.5% | 27.5% | hard | none found |
| 11-6 (m10) | elite | 71 | 17.5% | 60% | hard | balloon-archer→eyrie-warden ×2; balloon-archer→chipmunk-hoarder ×1; eyrie-warden→chipmunk-hoarder ×2 |
| 11-7 (m10) | elite | 68 | 5% | 57.5% | hard | eagle-owl-quartermaster→chipmunk-hoarder ×2; seed-cache-squirrel→chipmunk-hoarder ×2; seed-cache-squirrel→mountain-goat-climber ×2 |
| 11-8 (m10) | elite | 64 | 25% | 27.5% | hard | owl-nightwatch→seed-cache-squirrel ×1 |
| 11-10 (m10) | miniboss | 40 | 17.5% | 17.5% | hard | none found |
| 11-A-1 (mv) | skirmish | 80 | 62.5% | 82.5% | green | eagle-owl-quartermaster→eyrie-warden ×3 |
| 11-A-2 (mv) | skirmish | 75 | 37.5% | 35% | hard | chipmunk-hoarder→eyrie-warden ×2 |
| 11-A-3 (mv) | skirmish | 60 | 32.5% | 65% | green | eagle-owl-quartermaster→eyrie-warden ×1; eagle-owl-quartermaster→alpine-avalanche ×2; alpine-avalanche→rockslide-ram ×2 |
| 11-A-4 (mv) | boss | 40 | 17.5% | 42.5% | green | eagle-owl-quartermaster→eyrie-warden ×2; eyrie-warden→alpine-avalanche ×2 |
| 12-1 (mh) | skirmish | 90 | 80% | 77.5% | hard | seed-cache-squirrel→gatling-hog ×1 |
| 12-2 (mh) | skirmish | 84 | 47.5% | 47.5% | hard | none found |
| 12-4 (mh) | skirmish | 72 | 57.5% | 67.5% | green | cunning-vixen→mouse-sapper ×3 |
| 12-5 (mh) | elite | 66 | 77.5% | 67.5% | green | seed-cache-squirrel→gatling-hog ×2 |
| 12-6 (mh) | elite | 60 | 85% | 70% | easy | seed-cache-squirrel→gatling-hog ×1 |
| 12-7 (mh) | miniboss | 40 | 90% | 75% | easy | mouse-sapper→seed-cache-squirrel ×3; field-mouse→gatling-hog ×1 |
| 13-1 (mr) | skirmish | 90 | 75% | 82.5% | green | swift-fox→grizzly-vanguard ×4 |
| 13-2 (mr) | skirmish | 85 | 67.5% | 87.5% | green | bramblewood-lynx→swift-fox ×3 |
| 13-3 (mr) | skirmish | 80 | 60% | 85% | green | swift-fox→berserker-boar ×3; fox-kit→swift-fox ×4; fawn-scout→berserker-boar ×1 |
| 13-6 (mr) | elite | 65 | 77.5% | 77.5% | easy | berserker-boar→fox-kit ×2; swift-fox→tasmanian-devil ×2 |
| 13-8 (mr) | miniboss | 40 | 80% | 75% | easy | grizzly-vanguard→woodpecker-sapper ×2; berserker-boar→bramblewood-lynx ×1; swift-fox→woodpecker-sapper ×2 |
| 14-2 (m5) | skirmish | 85 | 67.5% | 72.5% | hard | hoopoe-herald→termite-mound ×1 |
| 14-3 (m5) | skirmish | 80 | 62.5% | 80% | green | dust-hyena→termite-mound ×2 |
| 14-5 (m5) | elite | 70 | 30% | 42.5% | hard | weaver-bird→marula-elephant ×2; spitting-cobra→pangolin-roller ×1; spitting-cobra→springbok-pronker ×1 |
| 14-6 (m5) | elite | 65 | 37.5% | 45% | hard | springbok-pronker→termite-mound ×1; marula-elephant→pangolin-roller ×2; hoopoe-herald→marula-elephant ×2; termite-mound→marula-elephant ×1 |
| 14-7 (m5) | elite | 60 | 47.5% | 45% | hard | dust-hyena→hoopoe-herald ×2 |
| 14-A-2 (my) | skirmish | 80 | 100% | 85% | green | termite-mound→siege-rhino ×3; toucan-courier→bramblewood-macaque ×2 |
| 14-A-3 (my) | skirmish | 70 | 55% | 52.5% | hard | aye-aye-prowler→termite-mound ×1 |
| 14-A-4 (my) | elite | 60 | 92.5% | 87.5% | easy | ancient-sloth-titan→siege-rhino ×2; toucan-courier→bramblewood-macaque ×2; aye-aye-prowler→dust-hyena ×2 |
| 14-A-5 (my) | boss | 40 | 90% | 67.5% | easy | aye-aye-prowler→weaver-bird ×3; termite-mound→siege-rhino ×2; howler-monkey→bramblewood-macaque ×2 |
| 15-1 (ml) | skirmish | 90 | 100% | 100% | easy | pronghorn-racer→raccoon-bandit ×2 |
| 15-5 (ml) | elite | 66 | 52.5% | 70% | green | stable-colt→pronghorn-racer ×4 |
| 15-6 (ml) | elite | 60 | 50% | 77.5% | easy | raccoon-bandit→pronghorn-racer ×2; stable-colt→pronghorn-racer ×2 |
| 15-7 (ml) | boss | 40 | 62.5% | 52.5% | easy | border-collie→stable-colt ×1 |
| 16-3 (mt) | skirmish | 68 | 87.5% | 87.5% | easy | none found |
| 16-5 (mt) | elite | 66 | 87.5% | 77.5% | easy | snowshoe-hare→frost-hare-sprinter ×1; frost-hare-sprinter→trickster-fox ×4 |
| 16-7 (mt) | miniboss | 40 | 97.5% | 97.5% | easy | none found |
| 17-2 (m6) | skirmish | 85 | 67.5% | 90% | green | snow-bunting-archer→glacial-ape-king ×2; snow-ermine→harbor-seal ×4 |
| 17-3 (m6) | skirmish | 80 | 62.5% | 82.5% | green | snow-bunting-archer→harbor-seal ×2 |
| 17-5 (m6) | elite | 70 | 57.5% | 67.5% | green | ravenous-wolverine→glacial-ape-king ×2 |
| 17-6 (m6) | elite | 65 | 50% | 52.5% | hard | snow-ermine→glacial-ape-king ×1 |
| 17-7 (m6) | elite | 60 | 87.5% | 50% | hard | harbor-seal→snow-ermine ×2; harbor-seal→walrus-icebreaker ×1 |
| 17-A-2 (mi) | skirmish | 75 | 65% | 67.5% | green | frost-hare-sprinter→harbor-seal ×4 |
| 17-A-3 (mi) | skirmish | 60 | 22.5% | 60% | green | lemming-swarm→glacial-ape-king ×1; krill-swarm→harbor-seal ×3; lemming-swarm→harbor-seal ×1 |
| 18-2 (md) | skirmish | 84 | 100% | 92.5% | easy | fennec-fox→dromedary ×3; thorny-devil→roadrunner-courier ×3 |
| 18-3 (md) | skirmish | 78 | 97.5% | 97.5% | easy | none found |
| 18-4 (md) | skirmish | 62 | 72.5% | 72.5% | easy | none found |
| 18-5 (md) | elite | 66 | 80% | 85% | easy | roadrunner-courier→sandfish ×2 |
| 18-6 (md) | elite | 60 | 75% | 85% | easy | sandfish→sand-widow ×2 |
| 18-7 (md) | miniboss | 40 | 85% | 82.5% | easy | caustic-scorpion→dromedary ×2; roadrunner-courier→fennec-fox ×2; fennec-fox→roadrunner-courier ×2 |
| 18-A-3 (mpd) | skirmish | 71 | 100% | 85% | easy | sand-widow→fennec-fox ×2 |
| 18-A-4 (mpd) | skirmish | 77 | 97.5% | 75% | green | meerkat-sentry→stonedrop-vulture ×4; meerkat-burrower→dust-hyena ×2 |
| 18-A-6 (mpd) | skirmish | 69 | 82.5% | 82.5% | easy | none found |
| 18-A-7 (mpd) | skirmish | 64 | 92.5% | 57.5% | green | cinder-gecko→stonedrop-vulture ×4 |
| 18-A-9 (mpd) | boss | 40 | 72.5% | 62.5% | easy | dust-hyena→stonedrop-vulture ×4 |
| 19-1 (m3) | skirmish | 90 | 80% | 85% | green | porcupine-roller→magma-titan ×2 |
| 19-2 (m3) | skirmish | 83 | 97.5% | 95% | easy | phoenix-fledgling→quill-volley ×2 |
| 19-3 (m3) | elite | 75 | 32.5% | 32.5% | hard | none found |
| 19-4 (m3) | elite | 68 | 30% | 70% | green | fire-salamander→yeti ×2; quill-volley→yeti ×2 |
| 19-5 (m3) | elite | 60 | 37.5% | 62.5% | green | fire-salamander→magma-titan ×3; quill-volley→magma-titan ×1 |
| 19-6 (m3) | miniboss | 40 | 90% | 85% | easy | magma-titan→phoenix-fledgling ×2; magma-titan→porcupine-roller ×1; magma-titan→quill-volley ×1; phoenix-fledgling→glacier-wolf-pack ×2 |
| 19-A-2 (m9) | skirmish | 86 | 67.5% | 80% | green | obsidian-scorpion→chained-binturong ×2 |
| 19-A-3 (m9) | skirmish | 73 | 85% | 77.5% | green | magma-titan→tide-spirit ×1 |
| 19-A-4 (m9) | skirmish | 79 | 100% | 95% | easy | sulfur-vent-crab→tide-spirit ×3 |
| 19-A-7 (m9) | elite | 68 | 80% | 62.5% | green | quill-volley→tide-spirit ×2; vampire-finch→tide-spirit ×1 |
| 20-2 (m11) | skirmish | 86 | 62.5% | 62.5% | hard | magma-salamander→cave-warlord ×1 |
| 20-3 (m11) | skirmish | 81 | 65% | 65% | hard | bear-cub→cave-warlord ×2 |
| 20-4 (m11) | skirmish | 67 | 85% | 70% | green | pack-mule→magma-salamander ×3; cinder-skeleton→magma-wraith ×2 |
| 20-6 (m11) | elite | 69 | 5% | 17.5% | hard | woodland-brawler→cave-warlord ×2; ashbone-ghoul→cave-warlord ×2 |
| 20-7 (m11) | elite | 64 | 85% | 55% | hard | cinder-skeleton→magma-salamander ×2 |
| 20-8 (m11) | elite | 60 | 5% | 40% | hard | magma-salamander→cave-warlord ×2; woodland-brawler→cave-warlord ×2 |
| 20-9 (m11) | boss | 50 | 22.5% | 37.5% | hard | magma-salamander→cave-warlord ×2 |
| 20-A-2 (me) | elite | 81 | 92.5% | 67.5% | hard | blessed-avatar→magma-salamander ×2 |
| 20-A-3 (me) | elite | 75 | 90% | 65% | hard | cinder-imp→magma-salamander ×2 |
| 20-A-4 (me) | dungeon | 36 | 80% | 65% | easy | cinder-skeleton→cinder-stoker ×2 |
| 20-A-5 (me) | elite | 68 | 97.5% | 75% | green | cinder-imp→magma-salamander ×2; blessed-avatar→magma-salamander ×1; blessed-avatar→sulfur-vent-crab ×2 |
| 20-A-6 (me) | elite | 62 | 100% | 67.5% | green | cinder-imp→cinder-gecko ×2; gorge-wyrm→magma-salamander ×2; blessed-avatar→fumarole-ibex ×2 |
| 20-A-7 (me) | elite | 55 | 92.5% | 80% | easy | pack-mule→magma-salamander ×2 |
