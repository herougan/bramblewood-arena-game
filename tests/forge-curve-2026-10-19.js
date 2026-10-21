#!/usr/bin/env node
// 2026-10-19 (package BF; owner 09:52: "L should scale. So this is my new formula. (Base-1 + L) * (1+L/20)" and "Forge curve out - Use our
// N formula below, and change majors to 4, 7, 10, minor to 2. Then divvy out strength updates at all levels. If there is no space for
// minor, then all are minor OR potentially still 0, then majors expect SOME improvement."). Checks:
//   1. the formula: bramblewood-budget.js's N(L) = (Base - 1 + L)(1 + L/20), its numbers = canonical/skill-costs.json's, the tools'
//      (tools/skill_costs.js) and the Test Lab (arena_app.js sbBudgetAt) give the same N;
//   2. the curve, for every live card with stats: no level loses a stat (monotonic); the majors 4, 7 and 10 always add something;
//      the stats at every level stay inside the budget rules at N(L) (a card inside at its start level stays inside; one over keeps
//      its room from shrinking); a 0-Attack wall only grows Health; the game's statsAtLevel is this curve;
//   3. FORGE_MEAN_GAIN (the enemy's level for a gain) is the cards' mean; the Forge shows the curve (TX keys, the 12 packs);
//   4. a few spot cards, printed.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(table);
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, src = B.src;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const near = (a, b, e)=> Math.abs(a - b) <= (e || 1e-6);

// ---- 1. the formula
// 2026-10-19 (package BF2): budget v5, N(L) = (Base + L/5)(1 + L/30), Level 0 Base - 1 (owner 13:52, L/3; L/5 after the 13:54 check)
// 2026-10-19 (BF5, owner 21:36: "HALF everything" / "Straight up, the total N value"): the whole N × scale 0.5
// 2026-10-21 (BF6, owner 15:09: the coefficients halved instead, Rarity kept, L/15, Level 0 Base − 1, no scale on the whole N)
ok(near(BB.nAt(15, 5), (15 + 5 / 15) * (1 + 5 / 30), 0.006) && near(BB.nAt(15, 1), (15 + 1 / 15) * (31 / 30), 0.006) && near(BB.nAt(15, 0), 14) && BB.DEFAULTS.levelLinDiv === 15 && BB.DEFAULTS.levelDiv === 30 && BB.DEFAULTS.scale === 1 && BB.DEFAULTS.base === 10 && BB.DEFAULTS.perWait === 3 && BB.DEFAULTS.perRarity === 1,
  '1. N(L) = (Base + L/15)(1 + L/30) (BF6, owner 15:09), Level 0 Base - 1: Base 15 -> 14 at Lv 0, 15.57 at Lv 1, 17.89 at Lv 5');
