#!/usr/bin/env node
// 2026-10-18 (engine parity, package R3-WP1). The audit's items:
//   R  kills by Arrow, Bolt, Volley, Twin Shot, Spitfire and Snipe (and the skills: missiles, Fireball, Tsunami ...) are credited
//      like a melee kill: the kill stat (MVP), Crown of Thorns, Midas, On Kill; never twice.
//   R  the CPU's pitch gives what the player's does (one engine pitchCard: yield, Lumberjack, Dark Points, Core Evil, On Discard).
//   E  the CPU sacrifices an expendable Sacrifice N unit for a Dark Summon card.
//   P  the CPU plays a field card only when it helps its own board more than yours; its slot choice reads the Tide-evade rule.
// 2026-10-18 (package D): a kill answered by Revive still fires On Kill (2026-10-19, package RV: and counts, a true death); the CPU levels (aiLevel 0 basic / 1 smart / 2 smartest)
//   and who gets which (arena_app.js cpuAiAutoLevel, Edit skirmish's Difficulty).
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
  // Revive (2026-10-18 revert) and the CPU levels (2026-10-18, package D)
  'pa-phoenix': U('pa-phoenix', {undead:true} /* 2026-10-26 (ENG9, owner #20): the self-return is Undead now (Revive is the graveyard action) */, {attack:0, health:2}),
  'pa-brute': U('pa-brute', {}, {attack:9, health:10}), 'pa-tough': U('pa-tough', {}, {attack:2, health:10}),
  'pa-glass': U('pa-glass', {}, {attack:3, health:4}), 'pa-ogre': U('pa-ogre', {}, {attack:30, health:30}),
  'pa-a': U('pa-a', {}, {attack:2, health:2}), 'pa-b': U('pa-b', {}, {attack:0, health:1, cost:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(o){ o = o || {}; const e = (o.E || E).makeSimEngine(defs, E.mulberry32(o.seed||7), {recordEvents: o.record !== false, battleMode: o.mode || 'open', rules: o.rules || undefined, tideEvade: o.tideEvade, aiLevel: o.level});
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
  ok(/aiSmart\(\) \? aiFieldWorth\(players, aiId, fieldCard\.defId\) > \(aiSmartest\(\) \? 0\.5 : 0\) : rnd\(\) < 0\.5/.test(eng), 'field cards: smart CPUs (aiAim fights) only, the sims and the basic CPU keep the coin flip'); }
// ---- P4. Slot choice: under the Tide-evade rule a non-swimmer avoids the swimmer it can't reliably hit
{ let toLand = 0, tries = 0;
  for(let s = 1; s <= 40; s++){ const {e, P} = mk({seed:s, rules:{tide:true, tideEvade:true}}); put(e, P, 2, 'pa-wall', 0);
    put(e, P, 1, 'pa-swim', -1); put(e, P, 1, 'pa-land', 1); e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []);
    if(e.getTide() === null) continue;
    P[2].hand = [{uid:9600 + s, defId:'pa-hitter'}]; P[2].lumber = 5;
    e.aiTakeTurn(P, so, 2, {}, []); const h = all(P[2]).find(c=> c.defId === 'pa-hitter'); if(!h) continue; tries++;
    if(h.slot === 1) toLand++; else if(h.slot === -1) toLand--; }
  ok(tries > 0 && toLand > 0, `Tide-evade: the CPU's non-swimmer goes across from the non-swimmer more often (net ${toLand} of ${tries})`); }

// ---- 2026-10-18 (owner, 10:33): "Kill answered by revive still triggers On Kill"; 2026-10-19 (package RV, owner 00:19: "Revive is
// true death"): the kill stat counts it too (the full rules are in tests/rv-2026-10-19.js)
{ const {e, P} = mk(); const S = put(e, P, 1, 'pa-sword', 0); const X = put(e, P, 2, 'pa-phoenix', 0); put(e, P, 2, 'pa-wall', 1);
  const stats = {}, l0 = P[1].lumber; e.debugAttack(P, so, S.uid, stats, []);
  ok(all(P[2]).includes(X) && X.hp === 1, 'Revive: the unit came back at 1 Health');
  ok(P[1].lumber - l0 === 2, `Revive: the killer's On Kill still fired (+${P[1].lumber - l0})`);
  ok(kills(stats, 'A', 'pa-sword') === 1, `Revive: a true death, so the kill stat counts it (${kills(stats, 'A', 'pa-sword')})`);
  e.debugAttack(P, so, S.uid, stats, []);
  ok(!all(P[2]).includes(X) && kills(stats, 'A', 'pa-sword') === 2 && P[1].lumber - l0 === 4, `Revive: the final death later is one more kill and one more On Kill (kills ${kills(stats, 'A', 'pa-sword')}, +${P[1].lumber - l0})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'pa-archer', 0); put(e, P, 2, 'pa-phoenix', 0); put(e, P, 2, 'pa-wall', 1);
  const stats = {}, l0 = P[1].lumber; e.debugAttack(P, so, A.uid, stats, []);
  ok(P[1].lumber - l0 === 2 && kills(stats, 'A', 'pa-archer') === 1, `Revive: a shot's kill a Revive answers fires On Kill and counts (+${P[1].lumber - l0}, kills ${kills(stats, 'A', 'pa-archer')})`); }

// ---- 2026-10-18 (package D): CPU levels. opts.aiLevel 0 basic / 1 smart (default) / 2 smartest, read only while aiAim is on.
{ const {e} = mk(); ok(e.getAiLevel() === 1, 'the default level is Smart (1)');
  const z = mk({level:0}).e, t = mk({level:2}).e; ok(z.getAiLevel() === 0 && t.getAiLevel() === 2, 'opts.aiLevel sets it');
  z.setAiLevel(5); ok(z.getAiLevel() === 2, 'setAiLevel clamps to 0..2'); }
// Level 0 = the CPU before 2026-10-18: the same choices as the engine of commit d28acb3 (the one before R3-WP1), on fixed seeds.
// Plain cards only (no Sacrifice, no pitch yields), so the rules R3-WP1 changed for everyone don't enter it.
{ let OldE = null;
  try{ const cp = require('child_process'), os = require('os');
    const src = cp.execFileSync('git', ['show', 'd28acb3:bramblewood-engine.js'], {cwd: path.join(__dirname, '..'), stdio:['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20}).toString();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-oldengine-')), f = path.join(dir, 'engine-d28acb3.js'); fs.writeFileSync(f, src); OldE = require(f); }catch(err){ OldE = null; }
  if(!OldE) console.log('  (skipped: the level-0 vs pre-change comparison needs git history, commit d28acb3)');
  else {
    const pool = ['pa-hitter', 'pa-brute', 'pa-tough', 'pa-glass', 'pa-a', 'pa-b', 'pa-frail', 'pa-swim', 'pa-land', 'spring-rain', 'thick-fog'];
    const rulesets = [undefined, {tide:true, tideEvade:true}, {dark:'pitch'}];
    let same = 0, total = 0, smartDiff = 0, shown = 0;
    const run = (Eng, level, seed, rs)=>{ const r = E.mulberry32(1000 + seed), pick = arr=> arr[Math.floor(r() * arr.length)];
      const {e, P} = mk({E: Eng, seed, level, rules: rs});
      put(e, P, 2, 'pa-wall', 0); if(r() < 0.5) put(e, P, 2, pick(pool.slice(0, 8)), 1);
      [-1, 0, 1, 2].forEach(sl=>{ if(r() < 0.6) put(e, P, 1, pick(pool.slice(0, 8)), sl); });
      P[2].hand = [0, 1, 2].map(i=> ({uid: 9700 + i, defId: pick(pool)})); P[2].lumber = Math.floor(r() * 3);
      if(rs && rs.tide){ e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); }
      e.aiTakeTurn(P, so, 2, {}, []);
      const f = e.getField();
      return JSON.stringify({b: all(P[2]).map(c=> c.defId + '@' + c.slot).sort(), h: P[2].hand.map(h=> h.defId), l: P[2].lumber, g: P[2].graveyard.map(g=> g.defId), f: f ? f.id : null}); };
    for(let seed = 1; seed <= 60; seed++) rulesets.forEach(rs=>{ total++; const a = run(OldE, 0, seed, rs), b = run(E, 0, seed, rs);
      if(a === b) same++; else if(shown++ < 3) console.log('    level 0 vs pre-change:', a, '\n                           ', b);
      if(run(E, 1, seed, rs) !== b) smartDiff++; });
    // EN2 (2026-10-23, owner 13:16 #2 / #11): the basic CPU's "anywhere legal" slot is weighted to the middle and contested lanes now
    // (aiLanePick), so a few fixed seeds pick another slot (174 of 180 the same at EN2); the rest of its play is the pre-change CPU's.
    ok(same >= total * 0.9, `level 0 makes the pre-change CPU's choices on fixed seeds, bar EN2's lane weights (${same} of ${total} the same)`);
    ok(smartDiff > 0, `level 1 (smart) differs from level 0 somewhere on the same seeds (${smartDiff} of ${total})`);
  }
}
// Field cards: basic keeps the coin flip (so it may play one that helps you), smart never does
{ let basicPlayed = 0, smartPlayed = 0;
  for(let s = 1; s <= 30; s++){ [0, 1].forEach(level=>{ const {e, P} = mk({seed:s, level}); put(e, P, 2, 'pa-hitter', 0); const b = put(e, P, 1, 'pa-hitter', 0);
    b.hp = b.maxHp - 4; P[2].hand = [{uid:9800 + s, defId:'spring-rain'}]; e.aiTakeTurn(P, so, 2, {}, []); const f = e.getField();
    if(f && f.id === 'rain'){ if(level === 0) basicPlayed++; else smartPlayed++; } }); }
  ok(basicPlayed > 0 && smartPlayed === 0, `field card: basic keeps the coin flip (${basicPlayed} of 30), smart holds a field that helps you (${smartPlayed})`); }
// Smartest: a barely-useful field (Thick Fog worth 1/3) waits in hand; smart plays it
{ const fogRun = level=>{ const {e, P} = mk({level}); put(e, P, 2, 'pa-land', 0); const f = put(e, P, 1, 'pa-hitter', 0); f.atk = 2; P[2].hand = [{uid:9850, defId:'thick-fog'}];
    e.aiTakeTurn(P, so, 2, {}, []); const fl = e.getField(); return !!(fl && fl.id === 'fog'); };
  ok(fogRun(1) === true && fogRun(2) === false, `field card: smart plays a barely-useful Thick Fog, smartest keeps it for its moment (smart ${fogRun(1)}, smartest ${fogRun(2)})`); }
// Smartest slot: never walks into a unit that kills it outright when an equal slot is free; smart sometimes does (its dice)
{ let smartBad = 0, smartestBad = 0;
  for(let s = 1; s <= 40; s++) [1, 2].forEach(level=>{ const {e, P} = mk({seed:s, level}); put(e, P, 2, 'pa-wall', 0); put(e, P, 1, 'pa-brute', -1); put(e, P, 1, 'pa-tough', 1);
    P[2].hand = [{uid:9900 + s, defId:'pa-hitter'}]; e.aiTakeTurn(P, so, 2, {}, []); const h = all(P[2]).find(c=> c.defId === 'pa-hitter');
    if(h && h.slot === -1){ if(level === 1) smartBad++; else smartestBad++; } });
  ok(smartestBad === 0, `smartest: never across from the unit that kills it outright (${smartestBad} of 40)`);
  ok(smartBad > 0, `smart: its dice still put it there sometimes (${smartBad} of 40), so the levels differ here`); }
// Smartest slot reads Confuse (2026-10-19, package FZ): a Confused unit's swing fumbles 1 in 2, so of two units that would kill it,
// the CPU faces the Confused one (either side), and a Confused killer is no sure doom (the engine's aiSwingOdds, the same for both sides)
{ const confRun = confSlot=>{ const {e, P} = mk({level:2}); put(e, P, 2, 'pa-wall', 0); const L = put(e, P, 1, 'pa-brute', -1), R = put(e, P, 1, 'pa-brute', 1);
    (confSlot < 0 ? L : R).confused = 2; P[2].hand = [{uid:9958, defId:'pa-hitter'}]; e.aiTakeTurn(P, so, 2, {}, []); const h = all(P[2]).find(c=> c.defId === 'pa-hitter'); return h ? h.slot : null; };
  ok(confRun(1) === 1 && confRun(-1) === -1, `smartest: of two killers it faces the Confused one (right ${confRun(1)}, left ${confRun(-1)})`); }
// Smartest focus: of two units it can kill now, it takes the better one (and blocks the bigger hit)
{ let good = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk({seed:s, level:2}); put(e, P, 2, 'pa-wall', 0); put(e, P, 1, 'pa-frail', -1); put(e, P, 1, 'pa-glass', 1);
    P[2].hand = [{uid:9950 + s, defId:'pa-hitter'}]; e.aiTakeTurn(P, so, 2, {}, []); const h = all(P[2]).find(c=> c.defId === 'pa-hitter'); if(h && h.slot === 1) good++; }
  ok(good === 20, `smartest: focuses the better kill this round (${good} of 20)`); }
// Smartest pitch: the least useful card, not the weakest (a field card is kept for its moment)
{ const pitchRun = level=>{ const {e, P} = mk({level}); put(e, P, 2, 'pa-wall', 0); P[2].lumber = 1; P[2].playedThisTurn = true;
    P[2].hand = [{uid:9961, defId:'thick-fog'}, {uid:9962, defId:'pa-a'}, {uid:9963, defId:'pa-b'}];
    e.aiTakeTurn(P, so, 2, {}, []); return P[2].graveyard.map(g=> g.defId).join(','); };
  ok(pitchRun(1) === 'thick-fog' && pitchRun(2) === 'pa-b', `pitch: smart pitches the weakest (${pitchRun(1)}), smartest keeps the field card and pitches the least useful (${pitchRun(2)})`); }
// Smartest Sacrifice timing: a strong unit that dies to what faces it this round is given up for the Dark Summon card
{ const sacRun = level=>{ const {e, P} = mk({level}); const C = put(e, P, 2, 'pa-champ', 0); put(e, P, 1, 'pa-ogre', 0); P[2].hand = [{uid:9971, defId:'pa-dark'}]; P[2].devilry = 2; P[2].lumber = 0;
    const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); return ev.some(x=> x.type === 'sacrifice' && x.uid === C.uid); };
  ok(sacRun(1) === false && sacRun(2) === true, `Sacrifice: smart keeps a doomed strong unit (${sacRun(1)}), smartest spends it before it is lost (${sacRun(2)})`); }
// The sims (aiAim off) ignore the level
{ const simRun = level=>{ const o = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:false, battleMode:'open', aiLevel: level}); const P = {1:o.newPlayer(1, {}), 2:o.newPlayer(2, {})};
    put(o, P, 2, 'pa-wall', 0); put(o, P, 1, 'pa-brute', -1); put(o, P, 1, 'pa-tough', 1); P[2].hand = [{uid:9981, defId:'pa-hitter'}, {uid:9982, defId:'spring-rain'}];
    o.aiTakeTurn(P, so, 2, {}, null); const f = o.getField(); return JSON.stringify([all(P[2]).map(c=> c.defId + '@' + c.slot), f && f.id]); };
  ok(simRun(0) === simRun(2) && simRun(1) === simRun(2), 'silent sims (aiAim off): the level changes nothing'); }

