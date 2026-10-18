#!/usr/bin/env node
// 2026-10-16 (skills 2). The user's notes:
//  29. "Wind: The typical wind effect cards say that the wind change is random. Forward, Backward, No Wind, etc."
//  32. "Amore: If you play a creature with Amore on the field and there is another creature with Amore on the field that shares a type,
//      both creature's Amore skills we activate, giving them Regeneration 3 and +0/+3. This can only happen once. If the other creature
//      dies, the Amore becomes brown, and they lose the Regeneration 3 bonus but keep the +0/+3 ..."
//  36. "A new skill: Whenever you pitch a card, this card does {}."
//  41. "Stun N: 1/3 chance to Stun a card for N turns - Default 1."
//  42. Cataphract Destrier: the old On Ready 6 removed (cards.json, the published row on load, and the editor can show it now).
//  47. "Pounce <Att> or <Hp>: The Pounce value is dynamically calculated on play"
//  52. "New action: On Attack, Burn 1 Lumber, Deal N extra fire damage on hit. ... One (unused) is Burn 1 Lumber, Heal ally N"
'use strict';
const fs = require('fs'), path = require('path');
const {TEXT: TEXT_D, TX: TX_D} = require(path.join(__dirname, '..', 'bramblewood-texts.js')); // 2026-10-18 (package D): the terse texts are TX keys
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, archetypes:['Beast'], effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  's2-wall': U('s2-wall', {}, {attack:0}), 's2-hit': U('s2-hit'),
  's2-love': U('s2-love', {amore:true}, {attack:0, health:20}), 's2-love2': U('s2-love2', {amore:true}, {attack:0, health:20}),
  's2-love-bird': U('s2-love-bird', {amore:true}, {attack:0, health:20, archetypes:['Bird']}), 's2-love-regen': U('s2-love-regen', {amore:true, regen:2}, {attack:0, health:20}),
  's2-scav': U('s2-scav', {triggers:[{on:'onPitch', do:'gain', resource:'stone', amount:2}]}, {attack:0}),
  's2-scav-wait': U('s2-scav-wait', {triggers:[{on:'onPitch', do:'gain', resource:'stone', amount:2}]}, {attack:0, wait:3}),
  's2-stun': U('s2-stun', {stunOnHit:2}), 's2-stun-old': U('s2-stun-old', {stunOnHit:50}),
  's2-pounce-a': U('s2-pounce-a', {pounce:'attack'}, {attack:7, wait:2}), 's2-pounce-h': U('s2-pounce-h', {pounce:'health'}, {attack:1, health:9, wait:2}), 's2-pounce-n': U('s2-pounce-n', {pounce:4}, {attack:1, wait:2}),
  's2-fire': U('s2-fire', {triggers:[{on:'onAttack', do:'fireHit', amount:3, cost:'burnLumber'}]}),
  's2-heal': U('s2-heal', {triggers:[{on:'onRoundStart', do:'heal', amount:4, who:'ally', sub:'adjacent', cost:'burnLumber'}]}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function play(e, P, pid, id, side, ev){ e.debugSpawnCard(P, so, pid, id, side == null ? 'left' : side, {}, ev || []); return all(P[pid]).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }

// ---- 32. Amore
{ const {e, P} = mk(); const A = play(e, P, 1, 's2-love', 0); ok(A.maxHp === 20 && A.amoreWith == null, 'one Amore unit alone: nothing');
  const ev = []; const B = play(e, P, 1, 's2-love2', 'left', ev);
  ok(A.amoreWith === B.uid && B.amoreWith === A.uid, 'a second Amore unit of the same Type pairs with it');
  ok(A.maxHp === 23 && A.hp === 23 && B.maxHp === 23 && B.hp === 23, `both get +0/+3 (${A.hp}/${A.maxHp}, ${B.hp}/${B.maxHp})`);
  ok(ev.some(x=> x.type === 'amore' && x.uid === B.uid && x.mateUid === A.uid), 'an amore event names the pair');
  const C = play(e, P, 1, 's2-love', 'right'); ok(C.amoreWith == null && C.maxHp === 20, 'a third one finds nobody free: a pair is only ever those two');
  A.hp = 10; e.resolveCombat(P, so, {}, [], 1); ok(A.hp === 13, `Regeneration 3 while in love (${A.hp})`);
  const ev2 = []; B.hp = 0; e.removeDeadCards(P, so, {}, {}, ev2);
  ok(A.amoreBroken && A.amoreRegen === 0 && A.maxHp === 23, 'its partner dies: heartbroken, keeps +0/+3, loses the Regeneration');
  ok(ev2.some(x=> x.type === 'amoreBroken' && x.uid === A.uid), 'an amoreBroken event');
  A.hp = 10; e.resolveCombat(P, so, {}, [], 1); ok(A.hp === 10, `no more Regeneration (${A.hp})`);
  const D = play(e, P, 1, 's2-love2', 'right'); ok(A.amoreWith === B.uid && D.amoreWith === C.uid, 'only once: the heartbroken one never pairs again (the new one takes the free one)'); }
{ const {e, P} = mk(); const A = play(e, P, 1, 's2-love', 0); const B = play(e, P, 1, 's2-love-bird', 'left'); ok(A.amoreWith == null && B.amoreWith == null, 'no shared Type: no pairing'); }
{ const {e, P} = mk(); const A = play(e, P, 2, 's2-love', 0); const B = play(e, P, 1, 's2-love2', 0); ok(A.amoreWith == null && B.amoreWith == null, 'an enemy Amore unit never pairs with yours'); }
{ const {e, P} = mk(); const A = play(e, P, 1, 's2-love-regen', 0); play(e, P, 1, 's2-love', 'left'); A.hp = 10; e.resolveCombat(P, so, {}, [], 1); ok(A.hp === 15, `its own Regeneration 2 + Amore's 3 (${A.hp})`); }

// ---- 36. On Pitch
{ const {e, P} = mk(); play(e, P, 1, 's2-scav', 0); const st0 = P[1].stone || 0; const ev = [];
  e.firePitchTriggers(P, so, 1, 'otter-centurion', {}, ev);
  ok((P[1].stone||0) === st0 + 2 && ev.some(x=> x.type === 'triggerFired' && x.hook === 'onPitch'), `On Pitch: a pitch makes it gain 2 Stone (${P[1].stone})`);
  const ev2 = []; e.firePitchTriggers(P, so, 2, 'otter-centurion', {}, ev2); ok((P[1].stone||0) === st0 + 2, 'the enemy pitching does nothing for it'); }
{ const {e, P} = mk(); play(e, P, 1, 's2-scav-wait', 0); e.firePitchTriggers(P, so, 1, 'otter-centurion', {}, []); ok(!(P[1].stone > 0), 'a Waiting unit stays quiet (a reactive trigger)'); }
ok(E.TRIGGER_KEYS.includes('onPitch'), 'onPitch is a trigger key');

// ---- 41. Stun N
{ let stunned = 0, n = 300, rounds = new Set(); for(let s = 1; s <= n; s++){ const {e, P} = mk(null, s); const W = put(e, P, 2, 's2-wall', 0); const A = put(e, P, 1, 's2-stun', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(W.stunned){ stunned++; rounds.add(W.stunned|0); } }
  ok(stunned > n*0.22 && stunned < n*0.45, `Stun: about 1 in 3 (${stunned}/${n})`); ok(rounds.size === 1 && rounds.has(2), `Stun 2: 2 rounds of stun (${[...rounds]})`); }
{ let stunned = 0, rounds = new Set(); for(let s = 1; s <= 120; s++){ const {e, P} = mk(null, s); const W = put(e, P, 2, 's2-wall', 0); const A = put(e, P, 1, 's2-stun-old', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(W.stunned){ stunned++; rounds.add(W.stunned|0); } }
  ok(stunned > 20 && stunned < 60 && rounds.size === 1 && rounds.has(1), `an old Stun 50 (a %) reads as Stun 1: 1 in 3, 1 round (${stunned}/120, ${[...rounds]})`); }
ok(!base['red-dragon'] || base['red-dragon'].effects.stunOnHit === 1, 'cards.json: Red Dragon Stun 50% -> Stun 1');

// ---- 47. Pounce <Att> / <Hp>
{ const {e, P} = mk(); const W = put(e, P, 2, 's2-wall', 0); const ev = []; const A = play(e, P, 1, 's2-pounce-a', 0, ev);
  ok(W.hp === 493 && A.pounceN === 7 && ev.some(x=> x.type === 'pounce' && x.amount === 7 && x.scale === 'attack'), `Pounce <Att>: 7 (its Attack) (${W.hp})`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 's2-wall', 0); play(e, P, 1, 's2-pounce-h', 0); ok(W.hp === 491, `Pounce <Hp>: 9 (its Health) (${W.hp})`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 's2-wall', 0); play(e, P, 1, 's2-pounce-n', 0); ok(W.hp === 496, `Pounce 4 still 4 (${W.hp})`); }

// ---- 52. Burn 1 Lumber -> Fire on hit / Heal an ally
{ const {e, P} = mk(); const W = put(e, P, 2, 's2-wall', 0); const A = put(e, P, 1, 's2-fire', 0); P[1].lumber = 1; const ev = [];
  e.debugAttack(P, so, A.uid, {}, ev);
  ok(P[1].lumber === 0 && W.hp === 494 && ev.some(x=> x.type === 'lumberBurn') && ev.some(x=> x.type === 'fireHit' && x.dmg === 3 && x.targetUid === W.uid), `On Attack, Burn 1 Lumber: hit 3 + 3 fire (${W.hp}, Lumber ${P[1].lumber})`);
  const ev2 = []; e.debugAttack(P, so, A.uid, {}, ev2); ok(W.hp === 491 && !ev2.some(x=> x.type === 'fireHit' || x.type === 'lumberBurn'), `no Lumber left: no fire, a plain hit (${W.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 's2-fire', 0); P[1].lumber = 2; const ev = []; e.debugAttack(P, so, A.uid, {}, ev); const hq = P[2].hq;
  ok(ev.some(x=> x.type === 'fireHit' && x.castle && x.dmg === 3) && hq.hp === hq.maxHp - 6, `nothing in front: the castle takes the hit and the fire (${hq.maxHp - hq.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 's2-wall', -1); A.hp = 490; put(e, P, 1, 's2-heal', 0); P[1].lumber = 1; e.resolveCombat(P, so, {}, [], 1);
  ok(A.hp === 494 && P[1].lumber === 0, `Burn 1 Lumber, Heal an ally 4 (${A.hp}, Lumber ${P[1].lumber})`); e.resolveCombat(P, so, {}, [], 1); ok(A.hp === 494, 'no Lumber: no heal'); }
ok(E.ACTION_KEYS.includes('fireHit'), 'fireHit is an action key');

// ---- 42. Cataphract Destrier
ok(base['cataphract-destrier'] && !base['cataphract-destrier'].effects.onReadyDamage, 'cards.json: the On Ready 6 is gone');
// ---- the app side
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
{ const vm = require('vm'); const grab = re=>{ const m = src.match(re); if(!m) throw new Error('not found: ' + re); return m[0]; };
  const ctx = {}; vm.createContext(ctx); vm.runInContext(grab(/function dropCataphractOnReady\(id, d\)\{[\s\S]*?\n\}/) + '\nthis.f = dropCataphractOnReady;', ctx);
  const row = {name:'Cataphract Destrier', effects:{onReadyDamage:{amount:6, dmgType:'physical'}, pounce:5, bounty:1, overwhelm:true, triggers:[{on:'onReady', do:'damage', amount:6, who:'enemy', sub:'random'}, {on:'onKill', do:'gain', amount:1}]}};
  const out = ctx.f('cataphract-destrier', row);
  ok(!out.effects.onReadyDamage && out.effects.pounce === 5 && out.effects.bounty === 1 && out.effects.overwhelm && out.effects.triggers.length === 1 && out.effects.triggers[0].on === 'onKill', `a published Cataphract loses only the On Ready 6 (${JSON.stringify(out.effects)})`);
  ok(ctx.f('otter-centurion', row) === row, 'other cards are left alone'); }
ok(/if\(editingCard\.effects\.onReadyDamage && typeof editingCard\.effects\.onReadyDamage === 'object'\)\{/.test(src) && /triggers\.push\(\{on:'onReady', do:'missile', amount:amt\}\)/.test(src), 'the editor opens an old onReadyDamage as an On Ready → Missile trigger (removable)');
ok(fs.existsSync(path.join(__dirname, '..', 'supabase', 'oneoff', '2026-10-16_cataphract.sql')), 'the one-off SQL for the published row');
ok(/const WIND_TEXT = \{windy: TX\('ui\.fx-windy'\), gale: TX\('ui\.fx-gale'\)\}/.test(src) && /at your back, in your face, or calm \(1 in 3 each\)/i.test(TEXT_D['ui.fxx-windy']) && /at your back or in your face \(1 in 2 each\)/.test(TEXT_D['ui.fxx-gale']) && /WIND_CODEX\.windy/.test(src), 'the Windy / Gale texts say the wind is random, with the odds (2026-10-18, package D: the odds in the Map Codex line)');
ok(/\{key:'amore', category:'passive', label:'Amore', kind:'boolean'/.test(src) && /SKILL_ICON\.amore = '💕'/.test(src) && /function skills2Vfx\(ev\)/.test(src), 'Amore: skill, icon, looks');
ok(/\{key:'onPitch', label:'On Pitch'/.test(src) && /♻️ Scavenge - \$\{detail\}/.test(src) && /m\.engine\.pitchCard\(m\.players, m\.sideOf, activePid, dc/.test(src), 'On Pitch: trigger, "Scavenge - …" card text, fired by the pitch');
ok(/\{key:'fireHit', label:'Fire on hit', fields:\['amount'\]/.test(src) && /<option value="burnLumber"/.test(src) && /if\(costEl && costEl\.value\) t\.cost = costEl\.value;/.test(src), 'Fire on hit and the Pay: Burn 1 Lumber field in the trigger editor');
ok(/\{key:'stunOnHit', category:'passive', label:'Stun', kind:'number', min:1, defaultValue:1,/.test(src), 'Stun N defaults to 1');
ok(/\{key:'pounce', category:'evergreen', label:'Pounce', kind:'selectNumber', numberWhen:\['n'\]/.test(src), 'Pounce: N, its Attack or its Health in the editor');
// ---- 37. one new card per no-card skill (docs/new-cards-2026-10-16.md)
{ const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'new-cards-2026-10-16.md'), 'utf8');
  const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8')), byName = {}; cards.forEach(c=> byName[c.name] = c);
  const names = [...doc.matchAll(/^\| \d+ \| \S+ ([^|]+?) \|/gm)].map(m=> m[1].trim());
  ok(names.length >= 90, `the list names the new cards (${names.length})`);
  // 2026-10-16 (placement and rarity): most are now placed on the road, so a source is a map reward or nothing
  const bad = names.filter(n=> { const c = byName[n]; return !c || (c.source && c.source.kind !== 'map') || c.test || !(c.species && c.species.length) || !Object.keys(c.effects || {}).length || !c.locked; });
  ok(!bad.length, `each is in cards.json: locked, no source or a map reward (art came 10-18), a species and its skill (${bad.slice(0, 5)})`);
  const lc = names.map(n=> n.toLowerCase()); ok(new Set(lc).size === lc.length, 'no two share a name');
}
// ---- 4. clean names: no braces, no "one-off", no notes in brackets in the skill / trigger / action names
{ const bad = [...src.matchAll(/\{key:'(\w+)', (?:category:'\w+', )?(?:hidden:true, )?(?:retired:true, )?(?:mechLineGate:'\w+', )?label:'([^']*)'/g)].filter(m=> /[{}()–]|one-off/i.test(m[2])).map(m=> m[1] + ': ' + m[2]);
  ok(!bad.length, `skill, trigger and action names are plain (${bad.join('; ')})`);
  ok(/const ZEIT_TWIN = \{diurnal:'diurnalGrant', nocturnal:'nocturnalGrant', fullMoon:'fullMoonGrant', tide:'tideGrant'\};/.test(src) && /<label class="sk-twin">Gives <select data-sk="twin"/.test(src), 'Diurnal / Nocturnal / Full Moon / Tide: one name, a "Gives" field for the stat bonus or the skill list');
  ok(!/x\.oneOff \? ' · one-off'/.test(src), 'one-off is a tag beside the row, not part of the name'); }
console.log(`skills2-2026-10-16: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
