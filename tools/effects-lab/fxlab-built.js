/* ============================================================
   Effects Lab, "Built 10-21" tab (package LAB2, 2026-10-21): every visual effect built on 10-21 that the Lab did not show yet, each one
   played with the game's own code (functions copied from arena_app.js into fx-src.js, listed in fx-src-extra.txt), on the sticky field.
   Owner: "Update the effects lab with all the new effects." Every entry carries "In game: <where>".
   Packages: EV (Evolute), MT (Mimic), TR (Crown and Transforms), UI3 (Shield on the battlefield bars), EL (ten element attack plates),
   RK (total raid rank), BX (Stonedrop Vulture), FG (Forge centre stage, the hatch), and from 2026-10-22 CB (the Galactic Condor turns to fire its Position Beam),
   from 2026-10-23 FX4 (Scorched Ground's boil, Wildfire Front's line of fire).
   Where the game's handler is inline in renderVfxForEvent (evolve, hatch) the same calls are made in the same order (noted per entry).
   ============================================================ */
(function(){
'use strict';
const L = window.LAB2; if(!L) return;
const W = window;
const $ = (s, r)=> (r || document).querySelector(s), $$ = (s, r)=> [...(r || document).querySelectorAll(s)];
const reduced = ()=> typeof reducedMotion === 'function' && reducedMotion();
const snd = n=>{ try{ if(typeof SoundKit !== 'undefined' && SoundKit[n]) SoundKit[n](); }catch(e){} };
const T = (k, v)=>{ try{ return TX(k, v); }catch(e){ return k; } };

// a stand-in match that knows the field's cards (replayCards by uid), so the game's code can look them up
function matchWith(c, extra){
  const m = c.match(extra || {}); m.replayCards = m.replayCards || {};
  [...c.foeW, c.castleW, ...c.mineW].filter(Boolean).forEach(w=>{ const u = Number(w.getAttribute('data-uid')); m.replayCards[u] = m.replayCards[u] || {uid:u, defId:w.getAttribute('data-defid'), atk:3, hp:5, maxHp:5}; });
  return m;
}
const uidOf = (c, w)=> Number(w.getAttribute('data-uid'));

// ---- extra stand-in cards for the hatch and the evolve stack
Object.assign(L.DEFS, {
  'lab-hatch-common':{id:'lab-hatch-common', name:'Lab Chick', rarity:'common', icon:'🐥', cardType:'unit', attack:1, health:2, effects:{}},
  'lab-hatch-uncommon':{id:'lab-hatch-uncommon', name:'Lab Duckling', rarity:'uncommon', icon:'🦆', cardType:'unit', attack:2, health:3, effects:{}},
  'evo-a':{id:'evo-a', name:'Cub', rarity:'common', effects:{}}, 'evo-b':{id:'evo-b', name:'Young Bear', rarity:'uncommon', effects:{}}, 'evo-c':{id:'evo-c', name:'Great Bear', rarity:'rare', effects:{}}, 'evo-d':{id:'evo-d', name:'Bear Lord', rarity:'epic', effects:{}},
});

// ---------------------------------------------------------------- EV: Evolute
// The game's handler for the engine's {type:'evolve'} event (renderVfxForEvent, arena_app.js): the unit takes the stack's card, floats
// "🧬 Evolute / Alpha / Omega", gets a lilac glow (.evo-evolved, 900 ms), FX.A's prismatic sparkle and a short pop. The tile swap here stands
// in for renderBoard (the Lab has no board to redraw).
async function evolve(c, stage, stack){
  matchWith(c);
  const w = c.mineW[1], uid = uidOf(c, w), defs = getCardDefs();
  await c.wait(350);
  w.innerHTML = L.tileHTML(stage === 3 ? 'legendary' : stage === 2 ? 'epic' : 'rare') + evoStackHTML({evoStack:stack, defId:'evo-d'}, defs);
  const el = boardCardEl(uid), nmKey = stage === 3 ? 'ui.skn-evolute-omega' : stage === 2 ? 'ui.skn-evolute-alpha' : 'ui.skn-evolute';
  try{ floatText(el, '🧬 ' + T(nmKey), 'quick'); }catch(e){}
  el.classList.add('evo-evolved'); setTimeout(()=> el.classList.remove('evo-evolved'), 900);
  try{ if(window.FX && window.FX.A && window.FX.A.supremeSparkle && !reduced() && fxAtLeast('low')) window.FX.A.supremeSparkle(el); }catch(e){}
  if(hasGsap() && !reduced()) gsap.fromTo(el, {scale:1.14}, {scale:1, duration:.45, ease:'back.out(2)', clearProps:'transform'});
  snd('unlockChime'); await c.wait(1500);
}
function stackOnly(c, stack){
  const w = c.mineW[1]; w.innerHTML = L.tileHTML('rare') + evoStackHTML({evoStack:stack, defId:'evo-d'}, getCardDefs());
  const ally = c.mineW[0]; ally.innerHTML = L.tileHTML('common'); // beside it, a plain unit
}

// The game's handler for the engine's {type:'mimic'} event: the Mimic's card is swapped for its copy's (renderBoard), "🪞 Mimic" floats,
// and FX.C's 'mimic' case plays twinPeel 320 ms later: a mirror sheen over the copied unit, a see-through copy peeling across, and the
// Mimic fading in as the copy. The tile swap here stands in for renderBoard.
async function mimic(c, srcW, dstW){
  matchWith(c); await c.wait(250);
  dstW.innerHTML = srcW.innerHTML; // it now is the copy's card
  try{ floatText(dstW, '🪞 ' + T('ui.skn-mimic'), 'quick'); }catch(e){}
  await c.wait(320);
  if(W.FX && FX.C && FX.C.twinPeel) await FX.C.twinPeel(srcW.querySelector('.card-tile'), dstW.querySelector('.card-tile'), {});
  await c.wait(500);
}

// ---------------------------------------------------------------- the entries
const E = [];
const add = (g, id, name, where, note, v, extra)=> E.push(Object.assign({id, group:g, name, where, note, v}, extra || {}));

// -- EV
add('ev', 'ev-evolve', 'Evolute lands on its base', 'an Evolute played onto one of your units (engine event evolve, renderVfxForEvent)',
  'The unit takes the stack\'s card and stats; "🧬 Evolute" floats, a lilac glow, FX.A\'s prismatic sparkle and a short pop.',
  [['Evolute (stage 1)', c=> evolve(c, 1, ['evo-a'])], ['Alpha (stage 2)', c=> evolve(c, 2, ['evo-a', 'evo-b'])], ['Omega (stage 3)', c=> evolve(c, 3, ['evo-a', 'evo-b', 'evo-c'])]],
  {sig:'floatText 🧬 + .evo-evolved + FX.A.supremeSparkle + pop'});
add('ev', 'ev-stack', 'Evolute stack edges and ×N', 'an evolved unit on the board (evoStackHTML, drawn by renderBoard)',
  'The cards underneath peek out behind the unit as purple edges (up to 3), and a ×N badge counts the stack; hover for the chain.',
  [['× 2', c=> stackOnly(c, ['evo-a'])], ['× 3', c=> stackOnly(c, ['evo-a', 'evo-b'])], ['× 4 (three edges)', c=> stackOnly(c, ['evo-a', 'evo-b', 'evo-c'])]],
  {sig:'evoStackHTML(c, defs)'});

// -- MT
add('mt', 'mt-mimic', 'Mimic copies an ally', 'a Mimic unit taking its copy\'s card (engine event mimic: FX.C twinPeel, then 🪞 Mimic floats)',
  'Twin\'s mirror sheen sweeps the ally, a see-through copy peels off it toward the Mimic, and the Mimic fades in as the copy with 🪞 floating up.',
  [['Mimic an ally', c=> mimic(c, c.mineW[0], c.mineW[2])], ['Mimic a foe', c=> mimic(c, c.foeW[0], c.mineW[1])]],
  {sig:'FX.C.twinPeel(ally, mimic) + floatText 🪞'});

// -- TR: the Crown
const crownEv = (kind, from, to, extra)=> async c=>{
  matchWith(c); const f = from && from(c), t = to(c);
  if(f) trSetCrown(uidOf(c, f), true);
  await c.wait(f ? 700 : 200);
  trCrownVfx(Object.assign({type:'crown', kind, uid:uidOf(c, t), fromUid:f ? uidOf(c, f) : null, side:'A'}, extra || {}));
  await c.wait(1900);
};
add('tr', 'tr-crown-take', 'Crown settles on a unit', 'a unit being crowned (engine event crown take / pickup, trCrownVfx)',
  'A 👑 drops onto the new King from above with a golden shine and a "Crowned" float; the King has a gold ring. The same look for a Flyer.',
  [['Take (a unit)', crownEv('take', null, c=> c.mineW[1])], ['Pickup (a Flyer)', crownEv('pickup', null, c=> c.foeW[1])], ['Resting 👑 badge', async c=>{ matchWith(c); trSetCrown(uidOf(c, c.mineW[0]), true); trSetCrown(uidOf(c, c.mineW[2]), true); await c.wait(1200); }]],
  {sig:'trCrownVfx({type:"crown", kind:"take"})'});
add('tr', 'tr-crown-fly', 'Crown flies between units', 'the Crown changing hands (engine event crown liege / steal, trCrownVfx)',
  'A loose 👑 lifts off the old holder and arcs to the new one. A steal says "Stolen" and flies across the lanes.',
  [['Liege (to an ally)', crownEv('liege', c=> c.mineW[0], c=> c.mineW[2])], ['Steal (from a foe)', crownEv('steal', c=> c.foeW[0], c=> c.mineW[1])]],
  {sig:'trCrownVfx({kind:"liege" | "steal", fromUid, uid})'});
add('tr', 'tr-crown-drop', 'Crown falls off a dead King', 'the King dying with nobody to take the Crown (engine event crown drop, trCrownVfx)',
  'The 👑 falls off the King, tumbles to the ground, bounces and lies there a moment before it fades.',
  [['Drop', crownEv('drop', c=> c.mineW[1], c=> c.mineW[1])]], {sig:'trCrownVfx({kind:"drop"})'});
add('tr', 'tr-crown-fade', 'Crown fades into Gold', 'a Crown with no holder fading (engine event crown fade, pays +1 Gold)',
  'The 👑 dims away upward in a soft glow; +1 🪙 floats on the side\'s Gold pill (here, on the card).',
  [['Fade (+1 Gold)', crownEv('fade', c=> c.mineW[2], c=> c.mineW[2], {gold:1})]], {sig:'trCrownVfx({kind:"fade", gold:1})'});

// -- TR: the Transforms
const tfPlay = name=> async c=>{ matchWith(c); const w = c.mineW[1]; await c.wait(250); trTransformVfx({type:'statusFx', kind:'transform', attUid:uidOf(c, w), name}); await c.wait(2000); };
add('tr', 'tr-gilded', 'Gilded', 'a card becoming Gilded (engine event statusFx transform gilded, trTransformVfx)',
  'A gold ring and a moving gold sheen over the card, a burst, "🪙 Gilded" floating up, and gold leaf falling off the top.',
  [['Become Gilded', tfPlay('gilded')], ['Resting look', async c=>{ matchWith(c); const w = c.mineW[1]; w.classList.add('tf-on', 'tf-gilded'); w.insertAdjacentHTML('beforeend', TR_SHEEN); await c.wait(2400); }]],
  {sig:'trTransformVfx({name:"gilded"}) + TR_SHEEN'});
add('tr', 'tr-rings', 'Championed, Veteran, Enraged, Matured', 'a card taking a named Transform (engine event statusFx transform, trTransformVfx)',
  'Each Transform keeps its own coloured ring on the card (red-gold, silver, red, wheat-green) and plays a short burst with its name floating up.',
  [['Championed 🏆', tfPlay('championed')], ['Veteran ⭐', tfPlay('veteran')], ['Enraged 💢', tfPlay('enraged')], ['Matured 🌾', tfPlay('matured')],
   ['All five side by side', async c=>{ matchWith(c); const ws = [c.mineW[0], c.mineW[1], c.mineW[2], c.foeW[0], c.foeW[1]], names = ['gilded', 'championed', 'veteran', 'enraged', 'matured'];
     ws.forEach((w, i)=>{ w.classList.add('tf-on', 'tf-' + names[i]); if(names[i] === 'gilded') w.insertAdjacentHTML('beforeend', TR_SHEEN); }); await c.wait(2600); }]],
  {sig:'trTransformVfx({name})'});

// -- UI3: the Shield on the battlefield bars
const hqOf = (hp, layers, sh)=> ({hp, maxHp:40, shield: sh == null ? layers.reduce((a, b)=> a + b, 0) : sh, maxShield: layers.reduce((a, b)=> a + b, 0), shieldLayers: layers});
function barsMatch(c, a, b){ const m = c.match(); m.players = {1:{hand:[], hq:a}, 2:{hand:[], hq:b}}; m.sideOf = pid=> pid === 1 ? 'A' : 'B'; return m; }
const shieldFill = (side, layers)=> async c=>{
  const a = hqOf(40, side === 'A' ? layers : []), b = hqOf(40, side === 'B' ? layers : []); a.maxHp = b.maxHp = 40;
  barsMatch(c, a, b); await c.wait(250); ribbonShieldSync(side); await c.wait(3000);
};
const shieldBreak = (side, layers, to)=> async c=>{
  const hq = hqOf(40, layers), none = hqOf(40, []);
  const m = barsMatch(c, side === 'A' ? hq : none, side === 'B' ? hq : none); ribbonShieldSync(side); await c.wait(layers.length * 700 + 1500);
  hq.shield = to; ribbonShieldSync(side); await c.wait(1500);
};
add('ui3', 'ui3-fill', 'Shield layers fill the Health bar', 'the battlefield\'s Health bars while a bramble has a Shield (ribbonShieldSync: a raid\'s Shield 50, Skirmish Armour, a dungeon wave)',
  'Each Shield layer is a full-length blue overlay on the bar, layer 2 over layer 1. They fill in slowly, lowest first; the next starts when the one below is half full.',
  [['Shield 50 (one layer)', shieldFill('B', [50])], ['Three layers (30, 20, 10)', shieldFill('B', [30, 20, 10])], ['Your bar (two layers)', shieldFill('A', [24, 16])]],
  {stage:'bars', sig:'ribbonShieldSync("A" | "B")'});
add('ui3', 'ui3-break', 'A Shield layer breaks', 'a hit spending a Shield layer (ribbonShieldSync, ribShieldBreakVfx on the Health bar)',
  'The top layer is spent first. When one reaches 0 a jagged white crack runs across the bar at its edge, with a flash and shards in the layer\'s colour thrown away from the bar.',
  [['Top layer breaks (their bar)', shieldBreak('B', [30, 20], 25)], ['Your bar (shards go up)', shieldBreak('A', [30, 20], 25)], ['All gone', shieldBreak('B', [30, 20, 10], 0)]],
  {stage:'bars', sig:'ribShieldBreakVfx(rib, track, k, atFrac)'});
add('ui3', 'ui3-hp', 'Shielded Health is blue', 'a unit that has a Shield (class has-shield on the board card, updateCardHpDisplay)',
  'While a unit has a Shield its Health number and badge are blue with a soft glow; when the Shield is gone it turns back.',
  [['Shielded units', async c=>{ [...c.mineW, ...c.foeW].forEach(w=> w.classList.add('has-shield')); await c.wait(1800); }],
   ['Shield breaks', async c=>{ const ws = c.mineW; ws.forEach(w=> w.classList.add('has-shield')); await c.wait(1200); ws.forEach(w=>{ w.classList.remove('has-shield'); try{ if(typeof shakeEl === 'function') shakeEl(w); }catch(e){} }); await c.wait(900); }]],
  {sig:'.board-card.has-shield .stats .hp'});

// -- EL: the ten element attack plates
const ELEMS = [['heat', 'Fire'], ['cold', 'Ice'], ['acid', 'Acid'], ['poison', 'Poison'], ['decay', 'Decay'], ['magic', 'Magic'], ['water', 'Water'], ['stone', 'Stone'], ['metal', 'Metal'], ['shock', 'Lightning']];
function plate(tile, key, name, eff, base){
  const d = {dmgType:key}, a = tile && tile.querySelector('.stats .atk'); if(!a) return;
  a.className = 'atk' + atkPlateCls(d); a.innerHTML = atkLabelHTML(eff, base == null ? eff : base, d);
  const nm = tile.querySelector('.nm'); if(nm && name) nm.textContent = name;
}
function gallery(c, list, eff, base){
  const rows = [list.slice(0, Math.ceil(list.length / 2)), list.slice(Math.ceil(list.length / 2))].filter(r=> r.length);
  c.tab.arena.classList.add('lab2-gal'); // up to five cards a row: smaller tiles (CSS)
  c.arenaHTML(rows.map((r, ri)=> `<div class="sk-row ${ri ? 'sk-mine' : 'sk-enemy'}">${r.map(([k], i)=> L.wrapHTML('common', 9300 + ri * 10 + i, 'lab-el-' + k)).join('')}</div>`).join(''));
  const ws = $$('.board-card', c.tab.arena); list.forEach(([k, nm], i)=> plate($('.card-tile', ws[i]), k, nm, typeof eff === 'function' ? eff(i) : eff, typeof base === 'function' ? base(i) : base));
}
add('el', 'el-plates', 'Element attack plates', 'the attack number on every card tile (cardTileHTML / updateCardAtkDisplay: atkPlateCls, atkGlyphOf)',
  'A swing that deals an element shows that element\'s symbol on a tinted plate in place of the sword: 🔥 Fire, ❄️ Ice, 🧪 Acid, ☠️ Poison, 🍂 Decay, 🪄 Magic, 💧 Water, 🪨 Stone, ⚙️ Metal, ⚡ Lightning. Physical keeps ⚔.',
  [['All ten', c=> { gallery(c, ELEMS, 4); return c.wait(1800); }], ['Fire (the BX flame)', c=> { gallery(c, [ELEMS[0], ELEMS[5], ELEMS[9]], 5); return c.wait(1800); }],
   ['Buffed (1.5x to 4x)', c=> { gallery(c, [ELEMS[0], ELEMS[0], ELEMS[0], ELEMS[0], ELEMS[0]], i=> [4, 6, 8, 10, 14][i], 4); return c.wait(1800); }]],
  {sig:'atkPlateCls(d) + atkLabelHTML(eff, base, d)'});

// -- RK: the total raid rank
const RANKS = [800, 1500, 3000, 5000, 7000, 9000, 15000, 20000, 25000, 30000];
function rankRow(c, totals, opts){
  c.arenaHTML(`<div class="lab2-rank">${totals.map(t=> `<div class="lab2-rank-cell">${raidTotalRankBadgeHTML(t, opts)}<small>${t.toLocaleString('en')}</small></div>`).join('')}</div>`);
}
add('rk', 'rk-badge', 'Total raid rank badge', 'the Raid hub, the raid fight\'s result and the claim screen (raidTotalRankBadgeHTML, RaidM.raidTotalRank)',
  '"Raid rank F" to "Raid rank U" from your total raid damage, in the fight-rank badge\'s style; each rung is a bit richer. U has a violet sheen that moves.',
  [['F to A', c=> { rankRow(c, RANKS.slice(0, 6)); return c.wait(1600); }], ['S to U (U sheens)', c=> { rankRow(c, RANKS.slice(6)); return c.wait(2400); }], ['No rank yet', c=> { rankRow(c, [0, 400], {none:true}); return c.wait(1400); }]],
  {sig:'raidTotalRankBadgeHTML(total, {none})'});
add('rk', 'rk-stamp', 'Rank stamps in on the claim screen', 'the raid claim screen, after the damage counts up (FX.F raidClaimScreen: total rank stamp, a U rings violet)',
  'The badge slams down from 2.2x to 1x with a clang and a gold ring (a U: a violet ring and a star burst).',
  [['Rank A', c=> stamp(c, 9500)], ['Rank U', c=> stamp(c, 31000)]], {sig:'gsap scale 2.2 -> 1, ring, burst'});
async function stamp(c, total){
  c.arenaHTML(`<div class="lab2-rank lab2-rank-one"><div class="lab2-rank-cell">${raidTotalRankBadgeHTML(total)}</div></div>`);
  const b = $('.raid-total-rank', c.tab.arena); if(!b) return; const u = b.classList.contains('is-u');
  if(!hasGsap() || reduced()) return c.wait(800);
  gsap.set(b, {opacity:0, scale:2.2}); await c.wait(500);
  gsap.to(b, {opacity:1, scale:1, duration:.26, ease:'power4.in'});
  await c.wait(280); snd('clang');
  const r = b.getBoundingClientRect(), ring = document.createElement('div'); ring.className = 'lab2-ring'; ring.setAttribute('aria-hidden', 'true');
  ring.style.cssText = `left:${r.left + r.width / 2}px; top:${r.top + r.height / 2}px; border-color:${u ? '#c9a2ff' : '#ffd56e'}`; document.body.appendChild(ring);
  gsap.fromTo(ring, {scale:.3, opacity:.95}, {scale:Math.max(1.6, r.width / 36), opacity:0, duration:.5, ease:'power2.out', onComplete:()=> ring.remove()});
  if(u){ for(let i = 0; i < 12; i++){ const s = document.createElement('div'); s.className = 'lab2-star'; s.textContent = '✦'; s.style.cssText = `left:${r.left + r.width / 2}px; top:${r.top + r.height / 2}px`; document.body.appendChild(s);
      const a = i / 12 * Math.PI * 2; gsap.to(s, {x:Math.cos(a) * 46, y:Math.sin(a) * 30, opacity:0, scale:.4, duration:.7, ease:'power1.out', onComplete:()=> s.remove()}); } }
  await c.wait(1200);
}

// -- BX: the Archer's stone drop
add('bx', 'bx-stone', 'Archer drops a stone', 'Stonedrop Vulture\'s Archer 3 (effects.archerStyle "drop": bxDropStone in the arrow\'s place)',
  'The card rises and flies over its target, a stone falls onto it for the arrow\'s hit, and the card flies back home.',
  [['At a foe', async c=>{ matchWith(c); await c.wait(250); bxDropStone(c.mineW[1], c.foeW[1], 320, 260); await c.wait(1700); }], ['At the Bramble', async c=>{ matchWith(c); await c.wait(250); bxDropStone(c.mineW[2], c.castleW, 320, 260); await c.wait(1700); }]],
  {sig:'bxDropStone(shooter, target, outMs, fallMs)'});

// -- FG: Forge centre stage and the hatch
function fuseHTML(){
  const chip = k=> `<span class="fg-fuse-chip" style="--k:${k}">${L.tileHTML('common')}</span>`;
  return `<div class="anvil-stage fg-fuse-stage" id="anvilStage"><div class="forge-glow" aria-hidden="true"></div><div class="fg-fuse-pile" aria-hidden="true">${[0, 1, 2, 3, 4].map(chip).join('')}</div><span class="fg-fuse-arrow" aria-hidden="true">➜</span><div class="forge-preview-wrap">${L.tileHTML('rare')}</div></div>`;
}
add('fg', 'fg-fuse', 'Fuse: spares fly into the card', 'Forge, Fuse tab, pressing Fuse (forgeFuse: forgeCentreStage + fuseStageAnimation)',
  'The anvil stage lifts to the middle of the screen over a dimmed spotlight; the spare copies fly into the card one after another, it takes a hit each time and glows, a LEVEL burst shows, and the stage flies home.',
  [['Fuse 5 spares', async c=>{ c.arenaHTML(`<div class="lab2-forge">${fuseHTML()}</div>`); await c.wait(300);
      await forgeCentreStage(()=> fuseStageAnimation(5), {burst:{kind:'levelUp', text:T('ui.fg-fuse-burst', {dust:120})}, hold:700}); }],
   ['Fuse 2 spares', async c=>{ c.arenaHTML(`<div class="lab2-forge">${fuseHTML()}</div>`); await c.wait(300);
      await forgeCentreStage(()=> fuseStageAnimation(2), {burst:{kind:'levelUp', text:T('ui.fg-fuse-burst', {dust:48})}, hold:700}); }]],
  {sig:'forgeCentreStage(run, {burst, hold})'});
function reinforceHTML(lv){
  return `<div class="fg-rf"><div class="fg-rf-stage" id="rfStage"><div class="fg-rf-glow" aria-hidden="true"></div><div class="fg-rf-big">${L.tileHTML('castle')}</div><span class="fg-rf-lv">${T('ui.nf-copy-level', {n:lv})}</span></div></div>`;
}
add('fg', 'fg-reinforce', 'Reinforce: stones drop onto the Bramble', 'Forge, Reinforce tab, pressing Reinforce (forgeReinforce: forgeCentreStage + reinforceStageAnimation)',
  'The Bramble\'s stage lifts to the middle of the screen; a course of new stones drops onto its edges with dust puffs and a small thud each, the tile settles at its new level, a LEVEL burst shows, and it flies home.',
  [['Reinforce to Level 5', async c=>{ c.arenaHTML(`<div class="lab2-forge">${reinforceHTML(4)}</div>`); await c.wait(300);
      await forgeCentreStage(()=> reinforceStageAnimation(L.tileHTML('castle'), T('ui.nf-copy-level', {n:5})), {el:document.getElementById('rfStage'), burst:{kind:'levelUp', text:T('ui.fg-rf-burst', {n:5})}, hold:800}); }]],
  {sig:'forgeCentreStage(run, {el: #rfStage})'});
function craftHTML(){
  return `<div class="fg-raid"><div class="fg-rv" id="raidViewer"><div class="fg-rv-spot" aria-hidden="true"></div><div class="fg-rv-float"><div class="fg-rv-card is-foil"><div class="fg-rv-face fg-rv-front">${L.tileHTML('epic')}</div><div class="fg-rv-face fg-rv-back" aria-hidden="true"><span class="bw-back bk-unit"></span></div><span class="fg-rv-glare" aria-hidden="true"></span></div></div></div></div>`;
}
add('fg', 'fg-craft', 'Raid Craft: shards stream into the card', 'Forge, Raid tab, pressing Craft (forgeRaidCraft: forgeCentreStage + raidCraftAnimation)',
  'The card viewer lifts to the middle of the screen; eight trophy shards stream in from a ring, the card flares bright with a clang, a LEVEL burst shows, and the viewer flies home.',
  [['Craft', async c=>{ c.arenaHTML(`<div class="lab2-forge">${craftHTML()}</div>`); await c.wait(300); const v = document.getElementById('raidViewer');
      await forgeCentreStage(()=> raidCraftAnimation(v, {shardIcon:'🏆'}), {el:v, burst:{kind:'levelUp', text:T('ui.fg-raid-burst')}, hold:650}); }]],
  {sig:'forgeCentreStage(run, {el: #raidViewer})'});
add('fg', 'fg-hatch', 'Hatching: the egg opens in close-up', 'Nest, an egg hatching (hatchRevealVfx; the glow through the cracks shows the rarity)',
  'The egg rocks three times, harder each time, cracks spreading with light leaking through (warm white Common, green sparks Uncommon, blue rays Rare); it turns to light, beams pour out, a white flash, and the card rises close up.',
  [['Rare', ()=> { hatchRevealVfx('lab-hatchling', '🥚'); return L.sleep(5200); }], ['Uncommon', ()=> { hatchRevealVfx('lab-hatch-uncommon', '🥚'); return L.sleep(5200); }], ['Common', ()=> { hatchRevealVfx('lab-hatch-common', '🥚'); return L.sleep(5200); }]],
  {sig:'hatchRevealVfx(defId, eggIcon)'});
add('fg', 'fg-hatch-board', 'An egg hatches on the board', 'a hatching unit in a fight (engine event hatch, renderVfxForEvent)',
  'A crack mark and shell bits burst from the egg unit; "🐣 Hatched!" floats, and the new unit pops in from small and faint.',
  [['Hatch', async c=>{ matchWith(c); const w = c.mineW[1], uid = uidOf(c, w); await c.wait(300);
      const r = w.getBoundingClientRect(); eggCrackVfx(r.left + r.width / 2, r.top + r.height / 2);
      w.innerHTML = L.tileHTML('uncommon'); const el = boardCardEl(uid);
      try{ floatText(el, '🐣 Hatched!', ''); }catch(e){} el.classList.add('egg-hatched'); setTimeout(()=> el.classList.remove('egg-hatched'), 800);
      if(hasGsap() && !reduced()) gsap.fromTo(el, {scale:.4, opacity:.2}, {scale:1, opacity:1, duration:.5, ease:'back.out(2)', clearProps:'transform,opacity'});
      snd('unlockChime'); await c.wait(1500); }]],
  {sig:'eggCrackVfx(x, y) + floatText 🐣 + pop'});

// -- CB: the Galactic Condor's Position Beam (package CB, 2026-10-22; the beam itself is package EE, 2026-10-19)
// The game: the engine's {type:'positionBeam'} event reaches renderVfxForEvent, which floats "🌈 Position Beam" and calls positionBeamVfx(ev): the
// Condor's inner .card-tile rears / banks / swings round on GSAP transforms, then settles back (clearProps). The event holds the replay for
// ev._pbMs so the first hit's bolt (lightningBoltOf / drawLightningBolt, one hit every 640 ms, nearest first) is drawn as the pose is reached.
// This stand-in plays the same calls on a field of five columns (the game's edge is five columns out; the Lab row is five wide, so the leftmost
// or rightmost card plays the edge). Effects Low / reduced motion: positionBeamVfx returns at once (no manoeuvre) and the beam is as before.
function beamField(c, o){
  c.tab.arena.classList.add('lab2-gal');
  const n = o.n || 5, row = (cls, ws)=> `<div class="sk-row ${cls}">${ws.join('')}</div>`;
  const foe = Array.from({length:n}, (_, i)=> L.wrapHTML(o.down && i === o.at ? 'rare' : (i % 2 ? 'uncommon' : 'common'), 9400 + i, o.down && i === o.at ? 'galactic-condor' : 'lab-beam-foe'));
  const mine = Array.from({length:n}, (_, i)=> L.wrapHTML(!o.down && i === o.at ? 'rare' : 'common', 9410 + i, !o.down && i === o.at ? 'galactic-condor' : 'lab-beam-ally'));
  c.arenaHTML((o.castle ? row('sk-enemy', [L.wrapHTML('castle', 9499, 'castle')]) : '') + row('sk-enemy', foe) + row('sk-mine', mine));
  const cw = boardCardEl((o.down ? 9400 : 9410) + o.at), nm = cw && cw.querySelector('.card-tile .nm'); if(nm) nm.textContent = 'Galactic Condor';
  return (o.down ? 9400 : 9410) + o.at;
}
async function condorBeam(c, o){
  const uid = beamField(c, o), tbase = o.down ? 9410 : 9400, tsd = o.down ? 'A' : 'B', sd = o.down ? 'B' : 'A';
  c.match(); await c.wait(450);
  const targets = (o.hits || []).map(i=> tbase + i);
  const ev = {type:'positionBeam', side:sd, targetSide:tsd, uid, defId:'galactic-condor', lane:o.lane, col:o.col, amount:3, targetUids:targets, hq:!!o.hq};
  try{ floatText(boardCardEl(uid), '🌈 ' + T('ui.act-position-beam') + ' 3', 'gold'); }catch(e){}
  const ms = o.low ? 0 : positionBeamVfx(ev); // the game's call: 0 at Effects Low and under reduced motion
  await c.wait(ms || 150);
  const list = targets.map(u=> ({u})).concat(o.hq ? [{hq:true}] : []);
  for(const h of list){
    const hit = h.hq ? {type:'hitHQ', ranged:true, positionBeam:o.lane, attUid:uid, side:sd, targetSide:tsd, dmg:3} : {type:'hit', ranged:true, positionBeam:o.lane, attUid:uid, targetUid:h.u, side:sd, targetSide:tsd, dmg:3};
    const b = lightningBoltOf(hit); if(!b){ await c.wait(640); continue; }
    drawLightningBolt(hit);
    const t = h.hq ? hqTileEl('B') : boardCardEl(h.u);
    setTimeout(()=>{ try{ floatText(t, '-3', 'dmg'); if(typeof shakeEl === 'function') shakeEl(t); }catch(e){} }, b.ms);
    await c.wait(640);
  }
  await c.wait(1200);
}
add('cb', 'cb-condor', 'Galactic Condor turns to fire its Position Beam', 'the Galactic Condor\'s Charge in a fight (engine event positionBeam: renderVfxForEvent calls positionBeamVfx, then the hits draw the beam, lightningBoltOf)',
  'Before it fires, the Condor takes up the stance for where it stands. Centre: it rears up (stretches tall, tips back), then dips its head forward and aims straight across; the beam hits the unit across and the Bramble. Side: it banks and turns toward the angle it fires at, with a small lift and a gentle sway; the beam hits the units diagonally across. Edge: it coils, then swings right round to face along the row and keeps turning as the beam sweeps across, nearest first. Then a recoil as it fires, and it settles back exactly into its slot. Transforms on the card only (no filter, no blend layer); a rising whoosh and hum. Effects Low and reduced motion: no manoeuvre, just the beam.',
  [['Centre', c=> condorBeam(c, {n:3, at:1, castle:true, lane:'centre', col:0, hits:[1], hq:true})],
   ['Side (from the right)', c=> condorBeam(c, {at:4, lane:'side', col:2, hits:[3, 2]})],
   ['Side (from the left)', c=> condorBeam(c, {at:0, lane:'side', col:-2, hits:[1, 2]})],
   ['Edge (left, sweeps right)', c=> condorBeam(c, {at:0, lane:'edge', col:-5, hits:[1, 2, 3, 4]})],
   ['Edge (right, sweeps left)', c=> condorBeam(c, {at:4, lane:'edge', col:5, hits:[3, 2, 1, 0]})],
   ['Enemy Condor (fires down)', c=> condorBeam(c, {at:4, down:true, lane:'side', col:2, hits:[3, 2]})],
   ['Effects Low (beam only)', c=> condorBeam(c, {at:4, lane:'side', col:2, hits:[3, 2], low:true})]],
  {sig:'positionBeamVfx(ev) + lightningBoltOf(hit) + drawLightningBolt(hit)'});

// -- FX4 (2026-10-23): Scorched Ground's boil under one unit a side, and Wildfire Front, the line of fire as its own field effect
// The game: the upkeep's 'scorched' event reaches renderVfxForEvent, which calls groundBoilVfx(ev) (a lava pool opens under the card, bubbles,
// a heat haze, then DN's 🔥1); 'wildfireSweep' then one 'wildfire' event a unit call scorchSweepVfx(ev) (FX.B.wildfire crosses the field, each
// card's 🔥1 floats as the band reaches its middle). The stand-in lends the Lab's field the battlefield's id for the length of the play
// (scorchSweepVfx measures #battlefieldEl), the same calls in the same order.
// a checkout whose .fxcat/fx-src.js lacks DN's number (dnFloat): a plain fire number in its place, so the entries still read
function labFireNumber(){ if(typeof window.dnFloat === 'function') return;
  window.dnFloat = (el, d)=>{ if(!el) return; if(typeof window.floatText === 'function') return window.floatText(el, '🔥' + d, 'heat');
    const s = document.createElement('div'); s.textContent = '🔥' + d; s.style.cssText = 'position:absolute; left:50%; top:30%; transform:translateX(-50%); z-index:5; font:900 22px/1 "Baloo 2", system-ui, sans-serif; color:#ffb02e; text-shadow:0 2px 3px #000; pointer-events:none; transition:top 1s ease-out, opacity 1s ease-in;';
    el.appendChild(s); requestAnimationFrame(()=> requestAnimationFrame(()=>{ s.style.top = '-12%'; s.style.opacity = '0'; })); setTimeout(()=> s.remove(), 1150); }; }
async function withBattlefield(c, run){
  const a = c.tab.arena, was = a.id; let other = document.getElementById('battlefieldEl'); if(other && other !== a) other.id = 'battlefieldEl-lab-off'; else other = null;
  a.id = 'battlefieldEl'; try{ await run(); } finally { a.id = was; if(other) other.id = 'battlefieldEl'; }
}
async function boilPlay(c, which){
  labFireNumber(); matchWith(c); await c.wait(300);
  const ws = which === 'both' ? [c.foeW[1], c.mineW[2]] : [c.foeW[2]];
  ws.forEach((w, i)=>{ try{ groundBoilVfx({type:'fieldTick', field:'scorched', uid:uidOf(c, w), dmg:1, mods:[]}); }catch(e){} });
  await c.wait(2200);
}
async function wildfirePlay(c, o){
  labFireNumber();
  if(!('scorchSweepNow' in window)) window.scorchSweepNow = null; // the game's `let`, which the Lab's copied code assigns
  matchWith(c, {speedMult: (o && o.speed) || 1}); await c.wait(300);
  await withBattlefield(c, async ()=>{
    scorchSweepVfx({type:'fieldTick', field:'wildfireSweep', dmg:1});
    const cols = [...c.foeW, ...c.mineW].map(w=> ({w, x: w.getBoundingClientRect().left})).sort((a, b)=> a.x - b.x);
    cols.forEach(({w})=>{ try{ scorchSweepVfx({type:'fieldTick', field:'wildfire', uid:uidOf(c, w), dmg:1, mods:[]}); }catch(e){} });
    await c.wait(scorchSweepMs(window.matchState) + 1600);
  });
}
add('fx4', 'fx4-boil', 'Scorched Ground: the ground boils beneath the unit', 'Scorched Ground on the volcano maps\' big fights: one random unit a side each round from round 2 (engine field \'scorched\', renderVfxForEvent calls groundBoilVfx)',
  'A pool of glowing lava opens at the chosen card\'s foot, six bubbles rise and pop, a little heat haze lifts, the card flinches and its 🔥1 floats as the boil peaks. One unit a side, so two pools a round. Effects Low / reduced motion: no pool, the number alone.',
  [['One unit a side', c=> boilPlay(c, 'both')], ['One unit', c=> boilPlay(c, 'one')]],
  {sig:'groundBoilVfx(ev)', inGame:true});
add('fx4', 'fx4-wildfire', 'Wildfire Front: the line of fire, one card at a time', 'the Wildfire Front field effect (rules.wildfire: 14-6 Jaguar Run on the Savanna Reaches, 20-8 The Iron Cataphract on the Sundered Peak; Edit skirmish); engine fieldTick \'wildfireSweep\' then \'wildfire\', renderVfxForEvent calls scorchSweepVfx',
  'From round 2, every round, a flame band (FX.B.wildfire) crosses the battlefield from left to right in 1.6 s; every unit on both front lines takes 1 fire, and each card\'s 🔥1 floats as the band reaches its middle, so the damage lands one card after another. Fire-resistant units (Lava Waders) and Mountain Climbers are passed by. Faster at 2x / 5x; Effects Low / reduced motion: no band, the numbers at once.',
  [['Play', c=> wildfirePlay(c)], ['At 2x', c=> wildfirePlay(c, {speed:2})]],
  {sig:'scorchSweepVfx(ev) + FX.B.wildfire', inGame:true});

L.mount({
  id:'built', title:'Built 10-21 to 10-23', pill:['live', 'New'],
  sub:'Everything built on 2026-10-21 and 2026-10-22 that the Lab did not show yet, played with the game\'s own code. Every entry says where it shows up in the game. The field stays pinned at the top while you scroll; pick any button to play it there.',
  chips:[['ev', 'Evolute'], ['mt', 'Mimic'], ['tr', 'Crown and Transforms'], ['ui3', 'Shield bars'], ['el', 'Element plates'], ['rk', 'Raid rank'], ['bx', 'Archer'], ['fg', 'Forge and hatch'], ['cb', 'Condor beam'], ['fx4', 'Ground fire']],
  groups:[
    {key:'ev', title:'Evolute (package EV)', tag:'Evolute', tone:'evo'},
    {key:'mt', title:'Mimic (package MT)', tag:'Mimic', tone:'evo'},
    {key:'tr', title:'Crown and Transforms (package TR)', tag:'TR', tone:'game'},
    {key:'ui3', title:'Shield on the battlefield bars (package UI3)', tag:'UI3', tone:'sky'},
    {key:'el', title:'Element attack plates (package EL)', tag:'EL', tone:'elem'},
    {key:'rk', title:'Total raid rank (package RK)', tag:'RK', tone:'raid'},
    {key:'bx', title:'Archer stone drop (package BX)', tag:'BX', tone:'war'},
    {key:'fg', title:'Forge centre stage and the hatch (package FG)', tag:'FG', tone:'forge'},
    {key:'cb', title:'Galactic Condor: Position Beam (package CB, 2026-10-22)', tag:'CB', tone:'sky'},
    {key:'fx4', title:'Scorched Ground and Wildfire Front (package FX4, 2026-10-23)', tag:'FX4', tone:'war'},
  ],
  entries:E,
});
})();
