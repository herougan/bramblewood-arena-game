#!/usr/bin/env bash
# 2026-11-21 (package SKM2): the confirm queue for SKM1's 16 flagged combat skills, niced (other agents share the 2 cores); re-run it after a
# stop: finished work is skipped (the pipeline keeps its measures and fights, the registry its result lines and cached games).
#   1. the pipeline measure at 1,000 fights (the plan items of docs/balance/skm/confirm-items-2026-11-21.json; it takes the pipeline lock);
#   2. the round robin (RR-*, 40 fights a pair); 3. the stat-equivalence searches E1 / E2 at 200 fights a probe; 4. the carrier x20 (H1) at
#   200 fights; 5. the table (tools/skm/confirm.js).
set -u
cd "$(dirname "$0")/../.."
SK=flying,diurnal,evasive,corrode,trident,pack,sleepPowder,poisonBarbs,poisonPowder,dive,keenSense,parasite,pulverise,overwhelm,offspring,repair
nice -n 10 tools/pipeline/run.sh --wait measure --only-file docs/balance/skm/confirm-items-2026-11-21.json --fights 1000 || exit $?
nice -n 10 node tools/skm/run.js --methods 'RR-*' --skills "$SK" --stages 40
nice -n 10 node tools/skm/run.js --methods 'E1-*,E2-*' --skills "$SK" --stages 200
nice -n 10 node tools/skm/run.js --methods 'H1-*' --skills "$SK" --stages 200
nice -n 15 node tools/skm/confirm.js
