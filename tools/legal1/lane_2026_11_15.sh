#!/bin/bash
# 2026-11-15 (package BAL-LEGAL1): one search lane: the fights in order, each seeing the decks the lane (and the other lane) accepted before it
# (same file, --fx / --accept), so fights of one map stay jointly legal. A fight whose owner decision allowed a lever gets it (LEVERS below).
#   bash tools/legal1/lane_2026_11_15.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
ACC=$1; LOG=$2; shift 2
declare -A LEVERS=( [2-1]=hp [13-5]=shield [13-6]=shield [13-8]=shield [14-8]=shield )
for c in "$@"; do
  node tools/legal1/search_2026_11_15.js --code "$c" --fx "$ACC" --accept "$ACC" --levers "${LEVERS[$c]:-}" \
    --g1 "${G1:-50}" --g2 "${G2:-240}" --top "${TOP:-4}" --pred "${PRED:-12}" --rounds "${ROUNDS:-5}" ${EXTRA:-} --out "${OUT:-docs/balance/legal1/search-2026-11-15.jsonl}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
