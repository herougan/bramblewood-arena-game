# Focused decks: Map 12 The Briar Maze (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool alpine-marmot,ant-hill,badger-lumberjack,blue-ringed-octopus,bramble-hoglet,briarback-hedgehog,carrion-crow,cunning-vixen,eagle-owl-quartermaster,field-mouse,field-vole,gatling-hog,harvest-mouse,hawthorn-shieldbug,hedge-weasel,hedgehog-scout,hedgerow-shrew,ibex-rockcaller,lyrebird-mimic,mouse-sapper,nightjar-drifter,otter-centurion,quillback-elder,quillguard,robin-redbreast,thorn-shrike,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ant-hill,badger-lumberjack,bramble-hoglet,carrion-crow,cunning-vixen,field-mouse,gatling-hog,hedge-weasel,hedgehog-scout,hedgerow-shrew,lyrebird-mimic,mouse-sapper,quillback-elder,quillguard,thorn-shrike --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13120 games in 217 s.

- The list (27): Alpine Marmot, Ant Hill, Badger Lumberjack, Blue-ringed Octopus, Bramble Hoglet, Briarback Hedgehog, Carrion Crow, Cunning Vixen, Eagle-Owl Quartermaster, Field Mouse, Field Vole, Gatling Hog, Harvest Mouse, Hawthorn Shieldbug, Hedge Weasel, Hedgehog Scout, Hedgerow Shrew, Ibex Rockcaller, Lyrebird Mimic, Mouse Sapper, Nightjar Drifter, Otter Centurion, Quillback Elder, Quillguard, Robin Redbreast, Thorn Shrike, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (8 copies at 1+ Lumber, average 0.4) | 89% (85%-93%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Hoglet, 4x Hedgehog Scout, 4x Hedgerow Shrew, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Hawthorn Shieldbug | 0 |
| 2 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (8 resource makers); flying x7; ranged x6 | 85% (81%-89%) | 0.5 | 0: 10, 1: 10 | 4x Badger Lumberjack, 4x Carrion Crow, 3x Eagle-Owl Quartermaster, 3x Hedge Weasel, 3x Otter Centurion, 3x Wolf Spider Mother | 14 |
| 3 | swarm | swarm (14 copies at 0 Lumber) | 80% (75%-85%) | 0.3 | 0: 14, 1: 6 | 4x Field Mouse, 4x Field Vole, 4x Hedgehog Scout, 4x Mouse Sapper, 2x Eagle-Owl Quartermaster, 2x Hedge Weasel | 14 |
| 4 | big | big (10 copies at 1+ Lumber, average 0.5) | 80% (75%-84%) | 0.5 | 0: 10, 1: 10 | 4x Alpine Marmot, 4x Hedgehog Scout, 4x Mouse Sapper, 4x Nightjar Drifter, 2x Eagle-Owl Quartermaster, 2x Hedgerow Shrew | 12 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 100% | 83% | 96% | 96% | 96% | 96% | 88% | 71% | 79% |
| 2 economy | 83% | 92% | 88% | 83% | 88% | 88% | 96% | 100% | 46% | 88% |
| 3 swarm | 75% | 88% | 67% | 71% | 88% | 88% | 88% | 96% | 58% | 83% |
| 4 big | 71% | 88% | 83% | 83% | 83% | 92% | 96% | 75% | 33% | 92% |
