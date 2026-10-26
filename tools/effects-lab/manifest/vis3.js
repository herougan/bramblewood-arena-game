// Package VIS3 (2026-10-26): the owner's 10-25 visual notes, registered on the inventory ids they changed, on the free letter G (and H)
// (labels start "VIS3 ·"). Each variant plays the game's own code (arena_app.js) where the lab has it (vis3TrapRingHTML, vis3ShieldHTML,
// vis3BlockPulse, vis3RampartStep, vis3NodeFrameHTML, SoundKit.bossSting) and the game's CSS (the vis3Styles block of arena_template.html);
// where the game's function is missing from the lab it draws the same markup by hand, so the look can still be judged.
//   V1 Trap N's slot: a ring of light-red drops falling into its centre     sk-trap-set G
//   V2 a Bloom copy (and an Undead token) in the token look                tr-token G
//   V3 the Shield as a blue number; its hit a rectangle over the card       sk-shield-soak G, sk-shield-break G
//   V4 Rampart and Guardian: step toward the hit, shake with an aura        atk-guardian-redirect G (Guardian), H (Rampart)
//   V5 boss and elite nodes; the boss opener with its sting                 map-boss-node G, map-elite-node G, ui-versus G
(function(){
const R = FXLAB.register, has = n=> typeof window[n] === 'function';
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const bc = el=> (el && el.closest && el.closest('.board-card')) || el;
const tileOf = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const ring = ()=> has('vis3TrapRingHTML') ? vis3TrapRingHTML() : '<span class="vis3-trap-ring" aria-hidden="true">' + [0,1,2,3,4,5,6,7].map(i=> `<i style="--a:${i * 45}deg; --d:${(i * .21).toFixed(2)}s"></i>`).join('') + '</span>';
const shieldNum = n=> has('vis3ShieldHTML') ? vis3ShieldHTML({shield:n}) : `<span class="vis3-shield-num">${n}</span>`;

// V1: the empty slot facing the trapper (the third enemy card stands in for it, as w2.js does)
R({id:'sk-trap-set', stage:'board', inGameHook:'w2HazardMark (arena_app.js): a trap\'s mark now carries vis3TrapRingHTML; CSS .vis3-trap-ring',
  note:'2026-10-26 (VIS3, owner #4: "Trap N\'s slot ... small light red gradients falling into the centre from the edges, several of them, in a circle"). It lasts while the trap is set.',
  variants:[{key:'G', label:'VIS3 · The trapped slot: eight light-red drops fall in from the edge, round the circle', play:ctx=>{ const el = bc(foe(ctx)[2]), t = el.querySelector('.card-tile');
    if(t) t.style.visibility = 'hidden'; el.classList.add('empty-slot', 'w2-hazard'); el.insertAdjacentHTML('beforeend', ring() + '<span class="w2-hazard-mark trap">🪤 3</span>');
    try{ if(window.SkillFX && SkillFX.trapSet) SkillFX.trapSet(el, {kind:'trap'}); }catch(e){}
    return ctx.wait(4200).then(()=>{ el.querySelectorAll('.vis3-trap-ring, .w2-hazard-mark').forEach(x=> x.remove()); el.classList.remove('empty-slot', 'w2-hazard'); if(t) t.style.visibility = ''; }); }}]});

// V2: the token look on a board card (a Bloom copy wears it now)
R({id:'tr-token', stage:'board', inGameHook:'boardCardHTML: is-token when the def is a token or the unit is a Bloom copy / an Undead token (c.bloomCopy, c.undeadToken)',
  note:'2026-10-26 (VIS3, owner #15: "The copy created by fungal colossus should have a token background").',
  variants:[{key:'G', label:'VIS3 · A Bloom copy splits off beside its unit, in the token look', play:ctx=>{ const src = bc(mine(ctx)[1]), cp = bc(mine(ctx)[2]); cp.classList.add('is-token');
    if(ctx.gsap) ctx.gsap.fromTo(tileOf(cp), {x:-40, scale:.6, opacity:0}, {x:0, scale:1, opacity:1, duration:.45, ease:'back.out(1.7)'}); ctx.float(cp, '+1/+1', 'heal');
    return ctx.wait(2400).then(()=> cp.classList.remove('is-token')); }}]});

// V3: the Shield's number and its hit
const withShield = (ctx, el, n)=>{ const t = tileOf(el); t.querySelectorAll('.vis3-shield-num').forEach(x=> x.remove()); t.insertAdjacentHTML('beforeend', shieldNum(n)); bc(el).classList.add('has-shield'); return t.querySelector('.vis3-shield-num'); };
const dropShield = el=>{ tileOf(el).querySelectorAll('.vis3-shield-num').forEach(x=> x.remove()); bc(el).classList.remove('has-shield'); };
R({id:'sk-shield-soak', stage:'board', inGameHook:'renderVfxForEvent shieldSoak → updateCardStatusDisplay → vis3ShieldRefresh (the number pops); FX.A.shieldFlare, its dome drawn as a rectangle (.fxa-dome::before)',
  note:'2026-10-26 (VIS3, owner #16: "Shields will just be blue numbers on the card. The shield HP vfx when hit should look more rectangular over the card"). No Health bar on units any more.',
  variants:[{key:'G', label:'VIS3 · Shield 3 takes 2: a rectangle flares over the card, the blue 3 becomes 1', play:ctx=>{ const t = foe(ctx)[1]; withShield(ctx, t, 3);
    return ctx.wait(700).then(()=>{ ctx.float(t, '💠 -2', 'debuff'); try{ FX.A.shieldFlare(t, {from:90}); }catch(e){} const n = withShield(ctx, t, 1); if(n) n.classList.add('vis3-shield-pop'); return ctx.wait(1500); }).then(()=> dropShield(t)); }}]});
R({id:'sk-shield-break', stage:'board', inGameHook:'shieldSoak with 0 left → FX.A.shieldShatter (the rectangle cracks); the blue number goes',
  variants:[{key:'G', label:'VIS3 · The last point: the rectangle cracks and bursts, the number goes', play:ctx=>{ const t = foe(ctx)[1]; withShield(ctx, t, 1);
    return ctx.wait(600).then(()=>{ ctx.float(t, '💠 Shield breaks', 'debuff'); try{ FX.A.shieldShatter(t); }catch(e){} return ctx.wait(500); }).then(()=>{ dropShield(t); return ctx.wait(900); }); }}]});

// V4: the blockers
R({id:'atk-guardian-redirect', stage:'board', inGameHook:'en2GuardStepIn (Guardian) and en3RampartVfx → vis3RampartStep (Rampart); both pulse with vis3BlockPulse as the blow lands',
  note:'2026-10-26 (VIS3, owner #33: "the rampart-er moves abit towards their own rampart, and vibrates with a expanding aura on block, then moving back. Same like guardian - if it dies on that hit, it doesnt come back").',
  variants:[
    {key:'G', label:'VIS3 · Guardian: steps in front of its ally, shakes with an aura as it blocks, steps home', play:ctx=>{ const g = bc(mine(ctx)[0]), w = bc(mine(ctx)[1]), a = foe(ctx)[1], G = ctx.gsap;
      const dx = w.getBoundingClientRect().left - g.getBoundingClientRect().left; g.style.position = 'relative'; g.style.zIndex = '30';
      if(G) G.to(g, {left: dx * .85 + 'px', top: '-10px', duration:.25, ease:'sine.inOut'});
      return ctx.wait(320).then(()=>{ if(has('vis3BlockPulse')) vis3BlockPulse(g); ctx.float(g, '-3', 'dmg'); return ctx.wait(420); })
        .then(()=>{ if(G) G.to(g, {left:'0px', top:'0px', duration:.32, ease:'sine.inOut', onComplete:()=>{ g.style.left = g.style.top = g.style.zIndex = ''; }}); return ctx.wait(700); }); }},
    {key:'H', label:'VIS3 · Rampart: a hit on its bramble; it slides toward the bramble, takes its share with an aura, slides back', play:ctx=>{ const u = mine(ctx)[1], uid = window.LabGame ? LabGame.uid(u) : null;
      if(window.LabGame) LabGame.match(ctx); ctx.float(ctx.board.castleMine, '-2', 'dmg');
      if(uid != null && has('vis3RampartStep')){ vis3RampartStep({uid, side:'A'}, 260, false); setTimeout(()=> ctx.float(u, '-3 🚧', 'dmg'), 260); return ctx.wait(1400); }
      if(has('vis3BlockPulse')) vis3BlockPulse(bc(u)); return ctx.wait(900); }}]});

// V5: the map's boss and elite nodes, and the boss's opener
const node = (ctx, kind, icon, x, y)=>{ const host = ctx.map.layout || ctx.map.el; const d = document.createElement('div');
  const frame = has('vis3NodeFrameHTML') ? vis3NodeFrameHTML({kind}) : (kind === 'boss' ? '<span class="vis3-skull-frame"></span>' : '<span class="vis3-elite-frame"></span>');
  d.innerHTML = `<button type="button" class="map-node kind-${kind} kind-base-${kind}" style="left:${x}%; top:${y}%"><span class="map-node-ico">${icon}</span>${frame}<span class="map-node-kind">${kind === 'boss' ? '💀' : '⭐'}</span><span class="map-node-code">5-8</span></button>`;
  const el = d.firstElementChild; host.appendChild(el); return el; };
R({id:'map-boss-node', stage:'map', inGameHook:'renderConquestSubTab: vis3NodeFrameHTML on boss / sub-boss nodes; CSS .map-node.kind-base-boss',
  note:'2026-10-26 (VIS3, owner #14: "I only just realised 5-8 is a boss skirmish ... make that more apparent and scary").',
  variants:[{key:'G', label:'VIS3 · Bigger and dark, a ring of bone teeth, a skull crest, a slow red glow', play:ctx=>{ const n = node(ctx, 'boss', '🐊', 50, 52); return ctx.wait(4200).then(()=> n.remove()); }}]});
R({id:'map-elite-node', stage:'map', inGameHook:'renderConquestSubTab: vis3NodeFrameHTML on elite / champion / mini-boss nodes; CSS .map-node.kind-base-elite',
  note:'2026-10-26 (VIS3, owner #14: "make elites slightly more \'apparent\'").',
  variants:[{key:'G', label:'VIS3 · A violet double ring and a small star crest (a boss beside it for scale)', play:ctx=>{ const e = node(ctx, 'elite', '🐢', 38, 52), b = node(ctx, 'boss', '🐊', 62, 52); return ctx.wait(4200).then(()=>{ e.remove(); b.remove(); }); }}]});
R({id:'ui-versus', stage:'screen', inGameHook:'showVersusOpener: is-boss gets the skull frame, a red BOSS and SoundKit.bossSting',
  variants:[{key:'G', label:'VIS3 · A boss\'s opener: dark red, a bigger face in the skull frame, the sting', play:ctx=>{
    const el = document.createElement('div'); el.className = 'vs-opener is-boss';
    el.innerHTML = `<div class="vs-side vs-me"><div class="vs-portrait" style="font-size:64px">🦦</div><div class="vs-name">You</div></div>
      <div class="vs-mid"><span class="vs-mark">VS</span><span class="vs-kind vis3-kind-boss">🐊 5-8 · Boss</span></div>
      <div class="vs-side vs-them"><div class="vs-portrait vs-rival-ico">🐊<span class="vis3-skull-frame"></span></div><div class="vs-name">Old Snapjaw</div><div class="vs-taunt">“Talk all you like.”</div></div>`;
    (ctx.root || document.body).appendChild(el); try{ SoundKit.bossSting(); }catch(e){ ctx.sound('bossRumble'); }
    return ctx.wait(2600).then(()=>{ el.classList.add('is-leaving'); return ctx.wait(450); }).then(()=> el.remove()); }}]});
})();
