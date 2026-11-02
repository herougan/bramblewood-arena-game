#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner BAL11-4 a: "a tighter cap 2 for a 0-Lumber, 0-Wait Rare, measured first"; start 10-15%): does a Rare (and
// rarer) card that costs no Lumber and waits at most one round play above the budget's fair line, and by how much?
//   node tools/bal12/tempo_cap2_2026_11_02.js cards             the in-play cards to measure (comma list for bench.js contrib --cards)
//   node tools/bal12/tempo_cap2_2026_11_02.js pool <files...>   T - R pooled over several bench contrib files (the run used, 2026-11-02)
//   node tools/bal12/tempo_cap2_2026_11_02.js analyse <file>    the groups from a bench contrib file -> docs/balance/bal12/tempo-cap2-2026-11-02.json (+ .md)
// The measure: node tools/bench/bench.js contrib --bramble 15 --games 400 --cards <the list> --save (the paired swap against Blanks, the global
// context at the road's bramble Health; tools/bench/contrib.js fits the fair line per copy = a + b x N over every card measured).
// Groups: T = Rare and up, Lumber 0, Wait 0 or 1 (the cards BAL11 named: Trapdoor Spider, Tide Spirit, both Wait 1; Wait 0 has a single Rare);
// T0 the same at Wait 0 only; C = Common / Uncommon at Lumber 0, Wait 0-1 (the control: is the excess the Rarity term's, or any 0-Lumber card's);
// R = Rare and up that pay Lumber or wait 2+. Each group's mean distance from the fair line (win-rate points a copy) and its standard error.
// The excess in budget points: E / b (b = the fair line's slope a point of N), as a share of the group's mean N: f. A tighter cap 2 by t on
// A·H takes the share f off a body that keeps its shape when 1 - t = (1 - f)² (both stats x (1 - f)).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const cmd = process.argv[2];
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = {}; cards.forEach(c => { by[c.id] = c; });
const rank = c => BB.rankOf(c.rarity), RARE = BB.LADDER.indexOf('rare');
const groupOf = c => { const L0 = (+c.cost || 0) === 0, W = +c.wait || 0;
  if (rank(c) >= RARE && L0 && W <= 1) return W === 0 ? 'T0' : 'T1'; if (rank(c) < RARE && L0 && W <= 1) return 'C'; if (rank(c) >= RARE) return 'R'; return 'O'; };
