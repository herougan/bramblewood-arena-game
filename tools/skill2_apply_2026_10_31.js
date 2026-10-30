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

// ---------------------------------------------------------------- prices (BUDGET2-1)
// The rules, per table entry (a keyword or a shorthand) with measured points (its N on in-play cards):
//   - a canon entry keeps its canon price (its other N are reported against its curve);
//   - value = the least-squares fit through its measured points, weighted by the in-play cards at each N: Σ w W f / Σ w f² (f = the entry's
//     factor at N: N, N^pow, 1 + floor(N/2) or 1); a power-curve entry measured at two or more N gets value and pow fitted in log space
//     (POW_FIT), unless it is pinned (POW_KEEP);
//   - CONDITIONAL skills (a field, a map, a partner the vanilla carriers and the global fields rarely give) are raised to their reading but
//     never lowered by it: a low reading there means "the carriers cannot show it" (docs/evaluation-protocol.md section 5);
//   - a drawback (a price below 0) stays at or below 0, and a skill priced 0 or more never goes below 0 (a negative reading on the vanilla
//     carriers: it protects or feeds cards they do not have);
//   - SPECIAL entries are priced by their own rule (below, each with its reason);
//   - triggers: each measured trigger entry's worth / its price before; a trigger's weight (canonical/skill-costs.json triggers) is
//     multiplied by the median of that ratio over its in-play entries (weighted by cards): the trigger layer's "how often" in the new
//     currency; the per-entry residuals are reported. A trigger with no in-play entry keeps its weight.
const CONDITIONAL = { tide: 'Tide fields only', mountainClimber: 'mountain terrain only', dry: 'dry maps only', heat: 'hot maps only', drought: 'Drought only',
  frost: 'cold maps only', storm: 'storms only', fog: 'Mist only', darksight: 'dark fights only', illuminate: 'dark fights only', canopyCover: 'forest maps only',
  swarm: 'needs its own type beside it', kinship: 'needs its type beside it', pack: 'needs its pack', packLeader: 'needs its pack', hunter: 'needs its prey type',
  sentry: 'needs an attacker in its lane', king: 'needs its court', converge: 'needs its targets', carrion: 'needs deaths beside it', prey: 'needs a Predator',
  heavyMetal: 'needs Metal', bedrock: 'needs Stone', timbered: 'needs Lumber cards', lumberjack: 'needs Lumber cards', quarry: 'pays in Stone', prospector: 'pays in Metal',
  foePlenty: 'needs the foe\'s resources', foeScarcity: 'needs the foe\'s resources', onSpawnDevilry: 'needs Devilry cards', sacrifice: 'needs allies to spend',
  wave: 'Tide fields only', tsunami: 'Tide fields only', supreme: 'Tide fields only' };
