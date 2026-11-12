# Focused decks: Map 14 The Canopy (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,fishing-cat,hoopoe-herald,howler-monkey,mosquito-cloud,pride-queen,slow-loris,toucan-courier --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6512 games in 148 s.

- The list (8): Amber Cicada, Fishing Cat, Hoopoe Herald, Howler Monkey, Mosquito Cloud, Pride Queen, Slow Loris, Toucan Courier.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber) | 71% (65%-77%) | 0.15 | 0: 17, 1: 3 | 4x Hoopoe Herald, 4x Howler Monkey, 4x Slow Loris, 4x Toucan Courier, 3x Fishing Cat, 1x Mosquito Cloud | 1 |
| 2 | open | swarm (16 copies at 0 Lumber) | 70% (64%-76%) | 0.2 | 0: 16, 1: 4 | 4x Hoopoe Herald, 4x Howler Monkey, 4x Slow Loris, 4x Toucan Courier, 3x Fishing Cat, 1x Amber Cicada | 0 |
| 3 | big | big (8 copies at 1 Lumber, average 0.4) | 49% (43%-56%) | 0.4 | 0: 12, 1: 8 | 4x Hoopoe Herald, 4x Slow Loris, 4x Toucan Courier, 3x Amber Cicada, 3x Fishing Cat, 2x Pride Queen | 4 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 75% | 88% | 79% | 42% | 88% | 92% | 71% | 33% |
| 2 open | 75% | 75% | 75% | 42% | 83% | 96% | 83% | 29% |
| 3 big | 46% | 71% | 67% | 13% | 33% | 67% | 83% | 17% |
