#!/bin/bash
# 2026-11-14 (package REF7): fresh-seed (5100) checks of the candidate single levers for the Maps 16 and 18 walls, 200 games each (5 prog decks x 40).
cd "$(dirname "$0")/../.." || exit 1
W="node tools/ref7/walls_2026_11_14.js lever --games 40 --seed0 5100"
for c in 16-3 16-4 16-6 16-2 18-4 18-3 18-2 18-6 18-5 18-1 18-7; do $W --code $c --param base; done
$W --code 16-3 --param card --card cone-cutter-squirrel --copies 2
$W --code 16-3 --param card --card cone-cutter-squirrel --copies 3
$W --code 16-3 --param card --card cone-cutter-squirrel
$W --code 16-4 --param card --card cone-cutter-squirrel --copies 1
$W --code 16-4 --param card --card cone-cutter-squirrel --copies 2
$W --code 16-4 --param level --values 3.5,3
$W --code 16-6 --param hp --values 13,12
$W --code 16-6 --param card --card cone-cutter-squirrel --copies 1
$W --code 16-2 --param hp --values 13,12
$W --code 16-2 --param card --card cone-cutter-squirrel --copies 1
$W --code 18-4 --param level --values 3,1,0
$W --code 18-4 --param shield --values 0
$W --code 18-4 --param card --card armadillo-guard
$W --code 18-3 --param level --values 3.5,3
$W --code 18-3 --param card --card horned-lizard --copies 2
$W --code 18-3 --param card --card horned-lizard
$W --code 18-2 --param level --values 3.5,3
$W --code 18-2 --param card --card antlion-pit --copies 2
$W --code 18-6 --param level --values 3.5,3
$W --code 18-6 --param card --card horned-lizard --copies 2
$W --code 18-5 --param hp --values 13,12
$W --code 18-5 --param level --values 3.5
$W --code 18-1 --param hp --values 13,12
$W --code 18-7 --param shield --values 12,9
$W --code 18-7 --param level --values 3.5
echo levers-a done
