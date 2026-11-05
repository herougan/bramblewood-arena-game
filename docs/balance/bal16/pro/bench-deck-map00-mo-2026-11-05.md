# Focused decks: Map 0 The Old Bramble (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool ashbone-ghoul,bramblewood-lynx,cunning-vixen,dhole-matriarch,eagle-owl-quartermaster,echidna-quillshot,ent,gatling-hog,grave-grin-hyena,hedgehog-herbalist,ibex-rockcaller,lucky-hopper,lyrebird-mimic,magma-wraith,mountain-hare,quillguard,sergeant-bramblefox,shimmerwing-stag,stoat-cutthroat,taiga-lynx,thorn-shrike,tunnel-ant,walrus-icebreaker,wolf-spider-mother,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:evasion,family:ranged,big,open --anchor bramblewood-lynx,dhole-matriarch,echidna-quillshot,ent,gatling-hog,hedgehog-herbalist,lucky-hopper,quillguard,sergeant-bramblefox,shimmerwing-stag,taiga-lynx,thorn-shrike,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5068 games in 87 s.

- The list (25): Ashbone Ghoul, Bramblewood Lynx, Cunning Vixen, Dhole Matriarch, Eagle-Owl Quartermaster, Echidna Quillshot, Ent, Gatling Hog, Grave-Grin Hyena, Hedgehog Herbalist, Ibex Rockcaller, Lucky Hopper, Lyrebird Mimic, Magma Wraith, Mountain Hare, Quillguard, Sergeant Bramblefox, Shimmerwing Stag, Stoat Cutthroat, Taiga Lynx, Thorn Shrike, Tunnel Ant, Walrus Icebreaker, Wolf Spider Mother, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (9 copies at 1+ Lumber, average 0.5) | 73% (66%-79%) | 0.45 | 0: 11, 1: 9 | 4x Ashbone Ghoul, 4x Grave-Grin Hyena, 3x Bramblewood Lynx, 3x Ent, 3x Hedgehog Herbalist, 3x Wolf Spider Mother | 0 |
| 2 | family:evasion | big (13 copies at 1+ Lumber, average 0.7); evasion x11 | 70% (63%-76%) | 0.65 | 0: 7, 1: 13 | 4x Magma Wraith, 4x Mountain Hare, 3x Ent, 3x Sergeant Bramblefox, 3x Taiga Lynx, 3x Wolf Spider Mother | 14 |
| 3 | big | big (20 copies at 1+ Lumber, average 1.0) | 49% (42%-56%) | 1 | 1: 20 | 4x Lucky Hopper, 4x Lyrebird Mimic, 3x Bramblewood Lynx, 3x Eagle-Owl Quartermaster, 3x Stoat Cutthroat, 3x Taiga Lynx | 17 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 75% | 63% | 79% | 42% | 96% | 67% | 88% |
| 2 family:evasion | 75% | 58% | 63% | 50% | 96% | 63% | 83% |
| 3 big | 58% | 38% | 63% | 8% | 71% | 33% | 71% |
