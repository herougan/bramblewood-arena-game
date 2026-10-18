// Batch E lab registrations (2026-10-15): conquest-map, world-ambience.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.E.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-e.js, which the game loads too). Effects that already exist in the game but whose code lives in arena_app.js
// (not bundled into the lab) are demoed with the game's own CSS classes and markup, the way arena_app.js builds them.
(function(){
const R = FXLAB.register, X = ()=> window.FX.E, SH = ()=> window.BramblewoodShaders;
const ROUTE = [[12, 72], [31, 52], [52, 64], [71, 44], [88, 24]];
// Dress the map stage as another map (its own art) and optionally lay its shader overlay on, as the game does.
const theme = (ctx, id)=>{ const l = ctx.map.layout; l.className = l.className.replace(/map-theme-\w+/, 'map-theme-' + id); return l; };
const shader = (ctx, kind, host)=>{ try{ const S = SH(); if(!S || kind == null) return null; return S.mount(host || ctx.map.layout, {preset:'map', kind, prepend:true, className:'bw-shader-map'}); }catch(e){ return null; } };
const kindOf = id=>{ try{ return SH().MAP_KIND[id]; }catch(e){ return null; } };
const at = (cls, html, x, y, host)=>{ const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; if(cls) el.classList.add(...cls.split(' ').filter(Boolean)); el.style.left = x + '%'; el.style.top = y + '%'; host.appendChild(el); return el; };
const hold = (ctx, ms)=> ctx.wait(ms || 4200);

// ---- 1. Map ambience, one entry per map ----
// The ten maps batch E gave a look of their own (A = ours, B = a second take, C = the old shader where one played).
const OWN = {m1:'Bramblewood Outskirts', mo:'The Old Bramble', mq:'Clovermead', ms:'The Sunken Grove', mz:'The Mycelium Deep', mn:'The Glimmer Depths', mi:'The Ice Hollow', mv:'The Aerie Vault', mx:'Volcano Lair', mc:'Gannet Cliffs'};
Object.keys(OWN).forEach(id=>{
  const A = X().AMB[X().MAP_AMB[id]], B = X().AMB[X().MAP_AMB_B[id]];
  const vs = [{key:'A', label:A.label, play:ctx=>{ theme(ctx, id); X().mapAmbience(ctx.map.layout, id); return hold(ctx); }},
    {key:'B', label:B.label, play:ctx=>{ theme(ctx, id); X().mapAmbience(ctx.map.layout, id, {variant:'B'}); return hold(ctx); }}];
  if(kindOf(id) != null) vs.push({key:'C', label:'Before: the shared shader (' + (id === 'm1' ? 'savanna heat shimmer' : 'beach foam') + ')', play:ctx=>{ theme(ctx, id); shader(ctx, kindOf(id)); return hold(ctx); }});
  R({id:'map-amb-' + id, stage:'map', inGameHook:'hooks.mapShown → FX.E.mapAmbience(host, \'' + id + '\') (a canvas layer on the map frame' + (X().REPLACES_SHADER.has(id) ? '; hides the old shader layer' : '') + ')',
    note:OWN[id] + ': a look of its own (canvas ambience: fog, light, particles, critters, events).', variants:vs});
});
// The maps that already have a shader look that fits: the game's own overlay on the map's own art.
['mtut','mf','mb','mp','mg','m2','mw','m8','mu','m4','mk','m7','mj','m10','mh','mr','m5','my','ml','mt','m6','md','m3','m9','m11','me','m21'].forEach(id=>{
  R({id:'map-amb-' + id, stage:'map', inGameHook:'renderConquestSubTab → mountMapShader(host, \'' + id + '\') (shader kind ' + kindOf(id) + ')', variants:[
    {key:'A', label:'The map shader on its art (live)', play:ctx=>{ theme(ctx, id); shader(ctx, kindOf(id)); return hold(ctx, 3600); }}]});
});

// ---- critters per biome (startMapMovers): demoed with the game's .map-mover class and the same hop between plants ----
const BIOME = {forest:['🦋','butterfly','mf'], water:['🐟','fish','m2'], ash:['🔥','firefly','m3'], cave:['🦇','bat','m4'], savanna:['🦋','butterfly','m5'], tundra:['🐦','bird','m6'],
  reef:['🐠','fish','m7'], swamp:['✨','firefly','mw'], forge:['🔥','firefly','m9'], alpine:['🦅','bird','m10'], meadow:['🐝','butterfly','ml'], beach:['🦀','fish','mb']};
const movers = (ctx, emoji, kind, n)=>{ const g = ctx.gsap, cv = ctx.map.el;
  for(let i = 0; i < (n || 4); i++){ const el = document.createElement('span'); el.className = 'map-mover mv-' + kind; el.textContent = emoji; el.style.fontSize = (kind === 'firefly' ? 10 : 15) + 'px';
    let x = 15 + Math.random()*70, y = 20 + Math.random()*60; el.style.left = x + '%'; el.style.top = y + '%'; cv.appendChild(el);
    const tl = g.timeline({repeat:-1}); for(let k = 0; k < 6; k++){ const nx = 10 + Math.random()*80, ny = 15 + Math.random()*70, left = nx < x;
      tl.set(el, {scaleX:left ? 1 : -1}).to(el, {left:nx + '%', top:ny + '%', duration:1 + Math.random(), ease:'sine.inOut'}).to(el, {y:-4, duration:.15, yoyo:true, repeat:3}); x = nx; y = ny; } } };
Object.keys(BIOME).forEach(b=>{ const [e, k, id] = BIOME[b];
  R({id:'map-movers-' + b, stage:'map', inGameHook:'startMapMovers(canvas, map, decor): biome ' + b, variants:[{key:'A', label:e + ' ' + k + 's hop from plant to plant (as startMapMovers)', play:ctx=>{ theme(ctx, id); movers(ctx, e, k, 4); return hold(ctx, 3600); }}]}); });
R({id:'map-decor-static', stage:'map', inGameHook:'generatedMapDecor (drawn when a map has no painted art)', variants:[{key:'A', label:'Seeded trees and plants, clear of fights and trails', play:ctx=>{
  const l = ctx.map.layout; l.classList.remove('has-map-art'); const items = ['🌲','🌳','🍄','🌿','🌼','🌱','🍀','🪨','🌸','🌾'];
  for(let i = 0; i < 26; i++) at('', `<span class="map-decor map-decor-emoji ${i < 7 ? 'map-tree' : 'map-small'}" style="font-size:${i < 7 ? 26 : 14}px">${items[i % items.length]}</span>`, 4 + Math.random()*92, 8 + Math.random()*86, ctx.map.el);
  return hold(ctx, 2600); }}]});

// ---- caves and the dark ----
const caveDark = (ctx, r)=>{ const d = document.createElement('div'); d.className = 'cave-dark'; ctx.map.el.appendChild(d); d.style.setProperty('--lr', (r || 150) + 'px'); d.style.setProperty('--lx', '50%'); d.style.setProperty('--ly', '50%'); return d; };
R({id:'map-snails', stage:'map', inGameHook:'startMapAdornments on cave maps', variants:[{key:'A', label:'A snail creeps, leaving faint blue trails (sped up 20×)', play:ctx=>{ theme(ctx, 'm4');
  const s = at('', '<span class="cave-snail">🐌</span>', 30, 60, ctx.map.el), o = {x:30}; let t = 0;
  ctx.gsap.to(o, {x:62, duration:3.6, ease:'none', onUpdate:()=>{ s.style.left = o.x + '%'; s.style.transform = 'translate(-50%,-50%) scaleX(-1)'; if(o.x - t > 1.6){ t = o.x; at('', '<i class="snail-trail"></i>', o.x - 1, 61, ctx.map.el); } }});
  return hold(ctx, 3800); }}]});
R({id:'map-crystal-sparkle', stage:'map', inGameHook:'startMapAdornments (crystal pixels found by colour)', variants:[{key:'A', label:'Crystals in the art sparkle now and then', play:async ctx=>{ theme(ctx, 'mn');
  for(let i = 0; i < 9; i++){ const e = at('', '<i class="crystal-sparkle"></i>', 10 + Math.random()*80, 15 + Math.random()*70, ctx.map.el); ctx.wait(1100).then(()=> e.remove()); await ctx.wait(320); } await ctx.wait(800); }}]});
R({id:'map-predator-eyes', stage:'map', inGameHook:'startMapAdornments on dark maps, away from the lantern', variants:[{key:'A', label:'Eyes glint in the dark and blink', play:async ctx=>{ theme(ctx, 'm4'); caveDark(ctx, 120);
  at('', '<span class="pred-eyes"><i></i><i></i></span>', 78, 30, ctx.map.el); await ctx.wait(900); at('', '<span class="pred-eyes is-red"><i></i><i></i></span>', 20, 70, ctx.map.el); await ctx.wait(2800); }}]});
R({id:'map-cave-dark', stage:'map', inGameHook:'mountCaveDark (cave maps)', variants:[{key:'A', label:'Dark veil with a lantern that follows the pointer', play:ctx=>{ theme(ctx, 'm4'); shader(ctx, 3); const d = caveDark(ctx, 130), o = {x:.2, y:.6};
  ctx.gsap.to(o, {x:.8, y:.3, duration:3, ease:'sine.inOut', onUpdate:()=>{ d.style.setProperty('--lx', o.x*100 + '%'); d.style.setProperty('--ly', o.y*100 + '%'); }}); return hold(ctx, 3400); }}]});
R({id:'map-cave-light-spread', stage:'map', inGameHook:'caveLightSpread after the loading card lifts on a cave map', variants:[{key:'A', label:'Light spreads out, then settles into the lantern', play:ctx=>{ theme(ctx, 'm4'); const d = caveDark(ctx, 0), o = {r:0};
  ctx.gsap.timeline().to(o, {r:900, duration:1.1, ease:'power2.out', onUpdate:()=> d.style.setProperty('--lr', o.r + 'px')}).to(o, {r:195, duration:1.4, delay:.5, ease:'power2.inOut', onUpdate:()=> d.style.setProperty('--lr', o.r + 'px')}); return hold(ctx, 3600); }}]});
R({id:'map-dark-cleared', stage:'map', inGameHook:'renderConquestSubTab: .conquest-layout.dark-cleared', variants:[{key:'A', label:'A cleared dark map lifts and glows warm', play:async ctx=>{ const l = theme(ctx, 'm8'); await ctx.wait(700); l.classList.add('dark-cleared'); await ctx.wait(2600); }}]});
R({id:'map-veil', stage:'map', inGameHook:'showMapVeil until the shader draws its first frame', variants:[{key:'A', label:'The map\'s name card, then it lifts', play:async ctx=>{
  const v = at('', `<div class="map-veil" role="status"><div class="mv-card"><span class="mv-ico">🌾</span><b class="mv-name">Bramblewood Outskirts</b><small class="mv-num">Map 0</small><span class="mv-dots"><i></i><i></i><i></i></span></div></div>`, 0, 0, ctx.map.layout);
  v.style.left = ''; v.style.top = ''; ctx.sound('mapUnroll'); await ctx.wait(1500); v.classList.add('is-lifting'); await ctx.wait(800); }}]});

// ---- nodes ----
const N = ctx=> ctx.map.nodes;
// (map-nodes-drop is demoed in manifest/_existing.js)
R({id:'map-node-available', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes: every open fight', note:'Was: a beacon on tutorial fights only.', variants:[
  {key:'A', label:'A soft ring beckons outward', play:ctx=>{ X().nodeAvailable(N(ctx).available); return hold(ctx, 3000); }},
  {key:'B', label:'A bobbing gold chevron above it', play:ctx=>{ X().nodeAvailable_B(N(ctx).available); return hold(ctx, 3000); }}]});
R({id:'map-node-locked', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes: locked fights', variants:[
  {key:'A', label:'Brambles hold it shut; the padlock glints', play:ctx=>{ X().nodeLocked(N(ctx).locked); return hold(ctx, 3600); }},
  {key:'B', label:'Mist wisps drift round it', play:ctx=>{ X().nodeLocked_B(N(ctx).locked); return hold(ctx, 3600); }}]});
