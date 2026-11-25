#!/bin/bash
# 2026-11-25 (package ROADFIX4): the legal swap search (search_2026_11_25.js) for the fights the curve round left out of band, two lanes (a
# map's fights in one lane, so the map lines see the lane's accepted decks; the worst gaps first). A code with a RESULT in the lane file is
# skipped, so a lane started again after a restart resumes; the lane file is committed after each code. Tune seeds 11300 / 12300.
#   bash docs/balance/roadfix4/lanes_2026_11_25.sh 1|2 [CODE ...]
cd "$(dirname "$0")/../../.." || exit 1
LANE=$1; shift
D=docs/balance/roadfix4
CODES=$(cat $D/lane$LANE-codes.txt)
[ -n "$*" ] && CODES="$*"
touch $D/lane$LANE.jsonl
for c in $CODES; do
  grep -q "\"key\":\"$c\"" $D/lane$LANE.jsonl && continue
  node $D/search_2026_11_25.js --code $c --fx $D/lane$LANE.jsonl --accept $D/lane$LANE.jsonl --rounds 5 --g1max 100 2>&1 | grep -E "^(RESULT|round|start|repair|no nearer)" | cut -c1-700
  # commit the lane's results after each code (the server restarts often); one git at a time across the lanes
  F="$D/lane$LANE.jsonl $D/lane$LANE.log $D/search-2026-11-25.jsonl"
  flock /tmp/rf4-git.lock sh -c "git add $F && git commit -q -m 'ROADFIX4: search lane $LANE, $c' -m 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FLq7wToSrTQpVQBsVhz3ZD' -- $F" >/dev/null 2>&1
done
echo LANE $LANE DONE
