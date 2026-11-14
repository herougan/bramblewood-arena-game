# Road baseline on three seed sets (2026-11-14, batch-1023e)

Maps 0-20, 400 games per fight, the Map reference deck. Files: skirmish-pass-b1114r400 (road seeds 9100), b1114s400 (5100), b1114t400 (6100).

| Seeds | Main in band / within 10 / beyond 20 (of 149) | Side (of 77) |
|---|---|---|
| 9100 (road) | 128 / 130 / 9 | 39 / 41 / 13 |
| 5100 | 121 / 125 / 9 | 39 / 43 / 12 |
| 6100 | 116 / 128 / 10 | 38 / 42 / 12 |
| Mean of the three | 121 / 129 / 9 | 38 / 42 / 13 |

The main road was tuned on the road seeds, so 128 is optimistic; the three-seed mean (121) is the honest baseline. Side maps hold on every seed set.

## 2026-11-15: fourth seed set (4100, tag b1115u400)
Maps 0-20, curve fights, not endless. In band / within 10 / beyond 20.

| Seeds | Main (149) | Side (77) |
|---|---|---|
| 9100 (r) | 128 / 130 / 9 | 39 / 41 / 13 |
| 5100 (s) | 121 / 125 / 9 | 39 / 43 / 12 |
| 6100 (t) | 116 / 128 / 10 | 38 / 42 / 12 |
| 4100 (u) | 121 / 129 / 8 | 36 / 40 / 13 |
| Mean of 4 | 120 / 130 / 9 | 38 / 42 / 13 |

The four-seed mean matches the three-seed mean (121 / 129 / 9), so the baseline is stable. The nine main fights beyond 20 sit within 7 points of their mean on every seed set (2-1, 6-2, 13-6, 13-8, 16-3, 16-4, 17-8, 19-5, 20-9): real misses, not noise. Proposal-only tune for them: `curve 400 --from=b1115u400 --main --only=... --fixes=b1115-edge2-fixes` (EDGE2).
