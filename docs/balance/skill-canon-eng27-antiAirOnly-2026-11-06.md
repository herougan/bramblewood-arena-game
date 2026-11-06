# Skill canon measure (global-b15, 2026-11-06)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `f9c0bfd1a2bc`; 200 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0287 [0.0236, 0.0323] win rate (fraction; the median of the anchors' gain / price; least squares 0.0267 [0.0231, 0.0308], R² 0.9804); one budget point of stats (3A + H) = 0.0237 [0.0165, 0.0315]; κ = 0.8276 [0.582, 1.1449]; +1 Attack = 9.8571 [-100, 181] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain -1.3 win-rate points, -0.5263 [-1.5904, 0.2119] stat points; every gain here is less it, once a key the variant adds.
- **Test** `{"antiAirOnly":true}`: worth **-4.1527 [-5.6092, -3.0989]** canon points by the median rate, -3.0758 [-5.4883, -1.9425] by the ruler (-5.0175 [-7.3182, -3.4453] by the stat yardstick); price on its carriers -2; within its interval; between - and shell 2 (0.57).

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 7.1 | 2.4981 [2.0738, 3.0021] |  | 2.9825 [1.9868, 4.2778] |
| armor 2 | 3.7 | 10.7 | 3.7619 [3.369, 4.3914] |  | 4.4912 [3.2318, 6.6667] |
| bleed 1 | 2.57 | 7.4 | 2.5949 [2.2043, 3.0855] |  | 3.1053 [2.2568, 4.4337] |
| bleed 2 | 4.73 | 13.3 | 4.6067 [4.2214, 5.3685] |  | 5.5789 [4.0845, 8.0533] |
| fork | 3.89 | 8.9 | 3.0856 [2.4223, 3.9537] |  | 3.7368 [2.5278, 5.4133] |
| inspiring 1 | 2.71 | 10.3 | 3.6149 [3.206, 4.2679] | outside | 4.3158 [3.1053, 6.2651] |
| onReadyGold 1 | 6.65 | 15.0 | 5.2006 [4.5254, 6.205] | outside | 6.2982 [4.6115, 9.0811] |
| poison 1 | 2.38 | 6.1 | 2.1295 [1.7322, 2.6136] |  | 2.5789 [1.7538, 3.7975] |
| poison 2 | 4.69 | 12.3 | 4.2735 [3.8942, 4.8924] |  | 5.1754 [3.8282, 7.4054] |
| pounce 2 | 2.96 | 8.8 | 3.1006 [2.6158, 3.7925] |  | 3.7018 [2.6986, 5.5263] |
| quick | 2.23 | 4.6 | 1.608 [1.1046, 2.1629] | outside | 1.9474 [1.0972, 2.9885] |
| rage | 3.01 | 7.4 | 2.5641 [2.2031, 3.0123] |  | 3.1053 [2.1806, 4.6667] |
| regen 2 | 2.9 | 9.0 | 3.1741 [2.7771, 3.7439] |  | 3.7895 [2.5714, 5.6667] |
| shell 2 | 0.57 | 2.2 | 0.7788 [0.4883, 1.1688] |  | 0.9298 [0.5378, 1.5258] |
| sweep 2 | 5.08 | 15.0 | 5.3048 [4.8159, 6.1705] |  | 6.3333 [4.7347, 9.0811] |
