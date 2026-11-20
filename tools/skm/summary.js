#!/usr/bin/env node
// 2026-11-20 (package SKM1): the summary of the skill-measurement registry: docs/balance/skm/summary-<date>.json + .md.
//   node tools/skm/summary.js [--date 2026-11-21]
// Per method: a scale (its median worth / price over the skills it measured), so a method's overall exchange rate does not decide the flags;
// calibrated worth = worth / scale. Per skill: the families' medians (one vote per game design or offline source, since the estimators of one
// design share their games), their median (the consensus), the spread, and a flag when 3+ families, and more than half of those with an
// estimate, put it 25% or more off today's price in the same direction. Per method: Spearman's rank correlation with the leave-its-family-out
// consensus. Circular sources (the designers' slack and the measures the prices were set from) are listed but left out of the consensus.
// 2026-11-20 (package SKM3): verdicts cheap / fair / dear (cheap = the flag "under-priced"), with the kinds and the methods on each side; the
// verdict changes since the SKM1 summary and the SKM2 confirm; a second verdict on today's game only. Which games count (GAMES below): sim rows
// of today's fingerprint; of SKM2's game (6926772d: since then only road decks in arena_app.js changed, git diff 85b323065..HEAD, so every
// design but the road one plays the same games); of SKM1's game (8b6f2a67, an older engine and cards) except for the skills whose rules or
// cards changed since (STALE); per method and skill the newest game's row. The races' halves (OR, DR) are listed, their sum (OD) votes.
'use strict';
const path = require('path'), fs = require('fs');
const S = require('./lib.js'), R = require('./registry.js');
const DIR = path.join(S.ROOT, 'docs', 'balance', 'skm'), RES = path.join(DIR, 'results');
const date = (process.argv.indexOf('--date') > 0 ? process.argv[process.argv.indexOf('--date') + 1] : null) || '2026-11-21';
const CIRCULAR = /^O-(hedonic|measuredS|canon)/, COMPONENT = /^(OR|DR)-/;
const GAMES = { same: '6926772d4855', older: '8b6f2a672f5f' };
// SKIN3 / FOCUS2 / DEC20-SKILLS (2026-11-19/20) changed these skills' rules (Scare makes its attacker Scared, Harden / Embolden / Enfeeble
// apply Sturdy / Mighty / Feeble, Illuminate reveals Stealth) or gave them new carriers; SKM1's games of them are not today's game
const STALE = ['scare', 'stealth', 'illuminate', 'harden', 'embolden', 'enfeeble', 'mighty', 'sturdy'];
const famOf = id => { const m = R.REG.find(x => x.id === id); if (m && m.exp) return m.exp;
  if (/^O-bench/.test(id)) return 'bench-history'; if (/^O-contrib/.test(id)) return 'contribution'; if (/^O-workbook/.test(id)) return 'workbook'; if (/^O-ladder/.test(id)) return 'skill-ladder'; return id; };
const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
const med = S.median;
function q(a, p) { const v = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const i = (v.length - 1) * p, lo = Math.floor(i); return v[lo] + (v[Math.min(v.length - 1, lo + 1)] - v[lo]) * (i - lo); }
const KIND = f => /^E(9|1[0-3])$/.test(f) ? 'synergy-eq' : /^E(1[7-9]|2\d)$/.test(f) ? 'own-body-eq' : /^E\d+$/.test(f) ? 'body-eq' : /^C\d+$/.test(f) ? 'counter-eq'
  : /^(R\d|P1|D1)$/.test(f) ? 'slot' : /^(DK|AD|PX)$/.test(f) ? 'real-deck' : /^H\d$/.test(f) ? 'carrier-x20' : f === 'OD' ? 'race' : f === 'DU' ? 'duo' : f === 'RR' ? 'round-robin' : f;

