/* ============================================================
   Bramblewood FX, batch G (2026-10-16): map grandeur (map title cards, ambient flourishes) and the "fun" set.
   Same contract as bramblewood-fx-a.js … -f.js (docs/effects-lab-contract.md): window.FX.G, pure visuals, GSAP timing,
   CSS through css() with the fxg- prefix, every node added is removed again. Lab demos: tools/effects-lab/manifest/w4.js.
   Bundled by assemble_arena.py after fx-f, and by tools/effects-lab/build.py (and the VFX Playground) the same way.

   2026-10-16 (user: "I like having more map effects and title effects. Could be cool to give grandeur to a map."):
     FX.G.mapTitle(host, {name, sub, icon, id, biome, theme, style})  the title sequence when a map is first opened
     FX.G.mapGrand(host, {theme})                                      the theme's ambient flourish on its own
     FX.G.godRays / birdsCross / silhouettes / haze / cloudShadows / aurora / caustics / heatHaze / dragonShadow ...
   2026-10-16 (user: "Any other VFX playground items to add in each? Invent more for fun?"): the fun set below
     (fireworkReveal, confettiCannons, cardTornado, coinFountain, inkBrushReveal, classifiedStamp, ...).
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.G = FX.G || {};
const TAG = 'g';

// ---- shared helpers (each batch has its own copy so no batch depends on another) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const centre = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const rnd = (a, b)=> a + Math.random()*(b - a);
const pick = a=> a[Math.floor(Math.random()*a.length)];
const call = fn=>{ try{ fn && fn(); }catch(e){} };
const later = (fn, ms)=>{ const g = G(), run = ()=> call(fn); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };
const wait = ms=> new Promise(res=> later(res, ms));
function layer(cls, html, host){
  const e = document.createElement('div'); e.className = 'fx' + TAG + ' ' + (cls || ''); e.setAttribute('aria-hidden', 'true');
  if(html) e.innerHTML = html; if(host) e.style.position = 'absolute'; (host || document.body).appendChild(e); return e;
}
const cssDone = new Set();
function css(key, text){
  if(cssDone.has(key)) return; cssDone.add(key);
  let s = document.getElementById('fx-' + TAG + '-style');
  if(!s){ s = document.createElement('style'); s.id = 'fx-' + TAG + '-style'; document.head.appendChild(s);
    s.textContent = `.fx${TAG}{position:fixed; left:0; top:0; pointer-events:none; z-index:1200;}\n`; }
  s.textContent += '\n/* ' + key + ' */\n' + text;
}
Object.assign(M, {css, layer, later, wait, centre, tileOf, rnd});
M.hooks = M.hooks || {};
const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

// ---- stage layers (2026-10-16) ----
// A full-cover layer over `host`: absolute inside a positioned host, else fixed over the host's box (or the whole screen).
// Sizes are the host's own layout size (clientWidth/Height), so effects look right inside the lab's zoomed stages too.
css('base', `.fxg-stage{position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:40; contain:layout paint;}
.fxg-stage.is-fixed{position:fixed;} .fxg-p{position:absolute; left:0; top:0; pointer-events:none; will-change:transform, opacity;}`);
function stage(host, cls, z){
  host = host || document.body;
  const e = document.createElement('div'); e.className = 'fx' + TAG + ' fxg-stage ' + (cls || ''); e.setAttribute('aria-hidden', 'true');
  let w, h;
  if(host === document.body){ e.classList.add('is-fixed'); e.style.cssText = 'inset:0;'; w = innerWidth; h = innerHeight; document.body.appendChild(e); }
  else if(getComputedStyle(host).position === 'static'){ const r = host.getBoundingClientRect(); e.classList.add('is-fixed');
    e.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px; right:auto; bottom:auto;`; w = r.width; h = r.height; document.body.appendChild(e); }
  else { host.appendChild(e); w = host.clientWidth || e.clientWidth; h = host.clientHeight || e.clientHeight; }
  if(z != null) e.style.zIndex = z;
  e.W = Math.max(40, w || 300); e.H = Math.max(40, h || 200);
  return e;
}
// One particle div in a stage layer.
function part(L, style, html){ const d = document.createElement('div'); d.className = 'fxg-p'; if(style) d.style.cssText = style; if(html) d.innerHTML = html; L.appendChild(d); return d; }
// Stop everything in a layer and take it away.
function done(L){ const g = G(); if(!L) return; if(g){ g.killTweensOf(L); g.killTweensOf(L.querySelectorAll('*')); } L.remove(); }
// n calls of make(i) spread over spanMs, skipped once the layer is gone.
function stream(L, n, spanMs, make){ for(let i = 0; i < n; i++) later(()=>{ if(L.isConnected) call(()=> make(i)); }, spanMs*i/Math.max(1, n)); }
// Box of `el` in `L`'s own coordinates (works in zoomed lab stages: divide the screen rect by the layer's zoom).
function boxIn(el, L){
  const r = el.getBoundingClientRect(), lr = L.getBoundingClientRect(), z = (lr.width / (L.clientWidth || lr.width)) || 1;
  return {x:(r.left - lr.left)/z, y:(r.top - lr.top)/z, w:r.width/z, h:r.height/z, cx:(r.left - lr.left + r.width/2)/z, cy:(r.top - lr.top + r.height/2)/z};
}
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };

// =====================================================================================================================
// 1. MAP THEMES (2026-10-16). One look per kind of place: colours for the title card, the particles that drift through
//    it, the grand flourish under it and the title style the game uses there (the lab plays all three styles).
// =====================================================================================================================
const THEMES = {
  forest:  {label:'Forest',   ink:'#f6efd6', glow:'#a6e07a', a:'#3d6b34', b:'#1f3f1d', trim:'#e0bd62', ink2:'#16240f', p:'leaves',   grand:['godRays', 'birds'],          sil:'pines',    style:'banner'},
  meadow:  {label:'Meadow',   ink:'#fff6e2', glow:'#ffd6ea', a:'#6b8f3a', b:'#3f5f22', trim:'#f2cf6b', ink2:'#2a3214', p:'petals',   grand:['godRays', 'birds'],          sil:'hills',    style:'banner'},
  beach:   {label:'Beach',    ink:'#fffaf0', glow:'#9be4ff', a:'#2f8fb3', b:'#1b5d80', trim:'#f5deb0', ink2:'#123446', p:'waves',    grand:['sunGlints', 'gulls'],        sil:'cliffs',   style:'banner'},
  water:   {label:'Lake',     ink:'#effbff', glow:'#8fd6ff', a:'#2c6f8f', b:'#173f5c', trim:'#bfe6f0', ink2:'#0e2a3a', p:'ripples',  grand:['caustics', 'birds'],         sil:'reeds',    style:'banner'},
  reef:    {label:'Reef',     ink:'#effbff', glow:'#7ff0e0', a:'#1f7f8c', b:'#0f3f5c', trim:'#ffb38a', ink2:'#062430', p:'bubbles',  grand:['caustics', 'fish'],          sil:'coral',    style:'banner'},
  swamp:   {label:'Swamp',    ink:'#eef5d8', glow:'#d8ff6a', a:'#4a5f2a', b:'#232f14', trim:'#b9c46a', ink2:'#141a0a', p:'fireflies', grand:['haze', 'silhouettes'],     sil:'deadtrees', style:'ink'},
  mist:    {label:'Mist',     ink:'#eef2f0', glow:'#cfe6e0', a:'#5d6b68', b:'#2c3533', trim:'#c9d4cf', ink2:'#141a19', p:'mist',     grand:['haze', 'silhouettes'],       sil:'deadtrees', style:'ink'},
  fungal:  {label:'Fungal',   ink:'#f5eaff', glow:'#9cf5ff', a:'#5b3f7a', b:'#2a1c40', trim:'#c9a2ff', ink2:'#160d24', p:'spores',   grand:['glowPulse', 'haze'],         sil:'shrooms',  style:'ink'},
  cave:    {label:'Cave',     ink:'#f1e8d8', glow:'#ffcf7a', a:'#4a4038', b:'#221c18', trim:'#c8a874', ink2:'#120e0b', p:'dust',     grand:['lanternBeam', 'bats'],       sil:'stalactites', style:'banner'},
  crystal: {label:'Crystal',  ink:'#f2f6ff', glow:'#b9a8ff', a:'#3d4a8a', b:'#1c2148', trim:'#c9e4ff', ink2:'#0d1030', p:'glints',   grand:['prism', 'glowPulse'],        sil:'crystals', style:'banner'},
  alpine:  {label:'Peaks',    ink:'#ffffff', glow:'#cfe8ff', a:'#55708f', b:'#2b3d57', trim:'#e9eef5', ink2:'#121c2a', p:'clouds',   grand:['silhouettes', 'eagle'],      sil:'peaks',    style:'banner'},
  tundra:  {label:'Tundra',   ink:'#f4fbff', glow:'#a8e8ff', a:'#4f7f9f', b:'#24435c', trim:'#dff4ff', ink2:'#0c1c28', p:'frost',    grand:['aurora', 'silhouettes'],     sil:'peaks',    style:'banner'},
  desert:  {label:'Desert',   ink:'#fff4dc', glow:'#ffd27a', a:'#b9843a', b:'#7a4f1c', trim:'#ffe2a0', ink2:'#3a240c', p:'sand',     grand:['heatHaze', 'silhouettes'],   sil:'dunes',    style:'banner'},
  savanna: {label:'Savanna',  ink:'#fff3d6', glow:'#ffcf6a', a:'#a7832f', b:'#6b4f16', trim:'#ffe08a', ink2:'#33240a', p:'grass',    grand:['godRays', 'silhouettes'],    sil:'acacia',   style:'banner'},
  volcano: {label:'Volcano',  ink:'#fff0dc', glow:'#ff8a3a', a:'#7a2a16', b:'#3a120a', trim:'#ffb35a', ink2:'#1e0804', p:'embers',   grand:['heatHaze', 'silhouettes'],   sil:'volcano',  style:'banner'},
  forge:   {label:'Forge',    ink:'#fff0dc', glow:'#ffb04a', a:'#5a4a40', b:'#2a201a', trim:'#ffc56a', ink2:'#140e0a', p:'sparks',   grand:['glowPulse', 'silhouettes'],  sil:'chimneys', style:'banner'},
  night:   {label:'Starlit',  ink:'#f2f0ff', glow:'#b8c8ff', a:'#2c2f6a', b:'#12143a', trim:'#e6dcff', ink2:'#080a20', p:'stars',    grand:['aurora', 'shootingStar'],    sil:'peaks',    style:'banner', veil:'rgba(8,12,40,.55)'},
};
// Map → theme (a presentation choice, not game state). Anything missing falls back to its biome.
const THEME_OF = {m1:'forest', mtut:'meadow', mf:'forest', mq:'meadow', mb:'beach', mp:'water', mg:'cave', mc:'alpine', m2:'water', mw:'swamp',
  m8:'mist', ms:'mist', mu:'fungal', mz:'fungal', m4:'cave', mn:'crystal', mk:'water', m7:'reef', mj:'reef', m10:'alpine', mv:'alpine', mh:'meadow',
  mr:'forest', m5:'savanna', my:'forest', ml:'meadow', mt:'tundra', m6:'tundra', mi:'tundra', md:'desert', m3:'volcano', m11:'volcano', m9:'forge',
  me:'volcano', mx:'volcano', m21:'night', mo:'forest', mm:'swamp'};
const BIOME_THEME = {forest:'forest', meadow:'meadow', beach:'beach', water:'water', reef:'reef', swamp:'swamp', cave:'cave', alpine:'alpine',
  tundra:'tundra', savanna:'savanna', ash:'volcano', forge:'forge'};
function themeOf(o){ o = o || {}; const k = o.theme || THEME_OF[o.id] || BIOME_THEME[o.biome] || 'forest'; return THEMES[k] ? k : 'forest'; }
M.THEMES = THEMES; M.THEME_OF = THEME_OF; M.themeOf = themeOf;

// ---- particles per theme (each returns nothing; it streams `n` particles into L over `ms`) ----
const PARTICLES = {
  leaves(L, n, ms){ const g = G(), cols = ['#7fb24a', '#a8c64a', '#d9a23a', '#c46b2a', '#5f9a3a'];
    stream(L, n, ms, ()=>{ const s = rnd(8, 15), d = part(L, `width:${s}px; height:${s*0.6}px; border-radius:0 100% 0 100%; background:linear-gradient(135deg, ${pick(cols)}, ${pick(cols)}); box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);`);
      const x0 = rnd(-0.1, 1)*L.W, dur = rnd(3.2, 5.2);
      g.set(d, {x:x0, y:-20, rotation:rnd(0, 360), opacity:0});
      g.to(d, {opacity:1, duration:.4});
      g.to(d, {y:L.H + 20, duration:dur, ease:'none', onComplete:()=> d.remove()});
      g.to(d, {x:x0 + rnd(40, 120), rotation:'+=' + rnd(180, 540), duration:dur, ease:'sine.inOut'});
      g.to(d, {scaleX:-1, duration:rnd(.35, .6), repeat:Math.ceil(dur*2), yoyo:true, ease:'sine.inOut'}); }); },
  petals(L, n, ms){ const g = G(), cols = ['#ffd3e4', '#fff1f6', '#ffb7cf', '#fff7c2'];
    stream(L, n, ms, ()=>{ const s = rnd(7, 11), d = part(L, `width:${s}px; height:${s*0.75}px; border-radius:100% 0 100% 0; background:${pick(cols)}; opacity:.95;`);
      const y0 = rnd(-0.1, 0.7)*L.H, dur = rnd(3.5, 5.5);
      g.set(d, {x:-20, y:y0, rotation:rnd(0, 360)});
      g.to(d, {x:L.W + 30, duration:dur, ease:'none', onComplete:()=> d.remove()});
      g.to(d, {y:y0 + rnd(60, 160), duration:dur, ease:'sine.in'});
      g.to(d, {rotation:'+=' + rnd(240, 600), scaleY:.4, duration:dur/3, repeat:3, yoyo:true, ease:'sine.inOut'}); });
    // pollen motes
    stream(L, Math.round(n/2), ms, ()=>{ const d = part(L, 'width:3px; height:3px; border-radius:50%; background:#fff3a0; box-shadow:0 0 6px #ffe07a;');
      const x = rnd(0, L.W), y = rnd(0.3, 1)*L.H; g.set(d, {x, y, opacity:0});
      g.to(d, {opacity:1, duration:.6, yoyo:true, repeat:1, repeatDelay:1.2}); g.to(d, {x:x + rnd(20, 60), y:y - rnd(30, 80), duration:3, ease:'sine.inOut', onComplete:()=> d.remove()}); }); },
  waves(L, n, ms){ const g = G();
    css('waves', `.fxg-wave{position:absolute; left:0; bottom:0; width:200%; height:46px;} .fxg-wave svg{width:100%; height:100%; display:block;}`);
    const mk = (i, col, hgt, speed)=>{ const w = document.createElement('div'); w.className = 'fxg-wave'; w.style.height = hgt + 'px'; w.style.bottom = (-6 + i*10) + 'px';
      let d = 'M0 20'; for(let k = 0; k <= 16; k++) d += ` Q ${k*12.5 + 6.25} ${k % 2 ? 34 : 6} ${(k + 1)*12.5} 20`; d += ' L 212.5 60 L 0 60 Z';
      w.innerHTML = `<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="${d}" fill="${col}"/><path d="${d.split(' L 212.5')[0]}" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/></svg>`;
      L.appendChild(w); g.fromTo(w, {xPercent:-50*(i % 2), y:30, opacity:0}, {y:0, opacity:1, duration:.9, delay:i*.15, ease:'power2.out'});
      g.to(w, {xPercent:i % 2 ? 0 : -50, duration:speed, ease:'none', repeat:-1}); g.to(w, {y:-6, duration:1.1 + i*.2, yoyo:true, repeat:-1, ease:'sine.inOut'}); };
    mk(0, 'rgba(60,160,200,.45)', 52, 7); mk(1, 'rgba(120,210,235,.42)', 44, 5); mk(2, 'rgba(230,250,255,.32)', 34, 4);
    stream(L, n, ms, ()=>{ const d = part(L, 'width:4px; height:4px; border-radius:50%; background:#fff; box-shadow:0 0 8px #bff0ff;'); g.set(d, {x:rnd(0, L.W), y:L.H - rnd(20, 60), scale:0});
      g.to(d, {scale:1.4, duration:.25, yoyo:true, repeat:1, onComplete:()=> d.remove()}); }); },
  ripples(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const s = rnd(30, 70), d = part(L, `width:${s}px; height:${s*0.42}px; margin:${-s*0.21}px 0 0 ${-s/2}px; border-radius:50%; border:2px solid rgba(210,240,255,.7);`);
      g.set(d, {x:rnd(.05, .95)*L.W, y:rnd(.35, .95)*L.H, scale:.1, opacity:1});
      g.to(d, {scale:1.6, opacity:0, duration:rnd(1.4, 2.2), ease:'power1.out', onComplete:()=> d.remove()}); }); },
  bubbles(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const s = rnd(4, 13), d = part(L, `width:${s}px; height:${s}px; border-radius:50%; border:1.5px solid rgba(220,250,255,.8); background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.8) 0 18%, rgba(160,230,255,.12) 40%, transparent 70%);`);
      const x = rnd(0, L.W), dur = rnd(2.4, 4); g.set(d, {x, y:L.H + 10});
      g.to(d, {y:-20, duration:dur, ease:'power1.in', onComplete:()=> d.remove()}); g.to(d, {x:x + rnd(-24, 24), duration:dur/4, repeat:3, yoyo:true, ease:'sine.inOut'}); }); },
  fireflies(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const d = part(L, 'width:4px; height:4px; border-radius:50%; background:#efff9a; box-shadow:0 0 8px 3px rgba(210,255,90,.75);');
      const x = rnd(0, L.W), y = rnd(.25, 1)*L.H; g.set(d, {x, y, opacity:0});
      g.to(d, {opacity:1, duration:.35, repeat:5, yoyo:true, repeatDelay:rnd(.1, .5)});
      g.to(d, {x:x + rnd(-60, 60), y:y - rnd(10, 70), duration:4, ease:'sine.inOut', onComplete:()=> d.remove()}); }); },
  mist(L, n, ms){ const g = G();
    stream(L, Math.min(n, 10), ms*.6, i=>{ const w = rnd(.5, .9)*L.W, h = rnd(.18, .32)*L.H, d = part(L, `width:${w}px; height:${h}px; border-radius:50%; background:radial-gradient(closest-side, rgba(225,235,232,.55), rgba(225,235,232,0));`);
      const dir = i % 2 ? 1 : -1; g.set(d, {x:dir > 0 ? -w : L.W, y:rnd(.1, .85)*L.H - h/2, opacity:0});
      g.to(d, {opacity:1, duration:1.2}); g.to(d, {x:dir > 0 ? L.W*0.7 : -w*0.3, duration:rnd(5, 7), ease:'none', onComplete:()=> d.remove()}); g.to(d, {opacity:0, duration:1.2, delay:3.4}); }); },
  spores(L, n, ms){ const g = G(), cols = ['#9cf5ff', '#d9a8ff', '#b8ffcf'];
    stream(L, n, ms, ()=>{ const c = pick(cols), s = rnd(3, 6), d = part(L, `width:${s}px; height:${s}px; border-radius:50%; background:${c}; box-shadow:0 0 10px 2px ${c};`);
      const x = rnd(0, L.W), y = rnd(.5, 1.05)*L.H, dur = rnd(3.5, 5); g.set(d, {x, y, opacity:0});
      g.to(d, {opacity:.95, duration:.8}); g.to(d, {y:y - rnd(80, 180), duration:dur, ease:'sine.out', onComplete:()=> d.remove()});
      g.to(d, {x:x + rnd(-30, 30), duration:dur/3, repeat:2, yoyo:true, ease:'sine.inOut'}); g.to(d, {opacity:0, duration:.8, delay:dur - .8}); }); },
  dust(L, n, ms){ const g = G();
    stream(L, n, ms, i=>{ if(i % 4 === 0){ const d = part(L, 'width:3px; height:6px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:rgba(190,225,255,.85);');
        const x = rnd(.05, .95)*L.W; g.set(d, {x, y:-8}); g.to(d, {y:rnd(.5, .9)*L.H, duration:rnd(.7, 1), ease:'power2.in', onComplete:()=>{ g.to(d, {scaleX:3, scaleY:.2, opacity:0, duration:.25, onComplete:()=> d.remove()}); }}); return; }
      const d = part(L, 'width:2px; height:2px; border-radius:50%; background:rgba(255,236,200,.9); box-shadow:0 0 4px rgba(255,220,160,.8);');
      const x = rnd(0, L.W), y = rnd(0, L.H); g.set(d, {x, y, opacity:0});
      g.to(d, {opacity:1, duration:.8, yoyo:true, repeat:1, repeatDelay:1}); g.to(d, {x:x + rnd(10, 40), y:y + rnd(-10, 20), duration:3, ease:'sine.inOut', onComplete:()=> d.remove()}); }); },
  glints(L, n, ms){ const g = G(), cols = ['#ffffff', '#c9b8ff', '#a8e8ff', '#ffd0f4'];
    stream(L, n, ms, ()=>{ const s = rnd(8, 18), c = pick(cols), d = part(L, `width:${s}px; height:${s}px; margin:${-s/2}px 0 0 ${-s/2}px; background:${c}; clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%); filter:drop-shadow(0 0 4px ${c});`);
      g.set(d, {x:rnd(0, L.W), y:rnd(0, L.H), scale:0, rotation:rnd(0, 45)});
      g.to(d, {scale:1, rotation:'+=45', duration:.35, yoyo:true, repeat:1, ease:'power2.out', onComplete:()=> d.remove()}); }); },
  clouds(L, n, ms){ const g = G();
    stream(L, Math.min(n, 9), ms*.7, ()=>{ const w = rnd(.35, .7)*L.W, h = w*rnd(.18, .28), d = part(L, `width:${w}px; height:${h}px; border-radius:50%; background:radial-gradient(closest-side, rgba(255,255,255,.5), rgba(255,255,255,0));`);
      g.set(d, {x:L.W, y:pick([rnd(.02, .2), rnd(.6, .85)])*L.H}); g.to(d, {x:-w, duration:rnd(2.6, 4), ease:'none', onComplete:()=> d.remove()}); }); },
  frost(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const s = rnd(3, 7), d = part(L, `width:${s}px; height:${s}px; border-radius:50%; background:#fff; box-shadow:0 0 6px rgba(200,240,255,.9);`);
      const x = rnd(-.1, 1)*L.W, dur = rnd(3, 5); g.set(d, {x, y:-10});
      g.to(d, {y:L.H + 10, x:x + rnd(20, 80), duration:dur, ease:'none', onComplete:()=> d.remove()}); });
    // frost creeping in from the four corners
    css('frostCorners', `.fxg-frostc{position:absolute; width:34%; height:44%;} .fxg-frostin{position:absolute; inset:0; background:radial-gradient(ellipse at 0 0, rgba(230,248,255,.55), rgba(200,235,255,.18) 45%, transparent 70%);}
      .fxg-frostc svg{position:absolute; inset:0; width:100%; height:100%;}`);
    const fern = ()=>{ let s = ''; for(let i = 0; i < 6; i++){ const a = 8 + i*13, L2 = 40 + Math.random()*55, x2 = Math.cos(a*Math.PI/180)*L2, y2 = Math.sin(a*Math.PI/180)*L2;
      s += `<path d="M0 0 L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="rgba(255,255,255,.8)" stroke-width="1.2" fill="none"/>`;
      for(let k = 1; k < 4; k++){ const px = x2*k/4, py = y2*k/4; s += `<path d="M${px.toFixed(1)} ${py.toFixed(1)} l${(Math.cos((a + 40)*Math.PI/180)*9).toFixed(1)} ${(Math.sin((a + 40)*Math.PI/180)*9).toFixed(1)} M${px.toFixed(1)} ${py.toFixed(1)} l${(Math.cos((a - 40)*Math.PI/180)*9).toFixed(1)} ${(Math.sin((a - 40)*Math.PI/180)*9).toFixed(1)}" stroke="rgba(255,255,255,.65)" stroke-width="1" fill="none"/>`; } }
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${s}</svg>`; };
    [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].forEach(([x, y, sx, sy])=>{ const c = document.createElement('div'); c.className = 'fxg-frostc';
      c.innerHTML = `<div class="fxg-frostin" style="transform:scale(${sx},${sy})">${fern()}</div>`;
      c.style.left = x ? 'auto' : '0'; c.style.right = x ? '0' : 'auto'; c.style.top = y ? 'auto' : '0'; c.style.bottom = y ? '0' : 'auto'; L.appendChild(c);
      g.fromTo(c, {scale:0, opacity:0, transformOrigin:`${x ? 100 : 0}% ${y ? 100 : 0}%`}, {scale:1, opacity:1, duration:1.6, ease:'power2.out'}); }); },
  sand(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const w = rnd(30, 110), d = part(L, `width:${w}px; height:${rnd(1, 2.4)}px; border-radius:2px; background:linear-gradient(90deg, rgba(240,200,130,0), rgba(250,215,150,.9));`);
      g.set(d, {x:L.W + 10, y:rnd(0, L.H)}); g.to(d, {x:-w - 20, y:'+=' + rnd(-10, 25), duration:rnd(.7, 1.3), ease:'none', onComplete:()=> d.remove()}); }); },
  grass(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const d = part(L, 'width:9px; height:9px; border-radius:50%; background:radial-gradient(circle, #fff6d0 0 20%, rgba(255,230,160,.5) 40%, transparent 72%);');
      const y = rnd(.2, .9)*L.H, dur = rnd(4, 6); g.set(d, {x:-12, y});
      g.to(d, {x:L.W + 12, duration:dur, ease:'none', onComplete:()=> d.remove()}); g.to(d, {y:y - rnd(20, 60), duration:dur/2, yoyo:true, repeat:1, ease:'sine.inOut'}); g.to(d, {rotation:360, duration:dur}); }); },
  embers(L, n, ms){ const g = G();
    stream(L, n, ms, i=>{ if(i % 3 === 0){ const d = part(L, 'width:5px; height:4px; border-radius:30%; background:rgba(120,110,105,.85);'); const x = rnd(0, L.W);
        g.set(d, {x, y:-8}); g.to(d, {y:L.H + 8, x:x + rnd(-40, 40), rotation:rnd(-200, 200), duration:rnd(3.5, 5), ease:'none', onComplete:()=> d.remove()}); return; }
      const s = rnd(2.5, 5), d = part(L, `width:${s}px; height:${s}px; border-radius:50%; background:#ffd27a; box-shadow:0 0 8px 2px rgba(255,120,30,.9);`);
      const x = rnd(0, L.W), dur = rnd(2, 3.6); g.set(d, {x, y:L.H + 6});
      g.to(d, {y:rnd(-.05, .5)*L.H, x:x + rnd(-50, 50), duration:dur, ease:'power1.out', onComplete:()=> d.remove()}); g.to(d, {opacity:.3, duration:.12, repeat:Math.round(dur*4), yoyo:true}); }); },
  sparks(L, n, ms){ const g = G();
    stream(L, n, ms, ()=>{ const d = part(L, 'width:2px; height:9px; border-radius:2px; background:linear-gradient(#fff6c0, #ff9a2a); box-shadow:0 0 6px #ffb04a;');
      const x = rnd(.1, .9)*L.W, vx = rnd(-120, 120), vy = rnd(-320, -200), o = {t:0};
      g.set(d, {x, y:L.H}); g.to(o, {t:1.4, duration:1.4, ease:'none', onUpdate:()=>{ const t = o.t; g.set(d, {x:x + vx*t, y:L.H + vy*t + 260*t*t, rotation:Math.atan2(vy + 520*t, vx)*57.3 + 90, opacity:1 - t/1.4}); }, onComplete:()=> d.remove()}); }); },
  stars(L, n, ms){ const g = G();
    stream(L, n, ms*.5, ()=>{ const s = rnd(1.5, 3.5), d = part(L, `width:${s}px; height:${s}px; border-radius:50%; background:#fff; box-shadow:0 0 ${s*2}px #cfd8ff;`);
      g.set(d, {x:rnd(0, L.W), y:rnd(0, .7)*L.H, opacity:0}); g.to(d, {opacity:1, duration:.6}); g.to(d, {opacity:.25, duration:rnd(.4, .9), repeat:5, yoyo:true, delay:.6, onComplete:()=> g.to(d, {opacity:0, duration:.5, onComplete:()=> d.remove()})}); }); },
};
M.particles = function(host, opts){ opts = opts || {}; const k = themeOf(opts), L = stage(host, 'fxg-amb-' + k, opts.z), n = opts.n || 28, ms = opts.ms || 2600;
  (PARTICLES[opts.kind || THEMES[k].p] || PARTICLES.leaves)(L, n, ms);
  return wait(opts.hold || ms + 3200).then(()=>{ done(L); opts.onDone && call(opts.onDone); }); };

