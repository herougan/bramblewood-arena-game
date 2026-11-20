#!/usr/bin/env node
// 2026-11-20 (package REFIT12): for the owner option only (nothing applied): a fight's win rate with one lever changed on its deck,
// a Shield override (shield=N), the CPU castle (hq=N, as hqHp), k copies of a card out / in (out=card:k, add=card:k; size changes) or the
// fight's rules (rules=none or rules=<json>), or any node field (set=field:<json>), at G games on seed S.
//   node docs/balance/refit12/lever_2026_11_20.js CODE '<deck json>'|live games seed lever...    e.g. 18-4 live 160 331300 shield=14 hq=100
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [code, dj, gs, ss, ...levers] = process.argv.slice(2), { m, n } = X.byCode[code], N = +gs, SEED = +ss;
const base = Object.assign({}, n, { deck: dj === 'live' ? n.deck : JSON.parse(dj) });
const win = nn => { G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED }).win * 1000) / 10; };
console.log(code, 'base', JSON.stringify({ shield: n.shieldOverride, hqHp: n.hqHp }), win(base), `(${N} games, seed ${SEED})`);
levers.forEach(l => { const [k, v] = l.split('='), nn = Object.assign({}, base, { deck: Object.assign({}, base.deck) });
  if (k === 'shield') nn.shieldOverride = +v; else if (k === 'hq') nn.hqHp = +v;
  else if (k === 'rules') nn.rules = v === 'none' ? {} : JSON.parse(v);
  else if (k === 'set') { const j = v.indexOf(':'); nn[v.slice(0, j)] = JSON.parse(v.slice(j + 1)); }
  else if (k === 'add') v.split(',').forEach(s => { const [id, c] = s.split(':'); nn.deck[id] = (nn.deck[id] || 0) + +c; });
  else if (k === 'out') v.split(',').forEach(s => { const [id, c] = s.split(':'); nn.deck[id] -= +c; if (nn.deck[id] <= 0) delete nn.deck[id]; });
  console.log(' ', l.padEnd(40), win(nn)); });
