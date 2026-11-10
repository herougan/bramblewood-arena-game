# Focused decks: Map 20 Eye of the Volcano (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-imp,ash-moth,ashbone-ghoul,bone-diviner,brimstone-hound,cave-warlord,cinder-imp,cinder-skeleton,deep-cave-troll,flagellant-vulture,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,rimeheart-colossus,stalactite-golem,the-contradiction,vampire-roost --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:armor,family:flying,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2600 games in 590 s.

- The list (20): Ancient Sloth Titan, Ash Imp, Ash Moth, Ashbone Ghoul, Bone Diviner, Brimstone Hound, Cave Warlord, Cinder Imp, Cinder Skeleton, Cave Bear, Flagellant Vulture, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Ossuary Lammergeier, Pall Wraith, Rimeheart Mammoth, Stalactite Pill Bug, The Contradiction, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 63% (58%-67%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Ash Imp, 4x Ashbone Ghoul, 4x Brimstone Hound, 4x Stalactite Pill Bug, 3x Pall Wraith, 1x Ossuary Lammergeier | 0 |
| 2 | family:armor | armor x10 | 50% (45%-56%) | 1.05 | 0: 3, 1: 13, 2: 4 | 4x Flagellant Vulture, 4x Stalactite Pill Bug, 3x Ashbone Ghoul, 3x Obsidian Lich, 3x Obsidian Scorpion, 3x Pall Wraith | 10 |
| 3 | family:flying | economy (4 resource makers); flying x8 | 43% (37%-48%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Bone Diviner, 4x Flagellant Vulture, 3x Pall Wraith, 1x The Contradiction | 13 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.5) | 30% (25%-36%) | 1.5 | 0: 6, 1: 6, 3: 8 | 4x Ancient Sloth Titan, 4x Ashbone Ghoul, 4x Cave Bear, 4x Magma Wraith, 2x Ash Moth, 2x Cinder Imp | 16 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 79% | 88% | 63% | 79% | 67% | 83% | 54% | 13% | 8% |
| 2 family:armor | 54% | 54% | 79% | 54% | 75% | 46% | 71% | 54% | 8% | 8% |
| 3 family:flying | 50% | 46% | 75% | 33% | 63% | 33% | 54% | 67% | 0% | 8% |
| 4 big | 38% | 58% | 50% | 21% | 29% | 38% | 21% | 33% | 4% | 13% |
