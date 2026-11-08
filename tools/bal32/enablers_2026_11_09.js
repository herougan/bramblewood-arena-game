#!/usr/bin/env node
// 2026-11-09 (package BAL32, owner BAL31-3: "assume there's some chance of the partner happening. e.g. if Brittle is 5.0 when there's
// something that pairs with it - and that thing appears in 5% of decks, then Brittle is 0.25"): the gain each enabler gives with its natural
// partner, measured the BAL31 on-hit way (tools/bal31/common.js: War Hound bodies at their budget, Levels 1 and 5, three bodies a level, the
// placebo once a key, the ladder's canon rate), in the BAL29 unit (the mean over bodies, averaged over L1 and L5). The additivity run
// (docs/balance/bal31/additivity-2026-11-08.json) has none of these pairs, so each is measured here:
//   - partner on the same card (own-side partners): gain = worth(enabler + partner) - worth(partner)
//       detonate on + poison 1 (Bogfire Newt's own pair), brittle 2 + shatter 2 (Shatter is on one card: Walrus Icebreaker),
//       hemorrhage on + bleed 1;
//   - partner in the decks (a context whose card pool is only the partner's carriers, so both decks are full of it): gain = worth(enabler)
//       there. pry 1 / pulverise on against Armor carriers, web 1 against dodgers (Evasive, Swift, Flying, Prey), hemorrhage on among Bleed
//       carriers (its allies' Bleed).
// Disarm (foe equipment) and Expose (+1 on the target's next N hits from anyone: every deck is its partner) are not measured here: the bench
// fields no equipment, and Expose's single worth already holds its partners (see docs/balance/bal32/enablers-2026-11-09.md).
//   node tools/bal32/enablers_2026_11_09.js run [--games 400] [--workers 2]    play (resumable; the singles and bodies come from BAL31's cache)
//   node tools/bal32/enablers_2026_11_09.js summary                             -> docs/balance/bal32/enabler-gains-2026-11-09.json
// Measurement only: nothing is written to canonical/.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const C = require('../bal31/common.js'), ROOT = C.ROOT, OUT = path.join(ROOT, 'docs', 'balance', 'bal32');
const VERSION = '1.0.0 (2026-11-09, BAL32)', MAX_BODIES = 8;
const SAME = [
  { id: 'detonate', eff: { detonate: true }, partner: { poison: 1 }, label: 'Detonate + Poison 1 (same card)' },
  { id: 'brittle', eff: { brittle: 2 }, partner: { shatter: 2 }, label: 'Brittle 2 + Shatter 2 (same card)' },
  { id: 'hemorrhage', eff: { hemorrhage: true }, partner: { bleed: 1 }, label: 'Hemorrhage + Bleed 1 (same card)' },
];
const POOLS = [
  { ctx: 'armor', test: e => (+e.armor || 0) > 0, items: [{ id: 'pry', eff: { pry: 1 }, label: 'Pry 1 among Armor carriers' }, { id: 'pulverise', eff: { pulverise: true }, label: 'Pulverise among Armor carriers' }] },
  { ctx: 'dodge', test: e => !!(e.evasive || e.swift || e.flying || e.prey), items: [{ id: 'web', eff: { web: 1 }, label: 'Web 1 among dodgers (Evasive, Swift, Flying, Prey)' }] },
  { ctx: 'bleed', test: e => (+e.bleed || 0) > 0 || e.bleed === true, items: [{ id: 'hemorrhage', eff: { hemorrhage: true }, label: 'Hemorrhage among Bleed carriers' }] },
];
function poolOf(test) {
  const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js')), CT = require(path.join(ROOT, 'tools', 'balance', 'contribution.js'));
  const gm = { D: LB.CARD_DEFS_BASELINE, G: LB.G }, flat = e => BB.XP ? BB.XP(e || {}) : (e || {});
  return Object.keys(gm.D).filter(id => { try { return CT.fieldable ? CT.fieldable(gm, id) && test(flat(gm.D[id].effects)) : test(flat(gm.D[id].effects)); } catch (e) { return false; } }).sort();
}
// tools/bal31/common.js bench with a card pool: its bench() sets pool: null for every context, so a pool context would replay the global
// one. Same code otherwise (the base's levelled stats and budget, the variant builder), the pool passed through to the bench context.
function benchPool(o, pool) {
  if (!pool) return C.bench(o);
  const K = C.bench(Object.assign({}, o, { levels: [] })), L = K.L, B = K.B, gm = K.gm, defs = gm.G.referenceBaseDefs(), lv = K.lv;
  o.levels.forEach(Lv => {
    const X = B.context(L.csOf(Object.assign({}, o, { level: Lv, bramble: C.BRAMBLE, map: null, pool })));
    const m = L.O.mineFor(gm, defs, { [C.BASE]: 1 }, Lv), s = defs[Object.keys(m)[0]];
    const N = L.budgetOf(Object.assign({}, gm.D[C.BASE], { attack: s.attack, health: s.health }), Lv).N;
    lv[Lv] = { X, a0: s.attack, h0: s.health, N, Bud: Math.round(N) };
  });
  return K;
}
function bodiesFor(K, Lv) { const all = C.LAD.bodiesOf(K.lv[Lv].Bud, 'onhit', MAX_BODIES), mid = all[Math.floor((all.length - 1) / 2)]; return [all[0], mid, all[all.length - 1]]; }
async function main(argv) {
  const o = C.parse(argv, { games: 400, levels: [1, 5], cacheDir: path.join(os.homedir(), '.cache', 'bramble-bal31'), boot: 300 }), M = o.games;
  if (o.cmd === 'help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 19).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const ctxs = [{ ctx: 'global', pool: null, items: SAME }].concat(POOLS.map(p => ({ ctx: p.ctx, pool: poolOf(p.test), items: p.items })));
  const out = { tool: 'tools/bal32/enablers_2026_11_09.js ' + VERSION, generated: new Date().toISOString(), games: M, levels: o.levels, unit: 'mean over bodies, averaged over L1 and L5 (BAL29), in 3A + H points', rows: [] };
  for (const c of ctxs) {
    if (c.pool && c.pool.length < 8) { console.log(`context ${c.ctx}: only ${c.pool.length} cards, skipped`); continue; }
    const K = benchPool(Object.assign({}, o, o.cmd === "summary" ? { workers: 0 } : {}), c.pool);
    try {
      if (o.cmd === 'run') {
        for (const Lv of o.levels) { const bs = bodiesFor(K, Lv), its = C.statVariants(K, Lv, bs);
          c.items.forEach(x => bs.forEach(b => { its.push({ v: K.variant(Lv, b, x.eff) }); if (x.partner) { its.push({ v: K.variant(Lv, b, x.partner) }, { v: K.variant(Lv, b, Object.assign({}, x.eff, x.partner)) }); } }));
          const n = await K.B.need(K.lv[Lv].X, its, M); K.B.log(`[${c.ctx}${c.pool ? ' (' + c.pool.length + ' cards)' : ''}] L${Lv}: ${n} games played`); }
      } else if (o.cmd === 'summary') {
        c.items.forEach(x => { const row = { id: x.id, label: x.label, ctx: c.ctx, poolSize: c.pool ? c.pool.length : null, levels: {} }; let ok = true;
          o.levels.forEach(Lv => { const bs = bodiesFor(K, Lv), rl = C.ladderRate(Lv), rate = rl ? rl.r : C.statRate(K, Lv, M, bs), boots = C.bootIdx(M, o.boot, 'bal32|' + Lv + '|' + M);
            const ga = C.gainsOf(K, Lv, x.partner ? Object.assign({}, x.eff, x.partner) : x.eff, M, bs), gp = x.partner ? C.gainsOf(K, Lv, x.partner, M, bs) : null;
            if (!ga || (x.partner && !gp) || !rate) { ok = false; return; }
            // gain a fight on each body: (enabler + partner) - partner (the placebo is in each: 2 keys less 1 key = one placebo off)
            const G = ga.map((z, j) => { const g = new Float64Array(M); for (let i = 0; i < M; i++) g[i] = z.g[i] - (gp ? gp[j].g[i] : 0); return { body: z.body, g, wr0: z.wr0, wr1: z.wr1 }; });
            const m = C.LAD.measure(G, rate, boots), ms = gp ? C.LAD.measure(C.gainsOf(K, Lv, x.eff, M, bs) || G, rate, boots) : null;
            row.levels['L' + Lv] = { mean: m.mean, best: m.best, bodies: m.bodies, alone: ms ? ms.mean : null }; });
          if (!ok) { console.log(`${x.label}: not played yet`); return; }
          row.gain = C.r2((row.levels.L1.mean.m + row.levels.L5.mean.m) / 2); row.gainLo = C.r2((row.levels.L1.mean.lo + row.levels.L5.mean.lo) / 2); row.gainHi = C.r2((row.levels.L1.mean.hi + row.levels.L5.mean.hi) / 2);
          if (row.levels.L1.alone) row.alone = C.r2((row.levels.L1.alone.m + row.levels.L5.alone.m) / 2);
          out.rows.push(row); console.log(`${x.label}: gain ${row.gain} [${row.gainLo}, ${row.gainHi}]${row.alone != null ? ' (alone ' + row.alone + ')' : ''}`); });
      }
    } finally { K.B.close(); }
  }
  if (o.cmd === 'summary') { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'enabler-gains-2026-11-09.json'), JSON.stringify(out, null, 1) + '\n'); console.log('-> docs/balance/bal32/enabler-gains-2026-11-09.json'); }
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
