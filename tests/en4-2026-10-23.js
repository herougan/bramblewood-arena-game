#!/usr/bin/env node
// 2026-10-23 (package EN4): the owner's 22:23 #7 and #9, and 19:27 #4 (option B).
//   #9 "Guardian shouldn't intercept an intercepting guardian.": EN3's one hop reverted (one Guardian steps in; no guardChain).
//   #7 Bleed / Poison payoffs: Hemorrhage (doubles the Bleed a target has), Greater Poison (turns Poison into Greater Poison; owner 23:45: 1 a
//      stack, never wears down), with Hunter / Pulse / Cure reading it. Owner 23:45: Venom Pulse is Pulse N (Poison AND Bleed tick N more
//      times), the Poison Tick action is retired (reads as Pulse; a card on it migrates).
//   #4 Shore Up: when it is hit and lives, the allies beside it get Shield 1.
//   Prices, the six new cards (budget, placements), texts in 12 packs, the board's looks, docs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-hit':   {id:'x-hit', name:'Hitter', attack:1, health:100, wait:0, cost:0, effects:{}},
  'x-hit2':  {id:'x-hit2', name:'Hitter2', attack:2, health:100, wait:0, cost:0, effects:{}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-guard': {id:'x-guard', name:'Guard', attack:0, health:100, wait:9, cost:0, effects:{guardian:true}},
  'x-hem':   {id:'x-hem', name:'Hem', attack:1, health:100, wait:0, cost:0, effects:{hemorrhage:true}},
  'x-hemb':  {id:'x-hemb', name:'HemB', attack:1, health:100, wait:0, cost:0, effects:{hemorrhage:true, bleed:2}},
  'x-bleed2':{id:'x-bleed2', name:'Bleed2', attack:1, health:100, wait:0, cost:0, effects:{bleed:2}},
  'x-ghost': {id:'x-ghost', name:'Ghost', attack:0, health:500, wait:9, cost:0, effects:{ghost:true}},
  'x-gp':    {id:'x-gp', name:'GP', attack:1, health:100, wait:0, cost:0, effects:{greaterPoison:1, poison:2}},
  'x-gponly':{id:'x-gponly', name:'GPonly', attack:1, health:100, wait:0, cost:0, effects:{greaterPoison:2}},
  'x-gp0':   {id:'x-gp0', name:'GP0', attack:0, health:100, wait:0, cost:0, effects:{greaterPoison:1}},
  'x-pulse': {id:'x-pulse', name:'Pulse', attack:1, health:100, wait:0, cost:0, effects:{venomPulse:1}},
  'x-pulse2':{id:'x-pulse2', name:'Pulse2', attack:1, health:100, wait:0, cost:0, effects:{venomPulse:2}},
  'x-oldtick':{id:'x-oldtick', name:'OldTick', attack:1, health:100, wait:0, cost:0, effects:{triggers:[{on:'onHit', do:'poisonTick', who:'enemy', sub:'subject', amount:1}]}},
  'x-hunt':  {id:'x-hunt', name:'Hunt', attack:1, health:100, wait:0, cost:0, effects:{hunter:3, hunterVs:'poison'}},
  'x-cure':  {id:'x-cure', name:'Curer', attack:0, health:100, wait:9, cost:0, effects:{cure:3}},
  'x-shore': {id:'x-shore', name:'Shore', attack:0, health:500, wait:9, cost:0, effects:{shoreUp:true}},
  'x-arrow': {id:'x-arrow', name:'Archer', attack:0, health:100, wait:0, cost:0, effects:{archer:2}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };

// ---- #9 Guardian: one steps in, no chain --------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit2'); const T = spawn(e, P, 2, 'x-wall'), G1 = spawn(e, P, 2, 'x-guard'), G2 = spawn(e, P, 2, 'x-guard');
  const h = round(e, P).find(x=> x.type === 'hit' && x.guardianRedirect);
  ok(h && h.targetUid === G1.uid && h.guardedUid === T.uid && h.guardChain == null, `the Guardian beside the ally takes it, no hop (target ${h && h.targetUid}, G1 ${G1.uid}, chain ${h && JSON.stringify(h.guardChain)})`);
  ok(G1.hp === 98 && G2.hp === 100 && T.hp === 500, `a Guardian beside the Guardian that stepped in doesn't cover it (G1 ${G1.hp}, G2 ${G2.hp})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit2'); const G1 = spawn(e, P, 2, 'x-guard'), G2 = spawn(e, P, 2, 'x-guard');
  const h = round(e, P).find(x=> x.type === 'hit' && x.targetUid != null);
  ok(h && h.guardianRedirect && h.targetUid === G2.uid && h.guardedUid === G1.uid && G1.hp === 100, 'a Guardian aimed at directly is still covered by the Guardian beside it (it was not intercepting)'); }
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8'); ok(!/lastGuardHop|guardChain:/.test(src), 'the engine has no Guardian hop left (lastGuardHop, guardChain)'); }

// ---- #7 Hemorrhage ------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hem'); const W = spawn(e, P, 2, 'x-wall'); W.bleed = 3; const ev = round(e, P);
  const hv = ev.find(x=> x.type === 'statusFx' && x.kind === 'hemorrhage');
  ok(hv && hv.from === 3 && hv.total === 6 && hv.targetUid === W.uid, `Bleed 3 doubled to 6 (${hv && hv.from} -> ${hv && hv.total})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hemb'); const W = spawn(e, P, 2, 'x-wall'); W.bleed = 3; const ev = round(e, P);
  const hv = ev.find(x=> x.kind === 'hemorrhage'); ok(hv && hv.total === 8 && W.bleed >= 7, `doubled first, then its own Bleed 2: 3 -> 6 + 2 = 8 (${hv && hv.total}; the round's end fades a Waiting unit's stack: ${W.bleed})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hemb'); const W = spawn(e, P, 2, 'x-wall'); const ev = round(e, P);
  ok(!ev.some(x=> x.kind === 'hemorrhage') && W.bleed >= 1, `no Bleed yet: nothing to double, its own Bleed lands (${W.bleed})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hem'); const G = spawn(e, P, 2, 'x-ghost'); G.bleed = 2; const ev = round(e, P);
  ok(!ev.some(x=> x.kind === 'hemorrhage'), 'a Ghost: no doubling'); }
// Hemorrhage with its own Bleed 2 on a unit that acts (Bleed fades 1 a round): 2, then (2-1)x2+2 = 4, then (4-1)x2+2 = 8
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hemb'); const W = spawn(e, P, 2, 'x-hit'); const seen = [];
  for(let r = 0; r < 3; r++){ round(e, P, 1).filter(x=> x.kind === 'hemorrhage').forEach(x=> seen.push(x.from + '>' + x.total)); }
  ok(seen.join(',') === '1>4,3>8', `round by round on a unit that acts: ${seen.join(',')}`); }

// ---- #7 Greater Poison --------------------------------------------------------------------------------------------------------
// (the round's upkeep ticks first: Poison 4 deals 4 and is 3 when the swing lands)
{ const {e, P} = mk(); spawn(e, P, 1, 'x-gp'); const W = spawn(e, P, 2, 'x-wall'); W.poison = 4; const ev = round(e, P);
  const g = ev.find(x=> x.type === 'statusFx' && x.kind === 'greaterPoison');
  ok(g && g.converted === 3 && g.amount === 1 && g.total === 4 && g.poison === 2 && W.gpoison === 4 && W.poison === 2,
    `Poison 3 turned: Greater Poison 3 + 1 = 4, then its own Poison 2 lands plain (gp ${W.gpoison}, poison ${W.poison}, event ${g && JSON.stringify({c:g.converted, t:g.total, p:g.poison})})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-gp'); const W = spawn(e, P, 2, 'x-wall'); round(e, P);
  ok(W.gpoison === 1 && W.poison === 2, `fresh target: its own Poison stays plain this hit, +1 Greater Poison (gp ${W.gpoison}, poison ${W.poison})`); }
// the tick: 1 a stack, after the plain Poison; the stack never wears down (owner 23:45: "Greater Poison tokens are not removed on every poison tick")
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit'); const W = spawn(e, P, 2, 'x-wall'); W.gpoison = 3; W.poison = 1; const d = [];
  for(let r = 0; r < 4; r++){ const ev = round(e, P); ev.filter(x=> x.type === 'greaterPoisonTick').forEach(x=> d.push(x.dmg + (x.decay ? '-' : '')));
    if(r === 0){ const iP = ev.findIndex(x=> x.type === 'poisonTick'), iG = ev.findIndex(x=> x.type === 'greaterPoisonTick'); ok(iP >= 0 && iG > iP, 'the Greater Poison tick comes after the Poison tick'); } }
  ok(d.join(',') === '3,3,3,3' && W.gpoison === 3 && W.poison === 0 && W.hp === 500 - 12 - 1 - 4, `Greater Poison 3 ticks ${d.join(',')} (1 a stack, it stays; Poison 1 wears off; four 1-Attack swings; hp ${W.hp})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-gp0'); const W = spawn(e, P, 2, 'x-wall'); W.poison = 3; round(e, P);
  ok(W.poison === 2 && !(W.gpoison > 0), `a hit that deals no damage turns nothing and adds none (as Poison): poison ${W.poison}, gp ${W.gpoison}`); }
{ const sdefs = Object.assign({}, defs, {'x-struct': {id:'x-struct', name:'Post', attack:0, health:200, wait:9, cost:0, archetypes:['Structure'], effects:{}}});
  const e = E.makeSimEngine(sdefs, E.mulberry32(5), {recordEvents:true, battleMode:'open'}), P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  spawn(e, P, 1, 'x-gponly'); const S = spawn(e, P, 2, 'x-struct'); round(e, P); ok(!(S.gpoison > 0), 'a Structure takes none'); }
// Poison Tick (Venom Pulse) ticks both; Hunter (Poisoned) counts it; Cure takes Poison first, then Greater Poison
// Pulse (owner 23:45): after the upkeep, Poison 2 -> 1, Greater Poison 3 stays
{ const {e, P} = mk(); spawn(e, P, 1, 'x-pulse'); const W = spawn(e, P, 2, 'x-wall'); W.gpoison = 3; W.poison = 2; const ev = round(e, P);
  const pt = ev.find(x=> x.type === 'poisonTick' && x.pulse); ok(pt && pt.dmg === 1 + 3 && W.poison === 1 && W.gpoison === 3, `Pulse: Poison 1 + Greater Poison 3 = ${pt && pt.dmg}, no stack wears down`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-pulse'); const W = spawn(e, P, 2, 'x-wall'); W.gpoison = 3; const ev = round(e, P);
  const pt = ev.find(x=> x.type === 'poisonTick' && x.pulse); ok(pt && pt.dmg === 3, `Pulse fires on a unit with only Greater Poison (${pt && pt.dmg})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-pulse'); const W = spawn(e, P, 2, 'x-wall'); W.bleed = 3; const ev = round(e, P);
  const bt = ev.find(x=> x.type === 'bleedTick' && x.pulse); ok(bt && bt.dmg === 3 && !ev.some(x=> x.type === 'poisonTick' && x.pulse), `Pulse ticks Bleed too: ${bt && bt.dmg} on a Bleed 3 (no Poison, no poison tick)`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-pulse2'); const W = spawn(e, P, 2, 'x-wall'); W.bleed = 2; W.poison = 2; const ev = round(e, P);
  const pts = ev.filter(x=> x.pulse); ok(pts.filter(x=> x.type === 'poisonTick').length === 2 && pts.filter(x=> x.type === 'bleedTick').length === 2, `Pulse 2: both tick twice (${pts.map(x=> x.type + ' ' + x.dmg).join(', ')})`); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-oldtick'); const W = spawn(e, P, 2, 'x-wall'); W.bleed = 2; const ev = round(e, P);
  ok(ev.some(x=> x.type === 'bleedTick' && x.pulse), 'an old custom card with the retired Poison Tick action works, as Pulse'); }
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8'));
  ok(sc.shorthands.venomPulse.action === 'pulse' && sc.actions.some(a=> a.id === 'pulse' && a.value === 1.3) && sc.actions.some(a=> a.id === 'poisonTick'), 'priced: Pulse = On Hit x Pulse (1.3 a tick); Poison Tick kept for old cards');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
  ok(!cards.some(c=> /"poisonTick"/.test(JSON.stringify(c.effects || {}))), 'no card in cards.json uses Poison Tick (nothing to migrate there)');
  const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), a = app.indexOf('function en4MigrateCard'), b = app.indexOf('function enMigrateCard');
  const mig = new Function(app.slice(a, b) + '; return en4MigrateCard;')();
  const m1 = mig({id:'x', effects:{triggers:[{on:'onHit', do:'poisonTick', who:'enemy', sub:'subject', amount:2}, {on:'onDeath', do:'heal', amount:1}]}});
  const m2 = mig({id:'y', effects:{triggers:[{on:'onSpawn', do:'poisonTick', who:'enemy', sub:'all', amount:1}]}});
  ok(m1.effects.venomPulse === 2 && m1.effects.triggers.length === 1 && m1.effects.triggers[0].do === 'heal' && m2.effects.triggers[0].do === 'pulse' && m2.effects.triggers[0].amount === 1,
    `a saved card on Poison Tick migrates to Pulse with the same N (${JSON.stringify(m1.effects)} | ${JSON.stringify(m2.effects)})`);
  ok(/key:'poisonTick', hidden:true, retired:true/.test(app) && /\{key:'pulse', label:TX\('ui\.act-pulse'\)/.test(app), 'the editor hides Poison Tick and offers Pulse'); }
{ const hasHunter = (()=>{ try{ const {e, P} = mk(); spawn(e, P, 1, 'x-hunt'); const W = spawn(e, P, 2, 'x-wall'); W.gpoison = 5; const h0 = W.hp; const ev = round(e, P); const h = ev.find(x=> x.type === 'hit' && x.targetUid === W.uid); return {dmg: h && h.dmg}; }catch(err){ return {err: String(err)}; } })();
  ok(hasHunter.dmg >= 4, `Hunter (Poisoned) counts Greater Poison (${JSON.stringify(hasHunter)})`); }
// (Cure runs after the upkeep's ticks: Poison 2 -> 1, Greater Poison 4 stays)
{ const {e, P} = mk(); const C = spawn(e, P, 2, 'x-cure'); C.poison = 2; C.gpoison = 4; spawn(e, P, 1, 'x-wall'); const ev = round(e, P);
  const cu = ev.find(x=> x.type === 'statusFx' && x.kind === 'cure');
  ok(cu && cu.poison === 1 && cu.gpoison === 2 && C.gpoison === 2, `Cure 3: Poison 1 first, then 2 Greater Poison (${cu && JSON.stringify({p:cu.poison, g:cu.gpoison})}, left ${C.gpoison})`); }

// ---- #4 Shore Up --------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit'); const S = spawn(e, P, 2, 'x-shore'), L = spawn(e, P, 2, 'x-wall'), R = spawn(e, P, 2, 'x-wall', 'right'), F = spawn(e, P, 2, 'x-wall');
  const ev = round(e, P), su = ev.find(x=> x.type === 'shoreUp');
  ok(su && su.uid === S.uid && su.targets.length === 2 && su.targets.includes(L.uid) && su.targets.includes(R.uid), `hit: the two allies beside it are braced (${su && JSON.stringify(su.targets)}; L ${L.uid}, R ${R.uid})`);
  ok(L.shield === 1 && R.shield === 1 && !(F.shield > 0) && !(S.shield > 0), `Shield 1 each beside it, none further along, none on itself (L ${L.shield}, R ${R.shield}, F ${F.shield})`);
  const iS = ev.indexOf(su), iU = ev.findIndex(x=> x.type === 'statusFx' && x.kind === 'unitShield'); ok(iS >= 0 && iU > iS, 'the shoreUp event comes before the Shields\' own events'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit'); const S = spawn(e, P, 2, 'x-shore'); const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'shoreUp'), 'no ally beside it: nothing'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-arrow'); const S = spawn(e, P, 2, 'x-shore'), L = spawn(e, P, 2, 'x-wall'); let got = false;
  for(let r = 0; r < 3 && !got; r++){ const ev = round(e, P); got = ev.some(x=> x.type === 'arrow') && ev.some(x=> x.type === 'shoreUp'); }
  ok(got || !(S.hp < 500), 'a shot that hits it braces too (or no arrow reached it)'); }
{ const {e, P} = mk(); spawn(e, P, 1, 'x-hit'); const S = spawn(e, P, 2, 'x-shore'), L = spawn(e, P, 2, 'x-wall'); round(e, P); round(e, P);
  ok(L.shield === 2, `a brace a hit: two rounds, Shield 2 (${L.shield})`); }

// ---- prices, cards, placements -----------------------------------------------------------------------------------------------
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')), sk = id=> sc.skills.find(r=> r.id === id);
  ok(['hemorrhage', 'greaterPoison', 'shoreUp'].every(k=> sk(k) && sk(k).value > 0 && /package EN4/.test(sk(k).note)), 'the three prices: ' + ['hemorrhage', 'greaterPoison', 'shoreUp'].map(k=> k + ' ' + (sk(k) || {}).value).join(', '));
  ok(sk('greaterPoison').value === 2.5 && sk('hemorrhage').value === 2 && sk('shoreUp').value === 2.2, 'Hemorrhage 2, Greater Poison 2.5 (owner 23:45: it never wears off), Shore Up 2.2');
  ok(sk('greaterPoison').scale === 'half' && sk('hemorrhage').scale === 'fixed' && sk('shoreUp').scale === 'fixed', 'scales: Greater Poison half (N), the others fixed');
  const md = fs.readFileSync(path.join(ROOT, 'docs/balance/en4-skill-test-2026-10-23.md'), 'utf8'); ok(/hemorrhage/.test(md) && /greaterPoison/.test(md) && /shoreUp/.test(md), 'the measurement is filed (docs/balance/en4-skill-test-2026-10-23.md)');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/map-pools.json'), 'utf8')).maps;
  const obtain = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/card-obtain-maps.json'), 'utf8')).maps;
  const NEWC = {'great-skua': ['hemorrhage', 'mc', 1, 3], 'bloodscent-shark': ['hemorrhage', 'm7', 2, 10], 'cane-toad': ['greaterPoison', 'm8', 1, 6], 'inland-taipan': ['greaterPoison', 'md', 3, 18],
    'oyster-bank': ['shoreUp', 'mb', 1, 2], 'musk-ox-matriarch': ['shoreUp', 'm6', 3, 17]};
  if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools/card_retune_2026_10_19.js')).SC, T = SC.make(sc);
  Object.entries(NEWC).forEach(([id, [k, map, tier, mapN]])=>{ const x = c(id); const b = x && T.budget(x, {level: 1});
    ok(x && x.effects[k] && x.source && x.source.kind === 'pack' && x.source.tier === tier && x.source.map === map && !x.awaitingSource && pools[map].cards.includes(id) && obtain[id] === mapN,
      `new card ${id}: ${k}, Pack ${tier} @ ${map} (Map ${mapN}), in its pool (${x && JSON.stringify(x.source)}, obtain ${obtain[id]})`);
    ok(x && b && b.ok && b.x1 <= b.N, `${id} inside the budget (${x && x.attack}/${x && x.health}, 2A+H+S ${b && b.x1} <= N ${b && b.N})`);
    ok(x && x.uuid && x.numericId, `${id} has its uuid and numericId`); });
  ['cane-toad', 'inland-taipan'].forEach(id=> ok(c(id).effects.poison > 0, `${id} has Poison too ("Usually they have both GP and Poison")`));
  ok(new Set(cards.map(x=> x.numericId)).size === cards.length && new Set(cards.map(x=> x.id)).size === cards.length, 'ids and numericIds stay unique');
  const art = fs.readFileSync(path.join(ROOT, 'docs/art/new-cards-2026-10-23-en4.md'), 'utf8'), prompts = art.match(/```\n[^`]+```/g) || [];
  ok(Object.keys(NEWC).every(id=> art.includes('`' + id + '`')) && prompts.length === 6 && prompts.every(p=> /full background/.test(p)) && !prompts.some(p=> /no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|blade|axe|dagger|knife|bow\b|arrow/i.test(p)), 'NightCafe prompts: one each, a background, none of the banned words'); }

// ---- owner 23:45 on RW5's calls: RW5-3 moves (re-fitted to the new map), RW5-7 the Kingfisher, RW5-4 the Ember Tetra in Pack 1 -------
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/map-pools.json'), 'utf8')).maps, obtain = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/card-obtain-maps.json'), 'utf8')).maps;
  const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')); if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const T = require(path.join(ROOT, 'tools/card_retune_2026_10_19.js')).SC.make(sc);
  const MOVED = {'lodge-engineer': ['mp', 1, 6, '3/12' /* 2026-10-24 (package EN5): Timbered, re-fitted 3/13 -> 3/12 */], 'mallard-marauder': ['mg', 2, 7, '2/5'], 'ember-tetra': ['m2', 1, 4, '2/6']};
  Object.entries(MOVED).forEach(([id, [map, tier, n, line]])=>{ const x = c(id), b = T.budget(x, {level: 1}); const top = map === 'm2' ? pools.m2.cards : pools.mb.submaps[map] || [];
    ok(x.source && x.source.kind === 'pack' && x.source.map === map && x.source.tier === tier && obtain[id] === n && `${x.attack}/${x.health}` === line && b.ok && b.x1 <= b.N && top.includes(id),
      `${id}: Pack ${tier} @ ${map} (Map ${n}), ${x.attack}/${x.health} inside that budget (${b.x1} <= ${b.N})`); });
  ['mudpuppy', 'beetle-battering-ram', 'siege-rhino', 'fox-kit', 'cinder-gecko', 'cinder-hornet', 'mangrove-mudskipper', 'minnow-skitter'].forEach(id=> ok(!/package EN4/.test(c(id).creatorNote || ''), `${id}: kept where RW5 had it`));
  const k = c('mangrove-kingfisher'); ok(k.rarity === 'rare' && k.source.kind === 'map' && k.source.node === '9-6', `the Mangrove Kingfisher is 9-6's (elite) reward, not 9-3's (${JSON.stringify(k.source)})`);
  const kr = c('banded-sea-krait'); ok(kr.source.node === '9-3', `the Banded Sea Krait (Uncommon) is 9-3's reward, so Map 9 keeps a skirmish-exclusive card (${JSON.stringify(kr.source)})`);
  const dv = fs.readFileSync(path.join(ROOT, 'tools/map_divvy_2026_10_22.js'), 'utf8'); ok(/'mangrove-kingfisher': '9-6', 'banded-sea-krait': '9-3'/.test(dv), 'the divvy plan says the same'); }

