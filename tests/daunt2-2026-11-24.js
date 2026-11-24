#!/usr/bin/env node
// 2026-11-24 (package DAUNT2, owner 11-24 23:21 / 23:25 / 23:30):
//   1. Scare -> Daunt (same N) on Yeti, White Dragon, Lurking Dread, Frillneck Duelist (Level 3), Ashmantle Fiend, Whale Shark; Scare on no card;
//   2. Intimidate N: the enemy facing it (its own column) attacks for N less while it stands, Ready or not; Majesty's machinery at reach 0;
//      the biggest of Intimidate and Majesty counts; never below 0; Booming Bittern Scare 1 -> Intimidate 2; New! on Map 6 (its first map);
//   3. its price and delivery; 4. the poison attack label is green, Poison Powder's 🍄 is tinted green;
//   5. Puffball's Bloom needs an enemy that died of poison (Bloom condition 'poisonkill'), not any kill;
//   6. Corrode's texts say what it does; 7. Keen Sense ignores Evasive's dodge (camouflage) on grounded units; 8. texts in the packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'd2-int2':   U('d2-int2', {intimidate:2}),
  'd2-int2w':  U('d2-int2w', {intimidate:2}, {wait:5}),
  'd2-int1':   U('d2-int1', {intimidate:1}),
  'd2-int3':   U('d2-int3', {intimidate:3}),
  'd2-int9':   U('d2-int9', {intimidate:9}),
  'd2-maj1':   U('d2-maj1', {majesty:1}),
  'd2-maj2':   U('d2-maj2', {majesty:2}),
  'd2-maj3':   U('d2-maj3', {majesty:3}),
  'd2-wall':   U('d2-wall', {}, {wait:9}),
  'd2-hit5':   U('d2-hit5', {}, {attack:5}),
  'd2-puff':   U('d2-puff', {poisonPowder:3, bloomCopy:{when:['wet', 'poisonkill'], mode:'and'}}, {health:200}),
  'd2-pkill':  U('d2-pkill', {bloomCopy:{when:['wet', 'poisonkill'], mode:'and'}}, {attack:9, health:200}),
  'd2-kill':   U('d2-kill', {bloomCopy:{when:['wet', 'kill'], mode:'and'}}, {attack:9, health:200}),
  'd2-frail':  U('d2-frail', {}, {health:4, wait:9}),
  'd2-nose':   U('d2-nose', {keenSense:true}, {attack:1}),
  'd2-plain':  U('d2-plain', {}, {attack:1}),
  'd2-eva':    U('d2-eva', {evasive:true}, {health:9999, wait:99}),
  'd2-evafly': U('d2-evafly', {evasive:true, flying:true}, {health:9999, wait:99}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
// A = [[id, side]...] for player 1, B for player 2 (open mode: the first card is centre, 'left' / 'right' the slot beside)
function fight(A, B, rounds, rules, seed){ const {e, P} = mk(seed, rules); const sp = []; A.forEach(([id, s])=> e.debugSpawnCard(P, so, 1, id, s, {}, sp)); B.forEach(([id, s])=> e.debugSpawnCard(P, so, 2, id, s, {}, sp));
  const ev = []; for(let r = 1; r <= (rounds || 1); r++){ e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); } return {e, P, ev}; }
const swing = (f, id)=>{ const a = byDef(f.P[1], id); const h = f.ev.find(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === a.uid); return h ? h.dmg : null; };

