#!/usr/bin/env node
// 2026-11-08 (package BAL31, owner 17:22: "You can also run more variants of skill budgeting experiments. e.g. OnHit + various effects."):
// every on-hit rider the engine supports, each at N = 1 .. 3, on the skill ladder's bodies at Levels 1 and 5, so each rider gets its own price.
//
//   node tools/bal31/onhit_2026_11_08.js plan                 the riders, their numbers and the time (no games)
//   node tools/bal31/onhit_2026_11_08.js run [--hours 1.5]    play them (resumable from the cache)
//   node tools/bal31/onhit_2026_11_08.js summary              -> docs/balance/bal31/onhit-2026-11-08.{json,md}
// Options: --games 400 (the ladder's), --levels 1,5, --workers 2, --cache-dir (default ~/.cache/bramble-bal31), --only a,b, --boot 300.
//
// The riders: canonical/skill-delivery.json `rides` = melee (carried by every melee hit: the swing and melee skill hits) and priced in
// canonical/skill-costs.json. Left out: the `any` riders (Crit, Mighty, Executioner, Hunter, King Slayer, Predator, Shatter, Feeble,
// Sunder: damage modifiers or equipment, not an effect put on the target), the `swing` ones (an attack shape: Wave, Swipe, Chain
// Lightning ...) and the `ranged` ones. A rider the cost table prices `fixed` or that cards print only as on is measured once (on); Leech
// (sap) both on (heals the damage dealt) and N (heals N). The status riders cards print as {chance, duration} (Freeze, Sleep, Stagger,
// Blind, Confuse, Paralyze, Shock, Tipsy) are measured at chance 50, duration N.
// The method is the ladder's (tools/skill_ladder_2026_11_07.js): War Hound bodies re-statted at its budget (L1 3A + H = 23, L5 27), paired
// fights, the placebo once a key, worth / the anchors' canon rate at that level, the price = the maximum of a quadratic through worth
// against attack share (through 3 bodies: the parabola through them, its maximum inside the range); mean over bodies beside it; a value x
// N^pow line per level. Bodies: Attack 1, the middle and the most (L1 1/20 4/11 7/2, L5 1/24 4/15 8/3), not the ladder's every spread
// (7 / 8): cut for time on shared cores (2026-11-08); --bodies all restores the ladder's set. Nothing is written to canonical/.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const C = require('./common.js'), ROOT = C.ROOT, OUT = path.join(ROOT, 'docs', 'balance', 'bal31');
const VERSION = '1.0.0 (2026-11-08, BAL31)', SPEED = 85, NS = [1, 2, 3], MAX_BODIES = 8;
const STATUS = new Set(['freeze', 'sleep', 'stagger', 'blind', 'confuse', 'paralyze', 'shock', 'tipsy']);

