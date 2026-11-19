#!/bin/bash
# 2026-11-19 (package REFIT9): one search lane, REFIT8's (docs/balance/refit8/lane_2026_11_19.sh) through REFIT8's size-keeping wrapper
# (refit8/search_2026_11_19.js, swaps only); targets and start reads from REFIT8's final read (refit8/skirmish-pass-refit8-final-s9100.jsonl);
# fresh search seeds 241300 / 242300. Resumable: a fight with a line in <accepted.jsonl> is done.
#   bash docs/balance/refit9/lane_2026_11_19.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  echo "START $c $(date +%H:%M:%S)" >> "$LOG"
  node docs/balance/refit8/search_2026_11_19.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit8/skirmish-pass-refit8-final-s9100.jsonl --out docs/balance/refit9/search-2026-11-19.jsonl \
    --seed1 "${SEED1:-241300}" --seed2 "${SEED2:-242300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-4}" >> "$LOG" 2>&1
done
echo "LANE DONE $(date +%H:%M:%S)" >> "$LOG"
