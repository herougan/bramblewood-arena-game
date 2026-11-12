# Focused decks: Map 11 The Aerie Vault (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-swift,apollo-butterfly,blue-ringed-octopus,chamois-leaper,chipmunk-hoarder,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,grave-grin-hyena,great-horned-owl,hoopoe-herald,ibex-rockcaller,mountain-hare,peregrine-stooper,pika-hoarder,sparrow-chick,stoat-cutthroat,stonedrop-vulture,swamp-alligator,the-gannet-queen,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,great-horned-owl,sparrow-chick,swamp-alligator,the-gannet-queen,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8610 games in 179 s.

- The list (24): Alpine Marmot, Alpine Swift, Apollo Butterfly, Blue-ringed Octopus, Chamois Leaper, Chipmunk Hoarder, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Grave-Grin Hyena, Great Horned Owl, Hoopoe Herald, Ibex Rockcaller, Mountain Hare, Peregrine Stooper, Pika Hoarder, Sparrow Chick, Stoat Cutthroat, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x8 | 91% (87%-95%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Great Horned Owl, 4x Stonedrop Vulture, 3x Alpine Marmot, 3x Chipmunk Hoarder, 3x Hoopoe Herald, 3x Wound Reaver | 13 |
| 2 | open | flying x14; ranged x6 | 89% (85%-93%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Apollo Butterfly, 4x Great Horned Owl, 3x Eagle-Owl Quartermaster, 3x Pika Hoarder, 3x Stonedrop Vulture, 3x Wolf Spider Mother | 0 |
| 3 | family:strike-first | strike-first x17; flying x13 | 83% (77%-88%) | 0.9 | 0: 4, 1: 14, 2: 2 | 4x Alpine Swift, 4x Chamois Leaper, 4x Peregrine Stooper, 3x Stoat Cutthroat, 3x Stonedrop Vulture, 2x The Gannet Queen | 17 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); flying x7 | 79% (74%-85%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Great Horned Owl, 4x Pika Hoarder, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 3x Stoat Cutthroat, 2x Wound Reaver | 10 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 96% | 100% | 100% | 100% | 83% | 67% |
| 2 open | 88% | 96% | 96% | 100% | 100% | 58% | 85% |
| 3 family:strike-first | 79% | 71% | 96% | 88% | 96% | 75% | 75% |
| 4 big | 83% | 100% | 71% | 96% | 96% | 46% | 63% |
