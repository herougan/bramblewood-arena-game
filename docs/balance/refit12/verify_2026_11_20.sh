#!/bin/bash
# 2026-11-20 (package REFIT12): REFIT11's fresh-seed check (docs/balance/refit11/verify_2026_11_20.sh): live decks, then the candidates, on two unused
# seed sets (one core each, 400 games). arena_app.js is left holding every candidate: restore it from HEAD and apply refit12-fixes.jsonl.
#   bash docs/balance/refit12/verify_2026_11_20.sh <codes> [seedA=121100] [seedB=122100] [candidates=refit12-candidates]
cd "$(dirname "$0")/../../.." || exit 1
C=$1; SA=${2:-121100}; SB=${3:-122100}; N=${4:-refit12-candidates}; P=docs/balance/refit12
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit12-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit12-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit12/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit12-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit12-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
mv docs/balance/skirmish-pass-refit12-{live,fix}-s{$SA,$SB}.jsonl $P/ && wc -l $P/skirmish-pass-refit12-{live,fix}-s{$SA,$SB}.jsonl
