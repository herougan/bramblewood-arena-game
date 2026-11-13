# Focused decks: Map 17 The Ice Hollow (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool beluga,cormorant,dormouse,giant-clam,glacier-yak,greenland-shark,ice-crevasse-wolf,lemming-swarm,limpet-clinger,moon-jelly,pincushion-urchin,ringed-seal,riptide-eel,rock-pool-starfish,shoal-shark,snow-ermine,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:armor,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6888 games in 74 s.

- The list (17): Beluga, Cormorant, Dormouse, Giant Clam, Glacier Yak, Greenland Shark, Ice-Crevasse Wolf, Lemming Swarm, Limpet Clinger, Moon Jelly, Pincushion Urchin, Ringed Seal, Riptide Eel, Rock Pool Starfish, Shoal Shark, Snow Ermine, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x8 | 88% (84%-92%) | 0.35 | 0: 13, 1: 7 | 4x Cormorant, 4x Lemming Swarm, 4x Shoal Shark, 4x Snow Ermine, 3x Riptide Eel, 1x Pincushion Urchin | 13 |
| 2 | swarm | swarm (18 copies at 0 Lumber); tide x7; night x6 | 85% (81%-90%) | 0.1 | 0: 18, 1: 2 | 4x Dormouse, 4x Lemming Swarm, 4x Pincushion Urchin, 3x Cormorant, 3x Moon Jelly, 2x Wolfsbane Alpha | 16 |
| 3 | open | swarm (16 copies at 0 Lumber); tide x12 | 79% (75%-83%) | 0.2 | 0: 16, 1: 4 | 4x Dormouse, 4x Limpet Clinger, 4x Riptide Eel, 4x Rock Pool Starfish, 4x Snow Ermine | 0 |
| 4 | family:armor | tide x14; armor x8 | 77% (72%-82%) | 0.5 | 0: 10, 1: 10 | 4x Giant Clam, 4x Lemming Swarm, 4x Limpet Clinger, 3x Beluga, 3x Shoal Shark, 2x Cormorant | 16 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 92% | 100% | 58% | 67% |
| 2 swarm | 100% | 100% | 100% | 100% | 83% | 58% | 54% |
| 3 open | 100% | 100% | 100% | 92% | 96% | 25% | 42% |
| 4 family:armor | 100% | 100% | 100% | 88% | 63% | 38% | 50% |
