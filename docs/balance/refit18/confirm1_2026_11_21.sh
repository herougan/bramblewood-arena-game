#!/bin/bash
# 2026-11-21 (package REFIT18): confirm seeds 161100 / 162100 (400 games) for scan round 1's candidates (swap-*.log, 60 games, seed 171300)
# and the Shield levers (0 .. the rule; 5-6 rule 8, 18-6 rule 27). A fight already in levers.log is skipped (resume after a cut).
cd "$(dirname "$0")" || exit 1
P() { grep -q "^$1 base" levers.log 2>/dev/null && return; bash ./pair_2026_11_21.sh "$@"; }
P 13-8 400 out=beaver-feller:1+add=bramblewood-lynx:1 out=monarch-wingblade:1+add=bramblewood-lynx:1 out=owl-nightwatch:1+add=bramblewood-lynx:1
P 9-1 400 out=electric-ray:1+add=proboscis-monkey:1 out=electric-ray:1+add=horseshoe-crab:1 out=electric-ray:2+add=horseshoe-crab:2 out=electric-ray:2+add=proboscis-monkey:2
P 5-6 400 shield=4 shield=8 out=bog-leech:2+add=swamp-alligator:2 out=nutria-reedcutter:2+add=mosquito-cloud:2 out=marsh-mallow-hare:1+add=raft-spider:1
P 5-2 400 out=constrictor-coil:1+add=fire-ant-raft:1 out=nutria-reedcutter:2+add=muskrat-reedgatherer:2 out=muskrat-reedgatherer:1+add=raft-spider:1
P 18-6 400 shield=9 shield=18 shield=27 out=ice-crevasse-wolf:1+add=sunbittern-strider:1
P 20-9 400 out=obsidian-scorpion:1+add=crocodile-ambusher:1
echo CONFIRM1 DONE
