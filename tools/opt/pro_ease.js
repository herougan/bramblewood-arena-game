#!/usr/bin/env node
// 2026-10-25 (package PREF, P3, owner 17:53: "the pro decks are strong. Some maps' pros are super easy. Like Map 2"; 22:36: "I like the BPRO decks.
// I wonder which are too 'ez'?"): how often each reference set beats each PRO / BPRO fight, played the way the game plays them.
//
//   node tools/opt/pro_ease.js                                 every entry of canonical/pro-skirmishes.json, --ref map,ref2, 40 games each
//   node tools/opt/pro_ease.js --maps 0-3 --ref ref2 --games 60 --tag test
//   node tools/opt/pro_ease.js --resume                        skip the pairings already in the output file
//
// One game: the game's own playReferenceGame (arena_app.js, through tools/lib_bramble.js), the reference fight the road measure plays:
//   - you: the reference set (--ref: 'map' = the map's reference deck at referencePlayerLevel; 'ref2' ... = a set from docs/balance/ref/, baked
//     into arena_app.js REF_DECK_SETS, at its scheduled per-copy levels), your seat on CPU skill 1, the plain home bramble, no leader (the
//     reference harness has none);
//   - the enemy: the PRO fight as the game builds it (proNodeOf: the PRO's deck at its level 1, its showcase leader from Map 2, the map's castle
//     and Shield rule, the entry's average field, the CPU at the PRO rule's skill, Smart).
// Seeds: seed0 = fnv(seed | entry id | ref set), games seed0 + 37g (the same as the road measure's spacing), so a pairing repeats exactly.
// "Too easy": a reference wins more than --easy (0.85). Output: docs/balance/pro-ease-<tag>.json (one row per pairing + a per-map summary
// with the pool facts: the map's rarity cap and its own pool size, map-true and bpro).
'use strict';
const path = require('path'), fs = require('fs');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), RP = require('./ref_pool.js');
const VERSION = '1.0.0 (2026-10-25, PREF)';
const DEFAULTS = { maps: null, ref: 'map,ref2', games: 40, seed: 'pro-ease', easy: 0.85, tag: null, resume: false, root: null, quiet: false };
function parseArgs(argv) {
  const o = Object.assign({}, DEFAULTS), a = argv.slice(), take = () => a.shift();
  while (a.length) { const k = take();
    switch (k) {
      case '--maps': case '--map': o.maps = take(); break; case '--ref': o.ref = take(); break; case '--games': o.games = +take(); break;
      case '--seed': o.seed = take(); break; case '--easy': o.easy = +take(); break; case '--tag': o.tag = take(); break; case '--resume': o.resume = true; break;
      case '--root': o.root = take(); break; case '--quiet': o.quiet = true; break;
      case '--help': case '-h': o.help = true; break; default: throw new Error('unknown option ' + k);
    } }
  return o;
}
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const r3 = x => Math.round(x * 1000) / 1000;

// the PRO fight as the game builds it (arena_app.js proNodeOf): pro_skirmishes.proNode plus the CPU skill the PRO rule names
function gameProNode(gm, map, entry, ent, ai) { const n = P.proNode(gm, map, entry, ent.field || {}); n.ai = ['basic', 'smart', 'smartest'][ai] || 'smart'; if ((entry.leaders || [])[0]) n.showcase = entry.leaders[0]; return n; }

// 2026-10-27 (package BAL6, K17): a per-map set from docs/balance/ref/ (the Pool reference, ref-pool) is not baked into the game: its map's deck
// goes in as opts.deck, which the game plays at referencePlayerLevel (the Map reference's level), as the set says
function refOpts(gm, map, node, refSet, seed0) {
  const set = RP.toolSetIds(gm.root).includes(refSet) ? RP.loadSet(gm.root, refSet) : null;
  if (!set) return { refSet, seed0 };
  return { deck: RP.deckFor(set, gm.G.referenceDeckFor(map.id, node).mapNo), seed0 };
}
function refKnown(gm, r) { return gm.G.refSetIds().includes(r) || RP.toolSetIds(gm.root).includes(r); }
function measurePair(gm, map, node, refSet, games, seed0) {
  const G = gm.G, ctx = G.referenceFightSetup(map.id, node, refOpts(gm, map, node, refSet, seed0));
  let w = 0, l = 0;
  for (let g = 0; g < games; g++) { const r = G.playReferenceGame(ctx, g); if (r.win) w++; else if (r.loss) l++; }
  return { wins: w, losses: l, draws: games - w - l, n: games, win: r3(w / games), ci: O.wilson(w / games, games).map(r3), stage: ctx.ref.stage === 'trial' ? 'ref:' + refSet : ctx.ref.stage, level: ctx.ref.level, deckMap: ctx.ref.deckMap, cpu: ctx.cpu };
}

