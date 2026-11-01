# Focused decks: Map 3 Gannet Cliffs (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool conch-crawler,conch-herald,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,peak-condor,peregrine-stooper,puffin-diver,razorbill,red-billed-chough,the-gannet-queen --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6880 games in 82 s.

- The list (15): Conch Crawler, Conch Herald, Tomcat, Fiddler Crab Swarm, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Peak Condor, Peregrine Stooper, Puffin Diver, Razorbill, Red-billed Chough, The Gannet Queen.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (14 copies at 1+ Lumber, average 0.7); economy (6 resource makers); flying x16; strike-first x6 | 83% (79%-88%) | 0.7 | 0: 6, 1: 14 | 4x Conch Herald, 4x Hawk Arrowkeeper, 4x Peregrine Stooper, 3x Gannet Nestweaver, 3x Gull Thief, 2x Golden Eagle Diver | 14 |
| 2 | open | big (16 copies at 1+ Lumber, average 0.8); flying x19; strike-first x7 | 82% (77%-86%) | 0.8 | 0: 4, 1: 16 | 4x Golden Eagle Diver, 4x Kittiwake Flock, 4x Peak Condor, 4x Razorbill, 3x Peregrine Stooper, 1x Conch Herald | 0 |
| 3 | big | big (12 copies at 1+ Lumber, average 0.6); flying x12; tide x8 | 80% (75%-84%) | 0.6 | 0: 8, 1: 12 | 4x Conch Herald, 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 4x Peak Condor, 2x Conch Crawler, 2x Fiddler Crab Swarm | 11 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x14; tide x9 | 69% (64%-74%) | 0.3 | 0: 14, 1: 6 | 4x Conch Crawler, 4x Gannet Nestweaver, 4x Kittiwake Flock, 3x Golden Eagle Diver, 3x Puffin Diver, 2x Fiddler Crab Swarm | 13 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 83% | 96% | 96% | 75% | 75% | 92% | 71% | 88% | 58% | 100% |
| 2 open | 88% | 88% | 96% | 79% | 71% | 88% | 67% | 100% | 42% | 100% |
| 3 big | 79% | 79% | 96% | 54% | 75% | 88% | 71% | 96% | 63% | 96% |
| 4 swarm | 71% | 79% | 88% | 48% | 79% | 71% | 38% | 83% | 38% | 96% |
