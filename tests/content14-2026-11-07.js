#!/usr/bin/env node
// 2026-11-07 (package CONTENT14, owner 07:40: "we have to make 2 new leader cards, one each for the factions. With natural leader. I'd imagine
// it takes up the first rare slot."; decision LEAD-NAT-1): the two natural leaders exist (Rare, Natural Leader, faction pool, in budget at
// Level 1, names and flavour in 12 packs, art prompts), and the standard faction pattern's first R step gives your side's leader once
// (the real factionSetPick over a stubbed pool), held out of the other faction hand-outs until then; later R steps pick as before.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const cards = JSON.parse(rd('canonical/cards.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(rd('canonical/skill-costs.json')));
const LEAD = {otters: 'legate-of-rivergate', hummingbirds: 'gold-throat-elder'};

// ---- 1. the cards
Object.entries(LEAD).forEach(([side, id])=>{
  const c = byId[id];
  ok(!!c, `1. ${id} exists`); if(!c) return;
  ok(c.rarity === 'rare', `1. ${id} is Rare`);
  ok(c.effects && c.effects.leader === true, `1. ${id} has Natural Leader`);
  const skills = Object.keys(c.effects).filter(k=> k !== 'leader' && k !== 'flying');
  ok(skills.length >= 1 && skills.length <= 2, `1. ${id}: Natural Leader + one or two skills (${skills.join(', ')})`);
  ok(c.source && c.source.kind === 'pack' && c.source.tier === 11 && (c.source.side || '') === (side === 'hummingbirds' ? 'tribes' : ''), `1. ${id} is in the faction pool, ${side} side`);
  ok(!c.awaitingSource && !c.unattainable && !c.token && !c.test, `1. ${id} is in play`);
  ok(c.animal === (side === 'otters' ? 'otter' : 'hummingbird') && (c.archetypes || []).includes(side === 'otters' ? 'Otter' : 'Hummingbird'), `1. ${id}: animal and faction tag`);
  ok(c.flavor && c.name && c.species && c.species.length, `1. ${id}: name, species, flavour`);
  const b = T.budget(c, {}); const use = b && b.N > 0 ? b.x1 / b.N : 0;
  ok(b && b.ok && !b.wellUnder, `1. ${id} inside the budget band at Level 1 (${Math.round(100 * use)}% of N ${b && b.N})`);
  ok(!c.art, `1. ${id}: no art file yet`);
  ok(new RegExp('### ' + c.name + '\\n> ').test(rd('docs/art-style-prompts.md')), `1. ${id}: an art prompt`);
});
const nids = cards.map(c=> c.numericId).filter(n=> n != null); ok(new Set(nids).size === nids.length, '1. numericIds are unique');
const prompts = rd('docs/art-style-prompts.md'), p14 = prompts.slice(prompts.indexOf('package CONTENT14'));
ok(!/no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|blade|dagger|weapon|lance|\baxe\b|\bbow\b/i.test(p14) && /background/.test(p14), '1. the prompts name a background and avoid the forbidden words');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{
  const cn = JSON.parse(rd(`lang/cards/${code}.json`)), ui = JSON.parse(rd(`lang/ui/${code}.json`));
  Object.values(LEAD).forEach(id=>{ const c = byId[id]; if(!c) return; ok(!!cn[c.name] && !!ui[c.flavor], `1. ${id}: name and flavour in ${code}`); });
});

// ---- 2. the first R step (the real factionSetPick and its helpers, stubbed pool state)
const slice = (a, b)=>{ const i = app.indexOf(a), j = app.indexOf(b, i); return app.slice(i, j); };
const defs = {}; cards.filter(c=> !c.pool).forEach(c=> defs[c.id] = c);
let owned = {}, choice = 'otters', map = 14;
const names = ['factionSideOf', 'factionPoolPickOf', 'factionSideCounts', 'myFactionLeaderId', 'factionLeaderHeld', 'factionSetPick', 'factionTakeOut', 'noteFactionReceived'];
const S = new Function('getCardDefs', 'isEquipmentDef', 'isEasterEgg', 'copiesOwned', 'trackMapReached', 'loadFactionPool', 'saveFactionPool', 'factionReward', 'conquestMapCleared', 'legendaryHeldBack', 'loadFactionChoice', 'cardSourceOf', 'FACTION_PACKS', 'myFactionPackId', 'REWARD_NEW_FIRST',
  slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END') + slice('// FACTION_REWARD_TRACK:BEGIN', '// FACTION_REWARD_TRACK:END') + names.map(n=> B.grab(n)).join('\n') +
  '\nreturn {FACTION_LEADERS, factionLeaderSide, factionLeaderSlot, factionSetPick, factionTakeOut, factionLeaderHeld, myFactionLeaderId};')(
  ()=> defs, ()=> false, ()=> false, id=> owned[id] || 0, ()=> map, ()=> ({received: 0}), ()=>{}, ()=> null, ()=> false, ()=> false, ()=> choice,
  d=> d.source || {kind: 'base'}, {otter: {faction: 'otters'}, hummingbird: {faction: 'hummingbirds'}}, ()=> (choice === 'hummingbirds' ? 'hummingbird' : 'otter'), true);
