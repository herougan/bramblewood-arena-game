/* ============================================================
   Bramblewood FX, batch B (2026-10-15): status (part), field, weather-time, darkness-light
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.B: FX.B.someEffect(el, opts); variants are FX.B.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-b-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxb- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.B.onEvent / FX.B.hooks.

   2026-10-15 (batch B build): what is in here, by area
   - Statuses: poison / bleed / decay landing, decay tick, freeze counters melting, the hit modifiers players couldn't
     see (Staggered half hit, Shocked +50%, Exposed cashed in, Resist / Weak, Supreme crushing a defence), Keen Sense
     shrugging off Blind, irradiation tokens landing and eating stats, petrification creeping up, Inspired spent, the
     caged leader bursting free, First Blood, and two planned statuses (Burn, Chill).
   - Darkness & light: the "lights go out" moment per darkness level (three looks to choose from), a miss look per
     level, the light coming back, a persistent look for units that can't see (and for Sun-shy by day and Night-blind
     at night) against glowing eyes for Darksight and a warm light pool round a Lantern, the Lantern guttering out,
     Lantern / Keen Sense saves, Shade and Shadow at night, Beware's red eyes, Devilry stars, and three planned looks.
   - Weather & time: day breaks, dawn, dusk, twilight (with the toast fixed in arena_app.js), the realtime clock, moon
     phases (three looks), ebb, high tide, perma-tide current, Moonpull, wind gust / calm / swap, Headwind echo,
     rain starting and stopping on the map, the initiative coin, and the planned Syzygy / Eclipse.
   - Fields: a board-wide wash per field card, the field ending, the map field returning, Frigid's icicles and the
     frost sliding off native units, Spring Rain's drizzle, Thick Fog banks and Full Moon light while they last, the
     "?" field row flipping over, the terrain banner, the mountain settling, the tide-spout column, Deep Mines, the
     +Lumber rule, the forecast pill, the arena ruleset seal, and ten planned field rules (lab only).
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.B = FX.B || {};
const TAG = 'b';

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
// (Batch B's onEvent and hooks are at the end of this file.)
M.hooks = M.hooks || {};

// ---- batch B helpers (2026-10-15) ----
const pick = a=> a[Math.floor(Math.random()*a.length)];
const bfOf = el=> (el && el.closest && el.closest('#battlefieldEl')) || document.getElementById('battlefieldEl');
const rectOf = el=>{ const t = tileOf(el); return t && t.getBoundingClientRect ? t.getBoundingClientRect() : null; };
const VIEW = ()=> ({left:0, top:0, width:innerWidth, height:innerHeight, right:innerWidth, bottom:innerHeight});
// The board an effect fills: opts.host, else the battlefield, else the window.
function hostRect(o, el){ const h = (o && o.host) || bfOf(el); const r = h && h.getBoundingClientRect ? h.getBoundingClientRect() : null; return r && r.width ? r : VIEW(); }
// A fixed overlay laid exactly over a rect (plus pad px each side).
function over(r, cls, html, pad){ pad = pad || 0; const d = layer(cls, html);
  Object.assign(d.style, {left:(r.left - pad) + 'px', top:(r.top - pad) + 'px', width:(r.width + 2*pad) + 'px', height:(r.height + 2*pad) + 'px'}); return d; }
// Run a GSAP timeline, then remove `nodes`, call opts.onDone and resolve. Without GSAP: clean up at once.
function run(nodes, opts, build){
  const g = G(); nodes = (nodes || []).filter(Boolean);
  const end = ()=>{ nodes.forEach(n=>{ try{ if(g) g.killTweensOf(n); n.remove(); }catch(e){} }); call(opts && opts.onDone); };
  if(!g){ end(); return Promise.resolve(); }
  return new Promise(res=>{ const t = g.timeline({onComplete:()=>{ end(); res(); }}); try{ build(t, g); }catch(e){ t.kill(); end(); res(); } });
}
// n absolutely-positioned particles inside `box` (an overlay). make(i) returns {html, cls, style} or a glyph string.
function bits(box, n, make){ const out = []; for(let i = 0; i < n; i++){ const s = make(i); const p = document.createElement('i');
  p.className = 'fxb-bit ' + ((s && s.cls) || ''); if(typeof s === 'string') p.textContent = s; else if(s && s.text) p.textContent = s.text; if(s && s.style) p.style.cssText += s.style;
  box.appendChild(p); out.push(p); } return out; }
const sideRow = side=> document.getElementById(side === 'A' ? 'rowMine' : 'rowEnemy');
const isMineEl = el=> !!(el && el.closest && el.closest('#rowMine, .bottom-play-row'));
const defsOf = env=> (env && env.defs) || (typeof getCardDefs === 'function' ? getCardDefs() : {}) || {};
const effOf = (defs, id)=> ((defs[id] || {}).effects) || {};
css('base', `/* 2026-10-15: above the board's own stacking (cards and HUD climb past 1200), level with SkillFX's layers (9989) */
.fxb{z-index:9980;}
.fxb-bit{position:absolute; left:0; top:0; display:block; pointer-events:none; font-style:normal; line-height:1; will-change:transform, opacity;}
.fxb-ov{overflow:hidden;} .fxb-round{border-radius:10px;}
@media (prefers-reduced-motion: reduce){ .fxb-persist, .fxb-persist *{animation:none !important;} }`);

// A small chip that pops beside a card (what a hit modifier did): kind = resist | weak | shock | stagger | expose | keen | shade | crush | gold
css('chip', `.fxb-chip{position:fixed; z-index:9990; padding:2px 8px 3px; border-radius:999px; font:800 12px/1.2 'Baloo 2', system-ui, sans-serif; white-space:nowrap;
  color:#fff; background:rgba(28,24,20,.9); border:1.5px solid rgba(255,255,255,.35); box-shadow:0 2px 8px rgba(0,0,0,.45); transform-origin:50% 100%;}
.fxb-chip.k-resist{background:linear-gradient(180deg,#8d96a3,#5a6270); border-color:#d6dde6;}
.fxb-chip.k-weak{background:linear-gradient(180deg,#e2453b,#9b1610); border-color:#ffc2b8;}
.fxb-chip.k-shock{background:linear-gradient(180deg,#38d6ff,#6b3cff); border-color:#d6f6ff; text-shadow:0 0 6px #aef1ff;}
.fxb-chip.k-stagger{background:linear-gradient(180deg,#b1a28b,#6e6152); border-color:#efe3cc;}
.fxb-chip.k-expose{background:linear-gradient(180deg,#ff5a4a,#a3170e); border-color:#ffd0c7;}
.fxb-chip.k-keen{background:linear-gradient(180deg,#e7b35a,#9b6a1d); border-color:#ffe6b0;}
.fxb-chip.k-shade{background:linear-gradient(180deg,#6f5aa8,#2c2050); border-color:#cbbcff;}
.fxb-chip.k-crush{background:linear-gradient(90deg,#ff6b6b,#ffd56e,#7cf29a,#6ec8ff,#c89bff); color:#1d1530; border-color:#fff;}
.fxb-chip.k-gold{background:linear-gradient(180deg,#ffd56e,#c98a12); color:#3a2504; border-color:#fff2c4;}
.fxb-chip.k-dark{background:linear-gradient(180deg,#3a3550,#14111f); border-color:#8f86b8; color:#e6e0ff;}`);
function chip(el, text, kind, o){
  o = o || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const c = layer('fxb-chip k-' + (kind || 'resist')); c.className = 'fxb fxb-chip k-' + (kind || 'resist'); c.textContent = text;
  const g = G(); const x = r.left + r.width*(o.fx == null ? .78 : o.fx), y = r.top + r.height*(o.fy == null ? .12 : o.fy);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  return run([c], o, (t)=> t.fromTo(c, {xPercent:-50, yPercent:-100, scale:.3, opacity:0, rotation:-8}, {scale:1, opacity:1, rotation:0, duration:.22, ease:'back.out(3)'})
    .to(c, {y:-16, opacity:0, duration:.35, ease:'power1.in'}, '+=' + ((o.hold || 650)/1000)));
}
M.chip = chip;
// An expanding ring at a point.
function ringAt(x, y, o){ o = o || {}; const d = layer('fxb-ring'); const s = o.size || 60;
  d.style.cssText += `left:${x - s/2}px; top:${y - s/2}px; width:${s}px; height:${s}px; border-radius:50%; border:${o.w || 3}px solid ${o.color || '#fff'}; box-shadow:0 0 12px ${o.glow || o.color || '#fff'};`;
  return run([d], o, t=> t.fromTo(d, {scale:.2, opacity:1}, {scale:o.to || 2.2, opacity:0, duration:(o.dur || 600)/1000, ease:'power2.out', delay:(o.delay || 0)/1000})); }

/* ================================ STATUSES ================================ */

// Poison applied (st-poison-apply, was the number only): green glop splats onto the card, ooze rises from its foot
// and bubbles pop. Swamp green.
css('poison', `.fxb-glop{position:absolute; width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #e6ff9a, #7bd33a 45%, #2f7a14 100%); box-shadow:0 0 8px rgba(140,230,60,.7);}
.fxb-ooze{position:absolute; left:0; right:0; bottom:0; height:100%; background:linear-gradient(0deg, rgba(70,170,30,.62), rgba(120,215,60,.38) 55%, rgba(160,240,90,0)); transform-origin:50% 100%;
  -webkit-mask:radial-gradient(14px 10px at 15% 0, transparent 98%, #000) top/100% 100% no-repeat; border-radius:0 0 10px 10px;}
.fxb-bub{position:absolute; width:9px; height:9px; border-radius:50%; border:1.5px solid rgba(220,255,160,.9); background:rgba(150,230,80,.25);}`);
M.poisonApply = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-ov fxb-round'); const ooze = document.createElement('i'); ooze.className = 'fxb-bit fxb-ooze'; box.appendChild(ooze);
  const blobs = bits(box, 4, i=> ({cls:'fxb-glop', style:`left:${20 + i*18}%; top:${15 + (i%2)*22}%;`}));
  const bub = bits(box, 6, i=> ({cls:'fxb-bub', style:`left:${10 + i*14}%; top:78%;`}));
  return run([box], opts, (t)=>{
    blobs.forEach((b, i)=> t.fromTo(b, {x:r.width*.9, y:-r.height*.7, scale:.5, opacity:0}, {x:0, y:0, scale:1, opacity:1, duration:.22, ease:'power2.in'}, i*.06)
      .to(b, {scaleX:2.1, scaleY:.45, duration:.1, ease:'power2.out'}, i*.06 + .22).to(b, {opacity:0, duration:.35}, i*.06 + .45));
    t.call(()=> call(opts.onImpact), null, .24);
    t.fromTo(ooze, {scaleY:0}, {scaleY:.42, duration:.45, ease:'power2.out'}, .25).to(ooze, {opacity:0, duration:.35}, .75);
    bub.forEach((b, i)=> t.fromTo(b, {y:0, scale:.4, opacity:0}, {y:-r.height*rnd(.25, .5), x:rnd(-8, 8), scale:1.1, opacity:1, duration:.4, ease:'power1.out'}, .35 + i*.05).to(b, {scale:1.6, opacity:0, duration:.12}, '>'));
  });
};

// Bleed applied (st-bleed-apply): a quick gash across the card, then drops fall from it.
css('bleed', `.fxb-gash{position:absolute; left:8%; top:44%; width:84%; height:6px; border-radius:6px; transform-origin:0 50%;
  background:linear-gradient(90deg, rgba(255,240,240,0), #fff 18%, #ff3b3b 45%, #8a0b12); box-shadow:0 0 10px rgba(255,40,40,.75);}
.fxb-drop{position:absolute; width:7px; height:10px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 40% 35%, #ff8a8a, #d31d2a 55%, #6d0710);}
.fxb-seep{position:absolute; inset:0; background:radial-gradient(ellipse 70% 30% at 50% 46%, rgba(200,20,30,.45), transparent 70%); border-radius:10px;}`);
M.bleedApply = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-round', '<i class="fxb-bit fxb-seep"></i><i class="fxb-bit fxb-gash"></i>'); const gash = box.querySelector('.fxb-gash'), seep = box.querySelector('.fxb-seep');
  const drops = bits(box, 5, i=> ({cls:'fxb-drop', style:`left:${18 + i*15 + rnd(-4, 4)}%; top:46%;`}));
  return run([box], opts, (t)=>{
    t.set(gash, {rotation:-14}).fromTo(gash, {scaleX:0, opacity:1}, {scaleX:1, duration:.13, ease:'power3.out'}).call(()=> call(opts.onImpact))
      .fromTo(seep, {opacity:0}, {opacity:1, duration:.15}, '<').to(gash, {opacity:.0, duration:.5, ease:'power1.in'}, '+=.15').to(seep, {opacity:0, duration:.4}, '<');
    drops.forEach((d, i)=> t.fromTo(d, {y:-4, scale:.4, opacity:0}, {y:r.height*rnd(.32, .55), scale:1, opacity:1, duration:.5, ease:'power2.in'}, .14 + i*.06).to(d, {opacity:0, scaleY:.4, duration:.12}, '>'));
  });
};

// Decay applied (st-decay-apply, was silent): grey-violet mould creeps in from the corners. Morel Hollow.
css('decay', `.fxb-mould{position:absolute; width:62%; height:52%; border-radius:50%; filter:blur(5px);
  background:radial-gradient(circle at 50% 50%, rgba(150,128,180,.85), rgba(98,82,120,.6) 45%, rgba(70,60,90,0) 72%);}
.fxb-spore{position:absolute; width:4px; height:4px; border-radius:50%; background:#d9c9f2; box-shadow:0 0 5px #b79be0;}
.fxb-sword{position:absolute; left:50%; top:52%; font:900 26px/1 system-ui; color:#ece6f6; text-shadow:0 0 8px #6f5aa8, 0 2px 0 #2a2140;}`);
M.decayApply = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-ov fxb-round');
  const corners = [[-14, -12], [52, -12], [-14, 60], [52, 60]];
  const mould = bits(box, 4, i=> ({cls:'fxb-mould', style:`left:${corners[i][0]}%; top:${corners[i][1]}%;`}));
  const sp = bits(box, 10, i=> ({cls:'fxb-spore', style:`left:${rnd(10, 90)}%; top:${rnd(55, 95)}%;`}));
  return run([box], opts, (t)=>{
    mould.forEach((m, i)=> t.fromTo(m, {scale:.1, opacity:0}, {scale:1, opacity:1, duration:.55, ease:'power2.out'}, i*.07).to(m, {opacity:0, duration:.4}, .85));
    sp.forEach((s, i)=> t.fromTo(s, {opacity:0, y:0}, {opacity:.95, y:-r.height*rnd(.2, .45), x:rnd(-10, 10), duration:.8, ease:'sine.out'}, .2 + i*.04).to(s, {opacity:0, duration:.2}, '>-.15'));
    t.call(()=> call(opts.onImpact), null, .3);
  });
};
// Decay tick (st-decay-tick, reused the bleed tint): the mould flares, a puff of spores bursts and a grey sword crumbles
// (Decay saps Attack as well as Health).
M.decayTick = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-round'); box.style.overflow = 'visible';
  const fuzz = bits(box, 3, i=> ({cls:'fxb-mould', style:`left:${[-6, 40, 16][i]}%; top:${[8, 20, 52][i]}%;`}));
  const sp = bits(box, 12, ()=> ({cls:'fxb-spore', style:'left:50%; top:50%;'}));
  const sw = bits(box, 1, ()=> ({cls:'fxb-sword', text:'⚔'}))[0];
  const frag = bits(box, 4, i=> ({cls:'fxb-bit', text:'▪', style:`left:${46 + i*3}%; top:56%; color:#b9aecb; font-size:9px;`}));
  return run([box], opts, (t)=>{
    fuzz.forEach((f, i)=> t.fromTo(f, {scale:.5, opacity:0}, {scale:1.25, opacity:.95, duration:.25, ease:'power2.out'}, i*.05).to(f, {scale:1.5, opacity:0, duration:.45}, .4));
    sp.forEach((s, i)=>{ const a = i/12*Math.PI*2; t.fromTo(s, {x:0, y:0, opacity:1, scale:1}, {x:Math.cos(a)*r.width*.62, y:Math.sin(a)*r.height*.48, opacity:0, scale:.3, duration:.7, ease:'power2.out'}, .1); });
    t.fromTo(sw, {xPercent:-50, yPercent:-50, scale:1.2, opacity:0}, {scale:1, opacity:1, duration:.15}, .05).to(sw, {opacity:0, y:14, duration:.25, ease:'power2.in'}, .42)
      .call(()=> call(opts.onImpact), null, .12);
    frag.forEach((f, i)=> t.fromTo(f, {opacity:0}, {opacity:1, duration:.01}, .42).to(f, {x:rnd(-22, 22), y:rnd(22, 42), rotation:rnd(-200, 200), opacity:0, duration:.5, ease:'power2.in'}, .43));
  });
};

// Freeze counter melts (st-freeze-tick, was "❄ Thawed" at 0 only): ice chips break off and water drips from the foot.
// At the last counter (left 0) the whole crust cracks away with a puff of steam.
css('thaw', `.fxb-ice{position:absolute; width:16px; height:12px; background:linear-gradient(135deg,#ffffff,#bfe6ff 50%,#6aa9d8); clip-path:polygon(0 0,100% 18%,72% 100%,12% 76%); opacity:.95;}
.fxb-drip{position:absolute; width:5px; height:9px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:linear-gradient(180deg,#e6f6ff,#7fc4ef); box-shadow:0 0 4px rgba(160,220,255,.8);}
.fxb-crust{position:absolute; inset:0; border-radius:10px; background:linear-gradient(160deg, rgba(235,248,255,.55), rgba(160,210,240,.25) 60%, rgba(200,235,255,.5)); box-shadow:inset 0 0 12px rgba(255,255,255,.8);}
.fxb-steam{position:absolute; width:26px; height:26px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,.75), rgba(255,255,255,0) 70%); filter:blur(2px);}`);
M.thawDrip = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const last = !(opts.left > 0);
  const box = over(r, 'fxb-round'); box.style.overflow = 'visible';
  const crust = last ? bits(box, 1, ()=> ({cls:'fxb-crust'}))[0] : null;
  const ice = bits(box, last ? 6 : 3, i=> ({cls:'fxb-ice', style:`left:${[4, 78, 40, 14, 66, 50][i]}%; top:${[2, 4, 0, 40, 36, 70][i]}%;`}));
  const drips = bits(box, last ? 5 : 3, i=> ({cls:'fxb-drip', style:`left:${18 + i*(last ? 15 : 28)}%; top:96%;`}));
  const steam = last ? bits(box, 4, i=> ({cls:'fxb-steam', style:`left:${10 + i*22}%; top:30%;`})) : [];
  return run([box], opts, (t)=>{
    if(crust) t.fromTo(crust, {opacity:1}, {opacity:0, duration:.55, ease:'power1.in'}, .15);
    ice.forEach((c, i)=> t.fromTo(c, {opacity:1, x:0, y:0, rotation:0}, {x:(i%2 ? 1 : -1)*rnd(8, 20), y:r.height*rnd(.45, .8), rotation:rnd(-160, 160), opacity:0, duration:.6, ease:'power2.in'}, i*.06));
    drips.forEach((d, i)=> t.fromTo(d, {y:-2, scaleY:.4, opacity:0}, {scaleY:1, opacity:1, duration:.18}, .1 + i*.09).to(d, {y:22, opacity:0, duration:.32, ease:'power2.in'}, '>'));
    steam.forEach((s, i)=> t.fromTo(s, {y:0, scale:.5, opacity:0}, {y:-r.height*.45, scale:1.8, opacity:.8, duration:.45, ease:'sine.out'}, .1 + i*.05).to(s, {opacity:0, duration:.3}, '>'));
    t.call(()=> call(opts.onImpact), null, .1);
  });
};

// Staggered attacker's hit lands at half (st-stagger-weak-hit): the swing lands with a dull dusty thump and a "½" chip.
M.staggerWeakHit = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const dust = over(r, '', '', 0); dust.style.overflow = 'visible';
  const puffs = bits(dust, 6, i=> ({cls:'fxb-steam', style:`left:${10 + i*14}%; top:70%; background:radial-gradient(circle, rgba(190,170,140,.75), rgba(190,170,140,0) 70%);`}));
  cp = chip(el, '💢 ½ hit', 'stagger', {hold:700});
  if(opts.att){ const a = tileOf(opts.att), g = G(); if(a && g) g.fromTo(a, {rotation:0}, {rotation:4, duration:.08, yoyo:true, repeat:3, ease:'sine.inOut', clearProps:'rotation'}); }
  return Promise.all([cp, run([dust], opts, (t)=> puffs.forEach((p, i)=> t.fromTo(p, {scale:.4, opacity:.9, x:0}, {scale:1.6, x:(i - 2.5)*8, y:-10, opacity:0, duration:.6, ease:'power2.out'}, i*.03)))]);
};

// Keen Sense ignores Blind (st-blind-keen-sense) and senses in the dark (dark-keen-sense): whisker ripples spread from
// its nose; with `ink`, the ink flicked at it bounces off.
css('keen', `.fxb-whisk{position:absolute; left:50%; top:30%; width:40px; height:24px; border:2px solid rgba(255,220,150,.95); border-bottom:none; border-left-color:transparent; border-right-color:transparent;
  border-radius:50% 50% 0 0 / 100% 100% 0 0; box-shadow:0 -2px 8px rgba(255,200,110,.6);}
.fxb-ink{position:absolute; width:10px; height:10px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #5c5470, #0d0b14 70%);}`);
M.keenSense = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible';
  const w = bits(box, 3, ()=> ({cls:'fxb-whisk'}));
  const ink = opts.ink ? bits(box, 4, i=> ({cls:'fxb-ink', style:`left:${[-20, 110, -14, 104][i]}%; top:${[10, 18, 44, 50][i]}%;`})) : [];
  if(opts.chip !== false) cp = chip(el, opts.label || '👃 Keen Sense', 'keen', {fy:.05, hold:700});
  return Promise.all([cp, run([box], opts, (t)=>{
    w.forEach((c, i)=> t.fromTo(c, {xPercent:-50, yPercent:-50, scale:.4, opacity:0}, {scale:2.6, opacity:1, duration:.35, ease:'sine.out'}, i*.16).to(c, {scale:3.6, opacity:0, duration:.3}, '>-.05'));
    ink.forEach((k, i)=>{ const toward = (i%2 ? -1 : 1); t.fromTo(k, {opacity:1, x:0, y:0}, {x:toward*r.width*.42, y:r.height*.08, duration:.2, ease:'power2.in'}, .05 + i*.05)
      .to(k, {x:toward*r.width*.1, y:-r.height*.3, rotation:toward*120, opacity:0, scale:.5, duration:.4, ease:'power2.out'}, '>'); });
  })]);
};

// Shocked target takes +50% (st-shock-bonus-dmg): electric arcs jump over the card on impact and a "+50%" chip pops.
css('shock', `.fxb-arc{position:absolute; inset:-10%; width:120%; height:120%; overflow:visible;}
.fxb-arc polyline{fill:none; stroke-linecap:round; stroke-linejoin:round;}
.fxb-flash{position:absolute; inset:0; border-radius:10px; background:radial-gradient(circle, rgba(200,250,255,.85), rgba(120,160,255,.25) 60%, transparent 75%); mix-blend-mode:screen;}`);
const zig = (x0, y0, x1, y1, n, j)=>{ const p = []; for(let i = 0; i <= n; i++){ const k = i/n; p.push(`${(x0 + (x1 - x0)*k + (i && i < n ? rnd(-j, j) : 0)).toFixed(1)},${(y0 + (y1 - y0)*k + (i && i < n ? rnd(-j, j) : 0)).toFixed(1)}`); } return p.join(' '); };
M.shockSpark = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const arcs = [0, 1, 2].map(()=> zig(rnd(0, 30), rnd(0, 100), rnd(70, 100), rnd(0, 100), 7, 9));
  const box = over(r, '', `<i class="fxb-bit fxb-flash"></i><svg class="fxb-arc" viewBox="0 0 100 100" preserveAspectRatio="none">${arcs.map(p=> `<polyline points="${p}" stroke="#8b5cff" stroke-width="7" opacity=".6" vector-effect="non-scaling-stroke"/><polyline points="${p}" stroke="#e8fbff" stroke-width="2.4" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`);
  box.style.overflow = 'visible'; const fl = box.querySelector('.fxb-flash'), sv = box.querySelector('svg');
  cp = chip(el, '⚡ +50%', 'shock', {hold:600});
  return Promise.all([cp, run([box], opts, (t)=> t.fromTo(fl, {opacity:0}, {opacity:1, duration:.05}).to(fl, {opacity:0, duration:.3}).fromTo(sv, {opacity:1}, {opacity:0, duration:.06, repeat:5, yoyo:true}, 0).to(sv, {opacity:0, duration:.15}))]);
};

// Hit on an Exposed unit (st-expose-bonus-hit): the red crosshair snaps shut on it and shatters.
css('expose', `.fxb-reticle{position:absolute; left:50%; top:46%; width:70%; aspect-ratio:1; border-radius:50%; border:3px solid #ff4a3a; box-shadow:0 0 10px rgba(255,60,40,.8), inset 0 0 8px rgba(255,60,40,.5);}
.fxb-reticle::before, .fxb-reticle::after{content:''; position:absolute; background:#ff4a3a; box-shadow:0 0 6px #ff4a3a;}
.fxb-reticle::before{left:50%; top:-18%; width:3px; height:136%; transform:translateX(-50%);} .fxb-reticle::after{top:50%; left:-18%; height:3px; width:136%; transform:translateY(-50%);}
.fxb-shard{position:absolute; left:50%; top:46%; width:10px; height:4px; background:#ff6b5b; box-shadow:0 0 6px #ff3b2b;}`);
M.exposeCash = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const ret = bits(box, 1, ()=> ({cls:'fxb-reticle'}))[0];
  const sh = bits(box, 8, ()=> ({cls:'fxb-shard'}));
  cp = chip(el, opts.crit ? '🎯 Crit!' : opts.amount ? `🎯 +${opts.amount}` : '🎯 Exposed!', 'expose', {hold:600}); // 2026-10-16: an Expose counter makes the hit a crit
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(ret, {xPercent:-50, yPercent:-50, scale:1.7, rotation:-45, opacity:0}, {scale:.75, rotation:0, opacity:1, duration:.22, ease:'power3.in'}).call(()=> call(opts.onImpact))
      .to(ret, {scale:.55, opacity:0, duration:.12});
    sh.forEach((s, i)=>{ const a = i/8*Math.PI*2; t.fromTo(s, {xPercent:-50, yPercent:-50, x:0, y:0, rotation:a*57.3, opacity:1}, {x:Math.cos(a)*r.width*.6, y:Math.sin(a)*r.width*.6, opacity:0, duration:.45, ease:'power2.out'}, .22); });
  })]);
};

// Irradiation tokens land (st-irradiation-apply, was "☢️ +N" only): sickly green hex tokens arc from the source to the
// unit and stick with a flash; the card flickers green. Uranium, World 3.
css('rad', `.fxb-tok{position:fixed; z-index:9985; width:20px; height:22px; display:grid; place-items:center; font:900 11px/1 system-ui; color:#173a06;
  background:radial-gradient(circle at 40% 35%, #f2ffb8, #9cff3a 55%, #3c9a10); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); filter:drop-shadow(0 0 6px #9cff3a);}
.fxb-radglow{position:absolute; inset:-4px; border-radius:12px; box-shadow:0 0 0 2px rgba(160,255,90,.9), 0 0 22px 6px rgba(120,255,60,.55); background:rgba(120,255,60,.10);}
.fxb-radspark{position:absolute; width:3px; height:3px; background:#d8ff7a; box-shadow:0 0 6px #9cff3a;}
.fxb-radpix{position:absolute; width:5px; height:5px; background:#9cff3a; box-shadow:0 0 4px #6dff2a;}
.fxb-radicon{position:absolute; left:50%; top:50%; font:900 24px/1 system-ui; filter:drop-shadow(0 0 6px #9cff3a);}`);
M.irradiate = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const sr = opts.src && opts.src !== el ? rectOf(opts.src) : null; const n = Math.max(1, Math.min(5, opts.tokens || 2));
  const glow = over(r, '', '<i class="fxb-bit fxb-radglow"></i>'); glow.style.overflow = 'visible'; const gl = glow.firstChild;
  const sparks = bits(glow, 8, ()=> ({cls:'fxb-radspark', style:`left:${rnd(5, 95)}%; top:${rnd(5, 95)}%;`}));
  const toks = []; for(let i = 0; i < n; i++){ const k = layer('fxb-tok'); k.className = 'fxb fxb-tok'; k.textContent = '☢'; toks.push(k); }
  const tx = r.left + r.width/2, ty = r.top + r.height*.45;
  return run([glow, ...toks], opts, (t)=>{
    toks.forEach((k, i)=>{ const sx = sr ? sr.left + sr.width/2 : tx + rnd(-30, 30), sy = sr ? sr.top + sr.height/2 : ty - r.height*.7;
      const mid = {x:(sx + tx)/2 + rnd(-30, 30), y:Math.min(sy, ty) - 50};
      t.set(k, {x:sx - 10, y:sy - 11, opacity:0, scale:.5}, 0)
        .to(k, {opacity:1, scale:1, duration:.1}, i*.1)
        .to(k, {keyframes:[{x:mid.x - 10, y:mid.y - 11, duration:.22, ease:'power1.out'}, {x:tx - 10 + (i - (n - 1)/2)*14, y:ty - 11, duration:.22, ease:'power2.in'}]}, i*.1 + .05)
        .to(k, {scale:1.6, opacity:0, duration:.18}, '>'); });
    t.call(()=> call(opts.onImpact), null, .5);
    t.fromTo(gl, {opacity:0}, {opacity:1, duration:.1, repeat:3, yoyo:true}, .48).to(gl, {opacity:0, duration:.35}, '>');
    sparks.forEach((s, i)=> t.fromTo(s, {opacity:0}, {opacity:1, y:-rnd(6, 18), duration:.15, repeat:1, yoyo:true}, .5 + i*.04));
  });
};
// Irradiation eats a stat (st-irradiation-tick, "skill loss was a word"): each point lost shows as its icon (❤ ⚔ ✦)
// glowing green and dissolving into drifting pixels.
M.radDecay = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const pts = (opts.points && opts.points.length ? opts.points : [{kind:'hp'}]).slice(0, 4);
  const box = over(r, '', '<i class="fxb-bit fxb-radglow"></i>'); box.style.overflow = 'visible'; const gl = box.firstChild;
  const icons = pts.map((p, i)=>{ const e = document.createElement('i'); e.className = 'fxb-bit fxb-radicon'; e.textContent = p.kind === 'hp' ? '❤' : p.kind === 'atk' ? '⚔' : '✦';
    e.style.left = (50 + (i - (pts.length - 1)/2)*26) + '%'; e.style.color = p.kind === 'hp' ? '#ff6b6b' : p.kind === 'atk' ? '#f2e6c8' : '#ffd56e'; box.appendChild(e); return e; });
  const pix = icons.map(ic=>{ const L = ic.style.left; return bits(box, 7, ()=> ({cls:'fxb-radpix', style:`left:${L}; top:50%;`})); });
  return run([box], opts, (t)=>{
    t.fromTo(gl, {opacity:0}, {opacity:.9, duration:.12, repeat:2, yoyo:true}).to(gl, {opacity:0, duration:.4}, '>');
    icons.forEach((ic, i)=>{ const at = .08 + i*.13;
      t.fromTo(ic, {xPercent:-50, yPercent:-50, scale:.4, opacity:0}, {scale:1.15, opacity:1, duration:.16, ease:'back.out(2.5)'}, at)
        .to(ic, {color:'#9cff3a', duration:.12}, at + .2).to(ic, {opacity:0, scale:.7, duration:.18}, at + .32);
      pix[i].forEach((p, j)=> t.fromTo(p, {opacity:0, x:rnd(-9, 9), y:rnd(-9, 9)}, {opacity:1, duration:.01}, at + .32).to(p, {x:'+=' + rnd(-16, 16), y:-rnd(24, 48), opacity:0, scale:.4, duration:.55, ease:'power1.out'}, at + .33 + j*.015)); });
  });
};

// Petrification (st-petrified-apply, was an instant grey): stone creeps up from the foot with a jagged edge, cracks
// run through it and grit falls. The game's grey .is-petrified look stays after. Basalt grey.
css('petrify', `.fxb-stone{position:absolute; inset:0; border-radius:10px;
  background:radial-gradient(circle at 30% 70%, rgba(255,255,255,.12) 0 2px, transparent 3px) 0 0/14px 14px, radial-gradient(circle at 70% 30%, rgba(0,0,0,.14) 0 2px, transparent 3px) 0 0/11px 11px,
  linear-gradient(180deg, #9a958e, #6f6a64 60%, #57534e); mix-blend-mode:normal; opacity:.86; box-shadow:inset 0 0 10px rgba(0,0,0,.45);}
.fxb-cracks{position:absolute; inset:0; width:100%; height:100%;} .fxb-cracks polyline{fill:none; stroke:#2c2926; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round;}
.fxb-grit{position:absolute; width:4px; height:4px; background:#8f8a83; border-radius:1px;}`);
M.petrify = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const cr = [zig(50, 100, 42, 30, 6, 6), zig(48, 62, 12, 44, 4, 5), zig(46, 50, 86, 26, 4, 5)];
  const box = over(r, 'fxb-round', `<i class="fxb-bit fxb-stone"></i><svg class="fxb-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">${cr.map(p=> `<polyline points="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</svg>`);
  box.style.overflow = 'visible'; const st = box.querySelector('.fxb-stone'), lines = [...box.querySelectorAll('polyline')];
  const grit = bits(box, 8, i=> ({cls:'fxb-grit', style:`left:${8 + i*11}%; top:98%;`}));
  const jag = k=>{ const y = (100 - k*100).toFixed(1); const pts = [0, 12, 25, 37, 50, 62, 75, 87, 100].map((x, i)=> `${x}% ${Math.max(0, +y + (k < 1 ? (i%2 ? 6 : -4) : 0))}%`); return `polygon(${pts.join(',')},100% 100%,0 100%)`; };
  return run([box], opts, (t)=>{
    const o = {k:0}; t.to(o, {k:1, duration:.7, ease:'power1.inOut', onUpdate:()=> st.style.clipPath = jag(o.k)}, 0);
    lines.forEach((l, i)=> t.to(l, {strokeDashoffset:0, duration:.18, ease:'power2.out'}, .62 + i*.07));
    t.call(()=> call(opts.onImpact), null, .7);
    grit.forEach((g, i)=> t.fromTo(g, {opacity:0}, {opacity:1, y:rnd(6, 16), x:rnd(-6, 6), duration:.3, ease:'bounce.out'}, .72 + i*.02).to(g, {opacity:0, duration:.2}, '>'));
    t.to(box, {opacity:0, duration:.35}, 1.05);
  });
};

// Inspired bonus spent (st-inspired-spent): the gold the ally gave flares on the attacker and streaks into its swing.
css('inspire', `.fxb-gold{position:absolute; inset:-3px; border-radius:12px; box-shadow:0 0 0 2px #ffd56e, 0 0 20px 6px rgba(255,200,80,.6);}
.fxb-gspark{position:absolute; left:50%; top:50%; width:4px; height:16px; border-radius:3px; background:linear-gradient(180deg,#fff7d0,#ffbf3a); box-shadow:0 0 8px #ffcf5a;}`);
M.inspiredSpend = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve(); const up = opts.up != null ? opts.up : isMineEl(el);
  const box = over(r, '', '<i class="fxb-bit fxb-gold"></i>'); box.style.overflow = 'visible'; const g0 = box.firstChild;
  const sp = bits(box, 7, ()=> ({cls:'fxb-gspark'}));
  cp = chip(el, '📯 Inspired!', 'gold', {fy:.0, hold:450});
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(g0, {opacity:0}, {opacity:1, duration:.12}).to(g0, {opacity:0, duration:.35}, '+=.1');
    sp.forEach((s, i)=> t.fromTo(s, {xPercent:-50, yPercent:-50, x:(i - 3)*r.width*.1, y:0, opacity:0, scaleY:.3}, {y:(up ? -1 : 1)*r.height*rnd(.6, .9), opacity:1, scaleY:1.2, duration:.32, ease:'power2.in'}, .05 + i*.03).to(s, {opacity:0, duration:.1}, '>'));
  })]);
};

// Caged leader freed (st-cage-broken, was a toast): bronze bars over the leader, the padlock shakes and springs open,
// the bars burst outward with a gold flash.
css('cage', `.fxb-bar{position:absolute; top:-6%; width:7%; height:112%; border-radius:4px; background:linear-gradient(90deg,#6b4416,#e2a64a 45%,#8a5a1e); box-shadow:0 0 4px rgba(0,0,0,.5);}
.fxb-lock{position:absolute; left:50%; top:48%; font:900 30px/1 system-ui; filter:drop-shadow(0 2px 3px rgba(0,0,0,.6));}
.fxb-gflash{position:absolute; inset:-20%; border-radius:50%; background:radial-gradient(circle, rgba(255,240,180,.95), rgba(255,200,80,.35) 45%, transparent 70%);}`);
M.cageBurst = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible';
  const fl = bits(box, 1, ()=> ({cls:'fxb-gflash'}))[0];
  const bars = bits(box, 5, i=> ({cls:'fxb-bar', style:`left:${8 + i*19}%;`}));
  const lock = bits(box, 1, ()=> ({cls:'fxb-lock', text:'🔒'}))[0];
  return run([box], opts, (t)=>{
    t.fromTo(bars, {opacity:0, y:-20}, {opacity:1, y:0, duration:.18, stagger:.03, ease:'power2.out'}, 0)
      .fromTo(lock, {xPercent:-50, yPercent:-50, scale:.4, opacity:0}, {scale:1, opacity:1, duration:.18, ease:'back.out(3)'}, .1)
      .to(lock, {rotation:14, duration:.06, yoyo:true, repeat:5, ease:'sine.inOut'}, .32)
      .call(()=>{ lock.textContent = '🔓'; call(opts.onImpact); }, null, .7)
      .fromTo(fl, {opacity:0, scale:.4}, {opacity:1, scale:1.1, duration:.15}, .7).to(fl, {opacity:0, duration:.4}, '>')
      .to(lock, {y:-30, scale:1.3, opacity:0, duration:.45, ease:'power2.out'}, .74);
    bars.forEach((b, i)=>{ const d = i - 2; t.to(b, {x:d*r.width*.55 + (d === 0 ? 30 : 0), y:-r.height*rnd(.1, .5), rotation:d*40 + rnd(-30, 30), opacity:0, duration:.55, ease:'power2.out'}, .72); });
  });
};

// Supreme crushes a defence (st-ward-crush): a pale hex ward appears on the target, prismatic cracks race across it
// and it shatters into rainbow shards. Dragons, sphinxes, leviathans.
css('crush', `.fxb-ward{position:absolute; inset:-8%; width:116%; height:116%; overflow:visible;}
.fxb-pshard{position:absolute; left:50%; top:50%; width:12px; height:12px; clip-path:polygon(50% 0,100% 100%,0 70%);}`);
M.wardCrush = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const cr = [zig(50, 50, 8, 20, 4, 5), zig(50, 50, 92, 30, 4, 5), zig(50, 50, 30, 94, 4, 5), zig(50, 50, 84, 86, 4, 5)];
  const box = over(r, '', `<svg class="fxb-ward" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="fxbPrism" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".3" stop-color="#ffd56e"/><stop offset=".55" stop-color="#7cf29a"/><stop offset=".8" stop-color="#6ec8ff"/><stop offset="1" stop-color="#c89bff"/></linearGradient></defs>
    <polygon points="50,3 95,27 95,73 50,97 5,73 5,27" fill="rgba(220,235,255,.18)" stroke="rgba(235,245,255,.95)" stroke-width="2.5"/>
    ${cr.map(p=> `<polyline points="${p}" fill="none" stroke="url(#fxbPrism)" stroke-width="2.6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</svg>`);
  box.style.overflow = 'visible'; const sv = box.querySelector('svg'), lines = [...sv.querySelectorAll('polyline')];
  const cols = ['#ff6b6b', '#ffd56e', '#7cf29a', '#6ec8ff', '#c89bff'];
  const sh = bits(box, 10, i=> ({cls:'fxb-pshard', style:`background:${cols[i%5]}; box-shadow:0 0 6px ${cols[i%5]};`}));
  cp = chip(el, '💎 Crushed!', 'crush', {hold:600});
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(sv, {opacity:0, scale:.9, transformOrigin:'50% 50%'}, {opacity:1, scale:1, duration:.12});
    lines.forEach((l, i)=> t.to(l, {strokeDashoffset:0, duration:.14, ease:'power2.out'}, .12 + i*.03));
    t.call(()=> call(opts.onImpact), null, .3).to(sv, {opacity:0, scale:1.15, duration:.15}, .32);
    sh.forEach((s, i)=>{ const a = i/10*Math.PI*2; t.fromTo(s, {xPercent:-50, yPercent:-50, opacity:1, rotation:0}, {x:Math.cos(a)*r.width*rnd(.5, .8), y:Math.sin(a)*r.height*rnd(.4, .7), rotation:rnd(-300, 300), opacity:0, duration:.55, ease:'power2.out'}, .3); });
  })]);
};

// Resist / Weak-to hit (st-resist-weak-hit; the inventory asks for variants): why a number came out small or big.
//   A: a chip beside the number ("🛡 Resist ½" grey / "💥 Weak ×2" red)       (in the game)
//   B: a stamp on the card: a grey dome the blow glances off / red cracks splitting the card
//   C: a "½" / "×2" badge popping from the card's corner with an arrow
css('resist', `.fxb-dome{position:absolute; inset:-6%; border-radius:50% 50% 12px 12px / 40% 40% 12px 12px; border:3px solid rgba(220,228,238,.95); background:radial-gradient(ellipse at 50% 30%, rgba(235,240,248,.35), rgba(150,160,175,.12) 60%, transparent);
  box-shadow:0 0 14px rgba(210,220,235,.8), inset 0 0 18px rgba(255,255,255,.35);}
.fxb-redcr{position:absolute; inset:0; width:100%; height:100%;} .fxb-redcr polyline{fill:none; stroke:#ff3b2b; stroke-width:2.4; stroke-linecap:round; filter:drop-shadow(0 0 3px #ff2b1b);}
.fxb-badge{position:fixed; z-index:9990; min-width:34px; height:34px; padding:0 6px; border-radius:999px; display:grid; place-items:center; font:900 17px/1 'Baloo 2', system-ui; color:#fff; border:2px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,.45);}
.fxb-badge.k-resist{background:linear-gradient(180deg,#9aa3b0,#5a6270);} .fxb-badge.k-weak{background:linear-gradient(180deg,#ff5a4a,#a3170e);}`);
M.resistHit = function(el, opts){ opts = opts || {}; const weak = opts.kind === 'weak';
  return chip(el, weak ? '💥 Weak ×2' : '🛡 Resist ½', weak ? 'weak' : 'resist', Object.assign({hold:700, fx:.5, fy:1.2}, opts)); }; // 2026-10-15: says the factor
M.resistHit_B = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const weak = opts.kind === 'weak';
  const box = weak ? over(r, '', `<svg class="fxb-redcr" viewBox="0 0 100 100" preserveAspectRatio="none">${[zig(50, 40, 6, 12, 4, 6), zig(50, 40, 95, 22, 4, 6), zig(50, 40, 40, 98, 5, 6), zig(50, 40, 88, 90, 4, 6)].map(p=> `<polyline points="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</svg>`)
    : over(r, '', '<i class="fxb-bit fxb-dome"></i>');
  box.style.overflow = 'visible';
  return run([box], opts, (t)=>{
    if(weak){ box.querySelectorAll('polyline').forEach((l, i)=> t.to(l, {strokeDashoffset:0, duration:.16, ease:'power3.out'}, i*.03)); t.to(box, {opacity:0, duration:.35}, .7); }
    else { const d = box.firstChild; t.fromTo(d, {scale:.85, opacity:0}, {scale:1, opacity:1, duration:.12, ease:'back.out(3)'}).to(d, {scale:1.08, duration:.08, yoyo:true, repeat:1}).to(d, {opacity:0, duration:.35}, '+=.25'); }
  });
};
M.resistHit_C = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const weak = opts.kind === 'weak';
  const b = layer('fxb-badge'); b.className = 'fxb fxb-badge k-' + (weak ? 'weak' : 'resist'); b.textContent = weak ? '×2' : '½';
  b.style.left = (r.right - 6) + 'px'; b.style.top = (r.top + 6) + 'px';
  return run([b], opts, (t)=> t.fromTo(b, {xPercent:-50, yPercent:-50, scale:0, rotation:weak ? -30 : 30}, {scale:1, rotation:0, duration:.25, ease:'back.out(3)'})
    .to(b, {y:weak ? -10 : 10, duration:.25, ease:'sine.inOut', yoyo:true, repeat:1}).to(b, {opacity:0, scale:.6, duration:.25}, '+=.2'));
};

