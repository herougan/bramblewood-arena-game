// 2026-10-17 (rebuild): Rebuild N, the passive, and Rebuild castle N, its trigger action (user, 23:52: "A new skill: Rebuild N: The
// unit regenerates the castle for N on ready. As an action, then on the trigger, it regenerates the castle for N."). Both send the
// engine's 'rebuild' event {side, uid, defId, amount, n, trigger}; the lab plays the game's own rebuildVfx on it (listed in
// tools/effects-lab/fx-src-extra.txt). Inventory: docs/effects-inventory-2026-10-15.json, id sk-rebuild (batch RB17).
(function(){
const R = FXLAB.register, G = window.LabGame;
const mine = ctx=> ctx.board.mine;
const U = el=> G.uid(el);
R({id:'sk-rebuild', stage:'board', inGameHook:'rebuildVfx (arena_app.js) on rebuild {side, uid, amount} → floatGlyphs 🪵🧱🪨 builder → castle, the castle thunks, "🔨 +N" (heal hq-big) on that side\'s HP bar (hqRibbonFloatAnchor); woodKnock + healTone',
  note:'Rebuild N: every upkeep while Ready it restores N Health to your castle (never above max). Rebuild castle N is the trigger action: the same mend once, whenever its trigger fires. On no card yet.',
  variants:[
    {key:'A', label:'Rebuild 2 at upkeep: planks and stones fly from the builder into your castle, "+2" on the HP bar', play:ctx=>{ G.match(ctx); const b = mine(ctx)[1]; G.badge(b, G.chip('rebuild', '🔨🏰', 2));
      G.fire('rebuildVfx', {type:'rebuild', side:'A', uid:U(b), defId:'x', amount:2, n:2}); return ctx.wait(1900); }},
    {key:'B', label:'Rebuild castle 4 (On Spawn): the builder lands and mends your castle', play:ctx=>{ G.match(ctx); const b = mine(ctx)[0]; G.badge(b, G.trig('onSpawn', '⚡', '🔨'));
      if(ctx.gsap) ctx.gsap.from(b, {y:-40, opacity:0, duration:.35, ease:'power2.out'});
      setTimeout(()=>{ if(ctx.alive()) G.fire('rebuildVfx', {type:'rebuild', side:'A', uid:U(b), defId:'x', amount:4, n:4, trigger:true}); }, 380); return ctx.wait(2300); }},
    {key:'C', label:'The enemy rebuilds: planks fly into their castle, "+2" on their HP bar', play:ctx=>{ G.match(ctx); const b = ctx.board.foe[1];
      G.fire('rebuildVfx', {type:'rebuild', side:'B', uid:U(b), defId:'x', amount:2, n:2}); return ctx.wait(1900); }}]});
})();
