#!/bin/bash
# 2026-11-14 (package REF7): fresh-seed (5100) checks of the candidate single levers for the Maps 19 and 20 walls, 200 games each (5 prog decks x 40).
cd "$(dirname "$0")/../.." || exit 1
W="node tools/ref7/walls_2026_11_14.js lever --games 40 --seed0 5100"
for c in 19-5 19-1 19-3 19-4 20-4 20-6 20-1 20-7 20-5 20-8; do $W --code $c --param base; done
$W --code 19-5 --param card --card obsidian-scorpion --copies 1
$W --code 19-5 --param card --card obsidian-scorpion --copies 2
$W --code 19-5 --param card --card obsidian-scorpion
$W --code 19-5 --param level --values 3
$W --code 19-1 --param card --card obsidian-scorpion
$W --code 19-1 --param level --values 3.5,3
$W --code 19-3 --param hp --values 10,9
$W --code 19-3 --param level --values 3
$W --code 19-3 --param card --card obsidian-scorpion --copies 1
$W --code 20-4 --param shield --values 5,0
$W --code 20-4 --param card --card sulfur-vent-crab --copies 2
$W --code 20-4 --param card --card obsidian-scorpion --copies 1
$W --code 20-6 --param shield --values 15,10
$W --code 20-6 --param level --values 3
$W --code 20-6 --param card --card sulfur-vent-crab --copies 2
$W --code 20-1 --param shield --values 5,0
$W --code 20-7 --param shield --values 7,0
$W --code 20-5 --param shield --values 8,0
echo levers-b done
