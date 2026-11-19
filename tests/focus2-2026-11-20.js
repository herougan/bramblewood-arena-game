#!/usr/bin/env node
// 2026-11-20 (package FOCUS2, owner 00:39: "Put bleed in 6 and leech in 5 ... Embrittle and etc, regarding our 2x and halvers (4 skills total) - we
// need 4 skills to apply them"):
//   1. Enfeeble N: its hits make the target Feeble (deals half) for N rounds, refreshed, never below half with the Feeble skill (was N tokens);
//   2. Harden N: when played and each round, an ally beside it is Sturdy (takes half) for N rounds; never a quarter with the Sturdy skill;
//   3. Embolden N: the same with Mighty (deals double); never x4 with the Mighty skill; no x2 under Quiet Contemplation (as Mighty);
//   4. the statuses wear off a round after they stop being refreshed (statusEnd); the actions work from a custom trigger;
//   5. the focus swap: Map 5 Forestry / Leech / Venomous, Map 6 Bleed / Parasite / Constrict (and the REDESIGN3 file says the same);
//   6. the carriers (canonical/cards.json) at or under 100% of their budget, two skills at most; prices, delivery, counters;
//   7. the Suggested picks for Maps 5 and 6 (UI47_SUGGEST) are real cards on no earlier list's way, within budget at that map;
//   8. texts, registry entries, the board branches (badge, float, log) and the CHANGELOG entry.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:99, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'f2-enf':     U('f2-enf', {enfeeble:1}, {attack:1, health:500}),
  'f2-enf2':    U('f2-enf2', {enfeeble:2}, {attack:1, health:500}),
  'f2-hit4':    U('f2-hit4', {}, {attack:4}),
  'f2-feeb4':   U('f2-feeb4', {feeble:true}, {attack:4}),
  'f2-wall':    U('f2-wall', {}, {attack:0, health:500}),
  'f2-hard':    U('f2-hard', {harden:1}),
  'f2-emb':     U('f2-emb', {embolden:1}),
  'f2-sturdy':  U('f2-sturdy', {sturdy:true}),
  'f2-mighty':  U('f2-mighty', {mighty:true}, {attack:2}),
  'f2-swing2':  U('f2-swing2', {}, {attack:2}),
  'f2-hit2':    U('f2-hit2', {}, {attack:2}),
  'f2-dummy':   U('f2-dummy'),
  'f2-hardAct': U('f2-hardAct', {triggers:[{on:'onSpawn', do:'harden', who:'self', amount:1}]}),
  'f2-enfAct':  U('f2-enfAct', {triggers:[{on:'onSpawn', do:'enfeeble', who:'enemy', sub:'adjacent', amount:2}]}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function fight(A, B, rounds, pre, A2){ const {e, P} = mk(); const sp = []; A.forEach(([id, s])=> e.debugSpawnCard(P, so, 1, id, s, {}, sp)); B.forEach(([id, s])=> e.debugSpawnCard(P, so, 2, id, s, {}, sp)); (A2 || []).forEach(([id, s])=> e.debugSpawnCard(P, so, 1, id, s, {}, sp));
  if(pre) pre(P); const evs = []; for(let r = 1; r <= (rounds || 1); r++){ const ev = []; e.resolveCombat(P, so, {}, ev, r); evs.push(ev); } return {P, sp, evs, ev: evs.flat()}; }
const hitsOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid);
const dmgs = (f, uid)=> f.evs.map(ev=> hitsOn(ev, uid).reduce((t, h)=> t + (h.dmg || 0), 0));
const dealt = (f, uid)=> f.evs.map(ev=> ev.filter(x=> x.type === 'hit' && x.attUid === uid).reduce((t, h)=> t + (h.dmg || 0), 0));
// (debugSpawnCard fills the centre first: the first unit of a side stands in the centre, the next one at the side named)

