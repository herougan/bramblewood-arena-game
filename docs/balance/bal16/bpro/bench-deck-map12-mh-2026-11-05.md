# Focused decks: Map 12 The Briar Maze (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool ant-hill,badger-lumberjack,bramble-hoglet,carrion-crow,cunning-vixen,dormouse,field-mouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,hollow-belly-rat,lyrebird-mimic,mouse-sapper,quill-thorn-boar,quillguard,thorn-shrike,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 175 s.

- The list (17): Ant Hill, Badger Lumberjack, Bramble Hoglet, Carrion Crow, Cunning Vixen, Dormouse, Field Mouse, Hawthorn Shieldbug, Hedge Weasel, Hedgerow Shrew, Hollow-belly Rat, Lyrebird Mimic, Mouse Sapper, Quill-Thorn Boar, Quillguard, Thorn Shrike, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4) | 73% (68%-78%) | 0.4 | 0: 12, 1: 8 | 4x Dormouse, 4x Field Mouse, 4x Hawthorn Shieldbug, 4x Mouse Sapper, 3x Hedge Weasel, 1x Bramble Hoglet | 14 |
| 2 | economy | big (10 copies at 1+ Lumber, average 0.7); economy (6 resource makers); guard x6 | 71% (66%-76%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Ant Hill, 4x Carrion Crow, 4x Dormouse, 4x Hawthorn Shieldbug, 2x Badger Lumberjack, 2x Field Mouse | 11 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 65% (60%-71%) | 0.45 | 0: 11, 1: 9 | 4x Carrion Crow, 4x Woodcock Lookout, 3x Field Mouse, 3x Hawthorn Shieldbug, 3x Quill-Thorn Boar, 3x Quillguard | 0 |
| 4 | family:guard | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); guard x8 | 63% (58%-68%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Hawthorn Shieldbug, 4x Hedge Weasel, 3x Field Mouse, 3x Hedgerow Shrew, 2x Carrion Crow | 12 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 75% | 75% | 88% | 71% | 75% | 83% | 79% | 100% | 54% | 29% |
| 2 economy | 75% | 75% | 83% | 71% | 79% | 88% | 83% | 96% | 33% | 29% |
| 3 open | 83% | 54% | 83% | 54% | 71% | 92% | 88% | 83% | 25% | 21% |
| 4 family:guard | 50% | 71% | 79% | 46% | 83% | 96% | 75% | 100% | 21% | 13% |
