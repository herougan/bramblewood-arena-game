// Package FX11 (2026-11-16): batch H lab registrations (bramblewood-fx-h.js, window.FX.H). All live in fights:
//   atk-crab-claw          Crab Claws: the scuttle toward the side it pinches, the drawn pincer and its clack (crabClaw, then its hit / hitHQ;
//                          the Ironclaw Fiddler's fx.attack 'crabClaw' through en2CrabClawHit)
//   fld-irradiation-atmos  the whole screen turns sickly green as the board's Irradiation tokens add up (boardRendered / cardStatusShown / matchUI)
//   st-irradiation-apply   + the soft geiger ticks as tokens land (variant FX11)
//   sk-healing-mend        Healing N's mend (heal with cause 'healing')
//   sk-worship-hymn        Worship hears its side's Prayer (grace / statusFx prayer)
//   sk-gorge-gulp          Gorge's second feed (parasiteDrain with gorge)
// FX14 (2026-11-17): the bolts (atk-bolt-*, sk-spitfire, atk-bolt-miss), every arrow (atk-arrow, -fire-, -ice-, -bleed, -venom, twin, volley,
//   archer, miss) and the resource skills (sk-forestry-log, sk-gold-coin, sk-plunder-coins, sk-anvil-forge, sk-pearl-glint, sk-ore-chip): see the end.
(function(){
const R = FXLAB.register, H = ()=> window.FX.H, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const T = {windup:390, impactPad:180};
// the swing as a fight plays it: the crab scuttles toward its target, lunges, and the claw lands on the blow
const crab = (ctx, att, tgt, o)=>{ o = o || {}; const X = H(), sp = ctx.speed || 1;
  const dir = o.castle ? 0 : (tgt.getBoundingClientRect().left > att.getBoundingClientRect().left + 4 ? 1 : tgt.getBoundingClientRect().left < att.getBoundingClientRect().left - 4 ? -1 : 0);
  if(!o.straight) X.crabScuttle(att, {dir, speed:sp});
  return ctx.wait(o.straight ? 0 : 150).then(()=>{ if(window.LabGame) LabGame.lunge(att, true); return X.crabSnap(tgt, {from:att, castle:!!o.castle, miss:!!o.miss, impactMs:(T.windup + T.impactPad)/sp, speed:sp}); }); };
R({id:'atk-crab-claw', stage:'board', note:'FX11: replaces the "🦞 ←/→" float, the .crab-pinch slide, FX.A.crabPinch and the Ironclaw’s old claw.',
  inGameHook:'onEvent (bramblewood-fx-h.js): crabClaw, then its hit / hitHQ / evaded; en2CrabClawHit (Ironclaw Fiddler, fx.attack crabClaw)', variants:[
  {key:'A', label:'FX11 · It scuttles toward the column on its left, the pincer snaps shut on the unit there: clack, spark, knock-back', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 0))},
  {key:'B', label:'FX11 · The other side', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 2))},
  {key:'C', label:'FX11 · Nobody beside it: the claw reaches into the bramble, leaves and twigs fly', play:ctx=> crab(ctx, mine(ctx), ctx.board.castleFoe, {castle:true})},
  {key:'D', label:'FX11 · The Ironclaw Fiddler’s straight attack (no scuttle)', play:ctx=> crab(ctx, mine(ctx), foe(ctx), {straight:true})},
  {key:'E', label:'FX11 · The target dodges: the claw closes on air, no knock-back', play:ctx=> crab(ctx, mine(ctx), foe(ctx, 0), {miss:true})}]});
// the tint climbing step by step, then fading as the tokens wear off
const climb = (ctx, calm)=>{ const X = H(), host = ctx.root, seq = [1, 3, 6, 10, 15, 6, 0];
  return seq.reduce((p, n)=> p.then(()=>{ X.irrAtmos(n, {host, calm}); return ctx.wait(1100); }), Promise.resolve()).then(()=> ctx.wait(600)); };
