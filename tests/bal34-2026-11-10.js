#!/usr/bin/env node
// Package BAL34 (2026-11-10): decided skill prices and rules, no card stat changes. No games are played.
//   1. BAL33-1: Dive priced from the 1,000-fight measure (docs/balance/pipeline/measure-2026-11-09-2259.json): plain Dive (Dive 0) -3.3,
//      + 0.8 a point of N (diveBonus); the fit re-derived here from the measure file; ENG32's -1 + 0.5 N kept in bal34Was.
//   2. ENG40-2 a: Bulwark 6.3 x N^0.47 (was 6.65, kept in bal34Was).
//   3. ENG40-1 a: Tax-Collector Teal and The Magnate Duck at Hoard 1, stats unchanged, in budget.
//   4. BAL25-1 b: tools/card_balance.js's advanced opponent defaults to 20 top-40% cards; the re-run's file exists.
//   5. UI27-4 a: bramblewood-budget.js skillCountOf is the editor's rule (each ability 1, a plain light one 0.5); the light list is the editor's.
//   6. the Dive / Bulwark / Hoard cards keep their Attack / Health / cost (pins); result files exist; decision BAL34-n under 100 words.
//   node tests/bal34-2026-11-10.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const costs = J('canonical/skill-costs.json'), T = SC.make(costs), sk = id => costs.skills.find(r => r.id === id);
const cards = J('canonical/cards.json'), by = id => cards.find(c => c.id === id);
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const near = (a, b, e) => Math.abs(a - b) <= (e == null ? 0.011 : e);

// ---- 1. Dive ----
{ const M = J('docs/balance/pipeline/measure-2026-11-09-2259.json'), w = {};
  M.changed.forEach(c => { w[c.id.split(':')[1]] = parseFloat(c.new); });
  const plain = ((w['flying+dive'] - w.flying) + (w['tide+dive'] - w.tide)) / 2, dive2 = ((w['flying+dive=2'] - w.flying) + (w['tide+dive=2'] - w.tide)) / 2;
  const r05 = v => Math.round(v * 20) / 20;
  ok(M.inputs.maxFights === 1000 && Object.keys(w).length === 6, 'the measure is the 1,000-fight Flying / Tide run (6 variants)');
  ok(sk('dive').scale === 'fixed' && sk('dive').plus === 'diveBonus' && near(sk('dive').value, r05(plain)) && sk('dive').value === -3.3, `Dive (plain = Dive 0) ${sk('dive').value} = the measured ${plain.toFixed(2)}, to 0.05`);
  ok(sk('diveBonus').scale === 'n' && near(sk('diveBonus').value, r05((dive2 - plain) / 2)) && sk('diveBonus').value === 0.8, `diveBonus ${sk('diveBonus').value} a point = (Dive 2 ${dive2.toFixed(2)} - plain) / 2`);
  ok(T.skillCost('dive', true) === -3.3 && near(T.skillCost('dive', 1), -2.5) && near(T.skillCost('dive', 2), -1.7) && near(T.skillCost('dive', 3), -0.9), `Dive true / 1 / 2 / 3: ${[true, 1, 2, 3].map(n => T.skillCost('dive', n)).join(' / ')}`);
  ok(sk('dive').bal34Was && sk('dive').bal34Was.value === -1 && sk('diveBonus').bal34Was && sk('diveBonus').bal34Was.value === 0.5 && sk('dive').eng32Was && /BAL34/.test(sk('dive').bal34), 'ENG32\'s -1 + 0.5 N kept as bal34Was (EN7\'s as eng32Was)'); }

// ---- 2. Bulwark ----
ok(sk('bulwark').scale === 'n' && sk('bulwark').value === 6.3 && sk('bulwark').pow === 0.47 && sk('bulwark').bal34Was && sk('bulwark').bal34Was.value === 6.65 && /ENG40-2 a/.test(sk('bulwark').bal34),
  `Bulwark 6.3 x N^0.47 (was 6.65): Bulwark 1 / 2 ${T.skillCost('bulwark', 1)} / ${T.skillCost('bulwark', 2)}`);

