#!/usr/bin/env bash
# 2026-11-16 (package INFRA1): downloads a "Road measure" run's artifact (.github/workflows/road-measure.yml) into docs/balance/:
# skirmish-pass-<tag>.jsonl and skirmish-pass-<tag>-summary.md. "latest" = the newest successful run. gh run uses REST only.
#   bash tools/ci/fetch_measure.sh <run-id|latest>
set -euo pipefail
cd "$(dirname "$0")/../.."
REPO="${GH_REPO:-herougan/bramblewood-arena-game}"
id="${1:?usage: fetch_measure.sh <run-id|latest>}"
if [ "$id" = latest ]; then
  id=$(gh run list -R "$REPO" --workflow road-measure.yml --status success -L 1 --json databaseId -q '.[0].databaseId')
  [ -n "$id" ] || { echo "no successful road-measure run yet"; exit 1; }
fi
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
gh run download "$id" -R "$REPO" -n road-measure -D "$tmp"
cp "$tmp"/skirmish-pass-*.jsonl "$tmp"/skirmish-pass-*-summary.md docs/balance/
ls "$tmp" | sed 's|^|docs/balance/|'
cat "$tmp"/skirmish-pass-*-summary.md
