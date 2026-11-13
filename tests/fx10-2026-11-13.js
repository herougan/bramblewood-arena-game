#!/usr/bin/env node
// 2026-11-13 (package FX10, owner 00:03): ten skill looks wired into fights, checked without a browser (tests/e2e/fx10_2026_11_13.py plays them in a real fight).
//   1. each SkillFX look (bramblewood-skillfx.js) against a fake DOM: one host, 2-8 spans, transform and opacity only, done by 1.15 s, the host removes itself;
//      shorter at 2x; one still opacity-only piece at 4x, with o.calm and under reduced motion; no card, nothing
//   2. fx10Vfx (arena_app.js) with stubs: each event plays its look on the right card, on the next frame, with the host, the box, the speed and calm; its cue
//      plays at every Effects level, the look not at None; one snow cue an avalanche; nothing in a hidden tab; nothing waits (no rule or timing touched)
//   3. the hook lines: renderVfxForEvent calls fx10Vfx; Brood without the summon ring and with its own cue; Confuse out of STATUS_ORBIT, its own cue;
//      a Delivery's log arc after its crate; the ten SoundKit cues; the engine untouched
//   4. CSS (no filter / blend mode), the Lab group, the catalogue, the cue sheet (59-68), the CHANGELOG, run-all.sh
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), sfx = rd('bramblewood-skillfx.js'), tpl = rd('arena_template.html');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const fnSrc = (src, name)=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0; for(let k = src.indexOf('{', src.indexOf(')', i)); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unclosed ' + name); };
const LOOKS = ['snowBury', 'igniteFlare', 'burnLick', 'spentPuff', 'broodDrop', 'confuseSpin', 'carrionFeed', 'deliveryCrate', 'skitterDash', 'playDead'];
const CUES = ['snowThump', 'igniteWhoosh', 'burnCrackle', 'spentPuff', 'silkDrop', 'confuseWarble', 'carrionCaw', 'crateThunk', 'skitterPatter', 'playDeadFlop'];

// ---- 1. the looks, against a fake DOM
function fakeDom(reduced){
  const made = [], hosts = [], timers = [], anims = [];
  const mk = tag=>({tagName:tag, className:'', style:{}, dataset:{}, children:[], isConnected:true, textContent:'', setAttribute(){}, remove(){ this.isConnected = false; },
    animate(kf, o){ anims.push({el:this, kf, o}); return {}; }, appendChild(c){ this.children.push(c); if(/\bfx10\b/.test(c.className)) made.push(c); return c; },
    querySelector: ()=> null, getBoundingClientRect: ()=> ({left:100, top:100, width:90, height:120, right:190, bottom:220})});
  const body = {appendChild(h){ hosts.push(h); return h; }};
  const doc = {createElement: t=> mk(t), createElementNS: (ns, t)=> mk(t), body, head:body, getElementById: ()=> null};
  const win = {matchMedia: ()=> ({matches: !!reduced})};
  const ctx = {document: doc, window: win, matchMedia: win.matchMedia, setTimeout: (f, ms)=>{ timers.push({f, ms}); return timers.length; }, getComputedStyle: ()=> ({opacity:'1'}), Math, console};
  ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(sfx, ctx);
  return {ctx, made, hosts, timers, anims, card: mk('div')};
}
const props = anims=>{ const s = new Set(); anims.forEach(a=> a.kf.forEach(k=> Object.keys(k).forEach(p=> s.add(p)))); return [...s]; };
LOOKS.forEach(name=>{
  { const r = fakeDom(false), F = r.ctx.window.SkillFX; ok(F && typeof F[name] === 'function', `${name}: on SkillFX`); if(!F || !F[name]) return;
    const T = F[name](r.card, {speed:1, from:r.card});
    ok(r.hosts.length === 1 && /fx-float-host/.test(r.hosts[0].className), `${name}: one host (its own, fixed, when the game passes none)`);
    ok(r.made.length >= 2 && r.made.length <= 8, `${name}: 2-8 spans (${r.made.length})`);
    ok(props(r.anims).every(p=> /^(transform|opacity|offset|easing)$/.test(p)), `${name}: transform and opacity only (${props(r.anims)})`);
    ok(r.anims.every(a=> a.o.duration + a.o.delay <= 1150) && T > 0 && T <= 1150, `${name}: every span done by 1.15 s (look ${T} ms)`);
    ok(r.timers.some(t=> t.ms <= T + 150), `${name}: its host removes itself after the look`);
    r.timers.forEach(t=> t.f()); ok(r.hosts[0].isConnected === false, `${name}: the host is gone when its timer fires`);
    ok(r.made.every(s=> /^fx10 fx10-/.test(s.className)), `${name}: spans carry fx10 classes`); }
  { const r = fakeDom(false), F = r.ctx.window.SkillFX, host = {className:'fx-float-host', dataset:{}, children:[], appendChild(c){ this.children.push(c); r.made.push(c); return c; }};
    F[name](r.card, {host, rect:{left:0, top:0, width:90, height:120}, speed:2, from:r.card});
    ok(r.hosts.length === 0 && host.children.length >= 2, `${name}: draws into the game's host (o.host) and makes none of its own`);
    ok(r.anims.every(a=> a.o.duration + a.o.delay <= 600), `${name}: at 2x every span is done by 0.6 s`); }
  [['4x', false, {speed:4}], ['calm (Effects Low)', false, {calm:true}], ['reduced motion', true, {}]].forEach(([lab, red, o])=>{
    const r = fakeDom(red), F = r.ctx.window.SkillFX; F[name](r.card, Object.assign({from:r.card}, o));
    ok(r.made.length === 1 && props(r.anims).every(p=> /^(opacity|offset)$/.test(p)), `${name}: ${lab}: one still piece, opacity only (${r.made.length})`);
    if(o.speed === 4) ok(r.anims.every(a=> a.o.duration <= 400), `${name}: 4x: the piece is gone by 0.4 s`); });
  { const r = fakeDom(false), F = r.ctx.window.SkillFX; ok(F[name](null, {}) === 0 && r.hosts.length === 0, `${name}: no card, nothing`); }
});
ok(!/setInterval|requestAnimationFrame|onUpdate/.test(fnSrc(sfx, 'f10Run') + LOOKS.map(nm=> fnSrc(sfx, nm)).join('')), 'the looks do no per-frame work');

// ---- 2. fx10Vfx with stubs
function hook(level, opts){
  opts = opts || {}; const calls = [], cues = [], hosts = [], once = new Set();
  const card = uid=> uid == null ? null : {uid, isConnected:true, getBoundingClientRect: ()=> ({left:10*uid, top:10, width:80, height:110}), querySelector: ()=> null};
  const SkillFX = {}; LOOKS.forEach(nm=> SkillFX[nm] = (el, o)=> calls.push({nm, uid: el.uid, o}));
  const SoundKit = {at: (p, fn)=> fn()}; CUES.forEach(k=> SoundKit[k] = ()=> cues.push(k));
  const ctx = {window:{SkillFX}, SoundKit, matchState:{speedMult: opts.speed || 1}, document:{hidden: !!opts.hidden}, innerWidth:1366, Math, performance:{now: ()=> 0},
    boardCardEl: card, fxHostAt: (el, ms, r)=>{ const h = {ms, r}; hosts.push(h); return h; }, fxAtLeast: l=> ({none:0, low:1, med:2, high:3}[level] >= ({low:1, med:2, high:3}[l])), reducedMotion: ()=> false,
    skillFxOnce: k=> once.has(k) ? false : (once.add(k), true), requestAnimationFrame: f=>{ ctx.__raf.push(f); }, setTimeout: (f, ms)=>{ ctx.__to.push({f, ms}); }, __raf:[], __to:[]};
  vm.createContext(ctx); vm.runInContext(fnSrc(app, 'fx10Vfx'), ctx);
  const fire = ev=>{ ctx.fx10Vfx(ev); const sync = calls.length; for(let k = 0; k < 5; k++){ ctx.__to.splice(0).forEach(t=> t.f()); ctx.__raf.splice(0).forEach(f=> f()); } return sync; };
  return {fire, calls, cues, hosts, ctx};
}
const EVS = [
  ['snowBury', 'snowThump', 2, {type:'statusFx', kind:'avalancheWait', side:'B', attUid:1, targetSide:'A', targetUid:2, amount:1}],
  ['igniteFlare', 'igniteWhoosh', 2, {type:'statusFx', kind:'en20Ignite', side:'A', attUid:2, targetUid:2, amount:1, total:1}],
  ['burnLick', 'burnCrackle', 3, {type:'burnTick', side:'A', uid:3, dmg:1, left:1}],
  ['spentPuff', 'spentPuff', 4, {type:'skillSpent', side:'B', uid:4, keys:['delivery', 'triggers:onReady']}],
  ['broodDrop', null, 6, {type:'spawn', kind:'brood', cause:'triggerSpawn', side:'B', uids:[6], nearUid:5}],
  ['confuseSpin', null, 2, {type:'statusFx', kind:'confuse', side:'B', attUid:1, targetUid:2}],
  ['carrionFeed', 'carrionCaw', 5, {type:'statusFx', kind:'carrion', side:'B', attUid:5, targetUid:5, amount:2, fromUid:7}],
  ['deliveryCrate', 'crateThunk', 4, {type:'lumber', side:'B', uid:4, amount:1, cause:'delivery'}],
  ['skitterDash', 'skitterPatter', 8, {type:'statusFx', kind:'skitter', side:'A', attUid:8, targetUid:8, amount:1}],
  ['playDead', 'playDeadFlop', 2, {type:'statusFx', kind:'thanatosis', side:'A', attUid:2, targetUid:2}],
];
EVS.forEach(([nm, cue, uid, ev])=>{
  { const h = hook('high', {speed:2}), sync = h.fire(ev), c = h.calls[0];
    ok(sync === 0, `${nm}: nothing drawn inside the event's own task (it starts on the next frame)`);
    ok(h.calls.length === 1 && c.nm === nm && c.uid === uid, `${ev.type}${ev.kind ? ' ' + ev.kind : ''}: plays ${nm} on unit ${uid} (${h.calls.map(x=> x.nm + '@' + x.uid)})`);
    if(c) ok(c.o.host === h.hosts[0] && c.o.rect && c.o.rect.width === 80 && c.o.speed === 2 && c.o.calm === false && h.hosts[0].ms >= 1150, `${nm}: with fxHostAt's host (kept ${h.hosts[0] && h.hosts[0].ms} ms), the box, the speed, not calm`);
    ok(cue ? h.cues.length === 1 && h.cues[0] === cue : true, `${nm}: its cue ${cue} (${h.cues})`); }
  { const h = hook('low'); h.fire(ev); ok(h.calls.length === 1 && h.calls[0].o.calm === true, `${nm}: Effects Low: calm`); }
  { const h = hook('none'); h.fire(ev); ok(h.calls.length === 0 && (cue ? h.cues.length === 1 : true), `${nm}: Effects None: no look, the cue still plays`); }
  { const h = hook('high', {hidden:true}); h.fire(ev); ok(h.calls.length === 0 && h.cues.length === 0, `${nm}: nothing starts in a hidden tab`); }
});
{ const h = hook('high'); h.fire(EVS[6][3]); const c = h.calls[0]; ok(c && c.o.fromRect && c.o.fromRect.left === 70, 'Carrion: the fallen unit\'s box is read before the host goes in (fromRect)'); }
{ const h = hook('high'); h.fire(EVS[4][3]); const c = h.calls[0]; ok(c && c.o.fromRect && c.o.fromRect.left === 50, 'Brood: the mother\'s box is passed (fromRect)'); }
{ const h = hook('high'); h.fire(EVS[0][3]); h.fire(Object.assign({}, EVS[0][3], {targetUid:3})); ok(h.calls.length === 2 && h.cues.filter(k=> k === 'snowThump').length === 1, 'Avalanche: every buried unit gets snow, one thump an avalanche'); }
{ const h = hook('high'); ['hit', 'death', 'poisonTick'].forEach(t=> h.fire({type:t, side:'A', uid:2, attUid:1, targetUid:2})); h.fire({type:'statusFx', kind:'freeze', targetUid:2}); h.fire({type:'lumber', side:'A', uid:2, amount:1});
  ok(h.calls.length === 0 && h.cues.length === 0, 'other events (a hit, a death, a Poison tick, Freeze, a plain Lumber gain) draw nothing here'); }
const F10 = fnSrc(app, 'fx10Vfx');
ok(!/\bawait\b|\bsleep\(|matchState\.(resolving|players)\s*=|\.hp\s*=|\.wait\s*=/.test(F10), 'fx10Vfx changes nothing in the fight and waits for nothing');

// ---- 3. the hook lines
const RV = fnSrc(app, 'renderVfxForEvent');
ok(/try\{ fx10Vfx\(ev\); \}catch\(e\)\{\}/.test(RV), 'renderVfxForEvent calls fx10Vfx (guarded)');
ok(/ev\.kind !== 'brood' \/\* FX10/.test(fnSrc(app, 'eighthPassVfx')), 'Brood no longer gets the shared summon ring');
ok(/else if\(ev\.kind === 'brood'\) SoundKit\.silkDrop\(\);/.test(app), 'Brood\'s spawn cue is silkDrop (was the spawn buzz)');
ok(/const STATUS_ORBIT = \{[^}]*\}/.test(app) && !/confuse/.test(app.match(/const STATUS_ORBIT = \{[^}]*\}/)[0]), 'Confuse is out of the Stun orbit table');
ok(/ev\.kind==='confuse'\)\{ SoundKit\.confuseWarble\(\);/.test(app), 'Confuse\'s cue is confuseWarble (was Blind\'s tone)');
ok(/if\(ev\.cause === 'delivery'\) at\(Math\.round\(380 \/ Math\.min\(3, matchState\.speedMult \|\| 1\)\), arc\); else arc\(\);/.test(app), 'a Delivery\'s logs leave the crate (the arc waits 380 ms; every other loot arc as before)');
const SK = app.slice(app.indexOf('const SoundKit = (()=>{'), app.indexOf('const SoundKit = (()=>{') + 400000);
CUES.forEach(k=> ok(new RegExp('\\n    ' + k + '\\(\\)\\{').test(SK), `SoundKit.${k}`));
ok(!/FX10|fx10/.test(rd('bramblewood-engine.js')) && !/fx10/i.test(rd('canonical/cards.json').slice(0, 2000000)), 'the engine and the cards are untouched');

