#!/usr/bin/env node
// Package BAL12 (2026-11-02, owner 19:56 BAL11-2 a / BAL11-4 a, 20:19 RAR-1, 22:26 Lumber +0.5): the canon re-measured at the road's bramble
// Health (15), the Lumber makers priced by their lists and from On Ready +1 Lumber, the tempo cap 2 of a 0-Lumber Rare, the Lumber term
// 2 -> 2.5, the 13 rarities of RAR-1 and the re-fit (no in-play card outside the band but the listed and held ones).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const table = J('canonical/skill-costs.json'), T = SC.make(table), cards = J('canonical/cards.json'), C = {}; cards.forEach(c => { C[c.id] = c; });
const SK = {}; table.skills.forEach(e => { SK[e.id] = e; });

// ---- the bench at a chosen bramble Health ------------------------------------------------------------------------------------------
{ const L = require(path.join(ROOT, 'tools', 'bench', 'lib.js')), o = L.defaults(); const a = ['--bramble', '15']; ok(L.parseCommon(a, o) && o.bramble === 15, 'bench: --bramble 15 is a common option');
  ok(L.csOf(o).bramble === 15 && L.csOf(L.defaults()).bramble == null, 'bench: the context carries the bramble Health (default none = 30)');
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'bench', 'lib.js'), 'utf8'); ok(/health: X\.bramble \|\| BRAMBLE/.test(src) && /name \+= '-b' \+ bramble/.test(src), 'bench: both brambles take the context\'s Health; a non-30 context has its own name and key');
  const cfg = J('tools/pipeline/config.json'); ok(cfg.measure.bramble === 15, 'pipeline: measure runs at bramble 15 by default'); }

// ---- the canon at bramble 15 ------------------------------------------------------------------------------------------------------
{ const chk = J('docs/balance/bal12/skill-canon-check-b15-2026-11-02-bal12.json'); ok(chk.context.bramble === 15 && chk.context.fights === 1000 && chk.anchors.length === 15, 'canon check at bramble 15: 1,000 fights, 15 anchor points on file');
  // 2026-11-04 (TESTFIX1): ENG21 (2026-11-03, owner 20:28) re-priced Inspiring after BAL12 (its BAL12 numbers are kept as eng21Was)
  // 2026-11-05 (FIX9, owner 22:18): Shell's rule changed and it was re-measured (its BAL12 numbers kept in bal12Was, the step before in fix9Was)
  const canon = table.skills.filter(e => e.canon); ok(canon.length >= 12 && canon.every(e => (/BAL12/.test(e.appliedAt || '') || (/ENG21/.test(e.appliedAt || '') && e.eng21Was) || (/FIX9/.test(e.appliedAt || '') && e.fix9Was)) && e.bal12Was), `every canon entry re-set at bramble 15 with its old numbers kept (${canon.filter(e => !/BAL12/.test(e.appliedAt || '')).map(e => e.id).join(', ') || canon.length})`);
  const at = (id, n) => { const a = chk.anchors.find(x => x.id === id && (x.n === n || n == null)); return a.worthStat.m; };
  ok(Math.abs(T.skillCost('onReadyGold', 1) - at('onReadyGold', 1)) < 0.02 && (Math.abs(T.skillCost('fork', true) - at('fork')) < 0.02 || (!!table.skills.find(e => e.id === 'fork').bal29Was && T.skillCost('fork', true) === 4.95)) /* 2026-11-08 (package BAL30): Fork re-priced 3.89 -> 4.95 at the ladder's mean (BAL29-1 a); BAL12's reading stays in the file */, `On Ready +1 Lumber ${T.skillCost('onReadyGold', 1)} and Fork ${T.skillCost('fork', true)} at their bramble-15 readings`);
  const m = J('docs/balance/pipeline/measures.json').results; ok(m['global|stealth'] && m['global|stealth'].bramble === 15 && SK.stealth.value === Math.round(m['global|stealth'].test.worthRuler.m * 100) / 100, `Stealth priced from its bramble-15 measure (${SK.stealth.value}; BAL11's x2 was 7.28)`);
  ok(m['global|breach=2'] && m['global|breach=2'].bramble === 15 && (SK.breach.value < 4.5 || !!(SK.breach.bal32Was && SK.breach.bal32Was.value < 4.5)) /* 2026-11-09 (package BAL32, owner BAL31-2): re-priced from the BAL31 on-hit measure at road brambles (15); BAL12's price in bal32Was */, `Breach priced from its bramble-15 measure (${SK.breach.value} a point; BAL11's x2 was 4.5)`);
  ok(SK.bola.value === 2, 'Bola keeps its logic price 2 (BAL10)'); }

