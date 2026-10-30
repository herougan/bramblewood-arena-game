#!/usr/bin/env node
// 2026-10-26 (package ENG10): the owner's 10-26 11:19 answers, as recorded in docs/decisions.json.
//   ENG9-3 the spits named by their element alone; ENG9-4 Charge recharges, Reload more negative; ENG9-5 Mushroom type, Flora the phylum;
//   ENG9-6 Armor stops arrows and spits; ENG9-9 Armor priced slightly exponentially (and the cards cut to it); ENG9-7 a Wait-0 unit's On Ready
//   fires as it is played; ENG9-10 the Grasping Briars field; PROP1-1 Hardy N, Sunder, Dismantle, Pulverise takes a life; PROP1-3 Gorge;
//   PROP1-4 the six threshold skills; FIX3-4 a PvP stranger levelled to your battle rating; PREF-3 a late side map's PRO level.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-arm': U('x-arm', {armor:2}, {attack:0, health:500, wait:9}),
  'x-arrow': U('x-arrow', {arrow:5}, {attack:0, health:500}), 'x-firearrow': U('x-firearrow', {fireArrow:5}, {attack:0, health:500}),
  'x-spit': U('x-spit', {fireBolt:4}, {attack:0, health:500}), 'x-pierce': U('x-pierce', {arrow:5, pierce:2}, {attack:0, health:500}),
  'x-missile': U('x-missile', {triggers:[{on:'perTurn', do:'damage', amount:5, who:'enemy', sub:'random', dmgType:'physical'}]}, {attack:0, health:500}),
  'x-charge': U('x-charge', {charge:{n:1, do:{do:'damage', amount:3, who:'enemy', sub:'random'}}}, {attack:0, health:50, wait:0}),
  'x-ready0': U('x-ready0', {triggers:[{on:'onReady', do:'gain', resource:'lumber', amount:2}]}, {attack:0, health:20, wait:0}),
  'x-ready1': U('x-ready1', {triggers:[{on:'onReady', do:'gain', resource:'lumber', amount:2}]}, {attack:0, health:20, wait:1}),
  'x-sunder': U('x-sunder', {sunder:true}, {attack:1, health:500}), 'x-pulv': U('x-pulv', {pulverise:true}, {attack:1, health:500}),
  'x-dism': U('x-dism', {dismantle:true}, {attack:0, health:50, wait:9}),
  'x-mail': {id:'x-mail', name:'x-mail', cardType:'equipment', rarity:'common', attack:0, health:2, cost:0, effects:{}, equip:{durability:3, hardy:2, grant:{}}},
  'x-gorge': U('x-gorge', {parasite:true, fester:true}, {attack:5, health:20, wait:0}), 'x-leech': U('x-leech', {parasite:true}, {attack:5, health:20, wait:0}),
  'x-req': U('x-req', {requiem:5}, {attack:1, health:10, wait:9}), 'x-dirge': U('x-dirge', {dirge:3}, {attack:1, health:10, wait:9}), 'x-carn': U('x-carn', {carnage:3}, {attack:1, health:10, wait:9}),
  'x-must': U('x-must', {muster:3}, {attack:1, health:10, wait:9}), 'x-beset': U('x-beset', {beset:2, besetGrant:{attack:3}}, {attack:1, health:10, wait:9}), 'x-throng': U('x-throng', {throng:4}, {attack:1, health:10, wait:9}),
  'x-flyer': U('x-flyer', {flying:true}, {attack:0, health:500, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts, hp){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:hp || 200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:hp || 200, effects:{}})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const costs = JSON.parse(rd('canonical/skill-costs.json')), T = SC.make(costs), by = {}; costs.skills.forEach(x=> by[x.id] = x);
const cards = JSON.parse(rd('canonical/cards.json')), cid = {}; cards.forEach(c=> cid[c.id] = c);
const tx = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = rd('arena_app.js');

