#!/usr/bin/env node
// 2026-11-16 (package SKN1, owner workbook note 11-16, docs/design/skn1-2026-11-16.md): the owner's skill notes that were clear and mechanical.
// 1 Cure 1 only, 2 Log Walls 0/5 -> 0/8 at Level 10, 3 Daunt rides its own attack only, 4 Counterattack swings when no enemy faces it,
// 5 Illuminate keeps no Diurnal day, 6 Electricity + electric attacks (and Venomous + venom attacks) count as one skill, 7 Offspring costs
// 1 more Lumber, 8 the Fire Arrow / Fire Bolt riders left the app, renames and the Fog pill; texts, packs, decisions.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const BB = require('../bramblewood-budget.js');
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  's1-wall': U('s1-wall', {}),
  's1-cure': U('s1-cure', {cure:2}, {health:20}), 's1-sick': U('s1-sick', {}, {health:20}),
  's1-counter': U('s1-counter', {counterattack:true, daunt:1}, {attack:3, health:50}),
  's1-hitter': U('s1-hitter', {}, {attack:1, health:50}),
  's1-day': U('s1-day', {diurnal:2, diurnalHp:3}, {attack:2, health:5}), 's1-lamp': U('s1-lamp', {illuminate:true}, {attack:1, health:5}),
  's1-off': U('s1-off', {offspring:2}, {attack:4, health:8}),
});
for(const L of [1, 4, 7, 10]) defs['s1-bul@' + L] = U('s1-bul@' + L, {bulwark:1}, {attack:1, health:10, level:L, baseLevel:1, derivedFrom:'s1-bul'});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), Object.assign({recordEvents:true, battleMode:'open'}, rules ? {rules} : {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }

// ================= 1. Cure 1 only =================
{ const {e, P} = mk(); put(e, P, 1, 's1-cure', 0); const t = put(e, P, 1, 's1-sick', 1); t.gpoison = 4; // Greater Poison never wears down: only the Cure moves it
  e.resolveCombat(P, so, {}, [], 1);
  ok(t.gpoison === 3, `a Cure 2 card cures 1 a round (Greater Poison 4 -> ${t.gpoison})`);
  const AT10 = require('./lib/redesign.js').skillsAt10; // 2026-11-19 (TESTFIX6): FOLD7 gave Field Vole Cure from Level 3 (levelSkills)
  const cards = J('canonical/cards.json'), cures = cards.filter(c=> AT10(c).cure);
  const cure0 = c=> (c.effects || {}).cure != null ? c.effects.cure : Object.keys(c.levelSkills || {}).sort((a, b)=> a - b).map(k=> c.levelSkills[k].cure).find(v=> v != null); // as printed where it arrives (levelBonus grows it later)
  ok(cures.length >= 7 && cures.every(c=> cure0(c) === 1), `every Cure card holds Cure 1 (${cures.map(c=> c.id + ' ' + cure0(c)).join(', ')})`); }

// ================= 2. Log Wall 0/5 at Level 1, 0/8 at Level 10 =================
{ const wallsOf = id=>{ const {e, P} = mk(); const h = {uid: 9500, defId:id}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
    const dd = c=> e.derivedDefs[c.defId] || defs[c.defId] || {}; return all(P[1]).filter(c=> dd(c).bulwarkWall).map(c=> c.atk + '/' + c.hp).join(','); };
  const got = [1, 4, 7, 10].map(L=> wallsOf('s1-bul@' + L));
  ok(got.join(' ') === '0/5 0/6 0/7 0/8', `Bulwark 1 at Level 1 / 4 / 7 / 10 raises ${got.join(' / ')} (0/5 -> 0/8)`); }

// ================= 3. Daunt rides its own attack, not its counters or other skill hits =================
{ const D = J('canonical/skill-delivery.json');
  ok(D.rides.daunt === 'swing' && /SKN1/.test(D.notes.daunt), 'skill-delivery.json: Daunt rides its swing');
  const {e, P} = mk(3); const c = put(e, P, 1, 's1-counter', 0), h = put(e, P, 2, 's1-hitter', 0);
  e.debugAttack(P, so, h.uid, {}, []);
  ok(h.hp < 50 && !(h.daunts || []).length, `a Counterattack with Daunt strikes back (${50 - h.hp}) but lays no Daunt (${(h.daunts || []).length})`); void c; }

// ================= 4. Counterattack: no turn of its own while an enemy faces it; with none, it hits the bramble =================
{ const run = withFoe=>{ const {e, P} = mk(5); const c = put(e, P, 1, 's1-counter', 0); if(withFoe) put(e, P, 2, 's1-wall', 0); else put(e, P, 2, 's1-wall', 2);
    const ev = []; const hq0 = P[2].hq.hp; e.resolveCombat(P, so, {}, ev, 1); return {hq: hq0 - P[2].hq.hp, swung: ev.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === c.uid)}; };
  const a = run(true), b = run(false);
  ok(!a.swung && a.hq === 0, `an enemy faces it: no swing (swung ${a.swung}, bramble -${a.hq})`);
  ok(b.swung && b.hq === 3, `no enemy faces it: it swings at the enemy bramble (-${b.hq})`); }

