# Focused decks: Map 20 Volcano Lair (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,basalt-boar,caldera-wyrm,deep-cave-troll,fire-salamander,fumarole-ibex,magma-salamander,obsidian-scorpion,quillback-elder,stalactite-golem,ur-elk,vampire-roost --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:guard,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6622 games in 178 s.

- The list (12): Ancient Sloth Titan, Basalt Boar, The Caldera Wyrm, Cave Bear, Fire Salamander, Fumarole Ibex, Magma Salamander, Obsidian Scorpion, Quillback Elder, Stalactite Pill Bug, Ür-Elk, Vampire Roost.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (8 copies at 2+ Lumber, average 1.4); armor x11 | 52% (45%-58%) | 1.4 | 1: 12, 2: 8 | 4x Fire Salamander, 4x Quillback Elder, 4x Stalactite Pill Bug, 3x Basalt Boar, 3x Obsidian Scorpion, 2x Ür-Elk | 11 |
| 2 | family:guard | big (8 copies at 2+ Lumber, average 1.6); guard x8; armor x7 | 37% (30%-43%) | 1.6 | 1: 12, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Basalt Boar, 4x Stalactite Pill Bug, 3x Fumarole Ibex, 3x Obsidian Scorpion, 2x Magma Salamander | 10 |
| 3 | big | big (12 copies at 2+ Lumber, average 2.0); armor x6 | 33% (27%-39%) | 2 | 1: 8, 2: 4, 3: 8 | 4x Ancient Sloth Titan, 4x Cave Bear, 4x Fire Salamander, 4x Quillback Elder, 2x Magma Salamander, 2x Obsidian Scorpion | 14 |
| 4 | open | big (12 copies at 2+ Lumber, average 1.8); armor x7; rally x6 | 27% (21%-32%) | 1.8 | 1: 8, 2: 8, 3: 4 | 4x Cave Bear, 4x Stalactite Pill Bug, 4x Vampire Roost, 3x Fumarole Ibex, 3x Obsidian Scorpion, 2x Ür-Elk | 0 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 42% | 58% | 71% | 96% | 38% | 25% | 33% |
| 2 family:guard | 25% | 58% | 50% | 73% | 13% | 21% | 17% |
| 3 big | 13% | 79% | 46% | 50% | 29% | 13% | 4% |
| 4 open | 4% | 46% | 46% | 67% | 0% | 21% | 4% |
