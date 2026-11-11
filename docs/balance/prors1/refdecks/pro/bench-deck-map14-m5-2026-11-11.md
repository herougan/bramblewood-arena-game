# Focused decks: Map 14 Savanna Reaches (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,adder-ambusher,alpine-marmot,alpine-swift,banded-sea-krait,blue-ringed-octopus,chamois-leaper,crocodile-ambusher,dust-hyena,eagle-owl-quartermaster,fishing-cat,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,ibex-rockcaller,mangrove-monitor,marula-elephant,meerkat-sentry,peregrine-stooper,pride-queen,savanna-cheetah,springbok-pronker,stonedrop-vulture,termite-forager,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:flying,big,open --anchor acacia-giraffe,adder-ambusher,crocodile-ambusher,dust-hyena,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,mangrove-monitor,marula-elephant,meerkat-sentry,pride-queen,savanna-cheetah,springbok-pronker,stonedrop-vulture,termite-forager --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9152 games in 115 s.

- The list (27): Acacia Giraffe, Adder Ambusher, Alpine Marmot, Alpine Swift, Banded Sea Krait, Blue-ringed Octopus, Chamois Leaper, Crocodile Ambusher, Dust Hyena, Eagle-Owl Quartermaster, Fishing Cat, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, Ibex Rockcaller, Mangrove Monitor, Marula Elephant, Meerkat Sentry, Peregrine Stooper, Pride Queen, Savanna Cheetah, Springbok Pronker, Stonedrop Vulture, Termite Forager, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 94% (92%-97%) | 0.2 | 0: 16, 1: 4 | 4x Alpine Marmot, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Stonedrop Vulture, 4x Upside-Down Bat | 16 |
| 2 | family:strike-first | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); flying x12; strike-first x8 | 92% (89%-96%) | 0.5 | 0: 10, 1: 10 | 4x Alpine Swift, 4x Dust Hyena, 4x Golden Eagle Diver, 4x Stonedrop Vulture, 2x Meerkat Sentry, 2x Tide Seahorse | 10 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); flying x8; day x8 | 91% (87%-94%) | 0.6 | 0: 8, 1: 12 | 4x Dust Hyena, 4x Golden Eagle Diver, 4x Upside-Down Bat, 3x Meerkat Sentry, 3x Wolf Spider Mother, 2x Savanna Cheetah | 0 |
| 4 | big | big (13 copies at 1+ Lumber, average 0.8); guard x7 | 85% (82%-89%) | 0.8 | 0: 7, 1: 10, 2: 3 | 4x Alpine Marmot, 4x Golden Eagle Diver, 4x Meerkat Sentry, 3x Dust Hyena, 3x Marula Elephant, 2x Ibex Rockcaller | 10 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 100% | 100% | 100% | 96% | 100% | 100% | 96% | 96% | 75% | 79% |
| 2 family:strike-first | 100% | 100% | 96% | 96% | 88% | 92% | 96% | 92% | 92% | 75% | 92% |
| 3 open | 96% | 100% | 96% | 92% | 92% | 83% | 92% | 83% | 100% | 83% | 79% |
| 4 big | 100% | 100% | 96% | 96% | 83% | 100% | 100% | 79% | 79% | 38% | 67% |
