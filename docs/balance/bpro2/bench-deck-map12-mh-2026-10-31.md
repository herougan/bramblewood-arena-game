# Focused decks: Map 12 The Briar Maze (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool ant-hill,badger-lumberjack,bramble-hoglet,carrion-crow,cunning-vixen,field-mouse,gatling-hog,hedge-weasel,hedgehog-scout,hedgerow-shrew,lyrebird-mimic,mouse-sapper,quillback-elder,quillguard,thorn-shrike --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7480 games in 104 s.

- The list (15): Ant Hill, Badger Lumberjack, Bramble Hoglet, Carrion Crow, Cunning Vixen, Field Mouse, Gatling Hog, Hedge Weasel, Hedgehog Scout, Hedgerow Shrew, Lyrebird Mimic, Mouse Sapper, Quillback Elder, Quillguard, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber) | 78% (72%-83%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Hoglet, 4x Field Mouse, 4x Hedgehog Scout, 4x Hedgerow Shrew, 3x Gatling Hog, 1x Badger Lumberjack | 9 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers) | 68% (63%-74%) | 0.4 | 0: 12, 1: 8 | 4x Carrion Crow, 4x Field Mouse, 4x Hedgehog Scout, 3x Gatling Hog, 3x Mouse Sapper, 2x Quillguard | 0 |
| 3 | big | big (10 copies at 1+ Lumber, average 0.5) | 65% (59%-71%) | 0.5 | 0: 10, 1: 10 | 4x Bramble Hoglet, 4x Hedgehog Scout, 4x Lyrebird Mimic, 3x Gatling Hog, 3x Quillguard, 2x Carrion Crow | 9 |
| 4 | economy | big (12 copies at 1+ Lumber, average 0.8); economy (7 resource makers) | 50% (45%-56%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Bramble Hoglet, 4x Carrion Crow, 4x Quillback Elder, 3x Badger Lumberjack, 3x Gatling Hog, 2x Cunning Vixen | 13 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 67% | 92% | 71% | 71% | 67% | 83% | 71% | 100% | 83% | 71% |
| 2 open | 58% | 88% | 50% | 38% | 50% | 83% | 71% | 92% | 79% | 75% |
| 3 big | 42% | 83% | 54% | 58% | 71% | 63% | 79% | 92% | 33% | 75% |
| 4 economy | 17% | 67% | 50% | 21% | 33% | 83% | 42% | 88% | 33% | 71% |
