#!/bin/bash
# 2026-11-14 (package WHATIF1): the package's sims in order, one worker, in three scratch copies of the repo (W/whatif1-a: option a, Carried x2;
# W/whatif1-c: option c, smaller side decks; W/whatif1-b: today's rules, the boss sweeps). Each step leaves a marker; the fits resume. One call
# stops itself before BUDGET minutes (default 110: background jobs die at 2 h); call it again to go on.
#   bash tools/whatif1/queue_2026_11_14.sh <scratch dir W> [minutes=110]
# Set-up before it (2026-11-14 run): each copy holds arena_app.js, bramblewood-*.js, canonical/, tools/, lang/, docs/balance/;
#   W/whatif1-codes.txt  = the 81 side fight codes (docs/balance/skirmish-pass-side2r2s400.jsonl), measured first in whatif1-b as tag whatif1-base;
#   W/whatif1-csizes.txt = code=size for option c (pools_2026_11_14.js --json: min(size, 15 skirmish / 16 elite-boss, the list's K14 largest deck));
#   whatif1-a: rules_2026_11_14.js --carried 2 -- whatif1_2026_11_14.js rebuild --codes 0-B-3,2-A-6,14-A-5,20-A-4,19-A-10 --ender 14-A-5,20-A-4,19-A-10 --write,
#              and docs/balance/skirmish-pass-whatif1-base-a.jsonl = the base read without those 5 fights (the fit's --from);
#   whatif1-c: whatif1_2026_11_14.js rebuild --codes <csizes codes> --size <csizes> --ender 14-A-5 --write;
#   W/whatif1-lv-*.txt   = the Enemy levels to sweep (below roadEnemyLevelExact: 0-B-4 and 18-A-9 at 4, 10-A-5 at 3).
W=${1:?scratch dir}; BUDGET=${2:-110}; T0=$(date +%s)
left() { echo $(( BUDGET * 60 - ($(date +%s) - T0) )); }
CODES=$(cat "$W/whatif1-codes.txt")
FITA=1-A-1,1-A-2,1-A-4,2-A-1,2-A-2,2-A-3,2-A-4,2-A-6,19-A-1,19-A-4,19-A-6,19-A-7,19-A-8,7-A-2,14-A-1,14-A-2,14-A-3,14-A-5,20-A-2,20-A-6,20-A-7,17-A-1,17-A-2,17-A-4,0-B-1,0-B-3,0-B-4
FITC=$(tr ',' '\n' < "$W/whatif1-csizes.txt" | cut -d= -f1 | paste -sd,)
step() { # name dir command...  (skipped once its marker exists; a step cut by the time limit has no marker and resumes)
  local name=$1 dir=$2; shift 2; [ -e "$W/whatif1-done-$name" ] && return 0
  local L=$(left); if [ "$L" -lt 300 ]; then echo "out of time before $name"; exit 0; fi
  echo "== $name ($(date +%H:%M))"; ( cd "$dir" && timeout "$L" "$@" ); local rc=$?
  if [ $rc -eq 124 ]; then echo "$name cut by the time limit"; exit 0; fi
  touch "$W/whatif1-done-$name"
}
B=$W/whatif1-b; A=$W/whatif1-a; C=$W/whatif1-c
SW="node tools/whatif1/whatif1_2026_11_14.js sweep --games 400 --tag side2-4"
step boss-hp-0B4 $B $SW --code 0-B-4 --param hp --values 17,16,15,14,13,12,11,10,9,8,7,6,5,4
step boss-hp-10A5 $B $SW --code 10-A-5 --param hp --values 15,14,13,12,11,10,9,8,7,6,5,4,3
step boss-sh-18A9 $B $SW --code 18-A-9 --param shield --values 38,35,32,29,26,23,20,17,14,11,8,5,2,0
step boss-hp-18A9 $B $SW --code 18-A-9 --param hp --values 14,13,12,11,10,9,8,7,6,5,4,3
step boss-lv-0B4 $B $SW --code 0-B-4 --param level --values "$(cat $W/whatif1-lv-0B4.txt)"
step boss-lv-10A5 $B $SW --code 10-A-5 --param level --values "$(cat $W/whatif1-lv-10A5.txt)"
step boss-lv-18A9 $B $SW --code 18-A-9 --param level --values "$(cat $W/whatif1-lv-18A9.txt)"
step side2-1b $B node tools/whatif1/rules_2026_11_14.js --carried 2 --codes 20-A-4,19-A-10 -- tools/whatif1/whatif1_2026_11_14.js rebuild --codes 20-A-4,19-A-10 --ender 20-A-4,19-A-10 --measure 400 --tag side2-1b
step fit-a $A sh -c "node tools/side2/fit_2026_11_13.js apply --dir ../whatif1/fit-a; exec node tools/whatif1/rules_2026_11_14.js --carried 2 -- tools/side2/fit_2026_11_13.js run --codes $FITA --dir ../whatif1/fit-a --from whatif1-base-a --resume"
step apply-a $A node tools/side2/fit_2026_11_13.js apply --dir ../whatif1/fit-a
step measure-a $A node tools/skirmish_pass.js measure 400 0 1 --tag=whatif1-a --only=$CODES
step fit-c $C sh -c "node tools/side2/fit_2026_11_13.js apply --dir ../whatif1/fit-c; exec node tools/side2/fit_2026_11_13.js run --codes $FITC --dir ../whatif1/fit-c --resume"
step apply-c $C node tools/side2/fit_2026_11_13.js apply --dir ../whatif1/fit-c
step measure-c $C node tools/skirmish_pass.js measure 400 0 1 --tag=whatif1-c --only=$CODES
# fresh seeds (5100 + 37g, evaluation protocol: re-measure on fresh seeds before a move counts): the fights whose band status moved under a or c,
# and the SIDE2-4 levers at the values that first reach the band and the ones nearest the target
MOVERS=1-A-4,2-A-3,19-A-8,19-A-10,14-A-3,14-A-5,17-A-4,0-B-1,0-B-4,19-A-7,17-A-1,17-A-2,18-A-2,18-A-3,0-B-3
step fresh-base $B node tools/skirmish_pass.js measure 400 0 1 --seed=5100 --tag=whatif1-base-fresh --only=$MOVERS
step fresh-a $A node tools/skirmish_pass.js measure 400 0 1 --seed=5100 --tag=whatif1-a-fresh --only=$MOVERS
step fresh-c $C node tools/skirmish_pass.js measure 400 0 1 --seed=5100 --tag=whatif1-c-fresh --only=$MOVERS
FS="$SW --seed0 5100 --tag side2-4-fresh"
step fresh-0B4-hp $B $FS --code 0-B-4 --param hp --values 18,10,8
step fresh-0B4-lv $B $FS --code 0-B-4 --param level --values 1,0
step fresh-10A5-hp $B $FS --code 10-A-5 --param hp --values 16,11,10
step fresh-18A9-sh $B $FS --code 18-A-9 --param shield --values 41,26,17
step fresh-18A9-lv $B $FS --code 18-A-9 --param level --values 3.5,3,1.5
echo "queue done ($(date +%H:%M))"
