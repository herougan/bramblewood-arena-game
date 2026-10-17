/* ============================================================
   Bramblewood FX, batch C (2026-10-15): status (part), death, castle, summon-spawn
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.C: FX.C.someEffect(el, opts); variants are FX.C.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-c-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxc- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.C.onEvent / FX.C.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.C = FX.C || {};
const TAG = 'c';

// ---- shared helpers (each batch has its own copy so no batch depends on another) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const centre = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const rnd = (a, b)=> a + Math.random()*(b - a);
const call = fn=>{ try{ fn && fn(); }catch(e){} };
// delayedCall follows GSAP's global time scale (slow motion in the Lab, hit-stop in the game); falls back to setTimeout.
const later = (fn, ms)=>{ const g = G(), run = ()=> call(fn); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };
const wait = ms=> new Promise(res=> later(res, ms));
// A fixed-position overlay on <body> (survives re-renders underneath), or an absolute one inside `host`.
function layer(cls, html, host){
  const e = document.createElement('div'); e.className = 'fx' + TAG + ' ' + (cls || ''); e.setAttribute('aria-hidden', 'true');
  if(html) e.innerHTML = html; if(host) e.style.position = 'absolute'; (host || document.body).appendChild(e); return e;
}
// Inject a named CSS chunk once into this batch's own <style> block.
const cssDone = new Set();
function css(key, text){
  if(cssDone.has(key)) return; cssDone.add(key);
  let s = document.getElementById('fx-' + TAG + '-style');
  if(!s){ s = document.createElement('style'); s.id = 'fx-' + TAG + '-style'; document.head.appendChild(s);
    s.textContent = `.fx${TAG}{position:fixed; left:0; top:0; pointer-events:none; z-index:1200;}\n`; }
  s.textContent += '\n/* ' + key + ' */\n' + text;
}
Object.assign(M, {css, layer, later, wait, centre, tileOf, rnd});

// ---- game hooks (optional) ----
// M.onEvent(ev, env): called by arena_app.js (fxBatchVfx) for every replayed battle event, after the built-in passes.
// M.hooks.<name>(...args, env): called by fxHook('<name>', ...args) at non-battle moments (map, pack, rewards...).
// Both are skipped under reduced motion or Effects "none"; check env.fxAtLeast('med') yourself for heavy looks.
M.hooks = M.hooks || {};

// ---- effects ----
// 2026-10-15 (batch C, effects pass: "Deaths ... castle ... summons ... status wear-offs and lost turns"). Four groups below:
//   1. status wear-offs (FX.C.statusEnd) and lost turns (FX.C.lostTurn, FX.C.coinFlip, FX.C.wakeJolt)
//   2. deaths: one look per cause (lightning, magic, psychic, wither, irradiation, water, crushed, explode, petrified, curse,
//      true/ichor, acid, decay, sacrificed), the special units (egg, structure), add-ons that ride on the normal death (leader
//      crown, foil peel, KO stamp), the boss's big moment and lab-only concepts for later themes (ghost, dragon, supreme, slime)
//   3. castle: regen, lumber, ballista bolt, thorns, herb heal/bane, gate + march-out, logjam, shield dome, oops, speech, skins
//   4. summons: enemy card-back flip, reserve, step-up, gladiator sand, meiosis, twin, sprout, structure scaffold, egg idle,
//      mind-control arrival, devilry crack, remember smoke, castle march-out; lab-only dragon/supreme/mage/rooted/drones
// Every effect builds ONE paused GSAP timeline (run below): its overlays go in a bag that is emptied when it ends, its speed
// follows the replay's speed control (opts.speed), and a hard stop removes everything even if the timeline is killed.

// ---- toolkit ----
const isReduced = ()=>{ try{ return typeof reducedMotion === 'function' ? reducedMotion() : !!(root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
function snd(name, ...a){ try{ const S = typeof SoundKit !== 'undefined' ? SoundKit : null; if(S && typeof S[name] === 'function') S[name](...a); }catch(e){} }
const boardOf = el=> (el && el.closest && el.closest('.board-card')) || el;
const isFoeEl = el=> !!(el && el.closest && el.closest('#rowEnemy, .top-play-row'));
const NS = 'http://www.w3.org/2000/svg';
function svgNode(tag, attrs, parent){ const n = document.createElementNS(NS, tag); for(const k in attrs) n.setAttribute(k, attrs[k]); if(parent) parent.appendChild(n); return n; }
// A jagged line from a to b: n segments, each bent sideways by up to amp px (lightning, cracks).
function zig(ax, ay, bx, by, n, amp){ const pts = [[ax, ay]], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy/L, ny = dx/L;
  for(let i = 1; i < n; i++){ const f = i/n, o = rnd(-amp, amp); pts.push([ax + dx*f + nx*o, ay + dy*f + ny*o]); } pts.push([bx, by]);
  return pts.map(p=> p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '); }
// CSS filters, always written as the same full list so GSAP can interpolate them (a tween from "none" or between different
// lists would jump through brightness(0) - a black card). F('brightness(2) saturate(.3)') -> the canonical list.
const F_ORDER = [['invert', 0, ''], ['brightness', 1, ''], ['contrast', 1, ''], ['sepia', 0, ''], ['saturate', 1, ''], ['grayscale', 0, ''], ['hue-rotate', 0, 'deg'], ['blur', 0, 'px']];
const hexRgba = h=>{ const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},1)`; };
function F(str){
  const v = {}; let ds = 'drop-shadow(0px 0px 0px rgba(0,0,0,0))';
  String(str || '').replace(/([a-z-]+)\(((?:[^()]|\([^()]*\))*)\)/g, (m, k, a)=>{
    if(k === 'drop-shadow'){ if(ds.indexOf('rgba(0,0,0,0)') > 0) ds = 'drop-shadow(' + a.replace(/#[0-9a-f]{6}/i, hexRgba).replace(/(^|\s)0(\s)/g, '$10px$2').replace(/(\d)(\s)/g, '$1px$2').replace(/pxpx/g, 'px') + ')'; }
    else if(k === 'hue-rotate') v[k] = (v[k] || 0) + parseFloat(a); else v[k] = parseFloat(a); return ''; });
  return F_ORDER.map(([k, d, u])=> `${k}(${v[k] != null ? v[k] : d}${u})`).join(' ') + ' ' + ds;
}
M.F = F;
// One effect = one paused timeline. build(tl, mk, bag) adds tweens; mk(cls, html, host) makes an overlay that is removed at the end.
function run(opts, build){
  opts = opts || {}; const g = G();
  if(!g){ call(opts.onDone); return Promise.resolve(); }
  return new Promise(res=>{
    const bag = []; let done = false;
    const fin = ()=>{ if(done) return; done = true; bag.forEach(n=>{ try{ g.killTweensOf(n); n.remove(); }catch(e){} }); bag.length = 0; call(opts.onDone); res(); };
    const tl = g.timeline({paused:true, onComplete:fin});
    const mk = (cls, html, host)=>{ const e = layer(cls, html, host); bag.push(e); return e; };
    try{ build(tl, mk, bag); }catch(e){ if(root.__fxDebug) console.warn('FX.C', e); }
    const sp = Math.max(.25, Math.min(4, opts.speed || 1));
    tl.timeScale(sp).play();
    later(()=>{ if(!done){ tl.kill(); fin(); } }, (tl.duration()/sp)*1000 + 1500); // nothing outlives its effect by more than a beat
  });
}
// An overlay inside the card face (moves and clips with it); bagged so it goes when the effect ends.
function inTile(t, bag, cls, html){ const d = document.createElement('div'); d.className = 'fxc-ov ' + (cls || ''); d.setAttribute('aria-hidden', 'true'); if(html) d.innerHTML = html; t.appendChild(d); bag.push(d); return d; }
// Put a fixed layer at (x, y) by left/top, for layers that turn in 3D: a perspective() before a big x/y translate would view them
// from the page corner and skew them (2026-10-15 review: castle doors, the foil sheet).
const placeAt = (e, x, y)=>{ e.style.left = x + 'px'; e.style.top = y + 'px'; };
// A fixed copy of the card face (for pieces that fly apart or outlive the card).
function ghost(t, bag, extra){
  const r = t.getBoundingClientRect(), c = t.cloneNode(true); c.removeAttribute('id'); c.classList.remove('holo-active', 'holo-tilt'); c.classList.add('fxc-ghost'); c.setAttribute('aria-hidden', 'true');
  ['position:fixed', `left:${r.left}px`, `top:${r.top}px`, 'margin:0', 'pointer-events:none', 'z-index:1250', 'animation:none', 'transition:none', `width:${r.width}px`, `height:${r.height}px`, 'box-sizing:border-box', 'transform:none']
    .forEach(rule=>{ const i = rule.indexOf(':'); c.style.setProperty(rule.slice(0, i), rule.slice(i + 1), 'important'); });
  if(extra) Object.assign(c.style, extra);
  document.body.appendChild(c); bag.push(c); return c; // placed by left/top: x / y tweens on it are offsets
}
// Particles thrown out of (x, y): glyphs or coloured dots. o: n, glyphs | colors, size [a,b], angle (deg, 0 = right, -90 = up),
// arc (spread in deg), dist [a,b], dur [a,b], gravity (px pulled down after the throw), spin, w/h (start box), stagger, cls, alpha.
function spray(tl, mk, at, x, y, o){
  o = o || {}; const n = o.n || 8;
  for(let i = 0; i < n; i++){
    const gl = o.glyphs ? o.glyphs[i % o.glyphs.length] : '';
    const p = mk('fxc-p' + (gl ? ' fxc-g' : '') + (o.cls ? ' ' + o.cls : ''), gl);
    const s = o.size ? rnd(o.size[0], o.size[1]) : (gl ? rnd(12, 18) : rnd(4, 8));
    if(gl) p.style.fontSize = s.toFixed(0) + 'px'; else { p.style.width = p.style.height = s.toFixed(1) + 'px'; p.style.background = (o.colors || ['#fff'])[i % (o.colors || ['#fff']).length]; }
    if(o.shard){ p.style.borderRadius = '1px'; p.style.clipPath = `polygon(${rnd(0,30)}% 0, 100% ${rnd(10,40)}%, ${rnd(60,100)}% 100%, 0 ${rnd(50,90)}%)`; p.style.height = (s*rnd(1.2, 1.8)).toFixed(1) + 'px'; }
    const arc = o.arc != null ? o.arc : 360, a = (o.angle != null ? o.angle : 0) + rnd(-arc/2, arc/2), rad = a*Math.PI/180;
    const d = rnd(o.dist ? o.dist[0] : 20, o.dist ? o.dist[1] : 60), dur = rnd(o.dur ? o.dur[0] : .5, o.dur ? o.dur[1] : .8);
    const t0 = at + (o.stagger || 0)*i + rnd(0, o.jitter || 0), sx = x + rnd(-(o.w||0)/2, (o.w||0)/2), sy = y + rnd(-(o.h||0)/2, (o.h||0)/2);
    const ex = sx + Math.cos(rad)*d, ey = sy + Math.sin(rad)*d;
    tl.set(p, {x:sx, y:sy, xPercent:-50, yPercent:-50, opacity:0, scale:o.scale0 != null ? o.scale0 : 1, rotation:o.spin ? rnd(0, 360) : 0}, t0);
    tl.to(p, {opacity:o.alpha || 1, duration:.05}, t0);
    tl.to(p, {x:ex, rotation:o.spin ? '+=' + rnd(-o.spin, o.spin).toFixed(0) : 0, scale:o.scale1 != null ? o.scale1 : 1, duration:dur, ease:o.ease || 'power2.out'}, t0);
    if(o.gravity){ tl.to(p, {y:ey, duration:dur*.42, ease:'power2.out'}, t0); tl.to(p, {y:ey + o.gravity*rnd(.7, 1.2), duration:dur*.58, ease:'power2.in'}, t0 + dur*.42); }
    else tl.to(p, {y:ey, duration:dur, ease:o.ease || 'power2.out'}, t0);
    tl.to(p, {opacity:0, duration:dur*.4, ease:'power1.in'}, t0 + dur*.6);
  }
}
// Soft round puffs (smoke, steam, dust, spores) that swell as they drift.
function puffs(tl, mk, at, x, y, o){
  o = o || {}; const n = o.n || 5, col = o.color || 'rgba(90,90,90,.6)';
  for(let i = 0; i < n; i++){
    const p = mk('fxc-puff'), s = rnd(o.size ? o.size[0] : 14, o.size ? o.size[1] : 26), t0 = at + (o.stagger != null ? o.stagger : .04)*i;
    p.style.width = p.style.height = s.toFixed(0) + 'px'; p.style.background = `radial-gradient(circle, ${col} 0, ${col.replace(/[\d.]+\)$/, '0)')} 70%)`;
    const sx = x + rnd(-(o.w||20)/2, (o.w||20)/2), sy = y + rnd(-(o.h||0)/2, (o.h||0)/2), dur = rnd(o.dur ? o.dur[0] : .6, o.dur ? o.dur[1] : .9);
    tl.set(p, {x:sx, y:sy, xPercent:-50, yPercent:-50, scale:.4, opacity:0}, t0);
    tl.to(p, {opacity:o.alpha || .9, duration:.08}, t0);
    tl.to(p, {x:sx + rnd(-(o.drift||16), o.drift||16) + (o.dx||0), y:sy + (o.rise != null ? o.rise : -36)*rnd(.7, 1.2), scale:rnd(1.4, 2.2)*(o.grow||1), duration:dur, ease:'power1.out'}, t0);
    tl.to(p, {opacity:0, duration:dur*.55, ease:'power1.in'}, t0 + dur*.45);
  }
}
// A ring that opens from (x, y): border colour, start/end size, thickness.
function ringAt(tl, mk, at, x, y, o){
  o = o || {}; const r = mk('fxc-ring'), s0 = o.from || 10, s1 = o.to || 120, dur = o.dur || .5;
  r.style.borderColor = o.color || '#fff'; r.style.borderWidth = (o.width || 3) + 'px'; if(o.glow) r.style.boxShadow = `0 0 12px ${o.glow}, inset 0 0 10px ${o.glow}`;
  tl.set(r, {x, y, xPercent:-50, yPercent:-50, width:s0, height:s0*(o.squash || 1), opacity:o.alpha || 1}, at);
  tl.to(r, {width:s1, height:s1*(o.squash || 1), opacity:0, duration:dur, ease:o.ease || 'power2.out'}, at);
  return r;
}
// A flash of light over a rect or point.
function flashAt(tl, mk, at, x, y, w, h, col, dur){
  const f = mk('fxc-flash'); f.style.background = `radial-gradient(ellipse at center, ${col} 0, ${col.replace(/[\d.]+\)$/, '0)')} 68%)`;
  tl.set(f, {x, y, xPercent:-50, yPercent:-50, width:w, height:h, opacity:0, scale:.6}, at);
  tl.to(f, {opacity:1, scale:1, duration:.06}, at).to(f, {opacity:0, scale:1.25, duration:dur || .35, ease:'power1.in'}, at + .06);
  return f;
}
// A small coloured chip that rises off the card ("❄ thawed", "⚡ Tails!"): readable at phone size, gone in under a second.
function chip(tl, mk, at, el, text, col, o){
  o = o || {}; const c = centre(el), p = mk('fxc-chip', text); p.style.background = col || 'rgba(30,30,40,.82)'; if(o.ink) p.style.color = o.ink;
  const y0 = o.y != null ? o.y : c.r.top + c.h*.18, vw = document.documentElement.clientWidth || innerWidth, pw = p.offsetWidth || 80;
  const x0 = Math.max(pw/2 + 4, Math.min(vw - pw/2 - 4, c.x)); // 2026-10-15: never half off the screen edge
  tl.set(p, {x:x0, y:y0, xPercent:-50, yPercent:-50, scale:.4, opacity:0}, at);
  tl.to(p, {scale:1, opacity:1, duration:.16, ease:'back.out(3)'}, at)
    .to(p, {y:y0 - (o.rise || 26), duration:.7, ease:'power1.out'}, at)
    .to(p, {opacity:0, duration:.22, ease:'power1.in'}, at + (o.hold || .55));
  return p;
}
// A rune circle lying on the floor: a round ring spinning in its own plane, seen flattened (rotating a squashed ellipse
// would wobble). o: w (width), squash, spin (deg), grow (from this fraction), open/close times, dur, style (inline css on the ring).
function floorSigil(tl, mk, at, x, y, cls, o){
  o = o || {}; const outer = mk('fxc-flat'), ring = document.createElement('div'), sq = o.squash || .36, g0 = o.grow != null ? o.grow : .25, dur = o.dur || .9;
  ring.className = cls; ring.style.cssText = 'position:absolute; inset:0;' + (o.style || ''); outer.appendChild(ring);
  tl.set(outer, {x, y, xPercent:-50, yPercent:-50, width:o.w, height:o.w, scaleX:g0, scaleY:g0*sq, opacity:0}, at)
    .to(outer, {scaleX:1, scaleY:sq, opacity:1, duration:o.open || .22, ease:'back.out(1.8)'}, at)
    .to(ring, {rotation:o.spin || 180, duration:dur, ease:'none'}, at);
  if(o.close) tl.to(outer, {scaleX:.15, scaleY:.15*sq, opacity:0, duration:.25, ease:'power2.in'}, at + dur - .25);
  else tl.to(outer, {opacity:0, duration:.28}, at + dur - .28);
  return outer;
}
// The rest of a dying card's slot (owner edge, flight shadow, badges outside the face) fades with it.
function fadeSlot(tl, el, t, at, dur){ const b = boardOf(el); if(!b || b === t) return; [...b.children].filter(k=> !k.contains(t) && !k.classList.contains('fxc')).forEach(k=> tl.to(k, {opacity:0, duration:dur || .25}, at)); }
// The face's own image, for pieces that should carry its art (scraps, halves).
function artOf(t){ const img = t.querySelector('.ico img, img'); const cs = getComputedStyle(t);
  return {img: img && img.src ? img.src : '', a:(cs.getPropertyValue('--rarity-a') || '#8a7a5a').trim(), b:(cs.getPropertyValue('--rarity-b') || '#4a3f2c').trim()}; }

css('base', `
.fxc-p{border-radius:50%; will-change:transform,opacity;}
.fxc-g{border-radius:0; line-height:1; text-shadow:0 1px 2px rgba(0,0,0,.35);}
.fxc-puff{border-radius:50%; will-change:transform,opacity;}
.fxc-ring{border-style:solid; border-radius:50%; box-sizing:border-box;}
.fxc-flash{border-radius:50%;}
.fxc-ov{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:40; overflow:hidden;}
.fxc-svg{position:fixed; left:0; top:0; overflow:visible; pointer-events:none; z-index:1240;}
.fxc-chip{font:800 12.5px/1 'Baloo 2', 'Nunito', system-ui, sans-serif; color:#fff; padding:4px 8px 3px; border-radius:999px; white-space:nowrap;
  box-shadow:0 2px 6px rgba(0,0,0,.35); text-shadow:0 1px 1px rgba(0,0,0,.45); z-index:1260;}
.fxc-title{z-index:9994;}
.fxc-flat{transform-origin:50% 50%;}
`);

// ======================================================================================================================
// 1. STATUS WEAR-OFFS AND LOST TURNS
// ======================================================================================================================
// Each status that runs out gets its own small goodbye (about 0.8 s), in its theme colour, and a chip naming it.
// mode picks the motion; c/c2 the colours; g the particle glyphs; label the chip.
const STATUS_END = {
  poison:      {mode:'bubbles', c:'rgba(86,170,40,.55)', c2:'#9be15d', label:'☠ cured', chip:'#3f7d1a'},                       // swamp glop
  bleed:       {mode:'drip', c:'rgba(179,18,31,.45)', c2:'#e0303f', label:'🩸 stopped', chip:'#8e1420'},                        // beasts, blood red
  decay:       {mode:'flakes', c:'rgba(126,106,150,.5)', c2:'#a996c4', label:'🍄 cleared', chip:'#5d4f73'},                     // Morel Hollow mould
  frozen:      {mode:'shell', c:'rgba(170,220,255,.55)', c2:'#dff3ff', label:'❄ thawed', chip:'#2f7fb5', sound:'iceShatter'},    // Tundra / Ice Hollow
  asleep:      {mode:'zzz', c:'rgba(150,120,210,.35)', c2:'#c8b5f2', label:'💤 awake', chip:'#6a54a8'},                         // Morel spores, lullaby
  paralyzed:   {mode:'sparks', c:'rgba(255,220,60,.4)', c2:'#ffe14d', label:'⚡ free', chip:'#a88a00'},                          // acid / electric yellow
  stunned:     {mode:'stars', c:'rgba(255,230,120,.3)', c2:'#ffd84a', label:'💫 steady', chip:'#9a7b12'},
  staggered:   {mode:'wobble', c:'rgba(230,120,60,.3)', c2:'#ff9a52', g:['💢'], label:'💢 steady', chip:'#a8521c'},
  blind:       {mode:'ink', c:'rgba(20,16,30,.78)', c2:'#2a2340', label:'👁 sees', chip:'#2d2645'},                              // Hollow Kin ink
  tipsy:       {mode:'wobble', c:'rgba(240,190,80,.3)', c2:'#ffcf5a', g:['🫧', 'hic!'], label:'🍺 sober', chip:'#9c6b14'},
  confused:    {mode:'wobble', c:'rgba(200,120,230,.3)', c2:'#e0a6ff', g:['❓'], label:'❓ clear', chip:'#7a3f9a'},
  shocked:     {mode:'sparks', c:'rgba(120,200,255,.4)', c2:'#7fd6ff', c3:'#b49cff', label:'🌩 grounded', chip:'#2c6aa8'},       // electric bats, cyan/violet
  corrode:     {mode:'fizz', c:'rgba(190,220,40,.45)', c2:'#d8f04a', label:'🧪 clean', chip:'#6d7d12'},                         // ant acid
  exposed:     {mode:'crosshair', c:'rgba(220,40,40,.3)', c2:'#ff4a4a', label:'🎯 hidden', chip:'#a3262a'},
  daunt:       {mode:'pall', c:'rgba(90,60,140,.55)', c2:'#7c5cc0', label:'😤 bold again', chip:'#4f3a85'},                     // cold purple pall
  wither:      {mode:'smokeDown', c:'rgba(20,18,22,.55)', c2:'#2b2730', label:'🥀 wither ends', chip:'#2b2730'},               // Dragonic Spire smoke
  irradiation: {mode:'glow', c:'rgba(110,255,90,.5)', c2:'#7dff5a', label:'☢ clean', chip:'#2f7d1f'},                         // uranium green
  smoke:       {mode:'smoke', c:'rgba(200,200,205,.6)', c2:'#d8d8de', label:'🌫 clears', chip:'#5d6168'},
  scar:        {mode:'scar', c:'rgba(255,240,230,.6)', c2:'#ffe6d6', label:'🗡 healed', chip:'#7a5b4c'},
  petrified:   {mode:'shell', c:'rgba(160,155,145,.6)', c2:'#c9c3b6', stone:true, label:'🗿 free', chip:'#6b665c', sound:'knockOut'},
};
M.STATUS_END = STATUS_END;
M.statusEnd = function(el, kind, opts){
  opts = opts || {}; const S = STATUS_END[kind] || STATUS_END.stunned, t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  css('statusEnd', `.fxc-se-shell{border:3px solid; box-sizing:border-box; border-radius:inherit;}
    .fxc-se-ink{background:radial-gradient(ellipse 60% 40% at 30% 30%, var(--c) 0 60%, transparent 62%), radial-gradient(ellipse 50% 35% at 70% 55%, var(--c) 0 60%, transparent 62%), linear-gradient(180deg, transparent 0, var(--c) 30%, var(--c) 70%, transparent 100%);}
    .fxc-se-x{border:2px solid; border-radius:50%; box-sizing:border-box;}
    .fxc-se-x::before, .fxc-se-x::after{content:''; position:absolute; background:currentColor; left:50%; top:-14%; width:2px; height:128%; transform:translateX(-50%);}
    .fxc-se-x::after{transform:translate(-50%, 0) rotate(90deg);}`);
  return run(opts, (tl, mk, bag)=>{
    const c = centre(t), x = c.x, y = c.y, w = c.w, h = c.h, top = c.r.top, bot = c.r.bottom;
    const tint = inTile(t, bag, ''); tint.style.background = S.c; tl.fromTo(tint, {opacity:1}, {opacity:0, duration:.55, ease:'power1.in'}, .1);
    switch(S.mode){
      case 'bubbles':  // the green drains down and the last bubbles pop
        tint.style.background = `linear-gradient(180deg, transparent 0, ${S.c} 40%)`; tl.fromTo(tint, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(100% 0% 0% 0%)', duration:.6, ease:'power1.in'}, 0);
        spray(tl, mk, .05, x, bot - h*.2, {n:9, colors:['rgba(155,225,93,.9)', 'rgba(86,170,40,.85)'], size:[5, 11], angle:-90, arc:70, dist:[24, 60], dur:[.45, .7], w:w*.8, stagger:.03, scale1:1.6, cls:'fxc-bub'});
        snd('bubble'); break;
      case 'drip':     // one last drop falls, the wound knits with a white glint
        spray(tl, mk, .05, x + rnd(-w*.2, w*.2), bot - 4, {n:1, colors:[S.c2], size:[6, 7], angle:90, arc:0, dist:[30, 30], dur:[.5, .5], ease:'power2.in', cls:'fxc-drop'});
        spray(tl, mk, .3, x, y, {n:4, glyphs:['✦'], size:[10, 15], dist:[8, 22], dur:[.4, .55]}); snd('healTone'); break;
      case 'flakes':   // the fuzz blows off sideways
        spray(tl, mk, 0, x, y, {n:14, colors:['#a996c4', '#7e6a96', '#cfc3df'], size:[3, 6], angle:rnd(-20, 20) + (Math.random() < .5 ? 0 : 180), arc:50, dist:[40, 90], dur:[.6, .9], w:w*.9, h:h*.8, stagger:.015, gravity:14});
        snd('puff'); break;
      case 'shell': {  // the ice (or stone) cracks and falls off in pieces
        const sh = inTile(t, bag, 'fxc-se-shell'); sh.style.borderColor = S.c2; sh.style.background = S.c; sh.style.boxShadow = `inset 0 0 14px ${S.c2}`;
        const sv = svgNode('svg', {class:'fxc-svg', width:w, height:h}); document.body.appendChild(sv); bag.push(sv); gsap.set(sv, {x:c.r.left, y:top});
        for(let i = 0; i < 4; i++){ const pl = svgNode('polyline', {points:zig(w*rnd(.3, .7), h*rnd(.3, .6), w*(i%2 ? 1.05 : -.05), h*rnd(0, 1), 4, 6), fill:'none', stroke:S.stone ? '#4d4a44' : '#ffffff', 'stroke-width':1.6, 'stroke-linejoin':'round'}, sv);
          const L = 160; pl.style.strokeDasharray = L; pl.style.strokeDashoffset = L; tl.to(pl, {strokeDashoffset:0, duration:.14, ease:'power2.out'}, .02 + i*.03); }
        tl.to(sv, {opacity:0, duration:.15}, .3); tl.to(sh, {opacity:0, duration:.12}, .26);
        spray(tl, mk, .26, x, y, {n:12, colors:S.stone ? ['#a39d90', '#8a8478', '#c9c3b6'] : ['rgba(223,243,255,.95)', 'rgba(170,220,255,.9)', '#ffffff'], size:[6, 12], shard:true, angle:90, arc:200, dist:[14, 40], dur:[.55, .8], w:w, h:h*.9, gravity:50, spin:220});
        tl.fromTo(t, {x:0}, {x:2, duration:.04, yoyo:true, repeat:5, clearProps:'x'}, 0);
        snd(S.sound || 'iceShatter'); break; }
      case 'zzz':      // the Zs pop, a stretch, spores drift off
        spray(tl, mk, 0, x + w*.25, top + h*.15, {n:3, glyphs:['Z', 'z', 'Z'], size:[13, 19], angle:-60, arc:40, dist:[24, 40], dur:[.35, .5], stagger:.07, scale1:1.8, cls:'fxc-zz'});
        tl.fromTo(t, {scaleY:1}, {scaleY:1.05, scaleX:.97, transformOrigin:'50% 100%', duration:.18, yoyo:true, repeat:1, ease:'sine.inOut', clearProps:'transform'}, .2);
        spray(tl, mk, .15, x, y, {n:6, colors:['#c8b5f2', '#e6dbff'], size:[3, 5], angle:-90, arc:120, dist:[20, 40], dur:[.6, .8], w:w*.8, h:h*.6, alpha:.8});
        snd('readyChime'); break;
      case 'sparks':   // the last sparks jump out and fizzle into the ground
        spray(tl, mk, 0, x, y, {n:10, colors:[S.c2, S.c3 || '#fff7b0', '#ffffff'], size:[3, 5], angle:-90, arc:200, dist:[16, 36], dur:[.4, .6], w:w*.8, h:h*.7, gravity:40, stagger:.02});
        tl.fromTo(t, {x:0}, {x:1.5, duration:.03, yoyo:true, repeat:5, clearProps:'x'}, 0); snd(kind === 'shocked' ? 'paralyzeBuzz' : 'neutralTick'); break;
      case 'stars':    // the stars fly off and the head clears
        spray(tl, mk, 0, x, top + h*.12, {n:4, glyphs:['★', '✦', '★', '✧'], size:[12, 16], angle:-90, arc:200, dist:[30, 55], dur:[.45, .6], cls:'fxc-star'});
        tl.fromTo(t, {rotation:-3}, {rotation:0, duration:.5, ease:'elastic.out(1, .4)', clearProps:'rotation'}, 0); snd('readyChime'); break;
      case 'wobble':   // the sway damps out; its glyph pops away
        tl.fromTo(t, {rotation:0}, {keyframes:[{rotation:5}, {rotation:-4}, {rotation:2.5}, {rotation:-1}, {rotation:0}], duration:.55, ease:'sine.inOut', clearProps:'rotation'}, 0);
        spray(tl, mk, .05, x, top + h*.2, {n:(S.g||['•']).length + 1, glyphs:S.g, size:[13, 17], angle:-90, arc:90, dist:[22, 38], dur:[.45, .6], scale1:1.4, stagger:.08}); snd('cleanseTone'); break;
      case 'ink': {    // the ink slides off the face and the eye blinks open
        const ink = inTile(t, bag, 'fxc-se-ink'); ink.style.setProperty('--c', S.c); tint.style.opacity = 0;
        tl.fromTo(ink, {clipPath:'inset(0% 0% 0% 0%)', opacity:1}, {clipPath:'inset(100% 0% 0% 0%)', opacity:.7, duration:.5, ease:'power2.in'}, 0);
        spray(tl, mk, .3, x, bot - 2, {n:4, colors:[S.c], size:[5, 8], angle:90, arc:20, dist:[18, 30], dur:[.35, .5], w:w*.7, ease:'power2.in'});
        const eye = mk('fxc-g', '👁'); eye.style.fontSize = '20px'; tl.set(eye, {x, y:top + h*.35, xPercent:-50, yPercent:-50, scaleY:.05, opacity:0}, .35)
          .to(eye, {scaleY:1, opacity:1, duration:.12}, .35).to(eye, {scaleY:.1, duration:.06}, .6).to(eye, {scaleY:1, duration:.06}, .66).to(eye, {opacity:0, duration:.2}, .8);
        snd('cleanseTone'); break; }
      case 'fizz': {   // the acid fizzes off; a clean metal glint sweeps across
        spray(tl, mk, 0, x, y, {n:12, colors:['#d8f04a', '#b6d42c', '#f2ffb0'], size:[3, 6], angle:-90, arc:60, dist:[20, 45], dur:[.4, .6], w:w*.9, h:h*.8, stagger:.02, scale1:1.5});
        const gl = inTile(t, bag, ''); gl.style.background = 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.75) 50%, transparent 65%)';
        gl.style.backgroundSize = '300% 100%'; tl.fromTo(gl, {backgroundPosition:'100% 0%'}, {backgroundPosition:'0% 0%', duration:.4, ease:'power1.inOut'}, .3); snd('cleanseTone'); break; }
      case 'crosshair': { // the target mark shrinks away
        const xh = mk('fxc-se-x'); xh.style.color = S.c2; xh.style.borderColor = S.c2; const s = Math.min(w, h)*.7;
        tl.set(xh, {x, y, xPercent:-50, yPercent:-50, width:s, height:s, opacity:.9, rotation:0}, 0).to(xh, {scale:.2, rotation:90, opacity:0, duration:.5, ease:'back.in(1.6)'}, .05);
        snd('neutralTick'); break; }
      case 'pall':     // the purple pall lifts off upward
        tint.style.background = `linear-gradient(0deg, transparent 0, ${S.c} 45%)`; tl.fromTo(tint, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 100% 0%)', duration:.6, ease:'power2.in'}, 0);
        puffs(tl, mk, .1, x, top + h*.1, {n:4, color:'rgba(124,92,192,.5)', w:w*.8, rise:-30, size:[16, 24]}); snd('rallyTone'); break;
      case 'smokeDown': // black smoke rolls down off the card and thins out
        puffs(tl, mk, 0, x, bot - h*.15, {n:6, color:'rgba(30,26,34,.7)', w:w*.9, rise:28, drift:22, size:[16, 26], stagger:.05}); snd('puff'); break;
      case 'glow':     // the green glow flickers down; a few sickly sparks rise
        tint.style.background = `radial-gradient(ellipse at center, ${S.c} 0, rgba(110,255,90,.15) 70%)`; tint.style.mixBlendMode = 'screen';
        tl.fromTo(tint, {opacity:1}, {keyframes:[{opacity:.3}, {opacity:.8}, {opacity:.15}, {opacity:.5}, {opacity:0}], duration:.6, ease:'none'}, 0);
        spray(tl, mk, .05, x, y, {n:7, colors:['#7dff5a', '#c6ff8f'], size:[3, 5], angle:-90, arc:80, dist:[24, 50], dur:[.5, .8], w:w*.8, h:h*.6, stagger:.03});
        snd('radSizzle'); break;
      case 'smoke':    // the cover drifts apart
        puffs(tl, mk, 0, x, y, {n:6, color:'rgba(210,210,216,.75)', w:w, h:h*.6, rise:-18, drift:34, size:[18, 28], stagger:.03}); snd('puff'); break;
      case 'scar': {   // the old wound glows and closes
        const sv = svgNode('svg', {class:'fxc-svg', width:w, height:h}); document.body.appendChild(sv); bag.push(sv); gsap.set(sv, {x:c.r.left, y:top});
        const pl = svgNode('polyline', {points:zig(w*.25, h*.25, w*.75, h*.6, 3, 4), fill:'none', stroke:'#fff4ec', 'stroke-width':3, 'stroke-linecap':'round'}, sv);
        tl.fromTo(pl, {opacity:1}, {opacity:0, duration:.5, ease:'power1.in'}, .1);
        spray(tl, mk, .2, x, y, {n:4, glyphs:['✦'], size:[10, 14], dist:[10, 24], dur:[.4, .5]}); snd('healTone'); break; }
    }
    chip(tl, mk, .12, t, S.label, S.chip);
  });
};
// A unit that loses its turn shows why (log-only before): about 0.8 s on the card, nothing that blocks the replay.
const LOST = {frozen:'❄ Frozen', asleep:'💤 Asleep', paralyzed:'⚡ Tails!', stunned:'💫 Stunned', chained:'⛓ Chained', petrified:'🗿 Stone', shell:'🐚 In its shell',
  ritual:'🕯 Chanting', zeroAttack:'0 ⚔', cower:'🫣 Hides'};
M.LOST_LABEL = LOST;
M.lostTurn = function(el, reason, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  if(reason === 'paralyzed') return M.coinFlip(el, opts);
  css('lost', `.fxc-sigil{border-radius:50%; border:2px dashed #e05a3a; box-shadow:0 0 12px rgba(224,90,58,.7), inset 0 0 12px rgba(224,90,58,.5); box-sizing:border-box;}
    .fxc-zz{font-weight:900; color:#d9ccff; font-family:'Baloo 2', system-ui, sans-serif; text-shadow:0 1px 3px rgba(60,30,120,.6);}
    .fxc-star{color:#ffd84a; text-shadow:0 0 6px rgba(255,200,40,.8);}`);
  return run(opts, (tl, mk, bag)=>{
    const c = centre(t), x = c.x, y = c.y, w = c.w, h = c.h, top = c.r.top, bot = c.r.bottom, dir = isFoeEl(el) ? 1 : -1;
    switch(reason){
      case 'frozen':   // shivers in the ice, frost crackles round the edge
        tl.fromTo(t, {x:0}, {x:2, duration:.035, yoyo:true, repeat:11, ease:'none', clearProps:'x'}, 0);
        spray(tl, mk, 0, x, y, {n:8, glyphs:['✦', '❄'], size:[9, 14], angle:-90, arc:360, dist:[w*.45, w*.6], dur:[.4, .6], stagger:.03, scale0:.4, scale1:1});
        { const f = inTile(t, bag, ''); f.style.boxShadow = 'inset 0 0 16px 4px rgba(190,235,255,.9)'; tl.fromTo(f, {opacity:0}, {opacity:1, duration:.1, yoyo:true, repeat:3}, 0); }
        snd('freezeChime'); break;
      case 'asleep': { // a snore bubble grows and pops; the card bobs
        const b = mk('fxc-p'); b.style.background = 'radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(200,220,255,.55) 45%, rgba(170,190,255,.25) 70%)'; b.style.border = '1px solid rgba(255,255,255,.7)';
        tl.set(b, {x:x + w*.28, y:top + h*.22, xPercent:-50, yPercent:-50, width:6, height:6, opacity:.9}, 0).to(b, {width:26, height:26, duration:.45, ease:'sine.in'}, 0).to(b, {scale:1.4, opacity:0, duration:.08}, .45);
        spray(tl, mk, .45, x + w*.28, top + h*.22, {n:6, colors:['#e6efff'], size:[3, 4], dist:[10, 18], dur:[.25, .35]});
        spray(tl, mk, .1, x + w*.2, top + h*.12, {n:2, glyphs:['z', 'Z'], size:[12, 17], angle:-70, arc:30, dist:[18, 30], dur:[.5, .6], stagger:.15, cls:'fxc-zz'});
        tl.fromTo(t, {y:0}, {y:3, duration:.3, yoyo:true, repeat:1, ease:'sine.inOut', clearProps:'y'}, 0); snd('sleepTone'); break; }
      case 'stunned': { // stars wheel round the head while it sways
        for(let i = 0; i < 3; i++){ const s = mk('fxc-g fxc-star', '★'); s.style.fontSize = '13px'; const o = {a:i*120};
          tl.set(s, {opacity:0}, 0).to(s, {opacity:1, duration:.1}, 0).to(o, {a:i*120 + 540, duration:.7, ease:'none', onUpdate:()=>{ const r = o.a*Math.PI/180; gsap.set(s, {x:x + Math.cos(r)*w*.38, y:top + h*.08 + Math.sin(r)*9, xPercent:-50, yPercent:-50}); }}, 0).to(s, {opacity:0, duration:.15}, .6); }
        tl.fromTo(t, {rotation:0}, {keyframes:[{rotation:-3}, {rotation:3}, {rotation:-2}, {rotation:0}], duration:.7, ease:'sine.inOut', clearProps:'rotation'}, 0); snd('stunTone'); break; }
      case 'chained': { // strains forward, the chains snap taut and rattle
        const ch = inTile(t, bag, '', '<span style="position:absolute;left:8%;top:38%;font-size:22px">⛓</span><span style="position:absolute;right:8%;top:38%;font-size:22px">⛓</span>');
        tl.fromTo(t, {y:0}, {y:dir*7, duration:.14, ease:'power2.out'}, 0).to(t, {y:0, duration:.1, ease:'power3.in', clearProps:'y'}, .14);
        tl.fromTo(ch, {x:0, opacity:1}, {x:3, duration:.04, yoyo:true, repeat:7, ease:'none'}, .22).to(ch, {opacity:0, duration:.2}, .6);
        spray(tl, mk, .24, x, y, {n:6, colors:['#d6d6d6', '#ffffff'], size:[2, 4], dist:[14, 28], dur:[.25, .4]}); snd('clang'); break; }
      case 'petrified': // tries to move, stone grinds, dust falls
        tl.fromTo(t, {y:0}, {y:dir*2, duration:.12, ease:'none', yoyo:true, repeat:1, clearProps:'y'}, 0);
        spray(tl, mk, .05, x, bot - 3, {n:9, colors:['#a39d90', '#8a8478', '#c9c3b6'], size:[2, 5], angle:90, arc:50, dist:[10, 26], dur:[.4, .6], w:w*.9, stagger:.02, ease:'power2.in'});
        puffs(tl, mk, .1, x, bot - 4, {n:3, color:'rgba(170,164,150,.55)', w:w*.8, rise:-10, size:[12, 18]}); snd('knockOut'); break;
      case 'shell': {  // ducks into its shell and peeks out
        const s = mk('fxc-g', '🐚'); s.style.fontSize = Math.round(Math.min(w, h)*.42) + 'px';
        tl.fromTo(t, {scaleY:1}, {scaleY:.86, scaleX:1.04, transformOrigin:'50% 100%', duration:.15, ease:'power2.out'}, 0).to(t, {scaleY:1, scaleX:1, duration:.3, ease:'back.out(2)', clearProps:'transform'}, .5);
        tl.set(s, {x, y, xPercent:-50, yPercent:-50, scale:0, opacity:1}, .05).to(s, {scale:1, duration:.18, ease:'back.out(2.5)'}, .05).to(s, {scale:.4, opacity:0, duration:.2}, .5); snd('bulwarkTone'); break; }
      case 'ritual': { // Ashen Choir: a sigil turns under it, candles gutter
        floorSigil(tl, mk, 0, x, bot - h*.08, 'fxc-sigil', {w:w*1.15, spin:120, dur:.8});
        spray(tl, mk, .05, x, bot - h*.1, {n:3, glyphs:['🕯'], size:[13, 15], angle:-90, arc:0, dist:[4, 8], dur:[.6, .7], w:w*1.1, stagger:.06});
        spray(tl, mk, .1, x, bot - h*.1, {n:6, colors:['#ff8a4a', '#9a8f88'], size:[2, 4], angle:-90, arc:40, dist:[20, 44], dur:[.6, .8], w:w, stagger:.04}); snd('curse'); break; }
      case 'zeroAttack': // a feeble half-lunge that fizzles
        tl.fromTo(t, {y:0}, {y:dir*6, duration:.12, ease:'power1.out'}, 0).to(t, {y:0, duration:.25, ease:'power1.in', clearProps:'y'}, .14);
        puffs(tl, mk, .12, x, isFoeEl(el) ? bot : top, {n:3, color:'rgba(180,170,150,.5)', w:w*.4, rise:dir*-8, size:[10, 14]}); snd('mysteryBoing'); break;
      default: tl.fromTo(t, {x:0}, {x:2, duration:.05, yoyo:true, repeat:5, clearProps:'x'}, 0);
    }
    chip(tl, mk, .08, t, LOST[reason] || '⏸ Skips', 'rgba(40,36,52,.85)');
  });
};
// Paralyze: the coin flip itself, over the card. It lands tails (⚡), sparks crack and the card jolts (the engine only reports
// the failed flips; opts.heads shows the lucky side, for the lab).
M.coinFlip = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t) return Promise.resolve();
  css('coin', `.fxc-coin{width:30px; height:30px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff6c2, #f2c94c 45%, #b8861a 100%); border:2px solid #8a6312;
    box-shadow:0 2px 6px rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; font:900 15px/1 system-ui; color:#6a4a08; transform-style:preserve-3d;}`);
  return run(opts, (tl, mk, bag)=>{
    // 2026-10-15 (review): a clean flat flip (scaleY follows the spin), so it never smears into a diagonal at phone size
    const c = centre(t), x = c.x, y0 = c.r.top + c.h*.36, coin = mk('fxc-coin', '★'), sp = {a:0}, flips = 5;
    const face = ()=>{ const k = Math.cos(sp.a*Math.PI); gsap.set(coin, {scaleY:Math.max(.08, Math.abs(k))}); coin.style.filter = k < 0 ? 'brightness(.78)' : ''; };
    tl.set(coin, {x, y:y0, xPercent:-50, yPercent:-50, opacity:0}, 0).to(coin, {opacity:1, duration:.06}, 0)
      .to(coin, {y:y0 - Math.min(40, c.h*.4), duration:.26, ease:'power2.out'}, 0).to(coin, {y:y0, duration:.24, ease:'power2.in'}, .26)
      .to(sp, {a:flips*2, duration:.5, ease:'power1.out', onUpdate:face}, 0)
      .add(()=>{ coin.textContent = opts.heads ? '★' : '⚡'; coin.style.background = opts.heads ? '' : 'radial-gradient(circle at 35% 30%, #fffbe0, #ffe14d 45%, #c9a200 100%)'; }, .42)
      .to(coin, {scale:1.25, duration:.08, yoyo:true, repeat:1}, .52).to(coin, {opacity:0, y:y0 - 10, duration:.2}, .9);
    if(!opts.heads){
      spray(tl, mk, .56, x, y0, {n:10, colors:['#ffe14d', '#fff7b0', '#ffffff'], size:[2, 5], dist:[16, 40], dur:[.3, .45]});
      tl.fromTo(t, {x:0}, {x:2.5, duration:.03, yoyo:true, repeat:7, ease:'none', clearProps:'x'}, .56);
      { const f = inTile(t, bag, ''); f.style.background = 'rgba(255,225,77,.35)'; tl.fromTo(f, {opacity:0}, {opacity:1, duration:.04}, .56).to(f, {opacity:0, duration:.3}, .6); }
      chip(tl, mk, .6, t, '⚡ Tails! Paralyzed', '#a88a00');
    } else chip(tl, mk, .6, t, '★ Heads! It acts', '#2f7d1f');
    tl.add(()=> snd('paralyzeBuzz'), .56);
  });
};
// Woken by damage: a jolt, a "!" and the Zs scatter.
M.wakeJolt = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), x = c.x, top = c.r.top;
    tl.fromTo(t, {y:0, scale:1}, {y:-9, scale:1.06, duration:.09, ease:'power2.out'}, 0).to(t, {y:0, scale:1, duration:.3, ease:'bounce.out', clearProps:'transform'}, .09);
    const ex = mk('fxc-g', '❗'); ex.style.fontSize = '24px';
    tl.set(ex, {x:x + c.w*.3, y:top + 4, xPercent:-50, yPercent:-50, scale:0, rotation:-15}, 0).to(ex, {scale:1.2, rotation:8, duration:.14, ease:'back.out(3)'}, .02).to(ex, {opacity:0, y:top - 14, duration:.25}, .55);
    spray(tl, mk, .02, x + c.w*.2, top + c.h*.15, {n:3, glyphs:['Z', 'z', 'Z'], size:[12, 18], angle:-90, arc:180, dist:[26, 44], dur:[.3, .45], cls:'fxc-zz', spin:120});
    chip(tl, mk, .1, t, '😳 Awake!', '#6a54a8'); snd('mysteryBoing');
  });
};

