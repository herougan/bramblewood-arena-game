# Focused decks: Map 17 Wolfsbane Tundra (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-tern,border-collie,boreal-elk,briarback-hedgehog,cataphract-destrier,cone-cutter-squirrel,elderhorn-monarch,glacier-yak,harbor-seal,ice-crevasse-wolf,polar-bear,ringed-seal,snow-ermine,snowshoe-hare,taiga-lynx,walrus-icebreaker,warhorse-charger,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,family:cold,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7590 games in 158 s.

- The list (19): Arctic Tern, Border Collie, Boreal Elk, Briarback Hedgehog, Gilded Roadwarden, Cone-cutter Squirrel, Elderhorn Monarch, Glacier Yak, Harbor Seal, Ice-Crevasse Wolf, Polar Bear, Ringed Seal, Snow Ermine, Snowshoe Hare, Taiga Lynx, Walrus Icebreaker, Warhorse Charger, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers) | 94% (91%-96%) | 0.6 | 0: 8, 1: 12 | 4x Arctic Tern, 4x Briarback Hedgehog, 4x Cone-cutter Squirrel, 3x Border Collie, 3x Taiga Lynx, 2x Walrus Icebreaker | 0 |
| 2 | family:evasion | swarm (16 copies at 0 Lumber); economy (4 resource makers); evasion x9 | 93% (91%-96%) | 0.2 | 0: 16, 1: 4 | 4x Arctic Tern, 4x Cone-cutter Squirrel, 4x Snow Ermine, 4x Snowshoe Hare, 3x Woodland Caribou, 1x Taiga Lynx | 11 |
| 3 | big | big (8 copies at 3+ Lumber, average 1.6); economy (4 resource makers) | 79% (76%-82%) | 1.6 | 0: 8, 1: 4, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Cone-cutter Squirrel, 4x Elderhorn Monarch, 4x Snowshoe Hare, 2x Walrus Icebreaker, 2x Wolfsbane Alpha | 14 |
| 4 | family:cold | big (4 copies at 3+ Lumber, average 1.2); economy (4 resource makers); cold x10 | 78% (73%-82%) | 1.2 | 0: 7, 1: 6, 2: 3, 3: 4 | 4x Cone-cutter Squirrel, 4x Glacier Yak, 4x Woodland Caribou, 3x Arctic Tern, 3x Boreal Elk, 2x Walrus Icebreaker | 11 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 100% | 100% | 96% | 92% | 96% | 100% | 54% | 96% |
| 2 family:evasion | 96% | 100% | 92% | 100% | 96% | 92% | 100% | 96% | 100% | 65% | 92% |
| 3 big | 88% | 96% | 100% | 96% | 92% | 96% | 100% | 92% | 71% | 15% | 25% |
| 4 family:cold | 83% | 79% | 75% | 83% | 92% | 83% | 88% | 88% | 79% | 42% | 63% |
