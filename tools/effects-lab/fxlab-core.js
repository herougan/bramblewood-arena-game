/* ============================================================
   FXLAB core (2026-10-15): the Effects Lab catalogue's registration API and its stages.
   Contract: docs/effects-lab-contract.md. Build: tools/effects-lab/build.py bundles, in order,
     FXLAB_INVENTORY (docs/effects-inventory-2026-10-15.json) + FXLAB_FIXTURES (fixtures.json, the game's own markup)
     → this file → tools/effects-lab/manifest/*.js (the registrations) → fxlab-catalogue.js (the page).

   FXLAB.register({id, stage, note, inGameHook, variants:[{key:'A', label, play(ctx), stage?, duration?}]})
   FXLAB.registerGroup({stage, note...}, [{id, variants}, ...])     shared defaults for several entries
   FXLAB.play(id, key) → Promise                                       what the play buttons call
   play(ctx) returns a Promise (the lab waits for it, max 12 s) or nothing (the lab waits `duration`, default 1600 ms).

   ctx (one fresh stage per play; see makeCtx below)
     ctx.root   the stage element (position:relative, overflow hidden)      ctx.stage  'cards'|'board'|'map'|'pack'|'ui'|'screen'
     ctx.cards  the stage's card tiles (.card-tile, each inside a .board-card wrapper). Cards stage: common, rare, foil, leader.
     ctx.castle the castle tile (cards stage: beside the cards; board stage: the enemy castle)
     ctx.board  {mine, foe (.board-card wrappers, as boardCardEl(uid) gives in the game), castleMine, castleFoe, field, hud,
                 el (#battlefieldEl), rowMine, rowFoe, leader, hand, hpMine, hpFoe, pillsMine, pillsFoe}
     ctx.map    {el (#conquestCanvas), layout, nodes:{cleared:[..], available, locked, boss}, nodeList, trail (svg), trailLines, pawn, spot}
     ctx.pack   {el (the .po2 overlay), pack, strip, hint, cards, deal() → Promise (deals face-down cards), flip(i)}
     ctx.ui     {el, hud, pills:{gold, dust, leaves, energy}, results, toastArea, toast(msg, kind)}
     ctx.tile(kind, {append}) a fresh tile: common uncommon rare epic legendary mythic foil leader castle token fire flyer
     ctx.reset()  rebuild this stage        ctx.wait(ms) (follows the speed control)      ctx.sound(name, ...args) (SoundKit, guarded)
     ctx.float(el, text, cls)  the game's damage number        ctx.tilt(tile, ms)  sweep the light over a foil
     ctx.layer(cls)  an absolute overlay inside the stage       ctx.alive()  false once another play started
     ctx.gsap, ctx.entry (the inventory row), ctx.variant ('A'…), ctx.speed
   ============================================================ */
