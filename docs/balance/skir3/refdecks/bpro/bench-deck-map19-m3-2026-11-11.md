# Focused decks: Map 19 Ashen Spurn (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool armadillo-guard,caustic-scorpion,dune-jackal,elderhorn-monarch,fire-salamander,glacier-yak,honey-badger-fury,horned-lizard,obsidian-scorpion,pinecone-sapper,polar-bear,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,walrus-icebreaker --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6912 games in 100 s.

- The list (17): Armadillo Guard, Caustic Scorpion, Dune Jackal, Elderhorn Monarch, Fire Salamander, Glacier Yak, Honey Badger Fury, Horned Lizard, Obsidian Scorpion, Pinecone Sapper, Polar Bear, Quillback Elder, Quillguard, Smokescreen Raccoon, Stalactite Pill Bug, Sulfur Cinder Moth, Walrus Icebreaker.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.8 Lumber) | 88% (84%-91%) | 0.8 | 0: 4, 1: 16 | 4x Fire Salamander, 4x Horned Lizard, 4x Pinecone Sapper, 4x Smokescreen Raccoon, 3x Caustic Scorpion, 1x Polar Bear | 0 |
| 2 | family:armor | armor x8 | 84% (81%-88%) | 1.05 | 0: 4, 1: 11, 2: 5 | 4x Armadillo Guard, 4x Horned Lizard, 4x Pinecone Sapper, 4x Quillback Elder, 3x Obsidian Scorpion, 1x Stalactite Pill Bug | 12 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.4); cold x6 | 77% (72%-81%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Glacier Yak, 4x Horned Lizard, 4x Pinecone Sapper, 4x Stalactite Pill Bug, 2x Polar Bear, 2x Walrus Icebreaker | 11 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 92% | 100% | 96% | 92% | 100% | 33% | 75% |
| 2 family:armor | 100% | 100% | 100% | 96% | 88% | 100% | 96% | 25% | 56% |
| 3 big | 98% | 81% | 92% | 100% | 83% | 75% | 92% | 25% | 44% |
