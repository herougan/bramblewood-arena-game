#!/usr/bin/env node
// 2026-11-06 (package BAL19): every road fight whose deck, leaders or Shield override BAL19 changed (the weak pass, the curve pass and
// tools/bal19/road_tune_2026_11_06.js), confirmed against the fight as it was (arena_app.js at --base, default HEAD): 200 games each on the
// road measure's seeds (9100 + 37g), the Map reference, no leader for your seat. A change is kept only when it is 2+ points nearer the
// fight's target than the fight as it was (CONTENT12's rule); otherwise --revert puts the fight's line back.
//   node tools/bal19/confirm_2026_11_06.js [--base HEAD] [--revert] [--shard 0 --shards 2]  -> docs/balance/bal19/confirm-2026-11-06[-<shard>].json
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const BASE = arg('--base', 'HEAD'), SHARD = +arg('--shard', 0), SHARDS = +arg('--shards', 1), GAMES = +arg('--games', 200);
const APP = path.join(ROOT, 'arena_app.js');
const was = cp.execSync(`git show ${BASE}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 28 }).toString(), now = fs.readFileSync(APP, 'utf8');
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, linesOf = s => { const m = new Map(); let x; while ((x = lineRe.exec(s))) if (!m.has(x[1])) m.set(x[1], x[0]); return m; };
const W = linesOf(was), N = linesOf(now);
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: (l.match(/leaders:(\[[^\]]*\])/) || [0, null])[1], shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.match(/hqHp:(\d+)/) || [0, null])[1] });
const same = (p, q) => JSON.stringify(p.deck) === JSON.stringify(q.deck) && p.leaders === q.leaders && p.shield === q.shield;
const codes = [...N.keys()].filter(k => W.has(k) && !same(fields(W.get(k)), fields(N.get(k))));
const B = require('../lib_bramble.js'), G = B.G;
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };
const rows = [];
codes.filter((c, i) => i % SHARDS === SHARD).forEach(code => {
  const f = find(code); if (!f) return; const o = fields(W.get(code)), nn = Object.assign({}, f.n), on = Object.assign({}, f.n, { deck: o.deck });
  delete on.leaders; if (o.leaders) on.leaders = JSON.parse(o.leaders); delete on.shieldOverride; if (o.shield != null) on.shieldOverride = +o.shield;
  G.NODE_MAP_HINT.set(nn, f.m.id); G.NODE_MAP_HINT.set(on, f.m.id);
  const band = G.skirmishTargetBand(f.m.id, nn), t = band.t * 100;
  const w = n => { const r = G.simulateReferenceFight(f.m.id, n, GAMES, { seed0: 9100 }); return Math.round(r.wins / GAMES * 1000) / 10; };
  const before = w(on), after = w(nn), keep = Math.abs(after - t) + 2 <= Math.abs(before - t);
  rows.push({ code, map: f.m.id, mapName: f.m.name, kind: f.n.kind, target: t, lo: band.lo * 100, hi: band.hi * 100, before200: before, after200: after, keep, was: o, now: fields(N.get(code)) });
  console.log(code.padEnd(8), 'target', t, before, '->', after, keep ? 'keep' : 'REVERT');
});
const out = path.join(ROOT, 'docs', 'balance', 'bal19', 'confirm-2026-11-06' + (SHARDS > 1 ? '-' + SHARD : '') + '.json');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify({ about: 'BAL19: changed road fights, 200 games each, road seeds 9100 + 37g (tools/bal19/confirm_2026_11_06.js)', base: BASE, rows }, null, 1) + '\n');
if (a.includes('--revert')) { let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const files = fs.readdirSync(path.dirname(out)).filter(x => /^confirm-2026-11-06/.test(x)).flatMap(x => JSON.parse(fs.readFileSync(path.join(path.dirname(out), x), 'utf8')).rows);
  files.filter(r => !r.keep).forEach(r => { const cur = linesOf(s).get(r.code); if (cur) { s = s.replace(cur, W.get(r.code)); n++; } });
  fs.writeFileSync(APP, s); console.log('reverted', n); }
// --annotate: a kept fight changed only by skirmish_pass.js weak / curve (no BAL19 comment yet) gets its dated comment
if (a.includes('--annotate')) { let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const files = fs.readdirSync(path.dirname(out)).filter(x => /^confirm-2026-11-06/.test(x)).flatMap(x => JSON.parse(fs.readFileSync(path.join(path.dirname(out), x), 'utf8')).rows);
  files.filter(r => r.keep).forEach(r => { const cur = linesOf(s).get(r.code); if (!cur || /BAL19/.test(cur)) return;
    s = s.replace(cur, cur.replace(/(deck:\{[^}]*\})/, `$1 /* 2026-11-06 (BAL19): retuned toward the road curve after CONTENT12's fold (target ${Math.round(r.target * 10) / 10}; skirmish_pass.js weak / curve --strict, the fight's own list, K14 no worse), ${r.before200}% -> ${r.after200}% at 200 games (was ${JSON.stringify(r.was.deck)}) */`)); n++; });
  fs.writeFileSync(APP, s); console.log('annotated', n); }
