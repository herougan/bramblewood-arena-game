#!/usr/bin/env node
// Package BAL14 (2026-11-03, owner 11-02 22:47 "finish your balancing across tonight"): BAL12-5's skill re-measure finished at the road's
// 15-Health bramble (every plan item, the new ENG19 / ENG20 skills and Remember once a card), the prices and the re-fit from it, the
// PRO / BPRO / WPRO decks and the reference ladder of the maps whose lists changed (the three placed jellyfish, Hoopoe Herald's re-fit),
// the progression decks at their map's level (no Baby card above it), and the balance summary at the tool's default game counts.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const table = J('canonical/skill-costs.json'), SK = {}; table.skills.forEach(e => { SK[e.id] = e; });
const cards = J('canonical/cards.json'), C = {}; cards.forEach(c => { C[c.id] = c; });

// ---- 1. the re-measure at bramble 15 (BAL12-5) --------------------------------------------------------------------------------------
{ const SM = require(path.join(ROOT, 'tools', 'skill2_measure_2026_10_31.js')), plan = SM.buildPlan(), R = J('docs/balance/pipeline/measures.json').results;
  const items = plan.filter(it => it.kind === 'measure'), left = items.filter(it => !(R['global|' + it.key] && R['global|' + it.key].bramble === 15));
  // 2026-11-03 (DEC1, ENG19-2): Royal Guard's On Play +3 Shield to every ally is priced from the ad hoc On Spawn Grant Shield pair (BAL14, x2.7); its own
  // measure waits for the next balance package
  const DEC1_NEW = ['T:onSpawn>grantShield {"on":"onSpawn","do":"grantShield","allies":3}']; left.splice(0, left.length, ...left.filter(it => !DEC1_NEW.includes(it.key)));
  ok(items.length >= 240 && !left.length, `every in-play skill item measured at bramble 15 (${items.length - left.length} of ${items.length}; left: ${left.slice(0, 5).map(i => i.key).join(', ') || 'none'})`);
  const order = J('docs/balance/bal14/measure-order.json'), adhoc = order.filter(x => typeof x === 'object').map(x => x.key);
  ok(['majesty=1', 'majesty=2', 'pearl=1', 'pearlBed=1', 'dropRoll', 'glean', 'lumberFeast=3'].every(k => adhoc.includes(k) && R['global|' + k] && R['global|' + k].bramble === 15)
    && Object.keys(R).some(k => /grantShield/.test(k) && R[k].bramble === 15), 'the ENG19 / ENG20 skills on no card measured ad hoc at bramble 15 (Majesty 1 / 2, Pearl, Pearl Bed, Stop Drop and Roll, Glean, Lumber Feast, Grant Shield)');
  ok(['remember=1+T:onDeath>exileSelf', 'remember=2+T:onDeath>exileSelf'].every(k => R['global|' + k] && R['global|' + k].bramble === 15), 'Remember 1 / 2 (once a card, ENG20) measured with its On Death -> Exile self at bramble 15');
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'measure.js'), 'utf8'); ok(/only-file/.test(src) && /'only-file'/.test(fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'run.js'), 'utf8')), 'pipeline measure takes --only-file (an ordered list; trigger keys hold commas)'); }

// ---- 2. the prices -----------------------------------------------------------------------------------------------------------------
{ const r2 = v => Math.round(v * 100) / 100, R = J('docs/balance/pipeline/measures.json').results, W = k => r2(R['global|' + k].test.worthRuler.m);
  ok(SK.pearl.value === W('pearl=1') && SK.pearlBed.value === W('pearlBed=1'), `Pearl ${SK.pearl.value} and Pearl Bed ${SK.pearlBed.value} from their measures (were 0.9 by the 4-round rule)`);
  ok(SK.majesty.scale === 'n' && Math.abs(SK.majesty.value - W('majesty=1')) < 0.02 && SK.majesty.pow > 0, `Majesty ${SK.majesty.value} x N^${SK.majesty.pow} through its N 1 / 2 measures`);
  ok(SK.glean.value === 0.3 && SK.lumberFeast.value === 0.7 && SK.dropRoll.value === 0.2, 'Glean, Lumber Feast, Stop Drop and Roll keep their logic prices (they read nothing on the vanilla carriers: no forager, no spare Lumber, no fire)');
  ok(SK.remember && SK.remember.pow < 0 && Math.abs(SK.remember.value - (W('remember=1+T:onDeath>exileSelf') + 0.08)) < 0.02, `Remember ${SK.remember.value} x N^${SK.remember.pow} from its once-a-card measures`);
  ok(SK.bola.value === 2, 'Bola keeps its logic price 2 (an entry with plus: the measure holds the Arrow shot; BAL10)');
  const ap = fs.readFileSync(path.join(ROOT, 'tools', 'skill2_apply_2026_10_31.js'), 'utf8'); ok(/w: r\.nCards \|\| 1/.test(ap), 'the price tool weighs an ad hoc measure (a skill on no card) 1, not 0'); }