R({id:'map-node-cleared', stage:'map', inGameHook:'hooks.mapShown: a fight that turned .done since the last view (deferred until the map is in front)', variants:[
  {key:'A', label:'Wax seal stamps it (rank in the wax), leaf burst', play:async ctx=>{ const n = N(ctx).available; await ctx.wait(300); await X().nodeCleared(n, {rank:'S', onImpact:()=> n.classList.add('done')}); await ctx.wait(400); }},
  {key:'B', label:'An ink tick, quickly drawn, with a spatter', play:async ctx=>{ const n = N(ctx).available; await ctx.wait(300); await X().nodeCleared_B(n, {onImpact:()=> n.classList.add('done')}); await ctx.wait(300); }}]});
R({id:'map-node-rank', stage:'map', inGameHook:'hooks.mapShown: after the seal, the rank you earned (progress.ranks)', variants:[
  {key:'A', label:'S rank: gold chip pops and shines', play:async ctx=>{ await X().nodeRank(N(ctx).cleared[1], 'S'); }},
  {key:'B', label:'SSS: prismatic', play:async ctx=>{ await X().nodeRank(N(ctx).cleared[1], 'SSS'); }},
  {key:'C', label:'A: silver, quieter', play:async ctx=>{ await X().nodeRank(N(ctx).cleared[1], 'A'); }}]});
