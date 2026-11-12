# Focused decks: Map 20 The Sundered Peak (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,basalt-boar,berserker-boar,cataphract-destrier,cave-olm,cinder-skeleton,crocodile-ambusher,deep-cave-troll,eagle-owl-quartermaster,eagle-sharpshooter,echo-screecher,fire-salamander,frillneck-duelist,fumarole-ibex,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,magma-salamander,obsidian-scorpion,pack-mule,quillback-elder,stalactite-golem,stoat-cutthroat,stonedrop-vulture,sulfur-vent-crab,thorny-devil,upside-down-bat,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor ancient-sloth-titan,basalt-boar,berserker-boar,cataphract-destrier,crocodile-ambusher,deep-cave-troll,eagle-sharpshooter,echo-screecher,fire-salamander,frillneck-duelist,fumarole-ibex,honey-badger-fury,magma-salamander,obsidian-scorpion,pack-mule,quillback-elder,stalactite-golem,sulfur-vent-crab,ur-elk,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9880 games in 155 s.

- The list (32): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Basalt Boar, Berserker Boar, Gilded Roadwarden, Cave Olm, Cinder Skeleton, Crocodile Ambusher, Cave Bear, Eagle-Owl Quartermaster, Eagle Sharpshooter, Echo Screecher, Fire Salamander, Frillneck Duelist, Fumarole Ibex, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Magma Salamander, Obsidian Scorpion, Pack Mule, Quillback Elder, Stalactite Pill Bug, Stoat Cutthroat, Stonedrop Vulture, Sulfur Vent Crab, Thorny Devil, Upside-Down Bat, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x12; day x8 | 79% (75%-83%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Ash Moth, 4x Basalt Boar, 4x Eagle Sharpshooter, 4x Upside-Down Bat, 3x Obsidian Scorpion, 1x Magma Salamander | 14 |
| 2 | family:armor | armor x10; flying x8 | 77% (73%-82%) | 1.15 | 0: 4, 1: 9, 2: 7 | 4x Quillback Elder, 4x Stonedrop Vulture, 4x Upside-Down Bat, 3x Obsidian Scorpion, 3x Stalactite Pill Bug, 2x Ibex Rockcaller | 10 |
| 3 | open | economy (4 resource makers); flying x8 | 74% (70%-78%) | 0.4 | 0: 12, 1: 8 | 4x Pack Mule, 4x Stonedrop Vulture, 4x Sulfur Vent Crab, 4x Upside-Down Bat, 2x Basalt Boar, 2x Ibex Rockcaller | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8) | 65% (61%-70%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Cave Bear, 4x Grave-Grin Hyena, 4x Stonedrop Vulture, 2x Ibex Rockcaller, 2x Obsidian Scorpion | 14 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 92% | 88% | 88% | 75% | 88% | 46% | 88% | 96% | 46% | 96% | 46% | 83% |
| 2 family:armor | 88% | 88% | 83% | 63% | 79% | 71% | 67% | 79% | 96% | 83% | 83% | 54% | 71% |
| 3 open | 92% | 92% | 54% | 75% | 75% | 79% | 42% | 71% | 100% | 58% | 96% | 38% | 92% |
| 4 big | 83% | 92% | 42% | 67% | 46% | 79% | 21% | 96% | 92% | 58% | 83% | 46% | 46% |
