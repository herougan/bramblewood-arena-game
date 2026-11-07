# Skill canon measure (global-b15, 2026-11-07)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `bba2b93940fb`; 1000 paired fights a variant, slot of 6 copies, Level 5; carriers house-cat, bramblewood-lynx, armored-mastiff, squires-mount, rivergate-recruit, tusked-vanguard.

- One canon point = 0.0309 [0.0285, 0.0334] win rate (fraction; the median of the anchors' gain / price; least squares 0.03 [0.0279, 0.0321], R² 0.9929); one budget point of stats (3A + H) = 0.0322 [0.0285, 0.036]; κ = 1.0416 [0.9449, 1.1473]; +1 Attack = 4.3681 [3.4605, 5.8879] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain 1.0 win-rate points, 0.3105 [0.1313, 0.4675] stat points; every gain here is less it, once a key the variant adds.

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 6.8 | 2.1847 [1.9864, 2.3427] |  | 2.1009 [1.849, 2.3536] |
| armor 2 | 3.7 | 11.4 | 3.6953 [3.4801, 3.928] |  | 3.5524 [3.2276, 3.9083] |
| bleed 1 | 2.57 | 7.7 | 2.4995 [2.3232, 2.6771] |  | 2.4036 [2.1361, 2.7039] |
| bleed 2 | 4.73 | 14.6 | 4.7191 [4.5021, 4.9439] |  | 4.5382 [4.1098, 5.022] |
| fork | 3.89 | 13.3 | 4.3024 [3.9986, 4.6053] | outside | 4.1294 [3.7071, 4.6479] |
| inspiring 1 | 3 | 10.2 | 3.3023 [3.0874, 3.5898] | outside | 3.1695 [2.8904, 3.5637] |
| onReadyGold 1 | 6.65 | 17.4 | 5.6285 [5.1846, 6.0373] | outside | 5.4127 [4.8587, 6.1372] |
| poison 1 | 2.38 | 7.6 | 2.4478 [2.2685, 2.6072] |  | 2.3493 [2.1025, 2.6127] |
| poison 2 | 4.69 | 14.5 | 4.7068 [4.4724, 4.921] |  | 4.5175 [4.1415, 5.0297] |
| pounce 2 | 2.96 | 8.5 | 2.7443 [2.4256, 3.0234] |  | 2.6391 [2.3083, 3.01] |
| quick | 2.23 | 6.6 | 2.1335 [1.8575, 2.3771] |  | 2.0517 [1.7563, 2.3494] |
| rage | 3.01 | 9.7 | 3.1406 [2.929, 3.3449] |  | 3.0142 [2.7186, 3.345] |
| regen 2 | 2.9 | 9.3 | 2.995 [2.7945, 3.2097] |  | 2.8745 [2.59, 3.2107] |
| shell 2 | 0.57 | 2.6 | 0.8303 [0.6885, 0.997] | outside | 0.7969 [0.6514, 0.9833] |
| sweep 2 | 5.08 | 15.0 | 4.8348 [4.5413, 5.1243] |  | 4.6494 [4.2449, 5.1968] |
