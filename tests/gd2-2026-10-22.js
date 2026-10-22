#!/usr/bin/env node
// 2026-10-22 (package GD2, the owner's answers to GD-1 .. GD-6, 19:27):
//   GD-1 "Adjacent is defined as behind, in front, left, right. Only relevant in raids or multi-player dungeons.": one engine helper
//        (adjacentOf); front / behind only where the rows fight (reserveActs), elsewhere just left / right; Formation, Haste,
//        Shieldwall, Electricity ... read it.
//   GD-2 "Random": several Guardians, one at random (seeded).
//   GD-3 "if it's skills (including arrow), guardianship doesn't help. So no redirection for skills.": Guardian takes plain swings
//        only; an arrow goes to its target. The new Spellshield takes single-target skills aimed at an adjacent ally.
//   GD-4 King Slayer 🗡️, Fencer 🤺 (source checks).
//   GD-5 / GD-6: a first-clear pack-card reward drops like a skirmish-exclusive one (21% on repeats, its rarity's share).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'g2-hit': U('g2-hit', {}, {attack:4}), 'g2-wall': U('g2-wall', {}), 'g2-guard': U('g2-guard', {guardian:true}),
  'g2-archer': U('g2-archer', {archer:3}), 'g2-ss': U('g2-ss', {spellshield:true}), 'g2-form': U('g2-form', {formation:1}, {attack:1}),
  'g2-haste': U('g2-haste', {haste:true}), 'g2-wallarmor': U('g2-wallarmor', {shieldwall:2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);
const same = (a, b)=> a.length === b.length && a.every(x=> b.includes(x));

// ---- GD-1: adjacentOf
{ const {e, P} = mk(); const m = place(e, P, 2, 1, 'g2-wall', 0), l = place(e, P, 2, 1, 'g2-wall', -1), r = place(e, P, 2, 1, 'g2-wall', 1),
    f = place(e, P, 2, 0, 'g2-wall', 0), b = place(e, P, 2, 2, 'g2-wall', 0); place(e, P, 2, 0, 'g2-wall', 1); place(e, P, 2, 2, 'g2-wall', -1);
  ok(same(e.adjacentOf(P[2], m), [l, r, f, b]), 'adjacent (raid board): left, right, in front, behind; never the diagonals');
  ok(same(e.adjacentOf(P[2], f), [m]) || same(e.adjacentOf(P[2], f), [m].concat(all(P[2]).filter(x=> x !== f && Math.abs(x.slot - f.slot) === 1))), 'adjacent (front row): its row neighbours and the one behind it');
  ok(same(e.adjacentOf(P[2], b), [m].concat(Object.values(P[2].reserve[1]).filter(x=> x !== b && Math.abs(x.slot - b.slot) === 1))), 'adjacent (back row): its row neighbours and the one in front of it'); }
{ const {e, P} = mk({reserveActs:false}); const t = place(e, P, 2, 0, 'g2-wall', 0), r = place(e, P, 2, 0, 'g2-wall', 1); place(e, P, 2, 1, 'g2-wall', 0);
  ok(same(e.adjacentOf(P[2], t), [r]), 'adjacent off the raid board: left / right only (a waiting reserve is not adjacent)'); }

// ---- GD-2: several Guardians, one at random
{ const seen = new Map(); let rolls = 0;
  for(let seed = 1; seed <= 400; seed++){ const {e, P} = mk({}, seed); const t = place(e, P, 2, 1, 'g2-wall', 0);
    const gs = [place(e, P, 2, 1, 'g2-guard', -1), place(e, P, 2, 1, 'g2-guard', 1), place(e, P, 2, 0, 'g2-guard', 0), place(e, P, 2, 2, 'g2-guard', 0)];
    const who = e.redirectToGuardian(P[2], t); const k = gs.indexOf(who); seen.set(k, (seen.get(k)||0) + 1); rolls++; }
  const shares = [0, 1, 2, 3].map(k=> (seen.get(k)||0) / rolls);
  console.log('  four Guardians around a target, 400 seeds: left / right / in front / behind take it', shares.map(x=> (x*100).toFixed(0) + '%').join(' / '));
  ok(!seen.has(-1) && shares.every(x=> x > 0.15 && x < 0.35), 'Guardian: with four adjacent Guardians each steps in about a quarter of the time (random, not left first)'); }
{ const a = [], b = []; for(const arr of [a, b]){ const {e, P} = mk({}, 77); const t = place(e, P, 2, 0, 'g2-wall', 0); const g1 = place(e, P, 2, 0, 'g2-guard', -1), g2 = place(e, P, 2, 0, 'g2-guard', 1);
    for(let i = 0; i < 20; i++) arr.push(e.redirectToGuardian(P[2], t) === g1 ? 'L' : 'R'); }
  ok(a.join('') === b.join('') && /L/.test(a.join('')) && /R/.test(a.join('')), 'Guardian: the random pick is seeded (the same seed picks the same Guardians)'); }
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'g2-wall', 0), g = place(e, P, 2, 0, 'g2-guard', 1);
  ok(e.redirectToGuardian(P[2], t) === g, 'Guardian: one adjacent Guardian still always steps in'); }