// ======================================================================================================================
// 2. DEATHS: one look per cause, readable at a glance. The ordinary knock-out (fallDeathVfx), burn, bleed, poison, cold and
//    token shatter stay as they are; these cover every cause that used to fall back to the topple. The card face is gone by
//    ~0.85 s at 1× (the replay removes the slot at 0.9 s), overlays may linger a little longer. opts.speed = replay speed.
// ======================================================================================================================
function dying(el){ const t = tileOf(el); if(!t || !t.isConnected) return null; if(G()) gsap.set(t, {filter:F('none')}); const c = centre(t); return {t, b:boardOf(el), c, x:c.x, y:c.y, w:c.w, h:c.h, top:c.r.top, bot:c.r.bottom, left:c.r.left, right:c.r.right}; }
function svgOver(bag, x, y, w, h, z){ const sv = svgNode('svg', {class:'fxc-svg', width:Math.ceil(w), height:Math.ceil(h), viewBox:`0 0 ${Math.ceil(w)} ${Math.ceil(h)}`}); if(z) sv.style.zIndex = z; document.body.appendChild(sv); bag.push(sv); gsap.set(sv, {x, y}); return sv; }
css('death', `
.fxc-char{background:radial-gradient(ellipse at 50% 45%, rgba(20,12,6,0) 0, rgba(40,22,8,.35) 50%, rgba(12,6,2,.8) 100%); box-shadow:inset 0 0 10px 2px rgba(255,140,40,.55);}
.fxc-bolt polyline{fill:none; stroke-linejoin:round; stroke-linecap:round;}
.fxc-mote{border-radius:50%; box-shadow:0 0 8px currentColor; background:currentColor;}
.fxc-wave{border-radius:46% 54% 0 0 / 60% 60% 0 0; background:linear-gradient(180deg, rgba(240,252,255,.95) 0, rgba(120,200,240,.92) 14%, rgba(30,110,180,.92) 100%);}
.fxc-water{background:linear-gradient(180deg, rgba(190,235,255,.85) 0, rgba(60,150,210,.72) 8%, rgba(20,80,150,.82) 100%);}
.fxc-rock{border-radius:38% 45% 40% 50%; background:radial-gradient(circle at 35% 30%, #b9b2a5, #7d766b 60%, #5a544b); box-shadow:inset -2px -3px 0 rgba(0,0,0,.25);}
.fxc-snow{border-radius:50% 50% 40% 40%; background:radial-gradient(ellipse at 50% 30%, #ffffff, #e8f4ff 55%, #c6dcef);}
.fxc-scrap{border-radius:2px; box-shadow:inset 0 0 6px rgba(40,20,0,.75); background-repeat:no-repeat;}
.fxc-kaboom{font-size:64px; line-height:1; filter:drop-shadow(0 0 10px rgba(255,180,40,.9));}
.fxc-sigil-dark{border-radius:50%; background:radial-gradient(ellipse at center, #050208 0, #1a0a24 45%, rgba(120,20,60,.6) 70%, rgba(120,20,60,0) 74%); box-shadow:0 0 18px rgba(170,30,80,.7);}
.fxc-sigil-dark::after{content:''; position:absolute; inset:8%; border-radius:50%; border:2px dashed rgba(230,70,110,.85);}
.fxc-sigil-red{border-radius:50%; border:2.5px solid #e0402a; box-shadow:0 0 14px rgba(224,64,42,.85), inset 0 0 14px rgba(224,64,42,.6); box-sizing:border-box;}
.fxc-sigil-red::after{content:''; position:absolute; inset:14%; border-radius:50%; border:1.5px dashed rgba(255,150,110,.9);}
.fxc-ichor{border-radius:0 0 50% 50% / 0 0 6px 6px; background:linear-gradient(180deg, rgba(255,229,138,.95), #e8b021); box-shadow:0 0 6px rgba(255,200,60,.8);}
.fxc-ichor::after{content:''; position:absolute; left:50%; bottom:-4px; width:7px; height:7px; transform:translateX(-50%); border-radius:50%; background:#ffd34a;}
.fxc-cell{border-radius:50%; background:radial-gradient(circle at 40% 35%, rgba(220,255,230,.55), rgba(120,220,170,.35) 60%, rgba(60,170,120,.15)); border:2px solid rgba(150,240,190,.8); box-sizing:border-box;}
.fxc-title .fxc-t1{display:block; font:900 13px/1 'Baloo 2', system-ui, sans-serif; letter-spacing:.3em; color:#ffe9a8; text-transform:uppercase;}
.fxc-title .fxc-t2{display:block; font:900 clamp(20px, 6.4vw, 34px)/1.05 'Baloo 2', system-ui, sans-serif; color:#fff; text-shadow:0 3px 0 #7a1d12, 0 0 18px rgba(255,140,60,.9);}
.fxc-title{text-align:center; padding:10px 22px; max-width:calc(100vw - 16px); box-sizing:border-box; border-radius:14px; background:linear-gradient(180deg, rgba(40,14,10,.86), rgba(20,8,6,.9)); border:2px solid #d9a441; box-shadow:0 6px 24px rgba(0,0,0,.5);}
.fxc-ko{font:900 30px/1 'Baloo 2', system-ui, sans-serif; color:#fff; text-shadow:0 0 0 #000, 0 3px 0 #8e1420, 0 0 10px rgba(255,60,60,.8); white-space:nowrap;}
.fxc-foil{background:linear-gradient(115deg, rgba(255,120,200,.6), rgba(255,240,120,.6) 25%, rgba(120,255,200,.6) 50%, rgba(120,170,255,.6) 75%, rgba(220,130,255,.6)),
  linear-gradient(115deg, transparent 40%, rgba(255,255,255,.85) 50%, transparent 60%); border-radius:8px; box-shadow:inset 0 0 0 2px rgba(255,255,255,.85), 0 2px 8px rgba(0,0,0,.25);}
`);

