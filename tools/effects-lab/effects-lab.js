// Effects Lab wiring. Effect code above this file is lifted from the game (arena_app.js and
// bramblewood-shaders.js); this file only adds the demo buttons around it.
(function(){
  const $ = (s, r)=> (r||document).querySelector(s);
  const $$ = (s, r)=> [...(r||document).querySelectorAll(s)];
  const hasGsap = ()=> typeof gsap !== 'undefined';
  const reduce = ()=> window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{ decorateHolo(document); }catch(e){}

  // keep a pristine copy of each stage so deaths can reset
  const pristine = new Map();
  $$('.stage').forEach(s=> pristine.set(s, s.innerHTML));
  const resetStage = s=>{ s.innerHTML = pristine.get(s); try{ decorateHolo(s); }catch(e){} };

  // ---- damage numbers (same look and motion as floatText in the game)
  function floatText(el, text, cls){
    const raw = String(text);
    const heavy = /^-\d+$/.test(raw) && Math.abs(parseInt(raw, 10)) >= 8 && !cls;
    const f = document.createElement('div');
    f.className = 'dmg-float' + (cls ? ' ' + cls : '') + (heavy ? ' heavy' : '');
    const RX = /[\p{Extended_Pictographic}\u2600-\u27BF\uFE0F\u200D]+/gu;
    const icon = (raw.match(RX) || []).join('').replace(/\uFE0F/g, ''), num = raw.replace(RX, '').trim() || raw;
    f.innerHTML = (cls && /\bcrit\b/.test(cls) ? '<span class="df-burst"></span>' : '') + (icon ? `<span class="df-ico">${icon}</span>` : '') + `<span class="df-num" data-t="${num}">${num}</span>`;
    el.appendChild(f);
    const dx = Math.random()*24 - 12;
    if(!hasGsap()){ setTimeout(()=> f.remove(), 1100); return; }
    f.style.animation = 'none';
    gsap.set(f, {position:'absolute', left:'50%', top:'40%', xPercent:-50, x:0, y:0, opacity:0, scale:.6});
    gsap.timeline({onComplete:()=> f.remove()})
      .to(f, {opacity:1, scale:1.1, y:-20, x:dx*0.4, duration:.16, ease:'back.out(2.6)'})
      .to(f, {y:-46, x:dx, duration:.55, ease:'power1.out'}, '<0.02')
      .to(f, {opacity:0, y:-58, duration:.35, ease:'power1.in'}, '>-0.1');
  }
  $$('[data-dmg]').forEach(b=> b.addEventListener('click', ()=>{
    const [t, cls] = b.dataset.dmg.split('|'); const card = $('#dmgStage .board-card');
    floatText(card, t, cls);
    if(/crit/.test(cls||'')){ try{ critStampVfx(card); SoundKit.critTone(); SoundKit.hitAt(9, true); }catch(e){} return; }
    try{ if(cls==='poison-tick') SoundKit.bubble(); else if(cls==='bleed-tick') SoundKit.bleedTick(); else if(cls==='heal') SoundKit.healTone(); else SoundKit.hitAt(Math.abs(parseInt(t.replace(/[^\d-]/g,''),10))||1, /12/.test(t)); }catch(e){}
  }));

  // ---- impact squash + hit-stop
  function impactSquash(el, dmg){
    if(!hasGsap() || reduce()) return;
    const tile = el.querySelector('.card-tile'); if(!tile) return;
    const k = Math.min(1, 0.45 + (dmg||1)/10);
    gsap.timeline().to(tile, {scaleX:1 + 0.07*k, scaleY:1 - 0.09*k, y:-6*k, duration:0.06, ease:'power2.out'})
      .to(tile, {scaleX:1, scaleY:1, y:0, duration:0.38, ease:'elastic.out(1, 0.45)', clearProps:'transform'});
  }
  function hitStop(ms){ if(!hasGsap() || reduce()) return; gsap.globalTimeline.timeScale(0.06); setTimeout(()=> gsap.globalTimeline.timeScale(1), ms); }
  const act = {
    squash(){ const c = $('#squashStage .board-card'); impactSquash(c, 3); floatText(c, '-3'); try{ SoundKit.hitAt(3, false); }catch(e){} },
    squashHeavy(){ const c = $('#squashStage .board-card'); impactSquash(c, 9); hitStop(70); floatText(c, '-9'); try{ SoundKit.hitAt(9, true); }catch(e){} },
    heroLevel(){ const c = $('#heroDemo'); c.classList.remove('is-levelling'); void c.offsetWidth; c.classList.add('is-levelling'); setTimeout(()=> c.classList.remove('is-levelling'), 1500); try{ SoundKit.heroLevel(); }catch(e){} },
    materia(){ const k = MATERIA_KINDS[Math.floor(Math.random()*4)]; try{ materiaBurstVfx(k); SoundKit.materiaForm(); }catch(e){} },
    wave(){ if(bf && bf.wave){ bf.wave(0.5, 0.5, [1, 0.88, 0.62], 0.9, 760); bf.flash(0.5, 0.5, [1, 0.88, 0.62], 0.9, 0.6, 900); } try{ SoundKit.hitAt(12, true); }catch(e){} },
    leaves(){ leafDemo(); },
    lightning(){ const host = $('#bfLab'); const f = document.createElement('div'); f.className = 'bf-lightning'; f.style.setProperty('--lx', (15 + Math.random()*70).toFixed(0) + '%'); host.appendChild(f); setTimeout(()=> f.remove(), 900);
      if(bf && bf.flash) bf.flash(0.15 + Math.random()*0.7, 0.05, [0.85, 0.9, 1], 0.8, 0.7, 700);
      try{ if(Ambience.current() == null) Ambience.play(10); setTimeout(()=> Ambience.thunder(0.5), 50); }catch(e){} },
    sdsky(){ $('#bfLab').classList.toggle('sudden-death'); },
  };
  $$('[data-act]').forEach(b=> b.addEventListener('click', ()=> act[b.dataset.act] && act[b.dataset.act]()));
  const mb = $('[data-act="materia"]'); if(mb) mb.setAttribute('data-fmb', 'craft');

  // ---- deaths
  let deathToken = 0;
  $$('[data-death]').forEach(b=> b.addEventListener('click', ()=>{
    const my = ++deathToken; if(hasGsap()) gsap.killTweensOf('#deathStage *');
    const stage = $('#deathStage'); resetStage(stage);
    const el = stage.querySelector('.board-card'); const style = b.dataset.death; const ms = 700;
    requestAnimationFrame(()=>{
      if(my !== deathToken) return;
      if(style === 'fall'){ fallDeathVfx(el, Math.round(ms*1.3)); try{ SoundKit.knockOut(); }catch(e){} }
      else if(style === 'burn'){ burnAwayVfx(el, Math.round(ms*1.25)); try{ SoundKit.burnAway(); }catch(e){} if(hasGsap()) gsap.to(el, {scale:.94, y:4, duration:ms*1.25/1000}); }
      else { bleedOutVfx(el, Math.round(ms*1.4), style); try{ SoundKit.bleedOut(style); }catch(e){} if(hasGsap()) gsap.to(el, {opacity:0, scale:.92, y:12, duration:ms*0.55/1000, delay:ms*0.85/1000}); }
      setTimeout(()=>{ if(my === deathToken) resetStage(stage); }, 2000);
    });
  }));

  // ---- pack leak
  $$('[data-leak]').forEach(b=> b.addEventListener('click', ()=>{
    const p = $('#leakPack'); p.classList.remove('leak-blue','leak-violet','leak-gold','is-shaking'); void p.offsetWidth;
    p.classList.add(b.dataset.leak, 'is-shaking'); try{ SoundKit.rareRise(b.dataset.leak==='leak-gold'); }catch(e){}
  }));

  // ---- leaves
  function leafDemo(){
    const s = $('#leafStage'); if(!hasGsap()) return;
    for(let i = 0; i < 14; i++){
      const l = document.createElement('span'); l.textContent = ['🍂','🍁','🍃'][i%3];
      l.style.cssText = 'position:absolute;left:-30px;font-size:22px;top:' + (10 + Math.random()*120) + 'px';
      s.appendChild(l);
      gsap.to(l, {x: s.clientWidth + 60, y: (Math.random()*60 - 30), rotation: Math.random()*540, duration: .6 + Math.random()*.3, delay: i*0.02, ease:'power1.in', onComplete:()=> l.remove()});
    }
  }

  // ---- motes (same sprite approach as the game)
  (function(){
    const cv = $('#motes'); if(!cv) return; const ctx = cv.getContext('2d');
    const fit = ()=>{ cv.width = cv.clientWidth; cv.height = cv.clientHeight; }; fit(); addEventListener('resize', fit);
    const spr = document.createElement('canvas'); spr.width = spr.height = 32; const g = spr.getContext('2d');
    const rg = g.createRadialGradient(16,16,0,16,16,16); rg.addColorStop(0, 'rgba(255,236,170,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0,0,32,32);
    const ps = Array.from({length:22}, ()=> ({x:Math.random()*cv.width, y:Math.random()*cv.height, v:.3+Math.random(), p:Math.random()*6.28, s:1+Math.random()*2.5}));
    let last = 0;
    const frame = t=>{ requestAnimationFrame(frame); if(t - last < 32) return; last = t; ctx.clearRect(0,0,cv.width,cv.height);
      ps.forEach(q=>{ q.y -= .3*q.v; q.x += Math.sin(t/1400 + q.p)*.6; if(q.y < -10){ q.y = cv.height + 10; q.x = Math.random()*cv.width; }
        const r = q.s*4; ctx.globalAlpha = Math.max(0, .35 + .35*Math.sin(t/900 + q.p)); ctx.drawImage(spr, q.x - r, q.y - r, r*2, r*2); ctx.globalAlpha = 1; }); };
    if(!reduce()) requestAnimationFrame(frame);
  })();

  // ---- battlefield shader lab
  let bf = null;
  const LIGHT = {heat:[1, 0.55, 0.18], cold:[0.45, 0.75, 1], poison:[0.5, 1, 0.35], physical:[1, 0.88, 0.62]};
  const KIND_MAP = {0:'m1',1:'m2',2:'m3',3:'m4',4:'m5',5:'m6',6:'m7',7:'m8',8:'m9',9:'m10',10:'m11',11:'m2'};
  function mountBf(){
    const host = $('#bfLab'); if(bf){ bf.destroy(); bf = null; }
    const felt = +$('#bfFelt').value, mapId = KIND_MAP[+$('#bfKind').value];
    host.classList.toggle('has-floor-art', felt === 2);
    host.style.setProperty('--map-art', felt === 2 ? `url(assets/maps/${mapId}.png)` : 'none');
    host.style.backgroundImage = felt === 2 ? `url(assets/maps/${mapId}.png)` : ''; host.style.backgroundSize = 'cover'; host.style.imageRendering = 'pixelated';
    if(!window.BramblewoodShaders || !BramblewoodShaders.isSupported()) return;
    bf = BramblewoodShaders.mount(host, {preset:'map', kind: +$('#bfKind').value, felt: +$('#bfFelt').value, prepend:true, intensity:0.55, shadows:'.bf-cards .card-tile'});
  }
  ['#bfKind', '#bfFelt'].forEach(sel=> $(sel).addEventListener('change', mountBf));
  $$('[data-light]').forEach(b=> b.addEventListener('click', ()=>{
    if(!bf) return; const tiles = $$('#bfLab .bf-cards .card-tile'); const host = $('#bfLab').getBoundingClientRect();
    const t = tiles[Math.floor(Math.random()*tiles.length)].getBoundingClientRect();
    bf.flash((t.left + t.width/2 - host.left)/host.width, (t.top + t.height/2 - host.top)/host.height, LIGHT[b.dataset.light], 0.8, 0.4, 700);
    try{ SoundKit.hitAt(4, false); }catch(e){}
  }));
  mountBf();

  // ---- sounds
  const CUES = [
    ['hitAt', 'Hit (light)', [3, false]], ['hitAt', 'Hit (heavy)', [10, true]], ['death', 'Death (base)'], ['bleedOut', 'Bleed-out', ['bleed']], ['bleedOut', 'Bleed-out (poison)', ['poison']], ['bleedOut', 'Bleed-out (cold)', ['cold']], ['burnAway', 'Burn-away'],
    ['castleCollapse', 'Castle falls'], ['arrowLoose', 'Bow loosed'], ['arrowLoose', 'Fire bow loosed', [true]], ['arrowThunk', 'Arrow lands'], ['pitchChime', 'Pitch'], ['heartbeat', 'Heartbeat'], ['heartbeat', 'Heartbeat (fast)', [true]], ['suddenDeathSting', 'Sudden death'],
    ['heroLevel', 'Hero level-up'], ['materiaForm', 'Materia forms'], ['rareRise', 'Rare reveal rise'], ['rareRise', 'Legendary reveal rise', [true]], ['gold', 'Gold'], ['unlock', 'Unlock'], ['prestigeTone', 'Prestige'], ['grace', 'Grace'],
    ['draw', 'Draw'], ['play', 'Play card'], ['cardFlip', 'Card flip'], ['pickup', 'Pick up'], ['deny', 'Deny'], ['buzz', 'Buzz'], ['dodge', 'Dodge'], ['shield', 'Shield'], ['clang', 'Armour clang'], ['growl', 'Growl'], ['exile', 'Exile'], ['launch', 'Launch'],
    ['quick', 'Quick'], ['stealthTone', 'Stealth'], ['reloadTone', 'Reload'], ['shellUp', 'Shell'], ['exposeTone', 'Expose'], ['stunTone', 'Stun'], ['curse', 'Curse'], ['poisonApply', 'Poison applied'], ['bleedApply', 'Bleed applied'], ['bleedTick', 'Bleed tick'], ['bubble', 'Bubble'], ['boom', 'Boom'], ['buffUp', 'Buff'],
    ['healTone', 'Heal'], ['freezeChime', 'Freeze'], ['sleepTone', 'Sleep'], ['paralyzeBuzz', 'Paralyze'], ['cleanseTone', 'Cleanse'], ['waitTickTone', 'Wait tick'], ['readyChime', 'Ready'], ['chainBreak', 'Chain break'], ['pierceTone', 'Pierce'], ['gashTone', 'Gash'], ['overwhelmTone', 'Overwhelm'],
    ['berserkTone', 'Berserk'], ['bulwarkTone', 'Bulwark'], ['reflectTone', 'Reflect'], ['momentumTone', 'Momentum'], ['bloomTone', 'Bloom'], ['ambushTone', 'Ambush'], ['siegeTone', 'Siege'], ['rallyTone', 'Rally'], ['earthquakeTone', 'Earthquake'], ['kingSlayerTone', 'King-slayer'], ['blindTone', 'Blind'], ['shockTone', 'Shock'],
    ['corrodeTone', 'Corrode'], ['staggerTone', 'Stagger'], ['devilryTone', 'Devilry'], ['critTone', 'Crit'], ['rendTone', 'Rend'], ['festerBite', 'Fester'], ['ruptureBite', 'Rupture'], ['frenzyTone', 'Frenzy'], ['swipeTone', 'Swipe'], ['sweepTone', 'Sweep'], ['woodKnock', 'Wood knock'], ['codeCopy', 'Code copied'], ['itemDrop', 'Item drop'], ['shift', 'Shift'], ['sapDrain', 'Sap drain'], ['scarMark', 'Scar'], ['gritUp', 'Grit'], ['espritTone', 'Esprit'],
  ];
  const sg = $('#sndGrid');
  CUES.forEach(([fn, label, args])=>{
    if(typeof SoundKit === 'undefined' || typeof SoundKit[fn] !== 'function') return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = '🔊 ' + label;
    b.onclick = ()=>{ try{ SoundKit[fn].apply(SoundKit, args || []); }catch(e){} };
    sg.appendChild(b);
  });
  const PEOPLE = [['legion', '🛡️ Rivergate Legion', 'Shields up. Hold the line.'], ['tribes', '🪶 Sunfeather Tribes', 'The Bloom sings for us today!'], ['road', '🧳 Road-folk', 'Everything is for sale, friend.'], ['beast', '🐾 Wild beasts', 'You smell like supper.'], ['hive', '🐝 The Hive', 'We hold. We always hold.'], ['deep', '🌊 The Deep', 'The tide remembers.'], ['folk', '🌾 Woodland folk', 'Another army through the turnips.']];
  const bg = $('#babbleGrid');
  PEOPLE.forEach(([k, label, line])=>{ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.innerHTML = label + '<br><small style="opacity:.7">“' + line + '”</small>'; b.onclick = ()=>{ try{ SoundKit.babble(k, line); }catch(e){} }; bg.appendChild(b); });

  // ---- ambience
  const PLACES = [['home', 'Home'], ['tent', 'Armoury Tent'], ['cart', "Traveller's Cart"], ['nest', 'Old Nest'], ['forge', 'Forge'], [0, 'Outskirts'], [1, 'Sunken Hollow'], [2, 'Ashen Peak'], [3, 'Caves'], [4, 'Savanna'], [5, 'Tundra'], [6, 'Coral Current'], [7, 'Swamp'], [8, 'Foundry'], [9, 'Eyrie'], [10, 'Sundered Peak'], [11, 'Rain']];
  const ag = $('#ambGrid');
  PLACES.forEach(([k, label])=>{ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = '🎵 ' + label; b.onclick = ()=>{ try{ Ambience.setVolume(0.6); Ambience.play(k); $$('#ambGrid .btn').forEach(x=> x.classList.remove('primary')); b.classList.add('primary'); }catch(e){} }; ag.appendChild(b); });
  const stop = document.createElement('button'); stop.type = 'button'; stop.className = 'btn small ghost'; stop.textContent = '⏹ Stop'; stop.onclick = ()=>{ try{ Ambience.stop(); }catch(e){} $$('#ambGrid .btn').forEach(x=> x.classList.remove('primary')); }; ag.appendChild(stop);

  // ---- full list
  const ALL = [
    ['Cards', 'Holo foil (pearl, rainbow, cosmos)', 'live', 'Nest, card detail, pack reveals'], ['Cards', 'Gold-leaf rim with sliding streak', 'live', 'Legendary+ cards'], ['Cards', 'Parchment name scroll', 'live', 'Every card'],
    ['Cards', 'Enamel cost/Wait pills, dark stat chips', 'live', 'Every card'], ['Cards', 'Hero card ring and badge; level-up ring', 'live', 'Hero Hall'], ['Cards', 'Materia burst', 'live', 'Hero Hall, Forge bench'], ['Cards', 'Shine sweep', 'part', 'New cards, rewards'],
    ['Cards', 'Embossed gold lettering', 'idea', 'Legendary names'], ['Cards', 'Stained glass', 'idea', 'Grace cards'], ['Cards', 'Pixel shatter', 'idea', 'Token deaths, Exile'], ['Cards', 'Frost creep', 'idea', 'Frozen status'], ['Cards', 'Chromatic glitch', 'idea', 'Shock, Devilry'],
    ['Combat', 'Damage numbers (gradient, outlined, typed)', 'live', 'All hits and ticks'], ['Combat', 'Attack lunge with wind-up', 'live', 'Every attack'], ['Combat', 'Impact squash and recoil', 'live', 'Melee hits'], ['Combat', 'Hit-stop on heavy blows', 'live', 'Hits of 8+, castle hits'],
    ['Combat', 'Bleed-out deaths (bleed, poison, cold)', 'live', 'Card deaths'], ['Combat', 'Burn-away deaths', 'live', 'Fire deaths, falling castle'], ['Combat', 'Arrow and Fire Arrow projectiles', 'live', 'Arrow skills'], ['Combat', 'Victory dance and loser scatter', 'live', 'Match end'],
    ['Combat', 'Attack preview line under cards', 'live', 'Battlefield hover'], ['Combat', 'Pitch badge on the Graveyard', 'live', 'Dragging a hand card'], ['Combat', 'Snap guard (no card teleports)', 'live', 'Battlefield'], ['Combat', 'Low-castle danger pulse', 'live', 'Castle under 25%'],
    ['Battlefield', 'Map weather overlay (12 looks)', 'live', 'Under the cards'], ['Battlefield', 'Lit cloth felt / light-only floor', 'live', 'Every battle'], ['Battlefield', 'Ground material per map', 'live', 'Wet, ash, frost, sand maps'], ['Battlefield', 'Impact point lights', 'live', 'Every hit'],
    ['Battlefield', 'Shockwave ring', 'live', 'Castle hits, 8+ blows'], ['Battlefield', 'Card shadows on the floor', 'live', 'Every battle'], ['Battlefield', 'Rain showers', 'live', 'Wet maps; a third of Outskirts fights'], ['Battlefield', 'Heat haze over fire cards', 'idea', 'Fire cards'], ['Battlefield', 'Noise dissolve deaths', 'idea', 'Card deaths'],
    ['Screens', 'Splash depth parallax, god rays, water', 'live', 'Splash and Home'], ['Screens', 'Live clock tints and motes', 'live', 'Everywhere outside fights'], ['Screens', 'Places: Tent, Cart, Nest, Forge entrances', 'live', 'Deck, Shop, Nest, Forge'], ['Screens', 'Leaf sweep transitions', 'live', 'Menu changes'],
    ['Screens', 'Versus opener', 'live', 'Before Conquest fights'], ['Screens', 'Victory/Defeat sign with confetti', 'live', 'Match end'], ['Screens', 'Pack light leak and held breath', 'live', 'Pack openings'], ['Screens', 'Page curl, pixelate, ink wash transitions', 'idea', 'Codex, battles, lore'],
    ['Sound', 'Synth cue set (90+ cues)', 'live', 'Everywhere'], ['Sound', 'Stereo panning of hits and deaths', 'live', 'Battles'], ['Sound', 'Ambience per place', 'live', '“Music & ambience” slider'], ['Sound', 'Ambience ducking', 'live', 'Big moments'],
    ['Sound', 'Heartbeat and sudden-death sting', 'live', 'Battles'], ['Sound', 'Rival babble voices', 'live', 'Versus opener'], ['Sound', 'Recorded samples for top 5 cues', 'idea', 'Needs audio files'], ['Sound', 'Generative music per people', 'idea', 'Waits on sound direction (D17)'],
    ['Animation', 'Walking map pawn', 'idea', 'Conquest map'], ['Animation', 'Hourglass flip on Wait', 'idea', 'Board cards'], ['Animation', 'Idle breathing on board cards', 'live', 'Board cards'], ['Animation', 'Low-HP tremble', 'live', 'Units at ≤25% HP'], ['Battlefield', 'Castle cracks by HP stage', 'live', 'Castles'], ['Animation', 'Ready pulse', 'live', 'Wait reaches 0'],
    ['TBC', 'Frost creep', 'idea', 'Coming next'],['TBC', 'Pixel shatter for tokens', 'idea', 'Coming next'],['TBC', 'Chromatic glitch on shock', 'idea', 'Coming next'],['Battlefield', 'Sudden-death red sky', 'live', 'Turn 20 onward'],['Battlefield', 'Storm lightning with thunder', 'live', 'Storm and rain fields'],['Animation', 'Card drag trail', 'live', 'Dragging a hand card'],['TBC', 'Deck shuffle at match start', 'idea', 'Coming next'],['TBC', 'Draw flip from deck', 'idea', 'Coming next'],['TBC', 'Victory parade', 'idea', 'Coming next'],['TBC', 'Leader summon throne', 'idea', 'Coming next'],['TBC', 'Raid telegraph glow', 'idea', 'Coming next'],['TBC', 'Water ripples under cards', 'idea', 'Coming next'],['TBC', 'Feather burst on flyers', 'idea', 'Coming next'],
  ];
  const label = {live:'<span class="st live">Live</span>', part:'<span class="st part">Partly</span>', idea:'<span class="st idea">Idea</span>'};
  $('#allTbl').innerHTML = '<thead><tr><th>Area</th><th>Effect</th><th>Status</th><th>Where</th></tr></thead><tbody>' + ALL.map(r=> `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${label[r[2]]}</td><td>${r[3]}</td></tr>`).join('') + '</tbody>';
})();

// ===== Combat skills + card ideas (2026-10-06) =====
(function(){
  const $ = (s, r)=> (r||document).querySelector(s), $$ = (s, r)=> [...(r||document).querySelectorAll(s)];
  const arena = $('#skillArena'); if(!arena || !window.SkillFX) return;
  const enemy = ()=> $$('.sk-enemy .card-tile', arena), mine = ()=> $$('.sk-mine .card-tile', arena);
  const shooter = ()=> mine()[1];
  const slow = ()=> $('#skSlow') && $('#skSlow').checked ? 4 : 1;
  const setSpeed = ()=>{ if(window.gsap) gsap.globalTimeline.timeScale(1/slow()); };
  const dmg = (el, txt, cls)=>{
    const f = document.createElement('div'); f.className = 'dmg-float' + (cls ? ' ' + cls : '') + (/^-\d+$/.test(txt) && Math.abs(parseInt(txt,10))>=8 ? ' heavy' : ''); f.textContent = txt; f.dataset.t = txt;
    (el.closest('.board-card') || el.parentElement || el).appendChild(f);
    if(!window.gsap){ setTimeout(()=> f.remove(), 1000); return; }
    f.style.animation = 'none'; gsap.set(f, {position:'absolute', left:'50%', top:'35%', xPercent:-50, opacity:0, scale:.6});
    gsap.timeline({onComplete:()=> f.remove()}).to(f, {opacity:1, scale:1.1, y:-20, duration:.16, ease:'back.out(2.6)'}).to(f, {y:-46, duration:.55}, '<0.02').to(f, {opacity:0, y:-58, duration:.35}, '>-0.1');
  };
  const pick = ()=> enemy()[Math.floor(Math.random()*3)];
  const S = (fn, ...a)=>{ try{ SoundKit[fn](...a); }catch(e){} };
  const run = {
    arrow(){ const t = pick(); SkillFX.bowShot(shooter(), t, {draw:240, flight:260, onRelease:()=> S('arrowLoose', false), onImpact:()=>{ S('arrowThunk', false); S('hitAt', 3, false); dmg(t, '-3'); }}); S('bowDraw', false, 240); },
    fire(){ const t = pick(); S('bowDraw', true, 240); SkillFX.bowShot(shooter(), t, {fire:true, draw:240, flight:260, onRelease:()=> S('arrowLoose', true), onImpact:()=>{ S('arrowThunk', true); S('burnAway'); dmg(t, '-5'); }}); },
    volley(){ S('bowDraw', false, 240); SkillFX.volley(shooter(), enemy(), {draw:240, flight:300, onRelease:()=> S('arrowLoose', false), onEachImpact:(t)=>{ S('arrowThunk', false); dmg(t, '-2'); }});  },
    pierce(){ const e = enemy(); S('bowDraw', false, 240); SkillFX.pierce(shooter(), e[1], e[0], {draw:240, flight:240, onRelease:()=> S('arrowLoose', false), onFirst:()=>{ S('pierceTone'); dmg(e[1], '-4'); }, onSecond:()=>{ S('arrowThunk', false); dmg(e[0], '-2'); }}); },
    dart(){ const t = pick(); S('launch'); SkillFX.dart(shooter(), t, {flight:220, onImpact:()=>{ S('poisonApply'); dmg(t, '-1', 'poison'); }}); },
    frost(){ const t = pick(); S('launch'); SkillFX.frostBolt(shooter(), t, {flight:320, onImpact:()=>{ S('freezeChime'); dmg(t, '-2', 'debuff'); }}); },
    lightning(){ S('shockTone'); SkillFX.lightning(shooter(), enemy(), {onEachImpact:(t)=>{ S('hitAt', 2, false); dmg(t, '-2', 'debuff'); }}); },
    heal(){ const t = mine()[0]; S('healTone'); SkillFX.heal(t); dmg(t, '+3', 'heal'); },
    shield(){ const t = mine()[2]; S('shield'); SkillFX.shieldUp(t); },
    rally(){ S('rallyTone'); SkillFX.rally(mine()); },
  };
  $$('[data-skill]').forEach(b=> b.addEventListener('click', ()=>{ setSpeed(); run[b.dataset.skill] && run[b.dataset.skill](); }));
  const sl = $('#skSlow'); if(sl) sl.addEventListener('change', setSpeed);

  // --- card ideas
  const bs = $('#breathStage'); if(bs) bs.classList.add('breathe');
  const cardRun = {
    slam(){ const t = $('#slamStage .card-tile'); if(!t || !window.gsap) return; const st = $('#slamStage');
      gsap.timeline().fromTo(t, {y:-120, rotation:-8, scale:1.15, opacity:0}, {y:0, rotation:0, scale:1, opacity:1, duration:.32, ease:'power3.in'})
        .to(t, {scaleY:.9, scaleX:1.07, duration:.06, ease:'power2.out', transformOrigin:'50% 100%'}).to(t, {scaleX:1, scaleY:1, duration:.35, ease:'elastic.out(1, .4)', clearProps:'transform'})
        .add(()=>{ S('play'); S('boom'); const r = t.getBoundingClientRect(), sr = st.getBoundingClientRect();
          for(let i = 0; i < 8; i++){ const p = document.createElement('span'); p.className = 'dust-puff'; st.appendChild(p);
            gsap.set(p, {left:r.left - sr.left + r.width*(i/7), top:r.bottom - sr.top - 8, scale:.5, opacity:.9});
            gsap.to(p, {x:(i/7 - .5)*80, y:-10 - Math.random()*14, scale:1.8, opacity:0, duration:.6, ease:'power2.out', onComplete:()=> p.remove()}); }
          gsap.fromTo(st, {y:0}, {y:3, duration:.05, yoyo:true, repeat:3}); }, .32); },
    wait(){ const t = $('#waitStage .card-tile'); if(!t) return; let b = t.querySelector('.waitbadge');
      if(!b){ b = document.createElement('div'); b.className = 'waitbadge'; b.textContent = '⏳2'; t.appendChild(b); }
      const n = parseInt((b.textContent.match(/\d+/)||['2'])[0], 10); const next = n > 0 ? n - 1 : 2;
      if(window.gsap) gsap.timeline().to(b, {rotation:180, scale:1.35, duration:.22, ease:'power2.in'}).add(()=>{ b.textContent = '⏳' + next; S('waitTickTone'); }).to(b, {rotation:360, scale:1, duration:.3, ease:'back.out(2)'}).set(b, {rotation:0});
      if(next === 0) setTimeout(()=>{ t.classList.add('ready-flare'); S('readyChime'); setTimeout(()=> t.classList.remove('ready-flare'), 700); }, 520); },
    shine(){ const t = $('#shineStage .card-tile'); if(!t) return; const s = document.createElement('span'); s.className = 'shine-sweep'; t.appendChild(s); S('gold'); setTimeout(()=> s.remove(), 800); },
    ready(){ const t = $('#readyStage .card-tile'); if(!t) return; t.classList.add('ready-flare'); S('readyChime');
      if(window.gsap) gsap.timeline().to(t, {y:-12, duration:.14, ease:'power2.out'}).to(t, {y:0, duration:.3, ease:'bounce.out', clearProps:'transform'});
      setTimeout(()=> t.classList.remove('ready-flare'), 700); },
    crit(){ const c = $('#critStage .board-card') || $('#critStage .card-tile'); if(!c) return; floatText(c, '-11', 'crit'); try{ critStampVfx(c); SoundKit.critTone(); SoundKit.hitAt(11, true); SkillFX.knock(c.querySelector('.card-tile')||c, -90, 1.2); }catch(e){} },
  };
  cardRun.low = ()=>{ const w = $('#lowStage'); const t = w && w.querySelector('.card-tile'); if(!t) return; const on = !w.classList.contains('lowhp'); w.classList.toggle('lowhp', on); t.style.animation = on ? 'lowHpTremble 2.4s ease-in-out infinite' : ''; const hp = t.querySelector('.stats .hp'); if(hp){ hp.style.color = on ? '#ff8a7a' : ''; hp.style.textShadow = on ? '0 0 6px rgba(255,60,40,.7)' : ''; } };
  $$('[data-crack]').forEach(b=> b.addEventListener('click', ()=>{ const t = $('#crackStage .card-tile'); if(!t) return; const n = +b.dataset.crack;
    const prev = [1,2,3].find(k=> t.classList.contains('crack-'+k)) || 0; t.classList.remove('crack-1','crack-2','crack-3'); if(n) t.classList.add('crack-'+n);
    if(n > prev){ t.classList.remove('crack-new'); void t.offsetWidth; t.classList.add('crack-new'); S('siegeTone'); setTimeout(()=> t.classList.remove('crack-new'), 520); } }));
  { let on = false, last = 0;
    const dc = $('#dragStage .card-tile'); if(dc){ dc.setAttribute('draggable', 'true');
      dc.addEventListener('dragstart', e=>{ on = true; e.dataTransfer.setData('text/plain', 'x'); });
      dc.addEventListener('dragend', ()=> on = false); }
    document.addEventListener('dragover', e=>{ if(!on || reduce()) return; e.preventDefault(); const now = performance.now(); if(now - last < 40) return; last = now;
      const sp = document.createElement('span'); sp.className = 'drag-spark'; sp.style.left = (e.clientX + Math.random()*16 - 8) + 'px'; sp.style.top = (e.clientY + Math.random()*16 - 8) + 'px';
      sp.style.setProperty('--dx', (Math.random()*20 - 10).toFixed(0) + 'px'); document.body.appendChild(sp); setTimeout(()=> sp.remove(), 560); });
  }
  $$('[data-card]').forEach(b=> b.addEventListener('click', ()=> cardRun[b.dataset.card] && cardRun[b.dataset.card]()));
})();
