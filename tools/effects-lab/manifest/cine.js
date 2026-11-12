// Package FX8 (2026-11-12): "Cinematic (FX8)", eleven staged board-wide effects (omen, build-up, climax, aftermath, 3-6 s) from bramblewood-cinematic.js.
// NOT wired into fights (the owner looks first). Variants: A full (High), B Low effects (short, no canvas, no shake), C reduced motion (still frame, then a fade).
// Wiring later is one line: BramblewoodCinematic.<name>(battlefieldEl, {onImpact(){...}}). Tap or click the stage to skip to the aftermath.
(function(){
const R = FXLAB.register, C = ()=> window.BramblewoodCinematic;
const E = (id, name, trigger, note)=> R({id:'fun-cine-' + id, area:'cine', name, trigger, stage:'board', note, inGameHook:'Not wired in (owner to pick). BramblewoodCinematic.' + id + '(battlefieldEl, opts)', variants:[
  {key:'A', label:'FX8 · ' + name + ', full (High effects)', play:ctx=> C() ? C()[id](ctx.board.el, {level:'high', reduced:false, speed:ctx.speed || 1}) : null},
  {key:'B', label:'FX8 · ' + name + ', Low effects (about 1.6x faster, no particles, no shake)', play:ctx=> C() ? C()[id](ctx.board.el, {level:'low', reduced:false, speed:ctx.speed || 1}) : null},
  {key:'C', label:'FX8 · ' + name + ', reduced motion (one still frame, then a fade)', play:ctx=> C() ? C()[id](ctx.board.el, {level:'high', reduced:true}) : null}]});
E('meteor', 'Meteor', 'A portent, the sky darkens, darkness creeps in, a burning ball lights the board, boom', 'Portent: an ember high in the sky. Darkness creeps in from the edges. The ball arrives in a sudden flash of light, then a white flash, shockwave rings, a short shake, debris and a crater that cools.');
E('eclipse', 'Eclipse', 'The moon slides over the sun, totality, the diamond ring', 'The corona and stars appear at totality; the diamond ring flashes as the light returns.');
E('lightning', 'Lightning storm', 'Clouds and rain gather, distant flickers, one great strike', 'Three distant flickers, a held breath, then one forked bolt, a white-blue flash and a scorch.');
E('tidalWave', 'Tidal wave', 'The sea draws back, a wall of water rises and breaks over the board, then drains', 'A swell at the bottom edge stands up into a wall with a foam crest.');
E('earthquake', 'Earthquake fissure', 'A tremor, cracks run, the ground splits open, then closes', 'The cracks glow amber; the chasm opens in 0.45 s and closes slowly.');
E('eruption', 'Volcanic eruption', 'Smoke and glow, ash falls, the blast, lava rains down', 'Fountain of lava particles, a light column and an ash cloud that thins.');
E('blizzard', 'Blizzard whiteout', 'The air chills, wind and fog sweep in, whiteout, then hush and frost', 'Fog bands and wind-blown flakes; the frost vignette and ice glints remain after.');
E('aurora', 'Aurora blessing', 'A calm night, curtains of light unfurl, light pours down onto the board', 'A gentle one: motes of light fall over the board, with a chime.');
E('wildfire', 'Wildfire sweep', 'Smoke and embers, a flame front sweeps across and scorches, embers wink out', 'The front crosses left to right; the scorch trails behind it.');
E('swarm', 'Swarm blots out the sun', 'Specks on the horizon gather into a cloud over the sun, near-dark, then it flies off', 'One canvas of about 120 wing-flickers whose cloud follows a moving centre.');
E('stampede', 'Stampede', 'Dust trembles on the horizon, a herd thunders across, the dust settles', 'Fourteen silhouettes (deer, bison, ram, goat) run right to left, with dust at their feet and hoofbeats.');
})();
