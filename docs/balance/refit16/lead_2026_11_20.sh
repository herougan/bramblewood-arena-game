#!/bin/bash
# 2026-11-20 (package REFIT16, Part A): the lead table: Maps 0-1 main fights, 400 games, seeds 151100 (one core) and 152100 (the other).
cd "$(dirname "$0")" || exit 1
F="0-1 0-2 0-3 0-4 1-1 1-2 1-3 1-4 1-5"
run(){ for m in live off lead=1 exact=3 exact=0; do EB_MODE=$m nice -n 5 node lead_2026_11_20.js 400 "$1" $F; done; }
run 151100 > lead-151100.log 2>&1 &
run 152100 > lead-152100.log 2>&1
wait
echo LEAD DONE
