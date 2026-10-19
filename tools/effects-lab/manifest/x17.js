// 2026-10-17 effects-lab pass (user, 21:47: "continue, build out the effects lab too."): everything visual or audible the game gained
// from 2026-10-16 to 2026-10-17 (docs/CHANGELOG.md) that the lab didn't show yet, or showed in its old look. Each entry plays the
// game's own function where there is one (copied into the lab by sync_fx_src.py, tools/effects-lab/fx-src-extra.txt), fed the event
// the engine sends; LabGame (manifest/_game.js) stands in for matchState and the board lookups. On an entry that already existed the
// new look takes a free key and says "2026-10-17" (or the date it changed); the old look stays where it was, relabelled "Before".
// Contract: docs/effects-lab-contract.md. Inventory: docs/effects-inventory-2026-10-15.json (batch L17).
(function(){
const R = FXLAB.register, G = window.LabGame, W = window, S = ()=> window.SkillFX || {}, FXA = ()=> (window.FX || {}).A || {}, FXE = ()=> (window.FX || {}).E || {}, FXB = ()=> (window.FX || {}).B || {};
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const U = el=> G.uid(el);
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const cls = (el, c, ms)=>{ if(!el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); setTimeout(()=> el.classList.remove(c), ms || 900); };
const later = (ctx, ms, fn)=> setTimeout(()=>{ if(ctx.alive()) try{ fn(); }catch(e){ console.error('[x17]', e); } }, ms);

// ============================== skills ==============================
// Devilry payments (2026-10-16): devilPayVfx looks the castle / ally up 0.48–0.52 s after the play (the board re-renders), then
// devilPulse sinks a dark ⛧ into it with "⛧ -N".
R({id:'sk-penance', stage:'board', inGameHook:'devilPayVfx (arena_app.js) on penance {side, dmg} → devilPulse(hqTileEl(side)) + "⛧ -N"', note:'A payment, not a hit: Armor, Bulwark and Shield don\'t stop it; a castle never pays below 1.',
  variants:[{key:'A', label:'A dark ⛧ sinks into your own castle: "⛧ -3"', play:ctx=>{ G.match(ctx); G.fire('devilPayVfx', {type:'penance', side:'A', dmg:3, amount:3, defId:'x'}); return ctx.wait(1700); }}]});
R({id:'sk-blood-tithe', stage:'board', inGameHook:'devilPayVfx (arena_app.js) on bloodTithe {targetUid | castle} → devilPulse on the ally that pays (or your castle)',
  variants:[
    {key:'A', label:'A random ally pays in blood: "⛧ -2"', play:ctx=>{ G.match(ctx); G.fire('devilPayVfx', {type:'bloodTithe', side:'A', targetUid:U(mine(ctx)[2]), dmg:2}); return ctx.wait(1700); }},
    {key:'B', label:'No ally on the field: your castle pays', play:ctx=>{ G.match(ctx); G.fire('devilPayVfx', {type:'bloodTithe', side:'A', castle:true, dmg:2}); return ctx.wait(1700); }}]});
// Amore (2026-10-16): skills2Vfx floats hearts between the pair (floatGlyphs) and "💕 +0/+3" on both; when one dies the other's heart turns brown.
R({id:'sk-amore', stage:'board', inGameHook:'skills2Vfx (arena_app.js) on amore {uid, mateUid, hp, regen} → floatGlyphs both ways + "💕 +0/+3"', note:'Two Amore units of yours sharing a Type pair up once: +0/+3 and Regeneration 3 each; the details say "In love".',
  variants:[{key:'A', label:'They pair up: hearts drift between them, +0/+3 each', play:ctx=>{ G.match(ctx); [0, 1].forEach(i=> G.badge(mine(ctx)[i], G.chip('amore', '💕')));
    G.fire('skills2Vfx', {type:'amore', uid:U(mine(ctx)[0]), mateUid:U(mine(ctx)[1]), hp:3, regen:3}); return ctx.wait(2000); }}]});
R({id:'sk-amore-broken', stage:'board', inGameHook:'skills2Vfx (arena_app.js) on amoreBroken {uid} → "🤎 Heartbroken" + a brown heart and a broken one', note:'It keeps +0/+3 and loses Regeneration 3; the details say "Heartbroken".',
  variants:[{key:'A', label:'Its partner falls; the other is heartbroken 🤎', play:ctx=>{ G.match(ctx); [0, 1].forEach(i=> G.badge(mine(ctx)[i], G.chip('amore', '💕')));
    try{ fallDeathVfx(mine(ctx)[0]); }catch(e){} later(ctx, 900, ()=> G.fire('skills2Vfx', {type:'amoreBroken', uid:U(mine(ctx)[1])})); return ctx.wait(2300); }}]});
// On Pitch ("Scavenge - …", 2026-10-16): every unit of yours with an On Pitch trigger reacts when you pitch a card; its ♻️ badge glows
// (triggerFiredVfx) and the action plays.
R({id:'sk-scavenge', stage:'board', inGameHook:'pitch → triggerFired {hook:onPitch} for each of your On Pitch units → triggerFiredVfx (the ♻️ badge glows), then the action', note:'"Scavenge" is a placeholder name; the trigger is on no card yet. Its badge leads with ♻️.',
  variants:[{key:'A', label:'You pitch a card; each Scavenge unit\'s ♻️ badge glows and it heals 1', play:ctx=>{ G.match(ctx);
    const h = (ctx.board.hand || [])[0]; if(h && ctx.gsap) ctx.gsap.to(h, {y:60, opacity:0, duration:.45, ease:'power2.in'}); ctx.sound('pitch');
    const us = mine(ctx).slice(0, 2); us.forEach(el=> G.badge(el, G.trig('onPitch', '♻️', '❤️')));
    us.forEach((el, i)=> later(ctx, 500 + i*160, ()=>{ G.fire('triggerFiredVfx', {uid:U(el), hook:'onPitch'}); ctx.float(el, '+1', 'heal'); })); return ctx.wait(1800); }}]});
R({id:'sk-lumber-burn', stage:'board', inGameHook:'skills2Vfx (arena_app.js) on lumberBurn {side, uid} → "🔥 -1" on your Lumber pill and an ember to the unit', note:'A trigger\'s "Pay: Burn 1 Lumber" (no Lumber: the trigger doesn\'t go off). Meant for Map 20 (On Attack → Burn 1 Lumber → Fire on hit).',
  variants:[{key:'A', label:'An ember leaves the Lumber pill for the unit', play:ctx=>{ G.match(ctx); G.pill(ctx, 'A', 3); G.fire('skills2Vfx', {type:'lumberBurn', side:'A', uid:U(mine(ctx)[1]), left:2}); return ctx.wait(1500); }}]});
R({id:'sk-fire-on-hit', stage:'board', inGameHook:'skills2Vfx (arena_app.js) on fireHit {targetUid | castle, dmg} → "🔥 -N" and two flames on what it hit, at the hit\'s impact', note:'The trigger action Fire on hit N: this attack\'s hit also deals N fire damage.',
  variants:[{key:'A', label:'The swing lands, then the flare: "🔥 -2" more', play:ctx=>{ G.match(ctx); const a = mine(ctx)[1], t = foe(ctx)[1]; G.lunge(a, true); later(ctx, 560, ()=> ctx.float(t, '-3', 'dmg'));
    G.fire('skills2Vfx', {type:'fireHit', attUid:U(a), targetUid:U(t), dmg:2}); return ctx.wait(1700); }}]});
R({id:'sk-pounce-stat', stage:'board', inGameHook:'play → the pounce hit (pounce:true) → SkillFX.pounceOnto; the card text\'s live number is blue on the board', note:'Pounce <Att> / <Hp>: the leap deals the card\'s own Attack or Health, worked out as it lands. In hand it reads "Pounce <Att>".',
  variants:[
    {key:'A', label:'Pounce <Att>: the leap deals its Attack (3)', play:ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.float(a, '🐾 ⚔3', 'quick'); if(S().pounceOnto) S().pounceOnto(a, t, {}); later(ctx, 620, ()=> ctx.float(t, '-3', 'dmg')); return ctx.wait(1700); }},
    {key:'B', label:'Pounce <Hp>: the leap deals its Health (5)', play:ctx=>{ const a = mine(ctx)[0], t = foe(ctx)[0]; ctx.float(a, '🐾 ❤5', 'quick'); if(S().pounceOnto) S().pounceOnto(a, t, {}); later(ctx, 620, ()=> ctx.float(t, '-5', 'dmg')); return ctx.wait(1700); }}]});
// Reflect (2026-10-17, reworked): a shot aimed at it bounces off to a random unit on the shooter's side.
R({id:'atk-reflect', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on reflectShot {uid, targetUid | castle} → "🪞 Reflect!" + SkillFX.mirrorFlash, then the bounced shot\'s own hit',
  variants:[{key:'G', label:'2026-10-17: the arrow bounces off (🪞 Reflect!) and hits a unit on the shooter\'s side', play:ctx=>{ G.match(ctx); const sh = foe(ctx)[1], d = mine(ctx)[1], t = foe(ctx)[2];
    ctx.sound('bowRelease'); if(S().bowShot) S().bowShot(sh, d, {});
    later(ctx, 520, ()=>{ G.fire('s17SkillVfx', {type:'reflectShot', uid:U(d), targetUid:U(t)}); if(S().bowShot) S().bowShot(d, t, {draw:60, onImpact:()=> ctx.alive() && ctx.float(t, '-2', 'dmg')}); }); return ctx.wait(1900); }},
    {key:'H', label:'2026-10-17: a shot reflected into the castle', play:ctx=>{ G.match(ctx); const sh = foe(ctx)[1], d = mine(ctx)[1], c = ctx.board.castleFoe;
    if(S().bowShot) S().bowShot(sh, d, {}); later(ctx, 520, ()=>{ G.fire('s17SkillVfx', {type:'reflectShot', uid:U(d), castle:true, targetSide:'B'}); if(S().bowShot && c) S().bowShot(d, c, {draw:60, onImpact:()=>{ if(ctx.alive()) try{ floatText(hqRibbonFloatAnchor('B') || c, '-2', 'hq-big'); }catch(e){} }}); }); return ctx.wait(1900); }}]});
// Ambush N (2026-10-16 / 10-17): it strikes any enemy that enters the slot facing it: played, spawned, or moved in (Wave, Tornado,
// Restless, a Bloodlust leap). The strike is FX.A.ambushStrike (the hit with ambush:true).
R({id:'atk-ambush', stage:'board', inGameHook:'watchScan (engine) → ambush {moved} then the hit {ambush:true} → FX.A.ambushStrike; log "ambushes X as it moves in"',
  variants:[{key:'C', label:'2026-10-17: an enemy slides into the slot it watches (a Bloodlust leap, a Wave) and it springs out (3)', play:ctx=>{ const a = mine(ctx)[2], t = foe(ctx)[2];
    if(ctx.gsap) ctx.gsap.from(t, {x:-80, duration:.4, ease:'power2.out'}); ctx.float(t, '→', 'quick');
    later(ctx, 450, ()=>{ ctx.sound('ambushTone'); if(FXA().ambushStrike) FXA().ambushStrike(a, t); }); later(ctx, 900, ()=>{ G.lunge(a, true); }); later(ctx, 1450, ()=> ctx.float(t, '-3', 'dmg')); return ctx.wait(2200); }}]});
// Vanguard (2026-10-17): the first card of the game gets +N/+N; the opening-hand move is only a battle-log line in the game.
R({id:'sk-vanguard', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on statusFx vanguard → "🎖️ +1/+1" 0.38 s after the play; vanguard (the opening hand) → log line only', note:'At the start of the game the next Vanguard card moves into your opening hand and a random card from it is discarded; the game shows that only in the battle log (B is the lab\'s sketch of it).',
  variants:[
    {key:'A', label:'Played as your first card: "🎖️ +1/+1"', play:ctx=>{ G.match(ctx); const el = mine(ctx)[1]; G.badge(el, G.chip('vanguard', '🎖️'));
      if(ctx.gsap) ctx.gsap.from(tileOf(el), {y:40, opacity:0, duration:.35, ease:'back.out(1.6)'}); G.fire('s17SkillVfx', {type:'statusFx', kind:'vanguard', targetUid:U(el), attDefId:'x', amount:1}); return ctx.wait(1500); }},
    {key:'B', label:'Lab sketch: the Vanguard card slides to the front of the opening hand (the game: a log line)', play:ctx=>{ const h = ctx.board.hand || []; if(h.length < 2 || !ctx.gsap) return ctx.wait(400);
      const last = h[h.length - 1], first = h[0]; ctx.gsap.timeline().to(last, {y:-26, scale:1.08, duration:.25}).to(last, {x:(first.getBoundingClientRect().left - last.getBoundingClientRect().left), duration:.45, ease:'power2.inOut'}).to(last, {y:0, scale:1, duration:.2});
      ctx.float(last, '🎖️ Vanguard', 'gold'); later(ctx, 600, ()=> ctx.gsap.to(h[1], {opacity:.25, y:30, duration:.4})); return ctx.wait(1600); }}]});
R({id:'sk-web', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on statusFx webbed → "🕸️ Webbed" + SkillFX.vineBind; the 🕸️N status badge (w2StatusBadges); statusEnd webbed takes it off', note:'Webbed: can\'t dodge (no Evasive, Swift, Flying, Prey or Tide dodge) and can\'t move or be moved.',
  variants:[
    {key:'A', label:'Its hit webs the target: "🕸️ Webbed", the threads bind it', play:ctx=>{ G.match(ctx); const a = mine(ctx)[1], t = foe(ctx)[1]; G.badge(a, G.chip('web', '🕸️')); G.lunge(a, true);
      later(ctx, 560, ()=>{ ctx.float(t, '-3', 'dmg'); G.fire('s17SkillVfx', {type:'statusFx', kind:'webbed', targetUid:U(t), attDefId:'x', amount:2}); G.badge(t, '').outerHTML = '<span class="abadge webbed" title="Webbed">🕸️2</span>'; }); return ctx.wait(1700); }},
    {key:'B', label:'A Webbed unit can\'t dodge: the Evasive roll never comes', play:ctx=>{ const t = mine(ctx)[1], a = foe(ctx)[1]; const b = G.badge(t, ''); b.outerHTML = '<span class="abadge webbed" title="Webbed">🕸️1</span>'; G.lunge(a, false);
      later(ctx, 560, ()=>{ ctx.float(t, '-3', 'dmg'); if(S().vineBind) S().vineBind(t, {}); }); return ctx.wait(1500); }}]});
// Bloodlust (2026-10-17, reworked): on the kill it leaps to face the nearest enemy creature with a free slot in front of it.
R({id:'sk-bloodlust-leap', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on bloodlustLeap {uid, from, to} → the unit moves to its new slot (renderBoard), "🩸 Leap!", a red push (.wave-pushed) and SkillFX.bloodlustPulse({full})', note:'The leap counts as entering: an enemy Ambush or Sentry facing the new slot strikes it. Half damage to Structures and castles.',
  variants:[{key:'A', label:'It kills the unit facing it, then leaps sideways to face the next foe', play:ctx=>{ G.match(ctx); const a = mine(ctx)[0], dead = foe(ctx)[0], next = foe(ctx)[1];
    G.badge(a, G.chip('bloodlust', '🩸')); G.lunge(a, true); later(ctx, 560, ()=>{ ctx.float(dead, '-6', 'dmg'); try{ fallDeathVfx(dead); }catch(e){} });
    later(ctx, 1150, ()=>{ const dx = next.getBoundingClientRect().left - a.getBoundingClientRect().left; const z = parseFloat(getComputedStyle(ctx.root.querySelector('#appWrap')).zoom) || 1;
      if(ctx.gsap) ctx.gsap.to(a, {x:dx / z, duration:.3, ease:'power2.out'}); later(ctx, 320, ()=> G.fire('s17SkillVfx', {type:'bloodlustLeap', side:'A', uid:U(a), from:-1, to:0, targetUid:U(next)})); });
    return ctx.wait(2600); }}]});
R({id:'sk-sentry', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on sentry {uid, targetUid} → "🗼 Sentry!" + ambushTone; then its strike (the hit that follows)', note:'Once a round, while Ready, it attacks an enemy unit that enters one of the 3 slots facing it.',
  variants:[{key:'A', label:'An enemy steps into a slot it watches: "🗼 Sentry!" and it strikes', play:ctx=>{ G.match(ctx); const s = mine(ctx)[1], t = foe(ctx)[2]; G.badge(s, G.chip('sentry', '🗼'));
    if(ctx.gsap) ctx.gsap.from(tileOf(t), {y:-50, opacity:0, duration:.35, ease:'power2.in'}); later(ctx, 420, ()=>{ G.fire('s17SkillVfx', {type:'sentry', uid:U(s), targetUid:U(t)}); G.lunge(s, true); });
    later(ctx, 980, ()=> ctx.float(t, '-2', 'dmg')); return ctx.wait(1800); }}]});
R({id:'sk-carrion', stage:'board', inGameHook:'s17SkillVfx (arena_app.js) on statusFx carrion → "🦴 +N" (heal) when another unit dies', note:'Carrion N: heal N whenever another unit dies (any side). The Ossuary Lammergeier carries it.',
  variants:[{key:'A', label:'A unit falls; the carrion bird feeds: "🦴 +2"', play:ctx=>{ G.match(ctx); const c = mine(ctx)[2]; G.badge(c, G.chip('carrion', '🦴', 2)); try{ fallDeathVfx(foe(ctx)[1]); }catch(e){}
    later(ctx, 900, ()=> G.fire('s17SkillVfx', {type:'statusFx', kind:'carrion', targetUid:U(c), attDefId:'x', amount:2})); return ctx.wait(1900); }}]});
// Strangle (W2, 2026-10-16): the round-start squeeze of a Bound unit (the last inventory entry the lab hadn't built).
R({id:'st-strangle-tick', stage:'board', inGameHook:'w2SkillVfx (arena_app.js) on strangleTick {uid, dmg} → "🪢 -N" + SkillFX.squeeze',
  variants:[{key:'A', label:'The vines squeeze it from both sides: "🪢 -2"', play:ctx=>{ G.match(ctx); const t = foe(ctx)[1]; G.badge(t, '').outerHTML = '<span class="abadge bound" title="Bound">🪢1</span>';
    G.fire('w2SkillVfx', {type:'strangleTick', uid:U(t), dmg:2}); return ctx.wait(1500); }}]});
// The passives with no look of their own (2026-10-17): the chip on the skill strip and the bigger number are what you see.
const passive = (id, key, glyph, n, note, label, run)=> R({id, stage:'board', inGameHook:'no event of its own: the ' + glyph + ' chip on the skill strip (abilityBadges, CHIP_FALLBACK_SKILLS) and the number it changes', note,
  variants:[{key:'A', label, play:ctx=>{ G.match(ctx); return run(ctx, glyph, n); }}]});
passive('sk-hoard', 'hoard', '🐿️', 2, 'Hoard N: +1 Attack for every N Lumber you hold (Tax-Collector Teal, The Magnate Duck).', 'Hoard 2 with 8 Lumber: its Attack reads +4', (ctx, g, n)=>{ const el = mine(ctx)[1]; G.badge(el, G.chip('hoard', g, n)); G.pill(ctx, 'A', 8);
  ctx.float(el, '🐿️ +4⚔', 'gold stat-up'); const p = el.querySelector('.stats .atk'); cls(p, 'stat-pump', 900); return ctx.wait(1400); });
passive('sk-venom-master', 'venomMaster', '⚗️', 1, 'Venom Master N: your units\' Poison and Bleed hits add N more (Cottonmouth Matriarch).', 'A poisoner of yours hits: +2 ☠ where it would be +1', (ctx, g, n)=>{ const vm = mine(ctx)[2], a = mine(ctx)[1], t = foe(ctx)[1]; G.badge(vm, G.chip('venomMaster', g)); G.lunge(a, true);
  later(ctx, 560, ()=>{ ctx.float(t, '+2☠', 'poison'); ctx.sound('poisonApply'); if(S().poisonCloud) S().poisonCloud(t, {}); }); return ctx.wait(1500); });
passive('sk-fletcher', 'fletcher', '🪶', 1, 'Fletcher N: your units\' arrows deal N more (Eagle-Owl Quartermaster).', 'An arrow from its side lands for 3 (Arrow 2 + 1)', (ctx, g, n)=>{ const f = mine(ctx)[0], a = mine(ctx)[2], t = foe(ctx)[2]; G.badge(f, G.chip('fletcher', g));
  ctx.sound('bowRelease'); if(S().bowShot) S().bowShot(a, t, {onImpact:()=> ctx.alive() && ctx.float(t, '-3', 'dmg')}); return ctx.wait(1500); });
passive('sk-herbalist', 'herbalist', '🌿', 1, 'Herbalist N: every heal on your units heals N more (Hedgehog Herbalist).', 'A heal on an ally comes out 1 bigger: "+3"', (ctx, g, n)=>{ const h = mine(ctx)[0], t = mine(ctx)[1]; G.badge(h, G.chip('herbalist', g));
  ctx.sound('heal'); if(S().heal) S().heal(t, {}); ctx.float(t, '+3', 'heal'); return ctx.wait(1500); });
passive('sk-shatter', 'shatter', '💥', 2, 'Shatter N: +N damage to Frozen units (Walrus Icebreaker).', 'It hits a Frozen unit for 2 more', (ctx, g, n)=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; G.badge(a, G.chip('shatter', g, n)); t.classList.add('is-frozen'); G.lunge(a, true);
  later(ctx, 560, ()=>{ ctx.float(t, '-5', 'dmg'); ctx.sound('iceShatter'); if(S().burst){ const r = t.getBoundingClientRect(); S().burst(r.left + r.width/2, r.top + r.height/2, 0, 'ice', 10); } }); return ctx.wait(1500); });
R({id:'sk-atheist', stage:'board', inGameHook:'field2Vfx (arena_app.js): leylinesHit {atheist} → "✴️ Atheist" (no damage); the 🚫✨ chip', note:'Atheist: half damage from magic and from Devilry and Ecclesia attackers; the Leylines\' burn doesn\'t touch it; never Frightened. On no card yet.',
  variants:[{key:'A', label:'The ley lines burn everyone but the Atheist', play:ctx=>{ G.match(ctx); const at = mine(ctx)[1]; G.badge(at, G.chip('atheist', '🚫✨')); G.fire('field2Vfx', {type:'fieldTick', field:'leylines'});
    mine(ctx).concat(foe(ctx)).forEach((el, i)=> later(ctx, 160 + i*110, ()=> G.fire('field2Vfx', el === at ? {type:'fieldTick', field:'leylinesHit', uid:U(el), dmg:0, atheist:true} : {type:'fieldTick', field:'leylinesHit', uid:U(el), dmg:3}))); return ctx.wait(1800); }}]});
R({id:'atk-arrow-count', stage:'board', inGameHook:'the shots (Speed 1): one Arrow shot per arrowCount (pendingArrow → SkillFX.bowShot each)', note:'Arrow ×N (arrowCount, a hidden skill in the editor): the War Elephant looses Arrow 2 twice a round and its card shows two Arrow 2 lines.',
  variants:[{key:'A', label:'War Elephant: two arrows of 2, one after the other', play:ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '🏹 ×2', 'quick');
    [foe(ctx)[1], foe(ctx)[0]].forEach((t, i)=> later(ctx, i*330, ()=>{ ctx.sound('bowRelease'); if(S().bowShot) S().bowShot(a, t, {draw:i ? 90 : 240, onImpact:()=> ctx.alive() && ctx.float(t, '-2', 'dmg')}); })); return ctx.wait(1700); }}]});
