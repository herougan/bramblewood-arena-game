#!/usr/bin/env node
// 2026-11-07 (package CONTENT15, owner 08:54: "Create a card for both factions that get stronger when the leader is present (like the
// stoat)."): the two Loyal faction cards exist (Uncommon, faction tag and pool side, in budget at Level 1, names and flavour in 12 packs,
// an art prompt, Map 5 in card-obtain-maps.json), and in a scripted fight their Loyal bonus is on while a leader of their side is on the
// field (the deck's Leader or a Natural Leader) and off without one, and goes quiet again when the leader falls.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const cards = JSON.parse(rd('canonical/cards.json')).map(c=> c && require('../bramblewood-skillparams.js').expandDef(c)) /* ENG35 (2026-11-07): fused skills read as their flat keys */, byId = {}; cards.forEach(c=> byId[c.id] = c);
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(rd('canonical/skill-costs.json')));
const OM = JSON.parse(rd('canonical/card-obtain-maps.json')).maps;
const NEW = {otters: 'oathsworn-legionary', hummingbirds: 'cobalt-talon-honour-guard'};
const LEAD = {otters: 'legate-of-rivergate', hummingbirds: 'gold-throat-elder'};

// ---- 1. the cards
ok(byId['sworn-shieldbearer'] && byId['sworn-shieldbearer'].animal === 'stoat' && byId['sworn-shieldbearer'].effects.loyal, '1. the stoat the owner means: Sworn Shieldbearer, Loyal');
Object.entries(NEW).forEach(([side, id])=>{
  const c = byId[id];
  ok(!!c, `1. ${id} exists`); if(!c) return;
  ok(c.rarity === 'uncommon', `1. ${id} is Uncommon`);
  ok(c.effects && Array.isArray(c.effects.loyal) && c.effects.loyalGrant && typeof c.effects.loyalGrant === 'object', `1. ${id} has Loyal - {...}`);
  const skills = Object.keys(c.effects).filter(k=> k !== 'loyalGrant');
  ok(skills.length <= 2, `1. ${id}: two skills at most (${skills.join(', ')})`);
  ok(c.source && c.source.kind === 'pack' && c.source.tier === 11 && (c.source.side || '') === (side === 'hummingbirds' ? 'tribes' : ''), `1. ${id} is in the faction pool, ${side} side`);
  ok(!c.awaitingSource && !c.unattainable && !c.token && !c.test, `1. ${id} is in play`);
  ok(c.animal === (side === 'otters' ? 'otter' : 'hummingbird') && (c.archetypes || []).includes(side === 'otters' ? 'Otter' : 'Hummingbird'), `1. ${id}: animal and faction tag`);
  ok(c.flavor && c.name && c.species && c.species.length, `1. ${id}: name, species, flavour`);
  ok(OM[id] === 5, `1. ${id}: Map 5 in card-obtain-maps.json, like the other faction cards (${OM[id]})`);
  [0, 5].forEach(m=>{ const b = T.budget(Object.assign({}, c, {obtainMap: m}), {}); const use = b && b.N > 0 ? b.x1 / b.N : 0;
    ok(b && b.ok && !b.wellUnder, `1. ${id} inside the budget band at Level 1, Map ${m} (${Math.round(100 * use)}% of N ${b && b.N})`); });
  ok(!c.art, `1. ${id}: no art file yet`);
  ok(new RegExp('### ' + c.name + '\\n> ').test(rd('docs/art-style-prompts.md')), `1. ${id}: an art prompt`);
});
const nids = cards.map(c=> c.numericId).filter(n=> n != null); ok(new Set(nids).size === nids.length, '1. numericIds are unique');
const prompts = rd('docs/art-style-prompts.md'), p15 = prompts.slice(prompts.indexOf('package CONTENT15'));
ok(!/no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|blade|dagger|weapon|lance|\baxe\b|\bbow\b/i.test(p15) && /background/.test(p15), '1. the prompts name a background and avoid the forbidden words');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{
  const cn = JSON.parse(rd(`lang/cards/${code}.json`)), ui = JSON.parse(rd(`lang/ui/${code}.json`));
  Object.values(NEW).forEach(id=>{ const c = byId[id]; if(!c) return; ok(!!cn[c.name] && !!ui[c.flavor], `1. ${id}: name and flavour in ${code}`); });
});

