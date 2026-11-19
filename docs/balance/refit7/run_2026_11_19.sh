#!/bin/bash
# 2026-11-19 (package REFIT7): a search pass, both lanes of a plan file side by side (one core each). Resumable.
#   bash docs/balance/refit7/run_2026_11_19.sh <plan.txt> <suffix: "" for pass 1, 2 for pass 2> [SEED1=.. SEED2=.. in the env]
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit7; PLAN=$1; S=$2
bash $P/lane_2026_11_19.sh $P/accA$S.jsonl $P/laneA$S.log $(grep '^A1:' "$PLAN" | cut -d: -f2) &
bash $P/lane_2026_11_19.sh $P/accB$S.jsonl $P/laneB$S.log $(grep '^B1:' "$PLAN" | cut -d: -f2)
wait
grep -h RESULT $P/laneA$S.log $P/laneB$S.log | wc -l
