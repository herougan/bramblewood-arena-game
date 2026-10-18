// 2026-10-17 (wave, tide, boomerang): the user's notes 10, 11, 14 and 22 (22:48). The Wave / Awash push now rides a crest to its new
// slot (SkillFX.waveRide) or bobs in place when it is boxed in (SkillFX.waveBob); the Awash field; the boomerang's return is one flight
// that retraces the throw (SkillFX.boomerangReturn with the throw's key); the tide rocks every card (SkillFX.tideSway); flyers hover 15%
// higher and Tide units / Swimmers at half that. Each entry plays the game's own SkillFX function. Inventory: batch W17.
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX || {};
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const zoomOf = el=>{ try{ const w = el.offsetWidth; return w ? (el.getBoundingClientRect().width / w) || 1 : 1; }catch(e){ return 1; } };
// Move a stage card `by` places along its row (the lab's rows are packed), let the others glide, and ride the moved one there.
function ride(ctx, el, by, o){
  o = o || {}; const row = el.parentNode, all = [...row.children].filter(c=> c.classList && c.classList.contains('board-card')), i = all.indexOf(el);
  const j = Math.max(0, Math.min(all.length - 1, i + by)); if(j === i) return null;
  const before = new Map(all.map(c=> [c, c.getBoundingClientRect()])), sc = zoomOf(el);
  if(j > i) row.insertBefore(el, all[j].nextSibling); else row.insertBefore(el, all[j]);
  const g = ctx.gsap; all.forEach(c=>{ if(c === el || !g) return; const a = before.get(c), b = c.getBoundingClientRect(), dx = (a.left - b.left)/sc; if(Math.abs(dx) > 2) g.fromTo(c, {x:dx}, {x:0, duration:.3, ease:'power2.out', clearProps:'x'}); });
  S().waveRide(el, {from:before.get(el), dir:by < 0 ? 'left' : 'right', scale:sc, touch:o.touch ? [all[j]] : []});
  return true;
}
// The tide's water on the board (tideWaveVfx's classes; the sway is the new part).
function tideWater(ctx, kind){ const bf = ctx.board.el; bf.classList.toggle('tide-is-flow', kind === 'flow'); bf.classList.toggle('tide-is-ebb', kind === 'ebb');
  if(!bf.querySelector(':scope > .tide-line')){ const l = document.createElement('div'); l.className = 'tide-line'; bf.appendChild(l); }
  const w = document.createElement('div'); w.className = 'tide-wave is-' + kind; w.innerHTML = '<span></span><span></span>'; bf.appendChild(w); setTimeout(()=> w.remove(), 1600); }
// Give a stage card the game's hover markup: the tile inside a .fly-body, a .fly-shadow beside it, .is-flying or .is-floating.
function hover(el, cls){ const t = el.querySelector('.card-tile'); if(!t || el.querySelector('.fly-body')) return; const b = document.createElement('div'); b.className = 'fly-body' + (cls === 'is-floating' ? ' float-body' : '');
  t.parentNode.insertBefore(b, t); b.appendChild(t); const s = document.createElement('span'); s.className = 'fly-shadow' + (cls === 'is-floating' ? ' is-float' : ''); el.insertBefore(s, b); el.classList.add(cls); }

// ---- Wave (note 22). 2026-10-18 (user: "I think Wave and Awash refer to the same skill. We can call all of them wave for now."): Wave N,
// one push for the skill and the field: it rides N columns, and a unit in the way is crashed into (both take N). Nothing swaps now.
// The lab's rows are packed, so a ride here slides the neighbours over; in the game the unit rides into free columns.
// A crash: the pushed unit lurches into the one beside it (SkillFX.waveBob with that one as the touch), then both show the N (washCrash).
const crash = (ctx, t, other, dir, n)=>{ S().waveBob(t, {dir, scale:zoomOf(t), touch:[other].filter(Boolean)});
  setTimeout(()=>{ if(!ctx.alive()) return; ctx.sound('thud'); ctx.float(t, '💥 -' + n, 'dmg'); if(other) ctx.float(other, '💥 -' + n, 'dmg'); }, 380); };
