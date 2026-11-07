# Skill canon measure (global-b15, 2026-11-06)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `af35e0450b9a`; 1000 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0306 [0.028, 0.0327] win rate (fraction; the median of the anchors' gain / price; least squares 0.0288 [0.0268, 0.0307], R² 0.9889); one budget point of stats (3A + H) = 0.0314 [0.028, 0.0351]; κ = 1.0253 [0.9294, 1.1699]; +1 Attack = 6.5628 [4.7986, 9.7313] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain 0.0 win-rate points, 0.0027 [-0.2634, 0.263] stat points; every gain here is less it, once a key the variant adds.

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 7.0 | 2.294 [2.1479, 2.5097] |  | 2.2432 [1.9619, 2.5335] |
| armor 2 | 3.7 | 11.6 | 3.8207 [3.6624, 4.0313] |  | 3.7023 [3.3015, 4.1198] |
| bleed 1 | 2.57 | 7.9 | 2.6002 [2.4271, 2.7889] |  | 2.5196 [2.2439, 2.8394] |
| bleed 2 | 4.73 | 14.8 | 4.8767 [4.6886, 5.2069] |  | 4.7256 [4.2427, 5.2571] |
| fork | 3.89 | 9.7 | 3.1747 [2.9214, 3.4823] | outside | 3.1043 [2.6844, 3.5556] |
| inspiring 1 | 3.8 | 11.2 | 3.6367 [3.4697, 3.9137] |  | 3.5561 [3.1479, 3.9581] |
| onReadyGold 1 | 6.65 | 16.0 | 5.2241 [4.8805, 5.6273] | outside | 5.1083 [4.5399, 5.7539] |
| poison 1 | 2.38 | 7.0 | 2.294 [2.1327, 2.5243] |  | 2.2432 [1.9505, 2.5442] |
| poison 2 | 4.69 | 14.3 | 4.708 [4.5246, 5.0019] |  | 4.5741 [4.0859, 5.0963] |
| pounce 2 | 2.96 | 9.7 | 3.1816 [2.9553, 3.4848] |  | 3.0831 [2.7171, 3.4774] |
| quick | 2.23 | 6.0 | 1.9597 [1.7512, 2.2234] | outside | 1.9163 [1.6647, 2.233] |
| rage | 3.01 | 8.4 | 2.7371 [2.5509, 2.9494] | outside | 2.6764 [2.3541, 2.9926] |
| regen 2 | 2.9 | 8.9 | 2.9403 [2.7494, 3.1634] |  | 2.8492 [2.4897, 3.2179] |
| shell 2 | 0.57 | 2.4 | 0.8036 [0.6618, 0.9651] | outside | 0.7787 [0.6239, 0.9523] |
| sweep 2 | 5.08 | 15.7 | 5.1811 [4.9491, 5.5155] |  | 5.0206 [4.4766, 5.5862] |
