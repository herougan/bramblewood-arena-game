#!/bin/bash
# 2026-11-20 (package REFIT16): REFIT15's pair (docs/balance/refit15/pair_2026_11_20.sh) on REFIT16's fresh seeds 151100 / 152100: one fight's
# live deck and levers (REFIT14's lever reader; swaps as out=...+add=...) on both seed sets at once, one core each, then the mean.
#   bash docs/balance/refit16/pair_2026_11_20.sh CODE games lever...   (appends to docs/balance/refit16/levers.log)
cd "$(dirname "$0")" || exit 1
C=$1; N=$2; shift 2
nice -n 5 node ../refit14/lever_2026_11_20.js "$C" live "$N" 151100 "$@" > "pair-$C-a.txt" 2>&1 &
nice -n 5 node ../refit14/lever_2026_11_20.js "$C" live "$N" 152100 "$@" > "pair-$C-b.txt" 2>&1
wait
paste -d'|' "pair-$C-a.txt" "pair-$C-b.txt" | awk -F'|' -v c="$C" -v n="$N" '
  NR==1 { split($1,a," "); split($2,b," "); printf "%s base  %s / %s  mean %.1f  (%s games, seeds 151100 / 152100)\n", c, a[3], b[3], (a[3]+b[3])/2, n; next }
  { na=split($1,a," "); nb=split($2,b," "); printf "  %-60s %s / %s  mean %.1f\n", a[1], a[na], b[nb], (a[na]+b[nb])/2 }' | tee -a levers.log
rm -f "pair-$C-a.txt" "pair-$C-b.txt"
