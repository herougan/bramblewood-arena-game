# Focused decks: Map 19 Basalt Foundry (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool ashbone-ghoul,badger-berserker,booming-bittern,cinder-gecko,cinder-hornet,cinder-skeleton,eagle-owl-quartermaster,ember-centipede,ember-revenant,fumarole-ibex,granite-ox-golem,grave-grin-hyena,grindstone-boar,ibex-rockcaller,magma-titan,magma-wraith,obsidian-scorpion,peak-condor,pumice-beetle,rimefire-salamander,smoke-raccoon,stalactite-golem,star-nosed-mole,stoat-cutthroat,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:ranged,big,open --anchor booming-bittern,cinder-gecko,cinder-hornet,ember-revenant,granite-ox-golem,grindstone-boar,magma-titan,obsidian-scorpion,peak-condor,pumice-beetle,smoke-raccoon,stalactite-golem,star-nosed-mole,stoat-cutthroat --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9568 games in 120 s.

- The list (26): Ashbone Ghoul, Badger Berserker, Booming Bittern, Cinder Gecko, Cinder Hornet, Cinder Skeleton, Eagle-Owl Quartermaster, Ember Centipede, Ember Revenant, Fumarole Ibex, Granite Ox Golem, Grave-Grin Hyena, Grindstone Boar, Ibex Rockcaller, Magma Rhino, Magma Wraith, Obsidian Scorpion, Peak Condor, Pumice Beetle, Rimefire Salamander, Smokescreen Raccoon, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.3 Lumber) | 89% (86%-92%) | 0.35 | 0: 13, 1: 7 | 4x Cinder Gecko, 4x Grave-Grin Hyena, 4x Peak Condor, 3x Badger Berserker, 3x Star-nosed Mole, 2x Tide Seahorse | 0 |
| 2 | family:evasion | evasion x8 | 86% (82%-89%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Grave-Grin Hyena, 4x Smokescreen Raccoon, 2x Stoat Cutthroat, 2x Tide Seahorse | 10 |
| 3 | family:ranged | ranged x11 | 79% (75%-83%) | 0.7 | 0: 6, 1: 14 | 4x Magma Wraith, 4x Peak Condor, 4x Star-nosed Mole, 3x Rimefire Salamander, 3x Stoat Cutthroat, 2x Tide Seahorse | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); flying x7 | 63% (59%-68%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Cinder Hornet, 4x Grave-Grin Hyena, 4x Stalactite Pill Bug, 3x Peak Condor, 3x Wolf Spider Mother, 2x Tide Seahorse | 11 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 96% | 88% | 79% | 100% | 92% | 96% | 96% | 88% | 100% | 63% | 58% |
| 2 family:evasion | 92% | 100% | 100% | 71% | 79% | 100% | 96% | 92% | 92% | 88% | 96% | 54% | 58% |
| 3 family:ranged | 92% | 92% | 92% | 67% | 58% | 88% | 92% | 92% | 92% | 96% | 88% | 54% | 25% |
| 4 big | 71% | 96% | 88% | 29% | 54% | 92% | 63% | 71% | 75% | 83% | 75% | 17% | 8% |