// ---- 3. Hoard ----
{ const t = by('tax-collector-teal'), d = by('magnate-duck');
  ok(t.effects.hoard === 1 && d.effects.hoard === 1, 'Tax-Collector Teal and The Magnate Duck: Hoard 1 (were 0.75 / 0.25)');
  ok(t.attack === 1 && t.health === 4 && t.cost === 0 && d.attack === 2 && d.health === 37 && d.cost === 4, 'their stats unchanged (1/4 cost 0, 2/37 cost 4)');
  [t, d].forEach(c => { const b = T.budget(c, {}); ok(b.ok && b.x1 / b.N <= 1, `${c.name}: in budget (${(100 * b.x1 / b.N).toFixed(1)}% of N)`); }); }

// ---- 4. BAL25-1 b ----
{ const src = fs.readFileSync(path.join(ROOT, 'tools', 'card_balance.js'), 'utf8');
  ok(/const ADV_MIX = Math\.max\(1, Math\.min\(20, \+optv\('adv-mix', 20\) \|\| 20\)\);/.test(src) && /BAL34, decision BAL25-1 b/.test(src), 'card power v3: the advanced opponent defaults to 20 top-40% cards');
  const f = path.join(ROOT, 'docs', 'balance', 'bal34', 'card-power-adv20-2026-11-10.json');
  ok(fs.existsSync(f), 'the BAL25-1 b re-run summary exists');
  if (fs.existsSync(f)) { const x = JSON.parse(fs.readFileSync(f, 'utf8')); ok(x.advMix === 20 && Number.isFinite(x.medians.adv20) && Number.isFinite(x.medians.adv5), `re-run medians: advanced ${x.medians.adv5} (mix) -> ${x.medians.adv20} (20 top-40%)`); }
  const cp = J('docs/balance/bal25/card-power.json');
  ok(cp.advanced && cp.advanced.poolCards === 20 && !cp.advanced.restFrom, 'docs/balance/bal25/card-power.json is the 20-card run'); }

// ---- 5. UI27-4 a ----
ok(BB.skillCountOf({ flying: true, tide: true }) === 1 && BB.skillCountOf({ flying: true, poison: 1, leader: true }) === 2.5 && BB.skillCountOf({ purblind: true, crepuscular: true, sunshy: true, nightblind: true }) === 2,
  'light skills count 0.5 each (Flying, Tide, Purblind, Crepuscular, Sun-shy, Night-blind)');
ok(BB.skillCountOf({ tide: true, tideGrant: { attack: 1 } }) === 1 && BB.skillCountOf({ diurnal: 1, diurnalGrant: { armor: 1 } }) === 1 && BB.skillCountOf({ nocturnal: 2 }) === 0.5, 'beside braces a light skill counts 1; its plain numbered form 0.5');
ok(BB.skillCountOf({ arrow: 2, arrowBramble: true, triggers: [{ on: 'onSpawn', do: 'gain', amount: 1 }] }) === 2, 'parameters are not skills; each trigger counts 1');
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), m = /const UI27_LIGHT_SKILLS = (\[[^\]]*\]);/.exec(app);
  ok(m && JSON.stringify(JSON.parse(m[1].replace(/'/g, '"'))) === JSON.stringify(BB.TWO_SKILL_LIGHT), 'the light list is the card editor\'s (UI27_LIGHT_SKILLS)'); }
ok(!('TWO_SKILL_FREE' in BB), 'the old count (TWO_SKILL_FREE) is gone');

// ---- 6. pins, files, decisions ----
const PINS = { 'puffin-diver': [2, 5, 1], 'harbor-seal': [1, 9, 1], 'ancient-sloth-titan': [2, 31, 3], 'muskrat-lodgekeeper': [1, 7, 1], 'heartwood-treant': [2, 19, 2], 'tax-collector-teal': [1, 4, 0], 'magnate-duck': [2, 37, 4] };
Object.entries(PINS).forEach(([id, [a, h, c]]) => { const x = by(id); ok(x && x.attack === a && x.health === h && x.cost === c, `${id}: ${a}/${h} cost ${c} unchanged`); });
['reprice-2026-11-10.json', 'budget-recheck-2026-11-10.json'].forEach(f => ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal34', f)), f + ' exists'));
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'skirmish-pass-bal34.jsonl')), 'the road measure skirmish-pass-bal34.jsonl exists');
const dec = J('docs/decisions.json'), items = dec.items || [];
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
items.filter(x => /^BAL34-\d/.test(x.id || '')).forEach(x => ok(words(x.body) + words((x.options || []).join(' ')) < 100, x.id + ': body and options under 100 words'));
console.log(`bal34: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
