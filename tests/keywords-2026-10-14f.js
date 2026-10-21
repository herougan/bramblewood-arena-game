#!/usr/bin/env node
// 2026-10-14, sixth pass: Fencing (user: "Frillneck Duelist shouldn't have Bludgeon - a hammer and weight related skill. Duelist should
// use 'Fencing' - a new skill related to fine & precise swordsmanship. Maybe fencing = cannot miss Evade creatures"), Fireball (user:
// "On Ready _ Shoot an AOE fireball to a random enemy. in a 3-x size area, enemy units are hit for 15 Fire damage"), Meteor (user: "On
// Ready _ Do some damage"), Banana / Bananarang / Durian (user: "Banana: every turn, at speed -1 (slower than everyone else), 1/2
// chance to eat the banana for 3 health, 1/2 chance to throw the banana at a random enemy for 3 damage ... The unit will never do eat
// if it is at full health"), Shield (user: "Not the same as armour, just temp HP. Shield N - the unit comes played with N shield. As
// an action - On X, Shield N"), and the "Planned, not built yet" list: Electricity, Keen Sense, the Hammerhead and a sledgehammer ape.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, base, {
  'kf-wall':  U('kf-wall', {}),
  'kf-evade': U('kf-evade', {evasive:true}),
  'kf-swift': U('kf-swift', {swift:true}),
  'kf-fly':   U('kf-fly', {flying:true}),
  'kf-swim':  U('kf-swim', {swimmer:true}),
  'kf-armor': U('kf-armor', {armor:5}),
  'kf-plain': U('kf-plain', {}, {attack:2}),
  'kf-fence': U('kf-fence', {fencing:true}, {attack:2}),
  'kf-fire':  U('kf-fire', {fireball:true}, {health:10}),
  'kf-fireW': U('kf-fireW', {fireball:6}, {health:10, wait:1}),
  'kf-met':   U('kf-met', {meteor:true}, {health:10}),
  'kf-ban':   U('kf-ban', {banana:true}, {health:20}),
  'kf-ban5':  U('kf-ban5', {banana:5}, {health:20}),
  'kf-dur':   U('kf-dur', {durian:true}, {health:50}),
  'kf-hit':   U('kf-hit', {}, {attack:1, health:500}),
  'kf-shd':   U('kf-shd', {shield:6}, {health:10}),
  'kf-shdA':  U('kf-shdA', {triggers:[{on:'onSpawn', do:'shield', amount:3, who:'ally', sub:'all'}]}, {health:10}),
  'kf-elec':  U('kf-elec', {electricity:2}, {attack:1}),
  'kf-keen':  U('kf-keen', {keenSense:true, purblind:true}, {attack:2}),
  'kf-blindA': U('kf-blindA', {purblind:true}, {attack:2}),
  'kf-blinder': U('kf-blinder', {blind:{chance:100, duration:2}}, {attack:1, health:500}),
  'kf-rang':  U('kf-rang', {bananarang:4}, {attack:2, health:40}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, mode, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);
  if(slot != null){ c.slot = slot; const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); }
  return c; }
const swings = (id, foe, n, seed)=>{ const {e, P} = mk(seed || 5); const T = put(e, P, 2, foe, 0); const A = put(e, P, 1, id, 0); let missed = 0;
  for(let i = 0; i < n; i++){ const ev = []; e.debugAttack(P, so, A.uid, {}, ev); if(ev.some(x=> x.type === 'evaded')) missed++; T.hp = T.maxHp; } return missed; };

// ---- 1. Fencing
ok(swings('kf-fence', 'kf-evade', 40) === 0, 'Fencing: never dodged by an Evasive unit');
ok(swings('kf-plain', 'kf-evade', 40) > 5, 'without Fencing, Evasive dodges');
ok(swings('kf-fence', 'kf-swift', 40) === 0, 'Fencing: never dodged by a Swift unit');
ok(swings('kf-fence', 'kf-fly', 40) > 5, 'a Flyer is still out of reach half the time');
{ const d = base['frillneck-duelist']; ok(d.effects.fencing === true && !d.effects.bludgeon, 'Frillneck Duelist: Fencing, not Bludgeon'); }