(function(){
'use strict';
const INV = window.FXLAB_INVENTORY || [];
const FIX = window.FXLAB_FIXTURES || {};
const BY_ID = new Map(INV.map(e=> [e.id, e]));
const REG = new Map();
const PROBLEMS = [];
const STAGES = ['cards', 'board', 'map', 'pack', 'ui', 'screen'];
// Default stage per inventory area (a registration or a variant can override it).
const AREA_STAGE = {'combat-attack':'board', 'combat-skill':'board', 'status':'board', 'field':'board', 'weather-time':'board', 'darkness-light':'board',
  'death':'board', 'castle':'board', 'summon-spawn':'board', 'raid-dungeon-pvp':'board', 'card-treatment':'cards', 'foil':'cards', 'pack-card-open':'pack',
  'conquest-map':'map', 'world-ambience':'map', 'map-grandeur':'map', 'fun':'screen', 'rewards-results':'ui', 'meta-progression':'ui', 'ui-feedback':'ui', 'tutorial-dialogue':'ui'};
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const problem = msg=>{ PROBLEMS.push(msg); console.warn('[FXLAB] ' + msg); };

// ---------------- registration ----------------
function register(spec){
  if(!spec || typeof spec !== 'object'){ problem('register() needs an object'); return null; }
  let e = BY_ID.get(spec.id);
  // 2026-10-16: three families may add entries that are not in the inventory (map titles, map grandeur, the fun set;
  // user: "I like having more map effects and title effects" / "Invent more for fun?"). They carry their own name/trigger.
  if(!e && /^(map-title-|map-grand-|fun-)/.test(String(spec.id || ''))){
    e = {id:spec.id, area:spec.area || (/^fun-/.test(spec.id) ? 'fun' : 'map-grandeur'), name:spec.name || spec.id, trigger:spec.trigger || '', current:spec.current || '',
      quality:spec.quality || 'good', priority:spec.priority || 2, themeNotes:spec.themeNotes || '', variantsSuggested:false, future:!!spec.future, batch:'G', isNew:true};
    INV.push(e); BY_ID.set(e.id, e);
  }
  if(!e){ problem(`register: "${spec.id}" is not an inventory id (docs/effects-inventory-2026-10-15.json)`); return null; }
  let vs = spec.variants;
  if(!vs && typeof spec.play === 'function') vs = [{key:'A', label:spec.label || 'Play', play:spec.play}];
  if(!Array.isArray(vs) || !vs.length){ problem(`register: "${spec.id}" has no variants`); return null; }
  const stage = spec.stage || AREA_STAGE[e.area] || 'cards';
  if(!STAGES.includes(stage)){ problem(`register: "${spec.id}" stage "${stage}" is not one of ${STAGES.join('/')}`); return null; }
  const rec = REG.get(spec.id) || {id:spec.id, entry:e, variants:[]};
  Object.assign(rec, {stage, note:spec.note || rec.note || '', inGameHook:spec.inGameHook || rec.inGameHook || '', duration:spec.duration || rec.duration});
  vs.forEach((v, i)=>{
    const key = String(v.key || 'ABCDEFGH'[i]).toUpperCase();
    if(!/^[A-H]$/.test(key)){ problem(`register: "${spec.id}" variant key "${key}" must be one letter A–H`); return; }
    if(typeof v.play !== 'function'){ problem(`register: "${spec.id}" variant ${key} has no play(ctx)`); return; }
    if(v.stage && !STAGES.includes(v.stage)){ problem(`register: "${spec.id}" variant ${key} stage "${v.stage}" is unknown`); return; }
    const at = rec.variants.findIndex(x=> x.key === key);
    if(at >= 0){ problem(`register: "${spec.id}" variant ${key} registered twice; the later one wins`); rec.variants.splice(at, 1); }
    rec.variants.push({key, label:v.label || '', play:v.play, stage:v.stage || null, duration:v.duration || null, note:v.note || ''});
  });
  rec.variants.sort((a, b)=> a.key < b.key ? -1 : 1);
  if(!rec.variants.length) return null;
  REG.set(spec.id, rec);
  return rec;
}
function registerGroup(defaults, list){ (list || []).forEach(s=> register(Object.assign({}, defaults || {}, s))); }

// ---------------- fixtures ----------------
const tpl = html=>{ const t = document.createElement('template'); t.innerHTML = html || ''; return t.content; };
const htmlOf = frag=>{ const d = document.createElement('div'); d.appendChild(frag); return d.innerHTML; };
const TILES = FIX.tiles || {};
// The lab's leader: the game marks its leader on the board with .board-card.is-leader (wrapTile adds it).
function tileHTML(kind){
  const t = TILES[kind === 'leader' ? 'epic' : kind] || TILES.common; return t ? t.html : '';
}
function wrapTile(html, kind){
  const w = document.createElement('div'); w.className = 'board-card fxl-slot' + (kind === 'leader' ? ' is-leader' : ''); w.dataset.kind = kind; w.innerHTML = html;
  try{ if(typeof decorateHolo === 'function') decorateHolo(w); }catch(e){}
  return w;
}
// The board: #view-play from a real fight, minus the settings panel and the battle log.
const BOARD_HTML = (()=>{ if(!FIX.board) return ''; const f = tpl(FIX.board.html);
  f.querySelectorAll('#settingsPanelHud, .battle-log-panel, .coach, .coach-tip, .tut-hand, #dropRow, .wl-reopen').forEach(e=> e.remove());
  f.querySelectorAll('.board-card .seen-new').forEach(e=> e.remove()); // the "first time seen" pill from the capture
  // 2026-10-17: two hand cards (the 10-17 capture holds four, which wrapped the hand into a column beside the Pass button)
  [...f.querySelectorAll('#handStrip > .card-tile')].slice(2).forEach(e=> e.remove());
  return htmlOf(f); })();
// The map: keep the trail, the camp spot, the trees and the nodes; lay the nodes out as a little route ending at a boss.
const MAP_ROUTE = [{x:12, y:72}, {x:31, y:52}, {x:52, y:64}, {x:71, y:44}, {x:88, y:24}];
function mapHTML(){
  if(!FIX.map) return '';
  const f = tpl(FIX.map.html);
  f.querySelectorAll('.map-decor.map-small, .map-well, .map-curio, .map-cave, .map-wanderer, .world-edge, .map-spot-links, .map-spot.is-unknown').forEach(e=> e.remove());
  const spots = [...f.querySelectorAll('.map-spot')]; spots.slice(1).forEach(e=> e.remove());
  if(spots[0]){ spots[0].style.left = '40%'; spots[0].style.top = '22%'; }
  const nodes = [...f.querySelectorAll('.map-node')];
  const done = nodes.filter(n=> n.classList.contains('done')), open = nodes.find(n=> !n.classList.contains('done') && !n.classList.contains('map-node-hidden')), hidden = nodes.find(n=> n.classList.contains('map-node-hidden'));
  const list = [done[0], done[1], open, hidden].filter(Boolean);
  if(open){ const boss = open.cloneNode(true); boss.className = 'map-node kind-boss kind-base-boss'; boss.dataset.lkey = boss.dataset.nodekey = '0-B';
    const ico = boss.querySelector('.map-node-ico'); if(ico) ico.textContent = '🦡'; const code = boss.querySelector('.map-node-code'); if(code) code.textContent = 'BOSS'; list.push(boss); }
  nodes.forEach(n=> n.remove());
  const canvas = document.createElement('div'); canvas.appendChild(f);
  list.forEach((n, i)=>{ const p = MAP_ROUTE[i]; n.style.left = p.x + '%'; n.style.top = p.y + '%'; n.dataset.fxlState = ['cleared', 'cleared', 'available', 'locked', 'boss'][i]; canvas.appendChild(n); });
  const svg = canvas.querySelector('.map-trail-svg');
  if(svg) svg.innerHTML = MAP_ROUTE.slice(1).map((p, i)=>{ const a = MAP_ROUTE[i]; return `<line ${i >= 2 ? 'class="is-dark" ' : ''}data-a="${i}" data-b="${i + 1}" x1="${a.x}" y1="${a.y}" x2="${p.x}" y2="${p.y}"/>`; }).join('');
  const pawn = canvas.querySelector('.map-pawn'); if(pawn){ pawn.style.left = MAP_ROUTE[2].x + '%'; pawn.style.top = MAP_ROUTE[2].y + '%'; canvas.appendChild(pawn); }
  return canvas.innerHTML;
}
const MAP_HTML = mapHTML();
const PILL = (FIX.ui && FIX.ui.pills) || {};
const UI_HTML = `<div class="fxl-hud">${PILL.gold || ''}${PILL.dust || ''}${PILL.gems || PILL.leaves || ''}${(PILL.energy || '').replace(/ id="[^"]*"/g, '')}</div>
  <div class="pass-card winloss-card is-glory fxl-results"><div class="wl-rays-clip" aria-hidden="true"><div class="wl-rays"></div></div>
    <div class="pass-ico">🎉</div><h2 class="wl-title">Victory!</h2>
    <div class="rw-panel winloss-conquest-rewards"><div class="rw-sec rw-cheer"><div class="rw-head">Rewards</div><div class="rw-row">${(PILL.gold || '').replace('cur-pill ', 'cur-pill rw-cur ')}${(PILL.dust || '').replace('cur-pill ', 'cur-pill rw-cur ')}</div></div></div>
  </div><div class="toast-host fxl-toasts"></div>`;

// ---------------- stage building ----------------
let frame = null, playToken = 0, baseline = null, speed = 1;
function setFrame(el){ frame = el; }
const vw = ()=> Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
// Fit a natural-size layout into the frame with CSS zoom (rects stay right for overlays positioned from getBoundingClientRect).
function fit(el, W, H){
  el.style.width = W + 'px'; if(H) el.style.height = H + 'px';
  const fw = frame.clientWidth || W; let z = Math.min(1, fw / W);
  // 2026-10-16: and to the frame's height cap (the sticky dock on desktop, the mini stage on a phone), centred.
  const mh = parseFloat(getComputedStyle(frame).maxHeight), nh = H || el.scrollHeight;
  if(mh > 0 && nh*z > mh){ z = Math.max(.2, (mh - 4) / nh); el.style.marginLeft = el.style.marginRight = 'auto'; }
  el.style.zoom = z.toFixed(4);
  return z;
}
function clearOverlays(){
  const g = G();
  [...document.body.children].forEach(c=>{ if(baseline && !baseline.has(c) && !c.hasAttribute('data-fxl-keep')){ if(g) g.killTweensOf(c); c.remove(); } });
  if(frame && g){ g.killTweensOf(frame.querySelectorAll('*')); }
}
function build(stage){
  clearOverlays();
  frame.innerHTML = ''; frame.dataset.stage = stage;
  const root = document.createElement('div'); root.className = 'fxl-stage fxl-stage-' + stage; frame.appendChild(root);
  const parts = {root, cards:[], board:null, map:null, pack:null, ui:null};
  if(stage === 'cards'){
    const row = document.createElement('div'); row.className = 'fxl-cardrow'; root.appendChild(row);
    ['common', 'rare', 'foil', 'leader'].forEach(k=> row.appendChild(wrapTile(tileHTML(k), k)));
    parts.cards = [...row.querySelectorAll('.card-tile')];
    const c = wrapTile(tileHTML('castle'), 'castle'); c.classList.add('fxl-castle'); row.appendChild(c); parts.castle = c.querySelector('.card-tile');
  } else if(stage === 'board'){
    const app = document.createElement('div'); app.id = 'appWrap'; app.className = 'wrap in-match fxl-app';
    app.innerHTML = `<div class="content-wrap"><div id="view-play" class="fxl-view">${BOARD_HTML}</div></div>`;
    root.appendChild(app);
    fit(app, vw() >= 760 ? 940 : 400); // 2026-10-17: 940 (was 880): the re-captured bottom row (castle, Deck, leader, hand, Graveyard, Pass) needs the room
    const q = s=> app.querySelector(s), qa = s=> [...app.querySelectorAll(s)];
    const units = sel=> qa(sel + ' .board-card').filter(b=> b.querySelector('.card-tile'));
    parts.board = {el:q('#battlefieldEl'), rowMine:q('#rowMine'), rowFoe:q('#rowEnemy'), mine:units('#rowMine'), foe:units('#rowEnemy'),
      castleMine:q('.bottom-play-row .match-castle-tile'), castleFoe:q('.top-play-row .match-castle-tile'), field:q('#fieldCondCard') || q('.match-field-tile'), /* 2026-10-17: the re-captured board's field is a weather card (Spring Rain) */ hud:q('.top-right-stack') || q('.hud'),
      leader:q('#leaderWidget .card-tile') || q('#leaderWidgetWrap .card-tile'), hand:qa('#handStrip .card-tile'), hpMine:q('.bf-hp-mine'), hpFoe:q('.bf-hp-enemy'),
      pillsMine:q('#fieldResMine'), pillsFoe:q('#fieldResEnemy'), app};
    parts.cards = parts.board.mine.concat(parts.board.foe).map(b=> b.querySelector('.card-tile'));
  } else if(stage === 'map'){
    const lay = document.createElement('div'); lay.className = 'conquest-layout map-theme-m1 has-map-art fxl-maplayout';
    lay.innerHTML = `<div class="conquest-main"><div class="conquest-map-canvas" id="conquestCanvas" style="--icon-scale:1;">${MAP_HTML}</div></div>`;
    root.appendChild(lay);
    const W = vw() >= 760 ? 900 : 520; fit(lay, W, Math.round(W*0.62));
    const q = s=> lay.querySelector(s), qa = s=> [...lay.querySelectorAll(s)];
    const st = s=> qa(`.map-node[data-fxl-state="${s}"]`);
    parts.map = {el:q('#conquestCanvas'), layout:lay, nodeList:qa('.map-node'), nodes:{cleared:st('cleared'), available:st('available')[0], locked:st('locked')[0], boss:st('boss')[0]},
      trail:q('.map-trail-svg'), trailLines:qa('.map-trail-svg line'), pawn:q('.map-pawn'), spot:q('.map-spot')};
  } else if(stage === 'pack'){
    const wrap = document.createElement('div'); wrap.className = 'fxl-packwrap'; root.appendChild(wrap);
    const ov = document.createElement('div'); ov.className = ((FIX.packClosed && FIX.packClosed.cls) || 'pack-open-overlay po2') + ' fxl-po'; ov.id = 'packOpenOverlay';
    ov.innerHTML = (FIX.packClosed && FIX.packClosed.html) || ''; wrap.appendChild(ov);
    fit(wrap, vw() >= 760 ? 760 : 400, 480);
    const pk = {el:ov, pack:ov.querySelector('.po2-pack'), strip:ov.querySelector('.po2-strip'), hint:ov.querySelector('.po2-hint'), cards:[], dealt:false};
    pk.deal = ()=>{ ov.innerHTML = (FIX.packDealt && FIX.packDealt.html) || ''; pk.dealt = true; pk.pack = null; pk.strip = null; pk.hint = ov.querySelector('.po2-hint');
      pk.cards = [...ov.querySelectorAll('.po2-card')]; parts.cards.length = 0; pk.cards.forEach(c=> parts.cards.push(c.querySelector('.card-tile')));
      try{ if(typeof decorateHolo === 'function') decorateHolo(ov); }catch(e){} return Promise.resolve(pk.cards); };
    pk.flip = i=>{ const c = pk.cards[i]; if(!c) return; c.classList.remove('is-waiting', 'is-current'); c.classList.add('is-revealed'); };
    parts.pack = pk;
  } else if(stage === 'ui'){
    const u = document.createElement('div'); u.className = 'fxl-ui'; u.innerHTML = UI_HTML; root.appendChild(u);
    const toasts = u.querySelector('.fxl-toasts'), pills = u.querySelectorAll('.fxl-hud > *');
    parts.ui = {el:u, hud:u.querySelector('.fxl-hud'), pills:{gold:pills[0], dust:pills[1], leaves:pills[2], energy:pills[3]}, results:u.querySelector('.fxl-results'), toastArea:toasts,
      toast(msg, kind){ const t = document.createElement('div'); t.className = 'toast' + (kind ? ' toast-' + kind : ''); t.setAttribute('role', 'status'); t.textContent = msg; toasts.appendChild(t);
        requestAnimationFrame(()=> t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 400); }, 2600); return t; }};
  } else { // screen: a blank, map-backed area for full-screen moments (transitions, banners, weather over everything)
    const s = document.createElement('div'); s.className = 'fxl-screen'; s.innerHTML = '<div class="fxl-screen-cap">Screen</div>'; root.appendChild(s);
  }
  return parts;
}

