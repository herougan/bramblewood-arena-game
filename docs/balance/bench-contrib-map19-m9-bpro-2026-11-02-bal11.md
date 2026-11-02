# Card value per budget point (map19-m9-bpro, 2026-11-02)

Package TOOLS1 (T1). `node tools/bench/bench.js contrib --map m9 --all --games 250` (tools/bench/bench.js contrib 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `faa5cc9f27d4`.

## How it is measured

- 250 fights a card. Fight i: an opponent deck and a rest of 14 cards, both random and legal from the 26-card pool, and one of 10 fields. The slot (6 copies) completes the rest into 20 cards: once with the card, once with 6 Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.
- Level 4.44, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).
- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / 6. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).
- **Fair line**: per copy = +8.9 + -0.160 x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.
- Median 95% interval of a contribution: ±6.3 points. Random decks: a card that needs partners reads low.

## Most value per budget point (above the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Echidna Quillshot | veryrare | 1 | 3/11 | volley | 35.41 | +47.2 ± 6.3 | +7.9 | 0.22 | 1.4194 | +4.8 | 8.9 |
| Tide Spirit | rare | 0 | 5/5 | tide | 25.1 | +54.0 ± 6.3 | +9.0 | 0.36 | 2.3226 | +4.2 | 7.87 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 33.85 | +39.6 ± 6.6 | +6.6 | 0.19 | 1.2258 | +3.2 | 5.8 |
| Magma Salamander | rare | 1 | 3/11 | fireArrow | 27.95 | +38.8 ± 6.7 | +6.5 | 0.23 | 1.4839 | +2.1 | 3.76 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 20.36 | +44.8 ± 6.2 | +7.5 | 0.37 | 2.3871 | +1.9 | 3.64 |
| Talus Pika | common | 0 | 2/7 | triggers | 18.29 | +46.6 ± 6.3 | +7.8 | 0.42 | 2.7097 | +1.9 | 3.5 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.5 | +42.4 ± 6.4 | +7.1 | 0.31 | 2 | +1.9 | 3.4 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 67.84 | -2.4 ± 6.6 | -0.4 | -0.01 | -0.0645 | +1.8 | 3.17 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 27.95 | +35.6 ± 6.6 | +5.9 | 0.21 | 1.3548 | +1.6 | 2.86 |
| Ember Revenant | veryrare | 2 | 4/15 | pierce, undead | 34.96 | +27.2 ± 6.7 | +4.5 | 0.13 | 0.8387 | +1.4 | 2.35 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 28.99 | +32.4 ± 6.3 | +5.4 | 0.19 | 1.2258 | +1.3 | 2.32 |
| Cinder Stoker | common | 0 | 1/11 | heat | 18.29 | +41.2 ± 6.2 | +6.9 | 0.38 | 2.4516 | +1.0 | 1.84 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 23.73 | +31.2 ± 6.6 | +5.2 | 0.22 | 1.4194 | +0.2 | 0.34 |
| Fire Salamander | uncommon | 1 | 3/7 | spitfire | 27.95 | +25.6 ± 6.3 | +4.3 | 0.15 | 0.9677 | -0.1 | -0.09 |
| Yeti | common | 3 | 5/29 | scare | 55.97 | -4.0 ± 6.7 | -0.7 | -0.01 | -0.0645 | -0.4 | -0.75 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.65 | +23.4 ± 6.2 | +3.9 | 0.15 | 0.9677 | -0.6 | -1.19 |
| Beaver Lumberjack | common | 0 | 3/3 | stockpile | 18.87 | +29.2 ± 6.0 | +4.9 | 0.26 | 1.6774 | -0.9 | -1.84 |
| Pit Glutton | rare | 1 | 2/11 | devour | 24.32 | +23.6 ± 6.4 | +3.9 | 0.16 | 1.0323 | -1.0 | -1.79 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29.51 | +14.8 ± 6.0 | +2.5 | 0.08 | 0.5161 | -1.6 | -3.16 |
| Quill Volley | rare | 1 | 1/14 | pounce | 25.03 | +17.8 ± 5.9 | +3.0 | 0.12 | 0.7742 | -1.8 | -3.65 |

