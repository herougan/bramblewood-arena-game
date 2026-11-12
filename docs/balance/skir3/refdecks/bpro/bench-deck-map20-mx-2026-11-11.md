# Focused decks: Map 20 Volcano Lair (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,cinder-stoker,deep-cave-troll,ember-jackal,gorge-wyrm,magma-salamander,stalactite-golem,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6370 games in 100 s.

- The list (8): Ancient Sloth Titan, Cinder Stoker, Cave Bear, Ember Jackal, Gorge Wyrm, Magma Salamander, Stalactite Pill Bug, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | big (12 copies at 2+ Lumber, average 1.8); guard x8; rally x7 | 48% (43%-53%) | 1.8 | 0: 4, 1: 4, 2: 4, 3: 8 | 4x Ancient Sloth Titan, 4x Cinder Stoker, 4x Cave Bear, 4x Stalactite Pill Bug, 3x Ember Jackal, 1x Magma Salamander | 4 |
| 2 | big + open | big (11 copies at 2+ Lumber, average 1.9); siege x7; rally x7 | 47% (42%-52%) | 1.9 | 0: 4, 1: 5, 3: 11 | 4x Ancient Sloth Titan, 4x Cinder Stoker, 4x Cave Bear, 3x Ember Jackal, 3x Gorge Wyrm, 2x Magma Salamander | 0 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:guard | 25% | 79% | 96% | 92% | 8% | 33% | 4% |
| 2 big + open | 17% | 88% | 92% | 88% | 17% | 21% | 8% |
