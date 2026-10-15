// Batch D lab registrations (2026-10-15): status (part), card-treatment, foil, pack-card-open, meta-progression (part).
// One FXLAB.register per inventory id this batch builds; play(ctx) calls the batch's game function FX.D.* on the stage.
// Contract and checklist: docs/effects-lab-contract.md. Keep this file to registrations only (the effect code lives in
// bramblewood-fx-d.js, which the game loads too). Where an older look was improved, "Before" keeps the old one playable.
(function(){
const R = FXLAB.register, X = ()=> window.FX.D;
const G = ()=> window.gsap;
// ---------------- small stage helpers ----------------
const tileIn = el=> (el && el.querySelector && el.querySelector('.card-tile')) || el;
const addBadge = (bc, cls, txt)=>{ const t = tileIn(bc); let b = t.querySelector(':scope > .badges-bottom'); if(!b){ b = document.createElement('div'); b.className = 'badges-bottom'; t.appendChild(b); }
  const s = document.createElement('span'); s.className = 'abadge ' + cls; s.textContent = txt; b.appendChild(s); return s; };
const overlay = (bc, cls, txt)=>{ const t = tileIn(bc); const o = document.createElement('div'); o.className = 'status-overlay ' + cls; if(txt) o.innerHTML = txt; t.insertBefore(o, t.firstChild); return o; };
// A status as the game shows it today: the class on the .board-card, its overlay, its badge.
const NOW = {
  poison:bc=>{ bc.classList.add('is-poisoned'); addBadge(bc, 'poison', '☠2'); }, bleed:bc=>{ bc.classList.add('is-bled'); addBadge(bc, 'bleed', '🩸2'); },
  decay:bc=>{}, stagger:bc=>{ bc.classList.add('is-staggered'); overlay(bc, 'stagger-overlay', '💢'); addBadge(bc, 'stagger', '💢1'); },
  blind:bc=>{ bc.classList.add('is-blind'); overlay(bc, 'blind-overlay', '👁'); addBadge(bc, 'blind', '👁1'); }, confuse:bc=>{ bc.classList.add('is-confused'); addBadge(bc, 'confused', '❓'); },
  corrode:bc=>{ bc.classList.add('is-corroded'); addBadge(bc, 'corrode', '🧪2'); }, expose:bc=>{}, daunt:bc=> addBadge(bc, 'daunt', '😨1'), wither:bc=>{},
  irradiation:bc=> addBadge(bc, 'irradiation', '☢️3'), scar:bc=> addBadge(bc, 'scar', '🗡1'), chained:bc=>{ bc.classList.add('is-chained'); overlay(bc, 'chain-overlay', '⛓'); }, mind:bc=>{},
};
const stNew = (key, n)=> ctx=>{ const bc = ctx.board.foe[1]; NOW[key](bc); X().statusLook(bc, key, true, n); ctx.sound('nightSwell'); return ctx.wait(2600); };
const stOld = key=> ctx=>{ NOW[key](ctx.board.foe[1]); return ctx.wait(2200); };
const existing = fn=> ctx=>{ fn(ctx.board.foe[1], ctx); return ctx.wait(2400); };
// Spotlight one tile on the cards stage: the others dim, it lifts and its band runs; the light sweeps it.
const spot = (ctx, t)=>{ const g = G(); ctx.cards.forEach(x=>{ if(x !== t) x.style.opacity = '.35'; }); const band = t.querySelector('.rarity-band'); if(band) band.style.animationPlayState = 'running';
  g.fromTo(t, {scale:1}, {scale:1.12, duration:.35, ease:'back.out(2)'}); return ctx.tilt(t, 2600); };
const big = (ctx, kind)=>{ const t = ctx.tile(kind, {append:true}); ctx.cards.forEach(x=> x.closest('.board-card').style.display = 'none'); if(ctx.castle) ctx.castle.closest('.board-card').style.display = 'none'; return t; };
const setRarity = (t, col)=>{ t.className = t.className.replace(/\brarity-tier-\w+/g, '') + ' rarity-tier-top'; t.setAttribute('style', `--rarity-a:${col}; --rarity-b:${col}`); };
const RCOL = {mythic:'#dc2626', ancient:'#1e3a8a', divine:'#f8fafc', void:'#7c6f8f', daemonic:'#111111'};
const topFrame = (r, v)=> ctx=>{ const ts = [ctx.cards[0], ctx.cards[1], ctx.cards[2]]; ts.forEach(t=>{ setRarity(t, RCOL[r]); if(v === 'old') t.classList.add('fxd-r-alt'); else if(v) t.classList.add('fxd-r-alt', `fxd-r-${r}-${v}`); });
  ctx.sound('rareRise', true); return Promise.all(ts.map((t, i)=> ctx.wait(i*150).then(()=> ctx.tilt(t, 3200)))); };
const withCls = (cls, o)=> ctx=>{ o = o || {}; const t = o.kind ? big(ctx, o.kind) : ctx.cards[o.i || 1]; cls.split(' ').filter(Boolean).forEach(c=> t.classList.add(c)); if(o.style) Object.entries(o.style).forEach(([k, v])=> t.style.setProperty(k, v)); if(o.after) o.after(t, ctx); return spot(ctx, t); };

// ---------------- statuses (on the board) ----------------
R({id:'st-poison-active', stage:'board', inGameHook:'cardStatusShown (end of updateCardStatusDisplay) + boardRowsBuilt (renderBoard)', note:'Batch B plays the moment it lands; this is the look that stays.', variants:[
  {key:'A', label:'Ooze pools at the bottom, bubbles rise and pop', play:stNew('poison')}, {key:'B', label:'Before: tint and ☠ badge only', play:stOld('poison')}]});
R({id:'st-bleed-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Blood runs from the top edge; edges throb like a heartbeat', play:stNew('bleed')}, {key:'B', label:'Before: tint and 🩸 badge only', play:stOld('bleed')}]});
R({id:'st-decay-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt (unit.decay > 0)', variants:[{key:'A', label:'Grey-violet mould creeps from the corners, spores lift', play:stNew('decay')}]});
R({id:'st-freeze-active', stage:'board', variants:[{key:'A', label:'Frost creep, falling flakes (live CSS)', play:existing(bc=>{ bc.classList.add('is-frozen'); tileIn(bc).insertAdjacentHTML('afterbegin', '<div class="frost-flakes" aria-hidden="true"><i>❄</i><i>❅</i><i>❆</i><i>❄</i><i>❅</i></div>'); })}]});
R({id:'st-sleep-active', stage:'board', variants:[{key:'A', label:'💤 bobs over the dimmed card (live CSS)', play:existing(bc=>{ bc.classList.add('is-asleep'); overlay(bc, 'sleep-overlay', '💤'); addBadge(bc, 'sleep', '💤2'); })}]});
R({id:'st-paralyze-active', stage:'board', variants:[{key:'A', label:'Electric jitter (live CSS)', play:existing(bc=>{ bc.classList.add('is-paralyzed'); overlay(bc, 'paralyze-overlay', '⚡'); addBadge(bc, 'paralyze', '⚡1'); })}]});
R({id:'st-stun-active', stage:'board', variants:[{key:'A', label:'Stars and a chick wheel round its head (live CSS)', play:existing(bc=>{ bc.classList.add('is-stunned'); overlay(bc, 'stun-overlay stun-halo', '<i>⭐</i><i>💫</i><i>⭐</i><i>🐤</i>'); })}]});
R({id:'st-stagger-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Dent rings throb from the middle, a beat of double vision', play:stNew('stagger')}, {key:'B', label:'Before: 💢 wobble and tint', play:stOld('stagger')}]});
R({id:'st-blind-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Hollow Kin ink splat over the eyes, slowly running', play:stNew('blind')}, {key:'B', label:'Before: dim and 👁 icon', play:stOld('blind')}]});
R({id:'st-tipsy-active', stage:'board', variants:[{key:'A', label:'Tipsy sway (live CSS)', play:existing(bc=>{ bc.classList.add('is-tipsy'); addBadge(bc, 'tipsy', '🍺'); })}]});
R({id:'st-confuse-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Dizzy swirl, question marks circle its head', play:stNew('confuse')}, {key:'B', label:'Before: hue drift only', play:stOld('confuse')}]});
R({id:'st-shock-active', stage:'board', variants:[{key:'A', label:'Storm icon and tint (live CSS)', play:existing(bc=>{ bc.classList.add('is-shocked'); overlay(bc, 'shock-overlay', '🌩'); addBadge(bc, 'shock', '🌩1'); })}]});
R({id:'st-corrode-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Ant acid pits the card, fizz at the edges', play:stNew('corrode')}, {key:'B', label:'Before: tint and 🧪 badge', play:stOld('corrode')}]});
R({id:'st-expose-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt (unit.exposed > 0)', variants:[{key:'A', label:'A red crosshair stays faintly, turning', play:stNew('expose')}]});
R({id:'st-daunt-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt (unit.daunts)', variants:[{key:'A', label:'A cold purple pall settles; cold drops fall', play:stNew('daunt')}]});
R({id:'st-wither-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt (unit.wither > 0)', variants:[{key:'A', label:'Black smoke rolls down; dark veins in the edges', play:stNew('wither')}]});
R({id:'st-irradiation-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt (glow grows with tokens)', variants:[
  {key:'A', label:'Green inner glow, geiger flicker, sparks (3 tokens)', play:ctx=>{ ctx.sound('geiger', 3); return stNew('irradiation', 3)(ctx); }}, {key:'B', label:'Before: ☢ count only', play:stOld('irradiation')}]});
