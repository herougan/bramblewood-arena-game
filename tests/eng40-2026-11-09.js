#!/usr/bin/env node
// 2026-11-09 (package ENG40, owner decisions 2026-11-09 23:05 / 23:07): 1 Hoard N = +N/+N for every 3 Lumber / 2 Stone / 1 Metal (ENG36-1),
// 2 a gentler summon level curve, Log Wall 0/6 at Level 10 (ENG36-3), 3 a ranged swing carries no melee rider and Reach is melee again
// (ENG34-1 b), 4 Fletcher and Weapon Master on arrows only (ENG34-3 c), 5 the seven plant cards are species Plant, not Elemental,
// 6 Esprit {v: 0} costs only its Health part and Sunthroat Courier is written {v: 0, hp: 1} (ENG39-3 b). Texts, packs, docs, decisions.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const SPL = require('../bramblewood-skillparams.js'), BB = require('../bramblewood-budget.js'), SC = require('../tools/skill_costs.js');
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e40-wall': U('e40-wall', {}),
  'e40-h1': U('e40-h1', {hoard:1}, {attack:1, health:10}), 'e40-h2': U('e40-h2', {hoard:2}, {attack:1, health:10}),
  'e40-hs': U('e40-hs', SPL.expand({hoard:{v:1, res:'stone'}}), {attack:1, health:10}), 'e40-hm': U('e40-hm', SPL.expand({hoard:{v:1, res:'metal'}}), {attack:1, health:10}),
  'e40-tim': U('e40-tim', SPL.expand({hoard:{kind:'timber'}}), {attack:1, health:10}),
  'e40-bul@10': U('e40-bul@10', {bulwark:1}, {attack:1, health:10, level:10, baseLevel:1, derivedFrom:'e40-bul'}),
  'e40-bul@7': U('e40-bul@7', {bulwark:1}, {attack:1, health:10, level:7, baseLevel:1, derivedFrom:'e40-bul'}),
  'e40-bul@5': U('e40-bul@5', {bulwark:1}, {attack:1, health:10, level:5, baseLevel:1, derivedFrom:'e40-bul'}),
  'e40-boom': U('e40-boom', {boomerang:true, bleed:2, daunt:1, poison:2}, {attack:2}),
  'e40-reach': U('e40-reach', {reach:true, bleed:2, daunt:1}, {attack:2}),
  'e40-plain': U('e40-plain', {bleed:2, daunt:1}, {attack:2}),
  'e40-boom-wave': U('e40-boom-wave', {boomerang:true, wave:true}, {attack:2}),
  'e40-cover': U('e40-cover', {canopyCover:true}),
  'e40-fletcher': U('e40-fletcher', {fletcher:1}),
  'e40-arrow': U('e40-arrow', {arrow:2}), 'e40-farrow': U('e40-farrow', SPL.expand({arrow:{v:2, type:'fire'}})),
  'e40-fbolt': U('e40-fbolt', SPL.expand({arrow:{v:2, type:'fire', form:'bolt'}})), 'e40-abolt': U('e40-abolt', SPL.expand({arrow:{v:2, type:'acid', form:'bolt'}})),
  'e40-archer': U('e40-archer', SPL.expand({arrow:{v:2, swings:'never'}}), {attack:3}),
  'e40-esp': U('e40-esp', SPL.expand({esprit:{v:0, hp:1}}), {attack:2, health:5, species:['Bird'], archetypes:['Hummingbird']}), 'e40-bird': U('e40-bird', {}, {attack:1, health:3, species:['Bird'], archetypes:['Hummingbird']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), Object.assign({recordEvents:true, battleMode:'open'}, rules ? {rules} : {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); e.removeDeadCards(P, so, {}, {}, ev); return ev; };

// ================= 1. Hoard N: +N/+N for every 3 Lumber, 2 Stone, 1 Metal =================
{ const hoard = (id, res, n)=>{ const {e, P} = mk(); const c = put(e, P, 1, id, 0); P[1][res] = n; e.syncPhaseStats(P, so, []); return [c.phaseAtk | 0, c.maxHp - 10]; };
  for(const [id, res, n, want] of [['e40-h1', 'lumber', 2, 0], ['e40-h1', 'lumber', 3, 1], ['e40-h1', 'lumber', 5, 1], ['e40-h1', 'lumber', 6, 2], ['e40-h2', 'lumber', 7, 4],
    ['e40-hs', 'stone', 1, 0], ['e40-hs', 'stone', 2, 1], ['e40-hs', 'stone', 5, 2], ['e40-hs', 'lumber', 9, 0], ['e40-hm', 'metal', 1, 1], ['e40-hm', 'metal', 3, 3], ['e40-hm', 'lumber', 9, 0]]){
    const [a, h] = hoard(id, res, n); ok(a === want && h === want, `${id} with ${n} ${res}: +${want}/+${want} (${a}/${h})`); }
  const [ta, th] = hoard('e40-tim', 'lumber', 2); ok(ta === 2 && th === 2, `Timber (Hoard {kind: timber}) keeps +1/+1 a Lumber (${ta}/${th})`);
  const HP = E.makeSimEngine(defs, E.mulberry32(1), {}).HOARD_PER; ok(HP && HP.lumber === 3 && HP.stone === 2 && HP.metal === 1, 'HOARD_PER: 3 Lumber, 2 Stone, 1 Metal');
  ok(JSON.stringify(SPL.expand({hoard:{v:2, res:'stone'}})) === JSON.stringify({hoard:2, hoardRes:'stone'}) && JSON.stringify(SPL.fuse({hoard:2, hoardRes:'metal'})) === JSON.stringify({hoard:{v:2, res:'metal'}}), 'skill-params: Hoard {v, res} <-> hoard + hoardRes');
  const T = SC.make(J('canonical/skill-costs.json')), S = e=> T.cardS(e).S;
  ok(S({hoard:1}) === 1 && S({hoard:2}) === 2 && S(SPL.expand({hoard:{v:1, res:'stone'}})) === 0.8 && S(SPL.expand({hoard:{v:1, res:'metal'}})) === 2, `priced 1 x N (Lumber), x0.8 Stone, x2 Metal (${S({hoard:1})}, ${S(SPL.expand({hoard:{v:1, res:'stone'}}))}, ${S(SPL.expand({hoard:{v:1, res:'metal'}}))})`);
  ok(BB.HOARD_RES_MULT.stone === 0.8 && BB.HOARD_RES_MULT.metal === 2, 'HOARD_RES_MULT from the state skills\' uptimes (Bedrock 0.2, Forged 0.5 over Timbered 0.25)');
  ok(BB.PARAMS.includes('hoardRes') && !BB.abilitiesOf(SPL.expand({hoard:{v:1, res:'stone'}})).includes('hoardRes'), 'hoardRes is a parameter, not an ability');
  const cards = J('canonical/cards.json'), by = id=> cards.find(c=> c.id === id);
  ok(by('tax-collector-teal').effects.hoard === 1 && by('magnate-duck').effects.hoard === 1 /* 2026-11-10 (BAL34, ENG40-1 a): both to Hoard 1 (were 0.75 / 0.25) */ && by('tax-collector-teal').attack === 1 && by('tax-collector-teal').health === 4 && by('magnate-duck').attack === 2 && by('magnate-duck').health === 37, 'the Hoard cards keep their values and stats (re-fit asked: ENG40-1)');
  for(const id of ['tax-collector-teal', 'magnate-duck', 'heartwood-treant']){ const b = T.budget(by(id)); ok(b.ok, `${id} is in budget under the new rule (${b.x1} <= ${b.N})`); } }

// ================= 2. summons: half the level curve's growth =================
{ const wall = {id:'bulwark-wall', attack:0, health:4, wait:0, cost:0, rarity:'common', token:true, effects:{guardian:true}};
  const at = L=> E.makeSimEngine(defs, E.mulberry32(1), {}).eng36StatsAt(wall, L).health;
  ok(at(1) === 4 && at(6) === 4 && at(7) === 5 && at(9) === 5 && at(10) === 6 && at(11) === 6 && at(0) === 3, `Log Wall: 0/4 at 1-6, 0/5 at 7-9, 0/6 at 10-11, 0/3 at 0 (${[0, 1, 4, 6, 7, 9, 10, 11].map(at).join(' ')})`);
  ok(E.makeSimEngine(defs, E.mulberry32(1), {}).ENG40_SUMMON_GROWTH === 0.5, 'ENG40_SUMMON_GROWTH 0.5');
  const wallsOf = id=>{ const {e, P} = mk(); const h = {uid: 9500, defId:id}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
    const dd = c=> e.derivedDefs[c.defId] || defs[c.defId] || {}; return all(P[1]).filter(c=> dd(c).bulwarkWall).map(c=> c.atk + '/' + c.hp).join(','); };
  ok(wallsOf('e40-bul@10') === '0/6' && wallsOf('e40-bul@7') === '0/5' && wallsOf('e40-bul@5') === '0/4', `Bulwark at Level 10 / 7 / 5: ${wallsOf('e40-bul@10')} / ${wallsOf('e40-bul@7')} / ${wallsOf('e40-bul@5')}`);
  const big = {id:'e40-big', attack:3, health:12, token:true, rarity:'common', effects:{}}, eng = E.makeSimEngine(defs, E.mulberry32(1), {}), s10 = eng.eng36StatsAt(big, 10);
  ok(s10.attack === 3 && s10.health === 14, `other summons the same way: a 3/12 token is 3/14 at Level 10 (${s10.attack}/${s10.health})`); }

// ================= 3. a ranged swing carries no melee rider; Reach is melee =================
{ const D = J('canonical/skill-delivery.json');
  ok(!D.swing.includes('reach') && D.swing.includes('boomerang') && D.swing.includes('bananarang') && D.delivery.reach === 'melee', 'skill-delivery.json: Reach off the swing list, delivery melee');
  ok(/ENG40/.test(D.notes.reach) && /ENG40/.test(D.notes.boomerang), 'notes explain it');
  const hitOf = id=>{ const {e, P} = mk(3); const a = put(e, P, 1, id, 0), t = put(e, P, 2, 'e40-wall', 0); swing(e, P, a); return t; };
  const pl = hitOf('e40-plain'), rc = hitOf('e40-reach'), bm = hitOf('e40-boom');
  ok(pl.bleed === 2 && (pl.daunts || []).length === 1, `a plain swing carries Bleed and Daunt (${pl.bleed}, ${(pl.daunts || []).length})`);
  ok(rc.bleed === 2 && (rc.daunts || []).length === 1, `a Reach swing (melee) carries Bleed and Daunt (${rc.bleed}, ${(rc.daunts || []).length})`);
  ok(bm.hp < 500 && !(bm.bleed > 0) && !(bm.daunts || []).length && !(bm.poison > 0), `a Boomerang swing lands (${500 - bm.hp}) but carries no Bleed, Daunt or Venom (${bm.bleed | 0}, ${(bm.daunts || []).length}, ${bm.poison | 0})`);
  const eng = E.makeSimEngine(defs, E.mulberry32(1), {});
  ok(eng.eng40MeleeSwing(null, defs['e40-reach']) === true && eng.eng40MeleeSwing(null, defs['e40-boom']) === false && eng.eng40MeleeSwing(null, defs['e40-plain']) === true, 'eng40MeleeSwing: Reach and plain melee, Boomerang ranged');
  let reachMiss = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(s, {woods:true}); const a = put(e, P, 1, 'e40-reach', 0); put(e, P, 2, 'e40-cover', 0); if(swing(e, P, a).some(x=> x.type === 'evaded' && x.reason === 'canopyCover')) reachMiss++; }
  ok(reachMiss === 0, `Canopy Cover no longer dodges a Reach swing (${reachMiss}/30)`);
  let boomMiss = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(s, {woods:true}); const a = put(e, P, 1, 'e40-boom', 0); put(e, P, 2, 'e40-cover', 0); if(swing(e, P, a).some(x=> x.type === 'evaded' && x.reason === 'canopyCover')) boomMiss++; }
  ok(boomMiss >= 6 && boomMiss <= 24, `a thrown Boomerang still is (${boomMiss}/30)`); }

