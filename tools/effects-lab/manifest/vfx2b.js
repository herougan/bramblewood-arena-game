// Package VFX2 (2026-11-27, owner 15:40: "make more gif effects"; standing order 09:55: card, skill, field and boss VFX). Batch V lab registrations of
// the VFX2 looks (bramblewood-fx-v.js section 5, window.FX.V), key V2 (labels start "VFX2 ·"); each "Low" variant passes {level:'low'} (Effects Low).
// The older manifest/vfx2.js is package VFX2 of 2026-11-19 (Release 1.0 looks). GIFs: docs/screens/vfx2/.
(function(){
const R = FXLAB.register, V = ()=> window.FX.V, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const LOW = {level:'low'}, after = (ctx, p, ms)=> Promise.resolve(p).then(()=> ctx.wait(ms || 250)), snd = n=> V().sound(n);
// one entry: id, stage, its hook in the game, its cue, the look (ctx, o) and the two labels
const look = (id, hook, cue, fn, hi, lo, extra)=> R(Object.assign({id, stage:'board', inGameHook:hook, variants:[
  {key:'V2', label:'VFX2 · ' + hi, play:ctx=>{ if(cue) snd(cue); return after(ctx, fn(ctx, {})); }},
  {key:'V2L', label:'VFX2 · Effects Low: ' + lo, play:ctx=> after(ctx, fn(ctx, LOW))}]}, extra || {}));
// strikes
look('sk-gash', 'onEvent (bramblewood-fx-v.js): gash (On Play: 3 Bleed on the enemy facing it); the shared bleed drip steps aside', 'gashRip',
  (ctx, o)=>{ ctx.float(foe(ctx), '+3🩸', 'debuff'); return V().gashBleed(foe(ctx), o); }, 'A slash rips across the card, three drops of blood run from it (360 ms; gashRip)', 'the slash only');
look('atk-overwhelm-hq', 'onEvent: overwhelmHQ (Stampede\'s spill into the bramble); FX.A.stampede (paw-print emoji) steps aside', 'stampRumble',
  (ctx, o)=> V().stampedeRun(mine(ctx), ctx.board.castleFoe, o), 'A dust trail runs from the striker through to the bramble, a hoof stamp and chips (~400 ms; stampRumble)', 'three puffs and the stamp');
look('sk-pulverise', 'onEvent: statusFx pulverise (a landed swing broke the target\'s Armor / equipment)', 'plateShatter',
  (ctx, o)=> V().pulveriseShatter(foe(ctx), o), 'An armour plate shows, cracks and its shards fly apart (380 ms; plateShatter)', 'two shards');
look('atk-cull', 'onEvent: a hit by a Cull unit whose bonus landed (ui14HitBonus; \'weaker\': the replay\'s Attack), at the second number', 'cullRake',
  (ctx, o)=>{ ctx.float(foe(ctx), '-1'); return V().cullClaw(foe(ctx), o); }, 'A claw mark rakes the weakened unit, two drops (340 ms; cullRake)', 'the claw mark only');
// statuses
look('sk-constrict', 'onEvent: statusFx constrict; Bind\'s vines (SkillFX.vineBind) step aside', 'coilSqueeze', (ctx, o)=> V().constrictCoil(foe(ctx), o), 'Three coils wrap the card and tighten (380 ms; coilSqueeze)', 'one coil');
look('sk-web', 'onEvent: statusFx webbed; Bind\'s vines step aside', 'webSpin', (ctx, o)=> V().webNet(foe(ctx), o), 'A net spins out over the card, sags as it settles, sticks to the corners (400 ms; webSpin)', 'the net only');
look('sk-intimidate', 'onEvent: play of an Intimidate unit (no event of its own; the foe facing it is the one nearest across)', 'glareGrowl',
  (ctx, o)=> V().intimidateGlare(mine(ctx), foe(ctx), o), 'A glare from the unit; the foe facing it shrinks back with a bead of sweat (380 ms; glareGrowl)', 'the glare only');
look('st-decay-tick', 'onEvent: decayTick (once a round a unit); FX.B.decayTick steps aside', 'rotCreep', (ctx, o)=> V().decayRot(foe(ctx), o), 'Green rot creeps up from the card\'s foot, spores lift (~400 ms; rotCreep)', 'one blotch');
look('sk-exploit', 'onEvent: statusFx exploit (its hits put Exploit tokens on the target)', 'lockOn', (ctx, o)=> V().exploitLock(foe(ctx), o), 'Four brackets snap onto a weak point, a red diamond blinks (380 ms; lockOn)', 'the brackets only');
look('sk-embrittle', 'onEvent: statusFx brittle (Embrittle\'s Fragile)', 'iceCrack', (ctx, o)=> V().embrittleCrack(foe(ctx), o), 'Ice-blue cracks spread from the hit, two glints (380 ms; iceCrack)', 'the cracks only');
// deaths and growth
look('sk-harbinger', 'onEvent: triggerFired onAnyDeath of a Harbinger unit (its +1/+1)', 'crowCaw', (ctx, o)=> V().harbingerFeathers(mine(ctx), o), 'Crow feathers drift in and gather into the card, a plus (~420 ms; crowCaw)', 'two feathers');
look('sk-carrion', 'onEvent: statusFx carrion (another unit died, it heals)', 'peck', (ctx, o)=>{ ctx.float(mine(ctx), '🦴 +2', 'heal'); return V().carrionPeck(mine(ctx), o); }, 'A beak pecks three times as it feeds, a plus (380 ms; peck)', 'one peck');
look('sk-carnage', 'onEvent: statusFx stateSkill carnage on (it has seen its third enemy die)', 'moonPulse', (ctx, o)=> V().carnageMoon(mine(ctx), o), 'A blood moon rises over the card and pulses twice (600 ms; moonPulse)', 'the moon only');
R({id:'sk-momentum', stage:'board', inGameHook:'onEvent: statusFx momentum (a kill); the flame grows with each kill this fight; FX.A.momentumTrail steps aside', variants:[
  {key:'V2', label:'VFX2 · A kill-streak flame at the corner, flickering: first, second, third kill (400 ms each; flameUp)', play:ctx=>{ const p = n=>{ snd('flameUp'); return V().momentumFlame(mine(ctx), {stacks:n}); };
    return p(1).then(()=> ctx.wait(200)).then(()=> p(2)).then(()=> ctx.wait(200)).then(()=> p(3)).then(()=> ctx.wait(250)); }},
  {key:'V2L', label:'VFX2 · Effects Low: the flame, no flicker', play:ctx=> after(ctx, V().momentumFlame(mine(ctx), {stacks:2, level:'low'}))}]});
look('sum-progeny-brood', 'onEvent: spawn by Progeny (onDeathSpawn, not Meiosis) or Offspring, each new unit; the summon portal steps aside', 'broodPop',
  (ctx, o)=> Promise.all([0, 2].map((i, k)=> ctx.wait(k*60).then(()=> V().broodBurst(foe(ctx, i), o)))), 'A spotted brood pod splits where each new unit lands, grubs wriggle out (360 ms; broodPop)', 'the pod halves only');
// team
look('sk-fletcher', 'onEvent: arrow from a side with a Fletcher unit, at the arrow\'s impact, once a round an archer', 'quillGlint', (ctx, o)=> V().fletcherGlint(foe(ctx), o), 'A feather twirls down onto the arrow\'s mark and glints (360 ms; quillGlint)', 'the glint only');
look('sk-herbalist', 'onEvent: heal on a side with a Herbalist unit (once a round a unit)', 'leafSwirl', (ctx, o)=>{ ctx.float(mine(ctx), '+3', 'heal'); return V().herbLeaves(mine(ctx), o); }, 'Leaves swirl round the healed unit and lift away (400 ms; leafSwirl)', 'two leaves');
look('sk-pack-leader', 'onEvent: play of a Pack Leader: its Pack units on that side', 'howlRing', (ctx, o)=> V().packHowlRings(foe(ctx), [foe(ctx, 0), foe(ctx, 2)], o), 'Howl rings rise off the leader, dotted links to each packmate, a paw on each (~500 ms; howlRing)', 'the rings only');
look('sk-repair', 'onEvent: heal {cause: repair} on a structure, rebuild {repair} on the bramble', 'hammerTink', (ctx, o)=> V().repairSparks(mine(ctx), o), 'A hammer swings down twice, sparks at each blow (400 ms; hammerTink)', 'one swing, no sparks');
// triggers: one entry, a variant per kind
R({id:'sk-trigger-fired', stage:'board', note:'VFX2: the four trigger kinds get their own opener and cue; the ⚡ badge glow (triggerFiredVfx) stays for the other hooks and at Effects None / reduced motion.',
  inGameHook:'onEvent: triggerFired {hook: onSpawn | onDeath | onAttack | onReady} → FX.V.trigLook, then the action\'s own look; triggerFiredVfx steps aside (FX.V.owns)', variants:
  [['onSpawn', '⬆️ On Play: arrows burst up off the card (280 ms; trigRise)', 'trigRise'], ['onDeath', '💀 On Death: a skull wisp rises (300 ms; trigWisp)', 'trigWisp'],
   ['onAttack', '⚔️ On Attack: two swords cross, a flash (300 ms; trigClash)', 'trigClash'], ['onReady', '✅ On Ready: a check stamps in, a ring (300 ms; trigCheck)', 'trigCheck']]
  .map(([h, label, cue], i)=> ({key:'V2' + 'ABCD'[i], label:'VFX2 · ' + label, play:ctx=>{ snd(cue); return after(ctx, V().trigLook(mine(ctx), h)); }}))
  .concat([{key:'V2L', label:'VFX2 · Effects Low: one arrow, the skull, one sword, the check', play:ctx=> ['onSpawn', 'onDeath', 'onAttack', 'onReady'].reduce((p, h)=> p.then(()=> V().trigLook(mine(ctx), h, LOW)).then(()=> ctx.wait(150)), Promise.resolve())}])});
// SKILLS3-B
look('sk-wet-chain', 'onEvent: statusFx wetChain (shock on a Wet unit chains through the Wet units touching it); SkillFX.lightning steps aside', 'wetZap',
  (ctx, o)=> V().shockHop(foe(ctx, 0), [foe(ctx, 1), foe(ctx, 2)], o), 'A bolt hops unit to unit through the Wet chain, a spark at each (70 ms a hop; wetZap)', 'the bolts only');
look('sk-warning-colours', 'onEvent: statusFx warningColours (its killer is poisoned; the enemies that saw it avoid your other Warning Colours units)', 'warnPulse',
  (ctx, o)=> V().warningPulse(mine(ctx), foe(ctx) ? [foe(ctx, 0), foe(ctx, 1)] : [], o), 'A hazard sign pulses where it fell; the enemies that saw it flinch back with a "!" (400 ms; warnPulse)', 'the sign only');
R({id:'sk-rend-around', stage:'board', inGameHook:'onEvent: triggerFired onDeath {action: rend} of a 💀 Rend {around} unit: the skull wisp, the burst 240 ms later, then a mark on each unit its rend events hit (on no card yet)', variants:[
  {key:'V2', label:'VFX2 · 💀 Rend around: the skull wisp, red shards burst to every unit beside and facing it, a cracked heart on each (rendBurst)', play:ctx=>{ const src = mine(ctx); snd('trigWisp'); V().trigLook(src, 'onDeath');
    return ctx.wait(240).then(()=>{ snd('rendBurst'); V().rendAround(src); return ctx.wait(140); }).then(()=> Promise.all([mine(ctx, 0), mine(ctx, 2), foe(ctx)].map(t=> V().rendMark(t)))).then(()=> ctx.wait(250)); }},
  {key:'V2L', label:'VFX2 · Effects Low: four shards, the hearts', play:ctx=> V().rendAround(mine(ctx), LOW).then(()=> Promise.all([mine(ctx, 0), foe(ctx)].map(t=> V().rendMark(t, LOW)))).then(()=> ctx.wait(250))}]});
const tokenOn = (ctx, n)=>{ const c = foe(ctx), b = document.createElement('span'); b.className = 'abadge exploit vulnerable'; b.textContent = '💔' + n; const host = c.querySelector('.badges') || c; host.appendChild(b); return b; };
R({id:'st-token-tick', stage:'board', inGameHook:'fxHook cardStatusShown / boardRendered: a Vulnerable / Feeble / Sturdy / Mighty badge whose number dropped (the upkeep took one; no event of its own)', variants:[
  {key:'V2', label:'VFX2 · The badge dips and a -1 lifts off it as the upkeep takes a token (340 ms; tokenTock)', play:ctx=>{ const b = tokenOn(ctx, 3); return ctx.wait(400).then(()=>{ b.textContent = '💔2'; snd('tokenTock'); return V().tokenTick(b); })
    .then(()=> ctx.wait(300)).then(()=>{ b.textContent = '💔1'; snd('tokenTock'); return V().tokenTick(b); }).then(()=> ctx.wait(300)).then(()=> b.remove()); }},
  {key:'V2L', label:'VFX2 · Effects Low: the dip and the -1', play:ctx=>{ const b = tokenOn(ctx, 2); return ctx.wait(300).then(()=>{ b.textContent = '💔1'; return V().tokenTick(b, LOW); }).then(()=> ctx.wait(300)).then(()=> b.remove()); }}]});
// the skins ladder's outward auras (Lab only: no skin system yet; SKINS1 places them on the Detail card and the pack reveal, never a board tile)
const aura = (ctx, kind, o)=>{ const t = ctx.cards[1] || ctx.cards[0], l = V().skinAura(t, kind, o); return ctx.wait(2600).then(()=>{ if(l) l.remove(); }); };
R({id:'card-skin-aura', stage:'cards', duration:2800, note:'VFX2: a box-shadow glow and eight pixel bits behind the card; static or moving (CSS steps); Effects Low four bits, None the glow only, reduced motion the static version.',
  inGameHook:'Lab only: FX.V.skinAura(card, kind, {moving}) for the Detail card / pack reveal once skins exist (SKINS1); never a board tile', variants:
  ['ember', 'frost', 'sparkle'].map((k, i)=> ({key:'V2' + 'ABC'[i], label:`VFX2 · ${k === 'frost' ? 'Frost breath' : k[0].toUpperCase() + k.slice(1)} aura, moving (${k === 'ember' ? 'embers rise' : k === 'frost' ? 'breath puffs outward' : 'sparkles twinkle'})`, play:ctx=> aura(ctx, k, {moving:true})}))
  .concat(['ember', 'frost', 'sparkle'].map((k, i)=> ({key:'V2S' + 'ABC'[i], label:`VFX2 · ${k === 'frost' ? 'Frost breath' : k[0].toUpperCase() + k.slice(1)} aura, static (the cheaper skin)`, play:ctx=> aura(ctx, k, {})})))
  .concat([{key:'V2L', label:'VFX2 · Effects Low: four moving bits', play:ctx=> aura(ctx, 'ember', {moving:true, level:'low'})}])});
})();
