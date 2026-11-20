#!/bin/bash
# 2026-11-20 (package REFIT17): confirm seeds 161100 / 162100 (400 games), part 2: the too-easy side fights (swaps, some at their Shield
# lever), 2-A-3's swaps at Shield 0, and 10-A-5's Shield between 20 and 28.
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 20-B-3 400 out=vampire-roost:1+add=ur-elk:1 out=basalt-boar:1+add=ur-elk:1 out=basalt-boar:2+add=ur-elk:2 out=vampire-roost:2+add=cataphract-destrier:2 out=vampire-roost:1,basalt-boar:1+add=ur-elk:2
bash $P 5-A-3 400 out=bog-leech:1+add=nutria-reedcutter:1 out=muskrat-reedgatherer:1+add=constrictor-coil:1 out=bog-leech:1,muskrat-reedgatherer:1+add=nutria-reedcutter:1,constrictor-coil:1
bash $P 10-A-3 400 shield=11+out=reef-shark:1+add=orca-vanguard:1 shield=11+out=blue-ringed-octopus:1+add=giant-clam:1 shield=11+out=riptide-eel:1+add=orca-vanguard:1
bash $P 2-B-3 400 out=limpet-clinger:2+add=raccoon-nightcrew:2 out=limpet-clinger:1+add=gull-thief:1 out=open-ocean-hermit-crab:2+add=raccoon-nightcrew:2 out=limpet-clinger:2+add=raccoon-nightcrew:1,gull-thief:1
bash $P 2-A-3 400 shield=0+out=pond-algae:1+add=beaver-lumberjack:1 shield=0+out=beaver-lumberjack:1+add=water-shrew:1
bash $P 10-A-5 400 shield=24 shield=26
echo CONFIRM2 DONE
