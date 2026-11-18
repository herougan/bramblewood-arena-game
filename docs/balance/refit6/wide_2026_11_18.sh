#!/bin/bash
# 2026-11-18 (package REFIT6): REFIT5's wide search (docs/balance/refit5/wide_2026_11_18.js: random legal decks over the fight's whole pool,
# a per-copy fit, the predicted nearest read) on the REFIT6 fights the two search passes left 20+ off, one lane (one core). Targets from
# skirmish-pass-refit6-before-s9100.jsonl, fresh seeds 141300 / 142300; accepted decks in <accepted.jsonl>, the log in wide-2026-11-18.jsonl.
#   bash docs/balance/refit6/wide_2026_11_18.sh <accepted.jsonl> <log> CODE...
cd "$(dirname "$0")/../../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do
  node docs/balance/refit5/wide_2026_11_18.js --code "$c" --bands docs/balance/skirmish-pass-refit6-before-s9100.jsonl --fx "$ACC" --accept "$ACC" \
    --out docs/balance/refit6/wide-2026-11-18.jsonl --seed1 141300 --seed2 142300 >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
