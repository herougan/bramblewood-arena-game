# Focused decks: Map 17 The Ice Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,beluga,frost-thistle-lynx,frostbitten-wolverine,greenland-shark,lemming-swarm,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,talus-pika,walrus-icebreaker,wolfsbane-alpha,yeti-chieftain --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:cold,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6412 games in 73 s.

- The list (14): Arctic Tern, Beluga, Frost Thistle Lynx, Frostbitten Wolverine, Greenland Shark, Lemming Swarm, Permafrost Mammoth, Polar Bear, Ravenous Wolverine, Ringed Seal, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.4 Lumber) | 79% (73%-85%) | 0.4 | 0: 12, 1: 8 | 4x Arctic Tern, 4x Lemming Swarm, 4x Talus Pika, 3x Beluga, 3x Ravenous Wolverine, 2x Yeti Chieftain | 0 |
| 2 | family:cold | cold x10 | 57% (49%-64%) | 1.05 | 0: 7, 1: 9, 3: 4 | 4x Frostbitten Wolverine, 4x Lemming Swarm, 4x Permafrost Mammoth, 3x Arctic Tern, 3x Beluga, 2x Walrus Icebreaker | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.2) | 51% (44%-58%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Frost Thistle Lynx, 4x Lemming Swarm, 4x Permafrost Mammoth, 4x Talus Pika, 3x Greenland Shark, 1x Ravenous Wolverine | 11 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 79% | 79% | 96% | 67% | 88% | 67% | 75% |
| 2 family:cold | 63% | 63% | 83% | 38% | 67% | 33% | 50% |
| 3 big | 54% | 67% | 75% | 42% | 50% | 33% | 38% |
