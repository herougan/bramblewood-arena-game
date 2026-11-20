#!/bin/bash
# 2026-11-20 (package REFIT17): round 3 on the confirm seeds 161100 / 162100 (400 games): second candidates for 2-A-5, 10-A-3, 2-A-3; then
# owner options (outside the levers) for the fights with no legal fix: Shield above the rule or a higher enemy level (too easy), a lower
# bramble Health (a 21st lowered-Health fight), a lower enemy level or a smaller side deck (too hard).
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 2-A-5 400 out=raft-spider:1+add=muskrat-reedgatherer:1 out=raft-spider:1+add=beaver-lumberjack:1
bash $P 10-A-3 400 shield=11+out=blue-ringed-octopus:1,reef-shark:1+add=giant-clam:1,orca-vanguard:1 shield=11+out=blue-ringed-octopus:1,riptide-eel:1+add=giant-clam:1,orca-vanguard:1
bash $P 2-A-3 400 shield=2+out=beaver-lumberjack:1+add=water-shrew:1 shield=4+out=beaver-lumberjack:1+add=water-shrew:1
bash $P 20-A-4 400 out=honey-badger-fury:1+add=brimstone-hound:1 out=honey-badger-fury:1+add=brimstone-hound:1+shield=50 out=honey-badger-fury:1+add=brimstone-hound:1+shield=70 set=enemyLevel:4.5
bash $P 5-A-3 400 shield=20 shield=26 set=enemyLevel:3.5
bash $P 2-B-1 400 out=limpet-clinger:3 hq=10
bash $P 1-A-1 400 hq=18 hq=16 set=enemyLevel:2
bash $P 2-A-4 400 hq=22 hq=18
echo ROUND3 DONE