// Electricity (2026-10-16, effects polish 2): the bolt is the hit; a yellow ⚡ number as it lands, a ⚡ burst and a pale-blue flash.
R({id:'sk-electricity', stage:'board', inGameHook:'electricity event → SkillFX.lightning; its hit (dmgType shock) lands with the bolt (electricityImpactMs) → "⚡-N" (DMG_ICON shock) + hitExplosionVfx(uid, \'shock\')',
  variants:[{key:'C', label:'2026-10-16: the bolt is the hit: a yellow ⚡ number as it lands, a ⚡ burst, a pale-blue flash', play:ctx=>{ ctx.sound('shockTone'); const a = mine(ctx)[1];
    if(S().lightning) S().lightning(a, [foe(ctx)[1], foe(ctx)[2]], {onEachImpact:t=>{ if(!ctx.alive()) return; try{ floatText(t, '⚡-2', 'shock'); }catch(e){} G.fire(()=> hitExplosionVfx(U(t), 'shock')); }}); return ctx.wait(1500); }}]});
// Quick (2026-10-16 / 10-17): the dash plays on every Quick swing: at a unit, at the castle, and on a miss.
R({id:'atk-quick', stage:'board', inGameHook:'labSkillFx → SkillFX.quickStrike (hit, evaded and blindMiss: quickImpactMs); hitHQ → quickStrikeCastle',
  variants:[
    {key:'B', label:'2026-10-17: the dash on a miss (dodged, or blind in the dark): "Miss!" on the target', play:ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; if(S().quickStrike) S().quickStrike(a, t, {}); ctx.float(a, '⚡ Quick!', 'quick');
      later(ctx, 160, ()=>{ ctx.float(t, 'Miss!', 'quick'); if(S().evasiveDodge) S().evasiveDodge(t, {fromLeft:true}); }); return ctx.wait(1300); }},
    {key:'C', label:'2026-10-16: at the castle it dashes straight at that side\'s HP bar', play:ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '⚡ Quick!', 'quick'); G.fire(()=> quickStrikeCastle(a, 'B'));
      later(ctx, 160, ()=>{ try{ floatText(hqRibbonFloatAnchor('B') || ctx.board.castleFoe, '-3', 'hq-big'); }catch(e){} }); return ctx.wait(1400); }}]});