function ridersOf(only) {
  const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), del = J('canonical/skill-delivery.json'), table = J('canonical/skill-costs.json');
  const sk = new Map((table.skills || []).map(e => [e.id, e])), printed = {};
  J('canonical/cards.json').forEach(c => Object.entries(c.effects || {}).forEach(([k, v]) => { (printed[k] = printed[k] || new Set()).add(typeof v); }));
  const out = [];
  Object.entries(del.rides || {}).forEach(([k, r]) => { if (r !== 'melee' || !sk.has(k)) return; if (only && !only.includes(k)) return;
    const e = sk.get(k), pr = printed[k] || new Set(), flag = e.scale === 'fixed' || (pr.size && [...pr].every(t => t === 'boolean'));
    let pts;
    if (STATUS.has(k)) pts = NS.map(n => ({ n, v: { chance: 50, duration: n } }));
    else if (k === 'sap') pts = [{ n: true, v: true }].concat(NS.map(n => ({ n, v: n })));
    else if (flag) pts = [{ n: true, v: true }];
    else pts = NS.map(n => ({ n, v: n }));
    out.push({ key: k, scale: e.scale, value: e.value, cards: 0, pts }); });
  return out.sort((a, b) => a.key < b.key ? -1 : 1);
}
const nStr = n => n === true ? 'on' : String(n);
async function main(argv) {
  const o = C.parse(argv, { games: 400, levels: [1, 5], cacheDir: path.join(os.homedir(), '.cache', 'bramble-bal31'), boot: 300 }), M = o.games;
  o.allBodies = !!(o.bodyAs && isNaN(o.bodyAs[0])); // --bodies all
  if (o.cmd === 'help' || o.cmd === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 22).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const R = ridersOf(o.only), K = C.bench(Object.assign({}, o, o.cmd === 'plan' ? { workers: 0 } : {}));
  const bodies = Lv => { const all = C.LAD.bodiesOf(K.lv[Lv].Bud, 'onhit', MAX_BODIES); if (o.allBodies) return all;
    const mid = all[Math.floor((all.length - 1) / 2)]; return [all[0], mid, all[all.length - 1]]; };
  try {
    if (o.cmd === 'plan') {
      console.log(`${R.length} riders: ` + R.map(r => `${r.key} ${r.pts.map(p => nStr(p.n)).join('/')}`).join('; '));
      let tot = 0; o.levels.forEach(Lv => { const v = bodies(Lv).length * (4 + R.reduce((s, r) => s + r.pts.length, 0)); tot += v * M; console.log(`Level ${Lv}: bodies 3A + H = ${K.lv[Lv].Bud} (${bodies(Lv).map(b => b.A + '/' + b.H).join(' ')}), ${v} variants x ${M} = ${v * M} games`); });
      console.log(`total ${tot} games, about ${(tot / SPEED / 3600).toFixed(1)} h at ${SPEED} games/s (2 workers, idle machine); cache ${o.cacheDir}`); return;
    }
    if (o.cmd === 'run') {
      const t0 = Date.now(), late = () => o.hours && (Date.now() - t0) / 3600000 >= o.hours;
      K.B.log(`BAL31 on-hit riders ${VERSION}: ${R.length} riders, Levels ${o.levels.join(', ')}, ${M} fights; cache ${o.cacheDir}${o.hours ? '; stops starting new work after ' + o.hours + ' h' : ''}`);
      for (const Lv of o.levels) await K.B.need(K.lv[Lv].X, C.statVariants(K, Lv, bodies(Lv)), M);
      let k = 0; for (const r of R) { k++; if (late()) { K.B.log(`time is up (${o.hours} h): stopped before ${r.key}; re-run the same command to go on`); return; }
        for (const Lv of o.levels) { const its = []; r.pts.forEach(p => bodies(Lv).forEach(b => its.push({ v: K.variant(Lv, b, { [r.key]: p.v }) })));
          const n = await K.B.need(K.lv[Lv].X, its, M); if (n) K.B.log(`[${k}/${R.length}, ${Math.round((Date.now() - t0) / 60000)} min] L${Lv} ${r.key}: ${n} games`); } }
      K.B.log('done; now: node tools/bal31/onhit_2026_11_08.js summary');
    } else if (o.cmd === 'summary') summary(o, K, R, bodies, M);
    else throw new Error('unknown command ' + o.cmd);
  } finally { K.B.close(); }
}
function summary(o, K, R, bodies, M) {
  const { T } = K.L.costs(), out = { tool: 'tools/bal31/onhit_2026_11_08.js ' + VERSION, generated: new Date().toISOString(), fingerprint: K.L.fingerprint(), games: M, levels: {}, riders: [] }, rates = {}, boots = {};
  o.levels.forEach(Lv => { const r = C.ladderRate(Lv), st = C.statRate(K, Lv, M, bodies(Lv)); rates[Lv] = r ? r.r : st; boots[Lv] = C.bootIdx(M, o.boot, 'onhit|' + Lv + '|' + M);
    out.levels['L' + Lv] = { budget: K.lv[Lv].Bud, bodies: bodies(Lv).map(b => b.A + '/' + b.H).join(' '), rate: C.r2(rates[Lv] * 100), rateFrom: r ? r.from : 'the stat yardstick on the bodies', statRateOnBodies: C.r2(st == null ? null : st * 100) }; });
  R.forEach(r => { const row = { key: r.key, scale: r.scale, points: [], fit: {} };
    r.pts.forEach(p => { const pt = { n: p.n, v: p.v, price: null };
      try { pt.price = C.r2(T.skillCost(r.key, p.v)); } catch (e) { pt.price = null; }
      o.levels.forEach(Lv => { const G = C.gainsOf(K, Lv, { [r.key]: p.v }, M, bodies(Lv)); if (!G || !rates[Lv]) return; const m = C.LAD.measure(G, rates[Lv], boots[Lv]);
        pt['L' + Lv] = { best: m.best, mean: m.mean, raw: m.raw, rawBody: m.rawBody, spread: m.spread, flag85: m.flag85, bodies: m.bodies }; });
      row.points.push(pt); });
    o.levels.forEach(Lv => { const f = C.LAD.fitPow(row.points.filter(x => x['L' + Lv] && typeof x.n === 'number').map(x => ({ n: x.n, m: x['L' + Lv].best.m, se: (x['L' + Lv].best.hi - x['L' + Lv].best.lo) / 3.92 }))); if (f) row.fit['L' + Lv] = f; });
    // the simple price: the larger of the two levels' best, per N; a per-N slope through the origin (least squares) for the numbered ones
    row.points.forEach(x => { const v = o.levels.map(Lv => x['L' + Lv] && x['L' + Lv].best.m).filter(v => v != null); x.simple = v.length ? Math.max(...v) : null; });
    const num = row.points.filter(x => typeof x.n === 'number' && x.simple != null); if (num.length >= 2) { const sxy = num.reduce((s, x) => s + x.n * x.simple, 0), sxx = num.reduce((s, x) => s + x.n * x.n, 0); row.perN = C.r2(sxy / sxx); }
    out.riders.push(row); });
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'onhit-2026-11-08.json'), JSON.stringify(out, null, 1) + '\n'); fs.writeFileSync(path.join(OUT, 'onhit-2026-11-08.md'), md(out, o.levels));
  console.log(md(out, o.levels)); console.log('-> docs/balance/bal31/onhit-2026-11-08.{json,md}');
}
const ci = e => e ? `${e.m} [${e.lo}, ${e.hi}]` : '-';
function md(out, levels) {
  const Ls = levels.map(l => 'L' + l), L = [`# On-hit riders, ${out.generated.slice(0, 10)} (package BAL31)`, '',
    `\`${out.tool}\`; fingerprint \`${out.fingerprint}\`; ${out.games} paired fights a variant; the skill ladder's bodies and method; brambles 15, the global context. Worth in 3A + H points. Measurement only: no price changed.`, ''];
  Ls.forEach(l => { const x = out.levels[l]; L.push(`- ${l}: bodies 3A + H = ${x.budget} (${x.bodies}); rate ${x.rate} win-rate points a point (${x.rateFrom}); the stat yardstick on these bodies ${x.statRateOnBodies}.`); });
  L.push('', '## Simple price per rider', '', 'Simple = the larger of the L1 / L5 best (the ladder\'s rule: the most it is worth on any body); per N = a line through 0 fitted to the simple prices (numbered riders). Table = the cost table\'s price today. ** = the table is off by more than 1 point and outside both levels\' 95%.', '',
    '| Rider | Table per N (today) | Simple N1 | N2 | N3 | Per N (fit) | Shape (L1 / L5 value×N^pow) |', '|---|---|---|---|---|---|---|');
  out.riders.forEach(r => { const get = n => r.points.find(x => x.n === n), cell = n => { const x = get(n); if (!x || x.simple == null) return '-';
      const off = x.price != null && Math.abs(x.simple - x.price) > 1 && levels.every(Lv => { const m = x['L' + Lv]; return m && (x.price < m.best.lo || x.price > m.best.hi); });
      return (off ? '**' : '') + C.r2(x.simple) + (off ? '**' : '') + ` (${x.price == null ? '-' : x.price})`; };
    const on = get(true); const shape = Ls.map(l => r.fit[l] ? `${r.fit[l].value}×N^${r.fit[l].pow}` : '-').join(' / ');
    L.push(`| ${r.key}${on && r.points.length > 1 ? ' (on: ' + cell(true) + ')' : ''} | ${r.points.map(x => x.price == null ? '-' : x.price).join(' / ')} | ${on && r.points.length === 1 ? cell(true) + ' (on)' : cell(1)} | ${cell(2)} | ${cell(3)} | ${r.perN == null ? '-' : r.perN} | ${shape} |`); });
  L.push('', 'Cells: simple price (the table\'s price at that N).', '', '## Detail (best = the quadratic\'s maximum, 95%; mean over bodies; the best spread A/H)', '',
    `| Rider | N | ${Ls.map(l => `${l} best | ${l} mean | ${l} spread`).join(' | ')} |`, `|---|---|${Ls.map(() => '---|---|---').join('|')}|`);
  out.riders.forEach(r => r.points.forEach((x, i) => L.push(`| ${i ? '' : r.key} | ${nStr(x.n)} | ${Ls.map(l => { const m = x[l]; return m ? `${ci(m.best)}${m.flag85.length ? ' ^' : ''} | ${ci(m.mean)} | ${m.spread.A}/${m.spread.H}` : '- | - | -'; }).join(' | ')} |`)));
  L.push('', '^ = a body over 85% win rate. Status riders (Freeze, Sleep, Stagger, Blind, Confuse, Paralyze, Shock, Tipsy) are at chance 50, duration N; their table price is the cost table read at that object.', '');
  return L.join('\n') + '\n';
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { ridersOf, VERSION };
