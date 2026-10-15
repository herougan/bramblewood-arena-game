/* ============================================================
   Bramblewood FX, batch F (2026-10-15): combat-skill (part), ui-feedback, meta-progression (part), rewards-results, tutorial-dialogue, raid-dungeon-pvp
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.F: FX.F.someEffect(el, opts); variants are FX.F.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-f-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxf- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.F.onEvent / FX.F.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.F = FX.F || {};
const TAG = 'f';

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
// 2026-10-15 (batch F, docs/effects-inventory-2026-10-15.json): UI feedback, meta-progression, rewards and results,
// tutorial and dialogue, raid / dungeon / PvP, and the resource-gain combat beats. Every effect below is a pure visual:
// it animates the element(s) it is handed plus overlays it adds to <body>, removes every node it adds, and resolves a
// Promise when done (opts.onDone too). Lab demos: tools/effects-lab/manifest/f.js. Game hooks: M.onEvent / M.hooks (bottom).

// ---------- shared building blocks (2026-10-15) ----------
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const Z = 9700; // above modals, results, toasts; every overlay here is pointer-events:none and short-lived
const VW = ()=> root.innerWidth || 1024, VH = ()=> root.innerHeight || 768;
// A point (with size) for an element, a rect, or {x, y}.
function pt(t){
  if(!t) return {x:VW()/2, y:VH()*0.42, w:0, h:0};
  if(typeof t.getBoundingClientRect === 'function'){ const r = t.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; }
  if(t.left != null && t.width != null) return {x:t.left + t.width/2, y:t.top + t.height/2, w:t.width, h:t.height, r:t};
  return {x:t.x, y:t.y, w:t.w || 0, h:t.h || 0};
}
const alive = el=> !!(el && el.isConnected && el.getBoundingClientRect && el.getBoundingClientRect().width);
// A fixed overlay above everything, removed after `ms` whatever happens (belt and braces next to each onComplete).
function lay(cls, html, ms){ const e = layer(cls, html); e.style.zIndex = Z; later(()=>{ if(e.isConnected) e.remove(); }, ms || 6000); return e; }
// Centre of a host (the lab stage, a panel) or of the window.
function hostPt(host){ return host ? pt(host) : {x:VW()/2, y:VH()*0.42, w:VW(), h:VH()}; }
const finish = (o, res)=>{ call(o && o.onDone); if(res) res(); };
const tl = (o, res)=>{ const g = G(); return g.timeline({onComplete:()=> finish(o, res)}); };
const EMOJI = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;

css('core', `
.fxf .fxf-p{position:absolute; left:0; top:0; display:block; border-radius:50%; will-change:transform,opacity; pointer-events:none;}
.fxf .fxf-p.is-g{border-radius:0; line-height:1; font-family:${EMOJI}; filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));}
.fxf .fxf-p.is-star{border-radius:0; clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);}
.fxf .fxf-p.is-shard{border-radius:2px; clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);}
.fxf .fxf-p.is-chip{border-radius:2px;}
.fxf .fxf-ring{position:absolute; left:0; top:0; border-radius:50%; border:3px solid #ffd56e; box-sizing:border-box; will-change:transform,opacity;}
.fxf .fxf-g{position:absolute; left:0; top:0; line-height:1; font-family:${EMOJI}; filter:drop-shadow(0 2px 3px rgba(0,0,0,.45)); will-change:transform,opacity; white-space:nowrap;}
.fxf .fxf-label{position:absolute; left:0; top:0; font:900 17px/1 'Baloo 2',system-ui,sans-serif; color:#fff8e0; white-space:nowrap; letter-spacing:.01em;
  text-shadow:0 2px 0 rgba(60,30,0,.55), 0 0 8px rgba(0,0,0,.45); will-change:transform,opacity;}
.fxf .fxf-label.is-good{color:#c9ffb8;} .fxf .fxf-label.is-bad{color:#ffb3a8;} .fxf .fxf-label.is-gold{color:#ffe08a;} .fxf .fxf-label.is-ink{color:#2b2117; text-shadow:0 1px 0 rgba(255,255,255,.6);}
.fxf .fxf-box{position:absolute; left:0; top:0; overflow:hidden; pointer-events:none;}
.fxf .fxf-sheen{position:absolute; top:-30%; bottom:-30%; left:0; width:45%; background:linear-gradient(100deg, transparent 0%, rgba(255,255,255,.0) 20%, rgba(255,255,255,.8) 50%, rgba(255,255,255,0) 80%, transparent 100%); mix-blend-mode:screen;}
.fxf .fxf-flash{position:absolute; inset:0; border-radius:inherit;}
.fxf .fxf-vig{position:fixed; inset:0; pointer-events:none;}
/* the ribbon banner */
.fxf .fxf-bn{position:absolute; left:0; top:0; display:flex; align-items:center; justify-content:center; transform-origin:50% 50%;}
.fxf .fxf-bn-band{position:relative; z-index:2; display:flex; align-items:center; gap:10px; padding:10px 26px 11px; border-radius:6px;
  background:linear-gradient(180deg, var(--bn-a) 0%, var(--bn-b) 100%); color:var(--bn-ink); box-shadow:0 0 0 2px var(--bn-edge), 0 10px 26px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.35);
  font:900 clamp(20px, 5.4vw, 34px)/1 'Baloo 2',system-ui,sans-serif; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap; text-shadow:0 1px 0 rgba(255,255,255,.25);}
