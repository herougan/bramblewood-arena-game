#!/usr/bin/env bash
# Bramblewood test suite. Fast engine-level suites always run; the two-browser test runs with --e2e.
#   tests/run-all.sh          ~30s: card matrix, mechanic scenarios, two-player, async/raid, autobattler
#   tests/run-all.sh --e2e    + live two-browser match and the UI smoke test (~2 min, needs Playwright + Chromium)
set -u
cd "$(dirname "$0")/.."
fail=0
run(){ echo "▶ $*"; "$@" || fail=1; echo; }
run node tests/card-matrix.js
run node tests/scenarios.js
run node tests/two-player.js
run node tests/async-raid.js
run node tests/autobattle.js
run node tests/raid.js
run node tests/trench.js
run node tests/integrity.js
if [[ "${1:-}" == "--e2e" ]]; then run python3 tests/e2e/live_two_player.py; run python3 tests/e2e/ui_smoke.py; run python3 tests/e2e/flows.py; fi
if [[ $fail == 0 ]]; then echo "ALL PASSED"; else echo "SOME SUITES FAILED"; fi
exit $fail