// ================= 4. Fletcher on arrows only =================
{ const shoot = (id, fl)=>{ const {e, P} = mk(); const s = put(e, P, 1, id, 0); if(fl) put(e, P, 1, 'e40-fletcher', 1); const t = put(e, P, 2, 'e40-wall', 0); const hp0 = t.hp;
    s.wait = 0; e.resolveCombat(P, so, {}, [], 1); return hp0 - t.hp; };
  for(const [id, plus] of [['e40-arrow', 1], ['e40-farrow', 1], ['e40-archer', 1], ['e40-fbolt', 0], ['e40-abolt', 0]]){
    const a0 = shoot(id, false), a1 = shoot(id, true); ok(a1 - a0 === plus, `${id}: ${a0} alone, ${a1} beside Fletcher 1 (+${plus})`); }
  ok(/eng40ArrowShot/.test(rd('bramblewood-engine.js')) && /ENG40/.test(J('canonical/skill-delivery.json').notes.fletcher), 'the engine marks arrows (eng40ArrowShot); the note says so'); }

// ================= 5. Flora are not Elementals =================
{ const cards = J('canonical/cards.json'), TX = require('../bramblewood-taxonomy.js');
  const ids = ['ent', 'bramble-sprout', 'thornvine-lasher', 'elder-willow', 'strangler-vine', 'cypress-root-lurker', 'pinecone-sapper'];
  const cs = ids.map(id=> cards.find(c=> c.id === id));
  ok(cs.every(c=> c && JSON.stringify(c.species) === '["Plant"]' && c.subtype === 'plant'), 'the seven plant cards are species Plant');
  ok(cs.every(c=> !TX.isA(c, 'Elemental') && TX.isA(c, 'Flora')), 'none is an Elemental; all are Flora');
  ok(!cards.some(c=> (c.species || []).includes('Elemental') && c.subtype === 'plant'), 'no plant-subtype card is species Elemental');
  // Nature's Force (+N/+N to your Elementals) no longer lifts them
  const {e, P} = mk(); const ent = put(e, P, 1, 'ent', 0); put(e, P, 1, 'lichen-tortoise', 1); e.syncPhaseStats(P, so, []); e.resolveCombat(P, so, {}, [], 2);
  ok(!(ent.natureBonus > 0), `Nature's Force no longer lifts the Ent (${ent.natureBonus | 0})`); }

