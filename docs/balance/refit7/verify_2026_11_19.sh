#!/bin/bash
# 2026-11-19 (package REFIT7): the fresh-seed check of a pass's candidates: the live decks on two seed sets (one core each, 400 games),
# then the candidates applied to arena_app.js and read on the same seeds. arena_app.js is left holding every candidate: restore it
# (git checkout arena_app.js) and apply the pass's fixes file afterwards.
#   bash docs/balance/refit7/verify_2026_11_19.sh <codes-file> <candidates-name> <seedA> <seedB>
cd "$(dirname "$0")/../../.." || exit 1
C=$(cat "$1"); N=$2; SA=$3; SB=$4; P=docs/balance/refit7
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit7-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit7-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit7/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit7-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit7-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
wc -l docs/balance/skirmish-pass-refit7-{live,fix}-s{$SA,$SB}.jsonl