// the rows: method -> skill -> row (today's game only when todayOnly)
function load(U, fp, todayOnly) {
  const files = fs.existsSync(RES) ? fs.readdirSync(RES).filter(f => f.endsWith('.jsonl')) : [], M = {}, RP = new Map(), rank = { today: 3, same: 2, older: 1 }, games = {};
  files.forEach(f => { const id = f.slice(0, -6), sim = !/^O-/.test(id), got = {};
    fs.readFileSync(path.join(RES, f), 'utf8').split('\n').filter(Boolean).forEach(l => { let r; try { r = JSON.parse(l); } catch (e) { return; }
      if (r.worth == null || !isFinite(r.worth) || !U.skills[r.skill]) return;
      let g = 'today'; if (sim) { g = r.fp === fp ? 'today' : r.fp === GAMES.same && !/^D1-/.test(id) ? 'same' : r.fp === GAMES.older && !STALE.includes(r.skill) ? 'older' : null; if (!g || (todayOnly && g === 'older')) return; }
      const old = got[r.skill]; if (old && rank[old.game] > rank[g]) return; r.game = g; got[r.skill] = r; });
    Object.values(got).forEach(r => { if (sim) { const k = id.split('-')[0] + '|' + r.skill + '|' + r.carrier; if (!RP.has(k)) RP.set(k, R.rowPrice(U, id, r.skill, r.carrier)); const rp = RP.get(k), p = U.skills[r.skill].price;
        // a sim row measured the skill on one card at that card's number: brought to the skill's mean price by the row's own price
        r.rowPrice = rp; r.worthRow = r.worth; if (rp != null && rp >= 0.5 && p >= 0.5) r.worth = r.worth * p / rp; games[r.game] = (games[r.game] || 0) + 1; }
      (M[id] = M[id] || {})[r.skill] = r; }); });
  return { M, games };
}

function analyse(U, M) {
  const skills = U.list, methods = Object.keys(M).filter(id => Object.keys(M[id]).length >= 10).sort();
  const price = s => U.skills[s].price, base = s => Math.max(1, Math.abs(price(s)));
  const scale = {}; methods.forEach(id => { const rs = Object.values(M[id]).filter(r => price(r.skill) >= 1).map(r => r.worth / price(r.skill)); const sc = med(rs); scale[id] = sc && sc > 0.05 ? sc : null; });
  const cal = (id, s) => { const r = M[id][s]; return r && scale[id] ? r.worth / scale[id] : null; };
  const voting = id => !CIRCULAR.test(id) && !COMPONENT.test(id);
  const fams = {}; methods.forEach(id => { if (!voting(id)) return; (fams[famOf(id)] = fams[famOf(id)] || []).push(id); });
  const famVal = (f, s, raw) => med(fams[f].map(id => raw ? (M[id][s] ? M[id][s].worth : null) : cal(id, s)));
  const kinds = {}; Object.keys(fams).forEach(f => (kinds[KIND(f)] = kinds[KIND(f)] || []).push(f));
  const kindVal = (k, s, raw) => med(kinds[k].map(f => famVal(f, s, raw)));
  const consensus = (s, skipKind) => med(Object.keys(kinds).filter(k => k !== skipKind).map(k => kindVal(k, s)));
  const side = (v, s) => v > price(s) + 0.25 * base(s) ? 1 : v < price(s) - 0.25 * base(s) ? -1 : 0;
  const rows = skills.map(s => {
    const fv = {}, kv = {}; Object.keys(fams).forEach(f => { const v = famVal(f, s); if (v != null) fv[f] = r2(v); });
    Object.keys(kinds).forEach(k => { const v = kindVal(k, s); if (v != null) kv[k] = r2(v); });
    const vals = Object.values(kv), c = med(vals), raw = med(Object.keys(kinds).map(k => kindVal(k, s, true)));
    const hi = vals.filter(v => side(v, s) > 0).length, lo = vals.filter(v => side(v, s) < 0).length;
    const flag = hi >= 3 && hi > vals.length / 2 ? 'under-priced' : lo >= 3 && lo > vals.length / 2 ? 'over-priced' : null;
    const mv = methods.filter(id => voting(id) && M[id][s]).map(id => cal(id, s)).filter(v => v != null), mHi = mv.filter(v => side(v, s) > 0).length, mLo = mv.filter(v => side(v, s) < 0).length;
    return { skill: s, price: r2(price(s)), carriers: U.skills[s].carriers.length, firstMap: U.skills[s].firstMap, consensus: r2(c), rawMedian: r2(raw),
      gap: c == null ? null : r2(c - price(s)), gapPct: c == null ? null : Math.round(100 * (c - price(s)) / base(s)), spreadIQR: r2(q(vals, 0.75) - q(vals, 0.25)),
      kinds: vals.length, families: Object.keys(fv).length, methods: methods.filter(id => M[id][s]).length, higher: hi, lower: lo, flag,
      verdict: flag === 'under-priced' ? 'cheap' : flag === 'over-priced' ? 'dear' : 'fair', kindsSides: { cheap: hi, fair: vals.length - hi - lo, dear: lo },
      methodsSides: { cheap: mHi, fair: mv.length - mHi - mLo, dear: mLo }, strong: !!flag && vals.length >= 5 && Math.max(hi, lo) >= 0.75 * vals.length, byKind: kv, byFamily: fv };
  });
  return { methods, scale, fams, kinds, famVal, kindVal, consensus, rows, voting };
}