// ---- 2. a scripted fight: the bonus with a leader on the field, none without
const H = require('./lib/harness.js'), E = H.Engine;
const defs = Object.assign({}, H.loadCardDefs(), {
  'c15-wall': {id: 'c15-wall', name: 'Wall', attack: 0, health: 500, wait: 0, cost: 0, effects: {}},
  'c15-plain': {id: 'c15-plain', name: 'Plain', attack: 1, health: 30, wait: 0, cost: 0, effects: {}},
});
const so = id=> id === 1 ? 'A' : 'B';
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const fx = c=> (defs[c.defId] || {}).effects || {};
Object.entries(NEW).forEach(([side, id])=>{
  const d = byId[id], [la, lh] = d.effects.loyal, g = d.effects.loyalGrant;
  const grantOn = c=> Object.keys(g).every(k=> fx(c)[k] === g[k]);
  // (a) the deck's Leader (a summoned leader: isLeader), (b) the faction's Natural Leader
  [['the deck\'s Leader', 'c15-plain', true], ['the Natural Leader ' + LEAD[side], LEAD[side], false]].forEach(([what, leadId, summoned])=>{
    const {e, P} = mk(11);
    e.debugSpawnCard(P, so, 1, id, 'left', {}, []); e.debugSpawnCard(P, so, 2, 'c15-wall', 'left', {}, []);
    e.resolveCombat(P, so, {}, [], 1);
    const U = all(P[1]).find(c=> c.defId === id || (c.defId || '').indexOf(id) === 0);
    ok(U && !U.phaseAtk && U.maxHp === d.health && !grantOn(U), `2. ${id}: no leader on the field, no bonus (${U && U.phaseAtk}, ${U && U.maxHp}, ${U && U.defId})`);
    e.debugSpawnCard(P, so, 1, leadId, 'right', {}, []);
    const L = all(P[1]).find(c=> c.defId === leadId); if(summoned && L) L.isLeader = true;
    e.resolveCombat(P, so, {}, [], 1);
    ok(U.phaseAtk === la && U.maxHp === d.health + lh, `2. ${id} with ${what}: +${la}/+${lh} (${U.phaseAtk}, Health ${U.maxHp})`);
    ok(grantOn(U), `2. ${id} with ${what}: the braces are on (${JSON.stringify(g)}; ${U.defId})`);
    ok((U._ctxOn || '').split(',').includes('loyal'), `2. ${id} with ${what}: its Loyal pip lights`);
    L.hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.resolveCombat(P, so, {}, [], 1);
    ok(!U.phaseAtk && !grantOn(U), `2. ${id}: the leader falls, the bonus goes (${U.phaseAtk}, ${U.defId})`);
  });
  { // the enemy's leader does not count (that is Usurper)
    const {e, P} = mk(13);
    e.debugSpawnCard(P, so, 1, id, 'left', {}, []); e.debugSpawnCard(P, so, 2, LEAD[side === 'otters' ? 'hummingbirds' : 'otters'], 'left', {}, []);
    e.resolveCombat(P, so, {}, [], 1);
    const U = all(P[1]).find(c=> c.defId === id);
    ok(U && !U.phaseAtk && !grantOn(U), `2. ${id}: an enemy leader gives no bonus`);
  }
});
{ // the bonus counts at the bramble: the Legionary's castle swing is 2 alone and 3 with its leader
  const swing = withLeader=>{ const {e, P} = mk(17);
    e.debugSpawnCard(P, so, 1, NEW.otters, 'left', {}, []); if(withLeader) e.debugSpawnCard(P, so, 1, LEAD.otters, 'right', {}, []);
    e.resolveCombat(P, so, {}, [], 1); const L = all(P[1]).find(c=> c.defId === LEAD.otters); if(L) L.attack = 0;
    const hq = P[2].hq.hp; const U = all(P[1]).find(c=> c.defId !== LEAD.otters); e.debugAttack(P, so, U.uid, {}, []); return hq - P[2].hq.hp; };
  const a = swing(false), b = swing(true);
  ok(a === byId[NEW.otters].attack && b === a + byId[NEW.otters].effects.loyal[0], `2. the Oathsworn Legionary hits the bramble for ${a} alone and ${b} beside the Legate`);
}

// ---- 3. docs
const dec = JSON.parse(rd('docs/decisions.json')).items;
const mine = dec.filter(d=> /^CONTENT15-/.test(d.id));
ok(mine.length >= 1 && mine.every(x=> x.body.split(/\s+/).length < 100), `3. CONTENT15-n in decisions.json, under 100 words (${mine.map(x=> x.id).join(', ')})`);
ok(/^## 2026-11-07 Package CONTENT15/m.test(rd('docs/CHANGELOG.md')), '3. CHANGELOG entry');
ok(/## 11-07: Package CONTENT15 \(on its branch, not released\)/.test(rd('docs/action-items.md')), '3. action-items section');

console.log(`content15-2026-11-07: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
