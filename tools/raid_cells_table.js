#!/usr/bin/env node
// The measured raid fights as a table (2026-10-19, package RB): per deck x part x share, the average bramble damage, the average raid
// damage (RaidM.contributionFor: x the rank, a win 1,000 x the rank), the win share and the survival share.
//   node tools/raid_cells_table.js [FILE (tools/raid_completion_model.js measure's JSON)] [--md]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js')), def = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'))[0];
const file = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19-fights.json');
const j = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')), md = process.argv.includes('--md');
const rows = Object.entries(j.cells).map(([k, l])=>{ const [deck, part, share] = k.split('|'), p = def.parts.find(q=> q.id === part);
  const c = l.map(x=> R.contributionFor(def, x.dealt, !!x.ow, p, x.rank)), avg = a=> a.reduce((t, v)=> t + v, 0) / Math.max(1, a.length);
  return {deck, part, share: +share, dealt: Math.round(avg(l.map(x=> x.dealt))), raid: Math.round(avg(c)), win: Math.round(l.filter(x=> x.ow).length / l.length * 100), alive: Math.round(l.filter(x=> x.rank).length / l.length * 100), n: l.length}; });
if(md){ console.log('| deck (map) | part | part HP left | bramble damage | raid damage | wins | bramble kept |'); console.log('|---|---|---|---|---|---|---|');
  rows.forEach(r=> console.log(`| ${r.deck} | ${r.part} | ${Math.round(r.share * 100)}% | ${r.dealt} | ${r.raid} | ${r.win}% | ${r.alive}% |`)); }
else rows.forEach(r=> console.log(`${r.deck.padEnd(4)} ${r.part.padEnd(6)} s${String(r.share).padEnd(5)} bramble ${String(r.dealt).padStart(4)}  raid ${String(r.raid).padStart(5)}  wins ${String(r.win).padStart(3)}%  alive ${String(r.alive).padStart(3)}%  (n ${r.n})`));