// =====================================================================================================================
// 2. GRAND FLOURISHES (2026-10-16, user: "Could be cool to give grandeur to a map." + the brief: god rays, birds crossing,
//    distant silhouettes, parallax haze). Each draws into a layer L for about o.ms, and is also exported on its own as
//    FX.G.<name>(host, {theme, ms}) → Promise.
// =====================================================================================================================
const hexA = (hex, a)=>{ const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c=> c + c).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
// Procedural silhouette paths, one per kind of place (viewBox 0 0 1000 200, ground at the bottom).
function silPath(kind, seed, far){
  let s = seed || 1; const r = ()=> (s = (s*16807) % 2147483647, (s - 1)/2147483646);
  const base = far ? 120 : 150; let d = `M0 200 L0 ${base}`;
  if(kind === 'peaks' || kind === 'volcano' || kind === 'cliffs'){
    let x = 0; while(x < 1000){ const w = 60 + r()*130, hgt = (far ? 70 : 45) + r()*(far ? 90 : 70); const peakX = x + w*(.35 + r()*.3);
      if(kind === 'volcano' && far && x > 380 && x < 560){ d += ` L${x + 30} ${base - 20} L${x + 90} ${base - 110} L${x + 130} ${base - 110} L${x + 190} ${base - 20}`; x += 220; continue; }
      if(kind === 'cliffs'){ d += ` L${x.toFixed(0)} ${(base - hgt*.7).toFixed(0)} L${(x + w*.8).toFixed(0)} ${(base - hgt*.75).toFixed(0)} L${(x + w).toFixed(0)} ${(base - 6).toFixed(0)}`; x += w; continue; }
      d += ` L${peakX.toFixed(0)} ${(base - hgt).toFixed(0)}` + (!far ? ` L${(peakX + 8).toFixed(0)} ${(base - hgt + 10).toFixed(0)}` : '') + ` L${(x + w).toFixed(0)} ${(base - r()*20).toFixed(0)}`; x += w; }
    return d + ' L1000 200 Z'; }
  if(kind === 'dunes' || kind === 'hills'){ let x = 0; while(x < 1000){ const w = 160 + r()*200; d += ` Q ${(x + w*.45).toFixed(0)} ${(base - 40 - r()*(far ? 50 : 30)).toFixed(0)} ${(x + w).toFixed(0)} ${(base - r()*10).toFixed(0)}`; x += w; }
    return d + ' L1000 200 Z'; }
  // ground strip + a row of shapes standing on it
  d += ` Q 250 ${base - 14} 500 ${base} T 1000 ${base} L1000 200 Z`; let x = 10;
  while(x < 990){ const hgt = (far ? 40 : 55) + r()*(far ? 50 : 80);
    if(kind === 'pines'){ const w = 18 + r()*16; d += ` M${x} ${base + 4} L${x + w/2} ${base - hgt} L${x + w} ${base + 4} Z`; x += w*(far ? .7 : 1.1) + r()*14; }
    else if(kind === 'acacia'){ if(r() < .45){ x += 40 + r()*60; continue; } const w = 70 + r()*40; d += ` M${x + w/2 - 3} ${base + 4} L${x + w/2 - 2} ${base - hgt + 12} L${x + 6} ${base - hgt + 8} Q ${x + w/2} ${base - hgt - 14} ${x + w - 6} ${base - hgt + 8} L${x + w/2 + 2} ${base - hgt + 12} L${x + w/2 + 3} ${base + 4} Z`; x += w + 40 + r()*90; }
    else if(kind === 'deadtrees'){ const t = x + 10; d += ` M${t} ${base + 4} L${t + 3} ${base - hgt} L${t - 14} ${base - hgt - 18} L${t + 4} ${base - hgt + 4} L${t + 18} ${base - hgt - 22} L${t + 7} ${base - hgt + 6} L${t + 9} ${base + 4} Z`; x += 50 + r()*90; }
    else if(kind === 'reeds'){ d += ` M${x} ${base + 4} Q ${x + 4} ${base - hgt*.6} ${x + 2 + r()*8} ${base - hgt} L${x + 5} ${base + 4} Z`; x += 6 + r()*16; }
    else if(kind === 'shrooms'){ const w = 26 + r()*40, sh = hgt*.8; d += ` M${x + w*.42} ${base + 4} L${x + w*.45} ${base - sh} Q ${x - 4} ${base - sh} ${x + w/2} ${base - sh - w*.5} Q ${x + w + 4} ${base - sh} ${x + w*.55} ${base - sh} L${x + w*.58} ${base + 4} Z`; x += w + 20 + r()*70; }
    else if(kind === 'chimneys'){ const w = 16 + r()*14; d += ` M${x} ${base + 4} L${x} ${base - hgt} L${x + w} ${base - hgt} L${x + w} ${base + 4} Z`; x += w + 30 + r()*80; }
    else if(kind === 'coral'){ const t = x + 12; d += ` M${t} ${base + 4} Q ${t - 16} ${base - hgt*.5} ${t - 8} ${base - hgt} Q ${t} ${base - hgt*.6} ${t + 4} ${base - hgt*.9} Q ${t + 8} ${base - hgt*.5} ${t + 22} ${base - hgt*.8} Q ${t + 16} ${base - hgt*.3} ${t + 10} ${base + 4} Z`; x += 40 + r()*60; }
    else if(kind === 'crystals'){ const w = 14 + r()*16; d += ` M${x} ${base + 4} L${x + w*.2} ${base - hgt*.7} L${x + w*.5} ${base - hgt} L${x + w*.8} ${base - hgt*.7} L${x + w} ${base + 4} Z`; x += w + 8 + r()*50; }
    else { const w = 16 + r()*18; d += ` M${x} ${base + 4} L${x + w*.15} ${base - hgt*.5} L${x + w*.5} ${base - hgt} L${x + w*.85} ${base - hgt*.45} L${x + w} ${base + 4} Z`; x += w + 12 + r()*50; } }
  return d;
}
const GRAND = {
  godRays(L, T, o){ const g = G(), n = o.lite ? 3 : 6;
    for(let i = 0; i < n; i++){ const w = rnd(.05, .12)*L.W, d = part(L, `width:${w}px; height:${L.H*1.7}px; top:${-L.H*.35}px; left:${(rnd(.05, .85))*L.W}px; transform-origin:50% 0; background:linear-gradient(180deg, ${hexA(T.glow, .5)}, ${hexA(T.glow, .14)} 55%, transparent); mix-blend-mode:screen; filter:blur(2px);`);
      g.set(d, {rotation:24 + rnd(-4, 4), opacity:0});
      g.to(d, {opacity:rnd(.5, .9), duration:1.4, delay:.2 + i*.18, ease:'sine.inOut'}); g.to(d, {x:'+=' + rnd(20, 50), rotation:'+=' + rnd(-3, 3), duration:o.ms/1000, ease:'sine.inOut'});
      g.to(d, {opacity:0, duration:1.2, delay:o.ms/1000 - 1.2}); } },
  birds(L, T, o){ flock(L, 'bird', o.lite ? 5 : 7, o.ms); },
  gulls(L, T, o){ flock(L, 'gull', o.lite ? 4 : 6, o.ms); },
  eagle(L, T, o){ flock(L, 'eagle', 1, o.ms); },
  bats(L, T, o){ flock(L, 'bat', o.lite ? 5 : 9, o.ms); },
  fish(L, T, o){ flock(L, 'fish', o.lite ? 5 : 8, o.ms); },
  silhouettes(L, T, o){ const g = G(), kind = o.sil || T.sil, seed = Math.floor(rnd(1, 9999)), hang = kind === 'stalactites';
    const pos = hang ? 'top:0; bottom:auto; transform:scaleY(-1);' : 'top:auto; bottom:0;';
    const far = part(L, `left:0; ${pos} width:100%; height:${Math.min(L.H*.42, 220)}px;`, `<svg viewBox="0 0 1000 200" preserveAspectRatio="none" width="100%" height="100%"><path d="${silPath(hang ? 'crystals' : kind, seed, true)}" fill="${hexA(T.b, .55)}"/></svg>`);
    const near = part(L, `left:0; ${pos} width:110%; height:${Math.min(L.H*.32, 170)}px;`, `<svg viewBox="0 0 1000 200" preserveAspectRatio="none" width="100%" height="100%"><path d="${silPath(hang ? 'crystals' : kind, seed + 77, false)}" fill="${hexA(T.ink2, .72)}"/></svg>`);
    const haze = part(L, `left:0; ${pos} width:100%; height:${Math.min(L.H*.45, 240)}px; background:linear-gradient(0deg, transparent, ${hexA(T.glow, .16)} 60%, transparent);`);
    const s = o.ms/1000; [far, near, haze].forEach((e, i)=> g.fromTo(e, {opacity:0, yPercent:hang ? -25 : 25}, {opacity:1, yPercent:0, duration:1.4, delay:i*.15, ease:'power2.out'}));
    g.to(far, {x:-L.W*.03, duration:s, ease:'none'}); g.to(near, {x:-L.W*.08, duration:s, ease:'none'});
    g.to([far, near, haze], {opacity:0, duration:1, delay:s - 1}); },
  haze(L, T, o){ const g = G(); [0, 1, 2].forEach(i=>{ const h = L.H*(.22 + i*.06), d = part(L, `width:${L.W*1.6}px; height:${h}px; top:${L.H*(.25 + i*.22)}px; left:${-L.W*.3}px; background:radial-gradient(closest-side, ${hexA(T.glow, .26 - i*.04)}, transparent); border-radius:50%;`);
    g.fromTo(d, {opacity:0, x:i % 2 ? L.W*.15 : -L.W*.15}, {opacity:1, duration:1.4, delay:i*.2}); g.to(d, {x:i % 2 ? -L.W*.12 : L.W*.12, duration:o.ms/1000, ease:'sine.inOut'}); g.to(d, {opacity:0, duration:1.1, delay:o.ms/1000 - 1.1}); }); },
  cloudShadows(L, T, o){ const g = G(); for(let i = 0; i < 3; i++){ const w = rnd(.35, .6)*L.W, d = part(L, `width:${w}px; height:${w*.55}px; border-radius:50%; background:radial-gradient(closest-side, rgba(10,20,10,.34), transparent);`);
    g.set(d, {x:-w - i*L.W*.25, y:rnd(0, .7)*L.H}); g.to(d, {x:L.W + w, y:'-=' + L.H*.2, duration:o.ms/1000 + 1, ease:'none'}); } },
  aurora(L, T, o){ const g = G(), cols = [['#5cffb0', '#2fd4c8'], ['#6fe8ff', '#8a6bff'], ['#b0ff8a', '#3fc8a0']];
    // a dark sky behind the curtains, so they glow on light (snowy) map art too
    const nightSky = part(L, `left:0; top:0; width:100%; height:${L.H*.7}px; background:linear-gradient(180deg, rgba(6,12,34,.6), rgba(6,12,34,.25) 60%, transparent);`);
    g.fromTo(nightSky, {opacity:0}, {opacity:1, duration:1.2}); g.to(nightSky, {opacity:0, duration:1.2, delay:o.ms/1000 - 1.2});
    cols.slice(0, o.lite ? 2 : 3).forEach((c, i)=>{ const d = part(L, `width:${L.W*.9}px; height:${L.H*.5}px; left:${L.W*(.05 + i*.05)}px; top:${-L.H*.05 + i*L.H*.04}px; background:linear-gradient(180deg, transparent, ${hexA(c[0], .5)} 35%, ${hexA(c[1], .32)} 60%, transparent); filter:blur(14px); mix-blend-mode:screen; border-radius:40% 60% 50% 50% / 30% 30% 70% 70%;`);
      g.set(d, {opacity:0, skewX:-18 + i*12, scaleY:.6, transformOrigin:'50% 0'});
      g.to(d, {opacity:.85, scaleY:1, duration:1.6, delay:i*.3, ease:'sine.out'}); g.to(d, {skewX:'+=' + rnd(16, 28), x:'+=' + rnd(-40, 40), duration:o.ms/2000, yoyo:true, repeat:1, ease:'sine.inOut'});
      g.to(d, {opacity:0, duration:1.2, delay:o.ms/1000 - 1.2}); }); },
  caustics(L, T, o){ const g = G();
    for(let i = 0; i < (o.lite ? 3 : 4); i++){ const w = rnd(.06, .12)*L.W, d = part(L, `width:${w}px; height:${L.H*1.4}px; top:${-L.H*.2}px; left:${rnd(.1, .85)*L.W}px; background:linear-gradient(180deg, rgba(200,250,255,.5), rgba(160,230,255,.1) 60%, transparent); mix-blend-mode:screen; filter:blur(3px); transform-origin:50% 0;`);
      g.set(d, {rotation:rnd(-12, 12), opacity:0}); g.to(d, {opacity:rnd(.4, .8), duration:1.2, delay:i*.2}); g.to(d, {rotation:'+=' + rnd(-8, 8), duration:1.6, yoyo:true, repeat:-1, ease:'sine.inOut'}); g.to(d, {opacity:0, duration:1, delay:o.ms/1000 - 1}); }
    for(let i = 0; i < (o.lite ? 6 : 12); i++){ const s = rnd(40, 110), d = part(L, `width:${s}px; height:${s*.6}px; border-radius:50%; border:2px solid rgba(220,250,255,.28); filter:blur(1px);`);
      g.set(d, {x:rnd(0, L.W), y:rnd(0, L.H), opacity:0, scale:.6}); g.to(d, {opacity:1, scale:1.1, duration:1.1, yoyo:true, repeat:1, delay:rnd(0, 1.6), ease:'sine.inOut'}); g.to(d, {x:'+=' + rnd(-40, 40), duration:o.ms/1000, ease:'sine.inOut'}); } },
  heatHaze(L, T, o){ const g = G(); const glow = part(L, `left:0; top:auto; bottom:0; width:100%; height:${L.H*.55}px; background:linear-gradient(0deg, ${hexA(T.glow, .45)}, ${hexA(T.glow, .12)} 50%, transparent); mix-blend-mode:screen;`);
    g.fromTo(glow, {opacity:0}, {opacity:1, duration:1}); g.to(glow, {opacity:.55, duration:.7, yoyo:true, repeat:3, delay:1}); g.to(glow, {opacity:0, duration:1, delay:o.ms/1000 - 1, overwrite:false});
    for(let i = 0; i < (o.lite ? 4 : 8); i++){ const d = part(L, `width:${rnd(.3, .6)*L.W}px; height:3px; border-radius:50%; background:linear-gradient(90deg, transparent, rgba(255,240,210,.35), transparent); filter:blur(1px);`);
      g.set(d, {x:rnd(-.1, .7)*L.W, y:L.H, opacity:0}); g.to(d, {y:L.H*rnd(.2, .5), opacity:1, duration:rnd(2, 3), delay:i*.35, ease:'sine.out', onComplete:()=> g.to(d, {opacity:0, duration:.6})}); g.to(d, {scaleY:3, duration:.4, yoyo:true, repeat:6, ease:'sine.inOut'}); } },
  glowPulse(L, T, o){ const g = G(), d = part(L, `left:50%; top:60%; width:${L.W*1.1}px; height:${L.H*1.1}px; margin:${-L.H*.55}px 0 0 ${-L.W*.55}px; border-radius:50%; background:radial-gradient(closest-side, ${hexA(T.glow, .35)}, transparent); mix-blend-mode:screen;`);
    g.fromTo(d, {opacity:0, scale:.6}, {opacity:1, scale:1, duration:1.2, ease:'sine.out'}); g.to(d, {opacity:.4, scale:.9, duration:.9, yoyo:true, repeat:1, delay:1.2, ease:'sine.inOut'}); g.to(d, {opacity:0, duration:1, delay:o.ms/1000 - 1}); },
  lanternBeam(L, T, o){ const g = G(), d = part(L, `left:${L.W*.12}px; top:${-L.H*.1}px; width:${L.W*.5}px; height:${L.H*1.3}px; transform-origin:50% 0; background:conic-gradient(from 160deg at 50% 0, transparent 0deg, ${hexA(T.glow, .32)} 20deg, ${hexA(T.glow, .1)} 30deg, transparent 40deg); mix-blend-mode:screen; filter:blur(4px);`);
    g.set(d, {rotation:-30, opacity:0}); g.to(d, {opacity:1, duration:.8}); g.to(d, {rotation:30, duration:o.ms/2000, yoyo:true, repeat:1, ease:'sine.inOut'}); g.to(d, {opacity:0, duration:1, delay:o.ms/1000 - 1}); },
  prism(L, T, o){ const g = G(); for(let i = 0; i < (o.lite ? 2 : 4); i++){ const d = part(L, `width:${L.W*.06}px; height:${L.H*1.5}px; top:${-L.H*.25}px; left:${rnd(.1, .85)*L.W}px; background:linear-gradient(90deg, rgba(255,80,80,0), rgba(255,120,120,.35), rgba(255,230,120,.35), rgba(120,255,160,.35), rgba(120,180,255,.35), rgba(200,120,255,.35), rgba(200,120,255,0)); mix-blend-mode:screen; filter:blur(2px); transform-origin:50% 0;`);
    g.set(d, {rotation:rnd(-30, 30), opacity:0}); g.to(d, {opacity:1, duration:.7, delay:.3 + i*.4, yoyo:true, repeat:1, repeatDelay:.8}); g.to(d, {rotation:'+=' + rnd(-10, 10), duration:o.ms/1000}); } },
  sunGlints(L, T, o){ const g = G(), sun = part(L, `left:${L.W*.78}px; top:${-L.H*.12}px; width:${L.H*.6}px; height:${L.H*.6}px; border-radius:50%; background:radial-gradient(closest-side, rgba(255,250,220,.75), rgba(255,220,140,.25) 50%, transparent); mix-blend-mode:screen;`);
    g.fromTo(sun, {opacity:0, scale:.7}, {opacity:1, scale:1, duration:1.4}); g.to(sun, {opacity:0, duration:1, delay:o.ms/1000 - 1});
    stream(L, o.lite ? 10 : 20, o.ms - 1200, ()=>{ const d = part(L, 'width:10px; height:10px; margin:-5px 0 0 -5px; background:#fff; clip-path:polygon(50% 0, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0 50%, 44% 44%);');
      g.set(d, {x:rnd(0, L.W), y:L.H*rnd(.65, .95), scale:0}); g.to(d, {scale:rnd(.8, 1.4), duration:.2, yoyo:true, repeat:1, onComplete:()=> d.remove()}); }); },
  shootingStar(L, T, o){ const g = G(); [0, 1, 2].slice(0, o.lite ? 1 : 3).forEach(i=>{ const d = part(L, `width:${L.W*.18}px; height:2px; border-radius:2px; background:linear-gradient(90deg, transparent, #fff); box-shadow:0 0 8px #cfd8ff; transform-origin:100% 50%;`);
    const x0 = rnd(.4, .95)*L.W, y0 = rnd(0, .25)*L.H; g.set(d, {x:x0, y:y0, rotation:-152, opacity:0});
    g.to(d, {x:x0 - L.W*.35, y:y0 + L.W*.35*Math.tan(28*Math.PI/180), opacity:1, duration:.7, delay:.8 + i*1.1, ease:'power1.in', onComplete:()=> g.to(d, {opacity:0, duration:.2})}); }); },
  dragonShadow(L, T, o){ dragonPass(L, o); },
};
// A flock: birds (dark ticks), gulls (white), an eagle (one big glider), bats (jittery), fish (a school under the water).
function flock(L, kind, n, ms){ const g = G();
  const sw = {bird:16, gull:20, eagle:54, bat:16, fish:18}[kind] || 16, col = {bird:'#1c1a14', gull:'#fbfbf6', eagle:'#241c12', bat:'#120c10', fish:'rgba(10,40,50,.55)'}[kind];
  const shape = kind === 'fish' ? `<svg viewBox="0 0 30 14" width="${sw}" height="${sw*.47}"><path d="M2 7 Q 10 0 20 7 Q 10 14 2 7 Z M20 7 L29 1 L27 7 L29 13 Z" fill="${col}"/></svg>`
    : kind === 'bat' ? `<svg viewBox="0 0 30 14" width="${sw}" height="${sw*.47}"><path d="M15 6 Q 9 0 1 3 Q 5 6 4 10 Q 9 7 12 10 Q 14 7 15 9 Q 16 7 18 10 Q 21 7 26 10 Q 25 6 29 3 Q 21 0 15 6 Z" fill="${col}"/></svg>`
    : `<svg viewBox="0 0 30 14" width="${sw}" height="${sw*.47}" style="overflow:visible"><path d="M1 6 Q 8 -1 15 7 Q 22 -1 29 6" stroke="${col}" stroke-width="${kind === 'eagle' ? 3.2 : 2.4}" fill="none" stroke-linecap="round"/>${kind === 'eagle' ? `<path d="M12 7 L15 12 L18 7 Z" fill="${col}"/>` : ''}</svg>`;
  const dir = Math.random() < .5 ? 1 : -1, y0 = rnd(.12, .38)*L.H, dur = Math.max(2.6, (ms || 4000)/1000*(kind === 'eagle' ? 1.1 : .85));
  for(let i = 0; i < n; i++){
    const row = Math.ceil(i/2), side = i % 2 ? 1 : -1, ox = -row*sw*1.3, oy = (kind === 'fish' ? rnd(-30, 30) : row*sw*.55*side) + (kind === 'bat' ? rnd(-30, 30) : 0);
    const d = part(L, '', `<div class="fxg-flap">${shape}</div>`); const flap = d.firstChild;
    const startX = dir > 0 ? -sw*3 + ox : L.W + sw*3 - ox, endX = dir > 0 ? L.W + sw*3 + ox + L.W*.1 : -sw*3 - ox - L.W*.1;
    g.set(d, {x:startX, y:y0 + oy + (kind === 'fish' ? L.H*.35 : 0), scaleX:dir*(kind === 'eagle' ? 1 : rnd(.75, 1.05)), scaleY:kind === 'eagle' ? 1 : rnd(.75, 1.05)});
    g.to(d, {x:endX, y:'-=' + (kind === 'fish' ? rnd(-20, 20) : L.H*rnd(.04, .12)), duration:dur*rnd(.92, 1.08), delay:i*.06, ease:'none', onComplete:()=> d.remove()});
    if(kind === 'bat') g.to(flap, {y:rnd(8, 18), duration:.22, yoyo:true, repeat:Math.round(dur*4), ease:'sine.inOut'});
    if(kind === 'fish') g.to(flap, {skewY:12, duration:.25, yoyo:true, repeat:Math.round(dur*4), ease:'sine.inOut'});
    else g.to(flap.firstChild, {scaleY:kind === 'eagle' ? .55 : -.6, duration:kind === 'bat' ? .07 : kind === 'eagle' ? .5 : .16, yoyo:true, repeat:kind === 'eagle' ? 3 : Math.round(dur*(kind === 'bat' ? 14 : 6)), ease:'sine.inOut', transformOrigin:'50% 60%'}); } }
