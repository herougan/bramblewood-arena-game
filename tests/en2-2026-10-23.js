#!/usr/bin/env node
// 2026-10-23 (package EN2): the owner's 13:16 #9 / #2 / #11 / #22 / #17 and 17:01 #15, and 17:34 #2 / #15 / #18 / #22.
//   Boomerang: the throw at Speed 0 (no base), its price 1.9 and the four re-fits; a bramble throw comes back through the bramble and then the
//   unit in its lane; with the thrower dead it still comes home and hits the unit in the thrower's slot (the event names it).
//   The CPU's lanes: the middle / contested weights and the smartest CPU's tie (no left lean).
//   Guardian: its hit names the ally it stepped in for (guardedUid); the board's step-in and the reach text.
//   Wind: Headwind doubles active skills only (Arrow, Snipe, Archer's On Action), not other triggers; Tailwind is Quick, no extra turn.
//   Swarm by Type only (not species); the replay's live Swarm (swarmBonusFromAllies) and liveAtk on a swing.
//   The Ironclaw Fiddler: in cards.json, inside the budget, its looks wired; texts in 12 packs; the docs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-boom':  {id:'x-boom', name:'Boom', attack:3, health:3, wait:0, cost:0, effects:{boomerang:true}},
  'x-boomt': {id:'x-boomt', name:'BoomT', attack:3, health:30, wait:0, cost:0, effects:{boomerang:true}},
  'x-p3':    {id:'x-p3', name:'P3', attack:3, health:3, wait:0, cost:0, effects:{}},
  'x-wallr': {id:'x-wallr', name:'WallR', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'x-hit':   {id:'x-hit', name:'Hitter', attack:2, health:100, wait:0, cost:0, effects:{}},
  'x-guard': {id:'x-guard', name:'Guard', attack:0, health:100, wait:9, cost:0, effects:{guardian:true}},
  'x-hwfly': {id:'x-hwfly', name:'HwFly', attack:0, health:200, wait:0, cost:0, effects:{flying:true, arrow:1, triggers:[{on:'onRoundStart', do:'gain', amount:1, resource:'lumber'}]}},
  'x-twfly': {id:'x-twfly', name:'TwFly', attack:2, health:200, wait:0, cost:0, effects:{flying:true}},
  'x-twwait':{id:'x-twwait', name:'TwWait', attack:2, health:200, wait:2, cost:0, effects:{flying:true}},
  'x-sw':    {id:'x-sw', name:'Swarmer', attack:1, health:50, wait:0, cost:0, archetypes:['Insect'], effects:{swarm:true}},
  'x-ins':   {id:'x-ins', name:'InsectTyped', attack:0, health:50, wait:9, cost:0, archetypes:['Insect'], effects:{}},
  'x-sp':    {id:'x-sp', name:'InsectSpecies', attack:0, health:50, wait:9, cost:0, archetypes:['Forest'], species:['Insect'], animal:'beetle', effects:{}},
  'x-reef':  {id:'x-reef', name:'Reef', attack:0, health:50, wait:9, cost:0, archetypes:['Coral Reef'], effects:{}},
  'x-ocean': {id:'x-ocean', name:'OceanSwarm', attack:1, health:50, wait:0, cost:0, archetypes:['Ocean'], effects:{swarm:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };

// ---- Boomerang ------------------------------------------------------------------------------------------------------------
// The throw is Speed 0: facing a 3/3 with the initiative, the Boomerang 3/3 no longer throws first (it was Speed 1 and won)
{ const {e, P} = mk(); const B = spawn(e, P, 1, 'x-boom'), Q = spawn(e, P, 2, 'x-p3'); e.resolveCombat(P, so, {}, [], 2);
  ok(!(B.hp > 0) && Q.hp > 0, `the throw is Speed 0: the 3/3 with the initiative strikes first (boomerang hp ${B.hp}, foe hp ${Q.hp})`); }
{ const {e, P} = mk(); const B = spawn(e, P, 1, 'x-boom'), Q = spawn(e, P, 2, 'x-p3'); e.resolveCombat(P, so, {}, [], 1);
  ok(B.hp > 0 && !(Q.hp > 0), 'with the initiative the Boomerang strikes first (same Speed, initiative decides)'); }
// A bramble throw: out past the bramble; back through the bramble, then the unit now in its lane, then home
{ const {e, P} = mk(); const B = spawn(e, P, 1, 'x-boomt'); const hq0 = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(hq0 - P[2].hq.hp === 3 && P[1].boomerangs.length === 1 && P[1].boomerangs[0].hitCastle, 'the throw hits the bramble and is out');
  const W = spawn(e, P, 2, 'x-wallr'), w0 = W.hp, hq1 = P[2].hq.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(hq1 - P[2].hq.hp === 3, `on the way back it hits the bramble again (${hq1 - P[2].hq.hp})`);
  ok(w0 - W.hp === 3, `…and then the unit now in its lane (${w0 - W.hp})`);
  const hq = ev.find(x=> x.type === 'hitHQ' && x.boomerang), hit = ev.find(x=> x.type === 'hit' && x.viaCastle);
  ok(hq && hq.thenUid === W.uid && hit && hit.targetUid === W.uid, 'the bramble hit names the unit next (thenUid), its hit is viaCastle');
  ok(ev.some(x=> x.type === 'boomerangCaught' && x.uid === B.uid), 'then the thrower catches it'); }
// The thrower dies: it still comes home and hits a fresh unit in the thrower's slot; the event names that unit (17:34 #2)
{ const {e, P} = mk(); const B = spawn(e, P, 1, 'x-boomt'), W = spawn(e, P, 2, 'x-wallr'); e.resolveCombat(P, so, {}, [], 1);
  B.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const N = spawn(e, P, 1, 'x-wall'), n0 = N.hp, w0 = W.hp, ev = [];
  e.resolveCombat(P, so, {}, ev, 1);
  const r = ev.find(x=> x.type === 'boomerangReturn');
  ok(r && r.thrownBy == null && r.homeUid === N.uid && r.farUid === W.uid, `the orphan return names home (${r && r.homeUid}) and the far target (${r && r.farUid})`);
  ok(w0 - W.hp === 3 && n0 - N.hp === 3, `it hits the far target (${w0 - W.hp}) and the fresh card in the thrower's slot (${n0 - N.hp})`); }
{ const {e, P} = mk(); const B = spawn(e, P, 1, 'x-boomt'); e.resolveCombat(P, so, {}, [], 1); B.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const r = ev.find(x=> x.type === 'boomerangReturn');
  ok(r && r.homeCastle === true && r.hitCastle === true, 'an empty slot: home is the own bramble (homeCastle)'); }
// Price and re-fit
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')), row = id=> (sc.skills || sc.keywords || Object.values(sc).find(Array.isArray) || []).find(r=> r.id === id);
  const txt = fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8');
  ok(/"id":"boomerang","scale":"half","value":1\.9/.test(txt) && /"id":"bananarang","scale":"half","value":1\.9/.test(txt), 'Boomerang and Bananarang cost 1.9 (were 3)');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  ok(c('otter-centurion').health === 7 && c('howler-monkey').health === 5 && c('net-thrower').health === 10 && c('otter-royal-guard').health === 10, 'the four Boomerang cards re-fit up a point of Health'); }

// ---- The CPU's lanes ------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 2, 'x-wallr'); spawn(e, P, 2, 'x-wallr', 'right'); spawn(e, P, 2, 'x-wallr', 'right'); // foe at 0, 1, 2
  const w = sl=> e.aiLaneWeight(P[2], sl);
  ok(w(0) === 3 && w(1) === 3 && w(2) === 2.5, `contested middle slots weigh most (0: ${w(0)}, 1: ${w(1)}, 2: ${w(2)})`);
  ok(w(3) === 2 && w(-1) === 3 && w(-3) === 1 && w(5) === 1, `beside a unit +1 (3: ${w(3)}, -1: ${w(-1)}); far and empty 1 (-3: ${w(-3)}, 5: ${w(5)})`);
  ok(e.aiLaneTie(P[2], -3, 3) === 3 && e.aiLaneTie(P[2], 3, -3) === 3, 'a tie goes to the side where the foe stands (right here), not always left'); }
{ const {e, P} = mk(); spawn(e, P, 2, 'x-wallr', 'left'); spawn(e, P, 2, 'x-wallr', 'left'); // foe at 0, -1
  ok(e.aiLaneTie(P[2], -2, 2) === -2, 'foe on the left: the tie goes left'); }
{ let L = 0, R = 0; for(let s = 1; s <= 60; s++){ const {e, P} = mk(s); const v = e.aiLaneTie({row:{left:[], center:[], right:[]}}, -1, 1); if(v < 0) L++; else R++; }
  ok(L > 15 && R > 15, `an empty foe board: a coin, both ways (${L} left, ${R} right)`); }
{ const meas = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en2-cpu-side-before-2026-10-23.json'), 'utf8')), after = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en2-cpu-side-after-2026-10-23.json'), 'utf8'));
  ok(meas.levels.smartest.cpu.left > meas.levels.smartest.cpu.right && Math.abs(after.levels.smartest.cpu.meanSlot) < Math.abs(meas.levels.smartest.cpu.meanSlot), 'the saved measurement: the smartest CPU leaned left before, less after'); }

