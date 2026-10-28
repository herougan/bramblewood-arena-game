// Package VIS4 (2026-10-27): the owner's 10-27 11:22 notes, registered on the inventory ids they changed, on the free letter I (labels
// start "VIS4 ·"). Each variant plays the game's own code (arena_app.js: vis4ShieldHit, vis4ShieldBreak, vis4ShieldCount, vis3BlockPulse,
// vis3RampartStep) and the game's CSS (the VIS4 block of arena_template.html).
//   K7 the Shield's hit: the rectangle lights up and ripples; its break: glass panes; the number counts down to 0   sk-shield-soak I, sk-shield-break I
//   K4 Rampart: a longer step toward its bramble, held through the blow, a stronger shake and two gold rings      atk-guardian-redirect I
(function(){
const R = FXLAB.register, has = n=> typeof window[n] === 'function';
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const bc = el=> (el && el.closest && el.closest('.board-card')) || el;
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const shieldNum = n=> has('vis3ShieldHTML') ? vis3ShieldHTML({shield:n}) : `<span class="vis3-shield-num">${n}</span>`;
const withShield = (el, n)=>{ const t = tileOf(el); t.querySelectorAll('.vis3-shield-num').forEach(x=> x.remove()); t.insertAdjacentHTML('beforeend', shieldNum(n)); bc(el).classList.add('has-shield'); return t.querySelector('.vis3-shield-num'); };
const dropShield = el=>{ tileOf(el).querySelectorAll('.vis3-shield-num').forEach(x=> x.remove()); bc(el).classList.remove('has-shield'); };
R({id:'sk-shield-soak', stage:'board', inGameHook:'shieldSoak (renderVfxForEvent, at the blow) → vis4ShieldHit (FX.A.shieldFlare, swapped by vis4PatchShieldFx); vis3ShieldRefresh → vis4ShieldCount',
  note:'2026-10-27 (VIS4, K7: "The electric zap line effect when the shield is attacked ... doesn\'t look so nice"): no ring or hex chips any more.',
  variants:[{key:'I', label:'VIS4 · Shield 3 takes 2: the rectangle lights up and ripples out, the blue 3 counts down to 1', play:ctx=>{ const t = foe(ctx)[1]; const n = withShield(t, 3);
    return ctx.wait(600).then(()=>{ ctx.float(t, '💠 -2', 'debuff'); if(has('vis4ShieldHit')) vis4ShieldHit(bc(t)); if(n && has('vis4ShieldCount')) vis4ShieldCount(n, 3, 1, false); return ctx.wait(1500); }).then(()=> dropShield(t)); }}]});
R({id:'sk-shield-break', stage:'board', inGameHook:'shieldSoak with 0 left → vis4ShieldBreak (FX.A.shieldShatter, swapped); the number counts down to 0, then fades',
  note:'2026-10-27 (VIS4, K7: "if the bar is reduced to 0, it should still animate to 0"). The white zig-zag cracks are gone.',
  variants:[{key:'I', label:'VIS4 · Shield 2 takes 3: the rectangle breaks into glass panes, the number counts to 0 and fades', play:ctx=>{ const t = foe(ctx)[1]; const n = withShield(t, 2);
    return ctx.wait(600).then(()=>{ ctx.float(t, '💠 Shield breaks', 'debuff'); if(has('vis4ShieldBreak')) vis4ShieldBreak(bc(t)); if(n && has('vis4ShieldCount')) vis4ShieldCount(n, 2, 0, true); return ctx.wait(1600); }).then(()=> dropShield(t)); }}]});
R({id:'atk-guardian-redirect', stage:'board', inGameHook:'en3RampartVfx → vis3RampartStep (VIS4: up to 45% of a card toward the bramble, held through the blow) → vis3BlockPulse (VIS4: 8 px shake, flash, two gold rings)',
  note:'2026-10-27 (VIS4, K4: "Rampart animation as described not done"). In a game the rampart event now takes no beat of its own, so the block lands with the blow.',
  variants:[{key:'I', label:'VIS4 · Rampart: slides toward its bramble, holds through the blow with a shake and two gold rings, slides back', play:ctx=>{ const u = mine(ctx)[1], uid = window.LabGame ? LabGame.uid(u) : null;
    if(window.LabGame) LabGame.match(ctx); ctx.float(ctx.board.castleMine, '-2', 'dmg');
    if(uid != null && has('vis3RampartStep')){ vis3RampartStep({uid, side:'A'}, 420, false); setTimeout(()=> ctx.float(u, '-3 🚧', 'dmg'), 420); return ctx.wait(1700); }
    if(has('vis3BlockPulse')) vis3BlockPulse(bc(u)); return ctx.wait(1000); }}]});
})();