// A dragon's shadow sweeps over the whole area; the ground darkens under it and a gust follows.
function dragonPass(L, o){ if(o.delay){ const o2 = Object.assign({}, o, {delay:0}); later(()=>{ if(L.isConnected) dragonPass(L, o2); }, o.delay); return; } const g = G();
  const W = Math.max(L.W, L.H)*1.1, d = part(L, `width:${W}px; height:${W*.55}px; filter:blur(${Math.round(W/90)}px); opacity:0;`,
    `<svg viewBox="0 0 400 220" width="100%" height="100%"><g fill="rgba(6,4,10,.62)"><path d="M200 70 C 215 70 222 90 222 112 C 222 140 212 170 200 214 C 188 170 178 140 178 112 C 178 90 185 70 200 70 Z"/>
      <path d="M200 70 C 206 54 214 46 224 44 L 214 58 Z M200 70 C 194 54 186 46 176 44 L 186 58 Z"/><path class="fxg-wing" d="M216 96 C 260 60 320 40 396 50 C 360 64 350 80 352 92 C 330 84 310 92 300 104 C 284 96 262 104 252 118 C 240 108 228 108 220 116 Z"/>
      <path class="fxg-wing" d="M184 96 C 140 60 80 40 4 50 C 40 64 50 80 48 92 C 70 84 90 92 100 104 C 116 96 138 104 148 118 C 160 108 172 108 180 116 Z"/></g></svg>`);
  const dark = part(L, 'left:0; top:0; width:100%; height:100%; background:rgba(8,6,14,0);');
  g.set(d, {x:-W*.9, y:L.H*.75, rotation:-62, transformOrigin:'50% 50%'});
  g.to(d, {opacity:1, duration:.4});
  g.to(d, {x:L.W + W*.1, y:-W*.6, duration:Math.min(2.6, (o.ms || 3600)/1000*.7), ease:'power1.inOut', onComplete:()=> d.remove()});
  g.to(d.querySelectorAll('.fxg-wing'), {scaleY:.55, transformOrigin:'50% 100%', duration:.32, yoyo:true, repeat:7, ease:'sine.inOut'});
  g.to(dark, {backgroundColor:'rgba(8,6,14,.3)', duration:.7, yoyo:true, repeat:1, repeatDelay:.6, ease:'sine.inOut', onComplete:()=> dark.remove()});
  later(()=>{ if(!L.isConnected) return; stream(L, 14, 500, ()=>{ const p = part(L, 'width:6px; height:3px; border-radius:40%; background:rgba(200,190,170,.8);'); const y = rnd(.2, .9)*L.H;
    g.set(p, {x:-10, y}); g.to(p, {x:L.W + 10, y:y - rnd(20, 80), rotation:rnd(300, 900), duration:rnd(.7, 1.1), ease:'power1.in', onComplete:()=> p.remove()}); }); }, 900); }
css('flap', `.fxg-flap{display:block;} .fxg-flap svg{display:block; overflow:visible; transform-origin:50% 60%;}`);
// Run one theme's flourish set into a fresh layer (or into opts.L).
M.mapGrand = function(host, opts){ opts = opts || {}; const k = themeOf(opts), T = THEMES[k], ms = opts.ms || 4200;
  const L = opts.L || stage(host, 'fxg-grand', opts.z); const list = opts.only ? [].concat(opts.only) : T.grand;
  list.forEach(n=> GRAND[n] && call(()=> GRAND[n](L, T, Object.assign({ms, lite:!!opts.lite}, opts))));
  if(opts.L) return wait(ms);
  return wait(ms + 300).then(()=>{ done(L); opts.onDone && call(opts.onDone); }); };
Object.keys(GRAND).forEach(n=>{ M[n] = (host, opts)=> M.mapGrand(host, Object.assign({}, opts || {}, {only:n})); });
M.GRAND = GRAND;

