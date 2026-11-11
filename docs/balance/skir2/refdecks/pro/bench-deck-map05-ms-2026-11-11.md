# Focused decks: Map 5 The Sunken Grove (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,alpine-marmot,anhinga-spearbird,banded-sea-krait,blue-ringed-octopus,bog-behemoth,bog-leech,booming-bittern,caiman-hatchling,cottonmouth-matriarch,cypress-root-lurker,eagle-owl-quartermaster,fen-mink,fire-ant-raft,matamata,mossmother-newt,mudflat-godwit,mudpuppy,newt-doctor,nutria-reedcutter,old-snapjaw,otter-centurion,peat-cutter-vole,raft-spider,signal-crayfish,snapper-hatchling,swamp-alligator,upside-down-bat,venomlord-serpent,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:armor,family:tide,big,open --anchor anhinga-spearbird,bog-behemoth,bog-leech,caiman-hatchling,cottonmouth-matriarch,cypress-root-lurker,fen-mink,matamata,mossmother-newt,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,signal-crayfish,snapper-hatchling,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8960 games in 151 s.

- The list (30): Alligator Gar, Alpine Marmot, Anhinga Spearbird, Banded Sea Krait, Blue-ringed Octopus, Bog Behemoth, Bog Leech, Booming Bittern, Caiman Hatchling, Cottonmouth Matriarch, Cypress Root Lurker, Eagle-Owl Quartermaster, Fen Mink, Fire Ant Raft, Matamata, Mossmother Newt, Mudflat Godwit, Mudpuppy, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Peat-cutter Vole, Raft Spider, Signal Crayfish, Snapper Hatchling, Swamp Alligator, Upside-Down Bat, Venomlord Serpent, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | heal x8 | 91% (87%-95%) | 0.4 | 0: 12, 1: 8 | 4x Matamata, 4x Mossmother Newt, 4x Mudflat Godwit, 4x Mudpuppy, 2x Alpine Marmot, 2x Bog Leech | 0 |
| 2 | family:tide | tide x8 | 85% (80%-90%) | 0.35 | 0: 13, 1: 7 | 4x Mudflat Godwit, 4x Nutria Reedcutter, 4x Snapper Hatchling, 4x Upside-Down Bat, 3x Blue-ringed Octopus, 1x Newt Doctor | 16 |
| 3 | family:armor | armor x8; evasion x7 | 68% (61%-74%) | 0.4 | 0: 12, 1: 8 | 4x Bog Leech, 4x Matamata, 4x Signal Crayfish, 3x Caiman Hatchling, 3x Otter Centurion, 2x Mossmother Newt | 12 |
| 4 | big | big (9 copies at 2+ Lumber, average 1.3); heal x7; armor x6 | 46% (40%-53%) | 1.25 | 0: 7, 1: 4, 2: 6, 3: 3 | 4x Mudflat Godwit, 4x Mudpuppy, 4x Swamp Alligator, 3x Bog Behemoth, 3x Bog Leech, 2x Old Snapjaw | 10 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 100% | 88% | 96% | 96% | 100% | 71% | 88% |
| 2 family:tide | 100% | 83% | 71% | 92% | 100% | 75% | 75% |
| 3 family:armor | 83% | 50% | 69% | 79% | 100% | 25% | 67% |
| 4 big | 88% | 63% | 33% | 50% | 50% | 21% | 21% |
