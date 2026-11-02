#!/usr/bin/env bash
# 2026-11-02 (package BAL11): run any simulation command under the pipeline's machine-wide lock (the same flock as run.sh's heavy steps),
# waiting for it, so a hand-run tool (skirmish_pass.js measure, bench.js, deck1) never plays beside another agent's sims on the 2 cores.
#   bash tools/pipeline/locked.sh <command> [args...]
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
COMMON="$(git rev-parse --git-common-dir 2>/dev/null || echo "$ROOT/.git")"
case "$COMMON" in /*) ;; *) COMMON="$ROOT/$COMMON" ;; esac
LOCK="${PIPELINE_LOCK:-$COMMON/bramble-pipeline.lock}"
exec 9>>"$LOCK"
echo "locked.sh: waiting for the lock ($(tr '\n' ' ' < "$LOCK" | tail -c 120))..." >&2
flock 9
: > "$LOCK"; echo "locked '$*' pid $$ since $(date +%H:%M:%S) in $ROOT" >> "$LOCK"
export PIPELINE_LOCK_HELD=1
"$@"
