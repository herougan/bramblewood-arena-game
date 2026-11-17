#!/usr/bin/env bash
# 2026-11-17 (package REFIT3): the joint legality gate for <fixes.jsonl> (apply:true lines; ALL=1: every line). No games.
#   1. problemsFull (tools/legal1, SKIR1's rules under SIDE2's holds + the map lines) for every road fight, live vs with the fixes:
#      the problem lines new with the fixes must be none (live: 21 lines on 19 fights);
#   2. tests/skir1-2026-11-11.js on a scratch worktree of HEAD with the fixes applied (tools/skirmish_pass.js apply) vs the live tree:
#      34 known failures, none new.
#   bash tools/refit3/gate_2026_11_17.sh docs/balance/refit3/refit3-fixes.jsonl
set -uo pipefail
cd "$(dirname "$0")/../.."
FX=$(realpath "$1"); OUT=$(mktemp -d)
node -e '
const X=require("./tools/legal1/lib_legal_2026_11_15.js"),fs=require("fs"),all=process.env.ALL==="1",fx={};
fs.readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean).map(JSON.parse).forEach(x=>{ if(x.deck&&(all||x.apply!==false)) fx[x.key]=x.deck; });
const P=o=>{const s=new Set(); for(const c of Object.keys(X.byCode)){ const d=o[c]||X.byCode[c].n.deck, oth=Object.assign({},o); delete oth[c]; X.problemsFull(c,d,oth).forEach(p=>s.add(c+": "+p)); } return s; };
const a=P({}),b=P(fx),nw=[...b].filter(x=>!a.has(x)),cl=[...a].filter(x=>!b.has(x)),fights=s=>new Set([...s].map(x=>x.split(":")[0])).size;
console.log(`problemsFull: live ${a.size} lines on ${fights(a)} fights; with the ${Object.keys(fx).length} fixes ${b.size} on ${fights(b)}`);
console.log("  new:", nw.length ? nw.join(" | ") : "none"); console.log("  cleared:", cl.length ? cl.join(" | ") : "none");' "$FX"
node tests/skir1-2026-11-11.js > "$OUT/live.txt" 2>&1
WT=$(mktemp -d "${TMPDIR:-/tmp}/refit3-gate-XXXX"); rmdir "$WT"
git worktree add -q --detach "$WT" HEAD
mkdir -p "$WT/docs/balance/refit3"
if [ "${ALL:-}" = 1 ]; then sed 's/"apply":false/"apply":true/' "$FX"; else cat "$FX"; fi > "$WT/docs/balance/refit3/_gate.jsonl"
(cd "$WT" && node tools/skirmish_pass.js apply --fixes=refit3/_gate && node tests/skir1-2026-11-11.js > "$OUT/fix.txt" 2>&1)
git worktree remove --force "$WT" >/dev/null 2>&1
echo "skir1 live: $(tail -1 "$OUT/live.txt")"; echo "skir1 with fixes: $(tail -1 "$OUT/fix.txt")"
echo "new with the fixes:"; comm -13 <(grep '✗' "$OUT/live.txt" | sort) <(grep '✗' "$OUT/fix.txt" | sort)
echo "cleared by the fixes:"; comm -23 <(grep '✗' "$OUT/live.txt" | sort) <(grep '✗' "$OUT/fix.txt" | sort)
rm -rf "$OUT"
