#!/usr/bin/env node
// 2026-11-14 (package WHATIF1): numbers for the owner's open side-map decisions (SIDE2-1, SIDE2-2, SIDE2-4), simulated in a scratch copy of the
// repo; nothing here is meant for the real arena_app.js. SKIR1's deck rules (tools/skir1/lib_fight_2026_11_11.js, its fill in build_2026_11_11.js)
// and SIDE2's choices (LIST1's held cards out; an ender takes its BPRO-1 scaled to the fight, as tools/side2/anchor_2026_11_13.js; a fight the
// builder left unbuilt takes a seeded blend, as tools/side2/fallback_2026_11_13.js). Under tools/whatif1/rules_2026_11_14.js --carried 2 the rules
// let Carried cards hold 2 copies.
//   rebuild --codes a,b [--ender a] [--size a=12,b=14] [--measure 400] [--write]
//        a new legal deck per fight: --ender -> BPRO-1 scaled; else its deck scaled to --size (or kept) and refilled; a deck that is not legal
//        under the rules or not in the pool -> the seeded blend. --write puts it into (the scratch) arena_app.js; --measure reads old and new.
//   sweep --code X --param hp|shield|level --values v1,v2 [--games 400]    the fight with one lever moved (bramble Health as the fight plays it,
//        Shield as the fight plays it, Enemy level), on the road seeds (9100 + 37g); rows -> docs/balance/whatif1/sweep-2026-11-14.jsonl; --seed0 5100: fresh seeds
//   smallest --code X --param hp|shield|level --from V --to W --step S     sweep from V toward W, stopping at the first value inside the band
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'balance', 'whatif1'), APP = path.join(ROOT, 'arena_app.js');
require('../side2/holds_2026_11_13.js').patch();
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G;
const BLD = require('../skir1/build_2026_11_11.js');
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const PRO = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps;
fs.mkdirSync(OUT, { recursive: true });
function find(code) { for (const m of L.maps()) { const n = L.fightsOf(m).find(x => x.key === code); if (n) return { m, n }; } throw new Error('no fight ' + code); }
function bandOf(m, n) { const b = G.skirmishTargetBand(m.id, n), drop = n.challenge && b.curve ? 0.10 : 0, r = v => Math.round((v - drop) * 1000) / 10; return { t: r(b.t), lo: r(b.lo), hi: r(b.hi) }; } // the game's band (a boss: 30-49)
function measure(m, n, over, games) {
  const nn = Object.assign({}, n, over); G.NODE_MAP_HINT.set(nn, m.id);
  const ctx = G.referenceFightSetup(m.id, nn, { seed0: +arg('--seed0', 9100) }); let w = 0; for (let g = 0; g < games; g++) if (G.playReferenceGame(ctx, g).win) w++;
  const sc = G.skirmishCastle(nn); return { win: Math.round(w / games * 1000) / 10, hp: sc.hp, shield: sc.shield, level: G.roadEnemyLevelExact(nn) };
}
const scaleTo = (d, S) => { const tot = L.size(d), ids = Object.keys(d), out = {}; let r = S; ids.forEach(id => { out[id] = Math.max(1, Math.floor(d[id] * S / tot)); r -= out[id]; });
  ids.slice().sort((p, q) => (d[q] * S / tot % 1) - (d[p] * S / tot % 1)).forEach(id => { if (r > 0) { out[id]++; r--; } });
  while (r < 0) { const big = ids.filter(id => out[id] > 1).sort((p, q) => out[q] - out[p])[0]; if (!big) break; out[big]--; r++; } return out; };
