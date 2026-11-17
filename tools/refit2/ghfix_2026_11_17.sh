#!/usr/bin/env bash
# 2026-11-17 (package REFIT2): reads candidate fixes on GitHub's runners. A scratch worktree of HEAD gets the fixes written into its
# arena_app.js (tools/skirmish_pass.js apply; apply:false lines too, every line counts), the commit is force-pushed to a refit2-* scratch
# branch (never main or batch-*), and one road-measure run per seed plays only those fights (400 games). Fetch with
# tools/refit1/fetch_2026_11_16.sh <run-id> docs/balance/refit2 and rename to measure-fix-s<K>.jsonl (or append to it).
#   bash tools/refit2/ghfix_2026_11_17.sh <fixes.jsonl> <branch refit2-...> <tag> <seed>[,<seed>...]
set -euo pipefail
cd "$(dirname "$0")/../.."
FX=$(realpath "$1"); BR=$2; TAG=$3; SEEDS=$4
case "$BR" in refit2-*) ;; *) echo "branch must start with refit2-"; exit 1;; esac
ONLY=$(node -e 'console.log(require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l).key).join(","))' "$FX")
WT=$(mktemp -d "${TMPDIR:-/tmp}/refit2-wt-XXXX"); rmdir "$WT"
git worktree add -q --detach "$WT" HEAD
trap 'git worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT
mkdir -p "$WT/docs/balance/refit2"; sed 's/"apply":false/"apply":true/' "$FX" > "$WT/docs/balance/refit2/_ghfix.jsonl"
(cd "$WT" && node tools/skirmish_pass.js apply --fixes=refit2/_ghfix && rm docs/balance/refit2/_ghfix.jsonl \
  && git -c user.name=claude -c user.email=noreply@anthropic.com commit -qam "REFIT2 scratch: $TAG ($ONLY)" && git push -qf origin HEAD:refs/heads/"$BR")
for K in ${SEEDS//,/ }; do
  gh workflow run road-measure.yml --ref "$BR" -f games=400 -f seed="$K" -f tag="$TAG-s$K" -f only="$ONLY"
done
echo "pushed $BR, runs for seeds $SEEDS, only $ONLY"
