# Focused decks: Map 20 Eye of the Volcano (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,basalt-boar,berserker-boar,brimstone-hound,carrion-beetle,cave-olm,deep-cave-troll,eagle-owl-quartermaster,fire-salamander,fumarole-ibex,gallery-orb-weaver,grave-grin-hyena,honey-badger-fury,ibex-rockcaller,ladybird-guard,magma-salamander,obsidian-scorpion,ossuary-lammergeier,polar-bear,stalactite-golem,stoat-cutthroat,tide-spirit,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:rally,family:armor,big,open --anchor ancient-sloth-titan,basalt-boar,berserker-boar,brimstone-hound,carrion-beetle,deep-cave-troll,honey-badger-fury,magma-salamander,obsidian-scorpion,ossuary-lammergeier,stalactite-golem,ur-elk,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9040 games in 139 s.

- The list (25): Ancient Sloth Titan, Basalt Boar, Berserker Boar, Brimstone Hound, Carrion Beetle, Cave Olm, Cave Bear, Eagle-Owl Quartermaster, Fire Salamander, Fumarole Ibex, Gallery Orb-Weaver, Grave-Grin Hyena, Honey Badger Fury, Ibex Rockcaller, Ladybird Guard, Magma Salamander, Obsidian Scorpion, Ossuary Lammergeier, Polar Bear, Stalactite Pill Bug, Stoat Cutthroat, Tide Seahorse, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:rally | rally x8 | 84% (80%-88%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Berserker Boar, 4x Grave-Grin Hyena, 4x Honey Badger Fury, 3x Obsidian Scorpion, 3x Stoat Cutthroat, 2x Tide Seahorse | 16 |
| 2 | open | midrange (average 1.0 Lumber) | 80% (76%-85%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Basalt Boar, 4x Berserker Boar, 4x Cave Olm, 4x Fire Salamander, 2x Ibex Rockcaller, 2x Magma Salamander | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.3) | 76% (72%-80%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Basalt Boar, 4x Cave Olm, 4x Cave Bear, 4x Stalactite Pill Bug, 2x Polar Bear, 2x Tide Seahorse | 12 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:rally | 92% | 96% | 100% | 79% | 100% | 88% | 88% | 96% | 42% | 58% |
| 2 open | 100% | 71% | 100% | 83% | 100% | 79% | 75% | 100% | 38% | 58% |
| 3 big | 100% | 96% | 100% | 79% | 100% | 79% | 100% | 63% | 8% | 38% |
