#!/usr/bin/env node
// 2026-11-24 (package ENG16, owner 11-23 23:39 #16: "Corrode and Daunt seem to be stacking"):
//   1. Corrode N is refreshed to the larger value, not added: one source every round keeps N (was N, 2N, 3N ... for good, the round's guard
//      re-armed by each hit so no stack ever wore off); two sources in one round = the larger; a weaker hit never lowers it; after the last
//      hit it fades 1 a round (the round of the hit kept). All three ways in: the swing, a melee skill hit (Cleave) and Acid Bolt.
//   2. Daunt N keeps the owner's 10-12 rule ("If this happens multiple times, his attack is reduced by N multiple times"): marks add, two
//      sources and one source alike, each to the end of the round after its hit, so one Daunt 2 unit hitting every round cuts 4 once its
//      second hit lands.
//   3. The pips: the replay snapshot carries last round's Daunt marks, the replay's 😨 pip shows the cut the engine applies, the live patch
//      draws the Daunt pips (it had none), a shallow replay copy never adds to the engine's marks; the 🧪 pip follows the engine's total.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:500, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e16-cor1': U('e16-cor1', {corrode:1}), 'e16-cor2': U('e16-cor2', {corrode:2}), 'e16-cor3': U('e16-cor3', {corrode:3}),
  'e16-dau1': U('e16-dau1', {daunt:1}), 'e16-dau2': U('e16-dau2', {daunt:2}),
  'e16-acid': U('e16-acid', {acidBolt:1}, {attack:0}),
  'e16-cleave': U('e16-cleave', {sweep:1, corrode:2}, {attack:1}),
  'e16-tgt': U('e16-tgt', {}, {attack:10, health:900}),
  'e16-wall': U('e16-wall', {}, {attack:0, health:900, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 16), {recordEvents:true, battleMode:'open', rules:{}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:900, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:900, effects:{}})}}; }
function seat(e, P, pid){ const pl = P[pid], cs = all(pl);
  pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(P[pid]).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot; seat(e, P, pid); return c; }
function drop(e, P, pid, c){ const pl = P[pid]; ['left', 'center', 'right'].forEach(r=> pl.row[r] = pl.row[r].filter(x=> x !== c)); seat(e, P, pid); }
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; }; // side A (the appliers) strikes first
const swing = (e, P, c)=>{ const ev = []; e.debugAttack(P, so, c.uid, {}, ev); return ev; }; // one swing, no upkeep, same round
const tgtDmg = (ev, t)=> ev.filter(x=> x.type === 'hit' && x.attUid === t.uid).reduce((s, x)=> s + (x.dmg || 0), 0)
  + ev.filter(x=> x.type === 'hitHQ' && x.attUid === t.uid).reduce((s, x)=> s + (x.dmg || x.amount || 0), 0);
const dauntSum = c=> (c.daunts || []).reduce((s, x)=> s + x.n, 0);

