# Focused decks: Map 8 Caves & Alcoves (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,alligator-gar,blind-cave-fish,cave-olm,diving-bell-spider,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,mudpuppy,newt-doctor,octopus-tactician,otter-centurion,pelican-diver,pincushion-urchin,planarian-splitter,puffin-diver,quarry-mole,raft-spider,rock-pool-starfish,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus big,swarm,family:tide,open --anchor blind-cave-fish,cave-olm,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,grotto-lobster,hollow-belly-rat,malachite-golem,octopus-tactician,pelican-diver,quarry-mole,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,vampire-bat --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7348 games in 99 s.

- The list (28): Alley Cat, Alligator Gar, Blind Cave Fish, Cave Olm, Diving Bell Spider, Echo Matriarch, Echo Screecher, Gallery Orb-Weaver, Giant Cave Huntsman, Grotto Lobster, Hollow-belly Rat, Malachite Golem, Mudpuppy, Newt Doctor, Octopus Tactician, Otter Centurion, Pelican Diver, Pincushion Urchin, Planarian Splitter, Puffin Diver, Quarry Mole, Raft Spider, Rock Pool Starfish, Stalactite Golem, Star-nosed Mole, Sulfur Cinder Moth, Vampire Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (10 copies at 1+ Lumber, average 0.5); swarm x6 | 96% (94%-98%) | 0.5 | 0: 10, 1: 10 | 4x Mudpuppy, 4x Sulfur Cinder Moth, 3x Grotto Lobster, 3x Pincushion Urchin, 3x Star-nosed Mole, 3x Wolf Spider Mother | 0 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5); flying x11; night x9 | 96% (93%-98%) | 0.5 | 0: 10, 1: 10 | 4x Star-nosed Mole, 4x Sulfur Cinder Moth, 4x Vampire Bat, 3x Echo Matriarch, 3x Grotto Lobster, 2x Blind Cave Fish | 10 |
| 3 | swarm | swarm (15 copies at 0 Lumber); heal x7 | 94% (91%-96%) | 0.3 | 0: 15, 1: 4, 2: 1 | 4x Cave Olm, 4x Pelican Diver, 4x Pincushion Urchin, 4x Star-nosed Mole, 3x Mudpuppy, 1x Octopus Tactician | 11 |
| 4 | family:tide | swarm (18 copies at 0 Lumber); night x10; tide x8 | 92% (89%-95%) | 0.1 | 0: 18, 1: 2 | 4x Blind Cave Fish, 4x Mudpuppy, 4x Pincushion Urchin, 4x Vampire Bat, 2x Echo Screecher, 2x Star-nosed Mole | 11 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 88% | 96% | 88% | 96% | 100% | 100% | 96% | 100% | 96% | 100% |
| 2 big | 100% | 100% | 100% | 92% | 92% | 100% | 96% | 100% | 92% | 88% | 96% |
| 3 swarm | 96% | 79% | 96% | 88% | 96% | 92% | 100% | 100% | 92% | 96% | 96% |
| 4 family:tide | 96% | 83% | 92% | 88% | 96% | 96% | 88% | 100% | 100% | 75% | 100% |
