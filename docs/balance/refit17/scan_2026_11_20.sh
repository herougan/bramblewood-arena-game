#!/bin/bash
# 2026-11-20 (package REFIT17): legal pool-swap scans (60 games, seed 171300, nice 5) on the side fights Shield cannot fix, two chains (one core
# each); a fight whose log already ends with 'blocked:' is skipped (resume after a cut).
cd "$(dirname "$0")" || exit 1
S=swap_2026_11_20.js
run() { grep -q '^blocked:' "swap-$1.log" 2>/dev/null && return; nice -n 5 node $S "$1" 60 171300 "$2" all all > "swap-$1.log" 2>&1; }
( run 20-A-4 3; run 2-A-4 2; run 2-B-1 2; run 2-A-5 2; run 1-A-5 2; SHIELD=0 run 2-A-3 2; SHIELD=11 run 10-A-3 2 ) &
( run 5-A-3 2; run 20-B-3 2; run 1-A-2 3; run 1-A-1 3; run 7-A-1 2; run 2-B-3 2 ) &
wait
echo SCAN DONE
