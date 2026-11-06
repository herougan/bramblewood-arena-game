# Skill canon measure (global-b15, 2026-11-06)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `cfadf68a79b4`; 1000 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0307 [0.028, 0.0329] win rate (fraction; the median of the anchors' gain / price; least squares 0.0291 [0.0272, 0.0309], R² 0.9832); one budget point of stats (3A + H) = 0.0323 [0.0289, 0.0359]; κ = 1.0521 [0.953, 1.1595]; +1 Attack = 5.2967 [4.1342, 7.6829] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain 0.2 win-rate points, 0.062 [-0.1629, 0.2577] stat points; every gain here is less it, once a key the variant adds.
- **Test** `{"bloomCopy":{"when":["day"],"mode":"and"}}`: worth **7.6209 [7.25, 8.1875]** canon points by the median rate, 7.4813 [7.1867, 8.5052] by the ruler (7.2434 [6.556, 8.0449] by the stat yardstick); price on its carriers 25.7133; over-priced; between onReadyGold 1 (6.65) and -.

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 6.9 | 2.2285 [2.0561, 2.4172] |  | 2.1227 [1.8826, 2.4292] |
| armor 2 | 3.7 | 10.8 | 3.5108 [3.3032, 3.7034] |  | 3.3441 [3.0082, 3.726] |
| bleed 1 | 2.57 | 7.9 | 2.5844 [2.4249, 2.7944] |  | 2.4532 [2.2167, 2.7167] |
| bleed 2 | 4.73 | 15.5 | 5.049 [4.8851, 5.4359] | outside | 4.7928 [4.3362, 5.2937] |
| fork | 3.89 | 10.0 | 3.2533 [2.9699, 3.5643] | outside | 3.0988 [2.7204, 3.5223] |
| inspiring 1 | 5.43 | 17.1 | 5.5768 [5.317, 6.0076] |  | 5.2937 [4.7905, 5.8757] |
| onReadyGold 1 | 6.65 | 15.0 | 4.8826 [4.4586, 5.3255] | outside | 4.6507 [4.0757, 5.2516] |
| poison 1 | 2.38 | 7.3 | 2.3779 [2.2118, 2.6038] |  | 2.2621 [2.0266, 2.5204] |
| poison 2 | 4.69 | 15.3 | 5.0028 [4.802, 5.3835] | outside | 4.7489 [4.3054, 5.2939] |
| pounce 2 | 2.96 | 10.1 | 3.3053 [3.0593, 3.6247] | outside | 3.1375 [2.7832, 3.523] |
| quick | 2.23 | 6.0 | 1.9601 [1.7185, 2.1676] | outside | 1.867 [1.6193, 2.1606] |
| rage | 3.01 | 8.3 | 2.7165 [2.5394, 2.9012] | outside | 2.5875 [2.2661, 2.9004] |
| regen 2 | 2.9 | 9.1 | 2.957 [2.7774, 3.1642] |  | 2.807 [2.5151, 3.1618] |
| shell 2 | 0.57 | 2.0 | 0.6474 [0.5229, 0.7919] |  | 0.6146 [0.4881, 0.7599] |
| sweep 2 | 5.08 | 15.5 | 5.0561 [4.8052, 5.4546] |  | 4.816 [4.299, 5.3566] |
