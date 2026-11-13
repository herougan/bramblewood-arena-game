# Focused decks: Map 19 Basalt Foundry (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool booming-bittern,cinder-gecko,cinder-hornet,ember-revenant,granite-ox-golem,grindstone-boar,magma-titan,obsidian-scorpion,peak-condor,pumice-beetle,smoke-raccoon,stalactite-golem,star-nosed-mole,stoat-cutthroat --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7592 games in 72 s.

- The list (14): Booming Bittern, Cinder Gecko, Cinder Hornet, Ember Revenant, Granite Ox Golem, Grindstone Boar, Magma Rhino, Obsidian Scorpion, Peak Condor, Pumice Beetle, Smokescreen Raccoon, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | evasion x11 | 81% (77%-85%) | 0.6 | 0: 8, 1: 12 | 4x Cinder Gecko, 4x Smokescreen Raccoon, 4x Star-nosed Mole, 3x Booming Bittern, 3x Obsidian Scorpion, 2x Pumice Beetle | 11 |
| 2 | big | big (8 copies at 2+ Lumber, average 1.0) | 71% (67%-76%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Cinder Gecko, 4x Cinder Hornet, 4x Stalactite Pill Bug, 4x Star-nosed Mole, 3x Stoat Cutthroat, 1x Obsidian Scorpion | 12 |
| 3 | open | economy (4 resource makers); flying x7 | 63% (59%-68%) | 1.05 | 0: 4, 1: 11, 2: 5 | 4x Peak Condor, 4x Pumice Beetle, 4x Star-nosed Mole, 3x Cinder Hornet, 3x Obsidian Scorpion, 2x Ember Revenant | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 88% | 96% | 92% | 58% | 88% | 96% | 83% | 83% | 88% | 92% | 92% | 58% | 38% |
| 2 big | 83% | 96% | 92% | 46% | 67% | 96% | 67% | 79% | 92% | 79% | 71% | 33% | 29% |
| 3 open | 54% | 88% | 79% | 54% | 33% | 88% | 58% | 92% | 92% | 71% | 88% | 8% | 21% |