// The trigger badge (2026-10-16): only the card's own ⚡ badge for that trigger glows.
R({id:'sk-trigger-fired', stage:'board', inGameHook:'triggerFiredVfx (arena_app.js): only the .ab-trig badge whose data-hook matches glows (.is-firing), with the trigger chime',
  variants:[{key:'B', label:'2026-10-16: just the trigger\'s own ⚡ badge glows (no rune ring, aura or bolt)', play:ctx=>{ G.match(ctx); const el = mine(ctx)[1]; G.badge(el, G.trig('onAttack', '⚡', '🗡️')); G.badge(el, G.trig('onKill', '⚡', '❤️'));
    later(ctx, 200, ()=> G.fire('triggerFiredVfx', {uid:U(el), hook:'onAttack'})); return ctx.wait(1400); }}]});
// Killing blows (2026-10-16): a ✖ pops on the target and darts into a killer that feeds on kills; its On Kill trigger plays as it lands.
R({id:'death-kill-mark', stage:'board', inGameHook:'renderVfxForEvent: a killing blow from a unit with an On Kill trigger (or Momentum, Midas Touch, Slash & Burn) → killMarkVfx(target, killer) → launchKillMark → .kill-gain + pullKillTrigger', note:'Replaces the "−N ✖" stamp (death-lethal-number, retired).',
  variants:[{key:'A', label:'The ✖ pops on the victim and darts into the killer; its ⚡ On Kill badge fires', play:ctx=>{ G.match(ctx); const a = mine(ctx)[1], t = foe(ctx)[1]; G.badge(a, G.trig('onKill', '⚡', '⚔️'));
    G.lunge(a, true); later(ctx, 560, ()=>{ ctx.float(t, '-5', 'dmg'); G.fire(()=> killMarkVfx(t, U(a))); try{ fallDeathVfx(t); }catch(e){} });
    later(ctx, 1000, ()=>{ G.fire('triggerFiredVfx', {uid:U(a), hook:'onKill'}); ctx.float(a, '+1⚔', 'gold stat-up'); }); return ctx.wait(2100); }}]});

