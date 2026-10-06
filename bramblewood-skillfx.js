// Skill effects (2026-10-06): choreographed combat-skill animations, shared by the game and the
// Effects Lab. Each takes real DOM elements (a board card, a castle tile, any box) and plays on
// fixed-position overlays, so a re-render underneath can't cut it off. GSAP drives the motion;
// without it every effect still fires its callbacks on time.
//
//   SkillFX.bowShot(shooter, target, {fire, draw, flight, onRelease, onImpact, light})
//   SkillFX.volley(shooter, targets, opts)      SkillFX.pierce(shooter, first, second, opts)
//   SkillFX.dart(shooter, target, opts)         SkillFX.frostBolt(shooter, target, opts)
//   SkillFX.lightning(shooter, targets, opts)   SkillFX.heal(target, opts)
//   SkillFX.shieldUp(target, opts)              SkillFX.rally(cards, opts)
//
// `light(x, y, rgb, big)` is optional: the game passes its battlefield point-light so impacts
// light up the felt. Times are in ms and already scaled by the caller for battle speed.
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const reduce = ()=> !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const centre = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const layer = (cls, html)=>{ const e = document.createElement('div'); e.className = 'sfx ' + cls; e.setAttribute('aria-hidden', 'true'); if(html) e.innerHTML = html; document.body.appendChild(e); return e; };
const IMG = {arrow:'', fire:''};
// delayedCall follows GSAP's global time scale (slow motion in the Lab, hit-stop in the game)
const later = (fn, ms)=>{ const run = ()=>{ try{ fn && fn(); }catch(e){} }; const g = G(); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };

