# Skill canon measure (global-b15, 2026-11-06)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `2fe8b0dc9e62`; 1000 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0308 [0.0281, 0.0331] win rate (fraction; the median of the anchors' gain / price; least squares 0.0292 [0.0272, 0.0312], R² 0.9834); one budget point of stats (3A + H) = 0.0325 [0.0289, 0.0361]; κ = 1.056 [0.9682, 1.1538]; +1 Attack = 5.2863 [4.0888, 7.2398] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain 0.2 win-rate points, 0.0616 [-0.1389, 0.2644] stat points; every gain here is less it, once a key the variant adds.
- **Test** `{"bloomCopy":{"when":["kill"],"mode":"and"}}`: worth **1.9805 [1.6506, 2.2997]** canon points by the median rate, 2.2322 [1.8021, 2.3555] by the ruler (1.8756 [1.5441, 2.2282] by the stat yardstick); price on its carriers 15.295; over-priced; between shell 2 (0.57) and quick (2.23).

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 6.9 | 2.2161 [2.0274, 2.4157] |  | 2.109 [1.871, 2.3647] |
| armor 2 | 3.7 | 10.8 | 3.5074 [3.2944, 3.7162] |  | 3.338 [3.0451, 3.662] |
| bleed 1 | 2.57 | 8.0 | 2.5962 [2.4213, 2.8148] |  | 2.458 [2.2214, 2.717] |
| bleed 2 | 4.73 | 15.5 | 5.0352 [4.8511, 5.4009] | outside | 4.7672 [4.3937, 5.2741] |
| fork | 3.89 | 10.0 | 3.2459 [2.954, 3.5605] | outside | 3.0892 [2.7314, 3.5141] |
| inspiring 1 | 5.43 | 17.1 | 5.561 [5.2766, 6.0533] |  | 5.2649 [4.7818, 5.8804] |
| onReadyGold 1 | 6.65 | 15.1 | 4.8769 [4.5477, 5.3322] | outside | 4.6414 [4.1466, 5.3015] |
| poison 1 | 2.38 | 7.3 | 2.367 [2.2089, 2.5782] |  | 2.2527 [2.0302, 2.5241] |
| poison 2 | 4.69 | 15.3 | 4.9783 [4.8298, 5.3205] | outside | 4.7133 [4.3002, 5.2404] |
| pounce 2 | 2.96 | 10.2 | 3.3198 [3.1102, 3.6413] | outside | 3.143 [2.8171, 3.539] |
| quick | 2.23 | 6.1 | 1.9653 [1.7612, 2.1607] | outside | 1.8704 [1.6343, 2.1328] |
| rage | 3.01 | 8.4 | 2.7121 [2.5409, 2.9268] | outside | 2.5811 [2.2997, 2.8854] |
| regen 2 | 2.9 | 9.1 | 2.9566 [2.7729, 3.1963] |  | 2.7992 [2.5331, 3.1096] |
| shell 2 | 0.57 | 2.0 | 0.645 [0.505, 0.7978] |  | 0.6106 [0.4732, 0.7603] |
| sweep 2 | 5.08 | 15.6 | 5.0562 [4.7958, 5.4937] |  | 4.8108 [4.3199, 5.3413] |
