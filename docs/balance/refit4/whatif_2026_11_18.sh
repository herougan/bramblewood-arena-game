#!/bin/bash
# 2026-11-18 (package REFIT4): what-ifs only (nothing applied): for the fights still too hard with their re-fitted legal deck, the Shield
# (down only) and then bramble Health that the search's lever bisection reaches (200 games, seed 85300); for decision REFIT4-1.
#   bash docs/balance/refit4/whatif_2026_11_18.sh CODE...
cd "$(dirname "$0")/../../.." || exit 1
for c in "$@"; do
  node docs/balance/refit4/search_2026_11_18.js --code "$c" --rounds 0 --levers shield,hp --g2 200 --seed2 85300 \
    --bands docs/balance/skirmish-pass-refit4-before-s9100.jsonl --out docs/balance/refit4/whatif-levers-2026-11-18.jsonl >> docs/balance/refit4/whatif.log 2>&1
done
echo "WHATIF DONE" >> docs/balance/refit4/whatif.log
