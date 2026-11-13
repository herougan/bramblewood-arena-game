# Focused decks: Map 20 Volcano Lair (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,barrow-leech-bat,basalt-boar,caldera-wyrm,cataphract-destrier,cave-olm,cinder-hornet,deep-cave-troll,eagle-owl-quartermaster,eagle-sharpshooter,fire-salamander,fumarole-ibex,giant-cave-huntsman,granite-ox-golem,grave-grin-hyena,hawthorn-shieldbug,ibex-rockcaller,magma-salamander,magma-titan,millipede-hauler,obsidian-scorpion,polar-bear,quarry-mole,stalactite-golem,stoat-cutthroat,tide-spirit,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:strike-first,big,open --anchor ancient-sloth-titan,barrow-leech-bat,basalt-boar,caldera-wyrm,cataphract-destrier,cinder-hornet,deep-cave-troll,eagle-sharpshooter,fire-salamander,granite-ox-golem,magma-salamander,magma-titan,obsidian-scorpion,quarry-mole,stalactite-golem,ur-elk,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8890 games in 266 s.

- The list (29): Ancient Sloth Titan, Barrow Leech, Basalt Boar, The Caldera Wyrm, Gilded Roadwarden, Cave Olm, Cinder Hornet, Cave Bear, Eagle-Owl Quartermaster, Eagle Sharpshooter, Fire Salamander, Fumarole Ibex, Giant Cave Huntsman, Granite Ox Golem, Grave-Grin Hyena, Hawthorn Shieldbug, Ibex Rockcaller, Magma Salamander, Magma Rhino, Millipede Hauler, Obsidian Scorpion, Polar Bear, Quarry Mole, Stalactite Pill Bug, Stoat Cutthroat, Tide Seahorse, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x10 | 79% (74%-84%) | 1.1 | 0: 2, 1: 14, 2: 4 | 4x Cinder Hornet, 4x Fire Salamander, 4x Hawthorn Shieldbug, 3x Millipede Hauler, 3x Obsidian Scorpion, 2x Tide Seahorse | 20 |
| 2 | big | big (8 copies at 3+ Lumber, average 1.7) | 71% (65%-76%) | 1.7 | 0: 6, 1: 6, 3: 4, 4: 4 | 4x Basalt Boar, 4x Gilded Roadwarden, 4x Cave Bear, 4x Grave-Grin Hyena, 2x Magma Salamander, 2x Tide Seahorse | 10 |
| 3 | family:strike-first | big (4 copies at 3+ Lumber, average 1.7); strike-first x10 | 70% (64%-77%) | 1.7 | 0: 2, 1: 10, 2: 4, 4: 4 | 4x Gilded Roadwarden, 4x Eagle Sharpshooter, 4x Fire Salamander, 3x Giant Cave Huntsman, 3x Stoat Cutthroat, 2x Tide Seahorse | 13 |
| 4 | open | big (4 copies at 3+ Lumber, average 1.4); flying x7; ranged x6 | 55% (49%-61%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Cave Bear, 4x Eagle Sharpshooter, 4x Grave-Grin Hyena, 3x Barrow Leech, 3x Giant Cave Huntsman, 2x Magma Salamander | 0 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 96% | 100% | 96% | 92% | 71% | 50% | 50% |
| 2 big | 83% | 92% | 96% | 100% | 58% | 25% | 42% |
| 3 family:strike-first | 63% | 79% | 92% | 92% | 79% | 42% | 46% |
| 4 open | 50% | 79% | 71% | 92% | 67% | 4% | 21% |
