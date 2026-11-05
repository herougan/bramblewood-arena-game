# Focused decks: Map 21 The Quiet Summit (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m21 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,ashbone-ghoul,blue-ringed-octopus,chamois-leaper,eagle-owl-quartermaster,eagle-sharpshooter,ember-centipede,eyrie-warden,fumarole-ibex,glacier-yak,golden-eagle-diver,grave-grin-hyena,ibex-rockcaller,magma-titan,mountain-goat-climber,mountain-hare,obsidian-scorpion,pack-mule,peak-condor,peregrine-stooper,pika-hoarder,pumice-beetle,red-billed-chough,snow-leopard,snow-owl-sentinel,stoat-cutthroat,talus-pika,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:strike-first,open --anchor alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,ashbone-ghoul,eagle-sharpshooter,ember-centipede,eyrie-warden,glacier-yak,golden-eagle-diver,magma-titan,mountain-goat-climber,pack-mule,peak-condor,pika-hoarder,pumice-beetle,red-billed-chough,snow-leopard,snow-owl-sentinel,talus-pika --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7434 games in 128 s.

- The list (32): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Ashbone Ghoul, Blue-ringed Octopus, Chamois Leaper, Eagle-Owl Quartermaster, Eagle Sharpshooter, Ember Centipede, Eyrie Warden, Fumarole Ibex, Glacier Yak, Golden Eagle Diver, Grave-Grin Hyena, Ibex Rockcaller, Magma Rhino, Mountain Goat Climber, Mountain Hare, Obsidian Scorpion, Pack Mule, Peak Condor, Peregrine Stooper, Pika Hoarder, Pumice Beetle, Red-billed Chough, Snow Leopard, Snow Owl Sentinel, Stoat Cutthroat, Talus Pika, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 21-1 skirmish's deck; 21-2 skirmish's deck; 21-3 skirmish's deck; 21-4 elite's deck; 21-5 elite's deck; 21-6 miniboss's deck; reference starter deck under 21-1's field; reference deck (Map 21) under 21-2's field; expected player deck (expectedPlayerDeck) under 21-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (6 resource makers); flying x7 | 85% (81%-89%) | 0.6 | 0: 8, 1: 12 | 4x Golden Eagle Diver, 4x Mountain Hare, 4x Pack Mule, 3x Eagle-Owl Quartermaster, 3x Obsidian Scorpion, 2x Pumice Beetle | 16 |
| 2 | family:flying | flying x8 | 82% (78%-87%) | 0.35 | 0: 13, 1: 7 | 4x Apollo Butterfly, 4x Mountain Goat Climber, 4x Peak Condor, 3x Alpine Marmot, 3x Wolf Spider Mother, 2x Pack Mule | 15 |
| 3 | family:strike-first | economy (4 resource makers); strike-first x10 | 81% (77%-85%) | 0.35 | 0: 13, 1: 7 | 4x Golden Eagle Diver, 4x Mountain Goat Climber, 4x Pack Mule, 3x Ember Centipede, 3x Stoat Cutthroat, 2x Pika Hoarder | 13 |
| 4 | open | economy (4 resource makers) | 79% (74%-84%) | 0.4 | 0: 12, 1: 8 | 4x Pack Mule, 4x Red-billed Chough, 4x Talus Pika, 3x Stoat Cutthroat, 3x Wolf Spider Mother, 2x Blue-ringed Octopus | 0 |

## Per opponent

| Deck | fight:21-1 | fight:21-2 | fight:21-3 | fight:21-4 | fight:21-5 | fight:21-6 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 88% | 96% | 100% | 79% | 92% | 88% | 100% | 46% | 79% |
| 2 family:flying | 96% | 88% | 100% | 83% | 92% | 96% | 96% | 29% | 63% |
| 3 family:strike-first | 100% | 96% | 96% | 92% | 92% | 88% | 88% | 33% | 46% |
| 4 open | 88% | 88% | 92% | 96% | 96% | 79% | 71% | 50% | 50% |
