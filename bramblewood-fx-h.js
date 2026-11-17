/* ============================================================
   Bramblewood FX, batch H (2026-11-16, package FX11): the crab's claw, the irradiated atmosphere, and the skills that still had
   only a word (Healing N, Worship, Gorge), plus the Meiosis split as a death look.
   Same contract as bramblewood-fx-a.js … -g.js (docs/effects-lab-contract.md): window.FX.H, pure visuals, GSAP timing, CSS through
   css() with the fxh- prefix, every node added is removed again. Lab demos: tools/effects-lab/manifest/h.js.
   Bundled by assemble_arena.py after fx-g, and by tools/effects-lab/build.py the same way.

     FX.H.crabScuttle(att, {dir, speed})              Crab Claws: the attacker side-steps toward the column it pinches
     FX.H.crabSnap(target, {from, castle, impactMs})   a drawn pincer snaps shut on the target (or into the bramble) with a clack
     FX.H.irrAtmos(total, {host, calm})                the whole screen turns sickly green as the board's Irradiation tokens add up
     FX.H.healingMend(healer, target)                  Healing N: a green cross over the healer, its mend hops to the patient
     FX.H.worshipHymn(el)                              Worship: a halo settles and notes rise when its side gains Prayer
     FX.H.gorgeGulp(host)                              Gorge: the parasite gulps twice, drops of blood are sucked into it
   2026-11-17 (package FX14): the bolts and arrows redrawn, and the resource skills (section 5)
     FX.H.boltShot(from, to, {element, spitfire, charge, flight})   a quick element spit: fire ember, ice shard, acid glob, poison drop
     FX.H.shockBolt(from, to)                          Shock Bolt: a crackling zig-zag that forks where it lands
     FX.H.arrowShot(shooter, target, {variant, draw, flight, miss, twin, plunge, archer})   a drawn, fletched arrow on an arc
     FX.H.volleyLoose(shooter)                         Volley: a fan of arrows lofted at once (each hit then plunges from above)
     FX.H.forestryLog / coinFlip / plunderCoins / anvilSpark / pearlGlint / oreChip   Forestry, Gold (Prospecting, Delivery, Barter),
                                                       Plunder, Masonry / Refining, Pearls, Quarrying / Mining
   2026-11-17 (package POWDER1): the powders (section 6)
     FX.H.powderPuff(from, to, {element, total, speed})   Sleeping / Poison Powder: the shooter shakes out a drift of spores that blooms on the target
   Cues (SoundKit, built from its tone / noise / sweep primitives, SoundKit.prim): crabClack, geigerSoft, mendChime, hymnBell, gorgeGulp;
   FX14: boltFire, boltIce, boltAcid, boltPoison, spitfire, arrowSlash, venomPuff, crystalPop, logTumble, coinFlip, anvilTink, pearlChime, pickChip;
   POWDER1: sporePuff.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.H = FX.H || {};
const TAG = 'h';

// ---- shared helpers (each batch has its own copy so no batch depends on another) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const centre = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const rnd = (a, b)=> a + Math.random()*(b - a);
const call = fn=>{ try{ fn && fn(); }catch(e){} };
const later = (fn, ms)=>{ const g = G(), run = ()=> call(fn); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };
const wait = ms=> new Promise(res=> later(res, ms));
function layer(cls, html, host){
  const e = document.createElement('div'); e.className = 'fx' + TAG + ' ' + (cls || ''); e.setAttribute('aria-hidden', 'true');
  if(html) e.innerHTML = html; if(host) e.style.position = 'absolute'; (host || document.body).appendChild(e);
  if(!host) try{ Object.defineProperty(e, 'offsetParent', {value: document.body, configurable: true}); }catch(err){} // a fixed overlay is always shown (PERF2)
  return e;
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
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const kill = (...els)=> els.forEach(e=>{ if(!e) return; const g = G(); if(g) g.killTweensOf(e); e.remove(); });
// A WAAPI nudge on the individual translate / rotate properties, so GSAP keeps the card's transform (its lunge, Flip).
const nudge = (el, kf, ms)=>{ try{ const a = el.animate(kf, {duration:ms, easing:'ease-out'}); a.onfinish = ()=>{ try{ a.cancel(); }catch(e){} }; return a; }catch(e){ return null; } };
const speedOf = o=> Math.max(.5, Math.min(3, (o && o.speed) || 1));

// ---- sounds (2026-11-16): each cue is a named SoundKit method built from SoundKit.prim (tone / noise / fnoise / sweep), so the
// volume sliders and stopAll() govern them like every other cue. Installed on SoundKit once it exists (it is defined after this file).
const SFX_LAST = {};
const CUES = {
  // two dry shell clicks, a woody knock under the first: not Clang (metal) nor Claw (a swipe)
  crabClack(P){ P.noise(0.018, 0.12); P.tone(2300, 0.02, 'square', 0.03); P.tone(520, 0.05, 'triangle', 0.09, 0.004); P.sweep(880, 320, 0.05, 'triangle', 0.045, 0.008);
    P.fnoise(0.018, 0.09, {type:'highpass', freq:3000, attack:0.001, delay:0.075}); P.tone(430, 0.04, 'triangle', 0.06, 0.078); },
  // a few quiet ticks as Irradiation tokens land (the old geiger burst was up to 15 clicks at twice the level)
  geigerSoft(P, n){ const now = Date.now(); if(now - (SFX_LAST.geiger || 0) < 320) return; SFX_LAST.geiger = now;
    let t = 0.4; const k = 3 + Math.min(4, n|0); for(let i = 0; i < k; i++){ t += 0.02 + Math.random()*Math.random()*0.08; P.fnoise(0.006, 0.05, {type:'highpass', freq:3200 + Math.random()*1600, q:0.7, attack:0.0008, delay:t}); } },
  mendChime(P){ P.tone(1046, 0.12, 'sine', 0.04); P.tone(1568, 0.16, 'sine', 0.03, 0.07); P.sweep(700, 1400, 0.18, 'triangle', 0.018, 0.02); },
  hymnBell(P){ [659, 831, 988].forEach((f, i)=> P.tone(f, 0.5, 'sine', 0.035, i*0.11)); P.tone(1976, 0.6, 'sine', 0.01, 0.33); },
  gorgeGulp(P){ [0, 0.2].forEach(d=>{ P.sweep(240, 85, 0.12, 'triangle', 0.08, d); P.fnoise(0.1, 0.035, {type:'lowpass', freq:520, freqEnd:180, attack:0.01, delay:d}); }); },
  // FX14 (2026-11-17): the bolts land with their element (the spit itself keeps SoundKit.launch), the arrow riders, the resource skills
  boltFire(P){ P.fnoise(0.16, 0.07, {type:'bandpass', freq:900, freqEnd:300, q:0.8, attack:0.004}); P.sweep(420, 150, 0.12, 'triangle', 0.05); },
  boltIce(P){ [2600, 3300, 2900, 3900].forEach((f, i)=> P.tone(f, 0.05, 'sine', 0.025, i*0.028)); P.fnoise(0.05, 0.05, {type:'highpass', freq:4200, attack:0.001}); },
  boltAcid(P){ P.fnoise(0.32, 0.045, {type:'highpass', freq:2600, freqEnd:5200, attack:0.01, crackle:0.04}); P.sweep(300, 120, 0.08, 'sine', 0.05); },
  boltPoison(P){ P.sweep(520, 180, 0.09, 'sine', 0.07); P.fnoise(0.22, 0.035, {type:'bandpass', freq:1400, freqEnd:700, q:1.2, attack:0.02, delay:0.05}); },
  spitfire(P){ P.fnoise(0.12, 0.06, {type:'bandpass', freq:1300, freqEnd:500, q:0.9, attack:0.003}); P.fnoise(0.08, 0.04, {type:'bandpass', freq:1100, freqEnd:400, q:0.9, attack:0.003, delay:0.06}); },
  arrowSlash(P){ P.fnoise(0.07, 0.07, {type:'highpass', freq:2200, freqEnd:5200, attack:0.002}); P.tone(180, 0.06, 'triangle', 0.05, 0.02); },
  venomPuff(P){ P.fnoise(0.2, 0.05, {type:'bandpass', freq:900, freqEnd:2200, q:0.8, attack:0.03}); P.tone(330, 0.07, 'sine', 0.03, 0.02); },
  crystalPop(P){ P.tone(1760, 0.07, 'sine', 0.04); P.tone(2637, 0.09, 'sine', 0.03, 0.03); P.fnoise(0.04, 0.04, {type:'highpass', freq:5000, attack:0.001, delay:0.02}); },
  logTumble(P){ [0, 0.11, 0.19].forEach((d, i)=> P.tone(300 - i*40, 0.05, 'triangle', 0.07 - i*0.015, d)); P.fnoise(0.04, 0.04, {type:'lowpass', freq:900, attack:0.002, delay:0.11}); },
  coinFlip(P){ P.tone(2093, 0.12, 'square', 0.012); P.tone(2637, 0.16, 'sine', 0.035, 0.05); P.tone(3136, 0.2, 'sine', 0.025, 0.13); },
  anvilTink(P){ [0, 0.18].forEach(d=>{ P.tone(1320, 0.18, 'triangle', 0.045, d); P.tone(2470, 0.12, 'sine', 0.025, d); P.fnoise(0.02, 0.06, {type:'highpass', freq:3000, attack:0.001, delay:d}); }); },
  pearlChime(P){ P.tone(1568, 0.25, 'sine', 0.03); P.tone(2349, 0.3, 'sine', 0.02, 0.08); P.sweep(3000, 4200, 0.12, 'sine', 0.008, 0.1); },
  // POWDER1 (2026-11-17): a soft breathy poof as the spores bloom, a drowsy falling chime (Sleeping) or a low bubble (Poison) under it
  sporePuff(P, el){ P.fnoise(0.26, 0.05, {type:'lowpass', freq:1400, freqEnd:380, attack:0.035}); P.fnoise(0.14, 0.025, {type:'bandpass', freq:2600, freqEnd:1500, q:0.7, attack:0.02, delay:0.05});
    if(el === 'poison') P.sweep(260, 150, 0.14, 'sine', 0.05, 0.04); else { P.tone(784, 0.18, 'sine', 0.025, 0.05); P.tone(587, 0.24, 'sine', 0.02, 0.16); } },
  pickChip(P){ P.tone(1900, 0.03, 'square', 0.015); P.fnoise(0.03, 0.07, {type:'bandpass', freq:2500, q:2, attack:0.001}); P.tone(640, 0.05, 'triangle', 0.05, 0.02); },
};
M.CUES = Object.keys(CUES);
function soundKit(){
  const S = (typeof SoundKit !== 'undefined') ? SoundKit : null; if(!S || !S.prim) return null;
  if(!S.__fxh){ Object.keys(CUES).forEach(k=>{ if(typeof S[k] !== 'function') S[k] = (...a)=>{ try{ CUES[k](S.prim, ...a); }catch(e){} }; }); S.__fxh = true; }
  return S;
}
const snd = (name, ...a)=>{ const S = soundKit(); if(S && typeof S[name] === 'function') S[name](...a); };
M.sound = snd;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soundKit); else later(soundKit, 0);

// =====================================================================================================================
// 1. CRAB CLAWS (2026-11-16, owner: "crab claw doesn't look very nice"). Replaces the "🦞 ←/→" float with the .crab-pinch slide,
//    FX.A.crabPinch and the Ironclaw's en2CrabClawHit claw. The side the claw takes is shown by the scuttle, not by an arrow.
// =====================================================================================================================
css('crab', `.fxh-claw{width:110px; height:70px; transform-origin:10.9% 51.4%; will-change:transform, opacity;}
.fxh-claw svg{display:block; width:100%; height:100%; overflow:visible;}
.fxh-spark{width:3px; height:12px; margin:-6px 0 0 -1.5px; border-radius:2px; background:linear-gradient(#fff, #ffe48a); transform-origin:50% 100%;}
.fxh-star{width:24px; height:24px; margin:-12px; display:grid; place-items:center; font:900 22px/1 system-ui; color:#fff6c8; text-shadow:0 0 6px #ffcf4a, 0 0 2px #a8561a;}
.fxh-dust{width:12px; height:8px; margin:-4px -6px; border-radius:50%; background:radial-gradient(circle, rgba(222,200,160,.9), rgba(222,200,160,0) 70%);}
.fxh-leaf{width:9px; height:5px; margin:-2.5px -4.5px; border-radius:50% 0; background:#6fae3a; box-shadow:inset -1px -1px 0 #3d6e1c;}
.fxh-twig{width:12px; height:3px; margin:-1.5px -6px; border-radius:2px; background:#7a5230;}`);
// A cartoon crab claw pointing right: the arm, a round palm with the fixed (lower) finger and its teeth, the movable finger (.dac)
// hinged at (66, 31). Closed, the two tips meet at (105, 42); the wrist (10, 36) is the transform origin.
const CLAW_SVG = `<svg viewBox="0 0 110 70"><defs><linearGradient id="fxhShell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa06a"/><stop offset=".5" stop-color="#e8552c"/><stop offset="1" stop-color="#ad3018"/></linearGradient></defs>
<g stroke="#5e170c" stroke-width="3" stroke-linejoin="round" fill="url(#fxhShell)">
<path d="M-28 30 L8 28 L9 45 L-28 43 Z"/><path d="M-6 28.6 L-4 44.2" fill="none" stroke-width="2"/>
<g class="dac"><path d="M64 33 C62 20 74 12 90 15 C100 17 107 26 105 40 C101 34 95 31 89 31 L86 27 L82 31 L78 28 C74 30 70 33 64 33 Z"/>
<path d="M75 18 C82 15 91 16 97 21" fill="none" stroke="rgba(255,238,214,.85)" stroke-width="2.6" stroke-linecap="round"/></g>
<path d="M10 36 C10 17 28 9 48 11 C60 12 68 17 71 27 L72 36 L80 37 L84 34 L88 38 L94 38 C100 39 104 41 106 45 C100 53 86 57 72 55 C56 61 30 61 18 53 C13 49 10 43 10 36 Z"/>
<circle cx="10" cy="36" r="9"/></g>
<path d="M22 22 C30 14 42 12 53 15" fill="none" stroke="rgba(255,238,214,.85)" stroke-width="3" stroke-linecap="round"/>
<circle cx="38" cy="31" r="2.6" fill="#a42c16"/><circle cx="48" cy="39" r="2" fill="#a42c16"/><circle cx="29" cy="43" r="1.7" fill="#a42c16"/><circle cx="8" cy="33" r="2.6" fill="rgba(255,238,214,.7)"/></svg>`;
const CRAB = new Map(); // attacker uid -> {dir, t}: a crabClaw event waiting for its blow

// The attacker side-steps toward its target: three quick shuffles on the individual translate / rotate properties, a puff of sand at
// each step. dir: -1 left, +1 right on screen, 0 a rear-up toward the castle.
M.crabScuttle = function(att, o){
  o = o || {}; const t = tileOf(att); if(!t) return Promise.resolve();
  const sp = speedOf(o), d = o.dir || 0, ms = Math.round(440/sp);
  if(d) nudge(t, [{translate:'0 0', rotate:'0deg'}, {translate:`${d*6}px -3px`, rotate:`${d*4}deg`, offset:.2}, {translate:`${d*3}px 0`, rotate:'0deg', offset:.38},
    {translate:`${d*11}px -3px`, rotate:`${d*4}deg`, offset:.58}, {translate:`${d*8}px 0`, rotate:`${d*-1}deg`, offset:.78}, {translate:'0 0', rotate:'0deg'}], ms);
  else nudge(t, [{translate:'0 0', rotate:'0deg'}, {translate:'0 -6px', rotate:'-3deg', offset:.3}, {translate:'0 -6px', rotate:'3deg', offset:.6}, {translate:'0 0', rotate:'0deg'}], ms);
  const g = G(); if(!g) return wait(ms);
  const c = centre(t), puffs = [];
  [0, .38, .78].forEach((at, i)=>{ const p = layer('fxh-dust'); puffs.push(p); const x = c.x + (i % 2 ? .3 : -.3)*c.w + d*c.w*.08*i;
    g.set(p, {x, y:c.r.bottom - 4, opacity:0, scale:.5});
    g.to(p, {opacity:.9, scale:1.4, x:x - d*14, y:c.r.bottom - 10, duration:.12/sp, delay:at*ms/1000, ease:'power2.out'});
    g.to(p, {opacity:0, scale:1.9, duration:.22/sp, delay:at*ms/1000 + .12/sp, onComplete:()=> kill(p)}); });
  return wait(ms + 360/sp);
};
// The pincer: it opens beside the target (from the attacker's side), slides in, snaps shut as the blow lands (the clack, a spark, the
// target knocked back), opens a little and backs away. o.from: the attacker (for the angle); o.castle: reaching into the bramble
// (leaves and twigs fly); o.miss: it closes on air (a dodge); o.impactMs: when the blow lands, from now. Plays in about 0.7 s.
M.crabSnap = function(target, o){
  o = o || {}; const g = G(); if(!g || !target) return Promise.resolve();
  const sp = speedOf(o), lead = 250, at = Math.max(0, (o.impactMs == null ? lead : o.impactMs) - lead/sp);
  return new Promise(res=> later(()=>{ if(!target.isConnected){ res(); return; }
    const tt = o.castle ? target : tileOf(target), b = centre(tt), a = o.from && o.from.isConnected ? centre(tileOf(o.from)) : {x:b.x - b.w, y:b.y};
    let ang = Math.atan2(b.y - a.y, b.x - a.x); if(Math.abs(b.y - a.y) < 4 && Math.abs(b.x - a.x) < 4) ang = 0;
    const deg = ang*180/Math.PI, flipY = Math.abs(deg) > 90 ? -1 : 1, ux = Math.cos(ang), uy = Math.sin(ang);
    const s = Math.max(56, Math.min(150, (o.castle ? Math.min(b.w, b.h)*.95 : b.w*1.05))), k = s/110;
    // the tips (105, 42) meet just inside the target's near edge; the wrist (10, 36) is the transform origin
    const reach = Math.min(b.w, b.h)*(o.castle ? .16 : .2), tipX = b.x - ux*reach, tipY = b.y - uy*reach, lx = 95*k, ly = 6*k*flipY;
    const wx = tipX - (lx*ux - ly*uy), wy = tipY - (lx*uy + ly*ux), X0 = wx - 10, Y0 = wy - 36;
    const cl = layer('fxh-claw', CLAW_SVG), dac = cl.querySelector('.dac');
    g.set(cl, {x:X0 - ux*30*k, y:Y0 - uy*30*k, scaleX:k*.7, scaleY:k*.7*flipY, rotation:deg, opacity:0}); g.set(dac, {svgOrigin:'66 31', rotation:-38});
    const tl = g.timeline({onComplete:()=>{ kill(cl); res(); }}).timeScale(sp);
    tl.to(cl, {opacity:1, scaleX:k, scaleY:k*flipY, duration:.1, ease:'back.out(2)'})
      .to(cl, {x:X0, y:Y0, duration:.14, ease:'power2.out'}, .04)
      .to(dac, {rotation:3, duration:.06, ease:'power4.in'}, .19)
      .add(()=>{ snd('crabClack'); clackSpark(tipX, tipY, ang);
        if(o.castle) brambleBits(tipX, tipY, ang);
        if(!o.miss) nudge(tt, [{translate:'0 0', rotate:'0deg'}, {translate:`${ux*10}px ${uy*10}px`, rotate:`${(ux >= 0 ? 1 : -1)*3}deg`, offset:.3}, {translate:`${-ux*3}px ${-uy*3}px`, rotate:'0deg', offset:.7}, {translate:'0 0', rotate:'0deg'}], Math.round(300/sp)); }, .25)
      .to(dac, {rotation:0, duration:.05}, .25)
      .to(cl, {scaleY:k*.9*flipY, scaleX:k*1.04, duration:.05, yoyo:true, repeat:1}, .25)
      .to(dac, {rotation:-16, duration:.08}, .42)
      .to(cl, {x:X0 - ux*24*k, y:Y0 - uy*24*k, opacity:0, scaleX:k*.85, scaleY:k*.85*flipY, duration:.2, ease:'power1.in'}, .46);
  }, at));
};
function clackSpark(x, y, ang){
  const g = G(); if(!g) return; const st = layer('fxh-star', '✦');
  g.set(st, {x, y, scale:.3, opacity:1, rotation:rnd(-30, 30)});
  g.to(st, {scale:1.25, duration:.1, ease:'back.out(3)'}); g.to(st, {opacity:0, scale:.6, duration:.18, delay:.12, onComplete:()=> kill(st)});
  for(let i = 0; i < 6; i++){ const p = layer('fxh-spark'), a = ang*180/Math.PI + 90 + (i - 2.5)*34;
    g.set(p, {x, y, rotation:a, scaleY:.3, opacity:1});
    g.to(p, {x:x + Math.cos((a - 90)*Math.PI/180)*18, y:y + Math.sin((a - 90)*Math.PI/180)*18, scaleY:1, duration:.1, ease:'power2.out'});
    g.to(p, {opacity:0, scaleY:.2, duration:.12, delay:.1, onComplete:()=> kill(p)}); }
}
function brambleBits(x, y, ang){
  const g = G(); if(!g) return;
  for(let i = 0; i < 8; i++){ const p = layer(i < 5 ? 'fxh-leaf' : 'fxh-twig'), a = ang + Math.PI + rnd(-1.1, 1.1), d = rnd(18, 42);
    g.set(p, {x, y, rotation:rnd(0, 360), opacity:1});
    g.to(p, {x:x + Math.cos(a)*d, y:y + Math.sin(a)*d - rnd(4, 14), rotation:'+=' + rnd(-200, 200), duration:.35, ease:'power2.out'});
    g.to(p, {y:'+=' + rnd(10, 22), opacity:0, duration:.3, delay:.3, ease:'power1.in', onComplete:()=> kill(p)}); }
}

// =====================================================================================================================
// 2. IRRADIATION ATMOSPHERE (2026-11-16, owner: "irradiation (whole screen looks abit irradiated) as irradiation increases").
//    One fixed, pointer-events:none layer inside #view-play: a sickly green-yellow vignette, faint scanlines and grain (CSS gradients
//    only), a slow uneven flicker. Its opacity steps up with the board's Irradiation tokens (capped so the board stays readable) and
//    fades when they drop. No filter, no blend mode; the flicker animates opacity and the grain transform (compositor only); both stop
//    below Effects Medium and under reduced motion. Hidden whenever the battle is not on screen (#appWrap without .in-match).
// =====================================================================================================================
css('atmos', `.fxh.fxh-atmos{inset:0; width:auto; height:auto; z-index:45; overflow:hidden; opacity:0; transition:opacity .9s ease; contain:strict;}
.fxh-atmos.is-abs{position:absolute;}
#appWrap:not(.in-match) .fxh-atmos:not(.is-abs){display:none;}
.fxh-atmos[data-step="1"]{opacity:.2;} .fxh-atmos[data-step="2"]{opacity:.28;} .fxh-atmos[data-step="3"]{opacity:.36;} .fxh-atmos[data-step="4"]{opacity:.44;} .fxh-atmos[data-step="5"]{opacity:.52;} /* 2026-11-16 (coordinator): softer, "abit irradiated"; the hand washed out at .62 */
.fxh-atmos > i{position:absolute; inset:0;}
.fxh-atmos > .v{background:radial-gradient(ellipse 78% 72% at 50% 48%, rgba(200,255,90,0) 34%, rgba(170,230,50,.22) 58%, rgba(120,200,30,.55) 82%, rgba(70,140,10,.82) 100%); will-change:opacity; animation:fxhFlicker 5.3s steps(1) infinite;}
.fxh-atmos > .s{background:repeating-linear-gradient(0deg, rgba(200,255,110,.07) 0 1px, transparent 1px 3px); opacity:.7;}
.fxh-atmos > .g{inset:-40px; background:radial-gradient(rgba(230,255,150,.13) 1px, transparent 1.5px) 0 0/7px 7px, radial-gradient(rgba(230,255,150,.09) 1px, transparent 1.5px) 3px 4px/11px 11px;
  will-change:transform; animation:fxhGrain .8s steps(4) infinite;}
