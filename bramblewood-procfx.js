// Procedural FX (2026-10-14, user: "More vfx, more gsap (advanced use cases - be exploratory), cellular automaton
// used as a base or drunken miner to show structural damage? e.g. or card treatment. Card treatment for 'cards of old'.")
// Shared by the game and the Effects Lab, like bramblewood-skillfx.js. Everything is seeded, so the same card or
// castle always cracks, crumbles and ages the same way. GSAP drives the motion; without it (or with reduced motion)
// each effect jumps to its end state and still fires its callbacks.
//
//   ProcFX.cracks(el, {seed, stage:0..3, from:{x,y}, grow, jolt, duration})  drunken-miner stone fractures
//   ProcFX.clearCracks(el)                       ProcFX.castleDamage(el, hpFraction, {seed, grow})
//   ProcFX.crumble(el, {seed, duration, from, onDone, restore})              cellular-automaton erosion into debris
//   ProcFX.oldCardTexture(seed, w, h, layer)     ProcFX.decorateOld(root)    ProcFX.observeOld(root) -> stop()
//   ProcFX.shatter(el, {from, seed, power, onDone, restore})                 Voronoi shards, distributed blast
//   ProcFX.flipShuffle(container, {rounds, onDone})                          Flip riffle reorder
//   ProcFX.lantern(host, {cards, radius}) -> {destroy}                       quickTo light follower
//   ProcFX.forge(el) -> {tl, destroy}                                        labelled, scrubbable timeline
//   ProcFX.ripple(cards, {from, onDone})                                     distributed grid wave from a card
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const reduce = ()=> !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const tileOf = el=> (el && el.classList && el.classList.contains('card-tile')) ? el : ((el && el.querySelector && el.querySelector('.card-tile')) || el);
const call = (fn, ...a)=>{ if(fn) try{ fn(...a); }catch(e){} };
const later = (fn, ms)=>{ const run = ()=> call(fn); const g = G(); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };
const clamp = (v, a, b)=> v < a ? a : v > b ? b : v;
const dprOf = ()=> Math.min(2.5, window.devicePixelRatio || 1);

