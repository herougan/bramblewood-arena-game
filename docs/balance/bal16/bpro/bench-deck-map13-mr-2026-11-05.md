# Focused decks: Map 13 The Redwood Deep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool ant-hill,badger-lumberjack,berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,corpse-flower-beetle,cunning-vixen,fawn-scout,grizzly-vanguard,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,swift-fox,tasmanian-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:evasion,family:flying,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7920 games in 117 s.

- The list (17): Ant Hill, Badger Lumberjack, Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Corpse-flower Beetle, Cunning Vixen, Fawn Scout, Grizzly Vanguard, Owl Nightwatch, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Swift Fox, Tasmanian Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (18 copies at 1+ Lumber, average 0.9); economy (4 resource makers) | 67% (62%-72%) | 0.9 | 0: 2, 1: 18 | 4x Badger Lumberjack, 4x Swift Fox, 4x Tasmanian Devil, 3x Bramblewood Lynx, 3x Corpse-flower Beetle, 2x Fawn Scout | 0 |
| 2 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (8 resource makers) | 65% (60%-70%) | 0.45 | 0: 11, 1: 9 | 4x Badger Lumberjack, 4x Bramble Hoglet, 4x Carrion Crow, 3x Fawn Scout, 3x Sergeant Bramblefox, 2x Corpse-flower Beetle | 12 |
| 3 | family:flying | big (13 copies at 1+ Lumber, average 0.8); economy (4 resource makers); flying x8 | 56% (51%-61%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Berserker Boar, 4x Carrion Crow, 4x Owl Nightwatch, 3x Bramblewood Lynx, 3x Fawn Scout, 2x Sergeant Bramblefox | 15 |
| 4 | family:evasion | big (14 copies at 1+ Lumber, average 0.7); economy (4 resource makers); evasion x8 | 41% (36%-47%) | 0.7 | 0: 6, 1: 14 | 4x Badger Lumberjack, 4x Cunning Vixen, 4x Owl Nightwatch, 3x Bramble Hoglet, 3x Fawn Scout, 2x Tasmanian Devil | 12 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 83% | 100% | 75% | 67% | 63% | 58% | 46% | 83% | 21% | 54% |
| 2 economy | 88% | 83% | 88% | 79% | 58% | 58% | 63% | 42% | 100% | 13% | 42% |
| 3 family:flying | 67% | 75% | 83% | 58% | 46% | 42% | 63% | 8% | 96% | 33% | 46% |
| 4 family:evasion | 75% | 58% | 63% | 54% | 38% | 25% | 42% | 17% | 63% | 0% | 21% |