const line = (ctx, i)=> ctx.map.trailLines[i];
const unlockLocked = ctx=>{ const n = N(ctx).locked; n.classList.remove('map-node-hidden'); n.classList.add('map-node'); n.querySelectorAll('.map-node-lock').forEach(e=> e.remove()); const i = n.querySelector('.map-node-ico-locked'); if(i) i.classList.remove('map-node-ico-locked'); line(ctx, 2).classList.remove('is-dark'); return n; };
R({id:'map-trail-unlock', stage:'map', inGameHook:'hooks.mapShown: a fight newly visible since the last view → the trail line into it', variants:[
  {key:'A', label:'Ink line draws itself, a bright nib leads', play:async ctx=>{ const n = unlockLocked(ctx); await ctx.wait(200); await X().trailDraw(ctx.map.el, line(ctx, 2), n); await ctx.wait(400); }},
  {key:'B', label:'Footprints walk the new path', play:async ctx=>{ const n = unlockLocked(ctx); await ctx.wait(200); await X().trailDraw_B(ctx.map.el, line(ctx, 2), n); }},
  {key:'C', label:'A firefly flies it and lights the fight', play:async ctx=>{ const n = unlockLocked(ctx); await ctx.wait(200); await X().trailDraw_C(ctx.map.el, line(ctx, 2), n); await ctx.wait(400); }}]});
const legs = (pts, ms)=>{ const out = []; let t0 = performance.now() + 100; for(let i = 1; i < pts.length; i++){ const a = {x:pts[i-1][0], y:pts[i-1][1]}, b = {x:pts[i][0], y:pts[i][1]}, d = Math.hypot(b.x - a.x, b.y - a.y), hops = Math.max(1, Math.min(7, Math.round(d/6))), dur = Math.max(.12, Math.min(1.6, .22*hops)); out.push({from:a, to:b, t0, dur, hops}); t0 += dur*1000; } return out; };
const walk = (ctx, L)=>{ const g = ctx.gsap, p = ctx.map.pawn, body = p.querySelector('.mp-body'), tl = g.timeline({delay:.1});
  L.forEach(l=>{ tl.add(()=> g.set(body, {scaleX:l.to.x < l.from.x ? 1 : -1})); tl.to(p, {left:l.to.x + '%', top:l.to.y + '%', duration:l.dur, ease:'none'}); tl.fromTo(body, {y:0}, {y:-9, duration:l.dur/l.hops/2, ease:'power1.out', yoyo:true, repeat:l.hops*2 - 1}, '<'); });
  return tl; };
R({id:'map-pawn-hop', stage:'map', inGameHook:'placeMapPawn on picking another fight', variants:[{key:'A', label:'Hops to the next fight (as placeMapPawn)', play:ctx=>{ const p = ctx.map.pawn; p.style.left = ROUTE[2][0] + '%'; p.style.top = ROUTE[2][1] + '%';
  walk(ctx, legs([ROUTE[2], ROUTE[3]])); for(let k = 0; k < 4; k++) ctx.wait(150 + k*220).then(()=> ctx.sound('pawnStep')); return hold(ctx, 2200); }}]});
R({id:'map-pawn-walk', stage:'map', inGameHook:'placeMapPawn → fxHook(\'mapPawnWalk\', pawn, legs): footprints and dust on every hop of the walk', variants:[
  {key:'A', label:'Walks the trail, leaving footprints and dust', play:ctx=>{ const p = ctx.map.pawn; p.style.left = ROUTE[0][0] + '%'; p.style.top = ROUTE[0][1] + '%'; const L = legs(ROUTE.slice(0, 3)); walk(ctx, L); X().pawnTrail(p, L); return hold(ctx, 3600); }}]});
R({id:'map-pawn-dropin', stage:'map', inGameHook:'mapPawnDropIn on arriving at a map', variants:[{key:'A', label:'Grows out of a point, hops down with a squash (as mapPawnDropIn)', play:ctx=>{ const g = ctx.gsap, p = ctx.map.pawn, body = p.querySelector('.mp-body'), sh = p.querySelector('.mp-shadow');
  g.timeline().fromTo(body, {scale:0, y:-34, opacity:0}, {scale:1.25, y:-30, opacity:1, duration:.22, ease:'back.out(3)'}).to(body, {scale:1, duration:.08}).to(body, {y:0, duration:.32, ease:'power2.in'}).to(body, {scaleY:.78, scaleX:1.18, duration:.07}).to(body, {scaleY:1, scaleX:1, duration:.18, ease:'back.out(3)'});
  if(sh) g.fromTo(sh, {scale:.2, opacity:0}, {scale:1, opacity:1, duration:.6, ease:'power2.in'}); ctx.wait(600).then(()=> ctx.sound('pawnStep')); return hold(ctx, 1600); }}]});
const main = ctx=> ctx.map.layout.querySelector('.conquest-main');
R({id:'map-travel', stage:'map', inGameHook:'conquestPanTo → .conquest-main.world-in-left/right', variants:[{key:'A', label:'Slides in from the next map', play:async ctx=>{ const m = main(ctx); m.classList.add('world-in-right'); ctx.sound('pawnStep'); await ctx.wait(900); m.classList.remove('world-in-right'); void m.offsetWidth; theme(ctx, 'mf'); m.classList.add('world-in-left'); await ctx.wait(900); }}]});
R({id:'map-world-zoom', stage:'map', inGameHook:'openConquestWorld (.world-zoom-out / .world-zoom-in)', variants:[{key:'A', label:'Zooms out to the world, back in to a map', play:async ctx=>{ const m = main(ctx); m.classList.add('world-zoom-out'); await ctx.wait(700); m.classList.remove('world-zoom-out'); void m.offsetWidth; m.classList.add('world-zoom-in'); await ctx.wait(900); }}]});
// a little world atlas with the game's classes (renderConquestWorld)
const DIAMOND = id=> `<svg class="compass-diamond" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="fxe-cd-${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="var(--mt-a)"/><stop offset=".55" stop-color="var(--mt-b)"/><stop offset="1" stop-color="var(--mt-c)"/></radialGradient></defs>
  <polygon points="50,3 97,50 50,97 3,50" fill="url(#fxe-cd-${id})" stroke="#e9c46a" stroke-width="3.5"/><circle cx="50" cy="50" r="19" fill="rgba(10,14,18,.55)" stroke="rgba(255,240,200,.6)" stroke-width="1.2"/></svg>`;
const world = (ctx, stops)=>{ const m = main(ctx); m.classList.add('conquest-world'); m.innerHTML = `<div class="world-atlas" style="height:100%; position:relative">${stops.map(([id, ico, cls, x, y])=> `<div class="world-stop map-theme-${id} ${cls}" style="left:${x}%; top:${y}%"><button type="button" class="world-diamond">${DIAMOND(id)}<span class="wd-ico">${ico}</span></button></div>`).join('')}</div>`; return m; };
R({id:'map-world-here', stage:'map', inGameHook:'renderConquestWorld: .world-stop.is-here', variants:[{key:'A', label:'"You are here" ring breathes on the current map', play:ctx=>{ world(ctx, [['m1','🌾','',30,40], ['mf','🌲','is-here',60,55]]); return hold(ctx, 3000); }}]});
R({id:'map-world-fog', stage:'map', inGameHook:'hooks.mapWorldShown: a map open since the last world view', variants:[{key:'A', label:'Fog peels back, the diamond unrolls', play:async ctx=>{ const m = world(ctx, [['m1','🌾','',25,40], ['mb','🏖️','',50,60], ['m2','🌊','is-locked is-fog',75,40]]);
  await ctx.wait(500); const s = m.querySelectorAll('.world-stop')[2]; s.classList.remove('is-locked', 'is-fog'); await X().worldFogPeel(s); await ctx.wait(400); }}]});
