# Focused decks: Map 3 Gannet Cliffs (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool beaver-lumberjack,chipmunk-cavalry,conch-herald,cormorant,eagle-sharpshooter,feral-tomcat,gannet-nestweaver,gull-thief,hawk-arrowkeeper,kittiwake-flock,limpet-clinger,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:flying,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6760 games in 123 s.

- The list (15): Beaver Lumberjack, Chipmunk Cavalry, Conch Herald, Cormorant, Eagle Sharpshooter, Tomcat, Gannet Nestweaver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Limpet Clinger, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6); strike-first x8; flying x8 | 93% (89%-96%) | 0.6 | 0: 8, 1: 12 | 4x Chipmunk Cavalry, 4x Conch Herald, 4x Cormorant, 4x Kittiwake Flock, 4x Peregrine Stooper | 0 |
| 2 | family:flying | big (12 copies at 1+ Lumber, average 0.8); ranged x8; flying x8 | 85% (81%-90%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Conch Herald, 4x Cormorant, 4x Eagle Sharpshooter, 4x Peak Condor, 4x Pika Hoarder | 12 |
| 3 | family:strike-first | big (10 copies at 1+ Lumber, average 0.5); strike-first x10; flying x6 | 73% (68%-78%) | 0.5 | 0: 10, 1: 10 | 4x Chipmunk Cavalry, 4x Tomcat, 4x Peak Condor, 4x Pika Hoarder, 2x Limpet Clinger, 2x Peregrine Stooper | 14 |
| 4 | economy | swarm (14 copies at 0 Lumber); economy (8 resource makers); flying x8 | 71% (66%-76%) | 0.3 | 0: 14, 1: 6 | 4x Conch Herald, 4x Cormorant, 4x Gannet Nestweaver, 4x Gull Thief, 2x Beaver Lumberjack, 2x Chipmunk Cavalry | 10 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 92% | 100% | 88% | 96% | 100% | 96% | 100% | 71% | 88% |
| 2 family:flying | 96% | 100% | 83% | 83% | 83% | 75% | 92% | 96% | 50% | 96% |
| 3 family:strike-first | 63% | 88% | 75% | 58% | 67% | 54% | 83% | 100% | 54% | 88% |
| 4 economy | 88% | 75% | 58% | 75% | 67% | 71% | 92% | 96% | 17% | 71% |