// ---- 2026-10-18 (package D): who gets which level (arena_app.js), and the Edit skirmish field
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  const i = src.indexOf('const CPU_AI_KEYS'), j = src.indexOf('function cpuAiPillHTML');
  ok(i > 0 && j > i, 'arena_app.js has the CPU level rule block');
  const mapNo = {m1:0, m4:4, m5:5, m20:20, m21:21, m40:40, side5:5};
  const AIMAX = require('../bramblewood-engine.js').AI_LEVEL_MAX;
  const R = new Function('mapNumberOf', 'AI_LEVEL_MAX', src.slice(i, j) + '; return {cpuAiAutoLevel, cpuAiLevelForNode, cpuAiLevelOfMatch};')(id=> id in mapNo ? mapNo[id] : null, AIMAX);
  const L = (m, kind, extra)=> R.cpuAiLevelForNode(m, Object.assign({kind}, extra || {}));
  ok(['skirmish', 'elite', 'boss', 'miniboss'].every(k=> L('m1', k) === 0 && L('m4', k) === 0), 'Maps 0–4: basic in every fight');
  ok(L('m5', 'skirmish') === 0 && L('m20', 'skirmish') === 0, 'Map 5+: ordinary skirmishes stay basic');
  ok(['elite', 'champion', 'miniboss', 'subboss', 'boss', 'finalboss', 'worldboss', 'dungeon'].every(k=> L('m5', k) === 1 && L('m20', k) === 1), 'Map 5+: elite missions and bosses get the smart CPU');
  ok(['skirmish', 'elite', 'boss'].every(k=> L('m21', k) === 2 && L('m40', k) === 2), 'Map 21+: the smartest CPU everywhere');
  ok(L('side5', 'elite') === 1 && L('side5', 'skirmish') === 0, 'a side map follows its parent map number');
  ok(AIMAX === 2 && [1, 24, 25, 60].every(fl=> L('tw', 'elite', {tower:true, floor:fl}) === AIMAX && L('tw', 'boss', {tower:true, floor:fl}) === AIMAX), 'the Babel Spire: the highest CPU level (AI_LEVEL_MAX) on every floor (2026-10-18, owner 15:05)');
  ok(L('tw', 'boss', {tower:true, floor:30, ai:'smartest'}) === 2 && L('tw', 'elite', {tower:true, floor:3, ai:'basic'}) === 0, "the Babel Spire: Edit skirmish's pick still overrides it");
  ok(L('m40', 'boss', {ai:'basic'}) === 0 && L('m1', 'skirmish', {ai:'smartest'}) === 2 && L('m5', 'skirmish', {ai:'smart'}) === 1, "Edit skirmish's pick (node.ai) overrides Auto");
  ok(R.cpuAiLevelOfMatch({mode:'tutorial'}) === 0 && R.cpuAiLevelOfMatch({mode:'ai'}) === 1 && R.cpuAiLevelOfMatch({mode:'conquest', aiLevel:2}) === 2, 'matches: the tutorial basic, others smart unless the fight set a level');
  ok(/<select id="seAi">/.test(src) && /'loopUnits','ai'\]\.forEach\(\(k,i\)=>\{ const val = v\(\[[^\]]*'seAi'\]\[i\]\)/.test(src), 'Edit skirmish: a Difficulty select (seAi) read into node.ai');
  // 2026-10-21 (package TT): package ED added 'enemyLevel' after 'ai' in the cleared-fields list
  ok(/'rating','leaderGrant','ai','enemyLevel'(,'\w+')*\]\.forEach/.test(src) /* 2026-10-23 (TU2): + 'tutHp' after it */ && /ai:'CPU difficulty'/.test(src), 'Edit skirmish: clearing Difficulty back to Auto is saved and listed like the other fields');
  ok(/const aiLevel = cpuAiLevelForNode\(mapId, node\);/.test(src) && /rules: fightRules\(mapId, node\), aiLevel\}/.test(src), "startConquestMatch gives the engine the fight's level");
  // 2026-10-21 (package TT): package ED put 'matchUid' first in RESUME_FIELDS; 'aiLevel' is still saved
  ok(/m\.engine\.setAiLevel\(cpuAiLevelOfMatch\(m\)\)/.test(src) && /const RESUME_FIELDS = \['matchUid' \/\*[^*]*\*\/, 'aiLevel',/.test(src), "the CPU's turn applies the match's level (a resumed fight too)");
  ok(/cpuAiPillHTML\(lv\)/.test(src), 'the VS opener shows the CPU difficulty pill'); }

console.log(fail ? `engine-parity-2026-10-18: ${fail} of ${n} FAILED` : `engine-parity-2026-10-18: all ${n} passed`);
process.exit(fail ? 1 : 0);