// ============================== deaths and marks ==============================
// Revive (2026-10-17): a phoenix mark on every Revive unit but an Angel (wings and halo, smaller, fainter, centred); used, it burns off.
const reviveMark = (el, angel)=>{ el.classList.add(angel ? 'has-wings' : 'has-revive'); const s = document.createElement('span'); s.setAttribute('aria-hidden', 'true');
  if(angel){ s.className = 'angel-wings'; s.innerHTML = '<i class="aw-l"></i><i class="aw-r"></i>'; } else { s.className = 'revive-mark'; s.innerHTML = `<i class="rm-ring"></i><i class="rm-feather">${typeof REVIVE_FEATHER_SVG !== 'undefined' ? REVIVE_FEATHER_SVG : '🔥'}</i>`; }
  el.insertBefore(s, el.firstChild); G.badge(el, '').outerHTML = '<span class="abadge"><span class="ab-revive ab-revive-label" title="Revive: comes back once"><span class="ico ico-revive" data-ik="revive">↺</span><b>Revive</b></span></span>'; return s; };
// the revive event's board side, as renderVfxForEvent does it (arena_app.js, ev.type === 'revive')
const reviveSpent = (ctx, el)=>{ ctx.sound('buffUp'); ctx.float(el, '✨ Revived!', 'gold'); el.classList.remove('has-wings', 'has-revive'); el.querySelectorAll('.angel-wings, .revive-mark').forEach(x=> x.classList.add('is-spending')); el.querySelectorAll('.ab-revive').forEach(x=> x.classList.add('is-used')); };
R({id:'st-revive-mark', stage:'board', inGameHook:'boardCardHTML (arena_app.js): .revive-mark (phoenix) or .angel-wings (isAngelDef) while !revivedOnce; the "↺ Revive" chip (abilityBadges, live); revive event → is-spending / is-used', note:'No Angel ships yet, so the wings wait for one; every Revive card today wears the phoenix mark.',
  variants:[
    {key:'A', label:'Phoenix mark: a faint ember ring and a flame feather at the top, "↺ Revive" chip', play:ctx=>{ reviveMark(mine(ctx)[1], false); return ctx.wait(2400); }},
    {key:'B', label:'Angel: smaller, fainter, centred wings and halo', play:ctx=>{ reviveMark(mine(ctx)[1], true); return ctx.wait(2400); }},
    {key:'C', label:'Used: it comes back, the mark burns off, the chip is struck through in red', play:ctx=>{ const el = mine(ctx)[1]; reviveMark(el, false); later(ctx, 900, ()=>{ if(S().reviveRise) S().reviveRise(el); reviveSpent(ctx, el); }); return ctx.wait(2600); }},
    {key:'D', label:'Before 10-17: every Revive unit wore the angel wings (full size)', play:ctx=>{ const el = mine(ctx)[1]; reviveMark(el, true); const w = el.querySelector('.angel-wings'); if(w){ w.style.opacity = '1'; w.style.width = '150%'; w.style.top = '-24%'; w.style.height = '60%'; } return ctx.wait(2400); }}]});

