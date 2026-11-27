/* ============================================================
   Bramblewood FX, batch V (2026-11-27, package VFX1; owner 11-27 09:55: "Keep working on making card (itself) vfx, card (outward) and
   skill vfx, field vfx, potential boss vfx like cages, skeleton bosses, mages, sea-like etc."): skill, field and boss looks with a
   pixel-art feel. Same contract as bramblewood-fx-a.js … -h.js (docs/effects-lab-contract.md): window.FX.V, pure visuals, CSS through
   css() with the fxv- prefix, every node added is removed again. Lab demos: tools/effects-lab/manifest/vfx1.js. Inventory and the
   per-skill audit: docs/design/vfx1-2026-11-27.md.

   How they are drawn: each pixel sprite is ONE element whose box-shadow paints the art (an ASCII map below), painted once, then moved
   only by transform / opacity (Web Animations, compositor), with steps() easing for the chunky pixel motion. One rect read per effect,
   then writes; no filter, no blend mode. Effects Low plays the minimal version; reduced motion and Effects None never reach them
   (fxBatchVfx / fxHook skip), and each function also returns at once under reduced motion.

   Skills (battle events, M.onEvent), each under 400 ms:
     M.swiftDash(att, {up})             Swift: speed streaks trail the attacker as its swing starts, a kick of dust (FX.A.swiftBlur's card
                                        clones with filter + blend mode step aside)
     M.tideCrest(el, {kind})            Tide: a pixel wave crest washes up a Tide unit as the tide turns, ⚔ on Flood / High, 🛡 on Ebb
     M.hatchPop(el)                     Hatchling: an evolute lands on it: the shell halves pop off, sparks, a green plus
     M.reachArc(att, target)            Reach: a dotted aim arc bends into the next lane, a crosshair snaps on the target
     M.mightySlam(target)               Mighty: a square shockwave and a x2 stamp on the blow, rock chips
     M.berryPop(el, {total}) / M.berryEat(el, to)   Foraging: a berry pops into its pips; three berries hop to the ally it feeds
     M.sturdyBrace(target)              Sturdy: stone brackets clamp the corners as the halved blow lands
     M.twinSlash(att)                   Twin Strike: two blades cross over the card before its second swing
   Field (fxHook matchUI / boardRendered, Effects Medium and up), one tiled CSS layer set under the cards:
     M.fieldAmbient(host, kind)         kind: rain | storm | heat | frost | sand | ash | null (clears). M.fieldKind(m) picks it.
   Bosses (Effects Low: the minimal version):
     M.cageClose(card)                  the cage's bars slam down over the caged leader, bramble vines coil, a padlock (Caged Fight,
                                        boardRendered after the versus opener; FX.D.cageDrop steps aside)
     M.skeletonRise(anchor)             bones fly in and assemble under a skull, dust, the eyes light (no skeleton boss yet: Lab only)
     M.mageCast(anchor)                 a ring of runes turns, charges and bursts (The Kelp Witch, 9-7)
     M.seaRise(host)                    the water line rises over the board and waves roll down the lanes (The Drowned Colossus, raids in
                                        the Abyss)
     M.bossKind(o)                      'skeleton' | 'mage' | 'sea' | null from a boss's name / id / icon
   Cues (SoundKit, built from SoundKit.prim): swiftZip, tideLap, shellCrack, reachCreak, mightyThud, berryPlip, berryMunch, sturdyThunk,
   twinShing, cageSlam, boneClatter, runeHum, seaSurge; RITUAL1 (arena_app.js rt1*): candleCatch, riteLift.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.V = FX.V || {};
const TAG = 'v';

// ---- shared helpers (each batch has its own copy so no batch depends on another) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const centre = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const rnd = (a, b)=> a + Math.random()*(b - a);
const call = fn=>{ try{ fn && fn(); }catch(e){} };
const later = (fn, ms)=>{ const g = G(), run = ()=> call(fn); if(g) g.delayedCall(Math.max(0, ms|0)/1000, run); else setTimeout(run, Math.max(0, ms|0)); };
const wait = ms=> new Promise(res=> later(res, ms));
const cssDone = new Set();
function css(key, text){
  if(cssDone.has(key)) return; cssDone.add(key);
  let s = document.getElementById('fx-' + TAG + '-style');
  if(!s){ s = document.createElement('style'); s.id = 'fx-' + TAG + '-style'; document.head.appendChild(s);
    s.textContent = `.fx${TAG}{position:fixed; left:0; top:0; pointer-events:none; z-index:1200;}\n`; }
  s.textContent += '\n/* ' + key + ' */\n' + text;
}
function layer(cls, html, host){
  const e = document.createElement('div'); e.className = 'fx' + TAG + ' ' + (cls || ''); e.setAttribute('aria-hidden', 'true');
  if(html) e.innerHTML = html; if(host) e.style.position = 'absolute'; (host || document.body).appendChild(e);
  if(!host) try{ Object.defineProperty(e, 'offsetParent', {value: document.body, configurable: true}); }catch(err){} // a fixed overlay is always shown (PERF2)
  return e;
}
Object.assign(M, {css, layer, later, wait, centre, tileOf, rnd});
M.hooks = M.hooks || {};
const RM = ()=>{ try{ return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const speedOf = o=> Math.max(.5, Math.min(3, (o && o.speed) || 1));
const lowOf = o=> !!(o && o.level === 'low');

// ---- pixel sprites: an ASCII map painted by one element's box-shadow (offset by one pixel: a shadow under its own box is not drawn) ----
css('base', `.fxv-px{position:fixed; background:transparent; will-change:transform, opacity; contain:layout style;}
.fxv-box{position:fixed; will-change:transform, opacity; contain:layout style;}`);
const SPR_CACHE = new Map();
function sprite(name, px){
  const key = name + '|' + px; if(SPR_CACHE.has(key)) return SPR_CACHE.get(key);
  const d = SPRITES[name], rows = d.rows, pal = d.pal, sh = [];
  rows.forEach((r, y)=>{ for(let x = 0; x < r.length; x++){ const c = pal[r[x]]; if(c) sh.push(`${(x + 1)*px}px ${(y + 1)*px}px 0 ${c}`); } });
  const s = {sh: sh.join(','), w: rows[0].length*px, h: rows.length*px, px}; SPR_CACHE.set(key, s); return s;
}
const pxFor = w=> Math.max(2, Math.min(4, Math.round((w || 96) / 30))); // one art pixel: 2 px on a phone card, 3-4 on desktop
// one element drawing the sprite centred on (x, y)
function pix(name, x, y, px, extra){
  const s = sprite(name, px), e = document.createElement('i'); e.className = 'fxv fxv-px'; e.setAttribute('aria-hidden', 'true');
  e.style.cssText = `width:${px}px; height:${px}px; box-shadow:${s.sh}; left:${(x - s.w/2 - px).toFixed(1)}px; top:${(y - s.h/2 - px).toFixed(1)}px; transform-origin:${px + s.w/2}px ${px + s.h/2}px;${extra || ''}`;
  document.body.appendChild(e); return e;
}
// one compositor animation; the element goes when it ends (a timer backs it up for a hidden tab)
function play(el, kf, ms, o){
  o = o || {}; const d = Math.max(0, o.delay || 0); let a = null;
  try{ a = el.animate(kf, {duration: Math.max(16, ms), delay: d, easing: o.ease || 'linear', fill: 'both'}); }catch(e){}
  return new Promise(res=>{ let done = false; const end = ()=>{ if(done) return; done = true; if(!o.keep) el.remove(); else if(a) try{ a.cancel(); }catch(e){} res(); };
    if(a) a.onfinish = end; setTimeout(end, ms + d + 400); });
}
const steps = n=> `steps(${n}, end)`;
const all = ps=> Promise.all(ps).then(()=> undefined);

// The art. Palette letters per sprite; '.' is empty.
const SPRITES = {
  streak:  {pal:{w:'rgba(255,255,255,.95)', c:'rgba(170,230,255,.85)', b:'rgba(120,190,255,.55)'}, rows:[
    'w...w...w', 'w...w...w', 'c...w...c', 'c...c...c', 'b...c...b', '....c....', '....b....', 'w.......w', 'c...w...c', 'b...c...b', '....b....', '....b....']},
  dust:    {pal:{d:'#e8dcc0', e:'#b8a888'}, rows:['.d...d.', 'ded.ded', '.e...e.']},
  crest:   {pal:{w:'#ffffff', l:'#bfe8ff', b:'#5fb4ec', B:'#2f7fc4'}, rows:[
    '....ww....ww....', '..wwllw..wwllww.', '.wllbbllwllbbllw', 'wlbbbbbbbbbbbbbl', 'bbbBBBbbbbBBBbbb', 'BBBBBBBBBBBBBBBB']},
  sword:   {pal:{s:'#eef4ff', g:'#9aa7bd', h:'#ffcf4a', k:'#7a4a1e'}, rows:['......s', '.....ss', '....ss.', 'h..ss..', '.hss...', '.kh....', 'k.h....']},
  shield:  {pal:{o:'#1d4f86', b:'#4f9ae0', l:'#bfe0ff'}, rows:['.ooooo.', 'oblllbo', 'obbbbbo', 'obblbbo', '.obbbo.', '..obo..', '...o...']},
  shellL:  {pal:{s:'#fff7e6', e:'#e3cfa6', o:'#8a6a3a'}, rows:['o.o.o.', 'sosoxs', 'ssssss', 'esssss', '.eesss', '..eeee'].map(r=> r.replace(/x/g, 's'))},
  shellR:  {pal:{s:'#fff7e6', e:'#e3cfa6', o:'#8a6a3a'}, rows:['.o.o.o', 'ssosos', 'ssssss', 'sssse.', 'ssse..', 'eeee..']},
  spark:   {pal:{y:'#fff2a0', o:'#ffc23a'}, rows:['.y.', 'yoy', '.y.']},
  plus:    {pal:{g:'#7cf08a', d:'#2c8a3c'}, rows:['.dgd.', 'dgggd', 'ggggg', 'dgggd', '.dgd.'].map(r=> r)},
  dot:     {pal:{r:'#ffe066', o:'#c27a12'}, rows:['ro', 'oo']},
  cross:   {pal:{r:'#ff4d4d', d:'#8a1414', w:'#ffffff'}, rows:['...r...', '...r...', '.......', 'rr.w.rr', '.......', '...r...', '...r...']},
  ring:    {pal:{w:'#fff6d0', y:'#ffc23a'}, rows:[
    '..wwwwwwwww..', '.y.........y.', 'w...........w', 'w...........w', 'w...........w', 'w...........w', 'w...........w', 'w...........w', 'w...........w', 'w...........w', 'w...........w', '.y.........y.', '..wwwwwwwww..']},
  x2:      {pal:{r:'#ff6b3d', y:'#ffd166', d:'#4a0a02'}, rows:[
    'rr..rr.yyyy.', '.rrrr.....yy', '..rr....yyy.', '.rrrr..yy...', 'rr..rr.yyyyy', 'dd..dd.ddddd']},
  chip:    {pal:{a:'#8b7b6a', b:'#5a4c40'}, rows:['ab', 'bb']},
  berry:   {pal:{l:'#5cc65c', p:'#7a3fc4', h:'#c79bff', d:'#3c1f6e'}, rows:['..l.', '.ll.', 'pphp', 'pppp', 'dppd', '.dd.']},
  pip1:    {pal:{p:'#7a3fc4', o:'rgba(255,255,255,.35)'}, rows:['pp.oo.oo', 'pp.oo.oo']},
  pip2:    {pal:{p:'#7a3fc4', o:'rgba(255,255,255,.35)'}, rows:['pp.pp.oo', 'pp.pp.oo']},
  pip3:    {pal:{p:'#7a3fc4', o:'rgba(255,255,255,.35)'}, rows:['pp.pp.pp', 'pp.pp.pp']},
  heart:   {pal:{r:'#ff6b8b', w:'#ffd0dc', d:'#8a1c3a'}, rows:['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...d...']},
  bracket: {pal:{s:'#c9c2b6', d:'#6d655a', h:'#efe9de'}, rows:['hssss', 'sdddd', 'sd...', 'sd...', 'sd...']},
  half:    {pal:{w:'#efe9de', d:'#4d463e'}, rows:['dw...d', '.w..d.', '.w.d..', '..d...', '.d.ww.', 'd...w.', '...w..', '...ww.']},
  blade:   {pal:{w:'#ffffff', s:'#cfe0ff', g:'#7f8ba3'}, rows:[
    'w.........', '.ws.......', '..ws......', '...ws.....', '....ws....', '.....ws...', '......ws..', '.......wsg', '........gg']},
  flash:   {pal:{w:'#ffffff', y:'#fff2a0'}, rows:['..w..', '.yw y'.replace(' ', 'y'), 'wwwww', 'yywyy'.replace(/./g, (c, i)=> i === 2 ? 'w' : 'y'), '..w..']},
  lock:    {pal:{g:'#ffcf4a', d:'#7a4a10', k:'#3a2208'}, rows:['.ddd.', 'd...d', 'd...d', 'ggggg', 'ggkgg', 'ggkgg', 'ggggg']},
  vine:    {pal:{g:'#3f9a3a', l:'#7cd06a', t:'#8a4a22'}, rows:['.g.', 'tg.', '.gl', '.g.', 'lgt', '.g.', '.g.', 'tgl', '.g.', '.g.']},
  bone:    {pal:{w:'#f2ead8', s:'#b9ae96'}, rows:['ww.....ww', 'wwwwwwwww', 'ss.....ss']},
  skull:   {pal:{w:'#f2ead8', s:'#b9ae96', k:'#1c1410'}, rows:['.wwwww.', 'wwwwwww', 'wkkwkkw', 'wkkwkkw', 'wwwkwww', '.wswsw.', '.s.s.s.']},
  eyes:    {pal:{r:'#ff3a2a'}, rows:['.rr.rr.', '.rr.rr.']},
  rune1:   {pal:{v:'#c99bff', c:'#7ef0ff'}, rows:['v.v.v', '.vcv.', 'vcccv', '.vcv.', 'v.v.v']},
  rune2:   {pal:{v:'#c99bff', c:'#7ef0ff'}, rows:['vvvvv', '..c..', '.ccc.', '..c..', 'vvvvv']},
  rune3:   {pal:{v:'#c99bff', c:'#7ef0ff'}, rows:['v...v', '.c.c.', '..v..', '.c.c.', 'v...v']},
  rune4:   {pal:{v:'#c99bff', c:'#7ef0ff'}, rows:['..v..', '.vcv.', 'vc.cv', '.vcv.', '..v..']},
  orb:     {pal:{w:'#ffffff', c:'#9ff6ff', v:'#b17cff'}, rows:['.vvv.', 'vcwcv', 'vwwwv', 'vcwcv', '.vvv.']},
  wave:    {pal:{w:'#ffffff', l:'#bfe8ff', b:'#4aa0e0'}, rows:['..www..', '.wlllw.', 'wllbllw', 'lbbbbbl']},
};

// ---- sounds: each cue a named SoundKit method built from SoundKit.prim (tone / noise / fnoise / sweep), behind the same volume gate ----
const CUES = {
  // an airy upward zip: not Quick's blip, not the swoosh of a swing
  swiftZip(P){ P.fnoise(0.16, 0.06, {type:'bandpass', freq:900, freqEnd:5200, q:1.4, attack:0.004}); P.sweep(500, 1900, 0.09, 'triangle', 0.035, 0.01); },
  // a soft lap of water and a bubble (once per tide turn)
  tideLap(P){ P.fnoise(0.32, 0.05, {type:'lowpass', freq:1400, freqEnd:380, attack:0.05}); P.sweep(380, 760, 0.07, 'sine', 0.04, 0.16); },
  // a crisp shell crack and a chirp
  shellCrack(P){ P.fnoise(0.03, 0.12, {type:'highpass', freq:2600, attack:0.001}); P.tone(1250, 0.03, 'square', 0.02, 0.025); P.sweep(1800, 2600, 0.08, 'sine', 0.04, 0.09); },
  // a bowstring drawn tight, a click as it locks on
  reachCreak(P){ P.sweep(220, 520, 0.18, 'sawtooth', 0.018); P.tone(2400, 0.02, 'square', 0.025, 0.19); },
  // a deep thump and a crunch of stone
  mightyThud(P){ P.sweep(150, 45, 0.22, 'sine', 0.16); P.fnoise(0.12, 0.08, {type:'lowpass', freq:900, freqEnd:200, attack:0.002, crackle:0.04}); },
  berryPlip(P){ P.sweep(700, 1300, 0.06, 'sine', 0.05); P.tone(1560, 0.05, 'sine', 0.02, 0.05); },
  berryMunch(P){ [0, 0.09, 0.18].forEach(d=> P.fnoise(0.04, 0.05, {type:'bandpass', freq:1800, q:2, attack:0.002, delay:d})); P.tone(990, 0.12, 'sine', 0.03, 0.26); },
  // stone on stone: lower and drier than the armour clang
  sturdyThunk(P){ P.tone(180, 0.09, 'square', 0.05); P.fnoise(0.06, 0.07, {type:'bandpass', freq:600, q:1.2, attack:0.001}); P.tone(120, 0.12, 'triangle', 0.07, 0.02); },
  // two quick blade shings, the second higher
  twinShing(P){ P.fnoise(0.09, 0.05, {type:'highpass', freq:4200, attack:0.002}); P.sweep(2200, 3400, 0.08, 'triangle', 0.025, 0.005);
    P.fnoise(0.09, 0.05, {type:'highpass', freq:5200, attack:0.002, delay:0.1}); P.sweep(2800, 4200, 0.08, 'triangle', 0.025, 0.105); },
  // an iron slam and a chain rattle
  cageSlam(P){ P.tone(95, 0.25, 'square', 0.07); P.fnoise(0.18, 0.1, {type:'lowpass', freq:1600, freqEnd:300, attack:0.001});
    [0.16, 0.21, 0.27, 0.34].forEach((d, i)=> P.tone(1800 + i*230, 0.03, 'square', 0.018, d)); },
  boneClatter(P){ for(let i = 0; i < 7; i++) P.fnoise(0.025, 0.06, {type:'bandpass', freq:1400 + (i % 3)*600, q:3, attack:0.001, delay:i*0.07 + Math.random()*0.03});
    P.sweep(90, 60, 0.6, 'sine', 0.07, 0.55); },
  runeHum(P){ P.sweep(160, 640, 0.9, 'triangle', 0.035); P.sweep(320, 1280, 0.9, 'sine', 0.02); P.fnoise(0.25, 0.08, {type:'bandpass', freq:2400, freqEnd:600, q:0.8, attack:0.004, delay:0.95}); P.tone(1320, 0.3, 'sine', 0.03, 0.95); },
  // RITUAL1: a candle catching (a soft fwip and a tick), the rite's darkness lifting (a rising shimmer)
  candleCatch(P){ P.fnoise(0.14, 0.05, {type:'bandpass', freq:700, freqEnd:2600, q:1.1, attack:0.01}); P.tone(1760, 0.06, 'sine', 0.02, 0.1); },
  riteLift(P){ [523, 784, 1046].forEach((f, i)=> P.tone(f, 0.35, 'sine', 0.03, i*0.08)); P.fnoise(0.4, 0.03, {type:'highpass', freq:3000, freqEnd:6000, attack:0.1}); },
  seaSurge(P){ P.fnoise(1.1, 0.08, {type:'lowpass', freq:500, freqEnd:1600, attack:0.4}); P.sweep(70, 110, 1.0, 'sine', 0.08); P.fnoise(0.5, 0.06, {type:'bandpass', freq:900, freqEnd:300, q:0.7, attack:0.05, delay:1.0}); },
};
M.CUES = Object.keys(CUES);
function soundKit(){
  const S = (typeof SoundKit !== 'undefined') ? SoundKit : null; if(!S || !S.prim) return null;
  if(!S.__fxv){ Object.keys(CUES).forEach(k=>{ if(typeof S[k] !== 'function') S[k] = (...a)=>{ try{ CUES[k](S.prim, ...a); }catch(e){} }; }); S.__fxv = true; }
  return S;
}
const snd = (name, ...a)=>{ const S = soundKit(); if(S && typeof S[name] === 'function') S[name](...a); };
M.sound = snd;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soundKit); else later(soundKit, 0);

// =====================================================================================================================
// 1. SKILLS (the eight most-carried Maps 0-20 skills that had no look or a shared one; docs/design/vfx1-2026-11-27.md)
// =====================================================================================================================
// Swift: streaks behind the attacker, on the side away from its target, sliding back as it dashes forward (320 ms)
M.swiftDash = function(att, o){
  o = o || {}; if(!att || RM()) return Promise.resolve(); const c = centre(tileOf(att)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w) + 1, up = o.up !== false, sp = speedOf(o), dy = up ? 1 : -1; // up: it strikes up the board, the streaks trail below
  const st = pix('streak', c.x, c.y + dy*c.h*.42, px, up ? '' : 'rotate:180deg;');
  const ps = [play(st, [{transform:'translateY(0) scaleY(.4)', opacity:0}, {transform:`translateY(${(dy*c.h*.18).toFixed(0)}px) scaleY(1.15)`, opacity:1, offset:.35},
    {transform:`translateY(${(dy*c.h*.5).toFixed(0)}px) scaleY(1.3)`, opacity:0}], 320/sp, {ease:steps(6)})];
  if(!lowOf(o)){ const du = pix('dust', c.x, c.y + dy*c.h*.5, px);
    ps.push(play(du, [{transform:'scale(.5)', opacity:.9}, {transform:'scale(1.6)', opacity:0}], 280/sp, {ease:steps(4)})); }
  return all(ps);
};
// Tide: a crest washes up the card's foot and the bonus pops above it (360 ms)
M.tideCrest = function(el, o){
  o = o || {}; if(!el || RM()) return Promise.resolve(); const c = centre(tileOf(el)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), ebb = o.kind === 'ebb', ps = [];
  if(!lowOf(o)){ const cr = pix('crest', c.x, c.y + c.h*.42, px), h = sprite('crest', px).h;
    ps.push(play(cr, [{transform:`translateY(${h}px)`, opacity:0}, {transform:'translateY(0)', opacity:1, offset:.4}, {transform:'translateY(0)', opacity:1, offset:.7},
      {transform:`translateY(${h}px)`, opacity:0}], 360/sp, {ease:steps(6)})); }
  const ic = pix(ebb ? 'shield' : 'sword', c.x + c.w*.3, c.y - c.h*.36, px);
  ps.push(play(ic, [{transform:'scale(0)', opacity:0}, {transform:'scale(1.3)', opacity:1, offset:.3}, {transform:'translateY(0) scale(1)', opacity:1, offset:.6},
    {transform:`translateY(${-c.h*.12}px) scale(1)`, opacity:0}], 360/sp, {ease:steps(6), delay:60/sp}));
  return all(ps);
};
// Hatchling: the shell halves pop off the top, sparks burst, a green plus rises (380 ms)
M.hatchPop = function(el, o){
  o = o || {}; if(!el || RM()) return Promise.resolve(); const c = centre(tileOf(el)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), y = c.y - c.h*.3, ps = [];
  [['shellL', -1], ['shellR', 1]].forEach(([n, s])=>{ const e = pix(n, c.x + s*sprite(n, px).w*.5, y, px);
    ps.push(play(e, [{transform:'translate(0,0) rotate(0deg)', opacity:1}, {transform:`translate(${s*c.w*.32}px, ${-c.h*.16}px) rotate(${s*50}deg)`, opacity:1, offset:.6},
      {transform:`translate(${s*c.w*.42}px, ${-c.h*.02}px) rotate(${s*80}deg)`, opacity:0}], 380/sp, {ease:steps(7)})); });
  if(!lowOf(o)) for(let i = 0; i < 4; i++){ const a = -Math.PI*(.15 + .7*i/3), e = pix('spark', c.x, y, px);
    ps.push(play(e, [{transform:'translate(0,0) scale(.6)', opacity:1}, {transform:`translate(${Math.cos(a)*c.w*.42}px, ${Math.sin(a)*c.h*.3}px) scale(1.2)`, opacity:0}], 300/sp, {ease:steps(5), delay:40/sp})); }
  const pl = pix('plus', c.x, c.y, px);
  ps.push(play(pl, [{transform:'translateY(0) scale(.4)', opacity:0}, {transform:`translateY(${-c.h*.1}px) scale(1.2)`, opacity:1, offset:.4}, {transform:`translateY(${-c.h*.26}px) scale(1)`, opacity:0}], 360/sp, {ease:steps(6), delay:20/sp}));
  return all(ps);
};
// Reach: dots along an arc from the striker into the lane beside it, a crosshair snaps on (380 ms)
M.reachArc = function(att, tgt, o){
  o = o || {}; if(!tgt || RM()) return Promise.resolve(); const b = centre(tileOf(tgt)); if(!b.w) return Promise.resolve();
  const a = att ? centre(tileOf(att)) : null, px = pxFor(b.w) + 1, sp = speedOf(o), ps = [];
  if(a && a.w && !lowOf(o)){ const n = 6, mx = (a.x + b.x)/2, my = Math.min(a.y, b.y) - Math.abs(a.x - b.x)*.35 - 12;
    for(let i = 1; i <= n; i++){ const t = i/(n + 1), x = (1 - t)*(1 - t)*a.x + 2*(1 - t)*t*mx + t*t*b.x, y = (1 - t)*(1 - t)*a.y + 2*(1 - t)*t*my + t*t*b.y, d = pix('dot', x, y, px);
      ps.push(play(d, [{opacity:0}, {opacity:1, offset:.2}, {opacity:1, offset:.7}, {opacity:0}], 300/sp, {ease:steps(3), delay:(i*25)/sp})); } }
  const x = pix('cross', b.x, b.y, px);
  ps.push(play(x, [{transform:'scale(1.8) rotate(45deg)', opacity:0}, {transform:'scale(1) rotate(0deg)', opacity:1, offset:.45}, {transform:'scale(1)', opacity:1, offset:.8}, {transform:'scale(1.1)', opacity:0}], 380/sp, {ease:steps(5), delay:60/sp}));
  return all(ps);
};
// Mighty: a square shockwave and a x2 stamp where the blow lands, rock chips (380 ms)
M.mightySlam = function(tgt, o){
  o = o || {}; if(!tgt || RM()) return Promise.resolve(); const c = centre(tileOf(tgt)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), ps = [];
  const rg = pix('ring', c.x, c.y, px);
  ps.push(play(rg, [{transform:'scale(.4)', opacity:1}, {transform:'scale(1.6)', opacity:.9, offset:.5}, {transform:'scale(2.3)', opacity:0}], 340/sp, {ease:steps(5)}));
  const st = pix('x2', c.x + c.w*.18, c.y - c.h*.2, px + 1);
  ps.push(play(st, [{transform:'scale(2.2) rotate(-12deg)', opacity:0}, {transform:'scale(1) rotate(-8deg)', opacity:1, offset:.3}, {transform:'scale(1) rotate(-8deg)', opacity:1, offset:.8}, {transform:'scale(1.05) rotate(-8deg)', opacity:0}], 380/sp, {ease:steps(4)}));
  if(!lowOf(o)) for(let i = 0; i < 4; i++){ const ang = Math.PI*(1.1 + i*.27), e = pix('chip', c.x, c.y + c.h*.3, px);
    ps.push(play(e, [{transform:'translate(0,0)', opacity:1}, {transform:`translate(${Math.cos(ang)*c.w*.5}px, ${Math.sin(ang)*c.h*.32}px)`, opacity:1, offset:.6}, {transform:`translate(${Math.cos(ang)*c.w*.6}px, ${c.h*.05}px)`, opacity:0}], 340/sp, {ease:steps(5)})); }
  return all(ps);
};
// Foraging: a berry pops off the card and its pips show the count (1-3); at 3 it feeds an ally
M.berryPop = function(el, o){
  o = o || {}; if(!el || RM()) return Promise.resolve(); const c = centre(tileOf(el)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), n = Math.max(1, Math.min(3, o.total | 0 || 1)), ps = [];
  const b = pix('berry', c.x, c.y - c.h*.3, px);
  ps.push(play(b, [{transform:'translateY(0) scale(.3)', opacity:0}, {transform:`translateY(${-c.h*.16}px) scale(1.2)`, opacity:1, offset:.35}, {transform:`translateY(${-c.h*.08}px) scale(1)`, opacity:1, offset:.6},
    {transform:`translateY(${-c.h*.1}px) scale(.9)`, opacity:0}], 360/sp, {ease:steps(6)}));
  if(!lowOf(o)){ const p = pix('pip' + n, c.x, c.y - c.h*.5, px);
    ps.push(play(p, [{opacity:0}, {opacity:1, offset:.3}, {opacity:1, offset:.8}, {opacity:0}], 360/sp, {ease:steps(3), delay:80/sp})); }
  return all(ps);
};
M.berryEat = function(el, to, o){
  o = o || {}; if(!el || RM()) return Promise.resolve(); const a = centre(tileOf(el)); if(!a.w) return Promise.resolve();
  const b = to ? centre(tileOf(to)) : a, px = pxFor(a.w), sp = speedOf(o), ps = [], k = lowOf(o) ? 1 : 3;
  for(let i = 0; i < k; i++){ const e = pix('berry', a.x + (i - 1)*a.w*.16, a.y - a.h*.3, px), dx = b.x - a.x - (i - 1)*a.w*.16, dy = (b.y - b.h*.1) - (a.y - a.h*.3);
    ps.push(play(e, [{transform:'translate(0,0)', opacity:1}, {transform:`translate(${dx*.5}px, ${dy*.5 - 30}px)`, opacity:1, offset:.5}, {transform:`translate(${dx}px, ${dy}px) scale(.6)`, opacity:0}], 320/sp, {ease:steps(6), delay:(i*50)/sp})); }
  const h = pix('heart', b.x, b.y - b.h*.1, px);
  ps.push(play(h, [{transform:'scale(.3)', opacity:0}, {transform:'scale(1.3)', opacity:1, offset:.4}, {transform:`translateY(${-b.h*.15}px) scale(1)`, opacity:0}], 260/sp, {ease:steps(5), delay:300/sp}));
  return all(ps);
};
// Sturdy: four stone brackets clamp in on the corners as the halved blow lands, with a ½ mark (380 ms)
M.sturdyBrace = function(tgt, o){
  o = o || {}; if(!tgt || RM()) return Promise.resolve(); const c = centre(tileOf(tgt)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), s = sprite('bracket', px), ps = [], hw = c.w/2 - s.w/2 + px, hh = c.h/2 - s.h/2 + px;
  [[-1, -1, 0], [1, -1, 90], [1, 1, 180], [-1, 1, 270]].forEach(([sx, sy, rot])=>{ const e = pix('bracket', c.x + sx*hw, c.y + sy*hh, px, `rotate:${rot}deg;`);
    ps.push(play(e, [{transform:`translate(${sx*c.w*.18}px, ${sy*c.h*.14}px)`, opacity:0}, {transform:'translate(0,0)', opacity:1, offset:.35},
      {transform:`translate(${-sx*px}px, 0)`, opacity:1, offset:.5}, {transform:'translate(0,0)', opacity:1, offset:.75}, {transform:'translate(0,0)', opacity:0}], 380/sp, {ease:steps(6)})); });
  if(!lowOf(o)){ const h = pix('half', c.x, c.y, px);
    ps.push(play(h, [{transform:'scale(1.8)', opacity:0}, {transform:'scale(1)', opacity:1, offset:.35}, {transform:'scale(1)', opacity:1, offset:.8}, {opacity:0}], 360/sp, {ease:steps(4), delay:40/sp})); }
  return all(ps);
};
// Twin Strike: two blades cross over the card before the second swing, a flash where they meet (360 ms)
M.twinSlash = function(att, o){
  o = o || {}; if(!att || RM()) return Promise.resolve(); const c = centre(tileOf(att)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w) + 1, sp = speedOf(o), ps = [], d = c.w*.42;
  [[1, 0], [-1, 90]].slice(0, lowOf(o) ? 1 : 2).forEach(([s, delay])=>{ const e = pix('blade', c.x, c.y, px, s < 0 ? 'scale:-1 1;' : '');
    ps.push(play(e, [{transform:`translate(${-s*d}px, ${-d}px)`, opacity:0}, {transform:'translate(0,0)', opacity:1, offset:.45}, {transform:`translate(${s*d*.6}px, ${d*.6}px)`, opacity:0}], 260/sp, {ease:steps(5), delay:delay/sp})); });
  const f = pix('flash', c.x, c.y, px);
  ps.push(play(f, [{transform:'scale(.4)', opacity:0}, {transform:'scale(1.6)', opacity:1, offset:.4}, {transform:'scale(2)', opacity:0}], 200/sp, {ease:steps(4), delay:150/sp}));
  return all(ps);
};

// =====================================================================================================================
// 2. FIELD: one ambient layer set per weather, under the cards and over the SCENES1 floor (z-index -1 inside the battlefield, as the
//    scene's backdrop). Tiled pixel art (crisp SVG rects) translated by exactly one tile on a loop: compositor only, no script per
//    frame, gone at Effects Low / None and with reduced motion (CSS), still in a hidden tab (the browser stops it).
// =====================================================================================================================
const tile = (w, h, rects)=> `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects}</svg>`)}")`;
const rectsOf = (list, fill)=> list.map(([x, y, w, h])=> `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${fill}'/>`).join('');
const seeded = (n, s, fn)=>{ let x = s; const r = ()=> (x = (x * 9301 + 49297) % 233280) / 233280; return Array.from({length:n}, (_, i)=> fn(r, i)); };
const T_RAIN = tile(48, 72, rectsOf(seeded(9, 7, r=> [Math.floor(r()*46), Math.floor(r()*64), 1, 5 + Math.floor(r()*3)]), 'rgba(205,225,255,.62)'));
const T_RAIN2 = tile(40, 56, rectsOf(seeded(7, 11, r=> [Math.floor(r()*38), Math.floor(r()*50), 1, 3 + Math.floor(r()*2)]), 'rgba(180,205,240,.38)'));
const T_SNOW = tile(64, 64, rectsOf(seeded(8, 3, r=> { const s = r() < .4 ? 2 : 1; return [Math.floor(r()*60), Math.floor(r()*60), s, s]; }), 'rgba(255,255,255,.85)'));
const T_SNOW2 = tile(48, 48, rectsOf(seeded(6, 5, r=> [Math.floor(r()*46), Math.floor(r()*46), 1, 1]), 'rgba(230,240,255,.6)'));
const T_HEAT = tile(56, 80, rectsOf(seeded(6, 13, r=> [Math.floor(r()*54), Math.floor(r()*76), 1, 1]), 'rgba(255,196,90,.7)') + rectsOf(seeded(3, 17, r=> [Math.floor(r()*54), Math.floor(r()*76), 1, 1]), 'rgba(255,240,170,.8)'));
const T_SAND = tile(96, 40, rectsOf(seeded(10, 19, r=> [Math.floor(r()*90), Math.floor(r()*38), 2 + Math.floor(r()*5), 1]), 'rgba(236,206,150,.6)'));
const T_SAND2 = tile(72, 32, rectsOf(seeded(7, 23, r=> [Math.floor(r()*68), Math.floor(r()*30), 1 + Math.floor(r()*3), 1]), 'rgba(210,175,120,.45)'));
const T_ASH = tile(56, 72, rectsOf(seeded(7, 29, r=> [Math.floor(r()*54), Math.floor(r()*70), 1, 1]), 'rgba(170,165,160,.75)') + rectsOf(seeded(2, 31, r=> [Math.floor(r()*54), Math.floor(r()*70), 1, 1]), 'rgba(255,140,60,.9)'));
// a layer: tile w x h shown at 2x (pixel scale), moved by (dx, dy) = one shown tile per loop
const flay = (cls, img, w, h)=> `.fxv-field .${cls}{position:absolute; left:${-w*2}px; top:${-h*2}px; right:${-w*2}px; bottom:${-h*2}px; background:${img} 0 0 / ${w*2}px ${h*2}px repeat; image-rendering:pixelated; will-change:transform;}`;
css('field', `.fxv-field{position:absolute; inset:0; z-index:-1; pointer-events:none; overflow:hidden; border-radius:inherit; contain:strict;}
.fxv-field > .fxv-tilt{position:absolute; inset:-12%; rotate:14deg;}
${flay('fxv-rain', T_RAIN, 48, 72)} ${flay('fxv-rain2', T_RAIN2, 40, 56)} ${flay('fxv-snow', T_SNOW, 64, 64)} ${flay('fxv-snow2', T_SNOW2, 48, 48)}
${flay('fxv-heat', T_HEAT, 56, 80)} ${flay('fxv-sand', T_SAND, 96, 40)} ${flay('fxv-sand2', T_SAND2, 72, 32)} ${flay('fxv-ash', T_ASH, 56, 72)}
.fxv-field .fxv-rain{animation:fxvFallR .42s linear infinite;} .fxv-field .fxv-rain2{animation:fxvFallR2 .7s linear infinite;}
.fxv-f-storm .fxv-rain{animation-duration:.3s;} .fxv-f-storm .fxv-rain2{animation-duration:.5s;}
@keyframes fxvFallR{to{transform:translateY(144px);}} @keyframes fxvFallR2{to{transform:translateY(112px);}}
.fxv-field .fxv-snow{animation:fxvSnow 9s linear infinite;} .fxv-field .fxv-snow2{animation:fxvSnow2 14s linear infinite;}
@keyframes fxvSnow{50%{transform:translate(10px, 64px);} to{transform:translate(0, 128px);}} @keyframes fxvSnow2{50%{transform:translate(-8px, 48px);} to{transform:translate(0, 96px);}}
.fxv-field .fxv-heat{animation:fxvRise 7s linear infinite;} @keyframes fxvRise{to{transform:translateY(-160px);}}
.fxv-field .fxv-sand{animation:fxvBlow 1.3s linear infinite;} .fxv-field .fxv-sand2{animation:fxvBlow2 2.1s linear infinite;}
@keyframes fxvBlow{to{transform:translateX(-192px);}} @keyframes fxvBlow2{to{transform:translateX(-144px);}}
.fxv-field .fxv-ash{animation:fxvAsh 11s linear infinite;} @keyframes fxvAsh{50%{transform:translate(-14px, 72px);} to{transform:translate(0, 144px);}}
.fxv-field .fxv-glow{position:absolute; inset:0;}
.fxv-f-heat .fxv-glow{background:linear-gradient(0deg, rgba(255,120,30,.16), transparent 45%), radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,230,160,.12), transparent 70%);}
.fxv-f-heat .fxv-shim{position:absolute; left:0; right:0; height:22%; top:58%; background:repeating-linear-gradient(0deg, transparent 0 5px, rgba(255,220,170,.07) 5px 7px); animation:fxvShim 3.2s ease-in-out infinite alternate; will-change:transform;}
@keyframes fxvShim{from{transform:translateY(0) scaleY(1);} to{transform:translateY(-10px) scaleY(1.12);}}
.fxv-f-frost .fxv-glow{background:radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(200,230,255,.2) 100%);}
.fxv-f-sand .fxv-glow{background:linear-gradient(90deg, rgba(220,180,110,.14), rgba(220,180,110,.04) 60%, rgba(220,180,110,.12));}
.fxv-f-ash .fxv-glow{background:linear-gradient(0deg, rgba(255,90,20,.14), transparent 40%);}
.fxv-f-storm .fxv-glow{background:linear-gradient(180deg, rgba(20,24,40,.42), transparent 40%);}
.fxv-f-storm .fxv-cloud{position:absolute; left:0; top:-6%; width:200%; height:30%; will-change:transform; animation:fxvCloud 40s linear infinite;
  background:radial-gradient(ellipse 14% 60% at 10% 40%, rgba(30,34,52,.55), transparent 70%), radial-gradient(ellipse 18% 70% at 32% 30%, rgba(26,30,46,.5), transparent 70%),
    radial-gradient(ellipse 14% 60% at 60% 40%, rgba(30,34,52,.55), transparent 70%), radial-gradient(ellipse 18% 70% at 82% 30%, rgba(26,30,46,.5), transparent 70%);}
@keyframes fxvCloud{to{transform:translateX(-50%);}}
.fxv-f-storm .fxv-flash{position:absolute; inset:0; background:#e8f0ff; opacity:0; animation:fxvFlash 11s steps(1, end) infinite; will-change:opacity;}
@keyframes fxvFlash{0%, 91%{opacity:0;} 92%{opacity:.14;} 93%{opacity:0;} 94%{opacity:.1;} 95%, 100%{opacity:0;}}
html[data-fx="low"] .fxv-field, html[data-fx="none"] .fxv-field{display:none;}
@media (prefers-reduced-motion: reduce){ .fxv-field{display:none;} }`);
const FIELD_HTML = {
  rain:  '<i class="fxv-rain2"></i><i class="fxv-rain"></i>',
  storm: '<i class="fxv-glow"></i><i class="fxv-cloud"></i><i class="fxv-tilt"><i class="fxv-rain2"></i><i class="fxv-rain"></i></i><i class="fxv-flash"></i>',
  heat:  '<i class="fxv-glow"></i><i class="fxv-shim"></i><i class="fxv-heat"></i>',
  frost: '<i class="fxv-glow"></i><i class="fxv-snow2"></i><i class="fxv-snow"></i>',
  sand:  '<i class="fxv-glow"></i><i class="fxv-sand2"></i><i class="fxv-sand"></i>',
  ash:   '<i class="fxv-glow"></i><i class="fxv-ash"></i>',
};
M.FIELD_KINDS = Object.keys(FIELD_HTML);
// fieldAmbient(host, kind): adds, swaps or clears the board's layer set (kind null clears). Returns the layer.
M.fieldAmbient = function(host, kind){
  host = host || document.getElementById('battlefieldEl'); if(!host) return null;
  let l = host.querySelector(':scope > .fxv-field'); const want = FIELD_HTML[kind] ? kind : null;
  if(l && l.dataset.kind === want) return l; if(l){ l.remove(); l = null; } if(!want) return null;
  l = document.createElement('div'); l.className = 'fxv-field fxv-f-' + want; l.dataset.kind = want; l.setAttribute('aria-hidden', 'true'); l.innerHTML = FIELD_HTML[want];
  host.insertBefore(l, host.firstChild); return l;
};
// The fight's weather: the field card in play first (engine.getField), then the fight's rules. Flood / High Tide (the standing tide),
// Thick Fog and Full Moon (FX.B.fieldLayer) and the dark (FX.B's darkness) already have their own layers. Spring Rain stays off when the
// WebGL weather already rains on this board (battleWeather kind 11).
const rulesOf = m=>{ try{ return (typeof matchFieldRules === 'function' && matchFieldRules(m)) || (m && m.rules) || {}; }catch(e){ return {}; } };
const fieldOf = m=>{ try{ const f = m && m.engine && m.engine.getField ? m.engine.getField() : null; return f ? (f.id || f) : null; }catch(e){ return null; } };
const shaderRain = ()=>{ try{ return typeof battleWeather !== 'undefined' && battleWeather && battleWeather.kindId === 11; }catch(e){ return false; } };
M.fieldKind = function(m){
  if(!m || m.over) return null; const r = rulesOf(m), f = fieldOf(m) || r.field;
  if(r.thunderstorm) return 'storm';
  if(f === 'rain' || (typeof matchIsRainy === 'function' && (()=>{ try{ return matchIsRainy(m); }catch(e){ return false; } })())) return shaderRain() ? null : 'rain';
  if(f === 'frozen' || r.freezing || r.frostbite || r.hail || r.frostCount) return 'frost';
  if(r.sandstorm) return 'sand';
  if(r.ashRain || r.volcano) return 'ash';
  if(f === 'heatwave' || (Number(r.heatLevel) || 0) > 0 || r.wildfire) return 'heat';
  return null;
};
const fieldSync = (m, env)=>{ const bf = document.getElementById('battlefieldEl'); if(!bf) return;
  M.fieldAmbient(bf, m && env.fxAtLeast('med') ? M.fieldKind(m) : null); };

