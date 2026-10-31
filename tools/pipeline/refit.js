'use strict';
// SPEED1 (2026-10-31): the `refit` step. For every in-play card the new prices (or budget constants) pushed out of tolerance, the smallest stat
// change by the fixed rule of tools/skill2_refit_2026_10_31.js (BUDGET2's: the smallest relative change, an over card only loses, an under card
// only gains, the Attack given up is handed back as Health); the rule-clean ones are written into canonical/cards.json by
// tools/skill2_apply_cards_2026_10_31.py, the rest go to `flagged` and are NOT applied:
//   - the card has no fit at all (its skills alone break a cap), or the plan holds it (Anadromous: ENG15; the Dragons; the held Bee Drone / Worker Ant);
//   - the change is more than 2 stat points (|dAttack| + |dHealth|, config.json refit.maxStatPoints);
//   - theme clash: the card would change body shape (hitter / balanced / wall) or the fit gives up its last point of Attack;
//   - a named owner card (config.json refit.ownerCards: BUDGET2-5, DECK1-1, DECK1-5, RECOST1-5).
// "Pushed out" = inside tolerance under the skill table and budget constants of the last `price` step's snapshot, outside now; a card that was
// already outside is left alone (the Dragons, eggs, equipment). Out-of-play cards are counted, not touched.
//   run.sh refit [--dry] [--ids a,b]   (--dry: the plan and the summary, cards.json untouched)
const fs = require('fs'), path = require('path');
const P = require('./lib.js');
const PLANF = path.join(P.STATE, 'refit-plan.json'), CARDS = path.join(P.ROOT, 'canonical', 'cards.json');
const shapeOf = (a, h) => { const r = (+a || 0) / Math.max(1, +h || 1); const i = P.CONFIG.refit.themeShapes.findIndex(([lo, hi]) => r >= lo && r < hi); return i; };
const sp = s => { const m = /^(-|\d+)\/(\d+)$/.exec(s); return m ? [m[1] === '-' ? null : +m[1], +m[2]] : [null, null]; };

function classify(r, cfg, byId) {
  const [a0, h0] = sp(r.stats), a1 = r.attack, h1 = r.health, dA = a1 == null ? 0 : a1 - (a0 || 0), dH = h1 - h0, pts = Math.abs(dA) + Math.abs(dH), why = [];
  const c = byId[r.id] || {};
  if (cfg.ownerCards.includes(r.id)) why.push('named owner card (' + cfg.ownerWhy + ')');
  if ((c.effects || {})[cfg.skipSkills[0]]) why.push(cfg.skipSkills[0] + ': ' + cfg.skipWhy);
  if (pts > cfg.maxStatPoints) why.push(`${pts} stat points change (limit ${cfg.maxStatPoints})`);
  if (a0 != null && a1 != null && (shapeOf(a0, h0) !== shapeOf(a1, h1) || (a0 >= 1 && a1 < 1))) why.push('theme clash: ' + cfg.themeWhy);
  return { why, pts };
}
async function step(args, S) {
  const cfg = P.CONFIG.refit, cards = P.readJson(CARDS), byId = {}; cards.forEach(c => { byId[c.id] = c; });
  let before = path.join(P.STATE, 'skill-costs.before-price.json');
  if (!fs.existsSync(before)) { // no price step yet: the table as committed
    const r = P.run('git', ['show', 'HEAD:canonical/skill-costs.json']); if (r.code) throw new Error('no price snapshot and no committed table');
    const K = require('./constants.js').read();
    P.writeJson(before, { savedAt: new Date().toISOString(), note: 'taken from the committed table: no price step ran first', constants: { cap2SScale: K.cap2SScale, missMultBy: { flying: K.flying, evasive: K.evasive, shadow: K.shadow } }, table: JSON.parse(r.out) });
    S.notes.push('no price snapshot: the committed skill table is the "before"');
  }
  const env = { SKILL2_OLD_TABLE: before, SKILL2_CARDS: CARDS, SKILL2_OUT: PLANF, SKILL2_NO_NAMED: '1' };
  const r = P.run('node', ['tools/skill2_refit_2026_10_31.js'], { env, log: path.join(P.STATE, 'refit.log') });
  if (r.code) throw new Error('refit rule failed: ' + r.out.split('\n').slice(-5).join(' / '));
  const plan = P.readJson(PLANF), ip = plan.changes.filter(x => x.inPlay), ids = args.ids ? new Set(String(args.ids).split(',')) : null;
  const clean = [], flagged = [];
  ip.filter(x => !ids || ids.has(x.id)).forEach(x => { const k = classify(x, cfg, byId);
    if (k.why.length) flagged.push({ id: x.id, why: `${x.stats} -> ${x.to} proposed (${x.kind}): ${k.why.join('; ')}`, proposal: { from: x.stats, to: x.to, kind: x.kind, useBefore: x.old.use, useNow: x.new.use, useAfter: x.after.use } });
    else clean.push(x); });
  plan.held.filter(x => x.inPlay).forEach(x => flagged.push({ id: x.id, why: `held: ${x.why} (${x.stats}, use ${x.new.use})`, proposal: null }));
  S.inputs = { priceSnapshot: path.relative(P.ROOT, before), plan: path.relative(P.ROOT, PLANF), cardsSha: P.sha('canonical/cards.json'), dry: !!args.dry, rule: 'tools/skill2_refit_2026_10_31.js', limits: { maxStatPoints: cfg.maxStatPoints } };
  S.counts = { 'in play checked': plan.counts.inPlay, 'pushed out': plan.counts.inPlayPushed, 'rule-clean': clean.length, 'flagged': flagged.length, 'out of play (not touched)': plan.counts.outPushed, 'outside before (left)': plan.counts.outsideBefore };
  S.flagged.push(...flagged);
  if (clean.length && !args.dry) {
    const lab = 'SPEED1 refit';
    const a = P.run('python3', ['tools/skill2_apply_cards_2026_10_31.py', '--plan', PLANF, '--ids', clean.map(x => x.id).join(','), '--label', lab], { log: path.join(P.STATE, 'refit-apply.log') });
    if (a.code) throw new Error('apply failed: ' + a.out.split('\n').slice(-4).join(' / '));
    const now = P.readJson(CARDS), nb = {}; now.forEach(c => { nb[c.id] = c; });
    clean.forEach(x => { const c = nb[x.id]; S.changed.push({ id: x.id, field: 'attack/health', old: x.stats, new: `${c.attack}/${c.health}`, kind: x.kind, useBefore: x.old.use, useAfter: x.after.use }); });
    S.files.push('canonical/cards.json');
  } else if (clean.length) clean.forEach(x => S.changed.push({ id: x.id, field: 'attack/health (dry)', old: x.stats, new: x.to, kind: x.kind }));
  S.files.push(path.relative(P.ROOT, PLANF));
  S.counts.applied = args.dry ? 0 : clean.length;
}
module.exports = { step, classify };
