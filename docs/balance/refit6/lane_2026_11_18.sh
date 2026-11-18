#!/bin/bash
# 2026-11-18 (package REFIT6): one search lane, as REFIT4's (docs/balance/refit4/lane_2026_11_18.sh: REFIT1's legal-only search through
# docs/balance/refit4/search_2026_11_18.js, the pre-FOLD6 held problems not counted, decks only, leaders kept), with REFIT6's targets
# (skirmish-pass-refit6-before-s9100.jsonl: REFIT5's seed 9100 road read with the fights that play the Maps 3, 9, 13-16 and 18-20
# reference decks re-read after REFIT6 rebuilt them), its own seeds and log. Resumable: a fight with a line in <accepted.jsonl> is done (REDO=1 re-runs).
#   bash docs/balance/refit6/lane_2026_11_18.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -z "$REDO" ] && [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  node docs/balance/refit4/search_2026_11_18.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/skirmish-pass-refit6-before-s9100.jsonl --out docs/balance/refit6/search-2026-11-18.jsonl \
    --seed1 "${SEED1:-121300}" --seed2 "${SEED2:-122300}" ${FROMACC:+--from-accepted} ${NOSCORE:+--noscore} \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-4}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
