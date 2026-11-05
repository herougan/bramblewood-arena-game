# Focused decks: Map 18 The Glass Dunes (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool alpine-swift,antlion-pit,banded-sea-krait,bison-bulldozer,blue-ringed-octopus,caustic-scorpion,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,glimmer-spider,grave-grin-hyena,hollow-belly-rat,ibex-rockcaller,komodo-warlord,meerkat-burrower,peregrine-stooper,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,stoat-cutthroat,thorny-devil,walrus-icebreaker,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:poison,family:strike-first,big,open --anchor antlion-pit,bison-bulldozer,caustic-scorpion,dust-devil-kestrel,dust-hyena,fennec-fox,hollow-belly-rat,komodo-warlord,meerkat-burrower,roadrunner-courier,sand-widow,sandfish,savanna-cheetah,spitting-cobra,thorny-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7380 games in 175 s.

- The list (27): Alpine Swift, Antlion Pit, Banded Sea Krait, Bison Bulldozer, Blue-ringed Octopus, Caustic Scorpion, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Glimmer Spider, Grave-Grin Hyena, Hollow-belly Rat, Ibex Rockcaller, Komodo Warlord, Meerkat Burrower, Peregrine Stooper, Roadrunner Courier, Sand Widow, Sandfish, Savanna Cheetah, Spitting Cobra, Stoat Cutthroat, Thorny Devil, Walrus Icebreaker, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:poison | economy (4 resource makers); poison x8 | 95% (93%-98%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Caustic Scorpion, 4x Dust Hyena, 4x Glimmer Spider, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 14 |
| 2 | open | economy (4 resource makers); strike-first x7 | 89% (85%-93%) | 0.65 | 0: 7, 1: 13 | 4x Dust Hyena, 4x Roadrunner Courier, 4x Thorny Devil, 3x Alpine Swift, 3x Blue-ringed Octopus, 2x Walrus Icebreaker | 0 |
| 3 | family:strike-first | strike-first x11; flying x7 | 87% (83%-91%) | 0.8 | 0: 4, 1: 16 | 4x Alpine Swift, 4x Antlion Pit, 4x Roadrunner Courier, 3x Eagle-Owl Quartermaster, 3x Stoat Cutthroat, 2x Thorny Devil | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); poison x8 | 68% (62%-74%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Antlion Pit, 4x Komodo Warlord, 4x Sand Widow, 3x Blue-ringed Octopus, 3x Dust Hyena, 2x Thorny Devil | 12 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:poison | 100% | 100% | 100% | 100% | 100% | 92% | 88% | 100% | 83% | 92% |
| 2 open | 92% | 96% | 88% | 88% | 100% | 96% | 71% | 100% | 75% | 83% |
| 3 family:strike-first | 96% | 88% | 79% | 79% | 100% | 96% | 75% | 100% | 75% | 79% |
| 4 big | 79% | 88% | 67% | 75% | 79% | 54% | 63% | 83% | 42% | 50% |
