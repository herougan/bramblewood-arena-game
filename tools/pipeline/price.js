'use strict';
// SPEED1 (2026-10-31): the `price` step. Writes the measured prices into canonical/skill-costs.json (tools/skill2_apply_2026_10_31.js prices)
// and, when told to, the budget constants (tools/pipeline/constants.js).
//   run.sh price [--dry] [--set-const cap2SScale=0.5,flying=1.13,evasive=1.13] [--include-map]
// Measures read: docs/balance/skill2-measures-2026-10-31.json (SKILL2) with docs/balance/pipeline/measures.json (global context) laid over it,
// per plan key, the newer one winning. Home-map measures (--map N) are recorded only: a skill that needs a map is raised to its reading, never
// lowered (the CONDITIONAL rule of the price tool), and that reading is for the owner (SKILL2-4), unless --include-map.
// The table before is kept in docs/balance/pipeline/state/skill-costs.before-price.json with the budget constants at that time, so `refit`
// can tell which cards the new prices (or constants) pushed out. Half-miss skills (Flying, Evasive) are read from their measures and reported
// as the multiplier they imply; they change only through --set-const (an owner call).
const fs = require('fs'), path = require('path');
const P = require('./lib.js'), K = require('./constants.js');
const TABLE = path.join(P.ROOT, 'canonical', 'skill-costs.json');
const BEFORE = path.join(P.STATE, 'skill-costs.before-price.json'), MERGED = path.join(P.STATE, 'merged-measures.json'), PLAN = path.join(P.STATE, 'price-plan.json');

function diffTables(a, b) {
  const out = [], by = t => { const o = {}; t.skills.forEach(e => { o[e.id] = e; }); return o; }, A = by(a), B = by(b);
  Object.keys(B).forEach(id => { const x = A[id], y = B[id]; if (!x) { out.push({ id, field: 'skill', old: '-', new: `${y.value}${y.pow != null ? '^' + y.pow : ''} (new)` }); return; }
    if (x.value !== y.value || x.pow !== y.pow || x.scale !== y.scale) out.push({ id, field: 'value', old: `${x.value}${x.pow != null ? '^' + x.pow : ''}`, new: `${y.value}${y.pow != null ? '^' + y.pow : ''}` }); });
  Object.keys(b.shorthands || {}).forEach(id => { const x = (a.shorthands || {})[id], y = b.shorthands[id]; if (!x || x.mult !== y.mult) out.push({ id: 'shorthand ' + id, field: 'mult', old: x ? x.mult : '-', new: y.mult }); });
  Object.keys(b.pairs || {}).forEach(k => { const x = (a.pairs || {})[k], y = b.pairs[k]; if (!x || x.mult !== y.mult) out.push({ id: 'pair ' + k, field: 'mult', old: x ? x.mult : '-', new: y.mult }); });
  return out;
}
// the multiplier a half-miss measure implies: 1 + worth / (the stat terms), the stat terms = the price on the carriers / (the multiplier then - 1)
// (a SKILL2 reading taken before the canon tool subtracted the placebo itself, `placebo` unset, is less the placebo's worth once, as the price tool does)
function halfMissReadings(R, table, now) {
  const out = {}, Z = R.placebo && R.placebo.test ? R.placebo.test.worthRuler.m : 0;
  (table.halfMiss || []).forEach(id => { const r = R[id]; if (!r || !r.test) return; const mNow = now[id] != null ? now[id] : (table.budget || {}).missMult || 1.5, price = r.test.price, z = r.placebo ? 0 : Z, W = r.test.worthRuler.m - z;
    if (!(mNow > 1) || !(price > 0)) return; const stat = price / (mNow - 1);
    out[id] = { measured: P.r2(1 + W / stat), lo: P.r2(1 + (r.test.worthRuler.lo - z) / stat), hi: P.r2(1 + (r.test.worthRuler.hi - z) / stat), now: mNow, worth: W, from: r.ctx ? 'pipeline measures' : 'SKILL2 measures', fingerprint: r.fingerprint }; });
  return out;
}