R({id:'fld-irradiation-atmos', stage:'board', duration:9000, note:'FX11: one layer, CSS gradients only (vignette, scanlines, grain), opacity steps 0.26 / 0.36 / 0.46 / 0.55 / 0.62 at 1 / 3 / 6 / 10 / 15 tokens.',
  inGameHook:'fxHook boardRendered / cardStatusShown / matchUI (FX.H.irrSync, sums the board’s ☢️ badges); gone at the match’s end and off the battle screen', variants:[
  {key:'A', label:'FX11 · Tokens 1 → 3 → 6 → 10 → 15, then they wear off: the air turns greener, flickers, then clears', play:ctx=> climb(ctx, false)},
  {key:'B', label:'FX11 · Effects Low and reduced motion: the same tint, no flicker or grain motion', play:ctx=> climb(ctx, true)}]});
R({id:'st-irradiation-apply', stage:'board', variants:[
  {key:'FX11', label:'FX11 · The tokens land with a few soft geiger ticks (geigerSoft; was the louder burst)', play:ctx=>{ ctx.sound('geigerSoft', 3); return window.FX.B.irradiate(foe(ctx), {src:mine(ctx), tokens:3}); }}]});
R({id:'sk-healing-mend', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): heal with cause healing', variants:[
  {key:'A', label:'FX11 · A green cross pops over the healer, its mend hops over to the wounded ally', play:ctx=> H().healingMend(mine(ctx, 0), mine(ctx, 2))},
  {key:'B', label:'FX11 · Healing itself: the cross sinks into its own card', play:ctx=> H().healingMend(mine(ctx))}]});
R({id:'sk-worship-hymn', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): grace / statusFx prayer on its side, once a round', variants:[
  {key:'A', label:'FX11 · A golden halo settles, a warm wash, three notes rise', play:ctx=> H().worshipHymn(mine(ctx))}]});
R({id:'sk-gorge-gulp', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): parasiteDrain with gorge', variants:[
  {key:'A', label:'FX11 · A dark red rim, drops of blood drawn into the parasite, two gulps', play:ctx=> H().gorgeGulp(foe(ctx))}]});
// ---- Package FX14 (2026-11-17, owner 11-16 23:53: "More effects etc. The bolt as is, isn't so nice looking. The arrows — blood etc — do
// they look nice?"): the bolts redrawn per element, every arrow variant, the resource skills. Each play uses the fight's own timings
// (bolt: windup 390 + projectile 690 to the hit; arrow: draw 234, flight 380), divided by the Lab's speed.
const B14 = {total:1080, draw:234, flight:380};
const sp14 = ctx=> ctx.speed || 1;
const boltPlay = (el, o)=> ctx=>{ o = o || {}; ctx.sound('launch'); const t = o.to ? o.to(ctx) : foe(ctx); const p = H().boltShot(o.from ? o.from(ctx) : mine(ctx), t, Object.assign({element:el, total:B14.total/sp14(ctx)}, o.opt || {}));
  if(o.miss) ctx.wait(60).then(()=> p.miss()); else ctx.wait(B14.total/sp14(ctx)).then(()=> ctx.float(t, '-2', {fire:'heat', ice:'cold', acid:'acid', poison:'poison', water:'water' /* ENG51 */}[el] || ''));
  return p.then(()=> ctx.wait(500)); };
const arrowPlay = (v, o)=> ctx=>{ o = o || {}; const s = sp14(ctx), a = o.from ? o.from(ctx) : mine(ctx, 0), t = o.to ? o.to(ctx) : foe(ctx); ctx.sound('bowDraw', v === 'fire', B14.draw/s);
  ctx.wait(B14.draw/s).then(()=> ctx.sound('arrowLoose', v === 'fire')); ctx.wait((B14.draw + B14.flight)/s).then(()=>{ if(!o.miss){ ctx.sound('arrowThunk', v === 'fire'); ctx.float(t, '-2'); } });
  const p = H().arrowShot(a, t, Object.assign({variant:v, draw:B14.draw/s, flight:B14.flight/s}, o.opt || {})); return (p || Promise.resolve()).then(()=> ctx.wait(400)); };
