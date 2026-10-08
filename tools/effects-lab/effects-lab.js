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

  // ---- damage numbers: floatText is the game's own (lifted into fx-src).
  $$('[data-dmg]').forEach(b=> b.addEventListener('click', ()=>{
    const [t, cls] = b.dataset.dmg.split('|'); const card = $('#dmgStage .board-card');
    labHit(card, t, cls);
  }));
  // One hit with its sound, as the game plays it (used by Combat and the Damage numbers tab).
  function labHit(card, t, cls){
    floatText(card, t, cls);
    try{ recoilEl(card, /crit/.test(cls||'') ? 1.5 : 0.9); }catch(e){}
    try{
      if(/crit/.test(cls||'')){ critStampVfx(card); SoundKit.critTone(); SoundKit.hitAt(9, true); }
      else if(/poison/.test(cls||'')) SoundKit.bubble(); else if(/bleed/.test(cls||'')) SoundKit.bleedTick();
      else if(cls==='heal') SoundKit.healTone(); else if(cls==='gold') SoundKit.gold(); else if(cls==='blocked') SoundKit.shield();
      else if(cls==='cold') SoundKit.freezeChime(); else SoundKit.hitAt(Math.abs(parseInt(t.replace(/[^\d-]/g,''),10))||1, Math.abs(parseInt(t,10)) >= 8);
    }catch(e){}
  }
  window.labHit = labHit;
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
    pixel(){ pixelReveal(700); },
    ripple(){ if(!bf || !bf.wave) return; const tiles = $$('#bfLab .bf-cards .card-tile'); const host = $('#bfLab').getBoundingClientRect(); const t = tiles[Math.floor(Math.random()*tiles.length)].getBoundingClientRect();
      bf.wave((t.left + t.width/2 - host.left)/host.width, (t.top + t.height*0.9 - host.top)/host.height, [0.55, 0.8, 1], 0.45, 1000); },
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
  mountBf(); window.__labMountBf = mountBf;

  // ---- sounds
  const CUES = [
    ['hitAt', 'Hit (light)', [3, false]], ['hitAt', 'Hit (heavy)', [10, true]], ['death', 'Death (base)'], ['bleedOut', 'Bleed-out', ['bleed']], ['bleedOut', 'Bleed-out (poison)', ['poison']], ['bleedOut', 'Bleed-out (cold)', ['cold']], ['burnAway', 'Burn-away'],
    ['castleCollapse', 'Castle falls'], ['arrowLoose', 'Bow loosed'], ['arrowLoose', 'Fire bow loosed', [true]], ['arrowThunk', 'Arrow lands'], ['pitchChime', 'Pitch'], ['heartbeat', 'Heartbeat'], ['heartbeat', 'Heartbeat (fast)', [true]], ['suddenDeathSting', 'Sudden death'],
    ['heroLevel', 'Hero level-up'], ['materiaForm', 'Materia forms'], ['rareRise', 'Rare reveal rise'], ['rareRise', 'Legendary reveal rise', [true]], ['gold', 'Gold'], ['unlock', 'Unlock'], ['prestigeTone', 'Prestige'], ['grace', 'Grace'],
    ['draw', 'Draw'], ['play', 'Play card'], ['cardFlip', 'Card flip'], ['pickup', 'Pick up'], ['deny', 'Deny'], ['buzz', 'Buzz'], ['dodge', 'Dodge'], ['shield', 'Shield'], ['clang', 'Armour clang'], ['growl', 'Growl'], ['exile', 'Exile'], ['launch', 'Launch'],
    ['quick', 'Quick'], ['stealthTone', 'Stealth'], ['reloadTone', 'Reload'], ['shellUp', 'Shell'], ['exposeTone', 'Expose'], ['stunTone', 'Stun'], ['curse', 'Curse'], ['poisonApply', 'Poison applied'], ['bleedApply', 'Bleed applied'], ['bleedTick', 'Bleed tick'], ['bubble', 'Bubble'], ['boom', 'Boom'], ['buffUp', 'Buff'],
    ['healTone', 'Heal'], ['freezeChime', 'Freeze'], ['sleepTone', 'Sleep'], ['paralyzeBuzz', 'Paralyze'], ['cleanseTone', 'Cleanse'], ['waitTickTone', 'Wait tick'], ['readyChime', 'Ready'], ['pageTurn', 'Page turn'], ['pawnStep', 'Pawn step'], ['pixelShatter', 'Token shatter'], ['featherFlutter', 'Feathers'], ['chainBreak', 'Chain break'], ['pierceTone', 'Pierce'], ['gashTone', 'Gash'], ['overwhelmTone', 'Overwhelm'],
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
    ['Combat', 'Bleed-out deaths (bleed, poison, cold)', 'live', 'Card deaths'], ['Combat', 'Burn-away deaths', 'live', 'Fire deaths, falling castle'], ['Combat', 'Arrow and Fire Arrow projectiles', 'live', 'Arrow skills'], ['Combat', 'Loser slump', 'live', 'Match end'],
    ['Combat', 'Attack preview line under cards', 'live', 'Battlefield hover'], ['Combat', 'Pitch badge on the Graveyard', 'live', 'Dragging a hand card'], ['Combat', 'Snap guard (no card teleports)', 'live', 'Battlefield'], ['Combat', 'Low-castle danger pulse', 'live', 'Castle under 25%'],
    ['Battlefield', 'Map weather overlay (12 looks)', 'live', 'Under the cards'], ['Battlefield', 'Lit cloth felt / light-only floor', 'live', 'Every battle'], ['Battlefield', 'Ground material per map', 'live', 'Wet, ash, frost, sand maps'], ['Battlefield', 'Impact point lights', 'live', 'Every hit'],
    ['Battlefield', 'Shockwave ring', 'live', 'Castle hits, 8+ blows'], ['Battlefield', 'Card shadows on the floor', 'live', 'Every battle'], ['Battlefield', 'Rain showers', 'live', 'Wet maps; a third of Outskirts fights'], ['Battlefield', 'Heat haze over fire cards', 'live', 'Fire cards'], ['Battlefield', 'Noise dissolve deaths', 'idea', 'Card deaths'],
    ['Screens', 'Splash depth parallax, god rays, water', 'live', 'Splash and Home'], ['Screens', 'Live clock tints and motes', 'live', 'Everywhere outside fights'], ['Screens', 'Places: Tent, Cart, Nest, Forge entrances', 'live', 'Deck, Shop, Nest, Forge'], ['Screens', 'Leaf sweep transitions', 'live', 'Menu changes'],
    ['Screens', 'Versus opener', 'live', 'Before Conquest fights'], ['Screens', 'Victory/Defeat sign with confetti', 'live', 'Match end'], ['Screens', 'Pack light leak and held breath', 'live', 'Pack openings'], ['Screens', 'Codex page turn; pixel reveal into battles', 'live', 'Codex, battles'], ['Screens', 'Ink-wash transition for lore', 'idea', 'Lore screens'],
    ['Sound', 'Synth cue set (90+ cues)', 'live', 'Everywhere'], ['Sound', 'Stereo panning of hits and deaths', 'live', 'Battles'], ['Sound', 'Ambience per place', 'live', '“Music & ambience” slider'], ['Sound', 'Ambience ducking', 'live', 'Big moments'],
    ['Sound', 'Heartbeat and sudden-death sting', 'live', 'Battles'], ['Sound', 'Rival babble voices', 'live', 'Versus opener'], ['Sound', 'Recorded samples for top 5 cues', 'idea', 'Needs audio files'], ['Sound', 'Generative music per people', 'idea', 'Waits on sound direction (D17)'],
    ['Animation', 'Walking map pawn (hops node to node)', 'live', 'Conquest map'], ['Animation', 'Hourglass flip on Wait', 'idea', 'Board cards'], ['Animation', 'Idle breathing on board cards', 'live', 'Board cards'], ['Animation', 'Low-HP tremble', 'live', 'Units at ≤25% HP'], ['Battlefield', 'Castle cracks by HP stage', 'live', 'Castles'], ['Animation', 'Ready pulse', 'live', 'Wait reaches 0'],
    ['Combat', 'Frost creep on frozen units', 'live', 'Freeze'],['Combat', 'Pixel shatter for tokens', 'live', 'Token deaths'],['Combat', 'Chromatic glitch on shock', 'live', 'Shock'],['Combat', 'Feather burst on flyers', 'live', 'Hits on flyers'],['Battlefield', 'Sudden-death red sky', 'live', 'Turn 20 onward'],['Battlefield', 'Storm lightning with thunder', 'live', 'Storm and rain fields'],['Animation', 'Card drag trail', 'live', 'Dragging a hand card'],['Animation', 'Deck shuffle at match start', 'live', 'Match start'],['Animation', 'Draw flip from the deck', 'live', 'Every draw'],['Animation', 'Victory toss (launch, knock about, land)', 'live', 'Match end'],['Cards', 'Lattice foil (43° grid)', 'idea', 'Foils tab'],['Cards', 'Starlight sparkle finish', 'live', 'Legendary and up'],['Animation', 'Card emotes (16 moods)', 'live', 'Board cards'],['Animation', 'Leader summon throne', 'live', 'Summoning your leader'],['Combat', 'Raid telegraph: boss glows, arrow down the lane', 'live', 'Raid trench'],['Battlefield', 'Water ripples under landing cards', 'live', 'Water and rain fields'],
    ['Battlefield', 'Raindrops on cards', 'live', 'Water and rain fields'],['Screens', 'Boss entrance', 'live', 'Boss skirmishes'],['Screens', 'Coin shower on rewards', 'live', 'Results screen'],['TBC', 'Combo counter', 'idea', 'Coming next'],['TBC', 'Card tilt in hand', 'idea', 'Coming next'],['Screens', 'Seasonal maps', 'live', 'Conquest maps'],
  ];
  const label = {live:'<span class="st live">Live</span>', part:'<span class="st part">Partly</span>', idea:'<span class="st idea">Idea</span>'};
  $('#allTbl').innerHTML = '<thead><tr><th>Area</th><th>Effect</th><th>Status</th><th>Where</th></tr></thead><tbody>' + ALL.map(r=> `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${label[r[2]]}</td><td>${r[3]}</td></tr>`).join('') + '</tbody>';
})();