.fxf .fxf-bn-band small{display:block; font:800 clamp(11px, 2.6vw, 14px)/1.1 'Nunito',system-ui,sans-serif; letter-spacing:.02em; text-transform:none; opacity:.9; margin-top:3px;}
.fxf .fxf-bn-txt{display:flex; flex-direction:column; align-items:center;}
.fxf .fxf-bn-ico{font-family:${EMOJI}; font-size:1.05em; filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));}
.fxf .fxf-bn-tail{position:absolute; z-index:1; top:22%; width:44px; height:78%; background:var(--bn-b); filter:brightness(.72);}
.fxf .fxf-bn-tail.l{left:-30px; clip-path:polygon(0 0,100% 0,100% 100%,0 100%,28% 50%);}
.fxf .fxf-bn-tail.r{right:-30px; clip-path:polygon(0 0,100% 0,72% 50%,100% 100%,0 100%);}
.fxf .fxf-bn.t-gold{--bn-a:#ffe48a; --bn-b:#e3a33a; --bn-ink:#4a2a06; --bn-edge:#8a5a14;}
.fxf .fxf-bn.t-red{--bn-a:#f0645a; --bn-b:#a3221b; --bn-ink:#fff3e0; --bn-edge:#5e100c;}
.fxf .fxf-bn.t-teal{--bn-a:#4fb3a9; --bn-b:#1d5f63; --bn-ink:#effcf8; --bn-edge:#c58b4a;}
.fxf .fxf-bn.t-violet{--bn-a:#a77ee8; --bn-b:#4b2a8a; --bn-ink:#fff; --bn-edge:#2a1452;}
.fxf .fxf-bn.t-green{--bn-a:#7cc95e; --bn-b:#2e6b2a; --bn-ink:#f4ffe8; --bn-edge:#1b3d18;}
.fxf .fxf-bn.t-ink{--bn-a:#3b3024; --bn-b:#1a140e; --bn-ink:#f4efdc; --bn-edge:#c9a46a;}
.fxf .fxf-bn.t-sky{--bn-a:#9fd6f5; --bn-b:#3c87c0; --bn-ink:#0f2a40; --bn-edge:#1d4f78;}
.fxf .fxf-bn.t-stone{--bn-a:#b9b6ab; --bn-b:#6c6a62; --bn-ink:#26241f; --bn-edge:#3a3833;}
/* the rubber stamp */
.fxf .fxf-stamp{position:absolute; left:0; top:0; padding:6px 14px; border:3px solid currentColor; border-radius:10px; font:900 26px/1 'Baloo 2',system-ui,sans-serif; letter-spacing:.06em;
  text-transform:uppercase; white-space:nowrap; color:#c8322a; background:rgba(255,248,230,.12); box-shadow:inset 0 0 0 2px rgba(255,255,255,.12); text-shadow:0 1px 0 rgba(0,0,0,.2);}
.fxf .fxf-stamp.c-gold{color:#e9b44c;} .fxf .fxf-stamp.c-green{color:#3fa34d;} .fxf .fxf-stamp.c-teal{color:#2a8f88;} .fxf .fxf-stamp.c-ink{color:#f4efdc;}
@media (max-width:480px){ .fxf .fxf-stamp{font-size:20px;} .fxf .fxf-label{font-size:15px;} }
`);

// Particles from a point: dots, stars, shards or glyphs flying out (and optionally falling).
function burst(x, y, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const n = Math.max(1, Math.min(40, o.n || 12)), host = lay('fxf-burst', '', 4000);
  const glyphs = o.glyphs, cols = o.colors || ['#ffd56e', '#fff3c4', '#ffb347'];
  const d0 = (o.dist || [30, 80])[0], d1 = (o.dist || [30, 80])[1], dur = o.dur || .7, size = o.size || 7;
  return new Promise(res=>{
    const t = g.timeline({onComplete:()=>{ host.remove(); res(); }});
    for(let i = 0; i < n; i++){
      const p = document.createElement('i'); p.className = 'fxf-p' + (glyphs ? ' is-g' : o.shape ? ' is-' + o.shape : '');
      if(glyphs){ p.textContent = glyphs[i % glyphs.length]; p.style.fontSize = Math.round((o.gsize || 16) * rnd(.7, 1.15)) + 'px'; }
      else { const s = size * rnd(.6, 1.35); p.style.width = s + 'px'; p.style.height = (o.shape === 'chip' ? s*.6 : s) + 'px'; p.style.background = cols[i % cols.length];
        if(o.glow) p.style.boxShadow = `0 0 ${Math.round(s)}px ${cols[i % cols.length]}`; }
      host.appendChild(p);
      const a = o.spread != null ? (o.angle || 0) + rnd(-.5, .5) * o.spread : (i / n) * Math.PI * 2 + rnd(-.35, .35);
      const d = rnd(d0, d1), dx = Math.cos(a) * d, dy = Math.sin(a) * d;
      g.set(p, {x, y, xPercent:-50, yPercent:-50, scale:o.from != null ? o.from : .3, opacity:1, rotation:o.spin ? rnd(-90, 90) : 0});
      const at = (o.stagger || 0) * i + rnd(0, .05), dd = dur * rnd(.75, 1.05);
      if(o.gravity){ // up and out, then fall
        t.to(p, {x:x + dx, duration:dd, ease:'power1.out'}, at)
         .to(p, {y:y + dy*.7 - rnd(10, 30), duration:dd*.42, ease:'power2.out'}, at)
         .to(p, {y:y + dy*.7 + o.gravity, duration:dd*.58, ease:'power2.in'}, at + dd*.42);
      } else t.to(p, {x:x + dx, y:y + dy, duration:dd, ease:o.ease || 'power2.out'}, at);
      t.to(p, {scale:o.to != null ? o.to : rnd(.7, 1.15), rotation:o.spin ? '+=' + rnd(-o.spin, o.spin) : 0, duration:dd, ease:'power1.out'}, at)
       .to(p, {opacity:0, duration:dd*.45, ease:'power1.in'}, at + dd*.55);
    }
  });
}
// A shock ring.
function ring(x, y, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const s = o.size || 80, host = lay('fxf-ringhost', '', 3000), r = document.createElement('i'); r.className = 'fxf-ring'; host.appendChild(r);
  r.style.width = r.style.height = s + 'px'; r.style.borderColor = o.color || '#ffd56e'; r.style.borderWidth = (o.width || 3) + 'px'; if(o.glow !== false) r.style.boxShadow = `0 0 12px ${o.color || '#ffd56e'}`;
  g.set(r, {x:x - s/2, y:y - s/2, scale:o.from || .25, opacity:o.opacity || 1});
  return new Promise(res=> g.to(r, {scale:o.to || 1, opacity:0, duration:o.dur || .55, delay:o.delay || 0, ease:'power2.out', onComplete:()=>{ host.remove(); res(); }}));
}
// One big glyph (or text) that pops in, lingers and leaves. o.from {x,y} to slide from; o.rise to float up.
function glyph(x, y, text, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const host = lay('fxf-gh', '', 5000), el = document.createElement('div'); el.className = o.cls || 'fxf-g'; el.innerHTML = text; host.appendChild(el);
  if(o.size) el.style.fontSize = o.size + 'px';
  g.set(el, {x, y, xPercent:-50, yPercent:-50, scale:o.scale0 != null ? o.scale0 : .2, opacity:0, rotation:o.rot0 || 0});
  return new Promise(res=>{
    const t = g.timeline({delay:o.delay || 0, onComplete:()=>{ host.remove(); res(); }});
    t.to(el, {scale:1, opacity:1, rotation:o.rot || 0, duration:o.inDur || .28, ease:o.ease || 'back.out(2.4)'})
     .to(el, {y:y - (o.rise != null ? o.rise : 26), duration:o.hold || .7, ease:'power1.out'}, o.riseAt || .1)
     .to(el, {opacity:0, scale:o.scaleOut || .9, duration:.25, ease:'power1.in'}, '>-0.05');
    if(o.onTl) o.onTl(t, el);
  });
}
// 2026-10-15: a label over a pill in the top bar would rise off the screen; near the top edge it sits lower and drifts down.
const label = (x, y, text, kind, o)=>{ o = Object.assign({cls:'fxf-label' + (kind ? ' is-' + kind : ''), scale0:.5, rise:30, hold:.75}, o || {});
  if(y < 34){ y = 34 + Math.max(0, 34 - y)*.5; o.rise = -Math.abs(o.rise)*.5; }
  x = Math.max(40, Math.min(VW() - 40, x)); return glyph(x, y, text, o); };
// A light sweep across an element's box.
function sheen(el, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const r = el.getBoundingClientRect(); if(!r.width) return Promise.resolve();
  const box = lay('fxf-box-host', '', 3000), b = document.createElement('div'); b.className = 'fxf-box'; box.appendChild(b);
  Object.assign(b.style, {left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px', borderRadius:getComputedStyle(el).borderRadius || '10px'});
  const s = document.createElement('div'); s.className = 'fxf-sheen'; if(o.color) s.style.background = `linear-gradient(100deg, transparent, ${o.color} 50%, transparent)`; b.appendChild(s);
  if(o.tint){ const f = document.createElement('div'); f.className = 'fxf-flash'; f.style.background = o.tint; b.appendChild(f); g.fromTo(f, {opacity:.0}, {opacity:.55, duration:(o.dur || .6)*.35, yoyo:true, repeat:1}); }
  return new Promise(res=> g.fromTo(s, {x:-r.width*.6}, {x:r.width*1.25, duration:o.dur || .6, delay:o.delay || 0, ease:'power2.inOut', onComplete:()=>{ box.remove(); res(); }}));
}
// Squash-and-stretch pop on a real element; it is left exactly as found.
function bump(el, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve();
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform'}); res(); }})
    .to(el, {scaleX:o.sx || 1.12, scaleY:o.sy || .9, duration:.08, ease:'power1.out'})
    .to(el, {scaleX:.96, scaleY:1.08, duration:.1, ease:'power1.inOut'})
    .to(el, {scaleX:1, scaleY:1, duration:.22, ease:'elastic.out(1.1, .5)'}));
}
// Shake an element sideways (or a host) a few times.
function shake(el, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const a = o.amp || 5, n = o.n || 4;
  return new Promise(res=>{ const t = g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform'}); res(); }});
    for(let i = 0; i < n; i++) t.to(el, {x:(i % 2 ? -a : a) * (1 - i/n), y:o.y ? rnd(-o.y, o.y) : 0, rotation:o.rot ? (i % 2 ? -o.rot : o.rot) * (1 - i/n) : 0, duration:o.step || .05, ease:'sine.inOut'});
    t.to(el, {x:0, y:0, rotation:0, duration:.06}); });
}
// Glyphs that fly from A to B along an arc, one after another; the target bumps as each lands.
function flyArc(from, to, text, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const a = pt(from), b = pt(to), n = Math.max(1, Math.min(10, o.n || 3)), host = lay('fxf-fly', '', 5000);
  let landed = 0;
  return new Promise(res=>{
    for(let i = 0; i < n; i++){
      const el = document.createElement('div'); el.className = 'fxf-g'; el.textContent = Array.isArray(text) ? text[i % text.length] : text; el.style.fontSize = (o.size || 20) + 'px'; host.appendChild(el);
      const p0 = {x:a.x + rnd(-(o.jitter || 12), o.jitter || 12), y:a.y + rnd(-6, 6)}, lift = o.lift != null ? o.lift : rnd(60, 110);
      const mid = {x:(p0.x + b.x)/2 + rnd(-40, 40), y:Math.min(p0.y, b.y) - lift}, s = {t:0};
      g.set(el, {x:p0.x, y:p0.y, xPercent:-50, yPercent:-50, scale:.3, opacity:0});
      const dur = o.dur || .6;
      g.timeline({delay:(o.stagger != null ? o.stagger : .08) * i + (o.delay || 0), onComplete:()=>{ el.remove(); landed++;
        if(o.onEach) call(()=> o.onEach(i));
        if(o.bump !== false && to && to.getBoundingClientRect && (i === n - 1 || o.bumpEach)) bump(to, {sx:1.1, sy:.92});
        if(landed === n){ host.remove(); if(o.ring !== false) ring(b.x, b.y, {color:o.color || '#ffd56e', size:Math.max(34, (b.w || 40)*.9), dur:.4}); finish(o, res); } }})
        .to(el, {opacity:1, scale:1, duration:.12})
        .to(s, {t:1, duration:dur, ease:'power1.inOut', onUpdate:()=>{ const u = s.t, x = (1-u)*(1-u)*p0.x + 2*(1-u)*u*mid.x + u*u*b.x, y = (1-u)*(1-u)*p0.y + 2*(1-u)*u*mid.y + u*u*b.y; g.set(el, {x, y}); }}, 0)
        .to(el, {rotation:o.spin != null ? o.spin : rnd(-160, 160), duration:dur}, 0)
        .to(el, {scale:o.endScale || .55, duration:dur*.4}, dur*.6);
    }
  });
}
// The ribbon banner: unfurls from the middle, holds, folds away. host centres it on a panel (the lab stage) instead of the window.
function banner(text, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const c = o.at || hostPt(o.host), y = o.y != null ? o.y : c.y + (o.dy || 0);
  const host = lay('fxf-bnhost', '', 7000), el = document.createElement('div'); el.className = 'fxf-bn t-' + (o.theme || 'gold');
  el.innerHTML = `<i class="fxf-bn-tail l"></i><div class="fxf-bn-band">${o.icon ? `<span class="fxf-bn-ico">${o.icon}</span>` : ''}<span class="fxf-bn-txt"><span>${text}</span>${o.sub ? `<small>${o.sub}</small>` : ''}</span>${o.icon2 ? `<span class="fxf-bn-ico">${o.icon2}</span>` : ''}</div><i class="fxf-bn-tail r"></i>`;
  host.appendChild(el);
  if(o.scale) el.style.fontSize = o.scale;
  const band = el.querySelector('.fxf-bn-band'), tails = el.querySelectorAll('.fxf-bn-tail'), txt = el.querySelector('.fxf-bn-txt'), icos = el.querySelectorAll('.fxf-bn-ico');
  g.set(el, {x:c.x, y, xPercent:-50, yPercent:-50});
  g.set(band, {scaleX:0, scaleY:.6}); g.set(tails, {opacity:0, x:(i)=> i ? -24 : 24}); g.set([txt, ...icos], {opacity:0, scale:.6});
  return new Promise(res=>{
    const t = g.timeline({onComplete:()=>{ host.remove(); finish(o, res); }});
    t.to(band, {scaleX:1, scaleY:1, duration:.32, ease:'back.out(1.6)'})
     .to(tails, {opacity:1, x:0, duration:.22, ease:'power2.out'}, .12)
     .to([txt, ...icos], {opacity:1, scale:1, duration:.3, ease:'back.out(2.6)', stagger:.04}, .18)
     .to(icos, {rotation:(i)=> i ? 14 : -14, duration:.12, yoyo:true, repeat:3, ease:'sine.inOut'}, .4)
     .to(el, {y:y - 4, duration:o.hold || .9, ease:'sine.inOut'}, .45)
     .to(el, {scaleY:0, opacity:0, duration:.24, ease:'power2.in'});
    if(o.onTl) o.onTl(t, el);
  });
}
// A rubber stamp slammed onto a point.
function stamp(x, y, text, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const host = lay('fxf-sthost', '', 5000), el = document.createElement('div'); el.className = 'fxf-stamp' + (o.color ? ' c-' + o.color : ''); el.innerHTML = text; host.appendChild(el);
  if(o.size) el.style.fontSize = o.size + 'px';
  const rot = o.rot != null ? o.rot : rnd(-12, -6);
  g.set(el, {x, y, xPercent:-50, yPercent:-50, scale:2.6, opacity:0, rotation:rot + 8, filter:'blur(2px)'});
  return new Promise(res=>{
    g.timeline({delay:o.delay || 0, onComplete:()=>{ host.remove(); finish(o, res); }})
      .to(el, {scale:1, opacity:1, rotation:rot, filter:'blur(0px)', duration:.18, ease:'power4.in'})
      .add(()=>{ ring(x, y, {color:getComputedStyle(el).color, size:Math.max(60, el.offsetWidth*1.1), dur:.45}); burst(x, y, {n:8, colors:['#d8cbb0', '#b5a68a'], dist:[24, 54], dur:.45, size:5}); call(o.onImpact); })
      .to(el, {scale:1.06, duration:.06, yoyo:true, repeat:1})
      .to(el, {opacity:0, y:y - 6, duration:.3, ease:'power1.in'}, '+=' + (o.hold != null ? o.hold : .7));
  });
}
// A screen-tint pulse (vignette) over a host or the window.
function vignette(color, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve();
  const host = lay('fxf-vighost', '', 4000), v = document.createElement('div'); v.className = 'fxf-vig'; host.appendChild(v);
  if(o.host){ const r = o.host.getBoundingClientRect(); Object.assign(v.style, {inset:'auto', position:'absolute', left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px', borderRadius:getComputedStyle(o.host).borderRadius || '0'}); } // 2026-10-15: inset first, or it wipes left/top
  v.style.background = `radial-gradient(ellipse at 50% 50%, transparent 35%, ${color} 100%)`;
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); res(); }}).fromTo(v, {opacity:0}, {opacity:o.peak || .9, duration:o.inDur || .18, ease:'power1.out'}).to(v, {opacity:0, duration:o.outDur || .7, ease:'power1.in'}, '+=' + (o.hold || .15)));
}
// Count a number inside an element (its first number) from a to b; restores the original text after.
function countRoll(el, a, b, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const orig = el.textContent, s = {v:a}, re = /-?\d[\d,]*/;
  if(!re.test(orig)) return Promise.resolve();
  return new Promise(res=> g.to(s, {v:b, duration:o.dur || .6, ease:'power1.out', onUpdate:()=>{ if(el.isConnected) el.textContent = orig.replace(re, String(Math.round(s.v))); },
    onComplete:()=>{ if(el.isConnected && o.restore !== false) el.textContent = orig; res(); }}));
}
Object.assign(M, {burst, ring, glyph, label, sheen, bump, shake, flyArc, banner, stamp, vignette, countRoll, pt});

const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

// ---------- combat: resources (2026-10-15) ----------
// One theme per resource (lore: Grace = dove light, Devilry = red star, Stone = pebbles, Metal = bolts, Uranium = green glow).
const RES = {
  lumber:  {glyph:'🪵', cols:['#b07a3e', '#d9a066', '#6b4422'], ring:'#d9a066', label:'Lumber'},
  grace:   {glyph:'🕊️', cols:['#fffbe8', '#ffe9a3', '#ffffff'], ring:'#fff3c4', label:'Grace'},
  devilry: {glyph:'⛧',  cols:['#ff3b3b', '#a3001b', '#ff8a5c'], ring:'#e0283a', label:'Devilry', txt:true},
  stone:   {glyph:'🪨', cols:['#a29f95', '#6f6d66', '#cfccc2'], ring:'#b3b0a5', label:'Stone', fall:true},
  metal:   {glyph:'🔩', cols:['#dfe7ea', '#8fa3ad', '#ffffff'], ring:'#b8cbd4', label:'Metal'},
  uranium: {glyph:'☢️', cols:['#8dff6a', '#38e01c', '#e1ffb0'], ring:'#5cff3a', label:'Uranium', glow:true},
  elemental:{glyph:'🔮', cols:['#ff6a3d', '#3da5ff', '#5ed66a', '#f2f2ff'], ring:'#d9c8ff', label:'Energy'},
};
css('res', `
.fxf .fxf-g.is-devil{font:900 30px/1 serif; color:#ff4a3d; text-shadow:0 0 10px #ff1e1e, 0 0 22px rgba(255,40,40,.6); filter:none;}
.fxf .fxf-beam{position:absolute; left:0; top:0; width:60px; border-radius:30px; background:linear-gradient(180deg, rgba(255,250,220,0) 0%, rgba(255,246,200,.85) 45%, rgba(255,255,255,.95) 85%, rgba(255,250,220,0) 100%); mix-blend-mode:screen; filter:blur(2px);}
.fxf .fxf-halo{position:absolute; left:0; top:0; border-radius:50%; background:radial-gradient(circle, var(--c, rgba(120,255,80,.75)) 0%, rgba(0,0,0,0) 68%); mix-blend-mode:screen;}
`);
// A) burst at the card: a themed ring, motes and the icon rising with "+N".
M.resourceGain = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const k = RES[opts.kind] || RES.lumber, c = pt(tileOf(el)), n = opts.amount || 1;
  const jobs = [ring(c.x, c.y, {color:k.ring, size:Math.max(60, c.w*1.1), dur:.5})];
  if(opts.kind === 'grace'){ // a soft column of light falls on the card
    const h = lay('fxf-beamhost', '', 3000), b = document.createElement('i'); b.className = 'fxf-beam'; h.appendChild(b);
    g.set(b, {x:c.x - 30, y:c.y - c.h*1.4, height:c.h*1.6, scaleY:0, transformOrigin:'50% 0%', opacity:.0});
    jobs.push(new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); res(); }}).to(b, {scaleY:1, opacity:1, duration:.25, ease:'power2.out'}).to(b, {opacity:0, duration:.5}, '+=.2')));
  }
  if(k.glow){ // uranium: a sick green halo throbs twice
    const h = lay('fxf-halohost', '', 3000), b = document.createElement('i'); b.className = 'fxf-halo'; h.appendChild(b); const s = Math.max(c.w, c.h)*1.7;
    g.set(b, {x:c.x - s/2, y:c.y - s/2, width:s, height:s, scale:.5, opacity:0});
    jobs.push(new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); res(); }}).to(b, {scale:1, opacity:.9, duration:.22}).to(b, {opacity:.35, duration:.18}).to(b, {opacity:.85, duration:.18}).to(b, {opacity:0, scale:1.15, duration:.4})));
  }
  jobs.push(burst(c.x, c.y, k.fall ? {n:10, colors:k.cols, dist:[20, 60], dur:.75, size:8, shape:'chip', gravity:46, spin:200}
    : opts.kind === 'metal' ? {n:12, colors:k.cols, dist:[26, 70], dur:.45, size:4, glow:true, shape:'chip'}
    : {n:12, colors:k.cols, dist:[24, 66], dur:.6, size:6, glow:opts.kind !== 'lumber'}));
  jobs.push(glyph(c.x, c.y - c.h*.15, k.txt ? k.glyph : k.glyph, {size:30, cls:k.txt ? 'fxf-g is-devil' : 'fxf-g', rise:34, hold:.6, rot:opts.kind === 'devilry' ? 180 : 0, rot0:opts.kind === 'devilry' ? -90 : 0}));
  jobs.push(label(c.x, c.y - c.h*.42, `+${n}`, opts.kind === 'devilry' ? 'bad' : 'gold', {delay:.08}));
  return Promise.all(jobs).then(()=> call(opts.onDone));
};
// B) the icons arc from the card into the side's resource pill, which bumps as they land.
M.resourceGain_B = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const k = RES[opts.kind] || RES.lumber, c = pt(tileOf(el)), to = opts.pill || null;
  burst(c.x, c.y, {n:8, colors:k.cols, dist:[14, 36], dur:.4, size:5, glow:true});
  if(!to || !alive(to)) return M.resourceGain(el, opts);
  return flyArc(tileOf(el), to, k.glyph, {n:Math.max(1, Math.min(4, opts.amount || 2)), color:k.ring, size:22, dur:.55, spin:opts.kind === 'stone' ? 260 : rnd(-60, 60)})
    .then(()=>{ const p = pt(to); label(p.x, p.y - p.h, `+${opts.amount || 1}`, 'gold', {size:15}); call(opts.onDone); });
};
// C) the icons orbit the card once and fold into it with a flash.
M.resourceGain_C = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const k = RES[opts.kind] || RES.lumber, c = pt(tileOf(el)), host = lay('fxf-orbit', '', 4000), R = Math.max(c.w, c.h)*.62, n = 4;
  const els = Array.from({length:n}, (_, i)=>{ const e = document.createElement('div'); e.className = k.txt ? 'fxf-g is-devil' : 'fxf-g'; e.textContent = k.glyph; e.style.fontSize = '20px'; host.appendChild(e); return e; });
  const s = {a:0, r:R};
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); ring(c.x, c.y, {color:k.ring, size:c.w*1.2}); burst(c.x, c.y, {n:10, colors:k.cols, dist:[20, 50], dur:.45, glow:true});
      label(c.x, c.y - c.h*.4, `+${opts.amount || 1}`, 'gold'); later(()=> finish(opts, res), 500); }})
    .fromTo(els, {opacity:0, scale:.3}, {opacity:1, scale:1, duration:.15})
    .to(s, {a:Math.PI*2, duration:.7, ease:'power1.inOut', onUpdate:()=> els.forEach((e, i)=>{ const a = s.a + i/n*Math.PI*2; g.set(e, {x:c.x + Math.cos(a)*s.r, y:c.y + Math.sin(a)*s.r*.8, xPercent:-50, yPercent:-50}); })}, 0)
    .to(s, {r:4, duration:.25, ease:'power2.in'}, .55)
    .to(els, {scale:.4, opacity:0, duration:.15}, .7));
};
// Echo 🕯️ gained (a card went to the Removal Zone): a candle flame flickers on.
css('echo', `
.fxf .fxf-candle{position:absolute; left:0; top:0; width:16px; height:44px;}
.fxf .fxf-candle .wax{position:absolute; left:2px; bottom:0; width:12px; height:22px; border-radius:3px 3px 2px 2px; background:linear-gradient(90deg, #e9dcc0, #fff6e2 45%, #d8c7a2); box-shadow:0 2px 4px rgba(0,0,0,.4);}
.fxf .fxf-candle .wick{position:absolute; left:7.5px; bottom:21px; width:1.5px; height:5px; background:#3a2a1a;}
.fxf .fxf-candle .flame{position:absolute; left:3px; bottom:24px; width:10px; height:18px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;
  background:radial-gradient(ellipse at 50% 72%, #fff 0%, #ffe9a0 28%, #ffb03a 58%, rgba(255,120,30,.0) 78%); transform-origin:50% 90%; animation:fxfFlick .18s ease-in-out infinite alternate;}
.fxf .fxf-candle .glow{position:absolute; left:-22px; bottom:6px; width:60px; height:60px; border-radius:50%; background:radial-gradient(circle, rgba(255,200,110,.55), rgba(255,170,60,0) 65%);}
@keyframes fxfFlick{0%{transform:scale(1,1) rotate(-2deg);} 100%{transform:scale(.9,1.12) rotate(3deg);}}
`);
M.echoGain = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = pt(el), x = c.x + (opts.dx || 0), y = c.y - (c.h || 0)*.5 - 6;
  const host = lay('fxf-echo', '<div class="fxf-candle"><i class="glow"></i><i class="wax"></i><i class="wick"></i><i class="flame"></i></div>', 4000), cd = host.firstChild;
  const flame = cd.querySelector('.flame'), glow = cd.querySelector('.glow');
  g.set(cd, {x:x - 8, y:y - 44, opacity:0}); g.set(flame, {scale:0}); g.set(glow, {opacity:0, scale:.4});
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }})
    .to(cd, {opacity:1, y:y - 50, duration:.22, ease:'power2.out'})
    .to(flame, {scale:1.35, duration:.12, ease:'power2.out'}, .2)
    .add(()=>{ burst(x, y - 46, {n:6, colors:['#ffd27a', '#fff2c2'], dist:[8, 22], dur:.4, size:3, glow:true}); label(x + 20, y - 54, '+1 🕯️', 'gold', {size:14, rise:18}); }, .22)
    .to(flame, {scale:1, duration:.2}, .32)
    .to(glow, {opacity:1, scale:1, duration:.3}, .22)
    .to(glow, {opacity:.55, duration:.12, yoyo:true, repeat:3}, .55)
    .to(cd, {opacity:0, y:y - 60, duration:.35, ease:'power1.in'}, 1.05));
};
// Elemental Energy: four element motes spiral in and fuse into a prismatic spark.
M.elementalEnergy = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(tileOf(el)), host = lay('fxf-elem', '', 4000), cols = RES.elemental.cols, R = Math.max(c.w, c.h)*.75, s = {a:0, r:R};
  const motes = cols.map(col=>{ const m = document.createElement('i'); m.className = 'fxf-p'; Object.assign(m.style, {width:'12px', height:'12px', background:col, boxShadow:`0 0 12px 3px ${col}`}); host.appendChild(m); return m; });
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }})
    .fromTo(motes, {opacity:0}, {opacity:1, duration:.12})
    .to(s, {a:Math.PI*2.2, r:2, duration:.75, ease:'power2.in', onUpdate:()=> motes.forEach((m, i)=>{ const a = s.a + i/4*Math.PI*2; g.set(m, {x:c.x + Math.cos(a)*s.r, y:c.y + Math.sin(a)*s.r*.85, xPercent:-50, yPercent:-50}); })}, 0)
    .add(()=>{ ring(c.x, c.y, {color:'#ffffff', size:c.w*1.3, dur:.45}); burst(c.x, c.y, {n:16, colors:['#ff6a3d', '#ffd23d', '#5ed66a', '#3da5ff', '#b46bff', '#ffffff'], dist:[24, 70], dur:.6, shape:'star', size:9, glow:true});
      label(c.x, c.y - c.h*.4, `+${opts.amount || 1} 🔮`, 'gold'); }, .72)
    .to(motes, {opacity:0, duration:.1}, .74).to({}, {duration:.55}));
};
// Refine (ore into something better): a little hammer strikes, sparks fly and a glowing ingot rises.
css('refine', `.fxf .fxf-ingot{position:absolute; left:0; top:0; width:30px; height:12px; border-radius:3px; background:linear-gradient(180deg, #fff3b0, #ffb340 55%, #c46a12); box-shadow:0 0 12px rgba(255,170,60,.9); transform:skewX(-12deg);}`);
M.refine = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(tileOf(el)), host = lay('fxf-refine', '<div class="fxf-g" style="font-size:30px">🔨</div><i class="fxf-ingot"></i>', 4000), hm = host.children[0], ing = host.children[1];
  const hx = c.x + c.w*.32, hy = c.y - c.h*.28;
  g.set(hm, {x:hx, y:hy, xPercent:-20, yPercent:-80, rotation:-70, opacity:0, transformOrigin:'80% 90%'}); g.set(ing, {x:c.x - 15, y:c.y - 6, scale:0, opacity:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }})
    .to(hm, {opacity:1, rotation:-95, duration:.15})
    .to(hm, {rotation:12, duration:.1, ease:'power4.in'})
    .add(()=>{ burst(c.x + c.w*.2, c.y - c.h*.1, {n:14, colors:['#fff1a8', '#ffb340', '#ff7a1a'], dist:[20, 70], dur:.45, size:4, glow:true, shape:'chip', spread:Math.PI*1.1, angle:-Math.PI/2});
      ring(c.x + c.w*.2, c.y - c.h*.1, {color:'#ffb340', size:50, dur:.35}); bump(tileOf(el), {sx:1.06, sy:.94}); })
    .to(hm, {rotation:-40, opacity:0, duration:.25}, '+=.05')
    .to(ing, {scale:1, opacity:1, duration:.2, ease:'back.out(2)'}, '-=.2')
    .to(ing, {y:c.y - c.h*.55, duration:.55, ease:'power1.out'})
    .to(ing, {opacity:0, duration:.2}, '-=.15'));
};
// Midas Touch: the dying card gilds over and showers gold flecks (that fly to the killer's pill when given).
M.midas = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const t = el ? tileOf(el) : null, c = pt(t || opts.at);
  const jobs = [];
  if(t && alive(t)) jobs.push(sheen(t, {color:'rgba(255,214,90,.95)', tint:'rgba(255,200,60,.45)', dur:.55}));
  jobs.push(burst(c.x, c.y, {n:18, colors:['#ffe27a', '#ffc93c', '#fff6c8', '#d99a1e'], dist:[30, 90], dur:.8, size:6, shape:'shard', spin:300, gravity:30, glow:true}));
  jobs.push(label(c.x, c.y - (c.h || 60)*.45, `+${opts.amount || 1} 🪵 Midas`, 'gold'));
  if(opts.pill && alive(opts.pill)) jobs.push(wait(250).then(()=> flyArc(c, opts.pill, '✦', {n:4, color:'#ffd56e', size:18, dur:.5})));
  return Promise.all(jobs).then(()=> call(opts.onDone));
};
// Resource passives (Lumberjack, Timber, Heavy Metal, Rock-solid, Iron-will): a little badge shows the bonus kick in.
const PASSIVE = {lumberjack:{ico:'🪓', col:'#d9a066', txt:'+1 🪵'}, timber:{ico:'🪵', col:'#c08a48', txt:'Timber'}, heavyMetal:{ico:'🔩', col:'#b8cbd4', txt:'+1 ore'},
  rockSolid:{ico:'🪨', col:'#b3b0a5', txt:'Rock-solid'}, ironWill:{ico:'🛡️', col:'#9fb8c4', txt:'Iron-will'}};
M.resourcePassive = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const p = PASSIVE[opts.kind] || PASSIVE.lumberjack, t = tileOf(el), c = pt(t);
  const jobs = [];
  if(opts.kind === 'lumberjack'){ // the axe chops across the bottom of the card, chips fly
    const host = lay('fxf-axe', '<div class="fxf-g" style="font-size:26px">🪓</div>', 3000), ax = host.firstChild;
    g.set(ax, {x:c.x - c.w*.6, y:c.y + c.h*.25, xPercent:-50, yPercent:-50, rotation:-50, opacity:0});
    jobs.push(new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); res(); }}).to(ax, {opacity:1, duration:.08}).to(ax, {x:c.x, rotation:30, duration:.18, ease:'power3.in'})
      .add(()=> burst(c.x, c.y + c.h*.25, {n:9, colors:['#d9a066', '#8a5a2c', '#f1c98f'], dist:[16, 44], dur:.5, size:6, shape:'chip', spin:240, gravity:24})).to(ax, {opacity:0, x:c.x + c.w*.3, duration:.2})));
  } else { // the stats glow: an outline flash and the badge pops over the stat line
    const host = lay('fxf-pass', '', 3000), r = c.r || {left:c.x - c.w/2, top:c.y - c.h/2, width:c.w, height:c.h}, b = document.createElement('i'); host.appendChild(b);
    Object.assign(b.style, {position:'absolute', left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px', borderRadius:'12px', boxShadow:`0 0 0 3px ${p.col}, 0 0 18px 4px ${p.col}`});
    jobs.push(new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); res(); }}).fromTo(b, {opacity:0}, {opacity:1, duration:.12}).to(b, {opacity:.3, duration:.15}).to(b, {opacity:.9, duration:.15}).to(b, {opacity:0, duration:.35})));
  }
  jobs.push(glyph(c.x + c.w*.32, c.y + c.h*.3, p.ico, {size:20, rise:14, hold:.5}));
  jobs.push(label(c.x, c.y + c.h*.1, p.txt, 'gold', {size:13, delay:.1}));
  return Promise.all(jobs).then(()=> call(opts.onDone));
};

// ---------- UI feedback (2026-10-15) ----------
const KIND_COL = {ok:'#5bd16b', warn:'#f0b43c', error:'#ef5a4c', info:'#7cc0ff', '':'#e9cf8a'};
// Toast, B: a glint runs across it, its kind colour draws an underline and a pinch of sparkles pops at its start.
M.toastGlint = function(t, opts){
  opts = opts || {}; const g = G(); if(!g || !t) return Promise.resolve();
  const col = KIND_COL[opts.kind || ''] || KIND_COL[''];
  return wait(opts.delay != null ? opts.delay : 260).then(()=>{
    if(!alive(t)) return;
    const r = t.getBoundingClientRect(), host = lay('fxf-toast', '<i></i>', 3000), u = host.firstChild;
    Object.assign(u.style, {position:'absolute', left:(r.left + 12) + 'px', top:(r.bottom - 5) + 'px', width:(r.width - 24) + 'px', height:'3px', borderRadius:'3px', background:col, boxShadow:`0 0 8px ${col}`, transformOrigin:'0 50%'});
    burst(r.left + 14, r.top + r.height/2, {n:7, colors:[col, '#fff8e0'], dist:[10, 28], dur:.45, size:4, shape:'star', glow:true});
    sheen(t, {dur:.65});
    return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }}).fromTo(u, {scaleX:0, opacity:1}, {scaleX:1, duration:.4, ease:'power2.out'}).to(u, {opacity:0, duration:.5}, '+=.7'));
  });
};
// Toast, C: a little kind-coloured ribbon tab drops from its corner and swings.
M.toastGlint_C = function(t, opts){
  opts = opts || {}; const g = G(); if(!g || !t) return Promise.resolve();
  const col = KIND_COL[opts.kind || ''] || KIND_COL[''], ico = {ok:'✔', warn:'!', error:'✕'}[opts.kind] || '★';
  return wait(260).then(()=>{
    if(!alive(t)) return;
    const r = t.getBoundingClientRect(), host = lay('fxf-toastc', `<b>${ico}</b>`, 3000), b = host.firstChild;
    Object.assign(b.style, {position:'absolute', left:'0', top:'0', width:'22px', height:'28px', display:'grid', placeItems:'center', color:'#1d1a12', font:"900 13px/1 'Baloo 2',sans-serif",
      background:col, clipPath:'polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)', boxShadow:'0 2px 4px rgba(0,0,0,.4)', transformOrigin:'50% 0'});
    g.set(b, {x:r.left + 10, y:r.top - 4, scaleY:0});
    return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }})
      .to(b, {scaleY:1, duration:.22, ease:'back.out(2.5)'}).to(b, {rotation:10, duration:.14, yoyo:true, repeat:3, ease:'sine.inOut'}).to(b, {opacity:0, duration:.4}, '+=1.2'));
  });
};
// Card hover pop-over: it rises in from the card with a quick light sweep.
M.cardPopIn = function(pop, opts){
  opts = opts || {}; const g = G(); if(!g || !pop) return Promise.resolve();
  const tile = pop.querySelector('.card-tile') || pop;
  g.fromTo(pop, {opacity:0, scale:.94, y:8, transformOrigin:'50% 100%'}, {opacity:1, scale:1, y:0, duration:.2, ease:'back.out(2.2)', clearProps:'transform,opacity'});
  return wait(120).then(()=> sheen(tile, {dur:.5})).then(()=> call(opts.onDone));
};
// Card added to a deck, A: it snaps into its slot with a squash and a puff of green leaves.
M.deckAdd = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  return Promise.all([bump(el, {sx:1.14, sy:.86}), burst(c.x, c.y, {n:8, glyphs:['🍃', '🌿'], gsize:13, dist:[18, 46], dur:.55, spin:220}),
    label(c.x + c.w*.3, c.y - c.h*.3, '+1', 'good', {size:15, rise:18, hold:.45})]).then(()=> call(opts.onDone));
};
// B: a gold ring glows round the slot and the count pops.
M.deckAdd_B = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const r = el.getBoundingClientRect(), host = lay('fxf-slot', '<i></i>', 3000), b = host.firstChild;
  Object.assign(b.style, {position:'absolute', left:(r.left - 3) + 'px', top:(r.top - 3) + 'px', width:(r.width + 6) + 'px', height:(r.height + 6) + 'px', borderRadius:'12px', boxShadow:'0 0 0 2px #ffd56e, 0 0 16px 4px rgba(255,200,80,.7)'});
  const c = pt(el);
  burst(c.x, c.y, {n:10, colors:['#ffd56e', '#fff3c4'], dist:[r.width*.4, r.width*.75], dur:.5, size:4, shape:'star', glow:true});
  return new Promise(res=> g.timeline({onComplete:()=>{ host.remove(); finish(opts, res); }}).fromTo(b, {opacity:0, scale:1.15}, {opacity:1, scale:1, duration:.2, ease:'back.out(2)'}).to(b, {opacity:0, duration:.45}, '+=.25'));
};
// Card removed from a deck: a puff of dust, a little shrink and "-1".
M.deckRemove = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el);
  burst(c.x, c.y, {n:9, colors:['#cfc6b4', '#a89f8c', '#e9e2d2'], dist:[16, 42], dur:.55, size:9, from:.5, to:1.4});
  label(c.x + c.w*.3, c.y - c.h*.3, '−1', 'bad', {size:15, rise:16, hold:.4});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform,opacity'}); finish(opts, res); }}).to(el, {scale:.9, opacity:.7, duration:.1}).to(el, {scale:1, opacity:1, duration:.3, ease:'back.out(2)'}));
};
// Deck full / copy limit: a padlock slams onto the card and the chain rattles.
M.deckFull = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  ring(c.x, c.y, {color:'#ef5a4c', size:Math.max(56, c.w*.9), dur:.45, delay:.14});
  burst(c.x, c.y, {n:4, glyphs:['⛓️'], gsize:14, dist:[22, 44], dur:.5, spin:200, gravity:18});
  return Promise.all([glyph(c.x, c.y, '🔒', {size:34, scale0:2.4, rise:0, hold:.55, inDur:.18, ease:'power4.in', rot0:-25, rot:0}),
    label(c.x, c.y - c.h*.45, opts.text || 'Full', 'bad', {size:14, delay:.15, rise:16})]).then(()=> call(opts.onDone));
};
// Deck hero banner / leader showcase: a golden light sweep, a crown glint and motes rising.
M.deckHeroBanner = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), r = c.r || {left:c.x - c.w/2, top:c.y - c.h/2, width:c.w, height:c.h};
  burst(r.left + 18, r.top + 14, {n:8, colors:['#fff6c8', '#ffd56e'], dist:[8, 26], dur:.5, size:5, shape:'star', glow:true});
  for(let i = 0; i < 9; i++){ const x = r.left + r.width*rnd(.1, .9); burst(x, r.top + r.height*rnd(.6, .95), {n:1, colors:['#ffd56e'], dist:[30, 60], spread:.3, angle:-Math.PI/2, dur:.9, size:4, glow:true}); }
  return Promise.all([sheen(el, {color:'rgba(255,226,140,.85)', dur:.8}), glyph(r.left + 22, r.top + 16, '👑', {size:18, rise:6, hold:.6, rot0:-30})]).then(()=> call(opts.onDone));
};
// Codex: a newly seen card: a little book flaps open over it and a sparkle ring says "Codex +1".
M.codexNew = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el);
  ring(c.x, c.y, {color:'#9fd6f5', size:Math.max(60, c.w*1.1), dur:.5});
  burst(c.x, c.y - c.h*.3, {n:8, colors:['#cfeaff', '#ffffff', '#9fd6f5'], dist:[16, 40], dur:.5, size:4, shape:'star', glow:true});
  return Promise.all([glyph(c.x, c.y - c.h*.32, '📖', {size:26, rise:16, hold:.65, onTl:(t, e)=> t.to(e, {scaleX:-1, duration:.12, yoyo:true, repeat:3}, .25)}),
    label(c.x, c.y + c.h*.05, 'Codex +1', 'good', {size:13, delay:.12, rise:14})]).then(()=> call(opts.onDone));
};
// A hidden skill ("?") is revealed for the first time: the "?" cracks open and the skill pops out with rays.
css('reveal', `
.fxf .fxf-q{position:absolute; left:0; top:0; width:64px; height:64px; border-radius:50%; display:grid; place-items:center; font:900 40px/1 'Baloo 2',sans-serif; color:#fff8e0;
  background:radial-gradient(circle at 35% 30%, #6a5a8e, #2d2347); box-shadow:0 0 0 3px #c9b6ff, 0 6px 18px rgba(0,0,0,.5);}
.fxf .fxf-rays{position:absolute; left:0; top:0; border-radius:50%; background:repeating-conic-gradient(from 0deg, rgba(255,236,170,.55) 0deg 8deg, transparent 8deg 22deg);
  -webkit-mask:radial-gradient(closest-side, #000 25%, transparent 72%); mask:radial-gradient(closest-side, #000 25%, transparent 72%);}
`);
M.skillReveal = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = opts.at || (host ? pt(host) : {x:VW()/2, y:VH()*.3}), name = esc(opts.name || 'New skill'), ico = opts.icon || '✨';
  const h = lay('fxf-reveal', '<i class="fxf-rays"></i><div class="fxf-q l">?</div><div class="fxf-q r">?</div>', 5000);
  const rays = h.children[0], L = h.children[1], Rt = h.children[2], S = 64;
  L.style.clipPath = 'polygon(0 0, 52% 0, 44% 35%, 56% 60%, 46% 100%, 0 100%)'; Rt.style.clipPath = 'polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 56% 60%, 44% 35%)';
  g.set([L, Rt], {x:c.x - S/2, y:c.y - S/2, scale:0}); g.set(rays, {x:c.x - 110, y:c.y - 110, width:220, height:220, opacity:0, scale:.4});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to([L, Rt], {scale:1, duration:.3, ease:'back.out(2.4)'})
    .to([L, Rt], {rotation:(i)=> i ? 6 : -6, duration:.06, yoyo:true, repeat:5}, '+=.1')
    .add(()=>{ ring(c.x, c.y, {color:'#c9b6ff', size:120, dur:.5}); burst(c.x, c.y, {n:14, colors:['#c9b6ff', '#fff3c4', '#ffffff'], dist:[30, 90], dur:.6, shape:'star', size:8, glow:true}); })
    .to(L, {x:'-=46', rotation:-40, opacity:0, duration:.4, ease:'power2.out'}).to(Rt, {x:'+=46', rotation:40, opacity:0, duration:.4, ease:'power2.out'}, '<')
    .to(rays, {opacity:1, scale:1, rotation:40, duration:.6, ease:'power2.out'}, '<')
    .add(()=>{ glyph(c.x, c.y, ico, {size:46, rise:4, hold:.9}); banner(name, {at:{x:c.x, y:c.y + 70}, theme:'violet', sub:opts.sub || 'Skill revealed', hold:.8, scale:'clamp(16px,4vw,24px)'}); }, '<')
    .to(rays, {opacity:0, rotation:80, duration:.6}, '+=.8'));
};
// Avatar / title unlocked: a golden frame spins round it, confetti and a little "Unlocked!" ribbon.
M.avatarUnlock = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), S = Math.max(c.w, c.h) + 26, h = lay('fxf-av', '<i></i>', 4000), rg = h.firstChild;
  Object.assign(rg.style, {position:'absolute', width:S + 'px', height:S + 'px', borderRadius:'50%', border:'3px dashed #ffd56e', boxShadow:'0 0 14px rgba(255,214,110,.7)'});
  g.set(rg, {x:c.x - S/2, y:c.y - S/2, scale:.5, opacity:0});
  burst(c.x, c.y, {n:14, colors:['#ff6b9a', '#ffd56e', '#7ad7ff', '#8fe07a', '#b46bff'], dist:[S*.5, S*1.1], dur:.8, size:7, shape:'chip', spin:360, gravity:30});
  label(c.x, c.y - S*.62, opts.text || 'Unlocked!', 'gold', {size:15});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).to(rg, {scale:1, opacity:1, duration:.3, ease:'back.out(2)'}).to(rg, {rotation:180, duration:1, ease:'power1.inOut'}, 0).to(rg, {opacity:0, scale:1.15, duration:.3}, .9));
};
// Cloud sync pill: synced = little clouds drift off and a tick pops; offline = a grey cloud rains a few drops.
M.cloudSync = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), x = c.x + c.w*.5 + 6;
  if(opts.ok === false){
    return Promise.all([glyph(x, c.y - 4, '🌧️', {size:20, rise:4, hold:.8}), burst(x, c.y + 6, {n:5, colors:['#7cc0ff', '#a8d6ff'], dist:[10, 22], spread:.6, angle:Math.PI/2, dur:.6, size:4, shape:'chip', gravity:20})]).then(()=> call(opts.onDone));
  }
  for(let i = 0; i < 3; i++) glyph(c.x - c.w*.2 + i*12, c.y, '☁️', {size:14, rise:20 + i*6, hold:.7, delay:i*.1, scale0:.4});
  return Promise.all([glyph(x, c.y, '✔️', {size:16, rise:10, hold:.6, delay:.2}), sheen(el, {dur:.5, delay:.1})]).then(()=> call(opts.onDone));
};
// Sign-in / invite / version banners: the strip flaps down into place and a light runs along it.
M.bannerIn = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  // 2026-10-15: the banners slide in with their own CSS transform (and transition), so this never touches `transform`: once
  // the slide is done it flaps the strip with the independent `scale` property, pops a few sparkles and runs a light along it.
  return wait(opts.delay != null ? opts.delay : 360).then(()=>{
    if(!alive(el)) return;
    const c = pt(el), o0 = el.style.transformOrigin; el.style.transformOrigin = '50% 0%';
    try{ const a = el.animate([{scale:'1 .55'}, {scale:'1 1.06', offset:.55}, {scale:'1 .98', offset:.8}, {scale:'1 1'}], {duration:480, easing:'ease-out'});
      a.onfinish = a.oncancel = ()=>{ el.style.transformOrigin = o0; }; }catch(e){ el.style.transformOrigin = o0; }
    burst(c.x - c.w*.45, c.y, {n:6, colors:['#fff3c4', '#ffd56e'], dist:[8, 24], dur:.45, size:4, shape:'star', glow:true});
    burst(c.x + c.w*.45, c.y, {n:6, colors:['#fff3c4', '#ffd56e'], dist:[8, 24], dur:.45, size:4, shape:'star', glow:true});
    return wait(180).then(()=> sheen(el, {dur:.7}));
  }).then(()=> call(opts.onDone));
};
// Future: emoji / icon set swap. The same icon flips through four looks (simulated with filters; the real sets are fonts).
M.emojiSetSwap = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = hostPt(host), h = lay('fxf-emoji', '<div class="fxf-g" style="font-size:64px">🦦</div><div class="fxf-label is-gold" style="font-size:15px"></div>', 6000), ic = h.children[0], lb = h.children[1];
  const sets = [['Twemoji', 'saturate(1.5) contrast(1.1)'], ['OpenMoji', 'grayscale(.6) contrast(1.6) drop-shadow(0 0 0 #000) drop-shadow(1px 1px 0 #000)'], ['Noto', 'drop-shadow(0 6px 4px rgba(0,0,0,.5)) saturate(1.2)'], ['Fluent', 'drop-shadow(0 3px 10px rgba(120,160,255,.7)) brightness(1.1)']];
  g.set(ic, {x:c.x, y:c.y - 10, xPercent:-50, yPercent:-50}); g.set(lb, {x:c.x, y:c.y + 50, xPercent:-50, yPercent:-50});
  const t = g.timeline({onComplete:()=>{ h.remove(); call(opts.onDone); }});
  sets.forEach(([n, f], i)=>{ t.to(ic, {rotationY:90, duration:.16, ease:'power1.in'}).add(()=>{ ic.style.filter = f; lb.textContent = n; }).to(ic, {rotationY:0, duration:.2, ease:'back.out(2)'}).to({}, {duration:.42}); });
  t.to([ic, lb], {opacity:0, duration:.25});
  return new Promise(res=> t.eventCallback('onComplete', ()=>{ h.remove(); finish(opts, res); }));
};

