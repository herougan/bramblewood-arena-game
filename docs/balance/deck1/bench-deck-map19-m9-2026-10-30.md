# Focused decks: Map 19 Basalt Foundry (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m9 --pool anvilwhisker-otter,ash-cloud-condor,ash-moth,ashbone-ghoul,ashwing-ptarmigan,badger-berserker,cinder-gecko,eagle-owl-quartermaster,ember-jackal,fire-salamander,firefly-swarm,grave-grin-hyena,hercules-beetle,magma-salamander,magma-wraith,obsidian-lich,ore-smelter-mole,phoenix-fledgling,quill-volley,rimefire-salamander,squires-mount,stoat-cutthroat,tide-spirit,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus big,swarm,family:fire,open --anchor anvilwhisker-otter,ash-cloud-condor,ashbone-ghoul,cinder-gecko,ember-jackal,fire-salamander,hercules-beetle,magma-salamander,ore-smelter-mole,phoenix-fledgling,quill-volley,tide-spirit --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13650 games in 214 s.

- The list (24): Anvilwhisker Otter, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Ashwing Ptarmigan, Badger Berserker, Cinder Gecko, Eagle-Owl Quartermaster, Ember Jackal, Fire Salamander, Firefly Swarm, Grave-Grin Hyena, Hercules Beetle, Magma Salamander, Magma Wraith, Obsidian Lich, Ore-Smelter Mole, Phoenix Fledgling, Quill Volley, Rimefire Salamander, Squire's Mount, Stoat Cutthroat, Tide Spirit, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-A-1 skirmish's deck; 19-A-2 skirmish's deck; 19-A-3 skirmish's deck; 19-A-4 skirmish's deck; 19-A-5 skirmish's deck; 19-A-6 skirmish's deck; 19-A-7 elite's deck; 19-A-8 elite's deck; 19-A-9 elite's deck; 19-A-10 boss's deck; reference starter deck under 19-A-1's field; reference deck (Map 23) under 19-A-2's field; expected player deck (expectedPlayerDeck) under 19-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber) | 95% (92%-97%) | 0.25 | 0: 15, 1: 5 | 4x Ashbone Ghoul, 4x Cinder Gecko, 4x Grave-Grin Hyena, 3x Tide Spirit, 3x Wolf Spider Mother, 2x Badger Berserker | 9 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4) | 93% (90%-95%) | 0.4 | 0: 12, 1: 8 | 4x Ashbone Ghoul, 4x Cinder Gecko, 4x Grave-Grin Hyena, 3x Ember Jackal, 3x Quill Volley, 2x Squire's Mount | 7 |
| 3 | family:fire | big (12 copies at 1+ Lumber, average 0.7); fire x11; ranged x7 | 93% (90%-95%) | 0.65 | 0: 8, 1: 11, 2: 1 | 4x Cinder Gecko, 4x Fire Salamander, 4x Firefly Swarm, 4x Grave-Grin Hyena, 3x Magma Salamander, 1x Anvilwhisker Otter | 9 |
| 4 | open | big (9 copies at 1+ Lumber, average 0.5) | 90% (88%-93%) | 0.45 | 0: 11, 1: 9 | 4x Cinder Gecko, 4x Grave-Grin Hyena, 3x Ashbone Ghoul, 3x Fire Salamander, 3x Squire's Mount, 3x Stoat Cutthroat | 0 |

## Per opponent

| Deck | fight:19-A-1 | fight:19-A-2 | fight:19-A-3 | fight:19-A-4 | fight:19-A-5 | fight:19-A-6 | fight:19-A-7 | fight:19-A-8 | fight:19-A-9 | fight:19-A-10 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 100% | 96% | 100% | 96% | 100% | 96% | 92% | 100% | 63% | 88% |
| 2 big | 96% | 100% | 100% | 100% | 96% | 100% | 88% | 96% | 92% | 100% | 100% | 50% | 88% |
| 3 family:fire | 100% | 100% | 96% | 100% | 96% | 100% | 75% | 96% | 100% | 92% | 96% | 58% | 96% |
| 4 open | 100% | 100% | 100% | 100% | 96% | 96% | 75% | 96% | 92% | 79% | 100% | 42% | 100% |