R({id:'map-world-compass', stage:'map', inGameHook:'renderConquestWorld: .world-home .wh-compass', variants:[{key:'A', label:'The Home compass turns (60 s a turn; sped up here)', play:ctx=>{ const m = main(ctx);
  const b = at('', `<button type="button" class="world-home" style="position:absolute; transform:translate(-50%,-50%)"><svg class="wh-compass" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="rgba(20,14,8,.35)" stroke="#e9c46a" stroke-width="3"/><path d="M50 8 L56 44 L92 50 L56 56 L50 92 L44 56 L8 50 L44 44Z" fill="rgba(255,240,200,.5)" stroke="#e9c46a"/></svg></button>`, 50, 50, m);
  const c = b.querySelector('.wh-compass'); ctx.wait(60).then(()=> c.getAnimations().forEach(a=> a.playbackRate = 12)); return hold(ctx, 3000); }}]});
const emblem = (ctx, x, y, cls)=> at('', `<button type="button" class="map-cave map-subcave map-subemblem ${cls || ''}"><span class="mse-ico">🪷</span><span class="msc-name">Lilypad Reach</span></button>`, x, y, ctx.map.el);
R({id:'map-submap-enter', stage:'map', inGameHook:'enterSubMap (map zooms into the entrance; a dark side map closes an iris)', variants:[{key:'A', label:'The map dives into the entrance, the side map grows out', play:async ctx=>{ const e = emblem(ctx, 40, 30), m = main(ctx), l = ctx.map.layout;
  await ctx.wait(400); const r = e.getBoundingClientRect(), lr = l.getBoundingClientRect(); ctx.sound('whoosh');
  const a = m.animate([{transform:'none', filter:'none'}, {transform:'scale(4.5)', filter:'brightness(.2)'}], {duration:560, easing:'cubic-bezier(.6,0,.9,.4)', fill:'forwards'}); m.style.transformOrigin = `${(r.left + r.width/2 - lr.left)/ (lr.width/l.offsetWidth)}px ${(r.top + r.height/2 - lr.top)/(lr.height/l.offsetHeight)}px`;
  await ctx.wait(620); a.cancel(); m.style.transformOrigin = ''; theme(ctx, 'mp'); e.remove(); m.animate([{transform:'scale(.35)', opacity:0}, {transform:'scale(1.04)', opacity:1, offset:.7}, {transform:'none', opacity:1}], {duration:640, easing:'ease-out'}); await ctx.wait(1100); }}]});
R({id:'map-submap-leave', stage:'map', inGameHook:'leaveSubMap', variants:[{key:'A', label:'Quick pull-back to the parent map', play:async ctx=>{ theme(ctx, 'mp'); const m = main(ctx); await ctx.wait(300);
  const a = m.animate([{transform:'none', opacity:1}, {transform:'scale(.6)', opacity:0}], {duration:220, easing:'ease-in', fill:'forwards'}); await ctx.wait(260); a.cancel(); theme(ctx, 'm1'); m.animate([{transform:'scale(1.5)', opacity:0}, {transform:'none', opacity:1}], {duration:300}); await ctx.wait(700); }}]});
R({id:'map-submap-emblem', stage:'map', inGameHook:'subMapEntrancesHTML (.map-subemblem / .map-subcave)', variants:[{key:'A', label:'Side-map emblem bobs and glows', play:ctx=>{ emblem(ctx, 40, 30); emblem(ctx, 70, 75, 'is-done'); return hold(ctx, 3000); }}]});
const edge = ctx=> at('', '<button type="button" class="world-edge world-edge-right is-locked"><span>🔒</span><b>›</b></button>', 0, 0, ctx.map.el);
R({id:'map-cleared', stage:'map', inGameHook:'hooks.mapShown: conquestMapCleared(map) became true since the last view', variants:[
  {key:'A', label:'Art brightens, banner unfurls, critters gather, petals fly', play:async ctx=>{ ctx.map.nodeList.forEach(n=> n.classList.add('done')); await ctx.wait(200); await X().mapCleared(ctx.map.el, {name:'Bramblewood Outskirts', critters:['🐝','🦋','🐿️','🐝','🦔','🐞']}); }},
  {key:'B', label:'Paper lanterns rise off every fight', play:async ctx=>{ ctx.map.nodeList.forEach(n=> n.classList.add('done')); await ctx.wait(200); await X().mapCleared_B(ctx.map.el, {name:'Bramblewood Outskirts'}); }}]});
R({id:'map-next-unlocked', stage:'map', inGameHook:'hooks.mapShown: the right-hand world edge opened since the last view', variants:[{key:'A', label:'A dotted trail runs to the edge; "New map!"', play:async ctx=>{ const e = edge(ctx); e.style.left = ''; e.style.top = '';
  await ctx.wait(400); e.classList.remove('is-locked'); e.querySelector('span').textContent = '🌲'; await X().nextMapUnlocked(e, N(ctx).boss); }}]});
R({id:'map-ambush-node', stage:'map', inGameHook:'applyAmbushNode → .map-node.ambush-pop', variants:[{key:'A', label:'An ambush pops onto the map (game CSS)', play:ctx=>{ const n = N(ctx).available; n.classList.add('is-ambush', 'foe-otter', 'ambush-pop'); ctx.sound('ambushTone'); return hold(ctx, 1800); }}]});
R({id:'map-chance-node', stage:'map', inGameHook:'hooks.mapShown: a chance fight found since the last view', variants:[{key:'A', label:'Bushes rustle, the fight pops up', play:async ctx=>{ await ctx.wait(200); await X().chanceNode(N(ctx).available); await ctx.wait(400); }}]});
R({id:'map-late-side-map', stage:'map', inGameHook:'hooks.mapShown: a side-map entrance opened since the last view (afterDays / quest)', variants:[{key:'A', label:'The entrance surfaces with a dust ring', play:async ctx=>{ const e = emblem(ctx, 44, 30); await ctx.wait(100); await X().lateSideMap(e); await ctx.wait(600); }}]});
R({id:'map-boss-node', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes (boss kinds; world/final bosses take B)', variants:[
  {key:'A', label:'Red breath and a heartbeat, embers rising', play:ctx=>{ X().nodeBoss(N(ctx).boss); return hold(ctx, 3600); }},
  {key:'B', label:'Smoke curls off it (world bosses)', play:ctx=>{ X().nodeBoss_B(N(ctx).boss); return hold(ctx, 3600); }},
  {key:'C', label:'War pennants either side', play:ctx=>{ X().nodeBoss_C(N(ctx).boss); return hold(ctx, 3600); }}]});
