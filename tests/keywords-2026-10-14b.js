#!/usr/bin/env node
// 2026-10-14, second pass: Swimmers are Tide units (and float), Moonpull, the beach's Tide-spout, day and night by map (no card brings
// them), Irradiation tokens, Ghost's elemental half, Shade, Shadow, Supreme beasts, Twin, Sprout and Growth tokens.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'kb-wall':   {id:'kb-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'kb-hit':    {id:'kb-hit', name:'Hit', attack:5, health:500, wait:0, cost:0, effects:{}},
  'kb-fire':   {id:'kb-fire', name:'Fire', attack:5, health:500, wait:0, cost:0, dmgType:'heat', effects:{}},
  'kb-wand':   {id:'kb-wand', name:'Wand', attack:5, health:500, wait:0, cost:0, effects:{magic:true}},
  'kb-seer':   {id:'kb-seer', name:'Seer', attack:5, health:500, wait:0, cost:0, effects:{darksight:true}},          // sees in the dark: no darkness misses
  'kb-seewand':{id:'kb-seewand', name:'Seer Wand', attack:5, health:500, wait:0, cost:0, effects:{magic:true, darksight:true}},
  'kb-arm1':   {id:'kb-arm1', name:'Arm1', attack:0, health:40, wait:0, cost:0, effects:{armor:1}},
  'kb-swim':   {id:'kb-swim', name:'Swim', attack:2, health:500, wait:0, cost:0, effects:{swimmer:'evade'}},
  'kb-plain':  {id:'kb-plain', name:'Plain', attack:2, health:500, wait:0, cost:0, effects:{}},
  'kb-moon':   {id:'kb-moon', name:'Moon', attack:1, health:50, wait:0, cost:0, effects:{tide:true, moonpull:true}},
  'kb-ghost':  {id:'kb-ghost', name:'Ghost', attack:0, health:50, wait:0, cost:0, effects:{ghost:true}},
  'kb-shade':  {id:'kb-shade', name:'Shade', attack:0, health:500, wait:0, cost:0, effects:{shade:true}},
  'kb-shadow': {id:'kb-shadow', name:'Shadow', attack:0, health:5000, wait:0, cost:0, effects:{shadow:true}},
  'kb-sup':    {id:'kb-sup', name:'Dragon', attack:10, health:500, wait:0, cost:0, dmgType:'heat', effects:{supreme:true}},
  'kb-armor':  {id:'kb-armor', name:'Armor', attack:0, health:500, wait:0, cost:0, effects:{armor:3, scare:2}},
  'kb-bulwark':{id:'kb-bulwark', name:'Bulwark', attack:0, health:500, wait:0, cost:0, effects:{bulwark:3}},
  'kb-snipe':  {id:'kb-snipe', name:'Sniper', attack:3, health:40, wait:0, cost:0, effects:{snipe:2, flying:true, armor:1}},
  'kb-trig':   {id:'kb-trig', name:'Trig', attack:1, health:40, wait:0, cost:0, effects:{triggers:[{on:'onRoundStart', do:'buff', amount:2, who:'ally', sub:'all'}, {on:'onSpawn', do:'damage', amount:1, who:'enemy', sub:'random'}]}},
  'kb-weigh':  {id:'kb-weigh', name:'Weigh', attack:10000, health:10000, wait:0, cost:0, effects:{bounty:100000}},
  'kb-immune': {id:'kb-immune', name:'Lead', attack:1, health:40, wait:0, cost:0, effects:{immune:['radiation']}},
  'kb-irr':    {id:'kb-irr', name:'Glow', attack:0, health:500, wait:0, cost:0, effects:{irradiated:2}},
  'kb-twin':   {id:'kb-twin', name:'Twin', attack:3, health:7, wait:1, cost:0, effects:{twin:true, poison:1}},
  'kb-sprout': {id:'kb-sprout', name:'Seeder', attack:1, health:10, wait:0, cost:0, archetypes:['Bird'], effects:{sprout:2}},
  'kb-swarm':  {id:'kb-swarm', name:'Swarm', attack:2, health:500, wait:0, cost:0, archetypes:['Ant'], effects:{swarm:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id || (c.defId||'').startsWith(id + '~'));
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
const dealt = (e, P, attUid, tgt)=>{ const hp = tgt.hp; e.debugAttack(P, so, attUid, {}, []); return hp - tgt.hp; };

// ---- 1. Tide = Swimmers
{ const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));
  const both = cards.filter(c=> c.effects && c.effects.tide && c.effects.swimmer).map(c=> c.id);
  ok(!both.length, `no card carries both Tide and Swimmer any more (${both})`);
  const mj = cards.find(c=> c.id==='moon-jelly'); ok(mj && mj.effects.moonpull && mj.effects.tide, 'Moon Jelly has Moonpull'); }
{ const {e, P} = mk(); e.startTide(); e.debugSpawnCard(P, so, 1, 'kb-swim', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-wall', 'left', {}, []);
  const S = byDef(P[1], 'kb-swim'); ok(e.isTide(S), 'a Swimmer is a Tide unit');
  e.roundStart(P, 2, so, {}, []); ok(e.getTide() === 'flow', 'round 2 is Flow');
  ok(dealt(e, P, S.uid, byDef(P[2], 'kb-wall')) === 3, 'on Flow a 2-Attack Swimmer (Evade pick) hits for 3: Tide +1'); }
{ const {e, P} = mk(); e.startTide(); e.debugSpawnCard(P, so, 1, 'kb-hit', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-swim', 'left', {}, []);
  e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); ok(e.getTide() === 'ebb', 'round 3 is Ebb');
  ok(dealt(e, P, byDef(P[1], 'kb-hit').uid, byDef(P[2], 'kb-swim')) === 4, 'on Ebb a Swimmer has +1 Armor as a Tide unit (5 -> 4)'); }
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 1, 'kb-swim', 'left', {}, []); e.roundStart(P, 2, so, {}, []);
  ok(e.getTide() === null, `2026-10-15 (user: "Tide shouldn't occur even if you play a card with Tide."): a Swimmer no longer starts the tide (${e.getTide()})`); }
