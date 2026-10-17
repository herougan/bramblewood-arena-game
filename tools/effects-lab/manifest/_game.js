// 2026-10-17 (effects lab, user: "continue, build out the effects lab too."): a small stand-in for the game around the stage, so the
// lab can play the game's own effect functions (field2Vfx, s17SkillVfx, devilPayVfx, skills2Vfx, killMarkVfx, triggerFiredVfx,
// enemyPitchSlotFx, the sky's skyStepApply / skyPhaseLayers …, copied from arena_app.js into .fxcat/fx-src.js by sync_fx_src.py; the
// list is tools/effects-lab/fx-src-extra.txt) by handing them the same events a fight replays. Loaded before every other manifest.
//   LabGame.match(ctx, extra)   a fresh stand-in matchState for this play (cleared when the next play starts)
//   LabGame.uid(el)             the stage card's data-uid (what boardCardEl(uid) finds again)
//   LabGame.fire(fn, ev)        run one of the game's vfx functions on an event, guarded
//   LabGame.badge(el, html)     add a chip to a card's skill strip (.badges), as abilityBadges draws it
//   LabGame.pill(ctx, side, n)  a Lumber pill in that side's field resources (#hudLumberPill / #hudLumberPillEnemy)
//   LabGame.envCard(ctx, key)   an Environment card for a FIELD2 key in place of the stage's field card
//   LabGame.lunge(el, mine)     animateAttacker's lunge (the wind-up, strike and settle)
// Shims for game helpers the copied functions call that the lab doesn't carry (each only when missing):
(function(W){
'use strict';
const def = (k, v)=>{ if(typeof W[k] !== 'function') W[k] = v; };
def('boardCardEl', uid=> document.querySelector(`.fxl-stage .board-card[data-uid="${uid}"]`) || document.querySelector(`.board-card[data-uid="${uid}"]`));
def('hqTileEl', side=> document.querySelector(`.fxl-stage [data-hq="${side}"]`) || document.querySelector(`[data-hq="${side}"]`));
def('fightSafe', (fn)=>{ try{ return fn(); }catch(e){ return null; } });
def('pullKillTrigger', ()=>{});
def('matchFieldRules', m=> (m && m._rules) || {});
def('renderBoard', ()=>{}); def('renderHand', ()=>{}); def('updateHqHpDisplay', ()=>{}); def('displayHqDamage', ()=>{});
def('updateCardHpDisplay', ()=>{}); def('updateCardStatusDisplay', ()=>{}); def('updateCardAtkDisplay', ()=>{}); def('updateCardWaitDisplay', ()=>{});
def('shakeEl', el=>{ if(!el || typeof gsap === 'undefined') return; const t = el.querySelector('.card-tile') || el; gsap.timeline().to(t, {x:-5, duration:.05}).to(t, {x:5, duration:.07}).to(t, {x:0, duration:.05, clearProps:'x'}); });
def('tintPulse', (el, cls)=>{ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=> el.classList.remove(cls), 700); });
// 2026-10-16 card backs: drawFlipVfx (and FX.C / FX.D) ask for a back's classes (cardBackClass / bwCardBackClass in arena_app.js)
const KINDS = ['unit', 'structure', 'castle', 'field'];
def('cardBackClass', d=> 'bw-back bk-' + (KINDS.includes(d) ? d : (d && d.isCastle) ? 'castle' : (d && d.field) ? 'field' : 'unit'));
def('bwCardBackClass', W.cardBackClass);
if(typeof W.floatDetachDepth === 'undefined') W.floatDetachDepth = 0;
// the sky's ease state (arena_app.js keeps these as lets beside syncSkyFx)
if(typeof W.skyStepEase === 'undefined') W.skyStepEase = null;
if(typeof W.skyPhaseEase === 'undefined') W.skyPhaseEase = null;

const LabGame = {
  match(ctx, extra){
    const m = Object.assign({replayCards:{}, replayRows:null, round:3, speedMult:1, mode:'conquest', over:false, engine:{turnNo:()=> 3}, players:{1:{hand:[]}, 2:{hand:[]}}, _rules:{}}, extra || {});
    W.matchState = m; return m; },
  uid(el){ if(!el) return null; const b = el.closest ? (el.closest('[data-uid]') || el.querySelector('[data-uid]')) : null; return b ? b.getAttribute('data-uid') : null; },
  fire(fn, ev){ const f = typeof fn === 'string' ? W[fn] : fn; if(typeof f !== 'function'){ console.warn('[LabGame] missing game function', fn); return; }
    try{ return f(ev); }catch(e){ console.error('[LabGame] ' + (f.name || fn) + ' threw', e); } },
  badge(el, html){ const t = el && (el.querySelector('.card-tile') || el); if(!t) return null;
    let b = t.querySelector('.badges'); if(!b){ b = document.createElement('div'); b.className = 'badges badge-slots'; t.appendChild(b); }
    const s = document.createElement('span'); s.className = 'abadge'; s.innerHTML = html; b.appendChild(s); return s; },
  chip(key, glyph, n){ return `<span class="ab-sk" data-sk="${key}"><span class="ico ico-${key}" data-ik="${key}">${glyph}</span>${n != null && n !== 1 ? n : ''}</span>`; },
  trig(on, lead, act){ return `<span class="ab-trig" data-hook="${on}"><i class="ab-bolt">${lead}</i><i class="ab-arrow">→</i>${act}</span>`; },
  pill(ctx, side, n){ const box = ctx.root.querySelector(side === 'B' ? '#fieldResEnemy' : '#fieldResMine'); if(!box) return null;
    const id = 'hudLumberPill' + (side === 'B' ? 'Enemy' : ''); let p = box.querySelector('#' + id);
    if(!p){ p = document.createElement('span'); p.className = 'hud-pill lumber'; p.id = id; box.appendChild(p); }
    p.innerHTML = `<span class="ico ico-lumber" data-ik="lumber">🪵</span> ${n}`; return p; },
  envCard(ctx, key, opts){ opts = opts || {}; const F2 = (typeof FIELD2 !== 'undefined' && FIELD2) || {} /* a top-level const in fx-src, not a window property */, f = F2[key] || {icon:opts.icon || '🌿', name:opts.name || key, short:opts.short || '', editor:key};
    const old = ctx.board && ctx.board.field; if(!old) return null;
    const art = opts.art ? `<img class="card-art-img" src="assets/fields/${opts.art}.png" alt="" draggable="false">` : '';
    const c = document.createElement('div');
    c.className = `card-tile fr-field is-field rarity-tier-low ${art ? 'art-framed' : 'no-art'} match-field-tile field-cond env-card biome-${opts.biome || 'ash'} has-new`;
    c.setAttribute('style', old.getAttribute('style') || '');
    c.innerHTML = `<div class="ico">${art || f.icon}</div><div class="rarity-band"></div><i class="cframe" aria-hidden="true"></i><div class="nm">${opts.name || f.name}</div>`
      + `<div class="stats field-stats"><span class="fld">🌿 <span class="fl-w">Environment</span></span></div><div class="env-line">${opts.short || f.short}</div><div class="env-ribbon" aria-hidden="true">Environment</div>`;
    old.replaceWith(c); ctx.board.field = c; return c; },
  lunge(el, mine){ const t = el && (el.querySelector('.card-tile') || el); if(!t || typeof gsap === 'undefined') return; const d = mine ? -1 : 1;
    gsap.timeline().to(t, {y:-d*9, scale:.95, duration:.39, ease:'power2.in'}).to(t, {y:d*15, scale:1.06, duration:.31, ease:'back.out(3)'}).to(t, {y:0, scale:1, duration:.26, ease:'power2.out', clearProps:'transform'}); },
};
W.LabGame = LabGame;
// A play starts on a fresh stage: drop the last play's stand-in match (the next play makes its own).
if(W.FXLAB) FXLAB.on(type=>{ if(type === 'start'){ W.matchState = null; W.skyStepEase = null; W.skyPhaseEase = null; try{ document.documentElement.classList.remove('bw-upkeep'); }catch(e){} } });
})(window);
