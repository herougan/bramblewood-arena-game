// Package FX9 (2026-11-13): the owner's 23:47 notes, registered on the inventory ids they change (variant keys FX9, FX9A-FX9D, FX9P, FX9S; labels start "FX9 ·").
// Each plays the game's own code (arena_app.js: fx9AmbushVfx, fx9ShellBreakVfx, fx9DragonArrive, fx9StampedeVfx, fx9GuardSync, FX9_ZZZ_HTML,
// ui16PitchToGrave; bramblewood-fx-b.js dawnDraw) and the game's CSS (.fx9-*, .guard-down, .gp-rise / .gp-fall in arena_template.html).
// In a fight these replace FX.A.ambushStrike / shellCrack / stampede and FX.C.dragonArrive (fx9PatchFx); the Lab's older variants keep the old looks.
//   #1 Dawn's rosy light 10% fainter                     wt-dawn-draw
//   #5 Guardian plates only while it can guard          atk-guardian-redirect
//   #6 Ambush drawn inside its card; the camera follows  atk-ambush, atk-swarm (FX9-pan)
//   #7 A pitched card travels into the Graveyard         ui-pitch
//   #8 Sleep: blue Zs out of the top-right corner        st-sleep-active
//   #14 Shell breaks: a tortoise carapace cracks apart   sk-shell-down
//   #15 Dragon arrives: four flights                     sum-dragon
//   #17 Stampede runs straight at the Health bar         atk-overwhelm-hq
(function(){
const R = FXLAB.register, W = window, has = n=> typeof W[n] === 'function', foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const need = n=>{ if(!has(n)) console.error('[FXLAB] fx9: ' + n + ' is missing from the game source'); return has(n); };
const PLATES = '<span class="guard-plates" aria-hidden="true"><i class="gp-l"></i><i class="gp-r"></i></span>';
R({id:'wt-dawn-draw', stage:'board', variants:[
  {key:'FX9', label:'FX9 · The rosy light 10% fainter (peaks at .9), the decks’ flash 1.4 (was 1.45)', play:ctx=> W.FX && W.FX.B ? W.FX.B.dawnDraw(ctx.board.el) : ctx.wait(400)}]});
// #5: a Guardian that can't guard folds its plates away; when it is Ready again they swing back out
const guardDemo = down=> async ctx=>{ if(!need('fx9GuardSync')) return; LabGame.match(ctx); const el = mine(ctx, 1), uid = LabGame.uid(el) || 'g1';
  el.classList.add('has-guard'); el.insertAdjacentHTML('beforeend', PLATES); fx9GuardSync(el, {uid}); await ctx.wait(900);
  fx9GuardSync(el, Object.assign({uid}, down)); await ctx.wait(1400); fx9GuardSync(el, {uid}); await ctx.wait(1200); };
R({id:'atk-guardian-redirect', stage:'board', note:'FX9 #5: the engine only lets a Ready Guardian step in (ENG9); the plates now say so (boardCardHTML fx9GuardCls, fx9GuardSync from updateCardStatusDisplay / updateCardWaitDisplay / the ready event).', variants:[
  {key:'FX9', label:'FX9 · Plates only while it can guard: it gains Wait, they fold in behind the card; Ready, they swing back out', play:guardDemo({wait:1})},
  {key:'FX9S', label:'FX9 · The same for a Stunned Guardian', play:guardDemo({stunned:true})}]});
// #6: Ambush inside the card; and a camera pan during it, to show nothing is left behind
const pan = (ctx, at)=>{ const inn = ctx.root.querySelector('#battlefieldInner'); if(inn && inn.animate) setTimeout(()=> inn.animate([{translate:'0 0'}, {translate:'70px 0', offset:.4}, {translate:'70px 0', offset:.6}, {translate:'0 0'}], {duration:1100, easing:'ease-in-out'}), at); };
R({id:'atk-ambush', stage:'board', variants:[
  {key:'FX9', label:'FX9 · Drawn inside the ambusher’s card: shadow, blinking eyes, smoke, a slash; the echo rings on its pip', play:ctx=>{ if(!need('fx9AmbushVfx')) return; const a = mine(ctx, 2), t = foe(ctx, 2); ctx.sound('ambushTone'); fx9AmbushVfx(a, t); if(has('ambushEcho')) ambushEcho(a); return ctx.wait(1300); }},
  {key:'FX9P', label:'FX9 · The same while the camera pans: every piece stays on the card', play:ctx=>{ if(!need('fx9AmbushVfx')) return; const a = mine(ctx, 2), t = foe(ctx, 2); ctx.sound('ambushTone'); pan(ctx, 150); fx9AmbushVfx(a, t); if(has('ambushEcho')) ambushEcho(a); return ctx.wait(1400); }}]});
R({id:'atk-swarm', stage:'board', variants:[
  {key:'FX9P', label:'FX9 · FX6\u2019s bugs and spore puff (fxHostAt) while the camera pans: they ride the camera layer with the cards', play:ctx=>{ pan(ctx, 120); if(has('sporePuffVfx')) sporePuffVfx(foe(ctx, 1)); if(has('bugCrawlVfx')) bugCrawlVfx(mine(ctx, 0), {n:8}); return ctx.wait(1400); }}]});
// #7: a pitched card travels into the Graveyard
const pitch = drop=> ctx=>{ if(!need('ui16PitchToGrave')) return; const m = LabGame.match(ctx), hand = ctx.root.querySelector('#handStrip'), tile = hand && hand.querySelector('.card-tile'), g = ctx.root.querySelector('#dropDiscard');
  const gr = g && g.getBoundingClientRect(); ui16PitchToGrave(m, tile || null, {defId:'lab-hatchling', gains:[], at: drop && gr ? {x: gr.left + gr.width*.3, y: gr.top - 20} : null}); return ctx.wait(1100); };
R({id:'ui-pitch', stage:'board', variants:[
  {key:'FX9', label:'FX9 · Tap-pitch: the card arcs from the hand into the Graveyard and sinks in', play:pitch(false)},
  {key:'FX9D', label:'FX9 · Dropped on the pile: a short hop from where it was let go', play:pitch(true)}]});
// #8: Sleep's Zs
R({id:'st-sleep-active', stage:'board', variants:[
  {key:'FX9', label:'FX9 · Blue Zs drift out of the top-right corner (a slow loop); it wakes and they fade', play:async ctx=>{ if(!need('fx9ZzzSync')) return; const el = foe(ctx, 1), t = el.querySelector('.card-tile');
    el.classList.add('is-asleep'); fx9ZzzSync(t, true); await ctx.wait(4200); el.classList.remove('is-asleep'); fx9ZzzSync(t, false); await ctx.wait(700); }}]});
// #14: the tortoise shell
R({id:'sk-shell-down', stage:'board', variants:[
  {key:'FX9', label:'FX9 · A tortoise carapace (scutes, growth rings) cracks along its seams and its nine plates fall away', play:ctx=>{ if(!need('fx9ShellBreakVfx')) return; fx9ShellBreakVfx(mine(ctx, 1)); return ctx.wait(1300); }}]});
// #15: the dragon's four flights
const DIRS = [['ltr', 'left to right', 'FX9A'], ['rtl', 'right to left', 'FX9B'], ['dive', 'a diagonal dive onto its slot', 'FX9C'], ['back', 'a sweep from the far side toward you', 'FX9D']]; // keys: one capital and up to three more (fxlab-core)
R({id:'sum-dragon', stage:'board', variants:DIRS.map(([dir, txt, key])=> ({key, label:'FX9 · The shadow flies ' + txt + ', the cards sway in its wind, it lands with dust',
  play:ctx=>{ if(!need('fx9DragonArrive')) return; return fx9DragonArrive(foe(ctx, 1), {dir, host:ctx.board.el, shake:true}); }}))});
// #17: Stampede
R({id:'atk-overwhelm-hq', stage:'board', variants:[
  {key:'FX9', label:'FX9 · The dust and hoof prints run straight ahead at the enemy Health bar and burst on it', play:ctx=>{ if(!need('fx9StampedeVfx')) return; ctx.sound('overwhelmTone'); fx9StampedeVfx(mine(ctx, 2), ctx.board.castleFoe); return ctx.wait(1300); }}]});
})();
