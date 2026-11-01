# Focused decks: Map 20 Volcano Lair (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,fire-drake-hatchling,granite-ox-golem,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,salamander-pyromancer,stalactite-golem,tide-spirit,vampire-roost,woodland-brawler --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:fire,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6888 games in 107 s.

- The list (21): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, The Caldera Wyrm, Cinder Stoker, Cave Bear, Ember Centipede, Ember Jackal, Fire Drake Hatchling, Granite Ox Golem, Magma Salamander, Magma Titan, Magma Wraith, Obsidian Scorpion, Pack Mule, Salamander Pyromancer, Stalactite Golem, Tide Spirit, Vampire Roost, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber) | 90% (86%-94%) | 0.3 | 0: 14, 1: 6 | 4x Ashbone Ghoul, 4x Cinder Stoker, 3x Ember Jackal, 3x Obsidian Scorpion, 3x Pack Mule, 3x Tide Spirit | 7 |
| 2 | open | economy (4 resource makers) | 79% (74%-84%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Pack Mule, 3x Ash Cloud Condor, 3x Ember Jackal, 3x Magma Wraith, 3x Tide Spirit | 0 |
| 3 | family:fire | economy (4 resource makers); ranged x8; fire x8 | 76% (70%-81%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Cinder Stoker, 4x Ember Centipede, 4x Magma Wraith, 4x Pack Mule, 3x Magma Salamander, 1x Fire Drake Hatchling | 9 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0) | 43% (36%-49%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Cave Bear, 4x Ember Centipede, 4x Stalactite Golem, 3x Pack Mule, 3x Tide Spirit, 2x Cinder Stoker | 12 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 67% | 79% | 100% | 96% | 100% | 88% | 100% |
| 2 open | 42% | 67% | 100% | 92% | 100% | 63% | 92% |
| 3 family:fire | 29% | 63% | 96% | 96% | 100% | 63% | 83% |
| 4 big | 4% | 33% | 71% | 75% | 58% | 13% | 46% |