// ---- ENG9-3 the spits ---------------------------------------------------------------------------------------------------------------
{ const names = {cinder:'Cinder', acid:'Acid', venom:'Venom', ice:'Ice', spark:'Spark'};
  Object.entries(names).forEach(([k, v])=> ok(tx['ui.e10-skn-' + k] === v, `ENG9-3 the ${k} spit reads "${v}" (no "Spit")`));
  ok(/\['fireBolt', TX\('ui\.e10-skn-cinder'\)\]/.test(app) && !/eng9-skn-/.test(app), 'ENG9-3 the five spit labels use the new names');
  // no clash: none of the five is a skill label, a gem's name or another skill key's name (Ember is the gem, Frost a skill: hence Cinder, Ice)
  const vals = Object.entries(tx).filter(([k])=> !/^ui\.e10-skn-/.test(k)).map(([, v])=> v);
  ['Cinder', 'Venom', 'Ice', 'Spark'].forEach(w=> ok(!vals.includes(w), `ENG9-3 "${w}" is used by no other text (no clash)`));
  ok(tx['ui.h1-gem-ember'] === 'Ember' && tx['ui.skn-frost'] === 'Frost', 'ENG9-3 (why: Ember is a gem, Frost a skill)'); }

// ---- ENG9-4 Charge recharges, Reload --------------------------------------------------------------------------------------------------
{ const {e, P} = mk(41); put(e, P, 2, 'x-wall', 0); const c = put(e, P, 1, 'x-charge', 0); const ev = [];
  for(let r = 0; r < 4; r++) e.endOfRoundUpkeep(P, so, {}, ev);
  const fired = ev.filter(x=> x.type === 'charge' && x.uid === c.uid && x.fired).length;
  ok(fired >= 3 && !ev.some(x=> x.type === 'skillSpent' && (x.keys || []).includes('charge')), `ENG9-4 Charge 1 goes off every upkeep and stays (${fired} in 4)`);
  // 2026-10-30 RECOST1: Charge re-priced to its bench worth (3 -> 5.58) and the Electric Ray trimmed to 3/8; ENG10's 3 is now its prevValue
  const rc = /RECOST1/.test(by.charge.appliedAt || '');
  ok(rc ? by.charge.prevValue === 3 && by.charge.recost1Was && by.charge.recost1Was.prevValue === 1.2 : (by.charge.value === 3 && by.charge.prevValue === 1.2), 'ENG9-4 Charge priced 3 again (the repeating clock)');
  ok(by.reload.value === -6 && by.reload.prevValue === -4, 'ENG9-4 Reload more negative: -4 -> -6');
  ok(cid['peak-condor'].health === 7 && cid['riptide-eel'].attack === 9 && cid['riptide-eel'].health === 6, 'ENG9-4 the Reload cards re-fit up: Peak Condor 4/7, Riptide Eel 9/6');
  ok(rc ? cid['electric-ray'].attack === 3 && cid['electric-ray'].health === 8 : (cid['electric-ray'].attack === 4 && cid['electric-ray'].health === 9), 'ENG9-4 the Electric Ray back to 4/9 (3/8 since RECOST1)'); }

// ---- ENG9-5 Flora and Mushroom --------------------------------------------------------------------------------------------------------
{ const TX = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
  ['fungal-colossus', 'puffball-bombardier', 'phoenix-mushrooms'].forEach(id=> ok(cid[id] && cid[id].archetypes.includes('Mushroom') && !cid[id].archetypes.includes('Fungi'), `ENG9-5 ${id} has the type Mushroom`));
  ok(TX.isA(cid['fungal-colossus'], 'Flora') && TX.isA(cid['ent'], 'Flora') && TX.isA(cid['rafflesia'], 'Flora'), 'ENG9-5 a Mushroom, a Tree and a Flower all count as Flora');
  ok(TX.phylumOf('Fungi') === 'Flora' && TX.phylumOf('Plant') === 'Flora', 'ENG9-5 Flora is the phylum of Plant and Fungi');
  ok(cid['ent'].archetypes.includes('Tree') && cid['rafflesia'].archetypes.includes('Flower') && cid['strangler-vine'].archetypes.includes('Vine'), 'ENG9-5 Flora cards carry their type (Tree, Flower, Vine)');
  ok(['Tree', 'Fruit', 'Flower', 'Mushroom'].every(t=> TX.name(t) === t && TX.ancestors(t).has('flora')), 'ENG9-5 Tree, Fruit, Flower, Mushroom sit under Flora');
  ok(/Tree:'🌳', Fruit:'🍎', Flower:'🌸', Vine:'🌱', Mushroom:'🍄'/.test(app), 'ENG9-5 the filters show the Flora types with icons'); }

