#!/usr/bin/env node
// 2026-10-23 (package EN): the owner's 10-23 00:10 answers GD2-1, GD2-5, TR-4 .. TR-6, EV-1 .. EV-7, FX2-1, D21, D24, FOG1 and his 01:57
// notes 2 (Bulwark N), 5 (the Mimic) and 10 (Swarm without Structures). Engine scenarios, prices and data pins.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'en-wall': U('en-wall', {}), 'en-hit3': U('en-hit3', {}, {attack:3}),
  'en-assault': U('en-assault', {assault:2}, {attack:3}), 'en-counter': U('en-counter', {counterattack:true, assault:5}, {attack:2}),
  'en-king': U('en-king', {king:true}), 'en-liege': U('en-liege', {liege:true}, {attack:3}), 'en-liege2': U('en-liege2', {liege:true, liegeGrant:{armor:3}}, {attack:1}),
  'en-rage': U('en-rage', {rage:true, rageGrant:{armor:2}}, {attack:2, health:10}),
  'en-ant': U('en-ant', {swarm:true}, {attack:1, archetypes:['Ants']}), 'en-ant2': U('en-ant2', {}, {archetypes:['Ants']}),
  'en-antwall': U('en-antwall', {}, {archetypes:['Ants', 'Structure']}),
  'en-bulwark': U('en-bulwark', {bulwark:2}, {attack:1, health:10}),
  'en-shape': U('en-shape', {shapeshifter:true}, {archetypes:['Structure', 'Cave']}), 'en-struct': U('en-struct', {}, {archetypes:['Structure', 'Insect']}),
  'en-bird': U('en-bird', {}, {archetypes:['Bird']}),
  'en-dyn': U('en-dyn', {dynamite:1}, {}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open'}, opts || {}, rules ? {rules} : {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c)=>{ const ev = []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };

// ---- TR-4 Assault N: +N on its own swing, not on a counter
{ const {e, P} = mk(); const a = put(e, P, 1, 'en-assault', 0), t = put(e, P, 2, 'en-wall', 0); swing(e, P, a);
  ok(t.hp === 495, `Assault 2: a 3-Attack swing lands 5 (${500 - t.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'en-hit3', 0), d = put(e, P, 2, 'en-counter', 0); swing(e, P, a);
  ok(a.hp === 498, `Assault 5 on a Counterattack unit: its counter is its plain 2 (${500 - a.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'en-assault', 0); swing(e, P, a); ok(P[2].hq.hp === 195, `Assault 2 reaches the bramble too (${200 - P[2].hq.hp})`); }

// ---- TR-4 Liege {…}: only while a King of its side is on the battlefield; Assault 2 by default
{ const {e, P} = mk(); const l = put(e, P, 1, 'en-liege', 0), t = put(e, P, 2, 'en-wall', 0); e.syncPhaseStats(P, so, []); swing(e, P, l);
  ok(t.hp === 497, `Liege without a King: a plain 3 (${500 - t.hp})`); }
{ const {e, P} = mk(); const l = put(e, P, 1, 'en-liege', 0), t = put(e, P, 2, 'en-wall', 0); put(e, P, 1, 'en-king', 1); e.syncPhaseStats(P, so, []); swing(e, P, l);
  ok(t.hp === 495, `Liege with a King beside it: Assault 2, 3 + 2 (${500 - t.hp})`); }
{ const {e, P} = mk(); const l = put(e, P, 1, 'en-liege', 0), t = put(e, P, 2, 'en-wall', 0); put(e, P, 2, 'en-king', 1); e.syncPhaseStats(P, so, []); swing(e, P, l);
  ok(t.hp === 497, `Liege with only an enemy King: a plain 3 (${500 - t.hp})`); }
{ const {e, P} = mk(); const l = put(e, P, 1, 'en-liege2', 0); put(e, P, 1, 'en-king', 1); e.syncPhaseStats(P, so, []);
  ok((e.effectsOf(l).armor | 0) === 3, `Liege – {Armor 3} with a King: Armor 3 (${e.effectsOf(l).armor})`); }

// ---- TR-6 Rage {…}: Rage plus the braces while raging; Enraged is gone
{ const {e, P} = mk(); const r = put(e, P, 1, 'en-rage', 0); e.syncPhaseStats(P, so, []); ok(!e.effectsOf(r).armor, 'Rage – {Armor 2} above half Health: no Armor');
  r.hp = 4; e.syncPhaseStats(P, so, []); ok((e.effectsOf(r).armor | 0) === 2, `Rage – {Armor 2} below half Health: Armor 2 (${e.effectsOf(r).armor})`);
  e.syncPhaseStats(P, so, []); ok((e.effectsOf(r).armor | 0) === 2, 'Rage – {…}: stays on at the next sync (no flip)');
  r.hp = 9; e.syncPhaseStats(P, so, []); ok(!e.effectsOf(r).armor, 'Rage – {…}: healed above half, the braces go'); }
{ const {e} = mk(); ok(!('enraged' in e.TRANSFORM_PRESETS), 'the Enraged transform preset is gone'); }

// ---- 01:57 note 10: Swarm does not count Structures
{ const {e, P} = mk(); const a = put(e, P, 1, 'en-ant', 0); put(e, P, 1, 'en-ant2', 1); put(e, P, 1, 'en-antwall', -1);
  ok(e.swarmBonusOf(P, a) === 1, `Swarm: an Ant ally counts, an Ant Structure does not (${e.swarmBonusOf(P, a)})`); }

// ---- 01:57 note 2: Bulwark N raises two 0/4N shields as it arrives
{ const {e, P} = mk(); const h = {uid: 9001, defId:'en-bulwark'}; P[1].hand.push(h); P[1].lumber = 5;
  const ev = []; ok(e.placeCard(P, so, 1, h.uid, 0, {}, ev) !== false, 'Bulwark 2 is played');
  const sh = all(P[1]).filter(c=> (defs[c.defId] || e.derivedDefs[c.defId] || {}).bulwarkShield);
  ok(sh.length === 2 && sh.every(c=> c.hp === 8 && (c.atk | 0) === 0), `Bulwark 2: two 0/8 shields (${sh.map(c=> c.atk + '/' + c.hp).join(', ')})`);
  ok(sh.every(c=> Math.abs(c.slot) === 1), `the shields stand in the free slots nearest it (${sh.map(c=> c.slot).join(', ')})`);
  ok(e.derivedDefs[sh[0].defId].archetypes.includes('Structure'), 'a shield is a Structure'); }
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/function bulwarkReductionFor\(pl\)\{ return 0; \}/.test(src), 'Bulwark no longer takes damage off the bramble\'s hits (bulwarkReductionFor is 0)'); }

// ---- GD2-5: Dynamite's surrounding allies on the raid board (rows in front and behind, diagonals included)
{ const {e, P} = mk({reserveRows:2, reserveActs:true}); const d = put(e, P, 1, 'en-dyn', 0); const f = e.fillReserve(P[1], 1, 1, 'en-wall'), far = e.fillReserve(P[1], 1, 2, 'en-wall');
  d.fuse = 1; for(let r = 1; r <= 3 && f.hp === 500; r++) e.roundStart(P, r, so, {}, []);
  ok(f.hp < 500 && far.hp === 500, `Dynamite on the raid board: the diagonal ally behind it is hit (${500 - f.hp}), one two columns over is not (${500 - far.hp})`); }

// ---- 01:57 note 5: Shapeshifter shares a type with every Structure, and only with Structures
{ const T = require('../bramblewood-taxonomy.js');
  ok(T.shares(defs['en-shape'], defs['en-struct']) && T.shares(defs['en-struct'], defs['en-shape']), 'Shapeshifter shares a type with a Structure, both ways');
  ok(!T.shares(defs['en-shape'], defs['en-bird']), 'Shapeshifter shares nothing with a Bird');
  ok(T.isA(defs['en-shape'], 'Structure') && !T.isA(defs['en-shape'], 'Bird'), 'Shapeshifter is a Structure, not a Bird'); }

// ---- EV-4: an evolute waits its own Wait plus the base's remaining Wait
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/base\.wait = Math\.max\(0, fresh\.wait \|\| 0\) \+ Math\.max\(0, base\.wait \|\| 0\)/.test(src), 'EV-4: evoluteMerge adds the base\'s remaining Wait'); }

