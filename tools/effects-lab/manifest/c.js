// Batch C lab registrations (2026-10-15): status wear-offs and lost turns, deaths, castle, summons and spawns.
// One FXLAB.register per inventory id; play(ctx) calls the batch's game function FX.C.* on the stage (or, for effects that
// already exist, the game's own function or CSS). Contract and checklist: docs/effects-lab-contract.md.
(function(){
const R = FXLAB.register, X = ()=> window.FX.C, W = window;
// Lab stand-ins (only when missing) for game helpers that the lab's copy of the game code calls but doesn't carry, so the live
// looks (fallDeathVfx, leaderThroneVfx, bossEntrance) run here unchanged. The game itself never loads this file.
if(typeof W.biomePuff !== 'function') W.biomePuff = el=> W.leafPuff && W.leafPuff(el);
if(typeof W.boardCardEl !== 'function') W.boardCardEl = uid=> document.querySelector(`.board-card[data-uid="${uid}"]`);
if(typeof W.hqTileEl !== 'function') W.hqTileEl = side=> document.querySelector(`[data-hq="${side}"]`);
if(typeof W.noteMatchFx !== 'function') W.noteMatchFx = ()=>{};
if(typeof W.getCardDefs !== 'function') W.getCardDefs = ()=> ({});
if(typeof W.shakeEl !== 'function') W.shakeEl = ()=>{};
if(typeof W.shakeStrengthForArrival !== 'function') W.shakeStrengthForArrival = hp=> Math.min(1, (hp||20)/60);
if(typeof W.battlefieldShake !== 'function') W.battlefieldShake = s=>{ const bf = document.getElementById('battlefieldEl'); if(bf && W.gsap) gsap.fromTo(bf, {x:0}, {keyframes:[{x:-7*s}, {x:6*s}, {x:-3*s}, {x:0}], duration:.4, ease:'none', clearProps:'x'}); };
if(typeof W.LEADER_THRONE_FX_MS === 'undefined') W.LEADER_THRONE_FX_MS = 1700;
if(typeof W.KIND_LABEL === 'undefined') W.KIND_LABEL = {boss:'👑 Boss', raidboss:'👑 Raid boss', finalboss:'👑 Final boss'};

const B = ctx=> ctx.board, foe = (ctx, i)=> ctx.board.foe[i == null ? 0 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 0 : i];
const live = name=> typeof W[name] === 'function';
// A status shown on the card first (its tint class), so its wear-off reads as the status leaving.
const STATUS_CLS = {poison:'is-poisoned', bleed:'is-bled', frozen:'is-frozen', asleep:'is-asleep', paralyzed:'is-paralyzed', stunned:'is-stunned', staggered:'is-staggered',
  blind:'is-blind', tipsy:'is-tipsy', confused:'is-confused', shocked:'is-shocked', corrode:'is-corroded', petrified:'is-petrified'};
const wearOff = key=> async ctx=>{ const el = foe(ctx); const cls = STATUS_CLS[key]; if(cls) el.classList.add(cls); await ctx.wait(450); if(cls) el.classList.remove(cls); return X().statusEnd(el, key); };
const deathOf = (fn, pick)=> ctx=> X()[fn]((pick || foe)(ctx), {});

// ===================================================== statuses =====================================================
const WEAR = [['st-poison-expire', 'poison'], ['st-bleed-expire', 'bleed'], ['st-decay-expire', 'decay'], ['st-sleep-expire', 'asleep'], ['st-paralyze-expire', 'paralyzed'],
  ['st-stun-expire', 'stunned'], ['st-stagger-expire', 'staggered'], ['st-blind-expire', 'blind'], ['st-tipsy-expire', 'tipsy'], ['st-confuse-expire', 'confused'], ['st-shock-expire', 'shocked'],
  ['st-corrode-expire', 'corrode'], ['st-expose-expire', 'exposed'], ['st-daunt-expire', 'daunt'], ['st-wither-expire', 'wither'], ['st-irradiation-expire', 'irradiation'], ['st-smoke-expire', 'smoke'],
  ['st-scar-expire', 'scar']];
WEAR.forEach(([id, key])=> R({id, stage:'board', inGameHook:`onEvent: statusEnd {status:'${key}'} (new engine event, pushed when the status runs out)`,
  note:'The status tint shows first, then its own goodbye and a chip naming it.', variants:[{key:'A', label:(X().STATUS_END[key] || {}).label || key, play:wearOff(key)}]}));
R({id:'st-freeze-expire', stage:'board', inGameHook:"onEvent: statusEnd {status:'frozen'} (the last freeze counter melts)", note:'A: the ice cracks and falls off in shards. B: the old thaw float only.', variants:[
  {key:'A', label:'Ice cracks off in shards', play:wearOff('frozen')},
  {key:'B', label:'Before: the thaw float', play:async ctx=>{ const el = foe(ctx); el.classList.add('is-frozen'); await ctx.wait(450); el.classList.remove('is-frozen'); ctx.float(el, '💧 Thawed', 'heal'); return ctx.wait(1000); }}]});
R({id:'st-petrified-end', stage:'board', inGameHook:"onEvent: statusEnd {status:'petrified'} (round start, volcano)", variants:[{key:'A', label:'The stone cracks off', play:wearOff('petrified')}]});
R({id:'st-sleep-wake', stage:'board', inGameHook:"onEvent: statusEnd {status:'asleep', woke:true} → plays when the waking blow lands", variants:[
  {key:'A', label:'Jolt, "!" and the Zs scatter', play:async ctx=>{ const el = foe(ctx); el.classList.add('is-asleep'); await ctx.wait(400); ctx.float(el, '-2'); el.classList.remove('is-asleep'); return X().wakeJolt(el); }}]});
const SKIPS = [['st-freeze-skip', 'frozen', 'is-frozen'], ['st-sleep-skip', 'asleep', 'is-asleep'], ['st-stun-skip', 'stunned', 'is-stunned'], ['st-chained-skip', 'chained', 'is-chained'],
  ['st-petrified-skip', 'petrified', 'is-petrified'], ['st-shell-skip', 'shell', ''], ['st-ritual-skip', 'ritual', ''], ['st-zero-attack-skip', 'zeroAttack', '']];
SKIPS.forEach(([id, reason, cls])=> R({id, stage:'board', inGameHook:`onEvent: skipTurn {reason:'${reason}'}`, variants:[{key:'A', label:X().LOST_LABEL ? X().LOST_LABEL[reason] : reason,
  play:async ctx=>{ const el = foe(ctx); if(cls) el.classList.add(cls); await ctx.wait(250); return X().lostTurn(el, reason); }}]}));
R({id:'st-paralyze-coinflip', stage:'board', inGameHook:"onEvent: skipTurn {reason:'paralyzed'} (the engine only reports failed flips)", note:'The flip itself, over the card. B shows the lucky side, for comparison.', variants:[
  {key:'A', label:'Tails: sparks and a jolt', play:async ctx=>{ const el = foe(ctx); el.classList.add('is-paralyzed'); await ctx.wait(200); return X().coinFlip(el); }},
  {key:'B', label:'Heads: it acts', play:async ctx=>{ const el = foe(ctx); el.classList.add('is-paralyzed'); await ctx.wait(200); return X().coinFlip(el, {heads:true}); }}]});
R({id:'st-cower-skip', stage:'board', inGameHook:"existing: statusFx cower → SkillFX.fearShiver", variants:[{key:'A', label:'Now: shiver and "🫣 Hides" (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('neutralTick'); W.SkillFX.fearShiver(el); ctx.float(el, '🫣 Hides', 'debuff'); return ctx.wait(1300); }}]});

// ===================================================== deaths =====================================================
// The game's own looks (live functions from the lab's copy of the game code).
// (a flyer needs flyerFallVfx, which older lab copies lack: it then takes the plain topple)
const fall = el=>{ if(!live('fallDeathVfx')) return; if(!live('flyerFallVfx')) el.classList.remove('is-flying'); W.fallDeathVfx(el, 620); };
R({id:'death-fall', stage:'board', inGameHook:"deathVfx → fallDeathVfx (physical / unknown cause)", variants:[{key:'A', label:'Straight drop, leaves and dust (live; 2026-10-16, was a topple)', play:ctx=>{ ctx.sound('death'); fall(foe(ctx)); return ctx.wait(1400); }}]});
R({id:'death-flyer-fall', stage:'board', inGameHook:"deathVfx → fallDeathVfx → flyerFallVfx (is-flying)", note:'Needs flyerFallVfx in the lab copy (sync_fx_src.py --add flyerFallVfx,biomePuff); without it the lab shows the feathers over a plain fall.', variants:[
  {key:'A', label:'Drops out of the sky, feathers burst (live)', play:ctx=>{ const el = mine(ctx, 1); ctx.sound('death');
    if(live('flyerFallVfx')) W.fallDeathVfx(el, 620); else { const f = foe(ctx); W.featherBurst && W.featherBurst(f); fall(f); } return ctx.wait(1400); }}]});
R({id:'death-burn', stage:'board', inGameHook:"deathVfx → burnAwayVfx (heat)", variants:[{key:'A', label:'Burns away from a ragged edge (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('burnAway'); W.burnAwayVfx(el, 600); ctx.gsap.to(el, {scale:.94, y:4, duration:.6}); return ctx.wait(1300); }}]});
R({id:'death-poison', stage:'board', inGameHook:"deathVfx → bleedOutVfx(poison) + SkillFX.elementDeath", variants:[{key:'A', label:'Green wash and drips (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('bleedOut', 'poison'); W.bleedOutVfx(el, 670, 'poison'); W.SkillFX.elementDeath(el, 'poison', {particlesOnly:true}); ctx.gsap.to(el, {opacity:0, scale:.92, y:12, duration:.26, delay:.4}); return ctx.wait(1300); }}]});
R({id:'death-cold', stage:'board', inGameHook:"deathVfx → ProcFX.shatter + SkillFX.elementDeath cold", variants:[{key:'A', label:'Ice shards fly (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('iceShatter'); W.ProcFX.shatter(el.querySelector('.card-tile'), {seed:'lab', power:.75, gravity:1.2}); W.SkillFX.elementDeath(el, 'cold', {particlesOnly:true}); return ctx.wait(1400); }}]});
R({id:'death-bleed', stage:'board', inGameHook:"deathVfx → bleedOutVfx(bleed)", variants:[{key:'A', label:'Red wash and drops (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('bleedOut', 'bleed'); W.bleedOutVfx(el, 670, 'bleed'); ctx.gsap.to(el, {opacity:0, scale:.92, y:12, duration:.26, delay:.4}); return ctx.wait(1300); }}]});
R({id:'death-token', stage:'board', inGameHook:"deathVfx → pixelShatterVfx (token)", variants:[{key:'A', label:'Pixel shatter (live)', play:ctx=>{ const el = foe(ctx, 2); el.classList.add('is-token'); ctx.sound('pixelShatter'); W.pixelShatterVfx(el, 530); return ctx.wait(1200); }}]});
R({id:'death-skull', stage:'board', inGameHook:"deathVfx (.death-skull) on every death but falls, tokens and ice", variants:[{key:'A', label:'Skull floats up over a bleed-out', play:ctx=>{ const el = foe(ctx); W.bleedOutVfx(el, 670, 'bleed'); return X().skullFloat(el); }}]});
R({id:'death-kill-emote', stage:'board', inGameHook:"maybeEmote(killer, 'kill')", variants:[{key:'A', label:'The killer gloats (live bubble)', play:ctx=>{ fall(foe(ctx)); ctx.wait(350).then(()=>{ try{ W.showSpeechBubble(mine(ctx), '😤'); }catch(e){} }); return ctx.wait(1800); }}]});
R({id:'death-speech', stage:'board', inGameHook:"maybeSpeak(uid, 'onDeath')", variants:[{key:'A', label:'A last line (live bubble)', play:ctx=>{ try{ W.showSpeechBubble(foe(ctx), 'Tell the river… I held.'); }catch(e){} ctx.wait(500).then(()=> fall(foe(ctx))); return ctx.wait(2000); }}]});
R({id:'death-bounty', stage:'board', inGameHook:"bounty → itemDropVfx", variants:[{key:'A', label:'A log bounces out (live)', play:ctx=>{ const el = foe(ctx); fall(el);
  if(live('itemDropVfx')) W.itemDropVfx(el.dataset.uid, '🪵');
  else { const d = document.createElement('div'); d.className = 'item-drop'; d.textContent = '🪵'; el.appendChild(d); ctx.sound('itemDrop'); ctx.gsap.set(d, {position:'absolute', left:'50%', top:6, xPercent:-50});
    ctx.gsap.timeline({onComplete:()=> d.remove()}).to(d, {y:34, x:-10, duration:.22}).to(d, {y:64, x:-20, rotate:20, duration:.4, ease:'bounce.out'}).to(d, {opacity:0, duration:.18}); }
  return ctx.wait(1400); }}]});
R({id:'death-collapse-in', stage:'board', inGameHook:"collapseIn → Flip glide + .collapse-landed", variants:[{key:'A', label:'The row closes the gap (Flip)', play:async ctx=>{ const row = B(ctx).rowFoe, gone = foe(ctx, 1); fall(gone); await ctx.wait(800);
  const rest = [...row.querySelectorAll(':scope > .board-card')].filter(x=> x !== gone); const st = W.Flip ? Flip.getState(rest) : null; gone.remove(); ctx.sound('shift');
  if(st) Flip.from(st, {duration:.35, ease:'power2.out'}); rest.forEach(r=> r.classList.add('collapse-landed')); await ctx.wait(700); }}]});
R({id:'death-revive-save', stage:'board', inGameHook:"revive → SkillFX.reviveRise", variants:[{key:'A', label:'Pillar of light lifts it back (live)', play:ctx=>{ const el = foe(ctx); ctx.sound('buffUp'); W.SkillFX.reviveRise(el); ctx.float(el, '✨ Revived!', 'gold'); return ctx.wait(1500); }}]});

// New cause looks (game: deathVfx asks FX.C.hooks.deathLook first; A plays in fights).
const CAUSES = [
  ['death-lightning', 'deathLightning', 'Electricity, Dragon Lightning, Shock bolts', [['A', 'Struck, charred and crackling'], ['B', 'X-ray flash, crumbles to cinders'], ['C', 'Electric bats: arcs crawl, pops into sparks']]],
  ['death-magic', 'deathMagic', 'magic damage (Map 50+)', [['A', 'Dissolves into rising arcane motes'], ['B', 'Rune seal folds it into a star']]],
  ['death-psychic', 'deathPsychic', 'Psychic', [['A', 'Violet glass cracks, the face splits'], ['B', 'Mind blown: ripples, blur, spiral']]],
  ['death-wither', 'deathWither', 'Wither ticks', [['A', 'Black ash crumble with a skull'], ['B', 'Wilts and browns, dry leaves fall']]],
  ['death-irradiation', 'deathIrradiation', 'Irradiation', [['A', 'Green glow to a dark silhouette'], ['B', 'Meltdown flicker, ☢ flash, collapse']]],
  ['death-water', 'deathWater', 'Tsunami / Tide-spout / water damage', [['A', 'A wave carries it off'], ['B', 'The water rises and it sinks']]],
  ['death-crushed', 'deathCrushed', 'Earthquake, Landslide, Meteor, Comet (A); Avalanche (B)', [['A', 'Rocks flatten it into the dust'], ['B', 'Buried under an avalanche']]],
  ['death-explode', 'deathExplode', 'Explode, Dynamite', [['A', 'Blast, shockwave, scorched scraps'], ['B', 'Cartoon kaboom, spins away']]],
  ['death-petrified', 'deathPetrified', 'any death while petrified', [['A', 'Cracks spread, breaks into stone'], ['B', 'The statue topples into rubble']]],
  ['death-curse', 'deathCurse', 'curse ticks (Desecrate)', [['A', 'A black sigil swallows it'], ['B', 'Shadow hands drag it under']]],
  ['death-true', 'deathTrue', 'true / ichor damage', [['A', 'Golden ichor drains it pale'], ['B', 'Gilded, then blown away as gold dust']]],
];
CAUSES.forEach(([id, fn, src, vs])=> R({id, stage:'board', inGameHook:`deathVfx → hooks.deathLook: last hurt by ${src}`, note:'A plays in fights; the others are alternatives to choose from.',
  variants:vs.map(([k, label])=> ({key:k, label, play:deathOf(k === 'A' ? fn : fn + '_' + k)}))}));
R({id:'death-acid', stage:'board', inGameHook:"deathVfx → hooks.deathLook: last hurt by acid", note:'A is new; B is the old poison drip it used to borrow.', variants:[
  {key:'A', label:'Melts with a yellow-green fizz', play:deathOf('deathAcid')},
  {key:'B', label:'Before: the poison drip', play:ctx=>{ const el = foe(ctx); W.bleedOutVfx(el, 670, 'poison'); ctx.gsap.to(el, {opacity:0, scale:.92, y:12, duration:.26, delay:.4}); return ctx.wait(1300); }}]});
R({id:'death-decay', stage:'board', inGameHook:"deathVfx → hooks.deathLook: last hurt by decay", note:'A is new; B is the old poison drip it used to borrow.', variants:[
  {key:'A', label:'Mould blooms, it crumbles, mushrooms pop', play:deathOf('deathDecay')},
  {key:'B', label:'Before: the poison drip', play:ctx=>{ const el = foe(ctx); W.bleedOutVfx(el, 670, 'poison'); ctx.gsap.to(el, {opacity:0, scale:.92, y:12, duration:.26, delay:.4}); return ctx.wait(1300); }}]});
R({id:'death-sacrificed', stage:'board', inGameHook:"deathVfx → hooks.deathLook: sacrifice / statusFx sacrificed", note:'A is new; B is the jaws then the plain fall.', variants:[
  {key:'A', label:'Red sigil, burns to ash upward', play:deathOf('deathSacrificed')},
  {key:'B', label:'Before: jaws, then the topple', play:async ctx=>{ const el = foe(ctx); ctx.float(el, '🦷 Sacrifice', 'debuff'); el.classList.add('sac-chomp'); await ctx.wait(650); el.classList.remove('sac-chomp'); fall(el); await ctx.wait(1300); }}]});
R({id:'death-leader', stage:'board', inGameHook:"deathVfx → hooks.deathLook: the leader / King. B (its own whole death) plays in fights; when a cause look applies (lightning, water…) A's crown tumbles over that instead",
  note:'B is used in the game: the most important unit gets its own fall. A is the add-on that rides on a cause death.', variants:[
  {key:'A', label:'Add-on: crown tumbles off, banner tears', play:ctx=>{ const el = foe(ctx); el.classList.add('is-leader'); ctx.sound('death'); fall(el); return X().leaderFall(el); }},
  {key:'B', label:'The King falls: gold flash, kneels, crown cracks, banner lowered', play:ctx=>{ const el = foe(ctx); el.classList.add('is-leader'); return X().kingFall(el); }},
  {key:'C', label:'Your leader falls (blue banner)', play:ctx=>{ const el = mine(ctx, 1); el.classList.add('is-leader'); return X().kingFall(el, {title:'Leader'}); }}]});
// Exile / Nullify deaths (2026-10-15, user: "exile/nullify" among the deaths): registered on Exile-from-board (batch A's entry) as G/H so
// the keys can't collide with batch A's own A–F. In the game: a death event flagged nullified / exiled → hooks.deathLook → deathExile.
R({id:'sk-exile-board', stage:'board', inGameHook:"batch C: death {nullified | exiled} → hooks.deathLook → FX.C.deathExile (G)", variants:[
  {key:'G', label:'Batch C death: unmade, folds shut like an old screen', play:deathOf('deathExile')},
  {key:'H', label:'Batch C death: pulled into a rift to the Removal Zone', play:deathOf('deathExile_B')}]});
R({id:'death-boss', stage:'board', inGameHook:"deathVfx → hooks.deathLook: enemy leader of a boss node / boss def; the round waits (noteMatchFx)", note:'A big moment: about 2.3 s.', variants:[
  {key:'A', label:'Freeze-frame, gold shockwaves, shatter, "Defeated!"', play:ctx=> X().bossDeath(foe(ctx), {host:B(ctx).el, name:'Thornback Boar'})}]});
R({id:'death-egg', stage:'board', inGameHook:"deathVfx → hooks.deathLook: a hatchInto card", variants:[{key:'A', label:'Shell cracks in two, a sad puff', play:deathOf('deathEgg')}]});
R({id:'death-structure', stage:'board', inGameHook:"deathVfx → hooks.deathLook: a Structure card (A)", variants:[
  {key:'A', label:'Slumps, planks tumble, dust', play:deathOf('deathStructure')}, {key:'B', label:'Tips over sideways and breaks', play:deathOf('deathStructure_B')}]});
// 2026-10-17 (user: "...don't do this for shinies ... foils - not needed also. But this effect is nice for like - prism related deaths
// (skills relating to light or rainbows. add that btw - and save this effect)"): retired from shiny / foil deaths (they die like anyone
// else); the same sheen is the Prism death below.
R({id:'death-shiny-foil', stage:'board', inGameHook:"retired 2026-10-17: shiny / foil units get no add-on; the sheen moved to death-prism", variants:[
  {key:'A', label:'Retired: shiny / foil die like anyone (plain fall)', play:ctx=>{ const el = foe(ctx); el.classList.add('is-shiny'); ctx.sound('death'); fall(el); return ctx.wait(1200); }}]});
R({id:'death-prism', stage:'board', inGameHook:"deathVfx → hooks.deathLook add-on: the unit has a light / rainbow skill (FX.C.PRISM_SKILLS: Illuminate, Lantern, Reflect; reserved: Prism, Rainbow, Radiant, Dazzle, Refract)", variants:[
  {key:'A', label:'Prism death: a rainbow sheet lifts off and flutters away in sparkles', play:ctx=>{ const el = foe(ctx); ctx.sound('death'); fall(el); return X().deathPrism(el); }}]});
R({id:'death-lethal-number', stage:'board', inGameHook:"deathVfx → hooks.deathLook add-on: the last blow's number (A)", variants:[
  {key:'A', label:'Number slammed with ✖', play:ctx=>{ const el = foe(ctx); ctx.float(el, '-7'); ctx.wait(250).then(()=> fall(el)); return ctx.wait(250).then(()=> X().lethalStamp(el, {dmg:7})); }},
  {key:'B', label:'"KO!" burst', play:ctx=>{ const el = foe(ctx); ctx.float(el, '-7'); ctx.wait(250).then(()=> fall(el)); return ctx.wait(250).then(()=> X().lethalStamp_B(el)); }},
  {key:'C', label:'A red ✖ alone', play:ctx=>{ const el = foe(ctx); ctx.float(el, '-7'); ctx.wait(250).then(()=> fall(el)); return ctx.wait(250).then(()=> X().lethalStamp_C(el)); }}]});
R({id:'death-ghost', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Turns see-through and drifts up', play:deathOf('deathGhost')}]});
R({id:'death-dragon', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Crashes down, scales scatter, a scale drops', play:ctx=> X().deathDragon(foe(ctx), {host:B(ctx).el})}]});
R({id:'death-supreme', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Prismatic burst in slow motion', play:deathOf('deathSupreme')}]});
R({id:'death-slime-split', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Sags into a blob that splits in two', play:deathOf('deathSlimeSplit')}]});

// ===================================================== castle =====================================================
const cFoe = ctx=> B(ctx).castleFoe, cMine = ctx=> B(ctx).castleMine;
R({id:'castle-hit', stage:'board', inGameHook:"existing: hitHQ → hqHitBigVfx", note:'Needs hqHitBigVfx in the lab copy (sync_fx_src.py --add hqHitBigVfx,hqHitTier,playEarthquake); else ProcFX castle damage stands in.', variants:[
  {key:'A', label:'Shake, burst, rumble (live)', play:ctx=>{ const c = cFoe(ctx); ctx.sound('hitAt', 6, true); if(live('hqHitBigVfx')) W.hqHitBigVfx(c, 8); else if(W.ProcFX && ProcFX.castleDamage) ProcFX.castleDamage(c, {dmg:8}); ctx.float(c, '−8', 'hq-big'); return ctx.wait(1200); }}]});
R({id:'castle-hp-number', stage:'board', inGameHook:"existing: displayHqDamage → .bf-hp.is-hit", variants:[{key:'A', label:'The HP number ticks (game CSS)', play:async ctx=>{ const h = B(ctx).hpFoe; if(h){ h.classList.remove('is-hit'); void h.offsetWidth; h.classList.add('is-hit'); } ctx.sound('hitAt', 4, true); await ctx.wait(700); if(h) h.classList.remove('is-hit'); }}]});
R({id:'castle-crack-1', stage:'board', variants:[{key:'C', label:'Hummingbird nest: woven twigs snap (FX.C)', play:ctx=>{ const c = cFoe(ctx); ctx.sound('hitAt', 6, true); return X().nestSnap(c); }}]});
R({id:'castle-danger', stage:'board', inGameHook:"existing: body.castle-danger (DangerPulse) + heartbeat", variants:[{key:'A', label:'Red edge pulse and heartbeat (game CSS)', play:async ctx=>{ document.body.classList.add('castle-danger'); ctx.sound('heartbeat'); await ctx.wait(2400); document.body.classList.remove('castle-danger'); }}]});
R({id:'castle-regen', stage:'board', inGameHook:"onEvent: castleRegen {amount, perk}", variants:[{key:'A', label:'Green mortar stitches knit the wall', play:ctx=> X().castleRegen(cFoe(ctx), {amount:2})}]});
R({id:'castle-lumber', stage:'board', inGameHook:"onEvent: lumber {castle | perk}", variants:[{key:'A', label:'A log pops out and hops to the pill', play:ctx=> X().castleLumber(cMine(ctx), {dest:B(ctx).pillsMine})},
  {key:'B', label:'Everbloom perk: a blossom instead', play:ctx=> X().castleLumber(cMine(ctx), {dest:B(ctx).pillsMine, perk:true})}]});
R({id:'castle-ballista', stage:'board', inGameHook:"onEvent: statusFx castleBolt, then the castle's hit → the bolt lands with it", variants:[{key:'A', label:'Bronze bolt from the fort wall', play:ctx=> X().castleBolt(cMine(ctx), foe(ctx), {onImpact:()=> ctx.float(foe(ctx), '-2')})}]});
R({id:'castle-thorns', stage:'board', inGameHook:"onEvent: statusFx castleThorns", variants:[{key:'A', label:'A bramble lashes the attacker', play:ctx=> X().castleThorns(cMine(ctx), foe(ctx), {onImpact:()=> ctx.float(foe(ctx), '-1')})}]});
R({id:'castle-herb-heal', stage:'board', inGameHook:"onEvent: statusFx herbHeal", variants:[{key:'A', label:'Green steam drifts to the hurt ally', play:ctx=>{ const t = mine(ctx); ctx.wait(700).then(()=> ctx.float(t, '+3', 'heal')); return X().castleHerbHeal(cMine(ctx), t); }}]});
R({id:'castle-herb-bane', stage:'board', inGameHook:"onEvent: statusFx herbBane, then the castle's poison hit → the flask lands with it", variants:[{key:'A', label:'A bitter flask splashes the enemy', play:ctx=> X().castleHerbBane(cMine(ctx), foe(ctx, 2), {onImpact:()=> ctx.float(foe(ctx, 2), '-2', 'poison')})}]});
R({id:'castle-spawn', stage:'board', inGameHook:"onEvent: statusFx castleSpawn (+ the plays just before it)", variants:[{key:'A', label:'The gate swings open, a unit marches out', play:ctx=>{ X().castleGate(cMine(ctx)); return ctx.wait(250).then(()=> X().marchOut(cMine(ctx), mine(ctx))); }}]});
R({id:'castle-logjam', stage:'board', inGameHook:"onEvent: statusFx logjam (after the play lands)", variants:[{key:'A', label:'Logs tumble and stack in front', play:ctx=> X().logjam(mine(ctx), {amount:1})}]});
R({id:'castle-speech', stage:'board', inGameHook:"maybeSpeakHQ → fxHook('castleSpeech') replaces the units' bubble", note:'A is new; B is the units\' bubble it used.', variants:[
  {key:'A', label:'Stone-framed bubble, the castle hops', play:ctx=> X().castleSpeech(cFoe(ctx), 'You will not breach these walls!', {hold:1600})},
  {key:'B', label:'Before: the units\' bubble', play:ctx=>{ try{ W.showSpeechBubble(cFoe(ctx), 'You will not breach these walls!'); }catch(e){} return ctx.wait(2200); }}]});
R({id:'castle-friendly-hit', stage:'board', inGameHook:"onEvent: hitHQ {friendly} (your own boomerang)", variants:[{key:'A', label:'Sheepish wobble, sweat drop, "Oops!"', play:ctx=>{ const c = cMine(ctx); ctx.float(c, '−1'); return X().castleOops(c); }}]});
R({id:'castle-shield', stage:'board', inGameHook:"onEvent: hitHQ on a castle with Skirmish Armour (B when that hit breaks it)", variants:[
  {key:'A', label:'Hex dome flickers and ripples', play:ctx=> X().castleShield(cFoe(ctx))}, {key:'B', label:'The dome shatters', play:ctx=> X().castleShield_B(cFoe(ctx))}]});
R({id:'castle-enemy-leader-banner', stage:'board', inGameHook:"onEvent: play {leader} → the game's .leader-callout unfurls", note:'A is new; B is the plain pop-in.', variants:[
  {key:'A', label:'The callout unfurls like a banner', play:ctx=>{ const b = callout(ctx); return X().bannerUnfurl(b).then(()=> ctx.wait(900)).then(()=> b.remove()); }},
  {key:'B', label:'Before: it just appears', play:ctx=>{ const b = callout(ctx); return ctx.wait(1600).then(()=> b.remove()); }}]});
function callout(ctx){ const q = B(ctx).el.getBoundingClientRect(), b = document.createElement('div'); b.className = 'enemy-leader-banner leader-callout'; b.textContent = '👑 Thornback Boar joins the fight!';
  b.style.left = (q.left + q.width/2) + 'px'; b.style.top = (q.top + q.height*0.2) + 'px'; document.body.appendChild(b); return b; }
R({id:'castle-skin-future', stage:'board', inGameHook:'future', note:'Concept skins drawn over the castle tile.', variants:[
  {key:'A', label:'Otter river fort (palisade, river)', play:ctx=> X().castleSkin(cFoe(ctx), {kind:'otter'})},
  {key:'B', label:'Hummingbird cliff nest', play:ctx=> X().castleSkin_B(cFoe(ctx))},
  {key:'C', label:'Hive mound', play:ctx=> X().castleSkin_C(cFoe(ctx))}]});

// ===================================================== summons =====================================================
const landGlow = el=>{ el.classList.add('landing-impact'); setTimeout(()=> el.classList.remove('landing-impact'), 300);
  const ring = document.createElement('div'); ring.className = 'fx-burst summon-glow-ring'; el.appendChild(ring); setTimeout(()=> ring.remove(), 520);
  ['-16%', '116%'].forEach((left, i)=>{ const s = document.createElement('div'); s.className = 'fx-burst summon-spark'; s.textContent = '✨'; s.style.left = left; s.style.animationDelay = (i*40) + 'ms'; el.appendChild(s); setTimeout(()=> s.remove(), 560); }); };
const dropIn = (ctx, el, from)=>{ const t = el.querySelector('.card-tile'); ctx.gsap.fromTo(t, Object.assign({opacity:0, scale:.4, y:-52, rotate:-10}, from || {}), {opacity:1, scale:1, x:0, y:0, rotate:0, duration:.42, ease:'back.out(1.6)', clearProps:'transform,opacity'}); };
R({id:'sum-hand-play', stage:'board', inGameHook:"existing: play → entrance + playLandingImpact + playHandSummonGlow", variants:[{key:'A', label:'Lands with a gold ring and sparks (game CSS)', play:async ctx=>{ const el = mine(ctx); dropIn(ctx, el, {y:120, scale:.6, opacity:1}); ctx.sound('play'); await ctx.wait(420); landGlow(el); await ctx.wait(800); }}]});
R({id:'sum-enemy-play', stage:'board', inGameHook:"onEvent: play {side:'B'} (not leader / reserve) — a card back flips off as it flies in", note:'A is new; B is the fly-in alone.', variants:[
  {key:'A', label:'Flies in face down, flips face up', play:async ctx=>{ const el = foe(ctx); dropIn(ctx, el, {y:-150, scale:.6, opacity:1, rotate:0}); X().enemyCardFlip(el); await ctx.wait(1000); }},
  {key:'B', label:'Before: the fly-in only', play:async ctx=>{ dropIn(ctx, foe(ctx), {y:-150, scale:.6, opacity:1, rotate:0}); await ctx.wait(900); }}]});
R({id:'sum-reserve', stage:'board', inGameHook:"onEvent: play {reserve}", variants:[{key:'A', label:'Settles in behind the line, dimmed', play:async ctx=>{ const el = mine(ctx, 2); dropIn(ctx, el, {y:40}); await ctx.wait(200); await X().reserveIn(el); }}]});
R({id:'sum-advance', stage:'board', inGameHook:"onEvent: advance {from, to}", variants:[{key:'A', label:'Dust kick, speed lines, a hop and a squash', play:ctx=> X().stepUp(mine(ctx))}]});
R({id:'sum-big-arrival', stage:'board', inGameHook:"existing: battlefieldShake on play/spawn/hatch with maxHp > 20", variants:[{key:'A', label:'The field shakes as it lands (live shake)', play:async ctx=>{ const el = foe(ctx); dropIn(ctx, el); await ctx.wait(400); ctx.sound('boom'); W.battlefieldShake(.8); await ctx.wait(900); }}]});
R({id:'sum-leader', stage:'board', inGameHook:"existing: play {leader} → leaderThroneVfx", variants:[{key:'A', label:'Pillar, crown, ring shockwave (live)', play:ctx=>{ W.leaderThroneVfx(mine(ctx)); return ctx.wait(2400); }}]});
R({id:'sum-enemy-leader', stage:'board', inGameHook:"existing: play {leader} side B → leaderThroneVfx {enemy}", variants:[{key:'A', label:'Crimson pillar, drum (live)', play:ctx=>{ W.leaderThroneVfx(foe(ctx), {enemy:true}); return ctx.wait(2400); }}]});
R({id:'sum-gladiator', stage:'board', inGameHook:"onEvent: play {leader, gladiator}", variants:[{key:'A', label:'Arena sand burst, petals, the crowd roars', play:async ctx=>{ const el = mine(ctx); dropIn(ctx, el); await ctx.wait(300); await X().gladiatorSand(el); }}]});
R({id:'sum-boss-entrance', stage:'board', inGameHook:"existing: versus opener closes on a boss node → bossEntrance", variants:[{key:'A', label:'Quake, dust ring, "BOSS" title (live)', play:ctx=>{ W.bossEntrance({kind:'boss', name:'Thornback Boar', icon:'🐗'}); return ctx.wait(2200); }}]});
R({id:'sum-trigger-spawn', stage:'board', inGameHook:"existing: spawn {cause:'triggerSpawn'} → SkillFX.summonPortal (A)", note:'Rune colour per archetype: B and C are the colour options.', variants:[
  {key:'A', label:'Green rune portal (live)', play:ctx=>{ ctx.sound('buzz'); W.SkillFX.summonPortal(foe(ctx, 2)); return ctx.wait(1100); }},
  {key:'B', label:'Ashen Choir red rune', play:ctx=> X().runePortal(foe(ctx, 2), {color:'#e0402a', glow:'rgba(224,64,42,.8)'})},
  {key:'C', label:'Otter teal and bronze rune', play:ctx=> X().runePortal(foe(ctx, 2), {color:'#3fb8b0', glow:'rgba(201,162,90,.8)'})}]});
R({id:'sum-on-death-spawn', stage:'board', inGameHook:"existing: spawn {cause:'onDeathSpawn'} → entrance from the dying card + summonPortal", variants:[{key:'A', label:'Jumps out of the fallen card (live portal)', play:async ctx=>{ const a = foe(ctx, 1), b = foe(ctx, 2); fall(a); await ctx.wait(700);
  const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); dropIn(ctx, b, {x:r1.left - r2.left, y:r1.top - r2.top, scale:.16}); W.SkillFX.summonPortal(b); await ctx.wait(1000); }}]});
R({id:'sum-meiosis', stage:'board', inGameHook:"onEvent: spawn {kind:'meiosis'} (the green portal is skipped for it)", note:'A is new; B is the two portals it used.', variants:[
  {key:'A', label:'One cell pinches into two', play:ctx=>{ const a = foe(ctx, 0), b = foe(ctx, 2), m = foe(ctx, 1); const c = m.getBoundingClientRect(); m.style.visibility = 'hidden'; return X().meiosisSplit({x:c.left + c.width/2, y:c.top + c.height/2}, [a, b]); }},
  {key:'B', label:'Before: a portal on each half', play:ctx=>{ W.SkillFX.summonPortal(foe(ctx, 0)); W.SkillFX.summonPortal(foe(ctx, 2)); return ctx.wait(1100); }}]});
R({id:'sum-on-attacked', stage:'board', inGameHook:"existing: spawn {cause:'onAttackedSpawn'} → playBeeSpawnLanding", variants:[{key:'A', label:'Bouncy bee landing (game CSS)', play:async ctx=>{ const el = foe(ctx, 2); dropIn(ctx, el, {scale:.16, y:-30});
  await ctx.wait(380); el.classList.add('bee-landing'); const b = document.createElement('div'); b.className = 'fx-burst bee-land-burst'; b.textContent = '🐝'; el.appendChild(b); ctx.sound('buzz'); await ctx.wait(560); b.remove(); el.classList.remove('bee-landing'); }}]});
R({id:'sum-twin', stage:'board', inGameHook:"onEvent: spawn {kind:'twin'} (the green portal is skipped for it)", note:'A is new; B is the portal it used.', variants:[
  {key:'A', label:'A mirror copy peels off', play:ctx=> X().twinPeel(foe(ctx, 1), foe(ctx, 2))},
  {key:'B', label:'Before: the green portal', play:ctx=>{ W.SkillFX.summonPortal(foe(ctx, 2)); return ctx.wait(1100); }}]});
R({id:'sum-brood', stage:'board', inGameHook:"existing: spawn {kind:'brood'} → SkillFX.summonPortal", variants:[{key:'A', label:'Green rune portal (live)', play:ctx=>{ ctx.sound('buzz'); W.SkillFX.summonPortal(foe(ctx, 0)); return ctx.wait(1100); }}]});
R({id:'sum-skyfall', stage:'board', inGameHook:"onEvent: play / spawn of a Skyfall card → SkillFX.skyDrop", note:'The card crashes down (was Lab-only).', variants:[{key:'A', label:'Shadow grows, crash, dust ring', play:ctx=> new Promise(res=>{ W.SkillFX.skyDrop([foe(ctx)], {fall:420, onDone:res}); ctx.sound('launch'); })}]});
R({id:'sum-castle-spawn', stage:'board', inGameHook:"onEvent: statusFx castleSpawn → gate opens, each new unit marches out", note:'A is new; B is the portal look.', variants:[
  {key:'A', label:'Out through the gate', play:async ctx=>{ X().castleGate(cMine(ctx)); await ctx.wait(200); await X().marchOut(cMine(ctx), mine(ctx, 0)); }},
  {key:'B', label:'Before: a portal on each', play:ctx=>{ W.SkillFX.summonPortal(mine(ctx, 2)); return ctx.wait(1100); }}]});
R({id:'sum-remember', stage:'board', inGameHook:"onEvent: remember {uid}", note:'A is new; B is the float alone.', variants:[
  {key:'A', label:'Rises out of candle smoke', play:ctx=> X().rememberRise(foe(ctx))},
  {key:'B', label:'Before: the "+N/+N" float', play:ctx=>{ ctx.float(foe(ctx), '🕯️ +2/+2', 'gold'); return ctx.wait(1100); }}]});
R({id:'sum-hatch-battle', stage:'board', inGameHook:"existing: hatch → eggCrackVfx + .egg-hatched + unlockChime", note:'Needs eggCrackVfx in the lab copy (sync_fx_src.py --add eggCrackVfx).', variants:[{key:'A', label:'Shell halves fly, "🐣 Hatched!" (live)', play:ctx=>{ const el = foe(ctx), r = el.getBoundingClientRect();
  if(live('eggCrackVfx')) W.eggCrackVfx(r.left + r.width/2, r.top + r.height/2); ctx.sound('unlockChime'); el.classList.add('egg-hatched'); ctx.float(el, '🐣 Hatched!', 'gold'); return ctx.wait(1200); }}]});
R({id:'sum-egg-idle', stage:'board', inGameHook:"onEvent: play / waitTick of an egg card (cracks grow as Wait drops)", variants:[{key:'A', label:'Wobbles; cracks grow each tick', play:async ctx=>{ const el = foe(ctx); for(const p of [0, .4, .8]){ await X().eggWobble(el, {progress:p}); await ctx.wait(250); } }}]});
R({id:'sum-structure', stage:'board', inGameHook:"onEvent: play of a Structure card (B for ant/insect structures)", variants:[
  {key:'A', label:'Beaver timber scaffold rises', play:ctx=> X().structureBuild(mine(ctx))}, {key:'B', label:'Ant mound heaps up, acid lamps', play:ctx=> X().structureBuild_B(mine(ctx))}]});
R({id:'sum-mind-control-arrive', stage:'board', inGameHook:"onEvent: mindControl (after the re-render)", variants:[{key:'A', label:'Violet spiral, it becomes yours', play:ctx=> X().mindArrive(mine(ctx))}]});
R({id:'sum-devilry-drop', stage:'board', inGameHook:"onEvent: sacrifice (a Dark Summon dropped onto a unit)", variants:[{key:'A', label:'A hellish crack opens under it', play:ctx=> X().devilryCrack(mine(ctx))}]});
R({id:'sum-seen-new', stage:'board', inGameHook:"existing: .seen-new tag (matchState.newSeenUntil)", variants:[{key:'A', label:'"New" tag on a first-seen enemy (game CSS)', play:async ctx=>{ const el = foe(ctx); const s = document.createElement('div'); s.className = 'seen-new'; s.textContent = 'New!'; el.appendChild(s); ctx.sound('pitchChime'); await ctx.wait(1600); s.remove(); }}]});
R({id:'sum-sprout-token', stage:'board', inGameHook:"onEvent: spawn {kind:'sprout'} (the green portal is skipped for it)", note:'A is new; B is the portal it used.', variants:[
  {key:'A', label:'A seed pops from the soil, two leaves unfurl', play:ctx=> X().sproutPop(foe(ctx, 2))},
  {key:'B', label:'Before: the green portal', play:ctx=>{ W.SkillFX.summonPortal(foe(ctx, 2)); return ctx.wait(1100); }}]});
R({id:'sum-rooted-veggie', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Roots burrow into the felt', play:ctx=> X().rootTake(foe(ctx))}]});
R({id:'sum-dragon', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Sky darkens, wing shadow, roar, crash', play:ctx=> X().dragonArrive(foe(ctx), {host:B(ctx).el})}]});
R({id:'sum-supreme', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Prismatic shockwave', play:ctx=> X().supremeArrive(foe(ctx))}]});
R({id:'sum-wandering-mage', stage:'board', inGameHook:'future', variants:[{key:'A', label:'A wizard-cat in a puff of stars', play:ctx=> X().mageArrive(mine(ctx))}]});
R({id:'sum-drones-enemy-field', stage:'board', inGameHook:'future', variants:[{key:'A', label:'Drones drop onto their field', play:ctx=> X().dronesDrop(mine(ctx), [foe(ctx, 0), foe(ctx, 2)])}]});
})();
