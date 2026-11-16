#!/usr/bin/env bash
# 2026-11-16 (package REFIT1): waits for a road-measure run, fetches its rows (tools/ci/fetch_measure.sh) and moves the jsonl into a
# REFIT1 folder (default docs/balance/refit1/), dropping the summary file.
#   bash tools/refit1/fetch_2026_11_16.sh <run-id> [dest dir]
set -euo pipefail
cd "$(dirname "$0")/../.."
id=$1; dest=${2:-docs/balance/refit1}
gh run watch "$id" --exit-status > /dev/null 2>&1 || echo "run $id did not succeed (fetching what it printed)"
f=$(bash tools/ci/fetch_measure.sh "$id" | grep '\.jsonl$' | head -1)
mkdir -p "$dest"; mv "$f" "$dest/"; rm -f "${f%.jsonl}-summary.md"
echo "$dest/$(basename "$f") $(wc -l < "$dest/$(basename "$f")") rows"