R({id:'sk-wave', stage:'board', inGameHook:'renderVfxForEvent (arena_app.js) on wave {dir, moves, cols, crashUid} → the board re-renders, then SkillFX.waveRide(card, {from: its old rect, touch: the crashed-into unit}); blocked → SkillFX.waveBob; then washCrash → both shake and show the N',
  note:'2026-10-17: the card used to teleport (the old .wave-pushed CSS nudge overrode the board\'s glide). 2026-10-18: Wave N: N columns, a crash hurts both for N, no swaps; with no fixed way it leans inward 55/45 and only the board\'s edge turns it back.',
  variants:[
    {key:'C', label:'2026-10-17: it rides the crest one column over (the ride; the lab\'s packed row slides its neighbour over)', play:ctx=>{ ctx.sound('splash'); const t = foe(ctx)[1]; ctx.float(t, '〰️ →', 'quick'); ride(ctx, t, 1); return ctx.wait(1500); }},
    {key:'D', label:'2026-10-17: Wave 2: it rides two columns along', play:ctx=>{ ctx.sound('splash'); const t = foe(ctx)[0]; ctx.float(t, '〰️ → 2', 'quick'); ride(ctx, t, 2); return ctx.wait(1600); }},
    {key:'E', label:'2026-10-18: Wave 2 into a unit: it slams into the one beside it, and both take 2', play:ctx=>{ ctx.sound('splash'); const f = foe(ctx), t = f[1] || f[0], o = f[2] || f[0];
      ctx.float(t, '〰️ → 2', 'quick'); crash(ctx, t, o !== t ? o : null, 'right', 2); return ctx.wait(1700); }}]});
R({id:'sk-wave-bob', stage:'board', inGameHook:'renderVfxForEvent (arena_app.js) on wave {blocked, bob, touchUids} → SkillFX.waveBob(card, {touch})',
  note:'2026-10-18: with Wave N crashing into units, a bob is rare: a packed row with the unit alone, or a fixed-way Wave at the board\'s edge (blocked).',
  variants:[{key:'A', label:'Blocked: it bobs up and down as the crest rolls past; the units beside it rock a little', play:ctx=>{ ctx.sound('splash'); const f = foe(ctx), t = f[1] || f[0];
    ctx.float(t, '〰️ Bob', 'quick'); S().waveBob(t, {dir:'right', scale:zoomOf(t), touch:[f[0], f[2]].filter(x=> x && x !== t)}); return ctx.wait(1600); }}]});
// ---- The Wave field (note 11; rules.awash, the key kept for saves: the word "Awashed" is reserved for a future mechanic, 2026-10-18)
R({id:'fld2-awash', stage:'board', inGameHook:'field2Vfx (arena_app.js) on fieldTick {field:\'awash\', uid, n} ("〰️ Wave N"), then the wave event {awash:true}: SkillFX.waveRide, and washCrash on a crash',
  note:'rules.awash ("Wave" on screen): each round from round 2 one random unit rides a Wave 1–3 columns (Wave N with no fixed way); a unit in the way is crashed into, both take N.',
  variants:[
    {key:'A', label:'Wave 1: one column along', play:ctx=>{ ctx.sound('splash'); const t = mine(ctx)[1]; ctx.float(t, '〰️ Wave 1', 'quick'); ride(ctx, t, -1); return ctx.wait(1500); }},
    {key:'B', label:'Wave 3: it rides as far as the row goes', play:ctx=>{ ctx.sound('splash'); const t = mine(ctx)[0]; ctx.float(t, '〰️ Wave 3', 'quick'); ride(ctx, t, 3); return ctx.wait(1700); }},
    {key:'D', label:'2026-10-18: Wave 2 with a unit right beside it: it crashes into it, both take 2', play:ctx=>{ ctx.sound('splash'); const m = mine(ctx), t = m[1] || m[0], o = m[0] !== t ? m[0] : m[2];
      ctx.float(t, '〰️ Wave 2', 'quick'); crash(ctx, t, o || null, 'left', 2); return ctx.wait(1700); }}]});
