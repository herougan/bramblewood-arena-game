# Focused decks: Map 13 The Redwood Deep (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool alpine-marmot,berserker-boar,blue-ringed-octopus,bramble-hoglet,bramblewood-lynx,carrion-crow,cunning-vixen,eagle-owl-quartermaster,fawn-scout,field-crow,fox-kit,fox-sharpshot,grizzly-vanguard,ibex-rockcaller,jay-pilferer,lyrebird-mimic,otter-centurion,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,stag-knight,swift-fox,tasmanian-devil,truffle-piglet,wolf-spider-mother,woodcock-lookout,woodpecker-sapper --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,stag-knight,swift-fox,tasmanian-devil,woodpecker-sapper --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13662 games in 164 s.

- The list (28): Alpine Marmot, Berserker Boar, Blue-ringed Octopus, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Cunning Vixen, Eagle-Owl Quartermaster, Fawn Scout, Field Crow, Fox Kit, Fox Sharpshot, Grizzly Vanguard, Ibex Rockcaller, Jay Pilferer, Lyrebird Mimic, Otter Centurion, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Stag Knight, Swift Fox, Tasmanian Devil, Truffle Piglet, Wolf Spider Mother, Woodcock Lookout, Woodpecker Sapper.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (16 copies at 1+ Lumber, average 0.8); economy (8 resource makers) | 95% (93%-98%) | 0.8 | 0: 4, 1: 16 | 4x Fox Kit, 4x Redwood Woodpecker, 4x Truffle Piglet, 3x Swift Fox, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 14 |
| 2 | open | big (9 copies at 1+ Lumber, average 0.5) | 88% (84%-91%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Bramble Hoglet, 4x Swift Fox, 3x Fawn Scout, 3x Wolf Spider Mother, 2x Sergeant Bramblefox | 0 |
| 3 | big | big (12 copies at 1+ Lumber, average 0.8) | 86% (82%-90%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Berserker Boar, 4x Bramble Hoglet, 4x Fox Kit, 3x Sergeant Bramblefox, 3x Wolf Spider Mother, 2x Ibex Rockcaller | 11 |
| 4 | swarm | swarm (14 copies at 0 Lumber); ranged x6 | 85% (81%-89%) | 0.3 | 0: 14, 1: 6 | 4x Bramble Hoglet, 4x Fox Kit, 3x Fawn Scout, 3x Swift Fox, 3x Wolf Spider Mother, 3x Woodcock Lookout | 7 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 96% | 100% | 100% | 96% | 100% | 92% | 92% | 100% | 75% | 100% |
| 2 open | 100% | 79% | 96% | 88% | 88% | 92% | 83% | 79% | 100% | 63% | 96% |
| 3 big | 100% | 79% | 100% | 96% | 88% | 83% | 96% | 75% | 79% | 54% | 92% |
| 4 swarm | 96% | 88% | 88% | 71% | 83% | 88% | 92% | 79% | 96% | 58% | 96% |