// ---------- meta-progression (2026-10-15) ----------
// A castle won (pack or map): it tumbles down, lands in a puff of stone dust and its flag pops up.
M.castleDrop = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), y = c.y - (el ? c.h*.1 : 0), h = lay('fxf-castle', '<div class="fxf-g" style="font-size:44px">🏰</div><div class="fxf-g" style="font-size:18px">🚩</div>', 5000);
  const cs = h.children[0], fl = h.children[1];
  g.set(cs, {x:c.x, y:y - 160, xPercent:-50, yPercent:-100, rotation:-25, opacity:0, transformOrigin:'50% 100%'}); g.set(fl, {x:c.x + 6, y:y - 40, xPercent:-50, yPercent:-100, scale:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(cs, {opacity:1, duration:.1})
    .to(cs, {y, rotation:0, duration:.42, ease:'power3.in'}, 0)
    .add(()=>{ burst(c.x, y, {n:12, colors:['#b9b6ab', '#8d8a80', '#d8d4c8'], dist:[20, 64], spread:Math.PI, angle:-Math.PI/2, dur:.6, size:8, gravity:20, shape:'chip', spin:200});
      ring(c.x, y - 6, {color:'#d8d4c8', size:90, dur:.45, glow:false}); })
    .to(cs, {scaleY:.78, scaleX:1.14, duration:.07}).to(cs, {scaleY:1, scaleX:1, duration:.35, ease:'elastic.out(1.2, .4)'})
    .to(fl, {scale:1, duration:.25, ease:'back.out(3)'}, '-=.25').to(fl, {rotation:12, duration:.15, yoyo:true, repeat:3}, '<')
    .add(()=> label(c.x, y - 70, opts.text || 'New castle!', 'gold'), '<')
    .to([cs, fl], {opacity:0, y:'-=8', duration:.3}, '+=.6'));
};
// Hero skill picked: the skill badge stamps onto the hero.
M.heroSkillPick = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  burst(c.x, c.y, {n:10, colors:['#ffd56e', '#fff6c8', '#b46bff'], dist:[30, 70], dur:.55, shape:'star', size:9, glow:true, stagger:.01});
  sheen(el, {dur:.6, delay:.2});
  return stamp(c.x, c.y, opts.text || 'Learned!', {color:'gold', size:22, hold:.6}).then(()=> call(opts.onDone));
};
// A hero stat point spent: a gold point flies into the stat, which pops with "+1".
M.heroStatSpend = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), from = opts.from && alive(opts.from) ? opts.from : {x:c.x - 60, y:c.y + 40};
  return flyArc(from, el, '●', {n:1, size:14, color:'#ffd56e', dur:.42, lift:40, spin:0}).then(()=>{
    burst(c.x, c.y, {n:6, colors:['#ffd56e', '#fff6c8'], dist:[10, 26], dur:.4, size:4, glow:true});
    return label(c.x + c.w*.4, c.y - 6, opts.text || '+1', 'gold', {size:14, rise:16, hold:.4});
  }).then(()=> call(opts.onDone));
};
// An egg set in a hay nest: it drops in, squashes, wobbles itself comfortable; straw puffs out.
M.nestEggPlace = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), thing = el.querySelector && el.querySelector('.nest-thing');
  const h = lay('fxf-egg', `<div class="fxf-g" style="font-size:30px">${esc(opts.icon || '🥚')}</div>`, 4000), egg = h.firstChild, y = c.y - c.h*.08;
  if(thing) g.set(thing, {opacity:0});
  g.set(egg, {x:c.x, y:y - 120, xPercent:-50, yPercent:-50, opacity:0, transformOrigin:'50% 90%'});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); if(thing) g.set(thing, {clearProps:'opacity'}); finish(opts, res); }})
    .to(egg, {opacity:1, duration:.08}).to(egg, {y, duration:.36, ease:'power2.in'}, 0)
    .add(()=> burst(c.x, y + 10, {n:10, colors:['#e8c46a', '#c99a3c', '#f6e2a0'], dist:[14, 40], spread:Math.PI*.9, angle:-Math.PI/2, dur:.55, size:7, shape:'chip', spin:240, gravity:16}))
    .to(egg, {scaleY:.75, scaleX:1.2, duration:.07}).to(egg, {scaleY:1, scaleX:1, duration:.2, ease:'back.out(3)'})
    .to(egg, {rotation:14, duration:.12}).to(egg, {rotation:-10, duration:.14}).to(egg, {rotation:6, duration:.14}).to(egg, {rotation:0, duration:.14}));
};
// Train a Level-0 card with Kibble: kibble arcs in, crunch crumbs, a little green growth sparkle.
M.nestKibble = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  return flyArc({x:c.x - 90, y:c.y - 60}, el, '🦴', {n:Math.min(4, opts.kibble || 3), size:16, dur:.42, lift:50, stagger:.1, color:'#e8c46a',
    onEach:()=> burst(c.x, c.y, {n:5, colors:['#b07a3e', '#7a5226', '#e2b878'], dist:[8, 24], dur:.4, size:4, shape:'chip', gravity:12})}).then(()=>{
    burst(c.x, c.y - c.h*.2, {n:10, colors:['#8fe07a', '#d9ffb8', '#ffffff'], dist:[16, 44], dur:.6, shape:'star', size:7, glow:true});
    glyph(c.x, c.y - c.h*.3, '🌱', {size:22, rise:22, hold:.6});
    return label(c.x, c.y - c.h*.6, opts.text || 'Training!', 'good', {size:14});
  }).then(()=> call(opts.onDone));
};
// An egg found after a win: a little chest pops open and the egg tumbles out onto the reward.
M.nestEggDrop = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), h = lay('fxf-eggdrop', '<div class="fxf-g" style="font-size:30px">🧰</div><div class="fxf-g" style="font-size:24px">' + esc(opts.icon || '🥚') + '</div>', 5000), ch = h.children[0], egg = h.children[1];
  const cx = c.x - 56, cy = c.y - 44;
  g.set(ch, {x:cx, y:cy, xPercent:-50, yPercent:-50, scale:0}); g.set(egg, {x:cx, y:cy, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
  const s = {t:0};
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(ch, {scale:1, duration:.25, ease:'back.out(2.5)'})
    .to(ch, {y:cy - 8, scaleY:1.15, duration:.1, yoyo:true, repeat:1}, '+=.1')
    .add(()=> burst(cx, cy - 10, {n:8, colors:['#ffe27a', '#fff6c8'], dist:[10, 28], dur:.45, size:4, shape:'star', glow:true}))
    .to(egg, {opacity:1, scale:1, duration:.12}, '<')
    .to(s, {t:1, duration:.5, ease:'power1.in', onUpdate:()=>{ const u = s.t; g.set(egg, {x:cx + (c.x - cx)*u, y:cy - 50*Math.sin(Math.PI*u) + (c.y - cy)*u}); }}, '<')
    .to(egg, {rotation:360, duration:.5}, '<')
    .add(()=>{ ring(c.x, c.y, {color:'#fff3c4', size:Math.max(50, c.h*1.2), dur:.4}); bump(el); })
    .to([ch, egg], {opacity:0, duration:.3}, '+=.45'));
};
// A new item in the Inventory: it hops into its slot with a flap of the pack and the "New!" tag shines.
M.inventoryNew = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el);
  glyph(c.x - c.w*.55, c.y - c.h*.2, '🎒', {size:20, rise:6, hold:.45, rot0:-20, onTl:(t, e)=> t.to(e, {rotation:12, duration:.1, yoyo:true, repeat:3}, .2)});
  ring(c.x, c.y, {color:'#9fe0b0', size:Math.max(48, c.w*1.15), dur:.45, delay:.2});
  burst(c.x, c.y - c.h*.45, {n:8, colors:['#fff3c4', '#ffd56e'], dist:[10, 26], dur:.45, size:4, shape:'star', glow:true, stagger:.02});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform'}); finish(opts, res); }}).fromTo(el, {y:-14, scale:.85}, {y:0, scale:1, duration:.35, ease:'bounce.out'}).to({}, {duration:.4}));
};
// The wandering merchant's cart rattles in under the deal, dust behind it; the deal card shudders like it just stopped.
M.wandererDeal = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), y = c.y + c.h*.5 + 14, h = lay('fxf-cart', '<div class="fxf-g" style="font-size:28px"><span style="display:inline-block;transform:scaleX(-1)">🪲</span>🛒</div>', 5000), cart = h.firstChild;
  g.set(cart, {x:c.x - c.w*.5 - 120, y, xPercent:-50, yPercent:-50});
  const t = g.timeline({onComplete:()=>{ h.remove(); finish(opts, done); }}); let done;
  t.to(cart, {x:c.x + c.w*.18, duration:.85, ease:'power2.out'})
   .to(cart, {y:y - 3, duration:.07, yoyo:true, repeat:9, ease:'sine.inOut'}, 0);
  for(let i = 0; i < 6; i++) t.add(()=> burst(Number(g.getProperty(cart, 'x')) - 30, y + 10, {n:3, colors:['#cbb68f', '#a8936c'], dist:[6, 18], spread:1.2, angle:Math.PI, dur:.45, size:7, from:.5, to:1.5}), i*.13);
  t.add(()=>{ shake(el, {amp:3, n:4, rot:1.2}); burst(c.x + c.w*.35, c.y - c.h*.35, {n:6, glyphs:['✨'], gsize:12, dist:[10, 30], dur:.5}); }, .8)
   .to(cart, {opacity:0, duration:.35}, '+=.7');
  return new Promise(res=> done = res);
};
// Energy spent on a fight: bolts leap out of the pill and dart off, the pill dims for a beat.
M.energySpend = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), n = Math.max(1, Math.min(5, opts.cost || 2));
  for(let i = 0; i < n; i++) glyph(c.x + rnd(-10, 10), c.y, '⚡', {size:16, rise:-rnd(40, 80), hold:.45, delay:i*.06, rot0:rnd(-40, 40), rot:rnd(-20, 20), scale0:.6});
  label(c.x, c.y + c.h*.9, `−${opts.cost || n}⚡`, 'bad', {size:14, rise:-14, hold:.5});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'opacity,filter'}); finish(opts, res); }}).to(el, {opacity:.55, filter:'saturate(.4)', duration:.12}).to(el, {opacity:1, filter:'saturate(1)', duration:.5}, '+=.2'));
};
// Energy refills +1 (every 5 minutes), A: a maple leaf spirals into the pill and a fill-light runs along it.
M.energyTick = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  return flyArc({x:c.x - 70, y:c.y - 50}, el, '🍁', {n:1, size:18, dur:.6, lift:30, spin:420, color:'#ffcf5a'}).then(()=>{
    sheen(el, {color:'rgba(255,230,120,.9)', dur:.55});
    if(opts.full){ burst(c.x, c.y, {n:12, colors:['#ffe27a', '#fff6c8'], dist:[c.w*.4, c.w*.8], dur:.6, shape:'star', size:7, glow:true}); return label(c.x, c.y - c.h, 'Full!', 'gold', {size:15}); }
    return label(c.x + c.w*.3, c.y - c.h*.8, '+1⚡', 'gold', {size:14, rise:16});
  }).then(()=> call(opts.onDone));
};
// B: a little lightning bolt strikes the pill and charges it.
M.energyTick_B = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), h = lay('fxf-zap', '<svg width="30" height="70" viewBox="0 0 30 70"><polyline points="18,0 8,30 18,32 6,70" fill="none" stroke="#fff6a0" stroke-width="4" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px #ffe14a)"/></svg>', 3000), z = h.firstChild;
  g.set(z, {x:c.x - 15, y:c.y - 76, opacity:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(z, {opacity:1, duration:.04}).to(z, {opacity:.2, duration:.04}).to(z, {opacity:1, duration:.04})
    .add(()=>{ burst(c.x, c.y, {n:10, colors:['#fff6a0', '#ffe14a', '#ffffff'], dist:[12, 40], dur:.4, size:3, glow:true, shape:'chip'}); bump(el); label(c.x + c.w*.3, c.y - c.h*.8, opts.full ? 'Full!' : '+1⚡', 'gold', {size:14}); })
    .to(z, {opacity:0, duration:.15}, '+=.05').to({}, {duration:.5}));
};
// An Energy capsule used: the battery pops, cracks and pours bolts into the pill.
M.energyCapsule = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const f0 = opts.from, c = pt(el), from = f0 && (!f0.getBoundingClientRect || alive(f0)) ? pt(f0) : {x:c.x, y:c.y + 90}; // an element, a rect or a point
  const h = lay('fxf-cap', '<div class="fxf-g" style="font-size:34px">🔋</div>', 4000), b = h.firstChild;
  g.set(b, {x:from.x, y:from.y, xPercent:-50, yPercent:-50, scale:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); res(); }})
    .to(b, {scale:1.2, duration:.2, ease:'back.out(3)'}).to(b, {rotation:8, duration:.05, yoyo:true, repeat:5}).to(b, {scale:0, opacity:0, duration:.15}))
    .then(()=>{ burst(from.x, from.y, {n:10, colors:['#9fff8a', '#e8ffd8', '#fff6a0'], dist:[16, 40], dur:.4, size:4, glow:true});
      return flyArc(from, el, '⚡', {n:6, size:18, dur:.5, stagger:.06, color:'#ffe14a', bumpEach:true}); })
    .then(()=> label(c.x, c.y - c.h, `+${opts.amount || 20}⚡`, 'gold', {size:16})).then(()=> call(opts.onDone));
};
// Free daily Energy: bolts rain down onto the pill like a gift.
M.energyFree = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), n = Math.min(6, opts.amount || 5);
  glyph(c.x - c.w*.55, c.y - 4, '🎁', {size:18, rise:10, hold:.7});
  return Promise.all(Array.from({length:n}, (_, i)=> wait(i*90).then(()=> flyArc({x:c.x + rnd(-40, 40), y:c.y - 110}, el, '⚡', {n:1, size:16, dur:.35, lift:-10, spin:0, ring:i === n - 1, bump:true}))))
    .then(()=> label(c.x, c.y - c.h, `+${opts.amount || 5}⚡`, 'gold', {size:16})).then(()=> call(opts.onDone));
};
// Max Energy raised (Camp / Forge / Wildpaths): the pill stretches wider with a gold ring.
M.energyUpgrade = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el);
  ring(c.x, c.y, {color:'#ffd56e', size:Math.max(70, c.w*1.3), dur:.55});
  burst(c.x, c.y, {n:12, colors:['#ffe27a', '#fff6c8', '#ffb347'], dist:[c.w*.5, c.w*.9], dur:.6, shape:'star', size:7, glow:true});
  label(c.x, c.y - c.h - 4, opts.text || 'Max ⚡ up!', 'gold', {size:15});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform'}); finish(opts, res); }}).to(el, {scaleX:1.22, duration:.16, ease:'power2.out'}).to(el, {scaleX:1, duration:.6, ease:'elastic.out(1.2, .35)'}));
};
// Stamina bought (Tavern / Camp): the newest pip hops and lights, a bolt rises off it.
M.stamina = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const pips = el.querySelectorAll ? [...el.querySelectorAll('i.on')] : [], pip = pips[pips.length - 1] || el, c = pt(pip);
  burst(c.x, c.y, {n:8, colors:['#ffe14a', '#fff6c8'], dist:[8, 24], dur:.45, size:4, glow:true});
  ring(c.x, c.y, {color:'#ffe14a', size:36, dur:.4});
  if(pips.length > 1) pips.forEach((p, i)=> wait(i*40).then(()=> bump(p, {sx:1.3, sy:.8})));
  return Promise.all([bump(pip, {sx:1.4, sy:.7}), glyph(c.x, c.y - 12, '⚡', {size:18, rise:24, hold:.5})]).then(()=> call(opts.onDone));
};
// An achievement unlocked the moment it happens, A: a medal drops in from the top on its ribbon, swings, shines, then flies into its chip.
css('medal', `.fxf .fxf-medal{position:absolute; left:0; top:0; display:flex; flex-direction:column; align-items:center;}
.fxf .fxf-medal .rib{width:16px; height:46px; background:linear-gradient(90deg, #c8322a 0 33%, #f4efdc 33% 66%, #2a6fb0 66%); clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);}
.fxf .fxf-medal .disc{margin-top:-6px; font-family:${EMOJI}; font-size:42px; line-height:1; filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));}`);
M.achvUnlocked = function(target, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = target ? pt(target) : hostPt(opts.host), mx = c.x, my = Math.max(80, c.y - 110);
  const h = lay('fxf-medalhost', '<div class="fxf-medal"><i class="rib"></i><span class="disc">🏅</span></div>', 6000), m = h.firstChild;
  g.set(m, {x:mx, y:-140, xPercent:-50, transformOrigin:'50% 0%', rotation:24});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(m, {y:my - 60, duration:.5, ease:'bounce.out'})
    .to(m, {rotation:-14, duration:.3, ease:'sine.inOut'}, .2).to(m, {rotation:8, duration:.3, ease:'sine.inOut'}).to(m, {rotation:-3, duration:.25}).to(m, {rotation:0, duration:.2})
    .add(()=>{ const d = m.querySelector('.disc'); sheen(d, {dur:.4}); burst(mx, my - 10, {n:10, colors:['#ffe27a', '#fff6c8'], dist:[20, 50], dur:.5, shape:'star', size:7, glow:true}); label(mx, my + 30, opts.text || 'Achievement!', 'gold', {size:15}); }, .7)
    .to(m, {x:c.x, y:c.y - 30, scale:.3, opacity:.0, duration:.45, ease:'power2.in'}, '+=.55')
    .add(()=>{ ring(c.x, c.y, {color:'#ffd56e', size:60}); if(target && alive(target)) bump(target); }));
};
// B: a trophy card slides in from the right edge with gold rays behind it, then slides away (no target needed).
css('trophy', `.fxf .fxf-trophy{position:absolute; left:0; top:0; display:flex; align-items:center; gap:10px; padding:10px 16px 10px 12px; border-radius:14px; background:linear-gradient(135deg, #3b3024, #1a140e);
  color:#f4efdc; box-shadow:0 0 0 2px #e9b44c, 0 10px 26px rgba(0,0,0,.5); font:800 14px/1.2 'Baloo 2',sans-serif; white-space:nowrap; overflow:hidden;}
.fxf .fxf-trophy b{display:block; color:#ffd56e; font-size:12px; letter-spacing:.06em; text-transform:uppercase;} .fxf .fxf-trophy .ti{font-family:${EMOJI}; font-size:30px;}
.fxf .fxf-trophy .tr{position:absolute; left:-10px; top:50%; width:90px; height:90px; margin-top:-45px; background:repeating-conic-gradient(rgba(255,214,110,.35) 0 10deg, transparent 10deg 30deg); border-radius:50%; z-index:-1;}`);
M.achvUnlocked_B = function(target, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const host = opts.host ? opts.host.getBoundingClientRect() : {left:0, top:0, width:VW(), height:VH()};
  const h = lay('fxf-trh', `<div class="fxf-trophy"><i class="tr"></i><span class="ti">🏆</span><span><b>Achievement unlocked</b>${esc(opts.text || 'First Clear')}</span></div>`, 6000), t = h.firstChild;
  const x1 = host.left + host.width - 16, y = host.top + Math.min(90, host.height*.18);
  g.set(t, {x:x1 + 40, y, xPercent:0, opacity:0});
  const w = t.offsetWidth;
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(t, {x:x1 - w, opacity:1, duration:.4, ease:'back.out(1.6)'})
    .to(t.querySelector('.tr'), {rotation:120, duration:1.6, ease:'none'}, 0)
    .add(()=> sheen(t, {dur:.6}), .35)
    .to(t, {x:x1 + 40, opacity:0, duration:.35, ease:'power2.in'}, 1.7));
};
// Quest progress ticks: a quill ticks it off, "+1", and the note's pin wiggles.
M.questProgress = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  glyph(c.x + c.w*.3, c.y - c.h*.1, '✒️', {size:18, rise:4, hold:.45, rot0:-30, onTl:(t, e)=> t.to(e, {x:'+=8', y:'+=6', rotation:10, duration:.12, yoyo:true, repeat:1}, .2)});
  return Promise.all([glyph(c.x + c.w*.32, c.y, '✔', {cls:'fxf-label is-good', size:20, rise:6, hold:.4, delay:.25}), shake(el, {amp:0, rot:3, n:4, step:.06}),
    label(c.x, c.y - c.h*.6, opts.text || '+1', 'good', {size:14, delay:.3, rise:14})]).then(()=> call(opts.onDone));
};
// An errand offered after a win: a pinned note flutters in from the side and pins itself near the speaker.
css('note', `.fxf .fxf-note{position:absolute; left:0; top:0; width:58px; height:46px; border-radius:3px; background:#fff3cf; box-shadow:0 4px 10px rgba(0,0,0,.35);
  background-image:repeating-linear-gradient(180deg, transparent 0 9px, rgba(120,90,40,.25) 9px 10px); }
.fxf .fxf-note::before{content:''; position:absolute; left:50%; top:-5px; width:11px; height:11px; margin-left:-5px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ff8a7a, #b3241b); box-shadow:0 1px 2px rgba(0,0,0,.5);}`);
M.errandOffer = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), tx = c.x + (c.w || 0)*.42, ty = c.y - (c.h || 0)*.2;
  const h = lay('fxf-noteh', '<i class="fxf-note"></i>', 5000), n = h.firstChild, sx = Math.min(VW() - 30, tx + 220), s = {t:0};
  g.set(n, {x:sx, y:ty - 90, xPercent:-50, yPercent:-50, rotation:30});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(s, {t:1, duration:.8, ease:'power1.out', onUpdate:()=>{ const u = s.t; g.set(n, {x:sx + (tx - sx)*u + Math.sin(u*9)*14*(1 - u), y:ty - 90 + 90*u, rotation:30*(1 - u) + Math.sin(u*12)*10*(1 - u)}); }})
    .add(()=>{ ring(tx, ty - 22, {color:'#e0504a', size:30, dur:.35}); bump(n, {sx:1.08, sy:.92}); })
    .add(()=> label(tx, ty - 44, opts.text || 'Errand!', 'gold', {size:13, rise:12}))
    .to(n, {opacity:0, y:'+=6', duration:.3}, '+=.7'));
};
// A daily notice swapped: the paper flips over and the fresh one is on the back.
M.noticeSwap = function(target, opts){
  opts = opts || {}; const g = G(); if(!g || !target) return Promise.resolve();
  const r = target.getBoundingClientRect ? target.getBoundingClientRect() : target; if(!r.width) return Promise.resolve();
  const h = lay('fxf-flip', '<i></i>', 4000), p = h.firstChild;
  Object.assign(p.style, {position:'absolute', left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px', borderRadius:'6px', background:'linear-gradient(135deg, #fff6dc, #ecd9a8)', boxShadow:'0 6px 16px rgba(0,0,0,.35)'});
  g.set(h, {perspective:600});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .fromTo(p, {rotationY:0, opacity:1}, {rotationY:90, duration:.2, ease:'power1.in'})
    .add(()=>{ p.style.background = 'linear-gradient(135deg, #fffbe8, #f6e6b8)'; burst(r.left + r.width/2, r.top + r.height/2, {n:10, colors:['#fff6c8', '#ffd56e'], dist:[r.width*.3, r.width*.7], dur:.5, shape:'star', size:6, glow:true}); })
    .to(p, {rotationY:0, duration:.25, ease:'back.out(2)'})
    .to(p, {opacity:0, duration:.3}, '+=.15'));
};
// Account level-up, A: a ring fills round a big star with the new level, pops into a star burst, then flies to the level badge.
css('lvl', `.fxf .fxf-lvl{position:absolute; left:0; top:0; width:120px; height:120px;}
.fxf .fxf-lvl svg{position:absolute; inset:0; overflow:visible;} .fxf .fxf-lvl circle{fill:none; stroke-width:7; stroke-linecap:round;}
.fxf .fxf-lvl .bg{stroke:rgba(255,255,255,.18);} .fxf .fxf-lvl .fg{stroke:#ffd56e; filter:drop-shadow(0 0 6px #ffb347);}
.fxf .fxf-lvl .st{position:absolute; inset:0; display:grid; place-items:center; font-family:${EMOJI}; font-size:64px; filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));}
.fxf .fxf-lvl .num{position:absolute; inset:0; display:grid; place-items:center; padding-top:6px; font:900 28px/1 'Baloo 2',sans-serif; color:#4a2a06; text-shadow:0 1px 0 rgba(255,255,255,.6);}
.fxf .fxf-coin{position:absolute; left:0; top:0; width:96px; height:96px; border-radius:50%; display:grid; place-items:center; font:900 40px/1 'Baloo 2',sans-serif; color:#5a3508;
  background:radial-gradient(circle at 35% 30%, #fff3b0, #ffcf4a 45%, #c98a1c 100%); box-shadow:0 0 0 4px #8a5a14, 0 0 0 7px #ffe08a, 0 8px 20px rgba(0,0,0,.5);}`);
M.accountLevel = function(target, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = opts.at || hostPt(opts.host), L = opts.level != null ? opts.level : 7, C = 2*Math.PI*52;
  const h = lay('fxf-lvlh', `<div class="fxf-lvl"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" transform="rotate(-90 60 60)" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><span class="st">⭐</span><span class="num">${esc(L)}</span></div>`, 7000);
  const box = h.firstChild, fg = box.querySelector('.fg'), st = box.querySelector('.st'), num = box.querySelector('.num');
  g.set(box, {x:c.x - 60, y:c.y - 60, scale:0, rotation:-30}); g.set(num, {scale:0});
  const tp = target && alive(target) ? pt(target) : null;
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(box, {scale:1, rotation:0, duration:.35, ease:'back.out(2)'})
    .to(fg, {attr:{'stroke-dashoffset':0}, duration:.6, ease:'power2.inOut'}, .15)
    .to(st, {rotation:360, duration:.75, ease:'power2.inOut'}, .1)
    .add(()=>{ ring(c.x, c.y, {color:'#ffd56e', size:150, width:4, dur:.55}); ring(c.x, c.y, {color:'#ffffff', size:110, dur:.4});
      burst(c.x, c.y, {n:22, colors:['#ffe27a', '#fff6c8', '#ffb347', '#ffffff'], dist:[60, 150], dur:.8, shape:'star', size:10, glow:true}); try{ opts.sound && opts.sound(); }catch(e){} }, .75)
    .to(box, {scale:1.25, duration:.1}, .75).to(box, {scale:1, duration:.35, ease:'elastic.out(1.2, .4)'})
    .to(num, {scale:1, duration:.3, ease:'back.out(3)'}, .8)
    .add(()=> banner('Level ' + esc(L) + '!', {at:{x:c.x, y:c.y + 92}, theme:'gold', sub:opts.sub || '', hold:.7, scale:'clamp(18px,4.6vw,26px)'}), .9)
    .to(box, tp ? {x:tp.x - 60, y:tp.y - 60, scale:.25, opacity:.0, duration:.5, ease:'power2.in'} : {scale:.6, opacity:0, duration:.35}, 2.0)
    .add(()=>{ if(tp){ ring(tp.x, tp.y, {color:'#ffd56e', size:60}); bump(target); } }));
};
// B: a gold ribbon "LEVEL N" unfurls across with acorn confetti from both sides.
M.accountLevel_B = function(target, opts){
  opts = opts || {}; const c = opts.at || hostPt(opts.host), w = (opts.host ? opts.host.getBoundingClientRect().width : VW());
  [-1, 1].forEach(s=> burst(c.x + s*Math.min(220, w*.42), c.y + 20, {n:12, glyphs:['🌰', '🍂', '⭐', '✨'], gsize:16, spread:1.1, angle:s < 0 ? -Math.PI*.35 : -Math.PI*.65, dist:[60, 140], dur:1, spin:300, gravity:60}));
  return banner('Level ' + esc(opts.level != null ? opts.level : 7), {host:opts.host, at:opts.at, theme:'gold', icon:'⭐', icon2:'⭐', sub:opts.sub || 'New cards in the Shop', hold:1.1})
    .then(()=>{ if(target && alive(target)) bump(target); call(opts.onDone); });
};
// C: the level coin flips over to the new number with rays behind, then sinks into the badge.
M.accountLevel_C = function(target, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = opts.at || hostPt(opts.host), L = opts.level != null ? opts.level : 7;
  const h = lay('fxf-coinh', `<i class="fxf-rays"></i><div class="fxf-coin">${esc(L - 1)}</div>`, 6000), rays = h.children[0], coin = h.children[1]; // .fxf-rays: see the skill reveal CSS
  g.set(rays, {x:c.x - 120, y:c.y - 120, width:240, height:240, opacity:0, scale:.5}); g.set(coin, {x:c.x - 48, y:c.y - 48, scale:0, transformPerspective:500});
  const tp = target && alive(target) ? pt(target) : null;
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(coin, {scale:1, duration:.3, ease:'back.out(2)'})
    .to(coin, {rotationY:90, duration:.18, ease:'power1.in'}, '+=.15').add(()=>{ coin.textContent = String(L); })
    .to(coin, {rotationY:0, duration:.3, ease:'back.out(2)'})
    .to(rays, {opacity:1, scale:1, rotation:60, duration:.8}, '<')
    .add(()=>{ burst(c.x, c.y, {n:16, colors:['#ffe27a', '#fff6c8'], dist:[50, 110], dur:.6, shape:'star', size:8, glow:true}); label(c.x, c.y + 70, 'Level up!', 'gold'); }, '<')
    .to(rays, {opacity:0, duration:.4}, '+=.5')
    .to(coin, tp ? {x:tp.x - 48, y:tp.y - 48, scale:.2, opacity:0, duration:.45, ease:'power2.in'} : {scale:0, opacity:0, duration:.3}, '<'));
};
// XP gained: little stars stream into the level bar and it shines.
M.xpGain = function(target, opts){
  opts = opts || {}; if(!target) return Promise.resolve();
  const c = pt(target), from = opts.from ? pt(opts.from) : {x:c.x, y:c.y + 80};
  return flyArc(from, target, '✦', {n:Math.max(3, Math.min(7, Math.round(Math.log2((opts.amount || 10) + 1)))), size:16, dur:.45, stagger:.05, color:'#ffe27a', lift:30, spin:0}).then(()=>{
    sheen(target, {color:'rgba(255,230,140,.85)', dur:.5}); return label(c.x, c.y - c.h - 2, `+${opts.amount || 10} XP`, 'gold', {size:14}); }).then(()=> call(opts.onDone));
};

