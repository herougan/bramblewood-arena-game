#!/usr/bin/env bash
# 2026-11-02 (package BAL9): the long runs, one after the other (run alone on the machine):
#   1. the BPRO decks rebuilt from the new lists (SPEED1 pipeline bake, every map: the lists, rarities and stats all moved)
#   2. the progression reference ("Reference (Random)", 5 decks a map, Maps 0-20) rebuilt per map from what a player owns by then, at the
#      map's level, with a leader and a bramble (tools/opt/ref5_prog.js run, tag 2026-11-02-bal9, 2,000 search games a deck)
#   bash tools/bal9/heavy_2026_11_02.sh [bake|ref|all] [from-map]
set -u
cd "$(dirname "$0")/../.."
what=${1:-all}; from=${2:-0}
if [[ $what == bake || $what == all ]]; then
  bash tools/pipeline/run.sh bake --bpro-all --wait || echo "BAKE FAILED"
fi
if [[ $what == ref || $what == all ]]; then
  for m in $(seq "$from" 20); do
    node tools/opt/ref5_prog.js run --maps "$m" --tag 2026-11-02-bal9 --budget 2000 --final-games 4 || { echo "REF5 FAILED at map $m"; exit 1; }
    echo "REF5 map $m done $(date +%H:%M)"
  done
fi
echo "HEAVY DONE"
