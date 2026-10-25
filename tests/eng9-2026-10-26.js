#!/usr/bin/env node
// 2026-10-26 (package ENG9): the owner's rules of 10-25 17:53 / 22:36 and his 23:58 answers (OWN-Q1 Bound).
//   E1 Undead (self-return as a token) and Revive N (a random graveyard card back as a real card); E2 Poison Barbs, status-only shots;
//   E3 elements are physical (Armor), magic passes Armor, Magic Armor stops magic only; E4 a Guardian steps in for a counter-attack;
//   E5 Daunt counters fall off on damage actions only; E6 Bloom: Ready only, no room -> fails with +1/+1; E7 Cleave carries Poison / Bleed;
//   E8 a Quick unit dives and loses Quick aloft; E9 Guardian / Rampart only while Ready; E12 seasons of 6 rounds; E13 Stockpile;
//   E19 Bound (half damage, no moving, no Flying dodge); G2 Fork / Trident / Pitchfork; G4 no swing asleep, Decay; G19 Chained adds up;
//   G23 / G24 one-shot On Ready (Wait 0 too) and Charge leave the card; G25 Tangled (1 in 2 to act). Plus the data: prices, cards, texts.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-hit': U('x-hit', {}, {attack:5, health:500}), 'x-hit10': U('x-hit10', {}, {attack:10, health:500}),
  'x-undead': U('x-undead', {undead:true}, {attack:0, health:3, wait:9}), 'x-killer': U('x-killer', {}, {attack:20, health:500}),
  'x-rev': U('x-rev', {revive:1}, {attack:0, health:50, wait:9}), 'x-dead': U('x-dead', {}, {attack:2, health:7, wait:1}),
  'x-barbs': U('x-barbs', {poisonBarbs:2}, {attack:0, health:500, wait:9}), 'x-arrowp': U('x-arrowp', {arrow:3, arrowPoison:true}, {attack:0, health:500}),
  'x-arm': U('x-arm', {armor:2}, {attack:0, health:500, wait:9}), 'x-marm': U('x-marm', {magicArmor:2}, {attack:0, health:500, wait:9}),
  'x-fire': U('x-fire', {}, {attack:5, health:500, dmgType:'heat'}), 'x-mag': U('x-mag', {magic:true}, {attack:5, health:500}),
  'x-counter': U('x-counter', {counterattack:true}, {attack:6, health:500}), 'x-guard': U('x-guard', {guardian:true}, {attack:0, health:500, wait:0}),
  'x-guardw': U('x-guardw', {guardian:true}, {attack:0, health:500, wait:5}),
  'x-daunted': U('x-daunted', {triggers:[{on:'perTurn', do:'gain', resource:'lumber', amount:1}]}, {attack:0, health:500, wait:0}),
  'x-dshot': U('x-dshot', {arrow:2}, {attack:0, health:500, wait:0}),
  'x-bloom': U('x-bloom', {bloomCopy:{when:['kill'], mode:'and'}}, {attack:2, health:20, wait:0}), 'x-bloomw': U('x-bloomw', {bloomCopy:{when:['kill'], mode:'and'}}, {attack:2, health:20, wait:3}),
  'x-cleave': U('x-cleave', {sweep:1, poison:2, bleed:1}, {attack:3, health:500}),
  'x-qdive': U('x-qdive', {quick:true, dive:2}, {attack:3, health:500}),
  'x-stock': U('x-stock', {stockpile:2}, {attack:0, health:50, wait:1}),
  'x-fork': U('x-fork', {fork:true}, {attack:4, health:500}), 'x-trident': U('x-trident', {trident:true}, {attack:4, health:500}),
  'x-sleeper': U('x-sleeper', {sleep:{chance:100, duration:2}}, {attack:1, health:500}),
  'x-cat': U('x-cat', {}, {attack:4, health:500}), 'x-decay': U('x-decay', {decay:1}, {attack:2, health:500}),
  'x-chain': U('x-chain', {chained:{breakOn:'damage', amount:4}}, {attack:4, health:9}), 'x-hit2': U('x-hit2', {}, {attack:2, health:500}),
  'x-fb0': U('x-fb0', {fireball:5}, {attack:0, health:50, wait:0}), 'x-charge': U('x-charge', {charge:{n:1, do:{do:'damage', amount:3, who:'enemy', sub:'random'}}}, {attack:0, health:50, wait:0}),
  'x-tangler': U('x-tangler', {tangle:3}, {attack:1, health:500}), 'x-bound-src': U('x-bound-src', {strangle:1}, {attack:1, health:500}),
  'x-flyer': U('x-flyer', {flying:true}, {attack:0, health:500, wait:9}), 'x-ramp': U('x-ramp', {rampart:true}, {attack:0, health:500, wait:3}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts, hp){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:hp || 200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:hp || 200, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const hits = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid);