// ---- 4. CSS, Lab, docs
const css = (tpl.match(/\.fx-float-host > \.fx10[^{]*\{[^}]*\}/g) || []).join('\n');
ok(css.length > 500 && !/filter:|mix-blend-mode/.test(css), 'the fx10 spans: no filter, no blend mode');
ok(/\.fx-float-host > \.fx10\{[^}]*will-change:transform, opacity/.test(tpl), 'the spans hint transform / opacity only');
const lab = rd('tools/effects-lab/manifest/fx10.js');
ok((lab.match(/^E\('/gm) || []).length === 10 && LOOKS.every(nm=> lab.includes("'" + nm + "'")), 'ten Lab entries, one a look');
ok(/area:'fx10'/.test(lab) && /\['fx10', 'FX10', 'FX10'\]/.test(rd('tools/effects-lab/fxlab-catalogue.js')), 'the Lab group "FX10"');
const cat = rd('docs/effects-catalogue.md');
ok(/## 2026-11-13 \(package FX10\)/.test(cat) && LOOKS.every(nm=> cat.includes(nm)), 'effects catalogue: the FX10 section names every look');
const cue = rd('docs/sfx-cue-sheet.md');
ok(CUES.every((k, i)=> new RegExp('^\\| ' + (59 + i) + ' \\|[^\\n]*`' + k + '`', 'm').test(cue)), 'cue sheet: cues 59-68');
ok(/## 2026-11-13 Package FX10/.test(rd('docs/CHANGELOG.md').slice(0, 40000)), 'CHANGELOG entry');
ok(/run node tests\/fx10-2026-11-13\.js/.test(rd('tests/run-all.sh')), 'this test is in run-all.sh');
ok(fs.existsSync(path.join(ROOT, 'docs/art/fx10-sheet.png')), 'the contact sheet docs/art/fx10-sheet.png');
console.log(fail ? `fx10: ${fail} of ${n} checks FAILED` : `fx10: all ${n} checks passed`); process.exit(fail ? 1 : 0);
