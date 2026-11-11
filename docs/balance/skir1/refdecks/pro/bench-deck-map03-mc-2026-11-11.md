# Focused decks: Map 3 Gannet Cliffs (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool alley-cat,beaver-lumberjack,bee-forager,bramble-sprout,chipmunk-cavalry,cobalt-talon-fledgling,conch-crawler,conch-herald,cormorant,crimson-wing-recruit,driftwood-crab,duck-paddler,eagle-sharpshooter,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,great-skua,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,mosswing-laborer,oystercatcher,peak-condor,peregrine-stooper,pika-hoarder,pincushion-urchin,puffin-diver,razorbill,river-carp,rock-pool-starfish --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:tide,open --anchor beaver-lumberjack,chipmunk-cavalry,conch-crawler,conch-herald,cormorant,eagle-sharpshooter,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,great-skua,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,razorbill --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2900 games in 451 s.

- The list (31): Alley Cat, Beaver Lumberjack, Bee Forager, Bramble Sprout, Chipmunk Cavalry, Cobalt Fledgling, Conch Crawler, Conch Herald, Cormorant, Crimson Recruit, Driftwood Crab, Duck Paddler, Eagle Sharpshooter, Tomcat, Fiddler Crab Swarm, Gannet Nestweaver, Great Skua, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Limpet Clinger, Mosswing, Oystercatcher, Peak Condor, Peregrine Stooper, Pika Hoarder, Pincushion Urchin, Puffin Diver, Razorbill, River Carp, Rock Pool Starfish.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); armor x8; guard x8 | 83% (79%-88%) | 0.6 | 0: 8, 1: 12 | 4x Conch Crawler, 4x Conch Herald, 4x Cormorant, 4x Driftwood Crab, 4x Peak Condor | 16 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); flying x8 | 79% (74%-84%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Conch Herald, 4x Great Skua, 4x Kittiwake Flock, 4x River Carp | 0 |
| 3 | family:flying | big (16 copies at 1+ Lumber, average 1.0); economy (4 resource makers); flying x8 | 77% (72%-82%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Chipmunk Cavalry, 4x Conch Herald, 4x Driftwood Crab, 4x Eagle Sharpshooter, 4x Mosswing | 16 |
| 4 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); armor x8 | 56% (50%-62%) | 0.4 | 0: 12, 1: 8 | 4x Chipmunk Cavalry, 4x Driftwood Crab, 4x Duck Paddler, 4x Limpet Clinger, 2x Alley Cat, 2x Gull Thief | 18 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 88% | 96% | 75% | 71% | 92% | 96% | 83% | 100% | 46% | 88% |
| 2 open | 83% | 71% | 79% | 67% | 88% | 88% | 71% | 100% | 54% | 88% |
| 3 family:flying | 88% | 71% | 63% | 67% | 79% | 100% | 79% | 100% | 58% | 67% |
| 4 economy | 67% | 42% | 46% | 42% | 58% | 54% | 54% | 100% | 17% | 79% |
