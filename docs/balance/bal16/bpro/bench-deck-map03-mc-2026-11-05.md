# Focused decks: Map 3 Gannet Cliffs (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mc --pool conch-crawler,conch-herald,feral-tomcat,fiddler-crab-swarm,gannet-nestweaver,golden-eagle-diver,gull-thief,hawk-arrowkeeper,kittiwake-flock,oystercatcher,peak-condor,peregrine-stooper,pincushion-urchin,puffin-diver,razorbill,red-billed-chough --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:flying,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7100 games in 139 s.

- The list (16): Conch Crawler, Conch Herald, Tomcat, Fiddler Crab Swarm, Gannet Nestweaver, Golden Eagle Diver, Gull Thief, Hawk Arrowkeeper, Kittiwake Flock, Oystercatcher, Peak Condor, Peregrine Stooper, Pincushion Urchin, Puffin Diver, Razorbill, Red-billed Chough.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 3-1 skirmish's deck; 3-2 skirmish's deck; 3-3 skirmish's deck; 3-4 skirmish's deck; 3-5 elite's deck; 3-6 elite's deck; 3-7 elite's deck; reference starter deck under 3-1's field; reference deck (Map 3) under 3-2's field; expected player deck (expectedPlayerDeck) under 3-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (12 copies at 1 Lumber, average 0.6); flying x12; tide x8 | 87% (83%-91%) | 0.6 | 0: 8, 1: 12 | 4x Conch Crawler, 4x Conch Herald, 4x Kittiwake Flock, 4x Peregrine Stooper, 4x Razorbill | 12 |
| 2 | family:tide | big (8 copies at 1 Lumber, average 0.4); tide x16; armor x8 | 79% (75%-84%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Conch Herald, 4x Fiddler Crab Swarm, 4x Golden Eagle Diver, 4x Pincushion Urchin | 12 |
| 3 | open | big (16 copies at 1 Lumber, average 0.8); flying x12; strike-first x8 | 76% (71%-81%) | 0.8 | 0: 4, 1: 16 | 4x Conch Herald, 4x Tomcat, 4x Golden Eagle Diver, 4x Peak Condor, 4x Razorbill | 0 |
| 4 | economy | big (11 copies at 1 Lumber, average 0.6); economy (6 resource makers); flying x16; strike-first x7 | 76% (71%-81%) | 0.55 | 0: 9, 1: 11 | 4x Conch Herald, 4x Gannet Nestweaver, 4x Golden Eagle Diver, 3x Kittiwake Flock, 3x Peregrine Stooper, 2x Gull Thief | 12 |

## Per opponent

| Deck | fight:3-1 | fight:3-2 | fight:3-3 | fight:3-4 | fight:3-5 | fight:3-6 | fight:3-7 | ref:starter | ref:road3 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 88% | 75% | 100% | 96% | 88% | 88% | 96% | 100% | 54% | 88% |
| 2 family:tide | 88% | 96% | 83% | 58% | 96% | 92% | 92% | 92% | 29% | 67% |
| 3 open | 88% | 79% | 92% | 79% | 79% | 67% | 79% | 100% | 38% | 63% |
| 4 economy | 92% | 92% | 96% | 71% | 54% | 92% | 67% | 92% | 42% | 63% |