ok(near(BB.nAt(14, 1, {levelLinDiv: 3, scale: 1}), 14.81) && near(BB.nAt(14, 10, {levelLinDiv: 3, scale: 1}), 23.11) && near(BB.nAt(14, 1, {levelLinDiv: 3, scale: 0.5}), 7.41), '1. the owner\'s example with L/3: Base 14 gives 14.8 at Lv 1 and 23.1 at Lv 10');
ok(Object.keys(BB.DEFAULTS).every(k=> table.budget[k] === BB.DEFAULTS[k]), '1. the helper\'s numbers (levelLinDiv, levelDiv, zeroPenalty too) are canonical/skill-costs.json\'s budget');
{ const live = cards.filter(SC.measured); let same = 0; const diff = [];
  live.forEach(c=>{ const L = SC.levelOf(c), want = Math.round(BB.nAt(BB.baseOf(Object.assign({}, c, {obtainMap: T.obtainMapOf(c)})), L) * T.budgetMult(c) * 100) / 100 /* + Base's map term (BF2, 15:25); BF5 10-21: x the card's N multiplier */; if(near(T.budgetN(c), want, 1e-9) && near(T.budget(c).N, want, 1e-9)) same++; else diff.push(c.id); });
  ok(!diff.length, `1. tools/skill_costs.js gives v5's N (with the map term) for every measured card (${same}): ${diff.slice(0, 5).join(', ')}`);
  ok(/return Math\.round\(BramblewoodBudget\.nAt\(BramblewoodBudget\.baseOf\(Object\.assign\(\{\}, d, \{obtainMap: om\}\), c\), L, c\) \* BramblewoodBudget\.nMultOf\(/.test(src) /* BF5 10-21: x the card's N multiplier */ && /levelLinDiv:15, levelDiv:30, zeroPenalty:1/.test(src) /* BF6 */, '1. the Test Lab (sbBudgetAt) and the card editor call the same helper');
  ok(/bramblewood-budget\.js/.test(fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8')) && /bramblewood-budget\.js/.test(fs.readFileSync(path.join(ROOT, 'tools', 'hub', 'build_hub.py'), 'utf8')), '1. the page and the hub inline bramblewood-budget.js');
  // (BF5) the v3 comparison is v5 before the halving: scale 1
  const v3 = live.map(c=> T.budgetV3N(c, 1) - BB.nAt(T.budgetBase(c), 1, Object.assign({}, table.budget, {scale: 1}))); ok(v3.every(d=> d <= 1.3 + 1e-9), `1. at Level 1, v5 (L/10, before the BF5 halving) is never more than 1.3 under v3 (largest drop ${Math.max(...v3).toFixed(2)})`); }

// 2026-10-19 (BF2, owner 15:25): Base's map term: + perMap (0.2) x the map where the card becomes obtainable
{ const spot = k=>{ const m = new RegExp(`\\{key:'${k}',[^\\n]*?mapNumber:(\\d+)`).exec(src); return m ? +m[1] : null; }, O = G.OBTAIN_MAP_OF;
  ok(BB.DEFAULTS.perMap === 0.2 && near(BB.baseOf({rarity: 'common', obtainMap: 12}) - BB.baseOf({rarity: 'common'}), 2.4), '1. Base + 0.2 x Map (a Map 12 card: +2.4)');
  ok(O.pack === spot('shop') && O.mystery === spot('wanderer') && O.raid === spot('raid') && O.nest === spot('nest') && O.smith === spot('forge'), `1. the obtain maps follow FEATURE_SPOTS (packs ${O.pack}, the Mystery Booster ${O.mystery}, raids ${O.raid}, the Nest ${O.nest}, the Forge ${O.smith})`);
  const om = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'card-obtain-maps.json'), 'utf8')).maps, stale = cards.filter(c=> (om[c.id] || 0) !== G.cardObtainMap(c)).map(c=> c.id);
  ok(!stale.length, '1. canonical/card-obtain-maps.json is current (node tools/forge_curve_2026_10_19.js maps): ' + stale.slice(0, 5).join(', '));
  ok(G.cardObtainMap(cards.find(c=> c.id === 'creeper') || {}) === 0, '1. an Easter egg counts as Map 0'); }

// ---- 2. the curve
const QUEUE = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'post-balance-queue.json'), 'utf8')).cards.map(c=> c.id));
const withStats = cards.filter(c=> SC.measured(c) && !c.pool && (c.attack != null || c.health != null));
let mono = [], majors = [], budget = [], walls = [], game = [], checked = 0;
for(const c of withStats){
  const from = G.cardBaseLevel(c), top = G.cardMaxLevel(c) === 10 ? 11 : G.cardMaxLevel(c), cv = BB.forgeCurve(Object.assign({}, c, {obtainMap: G.cardObtainMap(c)}), from, top), b0 = T.budget(c, {level: from}); checked++;
  // (BF5 10-21) each level's N is the curve's own (cv.rows[L].N: x the card's N multiplier)
  // (BF5 10-21, merge of BX) an Archer never swings: its Attack is not part of its strength (tools/skill_costs.js budget)
  const atk = L=> (c.effects && c.effects.archer && !(Number(c.effects.archer) < 0)) ? 0 : (cv.rows[L].attack || 0);
  const room1 = L=> cv.rows[L].N - (2 * atk(L) + (cv.rows[L].health || 0) + b0.S) * cv.m, room2 = L=> Math.pow(cv.rows[L].N / 3, 2) - (atk(L) * (cv.rows[L].health || 0) + b0.S) * cv.m;
  for(let L = from + 1; L <= top; L++){ const r = cv.rows[L], p = cv.rows[L - 1];
    if((r.attack || 0) < (p.attack || 0) || (r.health || 0) < (p.health || 0)) mono.push(`${c.id} Lv ${L}`);
    if([4, 7, 10].includes(L) && !(r.points > 0)) majors.push(`${c.id} Lv ${L}`);
    // (BF5) with N halved, a major's forced point ("the majors always add something") can run one point past N on the smallest cards
    const forced = cv.m * Math.max(1, [4, 7, 10, 11].filter(k=> k > from && k <= L && cv.rows[k].points === 1).length); // a point each major / limit forced so far
    const nForced = [4, 7, 10, 11].filter(k=> k > from && k <= L && cv.rows[k].points === 1).length; // (BF5 10-21) a forced point's overrun stays until the bank catches up
    const inside = b0.ok ? room1(L) >= -cv.m * nForced - 0.05 && room2(L) >= (nForced ? -cv.m * Math.max(r.attack || 0, r.health || 0) * nForced : 0) - 0.05 /* inclusive (16:22); BF5: or the forced point's A·H */ : room1(L) >= room1(from) - forced - 1e-9 /* BF2: a major's forced point can run one point ahead of a small bank */ && room2(L) >= Math.min(room2(from), room2(L - 1)) - 1e-9;
    if(!inside) budget.push(`${c.id} Lv ${L} (2A+H+S ${(2 * r.attack + r.health + b0.S).toFixed(1)} / N ${r.N})`);
    if(!c.levelStats){ const st = G.statsAtLevel(c, L); if(st.attack !== r.attack || st.health !== r.health) game.push(`${c.id} Lv ${L}`); } }
  if(c.attack === 0 && Object.values(cv.rows).some(r=> r.attack !== 0)) walls.push(c.id);
}
ok(checked > 600, `2. ${checked} live cards with stats checked`);
ok(!mono.length, '2. monotonic: no level loses Attack or Health: ' + mono.slice(0, 6).join('; '));
ok(!majors.length, '2. the majors (Lv 4, 7, 10) always add something: ' + majors.slice(0, 6).join('; '));
ok(!budget.length, '2. every level stays inside the budget at N(L) (a card over at its start keeps its room): ' + budget.slice(0, 6).join('; '));
ok(!walls.length, '2. a 0-Attack wall only grows Health: ' + walls.slice(0, 6).join(', '));
ok(!game.length, '2. the game\'s statsAtLevel is the curve (cards with no levelStats): ' + game.slice(0, 6).join('; '));
{ const minorGives = withStats.filter(c=> G.cardBaseLevel(c) <= 1).map(c=> BB.forgeCurve(c, G.cardBaseLevel(c), 11)), mean = L=> minorGives.reduce((t, cv)=> t + cv.rows[L].points, 0) / minorGives.length;
  ok(mean(4) > mean(2) && mean(7) > mean(2) && mean(10) > mean(2) && mean(2) >= mean(3) && mean(2) >= mean(5), `2. the majors take the big chunks, the minor a smaller one (mean points: Lv 2 ${mean(2).toFixed(2)}, 3 ${mean(3).toFixed(2)}, 4 ${mean(4).toFixed(2)}, 7 ${mean(7).toFixed(2)}, 10 ${mean(10).toFixed(2)})`); }
{ const s1 = withStats.find(c=> c.id === 'otter-centurion'), cv = BB.forgeCurve(s1, 1, 11), w = r=> 2 * r.attack + r.health;
  ok(w(cv.rows[10]) - w(cv.rows[1]) <= BB.nAt(cv.base, 10) - BB.nAt(cv.base, 1) + 1e-9, '2. the gain over Lv 1 is at most the budget gain N(10) - N(1)'); }
