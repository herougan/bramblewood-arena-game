# Focused decks: Map 20 Volcano Lair (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,basalt-boar,caldera-wyrm,cave-olm,cave-swiftlet,chamois-leaper,deep-cave-troll,eagle-owl-quartermaster,fire-drake-hatchling,fire-salamander,fumarole-ibex,giant-cave-huntsman,grave-grin-hyena,ibex-rockcaller,magma-salamander,obsidian-scorpion,polar-bear,quillback-elder,stalactite-golem,stoat-cutthroat,stonedrop-vulture,upside-down-bat,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:armor,big,open --anchor ancient-sloth-titan,basalt-boar,caldera-wyrm,deep-cave-troll,fire-drake-hatchling,fire-salamander,fumarole-ibex,magma-salamander,obsidian-scorpion,quillback-elder,stalactite-golem,ur-elk,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8834 games in 132 s.

- The list (25): Ancient Sloth Titan, Basalt Boar, The Caldera Wyrm, Cave Olm, Cave Swiftlet, Chamois Leaper, Cave Bear, Eagle-Owl Quartermaster, Fire Drake Hatchling, Fire Salamander, Fumarole Ibex, Giant Cave Huntsman, Grave-Grin Hyena, Ibex Rockcaller, Magma Salamander, Obsidian Scorpion, Polar Bear, Quillback Elder, Stalactite Pill Bug, Stoat Cutthroat, Stonedrop Vulture, Upside-Down Bat, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | flying x7 | 73% (67%-79%) | 0.65 | 0: 7, 1: 13 | 4x Basalt Boar, 4x Cave Swiftlet, 4x Fire Salamander, 3x Eagle-Owl Quartermaster, 3x Grave-Grin Hyena, 2x Magma Salamander | 0 |
| 2 | family:strike-first | strike-first x9; climb x6 | 72% (66%-78%) | 0.8 | 0: 4, 1: 16 | 4x Fire Salamander, 4x Upside-Down Bat, 3x Chamois Leaper, 3x Fumarole Ibex, 3x Giant Cave Huntsman, 3x Obsidian Scorpion | 16 |
| 3 | family:armor | big (8 copies at 2+ Lumber, average 1.0); armor x8 | 68% (63%-74%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Grave-Grin Hyena, 4x Quillback Elder, 4x Stalactite Pill Bug, 4x Upside-Down Bat, 2x Ibex Rockcaller, 2x Ür-Elk | 17 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); flying x7; rally x6 | 65% (59%-71%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Cave Bear, 4x Upside-Down Bat, 4x Vampire Roost, 3x Giant Cave Huntsman, 3x Stonedrop Vulture, 2x Ür-Elk | 20 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 54% | 92% | 79% | 96% | 100% | 42% | 50% |
| 2 family:strike-first | 58% | 96% | 92% | 96% | 83% | 33% | 46% |
| 3 family:armor | 54% | 100% | 92% | 100% | 63% | 29% | 42% |
| 4 big | 46% | 88% | 92% | 92% | 75% | 21% | 42% |
