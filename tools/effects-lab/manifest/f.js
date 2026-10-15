// Batch F lab registrations (2026-10-15): combat-skill (part), ui-feedback, meta-progression (part), rewards-results, tutorial-dialogue, raid-dungeon-pvp.
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.F.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-f.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.F;
// Example (delete when the first real entry lands):
// R({id:'meta-account-level', stage:'ui', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().accountLevel(ctx.ui.hud, {})},
//   {key:'B', label:'Another take', play:async ctx=> X().accountLevel_B(ctx.ui.hud, {})},
// ]});
})();
