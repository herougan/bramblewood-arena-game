# Focused decks: Map 14 The Canopy (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,bramblewood-macaque,camouflage-frog,fishing-cat,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,mosquito-cloud,pride-queen,proboscis-monkey --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:tide,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6032 games in 213 s.

- The list (11): Amber Cicada, Bramblewood Macaque, Camouflage Frog, Fishing Cat, Hercules Beetle, Hoopoe Herald, Jaguar Stalker, Kinkajou Lurker, Mosquito Cloud, Pride Queen, Proboscis Monkey.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | big (13 copies at 1 Lumber, average 0.7); tide x8 | 50% (43%-57%) | 0.65 | 0: 7, 1: 13 | 4x Camouflage Frog, 4x Hoopoe Herald, 4x Proboscis Monkey, 3x Bramblewood Macaque, 3x Hercules Beetle, 2x Fishing Cat | 10 |
| 2 | big | big (11 copies at 1 Lumber, average 0.6) | 47% (41%-54%) | 0.55 | 0: 9, 1: 11 | 4x Amber Cicada, 4x Camouflage Frog, 3x Bramblewood Macaque, 3x Hoopoe Herald, 3x Kinkajou Lurker, 3x Mosquito Cloud | 11 |
| 3 | family:strike-first | big (12 copies at 1 Lumber, average 0.6); strike-first x8 | 40% (34%-47%) | 0.6 | 0: 8, 1: 12 | 4x Hoopoe Herald, 4x Kinkajou Lurker, 4x Mosquito Cloud, 3x Fishing Cat, 3x Jaguar Stalker, 2x Pride Queen | 10 |
| 4 | open | big (13 copies at 1 Lumber, average 0.7) | 35% (29%-42%) | 0.65 | 0: 7, 1: 13 | 4x Kinkajou Lurker, 4x Mosquito Cloud, 4x Proboscis Monkey, 3x Bramblewood Macaque, 3x Hercules Beetle, 2x Pride Queen | 0 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 42% | 67% | 54% | 46% | 38% | 79% | 50% | 25% |
| 2 big | 50% | 42% | 71% | 13% | 38% | 71% | 71% | 25% |
| 3 family:strike-first | 38% | 46% | 46% | 21% | 21% | 67% | 67% | 17% |
| 4 open | 38% | 33% | 50% | 21% | 17% | 79% | 29% | 17% |
