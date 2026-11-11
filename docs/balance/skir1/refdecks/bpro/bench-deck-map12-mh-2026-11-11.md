# Focused decks: Map 12 The Briar Maze (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mh --pool barkplate-beetle,bramble-hoglet,briarback-hedgehog,carrion-crow,cunning-vixen,dormouse,hawthorn-shieldbug,hedge-weasel,hedgerow-shrew,lyrebird-mimic,mouse-sapper,pack-rat-looter,quill-thorn-boar,quillguard,terrier-pup,thorn-shrike --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2960 games in 589 s.

- The list (16): Barkplate Beetle, Bramble Hoglet, Briarback Hedgehog, Carrion Crow, Cunning Vixen, Dormouse, Hawthorn Shieldbug, Hedge Weasel, Hedgerow Shrew, Lyrebird Mimic, Mouse Sapper, Pack Rat Looter, Quill-Thorn Boar, Quillguard, Terrier Pup, Thorn Shrike.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 12-1 skirmish's deck; 12-2 skirmish's deck; 12-3 skirmish's deck; 12-4 skirmish's deck; 12-5 elite's deck; 12-6 elite's deck; 12-7 miniboss's deck; reference starter deck under 12-1's field; reference deck (Map 12) under 12-2's field; expected player deck (expectedPlayerDeck) under 12-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); armor x8 | 73% (68%-78%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Hoglet, 4x Briarback Hedgehog, 4x Carrion Crow, 4x Hawthorn Shieldbug, 4x Hedgerow Shrew | 14 |
| 2 | big | big (9 copies at 1+ Lumber, average 0.7) | 73% (67%-78%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Barkplate Beetle, 4x Dormouse, 4x Hedgerow Shrew, 4x Mouse Sapper, 3x Bramble Hoglet, 1x Hawthorn Shieldbug | 16 |
| 3 | economy | big (8 copies at 1+ Lumber, average 0.6); economy (8 resource makers) | 70% (65%-75%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Barkplate Beetle, 4x Carrion Crow, 4x Hedgerow Shrew, 4x Pack Rat Looter, 4x Terrier Pup | 10 |
| 4 | open | big (10 copies at 1+ Lumber, average 0.5); economy (6 resource makers) | 62% (56%-68%) | 0.5 | 0: 10, 1: 10 | 4x Hedge Weasel, 4x Hedgerow Shrew, 4x Pack Rat Looter, 3x Quill-Thorn Boar, 3x Thorn Shrike, 2x Carrion Crow | 0 |

## Per opponent

| Deck | fight:12-1 | fight:12-2 | fight:12-3 | fight:12-4 | fight:12-5 | fight:12-6 | fight:12-7 | ref:starter | ref:road12 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 83% | 88% | 83% | 63% | 75% | 67% | 67% | 100% | 46% | 58% |
| 2 big | 79% | 79% | 83% | 54% | 88% | 54% | 58% | 100% | 63% | 67% |
| 3 economy | 75% | 83% | 92% | 63% | 83% | 67% | 71% | 100% | 17% | 46% |
| 4 open | 63% | 75% | 75% | 54% | 75% | 50% | 63% | 96% | 33% | 38% |