function main() {
  const U = S.universe(), fp = S.L.fingerprint(), skills = U.list;
  const L1 = load(U, fp, false), A = analyse(U, L1.M), M = L1.M, { methods, scale, fams, kinds, famVal, kindVal, consensus, rows } = A;
  const T = analyse(U, load(U, fp, true).M), tv = new Map(T.rows.map(r => [r.skill, r]));
  const price = s => U.skills[s].price;
  // the earlier verdicts
  const rj = f => { const p = path.join(DIR, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
  const P20 = rj('summary-2026-11-20.json'), C21 = rj('confirm-2026-11-21.json');
  const v20 = new Map(((P20 && P20.skills) || []).map(r => [r.skill, r.flag === 'under-priced' ? 'cheap' : r.flag === 'over-priced' ? 'dear' : 'fair']));
  const c21 = new Map(((C21 && C21.skills) || []).map(r => [r.skill, /confirmed cheap/.test(r.verdict) ? 'cheap' : /confirmed dear/.test(r.verdict) ? 'dear' : 'not confirmed (' + r.flag + ')']));
  rows.forEach(r => { const t = tv.get(r.skill); r.verdictToday = t ? t.verdict : null; r.kindsToday = t ? t.kinds : 0; r.kindsSidesToday = t ? t.kindsSides : null;r.consensusToday = t ? t.consensus : null;
    r.verdict1120 = v20.has(r.skill) ? v20.get(r.skill) : 'not measured'; r.confirm1121 = c21.get(r.skill) || null;
    r.changed1120 = r.verdict1120 !== r.verdict; r.changed1121 = r.confirm1121 != null && r.confirm1121 !== r.verdict; });
  const mrows = methods.map(id => { const f = famOf(id), xs = [], ys = [], ps = [], circ = !A.voting(id);
    skills.forEach(s => { const v = M[id][s]; if (!v) return; xs.push(v.worth); ys.push(circ ? consensus(s) : consensus(s, KIND(f))); ps.push(price(s)); });
    const m = R.REG.find(x => x.id === id), ci = Object.values(M[id]).map(r => r.ci != null && r.worth ? Math.abs(r.ci / r.worth) : null), g = {}; Object.values(M[id]).forEach(r => g[r.game] = (g[r.game] || 0) + 1);
    return { id, family: f, kind: circ ? null : KIND(f), circular: CIRCULAR.test(id), component: COMPONENT.test(id), name: m ? m.name : id, idea: m ? m.idea : '', skills: xs.length, games: g, scale: r2(scale[id]), rhoConsensus: r2(S.spearman(xs, ys)), rhoPrice: r2(S.spearman(xs, ps)),
      medianRelCI: r2(med(ci)), gamesPlayed: Object.values(M[id]).reduce((t, r) => t + (r.games || 0), 0) };
  }).sort((a, b) => (b.rhoConsensus == null ? -9 : b.rhoConsensus) - (a.rhoConsensus == null ? -9 : a.rhoConsensus));
  const famRows = Object.keys(fams).map(f => { const xs = [], ys = [], ps = []; skills.forEach(s => { const v = famVal(f, s); if (v == null) return; xs.push(v); ys.push(consensus(s, KIND(f))); ps.push(price(s)); });
    return { family: f, kind: KIND(f), methods: fams[f].length, skills: xs.length, rhoConsensus: r2(S.spearman(xs, ys)), rhoPrice: r2(S.spearman(xs, ps)), scale: r2(med(fams[f].map(id => scale[id]))) }; }).sort((a, b) => (b.rhoConsensus || -9) - (a.rhoConsensus || -9));
  const kindRows = Object.keys(kinds).map(k => { const xs = [], ys = []; skills.forEach(s => { const v = kindVal(k, s); if (v == null) return; xs.push(v); ys.push(consensus(s, k)); });
    return { kind: k, families: kinds[k], skills: xs.length, rhoConsensus: r2(S.spearman(xs, ys)) }; }).sort((a, b) => (b.rhoConsensus || -9) - (a.rhoConsensus || -9));
  const simM = methods.filter(id => !/^O-/.test(id));
  const before = P20 ? P20.counts : null;
  const out = { about: 'Packages SKM1-SKM3: skill worth by many methods vs today\'s price, Maps 0-20 skills. worth / price in budget points (cap-1 (3A + H) x m + S). Verdict cheap = under-priced. Measurement only: nothing applied. tools/skm/summary.js', generated: new Date().toISOString(), fingerprint: fp,
    games: { rule: 'sim rows of today\'s game; of SKM2\'s game ' + GAMES.same + ' (only road decks changed since: every design but D1 plays the same games); of SKM1\'s game ' + GAMES.older + ' except the STALE skills; per method and skill the newest', stale: STALE, rowsByGame: L1.games },
    counts: { methodsRegistered: R.REG.length, methodsWithResults: methods.length, simMethods: simM.length, families: Object.keys(fams).length, kinds: Object.keys(kinds).length, designsPlayed: [...new Set(simM.map(famOf))].length, skills: skills.length, skillsCovered: rows.filter(r => r.kinds >= 3).length, before },
    rules: { verdict: 'cheap / dear: 3+ kinds and more than half of the kinds with an estimate 25%+ of max(|price|, 1) above / below the price, on calibrated values (a kind = the median of its families, a family = the median of its estimators); else fair', circular: 'O-hedonic-*, O-measuredS, O-canon listed, not in the consensus', components: 'OR-*, DR-* (one half each) listed; OD-sum (their sum) votes as the kind race' },
    skills: rows.sort((a, b) => Math.abs(b.gapPct || 0) - Math.abs(a.gapPct || 0)), methods: mrows, families: famRows, kinds: kindRows };
  fs.writeFileSync(path.join(DIR, `summary-${date}.json`), JSON.stringify(out, null, 1) + '\n');
  // the short page
  const P = fs.existsSync(path.join(DIR, `proposals-${date}.json`)) ? JSON.parse(fs.readFileSync(path.join(DIR, `proposals-${date}.json`), 'utf8')) : [];
  const cnt = v => rows.filter(r => r.verdict === v).length, cntT = v => rows.filter(r => r.verdictToday === v).length;
  const sides = o => `${o.cheap}/${o.fair}/${o.dear}`;
  const byV = rows.slice().sort((a, b) => ['cheap', 'dear', 'fair'].indexOf(a.verdict) - ['cheap', 'dear', 'fair'].indexOf(b.verdict) || Math.abs(b.gapPct || 0) - Math.abs(a.gapPct || 0));
  const line = r => `| ${r.skill} | ${r.price} | ${r.consensus} | ${r.gapPct == null ? '' : (r.gapPct > 0 ? '+' : '') + r.gapPct + '%'} | **${r.verdict}** | ${sides(r.kindsSides)} | ${sides(r.methodsSides)} | ${r.verdictToday}${r.verdictToday !== r.verdict ? ' (!)' : ''} | ${r.verdict1120} | ${r.confirm1121 || ''} |`;
  const ch = rows.filter(r => r.changed1120 || r.changed1121);
  const ml = m => `| ${m.id} | ${m.skills} | ${m.rhoConsensus} | ${m.rhoPrice} | ${m.scale} |`;
  const good = mrows.filter(m => A.voting(m.id) && m.rhoConsensus != null), mine = mrows.filter(m => /^(OR|DR|OD|DU|PX)-/.test(m.id));
  const md = [`# Skill measurement registry: summary (${date})`, '',
    `Packages SKM1-SKM3. Methods registered ${before ? before.methodsRegistered + 5 : '?'} -> ${out.counts.methodsRegistered} (SKM1 212, SKM2's round robin 5, SKM3 ${out.counts.methodsRegistered - 217}); with results ${before ? before.methodsWithResults + 5 : '?'} -> ${out.counts.methodsWithResults} (${out.counts.simMethods} from ${out.counts.designsPlayed} game designs, ${out.counts.methodsWithResults - out.counts.simMethods} offline); ${out.counts.families} families in ${out.counts.kinds} kinds vote. ${out.counts.skillsCovered} of ${out.counts.skills} Maps 0-20 skills have 3+ kinds' estimates. Game \`${fp}\`. Tables: \`summary-${date}.json\`; per-method lines: \`results/<method>.jsonl\`; methods: \`tools/skm/registry.js\`.`, '',
    `- **Games.** Sim rows of today's game; of SKM2's game (\`${GAMES.same}\`: only road decks changed since, so every design but the road one plays the same games); of SKM1's game (\`${GAMES.older}\`: an older engine and cards) except ${STALE.join(', ')}, whose rules or cards changed since. Rows by game: ${Object.entries(L1.games).map(([k, v]) => k + ' ' + v).join(', ')}. The column "today only" drops SKM1's rows.`,
    `- **Verdict.** Each method is divided by its own median worth / price (its exchange rate); a family = the median of its estimators, a kind = the median of its families. **cheap** / **dear**: 3+ kinds and more than half of the kinds 25%+ of max(|price|, 1) above / below the price; else **fair**. Kinds and methods columns: cheap / fair / dear counts. The races' halves (OR offence, DR defence) are listed; their sum (OD) votes.`,
    `- Skills that need partners or an economy (Lumber makers, tribes, blooms, deliveries, weather) read near 0 in every combat design; read "dear" for them as "not measurable this way".`, '',
    `**Verdicts:** ${cnt('cheap')} cheap, ${cnt('fair')} fair, ${cnt('dear')} dear (today only: ${cntT('cheap')} / ${cntT('fair')} / ${cntT('dear')}).`, '',
    `## Verdicts changed since summary-2026-11-20 or confirm-2026-11-21 (${ch.length})`, '',
    '| Skill | Price | Consensus | Gap | Verdict | Kinds c/f/d | Methods c/f/d | Today only | 11-20 | 11-21 confirm |', '|---|---|---|---|---|---|---|---|---|---|', ...ch.map(line), '',
    '## The new methods (SKM3)', '', '| Method | Skills | rho consensus | rho price | Scale |', '|---|---|---|---|---|', ...mine.map(ml), '',
    '## Method agreement (Spearman with the consensus of the other kinds)', '', '| Method | Skills | rho consensus | rho price | Scale |', '|---|---|---|---|---|',
    ...good.slice(0, 6).map(ml), '| ... | | | | |', ...good.slice(-5).map(ml), '',
    '| Kind | Families | Skills | rho consensus |', '|---|---|---|---|', ...kindRows.map(k => `| ${k.kind} | ${k.families.join(', ')} | ${k.skills} | ${k.rhoConsensus} |`), '',
    '## Proposals for the owner', '', ...(P.length ? P.map((p, i) => `${i + 1}. ${p}`) : ['(none yet)']), '',
    `## Every skill (${rows.length})`, '', '| Skill | Price | Consensus | Gap | Verdict | Kinds c/f/d | Methods c/f/d | Today only | 11-20 | 11-21 confirm |', '|---|---|---|---|---|---|---|---|---|---|', ...byV.map(line), ''];
  fs.writeFileSync(path.join(DIR, `summary-${date}.md`), md.join('\n'));
  console.log(`methods ${methods.length} (sim ${simM.length}) of ${R.REG.length}, families ${Object.keys(fams).length}, kinds ${Object.keys(kinds).length}, skills covered ${out.counts.skillsCovered}/${skills.length}; verdicts ${cnt('cheap')} cheap / ${cnt('fair')} fair / ${cnt('dear')} dear; changed ${ch.length}; rows by game ${JSON.stringify(L1.games)}`);
  ch.forEach(r => console.log(`  ${r.skill.padEnd(22)} ${String(r.price).padStart(6)} -> ${String(r.consensus).padStart(6)} ${r.verdict} (kinds ${sides(r.kindsSides)}, methods ${sides(r.methodsSides)}; today ${r.verdictToday}; 11-20 ${r.verdict1120}; confirm ${r.confirm1121 || '-'})`));
}
main();
