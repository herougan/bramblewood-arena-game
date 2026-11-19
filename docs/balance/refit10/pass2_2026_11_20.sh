#!/bin/bash
# 2026-11-20 (package REFIT10): the second pass for the two fights pass 1 left 5+ off (19-A-7 at 41.9, 19-A-8 at 58.8 on seed 272300):
# each from its pass-1 deck (--from-accepted, the other pass-1 decks in place via --fx acc.jsonl), REFIT9's pass-2 breadth (--pred 10 --top 4),
# --g1 40, fresh search seeds 281300 / 282300; results to acc2.jsonl (fixes_2026_11_20.js reads it over acc.jsonl).
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit10
for c in 19-A-7 19-A-8; do
  node $P/search_2026_11_20.js --code $c --from-accepted --fx $P/acc.jsonl --accept $P/acc2.jsonl \
    --bands $P/skirmish-pass-rel5.jsonl --out $P/search-2026-11-20.jsonl --seed1 281300 --seed2 282300 \
    --g1 40 --g1max 60 --g2 160 --top 4 --pred 10 --rounds 6 > $P/pass2-$c.log 2>&1 &
done
wait
