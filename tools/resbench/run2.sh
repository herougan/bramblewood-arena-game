#!/bin/bash
# 2026-11-28 (RESBENCH2): the scan, then the run, two shards at nice 19; the saved games are committed by path every 15 minutes (the server
# restarts often; the run resumes from them). Logs: /tmp/rb2-<shard>.log. usage: bash tools/resbench/run2.sh [games]
cd "$(dirname "$0")/../.." || exit 1
G=${1:-800}
commit() { for i in 1 2 3; do git add -- docs/balance/resbench/rb2-games-*.json 2>/dev/null && git commit -q -m "RESBENCH2: saved games (progress)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FLq7wToSrTQpVQBsVhz3ZD" -- docs/balance/resbench/rb2-games-*.json && return; sleep 20; done; }
for s in 0 1; do ( nice -n 19 node tools/resbench/resbench2.js scan --games 120 --shard $s/2 && nice -n 19 node tools/resbench/resbench2.js run --games "$G" --shard $s/2 ) > /tmp/rb2-$s.log 2>&1 & done
while pgrep -f "resbench2.js (scan|run)" > /dev/null; do sleep 900; commit; done
commit; echo "rb2 done $(date)" >> /tmp/rb2-0.log
