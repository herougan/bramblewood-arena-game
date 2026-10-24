// Package PL2 (2026-10-25): the owner's 22:28 / 00:02 playtest effects. Registered on the inventory ids they changed, on the free letters G / H
// (labels start "PL2 ·"). Every variant plays the game's own code (arena_app.js): pl2InspireBurst + pl2SetStat (Inspiring, #4), pl2SetStat
// (the stat bounce, #5), pl2RibbonFill / pl2RibbonNum (the bramble bars easing, #7), pl2BrambleHitFx / pl2BrambleMendFx (the bramble
// animation pass, 21:54), the fallen bramble with no mound (#1) and SoundKit.prongTone (Fork / Trident / Pitchfork, 00:02 #9).
(function(){
const R = FXLAB.register, has = n=> typeof window[n] === 'function';
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const atkOf = el=> el && el.querySelector('.stats .atk'), hpOf = el=> el && el.querySelector('.stats .hp');
const num = el=>{ const m = /(-?\d+)\s*$/.exec((el && el.textContent || '').trim()); return m ? +m[1] : 0; };
const setNum = (plate, n, glyph)=>{ if(!plate) return; if(has('pl2SetStat')) pl2SetStat(plate, `<i class="sg">${glyph}</i>${n}`, {any: glyph === '⚔'}); else plate.textContent = glyph + n; };

R({id:'sk-inspired', stage:'board', inGameHook:'renderVfxForEvent statusFx inspired → pl2InspireFx: one burst per swing (pl2InspireBurst), each ally\'s Attack plate 0.3 s later (pl2SetStat)',
  note:'2026-10-25 (PL2, owner 22:28 #4: "a short burst of that emoji above the card (shaking animatedly than growing bigger than fading), 0.3s after the vfx comes out, the adjacent allies numbers update. Yes, even for waiting units!").',
  variants:[
    {key:'G', label:'PL2 · The horn bursts over the inspirer; both neighbours\' Attack goes up 0.3 s in', play:ctx=>{ const m = ctx.board.mine, c = m[1], a = [m[0], m[2]].filter(Boolean);
      if(has('pl2InspireBurst')) pl2InspireBurst(c, {force:true}); ctx.sound('rallyHorn');
      const before = a.map(el=> num(atkOf(el)));
      return ctx.wait(300).then(()=>{ a.forEach((el, i)=> setNum(atkOf(el), before[i] + 1, '⚔')); return ctx.wait(1400); }).then(()=> a.forEach((el, i)=> setNum(atkOf(el), before[i], '⚔'))); }}]});

R({id:'st-stat-change', stage:'board', inGameHook:'updateCardAtkDisplay / updateCardHpDisplay → pl2SetStat; renderBoard → pl2BounceAfterRedraw (a change a redraw brought)',
  note:'2026-10-25 (PL2, owner 22:28 #5: "as 3 becomes 4, the 3 becomes abit smaller, then 4 appears instantaneously, then becomes its size recovers beyond and continues bounces on the spot for abit"). Damage does not bounce.',
  variants:[
    {key:'G', label:'PL2 · Attack 2 → 3 (a buff), then back (a debuff): both bounce', play:ctx=>{ const p = atkOf(ctx.board.mine[1]), n = num(p);
      setNum(p, n + 1, '⚔'); return ctx.wait(1100).then(()=>{ setNum(p, n, '⚔'); return ctx.wait(1000); }); }},
    {key:'H', label:'PL2 · Health up by a heal bounces; the hit after it (damage) does not', play:ctx=>{ const p = hpOf(ctx.board.mine[0]), n = num(p);
      setNum(p, n + 3, '❤'); return ctx.wait(1100).then(()=>{ setNum(p, n, '❤'); return ctx.wait(900); }); }}]});

R({id:'castle-hp-number', stage:'board', inGameHook:'updateHpRibbon → pl2RibbonFill (the fill eases, a chip of lost Health drains after it) and pl2RibbonNum (the number counts)',
  note:'2026-10-25 (PL2, owner 22:28 #7: "As the battleground\'s bramble HP/LP bars change, they ease towards the new value (quickly)").',
  variants:[
    {key:'G', label:'PL2 · Their bramble takes 6, then 3; then a repair of 5', play:ctx=>{ const rib = document.querySelector('[data-hpribbon="B"]'), f = rib && rib.querySelector('.bf-hp-fill'), n = rib && rib.querySelector('.bf-hp-num');
      if(!f || !has('pl2RibbonFill')) return ctx.wait(400);
      const max = 20, at = v=>{ const pct = v / max * 100; pl2RibbonFill(rib, f, 'B', pct, null); if(n) pl2RibbonNum(n, 'B', null, v, max); };
      at(20); return ctx.wait(300).then(()=>{ at(14); return ctx.wait(700); }).then(()=>{ at(11); return ctx.wait(900); }).then(()=>{ at(16); return ctx.wait(900); }).then(()=> at(20)); }}]});

R({id:'castle-hit', stage:'board', inGameHook:'hqHitBigVfx → pl2BrambleHitFx: a white impact flash on the tile and bark / stone chips off its top (more for a bigger hit)',
  note:'2026-10-25 (PL2, owner 21:54: "bramble animation should be improved as well."): the hit, the repair and the fall share the bark-and-stone chips.',
  variants:[
    {key:'G', label:'PL2 · A small hit (3) and a heavy one (14)', play:ctx=>{ const t = ctx.board.castleFoe; if(!has('hqHitBigVfx')) return ctx.wait(300);
      hqHitBigVfx(t, 3); ctx.sound('thud'); return ctx.wait(900).then(()=>{ hqHitBigVfx(t, 14); ctx.sound('thud'); return ctx.wait(1200); }); }}]});

R({id:'castle-regen', stage:'board', inGameHook:'rebuildVfx → pl2BrambleMendFx: chips drawn back onto the tile, a warm green rim and a settle',
  note:'2026-10-25 (PL2, owner 21:54).',
  variants:[
    {key:'G', label:'PL2 · Your bramble is mended', play:ctx=>{ const t = tileOf(ctx.board.castleMine); if(has('pl2BrambleMendFx')) pl2BrambleMendFx(t); ctx.sound('woodKnock'); return ctx.wait(1100); }}]});

R({id:'castle-crumble', stage:'board', inGameHook:'.match-castle-tile.castle-fallen (arena_template.html): hidden, its spot kept, nothing drawn where it stood',
  note:'2026-10-25 (PL2, owner 22:28 #1, SS#1: "a remaining trace of the bramble is left on the top left"): the earth mound BV left is gone.',
  variants:[
    {key:'G', label:'PL2 · After the fight: the fallen bramble leaves no mound', play:ctx=>{ const t = tileOf(ctx.board.castleFoe); t.classList.add('castle-fallen'); return ctx.wait(2200).then(()=> t.classList.remove('castle-fallen')); }}]});

R({id:'atk-prong-fork', stage:'board', inGameHook:'forkSwingVfx → SoundKit.prongTone(kind) (was swipeTone for all three)',
  note:'2026-10-25 (PL2, owner 00:02 #9: "Fork, pitchfork, and trident should have a slightly different or additional sfx"). Listen with the sound on.',
  variants:[
    {key:'G', label:'PL2 · Fork (two tings), then Trident (three, shimmering), then Pitchfork (four, a wooden thump)', play:ctx=>{ const k = window.SoundKit;
      const go = kind=>{ try{ k && k.prongTone && k.prongTone(kind); }catch(e){} ctx.float(ctx.board.mine[1], kind === 'fork' ? '⇔ Fork!' : '🔱 ' + kind, 'quick'); };
      go('fork'); return ctx.wait(900).then(()=>{ go('trident'); return ctx.wait(900); }).then(()=>{ go('pitchfork'); return ctx.wait(900); }); }}]});
})();
