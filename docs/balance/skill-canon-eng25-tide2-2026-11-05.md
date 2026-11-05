# Skill canon measure (global-b15, 2026-11-05)

`tools/skill_canon_2026_10_31.js 1.1.0 (2026-10-31, SKILL2)`; game fingerprint `7eca461ba900`; 1000 paired fights a variant, slot of 6 copies, Level 1; carriers house-cat, bramblewood-lynx, blessed-avatar, stable-colt, rivergate-recruit, lucky-hopper.

- One canon point = 0.0312 [0.0282, 0.0329] win rate (fraction; the median of the anchors' gain / price; least squares 0.0292 [0.0273, 0.0313], R² 0.9832); one budget point of stats (3A + H) = 0.0317 [0.028, 0.0354]; κ = 1.0167 [0.9247, 1.1523]; +1 Attack = 5.5085 [4.3717, 7.7544] Health measured.
- Placebo `{"skill2Placebo":true}` (a key the engine does not know; the CPU's cardValue counts keys): gain 0.4 win-rate points, 0.1287 [-0.1182, 0.3415] stat points; every gain here is less it, once a key the variant adds.
- **Test** `{"tide":2}`: worth **0.5928 [0.4523, 0.7728]** canon points by the median rate, 0.5502 [0.391, 0.8023] by the ruler (0.5831 [0.4243, 0.7735] by the stat yardstick); price on its carriers 1.5; over-priced; between shell 2 (0.57) and quick (2.23).

| Anchor | Canon price | Gain (win rate) | Worth from the other anchors (95%) | | Worth by the stat yardstick, 3A + H (95%) |
|---|---|---|---|---|---|
| armor 1 | 2.33 | 6.5 | 2.0648 [1.9198, 2.2644] | outside | 2.0381 [1.8294, 2.3326] |
| armor 2 | 3.7 | 10.7 | 3.4059 [3.263, 3.6736] | outside | 3.3618 [3.0117, 3.7829] |
| bleed 1 | 2.57 | 8.1 | 2.6389 [2.4924, 2.8764] |  | 2.566 [2.3099, 2.9083] |
| bleed 2 | 4.73 | 15.7 | 5.0753 [4.9156, 5.493] | outside | 4.935 [4.3998, 5.5429] |
| fork | 3.89 | 10.5 | 3.3526 [3.098, 3.6804] | outside | 3.3093 [2.907, 3.8458] |
| inspiring 1 | 5.43 | 17.1 | 5.5318 [5.3074, 6.0267] |  | 5.3789 [4.8467, 6.1106] |
| onReadyGold 1 | 6.65 | 14.9 | 4.7496 [4.4558, 5.167] | outside | 4.6881 [4.1273, 5.3729] |
| poison 1 | 2.38 | 7.3 | 2.3176 [2.1715, 2.5672] |  | 2.2876 [2.0376, 2.5737] |
| poison 2 | 4.69 | 15.1 | 4.8997 [4.734, 5.2724] | outside | 4.7643 [4.2376, 5.3717] |
| pounce 2 | 2.96 | 9.7 | 3.144 [2.8907, 3.5246] |  | 3.0571 [2.6831, 3.4986] |
| quick | 2.23 | 6.3 | 2.0275 [1.8255, 2.2759] |  | 2.0013 [1.7354, 2.3037] |
| rage | 3.01 | 8.4 | 2.6954 [2.5519, 2.9066] | outside | 2.6605 [2.3387, 3.0102] |
| regen 2 | 2.9 | 9.0 | 2.9228 [2.7551, 3.1735] |  | 2.8523 [2.5461, 3.2186] |
| shell 2 | 0.57 | 1.9 | 0.6212 [0.4907, 0.7627] |  | 0.6041 [0.4631, 0.7747] |
| sweep 2 | 5.08 | 16.1 | 5.2266 [4.9838, 5.6675] |  | 5.0821 [4.5031, 5.7605] |
