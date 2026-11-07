#!/usr/bin/env node
// ENG36 (2026-11-08): fixed-seed before / after of the engine on the cards each item touches.
//   node tools/eng36_proof_2026_11_08.js <before-root> [after-root]
// before-root: a copy of the repo before the package (e.g. `git archive origin/batch-1023e | tar -x -C <dir>`); after-root: this repo.
// Item 1 (status Resist / Weakness / Immune) must change nothing while no card carries a 'status:<key>' entry: every board fight and full
// match of the status-dealing cards and the resist-carrying cards is compared by its fightSignature (winner, rounds, castles, the event
// histogram and an order-sensitive hash of every event). Items 2, 3 and 5 change fights on purpose: the script lists what moved for the
// Thanatosis cards, the Hoard cards and a Level 10 Bulwark.
'use strict';
const path = require('path');
const POS = process.argv.slice(2).filter(a=> !/^--/.test(a));
const before = path.resolve(POS[0] || ''), after = path.resolve(POS[1] || path.join(__dirname, '..'));
if(!POS[0]){ console.error('usage: node tools/eng36_proof_2026_11_08.js <before-root> [after-root]'); process.exit(2); }
const HB = require(path.join(before, 'tests/lib/harness.js')), HA = require(path.join(after, 'tests/lib/harness.js'));
const defsB = HB.loadCardDefs(), defsA = HA.loadCardDefs();
const STATUS_KEYS = ['freeze', 'sleep', 'stunOnHit', 'paralyze', 'blind', 'tipsy', 'confuse', 'shock', 'stagger', 'poison', 'greaterPoison', 'bleed', 'hemorrhage', 'web', 'brittle', 'daunt', 'scar', 'corrode', 'strangle', 'tangle', 'wither', 'decay', 'toxin', 'poisonGas', 'absoluteZero', 'silence', 'stymie', 'petrify'];
const ids = HA.fieldableIds(defsA).filter(id=> defsB[id]);
const e = id=> (defsA[id].effects || {});
const touched = id=> e(id).hoard || e(id).thanatosis; // items 3 and 5 change these on purpose
const statusCards = ids.filter(id=> !touched(id) && (STATUS_KEYS.some(k=> e(id)[k]) || (e(id).triggers || []).some(t=> ['stun', 'poison', 'bleed', 'silence', 'stymie', 'petrify', 'exhaust', 'vulnerable', 'stench'].includes(t.do))));
const resistCards = ids.filter(id=> !touched(id) && ((defsA[id].resist || []).length || (e(id).resist || []).length || (e(id).weakness || []).length || (e(id).immune || []).length));
const foes = ['swamp-alligator', 'mountain-hare', 'alpine-swift', 'eyrie-warden', 'glacier-yak'].filter(id=> defsA[id]);
function boardSig(H, defs, A, B, seed){ return JSON.stringify(H.fightSignature(H.runBoard({defs, seed, rounds: 14, A: A.map(id=> ({id})), B: B.map(id=> ({id}))}))); }
const asDeck = list=> list.reduce((m, id)=> (m[id] = (m[id] || 0) + 1, m), {}); // runMatch takes {id: copies}
function matchSig(H, defs, dA, dB, seed){ const r = H.runMatch(asDeck(dA), asDeck(dB), {defs, seed, recordEvents: true}); return JSON.stringify({w: r.winner, r: r.rounds, n: (r.events || []).length, h: H.hashStr(JSON.stringify((r.events || []).filter(x=> x.type !== 'triggerFired').map(x=> [x.type, x.dmg, x.amount, x.targetUid]))).toString(36)}); }
let fights = 0, diff = 0; const diffs = [];
const pool = [...new Set(statusCards.concat(resistCards))];
pool.forEach((id, i)=>{
  const vs = [foes[i % foes.length], resistCards[i % Math.max(1, resistCards.length)] || foes[0]];
  vs.forEach((f, j)=>{ for(let s = 1; s <= 2; s++){ const seed = 7000 + i * 13 + j * 5 + s; fights++;
    const a = boardSig(HB, defsB, [id, id], [f, f], seed), b = boardSig(HA, defsA, [id, id], [f, f], seed);
    if(a !== b){ diff++; if(diffs.length < 20) diffs.push(['board', id, f, seed]); } } });
});
let matches = 0, mdiff = 0;
for(let i = 0; i < pool.length; i += 3){ const deck = pool.slice(i, i + 3).flatMap(id=> [id, id, id, id]); const foe = foes.flatMap(id=> [id, id, id]);
  for(let s = 1; s <= 2; s++){ matches++; const seed = 9100 + i + s; const a = matchSig(HB, defsB, deck, foe, seed), b = matchSig(HA, defsA, deck, foe, seed); if(a !== b){ mdiff++; if(diffs.length < 30) diffs.push(['match', pool.slice(i, i + 3).join('+'), seed]); } } }
