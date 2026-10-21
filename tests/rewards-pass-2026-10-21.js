#!/usr/bin/env node
// 2026-10-21 (package RP, the rewards and sources pass; owner Oct 21). docs/balance/rewards-pass-2026-10-21.md. Against the real data:
//   1. the categories: every card is exactly one of skirmish reward / pack card / faction reward / raid, smith, nest, base, quest,
//      secret, Easter egg, materia / awaitingSource (or the card pass's documented sourceless list); no card sits in two; the pass's
//      record (docs/balance/rewards-pass-2026-10-21.json) is applied;
//   2. no map reward in any pack pool: the game's packCardPool (every pool) and factionPackPool (the faction packs and the peoples'
//      bundles) never hold a skirmish reward; no pack-sold pool holds a faction reward;
//   3. faction rewards: the Otter and Hummingbird cards are faction rewards (or Base / tutorial / Nest / Blacksmith); the rarity gates
//      (25 / +15 / +10 received, Rare not before Map 14, Very Rare not before Map 25) are constants and hold in factionTrackPick; the
//      lowest rarity almost always first; plain first on Maps 0-1; the hand-out hooks are wired; the sim walks the road and the Rare
//      gate opens at Map 14 with the count passing 40 in Maps 12-14, the Very Rare at Map 25;
//   4. plain (no-skill) rewards on Maps 0-1, Map 1's one Lumber card; no keyword-teaching extra card there;
//   5. the gates: no Devilry card obtainable before Map 66, no Ecclesia before 77, no Evomax before 30;
//   6. side maps: one unique reward at most (its boss's), the gates (Smugglers' Grotto after Map 7, every side map off Maps 0-19 opening
//      at least four maps after its parent, its fights counting as the gate map);
//   7. the docs: the doc, the map recommendations, the decisions rules entry, the CHANGELOG, run-all.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), readJSON = rel=> JSON.parse(read(rel));
const src = read('arena_app.js'), cards = readJSON('canonical/cards.json'), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, MAPS = G.CONQUEST_MAPS;
const R = require(path.join(ROOT, 'tools', 'rewards_pass_2026_10_21.js'));
const PASS = require(path.join(ROOT, 'tools', 'card_pass_2026_10_19.js'));
const REC = readJSON('docs/balance/rewards-pass-2026-10-21.json');
const mains = MAPS.filter(m=> !m.sub && !m.reserved), mapNo = R.mapNo;
const live = cards.filter(c=> !c.pool && !c.token && !c.test);

// ---- 1. the categories
const CATS = new Set(['skirmish', 'pack', 'faction', 'raid', 'smith', 'nest', 'base', 'quest', 'secret', 'easteregg', 'materia', 'awaitingSource']);
const odd = live.filter(c=>{ const k = R.category(c); return !CATS.has(k) && !(k === 'unsorted' && (PASS.SOURCELESS[c.id] || c.hallOfFame)); }).map(c=> `${c.id} (${R.category(c)})`);
ok(!odd.length, '1. every card is in one category (an unsorted card is on the card pass\'s sourceless list): ' + odd.slice(0, 8).join(', '));
const two = cards.filter(c=> R.overlaps(c).length).map(c=> `${c.id}: ${R.overlaps(c).join('; ')}`);
ok(!two.length, '1. no card sits in two categories: ' + two.slice(0, 6).join(' | '));
const notApplied = REC.moves.filter(m=>{ const c = defs[m.id]; if(!c) return true; if(m.to === 'awaitingSource') return !!c.source || c.awaitingSource !== true; if(m.to === 'base') return !!c.source; return JSON.stringify(c.source) !== JSON.stringify(m.to); }).map(m=> m.id);
ok(REC.moves.length >= 150 && !notApplied.length, `1. the pass's ${REC.moves.length} moves are applied (python3 tools/rewards_pass_apply_2026_10_21.py): ` + notApplied.slice(0, 6));
ok(REC.moves.every(m=> m.from !== undefined && m.obtainBefore != null && m.obtainAfter != null && m.group), '1. each move records where it came from and its obtain map before / after (for the stat budget\'s map term)');
const per = {}; cards.forEach(c=>{ const s = c.source; if(s && s.kind === 'map' && s.node && c.cardType !== 'equipment') per[s.id + ':' + s.node] = (per[s.id + ':' + s.node] || 0) + 1; });
const intoFull = REC.moves.filter(m=> m.to && m.to.kind === 'map' && per[m.to.id + ':' + m.to.node] > 3).map(m=> m.to.node);
ok(!intoFull.length, '1. no fight the pass gave a card to gives more than 3: ' + intoFull);
const capBad = REC.moves.filter(m=> m.to && m.to.kind === 'map').filter(m=>{ const mp = MAPS.find(x=> x.id === m.to.id), nd = mp && mp.nodes.find(x=> x.key === m.to.node); return !nd || !G.roadRarityOk(defs[m.id].rarity, mapNo(mp.id), nd.kind); }).map(m=> m.id);
ok(!capBad.length, '1. every card the pass moved to a fight is inside that fight\'s rarity cap: ' + capBad);

