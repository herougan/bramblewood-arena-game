#!/bin/bash
# 2026-11-17 (package REFIT3): moves a fetched verify read (docs/balance/skirmish-pass-refit3-<tag>-s<K>.jsonl) into docs/balance/refit3/verify/.
#   bash tools/refit3/take_2026_11_17.sh <tag> <seed>...
cd "$(dirname "$0")/../.." || exit 1
T=$1; shift
for K in "$@"; do mv "docs/balance/skirmish-pass-refit3-$T-s$K.jsonl" "docs/balance/refit3/verify/$T-s$K.jsonl" && rm -f "docs/balance/skirmish-pass-refit3-$T-s$K-summary.md"; done
