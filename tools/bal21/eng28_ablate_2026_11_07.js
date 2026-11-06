#!/usr/bin/env node
// 2026-11-07 (package BAL21 item 2): which ENG28 rule made 17-PRO-2 a wall for Reference-2? The engine is loaded with one ENG28 rule turned back
// (a text patch on bramblewood-engine.js in memory, put into require's cache before the game loads; the file on disk is not touched) and the
// PRO fight is played as tools/opt/pro_ease.js plays it (its seeds: fnv('pro-ease|<id>|<ref>') + 37g). Variants:
//   now      the engine as it is
//   fire     Burn back to ENG20-1: a lit unit Burns 2 rounds, refreshed, not stacked (was: +1 Burn a hit, stacking)
//   frost    no Freeze counter from frost damage (eng28Chill off; the old 1-in-2 Ice Arrow roll is not restored)
//   poison   flat poison damage hurts again (was: it only adds Poison stacks)
//   dark     shots never miss in the dark (eng28DarkShotMiss off)
//   allOff   the four together
//   --before plays the deck as it was before BAL21's fix (the entry's last history deck)
//   node tools/bal21/eng28_ablate_2026_11_07.js [--id 17-PRO-2] [--ref ref2] [--games 200] [--variants now,fire,...]  -> docs/balance/bal21/eng28-ablate-<id>-<ref>.json
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const ROOT = path.resolve(__dirname, '..', '..'), ENGF = path.join(ROOT, 'bramblewood-engine.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const ID = arg('--id', '17-PRO-2'), REF = arg('--ref', 'ref2'), GAMES = +arg('--games', 200), VAR = arg('--variants', 'now,fire,frost,poison,dark,allOff').split(',');
const PATCH = {
  fire: ['const b0 = card.burn || 0; card.burn = b0 + EN20.burnPerHit;', 'const b0 = card.burn || 0; card.burn = Math.max(b0, EN20.burnRounds);'],
  frost: ['function eng28Chill(card, y, fromUnit){', 'function eng28Chill(card, y, fromUnit){ return;'],
  poison: ["if(dmgType === 'poison' && attDefId && !en20Tick && dmg > 0){", "if(false && dmgType === 'poison' && attDefId && !en20Tick && dmg > 0){"],
  dark: ['function eng28DarkShotMiss(c, pid, target){', 'function eng28DarkShotMiss(c, pid, target){ return false;'],
};
const variant = process.env.BAL21_VARIANT;
if (variant) { // child: patch, load, measure one variant, print JSON
  let s = fs.readFileSync(ENGF, 'utf8'); const keys = variant === 'allOff' ? Object.keys(PATCH) : variant === 'now' ? [] : [variant];
  keys.forEach(k => { const [x, y] = PATCH[k]; if (s.split(x).length !== 2) throw new Error('patch ' + k + ': anchor not found once'); s = s.replace(x, y); });
  const m = new Module(ENGF, null); m.filename = ENGF; m.paths = Module._nodeModulePaths(ROOT); m._compile(s, ENGF); m.loaded = true; require.cache[ENGF] = m;
  const O = require('../opt/deckopt.js'), P = require('../opt/pro_skirmishes.js'), gm = O.loadGame(ROOT), G = gm.G;
  const file = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8'));
  let ent = null, e = null, mid = null; for (const k of Object.keys(file.maps)) { const x = (file.maps[k].pro || []).concat(file.maps[k].bpro || []).find(y => y.id === ID); if (x) { ent = file.maps[k]; e = x; mid = k; } }
  if (a.includes('--before') && e.history && e.history.length) e = Object.assign({}, e, { deck: e.history[e.history.length - 1].deck }); // BAL21: the deck before BAL21's fix
  const map = G.CONQUEST_MAPS.find(x => x.id === mid), n = P.proNode(gm, map, e, ent.field || {}); n.ai = 'smart'; if ((e.leaders || [])[0]) n.showcase = e.leaders[0];
  const fnv = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const ctx = G.referenceFightSetup(map.id, n, { refSet: REF, seed0: fnv('pro-ease|' + ID + '|' + REF) }); let w = 0, rounds = 0;
  for (let g = 0; g < GAMES; g++) { const r = G.playReferenceGame(ctx, g); if (r.win) w++; rounds += r.rounds || 0; }
  process.stdout.write(JSON.stringify({ variant, win: Math.round(w / GAMES * 1000) / 1000, rounds: Math.round(rounds / GAMES * 100) / 100, engineIsPatched: require('../../bramblewood-engine.js') === m.exports }) + '\n');
} else {
  const cp = require('child_process'), rows = [];
  for (const v of VAR) { const out = cp.execFileSync(process.execPath, [__filename].concat(a), { env: Object.assign({}, process.env, { BAL21_VARIANT: v }), cwd: ROOT, maxBuffer: 1 << 26 }).toString().trim().split('\n').pop();
    const r = JSON.parse(out); rows.push(r); console.log(v.padEnd(7), (r.win * 100).toFixed(1) + '%', 'rounds', r.rounds, r.engineIsPatched ? '' : '(engine NOT patched!)'); }
  const f = path.join(ROOT, 'docs', 'balance', 'bal21', `eng28-ablate-${ID}-${REF}.json`); fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ about: 'BAL21 item 2: one ENG28 rule turned back at a time (tools/bal21/eng28_ablate_2026_11_07.js), the PRO fight as tools/opt/pro_ease.js plays it', id: ID, ref: REF, games: GAMES, rows }, null, 1) + '\n');
}