// ---- Guardian ---------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit'); const T = spawn(e, P, 2, 'x-wallr'), G = spawn(e, P, 2, 'x-guard', 'left'); const ev = [];
  e.resolveCombat(P, so, {}, ev, 1); const h = ev.find(x=> x.type === 'hit' && x.guardianRedirect);
  ok(h && h.targetUid === G.uid && h.guardedUid === T.uid, `the Guardian's hit names the ally it stepped in for (guardedUid ${h && h.guardedUid})`); }

// ---- Wind: Headwind = active skills twice; Tailwind = Quick -------------------------------------------------------------------
function windRound(id, want, wallId){ for(let s = 1; s <= 80; s++){ const {e, P} = mk(s, {wind:'gale'}); const F = spawn(e, P, 1, id); spawn(e, P, 2, wallId || 'x-wall');
    e.roundStart(P, 1, so, {}, []); if(e.windSideOf(1) !== want) continue; const lum0 = P[1].lumber || 0, ev = []; e.resolveCombat(P, so, {}, ev, 2); return {e, P, F, ev, lum: (P[1].lumber || 0) - lum0}; } return null; }
{ const r = windRound('x-hwfly', 'head');
  ok(r && r.ev.filter(x=> x.type === 'arrow' && x.uid === r.F.uid).length === 2, `Headwind: Arrow twice (${r && r.ev.filter(x=> x.type === 'arrow' && x.uid === r.F.uid).length})`);
  ok(r && r.lum === 1, `Headwind: its On Round Start trigger (a passive) once (+${r && r.lum} Lumber)`); }
{ const r = windRound('x-hwfly', 'tail'); ok(r && r.ev.filter(x=> x.type === 'arrow' && x.uid === r.F.uid).length === 1, 'no Headwind: Arrow once'); }
{ const r = windRound('x-twfly', 'tail'); const hits = r ? r.ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === r.F.uid).length : -1;
  ok(r && hits === 1, `Tailwind: one swing, no Fast Forward extra turn (${hits})`);
  ok(r && r.ev.some(x=> x.type === 'statusFx' && x.kind === 'tailwind' && x.quick) && !(r.F.ffCounters > 0), 'Tailwind is Quick for the round (statusFx quick), no ffCounters'); }
{ const r = windRound('x-twwait', 'tail'); const hits = r ? r.ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === r.F.uid).length : -1;
  ok(r && hits === 0, `a Waiting Flyer under a Tailwind still waits (${hits} swings)`); }