// ============================== board and UI ==============================
R({id:'ui-enemy-pitch', stage:'board', inGameHook:'discard (the opponent pitched) → enemyPitchVfx → enemyPitchSlotFx(card, under #fieldResEnemy, {gain}) → their pill bings', note:'2026-10-17 (user: "it should look like it landed in a slot, then faded off, then a clearer +1 lumber anim").',
  variants:[{key:'A', label:'Their card drops into a slot under their pills, settles, fades; "+1 🪵 Lumber" rises; the pill counts it', play:ctx=>{ const box = ctx.root.querySelector('#fieldResEnemy'), bf = ctx.board.el; if(!box || !bf) return ctx.wait(300);
    const pill = G.pill(ctx, 'B', 2); const br = bf.getBoundingClientRect(), r = box.getBoundingClientRect(), z = parseFloat(getComputedStyle(ctx.root.querySelector('#appWrap')).zoom) || 1, w = Math.round(60*z), h = Math.round(w*1.25);
    const x0 = (r.width > 0 ? r.left : br.left + 12) + w*0.6, y0 = (r.height > 0 ? r.bottom : br.top + 36) + 10 + h; const t = (ctx.board.hand || [])[0];
    G.fire(()=> enemyPitchSlotFx(t ? t.outerHTML : '', {x:x0, y:y0}, {w, gain:{amount:1, glyph:'🪵', name:'Lumber'}, onLand:()=>{ pill.innerHTML = '<span class="ico ico-lumber" data-ik="lumber">🪵</span> 3'; cls(pill, 'bing', 400); cls(pill, 'pill-gain-pulse', 900); try{ floatText(pill, '+1', 'quick'); }catch(e){} ctx.sound('gold'); }}));
    return ctx.wait(2900); }}]});
R({id:'ui-enemy-hand-count', stage:'board', inGameHook:'enemyHandCountHTML / updateEnemyHandCount (arena_app.js): "N 🃏" on top of their Deck; .ehc-bump when it changes; .is-zero at 0', note:'Their 💀 Graveyard badge moved to the Deck\'s bottom edge.',
  variants:[{key:'A', label:'They play a card: "4 🃏" → "3 🃏" with a bump, then down to 0', play:async ctx=>{ const el = ctx.root.querySelector('#enemyHandCount'); if(!el) return ctx.wait(300);
    for(const n of [4, 3, 2, 1, 0]){ if(!ctx.alive()) return; el.textContent = `${n} 🃏`; el.classList.toggle('is-zero', !n); cls(el, 'ehc-bump', 500); await ctx.wait(520); } }}]});
R({id:'castle-hp-number', stage:'board', inGameHook:'hitHQ → floatText(hqRibbonFloatAnchor(side), \'-N\', \'hq-big\'): on that side\'s HP bar where its fill ends',
  variants:[{key:'H', label:'2026-10-16: the number pops on the HP bar where its fill ends', play:ctx=>{ const f = ctx.root.querySelector('.bf-hp[data-hpribbon="B"] .bf-hp-fill'); if(f) f.style.width = '62%';
    later(ctx, 100, ()=>{ try{ floatText(hqRibbonFloatAnchor('B') || ctx.board.castleFoe, '-6', 'hq-big'); }catch(e){} cls(ctx.root.querySelector('.bf-hp[data-hpribbon="B"]'), 'is-hit', 600); });
    later(ctx, 800, ()=>{ try{ floatText(hqRibbonFloatAnchor('A') || ctx.board.castleMine, '-2', 'hq-big'); }catch(e){} }); return ctx.wait(1900); }}]});
R({id:'ui-upkeep-chip', stage:'board', inGameHook:'resolveRoundCore (arena_app.js): html.bw-upkeep + showUpkeepChip() while the round-start effects play; hideUpkeepChip() when your turn opens', note:'Your hand dims; play, pitch and Pass wait until it ends.',
  variants:[{key:'A', label:'"⏳ Upkeep" on the field, your hand dims, then both lift', play:ctx=>{ document.documentElement.classList.add('bw-upkeep'); G.fire(()=> showUpkeepChip());
    later(ctx, 450, ()=>{ ctx.float(mine(ctx)[0], '☠ -1', 'poison'); }); later(ctx, 1700, ()=>{ document.documentElement.classList.remove('bw-upkeep'); G.fire(()=> hideUpkeepChip()); }); return ctx.wait(2200); }}]});
R({id:'castle-herb-bane', stage:'board', inGameHook:'castle shots → castleThrowVfx(castle, target, \'🧪\', landMs): a 🧪 on a shallow arc that lands in 0.44 s (every castle shot)',
  variants:[{key:'H', label:'2026-10-16: the Refinery throws a 🧪 on a shallow arc; it lands in 0.44 s', play:ctx=>{ const c = ctx.board.castleFoe, t = mine(ctx)[1]; G.fire(()=> castleThrowVfx(c, t, '🧪', 440));
    later(ctx, 450, ()=>{ ctx.float(t, '+1☠', 'poison'); ctx.sound('poisonApply'); }); return ctx.wait(1300); }}]});
// Voice barks (2026-10-16): a bubble above the card for ~1.6 s, read out as a babble in the species' voice (SoundKit.barkBabble).
const bark = (ctx, el, text, def)=>{ try{ showSpeechBubble(el, text, 'is-bark' + (/^\s*\*/.test(text) ? ' is-sound' : ''), {hold:1.08}); }catch(e){}
  try{ SoundKit.barkBabble(text, barkVoiceFor(def)); }catch(e){} return ctx.wait(1900); };
R({id:'ui-voice-bark', stage:'board', inGameHook:'maybeBark(uid, kind) → barkShow → showSpeechBubble(el, text, \'is-bark\', {hold:1.08}) + SoundKit.barkBabble(text, barkVoiceFor(def))', note:'Voice lines: On / Leaders only (default) / Off. Lines: docs/barks-2026-10-16.md. The babble follows the Voice and Sound sliders (silent at 0) and plays at most once a second.',
  variants:[
    {key:'A', label:'An Otter Centurion on play: dry and soldierly (mid voice)', play:ctx=> bark(ctx, foe(ctx)[0], 'Shields up. Mind the river.', {id:'otter-centurion', species:['Mustelid']})},
    {key:'B', label:'A bear\'s kill line: low and slow', play:ctx=> bark(ctx, mine(ctx)[1], 'Back to your den, little one.', {id:'grizzly', species:['Ursid']})},
    {key:'C', label:'A hummingbird: quick and boastful (high voice)', play:ctx=> bark(ctx, foe(ctx)[1], 'Too slow! Far too slow!', {id:'crimson-wing', archetypes:['Hummingbird']})},
    {key:'D', label:'A wild animal "speaks" in sound text, in italics: *hiss*', play:ctx=> bark(ctx, foe(ctx)[2], '*hiss*', {id:'viper', species:['Reptile']})}]});
// Day and night (2026-10-16 / 10-17): the steps inside a phase ease over 10 s; a change of phase is the whole board's 10 s fade plus a
// 40% copy of the new light creeping in from the left (skyPhaseLayers), the night veil fading with it.
const skyLayer = (ctx, tone, shade)=>{ const bf = ctx.board.el; bf.querySelectorAll(':scope > .sky-fx').forEach(x=> x.remove()); const s = document.createElement('div'); s.setAttribute('aria-hidden', 'true');
  s.className = skyClassFor(tone, shade || ''); bf.insertBefore(s, bf.firstChild); return s; };
