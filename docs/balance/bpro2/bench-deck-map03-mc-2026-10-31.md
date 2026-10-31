# Focused decks: Map 3 Gannet Cliffs (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool conch-crawler,conch-herald,feral-tomcat,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,peak-condor,peregrine-stooper,puffin-diver,razorbill,red-billed-chough --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7400 games in 82 s.

- The list (13): Conch Crawler, Conch Herald, Tomcat, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Peak Condor, Peregrine Stooper, Puffin Diver, Razorbill, Red-billed Chough.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1 Lumber, average 0.8); flying x16 | 87% (83%-91%) | 0.8 | 0: 4, 1: 16 | 4x Conch Herald, 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 4x Peak Condor, 4x Peregrine Stooper | 6 |
| 2 | economy | big (14 copies at 1 Lumber, average 0.7); economy (6 resource makers); flying x16; strike-first x6 | 84% (80%-89%) | 0.7 | 0: 6, 1: 14 | 4x Conch Herald, 4x Gannet Nestweaver, 4x Peak Condor, 3x Golden Eagle Diver, 3x Peregrine Stooper, 2x Gull Thief | 10 |
| 3 | open | big (12 copies at 1 Lumber, average 0.6); economy (4 resource makers); flying x17 | 84% (80%-88%) | 0.6 | 0: 8, 1: 12 | 4x Gannet Nestweaver, 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 3x Conch Herald, 3x Peregrine Stooper, 2x Razorbill | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x11; tide x6 | 71% (66%-77%) | 0.3 | 0: 14, 1: 6 | 4x Gull Thief, 4x Kittiwake Flock, 3x Conch Crawler, 3x Conch Herald, 3x Tomcat, 3x Peregrine Stooper | 10 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 88% | 83% | 92% | 83% | 92% | 83% | 83% | 100% | 67% | 96% |
| 2 economy | 88% | 83% | 83% | 79% | 88% | 92% | 71% | 92% | 71% | 96% |
| 3 open | 100% | 96% | 88% | 75% | 79% | 79% | 67% | 96% | 63% | 100% |
| 4 swarm | 75% | 75% | 63% | 67% | 67% | 71% | 38% | 100% | 63% | 96% |
