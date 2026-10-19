// Combat-animation pass lab registrations (2026-10-15, the evening batch: designer items 9, 13, 16, 17, 18, 20, 21, 22, 27, 29, 30, 31,
// 32, 36, 49, 50, 51, 53, 54). Loaded after a.js … g.js, so a variant key here replaces that key on the same id: the new looks take
// keys G and H and leave the batches' own variants alone. Contract: docs/effects-lab-contract.md. The effect code lives where the
// game plays it (named per entry).
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX, A = ()=> window.FX && window.FX.A, F = ()=> window.FX && window.FX.F, g = ()=> window.gsap;
const T = {windup:390, strike:570, impactPad:180};
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const C = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2, w:r.width, h:r.height}; };
const W = window;
// animateAttacker's lunge (as in a.js)
function lunge(el, isMine){ const t = tileOf(el), G = g(); if(!G || !t) return; const d = isMine ? 1 : -1;
  G.timeline().to(t, {y:d*9, scale:.95, duration:T.windup/1000, ease:'power2.in'}).to(t, {y:d*-15, scale:1.06, duration:T.strike*.55/1000, ease:'back.out(3)'}).to(t, {y:0, scale:1, duration:T.strike*.45/1000, ease:'power2.out', clearProps:'transform'}); }
function num(ctx, el, n){ ctx.float(el, '-' + n, ''); const t = tileOf(el), G = g(); if(G && t) G.timeline().to(t, {scaleX:1.06, scaleY:.92, y:-5, duration:.06}).to(t, {scaleX:1, scaleY:1, y:0, duration:.38, ease:'elastic.out(1, 0.45)', clearProps:'transform'}); }

// 9: a miss is a whole swing (delayForEvent gives blindMiss a hit's beat; FX.B's whoosh waits for the strike)
R({id:'atk-blind-miss', stage:'board', inGameHook:'renderVfxForEvent blindMiss → animateAttacker + miss float at the wind-up; FX.A.blindSwing; delayForEvent 900 ms',
  note:'2026-10-15 (user: "The miss animation is skipping the attack animation"): the miss used to get a 150 ms beat, so the next event (often the round-end repaint) cut the lunge off.',
  variants:[{key:'G', label:'Full lunge, then the miss and the whoosh', play:ctx=>{ const a = mine(ctx)[1]; lunge(a, true); ctx.wait(190).then(()=> A() && A().blindSwing(a)); return ctx.wait(T.windup).then(()=>{ ctx.sound('blindTone'); ctx.float(a, '👁 Miss!', 'debuff'); return ctx.wait(900); }); }}]});

// 29: the dodge starts as the blow arrives, reads "Evaded!", is shorter; a failed roll is caught mid-dodge
R({id:'atk-evade-evasive', stage:'board', inGameHook:'labSkillFx evaded → SkillFX.evasiveDodge at the impact time - 90 ms; hit on an Evasive unit → SkillFX.evasiveDodgeHit',
  note:'2026-10-15 (user: "Focus on the dodge part ... it starts delayed ... If they miss, it just says Evaded! ... If it hits, the animation still plays, but they get hit out of the animation").',
  variants:[
    {key:'G', label:'Evaded: the sidestep as the blow lands', play:ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false); return ctx.wait(T.windup + T.impactPad - 90).then(()=>{ ctx.sound('dodge'); S().evasiveDodge(t, {fromLeft:false}); return ctx.wait(800); }); }},
    {key:'H', label:'Dodge fails: caught mid-sidestep, then home', play:ctx=>{ const a = foe(ctx)[1], t = mine(ctx)[1]; lunge(a, false); return ctx.wait(T.windup + T.impactPad - 100).then(()=>{ S().evasiveDodgeHit(t, {fromLeft:false}); return ctx.wait(100); }).then(()=>{ ctx.sound('hitAt', 4); ctx.float(t, '-4', ''); return ctx.wait(900); }); }},
  ]});