// First Blood (fld-first-blood-rule, was a float): a red splash and a "First Blood" stamp across the card.
css('firstblood', `.fxb-fbstamp{position:absolute; left:50%; top:46%; padding:3px 10px; border:3px solid #ff3b2b; border-radius:6px; color:#ff3b2b; background:rgba(255,240,235,.85);
  font:900 15px/1 'Baloo 2', system-ui; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap; box-shadow:0 0 12px rgba(255,40,30,.6);}
.fxb-fbsplat{position:absolute; left:50%; top:46%; width:110%; aspect-ratio:1; background:radial-gradient(circle, rgba(210,20,30,.55) 0 28%, transparent 30%), radial-gradient(circle at 20% 30%, rgba(210,20,30,.55) 0 8%, transparent 9%), radial-gradient(circle at 78% 70%, rgba(210,20,30,.5) 0 7%, transparent 8%);}`);
M.firstBlood = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, '', '<i class="fxb-bit fxb-fbsplat"></i><i class="fxb-bit fxb-fbstamp">First Blood</i>'); box.style.overflow = 'visible';
  const sp = box.querySelector('.fxb-fbsplat'), st = box.querySelector('.fxb-fbstamp');
  const drops = bits(box, 6, ()=> ({cls:'fxb-drop', style:'left:50%; top:46%;'}));
  return run([box], opts, (t)=>{
    t.fromTo(sp, {xPercent:-50, yPercent:-50, scale:.2, opacity:0}, {scale:1, opacity:1, duration:.16, ease:'power3.out'})
      .fromTo(st, {xPercent:-50, yPercent:-50, scale:2.4, rotation:-14, opacity:0}, {scale:1, rotation:-8, opacity:1, duration:.2, ease:'power3.in'}, .08).call(()=> call(opts.onImpact))
      .to([sp, st], {opacity:0, duration:.35}, '+=.6');
    drops.forEach((d, i)=>{ const a = -Math.PI/2 + (i - 2.5)*.45; t.fromTo(d, {x:0, y:0, opacity:1}, {x:Math.cos(a)*r.width*.6, y:Math.sin(a)*r.height*.5 + 30, opacity:0, duration:.55, ease:'power1.out'}, .1); });
  });
};

// Planned (D65): Burn, the Scorch side effect: embers cling to the card's foot and a charred edge glows.
css('burn', `.fxb-ember{position:absolute; width:4px; height:4px; border-radius:50%; background:#ffcf5a; box-shadow:0 0 6px #ff7a1a, 0 0 2px #fff;}
.fxb-char{position:absolute; inset:0; border-radius:10px; box-shadow:inset 0 -14px 16px -6px rgba(255,90,20,.75), inset 0 0 0 2px rgba(60,20,8,.5);}`);
M.burnApply = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-round', '<i class="fxb-bit fxb-char"></i>'); box.style.overflow = 'visible'; const ch = box.firstChild;
  const em = bits(box, 14, ()=> ({cls:'fxb-ember', style:`left:${rnd(4, 96)}%; top:${rnd(78, 98)}%;`}));
  cp = chip(el, '🔥 Burn 1', 'weak', {hold:800});
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(ch, {opacity:0}, {opacity:1, duration:.2}).to(ch, {opacity:.55, duration:.12, yoyo:true, repeat:3}).to(ch, {opacity:0, duration:.4});
    em.forEach((e, i)=> t.fromTo(e, {opacity:0, y:0}, {opacity:1, y:-rnd(10, 40), x:rnd(-8, 8), duration:rnd(.5, .9), ease:'sine.out'}, i*.04).to(e, {opacity:0, duration:.2}, '>-.1'));
  })]);
};
// Planned (D65): Chill, the Cold side effect (+1 Wait): frost creeps over the corners and the hourglass frosts over.
css('chill', `.fxb-frostc{position:absolute; width:46%; height:40%; background:radial-gradient(circle at 0 0, rgba(235,248,255,.95), rgba(170,220,250,.55) 40%, transparent 70%); filter:blur(1px);}
.fxb-hg{position:absolute; left:50%; top:46%; font:900 30px/1 system-ui; filter:drop-shadow(0 0 6px #9fd8ff);}`);
M.chillApply = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, 'fxb-ov fxb-round'); const cs = [[0, 0, 0], [54, 0, 90], [0, 60, 270], [54, 60, 180]];
  const fr = bits(box, 4, i=> ({cls:'fxb-frostc', style:`left:${cs[i][0]}%; top:${cs[i][1]}%; transform:rotate(${cs[i][2]}deg);`}));
  const hg = bits(box, 1, ()=> ({cls:'fxb-hg', text:'⏳'}))[0];
  cp = chip(el, '❄ +1 Wait', 'shock', {hold:800});
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(fr, {opacity:0, scale:.3}, {opacity:1, scale:1, duration:.45, stagger:.05, ease:'power2.out'})
      .fromTo(hg, {xPercent:-50, yPercent:-50, scale:.4, opacity:0, rotation:0}, {scale:1.1, opacity:1, rotation:180, duration:.45, ease:'back.out(2)'}, .15)
      .to(hg, {filter:'drop-shadow(0 0 10px #e8f7ff) brightness(1.6) saturate(.3)', duration:.25}, '>').to([...fr, hg], {opacity:0, duration:.4}, '+=.3');
  })]);
};