// ---- 1. Corrode: refreshed to the larger, not added -------------------------------------------------------------------------------------------
{ const {e, P} = mk(1); put(e, P, 1, 'e16-cor2', 0); const t = put(e, P, 2, 'e16-tgt', 0); const vals = [], dmg = [];
  for(let r = 0; r < 4; r++){ const ev = round(e, P); vals.push(t.corrode); dmg.push(tgtDmg(ev, t)); }
  ok(vals.join() === '2,2,2,2', `1a one source, Corrode 2, every round: stays 2 (${vals}; was 2,4,6,8)`);
  ok(dmg.join() === '8,8,8,8', `1a ... and the target swings for 10 - 2 every round (${dmg}; was 8,6,4,2)`); }
{ const {e, P} = mk(2); const a = put(e, P, 1, 'e16-cor3', 0); const t = put(e, P, 2, 'e16-tgt', 0);
  round(e, P); round(e, P); ok(t.corrode === 3, `1b Corrode 3 hit two rounds running: 3 (${t.corrode}; was 6)`);
  drop(e, P, 1, a); const vals = [], dmg = [];
  for(let r = 0; r < 4; r++){ const ev = round(e, P); vals.push(t.corrode); dmg.push(tgtDmg(ev, t)); }
  ok(vals.join() === '2,1,0,0', `1b no more hits: it fades 1 a round (${vals})`);
  ok(dmg.join() === '7,8,9,10', `1b ... and the target's swing comes back a point a round (${dmg})`); }
{ const {e, P} = mk(3); const t = put(e, P, 2, 'e16-wall', 0); const a1 = put(e, P, 1, 'e16-cor1', 0);
  const ev1 = swing(e, P, a1); drop(e, P, 1, a1); const a2 = put(e, P, 1, 'e16-cor2', 0); const ev2 = swing(e, P, a2);
  ok(t.corrode === 2, `1c two sources in one round (Corrode 1, then 2): the larger, 2 (${t.corrode}; was 3)`);
  const fx = [...ev1, ...ev2].filter(x=> x.type === 'statusFx' && x.kind === 'corrode');
  ok(fx.length === 2 && fx.map(x=> x.amount).join() === '1,2' && fx.map(x=> x.total).join() === '1,2', `1c ... each statusFx says its N and the unit's total (${fx.map(x=> x.amount + '/' + x.total)})`);
  drop(e, P, 1, a2); const a3 = put(e, P, 1, 'e16-cor1', 0); const ev3 = swing(e, P, a3);
  ok(t.corrode === 2 && ev3.some(x=> x.type === 'statusFx' && x.kind === 'corrode' && x.amount === 1 && x.total === 2), `1c a weaker hit (Corrode 1) never lowers it (${t.corrode})`);
  drop(e, P, 1, a3); round(e, P); ok(t.corrode === 2, `1c ... and refreshes it: the round of a hit keeps it (${t.corrode})`);
  round(e, P); ok(t.corrode === 1, `1c ... then it fades (${t.corrode})`); }
{ const {e, P} = mk(4); put(e, P, 1, 'e16-cleave', 0); const ws = [-1, 0, 1].map(s=> put(e, P, 2, 'e16-wall', s));
  round(e, P); round(e, P); round(e, P);
  ok(ws.every(w=> w.corrode === 2), `1d Cleave's side hits (the melee skill path) refresh too: 2 on all three after 3 rounds (${ws.map(w=> w.corrode)}; was 6)`); }
{ const {e, P} = mk(5); put(e, P, 1, 'e16-acid', 0); const t = put(e, P, 2, 'e16-wall', 0); const vals = [];
  for(let r = 0; r < 3; r++){ round(e, P); vals.push(t.corrode); }
  ok(vals.join() === '1,1,1', `1e Acid Bolt every round: Corrode 1, refreshed (${vals}; was 1,2,3)`); }
{ const {e, P} = mk(6); const t = put(e, P, 2, 'e16-wall', 0); t.corrode = 3; const a = put(e, P, 1, 'e16-acid', 0); round(e, P);
  ok(t.corrode === 3, `1e Acid Bolt's 1 on a unit at Corrode 3: still 3, the round of the hit kept (${t.corrode})`); void a; }

