# Focused decks: Map 17 The Ice Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool frost-hare-sprinter,greenland-shark,harbor-seal,lone-grey-wolf,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6384 games in 125 s.

- The list (12): Frost Hare Sprinter, Greenland Shark, Harbor Seal, Lone Grey Wolf, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Talus Pika, Walrus Icebreaker, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | big (8 copies at 1 Lumber, average 0.4); evasion x8; ranged x6 | 73% (67%-80%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Snow Ermine, 4x Spitting Spider, 4x Talus Pika, 2x Snow Bunting Archer, 2x Walrus Icebreaker | 4 |
| 2 | open | big (8 copies at 1 Lumber, average 0.4); evasion x10 | 64% (57%-70%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Snow Ermine, 4x Spitting Spider, 4x Talus Pika, 2x Polar Bear, 2x Wolfsbane Alpha | 0 |
| 3 | big | big (12 copies at 1 Lumber, average 0.6); evasion x8 | 53% (47%-59%) | 0.6 | 0: 8, 1: 12 | 4x Harbor Seal, 4x Snow Bunting Archer, 4x Snow Ermine, 4x Talus Pika, 3x Ravenous Wolverine, 1x Greenland Shark | 12 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 92% | 63% | 75% | 63% | 92% | 67% | 63% |
| 2 open | 79% | 50% | 79% | 54% | 92% | 42% | 50% |
| 3 big | 67% | 50% | 83% | 29% | 92% | 21% | 29% |
