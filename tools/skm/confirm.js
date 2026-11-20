#!/usr/bin/env node
// 2026-11-21 (package SKM2): the confirm table for SKM1's flagged combat skills: the pipeline measure at 1,000 fights, the stat-equivalence
// search (E1 Health / E2 Attack on the farm-dog mirror), the carrier x20 (H1) and the new round robin (RR), each against today's price.
// Measurement only: writes docs/balance/skm/confirm-<date>.json, confirm-pipeline-<date>.json and rr-<date>.json and prints the .md's table (the round robin's entrants and pair matrix).
//   nice -n 15 node tools/skm/confirm.js [--date 2026-11-21]
// Each reading is brought to the skill's Maps 0-20 price by its row's own price (as summary.js does) and divided by its method's exchange rate
// (SKM1's median worth / price for E1, E2, H1, cached from summary-2026-11-20.json; the canon anchors' median for RR; 1 for the pipeline,
// whose ruler the prices were set in). A method reads cheap / dear when its value is 25%+ of max(1, |price|) off the price AND its 95%
// interval excludes the price. A flag is confirmed when the pipeline and 2+ of the other three read it the flagged way, and none the other.
'use strict';
const path = require('path'), fs = require('fs');
const S = require('./lib.js'), R = require('./registry.js');
const DIR = path.join(S.ROOT, 'docs', 'balance', 'skm'), RES = path.join(DIR, 'results');
const date = (process.argv.indexOf('--date') > 0 ? process.argv[process.argv.indexOf('--date') + 1] : null) || '2026-11-21';
const FLAGS = { cheap: ['flying', 'diurnal', 'evasive', 'corrode', 'trident', 'pack', 'sleepPowder', 'poisonBarbs', 'poisonPowder', 'dive'],
  dear: ['keenSense', 'parasite', 'pulverise', 'overwhelm', 'offspring', 'repair'] };
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
const readLines = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean) : [];

