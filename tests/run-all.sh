#!/usr/bin/env bash
# Bramblewood test suite. Fast engine-level suites always run; the two-browser test runs with --e2e.
#   tests/run-all.sh          ~30s: card matrix, mechanic scenarios, two-player, async/raid, autobattler
#   tests/run-all.sh --e2e    + live two-browser match and the UI smoke test (~2 min, needs Playwright + Chromium)
set -u
cd "$(dirname "$0")/.."
fail=0
run(){ echo "▶ $*"; "$@" || fail=1; echo; }
run node tests/syntax.js
run node tests/card-matrix.js
run node tests/scenarios.js
run node tests/two-player.js
run node tests/async-raid.js
run node tests/autobattle.js
run node tests/raid.js
run node tests/trench.js
run node tests/ghost-unique.js
run node tests/swarm.js
run node tests/anti-air.js
run node tests/shield-call.js
run node tests/backstab.js
run node tests/lantern.js
run node tests/equipment.js
run node tests/when-ready.js
run node tests/keen-eye.js
run node tests/statuses-2026-10-11.js
run node tests/keywords-2026-10-11.js
run node tests/keywords-2026-10-12.js
run node tests/keywords-2026-10-14.js
run node tests/keywords-2026-10-14b.js
run node tests/keywords-2026-10-14c.js
run node tests/keywords-2026-10-14d.js
run node tests/keywords-2026-10-14e.js
run node tests/keywords-2026-10-14f.js
run node tests/keywords-2026-10-14g.js
run node tests/keywords-2026-10-15.js
run node tests/keywords-2026-10-15b.js
run node tests/keywords-2026-10-15c.js
run node tests/regen-fullhp-2026-10-14.js
run node tests/night-2026-10-12.js
run node tests/phase-status.js
run node tests/tide.js
run node tests/exile-zone.js
run node tests/rules-2026-10-10.js
run node tests/arena-rules.js
run node tests/devilry.js
run node tests/caged.js
run node tests/turn-start.js
run node tests/pounce.js
run node tests/earthquake.js
run node tests/terrain.js
run node tests/testkit-manual.js
run node tests/action-targets.js
run node tests/skills-1013.js
run node tests/wildpath-perks.js
run node tests/darkness-1013.js
run node tests/dynamite-helmet.js
run node tests/ecclesia.js
run node tests/integrity.js
run node tests/node-ids-2026-10-14.js
run node tests/fx-a-resist.js
if [[ "${1:-}" == "--e2e" ]]; then run python3 tests/e2e/live_two_player.py; run python3 tests/e2e/ui_smoke.py; run python3 tests/e2e/flows.py; run python3 tests/e2e/snaps.py; run python3 tests/e2e/i18n.py; run python3 tests/e2e/hero.py; run python3 tests/e2e/rarity_limit_craft.py; fi
if [[ $fail == 0 ]]; then echo "ALL PASSED"; else echo "SOME SUITES FAILED"; fi
exit $fail