// ---- Electrocuted (Electricity, Dragon Lightning, Shock bolts): charred and crackling ----
// A: a bolt strikes, the card chars black-brown, little arcs crackle over it and it smokes away.
M.deathLightning = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, top} = D;
  return run(opts, (tl, mk, bag)=>{
    const sv = svgOver(bag, x - 60, top - 140, 120, 140 + h*.55, 1245); sv.classList.add('fxc-bolt');
    const pts = zig(60 + rnd(-20, 20), 0, 60, 140 + h*.45, 7, 14);
    const glow = svgNode('polyline', {points:pts, stroke:'rgba(120,210,255,.75)', 'stroke-width':9}, sv), core = svgNode('polyline', {points:pts, stroke:'#ffffff', 'stroke-width':3}, sv);
    tl.fromTo([glow, core], {opacity:0}, {opacity:1, duration:.03}, 0).to([glow, core], {opacity:0, duration:.05, yoyo:true, repeat:2}, .06).to(sv, {opacity:0, duration:.1}, .22);
    flashAt(tl, mk, 0, x, y, w*2.4, h*1.8, 'rgba(200,240,255,.95)', .3);
    tl.fromTo(t, {filter:F('brightness(1)')}, {filter:F('brightness(3) saturate(0)'), duration:.04}, .02)
      .to(t, {filter:F('brightness(.62) sepia(.8) saturate(1.4) contrast(1.25)'), duration:.12}, .1);
    const ch = inTile(t, bag, 'fxc-char'); tl.fromTo(ch, {opacity:0}, {opacity:1, duration:.15}, .1);
    tl.fromTo(t, {x:0}, {x:2.5, duration:.03, yoyo:true, repeat:9, ease:'none'}, .05);
    // crackles: small arcs flicker on the charred face
    const cs = svgOver(bag, D.left, top, w, h, 1246); cs.classList.add('fxc-bolt');
    for(let i = 0; i < 4; i++){ const a = svgNode('polyline', {points:zig(rnd(.1, .5)*w, rnd(.1, .9)*h, rnd(.5, .9)*w, rnd(.1, .9)*h, 4, 6), stroke:i%2 ? '#9fe6ff' : '#d9c8ff', 'stroke-width':1.6, opacity:0}, cs);
      tl.to(a, {opacity:1, duration:.02, yoyo:true, repeat:3}, .18 + i*.09); }
    spray(tl, mk, .02, x, y - h*.1, {n:12, colors:['#ffffff', '#9fe6ff', '#fff3a0'], size:[2, 4], dist:[24, 60], dur:[.25, .45], gravity:20});
    puffs(tl, mk, .35, x, top + h*.25, {n:5, color:'rgba(60,56,52,.6)', w:w*.7, rise:-44, size:[16, 24], stagger:.06});
    spray(tl, mk, .4, x, top + h*.3, {n:5, colors:['#ff9a3a', '#ffcf6a'], size:[2, 3], angle:-90, arc:60, dist:[20, 46], dur:[.5, .7], w:w*.7});
    tl.to(t, {scale:.95, y:4, opacity:0, duration:.32, ease:'power1.in'}, .52); fadeSlot(tl, el, t, .55);
    tl.add(()=>{ snd('thunder'); snd('shockTone'); }, 0);
  });
};
// B: one big bolt from the top of the field; the card flashes like an x-ray, turns to cinders and crumbles down.
M.deathLightning_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const H = Math.max(160, top + h*.5), sv = svgOver(bag, x - 80, top + h*.5 - H, 160, H, 1245); sv.classList.add('fxc-bolt');
    const p1 = zig(80 + rnd(-30, 30), 0, 80, H, 10, 20), p2 = zig(80, H*.45, 80 + rnd(-60, 60), H*.75, 3, 10);
    [p1, p2].forEach((p, i)=>{ const g1 = svgNode('polyline', {points:p, stroke:'rgba(170,140,255,.7)', 'stroke-width':i ? 5 : 12}, sv); const g2 = svgNode('polyline', {points:p, stroke:'#fff', 'stroke-width':i ? 1.5 : 3.5}, sv);
      tl.fromTo([g1, g2], {opacity:0}, {opacity:1, duration:.02}, i*.03); });
    tl.to(sv, {opacity:0, duration:.18}, .2);
    flashAt(tl, mk, 0, x, y, w*3, h*2.2, 'rgba(235,225,255,.95)', .35);
    tl.fromTo(t, {filter:F('invert(0)')}, {keyframes:[{filter:F('invert(1) brightness(1.6)')}, {filter:F('invert(0) brightness(2)')}, {filter:F('invert(1) brightness(1.6)')}, {filter:F('brightness(.15) sepia(1)')}], duration:.3, ease:'none'}, .02);
    // the cinder edge eats the card from the top down while ash and embers fall away
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(100% 0% 0% 0%)', duration:.5, ease:'power1.in'}, .32);
    for(let k = 0; k < 5; k++) spray(tl, mk, .34 + k*.09, x, top + h*(.1 + k*.2), {n:4, colors:['#1b1410', '#3a2a20', '#ff7a1a'], size:[3, 6], angle:90, arc:70, dist:[10, 30], dur:[.45, .6], w:w*.9, gravity:30, spin:180, shard:true});
    puffs(tl, mk, .4, x, bot - h*.2, {n:4, color:'rgba(40,36,34,.55)', w:w, rise:-30, size:[18, 26]});
    tl.set(t, {opacity:0}, .84); fadeSlot(tl, el, t, .5);
    tl.add(()=>{ snd('thunder'); snd('burnAway'); }, 0);
  });
};
// C: Electric bats theme. Cyan and violet arcs crawl over it, it swells with charge and pops into sparks.
M.deathLightning_C = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, left, top} = D;
  return run(opts, (tl, mk, bag)=>{
    const sv = svgOver(bag, left - 6, top - 6, w + 12, h + 12, 1245); sv.classList.add('fxc-bolt');
    for(let f = 0; f < 6; f++){ for(let i = 0; i < 3; i++){ const a = svgNode('polyline', {points:zig(rnd(0, w + 12), rnd(0, h + 12), rnd(0, w + 12), rnd(0, h + 12), 5, 8), stroke:i%2 ? '#b49cff' : '#7fe0ff', 'stroke-width':2, opacity:0}, sv);
      tl.to(a, {opacity:1, duration:.01}, f*.07).to(a, {opacity:0, duration:.01}, f*.07 + .06); } }
    tl.fromTo(t, {filter:F('brightness(1)')}, {filter:F('brightness(1.5) saturate(1.6) hue-rotate(160deg)'), duration:.4}, 0);
    tl.fromTo(t, {x:0}, {x:2, duration:.025, yoyo:true, repeat:15, ease:'none'}, 0);
    tl.to(t, {scale:1.1, duration:.12, ease:'power2.in'}, .32).to(t, {scale:.2, opacity:0, duration:.12, ease:'power3.in'}, .44);
    flashAt(tl, mk, .44, x, y, w*1.8, w*1.8, 'rgba(160,220,255,.95)', .3);
    ringAt(tl, mk, .44, x, y, {from:20, to:w*2, color:'#7fe0ff', glow:'rgba(127,224,255,.8)', width:2, dur:.4});
    spray(tl, mk, .44, x, y, {n:18, colors:['#7fe0ff', '#b49cff', '#ffffff'], size:[2, 5], dist:[30, 80], dur:[.35, .6], gravity:16});
    fadeSlot(tl, el, t, .44); tl.add(()=>{ snd('shockTone'); snd('paralyzeBuzz'); }, 0).add(()=> snd('boom'), .44);
  });
};

// ---- Killed by magic (Map 50+): arcane motes ----
// A: violet and gold motes lift off the card from the bottom up and spiral away.
M.deathMagic = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    floorSigil(tl, mk, 0, x, bot - 6, 'fxc-sigil-red', {w:w*1.2, spin:180, dur:.9, style:'border-color:#b48cff; box-shadow:0 0 14px rgba(180,140,255,.85), inset 0 0 12px rgba(180,140,255,.6);'});
    tl.fromTo(t, {filter:F('brightness(1)')}, {filter:F('brightness(1.35) saturate(1.3) drop-shadow(0 0 8px rgba(180,140,255,.9))'), duration:.2}, 0);
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 100% 0%)', duration:.6, ease:'power1.inOut'}, .15);
    for(let i = 0; i < 18; i++){ const m = mk('fxc-mote'), f = i/18, sx = D.left + rnd(.05, .95)*w, sy = bot - h*f*.95, s = rnd(3, 6), col = i%3 ? '#c9a6ff' : '#ffd77a';
      m.style.width = m.style.height = s + 'px'; m.style.color = col; const t0 = .15 + f*.55, o = {a:rnd(0, 6.28)};
      tl.set(m, {x:sx, y:sy, xPercent:-50, yPercent:-50, opacity:0}, t0).to(m, {opacity:1, duration:.05}, t0)
        .to(m, {y:sy - rnd(50, 90), duration:.7, ease:'power1.out'}, t0).to(o, {a:'+=6', duration:.7, ease:'none', onUpdate:()=> gsap.set(m, {x:sx + Math.sin(o.a)*10})}, t0).to(m, {opacity:0, duration:.25}, t0 + .45); }
    fadeSlot(tl, el, t, .4); tl.set(t, {opacity:0}, .76); tl.add(()=>{ snd('celesta'); snd('pitchChime'); }, 0);
  });
};
// B: a rune seal closes over it, the card folds into a point of light and a star bursts.
M.deathMagic_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  return run(opts, (tl, mk)=>{
    const ring = mk('fxc-sigil-red'); ring.style.borderColor = '#ffd77a'; ring.style.boxShadow = '0 0 16px rgba(255,215,122,.9), inset 0 0 12px rgba(180,140,255,.7)';
    tl.set(ring, {x, y, xPercent:-50, yPercent:-50, width:w*1.6, height:w*1.6, opacity:0, rotation:-90}, 0).to(ring, {width:w*.9, height:w*.9, opacity:1, rotation:0, duration:.35, ease:'power2.in'}, 0);
    tl.to(t, {rotationY:90, scaleY:.6, transformPerspective:500, filter:F('brightness(2) saturate(.4)'), duration:.35, ease:'power2.in'}, .2).set(t, {opacity:0}, .55);
    const st = mk('fxc-g', '✦'); st.style.fontSize = '40px'; st.style.color = '#fff3c4'; st.style.textShadow = '0 0 14px #ffd77a, 0 0 26px #b48cff';
    tl.set(st, {x, y, xPercent:-50, yPercent:-50, scale:0, rotation:0}, .5).to(st, {scale:1.4, rotation:90, duration:.18, ease:'back.out(3)'}, .5).to(st, {scale:0, rotation:180, opacity:0, duration:.3, ease:'power2.in'}, .72);
    tl.to(ring, {scale:1.6, opacity:0, duration:.3}, .55);
    spray(tl, mk, .55, x, y, {n:10, glyphs:['✧', '·', '✦'], size:[10, 16], dist:[30, 70], dur:[.45, .6]});
    fadeSlot(tl, el, t, .4); tl.add(()=> snd('celesta'), 0).add(()=> snd('pitchChime'), .5);
  });
};

// ---- Mind shattered (Psychic): violet ----
// A: violet glass cracks race out from the brow, a ripple rings out and the face splits in two.
M.deathPsychic = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, left, top} = D;
  return run(opts, (tl, mk, bag)=>{
    const fx = w*.5, fy = h*.3, sv = svgOver(bag, left, top, w, h, 1246);
    for(let i = 0; i < 9; i++){ const a = i/9*Math.PI*2 + rnd(-.2, .2), L = rnd(.45, .8)*Math.max(w, h);
      const pl = svgNode('polyline', {points:zig(fx, fy, fx + Math.cos(a)*L, fy + Math.sin(a)*L, 4, 5), fill:'none', stroke:'#f0e0ff', 'stroke-width':1.5, style:'filter:drop-shadow(0 0 2px #a05cff)'}, sv);
      pl.style.strokeDasharray = 300; pl.style.strokeDashoffset = 300; tl.to(pl, {strokeDashoffset:0, duration:.18, ease:'power2.out'}, .04 + i*.012); }
    ringAt(tl, mk, 0, left + fx, top + fy, {from:10, to:w*2.4, color:'#c08cff', glow:'rgba(160,92,255,.8)', width:3, dur:.55});
    ringAt(tl, mk, .14, left + fx, top + fy, {from:10, to:w*1.8, color:'#e6d0ff', width:2, dur:.5});
    tl.fromTo(t, {filter:F('none')}, {filter:F('saturate(.5) hue-rotate(-30deg) brightness(1.15)'), duration:.2}, 0);
    // split: two copies clipped along a jagged seam slide apart; the real face hides
    const seam = []; for(let k = 0; k <= 6; k++) seam.push([(.5 + rnd(-.08, .08))*w, k/6*h]);
    const poly = side=> 'polygon(' + (side < 0 ? ['0 0'] : [w + 'px 0']).concat(seam.map(p=> `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`), side < 0 ? ['0 ' + h + 'px'] : [w + 'px ' + h + 'px']).join(',') + ')';
    tl.add(()=>{ [-1, 1].forEach(s=>{ const g = ghost(t, bag, {clipPath:poly(s), filter:F('saturate(.5) hue-rotate(-30deg) brightness(1.15)')});
      gsap.to(g, {x:'+=' + s*rnd(22, 30), y:'+=' + rnd(14, 26), rotation:s*rnd(8, 14), opacity:0, duration:.5, ease:'power2.in'}); }); t.style.visibility = 'hidden'; }, .3);
    tl.to(sv, {opacity:0, duration:.2}, .32); tl.to({}, {duration:.55}, .3);
    fadeSlot(tl, el, t, .35); tl.add(()=>{ snd('reflectTone'); snd('iceShatter'); }, .02);
  });
};
// B: mind blown. Violet waves pulse off the head, the card wobbles out of focus and fades; a spiral drifts up.
M.deathPsychic_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top} = D;
  return run(opts, (tl, mk)=>{
    for(let i = 0; i < 3; i++) ringAt(tl, mk, i*.14, x, top + h*.25, {from:12, to:w*(1.4 + i*.3), color:'#c08cff', glow:'rgba(160,92,255,.6)', width:2.5, squash:.55, dur:.5});
    tl.fromTo(t, {skewX:0, filter:F('blur(0px)')}, {keyframes:[{skewX:6, scaleX:1.04}, {skewX:-6, scaleX:.97}, {skewX:4, scaleX:1.03}, {skewX:0, scaleX:1}], duration:.55, ease:'sine.inOut'}, 0);
    tl.to(t, {filter:F('blur(3px) saturate(.3) hue-rotate(-40deg)'), opacity:0, duration:.45, ease:'power1.in'}, .35);
    spray(tl, mk, .2, x, top + h*.1, {n:2, glyphs:['🌀', '💫'], size:[18, 22], angle:-90, arc:30, dist:[36, 50], dur:[.6, .7], stagger:.1});
    fadeSlot(tl, el, t, .4); tl.add(()=> snd('reflectTone'), 0);
  });
};

// ---- Withered away (Dragonic Spire): black ash ----
// A: black creeps up from the base, the face crumbles into ash from the top and a skull rises in the smoke.
M.deathWither = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const blk = inTile(t, bag, ''); blk.style.background = 'linear-gradient(0deg, rgba(14,10,18,.85) 0, rgba(24,18,30,.55) 50%, rgba(24,18,30,0) 100%)';
    tl.fromTo(blk, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:.3, ease:'power1.in'}, 0);
    tl.to(t, {filter:F('grayscale(1) brightness(.7) contrast(1.15)'), duration:.3}, 0);
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(100% 0% 0% 0%)', duration:.48, ease:'power1.in'}, .3);
    for(let k = 0; k < 6; k++) spray(tl, mk, .3 + k*.075, x, top + h*(k/6), {n:4, colors:['#0d0b0f', '#2b2730', '#4a4450'], size:[3, 6], angle:90, arc:90, dist:[14, 36], dur:[.5, .7], w:w, gravity:24, spin:200, shard:true});
    puffs(tl, mk, .25, x, top + h*.3, {n:4, color:'rgba(15,12,18,.7)', w:w*.6, rise:-40, size:[18, 28]});
    const sk = mk('fxc-g', '💀'); sk.style.fontSize = '22px'; sk.style.filter = 'grayscale(1) drop-shadow(0 0 6px rgba(0,0,0,.9))';
    tl.set(sk, {x, y:top + h*.3, xPercent:-50, yPercent:-50, opacity:0, scale:.6}, .3).to(sk, {opacity:1, scale:1, y:top - 10, duration:.45, ease:'power1.out'}, .3).to(sk, {opacity:0, y:top - 30, duration:.35}, .75);
    fadeSlot(tl, el, t, .4); tl.set(t, {opacity:0}, .8); tl.add(()=> snd('curse'), 0);
  });
};
// B: it wilts: the face shrivels and browns, dry leaves drop, and it fades.
M.deathWither_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk)=>{
    tl.to(t, {scaleY:.8, scaleX:.92, skewX:5, transformOrigin:'50% 100%', filter:F('sepia(.9) saturate(.45) brightness(.6)'), duration:.55, ease:'power2.in'}, 0)
      .to(t, {opacity:0, y:6, duration:.3}, .55);
    spray(tl, mk, .15, x, bot - h*.35, {n:7, glyphs:['🍂', '🥀', '🍂'], size:[12, 16], angle:90, arc:80, dist:[20, 40], dur:[.6, .8], w:w*.8, h:h*.4, spin:180, gravity:20, stagger:.04});
    puffs(tl, mk, .3, x, bot - 6, {n:3, color:'rgba(40,34,30,.5)', w:w*.6, rise:-14, size:[14, 20]});
    fadeSlot(tl, el, t, .5); tl.add(()=> snd('curse'), 0);
  });
};

// ---- Irradiated (Uranium, World 3): green ----
// A: it glows bright green, burns down to a dark silhouette with a green rim and fades; sickly sparks rise.
M.deathIrradiation = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  return run(opts, (tl, mk, bag)=>{
    const g = inTile(t, bag, ''); g.style.background = 'radial-gradient(ellipse at center, rgba(180,255,140,.95) 0, rgba(90,255,70,.6) 55%, rgba(40,180,30,.3))'; g.style.mixBlendMode = 'screen';
    tl.fromTo(g, {opacity:0}, {opacity:1, duration:.25, ease:'power1.in'}, 0).to(g, {opacity:0, duration:.2}, .3);
    tl.to(t, {filter:F('brightness(1.8) saturate(1.6) hue-rotate(60deg)'), duration:.25}, 0)
      .to(t, {filter:F('brightness(.3) sepia(1) saturate(3) hue-rotate(50deg) drop-shadow(0 0 6px #7dff5a)'), duration:.22}, .3)
      .to(t, {opacity:0, scale:.96, duration:.3, ease:'power1.in'}, .55);
    spray(tl, mk, .05, x, y, {n:12, colors:['#7dff5a', '#c6ff8f', '#e8ffd0'], size:[2, 4], angle:-90, arc:100, dist:[30, 70], dur:[.6, .9], w:w*.8, h:h*.6, stagger:.03});
    const r = mk('fxc-g', '☢'); r.style.fontSize = '22px'; r.style.color = '#c6ff8f'; r.style.textShadow = '0 0 8px #7dff5a';
    tl.set(r, {x, y, xPercent:-50, yPercent:-50, opacity:0, scale:.5}, .45).to(r, {opacity:.9, scale:1.1, duration:.15}, .45).to(r, {opacity:0, y:y - 24, duration:.35}, .65);
    fadeSlot(tl, el, t, .5); tl.add(()=>{ snd('radSizzle'); snd('geiger'); }, 0);
  });
};
// B: meltdown flicker. It flickers between itself and a green negative, the ☢ sigil flashes and it collapses to a point.
M.deathIrradiation_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  return run(opts, (tl, mk)=>{
    tl.fromTo(t, {filter:F('none')}, {keyframes:[{filter:F('invert(1) hue-rotate(180deg) sepia(1) saturate(4) hue-rotate(50deg)')}, {filter:F('none')}, {filter:F('invert(1) hue-rotate(180deg) sepia(1) saturate(4) hue-rotate(50deg)')}, {filter:F('none')}, {filter:F('brightness(1.8) sepia(1) saturate(5) hue-rotate(50deg)')}], duration:.45, ease:'steps(5)'}, 0);
    const r = mk('fxc-g', '☢'); r.style.fontSize = Math.round(w*.7) + 'px'; r.style.color = '#c6ff8f'; r.style.textShadow = '0 0 14px #7dff5a';
    tl.set(r, {x, y, xPercent:-50, yPercent:-50, opacity:0, scale:.6}, .1).to(r, {opacity:.85, scale:1, duration:.08, yoyo:true, repeat:3}, .1).set(r, {opacity:0}, .45);
    tl.to(t, {scale:0, opacity:0, duration:.18, ease:'power3.in'}, .48);
    flashAt(tl, mk, .55, x, y, w*1.6, w*1.6, 'rgba(160,255,120,.95)', .3);
    spray(tl, mk, .55, x, y, {n:14, colors:['#7dff5a', '#c6ff8f'], size:[2, 4], dist:[20, 60], dur:[.4, .6]});
    fadeSlot(tl, el, t, .45); tl.add(()=> snd('geiger'), 0).add(()=> snd('radSizzle'), .5);
  });
};

// ---- Drowned / washed away (Tsunami, Tide-spout): bubbles ----
// A: a wave rolls in from the side and carries the card off with it.
M.deathWater = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, left, bot} = D, s = Math.random() < .5 ? 1 : -1;
  return run(opts, (tl, mk, bag)=>{
    // 2026-10-15 (review): one curling wave with a white foam lip, sized to the card, rolls across it from just off one side
    const W = w*1.7, H = h*1.15, sv = svgOver(bag, 0, 0, W, H, 1247), gid = 'fxcw' + (++WAVE_ID);
    sv.setAttribute('viewBox', '0 0 100 100'); sv.setAttribute('preserveAspectRatio', 'none');
    sv.innerHTML = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fbff"/><stop offset=".22" stop-color="#7fd0f0"/><stop offset=".6" stop-color="#2f8fc8"/><stop offset="1" stop-color="#1a5f9a"/></linearGradient></defs>
      <path d="M0 100 L0 58 C10 42 26 22 50 13 C70 6 88 10 96 24 C100 33 93 42 84 36 C77 31 70 32 66 40 C60 54 62 78 72 100 Z" fill="url(#${gid})" opacity=".93"/>
      <path d="M2 57 C12 41 27 22 50 14 C70 7 87 11 95 24 C99 32 93 40 85 35" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".95"/>
      <path d="M8 70 C20 60 30 52 42 50 M14 84 C26 76 36 72 48 72" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    const x0 = s > 0 ? left - W*.95 : left + w - W*.05, x1 = x - W*.5 + s*w*.1, x2 = s > 0 ? left + w*1.2 : left - W - w*.2, y0 = bot - H + 6;
    tl.set(sv, {x:x0, y:y0, scaleX:s, scaleY:.35, transformOrigin:'50% 100%', opacity:0}, 0).to(sv, {opacity:1, duration:.08}, 0)
      .to(sv, {x:x1, scaleY:1, duration:.36, ease:'power2.in'}, 0)
      .to(sv, {x:x2, scaleY:.25, opacity:0, duration:.42, ease:'power1.out'}, .4);
    tl.to(t, {x:s*12, y:-14, rotation:s*10, duration:.14, ease:'power2.out'}, .3)
      .to(t, {x:s*w*1.1, y:h*.15, rotation:s*38, opacity:0, duration:.4, ease:'power1.in'}, .44);
    spray(tl, mk, .34, x + s*w*.2, y - h*.35, {n:12, colors:['rgba(255,255,255,.95)', 'rgba(190,235,255,.95)'], size:[3, 6], angle:-90 + s*35, arc:80, dist:[26, 64], dur:[.45, .65], gravity:46, w:w*.6});
    spray(tl, mk, .5, x, y, {n:7, colors:['rgba(255,255,255,.05)'], size:[6, 11], angle:-90, arc:40, dist:[30, 60], dur:[.6, .8], w:w*.8, cls:'fxc-bubble', stagger:.03});
    ringAt(tl, mk, .7, x, bot - 4, {from:w*.4, to:w*1.5, color:'rgba(170,225,255,.85)', width:2, squash:.25, dur:.45});
    fadeSlot(tl, el, t, .45); tl.add(()=> snd('splash'), .3);
  });
};
let WAVE_ID = 0;
// B: the water rises over it and it sinks; bubbles break at the surface.
M.deathWater_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const wa = inTile(t, bag, 'fxc-water'); tl.fromTo(wa, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:.55, ease:'sine.inOut'}, 0);
    tl.to(t, {y:22, opacity:0, duration:.4, ease:'power1.in'}, .45);
    spray(tl, mk, .15, x, bot - h*.2, {n:10, colors:['rgba(255,255,255,.05)'], size:[5, 10], angle:-90, arc:30, dist:[30, 70], dur:[.6, .9], w:w*.7, cls:'fxc-bubble', stagger:.05});
    ringAt(tl, mk, .6, x, bot - 4, {from:w*.4, to:w*1.6, color:'rgba(170,225,255,.9)', width:2, squash:.25, dur:.5});
    ringAt(tl, mk, .75, x, bot - 4, {from:w*.3, to:w*1.2, color:'rgba(170,225,255,.7)', width:1.5, squash:.25, dur:.45});
    fadeSlot(tl, el, t, .5); tl.add(()=> snd('splash'), 0).add(()=> snd('bubble'), .4);
  });
};
css('bubble', `.fxc-bubble{border:1.5px solid rgba(220,245,255,.95); background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0 18%, rgba(255,255,255,.08) 22%) !important;}`);

