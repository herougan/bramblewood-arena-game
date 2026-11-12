# Focused decks: Map 17 The Ice Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,glacier-yak,greenland-shark,ice-crevasse-wolf,lemming-swarm,polar-bear,ringed-seal,snow-ermine,talus-pika,walrus-icebreaker,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6454 games in 99 s.

- The list (11): Arctic Tern, Glacier Yak, Greenland Shark, Ice-Crevasse Wolf, Lemming Swarm, Polar Bear, Ringed Seal, Snow Ermine, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (14 copies at 0 Lumber); evasion x8 | 87% (82%-92%) | 0.3 | 0: 14, 1: 6 | 4x Lemming Swarm, 4x Ringed Seal, 4x Snow Ermine, 4x Talus Pika, 2x Arctic Tern, 2x Ice-Crevasse Wolf | 11 |
| 2 | swarm | swarm (16 copies at 0 Lumber) | 83% (78%-88%) | 0.2 | 0: 16, 1: 4 | 4x Arctic Tern, 4x Lemming Swarm, 4x Snow Ermine, 4x Talus Pika, 3x Ice-Crevasse Wolf, 1x Wolfsbane Alpha | 12 |
| 3 | open | tide x6 | 55% (48%-62%) | 1 | 0: 8, 1: 8, 3: 4 | 4x Arctic Tern, 4x Glacier Yak, 4x Lemming Swarm, 3x Greenland Shark, 3x Ringed Seal, 2x Polar Bear | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 92% | 92% | 100% | 88% | 100% | 63% | 75% |
| 2 swarm | 92% | 83% | 100% | 54% | 96% | 88% | 67% |
| 3 open | 75% | 58% | 79% | 33% | 63% | 33% | 42% |
