#!/usr/bin/env node
// 2026-11-08 (package ENG36, owner 11-07 notes): 1 status Resist / Weakness / Immune, 2 summons at the summoner's level, 3 the Thanatosis
// rework, 4 Constrict (and Strangle / Constrict as actions), 5 Hoard N = +N/+N a Lumber. Engine scenarios, prices, data, texts, editor, docs.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e36-wall': U('e36-wall', {}), 'e36-hit10': U('e36-hit10', {}, {attack:10}), 'e36-hit1': U('e36-hit1', {}, {attack:1}),
  'e36-res-venom': U('e36-res-venom', {resist:['status:venom']}), 'e36-weak-venom': U('e36-weak-venom', {weakness:['status:venom']}), 'e36-imm-venom': U('e36-imm-venom', {immune:['status:venom']}),
  'e36-res-bleed': U('e36-res-bleed', {resist:['status:bleed']}), 'e36-res-burn': U('e36-res-burn', {resist:['status:burn']}), 'e36-top-res': U('e36-top-res', {}, {resist:['status:venom']}),
  'e36-res-stun': U('e36-res-stun', {resist:['status:stun']}), 'e36-weak-stun': U('e36-weak-stun', {weakness:['status:stun']}), 'e36-imm-stun': U('e36-imm-stun', {immune:['status:stun']}),
  'e36-res-web': U('e36-res-web', {resist:['status:web']}), 'e36-imm-constrict': U('e36-imm-constrict', {immune:['status:constrict']}),
  'e36-stunner': U('e36-stunner', {stunOnHit:1}, {attack:1}), 'e36-webber': U('e36-webber', {web:1}, {attack:1}),
  'e36-than': U('e36-than', {thanatosis:true}, {attack:2, health:6}),
  'e36-con': U('e36-con', {constrict:2}, {attack:1, health:50}), 'e36-str': U('e36-str', {strangle:2}, {attack:1, health:50}),
  'e36-con-play': U('e36-con-play', {triggers:[{on:'onSpawn', do:'constrict', amount:3, who:'enemy', sub:'adjacent'}]}, {attack:1, health:50}),
  'e36-str-play': U('e36-str-play', {triggers:[{on:'onSpawn', do:'strangle', amount:2, who:'enemy', sub:'adjacent'}]}, {attack:1, health:50}),
  'e36-reactor': U('e36-reactor', {triggers:[{on:'onAttacked', do:'gainLumber', amount:1}]}, {attack:3, health:50}),
  'e36-hoard1': U('e36-hoard1', {hoard:1}, {attack:1, health:10}), 'e36-hoard34': U('e36-hoard34', {hoard:0.75}, {attack:1, health:10}),
  'e36-bul': U('e36-bul', {bulwark:1}, {attack:1, health:10}),
  'e36-bul@10': U('e36-bul@10', {bulwark:1}, {attack:1, health:10, level:10, baseLevel:1, derivedFrom:'e36-bul'}),
  'e36-bul@1': U('e36-bul@1', {bulwark:1}, {attack:1, health:10, level:1, baseLevel:1, derivedFrom:'e36-bul'}),
  'e36-bul@0': U('e36-bul@0', {bulwark:1}, {attack:1, health:10, level:0, baseLevel:1, derivedFrom:'e36-bul'}),
  'e36-tok': U('e36-tok', {}, {attack:2, health:4, token:true, rarity:'common'}),
  'e36-spawner@10': U('e36-spawner@10', {triggers:[{on:'onSpawn', do:'spawnCard', defId:'e36-tok', count:1}]}, {attack:1, health:10, level:10, baseLevel:1}),
  'e36-spawner': U('e36-spawner', {triggers:[{on:'onSpawn', do:'spawnCard', defId:'e36-tok', count:1}]}, {attack:1, health:10}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); e.removeDeadCards(P, so, {}, {}, ev); return ev; };
const onBoard = (P, pid, uid)=> all(P[pid]).some(x=> x.uid === uid);
// one round of ticks with nobody swinging (every unit waits)
function tickRound(e, P){ all(P[1]).concat(all(P[2])).forEach(c=> c.wait = 9); const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; }