if (cmd === 'cards') {
  const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), Cn = require(path.join(ROOT, 'tools', 'balance', 'contribution.js')), O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
  const gm = O.loadGame(ROOT), D = LB.CARD_DEFS_BASELINE;
  const ids = cards.filter(c => c.health != null && !c.pool && !c.token && !c.test && D[c.id] && !LP.isOutOfPlay(LB.G, D[c.id]) && Cn.fieldable(gm, c.id) && !/^egg-/.test(c.id)).map(c => c.id);
  console.log(ids.join(',')); process.exit(0);
}
if (cmd === 'analyse') {
  const res = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), b = res.fairLine.perN, g = {};
  res.cards.forEach(r => { const c = by[r.id]; if (!c) return; const k = groupOf(c); (g[k] = g[k] || []).push(r); });
  const T = (g.T0 || []).concat(g.T1 || []); g.T = T;
  const out = { tool: 'tools/bal12/tempo_cap2_2026_11_02.js', from: path.relative(ROOT, process.argv[3]), fingerprint: res.fingerprint, context: res.context, fairLine: res.fairLine, groups: {} };
  Object.entries(g).forEach(([k, rows]) => { const n = rows.length, m = rows.reduce((t, r) => t + r.vsFair, 0) / n, N = rows.reduce((t, r) => t + r.N, 0) / n;
    // the group mean's se: each card's own se a copy (contribution se / copies) and the spread between cards, whichever is larger
    const own = Math.sqrt(rows.reduce((t, r) => t + (r.se / res.context.copies) ** 2, 0)) / n, spread = n > 1 ? Math.sqrt(rows.reduce((t, r) => t + (r.vsFair - m) ** 2, 0) / (n - 1) / n) : own;
    const se = Math.max(own, spread), E = b > 0 ? m / b : null, f = E != null ? E / N : null;
    out.groups[k] = { n, meanVsFair: +m.toFixed(5), se: +se.toFixed(5), z: +(m / se).toFixed(2), meanN: +N.toFixed(2), excessPoints: E != null ? +E.toFixed(2) : null, share: f != null ? +f.toFixed(3) : null,
      cap2Tighter: f != null ? +(1 - (1 - f) ** 2).toFixed(3) : null, cards: rows.map(r => ({ id: r.id, rarity: r.rarity, cost: r.cost, wait: r.wait, stats: r.attack + '/' + r.health, N: r.N, vsFair: r.vsFair, z: r.z })) }; });
  // the tempo term: T's excess over the control's (the part the Rarity term adds) and over R's (the part Lumber 0 / Wait <= 1 adds at Rare)
  const G = out.groups, diff = (a, c) => G[a] && G[c] ? { m: +(G[a].meanVsFair - G[c].meanVsFair).toFixed(5), se: +Math.sqrt(G[a].se ** 2 + G[c].se ** 2).toFixed(5) } : null;
  out.tVsR = diff('T', 'R'); out.tVsC = diff('T', 'C');
  if (out.tVsR && b > 0) { const f = out.tVsR.m / b / G.T.meanN, fl = (out.tVsR.m - 1.96 * out.tVsR.se) / b / G.T.meanN, fh = (out.tVsR.m + 1.96 * out.tVsR.se) / b / G.T.meanN;
    out.tempo = { share: +f.toFixed(3), shareLo: +fl.toFixed(3), shareHi: +fh.toFixed(3), cap2Tighter: +(1 - (1 - f) ** 2).toFixed(3), cap2TighterLo: +(1 - (1 - Math.max(0, fl)) ** 2).toFixed(3), cap2TighterHi: +(1 - (1 - fh) ** 2).toFixed(3),
      why: 'T (Rare+, Lumber 0, Wait <= 1) minus R (Rare+ that pay Lumber or wait 2+), in fair-line points a copy / the slope / T\'s mean N' }; }
  const f = path.join(ROOT, 'docs', 'balance', 'bal12', 'tempo-cap2-2026-11-02.json'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(out, null, 1) + '\n');
  const md = ['# 0-Lumber Rares against the fair line (BAL12, 2026-11-02)', '', `From \`${out.from}\` (${res.context.name}, ${res.context.fights} fights a card, ${res.context.copies} copies; fair line per copy = ${res.fairLine.intercept} + ${res.fairLine.perN} x N).`, '',
    '| Group | Cards | Mean vs fair (a copy) | se | z | Mean N | Excess (budget points) | Share of N | Cap 2 tighter by |', '|---|---|---|---|---|---|---|---|---|',
    ...Object.entries(G).map(([k, x]) => `| ${k} | ${x.n} | ${(x.meanVsFair * 100).toFixed(2)} | ${(x.se * 100).toFixed(2)} | ${x.z} | ${x.meanN} | ${x.excessPoints} | ${x.share} | ${x.cap2Tighter} |`), '',
    out.tempo ? `T minus R: ${(out.tVsR.m * 100).toFixed(2)} ± ${(1.96 * out.tVsR.se * 100).toFixed(2)} points a copy = a share ${out.tempo.share} [${out.tempo.shareLo}, ${out.tempo.shareHi}] of N: cap 2 tighter by ${out.tempo.cap2Tighter} [${out.tempo.cap2TighterLo}, ${out.tempo.cap2TighterHi}].` : '', '',
    'T0 / T1: Rare and up at Lumber 0, Wait 0 / 1. C: Common / Uncommon at Lumber 0, Wait 0-1. R: Rare and up paying Lumber or waiting 2+. O: the rest.', '',
    '## The T cards', '', '| Card | Rarity | Lumber | Wait | A/H | N | vs fair | z |', '|---|---|---|---|---|---|---|---|', ...T.map(r => `| ${r.id} | ${r.rarity} | ${r.cost} | ${r.wait} | ${r.attack}/${r.health} | ${r.N} | ${(r.vsFair * 100).toFixed(2)} | ${r.z} |`), ''];
  fs.writeFileSync(f.replace(/\.json$/, '.md'), md.join('\n'));
  Object.entries(G).forEach(([k, x]) => console.log(`${k.padEnd(3)} n ${String(x.n).padStart(3)}  vs fair ${(x.meanVsFair * 100).toFixed(2)} ± ${(x.se * 196).toFixed(2)}  N ${x.meanN}  share ${x.share}`));
  if (out.tempo) console.log('tempo (T - R):', JSON.stringify(out.tempo));
  console.log('->', path.relative(ROOT, f));
  process.exit(0);
}
if (cmd === 'pool') {
  // 2026-11-02: the contribution runs on file (the global SKILL2 run and BAL11's hard maps), each read as `analyse` reads one, the T - R share
  // of N pooled over the files by inverse variance (the machine was shared; a fresh global run at bramble 15 ran at 1 game/s and was stopped)
  const files = process.argv.slice(3), per = [];
  files.forEach(f => { const res = JSON.parse(fs.readFileSync(f, 'utf8')), b = res.fairLine.perN, g = {};
    res.cards.forEach(r => { const c = by[r.id]; if (!c) return; const k = groupOf(c); (g[k] = g[k] || []).push(r); }); g.T = (g.T0 || []).concat(g.T1 || []);
    const st = rows => { const n = rows.length, m = rows.reduce((t, r) => t + r.vsFair, 0) / n, own = Math.sqrt(rows.reduce((t, r) => t + (r.se / res.context.copies) ** 2, 0)) / n,
      sp = n > 1 ? Math.sqrt(rows.reduce((t, r) => t + (r.vsFair - m) ** 2, 0) / (n - 1) / n) : own; return { n, m, se: Math.max(own, sp), N: rows.reduce((t, r) => t + r.N, 0) / n }; };
    if (!(g.T && g.T.length) || !(g.R && g.R.length >= 2)) { per.push({ file: path.relative(ROOT, f), skipped: `T ${(g.T || []).length}, R ${(g.R || []).length}` }); return; }
    // the fair line's slope a point of N is negative in these runs (a card's N rises with its Lumber and its map, and random decks play costly
    // cards less), so the excess is read in stat points instead: the stat yardstick a copy (the canon check's 3A + H point: 3.59 win-rate points
    // for 6 copies at 30 Health, docs/balance/skill-canon-check-2026-10-31-skill2-before.json; 3.00 at 15, docs/balance/bal12/), over T's mean
    // stat points 3A + H as printed
    const yard = ((res.context.name || '').includes('-b15') ? 0.0300 : 0.0359) / (res.context.copies || 6), pts = rows => rows.reduce((t, r) => t + 3 * (+r.attack || 0) + (+r.health || 0), 0) / rows.length;
    const T = st(g.T), R = st(g.R), d = T.m - R.m, se = Math.sqrt(T.se ** 2 + R.se ** 2), TP = pts(g.T);
    per.push({ file: path.relative(ROOT, f), context: res.context.name, fights: res.context.fights, slope: b, T: { n: T.n, vsFair: +T.m.toFixed(4), se: +T.se.toFixed(4), N: +T.N.toFixed(2), cards: g.T.map(r => r.id) }, R: { n: R.n, vsFair: +R.m.toFixed(4), se: +R.se.toFixed(4) },
      statPoints: +TP.toFixed(2), excessPoints: +(d / yard).toFixed(2), share: +(d / yard / TP).toFixed(4), shareSE: +(se / yard / TP).toFixed(4) }); });
  const use = per.filter(p => p.share != null), W = use.reduce((t, p) => t + 1 / p.shareSE ** 2, 0), f = use.reduce((t, p) => t + p.share / p.shareSE ** 2, 0) / W, fse = Math.sqrt(1 / W);
  const t = 1 - (1 - f) ** 2, out = { tool: 'tools/bal12/tempo_cap2_2026_11_02.js pool', generated: new Date().toISOString(), files: per, pooled: { share: +f.toFixed(4), se: +fse.toFixed(4), lo: +(f - 1.96 * fse).toFixed(4), hi: +(f + 1.96 * fse).toFixed(4), cap2Tighter: +t.toFixed(4), cap2TighterLo: +(1 - (1 - Math.max(0, f - 1.96 * fse)) ** 2).toFixed(4), cap2TighterHi: +(1 - (1 - (f + 1.96 * fse)) ** 2).toFixed(4) },
    why: 'T = Rare+, Lumber 0, Wait <= 1 (current cards.json rarities); R = Rare+ that pay Lumber or wait 2+; share = (T - R distance from the fair line, a copy) / the stat yardstick a copy / T\'s mean 3A + H; cap 2 tighter by 1 - (1 - share)^2' };
  const fo = path.join(ROOT, 'docs', 'balance', 'bal12', 'tempo-cap2-2026-11-02.json'); fs.mkdirSync(path.dirname(fo), { recursive: true }); fs.writeFileSync(fo, JSON.stringify(out, null, 1) + '\n');
  const md = ['# 0-Lumber Rares against the fair line (BAL12, 2026-11-02)', '', out.why + '.', '', '| Run | Fights | T cards | T vs fair (a copy) | R cards | R vs fair | Share of N (se) |', '|---|---|---|---|---|---|---|',
    ...per.map(p => p.share == null ? `| ${p.file} | | skipped (${p.skipped}) | | | | |` : `| ${p.context} | ${p.fights} | ${p.T.n} (${p.T.cards.join(', ')}) | ${(p.T.vsFair * 100).toFixed(2)} | ${p.R.n} | ${(p.R.vsFair * 100).toFixed(2)} | ${p.share} (${p.shareSE}) |`), '',
    `Pooled (inverse variance): share ${out.pooled.share} [${out.pooled.lo}, ${out.pooled.hi}] of N, so cap 2 tighter by ${out.pooled.cap2Tighter} [${out.pooled.cap2TighterLo}, ${out.pooled.cap2TighterHi}].`, ''];
  fs.writeFileSync(fo.replace(/\.json$/, '.md'), md.join('\n'));
  per.forEach(p => console.log(p.share == null ? `${p.file}: skipped (${p.skipped})` : `${p.context.padEnd(22)} T ${p.T.n} ${(p.T.vsFair * 100).toFixed(2)}  R ${p.R.n} ${(p.R.vsFair * 100).toFixed(2)}  share ${p.share} (se ${p.shareSE})`));
  console.log('pooled', JSON.stringify(out.pooled), '->', path.relative(ROOT, fo)); process.exit(0);
}
console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 12).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
