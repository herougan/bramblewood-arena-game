// Batch B lab registrations (2026-10-15): status (part), field, weather-time, darkness-light. All 139 batch-B inventory ids.
// One FXLAB.register per inventory id; play(ctx) calls the batch's game function FX.B.* on the stage. Entries the game already
// does well ("good") get a demo of the live look: the game's own function when the lab has it, else the same game CSS classes
// and SkillFX calls the game uses (marked "live look"). Improved "basic"/"broken" entries keep the old look as a variant.
// Contract and checklist: docs/effects-lab-contract.md. The effect code lives in bramblewood-fx-b.js (the game loads it too).
(function(){
// 2026-10-15: the lab's copy of floatText reads arena_app.js's `floatDetachDepth` (a top-level let the lab doesn't carry), so
// every ctx.float threw and was swallowed: no damage numbers anywhere in the catalogue. 0 = float in place, as in a fight.
try{ if(typeof floatDetachDepth === 'undefined') window.floatDetachDepth = 0; }catch(e){}
const R = FXLAB.register, X = ()=> window.FX.B, S = ()=> window.SkillFX || {};
const until = (ctx, ms, start)=> new Promise(res=>{ let done = false; const fin = ()=>{ if(!done){ done = true; res(); } }; start(fin); ctx.wait(ms).then(fin); });
const fn = n=> (typeof window[n] === 'function' ? window[n] : null);
const tile = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
// Restartable game-CSS class pulse on an element.
const pulse = (el, cls, ms)=>{ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=> el.classList.remove(cls), ms || 900); };
const shake = (ctx, el)=>{ if(el && ctx.gsap) ctx.gsap.timeline().to(el, {x:-6, duration:.05}).to(el, {x:6, duration:.08}).to(el, {x:-3, duration:.06}).to(el, {x:0, duration:.05, clearProps:'x'}); };
const fl = (ctx, el, t, c)=> ctx.float(el, t, c);
// The board's darkness, as the game draws it (syncDarkVeil): the .dark-veil first in #battlefieldEl.
const veil = (ctx, lvl)=>{ const bf = ctx.board.el; let v = bf.querySelector(':scope > .dark-veil'); if(!v){ v = document.createElement('div'); v.setAttribute('aria-hidden', 'true'); bf.insertBefore(v, bf.firstChild); } v.className = 'dark-veil lvl-' + lvl; return v; };
const skyTone = (ctx, tone)=>{ const bf = ctx.board.el; let s = bf.querySelector(':scope > .sky-fx'); if(!s){ s = document.createElement('div'); s.setAttribute('aria-hidden', 'true'); bf.insertBefore(s, bf.firstChild); } s.className = 'sky-fx tone-' + tone; return s; };
const allCards = ctx=> ctx.board.mine.concat(ctx.board.foe);
// The game's night veil (syncNightVeil): slides on from the right, off to the left.
const nightVeil = (ctx, on)=>{ const bf = ctx.board.el; let v = bf.querySelector(':scope > .night-veil'); if(!v){ v = document.createElement('div'); v.className = 'night-veil'; v.setAttribute('aria-hidden', 'true'); bf.insertBefore(v, bf.firstChild); void v.offsetWidth; }
  if(on){ v.classList.remove('is-leaving'); v.classList.add('is-on'); } else if(v.classList.contains('is-on')) v.classList.add('is-leaving'); return v; };
// tideWaveVfx (arena_app.js), as a stand-in when the lab doesn't carry the function.
const tideWave = (ctx, kind)=>{ const f = fn('tideWaveVfx'); if(f) return f(kind); const bf = ctx.board.el; if(kind === 'high') kind = 'flow';
  bf.classList.toggle('tide-is-flow', kind === 'flow'); bf.classList.toggle('tide-is-ebb', kind === 'ebb');
  if(!bf.querySelector(':scope > .tide-line')){ const l = document.createElement('div'); l.className = 'tide-line'; bf.appendChild(l); }
  const w = document.createElement('div'); w.className = 'tide-wave is-' + kind; w.innerHTML = '<span></span><span></span>'; bf.appendChild(w); setTimeout(()=> w.remove(), 1500);
  ctx.sound(kind === 'flow' ? 'splash' : 'swipeTone'); };
// coldWaveVfx + icePulseVfx (the Frigid round start), same classes.
const coldWave = (ctx, card)=>{ const bf = ctx.board.el; const w = document.createElement('div'); w.className = 'cold-wave frost-lv1'; bf.appendChild(w); setTimeout(()=> w.remove(), 900); ctx.sound('swipeTone');
  if(card){ setTimeout(()=>{ fl(ctx, card, '❄ +1 Wait', 'debuff'); const p = document.createElement('span'); p.className = 'ice-pulse'; tile(card).appendChild(p); setTimeout(()=> p.remove(), 900); if(S().frostChill) S().frostChill(card); }, 480); } };
// eruptionGeyserVfx (the volcano's and the spout's column), same markup.
const geyser = (el, water)=>{ const f = fn('eruptionGeyserVfx'); if(f) return f(el, water); const r = el.getBoundingClientRect(), g = document.createElement('div');
  g.className = 'lava-geyser' + (water ? ' is-water' : ''); g.style.left = (r.left + r.width/2) + 'px'; g.style.top = (r.bottom - 6) + 'px'; g.style.setProperty('--h', Math.round(r.height*1.25) + 'px');
  g.innerHTML = '<i class="lg-col"></i>' + Array.from({length:12}, (_, k)=> `<b style="--x:${Math.round((Math.random() - .5)*r.width*1.2)}px; --y:${-Math.round(r.height*(.6 + Math.random()*.8))}px; --d:${(k*.04).toFixed(2)}s"></b>`).join('');
  document.body.appendChild(g); setTimeout(()=> g.remove(), 1300); };
// witherSmokeVfx, same markup.
const wither = el=>{ const f = fn('witherSmokeVfx'); if(f) return f(el); const r = el.getBoundingClientRect(), g = window.gsap;
  for(let i = 0; i < 5; i++){ const p = document.createElement('div'); p.className = 'wither-smoke' + (i === 0 ? ' skull' : ''); p.textContent = i === 0 ? '💀' : ''; Object.assign(p.style, {left:(r.left + r.width*(.25 + Math.random()*.5)) + 'px', top:(r.top + r.height*.6) + 'px'}); document.body.appendChild(p);
    g.fromTo(p, {y:0, opacity:.85, scale:.6}, {y:-40 - Math.random()*30, x:(Math.random()*2 - 1)*14, opacity:0, scale:1.4, duration:.9 + Math.random()*.4, delay:i*.08, ease:'power1.out', onComplete:()=> p.remove()}); } };
// poisonBubbleBurstVfx, same markup.
const bubbles = el=>{ const f = fn('poisonBubbleBurstVfx'); const g = window.gsap; for(let i = 0; i < 5; i++){ const b = document.createElement('div'); b.className = 'poison-bubble'; b.textContent = '🫧'; b.style.left = (20 + Math.random()*60) + '%'; b.style.fontSize = (10 + Math.random()*8) + 'px'; el.appendChild(b);
  g.set(b, {top:'70%', opacity:0, scale:.5}); g.timeline({delay:Math.random()*.18, onComplete:()=> b.remove()}).to(b, {opacity:.9, scale:1, y:-16, duration:.22}).to(b, {opacity:.7, y:-44, x:Math.random()*30 - 15, duration:.5}).to(b, {opacity:0, y:-56, duration:.28}); } };
const shader = (ctx, kind)=>{ try{ const B = window.BramblewoodShaders; if(B && B.isSupported()) return B.mount(ctx.board.el, {preset:'map', kind, felt:1, prepend:true, intensity:1}); }catch(e){} return null; };
const old = 'Now in the game (before this pass)';

/* ================================ STATUSES ================================ */
R({id:'st-poison-apply', stage:'board', inGameHook:'onEvent: statusFx poison', variants:[
  {key:'A', label:'Glop splats on, ooze rises, bubbles pop', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('poisonApply'); return X().poisonApply(t, {onImpact:()=> fl(ctx, t, '+3☠', 'poison')}); }},
  {key:'B', label:old + ': the number only', play:ctx=>{ ctx.sound('poisonApply'); fl(ctx, ctx.board.foe[1], '+3☠', 'poison'); return ctx.wait(1000); }}]});
R({id:'st-poison-tick', stage:'board', variants:[{key:'A', label:'Shake, green tint, bubbles and a cloud (live look)', play:ctx=>{ const t = ctx.board.foe[0]; ctx.sound('bubble'); shake(ctx, t); pulse(t, 'poison-tint-pulse', 460); bubbles(t);
  if(S().poisonCloud) S().poisonCloud(t); fl(ctx, t, '☠️ -2', 'poison-tick'); return ctx.wait(1400); }}]});
R({id:'st-bleed-apply', stage:'board', inGameHook:'onEvent: statusFx bleed', variants:[
  {key:'A', label:'A gash opens, drops fall from it', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('bleedApply'); return X().bleedApply(t, {onImpact:()=> fl(ctx, t, '+2🩸', 'bleed')}); }},
  {key:'B', label:old + ': the number only', play:ctx=>{ ctx.sound('bleedApply'); fl(ctx, ctx.board.foe[2], '+2🩸', 'bleed'); return ctx.wait(1000); }}]});
