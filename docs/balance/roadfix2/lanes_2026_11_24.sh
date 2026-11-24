#!/bin/bash
# 2026-11-24 (package ROADFIX2): the legal swap search (search_2026_11_24.js) for the fights the curve tune left off or illegal, in two lanes
# (one map's fights stay in one lane, so the map lines see every accepted deck of that map). Tune seeds 11300 (60 games) / 12300 (300 games).
#   bash docs/balance/roadfix2/lanes_2026_11_24.sh 1|2
cd "$(dirname "$0")/../../.." || exit 1
LANE=$1; shift
D=docs/balance/roadfix2
if [ "$LANE" = 1 ]; then CODES="8-3 8-1 8-2 8-5 8-4 8-7 8-6 2-2 2-B-1 2-4 2-B-4 2-A-6 1-4 1-2 1-3 1-A-1 1-A-4"; else CODES="18-7 18-A-7 18-A-6 18-A-4 9-2 9-4 9-6 10-4 10-8 10-A-1 4-3 4-1 5-2 6-3 13-8 20-9 17-3 5-A-3 3-2"; fi
[ -n "$*" ] && CODES="$*"
for c in $CODES; do
  node $D/search_2026_11_24.js --code $c --fx $D/lane$LANE.jsonl --accept $D/lane$LANE.jsonl --rounds 4 --g1max 100 2>&1 | grep -E "^(RESULT|round|start|repair|no nearer)" | cut -c1-600
done
echo LANE $LANE DONE
