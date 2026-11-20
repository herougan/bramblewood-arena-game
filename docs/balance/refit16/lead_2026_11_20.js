#!/usr/bin/env node
// 2026-11-20 (package REFIT16, Part A): the early-bramble lead (owner call EB) read on and off, sim-only. EB_MODE patches the arena_app.js
// source in memory before the lib evaluates it (arena_app.js on disk and the live rule are untouched):
//   live      the game's rule (your bramble = max(own, enemy Health + Shield + 3) on Maps 0-1)
//   off       no lead (EARLY_BRAMBLE_LAST_MAP = -1: your own bramble)
//   lead=N    EARLY_BRAMBLE_LEAD = N
//   exact=N   your bramble = enemy Health + Shield + N, your own Health not counted (what the lead would do if your bramble were not higher)
//   EB_MODE=<mode> node docs/balance/refit16/lead_2026_11_20.js games seed CODE...
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const mode = process.env.EB_MODE || 'live', rf = fs.readFileSync;
const patch = s => { const [k, v] = mode.split('='); let t = s;
  if (k === 'off') t = s.replace('EARLY_BRAMBLE_LAST_MAP = 1;', 'EARLY_BRAMBLE_LAST_MAP = -1;');
  else if (k === 'lead') t = s.replace('const EARLY_BRAMBLE_LEAD = 3,', `const EARLY_BRAMBLE_LEAD = ${+v},`);
  else if (k === 'exact') t = s.replace('function earlyBrambleHp(own, enemyTotal){ return Math.max(Number(own) || 0, (Number(enemyTotal) || 0) + EARLY_BRAMBLE_LEAD); }',
    `function earlyBrambleHp(own, enemyTotal){ return (Number(enemyTotal) || 0) + ${+v}; }`)
    .replace('return h > (Number(ch.health) || 0) ? Object.assign({}, ch, {health: h}) : ch;', 'return Object.assign({}, ch, {health: h});');
  if (k !== 'live' && t === s) throw new Error('patch missed: ' + mode); return t; };
fs.readFileSync = function (p, ...a) { const r = rf.call(fs, p, ...a); return path.resolve(String(p)) === APP && typeof r === 'string' ? patch(r) : r; };
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
fs.readFileSync = rf;
const [gs, ss, ...codes] = process.argv.slice(2), N = +gs, SEED = +ss;
for (const code of codes) { const { m, n } = X.byCode[code]; G.NODE_MAP_HINT.set(n, m.id);
  const st = G.referenceFightSetup(m.id, n, { seed0: SEED });
  const w = Math.round(G.simulateReferenceFight(m.id, n, N, { seed0: SEED }).win * 1000) / 10;
  console.log(mode.padEnd(8), code.padEnd(5), 'enemy', st.sc.hp + '+' + st.sc.shield, 'yours', st.myCastle.health, 'win', w, `(${N} games, seed ${SEED})`); }
