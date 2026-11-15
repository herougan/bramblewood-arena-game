#!/bin/bash
# 2026-11-15 (package BAL-LEGAL1): the final legality gate and the fresh-seed measure, in a scratch copy of the repo (never the branch's arena_app.js).
#   bash tools/legal1/verify_2026_11_15.sh <scratch copy> <fixes.jsonl> test            # apply the fixes, tests/skir1: lines that are new vs the live decks
#   bash tools/legal1/verify_2026_11_15.sh <scratch copy> <fixes.jsonl> measure <tag> <codes,comma> [seeds]   # 400 games per seed set (default 5100 6100 4100)
set -e
SC=$1; FX=$2; CMD=$3; HERE="$(cd "$(dirname "$0")/../.." && pwd)"
cp "$HERE/arena_app.js" "$SC/arena_app.js"                       # the live decks, then the fixes on top
mkdir -p "$SC/docs/balance/legal1"; cp "$FX" "$SC/docs/balance/legal1/_verify-fixes.jsonl"
cd "$SC"
if [ ! -f "$SC/.skir1-live.txt" ]; then node tests/skir1-2026-11-11.js > "$SC/.skir1-live.txt" || true; fi
node tools/skirmish_pass.js apply --fixes=legal1/_verify-fixes
if [ "$CMD" = test ]; then
  node tests/skir1-2026-11-11.js > "$SC/.skir1-fix.txt" || true
  echo "new failures (not in the live run):"; grep '✗' "$SC/.skir1-fix.txt" | grep -vxF -f <(grep '✗' "$SC/.skir1-live.txt") || echo "  none"
  echo "gone (live failures the fixes clear):"; grep '✗' "$SC/.skir1-live.txt" | grep -vxF -f <(grep '✗' "$SC/.skir1-fix.txt") || echo "  none"
  tail -1 "$SC/.skir1-fix.txt"
elif [ "$CMD" = measure ]; then
  TAG=$4; ONLY=$5; SEEDS=${6:-"5100 6100 4100"}
  for s in $SEEDS; do node tools/skirmish_pass.js measure 400 --seed=$s --tag=$TAG-s$s --only=$ONLY &
    while [ "$(jobs -r | wc -l)" -ge 2 ]; do wait -n; done; done; wait
fi