// Tailwind's Quick beats an equal unit with the initiative
{ let won = null; for(let s = 1; s <= 80 && won == null; s++){ const {e, P} = mk(s, {wind:'gale'}); const F = spawn(e, P, 1, 'x-twfly'); F.hp = F.maxHp = 2; const Q = spawn(e, P, 2, 'x-p3'); Q.hp = Q.maxHp = 2; Q.atk = 2;
    e.roundStart(P, 1, so, {}, []); if(e.windSideOf(1) !== 'tail') continue; e.resolveCombat(P, so, {}, [], 2); won = F.hp > 0 && !(Q.hp > 0); }
  ok(won === true, 'a Tailwind Flyer swings at Speed 2, before an equal unit with the initiative'); }

// ---- Swarm by Type only -------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const S = spawn(e, P, 1, 'x-sw'); spawn(e, P, 1, 'x-ins', 'right'); spawn(e, P, 1, 'x-sp', 'right');
  ok(e.swarmBonusOf(P, S) === 1, `an Insect-typed ally counts, an Insect-species one doesn't (+${e.swarmBonusOf(P, S)})`);
  ok(e.swarmBonusFromAllies({uid: S.uid, defId:'x-sw', hp:1}, [{uid: 900, defId:'x-ins'}, {uid: 901, defId:'x-sp'}, {uid: 902, defId:'x-ins'}]) === 2, 'the replay count (swarmBonusFromAllies) follows the same rule');
  ok(e.swarmBonusFromAllies({uid: S.uid, defId:'x-sw', hp:1}, [{uid: 900, defId:'x-ins'}]) === 1 && e.swarmBonusFromAllies({uid: S.uid, defId:'x-sw', hp:1}, []) === 0, '…and drops as allies fall'); }
{ const {e, P} = mk(); const O = spawn(e, P, 1, 'x-ocean'); spawn(e, P, 1, 'x-reef', 'right');
  ok(e.swarmBonusOf(P, O) === 1, 'the Type tree still counts (a Coral Reef unit is Ocean)'); }
{ const {e, P} = mk(); const S = spawn(e, P, 1, 'x-sw'); spawn(e, P, 1, 'x-ins', 'right'); spawn(e, P, 2, 'x-wall'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const h = ev.find(x=> x.type === 'hit' && x.attUid === S.uid); ok(h && h.liveAtk === 2 && h.dmg === 2, `the swing carries the Attack it used (liveAtk ${h && h.liveAtk}, dmg ${h && h.dmg})`); }
// the hand preview reads the same Swarm (17:34 #18)
{ const {e, P} = mk(); spawn(e, P, 1, 'x-ins'); spawn(e, P, 1, 'x-sp', 'right'); P[1].hand.push({uid: 777, defId:'x-sw'});
  const pv = e.previewPlayStats(P, 1, 777); ok(pv && (pv.atk === 2 || pv.attack === 2), `the hand preview counts the Insect type only (${pv && JSON.stringify(pv).slice(0, 80)})`); }

// ---- The Ironclaw Fiddler -----------------------------------------------------------------------------------------------------
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = cards.find(x=> x.id === 'ironclaw-fiddler');
  ok(c && c.rarity === 'rare' && c.effects.bludgeon && c.effects.tide && c.effects.armor === 1 && c.awaitingSource, 'the Ironclaw Fiddler: Rare, Tide, Bludgeon, Armor 1, awaiting its source');
  ok(c && c.fx && c.fx.play === 'crabClack' && c.fx.attack === 'crabClaw', 'its looks: crabClack on play, crabClaw on attack');
  ok(c && new Set(cards.map(x=> x.numericId)).size === cards.length, 'numericIds stay unique');
  if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools/card_retune_2026_10_19.js')).SC, T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
  const b = T.budget(c, {level: 1}); ok(b.ok && b.x1 <= b.N, `inside the budget at Level 1 (2A+H+S ${b.x1} <= N ${b.N})`); }

