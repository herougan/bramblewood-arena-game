#!/bin/bash
# 2026-11-16 (package REFIT1): one search lane (as tools/legal1/lane_2026_11_15.sh): the fights in order, each seeing the decks accepted
# before it (same file, --fx / --accept), so a map's fights stay jointly legal. Levers: the Shield goes down only (BAL19-1 a) on every
# fight; a raise only where the owner allowed one (13-5, 13-6, 13-8, 14-8: EDGE2-1 / EDGE1-1); base Health only on 2-1 (EDGE2-1).
#   bash tools/refit1/lane_2026_11_16.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
ACC=$1; LOG=$2; shift 2
declare -A LEVERS=( [2-1]=shield,hp [13-5]=shield,shieldup [13-6]=shield,shieldup [13-8]=shield,shieldup [14-8]=shield,shieldup )
for c in "$@"; do
  node tools/refit1/search_2026_11_16.js --code "$c" --fx "$ACC" --accept "$ACC" --levers "${LEVERS[$c]:-shield}" \
    --seed1 "${SEED1:-31300}" --seed2 "${SEED2:-32300}" \
    --g1 "${G1:-30}" --g1max "${G1MAX:-70}" --g2 "${G2:-200}" --top "${TOP:-3}" --pred "${PRED:-8}" --rounds "${ROUNDS:-6}" ${EXTRA:-} >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
