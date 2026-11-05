# Focused decks: Map 19 Ashen Spurn (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool apollo-butterfly,beluga,cinder-stoker,eagle-owl-quartermaster,fire-salamander,glacier-wolf-pack,granite-ox-golem,harbor-seal,hercules-beetle,magma-titan,obsidian-scorpion,pit-glutton,pumice-beetle,snow-bunting-archer,snow-ermine,spitting-spider,sulfur-cinder-moth,talus-pika,walrus-icebreaker,yeti --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,family:ranged,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7074 games in 122 s.

- The list (20): Apollo Butterfly, Beluga, Cinder Stoker, Eagle-Owl Quartermaster, Fire Salamander, Glacier Wolf Pack, Granite Ox Golem, Harbor Seal, Hercules Beetle, Magma Rhino, Obsidian Scorpion, Pit Glutton, Pumice Beetle, Snow Bunting Archer, Snow Ermine, Spitting Spider, Sulfur Cinder Moth, Talus Pika, Walrus Icebreaker, Yeti.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:ranged | ranged x9 | 92% (89%-95%) | 0.8 | 0: 4, 1: 16 | 4x Cinder Stoker, 4x Fire Salamander, 4x Snow Bunting Archer, 4x Spitting Spider, 3x Obsidian Scorpion, 1x Eagle-Owl Quartermaster | 15 |
| 2 | family:flying | flying x8 | 87% (83%-91%) | 0.45 | 0: 11, 1: 9 | 4x Apollo Butterfly, 4x Sulfur Cinder Moth, 4x Talus Pika, 3x Cinder Stoker, 3x Hercules Beetle, 2x Walrus Icebreaker | 11 |
| 3 | open | economy (4 resource makers) | 82% (79%-86%) | 0.8 | 0: 4, 1: 16 | 4x Fire Salamander, 4x Pumice Beetle, 4x Talus Pika, 3x Eagle-Owl Quartermaster, 3x Hercules Beetle, 2x Walrus Icebreaker | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2) | 66% (60%-71%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Cinder Stoker, 4x Glacier Wolf Pack, 4x Snow Ermine, 4x Yeti, 2x Beluga, 2x Pit Glutton | 20 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:ranged | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 63% | 71% |
| 2 family:flying | 100% | 100% | 96% | 100% | 100% | 83% | 100% | 42% | 63% |
| 3 open | 100% | 100% | 96% | 100% | 92% | 79% | 100% | 25% | 50% |
| 4 big | 92% | 79% | 75% | 100% | 63% | 54% | 75% | 17% | 38% |
