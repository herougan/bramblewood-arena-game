#!/usr/bin/env bash
# SPEED1 (2026-10-31): the balance pipeline, one command a step, no Claude tokens while it runs.
#   tools/pipeline/run.sh <measure|price|refit|bake|tournament|test|all> [options]
#   tools/pipeline/run.sh --wait [SECONDS] <step> ...   wait for the lock (default: forever) instead of exiting when another heavy step runs
#   tools/pipeline/run.sh --no-lock <step> ...          skip the lock (a test of the pipeline itself)
# The heavy steps (measure, bake, tournament, test, all) hold one flock, shared by every checkout of the repo (the machine has 2 cores; two
# simulations at once slow each other and both lose their timings). Without --wait a second heavy call exits 75 with a message that names
# the holder. price and refit do not simulate and run any time. Each step ends in a JSON summary in docs/balance/pipeline/ and prints <= 20 lines.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
WAIT=""; NOLOCK=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wait) if [[ "${2:-}" =~ ^[0-9]+$ ]]; then WAIT="$2"; shift; else WAIT="forever"; fi; shift ;;
    --no-lock) NOLOCK=1; shift ;;
    *) break ;;
  esac
done
STEP="${1:-help}"
if [[ "$STEP" == "help" || "$STEP" == "-h" || "$STEP" == "--help" ]]; then sed -n '2,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0; fi
HEAVY=" measure bake tournament test all "
if [[ -n "${PIPELINE_LOCK_HELD:-}" || -n "$NOLOCK" || "$HEAVY" != *" $STEP "* ]]; then
  exec node tools/pipeline/run.js "$@"
fi
COMMON="$(git rev-parse --git-common-dir 2>/dev/null || echo "$ROOT/.git")"
case "$COMMON" in /*) ;; *) COMMON="$ROOT/$COMMON" ;; esac
LOCK="${PIPELINE_LOCK:-$COMMON/bramble-pipeline.lock}"
exec 9>>"$LOCK"
if [[ -z "$WAIT" ]]; then
  if ! flock -n 9; then
    echo "pipeline busy: another heavy step holds the lock ($(tr '\n' ' ' < "$LOCK" | tail -c 200))." >&2
    echo "wait for it, or call again with: tools/pipeline/run.sh --wait [SECONDS] $*" >&2
    exit 75
  fi
elif [[ "$WAIT" == "forever" ]]; then
  echo "pipeline: waiting for the lock ($(tr '\n' ' ' < "$LOCK" | tail -c 120))..." >&2
  flock 9
else
  if ! flock -w "$WAIT" 9; then echo "pipeline busy: still locked after ${WAIT}s ($(tr '\n' ' ' < "$LOCK" | tail -c 200))." >&2; exit 75; fi
fi
# the holder note (flock is on the file descriptor; the text is only for the next caller's message)
: > "$LOCK"; echo "step '$*' pid $$ since $(date +%H:%M:%S) in $ROOT" >> "$LOCK"
export PIPELINE_LOCK_HELD=1
node tools/pipeline/run.js "$@"