/* ============================ DARKNESS & LIGHT ============================ */
const DARK_A = {dark:.5, pitch:.75, absolute:.93};
const DARK_NAME = {dark:'Darkness', pitch:'Pitch Black', absolute:'Absolute darkness'};
css('dark', `.fxb-dk{border-radius:14px; overflow:hidden;}
.fxb-dkfill{position:absolute; inset:0; background:radial-gradient(ellipse at 50% 50%, rgba(4,4,12,.55) 10%, rgba(2,2,8,1) 100%);}
.fxb-torch{position:absolute; top:50%; width:46%; height:120%; border-radius:50%; background:radial-gradient(ellipse at 50% 50%, rgba(255,190,90,.65), rgba(255,140,40,.25) 40%, transparent 70%); mix-blend-mode:screen;}
.fxb-smoke{position:absolute; width:34px; height:34px; border-radius:50%; background:radial-gradient(circle, rgba(170,165,180,.7), transparent 70%); filter:blur(3px);}
.fxb-eyes{position:absolute; width:22px; height:8px;} .fxb-eyes::before, .fxb-eyes::after{content:''; position:absolute; top:0; width:7px; height:7px; border-radius:50%; background:radial-gradient(circle, #fff6c8, #ffc23a 50%, rgba(255,160,20,0) 75%); box-shadow:0 0 8px #ffb21a;}
.fxb-eyes::before{left:0;} .fxb-eyes::after{right:0;} .fxb-eyes.is-red::before, .fxb-eyes.is-red::after{background:radial-gradient(circle, #ffd6d6, #ff3020 50%, rgba(255,0,0,0) 75%); box-shadow:0 0 9px #ff2010;}
.fxb-dkname{position:absolute; left:50%; top:50%; padding:4px 14px; border-radius:999px; background:rgba(10,8,20,.7); border:1px solid rgba(190,180,255,.35); color:#e8e2ff; font:800 15px/1.2 'Baloo 2', system-ui; white-space:nowrap; letter-spacing:.03em;}
.fxb-curtain{position:absolute; left:-2%; right:-2%; top:0; height:118%; background:linear-gradient(180deg, rgba(2,2,8,1) 0%, rgba(4,4,14,.96) 82%, rgba(4,4,14,0) 100%);}
.fxb-moth{position:absolute; width:9px; height:6px; border-radius:50% 50% 40% 40%; background:#e9e4d6; box-shadow:0 0 4px rgba(255,250,230,.8);}
.fxb-flame{position:absolute; left:50%; top:50%; width:16px; height:30px; border-radius:50% 50% 45% 45% / 62% 62% 38% 38%; background:radial-gradient(ellipse at 50% 70%, #fff8d8, #ffcf4a 35%, #ff7a1a 70%, rgba(255,90,20,0) 80%); box-shadow:0 0 26px 10px rgba(255,170,60,.55); transform-origin:50% 90%;}
.fxb-wick{position:absolute; left:50%; top:50%; width:3px; height:9px; margin:12px 0 0 -1.5px; background:#2a1d10;}
.fxb-flood{position:absolute; left:50%; top:50%; width:40px; height:40px; margin:-20px; border-radius:50%; background:radial-gradient(circle, rgba(2,2,8,1) 55%, rgba(2,2,8,0) 72%);}`);
function darkBox(o, el){ const r = hostRect(o, el); return {r, box:over(r, 'fxb-dk')}; }
function veilOf(o){ const h = (o && o.host) || document.getElementById('battlefieldEl'); return o && o.veil !== undefined ? o.veil : (h && h.querySelector(':scope > .dark-veil')); }
// Eyes that open, look and close in the dark (absolute darkness, Beware).
function eyesIn(box, r, t, at, n, red){ const es = bits(box, n, ()=> ({cls:'fxb-eyes' + (red ? ' is-red' : ''), style:`left:${rnd(10, 82)}%; top:${rnd(14, 78)}%;`}));
  es.forEach((e, i)=> t.fromTo(e, {scaleY:0, opacity:0}, {scaleY:1, opacity:1, duration:.12}, at + i*.14).to(e, {x:rnd(-5, 5), duration:.3}, '>').to(e, {scaleY:0, duration:.1}, '>+.15')); return es; }
// Darkness falls (dark-dark-enter / dark-pitch-enter / dark-absolute-enter): the fight opens and the lights go out.
//   A torches gutter out, B a black curtain drops, C a candle is snuffed and the dark floods out from it.
// opts.level 'dark' | 'pitch' | 'absolute'; the game's .dark-veil (the lasting darkness) fades in underneath.
M.darkEnter = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const lvl = opts.level || 'dark', A = DARK_A[lvl] || .5;
  const {r, box} = darkBox(opts); const fill = bits(box, 1, ()=> ({cls:'fxb-dkfill'}))[0]; const veil = veilOf(opts);
  const torches = bits(box, 2, i=> ({cls:'fxb-torch', style:`left:${i ? 77 : -23}%;`}));
  const smoke = bits(box, 2, i=> ({cls:'fxb-smoke', style:`left:${i ? 92 : 3}%; top:48%;`}));
  const name = bits(box, 1, ()=> ({cls:'fxb-dkname', text:'🌑 ' + DARK_NAME[lvl]}))[0];
  return run([box], opts, (t, g)=>{
    if(veil) t.set(veil, {opacity:0}, 0);
    t.set(torches, {yPercent:-50}, 0).fromTo(fill, {opacity:0}, {opacity:0, duration:.01}, 0);
    [.9, .35, 1, .5, .85, .2, .6, 0].forEach((v, i)=> t.to(torches, {opacity:v, scale:.7 + v*.35, duration:.09, ease:'none'}, .05 + i*.1));
    t.to(fill, {opacity:A, duration:.7, ease:'power2.in'}, .55);
    smoke.forEach((s, i)=> t.fromTo(s, {y:0, opacity:0, scale:.5}, {y:-r.height*.3, opacity:.85, scale:1.6, duration:.6, ease:'sine.out'}, .8 + i*.05).to(s, {opacity:0, duration:.3}, '>'));
    t.fromTo(name, {xPercent:-50, yPercent:-50, opacity:0, scale:.9}, {opacity:1, scale:1, duration:.25}, 1.0).to(name, {opacity:0, duration:.3}, 1.75);
    if(lvl === 'absolute') eyesIn(box, r, t, 1.25, 3);
    if(veil) t.to(veil, {opacity:1, duration:.5, clearProps:'opacity'}, 1.35);
    t.to(fill, {opacity:0, duration:.5}, 1.6);
  });
};
M.darkEnter_B = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const lvl = opts.level || 'dark', A = DARK_A[lvl] || .5;
  const {r, box} = darkBox(opts); const cur = bits(box, 1, ()=> ({cls:'fxb-curtain'}))[0]; const veil = veilOf(opts);
  const moths = bits(box, 5, i=> ({cls:'fxb-moth', style:`left:${12 + i*18}%; top:${rnd(20, 60)}%;`}));
  const name = bits(box, 1, ()=> ({cls:'fxb-dkname', text:'🌑 ' + DARK_NAME[lvl]}))[0];
  return run([box], opts, (t)=>{
    if(veil) t.set(veil, {opacity:0}, 0);
    t.fromTo(cur, {yPercent:-105, opacity:1}, {yPercent:-8, duration:.55, ease:'power3.in'}, 0).to(cur, {yPercent:-14, duration:.12, ease:'sine.out'}, '>').to(cur, {yPercent:-8, duration:.1}, '>')
      .to(cur, {opacity:A, duration:.45}, '>');
    moths.forEach((m, i)=> t.fromTo(m, {opacity:0, y:0}, {opacity:1, y:r.height*.25, x:rnd(-30, 30), duration:.4, ease:'power1.in'}, .1 + i*.05)
      .to(m, {y:r.height*rnd(.8, 1.1), x:'+=' + rnd(-40, 40), rotation:rnd(-90, 90), opacity:0, duration:.6, ease:'power1.out'}, '>'));
    t.fromTo(name, {xPercent:-50, yPercent:-50, opacity:0}, {opacity:1, duration:.25}, .8).to(name, {opacity:0, duration:.3}, 1.6);
    if(lvl === 'absolute') eyesIn(box, r, t, 1.05, 3);
    if(veil) t.to(veil, {opacity:1, duration:.45, clearProps:'opacity'}, 1.2);
    t.to(cur, {opacity:0, duration:.45}, 1.45);
  });
};
M.darkEnter_C = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const lvl = opts.level || 'dark', A = DARK_A[lvl] || .5;
  const {r, box} = darkBox(opts); const veil = veilOf(opts);
  const flood = bits(box, 1, ()=> ({cls:'fxb-flood'}))[0]; const wick = bits(box, 1, ()=> ({cls:'fxb-wick'}))[0]; const fl = bits(box, 1, ()=> ({cls:'fxb-flame'}))[0];
  const smoke = bits(box, 3, ()=> ({cls:'fxb-smoke', style:'left:50%; top:50%; margin:-30px 0 0 -17px;'}));
  const name = bits(box, 1, ()=> ({cls:'fxb-dkname', text:'🌑 ' + DARK_NAME[lvl]}))[0]; name.style.top = '64%';
  const span = Math.hypot(r.width, r.height)/40*1.25;
  return run([box], opts, (t)=>{
    if(veil) t.set(veil, {opacity:0}, 0);
    t.set(fl, {xPercent:-50, yPercent:-80}, 0).fromTo([fl, wick], {opacity:0}, {opacity:1, duration:.15}, 0);
    [1.1, .8, 1.2, .7, 1.05].forEach((s, i)=> t.to(fl, {scaleY:s, scaleX:2 - s, skewX:rnd(-8, 8), duration:.1, ease:'sine.inOut'}, .15 + i*.1));
    t.to(fl, {scaleY:.05, scaleX:.4, opacity:0, duration:.14, ease:'power3.in'}, .7);
    smoke.forEach((s, i)=> t.fromTo(s, {y:0, x:0, opacity:0, scale:.3}, {y:-r.height*.32, x:Math.sin(i*2)*18, opacity:.8, scale:1.5, duration:.8, ease:'sine.out'}, .78 + i*.1).to(s, {opacity:0, duration:.3}, '>-.1'));
    t.fromTo(flood, {scale:0, opacity:A}, {scale:span, duration:.75, ease:'power2.in'}, .85).to(wick, {opacity:0, duration:.3}, 1.1);
    t.fromTo(name, {xPercent:-50, yPercent:-50, opacity:0}, {opacity:1, duration:.25}, 1.15).to(name, {opacity:0, duration:.3}, 1.85);
    if(lvl === 'absolute') eyesIn(box, r, t, 1.4, 3);
    if(veil) t.to(veil, {opacity:1, duration:.4, clearProps:'opacity'}, 1.55);
    t.to(flood, {opacity:0, duration:.45}, 1.75);
  });
};
// The light returns (dark-leave, the veil used to vanish at once): the dark lifts upward as warm light spills in from above.
css('light', `.fxb-spill{position:absolute; left:50%; top:-30%; width:160%; height:120%; border-radius:50%; background:radial-gradient(ellipse at 50% 30%, rgba(255,236,170,.85), rgba(255,200,110,.35) 40%, transparent 70%); mix-blend-mode:screen;}
.fxb-mote{position:absolute; width:5px; height:5px; border-radius:50%; background:#fff3c4; box-shadow:0 0 8px #ffd56e;}`);
M.darkLeave = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const A = DARK_A[opts.level || 'dark'] || .5;
  const {r, box} = darkBox(opts); const fill = bits(box, 1, ()=> ({cls:'fxb-dkfill'}))[0]; const sp = bits(box, 1, ()=> ({cls:'fxb-spill'}))[0];
  const mo = bits(box, 14, ()=> ({cls:'fxb-mote', style:`left:${rnd(5, 95)}%; top:${rnd(30, 95)}%;`}));
  return run([box], opts, (t)=>{
    t.set(fill, {opacity:A}).set(sp, {xPercent:-50}).fromTo(sp, {opacity:0, scale:.4}, {opacity:1, scale:1, duration:.7, ease:'power2.out'}, .1)
      .to(fill, {yPercent:-60, opacity:0, duration:.9, ease:'power2.in'}, .25).to(sp, {opacity:0, duration:.5}, 1.0);
    mo.forEach((m, i)=> t.fromTo(m, {opacity:0, y:0}, {opacity:1, y:-rnd(20, 60), duration:.5, ease:'sine.out'}, .4 + i*.03).to(m, {opacity:0, duration:.3}, '>'));
  });
};
// Darkness misses (dark-dark-miss / dark-pitch-miss / dark-absolute-miss, all used one float): a swing into the dark.
//   dark: a faint whiff line and a "?"; pitch: the swing is swallowed by an inky cloud;
//   absolute: the attacker goes black but for its eyes, and the swing vanishes into a void.
css('miss', `.fxb-whiff{position:absolute; left:-10%; width:120%; height:70%; overflow:visible;}
.fxb-whiff path{fill:none; stroke-linecap:round;}
.fxb-q{position:absolute; left:50%; top:20%; font:900 22px/1 'Baloo 2', system-ui; color:#d8d2f0; text-shadow:0 0 8px rgba(120,100,200,.8);}
.fxb-inkc{position:absolute; width:46%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle, rgba(6,6,14,.95) 40%, rgba(6,6,14,0) 70%);}
.fxb-void{position:absolute; left:50%; width:30px; height:30px; border-radius:50%; background:radial-gradient(circle, #000 55%, rgba(120,90,220,.9) 62%, transparent 72%); box-shadow:0 0 14px rgba(120,90,220,.6);}
.fxb-blackout{position:absolute; inset:0; border-radius:10px; background:rgba(2,2,8,.8);}
.fxb-blackout .fxb-eyes{left:50%; top:24%; margin-left:-11px;}`);
M.darkMiss = function(el, opts){
  opts = opts || {}; const lvl = opts.level || 'dark', r = rectOf(el); if(!r) return Promise.resolve();
  const up = opts.up != null ? opts.up : isMineEl(el);
  const box = over(r, ''); box.style.overflow = 'visible';
  const sw = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sw.setAttribute('class', 'fxb-bit fxb-whiff'); sw.setAttribute('viewBox', '0 0 100 60'); sw.setAttribute('preserveAspectRatio', 'none');
  sw.style.top = up ? '-58%' : '88%'; if(!up) sw.style.transform = 'scaleY(-1)';
  const col = lvl === 'dark' ? 'rgba(220,220,235,.85)' : lvl === 'pitch' ? 'rgba(180,170,215,.75)' : 'rgba(150,120,240,.7)';
  sw.innerHTML = `<path d="M8 52 Q50 -6 92 52" stroke="${col}" stroke-width="4" pathLength="1" stroke-dasharray=".55 1" stroke-dashoffset="1.55"/><path d="M16 54 Q50 6 84 54" stroke="${col}" stroke-width="1.5" opacity=".6" pathLength="1" stroke-dasharray=".5 1" stroke-dashoffset="1.5"/>`;
  box.appendChild(sw); const paths = [...sw.querySelectorAll('path')];
  const yArc = up ? -r.height*.3 : r.height*1.2;
  return run([box], opts, (t)=>{
    paths.forEach((p, i)=> t.to(p, {strokeDashoffset:0, duration:.28, ease:'power2.inOut'}, .05 + i*.04));
    if(lvl === 'dark'){ const q = bits(box, 1, ()=> ({cls:'fxb-q', text:'?'}))[0]; q.style.top = up ? '-30%' : '110%';
      t.to(sw, {opacity:0, duration:.35}, .35).fromTo(q, {xPercent:-50, opacity:0, y:6}, {opacity:1, y:-6, duration:.25}, .3).to(q, {opacity:0, duration:.25}, .75); }
    else if(lvl === 'pitch'){ const ink = bits(box, 3, i=> ({cls:'fxb-inkc', style:`left:${[8, 30, 52][i]}%; top:${(up ? -78 : 118) + (i%2)*8}%;`})); // 2026-10-15: past the float, not over it
      const q = bits(box, 1, ()=> ({cls:'fxb-q', text:'?'}))[0]; q.style.top = up ? '-62%' : '150%';
      t.fromTo(ink, {scale:.2, opacity:0}, {scale:1.25, opacity:1, duration:.3, stagger:.05, ease:'power2.out'}, .22).to(sw, {opacity:0, duration:.15}, .35)
        .to(ink, {scale:1.6, opacity:0, duration:.4}, .65).fromTo(q, {xPercent:-50, opacity:0}, {opacity:.85, duration:.2}, .5).to(q, {opacity:0, duration:.2}, .85); }
    else { // 2026-10-15: the blackout sits inside the card (under the game's float), not over it
      const bo = document.createElement('i'); bo.className = 'fxb-bit fxb-blackout'; bo.style.zIndex = 6; (tileOf(el) || box).appendChild(bo);
      const ey = document.createElement('i'); ey.className = 'fxb-eyes'; bo.appendChild(ey); t.eventCallback('onComplete', ((f)=> ()=>{ bo.remove(); f && f(); })(t.eventCallback('onComplete')));
      const v = bits(box, 1, ()=> ({cls:'fxb-void'}))[0]; v.style.top = (up ? -58 : 150) + '%';
      t.fromTo(bo, {opacity:0}, {opacity:1, duration:.12}, 0).fromTo(ey, {scaleY:0}, {scaleY:1, duration:.1}, .1).to(ey, {scaleY:0, duration:.08}, .55)
        .fromTo(v, {xPercent:-50, yPercent:-50, scale:0}, {scale:1.4, duration:.18, ease:'back.out(2)'}, .3).to(sw, {opacity:0, scale:.3, transformOrigin:'50% 100%', duration:.2}, .32)
        .to(v, {scale:0, rotation:180, duration:.25, ease:'power2.in'}, .5).to(bo, {opacity:0, duration:.25}, .62); }
  });
};

// Persistent sight looks (dark-unit-blind, P1: "units that are blind in darkness should look it"; dark-sunshy-blind;
// dark-nightblind; dark-darksight-idle; and the Lantern's light pool). A class on the .board-card plus one small badge.
// Re-applied after every renderBoard (fxHook 'boardRendered') because the board rebuilds its cards.
//   cantsee looks: A shadowed art, a big shut eye that strains open now and then, and a small badge (in the game);
//   B a blindfold across the art; C fog swirling over the art.
const EYE_SVG = {
  dark:'<svg viewBox="0 0 24 14"><path d="M3 5 Q12 13 21 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M7 9 L5.5 12.5 M12 10.5 L12 13.8 M17 9 L18.5 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  sun:'<svg viewBox="0 0 24 14"><circle cx="5" cy="7" r="3" fill="#ffd25a"/><path d="M10 8 Q15 4 22 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M11 5 L21 11" stroke="currentColor" stroke-width="1.4"/></svg>',
  night:'<svg viewBox="0 0 24 14"><path d="M7 2 A5 5 0 1 0 9 12 A4 4 0 1 1 7 2Z" fill="#cfd8ff"/><ellipse cx="17" cy="7" rx="6" ry="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="7" r="2.6" fill="rgba(200,210,235,.9)"/></svg>',
  // 2026-10-15: the Blind status (ink over the eye) while it lasts.
  blind:'<svg viewBox="0 0 24 14"><ellipse cx="12" cy="7" rx="8.5" ry="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 3 Q9 1 12 4 Q16 0 19 4 Q21 8 17 10 Q14 13 10 11 Q5 11 6 7Z" fill="#1a1426"/><circle cx="8" cy="12" r="1.3" fill="#1a1426"/></svg>'};
css('sight', `.board-card.fxb-cantsee{position:relative;}
.fxb-eyebadge{position:absolute; left:50%; top:-8px; z-index:8; width:30px; height:18px; transform:translateX(-50%); border-radius:999px; display:grid; place-items:center; pointer-events:none;
  background:rgba(20,16,36,.88); border:1px solid rgba(200,190,255,.45); color:#d9d1ff; box-shadow:0 2px 6px rgba(0,0,0,.5);}
.fxb-eyebadge svg{width:21px; height:12px; display:block;}
/* 2026-10-15 (look A, "units blind in the dark should look it"): the art sinks into shadow from its edges and a big shut eye
   sits over it; now and then the lids strain open a crack and fall shut again (it is trying to see). */
.fxb-shade{position:absolute; left:3%; right:3%; top:17%; height:52%; z-index:6; pointer-events:none; border-radius:8px;
  background:radial-gradient(ellipse 50% 46% at 50% 44%, rgba(6,5,16,.72), rgba(6,5,16,.45) 58%, rgba(6,5,16,0) 100%);}
.fxb-shut{position:absolute; left:50%; top:40%; z-index:7; width:58%; aspect-ratio:2/1; transform:translate(-50%,-50%); pointer-events:none;
  color:#e7e1ff; filter:drop-shadow(0 0 3px rgba(8,6,20,.95)) drop-shadow(0 0 7px rgba(120,100,220,.55));}
.fxb-shut svg{width:100%; height:100%; display:block; overflow:visible;}
.fxb-shut .lid{transform-origin:50% 40%;}
/* 2026-10-16 (user: "Night blindness effect - the eye: It should only blink at the start. Then it remains closed throughout. It only
   blinks with a VERY low chance, like 1% per minute."): one strain-and-blink when the eye first appears on a unit, then shut; the
   rare later blink is .is-blink, set by the watcher below (about 1% a minute per eye). */
.fxb-shut.is-blink .lid{animation:fxbBlinkOnce 1.2s ease-in-out .15s 1 both;}
@keyframes fxbBlinkOnce{0%,100%{transform:scaleY(1);} 30%{transform:scaleY(-.35);} 46%{transform:scaleY(1);} 62%{transform:scaleY(-.2);} 76%{transform:scaleY(1);}}
@keyframes fxbStrain{0%,70%,100%{transform:scaleY(1);} 78%{transform:scaleY(-.35);} 84%{transform:scaleY(1);} 88%{transform:scaleY(-.2);} 92%{transform:scaleY(1);}}
.fxb-why-blind .fxb-shade{opacity:.6;} .fxb-why-blind .fxb-shut{color:#fff; filter:drop-shadow(0 0 2px #1a1426) drop-shadow(0 0 6px rgba(30,20,60,.9));}
.fxb-eyebadge.why-sun{color:#ffe4a0; border-color:rgba(255,220,140,.6);} .fxb-eyebadge.why-night{color:#cfd8ff;}
.fxb-eyebadge.why-blind{background:#e9e2ff; color:#3b2d63; border-color:#3b2d63;}
.board-card.fxb-cantsee.fxb-look-A .card-tile .ico{filter:brightness(.5) saturate(.45); transition:filter .6s;}
.board-card.fxb-cantsee.fxb-why-sun.fxb-look-A .card-tile .ico{filter:brightness(1.15) saturate(.6) contrast(.8);}
.fxb-fold{position:absolute; left:-3%; right:-3%; top:24%; height:13%; z-index:7; pointer-events:none; transform:rotate(-5deg); border-radius:3px;
  background:repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 3px, transparent 3px 7px), linear-gradient(180deg,#4a3b5c,#271d33); box-shadow:0 2px 4px rgba(0,0,0,.55);}
.fxb-fold::after{content:''; position:absolute; right:6%; top:-30%; width:14px; height:160%; background:linear-gradient(180deg,#5a4870,#2b2038); clip-path:polygon(0 0,100% 20%,70% 100%,30% 100%,0 70%);}
.fxb-fogart{position:absolute; left:4%; right:4%; top:6%; height:52%; z-index:7; pointer-events:none; border-radius:8px; opacity:.85;
  background:radial-gradient(ellipse at 30% 40%, rgba(200,195,215,.85), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(170,165,190,.8), transparent 60%), rgba(60,56,80,.35);
  background-size:200% 100%, 200% 100%, auto; animation:fxbFog 6s ease-in-out infinite alternate;}
@keyframes fxbFog{to{background-position:100% 0, 0 0, 0 0;}}
.fxb-glare{position:absolute; left:0; right:0; top:0; height:60%; z-index:7; pointer-events:none; border-radius:8px 8px 0 0; overflow:hidden;}
.fxb-glare::before{content:''; position:absolute; top:-30%; left:-60%; width:45%; height:160%; transform:rotate(22deg); background:linear-gradient(90deg, transparent, rgba(255,250,220,.85), transparent); animation:fxbGlare 4.6s ease-in-out infinite;}
@keyframes fxbGlare{0%,55%{left:-60%;} 85%,100%{left:120%;}}
.fxb-mooncloud{position:absolute; left:6%; right:6%; top:10%; height:40%; z-index:7; pointer-events:none; border-radius:50%;
  background:radial-gradient(ellipse at 50% 50%, rgba(170,190,240,.55), rgba(90,110,170,.25) 55%, transparent 75%); filter:blur(2px); animation:fxbCloud 5s ease-in-out infinite alternate;}
@keyframes fxbCloud{to{transform:translateX(6%) scale(1.06); opacity:.7;}}
.fxb-darkeyes{position:absolute; left:50%; top:26%; z-index:7; width:44%; height:9%; transform:translateX(-50%); pointer-events:none;}
.fxb-darkeyes::before, .fxb-darkeyes::after{content:''; position:absolute; top:0; width:30%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle, #f6ffd8, #b8ff4a 45%, rgba(150,255,40,0) 72%);
  box-shadow:0 0 10px 3px rgba(170,255,70,.8), 0 0 2px 1px rgba(20,40,0,.9); animation:fxbBlink var(--blink, 5s) var(--bd, 0s) infinite;}
.fxb-darkeyes::before{left:0;} .fxb-darkeyes::after{right:0;}
@keyframes fxbBlink{0%,46%,54%,100%{transform:scaleY(1); opacity:1;} 50%{transform:scaleY(.08); opacity:.6;}}
.board-card.fxb-eyes-on .card-tile .ico{filter:brightness(.8);}
/* 2026-10-16 (user: "Lantern glow is too bright. but it is also not 'wide' enough. And the brightness shouldnt cut past the battlefield
   board"): the carrier's pool is about half as bright and wider; it flickers in brightness only, and the game clips it to the board. */
.fxb-pool{position:absolute; left:50%; top:50%; width:400%; height:300%; z-index:0; pointer-events:none; transform:translate(-50%,-50%); border-radius:50%;
  background:radial-gradient(ellipse at 50% 50%, rgba(255,205,120,.22), rgba(255,175,80,.11) 36%, rgba(255,160,60,.04) 58%, rgba(255,150,40,0) 70%); mix-blend-mode:screen; animation:fxbFlicker 2.4s ease-in-out infinite;}
@keyframes fxbFlicker{0%,100%{opacity:.9;} 30%{opacity:.76;} 55%{opacity:1;} 70%{opacity:.84;}}
.board-card.fxb-lit .card-tile{box-shadow:0 0 0 1px rgba(255,200,110,.35), 0 0 14px rgba(255,180,80,.28);}
@media (prefers-reduced-motion: reduce){ .fxb-fogart, .fxb-glare::before, .fxb-mooncloud, .fxb-darkeyes::before, .fxb-darkeyes::after, .fxb-pool, .fxb-shut .lid{animation:none !important;} }`);
// The shut eye of look A: a closed lid with lashes (the .lid group flips up a crack when it strains to see).
const SHUT_SVG = '<svg viewBox="0 0 48 24"><g class="lid"><path d="M4 8 Q24 26 44 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>'
  + '<path d="M11 14.5 L8 20 M18 17.6 L16.5 23 M24 18.5 L24 24 M30 17.6 L31.5 23 M37 14.5 L40 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></g></svg>';
