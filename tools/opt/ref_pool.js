#!/usr/bin/env node
// 2026-10-27 (package BAL6, K17, owner 10-27 11:22: "Regarding the map reference, I think we should make the best deck we can given the deck
// unlocks and random 5 common cards unlocked every map (from packs). Then we have a good pool"): the Pool reference (set id "ref-pool"), a
// deck per map, each the deck optimizer's best deck from what a player holds arriving at that map.
//
//   node tools/opt/ref_pool.js pools              write docs/balance/ref/ref-pool-pools.json (the pool per map, 0-24; seeded, reproducible)
//   node tools/opt/ref_pool.js pools --check      exit 1 when the file differs from a fresh build
//   node tools/opt/deckopt.js --maps 0-24 --mode ref-pool --level ref --budget 6000 --ladder none --workers 2 --tag 2026-10-27-bal6-refpool
//   node tools/opt/ref_pool.js collect --tag 2026-10-27-bal6-refpool    write each map's optimum into docs/balance/ref/ref-pool.json
//
// The pool arriving at Map N (main maps 0-24, what a player holds once Maps 0..N-1 are cleared):
//   - the starter cards: the game's starter reference deck (WINRATE_REF_DECKS.starter) and every Base card (source "base"), as the Map
//     reference's road decks take them (tools/skirmish_pass.js ownedAt);
//   - every earlier main map's first-clear cards: each fight's own reward cards (nodeRewardCardIds) and its first-clear pack card
//     (SKIRMISH_FIRST_PACK_CARDS, or the node's firstCard);
//   - the faction rewards received by then: tools/faction_track_sim_2026_10_21.js (Otters, seed 7: the opening faction pack, every 8th first
//     clear, each map's milestone, the ambush, the achievements; picked with the game's factionTrackPick);
//   - 5 random Common pack cards per map cleared: different Commons from the basic packs a player can buy by then (Pack 1 from Map 0,
//     Pack 2 from Map 7, Pack 3 from Map 14: PACK_TIER_FROM_MAP), drawn with mulberry(fnv("ref-pool|packs|map<m>")).
// A card in the pool may be played at its rarity's copy cap (as the PRO pools do); the deck plays at the Map reference's level
// (referencePlayerLevel, --level ref). Side maps, raids and the Forge are left out.
//
// The set file (docs/balance/ref/ref-pool.json) has "decks": {"<map>": counts}, not one "counts": a per-map set. The game's REF_DECK_SETS
// takes one deck per set (refSetFor), so tools/opt/ref_decks.js does not bake a per-map set: the tools play it (deckFor below; pro_ease.js,
// ref_vs_optimum.js and skirmish_pass.js measure --ref=ref-pool hand the map's deck in as opts.deck, which plays at referencePlayerLevel).
// Dealing it in the game (Admin's reference picker, X-REF) needs refSetFor to read "decks": a small code change, left to a later package.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const POOLS = 'docs/balance/ref/ref-pool-pools.json', SET = 'docs/balance/ref/ref-pool.json';
const PACKS_PER_MAP = 5, FACTION_SEED = 7, FACTION_SIDE = 'otters', MAX_MAP = 24;
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const uniq = a => [...new Set(a)];

