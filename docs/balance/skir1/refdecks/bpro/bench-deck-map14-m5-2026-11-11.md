# Focused decks: Map 14 Savanna Reaches (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,adder-ambusher,crocodile-ambusher,dust-hyena,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,mangrove-monitor,marula-elephant,meerkat-sentry,plains-zebra,pride-queen,savanna-cheetah,springbok-pronker,stonedrop-vulture,termite-forager --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:evasion,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2838 games in 451 s.

- The list (16): Acacia Giraffe, Adder Ambusher, Crocodile Ambusher, Dust Hyena, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, Mangrove Monitor, Marula Elephant, Meerkat Sentry, Plains Zebra, Pride Queen, Savanna Cheetah, Springbok Pronker, Stonedrop Vulture, Termite Forager.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); strike-first x8 | 92% (89%-95%) | 0.4 | 0: 12, 1: 8 | 4x Dust Hyena, 4x Golden Eagle Diver, 4x Hoopoe Herald, 4x Termite Forager, 2x Pride Queen, 2x Savanna Cheetah | 10 |
| 2 | big | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers) | 90% (86%-93%) | 0.5 | 0: 10, 1: 10 | 4x Dust Hyena, 4x Hoopoe Herald, 4x Springbok Pronker, 4x Stonedrop Vulture, 2x Grave-Grin Hyena, 2x Pride Queen | 16 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.6); economy (4 resource makers) | 88% (85%-92%) | 0.6 | 0: 8, 1: 12 | 4x Dust Hyena, 4x Mangrove Monitor, 4x Termite Forager, 3x Adder Ambusher, 3x Meerkat Sentry, 2x Savanna Cheetah | 0 |
| 4 | family:evasion | big (8 copies at 1+ Lumber, average 0.6); evasion x8 | 82% (78%-86%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Acacia Giraffe, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Plains Zebra, 4x Stonedrop Vulture | 20 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 100% | 100% | 96% | 100% | 88% | 92% | 100% | 75% | 100% | 79% | 83% |
| 2 big | 96% | 100% | 92% | 100% | 96% | 100% | 96% | 88% | 88% | 58% | 75% |
| 3 open | 100% | 100% | 100% | 96% | 96% | 100% | 96% | 75% | 96% | 42% | 71% |
| 4 family:evasion | 100% | 100% | 92% | 88% | 83% | 92% | 92% | 63% | 96% | 50% | 50% |
