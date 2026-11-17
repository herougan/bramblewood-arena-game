#!/usr/bin/env bash
# 2026-11-17 (package REFIT2): the joint gate. tests/skir1-2026-11-11.js on the live tree and on a scratch worktree of HEAD with the
# apply:true lines of <fixes.jsonl> written in (tools/skirmish_pass.js apply); prints the failures that are new with the fixes and the ones
# they clear. No games are played. Nothing in this worktree changes.
#   bash tools/refit2/gate_2026_11_17.sh docs/balance/refit2/refit2-fixes.jsonl
set -uo pipefail
cd "$(dirname "$0")/../.."
FX=$(realpath "$1"); OUT=$(mktemp -d)
node tests/skir1-2026-11-11.js > "$OUT/live.txt" 2>&1
WT=$(mktemp -d "${TMPDIR:-/tmp}/refit2-gate-XXXX"); rmdir "$WT"
git worktree add -q --detach "$WT" HEAD
mkdir -p "$WT/docs/balance/refit2"; cp "$FX" "$WT/docs/balance/refit2/_gate.jsonl"
(cd "$WT" && node tools/skirmish_pass.js apply --fixes=refit2/_gate && node tests/skir1-2026-11-11.js > "$OUT/fix.txt" 2>&1)
git worktree remove --force "$WT" >/dev/null 2>&1
echo "live: $(tail -1 "$OUT/live.txt")"; echo "with fixes: $(tail -1 "$OUT/fix.txt")"
echo "new with the fixes:"; comm -13 <(grep '✗' "$OUT/live.txt" | sort) <(grep '✗' "$OUT/fix.txt" | sort)
echo "cleared by the fixes:"; comm -23 <(grep '✗' "$OUT/live.txt" | sort) <(grep '✗' "$OUT/fix.txt" | sort)
rm -rf "$OUT"
