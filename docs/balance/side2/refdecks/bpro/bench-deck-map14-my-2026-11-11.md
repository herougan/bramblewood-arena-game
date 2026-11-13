# Focused decks: Map 14 The Canopy (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,bramblewood-macaque,camouflage-frog,canopy-sloth-guardian,fishing-cat,hoopoe-herald,jaguar-stalker,kinkajou-lurker,mosquito-cloud,pride-queen,proboscis-monkey --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6512 games in 121 s.

- The list (11): Amber Cicada, Bramblewood Macaque, Camouflage Frog, Canopy Sloth Guardian, Fishing Cat, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Mosquito Cloud, Pride Queen, Proboscis Monkey.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (14 copies at 1+ Lumber, average 0.7) | 44% (37%-50%) | 0.7 | 0: 6, 1: 14 | 4x Amber Cicada, 4x Camouflage Frog, 4x Kinkajou Lurker, 3x Bramblewood Macaque, 3x Hoopoe Herald, 2x Jaguar Stalker | 10 |
| 2 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x8 | 40% (33%-46%) | 0.6 | 0: 8, 1: 12 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Mosquito Cloud, 3x Fishing Cat, 3x Jaguar Stalker, 2x Pride Queen | 11 |
| 3 | family:guard | big (15 copies at 1+ Lumber, average 0.9); guard x8 | 29% (23%-34%) | 0.95 | 0: 5, 1: 11, 2: 4 | 4x Canopy Sloth Guardian, 4x Kinkajou Lurker, 4x Proboscis Monkey, 3x Bramblewood Macaque, 3x Fishing Cat, 2x Hoopoe Herald | 11 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.5) | 23% (18%-29%) | 0.45 | 0: 11, 1: 9 | 4x Amber Cicada, 4x Hoopoe Herald, 4x Mosquito Cloud, 4x Proboscis Monkey, 3x Bramblewood Macaque, 1x Pride Queen | 0 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 42% | 54% | 46% | 17% | 33% | 71% | 71% | 17% |
| 2 family:strike-first | 38% | 46% | 42% | 21% | 21% | 67% | 67% | 17% |
| 3 family:guard | 13% | 29% | 21% | 4% | 21% | 75% | 42% | 25% |
| 4 open | 33% | 29% | 17% | 4% | 29% | 50% | 17% | 8% |
