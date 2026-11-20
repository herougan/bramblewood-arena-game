#!/bin/bash
# 2026-11-20 (package REFIT17): round 4, owner options (outside the levers) for the fights with no legal fix, confirm seeds 161100 / 162100
# at 400 games: a side deck under the 10-card floor, the enemy level, an admin bramble Health (brambleHealth, above the base), a lower Health.
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 20-A-4 400 out=honey-badger-fury:2 set=enemyLevel:3.5 set=enemyLevel:3
bash $P 5-A-3 400 set=brambleHealth:20 set=brambleHealth:25 shield=26+set=enemyLevel:4
bash $P 2-B-1 400 hq=8 hq=6
bash $P 1-A-1 400 out=chipmunk-cavalry:1 out=ant-scout:2 set=enemyLevel:0
echo ROUND4 DONE
