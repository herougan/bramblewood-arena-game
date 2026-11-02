# BAL10 tournament, Maps 0-20 (2026-11-02)

Mean win rate (%) of the reference decks: against every road fight of the main map (tools/pipeline/run.sh tournament --games 24, tests/out/pipeline-tournament/bal10/ref5-road.jsonl, summary docs/balance/pipeline/tournament-2026-11-02-1235.json) and against every PRO / BPRO deck of the map and its side maps (tools/opt/pro_ease.js --maps 0-20 --ref map,prog --games 24, docs/balance/pro-ease-bal10.json). Ref Random = the mean of prog-1..5. 24 games a pairing (about +/-18 points a pairing at 95%; map means are steadier).

| Map | Road: Map ref | Road: Ref Random | vs PRO: Map ref | vs PRO: Ref Random | vs BPRO: Map ref | vs BPRO: Ref Random |
|---|---|---|---|---|---|---|
| 0 | 60 | 87 | 49 | 55 | 77 | 78 |
| 1 | 90 | 85 | 42 | 35 | 52 | 37 |
| 2 | 85 | 73 | 63 | 57 | 51 | 51 |
| 3 | 79 | 66 | 58 | 46 | 74 | 54 |
| 4 | 48 | 32 | 53 | 29 | 19 | 15 |
| 5 | 72 | 66 | 48 | 40 | 43 | 40 |
| 6 | 69 | 65 | 43 | 27 | 24 | 23 |
| 7 | 59 | 54 | 20 | 24 | 21 | 19 |
| 8 | 39 | 54 | 44 | 33 | 23 | 16 |
| 9 | 52 | 66 | 32 | 38 | 33 | 48 |
| 10 | 61 | 57 | 19 | 11 | 20 | 12 |
| 11 | 64 | 46 | 38 | 23 | 24 | 9 |
| 12 | 73 | 64 | 42 | 32 | 74 | 58 |
| 13 | 66 | 40 | 39 | 17 | 52 | 32 |
| 14 | 46 | 34 | 6 | 7 | 5 | 6 |
| 15 | 69 | 49 | 63 | 46 | 47 | 37 |
| 16 | 64 | 51 | 51 | 25 | 57 | 35 |
| 17 | 30 | 24 | 12 | 4 | 17 | 5 |
| 18 | 73 | 64 | 27 | 19 | 20 | 15 |
| 19 | 72 | 62 | 35 | 21 | 25 | 14 |
| 20 | 80 | 58 | 65 | 44 | 63 | 47 |
