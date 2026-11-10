# Focused decks: Map 20 Eye of the Volcano (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,cave-warlord,cinder-skeleton,deep-cave-troll,magma-wraith,obsidian-lich,obsidian-scorpion,ossuary-lammergeier,pall-wraith,rimeheart-colossus,stalactite-golem,the-contradiction,vampire-roost --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:armor,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2520 games in 608 s.

- The list (15): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Cave Warlord, Cinder Skeleton, Cave Bear, Magma Wraith, Obsidian Lich, Obsidian Scorpion, Ossuary Lammergeier, Pall Wraith, Rimeheart Mammoth, Stalactite Pill Bug, The Contradiction, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x9 | 66% (61%-71%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Ashbone Ghoul, 4x Magma Wraith, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 3x Pall Wraith, 2x Obsidian Lich | 12 |
| 2 | open | big (3 copies at 3+ Lumber, average 1.3) | 46% (41%-52%) | 1.3 | 0: 4, 1: 9, 2: 4, 3: 3 | 4x Ashbone Ghoul, 4x Cinder Skeleton, 4x Magma Wraith, 4x Vampire Roost, 3x Ancient Sloth Titan, 1x The Contradiction | 0 |
| 3 | big | big (8 copies at 3+ Lumber, average 1.8); siege x8 | 44% (39%-50%) | 1.8 | 0: 4, 1: 8, 3: 4, 4: 4 | 4x Ashbone Ghoul, 4x Cave Warlord, 4x Cave Bear, 3x Obsidian Scorpion, 3x Pall Wraith, 2x Ash Moth | 16 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 88% | 75% | 83% | 67% | 92% | 63% | 83% | 79% | 25% | 8% |
| 2 open | 63% | 75% | 58% | 42% | 75% | 50% | 58% | 29% | 4% | 8% |
| 3 big | 54% | 63% | 63% | 29% | 54% | 54% | 63% | 52% | 4% | 8% |