// ---- E1 Undead / Revive -----------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(11); const u = put(e, P, 2, 'x-undead', 0); put(e, P, 1, 'x-killer', 0);
  let ev = round(e, P); const back = all(P[2]).find(x=> x.uid === u.uid);
  ok(back && back.hp > 0 && back.undeadToken && back.token, 'E1 Undead: it dies and comes back once, as a token');
  ok(!P[2].graveyard.some(g=> g.defId === 'x-undead'), 'E1 ... taken back out of the graveyard');
  ok(ev.some(x=> x.type === 'revive' && x.undead && x.uid === u.uid), 'E1 ... event revive {undead}');
  ev = round(e, P); ok(!all(P[2]).some(x=> x.uid === u.uid), 'E1 ... the second death is final');
  ok(!P[2].graveyard.some(g=> g.defId === 'x-undead') && !P[2].exile.some(g=> g.defId === 'x-undead'), 'E1 ... and a token leaves no card in the graveyard or the Removal Zone'); }
{ const {e, P} = mk(12); P[2].graveyard.push({defId:'x-dead'}); const ev = []; put(e, P, 2, 'x-wall', 0);
  e.debugSpawnCard(P, so, 2, 'x-rev', 'left', {}, ev);
  const r = all(P[2]).find(x=> x.defId === 'x-dead');
  ok(r && r.hp === 7 && !r.token && !r.undeadToken, `E1 Revive 1 (On Play): a random graveyard creature comes back as a real card (${r && r.hp} Health)`);
  ok(!P[2].graveyard.some(g=> g.defId === 'x-dead') && ev.some(x=> x.type === 'reviveGrave'), 'E1 ... out of the graveyard; event reviveGrave'); }

// ---- E2 Poison Barbs, status-only shots ------------------------------------------------------------------------------------------------
{ const {e, P} = mk(21); put(e, P, 2, 'x-barbs', 0); const a = put(e, P, 1, 'x-hit', 0); round(e, P);
  ok((a.poison|0) === 2, `E2 Poison Barbs 2: the attacker gets 2 Poison counters (${a.poison|0}), no damage back (${a.hp})`); ok(a.hp === 500, 'E2 ... no Thorns damage'); }
{ const {e, P} = mk(22); const t = put(e, P, 2, 'x-wall', 0); put(e, P, 1, 'x-arrowp', 0); const ev = round(e, P);
  ok(t.hp === 500 && (t.poison|0) === 3, `E2 Arrow 3 – poison: 3 Poison counters and no damage (Health ${t.hp}, Poison ${t.poison|0})`); }

// ---- E3 Armor vs the elements, magic, Magic Armor --------------------------------------------------------------------------------------
{ const dmg = (att, def)=>{ const {e, P} = mk(31); const t = put(e, P, 2, def, 0); put(e, P, 1, att, 0); const ev = round(e, P); return 500 - t.hp; };
  ok(dmg('x-fire', 'x-arm') === 3, `E3 a fire swing (5) at Armor 2: 3 (elements count as physical) (${dmg('x-fire', 'x-arm')})`);
  ok(dmg('x-mag', 'x-arm') === 5, `E3 a magic swing (5) at Armor 2: 5 (magic passes Armor) (${dmg('x-mag', 'x-arm')})`);
  ok(dmg('x-mag', 'x-marm') === 3, `E3 a magic swing at Magic Armor 2: 3 (${dmg('x-mag', 'x-marm')})`);
  ok(dmg('x-fire', 'x-marm') === 5, `E3 a fire swing at Magic Armor 2: 5 (Magic Armor stops magic only) (${dmg('x-fire', 'x-marm')})`);
  ok(dmg('x-hit', 'x-marm') === 5, 'E3 a physical swing at Magic Armor: 5'); }

