#!/usr/bin/env node
// 2026-11-04 (package ENG23): the owner's 11-03 23:01 / 23:12 notes (docs/decisions.json ENG23-n).
//   1  Crepuscular: +0/+1 at night by default; the day and night parts set apart; "Crepuscular {day} → {night}"; old cards unchanged.
//   2  Skitter: after a hit lands, Haste and Evasive for its next round; priced.
//   3  Fast-forward tokens: the engine's Fast Forward counters, shown on the card; Grant Fast-forward N (an action on no card).
//   4  The "?" rules: Delivery shows on Map 0 (a pre-ENG22 live Stockpile reads as Delivery); True Sight "?" until Map 6 or an Invisible /
//      Changeling card is seen.
//   5  The Map cards tiles show a card at its base level (the owner's Level 10 Beaver Lumberjack read 3/10).
//   6  Rodent's shown name is Rodentia (the key stays).
//   7  CONTENT9-2: the Gnawed Larder's Feed and Ballista Keep's Aimed Bolt.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), TAXO = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
const TXm = require(path.join(ROOT, 'bramblewood-texts.js')), TXT = TXm.TEXT, TX = TXm.TX;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-crep0':  U('x-crep0', {crepuscular:true}, {wait:9}),
  'x-crepOld': U('x-crepOld', {crepuscular:1, crepuscularHp:1}, {wait:9}),
  'x-crepDN': U('x-crepDN', {crepuscular:true, crepuscularDay:[1, 0], crepuscularNight:[0, 2]}, {wait:9}),
  'x-crepG':  U('x-crepG', {crepuscular:true, crepuscularGrant:{day:{attack:1}, night:{evasive:true}}}, {wait:9}),
  'x-skit':   U('x-skit', {skitter:true}, {attack:1, health:200}),
  'x-dummy':  U('x-dummy', {}, {health:200, wait:9}),
  'x-weak':   U('x-weak', {}, {health:3, wait:9}),
  'x-pricey': U('x-pricey', {}, {health:3, wait:1, cost:6}),
  'x-ffgive': U('x-ffgive', {triggers:[{on:'onSpawn', do:'grantFastForward', amount:2}]}, {attack:1, health:50, wait:3}),
  'x-ffally': U('x-ffally', {triggers:[{on:'onSpawn', do:'grantFastForward', amount:1, who:'ally', sub:'all'}]}, {health:50, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, chars){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, (chars && chars[1]) || null), 2: e.newPlayer(2, {}, (chars && chars[2]) || null)}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const app = R('arena_app.js'), eng = R('bramblewood-engine.js'), cards = J('canonical/cards.json'), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const SCt = J('canonical/skill-costs.json'), SK = Object.fromEntries(SCt.skills.map(s=> [s.id, s])), AC = Object.fromEntries(SCt.actions.map(s=> [s.id, s]));

// ---- 1. Crepuscular -------------------------------------------------------------------------------------------------------------
{ const {e} = mk(1); const p = e.crepuscularParts;
  ok(JSON.stringify(p({crepuscular:true})) === '{"day":[0,0],"night":[0,1]}', '1: a plain Crepuscular is +0/+0 by day, +0/+1 at night');
  ok(JSON.stringify(p({crepuscular:1, crepuscularHp:1})) === '{"day":[1,1],"night":[1,1]}' && JSON.stringify(p({crepuscular:1})) === '{"day":[1,0],"night":[1,0]}', '1: an old card (Nightjar Drifter 1/1, Woodcock Lookout 1) keeps its +A/+H in both parts');
  ok(JSON.stringify(p({crepuscular:true, crepuscularDay:[1, 0], crepuscularNight:[0, 2]})) === '{"day":[1,0],"night":[0,2]}', '1: the day part and the night part set apart');
  ok(JSON.stringify(p({crepuscular:true, crepuscularGrant:{day:{attack:1}}})) === '{"day":[0,0],"night":[0,0]}', '1: the braces replace the plain parts'); }
