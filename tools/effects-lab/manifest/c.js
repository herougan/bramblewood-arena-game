// Batch C lab registrations (2026-10-15): status (part), death, castle, summon-spawn.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.C.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-c.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.C;
// Example (delete when the first real entry lands):
// R({id:'death-boss', stage:'board', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().bossDeath(ctx.board.foe[1], {})},
//   {key:'B', label:'Another take', play:async ctx=> X().bossDeath_B(ctx.board.foe[1], {})},
// ]});
})();
