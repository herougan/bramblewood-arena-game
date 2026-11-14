#!/bin/bash
# 2026-11-14 (package WHATIF2): SIDE2-2 options a + c together (Carried cards at 2 copies AND smaller side decks), WHATIF1's tools, rules and
# method unchanged (tools/whatif1/*). One worker, one scratch copy W/whatif2-ac made from WHATIF1's today copy (W/whatif1-b: the engine, cards
# and decks WHATIF1 measured), so a+c reads beside WHATIF1's today / a / c on the same inputs. Each step leaves a marker; the fit resumes.
# One call stops itself before BUDGET minutes (default 110); call it again to go on.
#   bash tools/whatif2/queue_2026_11_14.sh <scratch dir W> [minutes=110]
# a+c, as WHATIF1 ran a and c:
#   sizes: c's rule (min(size, 15 skirmish / 16 elite-boss, the list's largest legal deck), the 77 curve fights only) with the largest deck under
#          Carried x2 (pools_2026_11_14.js smaxA): the same 36 cuts as c, but 0-B-3 at 15 (14 under K14);
#   rebuild under --carried 2: c's 36 cut fights at those sizes plus a's 20-A-4; enders (BPRO-1 scaled) as a: 14-A-5, 20-A-4, 19-A-10;
#          a deck not legal or not in the pool takes SIDE2's seeded blend (0-B-3, 2-A-6);
#   fit under --carried 2: a's 27 fights + c's 36 cut fights (51), --from today's read without the rebuilt fights; then 400 games on the 81 codes.
W=${1:?scratch dir}; BUDGET=${2:-110}; T0=$(date +%s)
left() { echo $(( BUDGET * 60 - ($(date +%s) - T0) )); }
CODES=$(cat "$W/whatif1-codes.txt")
FITA=1-A-1,1-A-2,1-A-4,2-A-1,2-A-2,2-A-3,2-A-4,2-A-6,19-A-1,19-A-4,19-A-6,19-A-7,19-A-8,7-A-2,14-A-1,14-A-2,14-A-3,14-A-5,20-A-2,20-A-6,20-A-7,17-A-1,17-A-2,17-A-4,0-B-1,0-B-3,0-B-4
SIZES=$(sed 's/0-B-3=14/0-B-3=15/' "$W/whatif1-csizes.txt")
CUT=$(echo "$SIZES" | tr ',' '\n' | cut -d= -f1 | paste -sd,)
REB="$CUT,20-A-4"
FIT=$(echo "$FITA,$CUT" | tr ',' '\n' | awk '!s[$0]++' | paste -sd,)
AC=$W/whatif2-ac; R="node tools/whatif1/rules_2026_11_14.js --carried 2 --"
step() { local name=$1 dir=$2; shift 2; [ -e "$W/whatif2-done-$name" ] && return 0
  local L=$(left); if [ "$L" -lt 300 ]; then echo "out of time before $name"; exit 0; fi
  echo "== $name ($(date +%H:%M))"; ( cd "$dir" && timeout "$L" "$@" ); local rc=$?
  if [ $rc -eq 124 ]; then echo "$name cut by the time limit"; exit 0; fi
  if [ $rc -ne 0 ]; then echo "$name failed ($rc)"; exit 1; fi
  touch "$W/whatif2-done-$name"
}
step rebuild-ac $AC $R tools/whatif1/whatif1_2026_11_14.js rebuild --codes $REB --size $SIZES --ender 14-A-5,20-A-4,19-A-10 --write --tag whatif2-ac
step from-ac $AC node -e 'const fs=require("fs"),f="docs/balance/skirmish-pass-whatif1-base.jsonl",skip=new Set(process.argv[1].split(","));
  fs.writeFileSync("docs/balance/skirmish-pass-whatif2-base-ac.jsonl",fs.readFileSync(f,"utf8").split("\n").filter(l=>l&&!skip.has(JSON.parse(l).code)).join("\n")+"\n")' $REB
step fit-ac $AC sh -c "node tools/side2/fit_2026_11_13.js apply --dir ../whatif2/fit-ac; exec $R tools/side2/fit_2026_11_13.js run --codes $FIT --dir ../whatif2/fit-ac --from whatif2-base-ac --resume"
step apply-ac $AC node tools/side2/fit_2026_11_13.js apply --dir ../whatif2/fit-ac
step measure-ac $AC node tools/skirmish_pass.js measure 400 0 1 --tag=whatif2-ac --only=$CODES
# fresh seeds (5100 + 37g): the 14 fights whose band status moved vs today (tools/whatif2/report_2026_11_14.js "movers"; today's fresh reads
# for all 14 are WHATIF1's measure-base-fresh), plus 0-B-3 and the fights still out that the brief names (2-A-6, 10-A-5, 18-A-9)
FRESH=1-A-4,2-A-3,19-A-7,19-A-8,19-A-10,14-A-3,14-A-5,17-A-1,17-A-2,17-A-4,0-B-1,0-B-4,18-A-2,18-A-3,0-B-3,2-A-6,10-A-5,18-A-9
step fresh-ac $AC node tools/skirmish_pass.js measure 400 0 1 --seed=5100 --tag=whatif2-ac-fresh --only=$FRESH
# engine drift: ENG-OD1 (2026-11-14, after WHATIF1's copies were made) changed bramblewood-engine.js; today and a+c re-read with the current
# engine (the worktree's), every other file as above (arena_app.js's other changes since are UI only)
NOW=$W/whatif2-now; ACN=$W/whatif2-ac-now; ENG=$(cd "$(dirname "$0")/../.." && pwd)/bramblewood-engine.js
[ -d $NOW ] || { mkdir -p $NOW && cp -a $W/whatif1-b/. $NOW/ && cp "$ENG" $NOW/; }
[ -d $ACN ] || { mkdir -p $ACN && cp -a $AC/. $ACN/ && cp "$ENG" $ACN/; }
step measure-now $NOW node tools/skirmish_pass.js measure 400 0 1 --tag=whatif2-now --only=$CODES
step measure-ac-now $ACN node tools/skirmish_pass.js measure 400 0 1 --tag=whatif2-ac-now --only=$CODES
echo "queue done ($(date +%H:%M))"
