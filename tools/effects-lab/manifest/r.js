// Rules batch lab registrations (2026-10-15 evening list): the unit light at night / in the dark, and a hidden skirmish appearing.
// Contract: docs/effects-lab-contract.md. The look lives in arena_template.html (.unit-light, .map-node.secret-pop); these demos
// put the same classes on the stage's own elements.
(function(){
const R = FXLAB.register;
// 2026-10-15 (user: "Leader should have abit of light in darkness. (Night too) Just abit. Creatures with Light Aura shine brighter."):
// a faint pool behind a leader, a bright one behind an Illuminate unit, a flickering orange one behind Immolation.
const light = (ctx, kinds)=>{
  const bf = ctx.board.el; if(!bf) return Promise.resolve();
  ctx.board.mine.forEach((c, i)=>{ const k = kinds[i]; if(!c || !k) return; const s = document.createElement('span'); s.className = 'unit-light ul-' + k; s.setAttribute('aria-hidden', 'true'); c.insertBefore(s, c.firstChild); });
  bf.classList.add('is-dark-scene');
  return ctx.wait(2600);
};
R({id:'fld-unit-light', stage:'board', inGameHook:'boardCardHTML (arena_app.js): .unit-light on leaders / Illuminate / Immolation; .battlefield.is-dark-scene from syncNightVeil', note:'Only at night or on a dark field; elsewhere the pools stay hidden.',
  variants:[
    {key:'A', label:'Leader (faint), Illuminate (bright), Immolation (fire)', play:ctx=> light(ctx, ['leader', 'aura', 'fire'])},
  ]});
// Hidden skirmish (2026-10-15, user: "You can also add HIDDEN skirmishes (max 5 across Map 1-20)"): the first sight of one.
R({id:'map-hidden-skirmish-pop', stage:'map', inGameHook:'renderConquestSubTab (arena_app.js): hiddenPopNow → .map-node.is-secret.secret-pop + toast', note:'Plays once per hidden skirmish, the first time its map is opened after it is revealed.',
  variants:[
    {key:'A', label:'Gold burst, ring and ✦', play:ctx=>{ const n = ctx.map && (ctx.map.nodes.available || (ctx.map.nodeList||[])[0]); if(!n) return; n.classList.add('is-secret', 'secret-pop'); ctx.sound && ctx.sound('unlockChime'); return ctx.wait(2400); }},
  ]});
})();
