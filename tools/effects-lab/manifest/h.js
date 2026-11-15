// Package FX11 (2026-11-16): batch H lab registrations (bramblewood-fx-h.js, window.FX.H). All live in fights:
//   atk-crab-claw          Crab Claws: the scuttle toward the side it pinches, the drawn pincer and its clack (crabClaw, then its hit / hitHQ;
//                          the Ironclaw Fiddler's fx.attack 'crabClaw' through en2CrabClawHit)
//   fld-irradiation-atmos  the whole screen turns sickly green as the board's Irradiation tokens add up (boardRendered / cardStatusShown / matchUI)
//   st-irradiation-apply   + the soft geiger ticks as tokens land (variant FX11)
//   sk-healing-mend        Healing N's mend (heal with cause 'healing')
//   sk-worship-hymn        Worship hears its side's Prayer (grace / statusFx prayer)
//   sk-gorge-gulp          Gorge's second feed (parasiteDrain with gorge)
(function(){
const R = FXLAB.register, H = ()=> window.FX.H, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const T = {windup:390, impactPad:180};
// the swing as a fight plays it: the crab scuttles toward its target, lunges, and the claw lands on the blow
const crab = (ctx, att, tgt, o)=>{ o = o || {}; const X = H(), sp = ctx.speed || 1;
  const dir = o.castle ? 0 : (tgt.getBoundingClientRect().left > att.getBoundingClientRect().left + 4 ? 1 : tgt.getBoundingClientRect().left < att.getBoundingClientRect().left - 4 ? -1 : 0);
  if(!o.straight) X.crabScuttle(att, {dir, speed:sp});
  return ctx.wait(o.straight ? 0 : 150).then(()=>{ if(window.LabGame) LabGame.lunge(att, true); return X.crabSnap(tgt, {from:att, castle:!!o.castle, miss:!!o.miss, impactMs:(T.windup + T.impactPad)/sp, speed:sp}); }); };
R({id:'atk-crab-claw', stage:'board', note:'FX11: replaces the "🦞 ←/→" float, the .crab-pinch slide, FX.A.crabPinch and the Ironclaw’s old claw.',
  inGameHook:'onEvent (bramblewood-fx-h.js): crabClaw, then its hit / hitHQ / evaded; en2CrabClawHit (Ironclaw Fiddler, fx.attack crabClaw)', variants:[
  {key:'A', label:'FX11 · It scuttles toward the column on its left, the pincer snaps shut on the unit there: clack, spark, knock-back', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 0))},
  {key:'B', label:'FX11 · The other side', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 2))},
  {key:'C', label:'FX11 · Nobody beside it: the claw reaches into the bramble, leaves and twigs fly', play:ctx=> crab(ctx, mine(ctx), ctx.board.castleFoe, {castle:true})},
  {key:'D', label:'FX11 · The Ironclaw Fiddler’s straight attack (no scuttle)', play:ctx=> crab(ctx, mine(ctx), foe(ctx), {straight:true})},
  {key:'E', label:'FX11 · The target dodges: the claw closes on air, no knock-back', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 0), {miss:true})}]});
// the tint climbing step by step, then fading as the tokens wear off
const climb = (ctx, calm)=>{ const X = H(), host = ctx.root, seq = [1, 3, 6, 10, 15, 6, 0];
  return seq.reduce((p, n)=> p.then(()=>{ X.irrAtmos(n, {host, calm}); return ctx.wait(1100); }), Promise.resolve()).then(()=> ctx.wait(600)); };
R({id:'fld-irradiation-atmos', stage:'board', duration:9000, note:'FX11: one layer, CSS gradients only (vignette, scanlines, grain), opacity steps 0.26 / 0.36 / 0.46 / 0.55 / 0.62 at 1 / 3 / 6 / 10 / 15 tokens.',
  inGameHook:'fxHook boardRendered / cardStatusShown / matchUI (FX.H.irrSync, sums the board’s ☢️ badges); gone at the match’s end and off the battle screen', variants:[
  {key:'A', label:'FX11 · Tokens 1 → 3 → 6 → 10 → 15, then they wear off: the air turns greener, flickers, then clears', play:ctx=> climb(ctx, false)},
  {key:'B', label:'FX11 · Effects Low and reduced motion: the same tint, no flicker or grain motion', play:ctx=> climb(ctx, true)}]});
R({id:'st-irradiation-apply', stage:'board', variants:[
  {key:'FX11', label:'FX11 · The tokens land with a few soft geiger ticks (geigerSoft; was the louder burst)', play:ctx=>{ ctx.sound('geigerSoft', 3); return window.FX.B.irradiate(foe(ctx), {src:mine(ctx), tokens:3}); }}]});
R({id:'sk-healing-mend', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): heal with cause healing', variants:[
  {key:'A', label:'FX11 · A green cross pops over the healer, its mend hops over to the wounded ally', play:ctx=> H().healingMend(mine(ctx, 0), mine(ctx, 2))},
  {key:'B', label:'FX11 · Healing itself: the cross sinks into its own card', play:ctx=> H().healingMend(mine(ctx))}]});
R({id:'sk-worship-hymn', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): grace / statusFx prayer on its side, once a round', variants:[
  {key:'A', label:'FX11 · A golden halo settles, a warm wash, three notes rise', play:ctx=> H().worshipHymn(mine(ctx))}]});
R({id:'sk-gorge-gulp', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): parasiteDrain with gorge', variants:[
  {key:'A', label:'FX11 · A dark red rim, drops of blood drawn into the parasite, two gulps', play:ctx=> H().gorgeGulp(foe(ctx))}]});
})();