// ---- ENG9-6 Armor stops arrows and spits ----------------------------------------------------------------------------------------------
{ const shotDmg = (att, tgt)=>{ const {e, P} = mk(61); const t = put(e, P, 2, tgt, 0); put(e, P, 1, att, 0); const h0 = t.hp; round(e, P, 1); return h0 - t.hp; };
  ok(shotDmg('x-arrow', 'x-arm') === 3, `ENG9-6 an Arrow 5 at Armor 2 deals 3 (${shotDmg('x-arrow', 'x-arm')})`);
  ok(shotDmg('x-arrow', 'x-wall') === 5, 'ENG9-6 ... 5 at no Armor');
  ok(shotDmg('x-firearrow', 'x-arm') === 3, `ENG9-6 a Fire Arrow 5 at Armor 2 deals 3 (the elements are physical) (${shotDmg('x-firearrow', 'x-arm')})`);
  ok(shotDmg('x-spit', 'x-arm') === 2, `ENG9-6 a Cinder spit 4 at Armor 2 deals 2 (${shotDmg('x-spit', 'x-arm')})`);
  ok(shotDmg('x-pierce', 'x-arm') === 5, `ENG9-6 Pierce 2 cuts it (${shotDmg('x-pierce', 'x-arm')})`); }

// ---- ENG9-9 Armor's price ---------------------------------------------------------------------------------------------------------------
{ const c1 = T.skillCost('armor', 1), c5 = T.skillCost('armor', 5);
  ok(Math.abs(c5 / c1 - 10) < 0.3, `ENG9-9 Armor 5 is about 10x Armor 1 (${c1} -> ${c5})`);
  ok(T.skillCost('armor', 2) > 2 * c1 && T.skillCost('armor', 3) > 3 * c1, 'ENG9-9 ... slightly exponential (each point worth more than the last)');
  const m = JSON.parse(rd('docs/balance/eng10-armor-hits-2026-10-26.json'));
  ok(m.hits > 10000 && m.perN['5'].cancelled > 0.9, `ENG9-9 measured: Armor 5 cancels ${Math.round(m.perN['5'].cancelled * 100)}% of ${m.hits} hits`);
  ok(cid['tide-pool-crab'].health === 3 /* 2026-10-26 (FIN2-c): Shield at 0.8 Health re-fit it 1/2 -> 1/3 */ && cid['hawthorn-shieldbug'].health === 12, 'ENG9-9 the two held cards cut to the line: Tide Pool Crab 1/2, Hawthorn Shieldbug 2/12');
  const refit = JSON.parse(rd('docs/balance/eng10-refit-2026-10-26.json'));
  const held = JSON.parse(rd('docs/balance/human-pass-1-flagged-2026-10-21.json'));
  ok(refit.flagged.every(id=> held.includes(id)) && refit.cut.length > 10, `ENG9-9 every moved card has a line but cards already held over budget (${refit.flagged.join(', ')}; ${refit.cut.length} cut, ${refit.raised.length} raised)`);
  ok(cid['barnacle-fortress'].effects.armor === 3 && cid['stone-turtle-warden'].effects.armor === 3, 'ENG9-9 Armor 5 / 4 on a Common has no legal line: Barnacle Fortress and Stone Turtle Warden at Armor 3 (call ENG10-2)');
  const m1 = new Set(JSON.parse(rd('docs/balance/bal7-m1-rebalance-2026-10-28.json')).plan.filter(p=> p.move).map(p=> p.id)); /* 2026-10-28 (BAL7, M1): the contribution re-balance moved these cards again (docs/balance/bal7-m1-rebalance-2026-10-28.json) */
  const HOLD = id=>{ const h = require(path.join(ROOT, 'tools', 'lib_map_pools.js')).budgetHold(id); if(h) console.log(`  · ${id}: budget not checked, ${h === 'unplaced' ? 'unplaced (on no list, out of play)' : 'pending step 3 (re-fit)'}`); return !!h; }; // 2026-10-29 LISTFIX1: cards on no list are out of play (owner 22:47): an 'unplaced' card (on no list) or one 'pending' the owner's re-fit (step 3) is reported, not failed (tools/lib_map_pools.js budgetHold)
  const rc1 = new Set((()=>{ try{ return JSON.parse(rd('docs/balance/recost1-2026-10-30.json')).refits.map(r=> r.id); }catch(e){ return []; } })()); // 2026-10-30 RECOST1: re-fit again (docs/balance/recost1-2026-10-30.json)
  refit.cut.concat(refit.raised).filter(r=> !m1.has(r.id) && !rc1.has(r.id)).filter(r=> r.id !== 'tide-pool-crab' /* 2026-10-26 (FIN2-c): re-fit again, tests/fin2-2026-10-26.js */).forEach(r=>{ const c = cid[r.id]; ok(c && `${c.attack}/${c.health}` === r.to && (T.budget(c, {level: 1}).ok || HOLD(r.id)), `ENG9-9 ${r.id} at ${r.to}, inside its budget`); }); }