const veil = (ctx, on)=>{ const bf = ctx.board.el; let v = bf.querySelector(':scope > .night-veil'); if(!v){ v = document.createElement('div'); v.setAttribute('aria-hidden', 'true'); bf.insertBefore(v, bf.firstChild); }
  v.className = 'night-veil is-on is-flat'; try{ v.animate([{opacity: on ? 0 : 1}, {opacity: on ? 1 : 0}], {duration:SKY_PHASE_MS, easing:'cubic-bezier(.45,.05,.55,.95)', fill:'forwards'}); }catch(e){} return v; };
R({id:'wt-sky-step', stage:'board', inGameHook:'syncSkyFx (arena_app.js): a step inside one phase → skyStepApply(sky, class, 0): the tint eases over SKY_STEP_MS (10 s)', note:'Day 1 (daybreak) → Day 2 (the normal day) → Day 3 (dusk, the old amber moved 10% toward day); Night 1 and 3 the plain night, Night 2 5% darker. A board redraw mid-way carries on.',
  variants:[
    {key:'A', label:'Day 1 → Day 2: daybreak eases into the plain day over 10 s', play:ctx=>{ const s = skyLayer(ctx, 'dawn'); void s.offsetWidth; G.fire(()=> skyStepApply(s, skyClassFor('day', ''), 0)); return ctx.wait(10400); }},
    {key:'B', label:'Day 2 → Day 3: the day warms to dusk over 10 s', play:ctx=>{ const s = skyLayer(ctx, 'day'); void s.offsetWidth; G.fire(()=> skyStepApply(s, skyClassFor('dusk', ''), 0)); return ctx.wait(10400); }},
    {key:'C', label:'Night 1 → Night 2: a shade darker over 10 s', play:ctx=>{ veil(ctx, true).getAnimations().forEach(a=> a.finish()); const s = skyLayer(ctx, 'night', '1'); void s.offsetWidth; G.fire(()=> skyStepApply(s, skyClassFor('night', '2'), 0)); return ctx.wait(10400); }}]});
R({id:'dark-night-veil-in', stage:'board', inGameHook:'syncSkyFx → skyPhaseLayers (whole-board 10 s cross-fade + the 40% creep from the left) and syncNightVeil (the veil\'s 10 s fade); SoundKit.nightSwell + wolfHowl',
  variants:[{key:'B', label:'2026-10-16: nightfall: the whole board darkens over 10 s while the night creeps in from the left at 40%', play:ctx=>{ ctx.sound('nightSwell'); const s = skyLayer(ctx, 'dusk');
    W.skyPhaseEase = {from:skyClassFor('dusk', ''), to:skyClassFor('night', '1'), t0:performance.now()}; G.fire(()=> skyPhaseLayers(ctx.board.el, s, W.skyPhaseEase, 0)); veil(ctx, true);
    ctx.board.el.classList.add('is-dark-scene'); return ctx.wait(10400); }}]});
R({id:'dark-night-veil-out', stage:'board', inGameHook:'syncSkyFx → skyPhaseLayers (night → dawn) + syncNightVeil fade + fxHook(fieldNightLifts) → FX.E.nightRetreat; FX.B.onEvent phase day → dayBreaks (the barely-there sun); SoundKit.dawnChime (birds 1 in 3)',
  variants:[{key:'B', label:'2026-10-17: daybreak: the board lights up over 10 s, the light creeps in from the left, soft streaks drift, a barely-there sun', play:ctx=>{ const bf = ctx.board.el;
    veil(ctx, true).getAnimations().forEach(a=> a.finish()); const s = skyLayer(ctx, 'night', '3'); ctx.sound('dawnChime');
    W.skyPhaseEase = {from:skyClassFor('night', '3'), to:skyClassFor('dawn', ''), t0:performance.now()}; G.fire(()=> skyPhaseLayers(bf, s, W.skyPhaseEase, 0)); veil(ctx, false);
    try{ FXE().nightRetreat && FXE().nightRetreat(bf, {n:7, strength:.4, speed:1.6}); }catch(e){} try{ FXB().dayBreaks && FXB().dayBreaks(bf); }catch(e){} return ctx.wait(10400); }}]});
R({id:'wt-night-cursor', stage:'board', inGameHook:'wireNightCursorLight (arena_app.js): .battlefield.bf-night-cursor (syncNightVeil, at Night) + .night-cursor-light at --nx/--ny under the pointer; on touch it fades from the last touch', note:'Fainter than the pitch-dark lantern, inside the board only. The lab moves the light along a path in place of your pointer.',
  variants:[{key:'A', label:'At night a soft, faint light follows the pointer over the field', play:async ctx=>{ const bf = ctx.board.el; veil(ctx, true).getAnimations().forEach(a=> a.finish()); skyLayer(ctx, 'night', '2');
    bf.classList.add('bf-night-cursor', 'is-dark-scene'); const l = document.createElement('div'); l.className = 'night-cursor-light'; l.setAttribute('aria-hidden', 'true'); bf.appendChild(l); void l.offsetWidth; l.classList.add('is-on');
    const t0 = performance.now(); while(ctx.alive() && performance.now() - t0 < 4200){ const k = (performance.now() - t0)/4200; l.style.setProperty('--nx', (15 + 70*k).toFixed(1) + '%'); l.style.setProperty('--ny', (50 + Math.sin(k*Math.PI*2)*28).toFixed(1) + '%'); await new Promise(r=> requestAnimationFrame(r)); }
    l.classList.remove('is-on'); await ctx.wait(400); }}]});

// ============================== cards ==============================
// Card front frames (2026-10-16): a .cframe child on every face wears its kind's pixel-art 9-slice (fr-unit / fr-structure / fr-castle /
// fr-field); a unit or structure of an archetype adds ar-<key> (the archetype's frame; a structure keeps its boards, in its materials).
const FR = ['fr-unit', 'fr-structure', 'fr-castle', 'fr-field'];
const frame = (t, kind, ar)=>{ if(!t) return; FR.forEach(c=> t.classList.remove(c)); [...t.classList].filter(c=> /^ar-/.test(c)).forEach(c=> t.classList.remove(c)); t.classList.add('fr-' + kind); if(ar) t.classList.add('ar-' + ar);
  if(!t.querySelector(':scope > .cframe')){ const i = document.createElement('i'); i.className = 'cframe'; i.setAttribute('aria-hidden', 'true'); (t.querySelector(':scope > .rarity-band') || t.firstChild).after(i); } };
const showFrames = (ctx, kind, ar)=>{ ctx.cards.forEach(t=> frame(t, kind, ar)); if(ctx.cards[1]) ctx.tilt(ctx.cards[2], 2000); return ctx.wait(2600); };
R({id:'tr-frame-kinds', stage:'cards', inGameHook:'cardTileHTML → cardFrameClasses(d, opts): fr-<unit|structure|castle|field> + <i class="cframe"> (art/frames/*.png, tools/make_card_frames.py; the URLs as --fr-* on :root, installCardFrames)', note:'The rarity border, the legendary rim and the leader ring stay on top; the name scroll, stat pills and skill strip haven\'t moved.',
  variants:[
    {key:'A', label:'Unit: the walnut frame, polished, a gold inlay round the art, brass corner pins', play:ctx=> showFrames(ctx, 'unit')},
    {key:'B', label:'Structure: the same frame knocked together from planks: crooked nails, rope lashings, a split, a hair off true', play:ctx=> showFrames(ctx, 'structure')},
    {key:'C', label:'Castle: dressed stone and gold with ruby and sapphire corner caps', play:ctx=> showFrames(ctx, 'castle')},
    {key:'D', label:'Field effect: the Environment card\'s mossy stone and gold line', play:ctx=> showFrames(ctx, 'field')},
    {key:'E', label:'Before 10-16: no front frame (the plain tile)', play:ctx=>{ ctx.cards.forEach(t=>{ const f = t.querySelector(':scope > .cframe'); if(f) f.remove(); FR.forEach(c=> t.classList.remove(c)); }); return ctx.wait(2400); }}]});
