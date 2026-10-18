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
    if(w && old){ w.style.setProperty('--tw-slosh', '5px'); w.style.setProperty('--tw-skew', (to === 'ebb' && from !== 'none' ? -5 : 5) + 'deg'); w.classList.remove('is-rising'); }
    return ctx.wait(7000); }).then(()=> clear(bf));
}
R({id:'wt-tide-flow', stage:'board', inGameHook:'tideWaveVfx → tideSceneSet + syncTideScene (arena_app.js), .tide-scene CSS; knobs TIDE_FLOOD_MOTION, TIDE_RISE_SKEW, TIDE_ARRIVE_SWELL',
  variants:[
    {key:'D', label:'2026-10-18 (M): the Flood rises steeper from the left, surges, swells down into view at the top, then sloshes 8.5px', play:ctx=> standing(ctx, 'ebb', 'flow')},
    {key:'E', label:'Before M: the same layer with the old numbers (5px slosh, 5deg tilt, no swell)', play:ctx=> standing(ctx, 'ebb', 'flow', true)}]});
R({id:'wt-tide-ebb', stage:'board', inGameHook:'tideWaveVfx → tideSceneSet + syncTideScene (arena_app.js), .tide-scene CSS; knob TIDE_EBB_MOTION',
  variants:[
    {key:'D', label:'2026-10-18 (M): the Flood drains to the bottom band (as before), which then sloshes 4px (was 5px)', play:ctx=> standing(ctx, 'flow', 'ebb')},
    {key:'E', label:'Before M: the same drain with the old 5px slosh', play:ctx=> standing(ctx, 'flow', 'ebb', true)}]});
})();
