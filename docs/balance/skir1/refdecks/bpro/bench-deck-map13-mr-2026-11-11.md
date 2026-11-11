# Focused decks: Map 13 The Redwood Deep (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool badger-lumberjack,berserker-boar,bramble-hoglet,chipmunk-skirmisher,corpse-flower-beetle,cunning-vixen,fawn-scout,grizzly-vanguard,heartwood-treant,lyrebird-mimic,owl-nightwatch,pine-marten,quill-thorn-boar,redwood-woodpecker,sergeant-bramblefox,stag-knight --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:evasion,family:guard,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3190 games in 324 s.

- The list (16): Badger Lumberjack, Berserker Boar, Bramble Hoglet, Chipmunk Skirmisher, Corpse-flower Beetle, Cunning Vixen, Fawn Scout, Grizzly Vanguard, Heartwood Treant, Lyrebird Mimic, Owl Nightwatch, Pine Marten, Quill-Thorn Boar, Redwood Woodpecker, Sergeant Bramblefox, Stag Champion.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (12 copies at 1+ Lumber, average 0.8); economy (11 resource makers); economy x7 | 65% (60%-70%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Badger Lumberjack, 4x Bramble Hoglet, 4x Chipmunk Skirmisher, 4x Lyrebird Mimic, 3x Heartwood Treant, 1x Berserker Boar | 10 |
| 2 | open | big (16 copies at 1+ Lumber, average 1.1); economy (10 resource makers); economy x6 | 54% (49%-60%) | 1.15 | 0: 4, 1: 9, 2: 7 | 4x Chipmunk Skirmisher, 4x Stag Champion, 3x Badger Lumberjack, 3x Corpse-flower Beetle, 3x Heartwood Treant, 3x Quill-Thorn Boar | 0 |
| 3 | family:evasion | big (16 copies at 1+ Lumber, average 0.8); economy (4 resource makers); evasion x8 | 54% (48%-59%) | 0.8 | 0: 4, 1: 16 | 4x Chipmunk Skirmisher, 4x Cunning Vixen, 4x Lyrebird Mimic, 4x Owl Nightwatch, 3x Corpse-flower Beetle, 1x Quill-Thorn Boar | 12 |
| 4 | family:guard | big (14 copies at 1+ Lumber, average 1.1); economy (10 resource makers); guard x8; economy x7 | 49% (43%-54%) | 1.05 | 0: 6, 1: 7, 2: 7 | 4x Badger Lumberjack, 4x Grizzly Vanguard, 3x Chipmunk Skirmisher, 3x Fawn Scout, 3x Heartwood Treant, 3x Sergeant Bramblefox | 11 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 75% | 92% | 88% | 71% | 58% | 54% | 67% | 46% | 96% | 17% | 54% |
| 2 open | 67% | 71% | 88% | 46% | 58% | 50% | 71% | 42% | 75% | 8% | 21% |
| 3 family:evasion | 63% | 83% | 75% | 54% | 50% | 54% | 54% | 33% | 71% | 0% | 54% |
| 4 family:guard | 63% | 71% | 79% | 50% | 38% | 42% | 46% | 33% | 83% | 4% | 29% |
