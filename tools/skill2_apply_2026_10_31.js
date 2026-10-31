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
  for (let i = start + 1; i < lines.length && !/^ \]/.test(lines[i]); i++) { const m = /^  (\{.*\})(,?)$/.exec(lines[i]); if (!m) continue; let id; try { id = JSON.parse(m[1]).id; } catch (e) { continue; }
    if (!changed[id]) continue; lines[i] = '  ' + JSON.stringify(changed[id]) + m[2]; n++; }
  if (n !== Object.keys(changed).length) throw new Error(`wrote ${n} of ${Object.keys(changed).length} skill lines`);
  const out = lines.join('\n'); JSON.parse(out); return out;
}
function keepWas(e) { if (e.skill2Was) return e; const was = {}; ['scale', 'value', 'pow', 'appliedAt', 'measuredS', 'measuredConf', 'measuredSE', 'measuredHow'].forEach(k => { if (e[k] != null) was[k] = e[k]; }); e.skill2Was = was; return e; }

// the placebo (tools/skill2_measure_2026_10_31.js item 'placebo': {"skill2Placebo": true}, 1,000 fights): gain (win-rate fraction) and worth
function placeboOf() { const J = fs.existsSync(MEAS) ? JSON.parse(fs.readFileSync(MEAS, 'utf8')) : { results: {} }, p = J.results.placebo;
  if (!p) throw new Error('no placebo measure yet (node tools/skill2_measure_2026_10_31.js run --only placebo)'); return { gain: p.test.gain, W: p.test.worthRuler.m, ci: p.test.worthRuler }; }
