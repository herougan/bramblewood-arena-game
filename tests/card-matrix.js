#!/usr/bin/env node
// Card-vs-card auto-test (2026-10-03).
//
//   node tests/card-matrix.js            sampled run (each card vs 40 others) + squads + matches, checked against golden
//   node tests/card-matrix.js --full     every fieldable card vs every other card (≈77k duels, ~15s)
//   node tests/card-matrix.js --update   rewrite the golden file after an INTENDED behaviour change
//
// Auto-setup: no hand-written fixtures. Every pairing is generated from the card list and seeded
// from the card ids, so adding a card automatically adds its duels.
// Auto-test, three layers:
//   1. Invariants after every round (no NaN HP/attack, no dead card left on the board, no
//      duplicate uids, no negative resources) and no exceptions.            -> FAIL
//   2. Determinism: the same seed replayed gives the identical fight.        -> FAIL
//   3. Golden signatures: winner/rounds/HP/event histogram per fight are compared with
//      tests/golden/card-matrix.json, so ANY change in how two cards interact shows up as a
//      diff to review (accept with --update).                                -> FAIL until accepted
// Stalemates (both sides alive, castles untouched after 30 rounds) are reported for design review.
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness.js');

const args = new Set(process.argv.slice(2));
const FULL = args.has('--full'), UPDATE = args.has('--update');
const GOLDEN = path.join(__dirname, 'golden', FULL ? 'card-matrix-full.json' : 'card-matrix.json');
const defs = H.loadCardDefs();
const ids = H.fieldableIds(defs);
const t0 = Date.now();

const results = {};      // key -> signature
const failures = [];     // {key, kind, detail}
const stalemates = [];

function duelKey(kind, a, b, extra){ return `${kind}:${a}>${b}${extra?':'+extra:''}`; }
function record(key, spec){
  let res;
  try{ res = H.runBoard(spec); }
  catch(e){ failures.push({key, kind:'exception', detail: e.stack.split('\n').slice(0,3).join(' | ')}); return null; }
  if(res.invariantErrors.length) failures.push({key, kind:'invariant', detail: res.invariantErrors.slice(0,3).join(' | ')});
  const sig = H.fightSignature(res);
  results[key] = sig;
  return {res, sig};
}

// 1) 1v1 duels — each card on the left lane vs one opposing card.
const pairs = [];
if(FULL){ ids.forEach(a=> ids.forEach(b=> pairs.push([a,b]))); }
else { ids.forEach((a,i)=>{ for(let j=0;j<40;j++) pairs.push([a, ids[(i*7 + j*13 + 1) % ids.length]]); }); }
pairs.forEach(([a,b])=>{
  const key = duelKey('duel', a, b);
  const out = record(key, {seed: H.hashStr(key), A:[{id:a}], B:[{id:b}], hqHp:{A:30, B:30}, rounds:30});
  if(out && !out.res.over && out.sig.hp[0]===30 && out.sig.hp[1]===30 && out.sig.left[0] && out.sig.left[1]) stalemates.push(key);
});

// 2) Squads — 3v3 boards across lanes and battle modes, to cover adjacency/guardian/rally/area effects.
const MODES = ['gravity', 'open'];
const nSquads = FULL ? 3000 : 600;
for(let i=0;i<nSquads;i++){
  const r = H.seededRng(9000 + i);
  const pick = ()=> ids[Math.floor(r()*ids.length)];
  const lanes = ['left','right','left'];
  const A = [0,1,2].map(k=> ({id:pick(), side:lanes[k]})), B = [0,1,2].map(k=> ({id:pick(), side:lanes[(k+1)%3]}));
  const mode = MODES[i % MODES.length];
  const key = `squad${i}:${mode}:${A.map(c=>c.id).join('+')}>${B.map(c=>c.id).join('+')}`;
  record(key, {seed: 9000+i, battleMode: mode, A, B, hqHp:{A:40, B:40}, rounds:40});
}

