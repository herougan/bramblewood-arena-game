#!/usr/bin/env node
// Package HN (2026-10-19). The owner (00:07): "Healing & the like: if there's nothing to heal, it doesn't occur, and no animation plays."
// Every heal-like effect on a unit at full Health (a bramble at full Health) is a full no-op: no event, no log line, no "+0", no heal
// look or sound, no heal triggers, no trigger announcement (and a "once" Heal trigger isn't used up). A partial heal is unchanged.
// Bleed: a full-Health unit that Bleeds has something to heal, so the heal happens as a stanch only (the 'stanch' event, no 'heal'
// event, no heal triggers). Regeneration keeps the owner's 2026-10-14 rule ("Do not regenerate when the unit is at full health"):
// it doesn't stanch at full Health. The app skips any 0-amount heal event that still turns up (old saved fights and replays).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js'), E = H.Engine;
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:30, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'hn-wall':    U('hn-wall'),
  'hn-healer':  U('hn-healer', {triggers:[{on:'onRoundStart', do:'heal', amount:4}]}),
  'hn-once':    U('hn-once', {triggers:[{on:'onRoundStart', do:'heal', amount:4, once:true}]}),
  'hn-allyheal':U('hn-allyheal', {triggers:[{on:'onRoundStart', do:'heal', amount:3, who:'ally', sub:'random'}]}),
  'hn-healed':  U('hn-healed', {triggers:[{on:'onHealed', do:'gain', resource:'grace', amount:1}]}),
  'hn-regen':   U('hn-regen', {regen:3}),
  'hn-bloom':   U('hn-bloom', {bloom:3}),
  'hn-nurse':   U('hn-nurse', {nursing:2}),
  'hn-healing': U('hn-healing', {healing:3}),
  'hn-herb':    U('hn-herb', {herbalist:2}),
  'hn-leech':   U('hn-leech', {sap:true}, {attack:3}),
  'hn-carrion': U('hn-carrion', {carrion:2}),
  'hn-frail':   U('hn-frail', {}, {health:1}),
  'hn-killer':  U('hn-killer', {}, {attack:9}),
  'hn-rebuild': U('hn-rebuild', {rebuild:2}),
  'hn-rbtrig':  U('hn-rbtrig', {triggers:[{on:'onRoundStart', do:'rebuild', amount:3}]}),
  'hn-curer':   U('hn-curer', {cure:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, side){ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const HEALISH = new Set(['heal', 'sap', 'rebuild', 'castleRegen']);
const healEvs = (ev, uid)=> ev.filter(x=> (HEALISH.has(x.type) && (uid == null || x.targetUid === uid || x.attUid === uid || x.uid === uid))
  || (x.type === 'statusFx' && ['stanch', 'herbHeal', 'carrion', 'cure'].includes(x.kind)) || (x.type === 'fieldTick' && x.field === 'rain'));
const zeroHeal = ev=> ev.filter(x=> (HEALISH.has(x.type) && !(x.amount > 0)) || (x.type === 'fieldTick' && x.field === 'rain' && !(x.heal > 0)) || (x.type === 'statusFx' && ['stanch', 'herbHeal', 'carrion', 'cure'].includes(x.kind) && !(x.amount > 0)));
const healTrig = ev=> ev.filter(x=> x.type === 'triggerFired' && (x.action === 'heal' || x.action === 'rebuild'));

// ---- 1. full Health, no Bleed: nothing happens, for each heal kind
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-healer'); const ev = round(e, P);
  ok(c.hp === c.maxHp && !healEvs(ev).length, 'Heal trigger on itself at full Health: no heal / stanch event');
  ok(!healTrig(ev).length, 'Heal trigger at full Health: no trigger announcement (triggerFired) either'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-once'); const ev = round(e, P);
  ok(!healTrig(ev).length && !Object.keys(c.firedOnce || {}).length, 'a "once" Heal trigger at full Health is not used up');
  c.hp = 20; const ev2 = round(e, P);
  ok(c.hp === 24 && ev2.some(x=> x.type === 'heal' && x.targetUid === c.uid && x.amount === 4) && healTrig(ev2).length === 1, `... and heals 4 the first time it is hurt (hp ${c.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-allyheal'); const w = put(e, P, 1, 'hn-healed', 'right'); const ev = round(e, P);
  ok(!healEvs(ev).length && !healTrig(ev).length && !ev.some(x=> x.type === 'triggerFired' && x.hook === 'onHealed') && !(P[1].grace > 0), 'Heal an ally at full Health: no heal, no announcement, no On Healed'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-regen'); const ev = round(e, P); ok(!healEvs(ev).length, 'Regeneration at full Health: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-bloom'); put(e, P, 1, 'hn-wall', 'right'); const ev = round(e, P); ok(!healEvs(ev).length, 'Bloom with every ally at full Health: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-nurse'); put(e, P, 1, 'hn-wall', 'right'); const ev = round(e, P); ok(!healEvs(ev).length, 'Nursing with every ally at full Health: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-healing'); put(e, P, 1, 'hn-wall', 'right'); const ev = round(e, P); ok(!healEvs(ev).length, 'Healing N with every unit at full Health: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-herb'); put(e, P, 1, 'hn-healer', 'right'); const ev = round(e, P); ok(!healEvs(ev).length && !healTrig(ev).length, 'Herbalist does not turn a full-Health heal into a heal'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'hn-leech'); put(e, P, 2, 'hn-wall'); const ev = round(e, P);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.dmg > 0) && !ev.some(x=> x.type === 'sap'), 'Leech hitting at full Health: no drain event'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-killer'); put(e, P, 1, 'hn-carrion', 'right'); put(e, P, 2, 'hn-frail'); const ev = round(e, P);
  ok(ev.some(x=> x.type === 'death') && !ev.some(x=> x.kind === 'carrion'), 'Carrion at full Health when a unit dies: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-rebuild'); round(e, P); const ev = round(e, P); ok(P[1].hq.hp === P[1].hq.maxHp && !ev.some(x=> x.type === 'rebuild'), 'Rebuild with a full bramble: nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-rbtrig'); const ev = round(e, P); ok(!ev.some(x=> x.type === 'rebuild') && !healTrig(ev).length, 'Rebuild trigger with a full bramble: no rebuild, no announcement'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-wall'); const ev = []; const h = e.debugHeal(P, so, c.uid, 5, {}, ev); ok(h === 0 && !ev.length, 'the Tester heal at full Health: 0 and no events'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-wall'); e.setField('rain', 3); const ev = []; e.roundStart(P, 2, so, {}, ev); round(e, P).forEach(x=> ev.push(x));
  ok(!ev.some(x=> x.type === 'fieldTick' && x.field === 'rain'), 'Spring Rain on full-Health units: no tick'); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'hn-wall', 'right'); s.poison = 3; put(e, P, 1, 'hn-curer'); const ev = round(e, P); ok(!ev.some(x=> x.kind === 'cure'), 'a Cure that takes nothing off: no event'); }

// ---- 2. a partial heal is unchanged
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-healer'); c.hp = 20; const ev = round(e, P);
  ok(c.hp === 24 && ev.some(x=> x.type === 'heal' && x.targetUid === c.uid && x.amount === 4) && healTrig(ev).length === 1, `Heal 4 on a hurt unit: heals 4, with its trigger (hp ${c.hp})`); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-healer'); c.hp = 28; const ev = round(e, P);
  ok(c.hp === 30 && ev.some(x=> x.type === 'heal' && x.amount === 2), `Heal 4 two short of full: heals 2 (hp ${c.hp})`); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-regen'); c.hp = 10; const ev = round(e, P); ok(c.hp === 13 && ev.some(x=> x.type === 'heal' && x.targetUid === c.uid && x.amount === 3), 'Regeneration 3 on a hurt unit: +3'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'hn-leech'); a.hp = 20; put(e, P, 2, 'hn-wall'); const ev = round(e, P); ok(ev.some(x=> x.type === 'sap' && x.amount === 3), 'Leech while hurt: drains 3'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-killer'); const c = put(e, P, 1, 'hn-carrion', 'right'); c.hp = 20; put(e, P, 2, 'hn-frail'); const ev = round(e, P);
  ok(ev.some(x=> x.kind === 'carrion' && x.amount === 2) && c.hp === 22, 'Carrion while hurt: +2'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-rbtrig'); P[1].hq.hp -= 10; const ev = round(e, P); ok(ev.some(x=> x.type === 'rebuild' && x.amount === 3) && healTrig(ev).length === 1, 'Rebuild trigger on a hurt bramble: +3, with its trigger'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-allyheal'); const w = put(e, P, 1, 'hn-healed', 'right'); w.hp = 10; const ev = round(e, P);
  ok(ev.some(x=> x.type === 'heal' && x.targetUid === w.uid && x.amount === 3) && P[1].grace >= 1, 'Heal a hurt ally: heals, and its On Healed fires'); }
ok(zeroHeal([]).length === 0, '(helper)');

// ---- 3. Bleed at full Health: 2026-10-19 (package SK1, owner 21:36: "heal only heals now"): a heal no longer stanches Bleed, so a
// full-Health Bleeding unit has nothing to heal: no stanch, no heal, the trigger doesn't go off (Cleanse takes Bleed).
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-healer'); c.bleed = 3; const ev = round(e, P);
  const st = ev.filter(x=> x.kind === 'stanch' && x.targetUid === c.uid);
  ok(!st.length && c.hp === c.maxHp && c.bleed === 2, `full Health, Bleed 3 (2 after its upkeep fade): Heal 4 has nothing to heal (bleed ${c.bleed}, stanch ${st.length})`);
  ok(!ev.some(x=> x.type === 'heal'), '... with no heal event (no green heal look, no "+0")');
  ok(healTrig(ev).length === 0, '... and its trigger did not go off'); }
{ const {e, P} = mk(); put(e, P, 1, 'hn-allyheal'); const w = put(e, P, 1, 'hn-healed', 'right'); w.bleed = 3; const ev = round(e, P);
  ok(!ev.some(x=> x.kind === 'stanch') && !ev.some(x=> x.type === 'heal') && !(P[1].grace > 0), 'a full-Health Bleeding ally: no stanch, no heal, no On Healed'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-regen'); c.bleed = 3; const ev = round(e, P);
  ok(!ev.some(x=> x.kind === 'stanch' && x.targetUid === c.uid) && !ev.some(x=> x.type === 'heal'), 'Regeneration keeps its 2026-10-14 rule: no stanch at full Health'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'hn-healer'); c.hp = 20; c.bleed = 3; const ev = round(e, P);
  ok(c.hp === 24 && c.bleed === 2 && !ev.some(x=> x.kind === 'stanch') && ev.some(x=> x.type === 'heal' && x.amount === 4), `hurt and Bleeding: all 4 heal Health, the Bleed stays (SK1) (hp ${c.hp})`); }

// ---- 4. no 0-amount heal event anywhere in a batch of real fights
{ const ids = H.fieldableIds(defs).filter(id=> { const f = (defs[id].effects) || {}; return f.regen || f.bloom || f.nursing || f.healing || f.sap || f.carrion || f.rebuild || f.banana || (f.triggers || []).some(t=> t.do === 'heal' || t.do === 'rebuild'); });
  let zeros = 0, runs = 0;
  ids.slice(0, 24).forEach((id, k)=>{ const {e, P} = mk(100 + k); put(e, P, 1, id); put(e, P, 2, 'hn-wall'); for(let r = 0; r < 4; r++){ runs++; zeros += zeroHeal(round(e, P)).length; } });
  ok(ids.length > 0 && zeros === 0, `real heal cards (${ids.length}, ${runs} rounds): no 0-amount heal event (${zeros})`); }

// ---- 5. the app: 0-amount heal events are skipped everywhere (board, sound, beat, log, replay list)
const app = R('arena_app.js'), fxa = R('bramblewood-fx-a.js'), idx = R('index.html');
const src = app.slice(app.indexOf('function emptyHealEvent(ev){'), app.indexOf('function renderVfxForEvent(ev){'));
const ctx = {}; vm.runInNewContext(src + '\nthis.emptyHealEvent = emptyHealEvent;', ctx);
const EH = ctx.emptyHealEvent;
ok(typeof EH === 'function', 'emptyHealEvent is defined');
[{type:'heal', amount:0}, {type:'sap', amount:0}, {type:'rebuild', amount:0}, {type:'castleRegen', amount:0}, {type:'heal'},
 {type:'fieldTick', field:'rain', heal:0}, {type:'statusFx', kind:'herbHeal', amount:0}, {type:'statusFx', kind:'carrion', amount:0}, {type:'statusFx', kind:'stanch', amount:0}, {type:'statusFx', kind:'cure', amount:0}]
  .forEach(x=> ok(EH(x) === true, `skipped: ${JSON.stringify(x)}`));
[{type:'heal', amount:2}, {type:'sap', amount:1}, {type:'rebuild', amount:3}, {type:'fieldTick', field:'rain', heal:2}, {type:'fieldTick', field:'heatwave', dmg:0},
 {type:'statusFx', kind:'stanch', amount:2}, {type:'statusFx', kind:'cower', mode:'flee', amount:0}, {type:'banana', action:'eat', amount:0}, {type:'hit', dmg:0}]
  .forEach(x=> ok(EH(x) === false, `kept: ${JSON.stringify(x)}`));
ok(/function renderVfxForEvent\(ev\)\{\n  if\(emptyHealEvent\(ev\)\) return;/.test(app), 'renderVfxForEvent skips them first (no look, no sound, no float)');
ok(/function delayForEvent\(ev, prevKind\)\{\n  if\(emptyHealEvent\(ev\)\) return 0;/.test(app), 'delayForEvent gives them no beat');
ok(/function logText\(ev\)\{\n  if\(emptyHealEvent\(ev\)\) return null;/.test(app), 'logText gives them no line (live log and the match history)');
ok(/const mainEvents = settleDeathsEarly\(groupForkLines\(events\.filter\(ev=> [^\n]*!emptyHealEvent\(ev\)\)\)\)/.test(app), "the round's replay list drops them");
ok(/'eats its banana'\}\$\{ev\.amount > 0 \? ` \(\+\$\{ev\.amount\} Health\)` : ''\}/.test(app), 'a banana eaten only to stanch says no "+0 Health"');
ok(/if\(ev\.action === 'mend' && !\(ev\.targets \|\| \[\]\)\.length\) break;/.test(fxa), 'a Mend spell with no one hurt plays no green heal (FX.A)');
ok(idx.includes('function emptyHealEvent(ev){') && idx.includes("if(ev.action === 'mend' && !(ev.targets || []).length) break;"), 'index.html is rebuilt');
// ---- 6. the record
const dj = JSON.parse(R('docs/decisions.json')), sec = (dj.rules || []).find(r=> r.date === '2026-10-19' && /nothing to heal/.test(r.intro || ''));
ok(sec && sec.items.length >= 3, 'docs/decisions.json has the 2026-10-19 stated rule');
ok(/nothing to heal/.test(R('docs/decisions.md')), 'decisions.md is regenerated');
ok(/## 2026-10-19 \(package HN/.test(R('docs/CHANGELOG.md')), 'CHANGELOG has its entry'); // 2026-10-19 (package GI): was the first 4000 characters; newer packages' entries sit above it
console.log(fail ? `hn: ${fail} of ${n} failed` : `hn: all ${n} passed`); process.exit(fail ? 1 : 0);
