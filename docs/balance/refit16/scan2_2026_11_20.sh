#!/bin/bash
# 2026-11-20 (package REFIT16): second scans (60 games, seed 161300): whole-card swaps on 17-7, 17-6's scan, 13-8's second step from its
# Amber Cicada deck; then 10-9's Shield 7 / 8 on the fresh seeds.
cd "$(dirname "$0")" || exit 1
S=swap_2026_11_20.js
( KMIN=3 nice -n 5 node $S 17-7 60 161300 4 glacier-yak,ringed-seal,arctic-tern,snow-ermine all > swap-17-7-b.log 2>&1
  KMIN=3 nice -n 5 node $S 17-6 60 161300 4 glacier-yak,ringed-seal,arctic-tern,snow-ermine all > swap-17-6-b.log 2>&1 ) &
( nice -n 5 node $S 13-8 60 161300 2 beaver-feller,owl-nightwatch,tasmanian-devil,monarch-wingblade,bramblewood-lynx all '{"beaver-feller":4,"bramblewood-lynx":2,"monarch-wingblade":3,"owl-nightwatch":4,"redwood-woodpecker":1,"tasmanian-devil":4,"amber-cicada":1}' > swap-13-8-b.log 2>&1
  nice -n 5 node $S 17-6 60 161300 2 glacier-yak,ringed-seal,arctic-tern,snow-ermine,warhorse-charger,elderhorn-monarch,polar-bear all > swap-17-6.log 2>&1 ) &
wait
bash ./pair_2026_11_20.sh 10-9 400 shield=7 shield=8
echo SCAN2 DONE
