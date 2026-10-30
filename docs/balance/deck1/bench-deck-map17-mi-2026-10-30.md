# Focused decks: Map 17 The Ice Hollow (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool ashbone-ghoul,beluga,eagle-owl-quartermaster,frost-hare-sprinter,frostmoon-howler,glacial-ape-king,grave-grin-hyena,greenland-shark,harbor-seal,lone-grey-wolf,magma-wraith,mountain-hare,musk-ox-calf,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,squires-mount,stoat-cutthroat,swamp-rabbit,talus-pika,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus swarm,family:evasion,family:cold,open --anchor frost-hare-sprinter,glacial-ape-king,greenland-shark,harbor-seal,lone-grey-wolf,polar-bear,ravenous-wolverine,snow-bunting-archer,snow-ermine,spitting-spider,talus-pika,walrus-icebreaker --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12656 games in 203 s.

- The list (24): Ashbone Ghoul, Beluga, Eagle-Owl Quartermaster, Frost Hare Sprinter, Frostmoon Howler, Glacial Ape-King, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Lone Grey Wolf, Magma Wraith, Mountain Hare, Musk Ox Calf, Polar Bear, Ravenous Wolverine, Snow Bunting Archer, Snow Ermine, Spitting Spider, Squire's Mount, Stoat Cutthroat, Swamp Rabbit, Talus Pika, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | evasion x8; swarm x6 | 73% (67%-79%) | 0.45 | 0: 11, 1: 9 | 4x Frost Hare Sprinter, 4x Snow Ermine, 3x Frostmoon Howler, 3x Ravenous Wolverine, 3x Snow Bunting Archer, 3x Wolf Spider Mother | 9 |
| 2 | family:cold | economy (4 resource makers); cold x10; evasion x6 | 71% (65%-78%) | 0.5 | 0: 10, 1: 10 | 4x Musk Ox Calf, 4x Talus Pika, 3x Frost Hare Sprinter, 3x Mountain Hare, 3x Snow Bunting Archer, 3x Wolf Spider Mother | 17 |
| 3 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 70% (64%-76%) | 0.3 | 0: 14, 1: 6 | 4x Ashbone Ghoul, 4x Spitting Spider, 4x Talus Pika, 3x Grave-Grin Hyena, 3x Snow Ermine, 2x Walrus Icebreaker | 11 |
| 4 | open | swarm (15 copies at 0 Lumber); evasion x8 | 67% (61%-74%) | 0.25 | 0: 15, 1: 5 | 4x Ashbone Ghoul, 4x Frost Hare Sprinter, 4x Snow Ermine, 3x Frostmoon Howler, 3x Stoat Cutthroat, 2x Walrus Icebreaker | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 83% | 71% | 83% | 33% | 92% | 71% | 79% |
| 2 family:cold | 83% | 54% | 75% | 46% | 100% | 54% | 88% |
| 3 swarm | 92% | 50% | 75% | 33% | 100% | 46% | 92% |
| 4 open | 83% | 54% | 79% | 38% | 92% | 38% | 88% |
