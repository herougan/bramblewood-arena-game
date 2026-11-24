#!/bin/bash
# 2026-11-24 (package ROADFIX3): the legal swap search (search_2026_11_24.js) for the fights whose curve proposal broke a deck rule, two lanes
# (a map's fights in one lane; each lane file is seeded with the legal curve fixes so the map lines see them). Tune seeds 11300 / 12300.
#   bash docs/balance/roadfix3/lanes_2026_11_24.sh 1|2 [CODE ...]
cd "$(dirname "$0")/../../.." || exit 1
LANE=$1; shift
D=docs/balance/roadfix3
if [ "$LANE" = 1 ]; then CODES="8-3 8-8"; else CODES="7-A-2"; fi
[ -n "$*" ] && CODES="$*"
for c in $CODES; do
  node $D/search_2026_11_24.js --code $c --fx $D/lane$LANE.jsonl --accept $D/lane$LANE.jsonl --rounds 4 --g1max 100 2>&1 | grep -E "^(RESULT|round|start|repair|no nearer)" | cut -c1-700
done
echo LANE $LANE DONE