// ---- 2. Daunt: marks add (the owner's 10-12 rule), each to the end of the next round ----------------------------------------------------------
{ const {e, P} = mk(7); put(e, P, 1, 'e16-dau2', 0); const t = put(e, P, 2, 'e16-tgt', 0); const dmg = [], left = [];
  for(let r = 0; r < 4; r++){ const ev = round(e, P); dmg.push(tgtDmg(ev, t)); left.push(dauntSum(t)); }
  ok(dmg.join() === '8,6,6,6', `2a one source, Daunt 2, every round: -2, then -4 (last round's mark and this round's add) (${dmg})`);
  ok(left.join() === '2,2,2,2' && t.daunts.length === 1 && t.daunts[0].until === 5, `2a ... after each round's end only that round's mark is left, until the next round (${left}; until ${t.daunts[0] && t.daunts[0].until})`); }
{ const {e, P} = mk(8); const t = put(e, P, 2, 'e16-tgt', 0); const a1 = put(e, P, 1, 'e16-dau2', 0);
  swing(e, P, a1); swing(e, P, a1); ok(dauntSum(t) === 4 && t.daunts.length === 2, `2b one source twice in a round: 2 + 2 (${dauntSum(t)})`);
  drop(e, P, 1, a1); const a2 = put(e, P, 1, 'e16-dau1', 0); swing(e, P, a2);
  ok(dauntSum(t) === 5 && t.daunts.every(x=> x.until === t.daunts[0].until), `2b a second source the same round adds: 5, all to the end of the next round (${dauntSum(t)})`);
  drop(e, P, 1, a2); const ev = round(e, P); ok(tgtDmg(ev, t) === 5, `2b ... the next round the target swings at 10 - 5 (${tgtDmg(ev, t)})`);
  ok(!t.daunts.length, `2b ... and every mark is gone at that round's end (${t.daunts.length})`); }

