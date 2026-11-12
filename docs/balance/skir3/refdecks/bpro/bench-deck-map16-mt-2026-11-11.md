# Focused decks: Map 16 The Pinewood Taiga (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool boreal-elk,cone-cutter-squirrel,farm-dog,golden-eagle-diver,mountain-hare,owl-sentinel,puffin-diver,raft-spider,siege-rhino,snowshoe-hare,sworn-shieldbearer,taiga-lynx,upside-down-bat,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 108 s.

- The list (14): Boreal Elk, Cone-cutter Squirrel, Farm Dog, Golden Eagle Diver, Mountain Hare, Owl Sentinel, Puffin Diver, Raft Spider, Siege Rhino, Snowshoe Hare, Sworn Shieldbearer, Taiga Lynx, Upside-Down Bat, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (14 copies at 0 Lumber); evasion x8; flying x8 | 78% (73%-83%) | 0.3 | 0: 14, 1: 6 | 4x Golden Eagle Diver, 4x Mountain Hare, 4x Snowshoe Hare, 4x Upside-Down Bat, 2x Cone-cutter Squirrel, 2x Siege Rhino | 14 |
| 2 | family:flying | swarm (16 copies at 0 Lumber); economy (4 resource makers); flying x8 | 74% (69%-79%) | 0.2 | 0: 16, 1: 4 | 4x Cone-cutter Squirrel, 4x Farm Dog, 4x Mountain Hare, 4x Owl Sentinel, 4x Upside-Down Bat | 11 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); cold x6 | 73% (68%-78%) | 0.5 | 0: 10, 1: 10 | 4x Cone-cutter Squirrel, 4x Farm Dog, 4x Golden Eagle Diver, 4x Woodland Caribou, 2x Mountain Hare, 2x Sworn Shieldbearer | 11 |
| 4 | open | big (11 copies at 1+ Lumber, average 0.8); economy (4 resource makers); evasion x7 | 61% (56%-67%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Boreal Elk, 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Sworn Shieldbearer, 3x Taiga Lynx, 1x Farm Dog | 0 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 92% | 71% | 58% | 75% | 88% | 67% | 100% | 96% | 54% | 79% |
| 2 family:flying | 83% | 67% | 54% | 67% | 96% | 75% | 100% | 92% | 38% | 71% |
| 3 big | 92% | 71% | 54% | 63% | 83% | 67% | 92% | 100% | 50% | 58% |
| 4 open | 71% | 42% | 50% | 54% | 83% | 58% | 92% | 83% | 25% | 54% |