// ---- Crushed (Earthquake, Landslide, Meteor, Comet; Avalanche gets the snow) ----
// A: rocks rain down and flatten it into the ground with a burst of dust.
M.deathCrushed = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top, bot} = D;
  return run(opts, (tl, mk)=>{
    for(let i = 0; i < 6; i++){ const r = mk('fxc-rock'), s = rnd(.3, .46)*w, tx = x + rnd(-.38, .38)*w, t0 = i*.04;
      tl.set(r, {x:tx, y:top - 120 - rnd(0, 60), xPercent:-50, yPercent:-50, width:s, height:s*rnd(.75, .95), rotation:rnd(0, 360), opacity:1}, t0)
        .to(r, {y:bot - h*.12 - rnd(0, h*.2), rotation:'+=' + rnd(90, 200), duration:.26, ease:'power2.in'}, t0)
        .to(r, {y:'-=' + rnd(6, 14), duration:.1, ease:'power1.out'}, t0 + .26).to(r, {y:'+=' + rnd(6, 14), duration:.12, ease:'power1.in'}, t0 + .36)
        .to(r, {opacity:0, duration:.25}, .78); }
    tl.to(t, {scaleY:.14, scaleX:1.14, transformOrigin:'50% 100%', filter:F('brightness(.7) grayscale(.5)'), duration:.12, ease:'power3.in'}, .2)
      .to(t, {opacity:0, duration:.3}, .6);
    puffs(tl, mk, .28, x, bot - 6, {n:7, color:'rgba(170,150,120,.75)', w:w*1.2, rise:-12, drift:40, size:[16, 26], stagger:.02});
    spray(tl, mk, .28, x, bot - 4, {n:10, colors:['#8a8478', '#a39d90', '#6b665c'], size:[3, 6], angle:-90, arc:150, dist:[20, 50], dur:[.4, .6], gravity:40, w:w});
    fadeSlot(tl, el, t, .3); tl.add(()=>{ snd('earthquakeTone'); snd('knockOut'); }, .25);
  });
};
// B: Avalanche. A slab of snow slides down over it and buries it; snow dust and glints.
M.deathCrushed_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, left, top, bot} = D;
  return run(opts, (tl, mk)=>{
    const sn = mk('fxc-snow'), W = w*1.5, H = h*.75;
    tl.set(sn, {x:left - W*.8, y:top - H*1.1, width:W, height:H, rotation:-18, opacity:1}, 0).to(sn, {x:x - W/2, y:bot - H*.75, rotation:0, duration:.3, ease:'power2.in'}, 0)
      .to(sn, {scaleY:.7, transformOrigin:'50% 100%', duration:.08}, .3).to(sn, {scaleY:.8, duration:.2}, .38).to(sn, {opacity:0, duration:.35}, .72);
    tl.to(t, {scaleY:.2, scaleX:1.1, transformOrigin:'50% 100%', duration:.1, ease:'power3.in'}, .26).to(t, {opacity:0, duration:.2}, .5);
    puffs(tl, mk, .3, x, bot - 8, {n:7, color:'rgba(240,248,255,.9)', w:w*1.3, rise:-20, drift:50, size:[18, 30], stagger:.02});
    spray(tl, mk, .32, x, bot - h*.25, {n:8, glyphs:['❄', '✦', '❅'], size:[9, 13], angle:-90, arc:160, dist:[24, 56], dur:[.5, .7], gravity:24});
    fadeSlot(tl, el, t, .3); tl.add(()=>{ snd('earthquakeTone'); snd('iceShatter'); }, .28);
  });
};

// ---- Blown up (Explode, Dynamite) ----
// A: a blast flash and shockwave, and the card flies apart in scorched scraps that still show its art.
M.deathExplode = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, left, top} = D, art = artOf(t);
  return run(opts, (tl, mk)=>{
    flashAt(tl, mk, 0, x, y, w*2.6, w*2.6, 'rgba(255,230,160,.98)', .35);
    ringAt(tl, mk, .02, x, y, {from:w*.3, to:w*2.8, color:'rgba(255,200,120,.9)', glow:'rgba(255,140,40,.6)', width:4, dur:.45});
    const C = 3, R = 4, cw = w/C, rh = h/R;
    for(let r = 0; r < R; r++) for(let c = 0; c < C; c++){
      const s = mk('fxc-scrap'), sx = left + c*cw, sy = top + r*rh, dx = (c - (C - 1)/2)*rnd(40, 70) + rnd(-15, 15), dy = (r - (R - 1)/2)*rnd(20, 40) - rnd(20, 50);
      s.style.width = Math.ceil(cw) + 'px'; s.style.height = Math.ceil(rh) + 'px';
      s.style.background = art.img ? `url("${art.img}") ${(-c*cw).toFixed(1)}px ${(-r*rh).toFixed(1)}px / ${w.toFixed(1)}px ${h.toFixed(1)}px no-repeat, ${art.a}` : `linear-gradient(160deg, ${art.a}, ${art.b}) ${(-c*cw).toFixed(1)}px ${(-r*rh).toFixed(1)}px / ${w.toFixed(1)}px ${h.toFixed(1)}px`;
      s.style.clipPath = `polygon(${rnd(0, 20)}% ${rnd(0, 20)}%, ${rnd(80, 100)}% ${rnd(0, 15)}%, ${rnd(85, 100)}% ${rnd(80, 100)}%, ${rnd(0, 15)}% ${rnd(85, 100)}%)`;
      tl.set(s, {x:sx, y:sy, opacity:1, rotation:0}, .03)
        .to(s, {x:sx + dx, duration:.6, ease:'power2.out'}, .03).to(s, {y:sy + dy, duration:.25, ease:'power2.out'}, .03).to(s, {y:sy + dy + rnd(60, 110), duration:.4, ease:'power2.in'}, .28)
        .to(s, {rotation:rnd(-400, 400), duration:.65, ease:'none'}, .03).to(s, {opacity:0, duration:.2}, .5); }
    tl.set(t, {opacity:0}, .03);
    puffs(tl, mk, .08, x, y, {n:6, color:'rgba(50,44,40,.65)', w:w*.6, h:h*.4, rise:-40, drift:30, size:[24, 36], stagger:.03});
    spray(tl, mk, .04, x, y, {n:10, colors:['#ffb23a', '#ff6a1a', '#ffe08a'], size:[2, 4], dist:[40, 90], dur:[.35, .55], gravity:30});
    fadeSlot(tl, el, t, .05); tl.add(()=>{ snd('boom'); }, 0);
  });
};
// B: cartoon kaboom. A big 💥 pops and the card spins up off the board in a sooty cloud.
M.deathExplode_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  return run(opts, (tl, mk)=>{
    const k = mk('fxc-g fxc-kaboom', '💥'); tl.set(k, {x, y, xPercent:-50, yPercent:-50, scale:0, rotation:-20}, 0).to(k, {scale:1.15, rotation:0, duration:.14, ease:'back.out(3)'}, 0).to(k, {scale:1.5, opacity:0, duration:.3}, .3);
    tl.to(t, {y:-110, rotation:540, scale:.35, filter:F('brightness(.4) sepia(.6)'), duration:.55, ease:'power2.out'}, .05).to(t, {opacity:0, duration:.2}, .45);
    puffs(tl, mk, .06, x, y + h*.2, {n:8, color:'rgba(60,54,50,.7)', w:w, rise:-16, drift:46, size:[22, 34], stagger:.02});
    fadeSlot(tl, el, t, .1); tl.add(()=> snd('boom'), 0);
  });
};

// ---- Shattered while petrified: stone ----
// A: grey cracks spread and the statue breaks into falling stone (ProcFX's Voronoi shatter, heavy), with dust.
M.deathPetrified = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, left, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    tl.set(t, {filter:F('grayscale(1) brightness(.85) contrast(1.15) sepia(.15)')}, 0);
    const sv = svgOver(bag, left, top, w, h, 1246);
    for(let i = 0; i < 6; i++){ const pl = svgNode('polyline', {points:zig(w*rnd(.35, .65), h*rnd(.3, .6), w*rnd(-.1, 1.1), h*rnd(-.1, 1.1), 4, 7), fill:'none', stroke:'#3d3a35', 'stroke-width':1.8}, sv);
      pl.style.strokeDasharray = 300; pl.style.strokeDashoffset = 300; tl.to(pl, {strokeDashoffset:0, duration:.2}, .02 + i*.03); }
    tl.fromTo(t, {x:0}, {x:1.5, duration:.03, yoyo:true, repeat:7, ease:'none'}, 0);
    tl.add(()=>{ sv.style.opacity = 0; if(root.ProcFX && ProcFX.shatter){ try{ ProcFX.shatter(t, {seed:'stone' + Math.random(), power:.45, gravity:2, cols:3, rows:4, extra:5}); }catch(e){ t.style.opacity = 0; } } else t.style.opacity = 0; }, .3);
    puffs(tl, mk, .4, x, bot - 6, {n:5, color:'rgba(170,164,150,.7)', w:w, rise:-14, drift:30, size:[16, 24]});
    spray(tl, mk, .45, x, bot - 4, {n:6, glyphs:['🪨'], size:[9, 13], angle:-90, arc:140, dist:[14, 34], dur:[.4, .55], gravity:26});
    tl.to({}, {duration:.6}, .3); fadeSlot(tl, el, t, .3); tl.add(()=>{ snd('knockOut'); snd('earthquakeTone'); }, .3);
  });
};
// B: the statue topples forward and breaks into rubble on the floor.
M.deathPetrified_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk)=>{
    tl.set(t, {filter:F('grayscale(1) brightness(.85) contrast(1.15) sepia(.15)')}, 0)
      .to(t, {rotationX:80, transformPerspective:520, transformOrigin:'50% 100%', duration:.42, ease:'expo.in'}, 0).set(t, {opacity:0}, .43);
    for(let i = 0; i < 9; i++){ const r = mk('fxc-rock'), s = rnd(.14, .26)*w; r.style.filter = 'grayscale(.4)';
      tl.set(r, {x:x + rnd(-.4, .4)*w, y:bot - 8, xPercent:-50, yPercent:-50, width:s, height:s*.8, rotation:rnd(0, 360), opacity:1}, .43)
        .to(r, {x:'+=' + rnd(-50, 50), duration:.5, ease:'power2.out'}, .43).to(r, {y:'-=' + rnd(10, 26), duration:.16, ease:'power2.out'}, .43).to(r, {y:'+=' + rnd(10, 26), duration:.2, ease:'bounce.out'}, .59)
        .to(r, {rotation:'+=' + rnd(-180, 180), duration:.5}, .43).to(r, {opacity:0, duration:.25}, .9); }
    puffs(tl, mk, .43, x, bot - 6, {n:6, color:'rgba(170,164,150,.7)', w:w*1.2, rise:-14, drift:44, size:[16, 26], stagger:.02});
    fadeSlot(tl, el, t, .3); tl.add(()=>{ snd('knockOut'); snd('earthquakeTone'); }, .43);
  });
};

// ---- Killed on cursed ground (Desecrate) ----
// A: a black sigil opens under it and swallows it; purple-black smoke curls up.
M.deathCurse = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk)=>{
    floorSigil(tl, mk, 0, x, bot - h*.06, 'fxc-sigil-dark', {w:w*1.35, squash:.34, grow:.15, spin:90, dur:.95, close:true});
    tl.to(t, {filter:F('brightness(.55) saturate(.6) hue-rotate(-20deg)'), duration:.2}, .1)
      .fromTo(t, {y:0, clipPath:'inset(0% 0% 0% 0%)'}, {y:h*.95, clipPath:`inset(0% 0% 95% 0%)`, duration:.5, ease:'power2.in'}, .2);
    puffs(tl, mk, .15, x, bot - h*.1, {n:6, color:'rgba(60,20,70,.65)', w:w*.9, rise:-42, size:[16, 24], stagger:.05});
    spray(tl, mk, .2, x, bot - h*.06, {n:6, colors:['#e64a7a', '#a0206a'], size:[2, 4], angle:-90, arc:60, dist:[20, 50], dur:[.5, .7], w:w*.9});
    tl.set(t, {opacity:0}, .72); fadeSlot(tl, el, t, .4); tl.add(()=> snd('curse'), 0).add(()=> snd('devilryTone'), .2);
  });
};
// B: shadow hands rise from the ground, take hold and drag it under.
M.deathCurse_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, left, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const sv = svgOver(bag, left - w*.3, top, w*1.6, h + 20, 1246);
    for(let i = 0; i < 4; i++){ const bx = w*(.15 + i*.43), d = `M${bx} ${h + 20} C ${bx + rnd(-30, 30)} ${h*.7}, ${bx + rnd(-30, 30)} ${h*.45}, ${w*.8 + rnd(-w*.3, w*.3)} ${h*rnd(.25, .55)}`;
      const p = svgNode('path', {d, fill:'none', stroke:i%2 ? 'rgba(70,20,90,.95)' : 'rgba(30,8,40,.95)', 'stroke-width':rnd(3.5, 5), 'stroke-linecap':'round', style:'filter:drop-shadow(0 0 3px rgba(190,60,220,.85))'}, sv);
      p.style.strokeDasharray = 400; p.style.strokeDashoffset = 400; tl.to(p, {strokeDashoffset:0, duration:.3, ease:'power2.out'}, i*.05); }
    tl.to(t, {filter:F('brightness(.45) saturate(.5)'), duration:.25}, .15).to(t, {y:h*.6, scaleY:.85, transformOrigin:'50% 100%', opacity:0, duration:.4, ease:'power3.in'}, .4)
      .to(sv, {y:'+=' + h*.6, opacity:0, duration:.4, ease:'power3.in'}, .42);
    puffs(tl, mk, .4, x, bot - 6, {n:5, color:'rgba(40,10,50,.65)', w:w, rise:-20, size:[18, 26]});
    fadeSlot(tl, el, t, .4); tl.add(()=> snd('curse'), 0);
  });
};

// ---- True / ichor damage: golden ichor ----
// A: golden ichor runs down the face, the colour drains out to a pale ghost of it, and it fades upward.
M.deathTrue = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    // the ichor runs over the face (outside it, so the draining colour doesn't grey it): thin gold runs with a bead at the tip
    [.16, .38, .6, .82].forEach((f, i)=>{ const d = mk('fxc-ichor'), len = h*rnd(.45, .85), t0 = .04 + i*.06;
      tl.set(d, {x:D.left + w*f + rnd(-4, 4), y:D.top + 2, width:Math.max(3, w*.05), height:0, opacity:1}, t0).to(d, {height:len, duration:.45, ease:'power1.in'}, t0).to(d, {opacity:0, duration:.25}, .7); });
    tl.to(t, {filter:F('saturate(0) brightness(1.55) contrast(.8)'), duration:.45}, .15).to(t, {opacity:0, y:-8, duration:.35, ease:'power1.in'}, .5);
    spray(tl, mk, .35, x, bot - 2, {n:5, colors:['#ffd34a', '#e8b021'], size:[4, 6], angle:90, arc:10, dist:[24, 40], dur:[.35, .5], w:w*.7, ease:'power2.in', stagger:.05});
    fadeSlot(tl, el, t, .5); tl.add(()=>{ snd('drip'); snd('pitchChime'); }, .05);
  });
};
// B: gilded to dust. It turns to gold, a shine sweeps across, then it blows away as gold dust from one side.
M.deathTrue_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, left} = D;
  return run(opts, (tl, mk, bag)=>{
    tl.to(t, {filter:F('sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.1)'), duration:.2}, 0);
    const sh = inTile(t, bag, ''); sh.style.background = 'linear-gradient(110deg, transparent 35%, rgba(255,255,230,.9) 50%, transparent 65%)';
    sh.style.backgroundSize = '300% 100%'; tl.fromTo(sh, {backgroundPosition:'100% 0%'}, {backgroundPosition:'0% 0%', duration:.3, ease:'power1.inOut'}, .12);
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 100%)', duration:.45, ease:'power1.in'}, .4);
    for(let k = 0; k < 5; k++) spray(tl, mk, .4 + k*.08, left + w*(k + .5)/5, y, {n:5, colors:['#ffd34a', '#fff1a8', '#e8b021'], size:[2, 4], angle:-20, arc:50, dist:[30, 70], dur:[.5, .7], h:h, w:w*.15});
    tl.set(t, {opacity:0}, .86); fadeSlot(tl, el, t, .45); tl.add(()=> snd('pitchChime'), 0);
  });
};

// ---- Acid (ant acid: yellow-green melt with fizz). Was the poison drip (kept as the lab's variant B). ----
M.deathAcid = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const g = inTile(t, bag, ''); g.style.background = 'linear-gradient(180deg, rgba(216,240,74,.75), rgba(150,190,30,.6))'; g.style.mixBlendMode = 'multiply';
    tl.fromTo(g, {opacity:0}, {opacity:1, duration:.18}, 0);
    tl.to(t, {keyframes:[{scaleY:.9, skewX:3}, {scaleY:.6, skewX:-4}, {scaleY:.22, skewX:2}], transformOrigin:'50% 100%', filter:F('hue-rotate(40deg) saturate(1.5) brightness(.9)'), duration:.6, ease:'power1.in'}, .1)
      .to(t, {opacity:0, duration:.2}, .66);
    for(let k = 0; k < 6; k++) spray(tl, mk, .1 + k*.09, x, top + h*(.08 + k*.13), {n:3, colors:['#d8f04a', '#f2ffb0', '#9cc21e'], size:[3, 7], angle:-90, arc:70, dist:[14, 34], dur:[.3, .45], w:w*.85, scale1:1.6});
    const pd = mk('fxc-p'); pd.style.background = 'radial-gradient(ellipse at center, rgba(200,230,60,.85), rgba(150,190,30,.4) 60%, rgba(150,190,30,0) 72%)';
    tl.set(pd, {x, y:bot - 4, xPercent:-50, yPercent:-50, width:w*.3, height:10, opacity:0}, .25).to(pd, {width:w*1.3, height:18, opacity:1, duration:.4}, .25).to(pd, {opacity:0, duration:.3}, .7);
    fadeSlot(tl, el, t, .4); tl.add(()=>{ snd('corrodeTone'); snd('bubble'); }, .05);
  });
};
// ---- Decay (Morel Hollow mould): grey-violet fuzz blooms, it crumbles, little mushrooms pop up where it stood ----
M.deathDecay = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  return run(opts, (tl, mk, bag)=>{
    const ov = inTile(t, bag, ''); ov.innerHTML = Array.from({length:7}, ()=> `<i style="position:absolute; left:${rnd(5, 85)}%; top:${rnd(5, 85)}%; width:${rnd(18, 34)}%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle, rgba(200,190,220,.95) 0, rgba(140,120,170,.7) 45%, rgba(140,120,170,0) 70%); transform:scale(0)"></i>`).join('');
    tl.to(ov.children, {scale:1, duration:.35, stagger:.04, ease:'back.out(2)'}, 0);
    tl.to(t, {filter:F('grayscale(.8) brightness(.7) sepia(.3) hue-rotate(220deg)'), duration:.35}, .05);
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(100% 0% 0% 0%)', duration:.42, ease:'power1.in'}, .4);
    for(let k = 0; k < 5; k++) spray(tl, mk, .4 + k*.08, x, D.top + h*(k/5), {n:4, colors:['#a996c4', '#7e6a96', '#5d4f73'], size:[3, 5], angle:100, arc:90, dist:[14, 34], dur:[.45, .6], w:w, gravity:22});
    for(let i = 0; i < 3; i++){ const m = mk('fxc-g', '🍄'), mx = x + (i - 1)*w*.3; m.style.fontSize = (14 + i%2*4) + 'px';
      tl.set(m, {x:mx, y:bot - 4, xPercent:-50, yPercent:-100, scale:0, transformOrigin:'50% 100%'}, .55 + i*.06).to(m, {scale:1, duration:.25, ease:'back.out(3)'}, .55 + i*.06).to(m, {opacity:0, duration:.3}, 1.05); }
    tl.set(t, {opacity:0}, .83); fadeSlot(tl, el, t, .4); tl.add(()=>{ snd('puff'); snd('bloomTone'); }, .55);
  });
};
// ---- Sacrificed for a Dark Summon (Ashen Choir): a red sigil flares, the card burns to ash from the feet up, embers rise ----
M.deathSacrificed = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top, bot} = D;
  return run(opts, (tl, mk)=>{
    floorSigil(tl, mk, 0, x, bot - h*.05, 'fxc-sigil-red', {w:w*1.4, squash:.34, grow:.2, spin:-160, dur:.95});
    tl.to(t, {filter:F('brightness(1.3) sepia(.6) saturate(2) hue-rotate(-20deg)'), duration:.15}, .05).to(t, {filter:F('brightness(.5) grayscale(.8)'), duration:.3}, .2);
    tl.fromTo(t, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 100% 0%)', duration:.5, ease:'power1.in'}, .25);
    for(let k = 0; k < 5; k++) spray(tl, mk, .25 + k*.09, x, bot - h*(k/5), {n:5, colors:['#9a8f88', '#c9c0b8', '#ff6a3a'], size:[2, 5], angle:-90, arc:60, dist:[24, 60], dur:[.5, .75], w:w, spin:160});
    fadeSlot(tl, el, t, .3); tl.set(t, {opacity:0}, .76); tl.add(()=>{ snd('devilryTone'); snd('burnAway'); }, 0);
  });
};
// ---- Exiled / nullified (2026-10-15): a Nullify kill, a second death after Revive, or an On Death "exile itself". It doesn't go to
// the graveyard but to the Removal Zone, so it doesn't fall: it is unmade. ----
// A: the colour drains to flat grey, static flickers, and it folds shut like an old screen switching off (to a line, then a point).
const exileCss = ()=> css('exile', `.fxc-static{background:repeating-linear-gradient(0deg, rgba(255,255,255,.18) 0 1px, transparent 1px 3px); mix-blend-mode:screen;}
  .fxc-rift{border-radius:50%; background:radial-gradient(ellipse at center, #06040c 0 45%, #2a1a48 62%, rgba(150,120,220,.85) 72%, rgba(150,120,220,0) 80%); box-shadow:0 0 14px rgba(170,140,255,.8);}`);