// ---------- rewards and results (2026-10-15) ----------
// A draw, A: two half-banners (green shield, red sword) slide in and lock at the seam; a handshake pops over it.
css('draw', `.fxf .fxf-half{position:absolute; left:0; top:0; height:54px; display:flex; align-items:center; font:900 26px/1 'Baloo 2',sans-serif; color:#fff8e0; text-shadow:0 2px 0 rgba(0,0,0,.35);
  box-shadow:0 8px 20px rgba(0,0,0,.4);} .fxf .fxf-half.l{justify-content:flex-end; padding-right:30px; background:linear-gradient(90deg, rgba(40,90,50,0), #2f7a3f 40%); border-radius:0 6px 6px 0; clip-path:polygon(0 0,100% 0,92% 50%,100% 100%,0 100%);}
.fxf .fxf-half.r{justify-content:flex-start; padding-left:30px; background:linear-gradient(270deg, rgba(120,30,25,0), #a3271f 40%); border-radius:6px 0 0 6px; clip-path:polygon(0 0,100% 0,100% 100%,0 100%,8% 50%);}`);
M.resDraw = function(card, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = card ? pt(card) : hostPt(opts.host), y = card ? c.r.top + 40 : c.y, W = Math.min(200, (card ? c.w : VW())*.5);
  const h = lay('fxf-drawh', `<div class="fxf-half l"><span style="font-family:${EMOJI}">🛡️</span></div><div class="fxf-half r"><span style="font-family:${EMOJI}">⚔️</span></div>`, 5000), L = h.children[0], R = h.children[1];
  L.style.width = R.style.width = W + 'px';
  g.set(L, {x:c.x - W - 300, y:y - 27}); g.set(R, {x:c.x + 300, y:y - 27});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(L, {x:c.x - W + 4, duration:.38, ease:'power3.in'}).to(R, {x:c.x - 4, duration:.38, ease:'power3.in'}, 0)
    .add(()=>{ burst(c.x, y, {n:14, colors:['#e8dcc0', '#c9b896', '#fff8e0'], dist:[20, 60], dur:.5, size:6, shape:'chip', gravity:20}); ring(c.x, y, {color:'#f4ecd8', size:90});
      if(card && alive(card)) shake(card, {amp:4, n:4}); glyph(c.x, y, '🤝', {size:40, rise:0, hold:.9, scale0:2.2, ease:'power4.in', inDur:.2}); })
    .to([L, R], {x:(i)=> i ? '+=6' : '-=6', duration:.08, yoyo:true, repeat:1})
    .to([L, R], {opacity:0, duration:.35}, '+=.75'));
};
// B: a pair of scales tips one way, the other, and settles level; "Draw" is stamped under it.
M.resDraw_B = function(card, opts){
  opts = opts || {}; const c = card ? pt(card) : hostPt(opts.host), y = card ? c.r.top + 54 : c.y;
  return Promise.all([glyph(c.x, y, '⚖️', {size:52, rise:0, hold:1.3, onTl:(t, e)=> t.to(e, {rotation:-16, duration:.25, ease:'sine.inOut'}, .3).to(e, {rotation:12, duration:.3, ease:'sine.inOut'}).to(e, {rotation:-5, duration:.25}).to(e, {rotation:0, duration:.2})}),
    stamp(c.x, y + 52, 'Draw', {color:'ink', size:22, delay:.9, hold:.5})]).then(()=> call(opts.onDone));
};
// The rank lesson card: a quill draws a gold underline beneath it and a small hex shines.
M.rankLesson = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const r = el.getBoundingClientRect(), h = lay('fxf-lesson', '<i></i>', 4000), u = h.firstChild, c = pt(el);
  Object.assign(u.style, {position:'absolute', left:(r.left + 16) + 'px', top:(r.bottom - 6) + 'px', width:(r.width - 32) + 'px', height:'3px', borderRadius:'3px', background:'linear-gradient(90deg, #ffd56e, #fff6c8, #ffd56e)', boxShadow:'0 0 8px #ffb347', transformOrigin:'0 50%'});
  glyph(r.left + 14, r.bottom - 8, '🪶', {size:16, rise:0, hold:.6, onTl:(t, e)=> t.to(e, {x:r.left + r.width - 16, duration:.55, ease:'power1.inOut'}, .15)});
  burst(r.left + 20, r.top + 14, {n:6, colors:['#fff6c8', '#ffd56e'], dist:[8, 22], dur:.45, size:4, shape:'star', glow:true});
  return new Promise(res=> g.timeline({delay:.15, onComplete:()=>{ h.remove(); finish(opts, res); }}).fromTo(u, {scaleX:0}, {scaleX:1, duration:.55, ease:'power1.inOut'}).add(()=> sheen(el, {dur:.6})).to(u, {opacity:0, duration:.5}, '+=.8'));
};
// Packs won before the Armoury opened are released: they drop one after another onto the spot with a thud.
css('pack', `.fxf .fxf-pack{position:absolute; left:0; top:0; width:44px; height:60px; border-radius:6px; display:grid; place-items:center; font-family:${EMOJI}; font-size:20px;
  background:linear-gradient(160deg, #e6b34a, #b5651d 60%, #7a3e12); box-shadow:inset 0 0 0 2px rgba(255,240,200,.55), 0 6px 12px rgba(0,0,0,.45);}`);
