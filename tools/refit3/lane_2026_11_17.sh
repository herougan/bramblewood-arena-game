#!/bin/bash
# 2026-11-17 (package REFIT3): one lane of the wide search (tools/refit3/wide_2026_11_17.js), the fights in order, each with the decks accepted
# before it in the same lane file (--fx / --accept: a map's fights stay jointly legal). The second stage is tools/refit3/polish_2026_11_17.sh.
#   bash tools/refit3/lane_2026_11_17.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  node tools/refit3/wide_2026_11_17.js --code "$c" --fx "$ACC" --accept "$ACC" --n "${N:-240}" --gs "${GS:-16}" --gp "${GP:-60}" --g2 "${G2:-300}" \
    --seed1 "${SEED1:-63300}" --seed2 "${SEED2:-64300}" ${EXTRA:-} >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
