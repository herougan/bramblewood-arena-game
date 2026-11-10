# Focused decks: Map 17 Wolfsbane Tundra (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-fox-raider,arctic-tern,cone-cutter-squirrel,frostbitten-wolverine,glacier-yak,ice-crevasse-wolf,krill-swarm,lemming-swarm,polar-bear,ringed-seal,taiga-lynx,talus-pika,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:cold,family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3036 games in 500 s.

- The list (17): Arctic Fox Raider, Arctic Tern, Cone-cutter Squirrel, Frostbitten Wolverine, Glacier Yak, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Polar Bear, Ringed Seal, Taiga Lynx, Talus Pika, Timber Wolf Pack Leader, Tundra Musk Ox, Walrus Icebreaker, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cold | cold x10; swarm x8 | 97% (95%-99%) | 0.5 | 0: 10, 1: 10 | 4x Frostbitten Wolverine, 4x Krill Swarm, 4x Lemming Swarm, 4x Woodland Caribou, 2x Arctic Tern, 2x Walrus Icebreaker | 10 |
| 2 | family:evasion | evasion x9; swarm x7 | 94% (92%-97%) | 0.45 | 0: 11, 1: 9 | 4x Arctic Tern, 4x Lemming Swarm, 4x Ringed Seal, 3x Krill Swarm, 3x Taiga Lynx, 2x Polar Bear | 13 |
| 3 | open | midrange (average 0.8 Lumber) | 81% (77%-85%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Frostbitten Wolverine, 4x Lemming Swarm, 4x Tundra Musk Ox, 3x Arctic Fox Raider, 3x Arctic Tern, 2x Wolfsbane Alpha | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); economy (4 resource makers); cold x7 | 77% (73%-82%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Cone-cutter Squirrel, 4x Glacier Yak, 4x Krill Swarm, 4x Tundra Musk Ox, 3x Frostbitten Wolverine, 1x Arctic Fox Raider | 12 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:cold | 96% | 100% | 96% | 100% | 100% | 100% | 100% | 100% | 100% | 88% | 88% |
| 2 family:evasion | 100% | 96% | 100% | 100% | 100% | 100% | 96% | 100% | 96% | 63% | 88% |
| 3 open | 79% | 83% | 83% | 96% | 96% | 100% | 100% | 92% | 75% | 46% | 38% |
| 4 big | 79% | 96% | 67% | 88% | 92% | 96% | 88% | 92% | 79% | 29% | 46% |
