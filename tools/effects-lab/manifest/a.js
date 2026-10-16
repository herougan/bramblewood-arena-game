// Batch A lab registrations (2026-10-15): combat-attack, combat-skill (174 inventory entries).
// One FXLAB.register per inventory id; play(ctx) calls the batch's game function FX.A.* (or the existing SkillFX / UnitFX look) on
// the board stage. Looks that live only inside arena_app.js (the lunge, flashDmg, the miss callout, CSS-class flourishes) are
// replayed here with the same timings and the game's own CSS classes, so the "now" variant is what a fight shows.
// Contract and checklist: docs/effects-lab-contract.md. Effect code: bramblewood-fx-a.js.
// 2026-10-15: the lab's synced floatText reads the game's floatDetachDepth (arena_app.js), which sync_fx_src.py doesn't copy, so
// every ctx.float threw (swallowed) and no damage number showed in any demo. A global 0 is the game's value outside upkeep.
if(typeof window.floatDetachDepth === 'undefined') window.floatDetachDepth = 0;
(function(){
const R = FXLAB.register, X = ()=> window.FX.A, S = ()=> window.SkillFX, U = ()=> window.UnitFX;
const T = {windup:390, strike:570, projectile:690, impactPad:180};               // animMs() at 1×
const g = ()=> window.gsap;
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const C = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height, r}; };
const until = (ctx, ms, start)=> new Promise(res=>{ let d = false; const fin = ()=>{ if(!d){ d = true; res(); } }; start(fin); ctx.wait(ms).then(fin); });
// ---- the game's in-file looks, replayed for the "now" variants ----
// animateAttacker's GSAP lunge (arena_app.js): windup lean back, strike toward the target, settle.
function lunge(el, isMine, o){
  o = o || {}; const t = tileOf(el), G = g(); if(!G || !t) return; const dir = isMine ? 1 : -1, leanX = o.leanX || 0, rot = o.toCastle ? Math.max(-10, Math.min(10, leanX*0.18)) : 0;
  el.classList.add('is-attacking');
  const tl = G.timeline({onComplete:()=> el.classList.remove('is-attacking')});
  if(o.sweep){ const w = leanX >= 0 ? 1 : -1; tl.to(t, {y:dir*5, x:w*8, rotation:w*-6, scale:.97, duration:.07}).to(t, {y:dir*-12, x:w*-16, rotation:w*9, scale:1.06, duration:.1}).to(t, {y:0, x:0, rotation:0, scale:1, duration:.12, clearProps:'transform'}); return; }
  if(o.scared){ tl.to(t, {keyframes:[{x:-4, rotation:-3}, {x:4, rotation:3}, {x:-3, rotation:-2}, {x:3, rotation:2}, {x:0, rotation:0}], duration:.39, ease:'none'}); }
  tl.to(t, {y:dir*9, x:leanX*.35, rotation:rot*.4, scale:.95, duration:T.windup/1000, ease:'power2.in'})
    .to(t, {y:dir*-15, x:leanX, rotation:rot, scale:o.toCastle ? 1.1 : 1.06, duration:T.strike*.55/1000, ease:'back.out(3)'})
    .to(t, {y:0, x:0, rotation:0, scale:1, duration:T.strike*.45/1000, ease:'power2.out', clearProps:'transform'});
}
const lean = (a, b)=> Math.max(-16, Math.min(16, (C(b).x - C(a).x)*.12));
// flashDmg + impactSquash: recoil, the typed number, a squash.
const DMG_ICON = {poison:['☠️', 'poison'], acid:['🧪', 'poison'], heat:['🔥', 'heat'], cold:['❄️', 'cold'], decay:['🦠', 'poison']};
function flashDmg(ctx, el, dmg, type, crit, blocked){
  const di = (X() && X().DMG_TYPES && X().DMG_TYPES[type]) || DMG_ICON[type]; // 2026-10-15: every type has its own number colour (FX.A.DMG_TYPES)
  if(blocked) ctx.float(el, '🛡 0', 'blocked'); else if(crit) ctx.float(el, '-' + dmg, 'crit' + (di ? ' ' + di[1] : '')); else ctx.float(el, (di ? di[0] + ' ' : '') + '-' + dmg, di ? di[1] : '');
  try{ if(typeof recoilEl === 'function') recoilEl(el, crit ? 1.5 : .9); }catch(e){}
  const t = tileOf(el), G = g(); if(G && t) G.timeline().to(t, {scaleX:1.06, scaleY:.92, y:-5, duration:.06}).to(t, {scaleX:1, scaleY:1, y:0, duration:.38, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
}
// spawnProjectile: the old emoji glyph sliding across.
function glyphShot(from, to, glyph, ms){ const G = g(), a = C(from), b = C(to), p = document.createElement('div'); p.className = 'projectile'; p.textContent = glyph || '➶'; document.body.appendChild(p);
  G.set(p, {x:a.x - 9, y:a.y - 9, opacity:1}); G.to(p, {x:b.x - 9, y:b.y - 9, scale:1.15, rotation:Math.random()*40 - 20, opacity:.15, duration:(ms || T.projectile)/1000, ease:'power1.in', onComplete:()=> p.remove()}); }
// flashDodge + missCallout.
const MISS = {evasive:'🌀', flying:'🪽', swift:'💨', whiff:'🪃', smoke:'🌫️'};
function dodge(ctx, el, reason){ ctx.sound('dodge'); el.classList.add('dodge'); setTimeout(()=> el.classList.remove('dodge'), 400);
  const f = document.createElement('div'); f.className = 'miss-float miss-' + (MISS[reason] ? reason : 'evasive'); f.textContent = (MISS[reason] || '🌀') + ' Miss'; el.appendChild(f);
  const G = g(); G.set(f, {position:'absolute', left:'50%', top:'24%', xPercent:-50, opacity:0, scale:.7});
  G.timeline({onComplete:()=> f.remove()}).to(f, {opacity:1, scale:1, duration:.14, ease:'back.out(2.4)'}).to(f, {y:-34, duration:1, ease:'power1.out'}).to(f, {opacity:0, duration:.4}, '<0.6'); }
const cls = (el, c, ms)=>{ el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(()=> el.classList.remove(c), ms || 700); };
const W = ctx=> ctx.board, mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
// A standard melee exchange: mine[1] lunges at foe[1]; `on` runs at the impact.
function melee(ctx, on, o){ const a = mine(ctx)[1], t = (o && o.target) || foe(ctx)[1]; lunge(a, true, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad).then(()=> on && on(a, t)); }
// A ranged exchange with the batch's missile.
function shoot(ctx, type, o){ o = o || {}; const a = o.from || mine(ctx)[1], t = o.to || foe(ctx)[1];
  return ctx.wait(T.windup).then(()=>{ X().missile(a, t, {type, flight:T.projectile}); return ctx.wait(T.projectile); }).then(()=>{ ctx.sound('hitAt', 3, false); flashDmg(ctx, t, o.dmg || 3, type); return ctx.wait(900); }); }
const P = (ctx, ms)=> ctx.wait(ms || 1200);
const reg = (id, hook, variants, note)=> R({id, stage:'board', inGameHook:hook, note, variants:variants.map(([key, label, play, extra])=> Object.assign({key, label, play}, extra || {}))});
const LIVE = 'onEvent (bramblewood-fx-a.js): ';

// 2026-10-15: where the in-game hook lives for entries whose demo is in _existing.js
[['atk-fire-arrow', 'renderVfxForEvent → ranged hit with matchState.pendingArrow {fire}: SkillFX.bowShot({fire})'],
 ['atk-backstab', 'renderVfxForEvent → hit {backstab}: SkillFX.backstab (dagger flash from the side it came from)'],
 ['atk-boomerang-throw', 'renderVfxForEvent → hit by a Boomerang / Bananarang / Anti-Air unit: SkillFX.boomerang'],
 ['sk-shield-up', 'sixthPassVfx → statusFx unitShield: SkillFX.shieldUp'],
 ['sk-shield-call', 'renderVfxForEvent → spawn {cause:shieldCall}: SkillFX.shieldDrop'],
].forEach(([id, h])=>{ const r = FXLAB.get(id); if(r && !r.inGameHook) r.inGameHook = h; });

// =================================================== attacks ===================================================
reg('atk-melee-lunge', 'animateAttacker (A is the live lunge; B–D are faction takes to choose from)', [
  ['A', 'Now: lean back, lunge, settle', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; lunge(a, true, {leanX:lean(a, t)}); return ctx.wait(T.windup).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 900); }); }],
  ['B', 'Otters: a straight drilled jab, bronze streak', ctx=>{ const t = foe(ctx)[1]; return X().lungeDrill(mine(ctx)[1], t).then(()=> flashDmg(ctx, t, 3)).then(()=> P(ctx, 700)); }],
  ['C', 'Hummingbirds: dart in on an arc, jewel trail', ctx=>{ const t = foe(ctx)[0]; X().lungeArc(mine(ctx)[1], t); return ctx.wait(330).then(()=>{ flashDmg(ctx, t, 2); return P(ctx, 900); }); }],
  ['D', 'Beasts: crouch and pounce low, dust kick', ctx=>{ const t = foe(ctx)[2]; X().lungePounce(mine(ctx)[2], t); return ctx.wait(330).then(()=>{ flashDmg(ctx, t, 4); return P(ctx, 900); }); }],
], 'Themes: Otters lunge straight (drilled), Hummingbirds dart in an arc, beasts pounce low.');
reg('atk-castle-lunge', 'animateAttacker(…, {toCastle:true})', [['A', 'Now: a straight swing at the castle', ctx=>{ const a = mine(ctx)[0], c = W(ctx).castleFoe; lunge(a, true, {toCastle:true});
  return ctx.wait(T.windup + T.impactPad).then(()=>{ ctx.sound('hitAt', 5, true); ctx.float(c, '-5', 'hq-big'); try{ recoilEl(c, 1.2); }catch(e){} return P(ctx, 1000); }); }]]);
reg('atk-impact', 'flashDmg + impactSquash (A); B–D: onEvent hit, from the cards\' Resist / Weakness / Immune', [
  ['A', 'Now: squash, typed number', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 3, false); flashDmg(ctx, t, 3); }).then(()=> P(ctx, 900))],
  ['B', 'Resisted ½: a ward ring soaks it, "½ Resist"', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 2, false); flashDmg(ctx, t, 2, 'heat'); X().resistHit(t); }).then(()=> P(ctx, 1000))],
  ['C', 'Weak ×2: red starburst and crack, "×2 Weak"', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 8, true); flashDmg(ctx, t, 8, 'cold'); X().weakHit(t); }).then(()=> P(ctx, 1000))],
  ['D', 'Immune: it bounces off a bubble', ctx=> melee(ctx, (a, t)=>{ ctx.sound('clang'); ctx.float(t, '0', 'blocked'); X().immuneHit(t); }).then(()=> P(ctx, 1000))],
], 'Resisted and weak hits were unexplained numbers; B–D say why (they play at every Effects level above None).');
reg('atk-heavy-hitstop', 'hitStop(70) + battleLightAt big (A); B: onEvent hit for 8+ (High effects): SkillFX.shockwave rolls out and shoves the neighbours', [['A', 'Now: the blow freezes a beat, then lands', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 9, true); const G = g(), tt = tileOf(t);
  G.timeline().to(tt, {scaleX:1.1, scaleY:.86, duration:.05}).to(tt, {duration:.07}).to(tt, {scaleX:1, scaleY:1, duration:.4, ease:'elastic.out(1, .4)', clearProps:'transform'}); flashDmg(ctx, t, 9); }).then(()=> P(ctx, 900))],
  ['B', 'Freeze, then a shockwave ring shoves the neighbours (SkillFX.shockwave)', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 9, true); X().heavyShock(t, {cards:foe(ctx).filter(x=> x !== t)}); flashDmg(ctx, t, 9); }).then(()=> P(ctx, 1000))]]);
