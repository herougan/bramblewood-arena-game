# Focused decks: Map 13 The Redwood Deep (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,stag-knight,swift-fox,tasmanian-devil,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7172 games in 78 s.

- The list (17): Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Cunning Vixen, Fawn Scout, Fox Kit, Grizzly Vanguard, Owl Nightwatch, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Stag Knight, Swift Fox, Tasmanian Devil, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber) | 83% (78%-87%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Hoglet, 4x Fox Kit, 3x Bramblewood Lynx, 3x Carrion Crow, 3x Fawn Scout, 3x Sergeant Bramblefox | 10 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5) | 78% (73%-83%) | 0.5 | 0: 10, 1: 10 | 4x Bramble Hoglet, 4x Owl Nightwatch, 3x Fawn Scout, 3x Fox Kit, 3x Sergeant Bramblefox, 3x Woodpecker Sapper | 14 |
| 3 | open | big (16 copies at 1+ Lumber, average 0.9); economy (4 resource makers) | 76% (71%-80%) | 0.9 | 0: 4, 1: 14, 2: 2 | 4x Fox Kit, 4x Redwood Woodpecker, 4x Tasmanian Devil, 3x Bramblewood Lynx, 3x Sergeant Bramblefox, 2x Quillback Elder | 0 |
| 4 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (8 resource makers); flying x7 | 68% (63%-73%) | 0.5 | 0: 10, 1: 10 | 4x Carrion Crow, 4x Redwood Woodpecker, 3x Fawn Scout, 3x Fox Kit, 3x Owl Nightwatch, 3x Sergeant Bramblefox | 10 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 75% | 96% | 71% | 92% | 92% | 83% | 75% | 100% | 54% | 71% |
| 2 big | 100% | 92% | 83% | 58% | 67% | 92% | 71% | 83% | 88% | 50% | 75% |
| 3 open | 96% | 58% | 92% | 67% | 79% | 88% | 75% | 79% | 100% | 29% | 71% |
| 4 economy | 79% | 50% | 71% | 46% | 75% | 83% | 63% | 71% | 96% | 21% | 92% |
