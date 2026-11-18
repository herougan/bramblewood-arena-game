#!/bin/bash
# 2026-11-18 (package REFIT5): the second search pass over the fights still out of band after the first (plan2-2026-11-18.txt), from the
# decks applied in the first, on fresh search seeds (111300 / 112300); accepted decks in accA2 / accB2. Resumable; run it again to continue.
#   bash docs/balance/refit5/pass2_2026_11_18.sh <first> <count>    (the slice of each lane's fights to run)
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit5
slice() { grep "^$1:" $P/plan2-2026-11-18.txt | cut -d: -f2 | tr ' ' '\n' | grep . | tail -n +"$2" | head -n "$3"; }
SEED1=111300 SEED2=112300 bash $P/lane_2026_11_18.sh $P/accA2.jsonl $P/laneA2.log $(slice A1 "$1" "$2") &
SEED1=111300 SEED2=112300 bash $P/lane_2026_11_18.sh $P/accB2.jsonl $P/laneB2.log $(slice B1 "$1" "$2")
wait
grep -h RESULT $P/laneA2.log $P/laneB2.log | cut -c1-200
