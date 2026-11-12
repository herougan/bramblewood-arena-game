# Focused decks: Map 20 Eye of the Volcano (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map me --pool ancient-sloth-titan,ash-moth,ashbone-ghoul,cinder-skeleton,deep-cave-troll,obsidian-scorpion,stalactite-golem,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6820 games in 131 s.

- The list (8): Ancient Sloth Titan, Ash Moth, Ashbone Ghoul, Cinder Skeleton, Cave Bear, Obsidian Scorpion, Stalactite Pill Bug, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-A-1 elite's deck; 20-A-2 elite's deck; 20-A-3 elite's deck; 20-A-4 dungeon's deck; 20-A-5 elite's deck; 20-A-6 elite's deck; 20-A-7 elite's deck; reference starter deck under 20-A-1's field; reference deck (Map 20) under 20-A-2's field; expected player deck (expectedPlayerDeck) under 20-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | armor x7 | 59% (54%-64%) | 1.05 | 0: 4, 1: 11, 2: 5 | 4x Ash Moth, 4x Ashbone Ghoul, 4x Cinder Skeleton, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 1x Vampire Roost | 0 |
| 2 | family:guard | big (8 copies at 2+ Lumber, average 1.4); guard x8; armor x7 | 52% (46%-57%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Ashbone Ghoul, 4x Cinder Skeleton, 4x Stalactite Pill Bug, 3x Obsidian Scorpion, 1x Ash Moth | 4 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.5); night x7 | 41% (35%-46%) | 1.5 | 0: 2, 1: 10, 2: 4, 3: 4 | 4x Cinder Skeleton, 4x Cave Bear, 4x Vampire Roost, 3x Ash Moth, 3x Obsidian Scorpion, 2x Ashbone Ghoul | 7 |

## Per opponent

| Deck | fight:20-A-1 | fight:20-A-2 | fight:20-A-3 | fight:20-A-4 | fight:20-A-5 | fight:20-A-6 | fight:20-A-7 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 79% | 79% | 71% | 75% | 75% | 96% | 63% | 38% | 13% | 0% |
| 2 family:guard | 71% | 71% | 63% | 71% | 63% | 92% | 54% | 13% | 17% | 4% |
| 3 big | 54% | 46% | 54% | 25% | 67% | 88% | 38% | 8% | 21% | 8% |
