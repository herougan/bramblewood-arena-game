# Focused decks: Map 17 The Ice Hollow (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool frostbitten-wolverine,glacier-yak,greenland-shark,harbor-seal,ice-crevasse-wolf,polar-bear,ringed-seal,snow-ermine,walrus-icebreaker,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:evasion,family:cold,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 4592 games in 114 s.

- The list (10): Frostbitten Wolverine, Glacier Yak, Greenland Shark, Harbor Seal, Ice-Crevasse Wolf, Polar Bear, Ringed Seal, Snow Ermine, Walrus Icebreaker, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | evasion x8; tide x7 | 27% (21%-33%) | 0.8 | 0: 4, 1: 16 | 4x Frostbitten Wolverine, 4x Ringed Seal, 4x Snow Ermine, 3x Greenland Shark, 3x Ice-Crevasse Wolf, 2x Walrus Icebreaker | 0 |
| 2 | family:evasion | big (4 copies at 2+ Lumber, average 1.2); evasion x9; cold x8 | 17% (12%-23%) | 1.2 | 0: 4, 1: 12, 3: 4 | 4x Frostbitten Wolverine, 4x Glacier Yak, 4x Snow Ermine, 3x Ice-Crevasse Wolf, 3x Ringed Seal, 2x Polar Bear | 6 |
| 3 | family:cold | big (3 copies at 2+ Lumber, average 1.3); tide x11; cold x9 | 3% (0%-6%) | 1.3 | 1: 17, 3: 3 | 4x Frostbitten Wolverine, 4x Harbor Seal, 4x Ringed Seal, 3x Glacier Yak, 3x Greenland Shark, 2x Walrus Icebreaker | 7 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 38% | 25% | 38% | 8% | 63% | 0% | 17% |
| 2 family:evasion | 21% | 29% | 33% | 4% | 25% | 8% | 0% |
| 3 family:cold | 0% | 8% | 0% | 0% | 8% | 4% | 0% |
