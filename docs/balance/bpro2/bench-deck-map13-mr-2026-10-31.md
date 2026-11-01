# Focused decks: Map 13 The Redwood Deep (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,stag-knight,swift-fox,tasmanian-devil,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7678 games in 92 s.

- The list (17): Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Cunning Vixen, Fawn Scout, Fox Kit, Grizzly Vanguard, Owl Nightwatch, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Stag Knight, Swift Fox, Tasmanian Devil, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (13 copies at 1+ Lumber, average 0.7) | 86% (82%-90%) | 0.65 | 0: 7, 1: 13 | 4x Fox Kit, 4x Swift Fox, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Redwood Woodpecker, 3x Sergeant Bramblefox | 8 |
| 2 | swarm | swarm (14 copies at 0 Lumber) | 81% (77%-86%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Hoglet, 4x Fox Kit, 3x Carrion Crow, 3x Fawn Scout, 3x Sergeant Bramblefox, 3x Swift Fox | 11 |
| 3 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 81% (76%-85%) | 0.6 | 0: 8, 1: 12 | 4x Carrion Crow, 4x Fox Kit, 4x Redwood Woodpecker, 3x Sergeant Bramblefox, 3x Swift Fox, 2x Tasmanian Devil | 10 |
| 4 | open | big (13 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 73% (68%-78%) | 0.65 | 0: 7, 1: 13 | 4x Carrion Crow, 4x Woodpecker Sapper, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Redwood Woodpecker, 3x Sergeant Bramblefox | 0 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 79% | 100% | 83% | 79% | 96% | 88% | 88% | 100% | 46% | 88% |
| 2 swarm | 96% | 71% | 100% | 58% | 75% | 88% | 75% | 96% | 96% | 58% | 83% |
| 3 economy | 96% | 79% | 92% | 75% | 67% | 88% | 83% | 75% | 100% | 58% | 75% |
| 4 open | 92% | 75% | 100% | 46% | 67% | 88% | 79% | 67% | 96% | 21% | 75% |