reg('atk-big-blow-shake', 'bigBlowShake → battlefieldShake', [['A', 'Now: the battlefield jitters (scaled to damage)', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 30, true); flashDmg(ctx, t, 30); const bf = W(ctx).el, G = g(), kf = [];
  for(let i = 0; i < 9; i++){ const k = 1 - i/9; kf.push({x:(Math.random()*2 - 1)*6*k, y:(Math.random()*2 - 1)*4*k, rotation:(Math.random()*2 - 1)*.5*k, duration:.045}); } G.to(bf, {keyframes:kf.concat([{x:0, y:0, rotation:0, duration:.05}]), clearProps:'transform'}); }).then(()=> P(ctx, 900))]]);
reg('atk-crit', 'flashDmg crit (A); B/C: onEvent crit hit by an Otter / Hummingbird (also ants, bees, volcanic)', [
  ['A', 'Now: gold starburst number', ctx=> melee(ctx, (a, t)=>{ ctx.sound('critTone'); flashDmg(ctx, t, 8, null, true); }).then(()=> P(ctx, 1000))],
  ['B', 'Otter crit: bronze and teal sparks', ctx=> melee(ctx, (a, t)=>{ ctx.sound('critTone'); flashDmg(ctx, t, 8, null, true); X().critSparks_B(t); }).then(()=> P(ctx, 1000))],
  ['C', 'Hummingbird crit: jewel prism sparks', ctx=> melee(ctx, (a, t)=>{ ctx.sound('critTone'); flashDmg(ctx, t, 8, null, true); X().critSparks_C(t); }).then(()=> P(ctx, 1000))],
]);
reg('atk-armor-block-full', 'SkillFX.armorBlock + clang', [['A', 'Now: steel plate, sparks, 🛡️', ctx=> melee(ctx, (a, t)=>{ ctx.sound('clang'); S().armorBlock(t, {from:90}); ctx.float(t, '🛡 0', 'blocked'); }).then(()=> P(ctx, 900))]]);
reg('atk-armor-block-partial', 'SkillFX.armorBlock partial', [['A', 'Now: partial soak', ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 2, false); S().armorBlock(t, {from:90, partial:true}); flashDmg(ctx, t, 2); }).then(()=> P(ctx, 900))]]);
// damage types
const typeNow = (type, glyph)=> ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; return ctx.wait(T.windup).then(()=>{ glyphShot(a, t, glyph); return ctx.wait(T.projectile); }).then(()=>{ ctx.sound('hitAt', 3, false); flashDmg(ctx, t, 3, type); return P(ctx, 900); }); };
const typeNew = (fn, type)=> ctx=> melee(ctx, (a, t)=>{ ctx.sound('hitAt', 3, false); fn(t); if(type) flashDmg(ctx, t, 3, type); }).then(()=> P(ctx, 1100));
reg('atk-dmgtype-physical', 'battleLightAt + dmgGlyph (A); B is a proposal', [['A', 'Now: warm light, ➶ glyph', typeNow('physical', '➶')], ['B', 'Dust and splinters on impact', typeNew(t=> X().impactPhysical(t), 'physical')]]);
reg('atk-dmgtype-heat', 'battleLightAt + dmgGlyph (A); B is a proposal', [['A', 'Now: orange light, 🔥 glyph', typeNow('heat', '🔥')], ['B', 'Embers fly up on impact', typeNew(t=> X().impactHeat(t), 'heat')]]);
reg('atk-dmgtype-cold', 'battleLightAt + dmgGlyph (A); B is a proposal', [['A', 'Now: blue light, ❄ glyph', typeNow('cold', '❄')], ['B', 'Frost glints and breath vapour', typeNew(t=> X().impactCold(t), 'cold')]]);
reg('atk-dmgtype-acid', LIVE + 'hit with dmgType acid (Medium+)', [['A', 'It fizzes: bubbles and smoking pit marks', typeNew(t=> X().impactAcid(t), 'acid')], ['B', 'Old: acid light, 🧪 glyph', typeNow('acid', '🧪')]]);
reg('atk-dmgtype-poison', LIVE + 'hit with dmgType poison (Medium+)', [['A', 'Toxic green puff, dripping', typeNew(t=> X().impactPoison(t), 'poison')], ['B', 'Old: green light, ☠ glyph', typeNow('poison', '☠')]]);
reg('atk-dmgtype-decay', LIVE + 'hit with dmgType decay (Medium+)', [['A', 'Violet mould blooms, spores drift', typeNew(t=> X().impactDecay(t), 'decay')], ['B', 'Old: violet light, 🦠 glyph', typeNow('decay', '🦠')]]);
reg('atk-dmgtype-magic', LIVE + 'hit with dmgType magic (A); the battle light gets a violet magic colour', [
  ['A', 'Rune circle spins down and bursts', typeNew(t=> X().impactMagic(t), 'magic')], ['B', 'Prism starburst', typeNew(t=> X().impactMagic_B(t), 'magic')], ['C', 'Glyph motes orbit and collapse', typeNew(t=> X().impactMagic_C(t), 'magic')]]);
reg('atk-dmgtype-water', LIVE + 'hit with dmgType water (A); the battle light gets a water colour', [
  ['A', 'Spray and a caustic ripple', typeNew(t=> X().impactWater(t), 'water')], ['B', 'A wave curls over and slaps it', typeNew(t=> X().impactWater_B(t, {dir:1}), 'water')], ['C', 'Drop burst, puddle ripple below', typeNew(t=> X().impactWater_C(t), 'water')]]);
reg('atk-dmgtype-true', LIVE + 'hit with dmgType true (A); white battle light', [
  ['A', 'A white crack across the card', typeNew(t=> X().impactTrue(t), 'true')], ['B', 'Negative flash, hairline slash', typeNew(t=> X().impactTrue_B(t), 'true')], ['C', 'A white void ring folds in, then out', typeNew(t=> X().impactTrue_C(t), 'true')]]);
reg('atk-ranged-projectile', LIVE + 'ranged hit with no arrow or bolt: a real missile per type (the emoji glyph is hidden)', [
  ['A', 'Stone (physical)', ctx=> shoot(ctx, 'physical')], ['B', 'Ember (heat)', ctx=> shoot(ctx, 'heat')], ['C', 'Ice shard (cold, SkillFX.frostBolt)', ctx=> shoot(ctx, 'cold')],
  ['D', 'Dart (poison, SkillFX.dart)', ctx=> shoot(ctx, 'poison')], ['E', 'Spore ball (decay) and star (magic)', ctx=> shoot(ctx, 'decay').then(()=> shoot(ctx, 'magic', {to:foe(ctx)[0]}))],
  ['F', 'Droplet (water) and white streak (true)', ctx=> shoot(ctx, 'water').then(()=> shoot(ctx, 'true', {to:foe(ctx)[2]}))],
  ['G', 'Old: the emoji glyph sliding across', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; return ctx.wait(T.windup).then(()=>{ glyphShot(a, t, '➶'); return ctx.wait(T.projectile); }).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 900); }); }],
], 'A–F are one look per damage type (all live); G is the old glyph.');
const bow = (ctx, a, t, o)=> until(ctx, 2200, fin=>{ o = o || {}; ctx.sound('bowDraw', !!o.fire, 240); S().bowShot(a, t, {fire:o.fire, draw:o.draw || 240, flight:o.flight || 260, onRelease:()=> ctx.sound('arrowLoose', !!o.fire),
  onImpact:()=>{ ctx.sound('arrowThunk', !!o.fire); flashDmg(ctx, t, o.dmg || 3, o.type); if(o.after) o.after(t); ctx.wait(800).then(fin); }}); });
reg('atk-ice-arrow', LIVE + 'arrow {ice} + its hit: frost tint, snowflake trail, rime burst', [
  ['A', 'Frost-blue arrow, snowflake trail, rime burst', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.sound('bowDraw', false, 240); return X().iceArrow(a, t, {draw:240, flight:300, onImpact:()=>{ ctx.sound('freezeChime'); flashDmg(ctx, t, 3, 'cold'); }}); }],
  ['B', 'Old: a plain arrow, then the ice block', ctx=> bow(ctx, mine(ctx)[1], foe(ctx)[1], {type:'cold', after:t=> S().freezeEncase(t)})]]);
reg('atk-twin-shot', 'two arrow events → SkillFX.bowShot ×2', [['A', 'Now: two quick bow shots', ctx=> bow(ctx, mine(ctx)[1], foe(ctx)[1], {draw:180}).then(()=> bow(ctx, mine(ctx)[1], foe(ctx)[0], {draw:120}))]]);
R({id:'atk-volley', stage:'board', inGameHook:LIVE + 'first Volley arrow of a round: SkillFX.volley lead arrows + a rain of arrows over the whole line (High effects)', variants:[
  {key:'B', label:'Dark cloud of arrows rains on the line', play:ctx=>{ ctx.sound('bowDraw', false, 200); const p = X().arrowRain(mine(ctx)[1], foe(ctx), {draw:200, flight:340}); ctx.wait(1100).then(()=> foe(ctx).forEach((t, i)=> setTimeout(()=> flashDmg(ctx, t, 2), i*90))); return p.then(()=> P(ctx, 400)); }}]});
reg('atk-snipe', 'arrow {snipe} → SkillFX.bowShot', [['A', 'Now: a long, flat bow shot', ctx=> bow(ctx, mine(ctx)[0], foe(ctx)[2], {draw:320, flight:220, dmg:5})]]);
const bolt = el=> ctx=> until(ctx, 1800, fin=>{ ctx.sound('launch'); const t = foe(ctx)[1]; S().boltGlob(mine(ctx)[1], t, {element:el, flight:T.windup + T.projectile*.6, onImpact:()=>{ flashDmg(ctx, t, 2, {fire:'heat', acid:'acid', poison:'poison', ice:'cold'}[el]); ctx.wait(800).then(fin); }}); });
reg('atk-bolt-fire', 'ninthPassVfx → SkillFX.boltGlob', [['A', 'Now: orange glob, ember splat', bolt('fire')]]);
reg('atk-bolt-acid', 'ninthPassVfx → SkillFX.boltGlob', [['A', 'Now: acid glob, drip splat', bolt('acid')]]);
reg('atk-bolt-poison', 'ninthPassVfx → SkillFX.boltGlob', [['A', 'Now: green glob', bolt('poison')]]);
reg('atk-bolt-ice', 'ninthPassVfx → SkillFX.boltGlob', [['A', 'Now: ice-shard splat', bolt('ice')]]);
reg('atk-bolt-shock', 'ninthPassVfx → SkillFX.boltGlob', [['A', 'Now: spark splat', bolt('shock')]]);
reg('atk-cleave', 'labSkillFx → SkillFX.cleave', [['A', 'Now: the blade sweeps the row', ctx=>{ const a = mine(ctx)[1]; ctx.sound('sweepTone'); S().cleave(a, foe(ctx), {onEachImpact:t=> flashDmg(ctx, t, 2)}); return P(ctx, 1300); }]]);
reg('atk-sweep-whiff', 'sweepWhiff → .sweep-whiff', [['A', 'Now: a crescent cuts the empty air', ctx=>{ const a = mine(ctx)[2], r = C(foe(ctx)[2]); lunge(a, true, {leanX:16, sweep:true});
  return ctx.wait(T.windup).then(()=>{ ctx.sound('sweepTone'); const sl = document.createElement('div'); sl.className = 'sweep-whiff'; sl.style.cssText = `left:${r.x + r.w*1.1}px; top:${r.y}px; --sw:${Math.round(r.w*.9)}px; --sh:${Math.round(r.h*.75)}px;`; document.body.appendChild(sl); setTimeout(()=> sl.remove(), 650);
    const ft = document.createElement('div'); ft.className = 'sweep-whiff-label'; ft.textContent = 'whoosh'; ft.style.cssText = `left:${r.x + r.w*1.1}px; top:${r.y - r.h*.2}px;`; document.body.appendChild(ft); setTimeout(()=> ft.remove(), 900); return P(ctx, 1000); }); }]]);
