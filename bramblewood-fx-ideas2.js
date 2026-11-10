/* ============================================================
   Bramblewood FX, ideas for the owner to judge, second set (2026-11-11, package LAB3)
   Owner: "add much more vfx we can consider adding to our game in the master hub."

   Forty-seven candidate effects on window.IdeasFX2, each with three looks (opts.v = 0, 1, 2). NOTHING in the game calls them: they are
   shown in the Effects Lab (tab "Ideas 11-11", tools/effects-lab/fxlab-ideas2.js) with a "Lab only (not used yet)" badge, and the owner
   picks which to wire (docs/effects-catalogue.md, "Ideas 11-11"). Each one fills a gap the game's effects leave (the catalogue section lists
   the nearest look the game already has); none repeats a look in bramblewood-fx-*.js, SkillFX, UnitFX, ProcFX, WarFX or IdeasFX.

   Skills      sequesterGrab hoardStash masteryOrbit loneWolfHowl ghostDrift majestyBow exaltedGround encoreCurtain meldLink
   Crits       critElement                                       (one per damage type: opts.element, 11 types, 3 looks each)
   Heal        healHearts lifeLink shieldBubble cleanseWash
   Summons     arriveSwoop arriveBurrow arriveSplash arriveHatch arriveSkitter
   Leaving     returnToHand exileFold deathPoof
   Stacks      buffStack debuffStack
   Field       laneSurge fieldRainbow fieldAurora fieldOmen
   Map         roadProgress mapTransition
   Packs       rarityClimb shinyGlint legendaryWings
   Results     victoryCheer defeatDroop levelUpSpring mapClearFlag
   Boss        bossIntro bossPhase
   UI          buttonSquish lumberGain cardDraw handFull notifyPing mulliganSwap
   Idle        idleVisitor idleYawn

   Contract (as bramblewood-fx-ideas.js, docs/effects-lab-contract.md)
   - IdeasFX2.name(target, opts) -> Promise. A target is a board card or tile (element), a list of elements, or a point / box {x, y, w?, h?}
     in viewport pixels. opts.v picks the look; every effect honours opts.onImpact and opts.onDone and never reads or changes game state.
     The promise resolves once every node it added is gone; a card it moved is left as it was found (clearProps).
   - Overlays are fixed-position nodes on <body> (class fxj), removed when their tween ends. IdeasFX2.clear() drops everything at once.
   - House style: bubbly, obvious, cute; no gore. Cartoon shapes with a lit edge and emoji props, never blur or blend layers. No words:
     glyphs and numbers only (a caller may pass a translated name, e.g. bossIntro's opts.name).
   - Performance: no CSS filter, no mix-blend-mode, no full-screen layer (field and map looks cover the box they are given). All motion is
     transform and opacity, one GSAP tween per group; at most 38 overlay nodes alive at once (node() hands back a detached node past that).
   - prefers-reduced-motion: one still glyph that fades in and out (about 0.7 s), no movement, and onImpact / onDone still fire.
   The helpers below are the same recipes as bramblewood-fx-ideas.js (that file keeps its own private; it is not changed here).
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const W = root.IdeasFX2 = root.IdeasFX2 || {};

// ---- helpers ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const D2R = Math.PI/180, TAU = Math.PI*2;
const rnd = (a, b)=> a + Math.random()*(b - a);
const clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
const call = fn=>{ try{ fn && fn(); }catch(e){} };
const tileOf = el=> (el && el.classList && el.classList.contains('board-card') && el.querySelector('.card-tile')) || el;
const eout = u=> 1 - (1 - u)*(1 - u), ein = u=> u*u, eio = u=> u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
const pulse = u=> Math.sin(Math.PI*clamp(u, 0, 1));
const seg = (u, a, b)=> clamp((u - a)/(b - a), 0, 1);               // 0..1 inside [a, b] of the tween
const fadeIO = (u, a, b)=> Math.min(1, u/(a || .1), (1 - u)/(b || .2)); // in over a, out over b
const bez = (a, m, b, u)=> ({x:(1 - u)*(1 - u)*a.x + 2*(1 - u)*u*m.x + u*u*b.x, y:(1 - u)*(1 - u)*a.y + 2*(1 - u)*u*m.y + u*u*b.y});
const CAP = 38, NODES = new Set(), TWEENS = new Map();
function node(cls, w, h){
  injectCss();
  const e = document.createElement('div'); e.className = 'fxj ' + cls; e.setAttribute('aria-hidden', 'true'); e.style.opacity = '0';
  if(w){ e.style.width = w + 'px'; e.style.height = (h || w) + 'px'; }
  if(NODES.size < CAP){ document.body.appendChild(e); NODES.add(e); } // over budget: a detached node (drawn nowhere, costs nothing)
  return e;
}
const kill = e=>{ if(e){ NODES.delete(e); if(e.parentNode) e.remove(); } };
function put(e, x, y, o){
  o = o || {}; const s = o.s != null ? o.s : 1;
  e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) rotate(${(o.r || 0).toFixed(1)}deg)${o.k ? ` skewX(${o.k.toFixed(1)}deg)` : ''} scale(${(o.sx != null ? o.sx : s).toFixed(3)},${(o.sy != null ? o.sy : s).toFixed(3)})`;
  e.style.opacity = o.op == null ? 1 : clamp(o.op, 0, 1).toFixed(3);
}
// one tween drives fn(u), u 0..1; resolves when it ends (or when clear() drops it)
function run(dur, fn, o){
  o = o || {}; const g = G();
  return new Promise(res=>{
    if(!g){ call(()=> fn(1)); res(); return; }
    const st = {t:0}; let tw = null;
    tw = g.to(st, {t:1, duration:Math.max(.016, dur), delay:o.delay || 0, ease:'none', onUpdate:()=> call(()=> fn(st.t)),
      onComplete:()=>{ call(()=> fn(1)); TWEENS.delete(tw); res(); }});
    TWEENS.set(tw, res);
  });
}
const fin = o=>{ call(o && o.onDone); };
const none = o=>{ call(o && o.onImpact); fin(o); return Promise.resolve(); };
const all = (o, list)=> Promise.all(list).then(()=> fin(o));
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
const listOf = t=> (Array.isArray(t) || (t && !t.nodeType && typeof t.length === 'number')) ? [...t].filter(Boolean) : (t ? [t] : []);
// moving the given card itself (transform and opacity, through GSAP so its own transform cache stays right); never under reduced motion
const isEl = t=> !!(t && t.nodeType);
function tset(t, v){ const g = G(), e = tileOf(t); if(g && isEl(e) && !RM()) g.set(e, v); }
function tclear(t){ const g = G(), e = tileOf(t); if(g && isEl(e) && !RM()) g.set(e, {clearProps:'transform,opacity'}); }
function jolt(t, dx, dy, k){
  const g = G(), e = tileOf(t); if(!g || RM() || !isEl(e)) return; k = k || 1;
  g.timeline().to(e, {x:dx, y:dy, rotation:dx*.5, scaleX:1 + .05*k, scaleY:1 - .07*k, duration:.06, ease:'power2.out'})
    .to(e, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, duration:.42, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
}
function hop(t, h){
  const g = G(), e = tileOf(t); if(!g || RM() || !isEl(e)) return;
  g.timeline().to(e, {y:-(h || 8), scaleY:1.04, duration:.1, ease:'power2.out'}).to(e, {y:0, scaleY:1, duration:.34, ease:'bounce.out', clearProps:'transform'});
}
function shake(host, amp){
  const g = G(); if(!g || RM() || !isEl(host)) return; amp = amp || 5;
  g.timeline({onComplete:()=> g.set(host, {clearProps:'transform'})}).to(host, {x:amp, y:-amp*.5, duration:.04}).to(host, {x:-amp*.8, y:amp*.4, duration:.05}).to(host, {x:amp*.4, duration:.05}).to(host, {x:0, y:0, duration:.08});
}

// ---- CSS ----
const SVG = s=> 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
const STAR_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100'><path d='M0 -48 L9 -12 L46 -14 L16 5 L30 42 L0 20 L-30 42 L-16 5 L-46 -14 L-9 -12 Z' fill='#fff6b8' stroke='#ffb52a' stroke-width='4' stroke-linejoin='round'/></svg>`);
const TWINKLE_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100'><path d='M0 -48 C5 -9 9 -5 48 0 C9 5 5 9 0 48 C-5 9 -9 5 -48 0 C-9 -5 -5 -9 0 -48 Z' fill='#ffffff' stroke='#ffd56e' stroke-width='3' stroke-linejoin='round'/></svg>`);
const CSS = `
.fxj{position:fixed; left:0; top:0; pointer-events:none; z-index:1200; will-change:transform, opacity;}
.fxj-disc{border-radius:50%;}
.fxj-ring{border-radius:50%; box-sizing:border-box; border:4px solid #fff;}
.fxj-arc{border-radius:50%; box-sizing:border-box; border:3px solid transparent; border-top-color:#cfe3ff;}
.fxj-glyph{font-size:30px; line-height:1; text-align:center; white-space:nowrap;}
.fxj-star{background:${STAR_URI} center/contain no-repeat;}
.fxj-twinkle{background:${TWINKLE_URI} center/contain no-repeat;}
.fxj-ember{border-radius:50%; background:radial-gradient(circle, #fff3b0 0, #ffb03a 55%, #ff6a1e 100%);}
.fxj-shard{background:linear-gradient(135deg, #ffffff, #b6ecff 48%, #4cb4f0); clip-path:polygon(50% 0, 100% 38%, 62% 100%, 32% 70%, 0 34%);}
.fxj-drop{border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 34% 30%, #fff 0, var(--d1,#6cc7ff) 45%, var(--d2,#2c7fc4) 100%);}
.fxj-bubble{border-radius:50%; border:2px solid rgba(255,255,255,.85); background:radial-gradient(circle at 30% 28%, rgba(255,255,255,.95) 0 12%, var(--b,rgba(160,220,255,.4)) 42%, rgba(255,255,255,.14) 100%); box-sizing:border-box; text-align:center;}
.fxj-puff{border-radius:50%; background:radial-gradient(circle at 36% 30%, var(--p0,#ffffff) 0, var(--p1,#eceff5) 50%, var(--p2,#c6ccd8) 100%); box-shadow:inset -3px -4px 0 rgba(40,50,70,.1);}
.fxj-crumb{border-radius:30%; background:radial-gradient(circle at 34% 30%, var(--c0,#c79a62) 0, var(--c1,#8a6234) 60%, var(--c2,#5a3d1e) 100%);}
.fxj-rock{border-radius:46% 54% 50% 50% / 56% 48% 52% 44%; background:radial-gradient(circle at 34% 30%, #cfc6b4 0, #9a917e 40%, #5d5648 100%); box-shadow:inset -3px -4px 0 rgba(30,24,14,.3);}
.fxj-spark{width:3px; height:15px; border-radius:2px; background:linear-gradient(rgba(255,255,255,0), var(--k,#ffe27a) 45%, #fff 100%);}
.fxj-line{width:2px; height:16px; border-radius:2px; background:linear-gradient(rgba(255,255,255,0), var(--k,#e6f2ff));}
.fxj-chip{border-radius:2px;}
.fxj-bug{border-radius:50%; background:radial-gradient(circle at 40% 36%, #6a5238, #1d150c 70%); box-shadow:-3px -2px 0 -1px rgba(230,240,255,.75), 3px -2px 0 -1px rgba(230,240,255,.75);}
.fxj-rect{border-radius:12px; box-sizing:border-box;}
.fxj-box{overflow:hidden; border-radius:14px;} .fxj-box > i{position:absolute; display:block; left:0; top:0;}
.fxj-svg{overflow:visible;} .fxj-svg svg{display:block; overflow:visible;}
.fxj-cone{clip-path:polygon(40% 0, 60% 0, 100% 100%, 0 100%); background:linear-gradient(rgba(255,244,190,.75), rgba(255,244,190,0));}
.fxj-ray{clip-path:polygon(46% 0, 54% 0, 100% 100%, 0 100%); background:linear-gradient(rgba(255,236,170,.8), rgba(255,236,170,0));}
.fxj-gem{clip-path:polygon(50% 0, 100% 38%, 50% 100%, 0 38%); background:linear-gradient(135deg, #fff 0, var(--g,#ffc94a) 45%, var(--g2,#b5841d) 100%);}
.fxj-ico{border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff, #ece4ff); border:2px solid #8a6fd1; box-sizing:border-box; font-size:14px; line-height:22px; text-align:center;}
.fxj-badge{border-radius:99px; background:linear-gradient(#ffe48a, #e6a92a); border:2px solid #fff; box-shadow:0 2px 0 rgba(0,0,0,.25); color:#4a3000; font:800 13px/22px 'Baloo 2',system-ui,sans-serif; text-align:center; padding:0 6px; box-sizing:border-box; white-space:nowrap;}
.fxj-back{border-radius:8px; border:3px solid #f3d38c; background:radial-gradient(circle at 50% 50%, #8a5fc4 0 18%, transparent 19%), linear-gradient(135deg, #5b3a8a, #2e1d4a); box-sizing:border-box;}
.fxj-mound{border-radius:50% 50% 0 0 / 100% 100% 0 0; background:radial-gradient(circle at 50% 100%, #9a6c3a, #6a4724 70%); box-shadow:inset 0 3px 0 rgba(255,220,170,.35);}
.fxj-band{border-radius:46%;}
.fxj-plate{border-radius:10px; border:3px solid #ffd56e; background:linear-gradient(#3a2440, #1c1222); color:#fff3c4; font:800 16px/1 'Baloo 2',system-ui,sans-serif; padding:6px 14px; white-space:nowrap; box-shadow:0 3px 0 rgba(0,0,0,.35);}
.fxj-curtain{background:repeating-linear-gradient(90deg, #b3202c 0 8px, #d8404a 8px 16px); border-bottom:4px solid #ffd56e; box-sizing:border-box;}
`;
function injectCss(){
  if(document.getElementById('fx-ideas2-style')) return;
  const s = document.createElement('style'); s.id = 'fx-ideas2-style'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
}

// ---- building blocks ----
function particles(x, y, o){
  o = o || {}; const n = o.n || 8, dur = o.dur || .7, ps = [];
  for(let i = 0; i < n; i++){
    const a = rnd(o.a0 == null ? 0 : o.a0, o.a1 == null ? 360 : o.a1)*D2R, d = rnd(o.d0 == null ? 20 : o.d0, o.d1 == null ? 60 : o.d1);
    const w = typeof o.size === 'function' ? o.size(i) : (o.size || 8), h = typeof o.h === 'function' ? o.h(i) : (o.h || w);
    const e = node(o.cls || 'fxj-puff', w, h);
    if(o.bg) e.style.background = typeof o.bg === 'function' ? o.bg(i) : o.bg;
    if(o.style) call(()=> o.style(i, e));
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
const glyphs = (list, size)=> (i, e)=>{ e.textContent = Array.isArray(list) ? list[i % list.length] : list; e.style.fontSize = (typeof size === 'function' ? size(i) : size || 18) + 'px'; };
const CONFETTI = ['#ff6b6b', '#ffd56e', '#6bd6ff', '#9be36b', '#e9a6ff'];
const confetti = (x, y, o)=> particles(x, y, Object.assign({n:12, cls:'fxj-chip', size:()=> rnd(5, 8), h:()=> rnd(8, 12), bg:i=> CONFETTI[i % 5], a0:215, a1:325, d0:30, d1:90, grav:60, dur:1.1, fadeStart:.55, spin:420}, o));
const twinkles = (x, y, o)=> particles(x, y, Object.assign({n:6, cls:'fxj-twinkle', size:()=> rnd(9, 15), d0:10, d1:40, s0:.3, s1:1, dur:.75, fadeStart:.4, spin:160}, o));
function ring(x, y, o){
  o = o || {}; const size = o.size || 90, e = node('fxj-ring', size, size);
  e.style.borderColor = o.color || '#fff'; e.style.borderWidth = (o.w || 4) + 'px'; if(o.glow) e.style.boxShadow = `0 0 ${o.glow}px ${o.color || '#fff'}`;
  return run(o.dur || .45, t=>{ put(e, x, y, {sx:.1 + .9*eout(t), sy:(.1 + .9*eout(t))*(o.sy || 1), op:(o.op == null ? .95 : o.op)*(1 - ein(t))}); }, {delay:o.delay}).then(()=> kill(e));
}
function flash(x, y, size, color, dur){
  const e = node('fxj-disc', size, size); e.style.background = `radial-gradient(circle, #fff 0, ${color || 'rgba(255,238,170,.9)'} 45%, rgba(255,200,80,0) 72%)`;
  return run(dur || .2, t=>{ put(e, x, y, {s:.3 + 1*eout(t), op:1 - ein(t)}); }).then(()=> kill(e));
}
function tint(b, color, dur, peak, delay){
  const e = node('fxj-rect', b.w, b.h); e.style.background = color;
  return run(dur || .6, t=>{ put(e, b.x, b.y, {op:(peak == null ? .6 : peak)*pulse(t)}); }, {delay}).then(()=> kill(e));
}
function glyph(ch, size){ const e = node('fxj-glyph', 0, 0); e.textContent = ch; e.style.fontSize = (size || 30) + 'px'; return e; }
function still(b, ch, o){
  call(o && o.onImpact); const e = glyph(ch, 34);
  return run(.7, t=>{ put(e, b.x, b.y, {op:t < .25 ? t/.25 : t > .7 ? (1 - t)/.3 : 1}); }).then(()=>{ kill(e); fin(o); });
}
function svgNode(w, h, vb, markup){ const e = node('fxj-svg', w, h); e.innerHTML = `<svg width='${w}' height='${h}' viewBox='${vb}' preserveAspectRatio='none'>${markup}</svg>`; return e; }
// a box-sized clipped layer whose children (<i>) move inside it: one overlay node for a whole field or map look
function boxLayer(b){ const e = node('fxj-box', b.w, b.h); return e; }
function child(e, css){ const i = document.createElement('i'); i.style.cssText = css; e.appendChild(i); return i; }
const tf = (i, x, y, o)=>{ o = o || {}; i.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(o.r || 0).toFixed(1)}deg) scale(${(o.sx != null ? o.sx : (o.s != null ? o.s : 1)).toFixed(3)},${(o.sy != null ? o.sy : (o.s != null ? o.s : 1)).toFixed(3)})`; if(o.op != null) i.style.opacity = clamp(o.op, 0, 1).toFixed(3); };
// the shared head of every effect: the target's box, or the still glyph under reduced motion
const head = (t, o, ch)=>{ const b = boxOf(t); if(!b) return [null, none(o)]; if(RM()) return [null, still(b, ch, o)]; injectCss(); return [b, null]; };
// a glyph flying a curve a -> b, removed at the end
function flyGlyph(ch, size, a, b2, dur, o){
  o = o || {}; const e = glyph(ch, size), m = {x:(a.x + b2.x)/2 + (o.bend || 0), y:Math.min(a.y, b2.y) - (o.lift == null ? 50 : o.lift)};
  return run(dur, u=>{ const k = o.ease ? o.ease(u) : u, p = bez(a, m, b2, k); put(e, p.x, p.y, {r:(o.spin || 0)*u, s:o.s ? o.s(u) : 1, op:Math.min(1, u*8)*(o.keep ? 1 : 1 - seg(u, .9, 1))}); }, {delay:o.delay}).then(()=> kill(e));
}

// =====================================================================================
// SKILLS AND KEYWORDS with no look of their own yet
// =====================================================================================
// sequesterGrab (Sequestration): the hit unit's status-skill chips go to the thief (o.from); v0 a paw grabs them, v1 a jar scoops them,
// v2 they fly home when it ends. o.icons: the chips (glyphs).
W.sequesterGrab = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🫳'); if(early) return early; const v = o.v | 0;
  const th = boxOf(o.from) || {x:b.x, y:b.y + b.h*1.3, w:b.w, h:b.h, t:b.t + b.h*1.3}, icons = (o.icons || ['🛡️', '⚡', '🌿']).slice(0, 4), n = icons.length;
  const at = (c, i)=> ({x:c.x + (i - (n - 1)/2)*c.w*.3, y:c.y - c.h*.08});
  const chips = icons.map(ch=>{ const e = node('fxj-ico', 24, 24); e.textContent = ch; return e; });
  const flyAll = (A, B, dur, delay)=> Promise.all(chips.map((e, i)=>{ const a = at(A, i), z = at(B, i), m = {x:(a.x + z.x)/2 + (i - 1)*14, y:Math.min(a.y, z.y) - 46};
    return run(dur, u=>{ const p = bez(a, m, z, eio(u)); put(e, p.x, p.y, {r:Math.sin(u*9 + i)*10, s:1}); }, {delay:(delay || 0) + i*.06}).then(()=> ring(z.x, z.y, {size:30, color:'#b79cff', w:2, dur:.3})); }));
  const end = ()=> run(.3, u=> chips.forEach(e=>{ e.style.opacity = 1 - u; })).then(()=> chips.forEach(kill));
  if(v === 2){ call(o.onImpact); chips.forEach((e, i)=>{ const p = at(th, i); put(e, p.x, p.y, {op:1}); });
    return all(o, [flyAll(th, b, .6).then(()=>{ hop(t, 6); return Promise.all([twinkles(b.x, b.y, {n:6, d1:b.w*.5}), end()]); })]); }
  const pop = run(.25, u=> chips.forEach((e, i)=>{ const p = at(b, i); put(e, p.x, p.y - 10*eout(u), {s:.3 + .7*eout(u), op:u*3}); }), {delay:.3});
  if(v === 1){ const jar = glyph('🫙', Math.max(26, b.w*.45)), jy = b.t - b.h*.25;
    return all(o, [run(2.0, u=>{ const k = seg(u, .55, .85), p = bez({x:b.x, y:jy}, {x:(b.x + th.x)/2, y:Math.min(jy, th.y) - 60}, {x:th.x, y:th.y - th.h*.3}, eio(k));
        put(jar, p.x, p.y, {s:eout(seg(u, 0, .12)) + .1*pulse(seg(u, .45, .55)), r:Math.sin(u*30)*6*seg(u, .4, .5), op:1 - seg(u, .9, 1)}); }),
      pop.then(()=> run(.35, u=> chips.forEach((e, i)=>{ const p = at(b, i); put(e, p.x + (b.x - p.x)*ein(u), p.y - 10 + (jy - p.y + 10)*ein(u), {s:1 - .8*u, op:1 - seg(u, .8, 1)}); }))).then(()=>{ call(o.onImpact); jolt(t, 2, -2, .7); return ring(b.x, jy, {size:40, color:'#fff', w:3, dur:.3}); }),
      run(.01, ()=>{}, {delay:1.75}).then(()=>{ chips.forEach((e, i)=>{ const p = at(th, i); put(e, p.x, p.y, {op:1}); }); hop(o.from, 5);
        return Promise.all([particles(th.x, th.y, {n:6, cls:'fxj-twinkle', size:12, d0:th.w*.2, d1:th.w*.55, s0:.3, s1:1, dur:.6}), run(.5, ()=>{}).then(end)]); })]).then(()=> kill(jar)); }
  const paw = glyph('🫳', Math.max(26, b.w*.48));
  return all(o, [run(1.6, u=>{ const d = seg(u, 0, .2), k = seg(u, .45, .85), a = {x:b.x, y:b.t - 6}, p = bez(a, {x:(a.x + th.x)/2, y:Math.min(a.y, th.y) - 60}, {x:th.x, y:th.t - 6}, eio(k));
      put(paw, p.x, p.y - 40*(1 - eout(d)), {r:Math.sin(u*20)*4, op:Math.min(1, u*8)*(1 - seg(u, .88, 1))}); }),
    pop.then(()=>{ call(o.onImpact); jolt(t, 0, -3, .7); return flyAll(b, th, .6, .1); }).then(()=>{ hop(o.from, 5); return end(); })]).then(()=> kill(paw));
};

// hoardStash (Hoard N, Timber): what it hoards piles up beside it; v0 acorns tumble into a heap, v1 a sack swells with coins, v2 logs stack. o.n: 1-8.
W.hoardStash = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🌰'); if(early) return early; const v = o.v | 0, n = clamp(o.n || 5, 1, 8); call(o.onImpact);
  const sz = Math.max(14, b.w*.2), bx = b.r - sz*.3, by = b.b - sz*.4;
  const slot = i=>{ const row = i < 3 ? 0 : i < 5 ? 1 : i < 7 ? 2 : 3, k = [0, 3, 5, 7][row], cnt = [3, 2, 2, 1][row]; return {x:bx + ((i - k) - (cnt - 1)/2)*sz*.8, y:by - row*sz*.62}; };
  if(v === 1){ const sack = glyph('💰', sz*2), sx = b.r - sz*.2, sy = b.b - sz*.6; let grow = 0;
    const coins = Array.from({length:n}, (_, i)=> flyGlyph('🪙', sz*.8, {x:b.x + rnd(-b.w*.3, b.w*.3), y:b.t - 20}, {x:sx, y:sy - sz*.4}, .5, {delay:.15 + i*.14, lift:30, spin:360}).then(()=>{ grow++; }));
    return all(o, [run(.45 + n*.14 + .9, u=> put(sack, sx, sy, {s:eout(seg(u, 0, .12))*(.8 + grow*.06) + .08*Math.sin(u*40)*(grow ? 1 : 0)*(1 - seg(u, .7, .8)), op:1 - seg(u, .85, 1)})).then(()=> kill(sack)),
      ...coins, run(.01, ()=>{}, {delay:.6 + n*.14}).then(()=>{ hop(t, 4); return twinkles(sx, sy - sz, {n:4, d1:24}); })]); }
  const ch = v === 2 ? '🪵' : '🌰', items = Array.from({length:n}, ()=> glyph(ch, sz));
  return all(o, [Promise.all(items.map((e, i)=>{ const p = slot(i), x0 = v === 2 ? (i % 2 ? b.r + b.w*.9 : b.l - b.w*.4) : p.x + rnd(-8, 8), y0 = v === 2 ? p.y : b.t - 30;
      return run(.4, u=>{ const k = v === 2 ? eout(u) : ein(u); put(e, x0 + (p.x - x0)*k, y0 + (p.y - y0)*k - (v === 2 ? Math.abs(Math.sin(u*Math.PI*2))*8*(1 - u) : 0), {r:(v === 2 ? 0 : 200)*(1 - u) + (i % 2 ? 8 : -8), op:Math.min(1, u*6)}); }, {delay:i*.16}).then(()=> v === 2 ? null : hop(t, 2)); }))
    .then(()=>{ hop(t, 5); return Promise.all([ring(bx, by - sz*.4, {size:sz*3, color:'#ffd56e', w:3, dur:.4}), run(.7, u=> items.forEach(e=>{ e.style.opacity = 1 - seg(u, .4, 1); }), {delay:.3})]); }).then(()=> items.forEach(kill))]);
};

// masteryOrbit (Venom Master, Fletcher, Herbalist): the passive's own tool circles the card and dives in; v0 vials, v1 feathers fletch an arrow, v2 leaves.
W.masteryOrbit = function(t, o){
  o = o || {}; const v = o.v | 0, set = [['🧪', '#b873f0', 'rgba(170,90,230,.4)'], ['🪶', '#ffd56e', 'rgba(255,220,140,.4)'], ['🌿', '#7ee34a', 'rgba(120,220,90,.4)']][v] || ['🧪', '#b873f0', 'rgba(170,90,230,.4)'];
  const [b, early] = head(t, o, set[0]); if(early) return early; const n = 4, its = Array.from({length:n}, ()=> glyph(set[0], Math.max(16, b.w*.24)));
  return all(o, [run(1.15, u=>{ const inn = seg(u, .7, 1); its.forEach((e, i)=>{ const a = u*TAU*1.3 + i*TAU/n, R = (1 - eio(inn)); put(e, b.x + Math.cos(a)*b.w*.62*R, b.y + Math.sin(a)*b.h*.42*R, {r:Math.sin(a)*15, s:1 - .5*inn, op:Math.min(1, u*6)*(1 - seg(u, .95, 1))}); }); })
    .then(()=>{ its.forEach(kill); call(o.onImpact); hop(t, 5);
      const extra = v === 1 ? flyGlyph('🏹', Math.max(22, b.w*.4), {x:b.x, y:b.y}, {x:b.x, y:b.t - b.h*.3}, .7, {lift:0, s:u=> .5 + .7*eout(u), ease:eout}) : tint(b, set[2], .6, .8);
      return Promise.all([flash(b.x, b.y, b.w*1.1, set[2], .22), ring(b.x, b.y, {size:b.w*1.5, color:set[1], w:3, dur:.45}), extra,
        particles(b.x, b.y, {n:8, cls:v === 2 ? 'fxj-glyph' : 'fxj-twinkle', style:v === 2 ? glyphs('🍃', 13) : null, size:12, d0:b.w*.25, d1:b.w*.7, s0:.4, s1:1, dur:.7, spin:200})]); })]);
};

// loneWolfHowl (Lone Wolf): alone in its row; v0 a moon rises and howl rings go up, v1 a lone spotlight, v2 a single leaf on the breeze.
W.loneWolfHowl = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🐺'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const cone = node('fxj-cone', b.w*1.7, b.h*1.9);
    return all(o, [run(1.8, u=> put(cone, b.x, b.b - b.h*.95, {op:.9*fadeIO(u, .2, .3)})).then(()=> kill(cone)), run(.01, ()=>{}, {delay:.35}).then(()=>{ hop(t, 6);
      return particles(b.x, b.b - 8, {n:7, cls:'fxj-disc', size:()=> rnd(3, 6), bg:'rgba(255,244,190,.95)', a0:250, a1:290, d0:b.h*.3, d1:b.h*.9, sway:8, dur:1.3, stagger:.5, fadeStart:.5}); })]); }
  if(v === 2){ const leaf = glyph('🍃', Math.max(16, b.w*.26));
    return all(o, [run(2.0, u=>{ tset(t, {rotation:Math.sin(u*TAU*2)*2.5*(1 - u)}); put(leaf, b.l - b.w*.8 + (b.w*2.6)*u, b.y - b.h*.1 + Math.sin(u*TAU*1.5)*b.h*.25, {r:u*400, op:fadeIO(u, .1, .15)}); }).then(()=>{ kill(leaf); tclear(t); }),
      particles(b.l - b.w*.3, b.y, {n:3, cls:'fxj-glyph', style:glyphs('💨', 16), a0:-10, a1:10, d0:b.w*.8, d1:b.w*1.6, dur:1.3, stagger:.6, fadeStart:.5})]); }
  const moon = glyph('🌕', Math.max(20, b.w*.36)), mx = b.r - b.w*.1;
  return all(o, [run(2.1, u=>{ put(moon, mx, b.t - b.h*.05 - b.h*.32*eout(seg(u, 0, .4)), {op:fadeIO(u, .2, .2)}); tset(t, {rotation:-6*pulse(seg(u, .3, .8)), transformOrigin:'50% 100%'}); }).then(()=>{ kill(moon); tclear(t); }),
    ...[0, 1, 2].map(i=>{ const e = node('fxj-arc', b.w*.8, b.w*.8); return run(.8, u=> put(e, b.x - b.w*.1, b.t + b.w*.15 - b.h*.35*u, {s:.5 + 1.1*eout(u), op:.95*(1 - u)}), {delay:.6 + i*.22}).then(()=> kill(e)); })]);
};

// ghostDrift (Ghost): v0 a little sheet rises off the card and sways, v1 a swing passes clean through (o.from), v2 "boo!" pops out with puffs.
W.ghostDrift = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '👻'); if(early) return early; const v = o.v | 0;
  if(v === 1){ const f = boxOf(o.from) || {x:b.x - b.w*1.6, y:b.y + b.h*.6}, ang = Math.atan2(b.y - f.y, b.x - f.x), sl = svgNode(b.w*1.1, b.w*.5, '0 0 100 45', `<path d='M2 40 Q50 -12 98 40 Q50 8 2 40 Z' fill='#ffffff' stroke='#cfe0ff' stroke-width='2'/>`);
    return all(o, [run(.9, u=>{ const k = eio(seg(u, .1, .7)), d = b.w*1.6; put(sl, b.x + Math.cos(ang)*(k - .5)*d*2, b.y + Math.sin(ang)*(k - .5)*d*2, {r:ang/D2R, op:pulse(seg(u, .1, .7))});
        tset(t, {opacity:1 - .65*pulse(seg(u, .15, .85)), x:Math.sin(u*40)*3*pulse(seg(u, .2, .7))}); if(u > .4 && !sl._hit){ sl._hit = 1; call(o.onImpact); } }).then(()=>{ kill(sl); tclear(t); }),
      particles(b.x, b.y, {n:6, cls:'fxj-line', size:2, h:()=> rnd(12, 20), a0:ang/D2R - 15, a1:ang/D2R + 15, orient:true, d0:b.w*.4, d1:b.w*1.1, dur:.6, delay:.3})]); }
  if(v === 2){ const g = glyph('👻', Math.max(26, b.w*.5)); call(o.onImpact);
    return all(o, [run(1.3, u=>{ const up = eout(seg(u, 0, .3)) - ein(seg(u, .7, 1)); put(g, b.x, b.y - b.h*.55*up, {s:.4 + .8*up, r:Math.sin(u*14)*8, op:up > .02 ? 1 : 0}); tset(t, {scale:1 - .12*up}); }).then(()=>{ kill(g); tclear(t); }),
      particles(b.x, b.y - b.h*.3, {n:6, cls:'fxj-puff', size:()=> rnd(14, 22), d0:b.w*.2, d1:b.w*.6, s0:.3, s1:1.2, dur:.7, delay:.2}), ring(b.x, b.y - b.h*.3, {size:b.w*1.2, color:'#e6ecff', w:3, dur:.4, delay:.25})]); }
  const sh = svgNode(b.w*.62, b.w*.7, '0 0 100 110', `<path d='M10 108 L10 48 C10 16 30 4 50 4 C70 4 90 16 90 48 L90 108 L77 96 L64 108 L50 96 L36 108 L23 96 Z' fill='#ffffff' stroke='#b9c6e6' stroke-width='3' stroke-linejoin='round'/><ellipse cx='38' cy='46' rx='6' ry='8' fill='#2a2f45'/><ellipse cx='62' cy='46' rx='6' ry='8' fill='#2a2f45'/><ellipse cx='50' cy='68' rx='7' ry='5' fill='#2a2f45'/>`);
  call(o.onImpact);
  return all(o, [run(1.8, u=>{ const k = eout(seg(u, 0, .35)); put(sh, b.x + Math.sin(u*TAU*1.5)*b.w*.12, b.y - b.h*.35*k, {r:Math.sin(u*TAU*1.5)*8, sy:1 + .05*Math.sin(u*30), op:Math.min(1, u*5)*(1 - seg(u, .8, 1))}); tset(t, {opacity:1 - .5*pulse(seg(u, .05, .95))}); }).then(()=>{ kill(sh); tclear(t); })]);
};

// majestyBow (Majesty N): the enemies facing it (o.foes) bow; v0 golden rays fan out, v1 a bell rings and gold rings reach them, v2 a red carpet rolls to them.
W.majestyBow = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '👑'); if(early) return early; const v = o.v | 0, foes = listOf(o.foes), fb = foes.map(boxOf).filter(Boolean);
  const bow = (f, i)=> run(.7, u=> tset(f, {y:5*pulse(u), scaleY:1 - .07*pulse(u), rotation:(i % 2 ? 3 : -3)*pulse(u), transformOrigin:'50% 100%'}), {delay:.08*i}).then(()=> tclear(f));
  const bows = delay=> run(.01, ()=>{}, {delay}).then(()=>{ call(o.onImpact); return Promise.all(foes.map(bow).concat(fb.map(f=> twinkles(f.x, f.b - 6, {n:3, d1:f.w*.4})))); });
  if(v === 1){ const bell = glyph('🔔', Math.max(20, b.w*.36)), far = fb.reduce((m, f)=> Math.max(m, Math.hypot(f.x - b.x, f.y - b.y)), b.h*1.5);
    return all(o, [run(1.4, u=> put(bell, b.x, b.t - 14, {r:Math.sin(u*28)*22*(1 - u), op:fadeIO(u, .1, .2)})).then(()=> kill(bell)),
      ...[0, 1, 2].map(i=> ring(b.x, b.y, {size:far*2.1, color:'#ffd56e', w:3, dur:.75, glow:6, delay:.15 + i*.18})), bows(.6)]); }
  if(v === 2){ const tgt = fb.length ? boxOf(foes) : {x:b.x, y:b.y - b.h*1.5, w:b.w, h:b.h}, dx = tgt.x - b.x, dy = (tgt.b || tgt.y) - b.t, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx)/D2R;
    const cp = node('fxj-rect', len, b.w*.32); cp.style.background = 'linear-gradient(#ffd56e 0 12%, #c8243a 12% 88%, #ffd56e 88%)'; cp.style.borderRadius = '3px';
    return all(o, [run(1.5, u=>{ const k = eout(seg(u, 0, .4)); put(cp, b.x + dx*k/2, b.t + dy*k/2, {sx:Math.max(.01, k), r:ang, op:1 - seg(u, .8, 1)}); }).then(()=> kill(cp)),
      particles(tgt.x, tgt.b || tgt.y, {n:6, cls:'fxj-glyph', style:glyphs('🌸', 12), a0:200, a1:340, d0:10, d1:40, grav:20, dur:.9, delay:.5}), bows(.55)]); }
  const H = b.h*1.25, rays = Array.from({length:7}, ()=> node('fxj-ray', b.w*.5, H));
  return all(o, [run(1.5, u=> rays.forEach((r, i)=>{ const a = -90 + (i - 3)*24 + Math.sin(u*3)*4, k = .4 + .6*eout(seg(u, 0, .3)); put(r, b.x + Math.cos(a*D2R)*H*k/2, b.y + Math.sin(a*D2R)*H*k/2, {r:a - 90, sy:k, op:.85*fadeIO(u, .2, .3)}); })).then(()=> rays.forEach(kill)), bows(.4)]);
};

// exaltedGround (Consecration N): its side's ground is blessed; v0 a golden glow under each unit with rising motes, v1 halos settle on them, v2 petals and a bell.
W.exaltedGround = function(t, o){
  o = o || {}; const cards = listOf(t), bs = cards.map(boxOf).filter(Boolean), u0 = boxOf(cards); if(!u0) return none(o); if(RM()) return still(u0, '😇', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  if(v === 1) return all(o, bs.map((b, i)=>{ const h = node('fxj-ring', b.w*.7, b.w*.7); h.style.borderColor = '#ffe27a'; h.style.boxShadow = '0 0 8px #ffd56e';
    return run(1.1, u=>{ const k = eout(seg(u, 0, .45)); put(h, b.x, b.t - 30 + 36*k, {sy:.3, op:fadeIO(u, .15, .3)}); }, {delay:i*.15}).then(()=>{ kill(h); hop(cards[i], 3); return twinkles(b.x, b.t + 8, {n:4, d1:b.w*.4}); }); }));
  if(v === 2){ const bell = glyph('🔔', Math.max(22, u0.h*.2));
    return all(o, [run(1.6, u=> put(bell, u0.x, u0.t - 18, {r:Math.sin(u*26)*20*(1 - u), op:fadeIO(u, .1, .2)})).then(()=> kill(bell)),
      particles(u0.x, u0.t - 10, {n:12, cls:'fxj-glyph', style:glyphs(['🌸', '🌼'], i=> 12 + (i % 3)*3), a0:60, a1:120, d0:u0.h*.5, d1:u0.h*1.1, sway:u0.w*.25, dur:1.8, stagger:.6, spin:200, fadeStart:.6}),
      ...bs.map((b, i)=> tint(b, 'rgba(255,236,160,.55)', .9, .7, .3 + i*.1))]); }
  return all(o, bs.map((b, i)=>{ const g = node('fxj-disc', b.w*1.3, b.w*1.3); g.style.background = 'radial-gradient(circle, rgba(255,240,170,.95), rgba(255,214,90,.5) 45%, rgba(255,214,90,0) 70%)';
    return Promise.all([run(1.6, u=> put(g, b.x, b.b - 4, {sy:.32, s:1, sx:.6 + .4*eout(seg(u, 0, .3)), op:fadeIO(u, .2, .3)}), {delay:i*.1}).then(()=> kill(g)),
      particles(b.x, b.b - 6, {n:4, cls:'fxj-disc', size:()=> rnd(4, 7), bg:'radial-gradient(circle, #fff, #ffd56e)', a0:255, a1:285, d0:b.h*.4, d1:b.h*.9, sway:6, dur:1.2, stagger:.4, delay:.2 + i*.1, fadeStart:.5})]); }));
};

// encoreCurtain (Encore): one more swing; v0 a curtain call with roses, v1 a spotlight and claps, v2 a replay arrow spins and it lunges again.
W.encoreCurtain = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🔁'); if(early) return early; const v = o.v | 0;
  if(v === 1){ const cone = node('fxj-cone', b.w*1.6, b.h*1.8); call(o.onImpact); hop(t, 8);
    return all(o, [run(1.4, u=> put(cone, b.x, b.b - b.h*.9, {op:.85*fadeIO(u, .15, .3)})).then(()=> kill(cone)),
      ...[[-.75, -.2], [.75, -.3], [-.6, .35], [.62, .3]].map(([dx, dy], i)=>{ const c = glyph('👏', Math.max(16, b.w*.26)); return run(.5, u=> put(c, b.x + dx*b.w, b.y + dy*b.h, {s:.4 + .8*eout(u) + .1*Math.sin(u*30), op:fadeIO(u, .15, .3)}), {delay:.15 + i*.14}).then(()=> kill(c)); }),
      run(.01, ()=>{}, {delay:.55}).then(()=> hop(t, 6))]); }
  if(v === 2){ const R = Math.max(b.w, b.h)*.62, sv = svgNode(R*2, R*2, '0 0 100 100', `<path d='M50 8 A42 42 0 1 1 13 30' fill='none' stroke='#3b2a10' stroke-width='9' stroke-linecap='round'/><path d='M50 8 A42 42 0 1 1 13 30' fill='none' stroke='#ffd56e' stroke-width='5' stroke-linecap='round'/><path d='M2 22 L16 38 L24 18 Z' fill='#ffd56e' stroke='#3b2a10' stroke-width='2.5' stroke-linejoin='round'/>`);
    return all(o, [run(1.1, u=>{ put(sv, b.x, b.y, {r:-360*eio(seg(u, 0, .7)), s:.7 + .3*eout(seg(u, 0, .3)), op:fadeIO(u, .1, .2)}); tset(t, {x:-10*pulse(seg(u, .3, .65)) + 8*pulse(seg(u, .65, .9))}); if(u > .7 && !sv._hit){ sv._hit = 1; call(o.onImpact); } }).then(()=>{ kill(sv); tclear(t); })]); }
  const L = node('fxj-curtain', b.w*.62, b.h*1.15), R2 = node('fxj-curtain', b.w*.62, b.h*1.15);
  return all(o, [run(1.1, u=>{ const c = eout(seg(u, 0, .35)) - eio(seg(u, .55, .9)); put(L, b.l - b.w*.31 + b.w*.62*c, b.y, {op:1 - seg(u, .9, 1)}); put(R2, b.r + b.w*.31 - b.w*.62*c, b.y, {op:1 - seg(u, .9, 1)}); }).then(()=>{ kill(L); kill(R2); }),
    run(.01, ()=>{}, {delay:.75}).then(()=>{ call(o.onImpact); tset(t, {transformOrigin:'50% 100%'}); return run(.5, u=> tset(t, {scaleY:1 - .1*pulse(u), y:3*pulse(u)})).then(()=> tclear(t)); }),
    ...[0, 1, 2].map(i=> flyGlyph('🌹', 16, {x:b.x + (i - 1)*b.w*.9, y:b.b + 30}, {x:b.x + (i - 1)*b.w*.2, y:b.t + 6}, .55, {delay:.85 + i*.1, lift:40, spin:200}))]);
};

// meldLink (Meld): every Meld unit shares the grant; v0 beads run from one to the next, v1 puzzle pieces click together, v2 rings pulse in turn.
W.meldLink = function(t, o){
  o = o || {}; const cards = listOf(t), bs = cards.map(boxOf).filter(Boolean), u0 = boxOf(cards); if(!u0) return none(o); if(RM()) return still(u0, '🧩', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const ps = bs.map(b=>{ const e = glyph('🧩', Math.max(16, b.w*.3)); return {e, b}; });
    return all(o, [run(1.3, u=> ps.forEach(({e, b}, i)=>{ const go = eio(seg(u, .2, .5)) - eio(seg(u, .65, .95)); put(e, b.x + (u0.x - b.x)*go*.85, b.y + (u0.y - b.y)*go*.85, {r:(i - 1)*30*(1 - go), s:eout(seg(u, 0, .15)), op:1 - seg(u, .9, 1)}); })).then(()=> ps.forEach(p=> kill(p.e))),
      run(.01, ()=>{}, {delay:.65}).then(()=> Promise.all([flash(u0.x, u0.y, u0.h*.6, 'rgba(255,230,140,.9)', .22), ring(u0.x, u0.y, {size:u0.h*.9, color:'#ffd56e', w:3, dur:.45})]))]); }
  if(v === 2) return all(o, bs.map((b, i)=> ring(b.x, b.y, {size:b.w*1.5, color:'#9fe6ff', w:3, dur:.5, glow:6, delay:i*.2}).then(()=> hop(cards[i], 4))).concat([ring(u0.x, u0.y, {size:u0.w*1.25, sy:u0.h/u0.w*1.4, color:'#ffd56e', w:3, dur:.7, delay:.2*bs.length})]));
  const links = []; for(let i = 0; i < bs.length - 1; i++) links.push([bs[i], bs[i + 1], i]);
  return all(o, links.map(([a, z, i])=> Promise.all([0, 1, 2, 3].map(k=>{ const e = node('fxj-disc', 9, 9); e.style.background = 'radial-gradient(circle at 35% 30%, #fff, #8fe6ff 60%, #2a8fc9)';
    return run(.55, u=>{ const p = bez(a, {x:(a.x + z.x)/2, y:Math.min(a.y, z.y) - 26}, z, u); put(e, p.x, p.y, {op:pulse(u) + .2}); }, {delay:i*.5 + k*.09}).then(()=> kill(e)); })).then(()=>{ hop(cards[i + 1], 4); return ring(z.x, z.y, {size:z.w*1.3, color:'#8fe6ff', w:3, dur:.4}); }))
    .concat([ring(bs[0].x, bs[0].y, {size:bs[0].w*1.3, color:'#8fe6ff', w:3, dur:.4})]));
};

// =====================================================================================
// CRITS: one per damage type. o.element: physical heat cold acid poison decay magic water stone metal shock
// v0 a starburst pops behind the hit with the element's glyph, v1 two crossing slashes, v2 three rings and a squash.
// =====================================================================================
const EL = {
  physical:{g:'💢', c:'#ffffff', c2:'#ff8a5c', p:'spark'}, heat:{g:'🔥', c:'#ffe27a', c2:'#ff6a1e', p:'ember'}, cold:{g:'❄️', c:'#e9fbff', c2:'#5cb8f0', p:'shard'},
  acid:{g:'🧪', c:'#e0ffb0', c2:'#5fcf3a', p:'drop', d1:'#7ee34a', d2:'#3f9a22'}, poison:{g:'☠️', c:'#f0dcff', c2:'#9b4fd6', p:'bubble', b:'rgba(170,90,230,.5)'},
  decay:{g:'🍂', c:'#f2d9a6', c2:'#9a6a34', p:'crumb'}, magic:{g:'🪄', c:'#ffe6fa', c2:'#b06cff', p:'star'}, water:{g:'💧', c:'#dff4ff', c2:'#3b97e0', p:'drop', d1:'#6cc7ff', d2:'#2c7fc4'},
  stone:{g:'🪨', c:'#f3ead8', c2:'#9a917e', p:'rock'}, metal:{g:'⚙️', c:'#ffffff', c2:'#aeb8c6', p:'spark'}, shock:{g:'⚡', c:'#fffbd0', c2:'#ffd400', p:'spark'},
};
const SZ = {spark:[3, 3], ember:[5, 9], shard:[9, 14], drop:[8, 13], bubble:[8, 15], crumb:[5, 9], star:[9, 16], rock:[7, 12]};
function elemBits(k, x, y, o){
  const style = (i, e)=>{ if(k.d1){ e.style.setProperty('--d1', k.d1); e.style.setProperty('--d2', k.d2); } if(k.b) e.style.setProperty('--b', k.b); e.style.setProperty('--k', k.c2); }, sz = SZ[k.p];
  return particles(x, y, Object.assign({n:12, cls:'fxj-' + k.p, size:()=> rnd(sz[0], sz[1]), h:k.p === 'spark' ? ()=> rnd(12, 20) : k.p === 'shard' ? ()=> rnd(14, 20) : null,
    orient:k.p === 'spark' || k.p === 'shard', style, dur:.75, fadeStart:.4, spin:/star|rock|crumb/.test(k.p) ? 240 : 0}, o));
}
function burstPath(r1, r2, n){ let d = ''; for(let i = 0; i < n*2; i++){ const a = i/(n*2)*TAU - Math.PI/2, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (50 + Math.cos(a)*r).toFixed(1) + ' ' + (50 + Math.sin(a)*r).toFixed(1); } return d + 'Z'; }
W.critElement = function(t, o){
  o = o || {}; const k = EL[o.element] || EL.physical, [b, early] = head(t, o, k.g); if(early) return early; const v = o.v | 0, D = Math.max(b.w, b.h)*1.25; call(o.onImpact);
  if(v === 1){ const sl = [-1, 1].map(s=>{ const e = node('fxj-disc', b.w*1.7, 12); e.style.borderRadius = '50%'; e.style.background = `linear-gradient(90deg, rgba(255,255,255,0), ${k.c2} 25%, #fff 50%, ${k.c2} 75%, rgba(255,255,255,0))`; return {e, s}; });
    jolt(t, 6, -2, 1.6);
    return all(o, [run(.55, u=> sl.forEach(({e, s}, i)=>{ const q = seg(u, i*.18, i*.18 + .45); put(e, b.x, b.y, {r:s*35, sx:Math.max(.01, eout(q)), sy:1 - .6*q, op:q > 0 ? 1 - ein(q) : 0}); })).then(()=> sl.forEach(x=> kill(x.e))),
      elemBits(k, b.x, b.y, {d0:b.w*.3, d1:b.w*.95, delay:.1}), flash(b.x, b.y, b.w*.9, k.c2, .2)]); }
  if(v === 2){ tset(t, {transformOrigin:'50% 100%'});
    return all(o, [...[k.c2, k.c, '#ffffff'].map((c, i)=> ring(b.x, b.y, {size:D*(1.1 + i*.35), color:c, w:5 - i, dur:.55, glow:6, delay:i*.09})),
      run(.6, u=> tset(t, {scaleX:1 + .12*pulse(seg(u, 0, .3)) - .04*pulse(seg(u, .3, .7)), scaleY:1 - .16*pulse(seg(u, 0, .3)) + .06*pulse(seg(u, .3, .7))})).then(()=> tclear(t)),
      elemBits(k, b.x, b.y, {n:14, d0:D*.45, d1:D*.75})]); }
  const st = svgNode(D*1.4, D*1.4, '0 0 100 100', `<path d='${burstPath(48, 30, 12)}' fill='${k.c2}' stroke='#2a1a10' stroke-width='2.5' stroke-linejoin='round'/><path d='${burstPath(34, 20, 12)}' fill='${k.c}'/>`), gl = glyph(k.g, Math.max(26, b.w*.5));
  jolt(t, 3, -4, 1.4);
  return all(o, [run(.75, u=>{ const s = u < .25 ? .3 + .9*eout(u/.25) : 1.2 - .2*eout(seg(u, .25, .45)); put(st, b.x, b.y, {s:s*.7, r:20*u, op:1 - seg(u, .7, 1)}); put(gl, b.x, b.y - b.h*.05, {s:.5 + .9*eout(seg(u, 0, .3)) + .08*Math.sin(u*30), r:Math.sin(u*20)*8, op:1 - seg(u, .7, 1)}); }).then(()=>{ kill(st); kill(gl); }),
    elemBits(k, b.x, b.y, {d0:b.w*.35, d1:b.w*.9})]);
};
W.critElements = Object.keys(EL);

// =====================================================================================
// HEAL, SHIELD AND CLEANSE (new looks beside SkillFX.heal / shieldUp / cleanseVfx)
// =====================================================================================
// healHearts: v0 hearts in bubbles float up and pop, v1 a flower blooms on the card, v2 a plaster slaps on and peels off.
W.healHearts = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '💗'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const fl = glyph('🌸', Math.max(26, b.w*.55));
    return all(o, [run(1.3, u=> put(fl, b.x, b.y, {s:1.3*eout(seg(u, 0, .35)) + .05*Math.sin(u*20), r:90*eout(seg(u, 0, .35)), op:1 - seg(u, .75, 1)})).then(()=> kill(fl)), tint(b, 'rgba(150,240,170,.45)', 1.0, .7),
      particles(b.x, b.y, {n:7, cls:'fxj-glyph', style:glyphs('🌸', 11), d0:b.w*.25, d1:b.w*.7, grav:b.h*.4, dur:1.1, delay:.4, spin:240, fadeStart:.5})]); }
  if(v === 2){ const pl = glyph('🩹', Math.max(26, b.w*.55));
    return all(o, [run(1.5, u=>{ const d = seg(u, 0, .2), pe = seg(u, .7, 1); put(pl, b.x + b.w*.35*ein(pe), b.y - b.h*.6*(1 - eout(d)) - b.h*.5*ein(pe), {sx:1 + .3*pulse(seg(u, .2, .3)), sy:1 - .3*pulse(seg(u, .2, .3)), r:-20 + 20*eout(d) + 60*pe, op:Math.min(1, u*8)*(1 - seg(u, .85, 1))}); if(u > .2 && !pl._hit){ pl._hit = 1; jolt(t, 0, 2, .6); } }).then(()=> kill(pl)),
      twinkles(b.x, b.y, {n:5, d0:b.w*.3, d1:b.w*.65, delay:.3}), tint(b, 'rgba(255,200,215,.4)', .9, .6, .2)]); }
  return all(o, [tint(b, 'rgba(255,170,200,.35)', 1.0, .6), particles(b.x, b.b - 8, {n:7, cls:'fxj-bubble', size:()=> rnd(18, 24), style:(i, e)=>{ e.textContent = '💗'; e.style.fontSize = '11px'; e.style.lineHeight = e.style.height; e.style.setProperty('--b', 'rgba(255,170,210,.4)'); },
    a0:255, a1:285, d0:b.h*.45, d1:b.h*1.0, sway:10, s0:.5, s1:1.25, dur:1.3, stagger:.5, fadeStart:.75})]);
};

// lifeLink: a heal that travels from the healer (o.from) to its target; v0 three hearts arc over, v1 a green orb hops over, v2 a little cloud rains on it.
W.lifeLink = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '💚'); if(early) return early; const v = o.v | 0, f = boxOf(o.from) || {x:b.x - b.w*1.4, y:b.y, w:b.w, h:b.h};
  const land = ()=>{ call(o.onImpact); hop(t, 4); return Promise.all([tint(b, 'rgba(140,240,160,.45)', .7, .7), twinkles(b.x, b.y, {n:5, d1:b.w*.6})]); };
  if(v === 1){ const orb = node('fxj-disc', 16, 16); orb.style.background = 'radial-gradient(circle at 35% 30%, #fff, #7ef0a0 55%, #2bb05a)'; orb.style.boxShadow = '0 0 8px #7ef0a0';
    const pts = [0, 1, 2, 3].map(i=> ({x:f.x + (b.x - f.x)*i/3, y:f.y + (b.y - f.y)*i/3}));
    return all(o, [run(1.0, u=>{ const s = Math.min(2, Math.floor(u*3)), q = u*3 - s, a = pts[s], z = pts[s + 1], p = bez(a, {x:(a.x + z.x)/2, y:Math.min(a.y, z.y) - 36}, z, q); put(orb, p.x, p.y, {sx:1 + .2*Math.sin(q*Math.PI), op:1}); }).then(()=>{ kill(orb); return land(); }),
      ...[1, 2].map(i=> run(.01, ()=>{}, {delay:i/3}).then(()=> ring(pts[i].x, pts[i].y, {size:28, color:'#7ef0a0', w:2, dur:.35})))]); }
  if(v === 2){ const cl = glyph('☁️', Math.max(26, b.w*.6)), cy = b.t - b.h*.15;
    return all(o, [run(1.6, u=> put(cl, b.x, cy, {s:.5 + .5*eout(seg(u, 0, .2)), op:fadeIO(u, .12, .2)})).then(()=> kill(cl)),
      particles(b.x, cy + 8, {n:10, cls:'fxj-drop', size:()=> rnd(6, 9), h:()=> rnd(9, 12), style:(i, e)=>{ e.style.setProperty('--d1', '#8ff0a8'); e.style.setProperty('--d2', '#2bb05a'); }, a0:85, a1:95, d0:b.h*.55, d1:b.h*.85, dur:.6, stagger:.6, delay:.25, fadeStart:.7}).then(land)]); }
  return all(o, [Promise.all([0, 1, 2].map(i=> flyGlyph('💗', 16 + i*2, f, {x:b.x, y:b.y}, .6, {delay:i*.14, lift:50 + i*14, s:u=> .6 + .5*pulse(u)}).then(()=> ring(b.x, b.y, {size:b.w*.8, color:'#ff9ac6', w:2, dur:.3})))).then(land)]);
};

// shieldBubble: v0 a soap bubble forms round the card and wobbles, v1 it pops (the shield breaks), v2 a big leaf curls in front as a shield.
W.shieldBubble = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🫧'); if(early) return early; const v = o.v | 0;
  if(v === 2){ const lf = glyph('🍃', Math.max(30, b.w*.85)); call(o.onImpact);
    return all(o, [run(1.4, u=>{ const k = eout(seg(u, 0, .35)); put(lf, b.l - b.w*.3 + b.w*.75*k, b.b - b.h*.1 - b.h*.35*k, {r:-80 + 70*k + Math.sin(u*12)*3*seg(u, .35, .8), s:.5 + .5*k, op:Math.min(1, u*6)*(1 - seg(u, .8, 1))}); }).then(()=> kill(lf)),
      twinkles(b.x + b.w*.25, b.y - b.h*.2, {n:3, d1:14, delay:.45}), particles(b.x, b.y, {n:4, cls:'fxj-glyph', style:glyphs('🍃', 12), d0:b.w*.3, d1:b.w*.7, grav:b.h*.3, dur:1.0, delay:.4, spin:260})]); }
  const bu = node('fxj-bubble', b.w*1.38, b.h*1.2); bu.style.setProperty('--b', 'rgba(170,225,255,.22)'); bu.style.borderWidth = '3px';
  if(v === 1) return all(o, [run(.85, u=>{ const w = Math.sin(u*34)*.07*seg(u, .25, .9); put(bu, b.x, b.y, {sx:eout(seg(u, 0, .25)) + w, sy:eout(seg(u, 0, .25)) - w, op:1}); }).then(()=>{ kill(bu); call(o.onImpact); jolt(t, 0, 0, .8);
      return Promise.all([ring(b.x, b.y, {size:b.h*1.4, color:'#cfefff', w:3, dur:.4}), particles(b.x, b.y, {n:12, cls:'fxj-drop', size:()=> rnd(6, 10), h:()=> rnd(8, 12), style:(i, e)=>{ e.style.setProperty('--d1', '#bfe8ff'); }, d0:b.w*.5, d1:b.w*.95, grav:30, orient:true, dur:.6})]); })]);
  call(o.onImpact);
  return all(o, [run(1.7, u=>{ const w = Math.sin(u*26)*.06*(1 - seg(u, 0, .6)); put(bu, b.x, b.y, {sx:.3 + .7*eout(seg(u, 0, .3)) + w, sy:.3 + .7*eout(seg(u, 0, .3)) - w, op:1 - seg(u, .7, 1)}); }).then(()=> kill(bu)),
    particles(b.x, b.b - 4, {n:4, cls:'fxj-bubble', size:()=> rnd(7, 12), a0:255, a1:285, d0:b.h*.4, d1:b.h*.9, sway:6, dur:1.1, stagger:.4, delay:.3})]);
};

// cleanseWash: statuses washed off; v0 a foamy rinse sweeps across, v1 soap bubbles scrub round and pop, v2 a sunburst dries the grime away.
W.cleanseWash = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🧼'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const n = 8, bs = Array.from({length:n}, ()=>{ const e = node('fxj-bubble', 14, 14); return e; });
    return all(o, [run(1.2, u=> bs.forEach((e, i)=>{ const a = i/n*TAU + u*TAU*1.6, R = 1 - .6*eio(seg(u, .3, .85)); put(e, b.x + Math.cos(a)*b.w*.5*R, b.y + Math.sin(a)*b.h*.45*R, {s:.5 + .5*eout(seg(u, 0, .2)) + .6*seg(u, .85, 1), op:1 - seg(u, .88, 1)}); })).then(()=> bs.forEach(kill)),
      run(.01, ()=>{}, {delay:1.0}).then(()=> Promise.all([twinkles(b.r - b.w*.2, b.t + b.h*.2, {n:3, d1:16}), hop(t, 4)]))]); }
  if(v === 2){ const rays = Array.from({length:8}, ()=> node('fxj-ray', b.w*.36, b.h*.8));
    return all(o, [run(1.4, u=> rays.forEach((r, i)=>{ const a = i*45 + u*60; put(r, b.x + Math.sin(a*D2R)*b.h*.4, b.y - Math.cos(a*D2R)*b.h*.4, {r:a + 180, op:.7*fadeIO(u, .2, .3)}); })).then(()=> rays.forEach(kill)),
      particles(b.x, b.y, {n:7, cls:'fxj-puff', size:()=> rnd(12, 20), style:(i, e)=>{ e.style.setProperty('--p0', '#b9b1a3'); e.style.setProperty('--p1', '#8e8676'); e.style.setProperty('--p2', '#6e6758'); }, a0:240, a1:300, d0:b.h*.3, d1:b.h*.75, s0:.6, s1:.2, dur:1.1, stagger:.3, fadeStart:.3}),
      twinkles(b.x, b.y, {n:5, d1:b.w*.6, delay:.8})]); }
  const L = boxLayer(b), wv = child(L, `width:${b.w*1.7}px; height:${b.h*1.2}px; border-radius:46% 54% 0 0 / 22% 22% 0 0; background:linear-gradient(rgba(255,255,255,.95) 0 6%, rgba(170,236,255,.85) 7%, rgba(90,190,240,.55)); box-shadow:0 -4px 0 rgba(255,255,255,.7)`);
  return all(o, [run(1.1, u=>{ put(L, b.x, b.y, {op:fadeIO(u, .1, .25)}); tf(wv, -b.w*1.7 + b.w*2.9*eio(u), b.h*.1, {}); }).then(()=> kill(L)),
    particles(b.x, b.y, {n:7, cls:'fxj-crumb', size:()=> rnd(5, 9), style:(i, e)=>{ e.style.setProperty('--c0', '#8e8676'); e.style.setProperty('--c1', '#5e5648'); }, a0:-25, a1:25, d0:b.w*.6, d1:b.w*1.2, dur:.8, delay:.25, spin:300}),
    particles(b.r, b.y, {n:5, cls:'fxj-bubble', size:()=> rnd(6, 11), a0:-40, a1:40, d0:10, d1:b.w*.5, dur:.7, delay:.5}), twinkles(b.x, b.y, {n:4, d1:b.w*.5, delay:.8})]);
};

// =====================================================================================
// SUMMONS: arrivals by creature type (the card itself moves in; it is hidden until it arrives)
// =====================================================================================
// arriveSwoop (birds and flyers): v0 an arc swoop with a feather burst, v1 a dive from high with wind lines, v2 a spiral glide down.
W.arriveSwoop = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🪶'); if(early) return early; const v = o.v | 0; tset(t, {opacity:0});
  const land = ()=>{ call(o.onImpact); return Promise.all([particles(b.x, b.y, {n:7, cls:'fxj-glyph', style:glyphs('🪶', i=> 12 + (i % 3)*3), a0:200, a1:340, d0:b.w*.3, d1:b.w*.8, grav:b.h*.5, sway:10, dur:.85, spin:260, fadeStart:.5}),
    ring(b.x, b.b - 4, {size:b.w*1.6, sy:.3, color:'#e8ddc8', w:3, dur:.4})]); };
  if(v === 1) return all(o, [run(.9, u=>{ const f = seg(u, 0, .45), hv = seg(u, .45, 1); tset(t, {y:-b.h*3*(1 - ein(f)) - (u > .45 ? 10*Math.sin(hv*Math.PI*2)*(1 - hv) : 0), opacity:Math.min(1, u*6), scale:.85 + .15*f}); }).then(()=>{ tclear(t); return land(); }),
    particles(b.x, b.y - b.h, {n:7, cls:'fxj-line', size:2, h:()=> rnd(18, 30), a0:265, a1:275, d0:b.h*.6, d1:b.h*1.4, dur:.45, stagger:.15})]);
  if(v === 2) return all(o, [run(1.0, u=>{ const k = eout(u); tset(t, {x:Math.sin(u*Math.PI*3)*b.w*.9*(1 - k), y:-b.h*2.4*(1 - k), rotation:Math.sin(u*Math.PI*3)*18*(1 - k), scale:.5 + .5*k, opacity:Math.min(1, u*5)}); }).then(()=>{ tclear(t); return Promise.all([land(), twinkles(b.x, b.y, {n:4, d1:b.w*.6})]); })]);
  const a = {x:-b.w*2.2, y:-b.h*1.6}, m = {x:-b.w*.4, y:-b.h*2.2}, z = {x:0, y:0};
  return all(o, [run(.75, u=>{ const p = bez(a, m, z, eout(u)); tset(t, {x:p.x, y:p.y, rotation:-25*(1 - u), scale:.7 + .3*u, opacity:Math.min(1, u*5)}); })
    .then(()=>{ tset(t, {transformOrigin:'50% 100%'}); return Promise.all([land(), run(.35, u=> tset(t, {scaleX:1 + .1*pulse(u), scaleY:1 - .12*pulse(u)})).then(()=> tclear(t))]); })]);
};

// arriveBurrow (moles, ants, worms): v0 a dirt mound bulges and pops it up, v1 a tunnel of bumps runs to the slot first, v2 a sand swirl spins it up.
W.arriveBurrow = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🕳️'); if(early) return early; const v = o.v | 0; tset(t, {opacity:0});
  const up = (d)=> run(.45, u=> tset(t, {transformOrigin:'50% 100%', y:b.h*.45*(1 - eout(u)), scaleY:.2 + .8*eout(u) + .06*pulse(seg(u, .6, 1)), opacity:Math.min(1, u*4)}), {delay:d}).then(()=> tclear(t));
  const clods = d=> particles(b.x, b.b - 6, {n:10, cls:'fxj-crumb', size:()=> rnd(5, 10), a0:210, a1:330, d0:b.w*.3, d1:b.w*.9, grav:b.h*.6, dur:.8, delay:d, spin:300});
  if(v === 2){ const n = 14, gs = Array.from({length:n}, ()=>{ const e = node('fxj-disc', 5, 5); e.style.background = '#e2c48a'; return e; });
    return all(o, [run(1.0, u=> gs.forEach((e, i)=>{ const a = i/n*TAU + u*TAU*2, R = b.w*.75*(1 - eio(u)); put(e, b.x + Math.cos(a)*R, b.b - b.h*.2 + Math.sin(a)*R*.3, {op:fadeIO(u, .1, .15)}); })).then(()=> gs.forEach(kill)),
      run(.6, u=> tset(t, {rotation:-200*(1 - eout(u)), scale:.2 + .8*eout(u), opacity:Math.min(1, u*4)}), {delay:.55}).then(()=>{ tclear(t); call(o.onImpact); return ring(b.x, b.b - 4, {size:b.w*1.5, sy:.3, color:'#e2c48a', w:3, dur:.4}); })]); }
  const mound = node('fxj-mound', b.w*1.1, b.h*.26), bumps = v === 1 ? [0, 1, 2, 3].map(()=> node('fxj-mound', b.w*.4, b.h*.12)) : [], lead = v === 1 ? .6 : 0;
  return all(o, [...bumps.map((e, i)=>{ const x = b.l - b.w*1.6 + i*b.w*.42; return run(.35, u=> put(e, x, b.b - b.h*.04, {sy:pulse(u), op:pulse(u)}), {delay:i*.13}).then(()=> kill(e)); }),
    run(.9, u=>{ const g = seg(u, 0, .45); put(mound, b.x, b.b - b.h*.1, {sy:.2 + .8*eout(g) + .08*Math.sin(u*40)*(1 - seg(u, .4, .5)), sx:1 + .05*Math.sin(u*30), op:Math.min(1, u*6)*(1 - seg(u, .55, .9))}); }, {delay:lead}).then(()=> kill(mound)),
    clods(lead + .4), up(lead + .4).then(()=>{ call(o.onImpact); hop(t, 4); })]);
};

// arriveSplash (swimmers, fish, tide): v0 it leaps out of a splash, v1 it floats up in a bubble that pops, v2 a wave carries it in.
W.arriveSplash = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '💦'); if(early) return early; const v = o.v | 0; tset(t, {opacity:0});
  const drops = (x, y, d)=> particles(x, y, {n:10, cls:'fxj-drop', size:()=> rnd(7, 11), h:()=> rnd(10, 15), a0:235, a1:305, d0:b.h*.3, d1:b.h*.8, grav:b.h*.6, dur:.8, delay:d, fadeStart:.5});
  if(v === 1){ const bu = node('fxj-bubble', b.w*1.3, b.w*1.3);
    return all(o, [run(1.0, u=>{ const k = eout(u), y = b.h*.9*(1 - k), sw = Math.sin(u*TAU*1.2)*6*(1 - u); tset(t, {y, x:sw, opacity:Math.min(1, u*4), scale:.8 + .2*k}); put(bu, b.x + sw, b.y + y, {s:1, op:Math.min(1, u*5)}); })
      .then(()=>{ kill(bu); tclear(t); call(o.onImpact); return Promise.all([ring(b.x, b.y, {size:b.w*1.5, color:'#cfefff', w:3, dur:.35}), particles(b.x, b.y, {n:10, cls:'fxj-drop', size:()=> rnd(6, 9), d0:b.w*.5, d1:b.w*.9, orient:true, dur:.55})]); })]); }
  if(v === 2){ const L = boxLayer({w:b.w*3, h:b.h*.6}), wv = child(L, `width:${b.w*1.8}px; height:${b.h*.6}px; border-radius:50% 50% 0 0 / 60% 60% 0 0; background:linear-gradient(rgba(255,255,255,.95) 0 8%, #74cdff 9%, #3b97e0)`);
    return all(o, [run(1.1, u=>{ const k = eout(seg(u, 0, .75)); put(L, b.x - b.w*.5, b.b - b.h*.22, {op:fadeIO(u, .1, .25)}); tf(wv, -b.w*1.8 + b.w*2.5*k, b.h*.18 + Math.sin(u*20)*2, {}); tset(t, {x:-b.w*1.8*(1 - k), y:-6*Math.abs(Math.sin(u*14))*(1 - k), opacity:Math.min(1, u*4)}); }).then(()=>{ kill(L); tclear(t); call(o.onImpact); }),
      particles(b.x, b.b - 6, {n:6, cls:'fxj-bubble', size:()=> rnd(6, 11), a0:200, a1:340, d0:10, d1:b.w*.5, dur:.7, delay:.8})]); }
  return all(o, [ring(b.x, b.b - 6, {size:b.w*1.8, sy:.3, color:'#9fdcff', w:4, dur:.5}), drops(b.x, b.b - 8, 0),
    run(.85, u=>{ const y = u < .55 ? b.h*.6 - b.h*1.1*eout(u/.55) : -b.h*.5*(1 - ein((u - .55)/.45)); tset(t, {y, opacity:Math.min(1, u*5), rotation:(1 - u)*-8}); })
      .then(()=>{ tclear(t); call(o.onImpact); jolt(t, 0, 3, .7); return Promise.all([ring(b.x, b.b - 4, {size:b.w*1.3, sy:.3, color:'#cfefff', w:3, dur:.35}), drops(b.x, b.b - 4, 0)]); })]);
};

// arriveHatch (hatchlings): v0 the egg cracks and its halves fall apart, v1 it hops twice and the top flies off, v2 it pops like popcorn.
const EGG_TOP = `<path d='M4 70 C6 46 24 4 50 4 C76 4 94 46 96 70 L84 61 L72 72 L60 61 L48 72 L36 61 L24 72 L12 61 Z' fill='#fff6e2' stroke='#b9935a' stroke-width='3' stroke-linejoin='round'/><circle cx='34' cy='34' r='6' fill='#e8c98e'/><circle cx='64' cy='22' r='4' fill='#e8c98e'/><circle cx='70' cy='48' r='5' fill='#e8c98e'/>`;
const EGG_BOT = `<path d='M4 70 L12 61 L24 72 L36 61 L48 72 L60 61 L72 72 L84 61 L96 70 C96 102 76 118 50 118 C24 118 4 102 4 76 Z' fill='#fff6e2' stroke='#b9935a' stroke-width='3' stroke-linejoin='round'/><circle cx='30' cy='92' r='5' fill='#e8c98e'/><circle cx='66' cy='100' r='6' fill='#e8c98e'/>`;
W.arriveHatch = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🐣'); if(early) return early; const v = o.v | 0; tset(t, {opacity:0});
  const ew = Math.min(b.w*.95, b.h*.8), eh = ew*1.2, top = svgNode(ew, eh, '0 0 100 120', EGG_TOP), bot = svgNode(ew, eh, '0 0 100 120', EGG_BOT);
  const pop = ()=>{ call(o.onImpact); return Promise.all([run(.45, u=> tset(t, {scale:.6 + .4*eout(u) + .08*pulse(seg(u, .5, 1)), opacity:Math.min(1, u*4)})).then(()=> tclear(t)),
    particles(b.x, b.y - b.h*.1, {n:3, cls:'fxj-glyph', style:glyphs('💗', 14), a0:240, a1:300, d0:b.h*.3, d1:b.h*.6, dur:.9}), twinkles(b.x, b.y, {n:5, d1:b.w*.6})]); };
  const egg = (fn, dur)=> run(dur, u=> fn(u)).then(()=>{ kill(top); kill(bot); });
  if(v === 2) return all(o, [egg(u=>{ const sq = pulse(seg(u, .1, .5)), gone = seg(u, .55, .75); [top, bot].forEach(e=> put(e, b.x, b.y, {sx:1 + .18*sq + .3*gone, sy:1 - .16*sq + .3*gone, op:Math.min(1, u*8)*(1 - gone)})); }, .8),
    run(.01, ()=>{}, {delay:.5}).then(()=> Promise.all([particles(b.x, b.y, {n:7, cls:'fxj-puff', size:()=> rnd(16, 26), d0:b.w*.2, d1:b.w*.65, s0:.4, s1:1.2, dur:.6}), ring(b.x, b.y, {size:b.w*1.5, color:'#fff6e2', w:4, dur:.4}), pop()]))]);
  if(v === 1) return all(o, [egg(u=>{ const hopY = Math.abs(Math.sin(seg(u, 0, .5)*Math.PI*2))*14, off = seg(u, .55, 1); put(bot, b.x, b.y - hopY, {op:Math.min(1, u*8)*(1 - seg(u, .7, .9))});
      put(top, b.x + b.w*.6*off, b.y - hopY - b.h*.9*eout(off) + b.h*1.2*ein(seg(u, .75, 1)), {r:300*off, op:Math.min(1, u*8)*(1 - seg(u, .85, 1))}); }, 1.3),
    run(.01, ()=>{}, {delay:.72}).then(pop)]);
  return all(o, [egg(u=>{ const wob = Math.sin(u*40)*10*seg(u, .1, .5)*(1 - seg(u, .5, .55)), op = seg(u, .55, 1); put(top, b.x - b.w*.35*eout(op), b.y - b.h*.25*eout(op) + b.h*.4*ein(op), {r:wob - 50*op, op:Math.min(1, u*8)*(1 - seg(u, .8, 1))});
      put(bot, b.x + b.w*.25*eout(op), b.y + b.h*.3*ein(op), {r:wob + 30*op, op:Math.min(1, u*8)*(1 - seg(u, .75, .95))}); }, 1.4),
    run(.01, ()=>{}, {delay:.75}).then(()=> Promise.all([flash(b.x, b.y, b.w, 'rgba(255,246,200,.9)', .2), pop()]))]);
};

// arriveSkitter (insects): v0 a swarm of bugs runs together into the card, v1 it lowers on a silk thread, v2 a leaf lifts off it.
W.arriveSkitter = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🐜'); if(early) return early; const v = o.v | 0; tset(t, {opacity:0});
  if(v === 1){ const H = b.h*2.4, ln = node('fxj-line', 2, H); ln.style.setProperty('--k', '#ffffff');
    return all(o, [run(1.4, u=>{ const d = seg(u, 0, .5), y = -b.h*2*(1 - eout(d)) + (u > .5 ? Math.sin((u - .5)*20)*5*(1 - seg(u, .5, .9)) : 0); tset(t, {y, opacity:Math.min(1, u*6)}); put(ln, b.x, b.t + y - H/2, {op:u < .85 ? 1 : 0, sy:1}); if(u > .5 && !ln._hit){ ln._hit = 1; call(o.onImpact); } }).then(()=>{ kill(ln); tclear(t); }),
      run(.01, ()=>{}, {delay:1.2}).then(()=> ring(b.x, b.t, {size:22, color:'#fff', w:2, dur:.3}))]); }
  if(v === 2){ const lf = glyph('🍃', Math.max(34, b.w*1.15));
    return all(o, [run(1.2, u=>{ const go = seg(u, .4, 1); put(lf, b.x + b.w*1.1*eout(go), b.y - b.h*1.2*eout(go), {r:Math.sin(u*30)*6*(1 - seg(u, .3, .4)) + 140*go, op:Math.min(1, u*8)*(1 - seg(u, .8, 1))}); tset(t, {opacity:seg(u, .3, .55)}); }).then(()=>{ kill(lf); tclear(t); call(o.onImpact); hop(t, 4); })]); }
  const n = 14, bugs = Array.from({length:n}, ()=>{ const a = rnd(0, TAU), d = rnd(b.w*1.1, b.w*2.2); return {e:node('fxj-bug', 7, 6), a, d, w:rnd(-1, 1)}; });
  return all(o, [run(1.0, u=>{ const k = eio(seg(u, 0, .75)); bugs.forEach(g=>{ const r = g.d*(1 - k), x = b.x + Math.cos(g.a)*r + Math.sin(u*30 + g.a*5)*4*g.w, y = b.y + Math.sin(g.a)*r*.8; put(g.e, x, y, {r:g.a/D2R + 180, op:Math.min(1, u*6)*(1 - seg(u, .75, .9))}); }); tset(t, {opacity:seg(u, .6, .9), scale:.85 + .15*seg(u, .6, 1)}); })
    .then(()=>{ bugs.forEach(g=> kill(g.e)); tclear(t); call(o.onImpact); hop(t, 5); return ring(b.x, b.y, {size:b.w*1.3, color:'#e2c48a', w:3, dur:.35}); })]);
};

// =====================================================================================
// LEAVING THE BOARD (the caller's re-render removes the card; here it is put back as it was found)
// =====================================================================================
// returnToHand (a unit sent back to its owner's hand; o.to: the hand): v0 it boings away in an arc, v1 it rewinds, v2 a string yanks it down.
W.returnToHand = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '↩️'); if(early) return early; const v = o.v | 0, to = boxOf(o.to) || {x:b.x, y:b.b + b.h*1.6}, dx = to.x - b.x, dy = to.y - b.y; call(o.onImpact);
  if(v === 1) return all(o, [run(.9, u=>{ const back = pulse(seg(u, 0, .3)), k = ein(seg(u, .3, 1)); tset(t, {x:dx*k - dx*.06*back, y:dy*k - dy*.06*back, scale:1 - .55*k, opacity:1 - seg(u, .8, 1)}); }).then(()=> tclear(t)),
    ...[0, 1].map(i=>{ const g = glyph('⏪', Math.max(16, b.w*.3)); return run(.35, u=> put(g, b.x, b.y, {s:.6 + .6*eout(u), op:1 - u}), {delay:i*.15}).then(()=> kill(g)); }),
    particles(b.x, b.y, {n:6, cls:'fxj-line', size:2, h:()=> rnd(14, 22), a0:Math.atan2(-dy, -dx)/D2R - 12, a1:Math.atan2(-dy, -dx)/D2R + 12, orient:true, d0:b.h*.3, d1:b.h*.8, dur:.5, delay:.3})]);
  if(v === 2){ const len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx)/D2R, st = node('fxj-rect', len, 3); st.style.background = '#f3e6c8'; st.style.borderRadius = '2px';
    return all(o, [run(1.1, u=>{ const yank = ein(seg(u, .45, 1)), rem = 1 - yank; put(st, b.x + dx*yank + dx*rem/2, b.y + dy*yank + dy*rem/2, {r:ang + Math.sin(u*40)*2*(1 - seg(u, .3, .45)), sx:Math.max(.02, rem), op:Math.min(1, u*6)*(1 - seg(u, .9, 1))});
        tset(t, {x:dx*yank, y:dy*yank, rotation:Math.sin(u*40)*3*seg(u, .25, .45)*(1 - yank), scale:1 - .5*yank, opacity:1 - seg(u, .85, 1)}); }).then(()=>{ kill(st); tclear(t); })]); }
  return all(o, [ring(b.x, b.y, {size:b.w*1.4, color:'#ffd56e', w:3, dur:.35}), run(.85, u=>{ const p = bez({x:0, y:0}, {x:dx*.5, y:Math.min(0, dy) - b.h*.6}, {x:dx, y:dy}, u); tset(t, {x:p.x, y:p.y, rotation:-200*u, scale:1 - .55*u, opacity:1 - seg(u, .75, 1)}); }).then(()=>{ tclear(t); return ring(to.x, to.y, {size:40, color:'#fff', w:3, dur:.3}); })]);
};

// exileFold (exiled): v0 it folds flat into a paper star that zips away, v1 a little vortex swallows it and a lock clicks, v2 it floats off in a bubble.
W.exileFold = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🕯️'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const D = Math.max(b.w, b.h)*1.1, vx = svgNode(D, D, '0 0 100 100', `<circle cx='50' cy='50' r='46' fill='#2b1f4a'/><path d='M50 50 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 -12 a20 20 0 1 1 -20 20 a30 30 0 1 1 30 -30' fill='none' stroke='#b79cff' stroke-width='4' stroke-linecap='round'/>`), lk = glyph('🔒', Math.max(18, b.w*.34));
    return all(o, [run(1.3, u=>{ put(vx, b.x, b.y, {s:eout(seg(u, 0, .2))*(1 - seg(u, .75, 1)), r:-u*720, op:.92}); tset(t, {rotation:540*eio(seg(u, .1, .65)), scale:1 - eio(seg(u, .1, .65)), opacity:1 - seg(u, .5, .65)});
        put(lk, b.x, b.y, {s:u > .65 ? .5 + .7*eout(seg(u, .65, .8)) - .2*seg(u, .8, .9) : 0, r:Math.sin(u*40)*8*seg(u, .8, .9), op:u > .65 ? 1 - seg(u, .9, 1) : 0}); }).then(()=>{ kill(vx); kill(lk); tclear(t); })]); }
  if(v === 2){ const bu = node('fxj-bubble', b.w*1.3, b.w*1.3);
    return all(o, [run(1.5, u=>{ const up = ein(seg(u, .2, 1)), sw = Math.sin(u*TAU*1.5)*10; put(bu, b.x + sw, b.y - b.h*2.2*up, {s:eout(seg(u, 0, .2)), op:1 - seg(u, .8, 1)}); tset(t, {x:sw, y:-b.h*2.2*up, scale:1 - .3*up, opacity:1 - seg(u, .7, .95)}); }).then(()=>{ kill(bu); tclear(t); })]); }
  const st = node('fxj-star', b.w*.5, b.w*.5);
  return all(o, [run(1.2, u=>{ const f = eio(seg(u, 0, .35)), z = ein(seg(u, .45, 1)); tset(t, {scaleX:Math.max(.02, 1 - f), opacity:1 - seg(u, .3, .4)}); put(st, b.x + b.w*.4*z, b.y - b.h*2.4*z, {s:eout(seg(u, .3, .45)), r:360*z, op:u > .3 ? 1 - seg(u, .85, 1) : 0}); }).then(()=>{ kill(st); tclear(t); }),
    twinkles(b.x, b.y - b.h*.4, {n:6, a0:240, a1:300, d0:b.h*.3, d1:b.h*1.2, delay:.55})]);
};

// deathPoof (a cute death): v0 a cartoon poof and a halo floats up, v1 it squashes flat and sees stars, v2 it sinks and a flower grows where it stood.
W.deathPoof = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '💨'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ tset(t, {transformOrigin:'50% 100%'}); const n = 5, sts = Array.from({length:n}, ()=> node('fxj-star', 12, 12)), sy = b.b - b.h*.2;
    return all(o, [run(1.4, u=>{ const f = eout(seg(u, 0, .2)); tset(t, {scaleY:1 - .86*f, scaleX:1 + .25*f, opacity:1 - seg(u, .7, 1)}); sts.forEach((e, i)=>{ const a = i/n*TAU + u*TAU*1.5; put(e, b.x + Math.cos(a)*b.w*.45, sy - 14 + Math.sin(a)*8, {op:u > .2 ? 1 - seg(u, .75, 1) : 0, r:u*300}); }); }).then(()=>{ sts.forEach(kill); tclear(t); }),
      ring(b.x, b.b - 4, {size:b.w*1.6, sy:.3, color:'#fff', w:3, dur:.35, delay:.15})]); }
  if(v === 2){ const sp = glyph('🌱', Math.max(18, b.w*.34)), fl = glyph('🌼', Math.max(22, b.w*.42)), fy = b.b - b.h*.2;
    return all(o, [run(1.9, u=>{ tset(t, {y:12*seg(u, 0, .35), scale:1 - .15*seg(u, 0, .35), opacity:1 - seg(u, 0, .35)}); put(sp, b.x, fy, {s:eout(seg(u, .3, .55)), op:u > .3 && u < .62 ? 1 : 0}); put(fl, b.x, fy - 6, {s:u > .6 ? .4 + .7*eout(seg(u, .6, .75)) : 0, r:Math.sin(u*10)*6, op:u > .6 ? 1 - seg(u, .88, 1) : 0}); }).then(()=>{ kill(sp); kill(fl); tclear(t); }),
      twinkles(b.x, fy - 10, {n:3, d1:20, delay:1.15})]); }
  const ha = glyph('😇', Math.max(20, b.w*.4));
  return all(o, [particles(b.x, b.y, {n:7, cls:'fxj-puff', size:()=> rnd(20, 32), d0:b.w*.1, d1:b.w*.5, s0:.4, s1:1.3, dur:.75, fadeStart:.5}), run(.25, u=> tset(t, {opacity:1 - u, scale:1 - .2*u})),
    run(1.5, u=> put(ha, b.x + Math.sin(u*8)*6, b.y - b.h*.8*eout(u), {s:.5 + .5*eout(seg(u, 0, .3)), op:fadeIO(u, .15, .3)}), {delay:.2}).then(()=>{ kill(ha); tclear(t); })]);
};

// =====================================================================================
// BUFF AND DEBUFF STACKS (o.n stacks arrive one by one, 1-5)
// =====================================================================================
const CHEV = `<path d='M4 26 L30 6 L56 26 L56 38 L30 18 L4 38 Z' fill='#ffd56e' stroke='#6a4a10' stroke-width='3' stroke-linejoin='round'/>`;
// buffStack: v0 gold chevrons build a tower beside it, v1 an orb joins the orbit per stack, v2 a corner badge pumps up its count.
W.buffStack = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '⏫'); if(early) return early; const v = o.v | 0, n = clamp(o.n || 3, 1, 5), gap = .28, total = n*gap + .9; call(o.onImpact);
  const tick = i=> run(.01, ()=>{}, {delay:i*gap}).then(()=> hop(t, 3));
  if(v === 1){ const orbs = Array.from({length:n}, ()=>{ const e = node('fxj-disc', 11, 11); e.style.background = 'radial-gradient(circle at 35% 30%, #fff, #ffd56e 55%, #d08a12)'; return e; });
    return all(o, [run(total, u=> orbs.forEach((e, i)=>{ const born = seg(u*total, i*gap, i*gap + .2), a = u*TAU*1.2 + i*TAU/n; put(e, b.x + Math.cos(a)*b.w*.62, b.y + Math.sin(a)*b.h*.52, {s:eout(born) + .3*pulse(born), op:born > 0 ? 1 - seg(u, .88, 1) : 0}); })).then(()=> orbs.forEach(kill)),
      ...orbs.map((_, i)=> tick(i))]); }
  if(v === 2){ const bd = node('fxj-badge', 34, 24), bx = b.r - 4, by = b.t + 6;
    return all(o, [run(total, u=>{ const k = Math.min(n, Math.floor(u*total/gap) + 1), q = (u*total % gap)/gap; bd.textContent = '×' + k; put(bd, bx, by, {s:1 + .4*(1 - eout(Math.min(1, q*2))), op:1 - seg(u, .9, 1)}); }).then(()=> kill(bd)),
      ...Array.from({length:n}, (_, i)=> run(.01, ()=>{}, {delay:i*gap}).then(()=> ring(bx, by, {size:40, color:'#ffd56e', w:3, dur:.35})))]); }
  const cs = Array.from({length:n}, ()=> svgNode(24, 17, '0 0 60 44', CHEV)), cx = b.r + 10;
  return all(o, [run(total, u=> cs.forEach((e, i)=>{ const q = seg(u*total, i*gap, i*gap + .22), y = b.b - 12 - i*13; put(e, cx + 14*(1 - eout(q)), y - 18*(1 - eout(q)), {s:1 + .3*pulse(q), op:q > 0 ? 1 - seg(u, .88, 1) : 0}); })).then(()=> cs.forEach(kill)),
    ...cs.map((_, i)=> tick(i))]);
};

// debuffStack: v0 chain links hang down from it, v1 a raincloud grows and drips harder per stack, v2 rocks pile on top and squash it.
W.debuffStack = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '⏬'); if(early) return early; const v = o.v | 0, n = clamp(o.n || 3, 1, 5), gap = .3, total = n*gap + .9; call(o.onImpact);
  if(v === 1){ const cl = glyph('☁️', Math.max(22, b.w*.42)), cy = b.t - 12;
    return all(o, [run(total, u=>{ const k = Math.min(n, u*total/gap); put(cl, b.x, cy, {s:.7 + .16*k + .04*Math.sin(u*30), op:fadeIO(u, .08, .12)}); }).then(()=> kill(cl)),
      ...Array.from({length:n}, (_, i)=> particles(b.x, cy + 8, {n:2 + i*2, cls:'fxj-drop', size:6, h:9, style:(j, e)=>{ e.style.setProperty('--d1', '#8aa0c0'); e.style.setProperty('--d2', '#4f6280'); }, a0:85, a1:95, d0:b.h*.4, d1:b.h*.7, dur:.5, stagger:.2, delay:i*gap, fadeStart:.7})),
      tint(b, 'rgba(90,100,130,.4)', total, .6)]); }
  tset(t, {transformOrigin:'50% 100%'});
  if(v === 2){ const rs = Array.from({length:n}, (_, i)=> node('fxj-rock', 16 + (i % 2)*4, 14 + (i % 2)*3));
    return all(o, [run(total, u=>{ const k = Math.min(n, u*total/gap); tset(t, {scaleY:1 - .035*k*(1 - seg(u, .88, 1)), scaleX:1 + .015*k*(1 - seg(u, .88, 1))});
        rs.forEach((e, i)=>{ const q = seg(u*total, i*gap, i*gap + .2), sq = 1 - .035*k, top = b.b - b.h*sq; put(e, b.x + (i % 3 - 1)*b.w*.22, top - 6 - Math.floor(i/3)*10 - 60*(1 - ein(q)), {r:i*40, op:q > 0 ? 1 - seg(u, .88, 1) : 0}); }); }).then(()=>{ rs.forEach(kill); tclear(t); })]); }
  const ls = Array.from({length:n}, ()=> glyph('🔗', 15));
  return all(o, [run(total, u=>{ ls.forEach((e, i)=>{ const q = seg(u*total, i*gap, i*gap + .25); put(e, b.x, b.b + 6 + i*12, {r:Math.sin(u*14 + i)*10*(1 - seg(u, .6, .8)) + 90, s:eout(q), op:q > 0 ? 1 - seg(u, .88, 1) : 0}); });
      const k = Math.min(n, u*total/gap); tset(t, {y:k*1.2*(1 - seg(u, .88, 1)), scaleY:1 - .02*k*(1 - seg(u, .88, 1))}); }).then(()=>{ ls.forEach(kill); tclear(t); }),
    ...Array.from({length:n}, (_, i)=> tint(b, 'rgba(150,80,200,.35)', .4, .7, i*gap))]);
};

// =====================================================================================
// LANE AND FIELD (a lane: the cards in one column, or a box; a field: the field's box, never the whole screen)
// =====================================================================================
// laneSurge (a column lights up: lane rules, column skills): v0 runway lights run up it, v1 a glowing seam opens along it, v2 wind streaks fly up it.
W.laneSurge = function(t, o){
  o = o || {}; const L = boxOf(t); if(!L) return none(o); if(RM()) return still(L, '⬆️', o); injectCss(); const v = o.v | 0, H = L.h + 30, top = L.t - 15; call(o.onImpact);
  const band = node('fxj-rect', L.w*1.08, H); band.style.background = 'linear-gradient(rgba(255,226,122,0), rgba(255,226,122,.28) 30%, rgba(255,226,122,.28) 70%, rgba(255,226,122,0))';
  const bandP = run(1.5, u=> put(band, L.x, L.y, {op:fadeIO(u, .2, .3)})).then(()=> kill(band));
  if(v === 1){ const sm = node('fxj-rect', 6, H); sm.style.background = 'linear-gradient(#fff, #ffe27a)'; sm.style.borderRadius = '3px'; sm.style.boxShadow = '0 0 10px #ffd56e';
    return all(o, [bandP, run(1.2, u=>{ const k = eout(seg(u, 0, .5)); put(sm, L.x, top + H - H*k/2, {sy:Math.max(.02, k), op:1 - seg(u, .75, 1)}); }).then(()=> kill(sm)),
      ...[.75, .5, .25].map((f, i)=> particles(L.x, top + H*f, {n:4, cls:'fxj-spark', size:3, h:()=> rnd(10, 16), orient:true, d0:8, d1:L.w*.5, dur:.5, delay:.15 + i*.15}))]); }
  if(v === 2) return all(o, [bandP, particles(L.x, L.b + 10, {n:12, cls:'fxj-line', size:2, h:()=> rnd(18, 30), a0:268, a1:272, d0:H*.8, d1:H*1.1, dur:.55, stagger:.8, sway:L.w*.3, fadeStart:.6})]);
  const n = 8, lights = Array.from({length:n}, ()=>{ const e = node('fxj-disc', 10, 10); e.style.background = 'radial-gradient(circle, #fff, #ffe27a 50%, rgba(255,200,80,0) 75%)'; return e; });
  return all(o, [bandP, run(1.4, u=> lights.forEach((e, i)=>{ const y = top + H - (i + .5)*H/n, ph = (u*2 - i/n) % 1; put(e, L.x, y, {s:.8 + .6*(ph > 0 && ph < .25 ? pulse(ph*4) : 0), op:(ph > 0 && ph < .25 ? 1 : .25)*fadeIO(u, .1, .15)}); })).then(()=> lights.forEach(kill))]);
};

// fieldRainbow (rain ends, Spring Rain): v0 a rainbow arcs over the field, v1 puddles shine and dry, v2 clouds part and the sun peeks out.
W.fieldRainbow = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, '🌈', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const ps = Array.from({length:5}, (_, i)=>{ const e = node('fxj-disc', B.w*rnd(.12, .2), B.w*.12); e.style.background = 'radial-gradient(ellipse, rgba(200,236,255,.9), rgba(120,190,240,.55) 60%, rgba(120,190,240,0) 72%)'; return {e, x:B.l + B.w*(.15 + .7*i/4) + rnd(-10, 10), y:B.t + B.h*rnd(.55, .9)}; });
    return all(o, [run(2.4, u=> ps.forEach(p=> put(p.e, p.x, p.y, {sy:.32*(1 - .6*seg(u, .7, 1)), sx:1 - .5*seg(u, .7, 1), op:fadeIO(u, .15, .25)}))).then(()=> ps.forEach(p=> kill(p.e))),
      ...ps.map((p, i)=> twinkles(p.x, p.y - 4, {n:2, d1:12, delay:.4 + i*.22}))]); }
  if(v === 2){ const Lr = boxLayer(B), sun = child(Lr, `width:${B.h*.3}px; height:${B.h*.3}px; border-radius:50%; background:radial-gradient(circle at 40% 36%, #fffbe0, #ffd86a 55%, #ffae3d)`),
      cl = [0, 1].map(s=> child(Lr, `width:${B.w*.4}px; height:${B.h*.2}px; border-radius:50px; background:radial-gradient(circle at 30% 40%, #fff, #e3e8f0 60%, #c6ccd8)`));
    return all(o, [run(2.4, u=>{ put(Lr, B.x, B.y, {op:fadeIO(u, .1, .2)}); const k = eio(seg(u, .15, .6)); tf(sun, B.w*.5 - B.h*.15, B.h*.12 + B.h*.08*(1 - k), {s:.7 + .3*k}); cl.forEach((c, s)=> tf(c, B.w*.5 - B.w*.2 + (s ? 1 : -1)*B.w*.38*k, B.h*.1, {})); }).then(()=> kill(Lr))]); }
  const R = Math.min(B.w*.42, B.h*.8), cols = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'];
  const rb = svgNode(R*2, R, '0 0 200 100', cols.map((c, i)=> `<path d='M${10 + i*8} 100 A${90 - i*8} ${90 - i*8} 0 0 1 ${190 - i*8} 100' fill='none' stroke='${c}' stroke-width='8' opacity='.6'/>`).join('')), by = B.b - B.h*.12 - R/2;
  return all(o, [run(2.6, u=> put(rb, B.x, by, {s:.3 + .7*eout(seg(u, 0, .4)), op:.85*fadeIO(u, .15, .25)})).then(()=> kill(rb)),
    twinkles(B.x - R*.9, by + R*.45, {n:4, d1:20, delay:.6}), twinkles(B.x + R*.9, by + R*.45, {n:4, d1:20, delay:.75})]);
};

// fieldAurora (cold nights, Frigid at night): ribbons of light sway over the field; v0 green, v1 pink and violet, v2 a quick shimmering curtain.
W.fieldAurora = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, '🌌', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  const pal = [['120,255,190', '80,200,255'], ['255,140,220', '170,120,255'], ['140,255,210', '255,160,230']][v] || ['120,255,190', '80,200,255'], n = v === 2 ? 7 : 5, sp = v === 2 ? 2.2 : 1;
  const dim = node('fxj-rect', B.w, B.h); dim.style.background = 'rgba(10,18,40,.35)'; dim.style.borderRadius = '14px';
  const bands = Array.from({length:n}, (_, i)=>{ const e = node('fxj-band', B.w*.16, B.h*.55); e.style.background = `linear-gradient(rgba(${pal[i % 2]},0), rgba(${pal[i % 2]},.55) 40%, rgba(${pal[(i + 1) % 2]},.32) 75%, rgba(${pal[(i + 1) % 2]},0))`; return {e, x:B.l + B.w*(.12 + .76*i/(n - 1)), ph:rnd(0, TAU)}; });
  const stars = Array.from({length:6}, ()=> ({e:node('fxj-twinkle', 9, 9), x:B.l + B.w*rnd(.08, .92), y:B.t + B.h*rnd(.06, .4), ph:rnd(0, TAU)}));
  return all(o, [run(3.0, u=>{ const f = fadeIO(u, .15, .2); put(dim, B.x, B.y, {op:f});
      bands.forEach(b=> put(b.e, b.x + Math.sin(u*TAU*sp + b.ph)*B.w*.03, B.t + B.h*.32, {k:Math.sin(u*TAU*sp*.8 + b.ph)*14, sy:.85 + .15*Math.sin(u*TAU*sp + b.ph*2), op:f*(.6 + .4*Math.sin(u*TAU*sp*1.3 + b.ph))}));
      stars.forEach(s=> put(s.e, s.x, s.y, {s:.6 + .4*Math.sin(u*14 + s.ph), op:f*(.5 + .5*Math.sin(u*10 + s.ph))})); }).then(()=>{ kill(dim); bands.forEach(b=> kill(b.e)); stars.forEach(s=> kill(s.e)); })]);
};

// fieldOmen (the forecast shown on the field itself, a round ahead): v0 a rumble before a quake, v1 a storm gathers, v2 the water rises a little.
W.fieldOmen = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, ['🫨', '⛈️', '🌊'][o.v | 0] || '🫨', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const cl = Array.from({length:4}, (_, i)=>{ const e = node('fxj-puff', B.w*.3, B.h*.18); e.style.setProperty('--p0', '#9aa3b5'); e.style.setProperty('--p1', '#6d7590'); e.style.setProperty('--p2', '#4a5068'); e.style.borderRadius = '60px'; return {e, s:i % 2 ? 1 : -1, k:i}; });
    const fl = node('fxj-rect', B.w, B.h*.5); fl.style.background = 'linear-gradient(rgba(255,255,240,.5), rgba(255,255,240,0))'; fl.style.borderRadius = '14px';
    return all(o, [run(2.6, u=>{ const k = eout(seg(u, 0, .4)); cl.forEach(c=> put(c.e, B.x + c.s*B.w*(.7 - .45*k) + c.s*(c.k > 1 ? B.w*.12 : 0), B.t + B.h*(.1 + .06*c.k), {op:.9*fadeIO(u, .2, .2)})); put(fl, B.x, B.t + B.h*.25, {op:(u > .5 && u < .53) || (u > .6 && u < .62) ? 1 : 0}); }).then(()=>{ cl.forEach(c=> kill(c.e)); kill(fl); })]); }
  if(v === 2){ const Lr = node('fxj-box', B.w, B.h*.28), wv = child(Lr, `width:${B.w*1.2}px; height:${B.h*.4}px; border-radius:40% 60% 0 0 / 30% 30% 0 0; background:linear-gradient(rgba(255,255,255,.9) 0 6%, rgba(116,205,255,.75) 7%, rgba(59,151,224,.6))`);
    return all(o, [run(2.4, u=>{ put(Lr, B.x, B.b - B.h*.14, {op:fadeIO(u, .1, .2)}); tf(wv, -B.w*.1 + Math.sin(u*TAU*2)*B.w*.05, B.h*.28 - B.h*.16*pulse(u), {}); }).then(()=> kill(Lr)),
      particles(B.x, B.b - 10, {n:6, cls:'fxj-bubble', size:()=> rnd(6, 10), a0:250, a1:290, d0:10, d1:B.h*.2, sway:B.w*.3, dur:1.2, stagger:1, delay:.4})]); }
  shake(isEl(t) ? t : null, 3);
  const n = 10, pb = Array.from({length:n}, (_, i)=> ({e:node('fxj-rock', 8, 7), x:B.l + B.w*(.08 + .84*i/(n - 1))})), cr = [0, 1, 2].map(()=> ({e:svgNode(40, 20, '0 0 40 20', `<path d='M2 10 L12 6 L18 14 L28 4 L38 12' fill='none' stroke='#3a2a18' stroke-width='3' stroke-linecap='round'/>`), x:B.l + B.w*rnd(.15, .85), y:B.t + B.h*rnd(.55, .85)}));
  return all(o, [run(2.0, u=>{ const f = fadeIO(u, .1, .2); pb.forEach((p, i)=> put(p.e, p.x, B.b - 8 - Math.abs(Math.sin(u*28 + i*.7))*7*f, {r:Math.sin(u*20 + i)*20, op:f})); cr.forEach((c, i)=> put(c.e, c.x, c.y, {op:f*(Math.sin(u*18 + i*2) > .3 ? .8 : .15)})); }).then(()=>{ pb.forEach(p=> kill(p.e)); cr.forEach(c=> kill(c.e)); }),
    run(.01, ()=>{}, {delay:1.0}).then(()=> shake(isEl(t) ? t : null, 3))]);
};

// =====================================================================================
// MAP AND ROAD (t: the map's box or element)
// =====================================================================================
// roadProgress (progress along the road, o.from -> o.to, 0..1): v0 a hedgehog walks the bar, v1 flags pop at the milestones, v2 lanterns light up.
W.roadProgress = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, '🦔', o); injectCss(); const v = o.v | 0, f0 = clamp(o.from == null ? .25 : o.from, 0, 1), f1 = clamp(o.to == null ? .6 : o.to, 0, 1);
  const w = B.w*.8, y = B.b - 26, x0 = B.x - w/2, bar = node('fxj-rect', w, 14); bar.style.background = 'rgba(40,28,14,.55)'; bar.style.border = '2px solid #f3d38c'; bar.style.borderRadius = '99px'; bar.style.overflow = 'hidden';
  const fill = child(bar, `left:0; top:0; width:100%; height:100%; transform-origin:0 50%; background:linear-gradient(#ffe48a, #e6a92a)`); fill.style.position = 'absolute'; fill.style.display = 'block';
  const ms = [.2, .4, .6, .8], mk = v === 0 ? [] : ms.map(m=> ({m, e:glyph(v === 1 ? '🚩' : '🏮', 18), x:x0 + w*m}));
  const walker = v === 0 ? glyph('🦔', 22) : null;
  return all(o, [run(2.4, u=>{ const k = f0 + (f1 - f0)*eio(seg(u, .15, .75)), op = fadeIO(u, .08, .15); put(bar, B.x, y, {op}); fill.style.transform = `scaleX(${k.toFixed(3)})`;
      if(walker) put(walker, x0 + w*k, y - 16 - Math.abs(Math.sin(u*40))*3, {sx:-1, op});
      mk.forEach(p=>{ const on = k >= p.m, q = on ? clamp((k - p.m)/.05, 0, 1) : 0; put(p.e, p.x, y - (v === 1 ? 18 : 16), {s:v === 1 ? (on ? .4 + .6*eout(q) + .2*pulse(q) : 0) : 1 + .2*pulse(q), op:op*(v === 1 ? (on ? 1 : 0) : (on ? 1 : .35))}); }); })
    .then(()=>{ kill(bar); if(walker) kill(walker); mk.forEach(p=> kill(p.e)); call(o.onImpact); })]);
};

// mapTransition (map to map, into a sub-map): v0 a circle wipe closes and opens, v1 clouds roll over and part, v2 the map folds shut and opens like paper.
W.mapTransition = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, '🗺️', o); injectCss(); const v = o.v | 0, Lr = boxLayer(B); const mid = ()=>{ if(!Lr._mid){ Lr._mid = 1; call(o.onImpact); } };
  if(v === 1){ const cs = Array.from({length:8}, (_, i)=> ({e:child(Lr, `width:${B.w*.55}px; height:${B.h*.55}px; border-radius:50%; background:radial-gradient(circle at 36% 30%, #fff, #e9edf4 55%, #c3cad8)`), s:i % 2 ? 1 : -1, y:(Math.floor(i/2) - 1.5)*B.h*.28}));
    return all(o, [run(2.0, u=>{ put(Lr, B.x, B.y, {op:1}); const k = eio(seg(u, 0, .4)) - eio(seg(u, .6, 1)); if(u > .45) mid(); cs.forEach((c, i)=> tf(c.e, B.w/2 - B.w*.275 + c.s*(B.w*.85 - B.w*.75*k) + c.s*(i % 4 < 2 ? -B.w*.1 : B.w*.05), B.h/2 - B.h*.275 + c.y, {s:1 + .1*Math.sin(u*10 + i)})); }).then(()=> kill(Lr))]); }
  if(v === 2){ const pan = [0, 1].map(s=> child(Lr, `width:${B.w}px; height:${B.h/2 + 1}px; transform-origin:50% ${s ? '100%' : '0'}; background:linear-gradient(${s ? '0deg' : '180deg'}, #f6e7c4, #e2c891); box-shadow:inset 0 ${s ? '' : '-'}6px 0 rgba(120,80,30,.25)`));
    return all(o, [run(1.8, u=>{ put(Lr, B.x, B.y, {op:1}); const k = eio(seg(u, 0, .4)) - eio(seg(u, .6, 1)); if(u > .45) mid(); pan.forEach((p, s)=> tf(p, 0, s ? B.h/2 : 0, {sy:Math.max(.001, k)})); }).then(()=> kill(Lr))]); }
  const at = boxOf(o.at) || B, D = Math.hypot(B.w, B.h)*2.1, disc = child(Lr, `width:${D}px; height:${D}px; border-radius:50%; background:radial-gradient(circle, #2a1f3a 0 60%, #1a1424)`);
  return all(o, [run(1.8, u=>{ put(Lr, B.x, B.y, {op:1}); const k = eio(seg(u, 0, .4)) - eio(seg(u, .6, 1)); if(u > .45) mid(); tf(disc, at.x - B.l - D/2, at.y - B.t - D/2, {s:Math.max(.001, k)}); }).then(()=> kill(Lr))]);
};

// =====================================================================================
// PACKS AND RARITY REVEALS
// =====================================================================================
const RAR = [['common', '#c9c4b6'], ['uncommon', '#6fcf6f'], ['rare', '#6fb0ff'], ['epic', '#b77bff'], ['legendary', '#ffc94a'], ['mythic', '#ff6b9e']];
// rarityClimb (before the flip, o.rarity): v0 the glow climbs colour by colour and stops on it, v1 its stars pop one by one, v2 its gem drops into a socket.
W.rarityClimb = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '✨'); if(early) return early; const v = o.v | 0, ki = Math.max(0, RAR.findIndex(r=> r[0] === (o.rarity || 'legendary'))), col = RAR[ki][1], step = .28;
  if(v === 1){ const sts = Array.from({length:ki + 1}, ()=> node('fxj-star', 18, 18)), pos = i=>{ const a = (-90 + (i - ki/2)*22)*D2R; return {x:b.x + Math.cos(a)*b.h*.62, y:b.y + Math.sin(a)*b.h*.62 + b.h*.05}; };
    return all(o, [run(ki*step + 1.1, u=>{ const T = u*(ki*step + 1.1); sts.forEach((e, i)=>{ const q = seg(T, i*step, i*step + .2), p = pos(i); put(e, p.x, p.y, {s:eout(q) + .3*pulse(q), r:30*(1 - q), op:q > 0 ? 1 - seg(u, .88, 1) : 0}); }); }).then(()=> sts.forEach(kill)),
      run(.01, ()=>{}, {delay:ki*step + .25}).then(()=>{ call(o.onImpact); hop(t, 5); return ring(b.x, b.y, {size:b.h*1.4, color:col, w:4, dur:.5, glow:8}); })]); }
  if(v === 2){ const gm = node('fxj-gem', 20, 24); gm.style.setProperty('--g', col); const gy = b.t + 10;
    return all(o, [run(1.4, u=>{ const d = seg(u, 0, .35); put(gm, b.x, gy - 90*(1 - ein(d)) - (u > .35 ? 8*Math.abs(Math.sin(seg(u, .35, .6)*Math.PI*2))*(1 - seg(u, .35, .6)) : 0), {r:200*(1 - d), op:Math.min(1, u*8)*(1 - seg(u, .88, 1))}); }).then(()=> kill(gm)),
      run(.01, ()=>{}, {delay:.5}).then(()=>{ call(o.onImpact); hop(t, 4); return Promise.all([ring(b.x, gy, {size:60, color:col, w:3, dur:.45, glow:8}), twinkles(b.x + 10, gy - 6, {n:3, d1:14, delay:.2})]); })]); }
  const ds = RAR.slice(0, ki + 1).map(r=>{ const e = node('fxj-disc', b.w*1.7, b.w*1.7); e.style.background = `radial-gradient(circle, ${r[1]} 0, ${r[1]}aa 35%, rgba(0,0,0,0) 68%)`; return e; }), T = (ki + 1)*step + .7;
  return all(o, [run(T, u=>{ const x = u*T, cur = Math.min(ki, Math.floor(x/step)); ds.forEach((e, i)=>{ const q = seg(x, i*step, i*step + step), on = i === cur; put(e, b.x, b.y, {s:.7 + .25*pulse(q) + (i === ki ? .15*seg(x, ki*step, T) : 0), op:on ? .85*(1 - seg(u, .85, 1)) : 0}); }); }).then(()=> ds.forEach(kill)),
    run(.01, ()=>{}, {delay:ki*step + .1}).then(()=>{ call(o.onImpact); hop(t, 6); return Promise.all([ring(b.x, b.y, {size:b.h*1.5, color:col, w:4, dur:.5, glow:10}), particles(b.x, b.y, {n:10, cls:'fxj-twinkle', size:()=> rnd(9, 15), d0:b.w*.3, d1:b.w*.9, s0:.3, s1:1, dur:.7})]); })]);
};

// shinyGlint (a shiny pull): v0 four-point glints pop at the corners in turn, v1 a ring of rainbow dots orbits and bursts, v2 a wand taps it and rainbow sparks fall.
W.shinyGlint = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '✨'); if(early) return early; const v = o.v | 0, rb = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc', '#f783ac'];
  if(v === 1){ const ds = rb.map(c=>{ const e = node('fxj-disc', 10, 10); e.style.background = `radial-gradient(circle at 35% 30%, #fff, ${c} 60%)`; return e; });
    return all(o, [run(1.3, u=>{ const out = seg(u, .75, 1); ds.forEach((e, i)=>{ const a = i/7*TAU + u*TAU*1.5, R = 1 + 1.2*eout(out); put(e, b.x + Math.cos(a)*b.w*.6*R, b.y + Math.sin(a)*b.h*.5*R, {op:Math.min(1, u*6)*(1 - out)}); }); if(u > .75 && !ds._hit){ ds._hit = 1; call(o.onImpact); hop(t, 5); } }).then(()=> ds.forEach(kill))]); }
  if(v === 2){ const wd = glyph('🪄', Math.max(22, b.w*.42));
    return all(o, [run(1.0, u=>{ const k = eout(seg(u, 0, .4)); put(wd, b.r + b.w*.6 - b.w*.5*k, b.t - b.h*.5 + b.h*.5*k, {r:-30 + 40*pulse(seg(u, .4, .6)), op:fadeIO(u, .1, .2)}); if(u > .45 && !wd._hit){ wd._hit = 1; call(o.onImpact); jolt(t, 0, 2, .5); } }).then(()=> kill(wd)),
      particles(b.x, b.y - b.h*.1, {n:14, cls:'fxj-chip', size:()=> rnd(4, 7), bg:i=> rb[i % 7], a0:200, a1:340, d0:b.w*.2, d1:b.w*.8, grav:b.h*.6, dur:1.0, delay:.45, spin:300}), twinkles(b.x, b.y, {n:4, d1:b.w*.5, delay:.45})]); }
  const cs = [[b.l + 6, b.t + 6], [b.r - 6, b.t + 6], [b.r - 6, b.b - 6], [b.l + 6, b.b - 6]]; call(o.onImpact);
  return all(o, [tint(b, 'rgba(255,255,255,.35)', 1.2, .5), ...[0, 1].flatMap(pass=> cs.map(([x, y], i)=>{ const e = node('fxj-twinkle', 22, 22); return run(.32, u=> put(e, x, y, {s:pulse(u)*1.2, r:90*u, op:pulse(u)}), {delay:pass*.6 + i*.13}).then(()=> kill(e)); }))]);
};

// legendaryWings (a Legendary pull): v0 golden wings unfold beside it and flap, v1 a pillar of light lands on it, v2 a ring of stars settles into a crown.
const WING = `<path d='M100 52 C82 14 44 2 2 8 C16 16 22 20 26 24 C12 27 8 30 6 35 C20 37 26 39 30 43 C20 46 16 50 14 55 C42 52 72 58 100 52 Z' fill='#ffe48a' stroke='#b5841d' stroke-width='3' stroke-linejoin='round'/><path d='M96 48 C78 24 52 16 24 16' fill='none' stroke='#fff6c8' stroke-width='3' stroke-linecap='round'/>`;
W.legendaryWings = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🌟'); if(early) return early; const v = o.v | 0;
  if(v === 1){ const pl = node('fxj-rect', b.w*.95, b.h*3); pl.style.background = 'linear-gradient(rgba(255,226,122,0), rgba(255,226,122,.7) 70%, rgba(255,250,220,.9))'; pl.style.borderRadius = '40px';
    return all(o, [run(1.5, u=>{ const d = eout(seg(u, 0, .3)); put(pl, b.x, b.b - b.h*1.5 - b.h*1.5*(1 - d), {sx:1 - .3*seg(u, .6, 1), op:Math.min(1, u*5)*(1 - seg(u, .65, 1))}); }).then(()=> kill(pl)),
      run(.01, ()=>{}, {delay:.4}).then(()=>{ call(o.onImpact); hop(t, 6); return Promise.all([ring(b.x, b.b - 4, {size:b.w*1.8, sy:.3, color:'#ffd56e', w:4, dur:.5, glow:8}), ring(b.x, b.b - 4, {size:b.w*2.4, sy:.3, color:'#fff6c8', w:3, dur:.6, delay:.15}),
        particles(b.x, b.b - 6, {n:8, cls:'fxj-disc', size:()=> rnd(4, 7), bg:'radial-gradient(circle, #fff, #ffd56e)', a0:255, a1:285, d0:b.h*.5, d1:b.h*1.1, sway:8, dur:1.0, stagger:.4})]); })]); }
  if(v === 2){ const n = 5, sts = Array.from({length:n}, ()=> node('fxj-star', 16, 16)), cy = b.t - 10;
    return all(o, [run(1.8, u=>{ const s = eio(seg(u, .45, .75)); sts.forEach((e, i)=>{ const a = i/n*TAU + u*TAU*1.4, ox = b.x + Math.cos(a)*b.w*.55, oy = cy - 20 + Math.sin(a)*12, cx = b.x + (i - 2)*b.w*.16, cyy = cy - Math.abs(i - 2)*-4 - (i === 2 ? 10 : i % 2 ? 4 : 0);
        put(e, ox + (cx - ox)*s, oy + (cyy - oy)*s, {s:1 + .3*pulse(seg(u, .75, .85)), r:u*200*(1 - s), op:Math.min(1, u*6)*(1 - seg(u, .88, 1))}); }); if(u > .75 && !sts._hit){ sts._hit = 1; call(o.onImpact); hop(t, 4); } }).then(()=> sts.forEach(kill))]); }
  const ww = b.w*.9, wh = ww*.6, wl = svgNode(ww, wh, '0 0 100 60', WING), wr = svgNode(ww, wh, '0 0 100 60', WING); call(o.onImpact);
  return all(o, [run(1.8, u=>{ const k = eout(seg(u, 0, .35)), fl = Math.sin(seg(u, .35, .85)*Math.PI*4)*10, op = Math.min(1, u*5)*(1 - seg(u, .85, 1));
      put(wl, b.l - ww*.32, b.y - b.h*.12, {r:-(70*(1 - k)) + fl, s:.5 + .5*k, op}); put(wr, b.r + ww*.32, b.y - b.h*.12, {sx:-(.5 + .5*k), sy:.5 + .5*k, r:70*(1 - k) - fl, op}); }).then(()=>{ kill(wl); kill(wr); }),
    run(.01, ()=>{}, {delay:.4}).then(()=>{ hop(t, 6); return Promise.all([ring(b.x, b.y, {size:b.h*1.5, color:'#ffd56e', w:4, dur:.55, glow:10}), twinkles(b.x, b.y, {n:8, d0:b.w*.4, d1:b.w*1.1})]); })]);
};

// =====================================================================================
// RESULTS: victory, defeat, level-up, map clear
// =====================================================================================
// victoryCheer (your units, at the win): v0 they hop in a wave and throw confetti, v1 balloons float up from them, v2 poppers fire streamers over them.
W.victoryCheer = function(t, o){
  o = o || {}; const cards = listOf(t), bs = cards.map(boxOf).filter(Boolean), U = boxOf(cards); if(!U) return none(o); if(RM()) return still(U, '🎉', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  if(v === 1) return all(o, [particles(U.x, U.b, {n:8, cls:'fxj-glyph', style:glyphs('🎈', i=> 18 + (i % 3)*4), a0:255, a1:285, d0:U.h*1.0, d1:U.h*1.6, sway:U.w*.08, dur:2.2, stagger:.8, fadeStart:.7}),
    ...cards.map((c, i)=> run(.01, ()=>{}, {delay:.2 + i*.15}).then(()=> hop(c, 8)))]);
  if(v === 2){ const pp = [[U.l - 10, 1], [U.r + 10, -1]].map(([x, s])=>{ const g = glyph('🎉', 26); return {g, x, s}; });
    return all(o, [run(1.6, u=> pp.forEach(p=> put(p.g, p.x, U.b - 10, {sx:-p.s*(1 + .2*pulse(seg(u, .1, .25))), sy:1 + .2*pulse(seg(u, .1, .25)), op:fadeIO(u, .1, .2)}))).then(()=> pp.forEach(p=> kill(p.g))),
      ...pp.map(p=> confetti(p.x, U.b - 20, {n:12, a0:p.s > 0 ? 270 : 210, a1:p.s > 0 ? 330 : 270, d0:U.w*.3, d1:U.w*.6, grav:U.h*.8, dur:1.3, delay:.15})), ...cards.map(c=> run(.01, ()=>{}, {delay:.2}).then(()=> hop(c, 6)))]); }
  return all(o, bs.map((b, i)=> run(.01, ()=>{}, {delay:i*.15}).then(()=>{ hop(cards[i], 14); return confetti(b.x, b.t, {n:8, d0:b.w*.3, d1:b.w*.8, grav:b.h*.8}); })));
};

// defeatDroop (at a loss; cute, never grim): v0 a little raincloud drizzles on your row, v1 a white flag rises and waves, v2 a wilted flower droops.
W.defeatDroop = function(t, o){
  o = o || {}; const cards = listOf(t), U = boxOf(cards); if(!U) return none(o); if(RM()) return still(U, '🌧️', o); injectCss(); const v = o.v | 0; call(o.onImpact);
  const droop = ()=> Promise.all(cards.map((c, i)=> run(1.6, u=> tset(c, {transformOrigin:'50% 100%', y:4*eout(seg(u, 0, .3))*(1 - seg(u, .85, 1)), scaleY:1 - .04*eout(seg(u, 0, .3))*(1 - seg(u, .85, 1)), rotation:(i - 1)*2*eout(seg(u, 0, .3))*(1 - seg(u, .85, 1))}), {delay:i*.08}).then(()=> tclear(c))));
  if(v === 1){ const fl = glyph('🏳️', Math.max(26, U.h*.3));
    return all(o, [droop(), run(1.9, u=> put(fl, U.x, U.t + 10 - U.h*.35*eout(seg(u, 0, .35)), {r:Math.sin(u*16)*10, op:fadeIO(u, .12, .2)})).then(()=> kill(fl))]); }
  if(v === 2){ const fw = glyph('🥀', Math.max(26, U.h*.3)), fy = U.t - 6;
    return all(o, [droop(), run(1.9, u=> put(fw, U.x, fy, {r:45*eio(seg(u, .2, .7)), op:fadeIO(u, .12, .2)})).then(()=> kill(fw)),
      particles(U.x + 10, fy, {n:5, cls:'fxj-disc', size:()=> rnd(5, 8), bg:'radial-gradient(circle at 35% 30%, #ffd0dc, #d9667f)', a0:70, a1:110, d0:U.h*.4, d1:U.h*.8, sway:10, dur:1.2, stagger:.6, delay:.5, spin:200})]); }
  const cl = glyph('☁️', Math.max(30, U.h*.32)), cy = U.t - 14;
  return all(o, [droop(), run(1.9, u=> put(cl, U.x + Math.sin(u*4)*6, cy, {op:fadeIO(u, .12, .2)})).then(()=> kill(cl)),
    particles(U.x, cy + 10, {n:12, cls:'fxj-line', size:2, h:()=> rnd(10, 16), style:(i, e)=>{ e.style.setProperty('--k', '#9fc6ff'); }, a0:88, a1:92, d0:U.h*.6, d1:U.h*1.0, sway:U.w*.15, dur:.55, stagger:1.1, delay:.2, fadeStart:.7})]);
};

// levelUpSpring (a card levels up; o.level the new level): v0 it springs up trailing arrows, v1 a star pip climbs three steps, v2 balloons lift the number.
W.levelUpSpring = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '⬆️'); if(early) return early; const v = o.v | 0, L = o.level == null ? 2 : o.level;
  const num = (x, y, d)=>{ const e = node('fxj-badge', 36, 24); e.textContent = String(L); return run(1.0, u=> put(e, x, y - 10*eout(u), {s:.4 + .8*eout(seg(u, 0, .3)) - .2*seg(u, .3, .45), op:1 - seg(u, .8, 1)}), {delay:d}).then(()=> kill(e)); };
  if(v === 1){ const st = [0, 1, 2].map(i=>{ const e = node('fxj-rect', 16, 8 + i*8); e.style.background = 'linear-gradient(#ffe48a, #c98f1c)'; e.style.borderRadius = '3px'; return e; }), pip = node('fxj-star', 16, 16), sx = b.r + 10;
    const at = i=> i ? {x:sx + (i - 1)*16, y:b.b - (8 + (i - 1)*8) - 9} : {x:sx - 16, y:b.b - 9}; // the ground, then the three steps
    return all(o, [run(1.9, u=>{ st.forEach((e, i)=> put(e, sx + i*16, b.b - (8 + i*8)/2, {sy:eout(seg(u, i*.08, i*.08 + .15)), op:1 - seg(u, .88, 1)})); const q = seg(u, .25, .7), s = Math.min(2, Math.floor(q*3)), f = q*3 - s, a = at(s), z = at(s + 1);
        put(pip, a.x + (z.x - a.x)*f, a.y + (z.y - a.y)*f - Math.sin(f*Math.PI)*16, {r:q*360, op:u > .25 ? 1 - seg(u, .88, 1) : 0}); }).then(()=>{ st.forEach(kill); kill(pip); }),
      run(.01, ()=>{}, {delay:1.35}).then(()=>{ call(o.onImpact); hop(t, 6); return num(b.x, b.t - 14, 0); })]); }
  if(v === 2){ const bl = [-1, 0, 1].map(k=> glyph('🎈', 20)), nb = node('fxj-badge', 36, 24); nb.textContent = String(L); call(o.onImpact); hop(t, 5);
    return all(o, [run(1.9, u=>{ const up = eio(seg(u, .1, 1)), y = b.y - b.h*1.1*up; put(nb, b.x, y, {s:.6 + .4*eout(seg(u, 0, .15)), op:Math.min(1, u*6)*(1 - seg(u, .85, 1))}); bl.forEach((e, i)=> put(e, b.x + (i - 1)*14 + Math.sin(u*8 + i)*3, y - 30 - (i === 1 ? 6 : 0), {r:(i - 1)*12, op:Math.min(1, u*6)*(1 - seg(u, .85, 1))})); }).then(()=>{ bl.forEach(kill); kill(nb); })]); }
  tset(t, {transformOrigin:'50% 100%'});
  return all(o, [run(.9, u=>{ const sq = pulse(seg(u, 0, .25)), up = u < .25 ? 0 : Math.sin(seg(u, .25, .9)*Math.PI); tset(t, {scaleY:1 - .16*sq + .04*up, scaleX:1 + .08*sq, y:-b.h*.35*up}); if(u > .25 && !b._hit){ b._hit = 1; call(o.onImpact); } }).then(()=> tclear(t)),
    particles(b.x, b.b, {n:5, cls:'fxj-svg', size:22, h:16, style:(i, e)=>{ e.innerHTML = `<svg width='22' height='16' viewBox='0 0 60 44'>${CHEV}</svg>`; }, a0:265, a1:275, d0:b.h*.9, d1:b.h*1.4, sway:b.w*.3, dur:.9, stagger:.3, delay:.2, fadeStart:.5}),
    num(b.x, b.t - 18, .45)]);
};

// mapClearFlag (a map cleared; t: the map box or its last node): v0 a flag is planted, v1 a gold seal stamps down, v2 the sun rises over it with birds.
W.mapClearFlag = function(t, o){
  o = o || {}; const B = boxOf(t); if(!B) return none(o); if(RM()) return still(B, '🚩', o); injectCss(); const v = o.v | 0, small = B.w < 200, px = B.x, py = small ? B.y : B.y + B.h*.1;
  if(v === 1){ const D = Math.min(110, Math.max(60, B.h*.45)), se = svgNode(D, D, '0 0 100 100', `<circle cx='50' cy='50' r='44' fill='#f0b72f' stroke='#8a5a0e' stroke-width='5'/><circle cx='50' cy='50' r='34' fill='none' stroke='#fff3c4' stroke-width='3' stroke-dasharray='5 4'/><path d='M30 52 L45 66 L72 36' fill='none' stroke='#5a3a06' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'/>`);
    return all(o, [run(1.7, u=>{ const d = seg(u, 0, .22); put(se, px, py, {s:2.2 - 1.2*eout(d) + .06*pulse(seg(u, .22, .32)), r:-25 + 25*eout(d), op:Math.min(1, u*8)*(1 - seg(u, .82, 1))}); if(u > .22 && !se._hit){ se._hit = 1; call(o.onImpact); shake(isEl(t) ? t : null, 4); } }).then(()=> kill(se)),
      ring(px, py, {size:D*1.6, color:'#f0b72f', w:4, dur:.5, delay:.38}), twinkles(px, py, {n:6, d0:D*.4, d1:D*.8, delay:.4})]); }
  if(v === 2){ const Lr = boxLayer(B), sun = child(Lr, `width:${B.h*.32}px; height:${B.h*.32}px; border-radius:50%; background:radial-gradient(circle at 40% 36%, #fffbe0, #ffd86a 55%, #ffae3d); box-shadow:0 0 30px rgba(255,210,110,.8)`), birds = [0, 1, 2].map(()=> glyph('🐦', 16));
    return all(o, [run(2.6, u=>{ put(Lr, B.x, B.y, {op:fadeIO(u, .1, .15)}); tf(sun, B.w*.5 - B.h*.16, B.h*.42 - B.h*.32*eout(seg(u, 0, .5)), {}); birds.forEach((e, i)=> put(e, B.l + B.w*(-.1 + 1.2*seg(u, .25 + i*.08, .85 + i*.05)), B.t + B.h*(.18 + .05*i) + Math.sin(u*30 + i)*3, {sx:-1, op:fadeIO(u, .25, .15)})); if(u > .3 && !Lr._hit){ Lr._hit = 1; call(o.onImpact); } }).then(()=>{ kill(Lr); birds.forEach(kill); })]); }
  const fh = Math.min(90, Math.max(48, B.h*.35)), fg = svgNode(fh*.7, fh, '0 0 70 100', `<rect x='8' y='4' width='5' height='94' rx='2' fill='#7a4d22'/><path d='M13 8 L64 20 L13 36 Z' fill='#e8423a' stroke='#8a1f18' stroke-width='3' stroke-linejoin='round'/><circle cx='10.5' cy='5' r='4' fill='#ffd56e'/>`);
  return all(o, [run(1.8, u=>{ const d = seg(u, 0, .25); put(fg, px + fh*.2, py - fh*.45 - 120*(1 - ein(d)), {sx:1 + .2*pulse(seg(u, .25, .35)) + .05*Math.sin(u*30)*seg(u, .35, .9), sy:1 - .15*pulse(seg(u, .25, .35)), r:Math.sin(u*14)*3*seg(u, .3, .9), op:Math.min(1, u*8)*(1 - seg(u, .85, 1))}); if(u > .25 && !fg._hit){ fg._hit = 1; call(o.onImpact); } }).then(()=> kill(fg)),
    ring(px, py, {size:fh*1.4, sy:.35, color:'#e2c48a', w:4, dur:.45, delay:.45}), confetti(px, py - fh*.5, {n:14, d0:fh*.3, d1:fh*1.1, grav:fh, delay:.5})]);
};

// =====================================================================================
// BOSS
// =====================================================================================
// bossIntro (t: the boss's card; o.box: the field's box; o.name: its translated name): v0 letterbox bars and a name plate, v1 a silhouette whose eyes glint, v2 spotlights sweep and lock on.
W.bossIntro = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '👹'); if(early) return early; const v = o.v | 0, B = boxOf(o.box) || {x:b.x, y:b.y, w:b.w*3.5, h:b.h*3, l:b.x - b.w*1.75, t:b.y - b.h*1.5, r:b.x + b.w*1.75, b:b.y + b.h*1.5};
  if(v === 1){ const sh = node('fxj-rect', b.w, b.h); sh.style.background = '#120c18'; const eyes = [-1, 1].map(s=>{ const e = node('fxj-disc', 9, 9); e.style.background = 'radial-gradient(circle, #fff, #ffe94a 50%, rgba(255,200,40,0) 75%)'; return {e, s}; });
    return all(o, [run(2.0, u=>{ put(sh, b.x, b.y, {op:.95*(1 - seg(u, .62, .75))}); const bl = (u > .35 && u < .38) ? .1 : 1; eyes.forEach(({e, s})=> put(e, b.x + s*b.w*.16, b.y - b.h*.12, {sy:bl, op:seg(u, .2, .3)*(1 - seg(u, .6, .65))})); if(u > .62 && !sh._hit){ sh._hit = 1; call(o.onImpact); jolt(t, 0, -4, 1.2); } }).then(()=>{ kill(sh); eyes.forEach(x=> kill(x.e)); }),
      run(.01, ()=>{}, {delay:1.25}).then(()=> Promise.all([flash(b.x, b.y, b.w*1.6, 'rgba(255,240,200,.9)', .25), ring(b.x, b.y, {size:b.h*1.5, color:'#ff9a6a', w:4, dur:.5, glow:8})]))]); }
  if(v === 2){ const CH = Math.max(40, Math.hypot(B.w*.35, b.y - B.t)), cs = [-1, 1].map(s=> ({e:node('fxj-cone', b.w*1.4, CH), s, x:s < 0 ? B.l + B.w*.1 : B.r - B.w*.1}));
    return all(o, [run(2.0, u=>{ const lock = eio(seg(u, .1, .6)); cs.forEach(c=>{ const tx = b.x + c.s*B.w*.35*(1 - lock) + Math.sin(u*8)*B.w*.08*(1 - lock), ang = Math.atan2(tx - c.x, b.y - B.t)/D2R; put(c.e, (c.x + tx)/2, (B.t + b.y)/2, {r:-ang, op:.8*fadeIO(u, .1, .2)}); }); if(u > .6 && !cs._hit){ cs._hit = 1; call(o.onImpact); hop(t, 8); } }).then(()=> cs.forEach(c=> kill(c.e))),
      run(.01, ()=>{}, {delay:1.2}).then(()=> Promise.all([ring(b.x, b.y, {size:b.h*1.6, color:'#ffd56e', w:4, dur:.5, glow:8}), twinkles(b.x, b.y, {n:6, d0:b.w*.4, d1:b.w*.9})]))]); }
  const bars = [-1, 1].map(s=>{ const e = node('fxj-rect', B.w, B.h*.14); e.style.background = '#120c18'; e.style.borderRadius = '0'; return {e, s}; }), pl = node('fxj-plate', 0, 0); pl.textContent = o.name || '👹';
  return all(o, [run(2.4, u=>{ const k = eout(seg(u, 0, .2)) - eio(seg(u, .82, 1)); bars.forEach(({e, s})=> put(e, B.x, s < 0 ? B.t + B.h*.07 - B.h*.14*(1 - k) : B.b - B.h*.07 + B.h*.14*(1 - k), {op:.95*Math.min(1, k*3)}));
      const p = seg(u, .25, .38); put(pl, b.x, b.b + 16, {s:u > .25 ? 1.6 - .6*eout(p) : 0, op:u > .25 ? 1 - seg(u, .8, .92) : 0}); if(u > .32 && !pl._hit){ pl._hit = 1; call(o.onImpact); jolt(t, 0, 4, 1.4); } }).then(()=>{ bars.forEach(x=> kill(x.e)); kill(pl); }),
    particles(b.x, b.b - 4, {n:6, cls:'fxj-puff', size:()=> rnd(14, 22), style:(i, e)=>{ e.style.setProperty('--p0', '#efe2c4'); e.style.setProperty('--p1', '#cdb98f'); e.style.setProperty('--p2', '#a8925f'); }, a0:190, a1:350, d0:b.w*.3, d1:b.w*.8, s0:.4, s1:1.2, dur:.7, delay:.8})]);
};

// bossPhase (a boss enters its next phase; o.phase its numeral): v0 a glowing seam cracks and it sheds a layer, v1 rage steam and red pulses, v2 an hourglass flips.
W.bossPhase = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '⏳'); if(early) return early; const v = o.v | 0;
  if(v === 1){ call(o.onImpact); jolt(t, 4, 0, 1.2);
    return all(o, [tint(b, 'rgba(255,60,50,.5)', .45, .8), tint(b, 'rgba(255,60,50,.5)', .45, .8, .5), run(.01, ()=>{}, {delay:.5}).then(()=> jolt(t, -4, 0, 1.2)),
      ...[[b.l + 6, -1], [b.r - 6, 1]].map(([x, s])=> particles(x, b.t + 4, {n:4, cls:'fxj-puff', size:()=> rnd(12, 18), a0:s < 0 ? 230 : 290, a1:s < 0 ? 260 : 310, d0:b.h*.25, d1:b.h*.55, s0:.4, s1:1.3, dur:.9, stagger:.6, op:.9}))]); }
  if(v === 2){ const hg = glyph('⏳', Math.max(24, b.w*.45)), nb = node('fxj-badge', 40, 24); nb.textContent = o.phase || 'II';
    return all(o, [run(1.7, u=>{ put(hg, b.x, b.t - 18, {r:180*eio(seg(u, .2, .5)), s:1 + .2*pulse(seg(u, .45, .6)), op:fadeIO(u, .1, .2)*(1 - seg(u, .55, .7))}); put(nb, b.x, b.t - 18, {s:u > .55 ? .4 + .8*eout(seg(u, .55, .7)) - .2*seg(u, .7, .8) : 0, op:u > .55 ? 1 - seg(u, .88, 1) : 0}); if(u > .55 && !hg._hit){ hg._hit = 1; call(o.onImpact); hop(t, 6); } }).then(()=>{ kill(hg); kill(nb); }),
      ring(b.x, b.t - 18, {size:70, color:'#ffd56e', w:3, dur:.4, delay:.95})]); }
  const cr = svgNode(b.w, b.h, '0 0 100 100', `<path d='M52 0 L44 22 L58 36 L42 56 L56 72 L46 100' fill='none' stroke='#ffb27a' stroke-width='7' stroke-linecap='round' stroke-linejoin='round' opacity='.6'/><path d='M52 0 L44 22 L58 36 L42 56 L56 72 L46 100' fill='none' stroke='#fff6e0' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/>`);
  return all(o, [run(1.3, u=>{ put(cr, b.x, b.y, {sy:eout(seg(u, 0, .25)), op:1 - seg(u, .7, 1)}); if(u > .3 && !cr._hit){ cr._hit = 1; call(o.onImpact); jolt(t, 3, -2, 1.3); } }).then(()=> kill(cr)),
    particles(b.x, b.y, {n:10, cls:'fxj-chip', size:()=> rnd(6, 10), h:()=> rnd(8, 14), bg:i=> ['#ff8a5c', '#ffd0b0', '#c9483a'][i % 3], d0:b.w*.4, d1:b.w*1.0, grav:40, dur:.85, delay:.35, spin:320}),
    ring(b.x, b.y, {size:b.h*1.5, color:'#ff5a4a', w:4, dur:.5, glow:8, delay:.35}), tint(b, 'rgba(255,90,70,.35)', .8, .7, .3)]);
};

// =====================================================================================
// UI JUICE (t: the control itself)
// =====================================================================================
// buttonSquish (any button press; o.at: the press point): v0 a jelly squash and a ripple, v1 an ink ring with star bits, v2 a pop of confetti dots.
W.buttonSquish = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '👆'); if(early) return early; const v = o.v | 0, p = boxOf(o.at) || b; call(o.onImpact);
  const sq = (a, d)=> run(d || .5, u=>{ const s = pulse(seg(u, 0, .16)), back = seg(u, .16, 1), ov = Math.sin(back*Math.PI*2.2)*(1 - back)*.6; tset(t, {scaleX:1 + a*s - a*.4*ov, scaleY:1 - a*1.2*s + a*.5*ov}); }).then(()=> tclear(t));
  if(v === 1) return all(o, [sq(.06), ring(p.x, p.y, {size:Math.max(b.w, b.h)*1.1, color:'#7a5cff', w:4, dur:.4}), particles(p.x, p.y, {n:6, cls:'fxj-twinkle', size:()=> rnd(7, 11), d0:b.h*.4, d1:b.h*.9, s0:.4, s1:1, dur:.5})]);
  if(v === 2) return all(o, [sq(.05, .4), confetti(b.x, b.t, {n:10, d0:b.h*.4, d1:b.h*1.2, grav:b.h*1.2, dur:.8})]);
  return all(o, [sq(.1), ring(p.x, p.y, {size:Math.max(b.w, b.h)*1.2, color:'rgba(255,255,255,.9)', w:3, dur:.45})]);
};

// lumberGain (Lumber or any resource lands in its pill; o.from the source, o.n how many): v0 logs hop onto a woodpile that slides in, v1 an axe chops and a log rolls over, v2 a beaver carries it.
W.lumberGain = function(t, o){
  o = o || {}; const [p, early] = head(t, o, '🪵'); if(early) return early; const v = o.v | 0, s = boxOf(o.from) || {x:p.x, y:p.y + 90, w:60, h:70}, n = clamp(o.n || 3, 1, 6);
  const bing = ()=>{ call(o.onImpact); return Promise.all([ring(p.x, p.y, {size:Math.max(p.w, p.h)*1.4, color:'#e8b46a', w:3, dur:.4}), run(.35, u=> tset(t, {scale:1 + .15*pulse(u)})).then(()=> tclear(t))]); };
  if(v === 1){ const ax = glyph('🪓', Math.max(20, s.w*.36));
    return all(o, [run(.55, u=> put(ax, s.x + s.w*.25, s.y - s.h*.2, {r:-70 + 100*eio(seg(u, 0, .45)) - 30*seg(u, .45, 1), op:fadeIO(u, .1, .2)})).then(()=> kill(ax)),
      particles(s.x, s.y - s.h*.1, {n:8, cls:'fxj-crumb', size:()=> rnd(4, 7), style:(i, e)=>{ e.style.setProperty('--c0', '#f0d29a'); e.style.setProperty('--c1', '#c8955a'); }, a0:200, a1:340, d0:10, d1:s.w*.6, grav:30, dur:.6, delay:.25, spin:300}),
      flyGlyph('🪵', 20, {x:s.x, y:s.y - s.h*.1}, p, .7, {delay:.4, lift:40, spin:720}).then(bing)]); }
  if(v === 2){ const bv = glyph('🦫', 22), lg = glyph('🪵', 15);
    return all(o, [run(1.4, u=>{ const go = eio(seg(u, 0, .65)), back = seg(u, .75, 1), x = s.x + (p.x - s.x)*go - (p.x - s.x)*.3*back, y = s.y + (p.y + 18 - s.y)*go - Math.abs(Math.sin(u*40))*3; put(bv, x - 8, y, {sx:p.x > s.x ? -1 : 1, op:Math.min(1, u*8)*(1 - back)});
        put(lg, u < .7 ? x + 6 : p.x, u < .7 ? y - 8 : p.y - 8*(1 - seg(u, .7, .78)), {r:Math.sin(u*30)*6, s:u < .7 ? 1 : 1 + .5*seg(u, .7, .78), op:u < .7 ? Math.min(1, u*8) : 1 - seg(u, .7, .8)}); }).then(()=>{ kill(bv); kill(lg); }),
      run(.01, ()=>{}, {delay:1.0}).then(bing)]); }
  const pile = Array.from({length:n}, (_, i)=> ({x:p.l - 16 - (i % 2)*14, y:p.y + 6 - Math.floor(i/2)*9}));
  const logs = pile.map(()=> glyph('🪵', 16));
  return all(o, [Promise.all(logs.map((e, i)=>{ const z = pile[i], m = {x:(s.x + z.x)/2, y:Math.min(s.y, z.y) - 50}; return run(.45, u=>{ const q = bez(s, m, z, u); put(e, q.x, q.y, {r:360*u, op:Math.min(1, u*6)}); }, {delay:i*.14}); }))
    .then(()=> run(.35, u=> logs.forEach((e, i)=> put(e, pile[i].x + (p.x - pile[i].x)*ein(u), pile[i].y + (p.y - pile[i].y)*ein(u), {s:1 - .7*u, op:1 - seg(u, .7, 1)})))).then(()=>{ logs.forEach(kill); return bing(); })]);
};

// cardDraw (a card drawn into the hand; t: the new hand card, o.from the deck, o.hand the hand's cards): v0 it swishes in with a sparkle trail, v1 it springs out of the deck, v2 a bird drops it in.
W.cardDraw = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🃏'); if(early) return early; const v = o.v | 0, f = boxOf(o.from) || {x:b.x + b.w*2.4, y:b.y - b.h*.4, w:b.w*.7, h:b.h*.7};
  const reveal = ()=>{ call(o.onImpact); return run(.3, u=> tset(t, {opacity:u, scale:.85 + .15*eout(u) + .05*pulse(u)})).then(()=> tclear(t)); };
  if(v === 1){ tset(t, {opacity:0}); const bk = node('fxj-back', b.w*.85, b.h*.85);
    return all(o, [run(.8, u=>{ const q = bez(f, {x:(f.x + b.x)/2, y:Math.min(f.y, b.y) - b.h*1.3}, b, eio(u)); put(bk, q.x, q.y, {r:360*u, sx:1 + .15*pulse(seg(u, .9, 1)), sy:1 - .15*pulse(seg(u, .9, 1)), op:Math.min(1, u*8)}); }).then(()=>{ kill(bk); return reveal(); })]); }
  if(v === 2){ tset(t, {opacity:0}); const bd = glyph('🐦', 24), bk = node('fxj-back', b.w*.4, b.h*.4), hy = b.t - b.h*.7;
    return all(o, [run(1.4, u=>{ const go = eio(seg(u, 0, .45)), away = ein(seg(u, .55, 1)), bx = f.x + (b.x - f.x)*go - b.w*2*away, by = hy + Math.sin(u*40)*3 - b.h*away; put(bd, bx, by, {sx:1, op:Math.min(1, u*8)*(1 - seg(u, .85, 1))});
        const dr = seg(u, .45, .7); put(bk, u < .45 ? bx : b.x, u < .45 ? by + 16 : by + 16 + (b.y - by - 16)*ein(dr), {r:dr*200, s:1 + dr, op:u < .7 ? Math.min(1, u*8) : 0}); }).then(()=>{ kill(bd); kill(bk); }),
      run(.01, ()=>{}, {delay:.98}).then(reveal)]); }
  const hand = listOf(o.hand).filter(c=> tileOf(c) !== tileOf(t)), pts = Array.from({length:7}, (_, i)=> bez(f, {x:(f.x + b.x)/2, y:Math.min(f.y, b.y) - b.h*.6}, b, (i + 1)/8));
  return all(o, [run(.65, u=>{ const q = bez({x:f.x - b.x, y:f.y - b.y}, {x:(f.x - b.x)/2, y:Math.min(f.y, b.y) - b.y - b.h*.6}, {x:0, y:0}, eout(u)); tset(t, {x:q.x, y:q.y, rotation:20*(1 - u), scale:.7 + .3*u}); }).then(()=>{ tclear(t); call(o.onImpact); }),
    ...pts.map((q, i)=>{ const e = node('fxj-twinkle', 12, 12); return run(.4, u=> put(e, q.x, q.y, {s:pulse(u), r:u*120, op:pulse(u)}), {delay:i*.07}).then(()=> kill(e)); }),
    ...hand.map(c=>{ const cb = boxOf(c), dir = cb && cb.x < b.x ? -1 : 1; return run(.6, u=> tset(c, {x:dir*8*pulse(seg(u, .3, 1))})).then(()=> tclear(c)); })]);
};

// handFull (the hand is full: the next draw is pitched; t: the hand's cards): v0 they jostle and the last one sweats, v1 a little gate shuts at the end, v2 a ghost card wobbles and puffs away.
W.handFull = function(t, o){
  o = o || {}; const cards = listOf(t), bs = cards.map(boxOf).filter(Boolean), U = boxOf(cards); if(!U) return none(o); if(RM()) return still(U, '✋', o); injectCss(); const v = o.v | 0, last = bs[bs.length - 1]; call(o.onImpact);
  if(v === 1){ const gt = svgNode(30, 40, '0 0 30 40', `<rect x='2' y='2' width='5' height='36' rx='2' fill='#8a6234'/><rect x='23' y='2' width='5' height='36' rx='2' fill='#8a6234'/><rect x='2' y='10' width='26' height='5' rx='2' fill='#c79a62'/><rect x='2' y='24' width='26' height='5' rx='2' fill='#c79a62'/>`), lk = glyph('🔒', 16), gx = U.r + 20;
    return all(o, [run(1.6, u=>{ const d = seg(u, 0, .25); put(gt, gx, U.y - 60*(1 - ein(d)), {sy:1 - .12*pulse(seg(u, .25, .35)), op:Math.min(1, u*8)*(1 - seg(u, .85, 1))}); put(lk, gx, U.y + 4, {s:u > .4 ? .4 + .7*eout(seg(u, .4, .55)) - .1*seg(u, .55, .65) : 0, op:u > .4 ? 1 - seg(u, .85, 1) : 0}); }).then(()=>{ kill(gt); kill(lk); }),
      ring(gx, U.y + 18, {size:46, sy:.35, color:'#e2c48a', w:3, dur:.35, delay:.4})]); }
  if(v === 2){ const gh = node('fxj-back', last.w*.8, last.h*.8);
    return all(o, [run(1.1, u=> put(gh, last.x + last.w*.3, last.t - last.h*.25, {r:Math.sin(u*30)*8, s:eout(seg(u, 0, .2)), op:.85*(1 - seg(u, .55, .65))})).then(()=> kill(gh)),
      run(.01, ()=>{}, {delay:.65}).then(()=> particles(last.x + last.w*.3, last.t - last.h*.25, {n:6, cls:'fxj-puff', size:()=> rnd(12, 20), d0:6, d1:last.w*.5, s0:.4, s1:1.2, dur:.55}))]); }
  const sw = glyph('💦', 16);
  return all(o, [...cards.map((c, i)=> run(.5, u=> tset(c, {x:Math.sin(u*40)*4*(1 - u), rotation:Math.sin(u*40 + i)*2*(1 - u)}), {delay:i*.05}).then(()=> tclear(c))),
    run(1.2, u=> put(sw, last.r - 4, last.t + 4 + 14*eio(seg(u, .3, 1)), {s:eout(seg(u, 0, .2)), op:1 - seg(u, .8, 1)}), {delay:.2}).then(()=> kill(sw))]);
};

// notifyPing (something new behind a button): v0 a red dot pops with ripples, v1 an envelope hops out and back, v2 a bell jingles.
W.notifyPing = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🔴'); if(early) return early; const v = o.v | 0, x = b.r - 4, y = b.t + 4; call(o.onImpact);
  if(v === 1){ const en = glyph('✉️', 18);
    return all(o, [run(1.1, u=>{ const up = pulse(seg(u, 0, .8)); put(en, x - 4, y - 26*up, {r:360*eio(seg(u, 0, .4)), sy:u > .35 && u < .55 ? Math.cos(seg(u, .35, .55)*TAU) : 1, s:.6 + .5*up, op:Math.min(1, u*8)*(1 - seg(u, .8, .95))}); }).then(()=> kill(en))]); }
  if(v === 2){ const bl = glyph('🔔', 18), arcs = [-1, 1].map(s=>{ const e = node('fxj-arc', 16, 16); e.style.borderTopColor = '#ffd56e'; return {e, s}; });
    return all(o, [run(1.2, u=>{ const sw = Math.sin(u*30)*24*(1 - u); put(bl, x, y - 4, {r:sw, op:fadeIO(u, .1, .2)}); arcs.forEach(({e, s})=> put(e, x + s*14, y - 4, {r:s*90, op:Math.abs(Math.sin(u*30))*(1 - u)})); }).then(()=>{ kill(bl); arcs.forEach(a=> kill(a.e)); })]); }
  const dot = node('fxj-disc', 12, 12); dot.style.background = '#ff4a3d'; dot.style.border = '2px solid #fff'; dot.style.boxSizing = 'border-box';
  return all(o, [run(1.4, u=> put(dot, x, y, {s:eout(seg(u, 0, .15)) + .4*pulse(seg(u, .1, .25)), op:1 - seg(u, .85, 1)})).then(()=> kill(dot)), ring(x, y, {size:34, color:'#ff4a3d', w:3, dur:.5, delay:.1}), ring(x, y, {size:34, color:'#ff4a3d', w:2, dur:.5, delay:.4})]);
};

// mulliganSwap (a card swapped at the opening hand): v0 it slides out and a fresh one slides up, v1 it shuffles (flips twice) inside a spinning arrow, v2 a die tumbles across it.
W.mulliganSwap = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🔄'); if(early) return early; const v = o.v | 0;
  if(v === 1){ const R = Math.max(b.w, b.h)*.6, sv = svgNode(R*2, R*2, '0 0 100 100', `<path d='M50 8 A42 42 0 1 1 13 30' fill='none' stroke='#6fb0ff' stroke-width='5' stroke-linecap='round'/><path d='M2 22 L16 38 L24 18 Z' fill='#6fb0ff'/>`);
    return all(o, [run(1.0, u=>{ put(sv, b.x, b.y, {r:-u*540, op:fadeIO(u, .1, .2)}); tset(t, {scaleX:Math.max(.02, Math.abs(Math.cos(seg(u, .1, .9)*Math.PI*2)))}); if(u > .5 && !sv._hit){ sv._hit = 1; call(o.onImpact); } }).then(()=>{ kill(sv); tclear(t); })]); }
  if(v === 2){ const dc = glyph('🎲', Math.max(20, b.w*.36));
    return all(o, [run(1.0, u=>{ put(dc, b.l - b.w*.4 + b.w*1.8*u, b.y - Math.abs(Math.sin(u*Math.PI*3))*b.h*.3, {r:720*u, op:fadeIO(u, .1, .15)}); if(u > .45 && !dc._hit){ dc._hit = 1; call(o.onImpact); hop(t, 8); } }).then(()=> kill(dc)), twinkles(b.x, b.y, {n:4, d1:b.w*.5, delay:.5})]); }
  return all(o, [run(.9, u=>{ const out = eio(seg(u, 0, .4)), inn = eout(seg(u, .5, 1)); tset(t, {y:b.h*.6*(u < .5 ? out : 1 - inn), opacity:u < .5 ? 1 - out : inn}); if(u > .5 && !b._hit){ b._hit = 1; call(o.onImpact); } }).then(()=> tclear(t)), twinkles(b.x, b.y, {n:4, d1:b.w*.6, delay:.75})]);
};

// =====================================================================================
// IDLE TOUCHES (rare, decorative, never on a control; a caller would start one now and then on a calm board)
// =====================================================================================
// idleVisitor: v0 a butterfly lands on a corner and flies off, v1 a ladybird walks along the top edge, v2 a leaf drifts down and slides off.
W.idleVisitor = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🦋'); if(early) return early; const v = o.v | 0; call(o.onImpact);
  if(v === 1){ const lb = glyph('🐞', 14);
    return all(o, [run(3.0, u=>{ const w = seg(u, .1, .8), x = b.l + 6 + (b.w - 12)*w, down = seg(u, .8, 1); put(lb, x, b.t + 2 + (b.h*.3)*down, {r:90 + 90*down + Math.sin(u*60)*4, op:fadeIO(u, .08, .1)}); }).then(()=> kill(lb))]); }
  if(v === 2){ const lf = glyph('🍂', 18);
    return all(o, [run(3.0, u=>{ const fall = seg(u, 0, .45), slide = seg(u, .55, 1), x = b.x - b.w*.2 + Math.sin(fall*TAU*1.2)*b.w*.3*(1 - fall) + b.w*.9*ein(slide), y = b.t - b.h*.9*(1 - fall) + 4 + b.h*.6*ein(slide); put(lf, x, y, {r:fall*300 + slide*90, op:fadeIO(u, .08, .15)}); }).then(()=> kill(lf))]); }
  const bf = glyph('🦋', 18), a = {x:b.l - b.w*.9, y:b.t - b.h*.5}, z = {x:b.r - 8, y:b.t + 2}, off = {x:b.r + b.w*.9, y:b.t - b.h*.9};
  return all(o, [run(3.2, u=>{ const inn = seg(u, 0, .38), rest = u > .38 && u < .68, out = seg(u, .68, 1); const p = u <= .38 ? bez(a, {x:(a.x + z.x)/2, y:a.y + b.h*.5}, z, eout(inn)) : u < .68 ? z : bez(z, {x:z.x + 10, y:z.y - b.h*.6}, off, ein(out));
      put(bf, p.x + Math.sin(u*40)*(rest ? 0 : 3), p.y, {sx:(rest ? .55 + .45*Math.abs(Math.cos(u*12)) : .3 + .7*Math.abs(Math.cos(u*60))), sy:1, op:fadeIO(u, .06, .1)}); }).then(()=> kill(bf))]);
};

// idleYawn (a unit that has waited a long time): v0 it stretches up and yawns, v1 it nods off and jolts awake, v2 a cat stretch.
W.idleYawn = function(t, o){
  o = o || {}; const [b, early] = head(t, o, '🥱'); if(early) return early; const v = o.v | 0; call(o.onImpact); tset(t, {transformOrigin:'50% 100%'});
  if(v === 1){ const ex = glyph('❕', 18);
    return all(o, [run(2.4, u=>{ const nod = eio(seg(u, 0, .6)), wake = seg(u, .65, .8); tset(t, {rotation:4*nod*(1 - wake) + Math.sin(wake*Math.PI*6)*2*(1 - wake), y:2*nod*(1 - wake)}); put(ex, b.r - 4, b.t - 8, {s:u > .65 ? .5 + .6*eout(seg(u, .65, .75)) : 0, op:u > .65 ? 1 - seg(u, .9, 1) : 0}); }).then(()=>{ kill(ex); tclear(t); }),
      particles(b.r - 6, b.t + 6, {n:3, cls:'fxj-glyph', style:glyphs('💤', 11), a0:290, a1:320, d0:b.h*.25, d1:b.h*.45, dur:1.3, stagger:.6, delay:.2, fadeStart:.5})]); }
  if(v === 2) return all(o, [run(1.8, u=>{ const s = eio(seg(u, 0, .45)) - eio(seg(u, .55, .85)); tset(t, {scaleX:1 + .08*s, scaleY:1 - .06*s}); }).then(()=>{ tclear(t); hop(t, 4); return twinkles(b.r - 6, b.t + 6, {n:3, d1:14}); })]);
  const yw = glyph('🥱', 20);
  return all(o, [run(2.0, u=>{ const s = pulse(seg(u, 0, .6)); tset(t, {scaleY:1 + .06*s, scaleX:1 - .03*s}); put(yw, b.r + 2, b.t + 4, {s:u > .2 ? .4 + .6*eout(seg(u, .2, .4)) : 0, op:u > .2 ? 1 - seg(u, .8, 1) : 0}); }).then(()=>{ kill(yw); tclear(t); })]);
};

// Drop everything now (the Lab does this between plays); pending promises resolve.
W.clear = function(){ TWEENS.forEach((res, tw)=>{ try{ tw.kill(); }catch(e){} call(res); }); TWEENS.clear(); NODES.forEach(e=>{ try{ e.remove(); }catch(err){} }); NODES.clear(); };
W.live = ()=> NODES.size;
W.cap = CAP;
W.names = ['sequesterGrab', 'hoardStash', 'masteryOrbit', 'loneWolfHowl', 'ghostDrift', 'majestyBow', 'exaltedGround', 'encoreCurtain', 'meldLink', 'critElement',
  'healHearts', 'lifeLink', 'shieldBubble', 'cleanseWash', 'arriveSwoop', 'arriveBurrow', 'arriveSplash', 'arriveHatch', 'arriveSkitter', 'returnToHand', 'exileFold', 'deathPoof',
  'buffStack', 'debuffStack', 'laneSurge', 'fieldRainbow', 'fieldAurora', 'fieldOmen', 'roadProgress', 'mapTransition', 'rarityClimb', 'shinyGlint', 'legendaryWings',
  'victoryCheer', 'defeatDroop', 'levelUpSpring', 'mapClearFlag', 'bossIntro', 'bossPhase', 'buttonSquish', 'lumberGain', 'cardDraw', 'handFull', 'notifyPing', 'mulliganSwap', 'idleVisitor', 'idleYawn'];
W.version = '2026-11-11';
})(typeof window !== 'undefined' ? window : globalThis);
