# Focused decks: Map 17 The Ice Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,beluga,frost-thistle-lynx,frostbitten-wolverine,greenland-shark,lemming-swarm,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,talus-pika,walrus-icebreaker,wolfsbane-alpha,yeti-chieftain --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:cold,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2058 games in 365 s.

- The list (14): Arctic Tern, Beluga, Frost Thistle Lynx, Frostbitten Wolverine, Greenland Shark, Lemming Swarm, Permafrost Mammoth, Polar Bear, Ravenous Wolverine, Ringed Seal, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cold | cold x10 | 65% (58%-71%) | 1.05 | 0: 7, 1: 9, 3: 4 | 4x Frostbitten Wolverine, 4x Lemming Swarm, 4x Permafrost Mammoth, 3x Greenland Shark, 3x Talus Pika, 2x Walrus Icebreaker | 10 |
| 2 | open | tide x7 | 64% (57%-70%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Lemming Swarm, 4x Ringed Seal, 4x Talus Pika, 3x Frost Thistle Lynx, 3x Greenland Shark, 2x Ravenous Wolverine | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.2); cold x6 | 62% (55%-69%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Arctic Tern, 4x Frost Thistle Lynx, 4x Lemming Swarm, 4x Permafrost Mammoth, 2x Polar Bear, 2x Walrus Icebreaker | 13 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:cold | 96% | 75% | 79% | 54% | 71% | 38% | 42% |
| 2 open | 96% | 63% | 83% | 63% | 67% | 33% | 42% |
| 3 big | 88% | 71% | 75% | 50% | 63% | 46% | 42% |