R({id:'map-raid-node', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes (raidboss, megaraid, worldboss)', variants:[{key:'A', label:'Tentacles sway behind it, a glint', play:ctx=>{ const n = N(ctx).boss; n.className = 'map-node kind-raidboss kind-base-raidboss'; n.querySelector('.map-node-ico').textContent = '🐙'; X().nodeRaid(n); return hold(ctx, 3600); }}]});
R({id:'map-dungeon-node', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes (dungeon kind, endless maps)', variants:[{key:'A', label:'A dark doorway swirls, two torches flicker', play:ctx=>{ const n = N(ctx).available; n.classList.add('kind-dungeon'); X().nodeDungeon(n); return hold(ctx, 3600); }}]});
R({id:'map-elite-node', stage:'map', inGameHook:'hooks.mapShown → FX.E.decorateNodes (elite, champion)', variants:[{key:'A', label:'A slow laurel ring and a star glint', play:ctx=>{ const n = N(ctx).available; n.classList.add('kind-elite'); X().nodeElite(n); return hold(ctx, 3600); }}]});
R({id:'map-tutorial-reveal', stage:'map', inGameHook:'tutorial-solo.is-next + .tut-reveal', variants:[{key:'A', label:'Tutorial beacon; trail and camp fade in', play:ctx=>{ const n = N(ctx).available; n.classList.add('tutorial-solo', 'is-next');
  ctx.map.el.querySelectorAll('.map-trail-svg, .map-spot').forEach(e=> e.classList.add('tut-reveal')); return hold(ctx, 3200); }}]});
R({id:'map-leaves-reveal', stage:'map', inGameHook:'leavesRevealToMap (end of the tutorial)', variants:[{key:'A', label:'A gust of leaves sweeps the map open', play:ctx=>{ const g = ctx.gsap, s = at('', '<div class="leaf-sweep" style="position:absolute"><div class="ls-veil"></div></div>', 0, 0, ctx.map.layout); s.style.left = ''; s.style.top = '';
  const r = ctx.root.getBoundingClientRect(); for(let i = 0; i < 26; i++){ const l = document.createElement('i'); l.textContent = ['🍂','🍃','🍁'][i % 3]; l.style.fontSize = (14 + Math.random()*14) + 'px'; s.appendChild(l);
    g.fromTo(l, {x:-40, y:Math.random()*r.height, opacity:0, rotation:0}, {x:r.width + 40, y:'+=' + (Math.random()*80 - 40), opacity:1, rotation:Math.random()*540, duration:1.2 + Math.random()*.6, delay:Math.random()*.4, ease:'power1.inOut'}); }
  g.fromTo(main(ctx), {scale:1.15, opacity:.3}, {scale:1, opacity:1, duration:1.4, ease:'power2.out', clearProps:'transform,opacity'}); return hold(ctx, 2400); }}]});
R({id:'map-dragon-scale-node', stage:'map', inGameHook:'renderConquestSubTab: .map-node-scale on a node that hides a scale', variants:[{key:'A', label:'Something glints on the fight (game CSS)', play:ctx=>{ N(ctx).available.insertAdjacentHTML('beforeend', '<span class="map-node-scale"></span>'); return hold(ctx, 3000); }}]});
R({id:'map-dragon-scale-found', stage:'ui', inGameHook:'rollDragonScale → fxHook(\'dragonScaleFound\', {index, total}) over the results', variants:[{key:'A', label:'The scale flips up, red glint, 2/8 → 3/8', play:async ctx=>{ await X().scaleFound({index:3, total:8, host:ctx.root}); }}]}); // 2026-10-18 (audit E4): there are 8 scales (DRAGON_SCALE_NODES), not 10

// ---- feature spots: each opens in its own way (fxHook('mapSpotUnlock') in activateSpot) ----
Object.keys(X().SPOT_LOOK).filter(k=> !/^shop[23]$/.test(k)).forEach(k=>{
  const L = X().SPOT_LOOK[k], vs = [{key:'A', label:L.icon + ' lifts off the map and opens (' + L.open + ')', play:async ctx=>{ const s = ctx.map.spot; s.querySelector('.map-spot-ico').textContent = L.icon; await ctx.wait(150); await X().spotUnlock(k, s, {host:ctx.root}); }}];
  if(k === 'deck') vs.push({key:'B', label:'The same, played on the spot itself (smaller)', play:async ctx=>{ const s = ctx.map.spot; await ctx.wait(150); await X().spotUnlock(k, s, {host:ctx.root, inPlace:true}); }});
  R({id:'map-spot-' + k, stage:'map', inGameHook:'activateSpot (first visit) → fxHook(\'mapSpotUnlock\', spotEl, \'' + k + '\')', note:'Plays over the next screen, since the game switches to the new place at once.', variants:vs});
});
R({id:'map-spot-new-bang', stage:'map', inGameHook:'fadeNewBang', variants:[{key:'A', label:'The "!" fades once you have looked (game CSS)', play:async ctx=>{ const s = ctx.map.spot; s.classList.add('is-new'); s.insertAdjacentHTML('beforeend', '<span class="map-spot-new">!</span>'); await ctx.wait(1200);
  s.querySelectorAll('.map-spot-new').forEach(b=> b.classList.add('is-fading')); await ctx.wait(900); }}]});

// ---- curiosities: idle life, then the first look ----
const CUR = {signpost:['m1','🪧'], scarecrow:['mf','🧥'], beehive:['mf','🍯'], bottle:['mb','🍾'], crab:['mb','🦀'], lantern:['m2','🏮'], ashcairn:['m3','🪨'], peddler:['m3','🏮'], echo:['m4','🗣️'], glowpool:['m4','✨'],
  baobab:['m5','🌳'], drum:['m5','🥁'], icefish:['m6','🎣'], shell:['m7','🐚'], wreck:['m7','⚓'], wisp:['m8','🕯️'], anvil:['m9','⚒️'], eyrie:['m10','🪺'], banner:['m11','🚩']};
Object.keys(CUR).forEach(k=>{ const [mid, ico] = CUR[k];
  R({id:'map-curio-' + k, stage:'map', inGameHook:'hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook(\'mapCurioVisit\')', variants:[{key:'A', label:'Its own idle, then the "found!" hop on the first look', play:async ctx=>{ theme(ctx, mid);
    const c = at('', `<button type="button" class="map-curio is-new" data-curio="${k}"><span class="mcu-ico">${ico}</span><span class="map-spot-new">!</span></button>`, 40, 34, ctx.map.el);
    X().curioIdle(c, k); await ctx.wait(2600); c.querySelector('.map-spot-new').remove(); c.classList.remove('is-new'); ctx.sound('unlock'); await X().curioFound(c, k); await ctx.wait(900); }}]}); });
R({id:'map-well', stage:'map', inGameHook:'mapWellHTML / visitOldWell', variants:[{key:'A', label:'Bucket swings, the water ripples (game CSS)', play:ctx=>{ at('', '<button type="button" class="map-well is-new"><span class="mw-roof"></span><span class="mw-posts"></span><span class="mw-bucket"></span><span class="mw-ring"></span><span class="map-spot-new">!</span></button>', 44, 36, ctx.map.el); return hold(ctx, 3200); }}]});
R({id:'map-campfire', stage:'map', inGameHook:'mapCampfireHTML (the Glimmer Depths)', variants:[{key:'A', label:'Flickering glow, sparks drifting up (game CSS)', play:ctx=>{ theme(ctx, 'mn');
  at('', `<span class="map-campfire"><i class="mcf-glow"></i><b class="mcf-fire">🔥</b><span class="mcf-logs"></span>${Array.from({length:7}, (_, k)=> `<i class="mcf-spark" style="--sx:${(k*13)%22 - 11}px; animation-delay:${(k*0.37).toFixed(2)}s"></i>`).join('')}</span>`, 40, 34, ctx.map.el); return hold(ctx, 3200); }}]});
R({id:'map-courier', stage:'map', inGameHook:'freePackCourierHTML', variants:[{key:'A', label:'Burdock the courier mouse bobs with a pack (game CSS)', play:ctx=>{ at('', '<button type="button" class="map-courier"><span class="mco-who">🐭</span><span class="mco-pack">🎁</span><span class="map-spot-new">!</span></button>', 60, 40, ctx.map.el); return hold(ctx, 3000); }}]});
R({id:'map-wanderer', stage:'map', inGameHook:'wandererMapHTML (some days)', variants:[{key:'A', label:'A wanderer with a barrow rocks on the road (game CSS)', play:ctx=>{ at('', '<button type="button" class="map-wanderer"><span class="mwd-ico">🦡</span><span class="mwd-pack">🎒</span><span class="map-spot-new">!</span></button>', 60, 40, ctx.map.el); return hold(ctx, 3200); }}]});
R({id:'map-seasonal', stage:'map', inGameHook:'renderConquestSubTab: .season-veil.season-<month>', variants:[{key:'A', label:'Spring, summer, autumn, winter vignettes', play:async ctx=>{ const v = at('', '<div class="season-veil"></div>', 0, 0, ctx.map.layout); v.style.left = ''; v.style.top = '';
  for(const s of ['spring', 'summer', 'autumn', 'winter']){ v.className = 'season-veil season-' + s; await ctx.wait(900); } }}]});
R({id:'map-day-night-tint', stage:'map', inGameHook:'hooks.mapShown → FX.E.dayNight(host, canvas, todNow()): the clock, or the Atmosphere setting (golden = dusk, moonlit = night)', note:'In the game it follows the player\'s clock; dark and always-night maps keep their own look.', variants:[
  {key:'A', label:'Dusk: amber light, lanterns lit', play:ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'dusk'); return hold(ctx, 3200); }},
  {key:'B', label:'Night: blue, stars, lantern pools at the fights', play:ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'night'); return hold(ctx, 3200); }},
  {key:'C', label:'Dawn: a rose-gold blush', play:ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'dawn'); return hold(ctx, 3200); }}]});
