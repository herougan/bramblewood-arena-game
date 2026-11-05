# Focused decks: Map 20 Volcano Lair (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,ash-moth,ashbone-ghoul,caldera-wyrm,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,granite-ox-golem,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,pack-mule,salamander-pyromancer,stalactite-golem,tide-spirit,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:fire,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6566 games in 121 s.

- The list (19): Ancient Sloth Titan, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, The Caldera Wyrm, Cinder Stoker, Cave Bear, Ember Centipede, Ember Jackal, Granite Ox Golem, Magma Salamander, Magma Rhino, Magma Wraith, Obsidian Scorpion, Pack Mule, Salamander Pyromancer, Stalactite Pill Bug, Tide Seahorse, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | ranged x6; fire x6 | 82% (77%-87%) | 0.6 | 0: 8, 1: 12 | 4x Ashbone Ghoul, 4x Ember Centipede, 4x Magma Wraith, 3x Ember Jackal, 3x Obsidian Scorpion, 2x Magma Salamander | 0 |
| 2 | family:armor | economy (4 resource makers); armor x8 | 55% (49%-62%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Cinder Stoker, 4x Magma Wraith, 4x Pack Mule, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 1x The Caldera Wyrm | 13 |
| 3 | family:fire | fire x9; ranged x6 | 52% (45%-58%) | 0.9 | 0: 8, 1: 9, 3: 3 | 4x Ashbone Ghoul, 4x Cinder Stoker, 4x Magma Wraith, 3x Ash Cloud Condor, 3x Magma Rhino, 2x Magma Salamander | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); economy (4 resource makers) | 34% (28%-40%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Cinder Stoker, 4x Pack Mule, 4x Vampire Roost, 2x Ember Jackal, 2x Tide Seahorse | 18 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 46% | 58% | 92% | 92% | 100% | 92% | 96% |
| 2 family:armor | 17% | 38% | 71% | 79% | 71% | 67% | 46% |
| 3 family:fire | 21% | 8% | 71% | 79% | 79% | 42% | 63% |
| 4 big | 4% | 17% | 58% | 42% | 71% | 21% | 25% |
