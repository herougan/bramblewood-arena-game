# Focused decks: Map 22 The Rimefire Caldera (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m22 --pool ash-cloud-condor,ashbone-ghoul,badger-berserker,caldera-snow-leopard,cinder-gecko,cinder-hornet,cinder-skeleton,echidna-quillshot,ember-centipede,ember-jackal,fumarole-ibex,glacier-wolf-pack,glacier-yak,ice-petrel,obsidian-scorpion,phoenix-fledgling,pumice-beetle,ravenous-wolverine,rimefire-salamander,rimeheart-colossus,tide-spirit,ur-elk --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:cold,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7304 games in 108 s.

- The list (22): Ash Cloud Condor, Ashbone Ghoul, Badger Berserker, Caldera Snow Leopard, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Echidna Quillshot, Ember Centipede, Ember Jackal, Fumarole Ibex, Glacier Wolf Pack, Glacier Yak, Ice Petrel, Obsidian Scorpion, Phoenix Fledgling, Pumice Beetle, Ravenous Wolverine, Rimefire Salamander, Rimeheart Mammoth, Tide Seahorse, Ür-Elk.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 22-1 skirmish's deck; 22-2 skirmish's deck; 22-3 skirmish's deck; 22-4 skirmish's deck; 22-5 skirmish's deck; 22-6 elite's deck; 22-7 elite's deck; 22-8 miniboss's deck; reference starter deck under 22-1's field; reference deck (Map 22) under 22-2's field; expected player deck (expectedPlayerDeck) under 22-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 72% (67%-77%) | 0.6 | 0: 8, 1: 12 | 4x Ashbone Ghoul, 4x Cinder Gecko, 3x Ember Jackal, 3x Pumice Beetle, 3x Ravenous Wolverine, 3x Rimefire Salamander | 0 |
| 2 | family:flying | big (8 copies at 2+ Lumber, average 1.2); flying x8 | 55% (50%-61%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Phoenix Fledgling, 3x Ember Jackal, 3x Rimefire Salamander, 2x Cinder Skeleton | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.3) | 48% (43%-54%) | 1.25 | 0: 3, 1: 9, 2: 8 | 4x Glacier Wolf Pack, 4x Phoenix Fledgling, 3x Ashbone Ghoul, 3x Badger Berserker, 3x Ravenous Wolverine, 3x Rimefire Salamander | 11 |
| 4 | family:cold | big (4 copies at 2+ Lumber, average 1.2); cold x11; ranged x7 | 43% (38%-48%) | 1.2 | 0: 4, 1: 12, 3: 4 | 4x Cinder Gecko, 4x Glacier Yak, 4x Ice Petrel, 3x Ember Jackal, 3x Rimefire Salamander, 2x Badger Berserker | 10 |

## Per opponent

| Deck | fight:22-1 | fight:22-2 | fight:22-3 | fight:22-4 | fight:22-5 | fight:22-6 | fight:22-7 | fight:22-8 | ref:starter | ref:road22 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 63% | 79% | 92% | 46% | 71% | 63% | 77% | 96% | 92% | 25% |
| 2 family:flying | 83% | 58% | 58% | 67% | 38% | 42% | 35% | 67% | 79% | 58% | 21% |
| 3 big | 96% | 46% | 46% | 75% | 42% | 17% | 25% | 56% | 58% | 54% | 17% |
| 4 family:cold | 88% | 46% | 42% | 63% | 25% | 21% | 25% | 73% | 42% | 38% | 13% |
