#!/usr/bin/env bash
# 2026-11-20 (package SKM1, owner 00:40: "We cannot stop. We need to keep using CPU. Once it stabilises, we use a NEW kind of experiment"):
# the measurement queue, niced (other agents share the 2 cores). The designs in the order below (each resumes where it stopped), then the
# stabilising passes (--refine N: the skills whose 95% half-width is still over 10% of the estimate get up to N paired fights), then the summary.
#   bash tools/skm/queue.sh            (re-run it after a stop: finished work is skipped)
set -u
cd "$(dirname "$0")/../.."
ORDER='V1-*,H1-*,R1-*,E1-*,E2-*,E17-*,DK-*,AD-*,E18-*,E3-*,E4-*,E5-*,V12-*,E6-*,E9-*,E10-*,P1-*,E8-*,E7-*,H2-*,E11-*,E12-*,E13-*,E14-*,E15-*,E16-*,R2-*,R3-*,D1-*'
nice -n 10 node tools/skm/run.js --methods "$ORDER"
for N in 120 200 320 480; do nice -n 10 node tools/skm/run.js --methods "$ORDER" --refine "$N"; done
nice -n 15 node tools/skm/summary.js
