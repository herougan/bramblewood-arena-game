# Focused decks: Map 0 The Old Bramble (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool amber-cicada,ashbone-ghoul,barkplate-beetle,bramble-sprout,bramblewood-lynx,dhole-matriarch,eagle-owl-quartermaster,earthworm,elder-willow,ent,farm-dog,grave-grin-hyena,hedgehog-herbalist,house-cat,ibex-rockcaller,lyrebird-mimic,pond-algae,quill-thorn-boar,quillguard,stoat-cutthroat,thorn-shrike,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:spite,big,swarm,open --anchor barkplate-beetle,bramble-sprout,bramblewood-lynx,earthworm,elder-willow,ent,farm-dog,house-cat,quill-thorn-boar,quillguard,thorn-shrike --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8694 games in 136 s.

- The list (23): Amber Cicada, Ashbone Ghoul, Barkplate Beetle, Bramble Sprout, Bramblewood Lynx, Dhole Matriarch, Eagle-Owl Quartermaster, Earthworm, Elder Willow, Ent, Farm Dog, Grave-Grin Hyena, Hedgehog Herbalist, House Cat, Ibex Rockcaller, Lyrebird Mimic, Pond Algae, Quill-Thorn Boar, Quillguard, Stoat Cutthroat, Thorn Shrike, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (16 copies at 0 Lumber) | 89% (85%-93%) | 0.2 | 0: 16, 1: 4 | 4x Farm Dog, 4x Grave-Grin Hyena, 4x Lyrebird Mimic, 3x Bramble Sprout, 3x Ent, 2x Earthworm | 12 |
| 2 | family:spite | spite x10 | 85% (80%-90%) | 0.95 | 0: 4, 1: 13, 2: 3 | 4x Bramble Sprout, 4x Truffle Piglet, 3x Barkplate Beetle, 3x Quill-Thorn Boar, 3x Stoat Cutthroat, 3x Wolf Spider Mother | 17 |
| 3 | open | swarm (15 copies at 0 Lumber) | 80% (75%-85%) | 0.25 | 0: 15, 1: 5 | 4x Ashbone Ghoul, 4x Farm Dog, 4x Grave-Grin Hyena, 3x House Cat, 3x Quill-Thorn Boar, 2x Eagle-Owl Quartermaster | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1) | 77% (72%-83%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Barkplate Beetle, 4x Elder Willow, 4x House Cat, 3x Ent, 3x Grave-Grin Hyena, 2x Bramblewood Lynx | 14 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 96% | 79% | 100% | 96% | 54% | 96% |
| 2 family:spite | 100% | 88% | 88% | 92% | 92% | 42% | 96% |
| 3 open | 92% | 88% | 88% | 88% | 96% | 25% | 88% |
| 4 big | 100% | 67% | 58% | 96% | 92% | 38% | 92% |
