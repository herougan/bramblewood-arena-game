#!/usr/bin/env bash
# 2026-11-20 (package SKM1, owner 00:40: "We cannot stop. We need to keep using CPU. Once it stabilises, we use a NEW kind of experiment"):
# the measurement queue, niced (other agents share the 2 cores). Every design in registry order (each resumes where it stopped), then the
# stabilising passes (--refine N: the skills whose 95% half-width is still over 10% of the estimate get up to N paired fights), then the summary.
#   bash tools/skm/queue.sh            (re-run it after a stop: finished work is skipped)
set -u
cd "$(dirname "$0")/../.."
nice -n 10 node tools/skm/run.js --methods sim
for N in 120 200 320 480; do nice -n 10 node tools/skm/run.js --methods sim --refine "$N"; done
nice -n 15 node tools/skm/summary.js
