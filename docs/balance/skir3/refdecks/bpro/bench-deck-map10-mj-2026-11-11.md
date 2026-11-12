# Focused decks: Map 10 The Sunken Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,clownfish-scout,coral-polyp-colony,giant-clam,humpback-elder,moon-jelly,orca-vanguard,reef-admiral,riptide-eel --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6368 games in 125 s.

- The list (9): Abyss Lantern Squid, Clownfish Scout, Coral Polyp Colony, Giant Clam, Humpback Elder, Moon Jelly, Orca Vanguard, Reef Admiral, Riptide Eel.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 2+ Lumber, average 1.4); tide x20; rally x6 | 89% (86%-92%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Coral Polyp Colony, 4x Humpback Elder, 4x Orca Vanguard, 3x Abyss Lantern Squid, 3x Clownfish Scout, 2x Reef Admiral | 12 |
| 2 | open | tide x20 | 80% (76%-85%) | 0.6 | 0: 8, 1: 12 | 4x Coral Polyp Colony, 4x Giant Clam, 4x Moon Jelly, 4x Riptide Eel, 3x Abyss Lantern Squid, 1x Reef Admiral | 0 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 100% | 92% | 100% | 100% | 88% | 33% |
| 2 open | 96% | 88% | 96% | 83% | 96% | 90% | 73% | 23% |
