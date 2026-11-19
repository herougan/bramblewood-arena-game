#!/usr/bin/env node
// 2026-11-20 (package SKM1): the summary of the skill-measurement registry: docs/balance/skm/summary-<date>.json + .md.
//   node tools/skm/summary.js [--date 2026-11-20]
// Per method: a scale (its median worth / price over the skills it measured), so a method's overall exchange rate does not decide the flags;
// calibrated worth = worth / scale. Per skill: the families' medians (one vote per game design or offline source, since the estimators of one
// design share their games), their median (the consensus), the spread, and a flag when 3+ families, and more than half of those with an
// estimate, put it 25% or more off today's price in the same direction. Per method: Spearman's rank correlation with the leave-its-family-out
// consensus. Circular sources (the designers' slack and the measures the prices were set from) are listed but left out of the consensus.
'use strict';
const path = require('path'), fs = require('fs');
const S = require('./lib.js'), R = require('./registry.js');
const DIR = path.join(S.ROOT, 'docs', 'balance', 'skm'), RES = path.join(DIR, 'results');
const date = (process.argv.indexOf('--date') > 0 ? process.argv[process.argv.indexOf('--date') + 1] : null) || '2026-11-20';
const CIRCULAR = /^O-(hedonic|measuredS|canon)/;
const famOf = id => { const m = R.REG.find(x => x.id === id); if (m && m.exp) return m.exp;
  if (/^O-bench/.test(id)) return 'bench-history'; if (/^O-contrib/.test(id)) return 'contribution'; if (/^O-workbook/.test(id)) return 'workbook'; if (/^O-ladder/.test(id)) return 'skill-ladder'; return id; };
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
const med = S.median;
function q(a, p) { const v = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const i = (v.length - 1) * p, lo = Math.floor(i); return v[lo] + (v[Math.min(v.length - 1, lo + 1)] - v[lo]) * (i - lo); }