const SIGHT_CLS = ['fxb-cantsee', 'fxb-look-A', 'fxb-look-B', 'fxb-look-C', 'fxb-why-dark', 'fxb-why-sun', 'fxb-why-night', 'fxb-why-blind', 'fxb-eyes-on', 'fxb-lit', 'fxb-lantern'];
const SIGHT_SEL = '.fxb-eyebadge, .fxb-fold, .fxb-fogart, .fxb-glare, .fxb-mooncloud, .fxb-darkeyes, .fxb-pool, .fxb-shade, .fxb-shut';
M.sightLook = 'A';
// The shut eye's blinks (2026-10-16): it blinks once when it first shows on a unit (a board re-render doesn't count as new: the unit
// is remembered by uid for 20 minutes), then stays shut; every 10 s each eye on screen has a 1-in-600 chance (about 1% a minute).
const eyeSeen = new Map();
function blinkEye(e){ e.classList.remove('is-blink'); void e.offsetWidth; e.classList.add('is-blink'); setTimeout(()=> e.classList.remove('is-blink'), 1500); }
function eyeIntro(card, e){ const id = card && card.dataset && card.dataset.uid, now = Date.now();
  if(id != null && eyeSeen.has(id) && now - eyeSeen.get(id) < 20*60*1000) return;
  if(id != null){ eyeSeen.set(id, now); if(eyeSeen.size > 300) eyeSeen.clear(); }
  blinkEye(e); }
if(typeof setInterval === 'function') setInterval(()=>{ try{ if(document.hidden) return; document.querySelectorAll('.fxb-shut').forEach(e=>{ if(Math.random() < 1/600) blinkEye(e); }); }catch(err){} }, 10000);
// mark(el, kind): kind 'dark' | 'sun' | 'night' (can't see) | 'eyes' (Darksight in the dark) | 'lantern' (the carrier's light pool) | 'lit' | null (clear)
M.markSight = function(el, kind, o){
  o = o || {}; if(!el || !el.classList) return; const look = o.look || M.sightLook || 'A';
  const sig = kind ? kind + ':' + look : '';
  if((el.dataset.fxbSight || '') === sig) return; // nothing changed: leave the running animations alone
  el.classList.remove(...SIGHT_CLS); el.querySelectorAll(':scope > ' + SIGHT_SEL.split(', ').join(', :scope > ')).forEach(n=> n.remove());
  { const tl = tileOf(el); if(tl && tl !== el) tl.querySelectorAll(':scope > .fxb-darkeyes').forEach(n=> n.remove()); }
  el.dataset.fxbSight = sig; if(!kind){ delete el.dataset.fxbSight; return; }
  const add = (cls, html)=>{ const i = document.createElement('i'); i.className = cls; i.setAttribute('aria-hidden', 'true'); if(html) i.innerHTML = html; el.appendChild(i); return i; };
  // 2026-10-16 (user: "The dark sight vfx is not centered. its abit to the left."): the eyes sit in the card tile itself. On the
  // .board-card they were centred on the wrapper, while a flyer's tile hovers a few px to the right of it (its flight offset).
  if(kind === 'eyes'){ el.classList.add('fxb-eyes-on'); const e = add('fxb-darkeyes'); { const tl = tileOf(el); if(tl && tl !== el) tl.appendChild(e); } e.style.setProperty('--blink', rnd(4, 7).toFixed(1) + 's'); e.style.setProperty('--bd', (-rnd(0, 6)).toFixed(1) + 's'); return; }
  if(kind === 'lantern'){ el.classList.add('fxb-lantern', 'fxb-lit'); el.insertBefore(add('fxb-pool'), el.firstChild); return; } // first, so the card paints over its own light
  if(kind === 'lit'){ el.classList.add('fxb-lit'); return; }
  el.classList.add('fxb-cantsee', 'fxb-look-' + look, 'fxb-why-' + kind);
  const b = (look !== 'A' || kind === 'sun') ? add('fxb-eyebadge why-' + kind, EYE_SVG[kind] || EYE_SVG.dark) : {}; b.title = kind === 'sun' ? 'Sun-shy: dazzled by day' : kind === 'night' ? 'Night-blind: can\'t see at night' : kind === 'blind' ? 'Blind: misses half its swings' : 'Can\'t see in the dark';
  if(kind === 'sun') add('fxb-glare'); else if(kind === 'night') add('fxb-mooncloud');
  else if(look === 'B') add('fxb-fold'); else if(look === 'C') add('fxb-fogart');
  if(look === 'A' && kind !== 'sun'){ if(kind !== 'night') add('fxb-shade'); const e = add('fxb-shut', SHUT_SVG); eyeIntro(el, e); }
};
// Work out who can see on the board from the DOM, the card defs, the field rules and the phase (mirrors the engine's
// sightMiss: Darksight sees in the dark; a living Lantern lights its side (absolute darkness still dims it); Sun-shy is
// blind by day, Night-blind at night unless lit; Keen Sense smells its way).
M.sightSync = function(m, env){
  const bf = document.getElementById('battlefieldEl'); if(!bf) return;
  const cards = [...bf.querySelectorAll('.board-card[data-uid][data-defid]')]; if(!cards.length) return;
  let rules = null; try{ rules = typeof matchFieldRules === 'function' ? matchFieldRules(m) : null; }catch(e){}
  const dk = !m || m.over ? null : (rules && rules.dark) ? (rules.dark === 'absolute' || rules.dark === 'pitch' ? rules.dark : 'dark') : null;
  let ph = null; try{ if(m && !m.over && m.engine && m.engine.getPhase && (typeof dayNightOn !== 'function' || dayNightOn(m))) ph = m.engine.getPhase(); }catch(e){}
  // 2026-10-15 (rules batch): Illuminate is Lantern's new name and lights Absolute darkness too, so either key lights its side fully.
  const defs = defsOf(env); const eff = c=>{ const e = effOf(defs, c.dataset.defid) || {}; return e.illuminate && !e.lantern ? Object.assign({}, e, {lantern:true}) : e; };
  const alive = c=> !c.classList.contains('is-dying') && !c.classList.contains('dead');
  const mineOf = c=> !!c.closest('#rowMine, .bottom-play-row');
  const lit = {true:false, false:false}; cards.forEach(c=>{ if(alive(c) && eff(c).lantern) lit[mineOf(c)] = true; });
  cards.forEach(c=>{ const e = eff(c), side = mineOf(c); let k = null;
    if(dk){ if(e.darksight) k = 'eyes'; else if(e.lantern) k = 'lantern'; else if(e.keenSense) k = null; else if(lit[side]) k = 'lit'; else k = 'dark'; }
    // 2026-10-16 (engine sightMiss): an enemy Illuminate unit directly facing a Night-blind one (same column) lights it too
    const facingLit = ()=>{ const r = c.getBoundingClientRect(), cx = r.left + r.width/2; return cards.some(o=> o !== c && mineOf(o) !== side && alive(o) && eff(o).lantern && (()=>{ const q = o.getBoundingClientRect(); return Math.abs(q.left + q.width/2 - cx) < r.width*.5; })()); };
    if(!k || k === 'lit'){ if(ph === 'day' && e.sunshy) k = 'sun'; else if(ph === 'night' && e.nightblind && !lit[side] && !facingLit()) k = 'night'; }
    if(!dk && e.lantern && ph === 'night') k = k || 'lantern';
    if((!k || k === 'lit' || k === 'eyes') && c.classList.contains('is-blind') && !e.keenSense) k = 'blind'; // 2026-10-15: Blind status, while it lasts
    M.markSight(c, k);
  });
};

// Lantern carrier dies (dark-lantern-out): the lantern gutters, a wisp of smoke rises and the dark closes over its side.
css('lanternout', `.fxb-lamp{position:absolute; left:50%; top:40%; font:900 28px/1 system-ui; filter:drop-shadow(0 0 10px rgba(255,180,60,.9));}
.fxb-close{position:absolute; inset:0; background:radial-gradient(ellipse at var(--cx,50%) 50%, rgba(4,4,12,0) 0, rgba(4,4,12,.7) 60%); border-radius:12px;}`);
M.lanternOut = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const row = opts.row || (el.closest && el.closest('#rowMine, #rowEnemy')); const rr = row ? row.getBoundingClientRect() : r;
  const cl = over({left:rr.left, top:rr.top - 10, width:rr.width, height:rr.height + 20}, '', '<i class="fxb-bit fxb-close"></i>'); const cv = cl.firstChild;
  cv.style.setProperty('--cx', ((r.left + r.width/2 - rr.left)/Math.max(1, rr.width)*100).toFixed(0) + '%');
  const box = over(r, ''); box.style.overflow = 'visible'; const lamp = bits(box, 1, ()=> ({cls:'fxb-lamp', text:'🏮'}))[0];
  const pool = bits(box, 1, ()=> ({cls:'fxb-torch', style:'left:-90%; top:50%; width:280%; height:200%;'}))[0];
  const sm = bits(box, 3, ()=> ({cls:'fxb-smoke', style:'left:50%; top:26%; margin-left:-17px;'}));
  return run([box, cl], opts, (t)=>{
    t.set(lamp, {xPercent:-50, yPercent:-50}).set(pool, {yPercent:-50});
    [1, .4, .9, .25, .7, .1, .45, 0].forEach((v, i)=>{ t.to([lamp, pool], {opacity:v, duration:.08, ease:'none'}, i*.09); });
    sm.forEach((s, i)=> t.fromTo(s, {y:0, opacity:0, scale:.4}, {y:-r.height*.5, x:Math.sin(i*2.2)*14, opacity:.8, scale:1.4, duration:.75, ease:'sine.out'}, .6 + i*.1).to(s, {opacity:0, duration:.3}, '>-.1'));
    t.fromTo(cv, {opacity:0}, {opacity:1, duration:.6, ease:'power2.in'}, .6).to(cv, {opacity:0, duration:.5}, 1.45);
  });
};
// Lantern saves a swing (dark-lantern-save): an amber mote leads the swing out of the dark.
M.lanternSave = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const up = opts.up != null ? opts.up : isMineEl(el);
  const box = over(r, ''); box.style.overflow = 'visible';
  const glow = bits(box, 1, ()=> ({cls:'fxb-torch', style:'left:-30%; top:50%; width:160%; height:130%;'}))[0];
  const mo = bits(box, 5, i=> ({cls:'fxb-mote', style:`left:${42 + i*4}%; top:${up ? 10 : 85}%; background:#ffd18a; box-shadow:0 0 8px #ff9a2a;`}));
  return run([box], opts, (t)=>{
    t.set(glow, {yPercent:-50}).fromTo(glow, {opacity:0}, {opacity:.9, duration:.15}).to(glow, {opacity:0, duration:.35}, '+=.1');
    mo.forEach((m, i)=> t.fromTo(m, {opacity:0, y:0}, {opacity:1, y:(up ? -1 : 1)*r.height*rnd(.5, .8), x:rnd(-10, 10), duration:.45, ease:'power2.out'}, .05 + i*.04).to(m, {opacity:0, duration:.15}, '>'));
  });
};
// Shade halves a non-magic hit at night (dark-shade-night, planned Map 50+; hooked where it already happens): the blow
// passes through a dark double of the unit, which ripples and settles back.
css('shade', `.fxb-shadow{position:absolute; inset:0; border-radius:10px; background:linear-gradient(180deg, rgba(40,30,70,.85), rgba(10,8,22,.9)); box-shadow:0 0 16px rgba(110,80,200,.7);}`);
M.shadeNight = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const sh = bits(box, 3, ()=> ({cls:'fxb-shadow'}));
  cp = chip(el, '🌑 ½ Shade', 'shade', {hold:600});
  return Promise.all([cp, run([box], opts, (t)=> sh.forEach((s, i)=> t.fromTo(s, {opacity:0, x:0, skewX:0}, {opacity:.75 - i*.2, x:(i + 1)*7*(i%2 ? -1 : 1), skewX:(i%2 ? 6 : -6), duration:.12}, i*.05)
    .to(s, {x:0, skewX:0, opacity:0, duration:.45, ease:'elastic.out(1,.5)'}, .25)))]);
};
// Shadow evades at night (dark-shadow-night, was the generic dodge hop): the body breaks into smoke and re-forms.
M.shadowNight = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve(); const tile = tileOf(el), g = G();
  const box = over(r, ''); box.style.overflow = 'visible';
  const sm = bits(box, 9, i=> ({cls:'fxb-smoke', style:`left:${10 + (i%3)*35}%; top:${10 + Math.floor(i/3)*32}%; background:radial-gradient(circle, rgba(30,24,50,.85), transparent 70%);`}));
  if(tile && g) g.timeline().to(tile, {opacity:.15, filter:'blur(2px)', duration:.12}).to(tile, {x:(Math.random() < .5 ? -1 : 1)*12, duration:.2}, '>').to(tile, {x:0, opacity:1, filter:'blur(0px)', duration:.25, clearProps:'opacity,filter,x'}, '>+.1');
  cp = chip(el, '🌫 Shadow', 'shade', {hold:450});
  return Promise.all([cp, run([box], opts, (t)=> sm.forEach((s, i)=> t.fromTo(s, {scale:.3, opacity:0}, {scale:1.6, opacity:.9, duration:.2}, i*.02).to(s, {scale:2.2, opacity:0, x:rnd(-14, 14), y:-rnd(4, 20), duration:.45}, '>')))]);
};
// Beware at Darkness N (dark-beware, was a log line): red eyes rise from the Removal Zone at that side's edge, blink, sink.
M.beware = function(row, opts){
  opts = opts || {}; const rr = (row && row.getBoundingClientRect) ? row.getBoundingClientRect() : hostRect(opts); const mine = opts.mine != null ? opts.mine : (row && row.id === 'rowMine');
  const n = Math.max(1, Math.min(4, opts.darkness || 1));
  const box = over({left:rr.left, top:mine ? rr.bottom - 40 : rr.top - 30, width:rr.width, height:70}, '', '<i class="fxb-bit" style="inset:0; background:radial-gradient(ellipse at 50% ' + (mine ? '100%' : '0') + ', rgba(60,0,10,.75), transparent 70%);"></i>');
  const mist = box.firstChild;
  const es = bits(box, n, i=> ({cls:'fxb-eyes is-red', style:`left:${(i + 1)/(n + 1)*100}%; top:50%; margin-left:-11px;`}));
  return run([box], opts, (t)=>{
    t.fromTo(mist, {opacity:0}, {opacity:1, duration:.3});
    es.forEach((e, i)=> t.fromTo(e, {y:mine ? 30 : -30, scaleY:.1, opacity:0}, {y:0, opacity:1, duration:.35, ease:'power2.out'}, .1 + i*.12).to(e, {scaleY:1, duration:.1}, '>')
      .to(e, {scaleY:.1, duration:.07, yoyo:true, repeat:1}, '>+.3').to(e, {y:mine ? 30 : -30, opacity:0, duration:.35, ease:'power2.in'}, 1.3 + i*.05));
    t.to(mist, {opacity:0, duration:.35}, 1.4);
  });
};
// Devilry ★ gained (dark-inherent, was the generic resource float): ember motes swirl into a dark star that pulses.
css('devil', `.fxb-dstar{position:absolute; left:50%; top:46%; font:900 30px/1 system-ui; color:#2a0b2e; -webkit-text-stroke:1.5px #ff5ad1; text-shadow:0 0 12px #c01a9a, 0 0 4px #ff9ae6;}
.fxb-dember{position:absolute; left:50%; top:46%; width:4px; height:4px; border-radius:50%; background:#ff7ad8; box-shadow:0 0 6px #d01aa6;}`);
M.devilryStar = function(el, opts){
  opts = opts || {}; const r = rectOf(el) || (el && el.getBoundingClientRect && el.getBoundingClientRect()); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const st = bits(box, 1, ()=> ({cls:'fxb-dstar', text:'★'}))[0];
  const em = bits(box, 10, ()=> ({cls:'fxb-dember'}));
  return run([box], opts, (t)=>{
    em.forEach((e, i)=>{ const a = i/10*Math.PI*2; t.fromTo(e, {x:Math.cos(a)*r.width*.7, y:Math.sin(a)*r.height*.55, opacity:0}, {x:0, y:0, opacity:1, duration:.4, ease:'power2.in'}, i*.025).to(e, {opacity:0, duration:.05}, '>'); });
    t.fromTo(st, {xPercent:-50, yPercent:-50, scale:0, rotation:-90}, {scale:1.3, rotation:0, duration:.25, ease:'back.out(3)'}, .4).call(()=> call(opts.onImpact))
      .to(st, {scale:1, duration:.12}).to(st, {y:-r.height*.5, opacity:0, scale:.6, duration:.4, ease:'power2.in'}, '+=.15');
  });
};
// Planned (Map 29 Abyssal Plains): bioluminescent units glow in the pitch black, an anglerfish lure bobs over its side.
css('biolum', `.fxb-bio{position:absolute; width:6px; height:6px; border-radius:50%; background:#9ffcff; box-shadow:0 0 10px 3px rgba(60,240,255,.6);}
.fxb-lure{position:absolute; width:12px; height:12px; border-radius:50%; background:radial-gradient(circle, #fff, #8cfaff 45%, rgba(40,220,255,0) 72%); box-shadow:0 0 22px 8px rgba(60,230,255,.55);}
.fxb-stalk{position:absolute; width:2px; background:linear-gradient(180deg, rgba(160,250,255,.7), rgba(40,90,110,.2)); transform-origin:50% 100%;}`);
M.bioluminescent = function(cards, opts){
  opts = opts || {}; cards = [].concat(cards || []).filter(Boolean); const r = hostRect(opts, cards[0]);
  const box = over(r, 'fxb-dk', '<i class="fxb-bit fxb-dkfill" style="opacity:.75"></i>'); const motes = [];
  cards.forEach(c=>{ const cr = rectOf(c); if(!cr) return; for(let i = 0; i < 4; i++){ const m = document.createElement('i'); m.className = 'fxb-bit fxb-bio'; m.style.left = (cr.left - r.left + rnd(0, cr.width)) + 'px'; m.style.top = (cr.top - r.top + rnd(0, cr.height)) + 'px'; box.appendChild(m); motes.push(m); } });
  const lr = cards[0] ? rectOf(cards[0]) : null; const lx = lr ? lr.left - r.left + lr.width/2 : r.width/2, ly = lr ? lr.top - r.top - 26 : r.height/2;
  const stalk = bits(box, 1, ()=> ({cls:'fxb-stalk', style:`left:${lx}px; top:${ly}px; height:28px;`}))[0], lure = bits(box, 1, ()=> ({cls:'fxb-lure', style:`left:${lx - 6}px; top:${ly - 6}px;`}))[0];
  return run([box], opts, (t)=>{
    t.fromTo(box.firstChild, {opacity:0}, {opacity:.75, duration:.4});
    motes.forEach((m, i)=> t.fromTo(m, {opacity:0, scale:.3}, {opacity:1, scale:1, duration:.4}, .2 + i*.02).to(m, {y:-rnd(6, 16), x:rnd(-6, 6), opacity:.4, duration:.8, yoyo:true, repeat:1, ease:'sine.inOut'}, '>'));
    t.fromTo([lure, stalk], {opacity:0}, {opacity:1, duration:.3}, .3).to(lure, {y:8, x:6, duration:.5, yoyo:true, repeat:3, ease:'sine.inOut'}, .4).to(stalk, {rotation:8, duration:.5, yoyo:true, repeat:3, ease:'sine.inOut'}, .4);
    t.to(box, {opacity:0, duration:.4}, 2.3);
  });
};
// Planned: a pitch-black fish strikes out of the dark at a unit and is gone.
css('pfish', `.fxb-pfish{position:absolute; width:90px; height:40px;} .fxb-pfish svg{width:100%; height:100%; overflow:visible;}`);
M.pitchFish = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const H = hostRect(opts, el);
  const box = over(H, 'fxb-dk', '<i class="fxb-bit fxb-dkfill" style="opacity:.7"></i>'); const fromL = r.left - H.left > H.width/2;
  const f = bits(box, 1, ()=> ({cls:'fxb-pfish'}))[0]; f.innerHTML = '<svg viewBox="0 0 90 40"><path d="M10 20 Q40 0 70 16 L88 6 L84 20 L88 34 L70 24 Q40 40 10 20Z" fill="rgba(225,232,240,.92)"/><circle cx="22" cy="17" r="3" fill="#0a0a12"/><path d="M8 20 L18 22 L10 25Z" fill="#fff"/></svg>';
  const tx = r.left - H.left + r.width/2 - 45, ty = r.top - H.top + r.height/2 - 20, sx = fromL ? -110 : H.width + 20;
  return run([box], opts, (t)=>{
    t.fromTo(box.firstChild, {opacity:0}, {opacity:.7, duration:.3}).set(f, {x:sx, y:ty, scaleX:fromL ? -1 : 1, opacity:.0})
      .to(f, {opacity:.9, duration:.15}, .35).to(f, {x:tx, duration:.28, ease:'power3.in'}, .4).call(()=>{ call(opts.onImpact); }, null, .68)
      .to(f, {x:sx, opacity:0, duration:.45, ease:'power2.in'}, .8).to(box.firstChild, {opacity:0, duration:.35}, 1.1);
  });
};
// Planned (Map 35+): an eclipse: a black disc slides over the sun, the corona flares, stars pop out and the board darkens.
css('eclipse', `.fxb-sun{position:absolute; left:50%; top:16%; width:54px; height:54px; margin-left:-27px; border-radius:50%; background:radial-gradient(circle, #fff8d0, #ffd24a 60%, #ff9a1a); box-shadow:0 0 30px 10px rgba(255,200,70,.6);}
.fxb-moondisc{position:absolute; left:50%; top:16%; width:56px; height:56px; margin-left:-28px; border-radius:50%; background:radial-gradient(circle at 40% 40%, #1a1626, #050409);}
.fxb-corona{position:absolute; left:50%; top:16%; width:56px; height:56px; margin-left:-28px; border-radius:50%; box-shadow:0 0 0 2px rgba(255,250,230,.9), 0 0 26px 12px rgba(255,240,200,.55), 0 0 60px 22px rgba(255,160,90,.25);}
.fxb-star{position:absolute; width:3px; height:3px; border-radius:50%; background:#fff; box-shadow:0 0 5px #fff;}`);
M.eclipse = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const r = hostRect(opts);
  const box = over(r, 'fxb-dk', '<i class="fxb-bit fxb-dkfill" style="opacity:0; background:rgba(16,8,30,1)"></i><i class="fxb-bit fxb-sun"></i><i class="fxb-bit fxb-corona"></i><i class="fxb-bit fxb-moondisc"></i>');
  const [dim, sun, cor, moon] = box.children; const st = bits(box, 18, ()=> ({cls:'fxb-star', style:`left:${rnd(4, 96)}%; top:${rnd(4, 70)}%;`}));
  return run([box], opts, (t)=>{
    t.fromTo(sun, {opacity:0, scale:.6}, {opacity:1, scale:1, duration:.3}).fromTo(moon, {x:-120, opacity:1}, {x:0, duration:1, ease:'power1.inOut'}, .2)
      .to(dim, {opacity:.55, duration:.8}, .4).fromTo(cor, {opacity:0, scale:.8}, {opacity:1, scale:1.15, duration:.3, ease:'power2.out'}, 1.15)
      .to(cor, {scale:1.05, duration:.3, yoyo:true, repeat:1}, '>');
    st.forEach((s, i)=> t.fromTo(s, {opacity:0, scale:0}, {opacity:1, scale:1, duration:.15}, 1.2 + i*.03));
    t.to(box, {opacity:0, duration:.45}, 2.3);
  });
};