function rebuild(code, S2, ender) {
  const { m, n } = find(code), S0 = L.size(n.deck), S = S2 || S0;
  const nn = S === S0 ? n : Object.assign({}, n, { deck: scaleTo(n.deck, S) }); // the fight's size comes from its deck (L.fight: S = size(old))
  const f = L.fight(m, nn); let s = 7; const R = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let d = null, how;
  if (ender) { const b1 = ((PRO()[m.id] || {}).bpro || [])[0]; if (b1) { const want = {}; Object.entries(b1.deck).forEach(([id, k]) => { if (f.pool.includes(id)) want[id] = k * f.S / 20; }); d = BLD.fill(f, want, () => 1, R, null); how = 'BPRO-1 ' + b1.id + ' scaled'; } }
  if (!d && !ender && Object.keys(n.deck).every(id => f.pool.includes(id))) { const want = {}; Object.entries(n.deck).forEach(([id, k]) => { want[id] = k * f.S / S0; }); d = BLD.fill(f, want, () => 1, R, null); how = 'its deck scaled and refilled'; }
  let t = 0.6; try { t = G.skirmishTargetBand(m.id, n).t; } catch (e) {}
  for (let k = 0; k < 30 && !d; k++) { const ids = f.pool.slice().sort(() => R() - 0.5).slice(0, f.dMax); [...f.keep.keys()].forEach(id => { if (!ids.includes(id)) ids.unshift(id); });
    d = BLD.fill(f, BLD.spread(ids.slice(0, f.dMax), f.S, t), () => 1, R, null); how = 'seeded blend (SIDE2 fallback)'; }
  return { m, n, f, deck: d, how, size: f.S, was: S0, problems: d ? [] : BLD.fill.last || [] };
}
const sortD = d => Object.fromEntries(Object.keys(d).sort().map(id => [id, d[id]]));
if (CMD === 'rebuild') {
  const codes = arg('--codes', '').split(',').filter(Boolean), enders = new Set(arg('--ender', '').split(',').filter(Boolean)), G0 = +arg('--measure', 0);
  const sizes = Object.fromEntries(arg('--size', '').split(',').filter(Boolean).map(x => x.split('=')).map(([c, v]) => [c, +v]));
  let src = fs.readFileSync(APP, 'utf8'); const rows = [];
  for (const code of codes) {
    const r = rebuild(code, sizes[code], enders.has(code)), row = { code, rule: global.__whatif1 ? 'carried x' + global.__whatif1.carried : 'K14', size: r.size, was: r.was, how: r.how, old: r.n.deck, deck: r.deck, problems: r.problems, band: bandOf(r.m, r.n) };
    if (G0) { row.games = G0; row.oldWin = r.f.legal(r.n.deck) || r.was === r.size ? measure(r.m, r.n, {}, G0).win : null; if (r.deck) row.newWin = measure(r.m, r.n, { deck: r.deck }, G0).win; }
    rows.push(row); console.log(code, row.rule, `size ${r.was}->${r.size}`, r.deck ? JSON.stringify(sortD(r.deck)) + ' (' + r.how + ')' : 'UNBUILDABLE ' + r.problems.join('; '), G0 ? `| ${G0} games: old ${row.oldWin} new ${row.newWin} (target ${row.band.t})` : '');
    if (a.includes('--write') && r.deck) { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = src.match(re); if (!mm) throw new Error('node not found ' + code);
      src = src.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sortD(r.deck)) + ` /* WHATIF1 scratch (${row.rule}): ${r.how} */`)); }
  }
  if (a.includes('--write')) { fs.writeFileSync(APP + '.w1tmp', src); fs.renameSync(APP + '.w1tmp', APP); }
  fs.appendFileSync(path.join(OUT, 'rebuild-2026-11-14.jsonl'), rows.map(x => JSON.stringify(Object.assign({ tag: arg('--tag', '') }, x))).join('\n') + '\n');
} else if (CMD === 'sweep' || CMD === 'smallest') {
  const code = arg('--code'), P = arg('--param'), games = +arg('--games', 400), { m, n } = find(code), band = bandOf(m, n);
  // the Shield as the fight plays it: the smallest shieldOverride whose played Shield (skirmishCastle, at BRAMBLE_SCALE) reaches v; 0 = an explicit no Shield
  const shieldOv = v => { if (!(v > 0)) return 0; for (let o = 1; o < 1000; o++) { const nn = Object.assign({}, n, { shieldOverride: o }); G.NODE_MAP_HINT.set(nn, m.id); if (G.skirmishCastle(nn).shield >= v) return o; } throw new Error('no override for Shield ' + v); };
  const over = v => P === 'hp' ? { brambleHealth: v } : P === 'shield' ? { shieldOverride: shieldOv(v) } : P === 'level' ? { enemyLevel: v } : null;
  if (!over(1)) throw new Error('--param hp|shield|level');
  let vals = CMD === 'sweep' ? arg('--values').split(',').map(Number) : [];
  if (CMD === 'smallest') { const from = +arg('--from'), to = +arg('--to'), st = Math.abs(+arg('--step')); for (let v = from; from > to ? v >= to - 1e-9 : v <= to + 1e-9; v = Math.round((v + (from > to ? -st : st)) * 100) / 100) vals.push(v); }
  for (const v of vals) {
    const t0 = Date.now(), r = measure(m, n, over(v), games), row = Object.assign({ code, name: n.name, param: P, value: v, games, seed0: +arg('--seed0', 9100), target: band.t, lo: band.lo, hi: band.hi, inBand: r.win >= band.lo && r.win <= band.hi, tag: arg('--tag', '') }, r, { sec: Math.round((Date.now() - t0) / 1000) });
    fs.appendFileSync(path.join(OUT, 'sweep-2026-11-14.jsonl'), JSON.stringify(row) + '\n');
    console.log(`${code} ${P}=${v}: win ${r.win}% (target ${band.t} [${band.lo}-${band.hi}]) hp ${r.hp} shield ${r.shield} level ${r.level} | ${row.sec}s`);
    if (CMD === 'smallest' && row.inBand) break;
  }
} else console.log('commands: rebuild | sweep | smallest (see the header)');
