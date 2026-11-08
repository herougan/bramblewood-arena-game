#!/usr/bin/env node
// ENG37 (2026-11-08): fixed-seed before / after of the engine on the cards each item touches.
//   node tools/eng37_proof_2026_11_08.js <before-root> [after-root] [--n=40] [--strict]
// before-root: a copy of the repo before the package (e.g. `git archive origin/batch-1023e | tar -x -C <dir>`); after-root: this repo.
// Item 1 (Reach) changes fights on purpose: for every card with Reach, board fights where it has an empty lane (2 of it against 1 foe, and
// 3 against 2) and full matches (4 copies + Map 3 cards against Map 3's cards, 16 a side, both seats, the engine's AI) are run on both engines with the same
// seeds; the script lists how many differ and side A's wins before -> after. Items 3 and 4 (Shield's armor, Shell's when) must change nothing
// while no card carries the parameter: every board fight of the Shield and Shell cards is compared by its fightSignature (--strict exits 1 on a
// difference there).
'use strict';
const path = require('path');
const POS = process.argv.slice(2).filter(a=> !/^--/.test(a));
const before = path.resolve(POS[0] || ''), after = path.resolve(POS[1] || path.join(__dirname, '..'));
if(!POS[0]){ console.error('usage: node tools/eng37_proof_2026_11_08.js <before-root> [after-root]'); process.exit(2); }
const HB = require(path.join(before, 'tests/lib/harness.js')), HA = require(path.join(after, 'tests/lib/harness.js'));
const defsB = HB.loadCardDefs(), defsA = HA.loadCardDefs();
const N = Number((process.argv.find(a=> /^--n=/.test(a)) || '--n=40').slice(4));
const ids = Object.keys(defsA).filter(id=> defsB[id] && !defsA[id].token && !defsA[id].test && !/^test-/.test(id));
const e = id=> (defsA[id].effects || {});
const asDeck = list=> list.reduce((m, id)=> (m[id] = (m[id] || 0) + 1, m), {});
const sig = (H, r)=> JSON.stringify(H.fightSignature(r));
const FOES = ['peak-condor', 'oystercatcher', 'razorbill', 'mountain-hare', 'swamp-alligator', 'glacier-yak'].filter(id=> defsA[id]);
const out = [];
// ---- Item 1: Reach ----
const reach = ids.filter(id=> e(id).reach);
out.push('Item 1 (Reach): ' + reach.length + ' cards: ' + reach.join(', '));
reach.forEach((id, i)=>{ let n = 0, d = 0, wb = 0, wa = 0, aimed = 0;
  FOES.forEach((f, j)=>{ [[2, 1], [3, 2]].forEach(([na, nb], k)=>{ for(let s = 1; s <= 3; s++){ const seed = 37000 + i * 101 + j * 11 + k * 5 + s; n++;
    const spec = defs=> ({defs, seed, rounds: 14, A: Array(na).fill({id}), B: Array(nb).fill({id: f})});
    const rb = HB.runBoard(spec(defsB)), ra = HA.runBoard(spec(defsA));
    if(sig(HB, rb) !== sig(HA, ra)) d++; if(rb.winner === 1) wb++; if(ra.winner === 1) wa++;
    aimed += (ra.events || []).filter(x=> x.type === 'statusFx' && x.kind === 'reachAim').length; } }); });
  out.push('  board ' + id + ': ' + n + ' fights, ' + d + ' differ, ' + aimed + ' diagonal strikes; side A wins ' + wb + ' -> ' + wa); });
// the matches (16 cards a side): the Reach card x4 + six of Gannet Cliffs' cards x2 against its eight x2 (Map 3's Flyers and shore units);
// each seed is played with the decks in both seats, so the win count is out of 2N
const FOE = ['golden-eagle-diver', 'puffin-diver', 'peregrine-stooper', 'peak-condor', 'razorbill', 'oystercatcher', 'fiddler-crab-swarm', 'feral-tomcat'].filter(id=> defsA[id]);
reach.forEach(id=>{ let wb = 0, wa = 0, d = 0;
  for(let s = 1; s <= N; s++){ const seed = 38000 + s, deck = [id, id, id, id].concat(FOE.slice(2).flatMap(f=> [f, f])), foe = FOE.flatMap(f=> [f, f]);
    for(const seat of [1, 2]){ const [x, y] = seat === 1 ? [deck, foe] : [foe, deck];
      const rb = HB.runMatch(asDeck(x), asDeck(y), {defs: defsB, seed}), ra = HA.runMatch(asDeck(x), asDeck(y), {defs: defsA, seed});
      if(rb.winner === seat) wb++; if(ra.winner === seat) wa++; if(rb.winner !== ra.winner || rb.rounds !== ra.rounds) d++; } }
  out.push('  match ' + id + ': ' + (2 * N) + ' matches, ' + d + ' differ (winner or length); deck wins ' + wb + ' -> ' + wa); });
// ---- Items 3 / 4: Shield's armor, Shell's when (on no card: nothing moves) ----
const carriers = ids.filter(id=> e(id).shield || e(id).shell);
const withParam = ids.filter(id=> e(id).shieldArmor || e(id).shellWhen);
let fights = 0, diff = 0; const diffs = [];
carriers.forEach((id, i)=> FOES.slice(0, 4).forEach((f, j)=>{ for(let s = 1; s <= 2; s++){ const seed = 39000 + i * 17 + j * 3 + s; fights++;
  const spec = defs=> ({defs, seed, rounds: 14, A: [{id}, {id}], B: [{id: f}, {id: f}]});
  if(sig(HB, HB.runBoard(spec(defsB))) !== sig(HA, HA.runBoard(spec(defsA)))){ diff++; if(diffs.length < 20) diffs.push(id + ' vs ' + f + ' seed ' + seed); } } }));
out.push('Items 3 / 4 (Shield armor, Shell when; carried by ' + (withParam.length ? withParam.join(', ') : 'no card') + '): ' + carriers.length + ' Shield / Shell cards, ' + fights + ' board fights, ' + diff + ' differ');
diffs.forEach(x=> out.push('  DIFF ' + x));
console.log(out.join('\n'));
if(process.argv.includes('--strict') && diff && !withParam.length) process.exit(1);
