# Card power re-rate, 2026-11-28

Run: `node tools/card_balance.js 400 --v3 --resume` on batch-1023e after ROADFIX7 / CARDFIX1 / RESBENCH2 (402 cards, 400 games each, 4308 s).
Tool verdict: 160 too strong, 78 too weak, 157 in band. Output: `docs/balance/bal25/card-power.json` (previous run: 2026-11-16).
Scale: `power` vs the budget's `expected` (the tool's own fields). Only cards whose `map` field is 20 or less are listed (387).
One card at 400 games carries about ±2.5 win points of noise; read single cards as leads, not verdicts.

## Most over the formula
| Card | Map | Power | Expected | Over |
|---|---|---|---|---|
| Shellwright Apprentice | 5 | 95.6 | 36.5 | +59.1 |
| Newt Doctor | 7 | 86.7 | 37.3 | +49.4 |
| Honeyjoe Brewer | 5 | 80.9 | 35.3 | +45.6 |
| Tide Seahorse | 9 | 82.3 | 38.0 | +44.3 |
| The Grey Heron | 6 | 83.3 | 41.3 | +42.0 |
| Bee Drone | 0 | 75.2 | 34.7 | +40.5 |
| Marine Iguana | 20 | 80.7 | 41.3 | +39.4 |
| Alpine Marmot | 7 | 75.5 | 36.7 | +38.8 |
| Monarch Wingblade | 7 | 77.6 | 39.3 | +38.3 |
| Hedgehog Matron | 13 | 76.6 | 40.0 | +36.6 |

## Most under the formula
| Card | Map | Power | Expected | Under |
|---|---|---|---|---|
| Irradiated Glow Wyrm | 13 | 4.8 | 42.0 | -37.2 |
| Elder Willow | 0 | 15.7 | 51.0 | -35.3 |
| Gaur | 14 | 15.6 | 48.8 | -33.2 |
| Riverworks Bastion | 6 | 18.2 | 49.7 | -31.5 |
| Lava Waders | 11 | 7.5 | 37.9 | -30.4 |
| Bee Warden | 0 | 4.7 | 34.2 | -29.5 |
| Bark Buckler | 11 | 6.3 | 35.7 | -29.4 |
| Sparrow Chick | 11 | 6.0 | 34.8 | -28.8 |
| Ancient Sloth Titan | 14 | 26.9 | 55.7 | -28.8 |
| Garden Snail | 0 | 5.3 | 33.6 | -28.3 |

## Biggest moves since 2026-11-16 (249 cards moved by more than 3)
Shellwright Apprentice 42.6 → 95.6; Grindstone Boar 1.4 → 46.2; Wolf Spider Mother 61.0 → 18.2; Puddle Skimmer 20.9 → 63.6; Ash Moth 31.0 → 70.5; Bee Drone 37.5 → 75.2; Harbor Seal 21.7 → 57.8; Quillguard 38.3 → 74.2; Fawn Scout 44.1 → 11.0; Obsidian Scorpion 73.0 → 40.5; Stoat Cutthroat 84.7 → 53.0; Sleepless Shrew 19.0 → 50.5.
Twelve days of rule and card changes sit between the runs (SKILLS3-B, CARDFIX1, the ROADFIX packages), so large moves are expected.

## Use
Card stats are the owner's call. These are candidates for the next card-design pass (dull / over / under cards), not edits.