R({id:'st-smoke-active', stage:'board', variants:[{key:'A', label:'Smoke drifts over it (live CSS)', play:existing(bc=>{ overlay(bc, 'smoke-overlay', ''); addBadge(bc, 'smoke', '🌫️'); })}]});
R({id:'st-scar-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Three claw marks stay cut across the art', play:stNew('scar')}, {key:'B', label:'Before: 🗡 badge only', play:stOld('scar')}]});
R({id:'st-chained-active', stage:'board', inGameHook:'cardStatusShown + boardRowsBuilt', variants:[
  {key:'A', label:'Crossed chains and a padlock that rattle', play:ctx=>{ ctx.sound('chainBreak'); return stNew('chained')(ctx); }}, {key:'B', label:'Before: ⛓ icon rattling', play:stOld('chained')}]});
R({id:'st-rage-enter', stage:'board', inGameHook:'cardStatusShown (Health drops below half on a Rage unit) / boardRowsBuilt', variants:[
  {key:'A', label:'Red steam bursts off it, the frame flares, a growl', play:ctx=>{ const bc = ctx.board.mine[1]; bc.classList.add('raging'); return X().rageEnter(bc).then(()=> ctx.wait(800)); }},
  {key:'B', label:'Before: the rage pulse just starts', play:ctx=>{ ctx.board.mine[1].classList.add('raging'); return ctx.wait(2000); }}]});
R({id:'st-low-hp', stage:'board', variants:[{key:'A', label:'Low-Health tremble, red number (live CSS)', play:existing(bc=> bc.classList.add('is-low-hp'))}]});
R({id:'st-phase-grow', stage:'board', variants:[{key:'A', label:'Aura and burst (live CSS)', play:ctx=>{ const bc = ctx.board.mine[0]; bc.classList.add('phase-aura', 'phase-day', 'phase-burst'); ctx.sound('growthSwell'); ctx.float(bc, '⚔+1', 'buff'); return ctx.wait(2200); }}]});
R({id:'st-phase-fade', stage:'board', inGameHook:'onEvent statusFx kind:phaseFade', variants:[
  {key:'A', label:'Day: the aura drains, gold motes lift away', play:ctx=>{ const bc = ctx.board.mine[0]; bc.classList.add('phase-aura', 'phase-day'); return ctx.wait(500).then(()=>{ bc.classList.remove('phase-aura'); ctx.float(bc, '⚔−1', 'debuff'); return X().phaseFade(bc, 'day'); }).then(()=> ctx.wait(400)); }},
  {key:'B', label:'Night: silver motes', play:ctx=>{ const bc = ctx.board.mine[0]; bc.classList.add('phase-aura', 'phase-night'); return ctx.wait(500).then(()=>{ bc.classList.remove('phase-aura', 'phase-night'); return X().phaseFade(bc, 'night'); }).then(()=> ctx.wait(400)); }},
  {key:'C', label:'Before: the stat-down float only', play:ctx=>{ const bc = ctx.board.mine[0]; bc.classList.add('phase-aura', 'phase-day'); return ctx.wait(500).then(()=>{ bc.classList.remove('phase-aura'); ctx.float(bc, '⚔−1', 'debuff'); return ctx.wait(1300); }); }}]});
R({id:'st-stat-change', stage:'board', variants:[{key:'A', label:'Stat up and down floats (live)', play:ctx=>{ ctx.float(ctx.board.mine[1], '⚔+2', 'buff'); return ctx.wait(500).then(()=>{ ctx.float(ctx.board.foe[1], '❤−2', 'debuff'); return ctx.wait(1300); }); }}]});
R({id:'st-mind-controlled', stage:'board', inGameHook:'onEvent mindControl (+ kept by cardStatusShown / boardRowsBuilt)', variants:[{key:'A', label:'Faint violet puppet strings run up to a control bar', play:ctx=>{ ctx.sound('curse'); X().statusLook(ctx.board.mine[2], 'mind', true); return ctx.wait(2600); }}]});
R({id:'st-caged-leader', stage:'board', inGameHook:'boardRowsBuilt (first render of an .is-caged card)', variants:[
  {key:'A', label:'The bars slam down, bounce, dust kicks out', play:ctx=>{ const bc = ctx.board.foe[0]; bc.classList.add('is-caged'); return X().cageDrop(bc).then(()=> ctx.wait(700)); }},
  {key:'B', label:'Before: the cage is just there', play:ctx=>{ const bc = ctx.board.foe[0]; bc.classList.add('is-caged'); tileIn(bc).insertAdjacentHTML('beforeend', '<div class="cage-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="cage-tag">⛓️ Caged</div>'); return ctx.wait(1800); }}]});
R({id:'st-status-badges', stage:'board', inGameHook:'cardStatusShown: a chip that wasn’t there last time pops', variants:[
  {key:'A', label:'A new status chip pops in with a ring', play:ctx=>{ const bc = ctx.board.foe[2]; addBadge(bc, 'poison', '☠2'); return ctx.wait(500).then(()=>{ ctx.sound('poisonApply'); return X().badgePop(addBadge(bc, 'bleed', '🩸1')); }).then(()=> ctx.wait(500)).then(()=>{ ctx.sound('blindTone'); return X().badgePop(addBadge(bc, 'blind', '👁1')); }).then(()=> ctx.wait(600)); }},
  {key:'B', label:'Before: chips simply appear', play:ctx=>{ const bc = ctx.board.foe[2]; addBadge(bc, 'poison', '☠2'); return ctx.wait(500).then(()=>{ addBadge(bc, 'bleed', '🩸1'); return ctx.wait(500); }).then(()=>{ addBadge(bc, 'blind', '👁1'); return ctx.wait(900); }); }}]});