// ---- 2. Fireball
{ const {e, P} = mk(3); const L = put(e, P, 2, 'kf-wall', -1), C = put(e, P, 2, 'kf-wall', 0), R = put(e, P, 2, 'kf-armor', 1), F = put(e, P, 2, 'kf-wall', 3);
  const ev = []; put(e, P, 1, 'kf-fire', 0, ev); const fb = ev.find(x=> x.type === 'fireball');
  ok(fb && fb.n === 15, 'Fireball (default 15): it goes off when a Wait-0 unit arrives Ready');
  const hitSet = new Set(fb.uids); const t = [L, C, R, F].find(c=> c.uid === fb.targetUid);
  ok(hitSet.has(t.uid) && [L, C, R, F].every(c=> hitSet.has(c.uid) === (Math.abs(c.slot - t.slot) <= 1)), `the blast is 3 columns wide around the target (${fb.uids.length})`);
  ok([L, C, R, F].every(c=> c.hp === (hitSet.has(c.uid) ? 35 : 50)), 'each unit in the blast takes 15 (Armor doesn\'t stop it), the rest nothing');
  ok(ev.filter(x=> x.type === 'hit' && x.fireball && x.dmgType === 'heat').length === hitSet.size, 'a fire hit event per unit'); }
{ const {e, P} = mk(4); const C = put(e, P, 2, 'kf-wall', 0); const W = put(e, P, 1, 'kf-fireW', 0); ok(W.wait === 1 && C.hp === 50, 'a waiting unit holds its Fireball');
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const iR = ev.findIndex(x=> x.type === 'ready' && x.uid === W.uid), iF = ev.findIndex(x=> x.type === 'fireball');
  ok(iR >= 0 && iF > iR && C.hp === 44, `when it becomes Ready: Fireball 6 (${C.hp})`); }
{ const {e, P} = mk(4); const hq = P[2].hq.hp; const ev = []; put(e, P, 1, 'kf-fire', 0, ev); ok(ev.some(x=> x.type === 'fireball' && x.castle) && P[2].hq.hp < hq, 'no enemy units: the fireball hits the castle'); }
{ const run = s=>{ const {e, P} = mk(s); [-1, 0, 1, 2].forEach(k=> put(e, P, 2, 'kf-wall', k)); const ev = []; put(e, P, 1, 'kf-fire', 0, ev); return ev.find(x=> x.type === 'fireball').targetUid; };
  ok(run(9) === run(9), 'Fireball is seeded'); }

// ---- 3. Meteor
{ const {e, P} = mk(5); const L = put(e, P, 2, 'kf-armor', -1), C = put(e, P, 2, 'kf-armor', 0), R = put(e, P, 2, 'kf-armor', 1);
  const ev = []; const M = put(e, P, 1, 'kf-met', 0, ev); const me = ev.find(x=> x.type === 'meteor'); const t = [L, C, R].find(c=> c.uid === me.targetUid);
  ok(me && me.n === 20 && me.sideN === 5 && me.burn === 2, 'Meteor (default 20): 20 on the column, 5 beside it, a burn of 2 rounds');
  ok(t.hp === 30, `the unit it lands on takes 20 through Armor 5 (${t.hp})`);
  ok([L, C, R].filter(c=> c !== t).every(c=> c.hp === (Math.abs(c.slot - t.slot) === 1 ? 45 : 50)), 'the units beside it take 5');
  M.atk = 0; const hp0 = t.hp; const burns = [];
  for(let r = 0; r < 3; r++){ const evr = []; e.resolveCombat(P, so, {}, evr, 1); burns.push(evr.filter(x=> x.type === 'meteorBurn' && x.uid === t.uid).map(x=> x.dmg).join('')); }
  ok(burns.join(',') === '2,2,' && t.hp === hp0 - 4, `the crater burns 2 at the start of the next 2 rounds, then goes out (${burns}, ${t.hp})`); }
{ const {e, P} = mk(6); const C = put(e, P, 2, 'kf-wall', 0); const ev = []; const M = put(e, P, 1, 'kf-met', 0, ev); M.atk = 0;
  C.slot = 2; const W = put(e, P, 2, 'kf-wall', 0); const evr = []; e.resolveCombat(P, so, {}, evr, 1);
  ok(W.hp === 48 && C.hp === 30, `the burn stays on the column: whoever stands there now takes it (${W.hp}, ${C.hp})`); }