M.heldPacks = function(target, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = target ? pt(target) : hostPt(opts.host), n = Math.max(1, Math.min(4, opts.count || 2)), h = lay('fxf-packs', '', 7000);
  const ps = Array.from({length:n}, (_, i)=>{ const p = document.createElement('div'); p.className = 'fxf-pack'; p.textContent = '🌰'; h.appendChild(p); g.set(p, {x:c.x - 22 + (i - (n-1)/2)*30, y:c.y - 260, rotation:rnd(-30, 30), opacity:0}); return p; });
  const t = g.timeline({onComplete:()=>{ h.remove(); finish(opts, done); }}); let done;
  ps.forEach((p, i)=>{ const x = c.x - 22 + (i - (n-1)/2)*30;
    t.to(p, {opacity:1, duration:.05}, i*.28).to(p, {y:c.y - 30, rotation:rnd(-8, 8), duration:.38, ease:'power3.in'}, i*.28)
     .add(()=>{ burst(x + 22, c.y + 30, {n:8, colors:['#d8cbb0', '#b5a68a'], dist:[14, 40], spread:Math.PI, angle:-Math.PI/2, dur:.45, size:6, gravity:10}); }, i*.28 + .38)
     .to(p, {y:c.y - 36, duration:.08, yoyo:true, repeat:1}, i*.28 + .38); });
  t.add(()=> label(c.x, c.y - 70, opts.text || `${n} pack${n === 1 ? '' : 's'} released!`, 'gold'), n*.28 + .3).to(ps, {opacity:0, y:'-=10', duration:.3, stagger:.05}, '+=.8');
  return new Promise(res=> done = res);
};
// A Dragon Scale found, A: a red-gold scale spins in the air in embers, a dragon eye opens and closes, the scale drops into the reward.
css('scale', `.fxf .fxf-scale{position:absolute; left:0; top:0; width:34px; height:42px; border-radius:50% 50% 50% 50% / 30% 30% 70% 70%;
  background:conic-gradient(from 200deg, #ffcf6a, #ff6a2a, #b3121b, #ff6a2a, #ffe9a0, #ffcf6a); box-shadow:0 0 14px rgba(255,90,40,.8), inset 0 -6px 10px rgba(80,0,0,.45);}
.fxf .fxf-eye{position:absolute; left:0; top:0; width:120px; height:46px; border-radius:50%; background:radial-gradient(ellipse at 50% 50%, #1a0500 0 9%, #ffcc33 10% 34%, #ff5a1a 60%, #6a0a00 100%);
  box-shadow:0 0 30px 8px rgba(255,90,20,.6); clip-path:ellipse(50% 50% at 50% 50%);}`);
M.dragonScale = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), sy = c.y - 80, h = lay('fxf-scaleh', '<i class="fxf-eye"></i><i class="fxf-scale"></i>', 6000), eye = h.children[0], sc = h.children[1];
  g.set(eye, {x:c.x - 60, y:sy - 70, scaleY:0, opacity:0}); g.set(sc, {x:c.x - 17, y:sy - 21, scale:0, transformPerspective:400});
  const emb = ()=> burst(c.x, sy, {n:10, colors:['#ff6a2a', '#ffcf6a', '#ff3b1a'], dist:[20, 60], dur:.6, size:4, glow:true, spread:Math.PI, angle:-Math.PI/2});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(eye, {opacity:1, scaleY:1, duration:.2, ease:'power2.out'}).to(eye, {scaleY:.08, duration:.08}, '+=.25').to(eye, {scaleY:1, duration:.1}).to(eye, {opacity:0, scaleY:0, duration:.25}, '+=.2')
    .to(sc, {scale:1.3, duration:.3, ease:'back.out(2)'}, .2).to(sc, {rotationY:720, duration:1, ease:'power2.inOut'}, .2).add(emb, .3).add(emb, .8)
    .to(sc, {y:c.y - 21, scale:.8, duration:.3, ease:'power2.in'}, 1.25)
    .add(()=>{ ring(c.x, c.y, {color:'#ff6a2a', size:Math.max(60, (c.w || 60)*1.2)}); if(el && alive(el)){ bump(el); sheen(el, {color:'rgba(255,140,80,.85)'}); } label(c.x, c.y - 30, opts.text || 'Dragon Scale!', 'gold'); })
    .to(sc, {opacity:0, duration:.2}));
};
// B: a dragon's shadow sweeps across overhead and a scale falls from it into the reward.
M.dragonScale_B = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), hr = opts.host ? opts.host.getBoundingClientRect() : {left:0, width:VW(), top:0};
  const h = lay('fxf-dragsh', `<div class="fxf-g" style="font-size:140px; filter:brightness(0) blur(3px); opacity:.45">🐉</div><i class="fxf-scale"></i>`, 6000), d = h.children[0], sc = h.children[1];
  if(opts.host) clipTo(h, hr); // 2026-10-15: the shadow stays inside the panel it crosses
  g.set(d, {x:hr.left - 160, y:c.y - 150, scaleX:-1}); g.set(sc, {x:c.x - 17, y:c.y - 150, opacity:0, scale:.8});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(d, {x:hr.left + hr.width + 40, duration:1.3, ease:'none'})
    .to(sc, {opacity:1, duration:.1}, .55).to(sc, {y:c.y - 21, rotation:540, duration:.55, ease:'power2.in'}, .55)
    .add(()=>{ ring(c.x, c.y, {color:'#ff6a2a', size:70}); burst(c.x, c.y, {n:10, colors:['#ff6a2a', '#ffcf6a'], dist:[16, 50], dur:.5, size:4, glow:true}); if(el && alive(el)) bump(el); label(c.x, c.y - 30, 'Dragon Scale!', 'gold'); }, 1.1)
    .to(sc, {opacity:0, duration:.2}, 1.3));
};
// A boss leader joins you: a crown drops onto it in a gold ring.
M.bossLeader = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), top = c.y - c.h*.5;
  return glyph(c.x, top, '👑', {size:30, scale0:1.8, rot0:-20, rise:0, hold:.7, inDur:.25, ease:'bounce.out', onTl:(t)=> t.add(()=>{ ring(c.x, top, {color:'#ffd56e', size:80}); burst(c.x, top, {n:12, colors:['#ffe27a', '#fff6c8'], dist:[20, 60], dur:.55, shape:'star', size:7, glow:true}); bump(el); }, .25)})
    .then(()=> call(opts.onDone));
};
// The Map 20 faction crown: a laurel wreath draws itself leaf by leaf round a glowing crown, in the faction's colours.
M.factionCrown = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), R = 54, hum = opts.faction === 'hummingbirds', glow = hum ? '#ff5fc8' : '#2fb3a5', h = lay('fxf-wreath', '', 6000);
  const leaves = Array.from({length:14}, (_, i)=>{ const a = Math.PI*.62 + (i/13)*Math.PI*1.76, e = document.createElement('div'); e.className = 'fxf-g'; e.textContent = hum ? ['🌺', '🍃'][i % 2] : '🍃'; e.style.fontSize = '18px';
    h.appendChild(e); g.set(e, {x:c.x + Math.cos(a)*R, y:c.y + Math.sin(a)*R, xPercent:-50, yPercent:-50, rotation:a*180/Math.PI + 90, scale:0}); return e; });
  const cr = document.createElement('div'); cr.className = 'fxf-g'; cr.textContent = '👑'; cr.style.fontSize = '44px'; h.appendChild(cr); g.set(cr, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, scale:0, filter:`drop-shadow(0 0 12px ${glow})`});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(leaves, {scale:1, duration:.18, ease:'back.out(3)', stagger:.04})
    .to(cr, {scale:1.2, duration:.3, ease:'back.out(2.5)'}, .3).to(cr, {scale:1, duration:.2})
    .add(()=>{ ring(c.x, c.y, {color:glow, size:150, width:4}); burst(c.x, c.y, {n:18, colors:hum ? ['#ff5fc8', '#7ad7ff', '#ffd36e', '#8a4dff', '#5ee07a'] : ['#2fb3a5', '#c58b4a', '#e9fbf6', '#ffd56e'], dist:[40, 110], dur:.7, shape:'star', size:8, glow:true}); label(c.x, c.y + R + 22, opts.text || 'Faction crown!', 'gold'); }, .85)
    .to([...leaves, cr], {opacity:0, scale:.8, duration:.35}, '+=.8'));
};
// Materia / ore drops: prism shards rain into the reward chip, which pops.
M.materiaDrop = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el), h = lay('fxf-shards', '', 4000), cols = ['#7ad7ff', '#b46bff', '#ff9be3', '#9fffd8', '#ffffff'];
  const sh = Array.from({length:7}, (_, i)=>{ const p = document.createElement('i'); p.className = 'fxf-p is-shard'; Object.assign(p.style, {width:'10px', height:'16px', background:`linear-gradient(135deg, #fff, ${cols[i % cols.length]})`, boxShadow:`0 0 8px ${cols[i % cols.length]}`}); h.appendChild(p);
    g.set(p, {x:c.x + rnd(-40, 40), y:c.y - rnd(90, 150), xPercent:-50, yPercent:-50, rotation:rnd(-60, 60), opacity:0}); return p; });
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(sh, {opacity:1, duration:.08, stagger:.06})
    .to(sh, {x:c.x, y:c.y, rotation:'+=180', duration:.42, ease:'power2.in', stagger:.06}, 0)
    .add(()=>{ bump(el); ring(c.x, c.y, {color:'#b46bff', size:Math.max(50, c.w*1.1)}); burst(c.x, c.y, {n:12, colors:cols, dist:[16, 46], dur:.5, size:5, shape:'star', glow:true}); }, .8)
    .to(sh, {opacity:0, duration:.1}, .8).to({}, {duration:.4}));
};
// XP on the results: a "+N XP" star chip rises off the card and a thin bar fills under it.
M.xpLine = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), y = el ? c.r.top + 26 : c.y, h = lay('fxf-xpl', '<div class="fxf-label is-gold" style="font-size:16px">⭐ +' + esc(opts.amount || 3) + ' XP</div><i></i>', 4000), lb = h.children[0], bar = h.children[1];
  Object.assign(bar.style, {position:'absolute', width:'90px', height:'5px', borderRadius:'3px', background:'linear-gradient(90deg, #ffd56e, #fff6c8)', boxShadow:'0 0 6px #ffb347', transformOrigin:'0 50%'});
  g.set(lb, {x:c.x, y:y + 20, xPercent:-50, yPercent:-50, opacity:0, scale:.6}); g.set(bar, {x:c.x - 45, y:y + 34, scaleX:0, opacity:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(lb, {opacity:1, scale:1, y, duration:.3, ease:'back.out(2)'}).to(bar, {opacity:1, duration:.1}, '<.1').to(bar, {scaleX:opts.fill != null ? opts.fill : .7, duration:.5, ease:'power2.out'})
    .add(()=> burst(c.x - 45 + 90*(opts.fill != null ? opts.fill : .7), y + 36, {n:6, colors:['#ffe27a', '#fff6c8'], dist:[6, 18], dur:.35, size:3, glow:true}))
    .to([lb, bar], {opacity:0, y:'-=10', duration:.35}, '+=.6'));
};
// Tutorial win / loss: a friendly teacher's tick and acorn confetti, or a little acorn hopping in to say try again.
M.tutorialResult = function(card, opts){
  opts = opts || {}; const c = card ? pt(card) : hostPt(opts.host), y = card ? c.r.top + 60 : c.y;
  if(opts.won === false){
    const x = c.x - Math.min(150, c.w*.35);
    label(x + 34, y - 8, 'Try again!', 'gold', {size:15, delay:.4});
    return glyph(x, y + 30, '🌰', {size:34, rise:0, hold:1.2, onTl:(t, e)=> t.to(e, {y:'-=18', duration:.14, yoyo:true, repeat:3, ease:'power1.out'}, .3)}).then(()=> call(opts.onDone));
  }
  [-1, 1].forEach(s=> burst(c.x + s*Math.min(160, c.w*.38), y + 20, {n:10, glyphs:['🌰', '🍂', '🍁'], gsize:16, spread:1, angle:s < 0 ? -Math.PI*.3 : -Math.PI*.7, dist:[40, 110], dur:.9, spin:300, gravity:50}));
  return stamp(c.x + Math.min(120, c.w*.3), y + 6, '✔ Well done', {color:'green', size:20, hold:.8, rot:-6}).then(()=> call(opts.onDone));
};

