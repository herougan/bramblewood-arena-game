#!/bin/bash
# 2026-11-20 (package REFIT15): REFIT14's search lane (docs/balance/refit14/lane_2026_11_20.sh) for REFIT15's Maps 0-9 fights, through REFIT8's
# size-keeping swap search (leaders, first-clear cards, size kept, map pool only); bands from refit14/skirmish-pass-refit14-road-s9100.jsonl
# (seed 9100, 400 games); search seeds 401300 / 402300 (the fresh check uses 141100 / 142100). Lanes share one accepted file; a map's fights
# stay in one lane (the map lines read the other fights' decks).
#   bash docs/balance/refit15/lane_2026_11_20.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  echo "START $c $(date +%H:%M:%S)" >> "$LOG"
  nice -n 5 node docs/balance/refit8/search_2026_11_19.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit14/skirmish-pass-refit14-road-s9100.jsonl --out docs/balance/refit15/search-2026-11-20.jsonl \
    --seed1 "${SEED1:-401300}" --seed2 "${SEED2:-402300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-6}" >> "$LOG" 2>&1
done
echo "LANE DONE $(date +%H:%M:%S)" >> "$LOG"
