# Focused decks: Map 20 Volcano Lair (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,ash-cloud-condor,cinder-hornet,cinder-stoker,deep-cave-troll,ember-centipede,ember-jackal,ember-wisp,gorge-wyrm,granite-ox-golem,lava-waders,magma-salamander,magma-titan,phoenix-fledgling,pyroclast-wyrm,salamander-pyromancer,stalactite-golem,thunder-lizard,vampire-roost --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:fire,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2394 games in 401 s.

- The list (19): Ancient Sloth Titan, Ash Cloud Condor, Cinder Hornet, Cinder Stoker, Cave Bear, Ember Centipede, Ember Jackal, Ember Firefly, Gorge Wyrm, Granite Ox Golem, Lava Waders, Magma Salamander, Magma Rhino, Phoenix Fledgling, Pyroclast Wyrm, Salamander Pyromancer, Stalactite Pill Bug, Thunder Lizard, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x10 | 64% (57%-70%) | 1 | 0: 7, 1: 6, 2: 7 | 4x Cinder Stoker, 4x Phoenix Fledgling, 3x Ash Cloud Condor, 3x Cinder Hornet, 3x Ember Jackal, 3x Ember Firefly | 10 |
| 2 | big | big (10 copies at 2+ Lumber, average 1.4); guard x6 | 35% (28%-41%) | 1.45 | 0: 7, 1: 3, 2: 4, 3: 6 | 4x Cinder Stoker, 4x Gorge Wyrm, 4x Stalactite Pill Bug, 3x Ember Jackal, 3x Ember Firefly, 2x Ancient Sloth Titan | 16 |
| 3 | family:fire | big (8 copies at 2+ Lumber, average 1.1); fire x8 | 33% (27%-40%) | 1.05 | 0: 11, 1: 1, 2: 4, 3: 4 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Ember Centipede, 4x Magma Rhino, 3x Ember Firefly, 1x Salamander Pyromancer | 11 |
| 4 | open | big (8 copies at 2+ Lumber, average 1.2); flying x7 | 20% (15%-26%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Cinder Hornet, 4x Cinder Stoker, 4x Lava Waders, 4x Vampire Roost, 3x Ash Cloud Condor, 1x Salamander Pyromancer | 0 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 42% | 17% | 79% | 83% | 96% | 63% | 67% |
| 2 big | 4% | 8% | 75% | 46% | 33% | 42% | 33% |
| 3 family:fire | 13% | 8% | 46% | 25% | 63% | 38% | 42% |
| 4 open | 8% | 0% | 17% | 25% | 50% | 25% | 17% |
