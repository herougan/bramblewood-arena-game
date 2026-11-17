#!/usr/bin/env node
// 2026-11-17 (package POWDER1, owner 11-17 17:32, OWN-1117-1: "Status Powder: Start with Sleeping Powder and Poison Powder for now. Powders
// would be Speed -1 actions."): 1 speed order (after the arrows and the swings; Blitz 10), 2 the statuses (Sleep N, Poison N; Wakeful, Immune,
// poison-proof, Venom Master; never on a sleeping unit; no damage; no puff on an empty board; Evasive dodges, Flying doesn't), 3 one skill as a
// family, its price, delivery and counters, 4 determinism, 5 the CPU's slot, 6 texts, editor, effect, docs (no card carries it).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const so = id=> id === 1 ? 'A' : 'B';
const BB = require('../bramblewood-budget.js');
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'pw-dummy': U('pw-dummy'),
  'pw-swing': U('pw-swing', {}, {attack:1}),
  'pw-hitter': U('pw-hitter', {}, {attack:4}),
  'pw-arrow': U('pw-arrow', {arrow:1}),
  'pw-sleep': U('pw-sleep', {sleepPowder:1}),
  'pw-sleep2': U('pw-sleep2', {sleepPowder:2}),
  'pw-poison': U('pw-poison', {poisonPowder:2}),
  'pw-both': U('pw-both', {sleepPowder:1, poisonPowder:1}),
  'pw-blitz': U('pw-blitz', {sleepPowder:1, blitz:true}),
  'pw-wakeful': U('pw-wakeful', {wakeful:true}, {attack:4}),
  'pw-immune': U('pw-immune', {immune:['status:sleep']}, {attack:4}),
  'pw-evasive': U('pw-evasive', {evasive:true}, {attack:1}),
  'pw-flyer': U('pw-flyer', {flying:true}, {attack:1}),
  'pw-venomaster': U('pw-venomaster', {venomMaster:1}),
  'pw-wall': U('pw-wall', {}, {archetypes:['Structure']}),
  'pw-immunity': U('pw-immunity', {immunity:true}),
  'pw-plain': U('pw-plain', {}, {health:20}),
  'pw-aisleep': U('pw-aisleep', {sleepPowder:1}, {health:20}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), Object.assign({recordEvents:true, battleMode:'open'}, o || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P, r)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, r || 1); return ev; };
const at = (ev, f)=> ev.findIndex(f);
const swingOf = uid=> x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === uid;
const puffOf = uid=> x=> x.type === 'powder' && x.uid === uid;

// ---- 1. speed order ----
{ const {e, P} = mk(); const p = put(e, P, 1, 'pw-sleep', -2), a = put(e, P, 1, 'pw-arrow', 2), s = put(e, P, 2, 'pw-swing', 2); put(e, P, 2, 'pw-dummy', -2);
  ok(e.shotSpeedOf(p, 'powder') === -1, 'a powder puff is Speed -1');
  const ev = fight(e, P), iP = at(ev, puffOf(p.uid)), iA = at(ev, x=> x.type === 'arrow' && x.uid === a.uid), iS = at(ev, swingOf(s.uid));
  ok(iP >= 0 && iA >= 0 && iS >= 0 && iP > iA && iP > iS, `a powder in the first column goes after an arrow and a swing in the last (swing ${iS}, arrow ${iA}, puff ${iP})`);
  ok(ev.filter(puffOf(p.uid)).length === 1, 'one puff a round'); }
{ const {e, P} = mk(); const b = put(e, P, 1, 'pw-blitz', 2), s = put(e, P, 2, 'pw-swing', -2); put(e, P, 2, 'pw-dummy', 2);
  ok(e.shotSpeedOf(b, 'powder') === 10, 'Blitz puts its powder at Speed 10 too');
  const ev = fight(e, P); ok(at(ev, puffOf(b.uid)) >= 0 && at(ev, puffOf(b.uid)) < at(ev, swingOf(s.uid)), 'a Blitz powder goes before the swings'); }
{ const {e, P} = mk(); const u = put(e, P, 1, 'pw-both', 0); put(e, P, 2, 'pw-hitter', 0);
  const ev = fight(e, P), puffs = ev.filter(puffOf(u.uid));
  ok(puffs.length === 2 && puffs.some(x=> x.element === 'sleep') && puffs.some(x=> x.element === 'poison'), 'a unit with both powders puffs both in its one Speed -1 action'); }

