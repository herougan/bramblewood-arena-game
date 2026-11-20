#!/bin/bash
# 2026-11-20 (package REFIT17): the Shield lever (between 0 and the fight's rule, ruleShieldOf; unscaled values as in shieldOverride) on the
# side fights that can move by Shield, confirm seeds 161100 / 162100 at 400 games, worst first. Appends to levers.log.
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 10-A-5 400 shield=12 shield=20 shield=28 shield=33
bash $P 5-A-4 400 shield=15 shield=25 shield=33 shield=39
bash $P 10-A-3 400 shield=4 shield=8 shield=11
bash $P 7-A-1 400 shield=0 shield=2 shield=4
bash $P 11-A-4 400 shield=10 shield=20 shield=30 shield=45
bash $P 2-B-3 400 shield=7 shield=9 shield=11
bash $P 2-A-3 400 shield=0 shield=2 shield=4
echo SHIELD DONE
