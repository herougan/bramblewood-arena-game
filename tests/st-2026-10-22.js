#!/usr/bin/env node
// 2026-10-22 (package ST; owner 18:20: "Program the more robust way of testing - lumber, wait, multi-skill all need to be taken in account.
// Field effects ..."): tools/skill_test_robust.js. Checks:
//   1. the field roll: Day/Night and Tide each in 20% of fights, at least 20% of fights carry a non-common field, uncommon fields more often
//      than rare ones, every field turns up, the same seed gives the same fields;
//   2. the units: the test deck's Wait / Lumber mix is the live band cards' (within 2 points a cell), stats from the budget (a vanilla unit
//      uses its whole N at Level 1, an Armor unit gives up about its S), cap 2 holds;
//   3. a --quick run (Armor, Nocturnal; --mono --multi) writes its JSON and markdown, the vanilla deck can win and lose, every row is there,
//      and a small run twice gives the same numbers (seeded), with 1 job or 2.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const ST = require(path.join(ROOT, 'tools', 'skill_test_robust.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js'));
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));

// ---- 1. the field roll
{ const C = ST.FIELD_CONFIG, F = ST.FIELDS, ids = Object.keys(F), G = 20000, seen = {}; let nonCommon = 0, plain = 0;
  ok(C.p.common === 0.2 && C.forceNonCommon >= 0.2 && C.p.uncommon > C.p.rare && C.forceWeight.uncommon > C.forceWeight.rare, '1. the config: common 20%, at least 20% get a non-common field, uncommon above rare');
  ok(F.daynight.class === 'common' && F.tide.class === 'common' && ['dark', 'rain', 'fog'].every(k=> F[k].class === 'uncommon'), '1. Day/Night and Tide common; darkness, rain, fog uncommon (owner)');
  for(let g = 0; g < G; g++){ const f = ST.rollField(g); f.ids.forEach(id=> seen[id] = (seen[id] || 0) + 1);
    if(f.ids.some(id=> F[id] && F[id].class !== 'common')) nonCommon++; if(!f.ids.length) plain++;
    if(!f.ids.includes('daynight') && f.rules.phase !== C.absentPhase) ok(false, '1. no Day/Night means phase ' + C.absentPhase); }
  const sh = id=> (seen[id] || 0) / G, near = (a, b, e)=> Math.abs(a - b) <= e;
  ok(near(sh('daynight'), 0.2, 0.012) && near(sh('tide'), 0.2, 0.012), `1. Day/Night ${sh('daynight')} and Tide ${sh('tide')} near 20%`);
  ok(nonCommon / G >= 0.2 && nonCommon / G < 0.6, `1. ${(100 * nonCommon / G).toFixed(1)}% of fights carry a non-common field (at least 20%)`);
  const U = ids.filter(k=> F[k].class === 'uncommon'), R = ids.filter(k=> F[k].class === 'rare');
  const wSum = U.length * C.forceWeight.uncommon + R.length * C.forceWeight.rare;
  const expU = C.p.uncommon + C.forceNonCommon * C.forceWeight.uncommon / wSum, expR = C.p.rare + C.forceNonCommon * C.forceWeight.rare / wSum;
  const badU = U.filter(k=> !near(sh(k), expU, 0.012)), badR = R.filter(k=> !near(sh(k), expR, 0.008));
  ok(!badU.length, `1. each uncommon field near ${expU.toFixed(3)}: ${badU.map(k=> k + ' ' + sh(k)).join(', ')}`);
  ok(!badR.length, `1. each rare field near ${expR.toFixed(3)}: ${badR.map(k=> k + ' ' + sh(k)).join(', ')}`);
  ok(ids.every(k=> seen[k] > 0), '1. every field turns up in 20,000 fights: missing ' + ids.filter(k=> !seen[k]).join(', '));
  ok(plain / G > 0.3, `1. a good share of fights have no field at all (${(100 * plain / G).toFixed(1)}%)`);
  ok(JSON.stringify(ST.rollField(77)) === JSON.stringify(ST.rollField(77)), '1. the same game, the same field');
  ST.setSeed(2); const s2 = JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7].map(g=> ST.rollField(g))); ST.setSeed(1);
  ok(s2 !== JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7].map(g=> ST.rollField(g))), '1. --seed changes the fields'); }

