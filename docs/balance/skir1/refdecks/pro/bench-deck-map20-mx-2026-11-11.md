# Focused decks: Map 20 Volcano Lair (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,ashbone-ghoul,cinder-hornet,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,ember-centipede,ember-jackal,ember-wisp,fire-drake-hatchling,fire-salamander,fumarole-ibex,gorge-wyrm,granite-ox-golem,grave-grin-hyena,ibex-rockcaller,lava-waders,magma-salamander,magma-titan,magma-wraith,phoenix-fledgling,pyroclast-wyrm,salamander-pyromancer,squires-mount,stalactite-golem,stonedrop-vulture,thunder-lizard,tide-spirit,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:ranged,family:flying,big,open --anchor ancient-sloth-titan,ash-cloud-condor,cinder-hornet,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,ember-wisp,fire-drake-hatchling,gorge-wyrm,granite-ox-golem,lava-waders,magma-salamander,magma-titan,phoenix-fledgling,pyroclast-wyrm,salamander-pyromancer,stalactite-golem,thunder-lizard,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1876 games in 175 s.

- The list (32): Ancient Sloth Titan, Ash Cloud Condor, Ashbone Ghoul, Cinder Hornet, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Ember Centipede, Ember Jackal, Ember Firefly, Fire Drake Hatchling, Fire Salamander, Fumarole Ibex, Gorge Wyrm, Granite Ox Golem, Grave-Grin Hyena, Ibex Rockcaller, Lava Waders, Magma Salamander, Magma Rhino, Magma Wraith, Phoenix Fledgling, Pyroclast Wyrm, Salamander Pyromancer, Squire's Mount, Stalactite Pill Bug, Stonedrop Vulture, Thunder Lizard, Tide Seahorse, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.5 Lumber) | 82% (76%-87%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Stonedrop Vulture, 3x Ember Jackal, 3x Ember Firefly, 2x Ibex Rockcaller | 0 |
| 2 | family:ranged | flying x11; ranged x9 | 69% (63%-75%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 3x Grave-Grin Hyena, 2x Magma Salamander | 12 |
| 3 | family:flying | flying x10; ranged x7 | 68% (62%-75%) | 0.5 | 0: 10, 1: 10 | 4x Ember Centipede, 4x Stonedrop Vulture, 3x Ash Cloud Condor, 3x Cinder Stoker, 3x Eagle-Owl Quartermaster, 3x Ember Firefly | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.6); fire x8; flying x6 | 29% (23%-36%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Fire Salamander, 4x Magma Rhino, 4x Phoenix Fledgling, 3x Cinder Skeleton, 3x Ember Jackal, 2x Stonedrop Vulture | 15 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 67% | 79% | 92% | 92% | 100% | 75% | 67% |
| 2 family:ranged | 38% | 58% | 75% | 83% | 100% | 63% | 67% |
| 3 family:flying | 33% | 50% | 79% | 79% | 96% | 71% | 71% |
| 4 big | 13% | 4% | 42% | 42% | 46% | 33% | 25% |
