#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): the 30 fights BALREL1 kept on their old decks: deck now, problems() (SIDE2 holds), target band, and every
// saved 400-game read of that exact deck and bramble (any docs/balance jsonl row with the same key, deck, Health and Shield).
//   node tools/legal1/status_2026_11_15.js [CODE...]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
require('../side2/holds_2026_11_13.js').patch();
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G;
const ALL = '13-5 13-6 13-7 13-8 14-5 14-8 16-3 16-4 16-5 16-6 17-4 17-8 19-1 19-3 19-5 2-1 2-2 2-4 4-5 6-2 8-7 0-B-3 1-A-2 14-A-2 18-A-2 19-A-4 19-A-6 20-A-2 20-A-6 7-A-2'.split(' ');
const codes = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const files = []; (function walk(d) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.jsonl$/.test(f)) files.push(p); }); })(path.join(ROOT, 'docs', 'balance'));
const want = new Set(codes), reads = {};
for (const p of files) for (const ln of fs.readFileSync(p, 'utf8').split('\n')) { if (!ln.includes('"games":400')) continue; let r; try { r = JSON.parse(ln); } catch (e) { continue; }
  if (!want.has(r.key) || r.win == null || !r.deck) continue; (reads[r.key] = reads[r.key] || []).push({ f: path.relative(path.join(ROOT, 'docs', 'balance'), p), win: r.win, k: L.keyOf(r.deck), sh: r.shield, hp: r.hp }); }
module.exports = { ALL };
if (require.main === module) for (const m of L.maps()) for (const n of L.fightsOf(m)) { if (!want.has(n.key)) continue;
  const f = L.fight(m, n), b = G.skirmishTargetBand(m.id, n), k = L.keyOf(n.deck); G.NODE_MAP_HINT.set(n, m.id); const sc = G.skirmishCastle(n);
  const same = (reads[n.key] || []).filter(r => r.k === k && r.hp === sc.hp && r.sh === sc.shield);
  console.log(JSON.stringify({ code: n.key, map: m.id, side: f.side, kind: f.kind, t: Math.round(b.t * 1000) / 10, lo: Math.round(b.lo * 1000) / 10, hi: Math.round(b.hi * 1000) / 10, S: f.S, deck: n.deck, hp: sc.hp, shield: sc.shield,
    shieldOverride: n.shieldOverride, hqHp: n.hqHp, problems: f.problems(n.deck), keep: [...f.keep.keys()], L0: f.L0, pool: f.pool.length, reads: same.map(r => r.f + ' ' + r.win) })); }
