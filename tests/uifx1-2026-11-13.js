#!/usr/bin/env node
// 2026-11-13 (package UIFX1): the places' entrances (bramblewood-ui-places.js, BramblewoodPlaces), checked without a browser.
//   1. wiring: one hook line in switchTab, the game bundle and the Lab bundle include the file, the Lab manifest registers every place
//   2. each entrance in a fake DOM: one layer, transform / opacity only, no more than 40 nodes, within its length, everything removed at the end
//      (nodes, timers, listeners), a tap skips it at once
//   3. settings: Effects None nothing, reduced motion one opacity fade, Effects Low the short take and no ambience; a redraw or a page load is no arrival; the full take once a session per place, then the short one
//   4. ambience: kept as the screen's first child, re-added after a redraw, gone (and its observer) on another tab; the Premium switch; the Forge
//   5. CSS: no filter, blend mode or :has(); keyframes animate transform and opacity only; docs (catalogue, cue sheet, CHANGELOG)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = rd('bramblewood-ui-places.js'), app = rd('arena_app.js');
let fail = 0, n = 0, ended = false; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
process.on('exit', ()=>{ if(!ended){ console.log('  x the test stopped early (a promise never settled)'); process.exitCode = 1; } });

// 1. wiring
{ const lines = app.split('\n').filter(l=> l.includes('BramblewoodPlaces'));
  ok(lines.length === 1, 'arena_app.js names BramblewoodPlaces on exactly one line (' + lines.length + ')');
  const sw = app.slice(app.indexOf('\nfunction switchTab('), app.indexOf('\nfunction ui14SyncMapNav('));
  ok(/BramblewoodPlaces\.enter\(tab, document\.getElementById\('view-' \+ tab\), \{from: currentTabBeforeSwitch\}\)/.test(sw), 'switchTab calls BramblewoodPlaces.enter(tab, #view-<tab>, {from}) after the screens draw');
  ok(sw.indexOf('BramblewoodPlaces.enter') > sw.indexOf("safeRender('Shop', renderShop)"), 'the hook runs after the renderers');
  ok(/open\(SCRATCH \+ "bramblewood-ui-places\.js"/.test(rd('assemble_arena.py')), 'assemble_arena.py bundles bramblewood-ui-places.js');
  ok(/bramblewood-ui-places\.js/.test(rd('tools/effects-lab/build.py')), 'the Effects Lab bundles it too');
  const man = rd('tools/effects-lab/manifest/places.js');
  ok(/'Places \(UIFX1\)'/.test(man), 'the Lab group is "Places (UIFX1)"');
  ['shop', 'premium', 'nest', 'codex', 'deck', 'stomp', 'inventory'].forEach(k=> ok(new RegExp(`\\['${k}', '`).test(man), 'the Lab lists ' + k));
  ok(/run node tests\/uifx1-2026-11-13\.js/.test(rd('tests/run-all.sh')), 'tests/run-all.sh runs this test'); }

// a small fake DOM: enough for the module (elements, classList, a tag parser for innerHTML, animate, listeners, timers, MutationObserver)
function world(o){
  o = o || {};
  const timers = new Map(), listeners = [], observers = [], anims = [], sounds = []; let tid = 0;
  class El {
    constructor(tag){ this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this.className = ''; this.id = ''; this.dataset = {}; this.hidden = false; this.style = {cssText: ''}; this.ls = []; this.animCalls = []; }
    get classList(){ const s = this; const get = ()=> s.className.split(/\s+/).filter(Boolean);
      return {add: (...c)=>{ const a = get(); c.forEach(x=>{ if(!a.includes(x)) a.push(x); }); s.setClass(a.join(' ')); }, remove: (...c)=> s.setClass(get().filter(x=> !c.includes(x)).join(' ')),
        contains: c=> get().includes(c), toggle: (c, f)=>{ const h = get().includes(c); if(f === undefined ? h : !f) s.classList.remove(c); else s.classList.add(c); }}; }
    setClass(v){ const old = this.className; this.className = v; if(old !== v) observers.forEach(m=> m.on && m.target === this && m.opts.attributes && m.cb([{type: 'attributes', oldValue: old}])); }
    get firstChild(){ return this.children[0] || null; } get lastChild(){ return this.children[this.children.length - 1] || null; }
    get isConnected(){ let e = this; while(e.parentNode) e = e.parentNode; return e === doc.documentElement; }
    appendChild(c){ if(c.parentNode) c.remove(); c.parentNode = this; this.children.push(c); this.mut(); return c; }
    insertBefore(c, ref){ if(c.parentNode) c.remove(); const i = ref ? this.children.indexOf(ref) : -1; c.parentNode = this; if(i < 0) this.children.push(c); else this.children.splice(i, 0, c); this.mut(); return c; }
    remove(){ const p = this.parentNode; if(!p) return; p.children.splice(p.children.indexOf(this), 1); this.parentNode = null; p.mut(); }
    mut(){ observers.forEach(m=> m.on && m.target === this && m.opts.childList && Promise.resolve().then(()=> m.on && m.cb([{type: 'childList'}]))); }
    set innerHTML(h){ this.children.forEach(c=> c.parentNode = null); this.children = []; parse(h, this); this.mut(); }
    set textContent(t){ this.children.forEach(c=> c.parentNode = null); this.children = []; this.mut(); }
    setAttribute(k, v){ this['attr_' + k] = v; }
    addEventListener(t, f, c){ listeners.push({on: this, t, f, cap: !!(c && (c === true || c.capture))}); }
    removeEventListener(t, f, c){ const cap = !!(c && (c === true || c.capture)); const i = listeners.findIndex(l=> l.on === this && l.t === t && l.f === f && l.cap === cap); if(i >= 0) listeners.splice(i, 1); }
    animate(frames, opts){ let res, rej; const a = {el: this, frames, opts: opts || {}, playbackRate: 1, currentTime: 0, finished: new Promise((r, j)=>{ res = r; rej = j; }), state: 'running'};
      a.finish = ()=>{ if(a.state === 'running'){ a.state = 'finished'; res(a); } }; a.cancel = ()=>{ if(a.state === 'running'){ a.state = 'cancelled'; rej(new Error('AbortError')); } }; a.pause = ()=>{};
      a.finished.catch(()=>{}); anims.push(a); this.animCalls.push(a); return a; }
    querySelector(sel){ return this.all().find(e=> match(e, sel)) || null; }
    all(){ const out = []; const walk = e=> e.children.forEach(c=>{ out.push(c); walk(c); }); walk(this); return out; }
    getBoundingClientRect(){ return {left: 0, top: 0, width: 1366, height: 860}; }
  }
  function match(e, sel){ const parts = sel.trim().split(/\s+/), one = (x, s)=> s[0] === '#' ? x.id === s.slice(1) : s[0] === '.' ? x.classList.contains(s.slice(1)) : x.tagName === s.toUpperCase();
    if(!one(e, parts[parts.length - 1])) return false; if(parts.length === 1) return true; let p = e.parentNode; while(p){ if(one(p, parts[parts.length - 2])) return true; p = p.parentNode; } return false; }
  function parse(h, into){ const re = /<(\/?)(\w+)([^>]*)>/g; let m, cur = into;
    while((m = re.exec(h))){ if(m[1]){ cur = cur.parentNode || into; continue; } const e = new El(m[2]); const c = /class="([^"]*)"/.exec(m[3]); if(c) e.className = c[1]; const d = /id="([^"]*)"/.exec(m[3]); if(d) e.id = d[1]; const s = /style="([^"]*)"/.exec(m[3]); if(s) e.style.cssText = s[1];
      cur.children.push(e); e.parentNode = cur; cur = e; } }
  const doc = {documentElement: new El('html')};
  doc.head = doc.documentElement.appendChild(new El('head')); doc.body = doc.documentElement.appendChild(new El('body'));
  doc.createElement = t=> new El(t); doc.getElementById = id=> doc.documentElement.all().find(e=> e.id === id) || null;
  const win = {document: doc, innerWidth: 1366, innerHeight: 860, Promise, Math, Object, Array, JSON, String, Number, Error,
    setTimeout: (f, ms)=>{ const id = ++tid; timers.set(id, {f, ms}); return id; }, clearTimeout: id=> timers.delete(id),
    addEventListener: (t, f, c)=> listeners.push({on: 'window', t, f, cap: !!(c && (c === true || c.capture))}),
    removeEventListener: (t, f, c)=>{ const cap = !!(c && (c === true || c.capture)); const i = listeners.findIndex(l=> l.on === 'window' && l.t === t && l.f === f && l.cap === cap); if(i >= 0) listeners.splice(i, 1); },
    MutationObserver: class { constructor(cb){ this.cb = cb; this.on = false; } observe(t, o){ this.target = t; this.opts = o; this.on = true; observers.push(this); } disconnect(){ this.on = false; } },
    fxLevel: ()=> o.level || 'high', reducedMotion: ()=> !!o.reduced,
    SoundKit: new Proxy({}, {get: (t, k)=> (...a)=> sounds.push(k)})};
  win.window = win; vm.createContext(win); vm.runInContext(SRC, win);
  const view = (tab, cls)=>{ const v = new El('div'); v.id = 'view-' + tab; v.className = cls || ''; v.innerHTML = '<div class="panel"><h2></h2></div>'; doc.body.appendChild(v); return v; };
  const settle = async ()=>{ for(let i = 0; i < 6; i++) await Promise.resolve(); };
  const layers = ()=> doc.body.children.filter(c=> /bwp-layer/.test(c.className));
  return {win, doc, P: win.BramblewoodPlaces, timers, listeners, observers, anims, sounds, view, settle, layers, El};
}
const MS = {shop: 820, premium: 880, nest: 860, codex: 880, deck: 860, stomp: 900, inventory: 760};
const TAB = {shop: 'shop', premium: 'shop', nest: 'nest', codex: 'codex', deck: 'deck', stomp: 'stomp', inventory: 'inventory'};
const AMBI = {shop: 1, premium: 1, nest: 1, codex: 1, deck: 1};
const propsOf = list=>{ const s = new Set(); list.forEach(a=> a.frames.forEach(k=> Object.keys(k).forEach(p=> s.add(p)))); return [...s]; };

