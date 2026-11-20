#!/bin/bash
# 2026-11-20 (package REFIT16): the Maps 0-20 road measure after the fixes, seed 9100, 400 games, two shards (one core each).
cd "$(dirname "$0")/../../.." || exit 1
T=refit16-road-s9100
[ "$RESET" = 1 ] && rm -f docs/balance/skirmish-pass-$T.jsonl   # the measure resumes from the file's lines otherwise
nice -n 5 node tools/skirmish_pass.js measure 400 0 2 --tag=$T --maxmap=20 >> docs/balance/refit16/road-0.log 2>&1 &
nice -n 5 node tools/skirmish_pass.js measure 400 1 2 --tag=$T --maxmap=20 >> docs/balance/refit16/road-1.log 2>&1
wait
mv docs/balance/skirmish-pass-$T.jsonl docs/balance/refit16/
echo ROAD DONE
