# Focused decks: Map 11 The Aerie Vault (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,anvil-thrush,apollo-butterfly,blue-ringed-octopus,chamois-leaper,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,grave-grin-hyena,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,sparrow-chick,stoat-cutthroat,stonedrop-vulture,swamp-alligator,the-gannet-queen,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor anvil-thrush,apollo-butterfly,chamois-leaper,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,peak-condor,peregrine-stooper,sparrow-chick,swamp-alligator,the-gannet-queen --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8876 games in 304 s.

- The list (25): Alpine Marmot, Anvil Thrush, Apollo Butterfly, Blue-ringed Octopus, Chamois Leaper, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Grave-Grin Hyena, Ibex Rockcaller, Mountain Hare, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver, Sparrow Chick, Stoat Cutthroat, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | economy (4 resource makers); flying x15; ranged x8 | 92% (88%-96%) | 0.4 | 0: 12, 1: 8 | 4x Dust Hyena, 4x Gale Swift, 4x Peak Condor, 4x Stonedrop Vulture, 3x Apollo Butterfly, 1x Alpine Marmot | 13 |
| 2 | open | flying x13; ranged x7 | 88% (83%-92%) | 0.85 | 0: 3, 1: 17 | 4x Chamois Leaper, 4x Stonedrop Vulture, 3x Anvil Thrush, 3x Peak Condor, 3x Puffin Diver, 3x Stoat Cutthroat | 0 |
| 3 | family:strike-first | flying x15; strike-first x10 | 86% (81%-91%) | 1.05 | 0: 3, 1: 13, 2: 4 | 4x Golden Eagle Diver, 4x Stonedrop Vulture, 4x The Gannet Queen, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Chamois Leaper | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); flying x11 | 82% (77%-87%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Pika Hoarder, 3x Stonedrop Vulture, 2x Grave-Grin Hyena | 17 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 96% | 92% | 100% | 100% | 75% | 92% |
| 2 open | 79% | 96% | 92% | 88% | 96% | 79% | 83% |
| 3 family:strike-first | 92% | 100% | 96% | 88% | 96% | 58% | 71% |
| 4 big | 92% | 94% | 96% | 71% | 100% | 67% | 54% |