function phaseStats(id, phase){ const {e, P} = mk(2, {phase}); const c = put(e, P, 1, id, 0); e.syncPhaseStats(P, so, []); return [c.phaseAtk || 0, c.phaseHp || 0, c]; }
{ const n0 = phaseStats('x-crep0', 'night'), d0 = phaseStats('x-crep0', 'day');
  ok(n0[0] === 0 && n0[1] === 1 && d0[0] === 0 && d0[1] === 0, `1: in a fight: plain Crepuscular +0/+1 at night, nothing by day (${n0.slice(0, 2)} | ${d0.slice(0, 2)})`);
  const nO = phaseStats('x-crepOld', 'night'), dO = phaseStats('x-crepOld', 'day');
  ok(nO[0] === 1 && nO[1] === 1 && dO[0] === 1 && dO[1] === 1, '1: an old +1/+1 card: the same by day and at night (unchanged)');
  const nD = phaseStats('x-crepDN', 'night'), dD = phaseStats('x-crepDN', 'day');
  ok(dD[0] === 1 && dD[1] === 0 && nD[0] === 0 && nD[1] === 2, `1: Day +1/+0, Night +0/+2 (${dD.slice(0, 2)} | ${nD.slice(0, 2)})`);
  const nG = phaseStats('x-crepG', 'night'), dG = phaseStats('x-crepG', 'day'), gd = defs => null;
  ok(dG[0] === 1 && nG[0] === 0 && !!(nG[2]._condBase), '1: Crepuscular {+1/+0} → {Evasive}: the stat by day, the skill at night (a grant)'); }
{ const z = (e)=> BB.zeitS('crepuscular', e).S;
  ok(z({crepuscular:1, crepuscularHp:1}) === 3.96 && z({crepuscular:1}) === 2.97, `1: an old card's price is unchanged (0.99 x (3A + H): ${z({crepuscular:1, crepuscularHp:1})}, ${z({crepuscular:1})})`);
  ok(z({crepuscular:true}) === 0.59 && z({crepuscular:true, crepuscularDay:[1, 0], crepuscularNight:[0, 1]}) === 1.79, `1: each part at its own share: default 0.59, Day +1/+0 Night +0/+1 = 3 x 0.4 + 0.59 (${z({crepuscular:true})}, ${z({crepuscular:true, crepuscularDay:[1, 0], crepuscularNight:[0, 1]})})`);
  ok(BB.PARAMS.includes('crepuscularDay') && BB.PARAMS.includes('crepuscularNight'), '1: the two parts are parameters, not abilities'); }
{ // the editor's four numbers (arena_app.js eng23Crep*), lifted and run
  const src = app.slice(app.indexOf('function eng23CrepVals'), app.indexOf('const PASSIVE_DEFS = ['));
  const F = new Function('TX', src + '; return {eng23CrepVals, eng23CrepGet, eng23CrepApply, eng23CrepText, eng23CrepHead};')(TX);
  const ap = v=>{ const e = {}; F.eng23CrepApply(e, v); return JSON.stringify(e); };
  ok(ap([0, 0, 0, 1]) === '{"crepuscular":true}' && ap([1, 1, 1, 1]) === '{"crepuscular":1,"crepuscularHp":1}' && ap([1, 0, 0, 2]) === '{"crepuscular":true,"crepuscularDay":[1,0],"crepuscularNight":[0,2]}',
    `1: the editor saves the default as true, equal parts as the old form, else the two parts (${ap([0, 0, 0, 1])} ${ap([1, 1, 1, 1])} ${ap([1, 0, 0, 2])})`);
  ok(JSON.stringify(F.eng23CrepGet(byId['nightjar-drifter'].effects)) === '[1,1,1,1]' && JSON.stringify(F.eng23CrepGet({crepuscular:true})) === '[0,0,0,1]' && F.eng23CrepGet({crepuscular:true, crepuscularGrant:{day:{}, night:{}}}) === undefined, '1: the editor reads old cards, the default and leaves the braced form to its own row');
  ok(F.eng23CrepText([0, 0, 0, 1]) === 'At night: +0/+1. Twilight brings it too.' && F.eng23CrepText([1, 0, 0, 2]) === 'By day: +1/+0. At night: +0/+2. Twilight brings both.' && F.eng23CrepHead([1, 0, 0, 2]) === 'Crepuscular { +1/+0 } → { +0/+2 }', '1: the card text and head'); }
