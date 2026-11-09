#!/usr/bin/env node
// 2026-11-07 (package BAL25, owner 11-07 09:47): the card power measure v3 (tools/card_balance.js --v3): only the Maps 0-20 cards,
// 400 games a card, a random day/night and field per game, two Lumber cards in the filler, the advanced pool the top 40%, the
// balancing-only Faction-Starter rarity (Level 0, a rank below Starter), and "for its budget" (power minus a least-squares line of
// power on N). The build bakes it into CARD_POWER (v 3, fb), centred on the median as before.
// Static: the tool's code, the committed report (docs/balance/bal25/card-power.json) checked against its own rules and against
// canonical/card-obtain-maps.json and cards.json, the build's table, the bookkeeping. No simulations here.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- the tool
const tool = read('tools/card_balance.js');
ok(/const V3 = args\.includes\('--v3'\)/.test(tool), '--v3 switches the measure on');
ok(/V3 && !N_ARG \? 400/.test(tool), '400 games a card by default under --v3');
ok(/\|\| 100\);/.test(tool) && /TOP_SHARE = 0\.2, LOW_SAMPLE = 20/.test(tool), 'without --v3 the tool runs as BAL22 (100 games, top 20%)');
ok(/optv\('adv-top', 0\.4\)/.test(tool) && /Math\.round\(ok\.length \* TOP\)/.test(tool), 'advanced pool: the top 40% under --v3');
ok(/optv\('adv-mix', 20\)/.test(tool) /* 2026-11-10 (BAL34, BAL25-1 b): 20 top-pool cards by default; --adv-mix=5 is BAL25's mix */ && /fill\(shuf\(top\), all \? ADV_MIX : 20\)/.test(tool) && /fill\(shuf\(all\), 20\)/.test(tool), 'advanced deck: 20 top-pool cards by default (BAL25-1 b; the mix with --adv-mix=K)');
ok(/'termite-forager', 'land-tiller'/.test(tool), 'two Lumber cards in the v3 filler');
ok(/\['cycle', 0\.5\], \['day', 0\.25\], \['night', 0\.25\]/.test(tool), 'phase roll: cycle 50% / day 25% / night 25%');
ok(/makeSimEngine\(D, rnd, \{battleMode: MODE, rules\}\)/.test(tool) && /playV3\(D, [^)]*env\.rules, 60\)/.test(tool), 'each game passes its rolled rules to the engine');
ok(/skill_test_robust\.js/.test(tool) && /k !== 'daynight'/.test(tool), 'fields from skill_test_robust.js, its Day/Night entry replaced by the phase roll');
ok(/function isFactionStarter\(c\)\{ return !!\(c && c\.faction && OBTAIN\[c\.id\] == null && c\.rarity === 'starter'\); \}/.test(tool), 'Faction-Starter: a faction card, no obtain map, Starter rarity');
ok(/nAt\(SC\.budgetBase\(d\) - perR, 0, BUDGET_CFG\)/.test(tool), 'Faction-Starter N: Level 0, one rank below Starter');
ok(/st\.played > 0/.test(tool), 'a game counts only when the test side played the card');
ok(!/writeFileSync\([^)]*canonical/.test(tool) && !/appendFileSync\([^)]*canonical/.test(tool), 'the tool never writes canonical/');

