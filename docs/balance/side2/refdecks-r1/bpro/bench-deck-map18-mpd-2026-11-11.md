# Focused decks: Map 18 The Pale Desert (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool antlion-pit,barrel-cactus,caustic-scorpion,dune-jackal,horned-lizard,nightjar-drifter,quicksand-queen,roadrunner-courier,sand-widow,sandstorm-roc,sunbittern-strider --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:poison,family:strike-first,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7224 games in 262 s.

- The list (11): Antlion Pit, Barrel Cactus, Caustic Scorpion, Dune Jackal, Horned Lizard, Nightjar Drifter, Quicksand Queen, Roadrunner Courier, Sand Widow, Sandstorm Roc, Sunbittern Strider.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (20 copies at 1+ Lumber, average 1.0); swarm (20 copies at 1 Lumber); strike-first x8 | 69% (64%-73%) | 1 | 1: 20 | 4x Antlion Pit, 4x Dune Jackal, 4x Horned Lizard, 4x Roadrunner Courier, 2x Quicksand Queen, 2x Sunbittern Strider | 11 |
| 2 | family:poison | big (20 copies at 1+ Lumber, average 1.2); swarm (16 copies at 1 Lumber); poison x8 | 64% (59%-68%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Horned Lizard, 4x Sand Widow, 2x Nightjar Drifter, 2x Quicksand Queen | 11 |
| 3 | swarm | big (20 copies at 1+ Lumber, average 1.1); swarm (18 copies at 1 Lumber) | 63% (58%-68%) | 1.1 | 1: 18, 2: 2 | 4x Horned Lizard, 4x Nightjar Drifter, 4x Roadrunner Courier, 3x Barrel Cactus, 3x Sunbittern Strider, 2x Sand Widow | 13 |
| 4 | open | big (20 copies at 1+ Lumber, average 1.2); swarm (16 copies at 1 Lumber) | 58% (54%-63%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Roadrunner Courier, 4x Sandstorm Roc, 3x Barrel Cactus, 1x Quicksand Queen | 0 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 83% | 100% | 92% | 46% | 83% | 67% | 42% | 67% | 63% | 100% | 38% | 46% |
| 2 family:poison | 96% | 71% | 79% | 46% | 75% | 71% | 33% | 79% | 88% | 83% | 21% | 21% |
| 3 swarm | 75% | 88% | 75% | 50% | 83% | 58% | 29% | 75% | 67% | 79% | 33% | 42% |
| 4 open | 92% | 75% | 83% | 58% | 63% | 79% | 17% | 83% | 67% | 54% | 17% | 13% |