// ---------------- card treatments (cards stage) ----------------
R({id:'tr-rarity-low', stage:'cards', variants:[{key:'A', label:'Common: grey band (live)', play:ctx=> spot(ctx, ctx.cards[0])}]});
R({id:'tr-rarity-uncommon', stage:'cards', variants:[{key:'A', label:'Uncommon: green band (live)', play:ctx=> spot(ctx, big(ctx, 'uncommon'))}]});
R({id:'tr-rarity-mid', stage:'cards', variants:[{key:'A', label:'Rare: blue band with drift (live)', play:ctx=> spot(ctx, ctx.cards[1])}]});
R({id:'tr-rarity-high', stage:'cards', variants:[{key:'A', label:'Epic: brighter, faster band (live)', play:ctx=> spot(ctx, big(ctx, 'epic'))}]});
R({id:'tr-rarity-top', stage:'cards', variants:[{key:'A', label:'Legendary: gold-leaf rim, sliding streak (live)', play:ctx=> spot(ctx, big(ctx, 'legendary'))}]});
const TOPNOTE = {mythic:'Live in the game for every Mythic tile (keyed off its rarity colour). D is the shared gold rim it replaces.', ancient:'Live for every Ancient tile.', divine:'Live for every Divine tile.', void:'Live for every Void tile.', daemonic:'Live for every Daemonic tile.'};
[['mythic', ['Living ember frame, heat shimmer', 'Blood crystal facets', 'Heartbeat ring']], ['ancient', ['Rune stone: blue runes glow in the rim', 'Deep-blue tablet, carved inner line', 'Rune circle turning behind the art']],
 ['divine', ['White-gold rim, halo rays from above', 'Ecclesia stained-glass rim', 'A halo floats at the top']], ['void', ['Static rim, stars at the edges', 'Unravelling rim (gaps turn round)', 'Hollow: the edges show inverted']],
 ['daemonic', ['Hellfire licks up the rim', 'Black horns, red eyes that blink', 'Smoulder: embers rise from the bottom']]].forEach(([r, labels])=> R({id:'tr-rarity-' + r, stage:'cards', inGameHook:'CSS on .card-tile.rarity-tier-top with --rarity-a ' + RCOL[r] + ' (bramblewood-fx-d.js FRAMES_CSS, loaded with the game)', note:TOPNOTE[r],
  variants:[{key:'A', label:labels[0], play:topFrame(r)}, {key:'B', label:labels[1], play:topFrame(r, 'b')}, {key:'C', label:labels[2], play:topFrame(r, 'c')}, {key:'D', label:'Before: the shared gold-leaf rim', play:topFrame(r, 'old')}]}));
R({id:'tr-rarity-special', stage:'cards', inGameHook:'lab only: the tile needs its rarity key (data-rarity) for the game to place it', variants:[
  {key:'A', label:'Corner ribbon: EVENT / DEV / SPECIAL', play:ctx=>{ X().specialMark(ctx.cards[0], 'event', 'A'); X().specialMark(ctx.cards[1], 'dev', 'A'); X().specialMark(ctx.cards[2], 'special', 'A'); return ctx.tilt(ctx.cards[1], 2200); }},
  {key:'B', label:'Rubber stamp', play:ctx=>{ X().specialMark(ctx.cards[0], 'event', 'B'); X().specialMark(ctx.cards[1], 'dev', 'B'); X().specialMark(ctx.cards[2], 'special', 'B'); return ctx.wait(2000); }},
  {key:'C', label:'A twinkling gem at the top', play:ctx=>{ [0, 1, 2].forEach(i=> X().specialMark(ctx.cards[i], 'event', 'C')); return ctx.wait(2200); }}]});
R({id:'tr-elite-polish', stage:'cards', variants:[{key:'A', label:'Elite polish sheen (live CSS)', play:withCls('elite-polish')}]});
R({id:'tr-boss-extended', stage:'cards', inGameHook:'boardRowsBuilt: enemy art-extended tiles in a boss fight get .fxd-boss', variants:[
  {key:'A', label:'Black-iron frame, red under-glow, rivets', play:withCls('art-extended fxd-boss', {kind:'epic'})}, {key:'B', label:'Before: full-bleed art only', play:withCls('art-extended', {kind:'epic'})}]});
R({id:'tr-prestige-gold', stage:'cards', inGameHook:'CSS on .card-tile.prestige-gold (everywhere)', variants:[
  {key:'A', label:'Gold ring with a glint travelling round it', play:withCls('prestige-gold')}, {key:'B', label:'Before: static gold ring', play:withCls('prestige-gold fxd-plain')}]});
R({id:'tr-prestige-rainbow', stage:'cards', variants:[{key:'A', label:'Rainbow ring (live CSS)', play:withCls('prestige-rainbow')}]});
R({id:'tr-prestige-extended', stage:'cards', variants:[{key:'A', label:'Double frame (live CSS)', play:withCls('prestige-extended')}]});
R({id:'tr-shiny', stage:'cards', variants:[{key:'A', label:'Hue-shifted art (live CSS)', play:withCls('is-shiny', {style:{'--shiny-hue':'150deg'}})}]});
const markOn = plain=> (t)=>{ const m = document.createElement('span'); m.className = 'shiny-mark' + (plain ? ' fxd-plain' : ''); m.textContent = '✦'; t.appendChild(m); };
R({id:'tr-shiny-mark', stage:'cards', inGameHook:'CSS on .shiny-mark (everywhere)', variants:[
  {key:'A', label:'✦ cycles colour and flashes', play:withCls('is-shiny', {style:{'--shiny-hue':'150deg'}, after:markOn(false)})}, {key:'B', label:'Before: soft twinkle', play:withCls('is-shiny', {style:{'--shiny-hue':'150deg'}, after:markOn(true)})}]});
R({id:'tr-shiny-spawn', stage:'board', variants:[{key:'A', label:'A spawn arrives already shiny (live CSS)', play:ctx=>{ const t = tileIn(ctx.board.mine[2]); t.classList.add('is-shiny'); t.style.setProperty('--shiny-hue', '200deg'); G().fromTo(ctx.board.mine[2], {scale:.3, opacity:0}, {scale:1, opacity:1, duration:.4, ease:'back.out(2)'}); return ctx.wait(1800); }}]});
R({id:'tr-leader-frame', stage:'cards', variants:[{key:'A', label:'Leader glow spinning round the frame (live CSS)', play:ctx=> spot(ctx, ctx.cards[3])}]});
R({id:'tr-hero-frame', stage:'cards', variants:[{key:'A', label:'Hero card lifts, ring (live CSS classes)', play:ctx=>{ const t = big(ctx, 'epic'); t.closest('.board-card').classList.add('hero-card-big'); ctx.sound('heroLevel'); return spot(ctx, t); }}]});
R({id:'tr-supreme', stage:'cards', inGameHook:'CSS on .card-tile.is-supreme (everywhere)', variants:[
  {key:'A', label:'A prismatic edge turns round it; the stat glints stay', play:withCls('is-supreme', {kind:'legendary'})}, {key:'B', label:'Before: glints on the numbers only', play:withCls('is-supreme fxd-plain', {kind:'legendary'})}]});
R({id:'tr-devilry', stage:'cards', variants:[{key:'A', label:'Devil aura (live CSS)', play:withCls('is-devilry')}]});
const ribbon = v=> t=>{ const w = t.closest('.board-card'); const r = document.createElement('span'); r.className = 'hof-ribbon hof-ribbon-' + v; r.textContent = v === 'classic' ? '🏛 Classic' : '🏺 Antique'; w.style.position = 'relative'; w.appendChild(r); };
R({id:'tr-antique', stage:'cards', inGameHook:'CSS on .card-tile.hof-antique (Hall of Fame)', variants:[
  {key:'A', label:'Sepia art, foxing spots, a fold crease, darker edges', play:withCls('hof-antique', {kind:'legendary', after:ribbon('antique')})}, {key:'B', label:'Before: ribbon only', play:withCls('hof-antique fxd-plain', {kind:'legendary', after:ribbon('antique')})}]});
R({id:'tr-classic', stage:'cards', inGameHook:'CSS on .card-tile.hof-classic (Hall of Fame)', variants:[
  {key:'A', label:'Cream print border, halftone dots', play:withCls('hof-classic', {kind:'rare', after:ribbon('classic')})}, {key:'B', label:'Before: ribbon only', play:withCls('hof-classic fxd-plain', {kind:'rare', after:ribbon('classic')})}]});