// ---- ENG9-7 On Ready at Wait 0 ---------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(71); const l0 = P[1].lumber || 0; const ev = []; put(e, P, 1, 'x-ready0', 0, ev);
  ok((P[1].lumber || 0) - l0 === 2 && ev.some(x=> x.type === 'ready'), `ENG9-7 a Wait-0 unit's On Ready fires as it is played (+${(P[1].lumber || 0) - l0} Lumber)`);
  const ev2 = []; e.endOfRoundUpkeep(P, so, {}, ev2); ok((P[1].lumber || 0) - l0 === 2, 'ENG9-7 ... and not again at the upkeep');
  const {e: e2, P: P2} = mk(72); const m0 = P2[1].lumber || 0; put(e2, P2, 1, 'x-ready1', 0);
  ok((P2[1].lumber || 0) === m0, 'ENG9-7 a Wait-1 unit waits'); e2.endOfRoundUpkeep(P2, so, {}, []); ok((P2[1].lumber || 0) - m0 === 2, 'ENG9-7 ... and gets it at the upkeep its Wait runs out'); }

// ---- ENG9-10 Grasping Briars ------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(101, {rules: {graspingBriars: true}}); const a = put(e, P, 1, 'x-wall', 0), b = put(e, P, 2, 'x-wall', 0), f = put(e, P, 2, 'x-flyer', 1);
  let caught = 0, flyer = 0; for(let r = 2; r < 12; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); if(ev.some(x=> x.type === 'statusFx' && x.kind === 'tangled' && x.field === 'graspingBriars' && x.targetUid === a.uid)) caught++; if(ev.some(x=> x.kind === 'tangled' && x.targetUid === f.uid)) flyer++; }
  ok(caught >= 9 && a.tangled >= 1, `ENG9-10 Grasping Briars Tangles a unit on each side every round (${caught}/10)`);
  ok(flyer === 0, 'ENG9-10 ... never a Flyer');
  ok((app.match(/rules:\{graspingBriars:true\}/g) || []).length === 2 && /graspingBriars: \{icon:'🌹'/.test(app), 'ENG9-10 on 12-4 and 12-7, listed with the field effects'); }

