# Focused decks: Map 14 The Canopy (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,ancient-sloth-titan,barkplate-beetle,eagle-owl-quartermaster,fishing-cat,fungus-gnat-cloud,grave-grin-hyena,hanging-loafer,hoopoe-herald,howler-monkey,ibex-rockcaller,jaguar-stalker,kinkajou-lurker,leaf-chameleon,leafcutter-gardener,lyrebird-mimic,mosquito-cloud,pine-marten,poison-dart-croaker,poison-dart-frog,pride-queen,proboscis-monkey,slow-loris,squires-mount,tide-spirit,toucan-courier,vampire-bat,war-drum-mandrill,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor amber-cicada,ancient-sloth-titan,fishing-cat,hanging-loafer,hoopoe-herald,howler-monkey,jaguar-stalker,kinkajou-lurker,leaf-chameleon,leafcutter-gardener,lyrebird-mimic,mosquito-cloud,poison-dart-croaker,poison-dart-frog,pride-queen,slow-loris,toucan-courier,war-drum-mandrill --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2224 games in 203 s.

- The list (30): Amber Cicada, Ancient Sloth Titan, Barkplate Beetle, Eagle-Owl Quartermaster, Fishing Cat, Fungus Gnat Cloud, Grave-Grin Hyena, Hanging Loafer, Hoopoe Herald, Howler Monkey, Ibex Rockcaller, Jaguar Stalker, Kinkajou Lurker, Leaf Chameleon, Leafcutter Gardener, Lyrebird Mimic, Mosquito Cloud, Pine Marten, Poison Dart Croaker, Poison Dart Frog, Pride Queen, Proboscis Monkey, Slow Loris, Squire's Mount, Tide Seahorse, Toucan Courier, Vampire Bat, War-Drum Mandrill, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 2+ Lumber, average 0.8) | 79% (74%-84%) | 0.85 | 0: 11, 1: 1, 2: 8 | 4x Barkplate Beetle, 4x Hoopoe Herald, 4x Leafcutter Gardener, 4x War-Drum Mandrill, 3x Howler Monkey, 1x Squire's Mount | 16 |
| 2 | family:flying | swarm (18 copies at 0 Lumber); flying x8 | 76% (71%-81%) | 0.1 | 0: 18, 1: 2 | 4x Fungus Gnat Cloud, 4x Leafcutter Gardener, 4x Mosquito Cloud, 4x Toucan Courier, 2x Grave-Grin Hyena, 2x Kinkajou Lurker | 20 |
| 3 | open | midrange (average 0.8 Lumber) | 50% (43%-57%) | 0.8 | 0: 4, 1: 16 | 4x Howler Monkey, 4x Poison Dart Frog, 4x Weaver Bird, 3x Pine Marten, 3x Squire's Mount, 2x Amber Cicada | 0 |
| 4 | family:strike-first | strike-first x8 | 45% (40%-51%) | 0.8 | 0: 4, 1: 16 | 4x Leaf Chameleon, 4x Leafcutter Gardener, 4x Lyrebird Mimic, 3x Fishing Cat, 3x Jaguar Stalker, 2x Pride Queen | 20 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 71% | 96% | 83% | 96% | 79% | 96% | 54% | 58% |
| 2 family:flying | 92% | 100% | 54% | 79% | 83% | 100% | 42% | 58% |
| 3 open | 46% | 58% | 58% | 33% | 33% | 92% | 46% | 33% |
| 4 family:strike-first | 29% | 88% | 75% | 33% | 13% | 71% | 50% | 4% |