const ARCH = [['devilry', 'Devilry', 'dark iron, blood runs and pentagram studs'], ['grace', 'Ecclesia', 'white marble, gold and a stained-glass plate'], ['exile', 'Scrappers', 'riveted scrap-metal plates and a hazard stripe'],
  ['evolution', 'Evomax' /* was Evolution (2026-10-19, package EE) */, 'pearly shell ribs with cells in the plate'], ['exiled', 'Exiled Ones', 'cracked ash, a dead thorn vine and a wilted rose'], ['forgotten', 'Forgotten Ones', 'dust, cobwebs and candle wax'],
  ['ancient', 'Ancient Ones', 'weathered runestone with glowing runes'], ['outer', 'Outer Ones', 'a violet starfield'], ['void', 'Void', 'black, an event-horizon rim and black holes on the corners']];
ARCH.forEach(([k, name, look])=> R({id:'tr-frame-arch-' + k, stage:'cards', inGameHook:`cardFrameArch(d, kind) → ar-${k}: --fr-a-${k} on a unit, --fr-s-${k} on a structure (art/frames/a-${k}.png, s-${k}.png)`,
  note:`${name}: ${look}; its emblem on both sides. The top-right archetype mark is gone on cards that wear it.${['devilry', 'grace', 'exile'].includes(k) ? '' : ' No card of this archetype yet: the frame is ready for when one comes.'}`,
  variants:[{key:'A', label:`${name} unit: ${look}`, play:ctx=> showFrames(ctx, 'unit', k)}, {key:'B', label:`${name} structure: its rickety boards in the archetype's materials, the emblem nailed to its posts`, play:ctx=> showFrames(ctx, 'structure', k)}]}));
// Card backs (2026-10-16): `bw-back bk-<kind>` paints the kind's pixel-art back (art/backings/*.png, --bk-* on :root).
const backs = (ctx, kinds)=>{ const row = ctx.root.querySelector('.fxl-cardrow'); if(!row) return ctx.wait(300); row.innerHTML = '';
  kinds.forEach(k=>{ const w = document.createElement('div'); w.className = 'board-card fxl-slot'; const b = document.createElement('div'); b.className = 'card-tile fxl-back ' + W.cardBackClass(k); b.style.cssText = 'border-radius:10px;'; w.appendChild(b); row.appendChild(w);
    if(ctx.gsap) ctx.gsap.from(b, {rotationY:90, duration:.45, delay:kinds.indexOf(k)*.12, ease:'back.out(1.4)'}); });
  return ctx.wait(2400); };
R({id:'tr-card-backing', stage:'cards', inGameHook:'cardBackClass(d) → .bw-back.bk-<kind> on every face-down card: the pack opener, the draw flip, an enemy card flying in, a full-hand pitch, reward reveals, the home fan, a spun card; the deck piles show the unit back', note:'tools/make_card_backings.py. A deck pile is a mix, so it shows the unit back (it never gives away your next draw).',
  variants:[
    {key:'A', label:'Unit: the acorn mark in a gold medallion on a green weave', play:ctx=> backs(ctx, ['unit'])},
    {key:'B', label:'Structure: timber and iron, crossed mallets, a stone frame', play:ctx=> backs(ctx, ['structure'])},
    {key:'C', label:'Castle: crimson damask, a gold frame with rubies, a crowned keep', play:ctx=> backs(ctx, ['castle'])},
    {key:'D', label:'Field effect: mossy, with vines and a day-and-night disc', play:ctx=> backs(ctx, ['field'])},
    {key:'E', label:'All four side by side', play:ctx=> backs(ctx, ['unit', 'structure', 'castle', 'field'])}]});
// Top rarity frames on a zoomed card (2026-10-17): touching a tile's style rewrote "--rarity-a:#dc2626" as "--rarity-a: #dc2626" and the
// big card fell back to the gold rim; FX.D's selector matches both spellings now.
const RK = [['mythic', '#dc2626', 'Mythic'], ['ancient', '#1e3a8a', 'Ancient'], ['divine', '#f8fafc', 'Divine'], ['void', '#7c6f8f', 'Void'], ['daemonic', '#111111', 'Daemonic']];
R({id:'tr-rarity-zoom', stage:'cards', inGameHook:'bramblewood-fx-d.js FRAMES_CSS rSel(k): [style*="--rarity-a:#…"] and [style*="--rarity-a: #…"] (the card detail / inspector rewrite the style attribute)', note:'Each pair: the small tile as cardTileHTML writes it, and the zoomed copy after a script touched its style. Both wear the same frame now.',
  variants:RK.map(([k, col, name], i)=> ({key:'ABCDE'[i], label:`${name}: small and zoomed wear the same frame`, play:ctx=>{ const row = ctx.root.querySelector('.fxl-cardrow'); if(!row) return ctx.wait(300);
    const src = ctx.tile('mythic'); row.innerHTML = ''; const a = src.closest('.board-card'); const sm = a.querySelector('.card-tile'); sm.classList.add('rarity-tier-top'); sm.setAttribute('style', `--rarity-a:${col}; --rarity-b:${col}`);
    const b = a.cloneNode(true); row.appendChild(a); row.appendChild(b); const big = b.querySelector('.card-tile'); big.style.cursor = 'zoom-in'; big.style.setProperty('--rarity-a', col); // the rewrite with a space
    b.style.transform = 'scale(1.45)'; b.style.transformOrigin = 'left center'; b.style.marginLeft = '24px'; ctx.tilt(big, 2000); return ctx.wait(2600); }}))});
// Packs (2026-10-17): a bonus copy, and the big pile's count counting down.
R({id:'pack-bonus-copy', stage:'pack', inGameHook:'openPackAnimation (arena_app.js): r.bonusCopy → .po2-bonus-copy behind the card + .po2-bonus-tag "Bonus! +1 copy"; .is-bonus 0.65 s after the flip (1.1 s on a new card) + unlockChime + a ✨➕✨ burst', note:'Common 5%, Uncommon 4%, Rare 3%, Very Rare 2%, Super Rare 1%, then halving. Replaces the old "×2" with two blank cards (pack-duplicate, retired).',
  variants:[{key:'A', label:'"Bonus!" pops over the card and the identical copy slides out from behind it', play:async ctx=>{ await ctx.pack.deal(); const c = ctx.pack.cards[0]; if(!c) return; // the card in front (the opener shows one at a time)
    const t = c.querySelector('.card-tile'); const cp = document.createElement('span'); cp.className = 'po2-bonus-copy'; cp.setAttribute('aria-hidden', 'true'); cp.innerHTML = t ? t.outerHTML : ''; c.appendChild(cp);
    const tag = document.createElement('span'); tag.className = 'po2-bonus-tag'; tag.setAttribute('aria-hidden', 'true'); tag.innerHTML = '<b>Bonus!</b><small>+1 copy</small>'; c.appendChild(tag);
    await ctx.wait(300); ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(650); c.classList.add('is-bonus'); ctx.sound('unlockChime');
    const r = c.getBoundingClientRect(); if(S().burst) S().burst(r.left + r.width/2, r.top + r.height/3, 270, 'gold', 14); await ctx.wait(2200); }}]});
