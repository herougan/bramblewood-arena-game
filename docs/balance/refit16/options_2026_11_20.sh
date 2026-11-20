#!/bin/bash
# 2026-11-20 (package REFIT16): owner options for the Map 17 fights with no legal fix (fresh seeds 151100 / 152100, 400 games):
# bramble Health to the 60% floor (hq=22: 19 -> 11; a 21st lowered-Health fight) and the enemy level (3.36 now) a step down.
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 17-7 400 hq=22 set=enemyLevel:2.5 set=enemyLevel:2
bash $P 17-6 400 hq=22 set=enemyLevel:2.5 set=enemyLevel:3
bash $P 17-4 400 set=enemyLevel:3 set=enemyLevel:2.5
echo OPTIONS DONE
