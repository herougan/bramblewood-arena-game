# Focused decks: Map 20 Volcano Lair (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,cinder-hornet,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,ember-wisp,gorge-wyrm,granite-ox-golem,lava-waders,magma-salamander,magma-titan,pyroclast-wyrm,salamander-pyromancer,stalactite-golem,thunder-lizard,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:fire,family:cleave,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6720 games in 97 s.

- The list (18): Ancient Sloth Titan, Ash Cloud Condor, Cinder Hornet, Cinder Stoker, Cave Bear, Ember Centipede, Ember Jackal, Ember Firefly, Gorge Wyrm, Granite Ox Golem, Lava Waders, Magma Salamander, Magma Rhino, Pyroclast Wyrm, Salamander Pyromancer, Stalactite Pill Bug, Thunder Lizard, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 2+ Lumber, average 0.9) | 70% (64%-75%) | 0.95 | 0: 9, 1: 3, 2: 8 | 4x Cinder Stoker, 4x Stalactite Pill Bug, 4x Vampire Roost, 3x Ember Jackal, 3x Ember Firefly, 2x Ember Centipede | 10 |
| 2 | family:fire | big (8 copies at 2+ Lumber, average 1.1); fire x8 | 66% (60%-73%) | 1.05 | 0: 11, 1: 1, 2: 4, 3: 4 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Ember Centipede, 4x Magma Rhino, 3x Ember Firefly, 1x Salamander Pyromancer | 12 |
| 3 | open | big (10 copies at 2+ Lumber, average 1.3); flying x7 | 66% (60%-72%) | 1.3 | 0: 4, 1: 6, 2: 10 | 4x Cinder Hornet, 4x Cinder Stoker, 3x Ash Cloud Condor, 3x Ember Jackal, 3x Granite Ox Golem, 3x Stalactite Pill Bug | 0 |
| 4 | family:cleave | big (8 copies at 2+ Lumber, average 1.4); cleave x8; ranged x6 | 60% (54%-66%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Cinder Stoker, 4x Gorge Wyrm, 4x Pyroclast Wyrm, 3x Ember Jackal, 3x Ember Firefly, 2x Magma Salamander | 13 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 83% | 92% | 100% | 100% | 33% | 50% | 29% |
| 2 family:fire | 63% | 71% | 88% | 100% | 63% | 38% | 42% |
| 3 open | 71% | 83% | 83% | 96% | 50% | 46% | 33% |
| 4 family:cleave | 67% | 79% | 96% | 92% | 33% | 25% | 29% |