function mainMaps(G) { return G.CONQUEST_MAPS.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) != null).sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id)); }
function buildPools(root) {
  root = root || ROOT;
  const O = require(path.join(root, 'tools', 'opt', 'deckopt.js')), C = require(path.join(root, 'tools', 'balance', 'contribution.js'));
  const F = require(path.join(root, 'tools', 'faction_track_sim_2026_10_21.js'));
  const gm = O.loadGame(root), G = gm.G, D = gm.D, mains = mainMaps(G);
  const firstPack = new Function(gm.B.grab('SKIRMISH_FIRST_PACK_CARDS') + '\nreturn SKIRMISH_FIRST_PACK_CARDS;')();
  const PT = new Function(gm.B.grab('PACK_TIER_FROM_MAP') + '\nreturn PACK_TIER_FROM_MAP;')();
  const ok = id => D[id] && C.fieldable(gm, id);
  const starter = uniq(Object.keys(G.WINRATE_REF_DECKS.starter).concat(Object.keys(D).filter(id => G.cardSourceOf(D[id]).kind === 'base'))).filter(ok).sort();
  const rewardsOf = m => uniq([].concat(...(m.nodes || []).filter(n => n.kind !== 'tutorial').map(n => G.nodeRewardCardIds(m.id, n.key).concat(firstPack[m.id + ':' + n.key] || [], n.firstCard ? [].concat(n.firstCard) : [])))).filter(ok);
  const fac = F.simulate({ side: FACTION_SIDE, seed: FACTION_SEED }), facBy = {};
  fac.log.filter(x => x.id).forEach(x => (facBy[x.map] = facBy[x.map] || []).push(x.id));
  const commonsAt = m => Object.keys(D).filter(id => { const d = D[id], s = G.cardSourceOf(d); if (s.kind !== 'pack' || d.rarity !== 'common' || !ok(id)) return false; const t = G.basicPackTierOf ? G.basicPackTierOf(d) : (parseInt(s.tier, 10) || 1); /* 2026-10-28 (package PACK1): the pack the map lists put it in (0: in no pack), not source.tier */ return t > 0 && PT[t] != null && PT[t] <= m; }).sort();
  const packBy = {};
  for (let m = 0; m < MAX_MAP; m++) { const list = commonsAt(m), rng = O.mulberry(fnv('ref-pool|packs|map' + m)), got = [];
    while (got.length < Math.min(PACKS_PER_MAP, list.length)) { const id = list[Math.floor(rng.next() * list.length)]; if (!got.includes(id)) got.push(id); } packBy[m] = got; }
  const maps = {};
  for (let n = 0; n <= MAX_MAP && n < mains.length; n++) {
    const src = {}; const add = (id, why) => { if (!ok(id)) return; if (!src[id]) src[id] = why; };
    starter.forEach(id => add(id, 'starter'));
    for (let m = 0; m < n; m++) { rewardsOf(mains[m]).forEach(id => add(id, 'reward Map ' + m)); (facBy[m] || []).forEach(id => add(id, 'faction Map ' + m)); packBy[m].forEach(id => add(id, 'pack Map ' + m)); }
    const pool = Object.keys(src).sort();
    maps[n] = { mapId: mains[n].id, name: mains[n].name, pool, size: pool.length, new: n ? pool.filter(id => !maps[n - 1].pool.includes(id)) : pool.slice(), source: src,
      packs: n ? packBy[n - 1] : [], faction: n ? (facBy[n - 1] || []) : [] };
  }
  return { about: 'Package BAL6 (K17): the cards a player holds arriving at each main map, for the Pool reference (ref-pool). Built by tools/opt/ref_pool.js pools; read by tools/opt/deckopt.js --mode ref-pool. No "id": tools/opt/ref_decks.js skips this file.',
    tool: 'tools/opt/ref_pool.js', rule: { starter: 'WINRATE_REF_DECKS.starter + every source "base" card', rewards: 'each earlier main map\'s fights: nodeRewardCardIds + SKIRMISH_FIRST_PACK_CARDS / node.firstCard', faction: `faction_track_sim_2026_10_21.js simulate({side: "${FACTION_SIDE}", seed: ${FACTION_SEED}}), received before the map`, packs: `${PACKS_PER_MAP} different Commons a cleared map from the basic packs open by then (PACK_TIER_FROM_MAP), mulberry(fnv("ref-pool|packs|map<m>"))`, copies: 'any card of the pool up to its rarity\'s copy cap' },
    maps };
}
function stable(o) { const c = JSON.parse(JSON.stringify(o)); return JSON.stringify(c, null, 0).replace(/,"(\d+)":\{"mapId"/g, ',\n"$1":{"mapId"'); }

// ---------------------------------------------------------------- the per-map set, for the tools
function loadSet(root, id) {
  const dir = path.join(root || ROOT, 'docs', 'balance', 'ref'); if (!fs.existsSync(dir)) return null;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) { let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    if (j && j.id && j.decks && !j.bake && (!id || j.id === id)) return Object.assign(j, { file: 'docs/balance/ref/' + f }); }
  return null;
}
function toolSetIds(root) { const dir = path.join(root || ROOT, 'docs', 'balance', 'ref'); if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort().map(f => { try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); return j && j.id && j.decks && !j.bake ? j.id : null; /* REF5: a baked per-map set is the game's (REF_DECK_SETS) */ } catch (e) { return null; } }).filter(Boolean); }
// the set's deck at map N: its own map's deck, else the nearest earlier one (a side map: its main map number)
function deckFor(set, mapNo) { const ks = Object.keys(set.decks || {}).map(Number).filter(k => k <= Math.max(0, mapNo | 0)).sort((a, b) => a - b); const k = ks.length ? ks[ks.length - 1] : Math.min(...Object.keys(set.decks).map(Number)); return Object.assign({}, set.decks[k]); }

