#!/usr/bin/env node
// 2026-11-19 (package DEC20-SKILLS, owner 23:47; decisions SKN1-11, SKN1-12, SKN1-13, SKN1-19, DATAFIX-2):
//   1. Illuminate reveals an Invisible enemy in its column or the ones beside it: the swing that missed it now lands; two columns away it doesn't;
//   2. Illuminate reveals a Stealth enemy beside it: its swing is blocked by the unit facing it instead of going to the bramble;
//   3. Embrittle N (key brittle) gives Fragile: the target takes x2 for N rounds (the 'fragile' mark on the hit); no Shatter bonus from it;
//   4. the names: Empower (the stat action, key buff), Embrittle, Mistwalker (the Fog pill stays Fog), the Illuminate and Embrittle texts;
//   5. the plain Map 0-1 reward rule is retired (rewards-pass no longer pins it).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'd20-hitter': U('d20-hitter', {}, {attack:3}),
  'd20-lamp':   U('d20-lamp', {illuminate:true}),
  'd20-filler': U('d20-filler'),
  'd20-ghost':  U('d20-ghost', {invisible:9}),
  'd20-sneak':  U('d20-sneak', {stealth:true}, {attack:2}),
  'd20-wall':   U('d20-wall', {}, {health:500}),
  'd20-emb':    U('d20-emb', {brittle:2}, {attack:1}),
  'd20-embsh':  U('d20-embsh', {brittle:2, shatter:3}, {attack:1}),
  'd20-dummy':  U('d20-dummy', {}, {health:99}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function fight(A, B, rounds){ const {e, P} = mk(); A.forEach(([id, s])=> e.debugSpawnCard(P, so, 1, id, s, {}, [])); B.forEach(([id, s])=> e.debugSpawnCard(P, so, 2, id, s, {}, []));
  const evs = []; for(let r = 1; r <= (rounds || 1); r++){ const ev = []; e.resolveCombat(P, so, {}, ev, r); evs.push(ev); } return {P, evs, ev: evs.flat()}; }
const hitsOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid);

// 1. Invisible: no light, the swing finds nothing; a lamp beside the swinger (column -1, covering 0) reveals the enemy in column 0
{ const dark = fight([['d20-hitter', 'center']], [['d20-ghost', 'center']], 2), g0 = byDef(dark.P[2], 'd20-ghost');
  ok(!hitsOn(dark.ev, g0.uid).length, `1. no Illuminate: the Invisible unit is not hit (${hitsOn(dark.ev, g0.uid).length})`);
  const lit = fight([['d20-hitter', 'center'], ['d20-lamp', 'left']], [['d20-ghost', 'center']], 2), g1 = byDef(lit.P[2], 'd20-ghost');
  ok(hitsOn(lit.ev, g1.uid).length === 2 && g1.hp === 44, `1. an enemy Illuminate beside it: both swings land (${hitsOn(lit.ev, g1.uid).length}, Health ${g1.hp})`);
  const far = fight([['d20-hitter', 'center'], ['d20-filler', 'left'], ['d20-lamp', 'left']], [['d20-ghost', 'center']], 2), g2 = byDef(far.P[2], 'd20-ghost');
  ok(!hitsOn(far.ev, g2.uid).length, `1. Illuminate two columns away: still hidden (${hitsOn(far.ev, g2.uid).length})`); }

// 2. Stealth: no light, its swing goes to the bramble; with an enemy lamp beside it, the wall facing it takes the swing
{ const dark = fight([['d20-wall', 'center']], [['d20-sneak', 'center']], 1), s0 = byDef(dark.P[2], 'd20-sneak');
  ok(dark.ev.some(x=> x.type === 'hitHQ' && x.attUid === s0.uid), '2. no Illuminate: the Stealth swing hits the bramble');
  const lit = fight([['d20-wall', 'center'], ['d20-lamp', 'right']], [['d20-sneak', 'center']], 1), s1 = byDef(lit.P[2], 'd20-sneak'), w1 = byDef(lit.P[1], 'd20-wall');
  ok(!lit.ev.some(x=> x.type === 'hitHQ' && x.attUid === s1.uid) && lit.ev.some(x=> x.type === 'hit' && x.attUid === s1.uid && x.targetUid === w1.uid), '2. an enemy Illuminate beside it: the wall takes the Stealth swing'); }

// 3. Embrittle gives Fragile: 1, then 2 (x2, marked fragile) on the next round; Shatter gets nothing from it (a Frozen-only bonus now)
{ const f = fight([['d20-emb', 'center']], [['d20-dummy', 'center']], 3), t = byDef(f.P[2], 'd20-dummy'), h = f.evs.map(ev=> hitsOn(ev, t.uid)[0]);
  ok(h[0] && h[0].dmg === 1 && h[1] && h[1].dmg === 2 && h[2] && h[2].dmg === 2, `3. Embrittle 2: 1, then 2 and 2 (${h.map(x=> x && x.dmg)})`);
  ok(h[1] && (h[1].mods || []).includes('fragile') && !(h[0].mods || []).includes('fragile'), '3. the hit on the Fragile unit is marked fragile');
  ok(f.ev.some(x=> x.type === 'statusFx' && x.kind === 'brittle' && x.targetUid === t.uid && x.amount === 2), '3. the statusFx brittle event (amount 2) is there for the board');
  const s = fight([['d20-embsh', 'center']], [['d20-dummy', 'center']], 2), t2 = byDef(s.P[2], 'd20-dummy'), h2 = s.evs.map(ev=> hitsOn(ev, t2.uid)[0]);
  ok(h2[1] && h2[1].dmg === 2, `3. Shatter 3 adds nothing on an Embrittled unit (${h2[1] && h2[1].dmg})`); }

// 4. names and texts
{ const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'), app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  const T = k=> { const m = tx.match(new RegExp('"' + k.replace(/[.]/g, '\\.') + '":\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m ? m[1] : null; };
  ok(T('ui.skn-empower') === 'Empower' && /\{key:'buff', label:TX\('ui\.skn-empower'\)/.test(app) && T('ui.act3-buff-all') === 'Empower all allies', '4. SKN1-11: the stat action reads Empower (key buff kept)');
  ok(T('ui.skn-brittle') === 'Embrittle' && /Fragile/.test(T('ui.sk-brittle')) && /Fragile/.test(T('ui.sk-brittle-1')) && T('ui.eng36-st-brittle') === 'Fragile', '4. SKN1-13: Embrittle N, it makes the target Fragile');
  ok(!/Brittle/.test(T('ui.sk3-shatter')), '4. Shatter no longer names Brittle');
  ok(T('ui.skn-fog') === 'Mistwalker' && T('ui.skn1-fog') === 'Fog', '4. SKN1-19: Mistwalker – {…}; the field pill stays Fog');
  ok(/Invisible/.test(T('ui.sk-illuminate')) && /Stealth/.test(T('ui.sk-illuminate')), '4. SKN1-12: the Illuminate text names Invisible and Stealth'); }

// 5. DATAFIX-2 a: the plain-reward pins are gone from the rewards pass
{ const rp = fs.readFileSync(path.join(__dirname, 'rewards-pass-2026-10-21.js'), 'utf8');
  ok(!/every Map 0-1 reward is plain/.test(rp) && !/Map 1 introduces Lumber with one card/.test(rp), '5. DATAFIX-2: the plain Map 0-1 reward pins are retired'); }

console.log(`dec20-skills-2026-11-19: ${fail ? fail + ' of ' + n + ' checks failed' : 'all ' + n + ' checks passed'}`);
process.exit(fail ? 1 : 0);
