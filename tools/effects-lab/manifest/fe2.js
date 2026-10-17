// Field effects lab registrations. 2026-10-16 (field effects 2): Landslide, Crushing Depths, Hail, the Glass-storm, the Lava Spout,
// the Leylines, Mirage, Haunted's Frightened, Slippery, Rook's Row / Bishop's Path and Consternation.
// 2026-10-17 (effects lab, user: "continue, build out the effects lab too."): every entry now plays the game's own field2Vfx
// (arena_app.js, copied into the lab by sync_fx_src.py) with the events the engine sends (fieldEffects2Tick), instead of a
// hand-made copy of it (which had, for one, the hail and the landslide's band falling top-down; the game's runs across). New: field
// effects 3 (Sulphur Fumes, Ash Rain, Ashy and Ashy after an Eruption, Arrow Slits), the volcano's Day 4 / Night 2 glow, High Canopy /
// Undergrowth, Tall Grass and Leylines I / II, each with its Environment card where it has no other look.
(function(){
const R = FXLAB.register, G = window.LabGame, S = ()=> window.SkillFX || {};
const HOOK = 'field2Vfx (arena_app.js): ';
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe, all = ctx=> ctx.board.mine.concat(ctx.board.foe);
const U = el=> G.uid(el);
const f2 = ev=> G.fire('field2Vfx', ev);
// The header event, then one hit event per unit a beat apart (the replay spaces them the same way).
const tick = (ctx, field, hits, extra)=>{ G.match(ctx, extra); f2({type:'fieldTick', field});
  (hits || []).forEach(([el, sub, dmg, more], i)=> setTimeout(()=>{ if(ctx.alive()) f2(Object.assign({type:'fieldTick', field:sub, uid:U(el), dmg}, more || {})); }, 160 + i*110)); };
const card = (ctx, key, opts)=> G.envCard(ctx, key, opts);

R({id:'fld2-landslide', stage:'board', inGameHook:HOOK + "fieldTick landslide (the rumble and the rocks' band), landslideHit (each grounded unit)", note:'Flyers and Mountain Climbers are spared and show nothing (the Cobalt Fledgling here).', variants:[
  {key:'A', label:'The board rumbles, a band of rocks rolls across, chips fly off each grounded unit', play:ctx=>{ card(ctx, 'landslide', {biome:'alpine'});
    tick(ctx, 'landslide', all(ctx).filter(el=> !el.classList.contains('is-flying')).map(el=> [el, 'landslideHit', 5])); return ctx.wait(1700); }}]});
R({id:'fld2-crushing', stage:'board', inGameHook:HOOK + 'fieldTick crushingDepths (the press), crushingHit (each unit)', variants:[
  {key:'A', label:'A dark-blue weight presses in; water rings on every unit (Swimmers take half)', play:ctx=>{ card(ctx, 'crushingDepths', {biome:'water'});
    tick(ctx, 'crushingDepths', all(ctx).map((el, i)=> [el, 'crushingHit', i === 1 ? 2 : 5, i === 1 ? {swimmer:true} : null])); return ctx.wait(1600); }}]});
R({id:'fld2-hail', stage:'board', inGameHook:HOOK + 'fieldTick hail (the sweep), hailHit (each unit)', variants:[
  {key:'A', label:'Hail streaks across the board; ice chips on every unit', play:ctx=>{ card(ctx, 'hail', {art:'frost', biome:'tundra'}); tick(ctx, 'hail', all(ctx).map(el=> [el, 'hailHit', 3])); return ctx.wait(1600); }}]});
R({id:'fld2-glass-storm', stage:'board', inGameHook:HOOK + 'fieldTick glassStorm (the sweep, either way), glassHit (each unit, 1–3)', variants:[
  {key:'A', label:'Sand full of glinting glass blows across; each unit is cut for 1–3', play:ctx=>{ card(ctx, 'glassStorm', {art:'sandstorm', biome:'desert'});
    tick(ctx, 'glassStorm', all(ctx).map(el=> [el, 'glassHit', 1 + Math.floor(Math.random()*3)])); return ctx.wait(1600); }}]});
R({id:'fld2-lava-spout', stage:'board', inGameHook:HOOK + 'fieldTick lavaSpout (the boom), lavaSpoutHit → eruptionGeyserVfx on each unit in the column', variants:[
  {key:'A', label:'Lava bursts up through one column, both sides', play:ctx=>{ card(ctx, 'lavaSpout', {art:'lavatide'}); tick(ctx, 'lavaSpout', [[mine(ctx)[1], 'lavaSpoutHit', 3], [foe(ctx)[1], 'lavaSpoutHit', 3]]); return ctx.wait(1600); }}]});
R({id:'fld2-leylines', stage:'board', inGameHook:HOOK + 'fieldTick leylines (the violet line), leylinesHit (each unit; an Atheist shows "Atheist")', note:'Leylines III. The castles also take 3 (leylinesCastle: the HP bars tick, no number of their own).', variants:[
  {key:'A', label:'Leylines III: a violet line runs across; every unit burns for 3; the Atheist shrugs', play:ctx=>{ card(ctx, 'leylines3', {biome:'cave'});
    const at0 = mine(ctx)[0]; tick(ctx, 'leylines', all(ctx).map(el=> el === at0 ? [el, 'leylinesHit', 0, {atheist:true}] : [el, 'leylinesHit', 3])); return ctx.wait(1700); }}]});
R({id:'fld2-mirage', stage:'board', inGameHook:HOOK + 'fieldTick mirage {illusionUid} → .mirage-shimmer on the new Illusion, "🪞 Illusion"', variants:[
  {key:'A', label:'The Illusion shimmers into being beside its unit', play:ctx=>{ card(ctx, 'mirage', {biome:'desert'}); G.match(ctx); f2({type:'fieldTick', field:'mirage', illusionUid:U(mine(ctx)[2])}); return ctx.wait(1900); }}]});
R({id:'fld2-haunted', stage:'board', inGameHook:HOOK + 'statusFx frightened → SkillFX.fearShiver, "👻 Frightened" (+ the 👻 badge, w2StatusBadges)', variants:[
  {key:'A', label:'A shiver of fear on one unit a side; they won\'t attack this round', play:ctx=>{ card(ctx, 'haunted', {art:'misty', biome:'cave'}); G.match(ctx);
    [foe(ctx)[1], mine(ctx)[0]].forEach((el, i)=> setTimeout(()=>{ if(!ctx.alive()) return; f2({type:'statusFx', kind:'frightened', targetUid:U(el)}); G.badge(el, '<span class="abadge frightened" title="Frightened">👻</span>'); }, i*380)); return ctx.wait(1700); }}]});
R({id:'fld2-slippery', stage:'board', inGameHook:HOOK + 'evaded {reason:slippery} → "⛸️ Slip!" on the attacker; slipFizzle → "⛸️ Slipped"', variants:[
  {key:'A', label:'A swing skids off; a skill fails', play:ctx=>{ card(ctx, 'slippery', {art:'freezing', biome:'tundra', short:'Swings and triggers fail 1 in 2'}); G.match(ctx); const a = mine(ctx)[1];
    G.lunge(a, true); setTimeout(()=> f2({type:'evaded', reason:'slippery', attUid:U(a), targetUid:U(foe(ctx)[1])}), 560); setTimeout(()=> ctx.alive() && f2({type:'slipFizzle', uid:U(foe(ctx)[0])}), 1100); return ctx.wait(1900); }}]});
R({id:'fld2-lanes', stage:'board', inGameHook:HOOK + 'hit {laneBonus, lane} → "♜ +2" / "♝ +2" over the target', variants:[
  {key:'A', label:"Rook's Row: a straight hit +2", play:ctx=>{ card(ctx, 'rookRow', {biome:'cave'}); G.match(ctx, {_rules:{rookRow:true}}); const a = mine(ctx)[1], t = foe(ctx)[1]; G.lunge(a, true);
    setTimeout(()=>{ ctx.float(t, '-5', 'dmg'); f2({type:'hit', laneBonus:2, lane:'rook', attUid:U(a), targetUid:U(t), dmg:5}); }, 560); return ctx.wait(1500); }},
  {key:'B', label:"Bishop's Path: a slanted hit +2", play:ctx=>{ card(ctx, 'bishopPath', {biome:'cave'}); G.match(ctx, {_rules:{bishopPath:true}}); const a = mine(ctx)[1], t = foe(ctx)[2]; G.lunge(a, true);
    setTimeout(()=>{ ctx.float(t, '-5', 'dmg'); f2({type:'hit', laneBonus:2, lane:'bishop', attUid:U(a), targetUid:U(t), dmg:5}); }, 560); return ctx.wait(1500); }}]});
R({id:'fld2-consternation', stage:'board', inGameHook:HOOK + 'fieldTick consternation (your side) → "😰 −1/−1" over the hand, which re-renders; a played card keeps the 😰 badge', variants:[
  {key:'A', label:'Your hand wilts a little; the card you play keeps its 😰', play:ctx=>{ card(ctx, 'consternation', {biome:'cave'}); G.match(ctx); f2({type:'fieldTick', field:'consternation', side:'A', amount:1});
    setTimeout(()=> ctx.alive() && G.badge(mine(ctx)[0], '<span class="abadge consterned" title="Consternation">😰</span>'), 700); return ctx.wait(1600); }}]});

// ---- 2026-10-16 rules with no look of their own: the Environment card, and the number the rule changes ----
R({id:'fld2-canopy', stage:'board', inGameHook:'Environment card (fieldCondCardHTML); evaded {reason:canopy} → the Evasive dodge; Pounce +2 is in the number', note:'High Canopy (Map 13) and Undergrowth (Map 15, without the Flying and Bounty parts). The dodge is the ordinary Evasive dodge (SkillFX.evasiveDodge); the battle log says "darts through the branches".',
  variants:[
    {key:'A', label:'High Canopy: a Quick unit darts through the branches (Evasive)', play:ctx=>{ card(ctx, 'canopy', {biome:'forest'}); const a = foe(ctx)[1], t = mine(ctx)[1]; G.lunge(a, false);
      return ctx.wait(480).then(()=>{ ctx.sound('dodge'); if(S().evasiveDodge) S().evasiveDodge(t, {fromLeft:false}); ctx.float(t, 'Evaded!', 'quick'); return ctx.wait(1100); }); }},
    {key:'B', label:'Undergrowth: Pounce +2 (the leap deals 4 where it would deal 2)', play:ctx=>{ card(ctx, 'undergrowth', {biome:'forest'}); const a = mine(ctx)[0], t = foe(ctx)[0];
      if(S().pounceOnto) S().pounceOnto(a, t, {}); return ctx.wait(620).then(()=>{ ctx.float(t, '-4', 'dmg'); return ctx.wait(1000); }); }}]});
R({id:'fld2-tall-grass', stage:'board', inGameHook:HOOK + 'hit {tallGrass} → "🌾 ×2" over the target (Backstab hits, Pounce)', note:'Stealth units also attack first under Tall Grass (the order, no look).', variants:[
  {key:'A', label:'A Pounce in the tall grass deals double: "🌾 ×2"', play:ctx=>{ card(ctx, 'tallGrass', {biome:'forest'}); G.match(ctx); const a = mine(ctx)[0], t = foe(ctx)[0];
    if(S().pounceOnto) S().pounceOnto(a, t, {}); setTimeout(()=>{ ctx.float(t, '-4', 'dmg'); f2({type:'hit', tallGrass:true, attUid:U(a), targetUid:U(t), dmg:4}); }, 620); return ctx.wait(1700); }}]});
R({id:'fld2-leylines-1', stage:'board', inGameHook:'Environment card; the zeitgebers\' stat bonus (phase grow) is bigger', note:'Leylines I has no look of its own: the day / night / tide / moon bonuses are bigger, so the numbers are.', variants:[
  {key:'A', label:'By day a plain Diurnal unit is +3/+3 (+2/+2 more)', play:ctx=>{ card(ctx, 'leylines1', {biome:'cave'}); const el = mine(ctx)[1]; ctx.float(el, '☀️ +3/+3', 'gold stat-up');
    el.querySelectorAll('.stats .atk, .stats .hp').forEach(p=>{ p.classList.remove('stat-pump'); void p.offsetWidth; p.classList.add('stat-pump'); }); return ctx.wait(1500); }}]});
R({id:'fld2-leylines-2', stage:'board', inGameHook:'lumber {leylines} → resourceGainVfx into each side\'s Lumber pill', note:'Both sides, every round from round 2 (Leylines III adds a Stone).', variants:[
  {key:'A', label:'+1 🪵 for each side, into the Lumber pills', play:ctx=>{ card(ctx, 'leylines2', {biome:'cave'}); const p1 = G.pill(ctx, 'A', 3), p2 = G.pill(ctx, 'B', 2), from = ctx.board.field.getBoundingClientRect();
    try{ resourceGainVfx(from, [{amount:1, glyph:'🪵', pillId:p1.id}]); setTimeout(()=> resourceGainVfx(from, [{amount:1, glyph:'🪵', pillId:p2.id}]), 160); }catch(e){} ctx.sound('gold'); return ctx.wait(1500); }}]});

// ---- Field effects 3 (2026-10-17, the volcano and the castle maps) ----
R({id:'fld3-sulphur-fumes', stage:'board', inGameHook:HOOK + 'fieldTick sulphurFumes (a soft yellow sweep), statusFx choking → "💨 −1" on each unit that chokes', note:'20-A-2 The Wraith Vents, 20-A-6 The Vent Crabs, 22-2 Steam Vents. Fire-resistant, Dry and Flying units don\'t choke.', variants:[
  {key:'A', label:'Fumes roll across; the units that breathe them in choke (−1 Attack this round)', play:ctx=>{ card(ctx, 'sulphurFumes', {art:'misty'}); G.match(ctx); f2({type:'fieldTick', field:'sulphurFumes', count:4, amount:1});
    all(ctx).filter(el=> !el.classList.contains('is-flying')).forEach((el, i)=> setTimeout(()=> ctx.alive() && f2({type:'statusFx', kind:'choking', targetUid:U(el), amount:1}), 260 + i*110)); return ctx.wait(1800); }}]});
R({id:'fld3-ash-rain', stage:'board', inGameHook:HOOK + 'fieldTick ashRain (the grey sweep and a boom); ashRainCastle has no look (the HP bars tick)', note:'Both castles take 1 a round (never below 1); day bonuses are halved, as under Cloudy. 22-6 Ashfall Cornice.', variants:[
  {key:'A', label:'Grey ash streaks across the board with a dull boom', play:ctx=>{ card(ctx, 'ashRain', {art:'eruption'}); G.match(ctx); f2({type:'fieldTick', field:'ashRain', amount:1}); return ctx.wait(1500); }}]});
R({id:'fld3-ashy', stage:'board', inGameHook:HOOK + 'fieldTick ashy (the rumble, after an Eruption); evaded {reason:ashy} → "🌫️ Lost in ash" on the attacker', note:'Flyers are grounded (no Flying dodge, no Tailwind or Headwind); attacks at units miss 1 in 5. Darksight, Keen Sense and Sonar see through it.', variants:[
  {key:'A', label:'After an Eruption: the board rumbles and the ground turns Ashy (4 rounds)', play:ctx=>{ card(ctx, 'ashy', {art:'eruption', name:'Ashy (after an Eruption)', short:'An Eruption leaves the ground Ashy'}); G.match(ctx); f2({type:'fieldTick', field:'ashy'}); return ctx.wait(1500); }},
  {key:'B', label:'A swing lost in the ash: "🌫️ Lost in ash"', play:ctx=>{ card(ctx, 'ashy', {art:'eruption'}); G.match(ctx); const a = mine(ctx)[1]; G.lunge(a, true);
    setTimeout(()=>{ ctx.float(foe(ctx)[1], 'Miss!', 'quick'); f2({type:'evaded', reason:'ashy', attUid:U(a), targetUid:U(foe(ctx)[1])}); }, 560); return ctx.wait(1600); }}]});
R({id:'fld3-arrow-slits', stage:'board', inGameHook:HOOK + 'fieldTick arrowSlits (the twang), arrowSlitHit on one of your units ("🏹 -2"); none → it thuds into the ground', note:'From 23-5 on (Goldfeather Siege) and on Goldfeather Keep. A Helmet can turn the arrow.', variants:[
  {key:'A', label:'The walls loose an arrow at one of your units: "🏹 -2"', play:ctx=>{ card(ctx, 'arrowSlits', {art:'gale'}); G.match(ctx); f2({type:'fieldTick', field:'arrowSlits'});
    const t = mine(ctx)[Math.floor(Math.random()*mine(ctx).length)]; setTimeout(()=> ctx.alive() && f2({type:'fieldTick', field:'arrowSlitHit', uid:U(t), dmg:2}), 260); return ctx.wait(1500); }}]});
// The volcano's glow (2026-10-17): Day 4 rounds, Night 2 on Maps 20, 20-A and 22. The phase pill counts each half on its own length.
const phasePill = (ctx, phase, i, n)=>{ const host = ctx.root.querySelector('#bfPills'); if(!host) return null;
  const ico = phase === 'night' ? '🌙' : '☀️', name = phase === 'night' ? 'Night' : 'Day';
  host.innerHTML = `<button type="button" class="phase-pill bf-pill phase-${phase}" aria-expanded="false" aria-label="${name}, round ${i} of ${n}"><span aria-hidden="true">${ico}</span><small>${i}/${n}</small><span class="tp-tip" role="tooltip"><b class="pt-h">${name}</b></span></button>`;
  const p = host.firstElementChild; p.classList.remove('bing'); void p.offsetWidth; p.classList.add('bing'); setTimeout(()=> p.classList.remove('bing'), 450); return p; };
R({id:'wt-volcano-glow', stage:'board', inGameHook:'phasePillHTML (arena_app.js): engine.phaseStepInfo → "2/4" by day, "1/2" by night; the Environment card\'s Volcano Glow row', note:'Per-fight rule (phaseDay / phaseNight); Edit skirmish has a Day / Night box.',
  variants:[{key:'A', label:'The phase pill counts Day 1/4 … 4/4, then Night 1/2, 2/2', play:async ctx=>{ card(ctx, 'volcanoGlow', {icon:'🌋', name:'Volcano Glow', short:'Day 4 rounds, Night 2', art:'twilight'});
    for(const [ph, i, n] of [['day', 1, 4], ['day', 2, 4], ['day', 3, 4], ['day', 4, 4], ['night', 1, 2], ['night', 2, 2]]){ if(!ctx.alive()) return; phasePill(ctx, ph, i, n); await ctx.wait(650); } await ctx.wait(500); }}]});
})();