async function main(argv) {
  const o = parseArgs(argv);
  if (o.help) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 19).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const root = o.root || path.join(__dirname, '..', '..'), gm = O.loadGame(root), G = gm.G;
  const data = JSON.parse(fs.readFileSync(path.join(root, 'canonical', 'pro-skirmishes.json'), 'utf8')), ai = (data.rule || {}).ai != null ? data.rule.ai : 1;
  const refs = String(o.ref).split(',').filter(Boolean); refs.forEach(r => { if (!refKnown(gm, r)) throw new Error('--ref: no reference set ' + r + ' (known: ' + G.refSetIds().concat(RP.toolSetIds(root)).join(', ') + ')'); });
  const want = mapRange(o.maps), tag = o.tag || new Date().toISOString().slice(0, 10);
  const outFile = path.join(root, 'docs', 'balance', 'pro-ease-' + tag + '.json');
  const prev = o.resume && fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : null, done = new Map(((prev || {}).rows || []).map(r => [r.id + '|' + r.ref + '|' + r.games, r]));
  const log = (...x) => { if (!o.quiet) console.log(...x); };
  const rows = [], maps = [], t0 = Date.now();
  const save = () => fs.writeFileSync(outFile, JSON.stringify({ about: 'Package PREF (P3): each reference set against each PRO / BPRO fight of canonical/pro-skirmishes.json, as the game plays them (tools/opt/pro_ease.js). win = the reference\'s win rate; easy = win > ' + o.easy + '.',
    tool: 'tools/opt/pro_ease.js ' + VERSION, generated: new Date().toISOString(), settings: { refs, games: o.games, seed: o.seed, easy: o.easy, ai, maps: o.maps }, maps, rows }, null, 1) + '\n');
  const ids = Object.keys(data.maps).sort((a, b) => (data.maps[a].map - data.maps[b].map) || (data.maps[a].side ? 1 : 0) - (data.maps[b].side ? 1 : 0) || a.localeCompare(b));
  for (const id of ids) {
    const ent = data.maps[id], map = G.CONQUEST_MAPS.find(m => m.id === id); if (!map || (want && !want.has(ent.map))) continue;
    let facts = {}; try { const mt = O.poolsFor(gm, map, { mode: 'map-true' }), bp = O.poolsFor(gm, map, { mode: 'bpro' }); facts = { cap: mt.cap, mapTruePool: mt.p1.length, bproPool: bp.p1.length, bproCards: bp.p1 }; } catch (e) { facts = { error: String(e.message || e) }; }
    const mrow = Object.assign({ id, map: ent.map, side: !!ent.side, name: ent.name || map.name, prefix: P.proPrefix(gm, map), refs: {} }, facts); maps.push(mrow);
    for (const kind of ['pro', 'bpro']) for (const e of ent[kind] || []) {
      const node = gameProNode(gm, map, e, ent, ai);
      for (const ref of refs) {
        const k = e.id + '|' + ref + '|' + o.games; let row = done.get(k);
        if (!row) { const t = Date.now(); row = Object.assign({ id: e.id, mapId: id, map: ent.map, kind, ref, games: o.games }, measurePair(gm, map, node, ref, o.games, fnv(o.seed + '|' + e.id + '|' + ref)), { ms: Date.now() - t }); }
        row.easy = row.win > o.easy; rows.push(row);
        log(`${e.id.padEnd(14)} ${ref.padEnd(5)} ${(row.win * 100).toFixed(1).padStart(5)}%  [${row.ci.map(x => (x * 100).toFixed(0)).join('-')}]  ${row.stage} L${row.level}${row.easy ? '  EASY' : ''}`);
      }
      save();
    }
    refs.forEach(ref => { const rs = rows.filter(r => r.mapId === id && r.ref === ref); mrow.refs[ref] = { mean: rs.length ? r3(rs.reduce((t, r) => t + r.win, 0) / rs.length) : null, easy: rs.filter(r => r.easy).map(r => r.id) }; });
    save();
  }
  log(`done: ${rows.length} pairings, ${Math.round((Date.now() - t0) / 1000)} s -> ${path.relative(root, outFile)}`);
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e.stack || e); process.exit(1); });
module.exports = { VERSION, parseArgs, gameProNode, measurePair, refOpts, refKnown, main };
