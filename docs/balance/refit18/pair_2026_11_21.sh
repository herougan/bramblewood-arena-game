#!/bin/bash
# 2026-11-21 (package REFIT18): REFIT17's pair (docs/balance/refit17/pair_2026_11_20.sh) at nice 10: one fight's live deck and levers
# (swaps as out=...+add=..., shield=N) on confirm seeds 161100 / 162100 at once, one core each, then the mean.
#   bash docs/balance/refit18/pair_2026_11_21.sh CODE games lever...   (appends to docs/balance/refit18/levers.log)
cd "$(dirname "$0")" || exit 1
C=$1; N=$2; shift 2
nice -n 10 node ./lever_2026_11_21.js "$C" live "$N" 161100 "$@" > "pair-$C-a.txt" 2>&1 &
nice -n 10 node ./lever_2026_11_21.js "$C" live "$N" 162100 "$@" > "pair-$C-b.txt" 2>&1
wait
paste -d'|' <(grep -v '^\[' "pair-$C-a.txt") <(grep -v '^\[' "pair-$C-b.txt") | awk -F'|' -v c="$C" -v n="$N" '
  NR==1 { split($1,a," "); split($2,b," "); printf "%s base  %s / %s  mean %.1f  (%s games, seeds 161100 / 162100)\n", c, a[3], b[3], (a[3]+b[3])/2, n; next }
  { na=split($1,a," "); nb=split($2,b," "); printf "  %-60s %s / %s  mean %.1f\n", a[1], a[na], b[nb], (a[na]+b[nb])/2 }' | tee -a levers.log
rm -f "pair-$C-a.txt" "pair-$C-b.txt"