// ---- 4. Banana
{ const throws = [], eats = []; for(let s = 1; s <= 12; s++){ const {e, P} = mk(s); put(e, P, 2, 'kf-wall', 0); const B = put(e, P, 1, 'kf-ban', 0);
    const ev = []; e.resolveCombat(P, so, {}, ev, 1); const b = ev.filter(x=> x.type === 'banana'); throws.push(b.length === 1 && b[0].action === 'throw');
    const {e:e2, P:P2} = mk(s); put(e2, P2, 2, 'kf-wall', 0); const B2 = put(e2, P2, 1, 'kf-ban', 0); B2.hp = 10; const ev2 = []; e2.resolveCombat(P2, so, {}, ev2, 1);
    const b2 = ev2.find(x=> x.type === 'banana'); eats.push(b2 && b2.action === 'eat' ? (B2.hp === 13 && b2.amount === 3 ? 'ok' : 'bad') : 'throw'); }
  ok(throws.every(Boolean), 'Banana at full Health: it always throws, once a round');
  ok(eats.includes('ok') && eats.includes('throw') && !eats.includes('bad'), `hurt: a coin flip, eat (+3) or throw (${eats})`); }
{ const {e, P} = mk(2); const T = put(e, P, 2, 'kf-wall', 0); const A = put(e, P, 2, 'kf-hit', 1); const B = put(e, P, 1, 'kf-ban', 0); const X = put(e, P, 1, 'kf-wall', 1);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const iB = ev.findIndex(x=> x.type === 'banana'), iLastHit = ev.map(x=> x.type === 'hit' && x.attUid === A.uid).lastIndexOf(true);
  ok(iB > iLastHit && iLastHit >= 0, 'Speed -1: the banana comes after every swing of the round');
  const bt = ev[iB]; ok(bt.action === 'eat' || (bt.action === 'throw' && ev.some(x=> x.type === 'hit' && x.attUid === B.uid && x.ranged && x.dmg === 3)), 'a throw deals 3 to a random enemy unit'); }
{ const {e, P} = mk(1); const T = put(e, P, 2, 'kf-wall', 0); const B = put(e, P, 1, 'kf-ban5', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(T.hp === 45 && ev.find(x=> x.type === 'banana').n === 5, `Banana 5: 5 damage (${T.hp})`); }
{ const {e, P} = mk(1); put(e, P, 2, 'kf-wall', 0); const B = put(e, P, 1, 'kf-ban', 0); B.wait = 2; const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(!ev.some(x=> x.type === 'banana'), 'a unit still on Wait keeps its banana'); }

// ---- 5. Bananarang
{ let ate = 0, caught = 0, flyHits = 0;
  for(let s = 1; s <= 16; s++){ const {e, P} = mk(s); const T = put(e, P, 2, 'kf-fly', 0); const R = put(e, P, 1, 'kf-rang', 0); R.hp = 20;
    const ev = []; e.resolveCombat(P, so, {}, ev, 1); e.roundStart(P, 2, so, {}, ev); e.resolveCombat(P, so, {}, ev, 2);
    if(ev.some(x=> x.type === 'boomerangReturn')) caught++; const eat = ev.find(x=> x.type === 'banana' && x.bananarang); if(eat){ ate++; ok(eat.amount === 4, 'Bananarang 4 heals 4'); }
    if(ev.filter(x=> x.type === 'hit' && x.attUid === R.uid && x.targetUid === T.uid).length >= 2) flyHits++; }
  ok(caught === 16 && flyHits === 16, `Bananarang flies like a Boomerang: thrown, back next round, never misses a Flyer (${caught}, ${flyHits})`);
  ok(ate > 0 && ate < 16, `hurt, it eats it on the way home about half the time (${ate}/16)`); }
{ const {e, P} = mk(3); put(e, P, 2, 'kf-wall', 0); const R = put(e, P, 1, 'kf-rang', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1); e.roundStart(P, 2, so, {}, ev); e.resolveCombat(P, so, {}, ev, 2);
  ok(!ev.some(x=> x.type === 'banana'), 'at full Health it never eats it'); }
{ const d = base['howler-monkey'], m = base['bramblewood-macaque'], w = base['war-drum-mandrill'];
  ok(m.effects.banana === true && d.effects.bananarang === true && w.effects.durian === true, 'Banana: Bramblewood Macaque; Bananarang: Howler Monkey; Durian: War-Drum Mandrill'); }

// ---- 6. Durian
{ const {e, P} = mk(8); const D = put(e, P, 1, 'kf-dur', 0); const A = put(e, P, 2, 'kf-hit', 0); const bonus = [];
  for(let r = 0; r < 10; r++){ e.resolveCombat(P, so, {}, [], r % 2 ? 1 : 2); bonus.push(D.thornsBonus||0); }
  ok(bonus[9] > 0 && bonus[9] < 10 && bonus.every((b, i)=> !i || b >= bonus[i-1]), `Durian: 1 in 2 a round, Thorns +1 for good (${bonus})`);
  const hp0 = A.hp, ev = []; e.debugAttack(P, so, A.uid, {}, ev); const th = ev.find(x=> x.type === 'thorns');
  ok(th && th.dmg === D.thornsBonus && A.hp === hp0 - D.thornsBonus, `an attacker takes the Thorns (${th && th.dmg})`); }

// ---- 7. Shield
{ const {e, P} = mk(); const ev = []; const S = put(e, P, 1, 'kf-shd', 0, ev); ok(S.shield === 6 && ev.some(x=> x.type === 'statusFx' && x.kind === 'unitShield' && x.total === 6), 'Shield 6: it arrives with 6 Shield');
  const A = put(e, P, 2, 'kf-hit', 0); A.atk = 4; const ev2 = []; e.debugAttack(P, so, A.uid, {}, ev2); ok(S.hp === 10 && S.shield === 2, `a 4 hit eats the Shield first (${S.hp}/${S.shield})`);
  const ev3 = []; e.debugAttack(P, so, A.uid, {}, ev3); ok(S.hp === 8 && S.shield === 0, `then Health (${S.hp}/${S.shield})`);
  ok(ev2.some(x=> x.type === 'shieldSoak' && x.soaked === 4 && x.left === 2), 'a shieldSoak event says how much it soaked');
  e.debugHeal(P, so, S.uid, 5, {}, []); ok(S.shield === 0 && S.hp === 10, 'healing never brings the Shield back'); }
{ const {e, P} = mk(); const A1 = put(e, P, 1, 'kf-wall', -1), A2 = put(e, P, 1, 'kf-wall', 1); const S = put(e, P, 1, 'kf-shdA', 0);
  ok(A1.shield === 3 && A2.shield === 3 && !(S.shield > 0), 'the Shield action: On Spawn, Shield 3 to every ally'); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kf-shd', 0); const B = put(e, P, 2, 'kf-wall', 0); B.atk = 2; e.resolveCombat(P, so, {}, [], 1);
  ok(S.shield === 4 && S.hp === 10, 'a normal round: the hit lands on the Shield'); }

// ---- 8. Electricity
{ const {e, P} = mk(4); const T = put(e, P, 2, 'kf-wall', 0), N = put(e, P, 2, 'kf-wall', 1); const X = put(e, P, 1, 'kf-elec', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev);
  const el = ev.find(x=> x.type === 'electricity'); ok(el && el.arcUid === N.uid && N.hp === 48 && T.hp === 49, `Electricity 2: the hit arcs to the unit beside it for 2 (${T.hp}, ${N.hp})`); }
{ const {e, P} = mk(4); const T = put(e, P, 2, 'kf-swim', 0), N = put(e, P, 2, 'kf-swim', -1); const X = put(e, P, 1, 'kf-elec', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev);
  // 2026-10-17: Wet is a general rule (+1 lightning damage per Wet counter, tests/lightning-2026-10-17.js); the wet target's extra zap is gone
  ok(T.hp === 49 && N.hp === 47, `wet (Swimmers): +1 on the arc, no extra zap on the target (${T.hp}, ${N.hp})`); }
{ const {e, P} = mk(4); const T = put(e, P, 2, 'kf-wall', 0); const X = put(e, P, 1, 'kf-elec', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev); ok(T.hp === 49 && ev.find(x=> x.type === 'electricity').arcUid === null, 'nobody beside it: no arc'); }
{ const vb = ['voltwing-bat','static-bat','arc-bat'].map(id=> base[id]);
  // 2026-10-21 (BF5, two skills at most): the bats keep Flying + Electricity (Nocturnal cut, docs/balance/two-skills-2026-10-21.json)
  ok(vb.every(d=> d && d.effects.flying && d.effects.electricity >= 1 && (d.species||[]).includes('Bat') && (d.archetypes||[]).includes('Cave') && !d.art), 'three new cave bats with Electricity (no art yet)');
  ok(vb.map(d=> d.rarity).join() === 'common,uncommon,rare' && base['arc-bat'].effects.electricity === 2, 'common, uncommon, rare; Arc Bat has Electricity 2');
  ok(base['voltaic-eel'].effects.chainLightning === 2 && !base['voltaic-eel'].effects.electricity && base['voltaic-eel'].effects.shock, 'Voltaic Eel: Chain Lightning instead of Electricity since 2026-10-17 (and keeps its Shock)'); }

// ---- 9. Keen Sense
{ const miss = (id, foe, rules, seed)=>{ const {e, P} = mk(seed || 3, 'open', rules); put(e, P, 2, foe, 0); const A = put(e, P, 1, id, 0); let m = 0;
    for(let i = 0; i < 30; i++){ const ev = []; e.debugAttack(P, so, A.uid, {}, ev); if(ev.some(x=> x.type === 'blindMiss' || x.type === 'evaded')) m++; } return {m, A}; };
  const k = miss('kf-keen', 'kf-wall', {dark:'absolute'}); ok(k.m === 0 && !(k.A.blind > 0), `Keen Sense: Purblind and Absolute darkness, still never misses a grounded unit (${k.m})`);
  ok(miss('kf-blindA', 'kf-wall', {}).m > 5, 'a Purblind unit without it misses');
  ok(miss('kf-keen', 'kf-fly', {dark:'pitch'}).m > 5, 'a flying target in the dark: it can miss');
  ok(miss('kf-keen', 'kf-wall', {field:'fog'}).m === 0, 'it finds grounded units through Thick Fog'); }
{ const {e, P} = mk(2); const K = put(e, P, 1, 'kf-keen', 0); const B = put(e, P, 2, 'kf-blinder', 0); for(let i = 0; i < 5; i++) e.debugAttack(P, so, B.uid, {}, []);
  ok(!(K.blind > 0), 'nothing can Blind it'); }
// (BF5, two skills at most) the Ore-Smelter Mole and the Subterraneaner lost Keen Sense to the cut; the Quarry Mole keeps it
{ const moles = ['quarry-mole']; ok(moles.every(id=> base[id].effects.keenSense === true), 'the moles have Keen Sense (the Quarry Mole; BF5 cut the other two)'); }

// ---- 10. New cards from the list
{ const h = base['hammerhead-shark'], g = base['ironback-gorilla'];
  // 2026-10-15 (user: "remove Swimmer for now ... don't let cards have it"): the Swimmers carry plain Tide now.
  ok(h && h.effects.tide && !h.effects.swimmer && h.effects.sweep && (h.archetypes||[]).includes('Ocean') && ['common','uncommon'].includes(h.rarity) && !h.art, 'Hammerhead Shark: an Ocean Tide unit with Cleave');
  ok(g && g.effects.bludgeon && g.rarity === 'rare' && (g.species||[]).includes('Primate') && !g.art, 'Ironback Gorilla: a rare ape with Bludgeon'); }

// ---- 11. Determinism
{ const run = seed=>{ const {e, P} = mk(seed); [-1, 0, 1].forEach(k=> put(e, P, 2, 'kf-hit', k)); put(e, P, 1, 'kf-ban', 0); put(e, P, 1, 'kf-dur', 1); put(e, P, 1, 'kf-met', -1); const ev = [];
    for(let r = 0; r < 4; r++) e.resolveCombat(P, so, {}, ev, r % 2 ? 1 : 2); return JSON.stringify(ev.map(x=> [x.type, x.uid, x.targetUid, x.dmg, x.action])); };
  ok(run(31) === run(31), 'the same seed, the same fight'); }

// ---- 12. App: skills, icons, short text, chips, log lines, VFX, Effects library
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  const keys = ['fencing','fireball','meteor','banana','bananarang','durian','shield','electricity','keenSense'];
  keys.forEach(k=>{
    ok(new RegExp(`\\{key:'${k}', category:'(evergreen|passive)'`).test(src), `${k}: a skill def (shows in the editor)`);
    ok(new RegExp(`Object\\.assign\\(SKILL_ICON, \\{[^}]*\\b${k}:`).test(src), `${k}: an icon`);
    ok(new RegExp(`\\n  ${k}: v=> `).test(src), `${k}: short text`);
    ok(src.includes(`if(e.${k}) out.push(`) || src.includes(`if(e.${k}){`), `${k}: a chip on the card`); });
  const icons = [...src.matchAll(/Object\.assign\(SKILL_ICON, \{([^}]*)\}\)/g)].map(m=> m[1]).find(s=> s.includes('fencing')) || '';
  ok(/meteor:'☄️'/.test(icons) && !/fireball:'🔥'/.test(icons) && /keenSense:'👃'/.test(icons) && /shield:'💠'/.test(icons), `icons: Meteor ☄️, Fireball not 🔥, Keen Sense 👃, Shield 💠`);
  ok(/SKILL_ICON_HTML = \{fireball:'<i class="ico-fireball"/.test(src) && /durian:'<i class="ico-durian"/.test(src), 'Fireball and Durian have drawn icons');
  ['fireball','meteor','meteorBurn','banana','durian','electricity','shieldSoak'].forEach(t=> ok(src.includes(`case '${t}':`) && src.includes(`ev.type==='${t}'`), `${t}: a log line and a VFX handler`));
  ok(/unitShield: ev\.attUid/.test(src) && /ev\.kind==='unitShield'/.test(src), 'unitShield: a log line and a VFX handler');
  ok(/\{key:'shield', label:'Shield', fields:\['amount','who','sub','targets'\]/.test(src) && /case 'shield': doText = /.test(src), 'the Shield trigger action is in the editor');
  ['fencing','fireball','meteor','banana','bananarang','durian','shield','electricity','keenSense'].forEach(k=> ok(new RegExp(`\\n  ${k}: \\{`).test(src.slice(src.indexOf('const FXL_SKILL_SETUPS'))), `${k}: an Effects library setup`));
  ok(/shield:c\.shield\|\|0, thornsBonus:c\.thornsBonus\|\|0/.test(src) && /abadge unit-shield/.test(src), 'the board shows a unit\'s Shield'); }
{ const fx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8'); ok(/Object\.assign\(root\.SkillFX, \{fireball, meteor, bananaThrow, munch\}\)/.test(fx), 'SkillFX: fireball, meteor, bananaThrow, munch'); }
{ const css = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8'); ok(/\.ico-fireball\{/.test(css) && /\.ico-durian\{/.test(css) && /\.abadge\.unit-shield\{/.test(css), 'CSS for the drawn icons and the Shield badge'); }

console.log(`keywords-2026-10-14f: ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