// ---- the report
const rep = JSON.parse(read('docs/balance/bal25/card-power.json'));
const cards = JSON.parse(read('canonical/cards.json')), RAW = {}; cards.forEach(c=> RAW[c.id] = c);
const OBT = JSON.parse(read('canonical/card-obtain-maps.json')).maps;
const inScope = c=> OBT[c.id] != null ? OBT[c.id] <= 20 : !!(c.faction || c.rarity === 'starter' || (c.source && c.source.kind === 'base'));
const fieldable = c=> !c.token && !c.test && !c.hallOfFame && !c.baseId && !c.field && !c.pool;
ok(rep.v === 3 && rep.games === 400, 'v3 report at 400 games a card (' + rep.games + ')');
const rows = rep.rows || [], byId = {}; rows.forEach(r=> byId[r.id] = r);
const want = cards.filter(c=> fieldable(c) && inScope(c)).map(c=> c.id);
ok(want.every(id=> byId[id]), 'every Maps 0-20 card measured (' + want.filter(id=> !byId[id]).slice(0, 5).join(', ') + ')');
ok(rows.every(r=> RAW[r.id] && inScope(RAW[r.id])), 'no card outside Maps 0-20 (' + rows.filter(r=> !(RAW[r.id] && inScope(RAW[r.id]))).map(r=> r.id).slice(0, 5).join(', ') + ')');
ok(rep.scope && rep.scope.maxMap === 20 && rep.scope.cards === rows.length, 'scope recorded');
ok(rep.filler.includes('termite-forager') && rep.filler.includes('land-tiller'), 'the report names the Lumber filler');
ok(rep.env && rep.env.phases && rep.env.phases.cycle === 0.5 && /skill_test_robust/.test(rep.env.fields), 'the report names the phase roll and the fields');
ok(rows.every(r=> r.games === 400 && Number.isFinite(r.played) && Math.abs(r.playedShare - r.played / r.games) < 0.001), 'games, played, playedShare');
ok(rows.every(r=> !!r.lowSample === (r.played < 20)), 'lowSample flags exactly the cards played in under 20 games');
ok(rows.every(r=> r.played ? r.winRate != null : r.winRate == null), 'winRate only when the card was played');
ok(rows.every(r=> r.byPhase && ['cycle', 'day', 'night'].reduce((s, k)=> s + r.byPhase[k][0], 0) === r.played), 'byPhase adds up to the played games');
{ const tot = {cycle: 0, day: 0, night: 0}; rows.forEach(r=> ['cycle', 'day', 'night'].forEach(k=> tot[k] += r.byPhase[k][0])); const all = tot.cycle + tot.day + tot.night;
  ok(Math.abs(tot.cycle / all - 0.5) < 0.06 && Math.abs(tot.day / all - 0.25) < 0.06 && Math.abs(tot.night / all - 0.25) < 0.06, 'phases near 50 / 25 / 25 over the played games (' + JSON.stringify(tot) + ')'); }
// Faction-Starter
{ const fs1 = rows.filter(r=> r.rarityClass === 'factionStarter'), should = rows.filter(r=> RAW[r.id].faction && OBT[r.id] == null && RAW[r.id].rarity === 'starter');
  ok(fs1.length > 0 && fs1.length === should.length && fs1.every(r=> r.measuredAt === 0), 'Faction-Starter rows: exactly the rule, measured at Level 0 (' + fs1.length + ')');
  ok(rows.filter(r=> r.rarityClass !== 'factionStarter').every(r=> r.measuredAt === 1), 'other cards measured at Level 1');
  const st = rows.filter(r=> r.rarityClass === 'starter' && !RAW[r.id].faction);
  const avgN = a=> a.reduce((s, r)=> s + r.N, 0) / (a.length || 1);
  ok(!st.length || avgN(fs1) < avgN(st), 'Faction-Starter N below the other Starters\' (' + avgN(fs1).toFixed(1) + ' vs ' + avgN(st).toFixed(1) + ')'); }
ok(rows.every(r=> RAW[r.id].rarity === r.rarity || r.rarity === null), 'card data untouched: the report\'s rarity is the card\'s');
// advanced
{ const A = rep.advanced; ok(A && A.topShare === 0.4 && A.complete === true && A.measured === rows.length, 'advanced pass complete, top 40%');
  ok(A.poolCards === 20 && !A.restFrom, 'advanced opponent recorded: 20 top-pool cards (2026-11-10 BAL34, BAL25-1 b; was 5 + the field)');
  ok(JSON.parse(read('docs/balance/bal25/adv-calibration-2026-11-07.json')).rows.some(r=> /picked/.test(r.opponent)), 'the calibration of the mix is committed');
  const elig = rows.filter(r=> r.winRate != null && r.played >= 20);
  ok(Math.abs(A.pool.length - Math.round(elig.length * 0.4)) <= 1, 'pool = top 40% of the measured cards (' + A.pool.length + ' of ' + elig.length + ')');
  const cut = Math.min(...A.pool.map(id=> byId[id].winRate));
  ok(elig.filter(r=> !A.pool.includes(r.id)).every(r=> r.winRate <= cut), 'every card outside the pool scores at most the pool\'s lowest');
  const adv = rows.filter(r=> r.advRate != null).map(r=> r.advRate).sort((a, b)=> a - b), med = adv[Math.floor(adv.length / 2)];
  ok(adv.length > rows.length * 0.9, 'advanced rate for most cards');
  ok(rows.filter(r=> A.pool.includes(r.id) && r.advRate != null).every(r=> r.advRate <= r.winRate + 15), 'pool cards come back toward 50 against the pool');
  ok(med >= 10 && med <= 30, 'the advanced median sits near 20 (' + med + '); 2026-11-10 (BAL34, BAL25-1 b): 20 top-40% cards, the strongest decks (BAL25 measured 18.9; the mix held it near 50)');
  console.log('  advanced median ' + med + ' (top-40% pool of ' + A.pool.length + ')'); }
