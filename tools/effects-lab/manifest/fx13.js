// Package FX13 (2026-11-16, owner 20:20: "The high tide looks a bit ugly. The waves aren't even connected. And they don't resemble the foamy
// colour at the top of waves. Anyway, they should disappear off at the top."): High Tide's swells and the foam crest on the water's edge.
// Each variant plays the game's own code: syncTideScene / tideSceneSet (arena_app.js, copied by build.py via fx-src-extra.txt), whose scene
// carries FX.B.tideSwellHTML (bramblewood-fx-b.js), with a stand-in match object as manifest/m19.js does.
//   High Tide: three continuous foam crests rise up the board and fade out at its top            wt-tide-high
//   Ebb: the band's front edge wears the same cream foam crest over a teal face                   wt-tide-ebb
(function(){
const R = FXLAB.register;
const has = ()=> typeof syncTideScene === 'function' && typeof tideSceneSet === 'function';
function clear(bf){ const w = bf.querySelector(':scope > .tide-scene'); if(w) w.remove(); delete bf.dataset.tide; }
// settled: draw `k` in place; else start from `from` and move to `k` (the rise, 1.8 s), then hold
function scene(ctx, k, from, ms){
  const bf = ctx.board.el; if(!has()){ console.error('[FXLAB] fx13: syncTideScene is missing'); return ctx.wait(400); }
  clear(bf); const m = {resolving:true, _tideScene:{k:from || k, from:from || k, at:0}}; syncTideScene(m);
  return ctx.wait(from ? 400 : 0).then(()=>{ if(from){ tideSceneSet(m, k); syncTideScene(m); } return ctx.wait(ms || 10500); }).then(()=> clear(bf));
}
R({id:'wt-tide-high', stage:'board', inGameHook:"syncTideScene → tideSwellHTML → FX.B.tideSwellHTML (.fxb-swell, shown while .tide-scene[data-k='high']); the tide event adds FX.B.tideHigh's spray",
  note:'FX13: one continuous crest path per swell, a cream bubbly foam line over a teal face; they rise from the bottom and fade at the top, a new one every 3.5 s. Effects Low holds them still, None leaves them out.',
  variants:[
    {key:'FX13', label:'FX13 · The settled High Tide: three foam swells rise up the board and fade out at the top', play:ctx=> scene(ctx, 'high')},
    {key:'RISE', label:'FX13 · From Ebb into High Tide: the water rises, the swells fade in as it comes', play:ctx=>{ ctx.sound('splash'); return scene(ctx, 'high', 'ebb', 9000); }}]});
R({id:'wt-tide-ebb', stage:'board', inGameHook:'syncTideScene (.tw-edge: the foam crest tile is drawn by FX.B, bramblewood-fx-b.js)',
  variants:[
    {key:'FX13', label:'FX13 · The settled Ebb: its front edge wears the same cream foam crest as High Tide', play:ctx=> scene(ctx, 'ebb', null, 8000)}]});
})();