R({id:'st-bleed-tick', stage:'board', variants:[{key:'A', label:'Shake, red tint and a drip (live look)', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('bleedTick'); shake(ctx, t); pulse(t, 'bleed-tint-pulse', 460); if(S().bleedDrip) S().bleedDrip(t); fl(ctx, t, '🩸 -2', 'bleed'); return ctx.wait(1300); }}]});
R({id:'st-decay-apply', stage:'board', inGameHook:'onEvent: hit by a unit with Decay (the engine has no event; inferred from the attacker\'s Decay skill)', variants:[
  {key:'A', label:'Grey-violet mould creeps in from the corners', play:ctx=>{ const t = ctx.board.foe[0]; ctx.sound('curse'); return X().decayApply(t, {onImpact:()=> fl(ctx, t, '+1🦠', 'debuff')}); }}]});
R({id:'st-decay-tick', stage:'board', inGameHook:'onEvent: decayTick', variants:[
  {key:'A', label:'Mould flares, spores burst, a grey sword crumbles', play:ctx=>{ const t = ctx.board.foe[0]; ctx.sound('bubble'); return X().decayTick(t, {onImpact:()=> fl(ctx, t, '🦠 2! (−1⚔)', 'dmg')}); }},
  {key:'B', label:old + ': shake and the bleed tint', play:ctx=>{ const t = ctx.board.foe[0]; shake(ctx, t); pulse(t, 'bleed-tint-pulse', 460); fl(ctx, t, '🦠 2! (−1⚔)', 'dmg'); return ctx.wait(1000); }}]});
R({id:'st-freeze-apply', stage:'board', variants:[{key:'B', label:'With the float and chime, as in a fight', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('freezeChime'); if(S().freezeEncase) S().freezeEncase(t); shake(ctx, t); fl(ctx, t, '❄ Frozen', 'debuff'); return ctx.wait(1700); }}]});
R({id:'st-freeze-tick', stage:'board', inGameHook:'onEvent: statusFx thaw (every counter; left 0 = the last)', note:'A and B are the same effect at a counter melting and at the last counter.', variants:[
  {key:'A', label:'A counter melts: chips break off, water drips', play:ctx=>{ const t = ctx.board.foe[1]; if(S().freezeEncase) S().freezeEncase(t); return ctx.wait(900).then(()=> X().thawDrip(t, {left:1, onImpact:()=> fl(ctx, t, '❄ 1 left', 'debuff')})); }},
  {key:'B', label:'The last counter: the crust breaks away in steam', play:ctx=>{ const t = ctx.board.foe[1]; return X().thawDrip(t, {left:0, onImpact:()=>{ ctx.sound('shatter'); fl(ctx, t, '❄ Thawed', 'heal'); }}); }},
  {key:'C', label:old + ': "❄ Thawed" at 0 only', play:ctx=>{ fl(ctx, ctx.board.foe[1], '❄ Thawed', 'heal'); return ctx.wait(1000); }}]});