const prong = kind=> ctx=> melee(ctx, (a, t)=>{ S().forkProngs(a, [t].concat(kind === 'fork' ? [] : [foe(ctx)[0]]).concat(kind === 'pitchfork' ? [foe(ctx)[2]] : []), {kind}); ctx.sound('hitAt', 3, false); flashDmg(ctx, t, 3); }).then(()=> P(ctx, 1000));
reg('atk-prong-fork', 'eighthPassVfx → SkillFX.forkProngs', [['A', 'Now: two steel tines', prong('fork')]]);
reg('atk-prong-trident', 'eighthPassVfx → SkillFX.forkProngs', [['A', 'Now: three tines', prong('trident')]]);
reg('atk-prong-pitchfork', 'eighthPassVfx → SkillFX.forkProngs', [['A', 'Now: four tines', prong('pitchfork')]]);
reg('atk-prong-castle', LIVE + 'hitHQ {fork}', [['A', 'The tines thrust into the wall, stone chips fly', ctx=>{ const a = mine(ctx)[0], c = W(ctx).castleFoe; lunge(a, true, {toCastle:true}); return ctx.wait(T.windup - 60).then(()=>{ X().prongCastle(a, c, {kind:'trident', delay:200}); return ctx.wait(220); }).then(()=>{ ctx.sound('hitAt', 4, true); ctx.float(c, '-4', 'hq-big'); return P(ctx, 1000); }); }],
  ['B', 'Old: the plain castle hit', ctx=>{ const c = W(ctx).castleFoe; lunge(mine(ctx)[0], true, {toCastle:true}); return ctx.wait(T.windup + T.impactPad).then(()=>{ ctx.float(c, '-4', 'hq-big'); try{ recoilEl(c, 1.2); }catch(e){} return P(ctx, 900); }); }]]);
reg('atk-octolash', 'SkillFX.forkProngs (octolash) + float', [['A', 'Now: purple tentacles lash', ctx=> melee(ctx, (a, t)=>{ S().forkProngs(a, foe(ctx), {kind:'octolash'}); ctx.float(a, '🐙 Octolash ×3', 'quick'); }).then(()=> P(ctx, 1200))]]);
reg('atk-crab-claw', LIVE + 'crabClaw {dir}', [['A', 'A coral claw snaps shut on the side', ctx=>{ X().crabPinch(mine(ctx)[1], {dir:'right'}); return ctx.wait(500).then(()=> X().crabPinch(mine(ctx)[1], {dir:'left'})); }],
  ['B', 'Old: .crab-pinch slide + 🦞 float', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🦞 →', 'quick'); el.style.setProperty('--crab-dx', '8px'); cls(el, 'crab-pinch', 600); return P(ctx, 1000); }]]);
reg('atk-ambush', LIVE + 'hit/hitHQ with ev.ambush', [['A', 'Shadow, glinting eyes, it springs out of smoke', ctx=>{ const a = mine(ctx)[2], t = foe(ctx)[2]; ctx.sound('ambushTone'); X().ambushStrike(a, t); return ctx.wait(420).then(()=>{ lunge(a, true, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad); }).then(()=>{ flashDmg(ctx, t, 6, null, true); return P(ctx, 900); }); }],
  ['B', 'Old: "🗡 Ambush!" float', ctx=> melee(ctx, (a, t)=>{ ctx.float(a, '🗡 Ambush!', 'quick'); flashDmg(ctx, t, 6, null, true); }).then(()=> P(ctx, 900))]]);
reg('atk-quick', 'labSkillFx → SkillFX.quickStrike', [['A', 'Now: speed lines, afterimages', ctx=>{ S().quickStrike(mine(ctx)[1], foe(ctx)[1]); ctx.float(mine(ctx)[1], '⚡ Quick!', 'quick'); return P(ctx, 1200); }]]);
reg('atk-swift', LIVE + 'hit by a Swift unit (once a round)', [['A', 'Hummingbird blur: jewel afterimages', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; lunge(a, true, {leanX:lean(a, t)}); ctx.wait(270).then(()=> X().swiftBlur(a, t)); return ctx.wait(T.windup + T.impactPad).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 900); }); }],
  ['B', 'Old: "💨 Swift!" float', ctx=> melee(ctx, (a, t)=>{ ctx.float(a, '💨 Swift!', 'quick'); flashDmg(ctx, t, 3); }).then(()=> P(ctx, 900))]]);
reg('atk-frenzy', 'SkillFX.rageFlare + float', [['A', 'Now: rage flare, "🔥 Frenzy!"', ctx=>{ const a = mine(ctx)[1]; S().rageFlare(a); ctx.float(a, '🔥 Frenzy!', 'quick'); return P(ctx, 1200); }]]);
reg('atk-swarm', 'labSkillFx → SkillFX.swarm', [['A', 'Now: a buzzing cloud converges', ctx=>{ S().swarm(mine(ctx)[0], foe(ctx)[1]); return P(ctx, 1500); }]]);
// 2026-10-16 (user: "Many flying cards throw a 'line' at the enemy to attack. Make them attack normally ... just the shadows draw
// closer to the card."): a flyer's attack is the normal lunge; its shadow draws in under it (SkillFX.flyDescend, from animateAttacker).
const asFlyer = el=>{ if(!el || el.classList.contains('is-flying')) return el; el.classList.add('is-flying'); const t = tileOf(el); if(!t) return el;
  const body = document.createElement('div'); body.className = 'fly-body'; t.parentNode.insertBefore(body, t); body.appendChild(t);
  const sh = document.createElement('span'); sh.className = 'fly-shadow'; sh.setAttribute('aria-hidden', 'true'); el.insertBefore(sh, body); return el; };
const flyerAttack = (ctx, slow)=>{ const a = asFlyer([...mine(ctx)].find(c=> c && c.classList.contains('is-flying')) || mine(ctx)[2]), t = foe(ctx)[1], k = slow || 1, lx = lean(a, t);
  lunge(a, true, {leanX:lx}); S().flyDescend(a, {dir:1, leanX:lx, windup:T.windup, strike:T.strike});
  return ctx.wait(T.windup + T.impactPad).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 1100*k); }); };
reg('atk-flying-swoop', 'animateAttacker → SkillFX.flyDescend (the swoop trail is retired)', [['A', '2026-10-16: the normal lunge; the shadow draws in under the flyer as it dives', ctx=> flyerAttack(ctx)],
  ['B', 'Old: an air-trail dive (SkillFX.swoop, no longer in fights)', ctx=>{ const t = foe(ctx)[1]; S().swoop(mine(ctx)[2], t, {flight:420}); ctx.wait(420).then(()=> flashDmg(ctx, t, 3)); return P(ctx, 1300); }]]);
reg('atk-scared-lunge', LIVE + 'hit whose target has Scare (once a round)', [['A', 'Sweat, a wobbling "!", it shrinks back, then swings', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; X().fearTell(a); lunge(a, true, {leanX:lean(a, t), scared:true}); return ctx.wait(T.windup*2 + T.impactPad).then(()=>{ flashDmg(ctx, t, 2); return P(ctx, 900); }); }],
  ['B', 'Old: a wobbly lunge and 😨', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.float(a, '😨', 'debuff'); lunge(a, true, {leanX:lean(a, t), scared:true}); return P(ctx, 1500); }]]);
const ufx = style=> ctx=> melee(ctx, (a, t)=>{ try{ U().hitMark(style, t); }catch(e){} try{ ctx.sound(style); }catch(e){} flashDmg(ctx, t, 3); }).then(()=> P(ctx, 1000));
reg('atk-unitfx-claw', 'UnitFX.hitMark(claw)', [['A', 'Now: claw rake marks', ufx('claw')]]);
reg('atk-unitfx-bite', 'UnitFX.hitMark(bite)', [['A', '2026-10-16: one row per jaw, the jaws close and mesh; tips white, roots faintly red', ufx('bite')]]);
reg('atk-unitfx-sting', 'UnitFX.hitMark(sting)', [['A', 'Now: stinger dot', ufx('sting')]]);
reg('atk-unitfx-peck', 'UnitFX.hitMark(peck)', [['A', 'Now: beak dents', ufx('peck')]]);
reg('atk-unitfx-burn', 'UnitFX.hitMark(burn)', [['A', 'Now: scorch star', ufx('burn')]]);
reg('atk-unitfx-firebreath', 'UnitFX.attackFx(fireBreath)', [['A', 'Now: fire breath', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; try{ U().attackFx('fireBreath', a, t, 570); ctx.sound('fireBreath', 570); }catch(e){} ctx.wait(570).then(()=> flashDmg(ctx, t, 4, 'heat')); return P(ctx, 1600); }]]);
reg('atk-counter-parry', 'SkillFX.parry', [['A', 'Now: crossed blades, a ping', ctx=>{ S().parry(foe(ctx)[1], mine(ctx)[1]); return P(ctx, 1000); }]]);
reg('atk-guardian-redirect', LIVE + 'hit with ev.guardianRedirect', [['A', 'A bronze shield slides into the line, the blow bends to it', ctx=>{ const a = foe(ctx)[0], gd = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, gd)}); ctx.wait(T.windup - 40).then(()=> X().guardPull(a, gd, {from:mine(ctx)[0]}));
  return ctx.wait(T.windup + T.impactPad + 40).then(()=>{ ctx.sound('shield'); flashDmg(ctx, gd, 2); return P(ctx, 1000); }); }],
  ['B', 'Old: a 🛡 flash on the guardian', ctx=>{ const a = foe(ctx)[0], gd = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, gd)}); return ctx.wait(T.windup + T.impactPad).then(()=>{ const s = document.createElement('div'); s.className = 'shield-flash'; s.textContent = '🛡'; gd.appendChild(s); setTimeout(()=> s.remove(), 650); flashDmg(ctx, gd, 2); return P(ctx, 900); }); }]]);
reg('atk-thorns', 'labSkillFx → SkillFX.thorns', [['A', 'Now: brambles sting the attacker', ctx=>{ S().thorns(foe(ctx)[1], mine(ctx)[1]); ctx.wait(300).then(()=> flashDmg(ctx, mine(ctx)[1], 1)); return P(ctx, 1200); }]]);
reg('atk-reflect', 'eighthPassVfx → SkillFX.mirrorFlash', [['A', 'Now: a mirror flash, "🪞 -N"', ctx=>{ S().mirrorFlash(foe(ctx)[1], mine(ctx)[1]); ctx.wait(250).then(()=> ctx.float(mine(ctx)[1], '🪞 -3', 'debuff')); return P(ctx, 1200); }]]);
reg('atk-recoil', LIVE + 'statusFx recoil', [['A', 'A red 💢 jolt with impact lines', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '💢 −1', 'debuff'); return X().recoilJolt(el).then(()=> P(ctx, 300)); }],
  ['B', 'Old: "💢 −N" and a recoil', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '💢 −1', 'debuff'); try{ recoilEl(el, .7); }catch(e){} return P(ctx, 900); }]]);