// ================= 1. status Resist / Weakness / Immune =================
// Venom: Resist halves the tick (rounded down), Weakness doubles, Immune: none and the counters come off; a top-level resist counts too
for(const [id, n, want] of [['e36-wall', 5, 5], ['e36-res-venom', 5, 2], ['e36-res-venom', 1, 0], ['e36-weak-venom', 3, 6], ['e36-top-res', 4, 2]]){
  const {e, P} = mk(); const t = put(e, P, 2, id, 0); t.poison = n; const hp0 = t.hp; tickRound(e, P); ok(hp0 - t.hp === want, `${id}: a Venom tick of ${n} deals ${want} (${hp0 - t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-imm-venom', 0); t.poison = 5; const hp0 = t.hp; tickRound(e, P); ok(t.hp === hp0 && !(t.poison > 0), `Venom Immune: no tick, the counters come off (${hp0 - t.hp}, ${t.poison})`);
  const a = put(e, P, 1, 'e36-hit1', 0); a.wait = 0; defs['e36-hit1'].effects = {poison:3}; swing(e, P, a); defs['e36-hit1'].effects = {}; ok(!(t.poison > 0), 'Venom Immune: a Venomous hit adds none'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-res-venom', 0); const a = put(e, P, 1, 'e36-hit1', 0); defs['e36-hit1'].effects = {poison:3}; swing(e, P, a); defs['e36-hit1'].effects = {};
  ok(t.poison === 3, `Venom Resist: the counters still land (${t.poison}); only the ticks are halved`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-res-bleed', 0); t.bleed = 5; t.wait = 0; const hp0 = t.hp; const tgt = put(e, P, 1, 'e36-wall', 0); void tgt; defs['e36-res-bleed'].attack = 1; t.atk = 1;
  const ev = []; e.debugAttack(P, so, t.uid, {}, ev); defs['e36-res-bleed'].attack = 0; const bt = ev.find(x=> x.type === 'bleedTick'); ok(bt && hp0 - t.hp === 2, `Bleed Resist: a Bleed of 5 bleeds 2 on its swing (${bt && bt.dmg}, ${hp0 - t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-res-burn', 0); t.burn = 3; const hp0 = t.hp; tickRound(e, P); ok(hp0 - t.hp === 0, `Burn Resist: a Burn tick of 1 halves to 0 (${hp0 - t.hp})`); }
// Chance statuses: Resist -50 points (Stun on hit's 1 in 3 never lands), Weakness +50 (about 5 in 6), Immune never
function stunRate(id, n){ let got = 0; for(let s = 1; s <= n; s++){ const {e, P} = mk(1000 + s); const a = put(e, P, 1, 'e36-stunner', 0), t = put(e, P, 2, id, 0); swing(e, P, a); if(t.stunned) got++; } return got / n; }
{ const base = stunRate('e36-wall', 240), res = stunRate('e36-res-stun', 240), weak = stunRate('e36-weak-stun', 240), imm = stunRate('e36-imm-stun', 240);
  ok(base > 0.22 && base < 0.45, `Stun on hit lands about 1 in 3 on a plain unit (${base.toFixed(2)})`);
  ok(res === 0, `Stun Resist: 33% - 50 points = never (${res})`); ok(imm === 0, `Stun Immune: never (${imm})`);
  ok(weak > 0.72 && weak < 0.93, `Stun Weakness: 33% + 50 points, about 5 in 6 (${weak.toFixed(2)})`); }
// a sure status: Resist lands 1 in 2 (Web on hit)
{ let got = 0, n = 240; for(let s = 1; s <= n; s++){ const {e, P} = mk(3000 + s); const a = put(e, P, 1, 'e36-webber', 0), t = put(e, P, 2, 'e36-res-web', 0); swing(e, P, a); if(t.webbed > 0) got++; }
  ok(got / n > 0.38 && got / n < 0.62, `Web Resist: a sure Web lands about 1 in 2 (${(got / n).toFixed(2)})`); }
// a status held off says so
{ const {e, P} = mk(); const a = put(e, P, 1, 'e36-stunner', 0), t = put(e, P, 2, 'e36-imm-stun', 0); const ev = swing(e, P, a); void t; ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'eng36Resist' && x.status === 'stun' && x.immune), 'an immune unit logs the status it shrugs off (eng36Resist)'); }
// no card carries one: nothing changes (the proof is tools/eng36_proof_2026_11_08.js; here: no 'status:' entry anywhere in the data)
{ const cards = J('canonical/cards.json'); const has = cards.filter(c=> JSON.stringify([c.resist || [], (c.effects || {}).resist || [], (c.effects || {}).weakness || [], (c.effects || {}).immune || []]).includes('status:'));
  ok(has.length === 0, `no card carries a status resistance yet (${has.map(c=> c.id).join(', ')})`); }
// the list
ok(E.ENG36_STATUS && ['venom', 'bleed', 'sleep', 'freeze', 'stun', 'burn', 'soak', 'constrict', 'toxin', 'web'].every(k=> E.ENG36_STATUS[k]), 'ENG36_STATUS lists the statuses (venom, bleed, sleep, freeze, stun, burn, soak ...)');
ok(Object.keys(E.ENG36_STATUS).filter(k=> E.ENG36_STATUS[k].dot).sort().join() === 'bleed,burn,decay,strangle,toxin,venom,wither', 'the damage-over-time statuses');
// prices
{ const table = J('canonical/skill-costs.json'), SC = require(path.join(ROOT, 'tools/skill_costs.js')).make(table), st = table.statusResist || {};
  ok(Object.keys(E.ENG36_STATUS).every(k=> st[k] && typeof st[k].immune === 'number' && typeof st[k].resist === 'number' && typeof st[k].weak === 'number'), 'skill-costs.json statusResist prices every status');
  ok(SC.cardS({immune:['status:venom']}).S === st.venom.immune && SC.cardS({resist:['status:venom']}).S === st.venom.resist && SC.cardS({weakness:['status:venom']}).S === st.venom.weak, 'a status entry costs its statusResist price');
  ok(SC.cardS({weakness:['water']}).S === 1 && SC.cardS({weakness:['water', 'status:bleed']}).S === Math.round((1 + st.bleed.weak) * 100) / 100, 'a list\'s other entries keep the price they had');
  ok(st.venom.immune > 0 && st.venom.resist > 0 && st.venom.weak < 0 && st.web.weak === 0, 'Immune and Resist cost, Weakness pays back (a sure status: 0)'); }
// the editor
{ const app = rd('arena_app.js'); ok(['resistAddSelStatus', 'weaknessAddSelStatus', 'immuneAddSelStatus'].every(id=> app.includes(`id="${id}"`) && app.includes(`wireAddSelect('${id}'`)), 'the editor\'s Resistance / Weakness / Immune boxes each have a "+ Statuses" picker');
  ok(/resistOptionLabel\(v\)\{[\s\S]{0,120}status:/.test(app), 'a status entry has its own label'); }

// ================= 2. summons at the summoner's level =================
function wallsOf(id){ const {e, P} = mk(); const h = {uid: 9500, defId:id}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
  const dd = c=> e.derivedDefs[c.defId] || defs[c.defId] || {}; return all(P[1]).filter(c=> dd(c).bulwarkWall); }
{ const w10 = wallsOf('e36-bul@10'), w1 = wallsOf('e36-bul@1'), w0 = wallsOf('e36-bul@0'), wn = wallsOf('e36-bul');
  ok(wn.length === 1 && wn[0].hp === 4, `a summoner with no level: the Log Wall as printed, 0/4 (${wn.map(c=> c.atk + '/' + c.hp)})`);
  ok(w1.length === 1 && w1[0].hp === 4, `Level 1 Bulwark: 0/4 (${w1.map(c=> c.atk + '/' + c.hp)})`);
  ok(w10.length === 1 && w10[0].hp === 6 && (w10[0].atk | 0) === 0, `Level 10 Bulwark: 0/6, half the level curve's growth (ENG40, decision ENG36-3 b; was 0/8) (${w10.map(c=> c.atk + '/' + c.hp)})`);
  ok(w0.length === 1 && w0[0].hp === 3, `Level 0 Bulwark: 0/3 (x0.85, a hatchling) (${w0.map(c=> c.atk + '/' + c.hp)})`); }
{ const BB = require(path.join(ROOT, 'bramblewood-budget.js')); const c = BB.forgeCurve({id:'bulwark-wall', attack:0, health:4, wait:0, cost:0, rarity:'common', token:true, effects:{guardian:true}, obtainMap:0}, 1, 11);
  ok(c.rows[10].health === 8 && c.rows[4].health === 5, 'the wall follows the Forge curve (bramblewood-budget.js forgeCurve): L4 0/5, L10 0/8');
  ok(rd('bramblewood-engine.js').includes('bulwarkWallHp: 4'), 'the Log Wall\'s base stays 0/4 (ENG33_DEF.bulwarkWallHp)'); }
{ const {e, P} = mk(); const h = {uid: 9600, defId:'e36-spawner@10'}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
  const tok = all(P[1]).find(c=> (e.derivedDefs[c.defId] || defs[c.defId] || {}).derivedFrom === 'e36-tok' || c.defId === 'e36-tok');
  const st = e.eng36StatsAt(defs['e36-tok'], 10); ok(tok && tok.atk === st.attack && tok.hp === st.health && (st.attack + st.health) > 6, `a Level 10 spawner's token comes out at Level 10 (${tok && tok.atk + '/' + tok.hp}, curve ${st.attack}/${st.health})`); }
{ const {e, P} = mk(); const h = {uid: 9601, defId:'e36-spawner'}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
  const tok = all(P[1]).find(c=> c.defId === 'e36-tok'); ok(tok && tok.atk === 2 && tok.hp === 4, `a spawner with no level: the token as printed (${tok && tok.atk + '/' + tok.hp})`); }

// ================= 3. Thanatosis rework =================
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-than', 0); const ev = []; e.debugDamage(P, so, t.uid, 9, {}, ev);
  ok(t.playingDead != null && t.hp === 1 && onBoard(P, 2, t.uid), 'it plays dead at 1 Health instead of dying');
  const a = put(e, P, 1, 'e36-hit10', 0); const hq0 = P[2].hq.hp; const ev2 = swing(e, P, a);
  ok(t.hp === 1 && P[2].hq.hp === hq0 - 10, `a swing at it passes through to its bramble (bramble ${hq0} -> ${P[2].hq.hp})`);
  ok(ev2.some(x=> x.type === 'hitHQ' && x.attUid === a.uid), 'the hit is on the bramble (hitHQ)');
  a.wait = 9; const ev3 = []; e.resolveCombat(P, so, {}, ev3, 2);
  ok(t.playingDead == null && t.hp === 1 && t.maxHp === 6 && t.atk === 2, `at its next round's start it floats up at 1 Health, keeping max Health 6 and Attack 2 (${t.hp}/${t.maxHp}, ${t.atk})`);
  ok(ev3.some(x=> x.type === 'statusFx' && x.kind === 'thanatosisWake'), 'a thanatosisWake event (the app floats it up and logs it)');
  ok(t.thanatosisUsed === true, 'Thanatosis is spent (shown grey)'); }
// a random shot can still hit it
{ let hit = 0; for(let s = 1; s <= 30 && !hit; s++){ const {e, P} = mk(5000 + s); const t = put(e, P, 2, 'e36-than', 0); e.debugDamage(P, so, t.uid, 9, {}, []);
    defs['e36-hit1'].effects = {triggers:[{on:'onRoundStart', do:'damage', amount:5, who:'enemy', sub:'random'}]}; const a = put(e, P, 1, 'e36-hit1', 3); const ev = [];
    e.debugFireTrigger(P, so, a.uid, 'onRoundStart', {}, ev); defs['e36-hit1'].effects = {}; if(!onBoard(P, 2, t.uid)) hit++; }
  ok(hit > 0, 'a random-target shot can land on a unit playing dead (and at 0 again it dies)'); }
{ const src = rd('bramblewood-engine.js'); ok(/e\.card\.playingDead == null \/\* ENG36/.test(src), 'resolveLiveTarget: a unit playing dead blocks no swing'); }
{ const app = rd('arena_app.js'), css = rd('arena_template.html'); ok(/function eng36FloatUp\(el\)\{[^\n]*reducedMotion\(\)[^\n]*fxAtLeast\('low'\)/.test(app), 'the float-up respects reduced motion and the effects level');
  ok(css.includes('@keyframes eng36FloatUp') && /prefers-reduced-motion: reduce\)\{ \.board-card\.eng36-floatup/.test(css), 'the float-up animation, off under reduced motion'); }

// ================= 4. Constrict, and Strangle / Constrict as actions =================
{ const {e, P} = mk(); const a = put(e, P, 1, 'e36-con', 0), t = put(e, P, 2, 'e36-reactor', 0); const ev = swing(e, P, a);
  ok(t.constricted > 0 && t.bound > 0 && t.boundDmg === 2, `Constrict 2: the target is Constricted, Bound, squeeze 2 (${t.constricted}, ${t.bound}, ${t.boundDmg})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'constrict'), 'a constrict event');
  ok(!(e.effectsOf(t).triggers || []).length, 'while Constricted its skills and triggers are off');
  const ev2 = []; t.wait = 0; e.debugAttack(P, so, t.uid, {}, ev2); ok(!ev2.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === t.uid) && ev2.some(x=> x.type === 'skipTurn' && x.reason === 'constricted'), 'a Constricted unit skips its turn');
  const hp0 = t.hp; a.wait = 9; e.resolveCombat(P, so, {}, [], 2); ok(hp0 - t.hp === 2, `the squeeze lands at the round's start (${hp0 - t.hp})`);
  e.resolveCombat(P, so, {}, [], 1); e.resolveCombat(P, so, {}, [], 2); ok(!(t.constricted > 0) && (e.effectsOf(t).triggers || []).length === 1, `it wears off and its triggers come back (${t.constricted})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e36-str', 0), t = put(e, P, 2, 'e36-reactor', 0); swing(e, P, a); ok(t.bound > 0 && !(t.constricted > 0), 'Strangle still Binds only (no Constrict)'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-reactor', 0); const h = {uid: 9700, defId:'e36-con-play'}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
  ok(t.constricted > 0 && t.boundDmg === 3, `the Constrict action (On Play): the enemy facing it is Constricted, squeeze 3 (${t.constricted}, ${t.boundDmg})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e36-reactor', 0); const h = {uid: 9701, defId:'e36-str-play'}; P[1].hand.push(h); P[1].lumber = 5; e.placeCard(P, so, 1, h.uid, 0, {}, []);
  ok(t.bound > 0 && t.boundDmg === 2 && !(t.constricted > 0), `the Strangle action (On Play): Bound, squeeze 2 (${t.bound}, ${t.boundDmg})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e36-con', 0), t = put(e, P, 2, 'e36-imm-constrict', 0); swing(e, P, a); ok(!(t.constricted > 0), 'Constrict Immune holds it off'); }
{ ok(E.ACTION_KEYS.includes('strangle') && E.ACTION_KEYS.includes('constrict'), 'Strangle and Constrict are actions (ACTION_KEYS)');
  const app = rd('arena_app.js'); ok(/ACTION_DEFS\.push\(\s*\{key:'strangle'[\s\S]{0,400}\{key:'constrict'/.test(app), 'the action editor offers Strangle and Constrict');
  ok(/PASSIVE_DEFS\.push\(\{key:'constrict'/.test(app) && /constrict:'🐍'/.test(app), 'Constrict is a skill with an icon');
  const del = J('canonical/skill-delivery.json'); ok(del.delivery.constrict === 'none' && del.rides.constrict === 'melee', 'skill-delivery.json: Constrict rides melee hits (as Strangle)');
  const sc = J('canonical/skill-costs.json'); ok(sc.skills.some(s=> s.id === 'constrict' && (s.value === 8 || (s.bal32Was && s.bal32Was.value === 8 && s.bal32Was.scale === 'half'))) && /* 2026-11-09 (FIX11): BAL32 repriced Constrict on purpose (scale n, value x N^pow); ENG36's price 8 half scale is kept in bal32Was */['strangle', 'constrict', 'strangle.amount', 'constrict.amount'].every(id=> sc.actions.some(a=> a.id === id)), 'Constrict is priced (skill 8, half scale) and both actions'); }

// ================= 5. Hoard N = +N/+N a Lumber =================
// ENG40 (2026-11-09, owner on ENG36-1): Hoard N is +N/+N for every 3 Lumber now (tests/eng40-2026-11-09.js); these pins read the new rule
{ const {e, P} = mk(); const c = put(e, P, 1, 'e36-hoard1', 0); P[1].lumber = 6; e.syncPhaseStats(P, so, []); ok(e.effAtkOf ? true : true, '');
  const atk = c.atk + (c.phaseAtk || 0); ok(c.phaseAtk === 2 && c.maxHp === 12, `Hoard 1 with 6 Lumber: +2/+2 (${c.phaseAtk}, max ${c.maxHp})`); void atk;
  P[1].lumber = 0; e.syncPhaseStats(P, so, []); ok(!(c.phaseAtk > 0) && c.maxHp === 10, 'with no Lumber: nothing'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'e36-hoard34', 0); P[1].lumber = 6; e.syncPhaseStats(P, so, []); ok(c.phaseAtk === 1 && c.maxHp === 11, `Hoard 0.75 with 6 Lumber: 0.75 x 2 = +1/+1, rounded down (${c.phaseAtk}, ${c.maxHp})`);
  P[1].lumber = 3; e.syncPhaseStats(P, so, []); ok(!(c.phaseAtk > 0), 'with 3 Lumber: 0.75 rounds down to 0'); }
{ const cards = J('canonical/cards.json'), by = id=> cards.find(c=> c.id === id);
  ok(by('tax-collector-teal').effects.hoard === 1 && by('magnate-duck').effects.hoard === 1, 'the two Hoard cards: Hoard 1 (ENG36 converted them to 0.75 / 0.25; 2026-11-10 BAL34, ENG40-1 a: both to Hoard 1 under ENG40\'s every-3-Lumber rule)');
  ok(by('tax-collector-teal').attack === 1 && by('tax-collector-teal').health === 4 && by('magnate-duck').attack === 2 && by('magnate-duck').health === 37, 'their base stats are unchanged');
  const sc = J('canonical/skill-costs.json'), h = sc.skills.find(s=> s.id === 'hoard'); ok(h.perN === 1 && h.pow == null && h.eng40Was && h.eng40Was.perN === 3, 'Hoard is priced 1 x N (ENG40; was 3 x N, kept in eng40Was)'); }

// ================= texts, translations, docs =================
{ global.window = global; const T = require(path.join(ROOT, 'bramblewood-texts.js')); void T; const src = rd('bramblewood-texts.js');
  const keys = ['ui.eng36-statuses', 'ui.eng36-status-of', 'ui.eng36-constrict', 'ui.eng36-constrict-name', 'ui.eng36-hoard', 'ui.eng36-log-resist', 'ui.eng36-log-immune', 'ui.eng36-log-constricted-skip'].concat(Object.keys(E.ENG36_STATUS).map(k=> 'ui.eng36-st-' + k));
  const miss = keys.filter(k=> !src.includes('"' + k + '"')); ok(!miss.length, 'the TX keys exist: ' + miss.join(', '));
  const en = {}; src.split('\n').forEach(l=>{ const m = /^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/.exec(l); if(m) en[m[1]] = JSON.parse('"' + m[2] + '"'); });
  ok(/floats up/.test(en['ui.eng33-thanatosis']) && /pass through/.test(en['ui.eng33-thanatosis-codex']), 'the Thanatosis texts describe the rework');
  ok(/\+\{n\}\/\+\{n\} for every 3 Lumber/.test(en['ui.eng36-hoard']), 'Hoard reads +N/+N for every 3 Lumber (ENG40)');
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const d = J('lang/' + code + '.json'); const core = t=> t.trim().replace(/^[\s\u00a0\p{Extended_Pictographic}\uFE0F\u200D]+/u, ''); /* a pack key has no leading emoji */ const m2 = keys.concat(['ui.eng33-thanatosis', 'ui.eng33-thanatosis-codex', 'ui.eng33-log-wake']).filter(k=> en[k] && !d[core(en[k])]);
    ok(!m2.length, `lang/${code}.json has every ENG36 text (${m2.join(', ')})`); } }
{ const dec = J('docs/decisions.json'), list = Array.isArray(dec) ? dec : (dec.decisions || dec.items || []); const d1 = list.find(d=> d.id === 'ENG36-1');
  ok(!!d1, 'decision ENG36-1 (Hoard: keep the converted values or the literal ones)');
  const words = d=> String((d.body || d.question || '') + ' ' + JSON.stringify(d.options || [])).split(/\s+/).length;
  ok(list.filter(d=> /^ENG36-/.test(d.id)).every(d=> words(d) < 200), 'ENG36 decisions are short'); }
{ const cl = rd('docs/CHANGELOG.md'); ok(/ENG36/.test(cl), 'a CHANGELOG entry'); } // 2026-11-10 (coordinator): later entries pushed it past the first 20000 characters; search the whole file
ok(rd('tests/run-all.sh').includes('tests/eng36-2026-11-08.js'), 'listed in tests/run-all.sh');

console.log(`eng36: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