// ---------- tutorial and dialogue (2026-10-15) ----------
// Read a mood from the line itself (the dialogue data carries no mood field yet): !, ?, ..., or a warning.
function moodOf(text, warn){
  const s = String(text || '').trim();
  if(warn) return 'angry';
  if(/(\.\.\.|…)$/.test(s)) return 'sad';
  if(/\?$/.test(s)) return 'ask';
  if(/!$/.test(s)) return 'happy';
  return 'calm';
}
const MOOD_ICON = {happy:'❗', ask:'❓', sad:'💧', angry:'💢', calm:''};
// NPC portrait expression, A: the portrait reacts to the line's mood (hop, tilt, droop, shake) and a little mood mark pops by it.
M.portraitMood = function(lineEl, opts){
  opts = opts || {}; const g = G(); if(!g || !lineEl) return Promise.resolve();
  const p = lineEl.querySelector('.dlg-portrait') || lineEl, mood = opts.mood || moodOf(opts.text, opts.warn), c = pt(p);
  if(opts.speakerChanged) ring(c.x, c.y, {color:'#e0b85a', size:Math.max(40, c.w*1.4), dur:.45});
  const t = g.timeline({delay:opts.delay != null ? opts.delay : .3, onComplete:()=> g.set(p, {clearProps:'transform'})});
  if(mood === 'happy') t.to(p, {y:-6, duration:.1, yoyo:true, repeat:3, ease:'power1.out'});
  else if(mood === 'ask') t.to(p, {rotation:-12, duration:.18, ease:'power1.out'}).to(p, {rotation:0, duration:.35, ease:'back.out(2)'}, '+=.35');
  else if(mood === 'sad') t.to(p, {y:3, rotation:6, duration:.3, ease:'power1.inOut'}).to(p, {y:0, rotation:0, duration:.4}, '+=.4');
  else if(mood === 'angry') t.to(p, {x:3, duration:.04, yoyo:true, repeat:7}).to(p, {x:0, duration:.04});
  else t.to(p, {scaleY:.9, scaleX:1.06, duration:.08, yoyo:true, repeat:1});
  const ico = MOOD_ICON[mood];
  return (ico ? glyph(c.x + c.w*.45, c.y - c.h*.45, ico, {size:14, rise:8, hold:.7, delay:(opts.delay != null ? opts.delay : .3) + .05}) : wait(600)).then(()=> call(opts.onDone));
};
// B: the portrait "talks": a soft squash-bob a few times, like a mouth moving.
M.portraitMood_B = function(lineEl, opts){
  opts = opts || {}; const g = G(); if(!g || !lineEl) return Promise.resolve();
  const p = lineEl.querySelector('.dlg-portrait') || lineEl;
  return new Promise(res=> g.timeline({delay:.25, onComplete:()=>{ g.set(p, {clearProps:'transform'}); finish(opts, res); }})
    .to(p, {scaleY:.9, scaleX:1.05, y:1, duration:.09, yoyo:true, repeat:7, ease:'sine.inOut', transformOrigin:'50% 100%'}));
};
// A dialogue act opens a menu or shows a place: a swirl of leaves sweeps from the speaker across the screen.
M.dialogueAct = function(from, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const a = from ? pt(from) : {x:60, y:VH()*.3}, b = opts.to ? pt(opts.to) : {x:VW()*.75, y:VH()*.45}, h = lay('fxf-swirl', '', 4000);
  const ls = Array.from({length:8}, (_, i)=>{ const e = document.createElement('div'); e.className = 'fxf-g'; e.textContent = ['🍃', '🍂', '✨'][i % 3]; e.style.fontSize = (14 + (i % 3)*3) + 'px'; h.appendChild(e); return e; });
  return new Promise(res=>{ const t = g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }});
    ls.forEach((e, i)=>{ const s = {u:0}, off = rnd(-30, 30), wob = rnd(20, 50);
      g.set(e, {x:a.x, y:a.y, xPercent:-50, yPercent:-50, opacity:0});
      t.to(e, {opacity:1, duration:.08}, i*.05).to(s, {u:1, duration:.7, ease:'power1.inOut', onUpdate:()=>{ const u = s.u; g.set(e, {x:a.x + (b.x - a.x)*u, y:a.y + (b.y - a.y)*u + Math.sin(u*Math.PI*2 + i)*wob + off*u, rotation:u*540}); }}, i*.05)
       .to(e, {opacity:0, duration:.18}, i*.05 + .55); });
    t.add(()=> ring(b.x, b.y, {color:'#9fe0b0', size:70}), .7); });
};
// A faction general warns you: the line flares red at the edge, a warning mark shakes in and a horn ripple in the faction colour.
M.factionWarning = function(lineEl, opts){
  opts = opts || {}; const g = G(); if(!g || !lineEl) return Promise.resolve();
  const r = lineEl.getBoundingClientRect(), col = opts.faction === 'hummingbirds' ? '#d6336c' : '#c58b4a', h = lay('fxf-warn', '<i></i>', 4000), b = h.firstChild;
  Object.assign(b.style, {position:'absolute', left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px', borderRadius:'14px', boxShadow:'0 0 0 3px #e0504a, 0 0 18px 4px rgba(224,80,74,.6)'});
  ring(r.left + 22, r.top + r.height/2, {color:col, size:50, dur:.5, delay:.1}); ring(r.left + 22, r.top + r.height/2, {color:col, size:50, dur:.5, delay:.35});
  glyph(r.right - 12, r.top + 4, '⚠️', {size:18, rise:0, hold:.8, onTl:(t, e)=> t.to(e, {rotation:14, duration:.06, yoyo:true, repeat:5}, .2)});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).fromTo(b, {opacity:0}, {opacity:1, duration:.12}).to(b, {opacity:.25, duration:.2}).to(b, {opacity:1, duration:.15}).to(b, {opacity:0, duration:.5}, '+=.3'));
};
// A curiosity's repeat-visit bubble: a "!" pops over it with two ripples and a few sparkles.
M.curioBubble = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), y = c.y - c.h*.6;
  ring(c.x, c.y, {color:'#fff3c4', size:Math.max(40, c.w*1.4), dur:.5}); ring(c.x, c.y, {color:'#fff3c4', size:Math.max(40, c.w*1.4), dur:.5, delay:.2});
  burst(c.x, y, {n:6, colors:['#fff3c4', '#ffd56e'], dist:[10, 26], dur:.45, size:4, shape:'star', glow:true});
  return glyph(c.x, y, '❗', {size:22, rise:10, hold:.55}).then(()=> call(opts.onDone));
};
// The AFK line ("I'll come back later"): sleepy z's drift up, a little wave, and the line settles.
M.afkLine = function(lineEl, opts){
  opts = opts || {}; const g = G(); if(!g || !lineEl) return Promise.resolve();
  const p = lineEl.querySelector('.dlg-portrait') || lineEl, c = pt(p);
  for(let i = 0; i < 3; i++) glyph(c.x + c.w*.4 + i*6, c.y - c.h*.3 - i*4, 'z', {cls:'fxf-label', size:12 + i*3, rise:20, hold:.6, delay:.2 + i*.22});
  glyph(c.x - c.w*.1, c.y + c.h*.1, '👋', {size:16, rise:4, hold:.8, delay:.1, onTl:(t, e)=> t.to(e, {rotation:20, duration:.12, yoyo:true, repeat:5, transformOrigin:'70% 90%'}, .2)});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(lineEl, {clearProps:'opacity'}); finish(opts, res); }}).to(lineEl, {opacity:.72, duration:.4}, .3).to(lineEl, {opacity:1, duration:.4}, '+=.6'));
};

// ---------- raid, dungeon, PvP (2026-10-15) ----------
// A trench replay hit: a claw slash across the card, a red flash and chips.
M.trenchHit = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const r = el.getBoundingClientRect(), c = pt(el), h = lay('fxf-slash', '<i></i><i></i>', 3000);
  [...h.children].forEach((s, i)=>{ Object.assign(s.style, {position:'absolute', left:(c.x - r.width*.55) + 'px', top:(c.y - 2 + (i - .5)*9) + 'px', width:(r.width*1.1) + 'px', height:'3px', borderRadius:'3px',
    background:'linear-gradient(90deg, transparent, #fff 30%, #ffd0c8 70%, transparent)', boxShadow:'0 0 6px #ff6a5a', transformOrigin:'0 50%'}); g.set(s, {rotation:-28, scaleX:0}); });
  burst(c.x, c.y, {n:7, colors:['#ff6a5a', '#ffd0c8', '#7a1a12'], dist:[12, 34], dur:.4, size:4, shape:'chip', gravity:14});
  sheen(el, {tint:'rgba(255,60,40,.5)', color:'rgba(255,200,190,.6)', dur:.3});
  const sl = [...h.children];
  // 2026-10-15 (user: "The twin slash vfx you've used, can you edit the fade out abit such that it fades out from the top of the slash
  // to the bottom of the slash (but quickly, in <0.3s)"): each slash is wiped away from its upper end (the right, at -28°) down to
  // its lower end behind a soft edge, 0.22 s, the second one a hair after the first.
  sl.forEach(s=>{ s.style.setProperty('--keep', '118%'); s.style.webkitMaskImage = s.style.maskImage = 'linear-gradient(90deg, #000 calc(var(--keep) - 18%), transparent var(--keep))'; });
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).to(sl, {scaleX:1, duration:.12, ease:'power3.out', stagger:.04})
    .to(sl, {'--keep':'0%', duration:.22, ease:'power1.in', stagger:.03}, '+=.1'));
};
// The raid boss roars at the start of the fight: deep-sea shock rings from the top, a dark tide vignette, bubbles, a shudder.
M.bossRoar = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const hp = hostPt(host), top = host ? host.getBoundingClientRect().top + 40 : 60;
  for(let i = 0; i < 3; i++) ring(hp.x, top, {color:'#1d6f7a', size:Math.min(700, hp.w*.9), width:6, dur:.9, delay:i*.18, from:.1});
  vignette('rgba(6,30,48,.85)', {host, peak:.85, hold:.4, outDur:.9});
  for(let i = 0; i < 14; i++) burst(hp.x + rnd(-hp.w*.42, hp.w*.42), hp.y + hp.h*.42, {n:1, colors:['rgba(190,240,255,.8)'], dist:[80, 200], spread:.2, angle:-Math.PI/2, dur:rnd(1, 1.6), size:rnd(5, 10), from:.6, to:1});
  if(host) shake(host, {amp:5, n:8, y:2, step:.05});
  return label(hp.x, top + 30, opts.text || 'The deep stirs…', 'good', {size:16, rise:10, hold:1, delay:.3}).then(()=> call(opts.onDone));
};
// Tentacle Smack (a whole column): a tentacle slams down the column from the top, then drags back up.
// 2026-10-15: a thick, tapering arm that curls at the tip, with a pale underside and a row of suckers.
const TENTACLE_SVG = (id)=> `<svg viewBox="0 0 100 300" preserveAspectRatio="none" width="100%" height="100%"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#3a1f4d"/><stop offset=".4" stop-color="#8a5aa8"/><stop offset=".7" stop-color="#6b3f8a"/><stop offset="1" stop-color="#2e1840"/></linearGradient></defs>
  <path d="M8,0 C4,90 22,170 28,230 C31,268 46,294 66,292 C84,290 90,268 78,258 C68,250 58,258 61,268 C50,258 54,238 56,224 C62,168 92,90 92,0 Z" fill="url(#${id})" stroke="#24112f" stroke-width="2"/>
  <path d="M52,0 C50,80 58,160 52,224 C50,238 48,252 56,262" fill="none" stroke="#e9b8d8" stroke-width="9" stroke-linecap="round" opacity=".55"/>
  ${[40, 80, 120, 160, 196, 226].map((y, i)=> `<ellipse cx="${55 - i*.4}" cy="${y}" rx="${8.5 - i*.9}" ry="${6 - i*.5}" fill="#f6d2ea" stroke="#7a4a92" stroke-width="1.6"/>`).join('')}</svg>`;
// 2026-10-15: clip a fixed overlay to a host's box (the battlefield), so arms and tails don't spill over the page around it.
function clipTo(h, hr){ if(!h || !hr || !hr.width) return; Object.assign(h.style, {width:VW() + 'px', height:VH() + 'px',
  clipPath:`inset(${Math.max(0, hr.top)}px ${Math.max(0, VW() - hr.right)}px ${Math.max(0, VH() - hr.bottom)}px ${Math.max(0, hr.left)}px)`}); }
M.tentacleSmack = function(cells, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  cells = (Array.isArray(cells) ? cells : [cells]).filter(Boolean);
  const rs = cells.map(e=> e.getBoundingClientRect ? e.getBoundingClientRect() : e), ref = rs[0] || {left:VW()/2 - 40, width:80, top:VH()/2, bottom:VH()/2 + 100};
  // 2026-10-15: with a host (the battlefield) the arm comes down from the host's top edge and is clipped to it.
  const hr = opts.host && opts.host.getBoundingClientRect ? opts.host.getBoundingClientRect() : null, top0 = hr ? Math.max(0, hr.top) : 0;
  const bottom = Math.max(...rs.map(r=> r.bottom)), w = Math.max(70, ref.width*1.5), x = ref.left + ref.width/2, H = bottom + 10 - top0;
  const h = lay('fxf-tent', `<i class="sh"></i><div class="tn">${TENTACLE_SVG('fxfT' + Math.floor(Math.random()*1e6))}</div>`, 4000), sh = h.children[0], tn = h.children[1];
  clipTo(h, hr);
  Object.assign(sh.style, {position:'absolute', left:(x - w*.6) + 'px', top:(bottom - 24) + 'px', width:(w*1.2) + 'px', height:'30px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(20,0,30,.55), transparent 70%)'});
  Object.assign(tn.style, {position:'absolute', left:(x - w/2) + 'px', top:top0 + 'px', width:w + 'px', height:H + 'px', transformOrigin:'50% 0%', filter:'drop-shadow(0 6px 10px rgba(0,0,0,.5))'});
  g.set(sh, {scale:.3, opacity:0}); g.set(tn, {y:-H, scaleY:.7});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(sh, {scale:1, opacity:1, duration:.3, ease:'power1.in'})
    .to(tn, {y:0, scaleY:1, duration:.2, ease:'power4.in'}, .22)
    .add(()=>{ ring(x, bottom - 20, {color:'#9fd6f5', size:w*2.2, width:5, dur:.5}); burst(x, bottom - 20, {n:16, colors:['#9fd6f5', '#d9f2ff', '#5aa9d6'], dist:[30, 90], spread:Math.PI*1.2, angle:-Math.PI/2, dur:.6, size:6, gravity:30});
      cells.forEach(e=>{ if(e.getBoundingClientRect && alive(e)) shake(e, {amp:4, n:4, y:3}); }); if(opts.host) shake(opts.host, {amp:4, n:5}); call(opts.onImpact); }, .42)
    .to(tn, {scaleY:.94, duration:.08, yoyo:true, repeat:1}, .42)
    .to(tn, {y:-H, duration:.4, ease:'power2.in'}, .85).to(sh, {opacity:0, duration:.3}, .85));
};
// Tail Sweep (every front-row card): a scaly tail sweeps across the row; each card is knocked as it passes.
css('tail', `.fxf .fxf-tail{position:absolute; left:0; top:0; height:42px; border-radius:46px 10px 10px 46px; border:2px solid #22311c;
  background:repeating-radial-gradient(circle at 50% -40%, rgba(0,0,0,0) 0 9px, rgba(20,40,15,.35) 9px 11px), linear-gradient(180deg, #a9c98f 0%, #5f8a4c 45%, #2f4a26 100%); box-shadow:0 8px 14px rgba(0,0,0,.5), inset 0 3px 0 rgba(255,255,255,.3);}
.fxf .fxf-tail::before{content:''; position:absolute; left:18px; right:30px; top:-14px; height:14px; background:conic-gradient(from 135deg at 50% 100%, #2f4a26 90deg, transparent 0) 0 0/20px 14px repeat-x;}
.fxf .fxf-tail::after{content:''; position:absolute; left:-30px; top:4px; border:15px solid transparent; border-right:32px solid #3f5a33;}
.fxf .fxf-whoosh{position:absolute; left:0; top:0; height:60px; border-radius:50%; border-top:4px solid rgba(255,255,255,.55); filter:blur(1px);}`);
M.tailSweep = function(cards, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  cards = (cards || []).filter(alive); const rs = cards.map(e=> e.getBoundingClientRect());
  const row = rs.length ? {left:Math.min(...rs.map(r=> r.left)), right:Math.max(...rs.map(r=> r.right)), y:rs.reduce((a, r)=> a + r.top + r.height/2, 0)/rs.length} : {left:VW()*.2, right:VW()*.8, y:VH()*.55};
  const W = (row.right - row.left)*.7 + 120, h = lay('fxf-tailh', '<i class="fxf-whoosh"></i><i class="fxf-tail"></i>', 4000), wh = h.children[0], tl2 = h.children[1];
  if(opts.host && opts.host.getBoundingClientRect) clipTo(h, opts.host.getBoundingClientRect());
  tl2.style.width = W + 'px'; wh.style.width = (W*1.2) + 'px';
  const x0 = row.left - W - 60, x1 = row.right + 60;
  g.set(tl2, {x:x0, y:row.y - 21, rotation:-6}); g.set(wh, {x:x0, y:row.y - 48, opacity:0});
  const t = g.timeline({onComplete:()=>{ h.remove(); finish(opts, done); }}); let done;
  t.to(tl2, {x:x1, rotation:6, duration:.65, ease:'power2.inOut'}).to(wh, {x:x1 - 40, opacity:.8, duration:.65, ease:'power2.inOut'}, 0).to(wh, {opacity:0, duration:.2}, .5)
   .to(tl2, {opacity:0, duration:.15}, .55);
  cards.forEach((e, i)=>{ const r = rs[i], u = Math.max(0, Math.min(1, (r.left + r.width/2 - x0) / (x1 - x0))); t.add(()=>{ const c = pt(e);
    burst(c.x, c.y + c.h*.3, {n:6, colors:['#cbb68f', '#8fb07a', '#fff'], dist:[10, 30], spread:1, angle:-Math.PI*.2, dur:.4, size:5, gravity:14});
    g.timeline({onComplete:()=> g.set(e, {clearProps:'transform'})}).to(e, {x:10, rotation:7, duration:.09}).to(e, {x:0, rotation:0, duration:.35, ease:'elastic.out(1.1, .4)'}); call(opts.onImpact); }, .65*u); });
  t.to({}, {duration:.3});
  return new Promise(res=> done = res);
};
// A raid stage crossed (Enraged at 75%, Exposed under 1%), A: a rally-horn banner and the screen shifts with it.
M.raidStageChange = function(host, opts){
  opts = opts || {}; const exposed = /expos/i.test(opts.stage || ''), hp = hostPt(host);
  if(exposed){
    vignette('rgba(120,220,255,.55)', {host, peak:.8, hold:.3});
    burst(hp.x, hp.y, {n:14, glyphs:['🛡️', '⚙️', '✦'], gsize:16, dist:[60, 180], dur:.9, spin:400, gravity:40});
    ring(hp.x, hp.y, {color:'#7ad7ff', size:Math.min(500, hp.w*.8), width:5, dur:.7});
  } else {
    vignette('rgba(170,20,10,.8)', {host, peak:.9, hold:.35});
    burst(hp.x, hp.y + 20, {n:16, colors:['#ff6a2a', '#ffcf6a', '#ff3b1a'], dist:[60, 200], dur:.9, size:5, glow:true, spread:Math.PI, angle:-Math.PI/2});
    if(host) shake(host, {amp:6, n:8});
  }
  return banner(exposed ? 'Exposed!' : 'Enraged!', {host, theme:exposed ? 'sky' : 'red', icon:'📯', sub:opts.sub || (exposed ? 'Its armour is cracked: abilities are off' : 'The boss hits harder now'), hold:1.1}).then(()=> call(opts.onDone));
};
// B: the whole view tints (red for Enraged, cold for Exposed) and a big stamp lands in the middle.
M.raidStageChange_B = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const exposed = /expos/i.test(opts.stage || ''), hp = hostPt(host), tgt = host || document.body;
  g.fromTo(tgt, {filter:'none'}, {filter:exposed ? 'saturate(.35) hue-rotate(160deg) brightness(1.05)' : 'saturate(1.6) sepia(.35) hue-rotate(-25deg)', duration:.25, yoyo:true, repeat:1, repeatDelay:.6, clearProps:'filter'});
  return stamp(hp.x, hp.y, exposed ? 'Exposed' : 'Enraged', {color:exposed ? 'teal' : undefined, size:40, hold:.9, rot:-8}).then(()=> call(opts.onDone));
};
// A raid part defeated: an ink cloud, bubbles, the part shudders and sinks for a beat, "Down" is stamped on it.
M.raidPartDown = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const c = pt(el);
  burst(c.x, c.y, {n:10, colors:['rgba(40,10,60,.75)', 'rgba(70,30,90,.6)'], dist:[10, 50], dur:.9, size:26, from:.4, to:1.6});
  for(let i = 0; i < 8; i++) burst(c.x + rnd(-c.w*.4, c.w*.4), c.y + c.h*.3, {n:1, colors:['rgba(200,240,255,.85)'], dist:[40, 90], spread:.25, angle:-Math.PI/2, dur:rnd(.8, 1.2), size:rnd(4, 8)});
  stamp(c.x, c.y, '💀 Down', {color:'ink', size:20, delay:.45, hold:.6});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'transform,filter'}); finish(opts, res); }})
    .to(el, {rotation:4, y:10, filter:'brightness(.6) saturate(.6)', duration:.5, ease:'power2.in'}).to(el, {rotation:0, y:0, filter:'brightness(1) saturate(1)', duration:.5, ease:'power2.out'}, '+=.5'));
};
// Raid HP bars: each bar fills in with a light sweep, or (opts.from) drains from the old value with a white damage ghost.
M.raidBars = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const fills = [...el.querySelectorAll('.rp-bar > span, .raid-boss-hp-bar-fill')].filter(f=> f.getBoundingClientRect().height);
  if(!fills.length) return Promise.resolve();
  if(opts.from != null){ // drain: a white ghost of what was lost, shrinking away
    const jobs = fills.map(f=>{ const r = f.getBoundingClientRect(), track = f.parentElement.getBoundingClientRect(), wOld = track.width*opts.from, lost = Math.max(0, wOld - r.width);
      if(lost < 1) return Promise.resolve();
      const h = lay('fxf-ghost', '<i></i>', 3000), gh = h.firstChild; Object.assign(gh.style, {position:'absolute', left:r.right + 'px', top:r.top + 'px', width:lost + 'px', height:r.height + 'px', background:'#fff', borderRadius:'0 3px 3px 0', transformOrigin:'0 50%'});
      return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); res(); }}).to(gh, {opacity:.9, duration:.1}).to(gh, {scaleX:0, background:'#ff8a7a', duration:.55, ease:'power2.in'}, '+=.25')); });
    return Promise.all(jobs).then(()=> call(opts.onDone));
  }
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(fills, {clearProps:'transform'}); finish(opts, res); }})
    .fromTo(fills, {scaleX:0, transformOrigin:'0 50%'}, {scaleX:1, duration:.55, ease:'power2.out', stagger:.08})
    .add(()=> fills.forEach((f, i)=> later(()=> sheen(f.parentElement || f, {dur:.45}), i*80)), .3));
};
// A raid feed entry: the row slides in with an ink ripple and a brief highlight.
M.raidFeedRow = function(row, opts){
  opts = opts || {}; const g = G(); if(!g || !row) return Promise.resolve();
  const r = row.getBoundingClientRect();
  ring(r.left + 16, r.top + r.height/2, {color:'#6b3f8a', size:40, dur:.5, delay:.15});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(row, {clearProps:'transform,opacity'}); finish(opts, res); }}).fromTo(row, {x:-30, opacity:0}, {x:0, opacity:1, duration:.35, ease:'power3.out', delay:opts.delay || 0}))
    .then(()=> sheen(row, {color:'rgba(190,160,255,.6)', dur:.5}));
};
// A raid reward claimed: an ink splash, pearls and coins burst from the button, the kraken bobs.
M.raidClaim = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el);
  burst(c.x, c.y, {n:8, colors:['rgba(40,10,60,.8)', 'rgba(90,40,120,.7)'], dist:[10, 46], dur:.7, size:20, from:.5, to:1.5});
  burst(c.x, c.y, {n:14, glyphs:['🪙', '⚪', '🦪', '✨'], gsize:16, dist:[40, 120], dur:.9, spin:300, gravity:50});
  ring(c.x, c.y, {color:'#b46bff', size:100});
  return Promise.all([glyph(c.x, c.y - 30, '🐙', {size:34, rise:20, hold:.7, onTl:(t, e)=> t.to(e, {rotation:10, duration:.15, yoyo:true, repeat:3}, .2)}), label(c.x, c.y - 70, opts.text || 'Claimed!', 'gold', {delay:.2})]).then(()=> call(opts.onDone));
};
// Core stumps armour each other (trench Core): armour links light up between them, a shield pulse runs along each link.
M.coreStumps = function(els, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  els = (els || []).filter(alive); if(els.length < 2) return Promise.resolve();
  const ps = els.map(e=> pt(e)), h = lay('fxf-links', `<svg width="${VW()}" height="${VH()}" style="position:absolute;left:0;top:0;overflow:visible">${ps.slice(1).map((p, i)=> `<line x1="${ps[i].x}" y1="${ps[i].y}" x2="${p.x}" y2="${p.y}" stroke="#7ad7ff" stroke-width="4" stroke-dasharray="8 7" stroke-linecap="round" style="filter:drop-shadow(0 0 5px #3da5ff)"/>`).join('')}</svg>`, 4000);
  const lines = h.querySelectorAll('line');
  els.forEach((e, i)=> later(()=> ring(ps[i].x, ps[i].y, {color:'#7ad7ff', size:Math.max(50, ps[i].w*.9), dur:.5}), i*120));
  ps.slice(1).forEach((p, i)=> later(()=> flyArc(ps[i], p, '🛡️', {n:1, size:16, dur:.45, lift:-6, spin:0, ring:false, bump:false}), 200 + i*150));
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).fromTo(lines, {opacity:0}, {opacity:1, duration:.2, stagger:.1}).to(lines, {attr:{'stroke-dashoffset':-60}, duration:1, ease:'none'}, 0).to(lines, {opacity:0, duration:.3}, '+=.1'));
};
// Endless dungeon: the next floor: a carved stone plaque drops in between two torches that flare.
css('plaque', `.fxf .fxf-plaque{position:absolute; left:0; top:0; padding:10px 22px; border-radius:8px; font:900 26px/1 'Baloo 2',sans-serif; letter-spacing:.08em; color:#2b2924; text-transform:uppercase;
  background:linear-gradient(180deg, #c9c6bb, #8f8c82); box-shadow:inset 0 2px 0 rgba(255,255,255,.4), inset 0 -3px 0 rgba(0,0,0,.25), 0 10px 20px rgba(0,0,0,.5); text-shadow:0 1px 0 rgba(255,255,255,.45); white-space:nowrap;}`);
