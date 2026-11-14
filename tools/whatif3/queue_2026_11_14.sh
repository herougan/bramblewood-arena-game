#!/bin/bash
# 2026-11-14 (package WHATIF3): the smallest single lever that brings 10-A-5, 18-A-9 (SIDE2-4's levers) and 2-A-6 (the same plus CPU deck moves
# of up to 2 copies) into band under SIDE2-2 e, 400 games, road seeds (9100 + 37g); fresh seeds (5100) follow in the report step by hand.
# Scratch copy W/whatif3-ac = WHATIF2's W/whatif2-ac-now (a+c decks on the current engine) plus tools/whatif3/. Two lanes, one per core:
#   bash tools/whatif3/queue_2026_11_14.sh <W> bosses | lodge
W=${1:?scratch dir}; C=$W/whatif3-ac; cd "$C" || exit 1
SW="node tools/whatif1/whatif1_2026_11_14.js sweep --games 400 --tag whatif3"
MV="node tools/whatif1/rules_2026_11_14.js --carried 2 -- tools/whatif3/whatif3_2026_11_14.js"
case $2 in
bosses)
  $SW --code 10-A-5 --param level --values 3,2
  $SW --code 10-A-5 --param hp --values 15,14,13,12,11,10,9
  $SW --code 18-A-9 --param level --values 4,3
  $SW --code 18-A-9 --param shield --values 38,35,32,29,26,23,20,17
  $SW --code 18-A-9 --param hp --values 13,11,9,7,5,3
  $SW --code 0-B-4 --param level --values 4,3 ;;
lodge)
  $SW --code 2-A-6 --param level --values 2,1
  $SW --code 2-A-6 --param hp --values 16,15,14,13,12,11,10,9,8,7,6,5,4
  $MV moves --code 2-A-6 --games 100 --copies 1,2 ;;
# second round, after the road reads: 2-A-6's pairs of 1-copy swaps (screen at 100 games), then fresh seeds on the values near the band edge
pairs)
  $MV moves --code 2-A-6 --games 100 --pairs ;;
fresh)
  FS="$SW --seed0 5100"
  $FS --code 10-A-5 --param hp --values 16,15,14,13
  $FS --code 18-A-9 --param level --values 4,3
  $FS --code 18-A-9 --param shield --values 35,32,29,26
  $FS --code 18-A-9 --param hp --values 11,9,7,5
  $FS --code 2-A-6 --param hp --values 17,10,9,8
  # 0-B-4 (in band under e) under the chosen levers: level -1, Health -1..-3 (it has no Shield)
  $SW --code 0-B-4 --param hp --values 17,16,15
  $FS --code 0-B-4 --param level --values 4,3
  $FS --code 0-B-4 --param hp --values 17,16,15 ;;
esac