// ---- the app, texts, docs ---------------------------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ["{key:'hemorrhage', category:'passive'", "{key:'greaterPoison', category:'passive'", "{key:'shoreUp', category:'passive'", "hemorrhage:'🩸²'", "greaterPoison:'💀'",
   'function en4Vfx', 'function en4HemorrhageVfx', 'function en4GreaterPoisonVfx', 'function en4GreaterPoisonTickVfx', 'function en4ShoreUpVfx', 'function en4LogText', 'function en4StatusBadges',
   'try{ en4Vfx(ev); }catch(e){}', "['gpoison', 'greaterPoison'", 'gpoison:rc.gpoison||0', 'gpoison:c.gpoison||0'].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  ok(!/function en3GuardChain|en3GuardChain\(ev\)/.test(app), 'the board no longer walks a second Guardian in (en3GuardChain gone)');
  ok(/A Guardian that steps in isn't covered by another Guardian\./.test(app) && !/steps in for it in turn/.test(app), 'the Guardian text says no second Guardian');
  const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'); ['.abadge.gpoison', '.en4-gp-pulse', '.en4-hemo-pulse', '.sfx.en4-shore-shield'].forEach(s=> ok(tpl.includes(s), 'arena_template.html: ' + s));
  const txt = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'); const a = txt.indexOf('const TEXT = '), b = txt.indexOf('/*TEXT-TABLE-END*/') > 0 ? txt.indexOf('/*TEXT-TABLE-END*/') : txt.indexOf('};', a);
  ok(!/\n\s*\/\/|\/\*(?!TEXT-TABLE)/.test(txt.slice(txt.indexOf('{', a) + 1, b)), 'no comments inside the TEXT object');
  const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
  const K = ['ui.skn-hemorrhage', 'ui.sk-hemorrhage', 'ui.sk-hemorrhage-codex', 'ui.skn-greater-poison', 'ui.sk-greater-poison', 'ui.sk-greater-poison-codex', 'ui.stn-greater-poison', 'ui.st-greater-poison', 'ui.ls-greater-poison', 'ui.en4-gp-tip',
    'ui.skn-shore-up', 'ui.sk-shore-up', 'ui.sk-shore-up-codex', 'ui.en4-log-hemorrhage', 'ui.en4-log-greater-poison', 'ui.en4-log-greater-poison-conv', 'ui.en4-log-gp-tick', 'ui.en4-log-shore-up', 'ui.en4-float-hemorrhage', 'ui.en4-float-gp', 'ui.en4-float-gp-conv', 'ui.en4-float-shore-up', 'ui.skn-venom-pulse', 'ui.sk-venom-pulse', 'ui.sk-venom-pulse-n', 'ui.sk-venom-pulse-codex', 'ui.log-poison-pulse', 'ui.act-pulse', 'ui.act-pulse-desc'];
  ok(TXm.TEXT['ui.skn-venom-pulse'] === 'Pulse' && /Poison and Bleed/.test(TXm.TEXT['ui.sk-venom-pulse']) && /never wears off/.test(TXm.TEXT['ui.st-greater-poison']), 'texts: Pulse (Poison and Bleed), Greater Poison never wears off');
  K.forEach(k=> ok(TXm.TEXT[k], 'TX ' + k));
  const peel = s=> s.replace(/^[^\w{(\[]+\s/, '');
  const keys = K.filter(k=> !/float-(hemorrhage|gp)/.test(k)).map(k=> /log-|float-/.test(k) ? peel(TXm.TEXT[k]) : TXm.TEXT[k]).concat(["Steps in front of an adjacent ally (beside it; in a raid, in front or behind) and takes the plain attacks aimed at it. Skills and area hits don't, and it never guards the bramble. A Guardian that steps in isn't covered by another Guardian. Taunt is different: it makes the enemies facing it aim at it."]);
  const NAMES = ['Great Skua', 'Bloodscent Shark', 'Cane Toad', 'Inland Taipan', 'Oyster Bank', 'Musk Ox Matriarch'];
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', code + '.json'), 'utf8'));
    const cn = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', code + '.json'), 'utf8'));
    const miss = keys.filter(k=> !(p[k] || ui[k]));
    ok(!miss.length && !Object.keys(p).some(k=> /steps in for it in turn|Greater Poison deals 2 a stack|Poison tick once more/.test(k)) && NAMES.every(k=> cn[k]), `lang ${code}: the EN4 texts and the six card names${miss.length ? ' (missing: ' + miss.slice(0, 3).join(' | ') + ')' : ''}`); });
  const cat = fs.readFileSync(path.join(ROOT, 'docs/effects-catalogue.md'), 'utf8'); ok(/2026-10-23 additions \(package EN4\)/.test(cat) && /en4GreaterPoison/.test(cat) && /Reverted by EN4/.test(cat), 'docs/effects-catalogue.md: EN4');
  const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8')), ids = (dec.items || []).map(d=> d.id);
  ok(['EN4-1', 'EN4-2', 'EN4-3', 'EN4-4', 'EN4-5'].every(i=> ids.includes(i)), 'decisions EN4-1 .. EN4-5');
  const cl = fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8'); ok(/package EN4/.test(cl.slice(0, 30000)), 'CHANGELOG: EN4 near the top'); } // 2026-10-24 (package EN5): later entries sit above it

console.log(`en4-2026-10-23: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
