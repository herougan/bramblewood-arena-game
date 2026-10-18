// 2026-10-18 (package M, owner 20:45: "The movement during flood should be a bit more obvious during transition. Then during steady
// state, 70% more movement than now (it moves like 2-3px only right now). In Ebb, it looks like what it is right now, but 20% less."):
// the standing Tide itself (syncTideScene / tideSceneSet in arena_app.js, .tide-scene CSS), played on the lab's board with a stand-in
// match object. The rise into a Flood tilts in further (TIDE_RISE_SKEW), surges higher and swells down into view as it reaches the top
// (TIDE_ARRIVE_SWELL); the settled slosh is TIDE_FLOOD_MOTION on Flood (x1.7 of the old 5px) and TIDE_EBB_MOTION on Ebb (x0.8).
// The "before" variants pin the old numbers on the same layer (--tw-slosh 5px, 5deg, no swell) for an A/B.
(function(){
const R = FXLAB.register;
const has = ()=> typeof syncTideScene === 'function' && typeof tideSceneSet === 'function';
function clear(bf){ const w = bf.querySelector(':scope > .tide-scene'); if(w) w.remove(); delete bf.dataset.tide; }
// from: the state already settled on the board (drawn in place); to: the state the tide moves to. old: pin the pre-M numbers.
function standing(ctx, from, to, old){
  const bf = ctx.board.el; if(!has()) return ctx.wait(400);
  clear(bf); const m = {resolving:true, _tideScene: from === 'none' ? null : {k:from, from, at:0}};
  if(from !== 'none') syncTideScene(m);
  return ctx.wait(350).then(()=>{
    tideSceneSet(m, to); syncTideScene(m);
    const w = bf.querySelector(':scope > .tide-scene');
    if(w && old){ w.style.setProperty('--tw-slosh', '5px'); w.style.setProperty('--tw-skew', (to === 'ebb' && from !== 'none' ? -5 : 5) + 'deg'); w.classList.remove('is-rising');
      w.style.setProperty('--tw-lap', '0px'); w.style.setProperty('--tw-drift', '0px'); }
    return ctx.wait(7000); }).then(()=> clear(bf));
}
// 2026-10-18 (package M follow-up, owner 21:59: "The ebb effect should move in and out, and a bit side to side. It's too static."): the
// settled Ebb on its own for a while: TIDE_EBB_LAP in and out, TIDE_EBB_DRIFT side to side, TIDE_EBB_OFFSET lower; still: lap and drift off.
function settledEbb(ctx, still){
  const bf = ctx.board.el; if(!has()) return ctx.wait(400);
  clear(bf); const m = {resolving:true, _tideScene:{k:'ebb', from:'ebb', at:0}}; syncTideScene(m);
  const w = bf.querySelector(':scope > .tide-scene'); if(w && still){ w.style.setProperty('--tw-lap', '0px'); w.style.setProperty('--tw-drift', '0px'); }
  return ctx.wait(11000).then(()=> clear(bf));
}
R({id:'wt-tide-flow', stage:'board', inGameHook:'tideWaveVfx → tideSceneSet + syncTideScene (arena_app.js), .tide-scene CSS; knobs TIDE_FLOOD_MOTION, TIDE_RISE_SKEW, TIDE_ARRIVE_SWELL',
  variants:[
    {key:'D', label:'2026-10-18 (M): the Ebb band grows into the Flood, rising steeper from the left, surges, swells down into view at the top, then sloshes 8.5px', play:ctx=> standing(ctx, 'ebb', 'flow')},
    {key:'E', label:'M numbers off: the same layer with the old slosh, tilt and no swell (5px, 5deg)', play:ctx=> standing(ctx, 'ebb', 'flow', true)}]});
R({id:'wt-tide-ebb', stage:'board', inGameHook:'tideWaveVfx → tideSceneSet + syncTideScene (arena_app.js), .tide-scene CSS; knobs TIDE_EBB_MOTION, TIDE_EBB_LAP, TIDE_EBB_DRIFT, TIDE_EBB_OFFSET',
  variants:[
    {key:'D', label:'2026-10-18 (M): the Flood recedes into the bottom band, which then laps in and out, drifts and sloshes 4px', play:ctx=> standing(ctx, 'flow', 'ebb')},
    {key:'E', label:'M numbers off: the same drain with the old 5px slosh, no lap or drift', play:ctx=> standing(ctx, 'flow', 'ebb', true)},
    {key:'F', label:'2026-10-18 (M follow-up): the settled Ebb, lapping 6px in and out and drifting 10px side to side, 3px lower', play:ctx=> settledEbb(ctx)},
    {key:'G', label:'The settled Ebb as it was (still band, slosh only)', play:ctx=> settledEbb(ctx, true)}]});
})();
