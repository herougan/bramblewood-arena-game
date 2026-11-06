# Skill canon measure (global-b15, 2026-11-06)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `21a6f19686ad`; 200 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0267 [0.0229, 0.0334] win rate (fraction; the median of the anchors' gain / price; least squares 0.0284 [0.0242, 0.0329], R² 0.9768); one budget point of stats (3A + H) = 0.0286 [0.0217, 0.0368]; κ = 1.0722 [0.7582, 1.3075]; +1 Attack = 5.3953 [3.1404, 16] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain -0.8 win-rate points, -0.2618 [-1.0286, 0.2721] stat points; every gain here is less it, once a key the variant adds.
- **Test** `{"blitz":true}`: worth **1.544 [0.938, 1.9117]** canon points by the median rate, 1.7512 [1.4, 2.1778] by the ruler (1.44 [0.8743, 2.0971] by the stat yardstick); price on its carriers 2.5; over-priced; between shell 2 (0.57) and quick (2.23).

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 5.7 | 1.976 [1.5091, 2.4416] |  | 1.9782 [1.3913, 2.785] |
| armor 2 | 3.7 | 9.5 | 3.2982 [2.8188, 3.7485] |  | 3.3018 [2.5519, 4.5378] |
| bleed 1 | 2.57 | 8.7 | 3.3148 [2.7163, 3.6757] | outside | 3.0255 [2.3387, 3.9658] |
| bleed 2 | 4.73 | 15.0 | 5.7212 [4.7807, 6.2998] | outside | 5.2218 [4.1446, 6.8194] |
| fork | 3.89 | 9.6 | 3.3564 [2.6546, 4.0982] |  | 3.36 [2.3309, 4.555] |
| inspiring 1 | 2.71 | 10.9 | 4.1594 [3.3804, 4.6863] | outside | 3.7964 [2.8939, 5.0467] |
| onReadyGold 1 | 6.65 | 15.7 | 5.4777 [4.5797, 6.5207] | outside | 5.4836 [4.136, 7.311] |
| poison 1 | 2.38 | 7.3 | 2.7889 [2.1593, 3.2211] |  | 2.5455 [1.9512, 3.3303] |
| poison 2 | 4.69 | 14.8 | 5.6734 [4.8401, 6.2054] | outside | 5.1782 [4.1029, 6.7468] |
| pounce 2 | 2.96 | 10.3 | 3.9204 [3.0318, 4.4728] | outside | 3.5782 [2.6667, 4.7664] |
| quick | 2.23 | 5.4 | 1.8743 [1.2487, 2.3845] |  | 1.8764 [1.1541, 2.6514] |
| rage | 3.01 | 8.0 | 2.8612 [2.3643, 3.2431] |  | 2.8073 [2.1059, 3.8798] |
| regen 2 | 2.9 | 7.4 | 2.5863 [2.0989, 3.0629] |  | 2.5891 [1.9351, 3.6581] |
| shell 2 | 0.57 | 1.0 | 0.3632 [-0.0145, 0.6838] |  | 0.3636 [-0.0133, 0.7596] |
| sweep 2 | 5.08 | 15.8 | 6.0399 [5.037, 6.7068] |  | 5.5127 [4.3489, 7.2676] |
