#!/bin/bash
# 2026-11-19 (package REFIT8): a second neighbour pass from the decks pass 1 applied (--from-accepted; accA2 / accB2 start with those
# lines, taken from refit8-fixes.jsonl), on the four applied fights still 20+ off: lane A 17-8 17-6, lane B 2-2 4-5. Search seeds 201300 / 202300.
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit8
jq -c 'select(.apply) | {key, deck}' $P/refit8-fixes.jsonl > $P/accA2.jsonl; cp $P/accA2.jsonl $P/accB2.jsonl
S() { node $P/search_2026_11_19.js --code "$1" --fx "$2" --accept "$2" --from-accepted --bands docs/balance/refit7/refit7-final-s9100.jsonl \
  --out $P/search-2026-11-19.jsonl --seed1 201300 --seed2 202300 --g1 24 --g1max 50 --g2 160 --top 3 --pred 6 --rounds 4 >> "$3" 2>&1; }
{ S 17-8 $P/accA2.jsonl $P/laneA2.log; S 17-6 $P/accA2.jsonl $P/laneA2.log; } &
{ S 2-2 $P/accB2.jsonl $P/laneB2.log; S 4-5 $P/accB2.jsonl $P/laneB2.log; }
wait
grep -h RESULT $P/laneA2.log $P/laneB2.log | cut -c1-300
