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
// Green rings and rising ➕ (2026-10-16, user: "The heal animation should include the + emoji."); the card brightens for a beat.
function heal(target, o){
  o = o || {}; const g = G(); const c = centre(target);
  ring(c.x, c.y, 'sfx-heal', 110, 700); later(()=> ring(c.x, c.y, 'sfx-heal', 80, 600), 150);
  if(!g){ later(o.onDone, 600); return; }
  for(let i = 0; i < 8; i++){ const p = layer('sfx-plus', '➕') /* the heal's ➕ (2026-10-16) */; g.set(p, {x:c.r.left + c.w*(0.15 + Math.random()*0.7), y:c.r.top + c.h*(0.5 + Math.random()*0.4), opacity:0, scale:.6});
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
// ---- 2026-10-10 additions (from the VFX Playground) --------------------------------------------
// A point on a quadratic curve, so throws can arc without a plugin.
const qpt = (a, m, b, t)=> ({x:(1-t)*(1-t)*a.x + 2*(1-t)*t*m.x + t*t*b.x, y:(1-t)*(1-t)*a.y + 2*(1-t)*t*m.y + t*t*b.y});
// Feathers knocked loose from a flier.
function feathers(x, y, n){
  const g = G(); if(!g || reduce()) return;
  for(let i = 0; i < (n||10); i++){ const f = layer('sfx-feather'); const a = (200 + Math.random()*140)*Math.PI/180, v = 40 + Math.random()*70;
    g.set(f, {x, y, rotation:Math.random()*360, opacity:1});
    g.to(f, {x:`+=${Math.cos(a)*v}`, y:`+=${Math.sin(a)*v*0.6 + 60}`, rotation:`+=${Math.random()*540-270}`, opacity:0, duration:1.1 + Math.random()*.5, ease:'power1.out', onComplete:()=> f.remove()}); }
}
// Anti-Air: a spinning boomerang hooks up into the flier on a low curve, knocks feathers loose and swings
// back to the thrower on a higher one.
function boomerang(shooter, target, o){
  o = o || {}; const g = G(); const a = centre(shooter), b = centre(target);
  if(!g || reduce()){ o.onImpact && o.onImpact(); return; }
  const bm = layer('sfx-boomerang', '🪃'); const out = (o.flight || 520)/1000, back = out*1.25;
  const m1 = {x:(a.x + b.x)/2 + (b.y - a.y)*0.25, y:Math.max(a.y, b.y) + 30}, m2 = {x:(a.x + b.x)/2 - (b.y - a.y)*0.2, y:Math.min(a.y, b.y) - 80};
  const s = {t:0}; g.set(bm, {x:a.x, y:a.y, xPercent:-50, yPercent:-50});
  const tl = g.timeline({onComplete:()=> bm.remove()});
  tl.to(s, {t:1, duration:out, ease:'power1.in', onUpdate:()=>{ const p = qpt(a, m1, b, s.t); g.set(bm, {x:p.x, y:p.y}); }})
    .to(bm, {rotation:`+=${360*4}`, duration:out + back, ease:'none'}, 0)
    .add(()=>{ feathers(b.x, b.y, 12); knock(target, -60, 1); if(o.light) o.light(b.x, b.y, [1, 0.95, 0.8], false); o.onImpact && o.onImpact(); }, out)
    .add(()=>{ s.t = 0; }, out)
    .to(s, {t:1, duration:back, ease:'power2.out', onUpdate:()=>{ const p = qpt(b, m2, a, s.t); g.set(bm, {x:p.x, y:p.y}); }}, out)
    .to(bm, {scale:.5, opacity:0, duration:.12}, out + back - .12);
}
// Boomerang flights (2026-10-13, user: "Hits PAST the enemy, flying far ahead. If its castle, it flies towards the castle,
// bounces, that goes north past the map. Then it comes from the top of the map on the next turn"). Throw: it curves into the
// target, hits, and keeps going far past it, off the screen. Castle: it hits the castle, bounces up and flies out the top.
// Return: next round it drops in from the top of the screen above the target, hits, and spins home to the thrower.
function boomerangThrow(shooter, target, o){
  o = o || {}; const g = G(); const a = centre(shooter), b = centre(target);
  if(!g || reduce()){ o.onImpact && o.onImpact(); return; }
  const bm = layer('sfx-boomerang', '🪃'); const out = (o.flight || 520)/1000;
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, H = innerHeight, W = innerWidth;
  const far = {x: b.x + dx/L * Math.max(W, H), y: b.y + dy/L * Math.max(W, H)};
  const m1 = {x:(a.x + b.x)/2 + dy*0.22, y:(a.y + b.y)/2 - dx*0.22};
  const s = {t:0}; g.set(bm, {x:a.x, y:a.y, xPercent:-50, yPercent:-50});
  const tl = g.timeline({onComplete:()=> bm.remove()});
  tl.to(s, {t:1, duration:out, ease:'power1.in', onUpdate:()=>{ const p = qpt(a, m1, b, s.t); g.set(bm, {x:p.x, y:p.y}); }})
    .to(bm, {rotation:`+=${360*5}`, duration:out + .7, ease:'none'}, 0)
    .add(()=>{ feathers(b.x, b.y, 10); knock(target, dy < 0 ? -60 : 60, 1); if(o.light) o.light(b.x, b.y, [1, 0.95, 0.8], false); o.onImpact && o.onImpact(); }, out)
    .to(bm, {x:far.x, y:far.y, duration:.7, ease:'power1.in'}, out);
}
function boomerangCastle(shooter, castle, o){
  o = o || {}; const g = G(); const a = centre(shooter), b = centre(castle);
  if(!g || reduce()){ o.onImpact && o.onImpact(); return; }
  const bm = layer('sfx-boomerang', '🪃'); const out = (o.flight || 520)/1000;
  const m1 = {x:(a.x + b.x)/2 + 40, y:(a.y + b.y)/2};
  const s = {t:0}; g.set(bm, {x:a.x, y:a.y, xPercent:-50, yPercent:-50});
  g.timeline({onComplete:()=> bm.remove()})
    .to(s, {t:1, duration:out, ease:'power1.in', onUpdate:()=>{ const p = qpt(a, m1, b, s.t); g.set(bm, {x:p.x, y:p.y}); }})
    .to(bm, {rotation:`+=${360*5}`, duration:out + .8, ease:'none'}, 0)
    .add(()=>{ knock(castle, -40, 0.8); ring(b.x, b.y, 'sfx-ring-dust', 60, 420); o.onImpact && o.onImpact(); }, out)
    .to(bm, {x:b.x + 30, y:b.y + 26, duration:.12, ease:'power2.out'}, out)
    .to(bm, {x:b.x + 60, y:-120, duration:.65, ease:'power2.in'}, out + .12);
}
function boomerangReturn(thrower, target, o){
  o = o || {}; const g = G(); const a = centre(thrower), b = centre(target);
  if(!g || reduce()){ o.onImpact && o.onImpact(); return; }
  const bm = layer('sfx-boomerang', '🪃'); const down = .45, home = (o.flight || 520)/1000 * 1.15;
  g.set(bm, {x:b.x - 40, y:-80, xPercent:-50, yPercent:-50});
  const m2 = {x:(a.x + b.x)/2 - (b.y - a.y)*0.2, y:(a.y + b.y)/2};
  const s = {t:0};
  g.timeline({onComplete:()=> bm.remove()})
    .to(bm, {x:b.x, y:b.y, duration:down, ease:'power2.in'})
    .to(bm, {rotation:`+=${360*5}`, duration:down + home, ease:'none'}, 0)
    .add(()=>{ feathers(b.x, b.y, 8); knock(target, -40, 0.9); o.onImpact && o.onImpact(); }, down)
    .to(s, {t:1, duration:home, ease:'power2.out', onUpdate:()=>{ const p = qpt(b, m2, a, s.t); g.set(bm, {x:p.x, y:p.y}); }}, down)
    .to(bm, {scale:.5, opacity:0, duration:.12}, down + home - .12);
}
// Shield Call: a big round shield drops from above into a slot and lands with a dust ring.
function shieldDrop(target, o){
  o = o || {}; const g = G(); const c = centre(target);
  const sh = layer('sfx-shield-drop', '🛡️');
  if(!g || reduce()){ later(()=> sh.remove(), 500); return; }
  g.set(sh, {x:c.x, y:c.r.top - 140, xPercent:-50, yPercent:-50, scale:1.4, rotation:-25, opacity:0});
  g.timeline({onComplete:()=> sh.remove()})
    .to(sh, {opacity:1, duration:.08})
    .to(sh, {y:c.y, rotation:0, scale:1, duration:.32, ease:'power3.in'}, 0)
    .add(()=>{ ring(c.x, c.r.bottom - 8, 'sfx-ring-dust', c.w*1.6, 520); knock(target, 90, 0.8); if(o.light) o.light(c.x, c.y, [0.8, 0.9, 1], true); }, .32)
    .to(sh, {scaleY:.82, scaleX:1.12, duration:.07, ease:'power2.out'}, .32).to(sh, {scaleY:1, scaleX:1, duration:.35, ease:'elastic.out(1, .4)'})
    .to(sh, {opacity:0, y:'-=10', duration:.35, delay:.25});
}
// Backstab: a dagger flashes in from the side the attacker came from and leaves a thin red slash.
function backstab(target, fromLeft, o){
  o = o || {}; const g = G(); const c = centre(target);
  const k = layer('sfx-dagger', '🗡️'), sl = layer('sfx-slash');
  if(!g || reduce()){ later(()=>{ k.remove(); sl.remove(); }, 400); return; }
  const sx = fromLeft ? -1 : 1;
  g.set(k, {x:c.x + sx*c.w*0.9, y:c.y - c.h*0.25, xPercent:-50, yPercent:-50, rotation:fromLeft ? 45 : -135, opacity:0});
  g.set(sl, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:c.w*1.1, rotation:fromLeft ? -28 : 28, scaleX:0, opacity:1});
  g.timeline({onComplete:()=>{ k.remove(); sl.remove(); }})
    .to(k, {opacity:1, x:c.x - sx*c.w*0.25, y:c.y + c.h*0.1, duration:.16, ease:'power3.in'})
    .add(()=>{ knock(target, fromLeft ? 0 : 180, 1.1); if(o.light) o.light(c.x, c.y, [1, 0.6, 0.55], false); }, .16)
    .to(sl, {scaleX:1, duration:.09, ease:'power2.out'}, .14)
    .to(k, {opacity:0, duration:.18}, .2).to(sl, {opacity:0, duration:.35}, .35);
}
// Element deaths: the card burns away (heat), shatters into ice (cold) or melts (poison), shedding embers / shards / drips.
function elementDeath(target, kind, o){
  o = o || {}; const g = G(); const c = centre(target); const t = tileOf(target);
  if(!g || reduce() || !t){ o.onDone && o.onDone(); return; }
  const col = kind === 'cold' ? 'sfx-bit-ice' : kind === 'poison' ? 'sfx-bit-drip' : 'sfx-bit-ember';
  for(let i = 0; i < 18; i++){ const p = layer('sfx-bit ' + col); const x = c.r.left + Math.random()*c.w, y = c.r.top + Math.random()*c.h;
    g.set(p, {x, y, opacity:1, rotation:Math.random()*360});
    const up = kind === 'heat' ? -(40 + Math.random()*60) : kind === 'cold' ? (Math.random()*80 - 20) : 30 + Math.random()*40;
    g.to(p, {x:`+=${(Math.random()-.5)*(kind === 'cold' ? 120 : 40)}`, y:`+=${up}`, opacity:0, rotation:`+=${Math.random()*180}`, duration:.7 + Math.random()*.5, delay:Math.random()*.35, ease:'power1.out', onComplete:()=> p.remove()}); }
  if(o.particlesOnly){ o.onDone && o.onDone(); return; }
  const v = kind === 'cold' ? {filter:'brightness(1.6) saturate(.2) hue-rotate(160deg)', duration:.18} : kind === 'poison' ? {filter:'hue-rotate(70deg) saturate(1.6)', duration:.25} : {filter:'brightness(1.4) sepia(1) saturate(4) hue-rotate(-20deg)', duration:.2};
  g.timeline({onComplete:()=> o.onDone && o.onDone()}).to(t, v)
    .to(t, kind === 'cold' ? {opacity:0, scale:1.08, duration:.25, ease:'steps(4)'} : kind === 'poison' ? {scaleY:.15, y:c.h*0.4, opacity:0, duration:.55, ease:'power2.in'} : {opacity:0, filter:'brightness(.2) sepia(1)', duration:.55, ease:'power1.in'});
}
// ---- 2026-10-14 additions: sixteen more skill effects and five general effects ---------------------------
// Each is named after a real skill key (PASSIVE_DEFS / SKILL_ICON). They bring their own small stylesheet
// (injected once, ids/classes all start with sfx-), so the game can call them without template changes.
// Every layer they add is removed when the effect ends; with reduced motion (or no GSAP) they skip the
// motion and still fire their callbacks.
//   SkillFX.swarm(attacker, target, opts)        SkillFX.regen(target, opts)
//   SkillFX.poisonCloud(target, opts)            SkillFX.bleedDrip(target, opts)
//   SkillFX.thorns(defender, attacker, opts)     SkillFX.earthquake(cards, opts{host})
//   SkillFX.quickStrike(attacker, target, opts)  SkillFX.evasiveDodge(target, opts{fromLeft, label})
//   SkillFX.cleave(attacker, targets, opts)      SkillFX.guardian(target, opts{dir})
//   SkillFX.dynamite(thrower, target, opts)      SkillFX.helmetDeflect(target, opts{from})
//   SkillFX.darksight(target, opts{targets})     SkillFX.frostChill(target, opts)
//   SkillFX.scorch(target, opts)                 SkillFX.lanternGlow(target, opts{cards})
// General:
//   SkillFX.shockwave(xOrEl, y, opts{cards})     SkillFX.castleCrumble(castle, opts{variant:'collapse'|'sink'|'topple', restore})
//   SkillFX.levelUp(target, opts{text})          SkillFX.unlockSparkle(target, opts)
//   SkillFX.skyDrop(cards, opts{onEachLand})
const MORE_CSS = `
.sfx-bug{width:8px; height:6px; border-radius:50%; background:radial-gradient(circle at 40% 40%, #5a4630, #1d150c 70%); box-shadow:-3px -3px 0 -1px rgba(230,240,255,.8), 3px -3px 0 -1px rgba(230,240,255,.8), 0 0 2px rgba(0,0,0,.5);}
.sfx-bug.is-gold{background:repeating-linear-gradient(90deg, #f2b62e 0 2px, #2a1c08 2px 4px); box-shadow:-3px -3px 0 -1px rgba(255,255,255,.9), 3px -3px 0 -1px rgba(255,255,255,.9), 0 0 3px rgba(60,40,0,.6);}
.sfx-mote{width:7px; height:7px; border-radius:50%; background:#c9ffb8; box-shadow:0 0 8px 3px rgba(90,230,110,.85);}
.sfx-stitch{overflow:visible;} .sfx-stitch path{fill:none; stroke:#bfffb0; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; filter:drop-shadow(0 0 4px rgba(90,230,110,.95));}
.sfx-puff{width:44px; height:44px; border-radius:50%; background:radial-gradient(circle at 45% 40%, rgba(190,255,140,.85), rgba(110,200,60,.55) 45%, rgba(80,160,40,0) 70%); filter:blur(2px);}
.sfx-bubble{width:7px; height:7px; border-radius:50%; border:1.5px solid rgba(190,255,150,.9); background:rgba(150,240,90,.15);}
.sfx-drop{width:9px; height:14px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 40% 65%, #ff8a7a, #c4141c 55%, #7a0810); box-shadow:0 0 4px rgba(200,20,20,.6);}
.sfx-splat{width:14px; height:4px; border-radius:50%; background:#9c0d14; opacity:.8;}
.sfx-thorn{width:9px; height:26px; background:linear-gradient(#e9f2b0, #6f9b2e 45%, #3d5a18); clip-path:polygon(50% 0, 100% 100%, 0 100%); transform-origin:50% 100%; filter:drop-shadow(0 0 3px rgba(40,60,10,.6));}
.sfx-quake{overflow:visible;} .sfx-quake path{fill:none; stroke-linecap:round; stroke-linejoin:round;}
.sfx-quake path.edge{stroke:rgba(255,226,170,.28); stroke-width:7; filter:blur(1px);} .sfx-quake path.gap{stroke:#140d07; stroke-width:3.2;}
.sfx-dust{width:22px; height:22px; border-radius:50%; background:radial-gradient(circle, rgba(214,190,150,.9), rgba(214,190,150,0) 70%);}
.sfx-speed{height:2px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95));}
.sfx-ghost{opacity:.35; filter:saturate(.4) brightness(1.4) blur(.5px); margin:0 !important;}
.sfx-ghost.is-blue{filter:sepia(1) hue-rotate(160deg) saturate(2) brightness(1.3) blur(.5px);}
.sfx-miss{font:900 15px 'Baloo 2',system-ui,sans-serif; color:#e8fff0; text-shadow:0 0 6px rgba(80,200,120,.9), 0 2px 0 rgba(0,0,0,.45); white-space:nowrap;}
.sfx-leaf{font-size:16px; line-height:1;}
.sfx-arc{overflow:visible;} .sfx-arc path{fill:none; stroke-linecap:round;}
.sfx-arc path.glow{stroke:rgba(255,214,120,.75); stroke-width:16; filter:blur(4px);} .sfx-arc path.core{stroke:#fffaf0; stroke-width:4;}
.sfx-wall{border-radius:10px 10px 4px 4px; border:2px solid rgba(190,220,255,.95); transform-origin:50% 100%;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='28' viewBox='0 0 16 28'%3E%3Cpath fill='none' stroke='%23dbeaff' stroke-opacity='.7' d='M8 0l8 4.6v9.2L8 18.4 0 13.8V4.6z M8 18.4V28'/%3E%3C/svg%3E"), linear-gradient(rgba(170,205,255,.55), rgba(120,160,255,.18));
  box-shadow:0 0 18px rgba(150,190,255,.8), inset 0 0 12px rgba(220,235,255,.7);}
.sfx-dyn{font-size:26px; line-height:1; filter:drop-shadow(0 3px 2px rgba(0,0,0,.4));}
.sfx-spark{width:4px; height:4px; border-radius:50%; background:#fff6b0; box-shadow:0 0 6px 2px rgba(255,190,60,.95);}
.sfx-flash{border-radius:50%; background:radial-gradient(circle, #fffef0 0, rgba(255,240,180,.9) 25%, rgba(255,160,40,.0) 70%);}
.sfx-fireball{border-radius:50%; background:radial-gradient(circle at 50% 55%, #fff4c0 0, #ffb330 30%, #e2531a 55%, rgba(120,40,20,.0) 72%); filter:blur(1px);}
.sfx-smoke{width:40px; height:40px; border-radius:50%; background:radial-gradient(circle, rgba(90,84,78,.75), rgba(90,84,78,0) 70%); filter:blur(2px);}
.sfx-ping{width:30px; height:30px; background:radial-gradient(circle, #fff 0 18%, rgba(255,240,170,.9) 26%, transparent 60%); clip-path:polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);}
.sfx-helmet{font-size:26px; line-height:1; filter:drop-shadow(0 2px 2px rgba(0,0,0,.45));}
.sfx-chip{width:6px; height:4px; background:#c9ced8; border-radius:1px;}
.sfx-dark{border-radius:14px; background:radial-gradient(ellipse at 50% 42%, rgba(10,6,20,.35), rgba(8,4,16,.9) 70%);}
.sfx-eye{width:15px; height:9px; border-radius:50%; background:radial-gradient(circle at 50% 50%, #12100a 0 26%, #e9ff6a 30%, #9bdc20 65%, rgba(155,220,32,0) 100%); box-shadow:0 0 12px 4px rgba(190,255,60,.7);}
.sfx-revealed{outline:2px solid rgba(200,255,90,.9); outline-offset:3px; box-shadow:0 0 16px rgba(190,255,60,.75) !important;}
.sfx-mist{width:70px; height:34px; border-radius:50%; background:radial-gradient(ellipse, rgba(225,245,255,.85), rgba(170,215,255,.35) 50%, rgba(170,215,255,0) 72%); filter:blur(3px);}
.sfx-flake{color:#eaf6ff; font-size:11px; line-height:1; text-shadow:0 0 5px rgba(150,210,255,.95);}
.sfx-rime{border-radius:12px; box-shadow:inset 0 0 0 2px rgba(220,240,255,.9), inset 0 0 28px 6px rgba(200,232,255,.85);}
.sfx-flame{width:14px; height:26px; transform-origin:50% 100%; border-radius:50% 50% 45% 45% / 65% 65% 35% 35%; background:radial-gradient(ellipse at 50% 80%, #fff2b0 0, #ffb62e 35%, #f0521c 65%, rgba(200,40,10,0) 80%); filter:blur(.5px); animation:sfxFlick .14s steps(2) infinite alternate;}
@keyframes sfxFlick{to{transform:scale(1.15, .88) skewX(6deg);}}
.sfx-haze{border-radius:12px; -webkit-backdrop-filter:blur(1.4px) brightness(1.12) saturate(1.3); backdrop-filter:blur(1.4px) brightness(1.12) saturate(1.3);
  -webkit-mask-image:repeating-linear-gradient(0deg, #000 0 5px, transparent 5px 11px); mask-image:repeating-linear-gradient(0deg, #000 0 5px, transparent 5px 11px); -webkit-mask-size:100% 22px; mask-size:100% 22px; animation:sfxHaze .5s linear infinite;}
@keyframes sfxHaze{to{-webkit-mask-position:0 -22px; mask-position:0 -22px;}}
.sfx-glowpool{border-radius:50%; background:radial-gradient(circle, rgba(255,226,140,.75), rgba(255,180,70,.35) 35%, rgba(255,160,60,0) 70%); mix-blend-mode:screen;}
.sfx-lantern{font-size:24px; line-height:1; transform-origin:50% -14px; filter:drop-shadow(0 0 8px rgba(255,190,80,.95));}
.sfx-moth{width:4px; height:3px; border-radius:50%; background:#fff3d6; box-shadow:0 0 4px rgba(255,240,200,.9);}
.sfx-wave{border-radius:50%; border:10px solid rgba(255,255,255,.12); -webkit-backdrop-filter:blur(2.5px) brightness(1.3) saturate(1.5); backdrop-filter:blur(2.5px) brightness(1.3) saturate(1.5);
  -webkit-mask-image:radial-gradient(circle, transparent 55%, #000 62%, #000 70%, transparent 76%); mask-image:radial-gradient(circle, transparent 55%, #000 62%, #000 70%, transparent 76%);}
.sfx-chunk{margin:0 !important; overflow:hidden;}
.sfx-rays{border-radius:50%; background:repeating-conic-gradient(rgba(255,226,120,.85) 0deg 7deg, rgba(255,226,120,0) 7deg 22deg); -webkit-mask-image:radial-gradient(circle, #000 18%, transparent 68%); mask-image:radial-gradient(circle, #000 18%, transparent 68%);}
.sfx-ribbon{font:900 17px 'Baloo 2',system-ui,sans-serif; letter-spacing:.04em; color:#3b2400; padding:3px 14px; border-radius:6px; white-space:nowrap;
  background:linear-gradient(#fff3b8, #f2c14a 55%, #c98a1c); box-shadow:0 0 0 2px #7a4a0c, 0 4px 10px rgba(0,0,0,.4), 0 0 18px rgba(255,200,80,.7);}
.sfx-star{color:#ffe07a; font-size:14px; line-height:1; text-shadow:0 0 6px rgba(255,190,60,.95);}
.sfx-twinkle{width:12px; height:12px; background:radial-gradient(circle, #fff 0 1.4px, transparent 2px), linear-gradient(90deg, transparent 42%, #fff 50%, transparent 58%), linear-gradient(0deg, transparent 42%, #fff 50%, transparent 58%); filter:drop-shadow(0 0 3px rgba(255,240,170,.95));}
.sfx-lock{font-size:30px; line-height:1; filter:drop-shadow(0 3px 2px rgba(0,0,0,.5));}
.sfx-shadow{border-radius:50%; background:radial-gradient(ellipse, rgba(0,0,0,.55), rgba(0,0,0,0) 70%);}
@media (prefers-reduced-motion: reduce){ .sfx-flame, .sfx-haze{animation:none;} }
`;
function moreCss(){
  if(document.getElementById('sfx-more-css')) return;
  const s = document.createElement('style'); s.id = 'sfx-more-css'; s.textContent = MORE_CSS; (document.head || document.body).appendChild(s);
}
const rnd = (a, b)=> a + Math.random()*(b - a);
const call = (fn, ...a)=>{ if(fn) try{ fn(...a); }catch(e){} };
// Box a layer over an element's rect (fixed position, same size).
function over(el, cls, pad){
  const c = centre(el), p = pad || 0, d = layer(cls);
  G().set(d, {x:c.r.left - p, y:c.r.top - p, width:c.w + p*2, height:c.h + p*2});
  return d;
}
// A see-through copy of a card left where it stood (afterimages, chunks).
function ghostOf(el, cls){
  const t = tileOf(el), r = t.getBoundingClientRect(), c = t.cloneNode(true);
  c.removeAttribute('id'); c.classList.add('sfx'); (cls||'').split(' ').filter(Boolean).forEach(k=> c.classList.add(k)); c.setAttribute('aria-hidden', 'true');
  c.classList.remove('holo-active', 'holo-tilt');
  ['position:fixed', 'left:0', 'top:0', 'margin:0', 'pointer-events:none', 'z-index:9989', 'animation:none', 'transition:none',
   `width:${r.width}px`, `height:${r.height}px`].forEach(rule=>{ const [k, v] = rule.split(':'); c.style.setProperty(k, v, 'important'); });
  document.body.appendChild(c); G().set(c, {x:r.left, y:r.top, rotation:0, scale:1});
  return c;
}
const shakeEl = (el, amp, dur)=>{ const g = G(); if(!g || !el || reduce()) return;
  const n = Math.max(4, Math.round((dur||.4)/0.045)); const kf = [];
  for(let i = 0; i < n; i++){ const k = 1 - i/n; kf.push({x:rnd(-1, 1)*amp*k, y:rnd(-1, 1)*amp*0.6*k, duration:(dur||.4)/n}); }
  g.to(el, {keyframes:kf.concat([{x:0, y:0, duration:.05}]), clearProps:'transform'}); };
const svgLayer = (cls)=>{ const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'sfx ' + cls); s.setAttribute('aria-hidden', 'true');
  s.setAttribute('width', innerWidth); s.setAttribute('height', innerHeight); s.style.width = innerWidth + 'px'; s.style.height = innerHeight + 'px'; document.body.appendChild(s); return s; };
