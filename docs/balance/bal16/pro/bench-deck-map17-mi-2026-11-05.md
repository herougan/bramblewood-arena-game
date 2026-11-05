# Focused decks: Map 17 The Ice Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool ashbone-ghoul,beluga,dhole-matriarch,eagle-owl-quartermaster,frost-hare-sprinter,grave-grin-hyena,greenland-shark,grey-seal-bull,harbor-seal,ibex-rockcaller,lone-grey-wolf,magma-wraith,mountain-hare,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,stoat-cutthroat,talus-pika,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:evasion,family:ranged,big,open --anchor frost-hare-sprinter,greenland-shark,harbor-seal,lone-grey-wolf,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker,wolfsbane-alpha --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6972 games in 157 s.

- The list (23): Ashbone Ghoul, Beluga, Dhole Matriarch, Eagle-Owl Quartermaster, Frost Hare Sprinter, Grave-Grin Hyena, Greenland Shark, Grey Seal Bull, Harbor Seal, Ibex Rockcaller, Lone Grey Wolf, Magma Wraith, Mountain Hare, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Stoat Cutthroat, Talus Pika, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (15 copies at 0 Lumber); evasion x12 | 80% (74%-85%) | 0.25 | 0: 15, 1: 5 | 4x Frost Hare Sprinter, 4x Mountain Hare, 4x Snow Ermine, 3x Beluga, 3x Grave-Grin Hyena, 2x Ravenous Wolverine | 10 |
| 2 | family:ranged | big (10 copies at 1+ Lumber, average 0.5); ranged x8; evasion x7 | 75% (69%-81%) | 0.5 | 0: 10, 1: 10 | 4x Snow Bunting Archer, 4x Snow Ermine, 4x Spitting Spider, 3x Grave-Grin Hyena, 3x Mountain Hare, 2x Wolf Spider Mother | 16 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5) | 71% (65%-77%) | 0.45 | 0: 11, 1: 9 | 4x Frost Hare Sprinter, 4x Grave-Grin Hyena, 3x Ravenous Wolverine, 3x Stoat Cutthroat, 3x Talus Pika, 3x Wolf Spider Mother | 17 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.5); evasion x11; tide x7 | 55% (49%-62%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Harbor Seal, 4x Snow Ermine, 3x Beluga, 3x Frost Hare Sprinter, 2x Walrus Icebreaker | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 96% | 92% | 96% | 71% | 88% | 71% | 46% |
| 2 family:ranged | 88% | 75% | 92% | 63% | 100% | 38% | 71% |
| 3 big | 88% | 83% | 92% | 63% | 92% | 46% | 38% |
| 4 open | 67% | 79% | 79% | 33% | 75% | 13% | 42% |
