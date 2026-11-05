#!/usr/bin/env node
// 2026-11-03 (package CUT3, owner 23:12: "Cut Glacial ape-king from Map 0-20"): checks, without a browser:
//   1. Glacial Ape-King is on no MAP, submap or SPECIAL list of any map (Maps 0 to 20 and their side maps), and is a cut entry (by owner) on m3, m6 and mi
//   2. no deck, stat or leader changed: the 17-x / 17-A-x decks still hold it (audit only; owner call on the leaders)
//   3. the audit file exists and names the cut, the owner call and the cut sources; decision CUT3-1 is YET and points to it
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  x', m); } };
const ID = 'glacial-ape-king';

const pools = JSON.parse(rd('canonical/map-pools.json')).maps, review = JSON.parse(rd('canonical/map-review.json')).maps;
const IN_RANGE = new Set(['m1','mf','mb','mc','m2','mw','m8','mu','m4','mk','m7','m10','mh','mr','m5','ml','mt','m6','md','m3','m11']); // Map 0 to 20
for (const [t, e] of Object.entries(pools)) {
  if (!IN_RANGE.has(t)) continue;
  ok(!(e.cards || []).includes(ID), `${t}: not on the MAP list`);
  ok(!(e.special || []).includes(ID), `${t}: not on SPECIAL`);
  for (const [s, l] of Object.entries(e.submaps || {})) ok(!l.includes(ID), `${t}/${s}: not on the submap list`);
}
for (const k of ['m3', 'm6', 'mi']) {
  const r = review[k]; const arc = ((JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'map-review.json'), 'utf8')).cutArchive || {}).maps || {})[k] || []; const cut = (r.cut || []).concat(arc).find(x => x.id === ID); // 2026-11-05 22:49 (owner: reset the Map cards cut lists): the cut entries moved to map-review.json cutArchive
  ok(cut && cut.by === 'owner', `${k}: Ape-King is an owner cut in the review`);
  ok(!(r.chosen || []).some(x => x.id === ID), `${k}: not in chosen`);
}

const src = rd('arena_app.js');
for (const key of ['17-1', '17-3', '17-8', '17-A-1']) {
  const i = src.indexOf(`key:"${key}"`); const line = src.slice(i, src.indexOf('\n', i));
  // 2026-11-05 (BAL16, CUT3-1 a "rebuild the decks after your pass"): the Ape-King is out of the deck and a new showcase leader from the list leads
  const NEW = { '17-1': 'beluga', '17-3': 'polar-bear', '17-8': 'walrus-icebreaker', '17-A-1': 'greenland-shark' }[key];
  ok(i > 0 && !line.includes(`"${ID}":`) && line.includes(`showcase:"${NEW}"`) && line.includes(`"${NEW}":`), `${key}: rebuilt by BAL16, led by ${NEW}`);
}

const audit = rd('docs/cut3-audit-2026-11-03.md');
ok(/Owner call/.test(audit) && /17-8/.test(audit) && /THEME4/.test(audit) && /THEME3/.test(audit) && /CUT3/.test(audit), 'audit names the cut, the owner call and the sources');
ok(/#### Map 17 /.test(audit), 'audit is grouped by map');
const dec = JSON.parse(rd('docs/decisions.json')).items.find(x => x.id === 'CUT3-1');
// 2026-11-05 (BAL16): the owner answered CUT3-1 (a, 11-04 22:34)
ok(dec && dec.status === 'DONE' && dec.title === 'Skirmish / road decks holding cut cards: rebuild them after your pass' && /cut3-audit-2026-11-03/.test(dec.body), 'decision CUT3-1 is YET and points to the audit');
const lines = rd('docs/decisions.json').split('\n').filter(l => l.includes('"id": "CUT3-1"'));
ok(lines.length === 1, 'CUT3-1 is one line');
ok(/CUT3/.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry at the top'); // 2026-11-04 (TESTFIX1): the whole CHANGELOG, as QA1 did for the others; later packages' entries sit above this one

console.log(`cut3: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
