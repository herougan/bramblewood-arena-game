#!/usr/bin/env node
// 2026-10-15 (third list): Chilli (user: "New skill Chilli."), Fork / Trident / Pitchfork made alike (user: "Decision, we can make
// the first 3 more similar - attack the nearest 2/3/4 enemies within 1/1/2 range") and Crab Claws (user: "attack a random unit L
// or R"), more arrows (user: "Volley, Arrow, Twin Shot, Fire Arrow, Ice Arrow etc. will be more normal"), the Bolts (user: "Fire
// bolt, Acid bolt, Poison bolt etc.") and the one-off skills (user: "We will designate some skills as 1-offs").
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'kc-wall': U('kc-wall', {}, {attack:0}), 'kc-fork': U('kc-fork', {fork:true}), 'kc-tri': U('kc-tri', {trident:true}), 'kc-pitch': U('kc-pitch', {pitchfork:true}),
  'kc-ice': U('kc-ice', {iceArrow:2}, {attack:0}), 'kc-twin': U('kc-twin', {twinShot:2}, {attack:0}), 'kc-vol': U('kc-vol', {volley:1}, {attack:0}),
  'kc-fb': U('kc-fb', {fireBolt:2}, {attack:0}), 'kc-ab': U('kc-ab', {acidBolt:2}, {attack:0}), 'kc-pb': U('kc-pb', {poisonBolt:3}, {attack:0}),
  'kc-ib': U('kc-ib', {iceBolt:2}, {attack:0}), 'kc-sb': U('kc-sb', {shockBolt:2}, {attack:0}),
  'kc-chilli': U('kc-chilli', {chilli:2}, {health:30}), 'kc-chilliW': U('kc-chilliW', {chilli:2}, {health:30, wait:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const hurt = ws=> ws.filter(c=> c.hp < c.maxHp);

// ---- 2. Fork / Trident / Pitchfork: the N nearest within R; nothing in range = a normal swing
// 2026-10-17 (user: "Fork cannot hit C and L at the same time ... Trident's L and R hits for 1/2 damage. Pitch fork's all 4 prongs hit for
// 1/2"): see tests/fork-family-2026-10-17.js for the full rule; the cases below are updated to it.
{ const {e, P} = mk(); const ws = [-1, 0, 1].map(s=> put(e, P, 2, 'kc-wall', s)); const F = put(e, P, 1, 'kc-fork', 0); const hq = P[2].hq.hp;
  e.debugAttack(P, so, F.uid, {}, []); const h = hurt(ws);
  ok(h.length === 2 && ws[1].hp === 497 && ((ws[0].hp === 497) !== (ws[2].hp === 497)) && P[2].hq.hp === hq, `Fork: C and one side, never L + R, never the castle (2026-10-26, ENG9 / G2; was L and R) (${ws.map(c=> c.hp)})`); }
{ const {e, P} = mk(); const ws = [-1, 1].map(s=> put(e, P, 2, 'kc-wall', s)); const F = put(e, P, 1, 'kc-fork', 0); const hq = P[2].hq.hp;
  e.debugAttack(P, so, F.uid, {}, []); ok(hurt(ws).length === 1 && P[2].hq.hp === hq, `Fork with nothing in front: one of the units beside it (never L + R; ENG9 / G2), not the castle (${ws.map(c=> c.hp)})`); }
{ const {e, P} = mk(); const far = put(e, P, 2, 'kc-wall', 3); const F = put(e, P, 1, 'kc-fork', 0); const hq = P[2].hq.hp;
  e.debugAttack(P, so, F.uid, {}, []); ok(far.hp === 500 && P[2].hq.hp === hq - 3, 'Fork with no unit in range: it attacks straight ahead (the castle)'); }
{ const {e, P} = mk(); const ws = [-2, -1, 0, 1, 2].map(s=> put(e, P, 2, 'kc-wall', s)); const T = put(e, P, 1, 'kc-tri', 0);
  e.debugAttack(P, so, T.uid, {}, []); const h = hurt(ws);
  ok(h.length === 3 && h.every(c=> Math.abs(c.slot) <= 1) && ws[2].hp === 497 && ws[1].hp === 498 && ws[3].hp === 498, `Trident: C full, L and R half: 1.5 lands as 2 (FX2) (${ws.map(c=> c.slot + ':' + c.hp)})`); }
{ const {e, P} = mk(); const ws = [-3, -2, -1, 0, 1, 2, 3].map(s=> put(e, P, 2, 'kc-wall', s)); const T = put(e, P, 1, 'kc-pitch', 0);
  e.debugAttack(P, so, T.uid, {}, []); const h = hurt(ws);
  ok(h.length === 4 && h.every(c=> Math.abs(c.slot) <= 2) && ws[3].hp < 500 && h.every(c=> c.hp === 498), `Pitchfork: 4 lines within 2 columns, C among them, half each, 1.5 lands as 2 (FX2) (${ws.map(c=> c.slot + ':' + c.hp)})`); }
{ let hitW = 0, bad = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(s); const w = put(e, P, 2, 'kc-wall', 2); const T = put(e, P, 1, 'kc-pitch', 0); const hq = P[2].hq.hp;
    e.debugAttack(P, so, T.uid, {}, []); if(w.hp === 498){ hitW++; if(P[2].hq.hp !== hq) bad++; } else if(w.hp !== 500) bad++; else if(P[2].hq.hp !== hq - 2) bad++; } // half of 3: 1.5 lands as 2 (FX2); 2026-10-26 (ENG9, G2): the castle only when no line holds a unit
  ok(!bad && hitW > 4 && hitW < 26, `Pitchfork: nothing in front; a unit 2 columns out is struck when it aims that way (then no castle), else its C prong hits the castle for half (${hitW}/30, ${bad} bad)`); }
{ const {e, P} = mk(); const w = put(e, P, 2, 'kc-wall', 2); const T = put(e, P, 1, 'kc-tri', 0); const hq = P[2].hq.hp;
  e.debugAttack(P, so, T.uid, {}, []); ok(w.hp === 500 && P[2].hq.hp === hq - 3, 'Trident: a unit 2 columns away is out of range, so it swings at the castle'); }
{ let one = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const ws = [-1, 0, 1].map(x=> put(e, P, 2, 'kc-wall', x)); const F = put(e, P, 1, 'kc-fork', 0); F.blind = 5;
    e.debugAttack(P, so, F.uid, {}, []); if(hurt(ws).length === 1) one++; }
  ok(one > 0, `a blind Fork rolls each prong on its own (exactly one landed ${one} of 40 times)`); }

