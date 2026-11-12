# Focused decks: Map 5 The Sunken Grove (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool anhinga-spearbird,bog-leech,cypress-root-lurker,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6496 games in 141 s.

- The list (10): Anhinga Spearbird, Bog Leech, Cypress Root Lurker, Mudflat Godwit, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Peat-cutter Vole, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber) | 77% (71%-82%) | 0.3 | 0: 14, 1: 6 | 4x Bog Leech, 4x Mudflat Godwit, 4x Newt Doctor, 3x Nutria Reedcutter, 3x Peat-cutter Vole, 2x Cypress Root Lurker | 10 |
| 2 | big | big (8 copies at 2+ Lumber, average 1.1); armor x7 | 58% (52%-65%) | 1.05 | 0: 8, 1: 4, 2: 7, 3: 1 | 4x Mudflat Godwit, 4x Nutria Reedcutter, 4x Peat-cutter Vole, 4x Swamp Alligator, 3x Old Snapjaw, 1x Venomlord Serpent | 11 |
| 3 | open | guard x8 | 53% (47%-59%) | 1.1 | 0: 9, 1: 4, 2: 3, 3: 4 | 4x Cypress Root Lurker, 4x Newt Doctor, 4x Nutria Reedcutter, 4x Venomlord Serpent, 3x Old Snapjaw, 1x Peat-cutter Vole | 0 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 96% | 88% | 75% | 92% | 33% | 58% |
| 2 big | 100% | 92% | 58% | 38% | 63% | 25% | 33% |
| 3 open | 96% | 58% | 63% | 25% | 71% | 4% | 54% |
