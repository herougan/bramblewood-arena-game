/* ============================================================
   Effects Lab, "Smoke and war" tab (2026-10-21, package FX-WAR). Markup and styles live in build.py (section#war).
   - Sixteen NEW demos from bramblewood-fx-war.js (window.WarFX), every one badged "Lab only (not used yet)": nothing in the game calls them.
   - A reference group of the smoke / dust / fire / siege effects the game ALREADY has, each badged "In game: <where>", playable on the same
     stage, so the owner can compare before picking.
   - Also adds the same in-game badge to the older tabs' cards (OLD_TAB below, from the 2026-10-21 audit; docs/effects-catalogue.md).
   Badge text is one of: "In game: <where>" or "Lab only (not used yet)". Keep the two in step with docs/effects-catalogue.md.
   ============================================================ */
(function(){
'use strict';
const $ = (s, r)=> (r || document).querySelector(s), $$ = (s, r)=> [...(r || document).querySelectorAll(s)];
const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const badge = (inGame, where)=> inGame
  ? `<span class="ig is-game" title="${esc(where)}"><b>In game:</b> ${esc(where)}</span>`
  : '<span class="ig is-lab"><b>Lab only</b> (not used yet)</span>';
window.FXLAB_BADGE = badge;

// ---------------------------------------------------------------- the older tabs: cards that had only a Live / Lab / New pill
// key = the card's heading; value = where the game uses it, or '' when the game does not (2026-10-21 audit, checked against arena_app.js).
const OLD_TAB = {
  'Drunken-miner cracks': 'Bramble (castle) damage cracks (ProcFX.castleDamage)',
  'Cellular-automaton crumble': 'the castle falling at match end (ProcFX.crumble, castleCrumble)',
  'Cards of old': 'the "Cards of old" card finish (ProcFX.decorateOld)',
  'Voronoi shatter': 'ice-shard deaths and stone and boss deaths (ProcFX.shatter)',
  'Flip riffle': 'the deck shuffle at match start (ProcFX.flipShuffle)',
  'Lantern light': '',
  'Forge timeline': 'the Forge temper animation (ProcFX.forge)',
  'Ripple from click': 'the pack summary haul (ProcFX.ripple)',
  'Summon slam': '', 'Hourglass flip on Wait': '', 'Shine sweep': '',
  'Idle breathing': 'board cards at rest',
  'Ready pulse': 'a card whose Wait reaches 0',
  'Low-HP tremble': 'board units at 25% Health or less',
  'Castle cracks': 'the Bramble tiles as they take damage',
  'Card drag trail': 'dragging a hand card',
  'Leader throne': 'summoning your leader',
  'Deck shuffle': 'the deck at match start',
  'Draw flip': 'every draw from the deck',
  'Victory toss': 'the end of a won match',
  'Card emotes': 'board card barks',
  'Heat haze': 'fire cards on the board (.heat-haze)',
  'Shockwave ripple': 'heavy blows of 8+ and Charge firing (SkillFX.shockwave, Effects High)',
  'Castle crumble': 'the castle falling at match end',
  'Level-up burst': 'Forge temper and the Nest "LEVEL 1" (metaFx levelUp)',
  'Card unlock sparkle': '',
  'Skirmish sky-drop': 'Skyfall cards arriving (SkillFX.skyDrop)',
  'Critical hit': 'every critical hit',
  'Combo counter': '', 'Card tilt in hand': '',
  'Holo foil — three looks': 'Rare+ foils and pack reveals',
  'Legibility pills and stat chips': 'every card',
  'Hero card and level-up ring': 'the Hero Hall',
  'Damage numbers': 'every hit and tick',
  'Impact squash and recoil': 'melee hits',
  'Deaths: bleed-out and burn-away': 'card deaths',
  'Frost, shock, feathers, shatter': 'Freeze, Shock, flyer hits and token deaths',
  'Attack preview': 'hovering a card on the board',
  'Pitch preview': 'dragging a hand card',
  'Low-castle danger pulse': 'a Bramble under 25%',
  'Pack light leak': 'pack openings',
  'Floating motes': 'scenes and maps outside fights',
  'Pixel reveal and page turn': 'the Codex and the start of a fight',
  'Leaf sweep transition': 'menu changes',
};
function oldTabBadges(){
  $$('.lab section .fx').forEach(card=>{
    const h = card.querySelector('h3'); if(!h || card.classList.contains('treat') || card.querySelector('.ig') || card.closest('#war') || card.closest('#catalogue')) return;
    const pill = h.querySelector('.st'); const name = h.textContent.replace(pill ? pill.textContent : '', '').replace(/\s+/g, ' ').trim().replace(/^[^\w]+/, '');
    if(pill && /retired/i.test(pill.textContent)){ return; }
    const key = Object.keys(OLD_TAB).find(k=> k === name);
    let where = key != null ? OLD_TAB[key] : (pill && pill.classList.contains('live') ? '(see the Catalogue tab)' : '');
    const row = document.createElement('div'); row.className = 'ig-row'; row.innerHTML = badge(!!where, where);
    h.insertAdjacentElement('afterend', row);
  });
}
// The Foils tab: the finishes the rarity rules apply are live; the rest are in the Codex finish picker only.
function foilBadges(){
  $$('#treatGrid .fx.treat, .treat-grid .fx.treat').forEach(card=>{
    const pill = card.querySelector('h3 .st'); if(!pill || card.querySelector('.ig')) return;
    const live = pill.classList.contains('live');
    const row = document.createElement('div'); row.className = 'ig-row'; row.innerHTML = live ? badge(true, 'applied by rarity (foils and pack reveals)') : badge(true, 'the card finish picker only, not applied by rarity');
    card.querySelector('h3').insertAdjacentElement('afterend', row);
  });
}

// ---------------------------------------------------------------- the stage
const arena = $('#warArena'); if(!arena){ return; }
const WF = ()=> window.WarFX, SF = ()=> window.SkillFX, FA = ()=> (window.FX && window.FX.A) || {}, FB = ()=> (window.FX && window.FX.B) || {}, FC = ()=> (window.FX && window.FX.C) || {};
// the stage is put back to its first markup before every play (a death effect hides its tile), so the rows are looked up each time
const PRISTINE = arena.innerHTML;
const rowFoe = ()=> $$('.sk-row', arena)[0], rowMine = ()=> $$('.sk-row', arena)[1];
const foe = ()=> $$('.card-tile', rowFoe()).filter(t=> !t.classList.contains('is-castle')), mine = ()=> $$('.card-tile', rowMine());
const castle = ()=> $('.card-tile.is-castle', rowFoe());
const ctx = ()=> ({foe:foe(), mine:mine(), castle:castle(), rowFoe:rowFoe(), rowMine:rowMine(), arena, all:[...foe(), ...mine()]});

// ---------------------------------------------------------------- the new effects (each calls WarFX only)
// group: smoke | war. near: the closest thing the game already has (shown so the owner can compare). variants: [label, run(ctx)].
const NEW = [
  {id:'puff', group:'smoke', name:'Puff', sig:'WarFX.puff(target, {dark, dust, size})', note:'A cute "poof": bubbly cloud blobs and a thin ring pop out of a card.', near:'SkillFX.smokePuff (the Smoke Bomb cloud)',
    v:[['Light', c=> WF().puff(c.foe[0])], ['Gunpowder', c=> WF().puff(c.foe[1], {dark:true})], ['Dust', c=> WF().puff(c.mine[0], {dust:true})]]},
  {id:'smokeBurst', group:'smoke', name:'Smoke bomb burst', sig:'WarFX.smokeBurst(from, to, {dark, size})', note:'A lit bomb is lobbed in, then bursts into a ring of big clouds that linger as a haze.', near:'SkillFX.smokeBomb',
    v:[['Bomb to a card', c=> WF().smokeBurst(c.mine[1], c.foe[0])], ['Dark smoke', c=> WF().smokeBurst(c.mine[1], c.foe[1], {dark:true})], ['Burst only', c=> WF().smokeBurst(c.foe[1], null, {size:80})]]},
  {id:'smokeScreen', group:'smoke', name:'Smoke screen', sig:'WarFX.smokeScreen(laneOrCards, {from, hold, dark})', note:'A wall of cloud rolls along a lane, hides it, holds, then lifts away.', near:'none (the Smoke status only blurs one card)',
    v:[['Their lane', c=> WF().smokeScreen(c.rowFoe)], ['Your lane, dark, from the right', c=> WF().smokeScreen(c.rowMine, {from:'right', dark:true})]]},
  {id:'battlefieldSmoke', group:'smoke', name:'Drifting battlefield smoke', sig:'WarFX.battlefieldSmoke(host, {duration, dir, dark}).stop()', note:'Low smoke banks drift slowly over the whole field. Faint, so cards stay readable.', near:'the Thick Fog and Ashy field looks',
    v:[['Pale haze', c=> WF().battlefieldSmoke(c.arena, {duration:3400})], ['Gunsmoke', c=> WF().battlefieldSmoke(c.arena, {duration:3400, dark:true, dir:-1})]]},
  {id:'smokeColumn', group:'smoke', name:'Smoke column', sig:'WarFX.smokeColumn(target, {duration, height, flame, dark})', note:'A twisting column of smoke with a small flame at its foot rises from a burning card or castle.', near:'none',
    v:[['Burning castle', c=> WF().smokeColumn(c.castle, {duration:2400})], ['Smouldering card', c=> WF().smokeColumn(c.foe[0], {duration:2000, flame:false, dark:false})]]},
  {id:'dustKick', group:'smoke', name:'Battle dust', sig:'WarFX.dustKick(target, {dir})', note:'Dust and pebbles are kicked up behind a card as it charges in, with a few speed lines.', near:'FX.A.stampede (the Overwhelm dust roll)',
    v:[['Charging up', c=> WF().dustKick(c.mine[0], {dir:-90})], ['Charging sideways', c=> WF().dustKick(c.mine[2], {dir:0})], ['Landing', c=> WF().dustKick(c.foe[0], {dir:90})]]},
  {id:'cannonBlast', group:'war', name:'Cannon blast', sig:'WarFX.cannonBlast(from, to, {flight})', note:'Muzzle flash and smoke, a cannonball that trails puffs, then a crash with debris, dust and sparks.', near:'FX.A.ballista (a bolt), SkillFX.dynamite (a blast)',
    v:[['At a card', c=> WF().cannonBlast(c.mine[1], c.foe[0])], ['At the castle', c=> WF().cannonBlast(c.mine[0], c.castle)]]},
  {id:'catapultLob', group:'war', name:'Catapult lob', sig:'WarFX.catapultLob(from, to, {host})', note:'A boulder is thrown in a high arc; a shadow grows where it will land; it crashes with a ground ring and bouncing rocks.', near:'SkillFX.meteor (a falling rock)',
    v:[['At a card', c=> WF().catapultLob(c.mine[0], c.foe[1], {host:c.arena})], ['At the castle, with a shake', c=> WF().catapultLob(c.mine[1], c.castle, {host:c.arena})]]},
  {id:'explosion', group:'war', name:'Explosion', sig:'WarFX.explosion(target, {size, cards})', note:'White flash, a bubbly fireball, a shockwave ring that shoves neighbours, a star burst, sparks, debris and rising smoke.', near:'SkillFX.dynamite and the Explode death',
    v:[['Normal', c=> WF().explosion(c.foe[0], {cards:c.all})], ['Big', c=> WF().explosion(c.castle, {size:1.5, cards:c.all})], ['Small', c=> WF().explosion(c.mine[2], {size:.65})]]},
  {id:'flamingVolley', group:'war', name:'Flaming arrow volley', sig:'WarFX.flamingVolley(from, targets, {n, onHit})', note:'Fire arrows arc up and over, shed embers, and land as little flame pops across the lane.', near:'SkillFX.bowShot {fire} and FX.A.arrowRain',
    v:[['Six arrows', c=> WF().flamingVolley(c.mine[1], c.foe, {n:6})], ['Eight, at the whole row', c=> WF().flamingVolley(c.mine[1], c.rowFoe, {n:8})]]},
  {id:'burningGround', group:'war', name:'Burning ground', sig:'WarFX.burningGround(target, {duration, width, slot, smoke})', note:'A scorch mark with a row of cartoon flames and rising embers under a card or on a slot, then it burns out.', near:'SkillFX.trapSet / trapSnap {kind:scorch}',
    v:[['Under a card', c=> WF().burningGround(c.foe[0], {duration:2600})], ['Short, no smoke', c=> WF().burningGround(c.mine[1], {duration:1500, smoke:false})]]},
  {id:'swordClash', group:'war', name:'Sword clash', sig:'WarFX.swordClash(a, b)', note:'Two cards lunge together; a starburst, a spray of sparks, a ring and a popping crossed-swords glyph.', near:'FX.A.frictionSparks, FX.A.critSparks',
    v:[['Clash', c=> WF().swordClash(c.mine[0], c.foe[0])], ['Across the board', c=> WF().swordClash(c.mine[2], c.foe[1])]]},
  {id:'warHorn', group:'war', name:'War horn', sig:'WarFX.warHorn(source, allies, {radius})', note:'A horn pops up and sounds three gold rings; each ally the ring reaches hops and lets a note float up.', near:'SkillFX.rally (in game), FX.A.rallyStandard (lab only)',
    v:[['Sound the horn', c=> WF().warHorn(c.mine[1], c.mine)], ['Rally the other row', c=> WF().warHorn(c.foe[0], c.foe)]]},
  {id:'ramSlam', group:'war', name:'Siege ram slam', sig:'WarFX.ramSlam(target, {from, host, shake})', note:'A ram is drawn back and swung in: splinters, stone chips, a ground ring, a squash and a board shake.', near:'FX.A.siegeRam',
    v:[['From below, with a shake', c=> WF().ramSlam(c.castle, {from:90, host:c.arena})], ['From the side', c=> WF().ramSlam(c.foe[0], {from:0})]]},
  {id:'caltrops', group:'war', name:'Caltrops', sig:'WarFX.caltrops(from, lane, {n, hit})', note:'Little four-point jacks are thrown across a lane, bounce twice, settle and glint, then fade.', near:'none (traps use the 🪤 jaws)',
    v:[['Scatter on their lane', c=> WF().caltrops(c.mine[1], c.rowFoe)], ['A few, hitting a card', c=> WF().caltrops(c.mine[2], c.rowFoe, {n:8, hit:c.foe[1]})]]},
  {id:'signalFlare', group:'war', name:'Signal flare', sig:'WarFX.signalFlare(source, {color, height})', note:'A flare rocket climbs with a spark trail and bursts into a glowing star shell that drifts down.', near:'FX.A.rocketLaunch (a rocket, no burst)',
    v:[['Red alarm', c=> WF().signalFlare(c.mine[1], {color:'red', height:150})], ['Green go', c=> WF().signalFlare(c.mine[0], {color:'green', height:150})], ['Gold rally', c=> WF().signalFlare(c.mine[2], {color:'gold', height:150})]]},
];

// ---------------------------------------------------------------- the ones the game already has (reference; each is called by the game today)
// where = what the audit found in arena_app.js and the fx files; the same rows are in docs/effects-catalogue.md "Smoke and war (2026-10-21)".
const OLD = [
  {id:'o-smokebomb', group:'smoke', name:'Smoke Bomb', where:'the Smoke Bomb skill (arena_app.js smokeBomb event, SkillFX.smokeBomb)', v:[['Play', c=> SF().smokeBomb(c.mine[1], c.foe[0], {})]]},
  {id:'o-smokeswallow', group:'smoke', name:'Evade in smoke', where:'a swing that misses a Smoked unit (FX.A onEvent evaded {smoke})', v:[['Play', c=> FA().smokeSwallow(c.foe[0])]]},
  {id:'o-fogswallow', group:'smoke', name:'Evade in fog', where:'a swing that misses in Thick Fog (FX.A onEvent evaded {fog})', v:[['Play', c=> FA().fogSwallow(c.foe[0], c.mine[1])]]},
  {id:'o-gascloud', group:'smoke', name:'Poison gas cloud', where:'the poisonGas event (arena_app.js w2SkillVfx, SkillFX.gasCloud)', v:[['Play', c=> SF().gasCloud([c.foe[0], c.foe[1]])]]},
  {id:'o-stampede', group:'smoke', name:'Stampede dust roll', where:'Overwhelm hitting the Bramble (FX.A onEvent overwhelmHQ)', v:[['Play', c=> FA().stampede(c.mine[0], c.castle)]]},
  {id:'o-dynamite', group:'war', name:'Dynamite blast', where:'the Dynamite skill (FX.A onEvent dynamite, SkillFX.dynamite)', v:[['Play', c=> SF().dynamite(c.mine[1], c.foe[0], {flight:300, fuse:220})]]},
  {id:'o-fireball', group:'war', name:'Fireball', where:'the Fireball skill (arena_app.js, SkillFX.fireball)', v:[['Play', c=> SF().fireball(c.mine[1], c.foe[1], {})]]},
  {id:'o-firearrow', group:'war', name:'Fire arrow', where:'a ranged hit with a fire arrow (arena_app.js, SkillFX.bowShot {fire})', v:[['Play', c=> SF().bowShot(c.mine[1], c.foe[0], {fire:true})]]},
  {id:'o-arrowrain', group:'war', name:'Volley arrow rain', where:'the first Volley arrow of a round (FX.A onEvent, FX.A.arrowRain)', v:[['Play', c=> FA().arrowRain(c.mine[1], c.foe, {lead:true})]]},
  {id:'o-siegeram', group:'war', name:'Siege ram', where:'a hit on the Bramble with a Siege bonus (FX.A onEvent hitHQ)', v:[['Play', c=> FA().siegeRam(c.castle, {fromBelow:false})]]},
  {id:'o-ballista', group:'war', name:'Ballista bolt', where:'the castleBolt skill (FX.A onEvent)', v:[['Play', c=> FA().ballista(c.castle, c.mine[1], {flight:300})]]},
  {id:'o-rocket', group:'war', name:'Rocket launch', where:'the Rocket skill (FX.A onEvent)', v:[['Play', c=> FA().rocketLaunch(c.mine[1], c.castle)]]},
  {id:'o-rally', group:'war', name:'Rally', where:'the Rally skill (FX.A onEvent rally, SkillFX.rally)', v:[['Play', c=> SF().rally(c.mine)]]},
  {id:'o-shockwave', group:'war', name:'Shockwave ring', where:'hits of 8+ at Effects High and Charge firing (FX.A heavyShock, SkillFX.shockwave)', v:[['Play', c=> SF().shockwave(c.foe[0], {size:240, duration:560, cards:c.all})]]},
  {id:'o-scorch', group:'war', name:'Scorch (heat burn)', where:'Heat, Immolation and Lava Tide field ticks (arena_app.js, SkillFX.scorch)', v:[['Play', c=> SF().scorch(c.foe[1], {})]]},
  {id:'o-crater', group:'war', name:'Crater burn', where:'a Meteor crater, once a round (FX.A onEvent meteorBurn)', v:[['Play', c=> FA().craterBurn(c.foe[0])]]},
  {id:'o-burnground', group:'war', name:'Burning ground set and sprung', where:'the hazardSet and hazardSprung events (arena_app.js, SkillFX.trapSet / trapSnap {scorch})', v:[['Set', c=> SF().trapSet(c.foe[0], {kind:'scorch'})], ['Sprung', c=> SF().trapSnap(c.foe[0], {kind:'scorch'})]]},
  {id:'o-explode', group:'war', name:'Blown-up death', where:'a unit killed by Explode or Dynamite (FX.C deathExplode via deathLook)', v:[['Play', c=> FC().deathExplode(c.foe[0])]]},
  {id:'o-friction', group:'war', name:'Friction sparks', where:'the Friction skill (FX.A onEvent friction)', v:[['Play', c=> FA().frictionSparks(c.mine[0], c.mine[1])]]},
  {id:'o-crit', group:'war', name:'Crit sparks', where:'a critical hit (FX.A onEvent, by faction colours)', v:[['Play', c=> FA().critSparks(c.foe[0])]]},
  {id:'o-standard', group:'war', name:'Rally standard (banner)', inGame:false, where:'', v:[['Play', c=> FA().rallyStandard(c.mine)]]},
  {id:'o-wildfire', group:'war', name:'Wildfire front', inGame:true, where:'Scorched Ground: the line of fire each round (FX3, 2026-10-23)', v:[['Play', c=> FB().wildfire(c.arena)]]},
  {id:'o-fogbanks', group:'smoke', name:'Fog banks', inGame:false, where:'', v:[['Play', c=> FB().fogBanks(c.arena)]]},
];
window.FXLAB_WAR = {NEW, OLD};

// ---------------------------------------------------------------- render
const list = $('#warList'), now = $('#warNow'), dock = $('#warDock');
const card = (e, isNew)=>{
  const inGame = isNew ? false : e.inGame !== false;
  const near = isNew ? `<p class="war-near"><b>Nearest in the game:</b> ${esc(e.near)}</p>` : '';
  const sig = isNew ? `<code class="war-sig">${esc(e.sig)}</code>` : '';
  const note = isNew ? e.note : (inGame ? '' : 'Built in the Lab and in the game files, but no game code calls it.');
  return `<article class="fx war-fx" data-id="${esc(e.id)}" data-group="${e.group}" data-new="${isNew ? 1 : 0}" data-ig="${inGame ? 1 : 0}">
    <h3><span>${esc(e.name)}</span><span class="war-tag is-${e.group}">${e.group === 'smoke' ? 'Smoke and dust' : 'War'}</span></h3>
    <div class="ig-row">${badge(inGame, e.where)}</div>
    ${note ? `<p>${esc(note)}</p>` : ''}${near}${sig}
    <div class="btns war-btns">${e.v.map((v, i)=> `<button type="button" class="btn small${i ? '' : ' primary'}" data-play="${esc(e.id)}" data-v="${i}" aria-label="Play ${esc(e.name)}: ${esc(v[0])}">▶ ${esc(v[0])}</button>`).join('')}</div></article>`;
};
const byId = new Map([...NEW.map(e=> [e.id, e]), ...OLD.map(e=> [e.id, e])]);
list.innerHTML = `<h3 class="war-h" id="warNewH">New, ready to pick <span class="war-n">${NEW.length}</span><span class="war-hsub">None of these is called by the game yet.</span></h3><div class="war-grid" id="warNewGrid">${NEW.map(e=> card(e, true)).join('')}</div>
  <h3 class="war-h" id="warOldH">Already in the game <span class="war-n">${OLD.length}</span><span class="war-hsub">For comparison. The two at the end are in the Lab and the files but not called.</span></h3><div class="war-grid" id="warOldGrid">${OLD.map(e=> card(e, false)).join('')}</div>`;

// ---------------------------------------------------------------- playing
let token = 0, last = null, speed = 1;
const reduce = ()=> window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function clearAll(){ try{ WF().clear(); }catch(e){} try{ const g = window.gsap; if(g) g.killTweensOf($$('.card-tile', arena)); }catch(e){} arena.style.transform = ''; arena.innerHTML = PRISTINE; }
async function play(id, vi){
  const e = byId.get(id); if(!e) return; const v = e.v[vi || 0]; if(!v) return;
  const my = ++token; clearAll(); last = [id, vi || 0];
  now.innerHTML = `<b>${esc(e.name)}</b> · ${esc(v[0])}<span>${e.sig ? esc(e.sig) : esc(e.where || 'Lab only')}</span>`;
  $$('[data-play].is-playing').forEach(b=> b.classList.remove('is-playing'));
  $$(`[data-play="${CSS.escape(id)}"][data-v="${vi || 0}"]`).forEach(b=> b.classList.add('is-playing'));
  let r; try{ r = v[1](ctx()); }catch(err){ console.error('[war lab]', id, err); now.innerHTML += '<span style="color:#e57">That call threw: ' + esc(err.message) + '</span>'; }
  if(r && typeof r.then === 'function'){ try{ await Promise.race([r, new Promise(res=> setTimeout(res, 8000))]); }catch(err){ console.error('[war lab]', id, err); } }
  else await new Promise(res=> setTimeout(res, 1600));
  if(my === token) $$('[data-play].is-playing').forEach(b=> b.classList.remove('is-playing'));
}
window.FXLAB_WAR.play = play;
list.addEventListener('click', ev=>{ const b = ev.target.closest('[data-play]'); if(b) play(b.dataset.play, +b.dataset.v); });
$('#warReplay').addEventListener('click', ()=>{ if(last) play(last[0], last[1]); });
$$('[data-wspeed]').forEach(b=> b.addEventListener('click', ()=>{ speed = +b.dataset.wspeed; if(window.gsap) gsap.globalTimeline.timeScale(speed); $$('[data-wspeed]').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); }));
// leaving the tab stops the effects (and puts the global speed back for the other tabs)
document.addEventListener('click', ev=>{ const t = ev.target.closest('nav.toc [data-tab]'); if(t && t.dataset.tab !== 'war'){ token++; clearAll(); } });

// ---------------------------------------------------------------- filters
const chips = $$('[data-wf]');
function applyFilter(){
  const f = (chips.find(c=> c.getAttribute('aria-pressed') === 'true') || {dataset:{wf:'all'}}).dataset.wf;
  $$('.war-fx', list).forEach(a=>{
    const ok = f === 'all' || (f === 'smoke' && a.dataset.group === 'smoke') || (f === 'war' && a.dataset.group === 'war') || (f === 'lab' && a.dataset.ig === '0') || (f === 'game' && a.dataset.ig === '1');
    a.hidden = !ok;
  });
  $$('.war-grid', list).forEach(g=>{ const n = $$('.war-fx:not([hidden])', g).length; g.previousElementSibling.hidden = !n; });
  $('#warShown').textContent = $$('.war-fx:not([hidden])', list).length + ' shown';
}
chips.forEach(c=> c.addEventListener('click', ()=>{ chips.forEach(x=> x.setAttribute('aria-pressed', String(x === c))); applyFilter(); }));
applyFilter();
const navTop = ()=>{ const n = $('nav.toc'); if(n) document.documentElement.style.setProperty('--war-top', (n.offsetHeight + 8) + 'px'); };
navTop(); addEventListener('resize', navTop);

oldTabBadges(); foilBadges();
})();