// ---- The app, texts and docs --------------------------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ['function en2GuardStepIn', 'function en2BoomCastleThrow', 'function en2BoomCastleReturn', 'function en2BoomOrphanFlight', 'function en2CrabClack', 'function en2CrabClawHit', "try{ en2Vfx(ev); }catch(e){}",
   'm.engine.swarmBonusFromAllies', 'en2BoomCastleReturn(a, c, ev.thenUid'].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  const TX = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
  ok(/Tailwind Flyers are Quick/.test(TX) && !/Tailwind Flyers act first/.test(TX), 'the wind texts: Tailwind is Quick');
  const keys = ["Clack!", "Tailwind: Quick!", "caught the Tailwind: Quick this round 🪁", "Tailwind: Quick this round (swings at Speed 2)",
    "Steps in front of an adjacent ally (beside it; in a raid, in front or behind) and takes the plain attacks aimed at it. Skills and area hits don't, and it never guards the bramble. A Guardian next to it steps in for it in turn. Taunt is different: it makes the enemies facing it aim at it."]; // the Guardian text as EN3 (2026-10-23) has it
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), cp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', code + '.json'), 'utf8'));
    ok(keys.every(k=> p[k]) && cp['Ironclaw Fiddler'], `lang ${code}: EN2 texts and the card name`); });
  const cat = fs.readFileSync(path.join(ROOT, 'docs/effects-catalogue.md'), 'utf8');
  ok(/Guardian and Taunt reach different units/.test(cat) && /HEADWIND_HOOKS/.test(cat), 'docs/effects-catalogue.md: Guardian vs Taunt, the wind'); }

console.log(`en2-2026-10-23: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
