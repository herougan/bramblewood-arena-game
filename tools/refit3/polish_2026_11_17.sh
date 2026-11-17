#!/bin/bash
# 2026-11-17 (package REFIT3): the second stage. For each fight, the start is the nearer (300 games on SEED2) of REFIT2's best legal deck
# (docs/balance/refit2/refit2-fixes.jsonl, its apply:false line) and the wide search's deck (<wide accepted.jsonl>); then REFIT1's local
# search (tools/refit1/search_2026_11_16.js, unchanged: 1-4 copy swaps, whole-card replaces, paired moves read; strict legality: problemsFull
# empty, leaders kept) polishes it on fresh tune seeds, every legal move read (--noscore). Lines go to <polish.jsonl> (fx + accept, so a
# map's fights stay jointly legal); the deck-only levers (no Shield, no Health).
#   bash tools/refit3/polish_2026_11_17.sh <wide accepted.jsonl> <polish.jsonl> <log> CODE...
cd "$(dirname "$0")/../.." || exit 1
WIDE=$1; POL=$2; LOG=$3; shift 3
S1=${SEED1:-65300}; S2=${SEED2:-66300}
for c in "$@"; do
  node -e '
const X=require("./tools/legal1/lib_legal_2026_11_15.js"),G=X.G,fs=require("fs"),[c,wide,pol,s2]=process.argv.slice(1);
const rd=f=>fs.existsSync(f)?fs.readFileSync(f,"utf8").trim().split("\n").filter(Boolean).map(JSON.parse):[];
const fx={}; rd(pol).forEach(x=>{ if(x.deck&&x.key!==c) fx[x.key]=x.deck; });
const {m,n}=X.byCode[c], lead=d=>{const nn=Object.assign({},n,{deck:d}); G.NODE_MAP_HINT.set(nn,m.id); return JSON.stringify(G.skirmishLeadersOf(nn,m.id)||[]);}, l0=lead(n.deck);
const ok=d=>d&&!X.problemsFull(c,d,fx).length&&lead(d)===l0;
const cands=[["live",n.deck],["refit2",(rd("docs/balance/refit2/refit2-fixes.jsonl").find(x=>x.key===c)||{}).deck],["wide",(rd(wide).filter(x=>x.key===c).pop()||{}).deck]].filter(([,d])=>ok(d));
const band=rd("docs/balance/refit3/road/live-s7600.jsonl").find(x=>x.key===c), T=band.target;
const w=d=>{const nn=Object.assign({},n,{deck:d}); G.NODE_MAP_HINT.set(nn,m.id); return Math.round(G.simulateReferenceFight(m.id,nn,300,{seed0:+s2}).win*1000)/10;};
const r=cands.map(([k,d])=>({k,d,w:w(d)})).sort((a,b)=>Math.abs(a.w-T)-Math.abs(b.w-T));
console.log("START",c,"target",T,r.map(x=>x.k+" "+x.w).join(", "));
if(!r.length){ console.log("no legal start"); process.exit(0); }
fs.appendFileSync(pol, JSON.stringify({key:c,deck:r[0].k==="live"?null:r[0].d,shieldOverride:null,hqHp:null,tune:{w2:r[0].w,seed2:+s2,games:300},moves:["start "+r[0].k]})+"\n");' "$c" "$WIDE" "$POL" "$S2" >> "$LOG" 2>&1
  node tools/refit1/search_2026_11_16.js --code "$c" --fx "$POL" --accept "$POL" --from-accepted --noscore \
    --bands docs/balance/refit3/road/live-s7600.jsonl --out docs/balance/refit3/polish-2026-11-17.jsonl \
    --seed1 "$S1" --seed2 "$S2" --g1 "${G1:-40}" --g1max "${G1MAX:-200}" --g2 "${G2:-300}" --top "${TOP:-4}" --pred "${PRED:-12}" --rounds "${ROUNDS:-6}" >> "$LOG" 2>&1
done
echo "LANE DONE" >> "$LOG"
