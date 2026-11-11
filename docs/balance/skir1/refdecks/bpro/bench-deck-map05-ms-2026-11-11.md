# Focused decks: Map 5 The Sunken Grove (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool anhinga-spearbird,bog-behemoth,bog-leech,cottonmouth-matriarch,cypress-root-lurker,fen-mink,matamata,mossmother-newt,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,signal-crayfish,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:armor,family:heal,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2156 games in 394 s.

- The list (16): Anhinga Spearbird, Bog Behemoth, Bog Leech, Cottonmouth Matriarch, Cypress Root Lurker, Fen Mink, Matamata, Mossmother Newt, Mudflat Godwit, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Peat-cutter Vole, Signal Crayfish, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.6 Lumber) | 89% (84%-93%) | 0.6 | 0: 8, 1: 12 | 4x Anhinga Spearbird, 4x Matamata, 4x Mossmother Newt, 4x Mudflat Godwit, 4x Peat-cutter Vole | 0 |
| 2 | family:heal | swarm (16 copies at 0 Lumber); heal x8 | 66% (60%-72%) | 0.2 | 0: 16, 1: 4 | 4x Bog Leech, 4x Fen Mink, 4x Mossmother Newt, 4x Mudflat Godwit, 4x Newt Doctor | 12 |
| 3 | family:armor | armor x10 | 58% (52%-65%) | 0.95 | 0: 8, 1: 5, 2: 7 | 4x Mossmother Newt, 4x Nutria Reedcutter, 4x Swamp Alligator, 3x Matamata, 3x Old Snapjaw, 2x Mudflat Godwit | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.8); guard x8 | 15% (10%-21%) | 1.75 | 0: 1, 1: 11, 3: 8 | 4x Bog Behemoth, 4x Cypress Root Lurker, 4x Mudflat Godwit, 4x Venomlord Serpent, 3x Matamata, 1x Bog Leech | 13 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 92% | 96% | 100% | 58% | 75% |
| 2 family:heal | 96% | 71% | 50% | 54% | 96% | 58% | 38% |
| 3 family:armor | 83% | 75% | 71% | 63% | 71% | 4% | 42% |
| 4 big | 21% | 8% | 25% | 8% | 25% | 4% | 17% |