// ---- 2. the statuses ----
{ const {e, P} = mk(); const p = put(e, P, 1, 'pw-sleep', 0), t = put(e, P, 2, 'pw-hitter', 0);
  let ev = fight(e, P, 1);
  ok(t.asleep === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'sleep' && x.targetUid === t.uid && x.left === 1), 'Sleeping Powder 1: the unit facing it has 1 Sleep token');
  ok(!ev.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === p.uid) && t.hp === 500, 'no damage');
  ev = fight(e, P, 2);
  ok(!ev.some(swingOf(t.uid)) && ev.some(x=> /skip/i.test(x.type) && (x.uid === t.uid || x.attUid === t.uid)), 'next round it sleeps through its turn');
  ok(!ev.some(x=> x.type === 'statusFx' && x.kind === 'sleep' && x.targetUid === t.uid), 'no Sleep on a unit already asleep (it cannot be kept asleep every round)');
  ev = fight(e, P, 3); ok(ev.some(swingOf(t.uid)) && ev.some(x=> x.type === 'statusFx' && x.kind === 'sleep' && x.targetUid === t.uid), 'the round after, it swings, then is put to sleep again'); }
{ const {e, P} = mk(); put(e, P, 1, 'pw-sleep2', 0); const t = put(e, P, 2, 'pw-hitter', 0); fight(e, P, 1);
  ok(t.asleep === 2, `Sleeping Powder 2: 2 Sleep tokens (${t.asleep})`);
  const sw = [2, 3, 4].map(r=> fight(e, P, r).some(swingOf(t.uid))); ok(sw.join() === 'false,false,true', `asleep 2 rounds, then it swings (${sw.join()})`); }
{ const {e, P} = mk(); put(e, P, 1, 'pw-sleep', 0); const t = put(e, P, 2, 'pw-wakeful', 0); const ev = fight(e, P);
  ok(!(t.asleep > 0) && ev.some(x=> x.type === 'statusFx' && x.kind === 'wakeful' && x.targetUid === t.uid), 'Wakeful never falls asleep'); }
{ const {e, P} = mk(); put(e, P, 1, 'pw-sleep', 0); const t = put(e, P, 2, 'pw-immune', 0); fight(e, P); ok(!(t.asleep > 0), 'Immune to Sleep: no Sleep'); }
{ const {e, P} = mk(); const p = put(e, P, 1, 'pw-poison', 0), t = put(e, P, 2, 'pw-hitter', 0); const ev = fight(e, P);
  ok(t.poison === 2 && t.hp === 500 && ev.some(x=> x.type === 'statusFx' && x.kind === 'poison' && x.targetUid === t.uid && x.amount === 2), `Poison Powder 2: 2 Poison, no damage (${t.poison}, ${t.hp})`);
  ok(ev.find(puffOf(p.uid)).amount === 2, 'the puff event carries N'); }
{ const {e, P} = mk(); put(e, P, 1, 'pw-poison', 0); put(e, P, 1, 'pw-venomaster', 1); const t = put(e, P, 2, 'pw-hitter', 0); fight(e, P);
  ok(t.poison === 3, `Venom Master adds 1, as on Poison Bolt (${t.poison})`); }
['pw-wall', 'pw-immunity'].forEach(id=>{ const {e, P} = mk(); put(e, P, 1, 'pw-poison', 0); const t = put(e, P, 2, id, 0); fight(e, P); ok(!(t.poison > 0), `no Poison on a poison-proof unit (${id})`); });
{ const {e, P} = mk(); const p = put(e, P, 1, 'pw-sleep', 0), q = put(e, P, 1, 'pw-poison', 1); const ev = fight(e, P);
  ok(!ev.some(x=> x.type === 'powder') && !ev.some(x=> x.type === 'hitHQ' && (x.attUid === p.uid || x.attUid === q.uid)) && P[2].hq.hp === 500, 'no enemy unit: no puff, the bramble untouched'); }
{ const {e, P} = mk(); const p = put(e, P, 1, 'pw-sleep', 0), t = put(e, P, 2, 'pw-hitter', 2); const ev = fight(e, P);
  ok(ev.some(x=> puffOf(p.uid)(x) && x.targetUid === t.uid) && t.asleep === 1, 'nothing facing it: the nearest enemy'); }
{ let dodged = 0, landed = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(100 + s); put(e, P, 1, 'pw-poison', 0); const t = put(e, P, 2, 'pw-evasive', 0); const ev = fight(e, P);
    if(ev.some(x=> x.type === 'evaded' && x.targetUid === t.uid && x.ranged)) dodged++; if(t.poison > 0) landed++; }
  ok(dodged > 5 && landed > 5, `Evasive dodges a puff about 1 in 2 (${dodged} dodged, ${landed} landed of 30)`); }
{ let landed = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk(200 + s); put(e, P, 1, 'pw-poison', 0); const t = put(e, P, 2, 'pw-flyer', 0); fight(e, P); if(t.poison > 0) landed++; }
  ok(landed === 20, `Flying does not dodge a puff (${landed} of 20)`); }

