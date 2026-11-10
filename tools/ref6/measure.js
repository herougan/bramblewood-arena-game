#!/usr/bin/env node
// 2026-11-11 (package REF6, owner 00:16: "let me know the variance in strength of the different decks"; "Make sure the win rates for
// reference decks are labelled in the skirmish for admins"): each of the 100 reference players' decks (docs/balance/ref6/ladder-100.json,
// tools/ref6/ladder.js) against every road fight of its map, as the game builds the fight.
//
//   node tools/ref6/measure.js --tag <t> [--games 16] [--fight-games 160] [--ref-games 32] [--maps 0-20] [--workers 2] [--strength] [--fresh]
//   node tools/ref6/measure.js --tag <t> --collect      only the summary, from what is measured (a partial run says what is missing)
//   node tools/ref6/measure.js --converge --collect --players 100 [--maps 0-20]   is N enough: the spread at 4, 8, 16 games a deck and at all, from the cache
//
// A GAME: the game's own reference fight (referenceFightSetup + playReferenceGame, as simulateReferenceFight plays it): your deck at the
// map's reference level with the player's leader, the fight's enemy deck, level, bramble and field, the CPU at its level; game g uses seed
// 5300 + 37g (BAL24's ladder seeds), so every deck meets the same draws. Players with the same deck and leader share one measurement, so a
// deck plays max(--games, --fight-games x the share of players holding it) games: a fight gets at least --fight-games games however few
// different decks its map has (on Maps 0-2 every player holds the same deck). More games extend the stored ones (game g keeps its seed).
// Beside the 100 decks, the Map reference deck and Reference-2 (the owner's Ant Deck) play each fight --ref-games times (the admin label).
// CACHE (~/bench-cache-ref6/measure): one file per fight, keyed by the map's data as the game has it (every fight's deck, field, level ...),
// canonical/cards.json, bramblewood-engine.js, the games and the seeds; inside, one entry per deck. So a re-run with a new tag after a
// change (SKIR1's rebuilt decks) plays only the fights whose map changed, and a run cut short picks up where it stopped. --fresh ignores it.
// Workers: --workers child processes claim fights from one queue (lock files), so the cores stay busy to the end.
// OUTPUT: docs/balance/ref6/ref6-<tag>.json (per fight: the players' mean win rate, SD, p10 / p50 / p90, the SD and p10 / p90 with the game
// noise taken out, Map reference, Reference-2; per map: each deck's strength = its mean win rate over the map's road fights, and that
// strength's mean, SD, p10, p90, min, max, the split-half reliability, and the cards the strongest and weakest fifth have in common) and
// docs/balance/ref6/ref6-<tag>.md (the owner's table). assemble_arena.py bakes the newest complete ref6-*.json into the game (__REF6_LABELS__).
// NOISE: a deck's win rate over n games carries binomial noise p(1 - p) / (n - 1); the observed SD over the decks is the true spread plus that
// noise, so "true" SD = sqrt(observed variance - mean noise variance), and the "est." p10 / p90 shrink the observed ones toward the mean by
// true SD / observed SD (the empirical-Bayes estimate of the decks' own spread).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const LA = require('./ladder.js');
const ROOT = path.resolve(__dirname, '..', '..'), VERSION = '1.0.0 (2026-11-11, REF6)', SEED0 = 5300;
const DIR = path.join(ROOT, 'docs', 'balance', 'ref6'), MDIR = path.join(LA.CACHE, 'measure');
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; }, has = k => argv.includes(k);
const r1 = x => x == null ? null : Math.round(x * 10) / 10;
const TAG = arg('--tag', has('--converge') ? 'conv' : null), N = +arg('--games', 16), NR = +arg('--ref-games', 32), NF = +arg('--fight-games', 160);

