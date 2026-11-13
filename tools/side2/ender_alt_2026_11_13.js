#!/usr/bin/env node
// 2026-11-13 (package SIDE2): an SK-anchored ender the fit could not ease into its band (moves inside the list's K14 / caps all stay far too
// hard): the builder's own blend for that fight (docs/balance/side2/build-plan-2026-11-13.json) read on the same road seeds (9100 + 37g, 200
// games) against the eased SK deck as it stands; the nearer to the target is kept (--write), both reads recorded.
//   node tools/side2/ender_alt_2026_11_13.js 10-A-5,18-A-9,20-B-4 [--write]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js');
require('./holds_2026_11_13.js').patch(); // round 2: LIST1's held cards stay out of side fights' pools
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G;
const codes = (process.argv[2] || '').split(',').filter(Boolean), WRITE = process.argv.includes('--write');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'side2', 'build-plan-2026-11-13.json'), 'utf8')), by = {};
plan.maps.forEach(p => p.fights.forEach(x => { by[x.code] = x; }));
const measure = (m, n, deck) => { const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id); const ctx = G.referenceFightSetup(m.id, nn, { seed0: 9100 }); let w = 0; for (let g = 0; g < 200; g++) if (G.playReferenceGame(ctx, g).win) w++; return w / 2; };
const rows = []; let s = fs.readFileSync(APP, 'utf8');
for (const code of codes) {
  const m = L.maps().find(mm => L.fightsOf(mm).some(n => n.key === code)), n = L.fightsOf(m).find(x => x.key === code), f = L.fight(m, n);
  const b = G.skirmishTargetBand(m.id, n), t = b.t * 100, alt = by[code].deck, now = measure(m, n, n.deck), other = f.legal(alt) ? measure(m, n, alt) : null;
  const pick = other != null && Math.abs(other - t) + 2 <= Math.abs(now - t) ? 'blend' : 'sk';
  rows.push({ code, target: t, skEased: { deck: n.deck, win: now }, blend: { deck: alt, win: other }, pick });
  console.log(code, 't', t, 'SK eased', now, 'blend', other, '->', pick);
  if (WRITE && pick === 'blend') { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re), d = Object.fromEntries(Object.keys(alt).sort().map(k => [k, alt[k]]));
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(d) + ` /* 2026-11-13 (SIDE2): the SK deck could not be eased into the band inside the list's rules (${now}% at 200 games, target ${t}); the builder's blend reads ${other}% and stays; deck (was ${JSON.stringify(n.deck)}) */`)); }
}
if (WRITE) { fs.writeFileSync(APP + '.side2tmp', s); fs.renameSync(APP + '.side2tmp', APP); }
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'side2', 'ender-alt-2026-11-13.json'), JSON.stringify({ about: 'SIDE2: eased SK deck vs the builder blend for enders the fit could not ease (tools/side2/ender_alt_2026_11_13.js)', rows }, null, 1) + '\n');
