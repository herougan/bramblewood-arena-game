#!/usr/bin/env node
// Package ENG26 (2026-11-06, owner notes 09:29). The browser run for #1 / #2 is tests/e2e/eng26_2026_11_06.py (shots docs/screens/eng26/).
//   1. context pips: an overflowing strip pages through ALL its slots together on one shared tick (BADGE_CYCLE_TICK), every 3 s;
//   2. a row of 9+ units with small tiles hides the name scroll (CSS container query);
//   3. Bloom escalates: the Nth bloom of a side this fight gives its copy +N/+N (ENG26-1), Parasite blooms count too; texts say so;
//   4. Undead: a heal hurts it for as much; a cure / cleanse / Renewal that would take something off gives Bleed instead (N, or 1; ENG26-2);
//   5. Acacia Kraal starts with 1 Lumber (was 3), first unit +3 Attack kept; BAL19-2 DONE;
//   6. Banner Knoll: leaderBoon {atk 2, hp 3}: your Leader +2/+3 as it takes the field (summonLeader, a Leader card from the hand); not on the road.
//   node tests/eng26-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), eng = rd('bramblewood-engine.js');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-bloom': U('x-bloom', {bloomCopy:{when:['kill']}}, {attack:1, health:7, wait:0}),
  'x-bloom2': U('x-bloom2', {bloomCopy:{when:['kill']}}, {attack:2, health:5, wait:0}),
  'x-undead': U('x-undead', {}, {attack:1, health:10, species:['Undead']}),
  'x-undead-st': U('x-undead-st', {}, {attack:1, health:10, subtype:'undead', species:['Elemental']}),
  'x-living': U('x-living', {}, {attack:1, health:10}),
  'x-healer': U('x-healer', {healing:3}, {attack:0, health:50}),
  'x-curer': U('x-curer', {cure:2}, {attack:0, health:50}),
  'x-renew-undead': U('x-renew-undead', {renewal:true}, {attack:0, health:20, species:['Undead']}),
  'x-chief': U('x-chief', {leader:true}, {attack:3, health:6}),
  'x-grunt': U('x-grunt', {}, {attack:3, health:6}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(ch1, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 26), {recordEvents:true, battleMode:'open'});
  return {e, P:{1: e.newPlayer(1, {}, ch1 || {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }

// ---- 1. context pips ----------------------------------------------------------------------------------------------------------------
ok(/var BADGE_CYCLE_TICK = 0;/.test(app) && /BADGE_CYCLE_TICK\+\+;[^\n]*\}, 3000\);/.test(app) && !/is-shown', i === k\)\); \}\); \}, 2000\);/.test(app), '#1 one shared tick, every 3 s (was 2 s)');
ok(/const shown = BADGE_CYCLE_TICK % pages\.length;/.test(app) && /for\(let j = 0; j < maxSlots; j\+\+\) slots\.push\(`<span class="abadge badge-cycle"/.test(app), '#1 every slot is a cycling slot showing the shared page');
{ // the strip itself, evaluated: 7 pips on a 3-slot board card -> 3 slots, each with 3 pages; the page follows the tick
  const a = app.indexOf('\nfunction abilityBadges('), b = app.indexOf('\n// Badge cycling ticker', a);
  ok(a > 0 && b > a, '#1 abilityBadges is found');
  const body = app.slice(a, b), m = body.match(/const maxSlots = [^\n]+\n(?:  \/\/[^\n]*\n)*  if\(out\.length > maxSlots\)\{[\s\S]*?\n  \}/);
  ok(!!m, '#1 the overflow block is found');
  if(m){ const f = new Function('BADGE_CYCLE_TICK', 'out', 'bopts', 'ui11IconOnly', m[0] + '\n return null;');
    const out = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(x=> `<span class="p-${x}">${x}</span>`);
    const h0 = f(0, out, {compact:true}, ()=> ''), h1 = f(1, out, {compact:true}, ()=> '');
    const slots = (h0.match(/class="abadge badge-cycle"/g) || []).length, items = (h0.match(/class="bc-item/g) || []).length;
    ok(slots === 3 && items === 9 && (h0.match(/is-empty/g) || []).length === 2, `#1 7 pips, 3 slots: 3 slots x 3 pages, 2 blanks on the last (${slots}, ${items})`);
    const shownOf = h=> [...h.matchAll(/<span class="bc-item( is-shown)?[^"]*">(?:<span class="p-(\w)">)?/g)].filter(x=> x[1]).map(x=> x[2] || '-');
    ok(shownOf(h0).join('') === 'abc' && shownOf(h1).join('') === 'def', `#1 tick 0 shows a b c, tick 1 d e f (${shownOf(h0)} / ${shownOf(h1)})`); }
}
ok(/\.badge-cycle:not\(:last-child\)::after\{display:none;\}/.test(tpl), '#1 only the last cycling slot shows the gold dot');
// ---- 2. names on a crowded row -------------------------------------------------------------------------------------------------------
// 2026-11-11 (package PERF2): the row marks itself and the name reads the mark through a style query (a :has() aimed at .nm restyled every
// name on each DOM change); tests/perf2-2026-11-11.js --equiv shows the same computed display in the old and new builds.
ok(/\.board-row:has\(> \.board-card:nth-child\(9 of :not\(\.empty-slot\)\)\)\{--eng26-many:1;\}/.test(tpl) && /@container \(max-width: 100px\)\{ @container style\(--eng26-many: 1\)\{\n  \.board-row > \.board-card \.card-tile \.nm\{display:none !important;\}/.test(tpl), '#2 9+ units and a small tile: the name scroll is hidden');

// ---- 3. Bloom escalates --------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const b = put(e, P, 1, 'x-bloom', 0); b.bloomKill = true;
  const ev1 = []; e.bloomCopyPass(P, so, {}, ev1); const c1 = all(P[1]).find(x=> x.bloomCopy);
  ok(c1 && c1.atk === 2 && c1.maxHp === 8, `the first copy of a 1/7 is 2/8 (+1/+1) (${c1 && c1.atk + '/' + c1.maxHp})`);
  ok(ev1.some(x=> x.type === 'bloom' && x.copyAtk === 1 && x.step === 1), 'its event carries step 1, copyAtk 1');
  const ev2 = []; e.bloomCopyPass(P, so, {}, ev2); const c2 = all(P[1]).filter(x=> x.bloomCopy).find(x=> x !== c1);
  ok(c2 && c2.atk === 3 && c2.maxHp === 9, `the next copy is 3/9 (+2/+2), the owner's example (${c2 && c2.atk + '/' + c2.maxHp})`);
  ok(ev2.some(x=> x.type === 'bloom' && x.copyAtk === 2 && x.copyHp === 2 && x.step === 2), 'its event: step 2');
  const ev3 = []; e.bloomCopyPass(P, so, {}, ev3);
  ok(!ev3.some(x=> x.type === 'bloom') && P[1].eng26Blooms === 2, `no room: no bloom, and the count stays (${P[1].eng26Blooms})`); }
{ // two Bloom units on one side share the count; the other side has its own
  const {e, P} = mk(); const a = put(e, P, 1, 'x-bloom', -2), b = put(e, P, 1, 'x-bloom2', 2), f = put(e, P, 2, 'x-bloom', 0); [a, b, f].forEach(x=> x.bloomKill = true);
  const ev = []; e.bloomCopyPass(P, so, {}, ev); const bl = ev.filter(x=> x.type === 'bloom');
  ok(bl.filter(x=> x.side === 'A').map(x=> x.step).join(',') === '1,2' && bl.filter(x=> x.side === 'B').map(x=> x.step).join(',') === '1', `per side: A 1, 2; B 1 (${bl.map(x=> x.side + x.step)})`);
  const cb = all(P[1]).find(x=> x.bloomCopy && x.bloomOf === b.uid);
  ok(cb && cb.atk === 4 && cb.maxHp === 7, `the second unit's copy (a 2/5) gets +2/+2: 4/7 (${cb && cb.atk + '/' + cb.maxHp})`); }
{ const {e, P} = mk(); ok(P[1].eng26Blooms == null, 'a new fight starts the count at 0'); }
ok(/the Nth bloom of this side gets \+N\/\+N/.test(eng) && /B = eng26BloomStep\(pl\); \/\/ ENG26: \+N\/\+N/.test(eng), 'the Parasite bloom counts the same way');
ok(/\+2\/\+2 for your next bloom this fight, and so on/.test(T['ui.bl-desc']) && /\+2\/\+2 for your next bloom this fight/.test(T['ui.bl-desc-lumber']), 'the Bloom texts say it escalates');
ok(/\+\{a\}\/\+\{a\}/.test(T['ui.eng26-bloom-log']) && /'ui\.eng26-bloom-log-lumber' : 'ui\.eng26-bloom-log'/.test(app), 'the log names the step');
{ const sc = JSON.parse(rd('canonical/skill-costs.json')), bc = (sc.skills || []).find(s=> s.id === 'bloomCopy');
  ok(bc && /ENG26/.test(bc.eng26Note || '') && typeof bc.eng26Was === 'object', 'skill-costs.json: Bloom re-priced by ENG26 (its old entry kept as eng26Was)'); }

// ---- 4. Undead ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const u = put(e, P, 1, 'x-undead', 0); u.hp = 6;
  const ev = []; const h = e.debugHeal(P, so, u.uid, 3, {}, ev);
  ok(h === 0 && u.hp === 3, `a heal of 3 on an Undead unit at 6/10 deals 3 instead (${u.hp})`);
  ok(ev.some(x=> x.type === 'undeadHeal' && x.dmg === 3 && x.uid === u.uid) && !ev.some(x=> x.type === 'heal'), 'an undeadHeal event, no heal event');
  const full = put(e, P, 1, 'x-undead-st', 1); const ev2 = []; e.debugHeal(P, so, full.uid, 2, {}, ev2);
  ok(full.hp === 8 && ev2.some(x=> x.type === 'undeadHeal'), `the subtype undead counts too, and a full-Health Undead unit is still hurt (${full.hp})`);
  const liv = put(e, P, 1, 'x-living', 2); liv.hp = 5; e.debugHeal(P, so, liv.uid, 3, {}, []);
  ok(liv.hp === 8, `a living unit heals as before (${liv.hp})`); }
{ // Healing N picks the most hurt ally; an Undead one takes the damage
  const {e, P} = mk(); put(e, P, 1, 'x-healer', 0); const u = put(e, P, 1, 'x-undead', 1); u.hp = 4;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(u.hp === 1 && ev.some(x=> x.type === 'undeadHeal' && x.uid === u.uid), `Healing 3 on the most hurt ally, an Undead 4/10: 1 left (${u.hp})`); }
{ // its own Regeneration still heals an Undead unit (Obsidian Lich, Regeneration 2)
  const {e, P} = mk(); const l = put(e, P, 1, 'obsidian-lich', 0); l.hp = l.maxHp - 5; const h0 = l.hp;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(l.hp >= h0 && !ev.some(x=> x.type === 'undeadHeal'), `its own Regeneration heals an Undead unit (${h0} -> ${l.hp})`); }
{ // Cure N on a poisoned Undead: no Poison off, Bleed N on
  const {e, P} = mk(); put(e, P, 1, 'x-curer', 0); const u = put(e, P, 1, 'x-undead', 1); u.poison = 3;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const uc = ev.find(x=> x.type === 'undeadCure');
  ok(uc && uc.bleed === 2 && uc.kind === 'cure' && ev.some(x=> x.type === 'undeadCure' && x.uid === u.uid), `Cure 2 on a poisoned Undead unit: Bleed 2 instead (${uc && uc.bleed}, bleed now ${u.bleed})`);
  ok(!ev.some(x=> x.type === 'statusFx' && x.kind === 'cure' && x.targetUid === u.uid), 'no Poison was cured'); }
{ // Renewal on an Undead that bleeds: Bleed 1 more, nothing cleansed; with nothing on it, nothing happens
  const {e, P} = mk(); const u = put(e, P, 1, 'x-renew-undead', 0); u.bleed = 2;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(ev.some(x=> x.type === 'undeadCure' && x.kind === 'renewal' && x.bleed === 1) && !ev.some(x=> x.type === 'statusFx' && x.kind === 'cleanse' && x.targetUid === u.uid), 'Renewal on a bleeding Undead: +1 Bleed, no cleanse');
  const {e: e2, P: P2} = mk(); put(e2, P2, 1, 'x-renew-undead', 0); const ev2 = []; e2.resolveCombat(P2, so, {}, ev2, 1);
  ok(!ev2.some(x=> x.type === 'undeadCure'), 'nothing to cleanse: nothing happens'); }
ok(/if\(ev\.type === 'undeadHeal'\) return/.test(app) && /if\(ev\.type==='undeadHeal'\)\{/.test(app) && /if\(ev\.type==='undeadCure'\)\{/.test(app), 'the board: a log line and a float for each');
ok(T['ui.eng26-undead-rule'] && /cd-undead-rule/.test(app), 'the card detail explains the Undead rule');

// ---- 5. Acacia Kraal --------------------------------------------------------------------------------------------------------------
const chars = JSON.parse(rd('canonical/characters.json')), K = chars.find(c=> c.id === 'acacia-kraal');
ok(K && K.effects.startGold === 1 && K.effects.firstUnitAtkBonus === 3, `Acacia Kraal: start Lumber 1, first unit +3 Attack (${JSON.stringify(K && K.effects)})`);
const dec = JSON.parse(rd('docs/decisions.json')), D = id=> (dec.items || dec.decisions || dec).find(x=> x.id === id);
ok(D('BAL19-2') && D('BAL19-2').status === 'DONE', 'BAL19-2 is DONE');
{ const r = JSON.parse(rd('docs/balance/eng26-kraal-2026-11-06.json'));
  ok(r.games === 200 && r.rows.length === 13 && r.startLumber.before === 3 && r.startLumber.after === 1, `the re-measure: 13 fights at 200 games (${r.rows.length})`); }

// ---- 6. Banner Knoll ----------------------------------------------------------------------------------------------------------------
const BK = chars.find(c=> c.id === 'banner-knoll');
ok(BK && BK.effects.leaderBoon && BK.effects.leaderBoon.atk === 2 && BK.effects.leaderBoon.hp === 3 && !BK.unlockMap && !BK.drop, 'Banner Knoll: leaderBoon 2/3, open to every player (no unlockMap, no drop)');
{ const {e, P} = mk(BK); P[1].lumber = 20; const ev = [];
  const okL = e.summonLeader(P, so, 1, 'x-grunt', 'center', {}, ev); const L = all(P[1]).find(c=> c.isLeader);
  ok(okL && L && L.atk === 5 && L.maxHp === 9 && L.hp === 9, `a summoned Leader 3/6 is 5/9 (${L && L.atk + '/' + L.maxHp})`);
  const pi = ev.findIndex(x=> x.type === 'play'), bi = ev.findIndex(x=> x.type === 'statusFx' && x.kind === 'leaderBoon');
  ok(pi >= 0 && bi > pi && ev[bi].atk === 2 && ev[bi].hp === 3, 'the leaderBoon event follows the play event');
  // a Leader card from the hand; a plain card from the hand gets nothing
  P[1].hand.push({uid: 99101, defId: 'x-chief'}, {uid: 99102, defId: 'x-grunt'}); P[1].playedThisTurn = false;
  e.placeCard(P, so, 1, 99101, 'left', {}, []); P[1].playedThisTurn = false; e.placeCard(P, so, 1, 99102, 'right', {}, []);
  const ch = all(P[1]).find(c=> c.defId === 'x-chief'), gr = all(P[1]).find(c=> c.defId === 'x-grunt' && !c.isLeader);
  ok(ch && ch.atk === 5 && ch.maxHp === 9, `a Leader card from the hand: 3/6 -> 5/9 (${ch && ch.atk + '/' + ch.maxHp})`);
  ok(gr && gr.atk === 3 && gr.maxHp === 6, `a plain card: unchanged (${gr && gr.atk + '/' + gr.maxHp})`); }
{ const {e, P} = mk(); P[1].lumber = 20; e.summonLeader(P, so, 1, 'x-grunt', 'center', {}, []); const L = all(P[1]).find(c=> c.isLeader);
  ok(L && L.atk === 3 && L.maxHp === 6, 'another bramble: the Leader as printed'); }
ok(/\{key:'leaderBoon', icon:'🚩', label:\(\)=> TX\('ui\.eng26-fx-leader'\)\}/.test(app) && /if\(e\.leaderBoon\)\{ const b = e\.leaderBoon === true/.test(app), 'the brambles list filters by it and its text describes it');
ok(!/banner-knoll/.test(app) && !/banner-knoll/.test(rd('canonical/map-pools.json')), 'on no road map (MAP_CASTLE, map pools): ENG26-5');
ok(D('ENG26-1') && D('ENG26-2') && D('ENG26-3') && D('ENG26-4') && D('ENG26-5'), 'decisions ENG26-1..5 filed');
['ui.eng26-log-undead-heal', 'ui.eng26-log-undead-cure', 'ui.eng26-log-leader-boon', 'ui.eng26-leader-boon-desc', 'ui.eng26-fx-leader', 'ui.eng26-float-undead-heal', 'ui.eng26-float-undead-cure', 'ui.eng26-bloom-log', 'ui.eng26-bloom-log-lumber'].forEach(k=> ok(!!T[k], 'TX ' + k));
{ const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const keys = ['ui.eng26-log-undead-heal', 'ui.eng26-log-leader-boon', 'ui.eng26-leader-boon-desc', 'ui.bl-desc', 'ui.eng26-undead-rule'];
  const core = t=> t.replace(/^[^\w{(+\-]+/u, ''); // a log line's row is kept without its leading emoji (tests/i18n-templates)
  codes.forEach(c=>{ const pk = JSON.parse(rd('lang/' + c + '.json')); ok(keys.every(k=> pk[core(T[k])]), `lang/${c}.json has the ENG26 rows`); }); }

console.log(fail ? `eng26: ${fail} of ${n} checks failed` : `eng26: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
