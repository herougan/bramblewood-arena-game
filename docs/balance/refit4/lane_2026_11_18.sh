#!/bin/bash
# 2026-11-18 (package REFIT4): one search lane: REFIT1's legal-only search through docs/balance/refit4/search_2026_11_18.js (pre-fold held
# problems not counted), decks only (no Shield, no Health: the owner decides those), leaders kept. Targets and bands from the whole-road
# measure after CARDPOW2 (skirmish-pass-refit4-before-s9100.jsonl). The fights in order, each seeing the decks accepted before it (same file,
# --fx / --accept), so a map's fights stay jointly legal; a map's fights are always in one lane.
# A lane stopped part way picks up where it was (REDO=1 re-runs every fight).
#   bash docs/balance/refit4/lane_2026_11_18.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  [ -z "$REDO" ] && [ -f "$ACC" ] && grep -q "\"key\":\"$c\"" "$ACC" && continue  # resumable: a fight with a line in <accepted.jsonl> is done
  node docs/balance/refit4/search_2026_11_18.js --code "$c" --fx "$ACC" --accept "$ACC" \
    --bands docs/balance/skirmish-pass-refit4-before-s9100.jsonl --out docs/balance/refit4/search-2026-11-18.jsonl \
    --seed1 "${SEED1:-81300}" --seed2 "${SEED2:-82300}" ${FROMACC:+--from-accepted} ${NOSCORE:+--noscore} \
    --g1 "${G1:-24}" --g1max "${G1MAX:-50}" --g2 "${G2:-160}" --top "${TOP:-3}" --pred "${PRED:-6}" --rounds "${ROUNDS:-4}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
