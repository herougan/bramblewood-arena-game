#!/bin/bash
# 2026-11-20 (package REFIT16): the fresh check (seeds 151100 / 152100, 400 games) of the first scan's candidates and the Shield levers
# (Shield between 0 and the rule), then the Map 17 scans (60 games, seed 161300).
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 13-8 400 out=beaver-feller:1+add=bramblewood-lynx:1 out=slow-worm:1+add=amber-cicada:1 out=beaver-feller:2+add=redwood-woodpecker:2 out=slow-worm:1+add=marsh-mallow-hare:1 out=beaver-feller:1+add=redwood-woodpecker:1
bash $P 11-9 400 out=stonedrop-vulture:2+add=apollo-butterfly:2 out=stonedrop-vulture:2+add=golden-eagle-diver:2 out=stonedrop-vulture:1+add=apollo-butterfly:1 out=stonedrop-vulture:1+add=golden-eagle-diver:1
bash $P 10-9 400 shield=3 shield=6 shield=9 shield=15
bash $P 11-10 400 shield=0 shield=2
nice -n 5 node swap_2026_11_20.js 17-7 60 161300 2 glacier-yak,ringed-seal,arctic-tern,snow-ermine,warhorse-charger,elderhorn-monarch all > swap-17-7.log 2>&1 &
nice -n 5 node swap_2026_11_20.js 17-4 60 161300 2 glacier-yak,arctic-tern,harbor-seal,snow-ermine,elderhorn-monarch,ice-crevasse-wolf all > swap-17-4.log 2>&1
wait
echo FRESH1 DONE
