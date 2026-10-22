/* ============================================================
   Effects Lab, package LAB2 (2026-10-21): the shared engine for the "Built 10-21" and "Ideas 10-21" tabs, and the sticky field on every tab.
   Owner: "Update the effects lab with all the new effects ... For all tabs of the effects lab, please make the 'field' sticky to the top!
   So I can always see the field when clicking on a skill."

   What is here
   - LAB2.mount(cfg): one tab in the FX-WAR mould: a sticky stage (the "field"), filter chips, entries with variants, and an
     "In game: <where>" or "Lab only (not used yet)" badge on every entry. The entries are in fxlab-built.js and fxlab-ideas.js.
   - The field: a small battlefield (two rows of three cards, the enemy's with a bramble) whose cards are real `.board-card[data-uid]`
     wrappers around the game's own tile markup, so the game's code (trCrownVfx, trTransformVfx, ribbonShieldSync, bxDropStone ...,
     copied from arena_app.js into fx-src.js by tools/effects-lab/sync_fx_src.py) finds its cards with boardCardEl(uid), as in a fight.
   - Shims for the few game helpers that copied code calls and the Lab does not carry (getCardDefs, cardTileHTML, RaidM ...).
   - The sticky field on the older tabs (initSticky): the Skills arena and the Battlefield box are pinned; on a tab whose demos each sit in
     their own tile (Procedural FX, Card ideas, Cards, Combat, Screens, Damage numbers), the stage of the tile you press a button in
     moves up into a pinned bar, and goes back when you press in another tile or leave the tab.
   ============================================================ */
