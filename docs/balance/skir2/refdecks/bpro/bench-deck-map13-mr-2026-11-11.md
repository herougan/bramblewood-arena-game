# Focused decks: Map 13 The Redwood Deep (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool badger-lumberjack,berserker-boar,bramble-hoglet,bramblewood-lynx,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,fawn-scout,grizzly-vanguard,heartwood-treant,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,sergeant-bramblefox,stag-knight,swift-fox,tasmanian-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:evasion,family:guard,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7458 games in 80 s.

- The list (19): Badger Lumberjack, Berserker Boar, Bramble Hoglet, Bramblewood Lynx, Chipmunk Skirmisher, Corpse-flower Beetle, Cunning Vixen, Fawn Scout, Grizzly Vanguard, Heartwood Treant, Lyrebird Mimic, Owl Nightwatch, Pine Marten, Quill-Thorn Boar, Redwood Woodpecker, Sergeant Bramblefox, Stag Champion, Swift Fox, Tasmanian Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (13 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 88% (84%-91%) | 0.65 | 0: 7, 1: 13 | 4x Chipmunk Skirmisher, 4x Swift Fox, 3x Badger Lumberjack, 3x Bramblewood Lynx, 3x Fawn Scout, 3x Sergeant Bramblefox | 13 |
| 2 | open | big (13 copies at 1+ Lumber, average 0.7); economy (6 resource makers) | 72% (68%-77%) | 0.65 | 0: 7, 1: 13 | 4x Chipmunk Skirmisher, 4x Lyrebird Mimic, 4x Tasmanian Devil, 3x Bramble Hoglet, 3x Swift Fox, 2x Redwood Woodpecker | 0 |
| 3 | family:guard | big (13 copies at 1+ Lumber, average 0.8); economy (8 resource makers); guard x8 | 63% (58%-67%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Badger Lumberjack, 4x Chipmunk Skirmisher, 4x Grizzly Vanguard, 3x Fawn Scout, 3x Tasmanian Devil, 2x Quill-Thorn Boar | 13 |
| 4 | family:evasion | big (13 copies at 1+ Lumber, average 0.7); economy (4 resource makers); evasion x8 | 56% (50%-61%) | 0.65 | 0: 7, 1: 13 | 4x Chipmunk Skirmisher, 4x Cunning Vixen, 4x Lyrebird Mimic, 4x Owl Nightwatch, 3x Fawn Scout, 1x Tasmanian Devil | 11 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 96% | 71% | 100% | 96% | 100% | 83% | 96% | 100% | 42% | 79% |
| 2 open | 88% | 71% | 75% | 92% | 71% | 83% | 79% | 83% | 92% | 17% | 46% |
| 3 family:guard | 83% | 83% | 29% | 79% | 54% | 83% | 71% | 75% | 83% | 4% | 42% |
| 4 family:evasion | 67% | 46% | 33% | 83% | 58% | 79% | 46% | 71% | 88% | 4% | 38% |
