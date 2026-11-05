# Focused decks: Map 19 Basalt Foundry (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvilwhisker-otter,ash-cloud-condor,ash-moth,ashbone-ghoul,badger-berserker,cinder-gecko,cinder-skeleton,cinder-stoker,eagle-owl-quartermaster,ember-centipede,ember-jackal,ember-revenant,fire-salamander,fumarole-ibex,grave-grin-hyena,hercules-beetle,ibex-rockcaller,magma-salamander,magma-wraith,ore-smelter-mole,phoenix-fledgling,quill-volley,rimefire-salamander,stoat-cutthroat,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:fire,family:flying,big,open --anchor anvilwhisker-otter,ash-cloud-condor,ashbone-ghoul,cinder-gecko,cinder-stoker,ember-jackal,ember-revenant,fire-salamander,hercules-beetle,magma-salamander,ore-smelter-mole,phoenix-fledgling,quill-volley,tide-spirit --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7670 games in 138 s.

- The list (26): Anvilwhisker Otter, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Badger Berserker, Cinder Gecko, Cinder Skeleton, Cinder Stoker, Eagle-Owl Quartermaster, Ember Centipede, Ember Jackal, Ember Revenant, Fire Salamander, Fumarole Ibex, Grave-Grin Hyena, Hercules Beetle, Ibex Rockcaller, Magma Salamander, Magma Wraith, Ore-Smelter Mole, Phoenix Fledgling, Quill Volley, Rimefire Salamander, Stoat Cutthroat, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:fire | big (12 copies at 1+ Lumber, average 0.6); fire x9 | 88% (85%-92%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Stoker, 4x Fire Salamander, 4x Grave-Grin Hyena, 3x Badger Berserker, 3x Rimefire Salamander, 2x Magma Salamander | 16 |
| 2 | open | evasion x8 | 87% (83%-90%) | 0.35 | 0: 13, 1: 7 | 4x Ashbone Ghoul, 4x Cinder Gecko, 4x Grave-Grin Hyena, 4x Magma Wraith, 3x Ember Jackal, 1x Tide Seahorse | 0 |
| 3 | big | big (14 copies at 1+ Lumber, average 0.7) | 70% (65%-75%) | 0.7 | 0: 6, 1: 14 | 4x Ash Moth, 4x Cinder Stoker, 4x Magma Wraith, 3x Hercules Beetle, 3x Quill Volley, 2x Tide Seahorse | 15 |
| 4 | family:flying | big (17 copies at 1+ Lumber, average 1.1); flying x11; ranged x6 | 63% (58%-68%) | 1.05 | 0: 3, 1: 13, 2: 4 | 4x Ash Moth, 4x Phoenix Fledgling, 3x Cinder Gecko, 3x Eagle-Owl Quartermaster, 3x Ember Jackal, 3x Rimefire Salamander | 14 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:fire | 92% | 88% | 75% | 96% | 96% | 92% | 79% | 83% | 96% | 96% | 100% | 67% | 92% |
| 2 open | 100% | 75% | 75% | 96% | 96% | 88% | 83% | 88% | 92% | 92% | 100% | 75% | 67% |
| 3 big | 83% | 63% | 63% | 92% | 88% | 79% | 71% | 50% | 71% | 63% | 88% | 42% | 63% |
| 4 family:flying | 75% | 54% | 63% | 88% | 71% | 75% | 63% | 33% | 63% | 67% | 79% | 38% | 54% |
