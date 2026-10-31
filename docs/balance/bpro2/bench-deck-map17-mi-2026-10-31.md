# Focused decks: Map 17 The Ice Hollow (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool frost-hare-sprinter,glacial-ape-king,greenland-shark,harbor-seal,lone-grey-wolf,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus family:evasion,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6538 games in 83 s.

- The list (12): Frost Hare Sprinter, Glacial Ape-King, Greenland Shark, Harbor Seal, Lone Grey Wolf, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Talus Pika, Walrus Icebreaker.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | economy (4 resource makers); evasion x10; cold x6 | 71% (65%-78%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Snow Bunting Archer, 4x Snow Ermine, 4x Talus Pika, 2x Polar Bear, 2x Walrus Icebreaker | 6 |
| 2 | open | economy (4 resource makers); evasion x11 | 68% (62%-75%) | 0.4 | 0: 12, 1: 8 | 4x Frost Hare Sprinter, 4x Snow Ermine, 4x Talus Pika, 3x Harbor Seal, 3x Ravenous Wolverine, 2x Walrus Icebreaker | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 75% | 58% | 83% | 42% | 96% | 67% | 79% |
| 2 open | 71% | 67% | 88% | 38% | 96% | 50% | 71% |
