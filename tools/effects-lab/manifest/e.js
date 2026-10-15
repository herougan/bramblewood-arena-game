// Batch E lab registrations (2026-10-15): conquest-map, world-ambience.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.E.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-e.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.E;
// Example (delete when the first real entry lands):
// R({id:'map-node-cleared', stage:'map', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().nodeCleared(ctx.map.nodes.available, {})},
//   {key:'B', label:'Another take', play:async ctx=> X().nodeCleared_B(ctx.map.nodes.available, {})},
// ]});
})();