R({id:'pack-count-down', stage:'pack', inGameHook:'openPackAnimation (arena_app.js): #poPileCount under a big pile = pileLeft(o, cur) "N cards", counted down as each card is revealed (a ×N or a bonus copy counts too)',
  variants:[{key:'A', label:'"12 cards" under the pile counts down as they flip', play:async ctx=>{ await ctx.pack.deal(); const st = ctx.pack.el.querySelector('.po2-stage') || ctx.pack.el; const pc = document.createElement('div'); pc.className = 'po2-pile-count'; pc.id = 'poPileCount';
    let n = 12; pc.textContent = `${n} cards`; st.appendChild(pc); for(let i = 0; i < ctx.pack.cards.length && ctx.alive(); i++){ await ctx.wait(420); ctx.pack.flip(i); ctx.sound('cardFlip'); n--; pc.textContent = `${n} card${n === 1 ? '' : 's'}`; } await ctx.wait(900); }}]});

// ============================== maps ==============================
R({id:'map-trails-one-by-one', stage:'map', inGameHook:'FX.E playReturn (bramblewood-fx-e.js): every new trail and its fight are hidden as the map comes into view, then each inks in (FX.E.trailDraw) one after another, the fight fading in as its trail reaches it', note:'2026-10-17 (user: "when you clear a skirmish and it unlocks two (2) paths, one-by-one the paths light up. The dashed paths are invisible at first.").',
  variants:[{key:'A', label:'Two new trails ink in one after the other; each fight fades in as its trail arrives', play:async ctx=>{ const cv = ctx.map.el, lines = ctx.map.trailLines.slice(1, 3), nodes = [ctx.map.nodes.available, ctx.map.nodes.locked].filter(Boolean);
    lines.forEach(l=> l.style.opacity = '0'); nodes.forEach(n=>{ n.style.transition = 'none'; n.style.opacity = '0'; }); await ctx.wait(500);
    for(let i = 0; i < lines.length && ctx.alive(); i++){ const l = lines[i], n = nodes[i]; l.style.opacity = ''; const t = setTimeout(()=>{ if(n){ n.style.transition = 'opacity .3s ease-out'; n.style.opacity = ''; } }, 700);
      try{ await FXE().trailDraw(cv, l, n); }catch(e){} clearTimeout(t); if(n){ n.style.transition = 'opacity .3s ease-out'; n.style.opacity = ''; } } await ctx.wait(700); }}]});
R({id:'map-hidden-skirmish-pop', stage:'map', inGameHook:'renderConquestSubTab (arena_app.js): hiddenPopNow → .map-node.is-secret.secret-pop, and its trail line .trail-pop',
  variants:[{key:'B', label:'2026-10-17: it pops in with its trail from the fight beside it fading in', play:ctx=>{ const n = ctx.map.nodes.available; if(!n) return ctx.wait(300); const l = ctx.map.trailLines[1];
    if(l) l.classList.add('trail-pop'); n.classList.add('is-secret', 'secret-pop'); ctx.sound('unlockChime'); return ctx.wait(2400); }}]});

// ============================== lightning (2026-10-17) ==============================
// User (23:25): "Voltaic Eel should have chain lighting as well. Anyway, all its lighting attacks should not throw a generic ball at the
// enemy. When the lightning arcs, the enemies take the lightning damage straight away. Elemental damage has the respective elemental
// emoji attached. For the skill "Electricity", I think maybe the effect can look a little more cyan (10%) than chain lighting to
// differentiate them." In the game every lightning hit draws its own bolt (lightningBoltOf / drawLightningBolt in arena_app.js); the
// number pops as the bolt reaches its unit (SkillFX.lightning lands jump i at i*152 + 60 ms). Nothing is ever thrown.
const zapNum = (ctx, t, n, ico, c)=>{ if(!ctx.alive() || !t) return; try{ floatText(t, (ico || '⚡') + ' -' + n, c || 'shock'); }catch(e){} G.fire(()=> hitExplosionVfx(U(t), c === 'magic' ? 'magic' : 'shock')); };
R({id:'sk-chain-lightning', stage:'board', inGameHook:'chainLightning event (notes the strike) → each jump\'s hit {chainLightning, jump, viaUid} draws its jump (lightningBoltOf → SkillFX.lightning, plain) and "⚡ -N" pops as it lands',
  note:'Chain Lightning N (Voltaic Eel: 2): its hits jump from the target to an enemy beside it, then on to one more, never the same unit twice; N lightning damage each (+1 per Wet counter).',
  variants:[{key:'A', label:'2026-10-17: the plain bolt runs eel → target → its neighbour → the next; each number pops as its jump lands', play:ctx=>{ ctx.sound('shockTone'); const a = mine(ctx)[1], f = foe(ctx);
    if(S().lightning) S().lightning(a, [f[1], f[2]], {onEachImpact:(t, i)=>{ if(i) zapNum(ctx, t, 2); }});
    later(ctx, 2*152, ()=>{ if(S().lightning) S().lightning(f[2], [f[0]], {onEachImpact:t=> zapNum(ctx, t, 2)}); }); return ctx.wait(1500); }}]});
R({id:'sk-electricity', stage:'board', inGameHook:'electricity event → its arc hit {electricity, viaUid} draws the bolt (lightningBoltOf, cls sfx-bolt-electric) → "⚡ -N" as it lands',
  variants:[{key:'D', label:'2026-10-17: 10% more cyan than chain lightning (sfx-bolt-electric); no 💧 floats, Wet adds to the number', play:ctx=>{ ctx.sound('shockTone'); const a = mine(ctx)[1];
    if(S().lightning) S().lightning(a, [foe(ctx)[1], foe(ctx)[2]], {cls:'sfx-bolt-electric', onEachImpact:(t, i)=>{ if(i) zapNum(ctx, t, 2); }}); return ctx.wait(1300); }}]});
R({id:'sk-dragon-lightning', stage:'board', inGameHook:'dragonLightning event (notes the strike) → each strike\'s hit {dragonLightning, jump, viaUid} draws its red jump; "🪄 -N" (magic) as it lands; no ✦ missile',
  variants:[{key:'B', label:'2026-10-17: the red bolt is the hit: attacker → target, then target → the unit beside it', play:ctx=>{ ctx.sound('shockTone'); const a = mine(ctx)[1], f = foe(ctx);
    if(S().lightning) S().lightning(a, [f[1]], {cls:'sfx-bolt-red', onEachImpact:t=>{ zapNum(ctx, t, 3, '🪄', 'magic'); cls(t, 'dragon-struck', 700); }});
    later(ctx, 100, ()=>{ if(S().lightning) S().lightning(f[1], [f[2]], {cls:'sfx-bolt-red', onEachImpact:t=>{ zapNum(ctx, t, 3, '🪄', 'magic'); cls(t, 'dragon-struck', 700); }}); }); return ctx.wait(1400); }}]});
R({id:'sk-lightning-passive', stage:'board', inGameHook:'statusFx lightning {targetUid} → the hit {skyBolt, dmgType shock} → FX.A.stormBolt on the struck unit, "⚡ -N" at once',
  variants:[{key:'B', label:'2026-10-17: the bolt comes down on the unit it strikes (it struck the caster), lightning damage', play:ctx=>{ ctx.sound('shockTone'); const t = foe(ctx)[1];
    if(FXA().stormBolt) FXA().stormBolt(t, {}); later(ctx, 70, ()=> zapNum(ctx, t, 2)); return ctx.wait(1100); }}]});
R({id:'sk-shock-bolt', stage:'board', inGameHook:'bolt {element:shock} → no glob; its hit draws a straight bolt shooter → target (lightningBoltOf) and "⚡ -N" as it lands',
  variants:[{key:'A', label:'2026-10-17: a bolt of lightning, not a spit', play:ctx=>{ ctx.sound('shockTone'); const a = mine(ctx)[1], t = foe(ctx)[1];
    if(S().lightning) S().lightning(a, [t], {onEachImpact:()=> zapNum(ctx, t, 2)}); return ctx.wait(1100); }}]});
})();
