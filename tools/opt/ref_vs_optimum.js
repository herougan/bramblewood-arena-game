#!/usr/bin/env node
// 2026-10-27 (package HUB7, owner 10-26 23:33: "a simple graphic of Map 0-24 difficulties: So the reference decks against all the map 0-24 most
// powerful deck you've constructed. All in 1 table, with heatmap."): each reference set against each main map's optimum deck. Measurement only:
// nothing here writes canonical/pro-skirmishes.json.
//
//   node tools/opt/ref_vs_optimum.js                         Maps 0-24, --ref map,ref2, 60 games a pairing
//   node tools/opt/ref_vs_optimum.js --maps 21-24 --games 60 --resume
//   node tools/opt/ref_vs_optimum.js --ref map,ref2,ref-pool --games 200 --out docs/balance/bal6-ref-vs-optimum-2026-10-27.json   (BAL6: + the Pool reference)
// 2026-10-27 (package BAL6, K17): --ref takes a per-map set from docs/balance/ref/ too (ref-pool: its map's deck at referencePlayerLevel; pro_ease.refOpts).
//
// The optimum: optima[0] of the newest map-true run among --tags (first tag that has a file for the map wins; default the HUB7 re-run, then
// PRO3's 10-25 run). A row says which file it came from, so a reused 10-25 deck is visible.
// One game: exactly tools/opt/pro_ease.js's reference vs PRO fight (the game's playReferenceGame): you = the reference set at its scheduled
// levels, no leader; the enemy = the optimum as a PRO fight (pro_skirmishes.proNode under the map's average field, the PRO rule's level and
// CPU skill, its showcase leader from Map 2). Seeds: fnv(seed | map id | ref | deck key), games seed0 + 37g, so a pairing repeats exactly.
// Output: docs/balance/hub7-ref-vs-optimum-<date>.json (--out to change).
'use strict';
const path = require('path'), fs = require('fs');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), E = require('./pro_ease.js');
const VERSION = '1.0.0 (2026-10-27, HUB7)';
const MAIN = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11', 'm21', 'm22', 'm23', 'm24'];
const DEFAULTS = { maps: '0-24', ref: 'map,ref2', games: 60, seed: 'hub7', tags: '2026-10-27-hub7-maptrue,2026-10-25-pro3-maptrue', out: 'docs/balance/hub7-ref-vs-optimum-2026-10-27.json', resume: false };
function parseArgs(argv) {
  const o = Object.assign({}, DEFAULTS), a = argv.slice();
  while (a.length) { const k = a.shift();
    switch (k) {
      case '--maps': case '--map': o.maps = a.shift(); break; case '--ref': o.ref = a.shift(); break; case '--games': o.games = +a.shift(); break;
      case '--seed': o.seed = a.shift(); break; case '--tags': o.tags = a.shift(); break; case '--out': o.out = a.shift(); break; case '--resume': o.resume = true; break;
      case '--help': case '-h': o.help = true; break; default: throw new Error('unknown option ' + k);
    } }
  return o;
}
function mapRange(spec) { const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const r3 = x => Math.round(x * 1000) / 1000;

function optimumFor(root, no, id, tags) {
  for (const tag of tags) {
    const rel = `docs/balance/opt/deckopt-map${String(no).padStart(2, '0')}-${id}-${tag}.json`, fp = path.join(root, rel);
    if (!fs.existsSync(fp)) continue;
    const d = JSON.parse(fs.readFileSync(fp, 'utf8')), best = (d.optima || [])[0] || d[d.optimum].best;
    return { file: rel, tag, generated: d.generated, engineVersion: d.version, deck: best.deck, score: best.score, ci: best.ci, reproduce: d.reproduce };
  }
  return null;
}

async function main(argv) {
  const o = parseArgs(argv);
  if (o.help) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const root = path.join(__dirname, '..', '..'), gm = O.loadGame(root), G = gm.G;
  const rule = JSON.parse(fs.readFileSync(path.join(root, 'canonical', 'pro-skirmishes.json'), 'utf8')).rule || {};
  const ai = rule.ai != null ? rule.ai : 1, level = rule.level != null ? rule.level : 1, tags = o.tags.split(',');
  const refs = E.expandRefs(gm, o.ref.split(',').filter(Boolean)); refs.forEach(r => { if (!E.refKnown(gm, r)) throw new Error('--ref: no reference set ' + r); }); // BAL6: a per-map set (ref-pool) too
  const outFile = path.resolve(root, o.out), prev = o.resume && fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : null;
  const done = new Map(((prev || {}).rows || []).map(r => [r.mapId + '|' + r.ref + '|' + r.games + '|' + r.optimum.file, r]));
  const rows = [], want = mapRange(o.maps), t0 = Date.now();
  const save = () => fs.writeFileSync(outFile, JSON.stringify({
    about: 'Package HUB7: each reference set against each main map\'s optimum deck (tools/opt/deckopt.js map-true, faction cards out), played as tools/opt/pro_ease.js plays a reference vs a PRO fight. win = the reference\'s win rate (draws count as not won). Reference-3 is pending (no deck yet).',
    tool: 'tools/opt/ref_vs_optimum.js ' + VERSION, generated: new Date().toISOString(),
    settings: { refs, games: o.games, seed: o.seed, tags, proRule: { level, ai }, maps: o.maps }, pending: ['ref3'], rows }, null, 1) + '\n');
  MAIN.forEach((id, no) => {
    if (!want.has(no)) return;
    const map = G.CONQUEST_MAPS.find(m => m.id === id), opt = optimumFor(root, no, id, tags);
    if (!opt) { console.log(`Map ${no} ${id}: no optimum file, skipped`); return; }
    const field = P.averageField(gm, map), entry = { id: no + '-OPT', name: no + '-OPT', level, deck: opt.deck, leaders: P.leadersFor(gm, map, opt.deck) };
    const node = E.gameProNode(gm, map, entry, { field }, ai);
    for (const ref of refs) {
      const k = id + '|' + ref + '|' + o.games + '|' + opt.file; let row = done.get(k);
      if (!row) {
        const t = Date.now(), m = E.measurePair(gm, map, node, ref, o.games, fnv(o.seed + '|' + id + '|' + ref + '|' + O.deckKey(opt.deck)));
        row = Object.assign({ map: no, mapId: id, name: map.name, ref, games: o.games }, m, { optimum: Object.assign({ leaders: entry.leaders, field: P.fieldSummary(gm, field) }, opt), ms: Date.now() - t });
      }
      rows.push(row); save();
      console.log(`Map ${String(no).padStart(2)} ${id.padEnd(4)} ${ref.padEnd(4)} ${(row.win * 100).toFixed(1).padStart(5)}%  [${row.ci.map(x => (x * 100).toFixed(0)).join('-')}]  ${row.wins}/${row.n}  L${row.level}  ${opt.tag}`);
    }
  });
  save(); console.log(`done: ${rows.length} pairings, ${Math.round((Date.now() - t0) / 1000)} s -> ${o.out}`);
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e.stack || e); process.exit(1); });
module.exports = { VERSION, MAIN, optimumFor, main };