// ---- FX2-1: after an Eruption the volcano is Very Low, then climbs a level a round back to its own
{ const {e, P} = mk({}, 5, {volcano:'high', lavaTideChance:0, petrifyChance:0}); put(e, P, 1, 'en-wall', 0); put(e, P, 2, 'en-wall', 0);
  let er = 0; for(let r = 2; r <= 30 && !er; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); if(ev.some(x=> x.field === 'eruptionReset')) er = r; }
  ok(er > 0, `a high volcano erupts (round ${er})`);
  const seq = [1, 2, 3, 4, 5].map(k=> (e.volcanoChances(er + k) || {}).eruption);
  ok(seq.join() === '3,14,24,55,70', `after it: Very Low, Low, Medium, Even, High (eruption odds ${seq.join(' / ')})`);
  const fc = e.forecast ? e.forecast(P, er) : null; ok(!fc || !fc.volcano || fc.volcanoLevel, 'the forecast names the level'); }

// ---- D24: the second player gets +1 Shield on its bramble and nothing else
{ const {e, P} = mk({}, 5, {actions:2}); const hand = P[2].hand.length, hp = P[2].hq.maxHp, lum = P[2].lumber || 0;
  e.applySecondPlayerBonus(P[2], 'B', {}, []);
  ok(P[2].hand.length === hand && P[2].hq.maxHp === hp && (P[2].lumber || 0) === lum && P[2].hq.shield === 1, `second player: +1 Shield only (hand +${P[2].hand.length - hand}, Health +${P[2].hq.maxHp - hp}, Shield ${P[2].hq.shield})`); }

