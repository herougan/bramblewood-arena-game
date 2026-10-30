# Focused decks: Map 8 Caves & Alcoves (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,ant-warrior,badger-stonemason,blind-cave-fish,cave-olm,diving-bell-spider,echo-screecher,fire-ant-raft,giant-cave-huntsman,leafcutter-gardener,mayfly-dancer,mudpuppy,newt-doctor,octopus-tactician,otter-centurion,pelican-diver,planarian-splitter,quarry-mole,raft-spider,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,trash-panda-trickster,vampire-bat,whip-spider,wolf-spider-mother,worker-ant --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ant-warrior,badger-stonemason,blind-cave-fish,cave-olm,echo-screecher,giant-cave-huntsman,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,trash-panda-trickster,vampire-bat,whip-spider --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13200 games in 166 s.

- The list (27): Alley Cat, Ant Warrior, Badger Stonemason, Blind Cave Fish, Cave Olm, Diving Bell Spider, Echo Screecher, Fire Ant Raft, Giant Cave Huntsman, Leafcutter Gardener, Mayfly Dancer, Mudpuppy, Newt Doctor, Octopus Tactician, Otter Centurion, Pelican Diver, Planarian Splitter, Quarry Mole, Raft Spider, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Trash Panda Trickster, Vampire Bat, Whip Spider, Wolf Spider Mother, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); swarm x7; night x7 | 87% (83%-91%) | 0.3 | 0: 14, 1: 6 | 4x Ant Warrior, 4x Trash Panda Trickster, 3x Alley Cat, 3x Echo Screecher, 3x Otter Centurion, 3x Wolf Spider Mother | 9 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); swarm x7 | 81% (77%-86%) | 0.4 | 0: 12, 1: 8 | 4x Ant Warrior, 4x Raft Spider, 4x Star-nosed Mole, 4x Vampire Bat, 3x Wolf Spider Mother, 1x Echo Screecher | 8 |
| 3 | economy | economy (8 resource makers); bleed x7; night x7 | 80% (76%-85%) | 0.35 | 0: 13, 1: 7 | 4x Leafcutter Gardener, 4x Trash Panda Trickster, 4x Whip Spider, 3x Alley Cat, 3x Echo Screecher, 2x Otter Centurion | 12 |
| 4 | open | swarm (15 copies at 0 Lumber); economy (8 resource makers); swarm x7; night x7 | 77% (72%-82%) | 0.25 | 0: 15, 1: 5 | 4x Ant Warrior, 4x Leafcutter Gardener, 4x Trash Panda Trickster, 3x Vampire Bat, 3x Wolf Spider Mother, 2x Raft Spider | 0 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 88% | 96% | 100% | 79% | 79% | 79% | 67% | 96% | 100% | 71% | 100% |
| 2 big | 83% | 92% | 79% | 63% | 92% | 71% | 58% | 83% | 100% | 75% | 100% |
| 3 economy | 92% | 100% | 79% | 75% | 63% | 58% | 38% | 92% | 96% | 92% | 100% |
| 4 open | 79% | 83% | 58% | 67% | 83% | 79% | 50% | 83% | 96% | 67% | 100% |
