#!/bin/bash
# 2026-11-14 (package REF7): third round of fresh-seed (5100) lever checks (200 games each) for the fights levers_a / _b2 left open.
cd "$(dirname "$0")/../.." || exit 1
W="node tools/ref7/walls_2026_11_14.js lever --games 40 --seed0 5100"
$W --code 16-3 --param card --card cone-cutter-squirrel --copies 4
$W --code 16-3 --param level --values 3
$W --code 18-4 --param rule --rule windfall
$W --code 18-4 --param card --card horned-lizard
$W --code 18-7 --param card --card horned-lizard --copies 1
$W --code 18-7 --param card --card horned-lizard --copies 2
$W --code 19-5 --param card --card pinecone-sapper
$W --code 19-5 --param rule --rule windfall
echo levers-c done