// 3) Full matches — random legal 20-card decks, both seats played by the engine AI (the same
//    loop the Simulator uses), checked for exceptions, termination and sane end state.
const nMatches = FULL ? 1000 : 200;
function randomDeck(r){ const d = {}; let n = 0; while(n<20){ const id = ids[Math.floor(r()*ids.length)]; if((d[id]||0)>=3) continue; d[id]=(d[id]||0)+1; n++; } return d; }
for(let i=0;i<nMatches;i++){
  const r = H.seededRng(50000 + i);
  const A = randomDeck(r), B = randomDeck(r), mode = MODES[i % MODES.length];
  const key = `match${i}:${mode}`;
  try{
    const m = H.runMatch(A, B, {seed: 50000+i, battleMode: mode, maxRounds: 120});
    const inv = H.checkInvariants(m.players, 'end');
    if(inv.length) failures.push({key, kind:'invariant', detail: inv.slice(0,3).join(' | ')});
    results[key] = {w: m.winner, r: m.rounds, hp: [m.players[1].hq.hp, m.players[2].hq.hp]};
  }catch(e){ failures.push({key, kind:'exception', detail: e.stack.split('\n').slice(0,3).join(' | ')}); }
}

// Determinism: replay a sample and require identical signatures.
Object.keys(results).filter((k,i)=> k.startsWith('duel') && i % 25 === 0).forEach(key=>{
  const [, a, b] = /^duel:(.+)>(.+)$/.exec(key);
  const again = H.fightSignature(H.runBoard({seed: H.hashStr(key), A:[{id:a}], B:[{id:b}], hqHp:{A:30, B:30}, rounds:30}));
  if(JSON.stringify(again)!==JSON.stringify(results[key])) failures.push({key, kind:'nondeterministic', detail:'same seed gave a different fight'});
});

// Golden comparison.
let diffs = [];
if(UPDATE || !fs.existsSync(GOLDEN)){
  fs.mkdirSync(path.dirname(GOLDEN), {recursive:true});
  fs.writeFileSync(GOLDEN, JSON.stringify(results));
  console.log(`golden ${UPDATE ? 'updated' : 'created'}: ${path.relative(H.ROOT, GOLDEN)} (${Object.keys(results).length} fights)`);
}else{
  const gold = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  Object.keys(results).forEach(k=>{
    if(!(k in gold)) diffs.push(`new      ${k}`);
    else if(JSON.stringify(gold[k])!==JSON.stringify(results[k])) diffs.push(`changed  ${k}\n           was ${JSON.stringify(gold[k])}\n           now ${JSON.stringify(results[k])}`);
  });
  Object.keys(gold).forEach(k=>{ if(!(k in results)) diffs.push(`removed  ${k}`); });
}

const secs = ((Date.now()-t0)/1000).toFixed(1);
console.log(`card-matrix: ${pairs.length} duels, ${nSquads} squads, ${nMatches} matches in ${secs}s`);
console.log(`  failures: ${failures.length}   golden diffs: ${diffs.length}   stalemates (review): ${stalemates.length}`);
failures.slice(0,25).forEach(f=> console.log(`  FAIL [${f.kind}] ${f.key}\n       ${f.detail}`));
diffs.slice(0,25).forEach(d=> console.log('  DIFF '+d));
if(diffs.length>25) console.log(`  … ${diffs.length-25} more diffs (run with --update if the change is intended)`);
if(args.has('--stalemates')) stalemates.forEach(s=> console.log('  STALE '+s));
fs.mkdirSync(path.join(__dirname, 'out'), {recursive:true});
fs.writeFileSync(path.join(__dirname, 'out', 'card-matrix-report.json'), JSON.stringify({when:new Date().toISOString(), failures, diffs, stalemates}, null, 1));
process.exit(failures.length || diffs.length ? 1 : 0);
