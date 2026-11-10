# Focused decks: Map 8 Caves & Alcoves (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m4 --pool alley-cat,barkplate-beetle,barrow-leech-bat,bee-forager,blind-cave-fish,bombardier-beetle,cave-olm,corpse-flower-beetle,driftwood-crab,dung-beetle,echo-matriarch,echo-screecher,fungus-gnat-cloud,gallery-orb-weaver,giant-cave-huntsman,grey-seal-bull,hawthorn-shieldbug,leafcutter-gardener,mudpuppy,newt-doctor,otter-centurion,planarian-splitter,quarry-mole,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:armor,big,open --anchor barrow-leech-bat,blind-cave-fish,cave-olm,corpse-flower-beetle,driftwood-crab,echo-matriarch,echo-screecher,gallery-orb-weaver,giant-cave-huntsman,hawthorn-shieldbug,quarry-mole,rot-swollen-carcass,stalactite-golem,star-nosed-mole,sulfur-cinder-moth,upside-down-bat,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3146 games in 583 s.

- The list (29): Alley Cat, Barkplate Beetle, Barrow Leech, Bee Forager, Blind Cave Fish, Bombardier Beetle, Cave Olm, Corpse-flower Beetle, Driftwood Crab, Dung Beetle, Echo Matriarch, Echo Screecher, Fungus Gnat Cloud, Gallery Orb-Weaver, Giant Cave Huntsman, Grey Seal Bull, Hawthorn Shieldbug, Leafcutter Gardener, Mudpuppy, Newt Doctor, Otter Centurion, Planarian Splitter, Quarry Mole, Rot-Swollen Carcass, Stalactite Pill Bug, Star-nosed Mole, Sulfur Cinder Moth, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 8-1 skirmish's deck; 8-2 skirmish's deck; 8-3 skirmish's deck; 8-4 skirmish's deck; 8-5 skirmish's deck; 8-6 skirmish's deck; 8-7 elite's deck; 8-8 miniboss's deck; reference starter deck under 8-1's field; reference deck (Map 8) under 8-2's field; expected player deck (expectedPlayerDeck) under 8-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (17 copies at 0 Lumber); flying x10 | 86% (82%-90%) | 0.15 | 0: 17, 1: 3 | 4x Alley Cat, 4x Upside-Down Bat, 3x Echo Matriarch, 3x Fungus Gnat Cloud, 3x Leafcutter Gardener, 3x Star-nosed Mole | 16 |
| 2 | family:armor | economy (4 resource makers); armor x8 | 82% (78%-86%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Barkplate Beetle, 4x Blind Cave Fish, 4x Driftwood Crab, 3x Echo Matriarch, 3x Wolf Spider Mother, 2x Bombardier Beetle | 14 |
| 3 | open | economy (4 resource makers); armor x6 | 80% (75%-84%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Alley Cat, 4x Cave Olm, 4x Driftwood Crab, 4x Dung Beetle, 2x Barkplate Beetle, 2x Gallery Orb-Weaver | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); flying x6 | 71% (66%-76%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Rot-Swollen Carcass, 3x Echo Matriarch, 3x Grey Seal Bull, 3x Mudpuppy, 3x Upside-Down Bat | 18 |

## Per opponent

| Deck | fight:8-1 | fight:8-2 | fight:8-3 | fight:8-4 | fight:8-5 | fight:8-6 | fight:8-7 | fight:8-8 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 92% | 96% | 71% | 96% | 92% | 96% | 58% | 83% | 96% | 83% | 88% |
| 2 family:armor | 96% | 88% | 75% | 100% | 67% | 100% | 63% | 83% | 100% | 63% | 67% |
| 3 open | 100% | 79% | 79% | 96% | 92% | 92% | 71% | 54% | 96% | 63% | 54% |
| 4 big | 92% | 75% | 67% | 88% | 88% | 71% | 21% | 71% | 83% | 63% | 67% |
