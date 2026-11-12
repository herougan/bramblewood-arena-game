#!/usr/bin/env node
// 2026-11-13 (package FX9, owner notes 23:47): the effect changes, checked without a browser (tests/e2e/fx9_2026_11_13.py plays them in a real fight).
//   #1 dawn's rosy wash 10% fainter            #5 Guardian plates only while it can guard   #6 Ambush (and fxHostAt hosts) ride their card / the camera
//   #7 your pitch flies into the Graveyard      #8 Sleep's blue Zs                           #14 the tortoise shell   #15 the dragon's four flights
//   #17 Stampede straight at the Health bar     plus the Lab entries, the catalogue, the cue sheet and the CHANGELOG
// The effect functions run against a small fake DOM: where their pieces go (the card, the board frame, never fixed on the page), how many, what they
// animate (transform / opacity, and the CSS rotate / translate / scale properties for the sway and the drop), and what Low / None / reduced motion leave.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('arena_app.js'), tpl = rd('arena_template.html'), eng = rd('bramblewood-engine.js'), fxb = rd('bramblewood-fx-b.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`);
  if(i < 0){ i = src.indexOf(`\nconst ${name} = `); if(i < 0) throw new Error('no ' + name); // a const: an IIFE up to its })(); or one line
    return /^\nconst \w+ = \(\(\)=>/.test(src.slice(i, i + 80)) ? src.slice(i, src.indexOf('})();', i) + 5) : src.slice(i, src.indexOf('\n', i + 1)); }
  let d = 0; for(let k = src.indexOf('{', src.indexOf(')', i)); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unclosed ' + name); };

// ---------------------------------------------------------------- a small fake DOM
function dom(){
  const anims = [], timers = [], bodyAdds = [];
  const has = (el, s)=> s.startsWith('.') ? (' ' + el.className + ' ').includes(' ' + s.slice(1) + ' ') : s.startsWith('#') ? el.id === s.slice(1) : /^\[data-row="enemy"\]$/.test(s) ? el.dataset.row === 'enemy' : false;
  class El {
    constructor(cls, o){ o = o || {}; this.className = cls || ''; this.id = o.id || ''; this.children = []; this.parent = null; this.style = {}; this.dataset = {}; this.attrs = {}; this.isConnected = true; this.textContent = '';
      const r0 = o.rect || {left:100, top:100, width:80, height:100}; this.rect = Object.assign({right:r0.left + r0.width, bottom:r0.top + r0.height}, r0); this.offsetWidth = o.w || this.rect.width; this.offsetHeight = o.h || this.rect.height; this.q = o.q || {}; }
    get classList(){ const me = this, list = ()=> me.className.split(/\s+/).filter(Boolean);
      return {add: (...c)=>{ me.className = [...new Set(list().concat(c))].join(' '); }, remove: (...c)=>{ me.className = list().filter(x=> !c.includes(x)).join(' '); }, contains: c=> list().includes(c),
        toggle: (c, on)=>{ if(on === undefined) on = !list().includes(c); if(on) me.classList.add(c); else me.classList.remove(c); return on; }}; }
    appendChild(c){ c.parent = this; c.isConnected = this.isConnected; this.children.push(c); return c; }
    insertAdjacentHTML(pos, html){ const c = new El('html'); c.html = html; this.appendChild(c); }
    animate(kf, o){ const a = {el:this, kf, o:o || {}}; anims.push(a); return a; }
    getBoundingClientRect(){ return this.rect; }
    closest(sel){ const parts = sel.split(',').map(s=> s.trim()); for(let e = this; e; e = e.parent) if(parts.some(p=> has(e, p))) return e; return null; }
    querySelector(sel){ if(sel in this.q) return this.q[sel]; return null; }
    querySelectorAll(sel){ return this.q[sel] || []; }
    setAttribute(k, v){ this.attrs[k] = String(v); } getAttribute(k){ return k in this.attrs ? this.attrs[k] : null; }
    remove(){ this.isConnected = false; if(this.parent) this.parent.children = this.parent.children.filter(x=> x !== this); }
    all(){ return this.children.reduce((a, c)=> a.concat([c], c.all()), []); }
  }
  const document = {createElement: ()=> new El(''), body: {appendChild(h){ bodyAdds.push(h); return h; }}, getElementById: ()=> null, querySelector: ()=> null, querySelectorAll: ()=> []};
  return {El, document, anims, timers, bodyAdds};
}
function ctxFor(d, o){ o = o || {}; const lv = o.level || 'high', L = {none:0, low:1, med:2, high:3};
  const c = {document:d.document, setTimeout:(f, ms)=>{ d.timers.push({f, ms}); return d.timers.length; }, clearTimeout(){}, reducedMotion:()=> !!o.reduced, fxLevel:()=> lv, fxAtLeast:l=> L[lv] >= L[l],
    matchState:o.match || null, SoundKit:{}, noteMatchFx:(ms)=>{ c.__note = ms; }, ui23Rect:r=> r && r.width > 0 ? r : null, Math, console, Promise, String, Number, Object, Array, Set, Map, encodeURIComponent, isNaN};
  vm.createContext(c); return c; }
const props = (anims, f)=>{ const s = new Set(); anims.filter(f || (()=> true)).forEach(a=> a.kf.forEach(k=> Object.keys(k).forEach(p=> s.add(p)))); return [...s]; };
const LOAD = names=> names.map(fnSrc).join('\n');

// ---------------------------------------------------------------- #1 dawn
ok(/yPercent:0, opacity:\.9, duration:\.7/.test(fxb) && /filter:'brightness\(1\.4\) drop-shadow\(0 0 8px #ffd0e0\)'/.test(fxb), '#1 the dawn\'s rosy wash peaks at .9 (was 1), the decks\' flash at 1.4 (was 1.45)');
ok(/rgba\(255,150,170,\.6\)/.test(fxb), '#1 the wash keeps its rosy colours');

// ---------------------------------------------------------------- #5 Guardian
ok(/function blockerReady\(n\)\{ return !!n && (!inRitual\(n\)[^&]*&& )?!\(n\.wait > 0\) && !n\.stunned && !\(n\.frozen > 0\) && !dozing\(n\) && !n\.petrified && !\(n\.bound > 0\) && !n\.chained; \}/.test(eng), '#5 engine blockerReady unchanged (rules untouched)'); // 2026-11-13: ENG-RC1's Ritual check may come first
ok(/const guards = !!\(\(d\.effects\|\|\{\}\)\.guardian\) && !fog/.test(src), '#5 every Guardian still carries its plates element (shown or hidden by class)');
ok(/\$\{guards\?'has-guard ' \+ fx9GuardCls\(c\)/.test(src), '#5 boardCardHTML adds the Ready state class');
ok(/fx9GuardSync\(el, c\); \/\/ 2026-11-13 \(package FX9 #5\)/.test(fnSrc('updateCardStatusDisplay')) && /fx9GuardSync\(el, currentCardByUid\(uid\)\)/.test(fnSrc('updateCardWaitDisplay')), '#5 a live status or Wait change re-syncs the plates');
ok(/playReadyFlourish\(ev\.uid\);\s*try\{ fx9GuardSync\(boardCardEl\(ev\.uid\), currentCardByUid\(ev\.uid\)\)/.test(src), '#5 the ready event swings the plates out');
ok(/!el\.classList\.contains\('guard-down'\) \/\* FX9 #5/.test(fnSrc('deathVfx')), '#5 a Guardian that dies without its plates shown plays no plate break');
{ const d = dom(), m = {}, c = ctxFor(d, {match:m}); vm.runInContext(LOAD(['fx9GuardUp', 'fx9GuardMem', 'fx9GuardCls', 'fx9GuardSync']), c);
  const up = x=> vm.runInContext('fx9GuardUp(' + JSON.stringify(x) + ')', c);
  ok(up({uid:1}) === true, '#5 a Ready Guardian can guard');
  [{wait:1}, {stunned:true}, {frozen:1}, {asleep:1}, {playingDead:2}, {petrified:true}, {bound:1}, {chained:true}, {hibernating:true}, {diveAloft:0}].forEach(x=> ok(up(Object.assign({uid:1}, x)) === false, '#5 no plates while ' + JSON.stringify(x)));
  ok(up({uid:1, playingDead:false}) === true, '#5 playingDead:false is not playing dead');
  const cls = x=> vm.runInContext('fx9GuardCls(' + JSON.stringify(x) + ')', c);
  ok(cls({uid:7, wait:2}) === 'guard-down', '#5 first drawn while Waiting: hidden, no animation');
  ok(cls({uid:7, wait:2}) === 'guard-down', '#5 drawn again unchanged: no animation');
  ok(cls({uid:7}) === ' gp-rise', '#5 drawn again Ready: the plates swing out');
  ok(cls({uid:7, stunned:true}) === 'guard-down gp-fall', '#5 drawn again Stunned: they fold in');
  const el = new d.El('board-card has-guard'); c.__el = el;
  vm.runInContext('fx9GuardSync(__el, {uid:9})', c); ok(!el.classList.contains('guard-down'), '#5 sync: Ready shows the plates');
  vm.runInContext('fx9GuardSync(__el, {uid:9, wait:1})', c); ok(el.classList.contains('guard-down') && el.classList.contains('gp-fall'), '#5 sync: gaining Wait folds them (gp-fall)');
  vm.runInContext('fx9GuardSync(__el, {uid:9})', c); ok(!el.classList.contains('guard-down') && el.classList.contains('gp-rise') && !el.classList.contains('gp-fall'), '#5 sync: Ready again swings them out (gp-rise)');
  const c2 = ctxFor(d, {match:{}, level:'none'}); vm.runInContext(LOAD(['fx9GuardUp', 'fx9GuardMem', 'fx9GuardCls', 'fx9GuardSync']), c2); const el2 = new d.El('board-card has-guard'); c2.__el = el2;
  vm.runInContext('fx9GuardSync(__el, {uid:3, wait:1})', c2); ok(el2.classList.contains('guard-down') && !el2.classList.contains('gp-fall'), '#5 Effects None: the plates just go, no animation'); }
ok(/\.board-card\.guard-down \.guard-plates\{opacity:0; scale:\.45 1;\}/.test(tpl) && /\.board-card\.guard-down:not\(\.gp-fall\) \.guard-plates\{visibility:hidden;\}/.test(tpl), '#5 CSS: hidden plates fold behind the card and are not painted');
ok(/\.board-card\.guard-down \.guard-plates i::after\{animation:none; transform:translateX\(-110%\);\}/.test(tpl), '#5 CSS: the sheen loop stops while hidden');
ok(/@keyframes fx9GuardSheen\{0%,60%\{transform:translateX\(-110%\);\} 100%\{transform:translateX\(110%\);\}\}/.test(tpl) && /\.board-card\.has-guard \.guard-plates i::after\{[^}]*animation:fx9GuardSheen/.test(tpl), '#5 CSS: the sheen sweeps by transform (no repaint per frame)');
ok(/@keyframes fx9GuardRise\{from\{opacity:0; scale:\.45 1;\} to\{opacity:1; scale:1 1;\}\}/.test(tpl) && /@keyframes fx9GuardFall\{/.test(tpl), '#5 CSS: rise / fall animate opacity and scale only');
ok(/html\[data-fx="none"\] \.board-card:is\(\.gp-rise, \.gp-fall\) \.guard-plates\{animation:none;\}/.test(tpl) && /prefers-reduced-motion: reduce\)\{ \.board-card\.has-guard \.guard-plates i::after\{animation:none; transform:translateX\(-110%\);\} \.board-card\.guard-down \.guard-plates\{scale:none;\}[^}]*fx9GuardIn0/.test(tpl), '#5 CSS: None has no animation, reduced motion only fades (and no sheen)');

// ---------------------------------------------------------------- #6 Ambush, fxHostAt, the patches
{ const d = dom(), c = ctxFor(d); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece', 'fx9AmbushVfx']), c);
  const bf = new d.El('battlefield'), a = bf.appendChild(new d.El('board-card')), t = bf.appendChild(new d.El('board-card', {rect:{left:100, top:-60, width:80, height:100}})); c.__a = a; c.__t = t;
  vm.runInContext('fx9AmbushVfx(__a, __t)', c);
  const host = a.children.find(x=> /fx9-host/.test(x.className)), pcs = host ? host.children : [];
  ok(!!host && d.bodyAdds.length === 0, '#6 Ambush: one host inside the ambusher\'s card, nothing on the page body');
  ok(pcs.length >= 10 && pcs.length <= 12, `#6 Ambush: shade, eyes, 7 smoke puffs, the slash (${pcs.length})`);
  ok(props(d.anims).every(p=> /^(transform|opacity|offset|easing)$/.test(p)), '#6 Ambush: transform and opacity only (' + props(d.anims) + ')');
  ok(d.anims.every(x=> (x.o.duration || 0) + (x.o.delay || 0) <= 1000) && d.timers.some(x=> x.ms <= 1000), '#6 Ambush: done within 1 s, the host removes itself');
  const sl = pcs.find(x=> /fx9-slash/.test(x.className)); ok(sl && /rotate\(-90\.0deg\)/.test(JSON.stringify(sl && d.anims.find(x=> x.el === sl).kf)), '#6 Ambush: the slash points at the unit it strikes (straight up here)'); }
{ const d = dom(), c = ctxFor(d, {reduced:true}); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece', 'fx9AmbushVfx']), c); const a = new d.El('board-card'); c.__a = a;
  vm.runInContext('fx9AmbushVfx(__a, null)', c); ok(a.children[0].children.length === 2 && props(d.anims).every(p=> /^(opacity|offset)$/.test(p)), '#6 Ambush, reduced motion: shade and eyes, opacity only');
  const d2 = dom(), c2 = ctxFor(d2, {level:'none'}); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece', 'fx9AmbushVfx']), c2); const a2 = new d2.El('board-card'); c2.__a = a2; vm.runInContext('fx9AmbushVfx(__a, null)', c2); ok(a2.children.length === 0, '#6 Ambush, Effects None: nothing'); }
{ const d = dom(), c = ctxFor(d); vm.runInContext(LOAD(['fx9CardHost', 'ambushEcho']), c); const a = new d.El('board-card'); c.__a = a;
  const nr = vm.runInContext('ambushEcho(__a)', c); const host = a.children[0];
  ok(nr === 3 && host && host.children.length === 3 && d.bodyAdds.length === 0 && host.children.every(r=> r.style.position === 'absolute'), '#6 the echo rings are children of the card, not fixed on the page'); }
{ const d = dom(), c = ctxFor(d); vm.runInContext(LOAD(['fx9CamHost', 'fxHostAt']), c);
  const cam = new d.El('battlefield-inner', {id:'battlefieldInner', rect:{left:0, top:0, width:400, height:400}}), card = cam.appendChild(new d.El('board-card', {rect:{left:120, top:200, width:60, height:75}}));
  const realAppend = cam.appendChild.bind(cam); cam.appendChild = h=>{ realAppend(h); h.getBoundingClientRect = ()=> ({left:10, top:20, width:60*.5, height:75*.5}); return h; }; c.__card = card;
  const h = vm.runInContext('fxHostAt(__card, 900)', c);
  ok(h.parent === cam && d.bodyAdds.length === 0 && h.style.position === 'absolute' && h.style.scale === '2.0000' && h.style.left === '220.0px' && h.style.top === '360.0px' && /fx9-cam/.test(h.className), '#6 fxHostAt over a board card: in the camera layer, counter-scaled, at the card (' + JSON.stringify([h.style.left, h.style.top, h.style.scale]) + ')');
  const off = new d.El('pill'); c.__off = off; vm.runInContext('fxHostAt(__off, 900)', c); ok(d.bodyAdds.length === 1, '#6 fxHostAt off the board: fixed on the page as before'); }
ok(/const keptFx = \[\.\.\.document\.querySelectorAll\('#battlefieldInner > \.fx9-cam'\)\]/.test(src) && /keptFx\.forEach\(h=> inn\.appendChild\(h\)\)/.test(src), '#6 the round-end redraw carries camera-layer effects into the new board');
ok(/A\.ambushStrike = \(att, tgt\)=> fx9AmbushVfx\(att, tgt\); A\.shellCrack = el=> fx9ShellBreakVfx\(el\); A\.stampede = \(from, castle\)=> fx9StampedeVfx\(from, castle\);/.test(src) && /C\.dragonArrive = \(el, o\)=> fx9DragonArrive\(el, o\);/.test(src), '#6 #14 #15 #17 fights play FX9\'s versions (fx9PatchFx)');

// ---------------------------------------------------------------- #7 the Graveyard
{ const dc = fnSrc('discardCardByUid'), pg = fnSrc('ui16PitchToGrave');
  ok(/async function discardCardByUid\(uid, at\)/.test(dc) && /const pitchTile = document\.querySelector\(`#handStrip \.card-tile\[data-handuid=/.test(dc), '#7 the pitch knows the hand tile and where it was let go');
  ok(/if\(activePid === viewerHandPid\(m\) && pitchTile\) ui16PitchToGrave\(m, pitchTile, \{defId: dc\.defId, gains: gainChips, at\}\);/.test(dc), '#7 your own pitch flies into the pile (UI16\'s flight), with its gains');
  ok(/discardCardByUid\(uid, e\.clientX \|\| e\.clientY \? \{x: e\.clientX, y: e\.clientY\} : null\)/.test(src), '#7 a drop on the pile starts the flight where the card was let go');
  ok(/const gains = ev\.gains \|\| /.test(pg) && /if\(ev\.at && ev\.at\.x > 0 && ev\.at\.y > 0\) r = /.test(pg) && /else if\(!ev\.gains\) SoundKit\.gold\(\)/.test(pg), '#7 ui16PitchToGrave takes the gains and the drop point (no second coin sound)');
  ok(/reducedMotion\(\) \|\| lvl === 'none'\)\{ land\(\); return; \}/.test(pg), '#7 reduced motion / Effects None: only the gain, no flight'); }

// ---------------------------------------------------------------- #8 Sleep
ok(/\$\{c\.asleep>0\?FX9_ZZZ_HTML/.test(src) && !/sleep-overlay">💤/.test(fnSrc('boardCardHTML')), '#8 a sleeper is drawn with the Zs (no 💤 overlay)');
ok(/fx9ZzzSync\(tile, c\.asleep>0\)/.test(fnSrc('updateCardStatusDisplay')), '#8 the Zs come and go with a live status change');
{ const d = dom(), c = ctxFor(d); vm.runInContext(fnSrc('FX9_ZZZ_HTML') + '\n' + LOAD(['fx9ZzzSync']), c); const t = new d.El('card-tile'); c.__t = t;
  vm.runInContext('fx9ZzzSync(__t, true)', c); ok(t.children.length === 1 && (t.children[0].html.match(/<i>Z<\/i>/g) || []).length === 3, '#8 three Zs'); }
{ const z = tpl.slice(tpl.indexOf('.card-tile > .fx9-zzz{'), tpl.indexOf('.card-tile > .fx9-zzz.is-waking')), kf = (z.match(/@keyframes fx9Zzz\{[^\n]*\}\}/) || [''])[0];
  ok(/right:24%; top:14%/.test(z) && /translate\(1\.1em, -2\.2em\)/.test(kf), '#8 they start near the top-right corner and drift up and right, out of the card');
  ok(/color:#b4e6ff/.test(z) && /-webkit-text-stroke:1px #0b3566/.test(z) && /clamp\(15px, 30cqw, 23px\)/.test(z), '#8 light blue with a dark edge and a glow, at least 15 px (readable at 390)');
  ok(!/filter:/.test(z) && kf && !/(left|top|width|height|filter|margin)\s*:/.test(kf), '#8 no filter; the loop animates transform and opacity only');
  ok(/animation:fx9Zzz 3\.6s linear infinite/.test(z), '#8 a slow loop (3.6 s)');
  ok(/html\[data-fx="low"\] \.fx9-zzz > i, html\[data-fx="none"\] \.fx9-zzz > i\{animation:none;\}/.test(tpl) && /prefers-reduced-motion: reduce\)\{ \.fx9-zzz > i\{animation:none;\}/.test(tpl), '#8 Low, None and reduced motion: still Zs'); }

// ---------------------------------------------------------------- #14 the tortoise shell
{ const d = dom(), c = ctxFor(d); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece', 'FX9_SHELL', 'fx9ShellBreakVfx']), c);
  const S = vm.runInContext('FX9_SHELL', c), art = decodeURIComponent(S.art);
  ok(S.pieces.length === 9 && S.pieces.every(p=> /^polygon\(/.test(p.clip)), '#14 nine plates, each clipped to its scute');
  ok((art.match(/<polygon /g) || []).length === 9*3 + 9 && /radialGradient/.test(art) && /rx='39' ry='38'/.test(art), '#14 the carapace: 9 scutes with growth rings and highlights, seams, the marginal ring');
  const card = new d.El('board-card'); c.__c = card; vm.runInContext('fx9ShellBreakVfx(__c)', c); const host = card.children[0];
  ok(host && /fx9-shellbox/.test(host.className) && host.children.length === 10 && d.bodyAdds.length === 0, '#14 nine plates and the crack lines, inside the card');
  ok(props(d.anims).every(p=> /^(transform|opacity|offset|easing)$/.test(p)) && d.anims.every(x=> (x.o.duration || 0) <= 1100), '#14 transform and opacity only, done by 1.1 s');
  const d2 = dom(), c2 = ctxFor(d2, {level:'low'}); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece', 'FX9_SHELL', 'fx9ShellBreakVfx']), c2); const k2 = new d2.El('board-card'); c2.__c = k2; vm.runInContext('fx9ShellBreakVfx(__c)', c2);
  ok(k2.children[0].children.length === 1 && props(d2.anims).every(p=> /^(opacity|offset)$/.test(p)), '#14 Effects Low: the whole shell fades in and out'); }
ok(/shellCrackTone\(\)\{ fnoise\(/.test(src) && /dragonGust\(\)\{ fnoise\(/.test(src), '#14 #15 cues built from fnoise / tone');

// ---------------------------------------------------------------- #15 the dragon
function dragon(dir, level, reduced){
  const d = dom(), c = ctxFor(d, {level, reduced}); vm.runInContext(LOAD(['fx9CardHost', 'fx9Piece']) + '\n' + fnSrc('FX9_DRAGON_DIRS') + '\n' + fnSrc('FX9_DRAGON_SVG') + '\n' + LOAD(['fx9DragonArrive']), c);
  const bf = new d.El('battlefield', {id:'battlefieldEl', rect:{left:0, top:0, width:800, height:500}}), card = bf.appendChild(new d.El('board-card', {rect:{left:360, top:100, width:80, height:100}})), tile = card.appendChild(new d.El('card-tile', {rect:card.rect}));
  card.q['.card-tile'] = tile; const others = [0, 1, 2, 3].map(i=> new d.El('card-tile', {rect:{left:100 + i*170, top:300, width:80, height:100}})); bf.q['.board-row > .board-card:not(.empty-slot) .card-tile'] = others.concat([tile]);
  c.__card = card; c.__bf = bf; vm.runInContext(`fx9DragonArrive(__card, {host:__bf${dir ? `, dir:'${dir}'` : ''}})`, c); return {d, c, bf, card, tile, others}; }
{ const r = dragon('ltr'), sky = r.bf.children.find(x=> /fx9-sky/.test(x.className)), sh = r.d.anims.find(x=> /fx9-dshadow/.test(x.el.className));
  ok(!!sky && r.d.bodyAdds.length === 0, '#15 the flight is drawn in the board frame');
  ok(sh && /translate\(-\d+px/.test(sh.kf[0].transform) && /translate\(1\d{3}px/.test(sh.kf[3].transform), '#15 ltr: the shadow enters off the left edge and leaves off the right');
  ok(props(r.d.anims, x=> !r.others.includes(x.el) && x.el !== r.tile).every(p=> /^(transform|opacity|offset|easing)$/.test(p)), '#15 shadow, wings and dim: transform and opacity only');
  const sway = r.d.anims.filter(x=> r.others.includes(x.el)); ok(sway.length >= 2 && props(sway).every(p=> /^(rotate|translate|offset)$/.test(p)), `#15 the cards near its path sway (CSS rotate / translate, ${sway.length} cards)`);
  ok(props(r.d.anims, x=> x.el === r.tile).every(p=> /^(opacity|translate|scale|offset)$/.test(p)), '#15 the dragon drops in by opacity / translate / scale (GSAP keeps transform)');
  ok(r.c.__note >= 1800 && r.c.__note <= 2100, '#15 the round waits for the landing (' + r.c.__note + ' ms)');
  ok(!/mix-blend|multiply/.test(fnSrc('fx9DragonArrive')) && !/mix-blend/.test(tpl.slice(tpl.indexOf('.battlefield > .fx9-sky'), tpl.indexOf('.fx9-dshadow > .fx9-dwings'))), '#15 no blend-mode layer over the board'); }
{ const paths = ['ltr', 'rtl', 'dive', 'back'].map(dir=>{ const r = dragon(dir), sh = r.d.anims.find(x=> /fx9-dshadow/.test(x.el.className)); return sh.kf[0].transform + '>' + sh.kf[3].transform; });
  ok(new Set(paths).size === 4, '#15 four different flights');
  const r = dragon('dive'), sh = r.d.anims.find(x=> /fx9-dshadow/.test(x.el.className)); ok(/translate\(400px, 150px\)/.test(sh.kf[3].transform), '#15 the dive ends on the dragon\'s slot');
  }
{ const r = dragon(null, 'low'); ok(!r.bf.children.some(x=> /fx9-sky/.test(x.className)) && r.d.anims.some(x=> x.el === r.tile), '#15 Effects Low: the drop only, no sky');
  const q = dragon(null, 'high', true); ok(q.d.anims.length === 1 && props(q.d.anims).every(p=> /^(opacity|offset)$/.test(p)), '#15 reduced motion: it fades in');
  const z = dragon(null, 'none'); ok(z.d.anims.length === 0, '#15 Effects None: nothing'); }
{ const d = dom(), c = ctxFor(d); vm.runInContext(fnSrc('FX9_DRAGON_DIRS') + '\n' + fnSrc('FX9_DRAGON_SVG'), c); const svg = decodeURIComponent(vm.runInContext('FX9_DRAGON_SVG', c));
  ok(/feGaussianBlur/.test(svg) && (svg.match(/<path /g) || []).length >= 6, '#15 a top-down silhouette (two wings, body, tail, horns), its soft edge drawn into the image (no live filter)'); }

// ---------------------------------------------------------------- #17 Stampede
function stampede(level, reduced){
  const d = dom(), c = ctxFor(d, {level, reduced}); vm.runInContext(LOAD(['fx9Piece', 'fx9StampedeVfx']), c);
  const bf = new d.El('battlefield', {rect:{left:0, top:0, width:800, height:600}}), bar = new d.El('bf-hp', {rect:{left:40, top:10, width:720, height:20}}), from = bf.appendChild(new d.El('board-card', {rect:{left:520, top:400, width:80, height:100}}));
  bf.q['.bf-hp[data-hpribbon="B"]'] = bar; const castle = new d.El('hq'); castle.setAttribute('data-hq', 'B'); c.__f = from; c.__c = castle;
  vm.runInContext('fx9StampedeVfx(__f, __c)', c); return {d, c, bf, bar}; }
{ const r = stampede('high'), run = r.bf.children.find(x=> /fx9-run/.test(x.className)), hooves = run ? run.children.filter(x=> /fx9-hoof/.test(x.className)) : [];
  ok(!!run && r.d.bodyAdds.length === 0, '#17 drawn in the board frame');
  ok(hooves.length === 8 && hooves.every(h=> Math.abs(parseFloat(/left:(-?\d+)px/.exec(h.style.cssText)[1]) - 560) <= 7), '#17 the hoof prints run straight ahead of the killer (its column, x 560)');
  const tops = hooves.map(h=> parseFloat(/top:(-?\d+)px/.exec(h.style.cssText)[1])); ok(tops.every((t, i)=> !i || t < tops[i - 1]) && tops[tops.length - 1] > 20, '#17 they lead up to the enemy bar');
  const ring = run.children.find(x=> /fx9-ring/.test(x.className)); ok(ring && /left:560px; top:20px/.test(ring.style.cssText), '#17 the burst lands on the bar, straight ahead (not its centre)');
  ok(props(r.d.anims).every(p=> /^(transform|opacity|offset|easing)$/.test(p)), '#17 transform and opacity only');
  r.d.timers.filter(t=> t.ms === 430).forEach(t=> t.f()); ok(r.d.anims.some(x=> x.el === r.bar && x.kf.every(k=> Object.keys(k).every(p=> /^(translate|offset)$/.test(p)))), '#17 the bar jolts (translate) as it bursts'); }
{ const r = stampede('low'), run = r.bf.children.find(x=> /fx9-run/.test(x.className)); ok(run.children.length === 1, '#17 Effects Low: one puff on the bar'); const z = stampede('none'); ok(!z.bf.children.some(x=> /fx9-run/.test(x.className)) && !z.d.anims.length, '#17 Effects None: nothing'); }

// ---------------------------------------------------------------- the Lab, docs, the cue sheet
{ const man = rd('tools/effects-lab/manifest/fx9.js'), extra = rd('tools/effects-lab/fx-src-extra.txt');
  ['wt-dawn-draw', 'atk-guardian-redirect', 'atk-ambush', 'atk-swarm', 'ui-pitch', 'st-sleep-active', 'sk-shell-down', 'sum-dragon', 'atk-overwhelm-hq'].forEach(id=> ok(man.includes(`id:'${id}'`), 'Lab entry ' + id));
  ['fx9AmbushVfx', 'fx9ShellBreakVfx', 'fx9DragonArrive', 'fx9StampedeVfx', 'fx9GuardSync', 'fx9ZzzSync', 'FX9_SHELL', 'FX9_DRAGON_SVG', 'ui16PitchToGrave', 'ambushEcho'].forEach(f=> ok(new RegExp('^' + f + '$', 'm').test(extra), 'the Lab copies ' + f));
  ok(!/^fx9PatchFx$/m.test(extra), 'the Lab keeps the old looks next to FX9\'s (no fx9PatchFx there)'); }
ok(/package FX9/.test(rd('docs/effects-catalogue.md')), 'effects catalogue entry');
ok(/shellCrackTone/.test(rd('docs/sfx-cue-sheet.md')) && /dragonGust/.test(rd('docs/sfx-cue-sheet.md')), 'cue sheet lists the two new cues');
ok(/^## 2026-11-13 Package FX9/m.test(rd('docs/CHANGELOG.md').slice(0, 6000)), 'CHANGELOG entry at the top');
ok(/tests\/fx9-2026-11-13\.js/.test(rd('tests/run-all.sh')), 'listed in run-all.sh');
console.log(fail ? `fx9: ${fail} of ${n} checks FAILED` : `fx9: all ${n} checks passed`); process.exit(fail ? 1 : 0);
