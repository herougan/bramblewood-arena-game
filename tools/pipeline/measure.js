'use strict';
// SPEED1 (2026-10-31): the `measure` step. Wraps tools/skill_canon_2026_10_31.js (the measure) with the plan of tools/skill2_measure_2026_10_31.js.
//   run.sh measure [--skills a,b=3,armor=4] [--map N] [--only plan,keys] [--minutes M] [--fights 200,400,700,1000] [--report] [--force]
// --skills: `id` = every plan item of that skill; `id=N` = that item, and when no in-play card carries it, an ad hoc item (Armor 4, 5).
// --map N: the skills on map N's own context (its pool, fields and level; tools/bench), stored apart from the global ones.
// Early stopping (new): each item is played in stages of fights (200, 400, 700, 1000); after each the 95% interval of its worth is read and the
// item stops when it is as narrow as `high` confidence in the price tool (config.json measure). The bench cache keeps every fight played, so a
// later stage plays only the fights it adds, and an item whose result is on file for the same game (fingerprint) is not played again.
// Results: docs/balance/pipeline/measures.json, key "<global|mapN>|<plan key>", the same fields as docs/balance/skill2-measures-2026-10-31.json.
const fs = require('fs'), path = require('path');
const P = require('./lib.js');
const STORE = path.join(P.OUTDIR, 'measures.json');

function itemsFor(plan, args) {
  const out = [], seen = new Set(), add = it => { if (!seen.has(it.key)) { seen.add(it.key); out.push(it); } };
  if (args.skills) {
    String(args.skills).split(',').map(s => s.trim()).filter(Boolean).forEach(tok => {
      const [id, n] = tok.split('='), hit = plan.filter(it => it.kind !== 'skip' && (n == null ? it.id === id : (it.key === tok || (it.id === id && String(it.n) === n && !it.pair))));
      if (hit.length) hit.forEach(add);
      else if (n != null) { const v = isNaN(+n) ? n : +n; add({ key: tok, id, class: 'keyword', kind: 'measure', n: v, nCards: 0, cards: [], test: { [id]: v }, adhoc: true }); }
      else throw new Error(`measure: skill '${tok}' is not on an in-play card (give id=N to measure it anyway)`);
    });
  } else {
    const only = args.only ? String(args.only).split(',') : null;
    plan.filter(it => (it.kind === 'measure' || (args.report && it.kind === 'report')) && (!only || only.includes(it.key))).forEach(add);
  }
  return out;
}
// the carriers' mean (attackWeight x Attack + Health): the stat terms a half-miss multiplier acts on (price.js reads it)
function statBaseOf(res) { const cards = P.readJson(path.join(P.ROOT, 'canonical', 'cards.json')), by = {}; cards.forEach(c => { by[c.id] = c; });
  const v = (res.carriers || []).map(id => by[id]).filter(Boolean).map(c => (res.attackWeight || 3) * (c.attack || 0) + (c.health || 0)); return v.length ? P.r2(v.reduce((a, b) => a + b, 0) / v.length) : null; }
const seOf = w => (w.hi - w.lo) / 3.92;
function converged(w, cfg) { return seOf(w) <= Math.max(cfg.seLow, cfg.seRel * Math.abs(w.m)); }

async function step(args, S) {
  const SM = require('../skill2_measure_2026_10_31.js'), C = require('../skill_canon_2026_10_31.js'), L = require('../bench/lib.js');
  const cfg = P.CONFIG.measure, stages = args.fights ? String(args.fights).split(',').map(Number) : cfg.stages, maxF = stages[stages.length - 1];
  const ctx = args.map != null ? 'map' + args.map : 'global', cacheDir = args['cache-dir'] || path.join(P.ROOT, 'tests', 'out', 'skill2-cache');
  const fp = L.fingerprint(), plan = SM.buildPlan(), items = itemsFor(plan, args), store = P.readJson(STORE, { _about: 'SPEED1 pipeline measures (tools/pipeline/measure.js): key "<ctx>|<plan key>"', results: {} });
  const skill2 = ctx === 'global' ? P.readJson(SM.OUT, { results: {} }).results : {};
  S.inputs = { context: ctx, fingerprint: fp, stages, cacheDir: path.relative(P.ROOT, cacheDir), maxFights: maxF, items: items.map(i => i.key) };
  const t0 = Date.now(), budgetMin = args.minutes != null ? +args.minutes : Infinity;
  let reused = 0, measured = 0, early = 0, saved = 0, left = 0;
  for (const it of items) {
    const key = ctx + '|' + it.key, have = store.results[key], s2 = skill2[it.key];
    const ok = r => r && r.fingerprint === fp && !args.force && (r.converged || r.fights >= maxF);
    if (ok(have)) { reused++; S.cached.hits++; continue; }
    if (s2 && s2.fingerprint === fp && !args.force && s2.fights >= stages[1]) { reused++; S.cached.hits++; S.notes.push(it.key + ': reused the SKILL2 measure (same game)'); continue; }
    if ((Date.now() - t0) / 60000 > budgetMin) { left++; continue; }
    const s0 = Date.now(), trail = []; let res = null, conv = false;
    for (const M of stages) {
      res = await C.run(Object.assign(L.defaults(), { cmd: 'measure', test: it.test, games: M, cacheDir, workers: 2, quiet: true, map: args.map != null ? String(args.map) : null }));
      const w = res.test.worthRuler; trail.push({ fights: M, m: w.m, lo: w.lo, hi: w.hi }); conv = converged(w, cfg);
      if (conv) break;
    }
    const used = trail[trail.length - 1].fights; if (conv && used < maxF) { early++; saved += maxF - used; }
    const prev = have ? have.test.worthRuler : null, t = res.test;
    store.results[key] = { key: it.key, ctx, id: it.id, class: it.class, kind: it.kind, n: it.n, nCards: it.nCards, cards: it.cards, fights: used, converged: conv, stages: trail, fingerprint: res.fingerprint,
      canonRate: res.canonRate, statRate: res.statRate, kappa: res.kappa, placebo: res.placebo || null, test: res.test, statBase: statBaseOf(res), measuredAt: new Date().toISOString(), seconds: Math.round((Date.now() - s0) / 1000) };
    P.writeJson(STORE, store); measured++; S.cached.played++;
    S.changed.push({ id: it.key, field: 'worth', old: prev ? `${prev.m}` : '-', new: `${t.worthRuler.m} [${t.worthRuler.lo}, ${t.worthRuler.hi}] at ${used} fights, price on carriers ${t.price}` });
    if (!conv) S.flagged.push({ id: it.key, why: `interval still wide at ${used} fights (se ${P.r2(seOf(t.worthRuler))}); measure again with --fights ${used},${used * 2}` });
    else if (Math.abs(t.net) >= 1 && t.verdict !== 'within its interval') S.flagged.push({ id: it.key, why: `${t.verdict}: worth ${t.worthRuler.m} against ${t.price} on the carriers` });
  }
  S.files.push(path.relative(P.ROOT, STORE));
  S.counts = { items: items.length, measured, reused, 'stopped early': early, 'fights saved': saved, 'left (--minutes)': left };
  if (left) S.status = 'partial', S.notes.push(`${left} item(s) left: run the same command again`);
}
module.exports = { step, STORE, itemsFor, converged };
