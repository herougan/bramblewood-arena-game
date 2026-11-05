# Focused decks: Map 13 The Redwood Deep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mr --pool alpine-marmot,ant-hill,badger-lumberjack,berserker-boar,blue-ringed-octopus,bramble-hoglet,bramblewood-lynx,carrion-crow,corpse-flower-beetle,cunning-vixen,eagle-owl-quartermaster,fawn-scout,fox-kit,grizzly-vanguard,hawthorn-shieldbug,ibex-rockcaller,leafcutter-gardener,lyrebird-mimic,otter-centurion,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,swift-fox,tasmanian-devil,truffle-piglet,tunnel-ant,wolf-spider-mother,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:evasion,family:guard,open --anchor ant-hill,badger-lumberjack,berserker-boar,bramble-hoglet,bramblewood-lynx,carrion-crow,corpse-flower-beetle,cunning-vixen,fawn-scout,fox-kit,grizzly-vanguard,owl-nightwatch,quillback-elder,redwood-woodpecker,sergeant-bramblefox,shimmerwing-stag,swift-fox,tasmanian-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 116 s.

- The list (30): Alpine Marmot, Ant Hill, Badger Lumberjack, Berserker Boar, Blue-ringed Octopus, Bramble Hoglet, Bramblewood Lynx, Carrion Crow, Corpse-flower Beetle, Cunning Vixen, Eagle-Owl Quartermaster, Fawn Scout, Fox Kit, Grizzly Vanguard, Hawthorn Shieldbug, Ibex Rockcaller, Leafcutter Gardener, Lyrebird Mimic, Otter Centurion, Owl Nightwatch, Quillback Elder, Redwood Woodpecker, Sergeant Bramblefox, Shimmerwing Stag, Swift Fox, Tasmanian Devil, Truffle Piglet, Tunnel Ant, Wolf Spider Mother, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 13-1 skirmish's deck; 13-2 skirmish's deck; 13-3 skirmish's deck; 13-4 skirmish's deck; 13-5 elite's deck; 13-6 elite's deck; 13-7 elite's deck; 13-8 miniboss's deck; reference starter deck under 13-1's field; reference deck (Map 13) under 13-2's field; expected player deck (expectedPlayerDeck) under 13-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | swarm (14 copies at 0 Lumber); guard x8 | 87% (83%-90%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Fox Kit, 4x Hawthorn Shieldbug, 3x Bramble Hoglet, 3x Fawn Scout, 2x Eagle-Owl Quartermaster | 12 |
| 2 | open | big (12 copies at 1+ Lumber, average 0.6) | 84% (80%-88%) | 0.6 | 0: 8, 1: 12 | 4x Alpine Marmot, 4x Fox Kit, 4x Truffle Piglet, 3x Bramblewood Lynx, 3x Corpse-flower Beetle, 2x Blue-ringed Octopus | 0 |
| 3 | economy | big (14 copies at 1+ Lumber, average 0.7); economy (7 resource makers) | 71% (67%-76%) | 0.7 | 0: 6, 1: 14 | 4x Hawthorn Shieldbug, 4x Redwood Woodpecker, 3x Blue-ringed Octopus, 3x Bramblewood Lynx, 3x Carrion Crow, 3x Otter Centurion | 15 |
| 4 | family:evasion | big (12 copies at 1+ Lumber, average 0.6); evasion x9 | 65% (60%-70%) | 0.6 | 0: 8, 1: 12 | 4x Alpine Marmot, 4x Cunning Vixen, 4x Fox Kit, 3x Blue-ringed Octopus, 3x Tunnel Ant, 2x Shimmerwing Stag | 10 |

## Per opponent

| Deck | fight:13-1 | fight:13-2 | fight:13-3 | fight:13-4 | fight:13-5 | fight:13-6 | fight:13-7 | fight:13-8 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 100% | 96% | 100% | 96% | 88% | 96% | 83% | 75% | 100% | 42% | 79% |
| 2 open | 100% | 96% | 96% | 88% | 88% | 92% | 88% | 75% | 96% | 38% | 67% |
| 3 economy | 92% | 83% | 92% | 83% | 71% | 79% | 71% | 63% | 96% | 13% | 42% |
| 4 family:evasion | 88% | 63% | 92% | 79% | 83% | 75% | 54% | 33% | 96% | 21% | 33% |
