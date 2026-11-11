# Focused decks: Map 13 The Redwood Deep (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool badger-lumberjack,berserker-boar,bramble-hoglet,bramblewood-lynx,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,fawn-scout,grizzly-vanguard,heartwood-treant,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,sergeant-bramblefox,stag-knight,swift-fox,tasmanian-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:evasion,family:guard,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7568 games in 72 s.

- The list (19): Badger Lumberjack, Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Chipmunk Skirmisher, Corpse-flower Beetle, Cunning Vixen, Fawn Scout, Grizzly Vanguard, Heartwood Treant, Lyrebird Mimic, Owl Nightwatch, Pine Marten, Quill-Thorn Boar, Redwood Woodpecker, Sergeant Bramblefox, Stag Champion, Swift Fox, Tasmanian Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (16 copies at 1+ Lumber, average 1.0); economy (6 resource makers) | 89% (86%-91%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Berserker Boar, 4x Chipmunk Skirmisher, 4x Lyrebird Mimic, 3x Bramblewood Lynx, 3x Sergeant Bramblefox, 2x Badger Lumberjack | 0 |
| 2 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (7 resource makers) | 87% (84%-90%) | 0.45 | 0: 11, 1: 9 | 4x Bramble Hoglet, 4x Chipmunk Skirmisher, 3x Badger Lumberjack, 3x Fawn Scout, 3x Sergeant Bramblefox, 3x Tasmanian Devil | 11 |
| 3 | family:guard | big (16 copies at 1+ Lumber, average 1.0); economy (10 resource makers); guard x8 | 83% (80%-87%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Badger Lumberjack, 4x Chipmunk Skirmisher, 4x Grizzly Vanguard, 4x Swift Fox, 2x Corpse-flower Beetle, 2x Redwood Woodpecker | 14 |
| 4 | family:evasion | big (17 copies at 1+ Lumber, average 0.8); economy (4 resource makers); evasion x8 | 77% (74%-80%) | 0.85 | 0: 3, 1: 17 | 4x Cunning Vixen, 4x Owl Nightwatch, 4x Redwood Woodpecker, 3x Fawn Scout, 3x Sergeant Bramblefox, 2x Tasmanian Devil | 17 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 96% | 17% | 71% |
| 2 economy | 96% | 100% | 92% | 100% | 100% | 100% | 96% | 96% | 100% | 25% | 50% |
| 3 family:guard | 100% | 92% | 96% | 100% | 100% | 92% | 100% | 100% | 79% | 25% | 33% |
| 4 family:evasion | 83% | 96% | 96% | 100% | 100% | 92% | 88% | 92% | 79% | 0% | 21% |
