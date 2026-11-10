# Focused decks: Map 5 The Sunken Grove (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ms --pool alligator-gar,alpine-marmot,anhinga-spearbird,banded-sea-krait,blue-ringed-octopus,bog-behemoth,bog-leech,booming-bittern,caiman-hatchling,cottonmouth-matriarch,cypress-root-lurker,eagle-owl-quartermaster,fen-mink,fire-ant-raft,matamata,mossmother-newt,mudflat-godwit,mudpuppy,newt-doctor,nutria-reedcutter,old-snapjaw,otter-centurion,peat-cutter-vole,raft-spider,signal-crayfish,snapper-hatchling,swamp-alligator,upside-down-bat,venomlord-serpent,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:armor,family:tide,big,open --anchor anhinga-spearbird,bog-behemoth,bog-leech,caiman-hatchling,cottonmouth-matriarch,cypress-root-lurker,fen-mink,matamata,mossmother-newt,mudflat-godwit,newt-doctor,nutria-reedcutter,old-snapjaw,peat-cutter-vole,signal-crayfish,snapper-hatchling,swamp-alligator,venomlord-serpent --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2268 games in 699 s.

- The list (30): Alligator Gar, Alpine Marmot, Anhinga Spearbird, Banded Sea Krait, Blue-ringed Octopus, Bog Behemoth, Bog Leech, Booming Bittern, Caiman Hatchling, Cottonmouth Matriarch, Cypress Root Lurker, Eagle-Owl Quartermaster, Fen Mink, Fire Ant Raft, Matamata, Mossmother Newt, Mudflat Godwit, Mudpuppy, Newt Doctor, Nutria Reedcutter, Old Snapjaw, Otter Centurion, Peat-cutter Vole, Raft Spider, Signal Crayfish, Snapper Hatchling, Swamp Alligator, Upside-Down Bat, Venomlord Serpent, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 5-A-1 skirmish's deck; 5-A-2 skirmish's deck; 5-A-3 skirmish's deck; 5-A-4 boss's deck; reference starter deck under 5-A-1's field; reference deck (Map 13) under 5-A-2's field; expected player deck (expectedPlayerDeck) under 5-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | bleed x10; armor x8 | 69% (63%-75%) | 0.55 | 0: 12, 1: 5, 2: 3 | 4x Bog Leech, 4x Mossmother Newt, 4x Upside-Down Bat, 3x Alligator Gar, 3x Old Snapjaw, 2x Signal Crayfish | 16 |
| 2 | open | midrange (average 0.4 Lumber) | 68% (62%-74%) | 0.4 | 0: 12, 1: 8 | 4x Anhinga Spearbird, 4x Bog Leech, 4x Fire Ant Raft, 4x Mudpuppy, 4x Nutria Reedcutter | 0 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); tide x10 | 67% (61%-73%) | 0.3 | 0: 14, 1: 6 | 4x Caiman Hatchling, 4x Snapper Hatchling, 4x Upside-Down Bat, 3x Alligator Gar, 3x Fire Ant Raft, 2x Bog Leech | 15 |
| 4 | big | big (10 copies at 2+ Lumber, average 1.5); armor x7 | 29% (23%-35%) | 1.5 | 0: 3, 1: 7, 2: 7, 3: 3 | 4x Cypress Root Lurker, 4x Swamp Alligator, 3x Blue-ringed Octopus, 3x Bog Behemoth, 3x Old Snapjaw, 3x Otter Centurion | 20 |

## Per opponent

| Deck | fight:5-A-1 | fight:5-A-2 | fight:5-A-3 | fight:5-A-4 | ref:starter | ref:road13 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 75% | 96% | 71% | 75% | 92% | 29% | 46% |
| 2 open | 83% | 92% | 67% | 50% | 96% | 13% | 75% |
| 3 family:tide | 67% | 83% | 79% | 42% | 96% | 21% | 79% |
| 4 big | 38% | 54% | 42% | 8% | 54% | 0% | 8% |
