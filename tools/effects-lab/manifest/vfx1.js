// Package VFX1 (2026-11-27, owner 09:55: skill, field and boss looks; 10:18: the Ritual's candles). Batch V lab registrations
// (bramblewood-fx-v.js, window.FX.V), key V1 (labels start "VFX1 ·"); RITUAL1 plays the game's own rt1RiteMarkup / rt1Lift (arena_app.js,
// copied by fx-src-extra.txt). Each play uses the fight's own calls; "Low" variants pass {level:'low'} (the Effects Low version).
(function(){
const R = FXLAB.register, V = ()=> window.FX.V, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const LOW = {level:'low'}, after = (ctx, p, ms)=> Promise.resolve(p).then(()=> ctx.wait(ms || 250));
const snd = n=> V().sound(n);
// skills
R({id:'atk-swift', stage:'board', note:'VFX1: replaces FX.A.swiftBlur in fights (three card clones with filter + blend mode); own cue swiftZip.', inGameHook:'onEvent (bramblewood-fx-v.js): hit / evaded by a Swift unit, melee, once a round', variants:[
  {key:'V1', label:'VFX1 · Pixel speed streaks trail behind the attacker as it dashes in, a kick of dust (320 ms)', play:ctx=>{ snd('swiftZip'); return after(ctx, V().swiftDash(mine(ctx), {up:true})); }},
  {key:'V1L', label:'VFX1 · Effects Low: the streaks only', play:ctx=> after(ctx, V().swiftDash(mine(ctx), Object.assign({up:true}, LOW)))}]});
R({id:'sk-tide-crest', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): tide (not Moonpull): each Tide unit on the board, up to 6, 70 ms apart', variants:[
  {key:'V1', label:'VFX1 · Flood: a pixel crest washes up the card, ⚔ pops (360 ms; tideLap once)', play:ctx=>{ snd('tideLap'); return after(ctx, Promise.all([0, 1, 2].map(i=> ctx.wait(i*70).then(()=> V().tideCrest(mine(ctx, i), {kind:'flow'}))))); }},
  {key:'V1B', label:'VFX1 · Ebb: the crest and 🛡', play:ctx=>{ snd('tideLap'); return after(ctx, V().tideCrest(mine(ctx), {kind:'ebb'})); }},
  {key:'V1L', label:'VFX1 · Effects Low: the bonus icon only', play:ctx=> after(ctx, V().tideCrest(mine(ctx), Object.assign({kind:'flow'}, LOW)))}]});
R({id:'sk-hatchling-pop', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): evolve with a stem bonus (Hatchling +1/+2), 120 ms after the evolve pop', variants:[
  {key:'V1', label:'VFX1 · The shell halves pop off, sparks, a green plus (380 ms; shellCrack)', play:ctx=>{ snd('shellCrack'); return after(ctx, V().hatchPop(mine(ctx))); }},
  {key:'V1L', label:'VFX1 · Effects Low: shells and the plus, no sparks', play:ctx=> after(ctx, V().hatchPop(mine(ctx), LOW))}]});
R({id:'atk-reach-aim', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): statusFx reachAim (Reach strikes the unit beside its lane)', variants:[
  {key:'V1', label:'VFX1 · A dotted aim arc bends into the next lane, a crosshair snaps on (380 ms; reachCreak)', play:ctx=>{ snd('reachCreak'); return after(ctx, V().reachArc(mine(ctx, 0), foe(ctx, 1))); }},
  {key:'V1L', label:'VFX1 · Effects Low: the crosshair only', play:ctx=> after(ctx, V().reachArc(mine(ctx, 0), foe(ctx, 1), LOW))}]});
R({id:'atk-mighty-slam', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): hit by a Mighty unit, at the impact, once a round', variants:[
  {key:'V1', label:'VFX1 · A square shockwave and a x2 stamp on the blow, rock chips (380 ms; mightyThud)', play:ctx=>{ snd('mightyThud'); ctx.float(foe(ctx), '-6'); return after(ctx, V().mightySlam(foe(ctx))); }},
  {key:'V1L', label:'VFX1 · Effects Low: ring and stamp', play:ctx=> after(ctx, V().mightySlam(foe(ctx), LOW))}]});
