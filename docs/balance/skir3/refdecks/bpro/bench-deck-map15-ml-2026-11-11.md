# Focused decks: Map 15 The Long Grass (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool border-collie,bramblewood-lynx,cataphract-destrier,dust-hyena,eagle-owl-quartermaster,elderhorn-monarch,fawn-scout,hoopoe-herald,mallard-marauder,mosquito-cloud,plains-zebra,savanna-cheetah,siege-rhino,stoat-cutthroat,sworn-shieldbearer,tasmanian-devil,village-miller,warhorse-charger --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:strike-first,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7300 games in 90 s.

- The list (18): Border Collie, Bramblewood Lynx, Gilded Roadwarden, Dust Hyena, Eagle-Owl Quartermaster, Elderhorn Monarch, Fawn Scout, Hoopoe Herald, Mallard Marauder, Mosquito Cloud, Plains Zebra, Savanna Cheetah, Siege Rhino, Stoat Cutthroat, Sworn Shieldbearer, Tasmanian Devil, Village Miller, Warhorse Charger.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.3 Lumber) | 93% (89%-96%) | 0.35 | 0: 13, 1: 7 | 4x Border Collie, 4x Hoopoe Herald, 4x Plains Zebra, 3x Bramblewood Lynx, 3x Fawn Scout, 2x Village Miller | 0 |
| 2 | family:flying | swarm (14 copies at 0 Lumber); economy (4 resource makers); flying x10 | 88% (85%-92%) | 0.3 | 0: 14, 1: 6 | 4x Dust Hyena, 4x Hoopoe Herald, 4x Mosquito Cloud, 3x Eagle-Owl Quartermaster, 3x Mallard Marauder, 2x Plains Zebra | 14 |
| 3 | family:strike-first | big (4 copies at 3+ Lumber, average 1.3); strike-first x10 | 83% (79%-87%) | 1.3 | 0: 6, 1: 10, 4: 4 | 4x Border Collie, 4x Gilded Roadwarden, 4x Village Miller, 3x Mallard Marauder, 3x Stoat Cutthroat, 2x Fawn Scout | 12 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.5); economy (4 resource makers) | 48% (42%-53%) | 1.5 | 0: 10, 1: 2, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Dust Hyena, 4x Elderhorn Monarch, 4x Village Miller, 2x Fawn Scout, 2x Siege Rhino | 16 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 96% | 79% | 100% | 100% | 100% | 96% | 79% | 79% |
| 2 family:flying | 96% | 88% | 100% | 83% | 100% | 100% | 96% | 100% | 50% | 71% |
| 3 family:strike-first | 88% | 92% | 96% | 75% | 100% | 96% | 83% | 100% | 56% | 46% |
| 4 big | 71% | 33% | 71% | 25% | 71% | 58% | 58% | 75% | 0% | 17% |
