// Lab demos for effects that already exist in the game (2026-10-15). They prove the FXLAB contract end to end:
// SkillFX on the board stage, ProcFX on the castle and the cards, foils on the cards stage, the map and pack stages
// with the game's own CSS, and one entry with three variants. Batch manifests (a.js … f.js) follow the same shape.
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX, P = ()=> window.ProcFX;
// A promise that settles when an effect calls back, or after `ms` as a fallback.
const until = (ctx, ms, start)=> new Promise(res=>{ let done = false; const fin = ()=>{ if(!done){ done = true; res(); } }; start(fin); ctx.wait(ms).then(fin); });
const hit = (ctx, el, t, cls)=>{ ctx.float(el, t, cls); };

// ---- SkillFX, board stage ----
R({id:'atk-arrow', stage:'board', inGameHook:'renderVfxForEvent → ranged hit (matchState.pendingArrow)', variants:[
  {key:'A', label:'Bow shot (live)', play:ctx=>{ const [m, f] = [ctx.board.mine, ctx.board.foe]; ctx.sound('bowDraw', false, 240);
    return until(ctx, 1800, fin=> S().bowShot(m[1], f[1], {draw:240, flight:260, onRelease:()=> ctx.sound('arrowLoose', false),
      onImpact:()=>{ ctx.sound('arrowThunk', false); hit(ctx, f[1], '-3'); ctx.wait(700).then(fin); }})); }}]});
R({id:'atk-fire-arrow', stage:'board', variants:[
  {key:'A', label:'Fire Arrow (live)', play:ctx=>{ const [m, f] = [ctx.board.mine, ctx.board.foe]; ctx.sound('bowDraw', true, 240);
    return until(ctx, 1900, fin=> S().bowShot(m[1], f[0], {fire:true, draw:240, flight:260, onRelease:()=> ctx.sound('arrowLoose', true),
      onImpact:()=>{ ctx.sound('arrowThunk', true); hit(ctx, f[0], '-5', 'heat'); ctx.wait(800).then(fin); }})); }}]});
R({id:'atk-volley', stage:'board', variants:[
  {key:'A', label:'One bow shot per arrow', play:ctx=>{ const m = ctx.board.mine, f = ctx.board.foe; ctx.sound('bowDraw', false, 240);
    S().volley(m[1], f, {draw:240, flight:300, onRelease:()=> ctx.sound('arrowLoose', false), onEachImpact:t=>{ ctx.sound('arrowThunk', false); hit(ctx, t, '-2'); }});
    return ctx.wait(1900); }}]});
R({id:'atk-backstab', stage:'board', variants:[
  {key:'A', label:'Dagger flash and slash', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('backstabSlice'); S().backstab(t, true); ctx.wait(170).then(()=> hit(ctx, t, '-6', 'crit')); return ctx.wait(1300); }}]});
R({id:'atk-boomerang-throw', stage:'board', variants:[
  {key:'A', label:'Out on a low curve, back on a high one', play:ctx=>{ const m = ctx.board.mine, t = ctx.board.foe[2]; ctx.sound('boomerangWhirr');
    S().boomerang(m[1], t, {flight:420, onImpact:()=>{ ctx.sound('hitAt', 3, false); hit(ctx, t, '-3'); }}); return ctx.wait(1500); }}]});
R({id:'sk-shield-up', stage:'board', variants:[{key:'A', label:'Shield dome', play:ctx=>{ ctx.sound('shield'); S().shieldUp(ctx.board.mine[2]); hit(ctx, ctx.board.mine[2], '💠 +2', 'blocked'); return ctx.wait(1300); }}]});
R({id:'sk-shield-call', stage:'board', variants:[{key:'A', label:'Shield drops into the slot', play:ctx=>{ ctx.sound('shieldDrop'); S().shieldDrop(ctx.board.mine[0]); return ctx.wait(1400); }}]});
R({id:'st-freeze-apply', stage:'board', variants:[{key:'A', label:'Ice block grows over the card', play:ctx=>{ ctx.sound('freezeChime'); S().freezeEncase(ctx.board.foe[1]); return ctx.wait(1700); }}]});
R({id:'st-sleep-apply', stage:'board', variants:[{key:'A', label:'Dims, sways, three Z’s', play:ctx=>{ ctx.sound('sleepTone'); S().sleepZzz(ctx.board.foe[2]); return ctx.wait(1800); }}]});
R({id:'st-stun-apply', stage:'board', variants:[{key:'A', label:'Stars wheel round its head', play:ctx=>{ ctx.sound('stunTone'); S().stunStars(ctx.board.foe[0]); return ctx.wait(1600); }}]});
// Three variants on one entry: what the "Variants to choose" view is for.
R({id:'sk-heal-generic', stage:'board', note:'Demo of the variants view: the number alone (now), rising pluses, or a knitting regen.', variants:[
  {key:'A', label:'Now: the number and a chime', play:ctx=>{ const t = ctx.board.mine[0]; ctx.sound('healTone'); hit(ctx, t, '+3', 'heal'); return ctx.wait(1100); }},
  {key:'B', label:'Green rings and rising pluses', play:ctx=>{ const t = ctx.board.mine[0]; ctx.sound('healTone'); S().heal(t); hit(ctx, t, '+3', 'heal'); return ctx.wait(1300); }},
  {key:'C', label:'Motes spiral in and knit it closed', play:ctx=>{ const t = ctx.board.mine[0]; ctx.sound('bloomTone');
    return until(ctx, 2200, fin=> S().regen(t, {onDone:()=>{ ctx.sound('healTone'); hit(ctx, t, '+3', 'heal'); ctx.wait(600).then(fin); }})); }}]});

