#!/usr/bin/env bash
# 2026-11-03 (package BAL15): the package's simulations in sequence, one at a time on the machine (2 cores), before any card / budget change
# (the measures are cached by the game's fingerprint).
#   1. Royal Guard's On Play +3 Shield to every ally, an ad hoc trigger item, 400 / 700 / 1,000 paired fights at bramble 15 (item 2)
#   2. BAL14's 15 items still wide at 400 fights, at 1,000 fights (item 3)
#   3. the tempo measure: bench contrib at bramble 15, 400 fights a card, all 15 T cards + a seeded sample of 60 R / 25 C / 25 O cards (item 1)
set -u
cd "$(dirname "$0")/../../.."
D=docs/balance/bal15
tools/pipeline/run.sh --wait measure --only-file $D/measure-grantshield-2026-11-03.json --fights 400,700,1000 > $D/measure-grantshield.log 2>&1
echo "grantshield done $?" >> $D/progress.log
tools/pipeline/run.sh --wait measure --only-file $D/measure-wide-2026-11-03.json --fights 1000 > $D/measure-wide.log 2>&1
echo "wide done $?" >> $D/progress.log
node tools/bench/bench.js contrib --bramble 15 --games 400 --workers 2 --tag 2026-11-03-bal15-tempo --save --cards "$(cat $D/tempo-cards-2026-11-03.txt)" > $D/tempo-contrib.log 2>&1
echo "tempo done $?" >> $D/progress.log
