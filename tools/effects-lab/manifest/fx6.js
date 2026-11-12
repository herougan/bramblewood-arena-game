// Package FX6 (2026-11-12): the owner's 08:39 notes, registered on the inventory ids they change (variant key 'FX6'; labels start "FX6 ·").
// Each variant plays the game's own code (arena_app.js: bugCrawlVfx, sporePuffVfx, riseUpFx) and the game's CSS (.tw-wave, .fx6-* in arena_template.html).
//   High Tide's second layer: a breaking crest over the settled water (the game draws it in the standing tide scene, syncTideScene)   wt-tide-high
//   Bulwark's Log Walls rise from the floor: bottom-up reveal, dust, the construction sound                                         sum-trigger-spawn
//   Swarm / Spawn on death: small bug silhouettes scatter, crawl, gone by 1 s                                                       atk-swarm, sum-on-death-spawn
//   Spore puff: a dark lime puff off the card, 1 s (Spore Cloud's sleepers, the Puffball Bombardier's shot)                         st-sleep-apply
(function(){
const R = FXLAB.register, W = window, has = n=> typeof W[n] === 'function', foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i];
const SCENE = '<div class="tw-wet"></div><div class="tw-sheet"><div class="tw-body"><div class="tw-water"><div class="tw-surf"><i class="tw-caus"></i><i class="tw-caus c2"></i><i class="tw-sheen"></i></div></div><i class="tw-wave"></i><i class="tw-edge tw-edge-b"></i><i class="tw-edge"></i></div></div>';
R({id:'wt-tide-high', stage:'board', inGameHook:"syncTideScene: the standing tide scene while the tide is High (.tw-wave, data-k='high')", note:'FX6: the second layer is one element; B shows the settled Flood for comparison.', variants:[
  {key:'FX6', label:'FX6 · A breaking crest over the settled water, same blue wash and white crest line as the tide', play:ctx=>{ const bf = ctx.board.el, w = document.createElement('div'); w.className = 'tide-scene'; w.dataset.k = 'high';
    w.style.cssText = 'position:absolute; inset:0; pointer-events:none; overflow:hidden; --tw-to:-12px; --tw-slosh:8.5px;'; w.innerHTML = SCENE; bf.insertBefore(w, bf.firstChild); return ctx.wait(4200).then(()=> w.remove()); }}]});
R({id:'sum-trigger-spawn', stage:'board', inGameHook:"onEvent: spawn {kind:'bulwark'} → renderBoard's 'rise' entrance (riseUpFx) + SoundKit.constructTone", note:'FX6: the Log Wall is raised from the floor of its slot, not flown from the card.', variants:[
  {key:'FX6', label:'FX6 · Bulwark: the wall rises bottom-up out of its slot, dust, three hammer knocks', play:ctx=>{ const t = foe(ctx, 2); ctx.sound('constructTone'); if(has('riseUpFx')) riseUpFx(t);
    if(W.gsap) W.gsap.fromTo(t, {y:34, clipPath:'inset(100% -45% -12% -45%)'}, {y:0, clipPath:'inset(-14% -45% -12% -45%)', duration:.5, ease:'power2.out', clearProps:'clipPath,y'}); return ctx.wait(1200); }}]});
R({id:'atk-swarm', stage:'board', inGameHook:"onEvent: hit with Swarm → bugCrawlVfx(attacker)", note:'FX6: replaces the 26-bug steered cloud in the game (A, kept in the Lab, steered every frame).', variants:[
  {key:'FX6', label:'FX6 · Small bugs scatter out of the unit, crawl, and are gone by 1 s', play:ctx=>{ if(has('bugCrawlVfx')) bugCrawlVfx(foe(ctx, 1), {n:10}); return ctx.wait(1300); }}]});
R({id:'sum-on-death-spawn', stage:'board', inGameHook:"onEvent: spawn {cause:'onDeathSpawn'} → bugCrawlVfx(first token)", variants:[
  {key:'FX6', label:'FX6 · Bugs crawl out where the token appears, gone by 1 s', play:ctx=>{ ctx.sound('buzz'); if(has('bugCrawlVfx')) bugCrawlVfx(foe(ctx, 2)); return ctx.wait(1300); }}]});
R({id:'st-sleep-apply', stage:'board', inGameHook:"onEvent: statusFx {field:'sporeCloud', kind:'sleep'} → sporePuffVfx(target); hit by a Puffball Bombardier → sporePuffVfx(target)", note:'FX6: sporePuffVfx(el) is reusable.', variants:[
  {key:'FX6', label:'FX6 · Spore Cloud: a dark lime-green puff billows off the card, 1 s', play:ctx=>{ ctx.sound('sleepTone'); if(has('sporePuffVfx')) sporePuffVfx(foe(ctx, 1)); return ctx.wait(1200); }}]});
})();