// ================= 2. Intimidate N =================
ok(swing(fight([['d2-hit5', 'center']], [['d2-wall', 'center']]), 'd2-hit5') === 5, '2. control: a 5-Attack swing hits for 5');
ok(swing(fight([['d2-hit5', 'center']], [['d2-int2', 'center']]), 'd2-hit5') === 3, '2. facing an Intimidate 2 unit it hits for 3');
ok(swing(fight([['d2-hit5', 'center']], [['d2-int2w', 'center']]), 'd2-hit5') === 3, '2. a Waiting Intimidate unit cuts too (no Ready condition)');
{ // the column beside: Intimidate does nothing there, Majesty (reach 1) does
  const fi = fight([['d2-wall', 'center'], ['d2-hit5', 'right']], [['d2-int2', 'center']]), fm = fight([['d2-wall', 'center'], ['d2-hit5', 'right']], [['d2-maj2', 'center']]);
  ok(swing(fi, 'd2-hit5') === 5 && swing(fm, 'd2-hit5') === 3, `2. its own column only: the unit beside swings for 5 (Majesty 2 there: ${swing(fm, 'd2-hit5')})`); }
ok(swing(fight([['d2-hit5', 'center']], [['d2-int1', 'center'], ['d2-maj3', 'right']]), 'd2-hit5') === 2, '2. Intimidate 1 + Majesty 3 beside: the biggest (3) counts, not 4');
ok(swing(fight([['d2-hit5', 'center']], [['d2-int3', 'center'], ['d2-maj1', 'right']]), 'd2-hit5') === 2, '2. Intimidate 3 + Majesty 1 beside: 3, not stacked');
{ const d = swing(fight([['d2-hit5', 'center']], [['d2-int9', 'center']]), 'd2-hit5'); ok(!(d > 0), `2. never below 0 (Intimidate 9 vs 5 Attack: ${d})`); }
{ const f = fight([['d2-hit5', 'center']], [['d2-int2', 'center']]), a = byDef(f.P[1], 'd2-hit5'); ok(f.e.chokeOf(a) === 2, '2. it rides on chokeOf (the engine API reads 2)'); }

// ================= 1. the cards =================
const cards = J('canonical/cards.json'), by = id=> cards.find(c=> c.id === id);
const scareIn = c=> /"scare"/.test(JSON.stringify([c.effects || {}, c.levelSkills || {}, c.levelBonus || {}]));
ok(!cards.some(scareIn), '1. no card carries Scare (effects, levelSkills, levelBonus)');
const WANT = {yeti: 2, 'white-dragon': 3, 'lurking-dread': 2, 'ashmantle-fiend': 2, 'whale-shark': 1};
Object.entries(WANT).forEach(([id, v])=> ok(by(id).effects.daunt === v, `1. ${id}: Daunt ${v} (was Scare ${v})`));
ok(JSON.stringify(by('frillneck-duelist').levelSkills) === JSON.stringify({3: {daunt: 1}}), '1. Frillneck Duelist: Daunt 1 at Level 3');
ok(by('yeti').levelBonus['4'].skills.daunt === 3 && by('yeti').levelBonus['10'].skills.daunt === 4 && by('white-dragon').levelBonus['10'].skills.daunt === 15, '1. the level steps carry Daunt at the same N');
{ const b = by('booming-bittern'); ok(b.effects.intimidate === 2 && b.effects.enfeeble === 1 && !b.effects.scare, '2. Booming Bittern: Intimidate 2 and Enfeeble 1');
  ok(b.levelBonus['7'].skills && b.levelBonus['7'].skills.intimidate === 3, '2. Booming Bittern: Intimidate 3 at Level 7 (was Scare 2)');
  ok(!cards.some(c=> c.id !== 'booming-bittern' && /"intimidate"/.test(JSON.stringify([c.effects || {}, c.levelSkills || {}, c.levelBonus || {}]))), '2. no other card has Intimidate'); }
