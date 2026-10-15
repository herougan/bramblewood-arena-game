#!/usr/bin/env node
// 2026-10-15 (fifth list):
//   2. "The middle slot should be visible again once you lose all your units."
//   3. "I noticed pounce does a line of damage to the enemy. Is this because of Windy instead?" (one hit, at a random enemy; its hit
//      plays as a leap at that unit, not a shot, and its look no longer rises up the column)
//   4. "I like expose. It should give a debuff 'exposed'. This unit takes +1 damage and attacks on this unit don't miss."
//   5. "Spawn shouldn't need that top right hand corner pill."
//  10. "New Skill: Bloodlust - ability idk, but I assume when it draws blood, it gets stronger."
//  11. Zeitgebers: "Diurnal - +1. At more advanced maps, Diurnal - {} ... Rename Tide and Ebb to Flood and Ebb ... Tide - {}, unique
//      from Diurnal - has two facets ... remove Swimmer for now".
//  12. The surprise challenge: lose it and the raiders run off with some money (10 up to a cap of 15 + 5 a map, at most 100).
//  14. "Remove 'Environment Card: a rule of this battlefield'".
//  15. The board's pills: state only, inside the board, no forecast, Mist on Map 0.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'ke-wall': U('ke-wall', {}, {attack:0}), 'ke-hit': U('ke-hit'), 'ke-evade': U('ke-evade', {evasive:true}, {attack:0}),
  'ke-pounce': U('ke-pounce', {pounce:2, flying:true}, {attack:0, wait:3}),
  'ke-expose': U('ke-expose', {expose:2}), 'ke-blind': U('ke-blind'),
  'ke-blood': U('ke-blood', {bloodlust:1, bleed:1}), 'ke-blood2': U('ke-blood2', {bloodlust:2}), 'ke-plain': U('ke-plain'),
  'ke-day': U('ke-day', {diurnal:true, diurnalGrant:{evasive:true, thorns:1}}), 'ke-dayplain': U('ke-dayplain', {diurnal:true}),
  'ke-night': U('ke-night', {nocturnal:true, nocturnalGrant:{attack:2, health:2, regen:1}}),
  'ke-tide': U('ke-tide', {tide:true, tideGrant:{flood:{attack:5, health:5, evasive:true}, ebb:{armor:2}}}), 'ke-tideplain': U('ke-tideplain', {tide:true}),
  'ke-moon': U('ke-moon', {fullMoon:3}), 'ke-moong': U('ke-moong', {fullMoonGrant:{regen:2}}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const fxOf = (e, c)=> e.effectsOf(c);
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');

// ---- 3. Pounce: one hit at one random enemy; the pounce event names it; the hit is a leap (pounce:true, not ranged)
for(const rules of [null, {wind:'gale'}]){
  for(let s = 1; s <= 6; s++){ const {e, P} = mk(rules, s); const ws = [-1, 0, 1].map(sl=> put(e, P, 2, 'ke-wall', sl)); if(rules) e.roundStart(P, 2, so, {}, []);
    const ev = []; const A = put(e, P, 1, 'ke-pounce', 0, ev);
    const hurt = ws.filter(c=> c.hp < c.maxHp), pe = ev.find(x=> x.type === 'pounce'), hits = ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === A.uid);
    ok(hurt.length === 1 && hurt[0].hp === 498 && hits.length === 1, `3. Pounce hits one enemy once${rules ? ' (in a Gale)' : ''} (seed ${s}: ${ws.map(c=> c.hp)})`);
    ok(pe && pe.targetUid === hurt[0].uid && hits[0].targetUid === hurt[0].uid, `3. the pounce event names the unit it hits (seed ${s})`);
    ok(hits[0].pounce === true && hits[0].ranged === false, `3. its hit plays as a leap: pounce:true, not ranged (seed ${s})`); } }
{ const fa = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-a.js'), 'utf8');
  ok(/case 'pounce': \{ const a = el\(ev\.uid\); if\(a\) M\.pounceKick\(a\); break; \}/.test(fa) && !/case 'pounce':[^\n]*pounceLeap/.test(fa), '3. the fight no longer plays the ghost column (pounceLeap); only a dust kick'); }