/* ============================== WEATHER & TIME ============================== */
css('sky', `.fxb-sky{border-radius:14px; overflow:hidden;}
.fxb-wash{position:absolute; inset:-10% -60%; }
.fxb-rays{position:absolute; width:140%; height:140%; left:-20%; top:-20%; background:repeating-conic-gradient(from 0deg at var(--rx,100%) var(--ry,30%), rgba(255,230,150,.28) 0 6deg, transparent 6deg 16deg); mix-blend-mode:screen;}
.fxb-disc{position:absolute; width:46px; height:46px; border-radius:50%;}
.fxb-bird{position:absolute; width:16px; height:8px;} .fxb-bird svg{width:100%; height:100%; overflow:visible;}`);
function skyBox(opts){ const r = hostRect(opts); return {r, box:over(r, 'fxb-sky')}; }
// Day breaks (wt-day-breaks, was a toast and a rooster): a golden wash sweeps in from the east with the sun's rays.
M.dayBreaks = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const w = bits(box, 1, ()=> ({cls:'fxb-wash', style:'background:linear-gradient(270deg, rgba(255,214,120,.0), rgba(255,214,120,.55) 45%, rgba(255,240,190,.75) 55%, rgba(255,214,120,0));'}))[0];
  const rays = bits(box, 1, ()=> ({cls:'fxb-rays'}))[0];
  const sun = bits(box, 1, ()=> ({cls:'fxb-disc', style:'right:6%; top:50%; background:radial-gradient(circle, #fffbe0, #ffd24a 60%, #ffae2a); box-shadow:0 0 30px 12px rgba(255,210,90,.55);'}))[0];
  return run([box], opts, (t)=>{
    t.fromTo(w, {xPercent:60, opacity:0}, {xPercent:-60, opacity:1, duration:1.3, ease:'power1.inOut'}).to(w, {opacity:0, duration:.35}, 1.0)
      .fromTo(sun, {y:r.height*.35, opacity:0}, {y:-r.height*.3, opacity:1, duration:1, ease:'power2.out'}, 0).to(sun, {opacity:0, duration:.4}, 1.1)
      .fromTo(rays, {opacity:0, rotation:-6}, {opacity:1, rotation:4, duration:.8, ease:'sine.out'}, .2).to(rays, {opacity:0, duration:.5}, 1.0);
  });
};
// Dawn: both sides draw (wt-dawn-draw): rosy light rises from the horizon and a few birds take off (the dawn chorus).
M.dawnDraw = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const w = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:linear-gradient(0deg, rgba(255,150,170,.6), rgba(255,190,150,.35) 35%, rgba(255,220,200,0) 70%);'}))[0];
  const birds = bits(box, 5, i=> ({cls:'fxb-bird', style:`left:${10 + i*18}%; top:80%;`})); birds.forEach(b=> b.innerHTML = '<svg viewBox="0 0 16 8"><path d="M0 2 Q4 -1 8 5 Q12 -1 16 2" fill="none" stroke="#3a2a3a" stroke-width="1.6"/></svg>');
  const decks = [...document.querySelectorAll('.deck-widget')].filter(d=> d.getBoundingClientRect().width).slice(0, 2);
  return run([box], opts, (t, g)=>{
    t.fromTo(w, {yPercent:60, opacity:0}, {yPercent:0, opacity:1, duration:.7, ease:'power2.out'}).to(w, {opacity:0, duration:.6}, 1.1);
    birds.forEach((b, i)=> t.fromTo(b, {opacity:0, x:0, y:0}, {opacity:.85, x:rnd(30, 80), y:-r.height*rnd(.55, .8), duration:1.1, ease:'power1.out'}, .2 + i*.08)
      .to(b.firstChild, {scaleY:.3, duration:.12, yoyo:true, repeat:7, transformOrigin:'50% 50%'}, .2 + i*.08).to(b, {opacity:0, duration:.25}, '>-.3'));
    decks.forEach(d=> t.fromTo(d, {filter:'brightness(1)'}, {filter:'brightness(1.45) drop-shadow(0 0 8px #ffd0e0)', duration:.2, yoyo:true, repeat:1, clearProps:'filter'}, .7));
  });
};
// Dusk (wt-dusk, the tone only): the sun sinks in the west, long shadows stretch across the felt, warm turns violet.
M.dusk = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  // 2026-10-16 (user: "The sun thing - i think the static rectangle bars across the screen might look better than the setting sun
  // right now. Otherwise make the setting sun MUCH softer and less obvious - it's not supposed to be seeable"): no sun disc any more.
  // The long shadow bars stay, but static: they fade in where they lie (no stretching across) and fade out, over a faint warm tint
  // from the west (the light's direction) that is much weaker than the old wash.
  void r;
  const w = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:linear-gradient(90deg, rgba(255,150,70,.22), rgba(200,110,140,.08) 45%, rgba(80,60,140,0) 80%);'}))[0];
  const sh = bits(box, 4, i=> ({cls:'fxb-bit', style:`left:0; top:${18 + i*20}%; width:100%; height:9%; background:linear-gradient(90deg, rgba(40,20,50,0), rgba(40,20,50,.35) 30%, rgba(40,20,50,0));`}));
  return run([box], opts, (t)=>{
    t.fromTo(w, {opacity:0}, {opacity:1, duration:.6}).to(w, {opacity:0, duration:.7}, 1.3)
      .fromTo(sh, {opacity:0}, {opacity:1, duration:.6, stagger:.05, ease:'sine.out'}, .15).to(sh, {opacity:0, duration:.6}, 1.2);
  });
};
// Twilight (wt-twilight, was announced as "Day breaks"): rose-violet wash; the sun and the moon cross paths overhead and
// a few stars twinkle (Nocturnal and Diurnal both awake).
M.twilight = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const w = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:linear-gradient(180deg, rgba(150,90,200,.5), rgba(240,120,150,.35) 55%, rgba(255,170,120,.2));'}))[0];
  const sun = bits(box, 1, ()=> ({cls:'fxb-disc', style:'left:8%; top:40%; width:36px; height:36px; background:radial-gradient(circle, #fff1c0, #ffb04a 65%); box-shadow:0 0 20px 8px rgba(255,170,70,.5);'}))[0];
  const moon = bits(box, 1, ()=> ({cls:'fxb-disc', style:'right:8%; top:40%; width:32px; height:32px; background:radial-gradient(circle at 35% 35%, #fbfbff, #c9d2f2 70%); box-shadow:0 0 18px 6px rgba(200,210,255,.5);'}))[0];
  const st = bits(box, 10, ()=> ({cls:'fxb-star', style:`left:${rnd(5, 95)}%; top:${rnd(5, 45)}%;`}));
  const cx = r.width*.42;
  return run([box], opts, (t)=>{
    t.fromTo(w, {opacity:0}, {opacity:1, duration:.5});
    t.fromTo(sun, {x:0, y:0, opacity:0}, {keyframes:[{x:cx*.5, y:-r.height*.3, opacity:1, duration:.6, ease:'sine.out'}, {x:cx, y:-r.height*.1, duration:.6, ease:'sine.in'}]}, .1);
    t.fromTo(moon, {x:0, y:0, opacity:0}, {keyframes:[{x:-cx*.5, y:-r.height*.3, opacity:1, duration:.6, ease:'sine.out'}, {x:-cx, y:-r.height*.1, duration:.6, ease:'sine.in'}]}, .1);
    st.forEach((s, i)=> t.fromTo(s, {opacity:0}, {opacity:1, duration:.2, yoyo:true, repeat:1}, .5 + i*.07));
    t.to([w, sun, moon], {opacity:0, duration:.5}, 1.5);
  });
};
// Realtime clock flips day/night (wt-realtime-phase): a clock face spins its hands and flips over to a sun or a moon.
css('clock', `.fxb-clock{position:absolute; left:50%; top:14%; width:52px; height:52px; margin-left:-26px; border-radius:50%; background:radial-gradient(circle, #fff9ea, #e9d6aa); border:3px solid #6b4a1e; box-shadow:0 3px 10px rgba(0,0,0,.4);}
.fxb-hand{position:absolute; left:50%; bottom:50%; width:3px; margin-left:-1.5px; background:#3a2a10; border-radius:2px; transform-origin:50% 100%;}
.fxb-clockface{position:absolute; inset:0; display:grid; place-items:center; font:900 30px/1 system-ui; backface-visibility:hidden;}`);
M.realtimePhase = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const c = bits(box, 1, ()=> ({cls:'fxb-clock'}))[0]; c.innerHTML = '<i class="fxb-bit fxb-hand" style="height:16px; left:50%; top:auto;"></i><i class="fxb-bit fxb-hand" style="height:22px; width:2px; left:50%; top:auto;"></i>';
  const [h1, h2] = c.children; const face = document.createElement('i'); face.className = 'fxb-bit fxb-clockface'; face.textContent = opts.phase === 'night' ? '🌙' : '☀️'; c.appendChild(face);
  return run([box], opts, (t)=>{
    t.fromTo(c, {scale:0, opacity:0}, {scale:1, opacity:1, duration:.25, ease:'back.out(2)'}).to(h1, {rotation:360, duration:.8, ease:'power2.inOut'}, .2).to(h2, {rotation:720 + 180, duration:.8, ease:'power2.inOut'}, .2)
      .to(c, {rotationY:90, duration:.15, ease:'power1.in'}, 1.0).set([h1, h2], {opacity:0}).set(face, {opacity:1}).set(c, {background:opts.phase === 'night' ? 'radial-gradient(circle,#3b4c8c,#121a3d)' : 'radial-gradient(circle,#fff6c8,#ffcf5a)'})
      .to(c, {rotationY:0, duration:.15, ease:'power1.out'}).to(c, {opacity:0, y:-10, duration:.35}, '+=.35');
    t.set(face, {opacity:0}, 0);
  });
};
// Moon phase changes (wt-moon-phase, a toast; the inventory asks for variants). opts.phase 0..7 (0 new, 4 full).
//   A a moon disc rises at the top of the felt in its phase; B a big moon with the phase name across the felt;
//   C the eight phases in an arc, the current one swelling (in the game: A).
const MOON_NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
function moonSVG(ph){ // the lit part of the moon for phase 0..7, as an SVG
  const f = ph/8, lit = (1 - Math.cos(f*Math.PI*2))/2, waxing = f < .5, rx = Math.abs(1 - lit*2)*20;
  const sweepOuter = waxing ? 1 : 0, sweepInner = lit > .5 ? (waxing ? 1 : 0) : (waxing ? 0 : 1);
  const d = ph === 0 ? '' : ph === 4 ? '<circle cx="22" cy="22" r="20" fill="url(#fxbMoon)"/>' : `<path d="M22 2 A20 20 0 0 ${sweepOuter} 22 42 A${rx.toFixed(1)} 20 0 0 ${sweepInner} 22 2Z" fill="url(#fxbMoon)"/>`;
  return `<svg viewBox="0 0 44 44"><defs><radialGradient id="fxbMoon" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d0ee"/></radialGradient></defs><circle cx="22" cy="22" r="20" fill="#1c2240" stroke="rgba(200,210,255,.35)" stroke-width="1"/>${d}</svg>`;
}
css('moon', `.fxb-moon{position:absolute; width:58px; height:58px; filter:drop-shadow(0 0 14px rgba(200,215,255,.7));} .fxb-moon svg{width:100%; height:100%;}
.fxb-moonname{position:absolute; left:50%; top:58%; padding:4px 14px; border-radius:999px; background:rgba(14,18,40,.8); color:#e6ecff; font:800 16px/1.2 'Baloo 2', system-ui; white-space:nowrap; border:1px solid rgba(200,210,255,.4);}`);
M.moonPhase = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const ph = (opts.phase|0) % 8; const {r, box} = skyBox(opts);
  const glow = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:radial-gradient(ellipse at 50% 0, rgba(190,205,255,.4), transparent 60%);'}))[0];
  const m = bits(box, 1, ()=> ({cls:'fxb-moon', style:'left:50%; top:6%; margin-left:-29px;'}))[0]; m.innerHTML = moonSVG(ph);
  return run([box], opts, (t)=>{ t.fromTo(glow, {opacity:0}, {opacity:1, duration:.5}).fromTo(m, {y:r.height*.4, opacity:0, scale:.7}, {y:0, opacity:1, scale:1, duration:.9, ease:'power2.out'}, 0)
    .to(m, {y:-4, duration:.4, yoyo:true, repeat:1, ease:'sine.inOut'}, '>').to([m, glow], {opacity:0, duration:.45}, 1.75); });
};
M.moonPhase_B = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const ph = (opts.phase|0) % 8; const {r, box} = skyBox(opts);
  const dim = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:rgba(10,14,40,.45);'}))[0];
  const m = bits(box, 1, ()=> ({cls:'fxb-moon', style:'left:50%; top:22%; width:110px; height:110px; margin-left:-55px;'}))[0]; m.innerHTML = moonSVG(ph);
  const nm = bits(box, 1, ()=> ({cls:'fxb-moonname', text:MOON_NAMES[ph]}))[0];
  return run([box], opts, (t)=>{ t.fromTo(dim, {opacity:0}, {opacity:1, duration:.3}).fromTo(m, {scale:.3, opacity:0, rotation:-30}, {scale:1, opacity:1, rotation:0, duration:.6, ease:'back.out(1.6)'}, .1)
    .fromTo(nm, {xPercent:-50, y:10, opacity:0}, {y:0, opacity:1, duration:.3}, .5).to([m, nm, dim], {opacity:0, duration:.4}, 1.8); });
};
M.moonPhase_C = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const ph = (opts.phase|0) % 8; const {r, box} = skyBox(opts);
  const ms = []; for(let i = 0; i < 8; i++){ const a = Math.PI*(1.1 + i/7*.8); const m = document.createElement('i'); m.className = 'fxb-bit fxb-moon';
    m.style.cssText += `width:30px; height:30px; left:${50 + Math.cos(a)*38}%; top:${62 + Math.sin(a)*48}%; margin:-15px 0 0 -15px;`; m.innerHTML = moonSVG(i); box.appendChild(m); ms.push(m); }
  return run([box], opts, (t)=>{ t.fromTo(ms, {opacity:0, scale:.4}, {opacity:.55, scale:1, duration:.25, stagger:.05});
    t.to(ms[ph], {scale:2.1, opacity:1, duration:.35, ease:'back.out(2.5)'}, .55).to(ms[ph], {filter:'drop-shadow(0 0 16px #e6ecff)', duration:.2}, '<').to(ms, {opacity:0, duration:.4}, 1.7); });
};
// Tide goes out (wt-tide-ebb): the water drains off the bottom of the board, leaving glints and a shell or two.
css('tide', `.fxb-water{position:absolute; left:-5%; right:-5%; bottom:0; height:46%; background:linear-gradient(180deg, rgba(150,215,255,.6), rgba(40,120,200,.35) 60%, rgba(30,90,170,.25)); border-radius:50% 50% 0 0 / 22% 22% 0 0; box-shadow:0 -3px 0 rgba(235,250,255,.7);}
.fxb-glint{position:absolute; width:5px; height:5px; background:#fff; clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);}
.fxb-spray{position:absolute; width:6px; height:6px; border-radius:50%; background:rgba(235,250,255,.95); box-shadow:0 0 4px #bfe9ff;}`);
M.tideEbb = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const w = bits(box, 1, ()=> ({cls:'fxb-water'}))[0]; const gl = bits(box, 12, ()=> ({cls:'fxb-glint', style:`left:${rnd(5, 95)}%; top:${rnd(60, 95)}%;`}));
  const sh = bits(box, 2, i=> ({cls:'fxb-bit', text:'🐚', style:`left:${[22, 70][i]}%; top:${[84, 88][i]}%; font-size:16px;`}));
  return run([box], opts, (t)=>{
    t.fromTo(w, {yPercent:0, opacity:1}, {yPercent:105, duration:1.1, ease:'power2.in'});
    gl.forEach((g, i)=> t.fromTo(g, {opacity:0, scale:0}, {opacity:1, scale:1.4, duration:.15, yoyo:true, repeat:1}, .6 + i*.04));
    t.fromTo(sh, {opacity:0, y:6}, {opacity:1, y:0, duration:.3}, .8).to(sh, {opacity:0, duration:.35}, 1.5);
  });
};
// High tide (wt-high-tide, looked like Flow): a bigger double crest rushes up past the middle, spray bursts over the top row.
M.tideHigh = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const w1 = bits(box, 1, ()=> ({cls:'fxb-water', style:'height:75%;'}))[0], w2 = bits(box, 1, ()=> ({cls:'fxb-water', style:'height:62%; opacity:.7;'}))[0];
  const sp = bits(box, 22, ()=> ({cls:'fxb-spray', style:`left:${rnd(5, 95)}%; top:30%;`}));
  return run([box], opts, (t)=>{
    t.fromTo(w1, {yPercent:110}, {yPercent:5, duration:.55, ease:'power2.out'}).to(w1, {yPercent:110, duration:.6, ease:'power2.in'}, '>+.1')
      .fromTo(w2, {yPercent:110}, {yPercent:-4, duration:.55, ease:'power2.out'}, .25).to(w2, {yPercent:110, duration:.6, ease:'power2.in'}, '>+.05');
    sp.forEach((s, i)=> t.fromTo(s, {y:0, x:0, opacity:0}, {y:-r.height*rnd(.15, .35), x:rnd(-20, 20), opacity:1, duration:.3, ease:'power2.out'}, .45 + i*.012).to(s, {y:'+=' + r.height*.25, opacity:0, duration:.4, ease:'power1.in'}, '>'));
  });
};
// Perma-tide (wt-perma-tide, a pill): a persistent river current along the tide line (lives while the board does).
css('current', `.fxb-current{position:absolute; left:0; right:0; bottom:0; height:30%; z-index:1; pointer-events:none; overflow:hidden; border-radius:0 0 14px 14px;
  background:repeating-linear-gradient(100deg, rgba(220,245,255,0) 0 40px, rgba(220,245,255,.22) 46px 52px, rgba(220,245,255,0) 60px 120px); background-size:240px 100%; animation:fxbFlow 6s linear infinite; opacity:.85;
  -webkit-mask:linear-gradient(0deg, #000 30%, transparent);}
@keyframes fxbFlow{to{background-position:240px 0;}}`);
M.permaTide = function(host, opts){ opts = opts || {}; host = host || document.getElementById('battlefieldEl'); if(!host) return null;
  let c = host.querySelector(':scope > .fxb-current'); if(opts.off){ if(c) c.remove(); return null; }
  if(!c){ c = document.createElement('i'); c.className = 'fxb-current fxb-persist'; c.setAttribute('aria-hidden', 'true'); host.appendChild(c); const g = G(); if(g && opts.intro !== false) g.fromTo(c, {opacity:0}, {opacity:.85, duration:1.2}); }
  return c; };