// ---- 2. no map reward in any pack pool
const grab = B.grab;
const ctx = {CARD_DEFS_BASELINE: defs, liveCards: {}, getCardDefs: ()=> defs, hofBlocked: ()=> false, pitchingUnlocked: ()=> true, adminModeEnabled: false, Set, Object, Math, JSON, String, Number, Array, parseInt};
vm.createContext(ctx);
vm.runInContext(['TUTORIAL_REWARD_IDS', 'EASTER_EGG_IDS', 'isEasterEgg', 'cardSourceOf', 'cardObtainableFrom', 'isUnattainable', 'isEquipmentDef', 'SPELLS_SHELVED', 'packPoolOf', 'BASIC_PACK_POOLS', 'packCardPool',
  'PEOPLE_OF_ARCHETYPE', 'PEOPLE_NAME_HINTS', 'peopleOfCard', 'FACTION_PACKS', 'factionPackPool'].map(x=> grab(x).replace(/^const |^let /, 'var ')).join('\n') + '\nthis.F = {packCardPool, factionPackPool, FACTION_PACKS, BASIC_PACK_POOLS};', ctx);
const F = ctx.F, isMap = id=> defs[id] && defs[id].source && defs[id].source.kind === 'map';
const pools = [1, 11, 99, 2, 3]; let checked = 0;
pools.forEach(p=>{ const ids = F.packCardPool(defs, p, true); checked += ids.length; ok(!ids.some(isMap), `2. pack pool ${p} holds no skirmish reward (${ids.filter(isMap)})`); });
{ const sold = F.packCardPool(defs, 1); checked += sold.length; ok(sold.length > 100 && !sold.some(isMap) && !sold.some(id=> +(defs[id].source || {}).tier === 11), `2. the basic packs (BASIC_PACK_POOLS ${JSON.stringify(F.BASIC_PACK_POOLS)}: ${sold.length} cards) hold no skirmish reward and no faction reward`); }
Object.values(F.FACTION_PACKS).forEach(fp=>{ ['own', 'general'].forEach(w=>{ const ids = F.factionPackPool(fp, w); checked += ids.length; ok(!ids.some(isMap), `2. the ${fp.name} (${w}) holds no skirmish reward (${ids.filter(isMap).slice(0, 4)})`); }); });
ok(checked > 300, `2. ${checked} pool entries checked`);
ok(!/factionPackPool[\s\S]{0,1400}src\.kind==='map'/.test(grab('factionPackPool')), '2. a people\'s bundle no longer tops itself up with map rewards');

