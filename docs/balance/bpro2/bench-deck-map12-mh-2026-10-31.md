# Focused decks: Map 12 The Briar Maze (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool ant-hill,badger-lumberjack,bramble-hoglet,carrion-crow,cunning-vixen,dormouse,field-mouse,gatling-hog,hedge-weasel,hedgerow-shrew,lyrebird-mimic,mouse-sapper,quill-thorn-boar,quillguard,thorn-shrike --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7360 games in 128 s.

- The list (15): Ant Hill, Badger Lumberjack, Bramble Hoglet, Carrion Crow, Cunning Vixen, Dormouse, Field Mouse, Gatling Hog, Hedge Weasel, Hedgerow Shrew, Lyrebird Mimic, Mouse Sapper, Quill-Thorn Boar, Quillguard, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 67% (61%-72%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Hoglet, 4x Carrion Crow, 4x Field Mouse, 4x Hedgerow Shrew, 3x Gatling Hog, 1x Lyrebird Mimic | 0 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.5) | 64% (58%-69%) | 0.45 | 0: 11, 1: 9 | 4x Bramble Hoglet, 4x Field Mouse, 4x Mouse Sapper, 3x Carrion Crow, 3x Quillguard, 2x Thorn Shrike | 9 |
| 3 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 61% (56%-67%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Carrion Crow, 4x Hedge Weasel, 4x Hedgerow Shrew, 3x Lyrebird Mimic, 1x Gatling Hog | 10 |
| 4 | swarm | swarm (14 copies at 0 Lumber) | 57% (51%-63%) | 0.45 | 0: 14, 1: 3, 2: 3 | 4x Field Mouse, 4x Hedge Weasel, 4x Hedgerow Shrew, 3x Ant Hill, 3x Mouse Sapper, 2x Carrion Crow | 10 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 63% | 67% | 79% | 63% | 58% | 92% | 58% | 96% | 25% | 67% |
| 2 big | 38% | 67% | 71% | 29% | 67% | 92% | 75% | 96% | 46% | 58% |
| 3 economy | 42% | 54% | 67% | 50% | 63% | 96% | 67% | 83% | 25% | 67% |
| 4 swarm | 46% | 58% | 63% | 33% | 50% | 92% | 58% | 71% | 38% | 58% |
