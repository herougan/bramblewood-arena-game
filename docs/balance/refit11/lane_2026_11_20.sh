#!/bin/bash
# 2026-11-20 (package REFIT11): REFIT10's search lane (docs/balance/refit10/lane_2026_11_20.sh) for the FOCUS2 carrier fights, through REFIT8's
# size-keeping swap search (docs/balance/refit8/search_2026_11_19.js: leaders, first-clear cards, size kept, map pool only); targets from
# this package's local road measure (seed 9100, 400 games: refit11/skirmish-pass-refit11-before-s9100.jsonl); fresh search seeds 281300 / 282300.
# Both lanes share one accepted file, so a lane's later fight reads the other lane's accepted decks (the map lines).
#   bash docs/balance/refit11/lane_2026_11_20.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  echo "START $c $(date +%H:%M:%S)" >> "$LOG"
  node docs/balance/refit8/search_2026_11_19.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/refit11/skirmish-pass-refit11-before-s9100.jsonl --out docs/balance/refit11/search-2026-11-20.jsonl \
    --seed1 "${SEED1:-281300}" --seed2 "${SEED2:-282300}" \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-6}" >> "$LOG" 2>&1
done
echo "LANE DONE $(date +%H:%M:%S)" >> "$LOG"
