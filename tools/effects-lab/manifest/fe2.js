// Field effects 2 lab registrations (2026-10-16, the user's field-effect curriculum notes): Landslide, Crushing Depths, Hail, the
// Glass-storm, the Lava Spout, the Leylines' burn, Mirage, Haunted's Frightened, Slippery, Rook's Row / Bishop's Path and
// Consternation. Each plays the live look: the same game CSS classes (crush-press, bw-sweep-*, mirage-shimmer, lava-geyser) and
// SkillFX calls field2Vfx (arena_app.js) uses. The rules are in bramblewood-engine.js (fieldEffects2Tick).
if(typeof window.floatDetachDepth === 'undefined') window.floatDetachDepth = 0;
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX || {};
const HOOK = 'field2Vfx (arena_app.js): ';
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe, all = ctx=> ctx.board.mine.concat(ctx.board.foe);
const pulse = (el, cls, ms)=>{ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=> el.classList.remove(cls), ms || 900); };
const at = el=>{ const r = el.getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height/2}; };
const shake = (ctx, el)=>{ if(el && ctx.gsap) ctx.gsap.timeline().to(el, {x:-5, duration:.05}).to(el, {x:5, duration:.07}).to(el, {x:0, duration:.05, clearProps:'x'}); };
// boardSweepVfx (arena_app.js): a band of colour across the board (the game's .bw-sweep-<kind> CSS).
const sweep = (ctx, kind, vertical, fromRight)=>{ const bf = ctx.board.el, r = bf.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'bw-sweep bw-sweep-' + kind;
  Object.assign(d.style, {left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px'}); document.body.appendChild(d);
  const b = document.createElement('div'); b.className = 'bw-sweep-band'; d.appendChild(b);
  if(vertical) ctx.gsap.fromTo(b, {yPercent:-120, opacity:.95}, {yPercent:120, duration:.75, ease:'power2.in', onComplete:()=> d.remove()});
  else ctx.gsap.fromTo(b, {xPercent: fromRight ? 120 : -120, opacity:.95}, {xPercent: fromRight ? -120 : 120, duration:.7, ease:'power1.inOut', onComplete:()=> d.remove()});
  setTimeout(()=> d.remove(), 1600); };
// eruptionGeyserVfx (arena_app.js): a lava column at the card's foot.
const geyser = el=>{ const r = el.getBoundingClientRect(), g = document.createElement('div'); g.className = 'lava-geyser'; g.style.left = (r.left + r.width/2) + 'px'; g.style.top = (r.bottom - 6) + 'px'; g.style.setProperty('--h', Math.round(r.height*1.25) + 'px');
  g.innerHTML = '<i class="lg-col"></i>' + Array.from({length:12}, (_, k)=> `<b style="--x:${Math.round((Math.random() - .5)*r.width*1.2)}px; --y:${-Math.round(r.height*(.6 + Math.random()*.8))}px; --d:${(k*.04).toFixed(2)}s"></b>`).join('');
  document.body.appendChild(g); setTimeout(()=> g.remove(), 1300); };
const hits = (ctx, els, glyph, n, each)=> els.forEach((el, i)=> setTimeout(()=>{ ctx.float(el, `${glyph}-${typeof n === 'function' ? n() : n}`, 'dmg'); shake(ctx, el); if(each) each(el); }, 120 + i*40));

R({id:'fld2-landslide', stage:'board', inGameHook:HOOK + "fieldTick landslide (the rumble and the rocks' band), landslideHit (each grounded unit)", note:'The flyers in a real fight are spared and show nothing.', variants:[
  {key:'A', label:'The board rumbles, rocks sweep down, chips fly off each unit', play:ctx=>{ ctx.sound('boom'); pulse(ctx.board.el, 'erupt-rumble', 700); sweep(ctx, 'landslide', true);
    hits(ctx, all(ctx), '🪨', 5, el=>{ const c = at(el); if(S().burst) S().burst(c.x, c.y - 24, 270, 'wood', 7); }); return ctx.wait(1500); }}]});
R({id:'fld2-crushing', stage:'board', inGameHook:HOOK + 'fieldTick crushingDepths (the press), crushingHit (each unit)', variants:[
  {key:'A', label:'A dark-blue weight presses in; water rings on every unit', play:ctx=>{ ctx.sound('splash'); pulse(ctx.board.el, 'crush-press', 900);
    hits(ctx, all(ctx), '🫧', ()=> (Math.random() < .5 ? 5 : 2), el=>{ const c = at(el); if(S().ring) S().ring(c.x, c.y, 'sfx-water', 110, 520); }); return ctx.wait(1400); }}]});
R({id:'fld2-hail', stage:'board', inGameHook:HOOK + 'fieldTick hail (the sweep), hailHit (each unit)', variants:[
  {key:'A', label:'Hailstones sweep down the board; ice chips on every unit', play:ctx=>{ ctx.sound('freezeChime'); sweep(ctx, 'hail', true);
    hits(ctx, all(ctx), '🌨️', 3, el=>{ const c = at(el); if(S().burst) S().burst(c.x, c.y - 20, 270, 'ice', 6); }); return ctx.wait(1400); }}]});
R({id:'fld2-glass-storm', stage:'board', inGameHook:HOOK + 'fieldTick glassStorm (the sweep), glassHit (each unit, 1–3)', variants:[
  {key:'A', label:'Sand full of glinting glass blows across; each unit is cut for 1–3', play:ctx=>{ ctx.sound('swipeTone'); sweep(ctx, 'glass', false, Math.random() < .5);
    hits(ctx, all(ctx), '💎', ()=> 1 + Math.floor(Math.random()*3), el=>{ const c = at(el); if(S().burst) S().burst(c.x, c.y, Math.random()*360, 'zap', 5); }); return ctx.wait(1400); }}]});
R({id:'fld2-lava-spout', stage:'board', inGameHook:HOOK + 'lavaSpoutHit → eruptionGeyserVfx on each unit in the column', variants:[
  {key:'A', label:'Lava bursts up through one column, both sides', play:ctx=>{ ctx.sound('boom'); [mine(ctx)[1], foe(ctx)[1]].forEach(el=>{ geyser(el); ctx.float(el, '♨️-3', 'heat'); }); return ctx.wait(1400); }}]});
R({id:'fld2-leylines', stage:'board', inGameHook:HOOK + 'fieldTick leylines (the violet line), leylinesHit (each unit; an Atheist shows "Atheist")', variants:[
  {key:'A', label:'A violet line runs across; every unit burns for 3; the Atheist shrugs', play:ctx=>{ ctx.sound('curse'); sweep(ctx, 'leylines', false);
    const at0 = mine(ctx)[0]; hits(ctx, all(ctx).filter(el=> el !== at0), '✴️', 3, el=>{ const c = at(el); if(S().ring) S().ring(c.x, c.y, 'sfx-violet', 90, 480); });
    setTimeout(()=> ctx.float(at0, '✴️ Atheist', 'quick'), 160); return ctx.wait(1400); }}]});
R({id:'fld2-mirage', stage:'board', inGameHook:HOOK + 'fieldTick mirage → .mirage-shimmer on the new Illusion, "🪞 Illusion"', variants:[
  {key:'A', label:'The Illusion shimmers into being', play:ctx=>{ const t = mine(ctx)[2]; pulse(t, 'mirage-shimmer', 1200); ctx.float(t, '🪞 Illusion', 'quick'); return ctx.wait(1400); }}]});
R({id:'fld2-haunted', stage:'board', inGameHook:HOOK + 'statusFx frightened → SkillFX.fearShiver, "👻 Frightened"', variants:[
  {key:'A', label:'A shiver of fear; it won\'t attack this round', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '👻 Frightened', 'debuff'); if(S().fearShiver) S().fearShiver(t); return ctx.wait(1200); }}]});
