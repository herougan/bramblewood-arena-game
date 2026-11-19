#!/bin/bash
# 2026-11-19 (package REFIT8): main / side road fights of Maps 0-20 in band / within 10 / beyond 20 of a measure file, as REFIT7 counted
# them (rows with a target, endless and the Tutorial left out; RAIDGATE's 10-B fights left out).   bash docs/balance/refit8/count_2026_11_19.sh <measure.jsonl>
jq -s -r 'map(select(.endless != true and .target != null and .mapNo <= 20 and (.key|test("^T-|^10-B-")|not))) | group_by(.side)[] |
  "\(if .[0].side then "side" else "main" end) \(length): in band \(map(select(.win >= .lo and .win <= .hi))|length), within 10 \(map(select((.win - .target)|fabs <= 10))|length), beyond 20 \(map(select((.win - .target)|fabs > 20))|length)"' "$1"
