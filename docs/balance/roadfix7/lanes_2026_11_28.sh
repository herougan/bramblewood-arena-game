#!/bin/bash
# 2026-11-28 (package ROADFIX7): ROADFIX6's lane, bands from post1128c (after CARDFIX1), seeds 17300 / 18300; ROADFIX4's legal swap search
# (docs/balance/roadfix4/search_2026_11_25.js: list swaps only, an off-list card may lose copies but never gain, leaders / first-clear / sizes
# kept, no levers) for the six fights CARDFIX1 moved out of band. One lane (RESBENCH1 shares the CPU); resumable; committed after each code.
#   bash docs/balance/roadfix7/lanes_2026_11_28.sh 1 [CODE ...]
cd "$(dirname "$0")/../../.." || exit 1
LANE=$1; shift
D=docs/balance/roadfix7
CODES=$(cat $D/lane$LANE-codes.txt)
[ -n "$*" ] && CODES="$*"
touch $D/lane$LANE.jsonl
for c in $CODES; do
  grep -q "\"key\":\"$c\"" $D/lane$LANE.jsonl && continue
  cp $D/lane$LANE.jsonl $D/fx-lane$LANE.jsonl
  node docs/balance/roadfix4/search_2026_11_25.js --code $c --bands docs/balance/skirmish-pass-post1128c.jsonl --out $D/search-2026-11-28.jsonl \
    --fx $D/fx-lane$LANE.jsonl --accept $D/lane$LANE.jsonl --rounds 5 --g1max 100 --seed1 17300 --seed2 18300 2>&1 | grep -E "^(RESULT|round|start|repair|no nearer|$c)" | cut -c1-700
  F="$D/lane$LANE.jsonl $D/lane$LANE.log $D/search-2026-11-28.jsonl"
  git add $F && git commit -q -m "ROADFIX7: search lane $LANE, $c" -m 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FLq7wToSrTQpVQBsVhz3ZD' -- $F >/dev/null 2>&1
done
echo LANE $LANE DONE
