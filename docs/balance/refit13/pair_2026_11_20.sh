#!/bin/bash
# 2026-11-20 (package REFIT13): one fight's levers on the two fresh seed sets (121100, 122100) at once, one core each, then the mean.
#   bash docs/balance/refit13/pair_2026_11_20.sh CODE games lever...   (appends to docs/balance/refit13/levers.log)
cd "$(dirname "$0")" || exit 1
C=$1; N=$2; shift 2
node lever_2026_11_20.js "$C" live "$N" 121100 "$@" > "pair-$C-a.txt" 2>&1 &
node lever_2026_11_20.js "$C" live "$N" 122100 "$@" > "pair-$C-b.txt" 2>&1
wait
paste -d'|' "pair-$C-a.txt" "pair-$C-b.txt" | awk -F'|' -v c="$C" -v n="$N" '
  NR==1 { split($1,a," "); split($2,b," "); printf "%s base  %s / %s  mean %.1f  (%s games, seeds 121100 / 122100)\n", c, a[3], b[3], (a[3]+b[3])/2, n; next }
  { na=split($1,a," "); nb=split($2,b," "); printf "  %-60s %s / %s  mean %.1f\n", a[1], a[na], b[nb], (a[na]+b[nb])/2 }' | tee -a levers.log
rm -f "pair-$C-a.txt" "pair-$C-b.txt"
