# Focused decks: Map 14 The Canopy (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,banded-sea-krait,barkplate-beetle,bramblewood-macaque,camouflage-frog,eagle-owl-quartermaster,fishing-cat,fungus-gnat-cloud,grave-grin-hyena,great-barracuda,hercules-beetle,hoopoe-herald,ibex-rockcaller,ironclaw-fiddler,jaguar-stalker,kinkajou-lurker,mangrove-manatee,mosquito-cloud,pride-queen,proboscis-monkey,stoat-cutthroat,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:tide,big,open --anchor amber-cicada,bramblewood-macaque,camouflage-frog,fishing-cat,hercules-beetle,hoopoe-herald,jaguar-stalker,kinkajou-lurker,mosquito-cloud,pride-queen,proboscis-monkey --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8688 games in 140 s.

- The list (23): Amber Cicada, Banded Sea Krait, Barkplate Beetle, Bramblewood Macaque, Camouflage Frog, Eagle-Owl Quartermaster, Fishing Cat, Fungus Gnat Cloud, Grave-Grin Hyena, Great Barracuda, Hercules Beetle, Hoopoe Herald, Ibex Rockcaller, Ironclaw Fiddler, Jaguar Stalker, Kinkajou Lurker, Mangrove Manatee, Mosquito Cloud, Pride Queen, Proboscis Monkey, Stoat Cutthroat, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5) | 79% (74%-85%) | 0.45 | 0: 11, 1: 9 | 4x Fungus Gnat Cloud, 4x Grave-Grin Hyena, 4x Kinkajou Lurker, 3x Bramblewood Macaque, 3x Hercules Beetle, 2x Mangrove Manatee | 13 |
| 2 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x9 | 77% (72%-82%) | 0.6 | 0: 8, 1: 12 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 3x Fishing Cat, 3x Great Barracuda, 3x Kinkajou Lurker, 3x Stoat Cutthroat | 16 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.6); swarm x7 | 76% (70%-81%) | 0.6 | 0: 11, 1: 6, 2: 3 | 4x Fungus Gnat Cloud, 4x Hoopoe Herald, 3x Amber Cicada, 3x Barkplate Beetle, 3x Bramblewood Macaque, 3x Wolf Spider Mother | 0 |
| 4 | family:tide | big (8 copies at 1+ Lumber, average 0.4); tide x8; flying x8 | 49% (43%-56%) | 0.4 | 0: 12, 1: 8 | 4x Hoopoe Herald, 4x Mosquito Cloud, 4x Upside-Down Bat, 3x Great Barracuda, 3x Proboscis Monkey, 2x Mangrove Manatee | 16 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 79% | 79% | 63% | 83% | 79% | 100% | 88% | 63% |
| 2 family:strike-first | 88% | 92% | 88% | 75% | 83% | 88% | 83% | 21% |
| 3 open | 83% | 88% | 67% | 50% | 75% | 96% | 75% | 71% |
| 4 family:tide | 46% | 63% | 54% | 33% | 33% | 88% | 50% | 29% |