R({id:'map-weather-fronts', stage:'map', inGameHook:'hooks.mapShown: about one map view in three (at most every 4 min, Effects High), the biome\'s front', variants:[
  {key:'A', label:'Rain front (green and wet maps)', play:ctx=>{ X().weatherFront(ctx.map.layout, 'rain', {duration:7}); return hold(ctx, 8200); }},
  {key:'B', label:'Snow front (tundra, alpine)', play:ctx=>{ theme(ctx, 'm6'); X().weatherFront(ctx.map.layout, 'snow', {duration:8}); return hold(ctx, 9200); }},
  {key:'C', label:'Fog bank rolls through (swamp, reef)', play:ctx=>{ theme(ctx, 'mw'); X().weatherFront(ctx.map.layout, 'fogfront', {duration:8}); return hold(ctx, 9200); }},
  {key:'D', label:'Ash flurry (burnt maps)', play:ctx=>{ theme(ctx, 'm3'); X().weatherFront(ctx.map.layout, 'ashfront', {duration:7}); return hold(ctx, 8200); }},
  {key:'E', label:'Sand gust (savanna)', play:ctx=>{ theme(ctx, 'm5'); X().weatherFront(ctx.map.layout, 'sandfront', {duration:6}); return hold(ctx, 7200); }}]});
R({id:'map-water-shimmer', stage:'map', inGameHook:'water / coral / beach shader kinds (1, 6, 12)', variants:[{key:'A', label:'Caustics and glints (live shader, Lilypad Reach)', play:ctx=>{ theme(ctx, 'mp'); shader(ctx, 1); return hold(ctx, 3600); }}]});
R({id:'map-fog-misty', stage:'map', inGameHook:'hooks.mapShown on m1 → mist ambience (the savanna shader is hidden there)', variants:[
  {key:'A', label:'Low mist banks drift between the fights, dew winks', play:ctx=>{ X().mapAmbience(ctx.map.layout, 'm1'); return hold(ctx); }},
  {key:'B', label:'Thick fog that breathes thick and thin', play:ctx=>{ X().mapAmbience(ctx.map.layout, 'm1', {variant:'B'}); return hold(ctx); }}]});
R({id:'map-chaos-returns', stage:'map', inGameHook:'future', note:'Planned for Map 40+. B is the Map 50+ magic lands take: rune circles, an arcane aurora. C–E: the roadmap\'s later lands by biome (Maps 40+ dinosaurs, 45+ aliens, 50–60 Syzygy).', variants:[
  {key:'A', label:'Map pulls back; advanced fights land with ripples', play:async ctx=>{ theme(ctx, 'm11'); await X().chaosReturns(ctx.map.el); }},
  {key:'B', label:'Concept: Map 50+ magic lands, fights rise out of rune circles', play:async ctx=>{ theme(ctx, 'mv'); X().ambience(ctx.map.layout, 'magic'); await X().chaosReturns_B(ctx.map.el); }},
  // 2026-10-15: the roadmap's later lands by biome (world-roadmap-2026-10-13), each as the ambience its maps would get
  {key:'C', label:'Concept: ' + X().AMB.prehistoric.label, play:ctx=>{ theme(ctx, 'mr'); X().ambience(ctx.map.layout, 'prehistoric'); return hold(ctx, 5000); }},
  {key:'D', label:'Concept: ' + X().AMB.alien.label, play:ctx=>{ theme(ctx, 'm5'); X().ambience(ctx.map.layout, 'alien'); return hold(ctx, 6200); }},
  {key:'E', label:'Concept: ' + X().AMB.syzygy.label, play:ctx=>{ theme(ctx, 'mb'); X().ambience(ctx.map.layout, 'syzygy'); return hold(ctx, 5000); }}]});