.fxh-atmos.is-calm > i{animation:none !important;}
@keyframes fxhFlicker{0%{opacity:1;} 7%{opacity:.8;} 8%{opacity:1;} 31%{opacity:.92;} 33%{opacity:1;} 52%{opacity:.76;} 53%{opacity:.95;} 55%{opacity:1;} 78%{opacity:.88;} 80%{opacity:1;}}
@keyframes fxhGrain{0%{transform:translate(0,0);} 25%{transform:translate(-9px,5px);} 50%{transform:translate(6px,-7px);} 75%{transform:translate(-4px,-3px);} 100%{transform:translate(0,0);}}
@media (prefers-reduced-motion: reduce){ .fxh-atmos > i{animation:none !important;} }`);
// tokens on the board -> step 0-5
const IRR_STEPS = [1, 3, 6, 10, 15];
M.irrStep = total=>{ total = Math.max(0, total|0); let s = 0; IRR_STEPS.forEach((min, i)=>{ if(total >= min) s = i + 1; }); return s; };
let ATM = null;
// Show the tint for `total` tokens (0 fades it out and removes it). o.host: draw inside this box instead (the Lab); o.calm: no flicker.
M.irrAtmos = function(total, o){
  o = o || {}; const step = M.irrStep(total);
  if(!step){ if(ATM){ const el = ATM.el; ATM.step = 0; el.dataset.step = '0'; if(o.instant) { el.remove(); ATM = null; } else setTimeout(()=>{ if(ATM && ATM.el === el && !ATM.step){ el.remove(); ATM = null; } }, 1000); } return 0; }
  const host = o.host || document.getElementById('view-play') || document.body;
  if(!ATM || !ATM.el.isConnected || ATM.el.parentNode !== host){ const was = ATM && ATM.el.isConnected === false ? ATM.step : 0; if(ATM) ATM.el.remove();
    const el = document.createElement('div'); el.className = 'fx' + TAG + ' fxh-atmos' + (o.host ? ' is-abs' : ''); el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i class="v"></i><i class="s"></i><i class="g"></i>';
    // a re-render that took the layer away (the battle view redrawn) puts it straight back at its step, without fading in again
    if(was) el.style.transition = 'none'; el.dataset.step = String(was || 0); host.appendChild(el); void el.offsetWidth; el.style.transition = ''; ATM = {el, step:was || 0}; }
  ATM.el.classList.toggle('is-calm', !!o.calm || RM()); ATM.step = step; ATM.el.dataset.step = String(step); ATM.el.dataset.tokens = String(total|0);
  return step;
};
M.irrAtmosEl = ()=> (ATM && ATM.el.isConnected ? ATM.el : null);
// The board's tokens, as its ☢️N badges show them (they follow the replay, event by event). Outside a live fight: none.
M.irrTotal = function(m){
  const bf = document.getElementById('battlefieldEl'), wrap = document.getElementById('appWrap');
  if(!m || m.over || !bf || !bf.isConnected || (wrap && !wrap.classList.contains('in-match'))) return 0;
  let t = 0; bf.querySelectorAll('.board-card .abadge.irradiation').forEach(b=>{ const n = parseInt(String(b.textContent).replace(/\D+/g, ''), 10); t += n > 0 ? n : 1; }); // a count of 1 shows as a bare ☢️ (ui14ChipCount)
  return t;
};
M.irrSync = function(m, env){ return M.irrAtmos(M.irrTotal(m), {calm: !(env && env.fxAtLeast && env.fxAtLeast('med'))}); };
let irrQ = false;
function irrQueue(env){
  if(irrQ) return; irrQ = true;
  const run = ()=>{ irrQ = false; let m = null; try{ m = typeof matchState !== 'undefined' ? matchState : env.match; }catch(e){ m = env && env.match; } call(()=> M.irrSync(m, env)); };
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(run); else setTimeout(run, 16);
}
M.hooks.boardRendered = (m, env)=> irrQueue(env);
M.hooks.matchUI = (m, env)=> irrQueue(env);
M.hooks.cardStatusShown = (el, c, env)=> irrQueue(env);
M.hooks.resultsShown = ()=> M.irrAtmos(0);
M.hooks.mapShown = ()=> M.irrAtmos(0, {instant:true});

// =====================================================================================================================
// 3. SKILLS THAT HAD ONLY A WORD (2026-11-16). Checked against the engine and every pass in renderVfxForEvent: Swift, Stampede,
//    Remember, Ambush, Siege, Reload, Molting, Explode, Rupture, Momentum, Lightning and Bulwark already draw (FX.A, FX6, FX9); these
//    three did not.
// =====================================================================================================================
css('skills', `.fxh-cross{width:26px; height:26px; margin:-13px;}
.fxh-cross::before, .fxh-cross::after{content:''; position:absolute; left:50%; top:50%; border-radius:4px; background:#f4fff0; box-shadow:0 0 0 2.5px #3fbf4f, 0 0 10px 2px rgba(90,230,110,.7);}
.fxh-cross::before{width:8px; height:24px; margin:-12px 0 0 -4px;} .fxh-cross::after{width:24px; height:8px; margin:-4px 0 0 -12px;}
.fxh-ring{border-radius:50%; border:3px solid rgba(120,240,130,.85); box-shadow:0 0 10px rgba(90,230,110,.6);}
.fxh-orb{width:16px; height:16px; margin:-8px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #ffffff, #b6ffb0 40%, #3fbf4f 75%, rgba(63,191,79,0)); }
.fxh-plus{margin:-6px; font:900 12px/1 system-ui; color:#8dff8a; text-shadow:0 0 4px #1d7a2a;}
.fxh-halo{height:12px; margin:-6px 0 0; border-radius:50%; border:3px solid #ffd76a; box-shadow:0 0 10px 2px rgba(255,210,90,.75), inset 0 0 6px rgba(255,230,150,.8);}
.fxh-wash{border-radius:12px; background:radial-gradient(ellipse at 50% 20%, rgba(255,230,140,.55), rgba(255,210,90,0) 70%);}
.fxh-note{margin:-11px; font:900 22px/1 'Baloo 2', system-ui, sans-serif; color:#ffe27a; text-shadow:0 1px 0 #5a3a00, 0 -1px 0 #5a3a00, 1px 0 0 #5a3a00, -1px 0 0 #5a3a00, 0 0 8px #ffbf2a;}
.fxh-drop{width:9px; height:12px; margin:-6px -4.5px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 35% 30%, #ff8d8d, #c01a2a 60%, #6a0010); }
.fxh-rim{border-radius:12px; box-shadow:inset 0 0 0 2px rgba(190,20,40,.9), inset 0 0 18px rgba(150,0,20,.6);}`);
// a fixed box over an element's tile
function overBox(el, cls){ const r = tileOf(el).getBoundingClientRect(), b = layer(cls); G().set(b, {x:r.left, y:r.top, width:r.width, height:r.height}); return b; }

// Healing N (8 cards; the patient already gets its ➕ and SkillFX.heal): a green cross pops over the healer with a ring of light; healing
// another unit, a green orb hops over to it trailing pluses; healing itself, the cross sinks into its own card.
M.healingMend = function(healer, target, o){
  const g = G(); if(!g || !healer) return Promise.resolve(); o = o || {};
  const a = centre(tileOf(healer)), sp = speedOf(o), cr = layer('fxh-cross'), ring = layer('fxh-ring'), bits = [cr, ring];
  g.set(cr, {x:a.x, y:a.r.top - 6, scale:.3, opacity:0}); g.set(ring, {x:a.x - a.w*.3, y:a.y - a.w*.3, width:a.w*.6, height:a.w*.6, scale:.4, opacity:.9});
  snd('mendChime');
  const tl = g.timeline({onComplete:()=> kill(...bits)}).timeScale(sp);
  tl.to(cr, {opacity:1, scale:1.25, y:a.r.top - 20, duration:.14, ease:'back.out(2.5)'}).to(cr, {scale:1, duration:.08})
    .to(ring, {scale:1.5, opacity:0, duration:.4, ease:'power2.out'}, 0);
  if(target && target !== healer && target.isConnected){
    const b = centre(tileOf(target)), orb = layer('fxh-orb'), mid = {x:(a.x + b.x)/2, y:Math.min(a.r.top, b.r.top) - 36}; bits.push(orb);
    g.set(orb, {x:a.x, y:a.r.top - 20, opacity:0, scale:.6});
    tl.to(orb, {opacity:1, scale:1, duration:.05}, .1).to(cr, {opacity:0, scale:.6, duration:.12}, .3)
      .to(orb, {keyframes:[{x:mid.x, y:mid.y, duration:.12, ease:'power1.out'}, {x:b.x, y:b.y, duration:.12, ease:'power2.in'}]}, .12)
      .to(orb, {scale:2.2, opacity:0, duration:.16}, '>');
    for(let i = 0; i < 3; i++){ const p = layer('fxh-plus', '+'); bits.push(p); g.set(p, {opacity:0});
      tl.call(()=>{ const r = orb.getBoundingClientRect(); g.set(p, {x:r.left + r.width/2, y:r.top + r.height/2, opacity:1}); }, null, .15 + i*.06)
        .to(p, {y:'+=' + 16, opacity:0, duration:.3}, .16 + i*.06); }
  } else tl.to(cr, {y:a.y, scale:.6, opacity:0, duration:.24, ease:'power2.in'}, .3).to(ring, {opacity:0}, '<');
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ kill(...bits); res(); }));
};
// Worship (2 cards: +1 Attack per 3 Prayer): its side gains Prayer, and a golden halo settles over it, a warm wash, three notes rise.
M.worshipHymn = function(el, o){
  const g = G(); if(!g || !el) return Promise.resolve(); o = o || {};
  const c = centre(tileOf(el)), sp = speedOf(o), halo = layer('fxh-halo'), wash = overBox(el, 'fxh-wash'), notes = ['♪', '♫', '♪'].map(n=> layer('fxh-note', n)), bits = [halo, wash, ...notes];
  g.set(halo, {x:c.x - c.w*.3, y:c.r.top - 34, width:c.w*.6, opacity:0, scale:.5}); g.set(wash, {opacity:0});
  snd('hymnBell');
  const tl = g.timeline().timeScale(sp);
  tl.to(halo, {opacity:1, scale:1, y:c.r.top + 2, duration:.28, ease:'back.out(1.8)'}).to(wash, {opacity:1, duration:.2}, .12)
    .to(halo, {y:c.r.top - 2, duration:.25, yoyo:true, repeat:1, ease:'sine.inOut'}, '>');
  notes.forEach((n, i)=>{ const x0 = c.x + (i - 1)*c.w*.26; g.set(n, {x:x0, y:c.r.top + 8, opacity:0, scale:.5});
    tl.to(n, {opacity:1, scale:1, duration:.12}, .22 + i*.12).to(n, {y:c.r.top - 40 - i*6, x:x0 + (i % 2 ? 10 : -10), rotation:i % 2 ? 14 : -14, duration:.55, ease:'sine.out'}, .22 + i*.12)
      .to(n, {opacity:0, duration:.2}, .6 + i*.12); });
  tl.to([halo, wash], {opacity:0, duration:.25}, .78);
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ kill(...bits); res(); }));
};
// Gorge (the Gangrenous Leech's second feed at round end): a dark red rim on its host, drops of blood drawn into the parasite (its pip
// on the card, else the card's middle) and the pip bulges twice, gulp, gulp.
M.gorgeGulp = function(host, o){
  const g = G(); if(!g || !host) return Promise.resolve(); o = o || {};
  const c = centre(tileOf(host)), sp = speedOf(o), pip = host.querySelector && host.querySelector('.eq2-para'), to = pip && pip.getBoundingClientRect().width ? centre(pip) : {x:c.x, y:c.y - c.h*.1};
  const rim = overBox(host, 'fxh-rim'), drops = [], bits = [rim]; g.set(rim, {opacity:0});
  for(let i = 0; i < 5; i++){ const d = layer('fxh-drop'); drops.push(d); bits.push(d); g.set(d, {x:c.x + rnd(-.38, .38)*c.w, y:c.y + rnd(0, .4)*c.h, opacity:0, scale:.6}); }
  snd('gorgeGulp');
  const tl = g.timeline().timeScale(sp);
  tl.to(rim, {opacity:1, duration:.1}).to(rim, {opacity:.35, duration:.2, yoyo:true, repeat:2});
  drops.forEach((d, i)=> tl.to(d, {opacity:1, scale:1, duration:.08}, .05 + i*.06).to(d, {x:to.x, y:to.y, scale:.4, duration:.28, ease:'power2.in'}, .1 + i*.06).to(d, {opacity:0, duration:.05}, '>'));
  const bump = pip || tileOf(host);
  [.2, .42].forEach(at=> tl.call(()=> nudge(bump, [{scale:'1'}, {scale: pip ? '1.45' : '1.04', offset:.4}, {scale:'1'}], Math.round(200/sp)), null, at));
  tl.to(rim, {opacity:0, duration:.2}, '>');
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ kill(...bits); res(); }));
};

// =====================================================================================================================
// 4. BATTLE EVENTS (docs/effects-lab-contract.md section 2: called by fxBatchVfx after the built-in passes).
// =====================================================================================================================
const hq = side=>{ try{ if(typeof hqTileEl === 'function') return hqTileEl(side); }catch(e){} return document.querySelector(`[data-hq="${side}"]`); };
const sideCards = side=> [...document.querySelectorAll(`#battlefieldEl [id^="${side === 'A' ? 'rowMine' : 'rowEnemy'}"] .board-card[data-defid]`)];
M.onEvent = function(ev, env){
  if(!ev || !env) return;
  fx14Event(ev, env); // FX14 (2026-11-17): bolt misses, the Shock Bolt's fork, the volley's loose and the resource skills (section 5)
  powder1Event(ev, env); // POWDER1 (2026-11-17): the powder puffs and their dodges (section 6)
  const T = ev.type, el = env.el, sp = Math.max(1, (env.match && env.match.speedMult) || 1);
  if(T === 'crabClaw'){ if(!env.fxAtLeast('low')) return; const a = el(ev.attUid); if(!a) return;
    CRAB.set(String(ev.attUid), {t:Date.now()}); if(CRAB.size > 24) CRAB.delete(CRAB.keys().next().value);
    const tg = ev.targetUid != null ? el(ev.targetUid) : null; let dir = 0;
    if(tg){ dir = centre(tileOf(tg)).x >= centre(tileOf(a)).x ? 1 : -1; } else if(ev.dir === 'left' || ev.dir === 'right') dir = ev.dir === 'left' ? -1 : 1;
    if(env.fxAtLeast('med')) M.crabScuttle(a, {dir, speed:sp});
    return; }
  if((T === 'hit' || T === 'hitHQ' || T === 'evaded') && ev.attUid != null && CRAB.has(String(ev.attUid))){
    const p = CRAB.get(String(ev.attUid)); CRAB.delete(String(ev.attUid)); if(Date.now() - p.t > 4000 || !env.fxAtLeast('low')) return;
    const castle = T === 'hitHQ', tgt = castle ? hq(ev.targetSide) : el(ev.targetUid);
    if(tgt) M.crabSnap(tgt, {from:el(ev.attUid), castle, miss:T === 'evaded', impactMs:env.hitAtMs(ev), speed:sp});
    return; }
  if(!env.fxAtLeast('med')) return;
  if(T === 'heal' && ev.cause === 'healing' && (ev.amount || 0) > 0 && ev.attUid != null && env.once('fxh-mend' + ev.attUid)){
    const h = el(ev.attUid), t = el(ev.targetUid); if(h) M.healingMend(h, String(ev.attUid) === String(ev.targetUid) ? null : t, {speed:sp}); return; }
  if((T === 'grace' && (ev.amount || 0) > 0) || (T === 'statusFx' && ev.kind === 'prayer')){
    const defs = env.defs || {}; let i = 0;
    sideCards(ev.side).forEach(c=>{ const d = defs[c.getAttribute('data-defid')], u = c.getAttribute('data-uid');
      if(d && d.effects && d.effects.worship && env.once('fxh-worship' + u)){ const k = i++; env.at(180 + k*140, ()=>{ if(c.isConnected) M.worshipHymn(c, {speed:sp}); }); } });
    return; }
  if(T === 'parasiteDrain' && ev.gorge){ const h = el(ev.targetUid); if(h) M.gorgeGulp(h, {speed:sp}); return; }
};
// Meiosis (death-slime-split, Lab only since 10-15): a Meiosis unit that falls to an ordinary blow sags into a blob that splits in
// two (FX.C.deathSlimeSplit), just before its two halves arrive (FX.C.meiosisSplit on the spawn). A death with its own look (a cause,
// a boss, a Dragon...) keeps it: FX.C runs first and marks it handled.
M.hooks.deathLook = function(el, info, env){
  if(!el || !info || info.handled || !env.fxAtLeast('med')) return;
  const C = FX.C, d = (env.defs || {})[el.getAttribute && el.getAttribute('data-defid')], e = d && d.effects;
  if(!C || typeof C.deathSlimeSplit !== 'function' || !e || !(e.meiosis === true || Number(e.meiosis) > 0)) return;
  info.handled = true; C.deathSlimeSplit(el, {speed:Math.max(1, (env.match && env.match.speedMult) || 1)});
};

// =====================================================================================================================
// 5. BOLTS, ARROWS, THE RESOURCE SKILLS (2026-11-17, package FX14, owner 11-16 23:53: "More effects etc. The bolt as is, isn't so nice
//    looking. The arrows — blood etc — do they look nice?"). Bolts are quick spits: a short charge in the mouth, then 0.25-0.35 s of
//    flight, each element its own shape, trail and splash. Arrows are drawn on a bow and fly slower on an arc; the variant shows in the
//    fletching, the head, the trail and the impact. The game calls boltShot from ninthPassVfx and arrowShot from the ranged hit
//    (arena_app.js) with the impact times it already had. Everything is a fixed overlay moved by transform / opacity and removed; the
//    trails are placed from the flight's own curve (no layout reads in a loop).
// =====================================================================================================================
css('fx14', `.fxh-pj{width:0; height:0; will-change:transform, opacity;}
.fxh-pj > i{position:absolute; display:block;}
.fxh-pj.fire > .tl{left:-27px; top:-7px; width:30px; height:14px; border-radius:50% 40% 40% 50% / 50%; background:linear-gradient(90deg, rgba(255,80,20,0), rgba(255,120,30,.7) 45%, #ffcf5a 88%);}
.fxh-pj.fire > .co{left:-8px; top:-8px; width:16px; height:16px; border-radius:46% 54% 42% 58%; background:radial-gradient(circle at 35% 32%, #fffbe0 0 16%, #ffc53d 40%, #ff6a1a 70%, #b32a08 100%); box-shadow:0 0 9px 3px rgba(255,110,30,.65);}
.fxh-pj.ice > .gl{left:-12px; top:-12px; width:24px; height:24px; border-radius:50%; background:radial-gradient(circle, rgba(210,240,255,.8), rgba(160,215,255,0) 70%);}
.fxh-pj.ice > .co{left:-14px; top:-6px; width:28px; height:12px; clip-path:polygon(0 50%, 34% 4%, 100% 50%, 34% 96%); background:linear-gradient(172deg, #ffffff 0 34%, #bfe8ff 56%, #4fa3e4 100%);}
.fxh-pj.acid > .co{left:-9px; top:-8px; width:18px; height:16px; border-radius:52% 48% 56% 44% / 58% 52% 48% 42%; background:radial-gradient(circle at 36% 32%, #f8ffc8 0 14%, #b8f03a 42%, #6aa814 78%, #3d6a08 100%); box-shadow:0 0 8px 2px rgba(170,240,40,.55);}
.fxh-pj.poison > .tl{left:-18px; top:-4px; width:12px; height:8px; clip-path:polygon(0 50%, 100% 0, 100% 100%); background:#8a45d0;}
.fxh-pj.poison > .co{left:-10px; top:-7px; width:17px; height:14px; border-radius:50%; background:radial-gradient(circle at 62% 38%, #f3dcff 0 14%, #b26cf0 45%, #6a2aa6 80%, #3e1270 100%); box-shadow:0 0 8px 2px rgba(170,90,255,.5);}
.fxh-pj.spit > .co{left:-7px; top:-6px; width:14px; height:12px; border-radius:60% 40% 40% 60% / 50%; background:radial-gradient(circle at 60% 45%, #fff6c0 0 18%, #ffb02a 50%, #e8420c 100%); box-shadow:0 0 7px 2px rgba(255,120,30,.6);}
.fxh-dot{width:6px; height:6px; margin:-3px; border-radius:50%;}
.fxh-dot.fire{background:radial-gradient(circle, #fff1a8, #ff8a1e 60%, rgba(255,90,20,0));}
.fxh-dot.frost{background:radial-gradient(circle, #ffffff, #cdeeff 55%, rgba(170,220,255,0));}
.fxh-dot.acid, .fxh-dot.venom, .fxh-dot.blood, .fxh-dot.vdrop{width:5px; height:7px; margin:-3.5px -2.5px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;}
.fxh-dot.acid{background:#9ad82a;} .fxh-dot.venom{background:#7ccf3a; box-shadow:0 0 3px #3e8a12;} .fxh-dot.vdrop{background:#9a52dc;}
.fxh-dot.blood{background:radial-gradient(circle at 35% 30%, #ff8a8a, #c3122a 60%, #6a0010);}
.fxh-dot.fume{width:14px; height:14px; margin:-7px; background:radial-gradient(circle, rgba(190,120,240,.55), rgba(150,80,220,0) 70%);}
.fxh-dot.streak{width:14px; height:2px; margin:-1px -7px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.8));}
.fxh-dot.wood{width:7px; height:2px; margin:-1px -3.5px; border-radius:1px; background:#9a6a3a;}
.fxh-dot.chip{width:5px; height:4px; margin:-2px -2.5px; border-radius:1px; background:#a49d90;}
.fxh-flare{width:40px; height:40px; margin:-20px; border-radius:50%;}
.fxh-flare.fire{background:radial-gradient(circle, rgba(255,250,210,.95) 0 14%, rgba(255,160,40,.75) 38%, rgba(255,90,20,0) 70%);}
.fxh-flare.ice{background:radial-gradient(circle, rgba(255,255,255,.95) 0 12%, rgba(190,230,255,.6) 40%, rgba(150,210,255,0) 70%);}
.fxh-flare.acid{background:radial-gradient(circle, rgba(240,255,190,.9) 0 12%, rgba(170,230,50,.55) 42%, rgba(120,200,30,0) 70%);}
.fxh-flare.shock{background:radial-gradient(circle, #ffffff 0 14%, rgba(255,246,140,.75) 36%, rgba(255,230,60,0) 70%);}
.fxh-flare.gold{background:radial-gradient(circle, rgba(255,250,210,.95) 0 12%, rgba(255,215,80,.55) 40%, rgba(255,200,60,0) 70%);}
.fxh-splat{width:46px; height:18px; margin:-9px -23px; border-radius:50%; border:3px solid rgba(160,230,40,.9); box-shadow:inset 0 0 8px rgba(160,230,40,.6);}
.fxh-bub{width:7px; height:7px; margin:-3.5px; border-radius:50%; border:1.5px solid rgba(220,255,140,.95);}
.fxh-shard{width:10px; height:5px; margin:-2.5px -5px; clip-path:polygon(0 50%, 40% 0, 100% 50%, 40% 100%); background:linear-gradient(170deg, #fff, #9fd8ff);}
.fxh-flake{width:12px; height:12px; margin:-6px; font:700 12px/1 system-ui; text-align:center; color:#eaf8ff; text-shadow:0 0 4px #5fb4ff;}
.fxh-puff{width:30px; height:30px; margin:-15px; border-radius:50%; background:radial-gradient(circle, rgba(196,130,245,.7), rgba(150,80,220,.35) 50%, rgba(150,80,220,0) 72%);}
.fxh-puff.venom{background:radial-gradient(circle, rgba(170,235,90,.7), rgba(110,190,50,.35) 50%, rgba(110,190,50,0) 72%);}
.fxh-fork svg{display:block; overflow:visible;}
.fxh-fork polyline{fill:none; stroke-linecap:round; stroke-linejoin:round;}
.fxh-arrow{width:48px; height:14px; margin:-7px -24px; will-change:transform, opacity;}
.fxh-arrow svg{display:block; width:100%; height:100%; overflow:visible;}
.fxh-arrow > i{position:absolute; display:block;}
.fxh-arrow > .tipfx{left:38px; top:-4px; width:20px; height:22px; border-radius:50% 50% 45% 45%;}
.fxh-arrow.fire > .tipfx{background:radial-gradient(ellipse at 45% 60%, #fff3b0 0 16%, #ffa22a 42%, rgba(255,80,20,0) 70%);}
.fxh-arrow.ice > .tipfx{background:radial-gradient(circle, rgba(255,255,255,.9) 0 12%, rgba(180,228,255,.55) 40%, rgba(160,215,255,0) 70%);}
.fxh-arrow.venom > .tipfx{left:41px; top:8px; width:5px; height:7px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:#7ccf3a;}
.fxh-bow{width:0; height:0;}
.fxh-bow svg{position:absolute; left:-6px; top:-22px; width:16px; height:44px; overflow:visible;}
.fxh-slash{width:36px; height:10px; margin:-5px -18px; border-radius:50%; border-top:3px solid #e01a33; box-shadow:0 -2px 4px -2px rgba(255,80,90,.8);}
.fxh-tw{width:18px; height:18px; margin:-9px; font:900 18px/1 system-ui; text-align:center; color:#fff; text-shadow:0 0 6px #ffe48a, 0 0 2px #fff;}
.fxh-log{width:26px; height:11px; margin:-5.5px -13px; border-radius:6px; background:linear-gradient(#b07a44, #7a4a22); box-shadow:inset 0 -2px 0 rgba(60,30,10,.4);}
.fxh-log::after{content:''; position:absolute; right:-1px; top:0; width:11px; height:11px; border-radius:50%; background:radial-gradient(circle, #f1d39a 0 22%, #c99a5c 24% 46%, #e6c48a 48% 66%, #9a6a38 68%);}
.fxh-coin{width:18px; height:18px; margin:-9px; border-radius:50%; background:radial-gradient(circle at 36% 32%, #fff7c2 0 12%, #ffd84a 38%, #e0a412 72%, #a56a00 100%); box-shadow:inset 0 0 0 2px #b97c06, inset 0 0 0 4px rgba(255,236,150,.8);}
.fxh-pearl{width:16px; height:16px; margin:-8px; border-radius:50%; background:radial-gradient(circle at 34% 30%, #ffffff 0 16%, #f6eef4 36%, #e3d2e4 66%, #bba6c4 100%); box-shadow:0 0 6px rgba(255,230,250,.8);}
.fxh-tw.pearl{color:#fff; text-shadow:0 0 6px #ffc8f0, 0 0 2px #fff;}
.fxh-anvil{width:34px; height:22px; margin:-11px -17px;}
.fxh-anvil svg{display:block; width:100%; height:100%; overflow:visible;}
.fxh-nug{width:13px; height:11px; margin:-5.5px -6.5px; border-radius:40% 55% 45% 50%;}
.fxh-nug.stone{background:radial-gradient(circle at 35% 30%, #eeeae0, #a49d90 60%, #6f6a60);}
.fxh-nug.metal{background:radial-gradient(circle at 35% 30%, #ffffff, #b8c2cc 45%, #6a7682);}
.fxh-nug.hot{background:radial-gradient(circle at 35% 30%, #fff7c8, #ffb040 45%, #d0500c);}`);
const FX14 = {bolts: new Map(), shock: new Map(), twin: new WeakMap(), res: new Map(), plunderAt: 0};
const D2R = Math.PI/180;
// a quadratic curve a -> b through control c: its point and its heading (degrees) at t
const qb = (a, c, b, t)=>{ const u = 1 - t; return {x:u*u*a.x + 2*u*t*c.x + t*t*b.x, y:u*u*a.y + 2*u*t*c.y + t*t*b.y}; };
const qa = (a, c, b, t)=> Math.atan2(2*(1 - t)*(c.y - a.y) + 2*t*(b.y - c.y), 2*(1 - t)*(c.x - a.x) + 2*t*(b.x - c.x))/D2R;
// the control point for an arc that peaks `lift` px off the straight line: up the screen, or to one side (side -1 / 1) when asked
function arcCtl(a, b, lift, side){
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; let nx = dy/L, ny = -dx/L;
  if(side){ if(nx*side < 0){ nx = -nx; ny = -ny; } } else if(ny > 0 || (Math.abs(ny) < .2 && nx < 0)){ nx = -nx; ny = -ny; }
  return {x:(a.x + b.x)/2 + nx*lift*2, y:(a.y + b.y)/2 + ny*lift*2};
}
const bit = (cls, html, x, y, set)=>{ const e = layer(cls, html); G().set(e, Object.assign({x, y}, set || {})); return e; };
// n pieces thrown from (x, y): {n, cls, html, d0, d1, a0, a1 (degrees), dur, grav, spin, s0, s1, delay, rot (face the way they fly)}
function spray14(x, y, o){
  const g = G(); if(!g) return; const n = o.n || 6, a0 = o.a0 == null ? 0 : o.a0, a1 = o.a1 == null ? 360 : o.a1, dur = o.dur || .4, del = (o.delay || 0)/1000;
  for(let i = 0; i < n; i++){ const a = a0 + (a1 - a0)*((i + rnd(.1, .9))/n), d = rnd(o.d0 || 10, o.d1 || 26);
    const e = bit(o.cls, o.html || '', x, y, {opacity:0, scale:o.s0 == null ? .6 : o.s0, rotation:o.rot ? a + (o.rotOff || 0) : rnd(0, 360)});
    const v = {x:x + Math.cos(a*D2R)*d, y:y + Math.sin(a*D2R)*d + (o.grav || 0), scale:o.s1 == null ? 1 : o.s1, duration:dur, delay:del, ease:'power2.out'};
    if(o.spin) v.rotation = '+=' + rnd(-o.spin, o.spin);
    g.to(e, {opacity:1, duration:.03, delay:del}); g.to(e, v); g.to(e, {opacity:0, duration:dur*.45, delay:del + dur*.6, onComplete:()=> kill(e)}); }
}
function flare14(x, y, kind, size, dur){
  const g = G(); if(!g) return; const f = bit('fxh-flare ' + kind, '', x, y, {scale:.3, opacity:1}), k = (size || 40)/40;
  g.to(f, {scale:k*1.4, opacity:0, duration:(dur || 300)/1000, ease:'power2.out', onComplete:()=> kill(f)});
}
// rising or falling bits placed along a curve as the shot passes: list of t, each made at `at(t)` ms from now
function trail14(path, ts, at, make){ ts.forEach(t=> later(()=> call(()=> make(path(t), t)), at(t))); }
const knock14 = (el, ux, uy, k)=>{ if(el && el.isConnected) nudge(el, [{translate:'0 0'}, {translate:`${ux*7*(k || 1)}px ${uy*7*(k || 1)}px`, offset:.25}, {translate:`${-ux*2}px ${-uy*2}px`, offset:.6}, {translate:'0 0'}], 280); };
const aimOf = el=>{ const c = centre(tileOf(el)); return {x:c.x, y:c.y, c}; };

// ---- the bolts ----
const BOLT14 = {fire:{parts:['tl', 'co'], cue:'boltFire', lift:.12, trail:'fire'}, ice:{parts:['gl', 'co'], cue:'boltIce', lift:.05, trail:'frost'},
  acid:{parts:['co'], cue:'boltAcid', lift:.2, trail:'acid'}, poison:{parts:['tl', 'co'], cue:'boltPoison', lift:.16, trail:'fume'}, spit:{parts:['co'], cue:'spitfire', lift:.04, trail:'fire'}};
// FX.H.boltShot(from, to, {element, spitfire, total, flight, uid, speed}): total = ms until the bolt's hit lands (the game's windup +
// projectile); it charges in the shooter's mouth for the last ~0.26 s before the spit and flies for `flight` (0.33 s, Spitfire 0.24 s).
// The returned promise has .miss(): a dodge (the 'evaded' that follows) sends it sailing past the target with no splash.
M.boltShot = function(from, to, o){
  o = o || {}; const g = G(), kind = o.spitfire ? 'spit' : (BOLT14[o.element] && o.element !== 'spit' ? o.element : 'fire'), B = BOLT14[kind], sp = speedOf(o);
  const total = Math.max(160, o.total == null ? Math.round(700/sp) : o.total), flight = Math.max(90, Math.min(total - 50, Math.round((o.flight || (kind === 'spit' ? 240 : 330))/(o.total == null ? sp : 1))));
  const charge = total - flight, cs = Math.min(charge, 260), h = {missed:false};
  if(!g || !from || !to || RM()){ const p = wait(total); p.miss = ()=>{}; return p; }
  if(o.uid != null){ FX14.bolts.set(String(o.uid), {h, t:Date.now()}); if(FX14.bolts.size > 24) FX14.bolts.delete(FX14.bolts.keys().next().value); }
  const p = new Promise(res=>{
    const n = kind === 'spit' ? 3 : 1, pjs = [], bits = []; let a, b, c, ux, uy, ang0, sz = 1;
    later(()=>{ if(!from.isConnected || !to.isConnected){ res(); return; }
      const A = centre(tileOf(from)), T = aimOf(to); sz = Math.max(1, Math.min(1.5, A.w/80)); ux = T.x - A.x; uy = T.y - A.y; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
      a = {x:A.x + ux*Math.min(A.w, A.h)*.32, y:A.y + uy*Math.min(A.w, A.h)*.32}; b = {x:T.x - ux*T.c.w*.12, y:T.y - uy*T.c.h*.12};
      c = arcCtl(a, b, Math.hypot(b.x - a.x, b.y - a.y)*B.lift); ang0 = qa(a, c, b, 0);
      nudge(tileOf(from), [{scale:'1'}, {scale:'1.07 .9', offset:.7}, {scale:'.94 1.08', offset:.86}, {scale:'1'}], cs + 120);
      for(let i = 0; i < n; i++){ const e = layer('fxh-pj ' + kind, B.parts.map(k=> `<i class="${k}"></i>`).join('')); pjs.push(e); bits.push(e);
        g.set(e, {x:a.x, y:a.y, rotation:ang0, scale:.2, opacity:0}); if(!i) g.to(e, {scale:(kind === 'spit' ? .8 : .9)*sz, opacity:1, duration:cs/1000, ease:'power2.in'}); }
      if(kind === 'fire'){ const co = pjs[0].querySelector('.co'); g.to(co, {rotation:720, duration:(cs + flight)/1000, ease:'none'}); }
      if(kind === 'acid'){ const co = pjs[0].querySelector('.co'); g.to(co, {scaleX:1.25, scaleY:.8, duration:.07, yoyo:true, repeat:Math.ceil((cs + flight)/70), ease:'sine.inOut'}); }
      if(kind === 'ice') g.fromTo(pjs[0].querySelector('.gl'), {opacity:.4}, {opacity:1, duration:.08, yoyo:true, repeat:Math.ceil((cs + flight)/80)});
    }, charge - cs);
    later(()=>{ if(!a || !pjs.length){ res(); return; }
      if(kind === 'spit') snd('spitfire');
      let end = b; const miss = h.missed;
      if(miss){ const T = Math.hypot(b.x - a.x, b.y - a.y); end = {x:b.x + ux*T*.45 - uy*34, y:b.y + uy*T*.45 + ux*34}; c = arcCtl(a, end, T*B.lift); }
      const path = t=> qb(a, c, end, t);
      pjs.forEach((e, i)=>{ const d = i*45, st = {t:0};
        if(i) g.to(e, {opacity:1, scale:(.75 - i*.12)*sz, duration:.04, delay:d/1000});
        g.to(st, {t:1, duration:flight/1000, delay:d/1000, ease:'none', onUpdate:()=>{ const q = path(st.t); g.set(e, {x:q.x, y:q.y, rotation:qa(a, c, end, st.t)}); },
          onComplete:()=>{ if(miss) g.to(e, {opacity:0, scale:.4, duration:.15, onComplete:()=> kill(e)}); else kill(e); }}); });
      trail14(path, [.18, .34, .5, .66, .82], t=> flight*t, (q, t)=>{
        if(B.trail === 'fire'){ const e = bit('fxh-dot fire', '', q.x, q.y, {scale:rnd(.8, 1.3)}); g.to(e, {y:q.y - rnd(8, 16), x:q.x + rnd(-4, 4), scale:.2, opacity:0, duration:.35, onComplete:()=> kill(e)}); }
        else if(B.trail === 'frost'){ const e = bit('fxh-dot frost', '', q.x + rnd(-3, 3), q.y + rnd(-3, 3), {scale:rnd(.7, 1.2)}); g.to(e, {y:'+=' + rnd(6, 12), scale:.2, opacity:0, duration:.4, onComplete:()=> kill(e)}); }
        else if(B.trail === 'acid'){ if(t > .7) return; const e = bit('fxh-dot acid', '', q.x, q.y); g.to(e, {y:q.y + 16, opacity:0, duration:.32, ease:'power1.in', onComplete:()=> kill(e)}); }
        else { const e = bit('fxh-dot fume', '', q.x, q.y, {scale:.5, opacity:.8}); g.to(e, {scale:1.5, opacity:0, y:q.y - 6, duration:.45, onComplete:()=> kill(e)}); } });
      later(()=>{ if(!miss && to.isConnected){ snd(B.cue); BOLT_HIT[kind](b.x, b.y, ux, uy, to); call(o.onImpact); } res(); }, flight + (n - 1)*45);
    }, charge);
  });
  p.miss = ()=>{ h.missed = true; };
  return p;
};
const BOLT_HIT = {
  fire(x, y, ux, uy, to){ flare14(x, y, 'fire', 58, 320); spray14(x, y, {n:8, cls:'fxh-dot fire', d0:12, d1:30, grav:-10, dur:.38, s0:1.2, s1:.4}); knock14(tileOf(to), ux, uy); },
  ice(x, y, ux, uy, to){ flare14(x, y, 'ice', 50, 280); spray14(x, y, {n:7, cls:'fxh-shard', d0:14, d1:32, dur:.36, rot:true, s0:1, s1:.7});
    spray14(x, y, {n:4, cls:'fxh-flake', html:'❄', d0:10, d1:22, grav:18, dur:.6, spin:120, s0:.5, s1:1}); knock14(tileOf(to), ux, uy, .7); },
  acid(x, y, ux, uy, to){ const g = G(), s = bit('fxh-splat', '', x, y + 4, {scale:.3, opacity:1}); g.to(s, {scale:1.25, opacity:0, duration:.42, ease:'power2.out', onComplete:()=> kill(s)});
    flare14(x, y, 'acid', 40, 260); spray14(x, y, {n:7, cls:'fxh-dot acid', a0:195, a1:345, d0:10, d1:24, grav:20, dur:.42});
    for(let i = 0; i < 5; i++){ const e = bit('fxh-bub', '', x + rnd(-16, 16), y + rnd(-4, 10), {scale:.3, opacity:0}); // the sizzle
      g.to(e, {opacity:1, scale:1, y:'-=' + rnd(10, 20), duration:.22, delay:.08 + i*.07, ease:'power1.out'}); g.to(e, {scale:1.5, opacity:0, duration:.08, delay:.3 + i*.07, onComplete:()=> kill(e)}); }
    knock14(tileOf(to), ux, uy, .6); },
  poison(x, y, ux, uy, to){ const g = G(); for(let i = 0; i < 3; i++){ const e = bit('fxh-puff', '', x + (i - 1)*12, y + rnd(-4, 4), {scale:.3, opacity:.9});
      g.to(e, {scale:rnd(1.3, 1.7), opacity:0, y:'-=' + rnd(10, 18), duration:.55, delay:i*.05, ease:'power1.out', onComplete:()=> kill(e)}); }
    spray14(x, y, {n:5, cls:'fxh-dot vdrop', a0:30, a1:150, d0:6, d1:16, grav:14, dur:.4}); knock14(tileOf(to), ux, uy, .5); },
  spit(x, y, ux, uy, to){ flare14(x, y, 'fire', 42, 240); spray14(x, y, {n:5, cls:'fxh-dot fire', d0:8, d1:20, grav:-8, dur:.3}); knock14(tileOf(to), ux, uy, .6); },
};
// Shock Bolt: the game draws the bolt itself (drawLightningBolt); this adds the crackle around the shooter as it charges and the fork
// where it lands (three jagged branches and a flash; a dodge: a small fizzle beside the target). o.impactMs: when the bolt lands.
const zig = (x0, y0, ang, len, k, jit)=>{ const pts = [[x0, y0]]; for(let i = 1; i <= k; i++){ const d = len*i/k, j = i < k ? rnd(-jit, jit) : rnd(-jit, jit)*.5;
  pts.push([x0 + Math.cos(ang)*d - Math.sin(ang)*j, y0 + Math.sin(ang)*d + Math.cos(ang)*j]); } return pts; };
function forkSvg(cx, cy, branches, W){
  const pl = (pts, cls)=> `<polyline points="${pts.map(p=> (p[0] - cx + W/2).toFixed(1) + ',' + (p[1] - cy + W/2).toFixed(1)).join(' ')}" ${cls}/>`;
  const body = branches.map(p=> pl(p, 'stroke="rgba(255,236,110,.55)" stroke-width="5"') + pl(p, 'stroke="#fffbe0" stroke-width="1.8"')).join('');
  const e = layer('fxh-fork', `<svg width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">${body}</svg>`); G().set(e, {x:cx - W/2, y:cy - W/2}); return e;
}
M.shockBolt = function(from, to, o){
  o = o || {}; const g = G(); if(!g || !to) return Promise.resolve(); const at = Math.max(0, o.impactMs == null ? 250 : o.impactMs);
  if(from && from.isConnected) later(()=>{ if(!from.isConnected) return; const A = centre(tileOf(from));
    for(let i = 0; i < 2; i++){ const a0 = rnd(0, Math.PI*2), r0 = Math.min(A.w, A.h)*.42, x0 = A.x + Math.cos(a0)*r0, y0 = A.y + Math.sin(a0)*r0;
      const e = forkSvg(x0, y0, [zig(x0, y0, a0 + rnd(-.6, .6), rnd(12, 20), 3, 4)], 60); g.set(e, {opacity:0});
      g.timeline({delay:i*.07, onComplete:()=> kill(e)}).to(e, {opacity:1, duration:.02}).to(e, {opacity:.2, duration:.04}).to(e, {opacity:1, duration:.03}).to(e, {opacity:0, duration:.06}); } }, Math.max(0, at - 220));
  return new Promise(res=> later(()=>{ if(!to.isConnected){ res(); return; }
    const T = aimOf(to), A = from && from.isConnected ? centre(tileOf(from)) : {x:T.x, y:T.y + 100}, base = Math.atan2(T.y - A.y, T.x - A.x);
    if(o.miss){ const x = T.x + T.c.w*.62, y = T.y; flare14(x, y, 'shock', 26, 200); spray14(x, y, {n:4, cls:'fxh-spark', d0:6, d1:14, dur:.2, rot:true, rotOff:90}); later(res, 260); return; }
    const br = [-0.75, 0, 0.75].map(d=> zig(T.x, T.y, base + d + rnd(-.25, .25), rnd(26, 44), 4, 7));
    br.push(zig(br[0][2][0], br[0][2][1], base - 1.4, rnd(12, 18), 2, 4), zig(br[2][2][0], br[2][2][1], base + 1.4, rnd(12, 18), 2, 4)); // two twigs off the outer branches
    const e = forkSvg(T.x, T.y, br, 120); g.set(e, {opacity:0, scale:.6, transformOrigin:'50% 50%'});
    flare14(T.x, T.y, 'shock', 56, 260); spray14(T.x, T.y, {n:6, cls:'fxh-spark', d0:12, d1:26, dur:.22, rot:true, rotOff:90});
    g.timeline({onComplete:()=>{ kill(e); res(); }}).to(e, {opacity:1, scale:1, duration:.04}).to(e, {opacity:.25, duration:.05}).to(e, {opacity:1, duration:.04}).to(e, {opacity:.5, duration:.06}).to(e, {opacity:1, duration:.03}).to(e, {opacity:0, duration:.12});
  }, at));
};

// ---- the arrows ----
// variant: fletching (two colours), shaft, head (fill, stroke), the head's shape, the trail, the impact
const ARROW14 = {
  plain: {f:['#f4efe2', '#d94a3a'], shaft:'#8a5a2b', head:['#d7dde3', '#59616a']},
  fire:  {f:['#ff9a2a', '#ffd36a'], shaft:'#6a3a1a', head:['#ffcf5a', '#c2410c']},
  ice:   {f:['#e6f6ff', '#8fd0ff'], shaft:'#a9cde0', head:['#eefaff', '#4fa3e4']},
  bleed: {f:['#8a1020', '#d43046'], shaft:'#5a3420', head:['#c8cdd2', '#7a0f18'], serrated:true},
  venom: {f:['#5aa02a', '#b6e86a'], shaft:'#6a5a2a', head:['#9be04a', '#2f6a10']},
};
function arrowSvg(v, archer){
  const A = ARROW14[v] || ARROW14.plain, f = archer && v === 'plain' ? ['#3a6ad8', '#f4efe2'] : A.f;
  const head = A.serrated ? `<path d="M36 2 L40 4.2 L38.6 5 L48 7 L38.6 9 L40 9.8 L36 12 L38.4 7 Z" fill="${A.head[0]}" stroke="${A.head[1]}" stroke-width=".9" stroke-linejoin="round"/><circle cx="43" cy="7" r="1.1" fill="#c3122a"/>`
    : `<path d="M37 2.5 L48 7 L37 11.5 L39.4 7 Z" fill="${A.head[0]}" stroke="${A.head[1]}" stroke-width=".9" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 48 14"><path d="M1 7 L3.5 1.2 L13 5.2 L12 7 Z" fill="${f[0]}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/><path d="M1 7 L3.5 12.8 L13 8.8 L12 7 Z" fill="${f[1]}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
<rect x="3" y="6.1" width="36" height="1.8" rx=".9" fill="${A.shaft}"/>${head}</svg>`;
}
const BOW_SVG = `<svg viewBox="0 0 16 44"><path d="M3 2 Q19 22 3 42" fill="none" stroke="#6b3f1c" stroke-width="3" stroke-linecap="round"/><path d="M3 2 Q19 22 3 42" fill="none" stroke="#c08a4e" stroke-width="1.2" stroke-linecap="round"/><path d="M3 2 L3 42" stroke="#f1e8d4" stroke-width="1"/></svg>`;
// Which arrow this is: the event's flags first, then the card's tip (Arrow N – bleed / – poison, EN7).
M.arrowVariant = function(pa, fx){ pa = pa || {}; fx = fx || {};
  if(pa.fire) return 'fire'; if(pa.ice) return 'ice';
  if(fx.arrowBleed || fx.fireArrowBleed) return 'bleed'; if(fx.arrowPoison || fx.fireArrowPoison) return 'venom';
  const a = fx.arrow; if(a && typeof a === 'object'){ if(a.tip === 'bleed' || a.bleed) return 'bleed'; if(a.tip === 'poison' || a.poison) return 'venom'; }
  return 'plain'; };
// FX.H.arrowShot(shooter, target, {variant, draw, flight, miss, twin, plunge, archer, castle}): the bow appears at the shooter's front,
// the arrow is nocked and pulled back for `draw` ms (the shooter leans back), loosed with a twang, and flies `flight` ms on an arc (a
// near-vertical shot bows to the side and swells as if it rose toward you). It sticks and quivers, the target is knocked back, and the
// variant's impact plays. miss: it sails past and skids. twin: the second of a pair arcs the other way, the bow stays up. plunge (Volley):
// it drops from high above the target instead. Returns false when it can't draw (no GSAP, reduced motion): the caller keeps its own.
M.arrowShot = function(shooter, target, o){
  o = o || {}; const g = G(); if(!g || !shooter || !target || RM() || !target.isConnected) return false;
  const v = ARROW14[o.variant] ? o.variant : 'plain', draw = Math.max(60, o.draw == null ? 234 : o.draw), flight = Math.max(90, o.flight == null ? 380 : o.flight);
  const S = centre(tileOf(shooter)), sz = Math.max(1, Math.min(1.5, S.w/80)), T = aimOf(target), aim = {x:T.x + T.c.w*rnd(-.14, .14), y:T.y + T.c.h*rnd(-.08, .14)};
  let ux = aim.x - S.x, uy = aim.y - S.y; { const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L; }
  let side = 0, held = false;
  if(o.twin){ const prev = FX14.twin.get(shooter); held = !!(prev && Date.now() - prev.t < 1600); side = held ? -prev.side : (Math.abs(ux) > .6 ? 0 : 1); FX14.twin.set(shooter, {t:Date.now(), side: side || 1}); }
  const s0 = o.plunge ? {x:aim.x + rnd(-36, 36) - ux*30, y:T.c.r.top - rnd(170, 230)} : {x:S.x + ux*Math.min(S.w, S.h)*.3, y:S.y + uy*Math.min(S.w, S.h)*.3};
  const pull = o.plunge ? 0 : 10, s1 = {x:s0.x - ux*pull, y:s0.y - uy*pull};
  let end = {x:aim.x - ux*15*sz, y:aim.y - uy*15*sz};
  if(o.miss){ end = {x:aim.x + ux*T.c.h*.7 + uy*T.c.w*.4, y:aim.y + uy*T.c.h*.7 - ux*T.c.w*.4}; }
  const dist = Math.hypot(end.x - s1.x, end.y - s1.y), lift = o.plunge ? 14 : Math.max(12, Math.min(90, dist*((o.archer ? .08 : .06) + .16*Math.abs(ux))))*(o.twin ? 1.4 : 1); // a level shot arcs up; a near-vertical one only bows a little to the side (the swell gives it height)
  const c = arcCtl(s1, end, lift, side || (o.plunge ? (ux >= 0 ? -1 : 1) : 0)), bump = o.plunge ? -.15 : .2*(1 - Math.min(1, Math.abs(ux)*1.4)) + .05;
  const ang0 = qa(s1, c, end, 0), bits = [];
  const ar = layer('fxh-arrow ' + v, arrowSvg(v, o.archer) + (v === 'fire' || v === 'ice' || v === 'venom' ? '<i class="tipfx"></i>' : '')); bits.push(ar);
  const tip = ar.querySelector('.tipfx');
  if(tip && v === 'fire') g.to(tip, {scaleY:1.25, scaleX:.85, duration:.09, yoyo:true, repeat:Math.ceil((draw + flight + 500)/90), transformOrigin:'50% 80%'});
  if(tip && v === 'venom') g.fromTo(tip, {y:0, opacity:1}, {y:5, opacity:0, duration:.32, repeat:Math.ceil((draw + flight)/320), ease:'power1.in'});
  // 1) the draw
  if(o.plunge){ g.set(ar, {x:s0.x, y:s0.y, rotation:ang0, opacity:0, scale:.8*sz}); g.to(ar, {opacity:1, duration:.12, delay:Math.max(0, draw - 120)/1000}); }
  else {
    const bw = layer('fxh-bow', BOW_SVG); bits.push(bw); const bs = (o.archer ? 1.3 : 1)*sz;
    g.set(bw, {x:s0.x + ux*4, y:s0.y + uy*4, rotation:ang0, scale:held ? bs : .4*bs, opacity:held ? 1 : 0});
    g.set(ar, {x:s0.x + ux*8, y:s0.y + uy*8, rotation:ang0, opacity:0, scale:.85*sz});
    const tl = g.timeline();
    tl.to(bw, {opacity:1, scale:bs, duration:held ? .01 : .09, ease:'back.out(2)'}, 0).to(ar, {opacity:1, duration:.06}, 0)
      .to(ar, {x:s1.x, y:s1.y, scale:.95*sz, duration:draw/1000*.85, ease:'power2.out'}, .04).to(bw, {scaleX:bs*.8, duration:draw/1000*.85, ease:'power2.out'}, .04)
      .to(bw, {scaleX:bs*1.12, duration:.05, ease:'power3.out'}, draw/1000).to(bw, {scaleX:bs, duration:.2, ease:'elastic.out(1, .4)'}, draw/1000 + .05)
      .to(bw, {opacity:0, duration:.18}, draw/1000 + .16);
    nudge(tileOf(shooter), [{translate:'0 0'}, {translate:`${-ux*6}px ${-uy*6}px`, offset:draw/(draw + 260)}, {translate:`${ux*4}px ${uy*4}px`, offset:(draw + 60)/(draw + 260)}, {translate:'0 0'}], draw + 260);
    if(o.archer) later(()=>{ const q = {x:s1.x + ux*24, y:s1.y + uy*24}, st = bit('fxh-tw', '✦', q.x, q.y, {scale:.2, opacity:1}); g.to(st, {scale:1.1, rotation:90, duration:.12, ease:'back.out(3)'}); g.to(st, {opacity:0, scale:.4, duration:.12, delay:.13, onComplete:()=> kill(st)}); }, Math.max(0, draw - 140));
    later(()=>{ const r = bit('fxh-ring', '', s0.x - 14, s0.y - 14, {width:28, height:28, scale:.4, opacity:.7}); r.style.borderColor = 'rgba(255,248,225,.85)'; r.style.boxShadow = 'none';
      g.to(r, {scale:1.6, opacity:0, duration:.28, ease:'power2.out', onComplete:()=> kill(r)}); }, draw);
  }
  // 2) the flight
  const from = o.plunge ? s0 : s1, path = t=> qb(from, c, end, t), st = {t:0};
  g.to(st, {t:1, duration:flight/1000, delay:draw/1000, ease:o.plunge ? 'power1.in' : 'none', onUpdate:()=>{ const q = path(st.t); g.set(ar, {x:q.x, y:q.y, rotation:qa(from, c, end, st.t), scale:sz*(1 + bump*4*st.t*(1 - st.t))}); }});
  const tail = (q, t)=>{ const a = qa(from, c, end, t)*D2R; return {x:q.x - Math.cos(a)*22*sz, y:q.y - Math.sin(a)*22*sz, a:a/D2R}; };
  trail14(path, [.12, .24, .36, .48, .6, .72, .84, .94], t=> draw + flight*t, (q, t)=>{ const p = tail(q, t);
    if(v === 'plain'){ const e = bit('fxh-dot streak', '', p.x, p.y, {rotation:p.a, opacity:.8}); g.to(e, {opacity:0, scaleX:.4, duration:.2, onComplete:()=> kill(e)}); }
    else if(v === 'fire'){ for(let i = 0; i < 2; i++){ const e = bit('fxh-dot fire', '', p.x + rnd(-3, 3), p.y + rnd(-3, 3), {scale:rnd(.9, 1.5)}); g.to(e, {y:'-=' + rnd(10, 20), x:'+=' + rnd(-5, 5), scale:.2, opacity:0, duration:.42, onComplete:()=> kill(e)}); } }
    else if(v === 'ice'){ const e = bit('fxh-dot frost', '', p.x, p.y, {scale:rnd(.9, 1.4)}); g.to(e, {y:'+=' + rnd(6, 12), scale:.2, opacity:0, duration:.45, onComplete:()=> kill(e)});
      if(t > .3 && t < .8 && Math.round(t*100) % 24 === 0){ const f = bit('fxh-flake', '❄', p.x, p.y, {scale:.6}); g.to(f, {y:'+=16', rotation:rnd(-90, 90), opacity:0, duration:.55, onComplete:()=> kill(f)}); } }
    else if(v === 'venom'){ if(t < .3 || t > .9) return; const e = bit('fxh-dot venom', '', q.x, q.y); g.to(e, {y:'+=' + rnd(14, 22), opacity:0, duration:.4, ease:'power1.in', onComplete:()=> kill(e)}); }
    else if(v === 'bleed'){ const e = bit('fxh-dot streak', '', p.x, p.y, {rotation:p.a, opacity:.7}); e.style.background = 'linear-gradient(90deg, rgba(220,30,50,0), rgba(230,40,60,.8))'; g.to(e, {opacity:0, scaleX:.4, duration:.22, onComplete:()=> kill(e)}); } });
  // 3) the impact (or the miss)
  const done = new Promise(res=> later(()=>{
    const a = qa(from, c, end, 1);
    if(o.miss || !target.isConnected){ g.to(ar, {x:'+=' + Math.cos(a*D2R)*14, y:'+=' + Math.sin(a*D2R)*14, rotation:a + 18, opacity:0, duration:.26, ease:'power1.out', onComplete:()=>{ kill(...bits); res(); }});
      const d = bit('fxh-dust', '', end.x, end.y, {scale:.5, opacity:.8}); g.to(d, {scale:1.8, opacity:0, duration:.35, onComplete:()=> kill(d)}); return; }
    g.timeline({onComplete:()=>{ kill(...bits); res(); }}).to(ar, {keyframes:[{rotation:a + 6, duration:.05}, {rotation:a - 4, duration:.06}, {rotation:a + 2, duration:.07}, {rotation:a, duration:.08}]})
      .to(ar, {opacity:0, duration:.22, ease:'power1.in'}, .42);
    knock14(o.castle ? target : tileOf(target), Math.cos(a*D2R), Math.sin(a*D2R), v === 'fire' ? 1.2 : 1);
    ARROW_HIT[v](aim.x, aim.y, a);
  }, draw + flight));
  done.ok = true; return done;
};
const ARROW_HIT = {
  plain(x, y, a){ spray14(x, y, {n:5, cls:'fxh-dot wood', a0:a + 120, a1:a + 240, d0:8, d1:18, grav:6, dur:.32, spin:200}); },
  fire(x, y, a){ flare14(x, y, 'fire', 60, 360); spray14(x, y, {n:7, cls:'fxh-dot fire', a0:200, a1:340, d0:10, d1:26, grav:-10, dur:.45, s0:1.3, s1:.3}); },
  ice(x, y, a){ snd('crystalPop'); flare14(x, y, 'ice', 52, 300); spray14(x, y, {n:7, cls:'fxh-shard', d0:12, d1:28, dur:.34, rot:true, s0:1, s1:.6});
    const g = G(), st = bit('fxh-tw', '✦', x, y, {scale:.2, opacity:1}); st.style.color = '#e8f8ff'; st.style.textShadow = '0 0 6px #6fc0ff, 0 0 2px #fff';
    g.to(st, {scale:1.4, rotation:45, duration:.14, ease:'back.out(3)'}); g.to(st, {scale:.5, opacity:0, duration:.16, delay:.16, onComplete:()=> kill(st)});
    spray14(x, y, {n:3, cls:'fxh-flake', html:'❄', d0:8, d1:18, grav:16, dur:.6, spin:120, s0:.5, s1:.9}); },
  bleed(x, y, a){ snd('arrowSlash'); const g = G(), s = bit('fxh-slash', '', x, y, {rotation:a + 90 + rnd(-25, 25), scaleX:0, opacity:1});
    g.to(s, {scaleX:1, duration:.09, ease:'power3.out'}); g.to(s, {opacity:0, duration:.22, delay:.16, onComplete:()=> kill(s)});
    spray14(x, y, {n:6, cls:'fxh-dot blood', a0:20, a1:160, d0:8, d1:20, grav:18, dur:.5, s0:.8, s1:1.1}); spray14(x, y, {n:3, cls:'fxh-dot wood', a0:a + 140, a1:a + 220, d0:6, d1:12, dur:.3}); },
  venom(x, y, a){ snd('venomPuff'); const g = G(); for(let i = 0; i < 3; i++){ const e = bit('fxh-puff venom', '', x + (i - 1)*11, y + rnd(-3, 3), {scale:.3, opacity:.9});
      g.to(e, {scale:rnd(1.2, 1.6), opacity:0, y:'-=' + rnd(8, 16), duration:.5, delay:i*.05, ease:'power1.out', onComplete:()=> kill(e)}); }
    spray14(x, y, {n:4, cls:'fxh-dot venom', a0:40, a1:140, d0:6, d1:14, grav:16, dur:.45}); },
};
// Volley's loose (its first arrow of the round, Medium and up): the bow draws and five arrows fan up into the sky; each arrow's own
// hit then plunges onto its target from above (arrowShot with plunge).
M.volleyLoose = function(shooter, o){
  o = o || {}; const g = G(); if(!g || !shooter || RM()) return Promise.resolve(); const draw = Math.max(60, o.draw == null ? 200 : o.draw);
  const S = centre(tileOf(shooter)), up = -1, s0 = {x:S.x, y:S.y + up*S.h*.3}, bits = [];
  const bw = layer('fxh-bow', BOW_SVG); bits.push(bw); g.set(bw, {x:s0.x, y:s0.y, rotation:up < 0 ? -90 : 90, scale:.5, opacity:0});
  g.timeline().to(bw, {opacity:1, scale:1.15, duration:.09, ease:'back.out(2)'}).to(bw, {scaleX:.9, duration:draw/1000*.8}).to(bw, {scaleX:1.15, duration:.2, ease:'elastic.out(1, .4)'}).to(bw, {opacity:0, duration:.16}, '-=.1');
  for(let i = 0; i < 5; i++){ const ang = (up < 0 ? -90 : 90) + (i - 2)*14 + rnd(-4, 4), ar = layer('fxh-arrow plain', arrowSvg('plain')); bits.push(ar);
    const d = rnd(170, 230), ex = s0.x + Math.cos(ang*D2R)*d, ey = s0.y + Math.sin(ang*D2R)*d;
    g.set(ar, {x:s0.x, y:s0.y, rotation:ang, opacity:0, scale:.8});
    g.to(ar, {opacity:1, duration:.04, delay:(draw + i*30)/1000}); g.to(ar, {x:ex, y:ey, scale:.6, duration:.34, delay:(draw + i*30)/1000, ease:'power1.out'});
    g.to(ar, {opacity:0, duration:.14, delay:(draw + i*30)/1000 + .22}); }
  return new Promise(res=> later(()=>{ kill(...bits); res(); }, draw + 520));
};

// ---- the resource skills (Medium and up, like the Lumber arc they sit beside) ----
// fly an element from a to b on a little hop, spinning `spin` degrees, then bump the destination
function hop14(e, a, b, ms, spin, o){
  o = o || {}; const g = G(), c = {x:(a.x + b.x)/2, y:Math.min(a.y, b.y) - Math.max(30, Math.abs(b.x - a.x)*.18)}, st = {t:0};
  return new Promise(res=> g.to(st, {t:1, duration:ms/1000, delay:(o.delay || 0)/1000, ease:'power1.inOut', onUpdate:()=>{ const q = qb(a, c, b, st.t); g.set(e, {x:q.x, y:q.y, rotation:(o.rot0 || 0) + spin*st.t, scale:(o.s0 || 1) + ((o.s1 == null ? .7 : o.s1) - (o.s0 || 1))*st.t}); },
    onComplete:res}));
}
const bump14 = el=>{ if(el && el.isConnected) nudge(el, [{scale:'1'}, {scale:'1.22', offset:.35}, {scale:'.96', offset:.7}, {scale:'1'}], 280); };
const ptOf = el=>{ const c = centre(el); return {x:c.x, y:c.y, c}; };
// Forestry: a log pops out of the card and tumbles end over end into the Lumber pill (n logs, one after another).
M.forestryLog = function(src, dest, o){
  o = o || {}; const g = G(); if(!g || !src) return Promise.resolve(); const n = Math.max(1, Math.min(3, o.n || 1)), a = ptOf(tileOf(src)), b = dest && dest.isConnected ? ptOf(dest) : null;
  snd('logTumble'); const runs = [];
  for(let i = 0; i < n; i++){ const e = bit('fxh-log', '', a.x, a.y, {scale:.3, opacity:0, rotation:-20}), top = {x:a.x + (i - (n - 1)/2)*12, y:a.c.r.top + 6};
    runs.push(new Promise(res=> g.timeline({delay:i*.12}).to(e, {opacity:1, scale:1, x:top.x, y:top.y - 14, rotation:10, duration:.16, ease:'back.out(2.5)'})
      .add(()=>{ (b ? hop14(e, {x:top.x, y:top.y - 14}, b, 420, 540, {rot0:10, s1:.6}) : g.to(e, {y:'+=10', rotation:200, duration:.3})).then(()=>{
        if(b){ bump14(dest); spray14(b.x, b.y, {n:3, cls:'fxh-dot wood', a0:200, a1:340, d0:6, d1:14, dur:.25, spin:200}); }
        g.to(e, {opacity:0, scale:.3, duration:.1, onComplete:()=>{ kill(e); res(); }}); }); }))); }
  return Promise.all(runs);
};
// A coin flips up out of the card (or, spending: out of the Gold pill) with a glint, and drops into the pill.
M.coinFlip = function(src, dest, o){
  o = o || {}; const g = G(); if(!g || !src) return Promise.resolve(); const n = Math.max(1, Math.min(3, o.n || 1)), a = ptOf(o.spend ? src : tileOf(src)), b = dest && dest.isConnected ? ptOf(dest) : null;
  snd('coinFlip'); const runs = [];
  for(let i = 0; i < n; i++){ const e = bit('fxh-coin', '', a.x, a.y, {scale:.4, opacity:0}), peak = {x:a.x + (i - (n - 1)/2)*14, y:(o.spend ? a.c.r.top : a.c.r.top + 4) - 22};
    g.to(e, {scaleX:.08, duration:.07, yoyo:true, repeat:7, ease:'sine.inOut', delay:i*.1});
    runs.push(new Promise(res=> g.timeline({delay:i*.1}).to(e, {opacity:1, scale:1, x:peak.x, y:peak.y, duration:.24, ease:'power2.out'})
      .add(()=>{ if(!i){ const t = bit('fxh-tw', '✦', peak.x + 7, peak.y - 7, {scale:.2, opacity:1}); g.to(t, {scale:1, rotation:90, duration:.12}); g.to(t, {opacity:0, duration:.14, delay:.12, onComplete:()=> kill(t)}); } })
      .add(()=>{ if(b) hop14(e, peak, b, 340, 0, {s1:.65}).then(()=>{ bump14(dest); flare14(b.x, b.y, 'gold', 26, 220); kill(e); res(); });
        else g.to(e, {y:'+=' + (o.spend ? 14 : 10), opacity:0, scale:.5, duration:.28, ease:'power1.in', onComplete:()=>{ kill(e); res(); }}); }))); }
  return Promise.all(runs);
};
// Plunder: coins flip out of the robbed side's Gold pill (or its bramble) and land in the plunderer.
M.plunderCoins = function(from, to, o){
  o = o || {}; const g = G(); if(!g || !from || !to) return Promise.resolve(); FX14.plunderAt = Date.now();
  const n = Math.max(1, Math.min(3, o.n || 1)), a = ptOf(from), b = ptOf(tileOf(to)), runs = [];
  for(let i = 0; i < n; i++){ const e = bit('fxh-coin', '', a.x, a.y, {scale:.5, opacity:0}); g.to(e, {opacity:1, scale:.9, duration:.08, delay:i*.09}); g.to(e, {scaleX:.08, duration:.07, yoyo:true, repeat:5, ease:'sine.inOut', delay:i*.09});
    runs.push(hop14(e, a, {x:b.x + (i - (n - 1)/2)*12, y:b.y}, 440, 0, {delay:i*90, s0:.9, s1:.7}).then(()=>{ flare14(b.x, b.y, 'gold', 30, 220); kill(e); })); }
  return Promise.all(runs).then(()=> bump14(tileOf(to)));
};
// Masonry / Refining: a little anvil drops onto the card, two hammer-strikes of sparks, and the new Stone (or a glowing Metal nugget
// that cools) hops off it.
const ANVIL_SVG = `<svg viewBox="0 0 34 22"><path d="M2 3 H26 C30 3 33 5 33 7 C29 7 27 8 26 10 V12 H22 L24 17 H28 V21 H6 V17 H10 L12 12 H8 C5 12 3 9 2 3 Z" fill="#5d6670" stroke="#2a2f35" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.5 4.6 H25" stroke="#c4ccd4" stroke-width="1.4" stroke-linecap="round"/></svg>`;
M.anvilSpark = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve(); const c = centre(tileOf(el)), x = c.x, y = c.y + c.h*.12, metal = o.product === 'metal';
  const an = bit('fxh-anvil', ANVIL_SVG, x, y - 20, {scale:.4, opacity:0}), nug = bit('fxh-nug ' + (metal ? 'hot' : 'stone'), '', x + 2, y - 10, {scale:.2, opacity:0}); snd('anvilTink');
  const tl = g.timeline({onComplete:()=> kill(an, nug)});
  tl.to(an, {opacity:1, scale:1, y:y, duration:.14, ease:'bounce.out'});
  [.18, .36].forEach(t=> tl.add(()=>{ spray14(x + 2, y - 9, {n:6, cls:'fxh-spark', a0:200, a1:340, d0:10, d1:22, dur:.22, rot:true, rotOff:90}); flare14(x + 2, y - 9, 'gold', 22, 180); }, t)
    .to(an, {scaleY:.86, scaleX:1.06, duration:.04, yoyo:true, repeat:1}, t));
  tl.to(nug, {opacity:1, scale:1, y:y - 30, duration:.18, ease:'back.out(3)'}, .5);
  if(metal) tl.add(()=> nug.classList.replace('hot', 'metal'), .78);
  tl.to(an, {opacity:0, scale:.8, duration:.16}, .62).to(nug, {y:y - 38, opacity:0, duration:.2}, .9);
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ kill(an, nug); res(); }));
};
// Pearls: a pearl rolls up to the Pearl pill (or, spent, rises out of it) and a four-point glint turns over it.
M.pearlGlint = function(el, o){
  o = o || {}; const g = G(); if(!g || !el) return Promise.resolve(); snd('pearlChime');
  const a = ptOf(o.spend ? el : tileOf(el)), b = !o.spend && o.dest && o.dest.isConnected ? ptOf(o.dest) : null, p = bit('fxh-pearl', '', a.x, a.y, {scale:.3, opacity:0});
  const glint = at=>{ const t = bit('fxh-tw pearl', '✦', at.x + 6, at.y - 6, {scale:.2, opacity:1}); g.to(t, {scale:1.25, rotation:180, duration:.3, ease:'power2.out'}); g.to(t, {opacity:0, duration:.15, delay:.25, onComplete:()=> kill(t)}); };
  return new Promise(res=>{ const tl = g.timeline();
    tl.to(p, {opacity:1, scale:1, y:a.y - (o.spend ? 18 : 12), duration:.2, ease:'back.out(2)'}).add(()=> glint({x:a.x, y:a.y - (o.spend ? 18 : 12)}));
    if(b) tl.add(()=> hop14(p, {x:a.x, y:a.y - 12}, b, 360, 0, {s1:.8}).then(()=>{ bump14(o.dest); glint(b); g.to(p, {opacity:0, duration:.2, delay:.12, onComplete:()=>{ kill(p); res(); }}); }), '+=.12');
    else tl.to(p, {opacity:0, scale:.5, y:'-=10', duration:.25, delay:.2, onComplete:()=>{ kill(p); res(); }}); });
};
// Quarrying / Mining: a chip of stone (or ore) knocks off the card with a few grit bits and hops into its pill.
M.oreChip = function(src, dest, o){
  o = o || {}; const g = G(); if(!g || !src) return Promise.resolve(); const a = ptOf(tileOf(src)), b = dest && dest.isConnected ? ptOf(dest) : null, metal = o.res === 'metal';
  snd('pickChip'); const top = {x:a.x, y:a.c.r.top + 8}, e = bit('fxh-nug ' + (metal ? 'metal' : 'stone'), '', top.x, top.y + 10, {scale:.3, opacity:0});
  spray14(top.x, top.y, {n:5, cls:'fxh-dot chip', a0:200, a1:340, d0:8, d1:18, grav:8, dur:.3, spin:200});
  return new Promise(res=> g.timeline().to(e, {opacity:1, scale:1, y:top.y - 12, rotation:30, duration:.16, ease:'back.out(2.5)'})
    .add(()=>{ if(b) hop14(e, {x:top.x, y:top.y - 12}, b, 380, 300, {rot0:30, s1:.65}).then(()=>{ bump14(dest); kill(e); res(); });
      else g.to(e, {opacity:0, y:'+=12', duration:.25, onComplete:()=>{ kill(e); res(); }}); }));
};

// =====================================================================================================================
// 6. THE POWDERS (2026-11-17, package POWDER1, owner 11-17 17:32, OWN-1117-1: "Status Powder: Start with Sleeping Powder and Poison Powder").
//    A powder is a Speed -1 action that puts its status on the enemy facing it, no damage: the shooter shakes (a quick squash), a loose drift
//    of spores wobbles across (slower and softer than a bolt's spit, so it reads as a puff, not a shot), and blooms into a soft cloud on the
//    target: Sleeping lavender with a few rising z's, Poison green with drips. A dodge (the 'evaded' after it): the drift thins out beside it.
//    Transform / opacity only, no filter or blend mode; reduced motion and Effects None: nothing here (the status mark still shows).
// =====================================================================================================================
const PWD = {sleep:{cls:'sleep', glyph:'z'}, poison:{cls:'poison', glyph:''}};
const POWDER1 = new Map();
// FX.H.powderPuff(from, to, {element, total, speed}): total = ms until the spores reach the target (default 560 / speed). Returns a promise
// with .miss() (the drift thins out beside the target, no bloom).
M.powderPuff = function(from, to, o){
  o = o || {}; const g = G(), P = PWD[o.element] || PWD.sleep, sp = speedOf(o), total = Math.max(180, o.total == null ? Math.round(560/sp) : o.total), h = {missed:false};
  if(!g || !from || !to || RM()){ const p = wait(total); p.miss = ()=>{}; return p; }
  if(o.uid != null){ POWDER1.set(String(o.uid), {h, t:Date.now()}); if(POWDER1.size > 24) POWDER1.delete(POWDER1.keys().next().value); }
  const p = new Promise(res=>{ if(!from.isConnected || !to.isConnected){ res(); return; }
    const A = centre(tileOf(from)), T = aimOf(to); let ux = T.x - A.x, uy = T.y - A.y; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
    const a = {x:A.x + ux*Math.min(A.w, A.h)*.3, y:A.y + uy*Math.min(A.w, A.h)*.3}, b = {x:T.x - ux*T.c.w*.08, y:T.y - uy*T.c.h*.08}, shake = Math.min(160, total*.3), fly = total - shake;
    nudge(tileOf(from), [{scale:'1'}, {scale:'1.06 .92', offset:.35}, {scale:'.96 1.05', offset:.7}, {scale:'1'}], shake + 80);
    const n = 9, spores = [];
    for(let i = 0; i < n; i++){ const e = bit('fxh-spore ' + P.cls, '', a.x + rnd(-8, 8), a.y + rnd(-8, 8), {scale:.3, opacity:0}); spores.push(e);
      const d = shake/1000*rnd(.2, 1), side = (i%2 ? 1 : -1)*rnd(10, 22), lag = i*.018;
      g.to(e, {opacity:rnd(.65, 1), scale:rnd(.8, 1.35), duration:.12, delay:d});
      later(()=>{ const end = h.missed ? {x:b.x + ux*30 - uy*side*1.6, y:b.y + uy*30 + ux*side*1.6} : {x:b.x + rnd(-10, 10), y:b.y + rnd(-10, 10)};
        const c = {x:(a.x + end.x)/2 - uy*side, y:(a.y + end.y)/2 + ux*side - 10}, st = {t:0};
        g.to(st, {t:1, duration:fly/1000, delay:lag, ease:'sine.inOut', onUpdate:()=>{ const q = qb(a, c, end, st.t); g.set(e, {x:q.x, y:q.y + Math.sin(st.t*7 + i)*3}); },
          onComplete:()=> g.to(e, {opacity:0, scale:h.missed ? .3 : 1.8, duration:.22, onComplete:()=> kill(e)})}); }, shake); }
    later(()=>{ if(h.missed || !to.isConnected){ res(); return; } snd('sporePuff', o.element);
      for(let i = 0; i < 3; i++){ const c = bit('fxh-cloud ' + P.cls, '', b.x + (i - 1)*14, b.y + rnd(-5, 5), {scale:.3, opacity:.95});
        g.to(c, {scale:rnd(1.4, 1.9), opacity:0, y:'-=' + rnd(6, 14), duration:.7, delay:i*.06, ease:'power1.out', onComplete:()=> kill(c)}); }
      if(P.glyph) for(let i = 0; i < 3; i++){ const z = bit('fxh-zz', P.glyph, b.x + 8 + i*7, b.y - 6, {scale:.5 + i*.15, opacity:0});
        g.to(z, {opacity:1, duration:.1, delay:.1 + i*.16}); g.to(z, {x:'+=' + (6 + i*4), y:'-=' + (18 + i*8), rotation:-12, duration:.6, delay:.1 + i*.16, ease:'sine.out'});
        g.to(z, {opacity:0, duration:.2, delay:.5 + i*.16, onComplete:()=> kill(z)}); }
      else spray14(b.x, b.y, {n:5, cls:'fxh-dot venom', a0:30, a1:150, d0:6, d1:16, grav:14, dur:.42});
      res(); }, total + 30);
  });
  p.miss = ()=>{ h.missed = true; };
  return p;
};
css('powder1', `
.fxh-spore{width:7px; height:7px; margin:-3.5px; border-radius:50%;}
.fxh-spore.sleep{background:radial-gradient(circle, #ffffff, #d9c8ff 50%, rgba(170,140,255,0) 75%); box-shadow:0 0 4px rgba(190,170,255,.7);}
.fxh-spore.poison{background:radial-gradient(circle, #f4ffd0, #a6e04a 50%, rgba(120,200,40,0) 75%); box-shadow:0 0 4px rgba(150,220,70,.6);}
.fxh-cloud{width:34px; height:34px; margin:-17px; border-radius:50%;}
.fxh-cloud.sleep{background:radial-gradient(circle, rgba(225,214,255,.8), rgba(170,150,245,.4) 50%, rgba(170,150,245,0) 72%);}
.fxh-cloud.poison{background:radial-gradient(circle, rgba(196,240,120,.75), rgba(120,190,60,.38) 50%, rgba(120,190,60,0) 72%);}
.fxh-zz{font:700 13px/1 system-ui, sans-serif; color:#efe8ff; text-shadow:0 0 3px #6b4fc8, 0 1px 0 #3a2a80; margin:-7px -4px;}
`);
function powder1Event(ev, env){
  const T = ev.type;
  if(T === 'evaded' && ev.ranged && ev.attUid != null){ const k = String(ev.attUid), b = POWDER1.get(k); if(b){ POWDER1.delete(k); if(Date.now() - b.t < 1500) b.h.missed = true; } return; }
  if(T !== 'powder' || !env.fxAtLeast('low')) return;
  const from = env.el(ev.uid), to = ev.targetUid != null ? env.el(ev.targetUid) : null; if(!from || !to) return;
  M.powderPuff(from, to, {element: ev.element, uid: ev.uid, speed: Math.max(1, (env.match && env.match.speedMult) || 1)});
}

// ---- the game's side: events and hooks ----
const isMine = side=>{ try{ if(typeof trSideMine === 'function') return !!trSideMine(side); }catch(e){} return side === 'A'; };
const pillOf = (res, side)=> document.getElementById('hud' + res + 'Pill' + (isMine(side) ? '' : 'Enemy')) || document.getElementById(isMine(side) ? 'fieldResMine' : 'fieldResEnemy') || hq(side);
function fx14Event(ev, env){
  const T = ev.type, el = env.el;
  // a dodged bolt sails past (its spit is still charging when the 'evaded' arrives)
  if(T === 'evaded' && ev.ranged && ev.attUid != null){ const k = String(ev.attUid), b = FX14.bolts.get(k); if(b){ FX14.bolts.delete(k); if(Date.now() - b.t < 1500) b.h.missed = true; } }
  if(T === 'bolt' && ev.element === 'shock'){ FX14.shock.set(String(ev.uid), Date.now()); if(FX14.shock.size > 24) FX14.shock.delete(FX14.shock.keys().next().value); return; }
  if((T === 'hit' || T === 'hitHQ' || T === 'evaded') && ev.ranged && ev.attUid != null && FX14.shock.has(String(ev.attUid))){
    const t0 = FX14.shock.get(String(ev.attUid)); FX14.shock.delete(String(ev.attUid)); if(Date.now() - t0 > 1500 || !env.fxAtLeast('low')) return;
    const tgt = T === 'hitHQ' ? hq(ev.targetSide) : el(ev.targetUid); if(tgt) M.shockBolt(el(ev.attUid), tgt, {impactMs:env.hitAtMs(ev), miss:T === 'evaded'}); return; }
  if(T === 'arrow' && ev.volley && env.fxAtLeast('med') && env.once('fxh-volley' + ev.uid)){ const s = el(ev.uid);
    if(s){ const sp = Math.max(1, (env.match && env.match.speedMult) || 1); M.volleyLoose(s, {draw:Math.round(234/sp)}); } return; }
  if(!env.fxAtLeast('med')) return;
  const fx = env.fxOf(ev.defId) || {}, src = ev.uid != null ? el(ev.uid) : null;
  if(T === 'lumber' && ev.cause === 'forestry' && src && env.once('fxh-forestry' + ev.uid)){ M.forestryLog(src, pillOf('Lumber', ev.side), {n:ev.amount}); return; }
  if(T === 'gold' && (ev.why === 'prospecting' || ev.why === 'delivery') && src){ M.coinFlip(src, pillOf('Gold', ev.side), {n:ev.amount}); return; }
  if(T === 'sk2' && ev.kind === 'plunder' && src){ const from = document.getElementById('hudGoldPill' + (isMine(ev.targetSide) ? '' : 'Enemy')) || hq(ev.targetSide); if(from) M.plunderCoins(from, src, {n:ev.amount}); return; }
  if(T === 'stone' && ev.cause === 'quarrying' && src){ M.oreChip(src, pillOf('Stone', ev.side), {res:'stone'}); return; }
  if(T === 'metal' && ev.cause === 'mining' && src){ M.oreChip(src, pillOf('Metal', ev.side), {res:'metal'}); return; }
  if(T === 'stone' && !ev.cause && fx.masonry && src && env.once('fxh-mason' + ev.uid)){ M.anvilSpark(src, {product:'stone'}); return; }
  if(T === 'metal' && !ev.cause && (fx.refining || fx.smelter) && src && env.once('fxh-refine' + ev.uid)){ M.anvilSpark(src, {product:'metal'}); return; }
  if(T === 'pearl' && src){ M.pearlGlint(src, {dest:pillOf('Pearl', ev.side)}); return; }
}
// Barter and Pearls paying for a card: the resource pills are redrawn (fieldResSideHTML calls this hook with the side's numbers); Gold
// that went down with no Plunder just before (Barter) flips a coin out of the Gold pill, Pearls that went down glint out of theirs.
M.hooks.fieldRes = function(m, pid, p, mine, env){
  if(!m || !p) return; const now = {m, gold:Math.max(0, p.gold || 0), pearls:Math.max(0, p.pearls || 0)}, last = FX14.res.get(pid); FX14.res.set(pid, now);
  if(!last || last.m !== m || !env || !env.fxAtLeast('med')) return;
  const dg = last.gold - now.gold, dp = last.pearls - now.pearls; if(!(dg > 0) && !(dp > 0)) return;
  const sfx = mine ? '' : 'Enemy', box = mine ? 'fieldResMine' : 'fieldResEnemy', plundered = Date.now() - FX14.plunderAt < 2500;
  const run = ()=>{
    const barter = (()=>{ try{ return m.engine.allBoardCards(p).some(c=> c && !c.gap && c.hp > 0 && m.engine.effectsOf(c).barter); }catch(e){ return false; } })();
    if(dg > 0 && !plundered && barter){ const e = document.getElementById('hudGoldPill' + sfx); if(e) M.coinFlip(e, null, {spend:true, n:dg}); }
    if(dp > 0){ const e = document.getElementById('hudPearlPill' + sfx) || document.getElementById(box); if(e) M.pearlGlint(e, {spend:true}); } };
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(()=> later(run, 30)); else later(run, 50);
};

// ---- end of effects ----
})(typeof window !== 'undefined' ? window : globalThis);
