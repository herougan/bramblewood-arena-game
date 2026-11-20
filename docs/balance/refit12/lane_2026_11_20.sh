#!/bin/bash
# 2026-11-20 (package REFIT12): REFIT11's search lane (docs/balance/refit11/lane_2026_11_20.sh) for the worst main-road fights of GitHub run
# 44644602489 (seed 9100, 400 games; rows in refit12/skirmish-pass-refit12-before-s9100.jsonl), through REFIT8's size-keeping swap search
# (leaders, first-clear cards, size kept, map pool only); fresh search seeds 301300 / 302300. Lanes share one accepted file.
#   bash docs/balance/refit12/lane_2026_11_20.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  echo "START $c $(date +%H:%M:%S)" >> "$LOG"
  node docs/balance/refit8/search_2026_11_19.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit12/skirmish-pass-refit12-before-s9100.jsonl --out docs/balance/refit12/search-2026-11-20.jsonl \
    --seed1 "${SEED1:-301300}" --seed2 "${SEED2:-302300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-6}" >> "$LOG" 2>&1
done
echo "LANE DONE $(date +%H:%M:%S)" >> "$LOG"