// ---- castle: ProcFX and SkillFX on the enemy castle ----
const crack = n=> ctx=>{ const t = ctx.board.castleFoe; for(let k = 1; k <= n; k++) P().cracks(t, {seed:'lab-castle', stage:k, grow:k === n}); ctx.sound('siegeTone'); ctx.sound('hitAt', 6, true); return ctx.wait(1300); };
R({id:'castle-crack-1', stage:'board', note:'A: the live procedural cracks. B: the older CSS crack overlay, for comparison.', variants:[
  {key:'A', label:'Drunken-miner cracks (ProcFX)', play:crack(1)},
  {key:'B', label:'CSS crack overlay (older look)', play:ctx=>{ const t = ctx.board.castleFoe; if(!t.querySelector('.castle-cracks')) t.insertAdjacentHTML('afterbegin', '<div class="castle-cracks" aria-hidden="true"></div>');
    t.classList.remove('crack-0'); t.classList.add('crack-1'); ctx.sound('hitAt', 6, true); return ctx.wait(1200); }}]});
R({id:'castle-crack-2', stage:'board', variants:[{key:'A', label:'Second stage (ProcFX)', play:crack(2)}]});
R({id:'castle-crack-3', stage:'board', variants:[{key:'A', label:'Third stage (ProcFX)', play:crack(3)}]});
R({id:'castle-crumble', stage:'board', inGameHook:'castleCrumble(hqTileEl(\'B\')) at match end', variants:[
  {key:'A', label:'Cellular-automaton crumble (live)', play:ctx=>{ const t = ctx.board.castleFoe; ctx.sound('castleCollapse');
    return until(ctx, 3600, fin=> P().crumble(t, {seed:'lab-castle', duration:1.8, onDone:()=> ctx.wait(500).then(fin)})); }}]});
R({id:'castle-crumble-variants', stage:'board', variants:['collapse', 'sink', 'topple'].map((v, i)=> ({key:'ABC'[i], label:v[0].toUpperCase() + v.slice(1),
  play:ctx=>{ ctx.sound('castleCollapse'); S().castleCrumble(ctx.board.castleFoe, {variant:v, host:ctx.board.el, restore:false}); return ctx.wait(2600); }}))});

// ---- cards stage: ProcFX riffle, foils ----
R({id:'ui-deck-riffle', stage:'cards', variants:[{key:'A', label:'Flip riffle (ProcFX.flipShuffle)', play:ctx=> until(ctx, 3000, fin=> P().flipShuffle(ctx.root.querySelector('.fxl-cardrow'), {rounds:2, onEach:()=> ctx.sound('cardFlip'), onDone:fin}))}]});
const foil = cls=> ctx=>{ const ts = ctx.cards.slice(0, 3); ts.forEach(t=>{ t.className = t.className.replace(/\bholo-[\w-]+/g, '') + ' is-holo ' + cls; t.querySelectorAll('.holo-layer, .holo-glare, .holo-glitter, .foil-fx').forEach(x=> x.remove()); });
  try{ decorateHolo(ctx.root); }catch(e){} ctx.sound('rareRise', false); return Promise.all(ts.map((t, i)=> ctx.wait(i*180).then(()=> ctx.tilt(t, 2400)))); };
R({id:'foil-cosmos', stage:'cards', variants:[{key:'A', label:'Cosmos band with glitter', play:foil('holo-cosmos')}]});
R({id:'foil-aurora', stage:'cards', variants:[{key:'A', label:'Northern-lights curtains', play:foil('holo-aurora')}]});
R({id:'foil-old', stage:'cards', variants:[{key:'A', label:'Cards of old (ProcFX.decorateOld)', play:foil('holo-old')}]});

// ---- map, pack and UI stages, with the game's own CSS ----
R({id:'map-nodes-drop', stage:'map', variants:[{key:'A', label:'Fights drop in from the sky', play:ctx=>{ const ns = ctx.map.nodeList;
  ns.forEach((n, i)=>{ n.style.setProperty('--drop-i', i); n.classList.add('map-drop-wait'); });
  return ctx.wait(250).then(()=>{ ns.forEach(n=>{ n.classList.remove('map-drop-wait'); n.classList.add('map-drop'); }); ctx.sound('pawnStep'); return ctx.wait(1800); }); }}]});
R({id:'pack-deal', stage:'pack', variants:[{key:'A', label:'Cards deal out face down, then flip', play:async ctx=>{ ctx.sound('tapeRip'); await ctx.wait(500); await ctx.pack.deal(); ctx.sound('cardFlip');
  await ctx.wait(1100); for(let i = 0; i < ctx.pack.cards.length; i++){ ctx.pack.flip(i); ctx.sound('cardFlip'); await ctx.wait(650); } await ctx.wait(500); }}]});
// A full-screen moment: the game draws it over the whole window, so in the lab it covers the page too (the screen stage stays behind it).
R({id:'ui-pixel-reveal', stage:'screen', variants:[{key:'A', label:'Dissolving grid of dark squares (live)', play:ctx=>{ if(typeof pixelReveal === 'function') pixelReveal(700); return ctx.wait(1200); }}]});
R({id:'ui-toast', stage:'ui', variants:[{key:'A', label:'Toast (live)', play:ctx=>{ ctx.ui.toast('⭐ Level 7! New cards in the Shop.'); ctx.sound('gold'); return ctx.wait(2400); }}]});
})();
