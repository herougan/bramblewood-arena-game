# Focused decks: Map 16 The Pinewood Taiga (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alley-cat,anvil-thrush,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,grave-grin-hyena,grizzly-vanguard,ibex-rockcaller,lyrebird-mimic,mountain-hare,owl-nightwatch,pinecone-crossbill,pronghorn-racer,redwood-woodpecker,snowshoe-hare,springbok-pronker,squires-mount,taiga-lynx,tide-spirit,timber-wolf-pack,wolf-spider-mother,woodland-caribou --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus economy,family:evasion,family:cleave,open --anchor berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,dhole-runner,grizzly-vanguard,mountain-hare,owl-nightwatch,pinecone-crossbill,redwood-woodpecker,snowshoe-hare,taiga-lynx,timber-wolf-pack,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2600 games in 472 s.

- The list (27): Alley Cat, Anvil Thrush, Berserker Boar, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Grave-Grin Hyena, Grizzly Vanguard, Ibex Rockcaller, Lyrebird Mimic, Mountain Hare, Owl Nightwatch, Pinecone Crossbill, Pronghorn Racer, Redwood Woodpecker, Snowshoe Hare, Springbok Pronker, Squire's Mount, Taiga Lynx, Tide Seahorse, Timber Wolf Pack Leader, Wolf Spider Mother, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers); swarm x6 | 74% (69%-79%) | 0.6 | 0: 8, 1: 12 | 4x Alley Cat, 4x Cone-cutter Squirrel, 4x Dhole Runner, 3x Bramblewood Lynx, 3x Taiga Lynx, 2x Wolf Spider Mother | 0 |
| 2 | family:evasion | big (10 copies at 1+ Lumber, average 0.5); evasion x8 | 70% (65%-76%) | 0.5 | 0: 10, 1: 10 | 4x Alley Cat, 4x Mountain Hare, 4x Owl Nightwatch, 4x Pronghorn Racer, 2x Cone-cutter Squirrel, 2x Ibex Rockcaller | 14 |
| 3 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 68% (63%-73%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Pinecone Crossbill, 4x Pronghorn Racer, 4x Redwood Woodpecker, 4x Woodland Caribou | 16 |
| 4 | family:cleave | big (12 copies at 1+ Lumber, average 0.8); economy (4 resource makers); cleave x8 | 57% (51%-62%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Alley Cat, 4x Cone-cutter Squirrel, 4x Grizzly Vanguard, 4x Lyrebird Mimic, 3x Timber Wolf Pack Leader, 1x Bramblewood Lynx | 11 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 50% | 83% | 58% | 83% | 83% | 92% | 96% | 50% | 54% |
| 2 family:evasion | 79% | 50% | 75% | 63% | 88% | 79% | 67% | 79% | 54% | 71% |
| 3 economy | 96% | 54% | 75% | 38% | 75% | 88% | 58% | 100% | 54% | 42% |
| 4 family:cleave | 75% | 54% | 71% | 38% | 79% | 71% | 50% | 83% | 17% | 29% |
