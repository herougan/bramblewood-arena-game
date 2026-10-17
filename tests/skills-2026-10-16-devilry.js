#!/usr/bin/env node
// 2026-10-16 (skills). The user's notes:
//   2. "Devilry 2 skills: hurting your own castle on play as payment. Also, hurting a random ally on play as payment. Not sure of the
//      name. Penance?"  -> Penance N (your castle) and Blood Tithe N (a random ally; your castle if there is none).
//   9. "Ambush: I think the effect should be - when opposing card played, deal N damage to it. (instead of the Crit)"
//  10. "Expose - could be a skill to put Expose counters on the enemy. Everytime it is hit again, that hit is guaranteed a crit, but
//      the counters decrease by 1."
//  24. "Perma-tide's effect should say "Always Flooded""
//  28. "A creature under a status effect should have status effect explanations below the card description"
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'dv-wall': U('dv-wall', {}, {attack:0}), 'dv-hit': U('dv-hit'), 'dv-frail': U('dv-frail', {}, {attack:0, health:2}),
  'dv-pen': U('dv-pen', {penance:true}, {attack:0}), 'dv-pen5': U('dv-pen5', {penance:5}, {attack:0}),
  'dv-tithe': U('dv-tithe', {bloodTithe:true}, {attack:0}), 'dv-tithe4': U('dv-tithe4', {bloodTithe:4}, {attack:0}),
  'dv-amb': U('dv-amb', {ambush:true}, {attack:0}), 'dv-amb5': U('dv-amb5', {ambush:5}, {attack:0, wait:3}), 'dv-amb-att': U('dv-amb-att', {ambush:true}),
  'dv-expose': U('dv-expose', {expose:2}), 'dv-crit': U('dv-crit', {crit:true}), 'dv-armor': U('dv-armor', {armor:2}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
// Played the real way (debugSpawnCard runs every on-play effect); the newest card on that side is returned.
function play(e, P, pid, id, side, ev){ e.debugSpawnCard(P, so, pid, id, side == null ? 'left' : side, {}, ev || []); return all(P[pid]).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }

// ---- 2a. Penance N: your castle pays on play
{ const {e, P} = mk(); const hp0 = P[1].hq.hp; const ev = []; play(e, P, 1, 'dv-pen', 0, ev);
  ok(P[1].hq.hp === hp0 - 3, `Penance (saved as true) = Penance 3: your castle loses 3 (${hp0} -> ${P[1].hq.hp})`);
  ok(P[2].hq.hp === P[2].hq.maxHp, 'the enemy castle is untouched');
  const pe = ev.find(x=> x.type === 'penance'); ok(pe && pe.amount === 3 && pe.dmg === 3 && pe.side === 'A', `a penance event with what was paid (${JSON.stringify(pe)})`); }
{ const {e, P} = mk(); const hp0 = P[1].hq.hp; play(e, P, 1, 'dv-pen5', 0); ok(P[1].hq.hp === hp0 - 5, `Penance 5 takes 5 (${P[1].hq.hp})`); }
{ const {e, P} = mk(); P[1].hq.hp = 2; const ev = []; play(e, P, 1, 'dv-pen5', 0, ev);
  ok(P[1].hq.hp === 1 && ev.find(x=> x.type === 'penance').dmg === 1, `a payment never takes the castle below 1 (${P[1].hq.hp})`); }
{ const {e, P} = mk(); P[1].hq.shield = 10; const hp0 = P[1].hq.hp; play(e, P, 1, 'dv-pen', 0);
  ok(P[1].hq.hp === hp0 - 3 && P[1].hq.shield === 10, `the castle's Shield doesn't soak a payment (${P[1].hq.hp}, shield ${P[1].hq.shield})`); }

// ---- 2b. Blood Tithe N: a random ally pays; no ally: the castle
{ const {e, P} = mk(); const A = put(e, P, 1, 'dv-wall', -1); const hp0 = P[1].hq.hp; const ev = []; const T = play(e, P, 1, 'dv-tithe', 'right', ev);
  ok(A.hp === 498 && T.hp === 500 && P[1].hq.hp === hp0, `Blood Tithe (true) = 2: the only ally takes 2, not itself, not the castle (${A.hp}, ${T.hp})`);
  const be = ev.find(x=> x.type === 'bloodTithe'); ok(be && be.targetUid === A.uid && be.dmg === 2 && !be.castle, 'a bloodTithe event names the ally'); }
{ const {e, P} = mk(); const hp0 = P[1].hq.hp; const ev = []; play(e, P, 1, 'dv-tithe4', 0, ev);
  ok(P[1].hq.hp === hp0 - 4 && ev.some(x=> x.type === 'bloodTithe' && x.castle && x.dmg === 4), `no ally: your castle pays the 4 (${P[1].hq.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'dv-armor', -1); play(e, P, 1, 'dv-tithe4', 'right'); ok(A.hp === 496, `Armor doesn't stop a payment (${A.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'dv-frail', -1); const ev = []; play(e, P, 1, 'dv-tithe', 'right', ev);
  ok(!all(P[1]).some(c=> c.uid === A.uid && c.hp > 0) && (P[1].graveyard || []).length >= 0, 'an ally the Tithe kills perishes'); }
{ let seen = new Set(); for(let s = 1; s <= 20; s++){ const {e, P} = mk(null, s); const a = put(e, P, 1, 'dv-wall', -1), b = put(e, P, 1, 'dv-wall', 1); play(e, P, 1, 'dv-tithe', 'left');
    if(a.hp < 500) seen.add('a'); if(b.hp < 500) seen.add('b'); }
  ok(seen.size === 2, `the ally is random (${[...seen]})`); }

// ---- 9. Ambush N: an enemy card played into the slot facing it is struck as it arrives
{ const {e, P} = mk(); const A = play(e, P, 1, 'dv-amb', 0); const ev = []; const C = play(e, P, 2, 'dv-wall', 0, ev);
  ok(A.slot === 0 && C.slot === 0, `set-up: they face each other (${A.slot}, ${C.slot})`);
  ok(C.hp === 497, `Ambush (saved as true) = Ambush 3: the card played facing it takes 3 (${C.hp})`);
  const ae = ev.find(x=> x.type === 'ambush'), he = ev.find(x=> x.type === 'hit' && x.attUid === A.uid);
  ok(ae && ae.targetUid === C.uid && ae.amount === 3, 'an ambush event names its target');
  ok(he && he.ambush === true && he.ranged === false && he.dmg === 3 && he.targetUid === C.uid, 'and its strike is a hit tagged ambush (a melee lunge)'); }
{ const {e, P} = mk(); const A = play(e, P, 1, 'dv-amb5', 0); ok(A.wait === 3, 'set-up: the ambusher is still Waiting'); const C = play(e, P, 2, 'dv-wall', 0);
  ok(C.hp === 495, `Ambush 5, Waiting or not: 5 (${C.hp})`); }
{ const {e, P} = mk(); play(e, P, 1, 'dv-amb', 0); const C0 = play(e, P, 2, 'dv-wall', 0); const C1 = play(e, P, 2, 'dv-wall', 'left');
  ok(C1.slot !== 0 && C1.hp === 500 && C0.hp === 497, `a card played into another slot is left alone (${C1.slot}: ${C1.hp})`); }
{ const {e, P} = mk(); play(e, P, 2, 'dv-wall', 0); const C = play(e, P, 1, 'dv-amb', 0); ok(C.hp === 500, 'its own arrival opposite an enemy does nothing (only enemy plays)'); }
{ const {e, P} = mk(); const A = play(e, P, 1, 'dv-amb', 0); const C = play(e, P, 2, 'dv-frail', 0); ok(!all(P[2]).includes(C), 'a card the ambush kills dies on arrival'); void A; }
// the old Ambush crit is gone: its first attack hits for its Attack, no crit
{ let crit = 0; for(let s = 1; s <= 10; s++){ const {e, P} = mk(null, s); const W = put(e, P, 2, 'dv-wall', 0); const A = put(e, P, 1, 'dv-amb-att', 0); const ev = [];
    e.debugAttack(P, so, A.uid, {}, ev); if(W.hp !== 497 || ev.some(x=> x.type === 'hit' && x.crit)) crit++; }
  ok(crit === 0, `Ambush no longer makes its first attack crit (${crit}/10)`); }

// ---- 10. Expose N: counters; each later hit is a crit and uses one
{ const {e, P} = mk(); const W = put(e, P, 2, 'dv-wall', 0); const X = put(e, P, 1, 'dv-expose', 0);
  e.debugAttack(P, so, X.uid, {}, []); ok(W.hp === 497 && W.exposed === 2, `the first hit: 3, then 2 counters (${W.hp}, ${W.exposed})`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'dv-wall', 0); W.exposed = 2; const A = put(e, P, 1, 'dv-hit', 0);
  e.debugAttack(P, so, A.uid, {}, []); ok(W.hp === 494 && W.exposed === 1, `hit 1 on Exposed 2: a crit (6), 1 left (${W.hp}, ${W.exposed})`);
  e.debugAttack(P, so, A.uid, {}, []); ok(W.hp === 488 && W.exposed === 0, `hit 2: a crit (6), none left (${W.hp}, ${W.exposed})`);
  e.debugAttack(P, so, A.uid, {}, []); ok(W.hp === 485, `hit 3: back to 3 (${W.hp})`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'dv-armor', 0); W.exposed = 1; const A = put(e, P, 1, 'dv-hit', 0);
  e.debugAttack(P, so, A.uid, {}, []); ok(W.hp === 496, `the crit comes before Armor: 3 × 2 − 2 = 4 (${W.hp})`); }
{ // a swing that rolled its own Crit is not doubled again (the counter is still used)
  let checked = 0, bad = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(null, s); const W = put(e, P, 2, 'dv-wall', 0); W.exposed = 1; const A = put(e, P, 1, 'dv-crit', 0); const ev = [];
    e.debugAttack(P, so, A.uid, {}, ev); const h = ev.find(x=> x.type === 'hit' && x.attUid === A.uid); if(!h) continue; checked++;
    if(W.hp !== 494 || W.exposed !== 0) bad++; const xh = ev.find(x=> x.type === 'statusFx' && x.kind === 'exposedHit'); if(!xh) bad++; }
  ok(checked > 10 && bad === 0, `Crit + Exposed: always 6, never 12 (${checked} swings, ${bad} wrong)`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'dv-wall', 0); W.exposed = 1; const ev = []; e.debugDamage(P, so, W.uid, 4, {}, ev);
  ok(W.exposed === 0 && W.hp === 492, `a skill / flat hit crits too (4 × 2) (${W.hp}, ${W.exposed})`); }

// ---- the app side
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fxb = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-b.js'), 'utf8');
ok(/\{key:'penance', category:'evergreen', label:'Penance', kind:'number', min:1, defaultValue:3,/.test(src), 'Penance N is a skill (editor row, default 3)');
ok(/\{key:'bloodTithe', category:'evergreen', label:'Blood Tithe', kind:'number', min:1, defaultValue:2,/.test(src), 'Blood Tithe N is a skill (editor row, default 2)');
ok(/penance: v=> `When played, deal \$\{numOr\(v, 3\)\} damage to your own castle\.`/.test(src), 'Penance card text');
ok(/bloodTithe: v=> `When played, deal \$\{numOr\(v, 2\)\} damage to a random ally \(your castle if there is none\)\.`/.test(src), 'Blood Tithe card text');
ok(/penance:'⛧🏰', bloodTithe:'⛧🩸'/.test(src), 'their icons');
ok(/penance: \{withhold:'subject'/.test(src) && /bloodTithe: \{withhold:'subject'/.test(src) && /ambush: \{withhold:'foe'/.test(src), 'Effects library setups');
ok(/SB_DEFAULT_SKILLS = \{penance:'-v', bloodTithe:'-v',/.test(src) && /rule === '-v'\) t -= /.test(src), 'the stat budget counts the payments as a discount');
ok(/function devilPayVfx\(ev\)/.test(src) && /function devilPulse\(el\)/.test(src) && /devilPayLogText\(ev, nm\)/.test(src), 'their log lines and the ⛧ pulse');
ok(/\{key:'ambush', category:'passive', label:'Ambush', kind:'number', min:1, defaultValue:3,/.test(src) && /get:e=> e\.ambush \? numOr\(e\.ambush, 3\) : undefined/.test(src), 'Ambush N: an old Ambush (true) reads as Ambush 3');
ok(/ambush: v=> `When an enemy unit enters the slot facing it \(played, spawned or moved in\), deal \$\{numOr\(v, 3\)\} damage to it\.`/.test(src), 'Ambush card text (2026-10-17: any enemy unit entering, not only a card played)');
ok(!/Its first attack always crits/.test(src), 'the old Ambush text is gone');
ok(/expose: v=> `Its hits put \$\{numOr\(v, 1\)\} Expose counter/.test(src) && /name:'Exposed', c:'#e07b39', text:'each hit on it is a crit/.test(src), 'Expose card text and the Exposed gloss');
ok(/opts\.crit \? '🎯 Crit!'/.test(fxb) && /M\.exposeCash\(t, \{crit:true\}\)/.test(fxb), 'the Exposed hit chip says Crit!');
ok(/"Always Flooded\. Tide effects can't change it\."/.test(src) && /r\.rapids \? 'Always Flood' : 'Always Flooded'/.test(src), 'Perma-tide says "Always Flooded"');
ok(/function liveStatusGlossHTML\(c\)/.test(src) && /\$\{abilityHTML\}\$\{liveStatusGlossHTML\(liveC\)\}/.test(src), 'a unit in play lists its statuses under its skills');
// the live status list itself, run on its own
{ const vm = require('vm'); const grab = (re)=>{ const m = src.match(re); if(!m) throw new Error('not found: ' + re); return m[0]; };
  const code = grab(/const STATUS_KEYWORDS = \[[\s\S]*?\n\];/) + '\n' + grab(/const LIVE_STATUS_ROWS = \[[\s\S]*?\n\];/) + '\n' + grab(/const LIVE_STATUS_ROUNDS = [^\n]*/) + '\n' + grab(/function liveStatusGlossHTML\(c\)\{[\s\S]*?\n\}/);
  const ctx = {escapeHtml: s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}; vm.createContext(ctx); vm.runInContext(code + '\nthis.f = liveStatusGlossHTML;', ctx);
  const h = ctx.f({poison:3, exposed:2, stunned:true, frozen:1, hp:5});
  ok(/Poison 3<\/b>: takes 3 damage at upkeep/.test(h) && /Exposed 2<\/b>: its next 2 hits are crits/.test(h) && /Stunned<\/b>: skips its next attack/.test(h) && /Frozen<\/b> <small>\(1 round\)<\/small>/.test(h), `the live lines (${h.slice(0, 300)})`);
  ok(/--kw:#3fa535/.test(h) && /class="kw-gloss live-status-gloss"/.test(h), 'in the status colours and the kw-gloss look');
  ok(ctx.f({hp:5, poison:0}) === '' && ctx.f(null) === '', 'nothing when it has no statuses'); }
console.log(`skills-2026-10-16-devilry: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
