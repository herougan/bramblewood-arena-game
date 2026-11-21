#!/usr/bin/env bash
# MAPCTX (2026-11-21): skill measures on each map's own context (pool, fields, level), maps in the order given, within one time budget.
# Late maps' pools hold no vanilla card, so every map uses the global carriers (skill_canon anchors at bramble 15), played at the map's level.
# Usage: bash tools/pipeline/mapctx.sh <minutes> <map> [<map> ...]   keys: docs/balance/pipeline/state/mapctx-NN.json
cd "$(dirname "$0")/../.." || exit 1
end=$(( $(date +%s) + $1 * 60 )); shift
for m in "$@"; do
  left=$(( (end - $(date +%s)) / 60 )); [ "$left" -lt 5 ] && { echo "mapctx: out of time before map $m"; break; }
  f=$(printf 'docs/balance/pipeline/state/mapctx-%02d.json' "$m")
  echo "== map $m ($left min left)"
  bash tools/pipeline/run.sh measure --map "$m" --only-file "$f" --carriers soldier-ant,glass-golem,blessed-avatar,stable-colt,rivergate-recruit,lucky-hopper --minutes "$left" --wait 2>&1 | grep -E '^pipeline|^counts|over-priced|under-priced|no reading'
done
