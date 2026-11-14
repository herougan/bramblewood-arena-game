#!/usr/bin/env bash
# 2026-11-14 (package SKW1): run skw1.js steps one after another, single thread. Each arg is "<cmd>:<ctx>:<games>", e.g. a:van:100 b:g1:100.
# Logs: docs/balance/skw1/logs/<cmd>-<ctx>.log (the last line is the step's summary).
set -u
cd "$(dirname "$0")/../.."
mkdir -p docs/balance/skw1/logs
for step in "$@"; do
  IFS=: read -r cmd ctx games <<< "$step"
  echo "$(date +%H:%M) start $cmd $ctx $games"
  node tools/skw1/skw1.js "$cmd" --ctx "$ctx" --games "$games" > "docs/balance/skw1/logs/$cmd-$ctx.log" 2>&1 || echo "FAILED $step (exit $?)"
  echo "$(date +%H:%M) done $cmd $ctx: $(grep -m1 -E '^ruler|games in' "docs/balance/skw1/logs/$cmd-$ctx.log" | tail -1)"
done
