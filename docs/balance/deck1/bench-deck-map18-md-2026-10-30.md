# Focused decks: Map 18 The Glass Dunes (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map md --pool antlion-pit,banded-sea-krait,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,eagle-owl-quartermaster,fennec-fox,gallery-orb-weaver,glass-golem,glimmer-spider,grave-grin-hyena,hollow-belly-rat,ibex-rockcaller,komodo-warlord,meerkat-burrower,peregrine-stooper,roadrunner-courier,sand-widow,sandfish,spitting-cobra,squires-mount,stoat-cutthroat,thorny-devil,walrus-icebreaker,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,family:poison,open --anchor antlion-pit,bison-bulldozer,caustic-scorpion,dromedary,dune-packrat,dust-devil-kestrel,dust-hyena,fennec-fox,glass-golem,hollow-belly-rat,komodo-warlord,meerkat-burrower,roadrunner-courier,sand-widow,sandfish,spitting-cobra,thorny-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6880 games in 148 s.

- The list (29): Antlion Pit, Banded Sea Krait, Bison Bulldozer, Caustic Scorpion, Dromedary, Dune Packrat, Dust-devil Kestrel, Dust Hyena, Eagle-Owl Quartermaster, Fennec Fox, Gallery Orb-Weaver, Glass Golem, Glimmer Spider, Grave-Grin Hyena, Hollow-belly Rat, Ibex Rockcaller, Komodo Warlord, Meerkat Burrower, Peregrine Stooper, Roadrunner Courier, Sand Widow, Sandfish, Spitting Cobra, Squire's Mount, Stoat Cutthroat, Thorny Devil, Walrus Icebreaker, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 18-1 skirmish's deck; 18-2 skirmish's deck; 18-3 skirmish's deck; 18-4 skirmish's deck; 18-5 elite's deck; 18-6 elite's deck; 18-7 miniboss's deck; reference starter deck under 18-1's field; reference deck (Map 18) under 18-2's field; expected player deck (expectedPlayerDeck) under 18-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (8 resource makers) | 98% (96%-99%) | 0.8 | 0: 4, 1: 16 | 4x Antlion Pit, 4x Dune Packrat, 4x Dust Hyena, 4x Thorny Devil, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 14 |
| 2 | open | midrange (average 1.0 Lumber) | 95% (93%-98%) | 1 | 1: 20 | 4x Antlion Pit, 4x Bison Bulldozer, 4x Dromedary, 4x Roadrunner Courier, 2x Eagle-Owl Quartermaster, 2x Ibex Rockcaller | 0 |
| 3 | family:poison | poison x8 | 95% (92%-97%) | 1 | 1: 20 | 4x Bison Bulldozer, 4x Caustic Scorpion, 4x Dromedary, 4x Glimmer Spider, 4x Thorny Devil | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); poison x8 | 82% (78%-86%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Grave-Grin Hyena, 4x Komodo Warlord, 4x Sand Widow, 4x Thorny Devil, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 18 |

## Per opponent

| Deck | fight:18-1 | fight:18-2 | fight:18-3 | fight:18-4 | fight:18-5 | fight:18-6 | fight:18-7 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 100% | 100% | 100% | 96% | 96% | 100% | 88% | 96% |
| 2 open | 92% | 92% | 100% | 96% | 96% | 100% | 100% | 100% | 81% | 96% |
| 3 family:poison | 100% | 100% | 100% | 100% | 100% | 100% | 92% | 100% | 63% | 92% |
| 4 big | 100% | 96% | 71% | 75% | 100% | 88% | 79% | 96% | 33% | 83% |
