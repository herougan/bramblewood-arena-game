#!/bin/bash
# 2026-11-20 (package REFIT10): one search lane, REFIT9's (docs/balance/refit9/lane_2026_11_19.sh) through refit10/search_2026_11_20.js
# (REFIT8's size-keeping swap search, m9 read in, Malachite Golem kept); targets and start reads from release 5's road measure
# (run 44597653420, seed 9100, 400 games: refit10/skirmish-pass-rel5.jsonl); fresh search seeds 271300 / 272300; 6 rounds (gaps up to 38).
# Both lanes share one accepted file, so a lane's later fight reads the other lane's accepted decks (one map: the usage line).
#   bash docs/balance/refit10/lane_2026_11_20.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  echo "START $c $(date +%H:%M:%S)" >> "$LOG"
  node docs/balance/refit10/search_2026_11_20.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit10/skirmish-pass-rel5.jsonl --out docs/balance/refit10/search-2026-11-20.jsonl \
    --seed1 "${SEED1:-271300}" --seed2 "${SEED2:-272300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-6}" >> "$LOG" 2>&1
done
echo "LANE DONE $(date +%H:%M:%S)" >> "$LOG"