// ---- 3. one skill, price, delivery, counters ----
ok(BB.skillCountOf({sleepPowder:1, poisonPowder:2}) === 1, 'Sleeping Powder + Poison Powder count 1');
ok(BB.skillCountOf({sleepPowder:1, arrow:1}) === 2 && BB.skillCountOf({poisonPowder:1, fireBolt:1}) === 2, 'a powder and an arrow (or a bolt) are two skills');
ok(BB.skillCountOf({poisonPowder:1, poison:1}) === 1, 'Poison Powder sits with the poison skills, as Poison Bolt does');
ok(Array.isArray(BB.POWDER_FAMILY) && BB.POWDER_FAMILY.slice(0, 2).join() === 'sleepPowder,poisonPowder' /* ENG50 (2026-11-17): + paralysisPowder */, 'the budget exports the powder family');
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  const sp1 = S({sleepPowder:1}), sp2 = S({sleepPowder:2}), pp2 = S({poisonPowder:2}), pb2 = S({poisonBolt:2});
  ok(!sp1.missing.length && sp1.S === 2.5 && sp2.S > sp1.S && sp2.S < 2 * sp1.S, `Sleeping Powder priced: N 1 ${sp1.S}, N 2 ${sp2.S}`);
  ok(!pp2.missing.length && pp2.S > 0 && pp2.S < pb2.S, `Poison Powder 2 priced a little under Poison Bolt 2 (${pp2.S} < ${pb2.S})`); }
{ const D = J('canonical/skill-delivery.json'), C = J('canonical/skill-counters.json');
  ok(D.delivery.sleepPowder === 'ranged' && D.delivery.poisonPowder === 'ranged', 'delivery: ranged, as Poison Bolt');
  ok(C.applies.sleepPowder === 'sleep' && C.applies.poisonPowder === 'venom' && C.counters.sleepPowder && C.counters.poisonPowder.counters.some(x=> x.skill === 'evasive'), 'counters: Sleep / Venom, Evasive and the shot counters'); }

// ---- 4. determinism ----
{ const run = seed=>{ const {e, P} = mk(seed); put(e, P, 1, 'pw-both', 0); put(e, P, 1, 'pw-sleep2', -1); put(e, P, 2, 'pw-evasive', 0); put(e, P, 2, 'pw-hitter', -1); put(e, P, 2, 'pw-wakeful', 1);
    const out = []; for(let r = 1; r <= 5; r++) out.push(fight(e, P, r)); return JSON.stringify(out); };
  ok(run(42) === run(42), 'the same seed replays the same fight'); }

// ---- 5. the CPU's slot (smart and smartest): the powder card faces the unit it can put to sleep, not the Wakeful one ----
function aiPick(defId, seed, level){ const {e, P} = mk(seed, {aiAim:true, aiLevel:level}); put(e, P, 2, 'pw-dummy', 0); put(e, P, 1, 'pw-wakeful', -1); put(e, P, 1, 'pw-hitter', 1);
  return e.aiChooseSlot(P, 2, defId); }
{ const seeds = Array.from({length:40}, (_, i)=> 300 + i);
  const top = seeds.filter(s=> aiPick('pw-aisleep', s, 2) === 1).length, smart = seeds.filter(s=> aiPick('pw-aisleep', s, 1) === 1).length, plain = seeds.filter(s=> aiPick('pw-plain', s, 2) === 1).length;
  ok(top === 40, `smartest CPU: the Sleeping Powder card always faces the unit that can sleep (${top} of 40)`);
  ok(smart >= 28, `smart CPU: mostly (${smart} of 40)`);
  ok(plain < 40, `a plain card has no such pull (${plain} of 40)`); }

