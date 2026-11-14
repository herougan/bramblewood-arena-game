#!/bin/bash
# 2026-11-14 (package REF7): second round of fresh-seed (5100) lever checks for Maps 19-20, 200 games each, after levers_b.
cd "$(dirname "$0")/../.." || exit 1
W="node tools/ref7/walls_2026_11_14.js lever --games 40 --seed0 5100"
$W --code 19-5 --param level --values 1,0
$W --code 19-5 --param hp --values 13,10
$W --code 19-4 --param hp --values 15,13
$W --code 19-4 --param card --card obsidian-scorpion
$W --code 19-4 --param level --values 3
$W --code 20-4 --param shield --values 3
$W --code 20-6 --param shield --values 7,4
$W --code 20-1 --param level --values 3.5,3
$W --code 20-7 --param shield --values 3
$W --code 20-5 --param shield --values 4
echo levers-b2 done
