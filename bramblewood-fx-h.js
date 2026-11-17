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
     FX.H.forestryLog / coinFlip / plunderCoins / anvilSpark / pearlGlint   Forestry, Gold (Prospecting, Delivery), Plunder,
                                                       Masonry / Refining, Pearls
   Cues (SoundKit, built from its tone / noise / sweep primitives, SoundKit.prim): crabClack, geigerSoft, mendChime, hymnBell, gorgeGulp;
   FX14: boltFire, boltIce, boltAcid, boltPoison, spitfire, arrowSlash, venomPuff, crystalPop, logTumble, coinFlip, anvilTink, pearlChime.
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
  if(fx14Event(ev, env)) return; // FX14 (2026-11-17): the volley's loose and the resource skills (section 5)
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

// ---- end of effects ----
})(typeof window !== 'undefined' ? window : globalThis);
