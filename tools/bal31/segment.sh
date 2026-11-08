#!/usr/bin/env bash
# 2026-11-08 (package BAL31): one run segment (background runs are capped at 2 h): the additivity test's first pass (phases 1-2 at 400
# fights), then the on-hit riders (400 fights), then the additivity's longer run (phases 1-3 at 800), each resuming from the cache, until
# HOURS (default 1.55) are used. Re-run the same command for the next segment.
#   bash tools/bal31/segment.sh [HOURS]
set -u
cd "$(dirname "$0")/../.."
H=${1:-1.55}
T0=$(date +%s)
left() { python3 -c "import time; print(max(0.0, $H - (time.time() - $T0) / 3600))"; }
step() { # step <label> <cmd...>: run when time is left; stop the segment when the step ran out of time
  local L; L=$(left); if python3 -c "import sys; sys.exit(0 if $L > 0.05 else 1)"; then :; else echo "segment: no time left before $1"; exit 0; fi
  echo "segment: $1 with $L h left"; local log; log=$(mktemp); "${@:2}" --hours "$L" 2>&1 | tee "$log"
  if grep -q "time is up" "$log"; then echo "segment: time is up in $1"; rm -f "$log"; exit 0; fi; rm -f "$log"
}
step "additivity first pass (400)" node tools/bal31/additivity_2026_11_08.js run --games 400 --phase 2 --workers 2
step "on-hit riders (400)" node tools/bal31/onhit_2026_11_08.js run --games 400 --workers 2
step "additivity at 800, phases 1-2" node tools/bal31/additivity_2026_11_08.js run --games 800 --phase 2 --workers 2
step "additivity at 800, phase 3" node tools/bal31/additivity_2026_11_08.js run --games 800 --phase 3 --workers 2
echo "segment: all steps done"