R({id:'tr-cards-of-old', stage:'cards', variants:[{key:'A', label:'Aged paper, foxing, creases (ProcFX)', play:ctx=>{ const ts = ctx.cards.slice(0, 3); ts.forEach(t=> t.classList.add('is-holo', 'holo-old')); try{ decorateHolo(ctx.root); }catch(e){} return ctx.tilt(ts[1], 2400); }}]});
R({id:'tr-field-card', stage:'board', variants:[{key:'A', label:'Field card icon spin (live CSS)', play:ctx=>{ const f = ctx.board.field; if(f) G().fromTo(f, {scale:1}, {scale:1.15, duration:.4, yoyo:true, repeat:1}); return ctx.wait(2000); }}]});
R({id:'tr-token', stage:'cards', inGameHook:'CSS on .card-tile.is-token / .board-card.is-token', variants:[
  {key:'A', label:'Printed token: perforated edge', play:ctx=> spot(ctx, big(ctx, 'token'))}, {key:'B', label:'Before: dashed border', play:ctx=>{ const t = big(ctx, 'token'); t.classList.add('fxd-plain'); return spot(ctx, t); }}]});
const eggBadge = plain=> ctx=>{ const t = big(ctx, 'token'); let b = t.querySelector('.spawnbadge'); if(!b){ b = document.createElement('div'); b.className = 'spawnbadge'; b.textContent = '🔁'; t.appendChild(b); } if(plain) b.classList.add('fxd-plain'); return spot(ctx, t); };
R({id:'tr-nest-born', stage:'cards', inGameHook:'CSS on .spawnbadge', variants:[{key:'A', label:'An egg badge that wobbles now and then', play:eggBadge(false)}, {key:'B', label:'Before: plain 🔁 chip', play:eggBadge(true)}]});
R({id:'tr-locked', stage:'cards', inGameHook:'A live; B lab: proposed for the Codex when a card unlocks', variants:[
  {key:'A', label:'Locked: grey and padlock (live CSS)', play:withCls('locked')}, {key:'B', label:'Unlock: padlock shakes, shackle springs, colour floods back', play:ctx=> X().unlockBreak(ctx.cards[1]).then(()=> ctx.wait(400))}]});
R({id:'tr-magnetic', stage:'cards', variants:[{key:'A', label:'Hover tilt and shimmer (live CSS)', play:ctx=>{ const t = ctx.cards[1]; t.classList.add('card-tile-magnetic'); const g = G(), o = {a:0};
  return new Promise(res=> g.to(o, {a:Math.PI*2, duration:2.2, ease:'sine.inOut', onUpdate:()=>{ t.style.setProperty('--ctTiltX', (Math.sin(o.a)*8).toFixed(1) + 'deg'); t.style.setProperty('--ctTiltY', (Math.cos(o.a)*10).toFixed(1) + 'deg'); }, onComplete:res})); }}]});
R({id:'tr-atk-heat', stage:'cards', variants:[{key:'A', label:'Hot Attack number (live CSS)', play:ctx=>{ const t = ctx.cards[1], a = t.querySelector('.stats .atk'); if(a) a.innerHTML = '<i class="sg">⚔</i><span class="atk-amp-3">9</span>'; return spot(ctx, t); }}]});
R({id:'tr-skins', stage:'cards', inGameHook:'A live CSS; B lab: proposed for the skin picker', variants:[
  {key:'A', label:'Ember skin (live CSS)', play:withCls('skin-ember')}, {key:'B', label:'Skin swap: a shimmer sweeps and leaves the new skin', play:ctx=> X().skinSwap(ctx.cards[1], 'skin-ember').then(()=> ctx.wait(800))}]});
const dealBacks = (key, plain)=> async ctx=>{ await ctx.pack.deal(); if(!plain) ctx.pack.el.querySelectorAll('.po2-back').forEach(b=> X().cardBack(b, key)); ctx.sound('cardFlip'); await ctx.wait(1800); };
R({id:'tr-card-back', stage:'pack', inGameHook:'packCardUp: the opener’s backs (faction packs get their own)', variants:[{key:'A', label:'Acorn crest embossed on a woven board, light sweeps', play:dealBacks('acorn')}, {key:'B', label:'Before: one plain acorn back', play:dealBacks('acorn', true)}]});
R({id:'tr-card-inspect', stage:'cards', variants:[{key:'A', label:'3D spin with the finish catching light', play:ctx=>{ const t = ctx.cards[2]; ctx.sound('cardFlip'); return new Promise(res=> G().timeline({onComplete:res}).to(t, {rotationY:360, transformPerspective:700, duration:1.2, ease:'power2.inOut', clearProps:'rotationY,transformPerspective'}).add(()=> ctx.tilt(t, 1600), .2)); }}]});
R({id:'tr-future-backing-faction', stage:'pack', inGameHook:'live for faction packs via packCardUp; a deck-wide backing is planned', variants:[
  {key:'A', label:'Rivergate: bronze and oxblood weave', play:dealBacks('otter')}, {key:'B', label:'Sunfeather: jewel feathers', play:dealBacks('hummingbird')}, {key:'C', label:'Hive: honeycomb wax', play:dealBacks('hive')},
  {key:'D', label:'Road-folk: stitched patchwork', play:dealBacks('road')}, {key:'E', label:'Beasts: claw-scored hide', play:dealBacks('beast')}]});
R({id:'tr-future-backing-monthly', stage:'pack', inGameHook:'future', variants:[{key:'A', label:'October: harvest moon', play:dealBacks('m10')}, {key:'B', label:'November: first frost', play:dealBacks('m11')}, {key:'C', label:'December: lantern night', play:dealBacks('m12')}]});
const frameOn = key=> ctx=>{ const ts = ctx.cards.slice(0, 3); ts.forEach(t=> X().frame(t, key)); return Promise.all(ts.map((t, i)=> ctx.wait(i*150).then(()=> ctx.tilt(t, 2800)))); };
[['otter', 'tr-future-frame-otter'], ['hummingbird', 'tr-future-frame-hummingbird'], ['road', 'tr-future-frame-roadfolk'], ['beast', 'tr-future-frame-beast'], ['hive', 'tr-future-frame-hive'],
 ['folktale', 'tr-future-folktale'], ['oriental', 'tr-future-oriental'], ['spy', 'tr-future-spy'], ['veggies', 'tr-future-veggies'], ['living', 'tr-future-living-ink']].forEach(([k, id])=> R({id, stage:'cards', inGameHook:'future (FX.D.frame(tile, \'' + k + '-a\'))',
  variants:['a', 'b'].map((v, i)=> ({key:'AB'[i], label:X().FRAMES[k + '-' + v].label, play:frameOn(k + '-' + v)}))}));
const breathe = v=> ctx=>{ const t = big(ctx, 'legendary'); const h = X().breathingArt(t, {variant:v}); return ctx.wait(4200).then(()=> h.stop()); };
R({id:'tr-future-breathing-art', stage:'cards', inGameHook:'future', variants:[{key:'A', label:'Parallax: art and haze slide against each other', play:breathe('A')}, {key:'B', label:'Slow breath: the art swells and settles', play:breathe('B')}]});
R({id:'tr-future-hero-portraits', stage:'cards', inGameHook:'future', variants:[
  {key:'A', label:'A ring of light closes, the portrait swaps, Lv banner', play:ctx=> X().heroPortrait(big(ctx, 'epic'), {level:25}).then(()=> ctx.wait(300))},
  {key:'B', label:'The frame steps up: bronze, silver, gold', play:ctx=> X().heroPortrait(big(ctx, 'epic'), {variant:'B'}).then(()=> ctx.wait(300))}]});

// ---------------- foils ----------------
// Show a finish on the three left tiles of the cards stage and sweep the light across them (as a pointer or phone tilt would).
const showFoil = key=> ctx=>{ const ts = ctx.cards.slice(0, 3); ts.forEach(t=> X().applyFoil(t, key));
  ctx.sound('rareRise', false); return Promise.all(ts.map((t, i)=> ctx.wait(i*160).then(()=> ctx.tilt(t, 3200)))); };
