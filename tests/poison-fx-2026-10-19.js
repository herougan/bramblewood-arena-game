#!/usr/bin/env node
// Package P (2026-10-18), the Poison visuals. Owner: "When you naturally lose poison counters on the beginning of your turn or otherwise,
// it doesn't say 'Cured!' It just drops a greyed out toxin counter from your toxin context label ... The poison vfx fades off. The poison
// effect has various bubbles coming out from the bottom boundary here and there. Circles and filled-in circles. Rare, and small. There is
// a small flurry of these circles (3-4) when poison is gone. There should be a flurry when poison is first applied. ... In the test lab,
// the ongoing poison vfx doesn't move as well. It should be consistently moving (but not linear)..."
// Checks, headless: the engine's natural decay events, no "cured" chip on a Poison end, the grey drop on ev.decay, FX.D's flurry on
// apply / expire through the game's hook (run on a small fake DOM), the surface not repeating, and the lab using the same hook.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js'), E = H.Engine;
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };

// ---- 1. the engine: natural decay is a poisonTick with decay:true, then a statusEnd (no Cure involved)
{ const defs = Object.assign({}, H.loadCardDefs(), {'pf-idle': {id:'pf-idle', name:'PF Idle', attack:0, health:30, wait:5, cost:0, effects:{}}});
  const so = id=> id === 1 ? 'A' : 'B';
  const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules:{}});
  const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}; e.debugSpawnCard(P, so, 1, 'pf-idle', 'left', {}, []);
  const c = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].find(x=> x.defId === 'pf-idle'); c.poison = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const tick = ev.find(x=> x.type === 'poisonTick' && x.uid === c.uid), end = ev.find(x=> x.type === 'statusEnd' && x.status === 'poison' && x.uid === c.uid);
  ok(tick && tick.decay === true, 'the last Poison counter wears off as a poisonTick with decay:true');
  ok(end, 'and the engine says Poison ended (statusEnd poison)');
  ok(!ev.some(x=> x.kind === 'cure' && x.targetUid === c.uid), 'no Cure event on natural decay'); }

// ---- 2. sources
const app = R('arena_app.js'), fxc = R('bramblewood-fx-c.js'), fxd = R('bramblewood-fx-d.js'), labD = R('tools/effects-lab/manifest/d.js'), labB = R('tools/effects-lab/manifest/b.js'),
  labC = R('tools/effects-lab/manifest/c.js'), labP1 = R('tools/effects-lab/manifest/p1.js'), idx = R('index.html');
ok(/poison:\s+\{mode:'bubbles'[^}]*label:''/.test(fxc), "FX.C's Poison wear-off has no label (was '☠ cured')");
ok(!/☠ cured/i.test(fxc), 'no "☠ cured" chip text left in FX.C');
ok(/if\(S\.label\) chip\(tl, mk, \.12, t, S\.label, S\.chip\);/.test(fxc), 'statusEnd skips the chip when a status has no label');
ok(/if\(ev\.status === 'poison'\) break;\n\s+if\(e && STATUS_END\[ev\.status\]\) M\.statusEnd/.test(fxc), "FX.C's onEvent leaves Poison's end to FX.D's look");
{ const h0 = app.indexOf('// Poison tick (item #1, 2026-09-16): a bubbling sound'), h = app.slice(h0, app.indexOf("if(ev.type==='bleedTick'){", h0));
  ok(/if\(ev\.decay && el && fxAtLeast\('low'\) && !reducedMotion\(\)\) try\{ if\(window\.FX && FX\.D && FX\.D\.poisonDrop\) FX\.D\.poisonDrop\(el\); \}catch\(e\)\{\}/.test(h), 'poisonTick: ev.decay drops a grey counter (FX.D.poisonDrop)');
  ok(h.indexOf('FX.D.poisonDrop(el)') < h.indexOf('updateCardStatusDisplay(ev.uid)'), 'the drop is measured before the badge is redrawn');
  ok(!/cured/i.test(h.replace(/\/\/[^\n]*/g, '')), 'the poisonTick handler never says cured (comments aside)'); }
