# Focused decks: Map 11 The Aerie Vault (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,anvil-thrush,blue-ringed-octopus,chamois-leaper,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,golden-eagle-diver,grave-grin-hyena,great-horned-owl,hoopoe-herald,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,sparrow-chick,stoat-cutthroat,stonedrop-vulture,swamp-alligator,the-gannet-queen,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor anvil-thrush,chamois-leaper,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,golden-eagle-diver,great-horned-owl,peak-condor,peregrine-stooper,sparrow-chick,swamp-alligator,the-gannet-queen,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8568 games in 129 s.

- The list (25): Alpine Marmot, Anvil Thrush, Blue-ringed Octopus, Chamois Leaper, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Golden Eagle Diver, Grave-Grin Hyena, Great Horned Owl, Hoopoe Herald, Ibex Rockcaller, Mountain Hare, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver, Sparrow Chick, Stoat Cutthroat, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | flying x13; strike-first x9 | 96% (94%-99%) | 0.8 | 0: 4, 1: 16 | 4x Grave-Grin Hyena, 4x Peak Condor, 4x Peregrine Stooper, 3x Stoat Cutthroat, 3x Stonedrop Vulture, 2x Golden Eagle Diver | 13 |
| 2 | family:flying | economy (4 resource makers); flying x13; ranged x9 | 92% (88%-96%) | 0.65 | 0: 7, 1: 13 | 4x Dust Hyena, 4x Golden Eagle Diver, 4x Peak Condor, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Stonedrop Vulture | 14 |
| 3 | open | flying x12; ranged x8 | 87% (82%-92%) | 0.55 | 0: 9, 1: 11 | 4x Peak Condor, 4x Sparrow Chick, 4x Stonedrop Vulture, 3x Chamois Leaper, 3x Pika Hoarder, 2x Hoopoe Herald | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.9); flying x6 | 83% (78%-88%) | 0.9 | 0: 10, 1: 2, 2: 8 | 4x Great Horned Owl, 4x Hoopoe Herald, 4x Pika Hoarder, 4x Swamp Alligator, 2x Alpine Marmot, 2x Peregrine Stooper | 15 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 96% | 100% | 100% | 96% | 100% | 92% | 92% |
| 2 family:flying | 92% | 88% | 96% | 92% | 100% | 83% | 92% |
| 3 open | 75% | 77% | 92% | 96% | 92% | 83% | 92% |
| 4 big | 83% | 92% | 96% | 88% | 100% | 67% | 54% |
