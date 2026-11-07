#!/usr/bin/env bash
# 2026-11-07 (owner 08:54 #5, UI27-1): version.json's build must be index.html's BUILD_ID. A pushed pair that disagrees makes every
# page load ask to update, forever (8 of 30 deploys shipped that way: the build stamp was discarded after a rebuild). Exit 1 on a mismatch.
cd "$(dirname "$0")/../.." || exit 2
v=$(python3 -c "import json;print(json.load(open('version.json'))['build'])" 2>/dev/null)
h=$(grep -o "const BUILD_ID = '[0-9a-f]*'" index.html | head -1 | sed "s/.*'\([0-9a-f]*\)'/\1/")
if [ -z "$v" ] || [ "$v" != "$h" ]; then echo "BUILD PAIR MISMATCH: version.json $v, index.html $h (rebuild and commit both)"; exit 1; fi
echo "build pair ok ($v)"
