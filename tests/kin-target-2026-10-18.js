#!/usr/bin/env node
// 2026-10-18 (kin target). The user's note (00:09):
//   "1. Targets: Ally, Enemy, Kin, Any (Espirit default is Kin, but can choose Any)"
// Covers: who:'kin' in the engine (your own units that share a Type with the acting unit, never itself) for a single pick, Adjacent,
// Furthest, All, N targets, every targeted action that offers it (Buff, Debuff, Deal damage, Poison, Bleed, Expose, Stun, Increase
// Wait, Heal, Cleanse, Shield, Exile), a Charge action; Esprit's target (Kin by default, Any on espritWho:'any', spawns too); and the
// app side (the editor's picker lists, the trigger sentence, the Charge text, Esprit's text / editor value / Codex note, the Kin
// keyword, the CHANGELOG).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, types, effects, o)=> Object.assign({id, name:id, attack:0, health:20, wait:0, cost:0, archetypes:types, effects: effects || {}}, o || {});
const RS = (id, trig, types)=> U(id, types || ['Kinfolk'], {triggers:[Object.assign({on:'onRoundStart'}, trig)]});
const defs = Object.assign({}, H.loadCardDefs(), {
  'kt-kin':    U('kt-kin', ['Kinfolk']),
  'kt-kin2':   U('kt-kin2', ['Stranger', 'Kinfolk']),       // shares one of two types: still Kin
  'kt-other':  U('kt-other', ['Stranger']),
  'kt-buff':   RS('kt-buff', {do:'buff', who:'kin', sub:'random', amount:3}),
  'kt-buff3':  RS('kt-buff3', {do:'buff', who:'kin', sub:'random', amount:1, targets:3}),
  'kt-adj':    RS('kt-adj', {do:'buff', who:'kin', sub:'adjacent', amount:2}),
  'kt-far':    RS('kt-far', {do:'buff', who:'kin', sub:'furthest', amount:2}),
  'kt-poison': RS('kt-poison', {do:'poison', who:'kin', sub:'all', amount:2}),
  'kt-dmg':    RS('kt-dmg', {do:'damage', who:'kin', sub:'all', amount:4, dmgType:'physical'}),
  'kt-shield': RS('kt-shield', {do:'shield', who:'kin', sub:'all', amount:3}),
  'kt-heal':   RS('kt-heal', {do:'heal', who:'kin', sub:'random', amount:5}),
  'kt-debuff': RS('kt-debuff', {do:'debuff', who:'kin', sub:'random', amount:1}),
  'kt-bleed':  RS('kt-bleed', {do:'bleed', who:'kin', sub:'random', amount:1}),
  'kt-expose': RS('kt-expose', {do:'expose', who:'kin', sub:'random', amount:1}),
  'kt-stun':   RS('kt-stun', {do:'stun', who:'kin', sub:'random'}),
  'kt-wait':   RS('kt-wait', {do:'addWait', who:'kin', sub:'random', amount:2}),
  'kt-clean':  RS('kt-clean', {do:'cleanse', who:'kin', sub:'random'}),
  'kt-exile':  RS('kt-exile', {do:'exile', who:'kin', sub:'random'}),
  'kt-ally':   RS('kt-ally', {do:'poison', who:'ally', sub:'all', amount:1}),
  'kt-charge': U('kt-charge', ['Kinfolk'], {charge:{n:1, do:{do:'buff', who:'kin', sub:'random', amount:2}}}),
  'kt-esp':    U('kt-esp', ['Kinfolk'], {esprit:1, espritHp:1}),
  'kt-espany': U('kt-espany', ['Kinfolk'], {esprit:1, espritHp:1, espritWho:'any'}),
  'kt-spawner':U('kt-spawner', ['Stranger'], {triggers:[{on:'onRoundStart', do:'spawnCard', defId:'kt-other', count:1}]}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, lane){ e.debugSpawnCard(P, so, pid, id, lane || 'left', {}, []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const fire = (e, P, c, ev)=> e.debugFireTrigger(P, so, c.uid, 'onRoundStart', {}, ev || []);

// ---- 1. A single pick only ever lands on Kin (never the caster, never a non-Kin ally, never the enemy)
{ let kinHits = 0, bad = 0;
  for(let seed = 1; seed <= 30; seed++){ const {e, P} = mk(seed); const S = put(e, P, 1, 'kt-buff'); const K = put(e, P, 1, 'kt-kin', 'right'); const O1 = put(e, P, 1, 'kt-other'), O2 = put(e, P, 1, 'kt-other', 'right'); const F = put(e, P, 2, 'kt-kin');
    fire(e, P, S); if(K.atk === 3) kinHits++; if(S.atk || O1.atk || O2.atk || F.atk) bad++; }
  ok(kinHits === 30 && bad === 0, `Buff Kin random: always the one Kin ally (${kinHits}/30), never itself, a non-Kin ally or the enemy (${bad})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-buff'); const K2 = put(e, P, 1, 'kt-kin2', 'right'); fire(e, P, S);
  ok(K2.atk === 3, `one shared Type of two is enough (${K2.atk})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-buff'); const O = put(e, P, 1, 'kt-other', 'right'); const F = put(e, P, 2, 'kt-kin'); fire(e, P, S);
  ok(!S.atk && !O.atk && !F.atk, 'no Kin on the board: the action does nothing (not itself, not a stranger, not an enemy of the same Type)'); }
// ---- 2. N targets, Adjacent, Furthest
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-buff3'); const K1 = put(e, P, 1, 'kt-kin', 'right'), K2 = put(e, P, 1, 'kt-kin2'); const O = put(e, P, 1, 'kt-other', 'right'); fire(e, P, S);
  ok(K1.atk === 1 && K2.atk === 1 && !O.atk && !S.atk, `3 Kin targets with 2 Kin on the board: each Kin once, nobody else (${K1.atk}, ${K2.atk}, ${O.atk})`); }
{ let good = 0; for(let seed = 1; seed <= 20; seed++){ const {e, P} = mk(seed); e.debugSpawnCard(P, so, 1, 'kt-adj', 'left', {}, []); const S = all(P[1])[0];
    e.debugSpawnCard(P, so, 1, 'kt-other', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'kt-kin', 'right', {}, []);
    const order = all(P[1]); fire(e, P, S); const K = order.find(c=> c.defId === 'kt-kin'), O = order.find(c=> c.defId === 'kt-other');
    if(K.atk === 2 && !O.atk) good++; }
  ok(good === 20, `Adjacent Kin: the Kin neighbour, not the stranger on the other side (${good}/20)`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-far'); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other', 'right'); fire(e, P, S);
  ok(K.atk === 2 && !O.atk, `Furthest Kin: the furthest of the Kin, a nearer or further stranger never (${K.atk}, ${O.atk})`); }
// ---- 3. All your Kin (Poison, Deal damage, Shield): not itself, not strangers, not the enemy; Ally All is unchanged
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-poison'); const K1 = put(e, P, 1, 'kt-kin', 'right'), K2 = put(e, P, 1, 'kt-kin2'); const O = put(e, P, 1, 'kt-other', 'right'); const F = put(e, P, 2, 'kt-kin'); fire(e, P, S);
  ok(K1.poison === 2 && K2.poison === 2 && !O.poison && !S.poison && !F.poison, `Poison all your Kin (${[S, K1, K2, O, F].map(c=> c.poison||0)})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-dmg'); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other'); fire(e, P, S);
  ok(K.hp === 16 && O.hp === 20 && S.hp === 20, `Deal 4 damage to all your Kin (${S.hp}, ${K.hp}, ${O.hp})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-shield'); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other'); fire(e, P, S);
  ok((K.shield||0) === 3 && !(O.shield) && !(S.shield), `Shield 3 on all your Kin (${S.shield||0}, ${K.shield||0}, ${O.shield||0})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-ally'); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other'); fire(e, P, S);
  ok(K.poison === 1 && O.poison === 1, 'Ally All still means every ally (Kin or not)'); }
// ---- 4. Every other action that offers Kin
const lone = (id, prep, check, label)=>{ let good = 0; for(let seed = 1; seed <= 12; seed++){ const {e, P} = mk(seed); const S = put(e, P, 1, id); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other');
  if(prep){ prep(K); prep(O); } fire(e, P, S); if(check(K, true) && check(O, false)) good++; } ok(good === 12, `${label} (${good}/12)`); };
lone('kt-heal', c=>{ c.hp = 10; }, (c, kin)=> kin ? c.hp === 15 : c.hp === 10, 'Heal a Kin unit');
lone('kt-debuff', c=>{ c.atk = 3; }, (c, kin)=> kin ? c.atk === 2 : c.atk === 3, 'Debuff a Kin unit');
lone('kt-bleed', null, (c, kin)=> kin ? c.bleed === 1 : !c.bleed, 'Bleed a Kin unit');
{ let good = 0; for(let seed = 1; seed <= 12; seed++){ const {e, P} = mk(seed); const S = put(e, P, 1, 'kt-expose'); put(e, P, 1, 'kt-kin', 'right'); put(e, P, 1, 'kt-other'); const ev = []; fire(e, P, S, ev);
    const x = ev.filter(v=> v.type === 'statusFx' && v.kind === 'expose'); if(x.length === 1 && x[0].targetDefId === 'kt-kin') good++; } // (the counter itself fades at once off the board's turn, Kin or Ally alike)
  ok(good === 12, `Expose a Kin unit (${good}/12)`); }
lone('kt-stun', null, (c, kin)=> kin ? !!c.stunned : !c.stunned, 'Stun a Kin unit');
lone('kt-wait', null, (c, kin)=> kin ? c.wait === 2 : !c.wait, 'Increase the Wait of a Kin unit');
lone('kt-clean', c=>{ c.poison = 3; }, (c, kin)=> kin ? !c.poison : c.poison === 3, 'Cleanse a Kin unit');
lone('kt-exile', null, (c, kin)=> kin ? c.hp === 0 && c.forceExileZone : c.hp === 20, 'Exile a Kin unit');
// ---- 5. A Charge action with Kin (the charge runs on a stand-in def: the Kin still come from the unit's own card)
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-charge'); const K = put(e, P, 1, 'kt-kin', 'right'); const O = put(e, P, 1, 'kt-other');
  for(let r = 0; r < 3 && !K.atk; r++) e.resolveCombat(P, so, {}, [], 1);
  ok(K.atk >= 2 && !O.atk, `Charge 1 - buff a Kin unit: the Kin ally grows, the stranger doesn't (${K.atk}, ${O.atk})`); }
// ---- 6. Esprit: Kin by default, Any on request; spawns count either way
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-esp'); put(e, P, 1, 'kt-other', 'right'); const a1 = S.atk; put(e, P, 1, 'kt-kin');
  ok(a1 === 0 && S.atk === 1 && S.hp === 21, `Esprit (Kin, the default): a stranger doesn't count, a Kin unit does (${a1} → ${S.atk}/${S.hp})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-espany'); put(e, P, 1, 'kt-other', 'right'); const a1 = S.atk; put(e, P, 1, 'kt-kin'); put(e, P, 2, 'kt-other');
  ok(a1 === 1 && S.atk === 2 && S.hp === 22, `Esprit (Any): every unit of yours counts, a stranger too; the enemy's never (${a1} → ${S.atk}/${S.hp})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-espany'); const Sp = put(e, P, 1, 'kt-spawner', 'right'); const a0 = S.atk; fire(e, P, Sp);
  ok(S.atk === a0 + 1, `Esprit (Any) counts a spawned stranger (${a0} → ${S.atk})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'kt-esp'); const Sp = put(e, P, 1, 'kt-spawner', 'right'); const a0 = S.atk; fire(e, P, Sp);
  ok(S.atk === a0, `Esprit (Kin) ignores a spawned stranger (${a0} → ${S.atk})`); }
{ const cards = JSON.parse(fs.readFileSync(path.join(H.ROOT, 'canonical/cards.json'), 'utf8')); const list = Array.isArray(cards) ? cards : Object.values(cards.cards || cards);
  const esp = list.filter(c=> c && c.effects && (c.effects.esprit || c.effects.espritHp));
  ok(esp.length > 0 && esp.every(c=> c.effects.espritWho == null), `every existing Esprit card keeps Kin (${esp.length} cards, none set to Any)`); }

// ---- 7. The app
const src = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8');
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const objSrc = start=>{ const i = src.indexOf(start); if(i < 0) return ''; let d = 0; for(let k = i; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
{ const fh = fnSrc('actionFieldsHTML'); ok(/aDef\.whoOptions \|\| \['self','ally','enemy','kin','any'\]/.test(fh), "the editor's default target list: Self, Ally, Opponent, Kin, Any");
  ok(/kin:'Kin'/.test(fh), 'the picker labels Kin "Kin"'); }
ok(/\{key:'exile', label:'Exile', fields:\['who','sub','targets'\], whoOptions:\['self','ally','enemy','kin','any'\]/.test(src), 'Exile offers Kin');
ok(/\{key:'shield', label:'Shield', fields:\['amount','who','sub','targets'\], whoOptions:\['self','ally','kin'\]/.test(src), 'Shield offers Kin (Self, Ally, Kin)');
{ const ctx = {out:{}, TRIGGER_DEFS:[{key:'onRoundStart', label:'On Round Start'}], TRIGGER_ALWAYS_ON:new Set(['onRoundStart']), ACTION_DEFS:['buff','poison','shield','damage','heal'].map(k=> ({key:k, label:k})), dmgWord: t=> t && t !== 'physical' ? t + ' ' : '', getCardDefs: ()=> ({})};
  vm.runInNewContext(fnSrc('triggerPreviewText') + '\nout.f = triggerPreviewText;', ctx); const f = t=> ctx.out.f(Object.assign({on:'onRoundStart'}, t));
  ok(f({do:'buff', who:'kin', sub:'random', amount:2}) === 'On Round Start, give a random Kin unit +2 Attack.', `"${f({do:'buff', who:'kin', sub:'random', amount:2})}"`);
  ok(f({do:'buff', who:'kin', sub:'adjacent', amount:2}) === 'On Round Start, give an adjacent Kin unit +2 Attack.', `"${f({do:'buff', who:'kin', sub:'adjacent', amount:2})}"`);
  ok(f({do:'poison', who:'kin', sub:'all', amount:1}) === 'On Round Start, apply 1 poison to all your Kin.', `"${f({do:'poison', who:'kin', sub:'all', amount:1})}"`);
  ok(f({do:'heal', who:'kin', sub:'furthest', amount:3, targets:2}) === 'On Round Start, heal 2 furthest Kin units for 3 (stanching Bleed first, capped at max HP).', `"${f({do:'heal', who:'kin', sub:'furthest', amount:3, targets:2})}"`);
  ok(f({do:'shield', who:'kin', sub:'all', amount:3}) === 'On Round Start, give all your Kin 3 Shield (temporary Health).', `"${f({do:'shield', who:'kin', sub:'all', amount:3})}"`); }
{ const ctx = {out:{}, ACTION_DEFS:[{key:'buff', label:'Buff'}]}; vm.runInNewContext(fnSrc('parseChargeText') + '\nout.f = parseChargeText;', ctx); const c = ctx.out.f('2, buff 3 kin random');
  ok(c && c.do.who === 'kin' && c.do.sub === 'random' && c.do.amount === 3, 'Charge text "2, buff 3 kin random" reads who:kin'); }
// Esprit: its text, its editor value (Kin / Any), the Codex note
{ const ctx = {out:{}}; const st = (src.match(/\n  esprit: \(v, n, e\)=> \{[^\n]*/) || [''])[0].trim().replace(/^esprit: /, '').replace(/, \/\/[^\n]*$/, '').replace(/,$/, '');
  let a = '', b = '', c = ''; try{ vm.runInNewContext(fnSrc('espritWhoOf') + fnSrc('phaseVals') + '\nout.f = ' + st, ctx); a = ctx.out.f([1, 2, 'kin'], 0, {}); b = ctx.out.f([1, 2], 0, {espritWho:'any'}); c = ctx.out.f(true, 0, {}); }catch(e){ a = String(e); }
  ok(a === '+1/+2 whenever another of your Kin enters play.', `SKILL_TEXT Kin: "${a}"`);
  ok(b === '+1/+2 whenever another unit of yours enters play.', `SKILL_TEXT Any: "${b}"`);
  ok(/your Kin/.test(c), `the Codex (no value) reads Kin: "${c}"`); }
{ const ctx = {out:{}}; let pd = null; try{ vm.runInNewContext(fnSrc('espritWhoOf') + '\nout.p = ' + objSrc("{key:'esprit', category:'passive'"), ctx); pd = ctx.out.p; }catch(e){ console.log(e); }
  ok(pd && pd.whoPicker && pd.whoPicker.map(o=> o.value).join() === 'kin,any', 'Esprit has a target picker: Kin, Any');
  ok(pd && JSON.stringify(pd.get({esprit:2})) === '[2,0,"kin"]' && JSON.stringify(pd.get({esprit:2, espritHp:1, espritWho:'any'})) === '[2,1,"any"]', 'Esprit reads its target (Kin unless espritWho is any)');
  const e1 = {}, e2 = {}, e3 = {}; if(pd){ pd.apply(e1, ['1', '1', 'kin']); pd.apply(e2, ['1', '0', 'any']); pd.apply(e3, ['1', '1']); }
  ok(pd && e1.esprit === 1 && e1.espritHp === 1 && !('espritWho' in e1) && e2.espritWho === 'any' && !('espritWho' in e3), 'Esprit saves Any as espritWho:any, and nothing for Kin');
  ok(pd && /another of your Kin/.test(pd.desc([1, 1], 0, {})) && /another unit of yours/.test(pd.desc([1, 1, 'any'])), 'the editor help names Kin / Any');
  ok(pd && /Kin unless the card says Any/.test(pd.codexNote || ''), 'the Codex note explains Any'); }
ok(/if\(s\.whoPicker\) valueHtml \+= `<select data-sk="val2"/.test(fnSrc('skillRowHTML')), 'the editor row draws the target picker after the two numbers');
ok(/v2El \? \[v0, v1, v2El\.value\] : \[v0,v1\]/.test(src), 'saving reads the picker');
ok(/whoPicker:p\.whoPicker/.test(src), 'SKILL_DEFS carries whoPicker');
ok(/\(Any\)' : ''\} — \$\{skillText\(p, \[e\.esprit\|\|0, e\.espritHp\|\|0, e\.espritWho === 'any' \? 'any' : 'kin'\], e\)\}/.test(src), 'the card line: "Esprit +1/+1 (Any) — …" for an Any card');
ok(/\{name:'Kin', re:'kin', cs:true, text:'your own units that share a Type with this one \(never itself\)\.'\}/.test(src), 'Kin is a keyword with a gloss');
{ const eng = fs.readFileSync(path.join(H.ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/'espritHp', 'espritWho'/.test(eng) && /esprit:\['espritHp', 'espritWho'\]/.test(eng), "Irradiation doesn't treat espritWho as a skill of its own");
  ok(/\(t\.who === 'ally' \|\| t\.who === 'kin'\) && wide/.test(eng), 'Irradiation narrows a Kin action as it does an Ally one'); }
{ const cl = fs.readFileSync(path.join(H.ROOT, 'docs/CHANGELOG.md'), 'utf8'); const i = cl.indexOf('## 2026-10-18 (kin target)'); ok(i >= 0 && /Kin/.test(cl.slice(i, i + 3000)) && /Esprit/.test(cl.slice(i, i + 3000)), 'CHANGELOG: the 2026-10-18 (kin target) section'); }
console.log(`kin-target: ${n - fail}/${n} passed, ${fail} failure(s)`); process.exit(fail ? 1 : 0);