// =====================================================================================================================
// 3. MAP TITLE CARDS (2026-10-16). Three styles; each theme has a default (THEMES[k].style), the lab plays all three.
// 2026-10-16 (user: "I prefer the Ice Hollow kind. Can you change the 2nd mode to the same kind as Ice Hollow? Thick ribbon, clear royal looking font"): the cinematic letterbox is no longer any theme's default; peaks, desert, volcano and night maps use the ribbon banner too. The lab still plays all three.
//    A: a ribbon banner with a medallion · B: ink-brush calligraphy with a seal · C: a cinematic letterbox.
// =====================================================================================================================
css('titles', `
.fxg-tt{position:absolute; left:50%; top:38%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; text-align:center; width:max-content; max-width:96%; z-index:3;}
.fxg-scrim{position:absolute; left:50%; top:38%; width:130%; height:56%; transform:translate(-50%,-50%); background:radial-gradient(closest-side, rgba(10,8,4,.55), rgba(10,8,4,.25) 55%, rgba(10,8,4,0)); z-index:1;}
.fxg-ch{display:inline-block; white-space:pre;}
.fxg-tb-medal{position:relative; z-index:3; width:calc(var(--fs)*1.05); height:calc(var(--fs)*1.05); min-width:38px; min-height:38px; border-radius:50%; display:grid; place-items:center; font-size:calc(var(--fs)*.55);
  background:radial-gradient(circle at 35% 30%, #fffbe8, var(--trim) 55%, #7a5a22); box-shadow:0 0 0 3px var(--b), 0 0 0 5px var(--trim), 0 8px 16px rgba(0,0,0,.5); margin-bottom:calc(var(--fs)*-.32);}
.fxg-tb-rib{position:relative; z-index:2; padding:calc(var(--fs)*.4) calc(var(--fs)*.9) calc(var(--fs)*.26); background:linear-gradient(180deg, var(--a), var(--b)); color:var(--ink);
  box-shadow:inset 0 3px 0 var(--trim), inset 0 -3px 0 var(--trim), inset 0 6px 0 var(--b), inset 0 -6px 0 var(--b), inset 0 7px 0 rgba(255,255,255,.2), 0 12px 24px rgba(0,0,0,.5);}
.fxg-tb-tails{position:absolute; left:50%; top:calc(var(--fs)*.9); transform:translateX(-50%); z-index:1; display:flex; justify-content:space-between;}
.fxg-tb-tail{display:block; width:calc(var(--fs)*1.1); height:calc(var(--fs)*1.5); background:linear-gradient(180deg, var(--b), var(--a)); filter:brightness(.7);}
.fxg-tb-tail.l{clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%, 36% 50%);} .fxg-tb-tail.r{clip-path:polygon(0 0, 100% 0, 64% 50%, 100% 100%, 0 100%);}
.fxg-tb-name{font:400 var(--fs)/1.1 'MedievalSharp', 'Baloo 2', Georgia, serif; letter-spacing:.02em; white-space:nowrap; text-shadow:0 2px 0 rgba(0,0,0,.5), 0 0 18px var(--glow); perspective:400px;}
.fxg-tb-shine{position:absolute; inset:0; overflow:hidden; pointer-events:none;} .fxg-tb-shine i{position:absolute; top:-30%; bottom:-30%; width:26%; left:-40%; transform:skewX(-22deg); background:linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);}
.fxg-sub{position:relative; z-index:2; font:800 max(11px, calc(var(--fs)*.3))/1.2 'Baloo 2', system-ui, sans-serif; letter-spacing:.3em; text-transform:uppercase; color:var(--ink); text-shadow:0 2px 5px rgba(0,0,0,.9); margin-top:calc(var(--fs)*.3); display:flex; align-items:center; gap:10px; white-space:nowrap;}
.fxg-sub::before, .fxg-sub::after{content:''; width:calc(var(--fs)*.9); height:2px; background:linear-gradient(90deg, transparent, var(--trim));} .fxg-sub::after{transform:scaleX(-1);}
.fxg-ti-wrap{position:relative; padding:calc(var(--fs)*.2) calc(var(--fs)*.7);}
.fxg-ti-brush{position:absolute; left:50%; top:50%; width:122%; height:175%; transform:translate(-50%,-50%); overflow:visible; z-index:0;}
.fxg-ti-name{position:relative; z-index:1; font:700 calc(var(--fs)*1.3)/1 'Caveat', 'Segoe Script', cursive; color:var(--ink); white-space:nowrap; text-shadow:0 2px 0 rgba(0,0,0,.35), 0 0 14px rgba(0,0,0,.35);}
.fxg-ti-seal{position:absolute; z-index:2; right:calc(var(--fs)*.05); bottom:calc(var(--fs)*-.3); width:calc(var(--fs)*.78); height:calc(var(--fs)*.78); min-width:30px; min-height:30px; border-radius:5px; display:grid; place-items:center; font-size:calc(var(--fs)*.42);
  background:#b3261c; box-shadow:inset 0 0 0 2px rgba(255,226,206,.75), inset 0 0 0 4px #b3261c, inset 0 0 0 5px rgba(255,226,206,.5), 0 3px 8px rgba(0,0,0,.4);}
.fxg-ti-sub{position:relative; z-index:1; font:600 italic max(12px, calc(var(--fs)*.34))/1.2 Nunito, Georgia, serif; color:var(--ink); letter-spacing:.12em; text-shadow:0 2px 6px rgba(0,0,0,.95); margin-top:calc(var(--fs)*.5);}
.fxg-bar{position:absolute; left:0; right:0; height:12%; background:#050403; z-index:2;} .fxg-bar.t{top:0;} .fxg-bar.b{bottom:0;}
.fxg-vig{position:absolute; inset:0; background:radial-gradient(ellipse at 50% 42%, transparent 35%, rgba(0,0,0,.6)); z-index:1;}
.fxg-tc-name{font:400 var(--fs)/1.05 'Lilita One', 'Baloo 2', system-ui, sans-serif; color:var(--ink); letter-spacing:.16em; text-transform:uppercase; white-space:nowrap; text-shadow:0 0 26px var(--glow), 0 3px 0 rgba(0,0,0,.55);}
.fxg-tc-rule{display:flex; align-items:center; gap:10px; width:min(80%, 560px); margin:calc(var(--fs)*.22) 0;} .fxg-tc-rule i{flex:1; height:1.5px; background:linear-gradient(90deg, transparent, var(--trim));} .fxg-tc-rule i + b + i{transform:scaleX(-1);}
.fxg-tc-rule b{width:9px; height:9px; transform:rotate(45deg); background:var(--trim); box-shadow:0 0 10px var(--glow); flex:none;}
.fxg-tc-sub{font:700 max(11px, calc(var(--fs)*.28))/1.2 'Baloo 2', system-ui, sans-serif; letter-spacing:.42em; text-transform:uppercase; color:var(--trim); text-shadow:0 2px 6px rgba(0,0,0,.9); white-space:nowrap;}
.fxg-tc-ico{font-size:calc(var(--fs)*.6); margin-bottom:calc(var(--fs)*.1); filter:drop-shadow(0 0 10px var(--glow));}
`);
const chars = s=> [...String(s)].map(c=> `<span class="fxg-ch">${esc(c)}</span>`).join('');
const vars = (T, fs)=> `--fs:${fs.toFixed(1)}px; --ink:${T.ink}; --glow:${T.glow}; --a:${T.a}; --b:${T.b}; --trim:${T.trim}; --ink2:${T.ink2};`;
function fsFor(L, name, perChar, cap){ const len = Math.max(6, [...String(name)].length); return Math.max(16, Math.min(cap || 62, L.W*.075, L.W*.8/(len*perChar))); }
const TITLES = {
  banner(L, T, o){ const g = G(), fs = fsFor(L, o.name, .62), box = part(L, 'left:0; top:0; width:100%; height:100%;');
    box.innerHTML = `<div class="fxg-scrim"></div><div class="fxg-tt fxg-tb" style="${vars(T, fs)}"><div class="fxg-tb-medal">${esc(o.icon || '🗺️')}</div>
      <div class="fxg-tb-ribwrap" style="position:relative"><div class="fxg-tb-tails" style="width:calc(100% + var(--fs)*1.3)"><i class="fxg-tb-tail l"></i><i class="fxg-tb-tail r"></i></div>
      <div class="fxg-tb-rib"><div class="fxg-tb-name">${chars(o.name)}</div><div class="fxg-tb-shine"><i></i></div></div></div>${o.sub ? `<div class="fxg-sub">${esc(o.sub)}</div>` : ''}</div>`;
    const q = s=> box.querySelector(s), tl = g.timeline();
    tl.from(q('.fxg-scrim'), {opacity:0, duration:.5}, 0)
      .from(q('.fxg-tb-medal'), {y:-L.H*.25, rotation:-200, opacity:0, duration:.8, ease:'bounce.out'}, 0)
      .fromTo(q('.fxg-tb-rib'), {clipPath:'inset(0% 50% 0% 50%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:.6, ease:'power3.out'}, .15)
      .from(q('.fxg-tb-tails'), {scaleX:.2, opacity:0, duration:.5, ease:'back.out(1.6)'}, .45)
      .from(box.querySelectorAll('.fxg-tb-name .fxg-ch'), {y:fs*.5, opacity:0, rotationX:-90, duration:.45, stagger:.035, ease:'back.out(2.4)'}, .4)
      .fromTo(q('.fxg-tb-shine i'), {xPercent:0}, {xPercent:620, duration:.9, ease:'power2.inOut'}, 1.05);
    if(q('.fxg-sub')) tl.from(q('.fxg-sub'), {opacity:0, y:8, letterSpacing:'.8em', duration:.7, ease:'power2.out'}, .9);
    tl.to(q('.fxg-tt'), {y:-16, opacity:0, duration:.6, ease:'power2.in'}, (o.hold || 2.2) + 1.1).to(q('.fxg-scrim'), {opacity:0, duration:.6}, '<');
    return {tl, box}; },
  ink(L, T, o){ const g = G(), fs = fsFor(L, o.name, .5, 54), box = part(L, 'left:0; top:0; width:100%; height:100%;');
    const ink = T.ink2, main = 'M26 96 C 120 58, 240 66, 320 80 S 500 104, 578 70';
    const bristles = [[-30, 6, .55], [-20, 9, .7], [-8, 5, .5], [8, 7, .65], [20, 10, .6], [31, 5, .45]].map(([dy, w, a], i)=> `<path d="${main}" transform="translate(${i % 2 ? 6 : -4} ${dy})" stroke="${ink}" stroke-opacity="${a}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="${i % 3 ? '60 6 120 4 400' : '200 8 30 5 500'}"/>`).join('');
    const drops = [0, 1, 2, 3, 4].map(()=> `<circle cx="${(560 + rnd(-30, 30)).toFixed(0)}" cy="${(70 + rnd(-40, 40)).toFixed(0)}" r="${rnd(2, 6).toFixed(1)}" fill="${ink}"/>`).join('');
    const id = 'fxgInk' + Math.floor(rnd(1, 1e9));
    box.innerHTML = `<div class="fxg-scrim" style="opacity:.7"></div><div class="fxg-tt fxg-ti" style="${vars(T, fs)}"><div class="fxg-ti-wrap">
      <svg class="fxg-ti-brush" viewBox="0 0 600 160" preserveAspectRatio="none"><defs><clipPath id="${id}"><rect x="0" y="-40" width="0" height="240"/></clipPath></defs>
      <g clip-path="url(#${id})"><path d="${main}" stroke="${ink}" stroke-opacity=".86" stroke-width="64" fill="none" stroke-linecap="round"/>${bristles}${drops}</g></svg>
      <div class="fxg-ti-name">${esc(o.name)}</div><div class="fxg-ti-seal">${esc(o.icon || '印')}</div></div>${o.sub ? `<div class="fxg-ti-sub">${esc(o.sub)}</div>` : ''}</div>`;
    // the brush: one sweep that uncovers the strokes from the left (a clip rect grows), so the dry-brush gaps survive
    const q = s=> box.querySelector(s), tl = g.timeline();
    tl.from(q('.fxg-scrim'), {opacity:0, duration:.5}, 0)
      .to(q(`#${id} rect`), {attr:{width:640}, duration:.7, ease:'power2.inOut'}, .05)
      .from(q('.fxg-ti-brush'), {scaleY:.6, duration:.7, ease:'power2.out'}, .05)
      .fromTo(q('.fxg-ti-name'), {clipPath:'inset(-30% 100% -30% -6%)'}, {clipPath:'inset(-30% -6% -30% -6%)', duration:.9, ease:'power1.inOut'}, .45)
      .from(q('.fxg-ti-name'), {x:-8, duration:.9, ease:'power1.out'}, .45)
      .from(q('.fxg-ti-seal'), {scale:2.4, opacity:0, rotation:-30, duration:.28, ease:'power4.in'}, 1.35)
      .to(q('.fxg-ti-wrap'), {x:2, duration:.05, yoyo:true, repeat:3}, 1.63);
    if(q('.fxg-ti-sub')) tl.from(q('.fxg-ti-sub'), {opacity:0, y:6, duration:.6}, 1.2);
    tl.to(q('.fxg-tt'), {opacity:0, filter:'blur(6px)', duration:.7, ease:'power1.in'}, (o.hold || 2.2) + 1.2).to(q('.fxg-scrim'), {opacity:0, duration:.7}, '<');
    return {tl, box}; },
  cinema(L, T, o){ const g = G(), fs = fsFor(L, o.name, .84, 54), box = part(L, 'left:0; top:0; width:100%; height:100%;');
    box.innerHTML = `<div class="fxg-vig"></div><div class="fxg-scrim" style="z-index:1; background:radial-gradient(closest-side, rgba(4,4,8,.62), rgba(4,4,8,.3) 60%, rgba(4,4,8,0))"></div><div class="fxg-bar t"></div><div class="fxg-bar b"></div><div class="fxg-tt fxg-tc" style="${vars(T, fs)}">${o.icon ? `<div class="fxg-tc-ico">${esc(o.icon)}</div>` : ''}
      <div class="fxg-tc-rule"><i></i><b></b><i></i></div><div class="fxg-tc-name">${esc(o.name)}</div><div class="fxg-tc-rule"><i></i><b></b><i></i></div>${o.sub ? `<div class="fxg-tc-sub">${esc(o.sub)}</div>` : ''}</div>`;
    const q = s=> box.querySelector(s), qa = s=> box.querySelectorAll(s), tl = g.timeline(), hold = (o.hold || 2.2) + 1.2;
    tl.from(q('.fxg-bar.t'), {yPercent:-100, duration:.6, ease:'power3.out'}, 0).from(q('.fxg-bar.b'), {yPercent:100, duration:.6, ease:'power3.out'}, 0)
      .from([q('.fxg-vig'), q('.fxg-scrim')], {opacity:0, duration:.8}, 0)
      .from(qa('.fxg-tc-rule i'), {scaleX:0, duration:.8, ease:'power3.out', transformOrigin:'100% 50%'}, .35)
      .from(qa('.fxg-tc-rule b'), {scale:0, rotation:-180, duration:.5, ease:'back.out(3)'}, .35)
      .fromTo(q('.fxg-tc-name'), {letterSpacing:'.7em', opacity:0, filter:'blur(10px)'}, {letterSpacing:'.16em', opacity:1, filter:'blur(0px)', duration:1.3, ease:'power3.out'}, .45);
    if(q('.fxg-tc-ico')) tl.from(q('.fxg-tc-ico'), {y:14, opacity:0, duration:.7, ease:'power2.out'}, .7);
    if(q('.fxg-tc-sub')) tl.from(q('.fxg-tc-sub'), {opacity:0, letterSpacing:'.9em', duration:.9, ease:'power2.out'}, 1.05);
    tl.to(q('.fxg-tt'), {opacity:0, scale:1.04, duration:.7, ease:'power1.in'}, hold).to([q('.fxg-vig'), q('.fxg-scrim')], {opacity:0, duration:.8}, hold)
      .to(q('.fxg-bar.t'), {yPercent:-100, duration:.6, ease:'power2.in'}, hold + .3).to(q('.fxg-bar.b'), {yPercent:100, duration:.6, ease:'power2.in'}, hold + .3);
    return {tl, box}; },
};
M.TITLE_STYLES = Object.keys(TITLES);
// The title sequence: particles + the theme's flourish + the title card, about 4 s, then everything fades and is removed.
// opts: name, sub, icon, id / biome / theme, style ('banner' | 'ink' | 'cinema'), lite (fewer particles), grand (false: none), delay (ms)
M.mapTitle = function(host, opts){ opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const k = themeOf(opts), T = THEMES[k], style = TITLES[opts.style] ? opts.style : T.style;
  const go = ()=>{ // the game may have re-rendered the map meanwhile: follow the element by its id
    if(host && host !== document.body && !host.isConnected && host.id) host = document.getElementById(host.id) || host;
    if(host && host !== document.body && !host.isConnected) return Promise.resolve();
    const L = stage(host, 'fxg-title-stage fxg-theme-' + k, opts.z != null ? opts.z : 60);
    // night falls over the map for a night theme, so the stars and aurora read on light map art
    if(T.veil){ const v = part(L, `left:0; top:0; width:100%; height:100%; background:${T.veil};`); g.fromTo(v, {opacity:0}, {opacity:1, duration:.8}); }
    (PARTICLES[T.p] || PARTICLES.leaves)(L, opts.lite ? 14 : 28, 2800);
    if(opts.grand !== false) (opts.extra || []).concat(T.grand).forEach(n=> GRAND[n] && call(()=> GRAND[n](L, T, {ms:4400, lite:!!opts.lite, delay:n === 'dragonShadow' ? 1200 : 0})));
    const {tl} = TITLES[style](L, T, Object.assign({name:'Bramblewood'}, opts));
    // a tap anywhere on the host hurries it along (the layer itself never takes the pointer)
    const hurry = ()=> tl.timeScale(3); try{ host && host.addEventListener && host.addEventListener('pointerdown', hurry, {once:true}); }catch(e){}
    return new Promise(res=>{ tl.eventCallback('onComplete', ()=>{ g.to(L, {opacity:0, duration:.6, onComplete:()=>{ try{ host.removeEventListener('pointerdown', hurry); }catch(e){} done(L); opts.onDone && call(opts.onDone); res(); }}); }); }); };
  return opts.delay ? wait(opts.delay).then(go) : go(); };
// Game hook (2026-10-16): arena_app.js renderConquestSubTab → fxHook('mapTitle', layoutEl, info). Once per map per session,
// never during a fight; Medium effects and up (High adds the full particle count). Volcano Lair gets the dragon.
const SEEN_KEY = 'bw_fxg_map_titles';
M.hooks.mapTitle = (host, info, env)=>{
  if(!host || !info || !env || !env.fxAtLeast('med') || RM()) return;
  if(env.match && !env.match.over) return;
  let seen = []; try{ seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]'); }catch(e){}
  if(seen.includes(info.id)) return; seen.push(info.id); try{ sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen)); }catch(e){}
  M.mapTitle(host, Object.assign({lite:!env.fxAtLeast('high'), extra:info.id === 'mx' ? ['dragonShadow'] : []}, info));
};

// =====================================================================================================================
// 4. THE FUN SET (2026-10-16, user: "Any other VFX playground items to add in each? Invent more for fun?"). Ideas built
//    for real, each themed to the woodland card game. Card effects take a .card-tile (or its .board-card); screen effects
//    take a host (default: the whole screen). All return a Promise and leave what they touch as they found it.
// =====================================================================================================================
const RECT = el=>{ const r = (tileOf(el) || el).getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height, cx:r.left + r.width/2, cy:r.top + r.height/2}; };
// A fixed overlay exactly over a screen rect (cards and board units: the lab's zoomed stages report true screen rects).
function over(r, cls, html, pad){ pad = pad || 0; const e = layer('fxg-over ' + (cls || ''), html); e.style.cssText += `left:${r.x - pad}px; top:${r.y - pad}px; width:${r.w + pad*2}px; height:${r.h + pad*2}px;`; return e; }
// A fixed, full-screen, empty overlay for loose particles.
const sky = ()=>{ const e = layer('fxg-sky'); e.style.cssText += 'inset:0; width:100vw; height:100vh; overflow:hidden;'; return e; };
const dot = (L, css2, html)=> part(L, css2, html);
const PALETTE = ['#ffd56e', '#ff7a6b', '#7fd6ff', '#9dff8a', '#f4a6ff', '#fff3c2', '#ffb04a'];
const fin = (els, res, extra)=>{ els.forEach(e=>{ if(e && e.remove){ const g = G(); if(g) g.killTweensOf(e.querySelectorAll ? [e, ...e.querySelectorAll('*')] : e); e.remove(); } }); call(extra); res && res(); };
css('fun', `.fxg-over{overflow:visible;} .fxg-sky{pointer-events:none;}
.fxg-cover{position:absolute; inset:0; border-radius:10px; overflow:hidden;}
.fxg-coin{position:absolute; left:0; top:0; width:16px; height:16px; margin:-8px 0 0 -8px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff6c8, #ffd04a 45%, #c98a12 75%); box-shadow:inset 0 0 0 1.5px #a86c08, 0 0 6px rgba(255,200,60,.6);}
.fxg-coin::after{content:''; position:absolute; inset:4px; border-radius:50%; border:1.5px solid rgba(160,100,10,.55);}
.fxg-conf{position:absolute; left:0; top:0; width:7px; height:11px; border-radius:1.5px;}
.fxg-stamp{position:absolute; left:50%; top:50%; padding:4px 10px; border:3px solid #c4221b; border-radius:6px; color:#c4221b; font:900 15px/1 'Lilita One', 'Baloo 2', system-ui, sans-serif; letter-spacing:.05em; white-space:nowrap; background:rgba(255,240,235,.1); text-shadow:0 0 1px #c4221b; box-shadow:inset 0 0 0 1px rgba(196,34,27,.5); opacity:.95;}
.fxg-lantern{position:absolute; left:0; top:0; width:26px; height:34px; margin:-17px 0 0 -13px; border-radius:40% 40% 34% 34%; background:radial-gradient(ellipse at 50% 60%, #fff3b0, #ffb347 45%, #e2562a 85%); box-shadow:0 0 18px 6px rgba(255,160,60,.55);}
.fxg-lantern::before, .fxg-lantern::after{content:''; position:absolute; left:28%; right:28%; height:4px; background:#5a2a12; border-radius:2px;} .fxg-lantern::before{top:-2px;} .fxg-lantern::after{bottom:-2px;}
.fxg-ghost{position:absolute; left:0; top:0; width:30px; height:36px; border-radius:15px 15px 4px 4px; background:linear-gradient(#ffffff, #e8f0ff); box-shadow:0 0 14px rgba(200,220,255,.8);
  -webkit-mask:radial-gradient(circle at 5px 100%, transparent 5px, #000 5.5px) 0 0/10px 100% repeat-x; mask:radial-gradient(circle at 5px 100%, transparent 5px, #000 5.5px) 0 0/10px 100% repeat-x;}
.fxg-ghost i{position:absolute; top:11px; width:5px; height:7px; border-radius:50%; background:#2a2440;} .fxg-ghost i:first-child{left:8px;} .fxg-ghost i:last-child{right:8px;}
.fxg-bubble{position:absolute; left:0; top:0; border-radius:50%; background:radial-gradient(circle at 32% 28%, rgba(255,255,255,.9) 0 8%, rgba(255,255,255,.18) 14%, rgba(180,230,255,.10) 45%, rgba(255,170,240,.28) 72%, rgba(170,255,240,.45) 88%, rgba(255,255,255,.7) 100%);}
`);