// ---- FOG1: the CPU plays through the fog (it cannot read your fogged units)
{ const {e, P} = mk({}, 5, {fogOfWar:true}); put(e, P, 2, 'en-wall', 0); const near = put(e, P, 1, 'en-wall', 0), far = put(e, P, 1, 'en-wall', 5);
  const fog = e.aiFogFor(P, 2); ok(fog && fog.has(far.uid) && !fog.has(near.uid), 'FOG1: the CPU cannot see your unit out of its reach, and sees the one facing it');
  const h = {uid: 7001, defId:'en-hit3'}; P[2].hand.push(h); P[2].lumber = 5; e.aiTakeTurn(P, so, 2, {}, []); ok(all(P[2]).some(x=> x.defId === 'en-hit3'), 'with fog the CPU still plays its card');
  const {e: e2, P: P2} = mk(); put(e2, P2, 2, 'en-wall', 0); put(e2, P2, 1, 'en-wall', 5); ok(e2.aiFogFor(P2, 2) === null, 'no Fog of War: the CPU sees everything');
  const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/aiFog = aiFogFor\(players, aiId\)/.test(src) && /const across = sl=> aiFront\(foe, sl\)/.test(src), 'FOG1: aiTakeTurn computes the CPU\'s fog; its slot choice reads aiFront'); }

// ---- prices (canonical/skill-costs.json and bramblewood-budget.js)
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const sk = id=> costs.skills.find(x=> x.id === id) || {};
const BB = require('../bramblewood-budget.js');
ok(sk('king').value === 1.4 && sk('kingly').value === 3.5, `King 1.4, Kingly 3.5 (${sk('king').value}, ${sk('kingly').value})`);
ok(sk('assault').scale === 'n' && sk('assault').value === 1.8, `Assault 1.8 a point (${sk('assault').value})`);
ok(sk('liege').value === 1.08 && BB.CONTEXT_MULT_BY.liegeGrant === 0.3, `Liege 0.3 x Assault 2 = 1.08 (${sk('liege').value}; braces x${BB.CONTEXT_MULT_BY.liegeGrant})`);
ok(BB.CONTEXT_MULT_BY.rageGrant === 0.4 && !BB.CONTEXT_FLAG.rage, 'Rage – {…}: Rage keeps its price, + 0.4 x the braces');
ok(sk('bulwark').scale === 'n' && sk('bulwark').value === 8, `Bulwark 8 a point (${sk('bulwark').value})`);
ok(sk('backstab').scale === 'n' && sk('backstab').value === 0.6, `Backstab 0.6 a point (${sk('backstab').value})`);
ok(sk('evoluteAlpha').value === 3 && sk('evoluteOmega').value === 3 && sk('evolute').value === 3, 'EV-5: Evolute, Alpha and Omega 3');
ok(sk('spellward').value > 0 && !costs.skills.some(x=> x.id === 'spellshield' || x.id === 'enraged'), 'GD2-1 / TR-6: spellward priced; no spellshield or enraged entry');
{ const SC = require('../tools/skill_costs.js'), T = SC.make(costs);
  const s1 = T.cardS({rage:true, rageGrant:{armor:2}}).S, s0 = T.cardS({rage:true}).S;
  ok(Math.abs((s1 - s0) - 0.4 * 2 * 1.5) < 0.01, `Rage – {Armor 2} costs Rage + 0.4 x 3 (${s0} -> ${s1})`);
  ok(Math.abs(T.cardS({liege:true, liegeGrant:{armor:2}}).S - 0.9) < 0.01, `Liege – {Armor 2} costs 0.3 x 3 = 0.9 (${T.cardS({liege:true, liegeGrant:{armor:2}}).S})`); }

