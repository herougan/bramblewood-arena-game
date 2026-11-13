# Focused decks: Map 1 Clovermead (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alley-cat,alpine-marmot,ant-scout,balloon-archer,barkplate-beetle,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-cavalry,clover-butterfly,compost-grub,cottontail,dormouse,honey-bee,jackrabbit-sprinter,lucky-hopper,meadow-rabbit,mountain-hare,mudpuppy,newt-doctor,nutria-reedcutter,planarian-splitter,puddle-skimmer,robin-redbreast --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,big,swarm,open --anchor ant-scout,bee-forager,chipmunk-cavalry,clover-butterfly,compost-grub,cottontail,dormouse,honey-bee,jackrabbit-sprinter,lucky-hopper,meadow-rabbit,puddle-skimmer,robin-redbreast --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8912 games in 178 s.

- The list (25): Alley Cat, Alpine Marmot, Ant Scout, Balloon Archer, Barkplate Beetle, Bee Forager, Bee Warden, Bee Sentry, Burrow Rabbit, Chipmunk Cavalry, Clover Butterfly, Compost Grub, Cottontail, Dormouse, Honey Bee, Jackrabbit Sprinter, Lucky Hopper, Meadow Rabbit, Mountain Hare, Mudpuppy, Newt Doctor, Nutria Reedcutter, Planarian Splitter, Puddle Skimmer, Robin Redbreast.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (17 copies at 0 Lumber); flying x7 | 92% (89%-95%) | 0.15 | 0: 17, 1: 3 | 4x Alley Cat, 4x Mountain Hare, 4x Robin Redbreast, 3x Chipmunk Cavalry, 3x Clover Butterfly, 2x Burrow Rabbit | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber) | 91% (87%-95%) | 0.2 | 0: 16, 1: 4 | 4x Alley Cat, 4x Chipmunk Cavalry, 4x Meadow Rabbit, 3x Alpine Marmot, 3x Bee Sentry, 2x Ant Scout | 13 |
| 3 | family:flying | swarm (18 copies at 0 Lumber); flying x16 | 89% (85%-93%) | 0.1 | 0: 18, 1: 2 | 4x Bee Sentry, 4x Burrow Rabbit, 4x Robin Redbreast, 3x Bee Forager, 3x Clover Butterfly, 2x Balloon Archer | 11 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.7) | 84% (80%-88%) | 0.65 | 0: 10, 1: 7, 2: 3 | 4x Chipmunk Cavalry, 4x Dormouse, 4x Mountain Hare, 3x Barkplate Beetle, 3x Lucky Hopper, 2x Alpine Marmot | 13 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 100% | 100% | 83% | 100% | 58% | 100% |
| 2 swarm | 100% | 96% | 92% | 100% | 79% | 96% | 71% | 92% |
| 3 family:flying | 100% | 92% | 100% | 100% | 75% | 100% | 54% | 92% |
| 4 big | 96% | 88% | 92% | 96% | 83% | 96% | 29% | 92% |