const app = rd('arena_app.js'), eng = rd('bramblewood-engine.js'), tpl = rd('arena_template.html');
{ const m = /const MAP_FOCUS_SKILLS = (\{[^;]*?\});/.exec(app), T = m ? Function('return ' + m[1])() : {};
  ok((T[6] || []).includes('intimidate') && !Object.keys(T).some(k=> k !== '6' && T[k].includes('intimidate')), '2. Intimidate is on Map 6\'s row of the map skill table only');
  ok(J('canonical/card-obtain-maps.json').maps['booming-bittern'] === 6, '2. Map 6 is Booming Bittern\'s first map');
  // owner 11-25 00:13 ("daunt can stay, at eeyrie heights"): Daunt is on Map 11's row (Eyrie Heights, m10: Golden Eagle), and no card on a main list of
  // Maps 0-10 carries plain Daunt (Daunt {lasts} is Weaken / Stench, other skills); the main ids in road order as REF_DECK_SETS mainOf
  ok((T[11] || []).includes('daunt'), '9. Daunt is on Map 11\'s row of the map skill table');
  const pools = J('canonical/map-pools.json').maps, early = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7'];
  const plainDaunt = c=> [c.effects || {}].concat(Object.values(c.levelSkills || {}), Object.values(c.levelBonus || {}).map(r=> r.skills || {})).some(x=> x.daunt != null && !(x.daunt && typeof x.daunt === 'object' && x.daunt.lasts));
  const first = early.filter(m=> ((pools[m] || {}).cards || []).some(id=> by(id) && plainDaunt(by(id))));
  ok(!first.length && ((pools.m10 || {}).cards || []).includes('golden-eagle-diver') && plainDaunt(by('golden-eagle-diver')), `9. no earlier main map shows Daunt first (${first}); Golden Eagle carries it on Map 11`); }

// ================= 3. price, delivery, registry, icon =================
{ const sk = J('canonical/skill-costs.json').skills.find(s=> s.id === 'intimidate'); ok(sk && sk.scale === 'n' && sk.value > 0 && sk.pow > 0 && /Majesty/.test(sk.note || ''), '3. Intimidate has a price (scale n, from Majesty)');
  const SC = require(path.join(ROOT, 'tools/skill_costs.js')).make(J('canonical/skill-costs.json')); ok(SC.cardS({intimidate:2}).S > SC.cardS({intimidate:1}).S && !SC.cardS({intimidate:2}).missing.length, '3. the budget prices it'); }
ok(J('canonical/skill-delivery.json').delivery.intimidate === 'none', '3. delivery none (an aura, no hit)');
ok(/key:'intimidate', category:'passive', label:TX\('ui\.skn-intimidate'\)/.test(app) && /intimidate:'👺'/.test(app), '3. registry entry and its icon');
ok(J('tools/emoji/used.json').some(x=> x.key === '1f47a'), '3. 👺 is in the bundled emoji sets');
ok(/e\.intimidate && d === 0/.test(eng) && /DAUNT2/.test(eng), '3. the engine: majestyCut at reach 0 for Intimidate');