// 31: one Cleave swing, slots 0.2 s apart in time with the blade
// 2026-10-19 (package BU): stray = the right-hand point comes in from the other row (the owner's loop); the crescent stays on the target row.
function cleaveDemo(ctx, outcomes, stray){
  const a = mine(ctx)[1], f = foe(ctx), pts = [C(f[0]), C(f[1]), stray ? C(mine(ctx)[2]) : C(f[2])];
  S().cleaveSwing(a, pts, {windup:T.windup, step:200}); ctx.float(a, '🪓 Cleave!', 'quick');
  return ctx.wait(T.windup - 80).then(()=>{ ctx.sound('sweepTone'); return ctx.wait(80); }).then(async ()=>{
    for(let i = 0; i < 3; i++){ const o = outcomes[i], el = f[i];
      if(o === 'whoosh'){ const p = pts[i], ft = document.createElement('div'); ft.className = 'sweep-whiff-label'; ft.textContent = 'whoosh'; ft.style.cssText = `left:${p.x}px; top:${p.y - p.w*.3}px;`; document.body.appendChild(ft); setTimeout(()=> ft.remove(), 900); g().to(tileOf(el), {opacity:.25, duration:.01}); }
      else if(o === 'miss'){ S().evasiveDodge(el, {fromLeft:true}); }
      else num(ctx, el, i === 1 ? 7 : 3);
      if(i < 2) await ctx.wait(200); }
    await ctx.wait(800);
  });
}
R({id:'atk-cleave', stage:'board', inGameHook:'resolveRound groups the sides and the strike (cleavePlan) → cleaveSwingStart → SkillFX.cleaveSwing; each slot lands 0.2 s apart',
  note:'2026-10-15 (user: "an arc slash from the left to right ... straight away ... in a small mini arc ... L/M/R ... separated by 0.2s"). 2026-10-19 (BU, owner on an iPhone: "Cleave doesn\'t look so nice on mobile. Also, it is not centered."): a crisp filled crescent sized to the cards, a short trail behind its tip, always on the target\'s row.',
  variants:[
    {key:'G', label:'One arc: hit, hit, hit', play:ctx=> cleaveDemo(ctx, ['hit', 'hit', 'hit'])},
    {key:'H', label:'Empty left slot, dodge on the right: whoosh, hit, Evaded', play:ctx=> cleaveDemo(ctx, ['whoosh', 'hit', 'miss'])},
    {key:'F', label:'A stray point in the other row (the 10-19 loop): the crescent stays on the target row', play:ctx=> cleaveDemo(ctx, ['hit', 'hit', 'hit'], true)},
  ]});
R({id:'atk-sweep-whiff', stage:'board', inGameHook:'sweepWhiff inside a Cleave group: "whoosh" as the blade passes (no lunge at the empty slot)', variants:[
  {key:'G', label:'Inside the swing: whoosh at the empty slot', play:ctx=> cleaveDemo(ctx, ['whoosh', 'hit', 'whoosh'])}]});

// 22: Pounce lands on its target and hops back
R({id:'atk-pounce', stage:'board', inGameHook:'renderVfxForEvent: a hit tagged pounce → SkillFX.pounceOnto (the leap lands with the damage)',
  note:'2026-10-15 (user: "After playing, the card just lands ON the enemy it would hit, then it jumps back.").',
  variants:[{key:'G', label:'Leap onto the unit, land, hop back', play:ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.float(a, '🐾 Pounce 3', 'gold'); S().pounceOnto(a, t, {impact:T.windup + T.impactPad, onImpact:()=> num(ctx, t, 3)}); return ctx.wait(1500); }},
            {key:'H', label:'Onto a unit off to the side', play:ctx=>{ const a = mine(ctx)[0], t = foe(ctx)[2]; ctx.float(a, '🐾 Pounce 3', 'gold'); S().pounceOnto(a, t, {impact:T.windup + T.impactPad, onImpact:()=> num(ctx, t, 3)}); return ctx.wait(1500); }}]});

