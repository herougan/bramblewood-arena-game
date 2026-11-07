#!/usr/bin/env node
// 2026-11-07 (package ENG34, owner 19:25: "classify skills as melee or ranged. Then a lot of effects will be based on whether they are melee
// or ranged. For example, bleed and venomous effects cause ALL melee attacks and skills to be affected. Ranged similarly for those only
// targeting ranged skills."): the classification file (every skill classified, the engine reads it), Bleed / Venom / Daunt / Breach on
// melee skill hits (Cleave, prongs, Pounce, Ambush, Counterattack, a Parasite's feed), Thorns answering a melee skill hit, Fletcher on every
// ranged shot (a Cinder, not only arrows), ranged swings (Reach) under Canopy Cover, texts and translations, docs.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';

// ---- Part A: the classification file
const D = J('canonical/skill-delivery.json');
const app = rd('arena_app.js'), pd = app.slice(app.indexOf('const PASSIVE_DEFS = ['));
const keys = new Set(); for(const m of app.matchAll(/\{\s*key:\s*'([A-Za-z0-9]+)'\s*,\s*category:\s*'(?:passive|evergreen)'/g)) keys.add(m[1]);
for(const m of app.matchAll(/PASSIVE_DEFS\.push\(\s*\{\s*key:\s*'([A-Za-z0-9]+)'/g)) keys.add(m[1]);
void pd;
ok(keys.size > 300, `found the skill list in arena_app.js (${keys.size})`);
const missing = [...keys].filter(k=> !(k in D.delivery));
ok(!missing.length, `every skill has a delivery (${missing.slice(0, 12).join(', ')})`);
ok(Object.values(D.delivery).every(v=> ['melee', 'ranged', 'none'].includes(v)), 'each delivery is melee, ranged or none');
for(const [k, v] of [['attack', 'melee'], ['twinStrike', 'melee'], ['pounce', 'melee'], ['sweep', 'melee'], ['ambush', 'melee'], ['crabClaws', 'melee'], ['counterattack', 'melee'],
  ['arrow', 'ranged'], ['fireArrow', 'ranged'], ['acidBolt', 'ranged'], ['boomerang', 'ranged'], ['reach', 'ranged'], ['volley', 'ranged'], ['shockBolt', 'ranged'], ['fireball', 'ranged'], ['tsunami', 'ranged'],
  ['armor', 'none'], ['regen', 'none'], ['tide', 'none'], ['swarm', 'none'], ['flying', 'none'], ['bleed', 'none'], ['immolation', 'none'], ['action:damage', 'ranged'], ['action:fireHit', 'melee']])
  ok(D.delivery[k] === v, `${k} is ${v} (${D.delivery[k]})`);
ok(D.rides.bleed === 'melee' && D.rides.poison === 'melee' && D.rides.daunt === 'melee' && D.rides.breach === 'melee' && D.rides.sap === 'melee', 'Bleed, Venomous, Daunt, Breach and Leech ride every melee hit');
ok(D.rides.fletcher === 'ranged' && D.rides.weaponMaster === 'ranged', 'Fletcher and Weapon Master ride every ranged hit');
ok(D.against.thorns === 'melee' && D.against.reflect === 'ranged' && D.against.mach === 'ranged' && D.against.canopyCover === 'ranged', 'the defences name the hits they answer');
ok(['reach', 'boomerang', 'bananarang'].every(k=> D.swing.includes(k)), 'Reach, Boomerang and Bananarang make the swing ranged');
ok(Object.keys(D.notes).length >= 30, `edge cases carry a note (${Object.keys(D.notes).length})`);
ok(E.skillDeliveryOf('arrow') === 'ranged' && E.skillDeliveryOf('pounce') === 'melee' && E.skillRidesOn('bleed') === 'melee', 'the engine reads the file');
ok(/__SKILL_DELIVERY__/.test(rd('assemble_arena.py')) && /var __SKILL_DELIVERY__ = /.test(rd('index.html')), 'the build puts it ahead of the engine');
ok(/ranged:true/.test(rd('bramblewood-engine.js')), 'the engine still tags shot events ranged');

// ---- Part B: scenarios
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e34-wall': U('e34-wall', {}), 'e34-thorns': U('e34-thorns', {thorns:3}),
  'e34-cleave': U('e34-cleave', {sweep:true, bleed:2, daunt:1}, {attack:4}),
  'e34-cleave-ven': U('e34-cleave-ven', {sweep:true, poison:2}, {attack:4}),
  'e34-fork': U('e34-fork', {fork:true, daunt:1, breach:1}, {attack:3}),
  'e34-pounce': U('e34-pounce', {pounce:2, poison:2, daunt:1, breach:2}, {attack:1, health:20}),
  'e34-counter': U('e34-counter', {counterattack:true, bleed:2}, {attack:2}), 'e34-hitter': U('e34-hitter', {}, {attack:1}),
  'e34-cinder': U('e34-cinder', {fireBolt:2}, {attack:0}), 'e34-fletcher': U('e34-fletcher', {fletcher:1}),
  'e34-arrow': U('e34-arrow', {arrow:2}, {attack:0}),
  'e34-reach': U('e34-reach', {reach:true}, {attack:1}), 'e34-plain1': U('e34-plain1', {}, {attack:1}), 'e34-cover': U('e34-cover', {canopyCover:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), Object.assign({recordEvents:true, battleMode:'open'}, rules ? {rules} : {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); e.removeDeadCards(P, so, {}, {}, ev); return ev; };

// Cleave: the side hits carry Bleed and Daunt now (Daunt was the swing's alone)
{ const {e, P} = mk(); const a = put(e, P, 1, 'e34-cleave', 0); const t = put(e, P, 2, 'e34-wall', 0), l = put(e, P, 2, 'e34-wall', -1), r = put(e, P, 2, 'e34-wall', 1);
  swing(e, P, a); ok(t.bleed === 2 && (t.daunts || []).length === 1, `the swing: Bleed 2 and a Daunt mark (${t.bleed}, ${(t.daunts || []).length})`);
  ok(l.bleed === 2 && r.bleed === 2, `Cleave's side hits (melee): Bleed 2 each (${l.bleed}, ${r.bleed})`);
  ok((l.daunts || []).length === 1 && (r.daunts || []).length === 1, `Cleave's side hits: Daunt too (${(l.daunts || []).length}, ${(r.daunts || []).length})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e34-cleave-ven', 0); put(e, P, 2, 'e34-wall', 0); const l = put(e, P, 2, 'e34-wall', -1);
  swing(e, P, a); ok(l.poison === 2, `Venomous 2 on a Cleave side hit: 2 Venom (${l.poison})`); }
// Thorns answers a melee skill hit (a Cleave side hit), not only the swing
{ const {e, P} = mk(); const a = put(e, P, 1, 'e34-cleave', 0); put(e, P, 2, 'e34-wall', 0); put(e, P, 2, 'e34-thorns', 1); const hp0 = a.hp; const ev = swing(e, P, a);
  ok(hp0 - a.hp === 3 && ev.some(x=> x.type === 'thorns' && x.via === 'cleave'), `Thorns 3 answers the Cleave side hit (${hp0 - a.hp})`); }
// Fork prongs: Daunt and Breach ride them now
{ const {e, P} = mk(); const a = put(e, P, 1, 'e34-fork', 0); put(e, P, 2, 'e34-wall', 0); const l = put(e, P, 2, 'e34-wall', -1), r = put(e, P, 2, 'e34-wall', 1);
  const hq0 = P[2].hq.hp; swing(e, P, a); const dn = (l.daunts || []).length + (r.daunts || []).length;
  ok(dn >= 1, `a Fork prong lands a Daunt mark (${dn})`); ok(hq0 - P[2].hq.hp >= 2, `Breach rides the swing and its prongs (${hq0 - P[2].hq.hp} to the bramble)`); }
// Pounce: Venom, Daunt and Breach ride the leap (was Venom and Bleed only)
{ const {e, P} = mk(); const t = put(e, P, 2, 'e34-wall', 0); const h = {uid: 9301, defId:'e34-pounce'}; P[1].hand.push(h); P[1].lumber = 9; const hq0 = P[2].hq.hp; const ev = [];
  e.placeCard(P, so, 1, h.uid, 0, {}, ev);
  ok(t.poison === 2, `Pounce (melee): Venomous 2 lands (${t.poison})`); ok((t.daunts || []).length === 1, `Pounce: Daunt lands (${(t.daunts || []).length})`);
  ok(hq0 - P[2].hq.hp === 2, `Pounce: Breach 2 to the bramble (${hq0 - P[2].hq.hp})`); }
// Counterattack: its strike carries Bleed
{ const {e, P} = mk(); const c = put(e, P, 2, 'e34-counter', 0), a = put(e, P, 1, 'e34-hitter', 0); void c; swing(e, P, a); ok(a.bleed === 2, `Counterattack's strike (melee) carries Bleed 2 (${a.bleed || 0})`); }
// Fletcher: every ranged shot (a Cinder now, an Arrow as before)
for(const [id, base] of [['e34-cinder', 2], ['e34-arrow', 2]]){
  const shoot = fl=>{ const {e, P} = mk(); const s = put(e, P, 1, id, 0); if(fl) put(e, P, 1, 'e34-fletcher', 1); const t = put(e, P, 2, 'e34-wall', 0); const hp0 = t.hp;
    e.resolveCombat(P, so, {}, [], 1); return hp0 - t.hp; };
  const a0 = shoot(false), a1 = shoot(true);
  ok(a0 === base && a1 === base + 1, `${id}: ${a0} alone, ${a1} beside Fletcher 1 (a ranged shot)`); }
// A ranged swing (Reach) is covered by Canopy Cover in the woods; a plain ground swing is not
{ let reachMiss = 0, plainMiss = 0;
  for(let s = 1; s <= 40; s++){
    { const {e, P} = mk(s, {woods:true}); const a = put(e, P, 1, 'e34-reach', 0); put(e, P, 2, 'e34-cover', 0); const ev = swing(e, P, a); if(ev.some(x=> x.type === 'evaded' && x.reason === 'canopyCover')) reachMiss++; }
    { const {e, P} = mk(s, {woods:true}); const a = put(e, P, 1, 'e34-plain1', 0); put(e, P, 2, 'e34-cover', 0); const ev = swing(e, P, a); if(ev.some(x=> x.type === 'evaded' && x.reason === 'canopyCover')) plainMiss++; } }
  ok(reachMiss >= 8 && reachMiss <= 32, `a Reach swing (ranged) is dodged under the canopy about half the time (${reachMiss}/40)`); ok(plainMiss === 0, `a plain melee swing is not (${plainMiss}/40)`); }

// ---- texts and translations
const tx = rd('bramblewood-texts.js'), txv = k=> (tx.match(new RegExp('"' + k.replace(/[.]/g, '\\.') + '":\\s*"([^"]*)"')) || [])[1];
const T = {'ui.eng33-venomous': 'Every melee hit it lands adds {n} Venom.', 'ui.eng34-bleed': 'Every melee hit it lands adds {n} Bleed.',
  'ui.ui31-daunt': 'On every melee hit it lands, the target loses {n} Attack until the end of next round. Stacks.', 'ui.sk-breach': 'Every melee hit it lands also deals {n} damage to the enemy bramble.',
  'ui.eng34-fletcher': "Your units' ranged shots deal {n} more damage.", 'ui.sk-weapon-master': "Your side's ranged shots deal {n} more; your equipped units get +1/+1."};
for(const [k, v] of Object.entries(T)) ok(txv(k) === v, `${k}: "${txv(k)}"`);
ok(/TX\('ui\.eng34-bleed'/.test(app) && /TX\('ui\.eng34-fletcher'/.test(app), 'the card line and the editor read the new keys');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const L = J('lang/' + code + '.json');
  const miss = Object.values(T).filter(v=> !(typeof L[v] === 'string' && L[v].includes('{n}')));
  ok(!miss.length, `${code}: the ${Object.keys(T).length} texts are translated (${miss.join(' | ')})`); }

// ---- docs and the workbook tool
ok(/ENG34/.test(rd('docs/project-state.md')) && /every melee hit/i.test(rd('docs/project-state.md')), 'project-state names the rule');
ok(/ENG34/.test(rd('docs/effects-catalogue.md')), 'the effects catalogue names the rule');
ok(/ENG34/.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(fs.existsSync(path.join(ROOT, 'tools/export_workbook_2026_11_07.py')) && /Delivery/.test(rd('tools/export_workbook_2026_11_07.py')), 'the workbook tool writes a Delivery column');
ok(fs.existsSync(path.join(ROOT, 'docs/exports/bramblewood-game-data.xlsx')), 'the workbook is in docs/exports');
const dec = J("docs/decisions.json"); const dl = (dec.items || []).filter(d=> /^ENG34-/.test(d.id || ""));
ok(dl.length >= 3, `ENG34 decisions filed (${dl.length})`);

console.log(`eng34: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