## Least value per budget point (below the fair line)

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 19.32 | +5.2 ± 6.8 | +0.9 | 0.04 | 0.2581 | -4.9 | -8.43 |
| Magma Titan | common | 3 | 2/17 | immolation, scar | 37.49 | -6.0 ± 6.7 | -1.0 | -0.03 | -0.1935 | -3.8 | -6.65 |
| Phoenix Fledgling | common | 2 | 2/10 | cure, flying, renewal | 30.8 | +1.6 ± 5.7 | +0.3 | 0.01 | 0.0645 | -3.6 | -7.45 |
| Anvilwhisker Otter | uncommon | 2 | 1/14 | triggers | 32.36 | +2.8 ± 5.3 | +0.5 | 0.01 | 0.0645 | -3.1 | -7.01 |
| Granite Ox Golem | rare | 2 | 3/17 | recoil, triggers | 47.86 | -10.0 ± 5.8 | -1.7 | -0.03 | -0.1935 | -2.8 | -5.57 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 28.73 | +9.6 ± 5.9 | +1.6 | 0.06 | 0.3871 | -2.6 | -5.22 |
| Quill Volley | rare | 1 | 1/14 | pounce | 25.03 | +17.8 ± 5.9 | +3.0 | 0.12 | 0.7742 | -1.8 | -3.65 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29.51 | +14.8 ± 6.0 | +2.5 | 0.08 | 0.5161 | -1.6 | -3.16 |
| Pit Glutton | rare | 1 | 2/11 | devour | 24.32 | +23.6 ± 6.4 | +3.9 | 0.16 | 1.0323 | -1.0 | -1.79 |
| Beaver Lumberjack | common | 0 | 3/3 | stockpile | 18.87 | +29.2 ± 6.0 | +4.9 | 0.26 | 1.6774 | -0.9 | -1.84 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.65 | +23.4 ± 6.2 | +3.9 | 0.15 | 0.9677 | -0.6 | -1.19 |
| Yeti | common | 3 | 5/29 | scare | 55.97 | -4.0 ± 6.7 | -0.7 | -0.01 | -0.0645 | -0.4 | -0.75 |
| Fire Salamander | uncommon | 1 | 3/7 | spitfire | 27.95 | +25.6 ± 6.3 | +4.3 | 0.15 | 0.9677 | -0.1 | -0.09 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 23.73 | +31.2 ± 6.6 | +5.2 | 0.22 | 1.4194 | +0.2 | 0.34 |
| Cinder Stoker | common | 0 | 1/11 | heat | 18.29 | +41.2 ± 6.2 | +6.9 | 0.38 | 2.4516 | +1.0 | 1.84 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 28.99 | +32.4 ± 6.3 | +5.4 | 0.19 | 1.2258 | +1.3 | 2.32 |
| Ember Revenant | veryrare | 2 | 4/15 | pierce, undead | 34.96 | +27.2 ± 6.7 | +4.5 | 0.13 | 0.8387 | +1.4 | 2.35 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 27.95 | +35.6 ± 6.6 | +5.9 | 0.21 | 1.3548 | +1.6 | 2.86 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 67.84 | -2.4 ± 6.6 | -0.4 | -0.01 | -0.0645 | +1.8 | 3.17 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.5 | +42.4 ± 6.4 | +7.1 | 0.31 | 2 | +1.9 | 3.4 |

## Every card

Sorted by distance from the fair line.

| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Echidna Quillshot | veryrare | 1 | 3/11 | volley | 35.41 | +47.2 ± 6.3 | +7.9 | 0.22 | 1.4194 | +4.8 | 8.9 |
| Tide Spirit | rare | 0 | 5/5 | tide | 25.1 | +54.0 ± 6.3 | +9.0 | 0.36 | 2.3226 | +4.2 | 7.87 |
| Hercules Beetle | rare | 1 | 2/17 | mighty | 33.85 | +39.6 ± 6.6 | +6.6 | 0.19 | 1.2258 | +3.2 | 5.8 |
| Magma Salamander | rare | 1 | 3/11 | fireArrow | 27.95 | +38.8 ± 6.7 | +6.5 | 0.23 | 1.4839 | +2.1 | 3.76 |
| Cinder Gecko | common | 0 | 2/5 | evasive | 20.36 | +44.8 ± 6.2 | +7.5 | 0.37 | 2.3871 | +1.9 | 3.64 |
| Talus Pika | common | 0 | 2/7 | triggers | 18.29 | +46.6 ± 6.3 | +7.8 | 0.42 | 2.7097 | +1.9 | 3.5 |
| Ashbone Ghoul | common | 0 | 1/5 | remember, triggers | 22.5 | +42.4 ± 6.4 | +7.1 | 0.31 | 2 | +1.9 | 3.4 |
| Glacial Ape-King | common | 4 | 6/40 | earthquake, guardian | 67.84 | -2.4 ± 6.6 | -0.4 | -0.01 | -0.0645 | +1.8 | 3.17 |
| Obsidian Scorpion | rare | 1 | 4/4 | armor, poison | 27.95 | +35.6 ± 6.6 | +5.9 | 0.21 | 1.3548 | +1.6 | 2.86 |
| Ember Revenant | veryrare | 2 | 4/15 | pierce, undead | 34.96 | +27.2 ± 6.7 | +4.5 | 0.13 | 0.8387 | +1.4 | 2.35 |
| Ore-Smelter Mole | uncommon | 1 | 4/9 | heavyMetal, triggers | 28.99 | +32.4 ± 6.3 | +5.4 | 0.19 | 1.2258 | +1.3 | 2.32 |
| Cinder Stoker | common | 0 | 1/11 | heat | 18.29 | +41.2 ± 6.2 | +6.9 | 0.38 | 2.4516 | +1.0 | 1.84 |
| Ember Jackal | rare | 1 | 3/11 | frenzy | 23.73 | +31.2 ± 6.6 | +5.2 | 0.22 | 1.4194 | +0.2 | 0.34 |
| Fire Salamander | uncommon | 1 | 3/7 | spitfire | 27.95 | +25.6 ± 6.3 | +4.3 | 0.15 | 0.9677 | -0.1 | -0.09 |
| Yeti | common | 3 | 5/29 | scare | 55.97 | -4.0 ± 6.7 | -0.7 | -0.01 | -0.0645 | -0.4 | -0.75 |
| Pumice Beetle | uncommon | 1 | 3/11 | triggers | 26.65 | +23.4 ± 6.2 | +3.9 | 0.15 | 0.9677 | -0.6 | -1.19 |
| Beaver Lumberjack | common | 0 | 3/3 | stockpile | 18.87 | +29.2 ± 6.0 | +4.9 | 0.26 | 1.6774 | -0.9 | -1.84 |
| Pit Glutton | rare | 1 | 2/11 | devour | 24.32 | +23.6 ± 6.4 | +3.9 | 0.16 | 1.0323 | -1.0 | -1.79 |
| Ash Cloud Condor | rare | 1 | 3/4 | flying, triggers | 29.51 | +14.8 ± 6.0 | +2.5 | 0.08 | 0.5161 | -1.6 | -3.16 |
| Quill Volley | rare | 1 | 1/14 | pounce | 25.03 | +17.8 ± 5.9 | +3.0 | 0.12 | 0.7742 | -1.8 | -3.65 |
| Glacier Wolf Pack | common | 2 | 1/15 | bleed | 28.73 | +9.6 ± 5.9 | +1.6 | 0.06 | 0.3871 | -2.6 | -5.22 |
| Granite Ox Golem | rare | 2 | 3/17 | recoil, triggers | 47.86 | -10.0 ± 5.8 | -1.7 | -0.03 | -0.1935 | -2.8 | -5.57 |
| Anvilwhisker Otter | uncommon | 2 | 1/14 | triggers | 32.36 | +2.8 ± 5.3 | +0.5 | 0.01 | 0.0645 | -3.1 | -7.01 |
| Phoenix Fledgling | common | 2 | 2/10 | cure, flying, renewal | 30.8 | +1.6 ± 5.7 | +0.3 | 0.01 | 0.0645 | -3.6 | -7.45 |
| Magma Titan | common | 3 | 2/17 | immolation, scar | 37.49 | -6.0 ± 6.7 | -1.0 | -0.03 | -0.1935 | -3.8 | -6.65 |
| Sulfur Cinder Moth | common | 1 | 1/7 | flying, illuminate, triggers | 19.32 | +5.2 ± 6.8 | +0.9 | 0.04 | 0.2581 | -4.9 | -8.43 |