// 17 / 53 / 54: deaths
R({id:'death-bleed', stage:'board', inGameHook:'deathVfx (bleed): bleedOutVfx, then fallDeathVfx once it is grey',
  note:'2026-10-15 (user: "Bleed to death: The card, after being grey, drops dead like normal.").',
  variants:[{key:'G', label:'Drains grey, then topples like a knock-out', play:ctx=>{ const el = foe(ctx)[1]; ctx.sound('bleedOut', 'bleed'); W.bleedOutVfx(el, 670, 'bleed'); setTimeout(()=>{ try{ W.fallDeathVfx(el, 480); }catch(e){} }, 360); return ctx.wait(1700); }}]});
R({id:'death-poison', stage:'board', inGameHook:'deathVfx (poison): bleedOutVfx(poison) with the Poisoned bubbles',
  note:'2026-10-15 (user: "The poison animation has a blackening effect. Lessen that effect by 40%." and "The poison death animation should use the same particle as the poisoned effect.").',
  variants:[{key:'G', label:'Lighter green drain, Poisoned bubbles rising', play:ctx=>{ const el = foe(ctx)[1]; ctx.sound('bleedOut', 'poison'); W.bleedOutVfx(el, 670, 'poison'); return ctx.wait(1500); }}]});
R({id:'st-poison-tick', stage:'board', inGameHook:'labSkillFx poisonTick → SkillFX.poisonCloud (the card\'s dip darkens 40% less)', variants:[
  // 2026-10-18 (package P): on a Poisoned unit (the game's hook), and the tick's wear-down drops a grey counter off the badge (FX.D.poisonDrop)
  {key:'G', label:'Poison cloud, lighter dip; a grey counter drops off the badge', play:async ctx=>{ const el = mine(ctx)[1], P = W.FXLAB_POISON, env = P && P.env(ctx), c = {defId:'', poison:2, hp:6, maxHp:6};
    if(P){ P.show(el, c, env); await ctx.wait(900); }
    ctx.sound('bubble'); S().poisonCloud(el); ctx.float(el, '☠️ -2', 'poison-tick'); if(P){ W.FX.D.poisonDrop(el); c.poison -= 1; P.show(el, c, env); } return ctx.wait(1500); }}]});

// 21: the frost rime rides inside the card
R({id:'st-freeze-field', stage:'board', inGameHook:'labSkillFx fieldTick frozen → SkillFX.frostChill (the rime frame is inside the tile now)',
  note:'2026-10-15 (user: "The freeze per turn effect\'s rectangle vfx sometimes doesnt appear on the card but offset"): G moves the card during the effect to show the frame staying on it.',
  variants:[{key:'G', label:'Frost chill on a card that moves mid-effect', play:ctx=>{ const el = mine(ctx)[1]; S().frostChill(el); g().to(el, {x:40, duration:.4, delay:.5, yoyo:true, repeat:1, clearProps:'x'}); return ctx.wait(2000); }}]});

// 36: the heat haze
R({id:'fld-scorching-tick', stage:'board', inGameHook:'labSkillFx fieldTick heat → SkillFX.scorch', note:'2026-10-15 (user: "Looks too much like fax lines"): wavy, uneven, blurred ribbons at two drift speeds.',
  variants:[{key:'G', label:'Scorch with the new haze', play:ctx=>{ S().scorch(mine(ctx)[1]); return ctx.wait(2000); }}]});

// 32: the twin slash wipes off top to bottom
R({id:'raid-trench-hit', stage:'ui', inGameHook:'fight replay hit step → fxHook(replayHits) → FX.F.trenchHit',
  variants:[{key:'G', label:'Twin slash, wiped off from its top end down (0.22 s)', play:ctx=>{ const el = ctx.ui.results || ctx.root.querySelector('.card-tile'); return F().trenchHit(el); }}]});

// 13: day to night sweeps across with a ragged edge
function sweepSky(ctx, from, to){ const bf = ctx.board.el; bf.querySelectorAll(':scope > .sky-fx').forEach(x=> x.remove());
  const old = document.createElement('div'); old.className = 'sky-fx tone-' + from; old.setAttribute('aria-hidden', 'true'); bf.insertBefore(old, bf.firstChild); void old.offsetWidth;
  const nw = document.createElement('div'); nw.className = 'sky-fx sky-sweep tone-' + to; nw.setAttribute('aria-hidden', 'true'); old.after(nw); old.classList.add('sky-sweep', 'is-old'); void nw.offsetWidth;
  nw.classList.add('is-go'); old.classList.add('is-go'); setTimeout(()=>{ old.remove(); nw.classList.remove('sky-sweep', 'is-go'); }, 1450); }