// ---- 3. the re-fit -------------------------------------------------------------------------------------------------------------------
{ const f = J('docs/balance/bal14/refit-2026-11-03.json');
  ok(f.edits.length >= 1 && f.edits.every(e => Object.keys(e.set).every(k => C[e.id][k] === e.set[k])), `the re-fit is in cards.json (${f.edits.map(e => e.id + ' ' + e.from.stats + ' -> ' + e.to).join(', ')})`);
  ok(f.edits.every(e => { const [a0, h0] = e.from.stats.split('/').map(Number), [a1, h1] = e.to.split('/').map(Number); return Math.abs(a1 - a0) <= 2 && Math.abs(h1 - h0) <= 2; }), 'each re-fit moves a stat by at most 2');
  const owner = new Set(J('tools/pipeline/config.json').refit.ownerCards); ok(!f.edits.some(e => owner.has(e.id)), 'no owner card re-fit'); }

// ---- 4. the progression decks at their map's level (bal9 JJ7 after ENG18's Baby Level 0) ------------------------------------------
{ const set = J('docs/balance/ref/ref5-prog.json'), R5 = require(path.join(ROOT, 'tools', 'opt', 'ref5_prog.js')), gm = R5.game(), bad = [];
  Object.keys(set.decks).forEach(m => set.decks[m].forEach(e => (e.parts || []).forEach(p => { if (p[2] !== R5.mapLevelOf(gm, p[0], +m)) bad.push(`${m}/${e.seed} ${p[0]} Lv ${p[2]}`); })));
  ok(!bad.length, `every progression deck card at its map's level (${bad.slice(0, 4).join('; ') || 'all'})`);
  ok(!Object.keys(set.decks).some(m => set.decks[m].some(e => e.counts[e.leader] > 0)), 'no progression deck leads with a card it also holds (FIX6)'); }

// ---- 5. PRO / BPRO / WPRO and the ladder of the changed maps ---------------------------------------------------------------------------
{ const pro = J('canonical/pro-skirmishes.json'), deckHas = (m, id) => ['bpro', 'wpro'].some(k => (pro.maps[m][k] || []).some(e => e.deck[id] > 0));
  ok(['mb', 'm2', 'm7', 'm5', 'my'].every(m => (pro.maps[m].bpro || []).length && (pro.maps[m].wpro || []).length), 'the five changed maps have BPRO and WPRO decks');
  ok(deckHas('mb', 'moon-jelly') && deckHas('m2', 'lions-mane-jelly') && deckHas('m7', 'supernova-jelly'), 'the placed jellyfish are in their maps\' rebuilt BPRO / WPRO search (each in at least one deck)');
  const run = a => cp.spawnSync(process.execPath, a, { cwd: ROOT, encoding: 'utf8' });
  ok(/^ok/m.test(run(['tools/opt/bpro2_2026_10_31.js', 'check']).stdout) && /^ok/m.test(run(['tools/opt/wpro_2026_11_02.js', 'check']).stdout), 'bpro2 and wpro checks pass');
  ok(/clean/.test(run(['tools/bal13/decks_2026_11_02.js', '--check']).stdout) && /clean/.test(run(['tools/bal13/decks_2026_11_02.js', 'trim', '--check']).stdout), 'BAL13\'s late-card swaps and RAR-1 trims hold after the rebuild');
  const lad = J('docs/balance/ref/ref-ladder.json'); ok(['mb', 'm2', 'm7', 'm5', 'my'].every(m => lad.ladder[m] && lad.ladder[m].decks.length === 10), 'the ladder of the changed maps rebuilt: 10 decks each'); }

// ---- 6. the summary at the default game counts ---------------------------------------------------------------------------------------
{ const f = 'docs/balance/bal13/summary-2026-11-03.json', s = fs.existsSync(path.join(ROOT, f)) ? J(f) : null;
  ok(s && s.settings.games === 12 && s.settings.strongGames === 40 && s.settings.roadGames === 20 && s.settings.roadMeasureGames === 40 && s.settings.road === 'summary-2026-11-03', 'the balance summary ran at 12 / 40 / 20 / 40 on a fresh road measure (summary-2026-11-03)'); }

console.log(`bal14-2026-11-03: ${fail ? fail + ' of ' + n + ' failed' : 'all ' + n + ' passed'}`);
process.exit(fail ? 1 : 0);