const drawPath = (svg, d, cls)=>{ const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); if(cls) p.setAttribute('class', cls); svg.appendChild(p);
  const L = p.getTotalLength ? p.getTotalLength() : 400; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return p; };
const ready = ()=>{ moreCss(); return !!G() && !reduce(); };

// Swarm: a buzzing cloud lifts off the attacker, converges on the target, mobs it, then disperses.
function swarm(attacker, target, o){
  o = o || {}; if(!ready() || !attacker || !target){ later(o.onImpact, 400); return; }
  const g = G(), a = centre(attacker), b = centre(target), n = o.count || 26, fly = (o.flight || 520)/1000;
  for(let i = 0; i < n; i++){
    const bug = layer('sfx-bug' + (o.gold || i % 5 === 0 ? ' is-gold' : ''));
    const p0 = {x:a.x + rnd(-a.w*.4, a.w*.4), y:a.y + rnd(-a.h*.3, a.h*.3)};
    const p1 = {x:b.x + rnd(-b.w*.35, b.w*.35), y:b.y + rnd(-b.h*.35, b.h*.35)};
    const m = {x:(p0.x + p1.x)/2 + rnd(-90, 90), y:(p0.y + p1.y)/2 + rnd(-60, 60)};
    const s = {t:0}, ph = rnd(0, 6.28), d = i*0.018;
    g.set(bug, {x:p0.x, y:p0.y, opacity:0});
    const tl = g.timeline({delay:d, onComplete:()=> bug.remove()});
    tl.to(bug, {opacity:1, duration:.08})
      .to(s, {t:1, duration:fly, ease:'power1.inOut', onUpdate:()=>{ const q = qpt(p0, m, p1, s.t), w = Math.sin(s.t*18 + ph)*5;
        g.set(bug, {x:q.x + w, y:q.y + Math.cos(s.t*16 + ph)*4, rotation:Math.atan2(p1.y - p0.y, p1.x - p0.x)*57.3 + w*6}); }}, 0);
    const jig = []; for(let k = 0; k < 5; k++) jig.push({x:b.x + rnd(-b.w*.5, b.w*.5), y:b.y + rnd(-b.h*.45, b.h*.45), duration:.09, ease:'sine.inOut'});
    tl.to(bug, {keyframes:jig}).to(bug, {x:`+=${rnd(-80, 80)}`, y:`-=${rnd(30, 90)}`, opacity:0, scale:.4, duration:.4, ease:'power1.in'});
  }
  later(()=>{ knock(target, rnd(-120, -60), .7); ring(b.x, b.y, 'sfx-poison', 70, 380); call(o.onImpact); if(o.light) call(o.light, b.x, b.y, [1, .85, .35], false); }, fly*1000 + 120);
  later(()=> knock(target, rnd(60, 120), .45), fly*1000 + 320);
}
// Regenerate: green motes spiral in from around the card, then a soft heal ring and glow.
function regen(target, o){
  o = o || {}; if(!ready() || !target){ later(o.onDone, 500); return; }
  const g = G(), c = centre(target), n = 12;
  for(let i = 0; i < n; i++){
    const m = layer('sfx-mote'), st = {a:i/n*Math.PI*2, r:Math.max(c.w, c.h)*0.85};
    g.set(m, {x:c.x + Math.cos(st.a)*st.r - 3, y:c.y + Math.sin(st.a)*st.r - 3, opacity:0, scale:.5});
    g.timeline({delay:i*0.03, onComplete:()=> m.remove()})
      .to(m, {opacity:1, scale:1, duration:.12})
      .to(st, {a:st.a + Math.PI*1.4, r:6, duration:.6, ease:'power2.in', onUpdate:()=> g.set(m, {x:c.x + Math.cos(st.a)*st.r*0.75 - 3, y:c.y + Math.sin(st.a)*st.r - 3})}, 0)
      .to(m, {opacity:0, scale:.3, duration:.12});
  }
  later(()=>{
    // (2026-10-14, user: "Remove the green Z effect at the end": the zig-zag stitch line is gone; motes, ring and glow stay.)
    ring(c.x, c.y, 'sfx-heal', c.w*1.3, 600);
    g.fromTo(tileOf(target), {filter:'brightness(1) saturate(1)'}, {filter:'brightness(1.3) saturate(1.3)', duration:.22, yoyo:true, repeat:1, clearProps:'filter'});
    if(o.light) call(o.light, c.x, c.y, [.5, 1, .55], false);
    call(o.onDone);
  }, 660);
}
// Poison cloud: green puffs billow up around the card, bubbles rise, the card sickens for a beat.
function poisonCloud(target, o){
  o = o || {}; if(!ready() || !target){ later(o.onImpact, 300); return; }
  const g = G(), c = centre(target);
  for(let i = 0; i < 8; i++){
    const p = layer('sfx-puff'), x = c.r.left + c.w*(i/7), y = c.r.bottom - c.h*rnd(.05, .35);
    g.set(p, {x:x - 22, y:y - 22, scale:.3, opacity:0});
    g.timeline({delay:i*0.05, onComplete:()=> p.remove()})
      .to(p, {opacity:.85, scale:1.1, duration:.35, ease:'power1.out'})
      .to(p, {x:`+=${(i/7 - .5)*50 + rnd(-10, 10)}`, y:`-=${rnd(40, 80)}`, scale:1.8, duration:1.1, ease:'sine.out'}, 0)
      .to(p, {opacity:0, duration:.5}, .85);
  }
  for(let i = 0; i < 9; i++){ const bb = layer('sfx-bubble'); g.set(bb, {x:c.r.left + rnd(.15, .85)*c.w, y:c.r.bottom - 6, opacity:0, scale:rnd(.6, 1.3)});
    g.timeline({delay:.15 + i*0.08, onComplete:()=> bb.remove()}).to(bb, {opacity:1, duration:.08}).to(bb, {y:`-=${rnd(40, 90)}`, x:`+=${rnd(-8, 8)}`, duration:.7, ease:'sine.out'}, 0).to(bb, {scale:1.6, opacity:0, duration:.1}); }
  g.fromTo(tileOf(target), {filter:'hue-rotate(0deg) saturate(1)'}, {filter:'hue-rotate(65deg) saturate(1.5) brightness(.9)', duration:.3, delay:.2, yoyo:true, repeat:1, repeatDelay:.35, clearProps:'filter'});
  later(()=>{ if(o.light) call(o.light, c.x, c.y, [.5, 1, .35], false); call(o.onImpact); }, 300);
}
// Bleed: a quick red cut, then drops swell on the card's lower edge and fall, splatting below.
function bleedDrip(target, o){
  o = o || {}; if(!ready() || !target){ later(o.onImpact, 200); return; }
  const g = G(), c = centre(target), sl = layer('sfx-slash');
  g.set(sl, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:c.w*.9, rotation:-34, scaleX:0, opacity:1});
  g.timeline({onComplete:()=> sl.remove()}).to(sl, {scaleX:1, duration:.1, ease:'power2.out'}).to(sl, {opacity:0, duration:.4, delay:.15});
  knock(target, 146, .6); later(()=> call(o.onImpact), 100);
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(.85) sepia(.6) saturate(3) hue-rotate(-30deg)', duration:.12, yoyo:true, repeat:1, clearProps:'filter'});
  for(let i = 0; i < 6; i++){
    const d = layer('sfx-drop'), x = c.r.left + c.w*(.18 + i*.13 + rnd(-.03, .03)), y0 = c.r.bottom - 8, fall = rnd(30, 60);
    g.set(d, {x:x - 3.5, y:y0 - 4, scaleY:.2, scaleX:.6, transformOrigin:'50% 0%', opacity:0});
    g.timeline({delay:.2 + i*0.12 + rnd(0, .1), onComplete:()=> d.remove()})
      .to(d, {opacity:1, scaleY:1, scaleX:1, duration:.35, ease:'power1.in'})
      .to(d, {scaleY:1.4, y:`+=${fall}`, duration:.32, ease:'power2.in'})
      .add(()=>{ const s = layer('sfx-splat'); g.set(s, {x:x - 7, y:y0 + fall + 6, scaleX:.3, opacity:.9});
        g.timeline({onComplete:()=> s.remove()}).to(s, {scaleX:1.2, duration:.12, ease:'power2.out'}).to(s, {opacity:0, duration:.5, delay:.2}); })
      .set(d, {opacity:0});
  }
}
// Thorns: spikes burst from the defender toward whoever hit it, and the attacker is stung back.
function thorns(defender, attacker, o){
  o = o || {}; if(!ready() || !defender || !attacker){ later(o.onImpact, 200); return; }
  const g = G(), d = centre(defender), a = centre(attacker);
  const ang = Math.atan2(a.y - d.y, a.x - d.x), deg = ang*57.3;
  const ex = d.x + Math.cos(ang)*d.h*0.42, ey = d.y + Math.sin(ang)*d.h*0.42;  // the defender's edge facing the attacker
  for(let i = 0; i < 9; i++){
    const t = layer('sfx-thorn'), spread = (i - 4)*13 + rnd(-4, 4), len = rnd(.9, 1.5) * (1 - Math.abs(i - 4)*0.08);
    const ox = ex + Math.cos(ang + Math.PI/2)*(i - 4)*d.w*0.09, oy = ey + Math.sin(ang + Math.PI/2)*(i - 4)*d.w*0.09;
    g.set(t, {x:ox - 4.5, y:oy - 26, rotation:deg + 90 + spread, scaleY:0, opacity:1});
    g.timeline({onComplete:()=> t.remove()}).to(t, {scaleY:len*1.25, duration:.09, delay:i%2*0.03, ease:'power4.out'}).to(t, {scaleY:len, duration:.12}).to(t, {scaleY:0, opacity:0, duration:.22, delay:.3, ease:'power2.in'});
  }
  g.fromTo(tileOf(defender), {scale:1}, {scale:1.06, duration:.08, yoyo:true, repeat:1, clearProps:'transform'});
  later(()=>{ knock(attacker, deg, 1.2); burst(a.x, a.y, deg + 180, 'wood', 7); ring(a.x - Math.cos(ang)*a.h*.3, a.y - Math.sin(ang)*a.h*.3, 'sfx-poison', 46, 300);
    g.fromTo(tileOf(attacker), {filter:'brightness(1)'}, {filter:'brightness(1.6) sepia(1) hue-rotate(-40deg) saturate(3)', duration:.08, yoyo:true, repeat:1, clearProps:'filter'});
    call(o.onImpact); }, 110);
}
// Earthquake: the board rumbles, cracks tear open under each card and they're thrown up in dust.
function earthquake(cards, o){
  o = o || {}; const list = (cards||[]).filter(Boolean); if(!list.length) return;
  if(!ready()){ list.forEach((el, i)=> call(o.onEachImpact, el, i)); return; }
  const g = G(), host = o.host || list[0].closest('.battlefield, .skill-arena, .stage') || list[0].parentElement;
  shakeEl(host, 7, .75);
  const sv = svgLayer('sfx-quake');
  list.forEach((el, i)=> later(()=>{
    const c = centre(el), y = c.r.bottom + 4; let L = `M${c.x},${y}`, R = `M${c.x},${y}`;
    for(let k = 1; k <= 5; k++){ L += ` L${c.x - c.w*0.2*k},${y + rnd(-7, 7)}`; R += ` L${c.x + c.w*0.2*k},${y + rnd(-7, 7)}`; }
    const br = `M${c.x - c.w*0.4},${y} L${c.x - c.w*0.5},${y - 14} L${c.x - c.w*0.62},${y - 20} M${c.x + c.w*0.45},${y} L${c.x + c.w*0.52},${y + 12}`;
    [L, R, br].forEach(d=>{ const e = drawPath(sv, d, 'edge'), p = drawPath(sv, d, 'gap'); g.to([e, p], {strokeDashoffset:0, duration:.22, ease:'power2.out'}); });
    for(let k = 0; k < 6; k++){ const p = layer('sfx-dust'); g.set(p, {x:c.r.left + c.w*k/5 - 11, y:y - 14, scale:.5, opacity:.9});
      g.to(p, {x:`+=${(k/5 - .5)*70}`, y:`-=${rnd(8, 24)}`, scale:2, opacity:0, duration:.7, ease:'power2.out', onComplete:()=> p.remove()}); }
    const t = tileOf(el);
    g.timeline().to(t, {y:-16, rotation:rnd(-6, 6), duration:.12, ease:'power2.out'}).to(t, {y:0, rotation:0, duration:.5, ease:'bounce.out', clearProps:'transform'});
    if(o.light) call(o.light, c.x, y, [1, .8, .55], true);
    call(o.onEachImpact, el, i);
  }, 120 + i*110));
  g.to(sv, {opacity:0, duration:.6, delay:1.3 + list.length*0.11, onComplete:()=> sv.remove()});
}
// Quick: speed lines and a blur of afterimages as the attacker darts in, strikes and darts back.
function quickStrike(attacker, target, o){
  o = o || {}; if(!ready() || !attacker || !target){ later(o.onImpact, 150); return; }
  const g = G(), a = centre(attacker), b = centre(target), t = tileOf(attacker);
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx/L, uy = dy/L, deg = Math.atan2(dy, dx)*57.3;
  const reach = Math.max(0, L - (a.h + b.h)*0.42);
  for(let i = 0; i < 7; i++){ const s = layer('sfx-speed'), off = (i - 3)*a.w*0.14, len = rnd(40, 90);
    g.set(s, {x:a.x - ux*len + -uy*off - len/2, y:a.y - uy*len + ux*off, width:len, rotation:deg, transformOrigin:'100% 50%', scaleX:0, opacity:.9});
    g.timeline({delay:.04 + i*0.012, onComplete:()=> s.remove()}).to(s, {scaleX:1, duration:.07}).to(s, {x:`+=${ux*reach*0.6}`, y:`+=${uy*reach*0.6}`, opacity:0, duration:.18, ease:'power1.in'}); }
  [0.28, 0.55, 0.8].forEach((k, i)=> later(()=>{ const gh = ghostOf(attacker, 'sfx-ghost' + (i === 1 ? ' is-blue' : ''));
    g.set(gh, {x:`+=${ux*reach*k}`, y:`+=${uy*reach*k}`}); g.to(gh, {opacity:0, duration:.28, ease:'power1.in', onComplete:()=> gh.remove()}); }, 50 + i*22));
  g.timeline()
    .to(t, {x:-ux*6, y:-uy*6, duration:.05, ease:'power1.out'})
    .to(t, {x:ux*reach, y:uy*reach, skewX:-ux*8, duration:.1, ease:'power3.in'})
    .add(()=>{ knock(target, deg, 1); ring(b.x - ux*b.h*.3, b.y - uy*b.h*.3, 'sfx-string', 56, 260); burst(b.x, b.y, deg, 'zap', 7);
      if(o.light) call(o.light, b.x, b.y, [1, .95, .8], false); call(o.onImpact); })
    .to(t, {x:0, y:0, skewX:0, duration:.26, ease:'power2.out', clearProps:'transform'}, '+=0.04');
}
// Evasive: the card sidesteps in a blink, leaving an afterimage; leaves flutter and a "Miss" pops up.
function evasiveDodge(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), t = tileOf(target), s = o.fromLeft ? 1 : -1;
  const gh = ghostOf(target, 'sfx-ghost is-blue');
  g.timeline({onComplete:()=> gh.remove()}).to(gh, {opacity:.5, duration:.05}).to(gh, {opacity:0, x:`-=${s*8}`, duration:.45, ease:'power1.in'});
  g.timeline({onComplete:()=> call(o.onDone)})
    .to(t, {x:s*c.w*0.55, rotation:s*8, skewX:-s*10, duration:.1, ease:'power3.out'})
    .to(t, {skewX:0, duration:.12})
    .to(t, {x:0, rotation:0, duration:.35, ease:'back.out(1.6)', clearProps:'transform'}, '+=0.18');
  for(let i = 0; i < 4; i++){ const l = layer('sfx-leaf', '🍃'); g.set(l, {x:c.x - 8 + rnd(-10, 10), y:c.y + rnd(-c.h*.3, c.h*.3), rotation:rnd(0, 360), opacity:0});
    g.timeline({delay:.04 + i*0.04, onComplete:()=> l.remove()}).to(l, {opacity:1, duration:.06})
      .to(l, {x:`-=${s*rnd(30, 60)}`, y:`+=${rnd(10, 40)}`, rotation:`+=${rnd(-260, 260)}`, duration:.8, ease:'sine.out'}, 0).to(l, {opacity:0, duration:.3}, .55); }
  const m = layer('sfx-miss', o.label || 'Miss!'); g.set(m, {x:c.x, y:c.r.top + c.h*.2, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
  g.timeline({onComplete:()=> m.remove()}).to(m, {scale:1.1, opacity:1, y:'-=14', duration:.18, ease:'back.out(3)'}).to(m, {scale:1, duration:.1}).to(m, {opacity:0, y:'-=16', duration:.35, delay:.35});
}
// Cleave (Sweep): one wide glowing arc swept across the target row; each card is hit as the blade passes.
function cleave(attacker, targets, o){
  o = o || {}; const list = (targets||[]).filter(Boolean); if(!list.length) return;
  if(!ready() || !attacker){ list.forEach((el, i)=> call(o.onEachImpact, el, i)); return; }
  const g = G(), a = centre(attacker), items = list.map(el=> ({el, c:centre(el)})).sort((p, q)=> p.c.x - q.c.x), cs = items.map(it=> it.c);
  const first = cs[0], last = cs[cs.length - 1], mid = {x:(first.x + last.x)/2, y:(first.y + last.y)/2};
  const away = Math.sign(mid.y - a.y) || -1;   // the arc bows away from the attacker
  const P0 = {x:first.x - first.w*0.75, y:first.y + away*first.h*0.15}, P2 = {x:last.x + last.w*0.75, y:last.y + away*last.h*0.15};
  const M = {x:mid.x, y:mid.y + away*Math.max(40, (P2.x - P0.x)*0.22)};
  const sv = svgLayer('sfx-arc'), d = `M${P0.x},${P0.y} Q${M.x},${M.y} ${P2.x},${P2.y}`;
  const gl = drawPath(sv, d, 'glow'), co = drawPath(sv, d, 'core'), sweep = .26;
  const tt = g.timeline({onComplete:()=> sv.remove()});
  tt.to(tileOf(attacker), {rotation:-8, y:away*-4, duration:.1, ease:'power2.out'}, 0).to(tileOf(attacker), {rotation:6, y:away*6, duration:sweep, ease:'power2.in'}, .1)
    .to(tileOf(attacker), {rotation:0, y:0, duration:.3, ease:'elastic.out(1, .5)', clearProps:'transform'}, .1 + sweep)
    .to([gl, co], {strokeDashoffset:0, duration:sweep, ease:'power2.in'}, .1)
    .to(sv, {opacity:0, duration:.3}, .1 + sweep + .08);
  // each card is struck when the blade's tip passes its x (solving for t along the arc is close enough linearly)
  items.forEach(({el, c}, i)=>{ const f = (c.x - P0.x)/(P2.x - P0.x || 1);
    later(()=>{ knock(el, f < .5 ? 160 : 20, 1); burst(c.x, c.y, f < .5 ? 0 : 180, 'wood', 6); if(o.light) call(o.light, c.x, c.y, [1, .9, .6], false); call(o.onEachImpact, el, i); }, (0.1 + sweep*Math.sqrt(Math.max(0, f)))*1000); });
}
// Guardian: a shimmering hex shield wall rises in front of the card and pulses twice as it draws attacks.
function guardian(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), dir = o.dir || -1;  // -1: the enemy is above
  const w = layer('sfx-wall'), ww = c.w*1.7, wh = c.h*0.32, wy = dir < 0 ? c.r.top - wh*0.55 : c.r.bottom - wh*0.45;
  g.set(w, {x:c.x - ww/2, y:wy, width:ww, height:wh, scaleY:0, opacity:0, rotationX:dir < 0 ? 0 : 180});
  g.timeline({onComplete:()=>{ w.remove(); call(o.onDone); }})
    .to(w, {scaleY:1, opacity:1, duration:.22, ease:'back.out(2.2)'})
    .add(()=>{ ring(c.x, wy + wh/2, 'sfx-frost', ww*1.1, 520); if(o.light) call(o.light, c.x, wy + wh/2, [.7, .8, 1], false); })
    .to(w, {filter:'brightness(1.8)', duration:.1, yoyo:true, repeat:1})
    .add(()=> ring(c.x, wy + wh/2, 'sfx-frost', ww*1.25, 520), '+=0.15')
    .to(w, {filter:'brightness(1.8)', duration:.1, yoyo:true, repeat:1}, '<')
    .to(w, {opacity:0, scaleY:.6, duration:.35, delay:.35, ease:'power1.in'});
  g.fromTo(tileOf(target), {y:0}, {y:dir*5, duration:.14, yoyo:true, repeat:1, ease:'power1.out', clearProps:'transform'});
}
// Dynamite: a lit stick is lobbed onto the target, fizzes for a beat, then blows: flash, fireball, smoke and debris.
function dynamite(thrower, target, o){
  o = o || {}; if(!ready() || !thrower || !target){ later(o.onImpact, 700); return; }
  const g = G(), a = centre(thrower), b = centre(target), stick = layer('sfx-dyn', '🧨');
  const m = {x:(a.x + b.x)/2 + rnd(-30, 30), y:Math.min(a.y, b.y) - 90}, s = {t:0}, fly = (o.flight || 480)/1000, fuse = (o.fuse || 380)/1000;
  let tick = 0;
  const spark = ()=>{ if(tick++ % 2) return; const r = stick.getBoundingClientRect(), sp = layer('sfx-spark');
    g.set(sp, {x:r.left + r.width*.75, y:r.top + 2}); g.to(sp, {x:`+=${rnd(-14, 14)}`, y:`+=${rnd(-16, 6)}`, opacity:0, scale:.3, duration:.3, onComplete:()=> sp.remove()}); };
  g.set(stick, {x:a.x, y:a.y, xPercent:-50, yPercent:-50});
  const host = o.host || target.closest('.battlefield, .skill-arena, .stage') || null;
  g.timeline({onComplete:()=> stick.remove()})
    .to(s, {t:1, duration:fly, ease:'power1.in', onUpdate:()=>{ const q = qpt(a, m, b, s.t); g.set(stick, {x:q.x, y:q.y}); spark(); }})
    .to(stick, {rotation:`+=${540}`, duration:fly, ease:'none'}, 0)
    .to(stick, {keyframes:[{scale:1.15, duration:fuse/4}, {scale:.95, duration:fuse/4}, {scale:1.25, duration:fuse/4}, {scale:1, duration:fuse/4}], onUpdate:spark})
    .add(()=>{
      stick.style.opacity = 0;
      const f = layer('sfx-flash'); g.set(f, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:40, height:40, opacity:1});
      g.to(f, {width:b.w*3.2, height:b.w*3.2, opacity:0, duration:.35, ease:'power2.out', onComplete:()=> f.remove()});
      const fb = layer('sfx-fireball'); g.set(fb, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:20, height:20, opacity:1});
      g.to(fb, {width:b.w*1.5, height:b.w*1.5, duration:.25, ease:'power3.out'}); g.to(fb, {opacity:0, scale:1.2, duration:.35, delay:.2, onComplete:()=> fb.remove()});
      for(let i = 0; i < 7; i++){ const sm = layer('sfx-smoke'), ang = i/7*6.28; g.set(sm, {x:b.x - 20, y:b.y - 20, scale:.5, opacity:0});
        g.timeline({delay:.12, onComplete:()=> sm.remove()}).to(sm, {opacity:.85, duration:.1}).to(sm, {x:`+=${Math.cos(ang)*b.w*.6}`, y:`+=${Math.sin(ang)*b.w*.5 - 20}`, scale:2.2, duration:1, ease:'power2.out'}, 0).to(sm, {opacity:0, duration:.5}, .5); }
      ring(b.x, b.y, 'sfx-ignite', b.w*2.4, 520); ring(b.x, b.r.bottom, 'sfx-ring-dust', b.w*2, 640);
      burst(b.x, b.y, -90, 'fire', 14); burst(b.x, b.y, 90, 'wood', 10);
      knock(target, -90, 1.6); if(host) shakeEl(host, 6, .4);
      if(o.light) call(o.light, b.x, b.y, [1, .6, .2], true);
      call(o.onImpact);
    });
}
// Helmet: the blow glances off: a helmet flashes up, a bright ping and sparks, and a chip skips away.
function helmetDeflect(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onImpact); return; }
  const g = G(), c = centre(target), from = o.from == null ? -90 : o.from, rad = from*Math.PI/180;
  const px = c.x + Math.cos(rad)*c.w*0.3, py = c.y + Math.sin(rad)*c.h*0.38;
  const h = layer('sfx-helmet', '🪖'); g.set(h, {x:c.x, y:c.r.top + c.h*.18, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
  g.timeline({onComplete:()=> h.remove()}).to(h, {scale:1.15, opacity:1, duration:.1, ease:'back.out(3)'}).to(h, {rotation:-12, duration:.06}).to(h, {rotation:8, duration:.07}).to(h, {rotation:0, scale:1, duration:.1}).to(h, {opacity:0, y:'-=10', duration:.3, delay:.25});
  const p = layer('sfx-ping'); g.set(p, {x:px - 15, y:py - 15, scale:.2, rotation:0, opacity:1});
  g.timeline({onComplete:()=> p.remove()}).to(p, {scale:1.6, rotation:45, duration:.1, ease:'power3.out'}).to(p, {scale:.6, opacity:0, rotation:90, duration:.2});
  ring(px, py, 'sfx-string', 40, 260);
  for(let i = 0; i < 7; i++){ const s = layer('sfx-spark'), a = (from + 180 + rnd(-70, 70))*Math.PI/180, d = rnd(20, 44);
    g.set(s, {x:px - 2, y:py - 2}); g.to(s, {x:`+=${Math.cos(a)*d}`, y:`+=${Math.sin(a)*d}`, opacity:0, scale:.4, duration:rnd(.2, .35), ease:'power2.out', onComplete:()=> s.remove()}); }
  const ch = layer('sfx-chip'), ra = (from + 180 + (Math.random() < .5 ? 50 : -50))*Math.PI/180;
  g.set(ch, {x:px, y:py}); g.to(ch, {x:`+=${Math.cos(ra)*90}`, y:`+=${Math.sin(ra)*90 + 30}`, rotation:540, opacity:0, duration:.6, ease:'power1.out', onComplete:()=> ch.remove()});
  knock(target, from + 180, .3);
  if(o.light) call(o.light, px, py, [1, 1, .85], false);
  call(o.onImpact);
}
// Darksight: the card dims into darkness and two glowing eyes open, glance about, and mark hidden foes.
function darksight(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), dk = over(target, 'sfx-dark', 4);
  const eyes = [-1, 1].map(s=>{ const e = layer('sfx-eye'); g.set(e, {x:c.x + s*c.w*0.15 - 7.5, y:c.r.top + c.h*.42 - 4.5, scaleY:0, opacity:1}); return e; });
  g.set(dk, {opacity:0});
  const tl = g.timeline({onComplete:()=>{ dk.remove(); eyes.forEach(e=> e.remove()); call(o.onDone); }});
  tl.to(dk, {opacity:1, duration:.25})
    .to(eyes, {scaleY:1, duration:.14, ease:'back.out(3)'})
    .to(eyes, {x:'-=5', duration:.18, ease:'sine.inOut'}, '+=0.12').to(eyes, {x:'+=10', duration:.26, ease:'sine.inOut'}).to(eyes, {x:'-=5', duration:.16})
    .to(eyes, {scaleY:.05, duration:.05, yoyo:true, repeat:1})
    .to([dk].concat(eyes), {opacity:0, duration:.3, delay:.2});
  (o.targets||[]).filter(Boolean).forEach((el, i)=> later(()=>{ const t = tileOf(el), cc = centre(el); t.classList.add('sfx-revealed'); ring(cc.x, cc.y, 'sfx-poison', cc.w*1.2, 480);
    later(()=> t.classList.remove('sfx-revealed'), 700); }, 520 + i*90));
}
// Frostbite chill: an icy breath rolls over the card, flakes settle and rime creeps in from the edges.
function frostChill(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onImpact); return; }
  const g = G(), c = centre(target), s = o.fromLeft === false ? -1 : 1;
  for(let i = 0; i < 5; i++){ const m = layer('sfx-mist'); g.set(m, {x:c.x - s*c.w*1.1 - 35, y:c.y - 17 + (i - 2)*c.h*0.16, scale:.5, opacity:0});
    g.timeline({delay:i*0.05, onComplete:()=> m.remove()}).to(m, {opacity:.85, duration:.15}).to(m, {x:`+=${s*c.w*2}`, scale:1.5, duration:.9, ease:'power1.out'}, 0).to(m, {opacity:0, duration:.4}, .55); }
  for(let i = 0; i < 10; i++){ const f = layer('sfx-flake', '❄'); g.set(f, {x:c.r.left + rnd(0, c.w), y:c.r.top - rnd(0, 20), opacity:0, rotation:rnd(0, 180)});
    g.timeline({delay:.15 + i*0.06, onComplete:()=> f.remove()}).to(f, {opacity:1, duration:.1}).to(f, {y:`+=${c.h*rnd(.5, .9)}`, x:`+=${rnd(-12, 12)}`, rotation:'+=120', duration:1, ease:'sine.in'}, 0).to(f, {opacity:0, duration:.25}, .8); }
  const r = over(target, 'sfx-rime', 0); g.set(r, {opacity:0});
  g.timeline({delay:.3, onComplete:()=> r.remove()}).to(r, {opacity:1, duration:.4}).to(r, {opacity:0, duration:.6, delay:.5});
  const t = tileOf(target);
  later(()=>{ t.classList.add('sfx-frosted'); ring(c.x, c.y, 'sfx-frost', c.w*1.3, 600); if(o.light) call(o.light, c.x, c.y, [.45, .75, 1], false); call(o.onImpact); }, 350);
  later(()=> t.classList.remove('sfx-frosted'), 1500);
}
// Immolation scorch: flames lick up from the card's lower edge in a heat shimmer; embers rise and the edge chars.
function scorch(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onImpact); return; }
  // 2026-10-14 (user: "The haze effect doesnt fade off properly, and doesnt extend to the full extent of the card"): the shimmer
  // sits exactly on the card tile with its corners, fades out over the last half second, and is removed even if the tween is cut.
  const g = G(), c = centre(target), tl = tileOf(target), hz = over(tl, 'sfx-haze', 0);
  try{ hz.style.borderRadius = getComputedStyle(tl).borderRadius || '10px'; }catch(e){}
  g.set(hz, {opacity:0}); g.timeline({onComplete:()=> hz.remove()}).to(hz, {opacity:1, duration:.2}).to(hz, {opacity:0, duration:.6, delay:.9, ease:'power1.in'});
  setTimeout(()=>{ if(hz.isConnected) hz.remove(); }, 2400);
  for(let i = 0; i < 9; i++){ const f = layer('sfx-flame'), x = c.r.left + c.w*(i/8)*.9 + c.w*.05;
    g.set(f, {x:x - 7, y:c.r.bottom - 26 + rnd(-4, 6), scaleY:0, opacity:1});
    g.timeline({delay:i*0.03 + rnd(0, .08), onComplete:()=> f.remove()}).to(f, {scaleY:rnd(1, 1.8), duration:.25, ease:'power2.out'}).to(f, {scaleY:rnd(.8, 1.4), duration:.3, yoyo:true, repeat:1}).to(f, {scaleY:0, opacity:0, duration:.3}); }
  for(let i = 0; i < 10; i++){ const e = layer('sfx-bit sfx-bit-ember'); g.set(e, {x:c.r.left + rnd(.1, .9)*c.w, y:c.r.bottom - 10, opacity:0});
    g.timeline({delay:.15 + i*0.07, onComplete:()=> e.remove()}).to(e, {opacity:1, duration:.05}).to(e, {y:`-=${rnd(50, 100)}`, x:`+=${rnd(-14, 14)}`, opacity:0, duration:.9, ease:'power1.out'}); }
  const t = tileOf(target);
  later(()=>{ t.classList.add('sfx-scorch'); if(o.light) call(o.light, c.x, c.r.bottom, [1, .55, .18], false); call(o.onImpact); }, 250);
  later(()=> t.classList.remove('sfx-scorch'), 1400);
}
// Lantern: a lantern swings above the card and throws a warm, flickering pool of light; moths circle it.
function lanternGlow(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), D = Math.max(c.w, c.h)*2.6, dur = (o.duration || 1800)/1000;
  const pool = layer('sfx-glowpool'); g.set(pool, {x:c.x - D/2, y:c.y - D/2, width:D, height:D, scale:.3, opacity:0});
  const lan = layer('sfx-lantern', '🏮'); g.set(lan, {x:c.x - 12, y:c.r.top - 34, opacity:0, rotation:-16});
  g.timeline({onComplete:()=>{ pool.remove(); lan.remove(); call(o.onDone); }})
    .to(pool, {scale:1, opacity:1, duration:.4, ease:'power2.out'}, 0).to(lan, {opacity:1, y:'+=6', duration:.25}, 0)
    .to(lan, {rotation:14, duration:.45, ease:'sine.inOut', yoyo:true, repeat:Math.max(1, Math.round(dur/.45) - 1)}, .1)
    .to(pool, {keyframes:[{opacity:.8, duration:.12}, {opacity:1, duration:.2}, {opacity:.85, duration:.1}, {opacity:1, duration:.3}]}, .4)
    .to([pool, lan], {opacity:0, duration:.4}, dur);
  for(let i = 0; i < 3; i++){ const mo = layer('sfx-moth'), st = {a:i*2.1}; g.set(mo, {opacity:0});
    g.timeline({delay:.3, onComplete:()=> mo.remove()}).to(mo, {opacity:1, duration:.2})
      .to(st, {a:st.a + 6.28*1.5, duration:dur - .5, ease:'none', onUpdate:()=> g.set(mo, {x:c.x + Math.cos(st.a)*(18 + i*7), y:c.r.top - 18 + Math.sin(st.a*1.7)*(10 + i*4)})}, 0).to(mo, {opacity:0, duration:.2});
  }
  [target].concat((o.cards||[]).filter(Boolean)).forEach((el, i)=> g.fromTo(tileOf(el), {filter:'brightness(1)'}, {filter:`brightness(${i ? 1.12 : 1.22}) sepia(.25)`, duration:.4, yoyo:true, repeat:1, repeatDelay:dur - .8, clearProps:'filter'}));
  if(o.light) call(o.light, c.x, c.y, [1, .8, .45], false);
}
// ---- general effects ----
// Shockwave: a ring of rippled, brightened air expands from a point; cards in its path are shoved outward as it passes.
function shockwave(x, y, o){
  if(x && x.getBoundingClientRect){ o = y; const c = centre(x); x = c.x; y = c.y; }
  o = o || {}; if(!ready()){ call(o.onDone); return; }
  const g = G(), R = o.size || 420, dur = (o.duration || 700)/1000;
  const w = layer('sfx-wave'); g.set(w, {x, y, xPercent:-50, yPercent:-50, width:10, height:10, opacity:1});
  g.to(w, {width:R, height:R, duration:dur, ease:'power2.out'}); g.to(w, {opacity:0, duration:dur*0.45, delay:dur*0.55, ease:'power1.in', onComplete:()=>{ w.remove(); call(o.onDone); }});
  ring(x, y, 'sfx-string', R*0.9, dur*1000*0.9);
  later(()=> ring(x, y, '', R*0.55, dur*1000*0.7), 80);
  (o.cards||[]).filter(Boolean).forEach(el=>{ const c = centre(el), d = Math.hypot(c.x - x, c.y - y); if(d > R/2 + c.w/2) return;
    later(()=> knock(el, Math.atan2(c.y - y, c.x - x)*57.3, Math.max(.4, 1.3 - d/R)), Math.min(1, d/(R/2))*dur*0.55*1000); });
  if(o.light) call(o.light, x, y, [1, .9, .7], true);
}
// Castle crumble, three ways. collapse: the tower breaks into bands that tumble down; sink: it shudders and sinks
// into the ground in a cloud of dust; topple: it leans over its foot and crashes, throwing rubble.
function castleCrumble(castle, o){
  o = o || {}; const v = o.variant || 'collapse'; if(!ready() || !castle){ call(o.onDone); return; }
  const g = G(), t = tileOf(castle), c = centre(t);
  const dust = (n, spread)=>{ for(let k = 0; k < n; k++){ const p = layer('sfx-dust'); g.set(p, {x:c.r.left + c.w*k/(n - 1) - 11, y:c.r.bottom - 16, scale:.6, opacity:.95});
    g.to(p, {x:`+=${(k/(n - 1) - .5)*spread}`, y:`-=${rnd(10, 40)}`, scale:rnd(2, 3.2), opacity:0, duration:rnd(.8, 1.2), ease:'power2.out', onComplete:()=> p.remove()}); } };
  const done = ()=>{ if(o.restore !== false) later(()=>{ g.set(t, {clearProps:'opacity,transform,clipPath,filter,visibility'}); g.fromTo(t, {opacity:0}, {opacity:1, duration:.3}); }, o.restoreAfter || 700); call(o.onDone); };
  const tl = g.timeline({onComplete:done});
  tl.to(t, {keyframes:[{x:-3, duration:.04}, {x:3, duration:.04}, {x:-2, duration:.04}, {x:2, duration:.04}, {x:0, duration:.04}]});
  if(v === 'sink'){
    tl.add(()=> dust(9, 160))
      .fromTo(t, {clipPath:'inset(-20% -20% 0% -20%)'}, {y:c.h*0.95, clipPath:'inset(-20% -20% 95% -20%)', rotation:rnd(-4, 4), duration:1.1, ease:'power2.in'})
      .to(t, {keyframes:[{x:-2, duration:.05}, {x:2, duration:.05}, {x:0, duration:.05}]}, '<0.1')
      .add(()=> dust(6, 90), '-=0.4').set(t, {opacity:0});
  } else if(v === 'topple'){
    const side = Math.random() < .5 ? -1 : 1;
    tl.to(t, {rotation:side*6, transformOrigin:side < 0 ? '0% 100%' : '100% 100%', duration:.25, ease:'power1.out'})
      .to(t, {rotation:side*86, duration:.45, ease:'power3.in'})
      .add(()=>{ burst(c.x + side*c.h*0.7, c.r.bottom - 6, side < 0 ? 0 : 180, 'wood', 14); dust(8, 220); ring(c.x + side*c.h*0.5, c.r.bottom, 'sfx-ring-dust', c.h*1.6, 600); })
      .to(t, {rotation:side*80, duration:.08}).to(t, {rotation:side*86, duration:.12}).to(t, {opacity:0, filter:'blur(2px)', duration:.4, delay:.2});
  } else {
    const bands = [[0, 34], [33, 67], [66, 100]], parts = bands.map(([a, b])=>{ const p = ghostOf(t, 'sfx-chunk'); p.style.opacity = 1; p.style.filter = 'none';
      p.style.clipPath = `polygon(0 ${a + rnd(-3, 3)}%, 100% ${a + rnd(-3, 3)}%, 100% ${b + rnd(-3, 3)}%, 0 ${b + rnd(-3, 3)}%)`; return p; });
    tl.set(t, {opacity:0})
      .add(()=>{ parts.forEach((p, i)=>{ const fall = c.h*(0.9 - i*0.28), sx = rnd(-1, 1);
        g.timeline({delay:(2 - i)*0.08, onComplete:()=> p.remove()})
          .to(p, {y:`+=${fall}`, x:`+=${sx*30}`, rotation:sx*rnd(15, 40), duration:.45 + i*0.05, ease:'power2.in'})
          .add(()=>{ dust(4, 100); burst(c.x + sx*20, c.r.bottom - 8, -90, 'wood', 6); })
          .to(p, {opacity:0, duration:.35, delay:.15}); }); })
      .add(()=>{ ring(c.x, c.r.bottom, 'sfx-ring-dust', c.w*2.4, 700); }, '+=0.42').to({}, {duration:.6});
  }
  if(o.host) later(()=> shakeEl(o.host, 6, .5), v === 'sink' ? 200 : 600);
  if(o.light) later(()=> call(o.light, c.x, c.r.bottom, [1, .8, .55], true), 500);
}
// Level up: golden rays turn behind the card, it pops, a ribbon stamps on and stars rise.
function levelUp(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), t = tileOf(target), D = Math.max(c.w, c.h)*2.2;
  // the rays sit behind the card: a spinning wrapper with a card-shaped hole cut out (clip-path evenodd), so the art stays clear
  const hole = layer('sfx-rays-hole'), rays = document.createElement('div'); rays.className = 'sfx-rays'; rays.style.cssText = 'position:absolute; inset:0;'; hole.appendChild(rays);
  const hx = (D - c.w)/2/D*100, hy = (D - c.h)/2/D*100;
  hole.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${hx}% ${hy}%, ${100 - hx}% ${hy}%, ${100 - hx}% ${100 - hy}%, ${hx}% ${100 - hy}%, ${hx}% ${hy}%)`;
  g.set(hole, {x:c.x - D/2, y:c.y - D/2, width:D, height:D});
  g.set(rays, {scale:.2, opacity:0, rotation:0});
  g.timeline({onComplete:()=> hole.remove()}).to(rays, {scale:1, opacity:1, duration:.3, ease:'back.out(1.6)'}).to(rays, {rotation:60, duration:1.4, ease:'none'}, 0).to(rays, {opacity:0, duration:.4}, 1);
  g.timeline().to(t, {scale:1.14, y:-8, duration:.16, ease:'power2.out'}).to(t, {scale:1, y:0, duration:.5, ease:'elastic.out(1, .4)', clearProps:'transform'});
  g.fromTo(t, {filter:'brightness(1)'}, {filter:'brightness(1.45) saturate(1.3)', duration:.18, yoyo:true, repeat:1, clearProps:'filter'});
  ring(c.x, c.y, 'sfx-string', c.w*1.8, 600); later(()=> ring(c.x, c.y, 'sfx-string', c.w*1.3, 500), 120);
  const rb = layer('sfx-ribbon', o.text || 'LEVEL UP!'); g.set(rb, {x:c.x, y:c.r.top - 8, xPercent:-50, yPercent:-50, scale:2.4, opacity:0, rotation:-8});
  g.timeline({onComplete:()=>{ rb.remove(); call(o.onDone); }}).to(rb, {scale:1, opacity:1, rotation:-3, duration:.22, ease:'power3.in', delay:.12}).to(rb, {y:'-=4', duration:.08, yoyo:true, repeat:1}).to(rb, {opacity:0, y:'-=18', duration:.4, delay:.7});
  for(let i = 0; i < 12; i++){ const s = layer('sfx-star', '✦'); g.set(s, {x:c.r.left + rnd(0, c.w), y:c.r.bottom - rnd(0, c.h*.3), scale:rnd(.6, 1.3), opacity:0});
    g.timeline({delay:.15 + i*0.05, onComplete:()=> s.remove()}).to(s, {opacity:1, duration:.08}).to(s, {y:`-=${rnd(60, 120)}`, x:`+=${rnd(-20, 20)}`, rotation:rnd(-90, 90), duration:.9, ease:'power1.out'}, 0).to(s, {opacity:0, duration:.3}, .65); }
  if(o.light) call(o.light, c.x, c.y, [1, .85, .4], true);
}
// Card unlock: a locked (greyed) card, the padlock shakes and springs open, colour floods back and sparkles burst.
function unlockSparkle(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), t = tileOf(target);
  g.set(t, {filter:'grayscale(1) brightness(.55)'});
  const lk = layer('sfx-lock', '🔒'); g.set(lk, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, scale:.6, opacity:0});
  g.timeline({onComplete:()=>{ lk.remove(); call(o.onDone); }})
    .to(lk, {scale:1, opacity:1, duration:.2, ease:'back.out(2)'})
    .to(lk, {keyframes:[{rotation:-14, duration:.06}, {rotation:12, duration:.06}, {rotation:-10, duration:.06}, {rotation:8, duration:.06}, {rotation:0, duration:.06}]}, '+=0.15')
    .to(lk, {keyframes:[{rotation:-16, duration:.05}, {rotation:16, duration:.05}, {rotation:0, duration:.05}]}, '+=0.1')
    .add(()=>{ lk.textContent = '🔓'; ring(c.x, c.y, 'sfx-string', c.w*1.6, 520);
      g.to(t, {filter:'grayscale(0) brightness(1.35)', duration:.35, ease:'power2.out'}); g.to(t, {filter:'grayscale(0) brightness(1)', duration:.5, delay:.35, clearProps:'filter'});
      g.timeline().to(t, {scale:1.08, duration:.12}).to(t, {scale:1, duration:.45, ease:'elastic.out(1, .45)', clearProps:'transform'});
      const sw = document.createElement('span'); sw.className = 'shine-sweep'; sw.setAttribute('aria-hidden', 'true'); if(getComputedStyle(t).position === 'static') t.style.position = 'relative'; t.appendChild(sw); later(()=> sw.remove(), 800);
      for(let i = 0; i < 16; i++){ const s = layer('sfx-twinkle'), a = i/16*6.28 + rnd(-.15, .15), d = rnd(.55, 1.05)*Math.max(c.w, c.h)*.75;
        g.set(s, {x:c.x - 6, y:c.y - 6, scale:.2, opacity:1, rotation:0});
        g.timeline({onComplete:()=> s.remove()}).to(s, {x:`+=${Math.cos(a)*d}`, y:`+=${Math.sin(a)*d}`, scale:rnd(.8, 1.5), rotation:90, duration:.55, ease:'power3.out'}).to(s, {scale:0, opacity:0, duration:.3, delay:rnd(0, .25)}); }
      if(o.light) call(o.light, c.x, c.y, [1, .95, .7], false); })
    .to(lk, {y:'-=34', rotation:-20, opacity:0, duration:.45, ease:'power2.in'});
}
// Sky-drop (map skirmish start): cards fall from above the screen, their shadows growing on the ground, and land
// with a squash and a dust ring, one after another.
function skyDrop(cards, o){
  o = o || {}; const list = (cards||[]).filter(Boolean); if(!list.length) return;
  if(!ready()){ list.forEach((el, i)=> call(o.onEachLand, el, i)); call(o.onDone); return; }
  const g = G(), fall = (o.fall || 520)/1000, gap = (o.stagger || 140)/1000;
  list.forEach((el, i)=>{
    const t = tileOf(el), c = centre(t), from = -(c.r.bottom + 60), sh = layer('sfx-shadow');
    g.set(sh, {x:c.x - c.w*0.55, y:c.r.bottom - 10, width:c.w*1.1, height:18, scale:.25, opacity:0}); sh.style.zIndex = 9980;
    g.set(t, {y:from, rotation:rnd(-14, 14), opacity:1});
    g.timeline({delay:i*gap, onComplete:()=>{ sh.remove(); if(i === list.length - 1) call(o.onDone); }})
      .to(sh, {scale:1, opacity:.85, duration:fall, ease:'power3.in'}, 0)
      .to(t, {y:0, rotation:0, duration:fall, ease:'power3.in'}, 0)
      .add(()=>{ ring(c.x, c.r.bottom - 4, 'sfx-ring-dust', c.w*1.7, 520);
        for(let k = 0; k < 5; k++){ const p = layer('sfx-dust'); g.set(p, {x:c.r.left + c.w*k/4 - 11, y:c.r.bottom - 14, scale:.5, opacity:.9});
          g.to(p, {x:`+=${(k/4 - .5)*60}`, y:`-=${rnd(4, 14)}`, scale:1.8, opacity:0, duration:.55, ease:'power2.out', onComplete:()=> p.remove()}); }
        if(o.light) call(o.light, c.x, c.r.bottom, [1, .9, .7], false); call(o.onEachLand, el, i); })
      .to(t, {scaleY:.8, scaleX:1.12, transformOrigin:'50% 100%', duration:.07, ease:'power2.out'})
      .to(t, {scaleY:1, scaleX:1, duration:.45, ease:'elastic.out(1, .4)', clearProps:'transform'})
      .to(sh, {opacity:.0, duration:.25}, '<');
  });
}
function setImages(arrow, fire){ IMG.arrow = arrow || ''; IMG.fire = fire || ''; }
root.SkillFX = {bowShot, volley, pierce, dart, frostBolt, lightning, heal, shieldUp, rally, setImages, knock, burst, ring, boomerang, boomerangThrow, boomerangCastle, boomerangReturn, shieldDrop, backstab, elementDeath, feathers};
Object.assign(root.SkillFX, {swarm, regen, poisonCloud, bleedDrip, thorns, earthquake, quickStrike, evasiveDodge, cleave, guardian, dynamite, helmetDeflect, darksight, frostChill, scorch, lanternGlow,
  shockwave, castleCrumble, levelUp, unlockSparkle, skyDrop});
// ---- 2026-10-14 (sixth pass): Fireball, Meteor, Banana.
//   SkillFX.fireball(caster, target, opts{sides, onImpact, light})   SkillFX.meteor(target, opts{sides, host, onImpact, light})
//   SkillFX.bananaThrow(thrower, target, opts{onImpact})             SkillFX.munch(target, opts{glyph})
const SIXTH_CSS = `
.sfx-fb{width:26px; height:26px; border-radius:50%; background:radial-gradient(circle at 42% 40%, #fffbe0 0, #ffd54a 28%, #ff8a1e 55%, #d8380e 78%, rgba(160,30,0,0) 100%); box-shadow:0 0 14px 6px rgba(255,140,30,.75);}
.sfx-fb-tail{width:10px; height:10px; border-radius:50%; background:radial-gradient(circle, rgba(255,200,80,.95), rgba(255,110,20,.6) 50%, rgba(200,40,0,0) 75%); filter:blur(1px);}
.sfx-meteor{width:34px; height:34px; border-radius:50%; background:radial-gradient(circle at 40% 38%, #fff2c2 0, #ffb04a 25%, #8a3a14 60%, #3a1a0c 100%); box-shadow:0 0 22px 10px rgba(255,120,30,.8);}
.sfx-meteor-trail{height:10px; border-radius:6px; background:linear-gradient(90deg, rgba(255,120,30,0), rgba(255,170,60,.85) 70%, #fff3c4); filter:blur(2px); transform-origin:100% 50%;}
.sfx-crater{border-radius:50%; background:radial-gradient(ellipse, rgba(255,150,40,.85), rgba(200,60,10,.5) 40%, rgba(80,20,0,0) 72%); mix-blend-mode:screen;}
.sfx-banana{font-size:22px; line-height:1; filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));}
`;
function sixthCss(){ if(document.getElementById('sfx-sixth-css')) return; const s = document.createElement('style'); s.id = 'sfx-sixth-css'; s.textContent = SIXTH_CSS; (document.head || document.body).appendChild(s); }
// Fireball: a flaming ball arcs from the caster to the target, leaving embers, then bursts 3 columns wide (the dynamite blast's flash,
// fire core, smoke and debris), the cards beside it knocked outward.
function fireball(caster, target, o){
  o = o || {}; if(!ready() || !caster || !target){ later(o.onImpact, 500); return; } sixthCss();
  const g = G(), a = centre(caster), b = centre(target), ball = layer('sfx-fb'), m = {x:(a.x + b.x)/2 + rnd(-40, 40), y:Math.min(a.y, b.y) - 110}, s = {t:0}, fly = (o.flight || 520)/1000;
  g.set(ball, {x:a.x - 13, y:a.y - 13, scale:.6}); let k = 0;
  const ember = ()=>{ if(k++ % 2) return; const r = ball.getBoundingClientRect(), e = layer('sfx-fb-tail'); g.set(e, {x:r.left + r.width/2 - 5, y:r.top + r.height/2 - 5, opacity:.95});
    g.to(e, {scale:.2, opacity:0, y:`+=${rnd(-6, 10)}`, duration:.4, ease:'power1.out', onComplete:()=> e.remove()}); };
  g.timeline({onComplete:()=> ball.remove()})
    .to(s, {t:1, duration:fly, ease:'power1.in', onUpdate:()=>{ const q = qpt(a, m, b, s.t); g.set(ball, {x:q.x - 13, y:q.y - 13, scale:.6 + .6*s.t}); ember(); }})
    .add(()=>{
      ball.style.opacity = 0; const span = [target].concat((o.sides||[]).filter(Boolean)).map(centre), x0 = Math.min(...span.map(c=> c.r.left)), x1 = Math.max(...span.map(c=> c.r.right)), W = Math.max(b.w*3, x1 - x0);
      const f = layer('sfx-flash'); g.set(f, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:40, height:40, opacity:1});
      g.to(f, {width:W*1.15, height:b.h*1.6, opacity:0, duration:.4, ease:'power2.out', onComplete:()=> f.remove()});
      const fb = layer('sfx-fireball'); g.set(fb, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:20, height:20, opacity:1});
      g.to(fb, {width:W*.9, height:b.h*1.1, duration:.25, ease:'power3.out'}); g.to(fb, {opacity:0, duration:.4, delay:.22, onComplete:()=> fb.remove()});
      ring(b.x, b.y, 'sfx-ignite', W, 520); burst(b.x, b.y, -90, 'fire', 16);
      (o.sides||[]).filter(Boolean).forEach(el=>{ const c = centre(el); burst(c.x, c.y, c.x < b.x ? 180 : 0, 'fire', 8); knock(el, c.x < b.x ? 180 : 0, 1.1); });
      knock(target, -90, 1.4); if(o.light) call(o.light, b.x, b.y, [1, .55, .2], true); call(o.onImpact);
    });
}
// Meteor: a burning rock streaks down from the top of the screen onto the target, a shockwave rolls out, and the crater glows.
function meteor(target, o){
  o = o || {}; if(!ready() || !target){ later(o.onImpact, 600); return; } sixthCss();
  const g = G(), b = centre(target), rock = layer('sfx-meteor'), trail = layer('sfx-meteor-trail'), fall = (o.fall || 560)/1000;
  const sx = b.x - Math.min(260, window.innerWidth*.3), sy = -60, ang = Math.atan2(b.y - sy, b.x - sx)*57.3, len = Math.hypot(b.x - sx, b.y - sy);
  g.set(rock, {x:sx - 17, y:sy - 17}); g.set(trail, {x:sx - 140, y:sy - 5, width:140, rotation:ang, opacity:.9});
  g.timeline({onComplete:()=>{ rock.remove(); trail.remove(); }})
    .to(rock, {x:b.x - 17, y:b.y - 17, rotation:200, duration:fall, ease:'power2.in'}, 0)
    .to(trail, {x:b.x - 140, y:b.y - 5, width:Math.min(220, len*.5), duration:fall, ease:'power2.in'}, 0)
    .add(()=>{
      rock.style.opacity = 0; trail.style.opacity = 0;
      shockwave(b.x, b.y, {size:Math.max(260, b.w*5), cards:o.sides || [], light:o.light});
      const cr = layer('sfx-crater'); g.set(cr, {x:b.x - b.w*.7, y:b.r.bottom - b.h*.35, width:b.w*1.4, height:b.h*.5, opacity:0});
      g.timeline({onComplete:()=> cr.remove()}).to(cr, {opacity:1, duration:.15}).to(cr, {opacity:.55, duration:.4, yoyo:true, repeat:3}).to(cr, {opacity:0, duration:.6});
      burst(b.x, b.y, -90, 'fire', 18); burst(b.x, b.y, -90, 'wood', 10); ring(b.x, b.r.bottom, 'sfx-ring-dust', b.w*2.6, 700);
      knock(target, -90, 1.8); const host = o.host || null; if(host) shakeEl(host, 8, .5);
      call(o.onImpact);
    }, fall);
}
// Banana: a banana spins in an arc from the thrower onto the target and bounces off.
function bananaThrow(thrower, target, o){
  o = o || {}; if(!ready() || !thrower || !target){ later(o.onImpact, 400); return; } sixthCss();
  const g = G(), a = centre(thrower), b = centre(target), bn = layer('sfx-banana', '🍌'), m = {x:(a.x + b.x)/2, y:Math.min(a.y, b.y) - 80}, s = {t:0};
  g.set(bn, {x:a.x, y:a.y, xPercent:-50, yPercent:-50});
  g.timeline({onComplete:()=> bn.remove()})
    .to(s, {t:1, duration:.45, ease:'power1.in', onUpdate:()=>{ const q = qpt(a, m, b, s.t); g.set(bn, {x:q.x, y:q.y}); }})
    .to(bn, {rotation:720, duration:.45, ease:'none'}, 0)
    .add(()=>{ knock(target, -90, .8); call(o.onImpact); })
    .to(bn, {x:`+=${rnd(-30, 30)}`, y:'+=30', rotation:'+=180', opacity:0, duration:.35, ease:'power1.in'});
}
// Munch: the fruit pops up over the card and gets eaten in three bites.
function munch(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; } sixthCss();
  const g = G(), c = centre(target), f = layer('sfx-banana', o.glyph || '🍌');
  g.set(f, {x:c.x, y:c.r.top + c.h*.25, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
  g.timeline({onComplete:()=>{ f.remove(); call(o.onDone); }})
    .to(f, {scale:1.1, opacity:1, duration:.15, ease:'back.out(3)'})
    .to(f, {scaleX:.8, duration:.08, yoyo:true, repeat:1}).to(f, {scale:.7, duration:.1}).to(f, {scale:.45, duration:.1}).to(f, {scale:.1, opacity:0, duration:.12});
  g.fromTo(tileOf(target), {scaleY:1}, {scaleY:.94, duration:.08, yoyo:true, repeat:3, transformOrigin:'50% 100%', clearProps:'transform'});
}
Object.assign(root.SkillFX, {fireball, meteor, bananaThrow, munch});
// ---- 2026-10-14 (seventh pass): Smoke Bomb and Psychic.
//   SkillFX.smokeBomb(thrower, target, opts{onImpact})   SkillFX.mindWave(caster, target, opts{immune})
const SEVENTH_CSS = `
.sfx-smokebomb{width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 38% 35%, #9aa0a8 0, #3c4148 45%, #15181c 100%); box-shadow:0 0 0 2px rgba(0,0,0,.25);}
.sfx-smokebomb::after{content:''; position:absolute; left:11px; top:-6px; width:3px; height:8px; border-radius:2px; background:linear-gradient(#ffd34a, #c8711e); transform:rotate(25deg);}
.sfx-smoke{width:40px; height:40px; border-radius:50%; background:radial-gradient(circle, rgba(215,218,224,.95) 0, rgba(170,175,184,.75) 45%, rgba(140,146,156,0) 72%); filter:blur(2px);}
.sfx-mind{border-radius:50%; border:3px solid rgba(190,120,255,.9); box-shadow:0 0 12px 2px rgba(160,80,255,.65), inset 0 0 10px rgba(200,140,255,.5);}
.sfx-mind.immune{border-color:rgba(170,170,190,.7); box-shadow:none;}
`;
function seventhCss(){ if(document.getElementById('sfx-seventh-css')) return; const s = document.createElement('style'); s.id = 'sfx-seventh-css'; s.textContent = SEVENTH_CSS; (document.head || document.body).appendChild(s); }
// A grey puff that swells over a card and drifts apart.
function smokePuff(target){
  const g = G(); if(!g || !target) return; seventhCss(); const c = centre(target);
  for(let k = 0; k < 7; k++){ const p = layer('sfx-smoke'); g.set(p, {x:c.x - 20 + rnd(-c.w*.3, c.w*.3), y:c.y - 20 + rnd(-c.h*.25, c.h*.25), scale:.3, opacity:.95});
    g.to(p, {scale:rnd(1.6, 2.6), opacity:0, x:`+=${rnd(-24, 24)}`, y:`-=${rnd(6, 26)}`, duration:rnd(.8, 1.3), ease:'power1.out', onComplete:()=> p.remove()}); }
}
// Smoke Bomb: a lit bomb lobbed from the thrower onto the target, then it bursts into a grey cloud.
function smokeBomb(thrower, target, o){
  o = o || {}; if(!ready() || !thrower || !target){ later(o.onImpact, 400); return; } seventhCss();
  const g = G(), a = centre(thrower), b = centre(target), bm = layer('sfx-smokebomb'), m = {x:(a.x + b.x)/2, y:Math.min(a.y, b.y) - 90}, s = {t:0};
  g.set(bm, {x:a.x - 9, y:a.y - 9});
  g.timeline({onComplete:()=> bm.remove()})
    .to(s, {t:1, duration:.5, ease:'power1.in', onUpdate:()=>{ const q = qpt(a, m, b, s.t); g.set(bm, {x:q.x - 9, y:q.y - 9}); }})
    .to(bm, {rotation:540, duration:.5, ease:'none'}, 0)
    .add(()=>{ bm.style.opacity = 0; smokePuff(target); call(o.onImpact); });
}
// Psychic: purple rings of thought pulse out from the attacker's mind into the target (grey and faint when it has no mind).
function mindWave(caster, target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; } seventhCss();
  const g = G(), b = centre(target), sz = Math.max(b.w, b.h);
  for(let k = 0; k < 3; k++){ const r = layer('sfx-mind' + (o.immune ? ' immune' : '')); g.set(r, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:sz*1.5, height:sz*1.5, opacity:0});
    g.to(r, {width:sz*.2, height:sz*.2, opacity:o.immune ? .6 : 1, duration:.42, delay:k*.12, ease:'power2.in', onComplete:()=> r.remove()}); }
  if(!o.immune) g.fromTo(tileOf(target), {filter:'hue-rotate(0deg) saturate(1)'}, {filter:'hue-rotate(250deg) saturate(1.8)', duration:.12, yoyo:true, repeat:3, delay:.4, clearProps:'filter', onComplete:()=> call(o.onDone)});
}
Object.assign(root.SkillFX, {smokeBomb, smokePuff, mindWave});
// ---- 2026-10-15 (eighth pass, user: "widen the effects list we have"): twenty-nine more skill effects, so the keywords
// that real cards carry most (Flying, Armor, Swimmer, Fork, Pierce, the elemental statuses, Sap, Bloom...) each get their
// own short look instead of only a floating word. Same rules as above: fixed overlays on <body> (class sfx-*, removed when
// done), about a second or less, GSAP motion; with reduced motion or no GSAP they skip the motion and still call back.
//   SkillFX.swoop(attacker, target, {flight, onImpact})      SkillFX.gust(target, {dir})          SkillFX.splash(target)
//   SkillFX.armorBlock(target, {from, partial, shatter})     SkillFX.forkProngs(attacker, targets, {kind, onEachImpact})
//   SkillFX.pierceThrough(target, {from})                    SkillFX.stunStars(target, {glyph, n})
//   SkillFX.freezeEncase(target)  SkillFX.sleepZzz(target)  SkillFX.paralyzeSpark(target)  SkillFX.acidCorrode(target)
//   SkillFX.lifeDrain(from, to, {onDone})  SkillFX.bloomPollen(src, target, {onDone})  SkillFX.fearShiver(target)
//   SkillFX.curseDrain(target)  SkillFX.targetMark(target)  SkillFX.blindInk(target)  SkillFX.mirrorFlash(defender, attacker)
//   SkillFX.reviveRise(target)  SkillFX.summonPortal(target)  SkillFX.lootArc(from, to, {glyph, n, onDone})
//   SkillFX.prayerLight(target)  SkillFX.espritAura(target)  SkillFX.rageFlare(target)  SkillFX.scarMark(target, {fromLeft})
//   SkillFX.clockTick(target, {dir})  SkillFX.parry(defender, attacker)  SkillFX.crownCrack(target)
//   SkillFX.stealthSlip(attacker, castle)
const EIGHTH_CSS = `
.sfx-swoop{overflow:visible;} .sfx-swoop path{fill:none; stroke-linecap:round;}
.sfx-swoop path.air{stroke:rgba(235,245,255,.7); stroke-width:9; filter:blur(2px);} .sfx-swoop path.core{stroke:#ffffff; stroke-width:2.2;}
.sfx-gust{height:3px; border-radius:3px; background:linear-gradient(90deg, rgba(220,240,255,0), rgba(235,248,255,.95) 60%, rgba(220,240,255,0));}
.sfx-droplet{width:7px; height:10px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 40% 60%, #e8f8ff, #58b6f0 55%, #1f6fb8); box-shadow:0 0 4px rgba(90,180,255,.7);}
.sfx-ring.sfx-water{border:3px solid rgba(120,200,255,.9); box-shadow:0 0 12px rgba(80,170,255,.6), inset 0 0 8px rgba(200,240,255,.7);}
.sfx-ring.sfx-gold{border:3px solid rgba(255,214,90,.95); box-shadow:0 0 14px rgba(255,190,60,.75);}
.sfx-ring.sfx-violet{border:3px solid rgba(190,120,255,.9); box-shadow:0 0 12px rgba(160,80,255,.7);}
.sfx-ring.sfx-red{border:3px solid rgba(255,90,70,.95); box-shadow:0 0 12px rgba(255,60,40,.7);}
.sfx-plate{border-radius:12px; border:3px solid rgba(225,232,244,.95); background:linear-gradient(125deg, rgba(255,255,255,.1) 20%, rgba(255,255,255,.75) 38%, rgba(190,202,220,.3) 46%, rgba(255,255,255,.08) 60%); background-size:260% 100%;
  box-shadow:0 0 16px rgba(200,215,240,.8), inset 0 0 14px rgba(235,242,255,.6);}
.sfx-prong{width:5px; border-radius:3px 3px 1px 1px; background:linear-gradient(#ffffff, #d6dfeb 30%, #7d8aa0); box-shadow:0 0 8px rgba(220,235,255,.9); clip-path:polygon(50% 0, 100% 16%, 100% 100%, 0 100%, 0 16%);}
.sfx-prong.is-ink{width:8px; background:linear-gradient(#f0c8ff, #9b4fd0 40%, #4a1d6e); box-shadow:0 0 8px rgba(180,90,255,.8); border-radius:8px 8px 3px 3px; clip-path:none;}
.sfx-lance{height:4px; border-radius:2px; background:linear-gradient(90deg, rgba(255,255,255,0), #fff2c8 55%, #ffffff); box-shadow:0 0 10px 2px rgba(255,236,170,.9);}
.sfx-orbit{font-size:15px; line-height:1; color:#ffe27a; text-shadow:0 0 6px rgba(255,220,90,.95), 0 1px 0 rgba(0,0,0,.4);}
.sfx-ice{border-radius:10px; transform-origin:50% 100%; background:linear-gradient(160deg, rgba(240,250,255,.8), rgba(170,215,255,.45) 45%, rgba(220,240,255,.7)); border:2px solid rgba(225,245,255,.95);
  box-shadow:0 0 18px rgba(150,210,255,.85), inset 0 0 14px rgba(255,255,255,.85);}
.sfx-crack{overflow:visible;} .sfx-crack path{fill:none; stroke:rgba(255,255,255,.95); stroke-width:1.6; stroke-linecap:round; filter:drop-shadow(0 0 2px rgba(120,190,255,.9));}
.sfx-zzz{font:900 18px 'Baloo 2',system-ui,sans-serif; color:#dfe7ff; text-shadow:0 0 6px rgba(140,160,255,.95), 0 2px 0 rgba(0,0,0,.35);}
.sfx-dim{border-radius:12px; background:radial-gradient(ellipse at 50% 40%, rgba(40,40,90,.15), rgba(30,30,80,.55));}
.sfx-crackle{overflow:visible;} .sfx-crackle path{fill:none; stroke:#fff7a8; stroke-width:2; stroke-linejoin:round; stroke-linecap:round; filter:drop-shadow(0 0 4px rgba(255,220,60,.95));}
.sfx-acid{width:8px; height:11px; border-radius:50% 50% 50% 50% / 62% 62% 38% 38%; background:radial-gradient(circle at 40% 60%, #f6ffb0, #b6e830 55%, #5f8a10); box-shadow:0 0 6px rgba(190,240,40,.85);}
.sfx-fizz{width:6px; height:6px; border-radius:50%; border:1.5px solid rgba(225,255,120,.95);}
.sfx-mote.is-red{background:#ffd0c8; box-shadow:0 0 8px 3px rgba(230,50,50,.85);}
.sfx-petal{width:10px; height:7px; border-radius:70% 0 70% 0; background:linear-gradient(135deg, #ffe7f1, #f59ac0); box-shadow:0 0 3px rgba(255,170,200,.8);}
.sfx-pollen{width:4px; height:4px; border-radius:50%; background:#fff3a6; box-shadow:0 0 5px 2px rgba(255,220,90,.85);}
.sfx-sweat{font-size:13px; line-height:1;}
.sfx-shiver{border-radius:12px; box-shadow:inset 0 0 24px 7px rgba(120,70,190,.65);}
.sfx-tendril{overflow:visible;} .sfx-tendril path{fill:none; stroke:rgba(60,18,80,.9); stroke-width:3.5; stroke-linecap:round; filter:drop-shadow(0 0 5px rgba(150,60,200,.85));}
.sfx-reticle{border-radius:50%; border:2px solid rgba(255,90,70,.95); box-shadow:0 0 10px rgba(255,80,60,.8), inset 0 0 6px rgba(255,80,60,.5);}
.sfx-reticle::before, .sfx-reticle::after{content:''; position:absolute; left:50%; top:-14%; width:2px; height:128%; margin-left:-1px; background:linear-gradient(rgba(255,90,70,.95) 0 26%, transparent 26% 74%, rgba(255,90,70,.95) 74%);}
.sfx-reticle::after{transform:rotate(90deg);}
.sfx-ink{width:34px; height:34px; border-radius:46% 54% 50% 50%; background:radial-gradient(circle at 45% 45%, rgba(18,12,26,.96), rgba(30,20,45,.88) 52%, rgba(30,20,45,0) 72%);}
.sfx-mirror{border-radius:10px; border:2px solid rgba(225,242,255,.95); background:linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.9) 45%, rgba(200,230,255,.6) 50%, rgba(255,255,255,0) 64%); background-size:260% 100%; box-shadow:0 0 14px rgba(180,220,255,.8);}
.sfx-pillar{background:linear-gradient(90deg, rgba(255,240,180,0), rgba(255,248,210,.8) 30%, #fffef4 50%, rgba(255,248,210,.8) 70%, rgba(255,240,180,0)); filter:blur(2px); transform-origin:50% 0;}
.sfx-rune{border-radius:50%; border:2px dashed rgba(170,255,190,.95); box-shadow:0 0 14px rgba(100,240,140,.8), inset 0 0 12px rgba(120,255,160,.6);}
.sfx-loot{font-size:17px; line-height:1; filter:drop-shadow(0 2px 2px rgba(0,0,0,.4));}
.sfx-beam{background:linear-gradient(rgba(255,250,220,0), rgba(255,246,200,.7) 35%, rgba(255,240,170,.3)); filter:blur(3px); transform-origin:50% 0;}
.sfx-chev{width:18px; height:10px; background:#ffd65a; clip-path:polygon(0 100%, 50% 0, 100% 100%, 80% 100%, 50% 38%, 20% 100%); filter:drop-shadow(0 0 4px rgba(255,200,60,.95));}
.sfx-steam{width:22px; height:22px; border-radius:50%; background:radial-gradient(circle, rgba(255,130,110,.8), rgba(255,90,70,0) 70%); filter:blur(1.5px);}
.sfx-vein{font-size:20px; line-height:1; filter:drop-shadow(0 0 4px rgba(255,40,40,.9));}
.sfx-claw{overflow:visible;} .sfx-claw path{fill:none; stroke:#ff5a4a; stroke-width:3.5; stroke-linecap:round; filter:drop-shadow(0 0 4px rgba(255,40,40,.85));}
.sfx-clock{width:44px; height:44px; border-radius:50%; background:radial-gradient(circle, #fffdf3 0 58%, #c9a24a 60% 67%, rgba(0,0,0,0) 68%); box-shadow:0 2px 6px rgba(0,0,0,.35);}
.sfx-clock i{position:absolute; left:50%; top:calc(50% - 14px); width:2.5px; height:14px; margin-left:-1.25px; background:#3a2a10; border-radius:2px; transform-origin:50% 100%;}
.sfx-clock i.min{top:calc(50% - 10px); height:10px; width:3px; background:#8a2414;}
.sfx-clock.is-fast{background:radial-gradient(circle, #fffdf3 0 58%, #7a4a2a 60% 67%, rgba(0,0,0,0) 68%);}
.sfx-blade{font-size:22px; line-height:1; filter:drop-shadow(0 0 6px rgba(255,250,220,.9));}
.sfx-crown{font-size:26px; line-height:1; filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));}
.sfx-shade{border-radius:12px; background:radial-gradient(ellipse, rgba(20,10,35,.8), rgba(20,10,35,.4) 60%, rgba(20,10,35,.1) 85%);}
`;
function eighthCss(){ if(document.getElementById('sfx-eighth-css')) return; const s = document.createElement('style'); s.id = 'sfx-eighth-css'; s.textContent = EIGHTH_CSS; (document.head || document.body).appendChild(s); }
const go = ()=>{ if(!ready()) return false; eighthCss(); return true; };
const angTo = (a, b)=> Math.atan2(b.y - a.y, b.x - a.x);
// Flying: the attacker's swoop: a bright air-trail climbs over the field and dives onto the target; feathers fly on impact.
function swoop(attacker, target, o){
  o = o || {}; if(!go() || !attacker || !target){ later(o.onImpact, o.flight || 300); return; }
  const g = G(), a = centre(attacker), b = centre(target), up = Math.min(a.y, b.y) - Math.max(a.h, b.h)*0.8, fly = Math.min(.5, (o.flight || 320)/1000);
  const sv = svgLayer('sfx-swoop'), d = `M${a.x},${a.y - a.h*.3} C${a.x + (b.x - a.x)*.1},${up} ${b.x - (b.x - a.x)*.1},${up} ${b.x},${b.y}`;
  const air = drawPath(sv, d, 'air'), core = drawPath(sv, d, 'core');
  g.timeline({onComplete:()=> sv.remove()}).to([air, core], {strokeDashoffset:0, duration:fly, ease:'power2.in'}).to(sv, {opacity:0, duration:.3});
  later(()=>{ feathers(b.x, b.y - b.h*.15, 8); ring(b.x, b.y, 'sfx-string', b.w*1.3, 320); knock(target, a.y < b.y ? 90 : -90, .9); call(o.onImpact); }, fly*1000);
}
// Tailwind (Flying): a gust of wind streaks across the card and it leans with it.
function gust(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), s = o.dir || 1, t = tileOf(target);
  for(let i = 0; i < 6; i++){ const w = layer('sfx-gust'), len = rnd(50, 90);
    g.set(w, {x:c.x - s*c.w*.9 - len/2, y:c.r.top + c.h*(0.15 + i*0.14), width:len, opacity:0, rotation:rnd(-6, 6)});
    g.timeline({delay:i*0.04, onComplete:()=> w.remove()}).to(w, {opacity:.95, duration:.08}).to(w, {x:`+=${s*c.w*1.8}`, duration:.45, ease:'power1.inOut'}, 0).to(w, {opacity:0, duration:.15}, .32); }
  g.timeline({onComplete:()=> call(o.onDone)}).to(t, {rotation:s*4, x:s*5, duration:.15, ease:'power2.out'}).to(t, {rotation:0, x:0, duration:.45, ease:'elastic.out(1, .5)', clearProps:'transform'});
}
// Swimmer: the card bobs up out of a splash: blue rings at its foot and droplets thrown up and falling back.
function splash(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), y = c.r.bottom - 6;
  ring(c.x, y, 'sfx-water', c.w*1.6, 520); later(()=> ring(c.x, y, 'sfx-water', c.w*1.1, 420), 120);
  for(let i = 0; i < 12; i++){ const d = layer('sfx-droplet'), a = rnd(-150, -30)*Math.PI/180, v = rnd(30, 70);
    g.set(d, {x:c.x - 3.5 + rnd(-c.w*.3, c.w*.3), y:y - 10, opacity:1});
    g.to(d, {keyframes:[{x:`+=${Math.cos(a)*v*.6}`, y:`+=${Math.sin(a)*v}`, duration:.28, ease:'power2.out'}, {x:`+=${Math.cos(a)*v*.4}`, y:`+=${v*.9}`, opacity:0, duration:.32, ease:'power2.in'}], onComplete:()=> d.remove()}); }
  g.timeline({onComplete:()=> call(o.onDone)}).to(tileOf(target), {y:-7, duration:.14, ease:'power2.out'}).to(tileOf(target), {y:0, duration:.45, ease:'elastic.out(1, .4)', clearProps:'transform'});
}
// Armor: a steel plate flashes over the card with a glint, sparks fly off the struck edge (fewer for a partial block).
// shatter: the plate breaks into chips that fall away (Perforate's armour lost for good).
function armorBlock(target, o){
  o = o || {}; if(!go() || !target){ call(o.onImpact); return; }
  const g = G(), c = centre(target), from = o.from == null ? -90 : o.from, rad = from*Math.PI/180, k = o.partial ? .6 : 1;
  const pl = over(target, 'sfx-plate', 3); g.set(pl, {opacity:0, scale:1.05, backgroundPosition:'100% 0'});
  g.timeline({onComplete:()=> pl.remove()}).to(pl, {opacity:.95*k, scale:1, duration:.08, ease:'power3.out'}).to(pl, {backgroundPosition:'0% 0', duration:.3, ease:'power1.inOut'}, 0)
    .to(pl, {opacity:0, duration:o.shatter ? .12 : .35, delay:o.shatter ? .05 : .1*k});
  const px = c.x + Math.cos(rad)*c.w*.3, py = c.y + Math.sin(rad)*c.h*.4;
  for(let i = 0; i < Math.round(9*k); i++){ const s = layer('sfx-spark'), a = (from + rnd(-70, 70))*Math.PI/180, d = rnd(18, 44);
    g.set(s, {x:px - 2, y:py - 2}); g.to(s, {x:`+=${Math.cos(a)*d}`, y:`+=${Math.sin(a)*d}`, opacity:0, scale:.4, duration:rnd(.2, .35), ease:'power2.out', onComplete:()=> s.remove()}); }
  if(o.shatter) for(let i = 0; i < 10; i++){ const ch = layer('sfx-chip'); g.set(ch, {x:c.r.left + rnd(.1, .9)*c.w, y:c.r.top + rnd(.1, .7)*c.h, rotation:rnd(0, 90)});
    g.to(ch, {x:`+=${rnd(-30, 30)}`, y:`+=${rnd(40, 80)}`, rotation:'+=360', opacity:0, duration:rnd(.45, .7), ease:'power1.in', delay:.1, onComplete:()=> ch.remove()}); }
  if(!o.partial && !o.shatter){ const h = layer('sfx-helmet', '🛡️'); g.set(h, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
    g.timeline({onComplete:()=> h.remove()}).to(h, {scale:1.2, opacity:1, duration:.1, ease:'back.out(3)'}).to(h, {scale:1, duration:.1}).to(h, {opacity:0, y:'-=12', duration:.3, delay:.2}); }
  ring(px, py, 'sfx-string', 36 + 24*k, 260); knock(target, from + 180, .35*k);
  if(o.light) call(o.light, px, py, [1, 1, .9], false);
  call(o.onImpact);
}
// Fork / Trident / Pitchfork / Octolash: steel tines (purple tentacles for Octolash) thrust into each struck card and pull back.
function forkProngs(attacker, targets, o){
  o = o || {}; const list = (targets||[]).filter(Boolean); if(!list.length) return;
  if(!go()){ list.forEach((el, i)=> call(o.onEachImpact, el, i)); return; }
  const g = G(), a = attacker ? centre(attacker) : null, ink = o.kind === 'octolash', n = o.kind === 'pitchfork' ? 4 : o.kind === 'fork' ? 2 : 3; // tines: Fork 2 (2026-10-15), Trident 3, Pitchfork 4
  list.forEach((el, i)=> later(()=>{
    const b = centre(el), ang = a ? angTo(a, b) : Math.PI/2, ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, L = b.h*.55, deg = ang*57.3;
    for(let k = 0; k < n; k++){ const p = layer('sfx-prong' + (ink ? ' is-ink' : '')), off = (k - (n - 1)/2)*b.w*.16;
      const bx = b.x + px*off, by = b.y + py*off;
      g.set(p, {height:L, x:bx - ux*(L + b.h*.7) - 2.5, y:by - uy*(L + b.h*.7) - L, rotation:deg + 90, transformOrigin:'50% 100%', opacity:0});
      g.timeline({delay:k*0.02, onComplete:()=> p.remove()}).to(p, {opacity:1, duration:.05})
        .to(p, {x:bx - ux*L*.55 - 2.5, y:by - uy*L*.55 - L, duration:.12, ease:'power3.in'}, 0)
        .to(p, {x:`-=${ux*30}`, y:`-=${uy*30}`, opacity:0, duration:.25, ease:'power2.in', delay:.12}); }
    later(()=>{ knock(el, deg, .8); burst(b.x, b.y, deg, ink ? 'poison' : 'zap', 6); ring(b.x, b.y, ink ? 'sfx-violet' : 'sfx-string', b.w*1.1, 300); call(o.onEachImpact, el, i); }, 130);
  }, i*70));
}
// Pierce: a lance of light punches straight through the card and out the far side, throwing chips from the exit.
function pierceThrough(target, o){
  o = o || {}; if(!go() || !target){ call(o.onImpact); return; }
  const g = G(), c = centre(target), from = (o.from == null ? -90 : o.from)*Math.PI/180, ux = -Math.cos(from), uy = -Math.sin(from), L = Math.max(c.w, c.h)*2.2;
  const ln = layer('sfx-lance'); g.set(ln, {x:c.x - ux*L*.65, y:c.y - uy*L*.65 - 2, width:L*.6, rotation:Math.atan2(uy, ux)*57.3, transformOrigin:'0 50%', scaleX:.2, opacity:0});
  g.timeline({onComplete:()=> ln.remove()}).to(ln, {opacity:1, scaleX:1, duration:.08}).to(ln, {x:`+=${ux*L*.9}`, y:`+=${uy*L*.9}`, duration:.18, ease:'power2.in'}, .02).to(ln, {opacity:0, duration:.15}, .18);
  later(()=>{ ring(c.x, c.y, 'sfx-string', c.w*.7, 260); burst(c.x + ux*c.h*.45, c.y + uy*c.h*.45, Math.atan2(-uy, -ux)*57.3, 'zap', 8); knock(target, Math.atan2(uy, ux)*57.3, .9);
    g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.6)', duration:.06, yoyo:true, repeat:1, clearProps:'filter'}); call(o.onImpact); }, 110);
}
// Stun (and Stagger/Confused/Tipsy with their own glyph): stars wheel round the card's head while it wobbles.
function stunStars(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), n = o.n || 4, st = {a:0}, t = tileOf(target);
  const els = []; for(let i = 0; i < n; i++){ const s = layer('sfx-orbit', o.glyph || '★'); g.set(s, {x:c.x, y:c.r.top, xPercent:-50, yPercent:-50, opacity:0}); els.push(s); }
  const place = ()=> els.forEach((s, i)=>{ const a = st.a + i*6.283/n, z = Math.sin(a); g.set(s, {x:c.x + Math.cos(a)*c.w*.34, y:c.r.top + 6 + z*7, scale:.75 + .35*(z + 1)/2, zIndex:z > 0 ? 9992 : 9990}); });
  g.timeline({onComplete:()=>{ els.forEach(s=> s.remove()); call(o.onDone); }}).to(els, {opacity:1, duration:.12}, 0).to(st, {a:6.283*1.3, duration:.95, ease:'sine.inOut', onUpdate:place}, 0).to(els, {opacity:0, duration:.2}, .78);
  g.to(t, {keyframes:[{rotation:-5, duration:.1}, {rotation:4, duration:.12}, {rotation:-3, duration:.12}, {rotation:2, duration:.12}, {rotation:0, duration:.1}], clearProps:'transform'});
}
// Freeze: a block of ice grows up over the card from its foot, cracks spider across it, then it glazes away.
function freezeEncase(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), ice = over(target, 'sfx-ice', 3); g.set(ice, {scaleY:0, opacity:.95});
  const sv = svgLayer('sfx-crack'), x0 = c.x + rnd(-c.w*.15, c.w*.15), y0 = c.y + rnd(-c.h*.15, c.h*.1); const paths = [];
  for(let k = 0; k < 5; k++){ const a = k/5*6.283 + rnd(-.3, .3); let d = `M${x0},${y0}`, x = x0, y = y0;
    for(let s = 0; s < 3; s++){ x += Math.cos(a + rnd(-.5, .5))*c.w*.14; y += Math.sin(a + rnd(-.5, .5))*c.h*.12; d += ` L${x},${y}`; } paths.push(drawPath(sv, d)); }
  g.timeline({onComplete:()=>{ ice.remove(); sv.remove(); call(o.onDone); }})
    .to(ice, {scaleY:1, duration:.22, ease:'power2.out'})
    .add(()=>{ ring(c.x, c.y, 'sfx-frost', c.w*1.3, 480); burst(c.x, c.r.top + 6, -90, 'ice', 8); })
    .to(paths, {strokeDashoffset:0, duration:.16, ease:'power1.out'})
    .to([ice, sv], {opacity:0, duration:.4, delay:.25});
}
// Sleep: the card dims and sways while three Z's float up and away.
function sleepZzz(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), dm = over(target, 'sfx-dim', 0); g.set(dm, {opacity:0});
  g.timeline({onComplete:()=> dm.remove()}).to(dm, {opacity:1, duration:.25}).to(dm, {opacity:0, duration:.35, delay:.4});
  for(let i = 0; i < 3; i++){ const z = layer('sfx-zzz', 'z'); g.set(z, {x:c.x + c.w*.12, y:c.r.top + c.h*.25, xPercent:-50, yPercent:-50, scale:.5 + i*.25, opacity:0});
    g.timeline({delay:i*.18, onComplete:()=> z.remove()}).to(z, {opacity:1, duration:.1}).to(z, {x:`+=${18 + i*8}`, y:`-=${34 + i*10}`, rotation:-14, duration:.6, ease:'sine.out'}, 0).to(z, {opacity:0, duration:.2}, .45); }
  g.timeline({onComplete:()=> call(o.onDone)}).to(tileOf(target), {rotation:-3, y:3, duration:.3, ease:'sine.inOut'}).to(tileOf(target), {rotation:2, duration:.3, ease:'sine.inOut'}).to(tileOf(target), {rotation:0, y:0, duration:.25, clearProps:'transform'});
}
// Paralyze: yellow sparks crackle round the card's edges, redrawn each flicker, and it twitches.
function paralyzeSpark(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), sv = svgLayer('sfx-crackle'), r = c.r;
  const side = ()=>{ const e = Math.floor(rnd(0, 4)), t0 = rnd(0, .6), t1 = t0 + rnd(.25, .4);
    const P = t=> e === 0 ? [r.left + r.width*t, r.top] : e === 1 ? [r.right, r.top + r.height*t] : e === 2 ? [r.left + r.width*t, r.bottom] : [r.left, r.top + r.height*t];
    let d = ''; for(let k = 0; k <= 6; k++){ const [x, y] = P(t0 + (t1 - t0)*k/6); d += (k ? ' L' : 'M') + (x + rnd(-6, 6)) + ',' + (y + rnd(-6, 6)); } return d; };
  let n = 0; const flick = ()=>{ while(sv.firstChild) sv.firstChild.remove(); if(n++ >= 6){ sv.remove(); call(o.onDone); return; }
    for(let k = 0; k < 3; k++){ const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', side()); sv.appendChild(p); } later(flick, 75); };
  flick();
  g.to(tileOf(target), {keyframes:[{x:-2, duration:.04}, {x:2, duration:.04}, {x:-1.5, duration:.04}, {x:1.5, duration:.04}, {x:0, duration:.04}], repeat:1, clearProps:'transform'});
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.5) saturate(1.4)', duration:.07, yoyo:true, repeat:3, clearProps:'filter'});
}
// Corrode / Ichor: acid splashes on the card's top edge and runs down it, fizzing, with a sickly yellow-green tint.
function acidCorrode(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target);
  for(let i = 0; i < 5; i++){ const d = layer('sfx-acid'), x = c.r.left + c.w*(0.15 + i*0.17) + rnd(-4, 4); g.set(d, {x:x - 4, y:c.r.top - 14, opacity:0, scaleY:.6});
    g.timeline({delay:i*0.06, onComplete:()=> d.remove()}).to(d, {opacity:1, y:c.r.top - 2, duration:.12, ease:'power2.in'}).to(d, {y:`+=${c.h*rnd(.45, .8)}`, scaleY:1.4, duration:.55, ease:'power1.in'}).to(d, {opacity:0, duration:.15}, '-=.15'); }
  for(let i = 0; i < 8; i++){ const b = layer('sfx-fizz'); g.set(b, {x:c.r.left + rnd(.1, .9)*c.w, y:c.r.top + rnd(.1, .8)*c.h, scale:.3, opacity:0});
    g.timeline({delay:.15 + i*0.06, onComplete:()=> b.remove()}).to(b, {opacity:1, scale:1, duration:.12}).to(b, {scale:1.6, opacity:0, y:'-=8', duration:.2}); }
  g.fromTo(tileOf(target), {filter:'hue-rotate(0deg) saturate(1)'}, {filter:'hue-rotate(45deg) saturate(1.6) brightness(.9)', duration:.18, yoyo:true, repeat:1, repeatDelay:.25, clearProps:'filter', onComplete:()=> call(o.onDone)});
}
// Sap: red life-motes are pulled out of the victim and stream into the attacker, who glows.
function lifeDrain(from, to, o){
  o = o || {}; if(!go() || !from || !to){ call(o.onDone); return; }
  const g = G(), a = centre(from), b = centre(to), n = 10;
  for(let i = 0; i < n; i++){ const m = layer('sfx-mote is-red'), s = {t:0}, p0 = {x:a.x + rnd(-a.w*.3, a.w*.3), y:a.y + rnd(-a.h*.3, a.h*.3)}, mid = {x:(a.x + b.x)/2 + rnd(-50, 50), y:(a.y + b.y)/2 + rnd(-30, 30)};
    g.set(m, {x:p0.x, y:p0.y, opacity:0});
    g.timeline({delay:i*0.04, onComplete:()=> m.remove()}).to(m, {opacity:1, duration:.08}).to(s, {t:1, duration:.45, ease:'power2.in', onUpdate:()=>{ const q = qpt(p0, mid, b, s.t); g.set(m, {x:q.x, y:q.y}); }}, 0).to(m, {opacity:0, duration:.1}); }
  g.fromTo(tileOf(from), {filter:'saturate(1)'}, {filter:'saturate(.4) brightness(.85)', duration:.2, yoyo:true, repeat:1, clearProps:'filter'});
  later(()=>{ ring(b.x, b.y, 'sfx-red', b.w*1.2, 380); g.fromTo(tileOf(to), {filter:'brightness(1)'}, {filter:'brightness(1.35) sepia(.3) hue-rotate(-20deg)', duration:.15, yoyo:true, repeat:1, clearProps:'filter'}); call(o.onDone); }, 560);
}
// Bloom: petals and pollen drift from the flowering card to the ally it heals.
function bloomPollen(src, target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), b = centre(target), a = src ? centre(src) : {x:b.x, y:b.y - 80, w:b.w, h:b.h};
  for(let i = 0; i < 12; i++){ const p = layer(i % 3 ? 'sfx-petal' : 'sfx-pollen'), s = {t:0}, p0 = {x:a.x + rnd(-a.w*.3, a.w*.3), y:a.y + rnd(-a.h*.3, 0)}, mid = {x:(a.x + b.x)/2 + rnd(-30, 30), y:Math.min(a.y, b.y) - rnd(30, 70)}, end = {x:b.x + rnd(-b.w*.3, b.w*.3), y:b.y + rnd(-b.h*.3, b.h*.2)};
    g.set(p, {x:p0.x, y:p0.y, rotation:rnd(0, 360), opacity:0});
    g.timeline({delay:i*0.035, onComplete:()=> p.remove()}).to(p, {opacity:1, duration:.1}).to(s, {t:1, duration:.55, ease:'sine.inOut', onUpdate:()=>{ const q = qpt(p0, mid, end, s.t); g.set(p, {x:q.x, y:q.y}); }}, 0).to(p, {rotation:'+=240', duration:.55}, 0).to(p, {opacity:0, duration:.15}); }
  later(()=>{ ring(b.x, b.y, 'sfx-heal', b.w*1.3, 480); call(o.onDone); }, 600);
}
// Daunt / Cower: the card shivers in a cold purple pall and a bead of sweat flies off.
function fearShiver(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), sh = over(target, 'sfx-shiver', 0); g.set(sh, {opacity:0});
  g.timeline({onComplete:()=> sh.remove()}).to(sh, {opacity:1, duration:.15}).to(sh, {opacity:.5, duration:.15, yoyo:true, repeat:1}).to(sh, {opacity:0, duration:.3});
  const kf = []; for(let i = 0; i < 10; i++) kf.push({x:(i % 2 ? 1 : -1)*rnd(1.5, 3), duration:.035}); kf.push({x:0, duration:.05});
  g.to(tileOf(target), {keyframes:kf, scale:.97, clearProps:'transform', onComplete:()=> call(o.onDone)});
  const sw = layer('sfx-sweat', '💧'); g.set(sw, {x:c.x + c.w*.3, y:c.r.top + c.h*.15, opacity:0});
  g.timeline({onComplete:()=> sw.remove()}).to(sw, {opacity:1, duration:.08}).to(sw, {x:'+=18', y:'+=26', rotation:40, duration:.45, ease:'power1.in'}, 0).to(sw, {opacity:0, duration:.15}, .35);
}
// Weaken / Render / Curse: dark tendrils climb the card from its foot and wring the colour out of it.
function curseDrain(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), sv = svgLayer('sfx-tendril'), paths = [];
  for(let k = 0; k < 3; k++){ const x = c.r.left + c.w*(.25 + k*.25); let d = `M${x},${c.r.bottom + 6}`;
    for(let s = 1; s <= 4; s++) d += ` Q${x + (s % 2 ? 1 : -1)*c.w*.14},${c.r.bottom - c.h*(s - .5)*.18} ${x},${c.r.bottom - c.h*s*.18}`; paths.push(drawPath(sv, d)); }
  g.timeline({onComplete:()=>{ sv.remove(); call(o.onDone); }}).to(paths, {strokeDashoffset:0, duration:.35, ease:'power2.out', stagger:.05}).to(sv, {opacity:0, duration:.35, delay:.2});
  g.fromTo(tileOf(target), {filter:'saturate(1) brightness(1)'}, {filter:'saturate(.25) brightness(.75)', duration:.25, yoyo:true, repeat:1, repeatDelay:.2, clearProps:'filter'});
  later(()=> ring(c.x, c.y, 'sfx-violet', c.w*1.1, 380), 250);
}
// Expose: a red crosshair spins in and locks onto the card, flashing twice.
function targetMark(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), D = Math.min(c.w, c.h)*.8, r = layer('sfx-reticle');
  g.set(r, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:D, height:D, scale:2.2, rotation:-90, opacity:0});
  g.timeline({onComplete:()=>{ r.remove(); call(o.onDone); }}).to(r, {scale:1, rotation:0, opacity:1, duration:.3, ease:'power3.out'})
    .to(r, {scale:.9, duration:.06, yoyo:true, repeat:3}).to(r, {opacity:0, scale:1.15, duration:.25, delay:.15});
  later(()=> g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.3) sepia(.4) hue-rotate(-30deg)', duration:.08, yoyo:true, repeat:3, clearProps:'filter'}), 300);
}
// Blind: ink splats across the card's eyes, then drips and fades.
function blindInk(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target);
  for(let i = 0; i < 5; i++){ const k = layer('sfx-ink'); g.set(k, {x:c.r.left + c.w*rnd(.15, .85) - 17, y:c.r.top + c.h*rnd(.2, .45) - 17, scale:0, rotation:rnd(0, 360), opacity:.95});
    g.timeline({delay:i*0.04, onComplete:()=> k.remove()}).to(k, {scale:rnd(.9, 1.5), duration:.1, ease:'back.out(3)'}).to(k, {y:'+=14', scaleY:'+=.3', duration:.5, ease:'power1.in'}).to(k, {opacity:0, duration:.3}, '-=.25'); }
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(.6)', duration:.15, yoyo:true, repeat:1, repeatDelay:.35, clearProps:'filter', onComplete:()=> call(o.onDone)});
}
// Reflect: a mirror sheen sweeps the defender, then a beam of light snaps back into the attacker.
function mirrorFlash(defender, attacker, o){
  o = o || {}; if(!go() || !defender){ call(o.onImpact); return; }
  const g = G(), d = centre(defender), m = over(defender, 'sfx-mirror', 2); g.set(m, {opacity:0, backgroundPosition:'100% 0'});
  g.timeline({onComplete:()=> m.remove()}).to(m, {opacity:1, duration:.08}).to(m, {backgroundPosition:'0% 0', duration:.3, ease:'power1.inOut'}, 0).to(m, {opacity:0, duration:.25});
  if(!attacker){ later(o.onImpact, 250); return; }
  const a = centre(attacker), ang = angTo(d, a), L = Math.hypot(a.x - d.x, a.y - d.y);
  later(()=>{ const ln = layer('sfx-lance'); g.set(ln, {x:d.x, y:d.y - 2, width:L, rotation:ang*57.3, transformOrigin:'0 50%', scaleX:0, opacity:1});
    g.timeline({onComplete:()=> ln.remove()}).to(ln, {scaleX:1, duration:.12, ease:'power3.in'}).to(ln, {opacity:0, duration:.2});
    later(()=>{ knock(attacker, ang*57.3, .9); burst(a.x, a.y, ang*57.3, 'zap', 6); call(o.onImpact); }, 120); }, 200);
}
// Revive: a pillar of light falls on the card, which lifts back out of grey with sparkles rising.
function reviveRise(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), t = tileOf(target), H = c.r.bottom, p = layer('sfx-pillar');
  g.set(p, {x:c.x - c.w*.5, y:0, width:c.w, height:H, scaleY:0, opacity:.95});
  g.timeline({onComplete:()=> p.remove()}).to(p, {scaleY:1, duration:.22, ease:'power2.in'}).to(p, {opacity:0, scaleX:.4, duration:.5, delay:.2});
  g.fromTo(t, {filter:'grayscale(1) brightness(.6)'}, {filter:'grayscale(0) brightness(1.3)', duration:.45, delay:.18, clearProps:'filter'});
  g.timeline({delay:.2, onComplete:()=> call(o.onDone)}).to(t, {y:-10, scale:1.05, duration:.25, ease:'power2.out'}).to(t, {y:0, scale:1, duration:.4, ease:'bounce.out', clearProps:'transform'});
  later(()=> ring(c.x, c.y, 'sfx-heal', c.w*1.5, 520), 220);
  for(let i = 0; i < 8; i++){ const s = layer('sfx-twinkle'); g.set(s, {x:c.r.left + rnd(.1, .9)*c.w, y:c.r.bottom - rnd(0, c.h*.3), opacity:0});
    g.timeline({delay:.25 + i*.05, onComplete:()=> s.remove()}).to(s, {opacity:1, duration:.08}).to(s, {y:`-=${rnd(40, 80)}`, duration:.6, ease:'power1.out'}, 0).to(s, {opacity:0, duration:.2}, .45); }
}
// Spawn (Brood, Twin, On Death spawns, Meiosis): a green rune circle spins open under the new card and it pops into being.
function summonPortal(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), D = Math.max(c.w, c.h)*1.1, r = layer('sfx-rune');
  g.set(r, {x:c.x, y:c.y + c.h*.1, xPercent:-50, yPercent:-50, width:D, height:D*.45, scale:.2, rotation:0, opacity:0});
  g.timeline({onComplete:()=> r.remove()}).to(r, {scale:1, opacity:1, duration:.2, ease:'back.out(2)'}).to(r, {rotation:180, duration:.6, ease:'none'}, 0).to(r, {opacity:0, scale:1.2, duration:.25}, .45);
  g.fromTo(tileOf(target), {scale:.7, opacity:.3}, {scale:1, opacity:1, duration:.4, ease:'back.out(2)', delay:.08, clearProps:'transform,opacity', onComplete:()=> call(o.onDone)});
  for(let i = 0; i < 8; i++){ const m = layer('sfx-mote'); g.set(m, {x:c.x + rnd(-D*.4, D*.4), y:c.y + c.h*.15, opacity:0});
    g.timeline({delay:.05 + i*.04, onComplete:()=> m.remove()}).to(m, {opacity:1, duration:.08}).to(m, {y:`-=${rnd(40, 80)}`, duration:.55, ease:'power1.out'}, 0).to(m, {opacity:0, duration:.2}, .4); }
}
// Resource gain (Worthy, On Ready/Spawn Lumber, Bounty): a few logs (or coins) hop from the card to where they're banked.
function lootArc(from, to, o){
  o = o || {}; if(!go() || !from || !to){ call(o.onDone); return; }
  const g = G(), a = centre(from), b = centre(to), n = Math.max(1, Math.min(5, o.n || 3));
  for(let i = 0; i < n; i++){ const l = layer('sfx-loot', o.glyph || '🪵'), s = {t:0}, p0 = {x:a.x + rnd(-10, 10), y:a.y}, mid = {x:(a.x + b.x)/2 + rnd(-40, 40), y:Math.min(a.y, b.y) - rnd(60, 110)};
    g.set(l, {x:p0.x, y:p0.y, xPercent:-50, yPercent:-50, scale:.4, opacity:0});
    g.timeline({delay:i*0.08, onComplete:()=>{ l.remove(); if(i === n - 1){ g.fromTo(tileOf(to), {scale:1}, {scale:1.12, duration:.08, yoyo:true, repeat:1, clearProps:'transform'}); ring(b.x, b.y, 'sfx-gold', Math.max(30, b.w*.8), 320); call(o.onDone); } }})
      .to(l, {opacity:1, scale:1, duration:.1}).to(s, {t:1, duration:.55, ease:'power1.inOut', onUpdate:()=>{ const q = qpt(p0, mid, b, s.t); g.set(l, {x:q.x, y:q.y}); }}, 0).to(l, {rotation:rnd(-200, 200), duration:.55}, 0).to(l, {scale:.5, duration:.1}); }
}
// Prayer / Grace: a soft beam of light falls on the card and a dove rises out of it.
function prayerLight(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), bm = layer('sfx-beam'); g.set(bm, {x:c.x - c.w*.4, y:0, width:c.w*.8, height:c.r.bottom, scaleY:0, opacity:1});
  g.timeline({onComplete:()=> bm.remove()}).to(bm, {scaleY:1, duration:.3, ease:'power2.out'}).to(bm, {opacity:0, duration:.45, delay:.2});
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.35) sepia(.2)', duration:.25, yoyo:true, repeat:1, delay:.15, clearProps:'filter'});
  const dv = layer('sfx-loot', '🕊️'); g.set(dv, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, scale:.5, opacity:0});
  g.timeline({delay:.2, onComplete:()=>{ dv.remove(); call(o.onDone); }}).to(dv, {opacity:1, scale:1, duration:.15}).to(dv, {y:`-=${c.h*.7}`, x:'+=12', duration:.6, ease:'power1.out'}, 0).to(dv, {opacity:0, duration:.2}, .45);
}
// Esprit / Inspiring / Buffs: golden chevrons rise up through the card inside a gold ring.
function espritAura(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target);
  ring(c.x, c.y, 'sfx-gold', c.w*1.4, 520);
  for(let i = 0; i < 6; i++){ const v = layer('sfx-chev'); g.set(v, {x:c.x - 9 + (i % 3 - 1)*c.w*.22, y:c.r.bottom - 10, opacity:0, scale:.8});
    g.timeline({delay:i*0.07, onComplete:()=> v.remove()}).to(v, {opacity:1, duration:.08}).to(v, {y:`-=${c.h*.85}`, duration:.55, ease:'power1.out'}, 0).to(v, {opacity:0, duration:.18}, .4); }
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.3) saturate(1.3)', duration:.2, yoyo:true, repeat:1, clearProps:'filter', onComplete:()=> call(o.onDone)});
}
// Berserk / Frenzy: red steam vents from the card, an anger mark pops, and it shudders with rage.
function rageFlare(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target);
  [-1, 1].forEach(s=>{ for(let i = 0; i < 3; i++){ const p = layer('sfx-steam'); g.set(p, {x:c.x + s*c.w*.42 - 11, y:c.r.top + 4, scale:.4, opacity:.9});
    g.to(p, {x:`+=${s*rnd(14, 26)}`, y:`-=${rnd(20, 40)}`, scale:rnd(1.4, 2), opacity:0, duration:rnd(.5, .7), delay:i*.08, ease:'power1.out', onComplete:()=> p.remove()}); } });
  const v = layer('sfx-vein', '💢'); g.set(v, {x:c.x + c.w*.28, y:c.r.top + c.h*.12, xPercent:-50, yPercent:-50, scale:.3, opacity:0});
  g.timeline({onComplete:()=> v.remove()}).to(v, {scale:1.2, opacity:1, duration:.12, ease:'back.out(3)'}).to(v, {scale:.9, duration:.08, yoyo:true, repeat:3}).to(v, {opacity:0, duration:.2});
  shakeEl(tileOf(target), 3, .35);
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.2) sepia(.6) saturate(3) hue-rotate(-30deg)', duration:.15, yoyo:true, repeat:1, clearProps:'filter', onComplete:()=> call(o.onDone)});
}
// Scar: three claw marks rake across the card and glow red as they close.
function scarMark(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), s = o.fromLeft === false ? -1 : 1, sv = svgLayer('sfx-claw'), paths = [];
  for(let k = 0; k < 3; k++){ const off = (k - 1)*c.w*.18, x0 = c.x - s*c.w*.3 + off, y0 = c.r.top + c.h*.2, x1 = c.x + s*c.w*.3 + off, y1 = c.r.top + c.h*.8;
    paths.push(drawPath(sv, `M${x0},${y0} Q${(x0 + x1)/2 + s*8},${(y0 + y1)/2 - 6} ${x1},${y1}`)); }
  g.timeline({onComplete:()=>{ sv.remove(); call(o.onDone); }}).to(paths, {strokeDashoffset:0, duration:.14, ease:'power3.in', stagger:.04}).to(sv, {opacity:0, duration:.45, delay:.25});
  later(()=>{ knock(target, s > 0 ? 45 : 135, .6); g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.3) sepia(.5) hue-rotate(-40deg)', duration:.08, yoyo:true, repeat:1, clearProps:'filter'}); }, 150);
}
// Wait changes: a clock pops over the card; its hands drag round slowly (more Wait) or race round (less Wait, Coffee).
function clockTick(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), fast = (o.dir || 1) < 0, ck = layer('sfx-clock' + (fast ? ' is-fast' : ''), '<i></i><i class="min"></i>');
  g.set(ck, {x:c.x - 22, y:c.r.top + c.h*.3 - 22, scale:.3, opacity:0});
  const hands = ck.querySelectorAll('i');
  g.timeline({onComplete:()=>{ ck.remove(); call(o.onDone); }}).to(ck, {scale:1, opacity:1, duration:.15, ease:'back.out(2.5)'})
    .to(hands[0], {rotation:fast ? 720 : -120, duration:.6, ease:fast ? 'power2.in' : 'steps(4)'}, .1).to(hands[1], {rotation:fast ? 120 : -20, duration:.6, ease:'none'}, .1)
    .to(ck, {opacity:0, y:'-=14', duration:.22});
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:fast ? 'brightness(1.25) sepia(.4)' : 'brightness(.85) saturate(.6) hue-rotate(180deg)', duration:.2, yoyo:true, repeat:1, repeatDelay:.2, clearProps:'filter'});
}
// Counterattack: blades cross between the two cards with a bright ping, then the defender's riposte shoves the attacker.
function parry(defender, attacker, o){
  o = o || {}; if(!go() || !defender || !attacker){ later(o.onImpact, 250); return; }
  const g = G(), d = centre(defender), a = centre(attacker), m = {x:(d.x + a.x)/2, y:(d.y + a.y)/2};
  [[d, 1], [a, -1]].forEach(([p, s])=>{ const b = layer('sfx-blade', '🗡️'); g.set(b, {x:p.x, y:p.y, xPercent:-50, yPercent:-50, rotation:s*45, opacity:0});
    g.timeline({onComplete:()=> b.remove()}).to(b, {opacity:1, duration:.05}).to(b, {x:m.x + s*6, y:m.y, rotation:s*-20, duration:.16, ease:'power3.in'}, 0).to(b, {x:`+=${s*14}`, rotation:s*-50, opacity:0, duration:.25, delay:.05}); });
  later(()=>{ const p = layer('sfx-ping'); g.set(p, {x:m.x - 15, y:m.y - 15, scale:.2, opacity:1});
    g.timeline({onComplete:()=> p.remove()}).to(p, {scale:1.8, rotation:45, duration:.1}).to(p, {scale:.5, opacity:0, rotation:90, duration:.2});
    burst(m.x, m.y, -90, 'zap', 6); knock(attacker, angTo(d, a)*57.3, 1); call(o.onImpact); }, 170);
}
// King Slayer: a crown pops over the King and cracks in two, the halves falling away in a spray of gold.
function crownCrack(target, o){
  o = o || {}; if(!go() || !target){ call(o.onDone); return; }
  const g = G(), c = centre(target), y = c.r.top + c.h*.12;
  const halves = [0, 1].map(k=>{ const h = layer('sfx-crown', '👑'); h.style.clipPath = k ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)'; g.set(h, {x:c.x, y, xPercent:-50, yPercent:-50, scale:.4, opacity:0}); return h; });
  g.timeline({onComplete:()=>{ halves.forEach(h=> h.remove()); call(o.onDone); }}).to(halves, {scale:1.2, opacity:1, duration:.15, ease:'back.out(3)'})
    .add(()=>{ burst(c.x, y, -90, 'fire', 8); ring(c.x, y, 'sfx-gold', 50, 300); }, '+=.15')
    .to(halves[0], {x:'-=22', y:'+=40', rotation:-35, opacity:0, duration:.5, ease:'power1.in'}, '>').to(halves[1], {x:'+=22', y:'+=40', rotation:35, opacity:0, duration:.5, ease:'power1.in'}, '<');
  later(()=> knock(target, 90, 1), 300);
}
// Stealth: the attacker melts into shadow and a dark afterimage slips across to the castle.
function stealthSlip(attacker, castle, o){
  o = o || {}; if(!go() || !attacker){ call(o.onDone); return; }
  const g = G(), sh = over(attacker, 'sfx-shade', 4); g.set(sh, {opacity:0});
  g.timeline({onComplete:()=> sh.remove()}).to(sh, {opacity:1, duration:.15}).to(sh, {opacity:0, duration:.35, delay:.35});
  if(!castle){ later(o.onDone, 500); return; }
  const a = centre(attacker), b = centre(castle), gh = ghostOf(attacker, 'sfx-ghost');
  g.set(gh, {filter:'brightness(.2) saturate(0) blur(1px)', opacity:0});
  g.timeline({delay:.1, onComplete:()=>{ gh.remove(); call(o.onDone); }}).to(gh, {opacity:.55, duration:.1}).to(gh, {x:`+=${b.x - a.x}`, y:`+=${b.y - a.y}`, scale:.6, duration:.35, ease:'power2.in'}, 0).to(gh, {opacity:0, duration:.15});
}
Object.assign(root.SkillFX, {swoop, gust, splash, armorBlock, forkProngs, pierceThrough, stunStars, freezeEncase, sleepZzz, paralyzeSpark, acidCorrode, lifeDrain, bloomPollen,
  fearShiver, curseDrain, targetMark, blindInk, mirrorFlash, reviveRise, summonPortal, lootArc, prayerLight, espritAura, rageFlare, scarMark, clockTick, parry, crownCrack, stealthSlip});
// ---- 2026-10-15 (ninth pass): the Bolts (user: "They just represents 'spits' of something at the enemy. Fire bolt, Acid bolt, Poison
// bolt etc.") and Chilli (user: "New skill Chilli.").
//   SkillFX.boltGlob(shooter, target, {element:'fire'|'acid'|'poison'|'ice'|'shock', flight, onImpact})
//   SkillFX.chilliHeat(target, {burn})   (burn: the smaller round-start sting instead of the first big flush)
// BOLT_LOOK is the element table on this side: a new element is one row here (its colours and the burst it leaves).
const BOLT_LOOK = {
  fire:   {core:'#fff2b0', mid:'#ff9a2a', edge:'#d8380e', glow:'255,120,30',  bit:'fire'},
  acid:   {core:'#f6ffb0', mid:'#b6e830', edge:'#5f8a10', glow:'180,240,40',  bit:'poison'},
  poison: {core:'#f0d8ff', mid:'#9a4fd8', edge:'#4a1d6e', glow:'170,80,255',  bit:'poison'},
  ice:    {core:'#ffffff', mid:'#a8dcff', edge:'#3f8fd8', glow:'140,200,255', bit:'ice'},
  shock:  {core:'#ffffff', mid:'#fff36a', edge:'#e0b000', glow:'255,230,60',  bit:'zap'},
};
const NINTH_CSS = `
.sfx-glob{width:22px; height:22px; border-radius:50% 50% 50% 50% / 58% 58% 42% 42%;}
.sfx-glob-drop{width:7px; height:7px; border-radius:50%; filter:blur(.5px);}
.sfx-glob-splat{border-radius:46% 54% 50% 50%; mix-blend-mode:screen;}
.sfx-chilli{font-size:24px; line-height:1; filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));}
.sfx-chilli-flush{border-radius:12px; background:radial-gradient(ellipse at 50% 60%, rgba(255,60,30,.6), rgba(255,40,20,.35) 55%, rgba(255,40,20,.12) 85%); box-shadow:0 0 18px 4px rgba(255,70,30,.55);}
.sfx-chilli-steam{width:30px; height:30px; border-radius:50%; background:radial-gradient(circle, rgba(255,246,240,.95) 0, rgba(255,205,195,.55) 45%, rgba(255,205,195,0) 70%); filter:blur(1.5px);}
`;
function ninthCss(){ if(document.getElementById('sfx-ninth-css')) return; const st = document.createElement('style'); st.id = 'sfx-ninth-css'; st.textContent = NINTH_CSS; (document.head || document.body).appendChild(st); }
// A Bolt: a coloured glob arcs from the shooter to the target (a short lob, wobbling as it flies, shedding droplets), then splats.
function boltGlob(shooter, target, o){
  o = o || {}; const fly = o.flight || 420;
  if(!ready() || !shooter || !target){ later(o.onImpact, fly); return; } ninthCss();
  const L = BOLT_LOOK[o.element] || BOLT_LOOK.fire, g = G(), a = centre(shooter), b = centre(target);
  const m = {x:(a.x + b.x)/2, y:Math.min(a.y, b.y) - Math.max(50, Math.abs(b.x - a.x)*.25)}, st = {t:0};
  const glob = layer('sfx-glob'); glob.style.background = `radial-gradient(circle at 38% 36%, ${L.core} 0, ${L.mid} 45%, ${L.edge} 100%)`; glob.style.boxShadow = `0 0 12px 4px rgba(${L.glow},.75)`;
  g.set(glob, {x:a.x - 11, y:a.y - a.h*.15 - 11, scale:.4});
  g.fromTo(tileOf(shooter), {scaleY:1}, {scaleY:.93, duration:.08, yoyo:true, repeat:1, transformOrigin:'50% 100%', clearProps:'transform'}); // the spit
  let k = 0;
  const drip = ()=>{ if(k++ % 3) return; const r = glob.getBoundingClientRect(), d = layer('sfx-glob-drop'); d.style.background = L.mid; g.set(d, {x:r.left + r.width/2 - 3, y:r.top + r.height/2 - 3, opacity:.9});
    g.to(d, {y:'+=14', opacity:0, scale:.3, duration:.35, ease:'power1.in', onComplete:()=> d.remove()}); };
  g.timeline({onComplete:()=> glob.remove()})
    .to(st, {t:1, duration:fly/1000, ease:'power1.in', onUpdate:()=>{ const q = qpt({x:a.x, y:a.y - a.h*.15}, m, b, st.t); g.set(glob, {x:q.x - 11, y:q.y - 11, scale:.6 + .5*st.t, scaleX:1 + .25*Math.sin(st.t*18), rotation:st.t*240}); drip(); }})
    .add(()=>{
      glob.style.opacity = 0;
      const sp = layer('sfx-glob-splat'); sp.style.background = `radial-gradient(circle, ${L.core} 0, rgba(${L.glow},.85) 35%, rgba(${L.glow},0) 72%)`;
      g.set(sp, {x:b.x, y:b.y, xPercent:-50, yPercent:-50, width:16, height:16, opacity:1});
      g.to(sp, {width:b.w*.9, height:b.w*.75, opacity:0, duration:.42, ease:'power2.out', onComplete:()=> sp.remove()});
      burst(b.x, b.y, -90, L.bit, 10); knock(target, a.y < b.y ? 90 : -90, .7); call(o.onImpact);
    });
}
// Chilli: a chilli pops up and is gobbled, the card flushes red and puffs steam (the round-start sting: a red flash and a wisp).
function chilliHeat(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; } ninthCss();
  const g = G(), c = centre(target);
  if(!o.burn){ const f = layer('sfx-chilli', '🌶️'); g.set(f, {x:c.x, y:c.r.top + c.h*.22, xPercent:-50, yPercent:-50, scale:.4, opacity:0, rotation:-20});
    g.timeline({onComplete:()=> f.remove()}).to(f, {scale:1.1, opacity:1, rotation:0, duration:.15, ease:'back.out(3)'})
      .to(f, {scaleX:.8, duration:.07, yoyo:true, repeat:1}).to(f, {scale:.6, duration:.08}).to(f, {scale:.1, opacity:0, duration:.1}); }
  const fl = layer('sfx-chilli-flush'); g.set(fl, {x:c.r.left, y:c.r.top, width:c.w, height:c.h, opacity:0});
  g.timeline({delay:o.burn ? 0 : .35, onComplete:()=>{ fl.remove(); call(o.onDone); }}).to(fl, {opacity:1, duration:.12}).to(fl, {opacity:o.burn ? 0 : .5, duration:.25}).to(fl, {opacity:0, duration:.3});
  for(let i = 0; i < (o.burn ? 3 : 7); i++){ const p = layer('sfx-chilli-steam'); g.set(p, {x:c.x - 15 + rnd(-c.w*.3, c.w*.3), y:c.r.top + c.h*.2, scale:.4, opacity:0});
    g.to(p, {opacity:.9, duration:.1, delay:(o.burn ? 0 : .4) + i*.06}); g.to(p, {y:`-=${rnd(26, 48)}`, x:`+=${rnd(-10, 10)}`, scale:rnd(1.4, 2.2), opacity:0, duration:rnd(.6, .9), delay:(o.burn ? .1 : .5) + i*.06, ease:'power1.out', onComplete:()=> p.remove()}); }
  g.fromTo(tileOf(target), {x:0}, {x:2, duration:.05, yoyo:true, repeat:o.burn ? 3 : 7, delay:o.burn ? 0 : .35, clearProps:'transform'});
}
// Bloodlust (2026-10-15, user: "New Skill: Bloodlust - ability idk, but I assume when it draws blood, it gets stronger."): a red pulse throbs out of the card twice, like a
// heartbeat, and the card flushes red for a moment. o.full: it has reached its cap (a deeper, single throb).
function bloodlustPulse(target, o){
  o = o || {}; if(!ready() || !target){ call(o.onDone); return; }
  if(!document.getElementById('sfx-bloodlust-css')){ const st = document.createElement('style'); st.id = 'sfx-bloodlust-css';
    st.textContent = `.sfx-blood-ring{position:fixed; left:0; top:0; border-radius:14px; border:3px solid rgba(220,30,40,.95); box-shadow:0 0 16px 4px rgba(200,20,30,.7), inset 0 0 14px rgba(200,20,30,.55); pointer-events:none; z-index:60;}
.sfx-blood-flush{position:fixed; left:0; top:0; border-radius:12px; background:radial-gradient(ellipse at 50% 55%, rgba(210,20,30,.55), rgba(140,0,10,.25) 70%, rgba(140,0,10,0)); mix-blend-mode:multiply; pointer-events:none; z-index:59;}`;
    (document.head || document.body).appendChild(st); }
  const g = G(), c = centre(target), beats = o.full ? 1 : 2;
  const fl = layer('sfx-blood-flush'); g.set(fl, {x:c.r.left, y:c.r.top, width:c.w, height:c.h, opacity:0});
  g.timeline({onComplete:()=> fl.remove()}).to(fl, {opacity:1, duration:.1}).to(fl, {opacity:.6, duration:.25}).to(fl, {opacity:0, duration:.35});
  for(let i = 0; i < beats; i++){ const r = layer('sfx-blood-ring'); g.set(r, {x:c.r.left, y:c.r.top, width:c.w, height:c.h, opacity:0, scale:1});
    g.timeline({delay:i*.28, onComplete:()=>{ r.remove(); if(i === beats - 1) call(o.onDone); }}).to(r, {opacity:1, duration:.06}).to(r, {scale:o.full ? 1.45 : 1.3, opacity:0, duration:.5, ease:'power2.out'}); }
  const t = tileOf(target); for(let i = 0; i < beats; i++) g.fromTo(t, {scale:1}, {scale:1.06, duration:.08, yoyo:true, repeat:1, delay:i*.28, ease:'power2.out', clearProps:'transform'});
}
Object.assign(root.SkillFX, {boltGlob, chilliHeat, bloodlustPulse, BOLT_LOOK});
// ---- W2 skills (2026-10-16): the looks for the designer's new skills, the Cloudy field and the heal's ➕ --------------------------
// Each takes real board elements (a .board-card, the battlefield) and plays on fixed overlays it removes when done; the lasting
// looks (Bound vines, Invisible, Invincible, Toxin, crystals, trap and burning-ground marks, cloud shadows) are CSS on classes the
// game toggles, injected once here (w2Css) so the template stays untouched.
//   SkillFX.venomBite(target)        SkillFX.toxinMark(target)        SkillFX.weakenDrain(target)      SkillFX.wilt(target)
//   SkillFX.bulldozeShove(target, {fromAbove})                         SkillFX.vineBind(target, {strangle})  SkillFX.squeeze(target)
//   SkillFX.invincibleBlock(target)  SkillFX.unveil(target)            SkillFX.gasCloud(targets)        SkillFX.absoluteZero(host, targets)
//   SkillFX.trapSet(slotEl, {kind})  SkillFX.trapSnap(target, {kind})  SkillFX.nova(src, targets)       SkillFX.crystalForm(target)
//   SkillFX.cure(target)             SkillFX.tauntCall(target, attacker)  SkillFX.cloudShadows(host, on)  SkillFX.healPlus(target)
function w2Css(){
  if(document.getElementById('sfx-w2-css')) return; const st = document.createElement('style'); st.id = 'sfx-w2-css';
  st.textContent = `
.sfx-w2-glyph{font:900 22px 'Baloo 2',system-ui,sans-serif; line-height:1; text-shadow:0 2px 0 rgba(0,0,0,.35);}
.sfx-w2-fang{width:7px; height:16px; border-radius:0 0 50% 50%; background:linear-gradient(180deg,#f6f0ff,#b78bff 70%,#5b2a9a); box-shadow:0 0 6px rgba(160,90,255,.8);}
.sfx-w2-drop{width:6px; height:8px; border-radius:50% 50% 50% 50%/60% 60% 40% 40%; background:radial-gradient(circle at 35% 35%,#e3c6ff,#8a3fd8 60%,#3e1170);}
.sfx-w2-toxring{border-radius:50%; border:3px solid rgba(120,255,60,.9); box-shadow:0 0 14px rgba(80,220,40,.75), inset 0 0 10px rgba(20,60,10,.8);}
.sfx-w2-vine{position:fixed; left:0; top:0; pointer-events:none; z-index:9991; overflow:visible;}
.sfx-w2-gas{width:70px; height:46px; border-radius:50%; background:radial-gradient(ellipse at 50% 55%,rgba(150,220,70,.75),rgba(90,160,40,.45) 55%,rgba(60,120,30,0) 72%); filter:blur(3px);}
.sfx-w2-frost{border-radius:12px; background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.95),rgba(170,225,255,.75) 45%,rgba(90,170,255,.2) 75%,rgba(90,170,255,0)); mix-blend-mode:screen;}
.sfx-w2-flake{color:#e6f6ff; font-size:16px; text-shadow:0 0 6px #7cc8ff;}
.sfx-w2-nova{border-radius:50%; border:4px solid rgba(190,120,255,.95); box-shadow:0 0 30px 8px rgba(150,80,255,.7), inset 0 0 26px rgba(220,180,255,.7);}
.sfx-w2-orb{width:14px; height:14px; border-radius:50%; background:radial-gradient(circle,#fff,#c79bff 45%,#6b2fd0 80%); box-shadow:0 0 10px #a46bff;}
.sfx-w2-shard{width:10px; height:16px; clip-path:polygon(50% 0,100% 40%,50% 100%,0 40%); background:linear-gradient(160deg,#f2fbff,#8fd3ff 50%,#6a7cff);}
.sfx-w2-pill{font-size:20px;}
.sfx-w2-jaw{font-size:30px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5));}
.sfx-w2-ember{width:7px; height:7px; border-radius:50%; background:radial-gradient(circle,#fff6c0,#ff9a2a 55%,#d8380e);}
.sfx-w2-shout{border-radius:50%; border:3px solid rgba(255,214,90,.95); box-shadow:0 0 12px rgba(255,190,60,.6);}
.sfx-w2-plus{font-size:20px; filter:drop-shadow(0 0 6px rgba(90,220,120,.85));}
/* the lasting looks */
.board-card.is-bound .card-tile::after{content:''; position:absolute; inset:-4px; pointer-events:none; z-index:30; mix-blend-mode:normal; opacity:1; animation:none; transform:none; border-radius:inherit; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cpath d='M-4 70 C 20 56, 34 80, 56 64 S 90 50, 104 60' stroke='%23173a0c' stroke-width='9'/%3E%3Cpath d='M-4 70 C 20 56, 34 80, 56 64 S 90 50, 104 60' stroke='%234e9a2a' stroke-width='5'/%3E%3Cpath d='M-4 30 C 18 46, 40 20, 60 36 S 92 48, 104 28' stroke='%23173a0c' stroke-width='8'/%3E%3Cpath d='M-4 30 C 18 46, 40 20, 60 36 S 92 48, 104 28' stroke='%235aa832' stroke-width='4.5'/%3E%3Cpath d='M50 92 C 40 74, 72 70, 74 50 S 66 14, 84 -4' stroke='%23173a0c' stroke-width='7'/%3E%3Cpath d='M50 92 C 40 74, 72 70, 74 50 S 66 14, 84 -4' stroke='%2367b83a' stroke-width='3.8'/%3E%3C/g%3E%3Cg fill='%237cc94a' stroke='%23173a0c' stroke-width='1.2'%3E%3Cellipse cx='30' cy='66' rx='6' ry='3' transform='rotate(-30 30 66)'/%3E%3Cellipse cx='70' cy='58' rx='6' ry='3' transform='rotate(25 70 58)'/%3E%3Cellipse cx='44' cy='30' rx='5.5' ry='2.8' transform='rotate(35 44 30)'/%3E%3Cellipse cx='72' cy='22' rx='5' ry='2.6' transform='rotate(-40 72 22)'/%3E%3C/g%3E%3C/svg%3E") center/100% 100% no-repeat; filter:drop-shadow(0 2px 2px rgba(0,0,0,.55));}
.board-card.is-bound .card-tile{filter:saturate(.8);}
.board-card.is-invisible .card-tile{opacity:.42; filter:saturate(.4) contrast(.9); animation:sfxW2Shimmer 2.4s ease-in-out infinite;}
@keyframes sfxW2Shimmer{0%,100%{opacity:.36;} 50%{opacity:.52;}}
.board-card.is-invincible .card-tile{box-shadow:0 0 0 2px rgba(255,226,120,.95), 0 0 16px 4px rgba(255,210,80,.65); animation:sfxW2Gold 1.6s ease-in-out infinite;}
@keyframes sfxW2Gold{0%,100%{box-shadow:0 0 0 2px rgba(255,226,120,.95), 0 0 12px 3px rgba(255,210,80,.5);} 50%{box-shadow:0 0 0 2px rgba(255,240,170,1), 0 0 20px 6px rgba(255,220,100,.8);}}
.board-card.is-toxic .card-tile{box-shadow:inset 0 0 14px rgba(70,200,30,.65);}
.board-card.is-crystal .card-tile{filter:hue-rotate(170deg) saturate(.6) brightness(1.15); box-shadow:inset 0 0 18px rgba(170,220,255,.9), 0 0 10px rgba(120,190,255,.6);}
.abadge.bound{background:#2e6b28; color:#eaffd8;} .abadge.toxin{background:#1f3a12; color:#b8ff6a;} .abadge.invisible{background:#4a4f63; color:#eef;} .abadge.invincible{background:#a07a10; color:#fff6d0;}
.board-card.empty-slot.w2-hazard{visibility:visible; border-radius:14px; background:radial-gradient(ellipse at 50% 62%, rgba(60,40,24,.55), rgba(60,40,24,.15) 60%, transparent 75%); outline:2px dashed rgba(230,200,150,.45); outline-offset:-6px;}
.board-card.empty-slot.w2-hazard.w2-scorch{background:radial-gradient(ellipse at 50% 70%, rgba(255,120,30,.5), rgba(160,40,10,.3) 55%, transparent 78%); outline-color:rgba(255,150,60,.55); animation:sfxW2Smoulder 1.4s ease-in-out infinite;}
.board-card.empty-slot.w2-hazard .w2-hazard-mark{bottom:auto; top:50%; transform:translate(-50%,-50%); font-size:16px; padding:3px 9px;}
.w2-hazard-mark{position:absolute; left:50%; bottom:8%; transform:translateX(-50%); z-index:6; font:800 13px 'Baloo 2',system-ui,sans-serif; padding:1px 6px; border-radius:999px; white-space:nowrap; pointer-events:auto;
  background:rgba(40,28,18,.82); color:#ffe9c0; box-shadow:0 1px 3px rgba(0,0,0,.4);}
.w2-hazard-mark.scorch{background:rgba(120,30,8,.85); color:#ffd9a0; animation:sfxW2Smoulder 1.4s ease-in-out infinite;}
@keyframes sfxW2Smoulder{0%,100%{box-shadow:0 0 4px rgba(255,120,30,.5);} 50%{box-shadow:0 0 12px rgba(255,140,40,.95);}}
.w2-clouds{position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:40; border-radius:inherit; mix-blend-mode:multiply;} /* above the cards: the shadows pass over them too */
.w2-clouds i{position:absolute; display:block; border-radius:50%; background:radial-gradient(ellipse at 50% 50%, rgba(30,34,52,.42), rgba(30,34,52,.26) 45%, rgba(30,34,52,0) 70%);
  filter:blur(12px); animation:sfxW2Drift linear infinite; will-change:transform;}
@keyframes sfxW2Drift{from{transform:translateX(-45vw);} to{transform:translateX(145vw);}}
@media (prefers-reduced-motion: reduce){ .w2-clouds i{animation:none;} .board-card.is-invisible .card-tile, .board-card.is-invincible .card-tile, .w2-hazard-mark.scorch{animation:none;} }
`;
  (document.head || document.body).appendChild(st);
}
const w2ready = ()=>{ w2Css(); return !!G() && !reduce(); };
function w2Float(x, y, txt, cls, rise){ const g = G(); const f = layer('sfx-w2-glyph ' + (cls||''), txt); if(!g){ later(()=> f.remove(), 700); return f; }
  g.set(f, {x, y, xPercent:-50, yPercent:-50, opacity:0, scale:.6});
  g.timeline({onComplete:()=> f.remove()}).to(f, {opacity:1, scale:1.1, duration:.14, ease:'back.out(3)'}).to(f, {y:`-=${rise == null ? 26 : rise}`, opacity:0, duration:.55, delay:.25, ease:'power1.in'});
  return f; }
// Venomous: two fangs stab down, purple venom drips run down the card.
function venomBite(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  [-1, 1].forEach(s=>{ const f = layer('sfx-w2-fang'); g.set(f, {x:c.x + s*c.w*.12 - 3, y:c.r.top + c.h*.12, scaleY:.2, opacity:0, rotation:-s*10});
    g.timeline({onComplete:()=> f.remove()}).to(f, {y:`+=${c.h*.18}`, scaleY:1, opacity:1, duration:.12, ease:'power4.in'}).to(f, {opacity:0, duration:.2, delay:.15}); });
  for(let i = 0; i < 4; i++){ const d = layer('sfx-w2-drop'); g.set(d, {x:c.x + rnd(-c.w*.25, c.w*.25), y:c.r.top + c.h*.35, opacity:0});
    g.timeline({delay:.18 + i*.07, onComplete:()=> d.remove()}).to(d, {opacity:1, duration:.06}).to(d, {y:`+=${rnd(c.h*.25, c.h*.45)}`, duration:.5, ease:'power2.in'}, '<').to(d, {opacity:0, duration:.15}); }
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.1) sepia(.5) hue-rotate(220deg)', duration:.1, yoyo:true, repeat:1, delay:.12, clearProps:'filter', onComplete:o.onDone});
}
// Toxin: a toxic-green ring closes in on the card and a ☣ glows over it.
function toxinMark(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  const r = layer('sfx-w2-toxring'); g.set(r, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:c.w*1.5, height:c.w*1.5, opacity:0});
  g.timeline({onComplete:()=> r.remove()}).to(r, {opacity:1, duration:.1}).to(r, {width:c.w*.5, height:c.w*.5, opacity:0, duration:.5, ease:'power2.in'});
  later(()=> w2Float(c.x, c.y, '☣️', '', 18), 260);
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(.85) sepia(.6) hue-rotate(50deg) saturate(1.8)', duration:.16, yoyo:true, repeat:1, delay:.3, clearProps:'filter', onComplete:o.onDone});
}
// Weaken: a red ⚔ cracks and sinks out of the card; the card dims.
function weakenDrain(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  const f = layer('sfx-w2-glyph', '⚔️'); g.set(f, {x:c.r.left + c.w*.18, y:c.r.bottom - c.h*.18, xPercent:-50, yPercent:-50, opacity:0, scale:1.3});
  g.timeline({onComplete:()=> f.remove()}).to(f, {opacity:1, duration:.1}).to(f, {rotation:-25, duration:.12}).to(f, {y:'+=26', opacity:0, scale:.7, filter:'grayscale(1)', duration:.45, ease:'power2.in'});
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(.7) saturate(.6)', duration:.18, yoyo:true, repeat:1, clearProps:'filter', onComplete:o.onDone});
}
// Wilting: a few petals droop off and fall; the card sags a little.
function wilt(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  for(let i = 0; i < 4; i++){ const p = layer('sfx-w2-glyph', i ? '·' : '🥀'); p.style.fontSize = i ? '22px' : '18px'; p.style.color = '#c35a6c';
    g.set(p, {x:c.x + rnd(-c.w*.3, c.w*.3), y:c.r.top + c.h*.2, opacity:0, rotation:rnd(-30, 30)});
    g.timeline({delay:i*.08, onComplete:()=> p.remove()}).to(p, {opacity:1, duration:.08}).to(p, {y:`+=${c.h*.6}`, x:`+=${rnd(-14, 14)}`, rotation:`+=${rnd(-90, 90)}`, duration:.8, ease:'power1.in'}, '<').to(p, {opacity:0, duration:.2}, '-=.2'); }
  g.fromTo(tileOf(target), {scaleY:1, transformOrigin:'50% 100%'}, {scaleY:.95, duration:.18, yoyo:true, repeat:1, clearProps:'transform', onComplete:o.onDone});
}
// Bulldoze: the card is shoved back (away from the attacker's side), skids, dust kicks up, then settles.
function bulldozeShove(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target), dir = o.fromAbove ? 1 : -1, t = tileOf(target);
  g.timeline({onComplete:()=>{ g.set(t, {clearProps:'transform'}); call(o.onDone); }})
    .to(t, {y:dir*18, rotation:dir*-2, duration:.12, ease:'power3.out'}).to(t, {y:dir*14, duration:.18}).to(t, {y:0, rotation:0, duration:.35, ease:'power2.inOut'});
  for(let i = 0; i < 6; i++){ const d = layer('sfx-w2-glyph', '•'); d.style.color = 'rgba(150,120,90,.85)'; d.style.fontSize = '14px';
    g.set(d, {x:c.x + rnd(-c.w*.4, c.w*.4), y:dir > 0 ? c.r.bottom + 4 : c.r.top - 4, opacity:.9});
    g.to(d, {x:`+=${rnd(-20, 20)}`, y:`+=${dir*rnd(6, 18)}`, opacity:0, scale:1.6, duration:.5, delay:.08, ease:'power2.out', onComplete:()=> d.remove()}); }
}
// Tangleweed / Strangle: green vines whip around the card (drawn strokes); the lasting look is the .is-bound class.
function vineBind(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'sfx-w2-vine'); svg.setAttribute('width', c.w + 20); svg.setAttribute('height', c.h + 20);
  svg.style.transform = `translate(${c.r.left - 10}px, ${c.r.top - 10}px)`; svg.setAttribute('aria-hidden', 'true');
  const W = c.w + 20, H = c.h + 20, paths = [`M2 ${H*.85} C ${W*.3} ${H*.6}, ${W*.7} ${H*.95}, ${W-2} ${H*.55}`, `M${W-2} ${H*.25} C ${W*.6} ${H*.45}, ${W*.35} ${H*.05}, 2 ${H*.35}`, `M${W*.2} ${H-2} C ${W*.15} ${H*.5}, ${W*.85} ${H*.5}, ${W*.8} 2`];
  paths.forEach((d, i)=>{ const pth = document.createElementNS(svgNS, 'path'); pth.setAttribute('d', d); pth.setAttribute('fill', 'none'); pth.setAttribute('stroke', o.strangle ? '#3f7d1e' : '#4f9a2c'); pth.setAttribute('stroke-width', o.strangle ? '6' : '5'); pth.setAttribute('stroke-linecap', 'round');
    svg.appendChild(pth); const L = pth.getTotalLength ? pth.getTotalLength() : 300; pth.style.strokeDasharray = L; pth.style.strokeDashoffset = L;
    g.to(pth.style, {strokeDashoffset:0, duration:.35, delay:i*.08, ease:'power2.out'}); });
  document.body.appendChild(svg);
  g.to(svg, {opacity:0, duration:.35, delay:.9, onComplete:()=>{ svg.remove(); call(o.onDone); }});
  g.fromTo(tileOf(target), {scale:1}, {scale:.96, duration:.12, yoyo:true, repeat:1, delay:.3, clearProps:'transform'});
}
// Strangle's squeeze at round start: the card is crushed in from both sides twice.
function squeeze(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), t = tileOf(target);
  g.timeline({onComplete:()=>{ g.set(t, {clearProps:'transform'}); call(o.onDone); }}).to(t, {scaleX:.9, duration:.1}).to(t, {scaleX:1, duration:.1}).to(t, {scaleX:.9, duration:.1}).to(t, {scaleX:1, duration:.15});
}
// Invincible: the blow bounces off a gold flash.
function invincibleBlock(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const c = centre(target);
  ring(c.x, c.y, 'sfx-w2-shout', c.w*1.4, 420); w2Float(c.x, c.r.top + c.h*.3, '🌟', '', 20);
  G().fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.6) sepia(.4)', duration:.08, yoyo:true, repeat:1, clearProps:'filter', onComplete:o.onDone});
}
// Invisible: fades back in with a ripple when it gives itself away.
function unveil(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const c = centre(target);
  ring(c.x, c.y, 'sfx-heal', c.w*1.2, 380);
  G().fromTo(tileOf(target), {opacity:.3, filter:'blur(2px)'}, {opacity:1, filter:'blur(0px)', duration:.4, clearProps:'opacity,filter', onComplete:o.onDone});
}
// Poison Gas: green clouds roll over every enemy unit hit.
function gasCloud(targets, o){
  o = o || {}; const list = (targets||[]).filter(Boolean); if(!list.length || !w2ready()){ call(o.onDone); return; } const g = G();
  list.forEach((el, k)=>{ const c = centre(el); for(let i = 0; i < 3; i++){ const p = layer('sfx-w2-gas'); g.set(p, {x:c.x - 35 + rnd(-c.w*.3, c.w*.3), y:c.r.top - 30, opacity:0, scale:.5});
      g.timeline({delay:k*.08 + i*.1, onComplete:()=> p.remove()}).to(p, {opacity:1, scale:1.2, y:`+=${c.h*.45}`, duration:.5, ease:'power1.out'}).to(p, {opacity:0, scale:1.6, x:`+=${rnd(-20, 20)}`, duration:.6}); }
    g.fromTo(tileOf(el), {filter:'brightness(1)'}, {filter:'brightness(.9) sepia(.5) hue-rotate(50deg)', duration:.2, yoyo:true, repeat:1, delay:.3 + k*.08, clearProps:'filter'}); });
  later(o.onDone, 1100);
}
// Absolute Zero: a white-blue flash sweeps the field, and frost crystals bloom on every enemy unit.
function absoluteZero(host, targets, o){
  o = o || {}; if(!w2ready()){ call(o.onDone); return; } const g = G(), list = (targets||[]).filter(Boolean);
  if(host){ const hc = centre(host), fl = layer('sfx-w2-frost'); g.set(fl, {x:hc.r.left, y:hc.r.top, width:hc.w, height:hc.h, opacity:0});
    g.timeline({onComplete:()=> fl.remove()}).to(fl, {opacity:.85, duration:.12}).to(fl, {opacity:0, duration:.7}); }
  list.forEach((el, k)=>{ const c = centre(el);
    for(let i = 0; i < 6; i++){ const f = layer('sfx-w2-flake', '❄'); g.set(f, {x:c.x + rnd(-c.w*.4, c.w*.4), y:c.y + rnd(-c.h*.35, c.h*.35), scale:0, rotation:rnd(0, 90)});
      g.timeline({delay:.15 + k*.05 + i*.03, onComplete:()=> f.remove()}).to(f, {scale:1.2, duration:.18, ease:'back.out(3)'}).to(f, {opacity:0, duration:.5, delay:.35}); }
    g.fromTo(tileOf(el), {filter:'brightness(1)'}, {filter:'brightness(1.4) saturate(.3) hue-rotate(180deg)', duration:.2, yoyo:true, repeat:1, delay:.15 + k*.05, clearProps:'filter'}); });
  later(o.onDone, 1100);
}
// A trap (🪤) or burning ground (🔥) settles on an empty slot.
function trapSet(slotEl, o){
  o = o || {}; if(!slotEl || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(slotEl), fire = o.kind === 'scorch';
  const f = layer('sfx-w2-jaw', fire ? '🔥' : '🪤'); g.set(f, {x:c.x, y:c.y - 60, xPercent:-50, yPercent:-50, opacity:0, scale:.6});
  g.timeline({onComplete:()=>{ f.remove(); call(o.onDone); }}).to(f, {y:c.y, opacity:1, scale:1, duration:.32, ease:'bounce.out'}).to(f, {opacity:0, duration:.3, delay:.35});
  if(fire) for(let i = 0; i < 6; i++){ const e = layer('sfx-w2-ember'); g.set(e, {x:c.x + rnd(-c.w*.3, c.w*.3), y:c.y + c.h*.2, opacity:0});
    g.timeline({delay:.25 + i*.05, onComplete:()=> e.remove()}).to(e, {opacity:1, duration:.05}).to(e, {y:`-=${rnd(30, 60)}`, opacity:0, duration:.6, ease:'power1.out'}); }
}
// The trap snaps (jaws clamp on the card) or the ground flares under it.
function trapSnap(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target), fire = o.kind === 'scorch';
  if(fire){ for(let i = 0; i < 9; i++){ const e = layer('sfx-w2-ember'); g.set(e, {x:c.x + rnd(-c.w*.45, c.w*.45), y:c.r.bottom - 6, opacity:0, scale:rnd(.8, 1.6)});
      g.timeline({delay:i*.03, onComplete:()=> e.remove()}).to(e, {opacity:1, duration:.05}).to(e, {y:`-=${rnd(c.h*.4, c.h*.9)}`, opacity:0, duration:.55, ease:'power1.out'}); } }
  else { [-1, 1].forEach(s=>{ const j = layer('sfx-w2-jaw', s < 0 ? '◢' : '◣'); j.style.color = '#8b8f98'; g.set(j, {x:c.x + s*c.w*.6, y:c.r.bottom - c.h*.25, xPercent:-50, yPercent:-50});
      g.timeline({onComplete:()=> j.remove()}).to(j, {x:c.x + s*c.w*.12, duration:.1, ease:'power4.in'}).to(j, {opacity:0, duration:.25, delay:.3}); }); }
  G().fromTo(tileOf(target), {x:0}, {x:3, duration:.04, yoyo:true, repeat:5, delay:.1, clearProps:'transform', onComplete:o.onDone});
}
// Nova: the dying unit bursts in a violet ring; orbs fly to every enemy unit.
function nova(src, targets, o){
  o = o || {}; if(!w2ready()){ call(o.onDone); return; } const g = G(), list = (targets||[]).filter(Boolean);
  const c = src ? centre(src) : (list[0] ? centre(list[0]) : null); if(!c){ call(o.onDone); return; }
  const r = layer('sfx-w2-nova'); g.set(r, {x:c.x, y:c.y, xPercent:-50, yPercent:-50, width:20, height:20, opacity:1});
  g.to(r, {width:Math.max(260, c.w*4), height:Math.max(260, c.w*4), opacity:0, duration:.7, ease:'power2.out', onComplete:()=> r.remove()});
  list.forEach((el, k)=>{ const t = centre(el), b = layer('sfx-w2-orb'); g.set(b, {x:c.x - 7, y:c.y - 7});
    g.to(b, {x:t.x - 7, y:t.y - 7, duration:.35, delay:.1 + k*.04, ease:'power2.in', onComplete:()=>{ b.remove(); ring(t.x, t.y, 'sfx-w2-nova', t.w*.9, 300); call(o.onEachImpact, el, k); }}); });
  later(o.onDone, 700);
}
// Crystallise: shards gather and the crystal forms.
function crystalForm(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  for(let i = 0; i < 8; i++){ const s = layer('sfx-w2-shard'), a = i/8*Math.PI*2, d = Math.max(c.w, c.h)*.8; g.set(s, {x:c.x + Math.cos(a)*d - 5, y:c.y + Math.sin(a)*d - 8, rotation:a*57.3 + 90, opacity:0});
    g.timeline({delay:i*.03, onComplete:()=> s.remove()}).to(s, {opacity:1, duration:.08}).to(s, {x:c.x - 5, y:c.y - 8, duration:.35, ease:'power2.in'}, '<').to(s, {opacity:0, duration:.1}); }
  later(()=> ring(c.x, c.y, 'sfx-heal', c.w*1.3, 420), 380);
  g.fromTo(tileOf(target), {scale:.8, opacity:.4}, {scale:1, opacity:1, duration:.35, delay:.35, ease:'back.out(2)', clearProps:'transform,opacity', onComplete:o.onDone});
}
// Cure: a 💊 pops over the card, and green-white sparkles lift the sickness off.
function cure(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  w2Float(c.x, c.r.top + c.h*.35, '💊', 'sfx-w2-pill', 22);
  for(let i = 0; i < 7; i++){ const s = layer('sfx-twinkle'); g.set(s, {x:c.r.left + rnd(.15, .85)*c.w, y:c.r.top + rnd(.4, .8)*c.h, opacity:0});
    g.timeline({delay:.12 + i*.05, onComplete:()=> s.remove()}).to(s, {opacity:1, duration:.08}).to(s, {y:`-=${rnd(30, 60)}`, duration:.55, ease:'power1.out'}, 0).to(s, {opacity:0, duration:.2}, .4); }
  g.fromTo(tileOf(target), {filter:'brightness(1)'}, {filter:'brightness(1.3) saturate(1.2)', duration:.2, yoyo:true, repeat:1, delay:.15, clearProps:'filter', onComplete:o.onDone});
}
// Taunt: the taunting unit calls out (gold rings) and an arc points from the attacker to it.
function tauntCall(target, attacker, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const c = centre(target);
  ring(c.x, c.y, 'sfx-w2-shout', c.w*1.3, 380); later(()=> ring(c.x, c.y, 'sfx-w2-shout', c.w*1.7, 420), 140);
  w2Float(c.x, c.r.top + c.h*.2, '📢', '', 22);
  if(attacker){ const a = centre(attacker); G().fromTo(tileOf(attacker), {rotation:0}, {rotation:(c.x > a.x ? 4 : -4), duration:.12, yoyo:true, repeat:1, clearProps:'transform'}); }
  later(o.onDone, 600);
}
// Cloudy (field): soft cloud shadows drift across the battlefield, slow and seamless. on=false removes them.
function cloudShadows(host, on){
  if(!host) return; w2Css(); let lay = host.querySelector(':scope > .w2-clouds');
  if(on === false){ if(lay) lay.remove(); return; } if(lay) return lay;
  lay = document.createElement('div'); lay.className = 'w2-clouds'; lay.setAttribute('aria-hidden', 'true');
  const C = [[-.05, .9, .62, 58], [.22, 1.15, .7, 74], [.48, .8, .5, 66], [.7, 1.3, .8, 86], [.05, .7, .45, 92]];
  C.forEach(([top, w, h, dur], i)=>{ const b = document.createElement('i'); b.style.cssText = `top:${(top*100).toFixed(0)}%; left:0; width:${(w*36).toFixed(1)}vw; height:${(h*40).toFixed(1)}%; animation-duration:${dur}s; animation-delay:${-(dur*(i*.23 + .1)).toFixed(1)}s;`; lay.appendChild(b); });
  host.insertBefore(lay, host.firstChild); return lay;
}
// Heal: a few ➕ rise from the card (the heal's own plus, 2026-10-16: "The heal animation should include the + emoji.").
function healPlus(target, o){
  o = o || {}; if(!target || !w2ready()){ call(o.onDone); return; } const g = G(), c = centre(target);
  for(let i = 0; i < 4; i++){ const p = layer('sfx-w2-plus', '➕'); g.set(p, {x:c.r.left + c.w*rnd(.2, .8), y:c.r.top + c.h*rnd(.45, .8), xPercent:-50, yPercent:-50, opacity:0, scale:.5});
    g.timeline({delay:i*.09, onComplete:()=> p.remove()}).to(p, {opacity:1, scale:1, duration:.14, ease:'back.out(3)'}).to(p, {y:`-=${rnd(30, 50)}`, opacity:0, duration:.55, ease:'power1.in'}); }
  later(o.onDone, 700);
}
Object.assign(root.SkillFX, {w2Css, venomBite, toxinMark, weakenDrain, wilt, bulldozeShove, vineBind, squeeze, invincibleBlock, unveil, gasCloud, absoluteZero, trapSet, trapSnap, nova, crystalForm, cure, tauntCall, cloudShadows, healPlus});
})(typeof window !== 'undefined' ? window : globalThis);
