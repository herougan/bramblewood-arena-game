#!/bin/bash
# 2026-11-21 (package REFIT18): owner options for 18-2 and 18-3 (no swap moves them; Shield at the rule), confirm seeds 161100 / 162100 at
# 400 games: a higher enemy level, Shield above the rule, and the Stonedrop Vulture pool addition (as REFIT13-2 / REFIT14-1 measured).
cd "$(dirname "$0")" || exit 1
P() { grep -q "^$1 base" options.log 2>/dev/null && return; bash ./pair_2026_11_21.sh "$@" | tee -a options.log; }
P 18-2 400 set=enemyLevel:4 set=enemyLevel:4.5 shield=36 out=roadrunner-courier:2+add=stonedrop-vulture:2 out=roadrunner-courier:3+add=stonedrop-vulture:3
P 18-3 400 set=enemyLevel:4 set=enemyLevel:4.5 shield=36 out=armadillo-guard:2+add=stonedrop-vulture:2 out=armadillo-guard:3+add=stonedrop-vulture:3
echo ROUND4 DONE
