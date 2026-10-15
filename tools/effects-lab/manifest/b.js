// Batch B lab registrations (2026-10-15): status (part), field, weather-time, darkness-light.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.B.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-b.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.B;
// Example (delete when the first real entry lands):
// R({id:'st-poison-expire', stage:'board', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().poisonFade(ctx.board.foe[0], {})},
//   {key:'B', label:'Another take', play:async ctx=> X().poisonFade_B(ctx.board.foe[0], {})},
// ]});
})();
