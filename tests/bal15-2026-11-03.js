#!/usr/bin/env node
// Package BAL15 (2026-11-03, the measures DEC1 left open; balancing roadmap step 1, skill balance; budget only): the tempo term of a 0-Lumber,
// Wait 0-1 Rare re-measured at bramble 15 (BAL12-3; not applied, BAL15-1), Royal Guard's "On Play: +3 Shield to every ally" measured as its own
// skill item and priced (grantShield.allies), BAL14's 15 wide items re-measured at 1,000 fights and re-priced, and the balance summary after.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const r2 = v => Math.round(v * 100) / 100;
const table = J('canonical/skill-costs.json'), SK = {}, AC = {}; table.skills.forEach(e => { SK[e.id] = e; }); table.actions.forEach(e => { AC[e.id] = e; });
const R = J('docs/balance/pipeline/measures.json').results, W = k => R['global|' + k].test.worthRuler.m;
const RG = 'T:onSpawn>grantShield {"on":"onSpawn","do":"grantShield","allies":3}';
const WIDE = J('docs/balance/bal15/measure-wide-2026-11-03.json');

// ---- 1. the measures ---------------------------------------------------------------------------------------------------------------
{ const g = R['global|' + RG]; ok(g && g.bramble === 15 && g.fights >= 400 && g.converged, `Royal Guard's +3 Shield to every ally measured as its own item at bramble 15 (${g && g.fights} paired fights, converged)`);
  ok(WIDE.length === 15 && WIDE.every(k => R['global|' + k] && R['global|' + k].bramble === 15 && R['global|' + k].fights >= 1000), 'BAL14\'s 15 wide items re-measured at bramble 15, 1,000 paired fights each');
  const se = k => { const w = R['global|' + k].test.worthRuler; return (w.hi - w.lo) / 3.92; };
  // the pipeline's convergence rule (config.json measure: se <= max(0.3, 15% of the worth)); the ones still wider are reported, not hidden
  const wide = WIDE.filter(k => se(k) > Math.max(0.3, 0.15 * Math.abs(W(k))));
  ok(wide.length <= 6, `at 1,000 fights ${15 - wide.length} of 15 meet the pipeline's convergence rule (still wider: ${wide.join(', ') || 'none'})`); }

// ---- 2. the prices -----------------------------------------------------------------------------------------------------------------
{ const pm = table.pairs['onSpawn>grantShield'].mult, tw = table.triggers.find(t => t.id === 'onSpawn').value;
  ok(pm === 2.7, 'the On Spawn > Grant Shield pair stays x2.7 (read from Grant Shield 2 on itself; the allies item is left out of it)');
  ok(AC['grantShield.allies'].value === r2(W(RG) / (3 * tw * pm)) && AC['grantShield.allies'].value < 1.2, `grantShield.allies ${AC['grantShield.allies'].value} a point from its measure (${r2(W(RG))} for 3 to every ally; was 1.2 by logic)`);
  const A = require(path.join(ROOT, 'tools', 'skill2_apply_2026_10_31.js'));
  ok(typeof A.ownFieldOf === 'function' && A.ownFieldOf(R['global|' + RG]).id === 'grantShield.allies' && A.ownFieldOf(R['global|T:onSpawn>grantShield {"on":"onSpawn","do":"grantShield","amount":2}']) === null, 'the price tool prices a Grant Shield field from its own trigger item (ownFieldOf)');
  const curve = (e, N) => e.value * Math.pow(N, e.pow);
  ok(Math.abs(curve(SK.backstab, 2) - W('backstab=2')) < 0.05 && Math.abs(curve(SK.backstab, 3) - W('backstab=3')) < 0.05, `Backstab ${SK.backstab.value} x N^${SK.backstab.pow} through its readings at 2 / 3 (${r2(W('backstab=2'))} / ${r2(W('backstab=3'))})`);
  ok(Math.abs(curve(SK.earthquake, 3) - W('earthquake=3')) < 0.05 && Math.abs(curve(SK.earthquake, 4) - W('earthquake=4')) < 0.05, `Earthquake ${SK.earthquake.value} x N^${SK.earthquake.pow} through its readings at 3 / 4`);
  ok(SK.drunk.value === r2(W('drunk')) && SK.nightblind.value === r2(W('nightblind')) && SK.scatterbrained.value === r2(W('scatterbrained')), `the drawbacks at their 1,000-fight readings: Drunk ${SK.drunk.value}, Nightblind ${SK.nightblind.value}, Scatterbrained ${SK.scatterbrained.value}`);
  ok(SK.guardian.value === 0 && SK.taunt.value === 0.4 && SK.quarry.value === 2.5 && SK.evolute.value === 3 && SK.parasite.value === 1, 'the price rules kept the rest (protects partners, pays in Stone, reads nothing on the vanilla carriers)');
  const u = J('docs/balance/bal15/budget-use-2026-11-03.json'), rg = u.rows.find(r => r.id === 'otter-royal-guard');
  ok(rg && rg.verdict[1] === 'in band' && rg.S[1] < rg.S[0], `Royal Guard in band at the new price (S ${rg && rg.S.join(' -> ')}, cap-1 use ${rg && rg.use.join(' -> ')}): no re-fit`);
  ok(!u.newOver.length && !u.newUnder.length, 'no in-play card left the budget band through BAL15\'s prices');
  const C = J('canonical/cards.json').find(c => c.id === 'otter-royal-guard'); ok(C.attack === 3 && C.health === 6, 'Royal Guard stays 3/6'); }

// ---- 3. the tempo term (BAL12-3) -----------------------------------------------------------------------------------------------------
{ const BB = require(path.join(ROOT, 'bramblewood-budget.js')), t = J('docs/balance/bal15/tempo-cap-2026-11-03.json');
  ok(/b15/.test(t.measure.context) && t.measure.T.n >= 15 && t.measure.R.n >= 50 && t.measure.fights >= 400, `tempo measure at bramble 15 (${t.measure.T.n} T cards, ${t.measure.R.n} R, ${t.measure.fights} fights a card): share ${t.measure.share} [${t.measure.shareLo}, ${t.measure.shareHi}]`);
  ok(t.cap2Limits.length === 0 && t.cap1Over.length > 0, `cap 2 limits no card; cap 1 at N x (1 - share) would put ${t.cap1Over.length} over (${t.cap1Over.join(', ')}): not applied`);
  ok(BB.TEMPO_CAP2_MULT === 0.85 && !BB.TEMPO_CAP1_MULT, 'the budget keeps the term on cap 2 (x0.85); no cap-1 term');
  const d = J('docs/decisions.json').items.find(i => i.id === 'BAL15-1'); ok(d && d.group === 'game' && (d.status === 'OPEN' || (d.status === 'DONE' && d.answer)) /* 2026-11-04 (TESTFIX1): answered since (Claude's call under the owner's 11-03 09:39 delegation, DEC1) */, 'BAL15-1 recorded for the owner'); }

// ---- 4. the summary on the final state ------------------------------------------------------------------------------------------------
{ ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal13', 'summary-2026-11-03b.md')) && fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal13', 'card-flags-2026-11-02.md')), 'the balance summary (2026-11-03b) and the card flags written');
  const s = J('docs/balance/bal13/summary-2026-11-03b.json'); ok(s && JSON.stringify(s).length > 1000, 'summary json present'); }

console.log(`\n${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