// ---- 3. The pips (arena_app.js) ---------------------------------------------------------------------------------------------------------------
const app = rd('arena_app.js');
const snapM = app.match(/dauntN:c\.dauntN\|\|0 \/\* EN8 \*\/, (daunts:\(c\.daunts\|\|\[\]\)\.map\(x=> \(\{n:x\.n\}\)\))/);
ok(!!snapM, '3 the replay snapshot carries the Daunt marks (daunts:(c.daunts||[]).map(...))');
const dLine = (app.match(/^\s*else if\(ev\.kind==='daunt'\)\{[^\n]*$/m) || [''])[0], cLine = (app.match(/^\s*else if\(ev\.kind==='corrode'\)\{[^\n]*$/m) || [''])[0];
ok(/rc\.daunts = \(rc\.daunts \|\| \[\]\)\.concat\(/.test(dLine) && !/\.push\(/.test(dLine), '3 the replay Daunt branch makes a new array (never pushes into a shared one)');
ok(/rc\.corrode = ev\.total != null \? ev\.total : Math\.max\(/.test(cLine), "3 the replay Corrode branch takes the engine's total");
ok(/ev\.kind==='stagger' \|\| ev\.kind==='daunt' \/\*[^*]*\*\/\) updateCardStatusDisplay\(ev\.targetUid\)/.test(app), '3 a landed Daunt refreshes the status pips');
const pipSrc = (app.match(/function eng16DauntPips\(c, badges\)\{[\s\S]*?\n\}/) || [''])[0];
const liveSrc = (app.match(/function updateCardStatusDisplay\(uid\)\{[\s\S]*?\n\}/) || [''])[0];
const boardSrc = (app.match(/function boardCardHTML\([\s\S]*?\n\}/) || [''])[0];
ok(pipSrc && /eng16DauntPips\(c, badges\)/.test(liveSrc) && /eng16DauntPips\(c, badges\)/.test(boardSrc), '3 one Daunt pip builder, used by boardCardHTML and the live patch');
ok((app.match(/class="abadge daunt"/g) || []).length === 1, '3 the 😨 marks pip is drawn in one place');
if(snapM && dLine && cLine && pipSrc){
  const snap = new Function('c', 'return {' + snapM[1] + '};');
  const stubs = 'const SoundKit = {curse(){}, corrodeTone(){}}; const floatText = ()=>{}; const el = null;';
  const replay = new Function('ev', 'rc', stubs + '\nif(false){}\n' + dLine + '\n' + cLine + '\nreturn rc;');
  const pips = new Function('escapeAttr', 'TX', pipSrc + '\nreturn c=>{ const b = []; eng16DauntPips(c, b); if(c.corrode>0) b.push(`🧪${c.corrode}`); return b.join(" "); };')(s=> String(s), (k, o)=> k + JSON.stringify(o || {}));
  const pipN = (s, ch)=> { const m = s.match(new RegExp(ch + '(\\d+)')); return m ? +m[1] : 0; };
  // a Daunt 2 unit, second round: the replay starts from the snapshot (last round's mark) and plays the round's events
  { const {e, P} = mk(9); put(e, P, 1, 'e16-dau2', 0); const t = put(e, P, 2, 'e16-tgt', 0); round(e, P);
    let rc = Object.assign({corrode: t.corrode || 0}, snap(t)); ok(pipN(pips(rc), '😨') === 2, `3a the replay opens on last round's mark: 😨2 (${pips(rc)})`);
    const ev = round(e, P); ev.filter(x=> x.type === 'statusFx' && x.targetUid === t.uid).forEach(x=>{ rc = replay(x, rc); });
    ok(pipN(pips(rc), '😨') === 10 - tgtDmg(ev, t) && pipN(pips(rc), '😨') === 4, `3a mid-round the 😨 pip shows the cut the engine applied: 😨${pipN(pips(rc), '😨')}, hit for ${tgtDmg(ev, t)} (was 😨2: the snapshot had no marks)`);
    ok(pipN(pips(t), '😨') === 2, `3a after the round the board (engine state) shows this round's mark: 😨${pipN(pips(t), '😨')}`); }
  // a Corrode 2 unit, second round: the 🧪 pip follows the engine's total, never the sum of the events
  { const {e, P} = mk(10); put(e, P, 1, 'e16-cor2', 0); const t = put(e, P, 2, 'e16-tgt', 0); round(e, P);
    let rc = Object.assign({corrode: t.corrode || 0}, snap(t)); const ev = round(e, P);
    ev.filter(x=> x.type === 'statusFx' && x.targetUid === t.uid).forEach(x=>{ rc = replay(x, rc); });
    ok(pipN(pips(rc), '🧪') === 2 && t.corrode === 2, `3b the replay's 🧪 pip after a second Corrode 2: 🧪${pipN(pips(rc), '🧪')}, engine ${t.corrode} (was 4)`);
    ok(pipN(pips(rc), '🧪') === pipN(pips(replay({type:'statusFx', kind:'corrode', amount:2}, Object.assign({}, rc))), '🧪'), '3b an old event with no total takes the larger too'); }
  // a shallow replay copy (a raid reserve unit: Object.assign({}, live)) shares the engine's marks array; the replay must not add to it
  { const live = {daunts: [{n:2, until:3}]}, rc = Object.assign({}, live); replay({type:'statusFx', kind:'daunt', amount:2}, rc);
    ok(live.daunts.length === 1 && rc.daunts.length === 2, `3c a shallow copy's Daunt lands in its own array (live ${live.daunts.length}, replay ${rc.daunts.length})`); }
  { const c = {daunts:[{n:2}], dauntN:3}; const s = pips(c); ok(/😨2/.test(s) && /en8-daunt[^>]*>😨3/.test(s), `3d the marks pip and Render's counters pip both draw (${s.replace(/<[^>]*title="[^"]*"/g, '<span')})`); }
}

// ---- 4. Docs ----------------------------------------------------------------------------------------------------------------------------------
ok(/## 2026-11-24 Package ENG16/.test(rd('docs/CHANGELOG.md')), '4 CHANGELOG entry');
ok(/ENG16 \(2026-11-24\)[\s\S]{0,400}Corrode/.test(rd('docs/effects-catalogue.md')), '4 effects-catalogue describes the rule');
ok(/function corrodeOn\(t, n\)/.test(rd('bramblewood-engine.js')), '4 one Corrode setter in the engine (corrodeOn)');

console.log(fail ? `FAIL ${fail} of ${n}` : `PASS ${n}`); process.exit(fail ? 1 : 0);