// ================= 1. Enfeeble N: Feeble for N rounds =================
{ const f = fight([['f2-enf', 'center']], [['f2-hit4', 'center']], 3), me = byDef(f.P[1], 'f2-enf'), t = byDef(f.P[2], 'f2-hit4');
  const d = dmgs(f, me.uid);
  ok(f.ev.some(x=> x.type === 'statusFx' && x.kind === 'enfeeble' && x.targetUid === t.uid && x.amount === 1), '1. Enfeeble 1: the statusFx enfeeble event (amount 1, the rounds)');
  ok(d.slice(1).every(x=> x === 2), `1. the unit it keeps hitting deals half from then on (${d})`);
  ok(t.feeble === 1, `1. refreshed to 1, not stacked (${t.feeble})`); }
{ const f = fight([['f2-enf', 'center']], [['f2-feeb4', 'center']], 3), me = byDef(f.P[1], 'f2-enf'); const d = dmgs(f, me.uid);
  ok(d.every(x=> x === 2), `1. a unit with the Feeble skill, Enfeebled: still half, never a quarter (${d})`); }
{ const f = fight([['f2-wall', 'center']], [['f2-hit4', 'center']], 1, P=>{ const t = byDef(P[2], 'f2-hit4'); t.feeble = 1; t._feebleJustSet = true; }), w = byDef(f.P[1], 'f2-wall');
  ok(dmgs(f, w.uid)[0] === 2, '1. a Feeble unit deals half on every hit in its rounds (no token used up)'); }
{ const f = fight([['f2-wall', 'center']], [['f2-hit4', 'center']], 4, P=>{ const t = byDef(P[2], 'f2-hit4'); t.feeble = 2; t._feebleJustSet = true; }), w = byDef(f.P[1], 'f2-wall'), t = byDef(f.P[2], 'f2-hit4');
  ok(JSON.stringify(dmgs(f, w.uid)) === '[2,2,2,4]', `1. Feeble 2 set this round: this round and the next two, then full damage (${dmgs(f, w.uid)})`);
  ok(f.ev.some(x=> x.type === 'statusEnd' && x.status === 'feeble' && x.uid === t.uid), '1. it wears off with a statusEnd feeble'); }
{ const f = fight([], [['f2-dummy', 'center']], 0, null, [['f2-enfAct', 'center']]), t = byDef(f.P[2], 'f2-dummy');
  ok(t.feeble === 2, `1. the Enfeeble action: Feeble for 2 rounds (${t.feeble})`); }

// ================= 2. Harden N =================
{ const f = fight([['f2-hard', 'center'], ['f2-dummy', 'left']], [['f2-wall', 'center'], ['f2-hit4', 'left']], 2), a = byDef(f.P[1], 'f2-dummy');
  const d = dmgs(f, a.uid), h = f.ev.filter(x=> x.type === 'hit' && x.targetUid === a.uid);
  ok(f.sp.concat(f.ev).some(x=> x.type === 'statusFx' && x.kind === 'harden' && x.targetUid === a.uid && x.amount === 1), '2. Harden 1: the statusFx harden event on the ally beside it');
  ok(d.every(x=> x === 2), `2. the ally beside it takes half (${d})`);
  ok(h.every(x=> (x.mods || []).includes('sturdy')), '2. its hits are marked sturdy'); }
{ const f = fight([['f2-hard', 'center'], ['f2-sturdy', 'left']], [['f2-wall', 'center'], ['f2-hit4', 'left']], 2), a = byDef(f.P[1], 'f2-sturdy');
  ok(dmgs(f, a.uid).every(x=> x === 2), `2. a Sturdy ally, Hardened: still half, never a quarter (${dmgs(f, a.uid)})`); }
{ const f = fight([['f2-hard', 'center']], [['f2-hit4', 'center']], 2), me = byDef(f.P[1], 'f2-hard');
  ok(dmgs(f, me.uid).every(x=> x === 4) && !(me.hardened > 0), '2. Harden is for an ally: alone it hardens nobody, itself included'); }
{ const f = fight([['f2-hardAct', 'center']], [['f2-hit4', 'center']], 3), me = byDef(f.P[1], 'f2-hardAct');
  ok(JSON.stringify(dmgs(f, me.uid)) === '[2,2,4]', `2. the action (On Play, itself, 1 round): this round and the next, then full damage (${dmgs(f, me.uid)})`);
  ok(f.ev.some(x=> x.type === 'statusEnd' && x.status === 'hardened' && x.uid === me.uid), '2. it wears off with a statusEnd hardened'); }