// ---- 2. the units
{ const mix = ST.liveMix(), defs = {}, ctx = ST.makeCtx(defs, table, mix, null, []);
  ok(mix.band > 500 && mix.profiles.every(p=> p.wait <= 3 && p.cost <= 3), `2. the band mix: ${mix.band} cards, Wait and Lumber folded into 0-3`);
  const want = {}, got = {}; let tot = 0, units = 0; mix.profiles.forEach(p=>{ const k = p.wait + '/' + p.cost; want[k] = (want[k] || 0) + p.w; tot += p.w; });
  for(let g = 0; g < 600; g++){ const d = ctx.deckFor({unit: {effects: {}}}, g).deck; Object.entries(d).forEach(([id, c])=>{ const k = defs[id].wait + '/' + defs[id].cost; got[k] = (got[k] || 0) + c; units += c; }); }
  const off = Object.keys(want).filter(k=> Math.abs(want[k] / tot - (got[k] || 0) / units) > 0.02);
  ok(!off.length, '2. the test units\' Wait / Lumber mix is the band cards\' within 2 points: ' + off.map(k=> `${k} ${(want[k] / tot).toFixed(3)} vs ${((got[k] || 0) / units).toFixed(3)}`).join(', '));
  ok(Object.keys(got).length >= 8 && Object.keys(got).some(k=> k.startsWith('0/')) && Object.keys(got).some(k=> k.startsWith('3/')), '2. Wait 0 to 3 all played');
  const p11 = {rarity: 'common', wait: 1, cost: 1}, v = ctx.priced({}, p11), a = ctx.priced({armor: 1}, p11), N0 = BB.nAt(BB.baseOf(p11), 1);
  ok(Math.abs(v.q - N0 * BB.DEFAULTS.plainBonus) < 0.02, `2. a vanilla Wait 1 Lumber 1 common has N(1) × the plain bonus in stats (${v.q.toFixed(2)})`);
  ok(Math.abs(a.q - (N0 - a.S)) < 0.02 && a.S > 0, `2. an Armor 1 unit gives up its S ${a.S} (${a.q.toFixed(2)} points)`);
  const f = ctx.priced({flying: true}, p11); ok(Math.abs(f.q - (f.N - f.S) / 1.5) < 0.02, '2. a half-miss skill divides the stat points by 1.5');
  let capOk = true; for(let i = 0; i < 200; i++){ const pr = ctx.priced({armor: 3}, mix.profiles[i % mix.profiles.length]), st = ctx.statsOf(pr, {attack: 3, health: 10}, (i % 7) / 7, (i % 5) / 5, true);
    if(pr.f * (st.A * st.H * pr.m + pr.S * Math.abs(pr.S)) > (pr.N / 3) * (pr.N / 3) + 1e-9 && st.A > 0) capOk = false; }
  ok(capOk, '2. cap 2 holds on every unit (Attack moves to Health)'); }

// ---- 3. runs
{ const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'st-')), tool = path.join(ROOT, 'tools', 'skill_test_robust.js');
  const run = (args, out)=> cp.execFileSync(process.execPath, [tool, ...args, '--out', out], {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  const q = path.join(dir, 'quick.json'), t0 = Date.now(); run(['--mono', '--multi', '--quick', '--skills', 'armor,nocturnal', '--jobs', '2'], q); const ms = Date.now() - t0;
  const d = JSON.parse(fs.readFileSync(q, 'utf8')), row = k=> d.rows.find(r=> r.key === k);
  ok(fs.existsSync(q.replace(/\.json$/, '.md')), '3. --quick writes its markdown summary beside the JSON');
  ok(d.vanillaWr > 0.1 && d.vanillaWr < 0.9, `3. the vanilla deck wins some and loses some (${d.vanillaWr})`);
  ok(['mono:{"armor":1}', 'mono:{"nocturnal":true}', 'multi:armor=1', 'multi-:armor=1', 'multi:nocturnal'].every(row), '3. the mono, multi and companions-only rows: ' + d.rows.map(r=> r.key).join(' '));
  ok(row('multi:nocturnal') && row('multi:nocturnal').marginal && Number.isFinite(row('multi:nocturnal').marginal.worth), '3. --multi reports the marginal worth');
  const a = row('mono:{"armor":1}'); ok(a && Number.isFinite(a.worth) && a.paid > 0 && a.byField && a.byField.daynight && a.byField.tide, '3. worth, paid and the per-field reading (Day/Night, Tide)');
  ok(d.setup.mix.profiles.length > 5 && d.setup.fieldConfig.p.common === 0.2, '3. the setup (the mix and the field config) is in the JSON');
  console.log(`  --quick (2 skills, mono + multi, 2 jobs): ${Math.round(ms / 1000)} s, ${d.games} games, vanilla ${d.vanillaWr}, Armor 1 worth ${a.worth} (S table ${a.Stable}), Nocturnal by Day/Night ${row('mono:{"nocturnal":true}').byField.daynight ? row('mono:{"nocturnal":true}').byField.daynight.worth : '–'} vs none ${row('mono:{"nocturnal":true}').byField.none ? row('mono:{"nocturnal":true}').byField.none.worth : '–'}`);
  const s1 = path.join(dir, 's1.json'), s2 = path.join(dir, 's2.json'), small = ['--mono', '--skills', 'quick', '--games', '40', '--curve-games', '10', '--quick'];
  run(small.concat(['--jobs', '1']), s1); run(small.concat(['--jobs', '2']), s2);
  const strip = f=> JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8')).rows);
  ok(strip(s1) === strip(s2), '3. seeded: the same run gives the same rows, with 1 job or 2');
  fs.rmSync(dir, {recursive: true, force: true}); }

console.log(fail ? `st-2026-10-22: ${fail} of ${n} checks failed` : `st-2026-10-22: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