(async ()=>{
  { const w = world(); ok(w.P && typeof w.P.enter === 'function' && typeof w.P.skip === 'function' && typeof w.P.stop === 'function', 'BramblewoodPlaces.enter / skip / stop exist');
    ok(['shop', 'premium', 'nest', 'codex', 'deck', 'stomp', 'inventory'].every(k=> w.P.kinds.includes(k)), 'seven places: ' + w.P.kinds.join(', '));
    Object.keys(MS).forEach(k=> ok(w.P.lengthOf(k) === MS[k] && MS[k] >= 600 && MS[k] <= 900 && w.P.lengthOf(k, true) <= 440, k + ': ' + w.P.lengthOf(k) + ' ms (Low ' + w.P.lengthOf(k, true) + ' ms)')); }

  // 2. each entrance at High: one layer, transform / opacity, few nodes, within its length, all cleaned up
  for(const k of Object.keys(MS)){
    const w = world(), v = w.view(TAB[k], k === 'premium' ? 'cart-scene is-premium-shop' : k === 'shop' ? 'cart-scene' : '');
    let resolved = null; const pr = w.P.enter(TAB[k], v, {from: 'home'}); pr.then(r=> resolved = r);
    const L = w.layers();
    ok(L.length === 1 && L[0].className.includes('bwp-' + k), k + ': one layer (' + L.map(l=> l.className) + ')');
    const nodes = L[0] ? L[0].all().length : 0; ok(nodes > 2 && nodes <= 40, k + ': ' + nodes + ' nodes (40 at most)');
    const props = propsOf(w.anims); ok(props.every(p=> /^(transform|opacity|offset|easing)$/.test(p)), k + ': animates transform and opacity only (' + props + ')');
    const over = w.anims.filter(a=> (a.opts.delay || 0) + a.opts.duration > MS[k] + 1); ok(!over.length, k + ': every part ends by ' + MS[k] + ' ms (' + over.map(a=> (a.opts.delay || 0) + a.opts.duration) + ')');
    ok(w.listeners.some(l=> l.on === L[0] && l.t === 'pointerdown') && w.listeners.some(l=> l.on === 'window' && l.t === 'keydown'), k + ': a tap or a key skips');
    ok([...w.timers.values()].some(t=> t.ms <= MS[k] + 400), k + ': a safety timer ends it within its length + 400 ms');
    ok(v.className.includes('bwp-host') === !!AMBI[k] || k === 'codex', k + ': ambience ' + (AMBI[k] ? 'on' : 'none'));
    w.anims.forEach(a=> a.finish()); await w.settle();
    ok(resolved === true && w.layers().length === 0, k + ': the layer is gone when it ends');
    ok(w.timers.size === 0, k + ': no timer left (' + w.timers.size + ')');
    ok(!w.listeners.some(l=> l.t === 'pointerdown' || l.t === 'keydown' || l.t === 'wheel'), k + ': no listener left');
    ok(w.sounds.length >= 1, k + ': a sound cue (' + w.sounds.join(', ') + ')');
    w.P.enter('play', null, {from: TAB[k]}); ok(!w.doc.body.all().some(e=> /bwp-amb/.test(e.className)) && !/bwp-on-/.test(w.doc.body.className) && !w.observers.some(m=> m.on), k + ': leaving for a fight ends the ambience and its observers');
  }

  // a tap skips at once, its click does not press what is under it, and pending cues are cancelled
  { const w = world(), v = w.view('shop', 'cart-scene'); let r = null; w.P.enter('shop', v, {from: 'home'}).then(x=> r = x);
    const tap = w.listeners.find(l=> l.t === 'pointerdown'), before = w.sounds.length; tap.f(); await w.settle();
    const L = w.layers();
    ok(r === true && L.length === 1 && L[0].children.length === 0 && L[0].style.opacity === '0' && !w.anims.some(a=> a.state === 'running'), 'a tap clears the tent at once and resolves');
    ok(w.timers.size === 1 && [...w.timers.values()][0].ms <= 500, 'one 500 ms timer for the click-eater, the cue timers are gone');
    const click = w.listeners.find(l=> l.t === 'click' && l.cap); let stopped = 0; click.f({preventDefault: ()=> stopped++, stopPropagation: ()=> stopped++});
    ok(stopped === 2 && w.layers().length === 0 && w.timers.size === 0 && !w.listeners.length, 'the tap\'s click is swallowed, then the layer, its timer and listeners are gone');
    ok(w.sounds.length === before, 'the shop bell after a skip never rings'); }
  { const w = world(), v = w.view('nest', 'nest-scene'); w.P.enter('nest', v, {from: 'home'}); w.listeners.find(l=> l.t === 'pointerdown').f();
    [...w.timers.values()].forEach(t=> t.f()); ok(w.layers().length === 0 && !w.listeners.length, 'with no click (a drag), the click-eater leaves after 500 ms'); }
  // a second entrance ends the first
  { const w = world(), a = w.view('shop', 'cart-scene'), b = w.view('nest', 'nest-scene'); w.P.enter('shop', a, {from: 'home'}); w.P.enter('nest', b, {from: 'shop'});
    ok(w.layers().length === 1 && w.layers()[0].className.includes('bwp-nest'), 'one entrance at a time'); }

  // 3. settings
  { const w = world({level: 'none'}), v = w.view('nest', 'nest-scene'); const r = await w.P.enter('nest', v, {from: 'home'});
    ok(r === false && w.layers().length === 0 && w.anims.length === 0 && !w.listeners.length && !v.className.includes('bwp-host'), 'Effects None: nothing at all'); }
  { const w = world({reduced: true}), v = w.view('codex'); w.P.enter('codex', v, {from: 'home'});
    ok(w.layers().length === 0 && w.anims.length === 1 && w.anims[0].el === v && propsOf(w.anims).join() === 'opacity' && w.anims[0].opts.duration <= 200, 'reduced motion: one plain fade of the screen, nothing else');
    ok(!w.doc.body.all().some(e=> /bwp-amb/.test(e.className)), 'reduced motion: no ambience'); }
  for(const k of Object.keys(MS)){ const w = world({level: 'low'}), v = w.view(TAB[k], k === 'premium' ? 'is-premium-shop' : ''); w.P.enter(TAB[k], v, {from: 'home'});
    const parts = w.anims.length, end = Math.max(...w.anims.map(a=> (a.opts.delay || 0) + a.opts.duration));
    ok(w.layers().length === 1 && parts <= 3 && end <= w.P.lengthOf(k, true) && !v.className.includes('bwp-host') && !w.doc.body.all().some(e=> /bwp-amb/.test(e.className)), `Effects Low, ${k}: the short take (${parts} moving parts, ${end} ms), no ambience`); }
  { const w = world(), v = w.view('nest', 'nest-scene'), parts = ()=> w.anims.filter(a=> a.state === 'running').length;
    w.P.enter('nest', v, {from: 'home'}); const first = parts(); w.P.skip();
    w.P.enter('nest', v, {from: 'codex'}); const again = parts(), end = Math.max(...w.anims.filter(a=> a.state === 'running').map(a=> (a.opts.delay || 0) + a.opts.duration)); w.P.skip();
    w.P.enter('nest', v, {from: 'codex', force: true}); const forced = parts(); w.P.skip();
    ok(first > 10 && again <= 3 && end <= w.P.lengthOf('nest', true) && forced === first, `the full entrance once a session per place (${first} parts), then the short take (${again} parts, ${end} ms); force plays the full one`);
    ok(v.className.includes('bwp-host'), '...and the ambience still runs on a later visit (Medium and up)'); }
  { const w = world(), v = w.view('nest', 'nest-scene');
    await w.P.enter('nest', v, {from: 'nest'}); ok(w.layers().length === 0, 'a redraw of the same screen is no arrival');
    await w.P.enter('nest', v, {from: null}); ok(w.layers().length === 0, 'the first screen after a page load gets no entrance');
    ok(v.firstChild && /bwp-amb/.test(v.firstChild.className), '...but its ambience starts'); }

  // 4. ambience, the Premium switch, the Forge
  { const w = world(), v = w.view('deck', 'tent-scene'); w.P.enter('deck', v, {from: 'home'}); w.P.skip();
    ok(v.firstChild && v.firstChild.className.includes('bwp-amb-deck') && v.className.includes('bwp-host') && w.doc.body.className.includes('bwp-on-deck'), 'Camp: the ambience is the screen\'s first child');
    v.innerHTML = '<div class="panel"></div>'; await w.settle(); ok(v.firstChild && /bwp-amb/.test(v.firstChild.className), 'a redraw of the screen puts the ambience back');
    w.P.enter('home', null, {from: 'deck'}); ok(!v.children.some(c=> /bwp-amb/.test(c.className)) && !v.className.includes('bwp-host') && !w.observers.some(m=> m.on), 'another tab removes it and stops watching'); }
  { const w = world(), v = w.view('codex'); w.P.enter('codex', v, {from: 'home'}); w.P.skip();
    ok(w.doc.body.children.some(c=> /bwp-amb-codex/.test(c.className) && /is-fixed/.test(c.className)), 'Codex: the light shaft is one fixed layer');
    const f = w.view('x'); v.innerHTML = '<div id="view-forge"></div>'; const r = await w.P.enter('codex', v, {from: 'home'});
    ok(r === false && w.layers().length === 0 && !w.doc.body.children.some(c=> /bwp-amb/.test(c.className)), 'the Forge (drawn in the Codex view) keeps its own flare: no book, no shaft'); f.remove(); }
  { const w = world(), v = w.view('shop', 'cart-scene'); w.P.enter('shop', v, {from: 'home'}); w.P.skip();
    ok(w.P.state().shopWatch && w.P.state().ambient === 'shop', 'the shop watches for the Premium switch');
    v.classList.add('is-premium-shop'); ok(w.layers().length === 1 && w.layers()[0].className.includes('bwp-premium') && w.P.state().ambient === 'premium', 'switching to Premium plays the pavilion and its ambience');
    w.P.skip(); v.classList.add('view-turn-fwd'); ok(w.layers().length === 0, 'other class changes play nothing');
    v.classList.remove('is-premium-shop'); ok(w.layers().length === 1 && w.layers()[0].className.includes('bwp-shop'), 'back to the Shop plays the tent');
    w.P.enter('nest', w.view('nest'), {from: 'shop'}); ok(!w.P.state().shopWatch, 'leaving the shop stops watching'); }
  { const w = world(), v = w.view('stomp', 'stomp-scene'); w.P.enter('stomp', v, {from: 'home'}); const k = w.listeners.find(l=> l.t === 'keydown'); k.f({key: 'Tab'}); await w.settle();
    ok(w.layers().length === 0, 'a key press skips the gates'); }

  // 5. CSS and docs
  { const css = (SRC.match(/const CSS = `([\s\S]*?)`;/) || [])[1] || '';
    ok(css.length > 1000, 'the CSS block is there');
    ok(!/(^|[^-])filter\s*:|mix-blend-mode|:has\(/.test(css), 'no filter, blend mode or :has() in the CSS');
    const kf = [...css.matchAll(/@keyframes (\w+)\{([\s\S]*?\}\s*)\}/g)];
    ok(kf.length >= 5, kf.length + ' keyframes');
    kf.forEach(m=>{ const props = [...m[2].matchAll(/([a-z-]+)\s*:/g)].map(x=> x[1]); ok(props.every(p=> p === 'transform' || p === 'opacity'), `@keyframes ${m[1]} animates transform / opacity only (${[...new Set(props)]})`); });
    ok(/prefers-reduced-motion: reduce\)\{ \.bwp-amb\{display:none;\}/.test(css) && /html\[data-fx="low"\] \.bwp-amb, html\[data-fx="none"\] \.bwp-amb\{display:none;\}/.test(css), 'the ambience hides itself under reduced motion and Effects Low / None');
    ok(!/body:has/.test(css), 'no body:has'); }
  { const cat = rd('docs/effects-catalogue.md'), cue = rd('docs/sfx-cue-sheet.md'), log = rd('docs/CHANGELOG.md');
    ok(/UIFX1/.test(cat) && /place-shop/.test(cat), 'docs/effects-catalogue.md has the places');
    ok(/UIFX1/.test(cue), 'docs/sfx-cue-sheet.md lists the entrance cues');
    ok(/^## 2026-11-13 Package UIFX1/m.test(log.slice(0, 40000)), 'a CHANGELOG entry near the top'); } // 2026-11-13 (PERF5): its own heading, below the night's later entries

  ended = true; console.log(`uifx1: ${n - fail}/${n} checks passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