M.dungeonFloor = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = opts.at || hostPt(host), h = lay('fxf-floor', `<div class="fxf-plaque">Floor ${esc(opts.floor || 2)}</div><div class="fxf-g" style="font-size:30px">🔥</div><div class="fxf-g" style="font-size:30px">🔥</div>`, 5000);
  const p = h.children[0], tL = h.children[1], tR = h.children[2], w = p.offsetWidth;
  g.set(p, {x:c.x - w/2, y:c.y - 240, opacity:0}); g.set([tL, tR], {x:(i)=> c.x + (i ? w/2 + 22 : -w/2 - 22), y:c.y + 6, xPercent:-50, yPercent:-50, scale:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(p, {opacity:1, duration:.05}).to(p, {y:c.y - 22, duration:.4, ease:'power3.in'}, 0)
    .add(()=>{ burst(c.x, c.y + 22, {n:14, colors:['#b9b6ab', '#8d8a80', '#e3dfd3'], dist:[20, 80], spread:Math.PI, angle:-Math.PI/2, dur:.6, size:6, gravity:16, shape:'chip'}); if(host) shake(host, {amp:3, n:4}); })
    .to(p, {y:c.y - 28, duration:.08, yoyo:true, repeat:1})
    .to([tL, tR], {scale:1.3, duration:.2, ease:'back.out(3)'}, .45).to([tL, tR], {scale:1, duration:.2})
    .to([tL, tR], {scaleY:1.15, duration:.12, yoyo:true, repeat:5, ease:'sine.inOut'})
    .to([p, tL, tR], {y:'-=30', opacity:0, duration:.35, ease:'power1.in'}, '+=.3'));
};
// A PvP ticket used: the ticket tears along its perforation and the stub flutters away.
css('ticket', `.fxf .fxf-ticket{position:absolute; left:0; top:0; width:120px; height:56px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:6px;
  background:radial-gradient(circle at 0 50%, transparent 8px, #f6d98a 9px) left/51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 8px, #f6d98a 9px) right/51% 100% no-repeat;
  color:#6b3a0c; font:900 15px/1 'Baloo 2',sans-serif; letter-spacing:.06em; filter:drop-shadow(0 6px 8px rgba(0,0,0,.45));}
.fxf .fxf-ticket::after{content:''; position:absolute; left:76%; top:6px; bottom:6px; border-left:2px dashed rgba(107,58,12,.55);}`);
M.pvpTicket = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = opts.at || hostPt(host), mk = ()=>{ const t = document.createElement('div'); t.className = 'fxf-ticket'; t.innerHTML = `<span style="font-family:${EMOJI}">🎟️</span>ARENA`; return t; };
  const h = lay('fxf-tix', '', 4000), a = mk(), b = mk(); h.appendChild(a); h.appendChild(b);
  a.style.clipPath = 'inset(0 24% 0 0)'; b.style.clipPath = 'inset(0 0 0 76%)';
  g.set([a, b], {x:c.x - 60, y:c.y - 28, scale:0, rotation:-6});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to([a, b], {scale:1, duration:.25, ease:'back.out(2)'})
    .to(b, {rotation:6, duration:.08, yoyo:true, repeat:3}, '+=.1')
    .add(()=>{ burst(c.x + 32, c.y, {n:6, colors:['#f6d98a', '#fff3c4'], dist:[8, 24], dur:.4, size:3, shape:'chip'}); label(c.x, c.y - 46, opts.text || '−1 🎟️', 'gold', {size:15}); })
    .to(b, {x:'+=40', y:'+=140', rotation:200, opacity:0, duration:.8, ease:'power1.in'})
    .to(a, {scale:.8, opacity:0, y:'-=20', duration:.4}, '-=.5'));
};
// PvP / ranked rating swing, A: the number rolls while arrows stream up (green) or down (red), the pill bumps.
M.pvpRating = function(el, opts){
  opts = opts || {}; if(!el) return Promise.resolve();
  const c = pt(el), d = opts.delta != null ? opts.delta : 12, up = d >= 0, col = up ? '#5bd16b' : '#ef5a4c';
  for(let i = 0; i < 6; i++) glyph(c.x + rnd(-c.w*.4, c.w*.4), c.y + (up ? 10 : -10), up ? '▲' : '▼', {cls:'fxf-label ' + (up ? 'is-good' : 'is-bad'), size:rnd(12, 18), rise:up ? rnd(30, 60) : -rnd(30, 60), hold:.6, delay:i*.07});
  ring(c.x, c.y, {color:col, size:Math.max(60, c.w*1.1), delay:.3});
  const num = [...(el.querySelectorAll ? el.querySelectorAll('*') : [])].concat([el]).find(x=> x.childElementCount === 0 && /\d/.test(x.textContent)) || el;
  return Promise.all([countRoll(num, 0, Math.abs(d), {dur:.7}), wait(650).then(()=> bump(el))]).then(()=> call(opts.onDone));
};
// B: a rank hex beside it fills (or drains); crossing a tier stamps "Tier up".
css('hex', `.fxf .fxf-hex{position:absolute; left:0; top:0; width:56px; height:64px; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); background:#2b2117; overflow:hidden; box-shadow:inset 0 0 0 3px #e9b44c;}
.fxf .fxf-hex i{position:absolute; left:0; right:0; bottom:0; height:100%; background:linear-gradient(0deg, #e9b44c, #ffe27a); transform-origin:50% 100%;}
.fxf .fxf-hex b{position:absolute; inset:0; display:grid; place-items:center; font:900 20px/1 'Baloo 2',sans-serif; color:#fff8e0; text-shadow:0 1px 2px rgba(0,0,0,.6);}`);
M.pvpRating_B = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), up = (opts.delta != null ? opts.delta : 12) >= 0, x = c.x + (el ? c.w*.5 + 40 : 0);
  const h = lay('fxf-hexh', `<div class="fxf-hex"><i></i><b>${esc(opts.tier || 'B')}</b></div>`, 5000), hx = h.firstChild, fill = hx.querySelector('i');
  g.set(hx, {x:x - 28, y:c.y - 32, scale:0}); g.set(fill, {scaleY:up ? .3 : .8});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(hx, {scale:1, duration:.25, ease:'back.out(2)'})
    .to(fill, {scaleY:up ? 1 : .35, background:up ? '' : 'linear-gradient(0deg, #a3221b, #ef5a4c)', duration:.7, ease:'power2.inOut'})
    .add(()=>{ if(opts.tierUp){ stamp(x, c.y + 50, 'Tier up!', {color:'gold', size:18, hold:.5}); burst(x, c.y, {n:14, colors:['#ffe27a', '#fff6c8'], dist:[30, 70], shape:'star', size:7, glow:true}); } else if(!up) burst(x, c.y + 20, {n:6, colors:['#ef5a4c', '#7a1a12'], dist:[10, 30], gravity:20, size:4}); })
    .to(hx, {scale:0, duration:.25}, '+=.7'));
};
// Gauntlet streak: a flame grows with the streak behind the streak badge; embers rise.
css('flame', `.fxf .fxf-flame{position:absolute; left:0; top:0; width:44px; height:64px; transform-origin:50% 100%;}
.fxf .fxf-flame i{position:absolute; left:50%; bottom:0; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; transform:translateX(-50%); animation:fxfFlick .16s ease-in-out infinite alternate; mix-blend-mode:screen;}
.fxf .fxf-flame i:nth-child(1){width:44px; height:64px; background:radial-gradient(ellipse at 50% 75%, rgba(255,90,20,.95), rgba(200,30,0,0) 70%);}
.fxf .fxf-flame i:nth-child(2){width:30px; height:46px; background:radial-gradient(ellipse at 50% 75%, rgba(255,190,60,.95), rgba(255,120,0,0) 70%); animation-duration:.13s;}
.fxf .fxf-flame i:nth-child(3){width:16px; height:26px; background:radial-gradient(ellipse at 50% 75%, #fff, rgba(255,240,180,0) 70%); animation-duration:.11s;}`);
M.gauntletStreak = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = el ? pt(el) : hostPt(opts.host), n = Math.max(1, opts.streak || 3), s = Math.min(2.4, .7 + n*.18), x = el ? c.r.left + 14 : c.x, y = c.y + (c.h || 0)*.3;
  const h = lay('fxf-flameh', '<div class="fxf-flame"><i></i><i></i><i></i></div>', 5000), f = h.firstChild;
  g.set(f, {x:x - 22, y:y - 64, scale:0});
  for(let i = 0; i < Math.min(14, 4 + n*2); i++) burst(x + rnd(-8, 8), y - 30*s, {n:1, colors:['#ffcf6a', '#ff6a2a'], dist:[40*s, 90*s], spread:.5, angle:-Math.PI/2, dur:rnd(.7, 1.1), size:3, glow:true, stagger:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(f, {scale:s, duration:.4, ease:'back.out(2)'}).to(f, {scale:s*1.08, duration:.2, yoyo:true, repeat:3, ease:'sine.inOut'})
    .add(()=> label(x + 40, y - 40*s, `🔥 ${esc(n)}`, 'gold', {size:16}), .2)
    .to(f, {scale:0, opacity:0, duration:.35}, '+=.1'));
};
// Whisper's Game / trigger badges: a bolt arcs from the trigger badge into the card and it sparks.
M.autobattleTrigger = function(el, opts){
  opts = opts || {}; const g = G(); if(!g || !el) return Promise.resolve();
  const t = tileOf(el), c = pt(t), badge = opts.badge || (el.querySelector && el.querySelector('.ab-trig')), a = badge && alive(badge) ? pt(badge) : {x:c.x, y:c.y - c.h*.45};
  const pts = [[a.x, a.y]]; for(let i = 1; i < 5; i++){ const u = i/5; pts.push([a.x + (c.x - a.x)*u + rnd(-10, 10), a.y + (c.y - a.y)*u + rnd(-6, 6)]); } pts.push([c.x, c.y]);
  const h = lay('fxf-bolt', `<svg width="${VW()}" height="${VH()}" style="position:absolute;left:0;top:0;overflow:visible"><polyline points="${pts.map(p=> p.join(',')).join(' ')}" fill="none" stroke="#fff6a0" stroke-width="3" stroke-linejoin="round" style="filter:drop-shadow(0 0 5px #ffe14a)"/></svg>`, 3000);
  const pl = h.querySelector('polyline');
  if(badge && alive(badge)) bump(badge, {sx:1.3, sy:.8});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .fromTo(pl, {opacity:0}, {opacity:1, duration:.04}).to(pl, {opacity:.2, duration:.05}).to(pl, {opacity:1, duration:.05})
    .add(()=>{ ring(c.x, c.y, {color:'#ffe14a', size:c.w*.9, dur:.35}); burst(c.x, c.y, {n:8, colors:['#fff6a0', '#ffe14a'], dist:[14, 40], dur:.35, size:3, glow:true, shape:'chip'}); })
    .to(pl, {opacity:0, duration:.18}, '+=.08'));
};

// ---------- future concepts (lab only, 2026-10-15) ----------
const cellsAround = (host, n)=>{ const c = hostPt(host), w = Math.min(70, (c.w || VW())/(n + 1)); return Array.from({length:n}, (_, i)=> ({x:c.x + (i - (n-1)/2)*(w + 10), y:c.y, w, h:w*1.25})); };
const cellBox = (h, b, style)=>{ const e = document.createElement('i'); Object.assign(e.style, {position:'absolute', left:(b.x - b.w/2) + 'px', top:(b.y - b.h/2) + 'px', width:b.w + 'px', height:b.h + 'px', borderRadius:'10px'}, style || {}); h.appendChild(e); return e; };
// Co-op: the partner hovers a shared cell: a faint hand in their colour, a dotted ring breathing round the cell.
M.coopSharedCell = function(cell, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const b = cell ? pt(cell) : cellsAround(opts.host, 1)[0], col = opts.color || '#7ad7ff', h = lay('fxf-coop1', '', 5000);
  const box = cellBox(h, {x:b.x, y:b.y, w:b.w + 10, h:b.h + 10}, {border:`3px dashed ${col}`, boxShadow:`0 0 14px ${col}`}), hand = document.createElement('div'); hand.className = 'fxf-g'; hand.textContent = '🖐️'; hand.style.fontSize = '30px'; hand.style.filter = `drop-shadow(0 0 6px ${col}) opacity(.75)`; h.appendChild(hand);
  g.set(hand, {x:b.x + 10, y:b.y + 6, xPercent:-50, yPercent:-50, opacity:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).fromTo(box, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.3})
    .to(hand, {opacity:.8, duration:.3}, 0).to(hand, {x:'-=10', y:'-=8', duration:.5, yoyo:true, repeat:3, ease:'sine.inOut'}, .2).to(box, {scale:1.04, duration:.5, yoyo:true, repeat:3, ease:'sine.inOut'}, .2)
    .to([box, hand], {opacity:0, duration:.3}));
};
// Co-op: a player locks in: a wax seal stamps onto their half.
M.coopLock = function(half, opts){
  opts = opts || {}; const c = half ? pt(half) : hostPt(opts.host);
  return glyph(c.x, c.y, '<span style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff7a6a,#9e1f1a 70%);box-shadow:0 0 0 4px rgba(120,20,15,.6),0 6px 12px rgba(0,0,0,.5);color:#ffe9d6;font:900 30px/1 Baloo\\ 2,sans-serif">✔</span>',
    {scale0:2.4, ease:'power4.in', inDur:.2, rise:0, hold:.9, rot0:-20, rot:-8, onTl:(t)=> t.add(()=>{ ring(c.x, c.y, {color:'#e0504a', size:110}); burst(c.x, c.y, {n:8, colors:['#9e1f1a', '#ff7a6a'], dist:[30, 60], size:5, gravity:10}); }, .2)})
    .then(()=> label(c.x, c.y - 60, opts.text || 'Ready!', 'good')).then(()=> call(opts.onDone));
};
// Co-op: four plays land together: cards drop A, B, C, D in a ripple.
M.coopResolve = function(cells, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const bs = cells && cells.length ? cells.map(pt) : cellsAround(opts.host, 4), h = lay('fxf-coop3', '', 5000), cols = ['#5bd16b', '#7ad7ff', '#ffd56e', '#ff9be3'];
  const cs = bs.map((b, i)=>{ const e = cellBox(h, b, {background:`linear-gradient(160deg, ${cols[i]}, #2b2117 140%)`, boxShadow:'0 6px 12px rgba(0,0,0,.45)', display:'grid', placeItems:'center', font:"900 24px/1 'Baloo 2',sans-serif", color:'#fff8e0'}); e.textContent = 'ABCD'[i]; g.set(e, {y:-120, opacity:0, rotation:rnd(-15, 15)}); return e; });
  const t = g.timeline({onComplete:()=>{ h.remove(); finish(opts, done); }}); let done;
  cs.forEach((e, i)=> t.to(e, {y:0, opacity:1, rotation:0, duration:.3, ease:'power3.in'}, i*.14).add(()=> burst(bs[i].x, bs[i].y + bs[i].h/2, {n:6, colors:['#d8cbb0', '#b5a68a'], dist:[10, 30], spread:Math.PI, angle:-Math.PI/2, size:5, dur:.4}), i*.14 + .3));
  t.to(cs, {opacity:0, duration:.3}, '+=.7');
  return new Promise(res=> done = res);
};
// Co-op: two players pick the same cell: they collide and the second bounces back to hand.
M.coopCellClash = function(cell, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const b = cell ? pt(cell) : cellsAround(opts.host, 1)[0], h = lay('fxf-coop4', '', 5000);
  const A = cellBox(h, b, {background:'linear-gradient(160deg,#5bd16b,#1d3d1a)'}), B = cellBox(h, b, {background:'linear-gradient(160deg,#7ad7ff,#14304a)'});
  g.set(A, {x:-90, rotation:-10}); g.set(B, {x:90, rotation:10});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to([A, B], {x:0, rotation:0, duration:.28, ease:'power3.in'})
    .add(()=>{ glyph(b.x, b.y - b.h*.6, '✕', {cls:'fxf-label is-bad', size:30, rise:6, hold:.4}); ring(b.x, b.y, {color:'#ef5a4c', size:90}); })
    .to(B, {x:60, y:160, rotation:40, opacity:0, duration:.6, ease:'power2.in'})
    .to(A, {opacity:0, duration:.3}, '+=.3'));
};
// Co-op floor mechanic: cursed shared cells glow red and a skull flickers in them.
M.coopFloorMechanic = function(cells, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const bs = cells && cells.length ? cells.map(pt) : cellsAround(opts.host, 3).filter((_, i)=> i !== 1), h = lay('fxf-coop5', '', 5000);
  const cs = bs.map(b=> cellBox(h, b, {background:'radial-gradient(circle, rgba(200,20,20,.55), rgba(90,0,0,.2) 70%)', boxShadow:'inset 0 0 0 2px rgba(255,80,60,.8), 0 0 18px rgba(255,40,30,.6)'}));
  bs.forEach((b, i)=> glyph(b.x, b.y, '☠️', {size:24, rise:0, hold:1.3, delay:.2 + i*.1}));
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).fromTo(cs, {opacity:0}, {opacity:1, duration:.3, stagger:.1}).to(cs, {opacity:.45, duration:.35, yoyo:true, repeat:3, ease:'sine.inOut'}).to(cs, {opacity:0, duration:.3}));
};
// Murgle's daily dungeons: a murky swamp gate: green fog rises, bubbles pop, the gate bars lift and the name is posted.
M.dngMurgle = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = hostPt(host), h = lay('fxf-murgle', '<i class="fog"></i><div class="bars"></div>', 6000), fog = h.children[0], bars = h.children[1], W = Math.min(260, (c.w || VW())*.6);
  Object.assign(fog.style, {position:'absolute', left:(c.x - W*.9) + 'px', top:(c.y - 40) + 'px', width:(W*1.8) + 'px', height:'140px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(90,140,60,.7), rgba(40,70,30,0) 70%)', filter:'blur(8px)'});
  Object.assign(bars.style, {position:'absolute', left:(c.x - W/2) + 'px', top:(c.y - 70) + 'px', width:W + 'px', height:'110px', background:'repeating-linear-gradient(90deg, #3a3a2a 0 8px, transparent 8px 30px)', borderTop:'8px solid #2b2b1f', borderRadius:'50% 50% 0 0 / 30% 30% 0 0'});
  for(let i = 0; i < 12; i++) burst(c.x + rnd(-W*.5, W*.5), c.y + 40, {n:1, colors:['rgba(170,220,120,.8)'], dist:[30, 90], spread:.2, angle:-Math.PI/2, dur:rnd(.8, 1.4), size:rnd(5, 10)});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .fromTo(fog, {opacity:0, y:30}, {opacity:1, y:0, duration:.6})
    .fromTo(bars, {opacity:0}, {opacity:1, duration:.2}, .1).to(bars, {y:-120, opacity:0, duration:.7, ease:'power2.in'}, .7)
    .add(()=> banner("Murgle's Bog", {host, theme:'green', icon:'🐸', sub:'Daily dungeon: murky, mean, rewarding', hold:.9}), .9)
    .to(fog, {opacity:0, duration:.6}, 2.2));
};
// Collection PvP at Map 60+: the cards whirl in a wild vortex of colour.
M.pvpMap60 = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const c = hostPt(host), h = lay('fxf-wild', '', 5000), n = 7, R = Math.min(120, (c.w || VW())*.3), s = {a:0, r:R};
  const cs = Array.from({length:n}, (_, i)=> cellBox(h, {x:c.x, y:c.y, w:36, h:48}, {background:`linear-gradient(160deg, hsl(${i*51},90%,62%), #2b2117 150%)`, boxShadow:'0 4px 10px rgba(0,0,0,.45)'}));
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }})
    .to(s, {a:Math.PI*4, duration:1.6, ease:'power1.inOut', onUpdate:()=> cs.forEach((e, i)=>{ const a = s.a + i/n*Math.PI*2; g.set(e, {x:Math.cos(a)*s.r, y:Math.sin(a)*s.r*.6, rotation:a*57, filter:`hue-rotate(${s.a*60}deg)`}); })})
    .to(s, {r:10, duration:.35, ease:'power2.in'}, 1.3)
    .add(()=>{ ring(c.x, c.y, {color:'#ff5fc8', size:200, width:5}); burst(c.x, c.y, {n:20, colors:['#ff5fc8', '#7ad7ff', '#ffd36e', '#8a4dff', '#5ee07a'], dist:[50, 140], shape:'star', size:9, glow:true}); label(c.x, c.y - 30, 'Wild!', 'gold'); }, 1.6)
    .to(cs, {opacity:0, duration:.2}, 1.6).to({}, {duration:.6}));
};
// World events, A: a rally-horn banner sweeps across every screen.
M.worldEvent = function(host, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const hp = hostPt(host), hr = host ? host.getBoundingClientRect() : {left:0, width:VW()};
  const h = lay('fxf-wev', `<div style="position:absolute; height:44px; display:flex; align-items:center; gap:12px; padding:0 22px; white-space:nowrap; font:900 20px/1 'Baloo 2',sans-serif; color:#fff8e0; text-shadow:0 2px 0 rgba(0,0,0,.4);
    background:linear-gradient(90deg, rgba(160,40,30,0), #a3271f 12%, #c8322a 50%, #a3271f 88%, rgba(160,40,30,0)); box-shadow:0 6px 18px rgba(0,0,0,.4)"><span style="font-family:${EMOJI}">📯</span>${esc(opts.text || 'World event: the Great Rally has begun!')}<span style="font-family:${EMOJI}">📯</span></div>`, 6000), band = h.firstChild;
  const w = band.offsetWidth;
  g.set(band, {x:hr.left + hr.width, y:hp.y - 22});
  for(let i = 0; i < 10; i++) glyph(hp.x + rnd(-hp.w*.35, hp.w*.35), hp.y + 60, ['🙌', '🎉', '✊'][i % 3], {size:16, rise:30, hold:.6, delay:.6 + i*.08});
  return new Promise(res=> g.timeline({onComplete:()=>{ h.remove(); finish(opts, res); }}).to(band, {x:hr.left + (hr.width - w)/2, duration:.55, ease:'power3.out'}).to(band, {x:'-=12', duration:1.2, ease:'none'}).to(band, {x:hr.left - w, duration:.45, ease:'power3.in'}));
};
// B: a signal flare rises, bursts in the sky and the event name hangs under it.
M.worldEvent_B = function(host, opts){
  opts = opts || {}; const hp = hostPt(host), top = host ? host.getBoundingClientRect().top + 50 : 80;
  return flyArc({x:hp.x - 40, y:hp.y + (hp.h || 300)*.4}, {x:hp.x, y:top}, '🎆', {n:1, size:20, dur:.6, lift:0, spin:0, ring:false}).then(()=>{
    burst(hp.x, top, {n:30, colors:['#ff6a3d', '#ffd23d', '#5ed66a', '#3da5ff', '#ff5fc8', '#ffffff'], dist:[50, 150], dur:1, shape:'star', size:7, glow:true, gravity:40});
    return banner(opts.text || 'The Great Rally', {host, at:{x:hp.x, y:top + 90}, theme:'ink', icon:'📯', sub:'A world event: every warband can join in', hold:1});
  }).then(()=> call(opts.onDone));
};

