#!/bin/bash
# 2026-11-21 (package REFIT18): legal pool-swap scans (60 games, seed 171300, nice 10) on the 9 main fights 10+ off and side 10-A-3, two
# chains (one core each). A finished fight (log ends with 'blocked:') is skipped; a cut one resumes (DONE= skips its scanned decks).
cd "$(dirname "$0")" || exit 1
S=swap_2026_11_21.js
run() { grep -q '^blocked:' "swap-$1.log" 2>/dev/null && return; [ -f "swap-$1.log" ] && cp "swap-$1.log" "swap-$1.part"
  DONE="swap-$1.part" nice -n 10 node $S "$1" 60 171300 "$2" all all >> "swap-$1.log" 2>&1; rm -f "swap-$1.part"; }
( run 13-8 2; run 5-2 2; run 9-1 2; run 5-6 2; run 18-3 2; run 20-9 2 ) &
( run 18-2 2; run 18-6 2; run 20-4 2; run 10-A-3 2 ) &
wait
echo SCAN DONE