ok(/placeholders:\[TX\('ui\.eng23-crep-day-atk'\), TX\('ui\.eng23-crep-day-hp'\), TX\('ui\.eng23-crep-night-atk'\), TX\('ui\.eng23-crep-night-hp'\)\], defaultValue:\[0, 0, 0, 1\]/.test(app) && /data-sk="val\$\{j \+ 2\}"/.test(app) && /v3El && v2El \? \[v0, v1, v2El\.value, v3El\.value\]/.test(app), '1: the editor row has four numbers (day / night Attack and Health), +0/+0 / +0/+1 by default');
ok(TXT['ui.eng23-crep-braced'] === 'Crepuscular {day} → {night}' && /key:'crepuscularGrant', category:'passive', get label\(\)\{ return TX\('ui\.eng23-crep-braced'\); \}/.test(app), '1: the braced form is offered as "Crepuscular {day} → {night}" (stats or skills in each brace)');
ok(byId['nightjar-drifter'].effects.crepuscular === 1 && byId['nightjar-drifter'].effects.crepuscularHp === 1 && byId['woodcock-lookout'].effects.crepuscular === 1, '1: no card changed');

// ---- 2. Skitter ----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(3); const s = put(e, P, 1, 'x-skit', 0); put(e, P, 2, 'x-dummy', 0);
  const fx = ()=> (e.derivedDefs[s.defId] || defs[s.defId] || {}).effects || {};
  e.roundStart(P, 1, so, {}, []); const before = !!(fx().haste || fx().evasive); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'skitter'), '2: its hit lands: a skitter event');
  e.roundStart(P, 2, so, {}, []); const on = fx(); ok(!before && on.haste && on.evasive && e.eng23SkitterOn(s), `2: the next round it has Haste and Evasive (${JSON.stringify(on)})`);
  ok((s.speed || 0) >= 2, `2: Haste's Speed +2 (speed ${s.speed})`);
  P[2].row.center = []; e.syncSlots(P[2]); e.resolveCombat(P, so, {}, [], 1); // round 2: nothing to hit (it swings at the bramble)
  e.roundStart(P, 3, so, {}, []); const off = fx(); ok(!off.haste && !off.evasive, `2: after a round with no unit hit: gone (${JSON.stringify(off)})`); }
{ const {e, P} = mk(4); const s = put(e, P, 1, 'x-skit', 0); put(e, P, 2, 'x-weak', 0); s.atk = 9; const ev = []; e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, ev, 1);
  e.roundStart(P, 2, so, {}, []); ok(e.eng23SkitterOn(s), '2: a killing hit counts too'); }
ok(SK.skitter && SK.skitter.value === 1.44 && SK.skitter.theoretical && BB.SKITTER_MISS_MULT === 1.1 && BB.missMultOf({skitter:true}) === 1.1 && BB.missMultOf({skitter:true, evasive:true}) === BB.missMultOf({evasive:true}), '2: priced: Haste 2.57 x 0.56 = 1.44 S, Evasive x1.1 on the stat terms (nothing extra beside its own Evasive)');
ok(!cards.some(c=> c.effects && c.effects.skitter) && !(byId['field-vole'] && byId['field-vole'].effects && byId['field-vole'].effects.skitter), '2: on no card (the owner puts it on Field Vole)');
ok(/key:'skitter', category:'passive', label:TX\('ui\.eng23-skitter-name'\)/.test(app) && TXT['ui.eng23-skitter'], '2: in "+ Add Skill" with its text');

