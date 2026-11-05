# Focused decks: Map 11 The Aerie Vault (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,ibex-rockcaller,swamp-alligator,vigil-owl,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6608 games in 140 s.

- The list (15): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Ibex Rockcaller, Swamp Alligator, Vigil Owl, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | strike-first x8; flying x7 | 92% (88%-96%) | 1 | 1: 20 | 4x Alpine Salamander, 4x Chamois Leaper, 4x Golden Eagle Diver, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 11 |
| 2 | family:flying | flying x8 | 91% (87%-95%) | 0.45 | 0: 11, 1: 9 | 4x Chipmunk Hoarder, 4x Gale Swift, 4x Golden Eagle Diver, 3x Alpine Marmot, 3x Wound Reaver, 2x Ibex Rockcaller | 15 |
| 3 | open | flying x7 | 88% (83%-92%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Alpine Salamander, 4x Apollo Butterfly, 4x Swamp Alligator, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Ibex Rockcaller | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); flying x11 | 82% (77%-87%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 11 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 96% | 100% | 92% | 100% | 100% | 79% | 75% |
| 2 family:flying | 96% | 92% | 96% | 100% | 100% | 63% | 92% |
| 3 open | 92% | 92% | 92% | 100% | 100% | 63% | 75% |
| 4 big | 92% | 88% | 92% | 96% | 96% | 58% | 54% |