// ================= 4. poison colour =================
{ const r = /\.card-tile \.atk\.atk-poison\{([^}]*)\}/.exec(tpl); ok(r && !/dcaaff|52,24,76|190,130,240/i.test(r[1]) && /#[0-9a-f]{6}/i.test(r[1]), '4. the poison attack label is no longer purple');
  ok(/DAUNT2[^\n]*purple[^\n]*reserved/i.test(tpl), '4. the purple plate is kept as a reserved note');
  ok(/\.ico-poisonpowder > \*[^{]*\{[^}]*hue-rotate/.test(tpl) && /data-ui19-skill="poisonPowder"\][^{]*\{|data-ui19-skill="poisonPowder"\] \.ui19-sk-ico/.test(tpl) && /\.bk-ico\[data-sk="poisonPowder"\]/.test(tpl), '4. Poison Powder\'s 🍄 is tinted in pips, skill tiles and the Codex');
  ok(/class="bk-ico" data-sk=/.test(app), '4. the Codex icon names its skill'); }

// ================= 5. Puffball blooms only on a poison kill =================
{ const pb = by('puffball-bombardier'); ok(JSON.stringify(pb.effects.bloomCopy) === JSON.stringify({when:['wet', 'poisonkill'], mode:'and'}), '5. Puffball: Bloom (Wet & Poison kill)'); }
const bloomed = (f, id)=> f.ev.some(x=> x.type === 'bloom' && x.defId === id && x.side === 'A');
{ const f = fight([['d2-puff', 'center']], [['d2-frail', 'center']], 4, {wet:true});
  ok(!byDef(f.P[2], 'd2-frail') && f.ev.some(x=> x.type === 'poisonTick') && bloomed(f, 'd2-puff'), '5. its Poison Powder kills the enemy: it blooms'); }
{ const f = fight([['d2-pkill', 'center']], [['d2-frail', 'center']], 4, {wet:true});
  ok(!byDef(f.P[2], 'd2-frail') && !bloomed(f, 'd2-pkill'), '5. a kill by a hit does not bloom a Poison kill Bloom'); }
{ const f = fight([['d2-kill', 'center']], [['d2-frail', 'center']], 4, {wet:true});
  ok(bloomed(f, 'd2-kill'), '5. control: a plain Kill Bloom still blooms on a hit kill'); }
ok(/k === 'poisonkill' \? !!c\.bloomPoisonKill/.test(eng) && /poisonkill: *0\.5/.test(rd('bramblewood-budget.js')), '5. engine condition and its budget odds (as Kill)');

// ================= 7. Keen Sense vs Evasive (camouflage) =================
const evaded = (att, tgt, seed)=>{ const f = fight([[att, 'center']], [[tgt, 'center']], 30, {}, seed), a = byDef(f.P[1], att); return f.ev.filter(x=> x.type === 'evaded' && x.attUid === a.uid).length; };
ok(evaded('d2-plain', 'd2-eva', 3) >= 5, '7. control: an Evasive unit dodges a plain attacker');
ok(evaded('d2-nose', 'd2-eva', 3) === 0, '7. Keen Sense never misses a grounded Evasive unit');
ok(evaded('d2-nose', 'd2-evafly', 3) >= 5, '7. a flying Evasive unit still dodges it (the nose finds grounded units)');
ok(/keenSense\b[^\n]*evasive|keenNoseVs/.test(eng) && /SK1_HIDING/.test(eng), '7. the engine names it');

// ================= 6 / 8. texts =================
const TX = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const KEYS = ['ui.skn-intimidate', 'ui.sk-intimidate', 'ui.sk-intimidate-codex', 'ui.daunt2-keen-sense', 'ui.daunt2-keen-pip', 'ui.daunt2-keen-codex', 'ui.cards1-corrode',
  'ui.daunt2-corrode-codex', 'ui.daunt2-corrode-st', 'ui.daunt2-corrode-ls', 'ui.daunt2-bl-cond-poisonkill', 'ui.eng19-bc-poisonkill'];
KEYS.forEach(k=> ok(typeof TX[k] === 'string' && TX[k].length, `8. text ${k}`));
ok(/less Attack/.test(TX['ui.cards1-corrode']) && /less Attack/.test(TX['ui.daunt2-corrode-codex']), '6. Corrode says what it does (less Attack)');
ok(/codexNote:TX\('ui\.daunt2-corrode-codex'\)/.test(app) && /TX\('ui\.daunt2-corrode-st'\)/.test(app) && /TX\('ui\.daunt2-corrode-ls', \{n\}\)/.test(app), '6. Corrode: Codex note, keyword note and live status line');
ok(/codexNote:TX\('ui\.daunt2-keen-codex'\)/.test(app) && /TX\('ui\.daunt2-keen-pip'\)/.test(app) && /evasive: \[[^\]]*'keenSense'/.test(app), '7. Keen Sense texts; Evasive is answered by Keen Sense in the Codex');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(l=>{ const pk = J(`lang/${l}.json`); ok(KEYS.every(k=> pk[TX[k]]), `8. translated (${l})`); });

console.log(`daunt2: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