let _gm = null; const game = () => _gm || (_gm = require('../opt/deckopt.js').loadGame(ROOT));
const fightsOf = (gm, map) => require('../bal13/ladder_2026_11_02.js').roadFights(gm, map); // BAL24's road fights (the road-curve ones; all on a map with none)
const deckId = d => Object.keys(d.counts).sort().map(id => id + ':' + d.counts[id]).join(',') + '|' + (d.leader || 'wandering-traveller');
function jobList(gm, L) {
  const want = arg('--maps', null), list = LA.entries(want), players = has('--converge') ? +arg('--players', 30) : L.players, jobs = [];
  for (const e of list) { const M = L.maps[e.id]; if (!M) throw new Error(e.id + ': not in ladder-100.json'); const map = LA.mapOf(gm, e.id);
    const decks = M.decks.slice(0, players), cnt = {}; decks.forEach(d => { cnt[deckId(d)] = (cnt[deckId(d)] || 0) + 1; });
    const uniq = [...new Map(decks.map(d => [deckId(d), d])).values()].map(d => Object.assign({}, d, { games: Math.max(N, Math.ceil(NF * cnt[deckId(d)] / decks.length)) }));
    fightsOf(gm, map).forEach(fx => jobs.push({ id: e.id, key: fx.key, level: M.level, uniq, cost: uniq.length * (1 + gm.G.mapNumberOf(map.id) / 10) })); }
  return jobs;
}
// the fight's cache file: the map's data, the cards, the engine, the games and the seeds
let _fp = null; const filesKey = () => _fp || (_fp = LA.sha(['canonical/cards.json', 'bramblewood-engine.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('|')));
function jobFile(gm, j) { const map = LA.mapOf(gm, j.id); return path.join(MDIR, `${j.id}-${j.key}-${LA.sha([VERSION, JSON.stringify(map), filesKey(), N, NR, SEED0, j.level].join('|'))}.json`); }
const readJ = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };

// ---------------------------------------------------------------- one fight: every unique deck N games, the two reference decks NR games
function runJob(gm, j) {
  const G = gm.G, f = jobFile(gm, j), have = (!has('--fresh') && readJ(f)) || { map: j.id, fight: j.key, games: N, decks: {}, refs: {} };
  const map = LA.mapOf(gm, j.id), node = map.nodes.find(n => n.key === j.key), todo = j.uniq.filter(d => (have.decks[deckId(d)] || '').length < d.games);
  if (todo.length) {
    const ctx = G.referenceFightSetup(map.id, node, { deck: todo[0].counts, level: j.level, seed0: SEED0 });
    for (const d of todo) {
      ctx.mine = G.refPartsDeck(G.levelMixDeck(d.counts, j.level), ctx.defs, ctx.defs); ctx.ref.leader = d.leader || 'wandering-traveller';
      let bits = have.decks[deckId(d)] || ''; for (let g = bits.length; g < d.games; g++) { const r = G.playReferenceGame(ctx, g); bits += r.win ? '1' : r.loss ? '0' : 'd'; }
      have.decks[deckId(d)] = bits;
    }
  }
  for (const [k, o] of [['map', {}], ['ref2', { refSet: 'ref2' }]]) if (have.refs[k] == null && !has('--converge')) {
    try { const r = G.simulateReferenceFight(map.id, node, NR, Object.assign({ seed0: SEED0 }, o)); have.refs[k] = { wins: r.wins, n: r.n }; } catch (e) { have.refs[k] = { err: String(e.message || e).slice(0, 80) }; } }
  fs.mkdirSync(MDIR, { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(have)); fs.renameSync(f + '.tmp', f);
  return have;
}
function worker() {
  const gm = game(), L = LA.load(), jobs = jobList(gm, L), lockDir = path.join(MDIR, 'locks-' + TAG); fs.mkdirSync(lockDir, { recursive: true });
  for (const j of jobs) {
    const f = jobFile(gm, j), have = !has('--fresh') && readJ(f);
    if (have && j.uniq.every(d => (have.decks[deckId(d)] || '').length >= d.games) && (has('--converge') || (have.refs.map && have.refs.ref2))) continue;
    try { fs.closeSync(fs.openSync(path.join(lockDir, path.basename(f)), 'wx')); } catch (e) { continue; } // another worker has it
    const t = Date.now(); runJob(gm, j); process.stdout.write(`${j.id} ${j.key}: ${j.uniq.length} decks, ${j.uniq.reduce((a, d) => a + d.games, 0)} games, ${Math.round((Date.now() - t) / 1000)} s\n`);
  }
}

// ---------------------------------------------------------------- the statistics
const mean = a => a.reduce((t, x) => t + x, 0) / Math.max(1, a.length);
const sdOf = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((t, x) => t + (x - m) * (x - m), 0) / (a.length - 1)); };
const q = (a, p) => { const b = a.slice().sort((x, y) => x - y); if (!b.length) return null; const i = (b.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0, sa = 0, sb = 0; a.forEach((x, i) => { s += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sa && sb ? s / Math.sqrt(sa * sb) : null; };
// the spread of values (0..1), each with its noise variance and its group (players with the same deck share one measurement, so one noise):
// observed, and with the noise taken out. E[sample variance] = true variance + n / (n - 1) * sum over groups of w (1 - w) noise (w: the group's
// share of the players); with every deck different that is the mean noise variance.
function spread(vals, noise, groups) {
  const n = vals.length, w = {}, nz = {}; groups.forEach((g, i) => { w[g] = (w[g] || 0) + 1 / n; nz[g] = noise[i]; });
  const nv = n > 1 ? n / (n - 1) * Object.keys(w).reduce((t, g) => t + w[g] * (1 - w[g]) * nz[g], 0) : 0;
  const m = mean(vals), sd = sdOf(vals), sdT = Math.sqrt(Math.max(0, sd * sd - nv)), k = sd > 0 ? sdT / sd : 0, est = x => x == null ? null : m + (x - m) * k;
  const p10 = q(vals, 0.1), p50 = q(vals, 0.5), p90 = q(vals, 0.9);
  return { mean: r1(m * 100), sd: r1(sd * 100), sdTrue: r1(sdT * 100), p10: r1(p10 * 100), p50: r1(p50 * 100), p90: r1(p90 * 100), p10e: r1(est(p10) * 100), p90e: r1(est(p90) * 100), min: r1(Math.min(...vals) * 100), max: r1(Math.max(...vals) * 100) };
}
const rate = (bits, n) => { const b = bits.slice(0, n); let w = 0; for (const c of b) if (c === '1') w++; return w / Math.max(1, b.length); };
const half = (bits, n, odd) => { let w = 0, k = 0; for (let g = odd ? 1 : 0; g < Math.min(n, bits.length); g += 2) { k++; if (bits[g] === '1') w++; } return w / Math.max(1, k); };
function mapStats(gm, e, M, fights, res, n, players) {
  const decks = M.decks.slice(0, players), F = {}, per = decks.map(() => []), perE = decks.map(() => []), perO = decks.map(() => []), pnoise = decks.map(() => 0);
  for (const fx of fights) {
    const r = res[fx.key]; if (!r) continue; const vals = [], noise = [], groups = [];
    decks.forEach((d, i) => { const b = r.decks[deckId(d)]; if (!b) return; const p = rate(b, n), m = Math.min(n, b.length);
      vals.push(p); noise.push(p * (1 - p) / Math.max(1, m - 1)); groups.push(deckId(d)); per[i].push(p); perE[i].push(half(b, n, false)); perO[i].push(half(b, n, true)); pnoise[i] += p * (1 - p) / Math.max(1, m - 1); });
    const t = (() => { try { return gm.G.skirmishTargetBand(e.id, fx.node); } catch (x) { return null; } })(), ref = k => r.refs && r.refs[k] && r.refs[k].n ? r1(r.refs[k].wins / r.refs[k].n * 100) : null;
    F[fx.key] = Object.assign({ kind: fx.node.kind || 'skirmish', curve: !!fx.curve, target: t ? r1(t.t * 100) : null, band: t ? [r1(t.lo * 100), r1(t.hi * 100)] : null, n: Math.min(...[...new Set(decks.map(deckId))].map(k => Math.min(n, (r.decks[k] || '').length))), games: [...new Set(decks.map(deckId))].reduce((a, k) => a + Math.min(n, (r.decks[k] || '').length), 0) },
      spread(vals, noise, groups), { mapRef: ref('map'), ref2: ref('ref2'), refGames: (r.refs && r.refs.map && r.refs.map.n) || null });
  }
  const nf = Object.keys(F).length, ok = per.map(a => a.length === nf && nf > 0), S = per.map(mean).filter((x, i) => ok[i]), Sn = pnoise.filter((x, i) => ok[i]).map(x => x / (nf * nf));
  const se = perE.filter((x, i) => ok[i]).map(mean), so = perO.filter((x, i) => ok[i]).map(mean), rh = corr(se, so);
  const strength = Object.assign(spread(S, Sn, decks.filter((d, i) => ok[i]).map(deckId)), { splitHalf: rh == null ? null : Math.round(rh * 100) / 100, reliability: rh == null ? null : Math.round(2 * rh / (1 + rh) * 100) / 100 });
  // the cards the strongest and the weakest fifth of the decks have in common
  const idx = decks.map((d, i) => i).filter(i => ok[i]).sort((a, b) => mean(per[b]) - mean(per[a])), k = Math.max(1, Math.round(idx.length / 5)), top = idx.slice(0, k), bot = idx.slice(-k);
  const share = (set, id) => set.filter(i => decks[i].counts[id]).length / set.length, ids = [...new Set([].concat(...decks.map(d => Object.keys(d.counts))))];
  const nm = id => (gm.D[id] || {}).name || id, row = id => ({ id, name: nm(id), strong: Math.round(share(top, id) * 100), weak: Math.round(share(bot, id) * 100) });
  const rows = ids.map(row), lead = set => { const c = {}; set.forEach(i => { c[decks[i].leader] = (c[decks[i].leader] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 2).map(id => ({ id, name: id === 'wandering-traveller' ? 'Wandering Traveller' : nm(id), n: c[id] })); };
  const cards = { fifth: k, both: rows.filter(x => x.strong >= 80 && x.weak >= 80).sort((a, b) => b.strong + b.weak - a.strong - a.weak).slice(0, 6), strongOnly: rows.filter(x => x.strong - x.weak >= 30).sort((a, b) => (b.strong - b.weak) - (a.strong - a.weak)).slice(0, 5),
    weakOnly: rows.filter(x => x.weak - x.strong >= 30).sort((a, b) => (b.weak - b.strong) - (a.weak - a.strong)).slice(0, 5), leadersStrong: lead(top), leadersWeak: lead(bot) };
  return { map: M.map, name: M.name, side: M.side, arrival: M.arrival, level: M.level, players: decks.length, measured: S.length, unique: new Set(decks.map(deckId)).size, fights: F, strength, decks: per.map((a, i) => ok[i] ? r1(mean(a) * 100) : null), cards };
}
function results(gm, L, jobs) { const res = {}; jobs.forEach(j => { const r = readJ(jobFile(gm, j)); if (r) (res[j.id] = res[j.id] || {})[j.key] = r; }); return res; }

// ---------------------------------------------------------------- collect: the json and the owner's table
function collect() {
  const gm = game(), L = LA.load(), jobs = jobList(gm, L), res = results(gm, L, jobs), out = {}, missing = [];
  for (const e of LA.entries(arg('--maps', null))) {
    const M = L.maps[e.id], map = LA.mapOf(gm, e.id), fights = fightsOf(gm, map), r = res[e.id] || {};
    const miss = jobs.filter(j => j.id === e.id && (!r[j.key] || !j.uniq.every(d => (r[j.key].decks[deckId(d)] || '').length >= d.games))); if (miss.length) missing.push(e.id + ' (' + miss.map(x => x.key).join(' ') + ')');
    out[e.id] = mapStats(gm, e, M, fights, r, Infinity, L.players);
  }
  const complete = !missing.length && !arg('--maps', null);
  const doc = { about: 'Package REF6: the 100 reference players\' decks (docs/balance/ref6/ladder-100.json) against every road fight of their map (tools/ref6/measure.js header). Win rates in %. Per fight: the players\' mean, SD, p10 / p50 / p90 over the 100 decks, sdTrue / p10e / p90e with the game noise taken out, the Map reference (mapRef) and Reference-2 (ref2) over refGames games. Per map: strength = each deck\'s mean over the map\'s road fights (decks: player 1..100).',
    tool: 'tools/ref6/measure.js ' + VERSION, tag: TAG, generated: new Date().toISOString(), games: N, fightGames: NF, refGames: NR, seeds: SEED0 + ' + 37g', complete, missing,
    ladder: { file: path.relative(ROOT, LA.OUT), built: L.built, players: L.players, tool: L.tool }, maps: out };
  fs.mkdirSync(DIR, { recursive: true });
  const jf = path.join(DIR, `ref6-${TAG}.json`); fs.writeFileSync(jf, JSON.stringify(doc) + '\n');
  fs.writeFileSync(path.join(DIR, `ref6-${TAG}.md`), md(doc));
  if (has('--strength') && complete) { Object.keys(out).forEach(id => { L.maps[id].strengthTag = TAG; L.maps[id].decks.forEach((d, i) => { d.strength = out[id].decks[i]; }); }); LA.write(L); }
  console.log(`-> ${path.relative(ROOT, jf)} (${Object.keys(out).length} maps${missing.length ? ', missing: ' + missing.join(', ') : complete ? ', complete' : ', part (--maps): not baked'})`);
}
function md(doc) {
  const ids = Object.keys(doc.maps), M = doc.maps, s = id => M[id].strength, f = x => x == null ? '–' : String(x);
  const L = [`# REF6: how strong are the 100 reference players' decks? (${doc.tag}, ${doc.generated.slice(0, 10)})`, '',
    `Each map's 100 simulated players (seeds ref6-1 .. ref6-100, \`docs/balance/ref6/ladder-100.json\`), each deck against every road fight of its map (seeds 5300 + 37g): at least ${doc.games} games a deck, and players who share a deck share its games, so a deck plays ${doc.fightGames} x the share of players holding it when that is more (every fight gets at least ${doc.fightGames} games). A deck's **strength** = its mean win rate over the map's road fights. "True SD" takes the game noise out (${doc.games} games leave about ±${Math.round(100 * Math.sqrt(0.25 / doc.games))} points of noise per deck per fight). Made by \`node tools/ref6/measure.js --tag ${doc.tag}\`.`, '',
    '## Variance in strength of the different decks', '', '| Map | Name | mean | SD (true) | p10 – p90 | min – max | weakest fight (mean) | distinct decks |', '|---|---|---|---|---|---|---|---|'];
  ids.forEach(id => { const x = s(id), F = M[id].fights, w = Object.keys(F).sort((a, b) => F[a].mean - F[b].mean)[0];
    L.push(`| ${id} (${M[id].map}${M[id].side ? ' side' : ''}) | ${M[id].name} | ${f(x.mean)} | ${f(x.sd)} (${f(x.sdTrue)}) | ${f(x.p10)} – ${f(x.p90)} | ${f(x.min)} – ${f(x.max)} | ${w ? w + ' (' + F[w].mean + ')' : '–'} | ${M[id].unique} |`); });
  const sds = ids.map(id => s(id).sdTrue).filter(x => x != null).sort((a, b) => a - b);
  L.push('', `Median true SD ${sds[Math.floor((sds.length - 1) / 2)]} points; widest ${ids.sort((a, b) => s(b).sdTrue - s(a).sdTrue).slice(0, 3).map(id => id + ' ' + s(id).sdTrue).join(', ')}.`, '',
    '## Main maps, per road fight', '', 'Mean over the 100 decks, p10 – p90 (game noise taken out), the road-curve target, the Map reference and Reference-2.', '', '| Fight | kind | Ref 100 mean | p10 – p90 (est.) | target | Map ref | Ref-2 |', '|---|---|---|---|---|---|---|');
  ids.filter(id => !M[id].side).sort((a, b) => M[a].map - M[b].map).forEach(id => Object.keys(M[id].fights).forEach(k => { const x = M[id].fights[k];
    L.push(`| ${k} | ${x.kind} | ${f(x.mean)} | ${f(x.p10e)} – ${f(x.p90e)} | ${x.target != null ? x.target + (x.band ? ' (' + x.band[0] + '–' + x.band[1] + ')' : '') : '–'} | ${f(x.mapRef)} | ${f(x.ref2)} |`); }));
  L.push('', '## What the strongest and weakest fifth have in common', '');
  ids.forEach(id => { const c = M[id].cards, nm = a => a.map(x => `${x.name} (${x.strong}% / ${x.weak}%)`).join(', ') || '–';
    L.push(`- **${id}** strong only: ${nm(c.strongOnly)}; weak only: ${nm(c.weakOnly)}; leaders strong ${c.leadersStrong.map(x => x.name + ' ' + x.n).join(', ')}, weak ${c.leadersWeak.map(x => x.name + ' ' + x.n).join(', ')}`); });
  if (doc.missing.length) L.push('', 'Not measured yet: ' + doc.missing.join(', '));
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------- convergence: the same stats at 4, 8, 16 ... games, from the stored games
function converge() {
  const gm = game(), L = LA.load(), jobs = jobList(gm, L), res = results(gm, L, jobs), players = +arg('--players', 30), rows = [];
  for (const id of [...new Set(jobs.map(j => j.id))]) { const map = LA.mapOf(gm, id), fights = fightsOf(gm, map);
    for (const n of [4, 8, 16, Infinity]) { const st = mapStats(gm, { id }, L.maps[id], fights, res[id] || {}, n, players), F = Object.values(st.fights);
      rows.push(`${id} n=${String(n).padStart(2)}: strength mean ${st.strength.mean} sd ${st.strength.sd} true ${st.strength.sdTrue} p10e-p90e ${st.strength.p10e}-${st.strength.p90e} rel ${st.strength.reliability} | fights mean sdTrue ${r1(mean(F.map(x => x.sdTrue)))} mean sd ${r1(mean(F.map(x => x.sd)))}`); } }
  console.log(rows.join('\n'));
}

// ---------------------------------------------------------------- main
function main() {
  if (!TAG) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 25).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(1); }
  if (has('--worker')) return worker();
  if (has('--collect')) return has('--converge') ? converge() : collect();
  const W = +arg('--workers', Math.max(1, os.cpus().length)), t = Date.now(), lockDir = path.join(MDIR, 'locks-' + TAG);
  fs.rmSync(lockDir, { recursive: true, force: true }); // locks of a run that was stopped
  const pass = argv.filter((x, i) => x !== '--workers' && argv[i - 1] !== '--workers');
  const kids = []; for (let i = 0; i < W; i++) kids.push(cp.spawn('node', [__filename, '--worker', String(i)].concat(pass), { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] }));
  let left = W, bad = 0; kids.forEach(k => k.on('exit', c => { if (c) bad++; if (--left) return; fs.rmSync(lockDir, { recursive: true, force: true });
    console.log(`measured in ${Math.round((Date.now() - t) / 60000)} min${bad ? ', ' + bad + ' worker(s) failed' : ''}`); if (has('--converge')) converge(); else collect(); if (bad) process.exit(1); }));
}
if (require.main === module) main();
module.exports = { deckId, spread, mapStats, VERSION, SEED0 };
