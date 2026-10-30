# Focused decks: Map 20 Volcano Lair (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cave-olm,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,ember-centipede,ember-jackal,fire-drake-hatchling,fire-salamander,fumarole-ibex,grave-grin-hyena,ibex-rockcaller,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,phoenix-fledgling,polar-bear,squires-mount,stalactite-golem,stoat-cutthroat,stonedrop-vulture,tide-spirit,vampire-roost,wolf-spider-mother,woodland-brawler --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:fire,open --anchor ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,fire-drake-hatchling,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,phoenix-fledgling,stalactite-golem,tide-spirit,vampire-roost,woodland-brawler --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12782 games in 219 s.

- The list (32): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, The Caldera Wyrm, Cave Olm, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Ember Centipede, Ember Jackal, Fire Drake Hatchling, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Ibex Rockcaller, Magma Salamander, Magma Titan, Magma Wraith, Obsidian Scorpion, Pack Mule, Phoenix Fledgling, Polar Bear, Squire's Mount, Stalactite Golem, Stoat Cutthroat, Stonedrop Vulture, Tide Spirit, Vampire Roost, Wolf Spider Mother, Woodland Brawler.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); ranged x6 | 91% (87%-95%) | 0.6 | 0: 8, 1: 12 | 4x Ashbone Ghoul, 4x Cinder Skeleton, 4x Pack Mule, 3x Eagle-Owl Quartermaster, 3x Magma Salamander, 2x Stoat Cutthroat | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 85% (80%-90%) | 0.3 | 0: 14, 1: 6 | 4x Ashbone Ghoul, 4x Pack Mule, 3x Cave Olm, 3x Ember Jackal, 3x Magma Salamander, 3x Tide Spirit | 9 |
| 3 | family:fire | economy (4 resource makers); fire x11; ranged x7 | 82% (77%-87%) | 0.7 | 0: 6, 1: 14 | 4x Fire Salamander, 4x Magma Wraith, 4x Pack Mule, 3x Ember Jackal, 3x Magma Salamander, 2x Tide Spirit | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.6); ranged x7 | 63% (56%-70%) | 1.55 | 0: 5, 1: 7, 3: 8 | 4x Ancient Sloth Titan, 4x Cave Bear, 4x Magma Wraith, 3x Eagle-Owl Quartermaster, 3x Tide Spirit, 2x Pack Mule | 15 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 63% | 100% | 100% | 96% | 96% | 96% | 88% |
| 2 swarm | 54% | 92% | 100% | 100% | 96% | 63% | 92% |
| 3 family:fire | 42% | 96% | 100% | 71% | 96% | 71% | 96% |
| 4 big | 42% | 71% | 96% | 50% | 63% | 54% | 67% |