R({id:'sk-forage-berry', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): statusFx sk2Berry (a berry) / sk2BerryEat (three berries feed an ally)', variants:[
  {key:'V1', label:'VFX1 · A berry pops off the card, its pips show 2 of 3 (360 ms; berryPlip)', play:ctx=>{ snd('berryPlip'); return after(ctx, V().berryPop(mine(ctx), {total:2})); }},
  {key:'V1B', label:'VFX1 · Three berries hop to the hurt ally, a heart (berryMunch)', play:ctx=>{ snd('berryMunch'); return after(ctx, V().berryEat(mine(ctx, 0), mine(ctx, 2))); }},
  {key:'V1L', label:'VFX1 · Effects Low: the berry only; one berry hops', play:ctx=> after(ctx, V().berryPop(mine(ctx), Object.assign({total:3}, LOW)).then(()=> V().berryEat(mine(ctx, 0), mine(ctx, 2), LOW)))}]});
R({id:'st-sturdy-brace', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): a hit whose number carries the sturdy mark, at the impact, once a round', variants:[
  {key:'V1', label:'VFX1 · Stone brackets clamp the corners, a ½ mark (380 ms; sturdyThunk)', play:ctx=>{ snd('sturdyThunk'); ctx.float(foe(ctx), '-2'); return after(ctx, V().sturdyBrace(foe(ctx))); }},
  {key:'V1L', label:'VFX1 · Effects Low: the brackets only', play:ctx=> after(ctx, V().sturdyBrace(foe(ctx), LOW))}]});
R({id:'atk-frenzy', stage:'board', inGameHook:'onEvent (bramblewood-fx-v.js): frenzy {twin}; twinShing replaces frenzyTone for Twin Strike', variants:[
  {key:'V1', label:'VFX1 · Twin Strike: two blades cross over the card before its second swing (360 ms; twinShing)', play:ctx=>{ snd('twinShing'); return after(ctx, V().twinSlash(mine(ctx))); }},
  {key:'V1L', label:'VFX1 · Effects Low: one blade', play:ctx=> after(ctx, V().twinSlash(mine(ctx), LOW))}]});
// field
const bf = ctx=> ctx.board.el;
R({id:'wt-weather-layer', stage:'board', duration:3200, note:'VFX1: tiled pixel layers under the cards, one transform loop each; off at Effects Low / None and with reduced motion (CSS).',
  inGameHook:'fxHook matchUI / boardRendered (FX.V.fieldKind: the field card in play, then the fight\'s rules); cleared on the results', variants:
  [['rain', 'Spring Rain / a rainy fight (when the WebGL weather is not already raining)'], ['storm', 'Thunderstorm: dark cloud band, slanted heavy rain, a faint flash every 11 s'],
   ['heat', 'Scorching / heat levels / Wildfire: rising embers, a warm floor, a shimmer band'], ['frost', 'Frigid / Freezing / Frostbite / Hail: snow flecks, a cold rim'],
   ['sand', 'Sandstorm: sand streaks blowing across, a dusty tint'], ['ash', 'Ash rain / volcano: grey ash and a few embers falling, a warm floor']].map(([k, label], i)=> ({key:'V' + (i + 1), label:'VFX1 · ' + label,
    play:ctx=>{ V().fieldAmbient(bf(ctx), k); return ctx.wait(3000).then(()=> V().fieldAmbient(bf(ctx), null)); }}))});
// bosses
R({id:'st-caged-leader', stage:'board', note:'VFX1: replaces FX.D.cageDrop in fights; plays after the versus opener.', inGameHook:'fxHook boardRendered (bramblewood-fx-v.js): the first render of a Caged Fight\'s cage, the versus opener gone', variants:[
  {key:'V1', label:'VFX1 · The cage slams down, bramble vines coil up the sides, a padlock pops, dust (720 ms; cageSlam)', play:ctx=> after(ctx, V().cageClose(foe(ctx)), 300)},
  {key:'V1L', label:'VFX1 · Effects Low: bars and padlock', play:ctx=> after(ctx, V().cageClose(foe(ctx), LOW), 300)}]});
