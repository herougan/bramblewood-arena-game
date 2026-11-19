#!/bin/bash
# 2026-11-20 (package REFIT10): REFIT9's fresh-seed check (docs/balance/refit9/verify_2026_11_19.sh): the live decks on two unused seed sets
# (one core each, 400 games), then the candidates applied to arena_app.js and read on the same seeds. arena_app.js is left holding every
# candidate: restore it (git checkout arena_app.js) and apply refit10-fixes.jsonl afterwards.
#   bash docs/balance/refit10/verify_2026_11_20.sh <codes> [seedA=101100] [seedB=102100] [candidates=refit10-candidates]
cd "$(dirname "$0")/../../.." || exit 1
C=$1; SA=${2:-101100}; SB=${3:-102100}; N=${4:-refit10-candidates}; P=docs/balance/refit10
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit10-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit10-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit10/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit10-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit10-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
mv docs/balance/skirmish-pass-refit10-{live,fix}-s{$SA,$SB}.jsonl $P/ && wc -l $P/skirmish-pass-refit10-{live,fix}-s{$SA,$SB}.jsonl
