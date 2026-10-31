#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decisions BUDGET2-1 / -2 / -5 / -6 / -7, DECK1-1 / -2 / -5): the canon re-set in 3A + H stat points from one
// shared measure (the placebo taken out), every in-play skill re-measured and written by the apply rules, the trigger pairs and shorthand
// mults read by tools/skill_costs.js, the card re-fit on record and applied (in-play only), the named edits, FORGE_MEAN_GAIN and the
// editor's 3A+H header, the PRO re-bake and the BPRO rebuild under the 6/4 rule, the SKILL2 decisions. No games.
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), js = f => JSON.parse(rd(f));
const table = js('canonical/skill-costs.json'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(table);
const SK = {}; table.skills.forEach(e => { SK[e.id] = e; });
const near = (a, b, e) => Math.abs(a - b) <= (e || 0.011);

// 1. the canon: 15 points, re-set in 3A + H points, kappa 1 after, the placebo
{ const before = js('docs/balance/skill-canon-check-2026-10-31-skill2-before.json'), after = js('docs/balance/skill-canon-check-2026-10-31-skill2.json');
  const pts = []; table.skills.filter(e => e.canon).forEach(e => (e.canonAt || [true]).forEach(k => pts.push([e.id, k])));
  ok(pts.length === 15, `1. 15 canon points (${pts.length})`);
  ok(before.context.fights === 1000 && after.context.fights === 1000, '1. the shared measure is 1,000 paired fights a variant');
  ok(before.kappa.m < 0.6 && near(after.kappa.m, 1, 0.05), `1. kappa ${before.kappa.m} before -> ${after.kappa.m} after`);
  ok(after.outside.length === 0, '1. every anchor inside the range the others give it: ' + after.outside.join(', '));
  ok(after.placebo && near(after.placebo.worthStat.m, 0.41, 0.05), '1. the placebo is taken out (0.41 stat points)');
  const g0 = after.placebo.gain, sr = before.statRate.m;
  before.anchors.forEach(a => { const p = T.skillCost(a.id, a.n); ok(near(p, (a.gain - g0) / sr, 0.02), `1. ${a.key}: price ${p} = (gain - placebo) / stat point (${((a.gain - g0) / sr).toFixed(2)})`); });
  table.skills.filter(e => e.canon).forEach(e => ok(e.skill2Was && /SKILL2/.test(e.appliedAt) && /SKILL2/.test(e.canonReason), `1. ${e.id}: history kept (skill2Was), SKILL2 in appliedAt and canonReason`));
  const tool = rd('tools/skill_canon_2026_10_31.js'); ok(/skill2Placebo/.test(tool) && /--no-placebo/.test(tool) && /worthStat/.test(tool), '1. the canon tool plays the placebo and reads by the stat yardstick'); }

// 2. the in-play skills: measured, written by the rules
{ const M = js('docs/balance/skill2-measures-2026-10-31.json').results, plan = js('docs/balance/skill2-prices-2026-10-31.json');
  ok(Object.keys(M).length >= 230 && M.placebo, `2. ${Object.keys(M).length} measured items, the placebo among them`);
  const sets = plan.rows.filter(r => r.kind === 'set'); ok(sets.length >= 100, `2. ${sets.length} skill prices set`);
  sets.forEach(r => { const e = SK[r.id]; ok(e && e.value === r.value && (r.pow == null || e.pow === r.pow) && e.scale === r.scale && e.skill2Was, `2. ${r.id}: ${r.value}${r.pow != null ? ' x N^' + r.pow : ''} (${r.scale}) written with its history`); });
  plan.rows.filter(r => r.kind === 'kept').forEach(r => ok(SK[r.id] && SK[r.id].value === r.old, `2. ${r.id}: kept at ${r.old} (${r.note})`));
  // 2026-10-31 (package ENG15): ENG15 reworked and re-priced it (1.4; SKILL2 left it at 2.1, kept as anadEng14Was)
  ok(SK.anadromous && SK.anadromous.value === 1.4 && (SK.anadromous.anadEng14Was || {}).value === 2.1 && !SK.anadromous.skill2Was, '2. Anadromous left to ENG15 (2.1 then; ENG15 re-priced it 1.4)');
  ok(near(T.skillCost('fletcher', 1), 3.18) && near(T.skillCost('brood', 2), 7.2) && near(T.skillCost('remember', 1), 5) && near(T.skillCost('remember', 2), 2.02, 0.02), '2. DECK1-1: Fletcher 1 3.18, Brood 2 7.2, Remember 1 / 2 5.0 / 2.0');
  // pairs and shorthand mults
  ok(Object.keys(table.pairs || {}).length === 13, `2. 13 trigger pairs (${Object.keys(table.pairs || {}).length})`);
  const tc = T.triggerCost({ on: 'onReady', do: 'gain', amount: 1, resource: 'lumber' }); ok(near(tc.cost, 0.9 * 1 * table.pairs['onReady>gain'].mult, 0.02), '2. tools/skill_costs.js: a trigger costs weight x action x its pair mult');
  ok(!table.pairs['onAttacked>spawnCard'] && !table.pairs['onAttack>drawCard'], '2. the Bee Drone\'s and Worker Ant\'s pairs are held (RECOST1-5)');
  ok(table.shorthands.bounty.mult === 0.88 && near(T.cardS({ bounty: 1 }).S, 2.5 * 0.88, 0.02), '2. a shorthand costs trigger x action x its mult (Bounty 0.88)'); }

// 3. the re-fit: on record and applied (in play only), the named edits
{ const R = js('docs/balance/skill2-refit-2026-10-31.json'), cards = js('canonical/cards.json'), by = {}; cards.forEach(c => { by[c.id] = c; });
  const ip = R.changes.filter(r => r.inPlay); ok(ip.length === 47, `3. 47 in-play changes on record (${ip.length})`);
  ip.forEach(r => ok(by[r.id] && by[r.id].attack === r.attack && by[r.id].health === r.health && /SKILL2 re-fit/.test(by[r.id].creatorNote || ''), `3. ${r.id}: ${r.stats} -> ${r.to} applied with its note`));
  R.changes.filter(r => !r.inPlay).forEach(r => ok(by[r.id] && `${by[r.id].attack == null ? '-' : by[r.id].attack}/${by[r.id].health}` === r.stats, `3. ${r.id}: out of play, on record only (coordinator: cards.json limited to this package's items)`));
  const st = id => by[id].attack + '/' + by[id].health;
  ok(st('marshal-of-rivergate') === '4/9', '3. BUDGET2-5: Marshal of Rivergate 4/9');
  ok(['eagle-owl-quartermaster 1/6', 'ashbone-ghoul 1/5', 'wolf-spider-mother 2/7', 'grave-grin-hyena 2/10'].every(s => { const [id, v] = s.split(' '); return st(id) === v; }), '3. DECK1-1: Quartermaster 1/6, Ghoul 1/5, Spider Mother 2/7, Hyena 2/10');
  ok(['peak-condor 4/10', 'hawk-arrowkeeper 2/8', 'red-billed-chough 3/2', 'peregrine-stooper 2/8', 'conch-herald 2/13'].every(s => { const [id, v] = s.split(' '); return st(id) === v; }), '3. DECK1-5: Condor 4/10, Arrowkeeper 2/8, Chough 3/2, Stooper 2/8, Herald 2/13');
  ok(R.held.some(h => h.id === 'ant-warrior') && R.held.filter(h => h.inPlay && /cap|fits/.test(h.why)).length >= 7, '3. the cap-2 cards are held for SKILL2-1');
  const C = js('docs/balance/bench-contrib-global-2026-10-31-skill2-final.json'); ['ashbone-ghoul', 'grave-grin-hyena', 'peak-condor', 'hawk-arrowkeeper', 'red-billed-chough', 'peregrine-stooper', 'conch-herald']
    .forEach(id => { const c = C.cards.find(x => x.id === id); ok(c && Math.abs(c.vsFair) <= 0.015, `3. ${id}: within 1.5 points a copy of the fair line after the re-fit (${c && (c.vsFair * 100).toFixed(1)})`); }); }

// 4. arena_app.js (BUDGET2-6)
{ const src = rd('arena_app.js'); ok(/<th>f×\(\(3A\+H\)×m\+S\) ≤ N<\/th>/.test(src) && !/<th>f×\(\(2A\+H\)/.test(src), '4. the card editor\'s header reads 3A+H');
  ok(/const FORGE_MEAN_GAIN = \[\[0, 1\], \[0\.021, 2\]/.test(src), '4. FORGE_MEAN_GAIN refreshed (tests/forge-curve check 3 compares it with the cards)'); }

// 5. PRO and BPRO (BUDGET2-7, DECK1-2)
{ const P = js('canonical/pro-skirmishes.json'), maps = Object.values(P.maps);
  ok(maps.filter(e => (e.history || []).some(h => h.package === 'SKILL2' && h.field)).length === 15, '5. 15 stored fields re-baked, the old ones under history');
  ok(maps.some(e => (e.history || []).some(h => h.package === 'SKILL2' && h.leaders)), '5. showcase leaders re-baked, the old ones under history');
  const B = require(path.join(ROOT, 'tools', 'opt', 'bpro2_2026_10_31.js')), O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), gm = O.loadGame(ROOT);
  const probs = B.checkAll(gm); probs.forEach(p => ok(false, '5. ' + p)); ok(!probs.length, '5. every BPRO deck: 6 different cards, 4 copies, the map\'s list only, a focus');
  const withB = maps.filter(e => (e.bpro || []).length && (e.bpro || []).every(x => x.source && x.source.mode === 'bpro2'));
  ok(withB.length >= 30, `5. ${withB.length} maps with SKILL2 BPRO decks`);
  ok(maps.filter(e => (e.history || []).some(h => h.package === 'SKILL2' && (h.bpro || []).length)).length >= 30, '5. the previous BPRO decks are under history');
  ok(P.maps.mo && !(P.maps.mo.bpro || []).length, '5. the Old Bramble has no BPRO (its list is over its Common cap)'); }

// 6. decisions, report, CHANGELOG, protocol
{ const D = rd('docs/decisions.json'); ['SKILL2-1', 'SKILL2-2', 'SKILL2-3', 'SKILL2-4'].forEach(id => ok(new RegExp('"id": "' + id + '", "status": "(YET|DONE)"').test(D), `6. ${id} asked`)); // 2026-10-31 coordinator: answered (DONE) counts too
  ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'skill2-2026-10-31.md')), '6. the report');
  ok(/SKILL2/.test(rd('docs/CHANGELOG.md').slice(0, 4000)), '6. the CHANGELOG\'s top entry');
  ok(/### 5a\. The currency/.test(rd('docs/evaluation-protocol.md')), '6. the protocol\'s section 5a'); }
console.log(`skill2-2026-10-31: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
