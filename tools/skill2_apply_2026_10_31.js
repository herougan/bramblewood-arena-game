#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decisions BUDGET2-1 / BUDGET2-2 / DECK1-1): writes the SKILL2 measures into canonical/skill-costs.json.
//
//   node tools/skill2_apply_2026_10_31.js anchors [--dry]   BUDGET2-2: the 15 canon points re-set from one shared measure, in 3A + H stat points
//                                                          (docs/balance/skill-canon-check-2026-10-31-skill2-before.json: price = the anchor's
//                                                          gain / the stat yardstick's gain a point; an entry with two canon points and a
//                                                          power curve (Armor, Poison, Bleed) gets value = P(1) and pow = log2(P(2) / P(1)))
//   node tools/skill2_apply_2026_10_31.js prices [--dry]    BUDGET2-1: every measured in-play skill (docs/balance/skill2-measures-2026-10-31.json)
//                                                          written by the rules below; prints the plan
//
// The currency (BUDGET2-2, SKILL2): a skill-price point is a 3A + H stat point, +1 Health on these carriers. Before SKILL2 the anchors' prices
// came from RECOST1's separate measures (each on its own carriers, in 2A + H points); one canon point bought about 2.2 stat points (κ 0.46).
// History: each changed entry keeps its previous numbers under `skill2Was` (value, pow, appliedAt, measuredS, measuredConf, measuredSE).
// The file keeps its format: one skill a line in the "skills" array, compact JSON; nothing else in the file is touched.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'canonical', 'skill-costs.json');
const CHECK = path.join(ROOT, 'docs', 'balance', 'skill-canon-check-2026-10-31-skill2-before.json');
const MEAS = path.join(ROOT, 'docs', 'balance', 'skill2-measures-2026-10-31.json');
const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
const numOf = v => typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b) => a + (+b || 0), 0) : 0);
// the factor an entry's value is multiplied by at N (tools/skill_costs.js skillCost, without pow / plus)
function factorOf(e, v) { const n = numOf(v); if (e.scale === 'n') { const N = Math.max(1, v === true && e.payDefault ? e.payDefault : n); return e.pow != null ? Math.pow(N, +e.pow) : N; }
  if (e.scale === 'half') return 1 + (n > 1 ? Math.floor(n / 2) : 0); return 1; }

// ---------------------------------------------------------------- the file: read, replace skill lines, write
function readTable() { const text = fs.readFileSync(FILE, 'utf8'); return { text, table: JSON.parse(text) }; }
function writeSkills(text, changed) { // changed: {id: entry}
  const lines = text.split('\n'), start = lines.findIndex(l => /^ "skills": \[/.test(l)); let n = 0;
  for (let i = start + 1; i < lines.length && !/^ \]/.test(lines[i]); i++) { const m = /^  (\{"id":"([^"]+)".*\})(,?)$/.exec(lines[i]); if (!m || !changed[m[2]]) continue;
    lines[i] = '  ' + JSON.stringify(changed[m[2]]) + m[3]; n++; }
  if (n !== Object.keys(changed).length) throw new Error(`wrote ${n} of ${Object.keys(changed).length} skill lines`);
  const out = lines.join('\n'); JSON.parse(out); return out;
}
function keepWas(e) { if (e.skill2Was) return e; const was = {}; ['value', 'pow', 'appliedAt', 'measuredS', 'measuredConf', 'measuredSE', 'measuredHow'].forEach(k => { if (e[k] != null) was[k] = e[k]; }); e.skill2Was = was; return e; }

