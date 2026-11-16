#!/usr/bin/env node
// 2026-11-16 (package REFIT1): which FOLD5-changed cards sit in each off-band fight's enemy deck (and leader) and in the player's
// reference deck. Inputs: the fold plan (changes per card), a post-fold measure (rows with win / target / deck), optionally a pre-fold
// measure on the same seeds (the fight's move). Writes JSON to stdout or --out.
//   node tools/refit1/attrib_2026_11_16.js --post docs/balance/skirmish-pass-fold5-s7300.jsonl [--pre <pre-fold rows>] [--gap 10] [--out f.json]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const rows = f => fs.readFileSync(path.resolve(ROOT, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/server-overrides/fold-plan-2026-11-16.json'), 'utf8'));
const changed = {}; plan.rows.forEach(r => { if (r.changes && r.changes.length) changed[r.id] = r; });
// an effects change as its keys: +added, -removed, key old→new (values compact)
const v = x => x === true ? '' : ' ' + (typeof x === 'object' ? JSON.stringify(x).replace(/"/g, '') : String(x));
const effTxt = c => { const f = c.from || {}, t = c.to || {}, out = [];
  Object.keys(t).forEach(k => { if (!(k in f)) out.push('+' + k + v(t[k])); else if (JSON.stringify(f[k]) !== JSON.stringify(t[k])) out.push(k + v(f[k]) + '→' + v(t[k]).trim()); });
  Object.keys(f).forEach(k => { if (!(k in t)) out.push('-' + k + v(f[k])); }); return out.join(', '); };
const fieldTxt = c => c.field === 'effects' ? effTxt(c) : c.field === 'name' ? 'renamed' : c.field + ' ' + (c.from == null ? '-' : typeof c.from === 'object' ? JSON.stringify(c.from).replace(/"/g, '') : c.from) + '→' + (typeof c.to === 'object' ? JSON.stringify(c.to).replace(/"/g, '') : c.to);
const statTxt = r => { const s = r.changes.filter(c => c.field === 'attack' || c.field === 'health'); const o = r.changes.filter(c => c.field !== 'attack' && c.field !== 'health').map(fieldTxt).filter(Boolean);
  const fa = r.changes.find(c => c.field === 'attack'), fh = r.changes.find(c => c.field === 'health');
  const before = [fa ? fa.from : r.now[0], fh ? fh.from : r.now[1]], after = r.now;
  return (s.length ? `${before[0]}/${before[1]}→${after[0]}/${after[1]}` : '') + (o.length ? (s.length ? ', ' : '') + o.join(',') : ''); };
const post = rows(arg('--post', 'docs/balance/skirmish-pass-fold5-s7300.jsonl')).filter(r => r.curve);
const pre = arg('--pre') ? Object.fromEntries(rows(arg('--pre')).map(r => [r.key, r])) : {};
const GAP = +arg('--gap', 10), out = [];
for (const r of post) {
  const gap = r.win - r.target; if (Math.abs(gap) <= GAP) continue;
  const m = B.MAPS.find(x => x.id === r.map), n = m && m.nodes.find(x => x.key === r.key); if (!n) continue;
  G.NODE_MAP_HINT.set(n, m.id);
  const leaders = G.skirmishLeadersOf(n, m.id) || [], ref = G.referenceDeckFor(m.id, n);
  const enemy = Object.entries(r.deck || n.deck).filter(([id]) => changed[id]).map(([id, k]) => ({ id, k, ch: statTxt(changed[id]) }));
  leaders.filter(id => changed[id]).forEach(id => enemy.push({ id, k: 'leader', ch: statTxt(changed[id]) }));
  const mine = Object.entries(ref.deck).filter(([id]) => changed[id]).map(([id, k]) => ({ id, k, ch: statTxt(changed[id]) }));
  out.push({ key: r.key, side: r.side, win: r.win, target: r.target, gap: Math.round(gap * 10) / 10, pre: pre[r.key] ? pre[r.key].win : null,
    move: pre[r.key] ? Math.round((r.win - pre[r.key].win) * 10) / 10 : null, refMap: ref.deckMap, enemy, mine });
}
out.sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap));
const txt = JSON.stringify({ changed: Object.fromEntries(Object.entries(changed).map(([id, r]) => [id, statTxt(r)])), fights: out }, null, 1);
if (arg('--out')) fs.writeFileSync(arg('--out'), txt); else console.log(txt);