// ---- PROP1-1 Hardy, Sunder, Dismantle, Pulverise --------------------------------------------------------------------------------------
const arm = (c)=>{ c.equipment = 'x-mail'; c.equipOn = true; c.equipDur = 3; c.equipLives = 2; };
{ const {e, P} = mk(111); const c = put(e, P, 1, 'x-wall', 0); arm(c); e.eq2Wear(c, 3, 'hit');
  ok(c.equipment === 'x-mail' && c.equipLives === 1 && c.equipDur === 3, `PROP1-1 Hardy 2: worn to 0, it loses a life and refills (${c.equipLives} life, ${c.equipDur} durability)`);
  e.eq2Wear(c, 3, 'hit'); ok(!c.equipment, 'PROP1-1 ... at its last life it breaks'); }
{ let broke = 0; const N = 200; for(let s = 1; s <= N; s++){ const {e, P} = mk(1000 + s); const t = put(e, P, 2, 'x-wall', 0); arm(t); t.equipDur = 50; put(e, P, 1, 'x-sunder', 0); round(e, P, 1); if(t.equipLives === 1) broke++; }
  ok(broke > N * 0.38 && broke < N * 0.62, `PROP1-1 Sunder: a landed hit takes a life about half the time (${broke}/${N})`); }
{ const {e, P} = mk(121); const t = put(e, P, 2, 'x-wall', 0); arm(t); t.equipDur = 50; put(e, P, 1, 'x-pulv', 0); round(e, P, 1);
  ok(t.equipment === 'x-mail' && t.equipLives === 1, 'PROP1-1 Pulverise takes one Hardy life for sure'); round(e, P, 1); ok(!t.equipment, 'PROP1-1 ... and the next one breaks it'); }
{ let hit = 0, tries = 0; for(let s = 1; s <= 200; s++){ const {e, P} = mk(3000 + s); const t = put(e, P, 2, 'x-wall', 0); arm(t); const ev = []; put(e, P, 1, 'x-dism', 0, ev); tries++; if(t.equipLives === 1) hit++; }
  ok(hit > tries * 0.38 && hit < tries * 0.62, `PROP1-1 Dismantle: one 50% roll as it is played (${hit}/${tries})`); }
{ ok(cid['dragonscale-mail'].equip.hardy === 2, 'PROP1-1 Dragonscale Mail has Hardy 2');
  ok(BB.equipLifeMult(cid['dragonscale-mail']) === 1.35 && BB.equipLifeMult({rarity: 'common'}) === 0.75, `PROP1-1 the price: equipLifeMult with lives (${BB.equipLifeMult(cid['dragonscale-mail'])})`);
  ok(by.sunder.value === 1 && by.dismantle.value === 0.5 && by.pulverise.value === 2.1, 'PROP1-1 prices: Sunder 1.0, Dismantle 0.5, Pulverise 2.1'); }

// ---- PROP1-3 Gorge -------------------------------------------------------------------------------------------------------------------------
const hook = (P, pid, p, host)=>{ const pl = P[pid]; ['left', 'center', 'right'].forEach(k=> pl.row[k] = pl.row[k].filter(x=> x !== p)); p.parasiteOf = host.uid; p.parasitePid = pid; host.parasite = p; };
{ const {e, P} = mk(131); const host = put(e, P, 2, 'x-wall', 0), g = put(e, P, 1, 'x-gorge', 1); hook(P, 1, g, host); const h0 = host.hp, ev = [];
  e.endOfRoundUpkeep(P, so, {}, ev); const d = ev.find(x=> x.type === 'parasiteDrain' && x.gorge);
  ok(d && d.dmg === 3 && h0 - host.hp === 3, `PROP1-3 Gorge: a hooked Parasite feeds again at round end, at half its Attack (5 -> ${d && d.dmg})`);
  const {e: e2, P: P2} = mk(132); const host2 = put(e2, P2, 2, 'x-wall', 0), l = put(e2, P2, 1, 'x-leech', 1); hook(P2, 1, l, host2); const ev2 = []; e2.endOfRoundUpkeep(P2, so, {}, ev2);
  ok(!ev2.some(x=> x.type === 'parasiteDrain'), 'PROP1-3 ... a plain Parasite does not');
  ok(cid['gangrenous-leech'].effects.parasite && cid['gangrenous-leech'].effects.fester && by.fester.value === 2.8 && by.fester.label === 'Gorge', 'PROP1-3 the Gangrenous Leech is a Parasite with Gorge (2.8)'); }

