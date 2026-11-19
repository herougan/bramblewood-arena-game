#!/bin/bash
# 2026-11-19 (package REFIT8): REFIT7's fresh-seed check (docs/balance/refit7/verify_2026_11_19.sh): the live decks on two unused seed sets
# (one core each, 400 games), then the candidates applied to arena_app.js and read on the same seeds. arena_app.js is left holding every
# candidate: restore it (git checkout arena_app.js) and apply refit8-fixes.jsonl afterwards.
#   bash docs/balance/refit8/verify_2026_11_19.sh <codes> [seedA=71100] [seedB=72100] [candidates=refit8-candidates]
cd "$(dirname "$0")/../../.." || exit 1
C=$1; SA=${2:-71100}; SB=${3:-72100}; N=${4:-refit8-candidates}; P=docs/balance/refit8
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit8-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit8-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit8/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit8-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit8-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
mv docs/balance/skirmish-pass-refit8-{live,fix}-s{$SA,$SB}.jsonl $P/ && wc -l $P/skirmish-pass-refit8-{live,fix}-s{$SA,$SB}.jsonl
