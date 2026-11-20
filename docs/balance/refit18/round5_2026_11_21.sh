#!/bin/bash
# 2026-11-21 (package REFIT18): one Stonedrop Vulture (the pool addition round 4 measured at 2 and 3 copies) for 18-2 and 18-3, confirm
# seeds 161100 / 162100 at 400 games (enemy level reads the same at 3.54 / 4 / 4.5 on these two fights).
cd "$(dirname "$0")" || exit 1
P() { bash ./pair_2026_11_21.sh "$@" | tee -a options.log; }
P 18-2 400 out=roadrunner-courier:1+add=stonedrop-vulture:1 out=caustic-scorpion:1+add=stonedrop-vulture:1
P 18-3 400 out=armadillo-guard:1+add=stonedrop-vulture:1 out=worker-ant:1+add=stonedrop-vulture:1
echo ROUND5 DONE
