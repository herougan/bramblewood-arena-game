/* ============================================================
   Bramblewood FX, batch D (2026-10-15): status (part), card-treatment, foil, pack-card-open, meta-progression (part)
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.D: FX.D.someEffect(el, opts); variants are FX.D.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-d-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxd- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.D.onEvent / FX.D.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.D = FX.D || {};
const TAG = 'd';

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
  if(html) e.innerHTML = html; if(host) e.style.position = 'absolute'; (host || overHost()).appendChild(e); return e;
}
// 2026-10-15: the game's pack opener (.po2) is a fixed overlay at z-index 9500, so overlays on <body> (z ~1200) would sit
// under it. While it is open, fixed overlays go inside it (still viewport-positioned, stacked above its cards). The lab's
// copy (.fxl-po) is zoomed to fit its dock, so there they stay on <body>.
function overHost(){
  const po = document.getElementById('packOpenOverlay');
  return po && po.isConnected && !po.hidden && po.classList.contains('po2') && !po.classList.contains('fxl-po') ? po : document.body;
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
// 2026-10-15 (batch D, user: "Foil effects too. Make some fun new ones ... comprehensive, actually quite good, and for those
// you are unsure of, make multiple"): card finishes, rarity frames, on-card status looks, the pack opener's reveals and the
// Forge's upgrade moments. Sections below: shared bits · FOILS · STATUS LOOKS · FRAMES & TREATMENTS · PACKS · FORGE · HOOKS.

// ======================= shared bits =======================
const hr = (i, k)=>{ const x = Math.sin((i + 1)*127.1 + (k || 0)*311.7)*43758.5453; return x - Math.floor(x); }; // stable 0..1 per (i, k)
const svgUrl = s=> `url("data:image/svg+xml,${encodeURIComponent(String(s).replace(/\s+/g, ' '))}")`;
const SVG = (body, vb, par)=> `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb || '0 0 100 140'}' preserveAspectRatio='${par || 'none'}'>${body}</svg>`;
function seeded(seed){ let s = 0; for(const ch of String(seed)) s = (s*31 + ch.charCodeAt(0)) >>> 0;
  return ()=>{ s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const f1 = n=> (+n).toFixed(1);
const reduceNow = ()=>{ try{ return typeof reducedMotion === 'function' ? reducedMotion() : (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const snd = (name, ...a)=>{ try{ if(typeof SoundKit !== 'undefined' && SoundKit[name]) SoundKit[name](...a); }catch(e){} };
// Turbulence noise as a CSS image: `matrix` is the feColorMatrix (20 numbers) that turns the noise into colour + alpha.
const noise = (freq, oct, seed, matrix, type, size)=> svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${size || 200}' height='${size || 200}'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='${type || 'fractalNoise'}' baseFrequency='${freq}' numOctaves='${oct || 2}' seed='${seed || 3}' stitchTiles='stitch'/><feColorMatrix values='${matrix}'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
// Contour lines of smooth noise: thin bright rings where the noise crosses a level — reads as water caustics.
const contour = (freq, seed, size, rgb, table)=> svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  1 0 0 0 0'/><feComponentTransfer><feFuncA type='table' tableValues='${table || '0 0 0 0 .9 0 0 .7 0 0 0 0'}'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`);
// Jagged branching cracks (ember, brimstone) on the 100×140 card box.
function crackPath(seed, n, len){ const r = seeded(seed); let d = '';
  for(let k = 0; k < n; k++){ let x = r()*100, y = r()*140, a = r()*Math.PI*2; d += `M${f1(x)} ${f1(y)}`;
    const steps = 5 + (r()*6|0);
    for(let s = 0; s < steps; s++){ a += (r() - .5)*1.1; const L = (len || 9)*(.5 + r()); x += Math.cos(a)*L; y += Math.sin(a)*L; d += `L${f1(x)} ${f1(y)}`;
      if(r() < .3){ const b = a + (r() < .5 ? -1 : 1)*(.6 + r()*.6), L2 = L*(.6 + r()*.5); d += `l${f1(Math.cos(b)*L2)} ${f1(Math.sin(b)*L2)}M${f1(x)} ${f1(y)}`; } } }
  return d; }
// Soft branching threads (mycelium) growing up from the bottom edge.
function threadPath(seed, n){ const r = seeded(seed); let d = '';
  const grow = (x, y, a, len, depth)=>{ let px = x, py = y; d += `M${f1(px)} ${f1(py)}`;
    for(let s = 0; s < 6; s++){ a += (r() - .5)*.7; const nx = px + Math.cos(a)*len, ny = py + Math.sin(a)*len; d += `Q${f1((px + nx)/2 + (r() - .5)*4)} ${f1((py + ny)/2 + (r() - .5)*4)} ${f1(nx)} ${f1(ny)}`; px = nx; py = ny;
      if(depth < 2 && r() < .35){ const sx = px, sy = py; grow(sx, sy, a + (r() < .5 ? -.9 : .9), len*.7, depth + 1); d += `M${f1(px)} ${f1(py)}`; } } };
  for(let k = 0; k < n; k++) grow(8 + r()*84, 142, -Math.PI/2 + (r() - .5)*.8, 6 + r()*4, 0);
  return d; }
// Right-angled traces with solder pads (ant builders' acid-battery circuit).
function circuitSVG(seed, stroke, w){ const r = seeded(seed); let d = '', pads = '';
  for(let k = 0; k < 12; k++){ let x = 6 + Math.round(r()*11)*8, y = 140 - Math.round(r()*3)*6, horiz = false; d += `M${x} ${y}`;
    for(let s = 0; s < 10; s++){ const L = 10 + Math.round(r()*4)*6; if(horiz){ x = Math.max(4, Math.min(96, x + (r() < .5 ? -L : L))); } else { y = Math.max(6, y - L); } d += `L${x} ${y}`; horiz = !horiz; }
    pads += `<circle cx='${x}' cy='${y}' r='1.8'/>`; }
  return SVG(`<g fill='none' stroke='${stroke}' stroke-width='${w || 1.1}' stroke-linejoin='round'><path d='${d}'/></g><g fill='${stroke}'>${pads}</g>`); }
// A stained-glass sheet: a jittered grid split into panes, `fill` → only the coloured panes, else only the lead lines.
function glassSVG(seed, palette, fill, fan){ const r = seeded(seed), P = [], cols = 4, rows = 6;
  if(fan){ // hummingbird feathers: wedges fanning out from the bottom centre, cut by arcs
    let body = ''; const cx = 50, cy = 150, rings = [40, 78, 118, 175], n = 9;
    for(let i = 0; i < n; i++) for(let j = 0; j < rings.length - 1; j++){
      const a0 = Math.PI*(1.06 + i*0.88/n), a1 = Math.PI*(1.06 + (i + 1)*0.88/n), r0 = rings[j], r1 = rings[j + 1];
      const pt = (a, rr)=> `${f1(cx + Math.cos(a)*rr)},${f1(cy + Math.sin(a)*rr)}`;
      const col = palette[(i*3 + j*5 + (r()*palette.length|0)) % palette.length];
      body += `<polygon points='${pt(a0, r0)} ${pt(a1, r0)} ${pt(a1, r1)} ${pt(a0, r1)}' ${fill ? `fill='${col}' fill-opacity='${f1(.55 + r()*.4)}'` : ''}/>`; }
    return SVG(fill ? body : `<g fill='none' stroke='#16110c' stroke-width='1.6' stroke-linejoin='round'>${body}</g>`); }
  for(let j = 0; j <= rows; j++) for(let i = 0; i <= cols; i++){ const edgeX = i === 0 || i === cols, edgeY = j === 0 || j === rows;
    P.push([i*100/cols + (edgeX ? 0 : (r() - .5)*16), j*140/rows + (edgeY ? 0 : (r() - .5)*16)]); }
  const at = (i, j)=> P[j*(cols + 1) + i].map(f1).join(',');
  let body = '';
  for(let j = 0; j < rows; j++) for(let i = 0; i < cols; i++){
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1), split = r() < .5;
    const tris = split ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    tris.forEach(t=>{ const col = palette[(r()*palette.length)|0]; body += `<polygon points='${t.join(' ')}' ${fill ? `fill='${col}' fill-opacity='${f1(.6 + r()*.35)}'` : ''}/>`; }); }
  return SVG(fill ? body : `<g fill='none' stroke='#16110c' stroke-width='1.1' stroke-linejoin='round'>${body}</g>`); }
// Thorny vines climbing in from the four corners.
function vineSVG(){ let d = '', th = '';
  const vine = (pts)=>{ d += `M${pts[0]}`; for(let k = 1; k < pts.length; k += 2) d += `Q${pts[k]} ${pts[k + 1]}`;
    pts.forEach((p, k)=>{ if(!k) return; const [x, y] = p.split(' ').map(Number); th += `M${f1(x)} ${f1(y)}l${k % 2 ? 2.4 : -2.4} -1.6l-.6 2.6z`; }); };
  vine(['0 140', '10 128', '6 112', '2 98', '9 86', '16 74', '8 62']); vine(['100 140', '90 130', '94 114', '99 100', '91 90', '84 80', '93 68']);
  vine(['0 0', '12 6', '24 3', '36 0', '44 8']); vine(['100 0', '88 8', '78 3', '66 0', '58 7']);
  vine(['0 140', '14 136', '26 139', '38 142', '46 134']); vine(['100 140', '86 137', '74 140', '62 143', '55 135']);
  return SVG(`<path d='${d}' fill='none' stroke='#2f5a22' stroke-width='2.4' stroke-linecap='round'/><path d='${d}' fill='none' stroke='#6fae4a' stroke-width='.9' stroke-linecap='round'/><path d='${th}' fill='#3d6a2a'/>`); }

// ======================= FOILS =======================
// New finishes (2026-10-15). Each rides the game's own foil light: decorateHolo()/wireHolo() set --hx/--hy (the pointer, or
// phone tilt) and --hbx/--hby (the sheen band) on any .card-tile.is-holo, and holoDrift sways them when nobody points.
// A finish here is `is-holo fxd-foil fxd-f-<key>` on the tile, plus one .fxd-ffx layer (drawn shapes on ::before/::after,
// particles as <i>). The .holo-layer carries the blended sheen; .fxd-ffx draws normally on top. FX.D.applyFoil(tile, key)
// sets one up; FX.D.decorateFoils(root) adds the missing layers to tiles that already carry the classes (e.g. from data).
const FOIL_BASE = `
  .card-tile.fxd-foil .holo-layer{-webkit-mask-image:none; mask-image:none; filter:none; overflow:hidden;}
  .card-tile.fxd-foil .holo-layer::before, .card-tile.fxd-foil .holo-layer::after{content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;}
  .fxd-ffx{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none; z-index:7; container-type:size;}
  .fxd-ffx::before, .fxd-ffx::after{content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background-repeat:no-repeat;}
  .fxd-ffx i{position:absolute; left:var(--x); top:var(--y); display:block; pointer-events:none; font-style:normal;}
  @property --fxd-g{syntax:'<percentage>'; inherits:false; initial-value:10%;}
  @keyframes fxdBreathe{0%,100%{opacity:.4;} 50%{opacity:1;}}
  @keyframes fxdRise{0%{transform:translate(0,0) scale(var(--s,1)); opacity:0;} 12%{opacity:1;} 100%{transform:translate(var(--sx,6px), -110cqh) scale(calc(var(--s,1)*.4)); opacity:0;}}
  @keyframes fxdFall{0%{transform:translate(0,0) rotate(0deg); opacity:0;} 10%{opacity:var(--o,.9);} 50%{transform:translate(var(--sx,12px), 60cqh) rotate(calc(var(--r,180deg)*.5));} 92%{opacity:var(--o,.9);} 100%{transform:translate(calc(var(--sx,12px)*-.5), 118cqh) rotate(var(--r,180deg)); opacity:0;}}
  @keyframes fxdBlink{0%,100%{opacity:0;} 35%,60%{opacity:1;}}
  @keyframes fxdHeat{to{background-position:0 -24px, 0 0;}}
  @keyframes fxdStatic{0%{background-position:0 0;} 20%{background-position:-37px 21px;} 40%{background-position:53px -14px;} 60%{background-position:-11px 47px;} 80%{background-position:29px 9px;} 100%{background-position:0 0;}}
  @keyframes fxdFlame{to{background-position:0 -480px, 0 0;}}
  @keyframes fxdRedact{0%,30%{transform:scaleX(1);} 42%,82%{transform:scaleX(0);} 92%,100%{transform:scaleX(1);}}
  @keyframes fxdTide{to{background-position:60px 0, -44px 6px;}}
  @keyframes fxdGeiger{0%{opacity:.5;} 13%{opacity:.75;} 15%{opacity:.4;} 41%{opacity:.62;} 43%{opacity:.85;} 46%{opacity:.5;} 71%{opacity:.7;} 88%{opacity:.45;}}
  @keyframes fxdTwinkle{0%,100%{opacity:.15; transform:scale(.6);} 50%{opacity:1; transform:scale(1.15);}}
  @keyframes fxdWander{0%{transform:translate(0,0);} 25%{transform:translate(calc(var(--sx,10px)*.8), -8px);} 50%{transform:translate(calc(var(--sx,10px)*-.4), -14px);} 75%{transform:translate(calc(var(--sx,10px)*-.9), -4px);} 100%{transform:translate(0,0);}}
  @keyframes fxdDrift{0%{transform:translate(0,0) scale(var(--s,1)); opacity:0;} 15%{opacity:var(--o,.9);} 85%{opacity:var(--o,.9);} 100%{transform:translate(var(--sx,20px), -40cqh) scale(var(--s,1)); opacity:0;}}
  @keyframes fxdSweep{0%,62%{background-position:130% 0;} 100%{background-position:-30% 0;}}
  @keyframes fxdSpin{to{transform:rotate(360deg);}}
  @keyframes fxdGrowCorners{0%,8%{--fxd-g:0%;} 55%,82%{--fxd-g:62%;} 100%{--fxd-g:0%;}}
  @keyframes fxdBloom{0%,40%{transform:scale(0) rotate(-40deg); opacity:0;} 55%,82%{transform:scale(var(--s,1)) rotate(0deg); opacity:1;} 96%,100%{transform:scale(0) rotate(30deg); opacity:0;}}
  @media (prefers-reduced-motion: reduce){ .card-tile.fxd-foil .holo-layer, .card-tile.fxd-foil .holo-layer::before, .card-tile.fxd-foil .holo-layer::after, .fxd-ffx::before, .fxd-ffx::after, .fxd-ffx i{animation:none !important;} }
  html[data-fx="none"] .fxd-ffx i, html[data-fx="low"] .fxd-ffx i{animation-play-state:paused;}`;
const CRACKS_EMBER = svgUrl(SVG(`<path d='${crackPath('ember', 9, 8)}' fill='none' stroke='#ff5a10' stroke-width='2.6' stroke-linecap='round' stroke-opacity='.55'/><path d='${crackPath('ember', 9, 8)}' fill='none' stroke='#ffd27a' stroke-width='.9' stroke-linecap='round'/>`));
const CRACKS_BRIM = svgUrl(SVG(`<path d='${crackPath('brim', 7, 11)}' fill='none' stroke='#b0100a' stroke-width='3' stroke-linecap='round' stroke-opacity='.6'/><path d='${crackPath('brim', 7, 11)}' fill='none' stroke='#ff4a2a' stroke-width='1' stroke-linecap='round'/>`));
const WAVES = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='60' height='14' viewBox='0 0 60 14'><path d='M0 7 Q7.5 2 15 7 T30 7 T45 7 T60 7' fill='none' stroke='#e6fffb' stroke-width='1.1' stroke-opacity='.8'/></svg>`);
const WAVE_EMBLEM = svgUrl(SVG(`<g fill='none' stroke='#ffe6b0' stroke-width='3' stroke-linecap='round'><path d='M8 30 Q20 14 32 30 T56 30 T80 30 T92 30'/><path d='M8 44 Q20 28 32 44 T56 44 T80 44 T92 44' stroke-opacity='.7'/></g><circle cx='50' cy='37' r='34' fill='none' stroke='#ffe6b0' stroke-width='2.4'/>`, '0 0 100 74', 'xMidYMid meet'));
const FILIGREE = svgUrl(SVG((()=>{ let g = ''; const sp = (x, y, s, rot)=> g += `<path transform='translate(${x} ${y}) rotate(${rot}) scale(${s})' d='M0 0 C4 -6 10 -4 10 1 C10 5 5 6 3 3 C1 0 4 -2 6 0'/>`;
  for(let k = 0; k < 7; k++){ sp(3, 8 + k*19, .9, 90); sp(97, 14 + k*19, .9, -90); } for(let k = 0; k < 5; k++){ sp(10 + k*20, 3, .9, 0); sp(14 + k*20, 137, .9, 180); }
  return `<g fill='none' stroke='#e2a95a' stroke-width='1.1' stroke-linecap='round'>${g}</g><rect x='5.5' y='5.5' width='89' height='129' rx='5' fill='none' stroke='#3fa39a' stroke-width='.8' stroke-opacity='.8'/>`; })()));
const SEAL = svgUrl(SVG(`<rect x='3' y='3' width='34' height='34' rx='4' fill='#c8231e'/><g fill='none' stroke='#fbe7d6' stroke-width='2.4' stroke-linecap='square'><path d='M11 10v20M11 20h8M19 10v20M25 11h7M28.5 11v19M25 30h7'/></g>`, '0 0 40 40', 'xMidYMid meet'));
const MOUNTAINS = svgUrl(SVG(`<path d='M0 140 L0 112 L14 98 L22 106 L36 86 L50 104 L60 96 L74 110 L86 92 L100 106 L100 140z' fill='#2a2a33' fill-opacity='.35'/><path d='M0 140 L0 124 L18 112 L30 120 L44 108 L58 122 L72 114 L88 124 L100 118 L100 140z' fill='#1a1a22' fill-opacity='.45'/>`));
const STROKE = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60' preserveAspectRatio='none'><filter id='r'><feTurbulence baseFrequency='.08 .6' numOctaves='2' seed='4'/><feDisplacementMap in='SourceGraphic' scale='9'/></filter><path filter='url(#r)' d='M6 34 C40 14 90 18 130 26 S180 40 196 30 L194 40 C160 52 120 40 80 38 S20 50 8 44z' fill='#121218' fill-opacity='.8'/></svg>`);
const STAMP = svgUrl(SVG(`<g transform='rotate(-14 50 30)'><rect x='6' y='14' width='88' height='32' rx='3' fill='none' stroke='#c41e1e' stroke-width='3'/><text x='50' y='37' text-anchor='middle' font-family='Arial Black, Arial, sans-serif' font-weight='900' font-size='17' fill='#c41e1e' letter-spacing='1'>TOP SECRET</text></g>`, '0 0 100 60', 'xMidYMid meet'));
const CLIP = svgUrl(SVG(`<path d='M10 2 v26 a6 6 0 0 0 12 0 v-22 a4 4 0 0 0 -8 0 v20' fill='none' stroke='#b9bec6' stroke-width='2.2' stroke-linecap='round'/>`, '0 0 30 40', 'xMidYMid meet'));
const GRASS = svgUrl(SVG((()=>{ let p = ''; for(let k = 0; k < 34; k++){ const x = k*3.1 + hr(k, 1)*2, h = 5 + hr(k, 2)*9; p += `M${f1(x)} 140 Q${f1(x + (hr(k, 3) - .5)*6)} ${f1(140 - h*.6)} ${f1(x + (hr(k, 4) - .5)*8)} ${f1(140 - h)}`; } return `<path d='${p}' fill='none' stroke='#0d1f12' stroke-width='1.6'/>`; })()));
const BOLT = svgUrl(SVG(`<path d='M58 0 L44 44 L56 46 L38 92 L50 94 L30 140' fill='none' stroke='#e8f4ff' stroke-width='2.2' stroke-linejoin='bevel'/><path d='M44 44 L28 62 M38 92 L58 110' fill='none' stroke='#cfe6ff' stroke-width='1.2'/>`));
const DROPS = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='70' height='90' viewBox='0 0 70 90'>${Array.from({length:14}, (_, k)=>{ const x = hr(k, 7)*70, y = hr(k, 8)*90, r = 1.2 + hr(k, 9)*2.6; return `<circle cx='${f1(x)}' cy='${f1(y)}' r='${f1(r)}' fill='rgba(200,225,255,.28)' stroke='rgba(255,255,255,.8)' stroke-width='.7'/><path d='M${f1(x - r*.6)} ${f1(y + r*.5)} a${f1(r)} ${f1(r)} 0 0 0 ${f1(r*1.2)} 0' fill='none' stroke='rgba(20,40,70,.5)' stroke-width='.6'/><circle cx='${f1(x - r*.35)}' cy='${f1(y - r*.35)}' r='${f1(r*.32)}' fill='#fff' fill-opacity='.95'/>`; }).join('')}</svg>`);
const DUNES = svgUrl(SVG(`<path d='M0 140 L0 110 Q20 98 40 108 T80 104 T100 100 L100 140z' fill='#c8862e' fill-opacity='.35'/><path d='M0 140 L0 124 Q26 112 52 122 T100 116 L100 140z' fill='#8a5418' fill-opacity='.4'/>`));
const CONSTELLATION = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140' preserveAspectRatio='none'><style>path{stroke-dasharray:160; stroke-dashoffset:160; animation:d 7s ease-in-out infinite;} @keyframes d{0%,10%{stroke-dashoffset:160;} 55%,85%{stroke-dashoffset:0;} 100%{stroke-dashoffset:-160;}}</style><path d='M22 30 L40 22 L58 34 L74 26 L80 52 L60 70 L66 98 L44 112 L30 92 L40 70 L22 58 Z M58 34 L60 70' fill='none' stroke='#cfe3ff' stroke-width='.7' stroke-opacity='.85'/></svg>`);
const CONST_STARS = [[22, 30], [40, 22], [58, 34], [74, 26], [80, 52], [60, 70], [66, 98], [44, 112], [30, 92], [40, 70], [22, 58]];
const THREADS = svgUrl(SVG(`<path d='${threadPath('myc', 6)}' fill='none' stroke='#9ff7ff' stroke-width='.7' stroke-linecap='round' stroke-opacity='.9'/>`));
const CIRCUIT_DIM = svgUrl(circuitSVG('ant', '#58701e', 1.1)), CIRCUIT_LIT = svgUrl(circuitSVG('ant', '#d8ff3a', 1.3));
const GLASS_JEWEL = ['#b3122f', '#1d4fb8', '#1d8a45', '#e0a21a', '#6b2aa8', '#0f8f9a'], GLASS_SUN = ['#e3197a', '#14c4c4', '#8fd61c', '#ff8a1a', '#3b2fd0', '#ffd21a'];
const GLASS_PANES = svgUrl(glassSVG('cathedral', GLASS_JEWEL, true)), GLASS_LEAD = svgUrl(glassSVG('cathedral', GLASS_JEWEL, false));
const SUN_PANES = svgUrl(glassSVG('sun', GLASS_SUN, true, true)), SUN_LEAD = svgUrl(glassSVG('sun', GLASS_SUN, false, true));
const VINES = svgUrl(vineSVG());
const HEX_CELLS = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%23fff' fill-opacity='.9' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/svg%3E")`;
const RAINBOW = 'repeating-linear-gradient(115deg, hsl(0 95% 62%) 0%, hsl(45 95% 60%) 6%, hsl(120 85% 58%) 12%, hsl(190 95% 60%) 18%, hsl(260 90% 68%) 24%, hsl(320 95% 65%) 30%, hsl(360 95% 62%) 36%)';
const BORDER_MASK = `-webkit-mask-image:linear-gradient(#000 0 0), linear-gradient(#000 0 0); -webkit-mask-clip:content-box, border-box; -webkit-mask-composite:xor; mask-image:linear-gradient(#000 0 0), linear-gradient(#000 0 0); mask-clip:content-box, border-box; mask-composite:exclude; box-sizing:border-box;`;
const CORNER_MASK = `-webkit-mask-image:radial-gradient(circle at 0 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 8%)), radial-gradient(circle at 100% 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 8%)), radial-gradient(circle at 0 0, #000 calc(var(--fxd-g)*.7), transparent calc(var(--fxd-g)*.7 + 8%)), radial-gradient(circle at 100% 0, #000 calc(var(--fxd-g)*.7), transparent calc(var(--fxd-g)*.7 + 8%));
  mask-image:radial-gradient(circle at 0 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 8%)), radial-gradient(circle at 100% 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 8%)), radial-gradient(circle at 0 0, #000 calc(var(--fxd-g)*.7), transparent calc(var(--fxd-g)*.7 + 8%)), radial-gradient(circle at 100% 0, #000 calc(var(--fxd-g)*.7), transparent calc(var(--fxd-g)*.7 + 8%));`;
// Particle presets: n bits, each with --x/--y (%), --d (s), --dl (negative delay), --s (scale), --sx (sway px), --r, --h.
// `p` gives (lo, hi) ranges for duration and y; `at` pins positions (constellation stars, blooms).
const FOILS = {
  // ---- fire & earth ----
  ember:{label:'Ember crackle', theme:'Ashen Spurn / volcanic: cracks glow and breathe under the art, sparks rise', n:8, d:[2.6, 4.4], y:[100, 100], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at var(--hx) var(--hy), rgba(255,180,70,.6), transparent 45%), linear-gradient(180deg, rgba(40,8,0,.1), rgba(110,24,0,.4)); mix-blend-mode:hard-light; opacity:.5;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(255,120,40,.75), inset 0 -18px 22px -10px rgba(255,80,10,.5), 0 0 10px rgba(255,90,20,.3);}
    ${S} .fxd-ffx::before{background-image:${CRACKS_EMBER}; background-size:100% 100%; mix-blend-mode:screen; filter:drop-shadow(0 0 2px #ff7a1a) drop-shadow(0 0 4px rgba(255,80,0,.7)); animation:fxdBreathe 2.6s ease-in-out infinite;}
    ${S}.holo-active .fxd-ffx::before{animation-duration:1.1s;}
    ${S} .fxd-ffx i{width:3px; height:3px; border-radius:50%; background:#ffe0a0; box-shadow:0 0 4px 1px #ff7a1a; top:auto; bottom:-4px; opacity:0; animation:fxdRise var(--d) linear infinite; animation-delay:var(--dl);}`},
  volcanic:{label:'Volcanic glass', theme:'Obsidian with a molten rim of light that follows the tilt; ash drifts down', n:10, d:[4, 7], y:[-6, -2], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(10,6,6,0) 0%, rgba(20,10,10,.6) 30%, #ff6a10 43%, #ffe0a0 46.5%, #ff4a08 50%, rgba(20,10,10,.6) 62%, rgba(10,6,6,0) 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:hard-light; opacity:.62;}
    ${S} .holo-layer::before{background:linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,0) 45%, rgba(70,12,0,.5)); mix-blend-mode:multiply;}
    ${S}{box-shadow:inset 0 0 0 2px #2a1410, inset 0 0 0 3.5px rgba(255,110,30,.6), 0 0 10px rgba(255,90,20,.35);}
    ${S} .fxd-ffx i{width:2.5px; height:2.5px; border-radius:40%; background:#a59a94; --o:.7; animation:fxdFall var(--d) linear infinite; animation-delay:var(--dl);}`},
  brimstone:{label:'Brimstone', theme:'Daemonic: red-hot cracks in black stone, pulsing, ash flecks', n:8, d:[4, 7], y:[-6, -2], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at var(--hx) var(--hy), rgba(255,40,20,.55), transparent 50%), linear-gradient(180deg, rgba(0,0,0,.55), rgba(40,0,0,.45)); mix-blend-mode:multiply; opacity:.75;}
    ${S}{box-shadow:inset 0 0 0 2px #1a0606, inset 0 0 0 3px rgba(200,20,10,.7), 0 0 12px rgba(200,10,0,.4);}
    ${S} .fxd-ffx::before{background-image:${CRACKS_BRIM}; background-size:100% 100%; mix-blend-mode:screen; filter:drop-shadow(0 0 3px #ff2a10); animation:fxdBreathe 1.8s ease-in-out infinite;}
    ${S} .fxd-ffx i{width:3px; height:2px; background:#5a4a48; --o:.8; animation:fxdFall var(--d) linear infinite; animation-delay:var(--dl);}`},
  hellfire:{label:'Hellfire border', theme:'Daemonic: red flame licks round the border', n:7, d:[1.6, 2.6], y:[100, 100], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(ellipse at 50% 120%, rgba(255,60,10,.6), transparent 60%); mix-blend-mode:hard-light; opacity:.55;}
    ${S}{box-shadow:inset 0 0 14px rgba(255,40,0,.55), 0 0 12px rgba(255,50,0,.45);}
    ${S} .fxd-ffx::before{padding:9%; ${BORDER_MASK} background-image:${noise('.09 .03', 3, 7, '0 0 0 0 1  0 0 0 0 .78  0 0 0 0 .3  6 0 0 0 -3.3', 'fractalNoise', 160)}, ${noise('.08 .025', 3, 7, '0 0 0 0 1  0 0 0 0 .32  0 0 0 0 .04  5 0 0 0 -2.2', 'fractalNoise', 160)}; background-size:120px 160px, 120px 160px; background-repeat:repeat; animation:fxdFlame 4.2s linear infinite; filter:drop-shadow(0 0 2px #ff4a10);}
    @keyframes fxdFlame{to{background-position:0 -480px, 0 0;}}
    ${S} .fxd-ffx i{width:3px; height:3px; border-radius:50%; background:#ffcc66; box-shadow:0 0 4px #ff4a10; bottom:2px; top:auto; opacity:0; animation:fxdRise var(--d) ease-out infinite; animation-delay:var(--dl);}`},
  blackflame:{label:'Black flame', theme:'Daemonic: violet-black fire round the border, red embers', n:7, d:[1.8, 2.8], y:[100, 100], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(ellipse at 50% 120%, rgba(60,0,40,.7), transparent 65%), linear-gradient(180deg, rgba(10,0,10,.35), rgba(10,0,10,0) 50%); mix-blend-mode:multiply; opacity:.8;}
    ${S}{box-shadow:inset 0 0 14px rgba(60,0,60,.7), 0 0 12px rgba(120,0,40,.45);}
    ${S} .fxd-ffx::before{padding:9%; ${BORDER_MASK} background-image:${noise('.09 .03', 3, 11, '0 0 0 0 .05  0 0 0 0 0  0 0 0 0 .06  7 0 0 0 -3.5', 'fractalNoise', 160)}, ${noise('.08 .025', 3, 11, '0 0 0 0 .7  0 0 0 0 .02  0 0 0 0 .12  5 0 0 0 -2.1', 'fractalNoise', 160)}; background-size:120px 160px, 120px 160px; background-repeat:repeat; animation:fxdFlame 4.8s linear infinite; filter:drop-shadow(0 0 2px rgba(255,20,60,.8));}
    ${S} .fxd-ffx i{width:2.5px; height:2.5px; border-radius:50%; background:#ff3a2a; box-shadow:0 0 4px #ff0020; bottom:3px; top:auto; opacity:0; animation:fxdRise var(--d) ease-out infinite; animation-delay:var(--dl);}`},
  // ---- water & weather ----
  caustics:{label:'Tide caustics', theme:'River / reef: water light dances across the card', n:0, css:S=>`
    ${S} .holo-layer{background-image:${contour('.028', 5, 180, [.85, 1, 1])}, ${contour('.022', 9, 220, [.6, .95, 1], '0 0 0 .8 0 0 0 0 .6 0 0 0')}, linear-gradient(180deg, rgba(40,170,210,.3), rgba(10,60,130,.4));
      background-size:180px 180px, 220px 220px, 100% 100%; mix-blend-mode:screen; opacity:.45; animation:fxdCaustic 10s linear infinite;}
    @keyframes fxdCaustic{to{background-position:180px 90px, -220px 110px, 0 0;}}
    ${S}{box-shadow:inset 0 0 0 2px rgba(120,220,255,.65), 0 0 10px rgba(60,180,230,.3);}
    ${S} .holo-glare{background:radial-gradient(circle at var(--hx) var(--hy), rgba(210,250,255,.75), transparent 50%);}`},
  tideshimmer:{label:'Tide shimmer', theme:'Otter river: rippling teal bands slide over the art, brighter where the light falls', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, hsl(175 80% 42%), hsl(195 90% 62%) 30%, hsl(160 70% 52%) 60%, hsl(205 85% 58%)); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:color-dodge; opacity:.36;
      -webkit-mask-image:radial-gradient(ellipse 90% 70% at var(--hx) var(--hy), #000, rgba(0,0,0,.35)); mask-image:radial-gradient(ellipse 90% 70% at var(--hx) var(--hy), #000, rgba(0,0,0,.35));}
    ${S} .fxd-ffx::before{background-image:${WAVES}, ${WAVES}; background-size:60px 14px, 44px 11px; background-repeat:repeat; background-position:0 0, 20px 6px; opacity:.55; mix-blend-mode:overlay; animation:fxdTide 4s linear infinite;
      -webkit-mask-image:linear-gradient(180deg, transparent 4%, #000 30%, #000 70%, transparent 96%); mask-image:linear-gradient(180deg, transparent 4%, #000 30%, #000 70%, transparent 96%);}
    @keyframes fxdTide{to{background-position:60px 0, -44px 6px;}}
    ${S}{box-shadow:inset 0 0 0 2px rgba(80,210,200,.65), 0 0 8px rgba(60,200,200,.3);}`},
  rainglass:{label:'Rain on glass', theme:'Storms: droplets bead on the card and runs streak down', n:7, d:[1.2, 2.4], y:[-20, 30], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(60,80,110,.35), rgba(20,30,50,.25)); mix-blend-mode:multiply; opacity:.8;}
    ${S} .fxd-ffx::before{background-image:${DROPS}; background-size:70px 90px; background-repeat:repeat; background-position:calc(var(--hbx) * .08) calc(var(--hby) * .08); opacity:.95;}
    ${S} .fxd-ffx::after{background:radial-gradient(circle at var(--hx) var(--hy), rgba(220,240,255,.35), transparent 40%); mix-blend-mode:screen;}
    ${S} .fxd-ffx i{width:1.6px; height:16cqh; border-radius:2px; background:linear-gradient(180deg, rgba(255,255,255,0), rgba(230,245,255,.75) 80%, #fff); opacity:0; animation:fxdStreak var(--d) cubic-bezier(.5,0,.9,.6) infinite; animation-delay:var(--dl);}
    @keyframes fxdStreak{0%{transform:translateY(0); opacity:0;} 15%{opacity:.85;} 100%{transform:translateY(120cqh); opacity:.2;}}`},
  storm:{label:'Storm', theme:'Lightning forks across behind the art every few seconds', n:0, css:S=>`
    ${S} .holo-layer{background-image:${noise('.018 .03', 3, 17, '0 0 0 0 .16  0 0 0 0 .2  0 0 0 0 .3  0 0 0 -2 1.5', 'fractalNoise', 220)}, linear-gradient(180deg, rgba(30,40,70,.6), rgba(40,50,80,.25) 60%, rgba(0,0,0,0)); background-size:220px 220px, 100% 100%; mix-blend-mode:multiply; opacity:.85; animation:fxdStormDim 5s steps(1) infinite, fxdClouds 16s linear infinite;}
    @keyframes fxdClouds{to{background-position:220px 0, 0 0;}}
    ${S} .holo-layer::after{background:radial-gradient(ellipse at 55% 20%, rgba(220,235,255,.95), rgba(160,190,255,.3) 50%, transparent 75%); mix-blend-mode:screen; opacity:0; animation:fxdFlash 5s linear infinite;}
    ${S} .fxd-ffx::before{background-image:${BOLT}; background-size:100% 100%; opacity:0; filter:drop-shadow(0 0 3px #9fd0ff) drop-shadow(0 0 7px #5aa0ff); animation:fxdFlash 5s linear infinite;}
    @keyframes fxdFlash{0%,86%{opacity:0;} 87%{opacity:1;} 88.5%{opacity:.15;} 89.5%{opacity:.95;} 93%,100%{opacity:0;}}
    @keyframes fxdStormDim{0%,86%{opacity:.85;} 87%{opacity:.25;} 93%{opacity:.85;}}
    ${S}{box-shadow:inset 0 0 0 2px rgba(150,180,230,.55);}`},
  // ---- light & sky ----
  firefly:{label:'Firefly night', theme:'Dusk sheen; fireflies wander and blink over the art', n:9, d:[3, 6], y:[12, 80], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(8,16,48,.62), rgba(10,20,50,.38) 65%, rgba(10,20,50,.1)); mix-blend-mode:multiply; opacity:.85;}
    ${S} .holo-glare{background:radial-gradient(circle at var(--hx) var(--hy), rgba(200,220,255,.35), transparent 45%);}
    ${S} .fxd-ffx i{width:4px; height:4px; border-radius:50%; background:#f4ffb0; box-shadow:0 0 5px 2px rgba(210,255,90,.85), 0 0 12px 4px rgba(180,240,60,.35); opacity:0;
      animation:fxdBlink calc(var(--d)*.55) ease-in-out infinite, fxdWander var(--d) ease-in-out infinite; animation-delay:var(--dl), var(--dl);}`},
  meadow:{label:'Firefly meadow', theme:'Fireflies lift off a dark grass edge into a moonlit sky', n:9, d:[4, 7], y:[78, 96], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at 82% 12%, rgba(255,250,220,.55), transparent 22%), linear-gradient(180deg, rgba(20,30,70,.5), rgba(20,30,60,.15) 70%); mix-blend-mode:hard-light; opacity:.7;}
    ${S} .fxd-ffx::before{background-image:${GRASS}; background-size:100% 100%; opacity:.6;}
    ${S} .fxd-ffx i{width:3.5px; height:3.5px; border-radius:50%; background:#fbffc0; box-shadow:0 0 5px 2px rgba(220,255,100,.85); --o:1; opacity:0;
      animation:fxdDrift var(--d) ease-in-out infinite, fxdBlink calc(var(--d)*.4) ease-in-out infinite; animation-delay:var(--dl), var(--dl);}`},
  moonphase:{label:'Moon phase', theme:'A moon crosses the top of the card through its phases', n:1, at:[[8, 6]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(20,30,80,.5), rgba(20,30,80,0) 55%), linear-gradient(115deg, #b8c4dc, #f4f7ff 30%, #8f9bb6 50%, #eef2fb 70%, #a8b4cc); background-size:100% 100%, 300% 300%; background-position:0 0, var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx i{width:24cqw; height:24cqw; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 38% 36%, #fffef5, #e6e8f0 45%, #b9bccb 75%); box-shadow:0 0 10px 3px rgba(240,245,255,.55); animation:fxdMoonPath 14s ease-in-out infinite;}
    ${S} .fxd-ffx i::before{content:''; position:absolute; inset:-2%; border-radius:50%; background:rgba(14,18,40,.88); animation:fxdMoonShade 14s linear infinite;}
    @keyframes fxdMoonPath{0%{transform:translate(0, 18cqh); opacity:0;} 8%{opacity:1;} 50%{transform:translate(32cqw, 0);} 92%{opacity:1;} 100%{transform:translate(64cqw, 18cqh); opacity:0;}}
    @keyframes fxdMoonShade{0%{transform:translateX(0);} 100%{transform:translateX(-200%);}}`},
  moonsilver:{label:'Moonlit silver', theme:'Cool silver sheen; a crescent glints at the top', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, #8a94aa 0%, #eef2fb 26%, #ffffff 34%, #a8b0c4 48%, #e6ebf6 64%, #ffffff 72%, #7c869c 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(220,228,245,.85), 0 0 10px rgba(200,210,255,.35);}
    ${S} .fxd-ffx::before{left:40%; right:40%; top:3%; bottom:auto; height:14cqw; border-radius:50%; box-shadow:inset 5px -2px 0 1.5px #f4f7ff; filter:drop-shadow(0 0 4px #fff); animation:fxdBreathe 3s ease-in-out infinite;}`},
  constellation:{label:'Constellation', theme:'Stars join up into a figure, hold, then let go', n:11, at:CONST_STARS.map(p=> [p[0], p[1]/1.4]), d:[2, 3.4], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(10,20,70,.55), rgba(20,10,60,.35)); mix-blend-mode:multiply; opacity:.75;}
    ${S} .fxd-ffx::before{background-image:${CONSTELLATION}; background-size:100% 100%; filter:drop-shadow(0 0 2px #9fc4ff);}
    ${S} .fxd-ffx i{width:5px; height:5px; margin:-2.5px; background:radial-gradient(circle, #fff 0 1px, rgba(190,215,255,.9) 1.4px, transparent 2.6px); filter:drop-shadow(0 0 3px #b8d4ff); animation:fxdTwinkle var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  zodiac:{label:'Zodiac wheel', theme:'A slow wheel of star marks turns behind the art', n:10, d:[1.6, 3], y:[5, 95], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(10,16,60,.5), rgba(30,10,60,.3)); mix-blend-mode:multiply; opacity:.7;}
    ${S} .fxd-ffx::before{inset:auto; left:-15cqw; top:calc(50cqh - 65cqw); width:130cqw; height:130cqw; border-radius:50%;
      background:repeating-conic-gradient(from 0deg, rgba(220,230,255,.85) 0deg 1.2deg, transparent 1.2deg 15deg), repeating-conic-gradient(from 7deg, rgba(255,220,150,.6) 0deg .6deg, transparent .6deg 5deg);
      -webkit-mask-image:radial-gradient(circle, transparent 54%, #000 55%, #000 59%, transparent 60%, transparent 63%, #000 64%, #000 65%, transparent 66%); mask-image:radial-gradient(circle, transparent 54%, #000 55%, #000 59%, transparent 60%, transparent 63%, #000 64%, #000 65%, transparent 66%);
      animation:fxdSpin 40s linear infinite; filter:drop-shadow(0 0 2px #b8ccff); opacity:.8;}
    ${S} .fxd-ffx i{width:3px; height:3px; border-radius:50%; background:#fff; animation:fxdTwinkle var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  borealis:{label:'Aurora borealis rays', theme:'Tall ray curtains sway over a starry sky (northern Tundra)', n:8, d:[1.8, 3.2], y:[3, 30], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(5,15,40,.55), rgba(5,15,40,.1) 70%); mix-blend-mode:multiply; opacity:.8;}
    ${S} .fxd-ffx::before{inset:-6% -20% 30%; background:repeating-linear-gradient(90deg, rgba(120,255,190,0) 0 3px, rgba(120,255,190,.55) 4px, rgba(140,255,220,.15) 6px, rgba(120,255,190,0) 8px 11px), linear-gradient(180deg, rgba(190,120,255,.6), rgba(90,255,170,.5) 45%, rgba(90,255,170,0));
      -webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 40%, #000 30%, transparent 70%); mask-image:radial-gradient(ellipse 60% 55% at 50% 40%, #000 30%, transparent 70%);
      mix-blend-mode:screen; filter:blur(.6px); animation:fxdCurtain 7s ease-in-out infinite alternate; transform-origin:50% 0;}
    @keyframes fxdCurtain{0%{transform:skewX(-14deg) translateX(-6%) scaleY(.92);} 100%{transform:skewX(12deg) translateX(8%) scaleY(1.06);}}
    ${S} .fxd-ffx i{width:2.5px; height:2.5px; border-radius:50%; background:#fff; animation:fxdTwinkle var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  // ---- growing things ----
  bramble:{label:'Bramble vine', theme:'Thorny vines grow in from the corners and bloom, then wither back', n:5, at:[[10, 56], [86, 50], [30, 6], [70, 7], [50, 95]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(60,120,40,0), rgba(140,210,100,.4) 40%, rgba(255,190,215,.3) 55%, rgba(60,120,40,0)); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx::before{background-image:${VINES}; background-size:100% 100%; ${CORNER_MASK} animation:fxdGrowCorners 9s ease-in-out infinite; filter:drop-shadow(0 1px 1px rgba(0,0,0,.6));}
    ${S} .fxd-ffx i{width:11px; height:11px; margin:-5.5px; border-radius:50%; background:radial-gradient(circle, #ffe9a8 0 15%, #ff7aa0 18% 42%, #c22d5c 46% 62%, transparent 66%); filter:drop-shadow(0 0 2px rgba(255,120,160,.8)); --s:1; animation:fxdBloom 9s ease-in-out infinite;}
    ${S} .fxd-ffx i:nth-child(2){animation-delay:.3s;} ${S} .fxd-ffx i:nth-child(3){animation-delay:.6s;} ${S} .fxd-ffx i:nth-child(4){animation-delay:.5s;} ${S} .fxd-ffx i:nth-child(5){animation-delay:.2s;}`},
  pollen:{label:'Pollen drift', theme:'Meadows: warm sheen, golden pollen motes drift up through the light', n:16, d:[4, 8], y:[40, 110], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(255,220,90,0), rgba(255,236,140,.6) 35%, rgba(200,240,120,.4) 50%, rgba(255,220,90,0) 70%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx i{width:3.5px; height:3.5px; border-radius:50%; background:radial-gradient(circle, #fff6c0, #f2c230 60%, rgba(242,194,48,0)); box-shadow:0 0 5px rgba(255,214,90,.75); --o:.95; opacity:0; animation:fxdDrift var(--d) ease-in-out infinite; animation-delay:var(--dl);}
    ${S} .fxd-ffx i:nth-child(4n){width:8px; height:8px; filter:blur(1.5px); --o:.5;}`},
  autumn:{label:'Autumn leaf', theme:'Gold and russet leaves drift down the card', n:13, d:[4, 7], y:[-10, -4], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, #7a3a10 0%, #ffcf6a 25%, #fff0c0 34%, #d8742a 48%, #ffd27a 62%, #8a4212 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.8;}
    ${S} .fxd-ffx i{width:13px; height:9px; border-radius:0 80% 0 80%; background:linear-gradient(135deg, hsl(calc(32 + var(--h,0)*1deg) 95% 60%), hsl(calc(12 + var(--h,0)*1deg) 88% 40%)); box-shadow:inset 0 0 0 .75px rgba(80,30,0,.6), 0 1px 2px rgba(0,0,0,.35); /* 2026-10-15: bigger, so they read at board size */ --o:.95; --r:300deg; opacity:0; animation:fxdFall var(--d) linear infinite; animation-delay:var(--dl);}`},
  ginkgo:{label:'Ginkgo gold', theme:'Big fan-shaped gold leaves fall slowly over a strong gold sheen', n:6, d:[7, 11], y:[-12, -6], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, #6d4810 0%, #f6d77a 26%, #fff6cf 36%, #c9952a 50%, #f6d77a 64%, #fff2c0 74%, #6d4810 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;}
    ${S} .fxd-ffx i{width:14px; height:12px; border-radius:90% 90% 10% 10% / 100% 100% 10% 10%; background:radial-gradient(ellipse at 50% 100%, #b07a10 0 8%, #ffd84a 12%, #ffe58a 60%, #e0a820); clip-path:polygon(0 30%, 50% 100%, 100% 30%, 80% 0, 60% 10%, 50% 0, 40% 10%, 20% 0); --o:.95; --r:200deg; opacity:0; animation:fxdFall var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  mycelium:{label:'Mycelium', theme:'Glowing fungal threads spread up over the art (Morel Hollow)', n:0, css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(ellipse at 50% 110%, rgba(80,255,240,.45), transparent 60%); mix-blend-mode:screen; opacity:.6;}
    ${S} .fxd-ffx::before{background-image:${THREADS}; background-size:100% 100%; filter:drop-shadow(0 0 2px #6ff) drop-shadow(0 0 4px rgba(80,220,255,.6));
      -webkit-mask-image:radial-gradient(ellipse 120% 100% at 50% 105%, #000 calc(var(--fxd-g) + 20%), transparent calc(var(--fxd-g) + 32%)); mask-image:radial-gradient(ellipse 120% 100% at 50% 105%, #000 calc(var(--fxd-g) + 20%), transparent calc(var(--fxd-g) + 32%)); animation:fxdGrowCorners 10s ease-in-out infinite;}`},
  spores:{label:'Spore glow', theme:'Soft teal-violet spores float up from below', n:14, d:[5, 9], y:[70, 105], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(ellipse at 50% 110%, rgba(150,90,255,.45), transparent 55%), linear-gradient(115deg, rgba(60,220,200,0), rgba(60,220,200,.35) 45%, rgba(60,220,200,0) 70%); background-size:100% 100%, 300% 300%; background-position:0 0, var(--hbx) var(--hby); mix-blend-mode:screen; opacity:.65;}
    ${S} .fxd-ffx i{width:4px; height:4px; border-radius:50%; background:radial-gradient(circle, #fff, hsl(calc(175 + var(--h,0)*1.4deg) 90% 65%) 55%, transparent 70%); box-shadow:0 0 6px hsl(calc(175 + var(--h,0)*1.4deg) 90% 60%); --o:.85; opacity:0; animation:fxdDrift var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  biolum:{label:'Bioluminescent', theme:'Abyssal teal dots pulse in the dark', n:16, d:[1.8, 3.6], y:[6, 92], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(0,20,40,.6), rgba(0,30,50,.45)); mix-blend-mode:multiply; opacity:.85;}
    ${S} .fxd-ffx i{width:3px; height:3px; border-radius:50%; background:#c8fff6; box-shadow:0 0 5px 2px rgba(40,240,220,.8), 0 0 12px 4px rgba(40,200,255,.3); animation:fxdTwinkle var(--d) ease-in-out infinite, fxdWander calc(var(--d)*3) ease-in-out infinite; animation-delay:var(--dl), var(--dl);}`},
  jelly:{label:'Jellyfish drift', theme:'Two glowing jellyfish pulse up through deep water', n:2, at:[[22, 80], [64, 96]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(0,20,50,.55), rgba(0,40,70,.35)); mix-blend-mode:multiply; opacity:.8;}
    ${S} .fxd-ffx i{width:15px; height:22px; background:radial-gradient(ellipse 50% 40% at 50% 34%, rgba(230,200,255,.95), rgba(170,110,255,.55) 70%, transparent 72%), repeating-linear-gradient(90deg, transparent 0 2px, rgba(200,160,255,.55) 2px 3px) 50% 100%/70% 55% no-repeat;
      filter:drop-shadow(0 0 4px rgba(190,140,255,.9)); animation:fxdJelly 9s linear infinite, fxdPulse 1.4s ease-in-out infinite;}
    ${S} .fxd-ffx i:nth-child(2){animation-delay:-4.5s, -.5s; transform:scale(.8);}
    @keyframes fxdJelly{0%{translate:0 0; opacity:0;} 10%{opacity:.95;} 85%{opacity:.95;} 100%{translate:8px -110cqh; opacity:0;}}
    @keyframes fxdPulse{0%,100%{scale:1 1;} 50%{scale:1.12 .86;}}`},
  // ---- the peoples ----
  feather:{label:'Hummingbird iridescence', theme:'Sunfeather Tribes: feather barbs shift green to violet as the card tilts', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, hsl(150 90% 45%), hsl(185 95% 50%) 25%, hsl(265 85% 62%) 50%, hsl(320 85% 60%) 65%, hsl(150 90% 45%)); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:color-dodge; opacity:.5;}
    ${S} .holo-layer::before{right:50%; background:repeating-linear-gradient(62deg, rgba(0,0,0,.6) 0 1px, transparent 1px 3.4px); border-radius:0;}
    ${S} .holo-layer::after{left:50%; background:repeating-linear-gradient(-62deg, rgba(0,0,0,.6) 0 1px, transparent 1px 3.4px); border-radius:0;}
    ${S} .fxd-ffx::before{left:calc(50% - 1px); right:calc(50% - 1px); background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.55) 30%, rgba(255,255,255,.2)); mix-blend-mode:overlay; border-radius:0;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(80,230,170,.6), 0 0 10px rgba(150,90,255,.3);}`},
  jewelscale:{label:'Jewel feather fringe', theme:'Scalloped breast feathers that flash jewel colours', n:0, css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at 50% 100%, transparent 52%, rgba(255,255,255,.8) 57%, rgba(255,255,255,0) 66%), radial-gradient(circle at 50% 100%, transparent 52%, rgba(255,255,255,.8) 57%, rgba(255,255,255,0) 66%), linear-gradient(115deg, hsl(330 90% 60%), hsl(170 90% 50%) 30%, hsl(95 90% 52%) 55%, hsl(280 85% 64%) 80%);
      background-size:14px 10px, 14px 10px, 300% 300%; background-position:0 0, 7px 5px, var(--hbx) var(--hby); mix-blend-mode:color-dodge; opacity:.45;
      -webkit-mask-image:radial-gradient(ellipse 85% 75% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.15)); mask-image:radial-gradient(ellipse 85% 75% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.15));}`},
  stainedglass:{label:'Stained glass', theme:'Ecclesia: lead lines, light through jewel panes where the light falls', n:0, css:S=>`
    ${S} .holo-layer{background-image:${GLASS_PANES}; background-size:100% 100%; mix-blend-mode:overlay; opacity:.75;
      -webkit-mask-image:radial-gradient(ellipse 80% 65% at var(--hx) var(--hy), #000, rgba(0,0,0,.4) 70%); mask-image:radial-gradient(ellipse 80% 65% at var(--hx) var(--hy), #000, rgba(0,0,0,.4) 70%);}
    ${S} .fxd-ffx::before{background-image:${GLASS_LEAD}; background-size:100% 100%; opacity:.42;}
    ${S} .holo-glare{background:radial-gradient(circle at var(--hx) var(--hy), rgba(255,250,230,.7), transparent 40%);}
    ${S}{box-shadow:inset 0 0 0 2.5px #1c140c, 0 0 8px rgba(255,220,140,.25);}`},
  sunfeather:{label:'Sunfeather tribes glass', theme:'Hummingbird colour tribes: a fan of feather panes in magenta, turquoise, lime and sun-orange', n:0, css:S=>`
    ${S} .holo-layer{background-image:${SUN_PANES}; background-size:100% 100%; mix-blend-mode:overlay; opacity:.8;
      -webkit-mask-image:radial-gradient(ellipse 85% 70% at var(--hx) var(--hy), #000, rgba(0,0,0,.45) 70%); mask-image:radial-gradient(ellipse 85% 70% at var(--hx) var(--hy), #000, rgba(0,0,0,.45) 70%);}
    ${S} .fxd-ffx::before{background-image:${SUN_LEAD}; background-size:100% 100%; opacity:.65;}
    ${S} .fxd-ffx::after{background:conic-gradient(from 180deg at 50% 107%, transparent 0deg 60deg, rgba(255,250,200,.35) 85deg, transparent 95deg, rgba(255,250,200,.3) 120deg, transparent 135deg 360deg); mix-blend-mode:screen; animation:fxdBreathe 4s ease-in-out infinite;}`},
  bronze:{label:'Legion bronze', theme:'Rivergate otters: hammered bronze, a teal river line, the wave crest glints', n:0, css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at 35% 35%, rgba(255,240,200,.55) 0, rgba(255,240,200,0) 45%), radial-gradient(circle at 35% 35%, rgba(255,240,200,.45) 0, rgba(255,240,200,0) 45%), linear-gradient(115deg, #4a2810 0%, #c98a3e 22%, #ffe2a8 33%, #a8642a 46%, #e0a860 60%, #fff0c8 70%, #5a3214 100%);
      background-size:9px 9px, 9px 9px, 300% 300%; background-position:0 0, 4.5px 4.5px, var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;}
    ${S}{box-shadow:inset 0 0 0 2px #b8782e, inset 0 0 0 3.5px rgba(40,140,140,.55), 0 0 8px rgba(200,140,60,.3);}
    ${S} .fxd-ffx::before{background-image:${WAVE_EMBLEM}; background-size:38% auto; background-position:50% 42%; opacity:.4; mix-blend-mode:overlay;}
    ${S} .fxd-ffx::after{background-image:linear-gradient(105deg, transparent 42%, rgba(255,248,220,.75) 50%, transparent 58%); background-size:300% 100%; animation:fxdSweep 5s ease-in-out infinite; mix-blend-mode:overlay;}`},
  filigree:{label:'Bronze filigree', theme:'Otter civilisation: scrolled bronze filigree in the frame with verdigris; the art stays clean', n:0, css:S=>`
    ${S} .holo-layer{padding:7% 7% 9%; ${BORDER_MASK} background-image:linear-gradient(115deg, #5a3214, #e8b468 28%, #fff1cc 36%, #9a5e24 50%, #3e9a90 64%, #e0a860 78%, #4a2810); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:hard-light; opacity:.85;}
    ${S} .fxd-ffx::before{background-image:${FILIGREE}; background-size:100% 100%; filter:drop-shadow(0 0 1px rgba(0,0,0,.8)) drop-shadow(0 0 2px rgba(255,200,120,.4));}
    ${S}{box-shadow:inset 0 0 0 1.5px #c8893a;}`},
  honeycomb:{label:'Honeycomb (bees)', theme:'Hive: amber honey cells light up; honey drips from the top edge', n:4, at:[[16, 0], [38, 0], [63, 0], [84, 0]], css:S=>`
    ${S} .holo-layer{background-image:${HEX_CELLS}, linear-gradient(115deg, #7a4a00 0%, #ffc83a 25%, #fff0b0 35%, #e8961a 50%, #ffd45a 65%, #8a5200 100%); background-size:14px 24.5px, 300% 300%; background-position:0 0, var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;
      -webkit-mask-image:radial-gradient(ellipse 85% 75% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.6) 50%, rgba(0,0,0,.3)); mask-image:radial-gradient(ellipse 85% 75% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.6) 50%, rgba(0,0,0,.3));}
    ${S}{box-shadow:inset 0 0 0 2.5px #e8a21a, 0 0 10px rgba(255,180,40,.4);}
    ${S} .fxd-ffx i{top:-2px; width:6px; height:2px; margin-left:-3px; border-radius:0 0 5px 5px; transform-origin:50% 0; background:linear-gradient(90deg, #b06a00, #ffdc6a 45%, #f0a020 60%, #8a4a00); box-shadow:0 0 4px rgba(255,190,50,.7); animation:fxdHoney 6s ease-in infinite;}
    ${S} .fxd-ffx i:nth-child(2){animation-delay:-1.6s;} ${S} .fxd-ffx i:nth-child(3){animation-delay:-3.4s;} ${S} .fxd-ffx i:nth-child(4){animation-delay:-4.6s;}
    @keyframes fxdHoney{0%{height:2px; opacity:.95;} 70%{height:22px;} 82%{height:26px; opacity:1;} 100%{height:26px; opacity:0;}}`},
  uranium:{label:'Radioactive glow', theme:'Uranium (World 3): green pulse, geiger flicker, sickly sparks', n:9, d:[.9, 1.8], y:[8, 92], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at var(--hx) var(--hy), rgba(150,255,60,.7), rgba(60,200,30,.25) 45%, transparent 70%); mix-blend-mode:screen; opacity:.55; animation:fxdGeiger 2.2s steps(1) infinite;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(150,255,60,.7), inset 0 0 18px rgba(110,255,40,.45), 0 0 12px rgba(110,255,40,.4); animation:fxdRadPulse 2.4s ease-in-out infinite;}
    @keyframes fxdRadPulse{50%{box-shadow:inset 0 0 0 2px rgba(190,255,90,.95), inset 0 0 26px rgba(130,255,50,.6), 0 0 18px rgba(130,255,50,.6);}}
    ${S} .fxd-ffx i{width:6px; height:6px; margin:-3px; background:linear-gradient(90deg, transparent 42%, #d6ff7a 50%, transparent 58%), linear-gradient(0deg, transparent 42%, #d6ff7a 50%, transparent 58%); filter:drop-shadow(0 0 3px #7fff2a); animation:fxdBlink var(--d) steps(2) infinite; animation-delay:var(--dl);}`},
  circuit:{label:'Acid-battery circuit', theme:'Ant builders: copper traces; acid-green current runs up from a battery lamp', n:1, at:[[86, 88]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(120,90,20,0), rgba(220,180,80,.45) 40%, rgba(120,90,20,0) 60%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.8;}
    ${S} .fxd-ffx::before{background-image:${CIRCUIT_DIM}; background-size:100% 100%; opacity:.6; filter:drop-shadow(0 0 1px rgba(0,0,0,.6));}
    ${S} .fxd-ffx::after{background-image:${CIRCUIT_LIT}; background-size:100% 100%; filter:drop-shadow(0 0 2px #c6ff2a) drop-shadow(0 0 4px rgba(170,255,40,.6));
      -webkit-mask-image:linear-gradient(0deg, transparent 0%, #000 8%, #000 18%, transparent 30%); mask-image:linear-gradient(0deg, transparent 0%, #000 8%, #000 18%, transparent 30%);
      -webkit-mask-size:100% 300%; mask-size:100% 300%; -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; animation:fxdCurrent 2.6s linear infinite; opacity:.85;}
    @keyframes fxdCurrent{0%{-webkit-mask-position:0 0%; mask-position:0 0%;} 100%{-webkit-mask-position:0 100%; mask-position:0 100%;}}
    ${S} .fxd-ffx i{width:9px; height:14px; margin:-7px -4.5px; border-radius:3px 3px 2px 2px; background:linear-gradient(180deg, #e8ff9a, #a8f02a 60%, #5a8a10); box-shadow:0 0 6px 2px rgba(190,255,60,.8), inset 0 2px 0 #556b1a; animation:fxdBreathe 1.3s ease-in-out infinite;}`},
  // ---- shadows & spirits ----
  voidstatic:{label:'Void static', theme:'Void: the edges crawl with dark static and stars', n:10, d:[1.2, 2.6], y:[3, 97], css:S=>`
    ${S} .holo-layer{background-image:${noise('.9', 1, 2, '0 0 0 0 .78  0 0 0 0 .62  0 0 0 0 1  0 0 0 -1.6 1.25', 'fractalNoise', 120)}; background-size:120px 120px; mix-blend-mode:screen; opacity:.5; animation:fxdStatic .45s steps(5) infinite;
      -webkit-mask-image:radial-gradient(ellipse 70% 62% at 50% 50%, transparent 40%, #000 82%); mask-image:radial-gradient(ellipse 70% 62% at 50% 50%, transparent 40%, #000 82%);}
    @keyframes fxdStatic{0%{background-position:0 0;} 20%{background-position:-37px 21px;} 40%{background-position:53px -14px;} 60%{background-position:-11px 47px;} 80%{background-position:29px 9px;} 100%{background-position:0 0;}}
    ${S} .fxd-ffx::before{background:radial-gradient(ellipse 72% 64% at 50% 50%, transparent 52%, rgba(20,8,40,.75) 92%);}
    ${S} .fxd-ffx i{width:2.5px; height:2.5px; border-radius:50%; background:#efe6ff; box-shadow:0 0 3px #c9a8ff; animation:fxdTwinkle var(--d) ease-in-out infinite; animation-delay:var(--dl);}
    ${S}{box-shadow:inset 0 0 0 2px rgba(124,111,143,.9), 0 0 10px rgba(110,60,190,.4);}`},
  horizon:{label:'Event horizon', theme:'Void: a dark swirl at the rim and a lensing ring that follows the light', n:8, d:[2.4, 4], y:[2, 98], css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at var(--hx) var(--hy), transparent 16%, rgba(230,210,255,.8) 18%, rgba(160,120,255,.35) 21%, transparent 26%); mix-blend-mode:screen; opacity:.75;}
    ${S} .fxd-ffx::before{inset:-30%; background:conic-gradient(from 0deg, rgba(10,0,25,.85), rgba(60,20,110,.4), rgba(10,0,25,.85), rgba(90,40,160,.35), rgba(10,0,25,.85)); -webkit-mask-image:radial-gradient(circle, transparent 38%, #000 62%); mask-image:radial-gradient(circle, transparent 38%, #000 62%); animation:fxdSpin 12s linear infinite;}
    ${S} .fxd-ffx i{width:2px; height:2px; border-radius:50%; background:#fff; animation:fxdInfall var(--d) ease-in infinite; animation-delay:var(--dl);}
    @keyframes fxdInfall{0%{transform:translate(0,0) scale(1); opacity:0;} 20%{opacity:1;} 100%{transform:translate(calc((50cqw - var(--x)) * .9), calc((50cqh - var(--y)) * .9)) scale(.2); opacity:0;}}`},
  ghostmist:{label:'Ghost mist', theme:'Pale mist drifts through a cooled, half-seen card', n:0, css:S=>`
    ${S} .holo-layer{background-image:${noise('.012 .02', 3, 4, '0 0 0 0 .92  0 0 0 0 .96  0 0 0 0 1  0 0 0 -1.7 1.15', 'fractalNoise', 240)}, linear-gradient(180deg, rgba(200,220,255,.25), rgba(200,220,255,.1)); background-size:240px 240px, 100% 100%; mix-blend-mode:screen; opacity:.75; animation:fxdMist 14s linear infinite;}
    @keyframes fxdMist{to{background-position:240px -60px, 0 0;}}
    ${S} .fxd-ffx::before{background:linear-gradient(180deg, rgba(150,170,210,.18), rgba(150,170,210,.05)); mix-blend-mode:color;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(210,225,255,.55), 0 0 12px rgba(190,210,255,.35);}`},
  wisp:{label:'Will-o’-wisps', theme:'Three pale wisps trail lazy loops across the card', n:3, at:[[20, 30], [70, 55], [40, 80]], d:[5, 8], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(180deg, rgba(20,30,60,.45), rgba(20,30,60,.2)); mix-blend-mode:multiply; opacity:.7;}
    ${S} .fxd-ffx i{width:7px; height:7px; border-radius:50%; background:radial-gradient(circle, #fff, #b8e4ff 50%, rgba(140,200,255,0) 72%);
      box-shadow:0 0 8px 3px rgba(150,210,255,.7), -6px 3px 4px -1px rgba(150,210,255,.35), -12px 6px 5px -2px rgba(150,210,255,.2); animation:fxdWisp var(--d) ease-in-out infinite; animation-delay:var(--dl);}
    @keyframes fxdWisp{0%,100%{transform:translate(0,0);} 25%{transform:translate(22cqw, -10cqh);} 50%{transform:translate(8cqw, 12cqh);} 75%{transform:translate(-14cqw, 4cqh);}}`},
  // ---- ink & paper ----
  inkwash:{label:'Ink wash', theme:'Oriental painting: ink blooms bleed and settle; a red seal', n:3, at:[[22, 26], [74, 44], [40, 70]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(240,235,220,0), rgba(250,245,230,.55) 40%, rgba(240,235,220,0) 60%), ${noise('.6 .04', 2, 8, '0 0 0 0 .3  0 0 0 0 .28  0 0 0 0 .25  0 0 0 -1.2 .55', 'fractalNoise', 160)}; background-size:300% 300%, 160px 160px; background-position:var(--hbx) var(--hby), 0 0; mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx i{width:56cqw; height:56cqw; margin:-28cqw; border-radius:47% 53% 44% 56%; background:radial-gradient(circle, rgba(14,14,24,.82), rgba(14,14,24,.5) 34%, rgba(14,14,24,.16) 58%, transparent 70%); filter:blur(1.2px); animation:fxdInk 8s ease-out infinite;}
    ${S} .fxd-ffx i:nth-child(2){animation-delay:-2.7s;} ${S} .fxd-ffx i:nth-child(3){animation-delay:-5.3s;}
    @keyframes fxdInk{0%{transform:scale(.08) rotate(0deg); opacity:0;} 8%{opacity:.85;} 45%{transform:scale(.9) rotate(18deg); opacity:.6;} 80%{transform:scale(1) rotate(22deg); opacity:.4;} 100%{transform:scale(1.04) rotate(24deg); opacity:0;}}
    ${S} .fxd-ffx::after{inset:auto 7% 24% auto; width:15%; height:11%; background-image:${SEAL}; background-size:contain; background-position:center; opacity:.88; z-index:2;}`},
  sumi:{label:'Sumi brush stroke', theme:'One ink stroke paints across the card over misty mountains', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(240,235,220,0), rgba(250,245,232,.5) 40%, rgba(240,235,220,0) 60%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx::before{background-image:${MOUNTAINS}; background-size:100% 100%; mix-blend-mode:multiply;}
    ${S} .fxd-ffx::after{inset:24% -6% auto; height:34%; background-image:${STROKE}; background-size:100% 100%; mix-blend-mode:multiply;
      -webkit-mask-image:linear-gradient(90deg, #000 45%, transparent 55%); mask-image:linear-gradient(90deg, #000 45%, transparent 55%); -webkit-mask-size:240% 100%; mask-size:240% 100%; -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; animation:fxdPaint 7s ease-in-out infinite;}
    @keyframes fxdPaint{0%{-webkit-mask-position:100% 0; mask-position:100% 0; opacity:1;} 30%,78%{-webkit-mask-position:0 0; mask-position:0 0; opacity:1;} 100%{-webkit-mask-position:0 0; mask-position:0 0; opacity:0;}}`},
  redacted:{label:'Redacted', theme:'Spy set: black bars slide off to reveal the art; point at it and they all clear', n:4, at:[[12, 18], [30, 33], [8, 49], [24, 63]], css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(200,205,215,0), rgba(235,240,248,.45) 40%, rgba(200,205,215,0) 60%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx i{height:8%; width:62%; background:#0b0b0e; box-shadow:0 1px 0 rgba(255,255,255,.12); transform-origin:100% 50%; animation:fxdRedact 7s cubic-bezier(.6,0,.3,1) infinite; transition:transform .25s ease;}
    ${S} .fxd-ffx i:nth-child(2){width:52%; animation-delay:.25s;} ${S} .fxd-ffx i:nth-child(3){width:70%; animation-delay:.5s;} ${S} .fxd-ffx i:nth-child(4){width:46%; animation-delay:.75s;}
    @keyframes fxdRedact{0%,30%{transform:scaleX(1);} 42%,82%{transform:scaleX(0);} 92%,100%{transform:scaleX(1);}}
    ${S}.holo-active .fxd-ffx i{animation:none; transform:scaleX(0);}`},
  dossier:{label:'Dossier', theme:'Spy set: manila file paper, a paperclip and a TOP SECRET stamp', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, rgba(220,190,130,.45), rgba(245,225,170,.6) 40%, rgba(210,180,120,.45)), ${noise('.5', 2, 6, '0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .15  0 0 0 -1.3 .6', 'fractalNoise', 140)}; background-size:300% 300%, 140px 140px; background-position:var(--hbx) var(--hby), 0 0; mix-blend-mode:multiply; opacity:.75;}
    ${S} .fxd-ffx::before{inset:30% 4% auto; height:24%; background-image:${STAMP}; background-size:contain; background-position:center; opacity:.82; mix-blend-mode:multiply; animation:fxdStamp 6s ease-out infinite;}
    @keyframes fxdStamp{0%,6%{transform:scale(1.6); opacity:0;} 12%{transform:scale(.96); opacity:.9;} 16%,100%{transform:scale(1); opacity:.82;}}
    ${S} .fxd-ffx::after{inset:-2% auto auto 6%; width:12%; height:22%; background-image:${CLIP}; background-size:contain; filter:drop-shadow(1px 1px 0 rgba(0,0,0,.4));}`},
  // ---- dragons & pearls ----
  dragonscale:{label:'Holographic dragon scale', theme:'Supreme / dragons: overlapping scales flash rainbow where the light hits', n:0, css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at 50% 0%, transparent 50%, rgba(255,255,255,.85) 56%, rgba(255,255,255,.1) 66%, transparent 70%), radial-gradient(circle at 50% 0%, transparent 50%, rgba(255,255,255,.85) 56%, rgba(255,255,255,.1) 66%, transparent 70%), ${RAINBOW};
      background-size:16px 12px, 16px 12px, 300% 300%; background-position:0 0, 8px 6px, var(--hbx) var(--hby); mix-blend-mode:color-dodge; opacity:.68;
      -webkit-mask-image:radial-gradient(ellipse 90% 80% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.6) 55%, rgba(0,0,0,.3)); mask-image:radial-gradient(ellipse 90% 80% at var(--hx) var(--hy), #000 0%, rgba(0,0,0,.6) 55%, rgba(0,0,0,.3));}
    ${S}.holo-active .holo-layer{opacity:.85;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(255,255,255,.55), 0 0 12px rgba(180,140,255,.35);}`},
  redscale:{label:'Red dragon scale', theme:'Overlapping red-gold scales catch a hot light', n:0, css:S=>`
    ${S} .holo-layer{background-image:radial-gradient(circle at 50% 0%, rgba(40,0,0,.0) 48%, rgba(255,210,120,.9) 55%, rgba(120,10,0,.5) 64%, transparent 70%), radial-gradient(circle at 50% 0%, rgba(40,0,0,0) 48%, rgba(255,210,120,.9) 55%, rgba(120,10,0,.5) 64%, transparent 70%), linear-gradient(115deg, #3a0400, #d8200c 30%, #ffb040 42%, #a0100a 55%, #ff6a1a 70%, #3a0400);
      background-size:14px 11px, 14px 11px, 300% 300%; background-position:0 0, 7px 5.5px, var(--hbx) var(--hby); mix-blend-mode:hard-light; opacity:.42;}
    ${S}{box-shadow:inset 0 0 0 2px #e0601a, 0 0 12px rgba(230,60,20,.4);}`},
  creampearl:{label:'Cream pearl', theme:'Booster foil: cream base, fibre grain, light specks', n:12, d:[1.6, 3], y:[5, 95], css:S=>`
    ${S} .holo-layer{background-image:${noise('.9 .05', 2, 12, '0 0 0 0 1  0 0 0 0 .97  0 0 0 0 .9  0 0 0 -1.1 .55', 'fractalNoise', 160)}, linear-gradient(115deg, #f2e6cf 0%, #fffaf0 30%, #f6e2d6 45%, #e8f0f2 60%, #fff6e6 75%, #efe2c8 100%); background-size:160px 160px, 300% 300%; background-position:0 0, var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;}
    ${S}{box-shadow:inset 0 0 0 2px rgba(255,246,226,.9), 0 0 8px rgba(255,240,210,.35);}
    ${S} .fxd-ffx i{width:4px; height:4px; margin:-2px; background:radial-gradient(circle, #fff 0 1px, rgba(255,250,235,.6) 1.4px, transparent 2px); animation:fxdTwinkle var(--d) ease-in-out infinite; animation-delay:var(--dl);}`},
  rosepearl:{label:'Rose pearl', theme:'Blush pearl body with an iridescent edge', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, #f3d3d8 0%, #fff4f6 30%, #f0cfe4 45%, #e4ecf6 60%, #fff0f2 75%, #f2d0d6 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.95;}
    ${S} .fxd-ffx::before{padding:4%; ${BORDER_MASK} background-image:${RAINBOW}; background-size:300% 300%; background-position:var(--hbx) var(--hby); opacity:.5; mix-blend-mode:screen; border-radius:inherit;}`},
  mirage:{label:'Desert mirage', theme:'Heat shimmer warps the art; a hot sand sheen rises', n:0, css:S=>`
    ${S} .ico{filter:url(#fxdMirageF); animation:fxdMirageWob 2.6s ease-in-out infinite; transform-origin:50% 100%;}
    @keyframes fxdMirageWob{0%,100%{transform:skewX(0) scaleY(1);} 30%{transform:skewX(1.4deg) scaleY(1.012);} 70%{transform:skewX(-1.2deg) scaleY(.992);}}
    ${S} .holo-layer{background-image:repeating-linear-gradient(0deg, rgba(255,240,200,0) 0 5px, rgba(255,240,200,.35) 6px, rgba(255,240,200,0) 8px 12px), linear-gradient(180deg, rgba(255,200,120,.0), rgba(255,180,90,.45)); background-size:100% 24px, 100% 100%; mix-blend-mode:soft-light; opacity:.9; animation:fxdHeat 2.2s linear infinite;}
    @keyframes fxdHeat{to{background-position:0 -24px, 0 0;}}
    ${S}{box-shadow:inset 0 -14px 18px -8px rgba(255,170,60,.45);}`},
  dune:{label:'Dune gold', theme:'Gold sheen over drifting dune silhouettes and a sun glare', n:0, css:S=>`
    ${S} .holo-layer{background-image:linear-gradient(115deg, #8a5418 0%, #f0c070 26%, #fff0c8 36%, #c88a3a 50%, #f6d08a 64%, #8a5418 100%); background-size:300% 300%; background-position:var(--hbx) var(--hby); mix-blend-mode:soft-light; opacity:.9;}
    ${S} .fxd-ffx::before{background-image:${DUNES}; background-size:120% 100%; background-position:0 0; animation:fxdDune 18s ease-in-out infinite alternate;}
    @keyframes fxdDune{to{background-position:100% 0;}}
    ${S} .fxd-ffx::after{background:radial-gradient(circle at var(--hx) var(--hy), rgba(255,250,220,.55), rgba(255,220,140,.2) 22%, transparent 40%); mix-blend-mode:screen;}`},
};
// Which inventory entry each finish belongs to (A first). Designer extras without their own id ride as variants:
// pollen drift (bramble B), rain on glass (storm B), tide shimmer (tide B), honeycomb (hex B), acid-battery circuit (radioactive B),
// bronze filigree (bronze B), Sunfeather tribes glass (stained glass B), aurora rays (aurora B).
M.FOIL_ENTRIES = {
  'foil-new-ember':['ember', 'volcanic'], 'foil-new-tide':['caustics', 'tideshimmer'], 'foil-new-bramble':['bramble', 'pollen'], 'foil-new-firefly':['firefly', 'meadow'],
  'foil-new-feather':['feather', 'jewelscale'], 'foil-new-bronze':['bronze', 'filigree'], 'foil-new-inkwash':['inkwash', 'sumi'], 'foil-new-redacted':['redacted', 'dossier'],
  'foil-new-stainedglass':['stainedglass', 'sunfeather'], 'foil-new-void':['voidstatic', 'horizon'], 'foil-new-hellfire':['hellfire', 'blackflame', 'brimstone'],
  'foil-new-radioactive':['uranium', 'circuit'], 'foil-new-ghostmist':['ghostmist', 'wisp'], 'foil-new-dragonscale':['dragonscale', 'redscale'], 'foil-new-mycelium':['mycelium', 'spores'],
  'foil-new-bioluminescent':['biolum', 'jelly'], 'foil-new-mirage':['mirage', 'dune'], 'foil-new-storm':['storm', 'rainglass'], 'foil-new-autumn':['autumn', 'ginkgo'],
  'foil-new-moonphase':['moonphase', 'moonsilver'], 'foil-new-constellation':['constellation', 'zodiac'], 'foil-new-cream-pearl':['creampearl', 'rosepearl'],
};
M.FOILS = FOILS;
function foilCss(key){
  css('foil-base', FOIL_BASE);
  const f = FOILS[key]; if(!f) return;
  css('foil-' + key, f.css('.card-tile.fxd-f-' + key));
  if(key === 'mirage' && !document.getElementById('fxdMirageSvg')){ // the heat-haze displacement the Desert mirage finish uses
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'fxdMirageSvg'; s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.position = 'absolute';
    s.innerHTML = `<filter id="fxdMirageF"><feTurbulence type="fractalNoise" baseFrequency=".012 .09" numOctaves="2" seed="3"><animate attributeName="baseFrequency" dur="3s" values=".012 .09;.014 .11;.012 .09" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="11"/></filter>`;
    document.body.appendChild(s);
  }
}
function foilBits(key){
  const f = FOILS[key] || {}, n = f.n || 0, d = f.d || [2, 4], y = f.y || [0, 100]; let h = '';
  for(let k = 0; k < n; k++){
    const p = f.at && f.at[k], x = p ? p[0] : 4 + hr(k, 1)*92, yy = p ? p[1] : y[0] + hr(k, 2)*(y[1] - y[0]), dur = d[0] + hr(k, 3)*(d[1] - d[0]);
    h += `<i style="--x:${f1(x)}%; --y:${f1(yy)}%; --d:${dur.toFixed(2)}s; --dl:${(-hr(k, 4)*dur).toFixed(2)}s; --s:${(.7 + hr(k, 5)*.6).toFixed(2)}; --sx:${Math.round((hr(k, 6) - .5)*36)}px; --h:${Math.round(hr(k, 7)*30 - 10)}"></i>`;
  }
  return h;
}
// Put finish `key` on a tile (any .card-tile). Removes the game's own holo-* finish so the two never fight; returns the tile.
M.applyFoil = function(tile, key, opts){
  tile = tileOf(tile); if(!tile || !FOILS[key]) return tile;
  foilCss(key);
  M.clearFoil(tile, {keepHolo:true});
  tile.className = tile.className.replace(/\bholo-[\w-]+/g, '').replace(/\bfxd-f-[\w-]+/g, '').replace(/\s+/g, ' ').trim() + ' is-holo fxd-foil fxd-f-' + key;
  tile.querySelectorAll(':scope > .holo-layer, :scope > .holo-glare, :scope > .holo-glitter, :scope > .foil-fx').forEach(x=> x.remove());
  try{ if(typeof decorateHolo === 'function') decorateHolo(tile.parentNode || tile); }catch(e){}
  if(!tile.querySelector(':scope > .holo-layer')){ const l = document.createElement('span'); l.className = 'holo-layer'; l.setAttribute('aria-hidden', 'true'); tile.appendChild(l);
    const g = document.createElement('span'); g.className = 'holo-glare'; g.setAttribute('aria-hidden', 'true'); tile.appendChild(g); }
  const fx = document.createElement('span'); fx.className = 'fxd-ffx'; fx.setAttribute('aria-hidden', 'true'); fx.innerHTML = foilBits(key); tile.appendChild(fx);
  return tile;
};
M.clearFoil = function(tile, o){
  tile = tileOf(tile); if(!tile) return;
  tile.querySelectorAll(':scope > .fxd-ffx').forEach(x=> x.remove());
  if(!(o && o.keepHolo)){ tile.className = tile.className.replace(/\bfxd-f-[\w-]+/g, '').replace(/\bfxd-foil\b/g, ''); }
};
// Tiles that already carry `fxd-f-<key>` (e.g. a future roll table) get their layers here; cheap, idempotent.
M.decorateFoils = function(rootEl){
  (rootEl || document).querySelectorAll('.card-tile.fxd-foil').forEach(t=>{ if(t.querySelector(':scope > .fxd-ffx')) return; const m = t.className.match(/\bfxd-f-([\w-]+)/); if(m) M.applyFoil(t, m[1]); });
};
// Foil light on the board (foil-tilt-board, 2026-10-15): on a fight tile the finish only drifts, so when a foil, Legendary-and-up
// or Supreme unit enters, a bright specular band sweeps across it once (and its sheen flares) — the light "catches" it.
M.foilGlint = function(el, opts){
  opts = opts || {}; const t = tileOf(el), g = G(); if(!t || !g || !t.isConnected) return Promise.resolve();
  css('glint', `.fxd-glint{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:9; overflow:hidden;}
    .fxd-glint b{position:absolute; top:-30%; bottom:-30%; width:42%; left:-60%; background:linear-gradient(100deg, transparent, rgba(255,255,255,.08) 20%, rgba(255,255,255,.85) 48%, rgba(255,250,220,.95) 50%, rgba(255,255,255,.08) 80%, transparent); mix-blend-mode:overlay; transform:skewX(-18deg);}
    .fxd-glint b + b{width:14%; background:linear-gradient(100deg, transparent, rgba(255,255,255,.9), transparent); mix-blend-mode:screen; opacity:.55;}`);
  const L = layer('fxd-glint', '<b></b><b></b>', t); L.style.position = 'absolute';
  const bs = L.querySelectorAll('b'), w = t.getBoundingClientRect().width || 100;
  return new Promise(res=> g.timeline({onComplete:()=>{ L.remove(); res(); }})
    .to(bs[0], {x:w*1.9, duration:opts.dur || .62, ease:'power2.inOut'}, 0)
    .to(bs[1], {x:w*2.1, duration:(opts.dur || .62)*1.05, ease:'power2.inOut'}, .06)
    .fromTo(t, {filter:'brightness(1)'}, {filter:'brightness(1.22) saturate(1.15)', duration:.18, yoyo:true, repeat:1, clearProps:'filter'}, .2));
};
// B: the light follows a short tilt instead — the card rocks once and its own finish (if any) shows the light moving.
M.foilGlint_B = function(el, opts){
  const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  const o = {a:0}; const set = ()=>{ const px = .5 + Math.sin(o.a)*.45, py = .5 - Math.cos(o.a)*.3;
    t.style.setProperty('--hx', (px*100).toFixed(1) + '%'); t.style.setProperty('--hy', (py*100).toFixed(1) + '%'); t.style.setProperty('--hbx', (50 + (px - .5)*60).toFixed(1) + '%'); t.style.setProperty('--hby', (50 + (py - .5)*60).toFixed(1) + '%'); };
  t.classList.add('holo-active');
  return new Promise(res=> g.timeline({onComplete:()=>{ t.classList.remove('holo-active'); g.set(t, {clearProps:'rotationY,rotationX,transformPerspective'}); res(); }})
    .to(o, {a:Math.PI*1.6, duration:.9, ease:'sine.inOut', onUpdate:set}, 0)
    .to(t, {rotationY:16, rotationX:-6, transformPerspective:600, duration:.3, ease:'sine.out'}, 0)
    .to(t, {rotationY:-10, rotationX:4, duration:.35, ease:'sine.inOut'}, .3)
    .to(t, {rotationY:0, rotationX:0, duration:.3, ease:'sine.out'}, .65)
    .add(()=> M.foilGlint(t, {dur:.5}), .15));
};

// ======================= STATUS LOOKS =======================
// Persistent looks on a board tile while a status lasts (2026-10-15). Batch B plays the moment a status lands; these stay on
// the tile until it wears off. One <b class="fxd-st fxd-st-<key>"> per status inside the .card-tile, kept in step with the
// unit by FX.D.syncStatusLooks (hooks: cardStatusShown after updateCardStatusDisplay, boardRowsBuilt after a row re-render).
const INK_SPLAT = svgUrl(SVG(`<path d='M50 6 C62 4 64 16 74 14 C88 12 90 26 84 34 C96 38 94 52 82 52 C86 62 76 70 66 64 C64 76 52 78 46 68 C36 76 24 70 26 58 C12 60 8 46 18 40 C8 30 16 18 28 22 C30 10 42 4 50 6Z' fill='#0d0b1a'/><path d='M30 60 q-2 14 1 22 q3 4 4 -2 q0 -10 -2 -20Z M62 66 q1 18 4 26 q3 4 4 -3 q-2 -12 -5 -23Z M78 50 q4 10 3 16 q-2 4 -4 0 q0 -8 -1 -14Z' fill='#0d0b1a'/><circle cx='12' cy='24' r='3' fill='#0d0b1a'/><circle cx='90' cy='18' r='2.4' fill='#0d0b1a'/><circle cx='94' cy='60' r='2' fill='#0d0b1a'/><ellipse cx='42' cy='26' rx='9' ry='4' fill='#3a3560' fill-opacity='.55'/>`, '0 0 100 100', 'xMidYMid meet'));
const CROSSHAIR = svgUrl(SVG(`<g fill='none' stroke='#ff2a2a' stroke-width='2.2'><circle cx='50' cy='50' r='30'/><circle cx='50' cy='50' r='12' stroke-width='1.4'/><path d='M50 8v22M50 70v22M8 50h22M70 50h22'/></g><circle cx='50' cy='50' r='2.6' fill='#ff2a2a'/>`, '0 0 100 100', 'xMidYMid meet'));
const CLAWS = svgUrl(SVG(`<g stroke-linecap='round' fill='none'><path d='M22 18 Q40 52 52 96' stroke='#3a0306' stroke-width='5'/><path d='M38 12 Q56 50 68 92' stroke='#3a0306' stroke-width='5.5'/><path d='M56 14 Q70 46 80 84' stroke='#3a0306' stroke-width='4.5'/><path d='M22 18 Q40 52 52 96' stroke='#d8424a' stroke-width='1.4'/><path d='M38 12 Q56 50 68 92' stroke='#d8424a' stroke-width='1.6'/><path d='M56 14 Q70 46 80 84' stroke='#d8424a' stroke-width='1.2'/></g>`));
const CHAINS = svgUrl(SVG((()=>{ let g = ''; const link = (x, y, a)=> g += `<rect x='${f1(x - 5)}' y='${f1(y - 3)}' width='10' height='6' rx='3' transform='rotate(${a} ${f1(x)} ${f1(y)})' fill='none' stroke='#5b5f68' stroke-width='2.4'/><rect x='${f1(x - 5)}' y='${f1(y - 3)}' width='10' height='6' rx='3' transform='rotate(${a} ${f1(x)} ${f1(y)})' fill='none' stroke='#cfd4dc' stroke-width='.9'/>`;
  for(let k = 0; k <= 12; k++){ const t = k/12; link(t*100, 10 + t*120, 50 + (k%2)*40); link(100 - t*100, 10 + t*120, -50 - (k%2)*40); }
  return g + `<g transform='translate(50 70)'><path d='M-7 -4 v-6 a7 7 0 0 1 14 0 v6' fill='none' stroke='#9aa0aa' stroke-width='3'/><rect x='-10' y='-5' width='20' height='16' rx='3' fill='#b8862a' stroke='#5a3e10' stroke-width='1.5'/><circle cx='0' cy='2' r='2.2' fill='#3a2a08'/></g>`; })()));
const VEINS = svgUrl(SVG(`<path d='${crackPath('wither', 10, 7)}' fill='none' stroke='#14081a' stroke-width='2.4' stroke-linecap='round' stroke-opacity='.85'/>`));
const STATUS_CSS = `
  .fxd-st{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:4; overflow:hidden; container-type:size;}
  .fxd-st::before, .fxd-st::after{content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background-repeat:no-repeat;}
  .fxd-st i{position:absolute; display:block; left:var(--x); font-style:normal; pointer-events:none;}
  /* Poison: swamp-green ooze pools at the bottom and bubbles rise and pop */
  .fxd-st-poison{background:linear-gradient(0deg, rgba(90,200,60,.42), rgba(90,200,60,0) 40%);}
  .fxd-st-poison::before{top:auto; bottom:0; left:-10%; right:-10%; height:10%; /* 2026-10-16 (user: "Poisoned line effect should start from the south border."): was bottom:13% */ background:radial-gradient(ellipse 11px 7px at 50% 100%, rgba(130,235,70,.85) 62%, transparent 66%) 0 0/20px 100% repeat-x; filter:drop-shadow(0 0 2px #6cff3a); animation:fxdOoze 2.6s linear infinite;}
  @keyframes fxdOoze{to{background-position:20px 0;}}
  .fxd-st-poison i{bottom:3%; width:6px; height:6px; margin-left:-3px; border-radius:50%; border:1px solid rgba(200,255,150,.95); background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.75), rgba(110,220,60,.35)); animation:fxdBubble var(--d) ease-in infinite; animation-delay:var(--dl);}
  @keyframes fxdBubble{0%{transform:translateY(0) scale(.35); opacity:0;} 12%{opacity:1;} 78%{transform:translateY(-46cqh) scale(1); opacity:1;} 86%{transform:translateY(-48cqh) scale(1.6); opacity:0;} 100%{opacity:0;}}
  /* Bleed: blood runs from the top edge; the edges throb like a heartbeat */
  .fxd-st-bleed{animation:fxdHeartV 1.5s ease-in-out infinite;}
  @keyframes fxdHeartV{0%,100%{box-shadow:inset 0 0 8px rgba(160,0,10,.35);} 12%{box-shadow:inset 0 0 18px rgba(210,0,16,.8);} 24%{box-shadow:inset 0 0 10px rgba(160,0,10,.45);} 36%{box-shadow:inset 0 0 16px rgba(210,0,16,.7);}}
  .fxd-st-bleed i{top:-1px; width:4px; margin-left:-2px; border-radius:0 0 4px 4px; background:linear-gradient(180deg, #4a0005, #c8121e); animation:fxdDrip var(--d) ease-in infinite; animation-delay:var(--dl);}
  .fxd-st-bleed i::after{content:''; position:absolute; left:50%; bottom:-4px; width:7px; height:8px; margin-left:-3.5px; border-radius:50% 50% 50% 50% / 60% 60% 40% 40%; background:radial-gradient(circle at 35% 35%, #ff6a6a, #b80d18 55%, #5a0008);}
  @keyframes fxdDrip{0%{height:0; opacity:1;} 65%{height:var(--len, 18cqh);} 80%{height:calc(var(--len, 18cqh) + 3px); opacity:1;} 100%{height:calc(var(--len, 18cqh) + 3px); opacity:0;}}
  /* Decay: grey-violet mould creeps in from the corners; spores lift off */
  .fxd-st-decay{background:radial-gradient(circle at 0 100%, rgba(150,130,170,.62), transparent 40%), radial-gradient(circle at 100% 0, rgba(150,130,170,.5), transparent 34%), radial-gradient(circle at 100% 100%, rgba(120,110,140,.45), transparent 30%);}
  .fxd-st-decay::before{background-image:${noise('.25', 3, 5, '0 0 0 0 .78  0 0 0 0 .72  0 0 0 0 .86  0 0 0 -2.4 1.15', 'fractalNoise', 90)}; background-size:90px 90px; opacity:.8; background-repeat:repeat;
    -webkit-mask-image:radial-gradient(circle at 0 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 12%)), radial-gradient(circle at 100% 0, #000 calc(var(--fxd-g)*.8), transparent calc(var(--fxd-g)*.8 + 12%));
    mask-image:radial-gradient(circle at 0 100%, #000 var(--fxd-g), transparent calc(var(--fxd-g) + 12%)), radial-gradient(circle at 100% 0, #000 calc(var(--fxd-g)*.8), transparent calc(var(--fxd-g)*.8 + 12%)); animation:fxdCreep 5s ease-in-out infinite alternate;}
  @property --fxd-g{syntax:'<percentage>'; inherits:false; initial-value:10%;}
  @keyframes fxdCreep{0%{--fxd-g:22%;} 100%{--fxd-g:40%;}}
  .fxd-st-decay i{bottom:4%; width:3px; height:3px; border-radius:50%; background:#d8cce6; box-shadow:0 0 3px #a890c8; animation:fxdSpore var(--d) ease-out infinite; animation-delay:var(--dl);}
  @keyframes fxdSpore{0%{transform:translate(0,0); opacity:0;} 15%{opacity:.9;} 100%{transform:translate(var(--sx), -60cqh); opacity:0;}}
  /* Stagger: dull dent rings throb from the middle; the tile shows double for a beat */
  .fxd-st-stagger::before{background:repeating-radial-gradient(circle at 50% 46%, rgba(255,160,70,0) 0 7px, rgba(255,170,80,.85) 8px 10px, rgba(255,160,70,0) 11px 16px); -webkit-mask-image:radial-gradient(circle at 50% 46%, #000 20%, transparent 62%); mask-image:radial-gradient(circle at 50% 46%, #000 20%, transparent 62%); animation:fxdDent 1.3s ease-out infinite;}
  @keyframes fxdDent{0%{transform:scale(.6); opacity:.9;} 100%{transform:scale(1.25); opacity:0;}}
  .fxd-st-stagger::after{box-shadow:4px 0 0 rgba(255,150,60,.6), -4px 0 0 rgba(120,160,255,.55); animation:fxdDouble 1.3s steps(1) infinite;}
  @keyframes fxdDouble{0%,30%{opacity:1;} 32%,100%{opacity:0;}}
  /* Blind: a Hollow Kin ink splat over the eyes, slowly running */
  .fxd-st-blind::before{inset:4% 8% auto; height:52%; background-image:${INK_SPLAT}; background-size:contain; background-position:50% 0; opacity:.86; filter:drop-shadow(0 1px 1px rgba(255,255,255,.15)); animation:fxdInkRun 4s ease-in-out infinite alternate;}
  @keyframes fxdInkRun{0%{transform:translateY(0) scaleY(1);} 100%{transform:translateY(2%) scaleY(1.05);}}
  /* Confuse: a dizzy swirl over the art and question marks circling its head */
  .fxd-st-confuse{overflow:visible;}
  .fxd-st-confuse::before{background:repeating-conic-gradient(from 0deg at 50% 45%, rgba(200,140,255,.0) 0deg 14deg, rgba(210,150,255,.5) 22deg 34deg, rgba(200,140,255,0) 42deg 60deg); -webkit-mask-image:radial-gradient(circle at 50% 45%, #000 15%, transparent 55%); mask-image:radial-gradient(circle at 50% 45%, #000 15%, transparent 55%); animation:fxdSpin 3s linear infinite; border-radius:0; overflow:hidden;}
  .fxd-st-confuse i{left:50%; top:-6px; font:800 12px/1 'Baloo 2', system-ui, sans-serif; color:#f2e0ff; text-shadow:0 0 4px #9a4ae8, 0 0 1px #000, 0 1px 1px #000; animation:fxdOrbit 2.2s linear infinite; animation-delay:var(--dl);}
  @keyframes fxdOrbit{0%{transform:translate(-50%,0) rotate(0deg) translateX(22px) rotate(0deg) scale(1);} 25%{transform:translate(-50%,0) rotate(90deg) translateX(22px) rotate(-90deg) scale(1.15);} 50%{transform:translate(-50%,0) rotate(180deg) translateX(22px) rotate(-180deg) scale(.8); opacity:.6;} 75%{transform:translate(-50%,0) rotate(270deg) translateX(22px) rotate(-270deg) scale(.7); opacity:.5;} 100%{transform:translate(-50%,0) rotate(360deg) translateX(22px) rotate(-360deg) scale(1);}}
  /* Corrode: ant acid pits the card and fizzes along the edges */
  .fxd-st-corrode{box-shadow:inset 0 0 0 2px rgba(200,255,60,.75), inset 0 0 14px rgba(170,230,30,.55);}
  .fxd-st-corrode::before{background-image:${noise('.5', 2, 13, '0 0 0 0 .62  0 0 0 0 .78  0 0 0 0 .1  0 0 0 -4 1.6', 'fractalNoise', 80)}; background-size:80px 80px; background-repeat:repeat; opacity:.8; mix-blend-mode:multiply; -webkit-mask-image:radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, #000 90%); mask-image:radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, #000 90%);}
  .fxd-st-corrode i{top:var(--y); width:3px; height:3px; border-radius:50%; background:#eaff8a; box-shadow:0 0 3px #b8ff2a; animation:fxdFizz var(--d) ease-out infinite; animation-delay:var(--dl);}
  @keyframes fxdFizz{0%{transform:translate(0,0) scale(.5); opacity:0;} 20%{opacity:1;} 100%{transform:translate(var(--sx), -12px) scale(1.1); opacity:0;}}
  /* Expose: a red crosshair stays faintly on it, turning slowly */
  .fxd-st-expose{box-shadow:inset 0 0 0 1.5px rgba(255,50,50,.55);}
  .fxd-st-expose::before{inset:12% 4%; background-image:${CROSSHAIR}; background-size:contain; background-position:center; filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 3px rgba(255,40,40,.9)); animation:fxdAim 6s linear infinite, fxdExpose 1.8s ease-in-out infinite;}
  @keyframes fxdExpose{0%,100%{opacity:.55;} 50%{opacity:.95;}}
  @keyframes fxdAim{to{transform:rotate(360deg);}}
  /* Daunt: a cold purple pall settles from the top; cold drops fall */
  .fxd-st-daunt{background:linear-gradient(180deg, rgba(70,40,140,.6), rgba(70,40,140,.2) 45%, rgba(70,40,140,0) 70%); animation:fxdPall 3s ease-in-out infinite;}
  @keyframes fxdPall{50%{background-position:0 6px;} 0%,100%{background-position:0 0;}}
  .fxd-st-daunt i{top:0; width:2px; height:9px; border-radius:2px; background:linear-gradient(180deg, rgba(190,170,255,0), #c8b8ff); animation:fxdColdDrop var(--d) linear infinite; animation-delay:var(--dl);}
  @keyframes fxdColdDrop{0%{transform:translateY(-10px); opacity:0;} 20%{opacity:.85;} 100%{transform:translateY(55cqh); opacity:0;}}
  /* Wither: black smoke rolls down from the top; dark veins in the edges */
  .fxd-st-wither{background:linear-gradient(180deg, rgba(20,8,24,.5), rgba(20,8,24,0) 45%);}
  .fxd-st-wither::before{background-image:${VEINS}; background-size:100% 100%; -webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%, transparent 45%, #000 85%); mask-image:radial-gradient(ellipse 60% 60% at 50% 50%, transparent 45%, #000 85%); animation:fxdBreathe 3.4s ease-in-out infinite;}
  .fxd-st-wither i{top:-20%; width:46%; height:30%; margin-left:-23%; border-radius:50%; background:radial-gradient(circle, rgba(16,8,20,.85), rgba(30,10,36,.45) 50%, transparent 70%); filter:blur(1.5px); animation:fxdSmokeDown var(--d) ease-in infinite; animation-delay:var(--dl);}
  @keyframes fxdSmokeDown{0%{transform:translateY(0) scale(.6); opacity:0;} 20%{opacity:1;} 100%{transform:translateY(80cqh) scale(1.5); opacity:0;}}
  /* Irradiation: green inner glow, geiger flicker, sickly sparks (stronger with more tokens) */
  .fxd-st-irradiation{box-shadow:inset 0 0 0 1.5px rgba(160,255,60,.8), inset 0 0 calc(8px + var(--n,1)*5px) rgba(120,255,40,.75); animation:fxdGeiger 2s steps(1) infinite;}
  .fxd-st-irradiation::before{background:radial-gradient(ellipse at 50% 60%, rgba(140,255,60,.4), transparent 65%); mix-blend-mode:screen; animation:fxdBreathe 2.4s ease-in-out infinite;}
  .fxd-st-irradiation i{top:var(--y); width:6px; height:6px; margin:-3px; background:linear-gradient(90deg, transparent 42%, #d6ff7a 50%, transparent 58%), linear-gradient(0deg, transparent 42%, #d6ff7a 50%, transparent 58%); filter:drop-shadow(0 0 3px #7fff2a); animation:fxdBlink var(--d) steps(2) infinite; animation-delay:var(--dl);}
  /* Scar: three claw marks stay cut across the art */
  .fxd-st-scar::before{inset:8% 6% 20%; background-image:${CLAWS}; background-size:100% 100%; opacity:.82; filter:drop-shadow(0 0 1px rgba(0,0,0,.7));}
  /* Chained: crossed chains and a padlock that rattle */
  .fxd-st-chained::before{background-image:${CHAINS}; background-size:100% 100%; filter:drop-shadow(0 1px 1px rgba(0,0,0,.7)); animation:fxdRattle 2.2s ease-in-out infinite; transform-origin:50% 0;}
  @keyframes fxdRattle{0%,70%,100%{transform:rotate(0);} 74%{transform:rotate(1.4deg) translateY(1px);} 78%{transform:rotate(-1.2deg);} 82%{transform:rotate(.6deg);}}
  /* Mind-controlled: faint violet puppet strings run up from it to a little control bar */
  .fxd-st-mind{overflow:visible; box-shadow:inset 0 10px 14px -8px rgba(170,90,255,.55);}
  .fxd-st-mind::before{inset:auto 18% 100% 18%; height:26px; border-radius:0; background:linear-gradient(90deg, transparent 10%, rgba(210,170,255,.85) 10.5% 12.5%, transparent 13% 48.5%, rgba(210,170,255,.85) 49% 51%, transparent 51.5% 87.5%, rgba(210,170,255,.85) 88% 90%, transparent 90.5%); transform-origin:50% 0; animation:fxdStrings 2.4s ease-in-out infinite; filter:drop-shadow(0 0 2px #b070ff);}
  .fxd-st-mind::after{inset:auto 10% calc(100% + 24px) 10%; height:4px; border-radius:3px; background:linear-gradient(90deg, #5a2a8a, #c8a0ff, #5a2a8a); box-shadow:0 0 6px rgba(180,110,255,.8); animation:fxdStrings 2.4s ease-in-out infinite; transform-origin:50% 50%;}
  @keyframes fxdStrings{0%,100%{transform:rotate(-4deg) translateX(-2px);} 50%{transform:rotate(4deg) translateX(2px);}}
  html[data-fx="low"] .fxd-st, html[data-fx="low"] .fxd-st::before, html[data-fx="low"] .fxd-st::after, html[data-fx="low"] .fxd-st i{animation-play-state:paused;}
  @media (prefers-reduced-motion: reduce){ .fxd-st, .fxd-st::before, .fxd-st::after, .fxd-st i{animation:none !important;} }`;
// How many particles each look gets, and their timing ranges.
const ST_BITS = {poison:{n:4, d:[1.6, 2.6]}, bleed:{n:3, d:[2.2, 3.4], len:true}, decay:{n:4, d:[3, 5]}, confuse:{n:3, d:[2.2, 2.2], q:true}, corrode:{n:6, d:[.9, 1.6], y:true},
  daunt:{n:4, d:[1.4, 2.2]}, wither:{n:3, d:[2.6, 3.6]}, irradiation:{n:4, d:[.8, 1.6], y:true}};
M.STATUS_KEYS = ['poison', 'bleed', 'decay', 'stagger', 'blind', 'confuse', 'corrode', 'expose', 'daunt', 'wither', 'irradiation', 'scar', 'chained', 'mind'];
// Turn one status look on or off on a board card (or tile). `n` scales the looks that grow with stacks (irradiation).
M.statusLook = function(el, key, on, n){
  css('status', STATUS_CSS); css('foil-base', FOIL_BASE);
  const t = tileOf(el); if(!t) return null;
  let b = t.querySelector(':scope > .fxd-st-' + key);
  if(!on){ if(b) b.remove(); return null; }
  if(!b){ b = document.createElement('b'); b.className = 'fxd-st fxd-st-' + key; b.setAttribute('aria-hidden', 'true');
    const s = ST_BITS[key]; if(s){ let h = ''; for(let k = 0; k < s.n; k++){ const dur = s.d[0] + hr(k, 11)*(s.d[1] - s.d[0]);
      h += `<i style="--x:${f1(s.q ? 50 : 10 + ((k + .5)/s.n)*80 + (hr(k, 12) - .5)*10)}%; --y:${f1(8 + hr(k, 13)*84)}%; --d:${dur.toFixed(2)}s; --dl:${(s.q ? -k*dur/s.n : -hr(k, 14)*dur).toFixed(2)}s; --sx:${Math.round((hr(k, 15) - .5)*24)}px;${s.len ? ` --len:${Math.round(12 + hr(k, 16)*22)}cqh;` : ''}">${s.q ? '?' : ''}</i>`; } b.innerHTML = h; }
    const before = t.querySelector(':scope > .badges-bottom, :scope > .stats'); t.insertBefore(b, before || null); }
  if(n != null) b.style.setProperty('--n', String(Math.max(1, Math.min(6, n|0))));
  return b;
};
M.syncStatusLooks = function(el, states){ if(!el) return; M.STATUS_KEYS.forEach(k=> M.statusLook(el, k, !!(states && states[k]), states && states[k + 'N'])); };
// What the unit is suffering, from its live (replay) record.
const mindByMatch = new WeakMap(), seenByMatch = new WeakMap();
const matchKey = env=> (env && env.match && typeof env.match === 'object') ? env.match : M;
const mindSet = env=>{ const k = matchKey(env); let s = mindByMatch.get(k); if(!s){ s = new Set(); mindByMatch.set(k, s); } return s; };
const seenSet = (env, kind)=>{ const k = matchKey(env); let o = seenByMatch.get(k); if(!o){ o = {}; seenByMatch.set(k, o); } return o[kind] || (o[kind] = new Set()); };
function statusStates(c, uid, env){
  if(!c) return {};
  return {poison:c.poison > 0, bleed:c.bleed > 0, decay:c.decay > 0, stagger:c.staggered > 0, blind:c.blind > 0, confuse:c.confused > 0, corrode:c.corrode > 0, expose:c.exposed > 0,
    daunt:(c.daunts || []).some(x=> (x.n || 0) > 0), wither:c.wither > 0, irradiation:c.irradiation > 0, irradiationN:c.irradiation || 0, scar:c.scar > 0, chained:!!c.chained,
    mind:mindSet(env).has(String(uid))};
}
// ---- status moments that belong with the look (2026-10-15) ----
// Rage turns on (<50% Health): red steam bursts off the card, the frame flares red, a growl.
M.rageEnter = function(el, opts){
  opts = opts || {}; const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  css('rage', `.fxd-steam{position:fixed; width:26px; height:26px; margin:-13px; border-radius:50%; background:radial-gradient(circle, rgba(255,120,100,.75), rgba(200,40,30,.35) 50%, transparent 70%); filter:blur(1.5px); pointer-events:none; z-index:1200;}
    .fxd-rageflare{position:fixed; border-radius:12px; pointer-events:none; z-index:1199; box-shadow:0 0 0 3px #ff3a1a, 0 0 22px 6px rgba(255,40,10,.75), inset 0 0 18px rgba(255,40,10,.6);}`);
  const c = centre(t), r = c.r, bits = [];
  const fl = layer('fxd-rageflare'); g.set(fl, {left:r.left, top:r.top, width:r.width, height:r.height, opacity:0});
  for(let k = 0; k < 10; k++){ const s = layer('fxd-steam'), side = k % 2 ? 1 : -1; bits.push(s);
    g.set(s, {x:c.x + side*r.width*(.35 + Math.random()*.15), y:c.y + (Math.random() - .3)*r.height*.5, scale:.4, opacity:0}); }
  snd('growl');
  return new Promise(res=> g.timeline({onComplete:()=>{ fl.remove(); bits.forEach(b=> b.remove()); res(); }})
    .to(fl, {opacity:1, duration:.08}).to(fl, {opacity:0, duration:.55, ease:'power2.in'})
    .fromTo(t, {scale:1}, {scale:1.08, duration:.09, yoyo:true, repeat:1, ease:'power2.out', clearProps:'scale'}, 0)
    .to(bits, {y:'-=' + (40 + r.height*.3), x:i=> '+=' + ((i % 2 ? 1 : -1)*(10 + Math.random()*16)), scale:()=> 1.4 + Math.random(), opacity:.95, duration:.3, stagger:.03, ease:'power2.out'}, 0)
    .to(bits, {opacity:0, duration:.4, stagger:.03, ease:'power1.in'}, .3));
};
// A day/night bonus switches off: the aura drains, its motes lift away in the phase's colour.
M.phaseFade = function(el, phase, opts){
  const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  const col = phase === 'night' ? '#d8e2ff' : phase === 'twilight' || phase === 'dusk' ? '#ffb8c8' : '#ffd86a';
  css('phasefade', `.fxd-mote{position:fixed; width:5px; height:5px; margin:-2.5px; border-radius:50%; pointer-events:none; z-index:1200;}`);
  const c = centre(t), r = c.r, ms = [];
  for(let k = 0; k < 14; k++){ const m = layer('fxd-mote'); m.style.background = col; m.style.boxShadow = `0 0 6px 2px ${col}`; ms.push(m);
    const a = (k/14)*Math.PI*2; g.set(m, {x:c.x + Math.cos(a)*r.width*.5, y:c.y + Math.sin(a)*r.height*.5, opacity:.95}); }
  return new Promise(res=> g.timeline({onComplete:()=>{ ms.forEach(m=> m.remove()); res(); }})
    .fromTo(t, {filter:'saturate(1.3) brightness(1.15)'}, {filter:'saturate(.75) brightness(.92)', duration:.35, ease:'power1.out'}, 0)
    .to(t, {filter:'saturate(1) brightness(1)', duration:.4, clearProps:'filter'}, .5)
    .to(ms, {y:'-=' + (30 + r.height*.35), x:()=> '+=' + ((Math.random() - .5)*24), opacity:0, scale:.3, duration:.9, stagger:.025, ease:'power1.out'}, 0));
};
// The cage drops on a caged leader: bars slam down from above, bounce, dust kicks out at the base.
M.cageDrop = function(el, opts){
  const bc = el && el.closest ? (el.closest('.board-card') || el) : el, g = G(); if(!bc || !g) return Promise.resolve();
  const bars = bc.querySelector('.cage-bars') || (()=>{ const b = document.createElement('div'); b.className = 'cage-bars fxd-cagebars'; b.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; (bc.querySelector('.card-tile') || bc).appendChild(b); return b; })();
  css('cage', `.fxd-dust{position:fixed; width:14px; height:9px; margin:-4px -7px; border-radius:50%; background:radial-gradient(circle, rgba(190,170,140,.8), rgba(190,170,140,0) 70%); pointer-events:none; z-index:1200;}
    .fxd-cagebars{position:absolute; inset:0; z-index:6; pointer-events:none; display:flex; justify-content:space-evenly;} .fxd-cagebars i{display:block; width:3.5%; min-width:3px; height:100%; background:linear-gradient(90deg, #4a4d55, #c7cbd3 45%, #5a5e66);}`);
  const r = bc.getBoundingClientRect(); const dust = [];
  snd('clang');
  return new Promise(res=> g.timeline({onComplete:()=>{ dust.forEach(d=> d.remove()); g.set(bars, {clearProps:'transform,opacity'}); res(); }})
    .fromTo(bars, {y:-r.height*1.1, opacity:.2}, {y:0, opacity:1, duration:.28, ease:'power3.in'})
    .add(()=>{ for(let k = 0; k < 8; k++){ const d = layer('fxd-dust'); dust.push(d); g.set(d, {x:r.left + r.width*(k/7), y:r.bottom - 2, scale:.5});
        g.to(d, {x:'+=' + ((k/7 - .5)*40), y:'-=' + (6 + Math.random()*10), scale:1.6, opacity:0, duration:.55, ease:'power2.out'}); }
      try{ if(typeof SoundKit !== 'undefined' && SoundKit.hitAt) SoundKit.hitAt(4, true); }catch(e){} })
    .to(bars, {y:-7, duration:.09, ease:'power2.out'}).to(bars, {y:0, duration:.12, ease:'bounce.out'})
    .fromTo(bc, {y:0}, {y:3, duration:.06, yoyo:true, repeat:1, clearProps:'y'}, .28)
    .to({}, {duration:.35}));
};
// A new status chip pops onto the badge row (st-status-badges).
M.badgePop = function(badge, opts){
  const g = G(); if(!badge || !g) return Promise.resolve();
  css('badgepop', `.fxd-chipring{position:fixed; border-radius:50%; border:2px solid #fff; pointer-events:none; z-index:1200;}`);
  const c = centre(badge), ring = layer('fxd-chipring'); const s = Math.max(c.w, c.h) + 6;
  g.set(ring, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, opacity:.9, scale:.6});
  return new Promise(res=> g.timeline({onComplete:()=>{ ring.remove(); res(); }})
    .fromTo(badge, {scale:.2, rotation:-20}, {scale:1, rotation:0, duration:.45, ease:'back.out(3)', clearProps:'scale,rotation'}, 0)
    .to(ring, {scale:1.8, opacity:0, duration:.45, ease:'power2.out'}, .05));
};

// ======================= FRAMES & TREATMENTS =======================
// Top rarities each get a frame of their own (tr-rarity-mythic … daemonic, 2026-10-15). They share .rarity-tier-top with
// Legendary, so the frame keys off the tile's own rarity colour (--rarity-a in its style, set by cardTileHTML from RARITY_DEFS)
// and needs no game edit: a Mythic card anywhere (Codex, board, pack, Forge) wears its frame. Drawn on the tile's ::before
// ring (the gold-leaf rim it replaces) and on .rarity-band::before (inside the card, above the art, under the text).
// Lab variants: add `fxd-r-alt` to opt out of A, plus `fxd-r-<rarity>-b`/`-c` for B/C; `fxd-r-alt` alone is the old gold rim.
const RK = {mythic:'#dc2626', ancient:'#1e3a8a', divine:'#f8fafc', void:'#7c6f8f', daemonic:'#111111'};
const rSel = (k, v)=> v ? `.card-tile.rarity-tier-top.fxd-r-alt.fxd-r-${k}-${v}` : `.card-tile.rarity-tier-top:not(.fxd-r-alt):is([style*="--rarity-a:${RK[k]}"], .fxd-r-${k})`;
const RUNES = svgUrl(SVG((()=>{ const r = seeded('runes'); let p = ''; const glyph = (x, y)=>{ const k = r()*6|0; const G = ['M0 -3v6M0 -3l2 2M0 0l-2 2', 'M-2 -3v6M-2 -3l4 3l-4 3', 'M0 -3v6M-2 -1l4 2', 'M-2 -3l4 6M2 -3l-4 6', 'M-2 3v-6l4 6v-6', 'M0 -3l2 3l-2 3l-2 -3z'][k]; p += `<path transform='translate(${f1(x)} ${f1(y)})' d='${G}'/>`; };
  for(let k = 0; k < 9; k++){ glyph(7, 12 + k*14.5); glyph(93, 12 + k*14.5); } for(let k = 0; k < 5; k++){ glyph(22 + k*14, 7); glyph(22 + k*14, 133); }
  return `<g fill='none' stroke='#7fb4ff' stroke-width='.9' stroke-linecap='round' stroke-linejoin='round'>${p}</g>`; })()));
const RUNE_RING = svgUrl(SVG((()=>{ const r = seeded('ring'); let p = ''; for(let k = 0; k < 16; k++){ const a = k/16*Math.PI*2, x = 50 + Math.cos(a)*38, y = 50 + Math.sin(a)*38; p += `<path transform='translate(${f1(x)} ${f1(y)}) rotate(${f1(a*180/Math.PI + 90)})' d='${['M0 -3v6M0 -3l2 2', 'M-2 -3l4 6M2 -3l-4 6', 'M-2 3v-6l4 6v-6', 'M0 -3l2 3l-2 3l-2 -3z'][r()*4|0]}'/>`; }
  return `<circle cx='50' cy='50' r='44' fill='none' stroke='#8fc0ff' stroke-width='.8'/><circle cx='50' cy='50' r='32' fill='none' stroke='#8fc0ff' stroke-width='.6'/><g fill='none' stroke='#cfe2ff' stroke-width='1'>${p}</g>`; })(), '0 0 100 100', 'xMidYMid meet'));
const HORNS = svgUrl(SVG(`<g fill='#0a0505' stroke='#b0140a' stroke-width='1.2'><path d='M4 30 C2 16 8 6 20 2 C14 10 13 18 16 26 Z'/><path d='M96 30 C98 16 92 6 80 2 C86 10 87 18 84 26 Z'/></g><g fill='#ff2a14'><ellipse cx='40' cy='22' rx='3' ry='1.6'/><ellipse cx='60' cy='22' rx='3' ry='1.6'/></g>`));
const FRAME_BAND = `content:''; position:absolute; left:0; right:0; bottom:0; height:400%; border-radius:12px; pointer-events:none; background-repeat:no-repeat;`;
const FRAMES_CSS = ()=> `
  @property --fxd-a{syntax:'<angle>'; inherits:false; initial-value:0deg;}
  @keyframes fxdRingFlow{to{background-position:300% 0;}}
  @keyframes fxdAngle{to{--fxd-a:360deg;}}
  /* ---- Mythic: A living ember frame · B blood crystal · C heartbeat ---- */
  ${rSel('mythic')}::before{background:linear-gradient(115deg, #5a0606, #dc2626 18%, #ff8a3a 30%, #ffe0a0 34%, #ff5a1a 40%, #b01010 54%, #ff7a2a 70%, #ffd08a 74%, #8a0a0a 86%, #5a0606); background-size:300% 100%; animation:fxdRingFlow 4s linear infinite;}
  ${rSel('mythic')} .rarity-band::before{${FRAME_BAND} background:repeating-linear-gradient(0deg, rgba(255,140,60,0) 0 5px, rgba(255,140,60,.16) 6px, rgba(255,140,60,0) 8px 12px), linear-gradient(0deg, rgba(255,70,20,.38), rgba(255,70,20,0) 34%); background-size:100% 24px, 100% 100%; animation:fxdHeat 2.4s linear infinite; mix-blend-mode:screen;}
  ${rSel('mythic', 'b')}::before{background:repeating-conic-gradient(from var(--fxd-a) at 50% 50%, #ff5a5a 0 9deg, #6a0000 9deg 18deg, #ffc0c0 18deg 21deg, #b00010 21deg 34deg); animation:fxdAngle 9s linear infinite;}
  ${rSel('mythic', 'b')} .rarity-band::before{${FRAME_BAND} background:radial-gradient(circle at 8% 4%, rgba(255,200,200,.55), transparent 14%), radial-gradient(circle at 92% 96%, rgba(255,120,120,.45), transparent 16%); animation:fxdBreathe 3s ease-in-out infinite; mix-blend-mode:screen;}
  ${rSel('mythic', 'c')}::before{background:#e01818; animation:fxdBeatRing 1.4s ease-in-out infinite;}
  @keyframes fxdBeatRing{0%,100%{filter:brightness(.8);} 10%{filter:brightness(1.8);} 22%{filter:brightness(.95);} 34%{filter:brightness(1.6);} 50%{filter:brightness(.85);}}
  ${rSel('mythic', 'c')} .rarity-band::before{${FRAME_BAND} box-shadow:inset 0 0 18px rgba(255,20,20,.6); animation:fxdBeatRing 1.4s ease-in-out infinite;}
  /* ---- Ancient: A rune stone · B deep tablet · C rune circle ---- */
  ${rSel('ancient')}::before{background:${noise('.35', 3, 21, '0 0 0 0 .45  0 0 0 0 .47  0 0 0 0 .52  0 0 0 -1 1.2', 'fractalNoise', 80)}, linear-gradient(160deg, #8a8f9a, #4a4e58 40%, #9aa0aa 70%, #3e424a); background-size:80px 80px, 100% 100%;}
  ${rSel('ancient')} .rarity-band::before{${FRAME_BAND} background-image:${RUNES}; background-size:100% 100%; filter:drop-shadow(0 0 2px #3a7aff) drop-shadow(0 0 4px rgba(60,120,255,.6)); animation:fxdRuneGlow 4.5s ease-in-out infinite;}
  @keyframes fxdRuneGlow{0%,100%{opacity:.35;} 50%{opacity:1;}}
  ${rSel('ancient', 'b')}::before{background:linear-gradient(160deg, #0e1c4a, #23408f 40%, #0a1430 70%, #2a4aa0);}
  ${rSel('ancient', 'b')} .rarity-band::before{${FRAME_BAND} inset:auto 0 0 0; box-shadow:inset 0 0 0 4px rgba(10,20,60,.55), inset 0 0 0 5px rgba(120,170,255,.7), inset 0 0 14px rgba(60,110,255,.5); animation:fxdRuneGlow 3.5s ease-in-out infinite;}
  ${rSel('ancient', 'c')}::before{background:linear-gradient(160deg, #3a5aa8, #a8c4ff 30%, #1e3a8a 55%, #7aa0f0 80%, #1e3a8a);}
  ${rSel('ancient', 'c')} .rarity-band::before{${FRAME_BAND} background-image:${RUNE_RING}; background-size:90% auto; background-position:50% 32%; opacity:.5; mix-blend-mode:screen; filter:drop-shadow(0 0 3px #4a8aff); animation:fxdRuneTurn 30s linear infinite;}
  @keyframes fxdRuneTurn{to{background-position:50% 32%; filter:drop-shadow(0 0 3px #4a8aff) hue-rotate(20deg);}}
  /* ---- Divine: A halo rays · B Ecclesia glass ring · C halo ---- */
  ${rSel('divine')}::before{background:linear-gradient(115deg, transparent calc(var(--gold-x) - 9%), #fff calc(var(--gold-x)), transparent calc(var(--gold-x) + 9%)), linear-gradient(160deg, #fffdf0 0%, #ffe9a8 22%, #ffffff 40%, #f2d48a 60%, #fffaf0 82%, #e8c070 100%); animation:goldStreak 3.6s ease-in-out infinite;}
  ${rSel('divine')} .rarity-band::before{${FRAME_BAND} background:repeating-conic-gradient(from 160deg at 50% -8%, rgba(255,250,220,0) 0deg 5deg, rgba(255,250,220,.5) 7deg, rgba(255,250,220,0) 9deg 15deg); -webkit-mask-image:linear-gradient(180deg, #000 0%, rgba(0,0,0,.4) 45%, transparent 75%); mask-image:linear-gradient(180deg, #000 0%, rgba(0,0,0,.4) 45%, transparent 75%); mix-blend-mode:screen; animation:fxdRays 8s ease-in-out infinite alternate;}
  @keyframes fxdRays{0%{transform:rotate(-3deg); opacity:.75;} 100%{transform:rotate(3deg); opacity:1;}}
  ${rSel('divine', 'b')}::before{background:repeating-linear-gradient(90deg, #c8102e 0 14%, #1a1a1a 14% 15%, #1d4fb8 15% 29%, #1a1a1a 29% 30%, #e0a21a 30% 44%, #1a1a1a 44% 45%, #1d8a45 45% 59%, #1a1a1a 59% 60%); background-size:60% 100%; filter:saturate(1.3) brightness(1.2); animation:fxdRingFlow 14s linear infinite;}
  ${rSel('divine', 'b')} .rarity-band::before{${FRAME_BAND} background:linear-gradient(200deg, rgba(255,250,230,.55), rgba(255,250,230,0) 30%), linear-gradient(160deg, rgba(255,240,210,0) 40%, rgba(255,240,210,.35) 50%, rgba(255,240,210,0) 60%); mix-blend-mode:screen; animation:fxdBreathe 5s ease-in-out infinite;}
  ${rSel('divine', 'c')}::before{background:linear-gradient(160deg, #fff6d8, #f6d77a 40%, #ffffff 70%, #e8c070);}
  ${rSel('divine', 'c')} .rarity-band::before{${FRAME_BAND} background:radial-gradient(ellipse 30% 5% at 50% 7%, transparent 55%, rgba(255,245,200,.95) 70%, rgba(255,230,150,.5) 82%, transparent 100%); filter:drop-shadow(0 0 4px #fff3c0); animation:fxdHaloBob 3s ease-in-out infinite;}
  @keyframes fxdHaloBob{0%,100%{transform:translateY(0);} 50%{transform:translateY(-1.5%);}}
  /* ---- Void: A static edge · B unravelling · C hollow (inverted rim) ---- */
  ${rSel('void')}::before{background:${noise('.8', 1, 31, '0 0 0 0 .6  0 0 0 0 .5  0 0 0 0 .8  0 0 0 0 1', 'fractalNoise', 80)}, #3a2f4a; background-size:80px 80px, 100% 100%; animation:fxdStatic .5s steps(5) infinite;}
  ${rSel('void')} .rarity-band::before{${FRAME_BAND} background:radial-gradient(circle at 6% 10%, #fff 0 .8px, transparent 1.4px), radial-gradient(circle at 94% 22%, #e6dcff 0 .8px, transparent 1.4px), radial-gradient(circle at 8% 78%, #fff 0 .7px, transparent 1.3px), radial-gradient(circle at 90% 88%, #e6dcff 0 .9px, transparent 1.5px), radial-gradient(circle at 50% 3%, #fff 0 .7px, transparent 1.3px), radial-gradient(ellipse 70% 62% at 50% 50%, transparent 58%, rgba(30,10,50,.65) 96%); animation:fxdBreathe 2.6s ease-in-out infinite;}
  ${rSel('void', 'b')}::before{background:conic-gradient(from var(--fxd-a), #7c6f8f 0 40deg, transparent 40deg 55deg, #b8a8d8 55deg 120deg, transparent 120deg 128deg, #5a4a70 128deg 230deg, transparent 230deg 250deg, #9a8ab8 250deg 360deg); animation:fxdAngle 7s linear infinite;}
  ${rSel('void', 'b')} .rarity-band::before{${FRAME_BAND} box-shadow:inset 0 0 14px rgba(120,70,200,.55);}
  ${rSel('void', 'c')}::before{background:#0b0712;}
  ${rSel('void', 'c')} .rarity-band::before{${FRAME_BAND} -webkit-backdrop-filter:invert(1) hue-rotate(180deg) saturate(.6); backdrop-filter:invert(1) hue-rotate(180deg) saturate(.6); -webkit-mask-image:radial-gradient(ellipse 66% 58% at 50% 50%, transparent 74%, #000 100%); mask-image:radial-gradient(ellipse 66% 58% at 50% 50%, transparent 74%, #000 100%);}
  /* ---- Daemonic: A hellfire · B horned · C smoulder ---- */
  ${rSel('daemonic')}::before{background:${noise('.05 .14', 3, 41, '0 0 0 0 1  0 0 0 0 .3  0 0 0 0 .05  0 0 0 -2.2 1.9', 'fractalNoise', 120)}, linear-gradient(0deg, #ff6a10, #9a0a06 50%, #120404); background-size:120px 120px, 100% 100%; animation:fxdFlame 3.9s linear infinite;}
  ${rSel('daemonic')} .rarity-band::before{${FRAME_BAND} background:${noise('.05 .12', 3, 43, '0 0 0 0 1  0 0 0 0 .25  0 0 0 0 .04  0 0 0 -3 2', 'fractalNoise', 120)}; background-size:120px 120px; -webkit-mask-image:linear-gradient(0deg, #000 0%, rgba(0,0,0,.5) 14%, transparent 26%); mask-image:linear-gradient(0deg, #000 0%, rgba(0,0,0,.5) 14%, transparent 26%); mix-blend-mode:screen; animation:fxdFlame 4.8s linear infinite;}
  ${rSel('daemonic', 'b')}::before{background:linear-gradient(160deg, #1a0606, #000 40%, #5a0a06 70%, #000);}
  ${rSel('daemonic', 'b')} .rarity-band::before{${FRAME_BAND} background-image:${HORNS}; background-size:100% 100%; animation:fxdEyes 5s steps(1) infinite;}
  @keyframes fxdEyes{0%,46%,54%,100%{filter:drop-shadow(0 0 3px #ff1a0a);} 48%,52%{filter:drop-shadow(0 0 0 #000) brightness(.4);}}
  ${rSel('daemonic', 'c')}::before{background:linear-gradient(0deg, #ff4a10, #5a0602 35%, #0a0202 70%); animation:fxdBreathe 3s ease-in-out infinite;}
  ${rSel('daemonic', 'c')} .rarity-band::before{${FRAME_BAND} background-image:radial-gradient(circle, #ffb060 0 1px, transparent 1.6px), radial-gradient(circle, #ff5a20 0 .8px, transparent 1.4px); background-size:23px 31px, 17px 26px; background-repeat:repeat; -webkit-mask-image:linear-gradient(0deg, #000, transparent 55%); mask-image:linear-gradient(0deg, #000, transparent 55%); animation:fxdEmbers 3s linear infinite;}
  @keyframes fxdEmbers{to{background-position:6px -62px, -4px -52px;}}
  /* keep big galleries cheap: like the band itself, these only animate where few cards show, or under the pointer */
  .card-tile .rarity-band::before, .card-tile .rarity-band::after{animation-play-state:paused;}
  .board-card .card-tile .rarity-band::before, #handStrip .card-tile .rarity-band::before, .po2 .card-tile .rarity-band::before, .forge-preview-wrap .card-tile .rarity-band::before, .card-pop-visual .card-tile .rarity-band::before, .fxl-stage .card-tile .rarity-band::before, .card-tile:hover > .rarity-band::before,
  .board-card .card-tile .rarity-band::after, #handStrip .card-tile .rarity-band::after, .po2 .card-tile .rarity-band::after, .forge-preview-wrap .card-tile .rarity-band::after, .card-pop-visual .card-tile .rarity-band::after, .fxl-stage .card-tile .rarity-band::after, .card-tile:hover > .rarity-band::after{animation-play-state:running;}
  @media (prefers-reduced-motion: reduce){ .card-tile .rarity-band::before, .card-tile .rarity-band::after, .card-tile.rarity-tier-top::before{animation:none !important;} }
  html[data-fx="none"] .card-tile .rarity-band::before, html[data-fx="none"] .card-tile .rarity-band::after{animation:none !important;}
  /* ---- Prestige Gold (tr-prestige-gold): a glint now travels round the gold ring ---- */
  .card-tile.prestige-gold:not(.fxd-plain) .rarity-band::after{${FRAME_BAND} inset:auto -3px -3px; height:calc(400% + 6px); border-radius:14px; padding:3px; box-sizing:border-box;
    background:conic-gradient(from var(--fxd-a), transparent 0 300deg, rgba(255,255,230,.95) 335deg, transparent 360deg); ${BORDER_MASK} animation:fxdAngle 3.2s linear infinite;}
  /* ---- Supreme (tr-supreme): a prismatic edge turns round the card; the stat glints stay ---- */
  .card-tile.is-supreme:not(.fxd-plain) .rarity-band::after{${FRAME_BAND} inset:auto -2px -2px; height:calc(400% + 4px); border-radius:14px; padding:2.5px; box-sizing:border-box;
    background:conic-gradient(from var(--fxd-a), hsl(0 100% 70%), hsl(60 100% 65%), hsl(140 100% 60%), hsl(200 100% 65%), hsl(270 100% 72%), hsl(330 100% 70%), hsl(360 100% 70%)); ${BORDER_MASK} animation:fxdAngle 4s linear infinite; filter:saturate(1.2) brightness(1.1);}
  .card-tile.is-supreme:not(.fxd-plain){box-shadow:0 0 10px rgba(200,170,255,.45);}
  /* ---- Shiny mark (tr-shiny-mark): the ✦ cycles colour and throws a four-point flash ---- */
  .shiny-mark:not(.fxd-plain){animation:fxdShinyMark 2.4s ease-in-out infinite;}
  @keyframes fxdShinyMark{0%,100%{transform:scale(.9) rotate(0deg); filter:hue-rotate(0deg) drop-shadow(0 0 2px #fff);} 45%{transform:scale(1.25) rotate(20deg); filter:hue-rotate(160deg) drop-shadow(0 0 6px #fff);} 55%{transform:scale(1) rotate(25deg); filter:hue-rotate(200deg) drop-shadow(0 0 3px #fff);}}
  /* ---- Antique / Classic editions (tr-antique, tr-classic) ---- */
  .card-tile.hof-antique:not(.fxd-plain) .ico{filter:sepia(.55) saturate(.85) contrast(1.05) brightness(.96);}
  .card-tile.hof-antique:not(.fxd-plain) .ico::after{content:''; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
    background:radial-gradient(circle at 18% 22%, rgba(120,70,20,.35) 0 2%, transparent 3.5%), radial-gradient(circle at 72% 64%, rgba(120,70,20,.3) 0 1.6%, transparent 3%), radial-gradient(circle at 60% 18%, rgba(120,70,20,.25) 0 1.2%, transparent 2.4%), radial-gradient(circle at 30% 80%, rgba(120,70,20,.3) 0 2.2%, transparent 3.6%),
      linear-gradient(97deg, transparent 49.4%, rgba(255,250,235,.35) 49.6%, rgba(90,60,20,.25) 50.2%, transparent 50.6%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(90,55,15,.45) 100%);}
  .card-tile.hof-classic:not(.fxd-plain) .ico{filter:saturate(.9) contrast(1.06);}
  .card-tile.hof-classic:not(.fxd-plain) .ico::after{content:''; position:absolute; inset:0; pointer-events:none; border-radius:inherit; box-shadow:inset 0 0 0 4px rgba(245,236,210,.85), inset 0 0 0 5px rgba(120,90,40,.5);
    background:radial-gradient(circle, rgba(40,30,20,.16) 0 .6px, transparent 1px) 0 0/4px 4px;}
  /* ---- Token (tr-token): a printed, perforated token, not just a dashed line ---- */
  .card-tile.is-token:not(.fxd-plain) .ico::after, .board-card.is-token .card-tile:not(.fxd-plain) .ico::after{content:''; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
    background:radial-gradient(circle, rgba(0,0,0,.45) 0 1.4px, transparent 1.8px) 0 0/7px 7px; -webkit-mask-image:linear-gradient(#000 0 0), linear-gradient(#000 0 0); -webkit-mask-clip:border-box, content-box; -webkit-mask-composite:xor; mask-image:linear-gradient(#000 0 0), linear-gradient(#000 0 0); mask-clip:border-box, content-box; mask-composite:exclude; padding:3px; box-sizing:border-box;}
  /* ---- Nest-born marker (tr-nest-born): an egg with a hairline crack that wobbles now and then ---- */
  .spawnbadge:not(.fxd-plain){border-radius:50% 50% 46% 46% / 60% 60% 40% 40% !important; background:radial-gradient(circle at 35% 30%, #fffdf4, #f1e6cc 60%, #cdb98e) !important; border-color:#9a8458 !important; color:#5a4a2a !important; animation:fxdEggWobble 4.5s ease-in-out infinite; transform-origin:50% 90%;}
  @keyframes fxdEggWobble{0%,84%,100%{transform:rotate(0);} 88%{transform:rotate(-12deg);} 92%{transform:rotate(9deg);} 96%{transform:rotate(-4deg);}}
  /* ---- Boss tiles (tr-boss-extended): full-bleed art in a black-iron frame with a red under-glow ---- */
  .card-tile.fxd-boss::before{inset:-2px; border-radius:14px; z-index:3; pointer-events:none; padding:3px; box-sizing:border-box; ${BORDER_MASK}
    background:linear-gradient(115deg, transparent calc(var(--gold-x) - 7%), rgba(255,120,90,.9) var(--gold-x), transparent calc(var(--gold-x) + 7%)), linear-gradient(160deg, #3a3c42, #0e0f12 35%, #4a4c54 60%, #121316); animation:goldStreak 5.5s ease-in-out infinite;}
  .card-tile.fxd-boss{box-shadow:0 6px 14px -4px rgba(200,20,10,.65), 0 0 0 1px #000;}
  .card-tile.fxd-boss .rarity-band::after{${FRAME_BAND} background:radial-gradient(circle at 4% 3%, #8a8f99 0 2px, #2a2c30 2.6px, transparent 3.4px), radial-gradient(circle at 96% 3%, #8a8f99 0 2px, #2a2c30 2.6px, transparent 3.4px), radial-gradient(circle at 4% 97%, #8a8f99 0 2px, #2a2c30 2.6px, transparent 3.4px), radial-gradient(circle at 96% 97%, #8a8f99 0 2px, #2a2c30 2.6px, transparent 3.4px), linear-gradient(0deg, rgba(200,20,10,.3), transparent 22%);}
`;
const framesReady = ()=>{ css('foil-base', FOIL_BASE); css('frames', FRAMES_CSS()); };
framesReady(); // 2026-10-15: the rarity frames are plain CSS on every tile, so they go in at load (one <style>, no work per card)
// Special / Event / Dev rarities (tr-rarity-special): a mark of their own. Lab only: the tile doesn't carry its rarity key
// (Event-Rare wears Rare's colour), so the game would need data-rarity on the tile to hook it. A ribbon, a stamp or a gem.
M.specialMark = function(el, kind, variant){
  const t = tileOf(el); if(!t) return null; kind = kind || 'event';
  css('special', `.fxd-spec{position:absolute; pointer-events:none; z-index:8;}
    .fxd-spec-a{top:9px; right:-20px; width:78px; transform:rotate(38deg); text-align:center; font:900 8px/13px 'Baloo 2', system-ui, sans-serif; letter-spacing:.08em; color:#fff; background:linear-gradient(180deg, #ff7aa8, #c8236a); box-shadow:0 1px 3px rgba(0,0,0,.5); text-shadow:0 1px 0 rgba(0,0,0,.4);}
    .fxd-spec-a.is-dev{background:linear-gradient(180deg, #8a8f99, #3a3e46);} .fxd-spec-a.is-special{background:linear-gradient(180deg, #ffc040, #c87a10);}
    .fxd-spec-b{left:6px; bottom:30%; padding:1px 5px; border:2px solid #d0203a; border-radius:4px; transform:rotate(-12deg); font:900 10px/1.1 'Baloo 2', system-ui, sans-serif; color:#d0203a; background:rgba(255,245,240,.7); opacity:.92; mix-blend-mode:multiply;}
    .fxd-spec-c{top:6px; left:50%; width:16px; height:16px; margin-left:-8px; transform:rotate(45deg); border-radius:3px; background:conic-gradient(from 45deg, #fff, #ff7ad0, #7ad0ff, #fff6a0, #fff); box-shadow:0 0 6px 2px rgba(255,180,230,.8); animation:fxdTwinkle 1.8s ease-in-out infinite;}
    .card-tile:has(> .fxd-spec-a){overflow:hidden;}`);
  t.querySelectorAll(':scope > .fxd-spec').forEach(x=> x.remove());
  const s = document.createElement('span'); s.setAttribute('aria-hidden', 'true');
  const v = (variant || 'A').toUpperCase();
  s.className = 'fxd-spec fxd-spec-' + v.toLowerCase() + ' is-' + kind;
  if(v === 'A') s.textContent = kind === 'dev' ? 'DEV' : kind === 'special' ? 'SPECIAL' : 'EVENT';
  if(v === 'B') s.textContent = kind === 'dev' ? 'DEV' : kind === 'special' ? 'SPECIAL' : 'EVENT 2026';
  t.appendChild(s); return s;
};
// ---- card backs (tr-card-back, tr-future-backing-*) ----
// FX.D.cardBack(el, key): restyles a card back (.po2-back in the pack opener, or any element shaped like a card). The default
// ('acorn') is the old acorn crest, embossed on a woven board with a light catching it; the rest are the planned backings.
const BACKS = {
  acorn:{label:'Acorn crest, embossed', crest:'🌰'},
  otter:{label:'Rivergate: bronze and oxblood weave', crest:'🦦'}, hummingbird:{label:'Sunfeather: jewel feathers', crest:'🌺'},
  road:{label:'Road-folk: patchwork', crest:'🧳'}, hive:{label:'Hive: honeycomb wax', crest:'🐝'}, beast:{label:'Beasts: claw-scored hide', crest:'🐾'},
  m10:{label:'October: harvest moon', crest:'🎃'}, m11:{label:'November: first frost', crest:'❄️'}, m12:{label:'December: lantern night', crest:'🏮'},
};
const BACKS_CSS = `
  .fxd-back{overflow:hidden; isolation:isolate;} .fxd-back:not(.po2-back){position:relative;} /* 2026-10-15: the opener's back is absolute (inset:0); relative collapsed it to a band */
  .fxd-back::before, .fxd-back::after{content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;}
  .fxd-back .po2-back-crest, .fxd-back .fxd-crest{position:relative; z-index:2; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5));}
  .fxd-back::after{background:linear-gradient(115deg, transparent 35%, rgba(255,255,255,.35) 48%, transparent 60%); background-size:300% 100%; animation:fxdSweep 4s ease-in-out infinite; z-index:3; mix-blend-mode:overlay;}
  .fxd-back-acorn{background:radial-gradient(circle at 50% 50%, #7a4e24 0 22%, transparent 23%), repeating-linear-gradient(45deg, #4a2e16 0 4px, #563619 4px 8px), #4a2e16 !important; box-shadow:inset 0 0 0 3px #c8954a, inset 0 0 0 5px #3a2410, inset 0 0 16px rgba(0,0,0,.5) !important;}
  .fxd-back-acorn::before{background:radial-gradient(circle at 50% 50%, transparent 24%, rgba(255,220,150,.5) 25%, transparent 27%, transparent 33%, rgba(255,220,150,.3) 34%, transparent 35.5%);}
  .fxd-back-otter{background:repeating-linear-gradient(45deg, #7a2a22 0 5px, #a8463c 5px 6px, #6a2018 6px 11px), repeating-linear-gradient(-45deg, rgba(200,140,70,.4) 0 5px, transparent 5px 11px), #7a2a22 !important; box-shadow:inset 0 0 0 3px #c98a3e, inset 0 0 0 5px #2a6a78, inset 0 0 16px rgba(0,0,0,.45) !important;}
  .fxd-back-otter::before{background:${WAVE_EMBLEM} 50% 72%/56% auto no-repeat; opacity:.55;}
  .fxd-back-hummingbird{background:radial-gradient(circle at 50% 100%, transparent 50%, rgba(255,255,255,.5) 56%, transparent 64%) 0 0/16px 12px, radial-gradient(circle at 50% 100%, transparent 50%, rgba(255,255,255,.5) 56%, transparent 64%) 8px 6px/16px 12px, linear-gradient(160deg, #e3197a, #14c4c4 35%, #8fd61c 65%, #3b2fd0) !important; box-shadow:inset 0 0 0 3px #f6e2c0, inset 0 0 0 5px #3a3a48 !important;}
  .fxd-back-road{background:linear-gradient(90deg, transparent 49.5%, rgba(255,240,200,.6) 49.5% 50.5%, transparent 50.5%) 0 0/100% 100%, linear-gradient(0deg, transparent 49.5%, rgba(255,240,200,.6) 49.5% 50.5%, transparent 50.5%), conic-gradient(#6a4a2a 0 90deg, #3a3a6a 90deg 180deg, #8a6a3a 180deg 270deg, #5a3a2a 270deg) !important; box-shadow:inset 0 0 0 3px #d8b070, inset 0 0 0 4px #2a1a0a !important;}
  .fxd-back-road::before{border:1.5px dashed rgba(255,235,190,.7); inset:6px; border-radius:6px;}
  .fxd-back-hive{background:${HEX_CELLS} 0 0/14px 24.5px, linear-gradient(160deg, #e8a21a, #8a5200) !important; box-shadow:inset 0 0 0 3px #ffd45a, inset 0 0 0 5px #4a2a00 !important;}
  .fxd-back-beast{background:linear-gradient(160deg, #3a3020, #1e2a1a) !important; box-shadow:inset 0 0 0 3px #6a5a3a, inset 0 0 0 4px #000 !important;}
  .fxd-back-beast::before{background:${svgUrl(SVG(`<g stroke='#0a0a06' stroke-width='5' stroke-linecap='round' fill='none'><path d='M30 20 Q44 60 50 120'/><path d='M46 16 Q60 56 66 116'/><path d='M62 18 Q74 54 80 108'/></g><g stroke='#ff7a2a' stroke-width='.8' fill='none' stroke-opacity='.8'><path d='M46 16 Q60 56 66 116'/></g>`))} 0 0/100% 100% no-repeat;}
  .fxd-back-m10{background:radial-gradient(circle at 50% 38%, #ffcf6a 0 18%, #ff8a1a 19% 21%, transparent 22%), linear-gradient(180deg, #2a1240, #5a2a10) !important; box-shadow:inset 0 0 0 3px #ff9a2a, inset 0 0 0 5px #1a0a20 !important;}
  .fxd-back-m11{background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.8) 0 1px, transparent 2px) 0 0/13px 17px, linear-gradient(180deg, #a8d8ff, #3a6aa8) !important; box-shadow:inset 0 0 0 3px #e6f6ff, inset 0 0 0 5px #1a3a6a !important;}
  .fxd-back-m12{background:radial-gradient(circle at 50% 50%, rgba(255,200,90,.85) 0 14%, rgba(255,120,40,.3) 26%, transparent 40%), linear-gradient(180deg, #0a1030, #2a1a40) !important; box-shadow:inset 0 0 0 3px #ffb84a, inset 0 0 0 5px #000 !important;}
  @media (prefers-reduced-motion: reduce){ .fxd-back::after{animation:none;} }`;
M.BACKS = BACKS;
M.cardBack = function(el, key){
  if(!el || !BACKS[key]) return el; css('backs', BACKS_CSS); css('foil-base', FOIL_BASE);
  el.className = el.className.replace(/\bfxd-back(-[\w]+)?\b/g, '').trim() + ' fxd-back fxd-back-' + key;
  const crest = el.querySelector('.po2-back-crest') || el.querySelector('.fxd-crest');
  if(crest) crest.textContent = BACKS[key].crest; else { const c = document.createElement('span'); c.className = 'fxd-crest'; c.textContent = BACKS[key].crest; el.appendChild(c); }
  return el;
};
// ---- future frames by people / theme (lab concepts, 2026-10-15) ----
const FRAMES = {
  'otter-a':{label:'Bronze and oxblood, wave crest', css:S=>`${S}{box-shadow:inset 0 0 0 3px #c98a3e, inset 0 0 0 5px #6a1e18, inset 0 0 0 6px #2a6a78, 0 0 0 1px #3a1a0a;}
    ${S} .fxd-frx::before{inset:auto 30% auto; top:-1px; height:12%; background:${WAVE_EMBLEM} center/contain no-repeat, radial-gradient(ellipse at 50% 0, #6a1e18 0 60%, transparent 62%); filter:drop-shadow(0 1px 1px #000);}
    ${S} .fxd-frx::after{background:linear-gradient(115deg, transparent 40%, rgba(255,230,180,.55) 50%, transparent 60%); background-size:300% 100%; padding:5px; ${BORDER_MASK} animation:fxdSweep 4.5s ease-in-out infinite;}`},
  'otter-b':{label:'River banner', css:S=>`${S}{box-shadow:inset 0 0 0 3px #f2e6cc, inset 0 0 0 6px #2a5a8a;}
    ${S} .fxd-frx::before{top:auto; height:16%; bottom:20%; background:${WAVES} 0 50%/30px 9px repeat-x; opacity:.85; animation:fxdTide 3s linear infinite; filter:drop-shadow(0 0 2px #2a6aaa);}`},
  'hummingbird-a':{label:'Jewel studs on cliff stone', css:S=>`${S}{box-shadow:inset 0 0 0 4px #8a8478, inset 0 0 0 5px #3a3630;}
    ${S} .fxd-frx i{width:9px; height:9px; margin:-4.5px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff, var(--c) 45%, #000 120%); box-shadow:0 0 5px var(--c); animation:fxdTwinkle 2.6s ease-in-out infinite; animation-delay:var(--dl);}`, bits:[[4, 3, '#e3197a'], [96, 3, '#14c4c4'], [4, 97, '#8fd61c'], [96, 97, '#ff8a1a'], [50, 2, '#ffd21a'], [2, 50, '#3b2fd0'], [98, 50, '#e3197a']]},
  'hummingbird-b':{label:'Feather fringe', css:S=>`${S} .fxd-frx::before{background:radial-gradient(ellipse 6px 12px at 50% 0, var(--c1, #14c4c4) 60%, transparent 64%) 0 -4px/12px 14px repeat-x, radial-gradient(ellipse 6px 12px at 50% 100%, #e3197a 60%, transparent 64%) 6px calc(100% + 4px)/12px 14px repeat-x; filter:drop-shadow(0 0 2px rgba(0,0,0,.6)); animation:fxdFlutter 3s ease-in-out infinite;}
    @keyframes fxdFlutter{50%{background-position:3px -3px, 9px calc(100% + 3px);}}
    ${S}{box-shadow:inset 0 0 0 2px #8fd61c;}`},
  'road-a':{label:'Dusty patchwork, stitched', css:S=>`${S}{box-shadow:inset 0 0 0 4px #8a6a3a, inset 0 0 0 5px #3a3a6a;}
    ${S} .fxd-frx::before{inset:3px; border:1.5px dashed rgba(255,235,190,.85); border-radius:10px;}
    ${S} .fxd-frx::after{inset:auto auto 24% 4px; width:22%; height:16%; background:#3a3a6a; border:1px dashed #d8c8a0; transform:rotate(-6deg); opacity:.9;}`},
  'road-b':{label:'Lantern amber corners', css:S=>`${S}{box-shadow:inset 0 0 0 3px #6a4a2a;}
    ${S} .fxd-frx::before{background:radial-gradient(circle at 0 0, rgba(255,190,90,.75), transparent 22%), radial-gradient(circle at 100% 0, rgba(255,190,90,.6), transparent 20%); mix-blend-mode:screen; animation:fxdLantern 2.2s ease-in-out infinite;}
    @keyframes fxdLantern{0%,100%{opacity:.75;} 40%{opacity:1;} 55%{opacity:.6;} 70%{opacity:.95;}}`},
  'beast-a':{label:'Claw-scored, one ember', css:S=>`${S}{box-shadow:inset 0 0 0 3px #3a3a20, inset 0 0 0 4px #000;}
    ${S} .fxd-frx::before{inset:0 0 auto auto; width:40%; height:30%; background:${svgUrl(SVG(`<g stroke='#120c06' stroke-width='7' stroke-linecap='round'><path d='M40 4 L92 60'/><path d='M22 6 L84 80'/><path d='M8 14 L66 92'/></g>`))} center/100% 100% no-repeat; opacity:.85;}
    ${S} .fxd-frx i{left:12%; top:10%; width:5px; height:5px; border-radius:50%; background:#ffb04a; box-shadow:0 0 6px 2px #ff6a10; animation:fxdBreathe 1.6s ease-in-out infinite;}`, bits:[[12, 10]]},
  'beast-b':{label:'Shaggy edge', css:S=>`${S} .fxd-frx::before{background:repeating-conic-gradient(from 0deg at 50% 50%, transparent 0 3deg, rgba(40,30,20,.0) 3deg 6deg); box-shadow:inset 0 0 0 3px #4a3a24; padding:4px; ${BORDER_MASK} background:repeating-linear-gradient(80deg, #2a2014 0 2px, #5a4628 2px 4px, #3a2c1a 4px 5px);}`},
  'hive-a':{label:'Honeycomb wax', css:S=>`${S} .fxd-frx::before{padding:6%; ${BORDER_MASK} background:${HEX_CELLS} 0 0/10px 17.5px, linear-gradient(160deg, #ffd45a, #c87a10); filter:drop-shadow(0 0 1px #000);}
    ${S}{box-shadow:inset 0 0 0 1px #6a3a00;}`},
  'hive-b':{label:'Riveted plate, acid lamp', css:S=>`${S}{box-shadow:inset 0 0 0 4px #5a5e64, inset 0 0 0 5px #1a1c20;}
    ${S} .fxd-frx::before{background:radial-gradient(circle at 5% 4%, #c8ccd2 0 1.5px, #3a3c40 2px, transparent 2.6px), radial-gradient(circle at 95% 4%, #c8ccd2 0 1.5px, #3a3c40 2px, transparent 2.6px), radial-gradient(circle at 5% 96%, #c8ccd2 0 1.5px, #3a3c40 2px, transparent 2.6px), radial-gradient(circle at 95% 96%, #c8ccd2 0 1.5px, #3a3c40 2px, transparent 2.6px);}
    ${S} .fxd-frx i{left:88%; top:8%; width:8px; height:12px; border-radius:3px; background:linear-gradient(180deg, #e8ff9a, #a8f02a 60%, #5a8a10); box-shadow:0 0 8px 2px rgba(190,255,60,.85); animation:fxdBreathe 1.3s ease-in-out infinite;}`, bits:[[88, 8]]},
  'folktale-a':{label:'Painted storybook border', css:S=>`${S}{box-shadow:inset 0 0 0 5px #f2e2b8, inset 0 0 0 6px #8a5a2a;}
    ${S} .fxd-frx::before{background:${VINES} 0 0/100% 100% no-repeat; opacity:.8; filter:sepia(.4) saturate(1.4);}
    ${S} .fxd-frx::after{inset:2px; border-radius:10px; box-shadow:inset 0 0 12px rgba(120,80,30,.45);}`},
  'folktale-b':{label:'Gilded page, illuminated corner', css:S=>`${S}{box-shadow:inset 0 0 0 3px #e8c070, inset 0 0 0 4px #6a4a10;}
    ${S} .fxd-frx::before{inset:6% auto auto 6%; width:26%; height:20%; border-radius:4px; background:radial-gradient(circle at 50% 50%, #c8102e 0 30%, transparent 31%), conic-gradient(from 0deg, #ffe08a, #b8841c, #fff4c2, #b8841c, #ffe08a); box-shadow:0 0 0 1px #6a4a10; opacity:.9;}`},
  'oriental-a':{label:'Ink-wash border, red seal', css:S=>`${S} .fxd-frx::before{padding:7%; ${BORDER_MASK} background:${noise('.03 .09', 2, 61, '0 0 0 0 .08  0 0 0 0 .08  0 0 0 0 .1  0 0 0 -2.2 1.6', 'fractalNoise', 140)}; background-size:140px 140px; opacity:.85;}
    ${S} .fxd-frx::after{inset:auto 6% 23% auto; width:15%; height:11%; background:${SEAL} center/contain no-repeat;}`},
  'oriental-b':{label:'Red lacquer and gold clouds', css:S=>`${S}{box-shadow:inset 0 0 0 4px #a8141a, inset 0 0 0 5px #e8c070;}
    ${S} .fxd-frx::before{padding:5px; ${BORDER_MASK} background:radial-gradient(circle at 50% 100%, transparent 40%, #f2cf6a 44%, transparent 50%) 0 0/12px 7px, #a8141a; opacity:.95;}`},
  'spy-a':{label:'Dossier edge, redaction bars', css:S=>`${S}{box-shadow:inset 0 0 0 3px #d8c08a, inset 0 0 0 4px #2a2a2a;}
    ${S} .fxd-frx::before{inset:auto 8% 32% 8%; height:6%; background:#0b0b0e; transform-origin:0 50%; animation:fxdRedact 6s cubic-bezier(.6,0,.3,1) infinite;}
    ${S} .fxd-frx::after{inset:8% 8% auto auto; width:44%; height:14%; background:${STAMP} center/contain no-repeat; opacity:.85;}`},
  'spy-b':{label:'Night-vision scope', css:S=>`${S} .fxd-frx::before{background:repeating-linear-gradient(0deg, rgba(120,255,140,.14) 0 1px, transparent 1px 3px), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,30,0,.75) 100%); mix-blend-mode:hard-light;}
    ${S} .fxd-frx::after{background:linear-gradient(180deg, transparent, rgba(160,255,170,.35) 50%, transparent) 0 0/100% 30% no-repeat; animation:fxdScanDown 2.6s linear infinite;}
    @keyframes fxdScanDown{from{background-position:0 -40%;} to{background-position:0 140%;}}`},
  'veggies-a':{label:'Vine-wrapped, soil smudges', css:S=>`${S}{box-shadow:inset 0 0 0 3px #4a3a20;}
    ${S} .fxd-frx::before{background:${VINES} 0 0/100% 100% no-repeat;}
    ${S} .fxd-frx::after{background:radial-gradient(ellipse at 8% 92%, rgba(80,50,20,.55), transparent 16%), radial-gradient(ellipse at 90% 86%, rgba(80,50,20,.45), transparent 12%), radial-gradient(ellipse at 70% 6%, rgba(80,50,20,.35), transparent 10%);}`},
  'veggies-b':{label:'Garden crate slats', css:S=>`${S} .fxd-frx::before{padding:6%; ${BORDER_MASK} background:repeating-linear-gradient(0deg, #a8743a 0 6px, #8a5a28 6px 7px), #a8743a; filter:drop-shadow(0 0 1px #000);}
    ${S} .fxd-frx::after{inset:auto 0 0; height:12%; background:repeating-linear-gradient(90deg, #8a5a28 0 8px, #6a4418 8px 9px); opacity:.85;}`},
  'living-a':{label:'Living ink border (writhes)', css:S=>`${S} .fxd-frx::before{padding:5%; ${BORDER_MASK} background:#0e0c14; filter:url(#fxdInkF);}
    ${S}{box-shadow:none;}`},
  'living-b':{label:'Ink tendrils creep from the corners', css:S=>`${S} .fxd-frx::before{background:${svgUrl(SVG(`<path d='${threadPath('tendril', 4)}' fill='none' stroke='#0e0c14' stroke-width='1.6' stroke-linecap='round'/>`))} 0 0/100% 100% no-repeat; ${CORNER_MASK} animation:fxdGrowCorners 8s ease-in-out infinite;}`},
};
M.FRAMES = FRAMES;
M.frame = function(el, key){
  const t = tileOf(el), f = FRAMES[key]; if(!t || !f) return t;
  css('foil-base', FOIL_BASE);
  css('frame-' + key, `.card-tile.fxd-fr-${key} .fxd-frx{position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:5;}
    .card-tile.fxd-fr-${key} .fxd-frx::before, .card-tile.fxd-fr-${key} .fxd-frx::after{content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background-repeat:no-repeat;}
    .card-tile.fxd-fr-${key} .fxd-frx i{position:absolute; left:var(--x); top:var(--y); display:block;}` + f.css('.card-tile.fxd-fr-' + key));
  if(key === 'living-a' && !document.getElementById('fxdInkSvg')){
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'fxdInkSvg'; s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.style.position = 'absolute'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<filter id="fxdInkF"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="5"><animate attributeName="seed" dur="2.4s" values="1;2;3;4;5;6;7;8" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="5"/></filter>`;
    document.body.appendChild(s); }
  t.querySelectorAll(':scope > .fxd-frx').forEach(x=> x.remove());
  t.className = t.className.replace(/\bfxd-fr-[\w-]+/g, '').trim() + ' fxd-frame fxd-fr-' + key;
  const x = document.createElement('span'); x.className = 'fxd-frx'; x.setAttribute('aria-hidden', 'true');
  x.innerHTML = (f.bits || []).map((b, k)=> `<i style="--x:${b[0]}%; --y:${b[1]}%; --dl:${(-k*.4).toFixed(1)}s;${b[2] ? ` --c:${b[2]};` : ''}"></i>`).join('');
  t.appendChild(x); return t;
};
// Breathing art (tr-future-breathing-art): A parallax — the art and a soft foreground haze slide against each other with the
// light; B slow breath — the art swells a hair and settles. Both run on a loop until stop() (the lab calls it).
M.breathingArt = function(el, opts){
  const t = tileOf(el), g = G(); if(!t || !g) return {stop(){}};
  const art = t.querySelector('.ico'); if(!art) return {stop(){}};
  css('breath', `.fxd-haze{position:absolute; inset:-6%; pointer-events:none; z-index:2; background:radial-gradient(ellipse at 30% 80%, rgba(255,255,255,.28), transparent 40%), radial-gradient(ellipse at 80% 30%, rgba(255,250,230,.2), transparent 35%); filter:blur(2px);}`);
  if(opts && opts.variant === 'B'){ const tw = g.to(art, {scale:1.035, duration:2.2, ease:'sine.inOut', yoyo:true, repeat:-1, transformOrigin:'50% 60%'});
    return {stop(){ tw.kill(); g.set(art, {clearProps:'scale,transformOrigin'}); }}; }
  const hz = document.createElement('span'); hz.className = 'fxd-haze'; t.appendChild(hz);
  const o = {a:0}; const tw = g.to(o, {a:Math.PI*2, duration:5, ease:'none', repeat:-1, onUpdate:()=>{ const x = Math.cos(o.a), y = Math.sin(o.a);
    g.set(art, {x:x*3, y:y*2, scale:1.06}); g.set(hz, {x:-x*6, y:-y*4}); }});
  return {stop(){ tw.kill(); hz.remove(); g.set(art, {clearProps:'x,y,scale'}); }};
};
// Hero portrait change at Lv 25/50/100 (tr-future-hero-portraits): A — a ring of light closes over the art, it swaps, the level
// banner drops; B — the frame steps up (bronze → silver → gold) with a flash instead.
M.heroPortrait = function(el, opts){
  opts = opts || {}; const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  const art = t.querySelector('.ico'), c = centre(t), lv = opts.level || 25;
  css('heroport', `.fxd-hring{position:fixed; border-radius:50%; border:3px solid #fff3c0; box-shadow:0 0 14px 4px rgba(255,220,120,.8), inset 0 0 14px rgba(255,220,120,.7); pointer-events:none; z-index:1200;}
    .fxd-hbanner{position:fixed; transform:translate(-50%,-50%); font:900 15px/1 'Baloo 2', system-ui, sans-serif; color:#3a2400; background:linear-gradient(180deg, #fff3c0, #f0b83a); padding:4px 12px; border-radius:999px; box-shadow:0 2px 8px rgba(0,0,0,.4); pointer-events:none; z-index:1201; white-space:nowrap;}
    .fxd-hframe{position:fixed; border-radius:12px; pointer-events:none; z-index:1200;}`);
  if(opts.variant === 'B'){
    const cols = ['#c98a3e', '#d8dde6', '#ffd75e'], fr = layer('fxd-hframe'); g.set(fr, {left:c.r.left - 3, top:c.r.top - 3, width:c.w + 6, height:c.h + 6});
    const tl = g.timeline();
    cols.forEach((col, i)=> tl.add(()=>{ fr.style.boxShadow = `0 0 0 3px ${col}, 0 0 16px 4px ${col}`; snd('readyChime'); }, i*.45).fromTo(fr, {opacity:.3, scale:1.08}, {opacity:1, scale:1, duration:.3, ease:'back.out(2)'}, i*.45));
    return new Promise(res=> tl.to(fr, {opacity:0, duration:.5}, '+=.4').add(()=>{ fr.remove(); res(); }));
  }
  const ring = layer('fxd-hring'), ban = layer('fxd-hbanner'); ban.textContent = '★ Lv ' + lv + ' portrait';
  const s = Math.max(c.w, c.h)*1.3; g.set(ring, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, scale:1.2, opacity:0}); g.set(ban, {left:c.x, top:c.r.top - 4, opacity:0, y:-14});
  snd('heroLevel');
  return new Promise(res=> g.timeline({onComplete:()=>{ ring.remove(); ban.remove(); if(art) g.set(art, {clearProps:'filter,scale'}); res(); }})
    .to(ring, {opacity:1, scale:.55, duration:.45, ease:'power2.in'})
    .to(art, {filter:'brightness(3) saturate(0)', duration:.15}, '-=.15')
    .add(()=>{ if(art) art.style.setProperty('--fxd-swap', '1'); })
    .to(art, {filter:'brightness(1) saturate(1.2) hue-rotate(25deg)', scale:1.04, duration:.4, ease:'power2.out'})
    .to(ring, {scale:1.6, opacity:0, duration:.5, ease:'power2.out'}, '<')
    .to(ban, {opacity:1, y:0, duration:.35, ease:'back.out(2)'}, '<.1')
    .to(ban, {opacity:0, y:-10, duration:.3, delay:.8}));
};
// Unlock a locked card (tr-locked B): the padlock shakes, the shackle springs, the lock drops away, colour floods back.
M.unlockBreak = function(el, opts){
  const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  css('unlock', `.fxd-lock{position:fixed; width:30px; height:34px; margin:-17px -15px; pointer-events:none; z-index:1201;}
    .fxd-lock b{position:absolute; left:3px; right:3px; bottom:0; height:21px; border-radius:5px; background:linear-gradient(180deg, #e8c060, #a8741a); box-shadow:inset 0 -2px 0 rgba(0,0,0,.25), 0 2px 4px rgba(0,0,0,.4);}
    .fxd-lock b::after{content:''; position:absolute; left:50%; top:7px; width:5px; height:8px; margin-left:-2.5px; border-radius:3px; background:#3a2408;}
    .fxd-lock s{position:absolute; left:8px; right:8px; top:0; height:20px; border:4px solid #b8bec8; border-bottom:none; border-radius:12px 12px 0 0;}`);
  const c = centre(t), lk = layer('fxd-lock', '<s></s><b></b>'); g.set(lk, {x:c.x, y:c.y}); const sh = lk.querySelector('s');
  t.classList.add('locked');
  return new Promise(res=> g.timeline({onComplete:()=>{ lk.remove(); g.set(t, {clearProps:'filter'}); res(); }})
    .to(lk, {rotation:12, duration:.06, yoyo:true, repeat:5, ease:'sine.inOut'})
    .add(()=> snd('lockBreak'))
    .to(sh, {y:-9, rotation:-25, transformOrigin:'0% 100%', duration:.18, ease:'back.out(3)'})
    .add(()=> t.classList.remove('locked'))
    .fromTo(t, {filter:'grayscale(1) brightness(.8)'}, {filter:'grayscale(0) brightness(1.25)', duration:.35})
    .to(lk, {y:c.y + 60, rotation:40, opacity:0, duration:.5, ease:'power2.in'}, '<')
    .to(t, {filter:'grayscale(0) brightness(1)', duration:.3}));
};
// Skin swap (tr-skins B): a shimmer sweeps across and leaves the card in its new skin.
M.skinSwap = function(el, skinCls, opts){
  const t = tileOf(el), g = G(); if(!t || !g) return Promise.resolve();
  return new Promise(res=>{ M.foilGlint(t, {dur:.5}); later(()=>{ (t.className.match(/\bskin-[\w-]+/g) || []).forEach(k=> t.classList.remove(k)); if(skinCls) t.classList.add(skinCls); snd('readyChime'); }, 260);
    g.fromTo(t, {scale:1}, {scale:1.06, duration:.2, yoyo:true, repeat:1, delay:.2, clearProps:'scale', onComplete:()=> later(res, 300)}); });
};

// ======================= PACKS =======================
// The pack opener (openPackAnimation, .po2-*) calls four hooks (2026-10-15): packShown (the sealed pack), packTorn (the strip
// rips), packCardUp (a face-down card becomes the current one) and packCardRevealed (it flips). From them: pack dressing per
// pack type, a tear flourish per pack type, themed card backs, a build-up for Mythic-and-up, a reveal of its own for each top
// rarity (Mythic, Ancient, Divine, Void, Daemonic), a flourish for Heroic and Legendary, the foil and shiny pull moments and the
// duplicate thunk. Everything is fixed overlays on <body> (the opener redraws its stage between cards) and cleans up after itself.
const PACK_CSS = `
  .fxd-dim{position:fixed; inset:0; pointer-events:none; z-index:1190;}
  .fxd-dot{position:fixed; width:6px; height:6px; margin:-3px; border-radius:50%; pointer-events:none; z-index:1201;}
  .fxd-ring{position:fixed; border-radius:50%; pointer-events:none; z-index:1200;}
  .fxd-txt{position:fixed; transform:translate(-50%,-50%); pointer-events:none; z-index:1202; white-space:nowrap; font:900 22px/1 'Baloo 2', system-ui, sans-serif; letter-spacing:.06em;}
  .fxd-box{position:fixed; pointer-events:none; z-index:1199;}
  .fxd-ico{position:fixed; margin:-10px; font-size:18px; line-height:20px; width:20px; text-align:center; pointer-events:none; z-index:1201; font-style:normal;}`;
const packCss = ()=> css('pack', PACK_CSS);
const vw = ()=> root.innerWidth || document.documentElement.clientWidth, vh = ()=> root.innerHeight || document.documentElement.clientHeight;
// n dots flying out of (x, y): cols is a colour list; returns the timeline's promise.
function burstAt(x, y, n, cols, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve(); packCss(); const ds = [];
  for(let k = 0; k < n; k++){ const d = layer('fxd-dot'); const col = cols[k % cols.length]; d.style.background = col; d.style.boxShadow = `0 0 6px 1px ${col}`; if(o.size) d.style.width = d.style.height = o.size + 'px'; ds.push(d);
    g.set(d, {x, y, scale:o.scale || 1}); }
  return new Promise(res=> g.timeline({onComplete:()=>{ ds.forEach(d=> d.remove()); res(); }})
    .to(ds, {x:(i)=> x + Math.cos(i/n*Math.PI*2 + rnd(-.3, .3))*rnd(o.r0 || 60, o.r1 || 150), y:(i)=> y + Math.sin(i/n*Math.PI*2 + rnd(-.3, .3))*rnd(o.r0 || 60, o.r1 || 150) + (o.fall || 0),
      opacity:0, scale:.3, duration:o.dur || .9, ease:'power2.out', stagger:o.stagger || 0}));
}
function ringAt(x, y, size, style, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve(); packCss(); const r = layer('fxd-ring'); Object.assign(r.style, style || {border:'3px solid #fff'});
  g.set(r, {left:x - size/2, top:y - size/2, width:size, height:size, scale:o.from || .3, opacity:o.op || 1});
  return new Promise(res=> g.to(r, {scale:o.to || 2.2, opacity:0, duration:o.dur || .7, delay:o.delay || 0, ease:o.ease || 'power2.out', onComplete:()=>{ r.remove(); res(); }}));
}
function dimScreen(col, inDur, hold, outDur, c){
  const g = G(); if(!g) return Promise.resolve(); packCss(); const d = layer('fxd-dim'); d.style.background = col || 'rgba(0,0,0,.55)';
  if(c){ const hole = `linear-gradient(#000 0 0) ${f1(c.r.left)}px ${f1(c.r.top)}px/${f1(c.w)}px ${f1(c.h)}px no-repeat`; // 2026-10-15: dim everything but the card
    d.style.cssText += `-webkit-mask:linear-gradient(#000 0 0) 0 0/100% 100% no-repeat, ${hole}; -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) 0 0/100% 100% no-repeat, ${hole}; mask-composite:exclude;`; }
  return new Promise(res=> g.timeline({onComplete:()=>{ d.remove(); res(); }}).fromTo(d, {opacity:0}, {opacity:1, duration:inDur || .25}).to(d, {opacity:0, duration:outDur || .5}, '+=' + (hold || .6)));
}
// 2026-10-15: where a reveal's word goes: stamped across the lower art, so it is never clipped by the top of the screen or
// the lab dock.
// (Above the card it collided with the game's NEW! stamp, so it always goes across the lower art.)
function lblY(c){ return c.y + c.h*.16; }
// A quick tap to the next card must not leave the last reveal's word, dim or moon over it.
// Every reveal runs inside one GSAP context, so the next card can stop the last reveal's timeline before its later beats
// (the word, the stamp, more sparks) fire, put the card back as it was, and drop the overlays still on screen.
let REV = null;
function inReveal(fn){ const g = G(); if(!g || !g.context){ call(fn); return; } if(!REV) REV = g.context(()=>{}); try{ REV.add(fn); }catch(e){} }
function clearReveal(){
  if(!REV) return; try{ REV.revert(); }catch(e){} REV = null; // (no reveal yet: leave the tear's coins and feathers alone)
  document.querySelectorAll('.fxd.fxd-txt, .fxd.fxd-dim, .fxd.fxd-behind, .fxd.fxd-box, .fxd.fxd-ring, .fxd.fxd-dot, .fxd.fxd-stamp, .fxd.fxd-rainbow, .fxd.fxd-ico').forEach(e=> e.remove()); }
M.clearReveal = clearReveal;
// 2026-10-15: a full-screen layer with a hole where the card is, so a moon / rays / rune circle reads as *behind* the card
// even though every overlay sits on <body> above the opener. Children are absolute in viewport coordinates.
function backLayer(c){
  const w = layer('fxd-behind'); const hole = `linear-gradient(#000 0 0) ${f1(c.r.left)}px ${f1(c.r.top)}px/${f1(c.w)}px ${f1(c.h)}px no-repeat`;
  w.style.cssText += `width:100vw; height:100vh; overflow:hidden; z-index:1191; -webkit-mask:linear-gradient(#000 0 0) 0 0/100% 100% no-repeat, ${hole}; -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) 0 0/100% 100% no-repeat, ${hole}; mask-composite:exclude;`;
  return w;
}
function textPop(x, y, txt, style, o){
  o = o || {}; const g = G(); if(!g) return Promise.resolve(); packCss(); const t = layer('fxd-txt'); t.textContent = txt; Object.assign(t.style, style || {});
  g.set(t, {left:x, top:y, scale:2.4, opacity:0, rotation:o.rot || 0});
  return new Promise(res=> g.timeline({onComplete:()=>{ t.remove(); res(); }}).to(t, {scale:1, opacity:1, duration:.28, ease:'back.out(2.2)', delay:o.delay || 0}).to(t, {opacity:0, y:'-=14', duration:.35}, '+=' + (o.hold || .7)));
}
const shake = (el, amt, dur)=>{ const g = G(); if(!g || !el) return; g.fromTo(el, {x:0}, {x:amt || 6, duration:.04, repeat:Math.round((dur || .3)/.04), yoyo:true, ease:'sine.inOut', clearProps:'x'}); };
const cardTile = el=> (el && (el.querySelector('.po2-front .card-tile') || el.querySelector('.card-tile'))) || tileOf(el);
const TOP = ['mythic', 'ancient', 'divine', 'void', 'daemonic'];
const rarityKey = d=>{ const r = d && d.rarity; const as = {devancient:'ancient'}; return as[r] || r || 'common'; };
// ---- the build-up while a top-rarity card waits face down (packCardUp) ----
// Loops until stopped (the reveal stops it). Mythic: heartbeat pulses; Ancient: runes circle beneath; Divine: light from above;
// Void: the back crawls with static; Daemonic: black smoke at the edges.
M.packTease = function(card, rarity){
  const g = G(); if(!card || !g) return {stop(){}}; packCss();
  css('tease', `.fxd-tease{position:absolute; inset:-8px; border-radius:16px; pointer-events:none; z-index:-1;}
    .fxd-tease-mythic{box-shadow:0 0 22px 6px rgba(220,30,30,.75);} .fxd-tease-ancient{background:${RUNE_RING} center/150% auto no-repeat; opacity:.75; filter:drop-shadow(0 0 4px #3a7aff);}
    .fxd-tease-divine{inset:-60px -10px -6px; border-radius:0; background:linear-gradient(180deg, rgba(255,250,220,0), rgba(255,250,220,.55) 40%, rgba(255,250,220,.0)); filter:blur(4px);}
    .fxd-tease-void{inset:0; z-index:5; border-radius:12px; background:${noise('.9', 1, 2, '0 0 0 0 .7  0 0 0 0 .55  0 0 0 0 1  0 0 0 -1.4 1.1', 'fractalNoise', 120)}; background-size:120px 120px; animation:fxdStatic .4s steps(5) infinite; mix-blend-mode:screen; opacity:.55;}
    .fxd-tease-daemonic{inset:-14px; border-radius:20px; background:radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.85) 75%, transparent 92%); filter:blur(3px);}`);
  const host = card.querySelector('.po2-flip') || card; const t = document.createElement('span'); t.className = 'fxd-tease fxd-tease-' + rarity; t.setAttribute('aria-hidden', 'true');
  if(getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(t); const tws = [];
  if(rarity === 'mythic'){ snd('heartbeat', false); tws.push(g.timeline({repeat:-1}).to(t, {opacity:1, duration:.08}).to(t, {opacity:.25, duration:.2}).to(t, {opacity:.9, duration:.08}).to(t, {opacity:.15, duration:.5}));
    tws.push(g.timeline({repeat:-1}).to(card, {scale:1.04, duration:.08}).to(card, {scale:1, duration:.2}).to(card, {scale:1.03, duration:.08}).to(card, {scale:1, duration:.5})); }
  if(rarity === 'ancient') tws.push(g.fromTo(t, {rotation:0, opacity:0}, {rotation:360, opacity:.8, duration:8, ease:'none', repeat:-1}));
  if(rarity === 'divine') tws.push(g.fromTo(t, {opacity:.3}, {opacity:1, duration:.9, yoyo:true, repeat:-1, ease:'sine.inOut'}));
  if(rarity === 'void') tws.push(g.to(card, {x:1.5, duration:.05, yoyo:true, repeat:-1, ease:'steps(1)'}));
  if(rarity === 'daemonic') tws.push(g.fromTo(t, {scale:1.1, opacity:.4}, {scale:.97, opacity:1, duration:1.1, yoyo:true, repeat:-1, ease:'sine.inOut'}));
  const h = {stop(){ tws.forEach(w=> w.kill()); t.remove(); g.set(card, {clearProps:'x,scale'}); }};
  card.__fxdTease = h; return h;
};
// ---- top-rarity reveals (pack-reveal-mythic … daemonic), three takes each ----
const REVEAL = {
  mythic:{
    A:(card, c)=>{ snd('heartbeat', true); snd('rareRise', true);  // red flare, the screen dims, a heartbeat
      const g = G(); dimScreen('radial-gradient(circle at ' + c.x + 'px ' + c.y + 'px, rgba(60,0,0,.25), rgba(20,0,0,.78) 60%)', .2, 1.1, .6, c);
      const tl = g.timeline();
      [0, .32].forEach(at=> tl.add(()=>{ ringAt(c.x, c.y, c.h*.9, {border:'3px solid rgba(255,60,40,.9)', boxShadow:'0 0 18px rgba(255,40,20,.8)'}, {to:2.4, dur:.6}); }, at).fromTo(card, {scale:1}, {scale:1.08, duration:.07, yoyo:true, repeat:1, ease:'power2.out'}, at));
      tl.add(()=>{ burstAt(c.x, c.y, 22, ['#ff3a1a', '#ffb04a', '#fff1c0'], {r0:80, r1:220, dur:1}); ringAt(c.x, c.y, c.h*.6, {background:'radial-gradient(circle, rgba(255,240,200,.95), rgba(255,60,20,.6) 40%, transparent 70%)'}, {to:4, dur:.55});
        textPop(c.x, lblY(c), 'MYTHIC', {color:'#ffd9c8', textShadow:'0 0 10px #ff2a10, 0 2px 0 #5a0000'}, {hold:.9}); }, .7);
      return tl.to({}, {duration:1.5}); },
    B:(card, c)=>{ snd('nightSwell'); snd('rareRise', true); const g = G(); packCss();  // a blood moon rises behind the card
      const back = backLayer(c), moon = layer('fxd-box', '', back); moon.style.cssText += 'border-radius:50%; background:radial-gradient(circle at 40% 38%, #ff9a7a, #c8141a 55%, #5a0004); box-shadow:0 0 50px 18px rgba(200,20,20,.55);';
      const s = c.h*1.5; g.set(moon, {left:c.x - s/2, top:c.y - s/2 + c.h*.9, width:s, height:s, opacity:0, zIndex:1189});
      dimScreen('rgba(15,0,5,.7)', .3, 1.2, .6, c);
      return g.timeline({onComplete:()=> back.remove()}).to(moon, {top:c.y - s/2, opacity:.95, duration:1, ease:'power2.out'})
        .add(()=> textPop(c.x, lblY(c), 'MYTHIC', {color:'#ffd9c8', textShadow:'0 0 10px #ff2a10'}), .6)
        .to(moon, {opacity:0, scale:1.2, duration:.6}, '+=.5'); },
    C:(card, c)=>{ snd('boom'); snd('rareRise', true); const g = G();  // shockwave and an ember fountain
      shake(document.querySelector('.po2-stage') || card.parentNode, 9, .35);
      ringAt(c.x, c.y, c.h, {border:'6px solid rgba(255,80,40,.85)'}, {to:5, dur:.8, ease:'power3.out'});
      for(let k = 0; k < 3; k++) later(()=> burstAt(c.x, c.r.top + 6, 12, ['#ff6a1a', '#ffd08a', '#ff2a10'], {r0:40, r1:120, fall:120, dur:1.2}), k*160);
      return g.timeline().fromTo(card, {scale:1.15}, {scale:1, duration:.5, ease:'elastic.out(1,.4)'}).add(()=> textPop(c.x, lblY(c), 'MYTHIC', {color:'#ffe0d0', textShadow:'0 0 10px #ff3a10'}), .1).to({}, {duration:1.2}); },
  },
  ancient:{
    A:(card, c)=>{ const g = G(); packCss(); snd('earthquakeTone'); // a stone tablet cracks open over the card, deep-blue runes flare
      const mk = side=>{ const s = layer('fxd-box'); s.style.cssText += `background:${noise('.35', 3, 21, '0 0 0 0 .5  0 0 0 0 .52  0 0 0 0 .58  0 0 0 -1 1.25', 'fractalNoise', 80)}, linear-gradient(160deg, #8a8f9a, #4a4e58 60%, #3a3e46); background-size:80px 80px, 100% 100%; box-shadow:inset 0 0 0 2px #2a2c32; border-radius:${side < 0 ? '12px 0 0 12px' : '0 12px 12px 0'}; clip-path:${side < 0 ? 'polygon(0 0, 100% 0, 86% 22%, 100% 46%, 82% 70%, 100% 100%, 0 100%)' : 'polygon(14% 0, 100% 0, 100% 100%, 0 100%, 18% 70%, 0 46%, 14% 22%)'};`;
        g.set(s, {left:c.r.left - 4 + (side > 0 ? c.w/2 - 4 : 0), top:c.r.top - 4, width:c.w/2 + 8, height:c.h + 8}); return s; };
      const L = mk(-1), Rt = mk(1), runes = layer('fxd-box'); runes.style.cssText += `background:${RUNE_RING} center/contain no-repeat; filter:drop-shadow(0 0 6px #3a7aff) drop-shadow(0 0 12px #2a5aff);`;
      const s = c.h*1.6; g.set(runes, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, opacity:0, scale:.6, zIndex:1198});
      return g.timeline({onComplete:()=>{ L.remove(); Rt.remove(); runes.remove(); }})
        .to([L, Rt], {x:(i)=> i ? 2 : -2, duration:.05, repeat:5, yoyo:true})
        .add(()=>{ snd('iceShatter'); burstAt(c.x, c.y, 14, ['#8a8f9a', '#5a5e68', '#c8ccd4'], {r0:40, r1:110, fall:60, size:5}); })
        .to(L, {x:-c.w*.9, rotation:-14, opacity:0, duration:.6, ease:'power2.in'}).to(Rt, {x:c.w*.9, rotation:14, opacity:0, duration:.6, ease:'power2.in'}, '<')
        .to(runes, {opacity:1, scale:1, rotation:60, duration:.6, ease:'power2.out'}, '<.1')
        .add(()=> textPop(c.x, lblY(c), 'ANCIENT', {color:'#cfe2ff', textShadow:'0 0 10px #2a6aff, 0 2px 0 #0a1a4a'}), '<.2')
        .to(runes, {opacity:0, rotation:120, scale:1.3, duration:.7}, '+=.4'); },
    B:(card, c)=>{ const g = G(); packCss(); snd('readyChime'); // a rune circle draws itself under the card and spins up
      const back = backLayer(c), rc = layer('fxd-box', '', back); rc.style.cssText += `background:${RUNE_RING} center/contain no-repeat; filter:drop-shadow(0 0 6px #3a7aff);`; const s = c.h*1.9;
      g.set(rc, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, zIndex:1189, clipPath:'circle(0% at 50% 50%)'});
      dimScreen('rgba(4,10,40,.6)', .3, 1.1, .5, c);
      return g.timeline({onComplete:()=> back.remove()}).to(rc, {clipPath:'circle(75% at 50% 50%)', duration:.7, ease:'power1.inOut'}).to(rc, {rotation:180, duration:1.4, ease:'power2.inOut'}, 0)
        .add(()=>{ ringAt(c.x, c.y, s*.5, {border:'2px solid #9fc4ff', boxShadow:'0 0 14px #3a7aff'}, {to:2, dur:.6}); textPop(c.x, lblY(c), 'ANCIENT', {color:'#cfe2ff', textShadow:'0 0 10px #2a6aff'}); }, .7)
        .to(rc, {opacity:0, duration:.5}, '+=.2'); },
    C:(card, c)=>{ const g = G(); snd('splash'); // deep water: blue light from below, bubbles rise past the card
      dimScreen('linear-gradient(0deg, rgba(10,40,120,.75), rgba(2,8,30,.8))', .3, 1.1, .6, c);
      for(let k = 0; k < 16; k++) later(()=>{ packCss(); const b = layer('fxd-dot'); b.style.cssText += 'background:transparent; border:1.5px solid rgba(200,230,255,.8); box-shadow:none;'; const x = c.x + rnd(-c.w*.7, c.w*.7);
        g.fromTo(b, {x, y:c.r.bottom + 20, scale:rnd(.6, 1.6)}, {y:c.r.top - 60, x:x + rnd(-12, 12), opacity:0, duration:rnd(.9, 1.4), ease:'power1.in', onComplete:()=> b.remove()}); }, k*60);
      return g.timeline().fromTo(card, {filter:'brightness(.4) hue-rotate(-20deg)'}, {filter:'brightness(1.2) hue-rotate(0deg)', duration:.8, clearProps:'filter'}).add(()=> textPop(c.x, lblY(c), 'ANCIENT', {color:'#cfe2ff', textShadow:'0 0 10px #2a6aff'}), .4).to({}, {duration:1}); },
  },
  divine:{
    A:(card, c)=>{ const g = G(); packCss(); snd('leaderFanfare'); // a white pillar of light comes down onto the card, motes drift
      const p = layer('fxd-box'); p.style.cssText += 'background:linear-gradient(90deg, rgba(255,250,220,0), rgba(255,252,235,.55) 30%, rgba(255,255,245,.8) 50%, rgba(255,252,235,.55) 70%, rgba(255,250,220,0)); filter:blur(3px); mix-blend-mode:screen;';
      g.set(p, {left:c.x - c.w*.75, top:0, width:c.w*1.5, height:c.r.bottom + 10, scaleY:0, transformOrigin:'50% 0%', zIndex:1199});
      dimScreen('rgba(10,10,30,.55)', .25, 1.2, .6, c);
      return g.timeline({onComplete:()=> p.remove()}).to(p, {scaleY:1, duration:.45, ease:'power3.in'})
        .add(()=>{ ringAt(c.x, c.r.bottom, c.w*1.4, {border:'3px solid #fffbe6', boxShadow:'0 0 20px #fff6c0'}, {from:.2, to:1.6, dur:.7}); burstAt(c.x, c.y, 18, ['#fffbe6', '#ffe9a0', '#ffffff'], {r0:50, r1:140, fall:-60, size:4, dur:1.3});
          textPop(c.x, lblY(c), 'DIVINE', {color:'#fffbe6', textShadow:'0 0 12px #ffe9a0, 0 2px 0 #8a6a10'}); })
        .to(p, {scaleX:.4, opacity:0, duration:.9, ease:'power2.in'}, '+=.5'); },
    B:(card, c)=>{ const g = G(); packCss(); snd('pitchChime'); // a golden halo settles onto the card's crown, rays turn behind it
      const halo = layer('fxd-ring'); halo.style.cssText += 'border:4px solid #ffe9a0; box-shadow:0 0 14px 4px rgba(255,233,160,.85), inset 0 0 8px rgba(255,233,160,.8);';
      const back = backLayer(c), rays = layer('fxd-box', '', back); rays.style.cssText += 'border-radius:50%; background:repeating-conic-gradient(rgba(255,245,200,.0) 0 8deg, rgba(255,245,200,.55) 10deg, rgba(255,245,200,0) 12deg 20deg); -webkit-mask-image:radial-gradient(circle, #000 20%, transparent 70%); mask-image:radial-gradient(circle, #000 20%, transparent 70%);';
      const s = c.h*1.9; g.set(rays, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, opacity:0, zIndex:1189});
      g.set(halo, {left:c.x - c.w*.35, top:c.r.top - 60, width:c.w*.7, height:c.w*.22, opacity:0});
      return g.timeline({onComplete:()=>{ halo.remove(); back.remove(); }}).to(rays, {opacity:1, rotation:40, duration:1.6, ease:'none'}, 0)
        .to(halo, {top:c.r.top - c.w*.14, opacity:1, duration:.7, ease:'bounce.out'}, 0)
        .add(()=> textPop(c.x, lblY(c), 'DIVINE', {color:'#fffbe6', textShadow:'0 0 12px #ffe9a0'}), .5)
        .to([halo, rays], {opacity:0, duration:.5}, '+=.3'); },
    C:(card, c)=>{ const g = G(); packCss(); snd('featherFlutter'); // white wings unfold behind the card
      const wing = side=>{ const w = layer('fxd-box'); w.style.cssText += `background:radial-gradient(ellipse 70% 60% at ${side < 0 ? '100%' : '0%'} 40%, #fff 0 30%, rgba(255,255,255,.85) 45%, rgba(230,240,255,.4) 62%, transparent 72%); filter:drop-shadow(0 0 8px #fff8d8);
        -webkit-mask-image:repeating-linear-gradient(${side < 0 ? 200 : 160}deg, #000 0 10px, rgba(0,0,0,.55) 12px 14px); mask-image:repeating-linear-gradient(${side < 0 ? 200 : 160}deg, #000 0 10px, rgba(0,0,0,.55) 12px 14px);`;
        g.set(w, {left:side < 0 ? c.x - c.w*1.25 : c.x, top:c.y - c.h*.55, width:c.w*1.25, height:c.h*.9, transformOrigin:side < 0 ? '100% 50%' : '0% 50%', scaleX:0, zIndex:1189}); return w; };
      const L = wing(-1), Rt = wing(1);
      return g.timeline({onComplete:()=>{ L.remove(); Rt.remove(); }}).to([L, Rt], {scaleX:1, duration:.55, ease:'back.out(1.6)'}).to([L, Rt], {rotation:(i)=> i ? 6 : -6, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut'})
        .add(()=> textPop(c.x, lblY(c), 'DIVINE', {color:'#fffbe6', textShadow:'0 0 12px #ffe9a0'}), .3).to([L, Rt], {opacity:0, scaleX:.6, duration:.5}); },
  },
  void:{
    A:(card, c)=>{ const g = G(); packCss(); snd('glitch'); snd('nightSwell'); // the card tears the screen open; purple static in the rip
      const W = vw(), H = vh(), tear = layer('fxd-box');
      const pts = []; for(let k = 0; k <= 10; k++){ pts.push([c.x + (k % 2 ? 1 : -1)*rnd(6, 22), (k/10)*H]); }
      const poly = w=> 'polygon(' + pts.map(p=> `${f1(p[0] - w)}px ${f1(p[1])}px`).concat(pts.slice().reverse().map(p=> `${f1(p[0] + w)}px ${f1(p[1])}px`)).join(',') + ')';
      tear.style.cssText += `left:0; top:0; width:${W}px; height:${H}px; background:${noise('.9', 1, 7, '0 0 0 0 .78  0 0 0 0 .62  0 0 0 0 1  1.8 0 0 0 -.85', 'fractalNoise', 120)}, radial-gradient(ellipse 40% 50% at ${f1(c.x)}px ${f1(c.y)}px, #3a1a6a, #0c0418 70%); background-size:120px 120px, 100% 100%; animation:fxdStatic .3s steps(5) infinite; z-index:1188; box-shadow:inset 0 0 0 1px #c9a8ff;`; // 2026-10-15: speckled static on a dark rip (was a flat lavender sheet)
      css('foil-base', FOIL_BASE);
      const o = {w:0}; const set = ()=> tear.style.clipPath = poly(o.w); set();
      return g.timeline({onComplete:()=> tear.remove()}).to(o, {w:c.w*.62, duration:.4, ease:'power3.in', onUpdate:set})
        .add(()=>{ ringAt(c.x, c.y, c.h, {border:'2px solid #c9a8ff', boxShadow:'0 0 18px #7a3aff'}, {to:3, dur:.6}); textPop(c.x, lblY(c), 'VOID', {color:'#e6dcff', textShadow:'0 0 12px #7a3aff, 2px 0 0 #ff3a8a, -2px 0 0 #3af0ff'}); })
        .fromTo(card, {filter:'invert(1) hue-rotate(180deg)'}, {filter:'none', duration:.35, ease:'steps(4)', clearProps:'filter'}, '<')
        .to(o, {w:0, duration:.7, ease:'power2.in', onUpdate:set}, '+=.6'); },
    B:(card, c)=>{ const g = G(); packCss(); snd('exile'); // implosion: everything pulls into a point, then the card pops out
      const motes = []; for(let k = 0; k < 26; k++){ const m = layer('fxd-dot'); m.style.background = k % 3 ? '#c9a8ff' : '#fff'; motes.push(m); const a = rnd(0, Math.PI*2), r = rnd(120, 260); g.set(m, {x:c.x + Math.cos(a)*r, y:c.y + Math.sin(a)*r}); }
      dimScreen('rgba(8,0,18,.7)', .2, 1, .5, c);
      return g.timeline({onComplete:()=> motes.forEach(m=> m.remove())}).to(motes, {x:c.x, y:c.y, scale:.2, duration:.55, ease:'power3.in', stagger:.006})
        .fromTo(card, {scale:.2}, {scale:1, duration:.45, ease:'back.out(2)'}, '-=.05')
        .add(()=>{ ringAt(c.x, c.y, c.h*.5, {background:'radial-gradient(circle, rgba(255,255,255,.95), rgba(160,100,255,.5) 40%, transparent 70%)'}, {to:5, dur:.6}); textPop(c.x, lblY(c), 'VOID', {color:'#e6dcff', textShadow:'0 0 12px #7a3aff'}); }, '<')
        .to(motes, {opacity:0, duration:.01}).to({}, {duration:1}); },
    C:(card, c)=>{ const g = G(); packCss(); snd('glitch'); // glitch: RGB-split slices jump across the card, static bars
      const t = cardTile(card), bars = []; for(let k = 0; k < 5; k++){ const b = layer('fxd-box'); b.style.cssText += `background:${k % 2 ? 'rgba(255,40,140,.55)' : 'rgba(40,240,255,.5)'}; mix-blend-mode:screen;`; bars.push(b); g.set(b, {left:c.r.left - 10, width:c.w + 20, top:c.r.top + rnd(0, c.h), height:rnd(3, 9), opacity:0}); }
      const tl = g.timeline({onComplete:()=>{ bars.forEach(b=> b.remove()); if(t) g.set(t, {clearProps:'x,filter'}); }});
      for(let k = 0; k < 8; k++) tl.add(()=>{ bars.forEach(b=> g.set(b, {top:c.r.top + rnd(0, c.h), opacity:Math.random() < .6 ? 1 : 0})); if(t) g.set(t, {x:rnd(-5, 5), filter:`drop-shadow(${rnd(-4, 4)}px 0 0 rgba(255,0,120,.7)) drop-shadow(${rnd(-4, 4)}px 0 0 rgba(0,240,255,.7))`}); }, k*.07);
      return tl.add(()=>{ bars.forEach(b=> b.style.opacity = '0'); if(t) g.set(t, {x:0, filter:'none'}); textPop(c.x, lblY(c), 'VOID', {color:'#e6dcff', textShadow:'2px 0 0 #ff3a8a, -2px 0 0 #3af0ff'}); }, .6).to({}, {duration:1.1}); },
  },
  daemonic:{
    A:(card, c)=>{ const g = G(); packCss(); snd('devilryTone'); snd('fireBreath', 600); // black flame floods the stage, red eyes open
      const back = backLayer(c), fl = layer('fxd-box', '', back); const W = vw(), H = vh(); // 2026-10-15: behind the card; black body, red-hot flecks (was a magenta mottle)
      fl.style.cssText += `left:0; width:${W}px; top:${H*.35}px; height:${H*.65}px; background:${noise('.03 .08', 3, 9, '0 0 0 0 .9  0 0 0 0 .12  0 0 0 0 .01  0 0 0 4 -2.3', 'fractalNoise', 160)}, linear-gradient(0deg, #000 35%, rgba(30,0,0,.92) 62%, transparent); background-size:160px 160px, 100% 100%; animation:fxdFlame 4s linear infinite; z-index:1188;
        -webkit-mask-image:linear-gradient(0deg, #000 55%, transparent); mask-image:linear-gradient(0deg, #000 55%, transparent);`;
      css('foil-base', FOIL_BASE);
      const eyes = layer('fxd-box'); eyes.style.cssText += 'background:radial-gradient(ellipse 22% 40% at 30% 50%, #ff2a10 0 40%, rgba(255,40,10,.4) 60%, transparent 70%), radial-gradient(ellipse 22% 40% at 70% 50%, #ff2a10 0 40%, rgba(255,40,10,.4) 60%, transparent 70%); filter:drop-shadow(0 0 8px #ff0a00);';
      g.set(eyes, {left:c.x - 50, top:c.r.top - 46, width:100, height:22, scaleY:0, zIndex:1203});
      return g.timeline({onComplete:()=>{ back.remove(); eyes.remove(); }}).fromTo(fl, {y:H*.5}, {y:0, duration:.55, ease:'power2.out'})
        .to(eyes, {scaleY:1, duration:.12}).to(eyes, {scaleY:.1, duration:.06, yoyo:true, repeat:1}, '+=.35')
        .add(()=>{ burstAt(c.x, c.y, 16, ['#ff2a10', '#ff8a2a', '#2a0000'], {r0:60, r1:160, dur:1}); textPop(c.x, lblY(c), 'DAEMONIC', {color:'#ffb0a0', textShadow:'0 0 10px #ff0a00, 0 2px 0 #000'}); }, '<')
        .to(eyes, {opacity:0, duration:.3}, '+=.4').to(fl, {y:H*.6, duration:.6, ease:'power2.in'}, '<'); },
    B:(card, c)=>{ const g = G(); packCss(); snd('bossRumble'); // a hell-gate: two black doors with glowing cracks swing open
      const door = side=>{ const d = layer('fxd-box'); d.style.cssText += `background:${CRACKS_BRIM} 0 0/100% 100% no-repeat, linear-gradient(${side < 0 ? 90 : 270}deg, #050202, #1a0606); box-shadow:inset 0 0 0 2px #3a0a06; border-radius:${side < 0 ? '12px 0 0 12px' : '0 12px 12px 0'}; filter:drop-shadow(0 0 6px rgba(255,30,10,.6));`;
        g.set(d, {left:side < 0 ? c.r.left - 6 : c.x, top:c.r.top - 6, width:c.w/2 + 6, height:c.h + 12, transformOrigin:side < 0 ? '0% 50%' : '100% 50%', transformPerspective:500}); return d; };
      const L = door(-1), Rt = door(1);
      return g.timeline({onComplete:()=>{ L.remove(); Rt.remove(); }}).to({}, {duration:.35}).to(L, {rotationY:-100, opacity:.2, duration:.6, ease:'power2.in'}).to(Rt, {rotationY:100, opacity:.2, duration:.6, ease:'power2.in'}, '<')
        .add(()=>{ ringAt(c.x, c.y, c.h*.8, {background:'radial-gradient(circle, rgba(255,80,30,.9), rgba(120,0,0,.5) 45%, transparent 70%)'}, {to:3, dur:.6}); textPop(c.x, lblY(c), 'DAEMONIC', {color:'#ffb0a0', textShadow:'0 0 10px #ff0a00'}); }, '-=.2')
        .to([L, Rt], {opacity:0, duration:.2}).to({}, {duration:.9}); },
    C:(card, c)=>{ const g = G(); snd('burn'); // brimstone rain: ash and embers storm across, a red flash
      dimScreen('rgba(30,0,0,.6)', .15, 1.2, .5, c);
      for(let k = 0; k < 30; k++) later(()=>{ packCss(); const e = layer('fxd-dot'); const hot = Math.random() < .5; e.style.background = hot ? '#ff6a1a' : '#4a3a38'; e.style.boxShadow = hot ? '0 0 6px #ff3a10' : 'none';
        const x = c.x + rnd(-vw()*.4, vw()*.3); g.fromTo(e, {x, y:-20, scale:rnd(.5, 1.3)}, {x:x + rnd(60, 160), y:vh()*rnd(.6, 1), duration:rnd(.7, 1.2), ease:'none', onComplete:()=> e.remove()}); }, k*30);
      return g.timeline().fromTo(card, {filter:'brightness(2.2) sepia(1) hue-rotate(-30deg) saturate(4)'}, {filter:'none', duration:.6, clearProps:'filter'}, .25)
        .add(()=> textPop(c.x, lblY(c), 'DAEMONIC', {color:'#ffb0a0', textShadow:'0 0 10px #ff0a00'}), .3).to({}, {duration:1.2}); },
  },
};
M.revealTop = function(card, rarity, variant, opts){
  const fn = REVEAL[rarity] && (REVEAL[rarity][variant || 'A'] || REVEAL[rarity].A); if(!card || !fn || !G()) return Promise.resolve();
  if(card.__fxdTease){ card.__fxdTease.stop(); card.__fxdTease = null; }
  const c = centre(card); let tl; try{ tl = fn(card, c); }catch(e){ return Promise.resolve(); }
  return new Promise(res=>{ if(tl && tl.eventCallback){ tl.eventCallback('onComplete', res); later(res, 3000); } else later(res, 2200); });
};
TOP.forEach(k=> ['A', 'B', 'C'].forEach(v=> M['reveal' + k[0].toUpperCase() + k.slice(1) + (v === 'A' ? '' : '_' + v)] = (card, o)=> M.revealTop(card, k, v, o)));
// ---- Heroic and Legendary get a flourish of their own on top of the rays (pack-tease-epic B, pack-tease-legend B) ----
M.revealHeroic = function(card){
  const g = G(); if(!card || !g) return Promise.resolve(); const c = centre(card); snd('leaderFanfare');
  ringAt(c.x, c.y, c.h*.8, {border:'3px solid #ff9a3a', boxShadow:'0 0 16px #f97316'}, {to:2.6, dur:.7});
  burstAt(c.x, c.y, 14, ['#f97316', '#ffd08a', '#fff'], {r0:60, r1:140, dur:.9});
  return textPop(c.x, lblY(c), 'HEROIC', {color:'#fff1e0', textShadow:'0 0 10px #f97316, 0 2px 0 #6a2a00'});
};
M.revealLegendary = function(card){
  const g = G(); if(!card || !g) return Promise.resolve(); packCss(); const c = centre(card); snd('gold'); snd('rareRise', true);
  const coins = []; for(let k = 0; k < 16; k++){ const e = layer('fxd-ico'); e.textContent = k % 4 ? '🪙' : '✨'; coins.push(e); g.set(e, {x:c.x + rnd(-c.w*.8, c.w*.8), y:c.r.top - rnd(40, 160), rotation:rnd(-40, 40), opacity:0}); }
  const crown = layer('fxd-ico'); crown.textContent = '👑'; crown.style.fontSize = '26px'; g.set(crown, {x:c.x, y:c.r.top - 40, scale:0});
  return new Promise(res=> g.timeline({onComplete:()=>{ coins.forEach(e=> e.remove()); crown.remove(); res(); }})
    .to(coins, {opacity:1, duration:.1, stagger:.03}, 0).to(coins, {y:c.r.bottom + 30, rotation:'+=200', duration:.9, ease:'power2.in', stagger:.03}, 0).to(coins, {opacity:0, duration:.2, stagger:.03}, .8)
    .to(crown, {scale:1.2, duration:.35, ease:'back.out(3)'}, .1).to(crown, {y:c.r.top - 10, scale:.9, duration:.4, ease:'bounce.out'}).to(crown, {opacity:0, duration:.3}, '+=.4'));
};
// ---- the foil pull (pack-reveal-foil): A rainbow sweep + FOIL stamp · B prism shards · C shine ladder ----
M.revealFoil = function(card, opts){
  opts = opts || {}; const g = G(), t = cardTile(card); if(!card || !g || !t) return Promise.resolve(); packCss(); const c = centre(t);
  css('foilrev', `.fxd-rainbow{position:fixed; pointer-events:none; z-index:1201; border-radius:12px; overflow:hidden;}
    .fxd-rainbow b{position:absolute; top:-40%; bottom:-40%; width:60%; left:-70%; transform:skewX(-20deg); background:linear-gradient(90deg, transparent, hsl(0 100% 70% / .8), hsl(50 100% 65% / .85), hsl(130 90% 60% / .85), hsl(200 100% 65% / .85), hsl(280 90% 70% / .8), transparent); mix-blend-mode:screen; filter:blur(1px);}
    .fxd-stamp{position:fixed; transform:translate(-50%,-50%) rotate(-14deg); pointer-events:none; z-index:1203; font:900 20px/1 'Baloo 2', system-ui, sans-serif; letter-spacing:.12em; padding:3px 10px; border-radius:6px; color:#fff;
      background:linear-gradient(115deg, #ff5a8a, #ffd35a, #5aff9a, #5ad0ff, #b05aff); box-shadow:0 0 0 2px #fff, 0 4px 12px rgba(0,0,0,.4); text-shadow:0 1px 0 rgba(0,0,0,.35);}`);
  snd('rareRise', false); later(()=> snd('pitchChime'), 300);
  const stampAt = ()=>{ const s = layer('fxd-stamp'); s.textContent = 'FOIL'; g.set(s, {left:c.r.right - 14, top:c.r.top + 18, scale:2.6, opacity:0});
    return g.timeline({onComplete:()=> s.remove()}).to(s, {scale:1, opacity:1, duration:.22, ease:'power4.in'}).add(()=> shake(t, 3, .15)).to(s, {opacity:0, duration:.35}, '+=.9'); };
  const v = opts.variant || 'A';
  if(v === 'B'){ // prism shards burst out, the card tilts so its finish catches the light
    const sh = []; for(let k = 0; k < 14; k++){ const s = layer('fxd-box'); s.style.cssText += `width:10px; height:18px; clip-path:polygon(50% 0, 100% 100%, 0 100%); background:hsl(${k*26} 100% 65%); filter:drop-shadow(0 0 4px hsl(${k*26} 100% 60%)); z-index:1201;`; sh.push(s); g.set(s, {left:c.x - 5, top:c.y - 9, rotation:k/14*360}); }
    return new Promise(res=> g.timeline({onComplete:()=>{ sh.forEach(s=> s.remove()); g.set(t, {clearProps:'rotationY,transformPerspective'}); res(); }})
      .to(sh, {x:(i)=> Math.cos(i/14*Math.PI*2)*c.w*1.2, y:(i)=> Math.sin(i/14*Math.PI*2)*c.h*.9, opacity:0, duration:.8, ease:'power3.out'}, 0)
      .add(()=> M.foilGlint_B(t), .05).add(stampAt, .5).to({}, {duration:1.1}));
  }
  if(v === 'C'){ // three quick sweeps, then a holo pulse round the frame and a ring of sparkles
    const tl = g.timeline(); [0, .22, .44].forEach(at=> tl.add(()=> M.foilGlint(t, {dur:.35}), at));
    return new Promise(res=> tl.add(()=>{ ringAt(c.x, c.y, c.h*.7, {border:'3px solid transparent', borderImage:'linear-gradient(115deg, #ff5a8a, #ffd35a, #5aff9a, #5ad0ff, #b05aff) 1'}, {to:2, dur:.6});
      burstAt(c.x, c.y, 18, ['#ff8ab0', '#ffe08a', '#8affc0', '#8ad8ff', '#d08aff'], {r0:60, r1:120, size:4, dur:.9}); }, .7).add(stampAt, .75).to({}, {duration:1.2}).add(res));
  }
  // A: a rainbow flash sweeps the card, the finish flares up, the FOIL stamp lands
  const rb = layer('fxd-rainbow', '<b></b>'); g.set(rb, {left:c.r.left, top:c.r.top, width:c.w, height:c.h});
  return new Promise(res=> g.timeline({onComplete:()=>{ rb.remove(); res(); }})
    .to(rb.querySelector('b'), {x:c.w*2.2, duration:.6, ease:'power2.inOut'})
    .fromTo(t, {filter:'brightness(1) saturate(1)'}, {filter:'brightness(1.35) saturate(1.5)', duration:.2, yoyo:true, repeat:1, clearProps:'filter'}, .25)
    .add(()=>{ const L = t.querySelector('.holo-layer'); if(L) g.fromTo(L, {opacity:1}, {opacity:'', duration:.8, clearProps:'opacity'}); }, .3)
    .add(stampAt, .45).to({}, {duration:1.1}));
};
M.revealFoil_B = (card, o)=> M.revealFoil(card, Object.assign({}, o, {variant:'B'}));
M.revealFoil_C = (card, o)=> M.revealFoil(card, Object.assign({}, o, {variant:'C'}));
// ---- shiny pull (pack-reveal-shiny): the art cycles through hues, then settles on its shiny colour; sparkles twinkle out ----
M.revealShiny = function(card){
  const g = G(), t = cardTile(card); if(!t || !g) return Promise.resolve(); const art = t.querySelector('.ico'), c = centre(t); snd('pitchChime');
  const o = {h:0}; const settle = getComputedStyle(t).getPropertyValue('--shiny-hue') || '180deg';
  return new Promise(res=> g.timeline({onComplete:()=>{ if(art) art.style.filter = ''; res(); }})
    .to(o, {h:540, duration:1, ease:'power2.inOut', onUpdate:()=>{ if(art) art.style.filter = `hue-rotate(${o.h}deg) saturate(1.5) brightness(1.1)`; }})
    .add(()=>{ if(art) art.style.filter = ''; burstAt(c.x, c.y, 10, ['#fff', '#ffd6f6', '#d6f6ff'], {r0:30, r1:90, size:4, dur:.8}); textPop(c.x, lblY(c), '✦ SHINY', {color:'#fff', textShadow:'0 0 8px #ff7bd5, 0 0 12px #7bd5ff', fontSize:'18px'}, {hold:.6}); })
    .to({}, {duration:.9}));
};
// ---- duplicate (pack-duplicate): two ghost copies slam in behind with a thunk, "+1 copy" chip, dust motes ----
M.revealDuplicate = function(card, opts){
  opts = opts || {}; const g = G(), t = cardTile(card); if(!t || !g) return Promise.resolve(); packCss(); const c = centre(t);
  const ghosts = [1, 2].map(k=>{ const gh = layer('fxd-box'); gh.style.cssText += 'border-radius:12px; background:linear-gradient(160deg, #5a4a3a, #3a2e22); box-shadow:inset 0 0 0 2px rgba(255,230,180,.35), 0 3px 6px rgba(0,0,0,.4); z-index:1180;';
    g.set(gh, {left:c.r.left, top:c.r.top, width:c.w, height:c.h, x:k*7, y:-k*5, rotation:k*3, opacity:0, scale:1.15}); return gh; });
  const n = Math.max(2, opts.count || 2);
  return new Promise(res=> g.timeline({onComplete:()=>{ ghosts.forEach(x=> x.remove()); res(); }})
    .to(ghosts, {opacity:.9, scale:1, duration:.16, ease:'power3.in', stagger:.09})
    .add(()=>{ snd('woodKnock'); shake(t, 2, .1); }, .17).add(()=> snd('woodKnock'), .26)
    .add(()=>{ textPop(c.r.right - 6, c.r.bottom - 10, '×' + n, {color:'#fff', fontSize:'18px', background:'#3a2e22', padding:'2px 8px', borderRadius:'999px', boxShadow:'0 0 0 2px #e8c070'}, {hold:.8});
      burstAt(c.x, c.y + c.h*.3, 8, ['#d8c8ff', '#fff', '#b8a0ff'], {r0:20, r1:60, fall:-50, size:4, dur:1}); }, .3)
    .to(ghosts, {opacity:0, x:0, y:0, rotation:0, duration:.35}, '+=.7'));
};
// ---- pack dressing per pack type (pack-faction A/B, pack-mystery, pack-pity) ----
const FACTION_LOOK = {otter:{seal:'#a8463c', ring:'#c98a3e', ico:'🦦', wrap:'river'}, hummingbird:{seal:'#3a6fae', ring:'#f6e2c0', ico:'🌺', wrap:'feather'},
  road:{seal:'#8a6a3a', ring:'#e8d0a0', ico:'🧳'}, beast:{seal:'#7a4a2a', ring:'#c8a070', ico:'🐾'}, hive:{seal:'#b08a1a', ring:'#ffd45a', ico:'🐝'}, deep:{seal:'#2a5a7a', ring:'#9fd8ff', ico:'🌊'}, folk:{seal:'#5a7a3a', ring:'#e8e0a0', ico:'🌾'}};
const DRESS_CSS = `
  .fxd-seal{position:absolute; left:50%; bottom:16%; width:38px; height:38px; margin-left:-19px; border-radius:50%; z-index:6; pointer-events:none; display:flex; align-items:center; justify-content:center; font-size:18px;
    background:radial-gradient(circle at 38% 32%, color-mix(in srgb, var(--seal) 60%, #fff), var(--seal) 55%, color-mix(in srgb, var(--seal) 60%, #000)); box-shadow:0 0 0 3px var(--ring), 0 3px 6px rgba(0,0,0,.45), inset 0 -3px 4px rgba(0,0,0,.3);
    clip-path:polygon(50% 0, 62% 6%, 76% 4%, 82% 16%, 95% 22%, 94% 36%, 100% 50%, 94% 64%, 95% 78%, 82% 84%, 76% 96%, 62% 94%, 50% 100%, 38% 94%, 24% 96%, 18% 84%, 5% 78%, 6% 64%, 0 50%, 6% 36%, 5% 22%, 18% 16%, 24% 4%, 38% 6%);}
  .fxd-band{position:absolute; left:-2%; right:-2%; top:44%; height:13%; z-index:5; pointer-events:none; background:linear-gradient(180deg, var(--ring), color-mix(in srgb, var(--ring) 55%, #000)); box-shadow:0 2px 4px rgba(0,0,0,.35);}
  .fxd-band.is-river{background:${WAVES} 0 50%/26px 8px repeat-x, linear-gradient(180deg, #3a7aa8, #1e4a6a);}
  .fxd-feathers{position:absolute; inset:-10px; z-index:1; pointer-events:none;}
  .fxd-feathers i{position:absolute; width:16px; height:34px; border-radius:50% 50% 50% 50% / 80% 80% 20% 20%; transform-origin:50% 100%; background:linear-gradient(90deg, var(--c), color-mix(in srgb, var(--c) 50%, #fff) 50%, var(--c)); box-shadow:inset 0 0 0 1px rgba(0,0,0,.25); animation:fxdFeatherFlut 2.4s ease-in-out infinite; animation-delay:var(--dl);}
  @keyframes fxdFeatherFlut{0%,100%{transform:rotate(var(--r)) scaleY(1);} 50%{transform:rotate(calc(var(--r) + 6deg)) scaleY(.94);}}
  .fxd-myst{position:absolute; inset:0; z-index:6; pointer-events:none;}
  .fxd-myst i{position:absolute; left:50%; top:50%; font:900 18px/1 'Baloo 2', system-ui, sans-serif; color:#efe0ff; text-shadow:0 0 6px #8a4ae8, 0 1px 0 #2a1050; font-style:normal; animation:fxdMystOrbit 3.2s linear infinite; animation-delay:var(--dl);}
  @keyframes fxdMystOrbit{0%{transform:translate(-50%,-50%) rotate(0deg) translateX(var(--rx)) rotate(0deg) scale(1);} 50%{transform:translate(-50%,-50%) rotate(180deg) translateX(var(--rx)) rotate(-180deg) scale(.7); opacity:.5;} 100%{transform:translate(-50%,-50%) rotate(360deg) translateX(var(--rx)) rotate(-360deg) scale(1);}}
  .fxd-pity{position:absolute; right:-10px; top:-10px; width:62px; height:62px; z-index:8; pointer-events:none; border-radius:50%; display:flex; align-items:center; justify-content:center; text-align:center; font:900 9px/1.05 'Baloo 2', system-ui, sans-serif; color:#fff8e0;
    background:radial-gradient(circle at 38% 32%, #ffd76a, #d8901a 55%, #8a4a00); box-shadow:0 0 0 3px #fff3c0, 0 4px 10px rgba(0,0,0,.45);}
  @media (prefers-reduced-motion: reduce){ .fxd-feathers i, .fxd-myst i{animation:none;} }`;
// A: wax seal and a coloured band (River wave band for the Rivergate); B: a wrap — River ribbon / hummingbird feathers round the pack.
M.packDress = function(packEl, pack, opts){
  opts = opts || {}; if(!packEl) return; css('dress', DRESS_CSS); css('foil-base', FOIL_BASE);
  const id = String(pack && pack.id || ''), body = packEl.querySelector('.po2-body') || packEl;
  packEl.querySelectorAll('.fxd-seal, .fxd-band, .fxd-feathers, .fxd-myst, .fxd-pity').forEach(x=> x.remove());
  if(id === 'mystery' || (pack && pack.pool === 99)) return M.packMystery(packEl);
  const fk = id.replace(/^fp-/, ''), L = FACTION_LOOK[fk]; if(!L) return;
  const v = opts.variant || 'A';
  if(v === 'A'){
    const band = document.createElement('span'); band.className = 'fxd-band' + (L.wrap === 'river' ? ' is-river' : ''); band.style.setProperty('--ring', L.ring); band.setAttribute('aria-hidden', 'true'); body.appendChild(band);
    const seal = document.createElement('span'); seal.className = 'fxd-seal'; seal.style.setProperty('--seal', L.seal); seal.style.setProperty('--ring', L.ring); seal.textContent = L.ico; seal.setAttribute('aria-hidden', 'true'); body.appendChild(seal);
    const g = G(); if(g && !reduceNow()) g.fromTo(seal, {scale:2.2, opacity:0, rotation:-30}, {scale:1, opacity:1, rotation:0, duration:.4, delay:.35, ease:'power4.in', onComplete:()=> snd('woodKnock')});
  } else {
    const f = document.createElement('span'); f.className = 'fxd-feathers'; f.setAttribute('aria-hidden', 'true');
    const cols = L.wrap === 'feather' ? ['#e3197a', '#14c4c4', '#8fd61c', '#ff8a1a', '#3b2fd0'] : L.wrap === 'river' ? ['#3a7aa8', '#c98a3e', '#2a5a8a', '#e8c070'] : [L.seal, L.ring];
    f.innerHTML = Array.from({length:12}, (_, k)=>{ const side = k < 6, j = k % 6; return `<i style="--c:${cols[k % cols.length]}; --r:${side ? -70 + j*8 : 70 - j*8}deg; --dl:${(-k*.2).toFixed(1)}s; ${side ? 'left:-6px' : 'right:-6px'}; top:${12 + j*14}%"></i>`; }).join('');
    packEl.insertBefore(f, packEl.firstChild);
  }
};
M.packDress_B = (p, pack)=> M.packDress(p, pack, {variant:'B'});
// Mystery Booster: question marks circle the wrapper, which wobbles (pack-mystery).
M.packMystery = function(packEl){
  if(!packEl) return; css('dress', DRESS_CSS); const m = document.createElement('span'); m.className = 'fxd-myst'; m.setAttribute('aria-hidden', 'true');
  m.innerHTML = Array.from({length:5}, (_, k)=> `<i style="--rx:${52 + (k % 2)*16}px; --dl:${(-k*.64).toFixed(2)}s">?</i>`).join(''); packEl.appendChild(m);
  const g = G(); if(g && !reduceNow()){ const b = packEl.querySelector('.po2-body') || packEl; g.fromTo(b, {rotation:0}, {rotation:4, duration:.12, repeat:5, yoyo:true, ease:'sine.inOut', delay:.3, clearProps:'rotation'}); }
};
// Pity guarantee (pack-pity, planned): a "Guaranteed!" seal stamps onto the pack.
M.pitySeal = function(packEl, text){
  if(!packEl) return Promise.resolve(); css('dress', DRESS_CSS); const s = document.createElement('span'); s.className = 'fxd-pity'; s.innerHTML = text || 'GUARAN-<br>TEED<br>EPIC!'; s.setAttribute('aria-hidden', 'true'); packEl.appendChild(s);
  const g = G(); if(!g) return Promise.resolve(); snd('woodKnock');
  return new Promise(res=> g.timeline({onComplete:res}).fromTo(s, {scale:3, opacity:0, rotation:-40}, {scale:1, opacity:1, rotation:-12, duration:.32, ease:'power4.in'}).add(()=> shake(packEl, 4, .2)).to(s, {rotation:-8, duration:.6, ease:'elastic.out(1,.3)'}));
};
// The tear, per pack type (pack-tear B): bronze sparks, silver glints, gold coins, mystery confetti, a river splash, feathers.
M.packTear = function(packEl, pack){
  const g = G(); if(!packEl || !g) return Promise.resolve(); const strip = packEl.querySelector('.po2-strip') || packEl; const c = centre(strip), id = String(pack && pack.id || '').replace(/^fp-/, '');
  const look = {bronze:['#e0a05a', '#8a4f1e', '#ffd7a0'], silver:['#ffffff', '#c8d2e0', '#8a96a8'], gold:['#ffe08a', '#ffc83a', '#fff4c2'], mystery:['#b48ce8', '#ff7ad0', '#7ad0ff', '#fff6a0'],
    otter:['#7ac8ff', '#c8ecff', '#3a8ac8'], hummingbird:['#e3197a', '#14c4c4', '#8fd61c', '#ff8a1a'], hive:['#ffd45a', '#e8961a'], deep:['#7ac8ff', '#2a5a7a'], beast:['#8a6a4a', '#c8a070'], road:['#d8b070', '#6a4a2a'], folk:['#e8e0a0', '#8ab05a']}[id] || ['#fff3c0', '#ffd27a', '#ffffff'];
  if(id === 'gold' || id === 'otter' || id === 'hummingbird'){ packCss(); const ico = id === 'gold' ? '🪙' : id === 'otter' ? '💧' : '🪶'; const es = [];
    for(let k = 0; k < 9; k++){ const e = layer('fxd-ico'); e.textContent = ico; es.push(e); g.set(e, {x:c.x + rnd(-c.w*.4, c.w*.4), y:c.y}); }
    g.to(es, {x:()=> '+=' + rnd(-90, 90), y:()=> '-=' + rnd(40, 110), rotation:()=> rnd(-180, 180), duration:.45, ease:'power2.out'});
    g.to(es, {y:'+=' + 160, opacity:0, duration:.6, delay:.45, ease:'power2.in', onComplete:()=> es.forEach(e=> e.remove())}); }
  return burstAt(c.x, c.y, 18, look, {r0:40, r1:130, fall:30, size:id === 'silver' ? 4 : 5, dur:.8});
};
// The old opener's shake (pack-legacy-shake): A the old CSS shake, B a building shake with light leaking from the seams.
M.packShake = function(packEl, opts){
  const g = G(); if(!packEl || !g) return Promise.resolve(); packCss(); const c = centre(packEl), col = (opts && opts.color) || '#ffe08a';
  const rays = layer('fxd-box'); rays.style.cssText += `border-radius:50%; background:repeating-conic-gradient(${col}00 0 10deg, ${col}cc 12deg, ${col}00 15deg 30deg); -webkit-mask-image:radial-gradient(circle, transparent 18%, #000 30%, transparent 70%); mask-image:radial-gradient(circle, transparent 18%, #000 30%, transparent 70%); z-index:1180;`;
  const s = c.h*1.8; g.set(rays, {left:c.x - s/2, top:c.y - s/2, width:s, height:s, opacity:0, scale:.5});
  snd('riffle');
  return new Promise(res=> g.timeline({onComplete:()=>{ rays.remove(); g.set(packEl, {clearProps:'rotation,scale'}); res(); }})
    .to(packEl, {rotation:-4, duration:.07}).to(packEl, {rotation:4, duration:.07, repeat:3, yoyo:true}).to(packEl, {rotation:-7, scale:1.05, duration:.06}).to(packEl, {rotation:7, duration:.06, repeat:5, yoyo:true})
    .to(rays, {opacity:1, scale:1, rotation:30, duration:.9, ease:'power2.in'}, .1)
    .to(packEl, {rotation:0, scale:1.1, duration:.1}).to(rays, {scale:1.4, opacity:0, duration:.35}).to(packEl, {scale:1, duration:.2}));
};
// Pack odds (pack-odds, planned): the odds card unfolds and each rarity's bar fills to its chance.
M.packOdds = function(host, rows){
  const g = G(); if(!host || !g) return Promise.resolve();
  css('odds', `.fxd-odds{position:relative; width:min(260px, 92%); margin:10px auto; padding:10px 12px; border-radius:12px; background:var(--surface, #2a2a30); color:var(--ink, #fff); box-shadow:0 6px 18px rgba(0,0,0,.35); font:700 12px/1.2 'Baloo 2', system-ui, sans-serif; transform-origin:50% 0;}
    .fxd-odds h4{margin:0 0 6px; font-size:14px;} .fxd-odds .r{display:grid; grid-template-columns:78px 1fr 40px; gap:6px; align-items:center; margin:3px 0;} .fxd-odds .b{height:8px; border-radius:4px; background:rgba(255,255,255,.12); overflow:hidden;} .fxd-odds .b i{display:block; height:100%; width:0; border-radius:4px;}`);
  rows = rows || [['Common', '#8a8f98', 62], ['Uncommon', '#3fb950', 24], ['Rare', '#2f6fe0', 10], ['Epic', '#9333ea', 3], ['Legendary', '#facc15', 1]];
  const box = document.createElement('div'); box.className = 'fxd-odds'; box.innerHTML = '<h4>🎲 What’s inside</h4>' + rows.map(r=> `<div class="r"><span>${r[0]}</span><span class="b"><i style="background:${r[1]}"></i></span><span>${r[2]}%</span></div>`).join(''); host.appendChild(box);
  return new Promise(res=> g.timeline({onComplete:()=> later(()=>{ box.remove(); res(); }, 900)}).fromTo(box, {rotationX:-90, opacity:0}, {rotationX:0, opacity:1, duration:.4, ease:'back.out(1.6)'})
    .to(box.querySelectorAll('.b i'), {width:(i)=> Math.max(4, rows[i][2]) + '%', duration:.6, stagger:.08, ease:'power2.out'}));
};

// ======================= FORGE =======================
// Upgrade moments (2026-10-15). Limit break, promote, prestige and refine still play the shared smithing sequence
// (forgeSmithAnimation: 3–4 strikes, quench, flip); each now gets its own payoff timed onto that sequence. `stage` is
// #anvilStage; the payoff draws fixed overlays over the card's spot (renderForge redraws the panel underneath, same place).
const FORGE_FLIP_MS = 1450; // when the heavy smithing sequence flips the card to its new face
const anvilCard = stage=>{ const w = stage && stage.querySelector('.forge-preview-wrap'); return (w && (w.querySelector('.card-tile') || w)) || stage; };
const anvilRect = stage=>{ const el = anvilCard(stage); return el && el.isConnected ? centre(el) : null; };
// Limit break (meta-forge-limit-break): red-hot chains bind the card while it is hammered, snap at the flip; Dragon Scale glow.
M.forgeLimitBreak = function(stage, opts){
  opts = opts || {}; const g = G(); const c0 = anvilRect(stage); if(!g || !c0) return Promise.resolve(); packCss();
  const at = opts.at != null ? opts.at : FORGE_FLIP_MS;
  css('lb', `.fxd-chain{position:fixed; height:8px; margin-top:-4px; pointer-events:none; z-index:1201; transform-origin:50% 50%;
      background:radial-gradient(ellipse 5px 3.2px at 50% 50%, transparent 55%, #9aa0aa 60%, #e6e9ee 72%, #6a6e76 86%, transparent 92%) 0 0/11px 8px repeat-x; filter:drop-shadow(0 1px 1px #000);}
    .fxd-chain.is-hot{filter:drop-shadow(0 0 4px #ff5a10) sepia(1) saturate(5) hue-rotate(-20deg) brightness(1.1);}
    .fxd-scales{position:fixed; pointer-events:none; z-index:1200; border-radius:12px; mix-blend-mode:screen;
      background:radial-gradient(circle at 50% 0%, transparent 48%, rgba(255,200,110,.95) 55%, rgba(255,60,20,.45) 64%, transparent 70%) 0 0/16px 12px, radial-gradient(circle at 50% 0%, transparent 48%, rgba(255,200,110,.95) 55%, rgba(255,60,20,.45) 64%, transparent 70%) 8px 6px/16px 12px;}`);
  const mk = (rot, dy)=>{ const ch = layer('fxd-chain'); g.set(ch, {left:c0.x - c0.w*.75, top:c0.y + dy, width:c0.w*1.5, rotation:rot, scaleX:0}); return ch; };
  const chains = [mk(32, -c0.h*.12), mk(-32, -c0.h*.12), mk(0, c0.h*.18)];
  const sc = layer('fxd-scales'); g.set(sc, {left:c0.r.left, top:c0.r.top, width:c0.w, height:c0.h, opacity:0});
  const tl = g.timeline({onComplete:()=>{ chains.forEach(x=> x.remove()); sc.remove(); }});
  tl.to(chains, {scaleX:1, duration:.25, stagger:.08, ease:'power2.out'}, .05).add(()=> snd('chainBreak'), .1)
    .add(()=> chains.forEach(x=> x.classList.add('is-hot')), at/1000 - .55)
    .add(()=>{ snd('iceShatter'); snd('rareRise', true); const c = anvilRect(stage) || c0;
      chains.forEach((ch, k)=> g.to(ch, {x:(k - 1)*60 + rnd(-20, 20), y:rnd(40, 90), rotation:'+=' + rnd(-60, 60), opacity:0, scaleX:.4, duration:.6, ease:'power2.in'}));
      burstAt(c.x, c.y, 20, ['#ffd08a', '#ff6a1a', '#d8dde6'], {r0:50, r1:160, dur:.9});
      ringAt(c.x, c.y, c.h, {border:'4px solid #ffb04a', boxShadow:'0 0 18px #ff6a10'}, {to:2.4, dur:.7});
      textPop(c.x, c.r.top - 18, 'LIMIT BREAK!', {color:'#fff1d0', textShadow:'0 0 10px #ff5a10, 0 2px 0 #5a1a00', fontSize:'20px'}, {hold:.9}); }, at/1000)
    .to(sc, {opacity:.85, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut'}, at/1000 + .1);
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ chains.forEach(x=> x.remove()); sc.remove(); res(); }));
};
// Promote (meta-forge-promote): at the flip the frame recolours from the old rarity to the new one, a sweep wipes the colour across.
M.forgePromote = function(stage, opts){
  opts = opts || {}; const g = G(); const c0 = anvilRect(stage); if(!g || !c0) return Promise.resolve(); packCss();
  const col = k=> ({common:'#8a8f98', uncommon:'#3fb950', rare:'#2f6fe0', veryrare:'#60b4ff', superrare:'#14b8a6', epic:'#9333ea', heroic:'#f97316', unique:'#f59e0b', legendary:'#facc15', mythic:'#dc2626'}[k] || k || '#facc15');
  const a = col(opts.from || 'common'), b = col(opts.to || 'rare'), at = (opts.at != null ? opts.at : FORGE_FLIP_MS)/1000;
  const fr = layer('fxd-box'); fr.style.cssText += `border-radius:12px; padding:4px; ${BORDER_MASK} background:linear-gradient(115deg, ${b} 0 45%, #fff 50%, ${a} 55% 100%); background-size:260% 100%; background-position:100% 0; box-shadow:0 0 14px ${a};`;
  g.set(fr, {left:c0.r.left - 4, top:c0.r.top - 4, width:c0.w + 8, height:c0.h + 8, opacity:0});
  const lab = k=> ({veryrare:'Very Rare', superrare:'Super Rare'}[k] || (k ? k[0].toUpperCase() + k.slice(1) : ''));
  return new Promise(res=> g.timeline({onComplete:()=>{ fr.remove(); res(); }})
    .to(fr, {opacity:1, duration:.3}, at - .5)
    .to(fr, {backgroundPosition:'0% 0', duration:.55, ease:'power2.inOut', onStart:()=> snd('rareRise', false)}, at)
    .add(()=>{ fr.style.boxShadow = `0 0 18px ${b}`; const c = anvilRect(stage) || c0; burstAt(c.x, c.y, 16, [b, '#fff', b], {r0:50, r1:140, dur:.9}); ringAt(c.x, c.y, c.h, {border:`3px solid ${b}`}, {to:2.2});
      textPop(c.x, c.r.top - 18, (opts.from ? lab(opts.from) + ' → ' : '') + lab(opts.to || 'rare') + '!', {color:'#fff', textShadow:`0 0 10px ${b}, 0 2px 0 rgba(0,0,0,.6)`, fontSize:'18px'}, {hold:.9}); snd('unlockChime'); }, at + .5)
    .to(fr, {opacity:0, duration:.5}, '+=.8'));
};
// Prestige (meta-forge-prestige): after the flip the ring paints itself on — gold, rainbow, or a double frame for Extended.
M.forgePrestige = function(stage, opts){
  opts = opts || {}; const g = G(); const c0 = anvilRect(stage); if(!g || !c0) return Promise.resolve();
  const tier = opts.tier || 'gold', at = (opts.at != null ? opts.at : FORGE_FLIP_MS)/1000 + .15;
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'fxd fxd-paint'); svg.style.cssText = 'position:fixed; pointer-events:none; z-index:1201; overflow:visible;';
  const W = c0.w + 8, H = c0.h + 8; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const grad = tier === 'rainbow' || tier === 'extended' ? `<linearGradient id="fxdPg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a8a"/><stop offset=".25" stop-color="#ffd35a"/><stop offset=".5" stop-color="#5aff9a"/><stop offset=".75" stop-color="#5ad0ff"/><stop offset="1" stop-color="#b05aff"/></linearGradient>`
    : `<linearGradient id="fxdPg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".4" stop-color="#e7b84a"/><stop offset=".6" stop-color="#ffe7a0"/><stop offset="1" stop-color="#a8721c"/></linearGradient>`;
  const rect = (inset, w)=> `<rect x="${inset}" y="${inset}" width="${W - inset*2}" height="${H - inset*2}" rx="13" fill="none" stroke="url(#fxdPg)" stroke-width="${w}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="filter:drop-shadow(0 0 4px ${tier === 'gold' ? '#ffcf4a' : '#fff'})"/>`;
  svg.innerHTML = `<defs>${grad}</defs>` + rect(2, 3.5) + (tier === 'extended' ? rect(7, 2) : '');
  document.body.appendChild(svg); g.set(svg, {left:c0.r.left - 4, top:c0.r.top - 4});
  const pen = layer('fxd-dot'); pen.style.cssText += 'width:10px; height:10px; margin:-5px; background:#fff; box-shadow:0 0 10px 4px #ffe08a;'; packCss(); g.set(pen, {opacity:0});
  const rs = svg.querySelectorAll('rect'); const o = {p:0};
  const perim = (p)=>{ const w = W - 4, h = H - 4, L = 2*(w + h); let d = p*L; if(d < w) return [d, 0]; d -= w; if(d < h) return [w, d]; d -= h; if(d < w) return [w - d, h]; d -= w; return [0, h - d]; };
  return new Promise(res=> g.timeline({onComplete:()=>{ svg.remove(); pen.remove(); res(); }})
    .add(()=> snd('prestigeTone'), at)
    .to(o, {p:1, duration:.9, ease:'power1.inOut', onUpdate:()=>{ rs.forEach((r, k)=> r.setAttribute('stroke-dashoffset', String(100 - Math.min(100, o.p*100*(k ? 1.15 : 1))))); const q = perim(o.p); g.set(pen, {opacity:1, x:c0.r.left - 2 + q[0], y:c0.r.top - 2 + q[1]}); }}, at)
    .add(()=>{ g.set(pen, {opacity:0}); const c = anvilRect(stage) || c0; burstAt(c.x, c.y, 18, tier === 'gold' ? ['#ffd75e', '#fff3c0', '#e7b84a'] : ['#ff5a8a', '#ffd35a', '#5aff9a', '#5ad0ff', '#b05aff'], {r0:60, r1:150});
      textPop(c.x, c.r.top - 18, tier === 'gold' ? 'PRESTIGE GOLD' : tier === 'rainbow' ? 'PRESTIGE RAINBOW' : 'EXTENDED ART', {color:'#fff', textShadow:'0 0 10px #ffcf4a, 0 2px 0 rgba(0,0,0,.6)', fontSize:'17px'}, {hold:.8}); })
    .to(svg, {opacity:0, duration:.6}, '+=.7'));
};
// Refine (meta-forge-refine): after the flip the new finish sweeps across the card as it lands, and its name stamps in.
M.forgeRefine = function(stage, opts){
  opts = opts || {}; const g = G(); const c0 = anvilRect(stage); if(!g || !c0) return Promise.resolve(); packCss();
  const at = (opts.at != null ? opts.at : FORGE_FLIP_MS)/1000 + .1, f = String(opts.finish || 'rainbow');
  const look = {pearl:'linear-gradient(115deg, transparent, #fff6f0 30%, #f0e0ff 45%, #e0f6ff 60%, transparent)', gold:'linear-gradient(115deg, transparent, #fff1b8 25%, #e7b84a 45%, #fff6cf 55%, transparent)',
    prism:'repeating-linear-gradient(115deg, hsl(0 100% 70%) 0 8px, hsl(60 100% 65%) 8px 16px, hsl(140 100% 60%) 16px 24px, hsl(220 100% 70%) 24px 32px, hsl(300 100% 70%) 32px 40px)',
    cosmos:'linear-gradient(115deg, transparent, #3a1a8a 25%, #d0a0ff 45%, #2a6aff 60%, transparent)'}[f] || 'linear-gradient(115deg, transparent, hsl(0 100% 70%) 20%, hsl(60 100% 65%) 35%, hsl(140 100% 60%) 50%, hsl(220 100% 70%) 65%, hsl(300 100% 70%) 80%, transparent)';
  const box = layer('fxd-box', '<b></b>'); box.style.cssText += 'border-radius:12px; overflow:hidden;';
  const band = box.firstChild; band.style.cssText = `position:absolute; top:-30%; bottom:-30%; left:-80%; width:70%; transform:skewX(-18deg); background:${look}; mix-blend-mode:screen; opacity:.95; filter:blur(.5px);`;
  g.set(box, {left:c0.r.left, top:c0.r.top, width:c0.w, height:c0.h});
  const nm = f.charAt(0).toUpperCase() + f.slice(1);
  return new Promise(res=> g.timeline({onComplete:()=>{ box.remove(); res(); }})
    .to(band, {x:c0.w*2.4, duration:.75, ease:'power2.inOut', onStart:()=> snd('sweepTone')}, at)
    .add(()=>{ const c = anvilRect(stage) || c0; const t = anvilCard(stage); if(t && t.classList && t.classList.contains('card-tile')) M.foilGlint(t, {dur:.5});
      burstAt(c.x, c.y, 12, ['#fff', '#ffe9a0', '#d8f0ff'], {r0:40, r1:110, size:4}); textPop(c.x, c.r.top - 18, '✨ ' + nm, {color:'#fff', textShadow:'0 0 10px #b8d8ff, 0 2px 0 rgba(0,0,0,.6)', fontSize:'18px'}, {hold:.8}); snd('pitchChime'); }, at + .55)
    .to({}, {duration:1.1}));
};
// Melt duplicates for Dust (meta-forge-melt): the card droops and glows, drips, then streams as dust into the Dust pill.
M.forgeMelt = function(tile, opts){
  opts = opts || {}; const g = G(), t = tileOf(tile); if(!g || !t || !t.isConnected) return Promise.resolve(); packCss();
  const c = centre(t), ghost = layer('fxd-box'); ghost.innerHTML = t.outerHTML; ghost.style.cssText += 'transform-origin:50% 100%;'; g.set(ghost, {left:c.r.left, top:c.r.top, width:c.w, height:c.h});
  const inner = ghost.firstElementChild; if(inner){ inner.style.width = c.w + 'px'; inner.style.height = c.h + 'px'; inner.style.margin = '0'; }
  const pill = document.querySelector('.cur-pill[title="Magic Dust"]'), pr = pill && pill.getBoundingClientRect().width ? centre(pill) : {x:vw() - 60, y:24};
  const motes = []; for(let k = 0; k < 18; k++){ const m = layer('fxd-dot'); m.style.background = k % 3 ? '#d8c8ff' : '#fff6c0'; m.style.boxShadow = '0 0 6px #b8a0ff'; motes.push(m); g.set(m, {x:c.x + rnd(-c.w*.35, c.w*.35), y:c.r.bottom - rnd(0, c.h*.25), opacity:0}); }
  snd('burnAway');
  return new Promise(res=> g.timeline({onComplete:()=>{ ghost.remove(); motes.forEach(m=> m.remove()); res(); }})
    .to(ghost, {filter:'sepia(1) saturate(4) hue-rotate(-25deg) brightness(1.3)', duration:.25})
    .to(ghost, {scaleY:.15, scaleX:1.12, y:c.h*.05, opacity:.85, duration:.55, ease:'power2.in'})
    .to(ghost, {opacity:0, duration:.2})
    .to(motes, {opacity:1, duration:.1, stagger:.015}, '-=.25')
    .to(motes, {x:pr.x, y:pr.y, duration:.7, ease:'power2.in', stagger:.025}, '<')
    .add(()=>{ if(pill) g.fromTo(pill, {scale:1}, {scale:1.25, duration:.12, yoyo:true, repeat:1, clearProps:'scale'}); snd('gold');
      if(opts.dust) textPop(pr.x, pr.y + 26, '+✨ ' + opts.dust, {color:'#efe6ff', textShadow:'0 0 6px #8a6aff', fontSize:'16px'}, {hold:.6}); })
    .to(motes, {opacity:0, duration:.15}));
};
// Fuse (meta-forge-fuse): three copies fly in and fold into one over the anvil, sparks, a flash.
M.forgeFuse = function(anvil, opts){
  opts = opts || {}; const g = G(); if(!g || !anvil) return Promise.resolve(); packCss();
  const c = centre(anvil), w = Math.min(70, c.w*.5 || 70), h = w*1.32; const cards = [-1, 0, 1].map(k=>{ const e = layer('fxd-box'); e.style.cssText += `border-radius:9px; background:linear-gradient(160deg, #6a5038, #3a2a1a); box-shadow:inset 0 0 0 2px #e8c070, 0 4px 10px rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; font-size:${w*.45}px;`;
    e.textContent = opts.icon || '🃏'; g.set(e, {left:c.x - w/2, top:c.y - h/2, width:w, height:h, x:k*w*1.6, y:-20, rotation:k*14, opacity:0}); return e; });
  snd('clang');
  return new Promise(res=> g.timeline({onComplete:()=>{ cards.forEach(e=> e.remove()); res(); }})
    .to(cards, {opacity:1, y:0, duration:.25, stagger:.08, ease:'power2.out'})
    .to(cards, {x:0, rotation:0, duration:.35, ease:'power3.in'}, '+=.15')
    .add(()=>{ snd('clang'); burstAt(c.x, c.y, 22, ['#ffd08a', '#ff8a2a', '#fff3c0'], {r0:40, r1:140, fall:40}); ringAt(c.x, c.y, h, {background:'radial-gradient(circle, rgba(255,250,220,.95), rgba(255,180,60,.4) 40%, transparent 70%)'}, {to:3, dur:.5}); })
    .to(cards.slice(1), {opacity:0, duration:.01}).fromTo(cards[0], {scale:1.3}, {scale:1, duration:.4, ease:'back.out(2)'})
    .to(cards[0], {opacity:0, y:-20, duration:.35}, '+=.35'));
};
// Forge tier up (meta-forge-tier-up): the hearth roars — flames rise behind the Forge panel, an anvil drops in, the new name.
M.forgeTierUp = function(el, opts){
  opts = opts || {}; const g = G(); if(!g) return Promise.resolve(); packCss(); css('foil-base', FOIL_BASE);
  const c = el && el.getBoundingClientRect && el.getBoundingClientRect().width ? centre(el) : {x:vw()/2, y:vh()/2, w:300, h:120, r:{left:vw()/2 - 150, top:vh()/2 - 60, right:vw()/2 + 150, bottom:vh()/2 + 60}};
  const fl = layer('fxd-box'); const W = Math.max(220, c.w), H = Math.max(140, c.h*1.6);
  fl.style.cssText += `border-radius:50% 50% 12px 12px / 60% 60% 12px 12px; background:${noise('.04 .1', 3, 5, '0 0 0 0 1  0 0 0 0 .45  0 0 0 0 .08  0 0 0 -2.3 2.1', 'fractalNoise', 160)}, linear-gradient(0deg, #ffe08a, #ff6a10 40%, rgba(200,30,0,.0)); background-size:160px 160px, 100% 100%; animation:fxdFlame 3s linear infinite; mix-blend-mode:screen; -webkit-mask-image:linear-gradient(0deg, #000 50%, transparent); mask-image:linear-gradient(0deg, #000 50%, transparent);`;
  g.set(fl, {left:c.x - W/2, top:c.r.bottom - H, width:W, height:H, scaleY:0, transformOrigin:'50% 100%'});
  const an = layer('fxd-ico'); an.textContent = '⚒️'; an.style.fontSize = '34px'; g.set(an, {x:c.x, y:c.r.top - 120, opacity:0});
  snd('unlockChime'); snd('fireBreath', 500);
  return new Promise(res=> g.timeline({onComplete:()=>{ fl.remove(); an.remove(); res(); }})
    .to(fl, {scaleY:1, duration:.4, ease:'power2.out'})
    .to(an, {y:c.y - 10, opacity:1, duration:.35, ease:'bounce.out'}, .15)
    .add(()=>{ snd('clang'); burstAt(c.x, c.y, 18, ['#ffd08a', '#ff8a2a', '#fff'], {r0:40, r1:150}); textPop(c.x, c.r.top - 14, opts.name ? '🏭 ' + opts.name : '🏭 Forge upgraded!', {color:'#fff1d0', textShadow:'0 0 10px #ff6a10, 0 2px 0 #5a1a00', fontSize:'18px'}, {hold:1}); }, .5)
    .to(fl, {scaleY:.3, opacity:0, duration:.6}, '+=.6').to(an, {opacity:0, duration:.3}, '<'));
};
// Castle temper (meta-castle-temper): stones fly in and fit into the wall one by one, with a thunk and a puff of dust each.
M.castleTemper = function(tile, opts){
  opts = opts || {}; const g = G(), t = tileOf(tile); if(!g || !t || !t.isConnected) return Promise.resolve(); packCss(); const c = centre(t);
  const stones = []; for(let k = 0; k < 6; k++){ const s = layer('fxd-box'); s.style.cssText += 'border-radius:3px; background:linear-gradient(160deg, #b8b2a6, #7a7468); box-shadow:inset 0 -2px 0 rgba(0,0,0,.3), 0 2px 3px rgba(0,0,0,.4);';
    const w = c.w*.26, h = w*.55, tx = c.r.left + c.w*(.12 + (k % 3)*.29), ty = c.r.top + c.h*(.32 + Math.floor(k/3)*.16); stones.push([s, tx, ty]);
    g.set(s, {left:tx, top:ty, width:w, height:h, x:(k % 2 ? 1 : -1)*rnd(80, 140), y:-rnd(60, 120), rotation:rnd(-60, 60), opacity:0}); }
  const tl = g.timeline({onComplete:()=>{ stones.forEach(s=> s[0].remove()); }});
  stones.forEach(([s, tx, ty], k)=> tl.to(s, {x:0, y:0, rotation:0, opacity:1, duration:.22, ease:'power3.in'}, k*.13)
    .add(()=>{ snd('woodKnock'); burstAt(tx + 10, ty + 8, 5, ['#cfc6b4', '#a89e8a'], {r0:8, r1:24, size:4, dur:.5}); }, k*.13 + .22));
  tl.fromTo(t, {scale:1}, {scale:1.06, duration:.15, yoyo:true, repeat:1, clearProps:'scale'}, '+=.05')
    .add(()=>{ textPop(c.x, c.r.top - 14, opts.level ? '🏰 Lv ' + opts.level : '🏰 Tempered!', {color:'#fff', textShadow:'0 0 8px #c8a070, 0 2px 0 rgba(0,0,0,.6)', fontSize:'17px'}, {hold:.6}); snd('readyChime'); })
    .to(stones.map(s=> s[0]), {opacity:0, duration:.35}, '+=.3');
  return new Promise(res=> tl.eventCallback('onComplete', ()=>{ stones.forEach(s=> s[0].remove()); res(); }));
};

// ======================= HOOKS =======================
// Battle events (fxBatchVfx → FX.D.onEvent). Gating (reduced motion, Effects "none") already happened in the caller.
M.onEvent = function(ev, env){
  if(!ev) return;
  // a foil / Legendary-and-up / Supreme / Shiny unit catches the light as it lands (foil-tilt-board)
  if(ev.type === 'play' && ev.uid != null && env.fxAtLeast('med')) env.at(620, ()=>{ const t = env.tile(ev.uid);
    if(t && t.isConnected && t.matches('.is-holo, .card-tile-foil, .rarity-tier-top, .is-supreme, .is-shiny') && env.once('fxd-glint' + ev.uid)) M.foilGlint(t); });
  // a stolen unit gets its puppet strings once it has crossed over (st-mind-controlled)
  if(ev.type === 'mindControl' && ev.targetUid != null){ mindSet(env).add(String(ev.targetUid)); env.at(750, ()=>{ const el = env.el(ev.targetUid); if(el) M.statusLook(el, 'mind', true); }); }
  // the day/night bonus fades out (st-phase-fade)
  if(ev.type === 'statusFx' && ev.kind === 'phaseFade' && env.fxAtLeast('med')){ const el = env.el(ev.uid != null ? ev.uid : ev.targetUid); if(el) M.phaseFade(el, ev.phase); }
};
// Non-battle moments: fxHook('<name>', ...args) in arena_app.js calls M.hooks.<name>(...args, env).
// Live status looks: after updateCardStatusDisplay(uid) patches a board card.
M.hooks.cardStatusShown = function(el, c, env){
  if(!el || !c || !env.fxAtLeast('low')) return;
  const uid = el.getAttribute('data-uid');
  M.syncStatusLooks(el, statusStates(c, uid, env));
  // a new status chip pops (st-status-badges)
  const now = [...el.querySelectorAll('.badges-bottom .abadge')], keys = now.map(b=> b.className), prev = el.__fxdBadges;
  if(prev && env.fxAtLeast('med')) now.forEach((b, i)=>{ if(!prev.includes(keys[i])) M.badgePop(b); });
  el.__fxdBadges = keys;
  // Rage turns on below half Health (st-rage-enter): the board shows it at once, with its moment
  const d = env.defs && env.defs[c.defId], raging = !!(d && d.effects && d.effects.rage) && c.maxHp > 0 && c.hp > 0 && c.hp/c.maxHp < .5;
  if(raging && !seenSet(env, 'rage').has(String(uid))){ seenSet(env, 'rage').add(String(uid)); el.classList.add('raging'); if(env.fxAtLeast('med')) M.rageEnter(el); }
};
// A row was rebuilt (renderBoard): put the looks back on, mark boss tiles, catch a fresh cage or a fresh rage.
M.hooks.boardRowsBuilt = function(bf, env){
  if(!bf || !env.fxAtLeast('low')) return;
  const look = typeof currentCardByUid === 'function' ? currentCardByUid : null;
  let boss = false; try{ boss = typeof fightTreatmentKind === 'function' && fightTreatmentKind(2) === 'boss'; }catch(e){}
  bf.querySelectorAll('.board-card[data-uid]').forEach(el=>{
    const uid = el.getAttribute('data-uid'); let c = null; try{ c = look ? look(isNaN(+uid) ? uid : +uid) || look(uid) : null; }catch(e){}
    if(c) M.syncStatusLooks(el, statusStates(c, uid, env));
    if(boss && el.closest('#rowEnemy')){ const t = el.querySelector('.card-tile.art-extended'); if(t) t.classList.add('fxd-boss'); }
    if(el.classList.contains('is-caged') && !seenSet(env, 'cage').has(uid)){ seenSet(env, 'cage').add(uid); if(env.fxAtLeast('med')) later(()=>{ if(el.isConnected) M.cageDrop(el); }, 250); }
    if(el.classList.contains('raging') && !seenSet(env, 'rage').has(uid)){ seenSet(env, 'rage').add(uid); if(env.fxAtLeast('med')) later(()=>{ if(el.isConnected) M.rageEnter(el); }, 120); }
  });
};
// Packs.
let curPack = null;
M.hooks.packShown = function(packEl, pack, o, env){
  curPack = pack || null; if(!packEl || !env.fxAtLeast('low')) return;
  M.packDress(packEl, pack);
};
M.hooks.packTorn = function(packEl, pack, o, env){ if(packEl && env.fxAtLeast('med')) M.packTear(packEl, pack || curPack); };
M.hooks.packCardUp = function(card, r, d, env){
  if(!card) return;
  clearReveal();
  const deck = card.parentNode;
  if(deck && !deck.__fxdBacks){ deck.__fxdBacks = true; const id = String(curPack && curPack.id || '').replace(/^fp-/, ''); const key = BACKS[id] ? id : 'acorn';
    deck.querySelectorAll('.po2-back').forEach(b=> M.cardBack(b, key)); }
  const k = rarityKey(d); if(TOP.includes(k) && env.fxAtLeast('med') && !card.__fxdTease) M.packTease(card, k);
};
M.hooks.packCardRevealed = function(card, r, d, env){
  if(!card || !r) return;
  if(card.__fxdTease){ card.__fxdTease.stop(); card.__fxdTease = null; }
  if(!env.fxAtLeast('med')) return;
  const k = rarityKey(d), band = ['heroic', 'unique', 'questunique'].includes(k) ? 'heroic' : k === 'legendary' || k === 'devlegendary' || k === 'eventlegendary' ? 'legendary' : '';
  let delay = 0; const run = fn=> ()=> inReveal(()=>{ if(card.isConnected) fn(); });
  inReveal(()=>{
    if(TOP.includes(k)){ M.revealTop(card, k, 'A'); delay = 1100; }
    else if(band === 'heroic'){ later(run(()=> M.revealHeroic(card)), 250); delay = 700; }
    else if(band === 'legendary'){ later(run(()=> M.revealLegendary(card)), 250); delay = 800; }
    if(r.foil) later(run(()=> M.revealFoil(card)), delay + 380);       // the foil pull gets its own beat, after any rarity reveal
    else if(r.shiny) later(run(()=> M.revealShiny(card)), delay + 380);
    else if(!r.isNew && !delay) later(run(()=> M.revealDuplicate(card, {count:(r.count || 1) + 1})), 420);
  });
};
// Forge.
M.hooks.forgeUpgrade = function(kind, stage, info, env){
  if(!stage || !env.fxAtLeast('med')) return; info = info || {};
  if(kind === 'limitBreak') M.forgeLimitBreak(stage, info);
  else if(kind === 'promote') M.forgePromote(stage, info);
  else if(kind === 'prestige') M.forgePrestige(stage, info);
  else if(kind === 'refine') M.forgeRefine(stage, info);
};
M.hooks.forgeMelt = function(tile, v, env){ if(tile && env.fxAtLeast('med')) M.forgeMelt(tile, {dust:v && v.dust}); };
M.hooks.forgeFuse = function(anvil, def, env){ if(anvil && env.fxAtLeast('med')) M.forgeFuse(anvil, {icon:def && def.icon}); };
M.hooks.forgeTierUp = function(next, env){ if(!env.fxAtLeast('med')) return; later(()=> M.forgeTierUp(document.querySelector('.forge-upgrade') || document.getElementById('anvilStage'), {name:next && next.name}), 90); };
M.hooks.castleTempered = function(id, level, env){
  if(!env.fxAtLeast('med')) return;
  later(()=>{ const sel = `[data-forge-castle="${String(id).replace(/"/g, '')}"], [data-temper-castle="${String(id).replace(/"/g, '')}"]`; const b = document.querySelector(sel);
    const row = b && (b.closest('.fc-row') || b.closest('[class*="castle"]')); const t = row && row.querySelector('.card-tile'); if(t) M.castleTemper(t, {level}); }, 90);
};

})(typeof window !== 'undefined' ? window : globalThis);
