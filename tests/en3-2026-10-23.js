#!/usr/bin/env node
// 2026-10-23 (package EN3): the owner's 19:27 #2-#9 and #19.
//   #5 Bleed takes its damage first and loses the stack after (the fade at the round's end); Poison's tick was already damage-then-drop in
//      the engine, and the board now drops the stack after the damage shows.
//   #6 the Bleed / Poison family priced up a tenth; #9 Bulwark 9; the re-fit (raises applied, drops held, flagged merged).
//   #7 a Boomerang throws on a miss (Blind, the dark, a dodge) and the throw plays; it comes back next round.
//   #8 a Guardian guarding the Guardian that stepped in takes the swing (one hop); #19 no guard line.
//   #2 Guardian never guards the bramble (its text); #3 Rampart and Bramble Armor; #4 Shore Up proposals (decisions only).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-hit':   {id:'x-hit', name:'Hitter', attack:1, health:100, wait:0, cost:0, effects:{}},
  'x-hit2':  {id:'x-hit2', name:'Hitter2', attack:2, health:100, wait:0, cost:0, effects:{}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-waitb': {id:'x-waitb', name:'Waiter', attack:1, health:100, wait:9, cost:0, effects:{}},
  'x-fester':{id:'x-fester', name:'Fester', attack:0, health:500, wait:9, cost:0, effects:{festering:true}},
  'x-boom':  {id:'x-boom', name:'Boom', attack:3, health:30, wait:0, cost:0, effects:{boomerang:true}},
  'x-evade': {id:'x-evade', name:'Evader', attack:0, health:500, wait:9, cost:0, effects:{evasive:true}},
  'x-guard': {id:'x-guard', name:'Guard', attack:0, health:100, wait:9, cost:0, effects:{guardian:true}},
  'x-sneak': {id:'x-sneak', name:'Sneak5', attack:5, health:100, wait:0, cost:0, effects:{stealth:true}},
  'x-sneak1':{id:'x-sneak1', name:'Sneak1', attack:1, health:100, wait:0, cost:0, effects:{stealth:true}},
  'x-supreme':{id:'x-supreme', name:'Supreme5', attack:5, health:100, wait:0, cost:0, effects:{stealth:true, supreme:true}},
  'x-ramp':  {id:'x-ramp', name:'Ramp', attack:0, health:50, wait:9, cost:0, effects:{rampart:true}},
  'x-barmor':{id:'x-barmor', name:'BArmor', attack:0, health:50, wait:9, cost:0, effects:{brambleArmor:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };

// ---- #5 Bleed: damage first, then the stack ---------------------------------------------------------------------------------
{ const {e, P} = mk(); const A = spawn(e, P, 1, 'x-hit'); spawn(e, P, 2, 'x-wall'); A.bleed = 3; const hp0 = A.hp, ticks = [];
  for(let r = 0; r < 4; r++){ const ev = round(e, P); ev.filter(x=> x.type === 'bleedTick' && x.uid === A.uid).forEach(x=> ticks.push(x.dmg));
    if(r === 0){ const iT = ev.findIndex(x=> x.type === 'bleedTick'), iF = ev.findIndex(x=> x.type === 'bleedFade'); ok(iT >= 0 && iF > iT && ev[iF].atEnd, `round 1: the bleed tick comes before the fade (tick at ${iT}, fade at ${iF}, atEnd)`); } }
  ok(ticks.join(',') === '3,2,1' && hp0 - A.hp === 6 && A.bleed === 0, `Bleed 3 on a unit that acts each round: ${ticks.join(',')} (6 in all; was 2,1), stack ${A.bleed}`); }
// A stack that lands after the unit's last action this round is not faded that round: it bleeds in full first (2, then 1; before EN3: 1)
{ const defs2 = Object.assign({}, defs, {'x-bleeder': {id:'x-bleeder', name:'Bleeder', attack:1, health:100, wait:0, cost:0, effects:{bleed:2}}});
  const e = E.makeSimEngine(defs2, E.mulberry32(5), {recordEvents:true, battleMode:'open'}), P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  const A = spawn(e, P, 1, 'x-hit'), Bl = spawn(e, P, 2, 'x-bleeder'); const ev1 = round(e, P, 1);
  ok(A.bleed === 2 && !ev1.some(x=> x.type === 'bleedTick' && x.uid === A.uid) && !ev1.some(x=> x.type === 'bleedFade' && x.uid === A.uid), `round 1: A swung, then was cut (Bleed ${A.bleed}); no fade this round`);
  Bl.hp = 0; e.removeDeadCards(P, so, {}, {}, []); spawn(e, P, 2, 'x-wall');
  const ticks = []; for(let r = 0; r < 3; r++) round(e, P, 1).filter(x=> x.type === 'bleedTick' && x.uid === A.uid).forEach(x=> ticks.push(x.dmg));
  ok(ticks.join(',') === '2,1' && A.bleed === 0, `a fresh Bleed 2 bleeds in full first: ${ticks.join(',')}`); }
// A Waiting unit can't bleed on its own actions, but its stack still wears down once a round
{ const {e, P} = mk(); const W = spawn(e, P, 1, 'x-waitb'); spawn(e, P, 2, 'x-wall'); W.bleed = 2; const left = [];
  for(let r = 0; r < 3; r++){ round(e, P); left.push(W.bleed); }
  ok(left.join(',') === '1,0,0' && W.hp === 100, `a Waiting unit's Bleed 2 wears 1 a round (${left.join(',')}), no damage`); }
// Festering still holds it
{ const {e, P} = mk(); const A = spawn(e, P, 1, 'x-hit'); spawn(e, P, 2, 'x-fester'); A.bleed = 2; round(e, P); round(e, P);
  ok(A.bleed === 2 && A.hp === 96, `Festering holds Bleed: stack ${A.bleed}, took ${100 - A.hp}`); }
// Poison: the engine's tick is the whole stack, then -1 (it was already)
{ const {e, P} = mk(); const A = spawn(e, P, 1, 'x-hit'); spawn(e, P, 2, 'x-wall'); A.poison = 3; const d = [];
  for(let r = 0; r < 4; r++) round(e, P).filter(x=> x.type === 'poisonTick').forEach(x=> d.push(x.dmg + (x.decay ? '-' : '')));
  ok(d.join(',') === '3-,2-,1-' && A.poison === 0, `Poison 3: ticks ${d.join(',')} (damage, then the stack drops)`); }

// ---- #7 Boomerang thrown on a miss --------------------------------------------------------------------------------------------
{ let got = null; for(let s = 1; s <= 60 && !got; s++){ const {e, P} = mk(s); const B = spawn(e, P, 1, 'x-boom'); B.blind = 3; const W = spawn(e, P, 2, 'x-wall'); const ev = round(e, P);
    if(ev.some(x=> x.type === 'blindMiss' && x.attUid === B.uid)) got = {e, P, B, W, ev}; }
  ok(got, 'a seed with a Blind miss');
  if(got){ const {e, P, B, W, ev} = got; const bt = ev.find(x=> x.type === 'boomerangThrow');
    ok(bt && bt.miss && bt.uid === B.uid && bt.targetUid === W.uid && ev.indexOf(bt) > ev.findIndex(x=> x.type === 'blindMiss'), 'a Blind miss: boomerangThrow {miss} after the miss, naming the target');
    ok(P[1].boomerangs.length === 1 && P[1].boomerangs[0].targetUid === W.uid && B.boomerangOut, 'the boomerang is out (was: no throw on a Blind miss)');
    B.blind = 0; const w0 = W.hp, ev2 = round(e, P); ok(ev2.some(x=> x.type === 'boomerangReturn') && w0 - W.hp >= 3, `next round it comes back and hits the target (${w0 - W.hp})`); } }
{ let got = null; for(let s = 1; s <= 60 && !got; s++){ const {e, P} = mk(s); const B = spawn(e, P, 1, 'x-boom'); const V = spawn(e, P, 2, 'x-evade'); const ev = round(e, P);
    if(ev.some(x=> x.type === 'evaded' && x.attUid === B.uid)) got = {P, B, V, ev}; }
  ok(got && got.ev.some(x=> x.type === 'boomerangThrow' && x.miss && x.targetUid === got.V.uid) && got.P[1].boomerangs.length === 1, 'a dodged swing throws too (boomerangThrow {miss})'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-boom'); spawn(e, P, 2, 'x-wall'); const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'boomerangThrow'), 'a landed throw has no extra event (its hit plays the throw)'); }

// ---- #8 Guardian guarding a Guardian: REVERTED 2026-10-23 by package EN4 (owner 22:23 #9: "Guardian shouldn't intercept an intercepting
// guardian."). One Guardian steps in, no hop, no guardChain; tests/en4-2026-10-23.js checks the rule. Kept here: one Guardian, as before.
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit2'); const T = spawn(e, P, 2, 'x-wall'), G1 = spawn(e, P, 2, 'x-guard');
  const h = round(e, P).find(x=> x.type === 'hit' && x.guardianRedirect); ok(h && h.targetUid === G1.uid && h.guardChain == null, 'one Guardian: as before, no chain'); }

// ---- #3 Rampart and Bramble Armor ------------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak'); const R = spawn(e, P, 2, 'x-ramp'); const hq0 = P[2].hq.hp, ev = round(e, P);
  const r = ev.find(x=> x.type === 'rampart'), hq = ev.find(x=> x.type === 'hitHQ');
  ok(r && r.uid === R.uid && r.dmg === 3 && r.bramble === 2 && R.hp === 47 && hq0 - P[2].hq.hp === 2 && hq && hq.dmg === 2, `Rampart: a 5 on the bramble is 3 on the unit, 2 on the bramble (unit ${50 - R.hp}, bramble ${hq0 - P[2].hq.hp})`);
  ok(ev.indexOf(r) < ev.indexOf(hq), 'the rampart event comes with the hit (before its hitHQ)'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak1'); const R = spawn(e, P, 2, 'x-ramp'); const hq0 = P[2].hq.hp; round(e, P);
  ok(R.hp === 49 && hq0 === P[2].hq.hp, 'Rampart: a 1 is all the unit\'s (ceil of a half)'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak'); const B = spawn(e, P, 2, 'x-barmor'); const hq0 = P[2].hq.hp, ev = round(e, P);
  ok(hq0 - P[2].hq.hp === 4 && ev.some(x=> x.type === 'brambleArmor' && x.uid === B.uid), `Bramble Armor: a 5 is 4 (${hq0 - P[2].hq.hp})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak'); spawn(e, P, 2, 'x-barmor'); spawn(e, P, 2, 'x-barmor', 'right'); const hq0 = P[2].hq.hp; round(e, P);
  ok(hq0 - P[2].hq.hp === 4, `two Bramble Armor units: still 1 off (${hq0 - P[2].hq.hp})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak'); const R = spawn(e, P, 2, 'x-ramp'); spawn(e, P, 2, 'x-barmor', 'right'); const hq0 = P[2].hq.hp; round(e, P);
  ok(R.hp === 47 && hq0 - P[2].hq.hp === 1, `both: 5 is 3 on the Rampart, 2 - 1 = 1 on the bramble (${50 - R.hp}, ${hq0 - P[2].hq.hp})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-supreme'); const R = spawn(e, P, 2, 'x-ramp'); spawn(e, P, 2, 'x-barmor', 'right'); const hq0 = P[2].hq.hp; round(e, P);
  ok(R.hp === 50 && hq0 - P[2].hq.hp === 5, 'Supreme crushes both'); }
// two Ramparts: the one nearest the attacker's column
{ const {e, P} = mk(); const S = spawn(e, P, 1, 'x-sneak', 'right'); const R1 = spawn(e, P, 2, 'x-ramp', 'left'), R2 = spawn(e, P, 2, 'x-ramp', 'right'); round(e, P);
  const near = Math.abs(R1.slot - S.slot) <= Math.abs(R2.slot - S.slot) ? R1 : R2, far = near === R1 ? R2 : R1;
  ok(near.hp === 47 && far.hp === 50, `two Ramparts: the one nearest the attacker's column (slots ${S.slot}: ${R1.slot}/${R2.slot})`); }
// Guardian does not cover the bramble (#2): a stealthy hit on the bramble with a Guardian on the board is the bramble's
{ const {e, P} = mk(); spawn(e, P, 1, 'x-sneak'); const G = spawn(e, P, 2, 'x-guard'); const hq0 = P[2].hq.hp; round(e, P);
  ok(hq0 - P[2].hq.hp === 5 && G.hp === 100, 'Guardian never guards the bramble'); }

// ---- #6 / #9 prices, the re-fit, the new skills' prices and the card --------------------------------------------------------
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')), sk = id=> sc.skills.find(r=> r.id === id), ac = id=> sc.actions.find(r=> r.id === id);
  const want = {poison:2.6, bleed:2.6, gash:1.6, venomous:3.1, poisonBolt:3.1, poisonGas:3.1, rabid:5.1, proliferate:6.1, venomMaster:5.1, perforate:3.6};
  // 2026-10-24 (package EN5, owner BP-1): Bleed and Poison are priced by the measured power curve now (3.6 x N^0.6, 3.0 x N^0.7); EN3's 2.6 is their prevValueEN5
  want.poison = 3; want.bleed = 3.6;
  ok(Object.keys(want).every(k=> sk(k) && sk(k).value === want[k] && sk(k).prevValueEN3 != null) && sk('bleed').prevValueEN5 === 2.6 && sk('poison').prevValueEN5 === 2.6, 'the Bleed / Poison family up a tenth (Bleed / Poison re-priced by EN5): ' + Object.keys(want).map(k=> k + ' ' + (sk(k) || {}).value).join(', '));
  ok(ac('poison').value === 1.4 && ac('bleed').value === 1, `the actions: Poison ${ac('poison').value} (1.3), Bleed ${ac('bleed').value} (0.9)`);
  ok(sk('toxin').value === 5 && sk('detonate').value === -0.5, 'Toxin (never wears off) and Detonate are left');
  ok(sk('bulwark').value === 9 && sk('bulwark').prevValueEN3 === 6, 'Bulwark 9 (was 6)');
  ok(sk('rampart') && sk('rampart').value === 0.25 /* 2026-10-24 (EN8, owner 21:41 #5): its columns only, 0.5 -> 0.25 */ && sk('brambleArmor') && sk('brambleArmor').value === 1.1, 'Rampart 0.25 (EN8), Bramble Armor 1.1 (measured)');
  const rf = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en3-refit-2026-10-23.json'), 'utf8'));
  ok(rf.raised.length === 3 && rf.held.length === 13 && rf.flagged.includes('poison-dart-frog'), `the re-fit file: ${rf.raised.length} raised, ${rf.held.length} held, flagged ${rf.flagged}`);
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  // 2026-10-24 (package EN5): a card EN5's re-fit moved (Bleed / Poison by the measured curve) has EN5's line now
  const en5 = h=> /2026-10-24 (EN5|BAL2) re-fit|2026-10-24 BAL3 \(owner BAL2-5/.test(c(h.id).creatorNote || ''); // + BAL2 (2026-10-24): the DF-1 re-fit (Map term 0.2) moved some too // + BAL3 (2026-10-24, RELFIX): owner BAL2-5 put the ten held cards (Alley Cat, Muskrat Lodgekeeper ...) on their formula line
  ok(rf.held.every(h=> en5(h) || `${c(h.id).attack}/${c(h.id).health}` === h.from), 'the held cards keep their stats (or EN5 re-fitted them)');
  ok(rf.raised.every(h=> en5(h) || `${c(h.id).attack}/${c(h.id).health}` === h.to), 'the raised cards have their new line (or EN5\'s)');
  const fl = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/human-pass-1-flagged-2026-10-21.json'), 'utf8')); ok(fl.length >= 10 && fl.includes('poison-dart-frog'), 'the flagged list was merged, not overwritten');
  const rb = c('riverworks-bastion'); ok(rb.effects.rampart === true && rb.attack === 0 && (rb.health === 30 || /2026-10-24 BAL2 re-fit.*0\/30 -> 0\/\d+/.test(rb.creatorNote || '')), 'Riverworks Bastion: Rampart, 0/30 (or BAL2\'s re-fit of it)');
  // the owner 20:44 ("implement them in new cards"): two new cards each, awaiting their source (EN3-8), inside the budget
  const NEWC = {'dam-keeper-beaver': 'rampart', 'moat-snapper': 'rampart', 'briarback-hedgehog': 'brambleArmor', 'barkplate-beetle': 'brambleArmor'};
  Object.entries(NEWC).forEach(([id, k])=>{ const x = c(id); const bb = x && (()=>{ if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); const S2 = require(path.join(ROOT, 'tools/card_retune_2026_10_19.js')).SC; return S2.make(sc).budget(x, {level: 1}); })();
    ok(x && x.effects[k] === true && (x.awaitingSource || /RW5, owner 22:23/.test(x.creatorNote || '') /* 2026-10-23 (package RW5): placed in Maps 0-9 by tools/rw5_place_new_cards_2026_10_23.js */) && x.uuid && x.numericId && bb && bb.ok && bb.x1 <= bb.N, `new card ${id}: ${k}, awaiting its source, inside the budget (${x && x.attack}/${x && x.health}, ${bb && bb.x1} <= ${bb && bb.N})`); });
  ok(new Set(cards.map(x=> x.numericId)).size === cards.length, 'numericIds stay unique');
  const art = fs.readFileSync(path.join(ROOT, 'docs/art/new-cards-2026-10-21-briefs.md'), 'utf8').split('## Package EN3')[1] || '';
  ok(Object.keys(NEWC).every(id=> art.includes('`' + id + '`')) && (art.match(/full background/g) || []).length >= 4 && !/spiked|studded|monitor|sword|spear|blade|axe/i.test(art), 'their NightCafe prompts (a background each, none of the banned words)');
  if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools/card_retune_2026_10_19.js')).SC, T = SC.make(sc);
  const b = T.budget(rb, {level: 1}); ok(b.ok && b.S === 0.25 /* EN8: Rampart 0.25 */, `Riverworks Bastion inside the budget (2A+H+S ${b.x1} <= N ${b.N})`); }

// ---- The app, texts, docs ---------------------------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ['function en3PatchGuardPull', /* 'function en3GuardChain': removed by EN4 (2026-10-23, owner 22:23 #9) */ 'function en3BoomMissThrow', 'function en3RampartVfx', 'function en3BrambleArmorVfx', 'try{ en3Vfx(ev); }catch(e){}',
   "{key:'rampart', category:'passive'", "{key:'brambleArmor', category:'passive'", "rampart:'🚧'", "case 'rampart':", "case 'brambleArmor':", "case 'boomerangThrow':",
   /* 'en3GuardChain(ev)': EN4 */ 'EN3_STACK_DROP_MS()'].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  // #5 on the board: the poison tick shows its damage and drops the stack a beat later
  const p0 = app.indexOf('poisonBubbleBurstVfx(ev.uid);'), pt = app.slice(p0, app.indexOf("if(ev.type==='bleedTick'){", p0));
  ok(/if\(rc\) rc\.hp = Math\.max\(0, rc\.hp - ev\.dmg\);\s*updateCardHpDisplay\(ev\.uid\);\s*if\(ev\.decay\)\{ const u = ev\.uid; setTimeout/.test(pt), 'poisonTick: Health first, the stack drop later');
  // #19: the guard line is gone (the swapped guardPull draws no path)
  const gp = app.slice(app.indexOf('function en3PatchGuardPull'), app.indexOf('function en3BoomMissThrow')); // EN4 (2026-10-23): en3GuardChain is gone, so up to the next function ok(!/<path|svg/i.test(gp), 'the guard pull draws no line');
  const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
  ['ui.skn-rampart', 'ui.sk-rampart', 'ui.sk-rampart-codex', 'ui.skn-bramble-armor', 'ui.sk-bramble-armor', 'ui.sk-bramble-armor-codex', 'ui.en3-log-rampart', 'ui.en3-log-bramble-armor', 'ui.en3-log-boom-miss', 'ui.en3-float-guard-hop', 'ui.en3-float-boom-miss'].forEach(k=> ok(TXm.TEXT[k], 'TX ' + k));
  ok(/then −1 stack at the round's end/.test(TXm.TEXT['ui.st-bleed']), 'the Bleed text: −1 at the round\'s end');
  ok(/never guards the bramble/.test(app) && /\(not the bramble\)/.test(app), 'Guardian says it never guards the bramble');
  const keys = ['Rampart', 'Bramble Armor', TXm.TEXT['ui.sk-rampart'], TXm.TEXT['ui.sk-bramble-armor'], TXm.TEXT['ui.sk-rampart-codex'], TXm.TEXT['ui.sk-bramble-armor-codex'], TXm.TEXT['ui.en3-log-rampart'].replace(/^\S+ /, ''), TXm.TEXT['ui.st-bleed'], TXm.TEXT['ui.ls-bleed'], TXm.TEXT['coach.bleeding-this-card-takes-damage-every'],
    "Takes the plain attacks aimed at its adjacent allies (not the bramble)."];
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    const cn = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', code + '.json'), 'utf8'));
    ok(keys.every(k=> p[k]) && !p["Takes the plain attacks aimed at its adjacent allies."] && ['Dam-Keeper Beaver', 'Moat Snapper', 'Briarback Hedgehog', 'Barkplate Beetle'].every(k=> cn[k]), `lang ${code}: the EN3 texts and the four card names`); });
  const cat = fs.readFileSync(path.join(ROOT, 'docs/effects-catalogue.md'), 'utf8'); ok(/2026-10-23 additions \(package EN3\)/.test(cat) && /rampartShare/.test(cat) && /bleedFadeAtEnd/.test(cat), 'docs/effects-catalogue.md: EN3');
  const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8')), ids = (dec.decisions || dec.items || dec).map ? (dec.decisions || dec.items || dec).map(d=> d.id) : [];
  ok(['EN3-1', 'EN3-2', 'EN3-3', 'EN3-4', 'EN3-5', 'EN3-6', 'EN3-7', 'EN3-8'].every(i=> ids.includes(i)), 'decisions EN3-1 .. EN3-8');
  const cl = fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8'); ok(/package EN3/.test(cl.slice(0, 80000)), 'CHANGELOG: EN3 near the top'); } // 2026-10-24 (BAL2): 80000 // 2026-10-24 (EN5): 40000 (more entries above it) // 2026-10-23 (EN4): later packages' entries sit above it (was the first 6000 characters)

console.log(`en3-2026-10-23: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
