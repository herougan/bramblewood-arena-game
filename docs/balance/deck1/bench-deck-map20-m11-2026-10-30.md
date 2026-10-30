# Focused decks: Map 20 The Sundered Peak (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,echidna-quillshot,ember-centipede,fire-salamander,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,grave-grin-hyena,hercules-beetle,ibex-rockcaller,lantern-spark-fly,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pumice-beetle,skull-vulture,squires-mount,stalactite-golem,stoat-cutthroat,stonedrop-vulture,vampire-roost,wolf-spider-mother,woodland-brawler --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,cinder-stoker,deep-cave-troll,echidna-quillshot,fumarole-ibex,glacier-wolf-pack,gorge-wyrm,magma-salamander,magma-wraith,ossuary-lammergeier,pack-mule,pumice-beetle,stalactite-golem,vampire-roost,woodland-brawler --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13546 games in 262 s.

- The list (32): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Echidna Quillshot, Ember Centipede, Fire Salamander, Fumarole Ibex, Glacier Wolf Pack, Gorge Wyrm, Grave-Grin Hyena, Hercules Beetle, Ibex Rockcaller, Lantern Spark Fly, Magma Salamander, Magma Wraith, Ossuary Lammergeier, Pack Mule, Pumice Beetle, Skull Vulture, Squire's Mount, Stalactite Golem, Stoat Cutthroat, Stonedrop Vulture, Vampire Roost, Wolf Spider Mother, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.9 Lumber) | 89% (87%-92%) | 0.9 | 0: 8, 1: 9, 3: 3 | 4x Ashbone Ghoul, 4x Grave-Grin Hyena, 3x Ancient Sloth Titan, 3x Magma Salamander, 3x Squire's Mount, 3x Wolf Spider Mother | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 81% (78%-85%) | 0.3 | 0: 14, 1: 6 | 4x Cinder Stoker, 4x Grave-Grin Hyena, 3x Ashbone Ghoul, 3x Eagle-Owl Quartermaster, 3x Pack Mule, 3x Wolf Spider Mother | 10 |
| 3 | economy | economy (8 resource makers); flying x7 | 76% (71%-80%) | 0.85 | 0: 7, 1: 11, 3: 2 | 4x Pack Mule, 4x Pumice Beetle, 4x Stonedrop Vulture, 3x Lantern Spark Fly, 3x Squire's Mount, 2x Gorge Wyrm | 17 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8); flying x10; ranged x8 | 66% (61%-70%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Cave Warlord, 4x Gorge Wyrm, 4x Lantern Spark Fly, 3x Eagle-Owl Quartermaster, 3x Stonedrop Vulture, 2x Magma Salamander | 18 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 96% | 100% | 79% | 100% | 100% | 92% | 83% | 100% | 96% | 100% | 29% | 92% |
| 2 swarm | 100% | 88% | 92% | 88% | 92% | 75% | 92% | 58% | 100% | 67% | 100% | 21% | 88% |
| 3 economy | 88% | 88% | 79% | 54% | 100% | 79% | 75% | 63% | 83% | 63% | 96% | 29% | 88% |
| 4 big | 88% | 77% | 79% | 50% | 63% | 67% | 75% | 54% | 50% | 52% | 88% | 29% | 81% |