// ===== Combat skills + card ideas (2026-10-06) =====
(function(){
  const $ = (s, r)=> (r||document).querySelector(s), $$ = (s, r)=> [...(r||document).querySelectorAll(s)];
  const reduce = ()=> window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  // Drag trail (2026-10-08, user: "The card drag trail doesn't work. I suspect I'm dragging the over-div"): the whole
  // card (any child you grab) now follows the pointer like a hand card, tilting with speed, a gold sparkle
  // trail behind it, and flies home when you let go.
  { const stage = $('#dragStage'); const dc = stage && stage.querySelector('.card-tile');
    if(dc){
      dc.style.touchAction = 'none'; dc.style.cursor = 'grab';
      dc.querySelectorAll('img').forEach(i=>{ i.draggable = false; });
      let drag = null, last = 0;
      dc.addEventListener('pointerdown', e=>{ if(e.button) return; e.preventDefault();
        dc.setPointerCapture(e.pointerId); if(window.gsap) gsap.killTweensOf(dc);
        drag = {x0:e.clientX, y0:e.clientY, lx:e.clientX, vx:0}; dc.style.cursor = 'grabbing'; dc.style.zIndex = 30; try{ SoundKit.pickup(); }catch(er){} });
      dc.addEventListener('pointermove', e=>{ if(!drag) return;
        const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.vx = drag.vx*0.7 + (e.clientX - drag.lx)*0.3; drag.lx = e.clientX;
        const tilt = Math.max(-30, Math.min(30, drag.vx*2.2));
        dc.style.transform = `translate(${dx}px, ${dy}px) rotate(${tilt.toFixed(1)}deg) scale(1.06)`;
        const now = performance.now(); if(reduce() || now - last < 35) return; last = now;
        const sp = document.createElement('span'); sp.className = 'drag-spark'; sp.style.left = (e.clientX + Math.random()*16 - 8) + 'px'; sp.style.top = (e.clientY + Math.random()*16 - 8) + 'px';
        sp.style.setProperty('--dx', (Math.random()*20 - 10).toFixed(0) + 'px'); document.body.appendChild(sp); setTimeout(()=> sp.remove(), 560); });
      const end = ()=>{ if(!drag) return; drag = null; dc.style.cursor = 'grab';
        if(window.gsap){ const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(dc.style.transform) || [0,0,0];
          dc.style.transform = ''; gsap.fromTo(dc, {x:+m[1], y:+m[2], rotation:0, scale:1.06}, {x:0, y:0, scale:1, duration:.38, ease:'back.out(1.6)', clearProps:'transform', onComplete:()=>{ dc.style.zIndex = ''; }}); }
        else { dc.style.transform = ''; dc.style.zIndex = ''; } };
      dc.addEventListener('pointerup', end); dc.addEventListener('pointercancel', end);
    } }
  $$('[data-st]').forEach(b=> b.addEventListener('click', ()=>{
    const c = $('#statusStage .board-card'); if(!c) return; const k = b.dataset.st;
    if(k === 'frost'){ const on = !c.classList.contains('is-frozen'); c.classList.toggle('is-frozen', on); if(on) S('freezeChime'); }
    if(k === 'shock'){ glitchVfx(c); S('shockTone'); }
    if(k === 'feather'){ featherBurst(c); S('featherFlutter'); S('hitAt', 3, false); }
    if(k === 'shatter'){ c.classList.remove('is-frozen'); if(pixelShatterVfx(c, 900)){ S('pixelShatter'); setTimeout(()=>{ const t = c.querySelector('.card-tile'); if(t) gsap.to(t, {opacity:1, duration:.3}); }, 1400); } }
  }));
  cardRun.throne = ()=>{ const t = $('#throneStage .card-tile'); if(t) leaderThroneVfx(t); };
  cardRun.shuffle = ()=> deckShuffleVfx([$('#shuffleStage .deck-widget')]);
  { const hb = $('#hazeStage .board-card'); if(hb && !hb.querySelector('.heat-haze')) hb.insertAdjacentHTML('beforeend', '<span class="heat-haze" aria-hidden="true"><i></i><i></i></span>'); }
  cardRun.draw = ()=>{ // 2026-10-08: reset the card each time so it can be drawn again
    const slot = $('#drawStage .card-tile'); if(!slot) return; const host = slot.parentElement;
    if(window.gsap) gsap.killTweensOf(host.querySelectorAll('*'));
    host.innerHTML = window.__drawCardHTML || (window.__drawCardHTML = host.innerHTML);
    const t = host.querySelector('.card-tile'); t.style.cssText = ''; drawFlipVfx([t], $('#drawStage .deck-widget'), 0); };
  cardRun.parade = ()=>{ victoryParade($('#paradeStage'), -1); try{ SoundKit.win && SoundKit.win(); }catch(e){} };
  $$('[data-card]').forEach(b=> b.addEventListener('click', ()=> cardRun[b.dataset.card] && cardRun[b.dataset.card]()));
})();

