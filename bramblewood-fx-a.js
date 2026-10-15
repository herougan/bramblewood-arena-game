/* ============================================================
   Bramblewood FX, batch A (2026-10-15): combat-attack, combat-skill
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.A: FX.A.someEffect(el, opts); variants are FX.A.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-a-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxa- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.A.onEvent / FX.A.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.A = FX.A || {};
const TAG = 'a';

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
// 2026-10-15 (batch A, combat attacks and skills): every attack and combat-skill moment gets a look of its own. The building
// blocks below (P, spray, ring, over, ghost, svgL, tag, nudge, flash) keep each effect to a few lines; every node they add
// removes itself when its tween ends, and every effect resolves a Promise when it is done (the Lab waits for it, the game never does).
const D2R = Math.PI/180;
const kill = e=>{ if(e && e.parentNode) e.remove(); };
const S = ()=> root.SkillFX || null;
const qpt = (a, m, b, t)=> ({x:(1-t)*(1-t)*a.x + 2*(1-t)*t*m.x + t*t*b.x, y:(1-t)*(1-t)*a.y + 2*(1-t)*t*m.y + t*t*b.y});
const angTo = (a, b)=> Math.atan2(b.y - a.y, b.x - a.x)/D2R;
const pick = arr=> arr[Math.floor(Math.random()*arr.length)];
css('base', `
.fxa-p{position:fixed; left:0; top:0; pointer-events:none; line-height:1; will-change:transform,opacity;}
.fxa-dot{width:6px; height:6px; border-radius:50%;}
.fxa-ring{position:fixed; left:0; top:0; border-radius:50%; border:3px solid #fff; box-sizing:border-box;}
.fxa-over{position:fixed; left:0; top:0; border-radius:12px; overflow:hidden;}
.fxa-ghost{position:fixed; left:0; top:0; transform-origin:0 0;} .fxa-ghost > .fxa-gi{width:100%; height:100%; position:relative;} .fxa-ghost .card-tile{margin:0 !important; position:relative !important;}
.fxa-svg{position:fixed; left:0; top:0; overflow:visible;}
.fxa-tag{position:fixed; left:0; top:0; padding:2px 8px; border-radius:999px; font:900 13px/1.25 'Baloo 2', system-ui, sans-serif; color:#fff; white-space:nowrap;
  box-shadow:0 0 0 2px rgba(255,255,255,.85), 0 3px 8px rgba(0,0,0,.45); letter-spacing:.02em;}
.fxa-glyph{font-size:22px; filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));}
.fxa-soft{border-radius:50%; opacity:.85;}
`);
// A fixed particle centred on (x, y).
function P(cls, html, x, y, set){
  const e = layer('fxa-p ' + (cls || ''), html); const g = G();
  if(g) g.set(e, Object.assign({x, y, xPercent:-50, yPercent:-50}, set || {})); return e;
}
// A burst of n particles flying out from (x, y): angles a0..a1 (deg), distances d0..d1, optional gravity and spin.
function spray(x, y, o){
  const g = G(); if(!g) return; o = o || {};
  const n = o.n || 8, val = (v, i)=> typeof v === 'function' ? v(i) : v;
  for(let i = 0; i < n; i++){
    const a = rnd(o.a0 == null ? 0 : o.a0, o.a1 == null ? 360 : o.a1)*D2R, d = rnd(o.d0 == null ? 12 : o.d0, o.d1 || 40);
    const html = val(o.html, i) || '';
    const e = P(o.cls || 'fxa-dot', html, x + rnd(-(o.jx||0), o.jx||0), y + rnd(-(o.jy||0), o.jy||0));
    if(o.color){ let col = val(o.color, i); if(!html && (o.cls === 'fxa-soft' || o.cls === 'fxa-puff') && !/gradient/.test(col)) col = `radial-gradient(circle, ${col} 0, ${col} 30%, rgba(0,0,0,0) 70%)`; e.style[html ? 'color' : 'background'] = col; }
    if(o.size){ const s = val(o.size, i); if(html) e.style.fontSize = s + 'px'; else { e.style.width = s + 'px'; e.style.height = s + 'px'; } }
    if(o.style) Object.assign(e.style, val(o.style, i));
    const dur = rnd(.8, 1.2)*(o.dur || .5), del = (o.delay || 0) + (o.stagger || 0)*i;
    const r0 = o.orient ? a/D2R + 90 : o.spin ? rnd(0, 360) : (o.rot || 0);
    g.set(e, {scale:o.s0 == null ? 1 : o.s0, rotation:r0, opacity:0});
    g.to(e, {opacity:o.op == null ? 1 : o.op, duration:.05, delay:del});
    g.to(e, {x:`+=${Math.cos(a)*d}`, y:`+=${Math.sin(a)*d + (o.grav || 0)}`, scale:o.s1 == null ? .3 : o.s1, rotation:o.spin ? `+=${rnd(-o.spin, o.spin)}` : r0,
      duration:dur, delay:del, ease:o.ease || 'power2.out'});
    g.to(e, {opacity:0, duration:dur*.45, delay:del + dur*.55, ease:'power1.in', onComplete:()=> kill(e)});
  }
}
// An expanding ring (or ellipse, sy < 1) at (x, y).
function ring(x, y, o){
  const g = G(); if(!g) return null; o = o || {};
  const f = o.from || 10, sy = o.sy || 1, e = P('fxa-ring', '', x, y, {width:f, height:f*sy, opacity:o.op == null ? 1 : o.op});
  e.style.borderColor = o.color || '#fff'; e.style.borderWidth = (o.w || 3) + 'px';
  if(o.fill) e.style.background = o.fill; if(o.glow) e.style.boxShadow = `0 0 ${o.glow}px ${o.color || '#fff'}`;
  if(o.dash) e.style.borderStyle = 'dashed';
  g.to(e, {width:o.size || 80, height:(o.size || 80)*sy, opacity:0, duration:(o.dur || 450)/1000, delay:(o.delay || 0)/1000, ease:o.ease || 'power2.out', onComplete:()=> kill(e)});
  return e;
}
// An overlay box sitting exactly over a card (pad px bigger on each side).
function over(el, cls, pad, html){
  const t = tileOf(el), c = centre(t), p = pad || 0, e = layer('fxa-over ' + (cls || ''), html);
  const g = G(); if(g) g.set(e, {x:c.r.left - p, y:c.r.top - p, width:c.w + p*2, height:c.h + p*2}); e._c = c; return e;
}
// A copy of a card tile laid over it (outer box: position and the stage's zoom; inner box: free to animate).
function ghost(el, cls){
  const t = tileOf(el), c = centre(t), W = t.offsetWidth || c.w, H = t.offsetHeight || c.h, z = c.w / (W || 1);
  const w = layer('fxa-ghost ' + (cls || '')), inner = document.createElement('div'); inner.className = 'fxa-gi'; w.appendChild(inner);
  const cl = t.cloneNode(true); cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach(n=> n.removeAttribute('id'));
  cl.style.width = W + 'px'; cl.style.height = H + 'px'; cl.style.transform = 'none'; cl.style.filter = 'none'; inner.appendChild(cl);
  const g = G(); if(g){ g.set(w, {x:c.r.left, y:c.r.top, width:W, height:H, scale:z}); g.set(inner, {transformOrigin:'50% 50%'}); }
  return {w, inner, c, z};
}
// A full-window SVG to draw strokes on.
function svgL(cls){
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'fxa fxa-svg ' + (cls || '')); s.setAttribute('aria-hidden', 'true');
  s.setAttribute('width', innerWidth); s.setAttribute('height', innerHeight); s.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
  document.body.appendChild(s); return s;
}
// A small coloured pill near the card's top corner ("½ Resist", "×2 Weak"...): pops, holds, floats off.
function tag(el, text, bg, o){
  o = o || {}; const g = G(), c = centre(tileOf(el));
  const e = P('fxa-tag', text, c.r.left + c.w*(o.fx == null ? .78 : o.fx), c.r.top + c.h*(o.fy == null ? .12 : o.fy), {scale:.3, opacity:0, rotation:o.rot || -6});
  e.style.background = bg || '#333'; if(o.color) e.style.color = o.color;
  if(!g){ later(()=> kill(e), 900); return e; }
  g.timeline({delay:(o.delay || 0)/1000, onComplete:()=> kill(e)}).to(e, {scale:1.15, opacity:1, duration:.14, ease:'back.out(3)'}).to(e, {scale:1, duration:.08})
    .to(e, {y:'-=14', opacity:0, duration:.35, delay:(o.hold || 620)/1000, ease:'power1.in'});
  return e;
}
// Additive nudges on the card (WAAPI composite:add on translate/rotate/scale), so they stack with the game's own GSAP lunges.
function nudge(el, frames, ms){
  const t = tileOf(el); if(!t || !t.animate) return;
  try{ t.animate(frames.map(f=> ({translate:`${f.x||0}px ${f.y||0}px`, rotate:`${f.r||0}deg`, scale:`${f.s == null ? 1 : f.s}`, offset:f.o})), {duration:ms || 300, easing:'ease-out', composite:'add'}); }catch(e){}
}
// A filter flash on the card (yoyo), cleared afterwards.
// The identity of a filter list (same functions, neutral values), so GSAP tweens it function by function instead of mixing them up.
const neutral = f=> f.replace(/(brightness|saturate|contrast|opacity)\([^)]*\)/g, '$1(1)').replace(/(grayscale|sepia|invert)\([^)]*\)/g, '$1(0)').replace(/hue-rotate\([^)]*\)/g, 'hue-rotate(0deg)').replace(/blur\([^)]*\)/g, 'blur(0px)');
function flash(el, filter, ms, rep){
  const g = G(), t = tileOf(el); if(!g || !t) return;
  g.fromTo(t, {filter:neutral(filter)}, {filter, duration:(ms || 120)/1000, yoyo:true, repeat:rep == null ? 1 : rep, ease:'power1.inOut', clearProps:'filter'});
}
M.neutralFilter = neutral;
const done = ms=> wait(ms);
// The colour sets each damage type (and the game's factions) draws with.
const TYPE = {
  physical:{c:'#f6e6c4', c2:'#a07c50', light:[1, .88, .62]},
  heat:    {c:'#ffd27a', c2:'#ff5a1f', light:[1, .55, .18]},
  cold:    {c:'#e6f7ff', c2:'#5fb4ff', light:[.45, .75, 1]},
  acid:    {c:'#f0ff7a', c2:'#9ccc1a', light:[.75, 1, .3]},
  poison:  {c:'#b8ff8f', c2:'#3fae3a', light:[.5, 1, .35]},
  decay:   {c:'#d6c2f0', c2:'#6e4f96', light:[.6, .45, .8]},
  magic:   {c:'#ffe28a', c2:'#a46bff', light:[.75, .5, 1]},
  water:   {c:'#d4f4ff', c2:'#2f9be0', light:[.35, .75, 1]},
  true:    {c:'#ffffff', c2:'#cfd3d8', light:[1, 1, 1]},
};
const FACTION = {
  Otter:{sparks:['#e0a35a', '#c4813a', '#3fb0a5', '#fff1d6'], name:'bronze'},
  Hummingbird:{sparks:['#ff4fa8', '#29d3ff', '#ffe14a', '#7dff6a', '#b06bff'], name:'jewel'},
  Ants:{sparks:['#e8ff5a', '#b4e02a', '#fffbd0'], name:'acid'}, Insect:{sparks:['#e8ff5a', '#b4e02a', '#fffbd0'], name:'acid'},
  Bee:{sparks:['#ffd23a', '#f59f1a', '#fff4c0'], name:'honey'}, Volcanic:{sparks:['#ff8a2a', '#ffd27a', '#ff3d1a'], name:'ember'},
  Flora:{sparks:['#9be15d', '#e9f56b', '#58b947'], name:'leaf'},
};
const factionOf = def=> ((def && def.archetypes) || []).map(a=> FACTION[a]).find(Boolean) || null;

// ======================= attacks: lunges (lab proposals for the faction take on animateAttacker) =======================
// B: Otters lunge straight and drilled: a crisp jab along the line with a bronze speed streak and no sideways lean.
M.lungeDrill = function(att, target, o){
  o = o || {}; const g = G(); if(!g || !att) return done(0);
  const t = tileOf(att), a = centre(t), b = centre(tileOf(target || att)), ang = angTo(a, b), ux = Math.cos(ang*D2R), uy = Math.sin(ang*D2R);
  g.timeline().to(t, {x:-ux*8, y:-uy*8, scale:.96, duration:.16, ease:'power2.in'}).to(t, {x:ux*22, y:uy*22, scale:1.04, duration:.08, ease:'power4.out'})
    .to(t, {x:0, y:0, scale:1, duration:.22, ease:'power2.out', clearProps:'transform'});
  later(()=>{ for(let i = 0; i < 3; i++){ const s = P('fxa-streak', '', a.x + ux*a.h*.5 + (i - 1)*uy*10, a.y + uy*a.h*.5 - (i - 1)*ux*10, {rotation:ang, scaleX:.2, opacity:.95});
    g.to(s, {x:`+=${ux*40}`, y:`+=${uy*40}`, scaleX:1, opacity:0, duration:.26, delay:i*.03, ease:'power2.out', onComplete:()=> kill(s)}); } }, 160);
  css('streak', `.fxa-streak{width:46px; height:3px; border-radius:3px; background:linear-gradient(90deg, rgba(224,163,90,0), #e0a35a 60%, #fff1d6);}`);
  return done(520);
};
// C: Hummingbirds dart in on an arc, leaving a jewel-coloured trail of afterimages.
M.lungeArc = function(att, target, o){
  const g = G(); if(!g || !att) return done(0);
  const t = tileOf(att), a = centre(t), b = centre(tileOf(target || att)), side = Math.random() < .5 ? -1 : 1;
  const dx = (b.x - a.x)*.35, dy = (b.y - a.y)*.35, path = {k:0};
  g.to(path, {k:1, duration:.32, ease:'power2.in', onUpdate:()=>{ const k = path.k, s = Math.sin(k*Math.PI); g.set(t, {x:dx*k + side*s*28, y:dy*k, rotation:side*s*10}); }});
  g.to(t, {x:0, y:0, rotation:0, duration:.24, delay:.34, ease:'power2.out', clearProps:'transform'});
  const cols = FACTION.Hummingbird.sparks;
  for(let i = 0; i < 5; i++) later(()=>{ const r = t.getBoundingClientRect(); const d = P('fxa-dot', '', r.left + r.width/2, r.top + r.height/2, {width:r.width*.5, height:r.width*.5, opacity:.5});
    d.style.background = `radial-gradient(circle, ${cols[i % cols.length]} 0, rgba(0,0,0,0) 70%)`; g.to(d, {scale:.2, opacity:0, duration:.35, onComplete:()=> kill(d)}); }, 40 + i*55);
  return done(640);
};
// D: beasts pounce low: a crouch, a flat leap, and a dust kick where they push off.
M.lungePounce = function(att, target, o){
  const g = G(); if(!g || !att) return done(0);
  const t = tileOf(att), a = centre(t), b = centre(tileOf(target || att)), dx = (b.x - a.x)*.3, dy = (b.y - a.y)*.3;
  g.timeline().to(t, {scaleY:.86, scaleX:1.06, y:a.y < b.y ? -4 : 4, transformOrigin:'50% 100%', duration:.18, ease:'power2.in'})
    .to(t, {x:dx, y:dy, scaleY:1.05, scaleX:.97, rotation:dx > 0 ? 6 : -6, duration:.14, ease:'power3.out'})
    .to(t, {x:0, y:0, scaleY:1, scaleX:1, rotation:0, duration:.26, ease:'power2.out', clearProps:'transform'});
  later(()=> spray(a.x, a.r.bottom - 6, {n:7, cls:'fxa-soft', size:()=> rnd(10, 18), color:'rgba(190,160,110,.8)', a0:180, a1:360, d0:10, d1:30, dur:.55, s0:.6, s1:1.6, op:.85}), 170);
  return done(620);
};

// ======================= attacks: impacts, resist / weak, crits =======================
// Resisted (½): a cool grey ward ring absorbs the blow and a "½ Resist" tag; Weak (×2): a red cracked starburst and "×2 Weak";
// Immune (0): the blow bounces off a glassy bubble.
css('resist', `
.fxa-ward{border-radius:50%; border:3px solid rgba(190,215,235,.95); background:radial-gradient(circle, rgba(200,225,245,.0) 50%, rgba(200,225,245,.35) 70%, rgba(200,225,245,0) 72%); box-shadow:0 0 14px rgba(170,205,235,.7);}
.fxa-star{width:80px; height:80px; clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}
.fxa-crack{fill:none; stroke-linecap:round; stroke-linejoin:round;}
.fxa-bubble{border-radius:50%; background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.85) 0, rgba(255,255,255,.12) 22%, rgba(180,220,255,.08) 60%, rgba(180,220,255,.5) 72%, rgba(180,220,255,0) 74%);}
`);
M.resistHit = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const w = P('fxa-ward', '', c.x, c.y, {width:c.w*1.25, height:c.w*1.25, scale:.5, opacity:0});
  g.timeline({onComplete:()=> kill(w)}).to(w, {scale:1, opacity:1, duration:.12, ease:'back.out(2)'}).to(w, {scale:.92, duration:.12}).to(w, {scale:1.25, opacity:0, duration:.3});
  spray(c.x, c.y - c.h*.1, {n:8, size:5, color:'#d7e8f5', d0:c.w*.45, d1:c.w*.65, dur:.4, s0:1, s1:.2});
  flash(el, 'grayscale(.6) brightness(1.1)', 140);
  tag(el, '½ Resist', 'linear-gradient(#6f8ea8, #45627c)', {delay:60});
  return done(1300);
};
M.weakHit = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const t = tileOf(el), c = centre(t);
  const st = P('fxa-star', '', c.x, c.y, {width:c.w*1.2, height:c.w*1.2, scale:.2, rotation:rnd(0, 40), opacity:1});
  st.style.background = 'radial-gradient(circle, #fff3c4 0, #ff7a3a 40%, #d81f2a 75%)';
  g.timeline({onComplete:()=> kill(st)}).to(st, {scale:1, duration:.1, ease:'power3.out'}).to(st, {scale:1.25, opacity:0, duration:.25});
  const sv = svgL(), path = ()=>{ let x = c.x + rnd(-c.w*.15, c.w*.15), y = c.r.top + c.h*.1, d = `M${x},${y}`; for(let i = 0; i < 5; i++){ x += rnd(-c.w*.18, c.w*.18); y += c.h*.16; d += ` L${x},${y}`; } return d; };
  sv.innerHTML = `<path class="fxa-crack" d="${path()}" stroke="#2a0606" stroke-width="5" opacity=".6"/><path class="fxa-crack" d="${path()}" stroke="#ff5040" stroke-width="2.5"/>`;
  g.fromTo(sv, {opacity:1}, {opacity:0, duration:.4, delay:.45, onComplete:()=> kill(sv)});
  nudge(el, [{x:0}, {x:-5, r:-2, o:.2}, {x:5, r:2, o:.45}, {x:-3, o:.7}, {x:0}], 340);
  spray(c.x, c.y, {n:10, size:()=> rnd(4, 7), color:i=> i % 2 ? '#ff5a3a' : '#ffd27a', d0:c.w*.4, d1:c.w*.8, dur:.45});
  tag(el, '×2 Weak', 'linear-gradient(#e2402e, #a0141c)', {delay:60});
  return done(1300);
};
M.immuneHit = function(el, o){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const b = P('fxa-bubble', '', c.x, c.y, {width:c.w*1.35, height:c.w*1.35, scale:.7, opacity:0});
  g.timeline({onComplete:()=> kill(b)}).to(b, {scale:1, opacity:1, duration:.14, ease:'back.out(2.4)'}).to(b, {scaleX:1.08, scaleY:.94, duration:.08, yoyo:true, repeat:1}).to(b, {opacity:0, scale:1.15, duration:.3, delay:.2});
  spray(c.x, c.r.top + c.h*.15, {n:6, size:5, color:'#e8f6ff', a0:200, a1:340, d0:20, d1:40, dur:.4});
  tag(el, 'Immune', 'linear-gradient(#7e8fa3, #4c5a6b)', {delay:60});
  return done(1300);
};
// The damage factor a hit got from Resist / Weakness / Immune, read off the two cards' data the same way the engine does it.
function hitFactor(ev, defs){
  const td = defs[ev.targetDefId], ad = defs[ev.attDefId]; if(!td) return 1;
  const e = td.effects || {}, t = ev.dmgType;
  const m = r=> (t && t !== 'physical' && r === t) || !!(ad && (ad.archetypes || []).includes(r)) || !!(ad && ad.effects && ad.effects[r]);
  if(e.ghost && (t === 'physical' || t == null)) return 0;
  if((e.immune || []).some(m)) return 0;
  let f = 1;
  if([...(td.resist || []), ...(e.resist || []), ...(e.dry ? ['heat'] : [])].some(m)) f *= .5;
  let wk = e.weakness || []; if(e.rabid) wk = wk.concat(['swimmer', 'water']); if(wk.some(m)) f *= 2;
  return f;
}
M.hitFactor = hitFactor;
// Crit sparks in the attacker's colours: bronze for Otters, a jewel prism for Hummingbirds, acid for ants, honey for bees.
css('crit', `.fxa-spark{width:3px; height:16px; border-radius:2px;} .fxa-flare{border-radius:50%; mix-blend-mode:screen;}`);
M.critSparks = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), cols = o.colors || (o.faction && FACTION[o.faction] ? FACTION[o.faction].sparks : ['#ffd56e', '#fff3c4', '#ff9a2a']);
  const f = P('fxa-flare', '', c.x, c.y, {width:c.w*1.3, height:c.w*1.3, scale:.2, opacity:1});
  f.style.background = `radial-gradient(circle, #fff 0, ${cols[0]} 30%, rgba(0,0,0,0) 68%)`;
  g.to(f, {scale:1.1, opacity:0, duration:.32, ease:'power2.out', onComplete:()=> kill(f)});
  for(let i = 0; i < 14; i++){ const a = i/14*360 + rnd(-8, 8), d = c.w*rnd(.55, .9), s = P('fxa-spark', '', c.x, c.y, {rotation:a + 90, scaleY:.4});
    s.style.background = `linear-gradient(${cols[i % cols.length]}, #fff)`; s.style.boxShadow = `0 0 6px ${cols[i % cols.length]}`;
    g.to(s, {x:`+=${Math.cos(a*D2R)*d}`, y:`+=${Math.sin(a*D2R)*d}`, scaleY:1, duration:.22, ease:'power3.out'}); g.to(s, {opacity:0, scaleY:.2, duration:.2, delay:.2, onComplete:()=> kill(s)}); }
  return done(500);
};
// Heavy blow (8+), B: after the hit-stop a shockwave ring (SkillFX.shockwave, built 2026-10-14 and never called) rolls out of the
// card and shoves its neighbours a little. High effects only; once a round per target. (2026-10-15)
M.heavyShock = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), F = S();
  if(F && F.shockwave) F.shockwave(el, {size:Math.max(160, c.w*3.2), duration:560, cards:o.cards || []});
  else { ring(c.x, c.y, {color:'#fff4d8', size:c.w*2.6, w:4, glow:12, dur:520}); ring(c.x, c.y, {color:'#ffd27a', size:c.w*1.8, w:2, dur:420, delay:70}); }
  flash(el, 'brightness(1.5) contrast(1.15)', 80);
  return done(700);
};
M.critSparks_B = (el, o)=> M.critSparks(el, Object.assign({faction:'Otter'}, o));
M.critSparks_C = (el, o)=> M.critSparks(el, Object.assign({faction:'Hummingbird'}, o));

// ======================= damage types: what each type looks like where it lands =======================
css('dmg', `
.fxa-pit{width:10px; height:10px; border-radius:50%; background:radial-gradient(circle, #1d2405 0, #3f5208 45%, rgba(160,200,30,.6) 70%, rgba(160,200,30,0) 72%);}
.fxa-wisp{width:14px; height:22px; border-radius:50%; background:radial-gradient(ellipse, rgba(225,235,200,.75), rgba(225,235,200,0) 70%);}
.fxa-bub{width:8px; height:8px; border-radius:50%; border:1.5px solid rgba(240,255,140,.95); background:rgba(220,255,90,.25);}
.fxa-puff{width:34px; height:34px; border-radius:50%;}
.fxa-mould{width:26px; height:26px; border-radius:50%; background:radial-gradient(circle, rgba(230,215,250,.9) 0, rgba(140,105,185,.75) 35%, rgba(90,62,128,.4) 60%, rgba(90,62,128,0) 72%);}
.fxa-rune{fill:none; stroke:#ffe28a; stroke-width:2.5;}
.fxa-runeglyph{font:900 15px/1 serif; color:#ffe9a8; text-shadow:0 0 6px #a46bff, 0 0 2px #fff;}
.fxa-ray{width:4px; height:40px; border-radius:3px; transform-origin:50% 100%;}
.fxa-drop{width:6px; height:9px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:linear-gradient(#e8fbff, #39a8ea);}
.fxa-curl{border-radius:0 100% 0 0 / 0 100% 0 0; border-top:6px solid #e9fbff; border-right:6px solid #bdeeff; background:linear-gradient(200deg, rgba(90,190,245,.75), rgba(40,130,220,.15) 70%);}
`);
// Physical (B, a proposal; the live look is the light and ➶): dust puffs and wood splinters.
M.impactPhysical = function(el){
  const c = centre(tileOf(el));
  spray(c.x, c.r.bottom - c.h*.12, {n:5, cls:'fxa-soft', size:()=> rnd(10, 16), color:'rgba(214,190,150,.7)', a0:180, a1:360, d0:12, d1:c.w*.45, dur:.6, s0:.5, s1:1.5, op:.75});
  spray(c.x, c.y, {n:6, size:()=> rnd(3, 5), color:'#8a6238', style:{height:'10px', borderRadius:'2px'}, spin:200, d0:c.w*.3, d1:c.w*.6, grav:16, dur:.5});
  return done(700);
};
M.impactHeat = function(el){
  const c = centre(tileOf(el));
  ring(c.x, c.y, {color:'#ffb347', size:c.w*1.2, w:3, glow:10, dur:380});
  spray(c.x, c.y + c.h*.15, {n:12, size:()=> rnd(3, 6), color:i=> i % 3 ? '#ffb347' : '#ff5a1f', style:{boxShadow:'0 0 6px #ff8a2a'}, a0:220, a1:320, d0:c.h*.3, d1:c.h*.7, dur:.8, s1:.2, ease:'power1.out'});
  return done(900);
};
M.impactCold = function(el){
  const c = centre(tileOf(el));
  spray(c.x, c.y, {n:9, html:'✦', size:()=> rnd(9, 15), color:'#e6f7ff', style:{textShadow:'0 0 6px #5fb4ff'}, d0:c.w*.3, d1:c.w*.6, dur:.6, s0:.4, s1:1});
  spray(c.x, c.r.top + c.h*.25, {n:4, cls:'fxa-soft', size:24, color:'rgba(235,248,255,.7)', a0:240, a1:300, d0:14, d1:30, dur:.8, s0:.4, s1:1.8, op:.75});
  return done(900);
};
// Acid: it fizzes. Bubbles hiss up off the card and three pit marks smoke where it ate in (the ants' acid-battery colour).
M.impactAcid = function(el){
  const g = G(); if(!g || !el) return done(0); const t = tileOf(el), c = centre(t);
  flash(el, 'sepia(.5) hue-rotate(40deg) saturate(1.8) brightness(1.15)', 110);
  for(let i = 0; i < 3; i++){ const x = c.r.left + c.w*rnd(.22, .78), y = c.r.top + c.h*rnd(.3, .75), p = P('fxa-pit', '', x, y, {scale:.2, opacity:0});
    g.timeline({delay:i*.06, onComplete:()=> kill(p)}).to(p, {scale:1.3, opacity:1, duration:.12}).to(p, {opacity:0, duration:.4, delay:.45});
    spray(x, y - 4, {n:2, cls:'fxa-wisp', a0:260, a1:280, d0:18, d1:30, dur:.9, s0:.5, s1:1.6, delay:.1 + i*.06, op:.8}); }
  spray(c.x, c.y + c.h*.2, {n:12, cls:'fxa-bub', jx:c.w*.35, jy:c.h*.15, a0:255, a1:285, d0:c.h*.25, d1:c.h*.6, dur:.7, s0:.5, s1:1.2, stagger:.025, ease:'power1.out'});
  return done(1000);
};
// Poison: a toxic green puff blooms and droplets drip off.
M.impactPoison = function(el){
  const c = centre(tileOf(el));
  spray(c.x, c.y, {n:6, cls:'fxa-puff', color:()=> `radial-gradient(circle, rgba(160,255,110,.85) 0, rgba(70,170,60,.55) 45%, rgba(40,110,40,0) 72%)`, d0:6, d1:c.w*.32, dur:.75, s0:.4, s1:2, op:.9});
  spray(c.x, c.r.top + c.h*.65, {n:6, cls:'fxa-drop', style:{background:'linear-gradient(#d6ffb0, #3fae3a)'}, jx:c.w*.3, a0:85, a1:95, d0:12, d1:26, grav:18, dur:.6, s0:1, s1:.6, stagger:.05, ease:'power2.in'});
  flash(el, 'hue-rotate(60deg) saturate(1.6) brightness(1.05)', 120);
  return done(950);
};
// Decay: violet mould blooms in fuzzy patches on the card and spores drift off (Morel Hollow).
M.impactDecay = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  for(let i = 0; i < 4; i++){ const x = c.r.left + c.w*rnd(.15, .85), y = c.r.top + c.h*rnd(.2, .85), m = P('fxa-mould', '', x, y, {scale:.1, opacity:0});
    g.timeline({delay:i*.07, onComplete:()=> kill(m)}).to(m, {scale:rnd(1, 1.6), opacity:.95, duration:.35, ease:'power1.out'}).to(m, {opacity:0, duration:.45, delay:.25});
    spray(x, y, {n:3, size:3, color:'#e2d4f6', a0:240, a1:300, d0:16, d1:34, dur:1, delay:.25 + i*.07, s1:.6}); }
  flash(el, 'saturate(.4) brightness(.85) hue-rotate(-20deg)', 160);
  return done(1750);
};
// Magic (Map 50+): A a violet-gold rune circle spins down onto the card and bursts; B a prism starburst; C glyph motes orbit and collapse.
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᛁᛃᛇᛉᛊᛏᛒ';
M.impactMagic = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), R = c.w*.62;
  const sv = svgL(); sv.innerHTML = `<g transform="translate(${c.x},${c.y})"><g class="r"><circle class="fxa-rune" r="${R}" stroke-dasharray="6 5" style="filter:drop-shadow(0 0 4px #a46bff)"/><circle class="fxa-rune" r="${R*.78}" stroke="#c9a2ff" stroke-width="1.5"/>
    ${[...Array(8)].map((_, i)=>{ const a = i/8*Math.PI*2; return `<text x="${Math.cos(a)*R*.89}" y="${Math.sin(a)*R*.89 + 5}" text-anchor="middle" font-size="13" fill="#ffe9a8" style="font-family:serif">${RUNES[i*2 % RUNES.length]}</text>`; }).join('')}</g></g>`;
  const rg = sv.querySelector('.r'); g.set(rg, {transformOrigin:'0 0', scale:1.6, opacity:0, rotation:-60});
  g.timeline({onComplete:()=> kill(sv)}).to(rg, {scale:1, opacity:1, rotation:0, duration:.3, ease:'power2.out'}).to(rg, {scale:.25, rotation:90, opacity:0, duration:.22, ease:'power2.in'});
  later(()=>{ ring(c.x, c.y, {color:'#ffe28a', size:c.w*1.5, w:3, glow:12, dur:420}); ring(c.x, c.y, {color:'#a46bff', size:c.w*1.1, w:2, dur:380, delay:60});
    spray(c.x, c.y, {n:12, html:'✦', size:()=> rnd(8, 14), color:i=> i % 2 ? '#ffe28a' : '#c9a2ff', d0:c.w*.3, d1:c.w*.75, dur:.55, spin:180});
    flash(el, 'brightness(1.4) saturate(1.4) hue-rotate(-30deg)', 100); }, 500);
  return done(1100);
};
M.impactMagic_B = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), cols = ['#ff5e7e', '#ffb14a', '#fff35a', '#5dff8a', '#4ad8ff', '#8a6bff', '#ff6bf2', '#ffffff'];
  for(let i = 0; i < 8; i++){ const r = P('fxa-ray', '', c.x, c.y, {rotation:i*45 + 22, yPercent:-100, scaleY:.1, opacity:1}); r.style.background = `linear-gradient(${cols[i]}, rgba(255,255,255,0))`; r.style.height = c.w*.75 + 'px';
    g.timeline({onComplete:()=> kill(r)}).to(r, {scaleY:1, duration:.16, ease:'power3.out'}).to(r, {opacity:0, scaleY:1.2, duration:.3}); }
  spray(c.x, c.y, {n:14, html:'✧', size:()=> rnd(8, 16), color:i=> cols[i % cols.length], d0:c.w*.4, d1:c.w*.9, dur:.6, spin:240});
  flash(el, 'brightness(1.5) saturate(1.6)', 90);
  return done(800);
};
M.impactMagic_C = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), R = c.w*.75, st = {a:0, r:R};
  const motes = [...Array(6)].map((_, i)=>{ const m = P('fxa-runeglyph', RUNES[(i*3) % RUNES.length], c.x, c.y, {opacity:0}); return m; });
  g.to(motes, {opacity:1, duration:.12});
  g.to(st, {a:Math.PI*2.2, r:4, duration:.6, ease:'power2.in', onUpdate:()=> motes.forEach((m, i)=> g.set(m, {x:c.x + Math.cos(st.a + i/6*Math.PI*2)*st.r, y:c.y + Math.sin(st.a + i/6*Math.PI*2)*st.r*.8})),
    onComplete:()=>{ motes.forEach(kill); ring(c.x, c.y, {color:'#c9a2ff', size:c.w*1.4, w:4, glow:14, dur:420}); spray(c.x, c.y, {n:10, size:5, color:'#ffe28a', d0:c.w*.3, d1:c.w*.7, dur:.45});
      flash(el, 'brightness(1.5) hue-rotate(-40deg)', 90); }});
  return done(1050);
};
// Water: A spray and a caustic ripple; B a wave curls over the card and slaps it; C a burst of drops and a puddle ripple under it.
M.impactWater = function(el, o){
  o = o || {}; const c = centre(tileOf(el)), g = G();
  // 2026-10-15: a white-blue splash crown first, so it reads at phone size
  if(g){ const sp = P('fxa-soft', '', c.x, c.y, {width:c.w*1.1, height:c.w*1.1, scale:.2, opacity:1}); sp.style.background = 'radial-gradient(circle, rgba(255,255,255,.95) 0, rgba(150,220,255,.8) 35%, rgba(47,155,224,.35) 58%, rgba(47,155,224,0) 70%)';
    g.timeline({onComplete:()=> kill(sp)}).to(sp, {scale:1, duration:.14, ease:'power3.out'}).to(sp, {opacity:0, scale:1.2, duration:.3}); }
  spray(c.x, c.y, {n:14, cls:'fxa-drop', size:()=> rnd(7, 10), style:{height:'13px'}, a0:200, a1:340, d0:c.w*.35, d1:c.w*.8, grav:34, dur:.65, s0:1, s1:.7, ease:'power1.out'});
  ring(c.x, c.y, {color:'rgba(170,230,255,.95)', size:c.w*1.3, sy:.55, w:3, dur:520}); ring(c.x, c.y, {color:'rgba(120,200,255,.8)', size:c.w*.9, sy:.55, w:2, dur:480, delay:120});
  flash(el, 'brightness(1.15) saturate(1.3) hue-rotate(-15deg)', 110);
  return done(800);
};
M.impactWater_B = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), dir = o.dir || (Math.random() < .5 ? -1 : 1);
  const cu = P('fxa-curl', '', c.x - dir*c.w*.7, c.y, {width:c.w*.8, height:c.h*.8, scaleX:dir, opacity:0});
  g.timeline({onComplete:()=> kill(cu)}).to(cu, {opacity:1, duration:.08}).to(cu, {x:`+=${dir*c.w*.8}`, rotation:dir*30, duration:.28, ease:'power2.in'}).to(cu, {opacity:0, scale:1.2, duration:.2});
  later(()=>{ spray(c.x + dir*c.w*.2, c.y, {n:12, size:()=> rnd(4, 7), color:'#effcff', a0:dir > 0 ? -60 : 120, a1:dir > 0 ? 60 : 240, d0:20, d1:c.w*.6, dur:.5}); nudge(el, [{x:0}, {x:dir*7, r:dir*3, o:.3}, {x:0}], 320); }, 300);
  return done(800);
};
M.impactWater_C = function(el){
  const c = centre(tileOf(el));
  spray(c.x, c.y - c.h*.1, {n:16, cls:'fxa-drop', d0:c.w*.35, d1:c.w*.75, grav:40, dur:.65, s1:.5});
  for(let i = 0; i < 3; i++) ring(c.x, c.r.bottom - 4, {color:'rgba(160,220,255,.9)', size:c.w*(1 + i*.35), sy:.3, w:2, dur:600, delay:i*120});
  return done(900);
};
// True damage: colourless. A a white crack across the card; B a negative flash and a hairline slash; C a white void ring folds in, then out.
M.impactTrue = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const sv = svgL(); let x = c.r.left + c.w*.1, y = c.r.top + c.h*rnd(.25, .45), d = `M${x},${y}`;
  for(let i = 0; i < 6; i++){ x += c.w*.14; y += rnd(-c.h*.12, c.h*.12); d += ` L${x},${y}`; }
  sv.innerHTML = `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" style="filter:drop-shadow(0 0 5px #fff) drop-shadow(0 0 2px #000)"/>`;
  const p = sv.querySelector('path'), L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
  g.timeline({onComplete:()=> kill(sv)}).to(p, {strokeDashoffset:0, duration:.12, ease:'power3.out'}).to(sv, {opacity:0, duration:.35, delay:.35});
  flash(el, 'grayscale(1) brightness(1.6) contrast(1.3)', 110);
  return done(800);
};
M.impactTrue_B = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  flash(el, 'invert(1) grayscale(1)', 70, 1);
  const s = P('fxa-p', '', c.x, c.y, {width:c.w*1.4, height:2, rotation:-28, scaleX:0}); s.style.background = '#fff'; s.style.boxShadow = '0 0 8px #fff';
  g.timeline({onComplete:()=> kill(s)}).to(s, {scaleX:1, duration:.08, ease:'power4.out'}).to(s, {opacity:0, scaleY:3, duration:.3});
  return done(600);
};
M.impactTrue_C = function(el){
  const c = centre(tileOf(el));
  const r = ring(c.x, c.y, {color:'#fff', size:6, from:c.w*1.5, w:5, glow:10, dur:220, ease:'power3.in'});
  later(()=>{ ring(c.x, c.y, {color:'#fff', size:c.w*1.6, w:3, glow:8, dur:420}); flash(el, 'grayscale(1) brightness(1.5)', 100); }, 220);
  return done(800);
};
M.IMPACT = {physical:M.impactPhysical, heat:M.impactHeat, cold:M.impactCold, acid:M.impactAcid, poison:M.impactPoison, decay:M.impactDecay, magic:M.impactMagic, water:M.impactWater, true:M.impactTrue};

// ======================= ranged: a real missile per damage type =======================
// cold → SkillFX.frostBolt (an ice shard), poison → SkillFX.dart (a dripping green dart), acid → SkillFX.boltGlob acid spit; stone,
// ember, spore, star, droplet and a white streak are drawn here. Each arcs, trails, and lands with its type's impact.
css('missile', `
.fxa-stone{width:15px; height:14px; border-radius:45% 55% 50% 50%; background:radial-gradient(circle at 35% 30%, #f2ece2, #9a9184 55%, #4a443d); box-shadow:0 0 0 1.5px rgba(30,24,18,.75), 0 2px 4px rgba(0,0,0,.55);}
.fxa-ember{width:16px; height:16px; border-radius:50%; background:radial-gradient(circle, #fff6c8 0, #ffb347 40%, #ff5a1f 75%); box-shadow:0 0 12px 4px rgba(255,120,30,.7);}
.fxa-spore{width:16px; height:16px; border-radius:50%; background:radial-gradient(circle, #efe3ff 0, #a383d6 45%, #5a3e86 80%); box-shadow:0 0 10px 3px rgba(160,120,220,.6);}
.fxa-starm{font-size:22px; color:#ffe28a; text-shadow:0 0 8px #a46bff, 0 0 3px #fff;}
.fxa-dropm{width:13px; height:18px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:linear-gradient(#f0fdff, #2f9be0); box-shadow:0 0 8px rgba(80,180,255,.7);}
.fxa-whitem{width:42px; height:4px; border-radius:3px; background:linear-gradient(90deg, rgba(255,255,255,0), #fff); box-shadow:0 0 8px #fff;}
`);
const MISSILE = {physical:{cls:'fxa-stone', arc:.35, trail:'rgba(200,180,150,.6)'}, heat:{cls:'fxa-ember', arc:.2, trail:'#ffb347'}, decay:{cls:'fxa-spore', arc:.25, trail:'rgba(200,170,240,.7)'},
  magic:{cls:'fxa-starm', html:'✦', arc:.15, trail:'#ffe28a', spin:true}, water:{cls:'fxa-dropm', arc:.3, trail:'rgba(180,230,255,.8)'}, true:{cls:'fxa-whitem', arc:0, trail:null, aim:true}};
M.missile = function(from, to, o){
  o = o || {}; const g = G(), type = o.type || 'physical', flight = o.flight || 420, F = S();
  if(!g || !from || !to){ later(o.onImpact, flight); return done(flight); }
  const land = ()=>{ call(o.onImpact); if(o.impact !== false && M.IMPACT[type] && type !== 'physical') M.IMPACT[type](to); else if(o.impact !== false) M.impactPhysical(to); };
  if(type === 'cold' && F && F.frostBolt){ F.frostBolt(from, to, {flight, onImpact:()=> call(o.onImpact)}); return done(flight + 600); }
  if(type === 'poison' && F && F.dart){ F.dart(from, to, {flight, onImpact:()=>{ call(o.onImpact); M.impactPoison(to); }}); return done(flight + 900); }
  if(type === 'acid' && F && F.boltGlob){ F.boltGlob(from, to, {element:'acid', flight, onImpact:()=>{ call(o.onImpact); M.impactAcid(to); }}); return done(flight + 1000); }
  const L = MISSILE[type] || MISSILE.physical, a = centre(from), b = centre(tileOf(to)), aim = {x:b.r.left + b.w*rnd(.38, .62), y:b.r.top + b.h*rnd(.38, .6)};
  const m = {x:(a.x + aim.x)/2, y:(a.y + aim.y)/2 - Math.abs(aim.x - a.x)*L.arc - 30*L.arc*2}, st = {t:0};
  const p = P(L.cls, L.html || '', a.x, a.y); let k = 0, last = a;
  g.timeline({onComplete:()=>{ kill(p); land(); }}).to(st, {t:1, duration:flight/1000, ease:'power1.in', onUpdate:()=>{
    const q = qpt(a, m, aim, st.t); g.set(p, {x:q.x, y:q.y, rotation:L.aim ? angTo(last, q) : L.spin ? st.t*540 : 0});
    if(L.trail && !(k++ % 2)){ const d = P('fxa-dot', '', q.x, q.y, {width:9, height:9, opacity:.9}); d.style.background = L.trail; d.style.boxShadow = '0 0 4px ' + L.trail; g.to(d, {scale:.2, opacity:0, duration:.4, onComplete:()=> kill(d)}); }
    last = q; }});
  return done(flight + 900);
};
// B: the old look, a glyph sliding across (kept for comparison).
M.missile_B = function(from, to, o){
  o = o || {}; const g = G(); if(!g) return done(0); const a = centre(from), b = centre(tileOf(to)), glyph = {cold:'❄', heat:'🔥', acid:'🧪', poison:'☠', decay:'🦠', magic:'🪄', water:'💧'}[o.type] || '➶';
  const p = P('fxa-glyph', glyph, a.x, a.y, {opacity:1}); g.to(p, {x:b.x, y:b.y, scale:1.15, opacity:.15, rotation:rnd(-20, 20), duration:(o.flight || 420)/1000, ease:'power1.in', onComplete:()=>{ kill(p); call(o.onImpact); }});
  return done((o.flight || 420) + 200);
};

// ======================= arrows: Ice Arrow, Volley rain =======================
// Ice Arrow: the arrow itself turns frost-blue with a snowflake trail, and it lands in a burst of rime. With overlayOnly the game's
// own bowShot is already in the air; this dresses that arrow (the newest .sfx-arrow) and adds the trail and the frost.
css('icearrow', `.fxa-ice-arrow{filter:hue-rotate(170deg) saturate(2.2) brightness(1.35) drop-shadow(0 0 6px #8fd4ff) !important;}`);
M.iceArrow = function(shooter, target, o){
  o = o || {}; const g = G(), F = S(), draw = o.draw || 240, flight = o.flight || 260; if(!g || !target) return done(0);
  if(!o.overlayOnly && F && F.bowShot) F.bowShot(shooter, target, {draw, flight, onImpact:o.onImpact});
  let arrow = null; later(()=>{ const as = document.querySelectorAll('.sfx-arrow'); arrow = as[as.length - 1] || null; if(arrow) arrow.classList.add('fxa-ice-arrow'); }, 20);
  const tick = ()=>{ if(!arrow || !arrow.isConnected) return; const r = arrow.getBoundingClientRect(); const f = P('fxa-p', '❄', r.left + r.width*.3, r.top + r.height/2, {opacity:.95, scale:rnd(.5, .8)});
    f.style.color = '#e6f7ff'; f.style.fontSize = '11px'; f.style.textShadow = '0 0 5px #5fb4ff'; g.to(f, {y:'+=14', rotation:rnd(-90, 90), opacity:0, duration:.55, onComplete:()=> kill(f)}); };
  for(let i = 0; i < 6; i++) later(tick, draw + i*flight/6);
  later(()=>{ const c = centre(tileOf(target)); ring(c.x, c.y, {color:'#bfe6ff', size:c.w*1.3, w:3, glow:10, dur:520});
    spray(c.x, c.y, {n:10, html:'❄', size:()=> rnd(9, 14), color:'#e6f7ff', style:{textShadow:'0 0 5px #5fb4ff'}, d0:c.w*.3, d1:c.w*.65, dur:.6, spin:160});
    const t = tileOf(target); t.classList.add('sfx-frosted'); later(()=> t.classList.remove('sfx-frosted'), 900); }, draw + flight);
  return done(draw + flight + 800);
};
// Volley: the archer looses three lofted arrows (SkillFX.volley) and a dark cloud of arrows arcs over and rains on the whole line.
css('rain', `.fxa-rainarrow{width:2px; height:16px; background:linear-gradient(#3b2a1a, #1a120a); border-radius:1px;} .fxa-rainarrow::after{content:''; position:absolute; left:-3px; bottom:-3px; border:4px solid transparent; border-top:6px solid #c9c9c9;}`);
M.arrowRain = function(shooter, targets, o){
  o = o || {}; const g = G(), F = S(), list = (targets || []).filter(Boolean); if(!g || !shooter || !list.length) return done(0);
  if(F && F.volley && o.lead !== false) F.volley(shooter, list.slice(0, 3), {draw:o.draw || 200, flight:o.flight || 320});
  const a = centre(shooter), cs = list.map(t=> centre(tileOf(t))), top = Math.min(...cs.map(c=> c.r.top)) - 120;
  for(let i = 0; i < 16; i++){
    const c = cs[i % cs.length], ex = c.r.left + c.w*rnd(.1, .9), ey = c.r.top + c.h*rnd(.15, .85), mx = (a.x + ex)/2 + rnd(-40, 40), my = Math.min(top, a.y - 160) + rnd(-30, 30);
    const ar = P('fxa-rainarrow', '', a.x, a.y, {opacity:0}), st = {t:0}, del = .12 + i*.035, A = {x:a.x, y:a.y - 10}, Mx = {x:mx, y:my}, B = {x:ex, y:ey};
    let prev = A;
    g.to(ar, {opacity:1, duration:.05, delay:del});
    g.to(st, {t:1, duration:.62, delay:del, ease:'power1.in', onUpdate:()=>{ const q = qpt(A, Mx, B, st.t); g.set(ar, {x:q.x, y:q.y, rotation:angTo(prev, q) - 90}); prev = q; },
      onComplete:()=>{ g.to(ar, {opacity:0, duration:.25, delay:.15, onComplete:()=> kill(ar)}); spray(ex, ey, {n:3, size:3, color:'#c8a878', a0:200, a1:340, d0:6, d1:14, dur:.3}); }});
  }
  return done(1500);
};

// ======================= melee extras =======================
// A prong at the castle: the tines thrust into the wall (SkillFX.forkProngs) and stone chips spit back out.
M.prongCastle = function(att, castle, o){
  o = o || {}; const F = S(); if(!castle) return done(0); const c = centre(tileOf(castle));
  if(F && F.forkProngs) F.forkProngs(att, [castle], {kind:o.kind || 'fork'});
  later(()=>{ spray(c.x, c.y, {n:10, size:()=> rnd(4, 7), color:i=> i % 2 ? '#9a948a' : '#d1c8b8', style:{borderRadius:'2px'}, spin:220, a0:180, a1:360, d0:c.w*.3, d1:c.w*.7, grav:30, dur:.6});
    spray(c.x, c.r.bottom - 8, {n:5, cls:'fxa-soft', size:20, color:'rgba(200,190,170,.7)', d0:8, d1:c.w*.5, dur:.7, s0:.5, s1:1.7, a0:180, a1:360});
    nudge(castle, [{x:0}, {x:-4, o:.2}, {x:3, o:.5}, {x:0}], 300); }, o.delay == null ? 260 : o.delay);
  return done(1100);
};
// Crab Claws: a coral claw opens beside the card and snaps shut on the side it pinches.
css('crab', `.fxa-claw path{stroke:#6d1d12; stroke-width:2;}`);
M.crabPinch = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), dir = o.dir === 'left' ? -1 : 1, x = c.x + dir*c.w*.62, y = c.y, s = c.w*.55;
  const sv = svgL('fxa-claw');
  sv.innerHTML = `<g transform="translate(${x},${y}) scale(${dir * s/60},${s/60})"><g class="j1"><path d="M-30,0 C-10,-34 26,-30 34,-8 C20,-14 4,-12 -10,0 Z" fill="#e8553a"/></g>
    <g class="j2"><path d="M-30,0 C-10,30 22,28 30,8 C18,12 4,10 -10,0 Z" fill="#c8402a"/></g><circle cx="-30" cy="0" r="9" fill="#d84a30"/></g>`;
  const j1 = sv.querySelector('.j1'), j2 = sv.querySelector('.j2'); g.set([j1, j2], {svgOrigin:'-30 0'}); g.set(j1, {rotation:-28}); g.set(j2, {rotation:28}); g.set(sv, {opacity:0});
  g.timeline({onComplete:()=> kill(sv)}).to(sv, {opacity:1, duration:.08}).to([j1, j2], {rotation:0, duration:.09, ease:'power4.in', delay:.12})
    .add(()=>{ spray(x - dir*s*.2, y, {n:6, html:'✦', size:10, color:'#fff2c4', d0:10, d1:24, dur:.3}); nudge(el, [{x:0}, {x:dir*6, o:.25}, {x:0}], 260); })
    .to([j1, j2], {rotation:i=> i ? 10 : -10, duration:.08}).to([j1, j2], {rotation:0, duration:.06}).to(sv, {opacity:0, duration:.25, delay:.2});
  return done(800);
};
// Ambush: the attacker goes to shadow with two glinting eyes, then springs out of a burst of dark smoke.
css('ambush', `.fxa-eyes{font:900 12px/1 system-ui; color:#ffe14a; letter-spacing:6px; text-shadow:0 0 6px #ffcf2a;} .fxa-shade{background:rgba(10,8,16,.82); border-radius:12px;}`);
M.ambushStrike = function(att, target, o){
  const g = G(); if(!g || !att) return done(0); const c = centre(tileOf(att));
  const sh = over(att, 'fxa-shade', 3), ey = P('fxa-eyes', '● ●', c.x, c.r.top + c.h*.36, {opacity:0, scaleY:.2});
  g.set(sh, {opacity:0});
  g.timeline({onComplete:()=>{ kill(sh); kill(ey); }}).to(sh, {opacity:1, duration:.1}).to(ey, {opacity:1, scaleY:1, duration:.08}).to(ey, {scaleY:.1, duration:.05, delay:.15}).to(ey, {scaleY:1, duration:.05})
    .add(()=>{ spray(c.x, c.r.bottom - 10, {n:8, cls:'fxa-puff', color:'radial-gradient(circle, rgba(40,32,48,.9) 0, rgba(40,32,48,0) 70%)', a0:180, a1:360, d0:10, d1:c.w*.6, dur:.7, s0:.5, s1:2.2});
      if(target){ const b = centre(tileOf(target)), s = P('fxa-p', '', (c.x + b.x)/2, (c.y + b.y)/2, {width:Math.hypot(b.x - c.x, b.y - c.y)*.8, height:4, rotation:angTo(c, b), scaleX:0});
        s.style.background = 'linear-gradient(90deg, rgba(20,16,28,0), #1a1424 40%, #fff)'; g.timeline({onComplete:()=> kill(s)}).to(s, {scaleX:1, duration:.1}).to(s, {opacity:0, duration:.2}); } }, '+=0.05')
    .to(sh, {opacity:0, duration:.18}).to(ey, {opacity:0, duration:.1}, '<');
  return done(800);
};
// Swift: the Hummingbird blur. Three jewel-tinted afterimages smear behind the attacker and snap back into it.
css('swift', `.fxa-after{mix-blend-mode:screen; opacity:.5;}`);
M.swiftBlur = function(att, target, o){
  const g = G(); if(!g || !att) return done(0); const a = centre(tileOf(att)), b = target ? centre(tileOf(target)) : {x:a.x, y:a.y - 100}, ang = angTo(a, b);
  const cols = ['hue-rotate(300deg) saturate(2.4)', 'hue-rotate(160deg) saturate(2.4)', 'hue-rotate(40deg) saturate(2.6)'];
  cols.forEach((f, i)=>{ const gh = ghost(att, 'fxa-after'); gh.inner.style.filter = f + ' brightness(1.2)';
    g.fromTo(gh.inner, {x:0, y:0, opacity:.55}, {x:-Math.cos(ang*D2R)*(18 + i*14), y:-Math.sin(ang*D2R)*(18 + i*14), opacity:0, duration:.34, delay:i*.04, ease:'power2.out', onComplete:()=> kill(gh.w)}); });
  for(let i = 0; i < 4; i++){ const s = P('fxa-p', '', a.x + rnd(-a.w*.3, a.w*.3), a.y + rnd(-a.h*.3, a.h*.3), {width:30, height:2, rotation:ang, opacity:.9}); s.style.background = '#fff';
    g.to(s, {x:`-=${Math.cos(ang*D2R)*30}`, y:`-=${Math.sin(ang*D2R)*30}`, opacity:0, duration:.25, delay:i*.03, onComplete:()=> kill(s)}); }
  return done(500);
};
// Attacking a Scare unit: the attacker sweats, a wobbling "!" pops over it and it shrinks back before it swings.
M.fearTell = function(att){
  const g = G(); if(!g || !att) return done(0); const c = centre(tileOf(att));
  const ex = P('fxa-glyph', '❗', c.x, c.r.top - 4, {scale:.3, opacity:0}); ex.style.fontSize = '20px';
  g.timeline({onComplete:()=> kill(ex)}).to(ex, {scale:1, opacity:1, duration:.12, ease:'back.out(3)'}).to(ex, {rotation:12, duration:.06, yoyo:true, repeat:5}).to(ex, {opacity:0, y:'-=8', duration:.2});
  spray(c.r.left + c.w*.82, c.r.top + c.h*.2, {n:3, cls:'fxa-drop', style:{background:'linear-gradient(#ffffff, #8fd0ff)'}, a0:-40, a1:20, d0:12, d1:22, grav:14, dur:.5, stagger:.1});
  nudge(att, [{s:1}, {s:.94, y:4, o:.3}, {s:.95, y:3, o:.7}, {s:1}], 520);
  return done(700);
};
// Guardian takes the hit: a bronze shield slides into the line in front of the guardian and the blow's path bends to it.
css('guard', `.fxa-shield{width:30px; height:36px; border-radius:6px 6px 50% 50%; background:linear-gradient(135deg, #f0c27a, #b5782f 55%, #7a4a18); box-shadow:inset 0 0 0 3px #ffe0a8, 0 0 0 2px #5a3410, 0 3px 6px rgba(0,0,0,.45);}
.fxa-shield::after{content:''; position:absolute; left:50%; top:22%; width:10px; height:14px; transform:translateX(-50%); border-radius:2px 2px 50% 50%; background:#3fb0a5;}`);
M.guardPull = function(att, guard, o){
  o = o || {}; const g = G(); if(!g || !guard) return done(0); const b = centre(tileOf(guard)), a = att ? centre(tileOf(att)) : {x:b.x, y:b.y - 140};
  const from = o.from ? centre(tileOf(o.from)) : {x:a.x + (b.x - a.x)*.5 + 60, y:(a.y + b.y)/2};
  const sv = svgL(); sv.innerHTML = `<path d="M${a.x},${a.y} Q${from.x},${from.y} ${b.x},${b.y}" fill="none" stroke="#e0a35a" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" style="filter:drop-shadow(0 0 3px #7a4a18)"/>`;
  const p = sv.firstChild, L = p.getTotalLength ? p.getTotalLength() : 300; p.style.strokeDashoffset = L;
  g.timeline({onComplete:()=> kill(sv)}).to(p, {strokeDashoffset:0, duration:.3, ease:'power2.out'}).to(sv, {opacity:0, duration:.3, delay:.25});
  const fy = b.y + (a.y < b.y ? -1 : 1)*b.h*.42, sh = P('fxa-shield', '', b.x - b.w*.9, fy, {opacity:0, rotation:-30});
  g.timeline({onComplete:()=> kill(sh)}).to(sh, {x:b.x, opacity:1, rotation:0, duration:.22, ease:'back.out(1.8)'})
    .add(()=>{ ring(b.x, fy, {color:'#ffe0a8', size:70, w:3, dur:320}); spray(b.x, fy, {n:7, cls:'fxa-spark', color:'#ffe08a', d0:14, d1:30, dur:.3, orient:true}); }).to(sh, {opacity:0, y:'+=6', duration:.3, delay:.35});
  return done(1000);
};
// Recoil: the attacker is jolted back by its own swing: a red 💢 burst and short impact lines.
M.recoilJolt = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const b = P('fxa-glyph', '💢', c.r.left + c.w*.75, c.r.top + c.h*.25, {scale:.3, opacity:0});
  g.timeline({onComplete:()=> kill(b)}).to(b, {scale:1.3, opacity:1, duration:.1, ease:'back.out(3)'}).to(b, {scale:1, duration:.08}).to(b, {opacity:0, duration:.25, delay:.25});
  spray(c.x, c.y, {n:8, cls:'fxa-spark', color:'#ff4a3a', d0:c.w*.45, d1:c.w*.65, dur:.25, s0:.6, s1:.2, orient:true});
  nudge(el, [{x:0}, {y:6, r:-3, o:.2}, {y:-2, r:1, o:.6}, {x:0}], 320);
  return done(700);
};
// Spite: a thorny black-green vine whips from the dying unit to its killer and snaps.
M.spiteLash = function(victim, killer){
  const g = G(); if(!g || !victim || !killer) return done(0); const a = centre(tileOf(victim)), b = centre(tileOf(killer));
  const m = {x:(a.x + b.x)/2 + rnd(-50, 50), y:(a.y + b.y)/2 + rnd(-30, 30)}, sv = svgL();
  const thorns = [...Array(7)].map((_, i)=>{ const t = (i + 1)/8, q = qpt(a, m, b, t), q2 = qpt(a, m, b, t + .02), an = Math.atan2(q2.y - q.y, q2.x - q.x) + (i % 2 ? 1 : -1)*1.2;
    return `<path d="M${q.x},${q.y} L${q.x + Math.cos(an)*9},${q.y + Math.sin(an)*9}" stroke="#2f3d16" stroke-width="3" stroke-linecap="round"/>`; }).join('');
  sv.innerHTML = `<g class="v" style="filter:drop-shadow(0 0 3px rgba(120,40,140,.8))"><path d="M${a.x},${a.y} Q${m.x},${m.y} ${b.x},${b.y}" fill="none" stroke="#4a5e1e" stroke-width="5" stroke-linecap="round"/>${thorns}</g>`;
  const v = sv.querySelector('.v'), main = v.firstChild, L = main.getTotalLength ? main.getTotalLength() : 300; main.style.strokeDasharray = L; main.style.strokeDashoffset = L;
  g.set(v.querySelectorAll('path:not(:first-child)'), {opacity:0});
  g.timeline({onComplete:()=> kill(sv)}).to(main, {strokeDashoffset:0, duration:.22, ease:'power2.in'}).to(v.querySelectorAll('path:not(:first-child)'), {opacity:1, duration:.05, stagger:.02}, '-=.1')
    .add(()=>{ spray(b.x, b.y, {n:8, html:'✶', size:10, color:'#b6d46a', d0:14, d1:34, dur:.4}); nudge(killer, [{x:0}, {x:4, r:3, o:.25}, {x:0}], 260); }).to(sv, {opacity:0, duration:.3, delay:.15});
  return done(800);
};

// ======================= evades and misses =======================
// Flying: the flier lifts out of reach (its shadow shrinks under it) and a few feathers drift down (SkillFX.feathers).
css('fly', `.fxa-shadowel{border-radius:50%; background:radial-gradient(ellipse, rgba(0,0,0,.45), rgba(0,0,0,0) 70%);}`);
M.flyLift = function(el){
  const g = G(), F = S(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const sh = P('fxa-shadowel', '', c.x, c.r.bottom + 4, {width:c.w*.9, height:16, opacity:.8});
  g.timeline({onComplete:()=> kill(sh)}).to(sh, {scale:.55, opacity:.35, duration:.22, ease:'power2.out'}).to(sh, {scale:1, opacity:0, duration:.35, delay:.2});
  nudge(el, [{y:0}, {y:-22, r:-4, s:1.04, o:.3}, {y:-18, r:3, s:1.04, o:.6}, {y:0}], 640);
  if(F && F.feathers) later(()=> F.feathers(c.x, c.y, 5), 120);
  for(let i = 0; i < 3; i++){ const w = P('fxa-p', '', c.x + (i - 1)*c.w*.3, c.r.bottom, {width:22, height:2, opacity:.8}); w.style.background = 'rgba(255,255,255,.85)';
    g.to(w, {y:`+=${18 + i*4}`, opacity:0, scaleX:1.6, duration:.35, delay:.08 + i*.04, onComplete:()=> kill(w)}); }
  return done(1300);
};
// Fog: thick fog curls over the card as the blow arrives; the card fades into it and the blade's streak dissolves.
css('fog', `.fxa-fog{width:60px; height:44px; border-radius:50%; background:radial-gradient(ellipse, rgba(232,236,240,.95) 0, rgba(210,216,222,.7) 45%, rgba(210,216,222,0) 72%);}`);
M.fogSwallow = function(el, att){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  for(let i = 0; i < 7; i++){ const f = P('fxa-fog', '', c.x + rnd(-c.w*.6, c.w*.6), c.y + rnd(-c.h*.35, c.h*.35), {scale:.4, opacity:0});
    g.timeline({delay:i*.04, onComplete:()=> kill(f)}).to(f, {scale:rnd(1.5, 2.2), opacity:.92, x:`+=${rnd(-14, 14)}`, duration:.35, ease:'power1.out'}).to(f, {opacity:0, x:`+=${rnd(-20, 20)}`, duration:.6, delay:.25}); }
  const t = tileOf(el); g.timeline().to(t, {opacity:.3, duration:.2}).to(t, {opacity:1, duration:.4, delay:.35, clearProps:'opacity'});
  const s = P('fxa-p', '', c.x, c.y, {width:c.w*1.2, height:3, rotation:-35, scaleX:0, opacity:.9}); s.style.background = 'linear-gradient(90deg, rgba(255,255,255,0), #fff 40%, rgba(255,255,255,0))';
  g.timeline({delay:.12, onComplete:()=> kill(s)}).to(s, {scaleX:1, duration:.1}).to(s, {opacity:0, scaleY:6, duration:.35});
  return done(1200);
};
// Illusory: A the struck image splits into mirror copies and the hit one pops; B a heat-shimmer wobble with rainbow edges;
// C the illusion shatters like glass while the real unit stands untouched.
css('illus', `.fxa-mirror{filter:hue-rotate(200deg) saturate(1.6) brightness(1.15) drop-shadow(0 0 6px #b8f0ff); opacity:.6;}`);
M.illusorySplit = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  [-1, 1].forEach(s=>{ const gh = ghost(el, 'fxa-mirror'); g.timeline({onComplete:()=> kill(gh.w)}).fromTo(gh.inner, {x:0, opacity:.7}, {x:s*c.w*.55/gh.z, duration:.2, ease:'power2.out'}).to(gh.inner, {x:0, opacity:0, duration:.3, delay:.3}); });
  const t = tileOf(el); g.timeline().to(t, {opacity:.15, duration:.08}).to(t, {opacity:1, duration:.25, delay:.45, clearProps:'opacity'});
  later(()=> spray(c.x, c.y, {n:14, html:'✧', size:()=> rnd(8, 13), color:i=> ['#b8f0ff', '#ffc6f0', '#fff6b0'][i % 3], d0:c.w*.2, d1:c.w*.6, dur:.5, spin:180}), 100);
  return done(1000);
};
M.illusorySplit_B = function(el){
  const g = G(); if(!g || !el) return done(0); const t = tileOf(el), st = {k:0};
  g.to(st, {k:1, duration:.7, ease:'none', onUpdate:()=>{ const w = Math.sin(st.k*Math.PI*8)*(1 - st.k); g.set(t, {skewX:w*8, x:w*4, filter:`hue-rotate(${st.k*360}deg) saturate(${1 + (1 - st.k)}) drop-shadow(${w*4}px 0 0 rgba(255,80,200,.6)) drop-shadow(${-w*4}px 0 0 rgba(80,220,255,.6))`}); },
    onComplete:()=> g.set(t, {clearProps:'transform,filter'})});
  return done(800);
};
M.illusorySplit_C = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), pts = [[0,0,50,0,40,45],[50,0,100,0,60,40],[100,0,100,55,60,40],[0,0,40,45,0,60],[40,45,60,40,100,55,55,100,0,100,0,60],[100,55,100,100,55,100]];
  const t = tileOf(el); g.set(t, {opacity:0});
  pts.forEach(p=>{ const gh = ghost(el, 'fxa-mirror'); const poly = []; for(let i = 0; i < p.length; i += 2) poly.push(p[i] + '% ' + p[i + 1] + '%'); gh.inner.style.clipPath = `polygon(${poly.join(',')})`;
    const cx = p.filter((_, i)=> i % 2 === 0).reduce((s, v)=> s + v, 0)/(p.length/2) - 50, cy = p.filter((_, i)=> i % 2).reduce((s, v)=> s + v, 0)/(p.length/2) - 50;
    g.timeline({onComplete:()=> kill(gh.w)}).to(gh.inner, {x:cx*1.6, y:cy*1.6 + 30, rotation:rnd(-40, 40), opacity:0, duration:.55, ease:'power2.in'}); });
  g.to(t, {opacity:1, duration:.3, delay:.35, clearProps:'opacity'});
  return done(900);
};
// Shadow (Map 50+ night): A the strike passes through dark smoke and the card re-forms; B it sinks into its own shadow and rises;
// C it goes to a black silhouette with two eyes that blink, and comes back.
M.shadowPass = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), t = tileOf(el);
  // 2026-10-15: lighter and smaller, so the game's "Miss" callout still reads through the smoke
  spray(c.x, c.y + c.h*.1, {n:7, cls:'fxa-puff', color:'radial-gradient(circle, rgba(34,26,52,.78) 0, rgba(34,26,52,0) 70%)', d0:8, d1:c.w*.5, dur:.75, s0:.5, s1:1.7, op:.85});
  g.set(t, {filter:'brightness(1) saturate(1)'}); g.timeline().to(t, {filter:'brightness(.15) saturate(0)', opacity:.4, duration:.15}).to(t, {filter:'brightness(1) saturate(1)', opacity:1, duration:.4, delay:.35, clearProps:'filter,opacity'});
  return done(1000);
};
M.shadowPass_B = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), t = tileOf(el);
  const sh = P('fxa-shadowel', '', c.x, c.r.bottom - 6, {width:c.w*1.1, height:22, opacity:.9});
  g.set(t, {filter:'brightness(1)'}); g.timeline({onComplete:()=> g.set(t, {clearProps:'transform,filter,clipPath'})}).to(t, {scaleY:.05, transformOrigin:'50% 100%', filter:'brightness(.2)', duration:.22, ease:'power2.in'}).to(t, {scaleY:1, filter:'brightness(1)', duration:.3, delay:.25, ease:'back.out(1.6)'});
  g.to(sh, {opacity:0, duration:.3, delay:.6, onComplete:()=> kill(sh)});
  return done(900);
};
M.shadowPass_C = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), t = tileOf(el);
  const ey = P('fxa-eyes', '● ●', c.x, c.r.top + c.h*.4, {opacity:0}); ey.style.zIndex = 1201;
  g.set(t, {filter:'brightness(1)'}); g.timeline({onComplete:()=>{ kill(ey); g.set(t, {clearProps:'filter'}); }}).to(t, {filter:'brightness(0)', duration:.12}).to(ey, {opacity:1, duration:.06}).to(ey, {scaleY:.1, duration:.05, delay:.25}).to(ey, {scaleY:1, duration:.05}).to(ey, {opacity:0, duration:.1, delay:.15}).to(t, {filter:'brightness(1)', duration:.3});
  return done(900);
};
// Smoke: the Smoke Bomb's cloud swallows the swing (SkillFX.smokePuff) and the card blurs inside it.
M.smokeSwallow = function(el){
  const g = G(), F = S(); if(!g || !el) return done(0); const t = tileOf(el);
  if(F && F.smokePuff) F.smokePuff(el);
  g.set(t, {filter:'blur(0px) grayscale(0)'}); g.timeline().to(t, {filter:'blur(3px) grayscale(.6)', opacity:.55, duration:.15}).to(t, {filter:'blur(0px) grayscale(0)', opacity:1, duration:.45, delay:.35, clearProps:'filter,opacity'});
  return done(1100);
};
// Blind: a dark blindfold slides over the attacker's eyes and it swings at empty air, "?" marks swirling (night: a moon instead).
css('blind', `.fxa-band{height:16%; border-radius:4px; background:linear-gradient(#2b2230, #120d16); box-shadow:0 2px 4px rgba(0,0,0,.5);}`);
M.blindSwing = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), side = Math.random() < .5 ? -1 : 1;
  const b = P('fxa-band', '', c.x, c.r.top + c.h*.32, {width:c.w*1.05, height:c.h*.16, scaleX:0}); if(o.night) b.style.background = 'linear-gradient(#1b2340, #0b1024)';
  g.timeline({onComplete:()=> kill(b)}).to(b, {scaleX:1, duration:.14, ease:'power2.out'}).to(b, {opacity:0, duration:.25, delay:.7});
  nudge(el, [{x:0}, {x:side*12, r:side*8, o:.35}, {x:side*16, r:side*10, o:.5}, {x:0}], 620);
  spray(c.x + side*c.w*.5, c.r.top + c.h*.2, {n:4, html:i=> o.night && !i ? '🌙' : '?', size:()=> rnd(13, 18), color:'#fff4d0', style:{textShadow:'0 1px 2px #000'}, a0:220, a1:320, d0:16, d1:34, dur:.8, stagger:.08, spin:60});
  return done(1000);
};
// Confused fizzle: a weak spark sputters up from the card and dies in grey puffs while a "?" spins.
M.fizzle = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const s = P('fxa-dot', '', c.x, c.r.top + c.h*.4, {width:8, height:8}); s.style.background = '#ffe48a'; s.style.boxShadow = '0 0 8px #ffcf4a';
  g.timeline({onComplete:()=>{ const r = s.getBoundingClientRect(); kill(s); spray(r.left + 4, r.top + 4, {n:4, cls:'fxa-soft', size:12, color:'rgba(170,170,170,.8)', d0:6, d1:16, dur:.5, s0:.6, s1:1.6}); }})
    .to(s, {y:`-=${c.h*.5}`, x:'+=6', duration:.35, ease:'power1.out'}).to(s, {x:'-=10', scale:.6, duration:.08, yoyo:true, repeat:2}).to(s, {scale:.2, duration:.1});
  const q = P('fxa-glyph', '❓', c.x, c.r.top - 2, {scale:.4, opacity:0}); q.style.fontSize = '18px';
  g.timeline({onComplete:()=> kill(q)}).to(q, {scale:1, opacity:1, duration:.15}).to(q, {rotation:360, duration:.6, ease:'power1.inOut'}).to(q, {opacity:0, duration:.2});
  return done(1000);
};
// Tipsy: bubbles wobble up, a "hic!" pops and the card sways.
M.tipsyBubbles = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), d = (o.drift || 1) < 0 ? -1 : 1;
  for(let i = 0; i < 7; i++){ const b = P('fxa-bub', '', c.x + rnd(-c.w*.3, c.w*.3), c.r.top + c.h*.5, {scale:rnd(.6, 1.4), opacity:0}); b.style.borderColor = 'rgba(255,240,190,.95)'; b.style.background = 'rgba(255,220,120,.25)';
    g.timeline({delay:i*.06, onComplete:()=> kill(b)}).to(b, {opacity:1, duration:.05}).to(b, {y:`-=${rnd(40, 70)}`, x:`+=${rnd(-10, 10)}`, duration:.8, ease:'sine.out'}, '<').to(b, {opacity:0, scale:1.4, duration:.12}); }
  later(()=> tag(el, 'hic!', 'linear-gradient(#d39b2a, #a06a10)', {fx:.25, fy:.05, rot:-12, hold:380}), 220);
  nudge(el, [{x:0}, {x:d*8, r:d*6, o:.3}, {x:-d*5, r:-d*4, o:.65}, {x:0}], 700);
  return done(1250);
};

// ======================= boomerangs =======================
css('boom', `.fxa-boomer{font-size:22px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5));}`);
// It's on its way back: the boomerang swings in from the edge of the field on a wide arc and hangs by its thrower.
M.boomerangInbound = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), host = o.host ? o.host.getBoundingClientRect() : {left:0, right:innerWidth, top:0};
  const side = c.x < (host.left + host.right)/2 ? 1 : -1, A = {x:side > 0 ? host.right - 10 : host.left + 10, y:c.r.top - 30}, B = {x:c.x + side*c.w*.55, y:c.r.top + c.h*.1}, Mx = {x:(A.x + B.x)/2, y:A.y - 90};
  const b = P('fxa-boomer', '🪃', A.x, A.y), st = {t:0};
  g.timeline({onComplete:()=> kill(b)}).to(st, {t:1, duration:.6, ease:'power2.out', onUpdate:()=>{ const q = qpt(A, Mx, B, st.t); g.set(b, {x:q.x, y:q.y, rotation:st.t*900}); if(Math.random() < .5){ const d = P('fxa-dot', '', q.x, q.y, {width:5, height:5, opacity:.7}); d.style.background = '#e9d29a'; g.to(d, {opacity:0, scale:.2, duration:.3, onComplete:()=> kill(d)}); } }})
    .to(b, {rotation:'+=720', duration:.5, ease:'none'}).to(b, {opacity:0, scale:.5, duration:.2});
  return done(1400);
};
// Caught: the boomerang slaps into the thrower's hand: a little drop, a ring and a sparkle.
M.catchSnap = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const b = P('fxa-boomer', '🪃', c.x + c.w*.6, c.r.top - 20, {rotation:0});
  g.timeline({onComplete:()=> kill(b)}).to(b, {x:c.x + c.w*.2, y:c.r.top + c.h*.2, rotation:540, duration:.25, ease:'power2.in'})
    .add(()=>{ ring(c.x + c.w*.2, c.r.top + c.h*.2, {color:'#ffe9a8', size:50, w:3, dur:300}); spray(c.x + c.w*.2, c.r.top + c.h*.2, {n:5, html:'✦', size:10, color:'#fff2b0', d0:10, d1:22, dur:.35}); nudge(el, [{y:0}, {y:5, o:.3}, {y:0}], 220); })
    .to(b, {opacity:0, scale:.6, duration:.25, delay:.2});
  return done(800);
};
// Whiff: the boomerang whooshes past through empty air with speed lines.
M.whiffPast = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), A = {x:c.x - c.w*1.2, y:c.y - c.h*.6}, B = {x:c.x + c.w*1.3, y:c.y - c.h*.1}, Mx = {x:c.x, y:c.r.top - c.h*.5}, st = {t:0};
  const b = P('fxa-boomer', '🪃', A.x, A.y);
  g.timeline({onComplete:()=> kill(b)}).to(st, {t:1, duration:.4, ease:'none', onUpdate:()=>{ const q = qpt(A, Mx, B, st.t); g.set(b, {x:q.x, y:q.y, rotation:st.t*1080, opacity:st.t > .85 ? (1 - st.t)*6 : 1});
    if(Math.random() < .6){ const s = P('fxa-p', '', q.x, q.y, {width:18, height:2, opacity:.8}); s.style.background = '#fff'; g.to(s, {opacity:0, scaleX:.2, duration:.25, onComplete:()=> kill(s)}); } }});
  return done(700);
};
// Friendly fire: the boomerang bonks an ally on its way home: a star, a sweat drop and an "Oops!".
M.friendlyBonk = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const st = P('fxa-glyph', '💫', c.x, c.r.top + c.h*.12, {scale:.4, opacity:0}); g.timeline({onComplete:()=> kill(st)}).to(st, {scale:1.2, opacity:1, duration:.12, ease:'back.out(3)'}).to(st, {rotation:200, duration:.5}).to(st, {opacity:0, duration:.2});
  spray(c.r.left + c.w*.85, c.r.top + c.h*.15, {n:1, cls:'fxa-drop', style:{background:'linear-gradient(#fff, #8fd0ff)'}, a0:-30, a1:-20, d0:14, d1:16, grav:18, dur:.5});
  tag(el, 'Oops!', 'linear-gradient(#f0a52a, #c0700a)', {fx:.3, fy:.02, delay:80});
  nudge(el, [{y:0}, {y:6, r:-4, o:.2}, {y:0}], 300);
  return done(1350);
};

// ======================= castle hits =======================
css('castle', `.fxa-ram{width:70px; height:22px; border-radius:11px; background:repeating-linear-gradient(90deg, #8a5a2b 0 9px, #74481f 9px 11px); box-shadow:inset 0 -4px 0 rgba(0,0,0,.25), 0 3px 5px rgba(0,0,0,.45);}
.fxa-ram::after{content:''; position:absolute; right:-6px; top:2px; width:16px; height:18px; border-radius:6px; background:#5d6066; box-shadow:inset 0 0 0 2px #888c93;}
.fxa-rampart{border-radius:4px 4px 2px 2px; background:linear-gradient(#a7a39a, #77736b); box-shadow:inset 0 3px 0 #c9c4b8, 0 3px 6px rgba(0,0,0,.4);
  -webkit-mask:linear-gradient(#000 0 0) 0 100%/100% 70% no-repeat, repeating-linear-gradient(90deg, #000 0 14px, transparent 14px 22px) 0 0/100% 32% no-repeat;
  mask:linear-gradient(#000 0 0) 0 100%/100% 70% no-repeat, repeating-linear-gradient(90deg, #000 0 14px, transparent 14px 22px) 0 0/100% 32% no-repeat;}
.fxa-bolt{width:64px; height:5px; border-radius:2px; background:linear-gradient(90deg, #6b4a22, #c08a3e 70%); box-shadow:0 1px 2px rgba(0,0,0,.5);}
.fxa-bolt::after{content:''; position:absolute; right:-10px; top:-5px; border:7px solid transparent; border-left:12px solid #b8bcc4;}
.fxa-bolt::before{content:''; position:absolute; left:-2px; top:-4px; width:12px; height:13px; background:linear-gradient(#3fb0a5, #24766e); clip-path:polygon(0 0, 100% 35%, 100% 65%, 0 100%);}
.fxa-beam{background:linear-gradient(90deg, rgba(255,230,140,0), rgba(255,240,180,.95) 40%, #fff 50%, rgba(255,240,180,.95) 60%, rgba(255,230,140,0));}`);
const chips = (c, n)=> spray(c.x, c.y, {n:n || 10, size:()=> rnd(4, 7), color:i=> i % 2 ? '#9a948a' : '#d1c8b8', style:{borderRadius:'2px'}, spin:220, a0:180, a1:360, d0:c.w*.3, d1:c.w*.75, grav:34, dur:.6});
const dust = (x, y, w, n)=> spray(x, y, {n:n || 6, cls:'fxa-soft', size:()=> rnd(16, 26), color:'rgba(205,190,160,.75)', a0:180, a1:360, d0:8, d1:w*.6, dur:.8, s0:.5, s1:1.8, op:.85});
// Stampede (Overwhelm): a rolling dust cloud with hoof prints charges from the killer's lane into the wall.
M.stampede = function(from, castle){
  const g = G(); if(!g || !castle) return done(0); const b = centre(tileOf(castle)), a = from ? centre(tileOf(from)) : {x:b.x, y:b.y + 140};
  for(let i = 0; i < 9; i++){ const t = i/8, x = a.x + (b.x - a.x)*t, y = a.y + (b.y - a.y)*t;
    later(()=>{ dust(x + rnd(-10, 10), y + rnd(-6, 6), 60, 2); const h = P('fxa-p', '🐾', x + (i % 2 ? 8 : -8), y, {opacity:0, rotation:angTo(a, b) + 90, scale:.7}); h.style.fontSize = '12px'; h.style.filter = 'grayscale(1) brightness(.5)';
      g.timeline({onComplete:()=> kill(h)}).to(h, {opacity:.75, duration:.05}).to(h, {opacity:0, duration:.4, delay:.3}); }, i*45); }
  later(()=>{ dust(b.x, b.r.bottom - 6, b.w*1.4, 9); chips(b, 8); nudge(castle, [{x:0}, {x:-6, r:-2, o:.15}, {x:5, r:1.5, o:.4}, {x:-2, o:.7}, {x:0}], 420); }, 420);
  return done(1300);
};
// Siege: a battering ram swings in and slams the castle; stone chips and a dust ring.
M.siegeRam = function(castle, o){
  o = o || {}; const g = G(); if(!g || !castle) return done(0); const c = centre(tileOf(castle)), dir = o.fromBelow === false ? -1 : 1;
  const r = P('fxa-ram', '', c.x, c.y + dir*c.h*.85, {rotation:dir*-90 + 12, opacity:0});
  g.timeline({onComplete:()=> kill(r)}).to(r, {opacity:1, y:`+=${dir*16}`, rotation:dir*-90, duration:.18, ease:'power2.out'}).to(r, {y:c.y + dir*c.h*.45, duration:.09, ease:'power4.in'})
    .add(()=>{ chips({x:c.x, y:c.y + dir*c.h*.35, w:c.w}, 12); ring(c.x, c.r.bottom, {color:'rgba(210,195,165,.9)', size:c.w*1.8, sy:.35, w:4, dur:520}); nudge(castle, [{y:0}, {y:-dir*6, o:.2}, {y:dir*2, o:.5}, {y:0}], 360); })
    .to(r, {y:`+=${dir*20}`, opacity:0, duration:.3, delay:.12});
  return done(900);
};
// Bulwark: a stone rampart rises in front of the castle; the blow sparks off it, then it sinks back.
M.bulwarkWall = function(castle, o){
  o = o || {}; const g = G(); if(!g || !castle) return done(0); const c = centre(tileOf(castle)), dir = o.fromBelow === false ? -1 : 1, y = dir > 0 ? c.r.bottom + 4 : c.r.top - 4;
  const w = P('fxa-rampart', '', c.x, y, {width:c.w*1.2, height:28, scaleY:0, transformOrigin:'50% 100%', yPercent:dir > 0 ? -80 : -20});
  g.timeline({onComplete:()=> kill(w)}).to(w, {scaleY:1, duration:.16, ease:'back.out(2)'})
    .add(()=>{ spray(c.x, y, {n:10, cls:'fxa-spark', color:'#ffe08a', a0:dir > 0 ? 30 : 210, a1:dir > 0 ? 150 : 330, d0:16, d1:40, dur:.3, orient:true}); ring(c.x, y, {color:'#e6e1d6', size:80, sy:.5, w:3, dur:300}); })
    .to(w, {scaleY:0, duration:.25, delay:.45, ease:'power2.in'});
  return done(950);
};
// Ballista: the Otter river-fort fires a big bronze bolt straight at its target; it thunks in and quivers.
M.ballista = function(castle, target, o){
  o = o || {}; const g = G(); if(!g || !castle || !target) return done(0); const a = centre(tileOf(castle)), b = centre(tileOf(target)), ang = angTo(a, b), fl = (o.flight || 300)/1000;
  const bolt = P('fxa-bolt', '', a.x, a.y, {rotation:ang});
  nudge(castle, [{x:0}, {x:-Math.cos(ang*D2R)*6, y:-Math.sin(ang*D2R)*6, o:.2}, {x:0}], 260);
  ring(a.x, a.y, {color:'#ffe0a8', size:54, w:3, dur:260});
  const end = {x:b.x - Math.cos(ang*D2R)*b.w*.2, y:b.y - Math.sin(ang*D2R)*b.h*.2};
  g.timeline({onComplete:()=> kill(bolt)}).to(bolt, {x:end.x, y:end.y, duration:fl, ease:'power1.in'})
    .add(()=>{ call(o.onImpact); spray(end.x, end.y, {n:8, size:()=> rnd(3, 5), color:'#8a6238', style:{height:'9px', borderRadius:'2px'}, spin:200, d0:10, d1:30, grav:14, dur:.45}); nudge(target, [{x:0}, {x:Math.cos(ang*D2R)*7, y:Math.sin(ang*D2R)*7, o:.2}, {x:0}], 300); })
    .to(bolt, {rotation:ang + 4, duration:.04, yoyo:true, repeat:5}).to(bolt, {opacity:0, duration:.25});
  return done(fl*1000 + 700);
};
// Divine Retribution: a gold beam drops from above onto the target, ⚖️ flashes and gold motes rise (Ecclesia).
M.holyBeam = function(target, o){
  o = o || {}; const g = G(); if(!g || !target) return done(0); const c = centre(tileOf(target)), top = Math.max(0, c.r.top - 260);
  const b = P('fxa-beam', '', c.x, top, {width:c.w*.7, height:c.r.top + c.h*.6 - top, yPercent:0, scaleX:0, transformOrigin:'50% 0%'});
  g.timeline({onComplete:()=> kill(b)}).to(b, {scaleX:1, duration:.12, ease:'power2.out'}).add(()=>{ call(o.onImpact); ring(c.x, c.y + c.h*.3, {color:'#ffe08a', size:c.w*1.5, sy:.35, w:3, glow:8, dur:500});
      flash(target, 'brightness(1.6) sepia(.4)', 100); }).to(b, {scaleX:.2, opacity:0, duration:.35, delay:.15});
  const sc = P('fxa-glyph', '⚖️', c.x, c.r.top - 12, {scale:.4, opacity:0}); g.timeline({onComplete:()=> kill(sc)}).to(sc, {scale:1, opacity:1, duration:.15, delay:.1, ease:'back.out(3)'}).to(sc, {opacity:0, y:'-=10', duration:.3, delay:.35});
  spray(c.x, c.r.bottom - 10, {n:10, size:4, color:'#ffe08a', style:{boxShadow:'0 0 6px #ffd04a'}, jx:c.w*.35, a0:265, a1:275, d0:30, d1:c.h*.8, dur:.9, delay:.12, stagger:.03});
  return done(1000);
};

// ======================= on-hit bonuses and odd attacks =======================
// Fester: sickly boils swell on the card and pop.
css('fester', `.fxa-boil{width:14px; height:14px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fbffb8 0, #c9d84a 35%, #7c8a1e 70%, #4d3a14 100%); box-shadow:0 0 4px rgba(80,60,20,.6);}`);
M.festerBoils = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  for(let i = 0; i < 4; i++){ const x = c.r.left + c.w*rnd(.18, .82), y = c.r.top + c.h*rnd(.25, .8), b = P('fxa-boil', '', x, y, {scale:.1});
    g.timeline({delay:i*.07, onComplete:()=>{ kill(b); spray(x, y, {n:5, size:4, color:'#c9d84a', d0:6, d1:16, grav:8, dur:.35}); }}).to(b, {scale:rnd(1, 1.5), duration:.3, ease:'power1.in'}).to(b, {scale:'+=0.2', duration:.05, yoyo:true, repeat:1}); }
  return done(800);
};
// Rupture: a red crack splits and blood sprays.
M.ruptureBurst = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), sv = svgL();
  let x = c.x, y = c.r.top + c.h*.2, d = `M${x},${y}`; for(let i = 0; i < 5; i++){ x += rnd(-c.w*.12, c.w*.12); y += c.h*.13; d += ` L${x},${y}`; }
  sv.innerHTML = `<path d="${d}" fill="none" stroke="#8a0d12" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ff3a3a" stroke-width="2" stroke-linecap="round"/>`;
  g.fromTo(sv, {opacity:1}, {opacity:0, duration:.35, delay:.4, onComplete:()=> kill(sv)});
  spray(c.x, c.y, {n:12, cls:'fxa-drop', style:{background:'linear-gradient(#ff7a7a, #a0101a)'}, a0:180, a1:360, d0:c.w*.3, d1:c.w*.7, grav:30, dur:.55});
  return done(800);
};
// Reload: a dial winds round on the card while it reloads (fills in full when it fires, part-way while it waits).
css('reload', `.fxa-dial{border-radius:50%; background:conic-gradient(#ffd56e calc(var(--p) * 1%), rgba(30,24,16,.55) 0); box-shadow:0 0 0 2px #fff3d6, 0 2px 4px rgba(0,0,0,.45);}
.fxa-dial::after{content:'🔄'; position:absolute; inset:0; display:grid; place-items:center; font-size:12px;}`);
M.reloadDial = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), d = P('fxa-dial', '', c.r.left + c.w*.8, c.r.top + c.h*.82, {width:28, height:28, scale:.3, opacity:0}), st = {p:0};
  d.style.setProperty('--p', 0);
  g.timeline({onComplete:()=> kill(d)}).to(d, {scale:1, opacity:1, duration:.12, ease:'back.out(2)'})
    .to(st, {p:o.part ? 45 : 100, duration:o.part ? .4 : .6, ease:'power1.inOut', onUpdate:()=> d.style.setProperty('--p', st.p.toFixed(1))})
    .add(()=>{ if(!o.part) ring(c.r.left + c.w*.8, c.r.top + c.h*.82, {color:'#ffe9a8', size:44, w:2, dur:260}); }).to(d, {opacity:0, duration:.2, delay:.25});
  nudge(el, [{r:0}, {r:-4, y:3, o:.3}, {r:-4, y:3, o:.8}, {r:0}], 900);
  return done(1450);
};
// Friction: grinding sparks where two allies rub and a gear spins between them.
M.frictionSparks = function(att, ally){
  const g = G(); if(!g || !ally) return done(0); const b = centre(tileOf(ally)), a = att ? centre(tileOf(att)) : {x:b.x - b.w, y:b.y}, x = (a.x + b.x)/2, y = (a.y + b.y)/2;
  const gear = P('fxa-glyph', '⚙️', x, y - b.h*.35, {scale:.4, opacity:0}); g.timeline({onComplete:()=> kill(gear)}).to(gear, {scale:1, opacity:1, duration:.12}).to(gear, {rotation:360, duration:.6, ease:'none'}).to(gear, {opacity:0, duration:.15});
  for(let k = 0; k < 4; k++) later(()=> spray(x, y + rnd(-b.h*.25, b.h*.25), {n:5, cls:'fxa-spark', color:'#ffd27a', a0:200, a1:340, d0:10, d1:26, grav:20, dur:.28, orient:true}), k*90);
  nudge(ally, [{x:0}, {x:3, o:.25}, {x:-3, o:.5}, {x:2, o:.75}, {x:0}], 400);
  return done(900);
};
// Pounce: a leap trail arcs out from the card and back, and dust kicks up as it lands.
M.pounceLeap = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), up = o.up == null ? -1 : o.up;
  for(let i = 0; i < 4; i++){ const gh = ghost(el); gh.inner.style.opacity = .4 - i*.08; const k = (i + 1)/4;
    g.fromTo(gh.inner, {x:0, y:0, scale:1}, {y:up*Math.sin(k*Math.PI)*c.h*.45/gh.z, x:(k - .5)*c.w*.15/gh.z, scale:1.05, duration:.18, delay:i*.04, ease:'power1.out', onComplete:()=> g.to(gh.inner, {opacity:0, duration:.2, onComplete:()=> kill(gh.w)})}); }
  later(()=> dust(c.x, c.r.bottom - 6, c.w*1.4, 7), 300);
  return done(1350);
};
// 2026-10-15: what a fight plays now when it pounces: dust where it pushes off (the leap is the hit's own lunge at its target).
M.pounceKick = function(el){ if(!G() || !el) return done(0); const c = centre(tileOf(el)); dust(c.x, c.r.bottom - 6, c.w*1.2, 6); return done(800); };
// Swipe steals Lumber: logs hop out of the enemy castle one after another into the swiper's hands; a green hood glint.
M.lumberSnatch = function(castle, swiper, o){
  o = o || {}; const g = G(); if(!g || !castle || !swiper) return done(0); const a = centre(tileOf(castle)), b = centre(tileOf(swiper)), n = Math.max(1, Math.min(4, o.n || 3));
  for(let i = 0; i < n; i++){ const l = P('fxa-glyph', '🪵', a.x, a.y, {scale:.6}), st = {t:0}, Mx = {x:(a.x + b.x)/2 + rnd(-30, 30), y:Math.min(a.y, b.y) - 70 - i*10};
    g.timeline({delay:i*.12, onComplete:()=>{ kill(l); if(i === n - 1){ ring(b.x, b.y, {color:'#9be15d', size:b.w, w:2, dur:300}); nudge(swiper, [{y:0}, {y:4, o:.3}, {y:0}], 220); } }})
      .to(st, {t:1, duration:.45, ease:'power1.inOut', onUpdate:()=>{ const q = qpt(a, Mx, b, st.t); g.set(l, {x:q.x, y:q.y, rotation:st.t*360, scale:.6 + .4*Math.sin(st.t*Math.PI)}); }}); }
  const hood = P('fxa-glyph', '✦', b.r.left + b.w*.3, b.r.top + b.h*.2, {scale:.2, opacity:0}); hood.style.color = '#9be15d';
  g.timeline({delay:.1, onComplete:()=> kill(hood)}).to(hood, {scale:1.3, opacity:1, rotation:90, duration:.15}).to(hood, {scale:0, opacity:0, rotation:180, duration:.25});
  return done(n*120 + 700);
};
// Charge fires: a yellow clock winds up on the card, then the charge lets go as a shockwave (SkillFX.shockwave).
css('charge', `.fxa-clock{border-radius:50%; background:conic-gradient(rgba(255,214,70,.95) calc(var(--p) * 1%), rgba(255,214,70,.12) 0); -webkit-mask:radial-gradient(circle, transparent 58%, #000 60%); mask:radial-gradient(circle, transparent 58%, #000 60%);}`);
M.chargeRelease = function(el, o){
  o = o || {}; const g = G(), F = S(); if(!g || !el) return done(0); const c = centre(tileOf(el)), k = P('fxa-clock', '', c.x, c.y, {width:c.w*1.25, height:c.w*1.25, opacity:0}), st = {p:0};
  k.style.setProperty('--p', 0);
  g.timeline({onComplete:()=> kill(k)}).to(k, {opacity:1, duration:.08}).to(st, {p:100, duration:.35, ease:'power2.in', onUpdate:()=> k.style.setProperty('--p', st.p.toFixed(1))})
    .add(()=>{ if(F && F.shockwave) F.shockwave(el, {size:c.w*3, duration:600, cards:o.cards || []}); else ring(c.x, c.y, {color:'#ffd646', size:c.w*2.6, w:5, dur:500}); flash(el, 'brightness(1.6) saturate(1.3)', 90); })
    .to(k, {scale:1.5, opacity:0, duration:.25});
  return done(1100);
};

// ======================= combat skills: the ground and the weather =======================
css('rocks', `.fxa-rock{width:22px; height:18px; border-radius:42% 58% 46% 54% / 52% 44% 56% 48%; background:radial-gradient(circle at 35% 30%, #b9ad9a, #7a6e5d 55%, #4b4236); box-shadow:inset -3px -3px 0 rgba(0,0,0,.25), 0 3px 4px rgba(0,0,0,.4);}`);
// Landslide (Sundered Peak): boulders tumble in from the top edge of the battlefield, bounce on the cards and kick up dust.
M.landslide = function(cards, o){
  o = o || {}; const g = G(); const list = (cards || []).filter(Boolean); if(!g || !list.length) return done(0);
  const host = o.host ? o.host.getBoundingClientRect() : {top:Math.min(...list.map(e=> e.getBoundingClientRect().top)) - 120};
  list.slice(0, 6).forEach((el, i)=>{ const c = centre(tileOf(el));
    for(let k = 0; k < 2; k++){ const r = P('fxa-rock', '', c.x + rnd(-c.w*.3, c.w*.3), host.top - 20, {scale:rnd(.8, 1.4), rotation:rnd(0, 180)}), ty = c.r.top + c.h*rnd(.3, .6), dx = rnd(-30, 30);
      g.timeline({delay:i*.09 + k*.12, onComplete:()=> kill(r)}).to(r, {y:ty, rotation:'+=240', duration:.38, ease:'power2.in'})
        .add(()=>{ dust(r._gsap ? +g.getProperty(r, 'x') : c.x, ty, 60, 3); if(!k) nudge(el, [{y:0}, {y:7, o:.2}, {y:0}], 260); })
        .to(r, {y:`+=${-28}`, x:`+=${dx}`, duration:.16, ease:'power1.out'}).to(r, {y:`+=${60}`, x:`+=${dx}`, opacity:0, rotation:'+=120', duration:.3, ease:'power1.in'}); } });
  return done(1400);
};
// Wave push (Kelp Mangroves): a rolling crest with a foam lip sweeps across the struck card in the push direction.
css('crest', `.fxa-crest{border-radius:60% 40% 0 0 / 100% 100% 0 0; background:linear-gradient(180deg, #f2fdff 0 12%, #7fd6ff 13%, #2f9be0 60%, rgba(30,110,200,0)); box-shadow:0 -2px 8px rgba(160,230,255,.6);}`);
M.rollingCrest = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), d = o.dir === 'left' ? -1 : 1;
  const w = P('fxa-crest', '', c.x - d*c.w*.9, c.r.bottom - c.h*.25, {width:c.w*.9, height:c.h*.55, scaleX:-d, opacity:0, transformOrigin:'50% 100%'});
  g.timeline({onComplete:()=> kill(w)}).to(w, {opacity:.95, duration:.08}).to(w, {x:`+=${d*c.w*1.6}`, scaleY:1.25, duration:.45, ease:'power1.inOut'}).to(w, {opacity:0, scaleY:.4, duration:.2}, '-=.1');
  later(()=> spray(c.x + d*c.w*.3, c.r.top + c.h*.4, {n:12, cls:'fxa-drop', a0:d > 0 ? -80 : 200, a1:d > 0 ? -10 : 260, d0:20, d1:50, grav:30, dur:.55}), 240);
  return done(900);
};
// Lightning (passive): a jagged bolt strikes down onto the card and sparks crawl over it for a moment (Sundered Peak storm).
M.stormBolt = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), top = Math.max(0, c.r.top - 220), sv = svgL();
  const jag = ()=>{ let x = c.x + rnd(-30, 30), y = top, d = `M${x},${y}`; const n = 8; for(let i = 1; i <= n; i++){ x = (i === n ? c.x : x + rnd(-18, 18)); y = top + (c.y - top)*i/n; d += ` L${x},${y}`; } return d; };
  const draw = ()=>{ sv.innerHTML = `<path d="${jag()}" fill="none" stroke="${o.color || '#bfe0ff'}" stroke-width="7" opacity=".45" style="filter:blur(3px)"/><path d="${jag()}" fill="none" stroke="#fff" stroke-width="2.5"/>`; };
  draw(); later(draw, 50); later(draw, 100); g.to(sv, {opacity:0, duration:.18, delay:.16, onComplete:()=> kill(sv)});
  flash(el, 'brightness(2) saturate(.4)', 60, 3);
  ring(c.x, c.y, {color:'#cfe6ff', size:c.w*1.4, w:3, glow:10, dur:360});
  for(let i = 0; i < 5; i++) later(()=>{ const x = c.r.left + rnd(.1, .9)*c.w, y = c.r.top + rnd(.1, .9)*c.h; spray(x, y, {n:3, cls:'fxa-spark', color:'#fff6a0', d0:4, d1:12, dur:.18, orient:true}); }, 140 + i*80);
  return done(800);
};
// Meteor crater burns: a glowing crater opens under the card, lava cracks spread and smoke rises.
css('crater', `.fxa-crater{border-radius:50%; background:radial-gradient(ellipse, #fff1a8 0, #ff9a2a 25%, #b8320e 55%, rgba(60,20,10,.8) 72%, rgba(60,20,10,0) 76%);}`);
M.craterBurn = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const cr = P('fxa-crater', '', c.x, c.r.bottom - c.h*.08, {width:c.w*1.25, height:c.h*.32, scale:.3, opacity:0});
  g.timeline({onComplete:()=> kill(cr)}).to(cr, {scale:1, opacity:.95, duration:.25, ease:'power2.out'}).to(cr, {opacity:.6, duration:.12, yoyo:true, repeat:3}).to(cr, {opacity:0, duration:.35});
  spray(c.x, c.r.bottom - c.h*.1, {n:6, cls:'fxa-puff', color:'radial-gradient(circle, rgba(70,60,56,.75) 0, rgba(70,60,56,0) 70%)', jx:c.w*.35, a0:260, a1:280, d0:c.h*.4, d1:c.h*.8, dur:1, s0:.5, s1:1.8, stagger:.06});
  spray(c.x, c.r.bottom - c.h*.1, {n:8, size:4, color:'#ffb347', style:{boxShadow:'0 0 6px #ff6a1a'}, jx:c.w*.35, a0:250, a1:290, d0:20, d1:c.h*.6, dur:.8, stagger:.04});
  return done(1200);
};
// Durian: the fruit cracks open and spikes burst out all round the card, bristle for a beat and draw back in.
css('spike', `.fxa-spike{width:10px; height:16px; clip-path:polygon(50% 0, 100% 100%, 0 100%); background:linear-gradient(#e8e070, #8a8a1e);}`);
M.durianSpikes = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), n = 16, out = [];
  for(let i = 0; i < n; i++){ const a = i/n*360, R = Math.max(c.w, c.h)*.5, x = c.x + Math.cos(a*D2R)*R*.7, y = c.y + Math.sin(a*D2R)*R*.85;
    const s = P('fxa-spike', '', x, y, {rotation:a + 90, scale:0}); out.push(s);
    g.timeline({delay:i*.012, onComplete:()=> kill(s)}).to(s, {scale:1.3, x:`+=${Math.cos(a*D2R)*12}`, y:`+=${Math.sin(a*D2R)*12}`, duration:.14, ease:'back.out(3)'}).to(s, {scale:0, x:`-=${Math.cos(a*D2R)*12}`, y:`-=${Math.sin(a*D2R)*12}`, duration:.25, delay:.4}); }
  nudge(el, [{s:1}, {s:1.06, o:.2}, {s:1}], 320);
  return done(900);
};
// Dynamite, the live look: SkillFX.dynamite (a lit stick lobbed up off the card, fizzing, then the blast, smoke and debris).
M.dynamiteBlast = function(el, o){
  o = o || {}; const F = S(); if(!el) return done(0);
  if(F && F.dynamite) F.dynamite(o.thrower || el, el, {flight:o.flight || 300, fuse:o.fuse || 220, host:o.host || null, onImpact:o.onImpact});
  return done((o.flight || 300) + (o.fuse || 220) + 900);
};
// Dynamite fuse: the fuse badge fizzes sparks each round; on its last round the card throbs red.
M.fuseSpark = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), x = c.r.right - 4, y = c.r.top + 2;
  for(let k = 0; k < (o.last ? 5 : 3); k++) later(()=> spray(x, y, {n:4, size:()=> rnd(2, 4), color:i=> i % 2 ? '#ffd34a' : '#fff6c8', style:{boxShadow:'0 0 4px #ff9a2a'}, a0:200, a1:340, d0:6, d1:18, grav:10, dur:.3}), k*110);
  if(o.last){ const r = over(el, '', 4); r.style.boxShadow = 'inset 0 0 0 3px rgba(255,60,40,.9), 0 0 18px rgba(255,60,40,.7)'; g.fromTo(r, {opacity:0}, {opacity:1, duration:.15, yoyo:true, repeat:3, onComplete:()=> kill(r)}); }
  return done(700);
};
// Explode (Pesky Bee, the creeper): the card swells and flashes faster and faster, then bursts in a green ring with spores.
M.creeperBurst = function(el){
  const g = G(); if(!g || !el) return done(0); const t = tileOf(el), c = centre(t);
  g.set(t, {filter:'brightness(1) saturate(1)'}); g.timeline().to(t, {filter:'brightness(2) saturate(.3)', duration:.08, yoyo:true, repeat:1}).to(t, {filter:'brightness(2) saturate(.3)', duration:.05, yoyo:true, repeat:1}).to(t, {filter:'brightness(2.4) saturate(.2)', duration:.03, yoyo:true, repeat:3})
    .set(t, {clearProps:'filter'});
  nudge(el, [{s:1}, {s:1.1, o:.75}, {s:1.14, o:.9}, {s:1}], 420);
  later(()=>{ const f = P('fxa-flare', '', c.x, c.y, {width:c.w*2.4, height:c.w*2.4, scale:.2}); f.style.background = 'radial-gradient(circle, #fff 0, #c8ff8a 25%, rgba(80,200,60,.5) 50%, rgba(80,200,60,0) 70%)';
    g.to(f, {scale:1, opacity:0, duration:.4, ease:'power2.out', onComplete:()=> kill(f)});
    ring(c.x, c.y, {color:'#9cf06a', size:c.w*2.6, w:5, glow:10, dur:480});
    spray(c.x, c.y, {n:14, cls:'fxa-soft', size:()=> rnd(5, 9), color:'#c8ff8a', d0:c.w*.4, d1:c.w*1.1, dur:.7});
    spray(c.x, c.y, {n:8, size:()=> rnd(4, 7), color:'#5d7a3a', style:{borderRadius:'2px'}, spin:300, d0:c.w*.5, d1:c.w*1, grav:30, dur:.6}); }, 400);
  return done(1300);
};
// Rocket: a rocket launches off the card with a smoke trail and arcs onto its target.
M.rocketLaunch = function(el, target, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const a = centre(tileOf(el)), b = target ? centre(tileOf(target)) : {x:a.x, y:a.y - 260, w:60, h:80};
  const A = {x:a.x, y:a.r ? a.r.top : a.y}, Mx = {x:(A.x + b.x)/2 + rnd(-60, 60), y:Math.min(A.y, b.y) - 120}, st = {t:0}, rk = P('fxa-glyph', '🚀', A.x, A.y); let prev = A, k = 0;
  g.timeline({onComplete:()=>{ kill(rk); if(target){ ring(b.x, b.y, {color:'#ffb347', size:b.w*1.6, w:4, glow:10, dur:420}); spray(b.x, b.y, {n:10, size:()=> rnd(3, 6), color:'#ffb347', d0:10, d1:b.w*.6, dur:.45}); call(o.onImpact); } }})
    .to(st, {t:1, duration:(o.flight || 700)/1000, ease:'power1.in', onUpdate:()=>{ const q = qpt(A, Mx, b, st.t); g.set(rk, {x:q.x, y:q.y, rotation:angTo(prev, q) + 45}); prev = q;
      if(!(k++ % 2)){ const s = P('fxa-soft', '', q.x, q.y, {width:12, height:12, opacity:.8}); s.style.background = 'rgba(220,220,220,.85)'; g.to(s, {scale:2.2, opacity:0, duration:.6, onComplete:()=> kill(s)}); } }});
  return done((o.flight || 700) + 500);
};
// Rally, B (a proposal): the Otter standard-bearer raises the bronze fish standard; teal pennant, bronze chevrons on every ally.
css('standard', `.fxa-standard{width:6px; height:70px; background:linear-gradient(#e0a35a, #8a5a22); border-radius:3px;}
.fxa-standard::before{content:'🐟'; position:absolute; left:50%; top:-20px; transform:translateX(-50%) rotate(-90deg); font-size:20px; filter:sepia(1) saturate(3) hue-rotate(-10deg) brightness(1.05) drop-shadow(0 0 4px #e0a35a);}
.fxa-standard::after{content:''; position:absolute; left:6px; top:6px; width:30px; height:22px; background:linear-gradient(90deg, #3fb0a5, #24766e); clip-path:polygon(0 0, 100% 50%, 0 100%);}`);
M.rallyStandard = function(cards, o){
  const g = G(); const list = (cards || []).filter(Boolean); if(!g || !list.length) return done(0); const c = centre(tileOf(list[0]));
  const s = P('fxa-standard', '', c.x, c.r.top - 10, {yPercent:-100, scaleY:0, transformOrigin:'50% 100%'});
  g.timeline({onComplete:()=> kill(s)}).to(s, {scaleY:1, duration:.25, ease:'back.out(2)'}).to(s, {rotation:4, duration:.12, yoyo:true, repeat:3}).to(s, {opacity:0, duration:.3});
  list.forEach((el, i)=> later(()=>{ const d = centre(tileOf(el)); spray(d.x, d.r.bottom - 10, {n:3, html:'︽', size:18, color:'#e0a35a', style:{textShadow:'0 0 4px #7a4a18'}, a0:268, a1:272, d0:d.h*.6, d1:d.h*.8, dur:.55, s0:1, s1:1, stagger:.08});
    nudge(el, [{y:0}, {y:-6, o:.4}, {y:0}], 320); }, 220 + i*80));
  return done(1600);
};
// Momentum (Savanna Hunting Grounds): flame chevrons stream behind the card and dust kicks up as it surges.
M.momentumTrail = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), back = el.closest && el.closest('#rowMine') ? 1 : -1;
  for(let i = 0; i < 6; i++){ const ch = P('fxa-p', '❯', c.x + rnd(-c.w*.3, c.w*.3), c.y + back*c.h*.2, {rotation:back*90, opacity:0}); ch.style.cssText += 'font:900 20px/1 system-ui; color:#ff9a2a; text-shadow:0 0 6px #ff5a1f;';
    g.timeline({delay:i*.05, onComplete:()=> kill(ch)}).to(ch, {opacity:1, duration:.05}).to(ch, {y:`+=${back*c.h*.7}`, opacity:0, duration:.45, ease:'power1.out'}); }
  dust(c.x, back > 0 ? c.r.bottom : c.r.top, c.w, 5);
  nudge(el, [{y:0}, {y:-back*8, o:.3}, {y:0}], 400);
  return done(800);
};
// Pack: a howl rings out from the card in sound-wave arcs and paw prints hop to its packmates (Wolfsbane).
M.packHowl = function(el, mates){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  for(let i = 0; i < 3; i++) ring(c.x, c.r.top + c.h*.2, {color:'rgba(220,230,255,.85)', size:c.w*(1.2 + i*.5), sy:.6, w:3, dur:600, delay:i*120, dash:true});
  const m = P('fxa-glyph', '🐺', c.x, c.r.top - 8, {scale:.3, opacity:0}); g.timeline({onComplete:()=> kill(m)}).to(m, {scale:1.1, opacity:1, y:'-=8', duration:.2, ease:'back.out(2)'}).to(m, {opacity:0, duration:.3, delay:.4});
  (mates || []).filter(x=> x && x !== el).slice(0, 4).forEach((x, j)=>{ const d = centre(tileOf(x));
    for(let k = 0; k < 3; k++){ const t = (k + 1)/4, p = P('fxa-p', '🐾', c.x + (d.x - c.x)*t, c.y + (d.y - c.y)*t, {opacity:0, scale:.7, rotation:angTo(c, d) + 90}); p.style.fontSize = '13px';
      g.timeline({delay:.15 + j*.1 + k*.08, onComplete:()=> kill(p)}).to(p, {opacity:.9, duration:.05}).to(p, {opacity:0, duration:.35, delay:.2}); }
    later(()=> flash(x, 'brightness(1.3)', 120), 450 + j*100); });
  return done(1100);
};
// Heal, D (a proposal): swamp medicine. Herbal green steam curls up off the card with a few leaves.
M.herbalSteam = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  spray(c.x, c.r.bottom - c.h*.2, {n:7, cls:'fxa-puff', color:'radial-gradient(circle, rgba(200,245,190,.8) 0, rgba(120,200,120,.4) 45%, rgba(120,200,120,0) 70%)', jx:c.w*.3, a0:260, a1:280, d0:c.h*.4, d1:c.h*.8, dur:1.1, s0:.5, s1:1.8, stagger:.06});
  spray(c.x, c.r.bottom - c.h*.2, {n:4, html:'🌿', size:14, jx:c.w*.3, a0:250, a1:290, d0:c.h*.5, d1:c.h*.8, dur:1.1, spin:120, stagger:.1, s0:.8, s1:.6});
  flash(el, 'brightness(1.2) saturate(1.3) hue-rotate(15deg)', 200);
  return done(1300);
};
// Bloom variants (proposals from the ideas doc): algae (teal bubbles), fungal (spore puffs and caps), coral (pink branches).
M.bloomVariant = function(src, target, o){
  o = o || {}; const g = G(); if(!g || !target) return done(0); const a = src ? centre(tileOf(src)) : null, b = centre(tileOf(target)), kind = o.kind || 'algae';
  const look = {algae:{html:'', cls:'fxa-bub', color:null, glyph:'🫧', tint:'hue-rotate(-30deg) saturate(1.4)'}, fungal:{html:'', cls:'fxa-mould', glyph:'🍄', tint:'sepia(.3) saturate(1.2)'}, coral:{html:'🪸', cls:'fxa-glyph', glyph:'🪸', tint:'hue-rotate(-20deg) saturate(1.5) brightness(1.1)'}}[kind];
  if(a){ for(let i = 0; i < 8; i++){ const p = P(look.cls, look.html, a.x, a.y, {scale:.6, opacity:0}), Mx = {x:(a.x + b.x)/2 + rnd(-40, 40), y:Math.min(a.y, b.y) - 50}, st = {t:0};
    if(kind === 'algae'){ p.style.borderColor = '#7ff0d0'; p.style.background = 'rgba(80,220,180,.3)'; } if(kind === 'coral') p.style.fontSize = '12px';
    g.timeline({delay:i*.05, onComplete:()=> kill(p)}).to(p, {opacity:1, duration:.05}).to(st, {t:1, duration:.5, ease:'sine.inOut', onUpdate:()=>{ const q = qpt(a, Mx, b, st.t); g.set(p, {x:q.x + Math.sin(st.t*12)*6, y:q.y}); }}).to(p, {opacity:0, duration:.15}); } }
  later(()=>{ spray(b.x, b.r.bottom - 6, {n:5, html:look.glyph, size:()=> rnd(12, 18), jx:b.w*.35, a0:268, a1:272, d0:10, d1:30, dur:.7, s0:.2, s1:1.1}); flash(target, look.tint + ' brightness(1.2)', 160); }, a ? 520 : 0);
  return done(1200);
};

// ======================= shields, shells, helmets =======================
css('hex', `.fxa-dome{border-radius:46%; border:2px solid rgba(160,215,255,.95);
  background:radial-gradient(ellipse at 50% 40%, rgba(190,230,255,.05) 40%, rgba(150,210,255,.35) 75%), repeating-conic-gradient(from 30deg, rgba(200,235,255,.22) 0 60deg, rgba(200,235,255,.05) 60deg 120deg);
  box-shadow:0 0 16px rgba(120,190,255,.7), inset 0 0 18px rgba(170,220,255,.6);}
.fxa-hexs{width:14px; height:14px; clip-path:polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%); background:linear-gradient(135deg, #e8f6ff, #7cc4ff); opacity:.9;}
.fxa-shellh{border-radius:50% 50% 14px 14px / 70% 70% 14px 14px; background:repeating-linear-gradient(120deg, rgba(255,255,255,.12) 0 10px, rgba(255,255,255,0) 10px 20px), linear-gradient(#cfe7f2, #8fb8cc); border:3px solid #6d93a8;}`);
// Shield soaks a blow: the dome flares where the hit lands, ripples, and a few hex chips fly.
M.shieldFlare = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), from = o.from == null ? -90 : o.from;
  const d = P('fxa-dome', '', c.x, c.y, {width:c.w*1.25, height:c.h*1.15, opacity:0, scale:.95});
  g.timeline({onComplete:()=> kill(d)}).to(d, {opacity:1, scale:1.03, duration:.08}).to(d, {scale:1, duration:.1}).to(d, {opacity:0, duration:.35, delay:.15});
  const px = c.x + Math.cos(from*D2R)*c.w*.55, py = c.y + Math.sin(from*D2R)*c.h*.52;
  ring(px, py, {color:'#cfeaff', size:60, w:3, glow:8, dur:340});
  spray(px, py, {n:5, cls:'fxa-hexs', d0:10, d1:26, dur:.4, spin:180, a0:from + 120, a1:from + 240});
  return done(700);
};
// Shield breaks: the dome cracks, then bursts into hexagon shards that tumble away.
M.shieldShatter = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), d = P('fxa-dome', '', c.x, c.y, {width:c.w*1.25, height:c.h*1.15, opacity:0}), sv = svgL();
  let p = ''; for(let k = 0; k < 4; k++){ let x = c.x, y = c.y, s = `M${x},${y}`; const a0 = k*90 + rnd(-30, 30); for(let j = 0; j < 4; j++){ x += Math.cos((a0 + rnd(-25, 25))*D2R)*c.w*.16; y += Math.sin((a0 + rnd(-25, 25))*D2R)*c.h*.14; s += ` L${x},${y}`; } p += `<path d="${s}" stroke="#fff" stroke-width="2" fill="none"/>`; }
  sv.innerHTML = p; g.set(sv, {opacity:0});
  g.timeline({onComplete:()=>{ kill(d); kill(sv); }}).to(d, {opacity:1, duration:.08}).to(sv, {opacity:1, duration:.04, delay:.08}).to(d, {x:'+=3', duration:.04, yoyo:true, repeat:3})
    .add(()=>{ g.set([d, sv], {opacity:0}); flash(el, 'brightness(1.5)', 70); spray(c.x, c.y, {n:16, cls:'fxa-hexs', d0:c.w*.3, d1:c.w*.9, grav:40, dur:.7, spin:360, s0:1, s1:.5}); ring(c.x, c.y, {color:'#cfeaff', size:c.w*1.8, w:3, dur:400}); });
  return done(1000);
};
// Shell ends: the shell outline cracks down the middle and its two halves fall away.
M.shellCrack = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  [0, 1].forEach(k=>{ const s = P('fxa-shellh', '', c.x, c.y, {width:c.w*1.08, height:c.h*1.04, opacity:0}); s.style.clipPath = k ? 'polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 54% 70%, 47% 45%, 55% 22%)' : 'polygon(0 0, 52% 0, 55% 22%, 47% 45%, 54% 70%, 46% 100%, 0 100%)';
    g.timeline({onComplete:()=> kill(s)}).to(s, {opacity:.85, duration:.12}).to(s, {x:k ? '+=3' : '-=3', duration:.05, delay:.15}).to(s, {x:k ? `+=${c.w*.4}` : `-=${c.w*.4}`, y:`+=${c.h*.5}`, rotation:k ? 25 : -25, opacity:0, duration:.5, ease:'power2.in'}); });
  later(()=> spray(c.x, c.y, {n:6, size:4, color:'#cfe7f2', d0:10, d1:30, grav:20, dur:.45}), 300);
  return done(1000);
};
// Nullify: a red seal stamps onto the card, it greys out and its skills fall silent.
css('null', `.fxa-seal{width:58px; height:58px; border-radius:50%; border:6px solid #e2402e; box-sizing:border-box; box-shadow:0 0 0 2px #fff4ea, 0 3px 8px rgba(0,0,0,.5);}
.fxa-seal::after{content:''; position:absolute; left:50%; top:50%; width:6px; height:56px; background:#e2402e; transform:translate(-50%,-50%) rotate(45deg);}`);
M.nullSeal = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), s = P('fxa-seal', '', c.x, c.y, {scale:2.4, opacity:0, rotation:-25});
  g.timeline({onComplete:()=> kill(s)}).to(s, {scale:1, opacity:1, rotation:0, duration:.16, ease:'power3.in'}).add(()=>{ nudge(el, [{s:1}, {s:.96, o:.3}, {s:1}], 200); ring(c.x, c.y, {color:'#ff8070', size:c.w*1.2, w:3, dur:300}); })
    .to(s, {opacity:0, scale:1.2, duration:.3, delay:.5});
  g.fromTo(tileOf(el), {filter:'grayscale(0) brightness(1)'}, {filter:'grayscale(1) brightness(.8)', duration:.2, delay:.16, yoyo:true, repeat:1, repeatDelay:.4, clearProps:'filter'});
  return done(1100);
};

// ======================= moving units around =======================
css('strings', `.fxa-string{stroke:#c9a2ff; stroke-width:1.5; fill:none; filter:drop-shadow(0 0 3px #a46bff);}`);
// Mind Control: violet puppet strings drop onto the card, tug it, its image is pulled across to the other side and the strings snap.
M.puppetStrings = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), top = Math.max(0, c.r.top - 160), sv = svgL(), xs = [-.3, 0, .3];
  sv.innerHTML = xs.map(k=> `<line class="fxa-string" x1="${c.x + k*c.w}" y1="${top}" x2="${c.x + k*c.w}" y2="${c.r.top + c.h*.2}"/>`).join('');
  const ls = [...sv.children]; ls.forEach(l=>{ const L = c.r.top + c.h*.2 - top; l.style.strokeDasharray = L; l.style.strokeDashoffset = L; });
  const to = o.to ? centre(tileOf(o.to)) : {x:c.x, y:c.y + (c.y < innerHeight/2 ? 1 : -1)*c.h*1.6};
  g.timeline({onComplete:()=> kill(sv)}).to(ls, {strokeDashoffset:0, duration:.25, stagger:.05}).add(()=>{ nudge(el, [{y:0}, {y:-10, o:.4}, {y:-6, o:.7}, {y:0}], 380); })
    .to(ls, {attr:{stroke:o.snapColor || '#3fb0a5'}, duration:.1, delay:.35}).to(ls, {opacity:0, duration:.2});
  later(()=>{ const gh = ghost(el); gh.inner.style.filter = 'hue-rotate(250deg) saturate(1.5) brightness(1.1)'; const st = {t:0}, A = {x:0, y:0}, B = {x:(to.x - c.x)/gh.z, y:(to.y - c.y)/gh.z}, Mx = {x:B.x/2 + 60, y:B.y/2 - 40};
    g.timeline({onComplete:()=> kill(gh.w)}).to(st, {t:1, duration:.45, ease:'power2.inOut', onUpdate:()=>{ const q = qpt(A, Mx, B, st.t); g.set(gh.inner, {x:q.x, y:q.y, rotation:Math.sin(st.t*Math.PI)*12, opacity:1 - st.t*.6}); }}).to(gh.inner, {opacity:0, duration:.15}); }, 520);
  return done(1300);
};
// Swap / Scurry: two curved arrows cross between the cards' places and a ghost of each slides over.
M.swapArcs = function(a, b){
  const g = G(); if(!g || !a || !b) return done(0); const A = centre(tileOf(a)), B = centre(tileOf(b)), up = -Math.max(30, Math.abs(B.x - A.x)*.25), sv = svgL();
  const path = (p, q, s)=> `M${p.x},${p.y + s*10} Q${(p.x + q.x)/2},${(p.y + q.y)/2 + s*up} ${q.x},${q.y + s*10}`;
  sv.innerHTML = `<defs><marker id="fxaArr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff4d0"/></marker></defs>
    <path d="${path(A, B, 1)}" stroke="#fff4d0" stroke-width="3" fill="none" stroke-linecap="round" marker-end="url(#fxaArr)" style="filter:drop-shadow(0 1px 2px #000)"/>
    <path d="${path(B, A, -1)}" stroke="#fff4d0" stroke-width="3" fill="none" stroke-linecap="round" marker-end="url(#fxaArr)" style="filter:drop-shadow(0 1px 2px #000)"/>`;
  [...sv.querySelectorAll('path[d^="M"]')].slice(1).forEach(p=>{ const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; g.to(p, {strokeDashoffset:0, duration:.35, ease:'power2.out'}); });
  g.to(sv, {opacity:0, duration:.3, delay:.6, onComplete:()=> kill(sv)});
  [[a, A, B, 1], [b, B, A, -1]].forEach(([el, p, q, s])=>{ const gh = ghost(el); gh.inner.style.opacity = .55; const st = {t:0}, Mx = {x:(q.x - p.x)/2/gh.z, y:s*up/gh.z};
    g.timeline({onComplete:()=> kill(gh.w)}).to(st, {t:1, duration:.4, ease:'power2.inOut', onUpdate:()=>{ const z = qpt({x:0, y:0}, Mx, {x:(q.x - p.x)/gh.z, y:(q.y - p.y)/gh.z}, st.t); g.set(gh.inner, {x:z.x, y:z.y}); }}).to(gh.inner, {opacity:0, duration:.15}); });
  return done(1000);
};
// Converge: a magnet pulls the line together: field lines sweep in from both ends and specks flow to the middle.
M.magnetPull = function(cards, o){
  o = o || {}; const g = G(); const list = (cards || []).filter(Boolean); if(!g || !list.length) return done(0);
  const cs = list.map(e=> centre(tileOf(e))), x0 = Math.min(...cs.map(c=> c.r.left)) - 30, x1 = Math.max(...cs.map(c=> c.r.right)) + 30, y = cs.reduce((s, c)=> s + c.y, 0)/cs.length, cx = (x0 + x1)/2, h = cs[0].h;
  const m = P('fxa-glyph', '🧲', cx, y - h*.62, {scale:.4, opacity:0, rotation:180}); g.timeline({onComplete:()=> kill(m)}).to(m, {scale:1.1, opacity:1, duration:.15, ease:'back.out(2)'}).to(m, {rotation:170, duration:.06, yoyo:true, repeat:5}).to(m, {opacity:0, duration:.2});
  const sv = svgL(); sv.innerHTML = [-1, 1].map(s=> [0, 1, 2].map(k=> `<path d="M${s < 0 ? x0 : x1},${y - h*.3 + k*h*.3} Q${cx + s*40},${y - h*.3 + k*h*.3 + (k - 1)*-20} ${cx + s*10},${y}" stroke="#e2402e" stroke-width="2" fill="none" stroke-dasharray="4 6" opacity=".85"/>`).join('')).join('');
  g.fromTo(sv.children, {strokeDashoffset:0}, {strokeDashoffset:-40, duration:.7, ease:'none'}); g.to(sv, {opacity:0, duration:.3, delay:.5, onComplete:()=> kill(sv)});
  for(let i = 0; i < 12; i++){ const s = i % 2 ? -1 : 1, p = P('fxa-dot', '', s < 0 ? x0 : x1, y + rnd(-h*.35, h*.35), {width:5, height:5}); p.style.background = '#ffd6c8';
    g.to(p, {x:cx, y, duration:.5, delay:i*.04, ease:'power2.in', onComplete:()=> kill(p)}); }
  return done(1000);
};
// Restless: little footprints step from where it stood to where it went.
M.footsteps = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), to = o.to ? centre(tileOf(o.to)) : {x:c.x + (o.dir || 1)*c.w*1.1, y:c.y};
  for(let k = 0; k < 5; k++){ const t = (k + .5)/5, p = P('fxa-p', '👣', c.x + (to.x - c.x)*t, c.r.bottom - 8 + (k % 2 ? 6 : -6), {opacity:0, rotation:to.x > c.x ? 90 : -90, scale:.7}); p.style.fontSize = '13px';
    g.timeline({delay:k*.08, onComplete:()=> kill(p)}).to(p, {opacity:.9, duration:.05}).to(p, {opacity:0, duration:.4, delay:.35}); }
  return done(1000);
};

// ======================= big skill moments: stun the player, exile, remember, spells =======================
css('bell', `.fxa-bell{font-size:34px; filter:drop-shadow(0 3px 4px rgba(0,0,0,.5));} .fxa-grey{background:rgba(52,52,64,.55); mix-blend-mode:saturation; border-radius:14px;}
.fxa-chain{font-size:16px; letter-spacing:-3px; color:#9aa0aa; filter:drop-shadow(0 1px 1px #000);}`);
// Player Stun: a bell tolls over the stunned side, its half of the field greys out and chains rattle across its castle.
M.bellToll = function(castle, o){
  o = o || {}; const g = G(); if(!g || !castle) return done(0); const c = centre(tileOf(castle)), area = o.area ? o.area.getBoundingClientRect() : null;
  // 2026-10-15: the bell hangs inside the window (the enemy castle sits on the top edge, so "above it" was clipped)
  const by = Math.max(30, c.r.top + c.h*.1);
  const b = P('fxa-bell', '🔔', c.x, by, {transformOrigin:'50% 10%', opacity:0, y:by - 26});
  g.timeline({onComplete:()=> kill(b)}).to(b, {opacity:1, y:by, duration:.2, ease:'back.out(2)'}).to(b, {rotation:28, duration:.14, ease:'sine.out'}).to(b, {rotation:-28, duration:.24, ease:'sine.inOut'})
    .to(b, {rotation:20, duration:.22, ease:'sine.inOut'}).to(b, {rotation:-12, duration:.2}).to(b, {rotation:0, opacity:0, duration:.3});
  [0, 1, 2].forEach(i=> ring(c.x, by, {color:'rgba(255,230,160,.9)', size:c.w*(1.6 + i*.6), w:3, dur:700, delay:200 + i*260}));
  if(area){ const gr = layer('fxa-grey'); g.set(gr, {x:area.left, y:area.top, width:area.width, height:area.height, opacity:0});
    g.timeline({onComplete:()=> kill(gr)}).to(gr, {opacity:1, duration:.25, delay:.2}).to(gr, {opacity:0, duration:.4, delay:.9}); }
  const ch = P('fxa-chain', '⛓⛓⛓⛓⛓', c.x, c.y, {rotation:-20, scaleX:0, opacity:0});
  g.timeline({delay:.35, onComplete:()=> kill(ch)}).to(ch, {scaleX:1, opacity:1, duration:.2}).to(ch, {x:'+=3', duration:.05, yoyo:true, repeat:7}).to(ch, {opacity:0, y:'+=10', duration:.3});
  flash(castle, 'grayscale(1) brightness(.75)', 300, 1);
  return done(1700);
};
// Exile from the board (the Forgotten Ones): a violet rift tears open, the card spirals into it, the rift seals and a candle
// echo 🕯️ flickers where it stood. The real card is hidden as it goes, so its ordinary death look doesn't play over the rift.
css('rift', `.fxa-rift{border-radius:50%; background:radial-gradient(ellipse, #08000f 0, #2a0a4a 30%, #7a3ad8 55%, rgba(190,140,255,.6) 68%, rgba(190,140,255,0) 74%); box-shadow:0 0 22px rgba(160,90,255,.8);}
.fxa-echo{font-size:22px; filter:drop-shadow(0 0 8px #ffcf6a);}`);
M.violetRift = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  const r = P('fxa-rift', '', c.x, c.y, {width:c.w*.5, height:c.h*1.15, scaleX:0, opacity:0});
  const gh = ghost(el); const card = el.closest ? (el.closest('.board-card') || el) : el; if(o.hide !== false) card.style.visibility = 'hidden';
  g.timeline({onComplete:()=> kill(r)}).to(r, {scaleX:1, opacity:1, duration:.2, ease:'power2.out'}).to(r, {width:c.w*1.1, duration:.25}, '<.05')
    .to(r, {scaleX:0, duration:.18, delay:.45, ease:'power3.in'}).add(()=>{ ring(c.x, c.y, {color:'#c9a2ff', size:c.w*1.6, w:3, glow:10, dur:420}); });
  g.set(gh.inner, {filter:'hue-rotate(0deg) brightness(1)'}); g.timeline({delay:.2, onComplete:()=>{ kill(gh.w); if(o.hide !== false && o.restore) card.style.visibility = ''; }}).to(gh.inner, {rotation:220, scale:.05, filter:'hue-rotate(250deg) brightness(.6)', opacity:.3, duration:.5, ease:'power2.in'});
  spray(c.x, c.y, {n:10, size:4, color:'#d6bcff', d0:c.w*.7, d1:c.w*1, dur:.5, s0:1, s1:.2, ease:'power2.in', delay:.15});
  later(()=>{ const e = P('fxa-echo', '🕯️', c.x, c.y + c.h*.2, {opacity:0, scale:.5}); g.timeline({onComplete:()=> kill(e)}).to(e, {opacity:1, scale:1, duration:.2}).to(e, {scaleY:1.1, duration:.12, yoyo:true, repeat:5}).to(e, {opacity:0, y:'-=12', duration:.4}); }, 850);
  return done(1900);
};
// Exile from the hand or the graveyard (Prayer, Exile Grave): a ghost card rises off the pile and unravels into violet smoke.
css('wisp', `.fxa-card{width:46px; height:60px; border-radius:7px; background:linear-gradient(160deg, #efe6ff, #b89ae8); box-shadow:0 0 0 2px #fff, 0 0 14px rgba(160,100,255,.8);}`);
M.exileWisp = function(anchor, o){
  o = o || {}; const g = G(); if(!g || !anchor) return done(0); const c = centre(anchor), k = P('fxa-card', '', c.x, c.y, {opacity:0, scale:.7});
  g.timeline({onComplete:()=> kill(k)}).to(k, {opacity:.95, y:`-=${30}`, scale:1, duration:.25, ease:'power2.out'}).to(k, {rotation:8, duration:.2}).to(k, {opacity:0, scaleY:1.4, scaleX:.5, y:'-=30', filter:'blur(4px)', duration:.4});
  later(()=> spray(c.x, c.y - 40, {n:9, cls:'fxa-puff', color:'radial-gradient(circle, rgba(190,150,255,.75) 0, rgba(120,70,200,0) 70%)', a0:240, a1:300, d0:20, d1:60, dur:.9, s0:.5, s1:1.6}), 420);
  if(o.prayer) later(()=> spray(c.x, c.y - 50, {n:6, html:'✦', size:11, color:'#ffe08a', a0:250, a1:290, d0:30, d1:60, dur:.8}), 450);
  return done(1500);
};
// Remember (returns from Exile): a candle flame, smoke rising, and the card condensing out of the smoke.
M.candleRise = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), t = tileOf(el);
  const e = P('fxa-echo', '🕯️', c.x, c.r.bottom - 10, {opacity:0, scale:.6}); g.timeline({onComplete:()=> kill(e)}).to(e, {opacity:1, scale:1, duration:.2}).to(e, {opacity:0, y:'-=8', duration:.3, delay:.6});
  spray(c.x, c.r.bottom - 22, {n:8, cls:'fxa-puff', color:'radial-gradient(circle, rgba(200,190,215,.8) 0, rgba(200,190,215,0) 70%)', jx:8, a0:262, a1:278, d0:c.h*.4, d1:c.h*.9, dur:.9, s0:.4, s1:2, stagger:.05});
  g.fromTo(t, {filter:'blur(6px) grayscale(1) brightness(1.4)', opacity:.2}, {filter:'blur(0px) grayscale(0) brightness(1)', opacity:1, duration:.7, delay:.25, ease:'power2.out', clearProps:'filter,opacity'});
  return done(1200);
};
// A spell card is cast: its card flies from the caster's hand to the middle of the board, flips in a flash, and a mote goes to each target.
M.spellCast = function(from, targets, o){
  o = o || {}; const g = G(); if(!g) return done(0); const list = (targets || []).filter(Boolean), a = from ? centre(from) : {x:innerWidth/2, y:innerHeight - 60};
  const mid = o.mid ? centre(o.mid) : list.length ? {x:list.reduce((s, e)=> s + centre(e).x, 0)/list.length, y:list.reduce((s, e)=> s + centre(e).y, 0)/list.length - 40} : {x:a.x, y:a.y - 160};
  const k = P('fxa-card', '', a.x, a.y, {opacity:0, scale:.6, rotation:-12}); k.style.background = `linear-gradient(160deg, ${o.c1 || '#fff6d8'}, ${o.c2 || '#e8b94a'})`;
  g.timeline({onComplete:()=> kill(k)}).to(k, {opacity:1, duration:.08}).to(k, {x:mid.x, y:mid.y, scale:1.1, rotation:0, duration:.35, ease:'power2.out'}, '<').to(k, {rotationY:180, duration:.18})
    .add(()=>{ ring(mid.x, mid.y, {color:o.c2 || '#ffd56e', size:130, w:4, glow:12, dur:420}); spray(mid.x, mid.y, {n:10, html:'✦', size:11, color:'#fff2b0', d0:20, d1:60, dur:.5});
      list.forEach((t, i)=>{ const b = centre(tileOf(t)), m = P('fxa-dot', '', mid.x, mid.y, {width:10, height:10}); m.style.background = '#fff'; m.style.boxShadow = `0 0 10px 3px ${o.c2 || '#ffd56e'}`;
        g.to(m, {x:b.x, y:b.y, duration:.28, delay:i*.06, ease:'power2.in', onComplete:()=>{ kill(m); ring(b.x, b.y, {color:o.c2 || '#ffd56e', size:b.w*1.1, w:2, dur:300}); flash(t, 'brightness(1.4)', 100); }}); }); })
    .to(k, {opacity:0, scale:1.4, duration:.25});
  return done(1300);
};
// Devour (The Gnawed): a pair of jaws (gums and a row of teeth each) snap shut over the card and it gulps (a bulge runs through it).
M.devourJaws = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), W = c.w*1.3, H = c.h*.34, n = 7, tw = W/n;
  const teeth = dir=> [...Array(n)].map((_, i)=> `<path d="M${i*tw + 1},0 L${(i + .5)*tw},${dir*H*.42} L${(i + 1)*tw - 1},0 Z" fill="#f4eedc" stroke="#9a8f78" stroke-width="1"/>`).join('');
  const sv = svgL();
  sv.innerHTML = `<g class="t" transform="translate(${c.x - W/2},${c.r.top - H*1.3})"><rect x="-4" y="${-H*.62}" width="${W + 8}" height="${H*.62}" rx="${H*.3}" fill="#5a1f22" stroke="#2a0b0d" stroke-width="2"/><g>${teeth(1)}</g></g>
    <g class="b" transform="translate(${c.x - W/2},${c.r.bottom + H*1.3})"><rect x="-4" y="0" width="${W + 8}" height="${H*.62}" rx="${H*.3}" fill="#5a1f22" stroke="#2a0b0d" stroke-width="2"/><g>${teeth(-1)}</g></g>`;
  const t = sv.querySelector('.t'), b = sv.querySelector('.b'); g.set(sv, {opacity:0});
  g.timeline({onComplete:()=> kill(sv)}).to(sv, {opacity:1, duration:.08})
    .to(t, {y:c.y - H*.36, duration:.17, ease:'power4.in'}, '<').to(b, {y:c.y + H*.36, duration:.17, ease:'power4.in'}, '<')
    .add(()=>{ spray(c.x, c.y, {n:6, html:'✶', size:11, color:'#fff', d0:c.w*.5, d1:c.w*.7, dur:.3}); nudge(el, [{x:0}, {x:-3, o:.3}, {x:3, o:.6}, {x:0}], 200); })
    .to([t, b], {y:'+=0', duration:.18}).to(sv, {opacity:0, duration:.25});
  later(()=> nudge(el, [{s:1}, {s:1.08, y:-4, o:.25}, {s:.96, y:2, o:.5}, {s:1.04, o:.75}, {s:1}], 520), 260);
  return done(1000);
};
// Equip: the item flies down onto the unit and locks on with a clank, a star and sparks.
M.equipClank = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), it = P('fxa-glyph', o.glyph || '🗡️', c.x + 30, c.r.top - 90, {rotation:-160, scale:1.4, opacity:0}); it.style.fontSize = '26px';
  g.timeline({onComplete:()=> kill(it)}).to(it, {opacity:1, duration:.08}).to(it, {x:c.x + c.w*.25, y:c.r.top + c.h*.3, rotation:-20, scale:1, duration:.32, ease:'power3.in'}, '<')
    .add(()=>{ const s = P('fxa-star', '', c.x + c.w*.25, c.r.top + c.h*.3, {width:46, height:46, scale:.2}); s.style.background = 'radial-gradient(circle, #fff 0, #ffe08a 50%, #e0a35a)';
      g.timeline({onComplete:()=> kill(s)}).to(s, {scale:1, duration:.08}).to(s, {scale:1.3, opacity:0, duration:.2});
      spray(c.x + c.w*.25, c.r.top + c.h*.3, {n:9, cls:'fxa-spark', color:'#ffe08a', d0:12, d1:30, dur:.3, orient:true}); nudge(el, [{y:0}, {y:5, o:.2}, {y:0}], 240); flash(el, 'brightness(1.3)', 90); })
    .to(it, {opacity:0, scale:.6, duration:.3, delay:.35});
  return done(1100);
};
// Dark Summon sacrifice (Ashen Choir): a red sigil burns in under the slot and the offered card sinks into it.
const SIGIL = (R, col)=> `<circle r="${R}" fill="none" stroke="${col}" stroke-width="2.5"/><circle r="${R*.8}" fill="none" stroke="${col}" stroke-width="1.5"/>
  <path d="${[0, 1, 2, 3, 4].map(i=>{ const a = -90 + i*144; return `${i ? 'L' : 'M'}${Math.cos(a*D2R)*R*.8},${Math.sin(a*D2R)*R*.8}`; }).join(' ')}Z" fill="none" stroke="${col}" stroke-width="1.8"/>
  ${[...Array(8)].map((_, i)=>{ const a = i*45; return `<text x="${Math.cos(a*D2R)*R*.9}" y="${Math.sin(a*D2R)*R*.9 + 4}" font-size="10" text-anchor="middle" fill="${col}" style="font-family:serif">${RUNES[i]}</text>`; }).join('')}`;
M.ritualSigil = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), R = c.w*.62, sv = svgL();
  sv.innerHTML = `<g transform="translate(${c.x},${c.r.bottom - c.h*.12}) scale(1,.42)"><g class="s" style="filter:drop-shadow(0 0 6px #ff3a2a)">${SIGIL(R, o.color || '#ff4a30')}</g></g>`;
  const s = sv.querySelector('.s'); g.set(s, {transformOrigin:'0 0', scale:.2, opacity:0, rotation:-90});
  g.timeline({onComplete:()=> kill(sv)}).to(s, {scale:1, opacity:1, rotation:0, duration:.35, ease:'power2.out'}).to(s, {rotation:40, duration:.8, ease:'none'}).to(s, {opacity:0, duration:.3}, '-=.3');
  if(o.sink !== false){ const gh = ghost(el); g.set(gh.inner, {filter:'brightness(1) sepia(0) hue-rotate(0deg)'}); g.to(gh.inner, {y:c.h*.4/gh.z, scaleY:.3, opacity:0, filter:'brightness(.3) sepia(1) hue-rotate(-30deg)', duration:.55, delay:.35, ease:'power2.in', onComplete:()=> kill(gh.w)}); }
  spray(c.x, c.r.bottom - c.h*.12, {n:10, size:4, color:'#ff8a5a', style:{boxShadow:'0 0 5px #ff3a1a'}, jx:R*.8, a0:262, a1:278, d0:20, d1:c.h*.6, dur:.8, delay:.3, stagger:.03});
  return done(1300);
};
// Satiety: it's full. A honey pot pops up, a warm golden glow and a contented little puff.
M.satietyFull = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), h = P('fxa-glyph', '🍯', c.x, c.r.top + c.h*.15, {scale:.3, opacity:0});
  g.timeline({onComplete:()=> kill(h)}).to(h, {scale:1.1, opacity:1, y:'-=12', duration:.22, ease:'back.out(2.5)'}).to(h, {rotation:-10, duration:.12, yoyo:true, repeat:3}).to(h, {opacity:0, y:'-=10', duration:.3});
  ring(c.x, c.y, {color:'rgba(255,214,110,.9)', size:c.w*1.4, w:3, glow:8, dur:600});
  nudge(el, [{s:1}, {s:1.06, o:.35}, {s:1}], 500); flash(el, 'brightness(1.2) sepia(.35)', 220);
  return done(1100);
};
// Shedding / Molting (Grass Viper): a translucent copy of the card peels off and drifts away like a cast skin.
M.skinShed = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const gh = ghost(el); gh.inner.style.filter = 'sepia(.6) saturate(.5) brightness(1.4)'; gh.inner.style.opacity = .55;
  g.timeline({onComplete:()=> kill(gh.w)}).to(gh.inner, {skewX:8, duration:.15}).to(gh.inner, {x:40/gh.z, y:-26/gh.z, rotation:14, skewX:-6, scale:1.06, opacity:0, duration:.7, ease:'power1.out'});
  if(o.molt) later(()=> flash(el, 'brightness(1.3) saturate(1.3)', 160), 150);
  return done(1000);
};
// First Blood: a red splash star, droplets and a slash mark.
M.firstBloodSplash = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), s = P('fxa-star', '', c.x, c.y, {width:c.w*.9, height:c.w*.9, scale:.2, rotation:rnd(0, 60)});
  s.style.background = 'radial-gradient(circle, #ff6a6a 0, #c4121e 60%, #7a0810)';
  g.timeline({onComplete:()=> kill(s)}).to(s, {scale:1, duration:.1, ease:'power3.out'}).to(s, {opacity:0, scale:1.1, duration:.4, delay:.2});
  spray(c.x, c.y, {n:10, cls:'fxa-drop', style:{background:'linear-gradient(#ff7a7a, #a0101a)'}, d0:c.w*.3, d1:c.w*.7, grav:24, dur:.5});
  later(()=> tag(el, '1st 🩸', 'linear-gradient(#c4121e, #7a0810)', {fx:.25}), 60);
  return done(1350);
};
// Bludgeon breaks a trait: a hammer slams down and the trait's icon cracks in two.
M.bludgeonBreak = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), ic = ({armor:'🛡️', flying:'🪽', swimmer:'🏊', burrow:'⛏️'})[o.broke] || '✨';
  const hm = P('fxa-glyph', '🔨', c.x + c.w*.4, c.r.top - 30, {rotation:60, scale:1.3, transformOrigin:'80% 80%'}); hm.style.fontSize = '28px';
  const halves = [0, 1].map(k=>{ const h = P('fxa-glyph', ic, c.x, c.r.top + c.h*.3, {opacity:0}); h.style.fontSize = '26px'; h.style.clipPath = k ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)'; return h; });
  g.to(halves, {opacity:1, duration:.1});
  g.timeline({onComplete:()=> kill(hm)}).to(hm, {rotation:-30, x:c.x + c.w*.15, y:c.r.top + c.h*.15, duration:.18, ease:'power4.in', delay:.1})
    .add(()=>{ nudge(el, [{y:0}, {y:7, s:.97, o:.2}, {y:0}], 260); spray(c.x, c.r.top + c.h*.3, {n:8, html:'✶', size:10, color:'#fff', d0:12, d1:30, dur:.3});
      g.to(halves[0], {x:'-=24', y:'+=40', rotation:-40, opacity:0, duration:.55, ease:'power1.in', onComplete:()=> kill(halves[0])}); g.to(halves[1], {x:'+=24', y:'+=40', rotation:40, opacity:0, duration:.55, ease:'power1.in', onComplete:()=> kill(halves[1])}); })
    .to(hm, {opacity:0, duration:.2, delay:.15});
  return done(1000);
};
// Irradiated source pulse (Uranium, World 3): sickly green rings, a spinning trefoil and a geiger flicker on the card.
M.radPulse = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  [0, 1, 2].forEach(i=> ring(c.x, c.y, {color:'rgba(170,255,60,.9)', size:c.w*(1.6 + i*.5), w:3, glow:12, dur:700, delay:i*150}));
  const tr = P('fxa-glyph', '☢️', c.x, c.r.top + c.h*.15, {scale:.4, opacity:0}); g.timeline({onComplete:()=> kill(tr)}).to(tr, {scale:1, opacity:1, duration:.15}).to(tr, {rotation:180, duration:.7, ease:'power1.inOut'}, '<').to(tr, {opacity:0, duration:.2});
  flash(el, 'brightness(1.3) sepia(.6) hue-rotate(40deg) saturate(2)', 60, 5);
  return done(1100);
};
// Keen Eye: an eye opens on the Keen Eye unit and a scanning beam sweeps the hidden Changelings; each disguise peels off.
M.keenReveal = function(eye, targets){
  const g = G(); if(!g || !eye) return done(0); const a = centre(tileOf(eye)), list = (targets || []).filter(Boolean);
  const e = P('fxa-glyph', '👁️', a.x, a.r.top + a.h*.2, {scaleY:.1, opacity:0}); e.style.fontSize = '26px';
  g.timeline({onComplete:()=> kill(e)}).to(e, {opacity:1, scaleY:1, duration:.2, ease:'back.out(2)'}).to(e, {opacity:0, duration:.3, delay:.7});
  list.forEach((t, i)=>{ const b = centre(tileOf(t)), L = Math.hypot(b.x - a.x, b.y - a.y), bm = P('fxa-p', '', (a.x + b.x)/2, (a.y + b.y)/2, {width:L, height:10, rotation:angTo(a, b), scaleX:0, opacity:.85});
    bm.style.background = 'linear-gradient(90deg, rgba(255,240,170,.2), rgba(255,240,170,.9))'; 
    g.timeline({delay:.25 + i*.15, onComplete:()=> kill(bm)}).to(bm, {scaleX:1, duration:.2}).to(bm, {opacity:0, duration:.25, delay:.15});
    later(()=>{ const gh = ghost(t); gh.inner.style.filter = 'grayscale(1) brightness(1.5)'; g.to(gh.inner, {y:-20/gh.z, rotation:-8, opacity:0, duration:.45, onComplete:()=> kill(gh.w)}); flash(t, 'brightness(1.4) sepia(.3)', 120); }, 480 + i*150); });
  return done(1200 + list.length*150);
};
// Desecrate: a black sigil burns into the felt under that slot, edged with embers.
M.cursedSigil = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), R = c.w*.66, sv = svgL();
  sv.innerHTML = `<g transform="translate(${c.x},${c.r.bottom - c.h*.06}) scale(1,.4)"><g class="s" style="filter:drop-shadow(0 0 4px #ff7a2a) drop-shadow(0 0 2px #000)">${SIGIL(R, '#120a10')}</g></g>`;
  const s = sv.querySelector('.s'); g.set(s, {transformOrigin:'0 0', scale:.3, opacity:0});
  g.timeline({onComplete:()=> kill(sv)}).to(s, {scale:1, opacity:1, duration:.3, ease:'power2.out'}).to(s, {rotation:-25, duration:1.2, ease:'none'}).to(s, {opacity:0, duration:.5}, '-=.5');
  spray(c.x, c.r.bottom - c.h*.06, {n:12, size:3, color:'#ff8a3a', style:{boxShadow:'0 0 4px #ff5a1a'}, jx:R*.9, jy:6, a0:262, a1:278, d0:10, d1:30, dur:.7, stagger:.04});
  spray(c.x, c.r.bottom - c.h*.06, {n:5, cls:'fxa-puff', color:'radial-gradient(circle, rgba(20,14,20,.8) 0, rgba(20,14,20,0) 70%)', jx:R*.7, a0:260, a1:280, d0:20, d1:50, dur:1, s0:.4, s1:1.6, delay:.2});
  return done(1500);
};
// Conditional stats (Kinship, Loyal, Usurper, Lone Wolf, Sociable, Defiance, Pack chain, Rainrunner...): the condition's own glyph
// circles the card in its colour as the bonus switches on; when it switches off the glyph dims and drops away.
const COND = {kinship:['🤝', '#7fd67a'], loyal:['💛', '#ffd23a'], usurper:['👑', '#c070ff'], loneWolf:['🐺', '#9fb4d8'], sociable:['💬', '#7ad0ff'], defiance:['✊', '#ff7a4a'],
  packChain:['⛓️', '#c8c8d0'], rainrunner:['🐸', '#5fc4ff'], timber:['🪵', '#c08a4e'], rockSolid:['🪨', '#b0a898'], ironWill:['🔩', '#a8b4c4'], moonborn:['🌙', '#d8d0ff'], bloomWhen:['🌸', '#ff9ad0'], swimmer:['🌊', '#4fb4ff']};
M.COND = COND;
M.condAura = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), [gl, col] = COND[o.kind] || ['✦', '#ffe28a'], grow = o.grow !== false;
  if(grow){ ring(c.x, c.y, {color:col, size:c.w*1.5, w:3, glow:10, dur:600}); const R = c.w*.62, st = {a:0};
    const gs = [0, 1, 2].map(i=> P('fxa-glyph', gl, c.x, c.y, {opacity:0, scale:.6})); gs.forEach(x=> x.style.fontSize = '16px');
    g.to(gs, {opacity:1, duration:.15}); g.to(st, {a:Math.PI*1.6, duration:.9, ease:'power1.inOut', onUpdate:()=> gs.forEach((x, i)=> g.set(x, {x:c.x + Math.cos(st.a + i*2.09)*R, y:c.y + Math.sin(st.a + i*2.09)*R*1.15})),
      onComplete:()=> g.to(gs, {x:c.x, y:c.y, scale:.2, opacity:0, duration:.2, onComplete:()=> gs.forEach(kill)})});
    later(()=> flash(el, 'brightness(1.3) saturate(1.3)', 140), 900); }
  else { const x = P('fxa-glyph', gl, c.x, c.r.top + c.h*.2, {opacity:.9}); x.style.filter = 'grayscale(1)'; g.to(x, {y:`+=${c.h*.5}`, opacity:0, rotation:30, duration:.7, ease:'power1.in', onComplete:()=> kill(x)}); flash(el, 'grayscale(.7) brightness(.85)', 200); }
  return done(1200);
};
// Dry / heat-resistant unit spared by Scorching: heat ripples bend round it and a cool outline glints.
css('heat', `.fxa-heatline{width:2px; border-radius:2px; background:linear-gradient(rgba(255,180,90,0), rgba(255,200,120,.85), rgba(255,180,90,0));}`);
M.heatBend = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  for(let i = 0; i < 8; i++){ const side = i % 2 ? 1 : -1, x = c.x + side*c.w*rnd(.55, .75), l = P('fxa-heatline', '', x, c.r.bottom, {height:c.h*.5, opacity:0});
    g.timeline({delay:i*.06, onComplete:()=> kill(l)}).to(l, {opacity:1, duration:.1}).to(l, {y:c.r.top, x:`+=${side*10}`, skewX:side*15, duration:.7, ease:'sine.inOut'}, '<').to(l, {opacity:0, duration:.2}, '-=.2'); }
  const o2 = over(el, '', 3); o2.style.boxShadow = '0 0 0 2px rgba(150,220,255,.9), 0 0 16px rgba(120,200,255,.7)'; g.fromTo(o2, {opacity:0}, {opacity:1, duration:.2, yoyo:true, repeat:1, repeatDelay:.3, onComplete:()=> kill(o2)});
  later(()=> tag(el, 'Dry', 'linear-gradient(#c49a4e, #8a6420)', {fx:.25, hold:420}), 200);
  return done(1300);
};
// Demolisher vs a Structure: a hammer-crack and bricks knocked out of it.
M.demolishCrack = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el));
  spray(c.x, c.y, {n:9, size:()=> rnd(7, 10), color:i=> i % 2 ? '#b8562a' : '#d87a44', style:{height:'6px', borderRadius:'1px', boxShadow:'inset 0 -2px 0 rgba(0,0,0,.25)'}, spin:300, a0:180, a1:360, d0:c.w*.3, d1:c.w*.8, grav:40, dur:.6});
  M.weakCrackOnly(el);
  later(()=> tag(el, '🔨 Demolish', 'linear-gradient(#b8562a, #7a3412)', {fx:.3, hold:420}), 80);
  return done(1150);
};
M.weakCrackOnly = function(el){
  const g = G(); if(!g || !el) return; const c = centre(tileOf(el)), sv = svgL(); let d = '';
  for(let k = 0; k < 3; k++){ let x = c.x, y = c.y, s = `M${x},${y}`; const a0 = rnd(0, 360); for(let j = 0; j < 3; j++){ x += Math.cos((a0 + rnd(-30, 30))*D2R)*c.w*.15; y += Math.sin((a0 + rnd(-30, 30))*D2R)*c.h*.12; s += ` L${x},${y}`; } d += `<path d="${s}" stroke="#2a1a10" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
  sv.innerHTML = d; g.fromTo(sv, {opacity:1}, {opacity:0, duration:.3, delay:.45, onComplete:()=> kill(sv)});
};
// Supreme beast strike (dragons, sphinxes, leviathans; Map 50+): prismatic sparkle shards and the struck card's armour shattering.
M.supremeSparkle = function(el){
  const g = G(); if(!g || !el) return done(0); const c = centre(tileOf(el)), cols = ['#ff5e7e', '#ffd56e', '#7dffb0', '#6ad8ff', '#c08aff'];
  const f = P('fxa-flare', '', c.x, c.y, {width:c.w*1.6, height:c.w*1.6, scale:.2}); f.style.background = 'conic-gradient(from 0deg, #ff5e7e, #ffd56e, #7dffb0, #6ad8ff, #c08aff, #ff5e7e)'; f.style.opacity = .7;
  f.style.webkitMask = f.style.mask = 'radial-gradient(circle, #000 0, rgba(0,0,0,.6) 40%, transparent 68%)';
  g.to(f, {scale:1.1, rotation:120, opacity:0, duration:.5, ease:'power2.out', onComplete:()=> kill(f)});
  spray(c.x, c.y, {n:16, html:'✦', size:()=> rnd(9, 16), color:i=> cols[i % cols.length], style:{textShadow:'0 0 6px #fff'}, d0:c.w*.35, d1:c.w*.95, dur:.65, spin:270});
  spray(c.x, c.y, {n:7, size:()=> rnd(8, 12), color:'#a8b0bc', style:{borderRadius:'2px', boxShadow:'inset 0 0 0 1px #e6eaf0'}, spin:300, d0:c.w*.3, d1:c.w*.7, grav:36, dur:.6});
  return done(900);
};
// Rainrunner (Thistlewood): it skims across the puddles, ripple rings skipping in a line from it to the castle.
M.puddleSkim = function(att, castle){
  const g = G(); if(!g || !att || !castle) return done(0); const a = centre(tileOf(att)), b = centre(tileOf(castle));
  for(let i = 0; i < 5; i++){ const t = (i + 1)/6, x = a.x + (b.x - a.x)*t, y = a.y + (b.y - a.y)*t;
    later(()=>{ ring(x, y, {color:'rgba(170,225,255,.95)', size:46, sy:.4, w:2, dur:520}); spray(x, y, {n:4, cls:'fxa-drop', a0:220, a1:320, d0:6, d1:16, grav:12, dur:.35}); const f = P('fxa-p', '🐸', x, y - 6, {opacity:.9, scale:.6}); f.style.fontSize = '14px'; g.to(f, {opacity:0, y:'-=10', duration:.25, onComplete:()=> kill(f)}); }, i*70); }
  later(()=> M.impactWater_C(castle), 420);
  return done(1200);
};

// ======================= game wiring (2026-10-15) =======================
// Where a new look replaces an older one the game still draws (the emoji missile, the lava-shaped wave geyser, the CSS dynamite
// blast), the old element is hidden as it appears instead of editing arena_app.js: hideNext watches <body> for the next matching
// node for a short window. The old looks stay in the Lab as variant B.
function hideNext(match, ms){
  if(typeof MutationObserver === 'undefined' || !document.body) return;
  const mo = new MutationObserver(list=>{ for(const m of list) for(const n of m.addedNodes){ if(n.nodeType === 1 && match(n)){ n.style.visibility = 'hidden'; mo.disconnect(); return; } } });
  mo.observe(document.body, {childList:true}); later(()=> mo.disconnect(), ms || 1200);
}
const GLYPH = {cold:'❄', heat:'🔥', acid:'🧪', poison:'☠', decay:'🦠', magic:'🪄', water:'💧'};
const glyphOf = t=>{ try{ if(typeof dmgGlyph === 'function') return dmgGlyph(t); }catch(e){} return GLYPH[t] || '➶'; };
const hideProjectile = (glyph, ms)=> hideNext(n=> n.classList && n.classList.contains('projectile') && n.textContent === glyph, ms);
const am = ()=>{ try{ if(typeof animMs === 'function') return animMs(); }catch(e){} return {windup:390, strike:570, projectile:690, impactPad:180, death:480}; };
const arrowMs = ()=>{ try{ if(typeof arrowFlightMs === 'function') return arrowFlightMs(); }catch(e){} return 260; };
const hq = side=>{ try{ if(typeof hqTileEl === 'function') return hqTileEl(side); }catch(e){} return document.querySelector(`[data-hq="${side}"]`); };
const rowCards = el=>{ const row = el && el.closest && el.closest('#rowEnemy, #rowMine'); return row ? [...row.querySelectorAll('.board-card')].filter(b=> b.querySelector('.card-tile')) : []; };
const sideRow = side=> document.getElementById(side === 'A' ? 'rowMine' : 'rowEnemy');
// The game's battlefield point-light has no colour for magic, water or true damage (they fell back to physical); add them once.
let lightsDone = false;
function ensureLights(){ ensureDmgTypes(); if(lightsDone) return; try{ if(typeof LIGHT_COLORS !== 'undefined'){ ['magic', 'water', 'true'].forEach(k=>{ if(!LIGHT_COLORS[k]) LIGHT_COLORS[k] = TYPE[k].light; }); lightsDone = true; } }catch(e){ lightsDone = true; } }
// 2026-10-15: every damage type gets its own number colour and hit-burst glyph. The game's DMG_ICON had no magic, water or
// true entry (their numbers were plain white with no icon) and drew acid and decay in poison green; ELEMENTAL_BURST_GLYPH
// had no magic or water. Both tables are extended in place once (arena_app.js is untouched); the colours come from TYPE.
const DMG_TYPES = {acid:['🧪', 'acid'], decay:['🦠', 'decay'], magic:['🪄', 'magic'], water:['💧', 'water'], true:['✧', 'true']};
M.DMG_TYPES = DMG_TYPES;
css('dmgnum', `
.dmg-float.acid{--g1:#fbffd6; --g2:#b6d81e; --edge:#1f2602;}
.dmg-float.decay{--g1:#f1e6ff; --g2:#8e64c4; --edge:#1c0d30;}
.dmg-float.magic{--g1:#fff4cc; --g2:#a46bff; --edge:#1d0a3a;}
.dmg-float.water{--g1:#ecfbff; --g2:#2f9be0; --edge:#04203a;}
.dmg-float.true{--g1:#ffffff; --g2:#d9dde2; --edge:#000000;}
.dmg-float.true .df-ico{text-shadow:0 0 6px #fff, 0 2px 0 rgba(0,0,0,.6);}
.fx-burst-magic{--elemental-glow: rgba(170,110,255,.9);}
.fx-burst-water{--elemental-glow: rgba(70,170,240,.9);}
.fx-burst-true{--elemental-glow: rgba(255,255,255,.95);}
`);
let dmgTypesDone = false;
function ensureDmgTypes(){
  if(dmgTypesDone) return;
  try{
    if(typeof DMG_ICON === 'undefined') return;
    Object.keys(DMG_TYPES).forEach(k=>{ const cur = DMG_ICON[k]; if(!cur || cur[1] === 'poison') DMG_ICON[k] = DMG_TYPES[k].slice(); });
    if(typeof ELEMENTAL_BURST_GLYPH !== 'undefined') ['magic', 'water', 'true'].forEach(k=>{ if(!ELEMENTAL_BURST_GLYPH[k]) ELEMENTAL_BURST_GLYPH[k] = DMG_TYPES[k][0]; });
    dmgTypesDone = true;
  }catch(e){ dmgTypesDone = true; }
}
M.ensureDmgTypes = ensureDmgTypes;
if(document.readyState && document.readyState !== 'loading') later(ensureDmgTypes, 0);
else if(document.addEventListener) document.addEventListener('DOMContentLoaded', ()=>{ ensureDmgTypes(); ensureLights(); });
// Per-match notes (an Ice/Volley arrow in flight, a castle ballista bolt about to fire).
let ST = null;
const state = env=>{ if(!ST || ST.match !== env.match) ST = {match:env.match, arrow:{}, ballista:{}}; return ST; };
const IMPACT_LIVE = new Set(['acid', 'poison', 'decay', 'magic', 'water', 'true']);
M.onEvent = function(ev, env){
  if(!ev || !env) return; ensureLights();
  const med = env.fxAtLeast('med'), high = env.fxAtLeast('high'), low = env.fxAtLeast('low'), st = state(env), el = env.el, fxOf = env.fxOf, defs = env.defs, A = am();
  const T = ev.type;
  if(T === 'arrow'){
    if(ev.ice || ev.volley) st.arrow[ev.uid] = {ice:!!ev.ice, volley:!!ev.volley};
    if(ev.volley && high && env.once('volleyRain' + ev.uid)){ const sh = el(ev.uid), te = ev.targetUid != null ? el(ev.targetUid) : null, ts = te ? rowCards(te) : [hq(ev.targetSide)].filter(Boolean);
      if(sh && ts.length) M.arrowRain(sh, ts, {lead:true, draw:Math.round(A.windup*.6), flight:arrowMs() + 80}); }
    return;
  }
  if(T === 'hit' || T === 'hitHQ'){
    const att = el(ev.attUid), castle = T === 'hitHQ' ? hq(ev.targetSide) : null, tgt = castle || el(ev.targetUid), af = fxOf(ev.attDefId), tf = fxOf(ev.targetDefId), hitMs = env.hitAtMs(ev);
    if(!tgt) return;
    const m = env.match || {}, pa = m.pendingArrow, pb = m.pendingBolt;
    const isArrow = !!(ev.ranged && pa && String(pa.uid) === String(ev.attUid)), isBolt = !!(ev.ranged && !isArrow && pb && String(pb.uid) === String(ev.attUid));
    let impactDone = false;
    if(ev.ranged && !ev.quake){
      if(isArrow){ const ar = st.arrow[ev.attUid]; delete st.arrow[ev.attUid];
        if(ar && ar.ice && med) M.iceArrow(att || hq(ev.side), tgt, {overlayOnly:true, draw:Math.round(A.windup*.6), flight:arrowMs()}); }
      else if(!isBolt){
        const key = String(ev.targetUid != null ? ev.targetUid : 'hq' + ev.targetSide);
        if(st.ballista[key] && med){ delete st.ballista[key]; hideProjectile(glyphOf(ev.dmgType), A.windup + 600); env.at(A.windup, ()=> M.ballista(hq(ev.side), tgt, {flight:Math.round(A.projectile*.6)})); impactDone = true; }
        else if(ev.retribution && med){ hideProjectile(glyphOf(ev.dmgType), A.windup + 600); env.at(Math.max(0, A.windup + A.projectile - 160), ()=> M.holyBeam(tgt)); impactDone = true; }
        else if(med){ const from = att || hq(ev.side), type = ev.dmgType || 'physical'; hideProjectile(glyphOf(ev.dmgType), A.windup + 600);
          env.at(A.windup, ()=> M.missile(from, tgt, {type, flight:A.projectile})); impactDone = true; }
      }
    }
    // the damage type where it lands (the four that had no look of their own, and the three that had nothing at all)
    if(!impactDone && !af.supreme && !ev.armorBlocked && (ev.dmg || 0) > 0 && IMPACT_LIVE.has(ev.dmgType) && med && M.IMPACT[ev.dmgType] && env.once('dmgfx' + ev.dmgType + ':' + (ev.targetUid != null ? ev.targetUid : ev.targetSide) + ':' + ev.attUid))
      env.at(ev.quake ? 60 : hitMs, ()=> M.IMPACT[ev.dmgType](tgt));
    // Resist ½ / Weak ×2 / Immune: say why the number is small or big (readable, so Low effects and up)
    if(T === 'hit' && low){ const f = hitFactor(ev, defs);
      if(f !== 1) env.at((ev.quake ? 60 : hitMs) + 40, ()=>{ const t2 = el(ev.targetUid) || tgt; if(f === 0) M.immuneHit(t2); else if(f < 1) M.resistHit(t2); else M.weakHit(t2); }); }
    if(T === 'hit' && (ev.dmg || 0) >= 8 && !ev.armorBlocked && high && env.once('heavyshock' + ev.targetUid)) env.at(hitMs + 80, ()=>{ const t2 = el(ev.targetUid); if(t2) M.heavyShock(t2, {cards:rowCards(t2).filter(x=> x !== t2)}); });
    if(ev.crit && !ev.ambush && med){ const fa = factionOf(defs[ev.attDefId]); if(fa) env.at(hitMs, ()=> M.critSparks(tgt, {colors:fa.sparks})); }
    if(T === 'hitHQ' && ev.fork && med) env.at(Math.max(0, hitMs - 140), ()=> M.prongCastle(att, castle, {kind:ev.prong, delay:140}));
    if(ev.ambush && att && med) M.ambushStrike(att, tgt);
    if(af.swift && att && !ev.ranged && !ev.pounce && med && env.once('swift' + ev.attUid)) env.at(Math.round(A.windup*.7), ()=> M.swiftBlur(att, tgt)); // (not on a Pounce: it has its own leap, 2026-10-15)
    if(T === 'hit' && tf.scare && att && !ev.ranged && med && env.once('scared' + ev.attUid)) M.fearTell(att);
    if(ev.guardianRedirect && med) env.at(Math.max(0, hitMs - 220), ()=> M.guardPull(att, tgt));
    if(ev.boomerang && ev.friendly && med) env.at(hitMs, ()=> M.friendlyBonk(tgt));
    if(castle){ const below = att ? centre(att).y > centre(castle).y : ev.targetSide === 'B';
      if(ev.siege && med) env.at(Math.max(0, hitMs - 120), ()=> M.siegeRam(castle, {fromBelow:below}));
      if(ev.bulwark > 0 && med) env.at(Math.max(0, hitMs - 80), ()=> M.bulwarkWall(castle, {fromBelow:below}));
      if(af.rainrunner && med){ let rain = false; try{ const fl = m.engine && m.engine.getField && m.engine.getField(); rain = !!(fl && fl.id === 'rain'); }catch(e){} if(rain && att) M.puddleSkim(att, castle); } }
    if(ev.festerBonus > 0 && med) env.at(hitMs + 60, ()=> M.festerBoils(tgt));
    if(ev.ruptureBonus > 0 && med) env.at(hitMs + 60, ()=> M.ruptureBurst(tgt));
    if(af.reload && att && med) env.at(A.strike + 60, ()=> M.reloadDial(att));
    if(T === 'hit' && Number(af.demolisher) > 0 && ((defs[ev.targetDefId] || {}).archetypes || []).includes('Structure') && med) env.at(hitMs, ()=> M.demolishCrack(tgt));
    if(af.supreme && med && env.once('supreme' + ev.attUid + ':' + (ev.targetUid || ev.targetSide))) env.at(hitMs, ()=> M.supremeSparkle(tgt));
    return;
  }
  if(T === 'evaded'){
    const t = el(ev.targetUid); if(!t || !med) return; const at = env.hitAtMs(ev), r = ev.reason;
    const fn = r === 'flying' ? ()=> M.flyLift(t) : r === 'fog' ? ()=> M.fogSwallow(t, el(ev.attUid)) : r === 'illusory' ? ()=> M.illusorySplit(t) : r === 'shadow' ? ()=> M.shadowPass(t) : r === 'smoke' ? ()=> M.smokeSwallow(t) : null;
    if(fn) env.at(Math.max(0, at - 60), fn); return;
  }
  if(!med && !['statusFx', 'stunPlayer', 'shieldSoak', 'curse'].includes(T)) return;
  switch(T){
    case 'blindMiss': { const a = el(ev.attUid); if(a) env.at(Math.round(A.windup*.5), ()=> M.blindSwing(a, {night:!!ev.night})); break; }
    case 'confusedWhiff': { const a = el(ev.uid); if(a) M.fizzle(a); break; }
    case 'tipsySwing': { const a = el(ev.attUid); if(a) M.tipsyBubbles(a, {drift:ev.drift}); break; }
    case 'crabClaw': { const a = el(ev.attUid); if(a) M.crabPinch(a, {dir:ev.dir}); break; }
    case 'boomerangReturn': { const a = el(ev.uid); if(a) M.boomerangInbound(a, {host:env.battlefield}); break; }
    case 'boomerangCaught': { const a = el(ev.uid); if(a) M.catchSnap(a); break; }
    case 'boomerangWhiff': { const a = el(ev.uid); if(a) M.whiffPast(a); break; }
    case 'overwhelmHQ': { const c = hq(ev.targetSide); if(c) M.stampede(el(ev.attUid), c); break; }
    case 'pierceHQ': { const F = S(), c = hq(ev.targetSide), u = env.match && env.match._lastHitOf && env.match._lastHitOf[ev.attUid], from = u != null ? el(u) : el(ev.attUid);
      if(F && F.pierce && c && from) F.pierce(from, c, null, {draw:0, flight:220}); break; } // SkillFX.pierce: the shot carries on out of the unit into the castle
    case 'friction': { const t = el(ev.targetUid); if(t) M.frictionSparks(el(ev.attUid), t); break; }
    // 2026-10-15 (user: "I noticed pounce does a line of damage to the enemy"): pounceLeap's ghost trail rose straight up the
    // column at the unit opposite, whoever was really hit, and read as a line of damage. In fights the pounce hit itself is now a
    // leap at its real target (engine: pounce:true, not ranged), so this only kicks up the dust where it pushes off.
    case 'pounce': { const a = el(ev.uid); if(a) M.pounceKick(a); break; }
    case 'swipeLumber': { const c = hq(ev.targetSide), a = el(ev.attUid); if(c && a){ hideProjectile('🪵', 400); M.lumberSnatch(c, a, {n:ev.amount}); } break; }
    case 'charge': if(ev.fired){ const a = el(ev.uid); if(a) M.chargeRelease(a, {cards:rowCards(a).filter(x=> x !== a)}); } break;
    case 'earthquake': if(ev.landslide && high){ const bf = env.battlefield; const cards = bf ? [...bf.querySelectorAll('.board-card')].filter(b=> b.querySelector('.card-tile') && b.getAttribute('data-uid') !== String(ev.uid)) : [];
      if(cards.length) M.landslide(cards, {host:bf}); } break;
    case 'wave': { const t = el(ev.targetUid); if(t){ hideNext(n=> n.classList && n.classList.contains('lava-geyser') && n.classList.contains('is-water'), 300); M.rollingCrest(t, {dir:ev.dir}); } break; }
    case 'meteorBurn': { const t = ev.uid != null ? el(ev.uid) : null; if(t && env.once('crater' + ev.uid)) M.craterBurn(t); break; }
    case 'durian': { const t = el(ev.uid); if(t) M.durianSpikes(t); break; }
    case 'dynamite': { const t = el(ev.uid); if(t){ hideNext(n=> n.classList && n.classList.contains('dyn-blast'), 300); M.dynamiteBlast(t, {host:env.battlefield, flight:240, fuse:160}); } break; }
    case 'fuse': if(ev.left > 0){ const t = el(ev.uid); if(t) M.fuseSpark(t, {last:ev.left === 1}); } break;
    case 'explode': { const t = el(ev.uid); if(t) M.creeperBurst(t); break; }
    case 'rally': { const F = S(), t = el(ev.uid); if(F && F.rally && t) F.rally([t].concat(rowCards(t).filter(x=> x !== t))); break; } // SkillFX.rally, wired
    case 'heal': if(ev.attUid != null && ev.attUid !== ev.targetUid && !fxOf(ev.attDefId).bloom && (ev.amount || 0) > 0 && env.once('heal' + ev.targetUid)){ const F = S(), t = el(ev.targetUid); if(F && F.heal && t) F.heal(t); } break; // SkillFX.heal, wired
    case 'mindControl': { const t = el(ev.targetUid); if(t) M.puppetStrings(t, {to:el(ev.attUid)}); break; }
    case 'swapPositions': { const a = el(ev.aUid), b = el(ev.bUid); if(a && b) M.swapArcs(a, b); break; }
    case 'converge': { const row = sideRow(ev.targetSide), cards = row ? [...row.querySelectorAll('.board-card')].filter(b=> b.querySelector('.card-tile')) : []; if(cards.length) M.magnetPull(cards); break; }
    case 'restless': { const a = el(ev.uid); if(a) M.footsteps(a, {to:ev.swapUid != null ? el(ev.swapUid) : null, dir:(ev.to || 0) >= (ev.from || 0) ? 1 : -1}); break; }
    case 'stunPlayer': { const other = ev.side === 'A' ? 'B' : 'A', c = hq(other); if(c && low) M.bellToll(c, {area:sideRow(other)}); break; }
    case 'exile': if(ev.zone === 'hand' || ev.zone === 'graveyard'){ const anchor = ev.side === 'A' ? (ev.zone === 'hand' ? document.getElementById('handStrip') : document.getElementById('dropDiscard')) : hq(ev.side);
      if(anchor) M.exileWisp(anchor, {prayer:!!ev.prayer}); } break;
    case 'remember': if(ev.uid != null){ const t = el(ev.uid); if(t) env.at(120, ()=> M.candleRise(el(ev.uid) || t)); } break;
    case 'spell': { const from = ev.side === 'A' ? document.getElementById('handStrip') : hq(ev.side), ts = (ev.targets || []).map(x=> el(x.uid)).filter(Boolean);
      M.spellCast(from, ts, ev.action === 'sap' ? {c1:'#f0e0ff', c2:'#a46bff'} : ev.action === 'mend' ? {c1:'#e6ffe0', c2:'#5fd36a'} : {}); break; }
    case 'devour': { const t = el(ev.uid); if(t) M.devourJaws(t); break; }
    case 'equip': { const t = el(ev.uid), d = defs[ev.equipDefId] || {}, ic = typeof d.icon === 'string' && d.icon.length <= 4 ? d.icon : '🗡️'; if(t) M.equipClank(t, {glyph:ic}); break; }
    case 'sacrifice': { const t = el(ev.uid); if(t) M.ritualSigil(t); break; }
    case 'shieldSoak': { const t = el(ev.uid); if(t && low){ if(ev.left) M.shieldFlare(t); else M.shieldShatter(t); } break; }
    case 'curse': { const t = el(ev.targetUid); if(t && low) M.cursedSigil(t); break; }
    case 'skipTurn': if(ev.reason === 'reload'){ const t = el(ev.uid); if(t && env.once('reloadwait' + ev.uid)) M.reloadDial(t, {part:true}); } break;
    case 'fieldTick':
      if(ev.field === 'irradiated' && ev.srcUid != null && env.once('radsrc' + ev.srcUid)){ const s = el(ev.srcUid); if(s) M.radPulse(s); }
      // 2026-10-15: the engine's Scorching field id is 'heatwave' (was matched as 'heat', so it never fired)
      if((ev.field === 'heatwave' || ev.field === 'heat') && env.once('dryspared')){ const rcs = (env.match && env.match.replayCards) || {};
        Object.keys(rcs).forEach(u=>{ const rc = rcs[u], d = rc && defs[rc.defId]; if(!rc || !(rc.hp > 0) || !d) return; const e = d.effects || {};
          if(e.dry || hitFactor({targetDefId:rc.defId, dmgType:'heat'}, defs) < 1){ const t = el(u); if(t) M.heatBend(t); } }); }
      break;
    case 'play': if(fxOf(ev.defId).keenEye && !ev.reserve){ env.at(600, ()=>{ const k = el(ev.uid); if(!k) return; const myRow = k.closest('#rowEnemy, #rowMine'); const other = myRow && document.getElementById(myRow.id === 'rowMine' ? 'rowEnemy' : 'rowMine');
      const rcs = (env.match && env.match.replayCards) || {}; const ts = other ? [...other.querySelectorAll('.board-card[data-uid]')].filter(b=>{ const rc = rcs[b.getAttribute('data-uid')]; return rc && ((defs[rc.defId] || {}).effects || {}).changeling; }) : [];
      if(ts.length) M.keenReveal(k, ts); }); } break;
    case 'statusFx': {
      const k = ev.kind, t = el(ev.targetUid), self = el(ev.attUid);
      if(k === 'castleBolt'){ st.ballista[String(ev.targetUid != null ? ev.targetUid : 'hq' + ev.targetSide)] = true; break; }
      if(k === 'exile'){ if(t && low) M.violetRift(t); break; }
      if(!med) break;
      if(k === 'recoil' && t) M.recoilJolt(t);
      else if(k === 'spite' && self && t) M.spiteLash(self, t);
      else if(k === 'lightning' && self) M.stormBolt(self);
      else if(k === 'nullify' && t) M.nullSeal(t);
      else if(k === 'shellDown'){ const s = t || self; if(s) M.shellCrack(s); }
      else if(k === 'rocket' && self) M.rocketLaunch(self, hq(ev.targetSide));
      else if(k === 'momentum' && self && env.once('momentum' + ev.attUid)) M.momentumTrail(self);
      else if(k === 'pack' && self) env.at(420, ()=>{ const s2 = el(ev.attUid); if(s2) M.packHowl(s2, rowCards(s2)); });
      else if(k === 'satiety' && self) M.satietyFull(self);
      else if(k === 'shed'){ const s = t || self; if(s) M.skinShed(s, {molt:!!ev.molt}); }
      else if(k === 'firstBlood' && t) M.firstBloodSplash(t);
      else if(k === 'bludgeon' && t) M.bludgeonBreak(t, {broke:ev.broke});
      // 2026-10-15: Pack chains are live since 2026-10-14 (no statusFx pack any more): a pack unit whose chain grows howls instead.
      else if(k === 'phaseGrow' && self && (fxOf(ev.attDefId).pack || fxOf(ev.attDefId).packLeader) && ((env.match && env.match.replayCards && env.match.replayCards[ev.attUid]) || {}).packChain > 1){
        if(env.once('packhowl' + ev.attUid)) env.at(120, ()=>{ const s2 = el(ev.attUid); if(s2){ const rcs = env.match.replayCards || {}; M.packHowl(s2, rowCards(s2).filter(b=> ((rcs[b.getAttribute('data-uid')] || {}).packChain || 0) > 0)); } }); }
      else if((k === 'phaseGrow' || k === 'phaseFade') && self){ const e = fxOf(ev.attDefId), key = Object.keys(COND).find(c=> e[c] || (c === 'loyal' && e.loyalGrant) || (c === 'usurper' && e.usurperGrant) || (c === 'packChain' && (env.match && env.match.replayCards && (env.match.replayCards[ev.attUid] || {}).packChain)));
        if(key && env.once('cond' + k + ev.attUid)) M.condAura(self, {kind:key, grow:k === 'phaseGrow'}); }
      break; }
  }
};

// ---- end of effects ----
})(typeof window !== 'undefined' ? window : globalThis);