// ---- PROP1-4 the threshold skills -----------------------------------------------------------------------------------------------------------
{ const on = (c, k)=> String(c._en5On || '').split(',').includes(k);
  const {e, P} = mk(141); const r = put(e, P, 1, 'x-req', 0), dg = put(e, P, 1, 'x-dirge', 1), ca = put(e, P, 1, 'x-carn', -1); put(e, P, 2, 'x-wall', 0);
  ok(!on(r, 'requiem') && r.atk === 1, 'PROP1-4 Requiem 5 off with no deaths');
  P[1].diedThisFight = 3; P[2].diedThisFight = 2; e.syncPhaseStats(P, so, []);
  ok(on(r, 'requiem') && (r.atk + (r.phaseAtk || 0)) === 3 && r.maxHp === 12, `PROP1-4 Requiem 5 on at 5 deaths: +2/+2 (${(r.atk + (r.phaseAtk || 0))}/${r.maxHp})`);
  ok(on(dg, 'dirge') && !on(ca, 'carnage'), 'PROP1-4 Dirge 3 on at 3 of your deaths; Carnage 3 off at 2 enemy deaths');
  P[2].diedThisFight = 3; e.syncPhaseStats(P, so, []); ok(on(ca, 'carnage'), 'PROP1-4 Carnage 3 on at 3 enemy deaths');
  const {e: e2, P: P2} = mk(142); const m = put(e2, P2, 1, 'x-must', 0); ok(!on(m, 'muster'), 'PROP1-4 Muster 3 off alone');
  put(e2, P2, 1, 'x-wall', 1); put(e2, P2, 1, 'x-wall', -1); e2.syncPhaseStats(P2, so, []); ok(on(m, 'muster'), 'PROP1-4 Muster 3 on with 3 units of yours (itself included)');
  const b = put(e2, P2, 1, 'x-beset', 2); ok(!on(b, 'beset'), 'PROP1-4 Beset 2 off against no enemy');
  put(e2, P2, 2, 'x-wall', 0); put(e2, P2, 2, 'x-wall', 1); e2.syncPhaseStats(P2, so, []); ok(on(b, 'beset') && (b.atk + (b.phaseAtk || 0)) === 4, `PROP1-4 Beset 2 – {+3/+0} on against 2 enemies (${(b.atk + (b.phaseAtk || 0))})`);
  const t = put(e2, P2, 2, 'x-throng', -1); e2.syncPhaseStats(P2, so, []); ok(on(t, 'throng'), 'PROP1-4 Throng 4 on with 7 units on the field');
  // a death in a fight raises the count and the stats follow at once
  const {e: e3, P: P3} = mk(143); const r3 = put(e3, P3, 1, 'x-req', 0); P3[1].diedThisFight = 4; const v = put(e3, P3, 2, 'x-wall', 0); v.hp = 0; e3.removeDeadCards(P3, so, {}, {}, []);
  ok(P3[2].diedThisFight === 1 && on(r3, 'requiem'), 'PROP1-4 a death is counted in the sweep and Requiem turns on at once');
  const price = {requiem: 3.18, dirge: 2.76, carnage: 2.46, muster: 2.94, beset: 1.8, throng: 3.84};
  Object.entries(price).forEach(([k, s])=> ok(BB.thrS(k, true, {[k]: true}).S === s, `PROP1-4 ${k}'s default price ${s}`));
  ok(BB.thrS('requiem', 3, {requiem: 3}).S > BB.thrS('requiem', 7, {requiem: 7}).S, 'PROP1-4 a lower threshold costs more');
  const homes = {throng: 'carrion-fly-swarm', dirge: 'wolfsbane-alpha', carnage: 'dust-hyena', muster: 'wolf-pack-runner', beset: 'ravenous-wolverine', requiem: 'cinder-skeleton'};
  const om = JSON.parse(rd('canonical/card-obtain-maps.json')).maps;
  Object.entries(homes).forEach(([k, id])=> ok(cid[id] && cid[id].effects[k] && (om[id] == null || om[id] <= 20) && T.budget(cid[id], {level: 1}).ok, `PROP1-4 ${k} on ${id} (Maps 0-20, inside its budget)`));
  const carriers = cards.filter(c=> c.effects && Object.keys(homes).some(k=> c.effects[k]) && !c.test);
  ok(carriers.length === 6, `PROP1-4 no other card carries a threshold skill (${carriers.map(c=> c.id).join(', ')})`);
  Object.keys(homes).forEach(k=> ok(tx['ui.skn-e10-' + k] && tx['ui.sk-e10-' + k], `PROP1-4 ${k}: name and text`)); }

