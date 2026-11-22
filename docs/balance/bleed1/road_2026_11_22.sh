#!/bin/bash
# 2026-11-22 (package BLEED1): the Maps 0-20 road measure on the BLEED1 engine (owner 09:56 #2) and the PROLIST decks, seed 9100, 400 games, two shards (one core each, nice 10); the
# measure resumes from the file's lines after a cut (RESET=1 starts over).
cd "$(dirname "$0")/../../.." || exit 1
T=bleed1-road-s9100
[ "$RESET" = 1 ] && rm -f docs/balance/skirmish-pass-$T.jsonl
nice -n 10 node tools/skirmish_pass.js measure 400 0 2 --tag=$T --maxmap=20 >> docs/balance/bleed1/road-0.log 2>&1 &
nice -n 10 node tools/skirmish_pass.js measure 400 1 2 --tag=$T --maxmap=20 >> docs/balance/bleed1/road-1.log 2>&1
wait
[ "$(wc -l < docs/balance/skirmish-pass-$T.jsonl)" -ge 245 ] && cp docs/balance/skirmish-pass-$T.jsonl docs/balance/bleed1/ && echo ROAD DONE