function main() {
  const U = S.universe(), fp = S.L.fingerprint(), skills = U.list;
  const files = fs.existsSync(RES) ? fs.readdirSync(RES).filter(f => f.endsWith('.jsonl')) : [];
  const M = {}, RP = new Map(); // method -> skill -> row; row prices
  files.forEach(f => { const id = f.slice(0, -6), sim = /^O-/.test(id) ? false : true;
    fs.readFileSync(path.join(RES, f), 'utf8').split('\n').filter(Boolean).forEach(l => { let r; try { r = JSON.parse(l); } catch (e) { return; }
      if (sim && r.fp !== fp) return; if (r.worth == null || !isFinite(r.worth) || !U.skills[r.skill]) return;
      // a sim row measured the skill on one card at that card's number: brought to the skill's mean price by the row's own price
      if (sim) { const k = id.split('-')[0] + '|' + r.skill + '|' + r.carrier; if (!RP.has(k)) RP.set(k, R.rowPrice(U, id, r.skill, r.carrier)); const rp = RP.get(k), p = U.skills[r.skill].price;
        r.rowPrice = rp; r.worthRow = r.worth; if (rp != null && rp >= 0.5 && p >= 0.5) r.worth = r.worth * p / rp; }
      (M[id] = M[id] || {})[r.skill] = r; }); });
  const methods = Object.keys(M).filter(id => Object.keys(M[id]).length >= 10).sort();
  const price = s => U.skills[s].price, base = s => Math.max(1, price(s));
  // per method scale and calibrated worth
  const scale = {}; methods.forEach(id => { const rs = Object.values(M[id]).filter(r => price(r.skill) >= 1).map(r => r.worth / price(r.skill)); const sc = med(rs); scale[id] = sc && sc > 0.05 ? sc : null; });
  const cal = (id, s) => { const r = M[id][s]; return r && scale[id] ? r.worth / scale[id] : null; };
  const fams = {}; methods.forEach(id => { if (CIRCULAR.test(id)) return; (fams[famOf(id)] = fams[famOf(id)] || []).push(id); });
  const famVal = (f, s, raw) => med(fams[f].map(id => raw ? (M[id][s] ? M[id][s].worth : null) : cal(id, s)));
  const consensus = (s, skipFam) => med(Object.keys(fams).filter(f => f !== skipFam).map(f => famVal(f, s)));
  // per skill
  const rows = skills.map(s => {
    const fv = {}; Object.keys(fams).forEach(f => { const v = famVal(f, s); if (v != null) fv[f] = r2(v); });
    const vals = Object.values(fv), c = med(vals), raw = med(Object.keys(fams).map(f => famVal(f, s, true)));
    const hi = vals.filter(v => v > price(s) + 0.25 * base(s)).length, lo = vals.filter(v => v < price(s) - 0.25 * base(s)).length;
    const flag = hi >= 3 && hi > vals.length / 2 ? 'under-priced' : lo >= 3 && lo > vals.length / 2 ? 'over-priced' : null;
    const nm = methods.filter(id => M[id][s]).length;
    return { skill: s, price: r2(price(s)), carriers: U.skills[s].carriers.length, firstMap: U.skills[s].firstMap, consensus: r2(c), rawMedian: r2(raw),
      gap: c == null ? null : r2(c - price(s)), gapPct: c == null ? null : Math.round(100 * (c - price(s)) / base(s)), spreadIQR: r2(q(vals, 0.75) - q(vals, 0.25)),
      families: vals.length, methods: nm, higher: hi, lower: lo, flag, strong: !!flag && vals.length >= 5 && Math.max(hi, lo) >= 0.75 * vals.length, byFamily: fv };
  });
  // per method: agreement with the consensus without its own family, and with today's price
  const mrows = methods.map(id => { const f = famOf(id), xs = [], ys = [], ps = [];
    skills.forEach(s => { const v = M[id][s]; if (!v) return; xs.push(v.worth); ys.push(CIRCULAR.test(id) ? consensus(s) : consensus(s, f)); ps.push(price(s)); });
    const m = R.REG.find(x => x.id === id), ci = Object.values(M[id]).map(r => r.ci != null && r.worth ? Math.abs(r.ci / r.worth) : null);
    return { id, family: f, circular: CIRCULAR.test(id), name: m ? m.name : id, idea: m ? m.idea : '', skills: xs.length, scale: r2(scale[id]), rhoConsensus: r2(S.spearman(xs, ys)), rhoPrice: r2(S.spearman(xs, ps)),
      medianRelCI: r2(med(ci)), games: Object.values(M[id]).reduce((t, r) => t + (r.games || 0), 0) };
  }).sort((a, b) => (b.rhoConsensus == null ? -9 : b.rhoConsensus) - (a.rhoConsensus == null ? -9 : a.rhoConsensus));
  const famRows = Object.keys(fams).map(f => { const xs = [], ys = [], ps = []; skills.forEach(s => { const v = famVal(f, s); if (v == null) return; xs.push(v); ys.push(consensus(s, f)); ps.push(price(s)); });
    return { family: f, methods: fams[f].length, skills: xs.length, rhoConsensus: r2(S.spearman(xs, ys)), rhoPrice: r2(S.spearman(xs, ps)), scale: r2(med(fams[f].map(id => scale[id]))) }; }).sort((a, b) => (b.rhoConsensus || -9) - (a.rhoConsensus || -9));
  const simM = methods.filter(id => !/^O-/.test(id)), simGames = simM.filter(id => R.REG.find(x => x.id === id && x.primary)).reduce((t, id) => t + Object.values(M[id]).reduce((a, r) => a + (r.games || 0), 0), 0);
  const overall = med(simM.map(id => scale[id]));
  const out = { about: 'Package SKM1 (2026-11-20): skill worth by many methods vs today\'s price, Maps 0-20 skills. worth / price in budget points (cap-1 (3A + H) x m + S). Measurement only: nothing applied. tools/skm/summary.js', generated: new Date().toISOString(), fingerprint: fp,
    counts: { methodsRegistered: R.REG.length, methodsWithResults: methods.length, simMethods: simM.length, families: Object.keys(fams).length, designsPlayed: [...new Set(simM.map(famOf))].length, skills: skills.length, skillsCovered: rows.filter(r => r.families >= 3).length, simGamesPlayed: simGames },
    overallSimScale: r2(overall), rules: { flag: '3+ families and more than half of the families with an estimate 25%+ off the price (of max(price, 1)) the same way, on calibrated values', circular: 'O-hedonic-*, O-measuredS, O-canon listed, not in the consensus' },
    skills: rows.sort((a, b) => Math.abs(b.gapPct || 0) - Math.abs(a.gapPct || 0)), methods: mrows, families: famRows };
  fs.writeFileSync(path.join(DIR, `summary-${date}.json`), JSON.stringify(out, null, 1) + '\n');
  // the short page
  const P = fs.existsSync(path.join(DIR, `proposals-${date}.json`)) ? JSON.parse(fs.readFileSync(path.join(DIR, `proposals-${date}.json`), 'utf8')) : [];
  const agree = r => Math.max(r.higher, r.lower) / Math.max(1, r.families); // the share of families on the flag's side
  const flagged = out.skills.filter(r => r.flag).sort((a, b) => agree(b) - agree(a) || Math.abs(b.gapPct) - Math.abs(a.gapPct)), top = flagged.slice(0, 10);
  const line = r => `| ${r.skill} | ${r.price} | ${r.consensus} | ${r.gapPct > 0 ? '+' : ''}${r.gapPct}% | ${r.spreadIQR} | ${r.higher}/${r.lower} of ${r.families} | ${r.flag} |`;
  const ml = m => `| ${m.id} | ${m.skills} | ${m.rhoConsensus} | ${m.rhoPrice} | ${m.scale} |`;
  const good = mrows.filter(m => !m.circular && m.rhoConsensus != null);
  const fsc = famRows.filter(f => !/^O-|history|contribution|workbook|ladder/.test(f.family) && f.scale != null), byKind = k => med(fsc.filter(f => (k === 'eq') === /^E/.test(f.family)).map(f => f.scale));
  const simScales = `${r2(byKind('yard'))} for the yardstick designs (gain / the gain of +1 Attack or +2 Health), ${r2(byKind('eq'))} for the stat-equivalence searches`;
  const md = [`# Skill measurement registry: summary (${date})`, '',
    `Package SKM1. ${out.counts.methodsWithResults} methods with results (${out.counts.simMethods} from ${out.counts.designsPlayed} game designs played today, ${out.counts.methodsWithResults - out.counts.simMethods} offline) out of ${out.counts.methodsRegistered} registered; ${out.counts.families} independent families vote. ${out.counts.skillsCovered} of ${out.counts.skills} Maps 0-20 skills have 3+ family estimates. ${out.counts.simGamesPlayed} games played. Tables: \`summary-${date}.json\`; per-method lines: \`results/<method>.jsonl\`; methods: \`tools/skm/registry.js\`.`, '',
    `- **How to read it.** Worth and price are budget points. Each method is first divided by its own median worth / price (its exchange rate), so the flags are about skills priced wrong relative to the others, not about the table's overall level: that level depends on the design (median raw worth / price ${simScales}), so these runs do not settle whether skills as a whole cost too much.`,
    `- Skills that need partners or an economy (Lumber makers, tribes, blooms, deliveries, weather) read near 0 in every combat design here; read their over-priced flags as "not measurable this way", not as a verdict.`,
    `- One vote per family (a game design, or an offline source): the estimators of one design share its games. Prices came from the pipeline canon and the designers' cards are fitted to them, so those sources are shown but do not vote.`, '',
    `## Skills most families agree are mispriced (${flagged.length} flagged by the 3-family rule; ${flagged.filter(r => r.strong).length} strong: 5+ families, 3 in 4 agreeing)`, '', '| Skill | Price | Consensus | Gap | Spread (IQR) | Higher / lower | Flag |', '|---|---|---|---|---|---|---|', ...top.map(line), '',
    '## Method agreement (Spearman with the consensus of the other families)', '', '| Method | Skills | rho consensus | rho price | Scale |', '|---|---|---|---|---|',
    ...good.slice(0, 6).map(ml), '| ... | | | | |', ...good.slice(-5).map(ml), '',
    '| Family | Methods | Skills | rho consensus | rho price | Scale |', '|---|---|---|---|---|---|', ...famRows.map(f => `| ${f.family} | ${f.methods} | ${f.skills} | ${f.rhoConsensus} | ${f.rhoPrice} | ${f.scale} |`), '',
    '## Proposals for the owner', '', ...(P.length ? P.map((p, i) => `${i + 1}. ${p}`) : ['(none yet)']), ''];
  fs.writeFileSync(path.join(DIR, `summary-${date}.md`), md.join('\n'));
  console.log(`methods ${methods.length} (sim ${simM.length}), families ${Object.keys(fams).length}, skills covered ${out.counts.skillsCovered}/${skills.length}, flagged ${flagged.length}, overall sim scale ${out.overallSimScale}`);
  top.forEach(r => console.log(`  ${r.skill.padEnd(24)} price ${String(r.price).padStart(6)} consensus ${String(r.consensus).padStart(6)} ${r.gapPct}% (${r.higher}/${r.lower} of ${r.families}) ${r.flag}`));
  console.log('most consistent: ' + good.slice(0, 5).map(m => m.id + ' ' + m.rhoConsensus).join(', '));
  console.log('least consistent: ' + good.slice(-5).map(m => m.id + ' ' + m.rhoConsensus).join(', '));
}
main();
