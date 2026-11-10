# Focused decks: Map 3 Gannet Cliffs (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool beaver-lumberjack,chipmunk-cavalry,conch-crawler,conch-herald,cormorant,eagle-sharpshooter,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,great-skua,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,razorbill --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:flying,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2880 games in 672 s.

- The list (19): Beaver Lumberjack, Chipmunk Cavalry, Conch Crawler, Conch Herald, Cormorant, Eagle Sharpshooter, Tomcat, Fiddler Crab Swarm, Gannet Nestweaver, Great Skua, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Limpet Clinger, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver, Razorbill.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (15 copies at 1+ Lumber, average 0.8); flying x9 | 79% (74%-84%) | 0.75 | 0: 5, 1: 15 | 4x Conch Herald, 4x Hawk Arrowkeeper, 4x Peak Condor, 4x Pika Hoarder, 3x Chipmunk Cavalry, 1x Gannet Nestweaver | 0 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (8 resource makers); flying x16 | 77% (72%-82%) | 0.3 | 0: 14, 1: 6 | 4x Gannet Nestweaver, 4x Gull Thief, 4x Kittiwake Flock, 4x Peregrine Stooper, 2x Conch Herald, 2x Cormorant | 17 |
| 3 | family:flying | big (12 copies at 1+ Lumber, average 0.8); flying x12 | 76% (71%-81%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Beaver Lumberjack, 4x Conch Herald, 4x Eagle Sharpshooter, 4x Kittiwake Flock, 4x Razorbill | 16 |
| 4 | family:tide | big (9 copies at 1+ Lumber, average 0.5); tide x8 | 71% (66%-76%) | 0.45 | 0: 11, 1: 9 | 4x Conch Crawler, 4x Conch Herald, 4x Peregrine Stooper, 4x Pika Hoarder, 3x Beaver Lumberjack, 1x Peak Condor | 11 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 100% | 71% | 67% | 75% | 58% | 79% | 92% | 71% | 88% |
| 2 economy | 79% | 79% | 83% | 75% | 88% | 58% | 83% | 100% | 42% | 79% |
| 3 family:flying | 88% | 67% | 83% | 79% | 75% | 75% | 75% | 96% | 46% | 79% |
| 4 family:tide | 46% | 83% | 79% | 71% | 79% | 58% | 100% | 88% | 33% | 71% |