// ---- 3. Fast-forward tokens ---------------------------------------------------------------------------------------------------
{ const {e, P} = mk(5); const ev = []; e.debugSpawnCard(P, so, 1, 'x-ffgive', 0, {}, ev); const c = all(P[1]).find(x=> x.defId === 'x-ffgive');
  ok(c && c.ffCounters === 2 && ev.some(x=> x.kind === 'grantFastForward' && x.amount === 2), `3: Grant Fast-forward 2 (on play, itself): 2 tokens (${c && c.ffCounters})`);
  put(e, P, 2, 'x-dummy', 0); const ev2 = []; const w0 = c.wait; e.resolveCombat(P, so, {}, ev2, 1);
  const ff = ev2.find(x=> x.type === 'fastForward' && x.uid === c.uid);
  ok(ff && ff.n === 2 && c.ffCounters === 0 && c.wait <= w0 - 2, `3: N tokens act as Fast Forward N: 2 extra turns at the next combat (Wait ${w0} -> ${c.wait}), then spent`); }
{ const {e, P} = mk(6); const a = put(e, P, 1, 'x-dummy', -1), b = put(e, P, 1, 'x-dummy', 1); e.debugSpawnCard(P, so, 1, 'x-ffally', 0, {}, []);
  ok(a.ffCounters === 1 && b.ffCounters === 1, '3: Grant Fast-forward 1 to every ally'); }
ok(E.ACTION_KEYS.includes('grantFastForward') && AC.grantFastForward && AC.grantFastForward.value === 3.02 && !cards.some(c=> ((c.effects||{}).triggers||[]).some(t=> t && t.do === 'grantFastForward')), '3: an action key, priced at Fast Forward 1 a token, on no card');
ok(/abadge ff-tokens/.test(app) && /ffCounters:rc\.ffCounters\|\|0/.test(app) && /ffCounters:c\.ffCounters\|\|0/.test(app) && TXT['ui.eng23-ff-tip'], '3: the board shows ⏩N with a tooltip (live and in the replay)');

