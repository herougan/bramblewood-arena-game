# Focused decks: Map 8 Caves & Alcoves (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool ant-warrior,badger-stonemason,blind-cave-fish,cave-olm,echo-screecher,giant-cave-huntsman,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,trash-panda-trickster,vampire-bat,whip-spider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6996 games in 71 s.

- The list (15): Ant Warrior, Badger Stonemason, Blind Cave Fish, Cave Olm, Echo Screecher, Giant Cave Huntsman, Octopus Tactician, Pelican Diver, Quarry Mole, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Trash Panda Trickster, Vampire Bat, Whip Spider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers); night x8; flying x6 | 78% (73%-83%) | 0.25 | 0: 15, 1: 5 | 4x Star-nosed Mole, 4x Trash Panda Trickster, 4x Vampire Bat, 3x Cave Olm, 3x Giant Cave Huntsman, 2x Pelican Diver | 9 |
| 2 | open | swarm (14 copies at 0 Lumber); economy (4 resource makers); night x15; flying x7 | 75% (70%-80%) | 0.3 | 0: 14, 1: 6 | 4x Blind Cave Fish, 4x Trash Panda Trickster, 4x Vampire Bat, 3x Echo Screecher, 3x Giant Cave Huntsman, 2x Ant Warrior | 0 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 68% (63%-73%) | 0.5 | 0: 10, 1: 10 | 4x Star-nosed Mole, 4x Sulfur Cinder Moth, 4x Trash Panda Trickster, 3x Giant Cave Huntsman, 3x Whip Spider, 2x Ant Warrior | 11 |
| 4 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); night x11 | 65% (60%-71%) | 0.4 | 0: 12, 1: 8 | 4x Blind Cave Fish, 4x Star-nosed Mole, 4x Trash Panda Trickster, 3x Echo Screecher, 3x Giant Cave Huntsman, 2x Badger Stonemason | 6 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 83% | 96% | 50% | 63% | 71% | 54% | 67% | 92% | 96% | 88% | 100% |
| 2 open | 79% | 63% | 58% | 75% | 71% | 75% | 63% | 75% | 100% | 75% | 96% |
| 3 big | 67% | 79% | 46% | 54% | 63% | 50% | 46% | 88% | 88% | 83% | 88% |
| 4 economy | 63% | 79% | 38% | 63% | 58% | 54% | 42% | 67% | 92% | 67% | 96% |