// ---- 4. Exposed
{ const {e, P} = mk(); const W = put(e, P, 2, 'ke-wall', 0); const X = put(e, P, 1, 'ke-expose', 0); const ev = [];
  e.debugAttack(P, so, X.uid, {}, ev); ok(W.hp === 497 && W.exposed === 2, `4. Expose 2: a landed hit leaves it Exposed for 2 hits (${W.hp}, ${W.exposed})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'expose' && x.targetUid === W.uid && x.amount === 2), '4. ...and says so (statusFx expose)');
  const ev2 = []; e.debugAttack(P, so, X.uid, {}, ev2); ok(W.hp === 493 && W.exposed === 3, `4. the next hit: +1 (3 + 1), one used, two more added (${W.hp}, ${W.exposed})`);
  ok(ev2.some(x=> x.type === 'statusFx' && x.kind === 'exposedHit' && x.targetUid === W.uid && x.amount === 1), '4. a used Exposed hit is reported with what is left (1, before this hit adds 2)'); }
{ let landed = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(null, s); const V = put(e, P, 2, 'ke-evade', 0); V.exposed = 50; const A = put(e, P, 1, 'ke-hit', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(V.hp === 496) landed++; }
  ok(landed === 30, `4. attacks at an Exposed Evasive unit never miss, +1 each (${landed}/30)`); }
{ let dodged = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(null, s); const V = put(e, P, 2, 'ke-evade', 0); const A = put(e, P, 1, 'ke-hit', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(V.hp === 500) dodged++; }
  ok(dodged > 3 && dodged < 27, `4. (without Exposed it still dodges about half: ${dodged}/30)`); }
{ let landed = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk({dark:'absolute'}, s); const V = put(e, P, 2, 'ke-wall', 0); V.exposed = 50; const A = put(e, P, 1, 'ke-blind', 0); A.blind = 3;
    e.debugAttack(P, so, A.uid, {}, []); if(V.hp < 500) landed++; }
  ok(landed === 30, `4. Blind, in Absolute darkness, still hits an Exposed unit (${landed}/30)`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'ke-wall', 0); W.exposed = 1; W.poison = 3; e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(W.exposed === 1, `4. a Poison tick is not a hit: Exposed stays (${W.exposed})`); }
ok(/function exposedTip\(n\)/.test(src) && /abadge exposed/.test(src) && /\.abadge\.exposed\{/.test(tpl), '4. an Exposed badge with its tooltip');
ok(/exposedHit/.test(fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-b.js'), 'utf8')), '4. FX.B.exposeCash plays on every Exposed hit');

// ---- 10. Bloodlust
{ const {e, P} = mk(); const W = put(e, P, 2, 'ke-wall', 0); const B = put(e, P, 1, 'ke-blood', 0); const ev = [];
  for(let i = 0; i < 5; i++) e.debugAttack(P, so, B.uid, {}, ev);
  const g = ev.filter(x=> x.type === 'statusFx' && x.kind === 'bloodlust');
  ok(B.atk === 6 && B.bloodlust === 3 && g.length === 3, `10. Bloodlust 1 + Bleed: each blood-drawing hit +1 Attack, capped at +3 (atk ${B.atk}, ${g.length} gains)`);
  ok(g[0].amount === 1 && g[2].total === 3 && g[2].max === 3, '10. the gain event carries the amount and the running total'); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'ke-wall', 0); const B = put(e, P, 1, 'ke-blood2', 0); e.debugAttack(P, so, B.uid, {}, []);
  ok(B.atk === 3, `10. no blood (the target isn't bleeding and it doesn't cause Bleed): no gain (${B.atk})`);
  W.bleed = 5; e.debugAttack(P, so, B.uid, {}, []); ok(B.atk === 5, `10. a hit on a Bleeding unit draws blood: +2 for Bloodlust 2 (${B.atk})`); }
ok(/\{key:'bloodlust', category:'evergreen', label:'Bloodlust', kind:'number', min:1, defaultValue:1,/.test(src) && /bloodlust: v=> `When its attack draws blood/.test(src), '10. Bloodlust N in the skill list (default 1), with card text');
ok(/bloodlustPulse/.test(fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8')) && /F\.bloodlustPulse\(t/.test(src), '10. its red pulse plays in fights');
ok(fs.existsSync(path.join(__dirname, '..', 'tools', 'effects-lab', 'manifest', 'g.js')) && /id:'sk-bloodlust'/.test(fs.readFileSync(path.join(__dirname, '..', 'tools', 'effects-lab', 'manifest', 'g.js'), 'utf8')), '10. registered in the Effects Lab (manifest/g.js)');
ok(/\n  bloodlust: \{status:\{foe:\{bleed:6\}\}/.test(src), '10. the Effects library stages it against a Bleeding dummy');

// ---- 11. Zeitgebers: plain and advanced forms
{ const {e, P} = mk({phase:'day'}); const D = put(e, P, 1, 'ke-day', 0), Dp = put(e, P, 1, 'ke-dayplain', 1); e.syncPhaseStats(P, so, []);
  ok(fxOf(e, D).evasive === true && fxOf(e, D).thorns === 1 && (D.phaseAtk||0) === 0, `11. Diurnal – {Evasive, Thorns 1}: by day it has them, and no +1 (${JSON.stringify(fxOf(e, D))}, +${D.phaseAtk||0})`);
  ok((Dp.phaseAtk||0) === 1, `11. plain Diurnal: +1 by day as before (${Dp.phaseAtk})`); }
{ const {e, P} = mk({phase:'night'}); const D = put(e, P, 1, 'ke-day', 0), N = put(e, P, 1, 'ke-night', 1); e.syncPhaseStats(P, so, []);
  ok(!fxOf(e, D).evasive, '11. ...and not at night');
  ok(N.phaseAtk === 2 && N.maxHp === 502 && fxOf(e, N).regen === 1, `11. Nocturnal – {+2/+2, Regen 1} at night (${N.phaseAtk}, ${N.maxHp})`); }
{ const {e, P} = mk(); e.startTide(); const T = put(e, P, 1, 'ke-tide', 0), Tp = put(e, P, 1, 'ke-tideplain', 1); const W = put(e, P, 2, 'ke-wall', 0);
  e.roundStart(P, 2, so, {}, []); ok(e.getTide() === 'flow', 'round 2: Flood');
  ok(fxOf(e, T).evasive && !fxOf(e, T).armor && T.phaseAtk === 5 && T.maxHp === 505, `11. Tide – {+5/+5, Evasive}, {Armor 2}: the Flood facet on Flood (${T.phaseAtk}, ${JSON.stringify(fxOf(e, T))})`);
  const hp = W.hp; e.debugAttack(P, so, T.uid, {}, []); ok(hp - W.hp === 8, `11. ...and no plain Flood +1 on top (3 + 5 = ${hp - W.hp})`);
  const hq = P[2].hq.hp; e.debugAttack(P, so, Tp.uid, {}, []); ok(hq - P[2].hq.hp === 4, `11. plain Tide keeps Flood's +1 (${hq - P[2].hq.hp}, at the castle)`);
  e.roundStart(P, 3, so, {}, []); ok(e.getTide() === 'ebb' && fxOf(e, T).armor === 2 && !fxOf(e, T).evasive && (T.phaseAtk||0) === 0, `11. the Ebb facet on Ebb (${JSON.stringify(fxOf(e, T))})`); }
{ const {e, P} = mk({highTide:true}); const T = put(e, P, 1, 'ke-tide', 0); for(let r = 1; r <= 8 && e.getTide() !== 'high'; r++) e.roundStart(P, r, so, {}, []);
  ok(e.getTide() === 'high' && fxOf(e, T).evasive && fxOf(e, T).armor === 2, `11. High Tide brings both facets (${e.getTide()}, ${JSON.stringify(fxOf(e, T))})`); }
{ const {e, P} = mk({phase:'night', field:'moon'}); const ev = []; const M = put(e, P, 1, 'ke-moon', 0, ev), G = put(e, P, 1, 'ke-moong', 1, ev); e.syncPhaseStats(P, so, ev);
  ok(M.phaseAtk === 3 && M.maxHp === 503 && M.fullMoonRisen, `11. Full Moon: the full moon rises, +3/+3 (${M.phaseAtk}, ${M.maxHp})`);
  ok(fxOf(e, G).regen === 2 && !(G.phaseAtk), '11. Full Moon – {Regen 2}: the skills instead');
  ok(ev.filter(x=> x.type === 'statusFx' && x.kind === 'fullMoon').length === 2, '11. the rising is reported once each');
  e.setField(null); e.syncPhaseStats(P, so, []); ok(M.phaseAtk === 3 && fxOf(e, G).regen === 2, '11. ...and it lasts for the rest of the fight'); }
{ const {e, P} = mk({phase:'day'}); const M = put(e, P, 1, 'ke-moon', 0); e.syncPhaseStats(P, so, []); ok(!M.fullMoonRisen && !(M.phaseAtk), '11. no full moon by day'); }
{ const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));
  const sw = cards.filter(c=> c.effects && (c.effects.swimmer || c.effects.swimmerGrant)).map(c=> c.id);
  ok(!sw.length, `11. no card carries Swimmer (${sw})`);
  ok(['dolphin-knight', 'reef-shark', 'colossal-squid', 'otter-angler'].every(id=>{ const c = cards.find(x=> x.id === id); return c && c.effects.tide === true; }), '11. the former Swimmers carry plain Tide'); }
ok(/\{key:'swimmer', category:'passive', hidden:true, retired:true,/.test(src) && /\{key:'swimmerGrant', category:'passive', hidden:true, retired:true,/.test(src), '11. Swimmer is out of the editor and the lists (the engine keeps it)');
['diurnalGrant', 'nocturnalGrant', 'fullMoonGrant'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive', label:'[^']+ – \\{ \\}', kind:'grant'`).test(src), `11. ${k}: an editor row with a skill picker`));
ok(/\{key:'tideGrant', category:'passive', label:'Tide – \{ \}, \{ \}', kind:'grant2', placeholders:\['Flood', 'Ebb'\]/.test(src), '11. Tide – { }, { }: two facets in the editor');
ok(/\{key:'fullMoon', category:'passive', label:'Full Moon', kind:'number', min:1, defaultValue:3,/.test(src), '11. plain Full Moon (default 3)');
ok(/const SKILL_REVEAL_PARTS = \{diurnal:\['diurnalHp', 'diurnalGrant'\], nocturnal:\['nocturnalHp', 'nocturnalGrant'\], crepuscular:\['crepuscularHp'\], tide:\['tideGrant'\]/.test(src), '11. the braces hide with their skill while it is "?" (SKILL_REVEAL_PARTS)');
// the brace text helpers, run on their own
{ const pick = name=>{ const i = src.indexOf(`function ${name}(`); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const ctx = {PASSIVE_DEFS:[{key:'evasive', label:'Evasive'}, {key:'thorns', label:'Thorns'}, {key:'armor', label:'Armor'}], SKILL_ICON:{}, valSuffix: v=> (v === true || v === 1 || v == null) ? '' : ' ' + v, Object, Number, String};
  vm.createContext(ctx); vm.runInContext(['parseGrantText', 'grantBraceText', 'grantToText'].map(pick).join('\n') + ';this.G = {parseGrantText, grantBraceText, grantToText};', ctx);
  const g = ctx.G.parseGrantText('{+5/+5, Evasive, thorns 1}');
  ok(g.attack === 5 && g.health === 5 && g.evasive === true && g.thorns === 1, `11. "{+5/+5, Evasive, thorns 1}" reads as stats and skills (${JSON.stringify(g)})`);
  ok(ctx.G.grantBraceText(g) === '{+5/+5, Evasive, Thorns 1}', `11. the card says "Tide – {+5/+5, Evasive, Thorns 1}" (${ctx.G.grantBraceText(g)})`);
  ok(ctx.G.grantToText(g) === '+5/+5, evasive, thorns 1', '11. and the editor field round-trips it'); }
ok(/name = high \? _t\('High Tide'\) : flow \? _t\('Flood'\) : _t\('Ebb'\)/.test(src) && !/_t\('Flow'\)/.test(src), '11. the tide pill says Flood (the engine key stays "flow")');
ok(!/'🌊 Flow/.test(src) && /'🌊 Flood: the tide goes in\.'/.test(src), '11. the battle log says Flood');
ok(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', 'de.json'), 'utf8')).Flood === 'Flut', '11. "Flood" is translated (as "Flow" was)');

// ---- 2. the middle slot comes back on an empty row
ok(/if\(sl===0 && bySlot\.size===0\)\{/.test(src) && /center-slot-empty\$\{tgt \? ' slot-target is-centre-target' : ''\}/.test(src), '2. an empty open-mode row draws the ✦ centre slot');
ok(/\.board-card\.slot-target\.is-centre-target\{opacity:1;/.test(tpl), '2. ...visible whether or not a card is held');
// ---- 5. no Spawn corner pill
ok(!/<div class="spawnbadge"/.test(src), '5. no "🔁 Spawn" corner pill on tokens');
// ---- 14. no "a rule of this battlefield"
ok(!/title:'An environment card: a rule of this battlefield'/.test(src) && !/Environment card: a rule of this battlefield\.<\/p>/.test(src), '14. the Environment card no longer says "a rule of this battlefield"');
// ---- 15. pills
{ const bp = src.slice(src.indexOf('function bfPillsHTML(m){'), src.indexOf('function refreshBfPills('));
  ok(/phasePillHTML\(m\) \+ mistPillHTML\(m\) \+ windPillHTML\(m\) \+ tidePillHTML\(m\) \+ rs/.test(bp) && !/forecastPillHTML/.test(src), '15. state only: no "next round" pill, the moon in the Night pill');
  ok(/\.bf-pills\{position:absolute; top:50%; left:0;/.test(tpl) && !/\.bf-pills\{left:-12px/.test(tpl), '15. the pills start inside the board (no negative left)');
  ok(/const TIDE_PILL_TIP = 'Tide goes in, Ebb goes out\.';/.test(src), '15. the tide pill tooltip: "Tide goes in, Ebb goes out."');
  ok(/<span class="wind-ico">💨<i class="wind-dir">\$\{w\.mine \? '⬆' : '⬇'\}<\/i><\/span>/.test(src), '15. wind: 💨 with its arrow stacked on it');
  ok(/lines \? pillTipHTML\('Mist', lines\) : '<b class="pt-h">\?<\/b>'/.test(src) && /if\(matchFieldUnrevealed\(m\)\) rows = rows\.filter\(r=> r\.key !== 'misty'\)/.test(src), '15. Map 0: a Mist pill that says "?", no Mist card');
  ok(/const MISTY_TEXT = 'There is no day\/night cycle\.';/.test(src) && /const MISTY_MOON_TEXT = 'The Moon is not visible\.';/.test(src), '15. later misty maps: "There is no day/night cycle." (+ "The Moon is not visible.")'); }
// ---- 12. the surprise challenge
ok(/function ambushTheftCap\(\)\{ let n = 0; try\{ n = Math\.max\(0, furthestMapReached\(\)\); \}catch\(e\)\{\} return Math\.min\(100, 15 \+ 5\*n\); \}/.test(src), '12. the cap: 15 on Map 0, +5 a map, at most 100');
{ const cap = n=> Math.min(100, 15 + 5*n); ok(cap(0) === 15 && cap(3) === 30 && cap(17) === 100 && cap(40) === 100, '12. (15, 30 on Map 3, 100 from Map 17)'); }
ok(/fn\.node\.ambush\)\{ const want = ambushTheftRoll\(\), have = Math\.max\(0, Math\.floor\(myCurrencies\.gold \|\| 0\)\), n = Math\.min\(have, want\);/.test(src) && /raidersTookHTML\(m\)/.test(src), '12. losing an ambush takes Maple Leaves (never more than you have) and the defeat card says so');
ok(/const pop = showAmbushPop\(hb\);/.test(src) && /startConquestMatch\(map\.id, 'ambush'\)/.test(src), '12. the quick "Ambush!" sub-window, then straight into the fight');
// ---- the engine notes
ok(/Zeitgeber format \(2026-10-15/.test(eng) && /function bloodlustGain\(/.test(eng) && /function useExposed\(/.test(eng), 'engine: the dated notes and helpers are there');
console.log(`keywords-2026-10-15e: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
