# Focused decks: Map 15 The Long Grass (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool bison-bulldozer,border-collie,cataphract-destrier,cricket-drummer,fire-ant-raft,goose-sentry,hedge-weasel,land-tiller,mallard-halberdier,mouse-sapper,pronghorn-racer,shepherds-bark,thorn-shrike,truffle-piglet,war-hound --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6220 games in 98 s.

- The list (15): Bison Bulldozer, Border Collie, Gilded Roadwarden, Cricket Drummer, Fire Ant Raft, Goose Sentry, Hedge Weasel, Land Tiller, Mallard Halberdier, Mouse Sapper, Pronghorn Racer, Shepherd, Thorn Shrike, Truffle Piglet, War Hound.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 86% (82%-90%) | 0.6 | 0: 8, 1: 12 | 4x Border Collie, 4x Cricket Drummer, 4x Land Tiller, 3x Goose Sentry, 3x Mallard Halberdier, 2x Truffle Piglet | 0 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 79% | 88% | 63% | 96% | 88% | 96% | 100% | 75% | 83% |
