#!/bin/bash
# 2026-11-21 (package REFIT18): owner options (outside the levers) for the fights with no legal fix, confirm seeds 161100 / 162100 at 400
# games: Shield above the rule or a higher enemy level (too easy), a lower bramble Health on an already-lowered fight (5-2, too hard).
# Runs after confirm2; a fight already in options.log is skipped (resume after a cut).
cd "$(dirname "$0")" || exit 1
bash ./confirm2_2026_11_21.sh
P() { grep -q "^$1 base" options.log 2>/dev/null && return; bash ./pair_2026_11_21.sh "$@" | tee -a options.log; }
P 13-8 400 shield=36 shield=46 set=enemyLevel:3.5 set=enemyLevel:4
P 20-4 400 shield=30 shield=40 set=enemyLevel:4.5 set=enemyLevel:5
P 5-2 400 hq=11 hq=9 hq=7
P 20-9 400 shield=75 shield=90 set=enemyLevel:4.3
P 10-A-3 400 shield=16 shield=22 set=enemyLevel:3.5 set=enemyLevel:4
echo ROUND3 DONE