// ---------- game hooks (2026-10-15) ----------
// Battle events: the resource beats (non-Lumber gains fly to their pill; Lumber already has its own arc), Elemental Energy,
// Refine, Midas, the resource passives, Echo, trigger bolts, and the raid boss's roar / Tentacle Smack / Tail Sweep.
const $ = (s, r)=> (r || document).querySelector(s), $$ = (s, r)=> [...(r || document).querySelectorAll(s)];
const visible = el=> !!(el && alive(el) && getComputedStyle(el).visibility !== 'hidden');
function viewerIsA(env){ try{ if(typeof viewerHandPid === 'function' && env && env.match) return viewerHandPid(env.match) !== 2; }catch(e){} return true; }
const mineSide = (side, env)=> (side === 'A') === viewerIsA(env);
const PILL_ID = {lumber:'hudLumberPill', grace:'hudGracePill', devilry:'hudDevilryPill', stone:'hudStonePill', metal:'hudMetalPill', uranium:'hudUraniumPill', elemental:'hudElementalEnergyPill'};
const pillFor = (kind, side, env)=> document.getElementById(PILL_ID[kind] + (mineSide(side, env) ? '' : 'Enemy'));
const rowOf = (side, env)=> document.getElementById(mineSide(side, env) ? 'rowMine' : 'rowEnemy');
const cardsOn = (side, env)=> $$(':scope > .board-card[data-defid]', rowOf(side, env) || document.createElement('div'));
// Which passives a resource gain wakes up.
const PASSIVE_ON = {lumber:['lumberjack', 'timber'], stone:['rockSolid', 'heavyMetal'], metal:['ironWill', 'heavyMetal']};
const lastEcho = {};
M.onEvent = function(ev, env){
  if(!ev || !env || !env.fxAtLeast('med')) return;
  const t = ev.type;
  if(t === 'grace' || t === 'devilry' || t === 'stone' || t === 'metal' || t === 'uranium'){
    const el = ev.uid != null ? env.el(ev.uid) : null; if(!el) return;
    M.resourceGain_B(el, {kind:t, amount:ev.amount || 1, pill:pillFor(t, ev.side, env)});
  }
  if(t === 'lumber' && ev.cause === 'midas'){
    const victim = $(`.board-card[data-defid="${(root.CSS && CSS.escape) ? CSS.escape(String(ev.defId)) : ev.defId}"]`);
    M.midas(victim, {amount:ev.amount, at:env.battlefield, pill:pillFor('lumber', ev.side, env)});
  }
  if(PASSIVE_ON[t] && ev.side){ // the side's cards whose passive feeds on this resource
    cardsOn(ev.side, env).forEach(el=>{ const fx = env.fxOf(el.dataset.defid), uid = el.dataset.uid || el.dataset.defid;
      PASSIVE_ON[t].forEach(k=>{ if(fx && fx[k] && env.once('fxfPass:' + k + ':' + uid)) M.resourcePassive(el, {kind:k}); }); });
  }
  if(t === 'elementalEnergy'){ const el = env.el(ev.uid); if(el) M.elementalEnergy(el, {amount:ev.amount}); }
  if(t === 'triggerFired' && ev.uid != null){
    const el = env.el(ev.uid); if(!el) return;
    if(ev.action === 'refine') M.refine(el);
    else if(el.querySelector('.ab-trig') && env.once('fxfTrig:' + ev.uid)) M.autobattleTrigger(el);
  }
  if(t === 'exile' && ev.side){ // every card sent to the Removal Zone gives its owner one Echo
    const mine = mineSide(ev.side, env), w = document.getElementById(mine ? 'deckWidgetBottom' : 'deckWidgetTop') || (mine ? env.battlefield : null);
    if(w){ const now = Date.now(), k = mine ? 'm' : 'e'; const dx = (now - (lastEcho[k] || 0) < 400) ? 18 : 0; lastEcho[k] = now; M.echoGain(w, {dx}); }
  }
  if(t === 'raidBossUnit' && env.once('fxfRoar')) M.bossRoar(env.battlefield);
  if(t === 'raidSmack'){
    const row = rowOf('A', env); if(!row) return;
    if(ev.front){ M.tailSweep(cardsOn('A', env).filter(e=> e.querySelector('.card-tile')), {host:env.battlefield}); return; }
    const all = $$(':scope > .board-card', row), tele = all.filter(e=> e.classList.contains('raid-tele'));
    const col = tele.length ? tele : [all[Math.max(0, Math.min(all.length - 1, (ev.col | 0) + Math.floor(all.length/2)))]].filter(Boolean);
    const reserve = $$('#battlefieldInner .reserve-row.mine').map(r=> $$(':scope > .board-card', r)[all.indexOf(col[0])]).filter(Boolean);
    M.tentacleSmack(col.concat(reserve), {host:env.battlefield});
  }
};

// Non-battle moments: each is one fxHook('name', ...) line in arena_app.js.
const H = M.hooks;
const lowOK = env=> env.fxAtLeast('low'), medOK = env=> env.fxAtLeast('med');
const energyPill = ()=> [document.getElementById('energyPillPlay'), document.getElementById('energyPill')].find(visible) || null;
// A toast: the glint (B), and a themed flourish for the big moments that are still only toasts.
H.toast = (t, message, kind, env)=>{
  if(!lowOK(env) || !t) return;
  M.toastGlint(t, {kind});
  if(!medOK(env)) return;
  const m = String(message || '');
  later(()=>{ if(!alive(t)) return;
    if(/^🏰 A (new|spare) castle/.test(m)) M.castleDrop(t, {text:/spare/i.test(m) ? 'Spare castle' : 'New castle!'});
    else if(/^👑/.test(m)) M.bossLeader(t);
    else if(/^🎒/.test(m)) M.inventoryNew(t);
    else if(/^⚡ Max Energy is now/.test(m)){ const p = energyPill(); if(p) M.energyUpgrade(p); const pips = $('.stamina-panel .wp-stam-pips, .wp-stam-pips'); if(pips && alive(pips)) M.stamina(pips); }
  }, 320);
};
// XP and the account level (awardXp): the level-up gets the big ring-and-star moment; plain XP streams into the badge if it's on screen.
H.xpGain = (n, before, after, env)=>{
  if(!medOK(env)) return;
  const badge = document.getElementById('playerLevelBadge'), bar = badge && (badge.querySelector('.pl-bar') || badge);
  if(after > before) later(()=> M.accountLevel(visible(badge) ? badge : null, {level:after, sound:()=> env.sound('unlockChime')}), 450);
  else if(visible(bar)) M.xpGain(bar, {amount:n});
};
H.energySpend = (cost, env)=>{ const p = energyPill(); if(p && medOK(env)) M.energySpend(p, {cost}); };
H.energyTick = (cur, max, env)=>{ const p = energyPill(); if(p && medOK(env)) later(()=> M.energyTick(energyPill() || p, {full:cur >= max}), 80); };
H.energyRefill = (amount, which, rect, env)=>{ if(!medOK(env)) return; const from = rect && rect.width ? rect : null; // the button's rect, taken before the panel closes
  later(()=>{ const p = energyPill(); if(!p) return; if(which === 'epCapsule') M.energyCapsule(p, {amount, from:from && {x:from.left + from.width/2, y:from.top + from.height/2, w:from.width, h:from.height}}); else M.energyFree(p, {amount}); }, 60); };
H.nestEggPlaced = (eggId, env)=>{ if(!medOK(env)) return; later(()=>{ const el = $(`.hay-nest[data-egg="${CSS.escape(String(eggId))}"]`); if(el) M.nestEggPlace(el, {icon:(el.querySelector('.nest-thing') || {}).textContent}); }, 40); };
H.nestTrain = (cardId, env)=>{ if(!medOK(env)) return; later(()=>{ const ns = $$('.hay-nest.is-nurture'); const el = ns.find(n=> /--p:\s*0[;%]/.test(n.getAttribute('style') || '')) || ns[ns.length - 1]; if(el) M.nestKibble(el); }, 40); };
H.heroStat = (k, dir, env)=>{ if(!medOK(env) || dir <= 0) return; later(()=>{ const b = $(`[data-hstat="${k}"][data-dir="1"]`), row = b && b.closest('.hero-stat'), v = row && row.querySelector('.hs-val'); if(v) M.heroStatSpend(v, {from:b}); }, 30); };
H.heroSkillPick = (at, env)=>{ if(!medOK(env)) return; later(()=>{ const el = $$('.hero-skill.is-picked').find(e=> (e.querySelector('.hk-lv') || {}).textContent === 'Lv ' + at); if(el) M.heroSkillPick(el); }, 60); };
H.deckCardMoved = (id, remove, poolSel, listSel, env)=>{ if(!lowOK(env)) return;
  later(()=>{ const sel = `${remove ? poolSel : listSel} [data-defid="${CSS.escape(String(id))}"]`, el = $(sel); if(!el || !alive(el)) return; remove ? M.deckRemove(el) : M.deckAdd(el); }, remove ? 60 : 380); };
H.deckFull = (el, env)=>{ if(el && lowOK(env)) M.deckFull(el); };
H.deckHeroBanner = (el, env)=>{ if(el && medOK(env)) later(()=> M.deckHeroBanner(document.getElementById('deckHeroBanner') || el), 40); };
let revealAt = 0;
H.skillReveal = (key, env)=>{ if(!medOK(env)) return; const now = Date.now(), at = Math.max(now + 2400, revealAt + 1900); revealAt = at;
  const name = String(key || '').replace(/([A-Z])/g, ' $1').replace(/^./, c=> c.toUpperCase());
  later(()=> M.skillReveal(null, {name, sub:'Skill revealed'}), at - now); };
H.cardPop = (pop, src, env)=>{ if(pop && medOK(env)) M.cardPopIn(pop); };
H.cloudSync = (pill, ok, env)=>{ if(!pill || !lowOK(env)) return; const st = ok ? 'ok' : 'off'; if(pill._fxfSync === st) return; const first = pill._fxfSync == null; pill._fxfSync = st; if(!first || ok) M.cloudSync(pill, {ok}); };
H.banner = (el, env)=>{ if(el && lowOK(env)) M.bannerIn(el); };
// Dialogue: mood on every NPC line (and a ring when the speaker changes), the faction warning, the AFK goodbye, an act.
let lastSpeaker = null;
H.dialogueLine = (lineEl, line, id, env)=>{ if(!lineEl || !medOK(env)) return; line = line || {};
  const warn = /^warn:/.test(String(id || '')), changed = lastSpeaker != null && line.who !== lastSpeaker; lastSpeaker = line.who;
  M.portraitMood(lineEl, {text:line.text, warn, speakerChanged:changed});
  if(warn){ let fac = null; try{ fac = typeof loadFactionChoice === 'function' ? loadFactionChoice() : null; }catch(e){} M.factionWarning(lineEl, {faction:fac}); } };
H.dialogueAfk = (lineEl, env)=>{ if(lineEl && medOK(env)) M.afkLine(lineEl); };
H.dialogueAct = (act, env)=>{ if(medOK(env)) M.dialogueAct(document.getElementById('dialogueDock')); };
H.curioBubble = (el, env)=>{ if(el && lowOK(env)) M.curioBubble(el); };
H.errandOffer = (tid, env)=>{ if(medOK(env)) later(()=> M.errandOffer(document.querySelector('#dialogueDock .dlg-line:last-child') || document.getElementById('dialogueDock')), 500); };
H.noticeSwap = (rect, env)=>{ if(rect && medOK(env)) M.noticeSwap(rect); };
H.wandererDeal = (el, env)=>{ if(el && medOK(env)) M.wandererDeal(el); };
H.questProgress = (counter, n, env)=>{ const b = document.getElementById('homeQuestsBtn'); if(visible(b) && medOK(env)) M.questProgress(b); };
H.heldPacks = (n, env)=>{ if(n > 0 && medOK(env)) later(()=> M.heldPacks($('.map-spot[data-spot="deck"]'), {count:n}), 200); };
H.factionCrown = (faction, env)=>{ if(medOK(env)) M.factionCrown(null, {faction}); };
H.pvpTicketUsed = (env)=>{ if(medOK(env)) M.pvpTicket(null, {at:{x:VW()/2, y:VH()*.22}}); };
H.replayHits = (ov, env)=>{ if(ov && medOK(env)) $$('.rp-card.is-hit', ov).slice(0, 6).forEach((c, i)=> later(()=> M.trenchHit(c), i*60)); };
H.trenchRender = (ov, round, env)=>{ if(!ov || !medOK(env) || ov._fxfRound === round) return; ov._fxfRound = round;
  const ents = $$('.tr-card.is-entity', ov); if(ents.length >= 2 && (round <= 1 || round % 3 === 0)) later(()=> M.coreStumps(ents), 300); };
// The raid panel: stage changes, parts that went down since you last looked, the bars, and claim buttons.
const memo = {get(k){ try{ return localStorage.getItem('fxf:' + k); }catch(e){ return null; } }, set(k, v){ try{ localStorage.setItem('fxf:' + k, v); }catch(e){} }}; // per-viewer only
const barsShown = new Set();
H.raidPanel = (panel, def, env)=>{ if(!panel || !medOK(env)) return; const id = (def && def.id) || 'raid';
  const stage = ($('.r2-stage', panel) || {}).textContent || '', was = memo.get('stage:' + id);
  if(stage && was != null && was !== stage) later(()=> M.raidStageChange(panel, {stage}), 250); memo.set('stage:' + id, stage);
  const downs = $$('.r2-part.is-down', panel), wasDown = Number(memo.get('down:' + id) || 0);
  if(downs.length > wasDown && memo.get('down:' + id) != null) downs.slice(wasDown).forEach((p, i)=> later(()=> M.raidPartDown(p), 400 + i*500)); memo.set('down:' + id, String(downs.length));
  const fill = $('.raid-boss-hp-bar-fill', panel), frac = fill ? (parseFloat(fill.style.width) || 0)/100 : null, wasF = parseFloat(memo.get('hp:' + id));
  if(fill && !isNaN(wasF) && wasF > frac + .001) M.raidBars($('.r2-total', panel) || panel, {from:wasF}); else if(!barsShown.has(id)){ barsShown.add(id); M.raidBars(panel); } // 2026-10-15: the fill-in once per session, not on every re-render
  if(frac != null) memo.set('hp:' + id, String(frac));
  // capture: read the button's place before the claim re-renders the panel
  $$('[data-raid-claim]', panel).forEach(b=> b.addEventListener('click', ()=>{ const r = b.getBoundingClientRect(); later(()=> M.raidClaim({getBoundingClientRect:()=> r}), 30); }, {once:true, capture:true})); };
H.raidFeed = (el, env)=>{ if(!el || !medOK(env)) return; const first = $('.raid-attempt-row, :scope > div', el); if(!first) return;
  const key = first.textContent.slice(0, 80); if(el._fxfTop === key) return; const firstTime = el._fxfTop == null; el._fxfTop = key;
  $$(':scope > *', el).slice(0, firstTime ? 3 : 1).forEach((r, i)=> M.raidFeedRow(r, {delay:i*.08})); };
// The results screen, once per match: everything on it that used to be a plain line gets its moment, spaced out.
H.resultsShown = (card, m, env)=>{
  if(!card || !m || !medOK(env)) return;
  // the card is re-rendered while it's up, so every job looks its element up again when its turn comes
  const cur = ()=>{ const c = document.querySelector('.winloss-card'); return c && c.isConnected ? c : (card.isConnected ? card : null); };
  const sec = (c, head)=> [...c.querySelectorAll('.rw-sec')].find(s=> ((s.querySelector('.rw-head') || {}).textContent || '').trim() === head);
  const jobs = [], add = (find, run)=>{ if(find(card)) jobs.push(()=>{ const c = cur(), el = c && find(c); if(el) run(el === true ? c : el, c); }); };
  add(()=> m.winner === 0 && !m.raidFull && m.mode !== 'tutorial', (_, c)=> M.resDraw(c));
  add(()=> m.mode === 'tutorial', (_, c)=> M.tutorialResult(c, {won:m.winner === 1}));
  add(c=> c.querySelector('.wl-rank-lesson'), el=> M.rankLesson(el));
  add(c=> c.querySelector('.raid-rating-up, .raid-rating-down'), el=> M.pvpRating(el, {delta:m.pvpRatingDelta != null ? m.pvpRatingDelta : m.raidRatingDelta != null ? m.raidRatingDelta : m.liveRatingDelta}));
  add(c=> m.mode === 'gauntlet' && [...c.querySelectorAll('.conquest-rank-badge')].find(x=> /🔥/.test(x.textContent)), el=> M.gauntletStreak(el, {streak:m.gauntletStreakAfter}));
  add(c=> c.querySelector('.rw-scale'), el=> M.dragonScale(el));
  add(c=> c.querySelector('.rw-materia'), el=> M.materiaDrop(el));
  add(c=>{ const s = sec(c, 'Found'); return s && s.querySelector('.rw-act'); }, el=> M.nestEggDrop(el, {icon:el.textContent.trim().split(' ')[0] || '🥚'}));
  add(c=>{ const s = sec(c, 'Spare castle'); return s && s.querySelector('.rw-act'); }, el=> M.castleDrop(el, {text:/New castle/.test(el.textContent) ? 'New castle!' : 'Spare castle'}));
  add(c=> [...c.querySelectorAll('.rw-act')].find(x=> /Your character/.test(x.getAttribute('data-tip') || '')), el=> M.avatarUnlock(el));
  add(c=> c.querySelector('.rw-card.is-seen'), (_, c)=> [...c.querySelectorAll('.rw-card.is-seen')].slice(0, 3).forEach((s, i)=> later(()=> M.codexNew(s), i*180)));
  add(c=> c.querySelector('.winloss-achv'), el=> M.achvUnlocked(el));
  const nb = m.nextBattle && m.nextBattle.node, fl = m.winner === 1 && nb && /floor (\d+)/i.exec(nb.name || '');
  add(()=> !!fl, ()=> M.dungeonFloor(null, {floor:fl[1]}));
  add(c=> m.winner === 1 && !['tutorial', 'pc', 'sandbox'].includes(m.mode) && (c.querySelector('.wl-title') || true), el=> M.xpLine(el.classList && el.classList.contains('winloss-card') ? null : el, {amount:3}));
  jobs.slice(0, 6).forEach((fn, i)=> later(fn, 900 + i*750));
};

})(typeof window !== 'undefined' ? window : globalThis);
