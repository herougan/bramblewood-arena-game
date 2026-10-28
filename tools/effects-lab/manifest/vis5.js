// Package VIS5 (2026-10-28): the owner's 10-28 09:48 notes L3 and L4, registered on the inventory ids they changed, on free letters; labels start
// "VIS5 ·". Each variant plays the game's own code (arena_app.js: vis5LeaderSlam, vis5DangerPlate, vis5HzJolt) and the game's CSS (the VIS5 block of arena_template.html).
//   L3 "<Leader> joins the fight!": a band opens, the portrait slams, a ring rolls, the name banner snaps in (1.4 s)       castle-enemy-leader-banner C (yours), D (theirs)
//   L3 Danger: red edge pulses twice, a red light sweeps across, a hazard-striped DANGER plate slams in (1.5 s)            castle-danger B (the Danger warning on a dangerous card; the Lab only takes inventory ids, so it sits here)
//   L4 the trap springs: the card jumps, reels (wobble, dizzy tilt), dizzy stars circle it, a damage number flies          sk-trap-snap J
(function(){
const R = FXLAB.register, W = window, has = n=> typeof W[n] === 'function';
const foe = ctx=> ctx.board.foe;
R({id:'castle-enemy-leader-banner', stage:'board', inGameHook:"onEvent: play {leader} → leaderThroneVfx → vis5LeaderSlam (the callout is the slam since VIS5)", note:'VIS5 (L3): C is yours (gold), D theirs (crimson). 1.4 s; Low FX and reduced motion fade, None keeps the banner.', variants:[
  {key:'C', label:'VIS5 · Yours: gold band, portrait slams in, ring, name banner from the left', play:ctx=>{ if(has('vis5LeaderSlam')) vis5LeaderSlam({name:'Thornback Boar', icon:'🐗'}, false, ctx.board.el); return ctx.wait(1700); }},
  {key:'D', label:'VIS5 · Theirs: crimson band, the portrait slams, name banner from the right', play:ctx=>{ if(has('vis5LeaderSlam')) vis5LeaderSlam({name:'Thornback Boar', icon:'🐗'}, true, ctx.board.el); return ctx.wait(1700); }}]});
R({id:'castle-danger', stage:'board', inGameHook:"maybeDangerWarn → vis5DangerPlate (a dangerous enemy card is played)", note:'VIS5 (L3): the Danger warning for a dangerous card (not the castle-low pulse of A).', variants:[
  {key:'B', label:'VIS5 · Danger: the edges flare red twice, a red light sweeps across, the DANGER plate slams in', play:ctx=>{ if(has('vis5DangerPlate')) vis5DangerPlate(ctx.board.el, 'Thornback Boar', 'Rare'); return ctx.wait(1700); }}]});
R({id:'sk-trap-snap', stage:'board', inGameHook:"hazardSprung → vis5HzSprung (the pip is removed) → vis5HzJolt on the card just played there", note:'VIS5 (L4): the card jumps and reels with three dizzy stars; the number flies from it.', variants:[
  {key:'J', label:'VIS5 · Trap springs: the card jumps, wobbles into a dizzy tilt, stars circle its head, -5 flies out', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🪤 -5', 'dmg'); ctx.sound('bite'); if(has('vis5HzJolt')) vis5HzJolt(t, 'trap'); return ctx.wait(1400); }}]});
})();
