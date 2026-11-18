#!/bin/bash
# 2026-11-18 (package REFIT5): runs plan-2026-11-18.txt chunks of lane A and lane B side by side (one core each), e.g.
#   bash docs/balance/refit5/chunks_2026_11_18.sh "A1 A2" "B1 B2 B3"
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit5
codes() { for k in $1; do grep "^$k:" $P/plan-2026-11-18.txt | cut -d: -f2; done; }
bash $P/lane_2026_11_18.sh $P/accA.jsonl $P/laneA.log $(codes "$1") &
bash $P/lane_2026_11_18.sh $P/accB.jsonl $P/laneB.log $(codes "$2")
wait
grep -h RESULT $P/laneA.log $P/laneB.log | cut -c1-220