// ---- Lumber makers ----------------------------------------------------------------------------------------------------------------
{ ok(BB.lumberHomeMult(BB.LUMBER_HOME_GLOBAL) === 1 && BB.lumberHomeMult(0.35) < 0.5 && BB.lumberHomeMult(1.33) > 1 && BB.lumberHomeMult(null) === 1, `lumberHomeMult: 1 at the global pool, ${BB.lumberHomeMult(0.35)} on a 0.35 list, ${BB.lumberHomeMult(1.33)} on a 1.33 list`);
  const lm = J('docs/balance/bal12/lumber-home-2026-11-02.json'); ok(['global', 'mb', 'mz', 'm7', 'mj'].every(k => lm.contexts[k]), 'the Lumber makers measured in the global pool and four map pools');
  ok(table.lumberHome && table.lumberHome['nautilus-drifter'] > 1 && table.lumberHome['driftwood-crab'] < 0.5, 'canonical/skill-costs.json lumberHome: each maker\'s home lists\' mean cost');
  const S = id => T.cardS(C[id].effects, C[id]).S;
  ok(Math.abs(S('nautilus-drifter') - Math.round(T.skillCost('onReadyGold', 1) * BB.lumberHomeMult(table.lumberHome['nautilus-drifter']) * 100) / 100) < 0.02, `Nautilus Drifter's On Ready Lumber x its home multiplier (S ${S('nautilus-drifter')})`);
  const pk = T.cardS(C['dune-packrat'].effects, C['dune-packrat']); ok((Math.abs(pk.S - 5.72) < 0.3 || Math.abs(pk.S - 8.75) < 0.01 /* 2026-11-08 (package BAL30): Delivery 3 at 5.25 x 3^0.456 (BAL29-1 a) */) && (/onReadyGold x 3\^0\.71/.test(JSON.stringify(pk.parts)) || (C['dune-packrat'].effects.delivery === 3 && pk.parts.some(p => p[1] === 'delivery'))) /* 2026-11-04 (TESTFIX1): ENG22 (DESIGN1-6) renamed it Delivery 3, priced on the same rule */, `Dune Packrat's On Ready gain 3 priced from On Ready +1 Lumber (S ${pk.S}, was 3.14; 2026-11-03 DEC1 BAL14-3: x 0.39 x N^0.71, from the trigger's own bramble-15 measures, was x N^0.175 8.14)`);
  const hy = T.cardS(C['dust-hyena'].effects, C['dust-hyena']), kp = hy.parts.find(p => p[0] === 'trigger' && /onKill/.test(p[1])); ok(kp && kp[2] < 3 && !/onReadyGold/.test(kp[3]), `an On Kill Lumber gain keeps its trigger price (Dust Hyena's ${kp && kp[2]})`); }

// ---- tempo cap 2 --------------------------------------------------------------------------------------------------------------------
{ ok(BB.TEMPO_CAP2_MULT === 0.85, 'TEMPO_CAP2_MULT 0.85 (measured 0.16 [0, 0.43], set at the owner\'s 15%)');
  ok(BB.tempoCap2Mult(C['trapdoor-spider']) === 0.85 && BB.tempoCap2Mult(C['tide-spirit']) === 0.85 && BB.tempoCap2Mult(C['nautilus-drifter']) === 1 && BB.tempoCap2Mult({ rarity: 'common', cost: 0, wait: 0 }) === 1, 'tempo cap: a 0-Lumber Rare+ at Wait 0-1 only');
  const b = T.budget(C['trapdoor-spider']), N2 = Math.round(BB.cap2Limit(b.N, table.budget) * 0.85 * 100) / 100; ok(Math.abs(b.N2 - N2) < 0.02, `Trapdoor Spider's cap-2 limit x0.85 (${b.N2})`); }

