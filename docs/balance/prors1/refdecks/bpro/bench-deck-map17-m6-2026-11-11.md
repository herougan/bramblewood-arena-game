# Focused decks: Map 17 Wolfsbane Tundra (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-fox-raider,arctic-tern,cone-cutter-squirrel,frostbitten-wolverine,glacier-yak,harbor-seal,ice-crevasse-wolf,krill-swarm,lemming-swarm,polar-bear,ringed-seal,shepherds-bark,snow-bunting-archer,snow-ermine,taiga-lynx,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,family:cold,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7194 games in 97 s.

- The list (20): Arctic Fox Raider, Arctic Tern, Cone-cutter Squirrel, Frostbitten Wolverine, Glacier Yak, Harbor Seal, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Polar Bear, Ringed Seal, Shepherd, Snow Bunting Archer, Snow Ermine, Taiga Lynx, Timber Wolf Pack Leader, Tundra Musk Ox, Walrus Icebreaker, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber) | 96% (94%-98%) | 0.4 | 0: 15, 1: 2, 2: 3 | 4x Arctic Tern, 4x Krill Swarm, 4x Snow Ermine, 3x Cone-cutter Squirrel, 3x Tundra Musk Ox, 2x Walrus Icebreaker | 0 |
| 2 | family:evasion | swarm x8; evasion x8 | 94% (91%-97%) | 0.4 | 0: 12, 1: 8 | 4x Arctic Tern, 4x Krill Swarm, 4x Lemming Swarm, 3x Arctic Fox Raider, 3x Taiga Lynx, 2x Polar Bear | 12 |
| 3 | family:cold | cold x9; swarm x8 | 90% (87%-93%) | 0.6 | 0: 8, 1: 12 | 4x Krill Swarm, 4x Lemming Swarm, 4x Woodland Caribou, 3x Frostbitten Wolverine, 3x Ringed Seal, 2x Walrus Icebreaker | 14 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); cold x6 | 82% (78%-86%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Glacier Yak, 4x Lemming Swarm, 4x Tundra Musk Ox, 3x Cone-cutter Squirrel, 3x Ice-Crevasse Wolf, 2x Frostbitten Wolverine | 14 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 100% | 92% | 100% | 100% | 100% | 96% | 83% | 83% |
| 2 family:evasion | 100% | 100% | 96% | 100% | 92% | 100% | 96% | 100% | 88% | 79% | 83% |
| 3 family:cold | 100% | 100% | 96% | 96% | 71% | 100% | 100% | 100% | 88% | 71% | 71% |
| 4 big | 92% | 100% | 88% | 88% | 71% | 96% | 100% | 100% | 71% | 38% | 58% |