// ================= 3. Embolden N =================
{ const f = fight([['f2-emb', 'center'], ['f2-swing2', 'left']], [['f2-wall', 'center'], ['f2-wall', 'left']], 2), w = byDef(f.P[1], 'f2-swing2');
  ok(f.sp.concat(f.ev).some(x=> x.type === 'statusFx' && x.kind === 'embolden' && x.amount === 1), '3. Embolden 1: the statusFx embolden event');
  ok(dealt(f, w.uid).every(x=> x === 4), `3. the ally beside it deals double (${dealt(f, w.uid)})`); }
{ const f = fight([['f2-emb', 'center']], [['f2-wall', 'center']], 1), me = byDef(f.P[1], 'f2-emb');
  ok(!(me.emboldened > 0), '3. alone it emboldens nobody, itself included'); }
{ const f = fight([['f2-emb', 'center'], ['f2-mighty', 'left']], [['f2-wall', 'center'], ['f2-wall', 'left']], 2), w = byDef(f.P[1], 'f2-mighty');
  ok(w.emboldened > 0 && dealt(f, w.uid).every(x=> x === 4), `3. a Mighty ally, Emboldened: still x2, never x4 (${dealt(f, w.uid)})`); }

// ================= 5. the focus swap =================
{ const src = rd('arena_app.js'), m = /const MAP_FOCUS_SKILLS = (\{[^;]*\});/.exec(src), cfg = m && eval('(' + m[1] + ')');
  ok(cfg && JSON.stringify(cfg[5]) === JSON.stringify(['forestry', 'sap', 'poison']), `5. Map 5: Forestry, Leech (sap), Venomous (${cfg && cfg[5]})`);
  ok(cfg && JSON.stringify(cfg[6]) === JSON.stringify(['bleed', 'parasite', 'strangle']), `5. Map 6: Bleed, Parasite, Constrict (${cfg && cfg[6]})`);
  const fk = J('docs/design/redesign3-2026-11-17.json').focus, f5 = fk.find(f=> f.map === 5), f6 = fk.find(f=> f.map === 6);
  ok(f5.skills.some(s=> s.key === 'sap') && !f5.skills.some(s=> s.key === 'bleed') && f6.skills.some(s=> s.key === 'bleed') && !f6.skills.some(s=> s.key === 'sap'), '5. the REDESIGN3 design file follows'); }

// ================= 6. carriers, prices, delivery, counters =================
const CARRIERS = {harden: ['ladybird-guard', 'sworn-shieldbearer'], embolden: ['meerkat-sentry'], enfeeble: ['booming-bittern'], brittle: ['glacier-wolf-pack']};
{ const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), BB = require('../bramblewood-budget.js');
  const pct = d=> Math.max(...[1, SC.levelOf(d)].map(L=> { const b = T.budget(d, {level: L}); return Math.max(b.x1 / b.N, b.x2 / b.N2); })) * 100;
  Object.entries(CARRIERS).forEach(([k, ids])=> ids.forEach(id=>{ const d = by[id];
    ok(d && d.effects && d.effects[k] === 1, `6. ${id} carries ${k} 1`);
    if(!d) return; const p = pct(d), b = T.budget(d, {level: 1});
    ok(p <= 100 + 1e-9 && !b.missing.length, `6. ${id} at or under its budget (${p.toFixed(1)}%)`);
    ok(BB.skillCountOf(d.effects) <= 2, `6. ${id}: two skills at most`); }));
  ok(['harden', 'embolden', 'enfeeble'].every(k=> cards.filter(c=> c.effects && c.effects[k] && !/^test-/.test(c.id)).length <= 2 + (k === 'enfeeble' ? 1 : 0)), '6. 1-2 existing cards a skill (+ Tsetse Drainer, Enfeeble\'s card before)');
  const S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1}).S;
  ok(Math.abs(S({harden:1}) - 2.11) < 0.01 && Math.abs(S({embolden:1}) - 3.59) < 0.01 && Math.abs(S({enfeeble:1}) - 2.5) < 0.01, `6. prices at N 1: Harden ${S({harden:1})}, Embolden ${S({embolden:1})}, Enfeeble ${S({enfeeble:1})}`);
  ok(S({harden:2}) > S({harden:1}) && S({harden:2}) < 1.2 * S({harden:1}) && S({enfeeble:2}) < 1.2 * S({enfeeble:1}), '6. N adds little (refreshed, not stacked: pow 0.2, as Embrittle)');
  const D = J('canonical/skill-delivery.json'), C = J('canonical/skill-counters.json');
  ok(D.delivery.harden === 'none' && D.delivery.embolden === 'none' && C.noCounter.includes('harden') && C.noCounter.includes('embolden'), '6. delivery none, no counter (ally buffs)');
  const acts = J('canonical/skill-costs.json').actions;
  ok(['harden', 'embolden', 'enfeeble'].every(k=> (acts.find(a=> a.id === k) || {}).per === 'amount'), '6. the actions are priced per round'); }