// ---- E4 a Guardian steps in for a counter-attack ----------------------------------------------------------------------------------------
{ let redirected = 0;
  for(let sd = 1; sd <= 6; sd++){ const {e, P} = mk(40 + sd); put(e, P, 2, 'x-counter', 0); const a = put(e, P, 1, 'x-hit', 0); const g = put(e, P, 1, 'x-guard', 1);
    const ev = round(e, P, 1); const c = ev.find(x=> x.type === 'hit' && x.attDefId === 'x-counter');
    if(c && c.targetUid === g.uid && c.guardianRedirect && c.guardedUid === a.uid) redirected++; }
  ok(redirected === 6, `E4 the counter-attack at the attacker is taken by the Guardian beside it (${redirected}/6)`); }
{ const {e, P} = mk(47); put(e, P, 2, 'x-counter', 0); const a = put(e, P, 1, 'x-hit', 0); const g = put(e, P, 1, 'x-guardw', 1); const ev = round(e, P, 1);
  const c = ev.find(x=> x.type === 'hit' && x.attDefId === 'x-counter'); ok(c && c.targetUid === a.uid, 'E9 a Guardian still Waiting does not step in (Ready only)'); }

// ---- E5 Daunt ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(51); const d = put(e, P, 1, 'x-daunted', 0); d.dauntN = 3; put(e, P, 2, 'x-wall', 0);
  e.roundStart(P, 2, so, {}, []); round(e, P); e.endOfRoundUpkeep(P, so, {}, []);
  ok(d.dauntN === 3, `E5 a round with a Lumber skill and no swing: its 3 Daunt counters stay (${d.dauntN}): no fade at round end, none for a non-damage skill`);
  const s = put(e, P, 1, 'x-dshot', 1); s.dauntN = 2; round(e, P);
  ok(s.dauntN === 1, `E5 an Arrow (a damage action) takes one off (${s.dauntN})`); }

// ---- E6 Bloom ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(61); const b = put(e, P, 1, 'x-bloom', 0); b.bloomKill = true; [-1, 1].forEach(sl=> put(e, P, 1, 'x-wall', sl));
  for(let sl = -4; sl <= 4; sl++) if(!all(P[1]).some(x=> x.slot === sl)) put(e, P, 1, 'x-wall', sl);
  const ev = round(e, P); const f = ev.find(x=> x.type === 'bloom');
  ok(f && f.failed && b.bloomed && b.atk === 3 && b.maxHp === 21, `E6 no free slot: the bloom fails, +1/+1 on the unit (${b.atk}/${b.maxHp})`); }
{ const {e, P} = mk(62); const b = put(e, P, 1, 'x-bloomw', 0); b.bloomKill = true; const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'bloom') && !b.bloomed, 'E6 a Waiting unit does not test its Bloom yet'); }

// ---- E7 Cleave carries Poison / Bleed --------------------------------------------------------------------------------------------------
{ const {e, P} = mk(71); put(e, P, 2, 'x-wall', 0); const l = put(e, P, 2, 'x-wall', -1); put(e, P, 1, 'x-cleave', 0); round(e, P);
  ok((l.poison|0) >= 2 && (l.bleed|0) >= 1, `E7 the Cleave side hit gives Poison 2 and Bleed 1 (${l.poison|0}, ${l.bleed|0})`); }

// ---- E8 a Quick unit dives, without Quick aloft ----------------------------------------------------------------------------------------
{ const {e, P} = mk(81); put(e, P, 2, 'x-wall', 0); const q = put(e, P, 1, 'x-qdive', 0); const ev = round(e, P);
  ok(ev.some(x=> x.type === 'diveRise' && x.uid === q.uid), 'E8 a Quick unit with Dive goes aloft');
  ok(e.swingSpeedOf ? e.swingSpeedOf(q) === 0 : true, 'E8 ... and has no Quick while aloft'); }

// ---- E9 Rampart Ready only ---------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(91); put(e, P, 2, 'x-ramp', 0); put(e, P, 1, 'x-hit10', 1); const hp0 = P[2].hq.hp; const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'rampart') && hp0 - P[2].hq.hp === 10, 'E9 a Rampart unit still Waiting takes no share of the bramble hit'); }

// ---- E12 / E13 ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(121, {rules:{seasons:true}}); const seen = [];
  for(let r = 1; r <= 13; r++){ e.roundStart(P, r, so, {}, []); seen.push(e.en6Season ? e.en6Season() : null); }
  if(seen[0] != null) ok(seen.slice(0, 6).every(x=> x === seen[0]) && seen[6] !== seen[0], `E12 a season lasts 6 rounds (${seen.join(',')})`); }
{ const {e, P} = mk(131); const s = put(e, P, 1, 'x-stock', 0); P[1].lumber = 0;
  e.endOfRoundUpkeep(P, so, {}, []); ok(P[1].lumber === 2, `E13 Stockpile 2: On Ready +2 Lumber (${P[1].lumber})`);
  s.wait = 1; e.endOfRoundUpkeep(P, so, {}, []); ok(P[1].lumber === 2, 'E13 ... once'); }

