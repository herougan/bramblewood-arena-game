/* ============================================================
   Bramblewood FX, batch E (2026-10-15): conquest-map, world-ambience
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.E: FX.E.someEffect(el, opts); variants are FX.E.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-e-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxe- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.E.onEvent / FX.E.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.E = FX.E || {};
const TAG = 'e';

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
// 2026-10-15 (Effects pass, batch E: "conquest map effects... think about my themes, future themes"): the Conquest map's
// world ambience, node states, the moments when you come back from a fight, feature-spot openings, curiosities and the
// future lands as lab concepts. Map 0 is misty, otters are bronze/teal river folk, hummingbirds vivid and tribal, ants
// light their roads with acid-battery lamps, dragons and the Dragonic Spire are red lightning and wither smoke, and magic
// only arrives on Map 50+.

// ---- map helpers ----
const reduced = ()=>{ try{ return (typeof reducedMotion === 'function') ? reducedMotion() : !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const canvasOf = el=> (el && el.closest && el.closest('.conquest-map-canvas')) || document.getElementById('conquestCanvas');
const layoutOf = el=> (el && el.closest && el.closest('.conquest-layout')) || document.getElementById('conquestLayout');
const keyOf = el=> el && (el.dataset.lkey || el.dataset.nodekey || '');
const sound = (name, ...a)=>{ try{ if(typeof SoundKit !== 'undefined' && SoundKit[name]) return SoundKit[name](...a); }catch(e){} };
const tscale = ()=>{ const g = G(); try{ return g ? g.globalTimeline.timeScale() : 1; }catch(e){ return 1; } };
// A fixed overlay centred on an element's box (survives the map re-rendering underneath).
function overlayAt(el, cls, html, w, h){
  const c = centre(el), o = layer('fxe-at ' + (cls || ''), html); w = w || c.w; h = h || c.h;
  Object.assign(o.style, {left:(c.x - w/2) + 'px', top:(c.y - h/2) + 'px', width:w + 'px', height:h + 'px'});
  return o;
}
// A small DOM particle: emoji or a styled dot, fixed at (x, y) on screen.
function bit(x, y, txt, cls, size){
  const b = layer('fxe-bit ' + (cls || ''), txt || ''); b.style.left = x + 'px'; b.style.top = y + 'px';
  if(size) b.style.fontSize = size + 'px'; return b;
}
// Throw n bits out of a point and fade them; resolves when the last one is gone.
function burst(x, y, list, opts){
  opts = opts || {}; const g = G(), n = opts.n || list.length, out = [];
  if(!g) return Promise.resolve();
  for(let i = 0; i < n; i++){
    const it = list[i % list.length], b = bit(x, y, it.t || it, 'fxe-burst ' + (it.cls || opts.cls || ''), it.size || opts.size || 14);
    const a = (opts.from || 0) + (opts.spread == null ? Math.PI*2 : opts.spread) * (i + Math.random()*.6)/n, d = (opts.dist || 46) * (0.6 + Math.random()*0.7);
    out.push(new Promise(res=> g.timeline({onComplete:()=>{ b.remove(); res(); }})
      .fromTo(b, {xPercent:-50, yPercent:-50, scale:.3, opacity:0, rotation:0}, {scale:1, opacity:1, duration:.12})
      .to(b, {x:Math.cos(a)*d, y:Math.sin(a)*d + (opts.lift || 0), rotation:rnd(-200, 200), duration:opts.dur || .7, ease:'power2.out'}, 0)
      .to(b, {opacity:0, y:'+=' + (opts.fall == null ? 14 : opts.fall), duration:.35, ease:'power1.in'}, (opts.dur || .7) - .25)));
  }
  return Promise.all(out);
}
// An expanding ring at a point (screen px).
function ring(x, y, color, size, dur, cls){
  const g = G(), r = layer('fxe-ring ' + (cls || '')); size = size || 60;
  Object.assign(r.style, {left:(x - size/2) + 'px', top:(y - size/2) + 'px', width:size + 'px', height:size + 'px', borderColor:color || '#ffe7a8'});
  if(!g){ later(()=> r.remove(), 400); return Promise.resolve(); }
  return new Promise(res=> g.fromTo(r, {scale:.25, opacity:.95}, {scale:1, opacity:0, duration:dur || .6, ease:'power2.out', onComplete:()=>{ r.remove(); res(); }}));
}

css('base', `
.fxe-at{position:fixed;}
.fxe-bit{position:fixed; line-height:1; will-change:transform, opacity; text-shadow:0 2px 3px rgba(0,0,0,.35); z-index:1210;}
.fxe-ring{position:fixed; border:3px solid #ffe7a8; border-radius:50%; box-sizing:border-box; box-shadow:0 0 12px rgba(255,230,160,.6), inset 0 0 10px rgba(255,230,160,.4);}
.fxe-dot{display:block; width:7px; height:7px; border-radius:50%; background:#fff3c4; box-shadow:0 0 8px 2px rgba(255,220,120,.85);}
.conquest-layout > canvas.fxe-amb{position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; border-radius:inherit; display:block;}
.conquest-layout.fxe-noshade > canvas.bw-shader-map{opacity:0 !important;}
`);

// ============================================================
// 1. Ambience engine (canvas 2D): fog banks, light pools, drifting particles, critters and weather events per biome.
//    One shared loop at ~30 fps; a layer pauses off screen or in a hidden tab and frees itself once its canvas has
//    been gone for 3 s (the game moves it into each re-rendered map frame; see hooks.mapShown).
// ============================================================
const AMB_LIVE = new Set();
let ambRaf = 0, ambLast = 0;
function ambLoop(now){
  ambRaf = 0; if(!AMB_LIVE.size) return;
  const dt = Math.min(0.1, (now - (ambLast || now))/1000);
  if(now - ambLast >= 32){ ambLast = now; const k = tscale(); AMB_LIVE.forEach(a=>{ try{ a.tick(dt*k); }catch(e){ a.stop(); } }); }
  if(AMB_LIVE.size) ambRaf = requestAnimationFrame(ambLoop);
}
const SPR = new Map();
// Soft round sprites, cached by colour: 'glow' (bright core) and 'fog' (very soft).
function sprite(kind, c){
  const k = kind + c.join(','); if(SPR.has(k)) return SPR.get(k);
  const s = kind === 'fog' ? 128 : 64, cv = document.createElement('canvas'); cv.width = cv.height = s; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2), rgb = c.slice(0, 3).join(',');
  if(kind === 'fog'){ gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.45, `rgba(${rgb},.55)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
  else { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, `rgba(${rgb},1)`); gr.addColorStop(.5, `rgba(${rgb},.28)`); gr.addColorStop(1, `rgba(${rgb},0)`); }
  g.fillStyle = gr; g.fillRect(0, 0, s, s); SPR.set(k, cv); return cv;
}
const pick = a=> a[Math.floor(Math.random()*a.length)];
const span = (r, d)=> r ? rnd(r[0], r[1]) : d;
const rgba = (c, a)=> `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Recipes. Units: x, y in 0..1 of the map; sizes in map heights; speeds in map widths/heights per second.
// parts: kind glow|star|petal|feather|emoji|flake|ember|bubble|streak|rune|gull|leaf|spore
// events: ripple|lightning|spray|drip|puff|bolt; fog: drifting banks; pools: light that breathes; grade: a top/bottom wash.
const AMB = {
  // Map 0, the Outskirts (m1): a misty meadow at first light. Low mist banks drift between the fights, dew winks in the grass.
  mist: {label:'Misty meadow: mist banks and dew', grade:{top:[236,244,250,.12], bottom:[226,238,232,.24]},
    pools:[{x:.16, y:.04, r:.8, c:[255,240,205], a:.16, pulse:[.18, .05]}],
    fog:{n:10, c:[240,246,244], a:.6, w:[.6,1.1], h:[.14,.28], y:[.25,1.05], vx:[.008,.02]},
    parts:[{kind:'star', n:16, c:[255,255,255], s:[.014,.024], y:[.42,.98], still:true, tw:[1.2,3.2]},
      {kind:'glow', n:7, c:[255,252,236], s:[.016,.024], vx:[.008,.022], vy:[-.008,.002], wob:.02, a:.75}]},
  // B: heavier fog that breathes thick and thin, sun breaking through.
  mistThick: {label:'Thick fog that thins and thickens', grade:{top:[230,238,240,.12], bottom:[220,230,228,.2]},
    pools:[{x:.2, y:.0, r:.9, c:[255,236,196], a:.2, pulse:[.1, .08]}],
    shafts:{n:4, c:[255,244,214], a:.11},
    fog:{n:12, c:[240,244,242], a:.7, w:[.6,1.1], h:[.14,.28], y:[.15,1.05], vx:[.004,.012], breathe:.35},
    parts:[{kind:'star', n:10, c:[255,255,255], s:[.008,.012], y:[.5,.98], still:true, tw:[1.5,3]}]},
  // The Old Bramble (mo): gnarled old wood, moss light in slanting beams, drifting spores.
  oldwood: {label:'Old wood: moss-green beams and drifting spores', grade:{top:[10,30,12,.18], bottom:[20,26,10,.2]},
    shafts:{n:5, c:[200,255,170], a:.2},
    fog:{n:5, c:[190,215,180], a:.32, w:[.5,.9], h:[.1,.18], y:[.7,1.02], vx:[.004,.01]},
    parts:[{kind:'spore', n:24, c:[214,255,140], s:[.012,.018], vx:[-.006,.006], vy:[-.012,-.004], wob:.012, a:1},
      {kind:'leaf', n:4, c:[[140,110,50],[110,130,50],[170,120,60]], s:[.016,.024], vx:[.01,.03], vy:[.02,.04], wob:.03}]},
  oldwoodB: {label:'Ancient fireflies and falling leaves', grade:{top:[8,18,10,.26], bottom:[18,20,8,.22]},
    parts:[{kind:'glow', n:16, c:[255,196,90], s:[.016,.026], vx:[-.01,.01], vy:[-.008,.008], wob:.02, blink:true},
      {kind:'leaf', n:7, c:[[150,110,50],[120,90,40],[176,128,60]], s:[.016,.026], vx:[.01,.03], vy:[.025,.05], wob:.04}]},
  // Clovermead (mq): a clover meadow; bees, drifting petals, a warm sun.
  clover: {label:'Clover meadow: bees and drifting petals', pools:[{x:.8, y:.06, r:.8, c:[255,238,180], a:.2, pulse:[.2, .04]}],
    shafts:{n:3, c:[255,246,210], a:.15},
    parts:[{kind:'petal', n:20, c:[[255,214,232],[255,255,255],[255,190,214],[250,240,170]], s:[.013,.02], vx:[.012,.04], vy:[.006,.02], wob:.03},
      {kind:'emoji', n:3, t:'🐝', s:[.05,.06], speed:.07},
      {kind:'glow', n:8, c:[255,236,140], s:[.006,.01], vx:[-.01,.01], vy:[-.01,0], wob:.01, a:.6}]},
  cloverB: {label:'Clover leaves and golden pollen', pools:[{x:.3, y:.0, r:.9, c:[255,236,170], a:.18, pulse:[.15, .05]}],
    parts:[{kind:'leaf', n:12, c:[[90,170,70],[120,190,80],[70,150,60]], s:[.018,.026], vx:[.015,.035], vy:[.008,.02], wob:.03, clover:true},
      {kind:'glow', n:22, c:[255,214,90], s:[.006,.012], vx:[.005,.02], vy:[-.012,.004], wob:.015, a:.8}]},
  // The Sunken Grove (ms): half-drowned trees, low fog on dark water, fireflies and rings where things surface.
  grove: {label:'Sunken grove: water fog, fireflies, rings', grade:{top:[10,26,30,.12], bottom:[8,30,36,.24]},
    fog:{n:8, c:[196,224,214], a:.45, w:[.5,.9], h:[.1,.18], y:[.5,1.02], vx:[.004,.01]},
    parts:[{kind:'glow', n:20, c:[210,255,120], s:[.024,.034], vx:[-.012,.012], vy:[-.01,.006], wob:.02, blink:true}],
    events:[{kind:'ripple', every:[.5,1.4], y:[.5,.97], c:[210,245,255]}]},
  groveB: {label:'Moonlit grove: blue wash and glints', grade:{top:[20,40,90,.22], bottom:[10,30,70,.28]},
    pools:[{x:.75, y:.0, r:.7, c:[200,220,255], a:.14, pulse:[.1, .03]}],
    fog:{n:5, c:[180,205,235], a:.22, w:[.5,.9], h:[.08,.12], y:[.6,1.0], vx:[.004,.009]},
    parts:[{kind:'star', n:14, c:[220,235,255], s:[.008,.013], y:[.5,.98], still:true, tw:[1,2.4]}, {kind:'glow', n:8, c:[170,255,140], s:[.012,.018], vx:[-.01,.01], vy:[-.006,.006], wob:.02, blink:true}],
    events:[{kind:'ripple', every:[.8,1.8], y:[.55,.97], c:[200,220,255]}]},
  // The Mycelium Deep (mz): glowing threads under the floor, spores rising, caps that breathe light.
  fungal: {label:'Mycelium: glowing threads, spores, breathing caps', grade:{top:[30,10,50,.28], bottom:[16,6,30,.3]},
    threads:{n:8, c:[170,140,255], c2:[140,255,235], a:.55},
    pools:[{x:.2, y:.7, r:.26, c:[150,110,255], a:.34, pulse:[.5, .14]}, {x:.78, y:.32, r:.24, c:[90,255,220], a:.3, pulse:[.4, .12]}, {x:.55, y:.88, r:.2, c:[200,120,255], a:.28, pulse:[.6, .12]}],
    parts:[{kind:'spore', n:28, c:[[190,160,255],[120,255,230],[240,170,255]], s:[.012,.02], vx:[-.006,.006], vy:[-.022,-.008], wob:.015, a:.85}]},
  fungalB: {label:'Spore puffs from the caps', grade:{top:[26,8,44,.26], bottom:[14,6,26,.3]},
    pools:[{x:.3, y:.6, r:.2, c:[150,110,255], a:.2, pulse:[.5, .1]}, {x:.7, y:.4, r:.2, c:[90,255,220], a:.18, pulse:[.45, .1]}],
    parts:[{kind:'spore', n:12, c:[[190,160,255],[120,255,230]], s:[.008,.012], vx:[-.005,.005], vy:[-.015,-.006], wob:.012, a:.7}],
    events:[{kind:'puff', every:[.7,1.6], y:[.3,.9], c:[[190,160,255],[120,255,230],[255,170,240]]}]},
  // The Glimmer Depths (mn): crystal glints in prism colours, a campfire's warm pool top left.
  crystal: {label:'Crystal glints and a campfire pool', grade:{top:[10,10,30,.26], bottom:[6,8,24,.3]},
    pools:[{x:.11, y:.16, r:.36, c:[255,170,80], a:.42, flicker:true}, {x:.7, y:.6, r:.24, c:[120,200,255], a:.12, pulse:[.3, .06]}],
    shafts:{n:3, c:[180,220,255], a:.07, prism:true},
    parts:[{kind:'star', n:18, c:'prism', s:[.022,.04], y:[.08,.95], still:true, tw:[.8,2.2]}, {kind:'glow', n:6, c:[255,190,110], s:[.006,.01], vx:[-.004,.004], vy:[-.03,-.015], wob:.01, a:.8, from:{x:.11, y:.16}}]},
  crystalB: {label:'Cold crystal hum: violet and cyan pulses', grade:{top:[14,8,34,.3], bottom:[6,10,26,.32]},
    pools:[{x:.25, y:.35, r:.22, c:[170,120,255], a:.22, pulse:[.8, .14]}, {x:.68, y:.62, r:.24, c:[100,220,255], a:.2, pulse:[.6, .12]}, {x:.5, y:.15, r:.18, c:[255,140,230], a:.16, pulse:[.7, .1]}],
    parts:[{kind:'star', n:10, c:'prism', s:[.012,.024], y:[.08,.95], still:true, tw:[.8,2]}]},
  // The Ice Hollow (mi): cold blue refraction moving over the ice, drips from the icicles, a breath of frost.
  icecave: {label:'Ice cave: blue refraction, drips, frost', grade:{top:[120,170,230,.16], bottom:[40,80,140,.2]},
    caustic:{n:8, c:[210,240,255], a:.34}, shafts:{n:3, c:[200,235,255], a:.14},
    fog:{n:4, c:[220,240,255], a:.2, w:[.5,.9], h:[.08,.12], y:[.85,1.02], vx:[.003,.008]},
    parts:[{kind:'star', n:16, c:[235,250,255], s:[.016,.026], y:[.2,.98], still:true, tw:[1.2,3]}],
    events:[{kind:'drip', every:[.25,.7], c:[215,242,255]}]},
  icecaveB: {label:'Frost dust swirling and ice glints', grade:{top:[110,160,220,.14], bottom:[50,90,150,.18]},
    parts:[{kind:'flake', n:30, c:[235,248,255], s:[.004,.008], vx:[-.03,.03], vy:[-.01,.02], wob:.05, a:.75}, {kind:'star', n:10, c:[230,248,255], s:[.01,.016], y:[.2,.98], still:true, tw:[1,2.5]}]},
  // The Aerie Vault (mv): wind-swept heights; streaks of wind, feathers tumbling past, cloud shadows.
  aerie: {label:'Eyrie: wind streaks and tumbling feathers', pools:[{x:.7, y:.0, r:.9, c:[255,250,230], a:.12, pulse:[.1, .03]}],
    fog:{n:4, c:[255,255,255], a:.22, w:[.5,.9], h:[.12,.2], y:[.0,.3], vx:[.02,.04]},
    parts:[{kind:'streak', n:10, c:[255,255,255], s:[.14,.28], vx:[.35,.6], y:[.05,.95], a:.65},
      {kind:'feather', n:7, c:[[250,246,236],[236,220,190],[130,100,70]], s:[.06,.08], vx:[.06,.14], vy:[-.01,.03], wob:.06}]},
  aerieB: {label:'Gusts and eagles circling high', pools:[{x:.3, y:.0, r:.9, c:[255,248,226], a:.12}],
    parts:[{kind:'streak', n:14, c:[255,255,255], s:[.1,.3], vx:[.45,.8], y:[.05,.95], a:.45, gust:true},
      {kind:'gull', n:3, c:[60,50,40], s:[.03,.045], circle:true}]},
  // Volcano Lair (mx): a dragon's lair; lava light from below that breathes slowly, embers, smoke, red lightning now and then.
  lair: {label:'Dragon lair: breathing lava light, red lightning', grade:{top:[40,6,6,.42], bottom:[90,20,4,.2]},
    pools:[{x:.5, y:1.12, r:1.0, c:[255,100,25], a:.55, pulse:[.2, .22]}, {x:.18, y:.9, r:.32, c:[255,150,50], a:.32, flicker:true}],
    fog:{n:6, c:[34,20,20], a:.5, w:[.5,.9], h:[.14,.22], y:[-.05,.3], vx:[.004,.01]},
    parts:[{kind:'ember', n:28, c:[255,150,60], s:[.01,.016], vx:[-.01,.02], vy:[-.08,-.03], wob:.02}],
    events:[{kind:'lightning', every:[2.5,5], c:[255,70,50]}]},
  lairB: {label:'Dragon breath sweeps the roof, heat haze', grade:{top:[50,8,4,.3], bottom:[80,16,4,.2]},
    pools:[{x:.5, y:1.1, r:.9, c:[255,100,30], a:.3, pulse:[.25, .1]}],
    sweep:{c:[255,120,40], a:.3, every:5},
    parts:[{kind:'ember', n:16, c:[255,170,70], s:[.006,.01], vx:[-.01,.02], vy:[-.07,-.03], wob:.02}, {kind:'streak', n:6, c:[255,180,120], s:[.2,.4], vx:[.02,.05], y:[.55,.95], a:.12, haze:true}]},
  // Gannet Cliffs (mc): sea cliffs; gulls riding the wind, spray thrown up from the foot of the cliff, a bright salt light.
  cliffs: {label:'Sea cliffs: gulls, spray, wind', pools:[{x:.8, y:.02, r:.9, c:[255,248,226], a:.16, pulse:[.12, .03]}],
    parts:[{kind:'gull', n:4, c:[250,250,250], s:[.035,.055]}, {kind:'streak', n:9, c:[255,255,255], s:[.14,.26], vx:[.3,.5], y:[.05,.9], a:.55}],
    events:[{kind:'spray', every:[.7,1.6], c:[240,250,255]}]},
  cliffsB: {label:'Squall: driving spray and white caps of mist', grade:{top:[90,110,130,.18], bottom:[60,80,100,.18]},
    fog:{n:6, c:[235,242,248], a:.3, w:[.5,.9], h:[.1,.18], y:[.6,1.05], vx:[.03,.06]},
    parts:[{kind:'gull', n:2, c:[250,250,250], s:[.03,.045]}, {kind:'streak', n:14, c:[230,240,255], s:[.15,.3], vx:[.6,.9], y:[.05,.95], a:.4, gust:true}],
    events:[{kind:'spray', every:[.6,1.4], c:[240,250,255]}]},

  // ---- future lands (lab concepts, 2026-10-15) ----
  // The Abyssal Plains (Map 29): pitch black but for bioluminescence and a wandering lure.
  abyssal: {label:'Abyss: pitch black, bioluminescence, a lure', grade:{top:[0,4,12,.72], bottom:[0,2,8,.82]},
    parts:[{kind:'glow', n:24, c:[[80,220,255],[120,255,200],[180,120,255]], s:[.008,.016], vx:[-.006,.006], vy:[-.01,.004], wob:.012, blink:true}, {kind:'lure', n:1, c:[180,255,240], s:[.05,.05], speed:.05}],
    events:[{kind:'pulse', every:[1.5,3], c:[[90,200,255],[160,110,255]]}]},
  abyssalB: {label:'Jellyfish drift up through the dark', grade:{top:[0,6,16,.7], bottom:[0,2,8,.8]},
    parts:[{kind:'jelly', n:5, c:[[255,140,220],[140,220,255],[200,160,255]], s:[.04,.07], vy:[-.03,-.015]}, {kind:'glow', n:14, c:[120,220,255], s:[.006,.01], vx:[-.004,.004], vy:[-.01,.004], wob:.01, blink:true}]},
  // The Dragonic Spire: red lightning never stops falling; wither smoke rolls down from the spires.
  spire: {label:'Dragonic Spire: red lightning, wither smoke', grade:{top:[30,0,0,.4], bottom:[10,0,0,.3]},
    fog:{n:8, c:[20,12,14], a:.5, w:[.4,.8], h:[.14,.24], y:[-.05,.35], vx:[.003,.008], sink:.012},
    parts:[{kind:'ember', n:14, c:[255,70,50], s:[.005,.009], vx:[-.02,.02], vy:[-.05,-.02], wob:.02}],
    events:[{kind:'lightning', every:[.5,1.3], c:[255,50,40], quick:true}]},
  spireB: {label:'Wyverns circle the spires', grade:{top:[36,4,4,.38], bottom:[12,0,0,.28]},
    fog:{n:5, c:[24,14,16], a:.4, w:[.4,.8], h:[.12,.2], y:[0,.3], vx:[.004,.008], sink:.01},
    parts:[{kind:'gull', n:3, c:[20,8,8], s:[.06,.09], circle:true, wyvern:true}],
    events:[{kind:'lightning', every:[1.4,2.6], c:[255,60,40]}]},
  // Floodplains: the water rises and recedes over the fields.
  flood: {label:'Floodplains: the water rises and recedes', flood:{c:[70,140,190], a:.36, lo:.05, hi:.42, period:8},
    parts:[{kind:'leaf', n:6, c:[[120,150,60],[160,120,60]], s:[.014,.02], vx:[.01,.025], vy:[0,0], wob:.01, float:true}]},
  // Wild Veggies (Maps 20+): a kitchen-garden wilderness; warm soil steam, pollen, seeds popping out of the rows.
  veggie: {label:'Wild Veggies: soil steam, pollen, seeds popping', grade:{top:[255,230,170,.06], bottom:[90,60,30,.14]},
    fog:{n:5, c:[230,214,190], a:.18, w:[.4,.7], h:[.06,.1], y:[.8,1.02], vx:[.003,.008]},
    parts:[{kind:'glow', n:18, c:[255,230,120], s:[.006,.012], vx:[-.008,.012], vy:[-.012,.002], wob:.015, a:.8}, {kind:'emoji', n:3, t:'🐛', s:[.032,.04], speed:.02, ground:true}],
    events:[{kind:'seed', every:[.6,1.4], c:[[120,200,70],[240,160,60],[200,80,60]]}]},
  // Map 50+: magic arrives; an arcane aurora, floating runes, prismatic motes.
  magic: {label:'Map 50+: arcane aurora and floating runes', grade:{top:[40,10,70,.26], bottom:[10,6,40,.2]},
    aurora:{c:[170,110,255], c2:[255,210,120], a:.28},
    parts:[{kind:'rune', n:8, c:[[220,180,255],[255,220,140],[150,220,255]], s:[.03,.05], vy:[-.012,-.004], wob:.01}, {kind:'star', n:14, c:'prism', s:[.008,.016], y:[.05,.95], still:true, tw:[.8,2]}]},
  // Ant country: acid-battery lampposts along the roads (lab concept; positions follow the trail).
  ants: {label:'Ant roads: acid-battery lamps', grade:{top:[10,14,30,.3], bottom:[6,10,20,.32]},
    lamps:{c:[200,255,90], a:.42}, parts:[{kind:'ant', n:9, c:[30,20,10], s:[.012,.016], speed:.035}]},

  // ---- the roadmap's later lands (2026-10-15, docs: world-roadmap-2026-10-13; lab concepts, no map yet) ----
  // Floodplains, the full loop: Flooded → Receded → Parched (Scorching; heat haze and a baked-orange wash) → Flooded.
  floodLoop: {label:'Floodplains loop: Flooded, Receded, Parched, Flooded', flood:{c:[70,140,190], a:.38, lo:-.04, hi:.4, period:9, parched:true},
    parts:[{kind:'leaf', n:6, c:[[120,150,60],[160,120,60]], s:[.014,.02], vx:[.01,.025], vy:[0,0], wob:.01, float:true}]},
  // Maps 40–45: the first dinosaurs. Steamy fern country, a smoking volcano far off, pterosaurs wheeling, and footfalls
  // that ring the puddles (thud… thud) before anything is seen.
  prehistoric: {label:'Maps 40+: fern steam, pterosaurs, footfalls ring the puddles', grade:{top:[60,80,30,.16], bottom:[30,50,20,.22]},
    pools:[{x:.88, y:.04, r:.36, c:[255,120,50], a:.3, pulse:[.3, .08]}],
    fog:{n:7, c:[226,238,214], a:.34, w:[.4,.8], h:[.1,.18], y:[.55,1.02], vx:[.003,.008]},
    parts:[{kind:'ember', n:8, c:[255,140,60], s:[.006,.01], vx:[-.01,.01], vy:[-.05,-.02], wob:.015, from:{x:.88, y:.06}},
      {kind:'gull', n:3, c:[70,46,30], s:[.05,.075], circle:true, wyvern:true},
      {kind:'leaf', n:6, c:[[70,120,40],[90,140,50]], s:[.02,.03], vx:[.006,.02], vy:[.01,.03], wob:.03}],
    events:[{kind:'stomp', every:[2.2,3.4], c:[230,240,255]}]},
  // Maps 45–50: the first aliens. Night sky; a saucer's beam sweeps the fields, green lights blink, crop rings pulse.
  alien: {label:'Maps 45+: a saucer beam sweeps the fields, green lights blink', grade:{top:[6,14,30,.5], bottom:[4,20,24,.36]},
    beam:{c:[150,255,170], a:.34, every:6},
    parts:[{kind:'star', n:16, c:[220,255,230], s:[.008,.014], y:[.02,.5], still:true, tw:[1,2.4]},
      {kind:'glow', n:10, c:[120,255,150], s:[.01,.016], vx:[-.01,.01], vy:[-.006,.006], wob:.02, blink:true}],
    events:[{kind:'pulse', every:[1.8,3], c:[120,255,160]}]},
  // Maps 50–60: Syzygy, the end of the world. Sun and moon line up into an eclipse; the tide stands at High; the
  // light goes bruise-violet and the corona breathes.
  syzygy: {label:'Maps 50+: Syzygy, an eclipse over a high tide', grade:{top:[30,10,50,.5], bottom:[20,10,40,.34]},
    eclipse:{x:.5, y:.17, r:.075, c:[255,222,160]},
    flood:{c:[60,90,170], a:.34, lo:.12, hi:.2, period:6},
    parts:[{kind:'star', n:20, c:[240,230,255], s:[.008,.014], y:[.02,.6], still:true, tw:[.8,2]}, {kind:'ember', n:10, c:[255,90,60], s:[.005,.008], vx:[-.01,.01], vy:[-.03,-.01], wob:.02}],
    events:[{kind:'lightning', every:[3,5], c:[200,150,255]}]},

  // ---- weather fronts (2026-10-15, map-weather-fronts): a band of weather crosses the map and moves on ----
  rain: {label:'Rain front', front:{kind:'rain', c:[210,226,255], dur:16, w:.32}},
  snow: {label:'Snow front', front:{kind:'snow', c:[255,255,255], dur:20, w:.36}},
  fogfront: {label:'Fog bank rolls through', front:{kind:'fog', c:[236,240,244], dur:22, w:.34}},
  ashfront: {label:'Ash flurry', front:{kind:'ash', c:[90,80,80], dur:16, w:.3}},
  sandfront: {label:'Sand gust', front:{kind:'sand', c:[236,206,150], dur:12, w:.28}},
};
M.AMB = AMB;

function mkPart(P, W, H, initial){
  const c = Array.isArray(P.c && P.c[0]) ? pick(P.c) : P.c;
  const p = {k:P.kind, P, c, s:span(P.s, .01), x:Math.random(), y:P.y ? span(P.y) : Math.random(), vx:span(P.vx, 0), vy:span(P.vy, 0),
    ph:Math.random()*6.28, rot:Math.random()*6.28, vr:rnd(-2, 2), a:P.a == null ? 1 : P.a, life:0, tw:span(P.tw, 2)};
  if(P.from){ p.x = P.from.x + rnd(-.02, .02); p.y = P.from.y; p.maxLife = rnd(1.2, 2.4); p.life = initial ? Math.random()*p.maxLife : 0; }
  if(p.k === 'emoji' || p.k === 'lure' || p.k === 'ant'){ p.tx = Math.random(); p.ty = P.ground ? rnd(.6, .95) : Math.random(); if(P.ground) p.y = rnd(.6, .95); }
  if(p.k === 'gull'){ p.y = rnd(.08, .55); p.vx = rnd(.03, .07) * (Math.random() < .5 ? -1 : 1); p.cx = rnd(.25, .75); p.cy = rnd(.15, .4); p.R = rnd(.12, .22); }
  if(p.k === 'streak' && !initial) p.x = p.vx > 0 ? -.3 : 1.1;
  if(p.k === 'star'){ p.y = span(P.y, Math.random()); p.ph = Math.random()*10; }
  if(p.k === 'jelly'){ p.y = initial ? Math.random() : 1.1; }
  if(c === 'prism') p.hue = Math.random()*360;
  return p;
}
function ambience(host, key, opts){
  opts = opts || {};
  const R = typeof key === 'object' ? key : AMB[key]; if(!host || !R) return null;
  const cv = document.createElement('canvas'); cv.className = 'fxe-amb fxe-amb-' + (typeof key === 'string' ? key : 'custom'); cv.setAttribute('aria-hidden', 'true');
  if(opts.style) cv.style.cssText = opts.style;
  const sh = host.querySelector(':scope > canvas.bw-shader-map');
  if(sh && sh.nextSibling) host.insertBefore(cv, sh.nextSibling); else if(sh) host.appendChild(cv); else host.insertBefore(cv, host.firstChild);
  const g = cv.getContext('2d');
  const A = {key, R, cv, host, t:0, k:opts.instant ? 1 : 0, fade:opts.fadeIn || 1.4, W:0, H:0, parts:[], fog:[], shafts:[], threads:[], caus:[], evts:[], fx:[], gone:0, dying:0,
    intensity:opts.intensity == null ? 1 : opts.intensity, scale:opts.scale || 0.6};
  // seed everything
  (R.parts || []).forEach(P=>{ for(let i = 0; i < P.n; i++) A.parts.push(mkPart(P, 1, 1, true)); });
  if(R.fog) for(let i = 0; i < R.fog.n; i++) A.fog.push({x:Math.random()*1.4 - .2, y:span(R.fog.y), w:span(R.fog.w), h:span(R.fog.h), vx:span(R.fog.vx) * (Math.random() < .2 ? -1 : 1), ph:Math.random()*6.28});
  if(R.shafts) for(let i = 0; i < R.shafts.n; i++) A.shafts.push({x:rnd(-.1, .9), w:rnd(.04, .12), ph:Math.random()*6.28, sp:rnd(.15, .4), hue:i*70});
  if(R.threads) for(let i = 0; i < R.threads.n; i++){ const y0 = rnd(.1, .95); A.threads.push({p:[rnd(-.05, .3), y0, rnd(.2, .5), y0 + rnd(-.25, .25), rnd(.5, .8), y0 + rnd(-.25, .25), rnd(.75, 1.05), y0 + rnd(-.2, .2)], ph:Math.random()*40, sp:rnd(6, 14)}); }
  if(R.caustic) for(let i = 0; i < R.caustic.n; i++) A.caus.push({x:Math.random(), y:Math.random(), r:rnd(.12, .25), vx:rnd(-.02, .02), vy:rnd(-.015, .015), ph:Math.random()*6});
  (R.events || []).forEach(E=> A.evts.push({E, next:span(E.every)*Math.random()}));
  if(R.front){ A.front = Object.assign({c0:-.4}, R.front); A.fdur = opts.duration || R.front.dur; for(let i = 0; i < (R.front.kind === 'fog' ? 9 : 70); i++) A.parts.push({k:'front', x:Math.random(), y:Math.random(), s:rnd(.6, 1.4), ph:Math.random()*6, vx:0, vy:0}); }
  A.tick = function(dt){
    if(!cv.isConnected){ A.gone += dt; if(A.gone > 3) A.stop(); return; }
    A.gone = 0; if(document.hidden) return;
    const r = host.getBoundingClientRect(); if(r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return;
    const W = Math.max(2, Math.round(r.width*A.scale)), H = Math.max(2, Math.round(r.height*A.scale));
    if(W !== A.W || H !== A.H){ cv.width = A.W = W; cv.height = A.H = H; }
    A.t += dt;
    if(A.dying){ A.k -= dt/A.dying; if(A.k <= 0){ A.stop(); return; } } else A.k = Math.min(1, A.k + dt/A.fade);
    if(A.fdur != null && A.t > A.fdur && !A.dying){ A.dying = 1.2; }
    draw(A, g, W, H, dt);
  };
  A.stop = ()=>{ AMB_LIVE.delete(A); cv.remove(); };
  A.fadeOut = s=>{ A.dying = s || 1; };
  A.flash = (c, a)=>{ A.fx.push({kind:'flash', c:c || [255,255,255], a:a || .5, t:0}); };
  AMB_LIVE.add(A);
  if(!ambRaf) ambRaf = requestAnimationFrame(ambLoop);
  return A;
}
M.ambience = ambience;

function draw(A, g, W, H, dt){
  const R = A.R, t = A.t, K = A.k * A.intensity;
  g.clearRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  if(R.grade){ const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgba(R.grade.top, R.grade.top[3]*K)); gr.addColorStop(1, rgba(R.grade.bottom, R.grade.bottom[3]*K)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  if(R.flood){ const F = R.flood, lv = F.lo + (F.hi - F.lo)*(0.5 - 0.5*Math.cos(t*2*Math.PI/F.period)), top = H*(1 - lv);
    g.beginPath(); g.moveTo(0, H); for(let x = 0; x <= W; x += 6) g.lineTo(x, top + Math.sin(x*.05 + t*1.6)*H*.008 + Math.sin(x*.013 - t)*H*.012); g.lineTo(W, H); g.closePath();
    const gr = g.createLinearGradient(0, top, 0, H); gr.addColorStop(0, rgba(F.c, F.a*K)); gr.addColorStop(1, rgba(F.c.map(v=> v*.6|0), F.a*1.2*K)); g.fillStyle = gr; g.fill();
    g.strokeStyle = rgba([235,248,255], .55*K); g.lineWidth = Math.max(1, H*.004); g.beginPath(); for(let x = 0; x <= W; x += 6){ const y = top + Math.sin(x*.05 + t*1.6)*H*.008 + Math.sin(x*.013 - t)*H*.012; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    A.waterTop = 1 - lv;
    // 2026-10-15: Parched, the dry turn of the loop (water below the bottom edge): a baked-orange wash and heat haze
    if(F.parched){ const dry = Math.max(0, Math.min(1, (F.lo + .06 - lv)/.1)); if(dry > 0){ g.globalAlpha = dry*K; g.fillStyle = 'rgba(214,150,70,.26)'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,226,170,.35)'; g.lineWidth = Math.max(1, H*.012); for(let k = 0; k < 5; k++){ const y = H*(.2 + k*.17) + Math.sin(t*2 + k)*H*.01; g.beginPath(); for(let x = 0; x <= W; x += 10){ const yy = y + Math.sin(x*.03 + t*3 + k)*H*.006; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
      g.globalAlpha = 1; } } }
  (R.pools || []).forEach(P=>{ let a = P.a; if(P.pulse) a *= 1 + Math.sin(t*P.pulse[0]*6.28)*P.pulse[1]/P.a*.9; if(P.flicker) a *= .82 + .18*Math.sin(t*13 + Math.sin(t*7)*2) * Math.sin(t*5.3);
    const x = P.x*W, y = P.y*H, rr = P.r*H, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, rgba(P.c, a*K)); gr.addColorStop(.5, rgba(P.c, a*.4*K)); gr.addColorStop(1, rgba(P.c, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  if(R.eclipse){ const E = R.eclipse, x = E.x*W, y = E.y*H, r = E.r*H, br = 1 + .08*Math.sin(t*1.3);
    const gr = g.createRadialGradient(x, y, r*.9, x, y, r*3.2*br); gr.addColorStop(0, rgba(E.c, 1*K)); gr.addColorStop(.18, rgba(E.c, .55*K)); gr.addColorStop(.45, rgba(E.c, .16*K)); gr.addColorStop(1, rgba(E.c, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalAlpha = K; g.fillStyle = '#120a1c'; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill(); g.strokeStyle = rgba([255,240,210], .9*K); g.lineWidth = Math.max(1, H*.004); g.stroke();
    const dg = (Math.sin(t*.8) + 1)/2; g.globalAlpha = K*dg; g.drawImage(sprite('glow', [255,250,235]), x + r*.6 - r*.7, y - r*.8 - r*.7, r*1.4, r*1.4); g.globalAlpha = 1; } // the diamond-ring glint
  if(R.beam){ const B = R.beam, ph = (t % B.every)/B.every, sx = W*(.15 + .7*(.5 - .5*Math.cos(ph*6.283))), top = H*.08, bw = H*.07, foot = H*.32;
    g.globalAlpha = K; const gr = g.createLinearGradient(0, top, 0, H*.95); gr.addColorStop(0, rgba(B.c, B.a)); gr.addColorStop(1, rgba(B.c, B.a*.2)); g.fillStyle = gr;
    g.beginPath(); g.moveTo(sx - bw*.5, top); g.lineTo(sx + bw*.5, top); g.lineTo(sx + foot*.5, H*.95); g.lineTo(sx - foot*.5, H*.95); g.closePath(); g.fill();
    g.fillStyle = rgba(B.c, B.a*.8); g.beginPath(); g.ellipse(sx, H*.95, foot*.5, H*.03, 0, 0, 6.28); g.fill();
    g.fillStyle = '#9aa3ad'; g.beginPath(); g.ellipse(sx, top, H*.09, H*.022, 0, 0, 6.28); g.fill(); g.fillStyle = '#c9f7ff'; g.beginPath(); g.ellipse(sx, top - H*.014, H*.035, H*.02, 0, Math.PI, 0); g.fill();
    for(let k = -2; k <= 2; k++){ g.fillStyle = (Math.floor(t*4) + k) % 2 ? '#7dff9a' : '#ffe27a'; g.beginPath(); g.arc(sx + k*H*.032, top + H*.006, Math.max(1, H*.005), 0, 6.28); g.fill(); } g.globalAlpha = 1; }
  if(R.aurora){ const Au = R.aurora; for(let b = 0; b < 3; b++){ g.beginPath(); for(let x = 0; x <= W; x += 8){ const y = H*(.12 + b*.07) + Math.sin(x*.012 + t*.4 + b)*H*.06 + Math.sin(x*.004 - t*.2)*H*.04; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.strokeStyle = rgba(b % 2 ? Au.c2 : Au.c, Au.a*K*(.6 + .4*Math.sin(t*.7 + b))); g.lineWidth = H*.05; g.filter = 'blur(' + Math.round(H*.02) + 'px)'; g.stroke(); g.filter = 'none'; } }
  A.shafts.forEach(s=>{ const S = R.shafts, a = S.a*K*(.55 + .45*Math.sin(t*s.sp + s.ph)), x0 = s.x*W, w = s.w*W, c = S.prism ? hsl(s.hue + t*20, 80, 75) : S.c;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w + H*.55, H); g.lineTo(x0 + H*.55, H); g.closePath(); g.fill(); });
  if(R.sweep){ const S = R.sweep, ph = (t % S.every)/S.every; if(ph < .45){ const p = ph/.45, x = (-.3 + p*1.6)*W, gr = g.createRadialGradient(x, H*.1, 0, x, H*.1, H*.7);
    const a = S.a*K*Math.sin(p*Math.PI); gr.addColorStop(0, rgba(S.c, a)); gr.addColorStop(1, rgba(S.c, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); } }
  A.caus.forEach(c=>{ c.x += c.vx*dt; c.y += c.vy*dt; if(c.x < -.2 || c.x > 1.2) c.vx *= -1; if(c.y < -.2 || c.y > 1.2) c.vy *= -1;
    const s = sprite('fog', R.caustic.c), rr = c.r*H*(1 + .25*Math.sin(t*.8 + c.ph)); g.globalAlpha = R.caustic.a*K*(.6 + .4*Math.sin(t*1.1 + c.ph)); g.drawImage(s, c.x*W - rr*1.6, c.y*H - rr*.7, rr*3.2, rr*1.4); });
  g.globalAlpha = 1;
  A.threads.forEach(th=>{ const T = R.threads, p = th.p; g.lineCap = 'round';
    g.beginPath(); g.moveTo(p[0]*W, p[1]*H); g.bezierCurveTo(p[2]*W, p[3]*H, p[4]*W, p[5]*H, p[6]*W, p[7]*H);
    g.setLineDash([]); g.strokeStyle = rgba(T.c, T.a*.35*K); g.lineWidth = Math.max(1, H*.004); g.stroke();
    g.setLineDash([H*.04, H*.5]); g.lineDashOffset = -(t*th.sp*H*.02 + th.ph*H*.02); g.strokeStyle = rgba(T.c2, T.a*1.6*K); g.lineWidth = Math.max(1.5, H*.008); g.stroke(); g.setLineDash([]); });
  A.fog.forEach(f=>{ const F = R.fog; f.x += f.vx*dt; if(F.sink){ f.y += F.sink*dt; if(f.y > .75){ f.y = rnd(-.1, .1); } }
    if(f.x > 1.3) f.x = -.3 - f.w*.5; if(f.x < -.3 - f.w*.5) f.x = 1.3;
    const s = sprite('fog', F.c), a = F.a*K*(F.breathe ? (1 - F.breathe) + F.breathe*(.5 + .5*Math.sin(t*.35 + f.ph)) : .8 + .2*Math.sin(t*.5 + f.ph)) * (F.sink ? Math.min(1, (.75 - f.y)*3) : 1);
    g.globalAlpha = Math.max(0, a); g.drawImage(s, (f.x - f.w/2)*W, (f.y - f.h/2)*H, f.w*W, f.h*H); });
  g.globalAlpha = 1;
  if(R.lamps) drawLamps(A, g, W, H, t, K);
  if(A.front) drawFront(A, g, W, H, dt, K);
  A.parts.forEach(p=> p.k !== 'front' && drawPart(A, p, g, W, H, dt, t, K));
  A.evts.forEach(e=>{ e.next -= dt; if(e.next <= 0){ e.next = span(e.E.every); spawnEvt(A, e.E); } });
  A.fx = A.fx.filter(f=> drawFx(A, f, g, W, H, dt, K));
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function hsl(h, s, l){ // → [r,g,b]
  s /= 100; l /= 100; const k = n=> (n + h/30) % 12, a = s*Math.min(l, 1 - l), f = n=> l - a*Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255*f(0)), Math.round(255*f(8)), Math.round(255*f(4))];
}
function wrap(p, m){ if(p.x > 1 + m) p.x = -m; if(p.x < -m) p.x = 1 + m; if(p.y > 1 + m) p.y = -m; if(p.y < -m) p.y = 1 + m; }
function drawPart(A, p, g, W, H, dt, t, K){
  const P = p.P, S = p.s*H;
  if(p.k === 'star'){ // a twinkling four-point glint that comes and goes in place
    const ph = (t + p.ph) % (p.tw*2), on = ph < p.tw ? Math.sin(ph/p.tw*Math.PI) : 0; if(on <= .02){ if(ph > p.tw*1.9){ p.x = Math.random(); p.y = span(P.y, Math.random()); } return; }
    const c = p.c === 'prism' ? hsl(p.hue + t*40, 90, 72) : p.c, x = p.x*W, y = p.y*H, L = S*on;
    g.globalAlpha = on*K; g.fillStyle = rgba(c, 1); g.beginPath(); g.moveTo(x, y - L); g.lineTo(x + L*.18, y - L*.18); g.lineTo(x + L, y); g.lineTo(x + L*.18, y + L*.18); g.lineTo(x, y + L); g.lineTo(x - L*.18, y + L*.18); g.lineTo(x - L, y); g.lineTo(x - L*.18, y - L*.18); g.closePath(); g.fill();
    g.drawImage(sprite('glow', c), x - L*.8, y - L*.8, L*1.6, L*1.6); return; }
  if(p.k === 'emoji' || p.k === 'lure' || p.k === 'ant'){ // wanders toward a target, picks a new one when close
    const sp = (P.speed || .05)*dt, dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    if(d < .03){ p.tx = Math.random(); p.ty = P.ground ? rnd(.6, .95) : Math.random(); } else { p.x += dx/d*sp + Math.sin(t*3 + p.ph)*.0008; p.y += dy/d*sp + Math.cos(t*4 + p.ph)*.001; p.dir = dx < 0 ? 1 : -1; }
    if(p.k === 'lure'){ const x = p.x*W, y = p.y*H; g.globalAlpha = K*(.75 + .25*Math.sin(t*3)); g.drawImage(sprite('glow', p.c), x - S, y - S, S*2, S*2); g.drawImage(sprite('glow', [255,255,255]), x - S*.3, y - S*.3, S*.6, S*.6);
      g.strokeStyle = rgba(p.c, .25*K); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + S*1.5*(p.dir||1), y - S*2, x + S*3*(p.dir||1), y - S*.5); g.stroke(); return; }
    if(p.k === 'ant'){ const x = p.x*W, y = p.y*H; g.globalAlpha = K*.85; g.fillStyle = rgba(p.c, 1); for(let k = 0; k < 3; k++){ g.beginPath(); g.arc(x + (p.dir||1)*k*S*.55, y + Math.sin(t*18 + k)*S*.05, S*(k === 1 ? .22 : .28), 0, 6.28); g.fill(); } return; }
    g.save(); g.globalAlpha = K; g.translate(p.x*W, p.y*H + Math.sin(t*6 + p.ph)*S*.15); g.scale(p.dir || 1, 1); g.font = Math.round(S) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(P.t, 0, 0); g.restore(); return; }
  if(p.k === 'gull'){ // a gliding V that flaps now and then; "circle" ones wheel round a point
    let x, y, dir;
    if(P.circle){ p.ph += dt*(.35 + p.R); x = p.cx + Math.cos(p.ph)*p.R; y = p.cy + Math.sin(p.ph)*p.R*.45; dir = -Math.sin(p.ph) < 0 ? -1 : 1; }
    else { p.x += p.vx*dt; p.y += Math.sin(t*.7 + p.ph)*.004*dt*10; if(p.x > 1.15) p.x = -.15; if(p.x < -.15) p.x = 1.15; x = p.x; y = p.y; dir = p.vx > 0 ? 1 : -1; }
    const flap = Math.sin(t*(P.wyvern ? 4 : 7) + p.ph), up = (Math.sin(t*.9 + p.ph) > .2 ? flap : .25)*S*.45, X = x*W, Y = y*H;
    g.globalAlpha = K*(P.wyvern ? .8 : .95); g.strokeStyle = rgba(p.c, 1); g.lineWidth = Math.max(1.4, S*(P.wyvern ? .14 : .1)); g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(X - S, Y - up); g.quadraticCurveTo(X - S*.45, Y - S*.35 - up*.3, X, Y); g.quadraticCurveTo(X + S*.45, Y - S*.35 - up*.3, X + S, Y - up); g.stroke();
    if(P.wyvern){ g.fillStyle = rgba(p.c, 1); g.beginPath(); g.moveTo(X, Y); g.lineTo(X - dir*S*.7, Y + S*.12); g.lineTo(X - dir*S*.9, Y + S*.3); g.lineTo(X - dir*S*.55, Y + S*.16); g.closePath(); g.fill(); }
    return; }
  if(p.k === 'jelly'){ p.y += p.vy*dt; if(p.y < -.15){ p.y = 1.15; p.x = Math.random(); }
    const X = (p.x + Math.sin(t*.5 + p.ph)*.02)*W, Y = p.y*H, pulse = 1 + .12*Math.sin(t*2.4 + p.ph);
    g.globalAlpha = .7*K; g.drawImage(sprite('glow', p.c), X - S*1.2, Y - S*1.2, S*2.4, S*2.4);
    g.fillStyle = rgba(p.c, .55*K); g.beginPath(); g.ellipse(X, Y, S*.5*pulse, S*.38/pulse, 0, Math.PI, 0); g.fill();
    g.strokeStyle = rgba(p.c, .5*K); g.lineWidth = 1; for(let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(X + k*S*.18, Y); g.quadraticCurveTo(X + k*S*.2 + Math.sin(t*3 + k)*S*.12, Y + S*.5, X + k*S*.15, Y + S*.9); g.stroke(); }
    return; }
  // drifting kinds
  p.ph += dt; p.rot += p.vr*dt;
  if(P.from){ p.life += dt; if(p.life > p.maxLife){ Object.assign(p, mkPart(P, 1, 1, false)); return; } }
  let gx = P.gust ? (1 + 1.6*Math.max(0, Math.sin(t*.6))) : 1;
  p.x += (p.vx*gx + Math.sin(p.ph*1.3)*(P.wob || 0))*dt; p.y += (p.vy + Math.cos(p.ph*1.1)*(P.wob || 0)*.5)*dt;
  if(P.float && A.waterTop != null){ p.y = A.waterTop + .01 + Math.sin(t + p.ph)*.004; }
  wrap(p, p.k === 'streak' ? .4 : .05);
  const X = p.x*W, Y = p.y*H; let a = p.a*K*(P.from ? Math.sin(Math.min(1, p.life/p.maxLife)*Math.PI) : 1);
  if(P.blink) a *= Math.max(0, Math.sin(t*1.3 + p.ph*3)*.8 + .4);
  if(p.k === 'glow' || p.k === 'spore' || p.k === 'ember'){ const c = p.k === 'ember' ? [255, 120 + 100*Math.abs(Math.sin(p.ph*4))|0, 50] : p.c, s = S*(p.k === 'spore' ? 1.6 : 2.2);
    g.globalAlpha = Math.max(0, a*(p.k === 'ember' ? .6 + .4*Math.sin(p.ph*9) : 1)); g.drawImage(sprite('glow', c), X - s/2, Y - s/2, s, s); return; }
  if(p.k === 'flake'){ g.globalAlpha = a; g.drawImage(sprite('glow', p.c), X - S, Y - S, S*2, S*2); return; }
  if(p.k === 'streak'){ const L = S*W/H*.5, gr = g.createLinearGradient(X - L, Y, X + L, Y), c = p.c; gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(.5, rgba(c, a*(P.haze ? .5 : 1))); gr.addColorStop(1, rgba(c, 0));
    g.globalAlpha = 1; g.strokeStyle = gr; g.lineWidth = Math.max(1, H*(P.haze ? .02 : .003)); g.beginPath(); g.moveTo(X - L, Y); g.quadraticCurveTo(X, Y - H*.006*Math.sin(p.ph*2), X + L, Y); g.stroke(); return; }
  if(p.k === 'rune'){ const R2 = '✦ᚱᛟᚨᛉ✧ᛞᚹ'; if(!p.glyph) p.glyph = R2[Math.floor(Math.random()*R2.length)]; if(p.y < -.04){ p.y = 1.04; p.x = Math.random(); }
    g.save(); g.globalAlpha = a*(.55 + .45*Math.sin(t*1.2 + p.ph*2)); g.translate(X, Y); g.rotate(Math.sin(p.rot*.3)*.6); g.drawImage(sprite('glow', p.c), -S, -S, S*2, S*2);
    g.fillStyle = rgba([255,255,255], 1); g.font = '700 ' + Math.round(S*.9) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.glyph, 0, 0); g.restore(); return; }
  // petal / leaf / feather: tumbling flat shapes
  g.save(); g.globalAlpha = a; g.translate(X, Y); g.rotate(p.rot); g.scale(1, Math.abs(Math.cos(p.ph*2.2)) *.8 + .2);
  if(p.k === 'feather'){ g.fillStyle = rgba(p.c, .95); g.beginPath(); g.ellipse(0, 0, S*.55, S*.16, 0, 0, 6.28); g.fill(); g.strokeStyle = rgba([120,100,80], .8); g.lineWidth = Math.max(1, S*.04); g.beginPath(); g.moveTo(-S*.7, 0); g.lineTo(S*.55, 0); g.stroke(); }
  else if(p.k === 'leaf' && P.clover){ g.fillStyle = rgba(p.c, .95); for(let k = 0; k < 3; k++){ g.beginPath(); const an = k*2.09; g.arc(Math.cos(an)*S*.28, Math.sin(an)*S*.28, S*.3, 0, 6.28); g.fill(); } }
  else if(p.k === 'leaf'){ g.fillStyle = rgba(p.c, .92); g.beginPath(); g.moveTo(-S*.6, 0); g.quadraticCurveTo(0, -S*.42, S*.6, 0); g.quadraticCurveTo(0, S*.42, -S*.6, 0); g.fill(); }
  else { g.fillStyle = rgba(p.c, .95); g.beginPath(); g.ellipse(0, 0, S*.6, S*.36, 0, 0, 6.28); g.fill(); }
  g.restore();
}
function spawnEvt(A, E){
  const c = Array.isArray(E.c && E.c[0]) ? pick(E.c) : E.c;
  if(E.kind === 'ripple') A.fx.push({kind:'ripple', x:Math.random(), y:span(E.y, .8), c, t:0, life:1.6});
  else if(E.kind === 'drip'){ const x = rnd(.05, .95); A.fx.push({kind:'drip', x, y:0, land:rnd(.55, .97), v:0, c, t:0}); }
  else if(E.kind === 'lightning'){ const pts = [], x0 = rnd(.15, .85); let x = x0, y = 0; const yEnd = rnd(.35, .8); pts.push([x, y]); while(y < yEnd){ y += rnd(.04, .1); x += rnd(-.06, .06); pts.push([x, y]); }
    A.fx.push({kind:'bolt', pts, c, t:0, life:E.quick ? .22 : .38}); A.fx.push({kind:'flash', c, a:E.quick ? .12 : .22, t:0}); }
  else if(E.kind === 'spray'){ const x = rnd(.1, .9); for(let i = 0; i < 16; i++) A.fx.push({kind:'drop', x, y:1.02, vx:rnd(-.14, .14), vy:rnd(-.75, -.4), c, t:0, s:rnd(.007, .014)}); }
  else if(E.kind === 'puff'){ const x = rnd(.1, .9), y = span(E.y, .6); for(let i = 0; i < 9; i++) A.fx.push({kind:'mote', x, y, vx:rnd(-.06, .06), vy:rnd(-.09, -.02), c, t:0, life:rnd(1.4, 2.2), s:rnd(.008, .016)}); }
  else if(E.kind === 'seed'){ const x = rnd(.08, .92), y = rnd(.55, .95); A.fx.push({kind:'seed', x, y, vx:rnd(-.08, .08), vy:-rnd(.25, .4), c, t:0, s:rnd(.008, .012), y0:y}); }
  else if(E.kind === 'stomp'){ const x = rnd(.15, .85), y = rnd(.6, .92); // two footfalls a beat apart: the puddle rings twice
    A.fx.push({kind:'ripple', x, y, c, t:0, life:1.1}); A.fx.push({kind:'ripple', x:x + .01, y, c, t:-.55, life:1.1}); A.fx.push({kind:'flash', c:[40,30,20], a:.1, t:0}); }
  else if(E.kind === 'pulse') A.fx.push({kind:'ripple', x:Math.random(), y:Math.random(), c, t:0, life:2.2, big:true});
}
function drawFx(A, f, g, W, H, dt, K){
  f.t += dt;
  if(f.kind === 'flash'){ const a = f.a*Math.max(0, 1 - f.t/.35); if(a <= 0) return false; g.globalAlpha = a*K; g.fillStyle = rgba(f.c, 1); g.fillRect(0, 0, W, H); return true; }
  if(f.kind === 'ripple'){ if(f.t < 0) return true; const p = f.t/f.life; if(p >= 1) return false; g.globalAlpha = (1 - p)*.7*K; g.strokeStyle = rgba(f.c, 1); g.lineWidth = Math.max(1, H*(f.big ? .006 : .003));
    const r = H*(f.big ? .25 : .05)*p; g.beginPath(); g.ellipse(f.x*W, f.y*H, r*1.6, r*(f.big ? 1.6 : .55), 0, 0, 6.28); g.stroke();
    if(!f.big && p > .2){ g.globalAlpha = (1 - p)*.4*K; g.beginPath(); g.ellipse(f.x*W, f.y*H, r*1.0, r*.34, 0, 0, 6.28); g.stroke(); } return true; }
  if(f.kind === 'drip'){ if(f.y < f.land){ f.v += 1.4*dt; f.y += f.v*dt; g.globalAlpha = .85*K; g.fillStyle = rgba(f.c, 1); g.beginPath(); g.ellipse(f.x*W, f.y*H, H*.004, H*.01, 0, 0, 6.28); g.fill(); return true; }
    if(!f.splash){ f.splash = true; A.fx.push({kind:'ripple', x:f.x, y:f.land, c:f.c, t:0, life:.9}); } return false; }
  if(f.kind === 'bolt'){ const p = f.t/f.life; if(p >= 1) return false; g.globalAlpha = (p < .15 ? 1 : (1 - p))*K; g.strokeStyle = rgba(f.c, 1); g.lineWidth = Math.max(1.5, H*.006); g.lineJoin = 'round';
    g.shadowColor = rgba(f.c, 1); g.shadowBlur = H*.03; g.beginPath(); f.pts.forEach(([x, y], i)=> i ? g.lineTo(x*W, y*H) : g.moveTo(x*W, y*H)); g.stroke();
    g.strokeStyle = 'rgba(255,240,240,1)'; g.lineWidth = Math.max(1, H*.002); g.stroke(); g.shadowBlur = 0; return true; }
  if(f.kind === 'drop'){ f.vy += .9*dt; f.x += f.vx*dt; f.y += f.vy*dt; if(f.y > 1.05 && f.t > .3) return false; g.globalAlpha = .85*K*Math.max(0, 1 - f.t/1.6); g.drawImage(sprite('glow', f.c), f.x*W - f.s*H, f.y*H - f.s*H, f.s*H*2, f.s*H*2); return true; }
  if(f.kind === 'mote'){ const p = f.t/f.life; if(p >= 1) return false; f.x += f.vx*dt; f.y += f.vy*dt; f.vx *= .98; g.globalAlpha = Math.sin(p*Math.PI)*.85*K; const s = f.s*H*(1 + p); g.drawImage(sprite('glow', f.c), f.x*W - s, f.y*H - s, s*2, s*2); return true; }
  if(f.kind === 'seed'){ f.vy += 1.1*dt; f.x += f.vx*dt; f.y += f.vy*dt; if(f.y > f.y0 && f.t > .2){ A.fx.push({kind:'ripple', x:f.x, y:f.y0, c:[140,100,60], t:0, life:.6}); return false; }
    g.globalAlpha = K; g.fillStyle = rgba(f.c, 1); g.beginPath(); g.ellipse(f.x*W, f.y*H, f.s*H, f.s*H*.7, f.t*8, 0, 6.28); g.fill(); return true; }
  return false;
}
function drawFront(A, g, W, H, dt, K){
  const F = A.front, prog = Math.min(1, A.t/A.fdur), c0 = -.45 + prog*1.9, band = x=> Math.exp(-Math.pow((x - c0)/F.w, 2));
  A.parts.forEach(p=>{ if(p.k !== 'front') return; p.ph += dt;
    if(F.kind === 'rain'){ p.y += dt*(1.4 + p.s*.6); p.x += dt*.12; if(p.y > 1.05){ p.y = -.05; p.x = Math.random(); } const a = band(p.x)*K*.85; if(a < .02) return;
      g.globalAlpha = a; g.strokeStyle = rgba(F.c, 1); g.lineWidth = Math.max(1.2, H*.0035); g.beginPath(); g.moveTo(p.x*W, p.y*H); g.lineTo(p.x*W - H*.012, p.y*H - H*.05*p.s); g.stroke();
      if(Math.random() < .02*a) A.fx.push({kind:'ripple', x:p.x, y:rnd(.3, .98), c:F.c, t:0, life:.5}); }
    else if(F.kind === 'snow' || F.kind === 'ash' || F.kind === 'sand'){ const fast = F.kind === 'sand'; p.y += dt*(fast ? .05 : .12 + p.s*.05)*(F.kind === 'ash' ? .7 : 1); p.x += dt*(fast ? .5 + p.s*.3 : .05 + Math.sin(p.ph + p.s)*.06);
      if(p.y > 1.05) p.y = -.05; if(p.x > 1.05){ p.x = -.05; p.y = Math.random(); } const a = band(p.x)*K*(F.kind === 'ash' ? .8 : .9); if(a < .02) return;
      const s = H*(fast ? .004 : .007)*p.s; g.globalAlpha = a; if(fast){ g.strokeStyle = rgba(F.c, 1); g.lineWidth = Math.max(1, s*.8); g.beginPath(); g.moveTo(p.x*W, p.y*H); g.lineTo(p.x*W - H*.03, p.y*H); g.stroke(); }
      else g.drawImage(sprite('glow', F.c), p.x*W - s*2, p.y*H - s*2, s*4, s*4); }
    else if(F.kind === 'fog'){ const x = c0 + (p.x - .5)*F.w*2.2, y = p.y, a = K*.55*(.7 + .3*Math.sin(p.ph*.5)); g.globalAlpha = a*band(x); g.drawImage(sprite('fog', F.c), (x - .25)*W, (y - .1)*H, .5*W, .2*H*p.s); }
  });
  if(F.kind === 'rain'){ g.globalAlpha = .18*K; const gr = g.createLinearGradient((c0 - F.w)*W, 0, (c0 + F.w)*W, 0); gr.addColorStop(0, 'rgba(30,40,60,0)'); gr.addColorStop(.5, 'rgba(30,40,60,1)'); gr.addColorStop(1, 'rgba(30,40,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
}
function drawLamps(A, g, W, H, t, K){
  if(!A.lampPts){ A.lampPts = []; const pts = A.R.lampPts || [[.1,.7],[.3,.5],[.5,.62],[.7,.44],[.9,.26]]; for(let i = 0; i < pts.length - 1; i++) for(let s = 0; s < 2; s++){ const f = (s + .5)/2; A.lampPts.push([pts[i][0] + (pts[i+1][0] - pts[i][0])*f, pts[i][1] + (pts[i+1][1] - pts[i][1])*f + .05, Math.random()*6]); } }
  A.lampPts.forEach(([x, y, ph])=>{ const fl = .8 + .2*Math.sin(t*9 + ph)*Math.sin(t*3.3 + ph), X = x*W, Y = y*H, L = A.R.lamps;
    g.globalAlpha = L.a*K*fl; g.drawImage(sprite('glow', L.c), X - H*.12, Y - H*.12, H*.24, H*.24);
    g.globalAlpha = K; g.fillStyle = '#2b2a22'; g.fillRect(X - H*.003, Y, H*.006, H*.05); g.fillStyle = rgba(L.c, .95*fl); g.fillRect(X - H*.008, Y - H*.016, H*.016, H*.018); });
}

// Which maps get an ambience layer of their own (2026-10-15). The eight maps that had no shader look at all, plus the two
// whose shader didn't match the place: misty Map 0 had the savanna's heat shimmer, and Gannet Cliffs the beach's foam.
// On those two the old shader layer is hidden while ours plays (it stays in the lab as variant C).
M.MAP_AMB = {m1:'mist', mo:'oldwood', mq:'clover', ms:'grove', mz:'fungal', mn:'crystal', mi:'icecave', mv:'aerie', mx:'lair', mc:'cliffs'};
M.MAP_AMB_B = {m1:'mistThick', mo:'oldwoodB', mq:'cloverB', ms:'groveB', mz:'fungalB', mn:'crystalB', mi:'icecaveB', mv:'aerieB', mx:'lairB', mc:'cliffsB'};
M.REPLACES_SHADER = new Set(['m1', 'mc']);
let curAmb = null;
// Mount (or keep) the map's own ambience on the map frame. Returns the layer or null.
M.mapAmbience = function(host, mapId, opts){
  opts = opts || {};
  const key = opts.key || (opts.variant === 'B' ? M.MAP_AMB_B : M.MAP_AMB)[mapId];
  if(curAmb && (curAmb.host !== host || curAmb.key !== key || !key)){ curAmb.layer.fadeOut(.6); curAmb = null; }
  if(host && host.classList) host.classList.toggle('fxe-noshade', !!key && M.REPLACES_SHADER.has(mapId));
  if(!host || !key) return null;
  if(curAmb && curAmb.layer && AMB_LIVE.has(curAmb.layer)){
    const cv = curAmb.layer.cv; if(cv.parentNode !== host){ const sh = host.querySelector(':scope > canvas.bw-shader-map'); if(sh && sh.nextSibling) host.insertBefore(cv, sh.nextSibling); else host.insertBefore(cv, host.firstChild); }
    return curAmb.layer;
  }
  const layer = ambience(host, key, opts); curAmb = layer ? {host, key, layer} : null; return layer;
};
M.stopMapAmbience = function(){ if(curAmb){ curAmb.layer.fadeOut(.5); if(curAmb.host && curAmb.host.classList) curAmb.host.classList.remove('fxe-noshade'); curAmb = null; } };

// ============================================================
// 2. Day and night on the map (2026-10-15, map-day-night-tint): the map art is graded by the player's clock (or the
//    atmosphere they picked): dawn blush, dusk amber, night blue with stars, and lantern pools at the fights and spots.
// ============================================================
css('tod', `
.conquest-layout > .fxe-tod{position:absolute; inset:0; z-index:0; pointer-events:none; border-radius:inherit; animation:fxeTodIn 1.6s ease both;}
.fxe-tod.tod-dawn{background:linear-gradient(180deg, rgba(255,176,150,.30), rgba(255,214,170,.12) 45%, rgba(120,130,190,.10)); mix-blend-mode:soft-light;}
.fxe-tod.tod-dawn::after{content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 45% at 20% 0%, rgba(255,214,170,.28), transparent 70%);}
.fxe-tod.tod-dusk{background:linear-gradient(180deg, rgba(255,150,80,.55), rgba(220,120,120,.45) 50%, rgba(110,80,150,.55)); mix-blend-mode:multiply;}
.fxe-tod.tod-dusk::after{content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 50% at 85% 0%, rgba(255,170,90,.32), transparent 70%); mix-blend-mode:screen;}
.fxe-tod.tod-night{background:radial-gradient(ellipse 120% 90% at 50% 45%, rgba(70,90,170,.62), rgba(30,40,90,.8)); mix-blend-mode:multiply;}
.fxe-tod.tod-night i{position:absolute; width:2px; height:2px; border-radius:50%; background:#fff; box-shadow:0 0 4px 1px rgba(200,220,255,.8); mix-blend-mode:screen; animation:fxeStar 3s ease-in-out infinite;}
.fxe-lant{position:absolute; width:120px; height:120px; margin:-60px 0 0 -60px; border-radius:50%; pointer-events:none; z-index:0;
  background:radial-gradient(circle, rgba(255,206,120,.42), rgba(255,170,80,.16) 45%, transparent 70%); animation:fxeLant 3.2s ease-in-out infinite, fxeTodIn 1.6s ease both;}
.fxe-lant.is-dusk{opacity:.55;}
@keyframes fxeTodIn{from{opacity:0;}}
@keyframes fxeStar{0%,100%{opacity:.25;} 50%{opacity:1;}}
@keyframes fxeLant{0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} 60%{transform:scale(.97);}}
.conquest-layout > .fxe-tod.is-steady, .fxe-lant.is-steady{animation-name:none;} .fxe-lant.is-steady{animation:fxeLant 3.2s ease-in-out infinite;}
.conquest-layout > .fxe-tod.is-leaving{animation:none; transition:opacity 2.6s ease; opacity:0;}
`);
// The phase the map should show: the Atmosphere setting wins (golden = dusk, moonlit = night, off = none), else the clock.
M.todNow = function(){
  let a = 'live'; try{ a = (document.body && document.body.dataset.atmo) || (typeof loadAtmosphere === 'function' ? loadAtmosphere() : 'live'); }catch(e){}
  if(a === 'off' || a === 'rain' || a === 'autumn') return 'day';
  if(a === 'golden') return 'dusk'; if(a === 'moonlit') return 'night';
  try{ return typeof currentTimeOfDay === 'function' ? currentTimeOfDay() : (typeof timeOfDay === 'function' ? timeOfDay() : 'day'); }catch(e){ return 'day'; }
};
// 2026-10-16 (user: "When it becomes night on the conquest map, clicking anything or switching maps startles the lighting."): the map
// re-renders its whole frame on every click and map switch, and this used to throw the tint away and fade a new one in from nothing
// each time (the map flashed to full day and darkened again, the lanterns and stars restarted). The tint layer now lives on across
// renders: the same phase is moved into the new frame as it is, with no fade (stars where they were, lanterns steady). It only
// changes when the phase really changes (the clock or the Atmosphere setting): then the new tint fades in over the old one, and
// night giving way to dawn or day plays M.nightRetreat. A dark map (tod null) puts the tint away and gets it back unchanged.
let todCur = null; // {tod, el}: the phase on show and its layer (kept while a dark map or the World view has it put away)
const STARS = Array.from({length:16}, (_, i)=>{ const r = k=> (Math.sin((i + 1)*(k*12.9898 + 78.233))*43758.5453) % 1, a = k=> Math.abs(r(k)); // fixed sky
  return `<i style="left:${(2 + a(1)*96).toFixed(1)}%; top:${(2 + a(2)*32).toFixed(1)}%; animation-delay:${(-a(3)*3).toFixed(2)}s; animation-duration:${(2 + a(4)*2.5).toFixed(2)}s"></i>`; }).join('');
function placeTod(host, v){ const after = host.querySelector(':scope > canvas.fxe-amb') || host.querySelector(':scope > canvas.bw-shader-map');
  if(after && after.nextSibling) host.insertBefore(v, after.nextSibling); else host.insertBefore(v, host.firstChild); }
M.dayNight = function(host, canvas, tod, opts){
  opts = opts || {};
  if(!host) return null;
  const prev = todCur, keep = prev && prev.tod === tod && prev.el && !opts.fresh ? prev.el : null;
  host.querySelectorAll(':scope > .fxe-tod:not(.is-leaving)').forEach(e=>{ if(e !== keep) e.remove(); });
  if(canvas) canvas.querySelectorAll(':scope > .fxe-lant').forEach(e=> e.remove());
  if(!tod){ if(prev && prev.el) prev.el.remove(); return null; } // a dark map: put it away, unchanged
  const changed = !!prev && prev.tod !== tod && !opts.instant && !opts.fresh;
  if(changed && prev.el){ const old = prev.el; if(old.parentNode !== host) placeTod(host, old); old.style.animation = 'none'; old.classList.add('is-steady'); void old.offsetWidth; old.classList.add('is-leaving'); later(()=> old.remove(), 2800); }
  if(changed && prev.tod === 'night' && tod !== 'dusk'){ try{ M.nightRetreat(host); }catch(e){} }
  let v = keep;
  if(v){ if(v.parentNode !== host){ v.style.animation = 'none'; placeTod(host, v); } }
  else if(tod !== 'day'){
    v = document.createElement('div'); v.className = 'fxe-tod tod-' + tod; v.setAttribute('aria-hidden', 'true');
    if(opts.instant) v.style.animation = 'none'; else { if(changed) v.style.animationDuration = '2.6s'; later(()=>{ if(todCur && todCur.el === v){ v.style.animation = 'none'; v.classList.add('is-steady'); } }, changed ? 2700 : 1700); }
    if(tod === 'night') v.innerHTML = STARS;
    placeTod(host, v);
  }
  todCur = {tod, el: v || null};
  if(canvas && (tod === 'night' || tod === 'dusk')){
    const first = canvas.firstChild, steady = !!keep || opts.instant; // lanterns only fade in with a new phase
    canvas.querySelectorAll(':scope > .map-node:not(.map-node-hidden), :scope > .map-spot:not(.is-unknown), :scope > .map-curio, :scope > .map-well').forEach((n, i)=>{
      if(!n.style.left) return; const l = document.createElement('i'); l.className = 'fxe-lant' + (tod === 'dusk' ? ' is-dusk' : '') + (steady ? ' is-steady' : ''); l.setAttribute('aria-hidden', 'true');
      l.style.left = n.style.left; l.style.top = n.style.top; l.style.animationDelay = steady ? (-i*0.7) + 's' : (-i*0.7) + 's, 0s'; canvas.insertBefore(l, first); });
  }
  return v || null;
};
// The clock moving on while the map is open (the map doesn't re-render by itself): every 20 s, a changed phase is applied in place.
let todWatch = 0;
M.watchTod = function(dark){
  M._todDark = !!dark; if(todWatch) return;
  todWatch = setInterval(()=>{ try{
    const host = document.getElementById('conquestLayout'), cv = document.getElementById('conquestCanvas');
    if(!host || !cv || !host.contains(cv) || M._todDark || !todCur || document.hidden) return;
    const now = M.todNow(); if(now !== todCur.tod) M.dayNight(host, cv, now);
  }catch(e){} }, 20000);
};
// Night retreats (2026-10-16, user: "The night->day animation: Bars on the left -> no-go. I think the whole map lighting up is
// sufficient. I was thinking of a night retreating effect - could you still do a gentle version of that, but the map changing lighting
// overall is okay. Maybe if the bars were softer and longer. And also not consistent, some of them are brighter than the other and
// very slightly (0.5%) different hue."): the whole scene lights up (the night layer itself fades, done by the caller), and over it a
// handful of long, very soft streaks of morning light drift across from the left and thin out, as if pushing the night off the far
// edge. Each streak has its own height, length, speed and brightness, and its hue is nudged up to 0.5% of the colour wheel (±1.8°)
// off the warm base, so no two match. host: the map frame (.conquest-layout) or the battlefield.
css('nightRetreat', `
.fxe-retreat{position:absolute; inset:0; overflow:hidden; pointer-events:none; border-radius:inherit; z-index:0;}
.fxe-retreat i{position:absolute; left:0; display:block; border-radius:50%; filter:blur(18px); mix-blend-mode:screen; will-change:transform, opacity;}
`);
M.nightRetreat = function(host, opts){
  opts = opts || {}; const g = G(); if(!host || !g) return Promise.resolve();
  const box = host.getBoundingClientRect(), W = Math.max(200, box.width), H = Math.max(120, box.height);
  const wrap = document.createElement('div'); wrap.className = 'fxe-retreat'; wrap.setAttribute('aria-hidden', 'true');
  if(getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const lays = host.querySelectorAll(':scope > .fxe-tod, :scope > .night-veil, :scope > .sky-fx'), anchor = lays[lays.length - 1]; // just above the night layer, under the cards and fights
  if(anchor) anchor.after(wrap); else host.insertBefore(wrap, host.firstChild);
  const n = opts.n || 8, base = opts.hue == null ? 40 : opts.hue, jobs = [];
  for(let i = 0; i < n; i++){
    const s = document.createElement('i'), h = H * rnd(.10, .24), w = W * rnd(.75, 1.25), hue = base + rnd(-1.8, 1.8), light = rnd(76, 88), peak = rnd(.26, .58); // some streaks clearly brighter than others
    s.style.cssText = `top:${(H * (i + rnd(.1, .9)) / n - h/2).toFixed(0)}px; width:${w.toFixed(0)}px; height:${h.toFixed(0)}px;
      background:radial-gradient(ellipse 50% 50% at 55% 50%, hsla(${hue.toFixed(2)}, 92%, ${light.toFixed(1)}%, 1), hsla(${hue.toFixed(2)}, 90%, ${(light - 6).toFixed(1)}%, .45) 45%, hsla(${hue.toFixed(2)}, 90%, 70%, 0) 72%);`;
    wrap.appendChild(s);
    const dur = rnd(2.8, 4.0) * (opts.speed || 1), delay = rnd(0, .9);
    jobs.push(new Promise(res=> g.timeline({delay, onComplete:res})
      .fromTo(s, {x:-w*.9, opacity:0, scaleY:rnd(.8, 1.1)}, {x:W*.85, duration:dur, ease:'sine.inOut'})
      .to(s, {opacity:peak, duration:dur*.35, ease:'sine.out'}, 0)
      .to(s, {opacity:0, duration:dur*.45, ease:'sine.in'}, dur*.55)));
  }
  return Promise.all(jobs).then(()=> wrap.remove());
};
M.dayNight_B = (host, canvas)=> M.dayNight(host, canvas, 'dusk');
M.dayNight_C = (host, canvas)=> M.dayNight(host, canvas, 'night');

// ============================================================
// 3. Weather fronts (2026-10-15, map-weather-fronts): now and then a band of weather crosses the map and moves on: rain on
//    green and wet maps, snow on the cold ones, an ash flurry on the burnt ones, a sand gust on the savanna, fog elsewhere.
// ============================================================
const FRONT_OF = {forest:'rain', meadow:'rain', water:'rain', swamp:'fogfront', reef:'fogfront', beach:'rain', tundra:'snow', alpine:'snow', ash:'ashfront', forge:'ashfront', savanna:'sandfront', cave:null};
M.FRONT_OF = FRONT_OF;
M.weatherFront = function(host, kind, opts){ opts = opts || {}; return ambience(host, kind || 'rain', Object.assign({duration:opts.duration, fadeIn:.8, scale:.6}, opts)); };

// ============================================================
// 4. Node states (2026-10-15): every fight on the map shows what it is at a glance, and moves a little.
//    available: a soft beckoning ring · locked: brambles hold it shut · boss: menace (red breath, heartbeat, smoke for
//    world bosses) · raid: tentacles sway behind it · dungeon: a dark doorway with two torches · elite: a slow laurel ring.
// ============================================================
css('nodes', `
.fxe-nd{position:absolute; transform:translate(-50%,-50%); pointer-events:none; z-index:0;}
.fxe-beckon{width:68px; height:68px;}
.fxe-beckon::before, .fxe-beckon::after{content:''; position:absolute; inset:0; border-radius:50%; border:3px solid rgba(255,228,130,1); box-shadow:0 0 14px rgba(255,205,100,.9), inset 0 0 10px rgba(255,220,130,.6); animation:fxeBeckon 2.6s ease-out infinite;}
.fxe-beckon::after{animation-delay:1.3s;}
@keyframes fxeBeckon{0%{transform:scale(.72); opacity:0;} 12%{opacity:1;} 100%{transform:scale(1.6); opacity:0;}}
.map-node .fxe-chev{position:absolute; left:50%; top:-24px; margin-left:-7px; width:14px; height:12px; pointer-events:none; background:#ffe08a; clip-path:polygon(0 0, 100% 0, 50% 100%); filter:drop-shadow(0 2px 2px rgba(0,0,0,.5)); animation:fxeChev 1.2s ease-in-out infinite;}
@keyframes fxeChev{0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);}}
.fxe-bramble{width:80px; height:80px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5)); animation:fxeBrSway 6s ease-in-out infinite;}
.fxe-bramble svg{width:100%; height:100%; overflow:visible;}
@keyframes fxeBrSway{0%,100%{transform:translate(-50%,-50%) rotate(-4deg);} 50%{transform:translate(-50%,-50%) rotate(4deg);}}
.map-node-hidden.fxe-locked .map-node-lock{animation:fxeLockGlint 5s ease-in-out infinite; display:inline-block;}
@keyframes fxeLockGlint{0%,86%,100%{filter:none; transform:rotate(0);} 90%{filter:brightness(1.8) drop-shadow(0 0 4px #fff2b0); transform:rotate(-12deg);} 94%{transform:rotate(10deg);}}
.fxe-wisps{width:84px; height:60px;}
.fxe-wisps i{position:absolute; width:44px; height:20px; border-radius:50%; background:radial-gradient(ellipse, rgba(235,240,245,.75), transparent 70%); animation:fxeWisp 7s ease-in-out infinite;}
.fxe-wisps i:nth-child(2){left:36px; top:30px; animation-delay:-3.5s;} .fxe-wisps i:nth-child(3){left:6px; top:36px; animation-delay:-1.8s;}
@keyframes fxeWisp{0%,100%{transform:translateX(-8px); opacity:.25;} 50%{transform:translateX(10px); opacity:.85;}}
.fxe-menace{width:124px; height:124px; border-radius:50%; background:radial-gradient(circle, rgba(235,40,25,.8), rgba(160,12,10,.4) 42%, transparent 70%); animation:fxeMenace 2.4s ease-in-out infinite;}
@keyframes fxeMenace{0%,100%{transform:translate(-50%,-50%) scale(.85); opacity:.65;} 14%{transform:translate(-50%,-50%) scale(1.05); opacity:1;} 28%{transform:translate(-50%,-50%) scale(.92); opacity:.75;} 42%{transform:translate(-50%,-50%) scale(1.08); opacity:1;}}
.map-node.fxe-boss .map-node-ico{display:inline-block; animation:fxeBeat 2.4s ease-in-out infinite;}
@keyframes fxeBeat{0%,100%{transform:scale(1);} 14%{transform:scale(1.12);} 28%{transform:scale(.98);} 42%{transform:scale(1.14);}}
.map-node .fxe-ember{position:absolute; left:50%; bottom:40%; width:4px; height:4px; border-radius:50%; background:#ffb36a; box-shadow:0 0 6px 2px rgba(255,90,30,.8); pointer-events:none; animation:fxeEmber 2.8s linear infinite; opacity:0;}
@keyframes fxeEmber{0%{opacity:0; transform:translate(0,0);} 15%{opacity:1;} 100%{opacity:0; transform:translate(var(--dx, 8px), -46px);}}
.map-node .fxe-smoke{position:absolute; left:50%; top:10%; width:22px; height:22px; margin-left:-11px; border-radius:50%; pointer-events:none; background:radial-gradient(circle, rgba(30,22,22,.85), rgba(60,50,50,.4) 45%, transparent 70%); animation:fxeSmoke 3.6s ease-out infinite; opacity:0;}
@keyframes fxeSmoke{0%{opacity:0; transform:translate(0,0) scale(.5);} 20%{opacity:.85;} 100%{opacity:0; transform:translate(var(--dx, 6px), -54px) scale(2.2);}}
.fxe-pennant{width:92px; height:70px;}
.fxe-pennant i{position:absolute; top:4px; width:3px; height:40px; background:#5a3b1c; border-radius:2px;}
.fxe-pennant i::after{content:''; position:absolute; left:3px; top:0; width:22px; height:14px; background:linear-gradient(#c62828, #8e1a1a); clip-path:polygon(0 0, 100% 50%, 0 100%); transform-origin:0 50%; animation:fxeFlag 1.1s ease-in-out infinite;}
.fxe-pennant i:first-child{left:4px; transform:rotate(-18deg);} .fxe-pennant i:last-child{right:4px; transform:rotate(18deg) scaleX(-1);}
@keyframes fxeFlag{0%,100%{transform:skewY(-6deg) scaleX(1);} 50%{transform:skewY(6deg) scaleX(.86);}}
.fxe-tent{width:150px; height:140px; filter:drop-shadow(0 0 6px rgba(190,120,255,.55));}
.fxe-tent svg{width:100%; height:100%; overflow:visible;}
.fxe-tent path{transform-box:fill-box; transform-origin:50% 100%; animation:fxeTent 3.4s ease-in-out infinite;}
.fxe-tent path:nth-child(2){animation-delay:-1.1s;} .fxe-tent path:nth-child(3){animation-delay:-2.2s;} .fxe-tent path:nth-child(4){animation-delay:-.6s;}
@keyframes fxeTent{0%,100%{transform:rotate(-7deg);} 50%{transform:rotate(7deg);}}
.fxe-door{width:100px; height:100px; border-radius:50%; background:radial-gradient(circle, rgba(10,4,16,.75) 30%, transparent 31%), conic-gradient(from 0deg, rgba(20,10,30,.1), rgba(40,12,70,.9), rgba(20,10,30,.1), rgba(90,30,120,.8), rgba(20,10,30,.1)); animation:fxeSpin 9s linear infinite; -webkit-mask:radial-gradient(circle, #000 55%, transparent 70%); mask:radial-gradient(circle, #000 55%, transparent 70%);}
@keyframes fxeSpin{to{transform:translate(-50%,-50%) rotate(360deg);}}
.map-node .fxe-torch{position:absolute; top:-8px; width:11px; height:16px; border-radius:50% 50% 40% 40%; pointer-events:none; background:radial-gradient(circle at 50% 70%, #fff3b0, #ffa53a 50%, rgba(255,80,20,0) 75%); filter:drop-shadow(0 0 6px rgba(255,150,50,.9)); animation:fxeFlick .18s steps(2) infinite alternate;}
.map-node .fxe-torch.l{left:-6px;} .map-node .fxe-torch.r{right:-6px; animation-delay:.07s;}
@keyframes fxeFlick{from{transform:scale(1,1); opacity:.9;} to{transform:scale(.85,1.15); opacity:1;}}
.fxe-laurel{width:76px; height:76px; border-radius:50%; border:3px dashed rgba(214,186,255,1); box-shadow:0 0 14px rgba(170,120,255,.75), inset 0 0 10px rgba(170,120,255,.5); animation:fxeSpin 14s linear infinite;}
.map-node .fxe-glint{position:absolute; right:-2px; top:-2px; width:12px; height:12px; pointer-events:none; background:#fff; clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%); animation:fxeGlint 3.2s ease-in-out infinite; opacity:0;}
@keyframes fxeGlint{0%,70%,100%{opacity:0; transform:scale(.3) rotate(0);} 80%{opacity:1; transform:scale(1.2) rotate(45deg);} 90%{opacity:0; transform:scale(.6) rotate(90deg);}}
`);
const BOSSY = /\bkind-(boss|finalboss|worldboss|subboss|miniboss|megaraid)\b/;
function sib(node, cls, html){
  const d = document.createElement('span'); d.className = 'fxe-nd ' + cls; d.setAttribute('aria-hidden', 'true'); if(html) d.innerHTML = html;
  d.style.left = node.style.left; d.style.top = node.style.top; node.parentNode.insertBefore(d, node); return d;
}
function kid(node, cls, n, style){ for(let i = 0; i < (n || 1); i++){ const k = document.createElement('i'); k.className = cls; k.setAttribute('aria-hidden', 'true'); if(style) k.setAttribute('style', style(i)); node.appendChild(k); } }
const BRAMBLE_SVG = `<svg viewBox="-40 -40 80 80"><g fill="none" stroke="#6b4423" stroke-width="4.6" stroke-linecap="round"><path d="M-30 6 C-26 -22 6 -34 26 -16 C34 -6 30 14 16 26 C2 34 -22 30 -30 6"/><path d="M-24 -14 C-6 -30 22 -26 30 2" stroke="#8a5a2e" stroke-width="3"/><path d="M-30 6 C-26 -22 6 -34 26 -16" stroke="#b07a42" stroke-width="1.2"/></g>
  <g fill="#3e2610">${[[-30,6],[-20,-20],[0,-31],[20,-22],[31,-4],[26,14],[10,28],[-12,29],[-27,18]].map(([x,y])=> `<path d="M${x} ${y} l${x>0?4:-4} ${y>0?3:-3} l${x>0?-1:1} ${y>0?-5:5}z"/>`).join('')}</g>
  <g fill="#5d8a3a">${[[-28,-6],[12,-30],[30,8],[-6,31]].map(([x,y])=> `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.2" transform="rotate(${x*3} ${x} ${y})"/>`).join('')}</g></svg>`;
const TENTACLE_SVG = `<svg viewBox="-60 -60 120 120"><g fill="#4a2466" stroke="#b07ad8" stroke-width="1.6">
  <path d="M-30 40 C-46 10 -40 -18 -24 -38 C-30 -14 -26 8 -18 40Z"/><path d="M30 40 C46 6 42 -22 22 -42 C30 -16 26 8 18 40Z"/><path d="M-6 44 C-14 18 -4 -8 6 -50 C10 -20 8 14 6 44Z"/></g>
  <g fill="#c58cff" opacity=".55">${[[-34,-6],[-30,14],[34,-10],[30,12],[2,-24],[4,4]].map(([x,y])=> `<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g></svg>`;
// A node's look by state; `which` forces a variant (A/B/C) for the lab.
M.nodeAvailable = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-avail'); return sib(node, 'fxe-beckon'); };
M.nodeAvailable_B = function(node){ if(!node) return; node.classList.add('fxe-avail'); kid(node, 'fxe-chev'); };
M.nodeLocked = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-locked'); return sib(node, 'fxe-bramble', BRAMBLE_SVG); };
M.nodeLocked_B = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-locked'); return sib(node, 'fxe-wisps', '<i></i><i></i><i></i>'); };
M.nodeBoss = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-boss'); sib(node, 'fxe-menace'); kid(node, 'fxe-ember', 3, i=> `--dx:${[-10, 4, 12][i]}px; animation-delay:${-i*0.95}s; margin-left:${[-10, 2, 8][i]}px`); };
M.nodeBoss_B = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-boss'); sib(node, 'fxe-menace'); kid(node, 'fxe-smoke', 3, i=> `--dx:${[-12, 2, 14][i]}px; animation-delay:${-i*1.2}s`); };
M.nodeBoss_C = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-boss'); sib(node, 'fxe-pennant', '<i></i><i></i>'); sib(node, 'fxe-menace'); };
M.nodeRaid = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-raid'); sib(node, 'fxe-tent', TENTACLE_SVG); kid(node, 'fxe-glint'); };
M.nodeDungeon = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-dungeon'); sib(node, 'fxe-door'); kid(node, 'fxe-torch l'); kid(node, 'fxe-torch r'); };
M.nodeElite = function(node){ if(!node || !node.parentNode) return; node.classList.add('fxe-elite'); sib(node, 'fxe-laurel'); kid(node, 'fxe-glint'); };
// Dress every node on a map canvas by its state (in-game: hooks.mapShown). Cleared nodes stay quiet.
M.decorateNodes = function(canvas){
  if(!canvas) return;
  canvas.querySelectorAll(':scope > .fxe-nd').forEach(e=> e.remove());
  canvas.querySelectorAll('.map-node .fxe-chev, .map-node .fxe-ember, .map-node .fxe-smoke, .map-node .fxe-torch, .map-node .fxe-glint').forEach(e=> e.remove());
  const nodes = [...canvas.querySelectorAll(':scope > .map-node')];
  let firstOpen = null;
  nodes.forEach(n=>{
    if(n.classList.contains('kind-tutorial') || !n.style.left) return;
    if(n.classList.contains('map-node-hidden')){ M.nodeLocked(n); return; }
    if(n.classList.contains('done')) return;
    const c = n.className;
    if(/\bkind-(raidboss|megaraid|worldboss)\b/.test(c)) M.nodeRaid(n);
    else if(BOSSY.test(c)) (/\bkind-(worldboss|finalboss)\b/.test(c) ? M.nodeBoss_B : M.nodeBoss)(n);
    else if(/\bkind-dungeon\b/.test(c) || canvas.classList.contains('endless-map')) M.nodeDungeon(n);
    else if(/\bkind-(elite|champion)\b/.test(c)) M.nodeElite(n);
    if(!firstOpen) firstOpen = n;
    if(!/\bkind-(raidboss|megaraid|worldboss)\b/.test(c)) M.nodeAvailable(n);
  });
  return firstOpen;
};

// ============================================================
// 5. Coming back to the map (2026-10-15): the fight you won gets stamped, the trail inks itself to what opened, a chance
//    fight rustles out of the bushes, a side map surfaces, and a cleared map gets its banner.
// ============================================================
css('return', `
.fxe-seal{display:grid; place-items:center; border-radius:50%; z-index:1220;
  background:radial-gradient(circle at 38% 32%, #e2574c, #b32a22 45%, #7d1712 80%); box-shadow:0 0 0 3px rgba(150,30,25,.55), 0 4px 10px rgba(0,0,0,.45), inset 0 -4px 8px rgba(0,0,0,.35), inset 0 3px 6px rgba(255,180,160,.35);}
.fxe-seal::before{content:''; position:absolute; inset:-5px; border-radius:46% 54% 50% 48% / 52% 46% 54% 48%; background:inherit; z-index:-1; filter:blur(.4px);}
.fxe-seal b{font:900 22px/1 'Baloo 2',system-ui,sans-serif; color:#ffd9c9; text-shadow:0 -1px 0 rgba(0,0,0,.45), 0 1px 0 rgba(255,220,200,.5);}
.fxe-ink svg{width:100%; height:100%; overflow:visible;}
.fxe-ink path{fill:none; stroke:#2a1c12; stroke-width:5; stroke-linecap:round; stroke-linejoin:round; filter:drop-shadow(0 0 2px rgba(255,240,210,.9));}
.fxe-rank{z-index:1225; display:grid; place-items:center; font:900 16px/1 'Baloo 2',system-ui,sans-serif; border-radius:9px; color:#2b1d08; overflow:hidden;
  background:linear-gradient(160deg, #fff1b8, #e9b949 55%, #b9821c); box-shadow:0 0 0 2px #7a5212, 0 4px 10px rgba(0,0,0,.4);}
.fxe-rank.r-B{background:linear-gradient(160deg, #f0c9a0, #b9773c 60%, #7d4a1d); color:#fff3e4;} .fxe-rank.r-A{background:linear-gradient(160deg, #ffffff, #c9d2dc 55%, #8a96a3);}
.fxe-rank.r-SSS{background:linear-gradient(120deg, #ffb3d9, #ffe58a, #9cf2ff, #c7a6ff); animation:fxeHue 1.2s linear infinite;}
.fxe-rank::after{content:''; position:absolute; inset:-40% auto -40% -60%; width:40%; background:linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent); transform:skewX(-20deg); animation:fxeShine 1.1s .25s ease-out both;}
@keyframes fxeShine{from{left:-60%;} to{left:140%;}}
@keyframes fxeHue{to{filter:hue-rotate(360deg);}}
.fxe-trail{position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible;}
.fxe-trail .fxe-tl{fill:none; stroke:#fff1c2; stroke-width:1.05; stroke-linecap:round; filter:drop-shadow(0 0 1.4px rgba(255,210,120,.95));}
.fxe-nib{position:absolute; width:12px; height:12px; margin:-6px 0 0 -6px; border-radius:50%; pointer-events:none; z-index:5; background:radial-gradient(circle, #fff, #ffe08a 45%, rgba(255,200,90,0) 72%); box-shadow:0 0 12px 4px rgba(255,214,120,.8);}
.fxe-step{position:absolute; width:7px; height:10px; margin:-5px 0 0 -3.5px; border-radius:50%; background:rgba(40,26,14,.8); box-shadow:0 0 0 1px rgba(255,240,210,.35); pointer-events:none; z-index:3;}
.fxe-bush{position:absolute; font-size:22px; line-height:1; pointer-events:none; z-index:7; transform:translate(-50%,-50%); filter:drop-shadow(0 2px 2px rgba(0,0,0,.4));}
.fxe-banner{z-index:1230; display:flex; flex-direction:column; align-items:center; pointer-events:none;}
.fxe-banner .fb-rib{position:relative; padding:9px 34px 11px; font:900 clamp(20px,4.6vw,30px)/1 'Baloo 2',system-ui,sans-serif; letter-spacing:.02em; color:#fff6dc; text-shadow:0 2px 0 #6e1410, 0 0 12px rgba(255,200,120,.6); white-space:nowrap;
  background:linear-gradient(180deg, #d8463b, #a3231b 70%, #7a1610); box-shadow:0 6px 14px rgba(0,0,0,.4), inset 0 2px 0 rgba(255,190,170,.45), inset 0 -3px 0 rgba(0,0,0,.25); border-top:3px solid #f1c65a; border-bottom:3px solid #f1c65a;}
.fxe-banner .fb-rib::before, .fxe-banner .fb-rib::after{content:''; position:absolute; top:10px; width:30px; height:100%; background:#8a1b14; z-index:-1;}
.fxe-banner .fb-rib::before{left:-22px; clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%, 30% 50%);} .fxe-banner .fb-rib::after{right:-22px; clip-path:polygon(0 0, 100% 0, 70% 50%, 100% 100%, 0 100%);}
.fxe-banner .fb-sub{margin-top:6px; font:800 14px/1.2 'Baloo 2',system-ui,sans-serif; color:#fff3d0; text-shadow:0 1px 3px rgba(0,0,0,.85); white-space:nowrap;}
.fxe-glow{z-index:1205; border-radius:14px; background:radial-gradient(ellipse at 50% 45%, rgba(255,246,210,.55), rgba(255,220,140,.18) 50%, transparent 75%); mix-blend-mode:screen;}
.fxe-newmap{z-index:1226; font:900 13px/1 'Baloo 2',system-ui,sans-serif; color:#2b1d08; background:#ffe08a; padding:4px 8px; border-radius:99px; box-shadow:0 3px 8px rgba(0,0,0,.4); white-space:nowrap;}
.fxe-scale{z-index:1240; display:grid; place-items:center; align-content:center; perspective:600px;}
.fxe-scale::before{content:''; position:absolute; inset:-60px; border-radius:50%; z-index:-1; background:radial-gradient(circle, rgba(20,4,2,.82) 30%, rgba(20,4,2,.5) 55%, transparent 72%);}
.fxe-scale .fs-s{width:86px; height:100px; border-radius:50% 50% 50% 50% / 38% 38% 62% 62%; position:relative; transform-style:preserve-3d;
  background:radial-gradient(ellipse at 35% 25%, #ffb59a, #d43a1f 38%, #7d150a 75%, #3f0904); box-shadow:0 0 0 3px #f1c65a, 0 0 30px rgba(255,80,40,.75), inset 0 -10px 16px rgba(0,0,0,.4);}
.fxe-scale .fs-s::before{content:''; position:absolute; left:50%; top:12%; bottom:14%; width:3px; margin-left:-1.5px; background:linear-gradient(#ffd7a8, rgba(255,200,150,0)); border-radius:2px;}
.fxe-scale .fs-s::after{content:''; position:absolute; inset:0; border-radius:inherit; background:linear-gradient(115deg, transparent 35%, rgba(255,240,220,.85) 48%, transparent 60%); background-size:250% 100%; animation:fxeSweep 1.2s .5s ease-in-out both;}
@keyframes fxeSweep{from{background-position:120% 0;} to{background-position:-60% 0;}}
.fxe-scale .fs-n{margin-top:12px; font:900 22px/1 'Baloo 2',system-ui,sans-serif; color:#fff2d6; text-shadow:0 2px 0 #5e100c, 0 0 10px rgba(255,90,40,.8);}
.fxe-scale .fs-l{margin-top:4px; font:800 13px/1 'Baloo 2',system-ui,sans-serif; color:#ffe2b8; text-shadow:0 1px 3px rgba(0,0,0,.9);}
.fxe-fog{position:fixed; width:60px; height:34px; border-radius:50%; background:radial-gradient(ellipse, rgba(240,244,248,.95), rgba(240,244,248,.5) 45%, transparent 70%); z-index:1215;}
`);
// The fight you just won: a wax seal stamps it (with your rank in the wax), a puff of leaves.
M.nodeCleared = function(node, opts){
  opts = opts || {}; const g = G(); if(!node || !g) return Promise.resolve();
  const c = centre(node), size = Math.max(40, Math.min(64, c.w*1.0)), seal = overlayAt(node, 'fxe-seal', `<b>${opts.rank || '✓'}</b>`, size, size);
  const ico = node.querySelector('.map-node-ico');
  return new Promise(res=> g.timeline({onComplete:()=>{ seal.remove(); if(ico) g.set(ico, {clearProps:'transform'}); opts.onDone && opts.onDone(); res(); }})
    .fromTo(seal, {scale:2.6, rotation:-28, opacity:0, y:-26}, {scale:1, rotation:-8, opacity:1, y:0, duration:.26, ease:'power3.in'})
    .add(()=>{ sound('woodKnock'); ring(c.x, c.y, '#f1c65a', size*2.1, .55); burst(c.x, c.y, ['🍃','🍂','🍃','🌿','🍃','🍂'], {dist:size*.9, dur:.65, size:13});
      if(ico) g.fromTo(ico, {scale:.75}, {scale:1, duration:.4, ease:'back.out(3)'}); opts.onImpact && opts.onImpact(); })
    .to(seal, {scale:1.08, duration:.08, yoyo:true, repeat:1})
    .to(seal, {x:c.w*.36, y:-c.h*.36, scale:.32, opacity:0, duration:.4, ease:'power2.in'}, '+=.42'));
};
// B: an ink tick drawn by a quick nib, with a spatter.
M.nodeCleared_B = function(node, opts){
  opts = opts || {}; const g = G(); if(!node || !g) return Promise.resolve();
  const c = centre(node), size = Math.max(44, c.w*1.15), o = overlayAt(node, 'fxe-ink', '<svg viewBox="0 0 40 40"><path d="M8 21 L17 30 L33 9"/></svg>', size, size), p = o.querySelector('path');
  const L = 40; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; sound('pageTurn');
  return new Promise(res=> g.timeline({onComplete:()=>{ o.remove(); opts.onDone && opts.onDone(); res(); }})
    .to(p, {strokeDashoffset:0, duration:.34, ease:'power2.in'})
    .add(()=>{ burst(c.x + size*.3, c.y - size*.3, ['•','•','•','•','•'], {dist:size*.45, dur:.4, size:10, cls:'fxe-inkdot', fall:4}); opts.onImpact && opts.onImpact(); })
    .to(o, {opacity:0, duration:.35}, '+=.6'));
};
css('inkdot', `.fxe-inkdot{color:#2a1c12; text-shadow:none;}`);
// The rank you earned pops above the node and shines (gold for S and up, prismatic for SSS).
M.nodeRank = function(node, rank, opts){
  opts = opts || {}; const g = G(); if(!node || !g || !rank) return Promise.resolve();
  const c = centre(node), w = 18 + String(rank).length*9, chip = layer('fxe-rank r-' + rank, rank);
  Object.assign(chip.style, {left:(c.x - w/2) + 'px', top:(c.y - c.h/2 - 30) + 'px', width:w + 'px', height:'24px'});
  if(/S/.test(rank)) sound('rareRise', false);
  return new Promise(res=> g.timeline({onComplete:()=>{ chip.remove(); res(); }})
    .fromTo(chip, {scale:0, y:14}, {scale:1, y:0, duration:.32, ease:'back.out(2.6)'})
    .add(()=>{ if(/S/.test(rank)) burst(c.x, c.y - c.h/2 - 18, ['✦','✧','✦','✧'], {dist:26, dur:.5, size:10}); })
    .to(chip, {y:-16, opacity:0, duration:.45, ease:'power1.in'}, '+=.9'));
};
// Map % ↔ screen helpers for the trail (the trail svg is viewBox 0..100 with preserveAspectRatio none).
const toScreen = (cv, x, y)=>{ const r = cv.getBoundingClientRect(); return {x:r.left + x/100*r.width, y:r.top + y/100*r.height}; };
function trailOverlay(canvas, shape){
  const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'fxe-trail'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
  const el = shape.cloneNode(true); el.removeAttribute('style'); el.setAttribute('class', 'fxe-tl'); svg.appendChild(el);
  const t = canvas.querySelector(':scope > .map-trail-svg'); if(t && t.nextSibling) canvas.insertBefore(svg, t.nextSibling); else canvas.appendChild(svg);
  return {svg, el};
}
function popNode(node, g){
  if(!node || !g) return;
  const ico = node.querySelector('.map-node-ico'), c = centre(node);
  ring(c.x, c.y, '#fff1c2', c.w*2.2, .6);
  if(ico) g.fromTo(ico, {scale:.3}, {scale:1, duration:.5, ease:'back.out(3)', clearProps:'transform'});
}
// The trail inks itself from the fight you won to the one that just opened; a bright nib leads.
M.trailDraw = function(canvas, shape, toNode, opts){
  opts = opts || {}; const g = G(); if(!canvas || !shape || !g) return Promise.resolve();
  const {svg, el} = trailOverlay(canvas, shape), L = el.getTotalLength ? el.getTotalLength() : 40;
  const was = shape.style.opacity; shape.style.opacity = '0';
  el.style.strokeDasharray = L + ' ' + L; el.style.strokeDashoffset = L;
  const nib = document.createElement('i'); nib.className = 'fxe-nib'; nib.setAttribute('aria-hidden', 'true'); canvas.appendChild(nib);
  const o = {p:0}, place = ()=>{ const pt = el.getPointAtLength(L*o.p); nib.style.left = pt.x + '%'; nib.style.top = pt.y + '%'; };
  place(); sound('mapUnroll');
  return new Promise(res=> g.timeline({onComplete:()=>{ svg.remove(); nib.remove(); shape.style.opacity = was; res(); }})
    .to(o, {p:1, duration:opts.dur || .8, ease:'power1.inOut', onUpdate:()=>{ el.style.strokeDashoffset = L*(1 - o.p); place(); }})
    .add(()=>{ popNode(toNode, g); sound('pawnStep'); })
    .to(nib, {scale:2.4, opacity:0, duration:.3}, '<')
    .to(svg, {opacity:0, duration:.5}, '+=.25'));
};
// B: little footprints walk the new path.
M.trailDraw_B = function(canvas, shape, toNode){
  const g = G(); if(!canvas || !shape || !g) return Promise.resolve();
  const L = shape.getTotalLength ? shape.getTotalLength() : 40, n = Math.max(4, Math.min(14, Math.round(L/4))), steps = [];
  for(let i = 1; i < n; i++){ const a = shape.getPointAtLength(L*i/n), b = shape.getPointAtLength(Math.min(L, L*i/n + .5)), ang = Math.atan2(b.y - a.y, b.x - a.x), side = i % 2 ? 1 : -1;
    const s = document.createElement('i'); s.className = 'fxe-step'; s.setAttribute('aria-hidden', 'true'); s.style.left = (a.x - Math.sin(ang)*side*.7) + '%'; s.style.top = (a.y + Math.cos(ang)*side*1.1) + '%';
    s.style.transform = `rotate(${ang*57.3 + 90}deg)`; s.style.opacity = 0; canvas.appendChild(s); steps.push(s); }
  return new Promise(res=> g.timeline({onComplete:()=>{ steps.forEach(s=> s.remove()); res(); }})
    .to(steps, {opacity:1, duration:.08, stagger:{each:.09, onStart:()=> sound('pawnStep')}})
    .add(()=> popNode(toNode, g))
    .to(steps, {opacity:0, duration:.4, stagger:.03}, '+=.5'));
};
// C: a firefly flies the new path and lights the fight.
M.trailDraw_C = function(canvas, shape, toNode){
  const g = G(); if(!canvas || !shape || !g) return Promise.resolve();
  const L = shape.getTotalLength ? shape.getTotalLength() : 40, nib = document.createElement('i'); nib.className = 'fxe-nib'; canvas.appendChild(nib);
  const o = {p:0}; let last = 0;
  return new Promise(res=> g.timeline({onComplete:()=>{ nib.remove(); res(); }})
    .to(o, {p:1, duration:1, ease:'sine.inOut', onUpdate:()=>{ const pt = shape.getPointAtLength(L*o.p); nib.style.left = (pt.x + Math.sin(o.p*20)*1.2) + '%'; nib.style.top = (pt.y + Math.cos(o.p*17)*1.6) + '%';
      if(o.p - last > .07){ last = o.p; const r = nib.getBoundingClientRect(); const s = bit(r.left + 6, r.top + 6, '', 'fxe-dot'); g.to(s, {scale:.2, opacity:0, duration:.6, onComplete:()=> s.remove()}); } }})
    .add(()=>{ popNode(toNode, g); sound('readyChime'); })
    .to(nib, {scale:3, opacity:0, duration:.35}, '<'));
};
// A hidden "chance" fight is found: the bushes round it rustle, then it pops up.
M.chanceNode = function(node){
  const g = G(), cv = canvasOf(node); if(!node || !g || !cv) return Promise.resolve();
  const x = parseFloat(node.style.left), y = parseFloat(node.style.top), bushes = [];
  [[-4, 1], [4, 2], [0, -3]].forEach(([dx, dy])=>{ const b = document.createElement('span'); b.className = 'fxe-bush'; b.textContent = '🌿'; b.style.left = (x + dx) + '%'; b.style.top = (y + dy) + '%'; cv.appendChild(b); bushes.push(b); });
  g.set(node, {opacity:0}); sound('featherFlutter');
  return new Promise(res=> g.timeline({onComplete:()=>{ bushes.forEach(b=> b.remove()); g.set(node, {clearProps:'opacity'}); res(); }})
    .to(bushes, {rotation:14, duration:.07, yoyo:true, repeat:7, ease:'sine.inOut', stagger:.04})
    .add(()=>{ const c = centre(node); burst(c.x, c.y, ['🍃','🌿','🍃','🍂','🌿'], {dist:40, dur:.6}); sound('mysteryBoing'); })
    .to(bushes, {scale:.4, opacity:0, y:12, duration:.3, stagger:.04})
    .to(node, {opacity:1, duration:.15}, '<')
    .add(()=> popNode(node, g), '<'));
};
// A side map turns up (days later, or after a quest): its entrance surfaces from the ground with a dust ring.
M.lateSideMap = function(el){
  const g = G(); if(!el || !g) return Promise.resolve();
  const c = centre(el); sound('earthquakeTone');
  ring(c.x, c.y + c.h*.3, '#d8c7a0', c.w*2.4, .8);
  // it rises out of the ground: a clip opening from the bottom up (no transforms, so the emblem's own bob keeps running)
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(el, {clearProps:'clipPath,filter,opacity'}); res(); }})
    .fromTo(el, {opacity:0, clipPath:'inset(100% -60% -20% -60%)', filter:'brightness(.4)'}, {opacity:1, clipPath:'inset(-60% -60% -20% -60%)', filter:'brightness(1)', duration:.8, ease:'power2.out'})
    .add(()=>{ burst(c.x, c.y + c.h*.35, ['•','•','•','•','•','•','•'], {dist:44, dur:.6, size:12, cls:'fxe-dust', from:Math.PI, spread:Math.PI, fall:0}); }, .1)
    .add(()=>{ sound('unlockChime'); burst(c.x, c.y - c.h*.2, ['✦','✧','✦'], {dist:30, dur:.5, size:12}); }, .6));
};
css('dust', `.fxe-dust{color:#cdb894; text-shadow:none; font-size:16px;}`);
// The whole map is cleared: the art brightens, a banner unfurls, the biome's critters gather round, petals fly.
M.mapCleared = function(canvas, opts){
  opts = opts || {}; const g = G(); if(!canvas || !g) return Promise.resolve();
  const lay = layoutOf(canvas) || canvas, rr = canvas.getBoundingClientRect(), cx = rr.left + rr.width/2, top = rr.top + Math.min(rr.height*.3, 150);
  const glow = overlayAt(lay, 'fxe-glow'), ban = layer('fxe-at fxe-banner', `<div class="fb-rib">${opts.title || 'Map cleared!'}</div>${opts.name ? `<div class="fb-sub">${opts.name}</div>` : ''}`);
  ban.style.left = cx + 'px'; ban.style.top = top + 'px'; g.set(ban, {xPercent:-50, yPercent:-50});
  const rib = ban.querySelector('.fb-rib'), sub = ban.querySelector('.fb-sub');
  const crit = opts.critters || ['🐝','🦋','🐞','🐿️','🦔','🐦'], walkers = [];
  crit.slice(0, 6).forEach((e, i)=>{ const side = i % 2 ? 1 : -1, b = bit(cx + side*(rr.width/2 + 20), rr.top + rr.height*(.55 + (i % 3)*.12), e, 'fxe-crit', 22); walkers.push({b, side, i}); });
  sound('leaderFanfare');
  return new Promise(res=>{
    const tl = g.timeline({onComplete:()=>{ glow.remove(); ban.remove(); walkers.forEach(w=> w.b.remove()); opts.onDone && opts.onDone(); res(); }});
    tl.fromTo(glow, {opacity:0}, {opacity:1, duration:.35, ease:'power1.out'})
      .fromTo(rib, {clipPath:'inset(-30px 50% -30px 50%)', scaleY:.6}, {clipPath:'inset(-30px -60px -30px -60px)', scaleY:1, duration:.5, ease:'power3.out', clearProps:'clipPath'}, .1);
    if(sub) tl.fromTo(sub, {opacity:0, y:-8}, {opacity:1, y:0, duration:.3}, .45);
    tl.add(()=>{ burst(cx, top, ['🌸','🍃','✨','🌼','🍂','✨','🌸','🍃','🌼','✨'], {dist:110, dur:1.1, size:16, lift:10, fall:40}); sound('gold'); }, .45);
    walkers.forEach(w=>{ const tx = cx + w.side*(28 + w.i*14), ty = rr.top + rr.height*.62;
      g.set(w.b, {xPercent:-50, yPercent:-50, scaleX:w.side > 0 ? 1 : -1});
      tl.to(w.b, {x:tx - (cx + w.side*(rr.width/2 + 20)), y:ty - parseFloat(w.b.style.top), duration:.9, ease:'power1.out'}, .3 + w.i*.06)
        .to(w.b, {y:'-=14', duration:.14, yoyo:true, repeat:3, ease:'power1.out'}, 1.25 + w.i*.03)
        .to(w.b, {x:'+=' + (w.side*rr.width*.7), opacity:0, duration:.6, ease:'power1.in'}, 2.0); });
    tl.to(glow, {opacity:0, duration:.6}, 1.6).to(ban, {opacity:0, y:-12, duration:.4}, 2.1);
  });
};
// B: paper lanterns rise off every fight and float away.
M.mapCleared_B = function(canvas, opts){
  opts = opts || {}; const g = G(); if(!canvas || !g) return Promise.resolve();
  const nodes = [...canvas.querySelectorAll('.map-node')].slice(0, 9), rr = canvas.getBoundingClientRect(), lights = [];
  const ban = layer('fxe-at fxe-banner', `<div class="fb-rib">${opts.title || 'Map cleared!'}</div>${opts.name ? `<div class="fb-sub">${opts.name}</div>` : ''}`);
  ban.style.left = (rr.left + rr.width/2) + 'px'; ban.style.top = (rr.top + Math.min(rr.height*.3, 150)) + 'px'; g.set(ban, {xPercent:-50, yPercent:-50});
  nodes.forEach(n=>{ const c = centre(n); lights.push(bit(c.x, c.y, '🏮', 'fxe-lantern', 18)); });
  sound('nightSwell');
  return new Promise(res=> g.timeline({onComplete:()=>{ ban.remove(); lights.forEach(l=> l.remove()); res(); }})
    .fromTo(ban, {opacity:0, scale:.7}, {opacity:1, scale:1, duration:.4, ease:'back.out(2)'})
    .fromTo(lights, {xPercent:-50, yPercent:-50, scale:.2, opacity:0}, {scale:1, opacity:1, duration:.3, stagger:.07}, .1)
    // 2026-10-15: each lantern fades out before it reaches the map's top edge (it used to float over the header above)
    .to(lights, {y:i=> -Math.max(30, Math.min(rr.height*.7, centre(nodes[i]).y - rr.top - 14)), x:()=> rnd(-30, 30), opacity:0, duration:1.8, ease:'sine.in', stagger:.07}, .5)
    .to(ban, {opacity:0, duration:.4}, 2.1));
};
css('lantern', `.fxe-lantern{filter:drop-shadow(0 0 10px rgba(255,170,80,.95));} .fxe-crit{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45)); text-shadow:none;}`);
// The next map opens: a dotted trail runs from the boss to the map's edge, the way on bounces and says so.
M.nextMapUnlocked = function(edge, fromEl){
  const g = G(); if(!edge || !g) return Promise.resolve();
  const chip = edge.querySelector('span') || edge, b = centre(edge), a = fromEl ? centre(fromEl) : {x:b.x - 140, y:b.y}, dots = [], n = Math.max(6, Math.min(16, Math.round(Math.hypot(b.x - a.x, b.y - a.y)/22)));
  for(let i = 1; i < n; i++){ const t = i/n, x = a.x + (b.x - a.x)*t, y = a.y + (b.y - a.y)*t - Math.sin(t*Math.PI)*24; const d = bit(x, y, '', 'fxe-dot'); g.set(d, {xPercent:-50, yPercent:-50, scale:0}); dots.push(d); }
  const lab = layer('fxe-at fxe-newmap', 'New map!'), cr = (canvasOf(edge) || document.body).getBoundingClientRect(); lab.style.left = Math.max(cr.left + 44, Math.min(cr.right - 44, b.x)) + 'px'; lab.style.top = (b.y - 34) + 'px'; g.set(lab, {xPercent:-50, yPercent:-50, opacity:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ dots.forEach(d=> d.remove()); lab.remove(); g.set(chip, {clearProps:'transform'}); res(); }})
    .to(dots, {scale:1, duration:.12, stagger:{each:.06, onStart:()=> sound('pawnStep')}})
    .add(()=>{ ring(b.x, b.y, '#ffe08a', 90, .7); sound('unlockChime'); })
    .fromTo(chip, {scale:1}, {scale:1.45, duration:.18, yoyo:true, repeat:3, ease:'power1.inOut'})
    .to(lab, {opacity:1, y:-6, duration:.3}, '<')
    .to(dots, {opacity:0, duration:.4, stagger:.02}, '+=.4')
    .to(lab, {opacity:0, duration:.3}, '<.3'));
};
// A Dragon Scale is found (S rank on a glinting fight): the scale flips up, a red glint, the count ticks over.
M.scaleFound = function(opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve();
  const host = opts.host, r = host ? host.getBoundingClientRect() : {left:0, top:0, width:innerWidth, height:innerHeight};
  const idx = opts.index || 1, tot = opts.total || 10;
  const o = layer('fxe-at fxe-scale', `<div class="fs-s"></div><div class="fs-n">${idx - 1}/${tot}</div><div class="fs-l">Dragon Scale</div>`);
  Object.assign(o.style, {left:(r.left + r.width/2 - 80) + 'px', top:(r.top + r.height*.42 - 90) + 'px', width:'160px', height:'180px'});
  const s = o.querySelector('.fs-s'), num = o.querySelector('.fs-n'); sound('roar');
  return new Promise(res=> g.timeline({onComplete:()=>{ o.remove(); res(); }})
    .fromTo(s, {y:60, scale:.3, rotationY:0, opacity:0}, {y:0, scale:1, rotationY:720, opacity:1, duration:.9, ease:'power3.out'})
    .add(()=>{ const c = centre(s); ring(c.x, c.y, '#ff6a3a', 150, .6); burst(c.x, c.y, ['•','•','•','•','•','•','•','•'], {dist:70, dur:.7, cls:'fxe-emb', size:12}); sound('rareRise', true); }, .75)
    .fromTo(num, {scale:1}, {scale:1.5, duration:.15, yoyo:true, repeat:1, onRepeat:()=>{ num.textContent = idx + '/' + tot; }}, .95)
    .to(o, {opacity:0, y:-20, duration:.4}, '+=.9'));
};
css('emb', `.fxe-emb{color:#ff8a4a; text-shadow:0 0 6px rgba(255,80,30,.9);}`);
// World map: the fog peels back from a map you can now see; the diamond unrolls out of it.
M.worldFogPeel = function(stop){
  const g = G(); if(!stop || !g) return Promise.resolve();
  const d = stop.querySelector('.world-diamond') || stop, c = centre(d), puffs = [];
  for(let i = 0; i < 7; i++){ const p = layer('fxe-fog'); const a = i/7*Math.PI*2; Object.assign(p.style, {left:(c.x - 30 + Math.cos(a)*10) + 'px', top:(c.y - 17 + Math.sin(a)*8) + 'px'}); p._a = a; puffs.push(p); }
  sound('mapUnroll');
  return new Promise(res=> g.timeline({onComplete:()=>{ puffs.forEach(p=> p.remove()); g.set(d, {clearProps:'transform,filter'}); res(); }})
    .fromTo(puffs, {scale:1.6, opacity:1}, {scale:2.4, opacity:0, x:(i, p)=> Math.cos(p._a)*70, y:(i, p)=> Math.sin(p._a)*44, duration:1.1, ease:'power2.out', stagger:.03})
    .fromTo(d, {scale:.6, filter:'blur(3px) brightness(.6)'}, {scale:1, filter:'blur(0px) brightness(1)', duration:.7, ease:'back.out(2)'}, .15)
    .add(()=>{ ring(c.x, c.y, '#ffd77a', 110, .6); sound('unlockChime'); }, .5));
};
// The pawn's walk leaves footprints and little dust puffs where it lands (in-game: hooks.mapPawnWalk).
css('steps', `.fxe-foot{position:absolute; width:4px; height:6px; margin:-3px 0 0 -2px; border-radius:50%; background:rgba(45,30,16,.55); pointer-events:none; z-index:2; animation:fxeFoot 2.4s ease-out forwards;}
@keyframes fxeFoot{0%{opacity:0;} 10%{opacity:1;} 100%{opacity:0;}}
.fxe-puff{position:absolute; width:12px; height:8px; margin:-4px 0 0 -6px; border-radius:50%; background:radial-gradient(ellipse, rgba(230,214,180,.85), transparent 70%); pointer-events:none; z-index:5; animation:fxePuff .6s ease-out forwards;}
@keyframes fxePuff{from{transform:scale(.4); opacity:1;} to{transform:scale(2) translateY(-3px); opacity:0;}}`);
M.pawnTrail = function(pawn, legs){
  const cv = pawn && pawn.parentNode; if(!cv || !legs || !legs.length) return;
  const now = performance.now(); let n = 0;
  legs.forEach(L=>{ for(let k = 1; k <= L.hops; k++){ const f = k/L.hops, x = L.from.x + (L.to.x - L.from.x)*f, y = L.from.y + (L.to.y - L.from.y)*f, side = (n++ % 2) ? 1 : -1;
    later(()=>{ if(!cv.isConnected) return; const ang = Math.atan2(L.to.y - L.from.y, L.to.x - L.from.x);
      const fp = document.createElement('i'); fp.className = 'fxe-foot'; fp.style.left = (x - Math.sin(ang)*side*.6) + '%'; fp.style.top = (y + Math.cos(ang)*side*.9) + '%'; fp.style.transform = `rotate(${ang*57.3 + 90}deg)`;
      const pf = document.createElement('i'); pf.className = 'fxe-puff'; pf.style.left = x + '%'; pf.style.top = y + '%';
      cv.appendChild(fp); cv.appendChild(pf); later(()=> pf.remove(), 650); later(()=> fp.remove(), 2500); }, Math.max(0, L.t0 - now) + L.dur*1000*f - 20); } });
};

// ============================================================
// 6. Feature spots open (2026-10-15, user: each spot "opens in its own way: tent flaps, nest twigs, cart awning, forge
//    flare"). The game switches to the new place straight after the first tap, so the moment plays as an overlay: the
//    spot's icon lifts from the map to the middle of the screen, opens in its own way, and a plaque names it.
// ============================================================
css('spot', `
.fxe-spot{z-index:1250; width:240px; height:240px;}
.fxe-spot > *{position:absolute; left:50%; top:50%;}
.fxe-spot .fs-rays{width:300px; height:300px; margin:-150px 0 0 -150px; border-radius:50%; background:conic-gradient(from 0deg, rgba(255,236,170,0) 0 8deg, rgba(255,236,170,.55) 10deg 14deg, rgba(255,236,170,0) 16deg 30deg); -webkit-mask:radial-gradient(circle, #000 20%, transparent 68%); mask:radial-gradient(circle, #000 20%, transparent 68%);}
.fxe-spot .fs-halo{width:190px; height:190px; margin:-95px 0 0 -95px; border-radius:50%; background:radial-gradient(circle, rgba(255,246,214,.9), rgba(255,220,140,.35) 40%, transparent 70%);}
.fxe-spot .fs-ico{width:96px; height:96px; margin:-48px 0 0 -48px; display:grid; place-items:center; font-size:64px; line-height:1; filter:drop-shadow(0 6px 6px rgba(0,0,0,.45)); z-index:2;}
.fxe-spot .fs-plaque{top:auto; bottom:-6px; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; z-index:3; white-space:nowrap;}
.fxe-spot .fs-plaque b{font:900 20px/1.05 'Baloo 2',system-ui,sans-serif; color:#2b1d08; padding:5px 16px 6px; border-radius:8px; background:linear-gradient(180deg,#f7e3b0,#d9b56c); border:2px solid #7a5a30; box-shadow:0 6px 12px rgba(0,0,0,.4);}
.fxe-spot .fs-plaque small{margin-top:4px; font:900 12px/1 'Baloo 2',system-ui,sans-serif; letter-spacing:.12em; text-transform:uppercase; color:#ffe9a8; text-shadow:0 1px 3px rgba(0,0,0,.9);}
.fxe-spot .fs-p{position:absolute; z-index:1;}
.fxe-spot .fs-flap{width:58px; height:104px; margin-top:-56px; z-index:4; background:repeating-linear-gradient(90deg, #8a3326 0 9px, #6e2a20 9px 18px); box-shadow:inset 0 0 0 2px #4e1a12, 0 4px 10px rgba(0,0,0,.4);}
.fxe-spot .fs-flap.l{margin-left:-58px; clip-path:polygon(100% 0, 100% 100%, 0 100%); transform-origin:100% 0;} .fxe-spot .fs-flap.r{margin-left:0; clip-path:polygon(0 0, 100% 100%, 0 100%); transform-origin:0 0;}
.fxe-spot .fs-awn{width:150px; height:58px; margin:-92px 0 0 -75px; z-index:4; transform-origin:50% 0; background:repeating-linear-gradient(90deg, #3b4a78 0 18px, #d9c7a6 18px 36px);
  -webkit-mask:linear-gradient(#000 0 0) top/100% 44px no-repeat, radial-gradient(circle at 9px 44px, #000 9px, transparent 9.5px) 0 0/18px 58px repeat-x; mask:linear-gradient(#000 0 0) top/100% 44px no-repeat, radial-gradient(circle at 9px 44px, #000 9px, transparent 9.5px) 0 0/18px 58px repeat-x;}
.fxe-spot .fs-paper{width:34px; height:42px; margin:-21px 0 0 -17px; background:linear-gradient(#fbf3dc, #eadcb5); box-shadow:0 3px 6px rgba(0,0,0,.35); border-radius:2px;}
.fxe-spot .fs-paper::before{content:''; position:absolute; left:50%; top:-4px; width:9px; height:9px; margin-left:-4.5px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ff8a7a, #c0392b 60%, #7a1d14);}
.fxe-spot .fs-paper::after{content:''; position:absolute; left:6px; right:6px; top:12px; height:16px; background:repeating-linear-gradient(#b9a77c 0 2px, transparent 2px 6px); opacity:.7;}
.fxe-spot .fs-page{width:52px; height:70px; margin:-35px 0 0 0; z-index:3; background:linear-gradient(90deg, #efe2c0, #fbf4e2); border:2px solid #8b6a3e; transform-origin:0 50%; box-shadow:0 4px 10px rgba(0,0,0,.35);}
.fxe-spot .fs-gate{width:110px; height:104px; margin:-56px 0 0 -55px; z-index:4; background:repeating-linear-gradient(90deg, transparent 0 12px, #4b4b52 12px 18px), repeating-linear-gradient(0deg, transparent 0 18px, #3d3d44 18px 23px); border-bottom:6px solid #2d2d33;}
.fxe-spot .fs-gate::after{content:''; position:absolute; left:0; right:0; bottom:-14px; height:14px; background:repeating-linear-gradient(90deg, #3d3d44 0 6px, transparent 6px 18px); clip-path:polygon(0 0, 100% 0, 100% 40%, 0 40%);}
.fxe-spot .fs-banner{width:44px; height:96px; margin:-130px 0 0 -22px; background:linear-gradient(#c62828, #8e1a1a); border-top:5px solid #f1c65a; clip-path:polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%); box-shadow:0 6px 10px rgba(0,0,0,.3); display:grid; place-items:center; font-size:22px; color:#ffe9a8;}
.fxe-spot .fs-card{width:30px; height:42px; margin:-21px 0 0 -15px; border-radius:5px; border:2px solid rgba(220,230,255,.85); background:linear-gradient(160deg, rgba(190,210,255,.5), rgba(120,140,220,.25)); box-shadow:0 0 12px rgba(170,190,255,.7);}
.fxe-spot .fs-bub{width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%; border:2px solid rgba(160,255,140,.9); background:rgba(160,255,140,.25);}
.fxe-spot svg{overflow:visible;}
.fxe-spot .fs-pick{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:24px; line-height:1;}
`);
const SPOT_LOOK = {
  deck:{icon:'⛺', name:'Camp', open:'tent'}, nest:{icon:'🪺', name:'Nest', open:'nest'}, quests:{icon:'📜', name:'Notices', open:'papers'},
  shop:{icon:'🛒', name:'Traveller’s Cart', open:'awning'}, shop2:{icon:'🏮', name:'Ember Peddler', open:'awning'}, shop3:{icon:'🐫', name:'Gilded Caravan', open:'awning'},
  forge:{icon:'🔨', name:'The Forge', open:'forge'}, codex:{icon:'📖', name:'Codex', open:'book', glyphs:['❦','✦','✧'], col:'#ffe08a'},
  skillcodex:{icon:'📘', name:'Skill Codex', open:'book', glyphs:['ᚱ','ᛟ','✦'], col:'#8fc2ff'}, mapcodex:{icon:'🗺️', name:'Map Codex', open:'compass'},
  arena:{icon:'🏟️', name:'The Arena', open:'banners'}, questboard:{icon:'📌', name:'Quest Board', open:'pin'}, raid:{icon:'🐲', name:'Raid Banner', open:'raidbanner'},
  wanderer:{icon:'🧭', name:'Wanderer’s Camp', open:'compass'}, tavern:{icon:'🍺', name:'The Tavern', open:'mugs'}, gauntlet:{icon:'🏅', name:'Gauntlet Gate', open:'gate'},
  autobattle:{icon:'🧩', name:'Whisper’s Game', open:'ghostcards'}, stomp:{icon:'🐾', name:'Stomping Grounds', open:'stomp'}, testlab:{icon:'🧪', name:'Test Lab', open:'flask'},
  market:{icon:'🧺', name:'Flea Market', open:'bunting'}, fieldkit:{icon:'🧰', name:'The traveller’s kit', open:'kit'}, backpack:{icon:'🎒', name:'A note in your pack', open:'note'},
};
M.SPOT_LOOK = SPOT_LOOK;
function sp(o, cls, html, css2){ const e = document.createElement('div'); e.className = 'fs-p ' + cls; if(html) e.innerHTML = html; if(css2) e.setAttribute('style', css2); o.appendChild(e); return e; }
// Each spot's own way of opening: adds parts to the overlay `o` and tweens on `tl` from time `t`.
const OPENERS = {
  tent(o, tl, g, t){ const L = sp(o, 'fs-flap l'), R = sp(o, 'fs-flap r'); tl.fromTo([L, R], {opacity:0}, {opacity:1, duration:.15}, t - .3)
    .to(L, {rotationY:-75, x:-40, skewY:6, duration:.6, ease:'power2.inOut'}, t).to(R, {rotationY:75, x:40, skewY:-6, duration:.6, ease:'power2.inOut'}, t).to([L, R], {opacity:0, duration:.3}, t + .45)
    .add(()=> sound('featherFlutter'), t); },
  nest(o, tl, g, t){ for(let i = 0; i < 9; i++){ const tw = sp(o, '', '', `width:${rnd(20, 34)|0}px; height:3px; margin:-1.5px 0 0 -12px; border-radius:2px; background:#7a5530;`); const a = i/9*Math.PI*2;
      tl.fromTo(tw, {rotation:a*57, opacity:0}, {x:Math.cos(a)*80, y:Math.sin(a)*60, rotation:a*57 + rnd(-200, 200), opacity:1, duration:.6, ease:'power2.out'}, t).to(tw, {opacity:0, duration:.3}, t + .5); }
    for(let i = 0; i < 6; i++){ const d = sp(o, '', '', 'width:12px; height:18px; margin:-9px 0 0 -6px; border-radius:50% 50% 45% 45%; background:radial-gradient(ellipse at 40% 30%, #fffaf0, #e9dcc4 60%, transparent 72%);');
      tl.fromTo(d, {x:rnd(-90, 90), y:-110, opacity:0}, {x:'+=' + rnd(-30, 30), y:rnd(10, 90), rotation:rnd(-180, 180), opacity:1, duration:1.3, ease:'sine.inOut'}, t + i*.08).to(d, {opacity:0, duration:.3}, t + 1.2); } },
  papers(o, tl, g, t){ [[-78, -34, -12], [76, -40, 10], [-60, 46, 7]].forEach(([x, y, r], i)=>{ const p = sp(o, 'fs-paper');
      tl.fromTo(p, {x:x*3, y:y - 60, rotation:r*6, opacity:0}, {x, y, rotation:r, opacity:1, duration:.35, ease:'back.out(1.6)'}, t + i*.12).add(()=> sound('woodKnock'), t + i*.12 + .3)
        .to(p, {rotation:r + 6, duration:.18, yoyo:true, repeat:3, ease:'sine.inOut', transformOrigin:'50% 0'}, t + .5 + i*.12); }); },
  pin(o, tl, g, t){ const p = sp(o, 'fs-paper', '', 'width:70px; height:86px; margin:-60px 0 0 -35px; transform-origin:50% 0;'); tl.fromTo(p, {scaleY:0, opacity:0}, {scaleY:1, opacity:1, duration:.4, ease:'back.out(1.4)'}, t - .2).add(()=> sound('woodKnock'), t + .15); },
  awning(o, tl, g, t){ const a = sp(o, 'fs-awn'), bell = sp(o, '', '🔔', 'font-size:26px; margin:-100px 0 0 54px; transform-origin:50% 0;');
    tl.fromTo(a, {scaleY:1.8, opacity:1}, {scaleY:.0, duration:.6, ease:'power3.in'}, t).fromTo(bell, {rotation:-30, opacity:0}, {rotation:30, opacity:1, duration:.2, yoyo:true, repeat:3, ease:'sine.inOut'}, t + .3)
      .add(()=>{ const c = centre(o); burst(c.x, c.y, ['🪙','🪙','✨','🪙','✨'], {dist:90, dur:.8, size:18}); sound('coinRegister'); }, t + .5).to(bell, {opacity:0, duration:.3}, t + 1.2); },
  forge(o, tl, g, t){ const f = sp(o, '', '', 'width:220px; height:220px; margin:-110px 0 0 -110px; border-radius:50%; background:radial-gradient(circle, rgba(255,190,90,.9), rgba(255,90,20,.45) 40%, transparent 70%);');
    tl.fromTo(f, {scale:.3, opacity:0}, {scale:1.2, opacity:1, duration:.25, ease:'power2.out'}, t).to(f, {opacity:0, duration:.6}, t + .3)
      .add(()=>{ const c = centre(o); burst(c.x, c.y, ['•','•','•','•','•','•','•','•','•','•'], {dist:110, dur:.9, size:13, cls:'fxe-emb', from:-Math.PI*.95, spread:Math.PI*.9, lift:-20, fall:30}); sound('forgeStrike'); }, t + .05); },
  book(o, tl, g, t, look){ const L = sp(o, 'fs-page', '', 'margin-left:0;'), R = sp(o, 'fs-page', '', 'margin-left:0;');
    tl.fromTo([L, R], {rotationY:-90, opacity:0}, {opacity:1, duration:.1}, t - .2).to(L, {rotationY:-170, duration:.55, ease:'power2.out'}, t).to(R, {rotationY:-10, duration:.55, ease:'power2.out'}, t)
      .to([L, R], {opacity:0, duration:.3}, t + .6).add(()=> sound('pageTurn'), t);
    (look.glyphs || ['✦']).concat(look.glyphs || []).forEach((gl, i)=>{ const s = sp(o, '', gl, `font:700 18px serif; color:${look.col || '#ffe08a'}; text-shadow:0 0 8px ${look.col || '#ffe08a'}; margin:-9px 0 0 -6px;`);
      tl.fromTo(s, {x:rnd(-30, 30), y:0, opacity:0}, {y:-rnd(60, 110), x:'+=' + rnd(-20, 20), opacity:1, duration:.8, ease:'power1.out'}, t + .2 + i*.07).to(s, {opacity:0, duration:.3}, t + .9 + i*.07); }); },
  compass(o, tl, g, t){ const c = sp(o, '', `<svg width="150" height="150" viewBox="-50 -50 100 100"><circle r="44" fill="none" stroke="#e9c46a" stroke-width="2.5"/><circle r="38" fill="none" stroke="rgba(255,240,200,.5)" stroke-width="1"/>
      <path d="M0 -40 L6 -6 L40 0 L6 6 L0 40 L-6 6 L-40 0 L-6 -6Z" fill="rgba(255,240,200,.35)" stroke="#e9c46a" stroke-width="1.2"/><path d="M0 -30 L4 0 L-4 0Z" fill="#d64545"/><path d="M0 30 L4 0 L-4 0Z" fill="#f4ead2"/></svg>`, 'margin:-75px 0 0 -75px;');
    tl.fromTo(c, {rotation:-540, scale:.2, opacity:0}, {rotation:0, scale:1, opacity:.9, duration:.9, ease:'power3.out'}, t - .2).to(c, {opacity:0, duration:.4}, t + .9).add(()=> sound('mapUnroll'), t - .1); },
  banners(o, tl, g, t){ [-80, 80].forEach((x, i)=>{ const b = sp(o, 'fs-banner', i ? '🏟️' : '⚔️', `margin-left:${x - 22}px;`); tl.fromTo(b, {y:-120, opacity:0}, {y:0, opacity:1, duration:.5, ease:'bounce.out'}, t + i*.1).to(b, {opacity:0, duration:.3}, t + 1.1); });
    tl.add(()=>{ const c = centre(o); burst(c.x, c.y + 70, ['•','•','•','•','•','•'], {dist:60, dur:.6, cls:'fxe-dust', from:Math.PI, spread:Math.PI, fall:0}); burst(c.x, c.y - 30, ['🎉','✨','🎊','✨'], {dist:100, dur:.9, size:18}); sound('leaderFanfare'); }, t + .4); },
  raidbanner(o, tl, g, t){ const b = sp(o, 'fs-banner', '🐲', 'width:110px; height:150px; margin:-120px 0 0 -55px; font-size:40px; z-index:0;'); tl.fromTo(b, {scaleY:0, transformOrigin:'50% 0'}, {scaleY:1, duration:.6, ease:'back.out(1.3)'}, t - .2)
      .add(()=>{ const c = centre(o); burst(c.x, c.y, ['•','•','•','•','•','•','•','•'], {dist:100, dur:1, cls:'fxe-emb', from:-Math.PI, spread:Math.PI, lift:-30}); sound('bossRumble'); }, t + .3).to(b, {opacity:0, duration:.4}, t + 1.1); },
  mugs(o, tl, g, t){ const L = sp(o, '', '🍺', 'font-size:40px; margin:-60px 0 0 -20px;'), R = sp(o, '', '🍺', 'font-size:40px; margin:-60px 0 0 -20px;');
    tl.fromTo(L, {x:-110, rotation:-10, opacity:0}, {x:-22, rotation:24, opacity:1, duration:.35, ease:'power2.in'}, t).fromTo(R, {x:110, scaleX:-1, rotation:10, opacity:0}, {x:22, rotation:-24, opacity:1, duration:.35, ease:'power2.in'}, t)
      .add(()=>{ const c = centre(o); burst(c.x, c.y - 70, ['✨','•','•','✨','•'], {dist:40, dur:.5, size:12}); sound('clang'); }, t + .35).to([L, R], {y:-10, opacity:0, duration:.4}, t + .9); },
  gate(o, tl, g, t){ const gt = sp(o, 'fs-gate'); tl.fromTo(gt, {y:0, opacity:1}, {y:-140, opacity:0, duration:.8, ease:'power2.in'}, t).add(()=> sound('chainBreak'), t); },
  ghostcards(o, tl, g, t){ const ring2 = sp(o, '', '', 'width:0; height:0;'); for(let i = 0; i < 5; i++){ const c = sp(ring2, 'fs-card'); const a = i/5*360; g.set(c, {rotation:a, transformOrigin:'50% 160%', y:-56}); }
    tl.fromTo(ring2, {rotation:0, scale:.3, opacity:0}, {rotation:300, scale:1.3, opacity:1, duration:1, ease:'power2.out'}, t - .2).to(ring2, {opacity:0, scale:1.6, duration:.4}, t + .8).add(()=> sound('stealthTone'), t - .2); },
  stomp(o, tl, g, t){ tl.add(()=>{ const c = centre(o); ring(c.x, c.y + 50, '#d8c7a0', 200, .7); later(()=> ring(c.x, c.y + 50, '#d8c7a0', 260, .7), 160); burst(c.x, c.y + 60, ['•','•','•','•','•','•','•','•'], {dist:90, dur:.6, cls:'fxe-dust', from:Math.PI, spread:Math.PI, fall:0}); sound('earthquakeTone'); }, t)
      .fromTo(o, {y:0}, {y:5, duration:.05, yoyo:true, repeat:5}, t);
    [[-70, 70], [-35, 60], [0, 72], [35, 60], [70, 70]].forEach(([x, y], i)=>{ const p = sp(o, '', '🐾', `font-size:20px; margin:${y - 10}px 0 0 ${x - 10}px;`); tl.fromTo(p, {scale:2, opacity:0}, {scale:1, opacity:1, duration:.15}, t + .1 + i*.1).to(p, {opacity:0, duration:.3}, t + 1.1); }); },
  flask(o, tl, g, t){ for(let i = 0; i < 9; i++){ const b = sp(o, 'fs-bub'); tl.fromTo(b, {x:rnd(-18, 18), y:-10, scale:.4, opacity:0}, {x:'+=' + rnd(-26, 26), y:-rnd(70, 120), scale:rnd(.8, 1.6), opacity:1, duration:.8, ease:'power1.out'}, t + i*.07).to(b, {opacity:0, duration:.2}, t + .7 + i*.07); }
    tl.add(()=>{ const c = centre(o); ring(c.x, c.y, '#9dff8a', 170, .7); sound('bubble'); }, t); },
  bunting(o, tl, g, t){ const cols = ['#d64545','#e9c46a','#3f8f4a','#3b6fb6','#e07ab0','#f08a3c'], s = sp(o, '', `<svg width="230" height="60" viewBox="0 0 230 60"><path d="M0 6 Q115 46 230 6" fill="none" stroke="#6b4a2a" stroke-width="2"/>${Array.from({length:9}, (_, i)=>{ const x = 14 + i*25, y = 6 + 40*(1 - Math.pow((x - 115)/115, 2))*.98; return `<path d="M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 16}Z" fill="${cols[i % cols.length]}"/>`; }).join('')}</svg>`, 'margin:-110px 0 0 -115px;');
    tl.fromTo(s, {y:-60, opacity:0}, {y:0, opacity:1, duration:.5, ease:'back.out(1.6)'}, t - .1).to(s, {skewX:4, duration:.25, yoyo:true, repeat:3}, t + .4).to(s, {opacity:0, duration:.3}, t + 1.2); },
  kit(o, tl, g, t){ ['🧭','🔧','🪢','🕯️','🗝️'].forEach((e, i)=>{ const p = sp(o, '', e, 'font-size:24px; margin:-12px 0 0 -12px;'); const a = -Math.PI*(.15 + i*.175);
      tl.fromTo(p, {x:0, y:0, scale:.3, opacity:0}, {x:Math.cos(a)*90, y:Math.sin(a)*80, scale:1, opacity:1, rotation:rnd(-30, 30), duration:.5, ease:'back.out(2)'}, t + i*.06).to(p, {opacity:0, duration:.3}, t + 1.1); });
    tl.add(()=> sound('itemDrop'), t); },
  note(o, tl, g, t){ const p = sp(o, 'fs-paper', '', 'width:40px; height:48px;'); tl.fromTo(p, {x:0, y:0, rotation:0, opacity:0, scale:.4}, {x:70, y:-90, rotation:380, opacity:1, scale:1, duration:.8, ease:'power2.out'}, t)
      .to(p, {y:-60, x:60, rotation:350, duration:.5, ease:'sine.inOut'}, t + .8).to(p, {opacity:0, duration:.3}, t + 1.2).add(()=> sound('featherFlutter'), t); },
};
// fromEl: the spot on the map (its icon flies from there). opts.inPlace (variant B): the moment plays on the spot itself, smaller.
M.spotUnlock = function(key, fromEl, opts){
  opts = opts || {}; const g = G(), look = SPOT_LOOK[key] || {icon:'✨', name:key, open:'forge'}; if(!g) return Promise.resolve();
  const host = opts.host, hr = host ? host.getBoundingClientRect() : {left:0, top:0, width:innerWidth, height:innerHeight};
  const from = fromEl && fromEl.isConnected ? centre(fromEl.querySelector('.map-spot-ico') || fromEl) : null;
  const at = opts.inPlace && from ? from : {x:hr.left + hr.width/2, y:hr.top + hr.height*.44};
  const o = layer('fxe-at fxe-spot', `<div class="fs-rays"></div><div class="fs-halo"></div><div class="fs-ico">${look.icon}</div><div class="fs-plaque"><b>${opts.name || look.name}</b><small>Unlocked!</small></div>`);
  Object.assign(o.style, {left:(at.x - 120) + 'px', top:(at.y - 120) + 'px'});
  if(opts.inPlace) g.set(o, {scale:.7});
  const rays = o.querySelector('.fs-rays'), halo = o.querySelector('.fs-halo'), ico = o.querySelector('.fs-ico'), plq = o.querySelector('.fs-plaque');
  const tl = g.timeline({paused:true});
  return new Promise(res=>{
    tl.eventCallback('onComplete', ()=>{ o.remove(); opts.onDone && opts.onDone(); res(); });
    tl.fromTo(halo, {scale:.2, opacity:0}, {scale:1, opacity:1, duration:.4, ease:'power2.out'}, .1)
      .fromTo(rays, {scale:.4, opacity:0, rotation:0}, {scale:1, opacity:1, rotation:40, duration:1.9, ease:'none'}, .15)
      .fromTo(plq, {y:16, opacity:0}, {y:0, opacity:1, duration:.35, ease:'back.out(2)'}, .7);
    if(from && !opts.inPlace) tl.fromTo(ico, {x:from.x - at.x, y:from.y - at.y, scale:.45}, {x:0, y:0, scale:1, duration:.45, ease:'power2.inOut'}, 0);
    else tl.fromTo(ico, {scale:.2, opacity:0}, {scale:1, opacity:1, duration:.4, ease:'back.out(2.4)'}, .05);
    tl.fromTo(ico, {rotation:0}, {rotation:-8, duration:.12, yoyo:true, repeat:3, ease:'sine.inOut'}, .5);
    (OPENERS[look.open] || OPENERS.forge)(o, tl, g, .5, look);
    tl.to(o, {opacity:0, duration:.4}, 1.95);
    tl.play();
  });
};
M.spotUnlock_B = (key, fromEl, opts)=> M.spotUnlock(key, fromEl, Object.assign({}, opts, {inPlace:true}));

// ============================================================
// 7. Curiosities live a little (2026-10-15): each has an idle of its own, and a "found!" moment the first time you look.
// ============================================================
css('curio', `
.map-curio.fxe-cu{overflow:visible;}
.map-curio.fxe-cu .mcu-ico{display:inline-block; transform-origin:50% 90%;}
.fxe-cu .fxe-cp{position:absolute; left:50%; top:50%; pointer-events:none; line-height:1; font-style:normal;}
.fxe-cu[data-curio="signpost"] .mcu-ico{animation:fxeTilt 5s ease-in-out infinite;}
.fxe-cu[data-curio="scarecrow"] .mcu-ico{animation:fxeSway 3.6s ease-in-out infinite;}
.fxe-cu[data-curio="baobab"] .mcu-ico{animation:fxeSway 6s ease-in-out infinite;}
.fxe-cu[data-curio="banner"] .mcu-ico{transform-origin:10% 90%; animation:fxeFlutter 1.3s ease-in-out infinite;}
.fxe-cu[data-curio="bottle"] .mcu-ico{animation:fxeBob 3s ease-in-out infinite;}
.fxe-cu[data-curio="crab"] .mcu-ico{animation:fxeSide 4.4s steps(1) infinite;}
.fxe-cu[data-curio="lantern"] .mcu-ico, .fxe-cu[data-curio="peddler"] .mcu-ico{transform-origin:50% 0; animation:fxeLamp 3.4s ease-in-out infinite, fxeGlowF .2s steps(2) infinite alternate;}
.fxe-cu[data-curio="wisp"] .mcu-ico{animation:fxeWispB 4s ease-in-out infinite;}
.fxe-cu[data-curio="drum"] .mcu-ico{animation:fxeThump 3s ease-in-out infinite;}
.fxe-cu[data-curio="eyrie"] .mcu-ico{animation:fxeTilt 7s ease-in-out infinite;}
.fxe-cu[data-curio="ashcairn"] .mcu-ico{animation:fxeEmberG 2.6s ease-in-out infinite;}
.fxe-cu[data-curio="shell"] .mcu-ico{animation:fxeTilt 6s ease-in-out infinite;}
@keyframes fxeTilt{0%,80%,100%{transform:rotate(0);} 86%{transform:rotate(-7deg);} 92%{transform:rotate(5deg);}}
@keyframes fxeSway{0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);}}
@keyframes fxeFlutter{0%,100%{transform:skewY(-6deg) scaleX(1);} 50%{transform:skewY(5deg) scaleX(.9);}}
@keyframes fxeBob{0%,100%{transform:translateY(0) rotate(-8deg);} 50%{transform:translateY(-4px) rotate(8deg);}}
@keyframes fxeSide{0%{transform:translateX(0) scaleX(1);} 25%{transform:translateX(-5px) scaleX(1);} 50%{transform:translateX(-5px) scaleX(-1);} 62%{transform:translateX(3px) scaleX(-1) rotate(-6deg);} 75%{transform:translateX(3px) scaleX(-1);}}
@keyframes fxeLamp{0%,100%{transform:rotate(-5deg);} 50%{transform:rotate(5deg);}}
@keyframes fxeGlowF{from{filter:drop-shadow(0 0 4px rgba(255,170,60,.7));} to{filter:drop-shadow(0 0 10px rgba(255,200,90,1));}}
@keyframes fxeWispB{0%,100%{transform:translateY(0); opacity:.55; filter:drop-shadow(0 0 6px rgba(140,220,255,.8));} 50%{transform:translateY(-7px); opacity:1; filter:drop-shadow(0 0 14px rgba(140,220,255,1));}}
@keyframes fxeThump{0%,70%,100%{transform:scale(1);} 74%{transform:scale(1.18,.86);} 80%{transform:scale(.95,1.06);} 86%{transform:scale(1);}}
@keyframes fxeEmberG{0%,100%{filter:drop-shadow(0 0 2px rgba(255,90,30,.4));} 50%{filter:drop-shadow(0 0 9px rgba(255,110,40,.95));}}
.fxe-cp.bee{font-size:9px; animation:fxeOrbit 2.4s linear infinite;} .fxe-cp.bee + .bee{animation-duration:3.1s; animation-direction:reverse;}
@keyframes fxeOrbit{from{transform:rotate(0) translateX(20px) rotate(0);} to{transform:rotate(360deg) translateX(20px) rotate(-360deg);}}
.fxe-cp.rip{width:30px; height:10px; margin:6px 0 0 -15px; border:1.5px solid rgba(220,245,255,.85); border-radius:50%; animation:fxeRip 2.6s ease-out infinite;}
.fxe-cp.rip + .rip{animation-delay:1.3s;}
@keyframes fxeRip{from{transform:scale(.3); opacity:.9;} to{transform:scale(1.5); opacity:0;}}
.fxe-cp.snd{width:26px; height:26px; margin:-13px 0 0 -13px; border:2px solid rgba(255,250,230,.8); border-radius:50%; animation:fxeSnd 3.6s ease-out infinite; opacity:0;}
.fxe-cp.snd + .snd{animation-delay:.35s;}
@keyframes fxeSnd{0%,60%{transform:scale(.4); opacity:0;} 65%{opacity:.9;} 100%{transform:scale(2); opacity:0;}}
.fxe-cp.dot{width:5px; height:5px; border-radius:50%; background:#c9ffb0; box-shadow:0 0 8px 3px rgba(150,255,140,.85); animation:fxeGlowP 2.2s ease-in-out infinite;}
@keyframes fxeGlowP{0%,100%{opacity:.2;} 50%{opacity:1;}}
.fxe-cp.bub{width:6px; height:6px; margin-left:-3px; border-radius:50%; border:1.5px solid rgba(220,250,255,.9); animation:fxeBubR 2.8s ease-in infinite; opacity:0;}
@keyframes fxeBubR{0%{transform:translateY(0) scale(.5); opacity:0;} 15%{opacity:1;} 100%{transform:translateY(-34px) scale(1.2); opacity:0;}}
.fxe-cp.fish{font-size:11px; animation:fxeJump 5s ease-in-out infinite; opacity:0;}
@keyframes fxeJump{0%,70%{opacity:0; transform:translate(-8px,6px) rotate(40deg);} 76%{opacity:1;} 84%{transform:translate(0,-16px) rotate(0deg);} 92%{opacity:1; transform:translate(8px,4px) rotate(-50deg);} 96%,100%{opacity:0;}}
.fxe-cp.spark{width:3px; height:3px; border-radius:50%; background:#ffd27a; box-shadow:0 0 5px 2px rgba(255,140,30,.9); animation:fxeSparkC 3s ease-out infinite; opacity:0;}
@keyframes fxeSparkC{0%,78%{opacity:0; transform:translate(0,0);} 80%{opacity:1;} 100%{opacity:0; transform:translate(var(--dx), -22px);}}
.fxe-cp.smoke{width:14px; height:14px; margin:-20px 0 0 -7px; border-radius:50%; background:radial-gradient(circle, rgba(60,50,50,.55), transparent 70%); animation:fxeSmoke 3.4s ease-out infinite;}
.fxe-cp.feath{font-size:10px; animation:fxeFeath 6s ease-in-out infinite; opacity:0;}
@keyframes fxeFeath{0%{opacity:0; transform:translate(0,-26px) rotate(0);} 15%{opacity:1;} 50%{transform:translate(10px,-6px) rotate(40deg);} 90%{opacity:.8;} 100%{opacity:0; transform:translate(-4px,14px) rotate(-20deg);}}
.fxe-cp.leafc{font-size:9px; animation:fxeFeath 7s ease-in-out infinite; opacity:0;}
.fxe-cp.pearl{width:8px; height:8px; margin:-8px 0 0 2px; background:#fff; clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%); animation:fxeGlint 3.6s ease-in-out infinite; opacity:0;}
@media (prefers-reduced-motion: reduce){ .map-curio.fxe-cu .mcu-ico, .fxe-cu .fxe-cp{animation:none !important;} .fxe-cu .fxe-cp{display:none;} }
`);
const CURIO_KIDS = {
  beehive:'<i class="fxe-cp bee">🐝</i><i class="fxe-cp bee">🐝</i>', bottle:'<i class="fxe-cp rip"></i>', icefish:'<i class="fxe-cp rip"></i><i class="fxe-cp rip"></i><i class="fxe-cp fish">🐟</i>',
  echo:'<i class="fxe-cp snd"></i><i class="fxe-cp snd"></i>', drum:'<i class="fxe-cp snd" style="animation-duration:3s"></i>',
  glowpool:'<i class="fxe-cp dot" style="margin:-12px 0 0 -14px"></i><i class="fxe-cp dot" style="margin:4px 0 0 10px; animation-delay:-.8s"></i><i class="fxe-cp dot" style="margin:-4px 0 0 -2px; animation-delay:-1.5s"></i>',
  wreck:'<i class="fxe-cp bub" style="margin-top:-6px"></i><i class="fxe-cp bub" style="margin:-8px 0 0 6px; animation-delay:-1s"></i><i class="fxe-cp bub" style="margin:-4px 0 0 -8px; animation-delay:-1.9s"></i>',
  anvil:'<i class="fxe-cp spark" style="--dx:-10px"></i><i class="fxe-cp spark" style="--dx:4px; animation-delay:.06s"></i><i class="fxe-cp spark" style="--dx:12px; animation-delay:.1s"></i>',
  ashcairn:'<i class="fxe-cp smoke"></i><i class="fxe-cp spark" style="--dx:6px; animation-duration:2.6s"></i>', eyrie:'<i class="fxe-cp feath">🪶</i>', baobab:'<i class="fxe-cp leafc">🍂</i>', shell:'<i class="fxe-cp pearl"></i>',
};
M.curioIdle = function(el, key){ if(!el || el.classList.contains('fxe-cu')) return; key = key || el.dataset.curio; el.classList.add('fxe-cu'); if(!el.dataset.curio) el.dataset.curio = key; if(CURIO_KIDS[key]) el.insertAdjacentHTML('beforeend', CURIO_KIDS[key]); };
M.decorateCurios = function(canvas){ if(canvas) canvas.querySelectorAll('.map-curio[data-curio]').forEach(el=> M.curioIdle(el)); };
// First look: the thing hops, a ring of sparkles, and a little something of its own.
const CURIO_FOUND = {beehive:['🐝','🐝','🐝','🍯'], bottle:['💧','📜','💧'], crab:['🫧','🫧','🫧'], lantern:['✨','🔥','✨'], ashcairn:['•','•','•','•'], peddler:['🪙','✨','🪙'], echo:['🔊','💬'],
  glowpool:['✨','✨','✨','✨'], baobab:['🍂','🍃','🍂'], drum:['🎵','🎶','🎵'], icefish:['🐟','💧','❄️'], shell:['🫧','✨','🫧'], wreck:['🫧','🫧','⚓','🫧'], wisp:['✨','💠','✨'], anvil:['•','•','•','•','•'],
  eyrie:['🪶','🪶','🪶'], banner:['🚩','✨'], signpost:['🍃','✨'], scarecrow:['🐦‍⬛','🌾','🌾']};
M.curioFound = function(el, key, opts){
  opts = opts || {}; const g = G(); if(!el || !g) return Promise.resolve();
  key = key || el.dataset.curio; const ico = el.querySelector('.mcu-ico') || el, c = centre(el);
  ring(c.x, c.y, '#ffe9a8', 90, .6);
  burst(c.x, c.y - 4, CURIO_FOUND[key] || ['✨','✦','✨'], {dist:44, dur:.75, size:15, lift:-10, cls:/ashcairn|anvil/.test(key) ? 'fxe-emb' : ''});
  return new Promise(res=> g.timeline({onComplete:()=>{ g.set(ico, {clearProps:'transform'}); res(); }})
    .fromTo(ico, {y:0, scale:1}, {y:-14, scale:1.35, duration:.18, ease:'power2.out'})
    .to(ico, {y:0, scale:1, duration:.4, ease:'bounce.out'}));
};

// ============================================================
// 8. Places off the map (2026-10-15): the Notices' pinned papers lift in the draught; the Tavern's hearth glows and two
//    mugs clink as you come in.
// ============================================================
css('places', `
.qn-note .fxe-curl{position:absolute; right:0; bottom:0; width:16px; height:16px; pointer-events:none; transform-origin:100% 100%;
  background:linear-gradient(135deg, transparent 49%, rgba(0,0,0,.18) 50%, #e8d9b0 52%, #fbf3dc); border-radius:0 0 2px 0; animation:fxeCurl 7s ease-in-out infinite;}
@keyframes fxeCurl{0%,74%,100%{transform:scale(.4); opacity:.6;} 80%{transform:scale(1.25) rotate(-6deg); opacity:1;} 86%{transform:scale(.8) rotate(3deg);} 92%{transform:scale(1.1);}}
.qn-note.fxe-flut{animation:fxeNoteF .9s ease-in-out 1;}
@keyframes fxeNoteF{30%{transform:skewX(-2deg) translateY(-1px);} 60%{transform:skewX(1.5deg);}}
.fxe-hearth{position:absolute; left:0; right:0; bottom:0; height:46%; pointer-events:none; z-index:0; border-radius:inherit;
  background:radial-gradient(ellipse 70% 90% at 50% 120%, rgba(255,140,50,.32), rgba(255,90,20,.12) 50%, transparent 75%); animation:fxeHearth 2.2s ease-in-out infinite;}
@keyframes fxeHearth{0%,100%{opacity:.75;} 30%{opacity:1;} 55%{opacity:.82;} 70%{opacity:.95;}}
.tavern-modal.fxe-tav{position:relative; isolation:isolate;} .tavern-modal.fxe-tav > :not(.fxe-hearth){position:relative; z-index:1;}
`);
M.questBoardIdle = function(modal, opening){
  if(!modal) return; const notes = [...modal.querySelectorAll('.qn-note')];
  notes.forEach((n, i)=>{ if(n.querySelector(':scope > .fxe-curl')) return; const c = document.createElement('i'); c.className = 'fxe-curl'; c.setAttribute('aria-hidden', 'true'); c.style.animationDelay = (-(i*1.37) % 7).toFixed(2) + 's'; n.appendChild(c); });
  if(opening) notes.forEach((n, i)=> later(()=>{ if(!n.isConnected) return; n.classList.add('fxe-flut'); later(()=> n.classList.remove('fxe-flut'), 950); }, 700 + i*55));
};
M.tavernOpen = function(modal, opts){
  opts = opts || {}; const g = G(); if(!modal) return Promise.resolve();
  modal.classList.add('fxe-tav'); if(!modal.querySelector(':scope > .fxe-hearth')){ const h = document.createElement('div'); h.className = 'fxe-hearth'; h.setAttribute('aria-hidden', 'true'); modal.insertBefore(h, modal.firstChild); }
  if(!g || opts.quiet) return Promise.resolve();
  const r = modal.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + 34;
  const L = bit(x - 70, y, '🍺', '', 30), R = bit(x + 70, y, '🍺', '', 30);
  return new Promise(res=> g.timeline({onComplete:()=>{ L.remove(); R.remove(); res(); }})
    .fromTo(L, {xPercent:-50, yPercent:-50, opacity:0, rotation:-10}, {x:52, rotation:22, opacity:1, duration:.38, ease:'power2.in'})
    .fromTo(R, {xPercent:-50, yPercent:-50, opacity:0, scaleX:-1, rotation:10}, {x:-52, rotation:-22, opacity:1, duration:.38, ease:'power2.in'}, 0)
    .add(()=>{ sound('clang'); burst(x, y - 12, ['✨','•','•','✨','•','•'], {dist:36, dur:.55, size:11, lift:-6}); })
    .to([L, R], {y:-8, opacity:0, duration:.35}, '+=.35'));
};

// ============================================================
// 9. Future lands and scenery (lab concepts only, 2026-10-15; nothing here is hooked into the game yet).
// ============================================================
css('future', `
.fxe-cnode{position:absolute; width:46px; height:46px; margin:-23px 0 0 -23px; border-radius:50%; display:grid; place-items:center; font-size:22px; pointer-events:none; z-index:6;
  background:radial-gradient(circle at 40% 35%, #5a2a3a, #2a0d16); border:2.5px solid #e04a4a; box-shadow:0 4px 10px rgba(0,0,0,.45), 0 0 14px rgba(255,60,60,.55);}
.fxe-cnode.is-magic{background:radial-gradient(circle at 40% 35%, #5a3a8a, #1e1240); border-color:#c9a6ff; box-shadow:0 0 16px rgba(190,140,255,.8);}
.fxe-rune{position:absolute; width:76px; height:76px; margin:-38px 0 0 -38px; pointer-events:none; z-index:5;}
.fxe-patrol{position:absolute; font-size:16px; line-height:1; pointer-events:none; z-index:6; transform:translate(-50%,-90%); filter:drop-shadow(0 2px 2px rgba(0,0,0,.45));}
.fxe-fort{position:absolute; pointer-events:none; z-index:5; transform:translate(-50%,-80%); font-size:26px; line-height:1;}
.fxe-fort i{position:absolute; left:60%; top:-10px; width:2px; height:18px; background:#4a3018;}
.fxe-fort i::after{content:''; position:absolute; left:2px; top:0; width:14px; height:9px; background:linear-gradient(#2a8f86, #1e6a63); border-top:2px solid #c9953a; transform-origin:0 50%; animation:fxeFlag 1s ease-in-out infinite;}
.fxe-hb{position:absolute; font-size:14px; line-height:1; pointer-events:none; z-index:6; transform:translate(-50%,-50%); filter:hue-rotate(var(--h, 0deg)) saturate(1.6) drop-shadow(0 0 4px rgba(255,255,255,.6));}
.fxe-bloom{position:absolute; font-size:18px; pointer-events:none; transform:translate(-50%,-50%); z-index:4;}
.fxe-totem{position:absolute; font-size:26px; pointer-events:none; transform:translate(-50%,-80%); z-index:5; animation:fxeTotem 2.4s ease-in-out infinite;}
@keyframes fxeTotem{0%,100%{filter:drop-shadow(0 0 2px rgba(255,80,160,.4));} 33%{filter:drop-shadow(0 0 12px rgba(255,80,160,1));} 66%{filter:drop-shadow(0 0 12px rgba(40,220,255,1));}}
.fxe-arena{position:absolute; inset:0; overflow:hidden; border-radius:inherit; background:radial-gradient(ellipse 80% 40% at 50% 78%, #e8cf96, #c9a565 60%, #8a6a3a 100%), #3a2a1a;}
.fxe-arena .fa-stand{position:absolute; left:-5%; right:-5%; top:0; height:46%; background:linear-gradient(#2a1d12, #4a3420); border-bottom:6px solid #6b4a2a;}
.fxe-arena .fa-head{position:absolute; width:12px; height:12px; border-radius:50%;}
.fxe-arena .fa-flag{position:absolute; top:6%; width:30px; height:44px; clip-path:polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); transform-origin:50% 0; animation:fxeFlag 1.4s ease-in-out infinite;}
.fxe-grain{position:absolute; inset:0; pointer-events:none; z-index:20; border-radius:inherit;}
.fxe-crt{position:absolute; inset:0; pointer-events:none; z-index:20; border-radius:inherit; background:repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55)); animation:fxeCrt .12s steps(2) infinite;}
@keyframes fxeCrt{from{opacity:.92;} to{opacity:1;}}
.fxe-drop{position:absolute; width:7px; height:9px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.9), rgba(180,210,240,.35) 45%, rgba(40,60,90,.25) 70%); box-shadow:0 1px 2px rgba(0,0,0,.25); pointer-events:none; z-index:21;}
.fxe-inkb{position:absolute; border-radius:50%; background:#141018; pointer-events:none; z-index:30;}
.fxe-raidsp{position:absolute; inset:0; overflow:hidden; border-radius:inherit; background:linear-gradient(#2a1f3a, #4a2a3a 60%, #1a1020);}
.fxe-raidsp .rs-l{position:absolute; left:-10%; right:-10%; bottom:0;}
`);
// Chaos returns (Map 40+): the map pulls back and the advanced fights land one by one, each with a ripple.
M.chaosReturns = function(canvas, opts){
  opts = opts || {}; const g = G(); if(!canvas || !g) return Promise.resolve();
  const spots = opts.spots || [[22, 30], [60, 22], [80, 66], [40, 80]], made = [], magic = !!opts.magic;
  sound(magic ? 'nightSwell' : 'bossRumble');
  const tl = g.timeline({onComplete:()=>{ made.forEach(m=> m.remove()); g.set(canvas, {clearProps:'transform'}); }});
  tl.to(canvas, {scale:.92, duration:.5, ease:'power2.inOut'});
  spots.forEach(([x, y], i)=>{
    let rn = null; if(magic){ rn = document.createElement('div'); rn.className = 'fxe-rune'; rn.innerHTML = `<svg viewBox="-40 -40 80 80" width="76" height="76"><circle r="34" fill="none" stroke="#c9a6ff" stroke-width="2"/><circle r="26" fill="none" stroke="#ffd98a" stroke-width="1" stroke-dasharray="3 4"/>${'ᚱᛟᚨᛉᛞᚹ'.split('').map((c, k)=> `<text x="${Math.cos(k*1.047)*30}" y="${Math.sin(k*1.047)*30 + 3}" font-size="9" text-anchor="middle" fill="#e6d4ff">${c}</text>`).join('')}</svg>`;
      rn.style.left = x + '%'; rn.style.top = y + '%'; canvas.appendChild(rn); made.push(rn); }
    const n = document.createElement('div'); n.className = 'fxe-cnode' + (magic ? ' is-magic' : ''); n.textContent = magic ? '🔮' : ['☠️','💢','🌍','👑'][i % 4]; n.style.left = x + '%'; n.style.top = y + '%'; canvas.appendChild(n); made.push(n);
    const t0 = .4 + i*.32;
    if(rn) tl.fromTo(rn, {scale:0, rotation:-90, opacity:0}, {scale:1, rotation:0, opacity:1, duration:.4, ease:'back.out(2)'}, t0 - .1).to(rn, {rotation:120, duration:2, ease:'none'}, t0 + .3);
    tl.fromTo(n, magic ? {scale:0, y:10, opacity:0} : {y:-160, scale:1.3, opacity:0}, {y:0, scale:1, opacity:1, duration:.4, ease:magic ? 'back.out(2)' : 'power3.in'}, t0)
      .add(()=>{ const c = centre(n); ring(c.x, c.y, magic ? '#c9a6ff' : '#ff6a5a', 110, .7); if(!magic) burst(c.x, c.y + 10, ['•','•','•','•','•'], {dist:36, dur:.5, cls:'fxe-dust', from:Math.PI, spread:Math.PI, fall:0}); sound(magic ? 'readyChime' : 'hitAt', 4, false); }, t0 + .38);
  });
  tl.to(canvas, {scale:1, duration:.5, ease:'power2.inOut'}, .4 + spots.length*.32 + .3).to(made, {opacity:0, duration:.4}, '+=.6');
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ made.forEach(m=> m.remove()); g.set(canvas, {clearProps:'transform'}); res(); }));
};
M.chaosReturns_B = (canvas, opts)=> M.chaosReturns(canvas, Object.assign({}, opts, {magic:true}));
// Otter country: teal-and-bronze banners on little forts, a patrol marching the road (along the given points, in %).
M.otterPatrol = function(canvas, pts, opts){
  opts = opts || {}; const g = G(); if(!canvas || !g || !pts || pts.length < 2) return Promise.resolve();
  const made = [];
  [pts[0], pts[pts.length - 1]].forEach(p=>{ const f = document.createElement('div'); f.className = 'fxe-fort'; f.innerHTML = '🏰<i></i>'; f.style.left = p[0] + '%'; f.style.top = (p[1] - 6) + '%'; canvas.appendChild(f); made.push(f); });
  const troop = ['🦦','🦦','🦦'].map((e, i)=>{ const s = document.createElement('span'); s.className = 'fxe-patrol'; s.textContent = e; canvas.appendChild(s); made.push(s); return s; });
  const o = {p:0}, segs = pts.slice(1).map((b, i)=> ({a:pts[i], b, L:Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])})), tot = segs.reduce((s, x)=> s + x.L, 0);
  const at = d=>{ let r = Math.max(0, Math.min(tot, d)); for(const s of segs){ if(r <= s.L){ const f = r/s.L; return [s.a[0] + (s.b[0] - s.a[0])*f, s.a[1] + (s.b[1] - s.a[1])*f, s.b[0] < s.a[0]]; } r -= s.L; } const l = pts[pts.length - 1]; return [l[0], l[1], false]; };
  return new Promise(res=> g.to(o, {p:1, duration:opts.dur || 4, ease:'none', onUpdate:()=> troop.forEach((s, i)=>{ const [x, y, left] = at(o.p*tot - i*4); s.style.left = x + '%'; s.style.top = (y - Math.abs(Math.sin((o.p*tot - i*4)*1.4))*1.2) + '%'; s.style.transform = `translate(-50%,-90%) scaleX(${left ? 1 : -1})`; }),
    onComplete:()=>{ g.to(made, {opacity:0, duration:.4, onComplete:()=>{ made.forEach(m=> m.remove()); res(); }}); }}));
};
// Hummingbird country: painted cliffs; blossoms, totems that glow in turn, hummingbirds flitting between the flowers.
M.hummingbirdCliffs = function(canvas, opts){
  opts = opts || {}; const g = G(); if(!canvas || !g) return Promise.resolve();
  const blooms = opts.blooms || [[18, 30], [42, 18], [64, 36], [84, 22], [30, 70], [72, 74]], made = [];
  blooms.forEach(([x, y], i)=>{ const b = document.createElement('span'); b.className = 'fxe-bloom'; b.textContent = ['🌺','🌸','🌼','🌺','🪷','🌸'][i % 6]; b.style.left = x + '%'; b.style.top = y + '%'; canvas.appendChild(b); made.push(b); });
  [[10, 58], [90, 52]].forEach(([x, y])=>{ const t = document.createElement('span'); t.className = 'fxe-totem'; t.textContent = '🗿'; t.style.left = x + '%'; t.style.top = y + '%'; canvas.appendChild(t); made.push(t); });
  const birds = [0, 1, 2].map(i=>{ const b = document.createElement('span'); b.className = 'fxe-hb'; b.textContent = '🐦'; b.style.setProperty('--h', (i*110 + 140) + 'deg'); canvas.appendChild(b); made.push(b); return b; });
  const tl = g.timeline({onComplete:()=>{}});
  birds.forEach((b, i)=>{ let cur = blooms[i*2 % blooms.length]; g.set(b, {left:cur[0] + '%', top:(cur[1] - 4) + '%'});
    for(let k = 0; k < 5; k++){ const nx = blooms[(i*2 + k*3 + 1) % blooms.length], dir = nx[0] < cur[0] ? 1 : -1;
      tl.set(b, {scaleX:dir}, i*.2 + k*.9).to(b, {left:nx[0] + '%', top:(nx[1] - 4) + '%', duration:.45, ease:'power2.inOut'}, i*.2 + k*.9)
        .to(b, {y:-3, duration:.06, yoyo:true, repeat:5}, i*.2 + k*.9 + .45); cur = nx; } });
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ g.to(made, {opacity:0, duration:.4, onComplete:()=>{ made.forEach(m=> m.remove()); res(); }}); }));
};
// The Arena as a real arena: a sand floor, the stands full and murmuring, banners in the wind.
M.arenaScene = function(host, opts){
  opts = opts || {}; const g = G(); if(!host) return null;
  const a = document.createElement('div'); a.className = 'fxe-arena'; a.setAttribute('aria-hidden', 'true');
  let h = '<div class="fa-stand">'; const cols = ['#8a5a3a','#6a4a6a','#b07a4a','#4a6a8a','#9a6a3a','#7a3a3a'];
  for(let r = 0; r < 4; r++) for(let i = 0; i < 26; i++) h += `<i class="fa-head" style="left:${(i*4 + (r % 2)*2).toFixed(1)}%; top:${18 + r*20}%; background:${cols[(i*7 + r*3) % cols.length]}"></i>`;
  h += '</div>'; ['#c62828','#2a8f86','#e9b949','#7a3ab0','#c62828'].forEach((c, i)=> h += `<i class="fa-flag" style="left:${8 + i*21}%; background:${c}; animation-delay:${-i*.3}s"></i>`);
  a.innerHTML = h; host.appendChild(a);
  if(g) a.querySelectorAll('.fa-head').forEach((e, i)=> g.to(e, {y:-rnd(2, 5), duration:rnd(.25, .5), yoyo:true, repeat:-1, delay:rnd(0, 1), ease:'sine.inOut'}));
  sound('rallyTone');
  return {el:a, stop:()=>{ if(g) g.killTweensOf(a.querySelectorAll('*')); a.remove(); }};
};
// Raid splash: the depth rig's idea for raids; layers of silhouettes slide against each other (the beast nearest).
M.raidSplash = function(host, opts){
  opts = opts || {}; const g = G(); if(!host || !g) return Promise.resolve();
  const s = document.createElement('div'); s.className = 'fxe-raidsp'; s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<svg class="rs-l" data-d=".2" viewBox="0 0 400 120" preserveAspectRatio="none" style="height:55%"><path d="M0 120 L0 60 L60 20 L110 70 L170 10 L230 64 L290 24 L350 70 L400 40 L400 120Z" fill="#3a2a4a"/></svg>
    <svg class="rs-l" data-d=".5" viewBox="0 0 400 120" preserveAspectRatio="none" style="height:42%"><path d="M0 120 L0 80 L80 50 L140 90 L210 40 L280 86 L340 56 L400 84 L400 120Z" fill="#2a1a34"/></svg>
    <svg class="rs-l" data-d="1" viewBox="0 0 400 200" style="height:80%; left:20%; right:20%"><g fill="#120814"><path d="M120 200 C110 120 150 60 200 50 C250 60 290 120 280 200Z"/><path d="M150 120 C90 100 60 140 40 190 L60 200 C80 160 110 140 160 150Z"/><path d="M250 120 C310 100 340 140 360 190 L340 200 C320 160 290 140 240 150Z"/></g><circle cx="182" cy="92" r="6" fill="#ff4a3a"/><circle cx="218" cy="92" r="6" fill="#ff4a3a"/></svg>
    <div class="rs-l" data-d=".8" style="height:30%; background:linear-gradient(transparent, rgba(150,120,180,.45));"></div>`;
  host.appendChild(s); sound('bossRumble');
  const L = [...s.querySelectorAll('.rs-l')], o = {t:0};
  return new Promise(res=> g.timeline({onComplete:()=>{ s.remove(); res(); }})
    .fromTo(s, {opacity:0}, {opacity:1, duration:.4})
    .to(o, {t:1, duration:opts.dur || 3, ease:'sine.inOut', onUpdate:()=> L.forEach(l=>{ const d = +l.dataset.d; l.style.transform = `translateX(${Math.sin(o.t*Math.PI*2)*d*26}px) translateY(${(1 - o.t)*d*14}px) scale(${1 + d*.05*o.t})`; })}, 0)
    .to(s, {opacity:0, duration:.4}));
};
// Atmosphere packs (optional looks laid over everything): film grain, an old CRT, or rain running down the glass.
M.atmoGrain = function(host){ if(!host) return null; const c = document.createElement('canvas'); c.className = 'fxe-grain'; c.width = 160; c.height = 100; host.appendChild(c); const g2 = c.getContext('2d'); let on = true;
  const tick = ()=>{ if(!on || !c.isConnected) return; const im = g2.createImageData(160, 100); for(let i = 0; i < im.data.length; i += 4){ const v = Math.random()*255|0; im.data[i] = im.data[i+1] = im.data[i+2] = v; im.data[i+3] = 38; } g2.putImageData(im, 0, 0); later(tick, 60); };
  tick(); return {el:c, stop:()=>{ on = false; c.remove(); }}; };
M.atmoCrt = function(host){ if(!host) return null; const c = document.createElement('div'); c.className = 'fxe-crt'; host.appendChild(c); return {el:c, stop:()=> c.remove()}; };
M.atmoRainGlass = function(host, opts){ opts = opts || {}; const g = G(); if(!host || !g) return null; let on = true; const drops = [];
  const spawn = ()=>{ if(!on || !host.isConnected) return; const d = document.createElement('i'); d.className = 'fxe-drop'; d.style.left = rnd(2, 98) + '%'; d.style.top = rnd(-5, 40) + '%'; host.appendChild(d); drops.push(d);
    g.timeline({onComplete:()=> d.remove()}).fromTo(d, {scale:.3, opacity:0}, {scale:rnd(.8, 1.4), opacity:1, duration:.3}).to(d, {y:rnd(60, 220), duration:rnd(1.2, 2.6), ease:'power1.in'}, rnd(.2, 1)).to(d, {opacity:0, duration:.3});
    later(spawn, rnd(60, 160)); };
  spawn(); return {stop:()=>{ on = false; drops.forEach(d=> d.remove()); }}; };
// Ink-wash transition (oriental painting): ink blooms out from the middle and covers the view, then washes away.
M.inkWash = function(host, opts){
  opts = opts || {}; const g = G(); if(!host || !g) return Promise.resolve();
  const r = host.getBoundingClientRect(), R = Math.hypot(r.width, r.height), blobs = [];
  for(let i = 0; i < 7; i++){ const b = document.createElement('i'); b.className = 'fxe-inkb'; const s = R*rnd(.35, .6);
    Object.assign(b.style, {width:s + 'px', height:s + 'px', left:(r.width*rnd(.25, .75) - s/2) + 'px', top:(r.height*rnd(.25, .75) - s/2) + 'px', filter:`blur(${rnd(4, 10)|0}px)`}); host.appendChild(b); blobs.push(b); }
  sound('pageTurn');
  return new Promise(res=> g.timeline({onComplete:()=>{ blobs.forEach(b=> b.remove()); res(); }})
    .fromTo(blobs, {scale:0, opacity:.95}, {scale:opts.brush ? 1.8 : 2.2, duration:.9, ease:'power2.in', stagger:.06})
    .to(blobs, {opacity:0, scale:'+=.4', duration:.8, ease:'power1.out', stagger:.04}, '+=.25'));
};
M.inkWash_B = function(host){ // a single brush stroke wipes across
  const g = G(); if(!host || !g) return Promise.resolve(); const r = host.getBoundingClientRect();
  const s = document.createElement('i'); s.className = 'fxe-inkb'; Object.assign(s.style, {borderRadius:'40% 60% 55% 45%/60% 40% 60% 40%', width:(r.width*1.6) + 'px', height:(r.height*1.3) + 'px', left:(-r.width*1.7) + 'px', top:(-r.height*.15) + 'px', filter:'blur(3px)'}); host.appendChild(s);
  sound('swipeTone');
  return new Promise(res=> g.timeline({onComplete:()=>{ s.remove(); res(); }}).to(s, {x:r.width*1.7, duration:.7, ease:'power2.in'}).to(s, {x:r.width*3.4, duration:.7, ease:'power2.out'}, '+=.2'));
};

// ============================================================
// 10. Game hooks (2026-10-15). One line each in arena_app.js:
//   renderConquestSubTab → fxHook('mapShown', host, map, canvas, progress)   every render of a map
//   renderConquestWorld  → fxHook('mapWorldShown', mainEl)                    the world map
//   activateSpot         → fxHook('mapSpotUnlock', spotEl, key)              first visit only
//   visitCuriosity       → fxHook('mapCurioVisit', el, key)                   first visit only
//   placeMapPawn         → fxHook('mapPawnWalk', pawn, legs)                  when the pawn walks
//   rollDragonScale      → fxHook('dragonScaleFound', {index, total})
//   openQuestsModal      → fxHook('questBoardOpen', modal, opening)
//   openTavern           → fxHook('tavernOpen', modal)
// ============================================================
const SEEN = M._seen = {};
let lastFront = 0;
const DARK_MAPS_E = new Set(['m4', 'mg', 'm8', 'mt', 'mj', 'mz', 'mn', 'mi', 'mx']); // already dark, or always night: no clock tint
function biomeOf(map){ try{ if(typeof MAP_BIOME_OF !== 'undefined') return MAP_BIOME_OF[map.id] || (map.parent && MAP_BIOME_OF[map.parent]) || null; }catch(e){} return null; }
function snapshot(canvas, map){
  const done = new Set(), vis = new Set(), all = new Set(), scales = new Set(), subs = new Set();
  canvas.querySelectorAll(':scope > .map-node').forEach(n=>{ const k = keyOf(n); if(!k || n.classList.contains('kind-tutorial')) return; all.add(k); if(n.classList.contains('done')) done.add(k); if(!n.classList.contains('map-node-hidden') && !n.classList.contains('is-ambush') && !n.classList.contains('is-jumper')) vis.add(k);
    if(n.querySelector('.map-node-scale.is-found')) scales.add(k); });
  canvas.querySelectorAll('.map-subcave:not(.is-locked)').forEach(e=> subs.add(e.dataset.lkey));
  const edge = canvas.querySelector('.world-edge-right'), nextOpen = !!(edge && !edge.classList.contains('is-locked'));
  let cleared = false; try{ cleared = typeof conquestMapCleared === 'function' ? conquestMapCleared(map.id) : (all.size > 0 && done.size === all.size); }catch(e){}
  return {done, vis, all, scales, subs, nextOpen, cleared};
}
// Wait until the map is really in front of the player (no results card, loading veil or dialogue over it), then run.
function whenMapVisible(fn, tries){
  tries = tries || 0;
  const cv = document.getElementById('conquestCanvas'); if(!cv || tries > 80) return;
  const lay = layoutOf(cv), r = cv.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + Math.min(r.height/2, innerHeight/2);
  const top = r.width > 2 ? document.elementFromPoint(x, y) : null;
  const ok = top && lay && lay.contains(top) && !lay.querySelector(':scope > .map-veil') && !(typeof matchState !== 'undefined' && matchState);
  if(ok) fn(cv); else later(()=> whenMapVisible(fn, tries + 1), 300);
}
async function playReturn(mapId, d, progress){
  const q = (cv, k)=> cv.querySelector(`:scope > .map-node[data-lkey="${(window.CSS && CSS.escape) ? CSS.escape(k) : k}"]`);
  whenMapVisible(async cv=>{
    if(!cv.isConnected) return;
    for(const k of d.newDone){ const n = q(cv, k); if(!n) continue; const rank = progress && progress.ranks ? progress.ranks[conquestIdOf(mapId, k)] : null;
      await M.nodeCleared(n, {rank: rank || '✓'}); if(rank && n.isConnected) M.nodeRank(n, rank); }
    for(const k of d.newVis){ const cur = document.getElementById('conquestCanvas'); if(!cur) return; const n = q(cur, k); if(!n) continue;
      if(d.chance.has(k)){ await M.chanceNode(n); continue; }
      const line = cur.querySelector(`.map-trail-svg [data-b="${k}"]`) || cur.querySelector(`.map-trail-svg [data-a="${k}"]`);
      if(line) await M.trailDraw(cur, line, n); else popNode(n, G()); }
    for(const k of d.newScales){ const cur = document.getElementById('conquestCanvas'), n = cur && q(cur, k); if(n){ const c = centre(n); ring(c.x, c.y, '#ff6a3a', 100, .7); burst(c.x, c.y, ['🐉','✨','✨'], {dist:34, dur:.6}); await wait(500); } }
    for(const k of d.newSubs){ const cur = document.getElementById('conquestCanvas'), e = cur && cur.querySelector(`[data-lkey="${k}"]`); if(e) await M.lateSideMap(e); }
    if(d.cleared){ const cur = document.getElementById('conquestCanvas'); if(cur){ const b = biomeOf({id:mapId}), mv = (typeof MAP_BIOMES !== 'undefined' && b && MAP_BIOMES[b]) ? MAP_BIOMES[b].mover.emoji : null;
      let name = ''; try{ const m = CONQUEST_MAPS.find(x=> x.id === mapId); name = m ? m.name : ''; }catch(e){}
      await M.mapCleared(cur, {name, critters: mv ? [mv, mv, '🐿️', mv, '🦔', mv] : null}); } }
    if(d.nextOpen){ const cur = document.getElementById('conquestCanvas'), e = cur && cur.querySelector('.world-edge-right'); if(e){ const boss = cur.querySelector(':scope > .map-node.kind-boss, :scope > .map-node.kind-finalboss'); await M.nextMapUnlocked(e, boss); } }
  });
}
function conquestIdOf(mapId, k){ try{ return typeof conquestNodeId === 'function' ? conquestNodeId(mapId, k) : mapId + ':' + k; }catch(e){ return mapId + ':' + k; } }
M.hooks.mapShown = function(host, map, canvas, progress, env){
  if(!map || !canvas || canvas.classList.contains('layout-editing') || canvas.classList.contains('link-editing')) return;
  const med = env.fxAtLeast('med'), high = env.fxAtLeast('high');
  if(med) M.mapAmbience(host, map.id); else M.stopMapAmbience();
  const dark = DARK_MAPS_E.has(map.id) || !!canvas.querySelector(':scope > .cave-dark');
  M.dayNight(host, canvas, dark ? null : M.todNow()); M.watchTod(dark); // the tint persists across renders and follows the clock (2026-10-16)
  M.decorateNodes(canvas); M.decorateCurios(canvas);
  // a passing weather front: now and then (at most every 4 minutes), on maps with open sky
  const b = biomeOf(map), fk = b && FRONT_OF[b];
  if(high && fk && !dark && Date.now() - lastFront > 240000 && Math.random() < .3){ lastFront = Date.now(); later(()=>{ const h = document.getElementById('conquestLayout'); if(h && h.isConnected) M.weatherFront(h, fk, {duration:18}); }, 2500); }
  // coming back: compare with what this map showed last time this session
  const now = snapshot(canvas, map), prev = SEEN[map.id]; SEEN[map.id] = now;
  if(!prev) return;
  const d = {newDone:[...now.done].filter(k=> !prev.done.has(k)), newVis:[...now.vis].filter(k=> !prev.vis.has(k) && !now.done.has(k)), chance:new Set([...now.all].filter(k=> !prev.all.has(k))),
    newScales:[...now.scales].filter(k=> !prev.scales.has(k)), newSubs:[...now.subs].filter(k=> !prev.subs.has(k)), cleared:now.cleared && !prev.cleared, nextOpen:now.nextOpen && !prev.nextOpen};
  if(d.newDone.length > 4) return; // a big jump (admin unlocks, a restored save): no fanfare
  if(d.newDone.length || d.newVis.length || d.newScales.length || d.newSubs.length || d.cleared || d.nextOpen) playReturn(map.id, d, progress);
};
const WORLD_KEY = 'bramblewood_fxe_world_v1';
M.hooks.mapWorldShown = function(mainEl, env){
  M.stopMapAmbience(); const lay = layoutOf(mainEl); if(lay) M.dayNight(lay, null, null); M._todDark = true;
  if(!mainEl) return;
  const open = [...mainEl.querySelectorAll('.world-stop:not(.is-locked)')].map(s=> (s.className.match(/map-theme-(\w+)/) || [])[1]).filter(Boolean);
  let prev = null; try{ prev = JSON.parse(localStorage.getItem(WORLD_KEY) || 'null'); }catch(e){}
  try{ localStorage.setItem(WORLD_KEY, JSON.stringify(open)); }catch(e){}
  if(!prev) return;
  const fresh = open.filter(id=> !prev.includes(id)); if(!fresh.length || fresh.length > 2) return;
  later(()=> fresh.forEach(id=>{ const s = mainEl.querySelector('.world-stop.map-theme-' + id); if(s && s.isConnected) M.worldFogPeel(s); }), 500);
};
M.hooks.mapSpotUnlock = function(el, key, env){ M.spotUnlock(key, el); };
M.hooks.mapCurioVisit = function(el, key, env){ M.curioFound(el, key); };
M.hooks.mapPawnWalk = function(pawn, legs, env){ if(env.fxAtLeast('med')) M.pawnTrail(pawn, legs); };
M.hooks.dragonScaleFound = function(sc, env){ later(()=> M.scaleFound(sc || {}), 1500); };
M.hooks.questBoardOpen = function(modal, opening, env){ M.questBoardIdle(modal, opening); };
M.hooks.tavernOpen = function(modal, env){ M.tavernOpen(modal, {quiet: !env.fxAtLeast('med')}); };

// ============================================================
// Jumpers land (2026-10-16, user: "This Skirmish is required to be completed before the next one is unlocked, but is hidden at
// first. It looks like 23-2 unlocks 23-3 but, boom. It animates onto the field (meteor, splash, psychic fade, ghost fade etc) -
// represents a strong enemy that wants to jump you."): the fight you just won starts inking its link to the next one, and before it
// gets there the jumper lands across it: a meteor strike, a gator bursting out of the water, a psychic fade-in or a ghost. The old
// link breaks, and the trail redraws through the jumper. arena_app.js (jumperArrivals) calls it once per save through
// fxHook('mapJumperArrive', node, kind, {canvas, from, to}); from/to are the two fights' map positions (percent).
// ============================================================
css('jumper', `
.map-node.fxe-j-hold{opacity:0 !important;}
.fxe-jtease{position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible; z-index:1;}
.fxe-jtease line{stroke:rgba(255,238,196,.95); stroke-width:4; stroke-linecap:round; vector-effect:non-scaling-stroke; filter:drop-shadow(0 0 4px rgba(255,220,140,.9));}
.fxe-meteor{position:fixed; width:30px; height:30px; margin:-15px 0 0 -15px; border-radius:50%; z-index:1215;
  background:radial-gradient(circle at 38% 38%, #fff8d8, #ffc35a 35%, #ee5a1e 62%, rgba(130,30,0,0) 72%); box-shadow:0 0 22px 8px rgba(255,140,40,.75);}
.fxe-mtail{position:fixed; height:14px; margin-top:-7px; border-radius:8px; transform-origin:0 50%; z-index:1214;
  background:linear-gradient(90deg, rgba(255,236,170,.95), rgba(255,130,40,.65) 35%, rgba(150,70,40,.25) 70%, rgba(90,60,50,0)); filter:blur(1.5px);}
.fxe-flash{position:fixed; border-radius:50%; z-index:1213; background:radial-gradient(circle, rgba(255,252,230,.95), rgba(255,190,90,.55) 38%, rgba(255,120,40,0) 70%);}
.fxe-scorch{position:absolute; width:96px; height:48px; margin:-14px 0 0 -48px; border-radius:50%; pointer-events:none; z-index:0;
  background:radial-gradient(ellipse, rgba(28,12,4,.6), rgba(70,26,8,.3) 52%, rgba(70,26,8,0) 72%);}
.fxe-drop{display:block; width:7px; height:10px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:linear-gradient(#f1fdff, #6cc6ef); box-shadow:0 0 5px rgba(150,220,255,.85);}
.fxe-ripple{position:fixed; border:2px solid rgba(200,240,255,.95); border-radius:50%; box-sizing:border-box; z-index:1212; box-shadow:0 0 8px rgba(150,215,255,.6);}
.fxe-column{position:fixed; width:46px; margin-left:-23px; border-radius:45% 45% 12% 12%; transform-origin:50% 100%; z-index:1213;
  background:linear-gradient(180deg, rgba(236,252,255,.95), rgba(130,205,245,.75) 45%, rgba(70,150,215,0));}
.fxe-psy{position:fixed; border:2px solid rgba(214,150,255,.95); border-radius:50%; box-sizing:border-box; z-index:1212;
  box-shadow:0 0 16px rgba(190,110,255,.75), inset 0 0 12px rgba(190,110,255,.5);}
.fxe-echo{position:fixed; z-index:1214; font-size:30px; line-height:1; transform:translate(-50%, -50%); mix-blend-mode:screen;}
.fxe-mist{position:fixed; border-radius:50%; z-index:1212; filter:blur(5px); background:radial-gradient(ellipse, rgba(232,240,255,.6), rgba(200,214,240,.28) 45%, rgba(200,214,240,0) 70%);}
.fxe-wisp{display:block; width:6px; height:6px; border-radius:50%; background:#eef4ff; box-shadow:0 0 8px 3px rgba(190,210,255,.8);}
`);
function jLines(canvas, key){ return canvas ? [...canvas.querySelectorAll(`.map-trail-svg [data-a="${key}"], .map-trail-svg [data-b="${key}"]`)] : []; }
// The tease: the old link from `from` starts inking towards `to`, and stops where the jumper lands.
function jTease(canvas, from, to, upto){
  const g = G(); if(!canvas || !from || !to || !g) return {stop(){}, done: Promise.resolve()};
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), ln = document.createElementNS(ns, 'line');
  svg.setAttribute('class', 'fxe-jtease'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
  ln.setAttribute('x1', from.x); ln.setAttribute('y1', from.y); ln.setAttribute('x2', from.x); ln.setAttribute('y2', from.y); svg.appendChild(ln);
  const t = canvas.querySelector(':scope > .map-trail-svg'); if(t && t.nextSibling) canvas.insertBefore(svg, t.nextSibling); else canvas.appendChild(svg);
  const o = {p:0}; sound('mapUnroll');
  const done = new Promise(res=> g.to(o, {p: upto || .55, duration:.75, ease:'power1.inOut', onUpdate:()=>{ ln.setAttribute('x2', from.x + (to.x - from.x)*o.p); ln.setAttribute('y2', from.y + (to.y - from.y)*o.p); }, onComplete:res}));
  return {done, stop(){ g.to(svg, {opacity:0, duration:.25, onComplete:()=> svg.remove()}); }};
}
// The four ways in. Each resolves at its impact; `node` is shown by then.
const ENTRANCES = {
  meteor(node, c, g, canvas){
    const sx = c.x + Math.min(320, innerWidth*.35), sy = c.y - Math.min(340, innerHeight*.45), ang = Math.atan2(c.y - sy, c.x - sx), len = Math.hypot(c.x - sx, c.y - sy);
    const m = layer('fxe-meteor'), tail = layer('fxe-mtail');
    tail.style.transform = `rotate(${ang*57.2958 + 180}deg)`;
    sound('boom');
    return new Promise(res=> g.timeline({onComplete:res})
      .fromTo(m, {left:sx, top:sy, scale:.6}, {left:c.x, top:c.y, scale:1.1, duration:.62, ease:'power2.in'})
      .fromTo(tail, {left:sx, top:sy, width:20}, {left:c.x, top:c.y, width:Math.min(220, len*.7), duration:.62, ease:'power2.in'}, 0)
      .add(()=>{
        m.remove(); tail.remove(); sound('siegeTone');
        const f = layer('fxe-flash'); Object.assign(f.style, {left:(c.x - 90) + 'px', top:(c.y - 90) + 'px', width:'180px', height:'180px'});
        g.fromTo(f, {scale:.2, opacity:1}, {scale:1.4, opacity:0, duration:.55, ease:'power2.out', onComplete:()=> f.remove()});
        ring(c.x, c.y, '#ffb05a', 150, .7); later(()=> ring(c.x, c.y, '#ffd99a', 230, .8), 90);
        burst(c.x, c.y, ['🪨', '🔥', '✨', '🪨', '🔥'], {n:12, dist:80, dur:.8, lift:-18, fall:26});
        if(canvas && !canvas.classList.contains('tut-zoom')) g.fromTo(canvas, {x:-5}, {x:0, duration:.45, ease:'elastic.out(1.4, .25)', clearProps:'transform'});
        if(canvas){ const sc = document.createElement('i'); sc.className = 'fxe-scorch'; sc.setAttribute('aria-hidden', 'true'); sc.style.left = node.style.left; sc.style.top = node.style.top; canvas.insertBefore(sc, canvas.firstChild);
          g.to(sc, {opacity:0, duration:1.4, delay:2.6, onComplete:()=> sc.remove()}); }
        node.classList.remove('fxe-j-hold'); const ico = node.querySelector('.map-node-ico');
        g.fromTo(node, {opacity:0}, {opacity:1, duration:.15}); if(ico) g.fromTo(ico, {scale:.2, y:-14}, {scale:1, y:0, duration:.55, ease:'back.out(2.6)', clearProps:'transform'});
      }));
  },
  splash(node, c, g){
    const ico = node.querySelector('.map-node-ico');
    for(let i = 0; i < 3; i++) later(()=>{ const r = layer('fxe-ripple'); Object.assign(r.style, {left:(c.x - 40) + 'px', top:(c.y - 10) + 'px', width:'80px', height:'26px'});
      g.fromTo(r, {scale:.2, opacity:1}, {scale:2.2 + i*.4, opacity:0, duration:1, ease:'power2.out', onComplete:()=> r.remove()}); }, i*160);
    const col = layer('fxe-column'); Object.assign(col.style, {left:c.x + 'px', top:(c.y - 96) + 'px', height:'110px'});
    sound('splash');
    return new Promise(res=> g.timeline({onComplete:res})
      .fromTo(col, {scaleY:0, opacity:.9}, {scaleY:1, duration:.32, ease:'power3.out'}, .15)
      .add(()=>{
        burst(c.x, c.y - 30, [{t:'\u200b', cls:'fxe-drop'}], {n:16, dist:70, dur:.75, lift:-30, fall:40, from:-Math.PI, spread:Math.PI});
        node.classList.remove('fxe-j-hold'); g.fromTo(node, {opacity:0}, {opacity:1, duration:.2});
        if(ico) g.fromTo(ico, {y:26, scale:.7}, {y:0, scale:1, duration:.6, ease:'back.out(2.2)', clearProps:'transform'});
        sound('splash');
      })
      .to(col, {scaleY:0, opacity:0, duration:.45, ease:'power2.in', onComplete:()=> col.remove()}, '+=.08'));
  },
  psychic(node, c, g){
    const ico = node.querySelector('.map-node-ico'), txt = ico ? ico.textContent : '❔';
    sound('nightSwell');
    for(let i = 0; i < 3; i++){ const r = layer('fxe-psy'); Object.assign(r.style, {left:(c.x - 60) + 'px', top:(c.y - 60) + 'px', width:'120px', height:'120px'});
      g.fromTo(r, {scale:2.6, opacity:0}, {scale:.3, opacity:.95, duration:.8, delay:i*.18, ease:'power2.in', onComplete:()=> g.to(r, {opacity:0, duration:.18, onComplete:()=> r.remove()})}); }
    const ech = [['#ff6bd6', -34], ['#6be8ff', 34]].map(([col, dx])=>{ const e = layer('fxe-echo', txt); Object.assign(e.style, {left:(c.x + dx) + 'px', top:c.y + 'px', color:col, textShadow:`0 0 10px ${col}`}); return {e, dx}; });
    return new Promise(res=> g.timeline({onComplete:res})
      .fromTo(ech.map(o=> o.e), {opacity:0}, {opacity:.75, duration:.35}, .1)
      .to(ech.map(o=> o.e), {left:c.x, duration:.75, ease:'power2.inOut'}, .2)
      .add(()=>{
        ech.forEach(o=> o.e.remove()); node.classList.remove('fxe-j-hold');
        g.fromTo(node, {opacity:0, filter:'blur(6px) hue-rotate(80deg) saturate(2)'}, {opacity:1, filter:'blur(0px) hue-rotate(0deg) saturate(1)', duration:.7, ease:'power2.out', clearProps:'filter'});
        ring(c.x, c.y, '#d08cff', 130, .6); sound('unlockChime');
      }, .95));
  },
  ghost(node, c, g){
    sound('nightSwell');
    for(let i = 0; i < 2; i++){ const m = layer('fxe-mist'); Object.assign(m.style, {left:(c.x - 70 + i*20) + 'px', top:(c.y - 30) + 'px', width:'120px', height:'64px'});
      g.timeline({onComplete:()=> m.remove()}).fromTo(m, {scale:.4, opacity:0, x:-10}, {scale:1.2, opacity:1, x:10, duration:.9, ease:'sine.out', delay:i*.2}).to(m, {opacity:0, y:-24, duration:1, ease:'sine.in'}); }
    burst(c.x, c.y, [{t:'\u200b', cls:'fxe-wisp'}], {n:8, dist:40, dur:1.4, lift:-36, fall:-10});
    node.classList.remove('fxe-j-hold');
    return new Promise(res=> g.timeline({onComplete:res})
      .fromTo(node, {opacity:0, filter:'grayscale(1) brightness(1.6) blur(3px)'}, {opacity:.45, duration:.35})
      .to(node, {opacity:.12, duration:.18}).to(node, {opacity:.7, duration:.25}).to(node, {opacity:.3, duration:.15})
      .to(node, {opacity:1, filter:'grayscale(0) brightness(1) blur(0px)', duration:.6, ease:'sine.out', clearProps:'filter'}));
  },
};
M.JUMPER_ENTRANCES = Object.keys(ENTRANCES);
M.jumperArrive = async function(node, kind, opts){
  opts = opts || {}; const g = G(); if(!node || !g) return;
  const canvas = opts.canvas || canvasOf(node), key = keyOf(node), lines = jLines(canvas, key);
  // whatever already stands on its spot (the pawn walking to the next open fight, a lantern pool) waits with it
  const nx = parseFloat(node.style.left), ny = parseFloat(node.style.top), near = canvas ? [...canvas.children].filter(e=> e !== node && e.style && e.style.left && Math.abs(parseFloat(e.style.left) - nx) < 3 && Math.abs(parseFloat(e.style.top) - ny) < 4) : [];
  node.classList.add('fxe-j-hold'); lines.forEach(l=> l.style.opacity = '0'); near.forEach(e=> e.style.visibility = 'hidden');
  const unhold = ()=> near.forEach(e=>{ e.style.visibility = ''; if(g) g.fromTo(e, {opacity:0}, {opacity:1, duration:.5, clearProps:'opacity'}); });
  const show = ()=>{ node.classList.remove('fxe-j-hold'); lines.forEach(l=> l.style.opacity = ''); unhold(); };
  try{
    await wait(opts.delay == null ? 900 : opts.delay);
    if(!node.isConnected){ show(); return; }
    const np = {x: parseFloat(node.style.left), y: parseFloat(node.style.top)}, from = opts.from, to = opts.to;
    // the old link reaches about as far as where the jumper lands (its point on the old line)
    let upto = .55; if(from && to && isFinite(np.x)){ const dx = to.x - from.x, dy = to.y - from.y, L2 = dx*dx + dy*dy || 1; upto = Math.max(.3, Math.min(.85, ((np.x - from.x)*dx + (np.y - from.y)*dy) / L2)); }
    const tease = jTease(canvas, from, to, upto); await tease.done;
    await (ENTRANCES[kind] || ENTRANCES.meteor)(node, centre(node), g, canvas);
    tease.stop(); unhold();
    await wait(250);
    lines.forEach(l=>{ l.style.transition = 'opacity .5s ease'; l.style.opacity = '1'; later(()=>{ l.style.transition = ''; l.style.opacity = ''; }, 600); });
  }catch(e){ show(); }
};
M.hooks.mapJumperArrive = function(node, kind, opts, env){ if(!env.fxAtLeast('low')) return; M.jumperArrive(node, kind, opts); };
// Night lifting on the battlefield: the veil fades (arena_app.js syncNightVeil) and the morning light drifts across.
M.hooks.fieldNightLifts = function(bf, env){ if(env.fxAtLeast('med')) M.nightRetreat(bf, {n:7}); };

})(typeof window !== 'undefined' ? window : globalThis);
