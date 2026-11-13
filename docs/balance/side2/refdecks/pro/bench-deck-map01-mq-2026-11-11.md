# Focused decks: Map 1 Clovermead (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alley-cat,alpine-marmot,ant-scout,balloon-archer,bee-forager,bee-knight,bee-sentry,burrow-rabbit,chipmunk-cavalry,clover-butterfly,compost-grub,cottontail,dormouse,hawthorn-shieldbug,honey-bee,ladybird-guard,lucky-hopper,meadow-rabbit,mountain-hare,mudpuppy,newt-doctor,nutria-reedcutter,planarian-splitter,puddle-skimmer,robin-redbreast --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:guard,big,open --anchor ant-scout,bee-forager,chipmunk-cavalry,clover-butterfly,compost-grub,cottontail,dormouse,honey-bee,ladybird-guard,lucky-hopper,meadow-rabbit,puddle-skimmer,robin-redbreast --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8992 games in 106 s.

- The list (25): Alley Cat, Alpine Marmot, Ant Scout, Balloon Archer, Bee Forager, Bee Warden, Bee Sentry, Burrow Rabbit, Chipmunk Cavalry, Clover Butterfly, Compost Grub, Cottontail, Dormouse, Hawthorn Shieldbug, Honey Bee, Ladybird Guard, Lucky Hopper, Meadow Rabbit, Mountain Hare, Mudpuppy, Newt Doctor, Nutria Reedcutter, Planarian Splitter, Puddle Skimmer, Robin Redbreast.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | swarm (16 copies at 0 Lumber); guard x8 | 95% (92%-98%) | 0.2 | 0: 16, 1: 4 | 4x Hawthorn Shieldbug, 4x Ladybird Guard, 4x Mudpuppy, 4x Robin Redbreast, 2x Cottontail, 2x Mountain Hare | 12 |
| 2 | open | swarm (16 copies at 0 Lumber); flying x8; guard x7 | 94% (91%-98%) | 0.2 | 0: 16, 1: 4 | 4x Clover Butterfly, 4x Hawthorn Shieldbug, 4x Robin Redbreast, 3x Alley Cat, 3x Alpine Marmot, 2x Compost Grub | 0 |
| 3 | family:flying | swarm (16 copies at 0 Lumber); flying x14 | 91% (87%-95%) | 0.2 | 0: 16, 1: 4 | 4x Bee Sentry, 4x Hawthorn Shieldbug, 4x Honey Bee, 4x Robin Redbreast, 2x Clover Butterfly, 2x Mudpuppy | 10 |
| 4 | big | big (8 copies at 1 Lumber, average 0.4) | 88% (84%-92%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Compost Grub, 4x Hawthorn Shieldbug, 3x Burrow Rabbit, 3x Dormouse, 2x Robin Redbreast | 12 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 100% | 96% | 100% | 92% | 88% | 100% | 92% | 92% |
| 2 open | 88% | 96% | 96% | 100% | 96% | 100% | 88% | 92% |
| 3 family:flying | 88% | 88% | 96% | 96% | 79% | 100% | 79% | 100% |
| 4 big | 92% | 92% | 92% | 96% | 83% | 100% | 58% | 92% |
