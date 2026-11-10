# Focused decks: Map 11 The Aerie Vault (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,great-horned-owl,hawk-arrowkeeper,ibex-rockcaller,red-billed-chough,swamp-alligator,the-gannet-queen,wound-reaver --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2422 games in 477 s.

- The list (16): Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Great Horned Owl, Hawk Arrowkeeper, Ibex Rockcaller, Red-billed Chough, Swamp Alligator, The Gannet Queen, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8 | 84% (79%-89%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Chamois Leaper, 4x Gale Swift, 4x Great Horned Owl, 3x Alpine Salamander, 3x Wound Reaver, 2x Ibex Rockcaller | 11 |
| 2 | family:strike-first | strike-first x8; flying x8 | 70% (64%-76%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Alpine Salamander, 4x Alpine Swift, 4x Gangrenous Leech, 4x The Gannet Queen, 2x Ibex Rockcaller, 2x Wound Reaver | 10 |
| 3 | open | strike-first x8; flying x6 | 66% (60%-72%) | 0.95 | 0: 5, 1: 11, 2: 4 | 4x Chamois Leaper, 4x Gangrenous Leech, 4x The Gannet Queen, 3x Chipmunk Hoarder, 3x Wound Reaver, 2x Gale Swift | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); flying x9; siege x8 | 59% (53%-65%) | 1.35 | 0: 5, 1: 7, 2: 4, 3: 4 | 4x Chipmunk Hoarder, 4x Eyrie Warden, 4x Gangrenous Leech, 4x Great Horned Owl, 3x Alpine Salamander, 1x Gale Swift | 12 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 83% | 92% | 100% | 83% | 100% | 63% | 67% |
| 2 family:strike-first | 79% | 79% | 96% | 63% | 96% | 42% | 38% |
| 3 open | 88% | 63% | 96% | 67% | 88% | 29% | 33% |
| 4 big | 79% | 67% | 100% | 50% | 77% | 13% | 29% |