M.deathExile = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  exileCss();
  return run(opts, (tl, mk, bag)=>{
    tl.to(t, {filter:F('grayscale(1) contrast(.7) brightness(1.15)'), duration:.22}, 0);
    const st = inTile(t, bag, 'fxc-static'); tl.fromTo(st, {opacity:0, backgroundPositionY:'0px'}, {opacity:1, backgroundPositionY:'12px', duration:.3, ease:'steps(6)'}, .05);
    tl.fromTo(t, {x:0}, {x:2, duration:.03, yoyo:true, repeat:5, ease:'none'}, .08);
    tl.to(t, {scaleY:.03, scaleX:1.08, duration:.16, ease:'power3.in'}, .34).to(t, {scaleX:0, duration:.12, ease:'power2.in'}, .5).set(t, {opacity:0}, .62);
    const dot = mk('fxc-p'); dot.style.background = '#fff'; dot.style.boxShadow = '0 0 10px 4px rgba(220,230,255,.9)';
    tl.set(dot, {x, y, xPercent:-50, yPercent:-50, width:6, height:6, opacity:0}, .58).to(dot, {opacity:1, duration:.03}, .58).to(dot, {scale:.2, opacity:0, duration:.3, ease:'power2.in'}, .64);
    puffs(tl, mk, .55, x, y, {n:4, color:'rgba(200,205,215,.55)', w:w*.6, rise:-26, drift:24, size:[16, 24]});
    chip(tl, mk, .4, t, '🌫 Exiled', '#4b4f5c', {y:D.top + h*.1});
    fadeSlot(tl, el, t, .35); tl.add(()=>{ snd('exile'); }, .05);
  });
};
// B: a rift to the Removal Zone tears open over it and pulls it in, then seals with a pale flash.
M.deathExile_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  exileCss();
  return run(opts, (tl, mk)=>{
    const r = mk('fxc-rift'); tl.set(r, {x, y, xPercent:-50, yPercent:-50, width:6, height:h*1.15, opacity:0}, 0).to(r, {opacity:1, width:w*.55, duration:.2, ease:'back.out(2)'}, 0)
      .to(r, {width:w*.7, duration:.3, ease:'sine.inOut'}, .2).to(r, {width:2, opacity:0, duration:.14, ease:'power3.in'}, .62);
    tl.to(t, {filter:F('grayscale(.8) brightness(.8) hue-rotate(220deg)'), duration:.2}, .05)
      .to(t, {scaleX:.08, scaleY:.7, skewY:6, opacity:.2, duration:.32, ease:'power3.in'}, .26).set(t, {opacity:0}, .6);
    spray(tl, mk, .2, x, y, {n:10, colors:['#cfc4ff', '#8a7ad0', '#ffffff'], size:[2, 4], dist:[w*.5, w*.8], dur:[.35, .45], ease:'power2.in', scale0:1, scale1:.2, stagger:.02, angle:0, arc:360});
    flashAt(tl, mk, .62, x, y, w*1.4, h*1.2, 'rgba(230,225,255,.9)', .3);
    chip(tl, mk, .5, t, '🌫 Exiled', '#4b4f5c', {y:D.top + h*.1});
    fadeSlot(tl, el, t, .3); tl.add(()=> snd('exile'), 0).add(()=> snd('reflectTone'), .6);
  });
};
// ---- The King falls (2026-10-15, B for death-leader): the whole death, not an add-on. A gold flash, it sinks to its knees, the crown
// lifts off and cracks in two, the royal banner behind it is lowered, and it fades to grey. About 1.2 s. ----
M.kingFall = function(el, opts){
  opts = opts || {}; const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, top, bot} = D, foe = isFoeEl(el);
  css('kingFall', `.fxc-pennant{background:linear-gradient(180deg, var(--k1), var(--k2)); border:2px solid #e8c25a; border-top-width:4px; box-sizing:border-box;
    clip-path:polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%); box-shadow:0 3px 8px rgba(0,0,0,.35);}
    .fxc-pennant::after{content:'👑'; position:absolute; left:50%; top:22%; transform:translateX(-50%); font-size:13px; filter:grayscale(.2);}`);
  return run(opts, (tl, mk, bag)=>{
    const t0 = D.t, t = ghost(t0, bag); t0.style.visibility = 'hidden'; // 2026-10-15: a fixed copy outlives the slot
    const P = mk('fxc-pennant'), pw = w*.46, ph = h*.7; P.style.setProperty('--k1', foe ? '#b22a2a' : '#2a62b2'); P.style.setProperty('--k2', foe ? '#6e1414' : '#163a6e');
    tl.set(P, {x:x - pw/2, y:top - ph*.55, width:pw, height:ph, transformOrigin:'50% 0%', scaleY:0, opacity:1, zIndex:1199}, 0).to(P, {scaleY:1, duration:.2, ease:'back.out(1.6)'}, 0)
      .to(P, {scaleY:.15, y:'+=' + ph*.3, rotation:foe ? 6 : -6, opacity:0, duration:.55, ease:'power2.in'}, .55);
    flashAt(tl, mk, .02, x, y, w*2.4, w*2.4, 'rgba(255,225,140,.9)', .45);
    ringAt(tl, mk, .05, x, y, {from:w*.5, to:w*2.2, color:'#ffd34a', glow:'rgba(255,200,60,.7)', width:3, dur:.6});
    tl.to(t, {filter:F('brightness(1.25) sepia(.3) drop-shadow(0 0 8px #ffcf5a)'), duration:.12}, 0)
      .to(t, {scaleY:.86, rotationX:24, transformPerspective:520, transformOrigin:'50% 100%', y:6, duration:.32, ease:'power2.in'}, .25)
      .to(t, {filter:F('grayscale(.85) brightness(.75)'), duration:.4}, .35)
      .to(t, {rotationX:80, y:12, opacity:0, duration:.42, ease:'expo.in'}, .7);
    // the crown: lifts, hangs, cracks into two halves that fall away, gold glints
    const cs = Math.round(Math.max(22, w*.38));
    [-1, 1].forEach(k=>{ const c = mk('fxc-g', '👑'); c.style.fontSize = cs + 'px'; c.style.clipPath = k < 0 ? 'polygon(0 0, 52% 0, 44% 40%, 54% 70%, 46% 100%, 0 100%)' : 'polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 54% 70%, 44% 40%)';
      c.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.5))';
      tl.set(c, {x, y:top + 4, xPercent:-50, yPercent:-50, opacity:1, rotation:0}, 0).to(c, {y:top - cs*.9, duration:.32, ease:'power2.out'}, .05)
        .to(c, {x:'+=' + k*3, rotation:k*8, duration:.06}, .42)
        .to(c, {x:'+=' + k*rnd(22, 34), y:bot - 6, rotation:k*rnd(90, 140), duration:.5, ease:'power2.in'}, .5).to(c, {opacity:0, duration:.25}, 1.0); });
    spray(tl, mk, .42, x, top - cs*.9, {n:10, colors:['#ffd34a', '#fff1a8', '#e8b021'], size:[2, 5], dist:[16, 44], dur:[.4, .6], gravity:30});
    chip(tl, mk, .55, t, '👑 The ' + (opts.title || 'King') + ' falls', foe ? '#8e1420' : '#1f4f8e', {y:top - 6, hold:.75});
    fadeSlot(tl, el, t0, .3); tl.add(()=>{ snd('drum'); snd('horn'); }, 0).add(()=> snd('clang'), .42).add(()=> snd('knockOut'), 1.0);
  });
};
// ---- Egg destroyed before it hatched: the shell cracks along a zigzag, the halves fall apart, a sad little puff ----
M.deathEgg = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, left, top} = D;
  return run(opts, (tl, mk, bag)=>{
    const seamY = []; for(let k = 0; k <= 6; k++) seamY.push([k/6*w, h*(.48 + (k%2 ? -.06 : .06))]);
    const sv = svgOver(bag, left, top, w, h, 1246); const pl = svgNode('polyline', {points:seamY.map(p=> p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill:'none', stroke:'#3a2a1a', 'stroke-width':2.2}, sv);
    pl.style.strokeDasharray = 400; pl.style.strokeDashoffset = 400; tl.to(pl, {strokeDashoffset:0, duration:.2, ease:'power1.in'}, .1);
    tl.fromTo(t, {rotation:0}, {keyframes:[{rotation:-5}, {rotation:5}, {rotation:-3}, {rotation:0}], duration:.3, ease:'sine.inOut'}, 0);
    const poly = up=> 'polygon(' + (up ? ['0 0', w + 'px 0'] : ['0 ' + h + 'px', w + 'px ' + h + 'px']).concat((up ? seamY.slice().reverse() : seamY.slice().reverse()).map(p=> `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`)).join(',') + ')';
    tl.add(()=>{ sv.style.opacity = 0; [true, false].forEach(up=>{ const g = ghost(t, bag, {clipPath:poly(up)});
      gsap.to(g, {x:'+=' + (up ? -1 : 1)*rnd(16, 24), y:'+=' + (up ? -8 : 18), rotation:(up ? -1 : 1)*rnd(14, 22), duration:.25, ease:'power2.out'});
      gsap.to(g, {y:'+=40', opacity:0, duration:.35, delay:.22, ease:'power2.in'}); }); t.style.visibility = 'hidden'; }, .32);
    puffs(tl, mk, .38, x, top + h*.5, {n:3, color:'rgba(200,200,200,.7)', w:w*.3, rise:-30, size:[16, 22]});
    spray(tl, mk, .4, x, top + h*.4, {n:1, glyphs:['💨'], size:[16, 16], angle:-90, arc:0, dist:[30, 30], dur:[.6, .6]});
    tl.to({}, {duration:.6}, .32); fadeSlot(tl, el, t, .35); tl.add(()=> snd('pixelShatter'), .32);
  });
};
// ---- Structure destroyed: beaver timber and ant mounds collapse in planks and dust ----
// A: shakes, slumps in two stages, planks tumble off both sides.
M.deathStructure = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top, bot} = D;
  return run(opts, (tl, mk)=>{
    tl.fromTo(t, {x:0}, {x:2.5, duration:.04, yoyo:true, repeat:5, ease:'none'}, 0)
      .to(t, {scaleY:.68, transformOrigin:'50% 100%', duration:.12, ease:'power3.in'}, .24).to(t, {scaleY:.3, scaleX:1.08, duration:.14, ease:'power3.in'}, .42).to(t, {opacity:0, duration:.25}, .6);
    for(let i = 0; i < 6; i++){ const p = mk('fxc-p'), s = i%2 ? 1 : -1; p.style.borderRadius = '2px'; p.style.background = 'linear-gradient(180deg, #b07a46, #7a5030)'; p.style.boxShadow = 'inset 0 -2px 0 rgba(0,0,0,.25)';
      const t0 = .26 + i*.04; tl.set(p, {x:x + rnd(-.3, .3)*w, y:top + h*rnd(.2, .5), xPercent:-50, yPercent:-50, width:w*rnd(.35, .5), height:7, rotation:rnd(-20, 20), opacity:1}, t0)
        .to(p, {x:'+=' + s*rnd(30, 60), rotation:'+=' + s*rnd(90, 200), duration:.5, ease:'power1.out'}, t0).to(p, {y:bot + rnd(-4, 8), duration:.5, ease:'bounce.out'}, t0).to(p, {opacity:0, duration:.2}, .95); }
    puffs(tl, mk, .3, x, bot - 6, {n:7, color:'rgba(170,140,100,.72)', w:w*1.2, rise:-16, drift:44, size:[16, 28], stagger:.03});
    fadeSlot(tl, el, t, .5); tl.add(()=>{ snd('woodKnock'); snd('knockOut'); }, .24);
  });
};
// B: the tower tips over sideways and breaks where it lands.
M.deathStructure_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, bot} = D, s = Math.random() < .5 ? 1 : -1;
  return run(opts, (tl, mk)=>{
    tl.to(t, {rotation:s*84, transformOrigin:s > 0 ? '100% 100%' : '0% 100%', duration:.45, ease:'power3.in'}, 0).to(t, {opacity:0, duration:.2}, .5);
    puffs(tl, mk, .44, x + s*w*.7, bot - 6, {n:7, color:'rgba(170,140,100,.72)', w:w*1.4, rise:-14, drift:40, size:[16, 26], stagger:.02});
    spray(tl, mk, .44, x + s*w*.7, bot - 6, {n:8, colors:['#b07a46', '#7a5030', '#d2a070'], size:[4, 8], angle:-90, arc:140, dist:[16, 40], dur:[.4, .6], gravity:30, shard:true, spin:200});
    fadeSlot(tl, el, t, .4); tl.add(()=> snd('woodKnock'), .44);
  });
};
// ---- Add-ons that ride on top of whatever death plays ----
// Leader / King: the crown pops off, tips and rolls away; the banner above tears in two. (The card still falls its own way.)
M.leaderFall = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {x, w, h, top, bot} = D, s = Math.random() < .5 ? 1 : -1;
  css('leaderFall', `.fxc-banner{width:46px; height:18px; background:linear-gradient(180deg, #c8323a, #8e1420); border:1.5px solid #e8c25a; box-sizing:border-box; border-radius:2px 2px 0 0;}`);
  return run(opts, (tl, mk)=>{
    const cr = mk('fxc-g', '👑'); cr.style.fontSize = '26px'; cr.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.45))';
    tl.set(cr, {x, y:top - 6, xPercent:-50, yPercent:-50, rotation:0, opacity:1}, 0).to(cr, {y:top - 30, rotation:s*25, duration:.22, ease:'power2.out'}, 0)
      .to(cr, {x:x + s*w*.8, y:bot - 10, rotation:s*200, duration:.42, ease:'power2.in'}, .22).to(cr, {x:x + s*w*1.25, rotation:s*400, duration:.4, ease:'power1.out'}, .64)
      .to(cr, {y:bot - 18, duration:.1, yoyo:true, repeat:1, ease:'power1.out'}, .64).to(cr, {opacity:0, duration:.25}, .95);
    [-1, 1].forEach(k=>{ const b = mk('fxc-banner'); b.style.clipPath = k < 0 ? 'polygon(0 0, 55% 0, 45% 40%, 52% 70%, 42% 100%, 0 100%)' : 'polygon(55% 0, 100% 0, 100% 100%, 42% 100%, 52% 70%, 45% 40%)';
      tl.set(b, {x:x - 23, y:top - 34 - h*.06, opacity:1}, 0).to(b, {x:'+=' + k*10, y:'+=' + rnd(30, 50), rotation:k*rnd(25, 45), opacity:0, duration:.6, ease:'power2.in'}, .18); });
    spray(tl, mk, .2, x, top, {n:8, colors:['#ffd34a', '#fff1a8'], size:[2, 4], dist:[20, 46], dur:[.4, .6]});
    tl.add(()=>{ snd('drum'); snd('leaderFanfare'); }, .05);
  });
};
// The Prism death's sheen (was the shiny / foil death until 2026-10-17; now M.deathPrism, see PRISM_SKILLS below): one rainbow sheet
// lifts off the card and flutters away in sparkles.
M.foilPeel = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {x, y, w, h, left, top} = D;
  return run(opts, (tl, mk)=>{
    // 2026-10-15 (review): the sheet lifts off the face, tips back and flutters up and away, shrinking
    const f = mk('fxc-foil'); placeAt(f, left, top); tl.set(f, {width:w, height:h, opacity:0, transformOrigin:'50% 100%', rotation:0, transformPerspective:500}, 0)
      .to(f, {opacity:.95, duration:.08}, 0).to(f, {y:-8, rotationX:-28, duration:.22, ease:'power2.out'}, .05)
      .to(f, {x:w*.35, y:-h*.75, rotation:18, rotationX:-65, scale:.4, opacity:0, duration:.5, ease:'power1.in'}, .27);
    spray(tl, mk, .1, x - w*.2, y - h*.2, {n:10, glyphs:['✦', '✧', '·'], size:[9, 15], dist:[20, 60], dur:[.45, .7], stagger:.02});
    tl.add(()=> snd('rareRise', false), 0);
  });
};
// Prism death (2026-10-17, user: "...this effect is nice for like - prism related deaths (skills relating to light or rainbows. add that
// btw - and save this effect)"): the rainbow sheet above, no longer played for shiny / foil units, now rides on the death of a unit with
// a light or rainbow skill. Illuminate (and its old name Lantern) and Reflect are the ones cards have today; the rest are reserved names,
// so a future Prism / Rainbow / Radiant / Dazzle / Refract skill gets it with no change here.
const PRISM_SKILLS = ['illuminate', 'lantern', 'reflect', 'prism', 'rainbow', 'radiant', 'dazzle', 'refract'];
M.PRISM_SKILLS = PRISM_SKILLS;
function isPrismDef(d){ const e = (d && d.effects) || {}; return PRISM_SKILLS.some(k=> !!e[k]); }
M.isPrismDef = isPrismDef;
M.deathPrism = function(el, opts){ return M.foilPeel(el, opts); };
// Killing blow: the final number is slammed onto the card with a ✖ (A); a "KO!" burst (B); a red ✖ alone (C).
M.lethalStamp = function(el, opts){
  opts = opts || {}; const D = dying(el); if(!D) return Promise.resolve(); const {x, y, h} = D;
  return run(opts, (tl, mk)=>{
    const k = mk('fxc-ko', (opts.dmg ? '−' + opts.dmg + ' ' : '') + '✖'); tl.set(k, {x, y:y - h*.12, xPercent:-50, yPercent:-50, scale:2.6, rotation:-14, opacity:0}, 0)
      .to(k, {scale:1, opacity:1, duration:.14, ease:'power4.in'}, 0).to(k, {x:'+=3', duration:.03, yoyo:true, repeat:3}, .14).to(k, {scale:1.1, opacity:0, y:'-=14', duration:.3, ease:'power1.in'}, .55);
    tl.add(()=> snd('critTone'), .12);
  });
};
M.lethalStamp_B = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {x, y, w} = D;
  return run(opts, (tl, mk)=>{
    const k = mk('fxc-ko', 'KO!'); k.style.color = '#ffe14d'; tl.set(k, {x, y, xPercent:-50, yPercent:-50, scale:0, rotation:8}, 0).to(k, {scale:1.25, duration:.14, ease:'back.out(3)'}, 0).to(k, {scale:1.5, opacity:0, duration:.3}, .45);
    spray(tl, mk, .02, x, y, {n:8, glyphs:['✦'], size:[10, 14], dist:[w*.4, w*.7], dur:[.3, .45]});
    tl.add(()=> snd('critTone'), 0);
  });
};
M.lethalStamp_C = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {x, y} = D;
  return run(opts, (tl, mk)=>{
    const k = mk('fxc-ko', '✖'); k.style.fontSize = '44px'; k.style.color = '#ff3b3b';
    tl.set(k, {x, y, xPercent:-50, yPercent:-50, scale:3, opacity:0}, 0).to(k, {scale:1, opacity:.95, duration:.12, ease:'power4.in'}, 0).to(k, {opacity:0, duration:.3}, .5);
  });
};
// ---- The boss falls (a big moment, about 2.2 s): a white freeze-frame, the card shudders in slow motion, gold shockwaves,
// the field shakes, the card bursts into shards and a "Defeated" title slams down over the field. ----
M.bossDeath = function(el, opts){
  opts = opts || {}; const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h} = D;
  const host = opts.host || document.getElementById('battlefieldEl') || null;
  return run(opts, (tl, mk, bag)=>{
    const t0 = D.t, t = ghost(t0, bag); t0.style.visibility = 'hidden'; // 2026-10-15: a fixed copy, so the slot can go while it plays
    flashAt(tl, mk, 0, x, y, w*5, w*5, 'rgba(255,255,255,.95)', .5);
    tl.fromTo(t, {filter:F('brightness(1)')}, {filter:F('brightness(2.2) saturate(.3)'), duration:.06}, 0).to(t, {filter:F('brightness(1.3) saturate(1.4) drop-shadow(0 0 12px #ffcf5a)'), duration:.3}, .06);
    tl.fromTo(t, {x:0, rotation:0}, {keyframes:[{x:-4, rotation:-1.5}, {x:4, rotation:1.5}, {x:-3, rotation:-1}, {x:3, rotation:1}, {x:-2}, {x:2}, {x:0, rotation:0}], duration:.8, ease:'none'}, .05);
    ringAt(tl, mk, .1, x, y, {from:w*.4, to:w*4, color:'#ffd34a', glow:'rgba(255,190,60,.8)', width:5, dur:.8});
    ringAt(tl, mk, .35, x, y, {from:w*.4, to:w*3.2, color:'#fff1c0', width:3, dur:.7});
    if(host) tl.fromTo(host, {x:0, y:0}, {keyframes:[{x:-8, y:4}, {x:7, y:-3}, {x:-5, y:2}, {x:4, y:-2}, {x:-2, y:1}, {x:0, y:0}], duration:.6, ease:'none', clearProps:'transform'}, .85);
    tl.add(()=>{ if(root.ProcFX && ProcFX.shatter){ try{ ProcFX.shatter(t, {seed:'boss' + Math.random(), power:1.3, gravity:.9}); }catch(e){ t.style.opacity = 0; } } else gsap.to(t, {opacity:0, scale:1.2, duration:.3}); }, .85);
    spray(tl, mk, .85, x, y, {n:20, colors:['#ffd34a', '#fff1a8', '#ff9a3a', '#ffffff'], size:[3, 6], dist:[60, 140], dur:[.6, .9], gravity:40});
    const bf = host ? host.getBoundingClientRect() : {left:0, top:0, width:innerWidth, height:innerHeight};
    const title = mk('fxc-title', `<span class="fxc-t1">${opts.kicker || 'Boss'}</span><span class="fxc-t2">${opts.name ? String(opts.name).replace(/[<>&]/g, '') + ' · ' : ''}Defeated!</span>`);
    const vw = document.documentElement.clientWidth || innerWidth, vh = document.documentElement.clientHeight || innerHeight, tw = title.offsetWidth || 260;
    const tx = Math.max(tw/2 + 6, Math.min(vw - tw/2 - 6, (Math.max(0, bf.left) + Math.min(vw, bf.left + bf.width))/2)), ty = Math.max(40, Math.min(vh - 40, (Math.max(0, bf.top) + Math.min(vh, bf.top + bf.height))*.46));
    tl.set(title, {x:tx, y:ty, xPercent:-50, yPercent:-50, scale:2.4, opacity:0}, 1.0)
      .to(title, {scale:1, opacity:1, duration:.2, ease:'power4.in'}, 1.0).to(title, {scale:1.04, duration:.08, yoyo:true, repeat:1}, 1.2)
      .to(title, {opacity:0, y:'-=20', duration:.35, ease:'power1.in'}, 2.0);
    fadeSlot(tl, el, t0, .2);
    tl.add(()=>{ snd('bossRumble'); }, 0).add(()=>{ snd('boom'); snd('castleCollapse'); }, .85).add(()=> snd('leaderFanfare'), 1.0);
  });
};

// ---- Planned (lab only, 2026-10-15): looks for later themes, ready for when the units exist ----
// Ghost (Map 50+): it turns translucent and drifts up as a wisp.
M.deathGhost = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, top} = D;
  return run(opts, (tl, mk)=>{
    tl.to(t, {opacity:.45, filter:F('grayscale(.6) brightness(1.4) blur(.5px)'), duration:.25}, 0).to(t, {y:-40, scaleX:.7, scaleY:1.15, opacity:0, filter:F('grayscale(1) brightness(1.8) blur(4px)'), duration:.6, ease:'sine.in'}, .25);
    puffs(tl, mk, .2, x, top + h*.4, {n:5, color:'rgba(220,235,255,.6)', w:w*.5, rise:-70, drift:10, size:[16, 26], stagger:.06});
    const g = mk('fxc-g', '👻'); g.style.fontSize = '22px'; tl.set(g, {x, y:top + h*.3, xPercent:-50, yPercent:-50, opacity:0}, .3).to(g, {opacity:.9, y:top - 40, x:'+=8', duration:.6, ease:'sine.out'}, .3).to(g, {opacity:0, duration:.3}, .8);
    fadeSlot(tl, el, t, .3); tl.add(()=> snd('nightSwell'), 0);
  });
};
// Dragon falls (Map 50): the field shakes as it crashes, scales scatter and a Dragon Scale drops.
M.deathDragon = function(el, opts){
  opts = opts || {}; const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w, h, bot} = D, host = opts.host || document.getElementById('battlefieldEl');
  return run(opts, (tl, mk)=>{
    tl.to(t, {rotation:-8, y:-10, duration:.25, ease:'power1.out'}, 0).to(t, {rotation:12, y:h*.2, scaleY:.85, transformOrigin:'50% 100%', filter:F('brightness(.6)'), duration:.3, ease:'power3.in'}, .25).to(t, {opacity:0, duration:.35}, .7);
    if(host) tl.fromTo(host, {y:0}, {keyframes:[{y:9}, {y:-6}, {y:4}, {y:-2}, {y:0}], duration:.5, ease:'none', clearProps:'transform'}, .55);
    puffs(tl, mk, .55, x, bot - 8, {n:8, color:'rgba(120,100,80,.7)', w:w*1.6, rise:-20, drift:60, size:[20, 34], stagger:.02});
    spray(tl, mk, .55, x, y, {n:12, colors:['#c0392b', '#e67e22', '#8e2a1e'], size:[5, 9], shard:true, dist:[40, 100], dur:[.6, .9], gravity:50, spin:300});
    const sc = mk('fxc-g', '🐉'); sc.style.fontSize = '24px'; tl.set(sc, {x, y, xPercent:-50, yPercent:-50, opacity:0, scale:.4}, .7).to(sc, {opacity:1, scale:1, y:y - 30, duration:.25, ease:'back.out(2)'}, .7).to(sc, {y:bot - 10, duration:.4, ease:'bounce.out'}, .95).to(sc, {opacity:0, duration:.3}, 1.6);
    tl.add(()=>{ snd('roar'); }, 0).add(()=>{ snd('earthquakeTone'); snd('boom'); }, .55);
  });
};
// Supreme beast defeated: a prismatic burst in slow motion.
M.deathSupreme = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, y, w} = D;
  return run(opts, (tl, mk)=>{
    flashAt(tl, mk, 0, x, y, w*4, w*4, 'rgba(255,255,255,.95)', .6);
    tl.to(t, {filter:F('brightness(1.6) saturate(2) hue-rotate(0deg)'), duration:.2}, 0).to(t, {filter:F('brightness(2) saturate(3) hue-rotate(360deg)'), scale:1.08, duration:1.1, ease:'none'}, .2);
    ['#ff5a5a', '#ffb23a', '#ffe14d', '#5aff8a', '#5ac8ff', '#b46aff'].forEach((c, i)=> ringAt(tl, mk, .2 + i*.12, x, y, {from:w*.3, to:w*(2.6 + i*.25), color:c, glow:c, width:3, dur:.9}));
    tl.to(t, {scale:0, opacity:0, duration:.3, ease:'power3.in'}, 1.3);
    spray(tl, mk, 1.3, x, y, {n:24, colors:['#ff5a5a', '#ffb23a', '#ffe14d', '#5aff8a', '#5ac8ff', '#b46aff'], size:[3, 6], dist:[60, 160], dur:[.7, 1]});
    fadeSlot(tl, el, t, 1.2); tl.add(()=> snd('prestigeTone'), 0).add(()=> snd('boom'), 1.3);
  });
};
// Slime splits on death: the card sags into a blob that pinches in two and the halves hop apart.
M.deathSlimeSplit = function(el, opts){
  const D = dying(el); if(!D) return Promise.resolve(); const {t, x, w, h, bot} = D;
  css('slime', `.fxc-slime{border-radius:50% 50% 44% 44% / 60% 60% 40% 40%; background:radial-gradient(circle at 35% 30%, #d9ffb8, #6fd36a 50%, #2f8f3a); box-shadow:inset -3px -4px 0 rgba(0,0,0,.18);}`);
  return run(opts, (tl, mk)=>{
    tl.to(t, {scaleY:.5, scaleX:1.2, transformOrigin:'50% 100%', borderRadius:'40%', opacity:0, duration:.3, ease:'power2.in'}, 0);
    const b = mk('fxc-slime'); tl.set(b, {x, y:bot - h*.18, xPercent:-50, yPercent:-50, width:w*.9, height:h*.4, opacity:0}, .25).to(b, {opacity:1, duration:.05}, .25)
      .to(b, {scaleX:1.3, scaleY:.8, duration:.15}, .3).to(b, {opacity:0, duration:.05}, .45);
    [-1, 1].forEach(s=>{ const k = mk('fxc-slime'); tl.set(k, {x:x + s*w*.2, y:bot - h*.18, xPercent:-50, yPercent:-50, width:w*.45, height:h*.3, opacity:0}, .45).to(k, {opacity:1, duration:.04}, .45)
      .to(k, {x:x + s*w*.75, duration:.45, ease:'power1.out'}, .45).to(k, {y:bot - h*.45, duration:.2, ease:'power2.out'}, .45).to(k, {y:bot - h*.15, scaleY:.8, duration:.2, ease:'power2.in'}, .65)
      .to(k, {scaleY:1, duration:.15}, .85).to(k, {opacity:0, duration:.25}, 1.0); });
    fadeSlot(tl, el, t, .3); tl.add(()=> snd('bubble'), .3).add(()=> snd('mysteryBoing'), .45);
  });
};
// The skull float every death shows (the game's .death-skull, as deathVfx plays it), for the lab.
M.skullFloat = function(el, opts){
  const b = boardOf(el); if(!b) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{ const s = document.createElement('div'); s.className = 'death-skull'; s.textContent = '💀'; s.style.animation = 'none'; b.appendChild(s); bag.push(s);
    tl.fromTo(s, {y:0, opacity:0, scale:.6}, {y:-26, opacity:1, scale:1, duration:.24, ease:'back.out(2)'}, 0).to(s, {y:-40, opacity:0, duration:.24, ease:'power1.in'}, .24); });
};

