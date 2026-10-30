# Focused decks: Map 19 Ashen Spurn (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool alpine-salamander,apollo-butterfly,cinder-stoker,eagle-owl-quartermaster,echidna-quillshot,fire-salamander,glacial-ape-king,glacier-wolf-pack,grave-grin-hyena,guano-beetle,hercules-beetle,ibex-rockcaller,lantern-spark-fly,magma-titan,mosquito-cloud,obsidian-scorpion,phoenix-fledgling,porcupine-roller,pumice-beetle,quill-volley,squires-mount,stag-beetle,stoat-cutthroat,talus-pika,wolf-spider-mother,yeti --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor cinder-stoker,echidna-quillshot,fire-salamander,glacial-ape-king,glacier-wolf-pack,hercules-beetle,magma-titan,obsidian-scorpion,phoenix-fledgling,porcupine-roller,pumice-beetle,quill-volley,talus-pika,yeti --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13104 games in 198 s.

- The list (26): Alpine Salamander, Apollo Butterfly, Cinder Stoker, Eagle-Owl Quartermaster, Echidna Quillshot, Fire Salamander, Glacial Ape-King, Glacier Wolf Pack, Grave-Grin Hyena, Guano Beetle, Hercules Beetle, Ibex Rockcaller, Lantern Spark Fly, Magma Titan, Mosquito Cloud, Obsidian Scorpion, Phoenix Fledgling, Porcupine Roller, Pumice Beetle, Quill Volley, Squire's Mount, Stag Beetle, Stoat Cutthroat, Talus Pika, Wolf Spider Mother, Yeti.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 90% (86%-94%) | 0.6 | 0: 8, 1: 12 | 4x Fire Salamander, 4x Guano Beetle, 4x Porcupine Roller, 3x Eagle-Owl Quartermaster, 3x Stag Beetle, 2x Echidna Quillshot | 0 |
| 2 | economy | economy (8 resource makers) | 88% (84%-92%) | 0.8 | 0: 4, 1: 16 | 4x Alpine Salamander, 4x Pumice Beetle, 4x Talus Pika, 3x Eagle-Owl Quartermaster, 3x Stoat Cutthroat, 2x Obsidian Scorpion | 17 |
| 3 | swarm | swarm (15 copies at 0 Lumber); spite x7 | 81% (77%-86%) | 0.25 | 0: 15, 1: 5 | 4x Cinder Stoker, 4x Grave-Grin Hyena, 4x Porcupine Roller, 3x Apollo Butterfly, 3x Wolf Spider Mother, 2x Fire Salamander | 14 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.8); economy (4 resource makers) | 75% (69%-80%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Glacial Ape-King, 4x Talus Pika, 4x Yeti, 3x Obsidian Scorpion, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 20 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 88% | 83% | 96% | 92% | 100% | 100% | 71% | 79% |
| 2 economy | 96% | 96% | 88% | 100% | 96% | 88% | 100% | 63% | 67% |
| 3 swarm | 96% | 96% | 75% | 96% | 88% | 63% | 92% | 38% | 92% |
| 4 big | 100% | 88% | 67% | 79% | 63% | 63% | 83% | 46% | 83% |