[['fire', 'atk-bolt-fire', 'A tumbling ember with a heat trail, a small burst of sparks'], ['ice', 'atk-bolt-ice', 'A frosted shard that shatters into shards and flakes'],
 ['acid', 'atk-bolt-acid', 'A wobbling green glob, drips falling, a splash ring and a sizzle of bubbles'], ['poison', 'atk-bolt-poison', 'A purple droplet trailing fumes, a puff of purple smoke']].forEach(([el, id, label])=>
  R({id, stage:'board', inGameHook:'ninthPassVfx → FX.H.boltShot (bramblewood-fx-h.js); the old SkillFX.boltGlob under reduced motion', variants:[{key:'FX14', label:'FX14 · ' + label + ' (0.26 s charge in the mouth, 0.33 s flight)', play:boltPlay(el)}]}));
// ENG51 (2026-11-18, owner 11-17 17:32): Water Bolt (the Archerfish), the blue bolt; it lands with SoundKit's own splash
R({id:'atk-bolt-water', name:'Water Bolt', trigger:"bolt event {element:'water'}, then its hit and statusFx en20Soak", stage:'board', inGameHook:'ninthPassVfx → FX.H.boltShot (bramblewood-fx-h.js)', variants:[
  {key:'ENG51', label:'ENG51 · A clear blue droplet dripping as it flies, a splash ring and a crown of droplets (0.26 s charge, 0.33 s flight; splash)', play:boltPlay('water')}]});
R({id:'sk-spitfire', stage:'board', variants:[{key:'FX14', label:'FX14 · A fast spit of three flame blobs (0.24 s), a small flare', play:boltPlay('fire', {opt:{spitfire:true}, to:ctx=> foe(ctx, Math.floor(Math.random()*3))})}]});
R({id:'atk-bolt-shock', stage:'board', variants:[{key:'FX14', label:'FX14 · Crackle round the shooter, then the bolt forks where it lands (the game draws the bolt itself)', play:ctx=> H().shockBolt(mine(ctx), foe(ctx), {impactMs:300/sp14(ctx)}).then(()=> ctx.wait(300))}]});
R({id:'atk-bolt-miss', name:'A bolt is dodged', trigger:'bolt, then evaded {ranged}', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): evaded after a bolt → the shot’s .miss()', variants:[
  {key:'A', label:'FX14 · The target dodges: the spit sails past it, no splash', play:boltPlay('acid', {miss:true})}]});
R({id:'atk-arrow', stage:'board', variants:[{key:'FX14', label:'FX14 · A bow appears, the fletched arrow is drawn back, loosed on an arc, sticks and quivers, splinters fly', play:arrowPlay('plain')}]});
R({id:'atk-fire-arrow', stage:'board', variants:[{key:'FX14', label:'FX14 · A flame at the tip, a trail of rising embers, a burst of fire', play:arrowPlay('fire')}]});
R({id:'atk-ice-arrow', stage:'board', variants:[{key:'FX14', label:'FX14 · An ice-tipped arrow with a frost trail, a crystal pop (crystalPop)', play:arrowPlay('ice')}]});
R({id:'atk-arrow-bleed', name:'Arrow – bleed (serrated)', trigger:'arrow from a card with an – bleed tip (arrowBleed), then its hit', stage:'board', inGameHook:'ranged hit → FX.H.arrowShot {variant bleed}', variants:[
  {key:'A', label:'FX14 · A serrated red arrow, a faint red streak, a small slash and drops of blood (arrowSlash)', play:arrowPlay('bleed')}]});
R({id:'atk-arrow-venom', name:'Arrow – poison (venom)', trigger:'arrow from a card with an – poison tip (arrowPoison), then its hit', stage:'board', inGameHook:'ranged hit → FX.H.arrowShot {variant venom}', variants:[
  {key:'A', label:'FX14 · A green-dipped arrow dripping venom, a green puff (venomPuff)', play:arrowPlay('venom')}]});