R({id:'st-freeze-field', stage:'board', variants:[{key:'A', label:'Cold wave, ice pulse and chill (live look)', play:ctx=>{ coldWave(ctx, ctx.board.mine[1]); return ctx.wait(1700); }}]});
R({id:'st-sleep-apply', stage:'board', variants:[{key:'B', label:'With the float, as in a fight', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('sleepTone'); if(S().sleepZzz) S().sleepZzz(t); fl(ctx, t, '💤 Asleep', 'debuff'); return ctx.wait(1800); }}]});
R({id:'st-paralyze-apply', stage:'board', variants:[{key:'A', label:'Yellow sparks crackle (live look)', play:ctx=>{ const t = ctx.board.foe[0]; ctx.sound('paralyzeTone'); if(S().paralyzeSpark) S().paralyzeSpark(t); shake(ctx, t); fl(ctx, t, '⚡ Paralyzed', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-stun-apply', stage:'board', variants:[{key:'B', label:'With the shake and float, as in a fight', play:ctx=>{ const t = ctx.board.foe[0]; ctx.sound('stunTone'); if(S().stunStars) S().stunStars(t); shake(ctx, t); fl(ctx, t, '💫 Stunned!', 'debuff'); return ctx.wait(1600); }}]});
R({id:'st-stagger-apply', stage:'board', variants:[{key:'A', label:'✦ stars wheel round (live look)', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('stunTone'); if(S().stunStars) S().stunStars(t, {glyph:'✦'}); fl(ctx, t, '💢 Staggered', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-stagger-weak-hit', stage:'board', inGameHook:'onEvent: hit by a Staggered attacker (replayCards.staggered)', variants:[
  {key:'A', label:'Dull dusty thump, attacker wobbles, "½ hit" chip', play:ctx=>{ const a = ctx.board.mine[1], t = ctx.board.foe[1]; ctx.sound('hitAt', 1, false); fl(ctx, t, '-1'); return X().staggerWeakHit(t, {att:a}); }}]});
R({id:'st-blind-apply', stage:'board', inGameHook:'eighthPassVfx statusFx blind (ink); then onEvent statusFx blind → FX.B.sightSync puts the lasting ink-eye badge on while Blind lasts', note:'A is what a fight shows now: the ink lands, then the card keeps a dim tint and an inked-eye badge until Blind wears off.', variants:[
  {key:'A', label:'Ink splat, then the lasting inked-eye badge', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('blindTone'); if(S().blindInk) S().blindInk(t); fl(ctx, t, '👁 Blinded', 'debuff');
    return ctx.wait(700).then(()=>{ t.classList.add('is-blind'); X().markSight(t, 'blind'); return ctx.wait(1600); }); }},
  {key:'B', label:'Ink splat, then a blindfold while it lasts', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('blindTone'); if(S().blindInk) S().blindInk(t); fl(ctx, t, '👁 Blinded', 'debuff');
    return ctx.wait(700).then(()=>{ t.classList.add('is-blind'); X().markSight(t, 'blind', {look:'B'}); return ctx.wait(1600); }); }},
  {key:'C', label:old + ': the ink splat only', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('blindTone'); if(S().blindInk) S().blindInk(t); fl(ctx, t, '👁 Blinded', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-blind-keen-sense', stage:'board', inGameHook:'onEvent: a Blind-on-hit attacker hits a Keen Sense unit (once a round)', variants:[
  {key:'A', label:'Ink bounces off, whisker ripples spread', play:ctx=> X().keenSense(ctx.board.foe[1], {ink:true})}]});
R({id:'st-tipsy-apply', stage:'board', variants:[{key:'A', label:'🫧 bubbles wheel round (live look)', play:ctx=>{ const t = ctx.board.foe[0]; if(S().stunStars) S().stunStars(t, {glyph:'🫧'}); fl(ctx, t, '🍺 Tipsy', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-confuse-apply', stage:'board', variants:[{key:'A', label:'❓ marks wheel round (live look)', play:ctx=>{ const t = ctx.board.foe[0]; if(S().stunStars) S().stunStars(t, {glyph:'❓'}); fl(ctx, t, '❓ Confused', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-shock-apply', stage:'board', variants:[{key:'A', label:'Glitch flicker (live look)', play:ctx=>{ const t = ctx.board.foe[1]; const g = fn('glitchVfx'); if(g) g(t); shake(ctx, t); ctx.sound('shockZap'); fl(ctx, t, '🌩 Shocked', 'debuff'); return ctx.wait(1300); }}]});
R({id:'st-shock-bonus-dmg', stage:'board', inGameHook:'onEvent: hit on a Shocked target (replayCards.shocked), at impact', variants:[
  {key:'A', label:'Arcs jump on impact, "+50%" chip', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('hitAt', 6, false); fl(ctx, t, '-6'); return X().shockSpark(t); }}]});
R({id:'st-corrode-apply', stage:'board', variants:[{key:'A', label:'Acid fizz (live look)', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('corrodeTone'); if(S().acidCorrode) S().acidCorrode(t); fl(ctx, t, '-1⚔ 🧪', 'debuff'); return ctx.wait(1500); }}]});
R({id:'st-expose-apply', stage:'board', variants:[{key:'A', label:'Red crosshair (live look)', play:ctx=>{ const t = ctx.board.foe[1]; if(S().targetMark) S().targetMark(t); fl(ctx, t, '🎯 Exposed', 'debuff'); return ctx.wait(1400); }}]});
R({id:'st-expose-bonus-hit', stage:'board', inGameHook:'onEvent: the next hit on a unit after statusFx expose', variants:[
  {key:'A', label:'Crosshair snaps shut and shatters', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('hitAt', 5, false); return X().exposeCash(t, {amount:2, onImpact:()=> fl(ctx, t, '-5')}); }}]});
R({id:'st-daunt-apply', stage:'board', variants:[{key:'A', label:'Cold purple shiver (live look)', play:ctx=>{ const t = ctx.board.foe[0]; if(S().fearShiver) S().fearShiver(t); fl(ctx, t, '😨 −2⚔', 'debuff'); return ctx.wait(1400); }}]});
R({id:'st-wither-apply', stage:'board', variants:[{key:'A', label:'Black smoke rolls up (live look)', play:ctx=>{ const t = ctx.board.foe[2]; wither(t); fl(ctx, t, '💀 Wither', 'debuff'); return ctx.wait(1400); }}]});
R({id:'st-wither-tick', stage:'board', variants:[{key:'A', label:'Black smoke, max Health drops (live look)', play:ctx=>{ const t = ctx.board.foe[2]; wither(t); fl(ctx, t, '💀 −1', 'debuff'); return ctx.wait(1400); }}]});
R({id:'st-irradiation-apply', stage:'board', inGameHook:'onEvent: fieldTick irradiated (source → unit)', variants:[
  {key:'A', label:'Green hex tokens arc in from the source and stick', play:ctx=>{ const t = ctx.board.foe[1], s = ctx.board.mine[1]; ctx.sound('geiger', 3); return X().irradiate(t, {src:s, tokens:3, onImpact:()=> fl(ctx, t, '☢️ +3', 'debuff')}); }},
  {key:'B', label:old + ': the float and a pulse', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('geiger', 3); fl(ctx, t, '☢️ +3', 'debuff'); pulse(t, 'irradiate-pulse', 900); return ctx.wait(1100); }}]});
R({id:'st-irradiation-tick', stage:'board', inGameHook:'onEvent: irradiation {points}', variants:[
  {key:'A', label:'Each lost stat glows green and dissolves into pixels', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('radSizzle', 3); pulse(t, 'irradiate-pulse', 900); return X().radDecay(t, {points:[{kind:'hp'}, {kind:'atk'}, {kind:'skill'}]}); }},
  {key:'B', label:old + ': "−skill" as a word', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('radSizzle', 3); pulse(t, 'irradiate-pulse', 900); fl(ctx, t, '☢️ −1❤ −1⚔ −1 skill', 'debuff'); return ctx.wait(1200); }}]});
R({id:'st-smoke-apply', stage:'board', variants:[{key:'A', label:'Smoke bomb on an ally (live look)', play:ctx=> until(ctx, 2200, fin=>{ const m = ctx.board.mine; if(!S().smokeBomb) return fin(); S().smokeBomb(m[0], m[2], {onImpact:()=>{ fl(ctx, m[2], '🌫️ Smoke', 'buff'); ctx.wait(900).then(fin); }}); })}]});
R({id:'st-scar-apply', stage:'board', variants:[{key:'A', label:'Claw marks (live look)', play:ctx=>{ const t = ctx.board.foe[0]; if(S().scarMark) S().scarMark(t, {fromLeft:true}); fl(ctx, t, '+1🗡', 'debuff'); return ctx.wait(1300); }}]});
R({id:'st-chain-break', stage:'board', variants:[{key:'A', label:'The chain snaps and falls (live look)', play:ctx=>{ const t = ctx.board.foe[1]; t.classList.add('is-chained'); const c = document.createElement('div'); c.className = 'chain-overlay'; c.textContent = '⛓️';
  c.style.cssText = 'position:absolute; left:34%; top:30%; z-index:9; font-size:30px;'; tile(t).appendChild(c);
  return ctx.wait(700).then(()=>{ ctx.sound('chainBreak'); c.classList.add('chain-breaking'); fl(ctx, t, '⛓ Chain broken!', 'buff'); setTimeout(()=>{ c.remove(); t.classList.remove('is-chained'); }, 520); return ctx.wait(1000); }); }}]});
R({id:'st-petrified-apply', stage:'board', inGameHook:'onEvent: fieldTick petrify', variants:[
  {key:'A', label:'Stone creeps up from the foot and cracks', play:ctx=>{ const t = ctx.board.foe[0]; return X().petrify(t, {onImpact:()=>{ ctx.sound('thud'); t.classList.add('is-petrified'); fl(ctx, t, '🪨 Stone', 'debuff'); }}); }},
  {key:'B', label:old + ': instant grey', play:ctx=>{ const t = ctx.board.foe[0]; t.classList.add('is-petrified'); ctx.sound('thud'); fl(ctx, t, '🪨 Stone', 'debuff'); return ctx.wait(1100); }}]});
R({id:'st-coffee-crash', stage:'board', variants:[{key:'A', label:'Dims and dozes (live look)', play:ctx=>{ const t = ctx.board.mine[2]; if(S().sleepZzz) S().sleepZzz(t); fl(ctx, t, '😴 Crash', 'debuff'); return ctx.wait(1700); }}]});
R({id:'st-chilli-burn', stage:'board', variants:[{key:'A', label:'Chilli sting (live look)', play:ctx=>{ const t = ctx.board.mine[0]; if(S().chilliHeat) S().chilliHeat(t, {burn:true}); fl(ctx, t, '🌶️ −1', 'dmg'); return ctx.wait(1400); }}]});
R({id:'st-inspired-spent', stage:'board', inGameHook:'onEvent: the next hit by a unit after statusFx inspired', variants:[
  {key:'A', label:'The gold flares and streaks into the swing', play:ctx=>{ ctx.sound('rallyHorn'); return X().inspiredSpend(ctx.board.mine[1]); }}]});
R({id:'st-cage-broken', stage:'board', inGameHook:'onEvent: cageBroken', variants:[
  {key:'A', label:'Bars burst outward, the padlock springs open', play:ctx=>{ const t = ctx.board.mine[1]; return X().cageBurst(t, {onImpact:()=>{ ctx.sound('unlock'); fl(ctx, t, '🔓 Free!', 'buff'); }}); }},
  {key:'B', label:old + ': a toast', play:ctx=>{ ctx.sound('unlock'); if(fn('showToast')) fn('showToast')('🔓 Your leader is free!', 'ok'); else fl(ctx, ctx.board.mine[1], '🔓 Your leader is free!', 'buff'); return ctx.wait(1500); }}]});
R({id:'st-ward-crush', stage:'board', inGameHook:'onEvent: hit by a Supreme attacker on an armoured / shelled / stone / shielded target', variants:[
  {key:'A', label:'A hex ward cracks with prismatic light and shatters', play:ctx=>{ const t = ctx.board.foe[1]; ctx.sound('shatter'); return X().wardCrush(t, {onImpact:()=> fl(ctx, t, '-9', 'crit')}); }}]});
const both = (f)=> ctx=>{ const [a, b] = [ctx.board.foe[0], ctx.board.foe[2]]; fl(ctx, a, '-1'); fl(ctx, b, '-8'); f(a, {kind:'resist'}); return f(b, {kind:'weak'}).then(()=> ctx.wait(200)); };
R({id:'st-resist-weak-hit', stage:'board', inGameHook:'onEvent: hit whose target resists or is weak to it (worked out from the card defs, like resistFactor)', note:'Left foe resisted a hit, right foe was weak to it. A is wired in the game.', variants:[
  {key:'A', label:'A chip beside the number', play:both((e, o)=> X().resistHit(e, o))},
  {key:'B', label:'A stamp on the card: glancing dome / red cracks', play:both((e, o)=> X().resistHit_B(e, o))},
  {key:'C', label:'A "½" / "×2" badge pops from the corner', play:both((e, o)=> X().resistHit_C(e, o))}]});
R({id:'st-burn-d65', stage:'board', inGameHook:'future', note:'Planned D65: 1 heat hit in 3 leaves Burn 1.', variants:[{key:'A', label:'Embers cling to the foot, the edge chars', play:ctx=> X().burnApply(ctx.board.foe[1])}]});
R({id:'st-chill-d65', stage:'board', inGameHook:'future', note:'Planned D65: 1 cold hit in 3 adds +1 Wait.', variants:[{key:'A', label:'Frost creeps in, the hourglass frosts over', play:ctx=> X().chillApply(ctx.board.foe[1])}]});

/* ============================ DARKNESS & LIGHT ============================ */
const LOOKS = [['A', 'Torches gutter out', 'darkEnter'], ['B', 'A black curtain drops', 'darkEnter_B'], ['C', 'A candle is snuffed, the dark floods out', 'darkEnter_C']];
[['dark-dark-enter', 'dark'], ['dark-pitch-enter', 'pitch'], ['dark-absolute-enter', 'absolute']].forEach(([id, lvl])=> R({id, stage:'board',
  inGameHook:'fxHook(\'matchUI\') once per fight with rules.dark (look A; FX.B.darkLook picks B/C)', note:'Three looks for the lights-out moment; the game\'s lasting .dark-veil fades in underneath. ' + (lvl === 'absolute' ? 'Absolute darkness adds eyes in the dark.' : ''),
  variants:LOOKS.map(([key, label, f])=> ({key, label, play:ctx=>{ const v = veil(ctx, lvl); ctx.sound('nightSwell'); return X()[f](ctx.board.el, {level:lvl, veil:v}).then(()=> ctx.wait(500)); }}))
    .concat([{key:'D', label:old + ': the veil is just there', play:ctx=>{ veil(ctx, lvl); return ctx.wait(1400); }}])}));
[['dark-dark-miss', 'dark'], ['dark-pitch-miss', 'pitch'], ['dark-absolute-miss', 'absolute']].forEach(([id, lvl])=> R({id, stage:'board', inGameHook:'onEvent: blindMiss {night} on a dark field (level from rules.dark)', variants:[
  {key:'A', label:{dark:'A faint whiff into grey and a "?"', pitch:'The swing is swallowed by an inky cloud', absolute:'Black but for its eyes; the swing vanishes into a void'}[lvl], play:ctx=>{ veil(ctx, lvl); const a = ctx.board.mine[1]; ctx.sound('blindTone'); fl(ctx, a, {dark:'🌑 Dark miss', pitch:'⬛ Pitch miss!', absolute:'🕳️ Void miss!'}[lvl], 'debuff'); return X().darkMiss(a, {level:lvl}).then(()=> ctx.wait(200)); }},
  {key:'B', label:old + ': the same "🌙 Miss!" at every level', play:ctx=>{ veil(ctx, lvl); ctx.sound('blindTone'); fl(ctx, ctx.board.mine[1], '🌙 Miss!', 'debuff'); return ctx.wait(1000); }}]}));
R({id:'dark-leave', stage:'board', inGameHook:'fxHook(\'matchUI\') when the fight ends in the dark', variants:[{key:'A', label:'The dark lifts as warm light spills in', play:ctx=> X().darkLeave(ctx.board.el, {level:'pitch'})}]});
const sightDemo = (look)=> ctx=>{ veil(ctx, 'pitch'); const cs = allCards(ctx); cs.forEach((c, i)=> X().markSight(c, i === 1 ? 'eyes' : 'dark', {look})); return ctx.wait(2600); };
R({id:'dark-unit-blind', stage:'board', inGameHook:'fxHook(\'boardRendered\'): FX.B.sightSync marks every unit after each render (look A)', note:'Every unit without Darksight can\'t see (one ally has Darksight: glowing eyes, for contrast). The user asked for this one.', variants:[
  {key:'A', label:'Dimmed art and a closed-eye badge', play:sightDemo('A')},
  {key:'B', label:'A blindfold across the art', play:sightDemo('B')},
  {key:'C', label:'Fog swirling over the art', play:sightDemo('C')}]});
R({id:'dark-sunshy-blind', stage:'board', inGameHook:'fxHook(\'boardRendered\') + phase: Sun-shy units by day', variants:[{key:'A', label:'Sun glare sweeps the art, a squinting badge', play:ctx=>{ skyTone(ctx, 'day'); X().markSight(ctx.board.foe[0], 'sun'); X().markSight(ctx.board.mine[2], 'sun'); return ctx.wait(2600); }}]});
R({id:'dark-nightblind', stage:'board', inGameHook:'fxHook(\'boardRendered\') + phase: Night-blind units at night (no Lantern)', variants:[{key:'A', label:'A moonlit cloud over the eyes, a cloudy-eye badge', play:ctx=>{ nightVeil(ctx, true); skyTone(ctx, 'night'); X().markSight(ctx.board.foe[1], 'night'); X().markSight(ctx.board.mine[0], 'night'); return ctx.wait(2600); }}]});
R({id:'dark-keen-sense', stage:'board', inGameHook:'onEvent: hit by a Keen Sense unit in the dark (once a round)', variants:[{key:'A', label:'Whisker ripples as it smells out the target', play:ctx=>{ veil(ctx, 'dark'); return X().keenSense(ctx.board.mine[0], {label:'👃 Smells it out'}); }}]});
R({id:'dark-lantern-lit', stage:'board', note:'A is the live look. B adds the light radius on a dark board: a warm pool round the carrier, its side lit, the other side blind.', inGameHook:'B: fxHook(\'boardRendered\') (sightSync) in dark fights', variants:[
  {key:'A', label:'Lantern flicker and glow (live look)', play:ctx=>{ const bf = ctx.board.el; bf.classList.add('bf-lantern'); if(S().lanternGlow) S().lanternGlow(ctx.board.mine[1]); return ctx.wait(2000); }},
  {key:'B', label:'Light radius: a warm pool round the carrier', play:ctx=>{ veil(ctx, 'pitch'); const m = ctx.board.mine; X().markSight(m[1], 'lantern'); X().markSight(m[0], 'lit'); X().markSight(m[2], 'lit'); ctx.board.foe.forEach(c=> X().markSight(c, 'dark')); if(S().lanternGlow) S().lanternGlow(m[1]); return ctx.wait(2600); }}]});
R({id:'dark-lantern-out', stage:'board', inGameHook:'onEvent: death of a Lantern unit in the dark or at night', variants:[{key:'A', label:'The lantern gutters, smoke rises, the dark closes in', play:ctx=>{ veil(ctx, 'pitch'); const m = ctx.board.mine; X().markSight(m[1], 'lantern'); return X().lanternOut(m[1]); }}]});
R({id:'dark-lantern-save', stage:'board', inGameHook:'onEvent: hit by a unit on a Lantern-lit side in Darkness / Pitch Black (once a round)', variants:[{key:'A', label:'An amber mote leads the swing', play:ctx=>{ veil(ctx, 'pitch'); return X().lanternSave(ctx.board.mine[0]); }}]});
R({id:'dark-darksight-play', stage:'board', variants:[{key:'A', label:'Eyes open, foes marked (live look)', play:ctx=>{ veil(ctx, 'dark'); if(S().darksight) S().darksight(ctx.board.mine[1]); return ctx.wait(1900); }}]});
R({id:'dark-darksight-idle', stage:'board', inGameHook:'fxHook(\'boardRendered\'): Darksight units on a dark board', variants:[{key:'A', label:'Two glowing eyes that blink now and then', play:ctx=>{ veil(ctx, 'pitch'); ctx.board.foe.forEach(c=> X().markSight(c, 'eyes')); X().markSight(ctx.board.mine[0], 'eyes'); return ctx.wait(3200); }}]});
R({id:'dark-cave-lamp', stage:'board', variants:[{key:'A', label:'The lamp follows the pointer (live look; swept here)', play:ctx=>{ const bf = ctx.board.el; shader(ctx, 3); const l = document.createElement('div'); l.className = 'bf-cave-lamp'; bf.appendChild(l);
  const o = {x:15, y:30}; return new Promise(res=> ctx.gsap.timeline({onComplete:res}).to(o, {x:85, y:70, duration:1.2, ease:'sine.inOut', onUpdate:()=>{ l.style.setProperty('--lx', o.x + '%'); l.style.setProperty('--ly', o.y + '%'); }}).to(o, {x:40, y:40, duration:.8, ease:'sine.inOut', onUpdate:()=>{ l.style.setProperty('--lx', o.x + '%'); l.style.setProperty('--ly', o.y + '%'); }})); }}]});
R({id:'dark-night-veil-in', stage:'board', variants:[{key:'A', label:'Night slides over the board (live look)', play:ctx=>{ ctx.sound('nightSwell'); ctx.sound('wolfHowl'); skyTone(ctx, 'night'); nightVeil(ctx, true); return ctx.wait(2400); }}]});
R({id:'dark-night-veil-out', stage:'board', variants:[{key:'A', label:'Night lifts (live look)', play:ctx=>{ const v = nightVeil(ctx, true); v.classList.add('no-anim'); void v.offsetWidth; v.classList.remove('no-anim'); return ctx.wait(300).then(()=>{ ctx.sound('roosterCrow'); skyTone(ctx, 'dawn'); nightVeil(ctx, false); return ctx.wait(2600); }); }}]});
R({id:'dark-shade-night', stage:'board', inGameHook:'future (also wired: onEvent hit on a Shade unit at night or in the dark, non-magic)', variants:[{key:'A', label:'The blow passes through a dark double', play:ctx=>{ nightVeil(ctx, true); const t = ctx.board.foe[1]; fl(ctx, t, '-2'); return X().shadeNight(t); }}]});
R({id:'dark-shadow-night', stage:'board', inGameHook:'future (also wired: onEvent evaded {reason:\'shadow\'})', variants:[
  {key:'A', label:'Breaks into smoke and re-forms', play:ctx=>{ nightVeil(ctx, true); return X().shadowNight(ctx.board.foe[1]); }},
  {key:'B', label:old + ': the generic dodge hop', play:ctx=>{ nightVeil(ctx, true); if(S().evasiveDodge) S().evasiveDodge(ctx.board.foe[1], {fromLeft:true}); return ctx.wait(1100); }}]});
R({id:'dark-beware', stage:'board', inGameHook:'onEvent: beware {darkness}', variants:[{key:'A', label:'Red eyes rise from the Removal Zone', play:ctx=>{ ctx.sound('devilryTone'); return X().beware(ctx.board.rowFoe, {darkness:3, mine:false}); }}]});
R({id:'dark-inherent', stage:'board', inGameHook:'onEvent: devilry', variants:[
  {key:'A', label:'Ember motes swirl into a dark star', play:ctx=>{ const t = ctx.board.foe[2]; ctx.sound('devilryTone'); return X().devilryStar(t, {onImpact:()=> fl(ctx, t, '+1★', 'devilry')}); }},
  {key:'B', label:old + ': the resource float', play:ctx=>{ ctx.sound('devilryTone'); fl(ctx, ctx.board.foe[2], '+1★', 'devilry'); return ctx.wait(1000); }}]});
R({id:'dark-devilry-aura', stage:'board', variants:[{key:'A', label:'Devilry card aura (live look)', play:ctx=>{ ctx.board.foe.forEach(c=> tile(c).classList.add('is-devilry')); return ctx.wait(2200); }}]});
R({id:'dark-bioluminescent', stage:'board', inGameHook:'future', note:'Planned: Map 29 Abyssal Plains natives; the anglerfish is a Lantern for its side.', variants:[{key:'A', label:'Teal motes glow, an anglerfish lure bobs', play:ctx=> X().bioluminescent(ctx.board.foe, {host:ctx.board.el})}]});
R({id:'dark-pitchblack-fish', stage:'board', inGameHook:'future', variants:[{key:'A', label:'A pale fish lunges out of the black', play:ctx=>{ const t = ctx.board.mine[1]; return X().pitchFish(t, {host:ctx.board.el, onImpact:()=>{ ctx.sound('hitAt', 5, false); fl(ctx, t, '-5'); }}); }}]});
R({id:'dark-eclipse', stage:'board', inGameHook:'future', note:'Planned Map 35+.', variants:[{key:'A', label:'A disc slides over the sun, corona, stars', play:ctx=> X().eclipse(ctx.board.el)}]});

/* ============================== WEATHER & TIME ============================== */
const toast = (ctx, msg)=>{ const s = fn('showToast'); if(s) s(msg, 'ok'); };
R({id:'wt-day-breaks', stage:'board', inGameHook:'onEvent: phase {phase:\'day\'}', variants:[
  {key:'A', label:'A golden wash sweeps in from the east', play:ctx=>{ ctx.sound('roosterCrow'); skyTone(ctx, 'day'); return X().dayBreaks(ctx.board.el); }},
  {key:'B', label:old + ': toast and the sky tone', play:ctx=>{ ctx.sound('roosterCrow'); skyTone(ctx, 'day'); toast(ctx, '☀️ Day breaks.'); return ctx.wait(1600); }}]});
R({id:'wt-dawn-draw', stage:'board', inGameHook:'onEvent: dawn', variants:[
  {key:'A', label:'Rosy light rises, birds take off', play:ctx=>{ skyTone(ctx, 'dawn'); return X().dawnDraw(ctx.board.el); }},
  {key:'B', label:old + ': the rosy tone only', play:ctx=>{ skyTone(ctx, 'dawn'); return ctx.wait(1600); }}]});
R({id:'wt-dusk', stage:'board', inGameHook:'fxHook(\'matchUI\'): the sky tone turns to dusk', variants:[
  {key:'A', label:'The sun sinks, long shadows stretch', play:ctx=>{ skyTone(ctx, 'dusk'); return X().dusk(ctx.board.el); }},
  {key:'B', label:old + ': the amber tone only', play:ctx=>{ skyTone(ctx, 'dusk'); return ctx.wait(1600); }}]});
R({id:'wt-twilight', stage:'board', inGameHook:'onEvent: phase {phase:\'twilight\'}; the toast now says Twilight (arena_app.js)', variants:[
  {key:'A', label:'Sun and moon cross overhead, stars twinkle', play:ctx=>{ ctx.sound('nightSwell'); skyTone(ctx, 'dusk'); toast(ctx, '🌆 Twilight: day and night creatures are both awake.'); return X().twilight(ctx.board.el); }},
  {key:'B', label:old + ' (broken): announced as "Day breaks"', play:ctx=>{ ctx.sound('roosterCrow'); skyTone(ctx, 'dusk'); toast(ctx, '☀️ Day breaks.'); return ctx.wait(1600); }}]});
R({id:'wt-realtime-phase', stage:'board', inGameHook:'onEvent: phase {realtime:true}', variants:[
  {key:'A', label:'Clock spins and flips to the moon', play:ctx=> X().realtimePhase(ctx.board.el, {phase:'night'})},
  {key:'B', label:'Clock spins and flips to the sun', play:ctx=> X().realtimePhase(ctx.board.el, {phase:'day'})}]});
R({id:'wt-moon-phase', stage:'board', inGameHook:'onEvent: moon {phase} (look A)', note:'Shown with the first-quarter moon (phase 2); the lab plays a different phase each time.', variants:[
  {key:'A', label:'A moon disc rises at the top of the felt', play:ctx=>{ nightVeil(ctx, true); return X().moonPhase(ctx.board.el, {phase:Math.floor(Math.random()*8)}); }},
  {key:'B', label:'A big moon with its name', play:ctx=>{ nightVeil(ctx, true); return X().moonPhase_B(ctx.board.el, {phase:4}); }},
  {key:'C', label:'The eight phases in an arc, tonight\'s swells', play:ctx=>{ nightVeil(ctx, true); return X().moonPhase_C(ctx.board.el, {phase:2}); }},
  {key:'D', label:old + ': a toast', play:ctx=>{ toast(ctx, '🌕 Full moon tonight.'); return ctx.wait(1600); }}]});
R({id:'wt-tide-flow', stage:'board', variants:[{key:'A', label:'The wave rolls in, Swimmers splash (live look)', play:ctx=>{ tideWave(ctx, 'flow'); ctx.board.mine.forEach((c, i)=> setTimeout(()=>{ if(S().splash) S().splash(c); }, 350 + i*70)); return ctx.wait(1700); }}]});
R({id:'wt-tide-ebb', stage:'board', inGameHook:'onEvent: tide {tide:\'ebb\'}', variants:[
  {key:'A', label:'The water drains away, leaving glints and shells', play:ctx=>{ tideWave(ctx, 'ebb'); return X().tideEbb(ctx.board.el); }},
  {key:'B', label:old + ': the ebb wave', play:ctx=>{ tideWave(ctx, 'ebb'); return ctx.wait(1500); }}]});
R({id:'wt-tide-high', stage:'board', inGameHook:'onEvent: tide {tide:\'high\'}', variants:[
  {key:'A', label:'A double crest past the middle, spray over the top row', play:ctx=>{ ctx.sound('splash'); return X().tideHigh(ctx.board.el); }},
  {key:'B', label:old + ': the Flow wave', play:ctx=>{ tideWave(ctx, 'flow'); return ctx.wait(1500); }}]});
R({id:'wt-perma-tide', stage:'board', inGameHook:'fxHook(\'matchUI\') with rules.permaTide (lasts the fight)', variants:[
  {key:'A', label:'A river current runs along the tide line', play:ctx=>{ tideWave(ctx, 'flow'); X().permaTide(ctx.board.el); return ctx.wait(3000); }},
  {key:'B', label:old + ': the tide line only', play:ctx=>{ tideWave(ctx, 'flow'); return ctx.wait(1600); }}]});
R({id:'wt-moonpull', stage:'board', inGameHook:'onEvent: tide {moonpull:true}', variants:[
  {key:'A', label:'The Moon Jelly glows, the water rises toward it', play:ctx=>{ ctx.sound('splash'); return X().moonpull(ctx.board.mine[1]); }},
  {key:'B', label:old + ': the Flow wave', play:ctx=>{ tideWave(ctx, 'flow'); return ctx.wait(1500); }}]});
R({id:'wt-wind-gust', stage:'board', inGameHook:'onEvent: wind {windy:true}', note:'The direction follows where it blows from.', variants:[
  {key:'A', label:'Leaves and feathers streak up from your side', play:ctx=>{ ctx.board.el.classList.add('is-windy'); return X().windGust(ctx.board.el, {from:'mine'}); }},
  {key:'B', label:'The same, blowing down from theirs', play:ctx=>{ ctx.board.el.classList.add('is-windy'); return X().windGust(ctx.board.el, {from:'theirs'}); }},
  {key:'C', label:old + ': the steady drift', play:ctx=>{ ctx.board.el.classList.add('is-windy'); return ctx.wait(2000); }}]});
R({id:'wt-wind-calm', stage:'board', inGameHook:'onEvent: wind {windy:false}', variants:[{key:'A', label:'Leaves drift down and settle', play:ctx=> X().windCalm(ctx.board.el)}]});
R({id:'wt-wind-swap', stage:'board', inGameHook:'onEvent: wind from the other side than the last gust', variants:[{key:'A', label:'A swirl turns about, then the new gust', play:ctx=> X().windSwap(ctx.board.el).then(()=> X().windGust(ctx.board.el, {from:'theirs'}))}]});
R({id:'wt-tailwind', stage:'board', variants:[{key:'A', label:'A gust lifts the Flyer (live look)', play:ctx=>{ const t = ctx.board.mine[0]; if(S().gust) S().gust(t, {dir:1}); fl(ctx, t, '🪁 Tailwind!', 'buff'); return ctx.wait(1300); }}]});
R({id:'wt-headwind', stage:'board', inGameHook:'onEvent: triggerFired by a Flyer on the Headwind side', variants:[{key:'A', label:'A ×2 rune echo is blown off the card', play:ctx=> X().headwindEcho(ctx.board.foe[1])}]});
R({id:'wt-swimmer-flow', stage:'board', variants:[{key:'A', label:'A splash (live look)', play:ctx=>{ const t = ctx.board.mine[1]; if(S().splash) S().splash(t); fl(ctx, t, '🏊 Quick!', 'buff'); return ctx.wait(1200); }}]});
R({id:'wt-battle-rain', stage:'board', variants:[{key:'A', label:'Shader rain (live look; CSS rain where WebGL is off)', play:ctx=>{ const l = shader(ctx, 11); if(!l) ctx.board.el.classList.add('is-raining'); return ctx.wait(2600); }}]});
R({id:'wt-lightning-strike', stage:'board', variants:[{key:'A', label:'A bolt strikes open ground (live look)', play:ctx=>{ const f = fn('lightningStrike'); const bf = ctx.board.el, b = bf.getBoundingClientRect();
  const lx = b.width*.82, ly = b.height*.5; let pts = [], x = lx + 30; for(let i = 0; i <= 9; i++){ const k = i/9; pts.push(`${(x + (lx - x)*k + (i && i < 9 ? Math.random()*36 - 18 : 0)).toFixed(1)},${(-24 + (ly + 24)*k).toFixed(1)}`); }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'bf-bolt'); svg.innerHTML = `<polyline points="${pts.join(' ')}" class="bolt-glow"/><polyline points="${pts.join(' ')}" class="bolt-core"/>`;
  bf.appendChild(svg); setTimeout(()=> svg.remove(), 520); const h = document.createElement('div'); h.className = 'bf-bolt-hit'; h.style.left = lx + 'px'; h.style.top = ly + 'px'; bf.appendChild(h); setTimeout(()=> h.remove(), 900); ctx.sound('thunder');
  return ctx.wait(1300); }}]});
R({id:'wt-world-rain', stage:'map', note:'The map\'s rain is the shader layer (stand-in here: the batch\'s CSS rain sheet at full strength).', variants:[{key:'A', label:'Rain over the map (stand-in)', play:ctx=> X().rainStartStop(ctx.map.el, {start:true})}]});
R({id:'wt-rain-start-stop', stage:'map', inGameHook:'fxHook(\'mapRain\') from mountMapShader when the rain state changed since this map was last drawn', variants:[
  {key:'A', label:'Rain starts: first drops, then the downpour', play:ctx=> X().rainStartStop(ctx.map.el, {start:true})},
  {key:'B', label:'Rain stops: it thins, the last drops fall', play:ctx=> X().rainStartStop(ctx.map.el, {start:false})}]});
R({id:'wt-live-clock', stage:'screen', note:'Stand-in: the Home atmosphere\'s four tints (multiply-blend cast) cycled quickly.', variants:[{key:'A', label:'Dawn, day, dusk, night tints (stand-in)', play:ctx=>{ const l = ctx.layer(); l.style.cssText = 'position:absolute; inset:0; mix-blend-mode:multiply; pointer-events:none;';
  return new Promise(res=> ctx.gsap.timeline({onComplete:res}).fromTo(l, {backgroundColor:'rgba(255,190,140,.45)'}, {backgroundColor:'rgba(255,250,235,.1)', duration:.7}).to(l, {backgroundColor:'rgba(240,140,70,.5)', duration:.7}).to(l, {backgroundColor:'rgba(40,60,130,.6)', duration:.7}).to({}, {duration:.4})); }}]});
R({id:'wt-seasons', stage:'map', variants:[{key:'A', label:'Autumn, winter, spring, summer vignettes (live CSS)', play:async ctx=>{ const v = document.createElement('div'); ctx.map.el.appendChild(v);
  for(const s of ['autumn', 'winter', 'spring', 'summer']){ v.className = 'season-veil season-' + s; await ctx.wait(650); } }}]});
R({id:'wt-sudden-death', stage:'board', variants:[{key:'A', label:'The red sky and the banner (live look)', play:ctx=>{ ctx.board.el.classList.add('sudden-death'); ctx.sound('suddenDeathSting');
  const el = document.createElement('div'); el.className = 'sudden-death-sign'; el.innerHTML = '<div class="sds-title">☠️ Sudden death</div><div class="sds-sub">Any hit now kills a unit outright.</div>'; document.body.appendChild(el);
  setTimeout(()=> el.classList.add('out'), 2000); setTimeout(()=> el.remove(), 2600); return ctx.wait(2700); }}]});
R({id:'wt-first-field-flash', stage:'board', variants:[{key:'A', label:'Red wash and autumn leaves on the row (live look)', play:ctx=>{ const f = fn('flagFirstFieldFlash'); if(f) f('A'); else { const row = ctx.board.rowMine; pulse(row, 'goes-first-flash', 1100);
  const r = row.getBoundingClientRect(); for(let i = 0; i < 7; i++){ const l = document.createElement('span'); l.className = 'field-first-leaf'; l.textContent = ['🍁', '🍂', '🍃'][i%3]; l.style.left = (r.left + Math.random()*r.width) + 'px'; l.style.top = (r.top + r.height*.3 + Math.random()*r.height*.4) + 'px';
    l.style.fontSize = (16 + Math.random()*10) + 'px'; l.style.setProperty('--pop-x', (Math.random()*80 - 40).toFixed(0) + 'px'); l.style.setProperty('--pop-rot', (Math.random()*300 - 150).toFixed(0) + 'deg'); document.body.appendChild(l); setTimeout(()=> l.remove(), 1400); } } return ctx.wait(1500); }}]});
const coin = ctx=>{ let c = ctx.board.el.querySelector(':scope > .init-coin'); if(!c){ c = document.createElement('div'); c.className = 'init-coin'; ctx.board.el.appendChild(c); } return c; };
const roll = (c, mine)=>{ const was = c.dataset.side; c.dataset.side = mine ? 'mine' : 'theirs'; if(was && was !== c.dataset.side && c.animate){ const deg = Math.round(c.closest('#battlefieldEl').getBoundingClientRect().height*.5/(Math.PI*(c.offsetWidth || 20))*360)*(mine ? 1 : -1);
  c.animate([{transform:'translateY(-50%) rotate(0deg)'}, {transform:`translateY(-50%) rotate(${deg}deg)`}], {duration:900, easing:'cubic-bezier(.65,0,.35,1)'}); } };
R({id:'wt-initiative-coin', stage:'board', inGameHook:'fxHook(\'initCoin\') from syncInitiativeCoin when the coin rolls sides', variants:[
  {key:'A', label:'A glint trail follows the roll; it lands with a clink of sparks', play:ctx=>{ const c = coin(ctx); c.dataset.side = 'theirs'; return ctx.wait(300).then(()=>{ roll(c, true); ctx.sound('gold'); return X().initCoin(c); }); }},
  {key:'B', label:old + ': the plain roll', play:ctx=>{ const c = coin(ctx); c.dataset.side = 'theirs'; return ctx.wait(300).then(()=>{ roll(c, true); return ctx.wait(1100); }); }}]});
R({id:'wt-syzygy', stage:'board', inGameHook:'future', note:'Planned Map 35+ world event: High tide + Full Moon + Eclipse.', variants:[{key:'A', label:'Sun, moon and earth line up into one blazing ring', play:ctx=> X().syzygy(ctx.board.el)}]});
R({id:'wt-eclipse-phase', stage:'board', inGameHook:'future', variants:[{key:'A', label:'The phase pill eclipses, the board tints red-violet', play:ctx=> X().eclipsePhase(ctx.board.el)}]});

/* ================================= FIELDS ================================= */
const FIELD_LABEL = {frozen:'Frigid: frost crystals spread from the edges', rain:'Spring Rain: a rain sheet sweeps over', fog:'Thick Fog: banks roll in from both sides', heatwave:'Scorching: heat rises, the sun flares', moon:'Full Moon: silver light pours down'};
const landTile = ctx=> pulse(ctx.board.field && (ctx.board.field.querySelector('.card-tile') || ctx.board.field), 'is-landing', 700);
R({id:'fld-set', stage:'board', inGameHook:'onEvent: fieldSet {field} (then the lasting layer for Fog / Moon)', note:'A–E are the five field cards (each in the game), F is how it was.', variants:
  ['frozen', 'rain', 'fog', 'heatwave', 'moon'].map((f, i)=> ({key:'ABCDE'[i], label:FIELD_LABEL[f], play:ctx=>{ landTile(ctx); ctx.sound('trigger'); return X().fieldSet(ctx.board.el, {field:f, tile:ctx.board.field}); }}))
    .concat([{key:'F', label:old + ': a toast and the tile landing', play:ctx=>{ landTile(ctx); toast(ctx, '❄️ Frigid: one random unit on each side gets +1 Wait.'); return ctx.wait(1500); }}])});
R({id:'fld-end', stage:'board', inGameHook:'onEvent: fieldEnd {field}', note:'A–E per field (each in the game); before, the tile just vanished.', variants:
  ['frozen', 'rain', 'fog', 'heatwave', 'moon'].map((f, i)=> ({key:'ABCDE'[i], label:{frozen:'Frigid melts away', rain:'The rain clears, light breaks through', fog:'The fog lifts', heatwave:'The heat cools', moon:'The moon sets'}[f], play:ctx=> X().fieldEnd(ctx.board.el, {field:f, tile:ctx.board.field})}))});
R({id:'fld-base-returns', stage:'board', inGameHook:'onEvent: fieldEnd {back}', variants:[{key:'A', label:'The map\'s own field card flips back in with a leaf burst', play:ctx=> X().baseReturns(ctx.board.field)}]});
R({id:'fld-frigid-tick', stage:'board', variants:[{key:'A', label:'Cold wave, ice pulse, chill (live look)', play:ctx=>{ coldWave(ctx, ctx.board.foe[2]); return ctx.wait(1700); }}]});
R({id:'fld-frigid-weak', stage:'board', inGameHook:'onEvent: fieldTick frozen {dmg}', variants:[
  {key:'A', label:'Icicles drop onto it and crack', play:ctx=>{ const t = ctx.board.foe[0]; coldWave(ctx, null); return ctx.wait(400).then(()=> X().frigidWeak(t, {onImpact:()=>{ ctx.sound('shatter'); fl(ctx, t, '❄ -1', 'dmg'); }})); }},
  {key:'B', label:old + ': the float and the same chill', play:ctx=>{ const t = ctx.board.foe[0]; coldWave(ctx, t); setTimeout(()=> fl(ctx, t, '-1', 'dmg'), 500); return ctx.wait(1500); }}]});
R({id:'fld-frost-resist', stage:'board', inGameHook:'onEvent: the first fieldTick frozen of a round, on enemy units of the rules.frostResist types', variants:[{key:'A', label:'The cold splits around it; a warm outline', play:ctx=>{ coldWave(ctx, null); return ctx.wait(300).then(()=> X().frostResist(ctx.board.foe[1])); }}]});
R({id:'fld-scorching-tick', stage:'board', variants:[{key:'A', label:'Heat haze scorch (live look)', play:ctx=>{ const t = ctx.board.mine[0]; if(S().scorch) S().scorch(t); fl(ctx, t, '🔥-1', 'dmg'); return ctx.wait(1500); }}]});
R({id:'fld-rain-tick', stage:'board', inGameHook:'onEvent: fieldTick rain (once a round)', variants:[
  {key:'A', label:'Drizzle crosses the felt, a drop heals each unit', play:ctx=>{ const us = allCards(ctx); us.forEach((u, i)=> setTimeout(()=> fl(ctx, u, '🌧️+2', 'heal'), 600 + i*50)); return X().rainTick(ctx.board.el, {units:us}); }},
  {key:'B', label:old + ': a float per unit', play:ctx=>{ allCards(ctx).forEach(u=> fl(ctx, u, '🌧️+2', 'heal')); return ctx.wait(1200); }}]});
const fieldFx = (ctx, id)=>{ const d = document.createElement('div'); d.className = 'field-fx field-' + (id === 'heatwave' ? 'heat' : id); d.innerHTML = id === 'fog' ? '<span></span><span></span><span></span>' : id === 'moon' ? '<span class="fm-moon">🌕</span>' : ''; ctx.board.el.appendChild(d); return d; };
R({id:'fld-fog-active', stage:'board', inGameHook:'fxHook(\'matchUI\') + onEvent fieldSet / fieldEnd: the layer lasts while Thick Fog is up', variants:[
  {key:'A', label:'Low fog banks roll over the rows', play:ctx=>{ fieldFx(ctx, 'fog'); X().fieldLayer(ctx.board.el, 'fog'); return ctx.wait(3000); }},
  {key:'B', label:old + ': the faint haze overlay', play:ctx=>{ fieldFx(ctx, 'fog'); return ctx.wait(2400); }}]});
R({id:'fld-moon-active', stage:'board', inGameHook:'fxHook(\'matchUI\') + onEvent fieldSet / fieldEnd: the layer lasts while the Full Moon is up', variants:[
  {key:'A', label:'Moonlight from above and twinkling stars', play:ctx=>{ fieldFx(ctx, 'moon'); X().fieldLayer(ctx.board.el, 'moon'); return ctx.wait(3000); }},
  {key:'B', label:old + ': the moon overlay', play:ctx=>{ fieldFx(ctx, 'moon'); return ctx.wait(2400); }}]});
R({id:'fld-field-tile-looks', stage:'board', variants:[{key:'A', label:'The five field tiles (live CSS)', play:async ctx=>{ const t = ctx.board.field && (ctx.board.field.querySelector('.card-tile') || ctx.board.field); if(!t) return;
  for(const f of ['frozen', 'rain', 'fog', 'heatwave', 'moon']){ t.classList.remove('field-frozen', 'field-rain', 'field-fog', 'field-heatwave', 'field-moon', 'biome-cave'); t.classList.add('field-' + f); pulse(t, 'is-landing', 650); await ctx.wait(650); } }}]});
R({id:'fld-env-cards', stage:'board', variants:[{key:'A', label:'The environment cards fan up (live look)', play:ctx=>{ const cs = ctx.board.field ? [...ctx.board.field.querySelectorAll('.env-card')] : []; if(!cs.length) return ctx.wait(500);
  return new Promise(res=> ctx.gsap.timeline({onComplete:res}).to(cs, {y:-8, scale:1.04, rotation:0, duration:.25, stagger:.08}).to(cs, {y:0, scale:1, duration:.25, clearProps:'transform'}, '+=.6')); }}]});
R({id:'fld-env-reveal', stage:'board', inGameHook:'fxHook(\'fieldReveal\') from noteFieldEvent when a "?" row is learned', variants:[{key:'A', label:'The "?" card flips over with a leaf burst', play:ctx=>{ ctx.sound('cardFlip'); return X().envReveal(ctx.board.field); }}]});
R({id:'fld-misty', stage:'board', variants:[{key:'A', label:'The fog tint drifts (live CSS)', play:ctx=>{ skyTone(ctx, 'misty'); return ctx.wait(2400); }}]});
const banner = ctx=>{ const b = document.createElement('div'); b.className = 'terrain-banner biome-ash'; b.innerHTML = '<b>🔥 Scorched Ground</b><span>Every round, a random unit on each side takes 1 fire damage.</span>'; ctx.board.el.appendChild(b); return b; };
R({id:'fld-terrain-banner', stage:'board', inGameHook:'fxHook(\'terrainBanner\') from maybeTerrainIntro', variants:[
  {key:'A', label:'A shine sweeps it, the title pops, embers fly', play:ctx=>{ const b = banner(ctx); return ctx.wait(80).then(()=> X().terrainBanner(b)).then(()=> ctx.wait(900)); }},
  {key:'B', label:old + ': the banner alone', play:ctx=>{ banner(ctx); return ctx.wait(1800); }}]});
R({id:'fld-lava-tide', stage:'board', variants:[{key:'A', label:'Lava geyser in the column (live look)', play:ctx=>{ const t = ctx.board.foe[1]; pulse(t, 'lava-tide-hit', 900); geyser(t); ctx.sound('boom'); fl(ctx, t, '🌋-3', 'dmg'); return ctx.wait(1400); }}]});
R({id:'fld-eruption', stage:'board', variants:[{key:'A', label:'Rumble, lit from below, geyser (live look)', play:ctx=>{ const t = ctx.board.mine[2]; pulse(ctx.board.el, 'erupt-rumble', 700); pulse(t, 'erupt-hit', 900); geyser(t); ctx.sound('boom'); fl(ctx, t, '🌋-2', 'dmg'); return ctx.wait(1400); }}]});
R({id:'fld-scorched', stage:'board', variants:[{key:'A', label:'Scorch from the ground (live look)', play:ctx=>{ const t = ctx.board.foe[2]; pulse(t, 'erupt-hit', 900); if(S().scorch) S().scorch(t); ctx.sound('boom'); fl(ctx, t, '🔥-1', 'dmg'); return ctx.wait(1400); }}]});
R({id:'fld-comet-rain', stage:'board', variants:[{key:'A', label:'The sky glows ember-red (live CSS)', play:ctx=>{ pulse(ctx.board.el, 'comet-sky', 2600); return ctx.wait(2400); }}]});
R({id:'fld-comet-strike', stage:'board', variants:[{key:'A', label:'A comet falls onto a card (live CSS)', play:ctx=>{ const t = ctx.board.foe[0], r = tile(t).getBoundingClientRect(); const c = document.createElement('div'); c.className = 'bw-comet';
  c.style.cssText = `left:${r.left + r.width/2}px; top:${r.top + r.height*.45}px; --dx:150px; --dy:260px;`; document.body.appendChild(c); setTimeout(()=>{ pulse(t, 'comet-hit', 700); shake(ctx, t); fl(ctx, t, '☄️-2', 'dmg'); ctx.sound('hitAt', 2, false); }, 380); setTimeout(()=> c.remove(), 900); return ctx.wait(1300); }}]});
R({id:'fld-eruption-reset', stage:'board', inGameHook:'onEvent: fieldTick eruptionReset', variants:[
  {key:'A', label:'The plume sinks, ash settles, the rumble fades', play:ctx=> X().eruptionReset(ctx.board.el)},
  {key:'B', label:old + ': a toast', play:ctx=>{ toast(ctx, '☄️ The mountain settles, and comets will fall for 3 rounds.'); return ctx.wait(1600); }}]});
R({id:'fld-volcanic-ambient', stage:'board', variants:[{key:'A', label:'Lava breathing at the board\'s foot (live CSS)', play:ctx=>{ ctx.board.el.classList.add('volcanic'); return ctx.wait(2600); }}]});
R({id:'fld-tide-spout', stage:'board', inGameHook:'onEvent: fieldTick tideSpout, drawn at the first washed card\'s column', variants:[
  {key:'A', label:'A water column bursts up the whole board', play:ctx=>{ ctx.sound('splash'); return X().tideSpout(ctx.board.el, {el:ctx.board.foe[1]}); }},
  {key:'B', label:old + ': a splash and the Flow wave', play:ctx=>{ ctx.sound('splash'); tideWave(ctx, 'flow'); return ctx.wait(1500); }}]});
R({id:'fld-tide-spout-wash', stage:'board', variants:[{key:'A', label:'Pushed back and soaked (live look)', play:ctx=>{ const t = ctx.board.mine[1]; ctx.sound('splash'); fl(ctx, t, '⏪ +1 Wait', 'debuff wait-push'); setTimeout(()=> fl(ctx, t, '💧-1', 'dmg'), 260); geyser(t, true); pulse(t, 'wash-pushed', 1000); return ctx.wait(1300); }}]});
R({id:'fld-boss-surge', stage:'board', variants:[{key:'A', label:'The boss surges (live CSS)', play:ctx=>{ const t = ctx.board.foe[1]; pulse(t, 'surge-glow', 1400); ctx.sound('rageRoar'); fl(ctx, t, '💢 +2/+4', 'buff'); return ctx.wait(1600); }}]});
R({id:'fld-deep-mines', stage:'board', inGameHook:'onEvent: roundStart (round 2+) with rules.enemyOre', variants:[
  {key:'A', label:'A pickaxe strikes their castle, ore pops out', play:ctx=>{ const c = ctx.board.castleFoe; return X().deepMines(c, {onImpact:()=> ctx.sound('thud')}).then(()=> fl(ctx, c, '+1🪨', 'stone')); }},
  {key:'B', label:old + ': the resource float', play:ctx=>{ fl(ctx, ctx.board.castleFoe, '+1🪨', 'stone'); ctx.sound('gold'); return ctx.wait(1000); }}]});
R({id:'fld-first-blood-rule', stage:'board', inGameHook:'onEvent: statusFx firstBlood', variants:[
  {key:'A', label:'A red splash and a "First Blood" stamp', play:ctx=>{ const t = ctx.board.mine[1]; return X().firstBlood(t, {onImpact:()=>{ ctx.sound('rageRoar'); fl(ctx, t, '+2⚔', 'buff'); }}); }},
  {key:'B', label:old + ': a float', play:ctx=>{ fl(ctx, ctx.board.mine[1], '+2⚔', 'buff'); return ctx.wait(1000); }}]});
R({id:'fld-lumber-every', stage:'board', inGameHook:'onEvent: lumber {rule:true}', variants:[
  {key:'A', label:'A log rolls out of the castle into the Lumber pill', play:ctx=>{ const to = ctx.board.pillsMine || ctx.board.hud; return X().lumberEvery(ctx.board.castleMine, {to, onImpact:()=>{ ctx.sound('gold'); }}); }},
  {key:'B', label:old + ': a bing and a float', play:ctx=>{ fl(ctx, ctx.board.castleMine, '+1🪵', 'lumber'); ctx.sound('gold'); return ctx.wait(1000); }}]});
const fcPill = ctx=>{ const host = ctx.board.el.querySelector('#bfPills') || ctx.board.el; const p = document.createElement('button'); p.type = 'button'; p.className = 'forecast-pill bf-pill';
  p.innerHTML = '<span class="fp-k" aria-hidden="true">⏭</span><span aria-hidden="true">🌙</span><span aria-hidden="true">🌊</span>'; host.appendChild(p); return p; };
R({id:'fld-forecast', stage:'board', inGameHook:'fxHook(\'boardRendered\') when the forecast pill\'s text changes', variants:[
  {key:'A', label:'The chips slide in, the weather icon wobbles', play:ctx=>{ const p = fcPill(ctx); return ctx.wait(200).then(()=> X().forecastPop(p)).then(()=> ctx.wait(600)); }},
  {key:'B', label:old + ': static', play:ctx=>{ fcPill(ctx); return ctx.wait(1400); }}]});
R({id:'fld-arena-ruleset', stage:'board', inGameHook:'fxHook(\'matchUI\') once at the start of an Arena fight', variants:[{key:'A', label:'A shine sweeps the pill, a wax seal stamps', play:ctx=>{ const host = ctx.board.el.querySelector('#bfPills') || ctx.board.el; const p = document.createElement('button'); p.type = 'button'; p.className = 'phase-pill bf-pill arena-rs-pill';
  p.innerHTML = '<span aria-hidden="true">🏟️</span>'; host.appendChild(p); return ctx.wait(150).then(()=> X().arenaSeal(p, {onImpact:()=> ctx.sound('thud')})); }}]});
R({id:'fld-wet-raindrops', stage:'board', variants:[{key:'A', label:'Raindrops run down the cards (live CSS, High effects)', play:ctx=>{ const h = document.documentElement, was = h.dataset.fx; h.dataset.fx = 'high';
  allCards(ctx).forEach(c=>{ const d = document.createElement('div'); d.className = 'rain-drops'; tile(c).appendChild(d); }); return ctx.wait(2600).then(()=>{ if(was == null) delete h.dataset.fx; else h.dataset.fx = was; }); }}]});
R({id:'fld-water-ripple', stage:'board', note:'Drawn in the felt shader: needs WebGL (software WebGL works, slowly).', variants:[{key:'A', label:'A ripple ring where a card lands (live shader)', play:ctx=>{ const l = shader(ctx, 1); const t = tile(ctx.board.mine[1]).getBoundingClientRect(), h = ctx.board.el.getBoundingClientRect();
  if(l && l.wave) setTimeout(()=> l.wave((t.left + t.width/2 - h.left)/h.width, (t.top + t.height*.9 - h.top)/h.height, [0.55, 0.8, 1], 0.45, 1000), 400); return ctx.wait(1800); }}]});
R({id:'fld-felt-material', stage:'board', note:'The felt shader per biome: wet glints, ash cracks, frost bloom, sand ripples (needs WebGL).', variants:[{key:'A', label:'Wet, ash, frost and sand floors (live shader)', play:async ctx=>{ for(const k of [11, 10, 5, 8]){ const B = window.BramblewoodShaders; ctx.board.el.querySelectorAll(':scope > canvas').forEach(c=> c.remove()); shader(ctx, k); await ctx.wait(800); } }}]});
R({id:'fld-biome-puff', stage:'board', variants:[{key:'A', label:'Leaves, spray, ash, snow kicked up (live look)', play:async ctx=>{ const lp = fn('leafPuff'); if(!lp) return ctx.wait(500); const sets = [['🍂', '🍃', '🍂', '·', '·', '🍁'], ['💧', '🍃', '💧', '·', '·', '💧'], ['·', '•', '🔥', '·', '•', '·'], ['❄', '·', '❄', '·', '•', '·']];
  for(let i = 0; i < 4; i++){ lp(allCards(ctx)[i], sets[i]); await ctx.wait(450); } await ctx.wait(500); }}]});
const fut = (id, label, f, note)=> R({id, stage:'board', inGameHook:'future', note:note || 'Planned field rule (world roadmap): a lab concept, not in the game yet.', variants:[{key:'A', label, play:ctx=> X()[f](ctx.board.el, {units:allCards(ctx)})}]});
fut('fld-future-monsoon', 'Grey sheets of rain, puddles spread', 'monsoon');
fut('fld-future-wildfire', 'A wall of flame crosses the board', 'wildfire');
fut('fld-future-migration', 'A herd crosses the middle in a dust cloud', 'migration');
fut('fld-future-fogbanks', 'White columns rise between the lanes', 'fogBanks');
fut('fld-future-pollen', 'Golden motes drift on a warm tint', 'pollen');
fut('fld-future-permafrost', 'The ice cracks and drips', 'permafrost');
fut('fld-future-volcanicwinter', 'Ash snow under a dim orange sky', 'volcanicWinter');
fut('fld-future-floodplains', 'Water rises, drains, the ground cracks', 'floodplains');
fut('fld-future-abyssal-pressure', 'A crushing vignette squeezes bubbles out', 'abyssalPressure');
fut('fld-future-hurricane', 'A spiral wind tears across', 'hurricane', 'A one-off skill idea (skills-by-map): a lab concept, not in the game yet.');
})();