// A point somewhere on the target's body, not dead centre, so volleys spread.
function aimPoint(target){
  const c = centre(target);
  return {x: c.r.left + c.w*(0.36 + Math.random()*0.28), y: c.r.top + c.h*(0.34 + Math.random()*0.3)};
}
// Splinters / sparks bursting from a point, thrown back along the shot's direction.
function burst(x, y, ang, kind, n){
  const g = G(); if(!g || reduce()) return;
  for(let i = 0; i < (n||8); i++){
    const p = layer('sfx-bit sfx-bit-' + kind);
    const a = (ang + 180 + (Math.random()*120 - 60)) * Math.PI/180, d = 18 + Math.random()*34;
    g.set(p, {x:x - 3, y:y - 3, rotation:Math.random()*360, opacity:1, scale:kind==='fire' ? 1.2 : 1});
    g.to(p, {x:`+=${Math.cos(a)*d}`, y:`+=${Math.sin(a)*d + (kind==='fire' ? -16 : 10)}`, rotation:`+=${Math.random()*200-100}`, opacity:0, scale:.3,
      duration:.35 + Math.random()*.25, ease:'power2.out', onComplete:()=> p.remove()});
  }
}
function ring(x, y, cls, size, ms){
  const g = G(); const r = layer('sfx-ring ' + (cls||''));
  if(!g){ later(()=> r.remove(), ms||400); return; }
  g.set(r, {x:x, y:y, xPercent:-50, yPercent:-50, width:8, height:8, opacity:.95});
  g.to(r, {width:size||70, height:size||70, opacity:0, duration:(ms||420)/1000, ease:'power2.out', onComplete:()=> r.remove()});
}
// The target reacts to a hit: knocked back along the shot, squashes, springs back.
function knock(target, ang, power){
  const g = G(); if(!g || reduce()) return;
  const t = tileOf(target); const k = power||1;
  const dx = Math.cos(ang*Math.PI/180)*8*k, dy = Math.sin(ang*Math.PI/180)*8*k;
  g.timeline().to(t, {x:dx, y:dy, rotation:dx*0.6, scaleX:1 + 0.05*k, scaleY:1 - 0.07*k, duration:.06, ease:'power2.out'})
    .to(t, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, duration:.42, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
}

// ---- Arrow / Fire Arrow --------------------------------------------------------------------
// 1 Draw: the archer leans back away from the target while an arrow, nocked at its centre, is
//   pulled back along the line of fire (fire arrows light up and flicker at the tip).
// 2 Release + recoil: the arrow leaves; the archer snaps forward then kicks back; a bowstring
//   ring pops at the release point.
// 3 Flight: accelerating, with a slight arc and a speed streak (fire arrows shed embers).
// 4 Impact: the arrow sticks and quivers, the target is knocked back, splinters (or a burst of
//   flame and an ignite ring) fly, then the arrow fades.
function bowShot(shooter, target, o){
  o = o || {};
  const draw = o.draw == null ? 240 : o.draw, flight = o.flight == null ? 260 : o.flight;
  const g = G();
  if(!shooter || !target || !g){ later(o.onRelease, draw); later(o.onImpact, draw + flight); return; }
  const s = centre(shooter), aim = aimPoint(target);
  const ang = Math.atan2(aim.y - s.y, aim.x - s.x) * 180/Math.PI, rad = ang*Math.PI/180;
  const ux = Math.cos(rad), uy = Math.sin(rad);
  const W = 76, H = 27;
  const src = o.fire ? (IMG.fire || IMG.arrow) : IMG.arrow;
  const a = layer('sfx-arrow' + (o.fire ? ' is-fire' : ''), src ? `<img src="${src}" alt="">` : '<span class="sfx-arrow-glyph">➶</span>');
  const tile = tileOf(shooter);
  // nocked: rotated about its own centre, tail at the shooter's centre, tip toward the target
  const nockX = s.x + ux*W*0.42 - W/2, nockY = s.y + uy*W*0.42 - H/2;
  g.set(a, {x:nockX, y:nockY, rotation:ang, transformOrigin:'50% 50%', opacity:0, scaleX:.8});
  const tl = g.timeline();
  // 1) draw
  tl.to(a, {opacity:1, duration:Math.min(.08, draw/1000*0.3)}, 0)
    .to(a, {x:nockX - ux*16, y:nockY - uy*16, scaleX:.92, duration:draw/1000, ease:'power2.out'}, 0);
  if(!reduce()) tl.to(tile, {x:-ux*9, y:-uy*9, rotation:-ux*3, scaleY:.97, duration:draw/1000, ease:'power2.out'}, 0);
  if(o.fire){
    const flame = layer('sfx-tipflame');
    const tipX = ()=> (g.getProperty(a, 'x') + W/2 + ux*W*0.46), tipY = ()=> (g.getProperty(a, 'y') + H/2 + uy*W*0.46);
    const follow = ()=>{ g.set(flame, {x:tipX() - 9, y:tipY() - 9}); };
    g.ticker.add(follow);
    g.fromTo(flame, {scale:.3, opacity:0}, {scale:1, opacity:1, duration:draw/1000, ease:'power1.out'});
    later(()=>{ g.ticker.remove(follow); flame.remove(); }, draw + 20);
  }
  // 2) release + recoil
  tl.add(()=>{
    ring(s.x - ux*6, s.y - uy*6, 'sfx-string', 46, 320);
    if(o.onRelease) try{ o.onRelease(); }catch(e){}
  }, draw/1000);
  if(!reduce()) tl.to(tile, {x:ux*7, y:uy*7, rotation:ux*2, scaleY:1.02, duration:.06, ease:'power3.out'}, draw/1000)
    .to(tile, {x:-ux*4, y:-uy*4, rotation:-ux*1, scaleY:1, duration:.09, ease:'power1.inOut'}, draw/1000 + .06)
    .to(tile, {x:0, y:0, rotation:0, duration:.28, ease:'elastic.out(1, 0.5)', clearProps:'transform'}, draw/1000 + .15);
  // 3) flight — a slight arc: lift then drop, applied as a separate y tween
  const endX = aim.x - ux*W*0.36 - W/2, endY = aim.y - uy*W*0.36 - H/2;   // tip buried a little in the target
  const dist = Math.hypot(aim.x - s.x, aim.y - s.y), lift = Math.min(28, dist*0.08) * (Math.abs(ux) > 0.4 ? 1 : 0.4);
  tl.to(a, {x:endX, duration:flight/1000, ease:'power2.in'}, draw/1000)
    .to(a, {y:endY, duration:flight/1000, ease:'power2.in'}, draw/1000)
    .fromTo(a, {scaleX:1.25}, {scaleX:1.1, duration:flight/1000, ease:'none'}, draw/1000);
  if(lift > 4) tl.to(a, {keyframes:[{marginTop:-lift, duration:flight/2000, ease:'power1.out'}, {marginTop:0, duration:flight/2000, ease:'power1.in'}]}, draw/1000);
  if(o.fire && !reduce()){
    for(let i = 0; i < 8; i++){
      const t = (i + 1) / 9, e = layer('sfx-ember');
      const ex = s.x + (aim.x - s.x)*t*t, ey = s.y + (aim.y - s.y)*t*t;
      g.set(e, {x:ex - 3, y:ey - 3, opacity:0});
      g.to(e, {opacity:1, duration:.04, delay:(draw + flight*Math.sqrt(t))/1000});
      g.to(e, {y:`-=${14 + Math.random()*16}`, x:`+=${Math.random()*10 - 5}`, opacity:0, scale:.25, duration:.5, delay:(draw + flight*Math.sqrt(t))/1000 + .04, ease:'power1.out', onComplete:()=> e.remove()});
    }
  }
  // 4) impact
  tl.add(()=>{
    knock(target, ang, o.fire ? 1.2 : 1);
    burst(aim.x, aim.y, ang, o.fire ? 'fire' : 'wood', o.fire ? 12 : 7);
    if(o.fire){ ring(aim.x, aim.y, 'sfx-ignite', 90, 520); const t = tileOf(target); t.classList.add('sfx-scorch'); later(()=> t.classList.remove('sfx-scorch'), 900); }
    if(o.light) try{ o.light(aim.x, aim.y, o.fire ? [1, 0.55, 0.18] : [1, 0.88, 0.62], !!o.fire); }catch(e){}
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
  }, (draw + flight)/1000);
  tl.set(a, {scaleX:1}, (draw + flight)/1000)
    .to(a, {keyframes:[{rotation:ang + 7, duration:.05}, {rotation:ang - 5, duration:.06}, {rotation:ang + 2, duration:.07}, {rotation:ang, duration:.08}]}, (draw + flight)/1000)
    .to(a, {opacity:0, duration:.3, ease:'power1.in'}, (draw + flight)/1000 + .45)
    .add(()=> a.remove());
  return tl;
}

// Three arrows lofted high, landing one after another on up to three targets.
function volley(shooter, targets, o){
  o = o || {}; const list = (targets||[]).filter(Boolean); if(!list.length) return;
  list.slice(0, 3).forEach((t, i)=> later(()=> bowShot(shooter, t, Object.assign({}, o, {draw: i ? 90 : (o.draw||240), onRelease: i ? null : o.onRelease, onImpact: ()=> o.onEachImpact && o.onEachImpact(t, i)})), i*120));
}
// One arrow through the first target into the one behind it.
function pierce(shooter, first, second, o){
  o = o || {};
  bowShot(shooter, first, Object.assign({}, o, {onImpact: ()=>{
    if(o.onFirst) o.onFirst();
    if(second) bowShot(first, second, {draw:0, flight:(o.flight||260)*0.8, fire:o.fire, light:o.light, onImpact:o.onSecond});
  }}));
}
// A thin green dart with a dripping trail; a poison splash on hit.
function dart(shooter, target, o){
  o = o || {}; const g = G(); const s = centre(shooter), aim = aimPoint(target);
  const flight = o.flight || 220;
  if(!g){ later(o.onImpact, flight); return; }
  const ang = Math.atan2(aim.y - s.y, aim.x - s.x) * 180/Math.PI;
  const d = layer('sfx-dart'); g.set(d, {x:s.x - 14, y:s.y - 2, rotation:ang, transformOrigin:'90% 50%'});
  g.to(d, {x:aim.x - 26, y:aim.y - 2, duration:flight/1000, ease:'power1.in', onComplete:()=>{
    d.remove(); knock(target, ang, .6); burst(aim.x, aim.y, ang, 'poison', 10); ring(aim.x, aim.y, 'sfx-poison', 60, 500);
    if(o.light) o.light(aim.x, aim.y, [0.5, 1, 0.35], false);
    if(o.onImpact) o.onImpact();
  }});
  for(let i = 1; i < 6; i++){ const p = layer('sfx-bit sfx-bit-poison'); const t = i/6;
    g.set(p, {x:s.x + (aim.x - s.x)*t, y:s.y + (aim.y - s.y)*t, opacity:0});
    g.to(p, {opacity:.9, duration:.03, delay:flight/1000*t}); g.to(p, {y:'+=18', opacity:0, duration:.45, delay:flight/1000*t + .03, ease:'power1.in', onComplete:()=> p.remove()}); }
}
// An ice shard that spins in, shatters into frost and leaves a frost crack on the card.
function frostBolt(shooter, target, o){
  o = o || {}; const g = G(); const s = centre(shooter), aim = aimPoint(target);
  const flight = o.flight || 300;
  if(!g){ later(o.onImpact, flight); return; }
  const b = layer('sfx-shard'); g.set(b, {x:s.x - 12, y:s.y - 12, scale:.4, rotation:0});
  g.to(b, {x:aim.x - 12, y:aim.y - 12, scale:1.1, rotation:540, duration:flight/1000, ease:'power2.in', onComplete:()=>{
    b.remove(); knock(target, Math.atan2(aim.y - s.y, aim.x - s.x)*180/Math.PI, .8);
    burst(aim.x, aim.y, Math.atan2(aim.y - s.y, aim.x - s.x)*180/Math.PI, 'ice', 12); ring(aim.x, aim.y, 'sfx-frost', 96, 600);
    const t = tileOf(target); t.classList.add('sfx-frosted'); later(()=> t.classList.remove('sfx-frosted'), 1400);
    if(o.light) o.light(aim.x, aim.y, [0.45, 0.75, 1], true);
    if(o.onImpact) o.onImpact();
  }});
}
// A forked bolt that jumps from card to card.
function lightning(shooter, targets, o){
  o = o || {}; const chain = [shooter].concat((targets||[]).filter(Boolean)); if(chain.length < 2) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'sfx sfx-bolt'); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', innerWidth); svg.setAttribute('height', innerHeight); document.body.appendChild(svg);
  const jag = (a, b)=>{ let d = `M${a.x},${a.y}`; const n = 7; for(let i = 1; i < n; i++){ const t = i/n; const nx = -(b.y - a.y), ny = b.x - a.x, L = Math.hypot(nx, ny)||1;
    const off = (Math.random()*2 - 1) * 16; d += ` L${a.x + (b.x - a.x)*t + nx/L*off},${a.y + (b.y - a.y)*t + ny/L*off}`; } return d + ` L${b.x},${b.y}`; };
  chain.slice(1).forEach((t, i)=> later(()=>{
    const A = centre(chain[i]), B = centre(t);
    for(let k = 0; k < 3; k++) later(()=>{ svg.innerHTML = `<path d="${jag(A, B)}" class="glow"/><path d="${jag(A, B)}"/>`; }, k*55);
    later(()=>{ knock(t, Math.atan2(B.y - A.y, B.x - A.x)*180/Math.PI, .7); ring(B.x, B.y, 'sfx-zap', 70, 300); burst(B.x, B.y, 0, 'zap', 8);
      if(o.light) o.light(B.x, B.y, [0.75, 0.85, 1], true); if(o.onEachImpact) o.onEachImpact(t, i); }, 60);
  }, i*190));
  later(()=> svg.remove(), chain.length*190 + 220);
}
// Green rings and rising pluses; the card brightens for a beat.
function heal(target, o){
  o = o || {}; const g = G(); const c = centre(target);
  ring(c.x, c.y, 'sfx-heal', 110, 700); later(()=> ring(c.x, c.y, 'sfx-heal', 80, 600), 150);
  if(!g){ later(o.onDone, 600); return; }
  for(let i = 0; i < 8; i++){ const p = layer('sfx-plus', '+'); g.set(p, {x:c.r.left + c.w*(0.15 + Math.random()*0.7), y:c.r.top + c.h*(0.5 + Math.random()*0.4), opacity:0, scale:.6});
    g.to(p, {y:'-=46', opacity:1, scale:1, duration:.35, delay:i*0.06, ease:'power1.out'}); g.to(p, {opacity:0, duration:.3, delay:i*0.06 + .45, onComplete:()=> p.remove()}); }
  const t = tileOf(target); g.fromTo(t, {filter:'brightness(1)'}, {filter:'brightness(1.35)', duration:.2, yoyo:true, repeat:1, clearProps:'filter', onComplete:o.onDone});
}
// A translucent shield dome flashes over the card and settles.
function shieldUp(target, o){
  o = o || {}; const g = G(); const c = centre(target);
  const d = layer('sfx-dome'); if(!g){ later(()=> d.remove(), 600); return; }
  g.set(d, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:c.w*1.2, height:c.h*1.15, scale:.6, opacity:0});
  g.timeline({onComplete:()=> d.remove()}).to(d, {scale:1.05, opacity:1, duration:.16, ease:'back.out(2)'}).to(d, {scale:1, duration:.12}).to(d, {opacity:0, duration:.45, delay:.35});
  if(o.light) o.light(c.x, c.y, [0.75, 0.85, 1], false);
}
// A banner pops above the leader and golden chevrons rise through every ally.
function rally(cards, o){
  o = o || {}; const g = G(); const list = (cards||[]).filter(Boolean); if(!list.length || !g) return;
  const lead = centre(list[0]); const f = layer('sfx-banner', '🚩');
  g.set(f, {x:lead.x - 16, y:lead.r.top - 44, scale:.2, rotation:-20, opacity:0});
  g.timeline({onComplete:()=> f.remove()}).to(f, {scale:1.1, rotation:0, opacity:1, duration:.25, ease:'back.out(3)'}).to(f, {rotation:6, yoyo:true, repeat:3, duration:.12}).to(f, {opacity:0, y:'-=20', duration:.3});
  list.forEach((el, i)=> later(()=>{ const c = centre(el);
    for(let k = 0; k < 3; k++){ const ch = layer('sfx-chevron', '︽'); g.set(ch, {x:c.x - 10, y:c.r.bottom - 16 - k*10, opacity:0});
      g.to(ch, {y:`-=${c.h*0.8}`, opacity:1, duration:.45, delay:k*0.08, ease:'power1.out'}); g.to(ch, {opacity:0, duration:.25, delay:k*0.08 + .4, onComplete:()=> ch.remove()}); }
    const t = tileOf(el); g.fromTo(t, {y:0}, {y:-6, duration:.16, yoyo:true, repeat:1, ease:'power1.out', clearProps:'transform'});
  }, 160 + i*90));
}
function setImages(arrow, fire){ IMG.arrow = arrow || ''; IMG.fire = fire || ''; }
root.SkillFX = {bowShot, volley, pierce, dart, frostBolt, lightning, heal, shieldUp, rally, setImages, knock, burst, ring};
})(typeof window !== 'undefined' ? window : globalThis);
