#!/bin/bash
# 2026-11-18 (package REFIT6): skirmish_pass measure of a list of fights in two shards side by side (one core each).
#   bash docs/balance/refit6/measure2_2026_11_18.sh <tag> <codes-file> [games=400] [--seed=K]
cd "$(dirname "$0")/../../.." || exit 1
TAG=$1; C=$(cat "$2"); G=${3:-400}; S=$4
node tools/skirmish_pass.js measure "$G" 0 2 --tag="$TAG" --maxmap=20 --only="$C" $S > "docs/balance/refit6/$TAG-0.log" 2>&1 &
node tools/skirmish_pass.js measure "$G" 1 2 --tag="$TAG" --maxmap=20 --only="$C" $S > "docs/balance/refit6/$TAG-1.log" 2>&1
wait
wc -l "docs/balance/skirmish-pass-$TAG.jsonl"