// ======================================================================================================================
// 3. CASTLE: el is the castle tile ([data-hq] / .match-castle-tile); targets are .board-cards.
// ======================================================================================================================
const castleTile = el=> (el && (el.matches && el.matches('.card-tile') ? el : el.querySelector && el.querySelector('.card-tile'))) || el;
css('castle', `
.fxc-stitch{fill:none; stroke:#7dff8a; stroke-width:2.4; stroke-linecap:round; filter:drop-shadow(0 0 3px #3fdc5a);}
.fxc-boltshaft{height:4px; border-radius:2px; background:linear-gradient(90deg, #6a4a20 0, #c9a25a 30%, #e8c27a 70%, #8a6a30 100%); box-shadow:0 0 4px rgba(255,200,120,.5);}
.fxc-boltshaft::before{content:''; position:absolute; right:-9px; top:-4px; border-left:11px solid #b8862a; border-top:6px solid transparent; border-bottom:6px solid transparent; filter:drop-shadow(0 0 2px #ffd88a);}
.fxc-boltshaft::after{content:''; position:absolute; left:-2px; top:-4px; width:10px; height:12px; background:linear-gradient(180deg, #e8e0c8, #9a8c6a); clip-path:polygon(0 0, 100% 35%, 100% 65%, 0 100%, 30% 50%);}
.fxc-vine path{fill:none; stroke-linecap:round;}
.fxc-flask{font-size:20px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.4));}
.fxc-door{background:repeating-linear-gradient(90deg, #7a5030 0 7px, #5e3c22 7px 9px); border:2px solid #3a2414; box-sizing:border-box; box-shadow:inset 0 0 6px rgba(0,0,0,.5);}
.fxc-gap{background:radial-gradient(ellipse at 50% 70%, #ffdca0 0, #6a4020 40%, #1a0e06 80%); border-radius:40% 40% 0 0;}
.fxc-dome{border-radius:50% 50% 8% 8%; border:2px solid rgba(160,220,255,.95); box-sizing:border-box;
  background:radial-gradient(ellipse at 50% 30%, rgba(220,245,255,.35), rgba(110,190,255,.18) 55%, rgba(80,160,255,.3)),
  repeating-conic-gradient(from 30deg, rgba(180,230,255,.25) 0 10deg, transparent 10deg 60deg); box-shadow:0 0 18px rgba(120,200,255,.7), inset 0 0 18px rgba(160,220,255,.6);}
.fxc-sweat{font-size:16px;}
.fxc-bubble-castle{font:700 12px/1.25 'Nunito', system-ui, sans-serif; color:#2a1d10; background:linear-gradient(180deg, #efe4c8, #d8c69e); border:2px solid #7d6a48;
  border-radius:4px; padding:5px 9px; box-shadow:0 3px 0 #5e4f34, 0 4px 10px rgba(0,0,0,.35); max-width:170px; text-align:center;}
.fxc-bubble-castle::before{content:''; position:absolute; left:6px; right:6px; top:-7px; height:6px; background:repeating-linear-gradient(90deg, #7d6a48 0 8px, transparent 8px 13px);}
.fxc-skin{position:absolute; inset:0; pointer-events:none; z-index:30; border-radius:inherit; overflow:hidden;}
.fxc-skin svg{position:absolute; left:0; bottom:0; width:100%; height:62%;}
`);
// Castle regenerates: green mortar stitches knit across the wall, the castle swells a touch, leaves twinkle.
M.castleRegen = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const c = centre(t), sv = svgOver(bag, c.r.left, c.r.top, c.w, c.h, 1246);
    for(let i = 0; i < 4; i++){ const y0 = c.h*(.3 + i*.14), x0 = c.w*rnd(.12, .3), x1 = c.w*rnd(.7, .88);
      const p = svgNode('polyline', {class:'fxc-stitch', points:zig(x0, y0, x1, y0 + rnd(-8, 8), 5, 4)}, sv); p.style.strokeDasharray = 200; p.style.strokeDashoffset = 200;
      tl.to(p, {strokeDashoffset:0, duration:.32, ease:'power1.inOut'}, .05 + i*.08);
      for(let k = 1; k < 4; k++){ const sx = x0 + (x1 - x0)*k/4; const st = svgNode('line', {class:'fxc-stitch', x1:sx - 3, y1:y0 - 5, x2:sx + 3, y2:y0 + 5, opacity:0}, sv); tl.to(st, {opacity:1, duration:.05}, .2 + i*.08 + k*.04); } }
    tl.to(sv, {opacity:0, duration:.3}, .8);
    const g = inTile(t, bag, ''); g.style.background = 'radial-gradient(ellipse at center, rgba(120,255,140,.35), rgba(120,255,140,0) 70%)'; tl.fromTo(g, {opacity:0}, {opacity:1, duration:.2, yoyo:true, repeat:1}, .1);
    tl.fromTo(t, {scale:1}, {scale:1.04, duration:.16, yoyo:true, repeat:1, ease:'sine.inOut', clearProps:'scale'}, .3);
    spray(tl, mk, .2, c.x, c.y, {n:7, glyphs:['🍃', '✦', '🌿'], size:[10, 14], angle:-90, arc:120, dist:[24, 50], dur:[.5, .7], w:c.w*.7, h:c.h*.5, stagger:.03});
    chip(tl, mk, .15, t, '🧱 +' + (opts.amount || 1) + (opts.perk ? ' (perk)' : ''), '#2f7d1f');
    tl.add(()=> snd('healTone'), .05);
  });
};
// The castle (or its Everbloom perk) makes Lumber: a log pops out of the top of the wall and hops to the Lumber pill.
M.castleLumber = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), dest = opts.dest && opts.dest.isConnected ? centre(opts.dest) : null, l = mk('fxc-g', opts.perk ? '🌸' : '🪵'); l.style.fontSize = '20px';
    const p0 = {x:c.x, y:c.r.top + c.h*.2};
    tl.set(l, {x:p0.x, y:p0.y, xPercent:-50, yPercent:-50, scale:.3, opacity:0, rotation:-20}, 0).to(l, {scale:1.1, opacity:1, y:p0.y - 34, rotation:10, duration:.25, ease:'back.out(2)'}, 0);
    if(dest){ const st = {k:0}, mid = {x:(p0.x + dest.x)/2, y:Math.min(p0.y, dest.y) - 60};
      tl.to(st, {k:1, duration:.5, ease:'power1.in', onUpdate:()=>{ const k = st.k, a = 1 - k; gsap.set(l, {x:a*a*p0.x + 2*a*k*mid.x + k*k*dest.x, y:a*a*(p0.y - 34) + 2*a*k*mid.y + k*k*dest.y, scale:1 - .35*k}); }}, .3)
        .to(l, {opacity:0, duration:.1}, .78);
      ringAt(tl, mk, .8, dest.x, dest.y, {from:10, to:Math.max(30, dest.w*.8), color:'#e0b46a', width:2, dur:.32});
      if(opts.dest) tl.fromTo(opts.dest, {scale:1}, {scale:1.15, duration:.08, yoyo:true, repeat:1, clearProps:'scale'}, .8);
    } else tl.to(l, {y:p0.y - 50, opacity:0, duration:.4}, .45);
    chip(tl, mk, .1, t, (opts.perk ? '🌸' : '🪵') + ' +1', '#7a5030', {y:c.r.top + c.h*.5});
    tl.add(()=> snd('woodKnock'), 0).add(()=> snd('pickup'), .8);
  });
};
// Ballista bolt from the fort wall: a long bronze bolt streaks from the castle to its target, thunks in, and the card recoils.
M.castleBolt = function(castle, target, opts){
  opts = opts || {}; const ct = castleTile(castle), tt = tileOf(target); if(!ct || !tt) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const a = centre(ct), b = centre(tt), ang = Math.atan2(b.y - a.y, b.x - a.x)*180/Math.PI, len = 46, fl = (opts.flight || 260)/1000;
    const s = mk('fxc-boltshaft'); s.style.width = len + 'px';
    tl.set(s, {x:a.x, y:a.y - a.h*.2, xPercent:-50, yPercent:-50, rotation:ang, opacity:1, scaleX:.4}, 0).to(ct, {y:a.y > b.y ? 4 : -4, duration:.06, yoyo:true, repeat:1, clearProps:'y'}, 0)
      .to(s, {x:b.x, y:b.y, scaleX:1, duration:fl, ease:'power2.in'}, .04).to(s, {opacity:0, duration:.2}, .04 + fl + .25);
    tl.add(()=>{ call(opts.onImpact); }, .04 + fl);
    spray(tl, mk, .04 + fl, b.x, b.y, {n:8, colors:['#ffd88a', '#c9a25a', '#fff'], size:[2, 4], angle:ang + 180, arc:120, dist:[14, 30], dur:[.25, .4]});
    tl.fromTo(tt, {x:0, y:0}, {x:Math.cos(ang*Math.PI/180)*7, y:Math.sin(ang*Math.PI/180)*7, duration:.06, yoyo:true, repeat:1, clearProps:'x,y'}, .04 + fl);
    tl.add(()=> snd('bowCreak'), 0).add(()=> snd('arrowLoose', false), .04).add(()=> snd('arrowThunk', false), .04 + fl);
  });
};
// Thorn Cage: a bramble whips out of the castle wall, lashes the attacker and snaps back.
M.castleThorns = function(castle, target, opts){
  opts = opts || {}; const ct = castleTile(castle), tt = tileOf(target); if(!ct || !tt) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const a = centre(ct), b = centre(tt), L = Math.min(a.r.left, b.r.left) - 30, T = Math.min(a.r.top, b.r.top) - 30, W = Math.max(a.r.right, b.r.right) - L + 30, H = Math.max(a.r.bottom, b.r.bottom) - T + 30;
    const sv = svgOver(bag, L, T, W, H, 1246); sv.classList.add('fxc-vine');
    const ax = a.x - L, ay = a.y - T, bx = b.x - L, by = b.y - T, mx = (ax + bx)/2 + rnd(-40, 40), my = (ay + by)/2 + rnd(-30, 30);
    const d = `M${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`;
    const v1 = svgNode('path', {d, stroke:'#3d5a1f', 'stroke-width':6}, sv), v2 = svgNode('path', {d, stroke:'#6f9a35', 'stroke-width':2.5}, sv);
    const thorns = svgNode('path', {d, stroke:'#d8c99a', 'stroke-width':7, 'stroke-dasharray':'2 9'}, sv);
    [v1, v2, thorns].forEach(p=>{ const Lp = 600; p.style.strokeDasharray = thorns === p ? '2 9' : Lp; if(p !== thorns){ p.style.strokeDashoffset = Lp; tl.to(p, {strokeDashoffset:0, duration:.22, ease:'power3.out'}, 0).to(p, {strokeDashoffset:-Lp, duration:.25, ease:'power2.in'}, .45); } });
    tl.fromTo(thorns, {opacity:0}, {opacity:1, duration:.05}, .15).to(thorns, {opacity:0, duration:.1}, .45);
    spray(tl, mk, .22, b.x, b.y, {n:7, colors:['#c02a2a', '#6f9a35', '#d8c99a'], size:[2, 4], dist:[12, 30], dur:[.3, .45]});
    tl.fromTo(tt, {rotation:0}, {rotation:6, duration:.06, yoyo:true, repeat:1, clearProps:'rotation'}, .22);
    { const sc = inTile(tt, bag, ''); sc.style.background = 'linear-gradient(130deg, transparent 42%, rgba(200,30,30,.75) 45%, transparent 48%, transparent 55%, rgba(200,30,30,.6) 57%, transparent 60%)'; tl.fromTo(sc, {opacity:0}, {opacity:1, duration:.04}, .22).to(sc, {opacity:0, duration:.35}, .4); }
    tl.add(()=> snd('swipeTone'), 0).add(()=>{ snd('hitAt', 2, false); call(opts.onImpact); }, .22);
  });
};
// Herb Refinery heals: a green steam puff rises from the castle and drifts onto the hurt ally.
M.castleHerbHeal = function(castle, target, opts){
  opts = opts || {}; const ct = castleTile(castle), tt = tileOf(target); if(!ct || !tt) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const a = centre(ct), b = centre(tt);
    puffs(tl, mk, 0, a.x, a.r.top + a.h*.25, {n:4, color:'rgba(140,230,150,.7)', w:a.w*.5, rise:-24, size:[14, 22], stagger:.05});
    for(let i = 0; i < 4; i++){ const p = mk('fxc-puff'), s = rnd(14, 20); p.style.width = p.style.height = s + 'px'; p.style.background = 'radial-gradient(circle, rgba(150,240,160,.85), rgba(150,240,160,0) 70%)';
      const t0 = .25 + i*.06; tl.set(p, {x:a.x, y:a.r.top, xPercent:-50, yPercent:-50, opacity:0}, t0).to(p, {opacity:1, duration:.05}, t0)
        .to(p, {x:b.x + rnd(-10, 10), y:b.y + rnd(-10, 10), scale:1.5, duration:.45, ease:'sine.inOut'}, t0).to(p, {opacity:0, duration:.2}, t0 + .45); }
    spray(tl, mk, .7, b.x, b.y, {n:6, glyphs:['🌿', '✚'], size:[10, 13], angle:-90, arc:90, dist:[18, 36], dur:[.45, .6]});
    tl.add(()=> snd('healTone'), .7);
  });
};
// Herb Refinery's bitter brew: a flask is lobbed from the castle and splashes the enemy in purple-green.
// 2026-10-16 (user: "The refinery should visibly throw a potion emoji at the enemy (very slight arc) ... Make this happen faster"):
// a bigger 🧪 on a shallow arc (26 px above the straight line, was 80) with a lazy quarter-spin, in 0.33 s (was 0.42).
M.castleHerbBane = function(castle, target, opts){
  opts = opts || {}; const ct = castleTile(castle), tt = tileOf(target); if(!ct || !tt || !ct.isConnected || !tt.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const a = centre(ct), b = centre(tt), f = mk('fxc-g fxc-flask', '🧪'), st = {k:0}, p0 = {x:a.x, y:a.r.top + a.h*.2}, mid = {x:(p0.x + b.x)/2, y:(p0.y + b.y)/2 - 26}, fl = (opts.flight || 330)/1000;
    f.style.fontSize = '30px';
    tl.set(f, {x:p0.x, y:p0.y, xPercent:-50, yPercent:-50, opacity:1, scale:.8}, 0)
      .to(st, {k:1, duration:fl, ease:'none', onUpdate:()=>{ const k = st.k, q = 1 - k; gsap.set(f, {x:q*q*p0.x + 2*q*k*mid.x + k*k*b.x, y:q*q*p0.y + 2*q*k*mid.y + k*k*b.y, rotation:k*160 - 20, scale:.8 + k*.3}); }}, 0).set(f, {opacity:0}, fl);
    flashAt(tl, mk, fl, b.x, b.y, b.w*1.4, b.w*1.4, 'rgba(150,90,200,.85)', .3);
    spray(tl, mk, fl, b.x, b.y, {n:12, colors:['#9b5bd0', '#7dbb3a', '#c9a6ff'], size:[3, 7], dist:[20, 50], dur:[.35, .55], gravity:24});
    puffs(tl, mk, fl + .05, b.x, b.y, {n:3, color:'rgba(120,180,60,.55)', w:b.w*.5, rise:-24, size:[16, 22]});
    tl.add(()=>{ call(opts.onImpact); snd('poisonApply'); snd('splash'); }, fl);
  });
};
// The castle's gate swings open (castle spawn): two timber doors part on a warm glow, dust puffs at the threshold.
M.castleGate = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), W = c.w*.42, H = c.h*.42, gx = c.x, gy = c.r.bottom - H*.5 - c.h*.06;
    const gap = mk('fxc-gap'); tl.set(gap, {x:gx, y:gy, xPercent:-50, yPercent:-50, width:W, height:H, opacity:0}, 0).to(gap, {opacity:1, duration:.1}, 0).to(gap, {opacity:0, duration:.25}, .85);
    [-1, 1].forEach(s=>{ const d = mk('fxc-door'); placeAt(d, gx + (s < 0 ? -W/2 : 0), gy - H/2); tl.set(d, {width:W/2, height:H, transformOrigin:s < 0 ? '0% 50%' : '100% 50%', transformPerspective:160, rotationY:0, opacity:1}, 0)
      .to(d, {rotationY:s*-75, duration:.35, ease:'back.out(1.4)'}, .05).to(d, {rotationY:0, duration:.25, ease:'power2.in'}, .7).to(d, {opacity:0, duration:.15}, .95); });
    puffs(tl, mk, .15, gx, gy + H*.45, {n:5, color:'rgba(180,150,110,.6)', w:W, rise:-10, drift:30, size:[12, 20], stagger:.03});
    tl.add(()=>{ snd('woodKnock'); snd('drum'); }, .05);
  });
};
// A unit marches out of the castle to its slot: footstep dust runs from the gate to the card, which lands with a stomp.
M.marchOut = function(castle, unit, opts){
  opts = opts || {}; const ct = castleTile(castle), ut = tileOf(unit); if(!ct || !ut) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const a = centre(ct), b = centre(ut), n = 6, t0 = opts.delay || 0;
    for(let i = 0; i <= n; i++){ const k = i/n, px = a.x + (b.x - a.x)*k + (i%2 ? 5 : -5), py = a.r.bottom - a.h*.1 + (b.r.bottom - (a.r.bottom - a.h*.1))*k;
      puffs(tl, mk, t0 + i*.06, px, py, {n:1, color:'rgba(180,150,110,.6)', w:4, rise:-6, size:[8, 12], dur:[.35, .45]}); }
    tl.fromTo(ut, {y:-6}, {y:0, duration:.2, ease:'bounce.out', immediateRender:false, clearProps:'y'}, t0 + .42);
    tl.add(()=> snd('pawnStep'), t0 + .1).add(()=> snd('pawnStep'), t0 + .3);
  });
};
// Logjam: logs tumble down in front of the new card and stack up (its Wait grows).
M.logjam = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), n = 3;
    for(let i = 0; i < n; i++){ const l = mk('fxc-p'); l.style.borderRadius = '6px'; l.style.background = 'linear-gradient(180deg, #b07a46, #7a5030)'; l.style.boxShadow = 'inset 4px 0 0 #d8a874, inset -4px 0 0 #d8a874';
      const y1 = c.r.bottom - 8 - i*9, t0 = i*.1; tl.set(l, {x:c.x + rnd(-6, 6), y:c.r.top - 60, xPercent:-50, yPercent:-50, width:c.w*.8, height:10, rotation:rnd(-30, 30), opacity:1}, t0)
        .to(l, {y:y1, rotation:rnd(-4, 4), duration:.28, ease:'bounce.out'}, t0).to(l, {opacity:0, duration:.25}, .95); }
    tl.fromTo(t, {y:0}, {y:3, duration:.06, yoyo:true, repeat:1, clearProps:'y'}, .28);
    chip(tl, mk, .3, t, '🪵 Logjam +' + (opts.amount || 1) + '⏳', '#7a5030');
    tl.add(()=> snd('woodKnock'), .25).add(()=> snd('woodKnock'), .38);
  });
};
// The castle's shield takes a hit: a hex dome flickers into view and ripples at the impact; B: the dome shatters (last point).
M.castleShield = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), d = mk('fxc-dome'), W = c.w*1.25, H = c.h*1.05;
    tl.set(d, {x:c.x, y:c.y - c.h*.04, xPercent:-50, yPercent:-50, width:W, height:H, opacity:0, scale:.92}, 0).to(d, {opacity:1, scale:1, duration:.08}, 0);
    ringAt(tl, mk, .02, c.x, c.y + (opts.fromBelow ? c.h*.3 : -c.h*.3), {from:8, to:c.w*.9, color:'#bfe8ff', glow:'rgba(120,200,255,.8)', width:3, squash:.6, dur:.4});
    if(opts.broken){ tl.add(()=> snd('iceShatter'), .1).to(d, {opacity:0, duration:.05}, .12);
      spray(tl, mk, .12, c.x, c.y, {n:16, colors:['rgba(200,235,255,.95)', 'rgba(130,200,255,.85)'], size:[6, 12], shard:true, dist:[30, 80], dur:[.5, .7], gravity:50, spin:300, w:W*.8, h:H*.7}); }
    else tl.to(d, {opacity:.5, duration:.1, yoyo:true, repeat:1}, .08).to(d, {opacity:0, duration:.3}, .4);
    tl.add(()=> snd('shield'), 0);
  });
};
M.castleShield_B = (el, opts)=> M.castleShield(el, Object.assign({}, opts, {broken:true}));
// Your own boomerang hits your own castle: a sheepish wobble, a sweat drop and "Oops!".
M.castleOops = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    tl.fromTo(t, {rotation:0}, {keyframes:[{rotation:-4}, {rotation:3}, {rotation:-1.5}, {rotation:0}], duration:.5, ease:'sine.inOut', clearProps:'rotation'}, .05);
    const s = mk('fxc-g fxc-sweat', '💧'); tl.set(s, {x:c.r.right - c.w*.12, y:c.r.top + c.h*.15, xPercent:-50, yPercent:-50, opacity:0, scale:.5}, .1).to(s, {opacity:1, scale:1, duration:.12}, .1).to(s, {y:'+=22', opacity:0, duration:.5, ease:'power1.in'}, .3);
    chip(tl, mk, .08, t, '🪃 Oops!', '#8a5a2a'); tl.add(()=> snd('mysteryBoing'), .05);
  });
};
// The castle talks in a stone-framed bubble (was the units' bubble); the castle gives a little hop as it speaks.
M.castleSpeech = function(el, text, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), b = mk('fxc-bubble-castle'); b.textContent = text || '…';
    const foe = isFoeEl(t), y0 = foe ? c.r.bottom + 8 : c.r.top - 8, bw = b.offsetWidth || 160, vw = document.documentElement.clientWidth || innerWidth;
    const bx = Math.max(bw/2 + 6, Math.min(vw - bw/2 - 6, c.x)); // castles sit in the corners: keep the bubble on screen
    tl.set(b, {x:bx, y:y0, xPercent:-50, yPercent:foe ? 0 : -100, scale:.4, opacity:0, transformOrigin:foe ? '50% 0%' : '50% 100%'}, 0).to(b, {scale:1, opacity:1, duration:.2, ease:'back.out(2.5)'}, 0)
      .to(b, {opacity:0, y:'+=' + (foe ? 6 : -6), duration:.25}, (opts.hold || 2000)/1000);
    tl.fromTo(t, {y:0}, {y:-4, duration:.1, yoyo:true, repeat:1, ease:'power1.out', clearProps:'y'}, 0);
  });
};
// The leader callout ("👑 X joins the fight!") unfurls like a banner instead of popping in (it's the game's own element).
M.bannerUnfurl = function(el, opts){
  if(!el || !el.isConnected) return Promise.resolve();
  return run(opts, (tl)=>{
    tl.fromTo(el, {scaleX:.05, scaleY:.6, rotationX:-60, transformPerspective:500, transformOrigin:'50% 0%'}, {scaleX:1, duration:.32, ease:'back.out(1.6)'}, 0)
      .to(el, {scaleY:1, rotationX:0, duration:.45, ease:'elastic.out(1, .5)'}, .12)
      .to(el, {skewX:3, duration:.25, yoyo:true, repeat:1, ease:'sine.inOut', clearProps:'transform'}, .55);
  });
};
// Hummingbird cliff nests crack differently from Otter stone: woven twigs snap and fly (castle crack variant).
M.nestSnap = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    tl.fromTo(t, {x:0}, {x:3, duration:.04, yoyo:true, repeat:3, ease:'none', clearProps:'x'}, 0);
    for(let i = 0; i < 8; i++){ const p = mk('fxc-p'); p.style.borderRadius = '2px'; p.style.background = i%3 ? '#8a6238' : '#c69c62';
      const t0 = .03 + i*.02, s = Math.random() < .5 ? -1 : 1; tl.set(p, {x:c.x + rnd(-.35, .35)*c.w, y:c.y + rnd(-.2, .25)*c.h, xPercent:-50, yPercent:-50, width:rnd(14, 26), height:3, rotation:rnd(0, 180), opacity:1}, t0)
        .to(p, {x:'+=' + s*rnd(20, 50), rotation:'+=' + s*rnd(200, 400), duration:.5, ease:'power2.out'}, t0).to(p, {y:'-=' + rnd(10, 26), duration:.18, ease:'power2.out'}, t0).to(p, {y:'+=' + rnd(40, 70), duration:.34, ease:'power2.in'}, t0 + .18)
        .to(p, {opacity:0, duration:.15}, t0 + .38); }
    spray(tl, mk, .05, c.x, c.y, {n:5, glyphs:['🪶'], size:[10, 13], dist:[20, 40], dur:[.6, .8], gravity:20, spin:160});
    tl.add(()=> snd('woodKnock'), 0);
  });
};
// Castle looks per faction (planned): lab concept skins drawn over the castle tile, built up in a short sequence.
const SKINS = {
  otter:`<svg viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M0 62V40h8V30h6v10h8V26h6v14h8V30h6v10h8V22h6v18h8V30h6v10h8V26h6v14h8V30h6v32z" fill="#7a5a3a" stroke="#3a2a1a" stroke-width="1.2"/>
    <path d="M0 52 Q25 47 50 52 T100 52 V62H0z" fill="#3fa6b8" opacity=".85"/><rect x="42" y="38" width="16" height="16" rx="7" fill="#2a1a0e"/><circle cx="50" cy="20" r="3" fill="#c9a25a"/></svg>`,
  hummingbird:`<svg viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M10 62 Q20 20 50 14 Q80 20 90 62z" fill="#8a6238" stroke="#4a3018" stroke-width="1.2"/>
    <path d="M18 50 Q50 30 82 50 M22 40 Q50 22 78 40 M28 30 Q50 18 72 30" stroke="#c69c62" stroke-width="2" fill="none"/><circle cx="38" cy="22" r="3" fill="#ff4fa3"/><circle cx="62" cy="24" r="3" fill="#3fe0c8"/><circle cx="50" cy="16" r="3" fill="#ffd34a"/></svg>`,
  hive:`<svg viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M12 62 Q14 22 50 10 Q86 22 88 62z" fill="#e8b440" stroke="#8a5a10" stroke-width="1.2"/>
    <path d="M18 50H82 M22 38H78 M30 26H70" stroke="#b07a1a" stroke-width="2"/><ellipse cx="50" cy="54" rx="8" ry="6" fill="#3a2410"/><circle cx="72" cy="30" r="2" fill="#7dff9a"/></svg>`,
};
M.castleSkin = function(el, opts){
  opts = opts || {}; const t = castleTile(el); if(!t || !t.isConnected) return Promise.resolve(); const kind = opts.kind || 'otter';
  return run(opts, (tl, mk, bag)=>{
    const s = inTile(t, bag, 'fxc-skin', SKINS[kind] || SKINS.otter); const svg = s.querySelector('svg');
    tl.fromTo(svg, {scaleY:0, transformOrigin:'50% 100%'}, {scaleY:1, duration:.4, ease:'back.out(1.6)'}, 0)
      .fromTo(s, {opacity:1}, {opacity:1, duration:1.6}, 0).to(s, {opacity:0, duration:.3}, 1.6);
    puffs(tl, mk, .1, centre(t).x, centre(t).r.bottom - 6, {n:4, color:'rgba(180,150,110,.55)', w:centre(t).w, rise:-10, size:[12, 18]});
    tl.add(()=> snd('woodKnock'), .05);
  });
};
M.castleSkin_B = (el, opts)=> M.castleSkin(el, Object.assign({}, opts, {kind:'hummingbird'}));
M.castleSkin_C = (el, opts)=> M.castleSkin(el, Object.assign({}, opts, {kind:'hive'}));

