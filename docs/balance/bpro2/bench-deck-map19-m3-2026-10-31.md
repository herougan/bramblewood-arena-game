# Focused decks: Map 19 Ashen Spurn (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool cinder-stoker,echidna-quillshot,fire-salamander,glacial-ape-king,glacier-wolf-pack,hercules-beetle,magma-titan,obsidian-scorpion,phoenix-fledgling,porcupine-roller,pumice-beetle,quill-volley,talus-pika,yeti --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:bleed,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7038 games in 69 s.

- The list (14): Cinder Stoker, Echidna Quillshot, Fire Salamander, Glacial Ape-King, Glacier Wolf Pack, Hercules Beetle, Magma Titan, Obsidian Scorpion, Phoenix Fledgling, Porcupine Roller, Pumice Beetle, Quill Volley, Talus Pika, Yeti.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers) | 87% (83%-91%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Stoker, 4x Porcupine Roller, 4x Pumice Beetle, 3x Hercules Beetle, 3x Talus Pika, 2x Obsidian Scorpion | 7 |
| 2 | open | economy (4 resource makers) | 86% (82%-90%) | 0.75 | 0: 7, 1: 11, 2: 2 | 4x Cinder Stoker, 4x Fire Salamander, 4x Pumice Beetle, 3x Obsidian Scorpion, 3x Porcupine Roller, 2x Glacier Wolf Pack | 0 |
| 3 | family:bleed | bleed x8 | 61% (56%-67%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Cinder Stoker, 4x Glacier Wolf Pack, 4x Magma Titan, 4x Porcupine Roller, 2x Hercules Beetle, 2x Talus Pika | 11 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.5); economy (4 resource makers) | 48% (42%-54%) | 1.5 | 0: 10, 1: 2, 3: 4, 4: 4 | 4x Glacial Ape-King, 4x Porcupine Roller, 4x Talus Pika, 4x Yeti, 2x Cinder Stoker, 2x Obsidian Scorpion | 13 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 96% | 100% | 92% | 79% | 96% | 42% | 88% |
| 2 open | 92% | 88% | 88% | 100% | 96% | 83% | 100% | 38% | 88% |
| 3 family:bleed | 71% | 63% | 71% | 96% | 79% | 33% | 67% | 4% | 67% |
| 4 big | 33% | 33% | 42% | 96% | 79% | 29% | 71% | 17% | 33% |
