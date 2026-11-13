# Focused decks: Map 20 Eye of the Volcano (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,basalt-boar,berserker-boar,cave-olm,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,lantern-spark-fly,magma-salamander,obsidian-lich,obsidian-scorpion,polar-bear,stalactite-golem,stoat-cutthroat,sulfur-vent-crab,the-contradiction,truffle-piglet,upside-down-bat,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:rally,family:armor,big,open --anchor ancient-sloth-titan,ash-moth,basalt-boar,berserker-boar,deep-cave-troll,honey-badger-fury,magma-salamander,obsidian-lich,obsidian-scorpion,stalactite-golem,sulfur-vent-crab,the-contradiction,ur-elk,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9140 games in 113 s.

- The list (26): Ancient Sloth Titan, Ash Moth, Basalt Boar, Berserker Boar, Cave Olm, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Lantern Spark Fly, Magma Salamander, Obsidian Lich, Obsidian Scorpion, Polar Bear, Stalactite Pill Bug, Stoat Cutthroat, Sulfur Vent Crab, The Contradiction, Truffle Piglet, Upside-Down Bat, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x10; flying x7 | 92% (89%-95%) | 0.45 | 0: 11, 1: 9 | 4x Sulfur Vent Crab, 4x Upside-Down Bat, 3x Lantern Spark Fly, 3x Obsidian Lich, 3x Obsidian Scorpion, 3x Truffle Piglet | 10 |
| 2 | open | armor x6 | 90% (87%-94%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Berserker Boar, 4x Fire Salamander, 4x Upside-Down Bat, 3x Obsidian Lich, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |
| 3 | family:rally | rally x10 | 84% (80%-88%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Berserker Boar, 4x Cave Olm, 4x Honey Badger Fury, 4x Upside-Down Bat, 2x Ibex Rockcaller, 2x Ür-Elk | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 74% (70%-78%) | 1.05 | 0: 7, 1: 5, 2: 8 | 4x Stalactite Pill Bug, 4x Upside-Down Bat, 4x Vampire Roost, 3x Cave Olm, 3x Truffle Piglet, 2x Ür-Elk | 16 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 96% | 100% | 100% | 96% | 100% | 100% | 96% | 88% | 83% | 58% |
| 2 open | 92% | 92% | 92% | 92% | 96% | 100% | 92% | 100% | 71% | 79% |
| 3 family:rally | 88% | 83% | 96% | 79% | 100% | 92% | 96% | 92% | 38% | 75% |
| 4 big | 92% | 79% | 100% | 88% | 96% | 92% | 92% | 63% | 17% | 25% |