function veil(ctx, on){ const bf = ctx.board.el; let v = bf.querySelector(':scope > .night-veil');
  if(!v){ v = document.createElement('div'); v.className = 'night-veil'; v.setAttribute('aria-hidden', 'true'); bf.insertBefore(v, bf.firstChild); void v.offsetWidth; }
  if(on){ v.classList.remove('is-leaving', 'is-gone'); v.classList.add('is-on'); return; }
  v.classList.add('no-anim', 'is-leaving'); void v.offsetWidth; v.classList.remove('no-anim'); void v.offsetWidth; v.classList.add('is-gone'); }
R({id:'dark-night-veil-in', stage:'board', inGameHook:'renderVfxForEvent phase → syncNightVeil / syncSkyFx',
  note:'2026-10-15 (user: "The transition from day to night should be gradual, and from left to right unevenly."): a ragged, soft edge sweeps the board in ~1.3 s.',
  variants:[{key:'G', label:'Before 10-16: night sweeps in from the left (ragged edge)', play:ctx=>{ ctx.sound('nightSwell'); ctx.sound('wolfHowl'); sweepSky(ctx, 'day', 'night'); veil(ctx, true); return ctx.wait(2200); }}]});
R({id:'dark-night-veil-out', stage:'board', inGameHook:'renderVfxForEvent phase → syncNightVeil / syncSkyFx', variants:[
  {key:'G', label:'Before 10-16: day comes back from the left (ragged edge)', play:async ctx=>{ sweepSky(ctx, 'day', 'night'); veil(ctx, true); await ctx.wait(1700); ctx.sound('dawnChime'); sweepSky(ctx, 'night', 'day'); veil(ctx, false); await ctx.wait(1900); }}]});

// 16: the dawn sound
R({id:'wt-day-breaks', stage:'board', inGameHook:'renderVfxForEvent phase day → SoundKit.dawnChime (was roosterCrow)', note:'2026-10-15 (user: "The turn to day sfx needs to be improved."): a soft rising chime and two birds.',
  variants:[{key:'G', label:'Dawn chime; birds on about 1 in 3 daybreaks (sound)', play:ctx=>{ ctx.sound('dawnChime'); sweepSky(ctx, 'night', 'day'); return ctx.wait(2200); }}]});

// 18: the Full Moon howl
R({id:'fld-moon-active', stage:'board', inGameHook:'fieldSet moon (and nightfall while the Full Moon is up) → SoundKit.moonHowl + moonHowlVfx',
  note:'2026-10-15 (user: "Full moon - if a full moon card is on the field, it howls similarly to night (maybe a tad different to differentiate)").',
  variants:[{key:'G', label:'Moon howl: one higher, longer wolf; silver rings', play:ctx=>{ ctx.sound('moonHowl'); try{ W.moonHowlVfx(); }catch(e){} return ctx.wait(3000); }}]});

// 51: wind on the field
R({id:'wt-wind-gust', stage:'board', inGameHook:'wind event → syncWindField → SkillFX.windField(#battlefieldEl, strength, north|south)',
  note:'2026-10-15 (user: "a soft windy vfx ... blowing south or north depending? Then Strong wind version"). Stays on while the wind blows.',
  variants:[
    {key:'G', label:'Soft breeze, blowing north (your side to theirs)', play:ctx=>{ S().windField(ctx.board.el, 'soft', 'north'); return ctx.wait(4500).then(()=> S().windFieldClear(ctx.board.el)); }},
    {key:'H', label:'Strong wind, blowing south', play:ctx=>{ S().windField(ctx.board.el, 'strong', 'south'); return ctx.wait(3500).then(()=> S().windFieldClear(ctx.board.el)); }},
  ]});
