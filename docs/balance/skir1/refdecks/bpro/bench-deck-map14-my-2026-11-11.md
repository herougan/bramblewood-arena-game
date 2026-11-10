# Focused decks: Map 14 The Canopy (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,ancient-sloth-titan,fishing-cat,hanging-loafer,hoopoe-herald,howler-monkey,jaguar-stalker,kinkajou-lurker,leaf-chameleon,leafcutter-gardener,lyrebird-mimic,mosquito-cloud,poison-dart-croaker,poison-dart-frog,pride-queen,slow-loris,toucan-courier,war-drum-mandrill --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:night,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2352 games in 549 s.

- The list (18): Amber Cicada, Ancient Sloth Titan, Fishing Cat, Hanging Loafer, Hoopoe Herald, Howler Monkey, Jaguar Stalker, Kinkajou Lurker, Leaf Chameleon, Leafcutter Gardener, Lyrebird Mimic, Mosquito Cloud, Poison Dart Croaker, Poison Dart Frog, Pride Queen, Slow Loris, Toucan Courier, War-Drum Mandrill.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | night x7 | 83% (78%-88%) | 0.5 | 0: 10, 1: 10 | 4x Kinkajou Lurker, 4x Lyrebird Mimic, 4x Slow Loris, 3x Howler Monkey, 3x Leafcutter Gardener, 2x Leaf Chameleon | 0 |
| 2 | family:strike-first | strike-first x8 | 73% (68%-79%) | 0.4 | 0: 12, 1: 8 | 4x Hoopoe Herald, 4x Howler Monkey, 4x Slow Loris, 3x Fishing Cat, 3x Jaguar Stalker, 2x Pride Queen | 13 |
| 3 | family:night | night x8 | 70% (64%-76%) | 0.5 | 0: 10, 1: 10 | 4x Howler Monkey, 4x Kinkajou Lurker, 4x Poison Dart Croaker, 4x Toucan Courier, 2x Pride Queen, 2x Slow Loris | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0) | 41% (34%-47%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Leafcutter Gardener, 4x Slow Loris, 4x Toucan Courier, 4x War-Drum Mandrill | 13 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 96% | 58% | 96% | 79% | 100% | 83% | 58% |
| 2 family:strike-first | 83% | 100% | 92% | 67% | 83% | 75% | 67% | 21% |
| 3 family:night | 83% | 96% | 67% | 58% | 58% | 96% | 46% | 54% |
| 4 big | 42% | 58% | 38% | 42% | 54% | 42% | 46% | 4% |