const gameFoil = cls=> ctx=>{ const ts = ctx.cards.slice(0, 3); ts.forEach(t=>{ t.className = t.className.replace(/\bholo-[\w-]+/g, '') + ' is-holo ' + cls; t.querySelectorAll('.holo-layer, .holo-glare, .holo-glitter, .foil-fx').forEach(x=> x.remove()); });
  try{ decorateHolo(ctx.root); }catch(e){} ctx.sound('rareRise', false); return Promise.all(ts.map((t, i)=> ctx.wait(i*160).then(()=> ctx.tilt(t, 2600)))); };
const F = X().FOILS;
Object.entries(X().FOIL_ENTRIES).forEach(([id, keys])=> R({id, stage:'cards', inGameHook:'future: a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-' + keys[0] + '" + FX.D.decorateFoils)',
  note:keys.map((k, i)=> 'ABC'[i] + ': ' + F[k].theme).join(' · '),
  variants:keys.map((k, i)=> ({key:'ABC'[i], label:F[k].label, play:showFoil(k)}))}));
// (foil-cosmos and foil-old are already registered by manifest/_existing.js)
[['pearl', 'Pearl'], ['rainbow', 'Rainbow holo'], ['etched', 'Etched frame'], ['ice', 'Cracked ice'], ['gold', 'Gold leaf'], ['reverse', 'Reverse holo'], ['prism', 'Prism'], ['lattice', 'Lattice'],
 ['galaxy', 'Galaxy swirl'], ['molten', 'Molten gold'], ['frost', 'Frost crystal'], ['oilslick', 'Oil slick'], ['sakura', 'Sakura petals'], ['sparkle', 'Glitter field'], ['scanline', 'Holo scanlines']]
  .forEach(([k, label])=> R({id:'foil-' + k, stage:'cards', variants:[{key:'A', label:label + ' (live)', play:gameFoil('holo-' + k)}]}));
R({id:'foil-starlight', stage:'cards', variants:[{key:'A', label:'Starlight sparkles (live)', play:gameFoil('holo-starlight')}]});
R({id:'foil-hex', stage:'cards', note:'B is the bees’ take on it, new.', variants:[{key:'A', label:'Hex lattice (live)', play:gameFoil('holo-hex')}, {key:'B', label:'Honeycomb (bees): amber cells, honey drips', play:showFoil('honeycomb')}]});
R({id:'foil-aurora', stage:'cards', note:'B is a new take: tall ray curtains over a starry sky.', variants:[{key:'B', label:'Aurora borealis rays (new)', play:showFoil('borealis')}]});
R({id:'foil-splash', stage:'cards', variants:[{key:'A', label:'Legacy foil shimmer ring (live CSS)', play:withCls('card-tile-foil')}]});
R({id:'foil-tilt-board', stage:'board', inGameHook:'onEvent play: a foil / Legendary+ / Supreme / Shiny unit catches the light as it lands', variants:[
  {key:'A', label:'A specular band sweeps the card once', play:ctx=>{ const t = tileIn(ctx.board.mine[1]); t.classList.add('is-holo', 'holo-rainbow'); try{ decorateHolo(ctx.root); }catch(e){} ctx.sound('pitchChime'); return X().foilGlint(t).then(()=> ctx.wait(700)); }},
  {key:'B', label:'The card rocks once so its finish shows the light moving', play:ctx=>{ const t = tileIn(ctx.board.mine[1]); t.classList.add('is-holo', 'holo-cosmos', 'holo-starlight'); try{ decorateHolo(ctx.root); }catch(e){} ctx.sound('pitchChime'); return X().foilGlint_B(t).then(()=> ctx.wait(500)); }},
  {key:'C', label:'Before: the finish only drifts', play:ctx=>{ const t = tileIn(ctx.board.mine[1]); t.classList.add('is-holo', 'holo-rainbow'); try{ decorateHolo(ctx.root); }catch(e){} return ctx.wait(2000); }}]});

// ---------------- packs (pack stage) ----------------
const PK = ctx=> ctx.pack.pack;
const dealt = async ctx=>{ await ctx.pack.deal(); await ctx.wait(700); return ctx.pack.cards; };
// Turn dealt card i into a given rarity (and optionally a foil finish), the way the opener would have drawn it.
const dress = (ctx, i, rarity, o)=>{ o = o || {}; const c = ctx.pack.cards[i]; if(!c) return null; const col = o.col || RCOL[rarity] || {rare:'#2f6fe0', epic:'#9333ea', heroic:'#f97316', legendary:'#facc15'}[rarity] || '#2f6fe0';
  c.style.setProperty('--rarity-a', col); c.style.setProperty('--rarity-b', col); const t = c.querySelector('.po2-front .card-tile');
  if(t){ t.className = t.className.replace(/\brarity-tier-\w+/g, '') + ' ' + (RCOL[rarity] || rarity === 'legendary' ? 'rarity-tier-top' : rarity === 'heroic' || rarity === 'epic' ? 'rarity-tier-high' : 'rarity-tier-mid'); t.setAttribute('style', `--rarity-a:${col}; --rarity-b:${col}`);
    if(o.foil){ t.classList.add('is-holo', o.foil); try{ decorateHolo(c); }catch(e){} } }
  if(o.tease) c.classList.add(o.tease); const rar = c.querySelector('.po2-rar'); if(rar) rar.textContent = o.label || rarity[0].toUpperCase() + rarity.slice(1); return c; };
R({id:'pack-idle', stage:'pack', variants:[{key:'A', label:'Floats and glows, sheen runs (live CSS)', play:ctx=> ctx.wait(2600)}]});
R({id:'pack-glow', stage:'pack', variants:[{key:'A', label:'Glows in the best card’s colour (live CSS)', play:ctx=>{ const p = PK(ctx); p.classList.add('has-glow'); p.style.setProperty('--leak', '#9333ea'); p.style.setProperty('--glow', '#9333ea'); return ctx.wait(2600); }}]});
R({id:'pack-jackpot', stage:'pack', variants:[{key:'A', label:'Jackpot spin and blink (live CSS)', play:ctx=>{ PK(ctx).classList.add('is-jackpot'); ctx.sound('rareRise', true); return ctx.wait(2600); }}]});
R({id:'pack-stack', stage:'pack', variants:[{key:'A', label:'Packs still to open pile up behind (live markup)', play:ctx=>{ const w = ctx.pack.el.querySelector('.po2-pile-wrap'); if(w) w.insertAdjacentHTML('afterbegin', '<div class="po2-pile" aria-hidden="true">' + [1, 2, 3, 4].map(j=> `<span class="po2-pile-pack" style="--j:${j}"></span>`).join('') + '</div>');
  const st = ctx.pack.el.querySelector('.po2-stage'); if(st) st.insertAdjacentHTML('beforeend', '<div class="po2-pile-n">4 more packs to open</div>'); return ctx.wait(2400); }}]});
const tearIt = async (ctx, flair, id)=>{ const p = PK(ctx), s = ctx.pack.strip; ctx.sound('tapeRip'); const o = {t:0};
  await new Promise(res=> G().to(o, {t:1, duration:.6, ease:'power1.in', onUpdate:()=>{ s.style.setProperty('--tear', o.t.toFixed(3)); s.classList.add('is-tearing'); }, onComplete:res}));
  s.classList.add('is-gone'); p.classList.add('is-open'); ctx.sound('swipeTone'); if(flair) X().packTear(p, {id}); await ctx.wait(450); p.classList.add('is-rising'); await ctx.wait(900); };
R({id:'pack-tear', stage:'pack', inGameHook:'B: packTorn (the strip rips), per pack type', variants:[
  {key:'A', label:'Drag the strip off (live CSS)', play:ctx=> tearIt(ctx)}, {key:'B', label:'+ Gold pack: coins spill as it rips', play:ctx=> tearIt(ctx, true, 'gold')},
  {key:'C', label:'+ Rivergate: a river splash', play:ctx=> tearIt(ctx, true, 'fp-otter')}, {key:'D', label:'+ Sunfeather: feathers burst out', play:ctx=> tearIt(ctx, true, 'fp-hummingbird')}]});