// ================= 5. Illuminate keeps no Diurnal day =================
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, battleMode:'open', rules:{phase:'cycle', phaseLen:1}});
  const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 's1-day', 'left', {}, []); e.debugSpawnCard(P, so, 1, 's1-lamp', 'right', {}, []);
  const mine = all(P[1]).find(c=> c.defId === 's1-day');
  e.roundStart(P, 1, so, {}, []); const dayAtk = mine.phaseAtk | 0;
  e.roundStart(P, 2, so, {}, []);
  ok(dayAtk === 2 && e.getPhase() === 'night' && !mine.phaseAtk && mine.maxHp === 5, `by day +2 (${dayAtk}); at night beside an Illuminate unit no bonus (atk ${mine.phaseAtk | 0}, max ${mine.maxHp})`); }

// ================= 6. one damage type counts as one skill =================
{ ok(BB.skillCountOf({electricity:1, lightning:2}) === 1 && BB.skillCountOf({electricity:1, shockBolt:2, guardian:true}) === 2, 'Electricity + Lightning / Shock Bolt count 1');
  ok(BB.skillCountOf({poison:2, poisonBolt:2}) === 1 && BB.skillCountOf({poison:1, arrow:{v:2, type:'poison', form:'bolt'}}) === 1, 'Venomous + Venom Spit count 1');
  ok(BB.skillCountOf({electricity:1, poison:1}) === 2 && BB.skillCountOf({flying:true, poison:1, leader:true}) === 2.5, 'other skills count as before'); }

// ================= 7. Offspring costs 1 more Lumber =================
{ const play = lumber=>{ const {e, P} = mk(); const h = {uid: 9600, defId:'s1-off'}; P[1].hand.push(h); P[1].lumber = lumber; e.placeCard(P, so, 1, h.uid, 0, {}, []);
    return {copies: all(P[1]).filter(c=> c.defId !== 's1-off').length, left: P[1].lumber}; };
  const a = play(1), b = play(0);
  ok(a.copies === 2 && a.left === 0, `with 1 Lumber: 2 copies, the Lumber spent (${a.copies}, ${a.left} left)`);
  ok(b.copies === 0 && b.left === 0, `with none: no copies (${b.copies})`); }

// ================= 8. the app: riders gone, names, Fog pill =================
{ const app = rd('arena_app.js');
  ok(/const EN6_BRAMBLE_APP = \{arrowBramble:\{base:'arrow', tx:'arrow-bramble'\}\};/.test(app) && !/fireArrowBleed|fireBoltBramble|fireArrowPoison/.test(app), 'Fire Arrow / Fire Bolt – bramble / – venom / – bleed are gone from the app');
  ok(/key:'fireArrow', category:'evergreen', label:TX\('ui\.skn-fire-arrow'\)/.test(app), 'Fire Arrow is labelled through ui.skn-fire-arrow');
  ok(/function fogPillHTML\(m\)/.test(app) && /mistPillHTML\(m\) \+ fogPillHTML\(m\)/.test(app), 'a Fog pill beside the Mist pill');
  ok(/sk1Patch\(PASSIVE_DEFS, 'cure', \{kind:'boolean'/.test(app), 'the editor offers Cure without a number'); }

// ================= texts, packs, docs, decisions =================
{ const tx = rd('bramblewood-texts.js'), txv = k=> (tx.match(new RegExp('"' + k.replace(/[.]/g, '\\.') + '":\\s*"((?:[^"\\\\]|\\\\.)*)"')) || [])[1];
  const T = {'ui.skn-fire-arrow': 'Arrow (Flaming)', 'ui.skn-bramble-armor': 'Fortify: +1 Armor', 'ui.eng24-barmor-head': 'Fortify: +{n} Armor', 'ui.skn-foe-plenty': 'Against All Odds', 'ui.skn1-fog': 'Fog'};
  for(const [k, v] of Object.entries(T)) ok(txv(k) === v, `${k}: "${txv(k)}"`);
  ok(/When it attacks/.test(txv('ui.ui31-daunt') || '') && /only if no enemy faces it/.test(txv('ui.sk-counterattack') || '') && !/Diurnal/.test(txv('ui.sk-illuminate') || 'Diurnal') && /pays 1 Lumber/.test(txv('ui.eng28-offspring') || ''), 'Daunt, Counterattack, Illuminate and Offspring texts say the new rule');
  ok(!/"ui\.skn-fire-(arrow|bolt)-(bramble|poison|bleed)"/.test(tx), 'the six rider labels are deleted');
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const L = J('lang/' + code + '.json');
    const keys = ['ui.skn-fire-arrow', 'ui.skn-bramble-armor', 'ui.eng24-barmor-head', 'ui.skn-foe-plenty', 'ui.ui31-daunt', 'ui.sk-counterattack', 'ui.sk-illuminate', 'ui.eng28-offspring', 'ui.sk-bulwark-codex'];
    const miss = keys.filter(k=> !(typeof L[txv(k)] === 'string' && L[txv(k)].length)); ok(!miss.length, `${code}: translated (${miss.join(', ')})`);
    ok(!('Fire Bolt – bleed' in L), `${code}: the rider rows are deleted`); }
  ok(/^## 2026-11-16[^\n]*SKN1/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
  ok(/tests\/skn1-2026-11-16\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
  ok(/DONE/.test(rd('docs/design/skn1-2026-11-16.md')), 'the audit table');
  const items = J('docs/decisions.json').items, ds = items.filter(x=> /^SKN1-\d+$/.test(x.id));
  ok(ds.length >= 15 && ds.every(d=> (d.status === 'YET' || d.status === 'DONE') /* 2026-11-19 (TESTFIX6): ENG52 answered SKN1-16 */ && d.body.split(/\s+/).length < 100 && d.options.length >= 2 && d.default), `decisions SKN1-n: ${ds.length} asked, each under 100 words with options and a default`); }

console.log(`skn1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
