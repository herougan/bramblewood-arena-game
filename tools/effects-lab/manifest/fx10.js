// Package FX10 (2026-11-13): group "FX10", ten skills that fire on Maps 0-20 with only a floating word or a shared look, each with a look of its own.
// All ten are wired into fights (arena_app.js fx10Vfx, where the event already fires; cosmetic only). Each plays the game's own SkillFX function
// (bramblewood-skillfx.js) and CSS (.fx10-* in arena_template.html). Variants: A the full look (Effects Medium and up); B Effects Low, reduced motion
// and the 4x / 5x fight speeds (one still piece that only fades).
(function(){
const R = FXLAB.register, F = ()=> window.SkillFX, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const play = (fn, el, o)=>{ const S = F(); if(S && typeof S[fn] === 'function') S[fn](el, o); else console.error('[FXLAB] fx10: SkillFX.' + fn + ' is missing'); };
// id, name, skill and moment, the event that plays it in a fight, function, cue, look, target, extra options
const E = (id, name, trigger, hook, fn, cue, label, el, more)=> R({id:'fun-fx10-' + id, area:'fx10', name:'FX10: ' + name, trigger, stage:'board', inGameHook:hook, variants:[
  {key:'A', label:'FX10 · ' + label, play:ctx=>{ if(cue) ctx.sound(cue); play(fn, el(ctx), Object.assign({speed:ctx.speed || 1}, more ? more(ctx) : null)); return ctx.wait(1300); }},
  {key:'B', label:'FX10 · Effects Low, reduced motion, 4x / 5x: one still piece fades', play:ctx=>{ if(cue) ctx.sound(cue); play(fn, el(ctx), Object.assign({calm:true}, more ? more(ctx) : null)); return ctx.wait(900); }}]});
E('snow', 'Avalanche: snowed under', 'Avalanche: each unit it buries gets +1 Wait', 'statusFx avalancheWait → SkillFX.snowBury (fx10Vfx)', 'snowBury', 'snowThump',
  'A heap of snow lands on the card with a squash, powder puffs off both sides, clumps slide down and drop off, the heap melts away', ctx=> mine(ctx));
E('ignite', 'Ignite', 'Burn takes hold of a unit (ENG20 heat)', 'statusFx en20Ignite → SkillFX.igniteFlare (fx10Vfx)', 'igniteFlare', 'igniteWhoosh',
  'A spark lands at the card’s foot, a line of flame runs out both ways and licks up, a warm rim lights the card', ctx=> mine(ctx));
E('burn', 'Burn tick', 'Burn deals its damage at upkeep', 'burnTick → SkillFX.burnLick (fx10Vfx)', 'burnLick', 'burnCrackle',
  'Soot climbs the card’s lower half, three tongues of flame flick up, embers drift off', ctx=> foe(ctx));
E('spent', 'Once-only skill used up', 'An On Ready one-shot (Delivery, Rocket, Fireball, an On Ready trigger…) is spent', 'skillSpent → SkillFX.spentPuff (fx10Vfx)', 'spentPuff', 'spentPuff',
  'The skill’s chip gives a last gold flash and goes out in a puff of grey smoke', ctx=> foe(ctx));
E('brood', 'Brood', 'Brood: the mother lays a spiderling beside her', 'spawn kind brood → SkillFX.broodDrop (fx10Vfx; replaces the shared summon ring)', 'broodDrop', 'silkDrop',
  'A silk thread runs from the mother to the new token, an egg sac slides down it, wobbles and splits, two spiderlings scurry off', ctx=> foe(ctx, 2), ctx=> ({from: foe(ctx, 1)}));
E('confuse', 'Confuse', 'Confuse: the unit may fumble its next action', 'statusFx confuse → SkillFX.confuseSpin (fx10Vfx; replaces the Stun orbit with a ❓)', 'confuseSpin', 'confuseWarble',
  'Question marks and notes, the mimicked calls, loop around the card’s head on a lopsided ring, every other one the other way', ctx=> mine(ctx));
E('carrion', 'Carrion', 'Carrion N: it heals when another unit dies', 'statusFx carrion → SkillFX.carrionFeed (fx10Vfx)', 'carrionFeed', 'carrionCaw',
  'Pale wisps rise from where the fallen unit was, curl in and sink into the feeder; a dark red rim pulses', ctx=> foe(ctx), ctx=> ({from: mine(ctx)}));
E('delivery', 'Delivery', 'Delivery {X}: a resource arrives once it is Ready', 'lumber / stone / metal / pearl / grace with cause delivery → SkillFX.deliveryCrate (fx10Vfx), then the log arc', 'deliveryCrate', 'crateThunk',
  'A small crate drops onto the card, bounces, its lid pops off with wisps of straw', ctx=> foe(ctx));
E('skitter', 'Skitter', 'Skitter: after its hit it is Quick and Evasive for its next round', 'statusFx skitter → SkillFX.skitterDash (fx10Vfx)', 'skitterDash', 'skitterPatter',
  'Tiny footprints scurry in a zig-zag along the card’s foot while three dashes streak past', ctx=> mine(ctx));
E('playdead', 'Thanatosis', 'Thanatosis: it plays dead at 1 Health', 'statusFx thanatosis → SkillFX.playDead (fx10Vfx)', 'playDead', 'playDeadFlop',
  'A grey hush falls over the card, two crossed-out eyes pop up, a little ghost floats out, looks both ways and slips back in', ctx=> mine(ctx));
})();
