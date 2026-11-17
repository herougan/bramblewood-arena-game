#!/bin/bash
# 2026-11-17 (package REFIT3): a lane of the exhaustive search (tools/refit3/exhaust_2026_11_17.js), fights in order, accepted decks in <acc.jsonl>.
#   bash tools/refit3/exlane_2026_11_17.sh <acc.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
ACC=$1; LOG=$2; shift 2
for c in "$@"; do node tools/refit3/exhaust_2026_11_17.js --code "$c" --fx "$ACC" --accept "$ACC" ${EXTRA:-} >> "$LOG" 2>&1; done
echo "LANE DONE" >> "$LOG"
