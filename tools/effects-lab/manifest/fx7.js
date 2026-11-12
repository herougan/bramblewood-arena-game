// Package FX7 (2026-11-12): "FX7 proposals", seven skill effects for the owner to SEE before anything is wired into a fight (owner 23:22: "Build more effects ... related to the kind of effects we are doing").
// Each plays the game's own function (arena_app.js, next to FX6's bugCrawlVfx / sporePuffVfx) and the game's CSS (.fx7-* in arena_template.html). Lab only; the hook line is in each entry.
// All: one host over the card, a few spans, transform + opacity, gone by about 1 s; Effects Low and reduced motion keep one still fading piece; Effects None draws nothing.
(function(){
const R = FXLAB.register, W = window, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const call = (name, el)=>{ if(typeof W[name] === 'function') W[name](el); else console.error('[FXLAB] fx7: ' + name + ' is missing from the game source'); };
const E = (id, name, skill, hook, fn, sound, label, row)=> R({id:'fx7-' + id, name:'FX7: ' + name, stage:'board', trigger:skill, inGameHook:hook, note:'FX7 proposal, not wired into fights. One call: ' + fn + '(boardCardEl(uid)).', variants:[
  {key:'A', label, play:ctx=>{ if(sound) ctx.sound(sound); call(fn, (row === 'mine' ? mine : foe)(ctx)); return ctx.wait(1300); }}]});
E('rabid', 'Rabid froth', 'Rabid: its hits add Poison', "onEvent: hit by a unit with Rabid → rabidFrothVfx(attacker)", 'rabidFrothVfx', 'buzz', 'Pale green froth bubbles pop off the card, a red rage glow pulses at its edge');
E('spiteful', 'Spiteful bristle', 'Spiteful N: a hit on it is answered', "onEvent: spite damage → spiteBristleVfx(the Spiteful unit)", 'spiteBristleVfx', 'reflectTone', 'Dark red thorns snap out of the card edge and back');
E('rock-solid', 'Rock-solid shrug', 'Rock-solid: +2/+2 per Stone', "statPillPulse of a Rock-solid unit when Stone changes → rockSolidVfx(unit)", 'rockSolidVfx', null, 'A stone-coloured rim, pebbles bounce down the card, a dust ring at its foot');
E('iron-will', 'Iron-will gleam', 'Iron-will: +3/+3 per Metal', "statPillPulse of an Iron-will unit when Metal changes → ironWillVfx(unit)", 'ironWillVfx', null, 'A steel sheen sweeps across the card and leaves a cold steel rim');
E('haste', 'Haste streaks', 'Haste / Speed: it acts first', "onEvent: a Haste / Speed unit's attack starts → hasteStreakVfx(attacker)", 'hasteStreakVfx', 'momentumTone', 'Six thin lines streak past the card, down for the enemy row (shown), up for ours');
E('true-sight', 'True Sight eye', 'True Sight (Keen Eye): reveals a Changeling', "onEvent: Keen Eye reveal → trueSightVfx(the revealed unit)", 'trueSightVfx', null, 'An eye opens over the card, looks left and right, closes; a gold ring marks the find');
E('heavy-metal', 'Heavy Metal ore', 'Heavy Metal: extra ore from every gain', "addOre event with Heavy Metal → oreClangVfx(unit)", 'oreClangVfx', null, 'Three steel nuggets pop off the card with a metal-blue ring');
// the ours-row version of Haste, to see the other direction
R({id:'fx7-haste', stage:'board', variants:[
  {key:'B', label:'The same on our row: the lines run up', play:ctx=>{ call('hasteStreakVfx', mine(ctx)); return ctx.wait(1300); }}]});
})();
