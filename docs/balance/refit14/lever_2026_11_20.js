#!/usr/bin/env node
// 2026-11-20 (package REFIT14): REFIT13's script, copied. Was: REFIT12's lever reader (docs/balance/refit12/lever_2026_11_20.js) with combined levers: a lever may join
// several with '+' (e.g. set=characterId:null+hq=12), each applied to the same copy of the fight. Nothing is applied to arena_app.js.
//   [REF_DECK='<deck json>'] node docs/balance/refit14/lever_2026_11_20.js CODE live games seed lever...
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const [code, dj, gs, ss, ...levers] = process.argv.slice(2), { m, n } = X.byCode[code], N = +gs, SEED = +ss;
const REF = process.env.REF_DECK ? JSON.parse(process.env.REF_DECK) : null; // a stand-in Map reference deck (report only), else the live one
const base = Object.assign({}, n, { deck: dj === 'live' ? n.deck : JSON.parse(dj) });
const win = nn => { G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, N, { seed0: SEED, deck: REF }).win * 1000) / 10; };
console.log(code, 'base', win(base), `(${N} games, seed ${SEED})`);
const one = (nn, l) => { const j0 = l.indexOf('='), k = l.slice(0, j0), v = l.slice(j0 + 1);
  if (k === 'shield') nn.shieldOverride = +v; else if (k === 'hq') { if (v === 'none') delete nn.hqHp; else nn.hqHp = +v; }
  else if (k === 'rules') nn.rules = v === 'none' ? {} : JSON.parse(v);
  else if (k === 'set') { const j = v.indexOf(':'); nn[v.slice(0, j)] = JSON.parse(v.slice(j + 1)); }
  else if (k === 'add') v.split(',').forEach(s => { const [id, c] = s.split(':'); nn.deck[id] = (nn.deck[id] || 0) + +c; });
  else if (k === 'out') v.split(',').forEach(s => { const [id, c] = s.split(':'); nn.deck[id] -= +c; if (nn.deck[id] <= 0) delete nn.deck[id]; });
  else throw new Error('lever? ' + l); };
levers.forEach(l => { const nn = Object.assign({}, base, { deck: Object.assign({}, base.deck) }); l.split('+').forEach(p => one(nn, p)); console.log(' ', l.padEnd(60), win(nn)); });