// ================= 7. Suggested picks =================
{ const src = rd('arena_app.js'), sg = JSON.parse(src.match(/const UI47_SUGGEST = (\{.*?\});/)[1]), ids = new Set(J('canonical/cards.json').map(c=> c.id));
  ok(JSON.stringify(sg.mw) === JSON.stringify(['bog-shrew', 'vampire-bat']) && JSON.stringify(sg.m8) === JSON.stringify(['bog-leech', 'bloodworm']), `7. Suggested: Map 5 ${sg.mw}, Map 6 ${sg.m8}`);
  ok(['mw', 'm8'].every(k=> sg[k].length >= 1 && sg[k].length <= 3 && sg[k].every(id=> ids.has(id))), '7. 1-3 real cards a map');
  const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  ok(sg.mw.every(id=> by[id].effects.sap) && sg.m8.every(id=> by[id].effects.bleed), '7. Map 5\'s carry Leech, Map 6\'s Bleed');
  const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json'));
  [['mw', 5], ['m8', 6]].forEach(([k, m])=> sg[k].forEach(id=>{ const b = T.budget(Object.assign({}, by[id], {obtainMap: m}), {level: 1}); ok(b.ok, `7. ${id} fits its budget at Map ${m} (${b.x1} <= ${b.N})`); })); }

// ================= 8. texts, registry, board =================
{ const TX = require('../bramblewood-texts.js').TEXT, app = rd('arena_app.js');
  ['ui.skn-harden', 'ui.sk-harden', 'ui.sk-harden-codex', 'ui.skn-embolden', 'ui.sk-embolden', 'ui.sk-embolden-codex', 'ui.act-harden', 'ui.act-harden-desc', 'ui.act-harden-text',
   'ui.act-embolden', 'ui.act-embolden-desc', 'ui.act-embolden-text', 'ui.focus2-hardened-tip', 'ui.focus2-emboldened-tip', 'ui.focus2-log-harden', 'ui.focus2-log-embolden',
   'ui.focus2-float-harden', 'ui.focus2-float-embolden', 'ui.focus2-st-sturdy', 'ui.focus2-st-mighty'].forEach(k=> ok(typeof TX[k] === 'string' && TX[k].length, `8. text ${k}`));
  ok(['ui.sk-harden', 'ui.sk-embolden', 'ui.sk-enfeeble'].every(k=> TX[k] && TX[k].split(/\s+/).length <= 20), '8. the card lines are under 20 words');
  ok(/rounds?/.test(TX['ui.sk-enfeeble']) && !/token/i.test(TX['ui.sk-enfeeble']) && !/token/i.test(TX['ui.feeble-tip']), '8. Enfeeble reads in rounds, no tokens');
  ok(/\{key:'harden', category:'evergreen'/.test(app) && /\{key:'embolden', category:'evergreen'/.test(app) && /\{key:'harden', label:TX\('ui\.act-harden'\)/.test(app) && /\{key:'embolden', label:TX\('ui\.act-embolden'\)/.test(app), '8. passive and action entries');
  ok(/ev\.kind === 'harden'/.test(app) && /ev\.kind === 'embolden'/.test(app) && /rc\.hardened/.test(app) && /rc\.emboldened/.test(app), '8. the board handles the harden / embolden statusFx');
  ok(/hardened:c\.hardened\|\|0/.test(app) && /emboldened:c\.emboldened\|\|0/.test(app), '8. the replay snapshot carries the rounds');
  ok(/## 2026-11-20 FOCUS2/.test(rd('docs/CHANGELOG.md')), '8. CHANGELOG entry');
  const pk = J('lang/fr.json'); ok([TX['ui.sk-harden'], TX['ui.sk-embolden'], TX['ui.sk-enfeeble']].every(s=> pk[s]), '8. translated (fr pack)'); }

console.log(fail ? `FAIL ${fail} of ${n}` : `PASS ${n}`); process.exit(fail ? 1 : 0);
