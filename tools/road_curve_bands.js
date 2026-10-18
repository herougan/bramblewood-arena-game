#!/usr/bin/env node
// Road-curve bands (2026-10-19, package R2): re-stamps measured rows with the game's current road-curve band, so a file measured
// before a target change (the WIP had elites 5 under the line; they now sit on it) is judged by today's curve.
//   node tools/road_curve_bands.js <tag> [<tag> ...]     docs/balance/skirmish-pass-<tag>.jsonl, rewritten in place, plus a summary
//   (--quiet: the summary only; --list: every fight outside its band)
'use strict';
const fs = require('fs'), path = require('path');
const B = require('./lib_bramble.js'), G = B.G;
const OUT = path.join(__dirname, '..', 'docs', 'balance');
const argv = process.argv.slice(2), tags = argv.filter(a=> !a.startsWith('--'));
const pc = x=> Math.round(x * 1000) / 10;
for(const tag of tags){
  const file = path.join(OUT, `skirmish-pass-${tag}.jsonl`);
  const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l));
  const tally = {green: 0, easy: 0, hard: 0}, off = [];
  rows.forEach(r=>{ const m = G.CONQUEST_MAPS.find(x=> x.id === r.map), n = m && m.nodes.find(x=> x.key === r.key); if(!n) return;
    const b = G.skirmishTargetBand(r.map, n);
    Object.assign(r, {target: pc(b.t), lo: pc(b.lo), hi: pc(b.hi), role: b.role, curve: !!b.curve, pos: b.pos || null, of: b.of || null,
      green: r.win > b.hi * 100 + 1e-9 ? 'easy' : r.win < b.lo * 100 - 1e-9 ? 'hard' : 'green'});
    tally[r.green]++; if(r.green !== 'green') off.push(r); });
  fs.writeFileSync(file, rows.map(r=> JSON.stringify(r)).join('\n') + '\n');
  console.log(tag, rows.length, 'fights:', JSON.stringify(tally));
  if(argv.includes('--list')) off.forEach(r=> console.log(' ', r.code.padEnd(6), r.role.padEnd(9), 'target', String(r.target).padEnd(5), 'win', String(r.win).padEnd(5), r.green, r.name));
}