// Card treatment centre (2026-10-08): swap the card across every finish, and an auto-tilt that
// walks the light around each card so the foils show without hovering.
(function(){
  const sel = document.getElementById('treatCard'), auto = document.getElementById('treatAuto'); if(!sel) return;
  const stages = [...document.querySelectorAll('.treat-stage')];
  const star = document.getElementById('treatStar');
  const paint = ()=>{ const html = (window.TREAT_CARDS||{})[sel.value]; if(!html) return; const plus = star && star.checked;
    stages.forEach(st=>{ let cls = st.dataset.treat; if(plus && cls !== 'holo-starlight') cls = (cls ? cls + ' ' : '') + 'holo-starlight';
      st.innerHTML = cls ? html.replace('class="card-tile ', 'class="card-tile is-holo ' + cls + ' ') : html; });
    if(typeof decorateHolo==='function') decorateHolo(document.getElementById('treatments')); };
  sel.addEventListener('change', paint); if(star) star.addEventListener('change', paint);
  let t0 = performance.now();
  const loop = now=>{
    if(auto && auto.checked){
      const a = (now - t0) / 1600;
      document.querySelectorAll('#treatments .card-tile.is-holo:not(.holo-active)').forEach((el, i)=>{
        const px = 0.5 + Math.cos(a + i*0.6)*0.42, py = 0.5 + Math.sin(a*1.3 + i*0.6)*0.36;
        el.style.setProperty('--hx', (px*100).toFixed(1)+'%'); el.style.setProperty('--hy', (py*100).toFixed(1)+'%');
        el.style.setProperty('--hbx', (50 + (px-0.5)*60).toFixed(1)+'%'); el.style.setProperty('--hby', (50 + (py-0.5)*60).toFixed(1)+'%');
        el.style.setProperty('--hrx', ((0.5-py)*12).toFixed(2)+'deg'); el.style.setProperty('--hry', ((px-0.5)*16).toFixed(2)+'deg');
        el.classList.add('holo-tilt');
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  if(typeof decorateHolo==='function') decorateHolo(document.getElementById('treatments'));
})();


// ===== Tabs, card displays, damage numbers, weather (2026-10-08) =====
(function(){
  const $ = (s, r)=> (r||document).querySelector(s), $$ = (s, r)=> [...(r||document).querySelectorAll(s)];
  // --- tabs: one section at a time (user: "separate all effects into their own tabs, not a long page")
  const tabs = $$('nav.toc [data-tab]'), secs = tabs.map(t=> document.getElementById(t.dataset.tab)).filter(Boolean);
  const shown = new Set();
  function show(id){
    if(!secs.some(s=> s.id === id)) id = 'skills';
    secs.forEach(s=> s.hidden = s.id !== id);
    tabs.forEach(t=> t.setAttribute('aria-selected', String(t.dataset.tab === id)));
    try{ history.replaceState(null, '', '#' + id); }catch(e){}
    window.dispatchEvent(new Event('resize'));
    if(id === 'battlefield' && !shown.has(id) && window.__labMountBf) window.__labMountBf();
    if(id === 'screens') mountAtmo(curAtmo);
    shown.add(id);
  }
  tabs.forEach(t=> t.addEventListener('click', ()=> show(t.dataset.tab)));
  window.addEventListener('hashchange', ()=> show(location.hash.slice(1)));

  // --- card displays
  const SIZES = [['Mini (deck list, rewards)', 46], ['Small (collection grid)', 72], ['Normal', 110], ['Hand', 96], ['Normal blow-up (hover)', 150], ['Super blow-up (card detail)', 340]];
  function tileAt(html, w, extra){ const box = document.createElement('div'); box.innerHTML = html; const t = box.firstElementChild; if(extra) t.classList.add(...extra.split(' '));
    t.style.setProperty('width', w + 'px', 'important'); t.style.setProperty('height', Math.round(w*1.25) + 'px', 'important'); t.style.margin = '0'; return t; }
  function fig(node, cap){ const f = document.createElement('figure'); f.appendChild(node); const c = document.createElement('figcaption'); c.textContent = cap; f.appendChild(c); return f; }
  const PARTS = [['.costbadge', 'Cost pill'], ['.waitbadge', 'Wait pill'], ['.atk', 'Attack chip'], ['.hp', 'Health chip'], ['.badges', 'Ability pills'], ['.levelbadge', 'Level badge'],
    ['.nm', 'Name scroll'], ['.rarity-band', 'Rarity band'], ['.ico', 'Art']];
  function paintDisplays(){
    const key = $('#dispCard').value, html = (window.TREAT_CARDS||{})[key]; if(!html) return;
    const sz = $('#dispSizes'); sz.innerHTML = '';
    SIZES.forEach(([cap, w])=> sz.appendChild(fig(tileAt(html, w), cap + ' · ' + w + 'px')));
    sz.appendChild(fig(tileAt(html, 150, 'is-holo holo-rainbow'), 'Foil copy · 150px'));
    const bt = $('#dispBattle'); bt.innerHTML = '';
    const bc = document.createElement('div'); bc.className = 'board-card'; bc.style.position = 'relative'; bc.appendChild(tileAt(html, 110)); bt.appendChild(fig(bc, 'On the board'));
    const lowc = document.createElement('div'); lowc.className = 'board-card'; lowc.style.position = 'relative'; const lt = tileAt(html, 110); lt.style.animation = 'lowHpTremble 2.4s ease-in-out infinite'; lowc.appendChild(lt); bt.appendChild(fig(lowc, 'Low Health'));
    const wc = document.createElement('div'); wc.className = 'board-card'; wc.style.position = 'relative'; const wt = tileAt(html, 110); const wb = document.createElement('div'); wb.className = 'waitbadge'; wb.textContent = '⏳2'; wt.appendChild(wb); wc.appendChild(wt); bt.appendChild(fig(wc, 'Waiting'));
    const fz = document.createElement('div'); fz.className = 'board-card is-frozen'; fz.style.position = 'relative'; fz.appendChild(tileAt(html, 110)); bt.appendChild(fig(fz, 'Frozen'));
    // Parts: the card at 180px with everything but one part dimmed, so each part is seen in place.
    const pp = $('#dispParts'); pp.innerHTML = '';
    let lvlHtml = html; if(!/levelbadge/.test(html)) lvlHtml = html.replace(/<\/div>\s*$/, '<div class="levelbadge">Lv 3</div></div>');
    PARTS.forEach(([sel, cap])=>{ const t = tileAt(sel === '.levelbadge' ? lvlHtml : html, 180); const el = t.querySelector(sel); if(!el) return;
      t.classList.add('disp-focus'); el.setAttribute('data-focus', '');
      pp.appendChild(fig(t, cap)); });
    try{ decorateHolo($('#displays')); }catch(e){}
  }
  if($('#dispCard')){ $('#dispCard').addEventListener('change', paintDisplays); paintDisplays(); }

  // --- damage numbers tab
  const NUMS = [['−3', '-3', ''], ['−12 heavy', '-12', ''], ['👊 Critical', '-11', 'crit'], ['🩸 Bleed', '-2', 'bleed-tick'], ['🔥 Fire', '-4', 'heat'], ['❄️ Cold', '-3', 'cold'],
    ['☠️ Poison', '-2', 'poison-tick'], ['💚 Heal', '+4', 'heal'], ['🛡 Blocked', '0', 'blocked'], ['🪙 Gold', '+2', 'gold']];
  const ne = $('#numEnemy'), nm = $('#numMine');
  if(ne) ne.setAttribute('data-row', 'enemy'); if(nm) nm.setAttribute('data-row', 'mine');
  const nb = $('#numBtns');
  if(nb){
    NUMS.forEach(([label, t, cls])=>{ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small' + (cls==='crit' ? ' primary' : ''); b.textContent = label;
      b.onclick = ()=>{ [ne, nm].forEach((st, i)=> st && setTimeout(()=> window.labHit(st.querySelector('.board-card'), t, cls), i*160)); }; nb.appendChild(b); });
    const all = document.createElement('button'); all.type = 'button'; all.className = 'btn small ghost'; all.textContent = '▶ All, one after another';
    all.onclick = ()=> NUMS.forEach(([, t, cls], i)=> setTimeout(()=> [ne, nm].forEach(st=> st && window.labHit(st.querySelector('.board-card'), t, cls)), i*420)); nb.appendChild(all);
  }

  // --- weather and atmosphere (user: "Under screens and atmospheres, show snow, rain, and other effects")
  const ATMO = {clear:{kind:0}, rain:{kind:11}, storm:{kind:10, lightning:true}, snow:{kind:5, snow:true}, embers:{kind:2}, mist:{kind:7}, deep:{kind:6}, sky:{kind:9}, caves:{kind:3}, sudden:{kind:0, sudden:true}};
  let atmo = null, curAtmo = 'snow', boltTimer = 0;
  function mountAtmo(name){
    const host = $('#atmoLab'); if(!host || host.offsetParent === null) return; const a = ATMO[name] || ATMO.clear; curAtmo = name;
    if(atmo){ try{ atmo.destroy(); }catch(e){} atmo = null; }
    clearInterval(boltTimer); host.querySelectorAll('.field-snow, .bf-lightning').forEach(n=> n.remove());
    host.classList.toggle('sudden-death', !!a.sudden);
    if(window.BramblewoodShaders && BramblewoodShaders.isSupported()) atmo = BramblewoodShaders.mount(host, {preset:'map', kind:a.kind, felt:1, prepend:true, intensity:0.6, shadows:'#atmoLab .bf-cards .card-tile'});
    if(a.snow){ const sn = document.createElement('div'); sn.className = 'field-snow'; sn.setAttribute('aria-hidden', 'true');
      sn.innerHTML = Array.from({length:28}, (_, k)=> `<i style="left:${(k*37)%100}%; animation-delay:-${((k*0.73)%6).toFixed(2)}s; animation-duration:${(5 + (k*1.31)%4).toFixed(2)}s; --dx:${((k%5)-2)*14}px; font-size:${8 + (k*7)%9}px">❄</i>`).join('');
      host.appendChild(sn); }
    if(a.lightning){ const zap = ()=>{ if(host.offsetParent === null) return; const l = document.createElement('div'); l.className = 'bf-lightning'; l.style.setProperty('--lx', (15 + Math.random()*70).toFixed(0) + '%'); host.appendChild(l); try{ SoundKit.thunder && SoundKit.thunder(); }catch(e){} setTimeout(()=> l.remove(), 900);
        try{ if(atmo && atmo.flash) atmo.flash(0.3 + Math.random()*0.4, 0.2, [0.8, 0.85, 1], 1.2, 0.6, 500); }catch(e){} }; zap(); boltTimer = setInterval(zap, 3800); }
    $$('#atmoBtns .btn').forEach(b=> b.classList.toggle('primary', b.dataset.atmo === name));
  }
  $$('#atmoBtns [data-atmo]').forEach(b=> b.addEventListener('click', ()=> mountAtmo(b.dataset.atmo)));

  // --- emotes
  const eb = $('#emoteBtns'), es = $('#emoteStage');
  if(eb && es && typeof EMOTE_BANKS !== 'undefined'){
    Object.keys(EMOTE_BANKS).forEach(k=>{ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = EMOTE_BANKS[k][0] + ' ' + k.replace(/([A-Z])/g, ' $1').toLowerCase();
      b.onclick = ()=>{ const c = es.querySelector('.board-card'); try{ maybeEmote('lab-emote', k, {force:true, el:c}); SoundKit.voiceTone && SoundKit.voiceTone(3); }catch(e){} }; eb.appendChild(b); });
  }
  show(location.hash.slice(1) || 'skills');
})();