// ======================================================================================================================
// 4. SUMMONS AND SPAWNS
// ======================================================================================================================
css('summon', `
.fxc-back{position:absolute; inset:0; border-radius:inherit; z-index:45; backface-visibility:hidden;
  background:radial-gradient(circle at 50% 50%, #e9cf8f 0 14%, transparent 15%), repeating-linear-gradient(45deg, #5a2a1e 0 6px, #6e3424 6px 12px); border:3px solid #d9a441; box-sizing:border-box;}
.fxc-soil{border-radius:50% 50% 10% 10% / 70% 70% 10% 10%; background:radial-gradient(ellipse at 50% 30%, #8a6a44, #5a4028 70%);}
.fxc-scaffold{position:absolute; inset:-4% -6%; pointer-events:none; z-index:45;}
.fxc-scaffold i{position:absolute; background:linear-gradient(180deg, #c48a52, #8a5a30); border-radius:2px; box-shadow:0 1px 0 rgba(0,0,0,.3);}
.fxc-mound{border-radius:50% 50% 8% 8% / 90% 90% 10% 10%; background:radial-gradient(ellipse at 50% 30%, #b0844e, #6e4c28 70%); box-shadow:inset 0 -6px 0 rgba(0,0,0,.18);}
.fxc-lamp{border-radius:50%; background:radial-gradient(circle, #f6ff8a, #9be15d 50%, rgba(155,225,93,0) 72%);}
.fxc-crack{background:linear-gradient(180deg, #ffef9a, #ff6a1a 40%, #8e1406); filter:drop-shadow(0 0 6px #ff4a1a);}
.fxc-sand{border-radius:50%; background:radial-gradient(circle, #f0d79a, #c8a060 60%, rgba(200,160,96,0) 72%);}
`);
// An enemy card comes off their deck face down and flips face up on its way to the slot.
M.enemyCardFlip = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    // 2026-10-16 (user: "Card backings -> 4 types…"): the enemy's card shows its own kind's back (unit/structure/castle/field)
    const back = inTile(t, bag, 'fxc-back' + (window.bwCardBackClass ? ' ' + window.bwCardBackClass(t.getAttribute('data-defid') || '') : '')); back.style.overflow = 'visible';
    tl.fromTo(back, {rotationY:0, opacity:1, transformPerspective:500}, {rotationY:90, duration:.22, ease:'power2.in'}, .08).set(back, {opacity:0}, .3);
    tl.fromTo(t, {rotationY:-90, transformPerspective:500}, {rotationY:0, duration:.22, ease:'power2.out', immediateRender:false, clearProps:'rotationY,transformPerspective'}, .3);
    tl.add(()=> snd('cardFlip'), .25);
  });
};
// Played into a reserve row: it slides in under a dim and a small "behind the line" chevron settles under it.
M.reserveIn = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), ch = mk('fxc-g', '⤵'); ch.style.fontSize = '18px'; ch.style.color = '#e8d6a8';
    tl.fromTo(t, {filter:F('brightness(1.3)')}, {filter:F('brightness(.92)'), duration:.4, clearProps:'filter'}, .1);
    tl.set(ch, {x:c.x, y:c.r.top - 4, xPercent:-50, yPercent:-50, opacity:0}, .05).to(ch, {opacity:1, y:c.r.top + 8, duration:.25, ease:'power2.out'}, .05).to(ch, {opacity:0, duration:.25}, .55);
    puffs(tl, mk, .15, c.x, c.r.bottom - 4, {n:3, color:'rgba(180,160,120,.45)', w:c.w*.7, rise:-6, size:[10, 14]});
    chip(tl, mk, .1, t, '⤵ Reserve', 'rgba(60,50,40,.8)');
  });
};
// A reserve unit steps up: a dust kick behind it, speed lines, a hop and a squash as it lands in front.
M.stepUp = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), dir = isFoeEl(el) ? 1 : -1;
    puffs(tl, mk, 0, c.x, dir < 0 ? c.r.bottom + 10 : c.r.top - 10, {n:4, color:'rgba(180,160,120,.55)', w:c.w*.8, rise:dir*-6, drift:20, size:[12, 18]});
    for(let i = 0; i < 3; i++){ const l = mk('fxc-p'); l.style.borderRadius = '2px'; l.style.background = 'rgba(255,255,255,.7)';
      tl.set(l, {x:c.r.left + c.w*(.25 + i*.25), y:c.y - dir*c.h*.55, xPercent:-50, yPercent:-50, width:2, height:16, opacity:0}, .02 + i*.03).to(l, {opacity:.9, duration:.05}, .02 + i*.03).to(l, {y:'-=' + dir*14, opacity:0, duration:.25}, .07 + i*.03); }
    tl.fromTo(t, {y:-dir*10}, {y:dir*-4, duration:.14, ease:'power2.out'}, 0).to(t, {y:0, scaleY:.92, transformOrigin:'50% 100%', duration:.08, ease:'power2.in'}, .14).to(t, {scaleY:1, duration:.25, ease:'back.out(3)', clearProps:'transform'}, .22);
    tl.add(()=> snd('pawnStep'), .14);
  });
};
// Gladiator leader enters: arena sand bursts in a ring and the crowd roars (petals thrown from the stands).
M.gladiatorSand = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    for(let i = 0; i < 10; i++){ const s = mk('fxc-sand'), a = i/10*Math.PI*2, sz = rnd(16, 26); s.style.width = s.style.height = sz + 'px';
      tl.set(s, {x:c.x, y:c.r.bottom - 6, xPercent:-50, yPercent:-50, opacity:.9, scale:.5}, .05).to(s, {x:c.x + Math.cos(a)*c.w*rnd(.7, 1), y:c.r.bottom - 6 + Math.sin(a)*c.h*.25 - rnd(4, 14), scale:rnd(1.6, 2.4), opacity:0, duration:.6, ease:'power2.out'}, .05); }
    ringAt(tl, mk, .05, c.x, c.r.bottom - 6, {from:c.w*.4, to:c.w*2.4, color:'#f0d79a', width:3, squash:.3, dur:.55});
    spray(tl, mk, .2, c.x, c.r.top - 20, {n:10, glyphs:['🌸', '🌼', '✦'], size:[10, 14], angle:90, arc:120, dist:[30, 70], dur:[.7, .9], w:c.w*2, spin:180, stagger:.02});
    chip(tl, mk, .15, t, '⚔ Gladiator!', '#a8521c');
    tl.add(()=>{ snd('brass'); snd('drum'); }, 0);
  });
};
// Meiosis: one translucent cell over the parent's spot pinches into two, and each half lands on one new card.
M.meiosisSplit = function(fromXY, els, opts){
  opts = opts || {}; const list = (els || []).filter(Boolean).map(tileOf); if(!list.length) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c0 = fromXY && fromXY.x != null ? fromXY : centre(list[0]), s = centre(list[0]).w*.9;
    const cell = mk('fxc-cell'); tl.set(cell, {x:c0.x, y:c0.y, xPercent:-50, yPercent:-50, width:s, height:s, scale:.4, opacity:0}, 0).to(cell, {scale:1, opacity:1, duration:.18, ease:'back.out(2)'}, 0)
      .to(cell, {scaleX:1.5, scaleY:.75, duration:.18, ease:'sine.inOut'}, .18).to(cell, {opacity:0, duration:.05}, .36);
    list.forEach((t, i)=>{ const b = centre(t), h = mk('fxc-cell'), sx = c0.x + (i ? 1 : -1)*s*.35;
      tl.set(h, {x:sx, y:c0.y, xPercent:-50, yPercent:-50, width:s*.62, height:s*.62, opacity:0}, .36).to(h, {opacity:1, duration:.03}, .36)
        .to(h, {x:b.x, y:b.y, width:b.w, height:b.w, duration:.32, ease:'power2.inOut'}, .36).to(h, {opacity:0, scale:1.3, duration:.2}, .68);
      tl.fromTo(t, {opacity:.2, scale:.8}, {opacity:1, scale:1, duration:.25, ease:'back.out(2)', clearProps:'opacity,scale'}, .6); });
    tl.add(()=> snd('bubble'), 0).add(()=> snd('mysteryBoing'), .36);
  });
};
// Twin: a mirror sheen sweeps the original and a see-through copy peels off it toward the new twin.
M.twinPeel = function(src, twin, opts){
  opts = opts || {}; const st = tileOf(src), tt = tileOf(twin); if(!st || !tt) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const sh = inTile(st, bag, ''); sh.style.background = 'linear-gradient(105deg, transparent 30%, rgba(220,240,255,.9) 48%, rgba(255,255,255,.95) 50%, rgba(220,240,255,.9) 52%, transparent 70%)';
    sh.style.backgroundSize = '300% 100%'; tl.fromTo(sh, {backgroundPosition:'100% 0%'}, {backgroundPosition:'0% 0%', duration:.3, ease:'power1.inOut'}, 0);
    const b = centre(tt), a = centre(st);
    tl.add(()=>{ const g = ghost(st, bag, {opacity:.7, filter:F('brightness(1.3) saturate(.6) hue-rotate(180deg)')});
      gsap.to(g, {x:b.r.left - a.r.left, y:b.r.top - a.r.top, scaleX:-1, duration:.35, ease:'power2.inOut'}); /* ghost() places by left/top */ gsap.to(g, {opacity:0, duration:.2, delay:.32}); }, .2);
    tl.fromTo(tt, {opacity:0}, {opacity:1, duration:.2, clearProps:'opacity'}, .5);
    spray(tl, mk, .55, b.x, b.y, {n:6, glyphs:['✦', '✧'], size:[9, 13], dist:[16, 36], dur:[.35, .5]});
    tl.to({}, {duration:.4}, .55); tl.add(()=> snd('reflectTone'), 0);
  });
};
// Sprout: a mound of soil, a seed pops out and two leaves unfurl as the Growth Sprout appears (Flora).
M.sproutPop = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), soil = mk('fxc-soil'), by = c.r.bottom - 4;
    tl.set(soil, {x:c.x, y:by, xPercent:-50, yPercent:-100, width:c.w*.7, height:c.h*.16, scaleY:0, transformOrigin:'50% 100%', opacity:1}, 0).to(soil, {scaleY:1, duration:.15, ease:'back.out(2)'}, 0).to(soil, {opacity:0, duration:.25}, .75);
    const seed = mk('fxc-g', '🌰'); seed.style.fontSize = '16px'; tl.set(seed, {x:c.x, y:by - c.h*.1, xPercent:-50, yPercent:-50, scale:0}, .1).to(seed, {scale:1, y:by - c.h*.45, rotation:200, duration:.25, ease:'power2.out'}, .12).to(seed, {scale:0, duration:.1}, .37);
    [-1, 1].forEach(s=>{ const lf = mk('fxc-g', '🌱'); lf.style.fontSize = '18px'; tl.set(lf, {x:c.x + s*6, y:by - c.h*.45, xPercent:-50, yPercent:-50, scale:0, rotation:s*-40}, .37)
      .to(lf, {scale:1.2, rotation:s*20, x:c.x + s*16, duration:.22, ease:'back.out(3)'}, .37).to(lf, {opacity:0, scale:.6, duration:.25}, .72); });
    tl.fromTo(t, {scale:.2, opacity:0, transformOrigin:'50% 100%'}, {scale:1, opacity:1, duration:.35, ease:'back.out(2)', clearProps:'transform,opacity'}, .38);
    spray(tl, mk, .05, c.x, by, {n:6, colors:['#8a6a44', '#5a4028'], size:[3, 5], angle:-90, arc:120, dist:[12, 26], dur:[.3, .45], gravity:20});
    tl.add(()=> snd('growthSwell'), .1).add(()=> snd('bloomTone'), .38);
  });
};
// A Structure goes up. A: a beaver-built timber scaffold rises round it with hammer knocks. B: an ant mound heaps up, acid lamps glow.
M.structureBuild = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const sc = inTile(t, bag, 'fxc-scaffold'); sc.style.overflow = 'visible';
    sc.innerHTML = '<i style="left:2%;bottom:0;width:6%;height:100%"></i><i style="right:2%;bottom:0;width:6%;height:100%"></i><i style="left:0;bottom:30%;width:100%;height:5%"></i><i style="left:0;bottom:65%;width:100%;height:5%"></i><i style="left:8%;bottom:10%;width:110%;height:4%;transform:rotate(-38deg);transform-origin:0 0"></i>';
    const bars = [...sc.children]; tl.fromTo(bars, {scaleY:0, scaleX:0, transformOrigin:'0% 100%', opacity:1}, {scaleY:1, scaleX:1, duration:.16, stagger:.07, ease:'back.out(2)'}, 0).to(bars, {opacity:0, duration:.3}, .8);
    tl.fromTo(t, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:.45, ease:'steps(5)', clearProps:'clipPath'}, .1);
    const c = centre(t); puffs(tl, mk, .1, c.x, c.r.bottom - 4, {n:5, color:'rgba(180,150,110,.6)', w:c.w, rise:-10, drift:26, size:[12, 20], stagger:.06});
    spray(tl, mk, .15, c.x, c.r.bottom - c.h*.3, {n:3, glyphs:['🔨'], size:[12, 14], angle:-90, arc:60, dist:[10, 20], dur:[.25, .35], stagger:.12});
    [0, .14, .28].forEach(k=> tl.add(()=> snd('woodKnock'), .1 + k));
  });
};
M.structureBuild_B = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), m = mk('fxc-mound');
    tl.set(m, {x:c.x, y:c.r.bottom + 2, xPercent:-50, yPercent:-100, width:c.w*1.15, height:c.h*.5, scaleY:0, transformOrigin:'50% 100%', opacity:1}, 0)
      .to(m, {scaleY:1, duration:.3, ease:'back.out(1.6)'}, 0).to(m, {scaleY:.2, opacity:0, duration:.3, ease:'power2.in'}, .55);
    tl.fromTo(t, {y:c.h*.4, opacity:0}, {y:0, opacity:1, duration:.35, ease:'back.out(1.6)', clearProps:'y,opacity'}, .3);
    [-1, 1].forEach(s=>{ const l = mk('fxc-lamp'); tl.set(l, {x:c.x + s*c.w*.42, y:c.r.bottom - c.h*.2, xPercent:-50, yPercent:-50, width:18, height:18, opacity:0}, .25)
      .to(l, {opacity:1, duration:.08, yoyo:true, repeat:3}, .25).to(l, {opacity:0, duration:.2}, .7); });
    spray(tl, mk, .05, c.x, c.r.bottom - 6, {n:10, colors:['#8a6a44', '#b0844e'], size:[3, 5], angle:-90, arc:150, dist:[14, 34], dur:[.35, .5], gravity:24, w:c.w});
    tl.add(()=> snd('earthquakeTone'), 0).add(()=> snd('gadget'), .3);
  });
};
// An egg card waiting on the board wobbles as its Wait drops; a crack shows how close it is (progress 0..1).
M.eggWobble = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const p = Math.max(0, Math.min(1, opts.progress != null ? opts.progress : .5)), c = centre(t), amp = 3 + p*5;
    tl.fromTo(t, {rotation:0}, {keyframes:[{rotation:-amp}, {rotation:amp}, {rotation:-amp*.6}, {rotation:amp*.4}, {rotation:0}], duration:.6, ease:'sine.inOut', transformOrigin:'50% 90%', clearProps:'rotation'}, 0);
    if(p > .1){ const sv = svgOver(bag, c.r.left, c.r.top, c.w, c.h, 1246), n = 1 + Math.round(p*3);
      for(let i = 0; i < n; i++){ const pl = svgNode('polyline', {points:zig(c.w*rnd(.2, .8), c.h*rnd(.15, .35), c.w*rnd(.2, .8), c.h*rnd(.45, .75), 4, 6), fill:'none', stroke:'#3a2a1a', 'stroke-width':1.6}, sv);
        pl.style.strokeDasharray = 200; pl.style.strokeDashoffset = 200; tl.to(pl, {strokeDashoffset:0, duration:.18}, .15 + i*.05); }
      tl.to(sv, {opacity:0, duration:.3}, .75); }
    spray(tl, mk, .1, c.x, c.r.top + c.h*.25, {n:2 + Math.round(p*3), colors:['#f4ead2', '#d9c9a4'], size:[2, 4], dist:[10, 22], dur:[.3, .4], gravity:14});
    tl.add(()=> snd('tap'), .05);
  });
};
// A stolen unit lands on your side: a violet spiral swirls over it, its owner edge flips colour and a ring settles it.
M.mindArrive = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), sp = mk('fxc-g', '🌀'); sp.style.fontSize = Math.round(c.w*.5) + 'px';
    tl.set(sp, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, scale:.3, opacity:0, rotation:0}, 0).to(sp, {scale:1, opacity:.85, rotation:360, duration:.4, ease:'power2.out'}, 0).to(sp, {opacity:0, scale:.4, rotation:540, duration:.3}, .4);
    tl.fromTo(t, {filter:F('hue-rotate(0deg) saturate(1)')}, {filter:F('hue-rotate(60deg) saturate(1.6)'), duration:.25, yoyo:true, repeat:1, clearProps:'filter'}, 0);
    ringAt(tl, mk, .4, c.x, c.y, {from:c.w*.5, to:c.w*1.6, color:'#b48cff', glow:'rgba(180,140,255,.7)', width:3, dur:.45});
    chip(tl, mk, .35, t, '🌀 Now yours', '#5d3a9a'); tl.add(()=> snd('reflectTone'), 0);
  });
};
// A Dark Summon dropped onto a unit: a hellish crack splits the ground under it, embers and red light rise.
M.devilryCrack = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), cr = mk('fxc-crack'), y = c.r.bottom - 4;
    cr.style.clipPath = 'polygon(0 50%, 12% 30%, 22% 60%, 34% 25%, 46% 65%, 58% 20%, 70% 70%, 82% 35%, 92% 60%, 100% 50%, 92% 55%, 82% 45%, 70% 85%, 58% 40%, 46% 80%, 34% 45%, 22% 75%, 12% 45%)';
    tl.set(cr, {x:c.x, y, xPercent:-50, yPercent:-50, width:c.w*.2, height:c.h*.22, opacity:1}, 0).to(cr, {width:c.w*1.3, duration:.18, ease:'power3.out'}, 0).to(cr, {opacity:0, height:c.h*.05, duration:.35}, .55);
    flashAt(tl, mk, .05, c.x, y, c.w*1.6, c.h*.8, 'rgba(255,80,30,.75)', .45);
    spray(tl, mk, .08, c.x, y, {n:12, colors:['#ff6a1a', '#ffb23a', '#c0201a'], size:[2, 4], angle:-90, arc:50, dist:[30, 80], dur:[.5, .8], w:c.w, stagger:.02});
    tl.fromTo(t, {y:0}, {y:4, duration:.05, yoyo:true, repeat:3, clearProps:'y'}, .05);
    tl.add(()=>{ snd('devilryTone'); snd('earthquakeTone'); }, 0);
  });
};
// Remember: it rises back out of candle smoke (the Forgotten Ones).
M.rememberRise = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    puffs(tl, mk, 0, c.x, c.r.bottom - 6, {n:7, color:'rgba(200,190,175,.7)', w:c.w*.8, rise:-c.h*.8, drift:10, size:[18, 28], stagger:.04});
    [-1, 1].forEach(s=> spray(tl, mk, .02, c.x + s*c.w*.48, c.r.bottom - 10, {n:1, glyphs:['🕯'], size:[15, 15], angle:-90, arc:0, dist:[4, 4], dur:[.8, .8]}));
    tl.fromTo(t, {opacity:0, y:12, filter:F('blur(3px) grayscale(1) brightness(1.4)')}, {opacity:1, y:0, filter:F('blur(0px) grayscale(0) brightness(1)'), duration:.6, ease:'power1.out', clearProps:'opacity,transform,filter'}, .15);
    tl.add(()=> snd('nightSwell'), 0);
  });
};
// Trigger spawn rune in an archetype's colour (lab alternatives to the green portal): opts.color / opts.glow.
M.runePortal = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t), D = Math.max(c.w, c.h)*1.1;
    floorSigil(tl, mk, 0, c.x, c.y + c.h*.1, 'fxc-sigil-red', {w:D, squash:.45, grow:.2, spin:180, dur:.7, style:`border-color:${opts.color || '#e0402a'}; box-shadow:0 0 14px ${opts.glow || 'rgba(224,64,42,.85)'}, inset 0 0 14px ${opts.glow || 'rgba(224,64,42,.6)'};`});
    tl.fromTo(t, {scale:.7, opacity:.3}, {scale:1, opacity:1, duration:.4, ease:'back.out(2)', clearProps:'transform,opacity'}, .08);
    spray(tl, mk, .05, c.x, c.y + c.h*.15, {n:8, colors:[opts.color || '#e0402a', '#fff'], size:[3, 5], angle:-90, arc:40, dist:[40, 80], dur:[.5, .6], w:D*.8, stagger:.04});
    tl.add(()=> snd('pitchChime'), 0);
  });
};
// ---- Planned (lab only) ----
// Dragon summoned (Map 50+): the sky darkens, a wing shadow sweeps across the field, a roar, and it lands with a quake.
M.dragonArrive = function(el, opts){
  opts = opts || {}; const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve(); const host = opts.host || document.getElementById('battlefieldEl');
  return run(opts, (tl, mk)=>{
    const c = centre(t), bf = host ? host.getBoundingClientRect() : {left:0, top:0, width:innerWidth, height:innerHeight};
    const dark = mk('fxc-flash'); dark.style.mixBlendMode = 'multiply'; dark.style.borderRadius = '0'; dark.style.background = 'rgba(20,10,30,.55)';
    tl.set(dark, {x:bf.left, y:bf.top, width:bf.width, height:bf.height, opacity:0}, 0).to(dark, {opacity:1, duration:.3}, 0).to(dark, {opacity:0, duration:.4}, 1.2);
    const sh = mk('fxc-g', '🐉'); sh.style.fontSize = '90px'; sh.style.filter = 'brightness(0) blur(2px)'; sh.style.opacity = '.5';
    tl.set(sh, {x:bf.left - 100, y:bf.top + bf.height*.3, xPercent:-50, yPercent:-50, scaleX:-1}, .1).to(sh, {x:bf.left + bf.width + 100, duration:.8, ease:'sine.inOut'}, .1);
    tl.fromTo(t, {y:-160, opacity:0, scale:1.3}, {y:0, opacity:1, scale:1, duration:.35, ease:'power3.in', clearProps:'transform,opacity'}, .8);
    if(host) tl.fromTo(host, {y:0}, {keyframes:[{y:8}, {y:-6}, {y:3}, {y:0}], duration:.4, ease:'none', clearProps:'transform'}, 1.15);
    puffs(tl, mk, 1.15, c.x, c.r.bottom - 6, {n:7, color:'rgba(120,100,80,.7)', w:c.w*1.5, rise:-14, drift:50, size:[18, 30], stagger:.02});
    tl.add(()=> snd('roar'), .2).add(()=> snd('boom'), 1.15);
  });
};
// Supreme beast arrives: a prismatic shockwave.
M.supremeArrive = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    tl.fromTo(t, {scale:0, opacity:0, filter:F('brightness(3)')}, {scale:1, opacity:1, filter:F('brightness(1)'), duration:.5, ease:'back.out(1.8)', clearProps:'transform,opacity,filter'}, .1);
    ['#ff5a5a', '#ffb23a', '#ffe14d', '#5aff8a', '#5ac8ff', '#b46aff'].forEach((col, i)=> ringAt(tl, mk, .1 + i*.07, c.x, c.y, {from:c.w*.4, to:c.w*(3 + i*.2), color:col, glow:col, width:3, dur:.7}));
    flashAt(tl, mk, .1, c.x, c.y, c.w*3, c.w*3, 'rgba(255,255,255,.9)', .5);
    tl.add(()=> snd('prestigeTone'), 0);
  });
};
// Wandering Mage joins (Map 51): the wizard-cat arrives in a puff of stars.
M.mageArrive = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const c = centre(t);
    puffs(tl, mk, 0, c.x, c.y, {n:6, color:'rgba(200,180,255,.75)', w:c.w*.6, h:c.h*.5, rise:-10, drift:30, size:[22, 34], stagger:.02});
    spray(tl, mk, .05, c.x, c.y, {n:14, glyphs:['✦', '★', '✧'], size:[10, 16], dist:[30, 70], dur:[.5, .7], stagger:.01});
    tl.fromTo(t, {scale:.5, opacity:0}, {scale:1, opacity:1, duration:.35, ease:'back.out(2.4)', clearProps:'transform,opacity'}, .15);
    const h = mk('fxc-g', '🎩'); h.style.fontSize = '22px'; tl.set(h, {x:c.x, y:c.r.top - 4, xPercent:-50, yPercent:-50, scale:0}, .3).to(h, {scale:1, rotation:-12, duration:.25, ease:'back.out(3)'}, .3).to(h, {opacity:0, y:'-=12', duration:.3}, .8);
    tl.add(()=> snd('celesta'), 0);
  });
};
// Rooted Wild Veggie takes root (Rafflesia, Venus Fly Trap): roots burrow into the felt.
M.rootTake = function(el, opts){
  const t = tileOf(el); if(!t || !t.isConnected) return Promise.resolve();
  return run(opts, (tl, mk, bag)=>{
    const c = centre(t), sv = svgOver(bag, c.r.left - c.w*.3, c.r.bottom - 12, c.w*1.6, 40, 1246);
    for(let i = 0; i < 5; i++){ const x0 = c.w*(.5 + i*.15), d = `M${x0} 0 Q ${x0 + rnd(-30, 30)} 18 ${x0 + rnd(-50, 50)} ${rnd(26, 38)}`;
      const p = svgNode('path', {d, fill:'none', stroke:'#6a4a26', 'stroke-width':rnd(2, 3.5), 'stroke-linecap':'round'}, sv); p.style.strokeDasharray = 100; p.style.strokeDashoffset = 100;
      tl.to(p, {strokeDashoffset:0, duration:.35, ease:'power1.out'}, .1 + i*.05); }
    tl.to(sv, {opacity:0, duration:.4}, 1.0);
    tl.fromTo(t, {y:-8}, {y:0, duration:.25, ease:'bounce.out', clearProps:'y'}, 0);
    spray(tl, mk, .1, c.x, c.r.bottom - 4, {n:8, colors:['#6a4a26', '#8a6a44'], size:[3, 5], angle:-90, arc:140, dist:[10, 24], dur:[.35, .5], gravity:16, w:c.w});
    tl.add(()=> snd('growthSwell'), .1);
  });
};
// Drones / golems summoned onto the enemy's field (area control idea): they drop in from your side on a tether of light.
M.dronesDrop = function(from, onto, opts){
  const a = tileOf(from), list = (Array.isArray(onto) ? onto : [onto]).filter(Boolean).map(tileOf); if(!a || !list.length) return Promise.resolve();
  return run(opts, (tl, mk)=>{
    const A = centre(a);
    list.forEach((t, i)=>{ const B = centre(t), d = mk('fxc-g', '🤖'); d.style.fontSize = '22px';
      tl.set(d, {x:A.x, y:A.y, xPercent:-50, yPercent:-50, opacity:0}, i*.12).to(d, {opacity:1, duration:.05}, i*.12)
        .to(d, {x:B.x, duration:.45, ease:'power1.inOut'}, i*.12).to(d, {y:Math.min(A.y, B.y) - 50, duration:.2, ease:'power2.out'}, i*.12).to(d, {y:B.y, duration:.25, ease:'power2.in'}, i*.12 + .2)
        .to(d, {scale:1.6, opacity:0, duration:.2}, i*.12 + .45);
      ringAt(tl, mk, i*.12 + .45, B.x, B.y, {from:10, to:B.w*1.4, color:'#ffd34a', width:2, dur:.4}); });
    tl.add(()=> snd('gadget'), 0);
  });
};