// ---------------------------------------------------------------- anchors (BUDGET2-2)
function anchors(opt) {
  const { text, table } = readTable(), chk = JSON.parse(fs.readFileSync(CHECK, 'utf8')), sr = chk.statRate;
  // the placebo's gain (a key the engine does not know: the CPU's cardValue + 1.5 a key) is each anchor's zero (one key each)
  const g0 = placeboOf().gain;
  chk.anchors.forEach(a => { a.gainRaw = a.gain; a.gain = a.gain - g0; if (a.worthStat) a.worthStat = { m: a.worthStat.m - g0 / sr.m, lo: a.worthStat.lo - g0 / sr.m, hi: a.worthStat.hi - g0 / sr.m }; });
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
    e.measuredHow = `2026-10-31 (SKILL2): node tools/skill_canon_2026_10_31.js check --games ${chk.context.fights} (global context, carriers ${chk.carriers.join(', ')}, 6 copies, Level 1; docs/balance/skill-canon-check-2026-10-31-skill2-before.json): price = (the anchor's paired gain - the placebo's ${r2(g0 * 100)}, a key the engine does not know: the CPU's cardValue counts keys) / the stat yardstick's gain a 3A + H point (${r2(sr.m * 100)} [${r2(sr.lo * 100)}, ${r2(sr.hi * 100)}] win-rate points); ${ci} (95%, a bootstrap over fights)`;
    e.canonReason = (e.canonReason || '').replace(/; SKILL2[ :(].*$/, '') + `; SKILL2 (2026-10-31): re-set from one shared measure in 3A + H points (${P.map(p => p.key + ' ' + p.old + ' -> ' + r2(p.price)).join(', ')})`;
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
//   - a drawback (a price below 0) stays at or below 0; a skill priced 0 or more that reads 0.3 or less (NOTHING, the placebo's lower
//     bound) is kept: it does not fire on the vanilla carriers (it protects or feeds cards they lack, or needs a target they never meet);
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
  wave: 'Tide fields only', tsunami: 'Tide fields only', supreme: 'Tide fields only',
  dive: 'needs Flying or swimming (the carriers have neither)', changeling: 'shares a type with partners', prayer: 'needs Prayer partners', keenEye: 'against Changelings and in Mist',
  frostbite: 'cold maps (Frostbite Resist, Freezing)', taunt: 'protects partners', guardian: 'protects partners' };
const POW_KEEP = {};
const NOTHING = 0.3;
const HELD_TRIG = ['bee-drone', 'worker-ant'];
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
  // each reading less the placebo's, once a key the test adds (the CPU's cardValue counts keys: Remember + its triggers is two, Hunter + Hunter vs two)
  const Z = placeboOf().W; delete R.placebo;
  Object.values(R).forEach(r => { if (r.placebo) return; /* measured with the canon tool's own placebo (1.1.0): already less it */
    const k = Object.keys((r.test && r.test.effects) || {}).length || 1, w = r.test.worthRuler; r.test.worthRulerRaw = w; r.test.placeboKeys = k;
    r.test.worthRuler = { m: w.m - k * Z, lo: w.lo - k * Z, hi: w.hi - k * Z }; });
  const SH = table.shorthands || {};
  const byId = {}; Object.values(R).forEach(r => { if (r.kind !== 'measure' || r.class === 'trigger') return; const id = r.id; (byId[id] = byId[id] || []).push(r); });
  const changed = {}, rows = [], kept = [], shChanged = {};
  Object.keys(byId).sort().forEach(id => {
    // the entry as it was before SKILL2 (its skill2Was), so a re-run gives the same plan; a canon entry as the anchors left it
    const cur = SK[id], e0 = cur && !cur.canon && cur.skill2Was ? Object.assign(JSON.parse(JSON.stringify(cur)), { pow: undefined }, cur.skill2Was) : cur; if (e0 && e0.pow === undefined) delete e0.pow;
    const pts = byId[id].filter(r => r.class !== 'combo' || SPECIAL[id]).map(r => ({ key: r.key, n: r.n, w: r.nCards, W: r.test.worthRuler.m, ci: r.test.worthRuler, price: r.test.price, fights: r.fights, conf: confOf(r.test.worthRuler) }));
    if (SH[id] && !e0) { shChanged[id] = pts; return; }
    if (id === 'anadromous') { kept.push('anadromous: left to ENG15 (coordinator 10-31: reworked and re-priced there)'); return; }
    if (!e0) { kept.push(`${id}: no table entry`); return; }
    if (e0.canon) {
      // a canon entry with one canon point and readings at other N: its curve between and beyond is refitted as v x N^pow through the canon
      // point (kept exact), pow from the other readings (log space, weighted by cards); two canon points fix v and pow already
      const at = (e0.canonAt || []).filter(n => n !== true), others = pts.filter(p => p.W > 0 && numOf(p.n) > 0 && !at.includes(p.n));
      if (at.length === 1 && others.length) { const Nc = numOf(at[0]), Pc = r2(e0.value * factorOf(e0, at[0])), e = keepWas(JSON.parse(JSON.stringify(e0)));
        const xs = others.map(p => Math.log(numOf(p.n) / Nc)), ys = others.map(p => Math.log(p.W / Pc)), ws = others.map(p => p.w);
        const pw = r3(xs.reduce((t, x, i) => t + ws[i] * x * ys[i], 0) / xs.reduce((t, x, i) => t + ws[i] * x * x, 0)); e.scale = 'n'; e.pow = pw; e.value = r2(Pc / Math.pow(Nc, pw));
        const chk = r2(e.value * Math.pow(Nc, pw)); e.canonCurve = `2026-10-31 (SKILL2): the canon point ${e0.id} ${Nc} = ${Pc} kept (${chk}); the curve v x N^pow refitted through it from ${others.map(p => p.key + ' ' + r2(p.W) + ' [' + r2(p.ci.lo) + ', ' + r2(p.ci.hi) + ']').join('; ')} (was ${e0.scale}${e0.pow != null ? ' pow ' + e0.pow : ''}, which gave ${others.map(p => r2(e0.value * factorOf(e0, p.n))).join(' / ')})`;
        changed[id] = e; rows.push({ id, kind: 'set', old: e0.value, oldPow: e0.pow, value: e.value, pow: e.pow, scale: e.scale, conf: 'canon', pts, why: e.canonCurve }); return; }
      pts.forEach(p => rows.push({ id, kind: 'canon', note: `${p.key}: measured ${r2(p.W)} [${r2(p.ci.lo)}, ${r2(p.ci.hi)}], the canon curve gives ${r2(e0.value * factorOf(e0, p.n))} (kept: two canon points fix the curve)` })); return; }
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
      } else { const num = use.reduce((t, p) => t + p.w * p.W * factorOf(e, p.n), 0), den = use.reduce((t, p) => t + p.w * factorOf(e, p.n) ** 2, 0); e.value = r2(den ? num / den : e.value); why = use.length > 1 ? 'least squares over ' + use.length + ' N' : '';
        // two or more N whose readings the entry's scale fits badly (Arrow 1 / 2 read 4.4 / 6.7, not 1 : 2): a power curve v x N^pow (scale n)
        // when it halves the weighted squared error
        const q = use.filter(p => p.W > 0 && numOf(p.n) > 0);
        if (new Set(q.map(p => numOf(p.n))).size >= 2 && e.scale !== 'fixed') {
          const X = q.map(p => Math.log(numOf(p.n))), Y = q.map(p => Math.log(p.W)), Wt = q.map(p => p.w), sw = Wt.reduce((a, b) => a + b, 0);
          const mx = X.reduce((t, x, i) => t + Wt[i] * x, 0) / sw, my = Y.reduce((t, y, i) => t + Wt[i] * y, 0) / sw;
          const sxx = X.reduce((t, x, i) => t + Wt[i] * (x - mx) ** 2, 0), sxy = X.reduce((t, x, i) => t + Wt[i] * (x - mx) * (Y[i] - my), 0), pw = sxx ? sxy / sxx : 1, v = Math.exp(my - pw * mx);
          const sse = f => use.reduce((t, p) => t + p.w * (p.W - f(p)) ** 2, 0), sScale = sse(p => e.value * factorOf(e, p.n)), sPow = sse(p => v * Math.pow(Math.max(1, numOf(p.n)), pw));
          if (sPow < 0.5 * sScale) { why = `a power curve fits its ${q.length} N better than its '${e.scale}' scale (squared error ${r2(sPow)} vs ${r2(sScale)}): scale n, v x N^pow`; e.scale = 'n'; e.value = r2(v); e.pow = r3(pw); }
        } }
      fitv = e.value;
    }
    if (CONDITIONAL[id] && e.value < e0.value) { kept.push(`${id}: reads ${e.value} < ${e0.value} (${CONDITIONAL[id]}); kept`); rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: CONDITIONAL[id] + ': a low reading is not applied', pts }); return; }
    if (e0.value < 0 && e.value > 0) { rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: 'a drawback stays at or below 0 (read ' + e.value + ')', pts }); return; }
    // NOTHING (0.3, the placebo's lower bound): a positive skill that reads at or below it does not fire on these carriers (it needs a partner, a field or a target they lack): its price is kept, never lowered by it
    if (e0.value >= 0 && e.value <= NOTHING && e.value < e0.value) { rows.push({ id, kind: 'kept', old: e0.value, fit: e.value, note: 'reads nothing on the vanilla carriers (' + e.value + ' <= ' + NOTHING + '): kept', pts }); return; }
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
  Object.keys(shChanged).forEach(id => { const pts = shChanged[id], sh = SH[id]; const old = 1; /* the measured prices had no mult */
    const num = pts.reduce((t, p) => t + p.w * p.W * (p.price / old), 0), den = pts.reduce((t, p) => t + p.w * (p.price / old) ** 2, 0), mult = r2(den ? num / den : 1);
    if (CONDITIONAL[id] && mult < old) { shRows.push({ id, kind: 'kept', mult, old }); return; }
    shRows.push({ id, kind: 'set', old, mult, pts }); });
  // trigger entries: a pair "on>do" (the action as tools/skill_costs.js aliases it) gets mult = Σ w W p / Σ w p² over its measured in-play
  // entries (p = the entry's price before, w = its cards): table.pairs, read by tools/skill_costs.js triggerCost
  const ALIAS = table.aliases || {}, pairs = {};
  Object.values(R).filter(r => r.class === 'trigger' && r.kind === 'measure').forEach(r => { const t = r.test.effects.triggers[0], k = t.on + '>' + (ALIAS[t.do] || t.do); (pairs[k] = pairs[k] || []).push(r); });
  const trRows = [];
  Object.keys(pairs).sort().forEach(k => { const list = pairs[k].filter(r => Math.abs(r.test.price) > 0.05), old = 1; /* the measured prices had no pair mult */ if (!list.length) return;
    // the owner holds the Bee Drone's and the Worker Ant's trigger prices for RECOST1-3's package (RECOST1-5, 10-30 23:25 "hold them")
    const held = list.filter(r => r.cards.some(c => HELD_TRIG.includes(c))); if (held.length) { kept.push(`${k}: held (RECOST1-5: ${held.map(r => r.cards.join(', ')).join('; ')}); measured ${list.map(r => r2(r.test.worthRuler.m) + ' / ' + r.test.price).join(', ')}`); return; }
    const num = list.reduce((t, r) => t + r.nCards * r.test.worthRuler.m * (r.test.price / old), 0), den = list.reduce((t, r) => t + r.nCards * (r.test.price / old) ** 2, 0);
    let mult = r2(den ? num / den : 1), note = ''; const id0 = k.split('>')[1];
    if (mult * list.reduce((t, r) => t + r.test.price, 0) / list.length <= NOTHING && mult < 1) { kept.push(k + ': reads nothing on the vanilla carriers (' + list.map(r => r2(r.test.worthRuler.m)).join(', ') + '): kept'); return; }
    trRows.push({ pair: k, old, mult, note, entries: list.map(r => ({ key: r.key, W: r2(r.test.worthRuler.m), lo: r2(r.test.worthRuler.lo), hi: r2(r.test.worthRuler.hi), price: r.test.price, fights: r.fights, cards: r.cards })) }); });
  // print
  rows.forEach(r => { if (r.kind === 'set') console.log(`set  ${r.id.padEnd(18)} ${String(r.old).padStart(6)}${r.oldPow != null ? '^' + r.oldPow : ''} -> ${String(r.value).padStart(6)}${r.pow != null ? '^' + r.pow : ''} (${r.scale}, ${r.conf})  ${r.pts.map(p => p.key + ' ' + r2(p.W) + ' was ' + p.price).join('; ')} ${r.why || ''}`);
    else if (r.kind === 'kept') console.log(`kept ${r.id.padEnd(18)} ${r.old} (read ${r.fit}): ${r.note}`); else if (r.kind === 'canon') console.log(`canon ${r.id}: ${r.note}`); });
  shRows.forEach(r => console.log(`shorthand ${r.id}: mult ${r.old} -> ${r.mult} (${r.kind})`));
  trRows.forEach(r => console.log(`pair ${r.pair.padEnd(28)} mult ${r.old} -> ${r.mult} ${r.note}  ${r.entries.map(x => x.key.replace(/^T:/, '').slice(0, 44) + ' ' + x.W + ' / ' + x.price).join(' | ')}`));
  kept.forEach(k => console.log('note: ' + k));
  const plan = { rows, shorthands: shRows, pairs: trRows, kept };
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skill2-prices-2026-10-31.json'), JSON.stringify(Object.assign({ _about: 'SKILL2 (2026-10-31): the price plan node tools/skill2_apply_2026_10_31.js prices builds from docs/balance/skill2-measures-2026-10-31.json (applied unless --dry).' }, plan), null, 1) + '\n');
  if (opt.dry) return plan;
  let out = writeSkills(text, changed); const t2 = JSON.parse(out);
  // shorthands and triggers are single lines too ("shorthands" is one line; trigger entries a line each)
  shRows.filter(r => r.kind === 'set').forEach(r => { t2.shorthands[r.id].mult = r.mult; t2.shorthands[r.id].skill2 = `2026-10-31 (SKILL2, BUDGET2-1): mult ${r.old} -> ${r.mult}, measured ${r.pts.map(p => p.key + ' ' + r2(p.W) + ' (price before ' + p.price + ')').join('; ')}`; });
  const lines = out.split('\n');
  const si = lines.findIndex(l => /^ "shorthands": /.test(l)); lines[si] = ' "shorthands": ' + JSON.stringify(t2.shorthands) + ',';
  // "pairs": a new one-line key before "skills" (one pair a key: {mult, skill2})
  const P2 = Object.assign({}, t2.pairs || {}); trRows.forEach(r => { P2[r.pair] = { mult: r.mult, skill2: `2026-10-31 (SKILL2, BUDGET2-1): measured ${r.entries.map(x => x.key.replace(/^T:/, '') + ' ' + x.W + ' [' + x.lo + ', ' + x.hi + '] (' + x.fights + ' fights; price before ' + x.price + '; ' + x.cards.join(', ') + ')').join('; ')}; mult = Σ w W p / Σ w p²${r.note ? '; ' + r.note : ''}` }; });
  const pi = lines.findIndex(l => /^ "pairs": /.test(l)), pline = ' "pairs": ' + JSON.stringify(P2) + ',';
  if (pi >= 0) lines[pi] = pline; else lines.splice(lines.findIndex(l => /^ "skills": \[/.test(l)), 0, pline);
  out = lines.join('\n'); JSON.parse(out);
  fs.writeFileSync(FILE, out); console.log(`-> canonical/skill-costs.json (${Object.keys(changed).length} skills, ${shRows.filter(r => r.kind === 'set').length} shorthands, ${trRows.length} trigger pairs)`);
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
