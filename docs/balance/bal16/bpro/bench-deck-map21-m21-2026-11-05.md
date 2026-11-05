# Focused decks: Map 21 The Quiet Summit (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m21 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,ashbone-ghoul,eagle-sharpshooter,ember-centipede,eyrie-warden,glacier-yak,golden-eagle-diver,magma-titan,mountain-goat-climber,pack-mule,peak-condor,pika-hoarder,pumice-beetle,red-billed-chough,snow-leopard,snow-owl-sentinel,talus-pika --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:flying,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7344 games in 127 s.

- The list (20): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Ashbone Ghoul, Eagle Sharpshooter, Ember Centipede, Eyrie Warden, Glacier Yak, Golden Eagle Diver, Magma Rhino, Mountain Goat Climber, Pack Mule, Peak Condor, Pika Hoarder, Pumice Beetle, Red-billed Chough, Snow Leopard, Snow Owl Sentinel, Talus Pika.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 21-1 skirmish's deck; 21-2 skirmish's deck; 21-3 skirmish's deck; 21-4 elite's deck; 21-5 elite's deck; 21-6 miniboss's deck; reference starter deck under 21-1's field; reference deck (Map 21) under 21-2's field; expected player deck (expectedPlayerDeck) under 21-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (14 copies at 0 Lumber); strike-first x8; flying x8 | 74% (69%-79%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Swift, 4x Golden Eagle Diver, 4x Pika Hoarder, 3x Alpine Marmot, 3x Pack Mule, 2x Snow Leopard | 13 |
| 2 | economy | swarm (15 copies at 0 Lumber); economy (8 resource makers) | 72% (67%-77%) | 0.25 | 0: 15, 1: 5 | 4x Mountain Goat Climber, 4x Pack Mule, 4x Pika Hoarder, 4x Pumice Beetle, 3x Alpine Marmot, 1x Alpine Salamander | 13 |
| 3 | open | flying x9; ranged x8 | 67% (62%-73%) | 0.75 | 0: 11, 1: 4, 2: 4, 3: 1 | 4x Ashbone Ghoul, 4x Eagle Sharpshooter, 4x Peak Condor, 4x Pika Hoarder, 3x Alpine Marmot, 1x Eyrie Warden | 0 |
| 4 | family:strike-first | flying x12; strike-first x8 | 64% (58%-70%) | 0.35 | 0: 13, 1: 7 | 4x Alpine Swift, 4x Apollo Butterfly, 4x Golden Eagle Diver, 4x Talus Pika, 3x Pumice Beetle, 1x Alpine Marmot | 19 |

## Per opponent

| Deck | fight:21-1 | fight:21-2 | fight:21-3 | fight:21-4 | fight:21-5 | fight:21-6 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 88% | 79% | 92% | 88% | 79% | 71% | 100% | 17% | 50% |
| 2 economy | 83% | 92% | 100% | 71% | 79% | 75% | 92% | 8% | 46% |
| 3 open | 83% | 79% | 88% | 54% | 71% | 71% | 92% | 13% | 54% |
| 4 family:strike-first | 75% | 71% | 88% | 63% | 75% | 58% | 92% | 13% | 42% |
