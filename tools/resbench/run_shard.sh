#!/bin/bash
# 2026-11-28 (RESBENCH1): one shard of the bench's phases in order, at nice 19 (it yields to the road measures); log in /tmp/resbench-<shard>.log
# usage: bash tools/resbench/run_shard.sh 0/2 "curve calib" 800
cd "$(dirname "$0")/../.." || exit 1
for ph in $2; do nice -n 19 node tools/resbench/resbench.js run --phase "$ph" --games "${3:-800}" --shard "$1" || exit 1; done
