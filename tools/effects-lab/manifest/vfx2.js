// Package VFX2 (2026-11-19): battle effects for the Release 1.0 path, registered on the inventory ids they changed, key V2 (labels start "VFX2 ·").
// Each plays the game's own code: FX.A.mindFlip, FX.A.frozenClock, FX.A.shieldBurst (+ arena_app.js vis4ShieldBreak), FX.C.deathExile_C.
// Bleed applied (st-bleed-apply A) already plays the game's FX.B.bleedApply, so its bigger drip shows there.
(function(){
const R = FXLAB.register, A = ()=> window.FX && FX.A, C = ()=> window.FX && FX.C;
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe, bc = el=> (el && el.closest && el.closest('.board-card')) || el;
R({id:'sk-shield-break', stage:'board', inGameHook:'shieldSoak with 0 left → vis4ShieldBreak (the panes) + FX.A.shieldBurst 120 ms later (FX.A.onEvent) + SoundKit.iceShatter (renderVfxForEvent)',
  variants:[{key:'V2', label:'VFX2 · The glass panes break off, then a bright ring, hex shards and glints; the ice shatter sound', play:ctx=>{ const t = foe(ctx)[1];
    ctx.float(t, '💠 Shield breaks', 'debuff'); ctx.sound('iceShatter'); if(typeof vis4ShieldBreak === 'function') vis4ShieldBreak(bc(t)); return ctx.wait(120).then(()=> A().shieldBurst(t)); }}]});
R({id:'sk-stun-player', stage:'board', inGameHook:'the stunned side\'s turn opens (resolveRoundCore: fxHook(\'turnSkipped\', side)) → FX.A.hooks.turnSkipped → FX.A.frozenClock; the bell (A) still tolls when the stun lands',
  variants:[{key:'V2', label:'VFX2 · Your skipped turn: a frosted clock over your hand races and jams, ice chips, a frost wash', play:ctx=>{ ctx.sound('freezeChime');
      return A().frozenClock(ctx.board.hand || ctx.board.castleMine); }},
    {key:'V2B', label:'VFX2 · The enemy\'s skipped turn: the same clock over their castle', play:ctx=>{ ctx.sound('freezeChime'); return A().frozenClock(ctx.board.castleFoe); }}]});
R({id:'sk-mind-control', stage:'board', inGameHook:'mindControl → vfx2MindControlRows (arena_app.js: the unit is redrawn on the caster\'s row, its old rect on ev._fromRect) → FX.A.mindFlip',
  variants:[{key:'V2', label:'VFX2 · A tether and a swirl, the unit flies over to your row, flipping from violet to your blue, and lands with a ring', play:ctx=>{
    const u = bc(foe(ctx)[1]), from = u.getBoundingClientRect(), home = u.parentNode, next = u.nextSibling, row = ctx.board.rowMine, slot = (row && row.querySelector('.board-row-inner, .row-cards')) || row;
    ctx.sound('confuseWarble'); slot.appendChild(u);
    return A().mindFlip(u, {from, caster:mine(ctx)[1], side:'A'}).then(()=>{ if(home) home.insertBefore(u, next); }); }}]});
R({id:'sk-exile-board', stage:'board', inGameHook:'death {exiled | nullified} → FX.C.hooks.deathLook → FX.C.deathExile_C (the banish swirl; A and B stay here)',
  variants:[{key:'V2', label:'VFX2 · Banish swirl: a violet rift opens, the card spirals in, the rift seals, a candle Echo flickers', play:ctx=> C().deathExile_C(foe(ctx)[1], {})}]});
})();