// ---- 6. texts, editor, effect, docs; no card carries it ----
const app = rd('arena_app.js'), T = require('../bramblewood-texts.js').TEXT;
const KEYS = ['ui.skn-sleep-powder', 'ui.skn-poison-powder', 'ui.skn-powder', 'ui.sk-sleep-powder', 'ui.sk-poison-powder', 'ui.sk-powder-family-codex', 'ui.powder-log-sleep', 'ui.powder-log-poison'];
KEYS.forEach(k=> ok(T[k] && app.includes(`'${k}'`), `${k}: a text, used`));
ok(/\{key:'sleepPowder', category:'evergreen'/.test(app) && /\{key:'poisonPowder', category:'evergreen'/.test(app), 'both in PASSIVE_DEFS (the card editor\'s skill picker, the Codex)');
ok(/sleepPowder:'😴', poisonPowder:'🍄'/.test(app), 'icons');
ok(/B\.POWDER_FAMILY/.test(app.slice(app.indexOf('function skillFamilies('), app.indexOf('function skillFamilyId('))) && /'ui\.sk-powder-family-codex'/.test(app), 'the Codex filter groups the powders under one chip, with the family note');
ok(/case 'powder':/.test(app) && /ev\.type==='powder'\) base = 620/.test(app), 'a log line and a beat for the powder event');
for(const L of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pk = J('lang/' + L + '.json'); ok(KEYS.every(k=> pk[T[k]]), `${L}: the POWDER1 texts are translated`); }
const FXH = rd('bramblewood-fx-h.js');
ok(/\nM\.powderPuff = function/.test(FXH) && /\n  sporePuff\(P, el\)\{/.test(FXH) && /powder1Event\(ev, env\)/.test(FXH), 'FX.H.powderPuff, its cue, wired from FX.H.onEvent (renderVfxForEvent → fxBatchVfx)');
{ const css = (FXH.match(/css\('powder1', `[\s\S]*?`\);/) || [''])[0]; ok(css && !/(^|[^-])filter\s*:|mix-blend-mode/.test(css), 'no filter or blend mode in its CSS'); }
{ const man = rd('tools/effects-lab/manifest/h.js'), inv = J('docs/effects-inventory-2026-10-15.json'), by = Object.fromEntries(inv.map(x=> [x.id, x]));
  ok(['sk-sleep-powder', 'sk-poison-powder'].every(id=> man.includes(`id:'${id}'`) && by[id] && by[id].status === 'live' && by[id].batch === 'H'), 'Effects Lab entries and inventory rows'); }
ok(/package POWDER1/.test(rd('docs/effects-catalogue.md')) && /sporePuff/.test(rd('docs/sfx-cue-sheet.md')) && /POWDER1/.test(rd('docs/CHANGELOG.md')), 'catalogue, cue sheet, CHANGELOG');
ok(/powder1-2026-11-17/.test(rd('tests/run-all.sh')), 'run-all.sh lists this test');
{ const cards = J('canonical/cards.json'), list = Array.isArray(cards) ? cards : Object.values(cards.cards || cards);
  // 2026-11-18 (FXAUD2 merge): CONTENT13 added the first powder carriers, so check they are real cards in budget instead of "none yet"
  const SC = require('../tools/skill_costs.js'), K = SC.make(J('canonical/skill-costs.json'));
  const carriers = list.filter(c=> c && c.effects && (c.effects.sleepPowder || c.effects.poisonPowder) && !/^test-/.test(c.id));
  ok(carriers.every(c=> K.budget(c).ok), 'powder carriers are in budget (' + carriers.map(c=> c.id).join(', ') + ')'); }
{ const F = new Function(app.match(/const MAP_FOCUS_SKILLS = \{[^\n]*\n/)[0] + 'return MAP_FOCUS_SKILLS;')(); ok(!Object.values(F).some(l=> l.some(k=> /Powder/.test(k))), 'MAP_FOCUS_SKILLS unchanged (no powder)'); }

console.log(`powder1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