// ---- cards
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = new Map(cards.map(c=> [c.id, c]));
ok(cards.filter(c=> c.effects && c.effects.king).map(c=> c.id).join() === 'magnate-duck', 'TR-4: the Magnate Duck is the only King');
ok(!byId.get('rodent-king').effects.bounty && !byId.get('glacial-ape-king').effects.bounty, 'TR-4: King off the Rodent King and the Glacial Ape-King; Bounty stays off (BF8: loot carriers only)');
ok(byId.get('magnate-duck').health > 1, `TR-4: the Magnate Duck is not at its 1/1 floor (${byId.get('magnate-duck').attack}/${byId.get('magnate-duck').health})`);
ok(!cards.some(c=> c.effects && (c.effects.spellshield || (c.effects.transform && c.effects.transform.name === 'enraged'))), 'no card keeps Spellshield or Enraged');
{ const babies = cards.filter(c=> c.levelSkills && c.levelSkills['1'] && c.levelSkills['1'].stem);
  ok(babies.length >= 20 && babies.every(c=> !(c.effects || {}).stem && c.mechanicLine !== 'evolution'), `EV-6: ${babies.length} baby-like cards gain Stem (Fodder) at Level 1, none has it at Level 0`); }
{ const m = byId.get('coffer-mimic');
  ok(m && m.effects.shapeshifter && m.effects.thorns === 4 && m.cost === 1 && m.wait === 1 && (m.archetypes || []).includes('Structure') && !m.effects.changeling, 'the Coffer Mimic: a Structure Shapeshifter, Thorns 4, Lumber 1, Wait 1');
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
  ok(pools.maps.m4.cards.includes('coffer-mimic'), 'the Coffer Mimic is in Map 8\'s pool (the caves)');
  ok(cards.filter(c=> c.numericId === m.numericId).length === 1, 'its numericId is unique'); }
ok(byId.get('terraumbra').mechanicLine === 'evolution' && byId.get('terraumbra').cardType === 'equipment', 'EV-1: the Terraumbra is the Evomax equipment');

// ---- app: editor rows, the migration, the texts
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
for(const k of ['assault', 'liege', 'liegeGrant', 'rageGrant', 'shapeshifter', 'spellward']) ok(new RegExp(`'${k}', \\{category:'passive'|\\{key:'${k}', category:'passive'`).test(app), `editor row for ${k}`);
ok(/function enMigrateCard\(c\)/.test(app) && /enMigrateCard\(liveCards\[id\]\)/.test(app), 'saved cards migrate Spellshield -> Spellward and Enraged -> Rage – {…}');
{ const fn = app.slice(app.indexOf('function enMigrateCard(c)'), app.indexOf('// ==== end of Package SK1 (registry)')); const enMigrateCard = new Function(fn + '; return enMigrateCard;')();
  const m1 = enMigrateCard({effects:{spellshield:true}}), m2 = enMigrateCard({effects:{transform:{name:'enraged', gain:{armor:2}}}});
  ok(m1.effects.spellward === true && !('spellshield' in m1.effects), 'migration: spellshield -> spellward');
  ok(m2.effects.rage === true && m2.effects.rageGrant.armor === 2 && !m2.effects.transform, 'migration: Enraged {Armor 2} -> Rage – {Armor 2}'); }
for(const k of ['ui.skn-spellward', 'ui.sk-assault', 'ui.sk-liege', 'ui.sk-rage-grant', 'ui.sk-shapeshifter', 'ui.sk-bulwark', 'ui.sk-backstab', 'ui.term-surrounding', 'ui.en-bulwark-shield'])
  ok(texts.includes(`"${k}"`), `text ${k}`);
ok(/Structures don't count\.` \/\*/.test(app) && /to every surrounding unit/.test(texts) && /\{name:'Surrounding', re:'surrounding'/.test(app), 'Dynamite says "surrounding"; the Codex term sits beside Adjacent');
ok(!/opens with an extra card/.test(app), 'D24: no Arena text promises an extra card');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  ok(p['Spellward'] && !p['Spellshield'] && p['Surrounding'] && p['While a King is on your side: {skills}.'], `${code}: Spellward, Surrounding, Liege translated`); }

console.log(`en-2026-10-23: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