reg('atk-spite', LIVE + 'statusFx spite (victim lashes its killer)', [['A', 'A thorny vine whips from the dying unit to its killer', ctx=>{ const v = foe(ctx)[1], k = mine(ctx)[1]; return X().spiteLash(v, k).then(()=>{ ctx.float(k, '-2', 'debuff'); return P(ctx, 600); }); }]]);
reg('atk-evade-evasive', 'flashDodge + labSkillFx → SkillFX.evasiveDodge', [['A', 'Now: blink sidestep, leaves', ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad).then(()=>{ S().evasiveDodge(t); dodge(ctx, t, 'evasive'); return P(ctx, 1200); }); }]]);
reg('atk-evade-swift', 'flashDodge + SkillFX.evasiveDodge', [['A', 'Now: shared blink sidestep, 💨', ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad).then(()=>{ S().evasiveDodge(t); dodge(ctx, t, 'swift'); return P(ctx, 1200); }); }]]);
const evade = (fn, reason)=> ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad - 60).then(()=>{ fn(t, a); ctx.wait(60).then(()=> dodge(ctx, t, reason)); return P(ctx, 1300); }); };
const evadeOld = reason=> ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad).then(()=>{ dodge(ctx, t, reason); return P(ctx, 1200); }); };
reg('atk-evade-flying', LIVE + 'evaded {reason:flying}', [['A', 'Lifts out of reach, feathers drift (SkillFX.feathers)', evade(t=> X().flyLift(t), 'flying')], ['B', 'Old: the hop and "Miss"', evadeOld('flying')]]);
reg('atk-evade-fog', LIVE + 'evaded {reason:fog}', [['A', 'Fog curls round the blade and swallows it', evade((t, a)=> X().fogSwallow(t, a), 'evasive')], ['B', 'Old: the hop and "Miss"', evadeOld('evasive')]]);
reg('atk-evade-illusory', LIVE + 'evaded {reason:illusory} (A)', [['A', 'Mirror images split, the struck one pops', evade(t=> X().illusorySplit(t), 'evasive')], ['B', 'Heat-shimmer wobble, rainbow edges', evade(t=> X().illusorySplit_B(t), 'evasive')],
  ['C', 'The illusion shatters like glass', evade(t=> X().illusorySplit_C(t), 'evasive')], ['D', 'Old: the hop and "Miss"', evadeOld('evasive')]]);
reg('atk-evade-shadow', LIVE + 'evaded {reason:shadow} (A)', [['A', 'The strike passes through dark smoke', evade(t=> X().shadowPass(t), 'evasive')], ['B', 'It sinks into its own shadow and rises', evade(t=> X().shadowPass_B(t), 'evasive')],
  ['C', 'Black silhouette, two blinking eyes', evade(t=> X().shadowPass_C(t), 'evasive')], ['D', 'Old: the hop and "Miss"', evadeOld('evasive')]]);
reg('atk-evade-smoke', LIVE + 'evaded {reason:smoke}', [['A', 'The cloud swallows the swing (SkillFX.smokePuff)', evade(t=> X().smokeSwallow(t), 'smoke')], ['B', 'Old: the hop and "🌫️ Miss"', evadeOld('smoke')]]);
reg('atk-blind-miss', LIVE + 'blindMiss (night: a moon)', [['A', 'Blindfold slides on, it swings at empty air', ctx=>{ const a = mine(ctx)[1]; lunge(a, true); ctx.wait(190).then(()=> X().blindSwing(a)); return ctx.wait(T.windup).then(()=>{ ctx.sound('blindTone'); ctx.float(a, '👁 Miss!', 'debuff'); return P(ctx, 1100); }); }],
  ['B', 'At night', ctx=>{ const a = mine(ctx)[1]; lunge(a, true); ctx.wait(190).then(()=> X().blindSwing(a, {night:true})); return ctx.wait(T.windup).then(()=>{ ctx.float(a, '🌙 Miss!', 'debuff'); return P(ctx, 1100); }); }],
  ['C', 'Old: the lunge and "👁 Miss!"', ctx=>{ const a = mine(ctx)[1]; lunge(a, true); return ctx.wait(T.windup).then(()=>{ ctx.float(a, '👁 Miss!', 'debuff'); return P(ctx, 1000); }); }]]);
reg('atk-confused-whiff', LIVE + 'confusedWhiff', [['A', 'A dud spark sputters out, ❓ spins', ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '❓ Fizzle', 'debuff'); return X().fizzle(a); }], ['B', 'Old: "❓ Fizzle"', ctx=>{ ctx.float(mine(ctx)[1], '❓ Fizzle', 'debuff'); return P(ctx, 1000); }]]);
reg('atk-tipsy-swing', LIVE + 'tipsySwing {drift, miss}', [['A', 'Bubbles, "hic!", a sway', ctx=>{ const a = mine(ctx)[1]; a.style.setProperty('--lurch', '14px'); cls(a, 'tipsy-lurch', 700); return X().tipsyBubbles(a, {drift:1}); }],
  ['B', 'Old: the lurch only', ctx=>{ const a = mine(ctx)[1]; a.style.setProperty('--lurch', '14px'); cls(a, 'tipsy-lurch', 700); return P(ctx, 1000); }]]);
reg('atk-boomerang-castle', 'SkillFX.boomerangCastle', [['A', 'Now: bounces off the castle and away', ctx=>{ ctx.sound('boomerangWhirr'); S().boomerangCastle(mine(ctx)[0], W(ctx).castleFoe, {flight:420}); return P(ctx, 1600); }]]);
reg('atk-boomerang-return', LIVE + 'boomerangReturn (the next round)', [['A', 'It swings back in from the edge of the field', ctx=>{ const a = mine(ctx)[2]; ctx.sound('boomerangWhirr'); ctx.float(a, '🪃 Boomerang returns!', 'quick'); return X().boomerangInbound(a, {host:W(ctx).el}); }],
  ['B', 'Old: the float only', ctx=>{ ctx.float(mine(ctx)[2], '🪃 Boomerang returns!', 'quick'); return P(ctx, 1000); }]]);
reg('atk-boomerang-caught', LIVE + 'boomerangCaught', [['A', 'It slaps into the thrower\'s hand', ctx=>{ const a = mine(ctx)[2]; ctx.float(a, '🪃 Caught!', 'quick'); return X().catchSnap(a); }], ['B', 'Old: "🪃 Caught!"', ctx=>{ ctx.float(mine(ctx)[2], '🪃 Caught!', 'quick'); return P(ctx, 900); }]]);
reg('atk-boomerang-whiff', LIVE + 'boomerangWhiff', [['A', 'It whooshes past through empty air', ctx=>{ ctx.sound('boomerangWhirr'); return X().whiffPast(mine(ctx)[2]).then(()=> P(ctx, 300)); }], ['B', 'Old: the whiff callout', ctx=>{ dodge(ctx, mine(ctx)[2], 'whiff'); return P(ctx, 1100); }]]);
reg('atk-boomerang-friendly', LIVE + 'hit/hitHQ {boomerang, friendly}', [['A', 'Bonk: a star, a sweat drop, "Oops!"', ctx=>{ const t = mine(ctx)[0]; ctx.sound('hitAt', 2, false); flashDmg(ctx, t, 2); return X().friendlyBonk(t); }], ['B', 'Old: a plain hit', ctx=>{ flashDmg(ctx, mine(ctx)[0], 2); return P(ctx, 900); }]]);
reg('atk-king-slayer', 'SkillFX.crownCrack + float', [['A', 'Now: the crown cracks in two', ctx=>{ const t = foe(ctx)[1]; ctx.sound('kingSlayerTone'); S().crownCrack(t); ctx.float(t, '👑💥 King Slayer! +3', 'debuff'); return P(ctx, 1300); }]]);
reg('atk-pierce-rend', 'eighthPassVfx → SkillFX.pierceThrough', [['A', 'Now: the blade punches through Armor', ctx=> melee(ctx, (a, t)=>{ S().pierceThrough(t, {from:90}); ctx.float(t, '🗡 Pierced!', 'debuff'); }).then(()=> P(ctx, 1100))]]);
reg('atk-pierce-hq', 'SkillFX.pierceThrough on the castle (A); onEvent pierceHQ: SkillFX.pierce carries the shot on into the castle (B)', [
  ['A', 'Now: pierce-through on the castle', ctx=>{ const c = W(ctx).castleFoe; S().pierceThrough(c, {from:90}); ctx.float(c, '🗡 -2', 'debuff'); return P(ctx, 1100); }],
  ['B', 'SkillFX.pierce: an arrow through the unit into the castle', ctx=>{ const a = mine(ctx)[0], t = foe(ctx)[0], c = W(ctx).castleFoe; ctx.sound('bowDraw', false, 240);
    S().pierce(a, t, c, {draw:240, flight:260, onFirst:()=> flashDmg(ctx, t, 3), onSecond:()=>{ S().pierceThrough(c, {from:90}); ctx.float(c, '🗡 -2', 'debuff'); }}); return P(ctx, 1700); }]]);
reg('atk-overwhelm-hq', LIVE + 'overwhelmHQ', [['A', 'A dust cloud and hoof prints charge into the wall', ctx=>{ const c = W(ctx).castleFoe; X().stampede(mine(ctx)[2], c); return ctx.wait(420).then(()=>{ ctx.sound('overwhelmTone'); ctx.float(c, '💥 -4', 'debuff'); return P(ctx, 1000); }); }],
  ['B', 'Old: a shake and "💥 -N"', ctx=>{ const c = W(ctx).castleFoe; ctx.float(c, '💥 -4', 'debuff'); try{ recoilEl(c, 1); }catch(e){} return P(ctx, 900); }]]);
reg('atk-siege', LIVE + 'hitHQ with ev.siege', [['A', 'A battering ram slams the castle', ctx=>{ const c = W(ctx).castleFoe; lunge(mine(ctx)[0], true, {toCastle:true}); ctx.wait(T.windup - 60).then(()=> X().siegeRam(c, {fromBelow:true}));
  return ctx.wait(T.windup + T.impactPad).then(()=>{ ctx.sound('siegeTone'); ctx.float(c, '-6', 'hq-big'); return P(ctx, 1000); }); }],
  ['B', 'Old: "🏰 Siege!"', ctx=>{ const c = W(ctx).castleFoe; ctx.float(c, '🏰 Siege!', 'debuff'); return P(ctx, 1000); }]]);
reg('atk-bulwark', LIVE + 'hitHQ with ev.bulwark > 0', [['A', 'A stone rampart rises and the blow sparks off', ctx=>{ const c = W(ctx).castleFoe; lunge(mine(ctx)[0], true, {toCastle:true}); ctx.wait(T.windup).then(()=> X().bulwarkWall(c, {fromBelow:true}));
  return ctx.wait(T.windup + T.impactPad).then(()=>{ ctx.sound('bulwarkTone'); ctx.float(c, '🛡 -2 blocked', ''); return P(ctx, 1000); }); }],
  ['B', 'Old: "🛡 -N blocked"', ctx=>{ ctx.float(W(ctx).castleFoe, '🛡 -2 blocked', ''); return P(ctx, 1000); }]]);
reg('atk-stealth-slip', 'eighthPassVfx → SkillFX.stealthSlip', [['A', 'Now: melts into shadow and slips to the castle', ctx=>{ ctx.sound('stealthTone'); S().stealthSlip(mine(ctx)[1], W(ctx).castleFoe); ctx.wait(500).then(()=> ctx.float(W(ctx).castleFoe, '👻 Stealth!', 'debuff')); return P(ctx, 1300); }]]);
reg('atk-fester', LIVE + 'hit with ev.festerBonus', [['A', 'Sickly boils swell and pop', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 5, 'poison'); ctx.float(t, '+2☠ Fester', 'poison'); X().festerBoils(t); }).then(()=> P(ctx, 1000))],
  ['B', 'Old: "+N☠ Fester"', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 5, 'poison'); ctx.float(t, '+2☠ Fester', 'poison'); }).then(()=> P(ctx, 900))]]);