async function main() {
  const sim = new S.Sim({ workers: 2, quiet: true }), U = S.universe(sim.gm), fp = S.L.fingerprint();
  const skills = FLAGS.cheap.concat(FLAGS.dear), price = s => U.skills[s].price;
  const fit = (p, rp) => rp != null && Math.abs(rp) >= 0.5 && Math.abs(p) >= 0.5 && Math.sign(rp) === Math.sign(p) ? p / rp : 1; // row price -> Maps 0-20 price
  // the pipeline measures (global context, road brambles), per plan item, this game only
  // (a copy of this package's rows is kept in confirm-pipeline-<date>.json, the pipeline's own store being outside the package's files)
  const items = JSON.parse(fs.readFileSync(path.join(DIR, `confirm-items-${date}.json`), 'utf8')), COPY = path.join(DIR, `confirm-pipeline-${date}.json`);
  const all = JSON.parse(fs.readFileSync(path.join(S.ROOT, 'docs', 'balance', 'pipeline', 'measures.json'), 'utf8')).results, mine = {};
  items.concat(['skm2:tide', 'skm2:tide+dive=2']).forEach(k => { const r = all['global|' + k]; if (r && r.fingerprint === fp) mine['global|' + k] = r; });
  const kept = fs.existsSync(COPY) ? JSON.parse(fs.readFileSync(COPY, 'utf8')).results : {}, PM = Object.assign({}, kept, mine);
  fs.writeFileSync(COPY, JSON.stringify({ about: 'Package SKM2: the pipeline measures of the confirm run (run.sh measure --only-file confirm-items / confirm-dive-items --fights 1000), copied from docs/balance/pipeline/measures.json', results: PM }, null, 1) + '\n');
  const pipe = {}; items.forEach(k => { const r = PM['global|' + k]; if (!r || r.fingerprint !== fp) return; const t = r.test, w = t.worthRuler, f = fit(price(r.id), t.price);
    (pipe[r.id] = pipe[r.id] || []).push({ key: k, worth: w.m, lo: w.lo, hi: w.hi, rowPrice: t.price, fights: r.fights, w: w.m * f, h: (w.hi - w.lo) / 2 * Math.abs(f) }); });
  // Dive acts only on a Flying, Tide, Quick or Sprinter unit (engine diveEligible): on the vanilla carriers and the farm-dog it does nothing, so
  // its pipeline reading is Tide + Dive 2 less Tide on the same carriers (confirm-dive-items), its equivalence the Tide body's search (E11)
  // and the round robin has none
  const dA = PM['global|skm2:tide+dive=2'], dB = PM['global|skm2:tide'];
  if (dA && dB && dA.fingerprint === fp && dB.fingerprint === fp) { const a = dA.test, b = dB.test, w = a.worthRuler.m - b.worthRuler.m, h = Math.hypot((a.worthRuler.hi - a.worthRuler.lo) / 2, (b.worthRuler.hi - b.worthRuler.lo) / 2), rp = a.price - b.price, f = fit(price('dive'), rp);
    pipe.dive = [{ key: 'skm2:tide+dive=2 less skm2:tide', worth: w, lo: w - h, hi: w + h, rowPrice: rp, fights: dA.fights, w: w * f, h: h * Math.abs(f) }]; }
  const INACTIVE = { dive: { eq: 'E11-win', rr: 'Dive is inactive on a farm-dog' } };
  // SKM rows (the newest line a skill, this game)
  const rows = id => { const m = new Map(); readLines(path.join(RES, id + '.jsonl')).filter(r => r.fp === fp).forEach(r => m.set(r.skill, r)); return m; };
  const SUM = JSON.parse(fs.readFileSync(path.join(DIR, 'summary-2026-11-20.json'), 'utf8')), scaleOf = id => (SUM.methods.find(m => m.id === id) || {}).scale || 1;
  const sk = {}; ['E1-win', 'E2-win', 'E11-win', 'H1-win', 'H1-margin', 'RR-bt', 'RR-anchored'].forEach(id => { sk[id] = rows(id); });
  const read = (id, s, scale) => { const r = sk[id].get(s); if (!r || r.worth == null) return null; const f = fit(price(s), R.rowPrice(U, id, s, r.carrier));
    const censored = /censored/.test(r.note || ''); return { worth: r.worth * f / scale, ci: r.ci == null ? null : Math.abs(r.ci * f) / scale, M: r.M, censored, raw: r.worth, note: r.note }; };
  // the round robin's own exchange rate: the canon anchors' median RR-bt worth / price (their games are cached; nothing new is played)
  let rr = null, rrScale = 1;
  if (sk['RR-bt'].size) { const M = sk['RR-bt'].values().next().value.M; rr = await R.playRR(sim, M);
    const an = rr.E.filter(e => e.kind === 'anchor').map(e => rr.R.out[e.id].bt / e.price); rrScale = S.median(an);
    fs.writeFileSync(path.join(DIR, `rr-${date}.json`), JSON.stringify({ about: 'Package SKM2 (2026-11-21): the round robin (registry RR-*): 20 farm-dogs a side, each entrant against every other, ' + M + ' fights a pair. Readings in budget points on the farm-dog (row price = price on the farm-dog). score[i][j] = i\'s mean score against j.',
      fingerprint: fp, games: rr.games, M, slope: r2(rr.R.slope), anchorSlope: r2(rr.R.anchorSlope), anchorScale: r2(rrScale),
      entrants: rr.E.map(e => Object.assign({ id: e.id, kind: e.kind, price: r2(e.price), pts: e.pts }, e.kind === 'stat' ? {} : Object.fromEntries(Object.entries(rr.R.out[e.id]).map(([k, v]) => [k, r2(v)])))),
      score: rr.E.map((_, i) => rr.E.map((_, j) => i === j || !rr.G[i][j] ? null : r2(rr.G[i][j].reduce((t, x) => t + x.s, 0) / rr.G[i][j].length))) }) + '\n'); }
  sim.close();
  const verdict = (v, p) => { if (!v || v.worth == null) return null; const b = 0.25 * Math.max(1, Math.abs(p)), c = v.ci == null ? 0 : v.ci;
    if (v.worth > p + b && v.worth - c > p) return 'cheap'; if (v.worth < p - b && v.worth + c < p) return 'dear'; return 'ok'; };
  const out = skills.map(s => {
    const p = price(s), flag = FLAGS.cheap.includes(s) ? 'cheap' : 'dear', P = pipe[s] || [];
    const pv = P.length ? { worth: P.reduce((t, x) => t + x.w, 0) / P.length, ci: Math.sqrt(P.reduce((t, x) => t + x.h * x.h, 0)) / P.length, items: P } : null;
    const X = INACTIVE[s] || {}, e1 = read(X.eq || 'E1-win', s, scaleOf(X.eq || 'E1-win')), e2 = X.eq ? null : read('E2-win', s, scaleOf('E2-win'));
    const eqs = [e1, e2].filter(v => v && !v.censored);
    const eq = eqs.length ? { worth: eqs.reduce((t, v) => t + v.worth, 0) / eqs.length, ci: eqs.every(v => v.ci != null) ? Math.sqrt(eqs.reduce((t, v) => t + v.ci * v.ci, 0)) / eqs.length : null, parts: { E1: e1, E2: e2 } } : (e1 || e2 ? Object.assign({}, e1 || e2, { parts: { E1: e1, E2: e2 } }) : null);
    const h1 = read('H1-win', s, scaleOf('H1-win')) || read('H1-margin', s, scaleOf('H1-margin'));
    const nm = X.rr ? null : read('RR-bt', s, rrScale), anc = X.rr ? null : read('RR-anchored', s, 1);
    const V = { pipeline: verdict(pv, p), equivalence: verdict(eq, p), carrier20: verdict(h1, p), roundRobin: verdict(nm, p) };
    const others = [V.equivalence, V.carrier20, V.roundRobin], opp = flag === 'cheap' ? 'dear' : 'cheap', agree = others.filter(v => v === flag).length, valid = others.filter(v => v != null).length;
    const confirmed = V.pipeline === flag && agree >= Math.min(2, valid) && !others.includes(opp);
    const why = confirmed ? null : V.pipeline == null ? 'no pipeline reading' : V.pipeline !== flag ? `pipeline reads ${V.pipeline === 'ok' ? 'within 25% or its interval' : V.pipeline}` : others.includes(opp) ? 'a method reads the other way' : `only ${agree} of ${valid} other methods agree`;
    return { skill: s, price: r2(p), flag, pipeline: pv && { worth: r2(pv.worth), ci: r2(pv.ci), items: pv.items.map(x => ({ key: x.key, worth: r2(x.worth), lo: r2(x.lo), hi: r2(x.hi), rowPrice: r2(x.rowPrice), fights: x.fights })) },
      equivalence: eq && { worth: r2(eq.worth), ci: r2(eq.ci), [X.eq ? 'E11' : 'E1']: e1 && { worth: r2(e1.worth), ci: r2(e1.ci), M: e1.M, censored: e1.censored }, E2: e2 && { worth: r2(e2.worth), ci: r2(e2.ci), M: e2.M, censored: e2.censored } },
      carrier20: h1 && { worth: r2(h1.worth), ci: r2(h1.ci), M: h1.M }, roundRobin: nm ? { worth: r2(nm.worth), ci: r2(nm.ci), M: nm.M, anchored: anc && r2(anc.worth) } : X.rr ? { note: X.rr } : null, equivalenceMethod: X.eq || 'E1-win, E2-win',
      verdicts: V, verdict: confirmed ? `confirmed ${flag}` : 'not confirmed', why };
  });
  const J = { about: 'Package SKM2 (2026-11-21): SKM1\'s flagged combat skills re-measured. Values in budget points at the skill\'s Maps 0-20 price, each divided by its method\'s exchange rate. tools/skm/confirm.js. Measurement only: no price, constant or card changed.',
    generated: new Date().toISOString(), fingerprint: fp, rule: 'a method reads cheap / dear when 25%+ of max(1, |price|) off the price and its 95% interval excludes the price; confirmed = the pipeline and 2+ of the other three agree with the flag, none against',
    rhoWithPipeline: Object.fromEntries(['equivalence', 'carrier20', 'roundRobin'].map(k => { const ok = out.filter(r => r.pipeline && r[k] && r[k].worth != null), rel = (r, v) => (v - r.price) / Math.max(1, Math.abs(r.price));
      return [k, r2(S.spearman(ok.map(r => rel(r, r[k].worth)), ok.map(r => rel(r, r.pipeline.worth))))]; })), rhoNote: 'Spearman over the skills both read, of (value - price) / max(1, |price|)',
    scales: { pipeline: 1, E1: scaleOf('E1-win'), E2: scaleOf('E2-win'), H1: scaleOf('H1-win'), RR: r2(rrScale) }, skills: out };
  fs.writeFileSync(path.join(DIR, `confirm-${date}.json`), JSON.stringify(J, null, 1) + '\n');
  const ci = v => v && v.worth != null ? `${v.worth} ±${v.ci == null ? '?' : v.ci}` : v && v.note ? 'n/a' : '-';
  const lines = out.map(r => `| ${r.skill} | ${r.price} | ${ci(r.pipeline)} | ${ci(r.equivalence)} | ${ci(r.carrier20)} | ${ci(r.roundRobin)} | ${r.verdict === 'not confirmed' ? 'not confirmed (' + r.why + ')' : r.verdict} |`);
  console.log(['| Skill | Price | Pipeline | Equivalence | Carrier x20 | Round robin | Verdict |', '|---|---|---|---|---|---|---|'].concat(lines).join('\n')); // the .md's table (the page itself is written by hand)
  out.forEach(r => console.log(r.skill.padEnd(13), String(r.price).padStart(6), 'pipe', ci(r.pipeline).padEnd(14), 'eq', ci(r.equivalence).padEnd(14), 'H1', ci(r.carrier20).padEnd(14), 'RR', ci(r.roundRobin).padEnd(14), r.verdict, r.why || ''));
}
main().catch(e => { console.error(e); process.exit(1); });
