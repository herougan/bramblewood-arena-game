/* ============================================================
   Bramblewood FX, smoke and war (2026-10-21, package FX-WAR)
   Owner: "add smoke effects if we haven't yet, and others related to war, that we can pick and choose and use. Flag the effect
   used if it's already used in game, so we know in the future."

   A menu of sixteen reusable effects on window.WarFX. NOTHING in the game calls them yet: they are shown in the Effects Lab
   (tab "Smoke and war", tools/effects-lab/fxlab-war.js) with an "In game" or "Lab only (not used yet)" badge, and the owner picks
   which to wire (see docs/effects-catalogue.md, "Smoke and war (2026-10-21)").

   Smoke and dust   puff, smokeBurst, smokeScreen, battlefieldSmoke, smokeColumn, dustKick
   War              cannonBlast, catapultLob, explosion, flamingVolley, burningGround, swordClash, warHorn, ramSlam, caltrops, signalFlare

   Contract (same as bramblewood-fx-a.js … g.js, docs/effects-lab-contract.md)
   - WarFX.name(target, opts) -> Promise. A target is a board card or tile (element), a list of elements, or a point {x, y, w?, h?}
     in viewport pixels. Effects that go from A to B take (from, to, opts). Every effect honours opts.onImpact (the beat that hits)
     and opts.onDone, and never reads or changes game state.
   - Overlays are fixed-position nodes on <body> (class fxw-*), removed when their tween ends. WarFX.clear() drops everything at once.
   - House style: bubbly, obvious, cute; no blood. Particles are cartoon blobs with a lit edge, never blur or blend layers.
   - Performance: no CSS filter anywhere, no mix-blend-mode, no full-screen layer. The longest effect keeps at most ~40 nodes alive;
     all motion is transform and opacity, driven by one GSAP tween per group (so the Lab's slow motion and the game's hit-stop work).
   - prefers-reduced-motion: every effect shows one still glyph that fades in and out (about 0.7 s), with no movement and no shake,
     and still calls onImpact and onDone.
   - Gating (the Effects level, matchState) belongs to the caller, as in the other modules.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const W = root.WarFX = root.WarFX || {};

// ---- helpers ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const D2R = Math.PI/180;
const rnd = (a, b)=> a + Math.random()*(b - a);
const clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
const call = fn=>{ try{ fn && fn(); }catch(e){} };
// a .board-card wrapper stands for its tile; any other element (a lane row, the battlefield) stands for itself
const tileOf = el=> (el && el.classList && el.classList.contains('board-card') && el.querySelector('.card-tile')) || el;
const eout = u=> 1 - (1 - u)*(1 - u);
const ein = u=> u*u;

// Everything we own, so WarFX.clear() can drop it mid-effect (the Lab does between plays).
const NODES = new Set(), TWEENS = new Set();
function node(cls, w, h, parent){
  const e = document.createElement('div'); e.className = 'fxw ' + cls; e.setAttribute('aria-hidden', 'true'); e.style.opacity = '0'; // hidden until put() places it (a delayed tween must not show it at the corner)
  if(w){ e.style.width = w + 'px'; e.style.height = (h || w) + 'px'; }
  (parent || document.body).appendChild(e); NODES.add(e); return e;
}
const kill = e=>{ if(e){ NODES.delete(e); if(e.parentNode) e.remove(); } };
// Place a node by its centre, with scale / rotation / opacity (transform and opacity only: nothing here causes layout).
function put(e, x, y, o){
  o = o || {};
  e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) rotate(${(o.r || 0).toFixed(1)}deg) scale(${(o.sx != null ? o.sx : (o.s != null ? o.s : 1)).toFixed(3)},${(o.sy != null ? o.sy : (o.s != null ? o.s : 1)).toFixed(3)})`;
  e.style.opacity = o.op == null ? 1 : clamp(o.op, 0, 1).toFixed(3);
}
// One GSAP tween drives a whole group of particles: fn(t) with t 0..1. Resolves when it ends (or is cleared).
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
const fin = o=>{ call(o && o.onDone); };
const finish = o=> ()=> fin(o);
const none = o=>{ call(o && o.onImpact); fin(o); return Promise.resolve(); };

// ---- geometry ----
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
const angOf = (a, b)=> Math.atan2(b.y - a.y, b.x - a.x);
const qpt = (a, m, b, t)=> ({x:(1 - t)*(1 - t)*a.x + 2*(1 - t)*t*m.x + t*t*b.x, y:(1 - t)*(1 - t)*a.y + 2*(1 - t)*t*m.y + t*t*b.y});

// The target reacts: pushed along (dx, dy), squashes, springs back (the same recipe as SkillFX.knock). Skipped under reduced motion.
function jolt(t, dx, dy, k){
  const g = G(); if(!g || RM() || !t) return; const e = tileOf(t); if(!e || !e.nodeType) return; k = k || 1;
  g.timeline().to(e, {x:dx, y:dy, rotation:dx*.5, scaleX:1 + .05*k, scaleY:1 - .07*k, duration:.06, ease:'power2.out'})
    .to(e, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, duration:.42, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
}
// A whole container shakes (the battlefield, never a card): a few quick offsets, then back.
function shake(host, amp){
  const g = G(); if(!g || RM() || !host || !host.nodeType) return; amp = amp || 5;
  g.timeline({onComplete:()=> g.set(host, {clearProps:'transform'})})
    .to(host, {x:amp, y:-amp*.5, rotation:.35, duration:.04}).to(host, {x:-amp*.8, y:amp*.4, rotation:-.3, duration:.05})
    .to(host, {x:amp*.5, y:-amp*.2, rotation:.15, duration:.05}).to(host, {x:-amp*.25, y:0, rotation:0, duration:.06}).to(host, {x:0, y:0, duration:.08});
}
function hop(t, h){
  const g = G(); if(!g || RM() || !t) return; const e = tileOf(t); if(!e || !e.nodeType) return;
  g.timeline().to(e, {y:-(h || 8), scaleY:1.04, duration:.1, ease:'power2.out'}).to(e, {y:0, scaleY:1, duration:.34, ease:'bounce.out', clearProps:'transform'});
}

// ---- CSS (one <style>, added once) ----
const SVG = s=> 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
const FLAME_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 52'><defs><linearGradient id='g' x1='0' y1='1' x2='0' y2='0'><stop offset='0' stop-color='#e2411b'/><stop offset='.55' stop-color='#ff9a22'/><stop offset='1' stop-color='#ffd84a'/></linearGradient></defs><path d='M20 2 C22 14 36 20 36 34 A16 16 0 0 1 4 34 C4 26 10 22 12 12 C15 16 17 12 20 2 Z' fill='url(#g)' stroke='#b9300f' stroke-width='1.6' stroke-linejoin='round'/><path d='M20 24 C22 30 28 32 28 38 A8 8 0 0 1 12 38 C12 33 18 31 20 24 Z' fill='#fff3b0'/></svg>`);
const STAR_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 100 100'><path d='M0 -48 L9 -12 L46 -14 L16 5 L30 42 L0 20 L-30 42 L-16 5 L-46 -14 L-9 -12 Z' fill='#fff6b8' stroke='#ffb52a' stroke-width='4' stroke-linejoin='round'/><circle r='13' fill='#fff'/></svg>`);
const CALTROP_URI = SVG(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-20 -20 40 40'><g stroke='#3b4350' stroke-width='2' stroke-linejoin='round'><path d='M0 -17 L4 -3 L-4 -3 Z' fill='#cdd5e0'/><path d='M16 9 L3 5 L8 -2 Z' fill='#aab4c2'/><path d='M-16 9 L-8 -2 L-3 5 Z' fill='#aab4c2'/><path d='M0 8 L4 -2 L-4 -2 Z' fill='#8e99a9'/></g><circle r='3.2' fill='#e8edf5' stroke='#3b4350' stroke-width='1.6'/></svg>`);
const CSS = `
.fxw{position:fixed; left:0; top:0; pointer-events:none; z-index:1200; will-change:transform, opacity;}
.fxw-smoke{border-radius:50%; background:radial-gradient(circle at 36% 30%, var(--w0,#ffffff) 0, var(--w1,#eef0f5) 42%, var(--w2,#c6cdd9) 100%); box-shadow:inset -3px -4px 0 rgba(90,100,125,.22);}
.fxw-smoke.is-dark{--w0:#c9ced7; --w1:#8b929e; --w2:#5b626e; box-shadow:inset -3px -4px 0 rgba(20,24,30,.3);}
.fxw-smoke.is-dust{--w0:#f4e6c9; --w1:#d9c299; --w2:#b59c72; box-shadow:inset -3px -4px 0 rgba(110,84,44,.25);}
.fxw-smoke.is-soft{background:radial-gradient(circle, rgba(236,240,246,.95) 0, rgba(210,216,226,.7) 48%, rgba(190,198,210,0) 72%); box-shadow:none;}
.fxw-smoke.is-soft.is-dark{background:radial-gradient(circle, rgba(150,157,170,.95) 0, rgba(120,127,140,.7) 48%, rgba(96,103,116,0) 72%);}
.fxw-fireblob{border-radius:50%; background:radial-gradient(circle at 40% 36%, #fff6b8 0, #ffd23d 28%, #ff8a1e 60%, #e2411b 100%);}
.fxw-flame{background:${FLAME_URI} center bottom/contain no-repeat;}
.fxw-star{background:${STAR_URI} center/contain no-repeat;}
.fxw-caltrop{background:${CALTROP_URI} center/contain no-repeat;}
.fxw-disc{border-radius:50%;}
.fxw-spark{width:3px; height:15px; border-radius:2px; background:linear-gradient(rgba(255,255,255,0), #ffe27a 45%, #fff 100%);}
.fxw-spark.is-red{background:linear-gradient(rgba(255,120,90,0), #ff6a4a 45%, #ffd2c4 100%);}
.fxw-spark.is-green{background:linear-gradient(rgba(120,255,150,0), #58e07a 45%, #d6ffe0 100%);}
.fxw-ring{border-radius:50%; box-sizing:border-box; border:4px solid #fff;}
.fxw-chip{border-radius:2px;}
.fxw-ember{width:6px; height:6px; border-radius:50%; background:radial-gradient(circle, #fff3b0 0, #ffb03a 55%, #ff6a1e 100%); box-shadow:0 0 5px 1px rgba(255,150,40,.7);}
.fxw-scorch{border-radius:50%; background:radial-gradient(ellipse at center, rgba(34,18,8,.6) 0, rgba(34,18,8,.38) 55%, rgba(34,18,8,0) 72%);}
.fxw-lane{overflow:hidden; border-radius:16px;} .fxw-lane.is-open{overflow:visible;}
.fxw-lane > i{position:absolute; left:0; top:0; display:block;}
.fxw-ball{border-radius:50%; background:radial-gradient(circle at 34% 30%, #e3e8ef 0, #7d8591 32%, #2b3038 100%); box-shadow:0 0 0 2px rgba(255,255,255,.28), 0 2px 4px rgba(0,0,0,.4);}
.fxw-rock{border-radius:46% 54% 50% 50% / 56% 48% 52% 44%; background:radial-gradient(circle at 34% 30%, #cfc6b4 0, #9a917e 40%, #5d5648 100%); box-shadow:inset -3px -4px 0 rgba(30,24,14,.3), 0 2px 4px rgba(0,0,0,.35);}
.fxw-rock::after{content:''; position:absolute; left:34%; top:30%; width:32%; height:3px; border-radius:2px; background:rgba(50,42,28,.55); transform:rotate(28deg);}
.fxw-shadow{border-radius:50%; background:radial-gradient(ellipse at center, rgba(0,0,0,.5) 0, rgba(0,0,0,0) 70%);}
.fxw-bomb{border-radius:50%; background:radial-gradient(circle at 36% 32%, #9aa0a8 0, #3c4148 45%, #15181c 100%); box-shadow:0 0 0 2px rgba(0,0,0,.22);}
.fxw-bomb::after{content:''; position:absolute; left:55%; top:-30%; width:3px; height:40%; border-radius:2px; background:linear-gradient(#ffd34a, #c8711e); transform:rotate(25deg);}
.fxw-arrow{height:4px; border-radius:3px; background:linear-gradient(90deg, #7a5428, #c8923e 70%);}
.fxw-arrow::before{content:''; position:absolute; right:-7px; top:-4px; border:6px solid transparent; border-left:10px solid #b8bcc4;}
.fxw-arrow::after{content:''; position:absolute; left:-2px; top:-3px; width:9px; height:10px; background:linear-gradient(#ff7a3a, #d0421e); clip-path:polygon(0 0, 100% 35%, 100% 65%, 0 100%);}
.fxw-arrow > i{position:absolute; right:-2px; top:-9px; width:15px; height:21px; background:${FLAME_URI} center bottom/contain no-repeat; transform:rotate(-90deg); transform-origin:50% 60%;}
.fxw-ram{border-radius:12px; background:repeating-linear-gradient(90deg, #9a6a34 0 9px, #7d5226 9px 11px); box-shadow:inset 0 -5px 0 rgba(0,0,0,.25), 0 3px 5px rgba(0,0,0,.45);}
.fxw-ram::after{content:''; position:absolute; right:-7px; top:1px; width:18px; height:calc(100% - 2px); border-radius:7px; background:linear-gradient(#8e949c, #5b6068); box-shadow:inset 0 0 0 2px #b4b9c0;}
.fxw-rocket{border-radius:6px 6px 3px 3px; background:linear-gradient(90deg, #d8453a, #ff8a73 40%, #b5281f);}
.fxw-rocket::before{content:''; position:absolute; left:0; top:-7px; width:100%; height:9px; border-radius:50% 50% 0 0; background:#ffe9a8;}
.fxw-glyph{font-size:34px; line-height:1; text-align:center; white-space:nowrap;}
`;
function injectCss(){
  if(document.getElementById('fx-war-style')) return;
  const s = document.createElement('style'); s.id = 'fx-war-style'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
}

// ---- shared building blocks ----
// Cartoon particles: n nodes burst from (x, y). o: cls, dark, dust, size(i), h(i), bg(i), a0..a1 (deg, 0 = right, 270 = up), d0..d1 (travel px),
// grav (px of fall), rise (px of lift), s0..s1 (scale), spin, stagger (s), dur (s), fadeStart (0..1), op (peak opacity), style fn(i, e).
function particles(x, y, o){
  o = o || {}; injectCss(); const n = o.n || 8, dur = o.dur || .7, ps = [];
  for(let i = 0; i < n; i++){
    const a = rnd(o.a0 == null ? 0 : o.a0, o.a1 == null ? 360 : o.a1)*D2R, d = rnd(o.d0 == null ? 20 : o.d0, o.d1 == null ? 60 : o.d1);
    const w = typeof o.size === 'function' ? o.size(i) : (o.size || 8), h = o.h ? o.h(i) : w;
    const e = node(o.cls || ('fxw-smoke' + (o.dark ? ' is-dark' : o.dust ? ' is-dust' : '')), w, h);
    if(o.bg) e.style.background = typeof o.bg === 'function' ? o.bg(i) : o.bg;
    if(o.style) call(()=> o.style(i, e));
    put(e, x, y, {op:0});
    ps.push({e, dx:Math.cos(a)*d, dy:Math.sin(a)*d, a:a/D2R, r0:o.orient ? a/D2R + 90 : rnd(0, 360), spin:rnd(-1, 1)*(o.spin || 0), delay:rnd(0, o.stagger || 0)/dur});
  }
  const s0 = o.s0 == null ? 1 : o.s0, s1 = o.s1 == null ? 1 : o.s1, fs = o.fadeStart == null ? .45 : o.fadeStart, op = o.op == null ? 1 : o.op;
  return run(dur, t=>{
    ps.forEach(p=>{
      const u = clamp((t - p.delay)/Math.max(.01, 1 - p.delay), 0, 1);
      if(u <= 0){ p.e.style.opacity = 0; return; }
      const k = eout(u), s = s0 + (s1 - s0)*k;
      put(p.e, x + p.dx*k, y + p.dy*k - (o.rise || 0)*k + (o.grav || 0)*u*u, {s, r:p.r0 + p.spin*u, op:(u < fs ? op : op*(1 - (u - fs)/(1 - fs)))});
    });
  }, {delay:o.delay}).then(()=> ps.forEach(p=> kill(p.e)));
}
// An expanding ring (sy < 1 flattens it into a ground ring).
function ring(x, y, o){
  o = o || {}; injectCss(); const size = o.size || 90, e = node('fxw-ring', size, size);
  e.style.borderColor = o.color || '#fff'; e.style.borderWidth = (o.w || 4) + 'px'; if(o.glow) e.style.boxShadow = `0 0 ${o.glow}px ${o.color || '#fff'}`;
  return run(o.dur || .45, t=>{ put(e, x, y, {sx:.1 + .9*eout(t), sy:(.1 + .9*eout(t))*(o.sy || 1), op:(o.op == null ? .95 : o.op)*(1 - ein(t))}); }, {delay:o.delay}).then(()=> kill(e));
}
// A soft round flash (white-yellow by default) that pops and fades.
function flash(x, y, size, color, dur){
  injectCss(); const e = node('fxw-disc', size, size); e.style.background = `radial-gradient(circle, #fff 0, ${color || 'rgba(255,238,170,.9)'} 45%, rgba(255,200,80,0) 72%)`;
  return run(dur || .2, t=>{ put(e, x, y, {s:.3 + 1*eout(t), op:1 - ein(t)}); }).then(()=> kill(e));
}
// A node flies from a to b along a lob (apex px above the straight line). fn(x, y, angleDeg, t, node) runs each frame.
function lob(a, b, o){
  o = o || {}; injectCss(); const e = node(o.cls, o.w, o.h); if(o.html) e.innerHTML = o.html;
  const m = {x:(a.x + b.x)/2, y:Math.min(a.y, b.y) - (o.apex == null ? 60 : o.apex)};
  return run(o.dur || .5, t=>{
    const u = o.ease ? o.ease(t) : t, p = qpt(a, m, b, u), q = qpt(a, m, b, Math.min(1, u + .02));
    const ang = Math.atan2(q.y - p.y, q.x - p.x)/D2R, sc = o.scaleMid ? 1 + (o.scaleMid - 1)*Math.sin(Math.PI*u) : 1;
    put(e, p.x, p.y, {r:o.spin ? o.spin*u : (o.align ? ang : 0), s:sc, op:t > .985 && o.vanish !== false ? 0 : 1});
    if(o.fn) o.fn(p.x, p.y, ang, t, e);
  }, {delay:o.delay}).then(()=> kill(e));
}
// A still glyph for reduced motion: it fades in and out in place, with no movement. onImpact fires at once.
function still(b, glyph, o){
  injectCss(); call(o && o.onImpact); const e = node('fxw-glyph', 0, 0); e.textContent = glyph; e.style.width = 'auto'; e.style.height = 'auto';
  return run(.7, t=>{ put(e, b.x, b.y, {op:t < .25 ? t/.25 : t > .7 ? (1 - t)/.3 : 1}); }).then(()=>{ kill(e); fin(o); });
}
const dirOf = (deg)=> ({x:Math.cos(deg*D2R), y:Math.sin(deg*D2R)});

// =====================================================================================
// SMOKE AND DUST
// =====================================================================================

// 1. puff: a cute "poof" of bubbly cloud blobs and a thin ring. Light by default; { dark } for gunpowder, { dust } for tan dust; { size }.
W.puff = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '💨', o);
  const size = o.size || Math.max(40, b.w*.62);
  call(o.onImpact);
  ring(b.x, b.y, {size:size*2.5, color:o.dark ? 'rgba(120,128,142,.9)' : 'rgba(255,255,255,.95)', w:3, dur:.4});
  return particles(b.x, b.y, {n:o.n || 9, dark:o.dark, dust:o.dust, size:()=> size*rnd(.6, 1.05), d0:size*.35, d1:size*1.1, s0:.3, s1:1.5, rise:size*.3, dur:1.05, fadeStart:.45}).then(finish(o));
};

// 2. smokeBurst: a smoke bomb. A lit bomb is lobbed from `from` onto `to`, then bursts into a ring of big clouds that linger as a haze.
//    smokeBurst(from, to, opts) or smokeBurst(point, null, opts) for the burst alone. { dark, size }.
W.smokeBurst = function(from, to, o){
  o = o || {}; const dst = boxOf(to || from), src = to ? boxOf(from) : null; if(!dst) return none(o); if(RM()) return still(dst, '💨', o);
  const R = o.size || Math.max(56, dst.w*.62);
  const burst = ()=>{
    call(o.onImpact);
    flash(dst.x, dst.y, R*2, 'rgba(255,255,255,.85)', .22);
    ring(dst.x, dst.y, {size:R*3.2, color:'rgba(255,255,255,.9)', w:4, dur:.5});
    jolt(to, 0, 3, .6);
    return Promise.all([
      particles(dst.x, dst.y, {n:10, dark:o.dark, size:()=> R*rnd(.75, 1.05), d0:R*.7, d1:R*1.2, s0:.25, s1:1.15, rise:R*.1, dur:1.05, fadeStart:.5}),
      particles(dst.x, dst.y, {n:6, dark:o.dark, size:()=> R*rnd(.9, 1.2), d0:R*.05, d1:R*.5, s0:.3, s1:1.2, rise:R*.35, dur:1.6, fadeStart:.55, stagger:.12}),
    ]);
  };
  if(!src) return burst().then(finish(o));
  return lob(src, dst, {cls:'fxw-bomb', w:20, dur:.5, apex:Math.max(50, Math.hypot(dst.x - src.x, dst.y - src.y)*.35), spin:540}).then(burst).then(finish(o));
};

// 3. smokeScreen: a wall of cloud rolls along a lane and hides it, holds, then lifts. lane = a row element or a list of cards.
//    { from: 'left' | 'right', hold: seconds, dark }.
W.smokeScreen = function(lane, o){
  o = o || {}; const b = boxOf(lane); if(!b) return none(o); if(RM()) return still(b, '💨', o);
  injectCss(); const pad = 10, Wd = b.w + pad*2, H = b.h + pad*2, left = o.from === 'right' ? -1 : 1, hold = o.hold == null ? .9 : o.hold;
  const wrap = node('fxw-lane is-open', Wd, H); put(wrap, b.x, b.y);
  const n = clamp(Math.round(Wd/(H*.5)), 7, 18), bl = [];
  for(let i = 0; i < n; i++){
    const e = document.createElement('i'); e.className = 'fxw-smoke' + (o.dark ? ' is-dark' : ''); e.style.opacity = '0'; const s = H*rnd(.8, 1.05); e.style.width = e.style.height = s + 'px'; wrap.appendChild(e);
    const slot = left > 0 ? i/(n - 1) : 1 - i/(n - 1);
    bl.push({e, s, cx:(i/(n - 1))*Wd, cy:H*rnd(.35, .65), slot, ph:rnd(0, 6)});
  }
  call(o.onImpact);
  const total = 1.0 + hold + .8, tIn = .85/total, tHold = (.85 + hold)/total;
  return run(total, t=>{
    bl.forEach(p=>{
      const d = p.slot*.35; let x = p.cx, y = p.cy, op = .97, sc = 1;
      if(t < tIn){ const u = clamp((t/tIn - d)/(1 - d), 0, 1), k = eout(u); x = p.cx - left*(Wd*.6)*(1 - k); sc = .3 + .7*k; op = u*.97; }
      else if(t < tHold){ const w = (t - tIn)*total; x += Math.sin(w*4 + p.ph)*3; y += Math.cos(w*3 + p.ph)*3; }
      else { const u = clamp(((t - tHold)/(1 - tHold) - d)/(1 - d), 0, 1); y -= H*.55*eout(u); sc = 1 + .25*u; op = .97*(1 - u); }
      p.e.style.transform = `translate(${(x - p.s/2).toFixed(1)}px,${(y - p.s/2).toFixed(1)}px) scale(${sc.toFixed(3)})`; p.e.style.opacity = op.toFixed(3);
    });
  }).then(()=>{ kill(wrap); fin(o); });
};

// 4. battlefieldSmoke: low smoke banks drift across a region (the battlefield). Ambient: faint, slow, at most 8 big blobs.
//    { duration: ms (0 = until .stop()), dir: 1 | -1, dark }. The returned promise has .stop() to lift it early.
W.battlefieldSmoke = function(host, o){
  o = o || {}; const b = boxOf(host); if(!b) return none(o); if(RM()) return still(b, '💨', o);
  injectCss(); const dur = o.duration == null ? 3000 : o.duration, D = dur > 0 ? dur/1000 : 3600, dir = o.dir === -1 ? -1 : 1;
  const wrap = node('fxw-lane', b.w, b.h); put(wrap, b.x, b.y); wrap.style.borderRadius = '14px';
  const n = 7, bl = [];
  for(let i = 0; i < n; i++){
    const e = document.createElement('i'); e.className = 'fxw-smoke is-soft' + (o.dark ? ' is-dark' : ''); e.style.opacity = '0'; const s = b.w*rnd(.32, .55); e.style.width = e.style.height = s + 'px'; wrap.appendChild(e);
    bl.push({e, s, x0:rnd(0, b.w + s), y:b.h*(.15 + .7*(i/(n - 1))) + rnd(-12, 12), v:b.w*rnd(.07, .13), ph:rnd(0, 6), peak:rnd(.3, .5)});
  }
  let stopAt = -1, tw = null; const g = G(), FADE = .6;
  const frame = tm=>{
    const env = stopAt < 0 ? clamp(tm/FADE, 0, 1) : clamp(1 - (tm - stopAt)/FADE, 0, 1);
    bl.forEach(p=>{ const span = b.w + p.s*2; let x = ((p.x0 + dir*p.v*tm) % span + span) % span - p.s; const y = p.y + Math.sin(tm*.9 + p.ph)*10;
      p.e.style.transform = `translate(${x.toFixed(1)}px,${(y - p.s/2).toFixed(1)}px)`; p.e.style.opacity = (p.peak*env).toFixed(3); });
    return env;
  };
  const prom = new Promise(res=>{
    const st = {t:0}; if(!g){ kill(wrap); fin(o); res(); return; }
    tw = g.to(st, {t:1, duration:D, ease:'none', onUpdate:()=>{
      const tm = tw.time(); if(stopAt < 0 && dur > 0 && tm > D - FADE) stopAt = D - FADE;
      const env = frame(tm); if(stopAt >= 0 && env <= 0){ tw.kill(); }
    }, onComplete:()=>{ TWEENS.delete(tw); kill(wrap); fin(o); res(); }, onInterrupt:()=>{ TWEENS.delete(tw); kill(wrap); fin(o); res(); }});
    TWEENS.add(tw);
  });
  prom.stop = ()=>{ if(stopAt < 0 && tw) stopAt = tw.time(); };
  return prom;
};

// 5. smokeColumn: a twisting column of smoke (with a small flame at its foot) rises from a burning card or castle. { duration: ms, height, flame: false, dark: false }.
W.smokeColumn = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '🔥', o);
  injectCss(); const dur = (o.duration == null ? 2200 : o.duration)/1000, life = 1.3, n = 22, H = o.height || Math.max(150, b.h*1.15);
  const bx = b.x + (o.dx || 0), by = b.t + b.h*.3, bl = [];
  for(let i = 0; i < n; i++){ const s = rnd(30, 46); bl.push({e:node('fxw-smoke' + (o.dark === false ? '' : ' is-dark'), s, s), s, at:i*(dur/n), sway:rnd(12, 26), ph:rnd(0, 6)}); put(bl[i].e, bx, by, {op:0}); }
  let fl = null; if(o.flame !== false){ fl = node('fxw-flame', 26, 32); put(fl, bx, by + 6 - 16, {op:0}); }
  call(o.onImpact);
  return run(dur + life, t=>{
    const tm = t*(dur + life);
    bl.forEach(p=>{ const u = (tm - p.at)/life; if(u <= 0 || u >= 1){ p.e.style.opacity = 0; return; }
      put(p.e, bx + Math.sin(u*5 + p.ph)*p.sway*u, by - H*eout(u), {s:.35 + 1.5*u, op:.95*Math.min(1, u*6)*(1 - ein(u))}); });
    if(fl){ const on = tm < dur ? Math.min(1, tm/.25) : Math.max(0, 1 - (tm - dur)/.3); put(fl, bx, by + 6 - 16, {sx:.9 + .12*Math.sin(tm*14), sy:.95 + .2*Math.sin(tm*11 + 1), op:on}); fl.style.transformOrigin = '50% 100%'; }
  }).then(()=>{ bl.forEach(p=> kill(p.e)); kill(fl); fin(o); });
};

// 6. dustKick: battle dust kicked up behind a card as it charges (or lands). { dir: degrees the card moves, 0 = right, 90 = down; default 0 }.
W.dustKick = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '💨', o);
  const dir = o.dir == null ? 0 : o.dir, back = dir + 180, v = dirOf(dir), foot = {x:b.x - v.x*b.w*.28, y:b.b - 8 - v.y*b.h*.1};
  const size = Math.max(26, b.w*.34); call(o.onImpact); hop(target, 5);
  const ps = [];
  for(let k = 0; k < 3; k++) ps.push(particles(foot.x, foot.y, {n:4, dust:true, size:()=> size*rnd(.8, 1.3), a0:back - 40, a1:back + 40, d0:size*.9, d1:size*2.8, s0:.3, s1:1.5, rise:size*.5, dur:.95, fadeStart:.4, delay:k*.11}));
  ps.push(particles(foot.x, foot.y, {n:6, cls:'fxw-chip', size:()=> rnd(3, 6), bg:i=> i % 2 ? '#8a7a62' : '#b8a888', a0:back - 70, a1:back + 70, d0:size*.8, d1:size*2.2, grav:size*1.4, rise:size*1.2, spin:260, dur:.65, fadeStart:.6}));
  ps.push(particles(b.x - v.x*b.w*.7, b.y, {n:3, cls:'fxw-spark', size:2, h:()=> rnd(22, 34), bg:'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,.85))', a0:back - 8, a1:back + 8, d0:6, d1:22, orient:true, dur:.35, fadeStart:.2, op:.8}));
  return Promise.all(ps).then(finish(o));
};

// =====================================================================================
// WAR
// =====================================================================================

// 7. cannonBlast: muzzle flash and smoke, a cannonball that trails puffs, then a crash with debris, dust and sparks. cannonBlast(from, to, opts).
W.cannonBlast = function(from, to, o){
  o = o || {}; const dst = boxOf(to); if(!dst) return none(o); const src = boxOf(from) || {x:dst.x - 160, y:dst.y + 120, w:60, h:60, l:0, t:0, r:0, b:0};
  if(RM()) return still(dst, '💥', o);
  const ang = angOf(src, dst), v = {x:Math.cos(ang), y:Math.sin(ang)}, mz = {x:src.x + v.x*src.w*.5, y:src.y + v.y*src.h*.5}, deg = ang/D2R;
  const star = node('fxw-star', 46, 46); run(.22, t=>{ put(star, mz.x, mz.y, {s:.3 + .9*eout(t), r:deg + 90, op:1 - ein(t)}); }).then(()=> kill(star));
  particles(mz.x, mz.y, {n:6, size:()=> rnd(20, 30), a0:deg - 35, a1:deg + 35, d0:26, d1:64, s0:.3, s1:1.3, dur:.8, fadeStart:.35});
  jolt(from, -v.x*7, -v.y*7, .8);
  const trail = [.18, .36, .54, .72]; let ti = 0;
  return lob(mz, dst, {cls:'fxw-ball', w:22, dur:o.flight || .4, apex:Math.min(40, Math.hypot(dst.x - src.x, dst.y - src.y)*.12), ease:ein,
    fn:(x, y, a, t)=>{ while(ti < trail.length && t >= trail[ti]){ ti++; particles(x, y, {n:1, size:()=> rnd(14, 20), d0:0, d1:6, s0:.5, s1:1.2, dur:.55, fadeStart:.2, op:.9}); } }})
    .then(()=>{
      call(o.onImpact); flash(dst.x, dst.y, Math.max(70, dst.w*1.1), 'rgba(255,214,120,.9)', .2);
      ring(dst.x, dst.y, {size:Math.max(90, dst.w*1.7), color:'#ffe08a', w:4, dur:.4}); jolt(to, v.x*8, v.y*8, 1.2);
      return Promise.all([
        particles(dst.x, dst.y, {n:10, cls:'fxw-chip', size:()=> rnd(4, 8), bg:i=> ['#8f98a3', '#b9a07a', '#6e7783', '#8a5f2e'][i % 4], d0:dst.w*.3, d1:dst.w*.85, grav:dst.h*.5, rise:dst.h*.5, spin:300, dur:.7, fadeStart:.6}),
        particles(dst.x, dst.y, {n:5, dust:true, size:()=> rnd(18, 28), d0:8, d1:dst.w*.6, s0:.4, s1:1.5, rise:12, dur:.85, fadeStart:.35}),
        particles(dst.x, dst.y, {n:7, cls:'fxw-spark', size:2, orient:true, d0:dst.w*.2, d1:dst.w*.6, dur:.35, fadeStart:.4}),
      ]);
    }).then(finish(o));
};

// 8. catapultLob: a boulder is thrown in a high arc, a shadow grows where it will land, then it crashes: ground ring, bouncing rocks, dust. catapultLob(from, to, opts). { host } shakes it a little.
W.catapultLob = function(from, to, o){
  o = o || {}; const dst = boxOf(to); if(!dst) return none(o); const src = boxOf(from) || {x:dst.x - 200, y:dst.y + 150, w:60, h:60};
  if(RM()) return still(dst, '🪨', o);
  injectCss(); const dist = Math.hypot(dst.x - src.x, dst.y - src.y), dur = o.flight || .95, sh = node('fxw-shadow', Math.max(46, dst.w*.7), Math.max(16, dst.w*.24));
  jolt(from, 0, -5, .8);
  return lob(src, dst, {cls:'fxw-rock', w:26, dur, apex:clamp(dist*.7, 110, 260), scaleMid:1.7, spin:540, ease:t=> t,
    fn:(x, y, a, t)=>{ put(sh, dst.x, dst.b - 6, {s:.3 + .7*ein(t), op:.15 + .5*ein(t)}); }})
    .then(()=>{
      kill(sh); call(o.onImpact); shake(o.host, 6); jolt(to, 0, 8, 1.4);
      flash(dst.x, dst.y, Math.max(80, dst.w*1.2), 'rgba(255,230,170,.85)', .2);
      ring(dst.x, dst.b - 6, {size:Math.max(120, dst.w*2), sy:.32, color:'rgba(226,208,170,.95)', w:5, dur:.55});
      return Promise.all([
        particles(dst.x, dst.y, {n:12, cls:'fxw-rock', size:()=> rnd(7, 13), d0:dst.w*.3, d1:dst.w*1.0, grav:dst.h*.55, rise:dst.h*.9, spin:380, dur:.85, fadeStart:.7, a0:200, a1:340}),
        particles(dst.x, dst.y, {n:7, dust:true, size:()=> rnd(22, 34), d0:10, d1:dst.w*.8, s0:.4, s1:1.6, rise:14, dur:1.0, fadeStart:.4, a0:150, a1:390}),
      ]);
    }).then(finish(o));
};

// 9. explosion: white flash, a bubbly fireball, a shockwave ring (that shoves nearby cards), a star burst, sparks, debris, then rising smoke.
//    explosion(target, { size: 1, cards: [elements to shove] }).
W.explosion = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '💥', o);
  const S = o.size || 1, R = Math.max(70, b.w*1.1)*S;
  call(o.onImpact);
  flash(b.x, b.y, R*1.8, 'rgba(255,238,170,.95)', .2);
  const star = node('fxw-star', R*2.2, R*2.2); run(.34, t=>{ put(star, b.x, b.y, {s:.3 + .85*eout(t), r:25*t, op:1 - ein(t)}); }).then(()=> kill(star));
  ring(b.x, b.y, {size:R*3.4, color:'#fff3c4', w:7, dur:.5, glow:10});
  ring(b.x, b.y, {size:R*2.5, color:'#ff9a3a', w:5, dur:.5, delay:.07});
  (o.cards || []).forEach(c=>{ const cb = boxOf(c); if(!cb || c === target) return; const dx = cb.x - b.x, dy = cb.y - b.y, d = Math.hypot(dx, dy) || 1, k = clamp(1.3 - d/(R*2.4), 0, 1);
    if(k > .05) jolt(c, dx/d*R*.28*k, dy/d*R*.18*k, 1.1*k + .3); });
  return Promise.all([
    particles(b.x, b.y, {n:9, cls:'fxw-fireblob', size:()=> R*rnd(.45, .7), d0:R*.15, d1:R*.6, s0:.4, s1:1.3, dur:.6, fadeStart:.3}),
    particles(b.x, b.y, {n:10, cls:'fxw-spark', size:3, h:()=> rnd(14, 22), orient:true, d0:R*.7, d1:R*1.5, dur:.5, fadeStart:.4}),
    particles(b.x, b.y, {n:8, cls:'fxw-chip', size:()=> rnd(4, 8), bg:i=> ['#6e7783', '#9a8c74', '#4b4339'][i % 3], d0:R*.5, d1:R*1.3, grav:R*.8, rise:R*.7, spin:360, dur:.8, fadeStart:.6}),
    particles(b.x, b.y, {n:6, dark:true, size:()=> R*rnd(.55, .85), d0:R*.1, d1:R*.55, s0:.3, s1:1.3, rise:R*.55, dur:1.2, fadeStart:.5, delay:.22}),
  ]).then(finish(o));
};

// 10. flamingVolley: flaming arrows arc up and over, trail embers, and land as little flame pops on the lane. flamingVolley(from, targets, { n: 6 }).
W.flamingVolley = function(from, targets, o){
  o = o || {}; const aim = boxOf(targets); if(!aim) return none(o); const src = boxOf(from) || {x:aim.x, y:aim.b + 160, w:60, h:60};
  if(RM()) return still(aim, '🔥', o);
  injectCss(); const n = clamp(o.n || 6, 2, 8), list = Array.isArray(targets) ? targets.filter(Boolean) : null, ps = [];
  for(let i = 0; i < n; i++){
    const tb = list && list.length ? boxOf(list[i % list.length]) : aim;
    const to = {x:tb.x + rnd(-tb.w*.3, tb.w*.3), y:tb.y + rnd(-tb.h*.25, tb.h*.25)}, delay = i*.09, dist = Math.hypot(to.x - src.x, to.y - src.y);
    const marks = [.4, .7]; let mi = 0;
    ps.push(lob(src, to, {cls:'fxw-arrow', w:44, h:4, html:'<i></i>', dur:o.flight || .62, delay, apex:clamp(dist*.45, 70, 230), align:true, ease:ein,
      fn:(x, y, a, t)=>{ while(mi < marks.length && t >= marks[mi]){ mi++; particles(x, y, {n:1, cls:'fxw-ember', size:6, d0:2, d1:12, rise:20, s0:1, s1:.3, dur:.5, fadeStart:.2}); } }}).then(()=>{
        if(i === 0) call(o.onImpact); call(()=> o.onHit && o.onHit(i));
        if(tb.w) jolt(list && list.length ? list[i % list.length] : null, 0, 3, .5);
        const f = node('fxw-flame', 24, 30); run(.75, t=>{ put(f, to.x, to.y + 6 - 15, {sx:(.3 + .8*Math.min(1, t*5))*(.92 + .12*Math.sin(t*40)), sy:(.3 + .9*Math.min(1, t*5))*(.95 + .15*Math.sin(t*33)), op:1 - ein(clamp((t - .45)/.55, 0, 1))}); f.style.transformOrigin = '50% 100%'; }).then(()=> kill(f));
        return particles(to.x, to.y, {n:2, cls:'fxw-ember', size:6, d0:8, d1:24, rise:14, s0:1, s1:.3, dur:.5, fadeStart:.3});
      }));
  }
  return Promise.all(ps).then(finish(o));
};

// 11. burningGround: a scorch mark with a row of cartoon flames and rising embers under a card or on a slot, then it burns out. { duration: ms, width, smoke: true }.
W.burningGround = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '🔥', o);
  injectCss(); const D = (o.duration == null ? 2400 : o.duration)/1000, w = o.width || Math.max(50, b.w*1.05), baseY = (o.slot ? b.y : b.b) - 4;
  const sc = node('fxw-scorch', w*1.1, w*.34), fl = [], em = [];
  const m = clamp(Math.round(w/20), 4, 9);
  for(let i = 0; i < m; i++){ const s = rnd(22, 36), e = node('fxw-flame', s, s*1.25); fl.push({e, s, x:b.x - w/2 + (i + .5)*(w/m) + rnd(-4, 4), ph:rnd(0, 6), at:rnd(0, .3)}); }
  for(let i = 0; i < 14; i++){ const e = node('fxw-ember', 6, 6); em.push({e, at:rnd(.1, D - .6), x:b.x + rnd(-w/2, w/2), rise:rnd(40, 90), sway:rnd(-12, 12)}); }
  call(o.onImpact);
  return run(D, t=>{
    const tm = t*D, out = clamp((tm - (D - .5))/.5, 0, 1);
    put(sc, b.x, baseY + 2, {op:Math.min(1, tm/.3)*(1 - .5*out)});
    fl.forEach(p=>{ const u = clamp((tm - p.at)/.28, 0, 1), k = u < 1 ? 1 - Math.pow(1 - u, 3)*Math.cos(u*9) : 1, grow = k*(1 - out);
      p.e.style.transformOrigin = '50% 100%'; put(p.e, p.x, baseY + 4 - p.s*.625, {sx:(grow*(1 + .1*Math.sin(tm*12 + p.ph))), sy:grow*(1 + .22*Math.sin(tm*9 + p.ph*2)), r:Math.sin(tm*7 + p.ph)*4, op:grow > .02 ? 1 : 0}); });
    em.forEach(p=>{ const u = (tm - p.at)/.7; if(u <= 0 || u >= 1){ p.e.style.opacity = 0; return; } put(p.e, p.x + Math.sin(u*6)*p.sway, baseY - 10 - p.rise*eout(u), {s:1 - .6*u, op:1 - u}); });
  }).then(()=>{
    [sc, ...fl.map(p=> p.e), ...em.map(p=> p.e)].forEach(kill);
    if(o.smoke !== false) particles(b.x, baseY - 14, {n:3, dark:true, size:()=> rnd(20, 30), d0:2, d1:w*.25, s0:.4, s1:1.3, rise:34, dur:.9, fadeStart:.3, op:.8});
    fin(o);
  });
};

// 12. swordClash: two cards lunge together and their blades meet: a starburst, an oriented spark spray, a ring and a popping crossed-swords glyph. swordClash(a, b, opts).
W.swordClash = function(a, bTarget, o){
  o = o || {}; const A = boxOf(a), B = boxOf(bTarget); if(!A || !B) return none(o); const mid = {x:(A.x + B.x)/2, y:(A.y + B.y)/2};
  if(RM()) return still(mid, '⚔️', o);
  injectCss(); const ang = angOf(A, B), vx = Math.cos(ang), vy = Math.sin(ang), g = G();
  [[a, 1, A], [bTarget, -1, B]].forEach(([el, s])=>{ const t = tileOf(el); if(g && t && t.nodeType) g.timeline().to(t, {x:vx*10*s, y:vy*10*s, duration:.1, ease:'power2.in'}).to(t, {x:0, y:0, duration:.4, ease:'elastic.out(1, .5)', clearProps:'transform'}, '+=.12'); });
  const gl = node('fxw-glyph', 0, 0); gl.textContent = '⚔️'; gl.style.width = gl.style.height = 'auto'; gl.style.fontSize = Math.max(40, A.w*.5) + 'px'; put(gl, mid.x, mid.y, {op:0});
  const star = node('fxw-star', 90, 90);
  return run(.1, ()=>{}).then(()=>{
    call(o.onImpact);
    run(.5, t=>{ const k = t < .25 ? t/.25 : 1; put(gl, mid.x, mid.y, {s:t < .25 ? .2 + 1.15*eout(k) : 1.35 - .35*clamp((t - .25)/.15, 0, 1) + .04*Math.sin(t*30), r:-12 + 24*t, op:t < .75 ? 1 : (1 - t)/.25}); }).then(()=> kill(gl));
    run(.3, t=>{ put(star, mid.x, mid.y, {s:.3 + 1.0*eout(t), r:30*t, op:1 - ein(t)}); }).then(()=> kill(star));
    ring(mid.x, mid.y, {size:110, color:'#fff', w:4, dur:.4, glow:8});
    return Promise.all([
      particles(mid.x, mid.y, {n:14, cls:'fxw-spark', size:3, h:()=> rnd(14, 24), orient:true, d0:26, d1:78, dur:.5, fadeStart:.35}),
      particles(mid.x, mid.y, {n:3, cls:'fxw-star', size:()=> rnd(12, 18), d0:20, d1:50, s0:.3, s1:1, spin:200, dur:.6, fadeStart:.5}),
    ]).then(()=> run(.12, ()=>{}));
  }).then(finish(o));
};

// 13. warHorn: a horn pops above the source and sounds three gold rings; each ally the ring reaches hops, flashes and lets a note float up. warHorn(source, allies, opts).
W.warHorn = function(source, allies, o){
  o = o || {}; const s = boxOf(source); if(!s) return none(o); if(RM()) return still({x:s.x, y:s.t - 10}, '📯', o);
  injectCss(); const list = (allies || []).filter(Boolean).filter(x=> x !== source), R = o.radius || Math.max(220, ...list.map(x=>{ const q = boxOf(x); return q ? Math.hypot(q.x - s.x, q.y - s.y) + 50 : 0; }));
  const horn = node('fxw-glyph', 0, 0); horn.textContent = '📯'; horn.style.width = horn.style.height = 'auto'; horn.style.fontSize = Math.max(32, s.w*.4) + 'px'; put(horn, s.x, s.t - 6, {op:0});
  call(o.onImpact); hop(source, 6);
  run(.9, t=>{ const k = t < .2 ? t/.2 : 1; put(horn, s.x, s.t - 6 - 6*eout(k), {s:t < .2 ? .3 + 1.0*eout(k) : 1.3 - .3*clamp((t - .2)/.15, 0, 1), r:-14 + 6*Math.sin(t*26), op:t < .75 ? 1 : (1 - t)/.25}); }).then(()=> kill(horn));
  [0, 1, 2].forEach(i=> ring(s.x, s.y, {size:R*2, color:i === 1 ? '#fff2b8' : '#ffd25a', w:5 - i, dur:.9, delay:.12 + i*.15, glow:8, op:.85}));
  list.forEach(x=>{ const q = boxOf(x); if(!q) return; const d = Math.hypot(q.x - s.x, q.y - s.y), at = .12 + (d/R)*.9*.9;
    run(.01, ()=>{}, {delay:at}).then(()=>{ hop(x, 9); ring(q.x, q.y, {size:q.w*1.6, color:'#ffd25a', w:3, dur:.4});
      const nt = node('fxw-glyph', 0, 0); nt.textContent = '♪'; nt.style.width = nt.style.height = 'auto'; nt.style.fontSize = '22px'; nt.style.color = '#ffd25a'; nt.style.textShadow = '0 1px 0 #8a5a00, 0 0 6px #ffe9a0';
      run(.8, t=>{ put(nt, q.x + Math.sin(t*6)*6, q.t - 4 - 34*eout(t), {s:.6 + .5*Math.min(1, t*4), op:1 - ein(t)}); }).then(()=> kill(nt)); }); });
  return run(1.5, ()=>{}).then(finish(o));
};

// 14. ramSlam: a siege ram is drawn back and swung into the target: splinters, stone chips, a ground ring, a squash and (with { host }) a board shake. { from: degrees the ram comes from (90 = below; default), host, shake }.
W.ramSlam = function(target, o){
  o = o || {}; const b = boxOf(target); if(!b) return none(o); if(RM()) return still(b, '💥', o);
  injectCss(); const from = o.from == null ? 90 : o.from, v = dirOf(from), len = 78, ang = from + 180;
  const edge = {x:b.x + v.x*b.w*.5, y:b.y + v.y*b.h*.5}, far = {x:edge.x + v.x*(len/2 + 130), y:edge.y + v.y*(len/2 + 130)}, back = {x:edge.x + v.x*(len/2 + 50), y:edge.y + v.y*(len/2 + 50)}, hit = {x:edge.x + v.x*(len/2 - 2), y:edge.y + v.y*(len/2 - 2)};
  const r = node('fxw-ram', len, 24); const pos = (p, k)=> put(r, p.x, p.y, {r:ang, op:k});
  pos(far, 0);
  const lerp = (p, q, k)=> ({x:p.x + (q.x - p.x)*k, y:p.y + (q.y - p.y)*k});
  return run(.2, t=> pos(lerp(far, back, eout(t)), clamp(t*4, 0, 1))).then(()=> run(.1, t=> pos(lerp(back, hit, ein(t)), 1))).then(()=>{
    call(o.onImpact); shake(o.host, o.shake || 6); jolt(target, -v.x*7, -v.y*7, 1.3);
    flash(edge.x, edge.y, 90, 'rgba(255,230,170,.85)', .18);
    ring(edge.x, edge.y, {size:Math.max(110, b.w*1.6), sy:.35, color:'rgba(226,208,170,.95)', w:5, dur:.5});
    Promise.all([
      particles(edge.x, edge.y, {n:9, cls:'fxw-chip', size:()=> rnd(3, 5), h:()=> rnd(9, 14), bg:'#9a6a34', a0:from - 90, a1:from + 90, d0:18, d1:60, grav:22, spin:260, dur:.6, fadeStart:.6, orient:true}),
      particles(edge.x, edge.y, {n:8, cls:'fxw-chip', size:()=> rnd(4, 8), bg:i=> i % 2 ? '#8f98a3' : '#b9b2a2', a0:from - 100, a1:from + 100, d0:b.w*.3, d1:b.w*.8, grav:b.h*.4, spin:300, dur:.65, fadeStart:.6}),
      particles(edge.x, edge.y, {n:6, dust:true, size:()=> rnd(18, 28), a0:from - 110, a1:from + 110, d0:10, d1:b.w*.7, s0:.4, s1:1.5, rise:8, dur:.9, fadeStart:.35}),
    ]);
    return run(.34, t=> pos(lerp(hit, back, eout(t)*.35), 1)).then(()=> run(.28, t=> pos(lerp(hit, back, .35 + .65*t), 1 - t)));
  }).then(()=>{ kill(r); fin(o); });
};

// 15. caltrops: a handful of little four-point jacks are thrown across a lane, bounce twice, settle and glint, then fade. caltrops(from, lane, { n: 14 }).
W.caltrops = function(from, lane, o){
  o = o || {}; const area = boxOf(lane); if(!area) return none(o); if(RM()) return still(area, '✦', o);
  injectCss(); const src = boxOf(from) || {x:area.l - 40, y:area.y, w:40, h:40}, n = clamp(o.n || 14, 4, 22), cs = [];
  for(let i = 0; i < n; i++){ const e = node('fxw-caltrop', 28, 28), to = {x:rnd(area.l + 12, area.r - 12), y:rnd(area.t + area.h*.45, area.b - 8)};
    cs.push({e, to, at:i*.035, r0:rnd(0, 360), spin:rnd(240, 520)*(i % 2 ? 1 : -1), b:rnd(-26, 26)}); }
  const FLY = .5, B1 = .22, B2 = .14, REST = .7, OUT = .3, total = cs[cs.length - 1].at + FLY + B1 + B2 + REST + OUT;
  call(o.onImpact); if(o.hit) hop(o.hit, 8);
  return run(total, t=>{
    const tm = t*total;
    cs.forEach(p=>{
      const u = tm - p.at; let x, y, s = 1, op = 1, r = p.r0;
      if(u < 0){ p.e.style.opacity = 0; return; }
      if(u < FLY){ const k = u/FLY, q = qpt({x:src.x, y:src.y}, {x:(src.x + p.to.x)/2, y:Math.min(src.y, p.to.y) - 90}, p.to, k); x = q.x; y = q.y; r = p.r0 + p.spin*k; }
      else if(u < FLY + B1){ const k = (u - FLY)/B1; x = p.to.x + p.b*k; y = p.to.y - Math.sin(Math.PI*k)*16; r = p.r0 + p.spin + 90*k; }
      else if(u < FLY + B1 + B2){ const k = (u - FLY - B1)/B2; x = p.to.x + p.b + p.b*.3*k; y = p.to.y - Math.sin(Math.PI*k)*6; r = p.r0 + p.spin + 90 + 30*k; }
      else { const w = u - FLY - B1 - B2; x = p.to.x + p.b*1.3; y = p.to.y; r = p.r0 + p.spin + 120; if(w > REST){ const k = (w - REST)/OUT; op = 1 - k; s = 1 - .35*k; } else s = 1 + .22*Math.max(0, Math.sin(w*9 - p.r0))*(w > .12 ? 1 : 0); }
      put(p.e, x, y, {r, s, op});
    });
  }).then(()=>{ cs.forEach(p=> kill(p.e)); fin(o); });
};

// 16. signalFlare: a flare rocket climbs from the source trailing sparks and bursts into a glowing star shell that drifts down. { color: 'red' | 'green' | 'gold', height }.
W.signalFlare = function(source, o){
  o = o || {}; const s = boxOf(source); if(!s) return none(o); if(RM()) return still({x:s.x, y:s.t - 40}, '✨', o);
  injectCss(); const C = {red:{c:'#ff5a46', g:'255,90,70', k:'is-red'}, green:{c:'#58e07a', g:'80,230,120', k:'is-green'}, gold:{c:'#ffd25a', g:'255,210,90', k:''}}[o.color] || {c:'#ffd25a', g:'255,210,90', k:''};
  const H = o.height || clamp(s.t*.75, 150, 330), sx = s.x, sy = s.t + 4, top = {x:sx + rnd(-14, 14), y:sy - H};
  const rk = node('fxw-rocket', 7, 20), trail = [.15, .3, .45, .6, .75, .9]; let ti = 0;
  hop(source, 4);
  return run(.75, t=>{ const u = eout(t)*.35 + t*.65, x = sx + (top.x - sx)*u + Math.sin(u*18)*4, y = sy - H*u;
      put(rk, x, y, {r:Math.sin(u*18)*8, op:t > .97 ? 0 : 1});
      while(ti < trail.length && t >= trail[ti]){ ti++; particles(x, y + 8, {n:2, cls:'fxw-ember', size:6, d0:2, d1:10, rise:-14, s0:1, s1:.3, dur:.45, fadeStart:.2}); particles(x, y + 10, {n:1, size:()=> rnd(10, 14), d0:0, d1:4, s0:.4, s1:1.3, dur:.7, fadeStart:.25, op:.8}); } })
    .then(()=>{
      kill(rk); call(o.onImpact);
      const glow = node('fxw-disc', 190, 190); glow.style.background = `radial-gradient(circle, rgba(255,255,255,.95) 0, rgba(${C.g},.6) 28%, rgba(${C.g},0) 68%)`;
      const star = node('fxw-star', 46, 46);
      ring(top.x, top.y, {size:150, color:C.c, w:3, dur:.55, glow:8});
      particles(top.x, top.y, {n:16, cls:'fxw-spark ' + C.k, size:3, h:()=> rnd(14, 22), orient:true, d0:40, d1:96, grav:34, dur:1.0, fadeStart:.45});
      run(.5, t=>{ put(star, top.x, top.y, {s:.3 + 1.1*eout(t), r:40*t, op:1 - ein(t)}); }).then(()=> kill(star));
      return run(1.4, t=>{ const k = t < .12 ? t/.12 : 1; put(glow, top.x, top.y + 46*t, {s:(.4 + .75*eout(k))*(1 - .15*t), op:(1 - ein(t))*(.85 + .15*Math.sin(t*50))}); }).then(()=> kill(glow));
    }).then(finish(o));
};

// Drop everything now (the Lab does this between plays; a caller can use it when a match ends).
W.clear = function(){ TWEENS.forEach(t=>{ try{ t.kill(); }catch(e){} }); TWEENS.clear(); NODES.forEach(e=>{ try{ e.remove(); }catch(err){} }); NODES.clear(); };
W.names = ['puff', 'smokeBurst', 'smokeScreen', 'battlefieldSmoke', 'smokeColumn', 'dustKick', 'cannonBlast', 'catapultLob', 'explosion', 'flamingVolley', 'burningGround', 'swordClash', 'warHorn', 'ramSlam', 'caltrops', 'signalFlare'];
W.version = '2026-10-21';
})(typeof window !== 'undefined' ? window : globalThis);
