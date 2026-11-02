# Focused decks: Map 11 The Aerie Vault (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,ibex-rockcaller,swamp-alligator,vigil-owl,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6776 games in 103 s.

- The list (15): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Ibex Rockcaller, Swamp Alligator, Vigil Owl, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | strike-first x8; flying x7 | 86% (81%-91%) | 0.8 | 0: 4, 1: 16 | 4x Alpine Marmot, 4x Chamois Leaper, 4x Golden Eagle Diver, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 0 |
| 2 | family:flying | flying x11 | 85% (80%-91%) | 0.65 | 0: 7, 1: 13 | 4x Gale Swift, 4x Golden Eagle Diver, 3x Alpine Marmot, 3x Alpine Salamander, 3x Eagle-Owl Quartermaster, 3x Wound Reaver | 7 |
| 3 | swarm | swarm (14 copies at 0 Lumber); flying x12 | 78% (72%-84%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Apollo Butterfly, 4x Gale Swift, 4x Golden Eagle Diver, 2x Ibex Rockcaller, 2x Vigil Owl | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); flying x8 | 66% (59%-73%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Chipmunk Hoarder, 3x Wound Reaver, 2x Alpine Marmot | 15 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 88% | 88% | 88% | 83% | 96% | 67% | 96% |
| 2 family:flying | 92% | 92% | 77% | 75% | 100% | 71% | 92% |
| 3 swarm | 67% | 83% | 83% | 79% | 96% | 42% | 96% |
| 4 big | 63% | 79% | 46% | 63% | 92% | 38% | 83% |
