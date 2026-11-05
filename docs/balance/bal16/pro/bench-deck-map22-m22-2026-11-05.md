# Focused decks: Map 22 The Rimefire Caldera (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m22 --pool ash-cloud-condor,ash-moth,ashbone-ghoul,badger-berserker,caldera-snow-leopard,cinder-gecko,cinder-hornet,cinder-skeleton,eagle-owl-quartermaster,echidna-quillshot,ember-centipede,ember-jackal,fire-salamander,fumarole-ibex,glacier-wolf-pack,glacier-yak,grave-grin-hyena,ibex-rockcaller,ice-petrel,magma-wraith,obsidian-scorpion,ossuary-lammergeier,phoenix-fledgling,pumice-beetle,ravenous-wolverine,rimefire-salamander,rimeheart-colossus,snow-bunting-archer,stoat-cutthroat,the-contradiction,tide-spirit,ur-elk,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:cold,family:flying,big,open --anchor ash-cloud-condor,ashbone-ghoul,badger-berserker,caldera-snow-leopard,cinder-gecko,cinder-hornet,cinder-skeleton,echidna-quillshot,ember-centipede,ember-jackal,fumarole-ibex,glacier-wolf-pack,glacier-yak,ice-petrel,obsidian-scorpion,phoenix-fledgling,pumice-beetle,ravenous-wolverine,rimefire-salamander,rimeheart-colossus,tide-spirit,ur-elk --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7216 games in 111 s.

- The list (34): Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Badger Berserker, Caldera Snow Leopard, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Eagle-Owl Quartermaster, Echidna Quillshot, Ember Centipede, Ember Jackal, Fire Salamander, Fumarole Ibex, Glacier Wolf Pack, Glacier Yak, Grave-Grin Hyena, Ibex Rockcaller, Ice Petrel, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Phoenix Fledgling, Pumice Beetle, Ravenous Wolverine, Rimefire Salamander, Rimeheart Mammoth, Snow Bunting Archer, Stoat Cutthroat, The Contradiction, Tide Seahorse, Ür-Elk, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 22-1 skirmish's deck; 22-2 skirmish's deck; 22-3 skirmish's deck; 22-4 skirmish's deck; 22-5 skirmish's deck; 22-6 elite's deck; 22-7 elite's deck; 22-8 miniboss's deck; reference starter deck under 22-1's field; reference deck (Map 22) under 22-2's field; expected player deck (expectedPlayerDeck) under 22-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | strike-first x7 | 71% (66%-76%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Gecko, 4x Ember Centipede, 3x Badger Berserker, 3x Grave-Grin Hyena, 3x Rimefire Salamander, 3x Stoat Cutthroat | 0 |
| 2 | family:flying | big (4 copies at 2+ Lumber, average 1.2); flying x11 | 40% (34%-45%) | 1.2 | 1: 16, 2: 4 | 4x Ash Moth, 4x Phoenix Fledgling, 3x Badger Berserker, 3x Eagle-Owl Quartermaster, 3x Ember Jackal, 3x Obsidian Scorpion | 17 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1) | 37% (32%-42%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Glacier Yak, 4x Grave-Grin Hyena, 4x Phoenix Fledgling, 3x Cinder Gecko, 3x Stoat Cutthroat, 2x Tide Seahorse | 11 |
| 4 | family:cold | big (8 copies at 2+ Lumber, average 1.4); cold x10; ranged x6 | 32% (27%-37%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Glacier Wolf Pack, 4x Glacier Yak, 4x Grave-Grin Hyena, 3x Ice Petrel, 3x Rimefire Salamander, 2x Ibex Rockcaller | 14 |

## Per opponent

| Deck | fight:22-1 | fight:22-2 | fight:22-3 | fight:22-4 | fight:22-5 | fight:22-6 | fight:22-7 | fight:22-8 | ref:starter | ref:road22 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 71% | 75% | 92% | 33% | 50% | 75% | 81% | 92% | 63% | 50% |
| 2 family:flying | 96% | 29% | 38% | 58% | 38% | 25% | 8% | 35% | 46% | 38% | 25% |
| 3 big | 79% | 38% | 29% | 69% | 25% | 21% | 17% | 42% | 71% | 13% | 8% |
| 4 family:cold | 75% | 33% | 29% | 67% | 13% | 17% | 17% | 54% | 33% | 4% | 13% |