// Moonpull brings the tide in (wt-moonpull): the Moon Jelly glows silver and the water rises toward it.
M.moonpull = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const H = hostRect(opts, el);
  const box = over(H, 'fxb-sky'); const w = bits(box, 1, ()=> ({cls:'fxb-water', style:'height:40%;'}))[0];
  const cx = r.left - H.left + r.width/2; const cols = bits(box, 8, i=> ({cls:'fxb-spray', style:`left:${cx + (i - 3.5)*10}px; top:95%; width:4px; height:14px; border-radius:4px;`}));
  const g = over(r, '', '<i class="fxb-bit" style="inset:-20%; border-radius:50%; background:radial-gradient(circle, rgba(230,240,255,.85), rgba(170,200,255,.3) 45%, transparent 70%);"></i>'); g.style.overflow = 'visible';
  return run([box, g], opts, (t)=>{
    t.fromTo(g.firstChild, {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.35}).to(g.firstChild, {opacity:.5, duration:.2, yoyo:true, repeat:3}, '>')
      .fromTo(w, {yPercent:100}, {yPercent:30, duration:.9, ease:'power1.inOut'}, .2).to(w, {opacity:0, duration:.4}, 1.15).to(g.firstChild, {opacity:0, duration:.3}, 1.25);
    cols.forEach((c, i)=> t.fromTo(c, {y:0, opacity:0}, {y:-(H.bottom - r.bottom) - H.height*.05 + rnd(-10, 10), opacity:1, duration:.6, ease:'power1.out'}, .3 + i*.05).to(c, {opacity:0, duration:.2}, '>'));
  });
};
// Wind (wt-wind-gust: was a static drift): leaves and feathers streak across from the side it blows from.
// opts.from 'mine' (your side: it blows up the board) | 'theirs' (down the board). Calm (wt-wind-calm): they drift down and
// settle. Swap (wt-wind-swap): a swirl turns about in the middle before the new gust.
css('wind', `.fxb-streak{position:absolute; height:2px; width:70px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85));}
.fxb-swirl{position:absolute; left:50%; top:50%; width:90px; height:90px; margin:-45px; overflow:visible;} .fxb-swirl path{fill:none; stroke:rgba(255,255,255,.9); stroke-width:3; stroke-linecap:round;}`);
M.windGust = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts); const up = opts.from !== 'theirs';
  const ang = up ? -68 : 112; const dx = Math.cos(ang*Math.PI/180), dy = Math.sin(ang*Math.PI/180), L = Math.hypot(r.width, r.height)*.9;
  const st = bits(box, 12, ()=> ({cls:'fxb-streak', style:`left:${rnd(0, 100)}%; top:${rnd(0, 100)}%; transform:rotate(${ang}deg);`}));
  const lv = bits(box, 10, i=> ({cls:'fxb-bit', text:pick(['🍃', '🍃', '🍂', '🪶']), style:`left:${rnd(5, 95)}%; top:${up ? 100 : -8}%; font-size:${rnd(14, 22)}px;`}));
  return run([box], opts, (t)=>{
    st.forEach((s, i)=> t.fromTo(s, {x:-dx*L*.5, y:-dy*L*.5, opacity:0}, {x:dx*L*.5, y:dy*L*.5, opacity:1, duration:.55, ease:'power1.in'}, i*.05).to(s, {opacity:0, duration:.1}, '>-.1'));
    lv.forEach((l, i)=> t.fromTo(l, {x:rnd(-30, 30), y:0, rotation:0, opacity:1}, {x:'+=' + dx*L*.3, y:dy*r.height*rnd(1.0, 1.2), rotation:rnd(-540, 540), duration:rnd(.7, 1), ease:'power1.in'}, .1 + i*.04));
  });
};
M.windCalm = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const lv = bits(box, 7, i=> ({cls:'fxb-bit', text:pick(['🍃', '🍂', '🪶']), style:`left:${8 + i*13}%; top:-6%; font-size:${rnd(13, 19)}px;`}));
  return run([box], opts, (t)=>{
    lv.forEach((l, i)=> t.fromTo(l, {y:0, x:0, rotation:rnd(-40, 40), opacity:0}, {y:r.height*rnd(.75, .95), opacity:1, duration:1.3, ease:'sine.out'}, i*.06)
      .to(l, {x:'+=' + rnd(14, 26), duration:.32, yoyo:true, repeat:3, ease:'sine.inOut'}, i*.06).to(l, {rotation:0, duration:.4}, '>-.4').to(l, {opacity:0, duration:.35}, 1.45 + i*.03));
  });
};
M.windSwap = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const s = bits(box, 1, ()=> ({cls:'fxb-swirl'}))[0]; s.innerHTML = '<svg viewBox="-45 -45 90 90" class="fxb-swirl" style="position:static; margin:0"><path d="M0 0 C 10 -8 20 4 10 16 C -4 30 -26 14 -22 -6 C -18 -28 14 -36 30 -18 C 40 -6 40 8 34 20"/><path d="M34 20 l2 -10 M34 20 l-9 -3"/></svg>';
  return run([box], opts, (t)=> t.fromTo(s, {scale:.2, opacity:0, rotation:0}, {scale:1, opacity:1, rotation:-240, duration:.5, ease:'power2.out'}).to(s, {scaleX:-1, duration:.25, ease:'back.out(2)'}).to(s, {rotation:'-=120', opacity:0, scale:1.3, duration:.35}, '+=.1'));
};
// Headwind: a Flyer's skill or trigger goes off twice (wt-headwind): a rune echo is blown off the card sideways.
css('echo', `.fxb-rune{position:absolute; left:50%; top:45%; width:46px; height:46px; margin:-23px; border-radius:50%; border:2px dashed rgba(255,255,255,.9); box-shadow:0 0 10px rgba(180,230,255,.8); display:grid; place-items:center; color:#fff; font:900 16px/1 system-ui;}`);
M.headwindEcho = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve(); const dir = opts.dir || (isMineEl(el) ? -1 : 1);
  const box = over(r, ''); box.style.overflow = 'visible'; const rs = bits(box, 2, ()=> ({cls:'fxb-rune', text:'×2'}));
  const st = bits(box, 5, i=> ({cls:'fxb-streak', style:`left:20%; top:${20 + i*14}%; width:40px;`}));
  return run([box], opts, (t)=>{
    t.fromTo(rs[0], {scale:.3, opacity:0}, {scale:1, opacity:1, duration:.2, ease:'back.out(2)'}).to(rs[0], {opacity:0, duration:.3}, '+=.2')
      .fromTo(rs[1], {scale:1, opacity:0, x:0}, {opacity:.8, duration:.1}, .25).to(rs[1], {x:dir*r.width*.7, y:-10, rotation:dir*40, opacity:0, duration:.5, ease:'power2.out'}, .3);
    st.forEach((s, i)=> t.fromTo(s, {x:0, opacity:0}, {x:dir*r.width*.8, opacity:1, duration:.35, ease:'power1.in'}, .2 + i*.03).to(s, {opacity:0, duration:.1}, '>-.05'));
  });
};
// Rain starts / stops while you look at the map (wt-rain-start-stop): first a few big drops, then the downpour builds;
// stopping, it thins out, the last drops fall and the light comes back.
css('rainmap', `.fxb-rainsheet{position:absolute; inset:-10%; background:repeating-linear-gradient(105deg, rgba(200,225,255,0) 0 9px, rgba(200,225,255,.45) 9px 10px, rgba(200,225,255,0) 10px 22px);
  background-size:220px 220px; animation:fxbRain .45s linear infinite;}
@keyframes fxbRain{to{background-position:-40px 220px;}}
.fxb-bigdrop{position:absolute; width:2px; height:16px; border-radius:2px; background:linear-gradient(180deg, rgba(220,240,255,0), rgba(220,240,255,.95));}
.fxb-splash{position:absolute; width:14px; height:5px; border-radius:50%; border:1.5px solid rgba(220,240,255,.85);}`);
M.rainStartStop = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const r = hostRect(opts); const start = opts.start !== false;
  const box = over(r, 'fxb-sky', '<i class="fxb-bit" style="inset:0; background:rgba(40,60,90,.35)"></i><i class="fxb-bit fxb-rainsheet"></i>'); const [dim, sheet] = box.children;
  const drops = bits(box, 10, ()=> ({cls:'fxb-bigdrop', style:`left:${rnd(5, 95)}%; top:-5%;`})); const spl = bits(box, 10, ()=> ({cls:'fxb-splash', style:`left:${rnd(5, 95)}%; top:${rnd(40, 95)}%;`}));
  return run([box], opts, (t)=>{
    if(start){ drops.forEach((d, i)=> t.fromTo(d, {y:0, opacity:1}, {y:r.height*rnd(.5, .95), duration:.5, ease:'power1.in'}, i*.08).to(d, {opacity:0, duration:.05}, '>'));
      spl.forEach((s, i)=> t.fromTo(s, {scale:.2, opacity:1}, {scale:1.6, opacity:0, duration:.35}, .4 + i*.07));
      t.fromTo(dim, {opacity:0}, {opacity:1, duration:.8}, .4).fromTo(sheet, {opacity:0}, {opacity:1, duration:.8}, .7).to([sheet, dim], {opacity:0, duration:.5}, 1.9); }
    else { t.set([dim, sheet], {opacity:1}).to(sheet, {opacity:0, duration:1, ease:'power1.in'}, .1).to(dim, {opacity:0, duration:1.2}, .5);
      drops.slice(0, 4).forEach((d, i)=> t.fromTo(d, {y:0, opacity:1}, {y:r.height*rnd(.6, .9), duration:.5, ease:'power1.in'}, .8 + i*.2).to(d, {opacity:0, duration:.05}, '>'));
      spl.slice(0, 4).forEach((s, i)=> t.fromTo(s, {scale:.2, opacity:1}, {scale:1.6, opacity:0, duration:.35}, 1.25 + i*.2)); }
  });
};
// The initiative coin moves sides (wt-initiative-coin, the plain roll): a glint trail follows it and it lands with a clink of sparks.
M.initCoin = function(coin, opts){
  opts = opts || {}; if(!coin || !coin.getBoundingClientRect) return Promise.resolve();
  const g = G(), box = layer('fxb-cointrail'); const sp = [];
  const tick = ()=>{ const r = coin.getBoundingClientRect(); if(!r.width) return; const s = document.createElement('i'); s.className = 'fxb-bit fxb-mote'; s.style.left = (r.left + r.width/2 - 2.5 + rnd(-4, 4)) + 'px'; s.style.top = (r.top + r.height/2 - 2.5) + 'px'; box.appendChild(s); sp.push(s); if(g) g.to(s, {opacity:0, scale:.2, duration:.4, onComplete:()=> s.remove()}); };
  return run([box], opts, (t)=>{
    for(let i = 0; i < 9; i++) t.call(tick, null, i*.09);
    t.call(()=>{ const r = coin.getBoundingClientRect(); if(r.width) ringAt(r.left + r.width/2, r.top + r.height/2, {color:'#ffd56e', size:30, dur:450}); for(let k = 0; k < 6; k++){ const s = document.createElement('i'); s.className = 'fxb-bit fxb-mote'; s.style.left = (r.left + r.width/2) + 'px'; s.style.top = (r.top + r.height/2) + 'px'; box.appendChild(s);
      if(g) g.to(s, {x:Math.cos(k)*26, y:Math.sin(k)*26, opacity:0, duration:.45, ease:'power2.out'}); } }, null, .88).to({}, {duration:.62});
  });
};
// Planned (Map 35+): Syzygy, high tide + full moon + eclipse at once: sun, moon and earth line up, then one blazing ring.
css('syzygy', `.fxb-orb{position:absolute; top:22%; width:30px; height:30px; margin:-15px; border-radius:50%;}
.fxb-blaze{position:absolute; left:50%; top:46%; width:160px; height:160px; margin:-80px; border-radius:50%; border:5px solid #fff1c4; box-shadow:0 0 30px 10px rgba(255,210,120,.75), inset 0 0 30px 8px rgba(255,190,90,.6);}`);
M.syzygy = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const dim = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:rgba(20,10,40,.5);'}))[0];
  const orbs = [['#ffd24a', 'radial-gradient(circle,#fffbe0,#ffd24a 60%,#ff9a1a)'], ['#cfd8ff', 'radial-gradient(circle at 35% 35%,#ffffff,#c8d0ee)'], ['#5fb0ff', 'radial-gradient(circle at 35% 35%,#bfe6ff,#2f7ad0 60%,#2a8a3a)']]
    .map((o, i)=> bits(box, 1, ()=> ({cls:'fxb-orb', style:`left:${[18, 82, 50][i]}%; top:${[18, 30, 70][i]}%; background:${o[1]}; box-shadow:0 0 16px ${o[0]};`}))[0]);
  const ring = bits(box, 1, ()=> ({cls:'fxb-blaze'}))[0];
  return run([box], opts, (t)=>{
    t.fromTo(dim, {opacity:0}, {opacity:1, duration:.4});
    orbs.forEach((o, i)=> t.fromTo(o, {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.3}, i*.1).to(o, {left:'50%', top:'46%', duration:.9, ease:'power2.inOut'}, .5 + i*.05));
    t.to(orbs, {opacity:0, scale:.5, duration:.15}, 1.45).fromTo(ring, {scale:.2, opacity:0}, {scale:1, opacity:1, duration:.3, ease:'back.out(2)'}, 1.45)
      .to(ring, {scale:1.15, duration:.25, yoyo:true, repeat:1}, '>').to([ring, dim], {opacity:0, duration:.45}, 2.2);
  });
};
// Planned: the Eclipse phase pill and sky: the sun pill is covered by a moon disc and the board takes a red-violet tint.
M.eclipsePhase = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const tint = bits(box, 1, ()=> ({cls:'fxb-wash', style:'inset:0; background:radial-gradient(ellipse at 50% 20%, rgba(120,30,60,.25), rgba(40,10,50,.5));'}))[0];
  const pill = bits(box, 1, ()=> ({cls:'fxb-bit', style:'left:12px; top:10px; width:62px; height:28px; border-radius:999px; background:rgba(20,14,30,.85); border:1px solid rgba(255,220,180,.5);'}))[0];
  const sun = document.createElement('i'); sun.className = 'fxb-bit'; sun.style.cssText = 'left:8px; top:4px; width:20px; height:20px; border-radius:50%; background:radial-gradient(circle,#fffbe0,#ffd24a 60%,#ff9a1a);'; pill.appendChild(sun);
  const mo = document.createElement('i'); mo.className = 'fxb-bit'; mo.style.cssText = 'left:8px; top:4px; width:20px; height:20px; border-radius:50%; background:#0b0812; box-shadow:0 0 0 1.5px #fff3d0, 0 0 10px 3px rgba(255,220,170,.7);'; pill.appendChild(mo);
  const lbl = document.createElement('b'); lbl.className = 'fxb-bit'; lbl.style.cssText = 'left:32px; top:6px; color:#ffe6c4; font:800 12px/1.3 system-ui;'; lbl.textContent = '2/2'; pill.appendChild(lbl);
  return run([box], opts, (t)=> t.fromTo(pill, {opacity:0, y:-8}, {opacity:1, y:0, duration:.3}).fromTo(mo, {x:-26, opacity:1}, {x:0, duration:.8, ease:'power1.inOut'}, .3)
    .fromTo(tint, {opacity:0}, {opacity:1, duration:.7}, .5).to([tint, pill], {opacity:0, duration:.45}, 2.0));
};

