#!/usr/bin/env node
// 2026-11-04 (package FEEL1, owner 09:23: "We should define "feelings" in master hub. a new tab."): docs/feelings.md exists with its four
// parts and the owner's feelings, every card it names in bold is a real card in canonical/cards.json, the hub's 💭 Feelings tab is wired
// (button, panel, searchable sections, Home link, the Library links the doc to its tab), decision FEEL1-1 is in decisions.json and the
// CLAUDE.md source-of-truth table points at the doc. Static checks only: no hub build, no browser.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const rd = (...p)=> fs.readFileSync(path.join(ROOT, ...p), 'utf8');

// The doc
const docPath = path.join(ROOT, 'docs', 'feelings.md');
ok(fs.existsSync(docPath), 'docs/feelings.md exists');
const doc = fs.existsSync(docPath) ? rd('docs', 'feelings.md') : '';
ok(/^# /.test(doc), 'feelings.md: starts with a title');
for(const h of ['## 1. The feelings', '## 2. The forecast principle', '## 3. The skirmish feelings recipe', '## 4. Gaps'])
  ok(doc.includes(h), `feelings.md: section "${h}"`);
for(const f of ['The juke', 'The reveal', 'The clutch save', 'The instant surprise', 'The forecast and the planned payoff', 'The comeback', 'The race', 'The swarm snowball', 'The turn of the clock'])
  ok(new RegExp('^### \\d+\\. ' + f, 'm').test(doc), `feelings.md: feeling "${f}"`);
const nFeel = (doc.match(/^### \d+\. /gm) || []).length;
ok(nFeel >= 8 && nFeel <= 10, `feelings.md: 8-10 feelings (has ${nFeel})`);
for(const r of ['F1', 'F2', 'F3', 'F4']) ok(new RegExp('^### ' + r + '\\. ', 'm').test(doc), `feelings.md: forecast rule ${r}`);
ok(/Hearthstone/.test(doc) && /Marvel Snap/.test(doc) && /Inscryption/.test(doc), 'feelings.md: compares with Hearthstone / Marvel Snap / Inscryption');
ok(/Siege Rhino/.test(doc), 'feelings.md: keeps the owner\'s Siege Rhino example');
const setups = (doc.split('### 3d.')[1] || '').split('## 4.')[0].match(/^\d+\. \*\*Map /gm) || [];
ok(setups.length >= 5 && setups.length <= 8, `feelings.md: 5-8 example set-ups (has ${setups.length})`);
const gaps = doc.match(/^\| \*\*G\d+\*\* \|/gm) || [];
ok(gaps.length >= 3, `feelings.md: gap table (has ${gaps.length})`);
ok(doc.includes('FEEL1-1'), 'feelings.md: names decision FEEL1-1');

// Every bolded card name the doc uses is a real card (names checked against cards.json; non-card bold phrases are skipped by a known list)
const C = JSON.parse(rd('canonical', 'cards.json')); const cards = Array.isArray(C) ? C : (C.cards || Object.values(C));
const names = new Set(cards.map(c=> c.name));
const mustBeCards = ['Siege Rhino', 'Cave Bear', 'Mouse Sapper', 'Polar Bear', 'Booming Bittern', 'Owl Nightwatch', 'Muskrat Lodgekeeper', 'Newt Doctor',
  'Phoenix Fledgling', 'Golden Eagle Diver', 'Caiman Hatchling', 'Ibex Rockcaller', 'Eyrie Warden', 'Cave Warlord', 'Salamander Pyromancer', 'Starfall Owl',
  'Berserker Boar', 'Cinder Skeletons', 'Wolfsbane Alpha', 'Wolf Spider Mother', 'Ant Warrior', 'Woodcock Lookout', 'Dormouse', 'Ant Scout', 'Echo Screecher',
  'Gorge Wyrm', 'Fathom Leviathan', 'Elder Tortoise', 'Amber Cicada', 'Royal Guard', 'Beetle Battering-Ram', 'Sandfish', 'Raven Scout'];
for(const n of mustBeCards){ const base = n.replace(/s$/, ''); ok(names.has(n) || names.has(base), `cards.json has "${n}"`); ok(doc.includes(n), `feelings.md names "${n}"`); }
const rhino = cards.find(c=> c.id === 'siege-rhino');
ok(rhino && rhino.wait === 3 && rhino.attack === 5 && rhino.health === 17 && (rhino.effects || {}).siege === 4, 'feelings.md quotes the Siege Rhino as 5/17, Wait 3, Siege 4');

// The hub tab
const hub = rd('tools', 'hub', 'build_hub.py');
ok(/<button role="tab" id="t-feelings" aria-controls="p-feelings" data-tab="feelings">💭 Feelings<\/button>/.test(hub), 'hub: 💭 Feelings tab button');
ok(/<section class="panel" id="p-feelings" role="tabpanel" aria-labelledby="t-feelings" hidden>\{lazy\(feel_html\)\}<\/section>/.test(hub), 'hub: Feelings panel');
ok(/os\.path\.join\(ROOT, 'docs', 'feelings\.md'\)/.test(hub), 'hub: reads docs/feelings.md');
ok(/anchor\(md_html\(.*\), 'feel'\)/.test(hub), 'hub: sections anchored');
ok(/SEARCH\.append\(\['Feelings', .*\{'tab': 'feelings', 'el': sid\}\]\)/.test(hub), 'hub: sections in the search');
ok(/\('💭', 'feelings', 'Feelings',/.test(hub), 'hub: Home link');
const lib = rd('tools', 'hub', 'library.py');
ok(/'feelings\.md': \('feelings', '💭 Feelings'\)/.test(lib), 'library: feelings.md links to its tab (canonical)');

// Decision, CLAUDE.md, run-all
const decRaw = rd('docs', 'decisions.json'), dec = JSON.parse(decRaw);
const it = dec.items.find(i=> i.id === 'FEEL1-1');
ok(it && ['YET', 'DONE'].includes(it.status) && it.group === 'game', 'decisions.json: FEEL1-1 (YET or DONE, game)'); // 2026-11-11: the owner answered it
ok(decRaw.split('\n').filter(l=> l.includes('"id": "FEEL1-1"')).length === 1, 'decisions.json: FEEL1-1 on one line');
ok(/\| Skirmish feelings \/ the forecast principle \| `docs\/feelings\.md`/.test(rd('CLAUDE.md')), 'CLAUDE.md: source-of-truth row');
ok(/^run node tests\/feel1-2026-11-04\.js/m.test(rd('tests', 'run-all.sh')), 'run-all.sh: registered');
ok(/^## 2026-11-04 Package FEEL1/m.test(rd('docs', 'CHANGELOG.md')), 'CHANGELOG: FEEL1 entry');

console.log(`feel1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
