#!/bin/bash
# 2026-11-19 (package REFIT7): one search lane, as REFIT6's (docs/balance/refit6/lane_2026_11_18.sh: REFIT1's legal-only search through
# docs/balance/refit4/search_2026_11_18.js, the pre-FOLD6 held problems not counted, decks only, leaders kept), with REFIT7's targets
# (skirmish-pass-refit7-before-s9100.jsonl: GitHub run 44357199306 of batch-1023e 9f281ea1, after LVL10 / FOLD7 / ENG52), its own seeds and log.
# Resumable: a fight with a line in <accepted.jsonl> is done (REDO=1 re-runs).
#   bash docs/balance/refit7/lane_2026_11_19.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -z "$REDO" ] && [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue
  node docs/balance/refit4/search_2026_11_18.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/skirmish-pass-refit7-before-s9100.jsonl --out docs/balance/refit7/search-2026-11-19.jsonl \
    --seed1 "${SEED1:-161300}" --seed2 "${SEED2:-162300}" ${FROMACC:+--from-accepted} ${NOSCORE:+--noscore} \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-4}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