console.log('Item 1 (status resistances, on no card): ' + pool.length + ' cards (' + statusCards.length + ' status-dealing, ' + resistCards.length + ' resist-carrying)');
console.log('  board fights: ' + fights + ', differ: ' + diff + ';  full matches: ' + matches + ', differ: ' + mdiff);
diffs.forEach(d=> console.log('  DIFF ' + d.join(' ')));
// Items 3 and 5: what moved
const changed = ids.filter(touched);
changed.forEach((id, i)=>{ let n = 0, d = 0, wb = 0, wa = 0;
  foes.forEach((f, j)=>{ for(let s = 1; s <= 4; s++){ const seed = 8000 + i * 31 + j * 7 + s; n++;
    const rb = HB.runBoard({defs: defsB, seed, rounds: 14, A: [{id}, {id}], B: [{id: f}, {id: f}]}), ra = HA.runBoard({defs: defsA, seed, rounds: 14, A: [{id}, {id}], B: [{id: f}, {id: f}]});
    if(JSON.stringify(HB.fightSignature(rb)) !== JSON.stringify(HA.fightSignature(ra))) d++; if(rb.winner === 1) wb++; if(ra.winner === 1) wa++; } });
  console.log('Item ' + (e(id).hoard ? '5 Hoard ' + JSON.stringify(e(id).hoard) : '3 Thanatosis') + ' ' + id + ': ' + n + ' board fights (no Lumber on a bare board), ' + d + ' differ; side A wins ' + wb + ' -> ' + wa);
});
// Full matches (the engine's AI on both seats, Lumber in play): the Hoard and Thanatosis cards x4 with fillers, and the summoners at Level 5
// and Level 10 (levelled copies: level / baseLevel set, stats from the Forge curve, as the app's statsAtLevel builds them), before / after.
const BB = require(path.join(after, 'bramblewood-budget.js'));
function lv(defs, id, L){ const d = defs[id], nid = id + '@' + L; if(defs[nid]) return nid; const c = BB.forgeCurve(Object.assign({}, d, {obtainMap: d.obtainMap || 0}), 1, L).rows[L] || {};
  defs[nid] = Object.assign({}, d, {id: nid, derivedFrom: id, attack: c.attack != null ? c.attack : d.attack, health: c.health != null ? c.health : d.health, level: L, baseLevel: 1}); return nid; }
const FILL = ['mountain-hare', 'alpine-swift', 'glacier-yak'].filter(id=> defsA[id]), FOE = ['swamp-alligator', 'eyrie-warden', 'mountain-hare', 'alpine-swift', 'glacier-yak'].filter(id=> defsA[id]);
function rate(id, L, n){ let wb = 0, wa = 0, d = 0;
  for(let s = 1; s <= n; s++){ const seed = 12000 + s;
    const deck = defs=> [id, id, id, id].map(x=> L ? lv(defs, x, L) : x).concat(FILL.flatMap(f=> [f, f]).map(x=> L ? lv(defs, x, L) : x)), foe = defs=> FOE.flatMap(f=> [f, f]).map(x=> L ? lv(defs, x, L) : x);
    const rb = HB.runMatch(asDeck(deck(defsB)), asDeck(foe(defsB)), {defs: defsB, seed}), ra = HA.runMatch(asDeck(deck(defsA)), asDeck(foe(defsA)), {defs: defsA, seed});
    if(rb.winner === 1) wb++; if(ra.winner === 1) wa++; if(rb.winner !== ra.winner || rb.rounds !== ra.rounds) d++; }
  return {wb, wa, d, n}; }
const N = Number((process.argv.find(a=> /^--n=/.test(a)) || '--n=40').slice(4));
changed.forEach(id=>{ const r = rate(id, 0, N); console.log('Match ' + id + ' (' + (e(id).hoard ? 'Hoard ' + e(id).hoard : 'Thanatosis') + '): ' + r.n + ' matches, ' + r.d + ' differ; deck wins ' + r.wb + ' -> ' + r.wa); });
const SUMMONERS = ids.filter(id=> { const x = e(id); return x.bulwark || x.onDeathSpawn || x.onAttackedSpawn || (x.triggers || []).some(t=> t.do === 'spawnCard'); }).filter(id=> !/^test-/.test(id));
[5, 10].forEach(L=> SUMMONERS.forEach(id=>{ const r = rate(id, L, Math.max(10, Math.round(N / 2))); console.log('Item 2 L' + L + ' ' + id + ': ' + r.n + ' matches, ' + r.d + ' differ; deck wins ' + r.wb + ' -> ' + r.wa); }));
if(process.argv.includes('--strict') && (diff || mdiff)) process.exit(1);
