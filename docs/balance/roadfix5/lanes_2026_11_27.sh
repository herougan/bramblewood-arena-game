#!/bin/bash
# 2026-11-27 (package ROADFIX5): ROADFIX4's legal swap search (docs/balance/roadfix4/search_2026_11_25.js: list swaps only, an off-list card may
# lose copies but never gain, leaders / first-clear / sizes kept, no levers) for the post1127s fights the curve round left out, in two lanes by
# map. The map lines see the curve's taken decks (curve-accepted.jsonl) and the lane's results (fx-lane<N>.jsonl, rebuilt before each code).
# A code with a result in the lane file is skipped, so a lane started again after a restart resumes; committed after each code.
#   bash docs/balance/roadfix5/lanes_2026_11_27.sh 1|2 [CODE ...]
cd "$(dirname "$0")/../../.." || exit 1
LANE=$1; shift
D=docs/balance/roadfix5
CODES=$(cat $D/lane$LANE-codes.txt)
[ -n "$*" ] && CODES="$*"
touch $D/lane$LANE.jsonl
for c in $CODES; do
  grep -q "\"key\":\"$c\"" $D/lane$LANE.jsonl && continue
  # fx: the curve's taken decks the lane has not searched again, then the lane's own results
  node -e "const fs=require('fs'),r=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
    const lane=r('$D/lane$LANE.jsonl'),done=new Set(lane.map(x=>x.key));
    fs.writeFileSync('$D/fx-lane$LANE.jsonl',r('$D/curve-accepted.jsonl').filter(x=>!done.has(x.key)).concat(lane).map(x=>JSON.stringify(x)).join('\n')+'\n');"
  node docs/balance/roadfix4/search_2026_11_25.js --code $c --bands docs/balance/skirmish-pass-post1127s.jsonl --out $D/search-2026-11-27.jsonl \
    --fx $D/fx-lane$LANE.jsonl --accept $D/lane$LANE.jsonl --rounds 5 --g1max 100 2>&1 | grep -E "^(RESULT|round|start|repair|no nearer|$c)" | cut -c1-700
  F="$D/lane$LANE.jsonl $D/lane$LANE.log $D/search-2026-11-27.jsonl"
  flock /tmp/rf5-git.lock sh -c "git add $F && git commit -q -m 'ROADFIX5: search lane $LANE, $c' -m 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FLq7wToSrTQpVQBsVhz3ZD' -- $F" >/dev/null 2>&1
done
echo LANE $LANE DONE