(function(){
'use strict';
const W = window;
const $ = (s, r)=> (r || document).querySelector(s), $$ = (s, r)=> [...(r || document).querySelectorAll(s)];
const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const badge = (inGame, where)=> (W.FXLAB_BADGE ? W.FXLAB_BADGE(inGame, where) : (inGame ? `<span class="ig is-game"><b>In game:</b> ${esc(where)}</span>` : '<span class="ig is-lab"><b>Lab only</b> (not used yet)</span>'));
const FIX = ()=> W.FXLAB_FIXTURES || {};
const TILES = ()=> FIX().tiles || {};
const reduce = ()=> !!(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const sleep = ms=> new Promise(res=> setTimeout(res, ms));

// ---------------------------------------------------------------- shims (only where the Lab lacks them)
const def = (k, v)=>{ if(typeof W[k] === 'undefined') W[k] = v; };
// The game's card table: the Lab plays with a tiny stand-in (the hatch reveal and the Crown's Kingly line ask for one card).
const DEFS = {'lab-hatchling':{id:'lab-hatchling', name:'Lab Hatchling', rarity:'rare', icon:'🐣', cardType:'unit', attack:2, health:4, effects:{}}};
W.getCardDefs = ()=> DEFS; // (manifest/c.js made an empty one first: this one holds the few stand-in cards the Built tab needs)
def('forgeCentreBusy', false);
// the Effects level (the Lab always plays at High, Low under reduced motion) and style: fxLevel() / fxAtLeast() / forgeCentreStage read these
def('fxLevelSetting', ()=> reduce() ? 'low' : 'high');
def('fxStyle', ()=> 'classic');
// 2026-10-22 (package CB): the game's own effect functions (positionBeamVfx ...) ask these; the Lab did not carry them, so a call threw a ReferenceError
def('hasGsap', ()=> typeof W.gsap !== 'undefined');
def('reducedMotion', ()=> reduce());
def('fxLevel', ()=> W.fxLevelSetting());
def('fxAtLeast', l=> ['none', 'low', 'med', 'high'].indexOf(W.fxLevelSetting()) >= ['none', 'low', 'med', 'high'].indexOf(l));
// the hatch reveal asks whether the card is a Level 0 hatchling (the Nest's list); the Lab's stand-in rare card is one
def('hatchlingIds', ()=> new Set(['lab-hatchling']));
// the Crown badge's tooltip names the Kingly skills (grantText reads the passive table; the Lab shows the keys)
def('PASSIVE_DEFS', []);
def('RARITY_DEFS', [{key:'common', label:'Common', color:'#c9c4b6'}, {key:'uncommon', label:'Uncommon', color:'#6fcf6f'}, {key:'rare', label:'Rare', color:'#6fb0ff'}]);
// The hatch reveal draws the new card with the game's cardTileHTML; the Lab's stand-in returns a real tile from the fixtures.
def('cardTileHTML', (d)=>{ const t = (TILES().rare || TILES().common || {html:''}).html; return t.replace(/(<div class="nm">)[^<]*/, '$1' + esc((d && d.name) || 'Lab Hatchling')); });
// the raid module (bramblewood-raid.js, loaded by the Lab): the total-rank badge reads it as RaidM
if(!W.RaidM && W.BramblewoodRaid) W.RaidM = W.BramblewoodRaid;

// ---------------------------------------------------------------- the field (a small battlefield the game's code can find its cards on)
const FOE = [['uncommon', 9101, 'bee-knight'], ['castle', 9100, 'castle'], ['flyer', 9102, 'crimson-wing-recruit']];
const MINE = [['common', 9103, 'otter-centurion'], ['rare', 9104, 'cobalt-talon'], ['epic', 9105, 'crimson-wing']];
function tileHTML(kind){ const t = TILES()[kind] || TILES().common || {html:''}; return t.html; }
function wrapHTML(kind, uid, defId){
  let h = tileHTML(kind); if(kind === 'castle') h = h.replace('data-hq="preview"', 'data-hq="B"');
  return `<div class="board-card" data-uid="${uid}" data-defid="${defId}" data-kind="${kind}">${h}</div>`;
}
function fieldHTML(mode){
  const bars = mode === 'bars';
  return `${bars ? '<div class="bf-hp bf-hp-enemy" data-hpribbon="B"><span class="bf-hp-track"><span class="bf-hp-fill" style="width:100%"></span></span><span class="bf-hp-num">40<small>/40</small></span></div>' : ''}
    <div class="sk-row sk-enemy">${FOE.map(([k, u, d])=> wrapHTML(k, u, d)).join('')}</div>
    <div class="sk-row sk-mine">${MINE.map(([k, u, d])=> wrapHTML(k, u, d)).join('')}</div>
    ${bars ? '<div class="bf-hp bf-hp-mine" data-hpribbon="A"><span class="bf-hp-track"><span class="bf-hp-fill" style="width:100%"></span></span><span class="bf-hp-num">40<small>/40</small></span></div>' : ''}`;
}
function fieldCtx(arena){
  const rows = $$('.sk-row', arena), rf = rows[0], rm = rows[1];
  const foeW = rf ? $$('.board-card', rf).filter(w=> !w.querySelector('.is-castle')) : [], mineW = rm ? $$('.board-card', rm) : [];
  const castleW = rf ? $$('.board-card', rf).find(w=> w.querySelector('.is-castle')) : null;
  const T = w=> w && w.querySelector('.card-tile');
  const c = {arena, rowFoe:rf, rowMine:rm, foeW, mineW, castleW, foe:foeW.map(T), mine:mineW.map(T), castle:T(castleW)};
  c.all = [...c.foe, ...c.mine];
  c.uid = w=> { const b = w && (w.closest ? w.closest('.board-card') : null); return b ? Number(b.getAttribute('data-uid')) : null; };
  c.wrap = t=> t && t.closest && t.closest('.board-card');
  return c;
}

// ---------------------------------------------------------------- one tab
const TABS = {};
let BASELINE = null;
const baseline = ()=>{ if(!BASELINE) BASELINE = new Set(document.body.children); return BASELINE; };
function clearBody(){
  const base = baseline(), g = W.gsap;
  [...document.body.children].forEach(c=>{ if(!base.has(c) && !c.hasAttribute('data-fxl-keep')){ try{ if(g) g.killTweensOf(c); }catch(e){} c.remove(); } });
}
function mount(cfg){
  const sec = document.getElementById(cfg.id); if(!sec) return null;
  const id = cfg.id, S = s=> `#${id}${s}`;
  const groups = cfg.groups || [], byG = new Map(groups.map(g=> [g.key, g]));
  sec.innerHTML = `<h2>${cfg.title} <span class="st ${cfg.pill[0]}" style="vertical-align:middle">${esc(cfg.pill[1])}</span></h2>
    <p class="sec-sub">${cfg.sub}</p>
    <div class="war-layout lab2-layout">
      <aside class="war-dock lab2-dock" id="${id}Dock" aria-label="Stage">
        <div class="war-now" id="${id}Now" aria-live="polite">Press ▶ on any effect.</div>
        <div class="skill-arena war-arena lab2-arena" id="${id}Arena"></div>
        <div class="fxl-speed">Speed <button type="button" data-lspeed="1" aria-pressed="true">1×</button><button type="button" data-lspeed="0.5" aria-pressed="false">0.5×</button><button type="button" data-lspeed="0.25" aria-pressed="false">0.25×</button><button type="button" class="lab2-again" id="${id}Replay">↻ Replay</button></div>
      </aside>
      <div class="war-left">
        <div class="war-tools" role="group" aria-label="Show" id="${id}Chips"><button type="button" data-chip="all" aria-pressed="true">All</button>${cfg.chips.map(c=> `<button type="button" data-chip="${esc(c[0])}" aria-pressed="false">${esc(c[1])}</button>`).join('')}<span class="lab2-shown" id="${id}Shown"></span></div>
        <div id="${id}List"></div>
      </div>
    </div>`;
  const arena = $(S('Arena')), now = $(S('Now')), list = $(S('List')), dock = $(S('Dock'));
  const tab = TABS[id] = {cfg, arena, now, list, dock, token:0, last:null, mode:'units', speed:1};
  const setMode = m=>{ tab.mode = m; arena.classList.remove('lab2-gal'); arena.classList.toggle('battlefield', m === 'bars'); arena.classList.toggle('lab2-bars', m === 'bars'); arena.innerHTML = fieldHTML(m); try{ decorate(arena); }catch(e){} };
  setMode('units');

  const card = e=>{
    const inGame = !!e.where, g = byG.get(e.group) || {};
    return `<article class="fx war-fx" data-id="${esc(e.id)}" data-group="${esc(e.group)}" data-ig="${inGame ? 1 : 0}">
      <h3><span>${esc(e.name)}</span>${g.tag ? `<span class="war-tag is-${esc(g.tone || 'war')}">${esc(g.tag)}</span>` : ''}</h3>
      <div class="ig-row">${badge(inGame, e.where)}</div>
      ${e.note ? `<p>${esc(e.note)}</p>` : ''}${e.sig ? `<code class="war-sig">${esc(e.sig)}</code>` : ''}
      <div class="btns war-btns">${e.v.map((v, i)=> `<button type="button" class="btn small${i ? '' : ' primary'}" data-play="${esc(e.id)}" data-v="${i}" aria-label="Play ${esc(e.name)}: ${esc(v[0])}">▶ ${esc(v[0])}</button>`).join('')}</div></article>`;
  };
  const byId = new Map(cfg.entries.map(e=> [e.id, e]));
  list.innerHTML = groups.map(g=>{
    const es = cfg.entries.filter(e=> e.group === g.key); if(!es.length) return '';
    return `<h3 class="war-h" data-gh="${esc(g.key)}">${esc(g.title)} <span class="war-n">${es.length}</span>${g.sub ? `<span class="war-hsub">${esc(g.sub)}</span>` : ''}</h3><div class="war-grid" data-gg="${esc(g.key)}">${es.map(card).join('')}</div>`;
  }).join('');

  const clearAll = ()=>{
    try{ if(W.WarFX) W.WarFX.clear(); }catch(e){} try{ if(W.IdeasFX) W.IdeasFX.clear(); }catch(e){}
    const g = W.gsap; try{ if(g) g.killTweensOf($$('.card-tile, .board-card, .sk-row', arena)); }catch(e){}
    arena.style.transform = ''; clearBody(); W.matchState = null; W.forgeCentreBusy = false;
    try{ document.documentElement.classList.remove('bw-upkeep'); document.body.classList.remove('bw-evo-holding'); }catch(e){}
    setMode(tab.mode0 || 'units');
  };
  tab.clear = clearAll;
  const makeCtx = e=>{
    const c = fieldCtx(arena);
    c.tab = tab; c.reduced = reduce();
    c.match = extra=> (W.LabGame ? W.LabGame.match(c, extra) : (W.matchState = Object.assign({replayCards:{}, round:3, speedMult:1, mode:'conquest', over:false, players:{1:{hand:[]}, 2:{hand:[]}}}, extra || {})));
    c.wait = ms=> sleep(ms / (tab.speed || 1));
    c.arenaHTML = html=>{ arena.innerHTML = html; return arena; };
    c.reset = ()=> clearAll();
    return c;
  };
  async function play(eid, vi){
    const e = byId.get(eid); if(!e) return; const v = e.v[vi || 0]; if(!v) return;
    const my = ++tab.token; tab.last = [eid, vi || 0];
    tab.mode0 = e.stage === 'bars' ? 'bars' : 'units';
    clearAll();
    now.innerHTML = `<b>${esc(e.name)}</b> · ${esc(v[0])}<span>${e.sig ? esc(e.sig) : esc(e.where ? 'In game: ' + e.where : 'Lab only')}</span>`;
    $$('[data-play].is-playing', list).forEach(b=> b.classList.remove('is-playing'));
    $$(`[data-play="${CSS.escape(eid)}"][data-v="${vi || 0}"]`, list).forEach(b=> b.classList.add('is-playing'));
    let r; try{ r = v[1](makeCtx(e)); }catch(err){ console.error('[lab2]', eid, err); now.innerHTML += '<span style="color:#e57">That call threw: ' + esc(err.message) + '</span>'; }
    if(r && typeof r.then === 'function'){ try{ await Promise.race([r, sleep(9000)]); }catch(err){ console.error('[lab2]', eid, err); } }
    else await sleep(1600);
    if(my === tab.token) $$('[data-play].is-playing', list).forEach(b=> b.classList.remove('is-playing'));
  }
  tab.play = play;
  list.addEventListener('click', ev=>{ const b = ev.target.closest('[data-play]'); if(b) play(b.dataset.play, +b.dataset.v); });
  $(S('Replay')).addEventListener('click', ()=>{ if(tab.last) play(tab.last[0], tab.last[1]); });
  $$('[data-lspeed]', dock).forEach(b=> b.addEventListener('click', ()=>{ tab.speed = +b.dataset.lspeed; if(W.gsap) W.gsap.globalTimeline.timeScale(tab.speed); $$('[data-lspeed]', dock).forEach(x=> x.setAttribute('aria-pressed', String(x === b))); }));
  // leaving the tab stops the effects and puts the speed back for the others
  document.addEventListener('click', ev=>{ const t = ev.target.closest('nav.toc [data-tab]'); if(t && t.dataset.tab !== id && !sec.hidden){ tab.token++; clearAll(); if(W.gsap) W.gsap.globalTimeline.timeScale(1); } });

  // ---- filters
  const chips = $$('[data-chip]', $(S('Chips')));
  function applyFilter(){
    const f = (chips.find(c=> c.getAttribute('aria-pressed') === 'true') || {dataset:{chip:'all'}}).dataset.chip;
    $$('.war-fx', list).forEach(a=> a.hidden = !(f === 'all' || a.dataset.group === f || (f === 'game' && a.dataset.ig === '1') || (f === 'lab' && a.dataset.ig === '0')));
    $$('.war-grid', list).forEach(g=>{ const n = $$('.war-fx:not([hidden])', g).length; g.previousElementSibling.hidden = !n; });
    $(S('Shown')).textContent = $$('.war-fx:not([hidden])', list).length + ' shown';
  }
  chips.forEach(c=> c.addEventListener('click', ()=>{ chips.forEach(x=> x.setAttribute('aria-pressed', String(x === c))); applyFilter(); }));
  applyFilter();
  return tab;
}
// the arena's holo layers etc. (tiles carry is-holo only on the foil kind)
function decorate(root){ try{ if(typeof decorateHolo === 'function') decorateHolo(root); }catch(e){} }

// ---------------------------------------------------------------- the pinned top offset, for every sticky field
function navTop(){ const n = $('nav.toc'); if(n) document.documentElement.style.setProperty('--lab2-top', (n.offsetHeight + 2) + 'px'); }

// ---------------------------------------------------------------- the sticky field on the older tabs
// Mode 'bar': the field is pinned where it is (Skills' arena, the Battlefield box, the Damage numbers' two stages).
// Mode 'dock': every demo has its own stage in its own tile; pressing a button in a tile lifts that tile's stage into a pinned bar
//   (capture phase, so it is already there when the button's own handler plays) and leaves a dashed placeholder; another tile's press,
//   the bar's "put back", or leaving the tab sends it home.
const STICKY = {
  skills:      {mode:'bar', field:'#skillArena', title:'Field'},
  battlefield: {mode:'bar', field:'#bfLab', title:'Battlefield'},
  numbers:     {mode:'bar', field:'#numEnemy', title:'Fields', wrap:'.fx-grid'},
  procfx:      {mode:'dock'}, cardnew: {mode:'dock'}, cards: {mode:'dock'}, combat: {mode:'dock'}, screens: {mode:'dock'},
};
function wrapBar(sec, cfg){
  const f = $(cfg.field, sec); if(!f) return;
  let target = f;
  if(cfg.wrap){ target = f.closest(cfg.wrap) || f; }
  const bar = document.createElement('div'); bar.className = 'lab2-bar lab2-bar-fixed'; bar.dataset.bar = sec.id;
  target.parentNode.insertBefore(bar, target); bar.appendChild(target);
  // a short caption that says what is pinned (and keeps the bar slim on a phone)
  const cap = document.createElement('div'); cap.className = 'lab2-barhead'; cap.innerHTML = `<span>📌 <b>${esc(cfg.title)}</b> stays in view while you scroll this tab</span>`; bar.insertBefore(cap, target);
}
function initDock(sec){
  const bar = document.createElement('div'); bar.className = 'lab2-bar lab2-dockbar'; bar.hidden = true; bar.dataset.bar = sec.id;
  bar.innerHTML = '<div class="lab2-barhead"><span class="lab2-bartitle">📌 Stage</span><button type="button" class="lab2-putback" aria-label="Put the stage back in its tile">↩ Put back</button></div><div class="lab2-hold"></div>';
  const anchor = $('.sec-sub', sec) || $('h2', sec); anchor.insertAdjacentElement('afterend', bar);
  const hold = $('.lab2-hold', bar), title = $('.lab2-bartitle', bar);
  let cur = null; // {stage, ph}
  const putBack = ()=>{ if(!cur) return; const {stage, ph} = cur; cur = null; try{ if(ph.parentNode){ ph.replaceWith(stage); } else stage.remove(); }catch(e){} bar.hidden = true; };
  const take = (tile)=>{
    const stage = $('.stage, .num-stage', tile); if(!stage || stage.closest('.lab2-bar')) return false;
    putBack();
    const ph = document.createElement('div'); ph.className = 'lab2-ph'; ph.style.minHeight = Math.max(60, Math.min(stage.offsetHeight, 200)) + 'px'; ph.innerHTML = '<span>▲ playing in the pinned stage</span>';
    stage.replaceWith(ph); hold.appendChild(stage); cur = {stage, ph};
    const h = $('h3', tile); title.innerHTML = '📌 <b>' + esc(h ? h.textContent.replace(/\s+(Live|New|Lab|Prototype|Retired|TBC)\s*$/, '').trim() : 'Stage') + '</b>';
    bar.hidden = false; return true;
  };
  // capture phase: runs before the button's own handler, so the stage has already moved when the effect starts
  sec.addEventListener('click', ev=>{
    const ctl = ev.target.closest('button, label, input, select, .card-tile'); if(!ctl || ctl.closest('.lab2-bar')) return;
    const tile = ctl.closest('.fx'); if(!tile || !sec.contains(tile)) return;
    if(tile.querySelector('.lab2-ph')) return;            // its stage is already pinned
    if(!tile.querySelector('.stage, .num-stage')) return; // a tile with no stage (a note)
    take(tile);
  }, true);
  $('.lab2-putback', bar).addEventListener('click', putBack);
  document.addEventListener('click', ev=>{ const t = ev.target.closest('nav.toc [data-tab]'); if(t && t.dataset.tab !== sec.id) putBack(); });
  sec._lab2PutBack = putBack;
}
function initSticky(){
  Object.keys(STICKY).forEach(id=>{ const sec = document.getElementById(id); if(!sec) return; const c = STICKY[id]; if(c.mode === 'bar') wrapBar(sec, c); else initDock(sec); });
  // Card displays and Foils: the card picker and the toggles stay pinned above the long lists
  ['displays', 'treatments'].forEach(id=>{ const sec = document.getElementById(id), ctl = sec && $('.bf-controls', sec); if(!ctl) return; ctl.classList.add('lab2-ctl'); });
  navTop(); addEventListener('resize', navTop);
}

W.LAB2 = {mount, tabs:TABS, fieldCtx, fieldHTML, initSticky, navTop, clearBody, sleep, esc, badge, shim:def, DEFS, tileHTML, wrapHTML};
})();
