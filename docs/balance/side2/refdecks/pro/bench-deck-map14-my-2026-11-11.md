# Focused decks: Map 14 The Canopy (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool amber-cicada,barkplate-beetle,bramblewood-macaque,camouflage-frog,canopy-sloth-guardian,dhole-matriarch,eagle-owl-quartermaster,fishing-cat,grave-grin-hyena,great-barracuda,hoopoe-herald,ibex-rockcaller,jaguar-stalker,kinkajou-lurker,ladybird-guard,mangrove-manatee,marula-elephant,mosquito-cloud,pride-queen,proboscis-monkey,stoat-cutthroat,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:guard,family:strike-first,big,open --anchor amber-cicada,bramblewood-macaque,camouflage-frog,canopy-sloth-guardian,fishing-cat,hoopoe-herald,jaguar-stalker,kinkajou-lurker,mosquito-cloud,pride-queen,proboscis-monkey --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8832 games in 326 s.

- The list (23): Amber Cicada, Barkplate Beetle, Bramblewood Macaque, Camouflage Frog, Canopy Sloth Guardian, Dhole Matriarch, Eagle-Owl Quartermaster, Fishing Cat, Grave-Grin Hyena, Great Barracuda, Hoopoe Herald, Ibex Rockcaller, Jaguar Stalker, Kinkajou Lurker, Ladybird Guard, Mangrove Manatee, Marula Elephant, Mosquito Cloud, Pride Queen, Proboscis Monkey, Stoat Cutthroat, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x9 | 74% (68%-79%) | 0.6 | 0: 8, 1: 12 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 3x Fishing Cat, 3x Great Barracuda, 3x Kinkajou Lurker, 3x Stoat Cutthroat | 11 |
| 2 | open | big (11 copies at 1+ Lumber, average 0.6); tide x6 | 66% (59%-72%) | 0.55 | 0: 9, 1: 11 | 4x Camouflage Frog, 4x Kinkajou Lurker, 4x Mosquito Cloud, 3x Grave-Grin Hyena, 3x Stoat Cutthroat, 2x Tide Seahorse | 0 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.6); guard x7 | 50% (43%-57%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Hoopoe Herald, 4x Ladybird Guard, 4x Mosquito Cloud, 3x Barkplate Beetle, 3x Mangrove Manatee, 2x Fishing Cat | 16 |
| 4 | family:guard | big (11 copies at 1+ Lumber, average 0.9); guard x11 | 49% (43%-56%) | 0.95 | 0: 9, 1: 3, 2: 8 | 4x Canopy Sloth Guardian, 4x Hoopoe Herald, 4x Marula Elephant, 3x Bramblewood Macaque, 3x Mangrove Manatee, 2x Tide Seahorse | 18 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 88% | 75% | 79% | 75% | 83% | 88% | 83% | 21% |
| 2 open | 75% | 67% | 50% | 63% | 75% | 96% | 63% | 38% |
| 3 big | 42% | 58% | 38% | 25% | 46% | 75% | 67% | 50% |
| 4 family:guard | 42% | 50% | 42% | 63% | 50% | 58% | 54% | 38% |