// ---- 3. faction rewards
const themes = readJSON('canonical/unit-themes.json'), tag = Object.fromEntries(themes.units.map(u=> [u.id, u.faction]));
const sideCards = live.filter(c=> (c.archetypes || []).includes('Otter') || (c.archetypes || []).includes('Hummingbird') || ['otters', 'hummingbirds'].includes(tag[c.id]));
const OK_ELSE = {'riverwing-envoy': 'the both-sides tutorial reward (Base)', 'egg-otter': 'the Nest\'s otter egg', 'sunfeather-plume': 'Blacksmith equipment'};
const notFac = sideCards.filter(c=>{ const k = R.category(c); return k !== 'faction' && k !== 'base' && !OK_ELSE[c.id]; }).map(c=> `${c.id} (${R.category(c)})`);
ok(sideCards.length >= 50 && !notFac.length, `1/3. the ${sideCards.length} Otter and Hummingbird cards are faction rewards, Base (starter) or a listed exception: ` + notFac.join(', '));
const fac = live.filter(c=> R.category(c) === 'faction');
ok(fac.every(c=>{ const s = c.source.side || ''; const hb = (c.archetypes || []).includes('Hummingbird') || tag[c.id] === 'hummingbirds'; return s === 'shared' || (hb ? s === 'tribes' : s === ''); }), '3. each faction reward is on its side (a Hummingbird on "tribes", an Otter on the Otter side, or "shared")');
ok(defs['sunspire-envoy'].source.side === 'tribes', '3. the Sunspire Envoy (a Hummingbird) moved off the Otter side');
const S = require(path.join(ROOT, 'tools', 'faction_track_sim_2026_10_21.js')), T = S.load();
const Gt = T.FACTION_RARITY_GATES;
ok(Gt.common.at === 0 && Gt.uncommon.at === 25 && Gt.rare.at === 40 && Gt.veryrare.at === 50 && Gt.rare.map === 14 && Gt.veryrare.map >= 25, '3. the gates: Uncommon after 25 received, Rare after 15 more and Map 14, Very Rare after 10 more and Map 25+ (owner: "25 commons ... 15 later ... 10 later")');
ok(Object.keys(Gt).every((k, i, a)=> !i || (Gt[k].at > Gt[a[i - 1]].at && Gt[k].map >= Gt[a[i - 1]].map)), '3. each gate later than the one before (received and map)');
ok(/^const FACTION_RARITY_GATES = \{/m.test(src) && /^const FACTION_REWARD_TRACK = \{/m.test(src) && /^const PLAIN_REWARDS_UPTO_MAP = 1;/m.test(src), '3. the thresholds are constants (FACTION_RARITY_GATES, FACTION_REWARD_TRACK, PLAIN_REWARDS_UPTO_MAP)');
[[{received: 24, map: 30}, 'uncommon', false], [{received: 25, map: 0}, 'uncommon', true], [{received: 39, map: 30}, 'rare', false], [{received: 99, map: 13}, 'rare', false], [{received: 40, map: 14}, 'rare', true],
 [{received: 49, map: 40}, 'veryrare', false], [{received: 99, map: 24}, 'veryrare', false], [{received: 50, map: 25}, 'veryrare', true], [{received: 0, map: 0}, 'starter', true], [{received: 200, map: 49}, 'legendary', false]]
  .forEach(([c, r, want])=> ok(T.factionRarityOpen(r, c) === want, `3. ${r} at ${c.received} received, Map ${c.map}: ${want ? 'open' : 'closed'}`));
{ // factionTrackPick never hands out a closed rarity, and the lowest open one almost always
  const otter = fac.filter(c=> !c.source.side || c.source.side === 'shared').map(c=> c.id), rnd = (s=> ()=>{ s = (s * 16807) % 2147483647; return s / 2147483647; })(42);
  let closed = 0; const tally = {};
  for(let i = 0; i < 3000; i++){ const ctx2 = {received: i % 80, map: i % 40, owned: {}}; const id = T.factionTrackPick(otter, rnd, ctx2); if(!id) continue; if(!T.factionRarityOpen(T.defs[id].rarity, ctx2)) closed++; }
  ok(!closed, `3. 3000 picks: never a closed rarity (${closed})`);
  for(let i = 0; i < 2000; i++){ const id = T.factionTrackPick(otter, rnd, {received: 45, map: 14, owned: {}}); const k = T.factionRarityKey(T.defs[id].rarity); tally[k] = (tally[k] || 0) + 1; }
  ok((tally.common || 0) > (tally.uncommon || 0) && (tally.uncommon || 0) > (tally.rare || 0) && (tally.rare || 0) > 0 && !tally.veryrare, `3. Rare open: commons first, then uncommons, a few rares, no Very Rare (${JSON.stringify(tally)})`);
  const early = {}; for(let i = 0; i < 300; i++){ const id = T.factionTrackPick(otter, rnd, {received: 3, map: 1, owned: {}}); early[id] = 1; }
  ok(Object.keys(early).length && Object.keys(early).every(id=> !Object.keys(T.defs[id].effects || {}).length), `3. Maps 0-1: a plain faction card first (${Object.keys(early)})`); }
// the hooks
const fnSrc = name=> grab(name);
ok(/factionTrackPick\(live, rnd/.test(fnSrc('factionReward')) && /noteFactionReceived\(1, st\)/.test(fnSrc('factionReward')), '3. a Faction Reward picks through the track and counts as received');
ok(/factionRarityOpen\(/.test(fnSrc('factionGrowth')) && /noteFactionReceived\(1, st\)/.test(fnSrc('factionGrowth')), '3. a Faction Growth takes only open rarities and counts');
ok(/fp\.kind === 'faction' \? .*factionTrackPick/.test(fnSrc('rollFactionPackCards')) && /noteFactionReceived\(roll\.pulls\.filter/.test(fnSrc('creditFactionPack')), '3. a faction pack\'s own cards follow the track and count');
ok(/factionTrackOnWin\(node, isFirstClear\)/.test(fnSrc('rollConquestPackDrops')) && /factionMilestone\(node\) \? factionReward\(\)/.test(fnSrc('rollConquestPackDrops')), '3. skirmish progress: the map milestone and every everyWins-th first clear');
ok(/achievementFactionCards\(id\)/.test(fnSrc('claimAchievement')) && /grantFactionRewardCards\(fn\)/.test(fnSrc('claimAchievement')) && Object.keys(T.FACTION_REWARD_TRACK.achievements).every(id=> new RegExp(`id:'${id}'`).test(src)), '3. the listed achievements drop faction cards (and exist)');
ok(/achievementFactionChipHTML\(achvId\)/.test(fnSrc('achievementRewardChipsHTML')), '3. the achievement shows its faction cards');
for(const side of ['otters', 'hummingbirds']){ const r = S.simulate({side});
  ok(r.firstOpen.uncommon >= 3 && r.firstOpen.rare === 14 && r.firstOpen.veryrare >= 25, `3. the sim (${side}): Uncommon opens at Map ${r.firstOpen.uncommon}, Rare at Map ${r.firstOpen.rare}, Very Rare at ${r.firstOpen.veryrare}`);
  ok(r.countReachedAt.rare >= 12 && r.countReachedAt.rare <= 14, `3. the sim (${side}): the count passes 40 in Map ${r.countReachedAt.rare} (the hand-out rate is paced for the Map 14 Rare)`);
  ok(r.log.every(x=> !x.id || x.map >= Gt[x.rarity].map), `3. the sim (${side}): no card before its rarity's map`);
  ok(!r.log.filter(x=> x.map <= 20).some(x=> !x.id), `3. the sim (${side}): no hand-out comes back empty through Map 20 (the pool has the copies)`); }

// ---- 4. plain rewards at the start
const startMaps = MAPS.filter(m=> !m.reserved && (m.sub ? mapNo(m.parent) <= 1 && !(m.entry && m.entry.afterMapCleared && mapNo(m.entry.afterMapCleared) >= 2) : mapNo(m.id) <= 1));
const LUMBER = new Set(['lumberjack', 'milling', 'harvest']);
const early = live.filter(c=> c.source && c.source.kind === 'map' && startMaps.some(m=> m.id === c.source.id));
ok(startMaps.some(m=> m.id === 'm1') && startMaps.some(m=> m.id === 'mf') && !startMaps.some(m=> m.id === 'mq'), `4. the start: ${startMaps.map(m=> m.id)} (Clovermead opens after Map 5 now)`);
const skilled = early.filter(c=> Object.keys(c.effects || {}).length && !(R.PLAIN_LUMBER_OK.has(c.id) && Object.keys(c.effects).every(k=> LUMBER.has(k))));
ok(early.length >= 8 && !skilled.length, `4. every Map 0-1 reward is plain, but the one Lumber card (${early.length} rewards): ` + skilled.map(c=> c.id + ' ' + Object.keys(c.effects)).join('; '));
const lumber = early.filter(c=> Object.keys(c.effects || {}).some(k=> LUMBER.has(k)));
ok(lumber.length === 1 && lumber[0].source.id === 'mf', `4. Map 1 introduces Lumber with one card (${lumber.map(c=> c.id + ' ' + c.source.node)})`);
ok(mains.slice(0, 2).every(m=> m.nodes.filter(x=> x.kind !== 'tutorial').every(x=> early.some(c=> c.source.id === m.id && c.source.node === x.key))), '4. every Map 0-1 fight still gives a card');
ok(/if\(typeof PLAIN_REWARDS_UPTO_MAP === 'number' && PLAIN_REWARDS_UPTO_MAP >= 1\) return null;/.test(fnSrc('teachingCardPick')), '4. no keyword-teaching extra card on Maps 0-1 wins');
ok(!defs['meadow-frog'].source && defs['meadow-frog'].basic, '4. the Meadow Frog is a Base card only (it was Base and a 1-1 reward)');

// ---- 5. the archetype gates
const gateBad = live.filter(c=>{ const L = R.lineOf(c); if(!L || !R.obtainable(c)) return false; return G.cardObtainMap(c) < R.LINE_GATE[L]; }).map(c=> `${c.id} (${R.lineOf(c)}, Map ${G.cardObtainMap(c)})`);
ok(R.LINE_GATE.devilry === 66 && R.LINE_GATE.ecclesia === 77 && R.LINE_GATE.evomax === 30 && !gateBad.length, '5. no Devilry card before Map 66, no Ecclesia before 77, no Evomax before 30: ' + gateBad.slice(0, 6).join(', '));
const held = live.filter(c=> R.lineOf(c) && c.awaitingSource);
ok(held.length >= 30 && held.every(c=> !c.source), `5. the ${held.length} Devilry / Ecclesia cards wait (awaitingSource), listed in the record`);

// ---- 6. side maps
const subs = MAPS.filter(m=> m.sub && !m.endless && !m.tower && !m.reserved);
subs.forEach(m=>{ const rw = live.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.cardType !== 'equipment');
  ok(rw.length <= 1 && (!rw.length || rw[0].id === R.SUBMAP_KEEP[m.id]), `6. ${m.name}: one unique reward at most (${rw.map(c=> c.id)})`);
  if(rw.length){ const last = m.nodes.filter(x=> x.kind !== 'tutorial').slice(-1)[0], nd = m.nodes.find(x=> x.key === rw[0].source.node);
    ok(nd && (nd === last || /boss|worldboss|dungeon/.test(nd.kind || '')), `6. ${m.name}: its unique card is its boss's or last fight's (${nd && nd.key} ${nd && nd.kind})`); } });
const gate = m=> m.entry && m.entry.afterMapCleared ? mapNo(m.entry.afterMapCleared) : null;
ok(gate(MAPS.find(m=> m.id === 'mg')) === 7, '6. Smugglers\' Grotto opens after Map 7 (owner)');
// the Pale Desert keeps the gate it was built with on 10-19 (the whole Glass Dunes cleared; tests/pale-desert-2026-10-19.js): an owner call
const GATE_KEPT = {mpd: 'the whole Glass Dunes (Map 18) cleared, as built on 2026-10-19'};
subs.filter(m=> m.id !== 'mtut' && !GATE_KEPT[m.id] && mapNo(m.parent) <= 19).forEach(m=>{ const g = gate(m);
  ok(g != null && g >= mapNo(m.parent) + 4, `6. ${m.name} (off Map ${mapNo(m.parent)}) opens late: after Map ${g}`);
  ok(m.shieldMap == null || m.id === 'mo' || m.id === 'mpd' || m.shieldMap === g, `6. ${m.name}: its fights count as its gate map (shieldMap ${m.shieldMap}, gate ${g})`); });
ok(REC.submaps && Object.keys(REC.submaps).length >= subs.length, '6. the record lists every side map with its gate and its unique card');

// ---- 7. the docs
const md = read('docs/balance/rewards-pass-2026-10-21.md'), mr = read('docs/map-recommendations-2026-10-21.md');
ok(/factionRewardTrack|FACTION_REWARD_TRACK/.test(md) && /\| Map \|/.test(md) && /Smugglers' Grotto/.test(md) && /Owner calls/i.test(md), '7. docs/balance/rewards-pass-2026-10-21.md: the track, its pacing table, the gates and the owner calls');
for(let k = 0; k <= 28; k++) ok(new RegExp(`^## Map ${k}\\b`, 'm').test(mr), `7. map recommendations: Map ${k}`);
ok(/existing/i.test(mr) && /new idea/i.test(mr) && /Maps 21.40/.test(mr), '7. the recommendations mark existing cards and new ideas, and follow the curriculum (Maps 21-40)');
const dec = readJSON('docs/decisions.json'), r21 = (dec.rules || []).find(r=> r.date === '2026-10-21' && /package RP/.test(r.intro || ''));
ok(r21 && ['world boss', '95 bosses', 'Limit break', '0.2', '20-40', 'Devilry', 'Submaps'].every(w=> r21.items.some(x=> x.includes(w))), '7. decisions.json: the 2026-10-21 rules entry (world bosses, bosses from Map 5, limit break, Map x 0.2, the eras, the gates, submaps)');
ok(read('docs/decisions.md').includes('package RP'), '7. decisions.md regenerated (_dec_md)');
ok(read('docs/CHANGELOG.md').slice(0, 40000).includes('package RP'), '7. a CHANGELOG entry near the top');
ok(/rewards-pass-2026-10-21\.js/.test(read('tests/run-all.sh')), '7. in tests/run-all.sh');

console.log(fail ? `rewards-pass-2026-10-21: ${fail} of ${n} checks failed` : `rewards-pass-2026-10-21: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