// =====================================================================================================================
// 3. BOSSES
// =====================================================================================================================
// The bramble cage slams down over a caged leader: the card's own bars drop (a stand-in set where it has none), two thorny vines coil up
// the sides, a padlock pops, dust (700 ms)
css('cage', `.fxv-bars{border-top:4px solid #4a3220; border-bottom:4px solid #4a3220; box-sizing:border-box; image-rendering:pixelated;
  background:repeating-linear-gradient(90deg, transparent 0 9%, #3a2614 9% 13%, #7a5432 13% 15%, transparent 15% 20%);}`);
M.cageClose = function(card, o){
  o = o || {}; if(!card || RM()) return Promise.resolve(); const c = centre(tileOf(card)); if(!c.w) return Promise.resolve();
  const px = pxFor(c.w), sp = speedOf(o), ps = [], own = card.querySelector && card.querySelector('.cage-bars');
  const bars = own || layer('fxv-box fxv-bars'); if(!own) Object.assign(bars.style, {left:(c.r.left) + 'px', top:(c.r.top) + 'px', width:c.w + 'px', height:c.h + 'px'});
  ps.push(play(bars, [{translate:`0 ${-c.h*1.1}px`, opacity:1}, {translate:'0 0', opacity:1, offset:.32}, {translate:`0 ${-c.h*.05}px`, opacity:1, offset:.4},
    {translate:'0 0', opacity:1, offset:.5}, {translate:'0 0', opacity:1, offset:own ? 1 : .85}].concat(own ? [] : [{translate:'0 0', opacity:0}]), 720/sp, {ease:steps(10), keep:!!own}));
  later(()=> snd('cageSlam'), 200/sp);
  const lk = pix('lock', c.x, c.y - c.h*.05, px + 1);
  ps.push(play(lk, [{transform:'scale(0)', opacity:0}, {transform:'scale(1.3)', opacity:1, offset:.35}, {transform:'scale(1)', opacity:1, offset:.7}, {transform:'scale(1)', opacity:0}], 460/sp, {ease:steps(5), delay:260/sp}));
  if(!lowOf(o)){
    [-1, 1].forEach(s=>{ const v = pix('vine', c.x + s*c.w*.46, c.y + c.h*.1, px, s > 0 ? 'scale:-1 1;' : '');
      ps.push(play(v, [{transform:'scaleY(0)', opacity:1}, {transform:'scaleY(1)', opacity:1, offset:.5}, {transform:'scaleY(1)', opacity:1, offset:.85}, {transform:'scaleY(1)', opacity:0}], 520/sp, {ease:steps(6), delay:240/sp})); });
    for(let i = 0; i < 5; i++){ const s = i % 2 ? 1 : -1, e = pix('dust', c.x + s*c.w*.2, c.r.bottom - 2, px);
      ps.push(play(e, [{transform:'translate(0,0) scale(.6)', opacity:.9}, {transform:`translate(${s*c.w*(.25 + i*.06)}px, ${-c.h*.06}px) scale(1.3)`, opacity:0}], 340/sp, {ease:steps(4), delay:230/sp})); }
  }
  return all(ps);
};
// A skeleton boss: bones fly in from around the anchor and lock under a skull that drops in, dust, the eyes light (1.6 s)
M.skeletonRise = function(anchor, o){
  o = o || {}; if(!anchor || RM()) return Promise.resolve(); const c = centre(tileOf(anchor)); if(!c.w) return Promise.resolve();
  const px = Math.max(3, pxFor(c.w) + 1), sp = speedOf(o), ps = [], cy = c.y + c.h*.05;
  snd('boneClatter');
  if(!lowOf(o)){ const spots = [[-1, .1, 30], [1, .1, -30], [-1, .45, 60], [1, .45, -60], [0, .32, 90], [0, .62, 90]];
    spots.forEach(([sx, sy, rot], i)=>{ const tx = c.x + sx*sprite('bone', px).w*.55, ty = cy + sy*c.h*.5, a = rnd(0, Math.PI*2), R = Math.max(c.w, 90)*1.4, e = pix('bone', tx, ty, px, `rotate:${rot}deg;`);
      ps.push(play(e, [{transform:`translate(${Math.cos(a)*R}px, ${Math.sin(a)*R}px) rotate(${rnd(-300, 300)}deg)`, opacity:0}, {opacity:1, offset:.15},
        {transform:'translate(0,0) rotate(0deg)', opacity:1, offset:.45}, {transform:'translate(0,0) rotate(0deg)', opacity:1, offset:.85}, {transform:'translate(0, 4px)', opacity:0}], 1500/sp, {ease:steps(14), delay:(i*60)/sp})); }); }
  const sk = pix('skull', c.x, cy - c.h*.08, px + 1);
  ps.push(play(sk, [{transform:`translateY(${-c.h*.9}px)`, opacity:0}, {transform:`translateY(${-c.h*.9}px)`, opacity:1, offset:.35}, {transform:'translateY(0)', opacity:1, offset:.5},
    {transform:'translateY(-4px)', opacity:1, offset:.55}, {transform:'translateY(0)', opacity:1, offset:.6}, {transform:'translateY(0)', opacity:1, offset:.88}, {transform:'translateY(0)', opacity:0}], 1600/sp, {ease:steps(16)}));
  const ey = pix('eyes', c.x, cy - c.h*.08 - sprite('skull', px + 1).h*.5 + 3.5*(px + 1), px + 1);
  ps.push(play(ey, [{opacity:0}, {opacity:0, offset:.58}, {opacity:1, offset:.62}, {opacity:.4, offset:.72}, {opacity:1, offset:.8}, {opacity:0}], 1600/sp, {ease:steps(10)}));
  for(let i = 0; i < 6; i++){ const s = i % 2 ? 1 : -1, e = pix('dust', c.x + s*12, cy + c.h*.42, px);
    ps.push(play(e, [{transform:'translate(0,0) scale(.6)', opacity:0}, {transform:'translate(0,0) scale(.6)', opacity:.9, offset:.5}, {transform:`translate(${s*(30 + i*12)}px, -8px) scale(1.6)`, opacity:0}], 1100/sp, {ease:steps(8), delay:240/sp})); }
  return all(ps);
};
// A mage boss: eight runes turn in a ring round the anchor, the ring tightens as it charges, then bursts outward (1.4 s)
css('mage', `.fxv-runes{position:fixed; width:0; height:0; will-change:transform, opacity;} .fxv-runes > .fxv-px{position:absolute;}`);
M.mageCast = function(anchor, o){
  o = o || {}; if(!anchor || RM()) return Promise.resolve(); const c = centre(tileOf(anchor)); if(!c.w) return Promise.resolve();
  const px = Math.max(3, pxFor(c.w)), sp = speedOf(o), R = Math.max(c.w, c.h)*.62, ps = [];
  snd('runeHum');
  const ring = layer('fxv-runes'); Object.assign(ring.style, {left:c.x + 'px', top:c.y + 'px'});
  for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2, s = sprite('rune' + (1 + i % 4), px), e = document.createElement('i');
    e.className = 'fxv-px'; e.style.cssText = `width:${px}px; height:${px}px; box-shadow:${s.sh}; left:${(Math.cos(a)*R - s.w/2 - px).toFixed(1)}px; top:${(Math.sin(a)*R - s.h/2 - px).toFixed(1)}px;`; ring.appendChild(e); }
  ps.push(play(ring, [{transform:'rotate(0deg) scale(.3)', opacity:0}, {transform:'rotate(90deg) scale(1)', opacity:1, offset:.25}, {transform:'rotate(300deg) scale(.55)', opacity:1, offset:.7},
    {transform:'rotate(330deg) scale(1.9)', opacity:0}], 1400/sp, {ease:steps(18)}));
  const orb = pix('orb', c.x, c.y, px + 1);
  ps.push(play(orb, [{transform:'scale(0)', opacity:0}, {transform:'scale(.8)', opacity:1, offset:.3}, {transform:'scale(1.6)', opacity:1, offset:.68}, {transform:'scale(3)', opacity:0}], 1400/sp, {ease:steps(14)}));
  if(!lowOf(o)){ const burst = pix('ring', c.x, c.y, px + 1);
    ps.push(play(burst, [{transform:'scale(.5)', opacity:0}, {transform:'scale(.5)', opacity:1, offset:.68}, {transform:'scale(4)', opacity:0}], 1400/sp, {ease:steps(14)})); }
  return all(ps);
};
// A sea boss: the water line rises over the bottom of the board and waves roll down each lane, then it ebbs (1.8 s)
css('sea', `.fxv-water{border-radius:0 0 12px 12px; image-rendering:pixelated;
  background:${tile(32, 8, rectsOf([[0, 4, 32, 4], [2, 3, 6, 1], [12, 2, 8, 2], [24, 3, 6, 1]], 'rgba(120,200,255,.75)') + rectsOf([[13, 2, 6, 1], [3, 3, 4, 1]], 'rgba(255,255,255,.9)'))} 0 0 / 64px 16px repeat-x,
    linear-gradient(180deg, transparent 0 14px, rgba(50,130,210,.55) 14px, rgba(20,70,150,.72));}`);
