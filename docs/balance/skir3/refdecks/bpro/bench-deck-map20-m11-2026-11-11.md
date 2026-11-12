# Focused decks: Map 20 The Sundered Peak (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool ancient-sloth-titan,basalt-boar,berserker-boar,cataphract-destrier,crocodile-ambusher,deep-cave-troll,eagle-sharpshooter,echo-screecher,fire-salamander,frillneck-duelist,fumarole-ibex,honey-badger-fury,magma-salamander,obsidian-scorpion,pack-mule,quillback-elder,stalactite-golem,sulfur-vent-crab,ur-elk,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:rally,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7566 games in 131 s.

- The list (20): Ancient Sloth Titan, Basalt Boar, Berserker Boar, Gilded Roadwarden, Crocodile Ambusher, Cave Bear, Eagle Sharpshooter, Echo Screecher, Fire Salamander, Frillneck Duelist, Fumarole Ibex, Honey Badger Fury, Magma Salamander, Obsidian Scorpion, Pack Mule, Quillback Elder, Stalactite Pill Bug, Sulfur Vent Crab, Ür-Elk, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (0 copies at 3+ Lumber, average 1.2); economy (4 resource makers); armor x11 | 78% (74%-81%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Pack Mule, 4x Quillback Elder, 4x Stalactite Pill Bug, 3x Basalt Boar, 3x Obsidian Scorpion, 2x Magma Salamander | 12 |
| 2 | open | armor x7 | 72% (67%-76%) | 0.8 | 0: 4, 1: 16 | 4x Basalt Boar, 4x Fire Salamander, 4x Sulfur Vent Crab, 3x Echo Screecher, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |
| 3 | family:rally | big (4 copies at 3+ Lumber, average 1.4); economy (4 resource makers); rally x10 | 52% (47%-56%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Cave Bear, 4x Honey Badger Fury, 4x Pack Mule, 4x Quillback Elder, 2x Magma Salamander, 2x Ür-Elk | 18 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8); economy (4 resource makers); strike-first x7; cleave x6 | 49% (44%-54%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Cave Bear, 4x Pack Mule, 3x Basalt Boar, 3x Fumarole Ibex, 2x Ür-Elk | 17 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 92% | 96% | 83% | 75% | 79% | 79% | 79% | 100% | 96% | 88% | 96% | 21% | 25% |
| 2 open | 88% | 92% | 63% | 83% | 75% | 75% | 42% | 75% | 96% | 54% | 100% | 25% | 67% |
| 3 family:rally | 67% | 67% | 63% | 54% | 63% | 42% | 29% | 38% | 83% | 25% | 88% | 0% | 54% |
| 4 big | 79% | 63% | 50% | 54% | 33% | 63% | 21% | 67% | 75% | 25% | 63% | 8% | 33% |
