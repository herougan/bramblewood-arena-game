#!/bin/bash
# 2026-11-20 (package REFIT17): confirm seeds 161100 / 162100 (400 games) for the scan's candidates (swap-*.log, 60 games, seed 171300),
# part 1: the too-hard side fights (want a higher win rate).
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 2-A-4 400 out=lodge-engineer:1+add=duck-paddler:1 out=lodge-engineer:1+add=raft-spider:1 out=water-shrew:1+add=raft-spider:1 out=lodge-engineer:1,water-shrew:1+add=duck-paddler:1,raft-spider:1
bash $P 1-A-2 400 out=meadow-rabbit:2+add=chipmunk-cavalry:2 out=meadow-rabbit:2+add=dormouse:2 out=meadow-rabbit:1+add=dormouse:1 out=meadow-rabbit:1+add=chipmunk-cavalry:1
bash $P 7-A-1 400 out=puffball-bombardier:2+add=earthworm:2 out=puffball-bombardier:2+add=rot-swollen-carcass:2 out=fungus-gnat-cloud:2+add=rot-swollen-carcass:2
bash $P 2-B-1 400 out=pincushion-urchin:2+add=gull-thief:2 out=pincushion-urchin:1+add=gull-thief:1 out=gull-thief:1+add=trash-panda-trickster:1
bash $P 1-A-1 400 out=ant-scout:1+add=dormouse:1 out=cottontail:1+add=dormouse:1 out=ant-scout:1,cottontail:1+add=dormouse:2
bash $P 2-A-5 400 out=raft-spider:1+add=water-shrew:1 out=raft-spider:1+add=pond-algae:1 out=raft-spider:1+add=lodge-engineer:1
bash $P 1-A-5 400 out=robin-redbreast:2+add=puddle-skimmer:2 out=robin-redbreast:1+add=puddle-skimmer:1 out=robin-redbreast:2+add=lucky-hopper:2 out=robin-redbreast:1+add=lucky-hopper:1
echo CONFIRM1 DONE
