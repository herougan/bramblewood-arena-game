#!/bin/bash
# 2026-11-21 (package REFIT18): confirm seeds 161100 / 162100 (400 games), part 2: scan round 2's best one- and two-step swaps for 18-2 and
# 18-3 (Shield at the rule, no other lever). A fight already in levers.log is skipped (resume after a cut).
cd "$(dirname "$0")" || exit 1
P() { grep -q "^$1 base" levers.log 2>/dev/null && return; bash ./pair_2026_11_21.sh "$@"; }
P 18-2 400 out=caustic-scorpion:2+add=horned-lizard:2 out=caustic-scorpion:2,sunbittern-strider:1+add=horned-lizard:3 out=caustic-scorpion:2,roadrunner-courier:1+add=horned-lizard:3
P 18-3 400 out=worker-ant:1,mouse-sapper:1+add=sandstorm-roc:1,ice-crevasse-wolf:1 out=barrel-cactus:1,worker-ant:1+add=antlion-pit:1,sandstorm-roc:1 out=worker-ant:1+add=sandstorm-roc:1 out=barrel-cactus:1+add=antlion-pit:1
echo CONFIRM2 DONE