M.seaRise = function(host, o){
  o = o || {}; host = host || document.getElementById('battlefieldEl'); if(!host || RM()) return Promise.resolve();
  const r = host.getBoundingClientRect(); if(!r.width) return Promise.resolve(); const sp = speedOf(o), ps = [], h = Math.round(r.height*.34);
  snd('seaSurge');
  const w = layer('fxv-box fxv-water'); Object.assign(w.style, {left:r.left + 'px', top:(r.bottom - h) + 'px', width:r.width + 'px', height:h + 'px'});
  ps.push(play(w, [{transform:`translateY(${h}px)`}, {transform:'translateY(0)', offset:.35}, {transform:`translateY(${h*.12}px)`, offset:.5}, {transform:'translateY(0)', offset:.65}, {transform:`translateY(${h}px)`}], 1800/sp, {ease:steps(18)}));
  if(!lowOf(o)){ const px = pxFor(r.width/5);
    [.17, .5, .83].forEach((fx, i)=>{ const e = pix('wave', r.left + r.width*fx, r.top + 10, px + 1);
      ps.push(play(e, [{transform:'translateY(0) scale(.6)', opacity:0}, {transform:`translateY(${r.height*.2}px) scale(1)`, opacity:1, offset:.2}, {transform:`translateY(${r.height*.85}px) scale(1.3)`, opacity:0}], 1100/sp, {ease:steps(12), delay:(250 + i*140)/sp})); }); }
  return all(ps);
};
// Which boss look a fight gets, from its name / id / icon. The Kelp Witch is a mage; a sea name or a raid in the Abyss is the sea.
const BONE = /\b(bone|skelet|ossu|lich|ghoul|grave|crypt|undead|wraith|revenant|barrow|skull)/i, MAGE = /\b(witch|mage|shaman|sage|oracle|sorcer|wizard|seer|druid|hex|rune|warlock|mystic)/i,
  SEA = /\b(drown|tide|sea|kelp|reef|abyss|kraken|leviathan|whale|orca|squid|octop|coral|goliath|ocean|brine)/i;
