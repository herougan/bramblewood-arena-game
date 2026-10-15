// Batch A lab registrations (2026-10-15): combat-attack, combat-skill.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.A.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-a.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.A;
// Example (delete when the first real entry lands):
// R({id:'atk-melee-lunge', stage:'board', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().lunge(ctx.board.mine[1], ctx.board.foe[1], {})},
//   {key:'B', label:'Another take', play:async ctx=> X().lunge_B(ctx.board.mine[1], ctx.board.foe[1], {})},
// ]});
})();