const POW_KEEP = {};
const SPECIAL = {
  // DECK1-1: Remember N acts only from the Exile zone, through its card's own On Death → Exile self; measured as the pair (Remember 1 on the
  // Ashbone Ghoul, Remember 2 on the Marsh Wisp). The pair reads less at 2 (two Echoes to wait for), so Remember is a power curve with a
  // negative power through its two points (the trigger's own -0.08 added back): S(N) = v x N^pow.
  remember: (pts, e) => { const p1 = pts.find(p => numOf(p.n) === 1), p2 = pts.find(p => numOf(p.n) === 2); if (!p1 || !p2) return null;
    const x = 0.08, v = p1.W + x, w2 = p2.W + x; return { scale: 'n', value: r2(v), pow: r3(Math.log(w2 / v) / Math.log(2)), why: 'Remember 1 / 2 with their On Death → Exile self, as the cards carry them (DECK1-1): ' + r2(p1.W) + ' / ' + r2(p2.W) + ' with the trigger\'s -0.08 added back' }; },
  // DECK1-1: Fletcher N adds N to every arrow of its side; the Quartermaster carries it beside its own Arrow 1. Its price = (Arrow 1 + Fletcher 1)
  // minus Arrow 1 alone, on the same fights (the pair), at 1 a point (scale n); the reading on carriers with no arrow of their own is reported.
  fletcher: (pts, e, R) => { const pr = R['arrow=1+fletcher=1'], a1 = R['arrow=1']; if (!pr || !a1) return null; const v = pr.test.worthRuler.m - a1.test.worthRuler.m;
    return { scale: 'n', value: r2(v), why: `(Arrow 1 + Fletcher 1) ${r2(pr.test.worthRuler.m)} - Arrow 1 ${r2(a1.test.worthRuler.m)}, the Quartermaster's pair (DECK1-1); on carriers with no arrow of their own ${r2((R['fletcher=1'] || { test: { worthRuler: {} } }).test.worthRuler.m)}` }; },
};
function confOf(w) { const se = (w.hi - w.lo) / 3.92, m = Math.abs(w.m); return se <= Math.max(0.3, 0.15 * m) ? 'high' : se <= Math.max(0.6, 0.3 * m) ? 'medium' : 'low'; }
function prices(opt) {
  const { text, table } = readTable(), J = JSON.parse(fs.readFileSync(MEAS, 'utf8')), R = J.results, SK = {}; table.skills.forEach(e => { SK[e.id] = e; });
  const SH = table.shorthands || {};
  const byId = {}; Object.values(R).forEach(r => { if (r.kind !== 'measure' || r.class === 'trigger') return; const id = r.id; (byId[id] = byId[id] || []).push(r); });
  const changed = {}, rows = [], kept = [], shChanged = {};
  Object.keys(byId).sort().forEach(id => {
    const e0 = SK[id]; const pts = byId[id].filter(r => r.class !== 'combo' || SPECIAL[id]).map(r => ({ key: r.key, n: r.n, w: r.nCards, W: r.test.worthRuler.m, ci: r.test.worthRuler, price: r.test.price, fights: r.fights, conf: confOf(r.test.worthRuler) }));
    if (SH[id] && !e0) { shChanged[id] = pts; return; }
    if (!e0) { kept.push(`${id}: no table entry`); return; }
    if (e0.canon) { pts.forEach(p => rows.push({ id, kind: 'canon', note: `${p.key}: measured ${r2(p.W)} [${r2(p.ci.lo)}, ${r2(p.ci.hi)}], the canon curve gives ${r2(e0.value * factorOf(e0, p.n))} (kept: a canon entry)` })); return; }
    const e = keepWas(JSON.parse(JSON.stringify(e0)));
    let fitv = null, why = '';
    if (SPECIAL[id]) { const s = SPECIAL[id](byId[id].map(r => ({ key: r.key, n: r.n, W: r.test.worthRuler.m })), e0, R); if (s) { e.scale = s.scale; e.value = s.value; if (s.pow != null) e.pow = s.pow; else delete e.pow; why = s.why; fitv = s.value; } }
    if (fitv == null) {
      const use = pts.filter(p => !/\+/.test(p.key));
      if (e.pow != null && !POW_KEEP[id] && new Set(use.map(p => numOf(p.n))).size >= 2) { // log-space fit of v x N^pow over the positive readings
        const q = use.filter(p => p.W > 0 && numOf(p.n) > 0); const X = q.map(p => Math.log(numOf(p.n))), Y = q.map(p => Math.log(p.W)), Wt = q.map(p => p.w);
        const sw = Wt.reduce((a, b) => a + b, 0), mx = X.reduce((t, x, i) => t + Wt[i] * x, 0) / sw, my = Y.reduce((t, y, i) => t + Wt[i] * y, 0) / sw;
        const sxx = X.reduce((t, x, i) => t + Wt[i] * (x - mx) * (x - mx), 0), sxy = X.reduce((t, x, i) => t + Wt[i] * (x - mx) * (Y[i] - my), 0);
        e.pow = r3(sxx ? sxy / sxx : +e.pow); e.value = r2(Math.exp(my - e.pow * mx)); why = 'v x N^pow fitted in log space';
      } else { const num = use.reduce((t, p) => t + p.w * p.W * factorOf(e, p.n), 0), den = use.reduce((t, p) => t + p.w * factorOf(e, p.n) ** 2, 0); e.value = r2(den ? num / den : e.value); why = use.length > 1 ? 'least squares over ' + use.length + ' N' : ''; }
      fitv = e.value;
    }
    if (CONDITIONAL[id] && e.value < e0.value) { kept.push(`${id}: reads ${e.value} < ${e0.value} (${CONDITIONAL[id]}); kept`); rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: CONDITIONAL[id] + ': a low reading is not applied', pts }); return; }
    if (e0.value < 0 && e.value > 0) { rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: 'a drawback stays at or below 0 (read ' + e.value + ')', pts }); return; }
    if (e0.value >= 0 && e.value < 0) { if (e0.value === 0) { rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: 'not a drawback: stays at 0 (read ' + e.value + ')', pts }); return; } e.value = 0; why = (why ? why + '; ' : '') + 'read below 0, set to 0 (not a drawback)'; }
    if (e0.value === e.value && e0.pow === e.pow) { rows.push({ id, kind: 'same', old: e0.value, fit: e.value, pts }); return; }
    const c = pts.map(p => p.conf), conf = c.includes('high') ? 'high' : c.includes('medium') ? 'medium' : 'low';
    e.measuredS = e.value; e.measuredConf = conf; e.measuredSE = r2(Math.min(...pts.map(p => (p.ci.hi - p.ci.lo) / 3.92 / Math.max(1e-9, factorOf(e, p.n)))));
    e.appliedAt = '2026-10-31 (package SKILL2, decision BUDGET2-1: re-measured against the re-canonised anchors, in 3A + H stat points)';
    e.measuredHow = `2026-10-31 (SKILL2): node tools/skill2_measure_2026_10_31.js run (tools/skill_canon_2026_10_31.js measure, global context, the canon's six vanilla carriers, 6 copies, Level 1): ` +
      pts.map(p => `${p.key} ${r2(p.W)} [${r2(p.ci.lo)}, ${r2(p.ci.hi)}] (${p.fights} fights, ${p.w} in-play card${p.w > 1 ? 's' : ''}; price before ${p.price})`).join('; ') + (why ? '; ' + why : '') + '; docs/balance/skill2-measures-2026-10-31.json';
    changed[id] = e; rows.push({ id, kind: 'set', old: e0.value, oldPow: e0.pow, value: e.value, pow: e.pow, scale: e.scale, conf, pts, why });
  });
  // shorthands (Bounty, Kin Rally, Milling): a `mult` on the shorthand (tools/skill_costs.js: trigger x action x mult), so the shared trigger
  // weight and action value stay
  const shRows = [];
  // (computed after the trigger weights below: a shorthand's price moves with its trigger's new weight first)
  const shorthandRows = trRows => Object.keys(shChanged).forEach(id => { const pts = shChanged[id], sh = SH[id]; const old = sh.mult || 1, tr = trRows.find(t => t.on === sh.trigger), k = tr ? tr.ratio : 1;
    const num = pts.reduce((t, p) => t + p.w * p.W * (p.price * k / old), 0), den = pts.reduce((t, p) => t + p.w * (p.price * k / old) ** 2, 0), mult = r2(den ? num / den : 1);
    if (CONDITIONAL[id] && mult < old) { shRows.push({ id, kind: 'kept', mult, old }); return; }
    shRows.push({ id, kind: 'set', old, mult, pts }); });
  // triggers
  const trig = {}; Object.values(R).filter(r => r.class === 'trigger' && r.kind === 'measure').forEach(r => { const on = r.id.split('>')[0]; (trig[on] = trig[on] || []).push(r); });
  const trRows = [];
  Object.keys(trig).sort().forEach(on => { const list = trig[on].filter(r => Math.abs(r.test.price) > 0.05); if (!list.length) return;
    const xs = []; list.forEach(r => { for (let i = 0; i < r.nCards; i++) xs.push(r.test.worthRuler.m / r.test.price); }); xs.sort((a, b) => a - b);
    const med = xs.length % 2 ? xs[(xs.length - 1) / 2] : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2;
    const T0 = table.triggers.find(t => t.id === on); trRows.push({ on, old: T0.value, ratio: r2(med), value: r2(T0.value * Math.max(0, med)), entries: list.map(r => ({ key: r.key, W: r.test.worthRuler.m, price: r.test.price, ratio: r2(r.test.worthRuler.m / r.test.price), cards: r.cards })) }); });
  shorthandRows(trRows);
  // print
  rows.forEach(r => { if (r.kind === 'set') console.log(`set  ${r.id.padEnd(18)} ${String(r.old).padStart(6)}${r.oldPow != null ? '^' + r.oldPow : ''} -> ${String(r.value).padStart(6)}${r.pow != null ? '^' + r.pow : ''} (${r.scale}, ${r.conf})  ${r.pts.map(p => p.key + ' ' + r2(p.W) + ' was ' + p.price).join('; ')} ${r.why || ''}`);
    else if (r.kind === 'kept') console.log(`kept ${r.id.padEnd(18)} ${r.old} (read ${r.fit}): ${r.note}`); else if (r.kind === 'canon') console.log(`canon ${r.id}: ${r.note}`); });
  shRows.forEach(r => console.log(`shorthand ${r.id}: mult ${r.old} -> ${r.mult} (${r.kind})`));
  trRows.forEach(r => console.log(`trigger ${r.on}: weight ${r.old} x ${r.ratio} = ${r.value}  ${r.entries.map(x => x.key.slice(0, 40) + ' ' + r2(x.W) + '/' + x.price).join(' | ')}`));
  kept.forEach(k => console.log('note: ' + k));
  const plan = { rows, shorthands: shRows, triggers: trRows, kept };
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skill2-prices-2026-10-31.json'), JSON.stringify(Object.assign({ _about: 'SKILL2 (2026-10-31): the price plan node tools/skill2_apply_2026_10_31.js prices builds from docs/balance/skill2-measures-2026-10-31.json (applied unless --dry).' }, plan), null, 1) + '\n');
  if (opt.dry) return plan;
  let out = writeSkills(text, changed); const t2 = JSON.parse(out);
  // shorthands and triggers are single lines too ("shorthands" is one line; trigger entries a line each)
  shRows.filter(r => r.kind === 'set').forEach(r => { t2.shorthands[r.id].mult = r.mult; t2.shorthands[r.id].skill2 = `2026-10-31 (SKILL2, BUDGET2-1): mult ${r.old} -> ${r.mult}, measured ${r.pts.map(p => p.key + ' ' + r2(p.W) + ' (price before ' + p.price + ')').join('; ')}`; });
  const lines = out.split('\n');
  const si = lines.findIndex(l => /^ "shorthands": /.test(l)); lines[si] = ' "shorthands": ' + JSON.stringify(t2.shorthands) + ',';
  trRows.forEach(r => { const i = lines.findIndex(l => l.startsWith('  {"id":"' + r.on + '",')); const t = JSON.parse(lines[i].replace(/,$/, '')); if (t.skill2Was == null) t.skill2Was = { value: t.value };
    t.value = r.value; t.skill2 = `2026-10-31 (SKILL2, BUDGET2-1): weight ${r.old} x ${r.ratio} (the median of worth / price over its in-play entries: ${r.entries.map(x => x.key.replace(/^T:/, '').slice(0, 60) + ' ' + r2(x.W) + ' / ' + x.price).join('; ')})`;
    lines[i] = '  ' + JSON.stringify(t) + (lines[i].endsWith(',') ? ',' : ''); });
  out = lines.join('\n'); JSON.parse(out);
  fs.writeFileSync(FILE, out); console.log(`-> canonical/skill-costs.json (${Object.keys(changed).length} skills, ${shRows.filter(r => r.kind === 'set').length} shorthands, ${trRows.length} trigger weights)`);
  return plan;
}

async function main(argv) {
  const cmd = argv[0], opt = { dry: argv.includes('--dry') };
  if (cmd === 'anchors') return anchors(opt);
  if (cmd === 'prices') return prices(opt);
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { factorOf, readTable, writeSkills, keepWas };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
