# Focused decks: Map 1 Thistlewood (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mf --pool ant-scout,bee-knight,bramble-sprout,chipmunk-cavalry,chipmunk-skirmisher,cottontail,cricket-drummer,dormouse,duck-paddler,hedgerow-shrew,house-cat,meadow-rabbit,moonlit-hare,puddle-skimmer,robin-redbreast,soldier-ant,terrier-pup --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:night,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6800 games in 87 s.

- The list (17): Ant Scout, Bee Warden, Bramble Sprout, Chipmunk Cavalry, Chipmunk Skirmisher, Cottontail, Cricket Drummer, Dormouse, Duck Paddler, Hedgerow Shrew, House Cat, Meadow Rabbit, Moonlit Hare, Puddle Skimmer, Robin Redbreast, Soldier Ant, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 1-1 skirmish's deck; 1-2 skirmish's deck; 1-3 skirmish's deck; 1-4 skirmish's deck; 1-5 elite's deck; reference starter deck under 1-1's field; reference deck (Map 1) under 1-2's field; expected player deck (expectedPlayerDeck) under 1-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers) | 85% (80%-90%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Sprout, 4x Chipmunk Cavalry, 4x Chipmunk Skirmisher, 4x Robin Redbreast, 2x Cricket Drummer, 2x Dormouse | 0 |
| 2 | family:night | swarm (20 copies at 0 Lumber); night x8 | 84% (79%-89%) | 0 | 0: 20 | 4x Ant Scout, 4x Cricket Drummer, 4x Dormouse, 4x Moonlit Hare, 4x Robin Redbreast | 12 |
| 3 | swarm | swarm (20 copies at 0 Lumber) | 83% (78%-88%) | 0 | 0: 20 | 4x Cricket Drummer, 4x Duck Paddler, 4x Robin Redbreast, 4x Soldier Ant, 3x Bramble Sprout, 1x Moonlit Hare | 11 |

## Per opponent

| Deck | fight:1-1 | fight:1-2 | fight:1-3 | fight:1-4 | fight:1-5 | ref:starter | ref:road1 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 75% | 83% | 71% | 92% | 92% | 100% | 71% | 96% |
| 2 family:night | 75% | 63% | 88% | 88% | 88% | 100% | 79% | 96% |
| 3 swarm | 75% | 71% | 71% | 88% | 92% | 100% | 67% | 100% |
