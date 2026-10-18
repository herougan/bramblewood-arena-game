#!/usr/bin/env node
// 2026-10-18 (engine parity, package R3-WP1). The audit's items:
//   R  kills by Arrow, Bolt, Volley, Twin Shot, Spitfire and Snipe (and the skills: missiles, Fireball, Tsunami ...) are credited
//      like a melee kill: the kill stat (MVP), Crown of Thorns, Midas, On Kill; never twice.
//   R  the CPU's pitch gives what the player's does (one engine pitchCard: yield, Lumberjack, Dark Points, Core Evil, On Discard).
//   E  the CPU sacrifices an expendable Sacrifice N unit for a Dark Summon card.
//   P  the CPU plays a field card only when it helps its own board more than yours; its slot choice reads the Tide-evade rule.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const onKillLumber = {on:'onKill', do:'gainLumber', amount:2};
const defs = Object.assign({}, base, {
  'pa-wall': U('pa-wall', {}, {attack:0}), 'pa-frail': U('pa-frail', {}, {attack:0, health:2}),
  'pa-archer': U('pa-archer', {arrow:3, triggers:[onKillLumber]}, {attack:0}),
  'pa-bolt': U('pa-bolt', {fireBolt:3, triggers:[onKillLumber]}, {attack:0}),
  'pa-sniper': U('pa-sniper', {snipe:3, triggers:[onKillLumber]}, {attack:0}),
  'pa-volley': U('pa-volley', {volley:3}, {attack:0}), 'pa-twin': U('pa-twin', {twinShot:3}, {attack:0}), 'pa-spit': U('pa-spit', {spitfire:3}, {attack:0}),
  'pa-midas': U('pa-midas', {arrow:3, midas:3}, {attack:0}),
  'pa-sword': U('pa-sword', {triggers:[onKillLumber]}, {attack:5}),
  'pa-tsu': U('pa-tsu', {tsunami:5}, {attack:0}),
  // the pitch
  'pa-jack': U('pa-jack', {lumberjack:true}, {attack:0}),
  'pa-imp': U('pa-imp', {coreEvil:true, triggers:[{on:'onDiscard', do:'gainGrace', amount:2}]}, {attack:0, health:1, cost:5, mechanicLine:'devilry'}),
  'pa-big': U('pa-big', {}, {attack:9, health:9, cost:5}),
  'pa-stone': U('pa-stone', {}, {attack:0, health:1, cost:5, pitchYield:{resource:'stone', amount:2}}),
  // the sacrifice
  'pa-fodder': U('pa-fodder', {sacrifice:2}, {attack:1, health:1, token:true}),
  'pa-champ': U('pa-champ', {sacrifice:2}, {attack:8, health:20}),
  'pa-dark': U('pa-dark', {}, {attack:4, health:4, devilryCost:2, darkSummon:true}),
  // the slot choice
  'pa-swim': U('pa-swim', {swimmer:true}, {attack:1, health:3}), 'pa-land': U('pa-land', {}, {attack:1, health:3}),
  'pa-hitter': U('pa-hitter', {}, {attack:4, health:6}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(o){ o = o || {}; const e = E.makeSimEngine(defs, E.mulberry32(o.seed||7), {recordEvents: o.record !== false, battleMode: o.mode || 'open', rules: o.rules || undefined, tideEvade: o.tideEvade});
  return {e, P:{1:e.newPlayer(1, o.deck1 || {}), 2:e.newPlayer(2, o.deck2 || {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const kills = (stats, side, id)=> (stats[side + '|' + id] || {}).kills || 0;

// ---- R1. A shot's kill is credited: the kill stat, On Kill (once), Midas, Crown of Thorns
[['pa-archer', 'Arrow'], ['pa-bolt', 'Fire Bolt']].forEach(([id, what])=>{
  const {e, P} = mk(); const A = put(e, P, 1, id, 0); const F = put(e, P, 2, 'pa-frail', 0); put(e, P, 2, 'pa-wall', 1);
  const stats = {}, ev = [], l0 = P[1].lumber;
  e.debugAttack(P, so, A.uid, stats, ev);
  ok(!all(P[2]).includes(F), `${what}: the shot killed the frail unit`);
  ok(kills(stats, 'A', id) === 1, `${what}: the kill is counted for the shooter (${kills(stats, 'A', id)})`);
  ok(P[1].lumber - l0 === 2, `${what}: On Kill fired exactly once (+2 Lumber, got +${P[1].lumber - l0})`);
});
{ // Snipe: nothing facing it, so it shoots a random enemy
  const {e, P} = mk(); const A = put(e, P, 1, 'pa-sniper', 0); const F = put(e, P, 2, 'pa-frail', 1);
  const stats = {}, l0 = P[1].lumber; e.debugAttack(P, so, A.uid, stats, []);
  ok(!all(P[2]).includes(F) && kills(stats, 'A', 'pa-sniper') === 1, `Snipe: the kill is counted (${kills(stats, 'A', 'pa-sniper')})`);
  ok(P[1].lumber - l0 === 2, `Snipe: On Kill fired once (+${P[1].lumber - l0})`);
}
['pa-volley', 'pa-twin', 'pa-spit'].forEach(id=>{
  const {e, P} = mk(); const A = put(e, P, 1, id, 0); put(e, P, 2, 'pa-frail', 0);
  const stats = {}; e.debugAttack(P, so, A.uid, stats, []);
  ok(kills(stats, 'A', id) === 1, `${id}: the kill is counted (${kills(stats, 'A', id)})`);
});
{ const {e, P} = mk(); const A = put(e, P, 1, 'pa-midas', 0); put(e, P, 2, 'pa-frail', 0);
  const l0 = P[1].lumber; e.debugAttack(P, so, A.uid, {}, []);
  ok(P[1].lumber - l0 === 3, `Midas Touch pays for a shot's kill (+${P[1].lumber - l0})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'pa-archer', 0); put(e, P, 2, 'pa-frail', 0); P[1].perks = {crown:true};
  const a0 = A.atk; e.debugAttack(P, so, A.uid, {}, []);
  ok(A.atk === a0 + 1, `Crown of Thorns: the shooter gains +1 Attack (${a0} -> ${A.atk})`); }
{ // the whole round (the Speed 1 shot action), not only debugAttack
  const {e, P} = mk(); put(e, P, 1, 'pa-archer', 0); put(e, P, 2, 'pa-frail', 0); put(e, P, 2, 'pa-wall', 1);
  const stats = {}, l0 = P[1].lumber; e.resolveCombat(P, so, stats, [], 1);
  ok(kills(stats, 'A', 'pa-archer') === 1 && P[1].lumber - l0 === 2, `a round's shot action credits the kill and fires On Kill once (kills ${kills(stats, 'A', 'pa-archer')}, +${P[1].lumber - l0})`); }
{ // melee is unchanged: one kill, one On Kill
  const {e, P} = mk(); const S = put(e, P, 1, 'pa-sword', 0); put(e, P, 2, 'pa-frail', 0);
  const stats = {}, l0 = P[1].lumber; e.debugAttack(P, so, S.uid, stats, []);
  ok(kills(stats, 'A', 'pa-sword') === 1 && P[1].lumber - l0 === 2, `melee: still one kill and one On Kill (kills ${kills(stats, 'A', 'pa-sword')}, +${P[1].lumber - l0})`); }
{ // a skill on arrival (Tsunami) credits its kill too
  const {e, P} = mk(); put(e, P, 1, 'pa-wall', 0); put(e, P, 2, 'pa-frail', 0);
  const stats = {}; e.debugSpawnCard(P, so, 1, 'pa-tsu', 1, stats, []);
  ok(kills(stats, 'A', 'pa-tsu') === 1, `Tsunami: its kill is counted (${kills(stats, 'A', 'pa-tsu')})`); }
{ // a death with no killer (poison) is nobody's kill
  const {e, P} = mk(); put(e, P, 1, 'pa-wall', 0); const F = put(e, P, 2, 'pa-frail', 0); F.poison = 5;
  const stats = {}; e.resolveCombat(P, so, stats, [], 1);
  ok(!all(P[2]).includes(F) && kills(stats, 'A', 'pa-wall') === 0, 'poison: the dead unit is nobody\'s kill'); }

// ---- R2. The CPU's pitch = the player's (pitchCard)
function pitchSetup(){ const o = mk(); put(o.e, o.P, 2, 'pa-jack', 0); put(o.e, o.P, 1, 'pa-jack', 0); [1, 2].forEach(pid=>{ o.P[pid].lumber = 0; o.P[pid].grace = 0; o.P[pid].devilry = 0; o.P[pid].stone = 0; o.P[pid].hand = []; }); return o; }
{ const {e, P} = pitchSetup();
  P[2].hand.push({uid:9001, defId:'pa-imp'}, {uid:9002, defId:'pa-big'});
  P[1].hand.push({uid:9003, defId:'pa-imp'});
  const r = e.pitchCard(P, so, 1, P[1].hand[0], {}, []);
  const ev = []; e.aiTakeTurn(P, so, 2, {}, ev);
  ok(r && P[1].lumber === 2 && P[1].devilry === 2 && P[1].grace === 2, `the player's pitch: 1 + Lumberjack, Devilry line + Core Evil, On Discard Grace (L${P[1].lumber} D${P[1].devilry} G${P[1].grace})`);
  ok(P[2].graveyard.some(g=> g.defId === 'pa-imp') && !P[2].hand.some(h=> h.defId === 'pa-imp'), 'the CPU pitched its weakest card');
  ok(P[2].lumber === P[1].lumber && P[2].devilry === P[1].devilry && P[2].grace === P[1].grace, `the CPU's pitch gives the same (CPU L${P[2].lumber} D${P[2].devilry} G${P[2].grace})`);
  ok(P[2].discardUsedThisTurn === true, 'the CPU\'s pitch uses its pitch for the turn');
  const d = ev.find(x=> x.type === 'discard'); ok(d && d.resource === 'lumber' && d.amount === 1, 'the CPU\'s discard event says what it gave');
}
{ const {e, P} = pitchSetup(); P[2].hand.push({uid:9101, defId:'pa-stone'}, {uid:9102, defId:'pa-big'});
  e.aiTakeTurn(P, so, 2, {}, []);
  ok(P[2].stone === 2 && P[2].lumber === 0, `the CPU's pitch reads the card's pitch yield (Stone ${P[2].stone}, Lumber ${P[2].lumber})`); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  const i = src.indexOf('async function discardCardByUid('), body = src.slice(i, i + 6000);
  ok(i > 0 && /m\.engine\.pitchCard\(/.test(body), "the player's discardCardByUid uses the engine's pitchCard");
  ok(!/me\.devilry = \(me\.devilry\|\|0\) \+ darkPointBonus/.test(body), "discardCardByUid no longer applies the Dark Points itself"); }

// ---- E3. The CPU sacrifices an expendable unit for a Dark Summon card
{ const {e, P} = mk(); const F = put(e, P, 2, 'pa-fodder', 0); P[2].hand = [{uid:9201, defId:'pa-dark'}]; P[2].devilry = 0; P[2].lumber = 0;
  const ev = []; e.aiTakeTurn(P, so, 2, {}, ev);
  ok(ev.some(x=> x.type === 'sacrifice' && x.uid === F.uid), 'the CPU sacrificed the token for the Dark Summon card');
  ok(all(P[2]).some(c=> c.defId === 'pa-dark') && !all(P[2]).includes(F), 'the Dark Summon card took its place'); }
{ const {e, P} = mk(); const C = put(e, P, 2, 'pa-champ', 0); P[2].hand = [{uid:9301, defId:'pa-dark'}]; P[2].devilry = 2; P[2].lumber = 0;
  const ev = []; e.aiTakeTurn(P, so, 2, {}, ev);
  ok(!ev.some(x=> x.type === 'sacrifice') && all(P[2]).includes(C) && all(P[2]).some(c=> c.defId === 'pa-dark'), 'with the Darkness to pay, the CPU keeps a strong unit and casts the card normally'); }
{ // the same seed, the same choice
  const run = ()=>{ const {e, P} = mk({seed:11}); put(e, P, 2, 'pa-fodder', 0); put(e, P, 2, 'pa-fodder', 1); P[2].hand = [{uid:9401, defId:'pa-dark'}]; P[2].devilry = 0;
    const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); const s = ev.find(x=> x.type === 'sacrifice'); return s ? s.uid : null; };
  ok(run() != null && run() === run(), 'the sacrifice pick is deterministic'); }

// ---- P4. Field cards: only when they help the CPU's board more than yours
function fieldRun(myHurt, foeHurt){ const {e, P} = mk(); const a = put(e, P, 2, 'pa-hitter', 0), b = put(e, P, 1, 'pa-hitter', 0);
  a.hp = a.maxHp - myHurt; b.hp = b.maxHp - foeHurt; P[2].hand = [{uid:9501, defId:'spring-rain'}];
  e.aiTakeTurn(P, so, 2, {}, []); const f = e.getField(); return !!(f && f.id === 'rain'); }
ok(fieldRun(4, 0) === true, 'Spring Rain: the CPU plays it when its units are the hurt ones');
ok(fieldRun(0, 4) === false, 'Spring Rain: the CPU holds it when it would heal your units more');
{ // the silent sims keep the old coin flip (no change to their numbers)
  const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
  ok(/aiAim \? aiFieldWorth\(players, aiId, fieldCard\.defId\) > 0 : rnd\(\) < 0\.5/.test(eng), 'field cards: aiAim fights only, sims keep the coin flip'); }
// ---- P4. Slot choice: under the Tide-evade rule a non-swimmer avoids the swimmer it can't reliably hit
{ let toLand = 0, tries = 0;
  for(let s = 1; s <= 40; s++){ const {e, P} = mk({seed:s, rules:{tide:true, tideEvade:true}}); put(e, P, 2, 'pa-wall', 0);
    put(e, P, 1, 'pa-swim', -1); put(e, P, 1, 'pa-land', 1); e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []);
    if(e.getTide() === null) continue;
    P[2].hand = [{uid:9600 + s, defId:'pa-hitter'}]; P[2].lumber = 5;
    e.aiTakeTurn(P, so, 2, {}, []); const h = all(P[2]).find(c=> c.defId === 'pa-hitter'); if(!h) continue; tries++;
    if(h.slot === 1) toLand++; else if(h.slot === -1) toLand--; }
  ok(tries > 0 && toLand > 0, `Tide-evade: the CPU's non-swimmer goes across from the non-swimmer more often (net ${toLand} of ${tries})`); }

console.log(fail ? `engine-parity-2026-10-18: ${fail} of ${n} FAILED` : `engine-parity-2026-10-18: all ${n} passed`);
process.exit(fail ? 1 : 0);