/* ================================= FIELDS ================================= */
// A field card is played (fld-set, P1: no board-wide wash): each field washes across the felt in its own element.
// opts.field frozen | rain | fog | heatwave | moon (else a golden-leaf wash). The field tile itself still lands (game CSS).
css('field', `.fxb-fwash{position:absolute; inset:0;}
.fxb-flake{position:absolute; font:900 14px/1 system-ui; color:#fff; text-shadow:0 0 6px #9fd8ff;}
.fxb-fogbank{position:absolute; width:70%; height:34%; border-radius:50%; background:radial-gradient(ellipse, rgba(236,240,246,.9), rgba(220,226,236,.5) 45%, transparent 70%); filter:blur(6px);}
.fxb-heat{position:absolute; left:-5%; right:-5%; height:3px; border-radius:3px; background:linear-gradient(90deg, transparent, rgba(255,230,180,.7), transparent);}`);
M.fieldSet = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const f = opts.field || 'frozen'; const {r, box} = skyBox(opts);
  const W = r.width, H = r.height;
  return run([box], opts, (t)=>{
    if(f === 'frozen'){ const w = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(200,235,255,.65) 85%); box-shadow:inset 0 0 40px 10px rgba(235,250,255,.8);'}))[0];
      const fl = bits(box, 16, i=> ({cls:'fxb-flake', text:i%3 ? '❄' : '❅', style:`left:${i < 8 ? (i%2 ? 2 : 92) : rnd(5, 95)}%; top:${i < 8 ? rnd(5, 90) : (i%2 ? 2 : 90)}%; font-size:${rnd(12, 22)}px;`}));
      t.fromTo(w, {opacity:0}, {opacity:1, duration:.5}).to(w, {opacity:0, duration:.6}, 1.0);
      fl.forEach((s, i)=> t.fromTo(s, {scale:0, rotation:0, opacity:0}, {scale:1, rotation:120, opacity:1, x:(W/2 - (parseFloat(s.style.left)/100)*W)*.25, y:(H/2 - (parseFloat(s.style.top)/100)*H)*.25, duration:.6, ease:'power2.out'}, .05*i).to(s, {opacity:0, duration:.35}, 1.0 + i*.01)); }
    else if(f === 'rain'){ const sh = bits(box, 1, ()=> ({cls:'fxb-rainsheet'}))[0]; const dim = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(180deg, rgba(80,110,150,.4), rgba(80,140,190,.15));'}))[0];
      const spl = bits(box, 12, ()=> ({cls:'fxb-splash', style:`left:${rnd(5, 95)}%; top:${rnd(20, 95)}%;`}));
      t.fromTo([dim, sh], {opacity:0, xPercent:-30}, {opacity:1, xPercent:0, duration:.6, ease:'power2.out'}).to([dim, sh], {opacity:0, duration:.5}, 1.1);
      spl.forEach((s, i)=> t.fromTo(s, {scale:.2, opacity:1}, {scale:1.7, opacity:0, duration:.35}, .3 + i*.06)); }
    else if(f === 'fog'){ const fb = bits(box, 6, i=> ({cls:'fxb-fogbank', style:`left:${i%2 ? 55 : -25}%; top:${8 + Math.floor(i/2)*30}%;`}));
      fb.forEach((b, i)=> t.fromTo(b, {x:(i%2 ? 1 : -1)*W*.5, opacity:0}, {x:(i%2 ? -1 : 1)*W*.12, opacity:.95, duration:.9, ease:'power2.out'}, i*.06).to(b, {opacity:0, duration:.5}, 1.2 + i*.03)); }
    else if(f === 'heatwave'){ const w = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(0deg, rgba(255,120,40,.45), rgba(255,200,90,.25) 50%, rgba(255,230,160,0)); mix-blend-mode:screen;'}))[0];
      const sun = bits(box, 1, ()=> ({cls:'fxb-disc', style:'left:50%; top:4%; margin-left:-23px; background:radial-gradient(circle, #fffbe0, #ffb43a 60%, #ff6a1a); box-shadow:0 0 36px 16px rgba(255,140,40,.55);'}))[0];
      const ln = bits(box, 9, i=> ({cls:'fxb-heat', style:`top:${15 + i*9}%;`}));
      t.fromTo(w, {opacity:0, yPercent:30}, {opacity:1, yPercent:0, duration:.6}).to(w, {opacity:0, duration:.6}, 1.1).fromTo(sun, {scale:.3, opacity:0}, {scale:1, opacity:1, duration:.5, ease:'back.out(2)'}, .1).to(sun, {opacity:0, duration:.5}, 1.1);
      ln.forEach((l, i)=> t.fromTo(l, {y:20, opacity:0, scaleX:.6}, {y:-30, opacity:.9, scaleX:1, duration:.8, ease:'sine.inOut'}, .15 + i*.06).to(l, {skewX:20, duration:.2, yoyo:true, repeat:2}, .25 + i*.06).to(l, {opacity:0, duration:.3}, '>')); }
    else if(f === 'moon'){ const w = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:radial-gradient(ellipse at 50% -10%, rgba(220,230,255,.65), rgba(150,170,230,.25) 50%, rgba(20,30,70,.3));'}))[0];
      const m = bits(box, 1, ()=> ({cls:'fxb-moon', style:'left:50%; top:3%; margin-left:-29px;'}))[0]; m.innerHTML = moonSVG(4);
      const sp = bits(box, 14, ()=> ({cls:'fxb-star', style:`left:${rnd(5, 95)}%; top:${rnd(10, 90)}%;`}));
      t.fromTo(w, {opacity:0}, {opacity:1, duration:.5}).fromTo(m, {y:-30, opacity:0}, {y:0, opacity:1, duration:.6, ease:'power2.out'}, 0).to([w, m], {opacity:0, duration:.6}, 1.15);
      sp.forEach((s, i)=> t.fromTo(s, {opacity:0, scale:0}, {opacity:1, scale:1.3, duration:.15, yoyo:true, repeat:1}, .3 + i*.05)); }
    else { const w = bits(box, 1, ()=> ({cls:'fxb-wash', style:'background:linear-gradient(90deg, rgba(255,214,120,0), rgba(255,214,120,.5), rgba(255,214,120,0));'}))[0];
      const lv = bits(box, 10, ()=> ({cls:'fxb-bit', text:pick(['🍃', '🍂', '🍁']), style:`left:-6%; top:${rnd(5, 90)}%; font-size:18px;`}));
      t.fromTo(w, {xPercent:-60, opacity:0}, {xPercent:60, opacity:1, duration:1.1}).to(w, {opacity:0, duration:.3}, .9);
      lv.forEach((l, i)=> t.fromTo(l, {x:0}, {x:W*1.1, y:rnd(-30, 30), rotation:rnd(-400, 400), duration:1, ease:'power1.inOut'}, i*.05)); }
    const tile = opts.tile || document.getElementById('fieldCondCard'); if(tile && tile.getBoundingClientRect().width) t.call(()=>{ const tr = tile.getBoundingClientRect(); ringAt(tr.left + tr.width/2, tr.top + tr.height/2, {color:'#ffe9a8', size:Math.max(tr.width, tr.height), to:1.6, dur:500}); }, null, .1);
  });
};
// The played field ends (fld-end, the tile used to just vanish): the field leaves the felt in its own element and its
// tile dissolves into it. Frozen melts, rain clears with light breaking through, fog lifts, the heat cools, the moon sets.
M.fieldEnd = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const f = opts.field || 'frozen'; const {r, box} = skyBox(opts);
  const tile = opts.tile || document.getElementById('fieldCondCard'); const tr = tile && tile.getBoundingClientRect && tile.getBoundingClientRect();
  const tb = tr && tr.width ? over(tr, '') : null; if(tb) tb.style.overflow = 'visible';
  const glyph = {frozen:'💧', rain:'☀', fog:'·', heatwave:'💨', moon:'✦'}[f] || '🍃';
  const tp = tb ? bits(tb, 12, ()=> ({cls:'fxb-bit', text:glyph, style:`left:${rnd(10, 90)}%; top:${rnd(10, 90)}%; font-size:13px; color:#fff;`})) : [];
  return run([box, tb], opts, (t)=>{
    if(f === 'frozen'){ const w = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'box-shadow:inset 0 0 40px 10px rgba(235,250,255,.8);'}))[0]; const dr = bits(box, 14, ()=> ({cls:'fxb-drip', style:`left:${rnd(3, 97)}%; top:${rnd(0, 6)}%;`}));
      t.fromTo(w, {opacity:1}, {opacity:0, duration:1}); dr.forEach((d, i)=> t.fromTo(d, {y:0, opacity:1}, {y:r.height*rnd(.3, .9), opacity:0, duration:.8, ease:'power2.in'}, i*.05)); }
    else if(f === 'rain'){ const sh = bits(box, 1, ()=> ({cls:'fxb-rainsheet'}))[0]; const beams = bits(box, 3, i=> ({cls:'fxb-bit', style:`left:${20 + i*25}%; top:-10%; width:14%; height:120%; transform:skewX(-14deg); background:linear-gradient(180deg, rgba(255,240,190,.55), transparent);`}));
      t.fromTo(sh, {opacity:1}, {opacity:0, duration:.7}).fromTo(beams, {opacity:0}, {opacity:1, duration:.4, stagger:.1}, .4).to(beams, {opacity:0, duration:.5}, 1.1); }
    else if(f === 'fog'){ const fb = bits(box, 4, i=> ({cls:'fxb-fogbank', style:`left:${(i%2) ? 40 : -10}%; top:${20 + Math.floor(i/2)*35}%;`}));
      t.fromTo(fb, {opacity:.9, y:0}, {opacity:0, y:-r.height*.5, duration:1.2, stagger:.06, ease:'power1.in'}); }
    else if(f === 'heatwave'){ const w = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(0deg, rgba(255,120,40,.45), transparent);'}))[0]; const cool = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(0deg, rgba(120,170,220,.35), transparent);'}))[0];
      t.fromTo(w, {opacity:1}, {opacity:0, duration:.7}).fromTo(cool, {opacity:0}, {opacity:1, duration:.4}, .3).to(cool, {opacity:0, duration:.5}, .8); }
    else if(f === 'moon'){ const m = bits(box, 1, ()=> ({cls:'fxb-moon', style:'left:50%; top:3%; margin-left:-29px;'}))[0]; m.innerHTML = moonSVG(4);
      t.fromTo(m, {y:0, opacity:1}, {y:r.height*.25, opacity:0, duration:1.1, ease:'power1.in'}); }
    if(tile && tb){ t.to(tile, {opacity:.25, filter:'blur(1px) saturate(.4)', duration:.5, yoyo:true, repeat:1, clearProps:'opacity,filter'}, 0);
      tp.forEach((p, i)=> t.fromTo(p, {opacity:0}, {opacity:1, duration:.1}, .1 + i*.02).to(p, {y:-rnd(20, 50), x:rnd(-20, 20), opacity:0, duration:.6}, '>')); }
    t.to({}, {duration:.1}, 1.2);
  });
};
// The map's own field returns after a played one ends (fld-base-returns): its card flips back in with a leaf burst.
M.baseReturns = function(tile, opts){
  opts = opts || {}; tile = tile || document.getElementById('fieldCondCard'); if(!tile || !tile.getBoundingClientRect) return Promise.resolve(); const r = tile.getBoundingClientRect(); if(!r.width) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const lv = bits(box, 9, ()=> ({cls:'fxb-bit', text:pick(['🍃', '🍂', '🍃', '✦']), style:'left:45%; top:45%; font-size:15px;'}));
  return run([box], opts, (t)=>{ t.fromTo(tile, {rotationY:90, transformPerspective:500}, {rotationY:0, duration:.45, ease:'back.out(1.6)', clearProps:'transform'})
    .call(()=> call(opts.onImpact)); lv.forEach((l, i)=>{ const a = i/9*Math.PI*2; t.fromTo(l, {x:0, y:0, opacity:1, rotation:0}, {x:Math.cos(a)*r.width*.8, y:Math.sin(a)*r.height*.7, rotation:rnd(-200, 200), opacity:0, duration:.6, ease:'power2.out'}, .3); }); });
};
// Frigid: a unit weak to cold takes 1 (fld-frigid-weak, the generic float): icicles drop onto it and crack.
css('icicle', `.fxb-icicle{position:absolute; top:-40%; width:12px; height:30px; background:linear-gradient(180deg,#ffffff,#bfe6ff 50%,#6aa9d8); clip-path:polygon(0 0,100% 0,50% 100%); filter:drop-shadow(0 0 4px #9fd8ff);}`);
M.frigidWeak = function(el, opts){
  opts = opts || {}; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const ic = bits(box, 3, i=> ({cls:'fxb-icicle', style:`left:${22 + i*24}%;`}));
  const ch = bits(box, 8, ()=> ({cls:'fxb-ice', style:'left:50%; top:20%;'}));
  return run([box], opts, (t)=>{
    ic.forEach((c, i)=> t.fromTo(c, {y:-30, opacity:0}, {y:r.height*.38, opacity:1, duration:.22, ease:'power3.in'}, i*.07).to(c, {scaleY:.3, opacity:0, duration:.12}, '>'));
    t.call(()=> call(opts.onImpact), null, .25);
    ch.forEach((c, i)=> t.fromTo(c, {opacity:1, x:0, y:0}, {x:rnd(-1, 1)*r.width*.5, y:rnd(-10, 40), rotation:rnd(-200, 200), opacity:0, duration:.45, ease:'power2.out'}, .24 + (i%3)*.07));
  });
};
// The frost can't touch the enemy's native types (fld-frost-resist): the cold wave reaches the unit and splits around it
// while a warm shimmer outlines it.
css('frostres', `.fxb-warm{position:absolute; inset:-3px; border-radius:12px; box-shadow:0 0 0 2px rgba(255,190,120,.85), 0 0 16px rgba(255,170,90,.6);}`);
M.frostResist = function(el, opts){
  opts = opts || {}; let cp = null; const r = rectOf(el); if(!r) return Promise.resolve();
  const box = over(r, '', '<i class="fxb-bit fxb-warm"></i>'); box.style.overflow = 'visible'; const w = box.firstChild;
  const fl = bits(box, 10, i=> ({cls:'fxb-flake', text:'❄', style:`left:${i%2 ? -10 : 105}%; top:${10 + (i>>1)*18}%; font-size:12px;`}));
  cp = chip(el, '❄ Used to the cold', 'resist', {fy:.05, hold:700});
  return Promise.all([cp, run([box], opts, (t)=>{
    t.fromTo(w, {opacity:0}, {opacity:1, duration:.2, yoyo:true, repeat:2}).to(w, {opacity:0, duration:.3});
    fl.forEach((f, i)=>{ const s = i%2 ? 1 : -1; t.fromTo(f, {opacity:0, x:0}, {opacity:1, x:s*r.width*.35, duration:.25, ease:'power1.out'}, i*.04).to(f, {x:s*r.width*.1, y:(i%4 < 2 ? -1 : 1)*r.height*.4, opacity:0, duration:.4, ease:'power1.out'}, '>'); });
  })]);
};
// Spring Rain heals every unit (fld-rain-tick, floats only): a soft drizzle crosses the felt and a drop lands on each unit
// with a green sparkle.
M.rainTick = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const sh = bits(box, 1, ()=> ({cls:'fxb-rainsheet', style:'opacity:.6'}))[0];
  const units = (opts.units || []).map(rectOf).filter(Boolean);
  const drops = units.map(u=>{ const d = document.createElement('i'); d.className = 'fxb-bit fxb-drip'; d.style.cssText += `left:${u.left - r.left + u.width/2}px; top:${u.top - r.top - 30}px; width:7px; height:12px;`; box.appendChild(d); return {d, u}; });
  return run([box], opts, (t)=>{
    t.fromTo(sh, {opacity:0}, {opacity:.6, duration:.4}).to(sh, {opacity:0, duration:.5}, 1.0);
    drops.forEach(({d, u}, i)=>{ t.fromTo(d, {y:0, opacity:0}, {y:u.height*.4, opacity:1, duration:.35, ease:'power2.in'}, .2 + i*.05).to(d, {opacity:0, duration:.05}, '>')
      .call(()=> ringAt(u.left + u.width/2, u.top + u.height*.42, {color:'#9ff0a0', glow:'#5fd06a', size:28, dur:450}), null, .55 + i*.05); });
    t.to({}, {duration:.5}, .55 + drops.length*.05); // 2026-10-15: outlast the last ring
  });
};
// Thick Fog (fld-fog-active: only the tile was foggy) and Full Moon (fld-moon-active): a lasting layer on the board while
// the field is up. fieldLayer(host, 'fog' | 'moon' | null) adds, swaps or clears it.
css('fieldlayer', `.fxb-flayer{position:absolute; inset:0; z-index:1; pointer-events:none; border-radius:inherit; overflow:hidden;}
.fxb-flayer.is-fog::before, .fxb-flayer.is-fog::after{content:''; position:absolute; left:-30%; width:160%; height:34%; border-radius:50%; filter:blur(10px);
  background:radial-gradient(ellipse, rgba(236,240,246,.55), rgba(220,226,236,.25) 50%, transparent 72%); animation:fxbBank 22s ease-in-out infinite alternate;}
.fxb-flayer.is-fog::before{top:18%;} .fxb-flayer.is-fog::after{top:58%; animation-duration:28s; animation-direction:alternate-reverse;}
@keyframes fxbBank{from{transform:translateX(-12%);} to{transform:translateX(12%);}}
.fxb-flayer.is-moon{background:radial-gradient(ellipse at 50% -12%, rgba(215,225,255,.32), rgba(150,170,230,.1) 45%, transparent 70%);}
.fxb-flayer.is-moon::before{content:''; position:absolute; inset:0; background-image:radial-gradient(1.5px 1.5px at 12% 20%, #fff, transparent), radial-gradient(1.5px 1.5px at 36% 8%, #fff, transparent), radial-gradient(1.5px 1.5px at 70% 16%, #fff, transparent), radial-gradient(1.5px 1.5px at 88% 30%, #fff, transparent), radial-gradient(1.5px 1.5px at 56% 26%, #fff, transparent); animation:fxbTwinkle 3.2s ease-in-out infinite alternate;}
@keyframes fxbTwinkle{to{opacity:.35;}}`);
M.fieldLayer = function(host, kind, opts){
  opts = opts || {}; host = host || document.getElementById('battlefieldEl'); if(!host) return null; const g = G();
  let l = host.querySelector(':scope > .fxb-flayer'); const want = kind === 'fog' || kind === 'moon' ? kind : null;
  if(l && l.dataset.kind === want) return l;
  if(l){ const old = l; if(g && opts.anim !== false) g.to(old, {opacity:0, duration:.6, onComplete:()=> old.remove()}); else old.remove(); l = null; }
  if(!want) return null;
  l = document.createElement('i'); l.className = 'fxb-flayer fxb-persist is-' + want; l.dataset.kind = want; l.setAttribute('aria-hidden', 'true'); host.appendChild(l);
  if(g && opts.anim !== false) g.fromTo(l, {opacity:0}, {opacity:1, duration:1}); return l;
};
// A "?" field row is learned (fld-env-reveal, only a "New!" chip): the field card flips over with a leaf burst.
M.envReveal = function(tile, opts){
  opts = opts || {}; tile = tile || document.getElementById('fieldCondCard'); if(!tile || !tile.getBoundingClientRect) return Promise.resolve();
  const card = tile.classList.contains('env-stack') ? (tile.querySelector('.env-card') || tile) : tile; const r = card.getBoundingClientRect(); if(!r.width) return Promise.resolve();
  const q = over(r, '', '<i class="fxb-bit" style="inset:0; display:grid; place-items:center; border-radius:12px; background:linear-gradient(160deg,#5b4a78,#221a33); color:#ffd76a; font:900 34px/1 \'Baloo 2\', system-ui; backface-visibility:hidden;">?</i>');
  q.style.overflow = 'visible'; const qq = q.firstChild;
  const lv = bits(q, 10, ()=> ({cls:'fxb-bit', text:pick(['🍃', '🍂', '✦', '🍃']), style:'left:45%; top:45%; font-size:15px;'}));
  return run([q], opts, (t)=>{
    t.set(qq, {transformPerspective:500}).fromTo(qq, {rotationY:0, opacity:1}, {rotationY:90, duration:.25, ease:'power1.in'}, .15).set(qq, {opacity:0})
      .fromTo(card, {rotationY:-90, transformPerspective:500}, {rotationY:0, duration:.35, ease:'back.out(1.8)', clearProps:'transform'}, .4).call(()=> call(opts.onImpact), null, .45);
    lv.forEach((l, i)=>{ const a = i/10*Math.PI*2; t.fromTo(l, {x:0, y:0, opacity:1}, {x:Math.cos(a)*r.width*.9, y:Math.sin(a)*r.height*.8, rotation:rnd(-240, 240), opacity:0, duration:.65, ease:'power2.out'}, .45); });
  });
};
// The terrain's intro banner (fld-terrain-banner, a plain fade): a shine sweeps across it, its title pops and a few
// biome glyphs fly off. Plays on top of the game's own banner (given as el).
css('banner', `.fxb-shine{position:absolute; top:-20%; left:-40%; width:30%; height:140%; transform:skewX(-20deg); background:linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);}`);
M.terrainBanner = function(banner, opts){
  opts = opts || {}; if(!banner || !banner.getBoundingClientRect) return Promise.resolve(); const r = banner.getBoundingClientRect(); if(!r.width) return Promise.resolve();
  const box = over(r, '', '<i class="fxb-bit fxb-shine"></i>'); box.style.borderRadius = '16px'; box.style.overflow = 'hidden'; const sh = box.firstChild;
  const glyph = (opts.glyphs) || ({ash:['🔥', '✦'], forest:['🍃', '🍂'], water:['💧'], beach:['🐚', '💧'], cave:['✦', '·'], tundra:['❄'], alpine:['❄'], swamp:['🫧'], savanna:['🌾'], meadow:['🌼', '🍃']}[(String(banner.className).match(/biome-(\w+)/) || [])[1]] || ['✦']);
  const out = over(r, ''); out.style.overflow = 'visible'; const gl = bits(out, 10, ()=> ({cls:'fxb-bit', text:pick(glyph), style:`left:${rnd(5, 95)}%; top:50%; font-size:14px;`}));
  const title = banner.querySelector('b');
  return run([box, out], opts, (t)=>{
    t.fromTo(sh, {left:'-40%'}, {left:'120%', duration:.7, ease:'power1.inOut'}, .15);
    if(title) t.fromTo(title, {scale:.7}, {scale:1, duration:.4, ease:'back.out(3)', clearProps:'transform'}, .05);
    gl.forEach((g, i)=> t.fromTo(g, {opacity:0, y:0}, {opacity:1, y:-r.height*rnd(.6, 1.1), x:rnd(-30, 30), rotation:rnd(-180, 180), duration:.7, ease:'power2.out'}, .2 + i*.03).to(g, {opacity:0, duration:.2}, '>-.1'));
  });
};
// The mountain settles (fld-eruption-reset, a toast): the smoke plume above the board sinks and thins, ash motes settle
// and the last rumble fades.
css('settle', `.fxb-plume{position:absolute; left:50%; top:-10%; width:46%; height:60%; margin-left:-23%; border-radius:50%; background:radial-gradient(ellipse at 50% 70%, rgba(90,80,80,.8), rgba(60,50,50,.4) 45%, transparent 72%); filter:blur(6px);}
.fxb-ash{position:absolute; width:4px; height:4px; border-radius:50%; background:#b9b0a8;}`);
M.eruptionReset = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts); const bf = opts.host || document.getElementById('battlefieldEl');
  const pl = bits(box, 1, ()=> ({cls:'fxb-plume'}))[0]; const ash = bits(box, 16, ()=> ({cls:'fxb-ash', style:`left:${rnd(5, 95)}%; top:${rnd(-5, 20)}%;`}));
  const glow = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(0deg, rgba(255,90,20,.3), transparent 50%);'}))[0];
  return run([box], opts, (t)=>{
    t.fromTo(pl, {scale:1.2, opacity:1, y:0}, {scale:.5, opacity:0, y:-20, duration:1.5, ease:'power1.in'}).fromTo(glow, {opacity:1}, {opacity:0, duration:1.2}, 0);
    ash.forEach((a, i)=> t.fromTo(a, {y:0, opacity:0}, {y:r.height*rnd(.5, .9), x:rnd(-20, 20), opacity:.9, duration:1.3, ease:'sine.inOut'}, i*.04).to(a, {opacity:0, duration:.3}, '>-.2'));
    if(bf && bf.getBoundingClientRect) t.fromTo(bf, {x:0}, {x:2, duration:.05, repeat:5, yoyo:true, ease:'none', clearProps:'x'}, 0);
  });
};
// The tide-spout bursts in a column (fld-tide-spout, splash sound only): a water column shoots up the whole board at x
// (opts.x, a screen x; or opts.el's centre) with spray at both rows.
css('spout', `.fxb-col{position:absolute; bottom:0; width:56px; height:100%; margin-left:-28px; transform-origin:50% 100%; border-radius:28px 28px 6px 6px;
  background:linear-gradient(90deg, rgba(120,200,255,.35), rgba(220,245,255,.9) 45%, rgba(120,200,255,.5)); box-shadow:0 0 18px rgba(160,220,255,.7);}`);
M.tideSpout = function(host, opts){
  opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = skyBox(opts);
  const er = opts.el ? rectOf(opts.el) : null; const x = (opts.x != null ? opts.x : er ? er.left + er.width/2 : r.left + r.width/2) - r.left;
  const col = bits(box, 1, ()=> ({cls:'fxb-col', style:`left:${x}px;`}))[0]; const sp = bits(box, 24, ()=> ({cls:'fxb-spray', style:`left:${x}px; top:${rnd(10, 90)}%;`}));
  const rings = [.25, .75].map(fy=> bits(box, 1, ()=> ({cls:'fxb-splash', style:`left:${x - 30}px; top:${fy*100}%; width:60px; height:18px;`}))[0]);
  return run([box], opts, (t)=>{
    t.fromTo(col, {scaleY:0, opacity:1}, {scaleY:1, duration:.32, ease:'power3.out'}).call(()=> call(opts.onImpact)).to(col, {scaleY:0, opacity:.3, transformOrigin:'50% 0', duration:.4, ease:'power2.in'}, '+=.2');
    sp.forEach((s, i)=> t.fromTo(s, {x:0, opacity:0}, {x:rnd(-60, 60), y:rnd(-20, 20), opacity:1, duration:.3, ease:'power2.out'}, .15 + i*.01).to(s, {opacity:0, y:'+=20', duration:.3}, '>'));
    rings.forEach((g, i)=> t.fromTo(g, {scale:.2, opacity:1}, {scale:1.6, opacity:0, duration:.5}, .2 + i*.05));
  });
};
// Deep Mines: the enemy digs ore (fld-deep-mines, the generic float): a pickaxe strikes at their castle, sparks fly and
// stone and metal chunks pop out.
css('mine', `.fxb-pick{position:absolute; left:70%; top:10%; font:900 26px/1 system-ui; transform-origin:20% 80%;}
.fxb-ore{position:absolute; left:50%; top:60%; width:10px; height:9px; clip-path:polygon(20% 0,100% 20%,80% 100%,0 80%);}`);
M.deepMines = function(castle, opts){
  opts = opts || {}; const r = rectOf(castle); if(!r) return Promise.resolve();
  const box = over(r, ''); box.style.overflow = 'visible'; const pk = bits(box, 1, ()=> ({cls:'fxb-pick', text:'⛏️'}))[0];
  const ore = bits(box, 7, i=> ({cls:'fxb-ore', style:`background:${i%3 ? 'linear-gradient(135deg,#a9a29a,#5d5852)' : 'linear-gradient(135deg,#e8eef6,#7f8a99)'};`}));
  const sp = bits(box, 8, ()=> ({cls:'fxb-gspark', style:'left:60%; top:58%; height:8px;'}));
  return run([box], opts, (t)=>{
    t.fromTo(pk, {rotation:-50, opacity:0}, {rotation:-50, opacity:1, duration:.1}).to(pk, {rotation:20, duration:.14, ease:'power3.in'}).call(()=> call(opts.onImpact))
      .to(pk, {rotation:-40, duration:.2}, '>').to(pk, {rotation:20, duration:.14, ease:'power3.in'}).to(pk, {opacity:0, duration:.2}, '>+.1');
    [.24, .58].forEach(at=> sp.forEach((s, i)=>{ const a = -Math.PI*(.2 + i/8*.6); t.fromTo(s, {x:0, y:0, opacity:1, rotation:a*57 + 90}, {x:Math.cos(a)*30, y:Math.sin(a)*30, opacity:0, duration:.3}, at); }));
    ore.forEach((o, i)=> t.fromTo(o, {x:0, y:0, opacity:1}, {keyframes:[{x:rnd(-40, 40), y:-rnd(20, 40), duration:.25, ease:'power2.out'}, {y:rnd(10, 25), duration:.3, ease:'power2.in'}], rotation:rnd(-300, 300)}, .6 + i*.03).to(o, {opacity:0, duration:.2}, '>'));
  });
};
// The arena rule: +1 Lumber every N rounds (fld-lumber-every, pill bing + float): a log rolls out of the castle into
// the Lumber pill, shedding wood chips.
M.lumberEvery = function(from, opts){
  opts = opts || {}; const fr = rectOf(from); const to = opts.to && opts.to.getBoundingClientRect ? opts.to.getBoundingClientRect() : null; if(!fr) return Promise.resolve();
  const log = layer('fxb-log', '🪵'); log.style.cssText += 'font:900 26px/1 system-ui;'; const box = layer('fxb-chips'); const ch = [];
  const sx = fr.left + fr.width/2 - 13, sy = fr.top + fr.height*.3, tx = to && to.width ? to.left + to.width/2 - 13 : sx + 60, ty = to && to.width ? to.top + to.height/2 - 13 : sy - 60;
  return run([log, box], opts, (t)=>{
    t.fromTo(log, {x:sx, y:sy, rotation:0, scale:.4, opacity:0}, {scale:1.1, opacity:1, duration:.15}).to(log, {x:tx, y:ty, rotation:720, duration:.6, ease:'power1.inOut'}, '>')
      .call(()=>{ call(opts.onImpact); if(to && to.width) ringAt(to.left + to.width/2, to.top + to.height/2, {color:'#d9a35a', size:30, dur:400}); }).to(log, {scale:.4, opacity:0, duration:.15});
    for(let i = 0; i < 6; i++) t.call(()=>{ const s = document.createElement('i'); s.className = 'fxb-bit'; s.style.cssText = `width:5px; height:3px; background:#c88a44; left:${sx + 13 + (tx - sx)*i/6}px; top:${sy + 13 + (ty - sy)*i/6}px;`; box.appendChild(s); ch.push(s);
      const g = G(); if(g) g.to(s, {y:rnd(10, 26), x:rnd(-10, 10), rotation:rnd(-200, 200), opacity:0, duration:.5}); }, null, .2 + i*.08);
    t.to({}, {duration:.4});
  });
};
// The forecast pill changes (fld-forecast, static text): its chips slide in one by one and the weather icon wobbles.
M.forecastPop = function(pill, opts){
  opts = opts || {}; if(!pill || !pill.getBoundingClientRect || !pill.getBoundingClientRect().width) return Promise.resolve(); const g = G(); if(!g) return Promise.resolve();
  const kids = [...pill.querySelectorAll(':scope > span, :scope > small, :scope > i, :scope > b')].filter(k=> !k.classList.contains('tp-tip')); const r = pill.getBoundingClientRect();
  const box = over(r, '', '<i class="fxb-bit fxb-shine"></i>'); box.style.borderRadius = '999px'; box.style.overflow = 'hidden';
  return run([box], opts, (t)=>{ t.fromTo(box.firstChild, {left:'-40%'}, {left:'130%', duration:.6, ease:'power1.inOut'}, 0);
    if(kids.length) t.fromTo(kids, {y:-8, opacity:0}, {y:0, opacity:1, duration:.25, stagger:.07, ease:'back.out(2)', clearProps:'transform,opacity'}, 0).to(kids[0], {rotation:14, duration:.08, yoyo:true, repeat:3, clearProps:'transform'}, '>');
    else t.fromTo(pill, {scale:1}, {scale:1.15, duration:.15, yoyo:true, repeat:1, clearProps:'transform'}, 0); });
};
// The arena ruleset pill (fld-arena-ruleset): at the fight's start a shine sweeps it and a wax seal stamps beside it.
css('seal', `.fxb-seal{position:absolute; right:-14px; top:50%; width:26px; height:26px; margin-top:-13px; border-radius:50%; display:grid; place-items:center; font:900 13px/1 system-ui; color:#ffe6c4;
  background:radial-gradient(circle at 40% 35%, #e0503a, #8f1a10 70%); box-shadow:0 2px 5px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,170,140,.4);}`);
M.arenaSeal = function(pill, opts){
  opts = opts || {}; if(!pill || !pill.getBoundingClientRect) return Promise.resolve(); const r = pill.getBoundingClientRect(); if(!r.width) return Promise.resolve();
  const box = over(r, '', '<i class="fxb-bit fxb-shine"></i><i class="fxb-bit fxb-seal">⚜</i>'); box.style.overflow = 'visible'; const [sh, seal] = box.children;
  return run([box], opts, (t)=> t.fromTo(sh, {left:'-40%', opacity:1}, {left:'120%', duration:.6}).fromTo(seal, {scale:2.6, opacity:0, rotation:-30}, {scale:1, opacity:1, rotation:0, duration:.22, ease:'power3.in'}, .3)
    .call(()=> call(opts.onImpact)).to(seal, {scale:1.1, duration:.08, yoyo:true, repeat:1}).to(seal, {opacity:0, duration:.4}, '+=.8'));
};

// ---- planned field rules (lab only, 2026-10-15 concepts for the world roadmap) ----
css('future', `.fxb-flame2{position:absolute; top:0; width:70px; height:100%; margin-left:-35px; background:linear-gradient(90deg, transparent, rgba(255,120,30,.55) 30%, rgba(255,220,120,.85) 50%, rgba(255,120,30,.55) 70%, transparent); filter:blur(2px);}
.fxb-herd{position:absolute; font-size:30px; filter:brightness(0) opacity(.75);}
.fxb-dust{position:absolute; width:60px; height:30px; border-radius:50%; background:radial-gradient(ellipse, rgba(190,160,110,.7), transparent 70%); filter:blur(3px);}
.fxb-colfog{position:absolute; top:-5%; width:16%; height:110%; margin-left:-8%; background:linear-gradient(90deg, transparent, rgba(240,244,250,.85) 40%, rgba(240,244,250,.85) 60%, transparent); filter:blur(5px);}
.fxb-pollen{position:absolute; width:5px; height:5px; border-radius:50%; background:#ffe36a; box-shadow:0 0 6px #ffcf2a;}
.fxb-crackl{position:absolute; inset:0; width:100%; height:100%;} .fxb-crackl polyline{fill:none; stroke:rgba(235,248,255,.95); stroke-width:1.6; filter:drop-shadow(0 0 3px #9fd8ff);}
.fxb-dirtcr polyline{stroke:rgba(70,40,20,.9); filter:none; stroke-width:2;}
.fxb-ashflake{position:absolute; width:5px; height:5px; border-radius:50%; background:#9a9590;}
.fxb-press{position:absolute; inset:0; box-shadow:inset 0 0 60px 30px rgba(4,20,40,.85);}
.fxb-spiral{position:absolute; left:50%; top:50%; width:130%; aspect-ratio:1; margin:-65% 0 0 -65%; border-radius:50%;
  background:repeating-conic-gradient(from 0deg, rgba(220,230,240,.35) 0 14deg, transparent 14deg 40deg); -webkit-mask:radial-gradient(circle, transparent 8%, #000 30%, transparent 70%);}`);
function futureBox(opts){ const r = hostRect(opts); return {r, box:over(r, 'fxb-sky')}; }
M.monsoon = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const dim = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:rgba(60,70,90,.45)'}))[0]; const sh = bits(box, 2, i=> ({cls:'fxb-rainsheet', style:i ? 'transform:scale(1.4); opacity:.7' : ''}));
  const pud = bits(box, 6, ()=> ({cls:'fxb-splash', style:`left:${rnd(5, 85)}%; top:${rnd(55, 92)}%; width:${rnd(40, 70)}px; height:${rnd(10, 16)}px; background:rgba(150,190,230,.35);`}));
  return run([box], opts, (t)=>{ t.fromTo([dim, ...sh], {opacity:0}, {opacity:1, duration:.4}).fromTo(pud, {scale:0, opacity:0}, {scale:1, opacity:1, duration:.8, stagger:.12}, .4).to(box, {opacity:0, duration:.4}, 2.0); }); };