// ---- GD-3: plain swings are redirected, skills (an arrow) are not
{ const {e, P} = mk(); place(e, P, 1, 0, 'g2-hit', 0); const t = place(e, P, 2, 0, 'g2-wall', 0), g = place(e, P, 2, 0, 'g2-guard', 1);
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 500 && g.hp === 496, `a swing lands on the adjacent Guardian (target -${500 - t.hp}, guard -${500 - g.hp})`); }
{ const {e, P} = mk(); place(e, P, 1, 0, 'g2-archer', 0); const t = place(e, P, 2, 0, 'g2-wall', 0), g = place(e, P, 2, 0, 'g2-guard', 1), g2 = place(e, P, 2, 1, 'g2-guard', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp === 497 && g.hp === 500 && g2.hp === 500, `an arrow (Archer 3) goes to its target, no Guardian steps in (target -${500 - t.hp}, guards -${500 - g.hp} / -${500 - g2.hp})`);
  ok(!ev.some(x=> x.guardianRedirect), 'no guardianRedirect on a shot'); }
// Spellshield: the arrow aimed at its adjacent ally hits it; a swing does not
{ const {e, P} = mk(); place(e, P, 1, 0, 'g2-archer', 0); const t = place(e, P, 2, 0, 'g2-wall', 0), s = place(e, P, 2, 1, 'g2-ss', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp === 500 && s.hp === 497, `Spellshield: an arrow aimed at the ally in front of it hits the Spellshield unit (target -${500 - t.hp}, shield -${500 - s.hp})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'spellshield' && x.attUid === s.uid && x.targetUid === t.uid), 'Spellshield: a statusFx spellshield event names both'); }
{ const {e, P} = mk(); place(e, P, 1, 0, 'g2-hit', 0); const t = place(e, P, 2, 0, 'g2-wall', 0), s = place(e, P, 2, 0, 'g2-ss', 1);
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 496 && s.hp === 500, `Spellshield: a plain swing still lands on its target (target -${500 - t.hp}, shield -${500 - s.hp})`); }
{ const {e, P} = mk(); const s = place(e, P, 2, 0, 'g2-ss', 0);
  ok(e.spellshieldFor(P[2], s) === null, 'Spellshield: never shields itself'); const s2 = place(e, P, 2, 0, 'g2-ss', 1); ok(e.spellshieldFor(P[2], s) === s2, 'Spellshield: a Spellshield unit is shielded by an adjacent one'); }
{ const {e, P} = mk({reserveActs:false}); const t = place(e, P, 2, 0, 'g2-wall', 0); place(e, P, 2, 1, 'g2-ss', 0);
  ok(e.spellshieldFor(P[2], t) === null, 'Spellshield: a waiting reserve does not shield (off the raid board adjacent is left / right)'); }

// ---- GD-1: skills that read adjacent
{ const {e, P} = mk(); const f = place(e, P, 1, 0, 'g2-form', 0); place(e, P, 1, 1, 'g2-wall', 0); place(e, P, 1, 2, 'g2-wall', 0);
  e.syncPhaseStats && e.syncPhaseStats(P, so, []); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok((f.sk1Atk||0) === 1, `Formation (raid): the ally behind it counts, the one two rows back doesn't (+${f.sk1Atk||0})`); }
{ const {e, P} = mk({reserveActs:false}); const f = place(e, P, 1, 0, 'g2-form', 0); e.fillReserve(P[1], 1, 0, 'g2-wall');
  e.resolveCombat(P, so, {}, [], 1); ok((f.sk1Atk||0) === 0, `Formation off the raid board: a waiting reserve behind it isn't adjacent (+${f.sk1Atk||0})`); }
const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
ok((src.match(/adjacentOf\(/g) || []).length >= 8 && /function adjacentFoesOf/.test(src) && /frontBehindOf\(sidePl, boardCard\)/.test(src), 'engine: the skills read adjacentOf / adjacentFoesOf / frontBehindOf');
ok(!/hitCard = redirectToGuardian/.test(src) && !/const c = redirectToGuardian\(enemy, target\.card\)/.test(src), 'engine: no Guardian redirect left on the shot / skill paths');

// ---- GD-4: the marks
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/🗡️ King Slayer!/.test(app) && !/👑💥 King Slayer/.test(app), "King Slayer's float is 🗡️ (was 👑💥)");
ok(/🤺/.test(app), "Fencer's mark is 🤺");

// ---- the skill's data
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const ssc = costs.skills.find(x=> x.id === 'spellshield'), gc = costs.skills.find(x=> x.id === 'guardian');
ok(ssc && gc && ssc.value > 0, `skill-costs: spellshield priced (${ssc && ssc.value}; Guardian ${gc && gc.value})`);
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
ok(!cards.some(c=> c.effects && c.effects.spellshield), 'no card has Spellshield yet');
ok(/\{key:'spellshield', category:'passive'/.test(app) && /spellshield:'/.test(app), 'editor row and icon for Spellshield');

// ---- GD-5 / GD-6: first-clear pack cards, and their drop (21% on repeats; within it the card's rarity share, else a pack card; one roll)
{ const vm = require('vm');
  function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) throw new Error('no function ' + name);
    let i = app.indexOf('{', a), depth = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } } return app.slice(a + 1, i + 1); }
  const constSrc = name=>{ const m = app.match(new RegExp('\\nconst ' + name + ' = [^\\n]*')); if(!m) throw new Error('no const ' + name); return m[0]; };
  const tblSrc = app.slice(app.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), app.indexOf('/* GD5-TABLE-END */'));
  const T = vm.runInNewContext('(' + tblSrc.replace(/^const SKIRMISH_FIRST_PACK_CARDS = /, '').replace(/;\s*$/, '') + ')');
  const byId = Object.fromEntries(cards.map(c=> [c.id, c])), pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
  const ents = Object.entries(T);
  ok(ents.length >= 30, `GD-5: ${ents.length} skirmishes pay a first-clear pack card`);
  ok(ents.every(([k, id])=>{ const [m] = k.split(':'), c = byId[id]; return c && c.source && c.source.kind === 'pack' && c.source.map === m && (pools[m].cards || []).includes(id); }), "GD-5: each is a basic-pack card of that map's own pool (its source unchanged)");
  ok(new Set(ents.map(([, id])=> id)).size === ents.length, 'GD-5: no pack card is paid by two skirmishes');
  ok(ents.every(([k])=> !cards.some(c=> c.source && c.source.kind === 'map' && c.source.id + ':' + c.source.node === k)), 'GD-5: a skirmish paying an exclusive card gets no pack card on top');
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), mains = B.G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
  mains.forEach((m, i)=>{ const sk = m.nodes.filter(n=> (n.kind || 'skirmish') === 'skirmish' && !n.tower && !n.virtual);
    const ex = sk.filter(n=> cards.some(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key)).length;
    ok(ex <= 3, `GD-5: Map ${i} has ${ex} skirmish-exclusive skirmishes (max 3)`); });
  ok(/function nodeFirstClearCardIds\(/.test(app) && /return nodeFirstClearCardIds\(mapId, node\.key\); \}catch/.test(app) && /: nodeFirstClearCardIds\(mapId, node\.key\); \/\/ \+ a first-clear pack card/.test(app), 'GD-5: the panel, the grant and the drop read nodeFirstClearCardIds');
  // the drop itself, with a pack card as the reward
  let a = 1; const seeded = seed=>{ let s = seed >>> 0; return ()=>{ s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  let rnd = seeded(5); const cdefs = byId;
  const RARITY_DEFS = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic'].map(key=> ({key}));
  const [k0, pc] = ents[0], [mid0, nk0] = k0.split(':');
  const sbx = {getCardDefs: ()=> cdefs, RARITY_DEFS, RANK_ORDER: ['E','D','C','B','A','S','SS','SSS'], baseKind: k=> k, mapNumberOf: ()=> 15,
    rankAtLeast: ()=> true, nodeRewardCardIds: ()=> [], findConquestNode: ()=> ({node:{key:nk0}}), isUnattainable: ()=> false, isEquipmentDef: d=> d.cardType === 'equipment', isEasterEgg: d=> !!d.easterEgg,
    packCardPool: ()=> cards.filter(c=> c.source && c.source.kind === 'pack' && !c.token && !c.test).map(c=> c.id), nodeFirstClearPacks: ()=> [], unlockCardForPlayer: ()=> true,
    Math: Object.assign(Object.create(Math), {random: ()=> rnd()}), Object, String, Number, Array, Set, JSON, out: {}};
  vm.createContext(sbx);
  vm.runInContext([constSrc('ENERGY_COST'), constSrc('SKIRMISH_DROP_CHANCE'), constSrc('SKIRMISH_DROP_RARITY'), constSrc('SKIRMISH_DROP_SHIFT'), constSrc('DROP_CHANCE_PER_ENERGY'),
    constSrc('CARD_RANK_STEP_MAPS'), constSrc('CARD_RANK_CAP'), constSrc('SKIRMISH_OWN_DROP_MULT'), constSrc('SKIRMISH_OWN_DROP_BY_RARITY'), tblSrc,
    ...['nodeFirstPackCardIds', 'nodeFirstClearCardIds', 'rarityAtLeastRare', 'nodeIsEliteForRank', 'cardRewardIsChallenge', 'cardRewardRankFor', 'dropRankOk', 'skirmishDropApplies', 'skirmishDropRarityRoll', 'skirmishDropPick', 'skirmishDropRoll',
      'rollSkirmishCardDrop', 'fightDropEnergy', 'fightCardDropChance', 'skirmishOwnDropShare', 'skirmishOwnDropIds', 'nodeCardDropChance', 'skirmishOwnDropOdds', 'rollCardDrop'].map(fnSrc)].join('\n') +
    '\nout.f = {nodeCardDropChance, rollCardDrop, skirmishOwnDropShare, nodeFirstClearCardIds};', sbx);
  const F = sbx.out.f, node = {key: nk0, kind: 'skirmish', deck: {}};
  ok(JSON.stringify(F.nodeFirstClearCardIds(mid0, nk0)) === JSON.stringify([pc]), `GD-5: ${k0} pays ${pc} on its first clear`);
  ok(F.nodeCardDropChance(mid0, node) === 0.07 && F.nodeCardDropChance(mid0, node, {repeat: true}) === 0.21, 'GD-5: a pack-card skirmish rolls 7% on its first clear, 21% on repeats (like an exclusive one)');
  const N = 20000, share = F.skirmishOwnDropShare(byId[pc].rarity); let any = 0, own = 0; rnd = seeded(91);
  for(let i = 0; i < N; i++){ const id = F.rollCardDrop(node, mid0, {rank: 'S', firstClear: false}); if(id){ any++; if(id === pc) own++; } }
  console.log(`  ${k0} (${pc}, ${byId[pc].rarity}) repeat wins, ${N} rolls: any card ${(any / N * 100).toFixed(2)}% (want 21%), the reward card ${(own / N * 100).toFixed(2)}% (want ${(21 * share).toFixed(2)}%)`);
  ok(Math.abs(any / N - .21) < .01 && Math.abs(own / N - .21 * share) < .01, 'GD-6: one 21% roll, then the reward card at its rarity share, else a pack card (no second roll)'); }

console.log(`gd2-2026-10-22: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
