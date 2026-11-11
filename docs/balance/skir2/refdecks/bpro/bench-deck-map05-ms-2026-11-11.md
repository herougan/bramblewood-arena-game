# Focused decks: Map 5 The Sunken Grove (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool anhinga-spearbird,bog-behemoth,bog-leech,cottonmouth-matriarch,cypress-root-lurker,fen-mink,matamata,mossmother-newt,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,signal-crayfish,swamp-alligator,venomlord-serpent --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,family:heal,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6762 games in 120 s.

- The list (16): Anhinga Spearbird, Bog Behemoth, Bog Leech, Cottonmouth Matriarch, Cypress Root Lurker, Fen Mink, Matamata, Mossmother Newt, Mudflat Godwit, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Peat-cutter Vole, Signal Crayfish, Swamp Alligator, Venomlord Serpent.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | armor x8 | 82% (77%-87%) | 0.6 | 0: 8, 1: 12 | 4x Matamata, 4x Mudflat Godwit, 4x Signal Crayfish, 3x Nutria Reedcutter, 3x Peat-cutter Vole, 2x Bog Leech | 11 |
| 2 | family:heal | heal x8 | 78% (73%-83%) | 0.4 | 0: 12, 1: 8 | 4x Mossmother Newt, 4x Newt Doctor, 4x Peat-cutter Vole, 3x Anhinga Spearbird, 3x Mudflat Godwit, 2x Signal Crayfish | 10 |
| 3 | open | heal x7 | 76% (70%-81%) | 0.5 | 0: 13, 1: 4, 2: 3 | 4x Mossmother Newt, 4x Mudflat Godwit, 4x Nutria Reedcutter, 3x Newt Doctor, 3x Swamp Alligator, 2x Bog Leech | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); armor x15 | 42% (35%-48%) | 1.25 | 0: 4, 1: 8, 2: 7, 3: 1 | 4x Matamata, 4x Mossmother Newt, 4x Signal Crayfish, 4x Swamp Alligator, 3x Old Snapjaw, 1x Bog Behemoth | 13 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 100% | 92% | 96% | 92% | 88% | 46% | 63% |
| 2 family:heal | 100% | 79% | 92% | 92% | 100% | 29% | 54% |
| 3 open | 92% | 92% | 88% | 79% | 88% | 58% | 33% |
| 4 big | 75% | 63% | 42% | 38% | 50% | 8% | 17% |