// ---- cards ----
M.fireworkReveal = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const cover = over(r, '', `<div class="fxg-cover" style="background:radial-gradient(circle at 50% 40%, #2a3570, #0d1230); box-shadow:inset 0 0 0 2px rgba(255,220,140,.6); display:grid; place-items:center; color:#ffe6a0; font:900 ${Math.round(r.w*.45)}px 'Lilita One', sans-serif;">?</div>`);
  const S = sky(), bursts = o.finale ? 3 : 1, cols = o.finale ? [['#ff6b6b', '#ffd56e'], ['#7fd6ff', '#ffffff'], ['#9dff8a', '#f4a6ff']] : [[pick(PALETTE), '#fff3c2']];
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([cover, S], res, ()=> g.set(t, {clearProps:'transform,filter'}))});
    for(let b = 0; b < bursts; b++){ const at = b*.55, bx = r.cx + (bursts > 1 ? (b - 1)*r.w*.9 : 0), by = r.y - r.h*.15 - (b === 1 ? 20 : 0);
      const rocket = dot(S, 'width:4px; height:14px; margin:-7px 0 0 -2px; border-radius:2px; background:linear-gradient(#fff, rgba(255,200,120,0)); box-shadow:0 0 8px #ffd56e;');
      tl.set(rocket, {x:bx, y:r.y + r.h + 90}, at).to(rocket, {y:by, duration:.55, ease:'power2.out'}, at).set(rocket, {opacity:0}, at + .55);
      tl.add(()=>{ const flash = dot(S, `width:${r.w*1.6}px; height:${r.w*1.6}px; margin:${-r.w*.8}px 0 0 ${-r.w*.8}px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,.9), ${hexA(cols[b][0], .4)} 35%, transparent 70%);`);
        g.fromTo(flash, {x:bx, y:by, scale:.2, opacity:1}, {scale:1.2, opacity:0, duration:.5, ease:'power2.out'});
        const n = 28; for(let i = 0; i < n; i++){ const a = i/n*Math.PI*2 + rnd(-.05, .05), sp = rnd(.7, 1)*r.w*1.1, c = i % 3 ? cols[b][0] : cols[b][1];
          const p = dot(S, `width:12px; height:3px; margin:-1.5px 0 0 -6px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), ${c}); box-shadow:0 0 6px ${c};`);
          g.set(p, {x:bx, y:by, rotation:a*57.3}); g.to(p, {x:bx + Math.cos(a)*sp, y:by + Math.sin(a)*sp, duration:.7, ease:'power3.out'});
          g.to(p, {y:'+=' + rnd(30, 60), opacity:0, duration:.9, delay:.6, ease:'power1.in', onComplete:()=> p.remove()}); }
        try{ if(root.SoundKit && root.SoundKit.pop) root.SoundKit.pop(); }catch(e){} }, at + .55); }
    const rev = .55*(bursts - 1) + .62;
    tl.to(cover, {opacity:0, scale:1.12, duration:.35, ease:'power2.out'}, rev).fromTo(t, {scale:.94, filter:'brightness(1.8)'}, {scale:1, filter:'brightness(1)', duration:.6, ease:'back.out(3)'}, rev);
    tl.add(()=>{ for(let i = 0; i < 12; i++){ const s = dot(S, 'width:8px; height:8px; margin:-4px; background:#fff3c2; clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);');
      g.set(s, {x:r.x + rnd(0, r.w), y:r.y - 10, scale:rnd(.6, 1.2)}); g.to(s, {y:r.y + r.h*rnd(.4, 1.1), rotation:180, opacity:0, duration:rnd(1, 1.6), ease:'sine.in', onComplete:()=> s.remove()}); } }, rev);
    tl.to({}, {duration:1.3}); }); };
M.cardTornado = function(els, o){ o = o || {}; const g = G(); els = [].concat(els || []).map(e=> e && ((e.closest && e.closest('.board-card')) || tileOf(e))).filter(Boolean); if(!g || !els.length) return Promise.resolve(); // whole slots, frame and all
  const rs = els.map(RECT), cx = rs.reduce((a, r)=> a + r.cx, 0)/rs.length, cy = rs.reduce((a, r)=> a + r.cy, 0)/rs.length, S = sky();
  // the funnel: a few swirling rings stacked into a cone, and leaves caught in it
  const rings = [0, 1, 2, 3, 4].map(i=> dot(S, `width:${60 + i*34}px; height:${16 + i*7}px; margin:${-(8 + i*3.5)}px 0 0 ${-(30 + i*17)}px; border-radius:50%; border:2px solid rgba(230,225,200,${.18 + i*.05}); border-left-color:transparent; border-right-color:transparent;`));
  rings.forEach((e, i)=>{ g.set(e, {x:cx, y:cy + 70 - i*34, opacity:0}); g.to(e, {opacity:1, duration:.3, delay:i*.05}); g.to(e, {rotation:360*(i % 2 ? 1 : -1), duration:.6, repeat:3, ease:'none'}); g.to(e, {opacity:0, duration:.4, delay:2}); });
  for(let i = 0; i < 16; i++){ const l = dot(S, `width:9px; height:6px; border-radius:0 100% 0 100%; background:${pick(['#7fb24a', '#d9a23a', '#a8c64a'])};`), o2 = {a:rnd(0, 6.28), t:0}, r0 = rnd(30, 110);
    g.to(o2, {a:'+=' + 14, t:1, duration:2.3, ease:'sine.inOut', onUpdate:()=> g.set(l, {x:cx + Math.cos(o2.a)*r0*(1 - o2.t*.3), y:cy + 60 - o2.t*160 + Math.sin(o2.a)*r0*.25, rotation:o2.a*90, opacity:1 - Math.max(0, o2.t - .8)*5}), onComplete:()=> l.remove()}); }
  return new Promise(res=>{ let left = els.length; els.forEach((t, i)=>{ const r = rs[i], dx0 = r.cx - cx, dy0 = (r.cy - cy)/.35, r0 = Math.hypot(dx0, dy0) || 20, a0 = Math.atan2(dy0, dx0), p = {t:0};
    g.to(p, {t:1, duration:2.2, ease:'power1.inOut', delay:i*.04, onUpdate:()=>{ const tt = p.t, rr = r0*(1 - Math.sin(Math.PI*tt)*.55), a = a0 + tt*Math.PI*4, lift = -Math.sin(Math.PI*tt)*90;
      g.set(t, {x:cx + Math.cos(a)*rr - r.cx, y:cy + Math.sin(a)*rr*.35 + lift - r.cy, rotationY:tt*720, rotation:Math.sin(Math.PI*tt*2)*14, scale:1 - Math.sin(Math.PI*tt)*.2, zIndex:Math.sin(a) > 0 ? 30 : 5}); },
      onComplete:()=>{ g.fromTo(t, {y:-14}, {y:0, duration:.45, ease:'bounce.out', onComplete:()=>{ g.set(t, {clearProps:'transform,zIndex'}); if(--left === 0){ later(()=> fin([S], res), 200); } }}); }}); }); }); };
M.inkBrushReveal = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const id = 'fxgB' + Math.floor(rnd(1, 1e9)), strokes = ['M8 30 C 40 20, 70 36, 104 24', 'M4 70 C 40 56, 70 80, 106 64', 'M10 108 C 44 96, 76 116, 104 102'];
  const paper = `<div class="fxg-cover fxg-half" style="background:#f3ead2 linear-gradient(115deg, rgba(160,140,100,.12) 1px, transparent 1px) 0 0/7px 7px; box-shadow:inset 0 0 18px rgba(140,110,60,.35);"></div>`;
  const svg = `<svg viewBox="0 0 112 132" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible"><defs>${strokes.map((d, i)=> `<clipPath id="${id}${i}"><rect x="0" y="-20" width="0" height="180"/></clipPath>`).join('')}</defs>
    ${strokes.map((d, i)=> `<g clip-path="url(#${id}${i})"><path d="${d}" stroke="#16130f" stroke-width="16" stroke-opacity=".9" fill="none" stroke-linecap="round"/><path d="${d}" transform="translate(0 -7)" stroke="#16130f" stroke-width="3" stroke-opacity=".5" stroke-dasharray="30 4 50 3 90" fill="none"/><path d="${d}" transform="translate(2 8)" stroke="#16130f" stroke-width="2.5" stroke-opacity=".55" stroke-dasharray="14 5 70 3 90" fill="none"/></g>`).join('')}</svg>`;
  const top = over(r, '', `<div style="position:absolute; inset:0; clip-path:polygon(0 0, 100% 0, 100% 46%, 84% 52%, 66% 44%, 48% 55%, 30% 47%, 14% 54%, 0 49%);">${paper}${svg}</div>`);
  const bot = over(r, '', `<div style="position:absolute; inset:0; clip-path:polygon(0 49%, 14% 54%, 30% 47%, 48% 55%, 66% 44%, 84% 52%, 100% 46%, 100% 100%, 0 100%);">${paper}${svg}</div>`);
  const seal = over({x:r.x + r.w - r.w*.32, y:r.y + r.h - r.w*.34, w:r.w*.26, h:r.w*.26}, '', `<div style="position:absolute; inset:0; border-radius:4px; background:#b3261c; box-shadow:inset 0 0 0 2px rgba(255,226,206,.75); display:grid; place-items:center; color:#ffe9dc; font:900 ${Math.round(r.w*.15)}px serif;">森</div>`);
  g.set(seal, {opacity:0});
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([top, bot, seal], res)});
    strokes.forEach((d, i)=> tl.to([top, bot].map(e=> e.querySelector(`#${id}${i} rect`)), {attr:{width:130}, duration:.32, ease:'power2.inOut'}, .15 + i*.28));
    tl.to([top, bot], {x:0, duration:.25}, '+=.15')
      .to(top, {y:-r.h*.55, rotation:-7, opacity:0, duration:.7, ease:'power2.in'}, '>').to(bot, {y:r.h*.55, rotation:5, opacity:0, duration:.7, ease:'power2.in'}, '<')
      .fromTo(seal, {opacity:0, scale:2.4, rotation:-25}, {opacity:1, scale:1, rotation:-6, duration:.25, ease:'power4.in'}, '-=.2')
      .to(seal, {opacity:0, duration:.5}, '+=.7'); }); };
M.classifiedStamp = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  if(o.variant === 'B'){ // the dossier: a manila folder closes over the card, gets stamped, slides away
    const f = over(r, '', `<div style="position:absolute; inset:-4px; border-radius:6px; background:linear-gradient(160deg, #e7cf8f, #c9a85a); box-shadow:0 6px 14px rgba(0,0,0,.45), inset 0 0 0 1px rgba(90,60,20,.4);">
      <div style="position:absolute; top:-12px; left:10%; width:46%; height:14px; border-radius:5px 5px 0 0; background:#e2c682; font:800 8px/14px monospace; color:#5a3a12; text-align:center;">FILE 007</div>
      <div style="position:absolute; top:-8px; right:16%; width:9px; height:28px; border:2px solid #9aa3ad; border-radius:5px;"></div>
      <div style="position:absolute; left:12%; right:12%; top:26%; height:2px; background:rgba(90,60,20,.4); box-shadow:0 9px 0 rgba(90,60,20,.35), 0 18px 0 rgba(90,60,20,.3);"></div>
      <div class="fxg-stamp" style="font-size:${Math.round(r.w*.13)}px">EYES ONLY</div></div>`);
    const st = f.querySelector('.fxg-stamp');
    return new Promise(res=>{ g.timeline({onComplete:()=> fin([f], res)})
      .fromTo(f, {rotationY:-100, transformOrigin:'0 50%', transformPerspective:600}, {rotationY:0, duration:.5, ease:'power2.out'})
      .fromTo(st, {xPercent:-50, yPercent:-50, rotation:-14, scale:3, opacity:0}, {scale:1, opacity:.95, duration:.18, ease:'power4.in'}, '+=.2')
      .to(f, {x:3, duration:.04, yoyo:true, repeat:3})
      .to(f, {x:r.w*1.4, rotation:12, opacity:0, duration:.55, ease:'power2.in'}, '+=.8'); }); }
  const L = over(r, '', `${[0, 1, 2].map(i=> `<div class="fxg-bar2" style="position:absolute; left:8%; height:${Math.round(r.h*.07)}px; top:${62 + i*10}%; width:${[84, 70, 78][i]}%; background:#111; border-radius:2px;"></div>`).join('')}
    <div class="fxg-stamp" style="font-size:${Math.round(r.w*.12)}px">CLASSIFIED</div>`);
  const bars = L.querySelectorAll('.fxg-bar2'), st = L.querySelector('.fxg-stamp');
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([L], res, ()=> g.set(t, {clearProps:'transform'}))})
    .fromTo(bars, {scaleX:0, transformOrigin:'0 50%'}, {scaleX:1, duration:.22, stagger:.12, ease:'power2.out'})
    .fromTo(st, {xPercent:-50, yPercent:-50, rotation:-16, scale:3.2, opacity:0}, {scale:1, opacity:1, duration:.2, ease:'power4.in'}, '+=.15')
    .to(t, {x:3, y:2, duration:.04, yoyo:true, repeat:3}, '>')
    .add(()=>{ for(let i = 0; i < 7; i++){ const d = dot(L, `width:${rnd(2, 5)}px; height:${rnd(2, 5)}px; border-radius:50%; background:#c4221b;`); g.set(d, {x:r.w/2 + rnd(-r.w*.5, r.w*.5), y:r.h/2 + rnd(-r.h*.25, r.h*.25), scale:0}); g.to(d, {scale:1, duration:.1}); } }, '<')
    .to(L, {opacity:0, duration:.5}, '+=1'); }); };