async function step(args, S) {
  const SM = require('../skill2_measure_2026_10_31.js'), t = P.readJson(TABLE);
  const skill2 = P.readJson(SM.OUT, { results: {} }).results, mine = P.readJson(path.join(P.OUTDIR, 'measures.json'), { results: {} }).results, R = JSON.parse(JSON.stringify(skill2));
  let overlay = 0, mapOnly = 0;
  Object.keys(mine).forEach(k => { const [ctx, key] = [k.slice(0, k.indexOf('|')), k.slice(k.indexOf('|') + 1)];
    if (ctx !== 'global' && !args['include-map']) { mapOnly++; return; } R[key] = mine[k]; overlay++; });
  P.writeJson(MERGED, { _about: 'SPEED1 price step: SKILL2 measures with the pipeline measures laid over them', results: R });
  process.env.SKILL2_MEAS = MERGED; process.env.SKILL2_PRICES_OUT = PLAN; const A = require('../skill2_apply_2026_10_31.js'); // its MEAS is read when it loads
  const consts = K.read(), want = K.parse(args['set-const']);
  P.writeJson(BEFORE, { savedAt: new Date().toISOString(), constants: { cap2SScale: consts.cap2SScale, missMultBy: { flying: consts.flying, evasive: consts.evasive, shadow: consts.shadow } }, table: t });
  S.inputs = { measures: path.relative(P.ROOT, MERGED), skill2Items: Object.keys(skill2).length, pipelineItems: overlay, mapRecordedOnly: mapOnly, constantsBefore: consts, setConst: want, dry: !!args.dry };
  // the price tool: its console is the plan; keep it out of the 20-line summary
  const log = console.log; const lines = []; console.log = (...a) => lines.push(a.join(' '));
  let plan; try { plan = A.prices.call(null, { dry: !!args.dry }) || P.readJson(PLAN); } finally { console.log = log; }
  if (!plan) plan = P.readJson(PLAN);
  // only skills with a measure in the pipeline's own store are priced here: the price tool re-fits a canon curve through its own rounded point, so
  // a re-run drifts in the third digit on entries nobody measured; those, the shorthands and the trigger pairs go back unless a new measure names them
  if (!args.dry) {
    const mine = new Set(Object.keys(P.readJson(path.join(P.OUTDIR, 'measures.json'), { results: {} }).results).filter(k => args['include-map'] || k.startsWith('global|')).map(k => (P.readJson(path.join(P.OUTDIR, 'measures.json')).results[k] || {}).id)), trig = Object.keys(P.readJson(path.join(P.OUTDIR, 'measures.json'), { results: {} }).results).some(k => /\|T:/.test(k));
    const text = fs.readFileSync(TABLE, 'utf8'), cur = JSON.parse(text), back = {}; const bySkill = {}; t.skills.forEach(e => { bySkill[e.id] = e; });
    cur.skills.forEach(e => { if (!mine.has(e.id) && JSON.stringify(e) !== JSON.stringify(bySkill[e.id])) back[e.id] = bySkill[e.id]; });
    let out = Object.keys(back).length ? A.writeSkills(text, back) : text; const lines = out.split('\n');
    if (!trig) { const si = lines.findIndex(l => /^ "shorthands": /.test(l)), pi = lines.findIndex(l => /^ "pairs": /.test(l)); if (si >= 0) lines[si] = ' "shorthands": ' + JSON.stringify(t.shorthands) + ','; if (pi >= 0) { if (t.pairs) lines[pi] = ' "pairs": ' + JSON.stringify(t.pairs) + ','; else lines.splice(pi, 1); } }
    out = lines.join('\n'); JSON.parse(out); if (out !== text) fs.writeFileSync(TABLE, out);
    if (Object.keys(back).length) S.notes.push(`left as they were (no new measure): ${Object.keys(back).join(', ')}`);
  }
  const after = P.readJson(TABLE), changed = diffTables(t, after);
  S.changed.push(...changed);
  const kinds = {}; (plan.rows || []).forEach(r => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
  S.counts = { 'skills set': kinds.set || 0, 'kept': kinds.kept || 0, 'canon (curve kept)': kinds.canon || 0, 'table entries changed': changed.length, 'trigger pairs': (plan.pairs || []).length };
  S.files.push(path.relative(P.ROOT, PLAN), path.relative(P.ROOT, MERGED));
  // recorded only: the measured points of canon curves (Armor 4, 5) and the half-miss readings
  const rec = (plan.rows || []).filter(r => r.kind === 'canon').map(r => r.note).filter(Boolean);
  rec.slice(0, 6).forEach(n => S.notes.push('record: ' + n));
  const hm = halfMissReadings(R, t, { flying: consts.flying, evasive: consts.evasive, shadow: consts.shadow }); S.inputs.halfMiss = hm;
  Object.keys(hm).forEach(id => { const h = hm[id]; if (Math.abs(h.measured - h.now) > 0.05 && !want[id]) S.flagged.push({ id: id + ' multiplier', why: `measures imply x${h.measured} [${h.lo}, ${h.hi}], the budget has x${h.now} (an owner call: --set-const ${id}=${h.measured})` }); });
  // the constants: only those named, by value, with the measure that backs them
  if (Object.keys(want).length) {
    if (args.dry) S.notes.push('dry: constants not written (' + Object.keys(want).join(', ') + ')');
    else {
      Object.keys(want).forEach(k => { if (hm[k] && Math.abs(hm[k].measured - want[k]) > 0.03) S.flagged.push({ id: k + ' multiplier', why: `set to x${want[k]} but the measure reads x${hm[k].measured} [${hm[k].lo}, ${hm[k].hi}]` }); });
      const why = { cap2SScale: 'owner SKILL2-1', miss: 'owner SKILL2-2, the measured value (docs/balance/skill2-measures-2026-10-31.json)' };
      const done = K.apply(want, why, '2026-10-31'); S.changed.push(...done); S.counts['constants set'] = done.length;
      S.inputs.constantsAfter = K.read();
    }
  }
  S.files.push(path.relative(P.ROOT, TABLE));
}
module.exports = { step, BEFORE, diffTables, halfMissReadings };
