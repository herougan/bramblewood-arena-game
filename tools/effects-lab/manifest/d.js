// Batch D lab registrations (2026-10-15): status (part), card-treatment, foil, pack-card-open, meta-progression (part).
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.D.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-d.js, which the game loads too).
(function(){
const R = FXLAB.register, X = ()=> window.FX.D;
// Example (delete when the first real entry lands):
// R({id:'pack-reveal-foil', stage:'pack', inGameHook:'where arena_app.js calls it', variants:[
//   {key:'A', label:'Short description', play:async ctx=> X().foilReveal((await ctx.pack.deal(), ctx.pack.cards[0]), {})},
//   {key:'B', label:'Another take', play:async ctx=> X().foilReveal_B((await ctx.pack.deal(), ctx.pack.cards[0]), {})},
// ]});
})();
