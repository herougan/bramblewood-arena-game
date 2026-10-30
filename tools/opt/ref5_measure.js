#!/usr/bin/env node
// 2026-10-30 (package REF5): measuring the progression reference ("prog", docs/balance/ref/ref5-prog.json, baked into arena_app.js) against the
// Map reference, and the owner's report.
//
//   node tools/opt/ref5_prog.js measure road --maps 0-20 --games 24 [--side] [--out DIR]   each road fight, the Map reference and prog-1 .. prog-5
//        (the game's simulateReferenceFight: seeds 9100 + 37g, as the road measure), one JSON line a (fight, reference) in DIR/ref5-road.jsonl
//        (resumable; DIR default /home/claude/bench-cache-ref5)
//   node tools/opt/pro_ease.js --maps 0-20 --kind pro --ref map,prog --games 24 --out DIR/ref5-pro-ease.json      the DECK1 PRO decks
//   node tools/opt/ref_vs_optimum.js --maps 0-20 --ref map,prog --games 40 --out DIR/ref5-ref-vs-optimum.json     the heatmap row
//   node tools/opt/ref5_prog.js measure report                                   docs/balance/ref5-2026-10-30.json and .md (the economy, the decks,
//        how different they are, the win rates, the decisions)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const R5 = require('./ref5_prog.js');
const CACHE = '/home/claude/bench-cache-ref5';
const arg = (argv, k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const mapRange = spec => { const out = []; String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); } else out.push(+p); }); return out; };
const r3 = x => Math.round(x * 1000) / 1000;
const readJsonl = f => { try { return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { return []; } };

// the maps measured: the main maps, and (--side) the side maps that open late, at the map they open on (<= 20)
function mapsToMeasure(G, nums, side) {
  const mains = R5.mainMaps(G), out = [];
  nums.forEach(n => { if (mains[n]) out.push({ map: mains[n], no: n, side: false }); });
  if (side) G.CONQUEST_MAPS.filter(m => m.sub && !m.reserved && !m.endless && !m.tower && m.id !== 'mtut').forEach(m => { const own = G.mapNumberOf(m.id), open = G.mapUnlockNumberOf(m.id);
    if (open > own && nums.includes(open)) out.push({ map: m, no: open, side: true }); });
  return out;
}
function road(argv) {
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
  if (typeof globalThis.effectsAtLevel !== 'function') { try { globalThis.effectsAtLevel = new Function(B.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')(); } catch (e) { /* older */ } }
  const games = +arg(argv, '--games', 24), dir = arg(argv, '--out', CACHE), file = path.join(dir, 'ref5-road.jsonl');
  const refs = ['map'].concat(G.refSetIds().filter(id => /^prog-\d+$/.test(id))); if (refs.length < 2) throw new Error('prog is not baked into arena_app.js: node tools/opt/ref_decks.js --apply');
  fs.mkdirSync(dir, { recursive: true });
  const have = new Set(readJsonl(file).map(r => [r.mapId, r.key, r.ref, r.games].join('|'))), t0 = Date.now(), budgetMs = +arg(argv, '--minutes', 8) * 60000;
  for (const { map, no, side } of mapsToMeasure(G, mapRange(arg(argv, '--maps', '0-20')), argv.includes('--side'))) {
    for (const node of G.roadCurveFights(map)) for (const ref of refs) {
      const k = [map.id, node.key, ref, games].join('|'); if (have.has(k)) continue;
      if (Date.now() - t0 > budgetMs) { console.log('time budget reached; run again to go on'); return; }
      const r = G.simulateReferenceFight(map.id, node, games, { seed0: 9100, refSet: ref === 'map' ? undefined : ref });
      const t = G.roadCurveTarget(map.id, node);
      fs.appendFileSync(file, JSON.stringify({ map: no, mapId: map.id, side, key: node.key, kind: node.kind || 'skirmish', target: t ? t.t : null, ref, games, wins: r.wins, losses: r.losses, draws: r.draws, win: r3(r.win), level: r.level, stage: r.stage }) + '\n');
      have.add(k);
    }
    console.log(`Map ${no} ${map.id}${side ? ' (side)' : ''}: done (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  console.log('all done -> ' + file);
}

// ---------------------------------------------------------------- the report
function overlap(a, b) { let s = 0; Object.keys(a).forEach(id => { s += Math.min(a[id], b[id] || 0); }); return s; }
function report(argv) {
  const gm = R5.game(), G = gm.G, D = gm.D, set = JSON.parse(fs.readFileSync(path.join(ROOT, R5.SET), 'utf8')), dir = arg(argv, '--in', CACHE);
  const nm = id => (D[id] || {}).name || id;
  // 1. the economy (seed by seed, the Forge with the chosen decks)
  const econ = { maps: {} };
  for (const s of R5.SEEDS) {
    const st = R5.walk(s, 20, n => { const l = set.decks[n]; const e = l && l.find(x => x.seed === s); return e ? e.counts : null; }, { finish: true });
    st.log.concat([st.arrival]).forEach(r => { const o = econ.maps[r.map] = econ.maps[r.map] || { seeds: {} };
      o.seeds[s] = { earned: r.earned, src: r.src, bought: r.bought, packs: r.packs, newCards: r.cards.length, forgeLevels: r.forgeLevels || 0, forgeTier: r.forgeTier || null, freeLevels: r.freeLevels || 0, leftOutFactionPacks: r.left || 0 }; });
  }
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const econRows = Object.keys(econ.maps).map(Number).sort((a, b) => a - b).map(m => { const S = econ.maps[m].seeds, ss = R5.SEEDS.filter(s => S[s]);
    const e = k => Math.round(mean(ss.map(s => (S[s].earned || {})[k] || 0)));
    const packs = mean(ss.map(s => Object.values(S[s].bought || {}).reduce((t, n) => t + n, 0))), what = [...new Set([].concat(...ss.map(s => Object.keys(S[s].bought || {}))))];
    const decks = set.decks[m] || [], lv = decks.map(d => R5.meanLevel(d.parts));
    const fl = mean(ss.map(s => S[s].forgeLevels)), free = mean(ss.map(s => S[s].freeLevels));
    return { map: m, earnedX15: { gold: e('gold'), gems: e('gems'), dust: e('dust') }, packsBought: Math.round(packs * 10) / 10, packKinds: what, forgeLevels: fl, freeLevels: free, deckMeanLevel: lv.length ? Math.round(mean(lv) * 100) / 100 : null,
      deckLevelRange: lv.length ? [Math.round(Math.min(...lv) * 100) / 100, Math.round(Math.max(...lv) * 100) / 100] : null, refLevel: G.referencePlayerLevel(m) }; });
  // 2. the decks and how different they are
  const deckRows = Object.keys(set.decks).map(Number).sort((a, b) => a - b).map(m => { const L = set.decks[m], cs = L.map(d => d.counts), pairs = [];
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) pairs.push(overlap(cs[i], cs[j]));
    const all = new Set([].concat(...cs.map(c => Object.keys(c)))), core = [...all].filter(id => cs.every(c => c[id]));
    const ref = G.referenceDeckFor(R5.mainMaps(G)[m].id, null).deck, vsRef = cs.map(c => overlap(c, ref));
    return { map: m, sharedCopiesMean: Math.round(mean(pairs) * 10) / 10, sharedCopiesMin: Math.min(...pairs), distinctCards: all.size, inAllFive: core.map(nm), sharedWithMapRef: Math.round(mean(vsRef) * 10) / 10,
      pools: (set.runs[m] || {}).runs ? set.runs[m].runs.map(r => r.pool) : null, decks: L.map(d => ({ seed: d.seed, level: Math.round(R5.meanLevel(d.parts) * 100) / 100, cards: Object.entries(d.counts).sort((a, b) => b[1] - a[1] || nm(a[0]).localeCompare(nm(b[0]))).map(([id, k]) => k + 'x ' + nm(id)).join(', ') })) }; });
  // 3. the road: per map, the Map reference vs the 5 decks (each its own, and pooled)
  const rr = readJsonl(path.join(dir, 'ref5-road.jsonl')), roadRows = [];
  const groups = {}; rr.forEach(r => { const k = r.mapId; (groups[k] = groups[k] || { map: r.map, mapId: r.mapId, side: r.side, rows: [] }).rows.push(r); });
  Object.values(groups).sort((a, b) => a.map - b.map || (a.side ? 1 : 0) - (b.side ? 1 : 0)).forEach(g => {
    const by = ref => g.rows.filter(r => r.ref === ref), wr = list => { const n = list.reduce((t, r) => t + r.games, 0); return n ? list.reduce((t, r) => t + r.wins, 0) / n : null; };
    const progs = [...new Set(g.rows.map(r => r.ref).filter(r => r !== 'map'))].sort();
    const fights = [...new Set(g.rows.map(r => r.key))], target = mean(fights.map(k => (g.rows.find(r => r.key === k) || {}).target).filter(x => x != null));
    roadRows.push({ map: g.map, mapId: g.mapId, side: g.side, fights: fights.length, target: target == null ? null : r3(target), mapRef: r3(wr(by('map'))), prog: r3(wr(g.rows.filter(r => r.ref !== 'map'))),
      perDeck: progs.map(p => r3(wr(by(p)))), games: (by('map')[0] || {}).games || null });
  });
  // 4. PRO (pro_ease) and the heatmap (ref_vs_optimum), pooled over the five
  const proF = path.join(dir, 'ref5-pro-ease.json'), pro = fs.existsSync(proF) ? JSON.parse(fs.readFileSync(proF, 'utf8')) : null, proRows = [];
  if (pro) { const maps = [...new Set(pro.rows.map(r => r.mapId))];
    maps.forEach(id => { const rs = pro.rows.filter(r => r.mapId === id), m = rs[0].map, wr = list => { const n = list.reduce((t, r) => t + r.n, 0); return n ? list.reduce((t, r) => t + r.wins, 0) / n : null; };
      const progs = [...new Set(rs.map(r => r.ref).filter(r => r !== 'map'))].sort();
      proRows.push({ map: m, mapId: id, side: !!(G.CONQUEST_MAPS.find(x => x.id === id) || {}).sub, decks: [...new Set(rs.map(r => r.id))].length, mapRef: r3(wr(rs.filter(r => r.ref === 'map'))), prog: r3(wr(rs.filter(r => r.ref !== 'map'))), perDeck: progs.map(p => r3(wr(rs.filter(r => r.ref === p)))), games: pro.settings.games }); }); }
  const hmF = path.join(dir, 'ref5-ref-vs-optimum.json'), hm = fs.existsSync(hmF) ? JSON.parse(fs.readFileSync(hmF, 'utf8')) : null, heat = [];
  if (hm) { const maps = [...new Set(hm.rows.map(r => r.map))].sort((a, b) => a - b);
    maps.forEach(n => { const rs = hm.rows.filter(r => r.map === n), p = rs.filter(r => r.ref !== 'map'), map = rs.find(r => r.ref === 'map');
      if (p.length) { const w = p.reduce((t, r) => t + r.wins, 0), l = p.reduce((t, r) => t + r.losses, 0), N = p.reduce((t, r) => t + r.n, 0);
        heat.push(Object.assign({}, p[0], { ref: 'prog', wins: w, losses: l, draws: N - w - l, n: N, win: r3(w / N), ci: require('./deckopt.js').wilson(w / N, N).map(r3), level: r3(mean(p.map(r => r.level))), perDeck: p.map(r => r3(r.win)) })); }
      if (map) heat.push(map); }); }
  const out = { about: 'Package REF5 (owner 10-28 22:50, re-confirmed 10-30): the progression reference ("Reference (Random)", set id prog): 5 decks a main map from 5 seeded players\' collections (docs/balance/ref/ref5-prog.json), measured against the Map reference. Built by tools/opt/ref5_prog.js and tools/opt/ref5_measure.js.',
    generated: new Date().toISOString(), assumptions: { mult: R5.MULT, packShare: 1.0, forgeShare: 0.5, trailPace: R5.TRAIL_PACE, side: 'otters', seeds: R5.SEEDS }, economy: econRows, decks: deckRows, road: roadRows, pro: proRows,
    heatmap: hm ? { settings: hm.settings, generated: hm.generated, rows: heat } : null };
  fs.writeFileSync(path.join(ROOT, 'docs/balance/ref5-2026-10-30.json'), JSON.stringify(out, null, 1) + '\n'); console.log('-> docs/balance/ref5-2026-10-30.json');
  return out;
}
function main(argv) {
  if (argv[0] === 'road') return road(argv.slice(1));
  if (argv[0] === 'report') return report(argv.slice(1));
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 13).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { main, road, report };