// ================= 6. Esprit {v: 0} =================
{ const T = SC.make(J('canonical/skill-costs.json')), cards = J('canonical/cards.json'), c = cards.find(x=> x.id === 'sunthroat-courier');
  ok(JSON.stringify(c.effects.esprit) === JSON.stringify({v: 0, hp: 1}), 'Sunthroat Courier is "esprit": {"v": 0, "hp": 1}');
  const a = T.budget(c), b = T.budget(Object.assign({}, c, {effects: Object.assign({}, c.effects, {esprit: {v: null, hp: 1}})}));
  ok(a.S === b.S && a.S === 1.1, `the same price as {v: null} (S ${a.S} vs ${b.S})`);
  ok(BB.zeroFree('esprit', 0) && !BB.zeroFree('esprit', 1) && T.cardS({esprit: 1}).S > 0, 'zeroFree: Esprit 0 only; Esprit 1 keeps its price');
  const {e, P} = mk(); const s = put(e, P, 1, 'e40-esp', 0); const h = {uid: 9800, defId:'e40-bird'}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 1, {}, []);
  ok(s.atk === 2 && s.maxHp === 6, `Esprit {v: 0, hp: 1}: a kin played gives +0/+1 (${s.atk}/${s.maxHp})`); }

// ================= texts, packs, docs, decisions =================
{ const tx = rd('bramblewood-texts.js'), txv = k=> (tx.match(new RegExp('"' + k.replace(/[.]/g, '\\.') + '":\\s*"((?:[^"\\\\]|\\\\.)*)"')) || [])[1];
  const T = {'ui.eng36-hoard': '+{n}/+{n} for every 3 Lumber you hold.', 'ui.eng40-hoard-stone': '+{n}/+{n} for every 2 Stone you hold.', 'ui.eng40-hoard-metal': '+{n}/+{n} for each Metal you hold.',
    'ui.eng34-fletcher': "Your units' arrows deal {n} more damage.", 'ui.sk-weapon-master': "Your side's arrows deal {n} more; your equipped units get +1/+1."};
  for(const [k, v] of Object.entries(T)) ok(txv(k) === v, `${k}: "${txv(k)}"`);
  const long = "While it is on the field, your units' arrows deal {n} more damage (its own too). Bolts, spits and other shots don't.";
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const L = J('lang/' + code + '.json');
    const miss = Object.values(T).concat([long]).filter(v=> !(typeof L[v] === 'string' && L[v].includes('{n}'))); ok(!miss.length, `${code}: translated (${miss.join(' | ')})`); } }
{ const ps = rd('docs/project-state.md'), cat = rd('docs/effects-catalogue.md'), cl = rd('docs/CHANGELOG.md');
  ok(/ENG40/.test(ps) && /every 3 Lumber/.test(ps) && /Reach is melee/.test(ps), 'project-state.md: the ENG34 / ENG36 bullets');
  ok(/ENG40/.test(cat) && /every 3 Lumber/.test(cat), 'effects-catalogue.md');
  ok(/^## 2026-11-09[^\n]*ENG40/m.test(cl), 'CHANGELOG entry');
  ok(/tests\/eng40-2026-11-09\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
  const items = J('docs/decisions.json').items, d1 = items.find(x=> x.id === 'ENG40-1'), d2 = items.find(x=> x.id === 'ENG40-2');
  // 2026-11-10 (BAL34): both answered a (DONE) and applied by BAL34; asked or answered, each stays under 100 words
  ok(d1 && d2 && [d1, d2].every(d=> d.status === 'DONE' || (d.status === 'YET' && items.indexOf(d) < 3)) && [d1, d2].every(d=> d.body.split(/\s+/).length < 100), 'decisions ENG40-1 (Hoard values) and ENG40-2 (Bulwark price): asked at the top or answered, under 100 words'); }

console.log(`eng40: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