// ---------------- ctx ----------------
function makeCtx(rec, v, token){
  const stage = v.stage || rec.stage;
  const ctx = {stage, entry:rec.entry, variant:v.key, gsap:G(), get speed(){ return speed; }};
  const apply = p=>{ ctx.root = p.root; ctx.cards = p.cards; ctx.castle = p.castle || (p.board && p.board.castleFoe) || null; ctx.board = p.board; ctx.map = p.map; ctx.pack = p.pack; ctx.ui = p.ui; };
  apply(build(stage));
  ctx.reset = ()=>{ apply(build(stage)); return ctx; };
  ctx.alive = ()=> token === playToken;
  ctx.wait = ms=> new Promise(res=>{ const g = G(); if(g) g.delayedCall(Math.max(0, ms|0)/1000, res); else setTimeout(res, (ms|0)/speed); });
  ctx.sound = (name, ...a)=>{ try{ if(typeof SoundKit !== 'undefined' && typeof SoundKit[name] === 'function') return SoundKit[name](...a); }catch(e){} };
  ctx.tile = (kind, o)=>{ const w = wrapTile(tileHTML(kind || 'common'), kind || 'common'); if(o && o.append){ (ctx.root.querySelector('.fxl-cardrow') || ctx.root).appendChild(w); } return w.querySelector('.card-tile'); };
  ctx.float = (el, text, cls)=>{ try{ if(typeof floatText === 'function') return floatText(el.closest && el.closest('.board-card') || el, text, cls); }catch(e){} };
  ctx.layer = cls=>{ const l = document.createElement('div'); l.className = 'fxl-layer ' + (cls || ''); ctx.root.appendChild(l); return l; };
  // Sweep the light across a foil tile (the same CSS variables the game's pointer tilt sets).
  ctx.tilt = (tile, ms)=>{ const g = G(); if(!tile || !g) return Promise.resolve();
    const o = {px:.12, py:.18}; const set = ()=>{ tile.style.setProperty('--hx', (o.px*100).toFixed(1) + '%'); tile.style.setProperty('--hy', (o.py*100).toFixed(1) + '%');
      tile.style.setProperty('--hbx', (50 + (o.px - .5)*60).toFixed(1) + '%'); tile.style.setProperty('--hby', (50 + (o.py - .5)*60).toFixed(1) + '%');
      tile.style.setProperty('--hrx', ((.5 - o.py)*14).toFixed(2) + 'deg'); tile.style.setProperty('--hry', ((o.px - .5)*18).toFixed(2) + 'deg'); };
    tile.classList.add('holo-active'); set();
    return new Promise(res=> g.timeline({onComplete:()=>{ tile.classList.remove('holo-active'); res(); }})
      .to(o, {px:.88, py:.8, duration:(ms || 2200)/2000, ease:'sine.inOut', onUpdate:set}).to(o, {px:.3, py:.35, duration:(ms || 2200)/2000, ease:'sine.inOut', onUpdate:set})); };
  return ctx;
}

