// 2026-11-13 (package UIFX2, owner 00:03: "season changes when moving from certain maps etc."): the world feels like a journey.
// Every map has a season or a biome (MAP_SEASON). Moving to a map in another season changes the map screen with a short transition;
// moving between maps plays a travel beat (a lit route and paw prints walking in to where you stand, under 1.2 s, any tap or key
// skips it, it never takes the tap) that ends in the new place's season. While the map is open a light ambient layer keeps the
// season going: 8 to 14 small spans on CSS keyframes (transform and opacity only, no canvas, no timers), placed under the
// time-of-day tint so dawn, dusk and night grade it like the art. The season's vignette is the game's own .season-veil, re-classed
// from the calendar month to the place.
// Entry points (one hook line in arena_app.js, renderConquestSubTab, calls arrive() on every map render):
//   BramblewoodWorld.arrive(map, host, canvas)      the travel beat when the map changed (only while .travelBeat is on), else keep (or re-attach) the season
//   BramblewoodWorld.travel(fromMap, toMap, opts)   the beat, ending in toMap's season
//   BramblewoodWorld.setSeason(mapIdOrKind, opts)   vignette + ambient, and the transition when it differs from the one on show
//   BramblewoodWorld.seasonOf(mapId), .stop()
// Gates: Effects None: nothing runs (the game's CSS hides the vignette). Low or reduced motion: the vignette only, swapped at once.
// Medium: + the ambient (8 spans), transitions and the travel beat. High: 14 spans. A map with its own darkness (cave-dark) is 'deep'.
(function(root){
'use strict';
const KINDS = ['spring', 'summer', 'autumn', 'winter', 'desert', 'ash', 'coast', 'deep'];
// Season or biome per map, from each map's name, blurb and biome (docs/lore-bible.md has no seasons). Main maps by number, then side
// maps and dungeons. Long term this belongs on the map itself (CONQUEST_MAPS, next to MAP_BIOME_OF) or a canonical map file.
const MAP_SEASON = {
  m1:'spring',   // 0  Bramblewood Outskirts: the first tree-line, the road starts in spring
  mf:'spring',   // 1  Thistlewood: thistle, fern and hedgerows
  mb:'coast',    // 2  Pebble Beach
  mc:'coast',    // 3  Gannet Cliffs
  m2:'summer',   // 4  Sunken Hollow: a warm flooded lowland
  mw:'summer',   // 5  Gatorback Swamp: "a warm, green, very much alive swamp"
  m8:'autumn',   // 6  Sable Swampmire: the second, blacker wetland, rot and fallen leaves
  mu:'autumn',   // 7  The Morel Hollow: mushroom season under the old oaks
  m4:'deep',     // 8  Caves & Alcoves
  mk:'coast',    // 9  The Kelp Mangroves: salt water creeping in
  m7:'coast',    // 10 Coral Current: the open sea
  m10:'winter',  // 11 Eyrie Heights: the first snow on the high cliffs
  mh:'autumn',   // 12 The Briar Maze
  mr:'autumn',   // 13 The Redwood Deep: the red shade
  m5:'summer',   // 14 Savanna Reaches
  ml:'autumn',   // 15 The Long Grass: farm country at harvest
  mt:'winter',   // 16 The Pinewood Taiga: "on the edge of the snow"
  m6:'winter',   // 17 Wolfsbane Tundra
  md:'desert',   // 18 The Glass Dunes
  m3:'ash',      // 19 Ashen Spurn
  m11:'ash',     // 20 The Sundered Peak: the volcano's crown
  m21:'winter',  // 21 The Quiet Summit: above the clouds, thin still air
  m22:'winter',  // 22 The Rimefire Caldera: snow on black glass
  m23:'autumn',  // 23 The Goldfeather Siege: churned fields
  m24:'summer',  // 24 Goldfeather Keep: gilded, golden haze
  mtut:'spring', mo:'spring',   // Map 0's Tutorial and The Old Bramble
  mq:'spring',                  // Clovermead (Map 1)
  mp:'summer', mg:'deep',       // Lilypad Reach, Smugglers' Grotto (Map 2)
  ms:'summer',                  // The Sunken Grove (Map 5)
  mm:'deep',                    // Murgle Mayhem, dungeon (Map 6)
  mz:'deep',                    // The Mycelium Deep (Map 7)
  mn:'deep',                    // The Glimmer Depths (Map 8)
  mj:'deep',                    // The Sunken Depths, under water (Map 10)
  mv:'spring', muc:'deep',      // The Aerie Vault ("a thousand springs" of nests), The Undercroft dungeon (Map 11)
  my:'summer',                  // The Canopy, the rainforest roof (Map 14)
  mi:'deep',                    // The Ice Hollow, a cave (Map 17)
  mpd:'desert',                 // The Pale Desert (Map 18)
  m9:'ash',                     // Basalt Foundry (Map 19)
  me:'ash', mx:'ash',           // Eye of the Volcano, Volcano Lair (Map 20; the Lair is dark until cleared, so 'deep' while dark)
  mlb:'deep', tw:'deep',        // The Long Burrow (Map 22), the Tower
};
// A map missing above (new maps, admin maps) takes its biome's season, then its parent's.
const BIOME_SEASON = {meadow:'spring', forest:'autumn', beach:'coast', reef:'coast', water:'summer', swamp:'summer', savanna:'summer', tundra:'winter',
  alpine:'winter', frostfire:'winter', ash:'ash', forge:'ash', paledesert:'desert', cave:'deep', warfield:'autumn', castle:'summer'};
const BEAT_MS = 1150, FADE_MS = 950; // the travel beat (season change included) and a season change on its own

const doc = typeof document !== 'undefined' ? document : null;
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const maps = ()=>{ try{ return typeof CONQUEST_MAPS !== 'undefined' ? CONQUEST_MAPS : []; }catch(e){ return []; } };
const mapById = id=> maps().find(m=> m && m.id === id) || null;
function seasonOf(id){
  if(id && typeof id === 'object') id = id.id;
  if(!id) return 'spring';
  if(KINDS.includes(id)) return id;
  if(MAP_SEASON[id]) return MAP_SEASON[id];
  const m = mapById(id); if(m && m.endless) return 'deep';
  let b = null; try{ if(typeof MAP_BIOME_OF !== 'undefined') b = MAP_BIOME_OF[id]; }catch(e){}
  if(b && BIOME_SEASON[b]) return BIOME_SEASON[b];
  return m && m.parent && m.parent !== id ? seasonOf(m.parent) : 'spring';
}
const RM = ()=>{ try{ return typeof reducedMotion === 'function' ? reducedMotion() : !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
// 'off' (Effects None), 'calm' (Low or reduced motion: the vignette only), 'med', 'high'. The ambient reads the picked level (fxLevelShown);
// one-off moments read fxLevel, which is None for a moment after the tab comes back.
function mode(oneOff){
  if(!doc) return 'off';
  let l = 'high'; try{ l = oneOff || typeof fxLevelShown !== 'function' ? (typeof fxLevel === 'function' ? fxLevel() : 'high') : fxLevelShown(); }catch(e){}
  if(l === 'none') return 'off';
  return l === 'low' || RM() ? 'calm' : l === 'med' ? 'med' : 'high';
}

// ---- the ambient lanes: deterministic per kind, so a re-render picks every span up where it was ----
function rng(s){ let a = 0; for(let i = 0; i < s.length; i++) a = Math.imul(a ^ s.charCodeAt(i), 2654435761) >>> 0;
  return ()=>{ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, a)=> a[Math.floor(r() * a.length)];
const STEPS = [0, 8, 20, 32, 44, 56, 68, 80, 92, 100];
// falling (petal, leaf, flake, ash): dx drift and sw sway in vw, rot degrees, flips = how often it turns over (scaleX), op its opacity
const fall = (r, dx, sw, rot, flips, op)=>{ const ph = r() * 6.28, w = .8 + r() * .8;
  return STEPS.map(p=>{ const t = p / 100; return {p, x: dx * t + Math.sin(t * 6.28 * w + ph) * sw, y: -6 + t * 114, r: rot * t, sx: flips ? .25 + .75 * Math.abs(Math.cos(t * Math.PI * flips)) : 1, o: p === 0 || p === 100 ? 0 : op}; }); };
const GLINT = 'radial-gradient(circle, #fff 0 12%, rgba(255,255,255,.5) 22%, rgba(255,255,255,0) 40%), linear-gradient(90deg, rgba(255,255,255,0) 44%, #fff 50%, rgba(255,255,255,0) 56%), linear-gradient(0deg, rgba(255,255,255,0) 44%, #fff 50%, rgba(255,255,255,0) 56%)';
const LEAVES = ['#d9531e', '#e8901f', '#b8321a', '#f2b33a', '#9a4a16'], PETALS = ['#f9b8cf', '#f6a3c0', '#ffd0e0', '#fbe3ea'];
const LANES = {
  spring: (r)=>{ const w = 8 + r() * 6;
    return {css: `width:${w.toFixed(1)}px; height:${(w * .66).toFixed(1)}px; border-radius:80% 10% 80% 10%; background:linear-gradient(135deg, #fff4f8, ${pick(r, PETALS)});`, dur: 10 + r() * 5, frames: fall(r, 8 + r() * 14, 2 + r() * 3, (r() < .5 ? -1 : 1) * (300 + r() * 420), 2.2, .92)}; },
  autumn: (r)=>{ const w = 11 + r() * 6, c = pick(r, LEAVES);
    return {css: `width:${w.toFixed(1)}px; height:${(w * .6).toFixed(1)}px; border-radius:0 85% 0 85%; background:linear-gradient(135deg, ${c}, #6e3210 160%);`, dur: 8 + r() * 4, frames: fall(r, 10 + r() * 16, 3 + r() * 2, (r() < .5 ? -1 : 1) * (420 + r() * 480), 3, .9)}; },
  winter: (r)=>{ const s = 3 + r() * 4;
    return {css: `width:${s.toFixed(1)}px; height:${s.toFixed(1)}px; border-radius:50%; background:radial-gradient(circle, #fff 0 38%, rgba(255,255,255,0) 70%);`, dur: 17 - s * 1.1 + r() * 3, frames: fall(r, 2 + r() * 5, 1.5 + r() * 1.5, 0, 0, .6 + r() * .35)}; },
  ashFlake: (r)=>{ const s = 3 + r() * 2.5;
    return {css: `width:${s.toFixed(1)}px; height:${(s * .8).toFixed(1)}px; border-radius:40%; background:rgba(196,186,180,.85);`, dur: 14 + r() * 5, frames: fall(r, 3 + r() * 5, 2, 180 + r() * 200, 1.5, .55)}; },
  ember: (r)=>{ const s = 3 + r() * 2.5, rise = 62 + r() * 34, sw = 2 + r() * 2.5, ph = r() * 6.28, fl = [0, .95, .55, .95, .6, .9, .5, .85, .45, 0];
    return {css: `top:100%; width:${s.toFixed(1)}px; height:${s.toFixed(1)}px; border-radius:50%; background:radial-gradient(circle, #fff3c4 0 22%, #ff9a3a 42%, rgba(255,80,20,0) 70%);`, dur: 6 + r() * 4,
      frames: STEPS.map((p, j)=>{ const t = p / 100; return {p, x: Math.sin(t * 9 + ph) * sw + t * 2, y: -t * rise, r: 0, sx: 1, o: fl[j]}; })}; },
  haze: (r)=>({css: `left:-20%; top:${(30 + r() * 45).toFixed(0)}%; width:140%; height:${(16 + r() * 10).toFixed(0)}vh; background:radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,236,180,.34), rgba(255,236,180,0) 70%);`,
    dur: 15 + r() * 6, frames: [{p:0, x:0, y:0, o:0}, {p:50, x:-3, y:-9, o:.9, sy:1.15}, {p:100, x:0, y:-18, o:0}]}),
  mote: (r)=>{ const s = 2.5 + r() * 2, sw = 2 + r() * 3, ph = r() * 6.28;
    return {css: `top:${(40 + r() * 55).toFixed(0)}%; width:${s.toFixed(1)}px; height:${s.toFixed(1)}px; border-radius:50%; background:radial-gradient(circle, #fffbe0 0 35%, rgba(255,240,180,0) 70%);`, dur: 13 + r() * 6,
      frames: STEPS.map(p=>{ const t = p / 100; return {p, x: Math.sin(t * 6.28 + ph) * sw, y: -t * 26, o: p === 0 || p === 100 ? 0 : .75}; })}; },
  sandHaze: (r)=>({css: `left:-70%; top:${(28 + r() * 40).toFixed(0)}%; width:70%; height:32vh; background:radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,192,124,.30), rgba(232,192,124,0) 70%);`,
    dur: 10 + r() * 3, frames: [{p:0, x:0, y:0, o:0}, {p:20, x:30, y:1, o:.9}, {p:80, x:130, y:3, o:.9}, {p:100, x:165, y:4, o:0}]}),
  streak: (r)=>({css: `left:0; top:${(8 + r() * 84).toFixed(0)}%; width:${(50 + r() * 70).toFixed(0)}px; height:2.5px; border-radius:2px; background:linear-gradient(90deg, rgba(240,212,150,0), rgba(240,212,150,.9), rgba(240,212,150,0));`,
    dur: 5 + r() * 3, frames: [{p:0, x:-25, y:0, r:3, o:0}, {p:6, x:-14, y:.3, r:3, o:.85}, {p:34, x:100, y:2.5, r:3, o:.85}, {p:40, x:125, y:3, r:3, o:0}, {p:100, x:125, y:3, r:3, o:0}]}),
  spray: (r)=>{ const s = 2 + r() * 2.5, sw = 3 + r() * 4, ph = r() * 6.28, rise = 14 + r() * 16;
    return {css: `top:${(30 + r() * 65).toFixed(0)}%; width:${s.toFixed(1)}px; height:${s.toFixed(1)}px; border-radius:50%; background:radial-gradient(circle, #fff 0 35%, rgba(220,245,255,0) 70%);`, dur: 7 + r() * 5,
      frames: STEPS.map(p=>{ const t = p / 100; return {p, x: t * sw * 2 + Math.sin(t * 6.28 + ph) * 1.5, y: -t * rise, o: p === 0 || p === 100 ? 0 : .7}; })}; },
  glint: (r)=>({css: `top:${(12 + r() * 80).toFixed(0)}%; width:14px; height:14px; background:${GLINT};`,
    dur: 3 + r() * 3, frames: [{p:0, x:0, y:0, s:0, o:0}, {p:7, x:0, y:0, s:1, o:.95}, {p:15, x:0, y:0, s:0, o:0}, {p:100, x:0, y:0, s:0, o:0}]}),
};
// which lane makers a kind uses, the special ones first so a short layer keeps them
const RECIPE = {spring:['spring'], autumn:['autumn'], winter:['winter'], summer:['haze', 'haze', 'mote', 'mote', 'mote', 'mote', 'mote', 'mote', 'haze', 'mote'],
  desert:['sandHaze', 'streak'], ash:['ember', 'ember', 'ashFlake', 'ember', 'ember', 'ashFlake', 'ember', 'ember', 'ashFlake', 'ember', 'ember', 'ashFlake', 'ember', 'ember'], coast:['glint', 'spray', 'glint', 'spray', 'glint', 'spray', 'glint', 'spray', 'glint', 'spray', 'glint', 'spray', 'glint', 'spray'], deep:[]};
const MAX = 14;
const laneCache = {};
function lanes(kind){
  if(laneCache[kind]) return laneCache[kind];
  const rec = RECIPE[kind] || [], r = rng('bww-' + kind), out = [];
  for(let i = 0; rec.length && i < MAX; i++){ const L = LANES[rec[Math.min(i, rec.length - 1)]](r); if(!/left:/.test(L.css)) L.css = `left:${(r() * 100).toFixed(1)}%; ` + L.css; L.off = r() * L.dur; L.name = `bww-${kind}-${i}`; out.push(L); }
  return (laneCache[kind] = out);
}
const kfText = L=> `@keyframes ${L.name}{` + L.frames.map(f=>{ const s = f.s != null ? `scale(${f.s})` : `scale(${(f.sx == null ? 1 : f.sx).toFixed(2)},${(f.sy || 1).toFixed(2)})`;
  return `${f.p}%{transform:translate3d(${f.x.toFixed(1)}vw,${f.y.toFixed(1)}vh,0) rotate(${(f.r || 0).toFixed(0)}deg) ${s};opacity:${f.o}}`; }).join('') + '}';
// spans for a kind at a mode: Medium 8, High 14, half where the map already shows that weather (its shader, or FX.E's ambience)
function count(kind, m, halve){ if(!(RECIPE[kind] || []).length || (m !== 'med' && m !== 'high')) return 0; const n = m === 'high' ? MAX : 8; return halve ? Math.ceil(n / 2) : n; }

const CSS = `
.bww-amb{position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; border-radius:inherit; contain:strict; transition:opacity .8s ease;}
.bww-amb.is-out{opacity:0;}
.bww-amb > i{position:absolute; top:0; display:block; opacity:0; animation-timing-function:linear; animation-iteration-count:infinite;}
.bww-fx, .bww-road{position:absolute; z-index:2; pointer-events:none; overflow:hidden; contain:strict;}
.bww-fx > i{position:absolute; left:0; top:0; display:block;}
.bww-road svg{position:absolute; left:0; top:0; width:100%; height:100%; overflow:visible;}
.bww-road path{fill:none; stroke-linecap:round;} .bww-road .bww-reveal{stroke:#fff;} .bww-road .bww-shade{stroke:rgba(60,34,12,.14);} .bww-road .bww-halo{stroke:rgba(255,214,136,.34);} .bww-road .bww-dots0{stroke:rgba(110,62,16,.45);} .bww-road .bww-dots{stroke:#ffeab4;}
.bww-road .bww-print{fill:#fff3d8; stroke:rgba(60,35,15,.72); stroke-width:1.4;}
.bww-road .bww-vig{position:absolute; inset:0; display:block; background:radial-gradient(ellipse 78% 72% at 50% 55%, rgba(20,14,8,0) 45%, rgba(20,14,8,.34) 100%);}
#appWrap.in-match .bww-amb{display:none;}
html[data-fx="none"] .bww-amb, html[data-fx="none"] .bww-fx, html[data-fx="none"] .bww-road, html[data-fx="low"] .bww-amb{display:none;}
@media (prefers-reduced-motion: reduce){ .bww-amb, .bww-fx, .bww-road{display:none;} }
.season-veil.season-desert{background:radial-gradient(ellipse 80% 70% at 50% 35%, rgba(255,222,160,.10), rgba(255,222,160,0) 60%), radial-gradient(ellipse 75% 70% at 50% 50%, rgba(200,140,60,0) 55%, rgba(200,140,60,.26) 100%);}
.season-veil.season-ash{background:linear-gradient(0deg, rgba(255,96,36,.16), rgba(255,96,36,0) 34%), radial-gradient(ellipse 75% 70% at 50% 50%, rgba(80,28,18,0) 52%, rgba(80,28,18,.32) 100%);}
.season-veil.season-coast{background:radial-gradient(ellipse 75% 70% at 50% 50%, rgba(120,200,230,0) 56%, rgba(120,200,230,.24) 100%);}
.season-veil.season-deep{display:none;}
`;
let styleEl = null;
const kfDone = new Set();
function css(kind){
  if(!doc) return;
  if(!styleEl){ styleEl = doc.getElementById('bww-style'); if(!styleEl){ styleEl = doc.createElement('style'); styleEl.id = 'bww-style'; styleEl.textContent = CSS; (doc.head || doc.documentElement).appendChild(styleEl); } }
  if(kind && !kfDone.has(kind)){ kfDone.add(kind); styleEl.textContent += lanes(kind).map(kfText).join('\n') + '\n'; }
}

// ---- state ----
const S = {map: null, kind: null, amb: null, ambKind: null, ambN: 0, t0: 0, beat: null};
const now = ()=> (typeof performance !== 'undefined' ? performance.now() : Date.now());
function layoutEl(){ return doc && doc.getElementById('conquestLayout'); }
const canvasOf = host=> host && (host.querySelector('#conquestCanvas') || host.querySelector('.conquest-map-canvas'));
function isDark(canvas){ return !!(canvas && canvas.querySelector(':scope > .cave-dark')); }
// night and dusk dim the one-off layers that sit above the time-of-day tint (the ambient sits under it and is graded by it)
function todDim(host){ const t = host.querySelector(':scope > .fxe-tod'); return !t ? 1 : t.classList.contains('tod-night') ? .75 : t.classList.contains('tod-dusk') ? .9 : 1; }
// the map pane (not the map list) in the host's own CSS pixels: offsets, so a zoomed Effects Lab stage lines up too
function paneBox(host){ const m = host.querySelector(':scope > .conquest-main') || host; return m === host ? {left: 0, top: 0, width: host.clientWidth, height: host.clientHeight, el: m} : {left: m.offsetLeft, top: m.offsetTop, width: m.offsetWidth, height: m.offsetHeight, el: m}; }
function veilSet(host, k){
  const vs = host.querySelectorAll(':scope > .season-veil'); let v = vs[vs.length - 1];
  if(!v){ v = doc.createElement('div'); v.setAttribute('aria-hidden', 'true'); host.appendChild(v); }
  v.className = 'season-veil season-' + k; v.style.opacity = '';
  for(let i = 0; i < vs.length - 1; i++) vs[i].remove();
  return v;
}

// ---- the ambient layer ----
function halveFor(host, mapId, k){
  try{ if(host.querySelector(':scope > canvas.fxe-amb')) return true;
    const sk = host.querySelector(':scope > canvas.bw-shader-map') && typeof BramblewoodShaders !== 'undefined' ? BramblewoodShaders.MAP_KIND[mapId] : null;
    return (k === 'winter' && sk === 5) || (k === 'ash' && (sk === 2 || sk === 8 || sk === 10)) || (k === 'coast' && sk === 12); }catch(e){ return false; }
}
function placeAmb(host, el){
  const tod = host.querySelector(':scope > .fxe-tod'), before = tod || host.querySelector(':scope > .conquest-maps, :scope > .conquest-main');
  if(el.parentNode === host && el.nextSibling === before) return false;
  host.insertBefore(el, before || null); return true;
}
function phase(el){ const t = (now() - S.t0) / 1000, L = lanes(S.ambKind);
  [...el.children].forEach((c, i)=>{ const l = L[i]; if(l) c.style.animationDelay = (-((t + l.off) % l.dur)).toFixed(2) + 's'; }); }
function dropAmb(fade){
  const a = S.amb; S.amb = null; S.ambKind = null; S.ambN = 0; if(!a) return;
  if(fade && a.isConnected){ a.classList.add('is-out'); setTimeout(()=> a.remove(), 850); } else a.remove();
}
// Mount (or move into this frame) the ambient for kind k. Returns {el, fresh}.
function mountAmb(host, k, n, hidden){
  if(!n){ dropAmb(!!S.amb); return null; }
  if(S.amb && S.ambKind === k && S.ambN === n){ if(placeAmb(host, S.amb)) phase(S.amb); return {el: S.amb, fresh: false}; }
  dropAmb(true); css(k);
  const el = doc.createElement('div'); el.className = 'bww-amb bww-amb-' + k + (hidden ? ' is-out' : ''); el.setAttribute('aria-hidden', 'true');
  el.innerHTML = lanes(k).slice(0, n).map(l=> `<i style="${l.css} animation-name:${l.name}; animation-duration:${l.dur.toFixed(2)}s;"></i>`).join('');
  S.amb = el; S.ambKind = k; S.ambN = n; S.t0 = now();
  placeAmb(host, el); phase(el);
  return {el, fresh: true};
}

// ---- one-off beats: one at a time, any tap / key / wheel finishes it at once (and still goes through), a timer backs GSAP up ----
function finishBeat(){ const b = S.beat; if(!b) return; S.beat = null; b.off(); clearTimeout(b.timer); try{ b.tl.progress(1); }catch(e){} try{ b.tl.kill(); }catch(e){} }
function runBeat(tl){
  finishBeat();
  const skip = ()=> finishBeat(), evs = ['pointerdown', 'keydown', 'wheel'];
  evs.forEach(e=> doc.addEventListener(e, skip, {capture: true, passive: true}));
  const b = {tl, off: ()=> evs.forEach(e=> doc.removeEventListener(e, skip, {capture: true}))};
  b.timer = setTimeout(()=>{ if(S.beat === b) finishBeat(); }, Math.ceil(tl.duration() * 1000) + 400);
  tl.eventCallback('onComplete', ()=>{ if(S.beat === b){ S.beat = null; b.off(); clearTimeout(b.timer); } });
  S.beat = b;
}
const mk = (L, css2)=>{ const e = doc.createElement('i'); e.style.cssText = css2; L.appendChild(e); return e; };
// PERF5 (2026-11-13): GSAP reads a batch of new pieces in one pass: every transform first, then each opacity is copied inline (all reads, then all
// writes) and offsetParent is answered (they are always shown), so the tweens that follow read nothing from the page
function primeAll(els){ const g = G(); if(!g || !els.length) return;
  els.forEach(e=>{ try{ Object.defineProperty(e, 'offsetParent', {value: e.parentNode, configurable: true}); }catch(err){} try{ g.getProperty(e, 'x'); }catch(err){} });
  const op = els.map(e=>{ try{ return e.style.opacity ? null : getComputedStyle(e).opacity; }catch(err){ return null; } }); els.forEach((e, i)=>{ if(op[i] != null) e.style.opacity = op[i]; }); }
const rnd = (a, b)=> a + Math.random() * (b - a);
let uid = 0;
const from = dir=> dir === 'left' ? 1 : -1; // the side the season blows in from: travelling right, it comes in from the left edge

// The season change: the vignette crossfades, a wash of the new season's colour sweeps across from the side you came from, and the
// season's own flourish plays (petals on a gust, a sun flare and rising heat, leaves turning over, the first snow and a frost rim, a sand
// gust, embers off a glowing ground, a tide wave washing up, darkness closing in). Added to tl at `at`, about T seconds long.
const WASH = {spring:'rgba(176,232,150,.30)', summer:'rgba(255,226,150,.32)', autumn:'rgba(236,146,58,.30)', winter:'rgba(236,246,255,.36)', desert:'rgba(232,196,130,.36)', ash:'rgba(255,112,52,.26)', coast:'rgba(196,238,250,.34)', deep:'rgba(8,10,18,.5)'};
function flourish(tl, L, k, W, H, dir, at, T, lite){
  const n = lite ? 10 : 16, sd = from(dir);
  // the wash: a soft band of the season's colour crossing the pane (rising from the bottom for ash, the tide and side maps)
  const up = k === 'ash' || k === 'coast' || dir === 'up';
  const wash = mk(L, up ? `width:${W}px; height:${H * 1.6}px; background:linear-gradient(0deg, rgba(0,0,0,0), ${WASH[k]} 30%, ${WASH[k]} 55%, rgba(0,0,0,0));`
    : `width:${W * 1.1}px; height:${H}px; background:linear-gradient(90deg, rgba(0,0,0,0), ${WASH[k]} 35%, ${WASH[k]} 60%, rgba(0,0,0,0));`);
  if(k === 'deep'){ wash.style.cssText = `width:${W}px; height:${H}px; background:radial-gradient(ellipse 70% 65% at 50% 50%, rgba(5,8,15,0) 20%, rgba(5,8,15,.85) 80%);`;
    tl.fromTo(wash, {opacity: 0}, {opacity: 1, duration: T * .38, ease: 'power2.in'}, at).to(wash, {opacity: 0, duration: T * .5, ease: 'sine.out'}, at + T * .45); return; }
  if(up) tl.fromTo(wash, {y: H, opacity: .9}, {y: -H * 1.6, duration: T, ease: 'sine.inOut'}, at);
  else tl.fromTo(wash, {x: sd < 0 ? -W * 1.1 : W, opacity: .9}, {x: sd < 0 ? W : -W * 1.1, duration: T, ease: 'sine.inOut'}, at);
  const glow = (bg, peak)=>{ const e = mk(L, `width:${W}px; height:${H}px; background:${bg};`); tl.fromTo(e, {opacity: 0}, {opacity: peak, duration: T * .4, ease: 'sine.out'}, at + T * .1).to(e, {opacity: 0, duration: T * .45, ease: 'sine.in'}, at + T * .55); return e; };
  const gust = (shape, cols, spin, sink, leaf)=>{ for(let i = 0; i < n; i++){ const w = rnd(leaf ? 14 : 12, leaf ? 21 : 17), c = cols[i % cols.length];
    const e = mk(L, `width:${w}px; height:${w * .62}px; ${shape} background:${leaf ? `linear-gradient(135deg, ${c} 0 47%, rgba(90,36,10,.55) 49%, ${c} 52%)` : `radial-gradient(circle at 34% 34%, #fff 0 16%, rgba(255,255,255,0) 42%), linear-gradient(135deg, #ffe6ef, ${c})`};`);
    const y0 = rnd(.05, .85) * H, x1 = sd < 0 ? rnd(.25, 1.05) * W : rnd(-.05, .75) * W, d = T * rnd(.7, .95), t0 = at + rnd(0, T - d);
    tl.fromTo(e, {x: sd < 0 ? -20 : W + 20, y: y0, rotation: rnd(0, 360), scaleX: 1, opacity: 0}, {x: x1, y: y0 + rnd(30, sink), rotation: '+=' + (sd < 0 ? 1 : -1) * rnd(200, spin), duration: d, ease: 'power1.out'}, t0)
      .to(e, {opacity: 1, duration: d * .18}, t0).to(e, {scaleX: .25, duration: d / 5, repeat: 3, yoyo: true, ease: 'sine.inOut'}, t0).to(e, {opacity: 0, duration: d * .3}, t0 + d * .7); } };
  if(k === 'spring'){ glow('radial-gradient(ellipse 85% 55% at 50% 100%, rgba(150,222,110,.42), rgba(150,222,110,0) 70%)', .8); gust('border-radius:80% 10% 80% 10%;', PETALS, 520, 140); }
  else if(k === 'autumn'){ glow(`radial-gradient(ellipse 90% 70% at ${sd < 0 ? 15 : 85}% 40%, rgba(232,132,44,.26), rgba(232,132,44,0) 70%)`, .8); gust('border-radius:0 85% 0 85%;', LEAVES, 780, 200, true); }
  else if(k === 'summer'){ const f = mk(L, `width:${W}px; height:${H}px; background:radial-gradient(ellipse 70% 60% at ${sd < 0 ? 18 : 82}% 0%, rgba(255,244,196,.62), rgba(255,226,150,.16) 45%, rgba(255,226,150,0) 72%);`);
    tl.fromTo(f, {opacity: 0, scale: .9}, {opacity: 1, scale: 1.05, duration: T * .45, ease: 'sine.out'}, at).to(f, {opacity: 0, duration: T * .45, ease: 'sine.in'}, at + T * .55);
    for(let i = 0; i < 3; i++){ const b = mk(L, `left:-10%; width:120%; height:${H * .14}px; background:radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,236,180,.42), rgba(255,236,180,0) 70%);`);
      tl.fromTo(b, {y: H * (.75 + i * .08), opacity: 0}, {y: H * (.25 + i * .1), duration: T * .8, ease: 'sine.out'}, at + i * T * .08).to(b, {opacity: 1, duration: T * .3}, at + i * T * .08).to(b, {opacity: 0, duration: T * .35}, at + T * .6); } }
  else if(k === 'winter'){ const rim = glow('radial-gradient(ellipse 72% 68% at 50% 50%, rgba(232,244,255,0) 48%, rgba(232,244,255,.62) 100%)', 1); tl.fromTo(rim, {scale: 1.2}, {scale: 1, duration: T * .8, ease: 'power2.out'}, at);
    for(let i = 0; i < n + 8; i++){ const s = rnd(4, 9), e = mk(L, `width:${s}px; height:${s}px; border-radius:50%; background:radial-gradient(circle, #fff 0 40%, rgba(255,255,255,0) 72%);`), d = T * rnd(.6, .95), t0 = at + rnd(0, T - d), x0 = rnd(0, W);
      tl.fromTo(e, {x: x0, y: -10, opacity: 0}, {x: x0 + rnd(-20, 30), y: rnd(.35, .9) * H, duration: d, ease: 'power1.in'}, t0).to(e, {opacity: .95, duration: d * .2}, t0).to(e, {opacity: 0, duration: d * .3}, t0 + d * .7); } }
  else if(k === 'desert'){ glow(`linear-gradient(${sd < 0 ? 90 : 270}deg, rgba(232,196,130,0), rgba(232,196,130,.3) 50%, rgba(232,196,130,0))`, .8);
    for(let i = 0; i < n + 4; i++){ const w = rnd(70, 170), e = mk(L, `width:${w}px; height:3px; border-radius:2px; background:linear-gradient(90deg, rgba(240,212,150,0), rgba(246,220,160,.95), rgba(240,212,150,0));`), d = T * rnd(.35, .6), t0 = at + rnd(0, T - d), y = rnd(.05, .95) * H;
      tl.fromTo(e, {x: sd < 0 ? -w : W, y, rotation: sd < 0 ? 3 : -3, opacity: .9}, {x: sd < 0 ? W : -w, y: y + 14, duration: d, ease: 'none'}, t0); } }
  else if(k === 'ash'){ glow('linear-gradient(0deg, rgba(255,100,36,.5), rgba(255,100,36,0) 48%)', .9);
    for(let i = 0; i < n + 4; i++){ const s = rnd(4, 8), e = mk(L, `width:${s}px; height:${s}px; border-radius:50%; background:radial-gradient(circle, #fff3c4 0 22%, #ff9a3a 42%, rgba(255,80,20,0) 70%);`), d = T * rnd(.6, .95), t0 = at + rnd(0, T - d), x0 = rnd(0, W);
      tl.fromTo(e, {x: x0, y: H + 6, opacity: 0}, {x: x0 + rnd(-30, 30), y: rnd(.15, .6) * H, duration: d, ease: 'power1.out'}, t0).to(e, {opacity: 1, duration: d * .15}, t0).to(e, {opacity: 0, duration: d * .35}, t0 + d * .65); } }
  else if(k === 'coast'){ // the tide: a foam crest washes up the pane, glints flash on it, and it slides back down to its line
    const c = mk(L, `width:${W * 1.1}px; height:${H * .5}px; left:${-W * .05}px; background:radial-gradient(14px 8px at 50% 100%, rgba(255,255,255,.95) 62%, rgba(255,255,255,0) 68%) 0 0 / 28px 9px repeat-x, linear-gradient(180deg, rgba(255,255,255,0) 8px, rgba(255,255,255,.75) 9px, rgba(205,242,250,.36) 22px, rgba(150,215,235,.12) 22%, rgba(150,215,235,0) 42%);`);
    tl.fromTo(c, {y: H, opacity: .95}, {y: H * .52, duration: T * .45, ease: 'sine.out'}, at).to(c, {y: H * 1.02, opacity: 0, duration: T * .5, ease: 'sine.in'}, at + T * .5);
    for(let i = 0; i < n - 4; i++){ const e = mk(L, `width:18px; height:18px; background:${GLINT};`), t0 = at + T * rnd(.3, .6);
      tl.fromTo(e, {x: rnd(0, W), y: H * rnd(.55, .9), scale: 0, opacity: 0}, {scale: 1.3, opacity: 1, rotation: 20, duration: T * .12, ease: 'back.out(3)'}, t0).to(e, {scale: 0, opacity: 0, duration: T * .2}, t0 + T * .14); } }
}
// Adds the season change (vignette crossfade + wash + flourish) to tl; the frame's vignette starts as the season `was`. Returns tl.
function change(tl, host, was, k, dir, at, T){
  const box = paneBox(host), L = doc.createElement('div');
  L.className = 'bww-fx bww-fx-' + k; L.setAttribute('aria-hidden', 'true'); L.style.cssText = `left:${box.left}px; top:${box.top}px; width:${box.width}px; height:${box.height}px; opacity:${todDim(host)};`;
  host.appendChild(L);
  // 2026-11-13 (package PERF5, tonight's UIFX2 re-measured): the flourish's tweens are noted first and added once every piece is in and read (primeAll):
  // each piece's fromTo read its styles and offsetParent right after the last piece's write, a forced style and layout pass a piece (5-26 a change)
  const q = [], rec = {fromTo: (...a)=>{ q.push(['fromTo', a]); return rec; }, to: (...a)=>{ q.push(['to', a]); return rec; }};
  flourish(rec, L, k, box.width, box.height, dir, at, T, mode(true) !== 'high');
  primeAll([...L.children]); q.forEach(([m, a])=> tl[m](...a));
  const old = [...host.querySelectorAll(':scope > .season-veil')], nv = doc.createElement('div');
  old.forEach(v=>{ v.className = 'season-veil season-' + was; });
  nv.className = 'season-veil season-' + k; nv.setAttribute('aria-hidden', 'true'); nv.style.opacity = '0'; host.appendChild(nv);
  tl.to(nv, {opacity: 1, duration: T * .8, ease: 'sine.inOut', onComplete: ()=>{ nv.style.opacity = ''; }}, at + T * .1);
  if(old.length) tl.to(old, {opacity: 0, duration: T * .8, ease: 'sine.inOut', onComplete: ()=> old.forEach(v=> v.remove())}, at + T * .1);
  tl.call(()=> L.remove(), null, at + T);
  return tl;
}

// The travel beat: the pane dims at its edges, a soft lit route draws in from the side you travel from to where your pawn stands, and
// seven paw prints walk along it (three quiet steps), then it all fades. ~1.15 s. Added to tl at 0.
function road(tl, host, canvas, dir){
  const box = paneBox(host), W = box.width, H = box.height; if(!(W > 40 && H > 40)) return false;
  const R = doc.createElement('div'); R.className = 'bww-road'; R.setAttribute('aria-hidden', 'true');
  R.style.cssText = `left:${box.left}px; top:${box.top}px; width:${W}px; height:${H}px; opacity:${Math.max(.88, todDim(host))};`; // a lit route reads at night too
  let end = {x: W * .5, y: H * .62};
  try{ const p = canvas && canvas.querySelector(':scope > .map-pawn:not(.map-foe)'), lx = p && parseFloat(p.style.left), ly = p && parseFloat(p.style.top);
    if(isFinite(lx) && isFinite(ly)){ const m = box.el; end = {x: canvas.offsetLeft + lx / 100 * canvas.offsetWidth - (m.scrollLeft || 0), y: canvas.offsetTop + ly / 100 * canvas.offsetHeight - (m.scrollTop || 0)}; } }catch(e){}
  end = {x: Math.max(W * .06, Math.min(W * .94, end.x)), y: Math.max(H * .08, Math.min(H * .9, end.y))};
  // in from the side you travel from, a quarter of the pane above or below the pawn; from the bottom when the pawn stands at that side
  const sy = Math.max(H * .3, Math.min(H * .9, end.y < H * .55 ? end.y + H * .3 : end.y - H * .3));
  const st = dir === 'up' || (dir === 'left' ? end.x > W * .72 : end.x < W * .28) ? {x: Math.max(W * .1, Math.min(W * .9, end.x + (dir === 'left' ? -1 : 1) * W * .22)), y: H + 14}
    : dir === 'left' ? {x: W + 14, y: sy} : {x: -14, y: sy};
  const dx = end.x - st.x, dy = end.y - st.y, L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0, bend = Math.min(L0 * .2, H * .14);
  const c1 = {x: st.x + dx * .3 + nx * bend, y: st.y + dy * .3 + ny * bend}, c2 = {x: st.x + dx * .7 - nx * bend * .8, y: st.y + dy * .7 - ny * bend * .8};
  const f = v=> v.toFixed(1), sz = Math.max(13, Math.min(22, Math.min(W, H) / 26)), id = 'bwwm' + (++uid);
  const d = `M${f(st.x)} ${f(st.y)} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(end.x)} ${f(end.y)}`;
  R.innerHTML = `<i class="bww-vig"></i><svg viewBox="0 0 ${f(W)} ${f(H)}" preserveAspectRatio="none"><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="${f(W + 80)}" height="${f(H + 80)}">`
    + `<path class="bww-reveal" stroke-width="${f(sz * 2.6)}" d="${d}"/></mask></defs><g class="bww-lit" mask="url(#${id})">` + [['bww-shade', 1.9], ['bww-halo', 1.5]].map(([c, k])=> `<path class="${c}" stroke-width="${f(sz * k)}" d="${d}"/>`).join('')
    + [['bww-dots0', .44], ['bww-dots', .28]].map(([c, k])=> `<path class="${c}" stroke-width="${f(sz * k)}" stroke-dasharray="0.1 ${f(sz * .9)}" d="${d}"/>`).join('') + '</g><g></g></svg>';
  host.appendChild(R);
  const reveal = R.querySelector('.bww-reveal'), lit = R.querySelector('.bww-lit'), grp = R.querySelector('svg > g:last-child'), vig = R.querySelector('.bww-vig');
  let len = 0; try{ len = reveal.getTotalLength(); }catch(e){}
  if(!(len > 0)) len = Math.hypot(dx, dy);
  reveal.style.strokeDasharray = f(len); reveal.style.strokeDashoffset = f(len);
  const prints = [];
  for(let i = 0; i < 7; i++){
    const t = (i + 1) / 8, side = i % 2 ? 1 : -1;
    let p = {x: st.x + dx * t, y: st.y + dy * t}, q = {x: p.x + dx, y: p.y + dy};
    try{ p = reveal.getPointAtLength(len * t); q = reveal.getPointAtLength(Math.min(len, len * t + 2)); }catch(e){}
    const a = Math.atan2(q.y - p.y, q.x - p.x), ox = -Math.sin(a) * sz * .42 * side, oy = Math.cos(a) * sz * .42 * side;
    const outer = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    outer.setAttribute('transform', `translate(${f(p.x + ox)} ${f(p.y + oy)}) rotate(${(a * 180 / Math.PI).toFixed(0)})`);
    outer.innerHTML = `<g class="bww-pp"><ellipse class="bww-print" cx="0" cy="0" rx="${f(sz * .34)}" ry="${f(sz * .29)}"/>` + [-.3, -.1, .1, .3].map(o=> `<circle class="bww-print" cx="${f(sz * (.42 - Math.abs(o) * .25))}" cy="${f(sz * o * 1.15)}" r="${f(sz * .11)}"/>`).join('') + '</g>';
    grp.appendChild(outer); prints.push(outer.firstChild);
  }
  const step = ()=>{ try{ if(typeof SoundKit !== 'undefined' && SoundKit.pawnStep) SoundKit.pawnStep(); }catch(e){} };
  tl.fromTo(vig, {opacity: 0}, {opacity: 1, duration: .15}, 0)
    .to(reveal, {strokeDashoffset: 0, duration: .65, ease: 'power1.inOut'}, 0);
  primeAll(prints); // PERF5: the seven prints read together
  prints.forEach((pp, i)=>{ tl.fromTo(pp, {scale: .3, opacity: 0, transformOrigin: '50% 50%'}, {scale: 1, opacity: 1, duration: .16, ease: 'back.out(2.5)'}, .08 + i * .085); if(i % 2) tl.call(step, null, .08 + i * .085); });
  tl.to(prints, {opacity: 0, duration: .25, stagger: .03}, .72).to([lit, vig], {opacity: 0, duration: .3}, .85).call(()=> R.remove(), null, BEAT_MS / 1000);
  return true;
}

// Where the trip goes: a side map and its parent zoom (no route drawn); other moves walk the road, right when the map comes later.
function route(a, b){
  const A = mapById(a), B = mapById(b), all = maps();
  if(A && B && (B.parent === A.id || A.parent === B.id || (A.sub && B.sub && A.parent === B.parent))) return {kind: 'zoom', dir: 'up'};
  const at = m=> m ? all.indexOf(m.sub && mapById(m.parent) || m) : -1, ia = at(A), ib = at(B);
  return {kind: 'road', dir: ia >= 0 && ib >= 0 && ib < ia ? 'left' : 'right'};
}
const titleDue = ()=>{ try{ return typeof mapTitleHoldUntil !== 'undefined' && mapTitleHoldUntil > Date.now(); }catch(e){ return false; } };

// ---- public ----
// The season for a map (or a kind): vignette, ambient, and the change when it differs from the one on show.
// opts: host, canvas, instant (no transition), dir, tl + at (nest the change in a travel beat), T (seconds).
function setSeason(id, o){
  o = o || {}; const host = o.host || layoutEl(); if(!host || !doc) return null;
  css();
  const canvas = o.canvas || canvasOf(host), mapId = typeof id === 'object' && id ? id.id : id;
  const k = isDark(canvas) ? 'deep' : seasonOf(mapId), was = S.kind, m = mode();
  S.kind = k;
  const changing = !!was && was !== k && !o.instant && mode(true) !== 'off' && m !== 'calm' && m !== 'off' && !!G();
  if(!changing) veilSet(host, k);
  const amb = mountAmb(host, k, count(k, m, halveFor(host, mapId, k)), changing);
  if(!changing) return k;
  const own = !o.tl, tl = o.tl || G().timeline(), at = o.at || 0, T = o.T || FADE_MS / 1000;
  change(tl, host, was, k, o.dir || 'right', at, T);
  if(amb && amb.fresh) tl.call(()=> amb.el.classList.remove('is-out'), null, at + T * .45);
  if(own) runBeat(tl);
  return k;
}
// The travel beat from one map to another, ending in the new map's season.
function travel(a, b, o){
  o = o || {}; const host = o.host || layoutEl(); if(!host || !doc) return null;
  const A = a && typeof a === 'object' ? a.id : a, B = b && typeof b === 'object' ? b.id : b;
  const canvas = o.canvas || canvasOf(host), m = mode(true);
  if(m === 'off' || m === 'calm' || !G()) return setSeason(B, Object.assign({}, o, {host, canvas, instant: true}));
  finishBeat(); css();
  const plan = o.plan || route(A, B), tl = G().timeline(); // o.plan: {kind:'road'|'zoom', dir} (the Effects Lab has no map list to read)
  const walked = plan.kind === 'road' && !titleDue() && road(tl, host, canvas, plan.dir);
  const k = setSeason(B, Object.assign({}, o, {host, canvas, dir: plan.dir, tl, at: walked ? .2 : 0, T: walked ? (BEAT_MS / 1000 - .2) : FADE_MS / 1000}));
  if(tl.duration() > 0) runBeat(tl); else tl.kill();
  return k;
}
// Called on every render of a map (renderConquestSubTab). A new map travels from the last one, unless the map's loading card or the
// Outskirts' opening (body.cq-opening) is showing: the season is simply there underneath. The same map keeps its season in the new frame.
function arrive(map, host, canvas){
  const id = map && typeof map === 'object' ? map.id : map; host = host || layoutEl(); if(!id || !host || !doc) return null;
  const prev = S.map; S.map = id;
  const moved = prev && prev !== id && !host.querySelector(':scope > .map-veil') && !doc.body.classList.contains('cq-opening');
  if(moved && root.BramblewoodWorld.travelBeat) return travel(prev, id, {host, canvas});
  return setSeason(id, {host, canvas, instant: !moved});
}
function stop(){ finishBeat(); dropAmb(false); S.kind = null; S.map = null; }

// 2026-11-13 (package UI51, owner 11:08): travelBeat off for now: a map change only crossfades the season; the Effects Lab still calls travel().
root.BramblewoodWorld = {arrive, travel, setSeason, seasonOf, stop, travelBeat: false, KINDS, MAP_SEASON, BIOME_SEASON, BEAT_MS, FADE_MS,
  _lanes: lanes, _kf: kfText, _css: ()=> CSS, _count: count, _route: route, _mode: mode, _state: S};
if(typeof module !== 'undefined' && module.exports) module.exports = root.BramblewoodWorld;
})(typeof window !== 'undefined' ? window : globalThis);