M.stainedGlass = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const C = 3, Rw = 4, pts = []; for(let y = 0; y <= Rw; y++){ pts.push([]); for(let x = 0; x <= C; x++){ const edge = x === 0 || y === 0 || x === C || y === Rw; pts[y].push([x/C*100 + (edge ? 0 : rnd(-9, 9)), y/Rw*100 + (edge ? 0 : rnd(-7, 7))]); } }
  const cols = ['#d23b3b', '#2f6fd1', '#e6b420', '#2f9a5a', '#8a3fc4', '#e07a2a', '#28a7b8'], polys = [];
  for(let y = 0; y < Rw; y++) for(let x = 0; x < C; x++){ const a = pts[y][x], b = pts[y][x + 1], c = pts[y + 1][x + 1], d = pts[y + 1][x];
    const tri = (x + y) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]; tri.forEach(p=> polys.push(p)); }
  const L = over(r, '', `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible">${polys.map((p, i)=>
    `<polygon points="${p.map(q=> q.map(v=> v.toFixed(1)).join(',')).join(' ')}" fill="${cols[i % cols.length]}" fill-opacity=".55" stroke="#1d1712" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
    <div class="fxg-glow" style="position:absolute; inset:-30%; background:radial-gradient(circle, rgba(255,250,220,.7), transparent 60%); mix-blend-mode:screen; opacity:0;"></div>`);
  const ps = [...L.querySelectorAll('polygon')];
  const slot = (t.closest && t.closest('.board-card')) || t;
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([L], res, ()=> g.set(slot, {clearProps:'opacity'}))});
    tl.from(ps, {opacity:0, duration:.25, stagger:{each:.025, from:'center'}})
      .to(L.querySelector('.fxg-glow'), {opacity:1, duration:.4, yoyo:true, repeat:1}, '>-.1')
      .set(slot, {opacity:0}, '+=.1')
      .add(()=> ps.forEach(p=>{ const bb = p.getBBox(), dx = (bb.x + bb.width/2 - 50), dy = (bb.y + bb.height/2 - 50);
        g.to(p, {x:dx*rnd(.4, .9), y:dy*.5 + rnd(60, 130), rotation:rnd(-160, 160), opacity:0, svgOrigin:`${bb.x + bb.width/2} ${bb.y + bb.height/2}`, duration:rnd(.8, 1.2), ease:'power2.in'}); }))
      .to(slot, {opacity:1, duration:.5}, '+=1.1'); }); };
M.origamiCrane = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const S = sky(), crane = dot(S, `width:${r.w*.8}px; height:${r.w*.6}px; margin:${-r.w*.3}px 0 0 ${-r.w*.4}px;`);
  crane.innerHTML = `<svg viewBox="0 0 100 70" width="100%" height="100%" style="overflow:visible"><polygon points="50,40 8,6 40,44" fill="#fff8e6" stroke="#cdbb92" stroke-width="1" class="w1"/><polygon points="50,40 92,6 60,44" fill="#f3e8cc" stroke="#cdbb92" stroke-width="1" class="w2"/>
    <polygon points="30,44 50,40 70,44 50,58" fill="#efe2c2" stroke="#cdbb92" stroke-width="1"/><polygon points="70,44 92,30 96,22 86,32 66,48" fill="#fff8e6" stroke="#cdbb92" stroke-width="1"/><polygon points="30,44 10,36 4,40 28,50" fill="#efe2c2" stroke="#cdbb92" stroke-width="1"/></svg>`;
  g.set(crane, {x:r.cx, y:r.cy, opacity:0, scale:.5});
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([S], res, ()=> g.set(t, {clearProps:'transform,opacity'}))})
    .to(t, {rotationX:80, scaleY:.5, transformPerspective:500, duration:.3, ease:'power2.in'})
    .to(t, {rotationY:80, scaleX:.4, duration:.3, ease:'power2.in'})
    .to(t, {opacity:0, duration:.1})
    .to(crane, {opacity:1, scale:1, duration:.25, ease:'back.out(2)'}, '<')
    .to(crane.querySelectorAll('.w1, .w2'), {scaleY:.3, svgOrigin:'50 40', duration:.18, yoyo:true, repeat:7, ease:'sine.inOut'}, '>')
    .to(crane, {x:r.cx + r.w*1.6, y:r.cy - r.h*1.4, rotation:-12, scale:.6, duration:1.4, ease:'power1.in'}, '<')
    .to(crane, {opacity:0, duration:.3}, '-=.3')
    .set(t, {rotationX:-80, rotationY:0, scaleX:1, scaleY:.5, opacity:1})
    .to(t, {rotationX:0, scaleY:1, duration:.45, ease:'back.out(2)'}); }); };
M.slotReveal = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const SYM = ['🍒', '🔔', '🍀', '💎', '🌰', '⭐'], hh = Math.round(r.h*.26), win = o.win || '⭐';
  const reel = i=>{ const list = []; for(let k = 0; k < 14; k++) list.push(SYM[(k + i*2) % SYM.length]); list.push(win); return list; };
  const L = over({x:r.x + r.w*.06, y:r.cy - hh/2, w:r.w*.88, h:hh}, '', `<div style="position:absolute; inset:-5px; border-radius:8px; background:linear-gradient(#ffd56e, #b8741a); box-shadow:0 4px 10px rgba(0,0,0,.5);"></div>
    <div style="position:absolute; inset:0; display:flex; gap:3px; border-radius:5px; overflow:hidden;">${[0, 1, 2].map(i=> `<div style="flex:1; background:linear-gradient(#fffaf0, #e8dcc0 50%, #fffaf0); overflow:hidden; position:relative;"><div class="fxg-strip" style="position:absolute; left:0; right:0; top:0; text-align:center; font-size:${Math.round(hh*.62)}px; line-height:${hh}px;">${reel(i).map(s=> `<div style="height:${hh}px">${s}</div>`).join('')}</div></div>`).join('')}</div>
    <div class="fxg-jack" style="position:absolute; left:50%; top:-60%; transform:translateX(-50%); font:900 ${Math.round(r.w*.16)}px 'Lilita One', sans-serif; color:#ffe27a; text-shadow:0 2px 0 #8a4a00, 0 0 12px #ffb04a; white-space:nowrap; opacity:0;">JACKPOT!</div>`);
  const strips = [...L.querySelectorAll('.fxg-strip')];
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([L], res)});
    tl.from(L, {scaleY:0, duration:.2, ease:'back.out(2)'});
    strips.forEach((s, i)=> tl.fromTo(s, {y:0}, {y:-hh*14, duration:.9 + i*.35, ease:'back.out(.6)', onComplete:()=>{ try{ root.SoundKit && root.SoundKit.tick && root.SoundKit.tick(); }catch(e){} }}, .1));
    tl.to(L.querySelector('.fxg-jack'), {opacity:1, y:-6, scale:1.15, duration:.3, ease:'back.out(3)'}, '>')
      .add(()=>{ const S = sky(); later(()=> S.remove(), 1400); for(let i = 0; i < 14; i++){ const c = document.createElement('div'); c.className = 'fxg-coin'; S.appendChild(c); g.set(c, {x:r.cx, y:r.cy}); const a = rnd(-2.6, -.5); g.to(c, {x:r.cx + Math.cos(a)*rnd(40, 90), y:r.cy + Math.sin(a)*rnd(40, 90), duration:.4, ease:'power2.out'}); g.to(c, {y:'+=' + rnd(60, 110), opacity:0, duration:.6, delay:.4, ease:'power1.in', onComplete:()=> c.remove()}); g.to(c, {scaleX:-1, duration:.12, repeat:7, yoyo:true}); } }, '<')
      .to(L, {opacity:0, duration:.4}, '+=1'); }); };
M.pixelBeam = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const cv = document.createElement('canvas'), dpr = Math.min(2, root.devicePixelRatio || 1), P = 7, nx = Math.ceil(r.w/P), ny = Math.ceil(r.h/P);
  const L = over(r, ''); L.appendChild(cv); cv.width = r.w*dpr; cv.height = (r.h + 160)*dpr; cv.style.cssText = `position:absolute; left:0; top:-160px; width:${r.w}px; height:${r.h + 160}px;`;
  const cx = cv.getContext('2d'); cx.scale(dpr, dpr);
  const ra = getComputedStyle(t).getPropertyValue('--rarity-a').trim() || '#6cbf4a';
  const cells = []; for(let y = 0; y < ny; y++) for(let x = 0; x < nx; x++) cells.push({x, y, d:Math.random(), c:pick([ra, '#e9dcb8', '#5a7a3a', '#3a2b1e', '#9fd86a', ra])});
  const beam = dot(L, `left:${r.w*.1}px; top:${-170}px; width:${r.w*.8}px; height:${r.h + 170}px; background:linear-gradient(90deg, transparent, rgba(140,255,230,.35), transparent); mix-blend-mode:screen; opacity:0;`);
  const p = {t:0}, draw = ()=>{ cx.clearRect(0, 0, r.w, r.h + 160); const tt = p.t;
    cells.forEach(c=>{ const k = Math.max(0, Math.min(1, (tt - c.d*.5)*2)); if(k <= 0 || k >= 1 && tt > 1.4) return;
      const up = tt < 1 ? 0 : Math.max(0, (tt - 1 - c.d*.3)/.5); const y = 160 + c.y*P - up*up*(160 + c.y*P), a = tt < 1 ? k : 1 - up;
      if(a <= 0) return; cx.globalAlpha = Math.min(1, a); cx.fillStyle = c.c; cx.fillRect(c.x*P, y, P - 1, P - 1); }); };
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([L], res, ()=> g.set(t, {clearProps:'opacity'}))})
    .to(beam, {opacity:1, duration:.3})
    .to(p, {t:1, duration:.7, ease:'none', onUpdate:draw})
    .set(t, {opacity:0})
    .to(p, {t:2, duration:.9, ease:'power1.in', onUpdate:draw})
    .to(p, {t:1, duration:.8, ease:'power1.out', onUpdate:draw}, '+=.3')
    .set(t, {opacity:1})
    .to(p, {t:0, duration:.5, ease:'none', onUpdate:draw})
    .to(beam, {opacity:0, duration:.3}); }); };
M.hologram = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const L = over({x:r.x - r.w*.25, y:r.y - 10, w:r.w*1.5, h:r.h + 40}, '', `<div class="fxg-cone" style="position:absolute; left:10%; right:10%; top:6%; bottom:6%; background:linear-gradient(0deg, rgba(110,230,255,.45), rgba(110,230,255,0)); clip-path:polygon(38% 100%, 62% 100%, 100% 0, 0 0); mix-blend-mode:screen;"></div>
    <div class="fxg-disc" style="position:absolute; left:25%; right:25%; bottom:0; height:14px; border-radius:50%; background:radial-gradient(closest-side, #e8fdff, #4fd8ff 60%, transparent); box-shadow:0 0 20px #4fd8ff;"></div>
    <div class="fxg-scan" style="position:absolute; left:${r.w*.25}px; top:10px; width:${r.w}px; height:${r.h}px; border-radius:8px; background:repeating-linear-gradient(0deg, rgba(120,240,255,.22) 0 2px, transparent 2px 4px); mix-blend-mode:screen;"></div>`);
  const scan = L.querySelector('.fxg-scan');
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([L], res, ()=> g.set(t, {clearProps:'filter,transform,opacity'}))})
    .from(L.querySelector('.fxg-disc'), {scaleX:0, duration:.3, ease:'back.out(2)'})
    .from(L.querySelector('.fxg-cone'), {scaleY:0, transformOrigin:'50% 100%', duration:.35, ease:'power2.out'})
    .to(t, {filter:'hue-rotate(160deg) saturate(1.6) brightness(1.25)', opacity:.82, duration:.25}, '<')
    .fromTo(scan, {backgroundPositionY:'0px'}, {backgroundPositionY:'40px', duration:1.8, ease:'none'}, '<')
    .to(t, {x:4, skewX:8, duration:.05, yoyo:true, repeat:3, ease:'steps(1)'}, '+=.4')
    .to(t, {opacity:.5, duration:.06, yoyo:true, repeat:5}, '+=.3')
    .to(L, {opacity:0, duration:.35}, '+=.3').to(t, {filter:'none', opacity:1, duration:.35}, '<'); }); };
M.snowGlobe = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const D = Math.max(r.w, r.h)*1.18, L = over({x:r.cx - D/2, y:r.cy - D/2 - 6, w:D, h:D + D*.22}, '', `<div class="fxg-dome" style="position:absolute; left:0; top:0; width:${D}px; height:${D}px; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 34% 28%, rgba(255,255,255,.55) 0 7%, rgba(255,255,255,.08) 18%, rgba(190,225,255,.10) 55%, rgba(220,240,255,.35) 100%); box-shadow:inset 0 0 0 2px rgba(255,255,255,.55), inset -8px -10px 24px rgba(120,170,220,.25);"></div>
    <div style="position:absolute; left:${D*.12}px; width:${D*.76}px; top:${D*.9}px; height:${D*.24}px; border-radius:6px 6px 12px 12px; background:linear-gradient(#8a5a2a, #4f2f12); box-shadow:inset 0 3px 0 #b07a3e, 0 6px 12px rgba(0,0,0,.45);"></div>`);
  const dome = L.querySelector('.fxg-dome'), flakes = [];
  for(let i = 0; i < 30; i++){ const f = document.createElement('div'); f.style.cssText = `position:absolute; left:0; top:0; width:${rnd(2, 5)}px; height:${rnd(2, 5)}px; border-radius:50%; background:#fff; box-shadow:0 0 3px #fff;`; dome.appendChild(f);
    g.set(f, {x:rnd(.2, .8)*D, y:D*rnd(.78, .9)}); flakes.push(f); }
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([L], res)});
    tl.from(L, {y:-r.h, opacity:0, duration:.45, ease:'bounce.out'})
      .to(L, {rotation:9, duration:.09, yoyo:true, repeat:5, ease:'sine.inOut', transformOrigin:'50% 100%'}, '+=.1')
      .add(()=> flakes.forEach(f=>{ const ang = rnd(0, 6.28), rad = rnd(.08, .4)*D; g.to(f, {x:D/2 + Math.cos(ang)*rad, y:D*.45 + Math.sin(ang)*rad*.8, duration:.5, ease:'power2.out'}); g.to(f, {y:D*rnd(.72, .9), x:'+=' + rnd(-20, 20), duration:rnd(1.8, 2.6), delay:.5, ease:'sine.in'}); }), '<')
      .to(L, {y:-r.h*.8, opacity:0, duration:.5, ease:'power2.in'}, '+=2.4'); }); };
M.cometArrival = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const S = sky(), dx = -Math.min(innerWidth*.45, 360), dy = -Math.min(innerHeight*.4, 260), ang = Math.atan2(-dy, -dx)*57.3, len = Math.hypot(dx, dy);
  const tail = dot(S, `width:${len}px; height:${r.h*.5}px; margin-top:${-r.h*.25}px; transform-origin:100% 50%; background:linear-gradient(90deg, transparent, rgba(160,200,255,.25) 40%, rgba(255,250,220,.85)); border-radius:50%; filter:blur(3px);`);
  g.set(tail, {x:r.cx - len + dx, y:r.cy + dy, rotation:ang, scaleX:.2, transformOrigin:'100% 50%', opacity:0});
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=> fin([S], res, ()=> g.set(t, {clearProps:'transform,filter'}))});
    tl.fromTo(t, {x:dx, y:dy, scale:.4, rotation:-25, filter:'brightness(2.4)'}, {x:0, y:0, scale:1, rotation:0, duration:.6, ease:'power3.in'})
      .to(tail, {opacity:1, scaleX:1, duration:.25}, 0).to(tail, {x:r.cx - len, y:r.cy, duration:.6, ease:'power3.in'}, 0).to(tail, {opacity:0, scaleX:.3, duration:.35}, .6)
      .to(t, {scaleY:.85, scaleX:1.12, duration:.08, yoyo:true, repeat:1}, .6).to(t, {filter:'brightness(1)', duration:.6}, .6)
      .add(()=>{ for(let i = 0; i < 18; i++){ const a = i/18*6.28, s = dot(S, 'width:9px; height:9px; margin:-4.5px; background:#fff6c8; clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%); filter:drop-shadow(0 0 3px #ffd56e);');
        g.set(s, {x:r.cx, y:r.y + r.h}); g.to(s, {x:r.cx + Math.cos(a)*rnd(40, 80), y:r.y + r.h + Math.sin(a)*rnd(14, 30), rotation:180, opacity:0, duration:.7, ease:'power2.out', onComplete:()=> s.remove()}); } }, .6)
      .to({}, {duration:.8}); }); };
M.gildedFrame = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const pad = Math.round(r.w*.12), corner = `<svg viewBox="0 0 40 40" width="${pad*2.2}" height="${pad*2.2}"><path d="M4 36 L4 12 Q4 4 12 4 L36 4" stroke="#ffd56e" stroke-width="3" fill="none"/><path d="M10 30 Q 10 10 30 10 Q 22 16 20 24 Q 16 20 10 30 Z" fill="#e2a93a" stroke="#7a4a0a" stroke-width="1"/><circle cx="8" cy="8" r="3.4" fill="#fff1b0"/></svg>`;
  const L = over(r, '', `<div class="fxg-fr" style="position:absolute; inset:${-pad}px; border:${Math.max(5, pad*.55)}px solid transparent; border-radius:6px; background:linear-gradient(135deg, #fff1b0, #d99a2a 30%, #fff1b0 50%, #b8741a 75%, #ffe28a) border-box; -webkit-mask:linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0); mask:linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0); box-shadow:0 6px 18px rgba(0,0,0,.45);"></div>
    ${[0, 1, 2, 3].map(i=> `<div class="fxg-cn" style="position:absolute; ${i % 2 ? 'right' : 'left'}:${-pad*1.25}px; ${i > 1 ? 'bottom' : 'top'}:${-pad*1.25}px; transform:scale(${i % 2 ? -1 : 1}, ${i > 1 ? -1 : 1});">${corner}</div>`).join('')}
    <div class="fxg-plq" style="position:absolute; left:50%; top:calc(100% + ${pad*1.4}px); transform:translateX(-50%); padding:3px 10px; border-radius:4px; background:linear-gradient(#ffe9a0, #c98a2a); color:#4a2a06; font:800 ${Math.max(10, Math.round(r.w*.1))}px 'Baloo 2', sans-serif; white-space:nowrap; box-shadow:0 3px 6px rgba(0,0,0,.4);">✦ Masterpiece ✦</div>
    <div class="fxg-spot" style="position:absolute; left:-40%; right:-40%; top:-120%; bottom:-10%; background:conic-gradient(from 160deg at 50% 0, transparent 0deg, rgba(255,245,210,.35) 14deg, rgba(255,245,210,.35) 26deg, transparent 40deg); mix-blend-mode:screen; filter:blur(3px);"></div>`);
  const q = s=> L.querySelector(s);
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([L], res)})
    .from(q('.fxg-spot'), {opacity:0, duration:.4})
    .from(q('.fxg-fr'), {scale:1.25, opacity:0, duration:.45, ease:'back.out(2)'}, .1)
    .from(L.querySelectorAll('.fxg-cn'), {scale:0, rotation:-90, duration:.4, stagger:.08, ease:'back.out(3)'}, .35)
    .from(q('.fxg-plq'), {y:-30, opacity:0, duration:.5, ease:'bounce.out'}, .7)
    .fromTo(q('.fxg-fr'), {filter:'brightness(1)'}, {filter:'brightness(1.6)', duration:.25, yoyo:true, repeat:1}, 1.2)
    .to(L, {opacity:0, duration:.5}, '+=1.1'); }); };

// ---- board ----
M.rainbowBridge = function(a, b, o){ o = o || {}; const g = G(); if(!g || !a || !b) return Promise.resolve();
  const A = RECT(a), B = RECT(b), S = sky(), x1 = A.cx, y1 = A.y + A.h*.3, x2 = B.cx, y2 = B.y + B.h*.3, top = Math.min(y1, y2) - Math.max(80, Math.abs(x2 - x1)*.45);
  const d = `M${x1} ${y1} Q ${(x1 + x2)/2} ${top} ${x2} ${y2}`, cols = ['#ff5a5a', '#ffa33a', '#ffe24a', '#5adf6a', '#4aa8ff', '#8a5aff'];
  S.innerHTML = `<svg width="100%" height="100%" style="position:absolute; inset:0; overflow:visible">${cols.map((c, i)=> `<path d="${d}" transform="translate(0 ${(i - 2.5)*5})" stroke="${c}" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-opacity=".85"/>`).join('')}<path class="fxg-rb-guide" d="${d}" fill="none" stroke="none"/></svg>`;
  const paths = [...S.querySelectorAll('path')].slice(0, 6), guide = S.querySelector('.fxg-rb-guide'); let len = 600; try{ len = guide.getTotalLength(); }catch(e){}
  paths.forEach(p=>{ p.style.strokeDasharray = len + 40; p.style.strokeDashoffset = len + 40; });
  const puff = (x, y)=>{ for(let i = 0; i < 6; i++){ const c = dot(S, `width:${rnd(16, 26)}px; height:${rnd(14, 22)}px; margin:-10px 0 0 -12px; border-radius:50%; background:#fff; box-shadow:0 0 8px rgba(255,255,255,.8);`);
    g.fromTo(c, {x:x + rnd(-20, 20), y:y + rnd(-6, 8), scale:0}, {scale:1, duration:.35, ease:'back.out(2)'}); g.to(c, {opacity:0, y:'-=10', duration:.6, delay:2}); } };
  const star = dot(S, 'width:16px; height:16px; margin:-8px; background:#fff; clip-path:polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); filter:drop-shadow(0 0 6px #fff7b0); opacity:0;');
  return new Promise(res=>{ const p = {t:0}; g.timeline({onComplete:()=> fin([S], res)})
    .add(()=> puff(x1, y1))
    .to(paths, {strokeDashoffset:0, duration:.9, stagger:.05, ease:'power2.inOut'}, .1)
    .add(()=> puff(x2, y2), .9)
    .set(star, {opacity:1}, 1)
    .to(p, {t:1, duration:.9, ease:'sine.inOut', onUpdate:()=>{ try{ const pt = guide.getPointAtLength(p.t*len); g.set(star, {x:pt.x, y:pt.y - 18, rotation:p.t*360}); }catch(e){} }}, 1)
    .to(star, {scale:2, opacity:0, duration:.3}, '>')
    .to(paths, {opacity:0, duration:.6}, '+=.5'); }); };
