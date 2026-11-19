#!/bin/bash
# 2026-11-19 (package REFIT9): REFIT8's fresh-seed check (docs/balance/refit8/verify_2026_11_19.sh): the live decks on two unused seed sets
# (one core each, 400 games), then the candidates applied to arena_app.js and read on the same seeds. arena_app.js is left holding every
# candidate: restore it (git checkout arena_app.js) and apply refit9-fixes.jsonl afterwards.
#   bash docs/balance/refit9/verify_2026_11_19.sh <codes> [seedA=85100] [seedB=86100] [candidates=refit9-candidates]
cd "$(dirname "$0")/../../.." || exit 1
C=$1; SA=${2:-85100}; SB=${3:-86100}; N=${4:-refit9-candidates}; P=docs/balance/refit9
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit9-live-s$SA" --maxmap=20 --only="$C" > "$P/live-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit9-live-s$SB" --maxmap=20 --only="$C" > "$P/live-$SB.log" 2>&1
wait
node tools/skirmish_pass.js apply --fixes="refit9/$N"
node tools/skirmish_pass.js measure 400 --seed="$SA" --tag="refit9-fix-s$SA" --maxmap=20 --only="$C" > "$P/fix-$SA.log" 2>&1 &
node tools/skirmish_pass.js measure 400 --seed="$SB" --tag="refit9-fix-s$SB" --maxmap=20 --only="$C" > "$P/fix-$SB.log" 2>&1
wait
mv docs/balance/skirmish-pass-refit9-{live,fix}-s{$SA,$SB}.jsonl $P/ && wc -l $P/skirmish-pass-refit9-{live,fix}-s{$SA,$SB}.jsonl