// ---- seeded randomness --------------------------------------------------------------------------
function hashSeed(s){ s = String(s == null ? 'bramble' : s); let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ let a = hashSeed(seed); return ()=>{ a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = r=> (r() + r() + r() - 1.5) * 1.15;
const seedOf = t=> (t && t.dataset && (t.dataset.pfxSeed || t.dataset.uid || t.dataset.defid)) || 'card';
// Smooth value noise on a seeded lattice (for paper blotches, uneven fading, edge wear).
function noise2(r, cells){
  const v = new Float32Array(cells*cells); for(let i = 0; i < v.length; i++) v[i] = r();
  const s = t=> t*t*(3 - 2*t), m = i=> ((i % cells) + cells) % cells;   // periodic, so any coordinate range works
  return (x, y)=>{ x *= cells; y *= cells; const xf = Math.floor(x), yf = Math.floor(y), fx = s(x - xf), fy = s(y - yf);
    const i0 = m(xf), j0 = m(yf), i1 = m(xf + 1), j1 = m(yf + 1);
    const a = v[j0*cells + i0], b = v[j0*cells + i1], c = v[j1*cells + i0], d = v[j1*cells + i1];
    return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy; };
}

// ---- CSS (injected once) ------------------------------------------------------------------------
const CSS = `
.pfx-cracks{position:absolute; inset:0; width:100%; height:100%; z-index:2; pointer-events:none; border-radius:inherit;}
.pfx-rim{position:absolute; inset:0; width:100%; height:100%; z-index:2; pointer-events:none;}
.pfx-fixed{position:fixed; left:0; top:0; pointer-events:none; z-index:9990; will-change:transform;}
.pfx-chip{box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);}
.pfx-dust{width:26px; height:26px; border-radius:50%; background:radial-gradient(circle, rgba(196,178,148,.85), rgba(196,178,148,0) 70%); filter:blur(1px);}
.pfx-grit{width:3px; height:3px; border-radius:1px; background:#6b5a46;}
.pfx-flash{border-radius:50%; background:radial-gradient(circle, rgba(255,255,250,.95), rgba(255,240,200,.5) 30%, rgba(255,220,160,0) 70%);}
.pfx-fracture{overflow:visible;} .pfx-fracture path{fill:none; stroke:#fffbe8; stroke-width:1.6; stroke-linejoin:round; filter:drop-shadow(0 0 3px rgba(255,236,170,.95));}
.pfx-shard{margin:0 !important; backface-visibility:visible;}
/* Cards of old: aged paper, foxing and stains (multiply), wear, creases and fading (normal), a soft warm sheen. */
.card-tile.holo-old .ico{filter:sepia(.62) saturate(.68) contrast(.9) brightness(1.04);}
.card-tile.holo-old{border-color:rgba(122,92,52,.7) !important;}
.card-tile.holo-old .costbadge, .card-tile.holo-old .waitbadge, .card-tile.holo-old .badges, .card-tile.holo-old .atk, .card-tile.holo-old .hp{filter:sepia(.4) saturate(.75);}
.card-tile.holo-old > .pfx-old{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:2; background:var(--pfx-stain) center/100% 100% no-repeat; mix-blend-mode:multiply;}
.card-tile.holo-old > .pfx-old::before{content:''; position:absolute; inset:0; border-radius:inherit; opacity:.38;
  background:radial-gradient(circle, rgba(92,58,26,.55) 0 .55px, transparent 1px) 0 0/3px 3px, radial-gradient(circle, rgba(30,70,110,.35) 0 .5px, transparent .9px) 1px 1.5px/3px 3px;}
.card-tile.holo-old > .pfx-old-wear{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:2; background:var(--pfx-wear) center/100% 100% no-repeat;}
.card-tile.holo-old .holo-layer{background-image:radial-gradient(ellipse 70% 55% at var(--hx) var(--hy), rgba(255,236,196,.7), rgba(255,236,196,0) 70%), linear-gradient(115deg, rgba(255,250,230,0) 35%, rgba(255,246,220,.45) 48%, rgba(255,250,230,0) 60%);
  background-size:100% 100%, 300% 300%; background-position:center, var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.55; filter:none; -webkit-mask-image:none; mask-image:none;}
.card-tile.holo-old .holo-glare{z-index:8; background:radial-gradient(circle at var(--hx) var(--hy), rgba(255,244,214,.35) 0%, rgba(255,244,214,.08) 25%, transparent 50%);}
.pfx-lantern{position:absolute; inset:0; z-index:20; pointer-events:none; border-radius:inherit; background:rgba(8,6,16,.84);
  -webkit-mask-image:radial-gradient(circle calc(var(--lr) * 1px) at calc(var(--lx) * 1px) calc(var(--ly) * 1px), transparent 0, rgba(0,0,0,.25) 40%, rgba(0,0,0,.7) 75%, #000 100%);
          mask-image:radial-gradient(circle calc(var(--lr) * 1px) at calc(var(--lx) * 1px) calc(var(--ly) * 1px), transparent 0, rgba(0,0,0,.25) 40%, rgba(0,0,0,.7) 75%, #000 100%);}
.pfx-lantern-glow{position:absolute; inset:0; z-index:19; pointer-events:none; border-radius:inherit; mix-blend-mode:screen;
  background:radial-gradient(circle calc(var(--lr) * .9px) at calc(var(--lx) * 1px) calc(var(--ly) * 1px), rgba(255,190,90,.38), rgba(255,150,60,.12) 50%, rgba(255,140,60,0) 100%);}
.pfx-lantern-flame{position:absolute; left:0; top:0; z-index:21; pointer-events:none; width:14px; height:20px; margin:-14px 0 0 -7px; border-radius:50% 50% 45% 45% / 65% 65% 35% 35%;
  background:radial-gradient(ellipse at 50% 75%, #fff6c8 0, #ffc04a 40%, #f0661c 70%, rgba(200,60,10,0) 82%); filter:blur(.4px) drop-shadow(0 0 8px rgba(255,170,60,.95));}
.pfx-forge-glow{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:8; mix-blend-mode:screen; opacity:0;
  background:radial-gradient(ellipse at 50% 60%, rgba(255,220,140,.95), rgba(255,110,30,.7) 45%, rgba(170,20,0,.35) 80%);}
.pfx-forge-cool{background:radial-gradient(ellipse at 50% 60%, rgba(200,235,255,.8), rgba(90,160,255,.5) 50%, rgba(40,80,200,.3) 85%);}
.pfx-forge-flash{position:absolute; inset:-10%; border-radius:50%; pointer-events:none; z-index:9; opacity:0; background:radial-gradient(circle, rgba(255,255,240,.95), rgba(255,220,150,0) 65%);}
.pfx-forge-shine{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none; z-index:9;}
.pfx-forge-shine i{position:absolute; top:-30%; bottom:-30%; width:34%; left:-50%; transform:skewX(-20deg); background:linear-gradient(90deg, transparent, rgba(255,246,200,.9), transparent);}
.pfx-forge-fx{position:absolute; left:0; top:0; width:0; height:0; z-index:10; pointer-events:none; overflow:visible;}
.pfx-spark{position:absolute; width:4px; height:4px; margin:-2px; border-radius:50%; background:#fff4b0; box-shadow:0 0 6px 2px rgba(255,170,50,.95); opacity:0;}
.pfx-steam{position:absolute; width:34px; height:34px; margin:-17px; border-radius:50%; background:radial-gradient(circle, rgba(236,240,246,.85), rgba(236,240,246,0) 70%); filter:blur(2px); opacity:0;}
.pfx-hammer{position:absolute; font-size:30px; line-height:1; opacity:0; transform-origin:85% 85%; filter:drop-shadow(0 3px 2px rgba(0,0,0,.5));}
@media (prefers-reduced-motion: reduce){ .pfx-lantern-flame{filter:none;} }
`;
function css(){
  if(document.getElementById('procfx-css')) return;
  const s = document.createElement('style'); s.id = 'procfx-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
}
css();
const fixed = (cls)=>{ const e = document.createElement('div'); e.className = 'pfx-fixed ' + cls; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; };

// =================================================================================================
// 1. Drunken-miner cracks
// Each crack is dug by a "miner": a random walk with momentum (its turn rate itself random-walks, with the odd
// sharp kink, so it zig-zags like stone rather than wandering like a river). Miners taper as they go and now and
// then split off a thinner miner at an angle. Points live in a unit box (x 0..1, y 0..aspect) so the walk is
// isotropic; they are mapped to the tile when drawn.
// =================================================================================================
const STAGE_IMPACTS = [null, {x:.3, y:.22}, {x:.72, y:.5}, {x:.42, y:.74}];
function genStage(seed, k, from, asp){
  const r = rng(seed + ':crack:' + k);
  const base = from || STAGE_IMPACTS[k];
  const ix = clamp(from ? base.x : base.x + (r() - .5)*.22, .04, .96), iy = clamp(from ? base.y : base.y + (r() - .5)*.18, .04, .96)*asp;
  const lines = [], chips = [];
  const budget = {n:4 + k*2};
  function mine(x, y, ang, width, depth, s0, steps){
    const pts = [{x, y, w:width}]; let a = ang, turn = 0; const step = .04 + r()*.02; const kids = [];
    for(let i = 0; i < steps; i++){
      turn = turn*.5 + gauss(r)*.1;
      let kink = 0; if(r() < .3) kink = (r() < .5 ? -1 : 1)*(.3 + r()*.55);   // stone breaks in straight runs and sharp kinks
      a += turn + kink; a += (ang - a)*.18;                                  // momentum back toward the heading
      const len = step*(.5 + r()*1.1);
      x += Math.cos(a)*len; y += Math.sin(a)*len; width *= .9 - r()*.04;
      pts.push({x, y, w:width});
      if(width > 1.6 && depth === 0 && r() < .08) chips.push(chipAt(x, y, a, width));
      if(x < -.03 || x > 1.03 || y < -.03 || y > asp + .03 || width < .3) break;
      if(depth < 2 && budget.n > 0 && i > 0 && r() < (depth ? .07 : .16)){ budget.n--;
        kids.push({i, x, y, a:a + (r() < .5 ? -1 : 1)*(.45 + r()*.6), w:width*(.5 + r()*.18)}); }
    }
    const L = {pts, depth, s:s0, e:0, stage:k}; lines.push(L);
    const len = pts.length; L.e = s0 + (1 - s0)*Math.min(1, .35 + len/36);
    kids.forEach(c=> mine(c.x, c.y, c.a, c.w, depth + 1, L.s + (L.e - L.s)*(c.i/len), Math.round(3 + r()*6)));
  }
  function chipAt(x, y, a, w){ const n = 4 + (r()*3|0), rad = (.006 + r()*.01)*w/1.6, pts = [];
    const cx = x + Math.cos(a + Math.PI/2)*rad*(r() < .5 ? -1 : 1), cy = y + Math.sin(a + Math.PI/2)*rad;
    for(let j = 0; j < n; j++){ const t = j/n*Math.PI*2; pts.push({x:cx + Math.cos(t)*rad*(.6 + r()*.8), y:cy + Math.sin(t)*rad*(.6 + r()*.8)}); }
    return {pts, s:0, stage:k}; }
  const mains = [0, 2, 2, 3][k] + (r() < .3 ? 1 : 0);
  const a0 = r()*Math.PI*2;
  for(let m = 0; m < mains; m++){
    const ang = a0 + m*(Math.PI*2/mains) + (r() - .5)*.9;
    mine(ix, iy, ang, 2.2 + r()*1 + k*.2, 0, m*.06, Math.round(7 + r()*8));
  }
  // a little crater of spalled stone where it was struck (stages 2+, or wherever you clicked)
  let crater = null;
  if(k >= 2 || from){ const n = 9, rr = .03 + k*.008, pts = []; for(let j = 0; j < n; j++){ const t = j/n*Math.PI*2; pts.push({x:ix + Math.cos(t)*rr*(.55 + r()*.6), y:iy + Math.sin(t)*rr*(.55 + r()*.6)}); }
    crater = {pts, x:ix, y:iy, r:rr, stage:k}; }
  return {lines, chips, crater, impact:{x:ix, y:iy/asp}};
}
function crackState(t){
  let st = t.__pfxCracks;
  if(!st){ st = t.__pfxCracks = {seed:null, built:0, lines:[], chips:[], craters:[], froms:{}, grow:1, growStage:0, tw:null, cv:null, ro:null, asp:1.25}; }
  if(!st.cv || st.cv.parentNode !== t){
    const cv = document.createElement('canvas'); cv.className = 'pfx-cracks'; cv.setAttribute('aria-hidden', 'true'); t.appendChild(cv); st.cv = cv;
    if(st.ro) st.ro.disconnect();
    if(typeof ResizeObserver !== 'undefined'){ st.ro = new ResizeObserver(()=> drawCracks(t)); st.ro.observe(t); }
  }
  return st;
}
function drawCracks(t){
  const st = t.__pfxCracks; if(!st || !st.cv) return;
  const W = t.clientWidth, H = t.clientHeight; if(!W || !H) return;
  const dpr = dprOf(), cv = st.cv;
  if(cv.width !== Math.round(W*dpr) || cv.height !== Math.round(H*dpr)){ cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); }
  const ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const asp = st.asp, X = x=> x*W, Y = y=> y/asp*H, k = W/110;
  const prog = L=> L.stage === st.growStage ? clamp((st.grow - L.s)/Math.max(.001, L.e - L.s), 0, 1) : 1;
  // craters first: dark recessed hole, lit lower-right rim
  st.craters.forEach(c=>{ const p = c.stage === st.growStage ? clamp(st.grow*3, 0, 1) : 1; if(!p) return;
    ctx.save(); ctx.globalAlpha = p; ctx.beginPath(); c.pts.forEach((q, i)=> i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y))); ctx.closePath();
    const gr = ctx.createRadialGradient(X(c.x) - 1, Y(c.y) - 1, 0, X(c.x), Y(c.y), c.r*W*1.1); gr.addColorStop(0, 'rgba(14,8,4,.92)'); gr.addColorStop(.6, 'rgba(46,30,16,.75)'); gr.addColorStop(1, 'rgba(90,64,40,.35)');
    ctx.fillStyle = gr; ctx.fill();
    ctx.lineWidth = 1.1*k; ctx.strokeStyle = 'rgba(255,238,206,.5)'; ctx.translate(.8, 1); ctx.stroke(); ctx.translate(-1.6, -2); ctx.strokeStyle = 'rgba(20,12,6,.6)'; ctx.stroke(); ctx.restore(); });
  // a polyline drawn up to fraction f of its length, each segment at its own (tapering) width
  const strokeLine = (L, f, dx, dy, wMul, wAdd, colour)=>{
    const P = L.pts; if(P.length < 2 || f <= 0) return;
    let total = 0; for(let i = 1; i < P.length; i++) total += Math.hypot(X(P[i].x) - X(P[i-1].x), Y(P[i].y) - Y(P[i-1].y));
    let left = total*f; ctx.strokeStyle = colour; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(let i = 1; i < P.length && left > 0; i++){
      const ax = X(P[i-1].x), ay = Y(P[i-1].y); let bx = X(P[i].x), by = Y(P[i].y); const seg = Math.hypot(bx - ax, by - ay);
      if(seg > left){ const u = left/seg; bx = ax + (bx - ax)*u; by = ay + (by - ay)*u; }
      left -= seg;
      ctx.lineWidth = Math.max(.35, (P[i].w*wMul + wAdd)*k);
      ctx.beginPath(); ctx.moveTo(ax + dx, ay + dy); ctx.lineTo(bx + dx, by + dy); ctx.stroke();
    }
  };
  const ls = st.lines;
  ls.forEach(L=> strokeLine(L, prog(L), -.4*k, -.4*k, 2.6, .8, 'rgba(20,12,6,.2)'));       // recessed shadow around the crack
  ls.forEach(L=> strokeLine(L, prog(L), .55*k, .8*k, .5, .3, 'rgba(255,238,210,.42)'));  // lit lower edge (light from top-left)
  ls.forEach(L=> strokeLine(L, prog(L), 0, 0, 1, 0, 'rgba(26,15,7,.94)'));                 // the gap
  ls.forEach(L=> strokeLine(L, prog(L), -.25*k, -.3*k, .42, 0, 'rgba(0,0,0,.85)'));       // its deepest, shadowed core
  st.chips.forEach(c=>{ const p = c.stage === st.growStage ? (st.grow > .25 ? 1 : 0) : 1; if(!p) return;
    ctx.beginPath(); c.pts.forEach((q, i)=> i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y))); ctx.closePath();
    ctx.fillStyle = 'rgba(52,34,18,.55)'; ctx.fill(); ctx.lineWidth = .7*k; ctx.strokeStyle = 'rgba(255,236,200,.4)'; ctx.stroke(); });
}
function cracks(el, o){
  o = o || {}; const t = tileOf(el); if(!t || !t.appendChild) return null;
  const st = crackState(t); bgImage(t);
  const seed = o.seed != null ? String(o.seed) : (st.seed || seedOf(t));
  if(st.seed !== seed){ st.seed = seed; st.lines = []; st.chips = []; st.craters = []; st.built = 0; st.froms = {}; }
  const W = t.clientWidth, H = t.clientHeight; if(!st.built && W && H) st.asp = H/W;
  const stage = clamp(o.stage == null ? st.built + 1 : o.stage|0, 0, 3);
  if(stage < st.built){
    st.lines = st.lines.filter(L=> L.stage <= stage); st.chips = st.chips.filter(c=> c.stage <= stage); st.craters = st.craters.filter(c=> c.stage <= stage);
    st.built = stage; st.grow = 1; drawCracks(t); return st;
  }
  if(stage === st.built){ drawCracks(t); return st; }
  let impact = null;
  for(let k = st.built + 1; k <= stage; k++){
    if(o.from && k === stage) st.froms[k] = {x:+o.from.x, y:+o.from.y};
    const gen = genStage(seed, k, st.froms[k], st.asp);
    st.lines.push(...gen.lines); st.chips.push(...gen.chips); if(gen.crater) st.craters.push(gen.crater); impact = gen.impact;
  }
  st.built = stage;
  const g = G();
  if(st.tw){ st.tw.kill(); st.tw = null; }
  if(o.grow && g && !reduce()){
    st.growStage = stage; st.grow = 0; const proxy = {p:0};
    st.tw = g.to(proxy, {p:1, duration:o.duration || .55, ease:'power3.out', onUpdate:()=>{ st.grow = proxy.p; drawCracks(t); }, onComplete:()=>{ st.tw = null; st.grow = 1; drawCracks(t); }});
    if(o.jolt !== false) jolt(t, impact, stage);
  } else { st.grow = 1; drawCracks(t); }
  return st;
}
// The struck tile jumps away from the hit and a little grit and dust trickle down from the impact.
function jolt(t, imp, stage){
  const g = G(); if(!g) return; const r = t.getBoundingClientRect(); if(!r.width) return;
  const ix = r.left + (imp ? imp.x : .5)*r.width, iy = r.top + (imp ? imp.y : .5)*r.height;
  const dx = ((imp ? imp.x : .5) - .5)*-6;
  g.timeline().to(t, {x:dx, y:-2, rotation:dx*.4, duration:.05, ease:'power2.out'}).to(t, {x:0, y:0, rotation:0, duration:.4, ease:'elastic.out(1, .4)', clearProps:'x,y,rotation'});
  for(let i = 0; i < 4 + stage*3; i++){ const p = fixed('pfx-grit'); const s = .6 + Math.random();
    g.set(p, {x:ix + (Math.random() - .5)*14, y:iy + (Math.random() - .5)*8, scale:s, rotation:Math.random()*90});
    g.to(p, {x:`+=${(Math.random() - .5)*30}`, y:`+=${30 + Math.random()*50}`, rotation:`+=${Math.random()*300}`, opacity:0, duration:.55 + Math.random()*.35, ease:'power2.in', onComplete:()=> p.remove()}); }
  for(let i = 0; i < 2; i++){ const d = fixed('pfx-dust'); g.set(d, {x:ix - 13, y:iy - 13, scale:.4, opacity:.9});
    g.to(d, {x:`+=${(i ? 1 : -1)*(8 + Math.random()*10)}`, y:'+=10', scale:1.7, opacity:0, duration:.7, ease:'power2.out', onComplete:()=> d.remove()}); }
}
function clearCracks(el){
  const t = tileOf(el); const st = t && t.__pfxCracks; if(!st) return;
  if(st.tw) st.tw.kill(); if(st.ro) st.ro.disconnect(); if(st.cv) st.cv.remove(); delete t.__pfxCracks;
}
// Health → stage, the same thresholds as the game's castle-cracks (≤66%, ≤33%, ≤15%); grows only on a new stage.
function castleDamage(el, frac, o){
  o = o || {}; const stage = frac <= .15 ? 3 : frac <= .33 ? 2 : frac <= .66 ? 1 : 0;
  const t = tileOf(el); const st = t && t.__pfxCracks; const prev = st && st.cv && st.cv.parentNode === t ? st.built : 0;
  if(stage === 0 && !prev) return null;
  return cracks(el, Object.assign({}, o, {stage, grow:o.grow !== false && stage > prev}));
}