M.bossKind = function(o){ if(!o) return null; const t = [o.name, o.id, o.icon].filter(Boolean).join(' ');
  return BONE.test(t) ? 'skeleton' : MAGE.test(t) ? 'mage' : SEA.test(t) ? 'sea' : null; };
M.bossLook = function(kind, o){ o = o || {}; const castle = (()=>{ try{ return typeof hqTileEl === 'function' ? hqTileEl('B') : null; }catch(e){ return null; } })(), bf = document.getElementById('battlefieldEl');
  if(kind === 'skeleton') return M.skeletonRise(castle || bf, o); if(kind === 'mage') return M.mageCast(castle || bf, o); if(kind === 'sea') return M.seaRise(bf, o); return Promise.resolve(); };

// =====================================================================================================================
// 4. WIRING (docs/effects-lab-contract.md section 2): battle events and the named hooks
// =====================================================================================================================
const isMine = side=>{ try{ return typeof matchState !== 'undefined' && matchState && matchState.sideOf ? side === matchState.sideOf(1) : side === 'A'; }catch(e){ return side === 'A'; } };
const boardCards = ()=> [...document.querySelectorAll('#battlefieldEl .board-card[data-defid]')];
M.onEvent = function(ev, env){
  if(!ev || !env || !env.fxAtLeast('low')) return;
  const T = ev.type, el = env.el, o = {level:env.level, speed:Math.max(1, (env.match && env.match.speedMult) || 1)};
  if(T === 'hit' || T === 'evaded'){
    const af = env.fxOf(ev.attDefId);
    if(af.swift && !ev.ranged && ev.attUid != null && env.once('fxv-swift' + ev.attUid)){ const a = el(ev.attUid); if(a) M.swiftDash(a, Object.assign({up:isMine(ev.side)}, o)); }
    if(T !== 'hit' || ev.targetUid == null) return;
    if(af.mighty && (ev.dmg || 0) > 0 && env.once('fxv-mighty' + ev.attUid)){ const t = el(ev.targetUid); if(t) env.at(env.hitAtMs(ev), ()=>{ if(t.isConnected) M.mightySlam(t, o); }); }
    else if((ev.mods || []).includes('sturdy') && env.once('fxv-sturdy' + ev.targetUid)){ const t = el(ev.targetUid); if(t) env.at(env.hitAtMs(ev), ()=>{ if(t.isConnected) M.sturdyBrace(t, o); }); }
    return; }
  if(T === 'tide' && !ev.moonpull && env.once('fxv-tide')){
    const defs = env.defs || {}, carriers = boardCards().filter(c=>{ const e = (defs[c.getAttribute('data-defid')] || {}).effects || {}; return e.tide || e.tideGrant; }).slice(0, 6);
    if(carriers.length){ env.at(380, ()=> snd('tideLap')); carriers.forEach((c, i)=> env.at(400 + i*70, ()=>{ if(c.isConnected) M.tideCrest(c, Object.assign({kind:ev.tide}, o)); })); }
    return; }
  if(T === 'evolve' && ev.stem && ((ev.stem.attack || 0) > 0 || (ev.stem.health || 0) > 0)){ env.at(120, ()=>{ const t = el(ev.uid); if(t){ snd('shellCrack'); M.hatchPop(t, o); } }); return; }
  if(T === 'frenzy' && ev.twin){ const a = el(ev.attUid); if(a) M.twinSlash(a, o); return; }
  if(T === 'statusFx'){
    if(ev.kind === 'reachAim'){ const t = el(ev.targetUid); if(t){ snd('reachCreak'); M.reachArc(el(ev.attUid), t, o); } }
    else if(ev.kind === 'sk2Berry'){ const t = el(ev.attUid); if(t){ snd('berryPlip'); M.berryPop(t, Object.assign({total:ev.total}, o)); } }
    else if(ev.kind === 'sk2BerryEat'){ const t = el(ev.attUid); if(t){ snd('berryMunch'); M.berryEat(t, el(ev.targetUid), o); } }
  }
};
// The weather layer follows every fight render (FX.B's darkness and field layers ride the same hooks); gone on the results.
M.hooks.matchUI = (m, env)=> fieldSync(m, env);
const CAGED = new WeakSet();
M.hooks.boardRendered = (m, env)=>{
  fieldSync(m, env);
  // the Caged Fight: the cage is placed before the fight (no replayed event), so its slam plays the first time it is on screen
  if(m && m.caged && !CAGED.has(m) && !document.querySelector('.vs-screen')){
    const cages = [...document.querySelectorAll('#battlefieldEl .board-card .cage-bars')].map(b=> b.closest('.board-card')).filter(Boolean);
    if(cages.length){ CAGED.add(m); later(()=> cages.forEach((c, i)=> later(()=>{ if(c.isConnected) M.cageClose(c, {level:env.level}); }, i*180)), 350); }
  }
};
M.hooks.resultsShown = ()=> M.fieldAmbient(document.getElementById('battlefieldEl'), null);
// bossEntrance (arena_app.js) as a boss's versus opener closes; the raid's opener (startRaidFullBattle) for a raid part
M.hooks.bossEntrance = (node, lair, env)=>{ const k = M.bossKind(node); if(k) later(()=> M.bossLook(k, {level:env.level}), 300); };
M.hooks.raidEntrance = (def, env)=>{ let k = M.bossKind(def);
  if(!k) try{ if(typeof raidGroundOf === 'function' && typeof matchState !== 'undefined' && raidGroundOf(matchState) === 'mabyss') k = 'sea'; }catch(e){}
  if(k) M.bossLook(k, {level:env.level}); };
})(typeof window !== 'undefined' ? window : globalThis);
