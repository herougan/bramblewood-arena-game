# Lumber makers by their lists' mean cost (BAL12, 2026-11-02)

`tools/bal12/lumber_home_2026_11_02.js`; game `64700feee054`; 300 paired fights a variant; both brambles 15; carriers house-cat, constrictor-coil, rivergate-recruit (6 copies). Worth in 3A + H stat points, less the placebo, 95% bootstrap.

| Context | Pool | Mean Lumber cost | Level | onReadyGold=1 | T:onReady>gain 3 |
|---|---|---|---|---|---|
| global-b15 | 768 | 0.8581 | 1 | 6.1244 [4.8439, 8.4776] | 6.2392 [4.9828, 8.538] |
| map02-mb-bpro-b15 | 17 | 0.3529 | 0 | 2.209 [1.4641, 3.1765] | 2.5672 [1.791, 3.6748] |
| map07-mz-bpro-b15 | 23 | 0.6087 | 0 | 6.4 [4.597, 9.4035] | 6 [4.2899, 8.7895] |
| map10-m7-bpro-b15 | 15 | 1.3333 | 0 | 6.5 [4.8706, 9.9592] | 7.6176 [5.617, 11.4737] |
| map10-mj-bpro-b15 | 22 | 1.2273 | 3 | 6.1883 [4.5598, 8.6933] | 6.4753 [4.6928, 9.2422] |

Fit (ratio to global against the mean-cost difference, weighted by 1/se²): mult = 1 + 1.0273 (se 0.1184) x (mean cost - 0.8581).