R({id:'fld2-slippery', stage:'board', inGameHook:HOOK + 'evaded {reason:slippery} → "⛸️ Slip!" on the attacker; slipFizzle → "⛸️ Slipped"', variants:[
  {key:'A', label:'A swing skids off; a skill fails', play:ctx=>{ ctx.float(mine(ctx)[1], '⛸️ Slip!', 'quick'); setTimeout(()=> ctx.float(foe(ctx)[0], '⛸️ Slipped', 'quick'), 500); return ctx.wait(1300); }}]});
R({id:'fld2-lanes', stage:'board', inGameHook:HOOK + 'hit {laneBonus, lane} → "♜ +2" / "♝ +2" over the target', variants:[
  {key:'A', label:"Rook's Row: a straight hit +2", play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '-5', 'dmg'); setTimeout(()=> ctx.float(t, '♜ +2', 'quick'), 160); return ctx.wait(1100); }},
  {key:'B', label:"Bishop's Path: a slanted hit +2", play:ctx=>{ const t = foe(ctx)[2]; ctx.float(t, '-5', 'dmg'); setTimeout(()=> ctx.float(t, '♝ +2', 'quick'), 160); return ctx.wait(1100); }}]});
R({id:'fld2-consternation', stage:'board', inGameHook:HOOK + 'fieldTick consternation (your side) → "😰 −1/−1" over the hand, which re-renders', variants:[
  {key:'A', label:'Your hand wilts a little', play:ctx=>{ const h = ctx.board.hand || ctx.board.el; ctx.float(h, '😰 −1/−1', 'debuff'); return ctx.wait(1100); }}]});
})();
