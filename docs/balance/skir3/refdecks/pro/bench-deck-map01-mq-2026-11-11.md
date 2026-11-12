# Focused decks: Map 1 Clovermead (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mq --pool alley-cat,alpine-marmot,ant-hill,ant-scout,balloon-archer,bee-sentry,burrow-rabbit,compost-grub,cottontail,cricket-drummer,earthworm,fire-ant-raft,forager-ant,harvest-mouse,hawthorn-shieldbug,jackrabbit-sprinter,meadow-rabbit,mountain-hare,mudpuppy,newt-doctor,planarian-splitter,robin-redbreast,slow-worm,worker-ant --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,big,swarm,open --anchor ant-hill,ant-scout,bee-sentry,compost-grub,cottontail,cricket-drummer,earthworm,harvest-mouse,jackrabbit-sprinter,meadow-rabbit,robin-redbreast,slow-worm --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8688 games in 107 s.

- The list (24): Alley Cat, Alpine Marmot, Ant Hill, Ant Scout, Balloon Archer, Bee Sentry, Burrow Rabbit, Compost Grub, Cottontail, Cricket Drummer, Earthworm, Fire Ant Raft, Forager Ant, Harvest Mouse, Hawthorn Shieldbug, Jackrabbit Sprinter, Meadow Rabbit, Mountain Hare, Mudpuppy, Newt Doctor, Planarian Splitter, Robin Redbreast, Slow-worm, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-A-1 skirmish's deck; 1-A-2 skirmish's deck; 1-A-3 skirmish's deck; 1-A-4 skirmish's deck; 1-A-5 boss's deck; reference starter deck under 1-A-1's field; reference deck (Map 12) under 1-A-2's field; expected player deck (expectedPlayerDeck) under 1-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (17 copies at 0 Lumber) | 96% (94%-99%) | 0.15 | 0: 17, 1: 3 | 4x Alley Cat, 4x Ant Scout, 4x Cricket Drummer, 3x Mountain Hare, 3x Planarian Splitter, 2x Robin Redbreast | 0 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4) | 94% (91%-97%) | 0.4 | 0: 12, 1: 8 | 4x Hawthorn Shieldbug, 4x Jackrabbit Sprinter, 4x Robin Redbreast, 3x Compost Grub, 3x Mountain Hare, 2x Cottontail | 15 |
| 3 | swarm | swarm (17 copies at 0 Lumber) | 94% (91%-97%) | 0.15 | 0: 17, 1: 3 | 4x Burrow Rabbit, 4x Mountain Hare, 4x Robin Redbreast, 3x Harvest Mouse, 3x Jackrabbit Sprinter, 2x Cricket Drummer | 13 |
| 4 | family:flying | swarm (16 copies at 0 Lumber); flying x10 | 91% (87%-95%) | 0.2 | 0: 16, 1: 4 | 4x Balloon Archer, 4x Compost Grub, 4x Robin Redbreast, 3x Alley Cat, 3x Alpine Marmot, 2x Bee Sentry | 15 |

## Per opponent

| Deck | fight:1-A-1 | fight:1-A-2 | fight:1-A-3 | fight:1-A-4 | fight:1-A-5 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 96% | 100% | 96% | 100% | 92% | 96% |
| 2 big | 96% | 92% | 96% | 100% | 100% | 100% | 75% | 96% |
| 3 swarm | 100% | 96% | 92% | 100% | 96% | 100% | 75% | 96% |
| 4 family:flying | 96% | 92% | 92% | 92% | 83% | 96% | 83% | 96% |
