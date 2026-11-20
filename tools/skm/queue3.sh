#!/usr/bin/env bash
# 2026-11-20 (package SKM3): SKM1's unfinished designs on today's game, niced (another balance job shares the 2 cores). Each step resumes
# from its result lines (docs/balance/skm/results/<method>.jsonl), so re-run the script after a stop or the 30-minute cut.
#   bash tools/skm/queue3.sh [step ...]     steps: C5, the new kinds OR DR OD DU PX, then H2 R2 R3 E11 ... E16 (default: all, in this order)
# The new kinds run before the rest of SKM1's plan: they are cheap and carry new information; E11-E16 repeat kinds that already have 2-6
# families, so they go last and get what the 2.5-hour compute budget leaves. E11-E16 play 40 fights a probe (--stages 40: the 80-fight
# stage doubled the cost for a CI rule a 40-fight probe never meets).
set -u
cd "$(dirname "$0")/../.."
export SKM_CACHE="${SKM_CACHE:-/tmp/skm-cache}"
STEPS="${*:-C5 OR DR OD DU PX H2 R2 R3 E11 E12 E13 E14 E15 E16}"
for s in $STEPS; do
  case "$s" in
    E1[1-6]) nice -n 10 node tools/skm/run.js --methods "$s-*" --stages 40 || exit $? ;;
    *) nice -n 10 node tools/skm/run.js --methods "$s-*" || exit $? ;;
  esac
done
