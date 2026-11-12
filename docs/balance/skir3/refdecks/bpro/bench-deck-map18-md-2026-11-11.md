# Focused decks: Map 18 The Glass Dunes (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool ant-scout,antlion-pit,armadillo-guard,badger-lumberjack,balloon-archer,barkplate-beetle,barrel-cactus,bison-bulldozer,chipmunk-forager,dune-jackal,gallery-orb-weaver,horned-lizard,ice-crevasse-wolf,mouse-sapper,nightjar-drifter,roadrunner-courier,sand-widow,sunbittern-strider,worker-ant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:guard,family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7120 games in 135 s.

- The list (19): Ant Scout, Antlion Pit, Armadillo Guard, Badger Lumberjack, Balloon Archer, Barkplate Beetle, Barrel Cactus, Bison Bulldozer, Chipmunk Forager, Dune Jackal, Gallery Orb-Weaver, Horned Lizard, Ice-Crevasse Wolf, Mouse Sapper, Nightjar Drifter, Roadrunner Courier, Sand Widow, Sunbittern Strider, Worker Ant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (16 copies at 1+ Lumber, average 0.8) | 84% (79%-88%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Balloon Archer, 4x Chipmunk Forager, 4x Horned Lizard, 3x Armadillo Guard, 1x Mouse Sapper | 16 |
| 2 | open | big (19 copies at 1+ Lumber, average 0.9) | 82% (77%-86%) | 0.95 | 0: 1, 1: 19 | 4x Balloon Archer, 4x Bison Bulldozer, 4x Gallery Orb-Weaver, 4x Sunbittern Strider, 3x Barrel Cactus, 1x Worker Ant | 0 |
| 3 | family:guard | big (19 copies at 1+ Lumber, average 1.1); economy (4 resource makers); guard x8 | 77% (73%-82%) | 1.15 | 0: 1, 1: 15, 2: 4 | 4x Antlion Pit, 4x Armadillo Guard, 4x Badger Lumberjack, 4x Barkplate Beetle, 3x Mouse Sapper, 1x Ant Scout | 20 |
| 4 | family:poison | big (20 copies at 1+ Lumber, average 1.2); poison x8 | 65% (59%-71%) | 1.2 | 1: 16, 2: 4 | 4x Armadillo Guard, 4x Balloon Archer, 4x Gallery Orb-Weaver, 4x Sand Widow, 2x Antlion Pit, 2x Sunbittern Strider | 10 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 79% | 92% | 79% | 88% | 67% | 63% | 100% | 77% | 96% |
| 2 open | 96% | 71% | 83% | 79% | 88% | 75% | 79% | 100% | 54% | 92% |
| 3 family:guard | 100% | 83% | 79% | 58% | 100% | 58% | 58% | 100% | 38% | 96% |
| 4 family:poison | 83% | 58% | 83% | 63% | 67% | 38% | 46% | 100% | 46% | 67% |
