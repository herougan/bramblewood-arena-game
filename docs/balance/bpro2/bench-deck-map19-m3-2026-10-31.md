# Focused decks: Map 19 Ashen Spurn (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool cinder-stoker,echidna-quillshot,fire-salamander,glacial-ape-king,glacier-wolf-pack,granite-ox-golem,hercules-beetle,magma-titan,obsidian-scorpion,pit-glutton,pumice-beetle,sulfur-cinder-moth,talus-pika,yeti,yeti-chieftain --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:bleed,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6822 games in 94 s.

- The list (15): Cinder Stoker, Echidna Quillshot, Fire Salamander, Glacial Ape-King, Glacier Wolf Pack, Granite Ox Golem, Hercules Beetle, Magma Titan, Obsidian Scorpion, Pit Glutton, Pumice Beetle, Sulfur Cinder Moth, Talus Pika, Yeti, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (7 resource makers) | 88% (84%-92%) | 0.75 | 0: 7, 1: 11, 2: 2 | 4x Cinder Stoker, 4x Fire Salamander, 4x Pumice Beetle, 3x Obsidian Scorpion, 3x Talus Pika, 2x Glacier Wolf Pack | 0 |
| 2 | economy | economy (8 resource makers) | 85% (82%-89%) | 0.8 | 0: 4, 1: 16 | 4x Pumice Beetle, 4x Sulfur Cinder Moth, 4x Talus Pika, 3x Hercules Beetle, 3x Obsidian Scorpion, 2x Echidna Quillshot | 10 |
| 3 | family:bleed | big (4 copies at 3+ Lumber, average 1.4); bleed x8 | 74% (68%-79%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Cinder Stoker, 4x Glacier Wolf Pack, 4x Magma Titan, 3x Hercules Beetle, 3x Obsidian Scorpion, 2x Yeti Chieftain | 11 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8); economy (4 resource makers) | 45% (39%-51%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Cinder Stoker, 4x Glacial Ape-King, 4x Pumice Beetle, 4x Yeti, 2x Hercules Beetle, 2x Yeti Chieftain | 12 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 100% | 96% | 100% | 88% | 92% | 100% | 46% | 83% |
| 2 economy | 96% | 96% | 96% | 100% | 100% | 83% | 100% | 31% | 67% |
| 3 family:bleed | 75% | 79% | 75% | 100% | 79% | 83% | 79% | 29% | 63% |
| 4 big | 42% | 46% | 50% | 88% | 58% | 50% | 42% | 8% | 21% |