// ---------------------------------------------------------------- anchors (BUDGET2-2)
function anchors(opt) {
  const { text, table } = readTable(), chk = JSON.parse(fs.readFileSync(CHECK, 'utf8')), sr = chk.statRate;
  const by = {}; chk.anchors.forEach(a => { (by[a.id] = by[a.id] || []).push(a); });
  const changed = {}, rows = [];
  table.skills.filter(e => e.canon).forEach(e0 => {
    const pts = (by[e0.id] || []).slice().sort((a, b) => numOf(a.n) - numOf(b.n)); if (!pts.length) throw new Error('no measure for anchor ' + e0.id);
    const e = keepWas(JSON.parse(JSON.stringify(e0)));
    const P = pts.map(a => ({ n: a.n, key: a.key, gain: a.gain, price: a.gain / sr.m, ws: a.worthStat, old: a.price }));
    if (pts.length === 2 && e.scale === 'n' && e.pow != null) { e.value = r2(P[0].price); e.pow = r3(Math.log(P[1].price / P[0].price) / Math.log(numOf(P[1].n) / numOf(P[0].n))); }
    else if (pts.length === 1) e.value = r2(P[0].price / factorOf(e, P[0].n));
    else throw new Error('anchor ' + e.id + ': ' + pts.length + ' points and no power curve');
    const ci = P.map(p => p.ws ? `${p.key} ${r2(p.price)} [${r2(p.ws.lo)}, ${r2(p.ws.hi)}]` : `${p.key} ${r2(p.price)}`).join('; ');
    e.measuredS = r2(P[0].price / factorOf(Object.assign({}, e, { pow: e.pow }), P[0].n)); e.measuredConf = 'high';
    if (P[0].ws) e.measuredSE = r2((P[0].ws.hi - P[0].ws.lo) / 3.92 / factorOf(e, P[0].n));
    e.appliedAt = '2026-10-31 (package SKILL2, decision BUDGET2-2: the canon re-set from one shared measure, in 3A + H stat points)';
    e.measuredHow = `2026-10-31 (SKILL2): node tools/skill_canon_2026_10_31.js check --games ${chk.context.fights} (global context, carriers ${chk.carriers.join(', ')}, 6 copies, Level 1; docs/balance/skill-canon-check-2026-10-31-skill2-before.json): price = the anchor's paired gain / the stat yardstick's gain a 3A + H point (${r2(sr.m * 100)} [${r2(sr.lo * 100)}, ${r2(sr.hi * 100)}] win-rate points); ${ci} (95%, a bootstrap over fights)`;
    e.canonReason = (e.canonReason || '').replace(/; SKILL2: .*$/, '') + `; SKILL2 (2026-10-31): re-set from one shared measure in 3A + H points (${P.map(p => p.key + ' ' + p.old + ' -> ' + r2(p.price)).join(', ')})`;
    changed[e.id] = e; P.forEach(p => rows.push(`${p.key.padEnd(15)} ${String(p.old).padStart(6)} -> ${r2(p.price).toString().padStart(6)}  gain ${(p.gain * 100).toFixed(1)}  ${p.ws ? '[' + r2(p.ws.lo) + ', ' + r2(p.ws.hi) + ']' : ''}`));
    rows.push(`   ${e.id}: value ${e0.value}${e0.pow != null ? ' pow ' + e0.pow : ''} -> ${e.value}${e.pow != null ? ' pow ' + e.pow : ''} (${e.scale})`);
  });
  console.log(`stat yardstick: ${r2(sr.m * 100)} [${r2(sr.lo * 100)}, ${r2(sr.hi * 100)}] win-rate points a 3A + H point; kappa before ${chk.kappa.m} [${chk.kappa.lo}, ${chk.kappa.hi}]`);
  rows.forEach(r => console.log(r));
  if (opt.dry) return;
  fs.writeFileSync(FILE, writeSkills(text, changed)); console.log('-> canonical/skill-costs.json (' + Object.keys(changed).length + ' anchor entries)');
}

async function main(argv) {
  const cmd = argv[0], opt = { dry: argv.includes('--dry') };
  if (cmd === 'anchors') return anchors(opt);
  if (cmd === 'prices') return require('./skill2_prices_2026_10_31.js').prices(opt, { readTable, writeSkills, keepWas, factorOf, MEAS, r2 });
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { factorOf, readTable, writeSkills, keepWas };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
