# Focused decks: Map 20 Eye of the Volcano (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,basalt-boar,berserker-boar,deep-cave-troll,honey-badger-fury,magma-salamander,obsidian-lich,obsidian-scorpion,stalactite-golem,sulfur-vent-crab,the-contradiction,ur-elk,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:rally,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6940 games in 196 s.

- The list (14): Ancient Sloth Titan, Ash Moth, Basalt Boar, Berserker Boar, Cave Bear, Honey Badger Fury, Magma Salamander, Obsidian Lich, Obsidian Scorpion, Stalactite Pill Bug, Sulfur Vent Crab, The Contradiction, Ür-Elk, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x10 | 78% (73%-82%) | 0.8 | 0: 4, 1: 16 | 4x Ash Moth, 4x Basalt Boar, 4x Sulfur Vent Crab, 3x Obsidian Lich, 3x Obsidian Scorpion, 2x Magma Salamander | 12 |
| 2 | family:rally | rally x10; armor x6 | 65% (59%-70%) | 1.05 | 0: 3, 1: 13, 2: 4 | 4x Basalt Boar, 4x Berserker Boar, 4x Honey Badger Fury, 3x Obsidian Scorpion, 3x Sulfur Vent Crab, 2x Ür-Elk | 13 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.4); armor x7; rally x6 | 62% (56%-67%) | 1.4 | 1: 12, 2: 8 | 4x Basalt Boar, 4x Berserker Boar, 4x Stalactite Pill Bug, 3x Ash Moth, 3x Obsidian Lich, 2x Ür-Elk | 13 |
| 4 | open | big (8 copies at 2+ Lumber, average 1.4); armor x10 | 51% (46%-57%) | 1.4 | 1: 12, 2: 8 | 4x Honey Badger Fury, 4x Stalactite Pill Bug, 4x Vampire Roost, 3x Obsidian Lich, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 96% | 75% | 79% | 75% | 88% | 96% | 88% | 83% | 42% | 54% |
| 2 family:rally | 75% | 46% | 83% | 38% | 83% | 88% | 71% | 83% | 21% | 58% |
| 3 big | 88% | 38% | 75% | 42% | 79% | 100% | 63% | 63% | 25% | 46% |
| 4 open | 75% | 58% | 67% | 63% | 58% | 100% | 42% | 8% | 25% | 17% |
