# Focused decks: Map 14 Savanna Reaches (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool badger-lumberjack,balloon-archer,bramble-sprout,bramblewood-macaque,cunning-vixen,dust-hyena,grizzly-vanguard,hollow-belly-rat,hoopoe-herald,marula-elephant,meerkat-sentry,plains-zebra,pride-queen,river-mink,savanna-cheetah,sergeant-bramblefox,stoat-cutthroat,tasmanian-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:strike-first,family:guard,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6996 games in 88 s.

- The list (18): Badger Lumberjack, Balloon Archer, Bramble Sprout, Bramblewood Macaque, Cunning Vixen, Dust Hyena, Grizzly Vanguard, Hollow-belly Rat, Hoopoe Herald, Marula Elephant, Meerkat Sentry, Plains Zebra, Pride Queen, River Mink, Savanna Cheetah, Sergeant Bramblefox, Stoat Cutthroat, Tasmanian Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (9 copies at 1+ Lumber, average 0.5); strike-first x9; evasion x8 | 88% (85%-91%) | 0.45 | 0: 11, 1: 9 | 4x Cunning Vixen, 4x Hoopoe Herald, 4x Plains Zebra, 3x Bramblewood Macaque, 3x Stoat Cutthroat, 2x Pride Queen | 16 |
| 2 | open | big (12 copies at 1+ Lumber, average 0.6) | 88% (84%-91%) | 0.6 | 0: 8, 1: 12 | 4x Balloon Archer, 4x Bramble Sprout, 4x Hoopoe Herald, 3x Badger Lumberjack, 3x Meerkat Sentry, 2x Savanna Cheetah | 0 |
| 3 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (7 resource makers) | 85% (82%-89%) | 0.4 | 0: 12, 1: 8 | 4x Dust Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 3x Badger Lumberjack, 3x Sergeant Bramblefox, 2x Pride Queen | 13 |
| 4 | family:guard | big (12 copies at 1+ Lumber, average 0.8); economy (7 resource makers); guard x8 | 72% (68%-77%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Badger Lumberjack, 4x Grizzly Vanguard, 4x Meerkat Sentry, 3x Bramblewood Macaque, 3x Dust Hyena, 2x Hoopoe Herald | 12 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 100% | 100% | 100% | 96% | 88% | 96% | 96% | 92% | 96% | 46% | 58% |
| 2 open | 100% | 100% | 100% | 100% | 83% | 88% | 100% | 63% | 100% | 71% | 63% |
| 3 economy | 100% | 96% | 100% | 92% | 92% | 96% | 100% | 71% | 96% | 42% | 54% |
| 4 family:guard | 100% | 83% | 96% | 83% | 79% | 67% | 96% | 38% | 96% | 21% | 38% |