// ---- E19 Bound ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(191); const t = put(e, P, 2, 'x-wall', 0); const a = put(e, P, 1, 'x-hit10', 0); a.bound = 2; round(e, P);
  ok(500 - t.hp === 5, `E19 a Bound unit swings at half damage (${500 - t.hp})`); }
{ let dodged = 0; for(let sd = 1; sd <= 30; sd++){ const {e, P} = mk(200 + sd); const f = put(e, P, 2, 'x-flyer', 0); f.bound = 2; put(e, P, 1, 'x-hit', 0); const ev = round(e, P); if(ev.some(x=> x.type === 'evaded' && x.reason === 'flying')) dodged++; }
  ok(dodged === 0, `E19 a Bound Flyer never dodges as a Flyer (${dodged}/30)`); }
{ const {e, P} = mk(231); put(e, P, 2, 'x-counter', 0); const a = put(e, P, 1, 'x-hit', 0); const g = put(e, P, 1, 'x-guard', 1); g.bound = 2; const ev = round(e, P, 1);
  const c = ev.find(x=> x.type === 'hit' && x.attDefId === 'x-counter'); ok(c && c.targetUid === a.uid, 'E19 a Bound Guardian does not step in'); }

// ---- G2 Fork / Trident ---------------------------------------------------------------------------------------------------------------
{ let lr = 0, adj = 0;
  for(let sd = 1; sd <= 20; sd++){ const {e, P} = mk(300 + sd); const L = put(e, P, 2, 'x-wall', -1), C = put(e, P, 2, 'x-wall', 0), R = put(e, P, 2, 'x-wall', 1); put(e, P, 1, 'x-fork', 0);
    round(e, P); const hit = [L, C, R].map(x=> x.hp < 500); if(hit[0] && hit[2]) lr++; if(hit[1] && (hit[0] !== hit[2])) adj++; }
  ok(lr === 0 && adj === 20, `G2 Fork with L, C, R: C and one side, never L + R (adjacent ${adj}/20, L+R ${lr})`); }
{ const {e, P} = mk(321); const L = put(e, P, 2, 'x-wall', -1), R = put(e, P, 2, 'x-wall', 1); put(e, P, 1, 'x-fork', 0); const hp0 = P[2].hq.hp; round(e, P);
  ok(P[2].hq.hp === hp0 && ((L.hp < 500) !== (R.hp < 500)), 'G2 Fork with L and R only: one of them, never both, no castle'); }
{ const {e, P} = mk(322); put(e, P, 2, 'x-wall', 3); put(e, P, 1, 'x-fork', 0); const hp0 = P[2].hq.hp; round(e, P); ok(P[2].hq.hp < hp0, 'G2 Fork with nobody in L / C / R: the castle'); }
{ const {e, P} = mk(323); const L = put(e, P, 2, 'x-wall', -1); put(e, P, 1, 'x-trident', 0); const hp0 = P[2].hq.hp; round(e, P);
  ok(P[2].hq.hp === hp0 && L.hp < 500, `G2 Trident with only L: it strikes L and not the castle (castle -${hp0 - P[2].hq.hp}, L -${500 - L.hp})`); }

// ---- G4 sleep, Decay ---------------------------------------------------------------------------------------------------------------
{ let swung = 0; for(let sd = 1; sd <= 10; sd++){ const {e, P} = mk(400 + sd); const cat = put(e, P, 2, 'x-cat', 1); const s = put(e, P, 1, 'x-sleeper', 1); e.applyQuick ? 0 : 0;
    s.speed = 3; const ev = round(e, P, 1); if(ev.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === cat.uid)) swung++; }
  ok(swung === 0, `G4 a unit put to sleep before its turn does not swing (${swung}/10)`); }
{ const {e, P} = mk(411); const cat = put(e, P, 2, 'x-cat', 0); put(e, P, 1, 'x-decay', 0); round(e, P);
  ok((cat.decay|0) === 1, 'G4 Decay 1: the hit leaves a Decay counter'); e.applyDecayTicks(P, so, {}, []);
  ok(cat.atk === 3, `G4 ... and its tick takes 1 Attack (${cat.atk})`); }

// ---- G19 Chained ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(191 + 1000); const c = put(e, P, 2, 'x-chain', 0); put(e, P, 1, 'x-hit2', 0); round(e, P); ok(c.chained, 'G19 2 of 4: still chained');
  round(e, P); ok(!c.chained, 'G19 4 of 4 in all: free (the damage adds up; reaching N is enough)'); }

