#!/bin/bash
# 2026-11-17 (package REFIT2): one search lane of REFIT1's legal-only search (tools/refit1/search_2026_11_16.js, unchanged) for the road after
# SKN1 / ARROW1 / ECONSK1 / CARDPOW1: targets and bands from the GitHub measure docs/balance/skirmish-pass-night2-s7600.jsonl, log in
# docs/balance/refit2/. The fights in order, each seeing the decks accepted before it (same file, --fx / --accept), so a map's fights stay
# jointly legal (problemsFull, SIDE2's holds). Levers as REFIT1: the Shield down only (BAL19-1 a); base Health only on 2-1 (EDGE2-1).
# FROMACC=1 starts a fight from its line in <accepted.jsonl> (a REFIT1 apply:false deck, or a first pass).
#   bash tools/refit2/lane_2026_11_17.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
ACC=$1; LOG=$2; shift 2
declare -A LEVERS=( [2-1]=shield,hp )
for c in "$@"; do
  node tools/refit1/search_2026_11_16.js --code "$c" --fx "$ACC" --accept "$ACC" --levers "${LEVERS[$c]:-shield}" \
    --bands docs/balance/skirmish-pass-night2-s7600.jsonl --out docs/balance/refit2/search-2026-11-17.jsonl \
    --seed1 "${SEED1:-53300}" --seed2 "${SEED2:-54300}" ${FROMACC:+--from-accepted} \
    --g1 "${G1:-30}" --g1max "${G1MAX:-70}" --g2 "${G2:-200}" --top "${TOP:-3}" --pred "${PRED:-8}" --rounds "${ROUNDS:-6}" ${EXTRA:-} >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
