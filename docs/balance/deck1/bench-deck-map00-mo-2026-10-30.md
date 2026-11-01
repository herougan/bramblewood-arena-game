# Focused decks: Map 0 The Old Bramble (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool ashbone-ghoul,bramblewood-lynx,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,echidna-quillshot,ent,fox-sharpshot,gatling-hog,grave-grin-hyena,hedgehog-herbalist,ibex-rockcaller,lucky-hopper,lyrebird-mimic,mountain-hare,quillguard,sergeant-bramblefox,shimmerwing-stag,squires-mount,stoat-cutthroat,swamp-rabbit,taiga-lynx,thorn-shrike,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:evasion,open --anchor bramblewood-lynx,dhole-matriarch,echidna-quillshot,ent,gatling-hog,hedgehog-herbalist,lucky-hopper,quillguard,sergeant-bramblefox,shimmerwing-stag,taiga-lynx,thorn-shrike,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9702 games in 139 s.

- The list (25): Ashbone Ghoul, Bramblewood Lynx, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Echidna Quillshot, Ent, Fox Sharpshot, Gatling Hog, Grave-Grin Hyena, Hedgehog Herbalist, Ibex Rockcaller, Lucky Hopper, Lyrebird Mimic, Mountain Hare, Quillguard, Sergeant Bramblefox, Shimmerwing Stag, Squire's Mount, Stoat Cutthroat, Swamp Rabbit, Taiga Lynx, Thorn Shrike, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5) | 76% (70%-82%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Mountain Hare, 3x Bramblewood Lynx, 3x Ent, 3x Sergeant Bramblefox, 3x Wolf Spider Mother | 14 |
| 2 | open | big (10 copies at 1+ Lumber, average 0.5) | 73% (67%-79%) | 0.5 | 0: 10, 1: 10 | 4x Grave-Grin Hyena, 4x Lucky Hopper, 3x Ent, 3x Hedgehog Herbalist, 3x Mountain Hare, 3x Squire's Mount | 0 |
| 3 | family:evasion | big (9 copies at 1+ Lumber, average 0.5); evasion x8 | 64% (58%-71%) | 0.45 | 0: 11, 1: 9 | 4x Mountain Hare, 4x Swamp Rabbit, 3x Bramblewood Lynx, 3x Ent, 3x Hedgehog Herbalist, 3x Thorn Shrike | 11 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 79% | 75% | 79% | 58% | 96% | 58% | 88% |
| 2 open | 83% | 63% | 71% | 42% | 100% | 79% | 75% |
| 3 family:evasion | 79% | 54% | 67% | 38% | 83% | 42% | 88% |
