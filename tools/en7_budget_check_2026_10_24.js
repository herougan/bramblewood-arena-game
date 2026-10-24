#!/usr/bin/env node
// EN7 (2026-10-24): which cards' S moves with EN7's prices (Dive in two turns, Poison / Bleed on Pounce and Ambush, – poison / – bleed), and
// whether any card's budget check flips. Old = the table and tools at a given git ref (default HEAD), new = the working tree.
//   node tools/en7_budget_check_2026_10_24.js [--ref HEAD] [--json docs/balance/en7-prices-2026-10-24.json]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), args = process.argv.slice(2), arg = k=>{ const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ref = arg('--ref') || 'HEAD', out = arg('--json');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'en7-'));
fs.mkdirSync(path.join(tmp, 'tools')); fs.mkdirSync(path.join(tmp, 'canonical'));
const show = f=> cp.execFileSync('git', ['show', ref + ':' + f], {cwd: ROOT, maxBuffer: 1 << 28});
['bramblewood-budget.js', 'tools/skill_costs.js', 'canonical/skill-costs.json', 'canonical/card-obtain-maps.json'].forEach(f=> fs.writeFileSync(path.join(tmp, f), show(f)));
const OLD = require(path.join(tmp, 'tools', 'skill_costs.js')), NEW = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const To = OLD.make(JSON.parse(fs.readFileSync(path.join(tmp, 'canonical', 'skill-costs.json'), 'utf8'))), Tn = NEW.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(NEW.measured);
const rows = [];
cards.forEach(c=>{ const a = To.budget(c), b = Tn.budget(c); if(Math.abs(a.S - b.S) < 0.005 && a.ok === b.ok) return;
  rows.push({id: c.id, name: c.name, rarity: c.rarity, attack: c.attack, health: c.health, S0: a.S, S1: b.S, ok0: a.ok, ok1: b.ok, x1: b.x1, N: b.N, x2: b.x2, N2: b.N2,
    why: b.parts.filter(p=> p[0] === 'combo' || /dive|Poison|Bleed/.test(p[1])).map(p=> p[1] + ' ' + p[2])}); });
rows.sort((p, q)=> (q.S1 - q.S0) - (p.S1 - p.S0));
rows.forEach(r=> console.log(`${r.name} (${r.id}, ${r.rarity}, ${r.attack}/${r.health}): S ${r.S0} -> ${r.S1}; budget ${r.ok0 ? 'ok' : 'over'} -> ${r.ok1 ? 'ok' : 'over'} (2A+H+S ${r.x1} / N ${r.N}; cap 2 ${r.x2} / ${r.N2}) [${r.why.join(', ')}]`));
console.log(`${rows.length} cards moved; flips: ${rows.filter(r=> r.ok0 !== r.ok1).length}`);
if(out){ fs.writeFileSync(path.join(ROOT, out), JSON.stringify({generated: '2026-10-24 (package EN7)', tool: 'tools/en7_budget_check_2026_10_24.js', ref, rows}, null, 1) + '\n'); console.log('wrote', out); }
fs.rmSync(tmp, {recursive: true, force: true});