reg('atk-rupture', LIVE + 'hit with ev.ruptureBonus', [['A', 'A red crack splits and blood sprays', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 5); ctx.float(t, '+2🩸 Rupture', 'bleed'); X().ruptureBurst(t); }).then(()=> P(ctx, 1000))],
  ['B', 'Old: "+N🩸 Rupture"', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 5); ctx.float(t, '+2🩸 Rupture', 'bleed'); }).then(()=> P(ctx, 900))]]);
reg('atk-quake-hit', '.quake-jolt + flashDmg (0.1 s apart)', [['A', 'Now: each unit jolts in turn', ctx=>{ const all = foe(ctx).concat(mine(ctx)); all.forEach((el, i)=> setTimeout(()=>{ const t = tileOf(el); cls(t, 'quake-jolt', 420); flashDmg(ctx, el, 2); }, i*100)); return P(ctx, 1400); }]]);
reg('atk-retribution', LIVE + 'hit with ev.retribution (the glyph missile is hidden)', [['A', 'A gold beam strikes from above, ⚖️', ctx=>{ const t = foe(ctx)[2]; return ctx.wait(300).then(()=> X().holyBeam(t, {onImpact:()=>{ ctx.sound('prayerChime'); flashDmg(ctx, t, 3); }})).then(()=> P(ctx, 300)); }],
  ['B', 'Old: a plain projectile', ctx=>{ const t = foe(ctx)[2]; glyphShot(W(ctx).castleMine, t, '➶'); return ctx.wait(T.projectile).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 900); }); }]]);
reg('atk-reload', LIVE + 'hit by a Reload unit (full dial); skipTurn reload (part dial)', [['A', 'A reload dial winds round after the shot', ctx=>{ const a = mine(ctx)[1]; ctx.sound('reloadTone'); ctx.float(a, '🔄 Reloading', ''); return X().reloadDial(a); }],
  ['B', 'Waiting to reload (skipped turn)', ctx=> X().reloadDial(mine(ctx)[1], {part:true})], ['C', 'Old: "🔄 Reloading"', ctx=>{ ctx.float(mine(ctx)[1], '🔄 Reloading', ''); return P(ctx, 1000); }]]);
reg('atk-friction', LIVE + 'friction {dmg} on an ally', [['A', 'Grinding sparks and a gear between the two', ctx=>{ const t = mine(ctx)[2]; ctx.float(t, '⚙️ -1', 'dmg'); return X().frictionSparks(mine(ctx)[1], t); }], ['B', 'Old: shake and "⚙️ -N"', ctx=>{ const t = mine(ctx)[2]; ctx.float(t, '⚙️ -1', 'dmg'); try{ recoilEl(t, 1); }catch(e){} return P(ctx, 900); }]]);
// 2026-10-15 (user: "I noticed pounce does a line of damage to the enemy"): the ghost trail (now B) rose straight up the column and
// read as a line of damage. In fights the pounce is a leap at the unit it really hits (a random enemy), with a dust kick.
reg('atk-pounce', LIVE + 'pounce {amount} on play (dust kick) + its hit, tagged pounce:true and played as a leap', [['A', 'Dust kick, then a leap at the unit it hits', ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[2]; ctx.float(a, '🐾 Pounce 2', 'gold'); X().pounceKick(a);
    g().timeline().to(tileOf(a), {y:6, scale:.94, duration:.08}).to(tileOf(a), {y:-12, scale:1.06, duration:.1}).to(tileOf(a), {y:0, scale:1, duration:.16, clearProps:'transform'});
    return ctx.wait(340).then(()=>{ lunge(a, true, {leanX:lean(a, t)}); return ctx.wait(T.windup + T.impactPad); }).then(()=>{ flashDmg(ctx, t, 2); return P(ctx, 900); }); }],
  ['B', 'Before: a leap trail out and back (rose up the column like a line)', ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '🐾 Pounce 2', 'gold'); return X().pounceLeap(a, {up:-1}); }], ['C', 'Old: crouch-and-spring + float', ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '🐾 Pounce 2', 'gold'); g().timeline().to(a, {y:6, scale:.94, duration:.08}).to(a, {y:-12, scale:1.06, duration:.1}).to(a, {y:0, scale:1, duration:.16, clearProps:'transform'}); return P(ctx, 900); }]]);
reg('atk-swipe-lumber', LIVE + 'swipeLumber (the old 🪵 glyph is hidden)', [['A', 'Logs hop out of the castle into the swiper\'s hands', ctx=>{ const a = mine(ctx)[1]; ctx.sound('coin'); X().lumberSnatch(W(ctx).castleFoe, a, {n:3}); return ctx.wait(600).then(()=>{ ctx.float(a, '🫳 +3🪵', 'gold'); return P(ctx, 700); }); }],
  ['B', 'Old: one 🪵 glyph slides across', ctx=>{ const a = mine(ctx)[1]; glyphShot(W(ctx).castleFoe, a, '🪵', 380); return ctx.wait(380).then(()=>{ ctx.float(a, '🫳 +3🪵', 'gold'); return P(ctx, 800); }); }]]);
reg('atk-charge-fire', LIVE + 'charge {fired}: the clock winds, then SkillFX.shockwave', [['A', 'The clock winds round and lets go as a shockwave', ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '⏲️ Charge!', 'gold'); ctx.sound('gritUp'); return X().chargeRelease(a, {cards:[mine(ctx)[0], mine(ctx)[2]]}); }],
  ['B', 'Old: "⏲️ Charge!"', ctx=>{ ctx.float(mine(ctx)[1], '⏲️ Charge!', 'gold'); return P(ctx, 900); }]]);
reg('atk-castle-bolt-shot', LIVE + 'statusFx castleBolt, then its hit from the castle (the glyph is hidden)', [['A', 'The fort\'s ballista fires a bronze bolt', ctx=>{ const t = foe(ctx)[1]; return X().ballista(W(ctx).castleMine, t, {flight:380, onImpact:()=>{ ctx.sound('arrowThunk', false); flashDmg(ctx, t, 3); }}).then(()=> P(ctx, 300)); }],
  ['B', 'Old: a plain projectile from the castle', ctx=>{ const t = foe(ctx)[1]; glyphShot(W(ctx).castleMine, t, '➶'); return ctx.wait(T.projectile).then(()=>{ flashDmg(ctx, t, 3); return P(ctx, 900); }); }]]);

// =================================================== skills ===================================================
reg('sk-trigger-fired', 'triggerFiredVfx (.trigger-rune + .trigger-aura)', [['A', 'Now: glyph ring and electric back glow', ctx=>{ const el = mine(ctx)[1], r = C(el); ctx.sound('trigger');
  const ring = document.createElement('div'); ring.className = 'trigger-rune'; ring.style.cssText = `left:${r.x}px; top:${r.y}px; --rs:${Math.round(Math.max(r.w, r.h)*1.05)}px;`; ring.innerHTML = '<i></i><b>⚔️</b>'; document.body.appendChild(ring); setTimeout(()=> ring.remove(), 900);
  cls(tileOf(el), 'trigger-glow', 700); const a = document.createElement('span'); a.className = 'trigger-aura'; el.prepend(a); setTimeout(()=> a.remove(), 900); return P(ctx, 1200); }]]);
reg('sk-earthquake', 'labSkillFx → SkillFX.earthquake', [['A', 'Now: cracks run across, cards jolt', ctx=>{ ctx.sound('earthquakeTone'); S().earthquake(foe(ctx).concat(mine(ctx)), {host:W(ctx).el, onEachImpact:el=> flashDmg(ctx, el, 2)}); return P(ctx, 1600); }]]);
reg('sk-landslide', LIVE + 'earthquake {landslide} (High effects)', [['A', 'Boulders tumble in from the top edge', ctx=>{ ctx.sound('earthquakeTone'); X().landslide(foe(ctx).concat(mine(ctx)), {host:W(ctx).el}); return ctx.wait(500).then(()=>{ foe(ctx).forEach(t=> flashDmg(ctx, t, 2)); return P(ctx, 1100); }); }],
  ['B', 'Old: same as Earthquake', ctx=>{ S().earthquake(foe(ctx).concat(mine(ctx)), {host:W(ctx).el}); return P(ctx, 1500); }]]);
