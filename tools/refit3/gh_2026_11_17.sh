#!/usr/bin/env bash
# 2026-11-17 (package REFIT3): REFIT2's ghfix (tools/refit2/ghfix_2026_11_17.sh) plus an optional in-branch card edit, for the owner's
# what-ifs (REFIT2-2 b: Fen Mink 1/10 -> 1/8). A scratch worktree of HEAD gets every line of <fixes.jsonl> written into arena_app.js
# (tools/skirmish_pass.js apply; apply:false lines too), SET edits canonical/cards.json in that worktree only, the commit is force-pushed
# to a refit3-* scratch branch, and one road-measure run per seed plays 400 games a fight. Nothing in this worktree changes.
#   bash tools/refit3/gh_2026_11_17.sh <fixes.jsonl|-> <branch refit3-...> <tag> <seed>[,<seed>...]
#   ONLY=5-6,5-4   only those fights (default: the fixes' fights; ONLY= empty: the whole road)
#   SET="fen-mink:health=8"   card edits, id:field=value[,field=value][;id:...]
set -euo pipefail
cd "$(dirname "$0")/../.."
FX=$1; BR=$2; TAG=$3; SEEDS=$4
case "$BR" in refit3-*) ;; *) echo "branch must start with refit3-"; exit 1;; esac
[ "$FX" = - ] || FX=$(realpath "$FX")
if [ "$FX" = - ]; then ONLY=${ONLY-}; else
  ONLY=${ONLY-$(node -e 'console.log(require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l).key).join(","))' "$FX")}; fi
WT=$(mktemp -d "${TMPDIR:-/tmp}/refit3-wt-XXXX"); rmdir "$WT"
git worktree add -q --detach "$WT" HEAD
trap 'git worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT
(cd "$WT"
 if [ "$FX" != - ]; then mkdir -p docs/balance/refit3; sed 's/"apply":false/"apply":true/' "$FX" > docs/balance/refit3/_gh.jsonl
   node tools/skirmish_pass.js apply --fixes=refit3/_gh; rm docs/balance/refit3/_gh.jsonl; fi
 if [ -n "${SET:-}" ]; then node -e '
   const fs=require("fs"),f="canonical/cards.json",j=JSON.parse(fs.readFileSync(f,"utf8")),arr=Array.isArray(j)?j:(j.cards||Object.values(j));
   for(const part of process.argv[1].split(";").filter(Boolean)){const [id,kv]=part.split(":"),c=arr.find(x=>x.id===id); if(!c) throw new Error("no card "+id);
     kv.split(",").forEach(x=>{const [k,v]=x.split("="); c[k]=+v;}); console.log("set",id,kv);}
   fs.writeFileSync(f,JSON.stringify(j,null,1)+"\n");' "$SET"; fi
 git -c user.name=claude -c user.email=noreply@anthropic.com commit -qam "REFIT3 scratch: $TAG (${ONLY:-whole road}${SET:+; $SET})"
 git push -qf origin HEAD:refs/heads/"$BR")
for K in ${SEEDS//,/ }; do
  gh workflow run road-measure.yml --ref "$BR" -f games=400 -f seed="$K" -f tag="$TAG-s$K" -f only="$ONLY"
done
echo "pushed $BR, runs for seeds $SEEDS, only ${ONLY:-all}"