// ---- Boomerang (note 10)
const throwAndReturn = (ctx, whiff)=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.sound('boomerangWhirr'); S().boomerangThrow(a, t, {flight:420, key:'lab'});
  setTimeout(()=>{ if(!ctx.alive()) return; ctx.float(a, '🪃 Boomerang returns!', 'quick'); ctx.sound('boomerangWhirr');
    if(whiff){ t.style.visibility = 'hidden'; S().boomerangReturn(a, null, {flight:420, key:'lab', whiff:true}); } else S().boomerangReturn(a, t, {flight:420, key:'lab', onImpact:()=> ctx.float(t, '-3', 'dmg')}); }, 1500);
  return ctx.wait(3000); };
R({id:'atk-boomerang-return', stage:'board', inGameHook:'renderVfxForEvent (arena_app.js): the return\'s hit / hitHQ (or boomerangWhiff) → SkillFX.boomerangReturn(thrower, target, {key, castle, whiff}); FX.A skips its own looks while it flies (SkillFX.boomerangInFlight)',
  note:'2026-10-17: there used to be two (FX.A.boomerangInbound on boomerangReturn, plus SkillFX.boomerangReturn dropping in from the top on the hit) and a third in the catch.',
  variants:[
    {key:'C', label:'2026-10-17: the throw, then next round one boomerang comes straight back along it, hits, and curves home into the hand', play:ctx=> throwAndReturn(ctx, false)},
    {key:'D', label:'2026-10-17: its target is gone: it flies back through the empty spot and is caught', play:ctx=> throwAndReturn(ctx, true)},
    {key:'E', label:'2026-10-17: a castle throw: it drops back in the way it left, strikes the castle and curves home', play:ctx=>{ const a = mine(ctx)[1], c = ctx.board.castleFoe; ctx.sound('boomerangWhirr');
      S().boomerangCastle(a, c, {flight:420, key:'labc'}); setTimeout(()=>{ if(ctx.alive()){ ctx.sound('boomerangWhirr'); S().boomerangReturn(a, c, {flight:420, key:'labc', castle:true}); } }, 1600); return ctx.wait(3100); }}]});
// ---- The tide (note 14)
const sway = (ctx, kind)=>{ ctx.sound(kind === 'flow' ? 'splash' : 'swipeTone'); hover(foe(ctx)[0], 'is-floating'); hover(mine(ctx)[0], 'is-floating'); hover(foe(ctx)[2] || foe(ctx)[1], 'is-flying');
  tideWater(ctx, kind); S().tideSway(mine(ctx).concat(foe(ctx)), {kind, scale:zoomOf(mine(ctx)[0])}); return ctx.wait(2200); };
R({id:'wt-tide-flow', stage:'board', inGameHook:'tideWaveVfx (arena_app.js) on tide {tide:\'flow\'} → the water, then SkillFX.tideSway(every board card)',
  variants:[{key:'B', label:'2026-10-17: the Flood rises from the foot of the board; every card rocks a little, the floating Tide units lift with it', play:ctx=> sway(ctx, 'flow')}]});
R({id:'wt-tide-ebb', stage:'board', inGameHook:'tideWaveVfx (arena_app.js) on tide {tide:\'ebb\'} → the water, then SkillFX.tideSway(every board card, {kind:\'ebb\'})',
  variants:[{key:'C', label:'2026-10-17: the Ebb drains from the top down; the cards settle a little as it goes', play:ctx=> sway(ctx, 'ebb')}]});
R({id:'st-hover-height', stage:'board', inGameHook:'CSS (arena_template.html): .board-card.is-flying .fly-body (flySoar) and .is-floating .fly-body (tideFloat), with their .fly-shadow',
  variants:[{key:'A', label:'Flyers hover 15% higher (10.4px); Tide units and Swimmers float at half that, with a wet shadow', play:ctx=>{ const f = foe(ctx), m = mine(ctx);
    hover(f[0], 'is-flying'); if(f[1]) hover(f[1], 'is-floating'); hover(m[0], 'is-floating'); if(m[1]) hover(m[1], 'is-flying'); return ctx.wait(4200); }}]});
})();