R({id:'sum-boss-entrance', stage:'board', inGameHook:'bossEntrance → fxHook bossEntrance (FX.V.bossKind from the boss\'s name): The Kelp Witch (9-7) mage, The Drowned Colossus (4-5) sea; no skeleton boss yet (Lab only)', variants:[
  {key:'V1S', label:'VFX1 · Skeleton boss: bones fly in and lock under a skull, dust, the eyes light (1.6 s; boneClatter) — Lab only, no skeleton boss yet', play:ctx=> after(ctx, V().skeletonRise(ctx.board.castleFoe), 300)},
  {key:'V1M', label:'VFX1 · Mage boss: a ring of runes turns, tightens as it charges, bursts (1.4 s; runeHum) — The Kelp Witch', play:ctx=> after(ctx, V().mageCast(ctx.board.castleFoe), 300)},
  {key:'V1W', label:'VFX1 · Sea boss: the water line rises over the board, waves roll down the lanes (1.8 s; seaSurge) — The Drowned Colossus', play:ctx=> after(ctx, V().seaRise(bf(ctx)), 300)},
  {key:'V1L', label:'VFX1 · Effects Low: the skull, the rune ring, the water line only', play:ctx=> V().skeletonRise(ctx.board.castleFoe, LOW).then(()=> V().mageCast(ctx.board.castleFoe, LOW)).then(()=> V().seaRise(bf(ctx), LOW)).then(()=> ctx.wait(300))}]});
R({id:'raid-boss-roar', stage:'board', inGameHook:'the raid opener (startRaidFullBattle) → fxHook raidEntrance: a boss with a sea name or a raid in the Abyss (the Goliath)', variants:[
  {key:'V1', label:'VFX1 · The Goliath: the sea rises over the board, waves down the lanes', play:ctx=> after(ctx, V().seaRise(bf(ctx)), 300)}]});
// RITUAL1: the rite (arena_app.js rt1RiteMarkup, the board card's markup in the game) on a stage card, then its candles light, then it lifts
const COND = [{k:'perished', ico:'☠', need:6}, {k:'drawn', ico:'🂠', need:6}, {k:'castleDamage', ico:'🏰', need:6}];
const rite = (card, met, o)=>{ const tile = card.querySelector('.card-tile') || card, old = tile.querySelector(':scope > .rt1-rite'); card.classList.add('is-ritual');
  const t = document.createElement('div'); t.innerHTML = rt1RiteMarkup(COND.map((q, i)=> ({k:q.k, ico:q.ico, have: met[i] ? q.need : 2, need:q.need, met: !!met[i]})), o || {});
  if(old) old.replaceWith(t.firstChild); else tile.appendChild(t.firstChild); };
const unrite = card=>{ const r = card.querySelector('.rt1-rite'); if(r) r.remove(); card.classList.remove('is-ritual'); };
R({id:'st-ritual-rite', stage:'board', duration:6000, note:'RITUAL1 (owner 11-27 10:18): one candle per condition at its corner of the ritual shape; CSS animations with a negative delay from the first draw, so a redraw carries on.',
  inGameHook:'boardCardHTML → rt1RiteHTML (a unit in its Ritual, rc1InRitual); updateCardStatusDisplay → rt1Sync; rt1Lift when it leaves its Ritual; fullCardHTML: the hover shape with have / need', variants:[
  {key:'V1', label:'RITUAL1 · Placed: the card darkens, three candles fade in one by one (1.5 s); one lights, then another; all lit: the darkness lifts', play:ctx=>{ const c = mine(ctx, 2);
    rite(c, [0, 0, 0], {enterEl:0}); return ctx.wait(2000).then(()=>{ snd('candleCatch'); rite(c, [0, 1, 0], {litEl:[null, 0, null]}); return ctx.wait(1000); })
      .then(()=>{ snd('candleCatch'); rite(c, [1, 1, 0], {litEl:[0, null, null]}); return ctx.wait(1000); })
      .then(()=>{ snd('candleCatch'); rite(c, [1, 1, 1], {litEl:[null, null, 0]}); return ctx.wait(700); }).then(()=>{ unrite(c); rt1Lift(c, 3); return ctx.wait(900); }); }},
  {key:'V1B', label:'RITUAL1 · One condition (a dot at the top, 1.0 s) and two (a line, 1.25 s)', play:ctx=>{ const a = mine(ctx, 0), b = mine(ctx, 2), put = (card, n)=>{ const tile = card.querySelector('.card-tile') || card, t = document.createElement('div');
      t.innerHTML = rt1RiteMarkup(COND.slice(0, n).map(q=> ({k:q.k, ico:q.ico, have:1, need:q.need, met:false})), {enterEl:0}); card.classList.add('is-ritual'); tile.appendChild(t.firstChild); };
    put(a, 1); put(b, 2); return ctx.wait(2200).then(()=>{ unrite(a); unrite(b); }); }},
  {key:'V1L', label:'RITUAL1 · Effects Low / reduced motion: the dark card and its candles at once, the met one lit, no fades', play:ctx=>{ const c = mine(ctx, 2); rite(c, [0, 1, 0], {}); return ctx.wait(1800).then(()=> unrite(c)); }}]});
})();