R({id:'pack-burst', stage:'pack', variants:[{key:'A', label:'Bursts open and rises (live CSS)', play:ctx=>{ const p = PK(ctx); ctx.pack.strip.classList.add('is-gone'); p.classList.add('is-open'); ctx.sound('gold'); return ctx.wait(450).then(()=>{ p.classList.add('is-rising'); return ctx.wait(1300); }); }}]});
R({id:'pack-legacy-shake', stage:'pack', inGameHook:'lab only: the old opener path is no longer used', variants:[
  {key:'A', label:'Before: the old poShake', play:ctx=>{ PK(ctx).style.animation = 'poShake .6s ease-in-out'; return ctx.wait(1200); }}, {key:'B', label:'Building shake, light leaking from the seams', play:ctx=> X().packShake(PK(ctx)).then(()=> ctx.wait(300))}]});
const tease = (cls, rarity, flourish)=> async ctx=>{ await dealt(ctx); const c = dress(ctx, 0, rarity, {tease:cls}); ctx.sound('rareRise', cls === 'tease-legend'); await ctx.wait(1200); ctx.pack.flip(0); ctx.sound('cardFlip');
  const st = ctx.pack.el.querySelector('.po2-stage'); if(st){ st.style.setProperty('--ray', c.style.getPropertyValue('--rarity-a')); st.classList.add('is-rays'); st.classList.toggle('is-rays-big', cls !== 'tease-rare'); }
  if(flourish) await ctx.wait(250).then(()=> flourish(c)); await ctx.wait(1500); };
R({id:'pack-tease-rare', stage:'pack', variants:[{key:'A', label:'Rare: blue tease, soft rays (live CSS)', play:tease('tease-rare', 'rare')}]});
R({id:'pack-tease-epic', stage:'pack', inGameHook:'B: packCardRevealed for Heroic / Unique', variants:[{key:'A', label:'Epic: purple tease, big rays (live CSS)', play:tease('tease-epic', 'epic')}, {key:'B', label:'Heroic: + orange flare and HEROIC (new)', play:tease('tease-epic', 'heroic', c=> X().revealHeroic(c))}]});
R({id:'pack-tease-legend', stage:'pack', inGameHook:'B: packCardRevealed for Legendary', variants:[{key:'A', label:'Legend tease, sparks (live CSS)', play:tease('tease-legend', 'legendary')}, {key:'B', label:'Legendary: + coin shower and a crown (new)', play:tease('tease-legend', 'legendary', c=> X().revealLegendary(c))}]});
R({id:'pack-rays', stage:'pack', variants:[{key:'A', label:'Rays in the rarity colour (live CSS)', play:tease('', 'rare')}]});
R({id:'pack-rays-big', stage:'pack', variants:[{key:'A', label:'Big fast rays (live CSS)', play:tease('', 'epic')}]});
R({id:'pack-spark', stage:'pack', variants:[{key:'A', label:'Spark', play:async ctx=>{ await dealt(ctx); ctx.pack.flip(0); ctx.pack.cards[0].classList.add('is-spark'); ctx.sound('gold'); await ctx.wait(1600); }},
  {key:'B', label:'Superspark', play:async ctx=>{ await dealt(ctx); ctx.pack.flip(0); ctx.pack.cards[0].classList.add('is-superspark'); ctx.sound('rareRise', true); await ctx.wait(1800); }}]});
const topReveal = (rarity, v)=> async ctx=>{ await dealt(ctx); const c = dress(ctx, 0, rarity, {tease:'tease-legend'}); X().packTease(c, rarity); await ctx.wait(1300); ctx.pack.flip(0); ctx.sound('cardFlip'); await X().revealTop(c, rarity, v); await ctx.wait(300); };
const TOPLAB = {mythic:['Red flare, the screen dims, a heartbeat', 'A blood moon rises behind it', 'Shockwave and an ember fountain'], ancient:['A stone tablet cracks open, blue runes flare', 'A rune circle draws itself and spins', 'Deep water: blue light from below, bubbles'],
  divine:['A white pillar of light comes down', 'A golden halo settles, rays turn', 'White wings unfold behind it'], void:['The card tears the screen open; static in the rip', 'Implosion, then it pops out', 'Glitch: RGB slices and static bars'],
  daemonic:['Black flame floods the stage; red eyes open', 'A hell-gate: two black doors swing open', 'Brimstone rain and a red flash']};
Object.entries(TOPLAB).forEach(([r, labels])=> R({id:'pack-reveal-' + r, stage:'pack', inGameHook:'packCardUp (build-up while face down) + packCardRevealed (A plays in the game)',
  note:'Each starts with the build-up the game plays while the card waits face down.', variants:labels.map((l, i)=> ({key:'ABC'[i], label:l, play:topReveal(r, 'ABC'[i])}))}));
const foilRev = v=> async ctx=>{ await dealt(ctx); const c = dress(ctx, 0, 'rare', {foil:'holo-rainbow'}); ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(380); await X().revealFoil(c, {variant:v}); await ctx.wait(300); };
R({id:'pack-reveal-foil', stage:'pack', inGameHook:'packCardRevealed (r.foil): A', variants:[{key:'A', label:'Rainbow sweep, the finish flares, FOIL stamp', play:foilRev('A')}, {key:'B', label:'Prism shards burst, the card tilts into the light', play:foilRev('B')}, {key:'C', label:'Three quick shines, a holo ring of sparkles', play:foilRev('C')}]});
const shinyRev = plain=> async ctx=>{ await dealt(ctx); const c = ctx.pack.cards[0], t = c.querySelector('.po2-front .card-tile'); t.classList.add('is-shiny'); t.style.setProperty('--shiny-hue', '160deg'); c.querySelector('.po2-front').insertAdjacentHTML('beforeend', '<span class="shiny-mark" title="Shiny">✦</span>');
  ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(380); if(!plain) await X().revealShiny(c); else await ctx.wait(1600); };
R({id:'pack-reveal-shiny', stage:'pack', inGameHook:'packCardRevealed (r.shiny)', variants:[{key:'A', label:'Hues cycle, settle on its shiny colour, ✦ SHINY', play:shinyRev(false)}, {key:'B', label:'Before: the ✦ mark only', play:shinyRev(true)}]});
R({id:'pack-new-card', stage:'pack', variants:[{key:'A', label:'NEW! border, stamp, flash (live CSS)', play:async ctx=>{ await dealt(ctx); ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(380); ctx.pack.cards[0].classList.add('is-new-moment'); ctx.pack.el.classList.add('po2-flash'); ctx.sound('unlockChime'); await ctx.wait(520); ctx.pack.el.classList.remove('po2-flash'); await ctx.wait(1200); }}]});
const dupRev = plain=> async ctx=>{ await dealt(ctx); const c = ctx.pack.cards[0]; c.classList.remove('is-new'); const nw = c.querySelector('.po2-new'); if(nw) nw.remove(); if(plain) c.insertAdjacentHTML('beforeend', '<span class="po2-stackn">×2</span>');
  ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(420); if(!plain) await X().revealDuplicate(c, {count:2}); else await ctx.wait(1500); };