// for its budget
{ const F = rep.fit; ok(F && Number.isFinite(F.a) && Number.isFinite(F.b) && F.b > 0, 'fit: expected = a + b N with b > 0 (' + JSON.stringify(F && {a: F.a, b: F.b, r2: F.r2}) + ')');
  ok(rows.every(r=> r.winRate == null || Math.abs(r.power - ((r.advRate != null && !(r.adv && r.adv.lowSample)) ? (r.winRate + r.advRate) / 2 : r.winRate)) <= 0.051), 'power = mean of basic and advanced');
  ok(rows.every(r=> r.power == null || (r.forBudget == null && /^egg/.test(r.fitNote || '')) || Math.abs(r.forBudget - (r.power - (F.a + F.b * r.N))) <= 0.15), 'forBudget = power - (a + b N)');
  ok(rows.filter(r=> r.fitNote).every(r=> RAW[r.id].hatchInto) && (F.leftOut || []).every(id=> RAW[id].hatchInto), 'only eggs are left out of the fit');
  const pts = rows.filter(r=> r.forBudget != null && !r.lowSample), mean = pts.reduce((s, r)=> s + r.forBudget, 0) / pts.length;
  ok(Math.abs(mean) < 0.5, 'forBudget averages 0 over the fitted cards (' + mean.toFixed(2) + ')');
  ok(F.n === pts.length, 'the fit reads every non-low-sample card'); }

// ---- the build
const asm = read('assemble_arena.py');
ok(/docs\/balance\/bal25\/card-power\.json/.test(asm) && /_cp\["fb"\]/.test(asm), 'assemble_arena.py prefers the v3 report and bakes forBudget');
const html = read('index.html'), m = html.match(/const CARD_POWER = (\{.*?\});\n/);
let CP = null; try{ CP = m && JSON.parse(m[1]); }catch(e){}
ok(CP && CP.v === 3 && CP.games === 400 && CP.date === rep.generated, 'index.html carries the v3 table and its date');
{ const wr = rows.filter(r=> r.winRate != null).map(r=> r.winRate).sort((a, b)=> a - b), L = wr.length, med = L % 2 ? wr[(L - 1) / 2] : (wr[L / 2 - 1] + wr[L / 2]) / 2;
  ok(CP && Math.abs(CP.median - med) < 1e-9 && rows.every(r=> r.winRate == null || Math.abs(CP.wr[r.id] - Math.round((r.winRate - med + 50) * 10) / 10) < 0.051), 'wr centred on the median card');
  ok(CP && rows.every(r=> r.forBudget == null || CP.fb[r.id] === r.forBudget) && rows.every(r=> r.advRate == null || CP.adv[r.id] === r.advRate), 'fb and adv as in the report'); }

// ---- package bookkeeping
ok(/^## 2026-11-07[^\n]*BAL25/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/bal25-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package BAL25 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');
{ const D = JSON.parse(read('docs/decisions.json')), mine = D.items.filter(x=> /^BAL25-/.test(x.id || ''));
  ok(mine.every(x=> (x.body + ' ' + (x.options || []).join(' ')).split(/\s+/).length < 100), 'BAL25 decisions under 100 words'); }

console.log(`bal25: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