M.magicCircle = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const D = r.w*1.9, col = o.color || '#9fe8ff', id = 'fxgMc' + Math.floor(rnd(1, 1e9)), runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  const L = over({x:r.cx - D/2, y:r.y + r.h - D*.32, w:D, h:D*.64}, '', `<svg viewBox="-100 -100 200 200" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible; filter:drop-shadow(0 0 4px ${col});">
    <defs><path id="${id}" d="M -78 0 A 78 78 0 1 1 78 0 A 78 78 0 1 1 -78 0"/></defs><g class="fxg-mc-rot">
    <circle r="92" fill="none" stroke="${col}" stroke-width="3"/><circle r="66" fill="none" stroke="${col}" stroke-width="2"/>
    <text font-size="15" fill="${col}" font-family="serif"><textPath href="#${id}">${runes}${runes.slice(0, 6)}</textPath></text>
    <polygon points="0,-66 57,33 -57,33" fill="none" stroke="${col}" stroke-width="2"/><polygon points="0,66 57,-33 -57,-33" fill="none" stroke="${col}" stroke-width="2"/><circle r="12" fill="${col}" fill-opacity=".5"/></g></svg>
    <div class="fxg-pillar" style="position:absolute; left:30%; right:30%; bottom:45%; height:${r.h*2.4}px; background:linear-gradient(0deg, ${hexA(col, .85)}, ${hexA(col, .25)} 60%, transparent); border-radius:40% 40% 0 0; mix-blend-mode:screen; filter:blur(2px); transform-origin:50% 100%;"></div>`);
  const svgEls = [...L.querySelectorAll('circle, polygon')], rot = L.querySelector('.fxg-mc-rot');
  svgEls.forEach(e=>{ let len = 600; try{ len = e.getTotalLength(); }catch(_){} e.style.strokeDasharray = len; e.style.strokeDashoffset = len; });
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([L], res, ()=> g.set(t, {clearProps:'transform,filter'}))})
    .to(svgEls, {strokeDashoffset:0, duration:.6, stagger:.08, ease:'power2.out'})
    .from(L.querySelector('text'), {opacity:0, duration:.4}, .3)
    .to(rot, {rotation:180, svgOrigin:'0 0', duration:2.6, ease:'power1.inOut'}, 0)
    .fromTo(L.querySelector('.fxg-pillar'), {scaleY:0, opacity:0}, {scaleY:1, opacity:1, duration:.35, ease:'power3.out'}, .9)
    .to(t, {y:-10, filter:`drop-shadow(0 0 10px ${col}) brightness(1.25)`, duration:.4, ease:'power2.out'}, .95)
    .add(()=>{ for(let i = 0; i < 14; i++){ const s = layer('', ''); s.style.cssText += `width:4px; height:4px; border-radius:50%; background:#fff; box-shadow:0 0 6px ${col};`; g.set(s, {x:r.x + rnd(0, r.w), y:r.y + r.h}); g.to(s, {y:'-=' + rnd(60, 130), opacity:0, duration:rnd(.8, 1.3), ease:'power1.out', onComplete:()=> s.remove()}); } }, 1)
    .to(L.querySelector('.fxg-pillar'), {opacity:0, duration:.6}, 1.8)
    .to(t, {y:0, filter:'none', duration:.5}, 2)
    .to(L, {opacity:0, duration:.5}, 2.2); }); };
M.bioTide = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-bio', o.z || 50);
  const tint = part(L, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(0deg, rgba(10,40,70,.45), rgba(10,30,60,.15)); opacity:0;');
  const wave = part(L, `left:-10%; width:120%; height:${L.H*.32}px; top:0; border-radius:50% 50% 0 0 / 30% 30% 0 0; background:linear-gradient(0deg, rgba(60,255,220,0), rgba(80,255,230,.55) 70%, rgba(220,255,250,.95)); filter:blur(4px); mix-blend-mode:screen;`);
  const specks = []; for(let i = 0; i < 36; i++){ const c = pick(['#5effe0', '#7fd6ff', '#b0ffea']), d = part(L, `width:${rnd(2, 5)}px; height:${rnd(2, 5)}px; border-radius:50%; background:${c}; box-shadow:0 0 8px 2px ${c}; opacity:0;`); g.set(d, {x:rnd(0, L.W), y:rnd(.05, .95)*L.H}); specks.push(d); }
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=>{ done(L); res(); }});
    tl.to(tint, {opacity:1, duration:.5})
      .fromTo(wave, {y:L.H}, {y:-L.H*.4, duration:1.8, ease:'power1.inOut'}, .2);
    specks.forEach(s=>{ const yy = g.getProperty(s, 'y'), at = .2 + 1.8*(1 - (yy + L.H*.3)/(L.H*1.4)); tl.to(s, {opacity:1, scale:1.6, duration:.25}, Math.max(.2, at)).to(s, {opacity:.25, scale:1, duration:.6, yoyo:true, repeat:1}, '>'); });
    tl.to([tint, ...specks], {opacity:0, duration:.7}, 3.1); }); };
M.thunderStrike = function(el, o){ o = o || {}; const g = G(), t = tileOf(el), r = RECT(t); if(!g) return Promise.resolve();
  const S = sky(), dark = dot(S, 'left:0; top:0; width:100%; height:100%; background:rgba(10,12,30,.45); opacity:0;');
  const bolt = (x0, y0, x1, y1, n)=>{ let pts = `${x0},${y0}`; for(let i = 1; i < n; i++){ const k = i/n; pts += ` ${(x0 + (x1 - x0)*k + rnd(-22, 22)).toFixed(0)},${(y0 + (y1 - y0)*k).toFixed(0)}`; } return pts + ` ${x1},${y1}`; };
  const mk = (w, a)=>{ const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('width', '100%'); s.setAttribute('height', '100%'); s.style.cssText = 'position:absolute; inset:0; overflow:visible; opacity:0;';
    s.innerHTML = `<polyline points="${bolt(r.cx + rnd(-60, 60), -10, r.cx, r.y + r.h*.3, 9)}" fill="none" stroke="#bfe6ff" stroke-width="${w*2.6}" stroke-opacity=".35" stroke-linejoin="round"/><polyline points="${bolt(r.cx + rnd(-60, 60), -10, r.cx, r.y + r.h*.3, 9)}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linejoin="round"/>`; S.appendChild(s); return s; };
  const b1 = mk(4), b2 = mk(2.4), flash = dot(S, 'left:0; top:0; width:100%; height:100%; background:#eaf4ff; opacity:0;');
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([S], res, ()=> g.set(t, {clearProps:'transform,filter'}))})
    .to(dark, {opacity:1, duration:.4})
    .set(b1, {opacity:1}, '+=.1').to(flash, {opacity:.55, duration:.04, yoyo:true, repeat:1}, '<')
    .to(t, {x:4, duration:.04, yoyo:true, repeat:5, filter:'brightness(1.8) drop-shadow(0 0 10px #8fd0ff)'}, '<')
    .add(()=>{ for(let i = 0; i < 10; i++){ const s = dot(S, 'width:2px; height:10px; background:#dff4ff; box-shadow:0 0 6px #8fd0ff;'); const a = rnd(0, 6.28);
      g.set(s, {x:r.cx, y:r.y + r.h*.3, rotation:a*57.3 + 90}); g.to(s, {x:r.cx + Math.cos(a)*rnd(30, 60), y:r.y + r.h*.3 + Math.sin(a)*rnd(30, 60), opacity:0, duration:.35, onComplete:()=> s.remove()}); } }, '<')
    .set(b1, {opacity:0}, '+=.12').set(b2, {opacity:1}, '+=.08').to(flash, {opacity:.3, duration:.04, yoyo:true, repeat:1}, '<').set(b2, {opacity:0}, '+=.1')
    .to(t, {filter:'brightness(1) drop-shadow(0 0 0 transparent)', duration:.6}, '+=.1')
    .to(dark, {opacity:0, duration:.5}, '<'); }); };
M.portalSwap = function(a, b, o){ o = o || {}; const g = G(); if(!g || !a || !b) return Promise.resolve(); const slotOf = e=> (e.closest && e.closest('.board-card')) || tileOf(e), ta = slotOf(a), tb = slotOf(b), A = RECT(tileOf(a)), B = RECT(tileOf(b)), S = sky();
  // an ellipse on the ground; the swirl turns inside it (rotating the ellipse itself would wobble)
  const portal = (R, c)=>{ const p = dot(S, `width:${R.w*1.2}px; height:${R.w*.42}px; margin:${-R.w*.21}px 0 0 ${-R.w*.6}px; border-radius:50%; overflow:hidden; box-shadow:0 0 18px ${c}, inset 0 0 14px #000; opacity:0;`,
      `<div class="fxg-swirl" style="position:absolute; left:0; top:50%; width:100%; aspect-ratio:1; margin-top:-50%; border-radius:50%; background:conic-gradient(from 0deg, ${c}, #1a0a3a, ${c}, #2a1060, ${c}, #1a0a3a, ${c});"></div>`);
    g.set(p, {x:R.cx, y:R.y + R.h*.85}); return p; };
  const pa = portal(A, '#b06bff'), pb = portal(B, '#4fd8ff'), dx = B.cx - A.cx, dy = B.cy - A.cy;
  const dive = (t)=> ({scale:.1, rotation:360, y:'+=' + 30, opacity:0, duration:.45, ease:'power2.in'});
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([S], res, ()=> g.set([ta, tb], {clearProps:'transform,opacity,zIndex'}))})
    .to([pa, pb], {opacity:1, scale:1.1, duration:.3, ease:'back.out(2)'})
    .to([pa, pb].map(p=> p.firstChild), {rotation:'+=720', duration:2.6, ease:'none'}, 0)
    .to(ta, dive(ta), .3).to(tb, dive(tb), .3)
    .set(ta, {x:dx, y:dy + 30, rotation:0, zIndex:20}).set(tb, {x:-dx, y:-dy + 30, rotation:0, zIndex:20})
    .to(ta, {scale:1, y:dy, opacity:1, rotation:-360, duration:.45, ease:'back.out(2)'}).to(tb, {scale:1, y:-dy, opacity:1, rotation:-360, duration:.45, ease:'back.out(2)'}, '<')
    .to([ta, tb], {scale:.1, opacity:0, rotation:'+=360', duration:.4, ease:'power2.in'}, '+=.5')
    .set([ta, tb], {x:0, y:0, rotation:0})
    .to([ta, tb], {scale:1, opacity:1, duration:.4, ease:'back.out(2)'})
    .to([pa, pb], {scale:0, opacity:0, duration:.3}, '-=.1'); }); };
M.confettiCannons = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-confetti', o.z || 70);
  const cannon = side=> part(L, `left:${side < 0 ? 4 : L.W - 46}px; top:${L.H - 34}px; width:42px; height:22px; border-radius:6px 11px 11px 6px; background:linear-gradient(#5a5a66, #2a2a33); box-shadow:inset 0 2px 0 #8a8a99, 0 3px 6px rgba(0,0,0,.5); transform-origin:${side < 0 ? '20%' : '80%'} 50%; transform:rotate(${side < 0 ? -50 : 230}deg);`);
  const cl = cannon(-1), cr = cannon(1), cols = ['#ff5a7a', '#ffd24a', '#5ad8ff', '#7aff8a', '#c08aff', '#ff9a3a'];
  const fire = side=>{ const x0 = side < 0 ? 30 : L.W - 30, y0 = L.H - 30;
    for(let i = 0; i < (o.n || 20); i++){ const c = part(L, '', ''); c.className = 'fxg-p fxg-conf'; c.style.background = pick(cols); if(i % 4 === 0) c.style.borderRadius = '50%';
      const ang = (side < 0 ? -60 : -120) + rnd(-14, 14), sp = rnd(.75, 1.15)*Math.sqrt(L.H*2*900), vx = Math.cos(ang*Math.PI/180)*sp, vy = Math.sin(ang*Math.PI/180)*sp, p = {t:0}, spin = rnd(-900, 900), flut = rnd(6, 12);
      g.to(p, {t:3.2, duration:3.2, ease:'none', onUpdate:()=>{ const tt = p.t, dr = Math.min(tt, .55);
        const x = x0 + vx*dr + (tt > .55 ? vx*.12*(tt - .55) + Math.sin(tt*flut)*14 : 0), y = y0 + vy*dr + 900*dr*dr + (tt > .55 ? (vy + 1800*.55)*0 + 70*(tt - .55) : 0);
        g.set(c, {x, y, rotation:spin*tt, scaleY:Math.cos(tt*flut*1.6)}); }, onComplete:()=> c.remove()}); } };
  return new Promise(res=>{ g.timeline({onComplete:()=>{ done(L); res(); }})
    .from([cl, cr], {y:40, duration:.3, ease:'back.out(2)'})
    .add(()=>{ fire(-1); g.fromTo(cl, {x:0}, {x:-8, duration:.08, yoyo:true, repeat:1}); try{ root.SoundKit && root.SoundKit.pop && root.SoundKit.pop(); }catch(e){} }, .35)
    .add(()=>{ fire(1); g.fromTo(cr, {x:0}, {x:8, duration:.08, yoyo:true, repeat:1}); }, .5)
    .to([cl, cr], {y:50, opacity:0, duration:.4}, 1.2)
    .to({}, {duration:2.2}); }); };
M.coinFountain = function(fromEl, o){ o = o || {}; const g = G(); if(!g || !fromEl) return Promise.resolve(); const F = RECT(fromEl), T = o.to ? RECT(o.to) : null, S = sky(), n = o.n || 24, ground = F.y + F.h;
  return new Promise(res=>{ let left = n; for(let i = 0; i < n; i++){ const c = document.createElement('div'); c.className = 'fxg-coin'; S.appendChild(c);
    const vx = rnd(-170, 170), vy = rnd(-560, -380), x0 = F.cx, y0 = F.y + F.h*.2, p = {t:0}, apexT = -vy/1100, land = ground - 6 - rnd(0, 12);
    g.set(c, {x:x0, y:y0, scale:0});
    g.to(c, {scale:1, duration:.15, delay:i*.035});
    g.to(c, {scaleX:-1, duration:.1, repeat:-1, yoyo:true, delay:i*.035});
    g.to(p, {t:1.6, duration:1.6, delay:i*.035, ease:'none', onUpdate:()=>{ const tt = p.t; let y = y0 + vy*tt + 550*tt*tt; if(tt > apexT && y > land){ y = land - Math.abs(Math.sin((tt - apexT)*9))*18*Math.max(0, 1.4 - tt); }
      g.set(c, {x:x0 + vx*Math.min(tt, 1)*.9, y}); }, onComplete:()=>{
      const fly = T ? {x:T.cx, y:T.cy, scale:.5, duration:rnd(.4, .6), ease:'power2.in'} : {opacity:0, duration:.3};
      g.to(c, Object.assign(fly, {delay:T ? i*.02 : 0, onComplete:()=>{ c.remove(); if(T && i % 4 === 0) try{ root.SoundKit && root.SoundKit.coin && root.SoundKit.coin(); }catch(e){} if(--left === 0){ if(T){ const t2 = tileOf(o.to); g.fromTo(t2, {scale:1.25}, {scale:1, duration:.4, ease:'back.out(3)', clearProps:'transform'}); } fin([S], res); } }})); }}); } }); };
M.treasureChest = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-chest', o.z || 70), W = Math.min(110, L.W*.28), cx = L.W/2, cy = L.H*.62;
  const rays = part(L, `left:${cx - L.W*.6}px; top:${cy - L.W*.6}px; width:${L.W*1.2}px; height:${L.W*1.2}px; border-radius:50%; background:repeating-conic-gradient(from 0deg, rgba(255,230,140,.38) 0 8deg, transparent 8deg 22deg); -webkit-mask:radial-gradient(closest-side, #000 20%, transparent); mask:radial-gradient(closest-side, #000 20%, transparent); opacity:0;`);
  const box = part(L, `left:${cx - W/2}px; top:${cy - W*.35}px; width:${W}px; height:${W*.6}px; border-radius:4px 4px 8px 8px; background:linear-gradient(90deg, #6b3a12, #9a5a22 20%, #6b3a12 22%, #8a4f1c 50%, #6b3a12 78%, #9a5a22 80%, #6b3a12); box-shadow:inset 0 0 0 3px #ffcf5a, inset 0 -6px 0 #4a2408, 0 10px 18px rgba(0,0,0,.45);`, `<div style="position:absolute; left:50%; top:-6px; width:16px; height:20px; margin-left:-8px; border-radius:3px; background:#ffd56e; box-shadow:inset 0 0 0 2px #8a5a10;"></div>`);
  const lid = part(L, `left:${cx - W/2}px; top:${cy - W*.35 - W*.34}px; width:${W}px; height:${W*.36}px; border-radius:${W*.4}px ${W*.4}px 3px 3px; background:linear-gradient(90deg, #6b3a12, #9a5a22 20%, #6b3a12 22%, #8a4f1c 50%, #6b3a12 78%, #9a5a22 80%, #6b3a12); box-shadow:inset 0 0 0 3px #ffcf5a; transform-origin:50% 100%;`);
  const gems = ['#ff4a6a', '#4ad8ff', '#7aff6a', '#c78aff', '#ffd24a'];
  return new Promise(res=>{ g.timeline({onComplete:()=>{ done(L); res(); }})
    .from([box, lid], {y:-L.H*.7, duration:.55, ease:'bounce.out'})
    .to([box, lid], {rotation:4, duration:.06, yoyo:true, repeat:5, transformOrigin:'50% 100%'}, '+=.15')
    .to(lid, {rotationX:110, transformPerspective:400, y:-6, duration:.3, ease:'back.out(2)'}, '+=.1')
    .to(rays, {opacity:1, duration:.3}, '<').to(rays, {rotation:120, duration:2.6, ease:'none'}, '<')
    .add(()=>{ for(let i = 0; i < 22; i++){ const s = rnd(9, 15), c = pick(gems), d = part(L, `width:${s}px; height:${s}px; margin:${-s/2}px; background:linear-gradient(135deg, #fff, ${c} 45%, ${hexA(c, .6)}); clip-path:polygon(50% 0, 100% 40%, 50% 100%, 0 40%); filter:drop-shadow(0 0 4px ${c});`);
      const vx = rnd(-220, 220), vy = rnd(-520, -330), p = {t:0}; g.to(p, {t:1.3, duration:1.3, ease:'none', onUpdate:()=> g.set(d, {x:cx + vx*p.t, y:cy - W*.3 + vy*p.t + 520*p.t*p.t, rotation:p.t*400}), onComplete:()=> d.remove()}); } }, '<')
    .to([box, lid, rays], {opacity:0, duration:.5}, '+=1.6'); }); };
M.gachaCapsule = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-gacha', o.z || 70), D = Math.min(96, L.W*.25), cx = L.W/2, cy = L.H*.55;
  const col = o.color || '#ff5a8a', top = part(L, `left:${cx - D/2}px; top:${cy - D/2}px; width:${D}px; height:${D/2}px; border-radius:${D/2}px ${D/2}px 0 0; background:radial-gradient(circle at 35% 40%, #fff 0 8%, ${col} 30%, ${hexA(col, .8)}); box-shadow:inset 0 -3px 0 rgba(0,0,0,.2);`);
  const bot = part(L, `left:${cx - D/2}px; top:${cy}px; width:${D}px; height:${D/2}px; border-radius:0 0 ${D/2}px ${D/2}px; background:linear-gradient(#f4f4f8, #c9c9d6); box-shadow:inset 0 3px 0 rgba(0,0,0,.15);`);
  const glow = part(L, `left:${cx - D}px; top:${cy - D}px; width:${D*2}px; height:${D*2}px; border-radius:50%; background:radial-gradient(closest-side, #fff, ${hexA(col, .5)} 40%, transparent); opacity:0;`);
  const stars = part(L, `left:${cx}px; top:${cy}px; transform:translate(-50%,-50%); font:900 ${Math.round(D*.32)}px 'Lilita One', sans-serif; color:#ffe27a; text-shadow:0 2px 0 #8a4a00, 0 0 12px #ffb04a; white-space:nowrap; opacity:0;`, '★★★★');
  return new Promise(res=>{ g.timeline({onComplete:()=>{ done(L); res(); }})
    .from([top, bot], {y:-L.H*.7, duration:.6, ease:'bounce.out'})
    .to([top, bot], {rotation:8, transformOrigin:`50% ${D}px`, duration:.08, yoyo:true, repeat:3}, '+=.2')
    .to([top, bot], {rotation:-14, duration:.07, yoyo:true, repeat:5}, '+=.25')
    .to(glow, {opacity:1, scale:1.2, duration:.2})
    .to(top, {y:-D*.9, x:-D*.4, rotation:-40, opacity:0, duration:.5, ease:'power2.out'}, '<').to(bot, {y:D*.9, x:D*.4, rotation:30, opacity:0, duration:.5, ease:'power2.out'}, '<')
    .fromTo(stars, {opacity:0, scale:2.6}, {opacity:1, scale:1, duration:.4, ease:'back.out(2)'}, '<.1')
    .to(glow, {opacity:0, duration:.8}, '+=.6').to(stars, {opacity:0, y:-20, duration:.5}, '<.3'); }); };

