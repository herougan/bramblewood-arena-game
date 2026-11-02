# Focused decks: Map 13 The Redwood Deep (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,cunning-vixen,fawn-scout,grizzly-vanguard,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,stag-knight,swift-fox,tasmanian-devil,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7282 games in 88 s.

- The list (16): Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Cunning Vixen, Fawn Scout, Grizzly Vanguard, Owl Nightwatch, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Stag Knight, Swift Fox, Tasmanian Devil, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (13 copies at 1+ Lumber, average 0.8) | 74% (69%-79%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Berserker Boar, 4x Bramble Hoglet, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Sergeant Bramblefox, 3x Tasmanian Devil | 8 |
| 2 | open | big (14 copies at 1+ Lumber, average 0.9); economy (4 resource makers) | 69% (64%-74%) | 0.9 | 0: 6, 1: 10, 2: 4 | 4x Quillback Elder, 4x Redwood Woodpecker, 3x Bramble Hoglet, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Sergeant Bramblefox | 0 |
| 3 | economy | big (12 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 69% (64%-74%) | 0.6 | 0: 8, 1: 12 | 4x Bramble Hoglet, 4x Carrion Crow, 4x Redwood Woodpecker, 4x Swift Fox, 3x Sergeant Bramblefox, 1x Tasmanian Devil | 10 |
| 4 | family:evasion | big (14 copies at 1+ Lumber, average 0.7); evasion x8 | 53% (47%-58%) | 0.7 | 0: 6, 1: 14 | 4x Cunning Vixen, 4x Owl Nightwatch, 3x Bramble Hoglet, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Sergeant Bramblefox | 8 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 79% | 100% | 71% | 71% | 79% | 58% | 67% | 83% | 29% | 83% |
| 2 open | 96% | 75% | 75% | 71% | 58% | 71% | 71% | 58% | 88% | 25% | 75% |
| 3 economy | 83% | 83% | 88% | 63% | 58% | 75% | 79% | 63% | 92% | 17% | 54% |
| 4 family:evasion | 79% | 42% | 75% | 46% | 33% | 63% | 67% | 50% | 58% | 13% | 54% |