ok(/case 'cure': snd\('cleanseTone'\); fl\(el, `💊 Cured \$\{ev\.amount\}`/.test(app), 'a real Cure still floats "💊 Cured N"');
ok(/M\.syncStatusLooks\(el, statusStates\(c, uid, env\), env\);/.test(fxd) && /if\(c\) M\.syncStatusLooks\(el, statusStates\(c, uid, env\), env\);/.test(fxd), 'both hooks pass env to syncStatusLooks');
ok(!/fxdOoze|fxdBubble\{/.test(fxd), 'the old linear CSS ooze loop and fixed bubble loops are gone');
ok(/g\.ticker\.add\(psnTick\)/.test(fxd), "the pool runs on GSAP's shared ticker");
ok(/const psnCalm = \(\)=> reduceNow\(\) \|\| psnLevel\(\) === 'low' \|\| psnLevel\(\) === 'none';/.test(fxd), 'reduced motion and the Low / None effects levels calm the pool');
ok(/document\.hidden\) return;/.test(fxd), 'a hidden tab skips the frame');
ok(/FX\.D\.poisonDrop/.test(idx) && /fxd-psn-svg/.test(idx) && !/☠ cured/.test(idx), 'index.html is rebuilt with the new look');
// the lab: same hook, same drop, same end
ok(/X\(\)\.hooks\.cardStatusShown\(bc, c, env\)/.test(labD), "the lab's Poison goes through FX.D.hooks.cardStatusShown (the game's hook)");
ok(/X\(\)\.poisonDrop\(bc\)/.test(labD), "the lab's tick drops the grey counter with FX.D.poisonDrop");
ok(/R\(\{id:'st-poison-expire'/.test(labD) && !/\['st-poison-expire', 'poison'\]/.test(labC), 'st-poison-expire is the look fading (d.js), not FX.C.statusEnd');
ok(/P\.show\(t, \{defId:'', poison:3/.test(labB) && /window\.FX\.D\.poisonDrop\(t\)/.test(labB), 'b.js apply / tick use the shared lab path');
ok(/W\.FX\.D\.poisonDrop\(el\)/.test(labP1), 'p1.js tick drops the counter too');

// ---- 3. FX.D on a small fake DOM: apply flurry, rebuild without flurry, expire flurry (3-4), drop marker, surface
const timers = []; const setT = (fn, ms)=>{ timers.push({fn, at:(ms|0)}); return timers.length; };
const flush = ()=>{ for(let k = 0; k < 20 && timers.length; k++){ const all = timers.splice(0); all.sort((a, b)=> a.at - b.at).forEach(t=>{ try{ t.fn(); }catch(e){ console.log('  timer threw', e.message); fail++; } }); } };
function parseSel(sel){ return sel.split(',').map(p=>{ p = p.trim(); const child = /^:scope\s*>\s*/.test(p); p = p.replace(/^:scope\s*>\s*/, '');
  const nots = [...p.matchAll(/:not\(\.([\w-]+)\)/g)].map(m=> m[1]); p = p.replace(/:not\([^)]*\)/g, '');
  const tag = (p.match(/^[a-z]+/i) || [''])[0].toLowerCase(), cls = [...p.matchAll(/\.([\w-]+)/g)].map(m=> m[1]); return {child, tag, cls, nots}; }); }
class El {
  constructor(tag){ this.tagName = String(tag).toUpperCase(); this.children = []; this.parentNode = null; this.attrs = {}; this.style = {cssText:'', setProperty(k, v){ this[k] = v; }}; this.dataset = {}; this._text = ''; this.className = ''; }
  get classList(){ const el = this; const list = ()=> el.className.split(/\s+/).filter(Boolean);
    return {add:(...c)=>{ el.className = [...new Set(list().concat(c))].join(' '); }, remove:(...c)=>{ el.className = list().filter(x=> !c.includes(x)).join(' '); },
      contains:c=> list().includes(c), toggle:(c, on)=>{ const has = list().includes(c); const want = on === undefined ? !has : !!on; if(want && !has) el.classList.add(c); if(!want && has) el.classList.remove(c); return want; }}; }
  setAttribute(k, v){ this.attrs[k] = String(v); if(k === 'class') this.className = String(v); } getAttribute(k){ return k in this.attrs ? this.attrs[k] : null; }
  appendChild(c){ if(c.parentNode) c.remove(); c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref){ if(!ref) return this.appendChild(c); if(c.parentNode) c.remove(); c.parentNode = this; this.children.splice(this.children.indexOf(ref), 0, c); return c; }
  remove(){ if(this.parentNode){ const a = this.parentNode.children; a.splice(a.indexOf(this), 1); this.parentNode = null; } }
  get isConnected(){ let e = this; while(e.parentNode) e = e.parentNode; return e === doc.documentElement; }
  set innerHTML(h){ this.children.forEach(c=> c.parentNode = null); this.children = []; this._text = '';
    for(const m of String(h).matchAll(/<([a-z]+)([^>]*)>/gi)){ const c = new El(m[1]); const cm = m[2].match(/class="([^"]*)"/); if(cm) c.className = cm[1]; this.appendChild(c); }
    if(!/</.test(h)) this._text = String(h); else this._text = String(h).replace(/<[^>]*>/g, ''); }
  get innerHTML(){ return ''; } set textContent(t){ this.innerHTML = String(t).replace(/</g, ''); } get textContent(){ return this._text + this.children.map(c=> c.textContent).join(''); }
  _match(s){ if(s.tag && this.tagName.toLowerCase() !== s.tag) return false; const cl = this.className.split(/\s+/); return s.cls.every(c=> cl.includes(c)) && !s.nots.some(c=> cl.includes(c)); }
  querySelectorAll(sel){ const ps = parseSel(sel), out = []; const walk = (e, depth)=>{ e.children.forEach(c=>{ if(ps.some(s=> (!s.child || depth === 0) && c._match(s))) out.push(c); walk(c, depth + 1); }); }; walk(this, 0); return out; }
  querySelector(sel){ return this.querySelectorAll(sel)[0] || null; }
  getBoundingClientRect(){ return {left:100, top:100, width:90, height:126, right:190, bottom:226}; }
  get offsetWidth(){ return 90; } get offsetHeight(){ return 126; }
}
const doc = {documentElement:new El('html'), createElement:t=> new El(t), createElementNS:(ns, t)=> new El(t), hidden:false, addEventListener(){}};
doc.head = doc.documentElement.appendChild(new El('head')); doc.body = doc.documentElement.appendChild(new El('body'));
doc.getElementById = id=>{ let f = null; const walk = e=> e.children.forEach(c=>{ if(!f && c.attrs.id === id || c.id === id) f = f || c; walk(c); }); walk(doc.documentElement); return f; };
const chain = ()=>{ const t = {to:()=> t, fromTo:()=> t, set:()=> t, add:()=> t, call:()=> t, eventCallback:()=> t}; return t; };
const ticks = new Set();
const gsap = {timeline:o=>{ if(o && o.onComplete) setT(o.onComplete, 2000); return chain(); }, set(){}, to(el, v){ if(v && v.onComplete) setT(v.onComplete, (v.duration || 0)*1000); return chain(); }, fromTo(){ return chain(); },
  delayedCall:(s, fn)=> setT(fn, s*1000), ticker:{add:f=> ticks.add(f), remove:f=> ticks.delete(f)}, globalTimeline:{timeScale:()=> 1}};
const ctx = {document:doc, gsap, setTimeout:setT, clearTimeout(){}, performance, console, Math, requestAnimationFrame:()=> 0, getComputedStyle:()=> ({getPropertyValue:()=> '', color:'', backgroundColor:''})};
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
let loaded = true; try{ vm.runInContext(fxd, ctx, {filename:'bramblewood-fx-d.js'}); }catch(e){ loaded = false; console.log('  FX.D failed to load on the fake DOM:', e.message); }
ok(loaded && ctx.FX && ctx.FX.D && typeof ctx.FX.D.syncStatusLooks === 'function', 'FX.D loads');
if(loaded && ctx.FX && ctx.FX.D){ const D = ctx.FX.D;
  const mkCard = uid=>{ const bc = new El('div'); bc.className = 'board-card'; bc.setAttribute('data-uid', uid); const t = bc.appendChild(new El('div')); t.className = 'card-tile';
    const bb = t.appendChild(new El('div')); bb.className = 'badges-bottom'; doc.body.appendChild(bc); return bc; };
  const env = {fxAtLeast:()=> true, match:{}, defs:{}};
  const look = bc=> bc.querySelector('.fxd-st-poison:not(.fxd-st-leaving)');
  let bc = mkCard('7');
  D.poisonFlurry.last = null; D.hooks.cardStatusShown(bc, {defId:'x', poison:3, hp:5, maxHp:5}, env); flush();
  ok(look(bc) && look(bc).querySelector('path.f'), 'Poison on: the look mounts its pool (two surface paths)');
  ok(D.poisonFlurry.last && !D.poisonFlurry.last.end && D.poisonFlurry.last.n >= 5, `first applied: a flurry (${JSON.stringify(D.poisonFlurry.last)})`);
  ok(ticks.size === 1, 'the pool joins the shared ticker');
  // a row rebuild (renderBoard) makes a new tile: the look comes back without a second flurry
  D.poisonFlurry.last = null; bc.remove(); bc = mkCard('7');
  D.syncStatusLooks(bc, {poison:true}, env); flush();
  ok(look(bc) && D.poisonFlurry.last === null, 'a rebuilt tile gets the look back with no flurry');
  // more stacks: no flurry either
  D.syncStatusLooks(bc, {poison:true}, env); flush(); ok(D.poisonFlurry.last === null, 'a sync while still Poisoned: no flurry');
  // the decay drop: a grey "☠−1" falls off the badge
  const badge = bc.querySelector('.badges-bottom').appendChild(new El('span')); badge.className = 'abadge poison'; badge.textContent = '☠1';
  const d = D.poisonDrop(bc); ok(d && /fxd-psn-drop/.test(d.className) && /−1/.test(d.textContent) && d.isConnected, 'poisonDrop: a grey "☠−1" counter drops from the badge');
  ok(!/cured/i.test(d ? d.textContent : ''), 'the drop never says cured');
  // runs out: the look fades off (leaving) and 3-4 last bubbles
  D.poisonFlurry.last = null; badge.remove(); D.hooks.cardStatusShown(bc, {defId:'x', poison:0, hp:5, maxHp:5}, env);
  const leaving = bc.querySelector('.fxd-st-poison.fxd-st-leaving');
  ok(leaving && !look(bc), 'Poison off: the look fades (fxd-st-leaving) instead of blinking out');
  ok(D.poisonFlurry.last && D.poisonFlurry.last.end && D.poisonFlurry.last.n >= 3 && D.poisonFlurry.last.n <= 4, `run out: 3-4 last bubbles (${JSON.stringify(D.poisonFlurry.last)})`);
  flush(); ok(!bc.querySelector('.fxd-st-poison'), 'the faded look is removed');
  // a new match: the same uid is fresh again
  D.poisonFlurry.last = null; D.syncStatusLooks(bc, {poison:true}, {fxAtLeast:()=> true, match:{}}); flush(); ok(D.poisonFlurry.last && !D.poisonFlurry.last.end, 'a new match: first Poison flurries again');
  // the surface: not linear and not a short loop (compare a 4 s window against every shift up to 60 s)
  const L = {s:[.3, 1.1, 2.2, 4.1, 5.0, .7], swells:[]}, S = D._psn.surface, samp = t0=> [0, 25, 50, 75].map(x=> S(L, x, t0, false));
  let best = 1e9; const a = []; for(let k = 0; k < 40; k++) a.push(...samp(k*.1));
  for(let sh = .5; sh <= 60; sh += .1){ const b = []; for(let k = 0; k < 40; k++) b.push(...samp(sh + k*.1)); best = Math.min(best, Math.sqrt(a.reduce((t, v, i)=> t + (v - b[i])**2, 0)/a.length)); }
  ok(best > .25, `the surface never repeats within a minute (closest match RMS ${best.toFixed(2)})`);
  const ys = []; for(let k = 0; k < 30; k++) ys.push(S(L, 50, k*.1, false)); const dy = ys.slice(1).map((y, i)=> y - ys[i]);
  ok(Math.max(...dy) - Math.min(...dy) > .2, 'the surface speeds up and slows down (not linear)');
}
console.log(fail ? `poison-fx: ${fail} failure(s)` : 'poison-fx: all passed'); process.exit(fail ? 1 : 0);