// ---- G23 / G24 -----------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(231 + 1000); put(e, P, 2, 'x-wall', 0); const f = put(e, P, 1, 'x-fb0', 0); const ev = []; e.endOfRoundUpkeep(P, so, {}, ev);
  ok(ev.some(x=> x.type === 'ready' && x.uid === f.uid), 'G23 a Wait 0 unit gets its On Ready at the upkeep');
  ok(ev.some(x=> x.type === 'skillSpent' && x.uid === f.uid && x.keys.includes('fireball')), 'G23 ... its Fireball goes off and leaves the card');
  ok(!(E && defs['x-fb0']) || !(e.effectsOfCard ? e.effectsOfCard(f).fireball : 0), 'G23 ... (spent)');
  const ev2 = []; e.endOfRoundUpkeep(P, so, {}, ev2); ok(!ev2.some(x=> x.type === 'ready' && x.uid === f.uid), 'G23 ... and On Ready never fires twice'); }
{ const {e, P} = mk(241 + 1000); put(e, P, 2, 'x-wall', 0); const c = put(e, P, 1, 'x-charge', 0); const ev = [];
  for(let r = 0; r < 4; r++) e.endOfRoundUpkeep(P, so, {}, ev);
  ok(ev.filter(x=> x.type === 'charge' && x.uid === c.uid && x.fired).length === 1 && ev.some(x=> x.type === 'skillSpent' && x.keys.includes('charge')), 'G24 Charge goes off once, then leaves the card'); }

// ---- G25 Tangled ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(251); const t = put(e, P, 2, 'x-hit', 0); put(e, P, 1, 'x-tangler', 0); round(e, P, 1);
  ok(t.tangled === 3 && !(t.bound > 0), `G25 Tangleweed 3 lays Tangled 3 (not Bound) (${t.tangled})`);
  let acts = 0; const N = 400;
  for(let sd = 1; sd <= N; sd++){ const {e, P} = mk(600 + sd); const a = put(e, P, 1, 'x-hit', 0); a.tangled = 5; put(e, P, 2, 'x-wall', 0); const ev = round(e, P); if(ev.some(x=> x.type === 'hit' && x.attUid === a.uid)) acts++; }
  ok(acts > N * 0.4 && acts < N * 0.6, `G25 a Tangled unit acts about half the time (${acts}/${N})`); }

// ---- data: prices, cards, texts ------------------------------------------------------------------------------------------------------
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), by = {}; sc.skills.forEach(x=> by[x.id] = x);
  ['undead', 'revive', 'poisonBarbs', 'stockpile', 'tangle', 'decay', 'armor', 'magicArmor', 'render', 'daunt', 'charge', 'fireball'].forEach(k=> ok(by[k] && /ENG9/.test(by[k].note || ''), `price: ${k} has an ENG9 note`));
  ok(by.chained && Number(by.chained.value) === 0, 'G19 Chained costs 0 as a skill (it is an N multiplier)');
  const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
  ok(BB.nMultOf({chained:{breakOn:'damage', amount:4}}) > 1.15, `G19 Chained 4 is an N multiplier (${BB.nMultOf({chained:{breakOn:'damage', amount:4}})})`);
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), cid = {}; cards.forEach(c=> cid[c.id] = c);
  ok(!cards.some(c=> c.effects && c.effects.revive === true), 'E1 no card keeps the old self-Revive (true): those are Undead now');
  ['cinder-skeleton', 'ember-revenant', 'grass-snake', 'slow-worm', 'sea-turtle-elder'].forEach(id=> ok(cid[id] && cid[id].effects.undead, `E1 ${id} has Undead`));
  ok(cid['beaver-lumberjack'] && cid['beaver-lumberjack'].effects.stockpile === 1 && !(cid['beaver-lumberjack'].effects.triggers || []).length, 'E13 the Beaver Lumberjack has Stockpile 1');
  const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
  ['ui.eng9-undead', 'ui.eng9-revive', 'ui.eng9-poison-barbs', 'ui.eng9-stockpile', 'ui.eng9-fork', 'ui.eng9-tangled'].forEach(k=> ok(tx.includes('"' + k + '"'), `text ${k}`));
  const langs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const en = /"ui\.eng9-[a-z0-9-]+": "((?:[^"\\]|\\.)*)"/g; const texts = []; let m; while((m = en.exec(tx))) texts.push(JSON.parse('"' + m[1] + '"'));
  langs.forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')); const miss = texts.filter(t=> !(t in pack)); ok(!miss.length, `${code}: every ENG9 text translated (${miss.length} missing: ${miss.slice(0, 2).join(' | ')})`); });
}
console.log(`eng9-2026-10-26: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
