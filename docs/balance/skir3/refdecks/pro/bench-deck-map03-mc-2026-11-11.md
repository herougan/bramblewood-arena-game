# Focused decks: Map 3 Gannet Cliffs (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool alley-cat,beaver-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,cobalt-talon-fledgling,conch-herald,cormorant,crimson-wing-recruit,driftwood-crab,duck-paddler,eagle-sharpshooter,feral-tomcat,gannet-nestweaver,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,mosswing-laborer,oystercatcher,peak-condor,peregrine-stooper,pika-hoarder,pincushion-urchin,puffin-diver,river-carp,rock-pool-starfish --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:tide,open --anchor beaver-lumberjack,chipmunk-cavalry,conch-herald,cormorant,eagle-sharpshooter,feral-tomcat,gannet-nestweaver,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9120 games in 176 s.

- The list (27): Alley Cat, Beaver Lumberjack, Bee Forager, Bramble Sprout, Chipmunk Cavalry, Cobalt Fledgling, Conch Herald, Cormorant, Crimson Recruit, Driftwood Crab, Duck Paddler, Eagle Sharpshooter, Tomcat, Gannet Nestweaver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Limpet Clinger, Mosswing, Oystercatcher, Peak Condor, Peregrine Stooper, Pika Hoarder, Pincushion Urchin, Puffin Diver, River Carp, Rock Pool Starfish.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (10 copies at 1+ Lumber, average 0.6); economy (6 resource makers); flying x12; day x6 | 92% (89%-95%) | 0.6 | 0: 10, 1: 8, 2: 2 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Peregrine Stooper, 4x Rock Pool Starfish, 2x Eagle Sharpshooter, 2x Gannet Nestweaver | 13 |
| 2 | open | swarm (14 copies at 0 Lumber); tide x7; strike-first x6 | 86% (82%-90%) | 0.3 | 0: 14, 1: 6 | 4x Cormorant, 4x Rock Pool Starfish, 3x Conch Herald, 3x Tomcat, 3x Peregrine Stooper, 3x River Carp | 0 |
| 3 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x11; flying x10 | 83% (79%-87%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Kittiwake Flock, 4x Puffin Diver, 3x Pika Hoarder, 3x Rock Pool Starfish, 2x Bee Forager | 14 |
| 4 | family:flying | big (8 copies at 1+ Lumber, average 0.4); flying x12; strike-first x7 | 80% (75%-84%) | 0.4 | 0: 12, 1: 8 | 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 4x Peregrine Stooper, 3x Tomcat, 3x Pika Hoarder, 2x Rock Pool Starfish | 12 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 96% | 92% | 88% | 96% | 92% | 88% | 100% | 75% | 96% |
| 2 open | 83% | 88% | 71% | 96% | 100% | 92% | 88% | 100% | 58% | 88% |
| 3 family:tide | 83% | 67% | 71% | 83% | 96% | 100% | 100% | 100% | 42% | 92% |
| 4 family:flying | 92% | 79% | 71% | 96% | 75% | 58% | 75% | 100% | 63% | 88% |
