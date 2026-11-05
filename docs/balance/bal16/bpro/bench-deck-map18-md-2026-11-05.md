# Focused decks: Map 18 The Glass Dunes (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,bison-bulldozer,caustic-scorpion,dust-devil-kestrel,dust-hyena,fennec-fox,hollow-belly-rat,komodo-warlord,meerkat-burrower,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,thorny-devil --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:poison,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6800 games in 168 s.

- The list (15): Antlion Pit, Bison Bulldozer, Caustic Scorpion, Dust-devil Kestrel, Dust Hyena, Fennec Fox, Hollow-belly Rat, Komodo Warlord, Meerkat Burrower, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Spitting Cobra, Thorny Devil.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | strike-first x6 | 95% (93%-98%) | 1 | 1: 20 | 4x Antlion Pit, 4x Meerkat Burrower, 4x Roadrunner Courier, 4x Thorny Devil, 2x Sandfish, 2x Savanna Cheetah | 0 |
| 2 | family:poison | big (4 copies at 2+ Lumber, average 1.2); poison x8 | 92% (88%-95%) | 1.2 | 1: 16, 2: 4 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Sand Widow, 4x Sandfish, 4x Thorny Devil | 10 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.6); poison x8 | 58% (53%-64%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Komodo Warlord, 4x Meerkat Burrower, 4x Sand Widow, 4x Thorny Devil, 2x Sandfish, 2x Spitting Cobra | 10 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 96% | 100% | 100% | 92% | 96% | 100% | 92% | 100% | 92% | 88% |
| 2 family:poison | 96% | 100% | 92% | 100% | 92% | 96% | 100% | 100% | 75% | 67% |
| 3 big | 67% | 75% | 33% | 58% | 75% | 54% | 88% | 75% | 33% | 25% |