ok(JSON.stringify(S.FACTION_LEADERS) === JSON.stringify(LEAD), '2. FACTION_LEADERS names the two cards');
ok(S.factionLeaderSide('otters') === 'otters' && S.factionLeaderSide('hummingbirds') === 'hummingbirds', '2. the tutorial side picks the leader');
ok(S.factionLeaderSide('both', {otters: 3, hummingbirds: 5}) === 'hummingbirds' && S.factionLeaderSide('both', {otters: 4, hummingbirds: 4}) === 'otters' && S.factionLeaderSide(null) === 'otters', '2. "both": the side you hold more faction cards of, ties (and no pick) to the Otters');
// a fresh pool: every faction card at the deck cap
const poolIds = cards.filter(c=> c.source && c.source.kind === 'pack' && c.source.tier === 11 && !c.unattainable && !c.token && !c.test).map(c=> c.id);
const cap = {common: 5, uncommon: 4, rare: 3, veryrare: 2};
const fresh = ()=> ({left: Object.fromEntries(poolIds.map(id=> [id, cap[defs[id].rarity] || 1])), given: {}, seen: {}, growth: [], collected: 0, received: 0});
function run(side, n, m, ownedStart){
  choice = side; map = m; owned = Object.assign({}, ownedStart || {}); const st = fresh(), out = [];
  let seed = 7; const rnd = ()=> ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for(let i = 0; i < n; i++){ const step = st.patternStep | 0; const id = S.factionSetPick(st, rnd); if(!id) break; st.left[id]--; st.given[id] = (st.given[id] || 0) + 1; owned[id] = (owned[id] || 0) + 1; out.push({id, step, r: defs[id].rarity}); }
  return {out, st};
}
['otters', 'hummingbirds'].forEach(side=>{
  const {out, st} = run(side, 40, 14);
  const lead = out.filter(o=> o.id === LEAD[side]), other = out.filter(o=> o.id === LEAD[side === 'otters' ? 'hummingbirds' : 'otters']);
  const firstRare = out.findIndex(o=> o.r === 'rare');
  ok(out.length >= 30, `2. ${side}: 40 set rewards drawn at Map 14 (${out.length})`);
  ok(firstRare === 9 && out[9].id === LEAD[side], `2. ${side}: the 10th set reward (the first R step) is ${LEAD[side]} (got ${out[9] && out[9].id})`);
  ok(lead.length === 1, `2. ${side}: the leader is given once by the pattern (${lead.length})`);
  ok(!other.length || out.indexOf(other[0]) > 9, `2. ${side}: the other side's leader never before the first R step`);
  ok(st.leaderStep === 10 && st.leaderId === LEAD[side] && st.left[LEAD[side]] === 2, `2. ${side}: leaderStep marks the slot; the copy came out of the pool (3 -> 2 left)`);
  const laterR = out.filter((o, i)=> i > 9 && o.r === 'rare');
  ok(laterR.length >= 2 && laterR.every(o=> o.id !== LEAD[side]), `2. ${side}: later R steps give other Rares (${laterR.map(o=> o.id).join(', ')})`);
});
{ // "both": more Hummingbird cards held -> the Elder
  const own = {}; poolIds.filter(id=> defs[id].source.side === 'tribes').slice(0, 6).forEach(id=> own[id] = 1);
  const {out} = run('both', 12, 14, own); const r = out.find(o=> o.r === 'rare');
  ok(r && r.id === LEAD.hummingbirds, `2. "both" with more Hummingbird cards: the first R step gives the Gold-throat Elder (${r && r.id})`);
}
{ // before Map 14 the R step is skipped: no leader
  const {out, st} = run('otters', 30, 10);
  ok(!out.some(o=> o.id === LEAD.otters || o.id === LEAD.hummingbirds) && !st.leaderStep, '2. before Map 14 (R skipped) no leader and the slot stays open');
}
ok(S.factionLeaderHeld({}, LEAD.otters) && !S.factionLeaderHeld({leaderStep: 10}, LEAD.otters) && !S.factionLeaderHeld({}, 'river-warden'), '2. factionLeaderHeld: a leader waits for the slot, nothing else does');
const fr = B.grab('factionRandomReward'), fpp = B.grab('factionPackPoolPick'), fg = B.grab('factionGrowth'), fpool = B.grab('factionPackPool');
ok(/!factionLeaderHeld\(st, id\)/.test(fr) && /!factionLeaderHeld\(st, id\)/.test(fpp) && /!factionLeaderHeld\(st, id\)/.test(fg) && /!\(fst && factionLeaderHeld\(fst, id\)\)/.test(fpool), '2. the hold covers the random rewards, a faction pack\'s own cards (pool pick and fallback) and Faction Growth');

// ---- 3. docs
const dec = JSON.parse(rd('docs/decisions.json')).items;
ok(['CONTENT14-1', 'CONTENT14-2'].every(id=> { const x = dec.find(d=> d.id === id); return x && x.body.split(/\s+/).length < 100; }), '3. CONTENT14-1/2 in decisions.json, under 100 words');
ok((dec.find(d=> d.id === 'LEAD-NAT-1') || {}).built === true, '3. LEAD-NAT-1 marked built');
ok(/^## 2026-11-07 Package CONTENT14/m.test(rd('docs/CHANGELOG.md')), '3. CHANGELOG entry');

console.log(`content14-2026-11-07: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