// ---- 4. the "?" rules -------------------------------------------------------------------------------------------------------
ok(/keenEye:\s+\{from:6, seenWith:\['invisible', 'changeling'\]\}/.test(app) && /function eng23SeenWithMet/.test(app), '4: True Sight reads "?" until Map 6 or a seen Invisible / Changeling card');
ok(!/\bdelivery:\s*\{from:/.test(app) && !/\bstockpile:\s*\{from:/.test(app), '4: Delivery (and the old Stockpile) are not gated: Map 0 shows them');
ok(byId['beaver-lumberjack'].effects.delivery === 1 && /function eng23MigrateDelivery/.test(app) && /eng23MigrateDelivery\(liveCards\[id\]\)/.test(app), '4: the Beaver Lumberjack has Delivery; a live pre-ENG22 Stockpile edit reads as Delivery');
{ const src = app.slice(app.indexOf('function eng23MigrateDelivery'), app.indexOf('return Object.assign({}, d, {effects: fx}); }', app.indexOf('function eng23MigrateDelivery')) + 46);
  const mig = new Function(src + '; return eng23MigrateDelivery;')(); const m = mig({id:'beaver-lumberjack', attack:3, health:5, effects:{stockpile:1}});
  ok(m.effects.delivery === 1 && !('stockpile' in m.effects), '4: the live row {stockpile: 1} reads {delivery: 1}'); }
{ // which maps field an Invisible or a Changeling first
  const pools = J('canonical/map-pools.json').maps, hidden = new Set(cards.filter(c=> c.effects && (c.effects.invisible || c.effects.changeling)).map(c=> c.id));
  const early = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'].filter(k=> pools[k] && [].concat(pools[k].cards || [], pools[k].special || [], ...Object.values(pools[k].submaps || {})).some(id=> hidden.has(id)));
  ok(!early.length, `4: no Invisible / Changeling card on the lists of Maps 0-5 (${early})`); }

// ---- 5. the Map cards stats ---------------------------------------------------------------------------------------------------
{ const d = {id:'beaver-lumberjack', attack:3, health:5, rarity:'common', wait:1, cost:0, effects:{delivery:1}, obtainMap:0};
  const c = BB.forgeCurve(d, 1, 11); ok(c.rows[1].health === 5 && c.rows[10].health === 10, `5: the cause: the live 3/5 at the viewer's Level 10 is 3/${c.rows[10].health}; at its base level 3/${c.rows[1].health}`); }
ok(/function eng23MapDef\(id, defs\)/.test(app) && /data-zoom-base="1"/.test(app) && /el\.dataset\.zoomBase \? eng23MapDef\(el\.dataset\.zoom\)/.test(app), '5: the Map cards tiles and their zoom draw the card at its base level');

// ---- 6. Rodentia --------------------------------------------------------------------------------------------------------------
ok(TAXO.name('Rodent') === 'Rodentia' && TAXO.key('Rodentia') === 'rodent' && TAXO.isA({species:['Rodent']}, 'Rodentia') && TAXO.isA({species:['Rodent']}, 'Rodent'), '6: Rodent shows as Rodentia; both names find the rodents');
ok(cards.filter(c=> (c.species || []).includes('Rodent')).length === 53, '6: the key stays (53 cards keep species "Rodent")');
ok(/TAXO \? TAXO\.name\(x\) : x/.test(app), '6: the card details show the Type\'s name');

// ---- 7. CONTENT9-2 ------------------------------------------------------------------------------------------------------------
const CH = J('canonical/characters.json'), chOf = id=> CH.find(c=> c.id === id);
{ const gl = chOf('gnawed-larder'), bk = chOf('ballista-keep');
  ok(gl && gl.effects.feed && gl.effects.feed.feeds === 3 && gl.effects.feed.repair === 5 && gl.effects.feed.attack === 3 /* 2026-11-04 (ENG24, IDEA-BRAMBLES): +2 each (was 3 / 1) */ && gl.unlockMap === 'm8', '7: the Gnawed Larder: Feed 3 a fight, Repair 5, +3 Attack (ENG24 +2; unlocked by Map 6\'s boss)');
  ok(bk && bk.effects.aimedBolt === 6 && bk.effects.castleBolt === 4 /* 2026-11-04 (ENG24, IDEA-BRAMBLES): +2 each (was 4 / 2) */ && bk.health === 22, '7: Ballista Keep: Aimed Bolt 6 beside its bolt 4 (ENG24 +2); Health unchanged (owner call)'); }
{ const {e, P} = mk(7, {}, {1: chOf('gnawed-larder')}); const pl = P[1]; pl.hq.hp -= 5; const u1 = put(e, P, 1, 'x-dummy', 0), u2 = put(e, P, 1, 'x-dummy', 1);
  pl.hand = [{uid: 901, defId:'x-weak'}, {uid: 902, defId:'x-weak'}, {uid: 903, defId:'x-weak'}, {uid: 904, defId:'x-weak'}]; const hp0 = pl.hq.hp, a0 = u1.atk, ev = [];
  const r = e.feedBramble(P, so, 1, pl.hand[0], {}, ev);
  ok(r && pl.hq.hp === hp0 + 5 && u1.atk === a0 + 3 && u2.atk === a0 + 3 /* ENG24 (2026-11-04): Repair 5, +3 (was 3, +1) */ && pl.discardUsedThisTurn && pl.feed.left === 2 && pl.graveyard.some(g=> g.defId === 'x-weak') && ev.some(x=> x.type === 'feed'), '7: a feed: Repair 5, +3 Attack on the field (ENG24), the turn\'s pitch used, 2 left');
  ok(!e.feedBramble(P, so, 1, pl.hand[0], {}, []), '7: once a turn (it is the pitch)');
  const lumber0 = pl.lumber || 0; pl.discardUsedThisTurn = false; e.feedBramble(P, so, 1, pl.hand[0], {}, []); pl.discardUsedThisTurn = false; e.feedBramble(P, so, 1, pl.hand[0], {}, []); pl.discardUsedThisTurn = false;
  ok(pl.feed.left === 0 && !e.feedBramble(P, so, 1, pl.hand[0], {}, []) && (pl.lumber || 0) === lumber0 && pl.hq.hp <= pl.hq.maxHp, '7: three feeds a fight, no Lumber, never above the bramble\'s top'); }
{ const {e, P} = mk(8, {}, {1: chOf('ballista-keep')}); const t = put(e, P, 2, 'x-dummy', 0); const hp0 = t.hp, ev = [];
  const r = e.aimedBolt(P, so, 1, 0, {}, ev);
  ok(r && t.hp === hp0 - 6 /* ENG24 (2026-11-04): 6 (was 4) */ && ev.some(x=> x.kind === 'aimedBolt'), `7: Aimed Bolt: 6 to the unit in the column picked (${hp0} -> ${t.hp})`);
  ok(!e.aimedBolt(P, so, 1, 0, {}, []), '7: once a fight');
  const g = mk(9, {}, {1: chOf('ballista-keep')}); const h0 = g.P[2].hq.hp; g.e.aimedBolt(g.P, so, 1, 2, {}, []);
  ok(g.P[2].hq.hp === h0 - 6 /* ENG24 */, '7: an empty column: their bramble takes it'); }
{ const {e, P} = mk(10, {}, {2: chOf('ballista-keep')}); const weak = put(e, P, 1, 'x-weak', 0); put(e, P, 1, 'x-dummy', 1); P[2].hand = [];
  e.eng23AiBramble(P, so, 2, {}, []); ok(!(weak.hp > 0) || !all(P[1]).includes(weak), '7: the CPU aims it at a unit it can kill'); }
{ const {e, P} = mk(11, {}, {2: chOf('gnawed-larder')}); put(e, P, 2, 'x-dummy', 0); put(e, P, 2, 'x-dummy', 1); P[2].hand = [{uid: 951, defId:'x-dummy'}, {uid: 952, defId:'x-pricey'}]; P[2].lumber = 0;
  e.eng23AiBramble(P, so, 2, {}, []); ok(P[2].feed.left === 2 && P[2].hand.length === 1, '7: the CPU feeds its bramble when its pitch is unused and two of its units stand'); }
ok(/function eng23BrambleActsHTML\(m\)/.test(app) && /eng23BrambleActsHTML\(m\) \/\* ENG23 \(2026-11-04\): Feed \/ Aimed Bolt \*\//.test(app) && /async function eng23FeedByUid\(uid\)/.test(app) && /async function eng23AimedBolt\(slot\)/.test(app), '7: the HUD has 🍖 Feed and 🎯 Aimed Bolt (drop or tap; a column picker)');
ok(/eng23AiBramble\(players, sideOf, aiId, stats, events\)/.test(eng), '7: the CPU uses them after its plays');

// ---- decisions, docs, packs ---------------------------------------------------------------------------------------------------
{ const D = J('docs/decisions.json'), ids = D.items.map(x=> x.id); const want = ['ENG23-1', 'ENG23-2', 'ENG23-3', 'ENG23-4', 'ENG23-5', 'ENG23-6', 'ENG23-7'];
  ok(want.every(i=> ids.includes(i)) && want.every(i=> D.items.find(x=> x.id === i).status === 'YET'), `8: decisions ${want.join(', ')} filed (YET)`); }
ok(/ENG23/.test(R('docs/project-state.md')) && /Skitter/.test(R('docs/effects-catalogue.md')) && /ENG23/.test(R('docs/CHANGELOG.md').slice(0, 5000)), '8: project-state, effects-catalogue and the CHANGELOG carry ENG23');
{ const miss = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].filter(c=>{ const p = J('lang/' + c + '.json'); return !Object.keys(TXT).filter(k=> k.startsWith('ui.eng23-')).every(k=> p[TXT[k]]) || !p['Rodentia']; });
  ok(!miss.length, `8: the new texts and Rodentia in the 12 packs (${miss})`); }
console.log(`eng23: ${fail ? fail + ' failure(s)' : 'all passed'} (${n} checks)`);
process.exit(fail ? 1 : 0);