const sweep = (kind, side)=>{ const bf = document.getElementById('battlefieldEl'); if(!bf) return; const r = bf.getBoundingClientRect(), d = document.createElement('div'); d.className = 'bw-sweep bw-sweep-' + kind;
  Object.assign(d.style, {left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px'}); document.body.appendChild(d); const b = document.createElement('div'); b.className = 'bw-sweep-band'; d.appendChild(b);
  if(kind === 'avalanche') g().fromTo(b, {yPercent:-120, opacity:.95}, {yPercent:120, duration:.75, ease:'power2.in', onComplete:()=> d.remove()}); else g().fromTo(b, {xPercent:-120, opacity:.95}, {xPercent:120, duration:.7, ease:'power1.inOut', onComplete:()=> d.remove()}); };
reg('sk-tornado', 'boardSweepVfx(tornado) + spins', [['A', 'Now: a band sweeps, cards spin', ctx=>{ ctx.sound('boomerangWhirr'); sweep('tornado'); foe(ctx).forEach((el, i)=>{ ctx.float(el, '🌪️', 'quick'); g().fromTo(el, {rotation:-200, scale:.8}, {rotation:0, scale:1, duration:.55, delay:i*.06, ease:'back.out(1.6)', clearProps:'transform'}); }); return P(ctx, 1300); }]]);
reg('sk-avalanche', 'boardSweepVfx(avalanche) + frost', [['A', 'Now: a white band falls, frost rings', ctx=>{ ctx.sound('freezeChime'); sweep('avalanche'); foe(ctx).forEach(el=>{ const c = C(el); S().ring(c.x, c.y, 'sfx-frost', 90, 600); S().burst(c.x, c.y - c.h/6, 90, 'ice', 8); }); return P(ctx, 1300); }]]);
reg('sk-tsunami', 'boardSweepVfx(tsunami) + elastic push', [['A', 'Now: a wave band, cards pushed back', ctx=>{ ctx.sound('splash'); sweep('tsunami'); foe(ctx).forEach(el=> g().fromTo(el, {y:-14}, {y:0, duration:.5, ease:'elastic.out(1, .5)', clearProps:'transform'})); return P(ctx, 1300); }]]);
reg('sk-wave', LIVE + 'wave {dir} (the water geyser is hidden)', [['A', 'A rolling crest sweeps over it', ctx=>{ const t = foe(ctx)[1]; ctx.sound('splash'); ctx.float(t, '〰️ →', 'quick'); X().rollingCrest(t, {dir:'right'}); t.style.setProperty('--wave-dx', '10px'); t.style.setProperty('--wave-rot', '3deg'); setTimeout(()=> cls(t, 'wave-pushed', 600), 300); return P(ctx, 1200); }],
  ['B', 'Old: the water geyser', ctx=>{ const t = foe(ctx)[1], r = t.getBoundingClientRect(), gz = document.createElement('div'); gz.className = 'lava-geyser is-water'; gz.style.left = (r.left + r.width/2) + 'px'; gz.style.top = (r.bottom - 6) + 'px'; gz.style.setProperty('--h', Math.round(r.height*1.25) + 'px');
    gz.innerHTML = '<i class="lg-col"></i>' + Array.from({length:12}, ()=> `<b style="--x:${Math.round((Math.random() - .5)*r.width*1.2)}px; --y:${-Math.round(r.height*(.6 + Math.random()*.8))}px; --d:${(Math.random()*.25).toFixed(2)}s"></b>`).join(''); document.body.appendChild(gz); setTimeout(()=> gz.remove(), 1300); ctx.float(t, '〰️ →', 'quick'); return P(ctx, 1300); }]]);
reg('sk-dragon-lightning', 'fifthPassVfx → red SkillFX.lightning', [['A', 'Now: red lightning chains', ctx=>{ ctx.sound('shockTone'); S().lightning(mine(ctx)[1], foe(ctx), {}); const b = document.querySelectorAll('svg.sfx-bolt'); if(b.length) b[b.length - 1].classList.add('sfx-bolt-red'); foe(ctx).forEach(el=> cls(el, 'dragon-struck', 700)); return P(ctx, 1300); }]]);
reg('sk-electricity', 'electricity event → SkillFX.lightning (its arc hit throws nothing since 2026-10-16)', [['A', '2026-10-16: each bolt fades from the moment it appears; jumps 20% closer together', ctx=>{ ctx.sound('shockTone'); S().lightning(mine(ctx)[1], [foe(ctx)[1], foe(ctx)[2]], {onEachImpact:t=> flashDmg(ctx, t, 2)}); return P(ctx, 1200); }],
  ['B', 'Old bug: the arc hit also threw a grey ➶ (generic projectile, dmgType shock)', ctx=>{ ctx.sound('shockTone'); S().lightning(mine(ctx)[1], [foe(ctx)[1], foe(ctx)[2]], {}); ctx.wait(T.windup).then(()=> glyphShot(mine(ctx)[1], foe(ctx)[2], '➶')); return P(ctx, 1600); }]], 'Voltaic Eel (Electricity 1): the arc to the unit beside the target is a ranged hit; it used to fall through to spawnProjectile.');
reg('sk-lightning-passive', LIVE + 'statusFx lightning', [['A', 'A storm bolt strikes the card, sparks crawl over it', ctx=>{ ctx.sound('shockTone'); const el = mine(ctx)[1]; ctx.float(el, '⚡ +2', 'buff'); return X().stormBolt(el); }]]);
reg('sk-fireball', 'sixthPassVfx → SkillFX.fireball', [['A', 'Now: a fireball and splash', ctx=>{ ctx.sound('burnAway'); S().fireball(mine(ctx)[1], foe(ctx)[1], {sides:[foe(ctx)[0], foe(ctx)[2]]}); return P(ctx, 1600); }]]);
reg('sk-meteor', 'sixthPassVfx → SkillFX.meteor + crater', [['A', 'Now: a meteor and its crater', ctx=>{ ctx.sound('knockOut'); S().meteor(foe(ctx)[1], {sides:[foe(ctx)[0], foe(ctx)[2]]}); setTimeout(()=> foe(ctx)[1].classList.add('meteor-crater'), 600); return P(ctx, 1800); }]]);
reg('sk-meteor-burn', LIVE + 'meteorBurn (once a round per crater)', [['A', 'A glowing crater with lava cracks and smoke', ctx=>{ const el = foe(ctx)[1]; el.classList.add('meteor-crater'); ctx.float(el, '☄️🔥-2', 'dmg'); return X().craterBurn(el); }],
  ['B', 'Old: scorch + the crater class', ctx=>{ const el = foe(ctx)[1]; el.classList.add('meteor-crater'); S().scorch(el, {}); ctx.float(el, '☄️🔥-2', 'dmg'); return P(ctx, 1300); }]]);
reg('sk-psychic', 'sixthPassVfx → SkillFX.mindWave', [['A', 'Now: violet rings of thought', ctx=>{ S().mindWave(mine(ctx)[1], foe(ctx)[1], {}); ctx.float(foe(ctx)[1], '💭 -3', 'dmg'); return P(ctx, 1200); }]]);
reg('sk-smoke-bomb', 'sixthPassVfx → SkillFX.smokeBomb', [['A', 'Now: a lit bomb lobbed, a grey cloud', ctx=>{ ctx.sound('boomerangWhirr'); S().smokeBomb(mine(ctx)[1], foe(ctx)[1], {onImpact:()=> ctx.float(foe(ctx)[1], '🌫️ Smoke', 'buff')}); return P(ctx, 1600); }]]);
reg('sk-banana-throw', 'sixthPassVfx → SkillFX.bananaThrow', [['A', 'Now: a banana thrown', ctx=>{ ctx.sound('boomerangWhirr'); S().bananaThrow(mine(ctx)[1], foe(ctx)[1], {}); return P(ctx, 1400); }]]);
reg('sk-banana-eat', 'sixthPassVfx → SkillFX.munch', [['A', 'Now: munch', ctx=>{ S().munch(mine(ctx)[1], {glyph:'🍌'}); ctx.float(mine(ctx)[1], '🍌 Munch!', 'heal'); return P(ctx, 1300); }]]);
reg('sk-durian', LIVE + 'durian {thorns}', [['A', 'Spikes burst out all round the card', ctx=>{ const el = mine(ctx)[1]; S().munch(el, {glyph:'<i class="ico-durian big"></i>'}); ctx.wait(450).then(()=> X().durianSpikes(el)); ctx.float(el, '🌵 Thorns +1', 'buff'); return P(ctx, 1500); }],
  ['B', 'Old: munch + float', ctx=>{ const el = mine(ctx)[1]; S().munch(el, {glyph:'<i class="ico-durian big"></i>'}); ctx.float(el, '🌵 Thorns +1', 'buff'); return P(ctx, 1300); }]]);
reg('sk-chilli', 'ninthPassVfx → SkillFX.chilliHeat', [['A', 'Now: red flush and steam', ctx=>{ S().chilliHeat(mine(ctx)[1], {}); ctx.float(mine(ctx)[1], '🌶️ +2⚔ 🔥', 'buff'); return P(ctx, 1500); }]]);
reg('sk-coffee', 'eighthPassVfx → SkillFX.clockTick', [['A', 'Now: the clock spins fast', ctx=>{ S().clockTick(mine(ctx)[1], {dir:-1}); ctx.float(mine(ctx)[1], '☕ −1 ⏳', 'quick'); return P(ctx, 1300); }]]);
reg('sk-dynamite', LIVE + 'dynamite: SkillFX.dynamite (the CSS blast is hidden)', [['A', 'SkillFX.dynamite: a lit stick tossed up, fizzes, blows', ctx=>{ const el = foe(ctx)[1]; ctx.sound('siegeTone'); return X().dynamiteBlast(el, {host:W(ctx).el, flight:240, fuse:160, onImpact:()=> foe(ctx).concat(mine(ctx)[1]).forEach(t=> flashDmg(ctx, t, 3, 'heat'))}); }],
  ['B', 'Old: the CSS blast and shake', ctx=>{ const el = foe(ctx)[1], r = el.getBoundingClientRect(), b = document.createElement('div'); b.className = 'dyn-blast'; b.style.left = (r.left + r.width/2) + 'px'; b.style.top = (r.top + r.height/2) + 'px'; document.body.appendChild(b); setTimeout(()=> b.remove(), 900); cls(W(ctx).el, 'dyn-shake', 600); return P(ctx, 1200); }]]);
reg('sk-dynamite-fuse', LIVE + 'fuse {left}', [['A', 'The fuse fizzes sparks', ctx=> X().fuseSpark(mine(ctx)[1], {})], ['B', 'Last round: it throbs red', ctx=> X().fuseSpark(mine(ctx)[1], {last:true}).then(()=> P(ctx, 300))]]);
reg('sk-explode', LIVE + 'explode', [['A', 'It swells, flashes faster, bursts green', ctx=>{ const el = foe(ctx)[1]; ctx.wait(400).then(()=>{ ctx.sound('boom'); ctx.float(el, '💥 Boom!', 'debuff'); }); return X().creeperBurst(el); }],
  ['B', 'Old: a small shake and "💥 Boom!"', ctx=>{ const el = foe(ctx)[1]; ctx.float(el, '💥 Boom!', 'debuff'); try{ recoilEl(el, 1); }catch(e){} return P(ctx, 900); }]]);
reg('sk-rocket', LIVE + 'statusFx rocket', [['A', 'A rocket launches with a smoke trail', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🚀 Rocket!', 'quick'); return X().rocketLaunch(el, W(ctx).castleFoe); }], ['B', 'Old: "🚀 Rocket!"', ctx=>{ ctx.float(mine(ctx)[1], '🚀 Rocket!', 'quick'); return P(ctx, 900); }]]);
reg('sk-rally', LIVE + 'rally: SkillFX.rally (A)', [['A', 'SkillFX.rally: a banner pops, chevrons through the allies', ctx=>{ const el = mine(ctx)[1]; ctx.sound('rallyTone'); ctx.float(el, '🚩 Rally! +1/+0', 'gold'); S().rally([el, mine(ctx)[0], mine(ctx)[2]]); return P(ctx, 1500); }],
  ['B', 'Otter standard: the bronze fish raised, teal pennant', ctx=>{ const el = mine(ctx)[1]; ctx.sound('rallyTone'); ctx.float(el, '🚩 Rally! +1/+0', 'gold'); return X().rallyStandard([el, mine(ctx)[0], mine(ctx)[2]]); }],
  ['C', 'Old: .rally-pulse + float', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🚩 Rally! +1/+0', 'gold'); cls(el, 'rally-pulse', 700); return P(ctx, 1000); }]]);
const aura = (fn, txt, onSelf)=> ctx=>{ const el = mine(ctx)[1]; fn(el); ctx.float(el, txt, 'gold'); return P(ctx, 1300); };
reg('sk-inspired', 'eighthPassVfx → SkillFX.espritAura', [['A', 'Now: an aura, "📯 +N⚔ next swing"', aura(el=> S().espritAura(el), '📯 +1⚔ next swing')]]);
reg('sk-esprit', 'eighthPassVfx → SkillFX.espritAura', [['A', 'Now: aura and "🤝"', aura(el=> S().espritAura(el), '🤝 +1⚔')]]);
reg('sk-grit', 'eighthPassVfx → SkillFX.espritAura', [['A', 'Now: aura and grit', aura(el=> S().espritAura(el), '+1⚔')]]);
reg('sk-momentum', LIVE + 'statusFx momentum (once a round)', [['A', 'Flame chevrons stream behind, dust kicks', ctx=>{ const el = mine(ctx)[1]; ctx.sound('momentumTone'); ctx.float(el, '⌰ +1⚔', 'gold'); return X().momentumTrail(el); }], ['B', 'Old: "🔥 +N⚔"', ctx=>{ ctx.float(mine(ctx)[1], '⌰ +1⚔', 'gold'); return P(ctx, 900); }]]);
reg('sk-berserk', 'eighthPassVfx → SkillFX.rageFlare', [['A', 'Now: rage flare, shake', aura(el=> S().rageFlare(el), '😡 Berserk! +2⚔')]]);
reg('sk-hive-mind', 'rageFlare (retired 2026-10-15; still plays for old cards)', [['A', 'Now: rage flare', aura(el=> S().rageFlare(el), '😡 +1⚔')]]);
reg('sk-pack', LIVE + 'statusFx phaseGrow of a Pack / Pack Leader unit whose chain grows (once a round; old replays: statusFx pack)', [['A', 'A howl rings out, paw prints run to the pack', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🐺 Pack!', 'quick'); return X().packHowl(el, mine(ctx)); }], ['B', 'Old: "🐺 Pack!"', ctx=>{ ctx.float(mine(ctx)[1], '🐺 Pack!', 'quick'); return P(ctx, 900); }]]);
// 2026-10-16 (user: "When regeneration of heal are used to reduce poison, a grey poison counter jumps out of the creature's grey poison
// counters. Note: it takes heal values to remove poison counters - priority."): a heal takes Poison off first (engine applyHeal,
// statusFx healPoison); one counter hops out of the Poison badge per counter removed (SkillFX.poisonPop), then the rest heals.
const poisonBadge = (el, n)=>{ const t = tileOf(el); let row = t.querySelector('.badges-bottom'); if(!row){ row = document.createElement('div'); row.className = 'badges-bottom'; t.appendChild(row); }
  let b = row.querySelector('.abadge.poison'); if(!b){ b = document.createElement('span'); b.className = 'abadge poison'; row.insertBefore(b, row.firstChild); } b.textContent = '☠' + n; el.classList.add('is-poisoned'); return b; };
const healVsPoison = (ctx, el, poison, heal, regen)=>{ let left = poison; const b = poisonBadge(el, left), cut = Math.min(poison, heal), rest = heal - cut;
  const pop = ()=>{ ctx.sound('cleanseTone'); S().poisonPop(el, cut, {onEach:()=>{ left -= 1; if(left > 0) b.textContent = '☠' + left; else { b.remove(); el.classList.remove('is-poisoned'); } }}); ctx.float(el, `-${cut} ☠`, 'heal'); };
  if(regen) return until(ctx, 3200, fin=>{ S().regen(el, {onDone:()=>{ if(rest) ctx.float(el, '➕' + rest, 'heal'); ctx.wait(1000).then(fin); }}); ctx.wait(250).then(pop); });
  pop(); return ctx.wait(cut*110 + 250).then(()=>{ if(rest){ ctx.sound('healTone'); ctx.float(el, '➕' + rest, 'heal'); S().healPlus(el); } return ctx.wait(1100); }); };
R({id:'sk-heal-generic', stage:'board', variants:[
  {key:'F', label:'2026-10-16: Heal 4 on Poison 3: three counters hop out of the badge, then ➕1', play:ctx=> healVsPoison(ctx, mine(ctx)[1], 3, 4)}]});
R({id:'sk-regen', stage:'board', variants:[
  {key:'B', label:'2026-10-16: Regeneration 5 on Poison 3: the counters hop out first, then ➕2', play:ctx=> healVsPoison(ctx, mine(ctx)[0], 3, 5, true)}]});
R({id:'sk-heal-generic', stage:'board', inGameHook:LIVE + 'heal from another card (not Regen or Bloom): SkillFX.heal (B), once a round per unit', variants:[
  {key:'D', label:'Swamp medicine: herbal steam and leaves', play:ctx=>{ const t = mine(ctx)[0]; ctx.sound('healTone'); ctx.float(t, '+3❤', 'heal'); return X().herbalSteam(t); }}]});
reg('sk-regen', 'heal event (own Regeneration) → SkillFX.regen, then the number', [['A', '2026-10-16: motes sink in from the card edge (clear, peak halfway, gone at the centre), then the green pluses', ctx=> until(ctx, 2600, fin=> S().regen(mine(ctx)[0], {onDone:()=>{ ctx.float(mine(ctx)[0], '➕2', 'heal'); ctx.wait(900).then(fin); }}))]]);
reg('sk-bloom', 'eighthPassVfx → SkillFX.bloomPollen (A); B–D are biome takes from the ideas doc', [['A', 'Now: pollen drifts to the ally', ctx=>{ ctx.sound('bloomTone'); S().bloomPollen(mine(ctx)[1], mine(ctx)[0]); ctx.wait(500).then(()=> ctx.float(mine(ctx)[0], '+2❤', 'heal')); return P(ctx, 1400); }],
  ['B', 'Algae bloom: teal bubbles', ctx=> X().bloomVariant(mine(ctx)[1], mine(ctx)[0], {kind:'algae'})], ['C', 'Fungal bloom: spores and caps', ctx=> X().bloomVariant(mine(ctx)[1], mine(ctx)[0], {kind:'fungal'})],
  ['D', 'Coral bloom: coral branches', ctx=> X().bloomVariant(mine(ctx)[1], mine(ctx)[0], {kind:'coral'})]]);
reg('sk-sap', 'eighthPassVfx → SkillFX.lifeDrain', [['A', 'Now: life drains across', ctx=>{ ctx.sound('sapDrain'); S().lifeDrain(foe(ctx)[1], mine(ctx)[1]); ctx.wait(500).then(()=> ctx.float(mine(ctx)[1], '+2❤', 'heal')); return P(ctx, 1400); }]]);
reg('sk-render', 'eighthPassVfx → SkillFX.curseDrain', [['A', 'Now: a curse drains its Attack', ctx=>{ S().curseDrain(foe(ctx)[1]); ctx.float(foe(ctx)[1], '-1⚔', 'debuff'); return P(ctx, 1200); }]]);
reg('sk-gash', 'eighthPassVfx → SkillFX.bleedDrip', [['A', 'Now: an opening cut that drips', ctx=>{ S().bleedDrip(foe(ctx)[1]); ctx.float(foe(ctx)[1], '+2🩸', 'bleed'); return P(ctx, 1200); }]]);
reg('sk-revive', 'eighthPassVfx → SkillFX.reviveRise', [['A', 'Now: it rises again', ctx=>{ S().reviveRise(mine(ctx)[1]); ctx.float(mine(ctx)[1], '✨ Revived!', 'gold'); return P(ctx, 1500); }]]);
reg('sk-shield-soak', LIVE + 'shieldSoak with shield left', [['A', 'The dome flares where the blow lands', ctx=> melee(ctx, null, {target:foe(ctx)[1]}).then(()=>{ const t = foe(ctx)[1]; ctx.float(t, '💠 -2', 'debuff'); return X().shieldFlare(t, {from:90}); })],
  ['B', 'Old: "💠 -N"', ctx=>{ ctx.float(foe(ctx)[1], '💠 -2', 'debuff'); return P(ctx, 900); }]]);
reg('sk-shield-break', LIVE + 'shieldSoak with 0 left', [['A', 'The dome cracks and bursts into hex shards', ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '💠 Shield breaks', 'debuff'); ctx.sound('iceShatter'); return X().shieldShatter(t); }], ['B', 'Old: "💠 Shield breaks"', ctx=>{ ctx.float(foe(ctx)[1], '💠 Shield breaks', 'debuff'); return P(ctx, 900); }]]);
reg('sk-shell-up', 'statusFx shellUp → .shell-sweep', [['A', 'Now: a pale shell sweeps up the card', ctx=>{ const el = mine(ctx)[1]; ctx.sound('shellUp'); cls(el, 'shell-sweep', 900); setTimeout(()=> ctx.float(el, '🐢 Shell!', 'heal slow'), 450); return P(ctx, 1300); }]]);
reg('sk-shell-down', LIVE + 'statusFx shellDown', [['A', 'The shell cracks and its halves fall away', ctx=> X().shellCrack(mine(ctx)[1])]]);
reg('sk-helmet', 'labSkillFx → SkillFX.helmetDeflect', [['A', 'Now: the blow glances off a helmet', ctx=>{ S().helmetDeflect(foe(ctx)[1]); ctx.float(foe(ctx)[1], '🪖 Deflect!', 'buff'); return P(ctx, 1200); }]]);
reg('sk-nullify', LIVE + 'statusFx nullify', [['A', 'A red seal stamps on, the card greys out', ctx=>{ const el = foe(ctx)[1]; ctx.sound('stunTone'); ctx.float(el, '🚫 Nullified', 'debuff'); return X().nullSeal(el); }],
  ['B', 'Old: .nullify-flash', ctx=>{ const el = foe(ctx)[1]; ctx.float(el, '🚫 Nullified', 'debuff'); cls(el, 'nullify-flash', 700); return P(ctx, 1000); }]]);
const cleanse = (txt)=> ctx=>{ const el = mine(ctx)[1], t = tileOf(el); ctx.sound('cleanseTone'); ctx.float(el, txt, 'heal'); const fx = document.createElement('span'); fx.className = 'cleanse-fx';
  fx.innerHTML = Array.from({length:7}, (_, k)=> `<i style="left:${10 + k*12}%; animation-delay:${(k%3)*0.08}s"></i>`).join(''); t.appendChild(fx); setTimeout(()=> fx.remove(), 1100); return P(ctx, 1300); };
reg('sk-cleanse', 'cleanseVfx', [['A', 'Now: a rising band of light and motes', cleanse('✨ Cleansed')]]);
reg('sk-stanch', 'cleanseVfx', [['A', 'Now: the same band, "🩹 -N 🩸"', cleanse('🩹 -2 🩸')]]);
reg('sk-buff-action', 'eighthPassVfx → SkillFX.espritAura + statChangeVfx', [['A', 'Now: an aura and the stat pop', aura(el=> S().espritAura(el), '+2/+2')]]);
reg('sk-debuff-action', 'eighthPassVfx → SkillFX.curseDrain', [['A', 'Now: a curse drains it', ctx=>{ S().curseDrain(foe(ctx)[1]); ctx.float(foe(ctx)[1], '-2⚔', 'debuff'); return P(ctx, 1200); }]]);
reg('sk-mind-control', LIVE + 'mindControl', [['A', 'Puppet strings drop, tug it across, snap to your colour', ctx=>{ const t = foe(ctx)[1]; S().mindWave(mine(ctx)[1], t, {}); return X().puppetStrings(t, {to:mine(ctx)[1]}); }],
  ['B', 'Old: the mind-wave only', ctx=>{ S().mindWave(mine(ctx)[1], foe(ctx)[1], {}); return P(ctx, 1200); }]]);
reg('sk-swap', LIVE + 'swapPositions', [['A', 'Curved arrows cross, ghosts slide over', ctx=>{ ctx.sound('shift'); return X().swapArcs(foe(ctx)[0], foe(ctx)[2]); }], ['B', 'Old: "🔀 Scurry!" floats', ctx=>{ ctx.float(foe(ctx)[0], '🔀 Scurry!', ''); ctx.float(foe(ctx)[2], '🔀 Scurry!', ''); return P(ctx, 900); }]]);
reg('sk-converge', LIVE + 'converge', [['A', 'A magnet pulls the line in: field lines, specks', ctx=>{ ctx.sound('shift'); ctx.float(foe(ctx)[1], '🧲 Converge!', 'quick'); return X().magnetPull(foe(ctx)); }], ['B', 'Old: "🧲 Converge!"', ctx=>{ ctx.float(foe(ctx)[1], '🧲 Converge!', 'quick'); return P(ctx, 900); }]]);
reg('sk-restless', LIVE + 'restless', [['A', 'Footprints step to its new place', ctx=> X().footsteps(mine(ctx)[1], {to:mine(ctx)[2]})], ['B', 'Old: "👣"', ctx=>{ ctx.float(mine(ctx)[1], '👣', 'quick'); return P(ctx, 900); }]]);
reg('sk-stun-player', LIVE + 'stunPlayer (Low effects and up)', [['A', 'A bell tolls, their side greys, chains rattle', ctx=>{ ctx.sound('stunTone'); return X().bellToll(W(ctx).castleFoe, {area:W(ctx).rowFoe}); }]], 'The whole skipped turn used to have no on-screen cue.');
reg('sk-exile-board', LIVE + 'statusFx exile (Low effects and up)', [['A', 'A violet rift pulls it in; a candle echo stays', ctx=>{ ctx.sound('exile'); return X().violetRift(foe(ctx)[1], {restore:true}); }]]);
reg('sk-exile-zone', LIVE + 'exile {zone: hand | graveyard}', [['A', 'From the graveyard: a ghost card unravels into violet smoke', ctx=>{ ctx.sound('exile'); const gy = W(ctx).app.querySelector('.graveyard-pile') || W(ctx).castleMine; return X().exileWisp(gy); }],
  ['B', 'A Prayer from the hand (gold motes too)', ctx=>{ ctx.sound('exile'); const h = W(ctx).app.querySelector('#handStrip') || W(ctx).castleMine; return X().exileWisp(h, {prayer:true}); }]]);
reg('sk-remember', LIVE + 'remember {uid}', [['A', 'A candle, rising smoke, the card condenses out of it', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🕯️ +2/+2', 'gold'); return X().candleRise(el); }], ['B', 'Old: "🕯️ +N/+N"', ctx=>{ ctx.float(mine(ctx)[1], '🕯️ +2/+2', 'gold'); return P(ctx, 900); }]]);
reg('sk-spell-card', LIVE + 'spell {action, targets}', [['A', 'Hasten: the card flies from the hand, flips, motes to each target', ctx=>{ ctx.sound('trigger'); const h = W(ctx).app.querySelector('#handStrip'); X().spellCast(h, mine(ctx)); return ctx.wait(700).then(()=>{ mine(ctx).forEach(t=> ctx.float(t, '−1 ⏳', 'heal')); return P(ctx, 700); }); }],
  ['B', 'Sap (violet)', ctx=>{ const h = W(ctx).app.querySelector('#handStrip'); X().spellCast(h, foe(ctx), {c1:'#f0e0ff', c2:'#a46bff'}); return ctx.wait(700).then(()=>{ foe(ctx).forEach(t=> ctx.float(t, '−1 ⚔', 'debuff')); return P(ctx, 700); }); }],
  ['C', 'Old: a toast and floats', ctx=>{ ctx.sound('trigger'); mine(ctx).forEach((t, i)=> setTimeout(()=> ctx.float(t, '−1 ⏳', 'heal'), i*90)); return P(ctx, 1100); }]]);
reg('sk-devour', LIVE + 'devour (at play)', [['A', 'Jaws snap shut over the card, a gulp', ctx=>{ const el = mine(ctx)[1]; ctx.sound('coin'); ctx.wait(400).then(()=> ctx.float(el, '🫦 +2/+2', 'gold')); return X().devourJaws(el); }], ['B', 'Old: the float only', ctx=>{ ctx.float(mine(ctx)[1], '🫦 +2/+2', 'gold'); return P(ctx, 900); }]]);
reg('sk-equip', LIVE + 'equip (at play)', [['A', 'The item flies on and locks with a clank', ctx=>{ const el = mine(ctx)[1]; ctx.wait(330).then(()=>{ ctx.sound('clang'); ctx.float(el, '+2/+0', 'gold'); }); return X().equipClank(el, {glyph:'🗡️'}); }]]);
reg('sk-sacrifice', LIVE + 'sacrifice (at play)', [['A', 'A red sigil burns in, the offering sinks into it', ctx=>{ const el = mine(ctx)[2]; ctx.float(el, '🦷 Sacrifice', 'debuff'); return X().ritualSigil(el, {sink:true}); }], ['B', 'Old: .sac-chomp jaws', ctx=>{ const el = mine(ctx)[2]; ctx.float(el, '🦷 Sacrifice', 'debuff'); cls(el, 'sac-chomp', 700); return P(ctx, 1000); }]]);
reg('sk-fast-forward', 'fastForward → .ff-blur', [['A', 'Now: a blur of afterimages, "⏩ ×N"', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '⏩ ×2', 'quick'); cls(el, 'ff-blur', 800); ctx.sound('swipeTone'); return P(ctx, 1100); }]]);
reg('sk-satiety', LIVE + 'statusFx satiety', [['A', 'A honey pot pops up, a warm contented glow', ctx=> X().satietyFull(mine(ctx)[1])]]);
reg('sk-shed', LIVE + 'statusFx shed {molt}', [['A', 'A translucent skin peels off and drifts away', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🐍 +1/+1', 'heal'); return X().skinShed(el, {molt:true}); }], ['B', 'Old: "🐍 +1/+1"', ctx=>{ ctx.float(mine(ctx)[1], '🐍 +1/+1', 'heal'); return P(ctx, 900); }]]);
reg('sk-first-blood', LIVE + 'statusFx firstBlood', [['A', 'A red splash star, drops, a "1st" tag', ctx=>{ const el = foe(ctx)[1]; ctx.float(el, '🩸 First blood +2', 'debuff'); return X().firstBloodSplash(el); }], ['B', 'Old: "🩸 First blood +N"', ctx=>{ ctx.float(foe(ctx)[1], '🩸 First blood +2', 'debuff'); return P(ctx, 900); }]]);
reg('sk-bludgeon', LIVE + 'statusFx bludgeon {broke}', [['A', 'A hammer slams; the trait icon cracks in two', ctx=>{ const el = foe(ctx)[0]; ctx.float(el, '🔨 Armor broken', 'debuff'); return X().bludgeonBreak(el, {broke:'armor'}); }],
  ['B', 'Flying broken', ctx=> X().bludgeonBreak(foe(ctx)[2], {broke:'flying'})], ['C', 'Old: "🔨 X broken"', ctx=>{ ctx.float(foe(ctx)[0], '🔨 Armor broken', 'debuff'); return P(ctx, 900); }]]);
reg('sk-immolation-src', 'fieldTick immolation → SkillFX.immolate on the source (once a round) + SkillFX.scorchMark on the burned units', [['A', '2026-10-16: the fire stays on the immolating card (inside its tile); the units it burns char', ctx=>{ const s = mine(ctx)[1]; S().immolate(s); [mine(ctx)[0], mine(ctx)[2], foe(ctx)[1]].forEach(el=> el && S().scorchMark(el)); return P(ctx, 1900); }],
  ['B', 'Old: the source pulses, every victim gets its own flames (SkillFX.scorch)', ctx=>{ cls(mine(ctx)[1], 'immolate-pulse', 900); foe(ctx).forEach(el=> S().scorch(el, {})); return P(ctx, 1400); }]]);
reg('sk-irradiated-src', LIVE + 'fieldTick irradiated (srcUid, once a round)', [['A', 'Sickly green rings, a spinning ☢, geiger flicker', ctx=>{ ctx.sound('geiger', 3); return X().radPulse(foe(ctx)[1]); }], ['B', 'Old: .irradiate-pulse', ctx=>{ cls(foe(ctx)[1], 'irradiate-pulse', 900); return P(ctx, 1000); }]]);
reg('sk-wither', 'fifthPassVfx → witherSmokeVfx', [['A', 'Now: black smoke and a skull', ctx=>{ const el = foe(ctx)[1], r = el.getBoundingClientRect(); ctx.float(el, '💀 Wither', 'debuff');
  for(let i = 0; i < 5; i++){ const p = document.createElement('div'); p.className = 'wither-smoke' + (i === 0 ? ' skull' : ''); p.textContent = i === 0 ? '💀' : ''; Object.assign(p.style, {left:(r.left + r.width*(.25 + Math.random()*.5)) + 'px', top:(r.top + r.height*.6) + 'px'}); document.body.appendChild(p);
    g().fromTo(p, {y:0, opacity:.85, scale:.6}, {y:-40 - Math.random()*30, opacity:0, scale:1.4, duration:1, delay:i*.08, onComplete:()=> p.remove()}); } return P(ctx, 1400); }]]);
reg('sk-ichor', 'eighthPassVfx → SkillFX.acidCorrode', [['A', 'Now: golden acid corrodes', ctx=>{ S().acidCorrode(mine(ctx)[1]); ctx.float(mine(ctx)[1], '🧪 −1', 'debuff'); return P(ctx, 1200); }]]);
reg('sk-frostbite', 'labSkillFx → SkillFX.frostChill', [['A', 'Now: mist and flakes, then frost', ctx=>{ S().frostChill(mine(ctx)[1]); ctx.float(mine(ctx)[1], '🥶 Frostbite +1/+1', 'buff'); return P(ctx, 1500); }]]);
reg('sk-keen-eye-unmask', LIVE + 'a Keen Eye unit arrives while enemy Changelings are on the board', [['A', 'An eye opens, a beam sweeps, the disguise peels', ctx=> X().keenReveal(mine(ctx)[1], [foe(ctx)[0], foe(ctx)[2]])]]);
reg('sk-changeling-unmask', 'unmaskChangeling → .changeling-unmask', [['A', 'Now: the mirage clears', ctx=>{ cls(tileOf(foe(ctx)[1]), 'changeling-unmask', 900); return P(ctx, 1200); }]]);
reg('sk-desecrate', LIVE + 'curse {cell} (Low effects and up)', [['A', 'A black sigil burns into the felt under the slot', ctx=> X().cursedSigil(foe(ctx)[1])]]);
reg('sk-curse-tick', 'eighthPassVfx → SkillFX.curseDrain', [['A', 'Now: the cursed ground drains it', ctx=>{ S().curseDrain(foe(ctx)[1]); ctx.float(foe(ctx)[1], '🜏-1', 'dmg'); return P(ctx, 1200); }]]);
reg('sk-conditional-stats', LIVE + 'statusFx phaseGrow/phaseFade on a unit with a condition skill', [['A', 'Loyal: 💛 circles in gold', ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '+1/+1', 'buff'); return X().condAura(el, {kind:'loyal'}); }],
  ['B', 'Kinship 🤝, Lone Wolf 🐺, Usurper 👑', ctx=>{ X().condAura(mine(ctx)[0], {kind:'kinship'}); X().condAura(mine(ctx)[1], {kind:'loneWolf'}); return X().condAura(mine(ctx)[2], {kind:'usurper'}); }],
  ['C', 'The condition lapses: the glyph greys and drops', ctx=> X().condAura(mine(ctx)[1], {kind:'sociable', grow:false})]]);
reg('sk-dry-spared', LIVE + 'the first Scorching (fieldTick heatwave) tick of a round: every Dry / heat-resistant unit', [['A', 'Heat ripples bend round it, a cool glint, "Dry"', ctx=>{ S().scorch(foe(ctx)[0], {}); return X().heatBend(foe(ctx)[1]); }]]);
reg('sk-demolisher', LIVE + 'hit by a Demolisher on a Structure', [['A', 'Hammer-crack and bricks knocked out', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 6); X().demolishCrack(t); }).then(()=> P(ctx, 1000))]]);
reg('sk-supreme-strike', LIVE + 'hit by a Supreme unit (once a round per target)', [['A', 'Prismatic sparkle shards, armour shattering', ctx=> melee(ctx, (a, t)=>{ flashDmg(ctx, t, 12); X().supremeSparkle(t); }).then(()=> P(ctx, 1000))]]);
reg('sk-armor-shred', 'eighthPassVfx → SkillFX.armorBlock {shatter}', [['A', 'Now: the plate shatters', ctx=>{ ctx.sound('rendTone'); S().armorBlock(foe(ctx)[1], {shatter:true, partial:true}); ctx.float(foe(ctx)[1], '−1🛡 for good', 'debuff'); return P(ctx, 1200); }]]);
reg('sk-prayer', 'eighthPassVfx → SkillFX.prayerLight', [['A', 'Now: a soft gold beam and a dove', ctx=>{ S().prayerLight(mine(ctx)[1]); return P(ctx, 1600); }]]);
reg('sk-rainrunner', LIVE + 'hitHQ by a Rainrunner while it rains', [['A', 'It skims the puddles straight to the castle', ctx=>{ const c = W(ctx).castleFoe; return X().puddleSkim(mine(ctx)[2], c).then(()=>{ ctx.float(c, '-3', 'hq-big'); return P(ctx, 400); }); }]]);
})();