// ---- Moonpull: the Tide comes in at once
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); ok(e.getTide() === null, 'no Tide unit yet: no tide');
  const ev = []; e.debugSpawnCard(P, so, 1, 'kb-moon', 'left', {}, ev);
  ok(e.getTide() === 'flow', `Moonpull: Flow this very round (${e.getTide()})`); ok(ev.some(x=> x.type==='tide' && x.moonpull), 'the Moonpull is logged');
  e.roundStart(P, 3, so, {}, []); ok(e.getTide() === 'ebb', 'then the cycle runs on: Ebb');
  e.debugSpawnCard(P, so, 1, 'kb-moon', 'right', {}, []); ok(e.getTide() === 'flow', 'a second Moonpull on an Ebb turns it to Flow'); }
{ const {e, P} = mk({highTide:true}); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 1, 'kb-moon', 'left', {}, []); ok(e.getTide() === 'flow', 'with High tide on it also comes in as Flow'); }
// ---- Tide-spout (the beach)
{ const {e, P} = mk({tideSpout:true}); e.debugSpawnCard(P, so, 1, 'kb-plain', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-plain', 'left', {}, []);
  const A = byDef(P[1], 'kb-plain'), B = byDef(P[2], 'kb-plain');
  let ev = []; e.roundStart(P, 1, so, {}, ev); ok(!ev.some(x=> x.field==='tideSpout') && e.getTide() === null, 'no spout in round 1');
  ok(e.forecast().tideSpout === true, 'the forecast warns of the spout');
  ev = []; e.roundStart(P, 2, so, {}, ev);
  const sp = ev.find(x=> x.type==='fieldTick' && x.field==='tideSpout'); // 2026-10-16 (user: "Tide-spout should be one-off. Without Tide, there won't be flood or ebb."): the spout no longer brings the tide in.
  ok(sp && sp.col === 0 && !sp.tideIn, 'round 2: a spout bursts in the only column (and no longer brings the tide in, 2026-10-16)');
  ok(e.getTide() === null, `no Tide field: no Flood or Ebb (${e.getTide()})`);
  ok(A.wait === 1 && B.wait === 1, `both units there are washed back +1 Wait (${A.wait}, ${B.wait})`);
  ok(A.hp === 499 && B.hp === 499, `non-swimmers take 1 water damage (${A.hp}, ${B.hp})`);
  ok(ev.filter(x=> x.type==='wash' && x.spout).length === 2, 'two spout washes logged');
  ev = []; e.roundStart(P, 3, so, {}, ev); ok(ev.some(x=> x.field==='tideSpout' && !x.tideIn) && A.wait === 2, 'every round after, it spouts again (no second "tide in")'); }
{ const {e, P} = mk({tideSpout:true}); e.debugSpawnCard(P, so, 1, 'kb-plain', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-swim', 'left', {}, []);
  const A = byDef(P[1], 'kb-plain'), S = byDef(P[2], 'kb-swim'); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(A.hp === 499 && S.hp === 500 && S.wait === 1, `a Swimmer is washed back but not hurt (${A.hp}, ${S.hp}, wait ${S.wait})`); }
{ const run = ()=>{ const {e, P} = mk({tideSpout:true}, 3); ['left','right','right'].forEach(s=> e.debugSpawnCard(P, so, 1, 'kb-plain', s, {}, [])); e.debugSpawnCard(P, so, 2, 'kb-plain', 'left', {}, []);
  const cols = []; for(let r = 2; r < 9; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); cols.push(ev.find(x=> x.field==='tideSpout').col); } return cols.join(); };
  const a = run(); ok(a === run() && new Set(a.split(',')).size > 1, `the spout's column is random but seeded (${a})`); }
// ---- Day and night: the map's, never a card's
{ const {e, P} = mk({phase:'day', field:'moon'}); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(e.getPhase() === 'day', `a Full Moon no longer makes it night (${e.getPhase()})`); ok(e.moonPhase() === 4, 'but the moon is full while it is up'); }
{ const {e, P} = mk({phase:'off', field:'moon'}); e.roundStart(P, 1, so, {}, []); ok(e.getPhase() === null, 'a map with no day or night stays so under a Full Moon'); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  const m = src.match(/const MAP_DAYNIGHT = (\{[\s\S]*?\n\});/); ok(!!m, 'MAP_DAYNIGHT is in the app');
  const table = m ? eval('(' + m[1] + ')') : {};
  ok(table.mtut === 'day' && table.m4 === 'off' && table.mg === 'off' && table.mj === 'off' && table.m8 === 'night' && table.mn === 'off' && table.mi === 'off' && !table.m1 && !table.mb, 'caves and the deep have no cycle, the tutorial stays Day, the open maps cycle');
  ok(/const TIDESPOUT_NODES = \{mb:'2-4'\}/.test(src), 'Pebble Beach spouts (2026-10-16: in one fight only, "Tide-spout should be one-off")');
  ok(!/r\.zeitgeber = true/.test(src), 'fightRules no longer lets a card start the cycle'); }

// ---- 3. Irradiation tokens
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-snipe', 'left', {}, []); const c = byDef(P[1], 'kb-snipe');
  let r = e.debugIrradiatePoint(c, 'snipe'); ok(e.effectsOf(c).snipe === 1 && r.what === 'value', `Snipe 2 -> Snipe 1 (${e.effectsOf(c).snipe})`);
  r = e.debugIrradiatePoint(c, 'snipe'); ok(!e.effectsOf(c).snipe && r.what === 'removed', 'Snipe 1 -> gone');
  r = e.debugIrradiatePoint(c, 'flying'); ok(e.effectsOf(c).flying === true && r.what === 'weakened', 'Flying: one point weakens it');
  r = e.debugIrradiatePoint(c, 'flying'); ok(!e.effectsOf(c).flying && r.what === 'removed', 'Flying: the second point takes it');
  ok(defs['kb-snipe'].effects.snipe === 2 && defs['kb-snipe'].effects.flying === true, 'the printed card is untouched');
  ok(c.irrSkills && c.irrSkills.snipe.from === 2 && c.irrSkills.snipe.to === null && c.irrSkills.flying.to === null, 'the unit keeps the tally for the card details');
  e.debugIrradiatePoint(c, 'atk'); e.debugIrradiatePoint(c, 'hp'); e.debugIrradiatePoint(c, 'hp');
  ok(c.atk === 2 && c.maxHp === 38 && c.irrAtk === 1 && c.irrHp === 2, `-1 Attack, -2 max Health, tallied (${c.atk}, ${c.maxHp})`); }
{ // a degraded skill really stops working: Armor 1 gone, the hit lands in full
  const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-arm1', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-hit', 'left', {}, []);
  const c = byDef(P[1], 'kb-arm1'), H0 = byDef(P[2], 'kb-hit');
  ok(dealt(e, P, H0.uid, c) === 4, 'Armor 1: a 5 hits for 4'); e.debugIrradiatePoint(c, 'armor'); ok(dealt(e, P, H0.uid, c) === 5, 'Armor gone: the 5 lands in full'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-trig', 'left', {}, []); const c = byDef(P[1], 'kb-trig'); const t = ()=> e.effectsOf(c).triggers;
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(t()[0].who === 'ally' && t()[0].sub === 'adjacent', 'all allies -> adjacent allies');
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(t()[0].who === 'self', 'adjacent allies -> itself');
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(t()[0].amount === 1, 'then its value: +2 -> +1');
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(t().length === 1 && t()[0].do === 'damage', 'at its base form, one more point removes it');
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(t()[0].sub === 'adjacent', 'a random enemy -> the one in front');
  e.debugIrradiatePoint(c, {key:'triggers', i:0}); ok(!t().length, 'an enemy-in-front damage 1 is already at its base form: gone'); }
{ // the weights: Health 3, Attack 2, each skill 1
  const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-weigh', 'left', {}, []); const c = byDef(P[1], 'kb-weigh'); c.irradiation = 3000;
  const ev = []; e.roundStart(P, 2, so, {}, ev); const pts = ev.find(x=> x.type==='irradiation').points; const n = k=> pts.filter(p=> p.kind===k).length;
  ok(pts.length === 3000 && Math.abs(n('hp') - 1500) < 120 && Math.abs(n('atk') - 1000) < 110 && Math.abs(n('skill') - 500) < 90, `Health ~3/6, Attack ~2/6, the one skill ~1/6 (${n('hp')}, ${n('atk')}, ${n('skill')})`);
  ok(c.irradiation === 2999, `then the tokens drop by 1 (${c.irradiation})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-irr', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'kb-immune', 'left', {}, []);
  e.roundStart(P, 2, so, {}, []); const I = byDef(P[2], 'kb-immune'); ok(!(I.irradiation > 0) && I.maxHp === 40, 'Immune to radiation: no tokens'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-weigh', 'left', {}, []); const c = byDef(P[1], 'kb-weigh'); c.irradiation = 1; e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []);
  ok(c.irradiation === 0 && (c.irrHp||0) + (c.irrAtk||0) + Object.keys(c.irrSkills||{}).length === 1, 'one token: one point, then it is spent'); }

// ---- 4. Ghost, Shade, Shadow
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-ghost', 'left', {}, []); const G = byDef(P[2], 'kb-ghost');
  e.debugSpawnCard(P, so, 1, 'kb-hit', 'left', {}, []); ok(dealt(e, P, byDef(P[1], 'kb-hit').uid, G) === 0, 'Ghost: a physical attack does nothing'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kb-fire', 'left', {}, []);
  ok(dealt(e, P, byDef(P[1], 'kb-fire').uid, byDef(P[2], 'kb-ghost')) === 2, 'Ghost: a fire attack of 5 deals half, rounded down (2)'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kb-wand', 'left', {}, []);
  ok(dealt(e, P, byDef(P[1], 'kb-wand').uid, byDef(P[2], 'kb-ghost')) === 5, 'Ghost: magic deals full'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-ghost', 'left', {}, []); const G = byDef(P[2], 'kb-ghost'); e.damageCardFlat(G, 1, 'poison'); ok(G.hp === 50, 'Ghost: a 1-point poison tick halves to nothing'); }
{ const s = (rules, att)=>{ const {e, P} = mk(rules); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 2, 'kb-shade', 'left', {}, []); e.debugSpawnCard(P, so, 1, att || 'kb-seer', 'left', {}, []); return dealt(e, P, byDef(P[1], att || 'kb-seer').uid, byDef(P[2], 'kb-shade')); };
  ok(s({phase:'day'}) === 5, 'Shade by day: full damage'); ok(s({phase:'night'}) === 2, 'Shade at night: half, rounded down');
  ok(s({phase:'day', dark:'dark'}) === 2, 'Shade in a dark cave: half'); ok(s({phase:'night'}, 'kb-seewand') === 5, 'Shade: magic is full even at night');
  const {e, P} = mk({phase:'night'}); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 2, 'kb-shade', 'left', {}, []); const S = byDef(P[2], 'kb-shade'); e.damageCardFlat(S, 4, 'heat'); ok(S.hp === 496, 'Shade: a field hazard (no attacker) is not halved'); }
{ const swings = (rules, att)=>{ const {e, P} = mk(rules, 11); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 2, 'kb-shadow', 'left', {}, []); e.debugSpawnCard(P, so, 1, att || 'kb-seer', 'left', {}, []);
    const A = byDef(P[1], att || 'kb-seer'), S = byDef(P[2], 'kb-shadow'); let hits = 0; for(let i = 0; i < 200; i++){ const hp = S.hp; e.debugAttack(P, so, A.uid, {}, []); if(S.hp < hp) hits++; } return hits; };
  const n = swings({phase:'night'}); ok(n > 70 && n < 130, `Shadow at night: about 1 in 2 attacks miss (${n}/200 land)`);
  ok(swings({phase:'day'}) === 200, 'Shadow by day: every attack lands'); ok(swings({phase:'night'}, 'kb-seewand') === 200, 'Shadow: magic never misses it');
  const d = swings({phase:'day', dark:'pitch'}); ok(d < 200, `Shadow in the dark grotto by day still hides (${d}/200)`); }

// ---- 5. Supreme
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-armor', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kb-sup', 'left', {}, []);
  const T = byDef(P[2], 'kb-armor'); const ev = []; const hp = T.hp; e.debugAttack(P, so, byDef(P[1], 'kb-sup').uid, {}, ev);
  ok(hp - T.hp === 10, `Supreme crushes Armor 3 and Scare 2: 10 lands in full (${hp - T.hp})`); ok(ev.some(x=> x.type==='hit' && x.dmgType==='magic'), 'its attack is magic'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'kb-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kb-sup', 'left', {}, []); const G = byDef(P[2], 'kb-ghost'); G.tempHp = 5;
  ok(dealt(e, P, byDef(P[1], 'kb-sup').uid, G) === 10, 'Supreme vs a Ghost with temporary Health: magic, and the shell is crushed'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-sup', 'left', {}, []); const S = byDef(P[1], 'kb-sup');
  e.debugSpawnCard(P, so, 2, 'kb-hit', 'left', {}, []); ok(dealt(e, P, byDef(P[2], 'kb-hit').uid, S) === 2, 'a Supreme beast takes half of a physical 5 (2)');
  const {e:e2, P:P2} = mk(); e2.debugSpawnCard(P2, so, 1, 'kb-sup', 'left', {}, []); e2.debugSpawnCard(P2, so, 2, 'kb-wand', 'left', {}, []);
  ok(dealt(e2, P2, byDef(P2[2], 'kb-wand').uid, byDef(P2[1], 'kb-sup')) === 5, 'magic hits it in full'); }
{ const castle = id=>{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, id, 'right', {}, []); e.debugSpawnCard(P, so, 2, 'kb-bulwark', 'left', {}, []);
    const hq = P[2].hq.hp; e.debugAttack(P, so, byDef(P[1], id).uid, {}, []); return hq - P[2].hq.hp; };
  ok(castle('kb-hit') === 2, `Bulwark 3 softens a 5 on the castle to 2 (${castle('kb-hit')})`); ok(castle('kb-sup') === 10, `Supreme crushes Bulwark (${castle('kb-sup')})`); }
{ const sup = Object.keys(base).filter(id=> base[id].effects && base[id].effects.supreme).sort();
  ok(sup.join() === 'black-dragon,blue-dragon,fathom-leviathan,green-dragon,red-dragon,white-dragon', `only the dragons and the Leviathan (rank 2, 2026-10-18) are Supreme (${sup})`); }

// ---- 6. Twin, Sprout and Growth
{ const {e, P} = mk(); const ev = []; e.debugSpawnCard(P, so, 1, 'kb-twin', 'left', {}, ev); const u = all(P[1]);
  ok(u.length === 2, `Twin: two of it on the board (${u.length})`); const tw = u.find(c=> c.isTwin), d = e.derivedDefs[tw && tw.defId];
  ok(tw && d && d.token && !d.effects.twin && d.effects.poison === 1 && tw.atk === 3 && tw.maxHp === 7 && tw.wait === 1, 'the twin is a token copy: same stats and skills, minus Twin');
  ok(ev.some(x=> x.type==='spawn' && x.kind==='twin' && x.nearUid === u.find(c=> !c.isTwin).uid), 'it jumps out of the original');
  ok(Math.abs(tw.slot - u.find(c=> !c.isTwin).slot) === 1, 'in the nearest free slot'); }
{ const pc = base['puddle-changeling'], mm = base['mirrorhide-mutant'];
  ok(pc && pc.effects.twin, 'Puddle Changeling has Twin');
  ok(mm && mm.rarity === 'rare' && mm.effects.twin, 'Mirrorhide Mutant: rare Twin (stats/art/placement have moved on since 10-14)'); }
{ const {e, P} = mk(); const ev = []; e.debugSpawnCard(P, so, 1, 'kb-sprout', 'left', {}, ev); const sp = all(P[1]).filter(c=> c.defId==='growth-sprout');
  // 2026-10-21 (BF5): the Growth Sprout token is halved with the rest (1/3 -> 1/2)
  ok(sp.length === 2 && sp.every(c=> c.atk === 1 && c.maxHp === 2), `Sprout 2: two 1/2 Growth Sprouts sprout beside it (${sp.length})`);
  ok(base['growth-sprout'] && base['growth-sprout'].token && base['growth-sprout'].effects.growth, 'Growth Sprout is a token with Growth'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kb-swarm', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kb-sprout', 'right', {}, []); e.debugSpawnCard(P, so, 2, 'kb-wall', 'left', {}, []);
  const S = byDef(P[1], 'kb-swarm'); ok(e.swarmBonusOf(P, S) === 2, `a Swarm Ant counts both Growth Sprouts but not the Bird (${e.swarmBonusOf(P, S)})`); }
console.log(fail ? `keywords-2026-10-14b: ${fail} failure(s)` : 'keywords-2026-10-14b: all passed');
process.exit(fail ? 1 : 0);