R({id:'atk-twin-shot', stage:'board', variants:[{key:'FX14', label:'FX14 · Two arrows, the bow stays up, each arcs its own way', play:ctx=> arrowPlay('plain', {from:ctx=> mine(ctx), to:ctx=> foe(ctx, 0), opt:{twin:true}})(ctx).then(()=> arrowPlay('plain', {from:ctx=> mine(ctx), to:ctx=> foe(ctx, 2), opt:{twin:true}})(ctx))}]});
R({id:'atk-volley', stage:'board', variants:[{key:'FX14', label:'FX14 · Five arrows fan up into the sky, then each plunges onto its target', play:ctx=>{ const s = sp14(ctx), a = mine(ctx, 0);
  H().volleyLoose(a, {draw:B14.draw/s}); return Promise.all([0, 1, 2].map(i=> ctx.wait(i*760/s).then(()=> arrowPlay('plain', {from:()=> a, to:c=> foe(c, i), opt:{plunge:true}})(ctx)))); }}]});
R({id:'atk-archer-arrow', name:'Archer N: its turn is an arrow', trigger:'arrow {archer} (onAction), then its hit', stage:'board', inGameHook:'ranged hit → FX.H.arrowShot {archer}', variants:[
  {key:'A', label:'FX14 · A bigger bow, blue fletching, a glint at the head before the loose', play:arrowPlay('plain', {opt:{archer:true}})}]});
R({id:'atk-arrow-miss', name:'An arrow is dodged', trigger:'arrow, then evaded {ranged}', stage:'board', inGameHook:'ranged evaded → FX.H.arrowShot {miss}', variants:[
  {key:'A', label:'FX14 · It sails past the target and skids into the dust (was: it struck the target anyway)', play:arrowPlay('plain', {miss:true, opt:{miss:true}})}]});
const pill14 = (ctx, res)=> ctx.root.querySelector('#hud' + res + 'Pill') || ctx.board.pillsMine || ctx.board.hud;
R({id:'sk-forestry-log', name:'Forestry N: +N Lumber every turn', trigger:'lumber {cause:\'forestry\'}', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): lumber with cause forestry (replaces the generic Lumber arc for it)', variants:[
  {key:'A', label:'FX14 · A log pops out and tumbles end over end into the Lumber pill (logTumble)', play:ctx=> H().forestryLog(mine(ctx), pill14(ctx, 'Lumber'), {n:2}).then(()=> ctx.wait(300))}]});
R({id:'sk-gold-coin', name:'Prospecting N / Delivery {Gold}: Gold gained', trigger:'gold {why:\'prospecting\' | \'delivery\'}', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): gold with why prospecting / delivery', variants:[
  {key:'A', label:'FX14 · A coin flips up with a glint and drops into the Gold pill (coinFlip)', play:ctx=> H().coinFlip(mine(ctx), pill14(ctx, 'Gold'), {n:2}).then(()=> ctx.wait(300))},
  {key:'B', label:'FX14 · Barter pays for a card: a coin flips out of the Gold pill', play:ctx=> H().coinFlip(pill14(ctx, 'Gold'), null, {spend:true, n:2}).then(()=> ctx.wait(300))}]});
R({id:'sk-plunder-coins', name:'Plunder N: Gold stolen on a landed swing', trigger:'sk2 {kind:\'plunder\'}', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): sk2 plunder (the 🪙 glyph projectile stays below Medium)', variants:[
  {key:'A', label:'FX14 · Coins flip out of the robbed side’s bramble and land in the plunderer', play:ctx=> H().plunderCoins(ctx.board.castleFoe, mine(ctx), {n:3}).then(()=> ctx.wait(300))}]});
R({id:'sk-anvil-forge', name:'Masonry / Refining: Stone or Metal forged', trigger:'stone / metal from a Masonry or Refining (Smelter) unit’s turn trigger', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): stone / metal with no cause from a masonry / refining card', variants:[
  {key:'A', label:'FX14 · Masonry: a little anvil, two strikes of sparks, a Stone hops off (anvilTink)', play:ctx=> H().anvilSpark(mine(ctx), {product:'stone'}).then(()=> ctx.wait(300))},
  {key:'B', label:'FX14 · Refining: the same, a glowing Metal nugget that cools', play:ctx=> H().anvilSpark(mine(ctx), {product:'metal'}).then(()=> ctx.wait(300))}]});
