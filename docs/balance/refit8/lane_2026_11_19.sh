#!/bin/bash
# 2026-11-19 (package REFIT8): one search lane, as REFIT7's (docs/balance/refit7/lane_2026_11_19.sh), through the size-keeping wrapper
# search_2026_11_19.js; targets and start reads from REFIT7's final read (refit7-final-s9100.jsonl); fresh search seeds 191300 / 192300.
# Resumable: a fight with a line in <accepted.jsonl> is done.
#   bash docs/balance/refit8/lane_2026_11_19.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  node docs/balance/refit8/search_2026_11_19.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit7/refit7-final-s9100.jsonl --out docs/balance/refit8/search-2026-11-19.jsonl \
    --seed1 "${SEED1:-191300}" --seed2 "${SEED2:-192300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-4}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
