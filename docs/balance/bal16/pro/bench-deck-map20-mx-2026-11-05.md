# Focused decks: Map 20 Volcano Lair (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cave-olm,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,ember-centipede,ember-jackal,fire-drake-hatchling,fire-salamander,fumarole-ibex,granite-ox-golem,grave-grin-hyena,ibex-rockcaller,lantern-spark-fly,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,salamander-pyromancer,spitting-spider,stalactite-golem,stoat-cutthroat,tide-spirit,vampire-roost,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:fire,family:ranged,big,open --anchor ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,fire-drake-hatchling,granite-ox-golem,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,salamander-pyromancer,stalactite-golem,tide-spirit,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7112 games in 144 s.

- The list (32): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, The Caldera Wyrm, Cave Olm, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Ember Centipede, Ember Jackal, Fire Drake Hatchling, Fire Salamander, Fumarole Ibex, Granite Ox Golem, Grave-Grin Hyena, Ibex Rockcaller, Lantern Spark Fly, Magma Salamander, Magma Rhino, Magma Wraith, Obsidian Scorpion, Pack Mule, Salamander Pyromancer, Spitting Spider, Stalactite Pill Bug, Stoat Cutthroat, Tide Seahorse, Vampire Roost, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:fire | fire x10; ranged x6 | 85% (80%-90%) | 0.65 | 0: 7, 1: 13 | 4x Fire Salamander, 4x Lantern Spark Fly, 4x Magma Wraith, 3x Cinder Stoker, 3x Ember Jackal, 2x Magma Salamander | 10 |
| 2 | family:ranged | economy (4 resource makers); ranged x9 | 81% (76%-85%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Stoker, 4x Pack Mule, 4x Spitting Spider, 3x Eagle-Owl Quartermaster, 3x Ember Jackal, 2x Magma Salamander | 13 |
| 3 | open | economy (4 resource makers) | 80% (74%-85%) | 0.65 | 0: 7, 1: 13 | 4x Fire Salamander, 4x Pack Mule, 3x Ember Jackal, 3x Lantern Spark Fly, 3x Obsidian Scorpion, 3x Wolf Spider Mother | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 54% (48%-61%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Cinder Stoker, 4x Lantern Spark Fly, 4x Magma Rhino, 4x Stalactite Pill Bug, 2x Tide Seahorse, 2x Walrus Icebreaker | 17 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:fire | 46% | 79% | 96% | 79% | 100% | 96% | 100% |
| 2 family:ranged | 21% | 79% | 100% | 83% | 100% | 88% | 96% |
| 3 open | 50% | 75% | 88% | 79% | 100% | 83% | 83% |
| 4 big | 21% | 33% | 96% | 58% | 79% | 63% | 29% |