ok(/const LEVEL_STEPS = \{1:null, 2:'minor', 3:null, 4:'major', 5:null, 6:null, 7:'major', 8:null, 9:null, 10:'major', 11:'major'\}/.test(src), '2. LEVEL_STEPS labels 2 minor, 4 / 7 / 10 major (the card editor\'s badges)');

// ---- 3. the enemy's gain table, the Forge preview
{ const acc = {}; withStats.filter(c=> c.attack != null && c.health != null).forEach(d=>{ const w0 = 2 * (d.attack || 0) + (d.health || 0); if(w0 <= 0) return;
    const from = SC.levelOf(d), cv = BB.forgeCurve(Object.assign({}, d, {obtainMap: T.obtainMapOf(d)}), from, d.id === 'hero' ? 100 : (d.isCastle || (d.archetypes || []).includes('Castle')) ? 20 : 11);
    for(let L = 1; L <= 11; L++){ const r = cv.rows[Math.max(L, from)]; (acc[L] = acc[L] || []).push((2 * r.attack + r.health) / w0 - 1); } });
  const off = G.FORGE_MEAN_GAIN.filter(([g, L])=> L >= 2 && Math.abs(g - acc[L].reduce((a, b)=> a + b, 0) / acc[L].length) > 0.03).map(([g, L])=> `Lv ${L} ${g}`);
  ok(!off.length, '3. FORGE_MEAN_GAIN is the live cards\' mean gain (within 0.03; node tools/forge_curve_2026_10_19.js gain): ' + off.join(', '));
  ok(near(G.levelForGain(G.gainOfLevel(4)), 4, 1e-6) && near(G.levelForGain(G.FORGE_MEAN_GAIN[1][0]), 2, 1e-6), '3. levelForGain is the inverse of the mean gain'); }
{ const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'), keys = ['ui.forge-curve-title', 'ui.forge-curve-help', 'ui.forge-curve-major', 'ui.forge-curve-minor', 'ui.forge-curve-none', 'ui.forge-curve-aria'];
  ok(keys.every(k=> texts.includes(`"${k}":`) && src.includes(`TX('${k}'`)), '3. the Forge\'s level strip (forgeCurveStripHTML) uses its TX keys');
  ok(/\$\{forgeCurveStripHTML\(id, L\)\}/.test(src), '3. the anvil shows the level strip');
  const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
  ok(packs.every(p=> p['What each level gives'] && p['big step'] && p['Stat gains from level {from} to level {to}']), '3. the strip\'s words are in all 12 packs'); }

// ---- 4. spot cards
for(const id of ['burrow-rabbit', 'otter-centurion', 'quillguard', 'bramblewood-lynx', 'honey-bee']){
  const c = cards.find(x=> x.id === id); if(!c) continue; const from = G.cardBaseLevel(c), cv = BB.forgeCurve(c, from, 11);
  console.log(`  ${c.name} (${c.rarity}, W${c.wait || 0} L${c.cost || 0}, Base ${cv.base}${cv.m !== 1 ? ', x' + cv.m : ''}): ` + Object.entries(cv.rows).map(([L, r])=> `${L}:${r.attack}/${r.health}`).join(' '));
}
console.log(fail ? `forge-curve-2026-10-19: ${fail} of ${n} checks failed` : `forge-curve-2026-10-19: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