// ---- screen ----
M.meteorShower = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-meteors', o.z || 60), n = o.n || 12;
  const dim = part(L, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(8,10,30,.55), rgba(8,10,30,.2)); opacity:0;');
  g.to(dim, {opacity:1, duration:.6}); g.to(dim, {opacity:0, duration:.8, delay:3.2});
  stream(L, n, 2600, i=>{ const big = i === n - 1, len = big ? L.W*.32 : rnd(.1, .2)*L.W, d = part(L, `width:${len}px; height:${big ? 4 : 2}px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), ${big ? '#ffd9a0' : '#d8e6ff'}); box-shadow:0 0 ${big ? 14 : 6}px ${big ? '#ffb04a' : '#cfe0ff'}; transform-origin:100% 50%;`);
    const x0 = rnd(.3, 1.1)*L.W, y0 = rnd(-.1, .3)*L.H, dist = L.W*rnd(.5, .8); g.set(d, {x:x0 - len, y:y0, rotation:150, opacity:0});
    g.to(d, {opacity:1, duration:.1}); g.to(d, {x:x0 - len - Math.cos(30*Math.PI/180)*dist, y:y0 + Math.sin(30*Math.PI/180)*dist, duration:big ? 1 : rnd(.5, .8), ease:'power1.in', onComplete:()=>{
      if(big){ const f = part(L, 'left:0; top:0; width:100%; height:100%; background:rgba(255,230,190,.35);'); g.to(f, {opacity:0, duration:.4, onComplete:()=> f.remove()}); }
      g.to(d, {opacity:0, duration:.2, onComplete:()=> d.remove()}); }}); });
  if(o.wish){ const w = part(L, `left:50%; top:30%; transform:translate(-50%,-50%); font:700 ${Math.round(Math.min(46, L.W*.08))}px 'Caveat', cursive; color:#fff7d0; text-shadow:0 0 14px #ffd56e; white-space:nowrap; opacity:0;`, esc(o.wish));
    g.to(w, {opacity:1, y:-6, duration:.8, delay:2.2}); g.to(w, {opacity:0, duration:.6, delay:3.4}); }
  return wait(4300).then(()=> done(L)); };
M.seasonalDrift = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-season', o.z || 60), s = o.season || 'spring';
  if(s === 'spring') PARTICLES.petals(L, 30, 3000);
  else if(s === 'summer'){ PARTICLES.fireflies(L, 22, 2400); GRAND.godRays(L, THEMES.savanna, {ms:4200}); }
  else if(s === 'autumn'){ const cols = ['#d9531e', '#e8901f', '#b8321a', '#f2b33a', '#8a3a12'];
    stream(L, 26, 3000, ()=>{ const sz = rnd(12, 18), d = part(L, `width:${sz}px; height:${sz}px; background:${pick(cols)}; clip-path:polygon(50% 0, 60% 26%, 88% 14%, 76% 42%, 100% 50%, 74% 60%, 84% 86%, 56% 72%, 50% 100%, 44% 72%, 16% 86%, 26% 60%, 0 50%, 24% 42%, 12% 14%, 40% 26%);`);
      const x0 = rnd(-.1, 1)*L.W, dur = rnd(3.4, 5); g.set(d, {x:x0, y:-24, rotation:rnd(0, 360)}); g.to(d, {y:L.H + 24, duration:dur, ease:'none', onComplete:()=> d.remove()});
      g.to(d, {x:x0 + rnd(60, 160), rotation:'+=' + rnd(200, 600), duration:dur, ease:'sine.inOut'}); g.to(d, {rotationX:180, duration:rnd(.6, 1), repeat:Math.ceil(dur), yoyo:true}); }); }
  else PARTICLES.frost(L, 34, 3000);
  return wait(o.ms || 5200).then(()=> done(L)); };
M.sandstormWipe = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-sandstorm', o.z || 80);
  const wall = part(L, `left:0; top:0; width:${L.W*1.8}px; height:100%; background:linear-gradient(90deg, rgba(214,170,100,0), rgba(214,170,100,.9) 18%, #c99a58 40%, #b78845 60%, rgba(214,170,100,.9) 82%, rgba(214,170,100,0)),
    repeating-linear-gradient(170deg, rgba(255,230,180,.25) 0 2px, transparent 2px 9px); filter:blur(2px);`);
  g.set(wall, {x:L.W});
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=>{ done(L); res(); }});
    tl.add(()=> PARTICLES.sand(L, 36, 1600), 0)
      .to(wall, {x:-L.W*.4, duration:.9, ease:'power1.in'}, .1)
      .add(()=> o.onCover && call(o.onCover))
      .to(wall, {x:-L.W*1.9, duration:1, ease:'power1.out'}, '+=.25'); }); };
M.bubblePop = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-bubbles', o.z || 80), n = o.n || 18, bs = [];
  for(let i = 0; i < n; i++){ const s = rnd(.22, .42)*Math.max(L.W, L.H), b = part(L, `width:${s}px; height:${s}px; margin:${-s/2}px 0 0 ${-s/2}px;`); b.className = 'fxg-p fxg-bubble'; g.set(b, {x:rnd(0, L.W), y:rnd(0, L.H), scale:0}); bs.push(b); }
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=>{ done(L); res(); }});
    tl.to(bs, {scale:1, duration:.5, stagger:.03, ease:'back.out(1.6)'})
      .to(bs, {scaleX:1.06, scaleY:.95, duration:.25, yoyo:true, repeat:1, stagger:.02}, '>-.2')
      .add(()=> o.onCover && call(o.onCover));
    bs.forEach((b, i)=> tl.add(()=>{ const x = g.getProperty(b, 'x'), y = g.getProperty(b, 'y'), s = b.offsetWidth;
      g.to(b, {scale:1.25, opacity:0, duration:.12, onComplete:()=> b.remove()});
      const ring = part(L, `width:${s}px; height:${s}px; margin:${-s/2}px 0 0 ${-s/2}px; border-radius:50%; border:2px solid rgba(220,250,255,.8);`); g.fromTo(ring, {x, y, scale:1}, {scale:1.4, opacity:0, duration:.3, onComplete:()=> ring.remove()});
      for(let k = 0; k < 5; k++){ const d = part(L, 'width:5px; height:5px; border-radius:50%; background:rgba(220,250,255,.9);'); const a = rnd(0, 6.28); g.set(d, {x:x + Math.cos(a)*s*.45, y:y + Math.sin(a)*s*.45}); g.to(d, {x:'+=' + Math.cos(a)*30, y:'+=' + (Math.sin(a)*30 + 20), opacity:0, duration:.4, onComplete:()=> d.remove()}); }
      if(i % 3 === 0) try{ root.SoundKit && root.SoundKit.pop && root.SoundKit.pop(); }catch(e){} }, 1.25 + i*.07)); }); };
M.lanternFestival = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-lanterns', o.z || 60), n = o.n || 16;
  const dusk = part(L, 'left:0; top:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(20,16,50,.55), rgba(60,30,40,.25)); opacity:0;'); g.to(dusk, {opacity:1, duration:1}); g.to(dusk, {opacity:0, duration:1, delay:4.4});
  stream(L, n, 1800, i=>{ const z = rnd(.45, 1.1), d = part(L, '', ''); d.className = 'fxg-p fxg-lantern'; const x = rnd(.05, .95)*L.W, dur = 4/z*.8;
    g.set(d, {x, y:L.H*(i < n/3 ? rnd(.45, .95) : 1) + 30, scale:z, opacity:z < .7 ? .7 : 1, zIndex:Math.round(z*10)});
    g.to(d, {y:-40, duration:dur, ease:'sine.in', onComplete:()=> d.remove()}); g.to(d, {x:x + rnd(-40, 40), rotation:rnd(-8, 8), duration:dur/3, yoyo:true, repeat:2, ease:'sine.inOut'});
    g.to(d, {filter:'brightness(1.3)', duration:rnd(.2, .4), yoyo:true, repeat:Math.round(dur*2), ease:'steps(2)'}); });
  return wait(6000).then(()=> done(L)); };
M.inkWash = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-inkwash', o.z || 80), R = Math.hypot(L.W, L.H);
  const blots = []; for(let i = 0; i < 7; i++){ const s = R*rnd(.85, 1.3), b = part(L, `width:${s}px; height:${s}px; margin:${-s/2}px 0 0 ${-s/2}px; border-radius:${rnd(40, 60)}% ${rnd(40, 60)}% ${rnd(40, 60)}% ${rnd(40, 60)}%; background:radial-gradient(closest-side, #120f0c 62%, rgba(18,15,12,.7) 80%, rgba(18,15,12,0));`);
    g.set(b, {x:L.W/2 + rnd(-.2, .2)*L.W, y:L.H/2 + rnd(-.2, .2)*L.H, scale:0}); blots.push(b); }
  const drop = part(L, `width:18px; height:24px; margin:-12px 0 0 -9px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:#120f0c;`); g.set(drop, {x:L.W/2, y:-30});
  const sweep = part(L, `left:0; top:0; width:${L.W*1.6}px; height:100%; background:linear-gradient(100deg, rgba(243,234,210,0), #f3ead2 22%, #f3ead2 70%, rgba(243,234,210,0)); opacity:0;`);
  return new Promise(res=>{ g.timeline({onComplete:()=>{ done(L); res(); }})
    .to(drop, {y:L.H/2, duration:.45, ease:'power2.in'})
    .set(drop, {opacity:0})
    .to(blots, {scale:1, rotation:()=> rnd(-30, 30), duration:.9, stagger:.06, ease:'power2.out'}, '<')
    .add(()=> o.onCover && call(o.onCover))
    .set(sweep, {x:-L.W*1.6, opacity:1}, '+=.2')
    .to(sweep, {x:-L.W*.3, duration:.45, ease:'power2.in'})
    .set(blots, {opacity:0})
    .to(sweep, {x:L.W, duration:.55, ease:'power2.out'}); }); };
M.fireflyWord = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-ffword', o.z || 70), word = String(o.text || 'Victory'), n = o.n || 40;
  // sample n points on the word's strokes from an offscreen canvas
  const cw = 600, ch = 160, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const cx = cv.getContext('2d');
  cx.fillStyle = '#000'; cx.font = "700 120px Caveat, 'Baloo 2', cursive"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(word, cw/2, ch/2 + 6);
  let pts = []; try{ const data = cx.getImageData(0, 0, cw, ch).data; for(let y = 0; y < ch; y += 4) for(let x = 0; x < cw; x += 4) if(data[(y*cw + x)*4 + 3] > 128) pts.push([x, y]); }catch(e){}
  if(!pts.length) for(let i = 0; i < n; i++) pts.push([cw*i/n, ch/2]);
  const step = pts.length/n, chosen = []; for(let i = 0; i < n; i++) chosen.push(pts[Math.floor(i*step + rnd(0, step))] || pts[0]);
  const sc = Math.min(L.W*.85/cw, L.H*.45/ch), ox = L.W/2 - cw*sc/2, oy = L.H*.42 - ch*sc/2;
  const dim = part(L, 'left:0; top:0; width:100%; height:100%; background:rgba(10,14,30,.4); opacity:0;');
  const flies = chosen.map(()=>{ const d = part(L, 'width:5px; height:5px; margin:-2.5px; border-radius:50%; background:#f7ffb0; box-shadow:0 0 8px 3px rgba(220,255,100,.7);'); g.set(d, {x:rnd(0, L.W), y:rnd(0, L.H), opacity:0}); return d; });
  return new Promise(res=>{ const tl = g.timeline({onComplete:()=>{ done(L); res(); }});
    tl.to(dim, {opacity:1, duration:.5}).to(flies, {opacity:1, duration:.4, stagger:.01}, 0);
    flies.forEach((f, i)=>{ const [px, py] = chosen[i]; tl.to(f, {x:ox + px*sc, y:oy + py*sc, duration:rnd(1.1, 1.6), ease:'sine.inOut'}, .3 + rnd(0, .3)); });
    tl.to(flies, {opacity:.45, duration:.3, yoyo:true, repeat:3, stagger:{each:.02, from:'random'}}, '>-.1')
      .to(flies, {x:()=> '+=' + rnd(-160, 160), y:()=> '-=' + rnd(40, 200), opacity:0, duration:1, ease:'power1.in', stagger:.01}, '+=.2')
      .to(dim, {opacity:0, duration:.6}, '<'); }); };
M.vhsRewind = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); host = host || document.body; const L = stage(host, 'fxg-vhs', o.z || 80);
  const lines = part(L, 'left:0; top:0; width:100%; height:100%; background:repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 4px); mix-blend-mode:multiply;');
  const band = part(L, `left:0; width:100%; height:${L.H*.12}px; background:linear-gradient(180deg, transparent, rgba(255,255,255,.35), rgba(200,200,255,.15), transparent); filter:blur(1px);`);
  const split = part(L, 'left:0; top:0; width:100%; height:100%; box-shadow:inset 6px 0 0 rgba(255,0,60,.25), inset -6px 0 0 rgba(0,200,255,.25); mix-blend-mode:screen;');
  const osd = part(L, `left:6%; top:8%; font:700 ${Math.round(Math.min(26, L.W*.05))}px/1.2 'Courier New', monospace; color:#fff; text-shadow:2px 0 rgba(255,0,60,.7), -2px 0 rgba(0,200,255,.7); letter-spacing:.06em;`, '◀◀ REWIND<br><span class="fxg-tc">00:00:42</span>');
  const tc = osd.querySelector('.fxg-tc'), clock = {s:42}, hostIsBody = host === document.body;
  return new Promise(res=>{ g.timeline({onComplete:()=>{ if(!hostIsBody) g.set(host, {clearProps:'filter'}); done(L); res(); }})
    .from([lines, split, osd], {opacity:0, duration:.15})
    .add(()=>{ if(!hostIsBody) g.to(host, {filter:'saturate(1.7) contrast(1.15) hue-rotate(-8deg)', duration:.2}); })
    .fromTo(band, {y:-L.H*.15}, {y:L.H, duration:.45, repeat:4, ease:'none'}, 0)
    .to(clock, {s:0, duration:2.2, ease:'power1.in', onUpdate:()=>{ tc.textContent = '00:00:' + String(Math.max(0, Math.round(clock.s))).padStart(2, '0'); }}, 0)
    .to(L, {x:4, duration:.05, yoyo:true, repeat:9, ease:'steps(1)'}, .4)
    .add(()=>{ osd.innerHTML = '▶ PLAY'; }, 2.3)
    .to([lines, split, band, osd], {opacity:0, duration:.4}, 2.9); }); };
M.ghostParade = function(host, o){ o = o || {}; const g = G(); if(!g) return Promise.resolve(); const L = stage(host || document.body, 'fxg-ghosts', o.z || 60), n = o.n || 7, y0 = L.H*rnd(.35, .55);
  const moon = part(L, `left:${L.W*.78}px; top:${L.H*.08}px; width:${L.H*.2}px; height:${L.H*.2}px; border-radius:50%; background:radial-gradient(circle at 40% 40%, #fffbe0, #f2e3a0 60%, #d9c47a); box-shadow:0 0 40px 10px rgba(255,240,180,.4); opacity:0;`);
  g.to(moon, {opacity:1, duration:.8}); g.to(moon, {opacity:0, duration:.8, delay:4.2});
  for(let i = 0; i < n; i++){ const gh = part(L, '', '<i></i><i></i>'); gh.className = 'fxg-p fxg-ghost'; const s = i === 0 ? 1.3 : rnd(.7, 1);
    g.set(gh, {x:-50 - i*48, y:y0 + Math.sin(i)*14, scale:s, opacity:0});
    g.to(gh, {opacity:.92, duration:.4, delay:i*.12}); g.to(gh, {x:L.W + 60 + (n - i)*10, duration:4.4, delay:i*.12, ease:'none', onComplete:()=> gh.remove()});
    g.to(gh, {y:'-=' + rnd(10, 22), rotation:rnd(-8, 8), duration:.45, yoyo:true, repeat:9, delay:i*.12, ease:'sine.inOut'}); }
  return wait(5200).then(()=> done(L)); };
M.paperPlane = function(fromEl, toEl, o){ o = o || {}; const g = G(); if(!g || !fromEl || !toEl) return Promise.resolve(); const A = RECT(fromEl), B = RECT(toEl), S = sky();
  const plane = dot(S, 'width:34px; height:22px; margin:-11px 0 0 -17px;', `<svg viewBox="0 0 34 22" width="34" height="22"><polygon points="0,10 34,0 14,22" fill="#fffaf0" stroke="#bfb08a" stroke-width="1"/><polygon points="14,22 34,0 16,13" fill="#e9dfc6"/></svg>`);
  const p0 = {x:A.cx, y:A.cy}, p3 = {x:B.cx, y:B.cy}, p1 = {x:A.cx + (B.cx - A.cx)*.2 - 120, y:Math.max(30, Math.min(A.cy, B.cy) - 140)}, p2 = {x:A.cx + (B.cx - A.cx)*.8 + 80, y:Math.min(A.cy, B.cy) - 40};
  const bz = (t, k)=> (1 - t)**3*p0[k] + 3*(1 - t)**2*t*p1[k] + 3*(1 - t)*t*t*p2[k] + t**3*p3[k];
  const pr = {t:0}; let px = p0.x, py = p0.y;
  return new Promise(res=>{ g.timeline({onComplete:()=> fin([S], res)})
    .fromTo(plane, {scale:0}, {scale:1, duration:.2, ease:'back.out(3)'})
    .to(pr, {t:1, duration:1.5, ease:'sine.inOut', onUpdate:()=>{ const x = bz(pr.t, 'x'), y = bz(pr.t, 'y'); g.set(plane, {x, y, rotation:Math.atan2(y - py, x - px)*57.3 + 18}); px = x; py = y; }})
    .to(plane, {scale:0, duration:.15})
    .add(()=>{ const env = dot(S, 'font-size:22px;', '✉️'); g.fromTo(env, {x:B.cx - 11, y:B.cy - 14, scale:0}, {scale:1.3, y:'-=16', duration:.3, ease:'back.out(3)'}); g.to(env, {opacity:0, duration:.3, delay:.6});
      const t2 = tileOf(toEl); g.fromTo(t2, {scale:1.2}, {scale:1, duration:.4, ease:'back.out(3)', clearProps:'transform'}); })
    .to({}, {duration:1}); }); };
M.FUN = ['fireworkReveal', 'cardTornado', 'inkBrushReveal', 'classifiedStamp', 'stainedGlass', 'origamiCrane', 'slotReveal', 'pixelBeam', 'hologram', 'snowGlobe', 'cometArrival', 'gildedFrame',
  'rainbowBridge', 'magicCircle', 'bioTide', 'thunderStrike', 'portalSwap', 'confettiCannons', 'coinFountain', 'treasureChest', 'gachaCapsule', 'meteorShower', 'seasonalDrift', 'sandstormWipe',
  'bubblePop', 'lanternFestival', 'inkWash', 'fireflyWord', 'vhsRewind', 'ghostParade', 'paperPlane'];




})(typeof window !== 'undefined' ? window : this);
