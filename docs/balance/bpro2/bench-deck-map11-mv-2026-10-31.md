# Focused decks: Map 11 The Aerie Vault (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,ibex-rockcaller,swamp-alligator,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7056 games in 97 s.

- The list (14): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Ibex Rockcaller, Swamp Alligator, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); flying x13 | 83% (78%-88%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Gale Swift, 3x Apollo Butterfly, 3x Chipmunk Hoarder, 3x Eagle-Owl Quartermaster, 3x Golden Eagle Diver | 11 |
| 2 | open | flying x11 | 82% (76%-87%) | 0.8 | 0: 4, 1: 16 | 4x Alpine Salamander, 4x Apollo Butterfly, 4x Golden Eagle Diver, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 0 |
| 3 | family:flying | flying x15; strike-first x8 | 80% (75%-86%) | 0.35 | 0: 13, 1: 7 | 4x Alpine Swift, 4x Gale Swift, 4x Golden Eagle Diver, 3x Apollo Butterfly, 3x Wound Reaver, 2x Alpine Marmot | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); flying x15 | 62% (55%-68%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Apollo Butterfly, 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 1x Alpine Marmot | 13 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 83% | 96% | 100% | 71% | 100% | 38% | 92% |
| 2 open | 75% | 92% | 83% | 83% | 100% | 50% | 88% |
| 3 family:flying | 79% | 92% | 83% | 71% | 96% | 46% | 96% |
| 4 big | 58% | 67% | 75% | 50% | 88% | 13% | 83% |