// ---------------- speed (GSAP time scale + CSS animations) ----------------
let cssRate = null;
function setSpeed(s){
  speed = s; const g = G(); if(g) g.globalTimeline.timeScale(s);
  applyCssRate();
}
function applyCssRate(){ try{ document.getAnimations().forEach(a=>{ if(a.playbackRate !== speed) a.playbackRate = speed; }); }catch(e){} }
function pumpCssRate(ms){ const until = performance.now() + ms; if(cssRate) cancelAnimationFrame(cssRate);
  const tick = ()=>{ if(speed !== 1) applyCssRate(); if(performance.now() < until) cssRate = requestAnimationFrame(tick); else cssRate = null; }; tick(); }

// ---------------- playing ----------------
const listeners = [];
function on(fn){ listeners.push(fn); }
function emit(type, data){ listeners.forEach(fn=>{ try{ fn(type, data); }catch(e){} }); }
async function play(id, key){
  const rec = REG.get(id); if(!rec || !frame) return false;
  const v = rec.variants.find(x=> x.key === key) || rec.variants[0];
  if(!baseline) baseline = new Set(document.body.children);
  const token = ++playToken;
  const g = G(); if(g) g.globalTimeline.timeScale(speed);
  let ctx;
  try{ ctx = makeCtx(rec, v, token); }catch(e){ console.error('[FXLAB] stage build failed for ' + id, e); return false; }
  emit('start', {id, key:v.key, rec, v});
  pumpCssRate(6000);
  let res;
  try{ res = v.play(ctx); }catch(e){ console.error(`[FXLAB] ${id} ${v.key} threw`, e); }
  const cap = new Promise(r=> setTimeout(r, 12000));
  if(res && typeof res.then === 'function') await Promise.race([res.catch(e=> console.error(`[FXLAB] ${id} ${v.key} rejected`, e)), cap]);
  else await ctx.wait(v.duration || rec.duration || 1600);
  if(token === playToken) emit('end', {id, key:v.key});
  return token === playToken;
}
// 2026-10-16: stopping also clears what the play left on <body> (the phone's mini stage hides the frame, so overlays would float over the list)
function stop(){ playToken++; clearOverlays(); emit('end', {}); }

window.FXLAB = {register, registerGroup, play, stop, setFrame, setSpeed, on, build,
  get speed(){ return speed; }, inventory:INV, byId:BY_ID, registry:REG, problems:PROBLEMS, stages:STAGES, areaStage:AREA_STAGE,
  get:id=> REG.get(id), list:()=> [...REG.values()]};
})();
