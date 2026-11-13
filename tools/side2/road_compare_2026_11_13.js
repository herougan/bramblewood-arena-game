#!/usr/bin/env node
// 2026-11-13 (package SIDE2): a road measure's totals (in band / within 10 / beyond 20, the worst maps) and its moves against an earlier measure
// of the same fights (the fights that left the band: before green, now out by more than the 400-game noise).
//   node tools/side2/road_compare_2026_11_13.js <after tag> [<before tag>] [--side|--main] [--out docs/balance/side2/road-<tag>.json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), tags = a.filter(x => !x.startsWith('--')), outArg = (a.find(x => x.startsWith('--out=')) || '').slice(6);
const read = t => fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${t}.jsonl`), 'utf8').trim().split('\n').map(l => JSON.parse(l));
const want = r => a.includes('--side') ? r.side : a.includes('--main') ? !r.side : true;
const after = read(tags[0]).filter(r => r.curve && want(r)), before = tags[1] ? read(tags[1]).filter(r => r.curve && want(r)) : [];
const gap = r => Math.round((r.win - r.target) * 10) / 10;
const tot = rows => ({ fights: rows.length, inBand: rows.filter(r => r.green === 'green').length, within10: rows.filter(r => Math.abs(gap(r)) <= 10).length,
  beyond20: rows.filter(r => Math.abs(gap(r)) > 20).length, meanGap: Math.round(rows.reduce((t, r) => t + Math.abs(gap(r)), 0) / Math.max(1, rows.length) * 100) / 100 });
const byMap = {}; after.forEach(r => { const k = r.mapNo + (r.side ? ' ' + r.mapName : ''); (byMap[k] = byMap[k] || []).push(r); });
const maps = Object.entries(byMap).map(([k, rs]) => ({ map: k, fights: rs.length, out: rs.filter(r => r.green !== 'green').length, meanGap: Math.round(rs.reduce((t, r) => t + Math.abs(gap(r)), 0) / rs.length * 10) / 10,
  worst: rs.slice().sort((p, q) => Math.abs(gap(q)) - Math.abs(gap(p))).slice(0, 2).map(r => `${r.code} ${r.win}/${r.target}`) })).sort((p, q) => q.meanGap - p.meanGap);
const bmap = new Map(before.map(r => [r.code, r]));
const moved = after.map(r => { const b = bmap.get(r.code); if (!b) return null; const same = JSON.stringify(b.deck) === JSON.stringify(r.deck) && b.shield === r.shield && b.hp === r.hp;
  return { code: r.code, before: b.win, after: r.win, target: r.target, d: Math.round((r.win - b.win) * 10) / 10, sameFight: same, wasGreen: b.green === 'green', nowGreen: r.green === 'green', games: [b.games, r.games] }; }).filter(Boolean);
const pushedOut = moved.filter(x => x.wasGreen && !x.nowGreen);
const out = { about: 'Road totals (tools/side2/road_compare_2026_11_13.js)', after: tags[0], before: tags[1] || null, totals: tot(after), totalsBefore: before.length ? tot(before) : null, worstMaps: maps.slice(0, 8),
  pushedOut, bigMoves: moved.filter(x => Math.abs(x.d) >= 8).sort((p, q) => Math.abs(q.d) - Math.abs(p.d)),
  outOfBand: after.filter(r => r.green !== 'green').map(r => ({ code: r.code, win: r.win, target: r.target, gap: gap(r) })).sort((p, q) => Math.abs(q.gap) - Math.abs(p.gap)) };
if (outArg) fs.writeFileSync(path.join(ROOT, outArg), JSON.stringify(out, null, 1) + '\n');
console.log('totals', JSON.stringify(out.totals), 'before', JSON.stringify(out.totalsBefore));
console.log('worst maps:', out.worstMaps.map(m => `${m.map} (${m.out}/${m.fights} out, mean gap ${m.meanGap}; ${m.worst.join(', ')})`).join(' | '));
console.log('pushed out of band:', pushedOut.map(x => `${x.code} ${x.before}->${x.after} (t ${x.target}${x.sameFight ? '' : ', deck changed'})`).join(', '));
console.log('moves 8+:', out.bigMoves.map(x => `${x.code} ${x.before}->${x.after}${x.sameFight ? '' : '*'}`).join(', '));
console.log('out of band:', out.outOfBand.map(x => `${x.code} ${x.win}/${x.target}`).join(', '));