R({id:'map-headline-ghost', stage:'map', inGameHook:'GHOST_BANNERS pointer watcher (.is-away / .is-ghost)', variants:[{key:'A', label:'The title banner steps aside when touched', play:async ctx=>{ const m = main(ctx);
  const h = document.createElement('div'); h.className = 'conquest-scrim conquest-headline'; h.innerHTML = '<h3>🌾 Bramblewood Outskirts</h3><p class="panel-sub">Map 0 · misty fields</p>'; m.insertBefore(h, m.firstChild);
  await ctx.wait(900); h.classList.add('is-away'); await ctx.wait(1400); h.classList.remove('is-away'); await ctx.wait(900); }}]});

// ---- new shader looks (built as canvas ambience layers in bramblewood-fx-e.js) ----
const look = (id, mapId, a, b, fut, note)=> R({id, stage:'map', inGameHook:fut ? 'future' : 'hooks.mapShown → FX.E.mapAmbience on ' + mapId, note, variants:[
  {key:'A', label:X().AMB[a].label, play:ctx=>{ theme(ctx, mapId); X().ambience(ctx.map.layout, a); return hold(ctx); }},
  {key:'B', label:(fut && b === 'veggie' ? 'Concept: ' : '') + X().AMB[b].label, play:ctx=>{ theme(ctx, b === 'veggie' ? 'mq' : mapId); X().ambience(ctx.map.layout, b); return hold(ctx); }}]});
look('map-shader-new-fungal', 'mz', 'fungal', 'fungalB');
look('map-shader-new-dragon-lair', 'mx', 'lair', 'lairB');
look('map-shader-new-ice-cave', 'mi', 'icecave', 'icecaveB');
look('map-shader-new-crystal-cave', 'mn', 'crystal', 'crystalB');
look('map-shader-new-misty-meadow', 'm1', 'mist', 'mistThick');
look('map-shader-new-abyssal', 'mj', 'abyssal', 'abyssalB', true, 'Abyssal Plains (Map 29), lab concept.');
look('map-shader-new-dragonic-spire', 'm11', 'spire', 'spireB', true, 'Dragonic Spire, lab concept: red lightning that never stops, wither smoke rolling down.');
look('map-shader-new-floodplains', 'm2', 'flood', 'veggie', true, 'A: the Floodplains. B: the Flora lands (Maps 20+), a lab concept with no inventory row of its own. C: the roadmap\'s full Floodplains loop.');
// 2026-10-15: the roadmap's full loop (world-roadmap-2026-10-13: Flooded → Receded → Parched → Flooded), one 9 s cycle
R({id:'map-shader-new-floodplains', variants:[{key:'C', label:X().AMB.floodLoop.label, play:ctx=>{ theme(ctx, 'm5'); X().ambience(ctx.map.layout, 'floodLoop'); return hold(ctx, 9500); }}]});