R({id:'sk-pearl-glint', name:'Pearls gained or spent', trigger:'pearl (Delivery {Pearl}); Pearls paying for a card (the resource pills redrawn)', stage:'board', inGameHook:'onEvent pearl; fxHook fieldRes (fieldResSideHTML)', variants:[
  {key:'A', label:'FX14 · A pearl rolls up to the Pearl pill, a glint turns over it (pearlChime)', play:ctx=> H().pearlGlint(mine(ctx), {dest:pill14(ctx, 'Pearl')}).then(()=> ctx.wait(300))},
  {key:'B', label:'FX14 · Spent: a pearl rises out of the pill and glints', play:ctx=> H().pearlGlint(pill14(ctx, 'Pearl'), {spend:true}).then(()=> ctx.wait(300))}]});
R({id:'sk-ore-chip', name:'Quarrying / Mining: Stone or Metal dug', trigger:'stone {cause:\'quarrying\'} / metal {cause:\'mining\'}', stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js)', variants:[
  {key:'A', label:'FX14 · Quarrying: a chip of stone knocks off with grit and hops into its pill (pickChip)', play:ctx=> H().oreChip(mine(ctx), pill14(ctx, 'Stone'), {res:'stone'}).then(()=> ctx.wait(300))},
  {key:'B', label:'FX14 · Mining: a nugget of ore', play:ctx=> H().oreChip(mine(ctx), pill14(ctx, 'Metal'), {res:'metal'}).then(()=> ctx.wait(300))}]});
// ---- Package POWDER1 (2026-11-17, owner 11-17 17:32, OWN-1117-1): Sleeping Powder and Poison Powder, a Speed -1 puff after the arrows (powder
// event, then its statusFx). The spores take 0.56 s to reach the target (the fight gives the powder event a 0.62 s beat), divided by the Lab's speed.
const powderPlay = (el, o)=> ctx=>{ o = o || {}; const t = foe(ctx), s = sp14(ctx), p = H().powderPuff(mine(ctx), t, {element:el, total:560/s});
  if(o.miss) ctx.wait(60).then(()=> p.miss()); else ctx.wait(600/s).then(()=> ctx.float(t, el === 'poison' ? '+2 ☠' : el === 'paralysis' ? '💫' /* ENG50 */ : '💤', el === 'poison' ? 'poison' : ''));
  return p.then(()=> ctx.wait(500)); };
R({id:'sk-sleep-powder', name:'Sleeping Powder N', trigger:"powder {element:'sleep'}, then statusFx sleep", stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): powder → FX.H.powderPuff; evaded after it → .miss()', variants:[
  {key:'A', label:'POWDER1 · The shooter shakes out lavender spores; they wobble across and bloom into a soft cloud, z’s rise (sporePuff)', play:powderPlay('sleep')},
  {key:'B', label:'POWDER1 · Dodged (Evasive): the drift thins out beside the target, no bloom', play:powderPlay('sleep', {miss:true})}]});
R({id:'sk-poison-powder', name:'Poison Powder N', trigger:"powder {element:'poison'}, then statusFx poison", stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): powder → FX.H.powderPuff', variants:[
  {key:'A', label:'POWDER1 · Green spores drift across and bloom into a sickly cloud, venom drips (sporePuff, a low bubble)', play:powderPlay('poison')}]});
// ENG50 (2026-11-17, owner 11-17 23:36, REDESIGN3-1): Paralysis Powder, the third powder (statusFx stunOnHit after the puff: the existing Stun mark)
R({id:'sk-paralysis-powder', name:'Paralysis Powder N', trigger:"powder {element:'paralysis'}, then statusFx stunOnHit {powder:true}", stage:'board', inGameHook:'onEvent (bramblewood-fx-h.js): powder → FX.H.powderPuff', variants:[
  {key:'A', label:'ENG50 · Yellow spores drift across and bloom into a pale gold cloud, sparks jump (sporePuff, a dry crackle)', play:powderPlay('paralysis')}]});
})();
