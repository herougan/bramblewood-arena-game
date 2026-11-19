#!/bin/bash
# 2026-11-19 (package REFIT7): REFIT5's wide search (docs/balance/refit5/wide_2026_11_18.js: random legal decks over the fight's whole pool,
# a per-copy fit, the predicted nearest read) on the REFIT7 fights the search passes left far off, one lane (one core). Targets from
# skirmish-pass-refit7-before-s9100.jsonl, fresh seeds 171300 / 172300; accepted decks in <accepted.jsonl>, the log in wide-2026-11-19.jsonl.
#   bash docs/balance/refit7/wide_2026_11_19.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  node docs/balance/refit5/wide_2026_11_18.js --code "$c" --bands docs/balance/skirmish-pass-refit7-before-s9100.jsonl --fx "$ACC" --accept "$ACC" \
    --out docs/balance/refit7/wide-2026-11-19.jsonl --seed1 171300 --seed2 172300 >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
