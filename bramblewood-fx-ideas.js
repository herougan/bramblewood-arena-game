/* ============================================================
   Bramblewood FX, ideas for the owner to judge (2026-10-21, package LAB2)
   Owner: "I also like a lot of the existing effects. I don't mind spending some time here to add more effects for me to judge."

   Twenty-nine candidate effects on window.IdeasFX. NOTHING in the game calls them: they are shown in the Effects Lab (tab "Ideas 10-21",
   tools/effects-lab/fxlab-ideas.js) with a "Lab only (not used yet)" badge, a few variants each, and the owner picks which to wire
   (docs/effects-catalogue.md, "Ideas 10-21").

   Hits        hitFire hitIce hitAcid hitPoison hitDecay hitMagic hitWater hitStone hitMetal hitLightning   (one per element, 3 looks each)
   Auras       elementAura                                                       (subtle idle "attacks with X" look for all ten elements)
   Titles      crowning gilding veteranStripes championLaurel
   Evolve      cocoonBurst helixSwirl moltShed
   Sky         dawnBreak duskGlow moonrise rainStart snowfall
   Status      stenchStatus brittleStatus exposedStatus                           (apply and expire)
   Raid        shieldCrack slamWarning raidFalls

   Contract (same as bramblewood-fx-war.js, docs/effects-lab-contract.md)
   - IdeasFX.name(target, opts) -> Promise. A target is a board card or tile (element), a list of elements, or a point {x, y, w?, h?} in
     viewport pixels. opts.v picks the look (0, 1, 2). Every effect honours opts.onImpact and opts.onDone and never reads or changes game state.
   - Overlays are fixed-position nodes on <body> (class fxi-*), removed when their tween ends. IdeasFX.clear() drops everything at once.
   - House style: bubbly, obvious, cute; no gore. Cartoon blobs with a lit edge, never blur or blend layers.
   - Performance: no CSS filter, no mix-blend-mode, no full-screen layer (the sky effects cover the field's own box only). At most ~40 nodes
     alive at once; all motion is transform and opacity, driven by one GSAP tween per group; the idle aura updates at 30 fps at most.
   - prefers-reduced-motion: one still glyph that fades in and out (about 0.7 s), no movement, and onImpact / onDone still fire.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const W = root.IdeasFX = root.IdeasFX || {};

// ---- helpers (same recipes as bramblewood-fx-war.js) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const D2R = Math.PI/180;
const rnd = (a, b)=> a + Math.random()*(b - a);
const pick = a=> a[Math.floor(Math.random()*a.length)];
const clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
const call = fn=>{ try{ fn && fn(); }catch(e){} };
const tileOf = el=> (el && el.classList && el.classList.contains('board-card') && el.querySelector('.card-tile')) || el;
const eout = u=> 1 - (1 - u)*(1 - u), ein = u=> u*u, eio = u=> u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
const NODES = new Set(), TWEENS = new Set();
function node(cls, w, h, parent){
  injectCss();
  const e = document.createElement('div'); e.className = 'fxi ' + cls; e.setAttribute('aria-hidden', 'true'); e.style.opacity = '0';
  if(w){ e.style.width = w + 'px'; e.style.height = (h || w) + 'px'; }
  (parent || document.body).appendChild(e); if(!parent) NODES.add(e); return e;
}
const kill = e=>{ if(e){ NODES.delete(e); if(e.parentNode) e.remove(); } };
function put(e, x, y, o){
  o = o || {};
  e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) rotate(${(o.r || 0).toFixed(1)}deg) scale(${(o.sx != null ? o.sx : (o.s != null ? o.s : 1)).toFixed(3)},${(o.sy != null ? o.sy : (o.s != null ? o.s : 1)).toFixed(3)})`;
  e.style.opacity = o.op == null ? 1 : clamp(o.op, 0, 1).toFixed(3);
}
function run(dur, fn, o){
  o = o || {}; const g = G();
  return new Promise(res=>{
    if(!g){ call(()=> fn(1)); res(); return; }
    const st = {t:0};
    const tw = g.to(st, {t:1, duration:Math.max(.016, dur), delay:o.delay || 0, ease:'none', onUpdate:()=> call(()=> fn(st.t)),
      onComplete:()=>{ call(()=> fn(1)); TWEENS.delete(tw); res(); }, onInterrupt:()=>{ TWEENS.delete(tw); res(); }});
    TWEENS.add(tw);
  });
}
const fin = o=>{ call(o && o.onDone); }, finish = o=> ()=> fin(o);
const none = o=>{ call(o && o.onImpact); fin(o); return Promise.resolve(); };
const wait = s=> run(s, ()=>{});
function boxOf(t){
  if(!t) return null;
  if(Array.isArray(t) || (!t.nodeType && typeof t.length === 'number' && typeof t !== 'string')){
    const bs = [...t].filter(Boolean).map(boxOf).filter(Boolean); if(!bs.length) return null;
    const l = Math.min(...bs.map(b=> b.l)), tp = Math.min(...bs.map(b=> b.t)), r = Math.max(...bs.map(b=> b.r)), bt = Math.max(...bs.map(b=> b.b));
    return {x:(l + r)/2, y:(tp + bt)/2, w:r - l, h:bt - tp, l, t:tp, r, b:bt};
  }
  if(t.nodeType){ const e = tileOf(t), r = e.getBoundingClientRect(); if(!r.width && !r.height) return null; return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, l:r.left, t:r.top, r:r.right, b:r.bottom}; }
  if(typeof t.x === 'number' && typeof t.y === 'number'){ const w = t.w || 0, h = t.h || 0; return {x:t.x, y:t.y, w, h, l:t.x - w/2, t:t.y - h/2, r:t.x + w/2, b:t.y + h/2}; }
  return null;
}
function jolt(t, dx, dy, k){
  const g = G(); if(!g || RM() || !t) return; const e = tileOf(t); if(!e || !e.nodeType) return; k = k || 1;
  g.timeline().to(e, {x:dx, y:dy, rotation:dx*.5, scaleX:1 + .05*k, scaleY:1 - .07*k, duration:.06, ease:'power2.out'})
    .to(e, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, duration:.42, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
}
function shake(host, amp){
  const g = G(); if(!g || RM() || !host || !host.nodeType) return; amp = amp || 5;
  g.timeline({onComplete:()=> g.set(host, {clearProps:'transform'})}).to(host, {x:amp, y:-amp*.5, duration:.04}).to(host, {x:-amp*.8, y:amp*.4, duration:.05}).to(host, {x:amp*.4, duration:.05}).to(host, {x:0, y:0, duration:.08});
}
function hop(t, h){
  const g = G(); if(!g || RM() || !t) return; const e = tileOf(t); if(!e || !e.nodeType) return;
  g.timeline().to(e, {y:-(h || 8), scaleY:1.04, duration:.1, ease:'power2.out'}).to(e, {y:0, scaleY:1, duration:.34, ease:'bounce.out', clearProps:'transform'});
}

// ---- CSS ----
const SVG = s=> 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
const FLAME_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 52'><defs><linearGradient id='g' x1='0' y1='1' x2='0' y2='0'><stop offset='0' stop-color='#e2411b'/><stop offset='.55' stop-color='#ff9a22'/><stop offset='1' stop-color='#ffe27a'/></linearGradient></defs><path d='M20 2 C24 14 36 22 36 36 C36 46 28 51 20 51 C12 51 4 46 4 36 C4 28 10 24 12 16 C16 20 17 22 18 24 C19 16 18 9 20 2 Z' fill='url(#g)' stroke='#b02a12' stroke-width='1.6' stroke-linejoin='round'/></svg>`);
const STAR_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100'><path d='M0 -48 L9 -12 L46 -14 L16 5 L30 42 L0 20 L-30 42 L-16 5 L-46 -14 L-9 -12 Z' fill='#fff6b8' stroke='#ffb52a' stroke-width='4' stroke-linejoin='round'/></svg>`);
const TENT_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 130'><path d='M18 130 C6 92 52 82 30 46 C20 28 32 12 40 3 C50 16 46 32 41 48 C28 84 62 96 44 130 Z' fill='#7a3fb0' stroke='#3e1c63' stroke-width='3' stroke-linejoin='round'/><g fill='#e6c9ff' stroke='#a77ad4' stroke-width='1.5'><circle cx='36' cy='28' r='4'/><circle cx='33' cy='46' r='4.4'/><circle cx='34' cy='66' r='4.8'/><circle cx='39' cy='88' r='5'/><circle cx='36' cy='108' r='5'/></g></svg>`);
const CSS = `
.fxi{position:fixed; left:0; top:0; pointer-events:none; z-index:1200; will-change:transform, opacity;}
.fxi-disc{border-radius:50%;}
.fxi-flame{background:${FLAME_URI} center bottom/contain no-repeat;}
.fxi-star{background:${STAR_URI} center/contain no-repeat;}
.fxi-tent{background:${TENT_URI} center bottom/contain no-repeat;}
.fxi-ember{border-radius:50%; background:radial-gradient(circle, #fff3b0 0, #ffb03a 55%, #ff6a1e 100%); box-shadow:0 0 5px 1px rgba(255,150,40,.7);}
.fxi-fireblob{border-radius:50%; background:radial-gradient(circle at 40% 36%, #fff6b8 0, #ffd23d 28%, #ff8a1e 60%, #e2411b 100%);}
.fxi-shard{background:linear-gradient(135deg, #ffffff, #b6ecff 48%, #4cb4f0); clip-path:polygon(50% 0, 100% 38%, 62% 100%, 32% 70%, 0 34%); box-shadow:0 0 0 1px #fff;}
.fxi-icicle{background:linear-gradient(90deg, #e9fbff, #9bdcff 55%, #4aa9e6); clip-path:polygon(0 0, 100% 0, 50% 100%);}
.fxi-drop{border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 34% 30%, var(--d0,#fff) 0, var(--d1,#7ee34a) 45%, var(--d2,#3f9a22) 100%); box-shadow:inset -2px -3px 0 rgba(0,0,0,.16);}
.fxi-bubble{border-radius:50%; border:2px solid rgba(255,255,255,.85); background:radial-gradient(circle at 30% 28%, rgba(255,255,255,.95) 0 12%, var(--b,rgba(160,220,255,.4)) 42%, rgba(255,255,255,.14) 100%); box-sizing:border-box;}
.fxi-smoke{border-radius:50%; background:radial-gradient(circle at 36% 30%, var(--w0,#e7c9ff) 0, var(--w1,#a56be0) 46%, var(--w2,#5e2f95) 100%); box-shadow:inset -3px -4px 0 rgba(20,0,40,.25);}
.fxi-soft{border-radius:50%; background:radial-gradient(circle, var(--s0,rgba(236,240,246,.95)) 0, var(--s1,rgba(210,216,226,.7)) 48%, rgba(190,198,210,0) 72%);}
.fxi-rock{border-radius:46% 54% 50% 50% / 56% 48% 52% 44%; background:radial-gradient(circle at 34% 30%, #cfc6b4 0, #9a917e 40%, #5d5648 100%); box-shadow:inset -3px -4px 0 rgba(30,24,14,.3), 0 2px 4px rgba(0,0,0,.35);}
.fxi-crumb{border-radius:30%; background:radial-gradient(circle at 34% 30%, #c79a62 0, #8a6234 60%, #5a3d1e 100%);}
.fxi-spark{width:3px; height:15px; border-radius:2px; background:linear-gradient(rgba(255,255,255,0), #ffe27a 45%, #fff 100%);}
.fxi-ring{border-radius:50%; box-sizing:border-box; border:4px solid #fff;}
.fxi-chip{border-radius:2px;}
.fxi-glyph{font-size:34px; line-height:1; text-align:center; white-space:nowrap;}
.fxi-rect{border-radius:12px; box-sizing:border-box;}
.fxi-clip{overflow:hidden; border-radius:12px;} .fxi-clip > i{position:absolute; display:block;}
.fxi-svg{overflow:visible;} .fxi-svg svg{display:block; overflow:visible;}
.fxi-ghost{overflow:hidden; border-radius:12px;} .fxi-ghost > .card-tile{margin:0 !important; transform:none !important; position:relative !important; left:0 !important; top:0 !important;}
.fxi-line{width:2px; height:14px; border-radius:2px; background:linear-gradient(rgba(190,225,255,0), #bfe3ff);}
.fxi-cone{clip-path:polygon(38% 0, 62% 0, 100% 100%, 0 100%); background:linear-gradient(rgba(255,244,180,.7), rgba(255,244,180,0));}
.fxi-ray{clip-path:polygon(46% 0, 54% 0, 100% 100%, 0 100%); background:linear-gradient(rgba(255,236,170,.75), rgba(255,236,170,0));}
.fxi-hex{clip-path:polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%); background:linear-gradient(135deg, #e3f4ff, #7ec3ff 55%, #3d8bea);}
.fxi-banner{background:linear-gradient(#ffd96a, #e0a52a); clip-path:polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%); box-shadow:0 2px 0 rgba(0,0,0,.2);}
`;
function injectCss(){
  if(document.getElementById('fx-ideas-style')) return;
  const s = document.createElement('style'); s.id = 'fx-ideas-style'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
}

// ---- building blocks ----
function particles(x, y, o){
  o = o || {}; injectCss(); const n = o.n || 8, dur = o.dur || .7, ps = [];
  for(let i = 0; i < n; i++){
    const a = rnd(o.a0 == null ? 0 : o.a0, o.a1 == null ? 360 : o.a1)*D2R, d = rnd(o.d0 == null ? 20 : o.d0, o.d1 == null ? 60 : o.d1);
    const w = typeof o.size === 'function' ? o.size(i) : (o.size || 8), h = typeof o.h === 'function' ? o.h(i) : (o.h || w);
    const e = node(o.cls || 'fxi-soft', w, h);
    if(o.bg) e.style.background = typeof o.bg === 'function' ? o.bg(i) : o.bg;
    if(o.style) call(()=> o.style(i, e));
    put(e, x, y, {op:0});
    ps.push({e, dx:Math.cos(a)*d, dy:Math.sin(a)*d, r0:o.orient ? a/D2R + 90 : rnd(0, 360), spin:rnd(-1, 1)*(o.spin || 0), delay:rnd(0, o.stagger || 0)/dur, sway:rnd(-1, 1)*(o.sway || 0)});
  }
  const s0 = o.s0 == null ? 1 : o.s0, s1 = o.s1 == null ? 1 : o.s1, fs = o.fadeStart == null ? .45 : o.fadeStart, op = o.op == null ? 1 : o.op;
  return run(dur, t=>{
    ps.forEach(p=>{
      const u = clamp((t - p.delay)/Math.max(.01, 1 - p.delay), 0, 1);
      if(u <= 0){ p.e.style.opacity = 0; return; }
      const k = eout(u), s = s0 + (s1 - s0)*k;
      put(p.e, x + p.dx*k + p.sway*Math.sin(u*6), y + p.dy*k - (o.rise || 0)*k + (o.grav || 0)*u*u, {s, r:p.r0 + p.spin*u, op:(u < fs ? op : op*(1 - (u - fs)/(1 - fs)))});
    });
  }, {delay:o.delay}).then(()=> ps.forEach(p=> kill(p.e)));
}
const glyphStyle = (list, size)=> (i, e)=>{ e.textContent = Array.isArray(list) ? list[i % list.length] : list; e.style.fontSize = (typeof size === 'function' ? size(i) : size || 18) + 'px'; };
function ring(x, y, o){
  o = o || {}; injectCss(); const size = o.size || 90, e = node('fxi-ring', size, size);
  e.style.borderColor = o.color || '#fff'; e.style.borderWidth = (o.w || 4) + 'px'; if(o.glow) e.style.boxShadow = `0 0 ${o.glow}px ${o.color || '#fff'}`;
  return run(o.dur || .45, t=>{ put(e, x, y, {sx:.1 + .9*eout(t), sy:(.1 + .9*eout(t))*(o.sy || 1), op:(o.op == null ? .95 : o.op)*(1 - ein(t))}); }, {delay:o.delay}).then(()=> kill(e));
}
function flash(x, y, size, color, dur){
  injectCss(); const e = node('fxi-disc', size, size); e.style.background = `radial-gradient(circle, #fff 0, ${color || 'rgba(255,238,170,.9)'} 45%, rgba(255,200,80,0) 72%)`;
  return run(dur || .2, t=>{ put(e, x, y, {s:.3 + 1*eout(t), op:1 - ein(t)}); }).then(()=> kill(e));
}
// a rounded tint over the card (its own box, no blend): rises to peak, falls
function tint(b, color, dur, peak, delay){
  injectCss(); const e = node('fxi-rect', b.w, b.h); e.style.background = color;
  return run(dur || .6, t=>{ put(e, b.x, b.y, {op:(peak == null ? .6 : peak)*Math.sin(Math.PI*t)}); }, {delay}).then(()=> kill(e));
}
function glyph(b, ch, size, x, y){ const e = node('fxi-glyph', 0, 0); e.textContent = ch; e.style.width = e.style.height = 'auto'; e.style.fontSize = (size || 34) + 'px'; put(e, x == null ? b.x : x, y == null ? b.y : y, {op:0}); return e; }
function still(b, ch, o){
  injectCss(); call(o && o.onImpact); const e = glyph(b, ch, 34);
  return run(.7, t=>{ put(e, b.x, b.y, {op:t < .25 ? t/.25 : t > .7 ? (1 - t)/.3 : 1}); }).then(()=>{ kill(e); fin(o); });
}
// a zigzag path from a to b (points), as an SVG inside a node sized to its box; returns {e, set(op)}
function zig(a, b, o){
  o = o || {}; injectCss(); const n = o.seg || 7, j = o.jit || 14, pts = [];
  for(let i = 0; i <= n; i++){ const u = i/n, nx = -(b.y - a.y), ny = (b.x - a.x), L = Math.hypot(nx, ny) || 1, k = (i === 0 || i === n) ? 0 : rnd(-j, j);
    pts.push([a.x + (b.x - a.x)*u + nx/L*k, a.y + (b.y - a.y)*u + ny/L*k]); }
  const pad = 12, l = Math.min(...pts.map(p=> p[0])) - pad, t = Math.min(...pts.map(p=> p[1])) - pad, r = Math.max(...pts.map(p=> p[0])) + pad, bt = Math.max(...pts.map(p=> p[1])) + pad;
  const e = node('fxi-svg', r - l, bt - t), d = pts.map((p, i)=> (i ? 'L' : 'M') + (p[0] - l).toFixed(1) + ' ' + (p[1] - t).toFixed(1)).join(' ');
  const col = o.color || '#ffe94a';
  e.innerHTML = `<svg width='${r - l}' height='${bt - t}' viewBox='0 0 ${r - l} ${bt - t}'><path d='${d}' fill='none' stroke='#fff6' stroke-width='${(o.w || 4) + 5}' stroke-linecap='round' stroke-linejoin='round'/><path d='${d}' fill='none' stroke='${col}' stroke-width='${o.w || 4}' stroke-linecap='round' stroke-linejoin='round'/><path d='${d}' fill='none' stroke='#fff' stroke-width='${Math.max(1.5, (o.w || 4)/2.4)}' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  return {e, cx:(l + r)/2, cy:(t + bt)/2};
}
// a small svg node: markup in its own viewBox, placed by centre
function svgNode(w, h, vb, markup){ injectCss(); const e = node('fxi-svg', w, h); e.innerHTML = `<svg width='${w}' height='${h}' viewBox='${vb}'>${markup}</svg>`; return e; }
const sinPulse = t=> Math.sin(Math.PI*clamp(t, 0, 1));

// =====================================================================================
// HITS: one per element (target = the unit that is hit, o.from = the attacker for the ones that travel)
// =====================================================================================
const hitHead = (t, o, ch)=>{ const b = boxOf(t); if(!b) return [null, none(o)]; if(RM()) return [null, still(b, ch, o)]; injectCss(); return [b, null]; };

// 1. hitFire: v0 flame lick (three flames rise off the card), v1 ember shower, v2 fireball pop.
W.hitFire = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '🔥'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ flash(b.x, b.y, b.w*1.1, 'rgba(255,160,50,.8)', .2); jolt(t, 0, -3, .8);
    return particles(b.x, b.t + b.h*.3, {n:16, cls:'fxi-ember', size:()=> rnd(5, 9), a0:230, a1:310, d0:30, d1:b.h*.9, grav:34, s0:1, s1:.4, dur:.95, fadeStart:.4, stagger:.25}).then(finish(o)); }
  if(v === 2){ const e = node('fxi-fireblob', b.w*1.1, b.w*1.1); ring(b.x, b.y, {size:b.w*1.9, color:'#ff9a22', w:4, dur:.45, glow:8}); jolt(t, 3, -2, 1.2);
    particles(b.x, b.y, {n:7, cls:'fxi-flame', size:()=> b.w*.34, h:()=> b.w*.44, d0:b.w*.35, d1:b.w*.8, rise:12, s0:.5, s1:1.1, dur:.7, fadeStart:.4});
    return run(.4, u=>{ put(e, b.x, b.y, {s:.3 + 1.1*eout(u), op:1 - ein(u)}); }).then(()=>{ kill(e); fin(o); }); }
  flash(b.x, b.y, b.w*1.2, 'rgba(255,150,40,.85)', .22); jolt(t, 0, -3, .8);
  const fl = [-1, 0, 1].map(k=>{ const e = node('fxi-flame', b.w*.42, b.w*.54); return {e, k}; });
  particles(b.x, b.b - 4, {n:8, cls:'fxi-ember', size:6, a0:240, a1:300, d0:20, d1:b.h*.6, grav:20, dur:.8, fadeStart:.4});
  return run(.8, u=>{ fl.forEach(f=>{ const d = clamp(u*1.2 - (f.k === 0 ? 0 : .12), 0, 1); put(f.e, b.x + f.k*b.w*.28, b.b - b.h*.1 - b.h*.55*eout(d), {s:.5 + .7*sinPulse(d)*(f.k === 0 ? 1.15 : .9), r:f.k*6*Math.sin(u*14), op:Math.min(1, d*4)*(1 - ein(d))}); }); }).then(()=>{ fl.forEach(f=> kill(f.e)); fin(o); });
};

// 2. hitIce: v0 shard burst with a snowflake, v1 frost over the card, v2 icicles drop.
W.hitIce = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '❄️'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ jolt(t, 0, 0, .5); tint(b, 'linear-gradient(160deg, rgba(235,250,255,.95), rgba(150,215,255,.6))', .9, .85);
    ring(b.x, b.y, {size:b.w*1.6, color:'#cfefff', w:3, dur:.5});
    return particles(b.x, b.y, {n:8, cls:'fxi-star', size:()=> rnd(10, 16), d0:b.w*.3, d1:b.w*.75, s0:.4, s1:1, dur:.8, fadeStart:.35, spin:200}).then(finish(o)); }
  if(v === 2){ const xs = [-.3, .05, .32]; let n = 0;
    return Promise.all(xs.map((k, i)=>{ const e = node('fxi-icicle', 14, 40), x = b.x + k*b.w; put(e, x, b.t - 90, {op:0});
      return run(.34, u=> put(e, x, b.t - 90 + (b.y - (b.t - 90))*ein(u), {op:u > .02 ? 1 : 0, s:1 + .0*u}), {delay:i*.12}).then(()=>{ kill(e); n++; ring(x, b.y, {size:b.w*.9, color:'#cfefff', w:3, dur:.4}); jolt(t, 0, 2, .7);
        return particles(x, b.y, {n:5, cls:'fxi-shard', size:9, h:12, d0:14, d1:b.w*.5, grav:30, orient:true, dur:.6}); }); })).then(finish(o)); }
  ring(b.x, b.y, {size:b.w*1.8, color:'#bfeaff', w:4, dur:.45, glow:8}); jolt(t, 0, 0, 1);
  const f = glyph(b, '❄️', b.w*.7); run(.7, u=> put(f, b.x, b.y, {s:.4 + .9*eout(u), r:120*u, op:1 - ein(u)})).then(()=> kill(f));
  return particles(b.x, b.y, {n:10, cls:'fxi-shard', size:()=> rnd(10, 14), h:()=> rnd(16, 22), orient:true, d0:b.w*.35, d1:b.w*.9, dur:.75, fadeStart:.4, spin:120}).then(finish(o));
};

// 3. hitAcid: v0 splat, v1 sizzle bubbles, v2 drip down the card.
W.hitAcid = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '🧪'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  const green = (i, e)=>{ e.style.setProperty('--d1', ['#7ee34a', '#9cf06a', '#5fcf3a'][i % 3]); };
  if(v === 1){ jolt(t, 0, 0, .5); tint(b, 'rgba(120,230,70,.5)', .8, .8);
    return particles(b.x, b.y + b.h*.2, {n:9, cls:'fxi-bubble', size:()=> rnd(8, 16), style:(i, e)=> e.style.setProperty('--b', 'rgba(150,240,90,.45)'), a0:250, a1:290, d0:b.h*.25, d1:b.h*.7, sway:8, s0:.5, s1:1.15, dur:1.0, fadeStart:.6, stagger:.4}).then(finish(o)); }
  if(v === 2){ const xs = [-.3, -.05, .2, .38];
    flash(b.x, b.t + 8, b.w*.9, 'rgba(160,240,100,.8)', .2); jolt(t, 0, 2, .8);
    return Promise.all(xs.map((k, i)=>{ const e = node('fxi-drop', 12, 17); green(i, e); const x = b.x + k*b.w;
      return run(.9, u=> put(e, x, b.t + 8 + b.h*.7*ein(u), {sy:1 + 1.3*sinPulse(u)*.6, sx:1 - .2*sinPulse(u), op:u > .02 ? 1 - ein(u) : 0}), {delay:i*.09}).then(()=> kill(e)); })).then(finish(o)); }
  flash(b.x, b.y, b.w*1.1, 'rgba(150,240,90,.85)', .2); jolt(t, 2, -2, 1);
  particles(b.x, b.y, {n:5, cls:'fxi-bubble', size:()=> rnd(7, 12), style:(i, e)=> e.style.setProperty('--b', 'rgba(150,240,90,.45)'), d0:10, d1:b.w*.5, rise:14, dur:.7});
  return particles(b.x, b.y, {n:13, cls:'fxi-drop', size:()=> rnd(9, 15), h:()=> rnd(12, 20), style:green, a0:200, a1:340, d0:b.w*.25, d1:b.w*.85, grav:44, dur:.85, fadeStart:.5}).then(finish(o));
};

// 4. hitPoison: v0 skull puff, v1 purple bubbles, v2 toxic cloud.
W.hitPoison = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '☠️'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ jolt(t, 0, 0, .5); tint(b, 'rgba(150,70,200,.45)', .8, .8);
    return particles(b.x, b.b - 6, {n:10, cls:'fxi-bubble', size:()=> rnd(8, 17), style:(i, e)=> e.style.setProperty('--b', 'rgba(170,90,230,.5)'), a0:250, a1:290, d0:b.h*.3, d1:b.h*.85, sway:9, s0:.5, s1:1.1, dur:1.1, fadeStart:.6, stagger:.45}).then(finish(o)); }
  if(v === 2){ jolt(t, 0, 0, .6); const sk = glyph(b, '☠️', b.w*.5); run(.9, u=> put(sk, b.x, b.y - b.h*.25*u, {s:.6 + .5*eout(u), op:Math.min(1, u*5)*(1 - ein(u))})).then(()=> kill(sk));
    return particles(b.x, b.y, {n:6, cls:'fxi-smoke', size:()=> b.w*rnd(.5, .8), d0:b.w*.2, d1:b.w*.65, rise:b.h*.25, s0:.3, s1:1.4, op:.9, dur:1.1, fadeStart:.45}).then(finish(o)); }
  jolt(t, 2, -2, .8); ring(b.x, b.y, {size:b.w*1.6, color:'#b873f0', w:3, dur:.45});
  const sk = glyph(b, '☠️', b.w*.55); run(.95, u=> put(sk, b.x, b.y - b.h*.45*eout(u), {s:.5 + .7*eout(u), r:Math.sin(u*10)*8, op:Math.min(1, u*6)*(1 - ein(u))})).then(()=> kill(sk));
  return particles(b.x, b.y, {n:8, cls:'fxi-smoke', size:()=> rnd(12, 22), d0:b.w*.2, d1:b.w*.7, rise:b.h*.3, s0:.3, s1:1.3, dur:.95, fadeStart:.4}).then(finish(o));
};

// 5. hitDecay: v0 leaf fall, v1 crumble, v2 wilt and spores.
W.hitDecay = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '🍂'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ jolt(t, 0, 3, .8); tint(b, 'rgba(120,84,40,.45)', .7, .7);
    return particles(b.x, b.b - 8, {n:14, cls:'fxi-crumb', size:()=> rnd(5, 10), a0:200, a1:340, d0:6, d1:b.w*.5, grav:b.h*.55, dur:1.0, fadeStart:.5, stagger:.3, spin:200}).then(finish(o)); }
  if(v === 2){ const g = G(); if(g && t && t.nodeType){ g.timeline().to(tileOf(t), {scaleY:.94, rotation:2.5, y:3, duration:.25, ease:'power2.out'}).to(tileOf(t), {scaleY:1, rotation:0, y:0, duration:.5, ease:'elastic.out(1, .5)', clearProps:'transform'}); }
    tint(b, 'rgba(110,100,40,.5)', .9, .8);
    return particles(b.x, b.y, {n:9, cls:'fxi-soft', size:()=> rnd(14, 24), style:(i, e)=>{ e.style.setProperty('--s0', 'rgba(190,176,90,.95)'); e.style.setProperty('--s1', 'rgba(150,134,60,.65)'); }, d0:b.w*.15, d1:b.w*.6, rise:b.h*.2, s0:.4, s1:1.3, dur:1.0}).then(finish(o)); }
  jolt(t, 0, 2, .7); tint(b, 'rgba(140,96,40,.4)', .8, .7);
  return particles(b.x, b.t, {n:9, cls:'fxi-glyph', style:glyphStyle(['🍂', '🍁'], i=> 16 + (i % 3)*3), a0:60, a1:120, d0:b.h*.4, d1:b.h*.95, sway:16, s0:.8, s1:1, dur:1.4, fadeStart:.55, stagger:.5, spin:260}).then(finish(o));
};

// 6. hitMagic: v0 sparkle burst, v1 rune circle under the card, v2 wand zap (stars fly from o.from).
W.hitMagic = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '🪄'); if(early) return early; const v = o.v | 0;
  const cols = ['#ffffff', '#e9b6ff', '#a6c8ff', '#ffd6f4'];
  if(v === 1){ call(o.onImpact); jolt(t, 0, 0, .5);
    const mk = [], R = 46; let m = `<circle cx='50' cy='50' r='${R}' fill='none' stroke='#d9a8ff' stroke-width='2.5'/><circle cx='50' cy='50' r='${R - 9}' fill='none' stroke='#fff' stroke-width='1.2'/>`;
    for(let k = 0; k < 8; k++){ const a = k/8*Math.PI*2; m += `<path transform='translate(${50 + Math.cos(a)*(R - 4.5)} ${50 + Math.sin(a)*(R - 4.5)}) rotate(${a/D2R + 90})' d='M0 -3.5 L3 3 L-3 3 Z' fill='#fff'/>`; }
    const e = svgNode(b.w*1.5, b.w*1.5, '0 0 100 100', m);
    return run(1.1, u=> put(e, b.x, b.b - 6, {sx:(.4 + .7*eout(Math.min(1, u*2)))*1, sy:(.4 + .7*eout(Math.min(1, u*2)))*.45, r:150*u, op:u < .15 ? u/.15 : 1 - ein(Math.max(0, (u - .6)/.4))})).then(()=>{ kill(e); fin(o); }); }
  const burst = ()=>{ call(o.onImpact); flash(b.x, b.y, b.w*1.1, 'rgba(220,170,255,.85)', .22); ring(b.x, b.y, {size:b.w*1.7, color:'#cf9bff', w:4, dur:.45, glow:8}); jolt(t, 0, -2, 1);
    return particles(b.x, b.y, {n:10, cls:'fxi-star', size:()=> rnd(9, 18), style:(i, e)=>{ e.style.opacity = 1; }, d0:b.w*.3, d1:b.w*.9, s0:.3, s1:1, dur:.85, fadeStart:.4, spin:200}); };
  if(v === 2){ const from = boxOf(o.from) || {x:b.x - b.w*1.4, y:b.y + b.h*.9};
    return Promise.all([0, 1, 2, 3].map(i=>{ const e = node('fxi-star', 16 - i*2, 16 - i*2); const mid = {x:(from.x + b.x)/2, y:Math.min(from.y, b.y) - 50 - i*8};
      return run(.5, u=>{ const x = (1 - u)*(1 - u)*from.x + 2*(1 - u)*u*mid.x + u*u*b.x, y = (1 - u)*(1 - u)*from.y + 2*(1 - u)*u*mid.y + u*u*b.y; put(e, x, y, {r:u*360, s:1, op:u > .96 ? 0 : 1}); }, {delay:i*.07}).then(()=> kill(e)); }))
      .then(burst).then(finish(o)); }
  return burst().then(finish(o));
};

// 7. hitWater: v0 splash, v1 bubbles, v2 wave wash.
W.hitWater = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '💧'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  const blue = (i, e)=>{ e.style.setProperty('--d1', ['#6cc7ff', '#8fd8ff', '#4fb0f0'][i % 3]); e.style.setProperty('--d2', '#2c7fc4'); };
  if(v === 1){ jolt(t, 0, 0, .5); tint(b, 'rgba(100,190,255,.4)', .8, .7);
    return particles(b.x, b.b - 8, {n:11, cls:'fxi-bubble', size:()=> rnd(8, 17), a0:250, a1:290, d0:b.h*.3, d1:b.h*.9, sway:10, s0:.5, s1:1.1, dur:1.1, fadeStart:.6, stagger:.4}).then(finish(o)); }
  if(v === 2){ const c = node('fxi-clip', b.w, b.h); const wv = document.createElement('i'); wv.style.cssText = `left:0; top:${b.h*.42}px; width:${b.w*1.6}px; height:${b.h*.7}px; border-radius:48% 52% 0 0 / 30% 30% 0 0; background:linear-gradient(rgba(255,255,255,.95) 0 8%, #74cdff 9%, #3b97e0); box-shadow:0 -3px 0 rgba(255,255,255,.7)`; c.appendChild(wv); jolt(t, 3, 0, .8);
    particles(b.x + b.w*.2, b.y, {n:8, cls:'fxi-drop', size:()=> rnd(7, 12), style:blue, a0:210, a1:330, d0:12, d1:b.w*.6, grav:36, dur:.7});
    return run(.9, u=>{ put(c, b.x, b.y, {op:u < .08 ? u/.08 : 1 - ein(clamp((u - .7)/.3, 0, 1))}); wv.style.transform = `translateX(${(-b.w*.7 + b.w*1.35*eio(u)).toFixed(1)}px)`; }).then(()=>{ c.remove(); kill(c); fin(o); }); }
  jolt(t, 0, 3, .9); ring(b.x, b.b - 8, {size:b.w*1.8, color:'#9fdcff', w:4, dur:.5, sy:.35, glow:6});
  particles(b.x, b.y, {n:6, cls:'fxi-bubble', size:()=> rnd(6, 11), d0:8, d1:b.w*.5, rise:10, dur:.7});
  return particles(b.x, b.y + b.h*.1, {n:14, cls:'fxi-drop', size:()=> rnd(8, 14), h:()=> rnd(11, 18), style:blue, a0:230, a1:310, d0:b.h*.35, d1:b.h*.85, grav:b.h*.5, dur:.9, fadeStart:.5}).then(finish(o));
};

// 8. hitStone: v0 rock chips and dust, v1 boulder drop, v2 pebble spray.
W.hitStone = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '🪨'); if(early) return early; const v = o.v | 0;
  const dust = ()=> particles(b.x, b.y, {n:6, cls:'fxi-soft', size:()=> rnd(18, 28), style:(i, e)=>{ e.style.setProperty('--s0', 'rgba(222,206,170,.95)'); e.style.setProperty('--s1', 'rgba(190,170,130,.65)'); }, d0:b.w*.2, d1:b.w*.6, s0:.4, s1:1.4, dur:.8});
  if(v === 1){ const r = node('fxi-rock', 38, 34), x = b.x, y0 = b.t - 120;
    return run(.36, u=> put(r, x, y0 + (b.y - y0)*ein(u), {r:200*u, op:u > .02 ? 1 : 0})).then(()=>{ kill(r); call(o.onImpact); jolt(t, 0, 5, 1.4);
      ring(b.x, b.b - 6, {size:b.w*1.8, color:'#d9ccb0', w:4, dur:.45, sy:.35}); dust();
      return particles(b.x, b.y, {n:6, cls:'fxi-rock', size:()=> rnd(7, 12), a0:210, a1:330, d0:b.w*.3, d1:b.w*.75, grav:30, dur:.7}); }).then(finish(o)); }
  call(o.onImpact);
  if(v === 2){ jolt(t, 0, 1, .6);
    return particles(b.x, b.b - 6, {n:15, cls:'fxi-rock', size:()=> rnd(5, 10), a0:215, a1:325, d0:b.w*.3, d1:b.w*.95, grav:b.h*.35, dur:.85, fadeStart:.55, stagger:.12, spin:260}).then(finish(o)); }
  jolt(t, 2, 4, 1.3); dust();
  return particles(b.x, b.y, {n:9, cls:'fxi-rock', size:()=> rnd(8, 14), a0:200, a1:340, d0:b.w*.25, d1:b.w*.8, grav:34, dur:.8, fadeStart:.5, spin:300}).then(finish(o));
};

// 9. hitMetal: v0 clang sparks, v1 gear spin, v2 glint sweep.
W.hitMetal = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '⚙️'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ jolt(t, 3, -1, 1);
    [-1, 1].forEach((k, i)=>{ const g = glyph(b, '⚙️', b.w*(i ? .42 : .55), b.x + k*b.w*.2, b.y - k*b.h*.1); run(.8, u=> put(g, b.x + k*b.w*.2, b.y - k*b.h*.1, {s:.4 + .8*eout(u), r:k*260*u, op:Math.min(1, u*6)*(1 - ein(u))})).then(()=> kill(g)); });
    return particles(b.x, b.y, {n:9, cls:'fxi-spark', size:3, h:()=> rnd(10, 16), orient:true, d0:b.w*.3, d1:b.w*.8, dur:.6, fadeStart:.4}).then(finish(o)); }
  if(v === 2){ const c = node('fxi-clip', b.w, b.h), bar = document.createElement('i'); bar.style.cssText = `left:0; top:-10%; width:34%; height:120%; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95) 50%, rgba(255,255,255,0)); transform:skewX(-18deg)`; c.appendChild(bar);
    const st = node('fxi-star', 22, 22); jolt(t, 0, 0, .4);
    run(.5, u=>{ put(st, b.l + b.w*.82, b.t + b.h*.2, {s:sinPulse(u)*1.3, r:90*u, op:sinPulse(u)}); }, {delay:.25}).then(()=> kill(st));
    return run(.65, u=>{ put(c, b.x, b.y, {op:1}); bar.style.transform = `translateX(${(-100 + 360*eio(u)).toFixed(1)}%) skewX(-18deg)`; }).then(()=>{ kill(c); fin(o); }); }
  jolt(t, 4, -2, 1.5); ring(b.x, b.y, {size:b.w*1.6, color:'#d3d8e0', w:4, dur:.4, glow:6});
  const st = node('fxi-star', b.w*.7, b.w*.7); run(.35, u=> put(st, b.x, b.y, {s:.3 + 1*eout(u), r:45*u, op:1 - ein(u)})).then(()=> kill(st));
  return particles(b.x, b.y, {n:14, cls:'fxi-spark', size:3, h:()=> rnd(12, 20), orient:true, d0:b.w*.3, d1:b.w*.95, grav:16, dur:.65, fadeStart:.4}).then(finish(o));
};

// 10. hitLightning: v0 zigzag bolt from above, v1 chain arcs (o.chain: other cards), v2 crackle round the card.
W.hitLightning = function(t, o){
  o = o || {}; const [b, early] = hitHead(t, o, '⚡'); if(early) return early; const v = o.v | 0;
  const strike = (a, c, w)=>{ const z = zig(a, c, {w, seg:7, jit:16}); put(z.e, z.cx, z.cy, {op:1}); return run(.34, u=>{ z.e.style.opacity = (Math.floor(u*8) % 2 ? .35 : 1)*(1 - ein(u)); }).then(()=> kill(z.e)); };
  if(v === 1){ const list = (o.chain || []).map(boxOf).filter(Boolean), pts = [b, ...list]; if(pts.length < 2) pts.push({x:b.x + b.w*1.1, y:b.y - b.h*.5, w:b.w, h:b.h}, {x:b.x - b.w*1.1, y:b.y + b.h*.5, w:b.w, h:b.h});
    call(o.onImpact); jolt(t, 2, 0, 1); flash(b.x, b.y, b.w, 'rgba(255,240,120,.85)', .18);
    return Promise.all(pts.slice(1).map((p, i)=> run(.05, ()=>{}, {delay:i*.09}).then(()=>{ flash(p.x, p.y, p.w*.9, 'rgba(255,240,120,.8)', .16); return strike(pts[i], p, 4); }))).then(finish(o)); }
  if(v === 2){ call(o.onImpact); jolt(t, 2, 0, .8); ring(b.x, b.y, {size:b.w*1.6, color:'#ffe94a', w:3, dur:.5, glow:8});
    const cs = [[b.l, b.t], [b.r, b.t], [b.l, b.b], [b.r, b.b], [b.x, b.t - 4], [b.x, b.b + 4]].map(([x, y], i)=>{ const dx = (x - b.x)*.5 + (i % 2 ? 8 : -8), dy = (y - b.y)*.3; return zig({x:x - dx*.5, y:y - dy*.5 - 6}, {x:x + dx*.7, y:y + dy*.7 + 8}, {seg:4, jit:7, w:3}); });
    cs.forEach(z=> put(z.e, z.cx, z.cy, {op:1}));
    return run(.7, u=>{ cs.forEach((z, i)=>{ z.e.style.opacity = (Math.floor(u*10 + i) % 3 ? 1 : .2)*(1 - ein(u)); }); }).then(()=>{ cs.forEach(z=> kill(z.e)); fin(o); }); }
  const top = {x:b.x + rnd(-14, 14), y:Math.max(8, b.t - 150)}; const z = zig(top, {x:b.x, y:b.y}, {w:5, seg:8, jit:18});
  flash(b.x, top.y + 20, 30, 'rgba(255,255,200,.7)', .2); put(z.e, z.cx, z.cy, {op:1});
  call(o.onImpact); jolt(t, 3, 0, 1.4); flash(b.x, b.y, b.w*1.2, 'rgba(255,240,120,.9)', .22); ring(b.x, b.y, {size:b.w*1.6, color:'#ffe94a', w:4, dur:.4, glow:8});
  particles(b.x, b.y, {n:6, cls:'fxi-spark', size:3, h:()=> rnd(10, 16), orient:true, d0:b.w*.3, d1:b.w*.7, dur:.5});
  return run(.4, u=>{ z.e.style.opacity = (Math.floor(u*10) % 2 ? .3 : 1)*(1 - ein(u)); }).then(()=>{ kill(z.e); fin(o); });
};

// =====================================================================================
// AURAS: a subtle idle "attacks with X" look; o.element: heat cold acid poison decay magic water stone metal shock; o.ms how long (default 4500)
// =====================================================================================
W.elementAura = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); const el = o.element || 'heat';
  const GL = {heat:'🔥', cold:'❄️', acid:'🧪', poison:'☠️', decay:'🍂', magic:'🪄', water:'💧', stone:'🪨', metal:'⚙️', shock:'⚡'};
  if(RM()) return still(b, GL[el] || '✦', o);
  injectCss(); call(o.onImpact);
  const N = el === 'shock' ? 4 : el === 'metal' ? 1 : 7, dur = (o.ms || 4500)/1000, ms = [];
  const mk = i=>{
    if(el === 'heat') return node('fxi-ember', 7, 7);
    if(el === 'cold') return node('fxi-star', 12, 12);
    if(el === 'acid'){ const e = node('fxi-bubble', 11, 11); e.style.setProperty('--b', 'rgba(150,240,90,.45)'); return e; }
    if(el === 'poison'){ const e = node('fxi-smoke', 15, 15); return e; }
    if(el === 'decay'){ const e = node('fxi-crumb', 6, 6); return e; }
    if(el === 'magic') return node('fxi-star', 11, 11);
    if(el === 'water'){ const e = node('fxi-drop', 8, 11); e.style.setProperty('--d1', '#6cc7ff'); e.style.setProperty('--d2', '#2c7fc4'); return e; }
    if(el === 'stone') return node('fxi-rock', 9, 8);
    if(el === 'shock') return zig({x:0, y:0}, {x:14, y:10}, {seg:3, jit:5, w:2}).e;
    return node('fxi-disc', 1, 1);
  };
  for(let i = 0; i < N; i++) ms.push({e:mk(i), ph:i/N + rnd(0, .08), k:rnd(.7, 1.15)});
  let sweep = null, bar = null; if(el === 'metal'){ sweep = node('fxi-clip', b.w, b.h); bar = document.createElement('i'); bar.style.cssText = `left:0; top:-10%; width:30%; height:120%; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.8) 50%, rgba(255,255,255,0)); transform:skewX(-18deg)`; sweep.appendChild(bar); }
  let last = 0;
  return run(dur, u=>{
    const now = performance.now(); if(u < 1 && now - last < 33) return; last = now; // 30 fps at most
    const fade = Math.min(1, u*8, (1 - u)*6);
    ms.forEach((m, i)=>{
      const c = (u*dur/2.4*m.k + m.ph) % 1; let x = b.x, y = b.y, s = 1, r = 0, op = .9;
      if(el === 'heat'){ x = b.l + b.w*(.12 + .76*((i*.37 + m.ph*3) % 1)) + Math.sin(c*9 + i)*4; y = b.b - 4 - b.h*.45*c; s = 1 - .6*c; op = .9*(1 - c*c); }
      else if(el === 'cold'){ const a = (i/N)*6.28; x = b.x + Math.cos(a)*b.w*.52; y = b.y + Math.sin(a)*b.h*.52; s = .4 + .9*Math.abs(Math.sin(c*Math.PI)); r = c*120; op = .9*Math.abs(Math.sin(c*Math.PI)); }
      else if(el === 'acid'){ x = b.l + b.w*(.14 + .72*((i*.43 + m.ph*2) % 1)) + Math.sin(c*7 + i)*3; y = b.b - 2 - b.h*.5*c; s = .5 + .8*c; op = .95*(c > .85 ? (1 - c)/.15 : 1); }
      else if(el === 'poison'){ x = b.l + b.w*(.1 + .8*((i*.31 + m.ph*2) % 1)) + Math.sin(c*5 + i)*5; y = b.b - 4 - b.h*.55*c; s = .5 + 1.0*c; op = .55*(1 - c); }
      else if(el === 'decay'){ x = b.l + b.w*((i*.47 + m.ph*2) % 1) + Math.sin(c*6 + i)*4; y = b.t + b.h*.5 + b.h*.6*c; r = c*200; s = 1; op = .85*(1 - c); }
      else if(el === 'magic'){ const a = (c + i/N)*6.283; x = b.x + Math.cos(a)*b.w*.58; y = b.y + Math.sin(a)*b.h*.58; s = .6 + .5*Math.sin(a*2 + i); r = a/D2R; op = .85; }
      else if(el === 'water'){ const cc = (c*1.2) % 1; x = b.l + b.w*(.15 + .7*((i*.41 + m.ph*2) % 1)); y = b.b - 2 + (cc < .4 ? 0 : b.h*.4*Math.pow((cc - .4)/.6, 2)); s = cc < .4 ? .3 + cc/.4*.8 : 1; op = cc < .4 ? .9 : .9*(1 - (cc - .4)/.6); }
      else if(el === 'stone'){ x = b.l + b.w*(.1 + .8*((i*.29 + m.ph*3) % 1)); y = b.b + 2 - 5 - Math.abs(Math.sin(c*6.283 + i))*7; r = Math.sin(c*6.283)*18; s = .8 + (i % 3)*.2; op = .9; }
      else if(el === 'shock'){ const corner = [[b.l, b.t], [b.r, b.t], [b.l, b.b], [b.r, b.b]][i]; x = corner[0]; y = corner[1]; op = (Math.floor((u*dur*6) + i*2) % 4 === 0) ? 1 : 0; r = i*90 + Math.floor(u*dur*6)*45; }
      else if(el === 'metal'){ return; }
      put(m.e, x, y, {s, r, op:op*fade});
    });
    if(sweep){ const c = (u*dur/1.6) % 1; put(sweep, b.x, b.y, {op:(c < .4 ? 1 : 0)*fade}); bar.style.transform = `translateX(${(-100 + 360*clamp(c/.4, 0, 1)).toFixed(1)}%) skewX(-18deg)`; }
  }).then(()=>{ ms.forEach(m=> kill(m.e)); if(sweep) kill(sweep); fin(o); });
};

// =====================================================================================
// TITLES
// =====================================================================================
// crowning: v0 the crown drops and bounces, v1 a spotlight and a slow lower, v2 a coin shower.
W.crowning = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '👑', o); injectCss(); const v = o.v | 0, sz = Math.max(24, b.w*.5);
  const cr = glyph(b, '👑', sz), top = b.t - 8;
  const land = ()=>{ call(o.onImpact); hop(t, 5); ring(b.x, top + sz*.4, {size:b.w*1.5, color:'#ffd56e', w:3, dur:.5, glow:8});
    return particles(b.x, top + sz*.3, {n:8, cls:'fxi-star', size:()=> rnd(9, 15), a0:200, a1:340, d0:b.w*.3, d1:b.w*.75, s0:.3, s1:1, dur:.8, fadeStart:.4, spin:200}); };
  if(v === 1){ const cone = node('fxi-cone', b.w*1.5, b.h*1.5); put(cone, b.x, b.t - b.h*.2, {op:0});
    run(1.9, u=> put(cone, b.x, b.t - b.h*.2, {op:.9*sinPulse(Math.min(1, u*1.1))})).then(()=> kill(cone));
    return run(1.1, u=> put(cr, b.x, (top - 70) + 70*eout(u), {s:.5 + .5*eout(u), r:-14 + 14*eout(u), op:Math.min(1, u*4)})).then(()=>{ const p = land(); return run(.7, u=> put(cr, b.x, top, {op:u < .5 ? 1 : 1 - (u - .5)/.5})).then(()=> p); }).then(()=>{ kill(cr); fin(o); }); }
  return run(.62, u=>{ const k = u < .6 ? ein(u/.6) : 1; const bounce = u < .6 ? 0 : -Math.sin((u - .6)/.4*Math.PI)*14*(1 - (u - .6)/.4); put(cr, b.x, top - 130*(1 - k) + bounce, {r:-12*(1 - k), op:Math.min(1, u*6)}); })
    .then(()=>{ const p = land(); if(v === 2) particles(b.x, b.t - 30, {n:11, cls:'fxi-glyph', style:glyphStyle('🪙', i=> 14 + (i % 3)*3), a0:60, a1:120, d0:b.h*.45, d1:b.h*1.0, sway:12, dur:1.1, fadeStart:.55, stagger:.5, spin:300});
      return run(v === 2 ? .9 : .5, u=> put(cr, b.x, top, {op:u < .6 ? 1 : 1 - (u - .6)/.4})).then(()=> p); }).then(()=>{ kill(cr); fin(o); });
};
// gilding: v0 a gold wipe down the card, v1 gold dust rains and settles, v2 a spinning coin.
W.gilding = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🪙', o); injectCss(); const v = o.v | 0;
  if(v === 1){ call(o.onImpact); tint(b, 'linear-gradient(160deg, rgba(255,226,122,.7), rgba(232,169,42,.5))', 1.4, .75, .5); hop(t, 4);
    return particles(b.x, b.t - 6, {n:24, cls:'fxi-ember', size:()=> rnd(3, 6), bg:'radial-gradient(circle, #fff6b8, #f2c94c 70%)', a0:60, a1:120, d0:b.h*.4, d1:b.h*.95, sway:10, s0:1, s1:.8, dur:1.4, fadeStart:.5, stagger:.6}).then(finish(o)); }
  if(v === 2){ const c = glyph(b, '🪙', Math.max(26, b.w*.55)); call(o.onImpact); ring(b.x, b.y, {size:b.w*1.5, color:'#ffd56e', w:3, dur:.55, glow:8, delay:.5}); tint(b, 'rgba(255,214,90,.5)', .9, .7, .5); hop(t, 5);
    return run(1.3, u=>{ const y = b.t - 8 - b.h*.35*eout(Math.min(1, u*1.2)); put(c, b.x, y, {sx:Math.cos(u*18), sy:1, s:1, op:u < .1 ? u/.1 : 1 - ein(clamp((u - .6)/.4, 0, 1))}); }).then(()=>{ kill(c); fin(o); }); }
  const c = node('fxi-clip', b.w, b.h), blk = document.createElement('i'); blk.style.cssText = `left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(255,240,170,.95), rgba(236,178,46,.85) 60%, rgba(214,150,30,.8))`; c.appendChild(blk);
  call(o.onImpact); put(c, b.x, b.y, {op:1});
  particles(b.x, b.y, {n:9, cls:'fxi-star', size:()=> rnd(8, 14), d0:b.w*.25, d1:b.w*.7, s0:.3, s1:1, dur:.9, fadeStart:.4, delay:.5, spin:160});
  return run(1.5, u=>{ blk.style.transform = `translateY(${(-100 + 100*eout(Math.min(1, u/.45))).toFixed(1)}%)`; blk.style.opacity = u < .45 ? 1 : (1 - (u - .45)/.55)*.9 + 0; put(c, b.x, b.y, {op:1}); }).then(()=>{ kill(c); fin(o); });
};
// veteranStripes: v0 three chevrons stamp in, v1 a medal drops in, v2 three star pips pop.
W.veteranStripes = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '⭐', o); injectCss(); const v = o.v | 0;
  const cx = b.l + b.w*.2, cy = b.t + b.h*.2;
  if(v === 1){ const e = node('fxi-glyph', 0, 0); e.innerHTML = '🏅'; e.style.width = e.style.height = 'auto'; e.style.fontSize = Math.max(22, b.w*.42) + 'px'; call(o.onImpact);
    return run(.9, u=>{ const k = u < .4 ? ein(u/.4) : 1, sw = u < .4 ? 0 : Math.sin((u - .4)*16)*10*(1 - (u - .4)/.6); put(e, cx, cy - 90*(1 - k), {r:sw, op:Math.min(1, u*6)}); })
      .then(()=>{ hop(t, 4); ring(cx, cy, {size:b.w*.7, color:'#e8ecf2', w:3, dur:.45}); particles(cx, cy, {n:6, cls:'fxi-star', size:()=> rnd(8, 12), d0:10, d1:b.w*.35, s0:.3, s1:1, dur:.6}); return run(.9, u=> put(e, cx, cy, {op:1 - ein(clamp((u - .4)/.6, 0, 1))})); }).then(()=>{ kill(e); fin(o); }); }
  const items = [0, 1, 2].map(i=>{ const e = v === 2 ? node('fxi-star', 18, 18) : svgNode(26, 14, '0 0 26 14', `<path d='M2 12 L13 3 L24 12' fill='none' stroke='#6a5a2a' stroke-width='5.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M2 12 L13 3 L24 12' fill='none' stroke='#f2d36a' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/>`); return e; });
  call(o.onImpact);
  const pos = i=> v === 2 ? {x:b.x + (i - 1)*b.w*.24, y:b.b - 12} : {x:cx, y:cy + 6 - i*9};
  return Promise.all(items.map((e, i)=> run(.34, u=>{ const p = pos(i); put(e, p.x, p.y, {s:2.4 - 1.4*eout(u), r:v === 2 ? 36*(1 - u) : 0, op:Math.min(1, u*5)}); }, {delay:.22*i}).then(()=>{ const p = pos(i); hop(t, 2); particles(p.x, p.y, {n:4, cls:'fxi-star', size:8, d0:6, d1:18, s0:.3, s1:1, dur:.45}); })))
    .then(()=> run(.9, u=> items.forEach(e=> { e.style.opacity = u < .5 ? 1 : 1 - (u - .5)/.5; }))).then(()=>{ items.forEach(kill); fin(o); });
};
// championLaurel: v0 a laurel wreath grows round the card, v1 a trophy rises with confetti, v2 a banner unfurls.
W.championLaurel = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🏆', o); injectCss(); const v = o.v | 0;
  if(v === 1){ const tr = glyph(b, '🏆', Math.max(28, b.w*.6)); call(o.onImpact);
    const cols = ['#ff6b6b', '#ffd56e', '#6bd6ff', '#9be36b', '#e9a6ff'];
    particles(b.x, b.t - 20, {n:22, cls:'fxi-chip', size:()=> rnd(5, 8), h:()=> rnd(8, 12), bg:i=> cols[i % 5], a0:215, a1:325, d0:b.h*.5, d1:b.h*1.1, grav:b.h*.7, dur:1.3, fadeStart:.55, delay:.5, spin:400});
    return run(1.7, u=>{ const k = eout(Math.min(1, u/.45)); put(tr, b.x, b.b - 10 - (b.h*.95)*k, {s:.5 + .7*k + .06*Math.sin(u*20)*(u > .45 ? 1 : 0), r:Math.sin(u*10)*6*(u > .45 ? 1 : 0), op:Math.min(1, u*6)*(u > .75 ? 1 - (u - .75)/.25 : 1)}); }).then(()=>{ kill(tr); fin(o); }); }
  if(v === 2){ const bn = node('fxi-banner', b.w*1.05, Math.max(18, b.h*.2)); const st = node('fxi-star', 18, 18); call(o.onImpact);
    run(1.5, u=>{ put(st, b.x, b.t + b.h*.14, {s:sinPulse(clamp((u - .25)/.35, 0, 1))*1.2, r:u*120, op:sinPulse(clamp((u - .25)/.35, 0, 1))}); }).then(()=> kill(st));
    return run(1.6, u=>{ const k = eout(Math.min(1, u/.3)); put(bn, b.x, b.t + b.h*.14, {sx:k, op:u > .75 ? 1 - (u - .75)/.25 : 1}); if(u > .3 && u < .5) hop(t, 0); }).then(()=>{ kill(bn); fin(o); }); }
  const W2 = b.w*1.12, H2 = b.h*.95; let m = '';
  for(let side = -1; side <= 1; side += 2) for(let k = 0; k < 9; k++){ const u = k/8, cx = 50 + side*(30 + 6*Math.sin(u*3.1)), cy = 92 - u*78;
    m += `<ellipse cx='${cx.toFixed(1)}' cy='${cy.toFixed(1)}' rx='5.6' ry='2.6' transform='rotate(${(side*(-62 + u*92)).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})' fill='${k % 2 ? '#8fcf4a' : '#6fb53a'}' stroke='#3f7a1e' stroke-width='.8'/>`; }
  const e = svgNode(W2, H2, '0 0 100 100', m); e.firstChild.setAttribute('preserveAspectRatio', 'none'); const ring2 = ring(b.x, b.y, {size:b.w*1.5, color:'#ffd56e', w:3, dur:.6, glow:8, delay:.45}); call(o.onImpact);
  hop(t, 4);
  return run(2.0, u=>{ const k = u < .35 ? 1 - Math.pow(1 - u/.35, 3) : 1; put(e, b.x, b.y, {s:.5 + .5*k + (u > .35 ? .02*Math.sin(u*30) : 0), op:Math.min(1, u*5)*(u > .75 ? 1 - (u - .75)/.25 : 1)}); }).then(()=> ring2).then(()=>{ kill(e); fin(o); });
};

// =====================================================================================
// EVOLVE (the card is the same one; nothing here swaps it, the caller does)
// =====================================================================================
// cocoonBurst: silk wraps the card, it wobbles, then bursts into silk bits and sparkles.
W.cocoonBurst = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🦋', o); injectCss();
  const e = node('fxi-rect', b.w*1.12, b.h*1.1); e.style.borderRadius = '50%'; e.style.background = 'repeating-linear-gradient(115deg, rgba(255,255,255,.96) 0 5px, rgba(222,228,240,.92) 5px 8px), radial-gradient(circle, #fff, #dde3f0)'; e.style.boxShadow = 'inset -6px -8px 0 rgba(120,130,160,.25), 0 0 14px rgba(255,255,255,.7)';
  return run(1.25, u=>{ const wob = u > .3 && u < .85 ? Math.sin((u - .3)*40)*5*(u - .3)/.55 : 0, k = u < .25 ? eout(u/.25) : 1; put(e, b.x, b.y, {s:.4 + .6*k + (u > .75 ? (u - .75)*.4 : 0), r:wob, op:u > .86 ? 0 : Math.min(1, u*6)}); })
    .then(()=>{ kill(e); call(o.onImpact); flash(b.x, b.y, b.w*1.5, 'rgba(255,230,250,.9)', .25); ring(b.x, b.y, {size:b.w*1.9, color:'#ffd6f4', w:4, dur:.55, glow:10}); hop(t, 8);
      particles(b.x, b.y, {n:12, cls:'fxi-chip', size:()=> rnd(6, 10), h:()=> rnd(10, 16), bg:'linear-gradient(135deg, #fff, #cfd6e8)', d0:b.w*.4, d1:b.w*1.0, grav:30, dur:.9, fadeStart:.45, spin:320});
      return particles(b.x, b.y, {n:9, cls:'fxi-star', size:()=> rnd(9, 16), d0:b.w*.3, d1:b.w*.85, s0:.3, s1:1.1, dur:.9, fadeStart:.4, spin:200}); }).then(finish(o));
};
// helixSwirl: two strands of dots spiral up round the card and close on its centre.
W.helixSwirl = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🧬', o); injectCss(); const n = 9, dots = [];
  for(let s = 0; s < 2; s++) for(let i = 0; i < n; i++){ const e = node('fxi-disc', 9, 9); e.style.background = s ? 'radial-gradient(circle at 35% 30%, #fff, #ff8ad8 60%, #c2398f)' : 'radial-gradient(circle at 35% 30%, #fff, #6fe0ff 60%, #2a8fc9)'; dots.push({e, s, i}); }
  return run(1.8, u=>{ dots.forEach(d=>{ const f = d.i/(n - 1), prog = clamp(u*1.25 - f*.25, 0, 1), a = d.s*Math.PI + prog*10 + f*4, rad = b.w*.62*(1 - Math.max(0, (u - .72)/.28)*.95);
      put(d.e, b.x + Math.cos(a)*rad, b.b + 6 - (b.h + 12)*prog*(1 - Math.max(0, (u - .72)/.28)*.5) + (u > .72 ? (b.y - b.b)*Math.max(0, (u - .72)/.28)*.5 : 0), {s:.6 + .6*Math.sin(a), op:prog > 0 ? Math.min(1, prog*8)*(1 - clamp((u - .9)/.1, 0, 1)) : 0}); }); })
    .then(()=>{ dots.forEach(d=> kill(d.e)); call(o.onImpact); flash(b.x, b.y, b.w*1.4, 'rgba(210,240,255,.9)', .25); ring(b.x, b.y, {size:b.w*1.8, color:'#9fe6ff', w:4, dur:.5, glow:10}); hop(t, 8);
      return particles(b.x, b.y, {n:10, cls:'fxi-star', size:()=> rnd(9, 15), d0:b.w*.3, d1:b.w*.8, s0:.3, s1:1, dur:.8, fadeStart:.4, spin:200}); }).then(finish(o));
};
// moltShed: a pale copy of the old skin slides off and crumples away while the card pops fresh.
W.moltShed = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🦎', o); injectCss(); const src = tileOf(t);
  const e = node('fxi-ghost', b.w, b.h); try{ const c = src.cloneNode(true); c.style.width = b.w + 'px'; c.style.height = b.h + 'px'; c.removeAttribute('data-uid'); e.appendChild(c); }catch(err){}
  e.style.background = 'rgba(235,224,196,.5)'; call(o.onImpact); put(e, b.x, b.y, {op:.9}); hop(t, 8);
  particles(b.x, b.y, {n:12, cls:'fxi-chip', size:()=> rnd(5, 9), h:()=> rnd(7, 12), bg:'linear-gradient(135deg, #f3e8c8, #c9b88a)', d0:b.w*.3, d1:b.w*.9, grav:b.h*.45, dur:1.0, fadeStart:.45, delay:.15, spin:300});
  ring(b.x, b.y, {size:b.w*1.6, color:'#f0e2b8', w:3, dur:.5, delay:.1});
  return run(1.0, u=>{ const k = ein(u); put(e, b.x + b.w*.12*k, b.y + b.h*.5*k, {sx:1 - .25*k, sy:1 - .5*k, r:14*k, op:.9*(1 - clamp((u - .45)/.55, 0, 1))}); }).then(()=>{ kill(e); fin(o); });
};

// =====================================================================================
// SKY: the target is the field's own box (never the whole screen)
// =====================================================================================
function skyBox(t, o){ const b = boxOf(t); if(!b) return null; const e = node('fxi-clip', b.w, b.h); e.style.borderRadius = '14px'; return {b, e}; }
function skyChild(e, css){ const i = document.createElement('i'); i.style.cssText = css; e.appendChild(i); return i; }
// dawnBreak: warm light rises from the bottom, a sun comes up, rays turn, then it settles.
W.dawnBreak = function(t, o){
  o = o || {}; const s = skyBox(t, o); if(!s) return none(o); const {b, e} = s; if(RM()){ kill(e); return still(b, '🌅', o); } call(o.onImpact);
  const wash = skyChild(e, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(0deg, rgba(255,160,100,.6), rgba(255,206,140,.32) 45%, rgba(255,240,200,0) 85%)');
  const sun = skyChild(e, `left:${b.w*.5 - b.h*.17}px; top:0; width:${b.h*.34}px; height:${b.h*.34}px; border-radius:50%; background:radial-gradient(circle at 40% 36%, #fffbe0, #ffd86a 55%, #ffae3d)`);
  const rays = Array.from({length:7}, (_, i)=> skyChild(e, `left:${b.w*.5 - 7}px; top:${b.h*.5}px; width:14px; height:${b.h*.62}px; transform-origin:50% 0; clip-path:polygon(46% 0,54% 0,100% 100%,0 100%); background:linear-gradient(rgba(255,236,170,.75), rgba(255,236,170,0)); opacity:0`));
  return run(3.2, u=>{ put(e, b.x, b.y, {op:u < .12 ? u/.12 : u > .85 ? (1 - u)/.15 : 1}); const k = eout(Math.min(1, u/.5));
    wash.style.opacity = Math.min(1, u*3); sun.style.transform = `translateY(${(b.h*1.02 - b.h*.68*k).toFixed(1)}px)`; rays.forEach((r, i)=>{ r.style.opacity = (.8*Math.min(1, u*2)).toFixed(2); r.style.transform = `translate(0,${(b.h*.72 - b.h*.66*k).toFixed(1)}px) rotate(${(-80 + i*26.6 + u*14).toFixed(1)}deg)`; }); })
    .then(()=>{ kill(e); fin(o); });
};
// duskGlow: the sky turns orange and violet, the sun sinks, stars come out.
W.duskGlow = function(t, o){
  o = o || {}; const s = skyBox(t, o); if(!s) return none(o); const {b, e} = s; if(RM()){ kill(e); return still(b, '🌇', o); } call(o.onImpact);
  const wash = skyChild(e, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(80,50,140,.55), rgba(220,100,120,.38) 55%, rgba(255,170,80,.28))');
  const sun = skyChild(e, `left:${b.w*.5 - b.h*.15}px; top:${b.h*.1}px; width:${b.h*.3}px; height:${b.h*.3}px; border-radius:50%; background:radial-gradient(circle at 40% 36%, #fff0c0, #ff9a4a 60%, #e0553a)`);
  const stars = Array.from({length:8}, ()=> skyChild(e, `left:${rnd(.08, .92)*b.w}px; top:${rnd(.04, .4)*b.h}px; width:6px; height:6px; background:#fff6c8; clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); opacity:0`));
  return run(3.2, u=>{ put(e, b.x, b.y, {op:u < .12 ? u/.12 : u > .85 ? (1 - u)/.15 : 1}); wash.style.opacity = Math.min(1, u*3);
    sun.style.transform = `translateY(${(b.h*.62*eio(Math.min(1, u/.7))).toFixed(1)}px) scale(${(1 - .25*u).toFixed(2)})`;
    stars.forEach((st, i)=>{ const k = clamp((u - .35 - i*.04)*4, 0, 1); st.style.opacity = (k*(.6 + .4*Math.sin(u*30 + i))).toFixed(2); st.style.transform = `scale(${(.6 + .5*Math.sin(u*14 + i)).toFixed(2)})`; }); })
    .then(()=>{ kill(e); fin(o); });
};
// moonrise: a cool tint, a moon climbs in an arc with a halo, stars twinkle.
W.moonrise = function(t, o){
  o = o || {}; const s = skyBox(t, o); if(!s) return none(o); const {b, e} = s; if(RM()){ kill(e); return still(b, '🌙', o); } call(o.onImpact);
  const wash = skyChild(e, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(20,34,90,.55), rgba(40,60,130,.3))');
  const R = b.h*.2, halo = skyChild(e, `left:0; top:0; width:${R*2.6}px; height:${R*2.6}px; border-radius:50%; background:radial-gradient(circle, rgba(255,250,210,.5), rgba(255,250,210,0) 68%)`);
  const moon = skyChild(e, `left:0; top:0; width:${R}px; height:${R}px; border-radius:50%; background:radial-gradient(circle at 36% 34%, #fffdf0, #f5eebf 62%, #e0d490); box-shadow:inset -4px -4px 0 rgba(150,140,80,.25)`);
  const stars = Array.from({length:9}, ()=> skyChild(e, `left:${rnd(.05, .95)*b.w}px; top:${rnd(.04, .5)*b.h}px; width:6px; height:6px; background:#fff; clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); opacity:0`));
  return run(3.4, u=>{ put(e, b.x, b.y, {op:u < .12 ? u/.12 : u > .86 ? (1 - u)/.14 : 1}); wash.style.opacity = Math.min(1, u*3); const k = eout(Math.min(1, u/.8)), x = b.w*(.14 + .6*k), y = b.h*(.78 - .6*Math.sin(k*Math.PI*.55));
    moon.style.transform = `translate(${(x - R/2).toFixed(1)}px,${(y - R/2).toFixed(1)}px)`; halo.style.transform = `translate(${(x - R*1.3).toFixed(1)}px,${(y - R*1.3).toFixed(1)}px) scale(${(1 + .08*Math.sin(u*20)).toFixed(3)})`;
    stars.forEach((st, i)=>{ const q = clamp((u - .25 - i*.03)*4, 0, 1); st.style.opacity = (q*(.5 + .5*Math.sin(u*26 + i*2))).toFixed(2); }); })
    .then(()=>{ kill(e); fin(o); });
};
// rainStart: a grey cloud slides in, the first drops fall and get heavier, rings spread on the ground.
W.rainStart = function(t, o){
  o = o || {}; const s = skyBox(t, o); if(!s) return none(o); const {b, e} = s; if(RM()){ kill(e); return still(b, '🌧️', o); } call(o.onImpact);
  const wash = skyChild(e, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(70,84,110,.5), rgba(90,110,140,.2))');
  const cl = [0, 1, 2, 3].map(i=> skyChild(e, `left:${b.w*(.05 + i*.24)}px; top:${-b.h*.06 + (i % 2)*b.h*.03}px; width:${b.w*.34}px; height:${b.h*.2}px; border-radius:50%; background:radial-gradient(circle at 40% 36%, #dfe5ee, #aab4c4 65%, #8794a8); opacity:0`));
  const N = 24, drops = Array.from({length:N}, (_, i)=> skyChild(e, `left:0; top:0; width:2px; height:${12 + (i % 3)*3}px; border-radius:2px; background:linear-gradient(rgba(190,225,255,0), #bfe3ff); opacity:0`));
  const rings = Array.from({length:5}, ()=> skyChild(e, `left:0; top:0; width:26px; height:9px; border-radius:50%; border:2px solid rgba(200,230,255,.9); box-sizing:border-box; opacity:0`));
  const X = drops.map(()=> rnd(.04, .96)*b.w), PH = drops.map(()=> Math.random()), RX = rings.map(()=> rnd(.1, .9)*b.w), RY = rings.map(()=> b.h*rnd(.82, .96));
  return run(3.6, u=>{ put(e, b.x, b.y, {op:u < .1 ? u/.1 : u > .88 ? (1 - u)/.12 : 1}); wash.style.opacity = Math.min(1, u*4);
    cl.forEach((c, i)=>{ const k = eout(clamp(u*3 - i*.12, 0, 1)); c.style.opacity = k.toFixed(2); c.style.transform = `translateX(${((1 - k)*-b.w*.4).toFixed(1)}px)`; });
    const dense = clamp((u - .12)*1.6, 0, 1);
    drops.forEach((d, i)=>{ const live = i/N < dense, c = (u*2.6 + PH[i]) % 1; d.style.opacity = live ? .85 : 0; d.style.transform = `translate(${(X[i] - c*b.h*.12).toFixed(1)}px,${(b.h*.12 + c*b.h*.82).toFixed(1)}px) rotate(8deg)`; });
    rings.forEach((r, i)=>{ const c = (u*1.7 + i*.21) % 1; r.style.opacity = (dense > .4 ? (1 - c)*.8 : 0).toFixed(2); r.style.transform = `translate(${(RX[i] - 13).toFixed(1)}px,${(RY[i]).toFixed(1)}px) scale(${(.3 + c*1.3).toFixed(2)})`; }); })
    .then(()=>{ kill(e); fin(o); });
};
// snowfall: flakes drift down on a sway; o.cards (list) get a little white cap that melts away at the end.
W.snowfall = function(t, o){
  o = o || {}; const s = skyBox(t, o); if(!s) return none(o); const {b, e} = s; if(RM()){ kill(e); return still(b, '❄️', o); } call(o.onImpact);
  const wash = skyChild(e, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(190,215,245,.4), rgba(220,235,255,.12))');
  const N = 28, fl = Array.from({length:N}, (_, i)=>{ const f = skyChild(e, `left:0; top:0; font-size:${10 + (i % 4)*3}px; line-height:1; color:#fff; opacity:0`); f.textContent = i % 3 ? '❄' : '•'; return f; });
  const X = fl.map(()=> rnd(.02, .98)*b.w), PH = fl.map(()=> Math.random()), SW = fl.map(()=> rnd(6, 16));
  const caps = (o.cards || []).map(boxOf).filter(Boolean).map(cb=>{ const c = node('fxi-disc', cb.w*.9, 12); c.style.borderRadius = '50% 50% 40% 40%'; c.style.background = 'linear-gradient(#fff, #dcebff)'; c.style.boxShadow = '0 1px 0 rgba(120,150,190,.5)'; return {c, cb}; });
  return run(3.8, u=>{ put(e, b.x, b.y, {op:u < .1 ? u/.1 : u > .88 ? (1 - u)/.12 : 1}); wash.style.opacity = Math.min(1, u*3);
    fl.forEach((f, i)=>{ const c = (u*1.7 + PH[i]) % 1; f.style.opacity = (Math.min(1, u*5)*(c > .9 ? (1 - c)/.1 : 1)).toFixed(2); f.style.transform = `translate(${(X[i] + Math.sin(c*8 + i)*SW[i]).toFixed(1)}px,${(c*b.h).toFixed(1)}px) rotate(${(c*180).toFixed(0)}deg)`; });
    caps.forEach(({c, cb})=>{ const k = clamp((u - .25)*3, 0, 1)*(1 - clamp((u - .8)/.2, 0, 1)); put(c, cb.x, cb.t + 1, {sx:k, sy:k, op:k}); }); })
    .then(()=>{ kill(e); caps.forEach(c=> kill(c.c)); fin(o); });
};

// =====================================================================================
// STATUS: o.mode 'apply' | 'expire'
// =====================================================================================
// stenchStatus: green wavy lines rise off the card and two flies circle; expiring, a breeze blows it away.
W.stenchStatus = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🦨', o); injectCss(); const expire = o.mode === 'expire'; call(o.onImpact);
  const wav = [-.28, 0, .28].map((k, i)=>{ const e = svgNode(22, 44, '0 0 22 44', `<path d='M11 44 C2 36 20 30 11 22 C2 14 20 8 11 0' fill='none' stroke='#6fb53a' stroke-width='5' stroke-linecap='round'/><path d='M11 44 C2 36 20 30 11 22 C2 14 20 8 11 0' fill='none' stroke='#b6e86a' stroke-width='2.2' stroke-linecap='round'/>`); return {e, k, i}; });
  const fly = [0, 1].map(i=>({e:glyph(b, '🪰', 16), i}));
  tint(b, 'rgba(120,190,60,.45)', expire ? .6 : 1.1, .8);
  const br = expire ? glyph(b, '💨', b.w*.5) : null;
  return run(expire ? 1.2 : 1.8, u=>{
    wav.forEach(w=>{ const c = (u*1.4 + w.i*.3) % 1; put(w.e, b.x + w.k*b.w, b.t - 6 - c*b.h*.35, {sy:.8 + .4*c, op:(expire ? (1 - u) : Math.min(1, u*6))*sinPulse(c)*.95, s:1}); });
    fly.forEach(f=>{ const a = u*10 + f.i*3.14; put(f.e, b.x + Math.cos(a)*b.w*.5, b.t - b.h*.12 + Math.sin(a*1.4)*b.h*.14, {r:Math.sin(a*3)*14, op:expire ? (1 - u*1.2) : Math.min(1, u*5)*(u > .85 ? (1 - u)/.15 : 1)}); });
    if(br) put(br, b.l - b.w*.3 + (b.w*1.7)*eio(u), b.y - b.h*.1, {s:1, op:sinPulse(u)});
  }).then(()=>{ wav.forEach(w=> kill(w.e)); fly.forEach(f=> kill(f.e)); if(br) kill(br); fin(o); });
};
// brittleStatus: a hairline crack spreads over the card; expiring, it seals with a shimmer.
W.brittleStatus = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🫙', o); injectCss(); const expire = o.mode === 'expire'; call(o.onImpact);
  const paths = ['M50 0 L44 18 L56 30 L46 46 L58 60 L50 78 L56 100', 'M44 18 L26 24 L18 38', 'M56 30 L76 34 L84 50', 'M46 46 L30 56 L24 72', 'M58 60 L74 70 L80 88'];
  const e = svgNode(b.w, b.h, '0 0 100 100', paths.map((d, i)=> `<path class='c${i}' d='${d}' pathLength='1' stroke-dasharray='1' stroke-dashoffset='${expire ? 0 : 1}' fill='none' stroke='#fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/><path d='${d}' pathLength='1' fill='none' stroke='#7ec3ff' stroke-width='.9' stroke-linecap='round' stroke-linejoin='round' opacity='.8'/>`).join('')); e.firstChild.setAttribute('preserveAspectRatio', 'none');
  const cs = [...e.querySelectorAll('.c0, .c1, .c2, .c3, .c4')]; tint(b, 'rgba(170,215,255,.4)', 1.0, .6);
  if(!expire){ jolt(t, 2, 0, .5); particles(b.x, b.y, {n:6, cls:'fxi-shard', size:8, h:11, d0:b.w*.2, d1:b.w*.55, grav:22, orient:true, dur:.7, delay:.3}); }
  else particles(b.x, b.y, {n:8, cls:'fxi-star', size:()=> rnd(8, 13), d0:b.w*.15, d1:b.w*.55, s0:.3, s1:1, dur:.8, delay:.3, spin:160});
  return run(1.5, u=>{ cs.forEach((c, i)=>{ const q = clamp((expire ? 1 - (u*1.3 - i*.05) : (u*2 - i*.12)), 0, 1); c.setAttribute('stroke-dashoffset', (expire ? 1 - q : 1 - q).toFixed(3)); if(expire) c.setAttribute('stroke-dashoffset', (clamp(u*1.5 - i*.05, 0, 1)).toFixed(3)); });
    put(e, b.x, b.y, {op:u > .85 ? (1 - u)/.15 : 1}); }).then(()=>{ kill(e); fin(o); });
};
// exposedStatus: a red reticle zooms in and locks onto the card; expiring, it shrinks away.
W.exposedStatus = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🎯', o); injectCss(); const expire = o.mode === 'expire', sz = Math.max(b.w, b.h)*1.1; call(o.onImpact);
  const e = svgNode(sz, sz, '0 0 100 100', `<g fill='none' stroke-linecap='round'><circle cx='50' cy='50' r='40' stroke='#7a1d12' stroke-width='6'/><circle cx='50' cy='50' r='40' stroke='#ff4a36' stroke-width='3.4'/><circle cx='50' cy='50' r='24' stroke='#ff4a36' stroke-width='2' stroke-dasharray='6 5'/><path d='M50 4 V22 M50 78 V96 M4 50 H22 M78 50 H96' stroke='#7a1d12' stroke-width='6'/><path d='M50 4 V22 M50 78 V96 M4 50 H22 M78 50 H96' stroke='#ff4a36' stroke-width='3.4'/></g><circle cx='50' cy='50' r='3.6' fill='#ff4a36'/>`);
  if(!expire){ ring(b.x, b.y, {size:sz*1.05, color:'#ff4a36', w:3, dur:.4, delay:.45}); flash(b.x, b.y, sz*.7, 'rgba(255,120,100,.75)', .18); }
  else particles(b.x, b.y, {n:6, cls:'fxi-soft', size:()=> rnd(14, 22), d0:b.w*.1, d1:b.w*.45, s0:.4, s1:1.2, dur:.7, delay:.15});
  return run(expire ? 1.0 : 1.7, u=>{ if(expire) put(e, b.x, b.y, {s:1 - .55*eio(u), r:60*u, op:1 - ein(u)});
    else { const k = u < .28 ? eout(u/.28) : 1; put(e, b.x, b.y, {s:2.2 - 1.2*k + (u > .28 ? .03*Math.sin(u*40) : 0), r:(1 - k)*-120 + (u > .28 ? Math.sin(u*8)*3 : 0), op:u > .8 ? (1 - u)/.2 : Math.min(1, u*6)}); } }).then(()=>{ kill(e); fin(o); });
};

// =====================================================================================
// RAID
// =====================================================================================
// shieldCrack: a blue dome round the Bramble; v0 the first crack runs across it, v1 it breaks into hexagon shards.
W.shieldCrack = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🔷', o); injectCss(); const v = o.v | 0, D = b.w*1.7; call(o.onImpact);
  const dome = node('fxi-disc', D, D); dome.style.background = 'radial-gradient(circle at 36% 30%, rgba(255,255,255,.55), rgba(110,180,255,.3) 55%, rgba(60,130,230,.38))'; dome.style.border = '3px solid rgba(190,225,255,.9)'; dome.style.boxSizing = 'border-box';
  const crack = svgNode(D, D, '0 0 100 100', `<g fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M62 6 L54 24 L66 34 L52 50 L60 62 L48 78' stroke='#fff' stroke-width='2.6'/>${v ? `<path d='M54 24 L36 22 L24 34 M66 34 L82 30 M52 50 L34 56 L28 72 M60 62 L78 68' stroke='#fff' stroke-width='2.2'/>` : ''}</g>`);
  if(!v){ jolt(t, 2, 0, .6); return run(1.5, u=>{ const k = u < .3 ? eout(u/.3) : 1, pulse = 1 + .015*Math.sin(u*40)*(u < .5 ? 1 : 0);
      put(dome, b.x, b.y, {s:k*pulse, op:Math.min(1, u*6)*(u > .8 ? (1 - u)/.2 : 1)}); put(crack, b.x, b.y, {s:k*pulse, op:u > .25 ? (u > .8 ? (1 - u)/.2 : 1) : 0}); }).then(()=>{ kill(dome); kill(crack); fin(o); }); }
  return run(1.1, u=>{ const k = u < .25 ? eout(u/.25) : 1; put(dome, b.x, b.y, {s:k*(1 + .03*Math.sin(u*50)*clamp((u - .3)*4, 0, 1)), op:u > .7 ? 0 : Math.min(1, u*6)}); put(crack, b.x, b.y, {s:k, op:u > .3 && u < .7 ? 1 : 0}); })
    .then(()=>{ kill(dome); kill(crack); flash(b.x, b.y, D*.8, 'rgba(180,220,255,.9)', .25); ring(b.x, b.y, {size:D*1.2, color:'#bfe0ff', w:4, dur:.5, glow:10}); shake(t && t.nodeType ? t.closest('.sk-row') || tileOf(t) : null, 4);
      return particles(b.x, b.y, {n:12, cls:'fxi-hex', size:()=> rnd(14, 24), d0:D*.35, d1:D*.75, grav:40, dur:.95, fadeStart:.45, spin:260}); }).then(finish(o));
};
// slamWarning: v0 a red danger spot and a bouncing "!" over the card, v1 the same, then a tentacle slams down on it.
W.slamWarning = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '❗', o); injectCss(); const v = o.v | 0, z = node('fxi-rect', b.w*1.1, b.h*1.1), ex = glyph(b, '❗', Math.max(24, b.w*.42));
  z.style.background = 'radial-gradient(circle, rgba(255,60,50,.4), rgba(255,60,50,.12) 70%, rgba(255,60,50,0))'; z.style.border = '3px dashed rgba(255,90,80,.95)'; z.style.borderRadius = '18px';
  const warn = run(1.0, u=>{ put(z, b.x, b.y, {s:.9 + .1*Math.sin(u*20), op:(.5 + .5*Math.abs(Math.sin(u*9)))*Math.min(1, u*8)}); put(ex, b.x, b.t - 14 - Math.abs(Math.sin(u*12))*10, {s:1.1, r:Math.sin(u*24)*8, op:Math.min(1, u*10)}); });
  if(!v) return warn.then(()=>{ call(o.onImpact); return run(.35, u=>{ put(z, b.x, b.y, {op:1 - u}); put(ex, b.x, b.t - 14, {op:1 - u}); }); }).then(()=>{ kill(z); kill(ex); fin(o); });
  const th = node('fxi-tent', b.w*.75, b.h*1.6);
  return warn.then(()=> run(.3, u=>{ const k = ein(u); put(th, b.x, b.b + b.h*.2 - (b.h*1.4)*k + 0, {sy:.4 + .6*k, op:1}); put(z, b.x, b.y, {op:1 - u}); put(ex, b.x, b.t - 14, {op:1 - u}); }))
    .then(()=>{ call(o.onImpact); jolt(t, 0, 6, 1.5); shake(t && t.nodeType ? (t.closest('.sk-row') || null) : null, 5); ring(b.x, b.b, {size:b.w*2, color:'#c59bf0', w:4, dur:.5, sy:.35, glow:8});
      particles(b.x, b.b - 4, {n:8, cls:'fxi-soft', size:()=> rnd(16, 26), style:(i, e)=>{ e.style.setProperty('--s0', 'rgba(210,190,235,.95)'); e.style.setProperty('--s1', 'rgba(170,140,205,.65)'); }, a0:190, a1:350, d0:b.w*.3, d1:b.w*.9, s0:.4, s1:1.3, dur:.8});
      return run(.9, u=> put(th, b.x, b.y + b.h*.05 + b.h*.5*ein(clamp((u - .5)/.5, 0, 1)), {sy:1 - .08*Math.sin(u*30)*(u < .4 ? 1 : 0), op:u > .55 ? 1 - (u - .55)/.45 : 1})); }).then(()=>{ kill(th); kill(z); kill(ex); fin(o); });
};
// raidFalls: the boss shakes, sinks under bubbles, and a burst of confetti and a trophy come up. Target: the field's box.
W.raidFalls = function(t, o){
  o = o || {}; const b = boxOf(t); if(!b) return none(o); if(RM()) return still(b, '🏆', o); injectCss(); call(o.onImpact);
  const boss = glyph(b, o.boss || '🐙', Math.min(b.h*.5, 120)), tr = glyph(b, '🏆', Math.min(b.h*.34, 70)), dim = node('fxi-rect', b.w, b.h); dim.style.background = 'rgba(8,16,40,.45)'; dim.style.borderRadius = '14px';
  const cols = ['#ff6b6b', '#ffd56e', '#6bd6ff', '#9be36b', '#e9a6ff'];
  run(3.0, u=> put(dim, b.x, b.y, {op:Math.min(1, u*5)*(u > .85 ? (1 - u)/.15 : 1)})).then(()=> kill(dim));
  particles(b.x, b.y + b.h*.2, {n:14, cls:'fxi-bubble', size:()=> rnd(10, 20), a0:250, a1:290, d0:b.h*.25, d1:b.h*.6, sway:12, s0:.5, s1:1.1, dur:1.4, fadeStart:.6, delay:.9, stagger:.8});
  particles(b.x, b.y + b.h*.1, {n:24, cls:'fxi-chip', size:()=> rnd(6, 9), h:()=> rnd(9, 14), bg:i=> cols[i % 5], a0:215, a1:325, d0:b.h*.35, d1:b.h*.85, grav:b.h*.6, dur:1.4, fadeStart:.55, delay:1.5, spin:420});
  ring(b.x, b.y, {size:b.w*.8, color:'#ffd56e', w:4, dur:.7, glow:10, delay:1.5});
  return run(3.0, u=>{ const sink = clamp((u - .25)/.45, 0, 1), sh = u < .25 ? Math.sin(u*90)*6*(u/.25) : 0; put(boss, b.x + sh, b.y - b.h*.06 + b.h*.34*eio(sink), {s:1 - .45*sink, op:1 - clamp((sink - .5)/.5, 0, 1)});
    const up = clamp((u - .55)/.3, 0, 1); put(tr, b.x, b.y + b.h*.2 - b.h*.32*eout(up), {s:.4 + .8*eout(up) + (u > .85 ? .05*Math.sin(u*40) : 0), op:up > 0 ? (u > .9 ? (1 - u)/.1 : 1) : 0}); })
    .then(()=>{ kill(boss); kill(tr); fin(o); });
};

// Drop everything now (the Lab does this between plays).
W.clear = function(){ TWEENS.forEach(t=>{ try{ t.kill(); }catch(e){} }); TWEENS.clear(); NODES.forEach(e=>{ try{ e.remove(); }catch(err){} }); NODES.clear(); };
W.names = ['hitFire', 'hitIce', 'hitAcid', 'hitPoison', 'hitDecay', 'hitMagic', 'hitWater', 'hitStone', 'hitMetal', 'hitLightning', 'elementAura', 'crowning', 'gilding', 'veteranStripes', 'championLaurel', 'cocoonBurst', 'helixSwirl', 'moltShed', 'dawnBreak', 'duskGlow', 'moonrise', 'rainStart', 'snowfall', 'stenchStatus', 'brittleStatus', 'exposedStatus', 'shieldCrack', 'slamWarning', 'raidFalls'];
W.version = '2026-10-21';
})(typeof window !== 'undefined' ? window : globalThis);
