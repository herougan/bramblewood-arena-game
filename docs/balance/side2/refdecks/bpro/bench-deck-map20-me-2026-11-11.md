# Focused decks: Map 20 Eye of the Volcano (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,basalt-boar,berserker-boar,brimstone-hound,carrion-beetle,deep-cave-troll,honey-badger-fury,magma-salamander,obsidian-scorpion,ossuary-lammergeier,stalactite-golem,ur-elk,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:rally,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5540 games in 55 s.

- The list (13): Ancient Sloth Titan, Basalt Boar, Berserker Boar, Brimstone Hound, Carrion Beetle, Cave Bear, Honey Badger Fury, Magma Salamander, Obsidian Scorpion, Ossuary Lammergeier, Stalactite Pill Bug, Ür-Elk, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 2+ Lumber, average 1.2); rally x6 | 65% (60%-70%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Basalt Boar, 4x Berserker Boar, 4x Brimstone Hound, 4x Stalactite Pill Bug, 2x Magma Salamander, 2x Ür-Elk | 12 |
| 2 | open | big (4 copies at 2+ Lumber, average 1.2); poison x7; armor x7 | 62% (57%-67%) | 1.2 | 1: 16, 2: 4 | 4x Basalt Boar, 4x Carrion Beetle, 4x Honey Badger Fury, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 1x Ossuary Lammergeier | 0 |
| 3 | family:rally | big (8 copies at 2+ Lumber, average 1.6); rally x8; poison x6 | 52% (47%-57%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Basalt Boar, 4x Berserker Boar, 4x Cave Bear, 3x Carrion Beetle, 3x Obsidian Scorpion, 2x Magma Salamander | 10 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 79% | 83% | 96% | 38% | 88% | 92% | 67% | 63% | 8% | 38% |
| 2 open | 88% | 63% | 100% | 63% | 92% | 71% | 67% | 38% | 13% | 29% |
| 3 family:rally | 88% | 54% | 92% | 17% | 71% | 67% | 63% | 46% | 21% | 4% |