// ---- the Lumber term ---------------------------------------------------------------------------------------------------------------
ok(BB.DEFAULTS.perLumber === 2.5 && table.budget.perLumber === 2.5, 'perLumber 2 -> 2.5 (owner 22:26), the budget file and the table agree');

// ---- RAR-1 ------------------------------------------------------------------------------------------------------------------------
{ const want = { 'beetle-battering-ram': 'veryrare', 'siege-rhino': 'veryrare', 'pangolin-roller': 'rare', 'echidna-quillshot': 'superrare', 'nautilus-drifter': 'veryrare', 'tide-spirit': 'veryrare', 'trapdoor-spider': 'veryrare', 'magma-salamander': 'veryrare', 'coral-polyp-colony': 'uncommon', 'thorny-devil': 'uncommon', 'dung-beetle': 'uncommon', 'vampire-bat': 'rare', 'dune-packrat': 'rare' };
  const bad = Object.keys(want).filter(id => C[id].rarity !== want[id]); ok(!bad.length, `RAR-1: 13 cards one step up (${bad.join(', ') || 'all'})`);
  const d = J('docs/decisions.json').items.find(x => x.id === 'RAR-1'); ok(d && d.status === 'DONE', 'RAR-1 marked DONE'); }

// ---- the re-fit ---------------------------------------------------------------------------------------------------------------------
{ const r = cp.spawnSync('node', ['tools/bal12/refit_2026_11_02.js', '--check'], { cwd: ROOT, encoding: 'utf8' }).stdout || '';
  // 2026-11-03 (DEC1): Echo Matriarch (Flying x1.19, BAL14-2) and Otter Angler (the cheaper Lumber gain lets a fit within the rule reach it, BAL14-3)
  // are held: the owner changed the budget only, no re-fit (11-03 09:39)
  const fits = r.split('\n').filter(l => /^\s+fit /.test(l)).map(l => l.trim().split(/\s+/)[1]), DEC1_HOLD = ['echo-matriarch', 'otter-angler'];
  ok(/^re-fit: \d+;/.test(r.split('\n')[0]) && fits.every(id => DEC1_HOLD.includes(id)), `no in-play card outside the band but the held and listed ones (${r.split('\n')[0]}; DEC1 holds: ${fits.join(', ') || 'none'})`);
  const plan = J('docs/balance/bal12/refit-2026-11-02.json'); ok(plan.edits.every(e => Math.abs((e.set.attack != null ? e.set.attack : 0) - (+e.from.stats.split('/')[0] || 0)) <= 2 && Math.abs(e.set.health - +e.from.stats.split('/')[1]) <= 2), `each re-fit moves a stat by at most 2 (${plan.edits.map(e => e.id + ' ' + e.from.stats + ' -> ' + e.to).join(', ')})`);
  ok(['glass-octopus', 'subterraneaner', 'badger-sapper'].every(id => !plan.edits.some(e => e.id === id)) && C['glass-octopus'].attack === 4 && (C['glass-octopus'].health === 9 || (C['glass-octopus'].health === 7 && /DEC1: BAL12-2 a/.test(C['glass-octopus'].creatorNote || ''))) /* 2026-11-03 (DEC1, BAL12-2 a): 4/7 */ && C['subterraneaner'].attack === 4 && C['badger-sapper'].health === 15, 'the three cards BAL11 held keep their lines (the owner picks)'); }

// ---- decisions --------------------------------------------------------------------------------------------------------------------
{ const items = J('docs/decisions.json').items.filter(x => /^BAL12-/.test(x.id)); ok(items.length >= 3 && items.every(x => x.group === 'game'), `BAL12 owner calls filed (${items.map(x => x.id).join(', ')})`); }

console.log(`\n${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
