#!/bin/bash
# 2026-11-20 (package REFIT17): the Maps 0-20 road measure after the fixes, seed 9100, 400 games, two shards (one core each, nice 5); the
# measure resumes from the file's lines after a cut (RESET=1 starts over). OPT=1 first reads 20-A-4's over-cap owner options.
cd "$(dirname "$0")/../../.." || exit 1
[ "$OPT" = 1 ] && bash docs/balance/refit17/pair_2026_11_20.sh 20-A-4 400 out=honey-badger-fury:1+add=obsidian-scorpion:1 out=honey-badger-fury:2+add=obsidian-scorpion:1,the-contradiction:1
T=refit17-road-s9100
[ "$RESET" = 1 ] && rm -f docs/balance/skirmish-pass-$T.jsonl
nice -n 5 node tools/skirmish_pass.js measure 400 0 2 --tag=$T --maxmap=20 >> docs/balance/refit17/road-0.log 2>&1 &
nice -n 5 node tools/skirmish_pass.js measure 400 1 2 --tag=$T --maxmap=20 >> docs/balance/refit17/road-1.log 2>&1
wait
[ "$(wc -l < docs/balance/skirmish-pass-$T.jsonl)" -ge 245 ] && cp docs/balance/skirmish-pass-$T.jsonl docs/balance/refit17/ && echo ROAD DONE