// ======================================================================================================================
// 5. GAME HOOKS (2026-10-15). Battle events arrive through M.onEvent (fxBatchVfx); deaths through hooks.deathLook (one
//    line in deathVfx); castle speech through hooks.castleSpeech (one line in maybeSpeakHQ). Nothing here waits or blocks.
// ======================================================================================================================
// What last hurt each unit, in the terms of the death looks above (the game's own lastHurtBy only knows damage types).
const EXILED = new Set(), PETRI = new Set(), CAUSE = new Map(), LASTDMG = new Map(), WAKE = new Map(), CASTLE_SHOT = new Map(), LEADERS = new Map(), PLAYS = [], TAGS = [];
let SEQ = 0, MATCH = null, BOSSLEFT = 0;
function resetFor(m){ if(m === MATCH) return; MATCH = m; [CAUSE, LASTDMG, WAKE, CASTLE_SHOT, LEADERS, PETRI, EXILED].forEach(x=> x.clear()); PLAYS.length = 0; TAGS.length = 0; SEQ = 0; }
const setCause = (uid, cause, sub)=>{ if(uid != null) CAUSE.set(String(uid), {cause, sub:sub || null}); };
const dropCause = uid=>{ if(uid != null) CAUSE.delete(String(uid)); };
const speedOf = env=> Math.max(1, (env && env.match && env.match.speedMult) || 1);
const hqEl = side=> document.querySelector(`[data-hq="${side}"]`);
const defOf = (env, id)=> (env && env.defs && env.defs[id]) || {};
const archOf = d=> [].concat(d.archetypes || [], d.species || []);
const isStructureDef = d=> archOf(d).includes('Structure') || d.type === 'Structure';
// A source that hurts several units through ordinary hit events (Avalanche, Tsunami, Explode, Dynamite): hits from that
// attacker in the next few events carry its look.
function tag(attUid, cause, sub, n){ if(attUid == null) return; TAGS.push({attUid:String(attUid), cause, sub, until:SEQ + (n || 8)}); while(TAGS.length > 12) TAGS.shift(); }
function tagFor(attUid){ if(attUid == null) return null; for(let i = TAGS.length - 1; i >= 0; i--){ const t = TAGS[i]; if(t.attUid === String(attUid) && t.until >= SEQ) return t; } return null; }
const DMG_CAUSE = {shock:'lightning', magic:'magic', true:'true', acid:'acid', decay:'decay', psychic:'psychic', water:'water', curse:'curse', radiation:'irradiation'};
function classifyHit(ev){
  const u = ev.targetUid; if(u == null) return;
  if(ev.dmg > 0) LASTDMG.set(String(u), ev.dmg);
  const tg = tagFor(ev.attUid), dt = ev.dmgType || 'physical';
  if(ev.dragonLightning) return setCause(u, 'lightning', 'dragon');
  if(ev.electricity || dt === 'shock') return setCause(u, 'lightning', 'shock');
  if(ev.quake) return setCause(u, 'crushed', 'quake');
  if(ev.meteor && !ev.splash) return setCause(u, 'crushed', 'meteor');
  if(tg) return setCause(u, tg.cause, tg.sub);
  if(DMG_CAUSE[dt]) return setCause(u, DMG_CAUSE[dt]);
  dropCause(u); // physical, heat, cold, poison, bleed: the game's own looks (fall, burn, shatter, drips, bleed-out)
}
const TICKS = new Set(['poisonTick', 'bleedTick', 'decayTick', 'witherTick', 'curseTick', 'irradiation', 'meteorBurn', 'fieldTick']);
function trackCause(ev){
  if(TICKS.has(ev.type) && ev.uid != null) LASTDMG.delete(String(ev.uid)); // the KO stamp is for blows, not for ticks
  switch(ev.type){
    case 'hit': classifyHit(ev); break;
    case 'poisonTick': case 'bleedTick': case 'meteorBurn': dropCause(ev.uid); break;
    case 'decayTick': setCause(ev.uid, 'decay'); break;
    case 'witherTick': setCause(ev.uid, 'wither'); break;
    case 'curseTick': setCause(ev.uid, 'curse'); break;
    case 'irradiation': setCause(ev.uid, 'irradiation'); break;
    case 'psychic': if(ev.dmg > 0) setCause(ev.targetUid, 'psychic'); break;
    case 'wash': if(ev.dmg > 0 || ev.tsunami) setCause(ev.targetUid, 'water'); break;
    case 'tsunami': tag(ev.attUid, 'water', 'tsunami', (ev.hits||[]).length*2 + 4); (ev.hits||[]).forEach(u=> setCause(u, 'water')); break;
    case 'avalanche': tag(ev.attUid, 'crushed', 'snow', (ev.hits||[]).length*3 + 4); (ev.hits||[]).forEach(u=> setCause(u, 'crushed', 'snow')); break;
    case 'explode': tag(ev.uid, 'explode', null, 6); setCause(ev.targetUid, 'explode'); break;
    case 'dynamite': tag(ev.uid, 'explode', null, (ev.hits||3)*2 + 4); break;
    case 'fieldTick':
      if(ev.field === 'petrify') PETRI.add(String(ev.uid)); // the replay's card copies don't carry petrified, so remember it here
      else if(ev.field === 'irradiated') setCause(ev.uid, 'irradiation');
      else if(ev.field === 'comet') setCause(ev.uid, 'crushed', 'meteor');
      else if(ev.dmg > 0) dropCause(ev.uid);
      break;
    case 'sacrifice': setCause(ev.uid, 'sacrificed'); break;
    case 'death': if(ev.nullified || ev.exiled) EXILED.add(String(ev.uid)); break; // 2026-10-15: unmade, not fallen (deathExile)
    case 'statusEnd': if(ev.status === 'petrified') PETRI.delete(String(ev.uid)); break;
    case 'statusFx': if(ev.kind === 'sacrificed' && !ev.fromHand) setCause(ev.targetUid, 'sacrificed'); break;
  }
}
// The cause looks: A is what plays in a fight; the lab shows the rest.
const DEATH_BY = {lightning:'deathLightning', magic:'deathMagic', psychic:'deathPsychic', wither:'deathWither', irradiation:'deathIrradiation', water:'deathWater',
  crushed:'deathCrushed', explode:'deathExplode', petrified:'deathPetrified', curse:'deathCurse', true:'deathTrue', acid:'deathAcid', decay:'deathDecay', sacrificed:'deathSacrificed'};
M.DEATH_BY = DEATH_BY;
// Which special look a dying unit gets (pure: reads the element, its def and the cause map). Returns {look, sub, addons}.
M.deathPlan = function(el, uid, env){
  const b = boardOf(el), defId = b && b.getAttribute('data-defid'), d = defOf(env, defId), cz = CAUSE.get(String(uid)) || null, m = env && env.match;
  const plan = {look:null, sub:null, addons:[]};
  const token = !!(d.token || (b && b.classList.contains('is-token')));
  const boss = M.isBoss(uid, d, env);
  if(boss) plan.look = 'bossDeath';
  else if(!token){
    if(EXILED.has(String(uid))) plan.look = 'deathExile';
    else if(d.hatchInto) plan.look = 'deathEgg';
    else if((b && b.classList.contains('is-petrified')) || PETRI.has(String(uid))) plan.look = 'deathPetrified';
    else if(cz && DEATH_BY[cz.cause]) { plan.look = DEATH_BY[cz.cause]; plan.sub = cz.sub; if(cz.cause === 'crushed' && cz.sub === 'snow') plan.look = 'deathCrushed_B'; }
    else if(isStructureDef(d)) plan.look = 'deathStructure';
  }
  if(!boss){
    const leader = (b && b.classList.contains('is-leader')) || (m && String(m.leaderUid) === String(uid)) || LEADERS.has(String(uid)) || archOf(d).includes('King');
    if(leader){ if(!plan.look && !token) plan.look = 'kingFall'; else plan.addons.push('leaderFall'); }
    // 2026-10-17 (user: "Foil treatment of shiny death: There is a sheen that spawns out then fades out on death. I think don't do this for
    // shinies. Idk if you do this for foils - but i think is not needed also. But this effect is nice for like - prism related deaths
    // (skills relating to light or rainbows. add that btw - and save this effect)"): shiny and foil units die like anyone else now; the
    // sheen is the Prism death, for a unit with a light or rainbow skill (PRISM_SKILLS).
    if(isPrismDef(d)) plan.addons.push('deathPrism');
    // 2026-10-16 (user: "For killing blows, no need to put the additiona - N X"): the "−N ✖" stamp is gone. A killer with an on-kill
    // trigger gets its own ✖ that flies into it instead (arena_app.js, killMarkVfx). M.lethalStamp stays for the Effects Lab.
  }
  return plan;
};
// A boss: a def flagged boss/world boss, the raid boss, or the enemy leader of a boss node.
M.isBoss = function(uid, d, env){
  d = d || {}; const m = env && env.match; if(d.boss || d.worldBoss || d.supreme) return true;
  const kind = m && m.conquestNode && m.conquestNode.kind;
  const lead = LEADERS.get(String(uid));
  return !!(lead && lead.side === 'B' && /boss/.test(String(kind || '')));
};
M.hooks.deathLook = function(el, info, env){
  if(!el || !info || !env.fxAtLeast('med')) return;
  resetFor(env.match);
  const plan = M.deathPlan(el, info.uid, env), o = {speed:speedOf(env)};
  if(plan.look && typeof M[plan.look] === 'function'){
    info.handled = true;
    if(plan.look === 'bossDeath'){ const m = env.match, n = m && m.conquestNode; try{ if(typeof noteMatchFx === 'function') noteMatchFx(2300); }catch(e){}
      M.bossDeath(el, Object.assign(o, {host:env.battlefield, name:(n && n.name) || (defOf(env, boardOf(el).getAttribute('data-defid')).name) || '', kicker:(n && /final/.test(n.kind || '')) ? 'Final boss' : 'Boss', speed:1})); }
    else if(plan.look === 'kingFall'){ const d = defOf(env, boardOf(el).getAttribute('data-defid')); M.kingFall(el, Object.assign(o, {title:archOf(d).includes('King') ? 'King' : 'Leader'})); }
    else M[plan.look](el, o);
  }
  plan.addons.forEach(a=>{ if(a === 'lethalStamp') M.lethalStamp(el, Object.assign({}, o, {dmg:LASTDMG.get(String(info.uid))})); else if(typeof M[a] === 'function') M[a](el, o); });
  CAUSE.delete(String(info.uid)); LASTDMG.delete(String(info.uid));
};
// The spawn portal (SkillFX.summonPortal in the game's own pass) is skipped for the kinds this batch draws itself.
M.ownsSpawn = function(ev){
  try{ if(isReduced() || (typeof fxAtLeast === 'function' && !fxAtLeast('med'))) return false; }catch(e){ return false; }
  return !!(ev && ev.type === 'spawn' && (ev.kind === 'meiosis' || ev.kind === 'twin' || ev.kind === 'sprout'));
};
// maybeSpeakHQ: fxHook('castleSpeech', el, line, h) before its own bubble; setting h.handled replaces the units' bubble.
// Defeat: your own castle shudders and sinks into the ground (SkillFX.castleCrumble 'sink', the lab's castle-crumble-variants B).
// arena_app awaits info.wait before the end sign, like the enemy castle's crumble.
M.hooks.castleFallMine = function(el, info, env){
  if(!el || !info || !env.fxAtLeast('med') || !(root.SkillFX && SkillFX.castleCrumble)) return;
  try{ SkillFX.castleCrumble(el, {variant:'sink', restore:false}); snd('castleCollapse'); info.wait = 1500; }catch(e){}
};
M.hooks.castleSpeech = function(el, text, info, env){ if(!env || !env.fxAtLeast('med') || !info) return; info.handled = true; M.castleSpeech(el, text); };
const SKIP_OWN = new Set(['frozen', 'asleep', 'paralyzed', 'stunned', 'chained', 'petrified', 'shell', 'ritual', 'zeroAttack']);
M.onEvent = function(ev, env){
  resetFor(env.match); SEQ++;
  trackCause(ev);
  if(!env.fxAtLeast('med')) return;
  const o = {speed:speedOf(env)}, el = env.el, at = env.at;
  switch(ev.type){
    case 'statusEnd': {
      if(ev.woke){ WAKE.set(String(ev.uid), true); at(450, ()=>{ if(WAKE.get(String(ev.uid))){ WAKE.delete(String(ev.uid)); const e = el(ev.uid); if(e) M.wakeJolt(e, o); } }); break; }
      const e = el(ev.uid);
      // 2026-10-17 (user: "If there's no more exposure left, it fades as it magnifies!"): FX.D already faded / magnified the crosshair away
      // the moment its last counter went, so the round-end "wears off" doesn't play a second one.
      if(ev.status === 'exposed' && e){ const tl = e.querySelector('.card-tile') || e; if(tl.dataset && tl.dataset.fxdExposeLeft){ delete tl.dataset.fxdExposeLeft; break; } }
      if(e && STATUS_END[ev.status]) M.statusEnd(e, ev.status, o); break; }
    case 'skipTurn': if(SKIP_OWN.has(ev.reason)){ const e = el(ev.uid); if(e) M.lostTurn(e, ev.reason, o); } break;
    case 'hit': {
      const u = ev.targetUid;
      if(u != null && WAKE.get(String(u))){ WAKE.delete(String(u)); at(env.hitAtMs(ev) + 40, ()=>{ const e = el(u); if(e) M.wakeJolt(e, o); }); }
      if(ev.attDefId === 'castle' && u != null && CASTLE_SHOT.has(String(u))){ const kind = CASTLE_SHOT.get(String(u)); CASTLE_SHOT.delete(String(u));
        const land = env.hitAtMs(ev), fl = Math.min(land, kind === 'bane' ? 330 : 260); // 2026-10-16: the brew flies faster (was 420)
        // the castle and the target are looked up when the throw starts, so a re-render in between can't strand it
        if(hqEl(ev.side) && el(u)) at(Math.max(0, land - fl), ()=>{ const c2 = hqEl(ev.side), t2 = el(u); if(!t2 || !c2) return; kind === 'bane' ? M.castleHerbBane(c2, t2, {flight:fl}) : M.castleBolt(c2, t2, {flight:fl}); }); }
      break; }
    case 'hitHQ': {
      const c = hqEl(ev.targetSide); if(!c) break; const land = env.hitAtMs(ev);
      if(ev.friendly) at(land, ()=> M.castleOops(c, o));
      const sh = c.querySelector('.castle-shield'); if(sh && !sh.classList.contains('is-broken')) at(land, ()=>{ const s2 = c.querySelector('.castle-shield'); M.castleShield(c, Object.assign({}, o, {fromBelow:ev.targetSide === 'B' ? false : true, broken:!!(s2 && s2.classList.contains('is-broken'))})); });
      break; }
    case 'castleRegen': { const c = hqEl(ev.side); if(c) M.castleRegen(c, Object.assign({}, o, {amount:ev.amount, perk:ev.perk})); break; }
    case 'lumber': if(ev.castle || ev.perk){ const c = hqEl(ev.side); if(c) M.castleLumber(c, Object.assign({}, o, {perk:ev.perk, dest:ev.side === 'A' ? (document.getElementById('hudLumberPill') || document.getElementById('fieldResMine')) : null})); } break;
    case 'statusFx':
      if(ev.kind === 'castleBolt') CASTLE_SHOT.set(String(ev.targetUid), 'bolt');
      else if(ev.kind === 'herbBane') CASTLE_SHOT.set(String(ev.targetUid), 'bane');
      else if(ev.kind === 'castleThorns'){ const c = hqEl(ev.side), t = el(ev.targetUid); if(c && t) M.castleThorns(c, t, o); }
      else if(ev.kind === 'herbHeal'){ const c = hqEl(ev.side), t = el(ev.targetUid); if(c && t) M.castleHerbHeal(c, t, o); }
      else if(ev.kind === 'logjam'){ at(380, ()=>{ const t = el(ev.targetUid); if(t) M.logjam(t, Object.assign({}, o, {amount:ev.amount})); }); }
      else if(ev.kind === 'castleSpawn'){ const c = hqEl(ev.side); if(c){ M.castleGate(c, o);
        const mine = PLAYS.filter(p=> p.side === ev.side && p.defId === ev.targetDefId && SEQ - p.seq < 12).slice(-(ev.amount || 1));
        mine.forEach((p, i)=> at(250 + i*120, ()=>{ const u = el(p.uid); if(u) M.marchOut(c, u, o); })); } }
      break;
    case 'sacrifice': { const e = el(ev.uid); if(e) M.devilryCrack(e, o); break; }
    case 'play': {
      PLAYS.push({uid:ev.uid, side:ev.side, defId:ev.defId, seq:SEQ}); while(PLAYS.length > 16) PLAYS.shift();
      if(ev.leader) LEADERS.set(String(ev.uid), {side:ev.side, gladiator:!!ev.gladiator});
      const d = defOf(env, ev.defId);
      if(ev.leader && ev.gladiator) at(120, ()=>{ const e = el(ev.uid); if(e) M.gladiatorSand(e, o); });
      else if(ev.leader) at(40, ()=>{ const b = document.querySelector('.leader-callout'); if(b) M.bannerUnfurl(b, o); });
      else if(ev.reserve) at(200, ()=>{ const e = el(ev.uid); if(e) M.reserveIn(e, o); });
      else if(ev.side === 'B' && !ev.leader) at(30, ()=>{ const e = el(ev.uid); if(e) M.enemyCardFlip(e, o); });
      if(isStructureDef(d) && !ev.leader) at(260, ()=>{ const e = el(ev.uid); if(e) (archOf(d).includes('Ants') || archOf(d).includes('Insect') ? M.structureBuild_B : M.structureBuild)(e, o); });
      if(d.effects && d.effects.skyfall && root.SkillFX && SkillFX.skyDrop) at(60, ()=>{ const e = el(ev.uid); if(e) SkillFX.skyDrop([e], {fall:420}); });
      if(d.hatchInto) at(500, ()=>{ const e = el(ev.uid); if(e) M.eggWobble(e, Object.assign({}, o, {progress:0})); });
      break; }
    case 'advance': at(120, ()=>{ const e = el(ev.uid); if(e) M.stepUp(e, o); }); break;
    case 'waitTick': { const d = defOf(env, ev.defId); if(d.hatchInto){ const W = Math.max(1, Number(d.wait) || 3); at(60, ()=>{ const e = el(ev.uid); if(e) M.eggWobble(e, Object.assign({}, o, {progress:1 - (ev.waitRemaining || 0)/W})); }); } break; }
    case 'spawn': {
      const uids = (ev.uids || (ev.placements || []).map(p=> p.uid) || []).slice(0, 4);
      if(ev.kind === 'meiosis'){ const from = el(ev.fromUid || ev.nearUid); const xy = from ? centre(tileOf(from)) : null; at(140, ()=> M.meiosisSplit(xy, uids.map(u=> el(u)), o)); }
      else if(ev.kind === 'twin') at(140, ()=>{ const s = el(ev.nearUid), t = el(uids[0]); if(s && t) M.twinPeel(s, t, o); });
      else if(ev.kind === 'sprout') at(120, ()=> uids.forEach((u, i)=> at(i*80, ()=>{ const t = el(u); if(t) M.sproutPop(t, o); })));
      const d = defOf(env, ev.defId); if(d.effects && d.effects.skyfall && root.SkillFX && SkillFX.skyDrop) at(60, ()=>{ const es = uids.map(u=> el(u)).filter(Boolean); if(es.length) SkillFX.skyDrop(es, {fall:420}); });
      break; }
    case 'mindControl': at(560, ()=>{ const e = el(ev.targetUid); if(e) M.mindArrive(e, o); }); break;
    case 'remember': if(ev.uid != null) at(80, ()=>{ const e = el(ev.uid); if(e) M.rememberRise(e, o); }); break;
  }
};

})(typeof window !== 'undefined' ? window : globalThis);
