# Skill canon measure (global-b15, 2026-11-02)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `64700feee054`; 1000 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, constrictor-coil, badger-berserker, rivergate-recruit, lucky-hopper.

- One canon point = 0.0314 [0.0283, 0.0333] win rate (fraction; the median of the anchors' gain / price; least squares 0.03 [0.0281, 0.0321], R² 0.9776); one budget point of stats (3A + H) = 0.03 [0.0268, 0.0334]; κ = 0.9556 [0.8815, 1.0644]; +1 Attack = 5.3348 [4.1821, 7.7516] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain -0.0 win-rate points, -0.0083 [-0.2276, 0.1857] stat points; every gain here is less it, once a key the variant adds.

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.65 | 7.0 | 2.2174 [2.0304, 2.4687] | outside | 2.3255 [2.0404, 2.6527] |
| armor 2 | 4.23 | 11.1 | 3.5224 [3.3267, 3.8352] | outside | 3.694 [3.2997, 4.0775] |
| bleed 1 | 2.47 | 7.7 | 2.4535 [2.339, 2.708] |  | 2.573 [2.3019, 2.9058] |
| bleed 2 | 4.51 | 14.2 | 4.5397 [4.3882, 4.9309] |  | 4.7399 [4.2768, 5.2444] |
| fork | 4.92 | 11.7 | 3.7133 [3.4562, 4.1109] | outside | 3.8943 [3.4016, 4.4096] |
| inspiring 1 | 3.13 | 9.9 | 3.165 [3.0076, 3.4747] |  | 3.3046 [2.9602, 3.6994] |
| onReadyGold 1 | 5.21 | 19.9 | 6.3647 [6.0591, 7.0248] | outside | 6.6453 [5.9469, 7.4843] |
| poison 1 | 2.27 | 7.1 | 2.2703 [2.1476, 2.525] |  | 2.3755 [2.1271, 2.6533] |
| poison 2 | 4.35 | 14.0 | 4.4864 [4.3841, 4.8683] | outside | 4.6843 [4.257, 5.1976] |
| pounce 2 | 2.67 | 8.9 | 2.8373 [2.6398, 3.1966] |  | 2.9624 [2.6014, 3.3732] |
| quick | 2.02 | 6.7 | 2.1367 [1.9495, 2.4552] |  | 2.2309 [1.9402, 2.5637] |
| rage | 3.5 | 9.0 | 2.8699 [2.7213, 3.1135] | outside | 3.0097 [2.7042, 3.3646] |
| regen 2 | 3.45 | 8.7 | 2.7717 [2.5754, 3.0278] | outside | 2.9068 [2.6046, 3.2606] |
| shell 2 | 2.72 | 6.8 | 2.1564 [1.9441, 2.4182] | outside | 2.2615 [1.9364, 2.587] |
| sweep 2 | 4.82 | 15.2 | 4.8648 [4.6117, 5.3401] |  | 5.0793 [4.5949, 5.6702] |
