# Focused decks: Map 16 The Pinewood Taiga (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alpine-marmot,alpine-swift,bear-cub,blue-ringed-octopus,border-collie,boreal-elk,cone-cutter-squirrel,dust-hyena,eagle-owl-quartermaster,farm-dog,golden-eagle-diver,grave-grin-hyena,ibex-rockcaller,mountain-hare,mudflat-godwit,nightjar-drifter,owl-sentinel,puffin-diver,raft-spider,siege-rhino,snowshoe-hare,stoat-cutthroat,sworn-shieldbearer,taiga-lynx,upside-down-bat,wolf-spider-mother,woodland-caribou --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:evasion,open --anchor bear-cub,boreal-elk,cone-cutter-squirrel,farm-dog,golden-eagle-diver,mountain-hare,owl-sentinel,puffin-diver,raft-spider,siege-rhino,snowshoe-hare,sworn-shieldbearer,taiga-lynx,upside-down-bat,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9020 games in 165 s.

- The list (27): Alpine Marmot, Alpine Swift, Bear Cub, Blue-ringed Octopus, Border Collie, Boreal Elk, Cone-cutter Squirrel, Dust Hyena, Eagle-Owl Quartermaster, Farm Dog, Golden Eagle Diver, Grave-Grin Hyena, Ibex Rockcaller, Mountain Hare, Mudflat Godwit, Nightjar Drifter, Owl Sentinel, Puffin Diver, Raft Spider, Siege Rhino, Snowshoe Hare, Stoat Cutthroat, Sworn Shieldbearer, Taiga Lynx, Upside-Down Bat, Wolf Spider Mother, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (15 copies at 0 Lumber); evasion x8 | 85% (80%-89%) | 0.25 | 0: 15, 1: 5 | 4x Alpine Marmot, 4x Mountain Hare, 4x Snowshoe Hare, 3x Cone-cutter Squirrel, 3x Owl Sentinel, 2x Ibex Rockcaller | 11 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 85% (80%-89%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Bear Cub, 4x Cone-cutter Squirrel, 4x Nightjar Drifter, 2x Ibex Rockcaller, 2x Siege Rhino | 0 |
| 3 | economy | big (13 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 80% (75%-85%) | 0.65 | 0: 7, 1: 13 | 4x Cone-cutter Squirrel, 4x Raft Spider, 4x Woodland Caribou, 3x Blue-ringed Octopus, 3x Dust Hyena, 2x Ibex Rockcaller | 14 |
| 4 | family:flying | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x8 | 71% (66%-76%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Border Collie, 4x Cone-cutter Squirrel, 4x Upside-Down Bat, 2x Alpine Swift, 2x Owl Sentinel | 12 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 83% | 83% | 71% | 83% | 100% | 96% | 100% | 96% | 63% | 71% |
| 2 open | 100% | 75% | 75% | 83% | 96% | 92% | 100% | 96% | 75% | 54% |
| 3 economy | 79% | 58% | 71% | 79% | 96% | 79% | 92% | 100% | 71% | 75% |
| 4 family:flying | 96% | 67% | 54% | 58% | 92% | 63% | 83% | 100% | 33% | 63% |