R({id:'wt-wind-calm', stage:'board', inGameHook:'calm round on a Windy map → SkillFX.windField soft, the way the last gust blew', variants:[
  {key:'G', label:'Soft breeze, blowing south', play:ctx=>{ S().windField(ctx.board.el, 'soft', 'south'); return ctx.wait(4500).then(()=> S().windFieldClear(ctx.board.el)); }}]});

// 20: the fight-start shuffle
R({id:'ui-deck-shuffle', stage:'board', inGameHook:'maybeDeckShuffle → deckShuffleVfx(both piles, {quiet:true})', note:'2026-10-15 (user: "I liked the previous shuffle animation - doesn\'t have to be too showy.").',
  variants:[{key:'G', label:'The split riffle again, toned down', play:ctx=>{ const ds = [...ctx.root.querySelectorAll('#deckWidgetTop, #deckWidgetBottom')]; W.deckShuffleVfx(ds.length ? ds : [ctx.root.querySelector('.deck-widget')], {quiet:true}); return ctx.wait(1000); }}]});

// 49: the armour badge glows when an armoured unit is hit
R({id:'atk-armor-block-partial', stage:'board', inGameHook:'hit impact → armorBadgeGlow (the 🛡 badge, .abadge.armor-glow, 0.5 s)',
  note:'2026-10-15 (user: "When a unit with armor gets hit, its armor context icon glows for 0.5s.").',
  variants:[{key:'G', label:'2026-10-16: a hit Armor cut down: the 🛡 badge glows and konks (metal)', play:ctx=>{ const el = foe(ctx)[1]; num(ctx, el, 2); ctx.sound('konk'); const b = el.querySelector('.badges .abadge') || el.querySelector('.abadge');
    if(b){ b.classList.remove('armor-glow'); void b.offsetWidth; b.classList.add('armor-glow'); setTimeout(()=> b.classList.remove('armor-glow'), 520); } else ctx.float(el, '(no badge on this card)', 'debuff'); return ctx.wait(900); }}]});
// 50: Bounty pays into the Lumber pill like a pitch
R({id:'death-bounty', stage:'board', inGameHook:'bounty event → itemDropVfx + resourceGainVfx to the Lumber pill (as a pitch)',
  note:'2026-10-15 (user: "The bounty skill doesn\'t do the +2 animation thing to my lumber count like how pitching does.").',
  variants:[{key:'G', label:'+2 🪵 flies to the Lumber pill, which bings', play:ctx=>{ const el = foe(ctx)[1], pill = ctx.root.querySelector('#hudLumberPill') || (ctx.board.pillsMine && ctx.board.pillsMine.querySelector('.hud-pill'));
    if(pill && typeof W.resourceGainVfx === 'function'){ if(!pill.id) pill.id = 'hudLumberPill'; W.resourceGainVfx(el.getBoundingClientRect(), [{amount:2, glyph:'🪵', pillId:pill.id}]); } else ctx.float(el, '+2 🪵', 'gold'); return ctx.wait(1000); }}]});
R({id:'castle-hp-number', stage:'board', inGameHook:'hitHQ → floatText(hqRibbonFloatAnchor(side)) — the castle damage number rises from the field\'s HP ribbon',
  note:'2026-10-15 (user: "The damage numbers to your castle should come from the battlefield respective HP bar instead").',
  variants:[{key:'G', label:'Before 10-16: the castle damage number off the middle of the field\'s HP ribbon', play:ctx=>{ const h = ctx.board.hpMine || ctx.board.hpFoe; if(!h) return ctx.wait(200);
    const bf = h.closest('.battlefield') || ctx.board.el, r = h.getBoundingClientRect(), b = bf.getBoundingClientRect(), a = document.createElement('div');
    a.style.cssText = `position:absolute; width:0; height:0; z-index:40; left:${r.left + r.width/2 - b.left}px; top:${r.top - b.top - 26}px;`; bf.appendChild(a); ctx.float(a, '-6', 'hq-big'); setTimeout(()=> a.remove(), 2000); return ctx.wait(1400); }}]});
})();
