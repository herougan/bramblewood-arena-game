/* ============================================================
   Bramblewood FX, batch A (2026-10-15): combat-attack, combat-skill
   One of six effect modules (bramblewood-fx-a.js … bramblewood-fx-f.js) that share one contract:
   docs/effects-lab-contract.md. Loaded by the game (assemble_arena.py bundles it after procfx/unitfx)
   and by the Effects Lab (tools/effects-lab/build.py), so the lab plays exactly the game's code.

   Rules in short
   - Every effect is a function on window.FX.A: FX.A.someEffect(el, opts); variants are FX.A.someEffect_B, _C.
     It animates the elements it is given and nothing else; it never reads matchState and never blocks:
     return a Promise (or nothing) and call opts.onImpact / opts.onDone when given.
   - New CSS goes through css(key, text) below (one <style id="fx-a-style">, each key added once), never into
     arena_template.html. Prefix classes and keyframes with fxa- so batches can't collide.
   - Gating (reducedMotion, the Effects level) happens at the hook, not here: see FX.A.onEvent / FX.A.hooks.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const FX = root.FX = root.FX || {};
const M = FX.A = FX.A || {};
const TAG = 'a';

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
M.hooks = M.hooks || {};

// ---- effects ----
// (batch A adds its functions here: M.someEffect = function(el, opts){ ... }; M.someEffect_B = ...)

})(typeof window !== 'undefined' ? window : globalThis);
