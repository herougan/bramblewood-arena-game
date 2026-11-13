# Focused decks: Map 18 The Pale Desert (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mpd --pool anhinga-spearbird,antlion-pit,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-devil-kestrel,eagle-owl-quartermaster,fire-ant-raft,gallery-orb-weaver,giant-cave-huntsman,grave-grin-hyena,horned-lizard,ibex-rockcaller,pale-oryx,pronghorn-racer,roadrunner-courier,sand-widow,stoat-cutthroat,thorny-devil,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:strike-first,family:poison,big,open --anchor antlion-pit,barrel-cactus,caustic-scorpion,dromedary,dune-jackal,dust-devil-kestrel,horned-lizard,pale-oryx,roadrunner-courier,sand-widow --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9168 games in 173 s.

- The list (22): Anhinga Spearbird, Antlion Pit, Barrel Cactus, Caustic Scorpion, Dromedary, Dune Jackal, Dust-devil Kestrel, Eagle-Owl Quartermaster, Fire Ant Raft, Gallery Orb-Weaver, Giant Cave Huntsman, Grave-Grin Hyena, Horned Lizard, Ibex Rockcaller, Pale Oryx, Pronghorn Racer, Roadrunner Courier, Sand Widow, Stoat Cutthroat, Thorny Devil, Tide Seahorse, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-A-1 skirmish's deck; 18-A-2 skirmish's deck; 18-A-3 skirmish's deck; 18-A-4 skirmish's deck; 18-A-5 skirmish's deck; 18-A-6 skirmish's deck; 18-A-7 skirmish's deck; 18-A-8 elite's deck; 18-A-9 boss's deck; reference starter deck under 18-A-1's field; reference deck (Map 19) under 18-A-2's field; expected player deck (expectedPlayerDeck) under 18-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (18 copies at 1+ Lumber, average 0.9); strike-first x8 | 81% (77%-85%) | 0.9 | 0: 2, 1: 18 | 4x Antlion Pit, 4x Dromedary, 4x Pronghorn Racer, 4x Roadrunner Courier, 2x Ibex Rockcaller, 2x Tide Seahorse | 14 |
| 2 | big | big (18 copies at 1+ Lumber, average 0.9); spite x7 | 81% (78%-84%) | 0.9 | 0: 2, 1: 18 | 4x Caustic Scorpion, 4x Dromedary, 4x Thorny Devil, 3x Barrel Cactus, 3x Giant Cave Huntsman, 2x Tide Seahorse | 11 |
| 3 | open | big (14 copies at 1+ Lumber, average 0.7) | 80% (76%-84%) | 0.7 | 0: 6, 1: 14 | 4x Caustic Scorpion, 4x Grave-Grin Hyena, 4x Roadrunner Courier, 3x Barrel Cactus, 3x Eagle-Owl Quartermaster, 2x Tide Seahorse | 0 |
| 4 | family:poison | big (16 copies at 1+ Lumber, average 0.9); poison x8 | 78% (74%-83%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Grave-Grin Hyena, 4x Horned Lizard, 4x Thorny Devil, 3x Caustic Scorpion, 3x Sand Widow, 2x Gallery Orb-Weaver | 13 |

## Per opponent

| Deck | fight:18-A-1 | fight:18-A-2 | fight:18-A-3 | fight:18-A-4 | fight:18-A-5 | fight:18-A-6 | fight:18-A-7 | fight:18-A-8 | fight:18-A-9 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 100% | 88% | 83% | 96% | 75% | 100% | 83% | 75% | 75% | 100% | 52% | 46% |
| 2 big | 96% | 96% | 92% | 96% | 83% | 100% | 96% | 75% | 88% | 92% | 54% | 4% |
| 3 open | 96% | 92% | 79% | 92% | 79% | 100% | 71% | 83% | 88% | 88% | 54% | 42% |
| 4 family:poison | 96% | 83% | 92% | 92% | 75% | 96% | 75% | 83% | 83% | 96% | 50% | 21% |
