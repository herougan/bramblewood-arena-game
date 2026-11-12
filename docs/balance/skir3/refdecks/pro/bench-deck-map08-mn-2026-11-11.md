# Focused decks: Map 8 The Glimmer Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mn --pool blind-cave-fish,blue-ringed-octopus,cave-olm,dust-hyena,eagle-owl-quartermaster,echo-matriarch,gallery-orb-weaver,giant-cave-huntsman,grave-grin-hyena,kittiwake-flock,magpie-collector,millipede-hauler,mudflat-godwit,nightjar-drifter,oilbird,quarry-mole,stalactite-golem,star-nosed-mole,stoat-cutthroat,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor blind-cave-fish,cave-olm,echo-matriarch,magpie-collector,oilbird,quarry-mole,stalactite-golem,star-nosed-mole,upside-down-bat --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9058 games in 197 s.

- The list (21): Blind Cave Fish, Blue-ringed Octopus, Cave Olm, Dust Hyena, Eagle-Owl Quartermaster, Echo Matriarch, Gallery Orb-Weaver, Giant Cave Huntsman, Grave-Grin Hyena, Kittiwake Flock, Magpie Collector, Millipede Hauler, Mudflat Godwit, Nightjar Drifter, Oilbird, Quarry Mole, Stalactite Pill Bug, Star-nosed Mole, Stoat Cutthroat, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-A-1 skirmish's deck; 8-A-2 skirmish's deck; 8-A-3 skirmish's deck; 8-A-4 boss's deck; reference starter deck under 8-A-1's field; reference deck (Map 16) under 8-A-2's field; expected player deck (expectedPlayerDeck) under 8-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x11; tide x7 | 79% (73%-84%) | 0.45 | 0: 11, 1: 9 | 4x Kittiwake Flock, 4x Mudflat Godwit, 4x Upside-Down Bat, 3x Blind Cave Fish, 3x Echo Matriarch, 2x Wolf Spider Mother | 14 |
| 2 | open | flying x11 | 77% (72%-83%) | 0.35 | 0: 13, 1: 7 | 4x Kittiwake Flock, 4x Magpie Collector, 4x Star-nosed Mole, 3x Eagle-Owl Quartermaster, 3x Grave-Grin Hyena, 2x Blind Cave Fish | 0 |
| 3 | big | big (11 copies at 1+ Lumber, average 0.6) | 74% (69%-79%) | 0.55 | 0: 9, 1: 11 | 4x Gallery Orb-Weaver, 4x Oilbird, 4x Star-nosed Mole, 3x Dust Hyena, 3x Giant Cave Huntsman, 2x Cave Olm | 16 |
| 4 | family:armor | big (8 copies at 1+ Lumber, average 0.6); economy (4 resource makers); armor x8 | 58% (51%-64%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Dust Hyena, 4x Millipede Hauler, 4x Stalactite Pill Bug, 4x Star-nosed Mole, 4x Upside-Down Bat | 16 |

## Per opponent

| Deck | fight:8-A-1 | fight:8-A-2 | fight:8-A-3 | fight:8-A-4 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 92% | 88% | 92% | 92% | 38% | 50% |
| 2 open | 92% | 100% | 79% | 88% | 92% | 42% | 50% |
| 3 big | 96% | 96% | 83% | 75% | 96% | 21% | 50% |
| 4 family:armor | 79% | 83% | 63% | 71% | 67% | 17% | 25% |