R({id:'pack-duplicate', stage:'pack', inGameHook:'packCardRevealed (not new)', variants:[{key:'A', label:'Copies slam in behind with a thunk, ×2, dust motes', play:dupRev(false)}, {key:'B', label:'Before: ×N chip only', play:dupRev(true)}]});
R({id:'pack-collect', stage:'pack', variants:[{key:'A', label:'The card flies down to its slot (as the opener does)', play:async ctx=>{ await dealt(ctx); ctx.pack.flip(0); await ctx.wait(700); const c = ctx.pack.cards[0], r = c.getBoundingClientRect(), g = G();
  const gh = document.createElement('div'); gh.className = 'po2-fly'; gh.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`; gh.innerHTML = c.querySelector('.po2-front').innerHTML; document.body.appendChild(gh); c.style.opacity = '0'; ctx.sound('cardFlip');
  await new Promise(res=> g.timeline({onComplete:res}).to(gh, {x:-r.width*.6, y:-40, scale:.7, rotation:-6, duration:.25, ease:'power1.out'}).to(gh, {x:-r.width*.9, y:r.height*.9, scale:.35, rotation:0, duration:.3, ease:'power2.in'})); gh.remove(); await ctx.wait(500); }}]});
R({id:'pack-sweep-reveal', stage:'pack', variants:[{key:'A', label:'A sweep across flips it (live CSS)', play:async ctx=>{ await dealt(ctx); ctx.sound('swipeTone'); ctx.pack.flip(0); ctx.sound('cardFlip'); await ctx.wait(1500); }}]});
R({id:'pack-summary', stage:'pack', variants:[{key:'A', label:'The haul in a grid, a wave runs across it (ProcFX.ripple)', play:async ctx=>{ const ov = ctx.pack.el; const tiles = ['common', 'rare', 'epic', 'legendary', 'uncommon', 'foil'].map(k=> ctx.tile(k));
  ov.innerHTML = `<div class="po2-stage po2-summary"><div class="po2-sum-grid is-balanced" style="--per:3">${tiles.map(t=> `<div class="po-card is-flipped po2-sum-card">${t.outerHTML}</div>`).join('')}</div></div>`;
  try{ decorateHolo(ov); }catch(e){} await ctx.wait(400); const cs = [...ov.querySelectorAll('.po2-sum-card')]; if(window.ProcFX && ProcFX.ripple) ProcFX.ripple(cs, {from:0, amount:.7}); ctx.sound('gold'); await ctx.wait(1800); }}]});
R({id:'pack-open-all-table', stage:'pack', variants:[{key:'A', label:'Packs on the table open as the slash crosses them', play:async ctx=>{ const ov = ctx.pack.el, art = (PK(ctx).querySelector('.po2-art') || {}).getAttribute ? PK(ctx).querySelector('.po2-art').getAttribute('style') : '';
  ov.innerHTML = `<div class="po2-stage po2-table-stage"><div class="po2-table" id="poTable" style="--n:6; --per:3">${[0, 1, 2, 3, 4, 5].map(i=> `<div class="po2-tpack" data-ti="${i}" style="--i:${i}"><span class="po2-tpack-art" style="${art}"></span><span class="po2-tpack-sheen" aria-hidden="true"></span></div>`).join('')}<div class="po2-slash" id="poSlash" aria-hidden="true"></div></div></div>`;
  await ctx.wait(700); const ps = [...ov.querySelectorAll('.po2-tpack')]; for(const p of ps){ p.classList.add('is-open'); ctx.sound('pageTurn'); await ctx.wait(110); } ctx.sound('gold'); await ctx.wait(400); ov.querySelector('.po2-table').classList.add('is-gathering'); await ctx.wait(900); }}]});
R({id:'pack-crate', stage:'pack', variants:[{key:'A', label:'A crate for 100+ packs, pried open (live CSS)', play:async ctx=>{ const ov = ctx.pack.el; ov.innerHTML = '<div class="po2-stage"><div class="po2-crate" id="poCrate"><span class="po2-crate-lid"></span><span class="po2-crate-body">📦</span></div></div>'; await ctx.wait(600); ov.querySelector('.po2-crate').classList.add('is-open'); ctx.sound('woodKnock'); await ctx.wait(1600); }}]});
R({id:'pack-pile', stage:'pack', variants:[{key:'A', label:'A huge pile with its count (live CSS)', play:async ctx=>{ await dealt(ctx); const st = ctx.pack.el.querySelector('.po2-stage'); const tl = st && st.querySelector('.po2-tally'); if(tl) tl.remove(); if(st) st.insertAdjacentHTML('beforeend', '<div class="po2-pile-count">240 cards</div>'); await ctx.wait(1800); }}]});
R({id:'pack-faction', stage:'pack', inGameHook:'packShown (A plays in the game)', variants:[
  {key:'A', label:'Rivergate: a wax seal stamps on, a river band', play:ctx=>{ X().packDress(PK(ctx), {id:'fp-otter'}); return ctx.wait(2200); }},
  {key:'B', label:'Sunfeather: a wrap of hummingbird feathers', play:ctx=>{ X().packDress(PK(ctx), {id:'fp-hummingbird'}, {variant:'B'}); return ctx.wait(2400); }},
  {key:'C', label:'Hive bundle: seal and honey band', play:ctx=>{ X().packDress(PK(ctx), {id:'fp-hive'}); return ctx.wait(2200); }}]});
R({id:'pack-mystery', stage:'pack', inGameHook:'packShown (pool 99 / id "mystery")', variants:[
  {key:'A', label:'Question marks circle the wobbling wrapper', play:ctx=>{ ctx.sound('mysteryBoing'); X().packMystery(PK(ctx)); return ctx.wait(2600); }}, {key:'B', label:'Before: boing and the plain opener', play:ctx=>{ ctx.sound('mysteryBoing'); return ctx.wait(1600); }}]});
R({id:'pack-free-courier', stage:'pack', variants:[{key:'A', label:'The courier bobs in with the pack (approximation of the live CSS)', play:ctx=>{ const p = PK(ctx); const g = G(); ctx.sound('pickup'); return new Promise(res=> g.timeline({onComplete:res}).fromTo(p, {x:-260, rotation:-12}, {x:0, rotation:0, duration:.7, ease:'power2.out'}).to(p, {y:-10, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut'}).to({}, {duration:.4})); }}]});
R({id:'pack-purchase', stage:'ui', variants:[{key:'A', label:'Coin register and the counter ticks (live sound)', play:ctx=>{ const p = ctx.ui.pills.gold; ctx.sound('coinRegister'); if(p) G().fromTo(p, {scale:1}, {scale:1.2, duration:.12, yoyo:true, repeat:3}); return ctx.wait(1400); }}]});
R({id:'pack-discover', stage:'cards', variants:[{key:'A', label:'Discovered! burst and shine (live CSS)', play:ctx=>{ const w = ctx.cards[1].closest('.board-card'); w.insertAdjacentHTML('beforeend', '<span class="discover-burst" aria-hidden="true"></span>'); ctx.cards[1].classList.add('discover-shine'); ctx.sound('unlockChime'); return spot(ctx, ctx.cards[1]); }}]});
R({id:'pack-reward-unlock', stage:'cards', variants:[{key:'A', label:'Padlock sparkle and break (SkillFX.unlockSparkle)', play:ctx=>{ const t = ctx.cards[1]; if(window.SkillFX && SkillFX.unlockSparkle) SkillFX.unlockSparkle(t, {}); ctx.sound('lockBreak'); return ctx.wait(1900); }}]});
R({id:'pack-pity', stage:'pack', inGameHook:'future (FX.D.pitySeal(packEl))', variants:[{key:'A', label:'A “Guaranteed!” seal stamps onto the pack', play:ctx=> X().pitySeal(PK(ctx)).then(()=> ctx.wait(900))}]});
R({id:'pack-odds', stage:'ui', inGameHook:'future (FX.D.packOdds(host))', variants:[{key:'A', label:'The odds card unfolds; each bar fills', play:ctx=> X().packOdds(ctx.ui.el)}]});

// ---------------- the Forge (a forge anvil built on the cards stage, with the game's forge CSS) ----------------
const anvil = ctx=>{ const row = ctx.root.querySelector('.fxl-cardrow'); row.style.display = 'none';
  const st = document.createElement('div'); st.className = 'anvil-stage'; st.id = 'anvilStage'; st.style.cssText = 'position:relative; display:flex; align-items:center; justify-content:center; min-height:260px;';
  st.innerHTML = `<div class="forge-glow" aria-hidden="true"></div><div class="forge-preview-wrap">${ctx.cards[2].outerHTML.replace('class="card-tile', 'class="card-tile forge-preview')}</div><span class="forge-hammer" aria-hidden="true">🔨</span>`;
  ctx.root.appendChild(st); try{ decorateHolo(st); }catch(e){} return st; };
// The shared smithing sequence, as forgeSmithAnimation plays it: strikes with sparks, the quench, a flip to the new face at ~1.45 s.
const smith = (ctx, st, heavy, after)=>{ const g = G(), h = st.querySelector('.forge-hammer'), card = st.querySelector('.card-tile'); st.classList.add('is-hot'); const tl = g.timeline(); tl.set(h, {opacity:1, rotation:-55, y:-30, x:40});
  for(let k = 0; k < (heavy ? 4 : 3); k++) tl.to(h, {rotation:-55, y:-34, duration:.16}).to(h, {rotation:10, y:6, duration:.09, ease:'power3.in', onComplete:()=> ctx.sound('clang')}).to(card, {scaleY:.93, scaleX:1.04, duration:.05, yoyo:true, repeat:1}, '<');
  tl.to(h, {opacity:0, y:-50, duration:.2}).add(()=>{ st.classList.remove('is-hot'); st.classList.add('is-quench'); }).to(card, {rotationY:90, duration:.12, transformPerspective:600}, '+=.15')
    .add(()=>{ if(after) after(card); }).to(card, {rotationY:0, duration:.18, clearProps:'rotationY,transformPerspective'}).add(()=> st.classList.remove('is-quench'), '+=.5');
  return tl; };
R({id:'meta-forge-temper', stage:'cards', variants:[{key:'A', label:'Heat, hammer, quench, shine (ProcFX.forge)', play:ctx=>{ const st = anvil(ctx), card = st.querySelector('.card-tile'); if(!window.ProcFX || !ProcFX.forge) return ctx.wait(500);
  const f = ProcFX.forge(card, {seed:'lab-temper'}); if(!f || !f.tl) return ctx.wait(500); [1.9, 2.45, 3.0].forEach(at=> f.tl.call(()=> ctx.sound('clang'), null, at + .15));
  return new Promise(res=>{ f.tl.eventCallback('onComplete', ()=>{ try{ f.destroy(); }catch(e){} res(); }); f.tl.seek('heat').timeScale(2.2).play(); ctx.wait(5000).then(res); }); }}]});
const upgrade = (fn, info, heavy, after)=> ctx=>{ const st = anvil(ctx); smith(ctx, st, heavy !== false, after); if(!fn) return ctx.wait(2600); return X()[fn](st, info).then(()=> ctx.wait(200)); };
R({id:'meta-forge-limit-break', stage:'cards', inGameHook:'fxHook forgeUpgrade "limitBreak" (forgeLimitBreak)', variants:[
  {key:'A', label:'Red-hot chains bind it, snap at the flip, dragon scales glow', play:upgrade('forgeLimitBreak', {})}, {key:'B', label:'Before: the shared smithing flip', play:upgrade(null)}]});
R({id:'meta-forge-promote', stage:'cards', inGameHook:'fxHook forgeUpgrade "promote" (forgePromote)', variants:[
  {key:'A', label:'The frame recolours Rare → Epic with a sweep', play:upgrade('forgePromote', {from:'rare', to:'epic'}, true, c=>{ c.style.setProperty('--rarity-a', '#9333ea'); c.style.setProperty('--rarity-b', '#9333ea'); })}, {key:'B', label:'Before: the shared smithing flip', play:upgrade(null)}]});
R({id:'meta-forge-prestige', stage:'cards', inGameHook:'fxHook forgeUpgrade "prestige" (forgePrestige)', variants:[
  {key:'A', label:'Gold: the ring paints itself on', play:upgrade('forgePrestige', {tier:'gold'}, true, c=> c.classList.add('prestige-gold'))},
  {key:'B', label:'Rainbow ring paints on', play:upgrade('forgePrestige', {tier:'rainbow'}, true, c=> c.classList.add('prestige-rainbow'))},
  {key:'C', label:'Extended: a double frame paints on', play:upgrade('forgePrestige', {tier:'extended'}, true, c=> c.classList.add('prestige-extended'))}, {key:'D', label:'Before: the shared smithing flip', play:upgrade(null)}]});
R({id:'meta-forge-refine', stage:'cards', inGameHook:'fxHook forgeUpgrade "refine" (forgeRefine)', variants:[
  {key:'A', label:'Rainbow: the finish sweeps across as it lands', play:upgrade('forgeRefine', {finish:'rainbow'}, true, c=>{ c.classList.add('is-holo', 'holo-rainbow'); try{ decorateHolo(c.parentNode); }catch(e){} })},
  {key:'B', label:'Gold leaf', play:upgrade('forgeRefine', {finish:'gold'}, true, c=>{ c.classList.add('is-holo', 'holo-gold'); try{ decorateHolo(c.parentNode); }catch(e){} })},
  {key:'C', label:'Prism', play:upgrade('forgeRefine', {finish:'prism'}, true, c=>{ c.classList.add('is-holo', 'holo-prism'); try{ decorateHolo(c.parentNode); }catch(e){} })}, {key:'D', label:'Before: the shared smithing flip', play:upgrade(null)}]});
R({id:'meta-forge-enchant', stage:'cards', variants:[{key:'A', label:'A Materia crystal forms, spins and drops (materiaBurstVfx)', play:ctx=>{ anvil(ctx); ctx.sound('materiaForm'); try{ materiaBurstVfx(MATERIA_KINDS[0]); }catch(e){} return ctx.wait(2200); }}]});
R({id:'meta-forge-melt', stage:'ui', inGameHook:'fxHook forgeMelt (the Melt button)', variants:[{key:'A', label:'The card droops and streams as dust into the Dust pill', play:ctx=>{ const t = ctx.tile('rare'); const w = document.createElement('div'); w.style.cssText = 'display:flex; justify-content:center; margin-top:16px;'; w.appendChild(t.closest('.board-card')); ctx.ui.el.appendChild(w); return ctx.wait(300).then(()=> X().forgeMelt(t, {dust:120})).then(()=> ctx.wait(300)); }}]});
R({id:'meta-forge-fuse', stage:'cards', inGameHook:'fxHook forgeFuse (Blacksmith: fuse copies)', variants:[{key:'A', label:'Three copies fly in and fold into one, sparks, a flash', play:ctx=>{ const st = anvil(ctx); return X().forgeFuse(st, {icon:'🦦'}).then(()=> ctx.wait(200)); }}]});
R({id:'meta-forge-tier-up', stage:'ui', inGameHook:'fxHook forgeTierUp (upgradeForge)', variants:[{key:'A', label:'The hearth roars up, an anvil drops in, the new name', play:ctx=>{ const p = document.createElement('div'); p.className = 'forge-upgrade'; p.style.cssText = 'margin:40px auto 0; width:min(320px, 90%); padding:14px; border-radius:12px; background:var(--surface-2); text-align:center; font-weight:800;'; p.textContent = '🏭 Village Smithy → Ironworks'; ctx.ui.el.appendChild(p); return ctx.wait(200).then(()=> X().forgeTierUp(p, {name:'Ironworks'})); }}]});
R({id:'meta-forge-entrance', stage:'cards', variants:[{key:'A', label:'The forge flares up on entering (live CSS)', play:ctx=>{ const st = anvil(ctx); st.insertAdjacentHTML('afterbegin', '<div class="forge-flareup" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'); ctx.sound('fireBreath', 500); return ctx.wait(1800); }}]});
R({id:'meta-castle-temper', stage:'cards', inGameHook:'fxHook castleTempered (temperCastle)', variants:[{key:'A', label:'Stones fly in and fit into the wall', play:ctx=> spot(ctx, ctx.castle).then(()=> X().castleTemper(ctx.castle, {level:7}))}]});
})();
