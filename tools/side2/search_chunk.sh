#!/bin/bash
# 2026-11-13 (package SIDE2): the side maps' BPRO / PRO / WPRO searches in one chunk that ends itself before a 2-hour background limit
# (each map's result is a file, so the next chunk goes on where this one stopped).  bash tools/side2/search_chunk.sh [minutes=105]
cd "$(dirname "$0")/../.." || exit 1
S=mo,mq,mp,mg,ms,mz,mn,mj,mv,my,mi,mpd,m9,me,mx
T0=$(date +%s); BUDGET=${1:-105}
for k in bpro pro wpro; do
  L=$(( BUDGET - ($(date +%s) - T0) / 60 ))
  if [ "$L" -lt 5 ]; then echo "out of time before $k"; break; fi
  node tools/side2/refdecks_2026_11_13.js run --kind "$k" --maps "$S" --minutes "$L" 2>&1 | grep -v '^\s*$' | tail -20
done
ls docs/balance/side2/refdecks/*/*.json | wc -l
