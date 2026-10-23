// Package BV (2026-10-24): the battle-visual pass. Registered on the inventory ids of the effects it changed (the Lab only takes inventory
// ids), with the free letters beside the variants already there; their labels start "BV ·". Before / after for each effect it changed: the wind changing direction (owner 17:34 #1),
// the Flood rising with its own high side (17:01 #2), the bramble dropping into the ground (19:30), the Smoke Bomb and Smoke on a unit
// (19:39) and the river current at night (19:27 #20). Every "after" plays the game's own code: FX.B.windTurn, syncTideScene, FX.C.castleSink,
// FX.C.smokeBomb, FX.B.permaTide and the .smoke-overlay CSS. The "before" variants replay the old look where it still exists (windSwap,
// ProcFX.crumble, SkillFX.smokeBomb, FX.B.permaTide_A) or pin the old numbers on the same layer (the tide's 8deg tilt and 40px swell).
(function(){
const R = FXLAB.register, B = ()=> window.FX && window.FX.B, C = ()=> window.FX && window.FX.C, S = ()=> window.SkillFX || {}, P = ()=> window.ProcFX;
const until = (ctx, ms, start)=> new Promise(res=>{ let done = false; const fin = ()=>{ if(!done){ done = true; res(); } }; start(fin); ctx.wait(ms).then(fin); });
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;

// ---- the wind turns ----
R({id:'wt-wind-swap', stage:'board', inGameHook:'wind event from the other side → syncWindField (arena_app.js) → FX.B.windTurn on the standing SkillFX.windField layer',
  note:'2026-10-24 (BV, owner 17:34 #1: "Dont need to show that funny whirly doodle when the wind changes direction ... a few wind lines on screen shortening, then lengthening in the new direction"). A sets up a strong wind blowing north, then turns it.',
  variants:[
    {key:'B', label:'BV · Before: the swirl turns about, then a fresh gust', play:ctx=>{ const el = ctx.board.el; S().windField(el, 'strong', 'north');
      return ctx.wait(1600).then(()=>{ S().windFieldClear(el); return B().windSwap(el); }).then(()=>{ S().windField(el, 'strong', 'south'); return B().windGust(el, {from:'theirs'}); }).then(()=> ctx.wait(1400)).then(()=> S().windFieldClear(el)); }},
    {key:'C', label:'BV · After: a few of the lines on the board draw in, then out the other way', play:ctx=>{ const el = ctx.board.el; S().windField(el, 'strong', 'north');
      return ctx.wait(1600).then(()=> B().windTurn(el, {strength:'strong', dir:'south'})).then(()=> ctx.wait(1600)).then(()=> S().windFieldClear(el)); }},
    {key:'D', label:'BV · After, the soft breeze of a calm round turning (Windy maps)', play:ctx=>{ const el = ctx.board.el; S().windField(el, 'soft', 'south');
      return ctx.wait(2200).then(()=> B().windTurn(el, {strength:'soft', dir:'north'})).then(()=> ctx.wait(2200)).then(()=> S().windFieldClear(el)); }}]});

// ---- the Flood comes in ----
const hasTide = ()=> typeof syncTideScene === 'function' && typeof tideSceneSet === 'function';
function clearTide(bf){ const w = bf.querySelector(':scope > .tide-scene'); if(w) w.remove(); delete bf.dataset.tide; }
function rise(ctx, from, to, o){
  o = o || {}; const bf = ctx.board.el; if(!hasTide()) return ctx.wait(400);
  clearTide(bf); const m = {resolving:true, _tideScene: from === 'none' ? null : {k:from, from, at:0}};
  if(from !== 'none') syncTideScene(m);
  return ctx.wait(350).then(()=>{
    tideSceneSet(m, to); if(o.tilt != null && m._tideScene) m._tideScene.tilt = o.tilt; syncTideScene(m);
    const w = bf.querySelector(':scope > .tide-scene');
    if(w && o.old){ w.style.setProperty('--tw-skew', '8deg'); w.style.setProperty('--tw-origin', '100% 0'); w.style.setProperty('--tw-swell', '40px'); }
    return ctx.wait(5000); }).then(()=> clearTide(bf));
}
R({id:'wt-tide-flow', stage:'board', inGameHook:'tideWaveVfx → tideSceneSet (st.tilt = tideRiseTilt()) + syncTideScene (arena_app.js); .tide-scene CSS (--tw-origin, twSurge*)',
  note:'2026-10-24 (BV, owner 17:01 #2): no arrival swell (the front wave no longer dips back into view below the top border and out again), a gentler crest, and a Flood picks its high side: a tilt in [-10, 10] deg (+ the left leads, - the right, ~0 the middle). An Ebb leans by at most 10 px end to end. (The crest\'s surge keyframes are the new ones in every variant: the stylesheet is shared.)',
  variants:[
    {key:'C', label:'BV · Before: Ebb to Flood, 8deg from the left, the 40px swell at the top', play:ctx=> rise(ctx, 'ebb', 'flow', {old:true})},
    {key:'F', label:'BV · After: Ebb to Flood, a random high side', play:ctx=> rise(ctx, 'ebb', 'flow')},
    {key:'G', label:'BV · After: the left leads (+10deg)', play:ctx=> rise(ctx, 'ebb', 'flow', {tilt:10})},
    {key:'H', label:'BV · After: the right leads (-10deg)', play:ctx=> rise(ctx, 'ebb', 'flow', {tilt:-10})}]});

// ---- the bramble falls ----
const restoreCastle = t=>{ const g = window.gsap; t = tileOf(t); if(g && t){ g.set(t, {clearProps:'opacity,visibility,transform,clipPath,filter'}); g.fromTo(t, {opacity:0}, {opacity:1, duration:.3}); } if(t) t.classList.remove('castle-fallen', 'is-crumbled'); };
R({id:'castle-crumble', stage:'board', inGameHook:'resolveRound end: castleCrumble(hqTileEl(\'B\')) and the castleFallMine hook → FX.C.castleSink; showEndSign for a fall without its own; .castle-fallen keeps it down after',
  note:'2026-10-24 (BV, owner 19:30: "castle destruction consistent for both sides = drop-into-ground with dust (not crumbling); post-battle analysis must not show the castle back at 0 HP").',
  variants:[
    {key:'B', label:'BV · Before (theirs): the cellular crumble', play:ctx=>{ const t = tileOf(ctx.board.castleFoe); ctx.sound('castleCollapse');
      return until(ctx, 3600, fin=> P().crumble(t, {seed:'lab-castle', duration:1.8, onDone:()=> ctx.wait(500).then(fin)})).then(()=> restoreCastle(t)); }},
    {key:'C', label:'BV · Before (yours): the old sink', play:ctx=>{ ctx.sound('castleCollapse'); S().castleCrumble(ctx.board.castleMine, {variant:'sink', host:ctx.board.el, restore:true}); return ctx.wait(2600); }},
    {key:'D', label:'BV · After (theirs): it drops into the ground in a bank of dust', play:ctx=>{ ctx.sound('castleCollapse'); return C().castleSink(ctx.board.castleFoe, {host:ctx.board.el}).then(()=> ctx.wait(600)).then(()=> restoreCastle(ctx.board.castleFoe)); }},
    {key:'E', label:'BV · After (yours): the same fall', play:ctx=>{ ctx.sound('castleCollapse'); return C().castleSink(ctx.board.castleMine, {host:ctx.board.el}).then(()=> ctx.wait(600)).then(()=> restoreCastle(ctx.board.castleMine)); }},
    {key:'F', label:'BV · After the fight: the fallen bramble stays down (its spot and a mound of earth)', play:ctx=>{ const t = tileOf(ctx.board.castleFoe); t.classList.add('castle-fallen'); return ctx.wait(2500).then(()=> t.classList.remove('castle-fallen')); }}]});

// ---- Smoke Bomb and Smoke ----
R({id:'sk-smoke-bomb', stage:'board', inGameHook:'renderVfxForEvent smokeBomb → FX.C.smokeBomb (SkillFX.smokeBomb is the fallback)',
  note:'2026-10-24 (BV, owner 19:39: "improve the smoke bomb and smoke animations").',
  variants:[
    {key:'B', label:'BV · Before: a grey ball lobbed, seven puffs', play:ctx=>{ ctx.sound('boomerangWhirr'); S().smokeBomb(ctx.board.foe[1], ctx.board.mine[1], {}); return ctx.wait(1700); }},
    {key:'C', label:'BV · After: at an enemy (Blinded): a dark, heavy cloud', play:ctx=>{ ctx.sound('boomerangWhirr'); return C().smokeBomb(ctx.board.mine[1], ctx.board.foe[1], {effect:'blind', onImpact:()=> ctx.float(ctx.board.foe[1], '👁 Blinded', 'debuff')}).then(()=> ctx.wait(200)); }},
    {key:'D', label:'BV · After: at an ally (Smoke): a pale cloud it hides in', play:ctx=>{ ctx.sound('boomerangWhirr'); return C().smokeBomb(ctx.board.mine[0], ctx.board.mine[2], {effect:'smoke', onImpact:()=> ctx.float(ctx.board.mine[2], '🌫️ Smoke', 'buff')}).then(()=> ctx.wait(200)); }},
    {key:'E', label:'BV · After: it sniffs it off: a thin cloud, quickly gone', play:ctx=>{ ctx.sound('boomerangWhirr'); return C().smokeBomb(ctx.board.foe[0], ctx.board.mine[1], {effect:'none'}).then(()=> ctx.wait(200)); }}]});
const smokeOn = (el, html, cls)=>{ const t = tileOf(el); const o = document.createElement('div'); o.className = 'status-overlay smoke-overlay' + (cls ? ' ' + cls : ''); o.setAttribute('aria-hidden', 'true'); o.innerHTML = html; t.insertBefore(o, t.firstChild); return o; };
R({id:'st-smoke-apply', stage:'board', inGameHook:'updateCardStatusDisplay / boardCardHTML: .smoke-overlay with four billows (SMOKE_BILLOWS_HTML) while the unit has Smoke',
  note:'2026-10-24 (BV, owner 19:39): Smoke on a unit is four soft billows curling at their own paces, thickening in and thinning away; it was one blob sliding side to side.',
  variants:[
    {key:'B', label:'BV · Before: one grey blob drifting side to side', play:ctx=>{ const o = smokeOn(ctx.board.mine[1], ''); o.style.animation = 'smokeDrift 3.4s ease-in-out infinite'; o.style.background = 'radial-gradient(ellipse at 50% 55%, rgba(205,208,214,.62) 0, rgba(165,170,180,.42) 45%, rgba(140,146,156,0) 75%)'; return ctx.wait(5000).then(()=> o.remove()); }},
    {key:'C', label:'BV · After: the billows come in, curl, and lift', play:ctx=>{ const o = smokeOn(ctx.board.mine[1], '<i class="sb1"></i><i class="sb2"></i><i class="sb3"></i><i class="sb4"></i>', 'is-new');
      return ctx.wait(900).then(()=>{ o.classList.remove('is-new'); return ctx.wait(5200); }).then(()=>{ o.classList.add('is-lifting'); return ctx.wait(800); }).then(()=> o.remove()); }}]});

// ---- the river current (River Rapids: Always Flood) ----
R({id:'wt-perma-tide', stage:'board', inGameHook:'fxHook(\'matchUI\') with rules.permaTide → FX.B.permaTide',
  note:'2026-10-24 (BV, owner 19:27 #20, SS#5: "the water vfx at night, there are these lines across the screen. Blur them out, place them a bit more randomly, have slight variation in height (+ - 10%), and reduce their opacity by a lot!"). Dusk\'s shadow bars are 50% more transparent too (FX.B.dusk).',
  variants:[
    {key:'C', label:'BV · Before: one stripe pattern, evenly spaced bars', play:ctx=>{ const c = B().permaTide_A(ctx.board.el); return ctx.wait(4500).then(()=> B().permaTide_A(ctx.board.el, {off:true})); }},
    {key:'D', label:'BV · After: separate soft streaks, random places, heights x0.9-1.1, about a third as strong', play:ctx=>{ B().permaTide(ctx.board.el); return ctx.wait(4500).then(()=> B().permaTide(ctx.board.el, {off:true})); }},
    {key:'E', label:'BV · After, at dusk: the shadow bars at half strength', play:ctx=> B().dusk(ctx.board.el)}]});
})();