// ---- 3. Ice Arrow, Twin Shot, Volley
{ let froze = 0, max = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk(s); const w = put(e, P, 2, 'kc-wall', 0); put(e, P, 1, 'kc-ice', 0); const ev = [];
    for(let r = 0; r < 3; r++){ e.resolveCombat(P, so, {}, ev, 1); max = Math.max(max, w.frozen||0); }
    if(ev.some(x=> x.type === 'statusFx' && x.kind === 'freeze')) froze++;
    if(s === 1) ok(ev.some(x=> x.type === 'arrow' && x.ice) && ev.some(x=> x.type === 'hit' && x.dmgType === 'cold' && x.ranged), 'Ice Arrow: an icy arrow of cold damage'); }
  ok(froze > 0 && froze < 20 && max <= 1, `Ice Arrow: 1 in 2 a Freeze counter, never more than one (froze in ${froze} of 20 fights, most counters ${max})`); }
{ const {e, P} = mk(); const a = put(e, P, 2, 'kc-wall', -1), b = put(e, P, 2, 'kc-wall', 1); put(e, P, 1, 'kc-twin', 0); const ev = [];
  e.resolveCombat(P, so, {}, ev, 1); ok(a.hp === 498 && b.hp === 498 && ev.filter(x=> x.type === 'arrow' && x.twin).length === 2, `Twin Shot: two arrows at two different units (${a.hp}, ${b.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 2, 'kc-wall', 2); put(e, P, 1, 'kc-twin', 0);
  e.resolveCombat(P, so, {}, [], 1); ok(a.hp === 496, `Twin Shot with one enemy unit: both arrows hit it (${a.hp})`); }
{ const {e, P} = mk(); const ws = [-1, 0, 1].map(s=> put(e, P, 2, 'kc-wall', s)); put(e, P, 1, 'kc-vol', 0); const per = [];
  for(let r = 0; r < 4; r++){ const ev = []; e.resolveCombat(P, so, {}, ev, 1); per.push(ev.filter(x=> x.type === 'arrow' && x.volley).length); }
  ok(per.join(',') === '3,0,3,0' && ws.every(c=> c.hp === 498), `Volley: an arrow at every enemy unit, every other round (${per})`); }
{ const {e, P} = mk(); put(e, P, 1, 'kc-vol', 0); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === hq - 1, 'Volley at an empty board: the castle'); }

// ---- 4. The Bolts
const boltRun = (id, seed)=>{ const {e, P} = mk(seed); const w = put(e, P, 2, 'kc-wall', 0); put(e, P, 1, id, 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {w, ev, P}; };
{ const {w, ev} = boltRun('kc-fb'); ok(w.hp === 498 && ev.some(x=> x.type === 'bolt' && x.element === 'fire') && ev.some(x=> x.type === 'hit' && x.dmgType === 'heat'), `Fire Bolt: 2 fire damage (${w.hp})`); }
{ const {w, ev} = boltRun('kc-ab'); ok(w.hp === 498 && w.corrode === 1 && ev.some(x=> x.type === 'hit' && x.dmgType === 'acid'), `Acid Bolt: 2 acid damage and 1 Corrode (${w.hp}, corrode ${w.corrode})`); }
{ const {w, ev} = boltRun('kc-pb'); ok(w.hp === 500 && w.poison === 3 && ev.some(x=> x.type === 'bolt' && x.element === 'poison') && !ev.some(x=> x.type === 'hit'), `Poison Bolt: no damage, 3 Poison (${w.hp}, poison ${w.poison})`); }
{ let froze = 0; for(let s = 1; s <= 20; s++){ const {w, ev} = boltRun('kc-ib', s); if(ev.some(x=> x.type === 'statusFx' && x.kind === 'freeze')) froze++; if(s === 1) ok(w.hp === 498, 'Ice Bolt: 2 cold damage'); }
  ok(froze > 0 && froze < 20, `Ice Bolt: 1 in 2 a Freeze counter (${froze} of 20)`); }
{ const {w, ev} = boltRun('kc-sb'); ok(w.hp === 498 && w.shocked === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'shock'), `Shock Bolt: 2 damage and Shocked (${w.hp}, shocked ${w.shocked})`); }
{ const {e, P} = mk(); const w = put(e, P, 2, 'kc-wall', 2); put(e, P, 1, 'kc-fb', 0); e.resolveCombat(P, so, {}, [], 1); ok(w.hp === 498, 'a Bolt with nobody opposite spits at the nearest enemy unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'kc-fb', 0); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === hq - 2, 'a Bolt at an empty board: the castle'); }
const engSrc = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
ok(/const BOLT_ELEMENTS = \{/.test(engSrc) && ['fireBolt', 'acidBolt', 'poisonBolt', 'iceBolt', 'shockBolt'].every(k=> new RegExp(`\\n    ${k}: +\\{element:`).test(engSrc)), 'the Bolts are one table (BOLT_ELEMENTS)');

// ---- 1. Chilli
{ const {e, P} = mk(); const w = put(e, P, 2, 'kc-wall', 0); const C = put(e, P, 1, 'kc-chilli', 0);
  ok(C.atk === 5 && C.chilli === 2, `Chilli: Ready on arrival, it eats it: +2 Attack (${C.atk})`);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === C.uid && x.dmgType === 'heat') && w.hp === 495, `its attacks deal fire damage (${w.hp})`);
  ok(C.hp === 29 && ev.some(x=> x.type === 'statusFx' && x.kind === 'chilliBurn'), `and it takes 1 at the start of the round (${C.hp})`);
  e.resolveCombat(P, so, {}, [], 1); ok(C.hp === 28 && C.atk === 5, `every round, and the Attack stays (${C.hp}, ${C.atk})`); }
{ const {e, P} = mk(); const C = put(e, P, 1, 'kc-chilliW', 0); ok(C.atk === 3 && !C.chilli, 'Chilli on a Waiting unit: not yet');
  const ev = []; e.roundStart(P, 2, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); for(let r = 3; r < 6; r++){ e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); }
  ok(C.atk === 5 && ev.filter(x=> x.type === 'statusFx' && x.kind === 'chilli').length === 1, `it eats one chilli when it first becomes Ready, once (${C.atk})`); }

// ---- the app side (source checks)
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
['chilli', 'iceArrow', 'twinShot', 'volley', 'fireBolt', 'acidBolt', 'poisonBolt', 'iceBolt', 'shockBolt'].forEach(k=>{
  ok(new RegExp(`\\{key:'${k}', category:'evergreen', label:'[^']+', kind:'number', min:1, defaultValue:\\d`).test(src), `${k}: in the skill list, a number`);
  ok(new RegExp(`Object\\.assign\\(SKILL_ICON, \\{[^}]*\\b${k}:`).test(src), `${k}: an icon`);
  ok(new RegExp(`\\n  ${k}: v=> `).test(src), `${k}: card text`); });
ok(/\{key:'chilli', category:'evergreen', label:'Chilli', kind:'number', min:1, defaultValue:2,/.test(src), 'Chilli N, editable, default 2');
['trident', 'pitchfork', 'crabClaws', 'iceArrow', 'twinShot', 'volley', 'poisonBolt', 'iceBolt', 'chilli'].forEach(k=> ok(new RegExp(`\\n  ${k}: \\{`).test(src.slice(src.indexOf('const FXL_SKILL_SETUPS'))), `${k}: an Effects library setup`));
ok(/const ONE_OFF_SKILLS = \['coffee', 'chilli', 'banana', 'bananarang', 'durian', 'rabid', 'supremeTide', 'smokeBomb', 'avalanche', 'earthquake', 'tornado', 'crepuscular', 'scatterbrained', 'meteor'\];/.test(src), '5. the one-offs');
ok(!/key:'hurricane'/.test(src), '5. (there is no Hurricane skill yet)');
ok(/oneOff:p\.oneOff,/.test(src) && !/\$\{x\.oneOff \? ' · one-off' : ''\}/.test(src) && /\$\{oneOffTagHTML\(s\)\}\$\{valueHtml\}/.test(src), '5. the skill picker tags one-offs (a tag beside the row, not in the name: 2026-10-16)');
ok(!/<b>\$\{escapeHtml\(p\.label\)\}<\/b>\$\{oneOffTagHTML\(p\)\}/.test(src), '5. ...but the Skills codex no longer shows it (2026-10-17, user: "Remove the one-off tag in Codex")');
ok(/function ninthPassVfx\(ev\)/.test(src) && /try\{ ninthPassVfx\(ev\); \}catch\(e\)\{\}/.test(src), 'the Bolt and Chilli effects play in fights');
const fx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8');
ok(/Object\.assign\(root\.SkillFX, \{boltGlob, chilliHeat, bloodlustPulse, BOLT_LOOK\}\);/.test(fx) && ['fire', 'acid', 'poison', 'ice', 'shock'].every(k=> new RegExp(`\\n  ${k}: +\\{core:`).test(fx)), 'SkillFX.boltGlob (one look per element) and chilliHeat');
const lab = fs.readFileSync(path.join(__dirname, '..', 'tools', 'effects-lab', 'build.py'), 'utf8');
['trident', 'pitchfork', 'crabclaws', 'icearrow', 'twinshot', 'firebolt', 'acidbolt', 'poisonbolt', 'icebolt', 'shockbolt', 'chilli'].forEach(k=> ok(lab.includes(`data-skill="${k}"`), `Effects Lab: a ${k} button`));
const cat = fs.readFileSync(path.join(__dirname, '..', 'docs', 'effects-catalogue.md'), 'utf8');
ok(/## 2026-10-15 additions: arrows, bolts, prongs and Chilli/.test(cat), 'the effects catalogue describes them');
console.log(`keywords-2026-10-15c: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