M.wildfire = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const f = bits(box, 1, ()=> ({cls:'fxb-flame2', style:'left:0;'}))[0]; const em = bits(box, 24, ()=> ({cls:'fxb-ember', style:`left:0; top:${rnd(5, 95)}%;`})); const char = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(90deg, rgba(40,20,10,.35), transparent); transform-origin:0 50%;'}))[0];
  return run([box], opts, (t)=>{ t.fromTo(f, {x:0}, {x:r.width, duration:1.8, ease:'none'}).fromTo(char, {scaleX:0}, {scaleX:1, duration:1.8, ease:'none'}, 0);
    em.forEach((e, i)=> t.fromTo(e, {x:r.width*i/24, opacity:0}, {opacity:1, y:-rnd(20, 50), duration:.5}, i*.075).to(e, {opacity:0, duration:.2}, '>')); t.to(box, {opacity:0, duration:.35}, 1.9); }); };
M.migration = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const herd = bits(box, 7, i=> ({cls:'fxb-herd', text:pick(['🦬', '🦌', '🐗', '🦬']), style:`left:-12%; top:${42 + (i%3)*5}%;`})); const dust = bits(box, 8, i=> ({cls:'fxb-dust', style:`left:-12%; top:${48 + (i%3)*4}%;`}));
  return run([box], opts, (t)=>{ herd.forEach((h, i)=> t.fromTo(h, {x:0, scaleX:-1}, {x:r.width*1.25, duration:2, ease:'none'}, i*.12).to(h, {y:-4, duration:.12, yoyo:true, repeat:15, ease:'sine.inOut'}, i*.12));
    dust.forEach((d, i)=> t.fromTo(d, {x:0, opacity:.8}, {x:r.width*1.2, opacity:0, scale:2, duration:2, ease:'none'}, .1 + i*.12)); }); };
M.fogBanks = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const cols = bits(box, 2, i=> ({cls:'fxb-colfog', style:`left:${i ? 66.6 : 33.3}%;`}));
  return run([box], opts, (t)=> t.fromTo(cols, {scaleY:0, opacity:0, transformOrigin:'50% 100%'}, {scaleY:1, opacity:1, duration:.8, stagger:.15, ease:'power2.out'}).to(cols, {x:6, duration:.6, yoyo:true, repeat:1, ease:'sine.inOut'}).to(box, {opacity:0, duration:.4}, 1.9)); };
M.pollen = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const tint = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:rgba(255,220,90,.14)'}))[0]; const p = bits(box, 30, ()=> ({cls:'fxb-pollen', style:`left:${rnd(0, 100)}%; top:${rnd(0, 100)}%;`}));
  return run([box], opts, (t)=>{ t.fromTo(tint, {opacity:0}, {opacity:1, duration:.5}); p.forEach((m, i)=> t.fromTo(m, {opacity:0, scale:.3}, {opacity:1, scale:1, x:rnd(20, 60), y:rnd(-30, 10), duration:1.4, ease:'sine.inOut'}, i*.02).to(m, {opacity:0, duration:.3}, '>-.2')); t.to(tint, {opacity:0, duration:.4}, 1.7); }); };
M.permafrost = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'fxb-bit fxb-crackl'); sv.setAttribute('viewBox', '0 0 100 100'); sv.setAttribute('preserveAspectRatio', 'none');
  sv.innerHTML = [zig(0, 50, 100, 46, 10, 4), zig(30, 0, 36, 100, 8, 3), zig(70, 0, 64, 100, 8, 3)].map(p=> `<polyline points="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join(''); box.appendChild(sv);
  const ice = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:rgba(200,235,255,.3); box-shadow:inset 0 0 40px rgba(235,250,255,.8);'}))[0]; const dr = bits(box, 10, ()=> ({cls:'fxb-drip', style:`left:${rnd(5, 95)}%; top:${rnd(30, 60)}%;`}));
  return run([box], opts, (t)=>{ t.fromTo(ice, {opacity:1}, {opacity:.3, duration:1.4}); sv.querySelectorAll('polyline').forEach((l, i)=> t.to(l, {strokeDashoffset:0, duration:.4}, .1 + i*.15));
    dr.forEach((d, i)=> t.fromTo(d, {opacity:0, y:0}, {opacity:1, y:30, duration:.5, ease:'power2.in'}, .7 + i*.06).to(d, {opacity:0, duration:.1}, '>')); t.to(box, {opacity:0, duration:.4}, 1.7); }); };
M.volcanicWinter = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const sky = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(180deg, rgba(120,50,20,.5), rgba(40,30,30,.55));'}))[0]; const fl = bits(box, 28, ()=> ({cls:'fxb-ashflake', style:`left:${rnd(0, 100)}%; top:-4%;`}));
  return run([box], opts, (t)=>{ t.fromTo(sky, {opacity:0}, {opacity:1, duration:.6}); fl.forEach((f, i)=> t.fromTo(f, {y:0, x:0}, {y:r.height*rnd(.8, 1.05), x:rnd(-30, 30), duration:rnd(1.4, 1.9), ease:'none'}, i*.02)); t.to(box, {opacity:0, duration:.4}, 1.9); }); };
M.floodplains = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const w = bits(box, 1, ()=> ({cls:'fxb-water', style:'height:60%;'}))[0]; const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'fxb-bit fxb-crackl fxb-dirtcr'); sv.setAttribute('viewBox', '0 0 100 100'); sv.setAttribute('preserveAspectRatio', 'none');
  sv.innerHTML = [zig(10, 60, 50, 90, 5, 4), zig(50, 90, 90, 55, 5, 4), zig(50, 90, 52, 60, 3, 3)].map(p=> `<polyline points="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join(''); box.appendChild(sv);
  const dry = bits(box, 1, ()=> ({cls:'fxb-fwash', style:'background:linear-gradient(0deg, rgba(190,140,80,.35), transparent 60%);'}))[0];
  return run([box], opts, (t)=>{ t.fromTo(w, {yPercent:100}, {yPercent:0, duration:.7, ease:'power2.out'}).to(w, {yPercent:100, duration:.6, ease:'power2.in'}, '+=.2').fromTo(dry, {opacity:0}, {opacity:1, duration:.4}, '>-.1');
    sv.querySelectorAll('polyline').forEach((l, i)=> t.to(l, {strokeDashoffset:0, duration:.35}, 1.6 + i*.08)); t.to(box, {opacity:0, duration:.35}, 2.2); }); };
M.abyssalPressure = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const pr = bits(box, 1, ()=> ({cls:'fxb-press'}))[0]; const cards = (opts.units || []).map(rectOf).filter(Boolean);
  const bub = []; cards.forEach(c=>{ for(let i = 0; i < 4; i++){ const b = document.createElement('i'); b.className = 'fxb-bit fxb-bub'; b.style.left = (c.left - r.left + rnd(10, c.width - 10)) + 'px'; b.style.top = (c.top - r.top + c.height*.4) + 'px'; box.appendChild(b); bub.push(b); } });
  return run([box], opts, (t)=>{ t.fromTo(pr, {opacity:0, scale:1.2}, {opacity:1, scale:1, duration:.5}).to(pr, {scale:.94, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut'});
    bub.forEach((b, i)=> t.fromTo(b, {opacity:0, y:0, scale:.5}, {opacity:1, y:-rnd(20, 40), scale:1, duration:.5}, .5 + i*.03).to(b, {opacity:0, duration:.15}, '>')); t.to(box, {opacity:0, duration:.4}, 1.8); }); };
M.hurricane = function(host, opts){ opts = Object.assign({}, opts, host && host.nodeType ? {host} : {}); const {r, box} = futureBox(opts);
  const sp = bits(box, 1, ()=> ({cls:'fxb-spiral'}))[0]; const deb = bits(box, 14, ()=> ({cls:'fxb-bit', text:pick(['🍃', '🍂', '🪶', '🌿']), style:'left:50%; top:50%; font-size:16px;'}));
  return run([box], opts, (t)=>{ t.fromTo(sp, {opacity:0, rotation:0, scale:.6}, {opacity:1, rotation:-540, scale:1.1, duration:2, ease:'power1.inOut'});
    deb.forEach((d, i)=>{ const o = {a:i/14*Math.PI*2, rr:10}; t.to(o, {a:o.a - Math.PI*4, rr:Math.max(r.width, r.height)*.6, duration:1.8, ease:'power1.in', onUpdate:()=> G().set(d, {x:Math.cos(o.a)*o.rr, y:Math.sin(o.a)*o.rr*.7, rotation:o.a*57})}, i*.02); });
    t.to(box, {opacity:0, duration:.35}, 1.85); }); };

/* ============================== GAME HOOKS ============================== */
// Per-match memory for the hooks (never game state): what we've shown, what is armed, what changed.
const memo = new WeakMap();
const mem = m=>{ if(!m || typeof m !== 'object') return {}; let o = memo.get(m); if(!o){ o = {exposed:new Set(), inspired:new Set(), spout:null}; memo.set(m, o); } return o; };
const rulesOf = m=>{ try{ return (typeof matchFieldRules === 'function' && matchFieldRules(m)) || {}; }catch(e){ return {}; } };
const darkLvl = m=>{ const d = rulesOf(m).dark; return !d ? null : (d === 'absolute' || d === 'pitch') ? d : 'dark'; };
const phaseOf = m=>{ try{ return m && m.engine && m.engine.getPhase ? m.engine.getPhase() : null; }catch(e){ return null; } };
const fieldOf = m=>{ try{ const f = m && m.engine && m.engine.getField ? m.engine.getField() : null; return f ? (f.id || f) : null; }catch(e){ return null; } };
const isMineSide = (m, side)=>{ try{ return side === (m && m.sideOf ? m.sideOf(1) : 'A'); }catch(e){ return side === 'A'; } };
const rcOf = (env, uid)=> (env.match && env.match.replayCards && env.match.replayCards[uid]) || {};
const castleOf = mine=> document.querySelector(mine ? '.bottom-play-row .match-castle-tile' : '.top-play-row .match-castle-tile');
const litSide = (mineSide, defs)=> [...document.querySelectorAll((mineSide ? '#rowMine' : '#rowEnemy') + ' .board-card[data-defid]')].some(c=> effOf(defs, c.dataset.defid).lantern || effOf(defs, c.dataset.defid).illuminate); // + Illuminate (2026-10-15)
function matchesKey(k, dmgType, ad){ return (dmgType && dmgType !== 'physical' && k === dmgType) || !!(ad && Array.isArray(ad.archetypes) && ad.archetypes.includes(k)) || !!(ad && ad.effects && ad.effects[k]); }

M.onEvent = function(ev, env){
  if(!env.fxAtLeast('low') || !ev) return;
  const m = env.match, mo = mem(m), defs = defsOf(env), bf = env.battlefield || document.getElementById('battlefieldEl'), med = env.fxAtLeast('med');
  const el = uid=> env.el(uid);
  switch(ev.type){
  case 'statusFx': {
    const t = el(ev.targetUid);
    if(ev.kind === 'poison' && t) M.poisonApply(t);
    else if(ev.kind === 'bleed' && t) M.bleedApply(t);
    else if(ev.kind === 'thaw' && t) M.thawDrip(t, {left:ev.left|0});
    // 2026-10-15 (Exposed rework: +1 from each of its next N hits): the engine says when a hit uses one up ('exposedHit', sent just
    // before that hit), so the crosshair snaps shut on every Exposed hit, not only the first.
    else if(ev.kind === 'exposedHit') mo.exposed.add(ev.targetUid);
    else if(ev.kind === 'inspired') mo.inspired.add(ev.targetUid);
    else if(ev.kind === 'firstBlood'){ const a = el(ev.attUid); if(a) M.firstBlood(a); }
    else if(ev.kind === 'blind') env.at(700, ()=> M.sightSync(m, env)); // 2026-10-15: the Blind badge shows at once, not at the next render
    break; }
  case 'decayTick': { const t = el(ev.uid); if(t) M.decayTick(t); break; }
  case 'cageBroken': { const t = el(ev.uid); if(t) M.cageBurst(t); break; }
  case 'irradiation': { const t = el(ev.uid); if(t) M.radDecay(t, {points:ev.points}); break; }
  case 'hit': {
    if(ev.friendly || ev.targetUid == null) break;
    const ad = defs[ev.attDefId] || {}, td = defs[ev.targetDefId] || {}, ae = ad.effects || {}, te = td.effects || {};
    const rcT = rcOf(env, ev.targetUid), rcA = rcOf(env, ev.attUid), at = env.hitAtMs(ev);
    const later2 = fn=> env.at(at, ()=>{ const t = el(ev.targetUid); if(t) fn(t); });
    // Inspired: spent on this swing, before it lands.
    if(mo.inspired.has(ev.attUid)){ mo.inspired.delete(ev.attUid); const a = el(ev.attUid); if(a) M.inspiredSpend(a); }
    // Darkness: the lantern and keen noses that kept this swing from missing.
    const dk = darkLvl(m);
    if(dk && ev.attUid != null && !ae.darksight && med){ const mine = isMineSide(m, ev.side);
      if(ae.keenSense && !te.flying){ if(env.once('fxb-keen' + ev.attUid)){ const a = el(ev.attUid); if(a) M.keenSense(a, {label:'👃 Smells it out'}); } }
      else if(dk !== 'absolute' && litSide(mine, defs) && env.once('fxb-lsave' + ev.attUid)){ const a = el(ev.attUid); if(a) M.lanternSave(a); } }
    // Hit modifiers the number alone doesn't explain.
    if(rcA.staggered > 0 && !ev.ranged) later2(t=> M.staggerWeakHit(t, {att:el(ev.attUid)}));
    if(rcT.shocked > 0 && ev.dmg > 0) later2(t=> M.shockSpark(t));
    if(mo.exposed.has(ev.targetUid)){ mo.exposed.delete(ev.targetUid); later2(t=> M.exposeCash(t, {crit:true})); } // 2026-10-16 (user: "that hit is guaranteed a crit")
    if(ev.dmg > 0 && ev.dmgType !== 'magic' && te.shade && (dk || phaseOf(m) === 'night')) later2(t=> M.shadeNight(t));
    if(ae.supreme && (Number(te.armor) > 0 || rcT.shellArmor > 0 || rcT.tempHp > 0 || rcT.petrified || Number(te.scare) > 0 || rcT.shield > 0)) later2(t=> M.wardCrush(t));
    { const rl = [...(td.resist || []), ...(te.resist || []), ...(te.dry ? ['heat'] : [])], wl = [...(te.weakness || []), ...(te.rabid ? ['swimmer', 'water'] : [])];
      const res = rl.some(k=> matchesKey(k, ev.dmgType, ad)), wk = wl.some(k=> matchesKey(k, ev.dmgType, ad));
      if(res !== wk && ev.dmg != null) later2(t=> M.resistHit(t, {kind:wk ? 'weak' : 'resist'})); }
    if(ae.decay && ev.dmg >= 0) later2(t=>{ const rc = rcOf(env, ev.targetUid); if(!(rc.hp <= 0)) M.decayApply(t); });
    if(ae.blind && te.keenSense && env.once('fxb-keenblind' + ev.targetUid)) later2(t=> M.keenSense(t, {ink:true}));
    break; }
  case 'evaded': if(ev.reason === 'shadow'){ const t = el(ev.targetUid); if(t) M.shadowNight(t); } break;
  case 'blindMiss': {
    const a = el(ev.attUid); if(!a || !ev.night) break; const dk = darkLvl(m), e = effOf(defs, ev.attDefId);
    // 2026-10-15 (user: "The miss animation is skipping the attack animation"): the whoosh follows the lunge (at the strike), not before it
    const wu = (typeof animMs === 'function' ? animMs().windup : 390);
    env.at(Math.max(120, wu - 40), ()=>{ const a2 = el(ev.attUid) || a; if(dk && !e.darksight) M.darkMiss(a2, {level:dk}); else M.darkMiss(a2, {level:'dark'}); });
    break; }
  case 'death': {
    const e = effOf(defs, ev.defId); if(e.lantern && (darkLvl(m) || phaseOf(m) === 'night')){ const t = el(ev.uid); if(t && med) M.lanternOut(t); }
    break; }
  case 'beware': if(med) M.beware(sideRow(ev.side), {darkness:ev.darkness, mine:isMineSide(m, ev.side)}); break;
  case 'devilry': { const t = ev.uid != null ? el(ev.uid) : document.getElementById('hudDevilryPill'); if(t) M.devilryStar(t); break; }
  case 'phase':
    if(m && typeof matchPhaseMatters === 'function' && !matchPhaseMatters(m)) break;
    if(med && ev.realtime) M.realtimePhase(bf, {phase:ev.phase});
    else if(med && ev.phase === 'day') M.dayBreaks(bf);
    else if(med && ev.phase === 'twilight') M.twilight(bf);
    env.at(60, ()=> M.sightSync(m, env));
    break;
  case 'dawn': if(med) M.dawnDraw(bf); break;
  case 'moon': if(med && m && (typeof matchHasMoonCards !== 'function' || matchHasMoonCards(m))) M.moonPhase(bf, {phase:ev.phase}); break;
  case 'tide':
    if(ev.moonpull){ const t = el(ev.uid); if(t && med) M.moonpull(t); }
    else if(ev.tide === 'ebb' && med) M.tideEbb(bf);
    else if(ev.tide === 'high' && med) M.tideHigh(bf);
    break;
  case 'wind': {
    if(!ev.windy){ if(med) M.windCalm(bf); break; }
    const from = isMineSide(m, ev.from) ? 'mine' : 'theirs';
    if(mo.windFrom && mo.windFrom !== from && med){ M.windSwap(bf); env.at(420, ()=> M.windGust(bf, {from})); } else if(med) M.windGust(bf, {from});
    mo.windFrom = from; break; }
  case 'triggerFired': {
    const w = m && m._windNow; if(!w || !w.windy || !effOf(defs, ev.defId).flying) break;
    const unitMine = isMineSide(m, ev.side); if(unitMine !== !!w.mine){ const t = el(ev.uid); if(t) M.headwindEcho(t); } // the side the wind blows INTO has the Headwind
    break; }
  case 'fieldSet': if(med) M.fieldSet(bf, {field:ev.field}); env.at(700, ()=> M.fieldLayer(document.getElementById('battlefieldEl'), ev.field)); break;
  case 'fieldEnd': {
    if(med) M.fieldEnd(bf, {field:ev.field}); M.fieldLayer(bf, null);
    if(ev.back) env.at(900, ()=>{ if(med) M.baseReturns(document.getElementById('fieldCondCard')); M.fieldLayer(document.getElementById('battlefieldEl'), ev.back); });
    break; }
  case 'fieldTick': {
    const t = ev.uid != null ? el(ev.uid) : null;
    if(ev.field === 'frozen'){
      if(ev.dmg && t) M.frigidWeak(t);
      const fr = rulesOf(m).frostResist; if(fr && fr.length && med && env.once('fxb-frostres')){
        [...document.querySelectorAll('#rowEnemy .board-card[data-defid]')].filter(c=> ((defs[c.dataset.defid] || {}).archetypes || []).some(a=> fr.includes(a))).slice(0, 3).forEach((c, i)=> env.at(250 + i*90, ()=> M.frostResist(c))); } }
    else if(ev.field === 'rain'){ if(med && env.once('fxb-rain')){ const us = [...document.querySelectorAll('#battlefieldEl .board-card[data-uid]')].slice(0, 12); M.rainTick(bf, {units:us}); } }
    else if(ev.field === 'irradiated' && t) M.irradiate(t, {src:ev.srcUid != null && !ev.self ? el(ev.srcUid) : null, tokens:ev.tokens});
    else if(ev.field === 'petrify' && t) M.petrify(t);
    else if(ev.field === 'eruptionReset' && med) M.eruptionReset(bf);
    else if(ev.field === 'tideSpout'){ mo.spout = {col:ev.col, at:Date.now()}; env.at(450, ()=>{ if(mo.spout && mo.spout.col === ev.col){ mo.spout = null; if(med) M.tideSpout(document.getElementById('battlefieldEl')); } }); }
    break; }
  case 'wash': if(ev.spout && mo.spout && mo.spout.col === ev.col){ mo.spout = null; const t = el(ev.targetUid); if(med) M.tideSpout(bf, {el:t}); } break;
  case 'lumber': if(ev.rule){ const c = castleOf(isMineSide(m, ev.side)); if(c) M.lumberEvery(c, {to:document.getElementById('hudLumberPill')}); } break;
  case 'roundStart': if((ev.round|0) >= 2 && rulesOf(m).enemyOre && med){ const c = castleOf(false); if(c) env.at(200, ()=> M.deepMines(c)); } break;
  }
};

// 2026-10-15: the miss float per darkness level (dark-*-miss: every level used to say "🌙 Miss!"). arena_app.js's blindMiss
// float asks for this text when the miss was a sight miss (ev.night); null keeps the old text.
// 2026-10-16 (user: "No need to say "Dark Miss" just say Miss! (on the opposing card, not on the attacking card)"): every sight miss
// (the dark at any level, Sun-shy, Night-blind) reads just "Miss!"; arena_app.js floats it on the unit that was swung at.
const MISS_TEXT = {dark:'Miss!', pitch:'Miss!', absolute:'Miss!'};
M.missText = function(ev, m){
  if(!ev || !ev.night) return null; return 'Miss!';
};

// Non-battle moments (one fxHook line each in arena_app.js).
// renderMatchUI → fxHook('matchUI', m): the darkness intro / exit, the perma-tide current, the lasting field layer, dusk,
// the arena ruleset seal and the forecast pill.
M.hooks.matchUI = function(m, env){
  if(!m || !env.fxAtLeast('low')) return; const mo = mem(m), bf = document.getElementById('battlefieldEl'); if(!bf) return; const med = env.fxAtLeast('med');
  const dk = darkLvl(m);
  if(dk && !m.over && !mo.darkIn){ mo.darkIn = dk; if(med){ const look = M.darkLook || 'A';
    // 2026-10-15: a beat after the board draws, so the lights go out on a board the player can see.
    later(()=>{ const b2 = document.getElementById('battlefieldEl'); if(b2 && b2.isConnected) (look === 'B' ? M.darkEnter_B : look === 'C' ? M.darkEnter_C : M.darkEnter)(b2, {level:dk}); }, 450); } }
  if(m.over && mo.darkIn && !mo.darkOut){ mo.darkOut = true; if(med) M.darkLeave(bf, {level:mo.darkIn}); }
  const r = rulesOf(m);
  M.permaTide(bf, {off:!r.permaTide || m.over, intro:!mo.current}); if(r.permaTide) mo.current = true;
  M.fieldLayer(bf, m.over ? null : fieldOf(m), {anim:false});
  // Dusk: the sky turns to dusk on the last round of the day (skyToneOf), with no event of its own.
  const sky = bf.querySelector(':scope > .sky-fx'), tone = sky ? (String(sky.className).match(/tone-(\w+)/) || [])[1] : null;
  if(tone === 'dusk' && mo.tone && mo.tone !== 'dusk' && med && phaseOf(m) !== 'twilight') M.dusk(bf); mo.tone = tone || mo.tone;
  if(m.arenaRuleset && !mo.seal && !m.over){ mo.seal = true; const p = document.querySelector('.arena-rs-pill'); if(p && med) later(()=> M.arenaSeal(p), 700); }
  M.hooks.boardRendered(m, env);
};
// renderBoard → fxHook('boardRendered', m): who can't see (and who can), and the forecast pill when it changes.
M.hooks.boardRendered = function(m, env){
  if(!m) return; try{ M.sightSync(m, env); }catch(e){}
  const mo = mem(m), fp = document.querySelector('#battlefieldEl .forecast-pill');
  const sig = fp ? fp.textContent.replace(/\s+/g, ' ').trim() : '';
  if(fp && mo.forecast != null && mo.forecast !== sig && env.fxAtLeast('med')) M.forecastPop(fp); if(fp) mo.forecast = sig;
};
// noteFieldEvent → fxHook('fieldReveal', tile): a "?" field row has just been learned.
M.hooks.fieldReveal = (tile, env)=>{ if(env.fxAtLeast('med')) M.envReveal(tile); };
// maybeTerrainIntro → fxHook('terrainBanner', banner)
M.hooks.terrainBanner = (banner, env)=>{ if(env.fxAtLeast('med')) later(()=> M.terrainBanner(banner), 80); };
// syncInitiativeCoin → fxHook('initCoin', coin, side) when the coin rolls to the other side
M.hooks.initCoin = (coin, side, env)=>{ if(env.fxAtLeast('med')) M.initCoin(coin); };
// mountMapShader → fxHook('mapRain', host, raining, mapId): rain starting or stopping since this map was last drawn.
const mapRainSeen = {};
M.hooks.mapRain = (host, rain, mapId, env)=>{ const was = mapRainSeen[mapId]; mapRainSeen[mapId] = !!rain;
  if(was == null || was === !!rain || !host || !env.fxAtLeast('med')) return; M.rainStartStop(host, {start:!!rain}); };

})(typeof window !== 'undefined' ? window : globalThis);