// =================================================================================================
// 2. Cellular-automaton crumble
// A coarse grid of slightly jittered quads (so the pieces read as broken masonry, not pixels) sits over the tile.
// Each step a living cell dies with a chance that grows with its dead neighbours, faster where cracks run through
// it, and much faster when the cell under it has gone (no support: it falls). Dead cells drop out of a canvas
// mask on the tile and fall as chips; the broken edge gets a dark rim with a lit lip.
// =================================================================================================
const STONE = ['#8d7e69', '#7a6b58', '#a39581', '#6c5f50', '#968670', '#b3a58f'];
function sampleColours(t, cols, rows){
  try{
    const c = document.createElement('canvas'); c.width = cols; c.height = rows; const x = c.getContext('2d', {willReadFrequently:true});
    const img = t.querySelector('.ico img'); const bg = bgImage(t);
    x.fillStyle = '#7d6a54'; x.fillRect(0, 0, cols, rows);
    if(bg && bg.complete && bg.naturalWidth){ const s = Math.max(cols/bg.naturalWidth, rows/bg.naturalHeight); x.drawImage(bg, (cols - bg.naturalWidth*s)/2, (rows - bg.naturalHeight*s)/2, bg.naturalWidth*s, bg.naturalHeight*s); }
    if(img && img.complete && img.naturalWidth){
      const s = Math.max(cols/img.naturalWidth, rows/img.naturalHeight), w = img.naturalWidth*s, h = img.naturalHeight*s;
      x.drawImage(img, (cols - w)/2, (rows - h)/2, w, h);
    } else {
      const ico = t.querySelector('.ico'); const txt = ico ? ico.textContent.trim() : '';
      if(txt){ x.font = `${Math.round(rows*.62)}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, cols/2, rows*.44); }
    }
    const d = x.getImageData(0, 0, cols, rows).data; const out = [];
    for(let i = 0; i < cols*rows; i++){ const a = d[i*4 + 3]; out.push(a > 100 ? [d[i*4], d[i*4 + 1], d[i*4 + 2]] : null); }
    return out;
  }catch(e){ return null; }
}
// The tile's own background picture (its last url() layer), loaded once per URL so chips can take its colours.
const BG = new Map();
function bgImage(t){
  try{ const m = /url\(["']?([^"')]+)["']?\)[^,]*$/.exec(getComputedStyle(t).backgroundImage || ''); if(!m) return null;
    let im = BG.get(m[1]); if(!im){ im = new Image(); im.src = m[1]; BG.set(m[1], im); if(BG.size > 12) BG.delete(BG.keys().next().value); } return im; }catch(e){ return null; }
}
const shade = (c, f)=> `rgb(${clamp(c[0]*f, 0, 255)|0},${clamp(c[1]*f, 0, 255)|0},${clamp(c[2]*f, 0, 255)|0})`;
const hex = h=> [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function crumble(el, o){
  o = o || {}; const t = tileOf(el); const g = G();
  if(!t || !t.getBoundingClientRect){ call(o.onDone); return null; }
  const restore = ()=>{ t.style.removeProperty('-webkit-mask-image'); t.style.removeProperty('mask-image'); ['-webkit-mask-size', 'mask-size', '-webkit-mask-repeat', 'mask-repeat'].forEach(p=> t.style.removeProperty(p));
    t.querySelectorAll(':scope > .pfx-rim').forEach(n=> n.remove()); if(g){ g.set(t.querySelectorAll('.costbadge, .waitbadge, .badges, .levelbadge'), {clearProps:'transform,opacity'}); g.set(t, {clearProps:'opacity,visibility,x,y,rotation'}); g.fromTo(t, {opacity:0}, {opacity:1, duration:.35}); } else { t.style.opacity = ''; t.style.visibility = ''; } };
  const finish = ()=>{ t.style.visibility = 'hidden'; call(o.onDone); if(o.restore) later(restore, typeof o.restore === 'number' ? o.restore : 900); };
  if(!g || reduce()){ if(g) g.to(t, {opacity:0, duration:.25, onComplete:finish}); else finish(); return null; }
  const r = rng((o.seed != null ? o.seed : seedOf(t)) + ':crumble');
  const rect = t.getBoundingClientRect(), W = t.clientWidth || rect.width, H = t.clientHeight || rect.height; if(!W || !H){ finish(); return null; }
  const sx = rect.width/W, sy = rect.height/H;   // the tile may be scaled; chips fly in screen space
  const cs = o.cell || clamp(Math.round(W/13), 5, 14), cols = Math.ceil(W/cs), rows = Math.ceil(H/cs), N = cols*rows;
  // jittered lattice: interior vertices move, edge ones stay on the edge
  const VX = new Float32Array((cols + 1)*(rows + 1)), VY = new Float32Array(VX.length);
  for(let j = 0; j <= rows; j++) for(let i = 0; i <= cols; i++){ const v = j*(cols + 1) + i;
    VX[v] = Math.min(W, i*cs + ((i > 0 && i < cols) ? (r() - .5)*cs*.7 : 0)); VY[v] = Math.min(H, j*cs + ((j > 0 && j < rows) ? (r() - .5)*cs*.7 : 0)); }
  const quad = c=>{ const i = c % cols, j = (c/cols)|0, a = j*(cols + 1) + i; return [a, a + 1, a + cols + 2, a + cols + 1].map(v=> [VX[v], VY[v]]); };
  // crack weight per cell, from the drunken-miner cracks if the tile has them
  const wgt = new Float32Array(N); const st = t.__pfxCracks;
  if(st && st.lines) st.lines.forEach(L=> L.pts.forEach(p=>{ const i = clamp((p.x*W/cs)|0, 0, cols - 1), j = clamp((p.y/st.asp*H/cs)|0, 0, rows - 1); wgt[j*cols + i] += p.w*.5; }));
  const alive = new Uint8Array(N).fill(1);
  const from = o.from || (st && st.lines.length ? null : {x:.5, y:0});
  if(from){ const i = clamp((from.x*cols)|0, 0, cols - 1), j = clamp((from.y*rows)|0, 0, rows - 1); alive[j*cols + i] = 0; }
  else { let best = -1, bi = 0; for(let c = 0; c < N; c++) if(wgt[c] > best){ best = wgt[c]; bi = c; } alive[bi] = 0; }
  const colours = sampleColours(t, cols, rows);
  // mask + rim canvases
  const mk = document.createElement('canvas'); const ms = 1; mk.width = Math.ceil(W*ms); mk.height = Math.ceil(H*ms); const mx = mk.getContext('2d');
  const rim = document.createElement('canvas'); rim.className = 'pfx-rim'; rim.setAttribute('aria-hidden', 'true'); const dpr = dprOf(); rim.width = Math.round(W*dpr); rim.height = Math.round(H*dpr); t.appendChild(rim);
  const rx = rim.getContext('2d'); rx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ['-webkit-mask-size', 'mask-size'].forEach(p=> t.style.setProperty(p, '100% 100%')); ['-webkit-mask-repeat', 'mask-repeat'].forEach(p=> t.style.setProperty(p, 'no-repeat'));
  const at = (i, j)=> (i < 0 || j < 0 || i >= cols || j >= rows) ? -1 : alive[j*cols + i];
  function paint(){
    mx.clearRect(0, 0, mk.width, mk.height); mx.fillStyle = '#000'; mx.beginPath();
    for(let c = 0; c < N; c++) if(alive[c]){ const q = quad(c); mx.moveTo(q[0][0]*ms, q[0][1]*ms); for(let k = 1; k < 4; k++) mx.lineTo(q[k][0]*ms, q[k][1]*ms); mx.closePath(); }
    mx.fill(); const url = `url(${mk.toDataURL()})`; t.style.setProperty('-webkit-mask-image', url); t.style.setProperty('mask-image', url);
    // broken edges: a dark shadowed rim, lit where the break faces up/left
    rx.clearRect(0, 0, W, H); rx.lineCap = 'round';
    for(let c = 0; c < N; c++){ if(!alive[c]) continue; const i = c % cols, j = (c/cols)|0, q = quad(c);
      const sides = [[at(i, j - 1), q[0], q[1], 1], [at(i + 1, j), q[1], q[2], 0], [at(i, j + 1), q[2], q[3], 0], [at(i - 1, j), q[3], q[0], 1]];
      sides.forEach(([n, a, b, lit])=>{ if(n !== 0) return;
        rx.strokeStyle = 'rgba(24,14,6,.85)'; rx.lineWidth = 2.4; rx.beginPath(); rx.moveTo(a[0], a[1]); rx.lineTo(b[0], b[1]); rx.stroke();
        if(lit){ rx.strokeStyle = 'rgba(255,238,206,.6)'; rx.lineWidth = 1; rx.beginPath(); rx.moveTo(a[0] + .5, a[1] + 1.2); rx.lineTo(b[0] + .5, b[1] + 1.2); rx.stroke(); } }); }
  }
  const duration = o.duration || 2.2, steps = Math.max(10, Math.round(duration*18)), budget = {n:o.chips || 150};
  const floor = rect.bottom + 4;
  const fromX = rect.left + (from ? from.x : .5)*rect.width;
  function chip(c){
    const q = quad(c); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; q.forEach(([x, y])=>{ x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    const w = x1 - x0, h = y1 - y0, col = (colours && colours[c]) || hex(STONE[(r()*STONE.length)|0]);
    const p = fixed('pfx-chip'); p.style.width = w*sx + 'px'; p.style.height = h*sy + 'px';
    p.style.clipPath = 'polygon(' + q.map(([x, y])=> `${((x - x0)/w*100).toFixed(1)}% ${((y - y0)/h*100).toFixed(1)}%`).join(',') + ')';
    p.style.background = `linear-gradient(135deg, ${shade(col, 1.12)}, ${shade(col, .92)} 55%, ${shade(col, .62)})`;
    const px = rect.left + x0*sx, py = rect.top + y0*sy, cx = px + w*sx/2;
    const fall = Math.max(8, floor - py - h*sy*.5 + (r() - .3)*14), T = clamp(Math.sqrt(fall/900), .22, .75);
    const dx = (cx - fromX)*(.25 + r()*.35) + (r() - .5)*30, spin = (r() - .5)*540;
    g.set(p, {x:px, y:py, transformOrigin:'50% 50%'});
    g.timeline({onComplete:()=> p.remove()})
      .to(p, {x:`+=${dx}`, duration:T + .3, ease:'power1.out'}, 0)
      .to(p, {y:`+=${fall}`, duration:T, ease:'power2.in'}, 0)
      .to(p, {rotation:spin, duration:T + .3, ease:'power1.out'}, 0)
      .to(p, {y:`-=${4 + r()*10}`, duration:.12, ease:'power1.out'}, T)
      .to(p, {y:`+=${4 + r()*10}`, duration:.12, ease:'power1.in'}, T + .12)
      .to(p, {opacity:0, duration:.4, ease:'power1.in'}, T + .45);
  }
  function dust(x, y){ const d = fixed('pfx-dust'); g.set(d, {x:x - 13, y:y - 13, scale:.5, opacity:.85});
    g.to(d, {x:`+=${(r() - .5)*40}`, y:`-=${4 + r()*14}`, scale:2 + r()*1.4, opacity:0, duration:.8 + r()*.4, ease:'power2.out', onComplete:()=> d.remove()}); }
  let step = 0;
  function tick(){
    // Paced CA: the schedule says how many blocks should be gone by now (slow start, accelerating fall); the rule
    // says which ones. Score = broken neighbours + no support + crack weight, jittered, best first.
    step++; const target = Math.round(N*Math.pow(Math.min(1, step/steps), 1.7)); let gone = 0; for(let c = 0; c < N; c++) if(!alive[c]) gone++;
    const cand = [];
    for(let c = 0; c < N; c++){ if(!alive[c]) continue; const i = c % cols, j = (c/cols)|0; let d = 0;
      for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++){ if(!di && !dj) continue; const n = at(i + di, j + dj); if(n === 0) d++; else if(n === -1) d += .15; }
      if(d < 1 && step < steps) continue;
      const unsupported = at(i, j + 1) === 0 ? 2.5 : 0;
      cand.push([c, (d + unsupported + Math.min(3, wgt[c]))*(.35 + r())]); }
    cand.sort((x, y)=> y[1] - x[1]);
    const kill = cand.slice(0, Math.max(step >= steps ? cand.length : 0, target - gone)).map(x=> x[0]);
    const total = alive.reduce((a, b)=> a + b, 0); const keepRatio = budget.n > 0 ? Math.min(1, budget.n/Math.max(1, total)*2.2) : 0;
    let sx0 = 0, sy0 = 0;
    kill.forEach(c=>{ alive[c] = 0; if(r() < keepRatio && budget.n-- > 0) chip(c); sx0 += c % cols; sy0 += (c/cols)|0; });
    if(kill.length && r() < .55){ dust(rect.left + (sx0/kill.length + .5)*cs*sx, rect.top + (sy0/kill.length + .5)*cs*sy); }
    paint();
    if(!alive.some(Boolean)){ rim.remove(); g.ticker.remove(drive); for(let k = 0; k < 6; k++) dust(rect.left + rect.width*k/5, floor - 8); call(o.onSettle); later(finish, 700); }
  }
  // fixed-rate stepper riding GSAP's ticker, so the Lab's slow-motion and the game's hit-stop slow it too
  let acc = 0; const dt = duration/steps;
  function drive(time, delta){ acc += delta/1000*g.globalTimeline.timeScale(); while(acc >= dt){ acc -= dt; if(alive.some(Boolean)) tick(); } }
  // a shudder, then badges pop off, then the erosion
  g.timeline().to(t, {keyframes:[{x:-2.5, duration:.04}, {x:2.5, duration:.04}, {x:-1.5, duration:.04}, {x:1.5, duration:.04}, {x:0, duration:.04}]})
    .to(t, {y:3, duration:duration*.9, ease:'power2.in'}, .2);
  t.querySelectorAll('.costbadge, .waitbadge, .badges, .levelbadge').forEach((b, i)=> g.to(b, {y:`+=${50 + i*10}`, x:`+=${(r() - .5)*30}`, rotation:(r() - .5)*120, opacity:0, duration:.55, delay:.12 + i*.05, ease:'power2.in'}));
  paint(); g.delayedCall(.18, ()=> g.ticker.add(drive));
  return {stop(){ g.ticker.remove(drive); }};
}

// =================================================================================================
// 3. Cards of old: a procedural aged-paper finish. Two textures per seed:
//    stain (multiplied): yellowed paper darker toward the edges, fibre grain, specks, foxing spots and a water stain
//      with a tide line (both grown by a cellular automaton), the dark side of each crease;
//    wear (painted over): uneven ink fading, white edge wear and rubbed corners, scuffs, scratches, the lit side of
//      each crease (drunken-walk folds) with flakes of ink lost along it, and sometimes a dog-eared corner.
// =================================================================================================
const OLD_CACHE = new Map();
function oldCardTexture(seed, w, h, layer){
  w = (w|0) || 240; h = (h|0) || 300; const key = seed + '|' + w + '|' + h;
  let e = OLD_CACHE.get(key);
  if(!e){ e = genOld(String(seed), w, h); OLD_CACHE.set(key, e); if(OLD_CACHE.size > 160) OLD_CACHE.delete(OLD_CACHE.keys().next().value); }
  return layer === 'stain' ? e.stain : e.wear;
}
function genOld(seed, w, h){
  const r = rng(seed + ':old');
  const blot = noise2(r, 4), blot2 = noise2(r, 9), fib = noise2(r, 26), edgeN = noise2(r, 22), fade = noise2(r, 5);
  // --- CA stains on a coarse grid
  const cs = 3, gw = Math.ceil(w/cs), gh = Math.ceil(h/cs), GN = gw*gh;
  const stain = new Float32Array(GN), tide = new Float32Array(GN);
  const grow = (seeds, steps, pBase, onAge)=>{
    const age = new Int16Array(GN).fill(-1); let i0 = gw, j0 = gh, i1 = 0, j1 = 0;
    seeds.forEach(c=>{ if(c >= 0 && c < GN){ age[c] = 0; const i = c % gw, j = (c/gw)|0; i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); } });
    for(let s = 1; s <= steps; s++){ const born = [];
      i0 = Math.max(0, i0 - 1); j0 = Math.max(0, j0 - 1); i1 = Math.min(gw - 1, i1 + 1); j1 = Math.min(gh - 1, j1 + 1);   // only the growing window
      for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++){ const c = j*gw + i; if(age[c] >= 0) continue; let n = 0;
        for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++){ if(!di && !dj) continue; const ii = i + di, jj = j + dj; if(ii < 0 || jj < 0 || ii >= gw || jj >= gh) continue; if(age[jj*gw + ii] >= 0) n++; }
        if(n && r() < pBase*n) born.push(c); }
      born.forEach(c=> age[c] = s); }
    onAge(age);
  };
  // water stain: one big blob creeping in from an edge or corner, pale inside with a darker tide line
  if(r() < .75){
    const side = (r()*4)|0, t0 = .15 + r()*.7; const sx = side === 0 ? t0*gw : side === 1 ? gw - 1 : side === 2 ? t0*gw : 0, sy = side === 0 ? 0 : side === 1 ? t0*gh : side === 2 ? gh - 1 : t0*gh;
    const seeds = []; for(let k = 0; k < 5; k++){ const i = clamp((sx + (r() - .5)*6)|0, 0, gw - 1), j = clamp((sy + (r() - .5)*6)|0, 0, gh - 1); seeds.push(j*gw + i); }
    grow(seeds, 16 + (r()*14|0), .085, age=>{ for(let c = 0; c < GN; c++){ if(age[c] < 0) continue; stain[c] += .2;
      const i = c % gw, j = (c/gw)|0; let edge = false; for(let d = 0; d < 4 && !edge; d++){ const ii = i + [1, -1, 0, 0][d], jj = j + [0, 0, 1, -1][d]; if(ii >= 0 && jj >= 0 && ii < gw && jj < gh && age[jj*gw + ii] < 0) edge = true; }
      if(edge) tide[c] += .85 + r()*.3; } });
  }
  // foxing: clusters of rust-brown spots, darkest where they started
  const nClusters = 1 + (r()*3|0);
  for(let q = 0; q < nClusters; q++){ const cx = r()*gw, cy = r()*gh, n = 3 + (r()*8|0);
    for(let k = 0; k < n; k++){ const i = clamp((cx + gauss(r)*gw*.12)|0, 0, gw - 1), j = clamp((cy + gauss(r)*gh*.1)|0, 0, gh - 1), steps = 1 + (r()*4|0);
      grow([j*gw + i], steps, .16, age=>{ for(let c = 0; c < GN; c++) if(age[c] >= 0) stain[c] += .9*(1 - age[c]/(steps + 1)) + .15; }); } }
  // --- stain layer (multiply)
  const S = document.createElement('canvas'); S.width = w; S.height = h; const sx = S.getContext('2d');
  const img = sx.createImageData(w, h), d = img.data;
  const cream = [248, 236, 206], aged = [206, 170, 112], fox = [168, 100, 46], tideC = [132, 82, 38];
  const smp = (f, x, y)=>{ const gx = clamp(x/cs - .5, 0, gw - 1.001), gy = clamp(y/cs - .5, 0, gh - 1.001), i = gx|0, j = gy|0, u = gx - i, v = gy - j;
    const a = f[j*gw + i], b = f[j*gw + i + 1] || 0, c = f[(j + 1)*gw + i] || 0, e = f[(j + 1)*gw + i + 1] || 0; return a*(1 - u)*(1 - v) + b*u*(1 - v) + c*(1 - u)*v + e*u*v; };
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    const o = (y*w + x)*4, nx = x/w, ny = y/h;
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y)/w, vign = 1 - clamp(edge/.16, 0, 1);
    let a = clamp(.18 + .5*blot(nx, ny) + .25*blot2(nx, ny) - .25 + .62*vign*vign, 0, 1);
    let R = cream[0] + (aged[0] - cream[0])*a, Gc = cream[1] + (aged[1] - cream[1])*a, B = cream[2] + (aged[2] - cream[2])*a;
    const grain = .965 + .05*r() - .045*fib(nx*.4, ny*3.2);  // fine grain plus long paper fibres
    R *= grain; Gc *= grain; B *= grain;
    const s = clamp(smp(stain, x, y), 0, 1), td = clamp(smp(tide, x, y), 0, 1);
    if(s > 0){ const k = Math.min(.85, s*.9); R += (fox[0] - R)*k; Gc += (fox[1] - Gc)*k; B += (fox[2] - B)*k; }
    if(td > 0){ const k = Math.min(.8, td*.75); R += (tideC[0] - R)*k; Gc += (tideC[1] - Gc)*k; B += (tideC[2] - B)*k; }
    if(r() < .0022){ R *= .62; Gc *= .55; B *= .5; }   // a dark speck
    d[o] = R; d[o + 1] = Gc; d[o + 2] = B; d[o + 3] = 255;
  }
  sx.putImageData(img, 0, 0);
  // --- wear layer (normal)
  const Wc = document.createElement('canvas'); Wc.width = w; Wc.height = h; const wx = Wc.getContext('2d');
  const wi = wx.createImageData(w, h), wd = wi.data; const rad = w*.11;
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    const o = (y*w + x)*4, nx = x/w, ny = y/h;
    // distance to the rounded-rect edge (corners count from the arc), so corners wear round
    const qx = Math.max(rad - x, x - (w - 1 - rad), 0), qy = Math.max(rad - y, y - (h - 1 - rad), 0);
    const dist = (qx && qy) ? rad - Math.hypot(qx, qy) : Math.min(x, y, w - 1 - x, h - 1 - y);
    const along = (x < 3 || x > w - 4) ? ny : nx;
    const wearW = 2.5 + 8*edgeN(along, (x < w/2) === (y < h/2) ? .2 : .8) + ((qx && qy) ? 7 : 0);
    let a = .1 + .16*fade(nx, ny);                               // ink fading, unevenly
    let e = clamp(1 - dist/wearW, 0, 1); e = e*e*(.6 + .8*r());   // rubbed white edge, ragged
    const cxd = Math.min(x, w - x), cyd = Math.min(y, h - y);
    if(cxd < w*.2 && cyd < w*.2) e = Math.max(e, clamp(1 - Math.sqrt(cxd*cxd + cyd*cyd)/(w*.2), 0, 1)*.5*fib(nx*2, ny*2));
    a = a + (1 - a)*clamp(e, 0, .95);
    if(r() < .0035) a = Math.max(a, .5 + r()*.4);               // light specks: paper showing through
    wd[o] = 250; wd[o + 1] = 243; wd[o + 2] = 224; wd[o + 3] = clamp(a, 0, 1)*255;
  }
  wx.putImageData(wi, 0, 0);
  // scuffs and scratches: faint random walks
  wx.lineCap = 'round';
  const walk = (x, y, ang, n, len, jit)=>{ const pts = [[x, y]]; let a = ang, turn = 0;
    for(let i = 0; i < n; i++){ turn = turn*.8 + gauss(r)*jit; a += turn; x += Math.cos(a)*len; y += Math.sin(a)*len; pts.push([x, y]); if(x < -5 || y < -5 || x > w + 5 || y > h + 5) break; } return pts; };
  const path = (ctx, pts, dx, dy)=>{ ctx.beginPath(); pts.forEach(([x, y], i)=> i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy)); };
  for(let k = 0; k < 3 + (r()*4|0); k++){ const pts = walk(r()*w, r()*h, r()*Math.PI*2, 6 + (r()*20|0), w*.02, .05);
    wx.strokeStyle = `rgba(255,250,238,${.18 + r()*.22})`; wx.lineWidth = .6 + r()*.8; path(wx, pts, 0, 0); wx.stroke(); }
  // creases: long, nearly straight drunken walks right across the card
  const crease = (pts)=>{
    for(let i = 1; i < pts.length; i++){ const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay)/L, ny = (bx - ax)/L;
      sx.strokeStyle = 'rgba(96,66,34,.55)'; sx.lineWidth = 1.3; sx.beginPath(); sx.moveTo(ax - nx, ay - ny); sx.lineTo(bx - nx, by - ny); sx.stroke();
      sx.strokeStyle = 'rgba(150,110,64,.25)'; sx.lineWidth = 4; sx.beginPath(); sx.moveTo(ax - nx*2.5, ay - ny*2.5); sx.lineTo(bx - nx*2.5, by - ny*2.5); sx.stroke();
      wx.strokeStyle = 'rgba(255,251,240,.75)'; wx.lineWidth = 1.1; wx.beginPath(); wx.moveTo(ax + nx*.6, ay + ny*.6); wx.lineTo(bx + nx*.6, by + ny*.6); wx.stroke();
      if(r() < .55){ const t = r(); wx.fillStyle = `rgba(255,252,244,${.6 + r()*.35})`; wx.beginPath(); wx.ellipse(ax + (bx - ax)*t, ay + (by - ay)*t, .8 + r()*2.2, .6 + r()*1.1, Math.atan2(by - ay, bx - ax), 0, Math.PI*2); wx.fill(); } }
  };
  sx.lineCap = 'round';
  const nCreases = r() < .12 ? 0 : r() < .6 ? 1 : 2;
  for(let k = 0; k < nCreases; k++){ const horiz = r() < .6; const x = horiz ? -4 : w*(.2 + r()*.6), y = horiz ? h*(.25 + r()*.5) : -4;
    const ang = (horiz ? 0 : Math.PI/2) + (r() - .5)*.35; crease(walk(x, y, ang, 80, w*.018, .012)); }
  // dog-eared corner: a short fold across one corner, the folded bit rubbed paler
  if(r() < .55){ const cx = r() < .5 ? 0 : w, cy = r() < .5 ? 0 : h, s1 = w*(.1 + r()*.1), s2 = w*(.1 + r()*.1);
    const a = [cx === 0 ? s1 : w - s1, cy], b = [cx, cy === 0 ? s2 : h - s2];
    wx.fillStyle = 'rgba(252,246,230,.32)'; wx.beginPath(); wx.moveTo(cx, cy); wx.lineTo(a[0], a[1]); wx.lineTo(b[0], b[1]); wx.closePath(); wx.fill();
    crease(walk(a[0], a[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 30, Math.hypot(b[0] - a[0], b[1] - a[1])/24, .02)); }
  return {stain:S.toDataURL('image/png'), wear:Wc.toDataURL('image/png')};
}
// Cached textures go on at once; new seeds are generated one per idle slice (~40 ms each) so a grid of old cards
// never blocks a frame for long.
const OLD_W = 200, OLD_H = 250, oldQueue = []; let oldPumping = false;
const idle = fn=> (window.requestIdleCallback ? requestIdleCallback(fn, {timeout:120}) : setTimeout(fn, 16));
function applyOld(s, wr, seed){
  s.style.setProperty('--pfx-stain', `url(${oldCardTexture(seed, OLD_W, OLD_H, 'stain')})`);
  wr.style.setProperty('--pfx-wear', `url(${oldCardTexture(seed, OLD_W, OLD_H)})`);
}
function pumpOld(){
  if(oldPumping) return; oldPumping = true;
  idle(function step(){ const job = oldQueue.shift(); if(job && job.s.isConnected) applyOld(job.s, job.wr, job.seed);
    if(oldQueue.length) idle(step); else oldPumping = false; });
}
function decorateOld(root, o){
  o = o || {};
  (root || document).querySelectorAll('.card-tile.holo-old').forEach(t=>{
    if(t.querySelector(':scope > .pfx-old')) return;
    const seed = seedOf(t) + (t.dataset.pfxSeed ? '' : ':' + (t.dataset.print || ''));
    const s = document.createElement('span'); s.className = 'pfx-old'; s.setAttribute('aria-hidden', 'true');
    const wr = document.createElement('span'); wr.className = 'pfx-old-wear'; wr.setAttribute('aria-hidden', 'true');
    const glare = t.querySelector(':scope > .holo-glare');
    if(glare){ t.insertBefore(s, glare); t.insertBefore(wr, glare); } else { t.appendChild(s); t.appendChild(wr); }
    if(o.sync || OLD_CACHE.has(seed + '|' + OLD_W + '|' + OLD_H)) applyOld(s, wr, seed); else { oldQueue.push({s, wr, seed}); pumpOld(); }
  });
}
// Optional: decorate new .holo-old cards as they appear (one query per frame with DOM changes). Returns stop().
function observeOld(root){
  root = root || document.body; if(typeof MutationObserver === 'undefined' || !root) return ()=>{};
  let queued = false; const mo = new MutationObserver(()=>{ if(queued) return; queued = true; requestAnimationFrame(()=>{ queued = false; decorateOld(root); }); });
  mo.observe(root, {childList:true, subtree:true}); decorateOld(root); return ()=> mo.disconnect();
}

// =================================================================================================
// 4. GSAP experiments
// =================================================================================================
// Clone of a tile as a fixed-position ghost (canvas pixels copied, so cracks come along).
function ghost(t, cls){
  const r = t.getBoundingClientRect(), c = t.cloneNode(true);
  c.removeAttribute('id'); c.classList.add('pfx-fixed'); (cls||'').split(' ').filter(Boolean).forEach(k=> c.classList.add(k)); c.classList.remove('holo-active', 'holo-tilt'); c.setAttribute('aria-hidden', 'true');
  ['position:fixed', 'left:0', 'top:0', 'margin:0', 'pointer-events:none', 'z-index:9989', 'animation:none', 'transition:none', `width:${r.width}px`, `height:${r.height}px`, 'box-sizing:border-box']
    .forEach(rule=>{ const i = rule.indexOf(':'); c.style.setProperty(rule.slice(0, i), rule.slice(i + 1), 'important'); });
  const src = t.querySelectorAll('canvas'), dst = c.querySelectorAll('canvas'); src.forEach((s, i)=>{ try{ dst[i].getContext('2d').drawImage(s, 0, 0); }catch(e){} });
  document.body.appendChild(c); return c;
}
// Voronoi cell of p: the box clipped by the half-plane "closer to p than q" for every other seed q.
function voronoi(pts, box){
  return pts.map((p, pi)=>{ let poly = box.slice();
    for(let qi = 0; qi < pts.length && poly.length; qi++){ if(qi === pi) continue; const q = pts[qi], mx = (p[0] + q[0])/2, my = (p[1] + q[1])/2, nx = q[0] - p[0], ny = q[1] - p[1];
      const inside = v=> (v[0] - mx)*nx + (v[1] - my)*ny <= 0, out = [];
      for(let i = 0; i < poly.length; i++){ const a = poly[i], b = poly[(i + 1) % poly.length], ia = inside(a), ib = inside(b);
        if(ia) out.push(a);
        if(ia !== ib){ const da = (a[0] - mx)*nx + (a[1] - my)*ny, db = (b[0] - mx)*nx + (b[1] - my)*ny, u = da/(da - db); out.push([a[0] + (b[0] - a[0])*u, a[1] + (b[1] - a[1])*u]); } }
      poly = out; }
    return poly; });
}
// Shatter: Voronoi shards (denser near the hit), the fracture network flashes, then the shards blast out along
// ballistic arcs with a 3D tumble. Launch delays come from gsap.utils.distribute over the shards sorted by
// distance from the hit, so the break visibly travels outward; each shard's motion is a single proxy tween
// whose onUpdate writes x/y/rotation through gsap.quickSetter (physics in the ease, not in keyframes).
function shatter(el, o){
  o = o || {}; const t = tileOf(el), g = G();
  const done = ()=>{ call(o.onDone); if(o.restore){ later(()=>{ t.style.visibility = ''; if(g) g.fromTo(t, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.35, ease:'back.out(2)', clearProps:'opacity,scale'}); }, typeof o.restore === 'number' ? o.restore : 700); } };
  if(!t || !g || reduce()){ if(t && g) g.to(t, {opacity:0, duration:.2, onComplete:()=>{ t.style.visibility = 'hidden'; t.style.opacity = ''; done(); }}); else call(o.onDone); return null; }
  const r = rng((o.seed != null ? o.seed : seedOf(t)) + ':shatter:' + (o.seed != null ? '' : Math.random()));
  const rect = t.getBoundingClientRect(), W = rect.width, H = rect.height, pad = 12;
  const from = o.from || {x:.5, y:.45}, fx = from.x*W, fy = from.y*H, power = o.power || 1;
  const pts = [], cols = o.cols || 3, rows = o.rows || 4;
  for(let i = 0; i < cols; i++) for(let j = 0; j < rows; j++) pts.push([(i + .15 + .7*r())*W/cols, (j + .15 + .7*r())*H/rows]);
  for(let k = 0; k < (o.extra || 9); k++){ const a = r()*Math.PI*2, d = (.03 + r()*r()*.3)*W; pts.push([clamp(fx + Math.cos(a)*d, 1, W - 1), clamp(fy + Math.sin(a)*d, 1, H - 1)]); }
  const cells = voronoi(pts, [[-pad, -pad], [W + pad, -pad], [W + pad, H + pad], [-pad, H + pad]]).filter(p=> p.length > 2);
  // fracture network flash: the cell edges drawn from the hit outward
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pfx-fixed pfx-fracture'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.zIndex = 9991; document.body.appendChild(svg);
  g.set(svg, {x:rect.left, y:rect.top});
  const paths = cells.map(poly=>{ const p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M' + poly.map(v=> v[0].toFixed(1) + ' ' + v[1].toFixed(1)).join('L') + 'Z'); svg.appendChild(p); const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return p; });
  const flash = fixed('pfx-flash'); g.set(flash, {x:rect.left + fx - 40, y:rect.top + fy - 40, width:80, height:80, scale:.2, opacity:1});
  g.to(flash, {scale:2.2, opacity:0, duration:.4, ease:'power2.out', onComplete:()=> flash.remove()});
  g.to(paths, {strokeDashoffset:0, duration:.12, ease:'power2.out', stagger:{each:.004, from:'start'}});
  g.to(svg, {opacity:0, duration:.18, delay:.16, onComplete:()=> svg.remove()});
  const shards = cells.map(poly=>{ const s = ghost(t, 'pfx-shard'); let cx = 0, cy = 0; poly.forEach(v=>{ cx += v[0]; cy += v[1]; }); cx /= poly.length; cy /= poly.length;
    s.style.clipPath = 'polygon(' + poly.map(v=> `${v[0].toFixed(1)}px ${v[1].toFixed(1)}px`).join(',') + ')';
    g.set(s, {x:rect.left, y:rect.top, transformOrigin:`${cx}px ${cy}px`, transformPerspective:600}); return {s, cx, cy, d:Math.hypot(cx - fx, cy - fy)}; });
  t.style.visibility = 'hidden';
  shards.sort((a, b)=> a.d - b.d);
  const delay = gsap.utils.distribute({base:.1, amount:.16, ease:'power1.in'});
  const gravity = 1100*(o.gravity || 1); let left = shards.length;
  shards.forEach((sh, i)=>{
    const dx = sh.cx - fx, dy = sh.cy - fy, dl = Math.hypot(dx, dy) || 1, near = 1/(1 + dl/(W*.35));
    const speed = (90 + 230*near)*power*(.75 + r()*.5), vx = dx/dl*speed, vy = dy/dl*speed*.6 - (90 + 140*r())*power;
    const spin = (r() - .5)*420*near + (r() - .5)*80, tx = (r() - .5)*220, ty = (r() - .5)*220, T = .7 + r()*.35;
    const setX = g.quickSetter(sh.s, 'x', 'px'), setY = g.quickSetter(sh.s, 'y', 'px'), setR = g.quickSetter(sh.s, 'rotation', 'deg'), setRX = g.quickSetter(sh.s, 'rotationX', 'deg'), setRY = g.quickSetter(sh.s, 'rotationY', 'deg');
    const p = {t:0};
    g.to(p, {t:T, duration:T, ease:'none', delay:delay(i, sh.s, shards), onUpdate:()=>{ const k = p.t;
      setX(rect.left + vx*k); setY(rect.top + vy*k + .5*gravity*k*k); setR(spin*k); setRX(tx*k); setRY(ty*k); },
      onComplete:()=>{ sh.s.remove(); if(--left === 0) done(); }});
    g.to(sh.s, {opacity:0, duration:.3, delay:delay(i, sh.s, shards) + T - .3, ease:'power1.in'});
  });
  if(o.light) later(()=> call(o.light, rect.left + fx, rect.top + fy, [1, .92, .75], true), 60);
  return shards.length;
}
// Flip riffle: the row lifts and fans, the DOM order is shuffled, and Flip animates every card from where it was.
// The riffle arc rides on CSS custom properties feeding the individual `translate`/`rotate` properties, so it
// stacks on top of Flip's own transform without fighting it. rounds > 1 chains another riffle on completion.
function flipShuffle(container, o){
  o = o || {}; const g = G(); if(!container) return null;
  const kids = [...container.children].filter(n=> n.nodeType === 1 && !n.classList.contains('pfx-fixed'));
  if(kids.length < 2){ call(o.onDone); return null; }
  let order = o.order ? o.order.slice() : (G() ? gsap.utils.shuffle(kids.slice()) : kids.slice().reverse());
  if(order.every((k, i)=> k === kids[i])) order = order.slice(1).concat(order[0]);
  const F = typeof Flip !== 'undefined' ? Flip : null;
  if(!g || !F || reduce()){ order.forEach(k=> container.appendChild(k)); call(o.onDone); return null; }
  try{ g.registerPlugin(F); }catch(e){}
  const before = new Map(kids.map((k, i)=> [k, i]));
  kids.forEach(k=>{ k.style.translate = '0 var(--pfx-ly, 0px)'; k.style.rotate = 'var(--pfx-lr, 0deg)'; });
  const state = F.getState(kids);
  order.forEach(k=> container.appendChild(k));
  const tl = g.timeline({onComplete:()=>{ g.set(kids, {clearProps:'transform,scale'}); kids.forEach(k=>{ k.style.translate = ''; k.style.rotate = ''; k.style.removeProperty('--pfx-ly'); k.style.removeProperty('--pfx-lr'); });
    if((o.rounds || 1) > 1) flipShuffle(container, Object.assign({}, o, {rounds:o.rounds - 1, order:null})); else call(o.onDone); }});
  // gather: everyone lifts a touch and leans toward the middle
  const mid = (kids.length - 1)/2;
  tl.to(kids, {'--pfx-ly':'-10px', '--pfx-lr':(i, k)=> ((before.get(k) - mid)*-2.5) + 'deg', duration:.16, ease:'power2.out'});
  const fl = F.from(state, {duration:.62, ease:'power3.inOut', stagger:{amount:.14, from:'center'}, zIndex:3});
  tl.add(fl, .12);
  // the riffle: cards moving right arc high, cards moving left arc low, so the halves interleave
  order.forEach((k, ni)=>{ const shift = ni - before.get(k), lift = shift > 0 ? -28 - shift*6 : shift < 0 ? 16 - shift*3 : -16;
    tl.to(k, {keyframes:[{'--pfx-ly':lift + 'px', '--pfx-lr':(shift*3) + 'deg', duration:.3, ease:'power2.out'}, {'--pfx-ly':'0px', '--pfx-lr':'0deg', duration:.38, ease:'bounce.out'}]}, .14); });
  if(o.onEach) tl.add(()=> call(o.onEach), .3);
  return tl;
}
// Lantern: the host goes dark except a warm pool of light that trails the pointer (gsap.quickTo), with a flame
// that flickers by re-rolling random values every repeat (repeatRefresh). Cards turn to face the light, brighten
// as it nears and cast a shadow away from it. Returns {destroy}.
function lantern(host, o){
  o = o || {}; const g = G(); if(!host || !g) return {destroy(){}};
  const hs = getComputedStyle(host); const restorePos = hs.position === 'static' ? (host.style.position = 'relative', true) : false;
  const shadeEl = document.createElement('div'); shadeEl.className = 'pfx-lantern'; const glow = document.createElement('div'); glow.className = 'pfx-lantern-glow';
  const flame = document.createElement('div'); flame.className = 'pfx-lantern-flame'; [glow, shadeEl, flame].forEach(e=>{ e.setAttribute('aria-hidden', 'true'); host.appendChild(e); });
  const cards = [...(o.cards || host.querySelectorAll('.card-tile'))];
  const R = o.radius || 120, box = ()=> host.getBoundingClientRect();
  const L = {x:box().width/2, y:box().height*.4, f:1};
  const qx = g.quickTo(L, 'x', {duration:.6, ease:'power3'}), qy = g.quickTo(L, 'y', {duration:.6, ease:'power3'});
  const turn = cards.map(c=> ({ry:g.quickTo(c, 'rotationY', {duration:.5, ease:'power2'}), rx:g.quickTo(c, 'rotationX', {duration:.5, ease:'power2'})}));
  cards.forEach(c=> g.set(c, {transformPerspective:600}));
  const flick = reduce() ? null : g.to(L, {f:'random(0.84, 1.08)', duration:.09, ease:'sine.inOut', repeat:-1, repeatRefresh:true});
  let idle = null; const wander = ()=>{ const b = box(); if(idle) idle.kill(); if(reduce()) return;
    idle = g.timeline({repeat:-1}).to(L, {x:b.width*.25, y:b.height*.35, duration:1.6, ease:'sine.inOut'}).to(L, {x:b.width*.75, y:b.height*.55, duration:1.8, ease:'sine.inOut'}).to(L, {x:b.width*.5, y:b.height*.3, duration:1.4, ease:'sine.inOut'}); };
  const move = e=>{ if(idle){ idle.kill(); idle = null; } const b = box(); qx(e.clientX - b.left); qy(e.clientY - b.top); };
  const leave = ()=> wander();
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
  const apply = ()=>{ const b = box(), r = R*L.f;
    [shadeEl, glow].forEach(e=>{ e.style.setProperty('--lx', L.x.toFixed(1)); e.style.setProperty('--ly', L.y.toFixed(1)); e.style.setProperty('--lr', r.toFixed(1)); });
    g.set(flame, {x:L.x, y:L.y, scaleY:.85 + (L.f - .84)*1.4, scaleX:1.1 - (L.f - .84)});
    cards.forEach((c, i)=>{ const cr = c.getBoundingClientRect(), cx = cr.left + cr.width/2 - b.left, cy = cr.top + cr.height/2 - b.top, dx = L.x - cx, dy = L.y - cy, dist = Math.hypot(dx, dy), lit = clamp(1 - dist/(R*2.2), 0, 1);
      turn[i].ry(clamp(dx/8, -22, 22)); turn[i].rx(clamp(-dy/10, -16, 16));
      c.style.filter = `brightness(${(.75 + lit*.55).toFixed(3)}) saturate(${(.8 + lit*.35).toFixed(3)})`;
      const sx = clamp(-dx/12, -14, 14), sy = clamp(-dy/12, -14, 14); c.style.boxShadow = `${sx.toFixed(1)}px ${(sy + 4).toFixed(1)}px ${(10 + dist/12).toFixed(0)}px rgba(0,0,0,${(.25 + lit*.35).toFixed(2)}), 0 0 ${(lit*24).toFixed(0)}px rgba(255,190,90,${(lit*.45).toFixed(2)})`; });
  };
  g.ticker.add(apply); wander();
  return {destroy(){ g.ticker.remove(apply); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave);
    if(flick) flick.kill(); if(idle) idle.kill(); g.killTweensOf(L); [shadeEl, glow, flame].forEach(e=> e.remove());
    cards.forEach(c=>{ g.killTweensOf(c); g.set(c, {clearProps:'transform,filter,boxShadow'}); }); if(restorePos) host.style.position = ''; }};
}
// Forge: one paused timeline with labels (blank → heat → hammer → quench → temper → done). Scrub it with
// tl.progress(), jump with tl.tweenTo('quench'), or tl.play(). Every particle exists from the start and only
// fromTo tweens touch it, so scrubbing backward rebuilds each frame exactly. Returns {tl, labels, destroy}.
function forge(el, o){
  o = o || {}; const g = G(), t = tileOf(el); if(!g || !t) return {tl:null, labels:[], destroy(){}};
  const r = rng((o.seed != null ? o.seed : seedOf(t)) + ':forge');
  const W = t.clientWidth, H = t.clientHeight;
  const glow = document.createElement('span'); glow.className = 'pfx-forge-glow';
  const flash = document.createElement('span'); flash.className = 'pfx-forge-flash';
  const shine = document.createElement('span'); shine.className = 'pfx-forge-shine'; shine.innerHTML = '<i></i>';
  const fx = document.createElement('span'); fx.className = 'pfx-forge-fx';
  const cool = document.createElement('span'); cool.className = 'pfx-forge-glow pfx-forge-cool';
  const hammer = document.createElement('span'); hammer.className = 'pfx-hammer'; hammer.textContent = '🔨'; fx.appendChild(hammer);
  [glow, cool, flash, shine, fx].forEach(e=>{ e.setAttribute('aria-hidden', 'true'); t.appendChild(e); });
  const F = (gs, se, sa, hu, br)=> `grayscale(${gs}) sepia(${se}) saturate(${sa}) hue-rotate(${hu}deg) brightness(${br})`;
  const tl = g.timeline({paused:true, defaults:{ease:'power2.inOut'}});
  tl.addLabel('blank', 0).fromTo(t, {filter:F(1, 0, 1, 0, .55), scale:.94}, {filter:F(1, 0, 1, 0, .55), scale:.94, duration:.01}, 0);
  tl.addLabel('heat', .3).to(t, {filter:F(.2, .7, 2.6, -25, 1.25), scale:.97, duration:.9}, 'heat').fromTo(glow, {opacity:0}, {opacity:.85, duration:.9}, 'heat')
    .to(glow, {opacity:.65, duration:.15, yoyo:true, repeat:3, ease:'sine.inOut'}, 'heat+=0.9');
  tl.addLabel('hammer', 1.9);
  for(let s = 0; s < 3; s++){ const at = 1.9 + s*.55, hx = W*(.35 + r()*.3), hy = H*(.3 + r()*.35);
    tl.fromTo(hammer, {x:hx + 6, y:hy - 46, rotation:-55, opacity:0}, {x:hx + 6, y:hy - 46, rotation:-55, opacity:1, duration:.01, immediateRender:false}, at)
      .to(hammer, {rotation:12, y:hy - 30, duration:.14, ease:'power3.in'}, at + .01)
      .to(t, {scaleY:.9, scaleX:1.04, duration:.05, ease:'power2.out'}, at + .15).to(t, {scaleY:.97, scaleX:.97, duration:.3, ease:'elastic.out(1, .4)'}, at + .2)
      .fromTo(flash, {opacity:0, scale:.4, x:hx - W/2, y:hy - H/2}, {opacity:1, scale:1, duration:.06, immediateRender:false}, at + .15).to(flash, {opacity:0, duration:.22}, at + .21)
      .to(hammer, {rotation:-40, y:hy - 50, opacity:0, duration:.28, ease:'power2.out'}, at + .2);
    for(let k = 0; k < 12; k++){ const sp = document.createElement('i'); sp.className = 'pfx-spark'; fx.appendChild(sp);
      const a = -Math.PI*(.05 + r()*.9), v = 30 + r()*70;
      tl.fromTo(sp, {x:hx, y:hy, opacity:1, scale:1}, {x:hx + Math.cos(a)*v*1.4, y:hy + Math.sin(a)*v + 30 + r()*30, opacity:0, scale:.3, duration:.45 + r()*.3, ease:'power1.out', immediateRender:false}, at + .15); }
  }
  tl.addLabel('quench', 3.8).to(t, {filter:F(.55, 0, .8, 0, .85), scale:1, duration:.35}, 'quench').to(glow, {opacity:0, duration:.5}, 'quench')
    .fromTo(cool, {opacity:0}, {opacity:.7, duration:.3, immediateRender:false}, 'quench').to(cool, {opacity:0, duration:.8}, 'quench+=0.5');
  for(let k = 0; k < 8; k++){ const p = document.createElement('i'); p.className = 'pfx-steam'; fx.appendChild(p); const x = W*(.15 + r()*.7);
    tl.fromTo(p, {x, y:H*(.6 + r()*.3), scale:.5}, {x:x + (r() - .5)*30, y:-H*(.05 + r()*.25), scale:2.2, duration:1.1, ease:'power1.out', immediateRender:false}, 3.8 + k*.06)
      .fromTo(p, {opacity:0}, {opacity:.9, duration:.25, ease:'power1.out', immediateRender:false}, 3.8 + k*.06)
      .fromTo(p, {opacity:.9}, {opacity:0, duration:.85, ease:'power1.in', immediateRender:false}, 4.05 + k*.06); }
  tl.addLabel('temper', 4.9).to(t, {filter:F(0, 0, 1, 0, 1), duration:.6}, 'temper')
    .fromTo(shine.firstChild, {left:'-50%'}, {left:'130%', duration:.7, ease:'power2.inOut'}, 'temper+=0.15')
    .fromTo(t, {boxShadow:'0 0 0 0 rgba(255,214,110,0)'}, {boxShadow:'0 0 0 3px rgba(255,214,110,.95), 0 0 26px 6px rgba(255,190,80,.7)', duration:.3, yoyo:true, repeat:1}, 'temper+=0.2');
  tl.addLabel('done', 6);
  const labels = ['blank', 'heat', 'hammer', 'quench', 'temper', 'done'];
  return {tl, labels, destroy(){ tl.kill(); [glow, cool, flash, shine, fx].forEach(e=> e.remove()); g.set(t, {clearProps:'filter,scale,scaleX,scaleY,boxShadow,transform'}); }};
}
// Ripple: a wave from one card through a grid. Delays come from gsap.utils.distribute({grid:'auto', from}) so the
// pop and the glow share one stagger; the glow colour is gsap.utils.interpolate'd from gold at the source to cool
// teal at the far edge; gsap.utils.wrap alternates the tilt direction card to card.
function ripple(cards, o){
  o = o || {}; const g = G(); const list = [...(cards || [])].filter(Boolean); if(!list.length){ call(o.onDone); return null; }
  if(!g || reduce()){ call(o.onDone); return null; }
  let from = typeof o.from === 'number' ? o.from : list.indexOf(o.from); if(from < 0) from = 0;
  const delay = gsap.utils.distribute({grid:'auto', from, amount:o.amount || .55, ease:'power1.in'});
  const cs = list.map(c=>{ const r = c.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  const far = Math.max(...cs.map(p=> Math.hypot(p[0] - cs[from][0], p[1] - cs[from][1]))) || 1;
  const colour = gsap.utils.interpolate('rgba(255,214,110,.95)', 'rgba(90,200,255,.55)');
  const tilt = gsap.utils.wrap([-4, 3, -2, 4, -3]);
  g.set(list, {transformPerspective:500});
  const tl = g.timeline({onComplete:()=>{ g.set(list, {clearProps:'transform,boxShadow'}); call(o.onDone); }});
  list.forEach((c, i)=>{ const dl = delay(i, c, list), n = Math.hypot(cs[i][0] - cs[from][0], cs[i][1] - cs[from][1])/far, k = 1 - n*.55;
    tl.to(c, {keyframes:[{y:-16*k, scale:1 + .08*k, rotationX:22*k, rotation:tilt(i)*k, duration:.15, ease:'power2.out'}, {y:0, scale:1, rotationX:0, rotation:0, duration:.6, ease:'elastic.out(1, .38)'}]}, dl)
      .fromTo(c, {boxShadow:`0 0 0px 0px ${colour(n)}`}, {boxShadow:`0 0 22px 5px ${colour(n)}`, duration:.16, yoyo:true, repeat:1, ease:'sine.inOut'}, dl); });
  return tl;
}

root.ProcFX = {cracks, clearCracks, castleDamage, crumble, oldCardTexture, decorateOld, observeOld, shatter, flipShuffle, lantern, forge, ripple, rng, css};
})(typeof window !== 'undefined' ? window : globalThis);