function main(argv) {
  const cmd = argv[0], arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
  if (cmd === 'pools') {
    const p = buildPools(ROOT), txt = stable(p) + '\n', fp = path.join(ROOT, POOLS);
    if (argv.includes('--check')) { const same = fs.existsSync(fp) && fs.readFileSync(fp, 'utf8') === txt; console.log(same ? 'up to date' : POOLS + ' is out of date: node tools/opt/ref_pool.js pools'); if (!same) process.exit(1); return; }
    fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, txt);
    Object.keys(p.maps).forEach(n => { const m = p.maps[n]; console.log(`Map ${String(n).padStart(2)} ${m.mapId.padEnd(4)} pool ${String(m.size).padStart(3)}  +${m.new.length}  packs: ${m.packs.join(', ') || '-'}  faction: ${m.faction.join(', ') || '-'}`); });
    console.log('-> ' + POOLS); return;
  }
  if (cmd === 'collect') {
    const tag = arg('--tag'); if (!tag) throw new Error('collect --tag <deckopt tag>');
    const pools = JSON.parse(fs.readFileSync(path.join(ROOT, POOLS), 'utf8')), decks = {}, info = {};
    Object.keys(pools.maps).forEach(n => { const m = pools.maps[n], rel = `docs/balance/opt/deckopt-map${String(n).padStart(2, '0')}-${m.mapId}-${tag}.json`, fp = path.join(ROOT, rel);
      if (!fs.existsSync(fp)) { console.log(`Map ${n}: no ${rel}`); return; }
      const d = JSON.parse(fs.readFileSync(fp, 'utf8')), best = (d.optima || [])[0] || d[d.optimum].best, bad = Object.keys(best.deck).filter(id => !m.pool.includes(id));
      if (bad.length) throw new Error(`Map ${n}: the optimum holds cards outside its pool: ${bad.join(', ')}`);
      decks[n] = best.deck; info[n] = { file: rel, score: best.score, ci: best.ci, level: d.level, pool: m.size, reproduce: d.reproduce }; });
    const prev = fs.existsSync(path.join(ROOT, SET)) ? JSON.parse(fs.readFileSync(path.join(ROOT, SET), 'utf8')) : {};
    const set = { id: 'ref-pool', label: 'Pool reference', note: 'Package BAL6 (K17, owner 10-27 11:22): per map, the deck optimizer\'s best deck from the cards a player holds arriving there (starter + earlier maps\' first-clear cards + faction rewards + 5 random pack Commons a map; docs/balance/ref/ref-pool-pools.json), at the Map reference\'s level (referencePlayerLevel). A per-map set ("decks", not "counts"): the tools play it; tools/opt/ref_decks.js does not bake it into the game.',
      level: 'referencePlayerLevel', tag, decks: Object.assign({}, prev.decks || {}, decks), runs: Object.assign({}, prev.runs || {}, info) };
    fs.writeFileSync(path.join(ROOT, SET), JSON.stringify(set, null, 1) + '\n'); console.log(`-> ${SET}: ${Object.keys(set.decks).length} maps`); return;
  }
  if (cmd === 'report') { // the owner-facing summary: docs/balance/ref-pool-<date>.md (pools, decks, the heatmap rows)
    const hm = arg('--heatmap', 'docs/balance/bal6-ref-vs-optimum-2026-10-27.json'), out = arg('--out', 'docs/balance/ref-pool-2026-10-27.md');
    const pools = JSON.parse(fs.readFileSync(path.join(ROOT, POOLS), 'utf8')), set = JSON.parse(fs.readFileSync(path.join(ROOT, SET), 'utf8'));
    const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), nm = {}, rar = {}; (Array.isArray(cards) ? cards : Object.values(cards)).forEach(c => { nm[c.id] = c.name || c.id; rar[c.id] = c.rarity; });
    const H = fs.existsSync(path.join(ROOT, hm)) ? JSON.parse(fs.readFileSync(path.join(ROOT, hm), 'utf8')) : null, cell = (ref, n) => { const r = H && H.rows.find(x => x.ref === ref && x.map === +n); return r ? Math.round(r.win * 100) : null; };
    const refs = H ? H.settings.refs : [], lab = { map: 'Map reference', ref2: 'Reference-2', 'ref-pool': 'Pool reference' };
    const deckTxt = d => Object.entries(d).sort((a, b) => b[1] - a[1] || nm[a[0]].localeCompare(nm[b[0]])).map(([id, k]) => `${k}x ${nm[id]}`).join(', ');
    const L = ['# Pool reference (ref-pool), 2026-10-27', '', 'Package BAL6 (K17). Owner 10-27 11:22: "make the best deck we can given the deck unlocks and random 5 common cards unlocked every map (from packs). Then we have a good pool".', '',
      'Per main map, the deck optimizer\'s best deck (`tools/opt/deckopt.js --mode ref-pool`, its gauntlet: the map\'s fight decks and reference decks in a fair mirror under each fight\'s field, plus the road fights as the game builds them) from the cards a player holds arriving there. The pool: the starter cards (the starter reference deck and every Base card), every earlier main map\'s first-clear cards, the faction rewards received by then (Otters, the faction track simulation, seed 7) and 5 random Common pack cards per map cleared (seeded). Any pool card up to its rarity\'s copy cap. Level: the Map reference\'s (`referencePlayerLevel`). Data: `' + POOLS + '`, `' + SET + '`' + (H ? ', `' + hm + '`' : '') + '.', '',
      '## Decks per map', '', '| Map | Pool | Level | Gauntlet score | Deck |' + (H ? refs.map(r => ` ${lab[r] || r} vs optimum |`).join('') : ''), '|---|---|---|---|---|' + (H ? refs.map(() => '---|').join('') : '')];
    Object.keys(pools.maps).forEach(n => { const m = pools.maps[n], d = set.decks[n], run = (set.runs || {})[n] || {};
      L.push(`| ${n} ${m.name} | ${m.size} (+${m.new.length}) | ${run.level == null ? '-' : run.level} | ${run.score == null ? '-' : Math.round(run.score * 1000) / 10 + '%'} | ${d ? deckTxt(d) : '(not run)'} |` + (H ? refs.map(r => ` ${cell(r, n) == null ? '-' : cell(r, n) + '%'} |`).join('') : '')); });
    if (H) { L.push('', '## Heatmap rows (win rate against each map\'s optimum, ' + H.settings.games + ' games a cell)', '', '| Reference | ' + Object.keys(pools.maps).join(' | ') + ' | Mean |', '|---|' + Object.keys(pools.maps).map(() => '---|').join('') + '---|');
      refs.forEach(r => { const v = Object.keys(pools.maps).map(n => cell(r, n)), ok = v.filter(x => x != null); L.push(`| ${lab[r] || r} | ${v.map(x => x == null ? '-' : x).join(' | ')} | ${ok.length ? Math.round(ok.reduce((a, b) => a + b, 0) / ok.length) : '-'} |`); }); }
    L.push('', '## Pool additions per map', '', '| Map | Pack Commons (5 a map cleared) | Faction rewards |', '|---|---|---|');
    Object.keys(pools.maps).forEach(n => { const m = pools.maps[n]; L.push(`| ${n} | ${m.packs.map(id => nm[id]).join(', ') || '-'} | ${m.faction.map(id => nm[id]).join(', ') || '-'} |`); });
    fs.writeFileSync(path.join(ROOT, out), L.join('\n') + '\n'); console.log('-> ' + out); return;
  }
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 26).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { buildPools, loadSet, toolSetIds, deckFor, POOLS, SET };
