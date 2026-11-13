# Focused decks: Map 20 Volcano Lair (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,barrow-leech-bat,basalt-boar,caldera-wyrm,cataphract-destrier,cinder-hornet,deep-cave-troll,eagle-sharpshooter,fire-salamander,granite-ox-golem,magma-salamander,magma-titan,obsidian-scorpion,quarry-mole,stalactite-golem,ur-elk,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6860 games in 107 s.

- The list (17): Ancient Sloth Titan, Barrow Leech, Basalt Boar, The Caldera Wyrm, Gilded Roadwarden, Cinder Hornet, Cave Bear, Eagle Sharpshooter, Fire Salamander, Granite Ox Golem, Magma Salamander, Magma Rhino, Obsidian Scorpion, Quarry Mole, Stalactite Pill Bug, Ür-Elk, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (4 copies at 3+ Lumber, average 2.0); flying x11; ranged x6 | 62% (56%-68%) | 2 | 1: 8, 2: 8, 4: 4 | 4x Gilded Roadwarden, 4x Cinder Hornet, 4x Eagle Sharpshooter, 3x Barrow Leech, 3x Obsidian Scorpion, 2x Magma Salamander | 11 |
| 2 | open | big (4 copies at 3+ Lumber, average 1.6) | 55% (49%-62%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Basalt Boar, 4x Cinder Hornet, 4x Cave Bear, 3x Fire Salamander, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |
| 3 | family:armor | big (0 copies at 3+ Lumber, average 1.4); armor x8 | 55% (49%-61%) | 1.35 | 0: 1, 1: 11, 2: 8 | 4x Basalt Boar, 4x Eagle Sharpshooter, 4x Fire Salamander, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 1x The Caldera Wyrm | 10 |
| 4 | big | big (11 copies at 3+ Lumber, average 2.3); fire x8 | 44% (38%-51%) | 2.3 | 1: 9, 3: 7, 4: 4 | 4x Gilded Roadwarden, 4x Fire Salamander, 4x Magma Rhino, 3x Ancient Sloth Titan, 3x Obsidian Scorpion, 2x Magma Salamander | 12 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 50% | 88% | 79% | 71% | 88% | 29% | 29% |
| 2 open | 71% | 75% | 67% | 79% | 58% | 21% | 17% |
| 3 family:armor | 67% | 83% | 79% | 83% | 25% | 29% | 17% |
| 4 big | 46% | 79% | 67% | 63% | 25% | 13% | 17% |