// ---- world ambience ----
const splash = ()=>{ const v = getComputedStyle(document.documentElement).getPropertyValue('--splash-art').trim(); const m = v.match(/^url\((['"]?)(.*)\1\)$/); return m ? m[2] : ''; };
const screenHost = ctx=> ctx.root.querySelector('.fxl-screen') || ctx.root;
R({id:'amb-home-splash', stage:'screen', inGameHook:'entrance: mountSceneShader', variants:[{key:'A', label:'The painted splash through the scene shader (sway, ripple, bloom, shafts, fireflies)', play:ctx=>{ const h = screenHost(ctx), img = splash();
  if(img && SH()) SH().mount(h, {preset:'scene', image:img, prepend:true}); else shader(ctx, 0, h); return hold(ctx, 4000); }}]});
R({id:'amb-home', stage:'screen', inGameHook:'Home: depth parallax + live clock tint + CalmMusic', variants:[{key:'A', label:'The scene shader with tonight\'s tint (clock)', play:ctx=>{ const h = screenHost(ctx), img = splash(); h.style.position = 'relative';
  if(img && SH()) SH().mount(h, {preset:'scene', image:img, prepend:true}); X().dayNight(h, null, X().todNow() === 'day' ? 'dusk' : X().todNow()); return hold(ctx, 4000); }}]});
const fixedIn = (ctx, html)=>{ const d = document.createElement('div'); d.innerHTML = html; const e = d.firstElementChild; e.style.position = 'absolute'; ctx.root.appendChild(e); return e; };
R({id:'amb-leaf-sweep', stage:'screen', inGameHook:'tab change: .leaf-sweep', variants:[{key:'A', label:'A gust of leaves sweeps across (game CSS)', play:ctx=>{ const s = fixedIn(ctx, '<div class="leaf-sweep"><div class="ls-veil"></div></div>'), r = ctx.root.getBoundingClientRect();
  for(let i = 0; i < 18; i++){ const l = document.createElement('i'); l.textContent = ['🍂','🍃','🍁'][i % 3]; l.style.fontSize = (16 + Math.random()*14) + 'px'; s.appendChild(l);
    ctx.gsap.fromTo(l, {x:-40, y:Math.random()*r.height, opacity:0}, {x:r.width + 40, y:'+=' + (Math.random()*60 - 30), opacity:1, rotation:Math.random()*540, duration:1.1 + Math.random()*.5, delay:Math.random()*.4}); }
  return hold(ctx, 2000); }}]});
R({id:'amb-armoury', stage:'screen', inGameHook:'enter Deck: .tent-flaps', variants:[{key:'A', label:'Tent flaps part (game CSS)', play:ctx=>{ fixedIn(ctx, '<div class="tent-flaps"><i></i><i></i></div>'); ctx.sound('featherFlutter'); return hold(ctx, 1400); }}]});
R({id:'amb-shop', stage:'screen', inGameHook:'enter Shop: .cart-awning', variants:[{key:'A', label:'The awning rolls up (game CSS)', play:ctx=>{ fixedIn(ctx, '<div class="cart-awning"></div>'); ctx.sound('coinRegister'); return hold(ctx, 1400); }}]});
R({id:'amb-nest', stage:'screen', inGameHook:'enter Nest: .nest-down', variants:[{key:'A', label:'Down drifts in (game CSS)', play:ctx=>{ fixedIn(ctx, `<div class="nest-down">${Array.from({length:10}, (_, i)=> `<i style="left:${5 + i*9.5}%; animation-delay:${(i%4)*.25}s"></i>`).join('')}</div>`); return hold(ctx, 2800); }}]});
R({id:'amb-forge', stage:'screen', inGameHook:'enter Forge: .forge-flare + .forge-sparks', variants:[{key:'A', label:'Hearth flares, sparks rise (game CSS)', play:ctx=>{ fixedIn(ctx, '<div class="forge-flare"></div>');
  fixedIn(ctx, `<div class="forge-sparks">${Array.from({length:12}, (_, i)=> `<i style="left:${4 + i*8}%; animation-delay:${(i*.33).toFixed(2)}s"></i>`).join('')}</div>`); ctx.sound('forgeStrike'); return hold(ctx, 3000); }}]});
R({id:'amb-codex', stage:'ui', inGameHook:'Codex section change: page turn', variants:[{key:'A', label:'The page swings in like a book (as the Codex)', play:ctx=>{ const c = ctx.ui.results; c.style.transformOrigin = '0 50%'; ctx.sound('pageTurn');
  c.animate([{transform:'perspective(900px) rotateY(-80deg)', opacity:.2}, {transform:'perspective(900px) rotateY(0)', opacity:1}], {duration:520, easing:'cubic-bezier(.2,.8,.3,1)'}); return hold(ctx, 1200); }}]});
R({id:'amb-quests', stage:'ui', inGameHook:'openQuestsModal → fxHook(\'questBoardOpen\', modal, opening)', variants:[{key:'A', label:'Pinned papers lift in the draught; corners curl', play:ctx=>{ const m = document.createElement('div'); m.className = 'modal quests-modal qn-modal'; m.style.cssText = 'position:relative; margin:8px auto; max-height:none;';
  m.innerHTML = `<div class="qn-cork">${['Win 3 fights','Open a pack','Clear a map','Forge a card'].map((t, i)=> `<div class="qn-note" style="--rot:${(i%3 - 1)*1.2}deg"><span class="qn-pin"></span><b>${t}</b><small>0/1</small></div>`).join('')}</div>`;
  ctx.ui.el.innerHTML = ''; ctx.ui.el.appendChild(m); X().questBoardIdle(m, true); m.querySelectorAll('.fxe-curl').forEach((c, i)=> c.style.animationDelay = (-5 + i*.5) + 's'); return hold(ctx, 3600); }}]});
R({id:'amb-arena', stage:'screen', inGameHook:'live: Arena fights stand on the tourney ground (map art marena) under bunting (syncSceneFx); this full-stands concept is not wired' /* 2026-10-18 (audit R3-WP6) */, variants:[{key:'A', label:'Concept: a sand floor, full stands, banners in the wind', play:ctx=>{ const h = screenHost(ctx); h.style.position = 'relative'; X().arenaScene(h); return hold(ctx, 3600); }}]});
R({id:'amb-tavern', stage:'ui', inGameHook:'openTavern → fxHook(\'tavernOpen\', modal)', variants:[{key:'A', label:'Hearth glow underneath, two mugs clink', play:async ctx=>{ const m = document.createElement('div'); m.className = 'modal tavern-modal'; m.style.cssText = 'position:relative; margin:30px auto; max-width:420px; min-height:200px;';
  m.innerHTML = '<div class="modal-head-row"><h2>🍺 The Tavern</h2></div><section class="wp-stamina"><h3>⚡ Stamina</h3><p>Max Energy is raised in the Camp and the Forge.</p></section>'; ctx.ui.el.innerHTML = ''; ctx.ui.el.appendChild(m);
  await ctx.wait(200); await X().tavernOpen(m); await ctx.wait(1600); }}]});
R({id:'amb-battle-felt', stage:'board', inGameHook:'every battle: felt shader (lamp, impact lights, card shadows)', variants:[{key:'A', label:'Lit felt with card shadows (live shader)', play:ctx=>{ try{ SH().mount(ctx.board.el, {preset:'map', kind:0, felt:1, prepend:true, className:'bw-shader-battle', shadows:'.card-tile', intensity:.5}); }catch(e){} return hold(ctx, 3200); }}]});
R({id:'amb-battle-map-terrain', stage:'board', inGameHook:'battle background: the map\'s terrain + its shader kind', variants:[{key:'A', label:'The Outskirts terrain under the cards (live shader)', play:ctx=>{ ctx.board.el.classList.add('map-m1'); try{ SH().mount(ctx.board.el, {preset:'map', kind:4, felt:2, prepend:true, className:'bw-shader-battle', shadows:'.card-tile', intensity:.55}); }catch(e){} return hold(ctx, 3200); }}]});
R({id:'amb-sound-places', stage:'map', inGameHook:'Ambience.play(kind, mapId) per place', note:'Turn sound on to hear it.', variants:[{key:'A', label:'The Outskirts bed: breeze and birds (Ambience)', play:async ctx=>{ shader(ctx, 4); try{ Ambience.play(4, 'm1'); }catch(e){} await ctx.wait(3500); try{ Ambience.stop(); }catch(e){} }}]});
R({id:'amb-music', stage:'ui', inGameHook:'Songbook / BattleMusic', note:'Turn sound on to hear it.', variants:[{key:'A', label:'The victory sting (Songbook)', play:ctx=>{ try{ Songbook.sting('victory'); }catch(e){} return hold(ctx, 3000); }}]});
R({id:'amb-motes', stage:'map', inGameHook:'scene and map shaders', variants:[{key:'A', label:'Fireflies and motes (forest shader)', play:ctx=>{ theme(ctx, 'mf'); shader(ctx, 0); return hold(ctx, 3600); }}]});
R({id:'amb-raid-splash', stage:'screen', inGameHook:'future', variants:[{key:'A', label:'Concept: silhouettes in layers slide against each other, the beast nearest', play:async ctx=>{ const h = screenHost(ctx); h.style.position = 'relative'; await X().raidSplash(h); }}]});
R({id:'amb-crt-grain', stage:'map', inGameHook:'future', note:'Optional atmosphere packs beside the 🌧️ Rain one.', variants:[
  {key:'A', label:'Concept: film grain', play:ctx=>{ X().atmoGrain(ctx.root); return hold(ctx, 3000); }},
  {key:'B', label:'Concept: an old CRT (scanlines, flicker, vignette)', play:ctx=>{ X().atmoCrt(ctx.root); return hold(ctx, 3000); }},
  {key:'C', label:'Concept: rain running down the glass', play:ctx=>{ X().atmoRainGlass(ctx.root); return hold(ctx, 4000); }}]});
R({id:'amb-ink-transition', stage:'map', inGameHook:'future', note:'For lore, choosing a faction, the end of the campaign.', variants:[
  {key:'A', label:'Concept: ink blooms out and covers, then washes away', play:async ctx=>{ await X().inkWash(ctx.root); }},
  {key:'B', label:'Concept: one brush stroke wipes across', play:async ctx=>{ await X().inkWash_B(ctx.root); }}]});
R({id:'amb-ant-lampposts', stage:'map', inGameHook:'future', variants:[{key:'A', label:'Concept: acid-battery lamps along the road at night, ants marching', play:ctx=>{ theme(ctx, 'm5'); X().ambience(ctx.map.layout, 'ants'); return hold(ctx, 4000); }}]});
R({id:'amb-otter-roads', stage:'map', inGameHook:'future', variants:[{key:'A', label:'Concept: teal-and-bronze forts, a patrol marches the road', play:async ctx=>{ theme(ctx, 'm2'); await X().otterPatrol(ctx.map.el, ROUTE.map(([x, y])=> [x, y - 6])); }}]});
R({id:'amb-hummingbird-cliffs', stage:'map', inGameHook:'future', variants:[{key:'A', label:'Concept: hummingbirds flit between blossoms, totems glow in turn', play:async ctx=>{ theme(ctx, 'mc'); await X().hummingbirdCliffs(ctx.map.el); }}]});
})();