// ---- FIX3-4 and PREF-3 (the app's functions, run headless) --------------------------------------------------------------------------------
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
  const f = new Function('getCardDefs', 'ratingWeightOf', 'ratingLevelFactor', B.grab('deckLevelFrom') + '\n' + B.grab('pvpStrangerLevel') + '\nreturn {deckLevelFrom, pvpStrangerLevel};')(G.getCardDefs, G.ratingWeightOf, G.ratingLevelFactor);
  const deck = {'field-mouse': 5, 'meadow-rabbit': 5, 'cottontail': 5, 'fox-kit': 5}, at1 = f.deckLevelFrom(deck, ()=> 1, []);
  ok(f.pvpStrangerLevel({deck}, at1) === 1, 'FIX3-4 a stranger at your battle rating stays at Level 1');
  const L = f.pvpStrangerLevel({deck}, Math.round(at1 * 1.62)); ok(Math.abs(L - 3) < 0.1, `FIX3-4 BR x1.62 -> Level 3 (1 + 0.62 / 0.31) (${L})`);
  ok(f.pvpStrangerLevel({deck}, at1 * 100) === 10 && f.pvpStrangerLevel({deck}, 1) === 1, 'FIX3-4 clamped to Level 1-10');
  ok(/asyncGhost = pvpLevelStranger\(asyncGhost, mainDeckLevel\(myDeckCounts, matchLeaderId\(\)\)\)/.test(app) && /if\(asyncGhost && !standardDeck\)/.test(app), 'FIX3-4 Collection PvP levels the stranger; Standard PvP stays at Level 1');
  const g = new Function('CONQUEST_MAPS', 'mapNumberOf', 'mapUnlockNumberOf', 'roadCurveFights', 'roadEnemyLevelExact', B.grab('mainConquestMaps') + '\n' + B.grab('proLateSideLevel') + '\nreturn proLateSideLevel;')(G.CONQUEST_MAPS, G.mapNumberOf, G.mapUnlockNumberOf, G.roadCurveFights, G.roadEnemyLevelExact);
  const late = G.CONQUEST_MAPS.filter(m=> m.sub && !m.reserved && G.mapUnlockNumberOf(m.id) > G.mapNumberOf(m.id)), early = G.CONQUEST_MAPS.filter(m=> m.sub && !m.reserved && G.mapUnlockNumberOf(m.id) === G.mapNumberOf(m.id));
  ok(late.length > 0 && late.every(m=> g(m.id) != null), `PREF-3 every late side map has a PRO level (${late.map(m=> m.id + ' ' + g(m.id)).join(', ')})`);
  const ob = late.find(m=> m.id === 'mo'); ok(!ob || g('mo') > 1, `PREF-3 the Old Bramble (opens on Map ${ob && G.mapUnlockNumberOf('mo')}) fights above Level 1 (${ob && g('mo')})`);
  ok(early.every(m=> g(m.id) == null) && g('m3') == null, 'PREF-3 a main map and a side map that opens with its parent keep Level 1');
  ok(/let lv = e\.level != null \? e\.level : 1; \{ const late = proLateSideLevel\(mapId\);/.test(app), 'PREF-3 proNodeOf reads it'); }

// ---- texts in 12 packs --------------------------------------------------------------------------------------------------------------------
{ const keys = Object.keys(tx).filter(k=> /^ui\.(e10-|skn-e10-|sk-e10-)/.test(k)), texts = keys.map(k=> tx[k]);
  ok(keys.length >= 45, `texts: ${keys.length} ENG10 keys`);
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(rd('lang/' + code + '.json')); const miss = texts.filter(t=> !(t in pack));
    ok(!miss.length, `${code}: every ENG10 text translated (${miss.length} missing: ${miss.slice(0, 2).join(' | ')})`); }); }
console.log(`eng10-2026-10-26: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
