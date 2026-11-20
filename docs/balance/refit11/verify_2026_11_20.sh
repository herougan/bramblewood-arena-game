#!/bin/bash
# 2026-11-20 (package REFIT11): REFIT10's fresh-seed check (docs/balance/refit10/verify_2026_11_20.sh): the live decks on two unused seed sets
# (one core each, 400 games), then the candidates applied to arena_app.js and read on the same seeds. arena_app.js is left holding every
# candidate: restore it from HEAD and apply refit11-fixes.jsonl afterwards.
#   bash docs/balance/refit11/verify_2026_11_20.sh <codes> [seedA=111100] [seedB=112100] [candidates=refit11-candidates]
cd "$(dirname "$0")/../../.." || exit 1
C=$1; SA=${2:-111100}; SB=${3:-112100}; N=${4:-refit11-candidates}; P=docs/balance/refit11
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit11-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit11-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit11/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit11-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit11-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
mv docs/balance/skirmish-pass-refit11-{live,fix}-s{$SA,$SB}.jsonl $P/ && wc -l $P/skirmish-pass-refit11-{live,fix}-s{$SA,$SB}.jsonl
