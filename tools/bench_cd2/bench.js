#!/usr/bin/env node
// BENCH-CD2 (2026-11-28, docs/design/carddesign2-2026-11-28.md, decisions CARDDESIGN2-1..3): what the eleven proposed card redesigns would do to
// each card's power rating and to the Maps 0-20 road. No card data or game code changes: the redesigns (REDESIGN below, the doc's table in the
// engine's own skill forms) are applied only inside this process (and the children it starts), as tools/bench_cpu2/bench.js patches the engine.
// Quillguard's L5 💀 Rend form (rendAround) is in; it needs CARDDESIGN2-2 (SKILLS3-3 holds 💀 forms off Maps 0-20).
//   node tools/bench_cd2/bench.js verify [games]        the new skills fire: events per card, baseline vs redesign (level skills merged in)
//   node tools/bench_cd2/bench.js power --variant=base|cd2 [games]   tools/card_balance.js --v3 --only=<the 11> (400 games, its seeds), run with
//        this file preloaded (-r): cd2 swaps canonical/cards.json's 11 rows as it is read; outputs go to docs/balance/bench-cd2/power-<variant>/
//   node tools/bench_cd2/bench.js power-report          before -> after per card; expected = the full report's fit (docs/balance/bal25/card-power.json)
//   node tools/bench_cd2/bench.js road run <games> [shard nshards] --tag=<t> [--g0=0] [--seed=9100] [--maxmap=20] [--pick=<tags> --sig=2]
//        the road fights whose enemy or reference deck holds one of the 11; each game twice on one seed (playReferenceGame, seed0 + 37g):
//        baseline ctx, then the redesigned ctx. One JSON line per fight to docs/balance/bench-cd2/<t>.jsonl (resumable)
//   node tools/bench_cd2/bench.js road report --tags=a,b [--first]   as bench_cpu2's report; writes docs/balance/bench-cd2/<first tag>-summary.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const CARDS = path.join(ROOT, 'canonical', 'cards.json');
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bench-cd2');

// The doc's table, row by row (# = the doc's row). Each returns the card's new fields; effects / levelSkills replace the old ones whole.
const REDESIGN = {
  'elder-willow': d=> ({effects: {forestry: 1, triggers: [{on: 'onReady', do: 'grantShield', allies: 3}]}}), // #1 + On Ready: 3 Shield to every ally
  'shellwright-apprentice': d=> ({effects: {triggers: [{on: 'onSpawn', do: 'grant', who: 'ally', sub: 'adjacent', skill: 'armor', armor: 2}]}}), // #2 On Play: Grant Armor 2 beside
  'chipmunk-hoarder': d=> ({effects: {triggers: [{on: 'onDeath', do: 'gain', resource: 'lumber', amount: 2}, {on: 'onDeath', do: 'drawCard', count: 1}]}}), // #3 💀 2 Lumber, draw 1
  'yeti': d=> ({health: 28, effects: {daunt: 1, triggers: [{on: 'onReady', do: 'addWait', amount: 1, who: 'enemy', sub: 'all'}]}}), // #4 Wild Yak 5/28, Daunt 1 + On Ready +1 Wait all foes
  'wound-reaver': d=> ({effects: {poison: 2}, levelSkills: {6: {poisonous: 2}}}), // #5 Gila Monster: Poison 2; L6 💀 Poisonous 2 (ENG33)
  // #6 Bleed 1 + Momentum 1 from Level 1, Momentum 2 at L7 (a level-skill key below the base level would strip it: effectsAtLevel, so L1 holds it)
  'ice-crevasse-wolf': d=> ({effects: {bleed: 1, momentum: 1}, levelSkills: {1: {momentum: 1}, 7: {momentum: 2}}}),
  'cunning-vixen': d=> ({effects: {stealth: true, triggers: [{on: 'onAttack', do: 'gain', amount: 1, resource: 'lumber'}]}, levelSkills: null}), // #7 + On Attack: 1 Lumber; L5 Evasive goes
  'alpine-marmot': d=> ({effects: {guardian: true, triggers: [{on: 'onEnemyReady', do: 'shield', amount: 3, who: 'ally', sub: 'subjectFacing'}]}}), // #8 the ally facing a readying foe: 3 Shield
  'caldera-snow-leopard': d=> ({effects: {ambush: 3}}), // #9 Pounce 3 -> Ambush 3
  'pinecone-sapper': d=> ({health: 14, effects: {sturdy: true, dynamite: 2, dynamiteDmg: 4}}), // #10 0/14, Sturdy + Dynamite 2/4
  'quillguard': d=> ({levelSkills: {5: {rendAround: 1}}}), // #11 Thorns 2; L5 💀 Rend 1 around (was L5 Bulldoze). NEEDS CARDDESIGN2-2
};
const IDS = Object.keys(REDESIGN);
// CD2b (2026-11-28): the refinement rounds. Each set replaces some rows of REDESIGN (the rest stay as the doc's); [description, fields].
// Pick one with CD2_SET=<set> (preload) or --set=<set> (road); `power --variant=<set>` measures only the set's cards.
// Stats are kept (Yak 5/28 and Sapper 0/14 as the doc); only skill numbers, the level a skill comes, or which built skill change.
const WILLOW = n=> ({effects: {forestry: 1, triggers: [{on: 'onReady', do: 'grantShield', allies: n}]}});
const MARMOT = n=> ({effects: {guardian: true, triggers: [{on: 'onEnemyReady', do: 'shield', amount: n, who: 'ally', sub: 'subjectFacing'}]}});
const HOARD = (l, d)=> ({effects: {triggers: [{on: 'onDeath', do: 'gain', resource: 'lumber', amount: l}, {on: 'onDeath', do: 'drawCard', count: d}]}});
const YAK = (dn, w)=> ({health: 28, effects: {daunt: dn, triggers: [{on: 'onReady', do: 'addWait', amount: w, who: 'enemy', sub: 'all'}]}});
const VIX = (extra, l)=> ({effects: Object.assign({stealth: true, triggers: [{on: 'onAttack', do: 'gain', amount: l || 1, resource: 'lumber'}].concat(extra.draw ? [{on: 'onAttack', do: 'drawCard', count: extra.draw}] : [])}, extra.evasive ? {evasive: true} : {}), levelSkills: null});
const SHELL = n=> ({effects: n ? {triggers: [{on: 'onSpawn', do: 'grant', who: 'ally', sub: 'adjacent', skill: 'armor', armor: n}]} : {}});
const REFINE = {
  r1a: {'elder-willow': ['On Ready: 6 Shield to every ally', WILLOW(6)], 'shellwright-apprentice': ['On Play: Grant Armor 1 beside', SHELL(1)],
    'wound-reaver': ['Poison 1; L6 💀 Poisonous 2', {effects: {poison: 1}, levelSkills: {6: {poisonous: 2}}}], 'alpine-marmot': ['Guardian + facing ally 2 Shield', MARMOT(2)],
    'caldera-snow-leopard': ['Ambush 2', {effects: {ambush: 2}}], 'quillguard': ['Thorns 1; L5 💀 Rend 1 around', {effects: {thorns: 1}, levelSkills: {5: {rendAround: 1}}}],
    'chipmunk-hoarder': ['💀 2 Lumber, draw 2', HOARD(2, 2)], 'yeti': ['Daunt 1 + On Ready +2 Wait all foes', YAK(1, 2)], 'cunning-vixen': ['Stealth + On Attack 2 Lumber', VIX({}, 2)]},
  r1b: {'elder-willow': ['Forestry 2 + On Ready 6 Shield every ally', {effects: {forestry: 2, triggers: [{on: 'onReady', do: 'grantShield', allies: 6}]}}], 'shellwright-apprentice': ['no skill (floor)', SHELL(0)],
    'wound-reaver': ['no skill at L1 (floor); L6 💀 Poisonous 2', {effects: {}, levelSkills: {6: {poisonous: 2}}}], 'alpine-marmot': ['Guardian + facing ally 1 Shield', MARMOT(1)],
    'caldera-snow-leopard': ['Ambush 1', {effects: {ambush: 1}}], 'quillguard': ['no skill at L1 (floor); L5 💀 Rend 1 around', {effects: {}, levelSkills: {5: {rendAround: 1}}}],
    'chipmunk-hoarder': ['💀 4 Lumber, draw 2', HOARD(4, 2)], 'yeti': ['Daunt 2 + On Ready +1 Wait all foes', YAK(2, 1)], 'cunning-vixen': ['Stealth + Evasive + On Attack 1 Lumber', VIX({evasive: true})]},
  r1c: {'elder-willow': ['On Ready: 10 Shield to every ally', WILLOW(10)], 'alpine-marmot': ['Guardian only (floor)', {effects: {guardian: true}}], 'caldera-snow-leopard': ['no skill (floor)', {effects: {}}],
    'chipmunk-hoarder': ['💀 2 Lumber, draw 3', HOARD(2, 3)], 'yeti': ['Daunt 2 + On Ready +2 Wait all foes', YAK(2, 2)], 'cunning-vixen': ['Stealth + On Attack 1 Lumber, draw 1', VIX({draw: 1})]},
  // round 2. card_balance reads `effects` as the Level 1 card (the engine applies no levelSkills); the road builds levels through effectsAtLevel
  r2a: {'alpine-marmot': ['facing ally 1 Shield at L1; Guardian at L3', {effects: {triggers: MARMOT(1).effects.triggers}, levelSkills: {3: {guardian: true}}}],
    'quillguard': ['💀 Rend 1 around at L1; Thorns 1 at L3, 2 at L5', {effects: {rendAround: 1}, levelSkills: {3: {thorns: 1}, 5: {thorns: 2}}}],
    'elder-willow': ['On Play 3 Shield + On Ready 6 Shield, every ally', {effects: {forestry: 1, triggers: [{on: 'onSpawn', do: 'grantShield', allies: 3}, {on: 'onReady', do: 'grantShield', allies: 6}]}}],
    'yeti': ['Daunt 2 + On Ready +3 Wait all foes', YAK(2, 3)],
    'chipmunk-hoarder': ['💀 2 Lumber, draw 1, 2 Shield every ally', {effects: {triggers: HOARD(2, 1).effects.triggers.concat([{on: 'onDeath', do: 'grantShield', allies: 2}])}}],
    'cunning-vixen': ['Stealth + Evasive + On Attack 1 Lumber, +1 Wait on a foe', {effects: {stealth: true, evasive: true, triggers: [{on: 'onAttack', do: 'gain', amount: 1, resource: 'lumber'}, {on: 'onAttack', do: 'addWait', amount: 1, who: 'enemy'}]}, levelSkills: null}]},
  r2b: {'alpine-marmot': ['Guardian at L1; facing ally 1 Shield at L3', {effects: {guardian: true}, levelSkills: {3: {triggers: MARMOT(1).effects.triggers}}}],
    'elder-willow': ['On Ready: 20 Shield to every ally', WILLOW(20)], 'yeti': ['Daunt 1 + On Ready +3 Wait all foes', YAK(1, 3)],
    'chipmunk-hoarder': ['💀 2 Lumber, draw 1, 4 Shield every ally', {effects: {triggers: HOARD(2, 1).effects.triggers.concat([{on: 'onDeath', do: 'grantShield', allies: 4}])}}],
    'cunning-vixen': ['Stealth + Evasive + On Attack 1 Lumber, 1 Shield self', {effects: {stealth: true, evasive: true, triggers: [{on: 'onAttack', do: 'gain', amount: 1, resource: 'lumber'}, {on: 'onAttack', do: 'grantShield', amount: 1}]}, levelSkills: null}]},
  // round 3
  r3a: {'elder-willow': ['On Play 3 Shield + On Ready 10 Shield, every ally', {effects: {forestry: 1, triggers: [{on: 'onSpawn', do: 'grantShield', allies: 3}, {on: 'onReady', do: 'grantShield', allies: 10}]}}],
    'quillguard': ['Thorns 1 + 💀 Rend 1 around at L1; Thorns 2 at L5', {effects: {thorns: 1, rendAround: 1}, levelSkills: {5: {thorns: 2}}}],
    'cunning-vixen': ['Stealth + On Attack 1 Lumber, +1 Wait on a foe', {effects: {stealth: true, triggers: [{on: 'onAttack', do: 'gain', amount: 1, resource: 'lumber'}, {on: 'onAttack', do: 'addWait', amount: 1, who: 'enemy'}]}, levelSkills: null}]},
  r3b: {'elder-willow': ['On Play 5 Shield + On Ready 6 Shield, every ally', {effects: {forestry: 1, triggers: [{on: 'onSpawn', do: 'grantShield', allies: 5}, {on: 'onReady', do: 'grantShield', allies: 6}]}}]},
  // the final set: every row as picked (PICKED 2-4) + Quillguard's r1b Level 1 card with Thorns back at L3 (1) and L7 (2); Wolf and Sapper as the doc
  r4final: {'quillguard': ['no skill at L1; Thorns 1 at L3, 💀 Rend 1 around at L5, Thorns 2 at L7', {effects: {}, levelSkills: {3: {thorns: 1}, 5: {rendAround: 1}, 7: {thorns: 2}}}]},
  // road attribution only: the final set with Quillguard as the doc (Thorns 2; L5 💀 Rend), since its Level 1 cut moves the reference decks
  r4alt: {'quillguard': ['as the doc: Thorns 2; L5 💀 Rend 1 around', {levelSkills: {5: {rendAround: 1}}}]},
};
const SETNAME = process.env.CD2_SET || ((process.argv.find(a=> a.startsWith('--set=')) || '').slice(6)) || 'cd2';
if(SETNAME !== 'cd2' && !REFINE[SETNAME]) throw new Error('bench_cd2: unknown set ' + SETNAME);
// rows settled in an earlier round: later rounds' sets lay them under their own rows (so the advanced pool holds them), but measure only their own
const PICKED = {2: {'shellwright-apprentice': 'r1a', 'wound-reaver': 'r1a'},
  3: {'caldera-snow-leopard': 'r1b', 'alpine-marmot': 'r2b', 'chipmunk-hoarder': 'r2a', 'yeti': 'r2b', 'cunning-vixen': 'r2a'},
  4: {'elder-willow': 'r3b'}};
const roundOf = s=> +((/^r(\d)/.exec(s) || [])[1] || 0);
const picksFor = name=> Object.assign({}, ...Object.keys(PICKED).filter(r=> +r <= roundOf(name)).map(r=> PICKED[r])), picks = picksFor(SETNAME);
const descOf = (s, id)=> (REFINE[s] || {})[id] ? REFINE[s][id][0] : picksFor(s)[id] ? REFINE[picksFor(s)[id]][id][0] : 'CARDDESIGN2 doc';
const rowsOf = s=> Object.fromEntries(Object.entries(REFINE[s] || {}).map(([id, [, ch]])=> [id, ()=> ch]));
const SET = Object.assign({}, REDESIGN, Object.fromEntries(Object.entries(picks).map(([id, s])=> [id, ()=> REFINE[s][id][1]])), rowsOf(SETNAME));
function redesigned(c){ const f = SET[c.id]; if(!f) return c; const ch = f(c), o = Object.assign({}, c, ch); if(ch.levelSkills === null) delete o.levelSkills; return o; }
const patchCards = arr=> arr.map(redesigned);

// ---- preload mode (node -r tools/bench_cd2/bench.js <script>): the card_balance children of `power`
if(require.main !== module){
  if(process.env.CD2_PATCH === '1'){ const orig = fs.readFileSync;
    fs.readFileSync = function(p, o){ if(typeof p === 'string' && path.resolve(p) === CARDS){ const s = JSON.stringify(patchCards(JSON.parse(orig.call(fs, p, 'utf8'))));
      return (o === 'utf8' || (o && o.encoding)) ? s : Buffer.from(s); } return orig.apply(fs, arguments); }; }
  if(process.env.CD2_OUT){ const BAL25 = path.join(ROOT, 'docs', 'balance', 'bal25'), to = process.env.CD2_OUT; fs.mkdirSync(to, {recursive: true});
    const re = p=> (typeof p === 'string' && path.dirname(path.resolve(p)) === BAL25 && path.basename(p).startsWith('card-power-partial')) ? path.join(to, path.basename(p)) : p;
    ['writeFileSync', 'appendFileSync', 'unlinkSync'].forEach(k=>{ const o = fs[k]; fs[k] = function(p, ...a){ return o.call(fs, re(p), ...a); }; }); }
  return;
}

const argv = process.argv.slice(2), CMD = argv[0] || 'help';
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const nums = argv.slice(1).filter(a=> /^\d+$/.test(a)).map(Number);
const readJsonl = f=> fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)) : [];
fs.mkdirSync(OUTDIR, {recursive: true});
const f1 = x=> x == null ? '-' : (Math.round(x * 10) / 10).toFixed(1);

if(CMD === 'power'){
  const variant = opt('variant', 'base'), games = nums[0] || 400, out = path.join(OUTDIR, 'power-' + variant);
  const { spawnSync } = require('child_process');
  const only = opt('cards') ? opt('cards').split(',') : REFINE[variant] ? Object.keys(REFINE[variant]) : IDS; // CD2b: a refine set measures its own cards
  const r = spawnSync('nice', ['-n', '19', process.execPath, '-r', __filename, path.join(ROOT, 'tools', 'card_balance.js'), '--v3', String(games), '--only=' + only.join(','), '--workers=2'],
    {cwd: ROOT, stdio: 'inherit', env: Object.assign({}, process.env, {CD2_PATCH: variant === 'base' ? '0' : '1', CD2_SET: variant === 'base' ? 'cd2' : variant, CD2_OUT: out})});
  process.exit(r.status || 0);
} else if(CMD === 'refine-report'){
  // CD2b: power vs expected per card for each set (--sets=r1a,r1b,...); the cd2 row is BENCH-CD2's. Writes docs/balance/bench-cd2/refine-summary.json
  const fit = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal25', 'card-power.json'), 'utf8')).fit;
  const sets = ['cd2'].concat(opt('sets', '').split(',').filter(Boolean)), out = {};
  for(const s of sets){ const f = path.join(OUTDIR, 'power-' + s, 'card-power-partial.json'); if(!fs.existsSync(f)) continue;
    for(const r of JSON.parse(fs.readFileSync(f, 'utf8')).rows){ if(s !== 'cd2' && s !== 'r4final' && !(REFINE[s] || {})[r.id]) continue; // the final set: every card
      const hasA = r.advRate != null && !(r.adv && r.adv.lowSample), pw = r.winRate == null ? null : hasA ? (r.winRate + r.advRate) / 2 : r.winRate, ex = fit.a + fit.b * r.N;
      (out[r.id] = out[r.id] || []).push({set: s, desc: s === 'cd2' ? 'CARDDESIGN2 doc' : descOf(s, r.id), basic: r.winRate, adv: r.advRate, played: r.played, N: r.N,
        power: Math.round(pw * 10) / 10, expected: Math.round(ex * 10) / 10, gap: Math.round((pw - ex) * 10) / 10}); } }
  fs.writeFileSync(path.join(OUTDIR, 'refine-summary.json'), JSON.stringify({generated: '2026-11-28', games: 400, fit: {a: fit.a, b: fit.b}, sets, cards: out}, null, 1) + '\n');
  for(const [id, rows] of Object.entries(out)){ console.log(id); rows.forEach(r=> console.log(`  ${r.set.padEnd(5)} ${f1(r.power)} vs ${f1(r.expected)} gap ${r.gap >= 0 ? '+' : ''}${f1(r.gap)}  (${f1(r.basic)}/${f1(r.adv)}, played ${r.played})  ${r.desc}`)); }
} else if(CMD === 'power-report'){
  const full = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal25', 'card-power.json'), 'utf8')), fit = full.fit;
  const load = v=> JSON.parse(fs.readFileSync(path.join(OUTDIR, 'power-' + v, 'card-power-partial.json'), 'utf8')).rows;
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const raw = JSON.parse(fs.readFileSync(CARDS, 'utf8')), byId = Object.fromEntries(raw.map(c=> [c.id, c]));
  const A = load('base'), Bv = load('cd2'), rows = [];
  for(const id of IDS){ const a = A.find(r=> r.id === id), b = Bv.find(r=> r.id === id); if(!a || !b) continue;
    const pw = r=> r.winRate == null ? null : (r.advRate != null && !(r.adv && r.adv.lowSample) ? (r.winRate + r.advRate) / 2 : r.winRate);
    // use = cap-1 score / N at Level 1 (tools/skill_costs.js budget(), the doc's Budget L1 column); unpriced = skills budget() could not price
    const ex = N=> fit.a + fit.b * N, use = d=>{ const u = SC.budget(d); return Math.round(u.x1 / u.N * 1000) / 10; }, unpriced = d=> SC.budget(d).missing || [];
    const pa = pw(a), pb = pw(b);
    rows.push({id, name: a.name, N: [a.N, b.N], basic: [a.winRate, b.winRate], adv: [a.advRate, b.advRate], played: [a.played, b.played], advPlayed: [a.adv && a.adv.played, b.adv && b.adv.played],
      power: [pa, pb], expected: [ex(a.N), ex(b.N)].map(x=> Math.round(x * 10) / 10), forBudget: [pa - ex(a.N), pb - ex(b.N)].map(x=> Math.round(x * 10) / 10),
      budgetUseL1: [use(byId[id]), use(redesigned(byId[id]))], unpricedAfter: unpriced(redesigned(byId[id])), change: Math.round((pb - pa) * 10) / 10}); }
  fs.writeFileSync(path.join(OUTDIR, 'power-summary.json'), JSON.stringify({generated: '2026-11-28', games: A[0] && A[0].games, fit: {a: fit.a, b: fit.b, from: 'docs/balance/bal25/card-power.json ' + full.generated}, rows}, null, 1) + '\n');
  console.log('card                      power before -> after (expected; for budget before -> after)  basic / adv  budget use L1');
  rows.forEach(r=> console.log(`${r.id.padEnd(24)} ${f1(r.power[0])} -> ${f1(r.power[1])} (${r.change >= 0 ? '+' : ''}${f1(r.change)}; exp ${f1(r.expected[1])}; ${f1(r.forBudget[0])} -> ${f1(r.forBudget[1])})  ${f1(r.basic[0])}/${f1(r.adv[0])} -> ${f1(r.basic[1])}/${f1(r.adv[1])}  ${r.budgetUseL1[0]} -> ${r.budgetUseL1[1]}%${r.unpricedAfter.length ? ' unpriced ' + JSON.stringify(r.unpricedAfter) : ''}`));
} else if(CMD === 'verify'){
  // each card: 6 copies + the card_balance filler vs the filler, events whose source is the card, counted by type (and kind); level skills merged in
  const E = require(path.join(ROOT, 'bramblewood-engine.js')), raw = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
  const mk = arr=>{ const D = {}; arr.forEach(c=>{ const d = Object.assign({effects: {}}, c); delete d.art;
    if(IDS.includes(c.id) && d.levelSkills) d.effects = Object.assign({}, d.effects, ...Object.keys(d.levelSkills).sort((x, y)=> x - y).map(k=> d.levelSkills[k])); D[c.id] = d; }); return D; };
  const DA = mk(raw), DB = mk(patchCards(raw)), FILL = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker', 'termite-forager', 'land-tiller'];
  const deckOf = (id, k)=>{ const d = {}; for(let i = 0; i < 20 - k; i++){ const f = FILL[i % FILL.length]; d[f] = (d[f] || 0) + 1; } if(id) d[id] = k; return d; };
  const N = nums[0] || 30;
  const tally = (D, id)=>{ const t = {}; for(let g = 0; g < N; g++){ const ev = [], eng = E.makeSimEngine(D, E.mulberry32(5100 + g * 131), {battleMode: 'open', rules: {}, recordEvents: true}), sideOf = p=> p === 1 ? 'A' : 'B', st = {};
      const P = {1: eng.newPlayer(1, deckOf(id, 6)), 2: eng.newPlayer(2, deckOf(null, 0))}; eng.draw(P[1], 3, 'A', st, ev); eng.draw(P[2], 3, 'B', st, ev);
      for(let r = 1; r <= 30; r++){ if(r > 1) eng.roundStart(P, r, sideOf, st, ev); eng.aiTakeTurn(P, sideOf, 1, st, ev); eng.aiTakeTurn(P, sideOf, 2, st, ev); if(eng.resolveCombat(P, sideOf, st, ev, r % 2 ? 2 : 1)) break; eng.draw(P[1], 1, 'A', st, ev); eng.draw(P[2], 1, 'B', st, ev); }
      const own = x=> typeof x === 'string' && x.split('~')[0] === id; // a spent or granted unit runs on a derived def (id~dvN)
      ev.forEach(e=>{ if(!own(e.defId) && !own(e.attDefId)) return; if(e.type === 'attack' || e.type === 'damage' || e.type === 'hit') return; const k = e.type + (e.kind ? ':' + e.kind : ''); t[k] = (t[k] || 0) + 1; }); }
    return t; };
  for(const id of IDS){ const a = tally(DA, id), b = tally(DB, id), keys = [...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k=> (a[k] || 0) !== (b[k] || 0)).sort();
    console.log(id.padEnd(24), keys.map(k=> `${k} ${a[k] || 0}->${b[k] || 0}`).join(', ') || '(no event change)'); }
} else if(CMD === 'road'){
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, BASE = B.CARD_DEFS_BASELINE;
  const NEW = {}; IDS.forEach(id=>{ if(BASE[id]) NEW[id] = redesigned(BASE[id]); });
  const OLD = Object.fromEntries(IDS.map(id=> [id, BASE[id]]));
  const swap = to=> IDS.forEach(id=>{ if(to[id]) BASE[id] = to[id]; });
  // the fights, as tools/skirmish_pass.js lists them (bench_cpu2's copy of fights() and fightBand)
  const DUNGEON_FLOORS = [1, 10, 25, 50];
  function fights(){ const out = [], MAPS = G.CONQUEST_MAPS;
    for(const m of MAPS){ if(m.reserved || m.tower) continue; const no = G.mapNumberOf(m.id); if(no == null) continue;
      const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
      m.nodes.forEach((n, i)=>{ if(!n.deck || !Object.keys(n.deck).length) return; const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
        if(m.endless && !DUNGEON_FLOORS.includes(n.floor)) return;
        const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
        out.push({map: m.id, mapNo: no, side: !!m.sub, endless: !!m.endless, key: n.key, code, kind: k, n}); }); }
    return out; }
  const fightBand = f=>{ const b = G.skirmishTargetBand(f.map, f.n); if(!f.n.challenge || !b.curve) return b; const t = b.t - 0.10;
    return Object.assign({}, b, {t, lo: t - 0.08, hi: t + 0.08, role: 'challenge'}); };
  const MAXMAP = +opt('maxmap', 20);
  const ALL = fights().filter(f=> Math.max(f.mapNo, G.mapUnlockNumberOf ? (G.mapUnlockNumberOf(f.map) || 0) : 0) <= MAXMAP);
  const baseId = k=> k.split('@')[0];
  const holds = deck=> Object.keys(deck || {}).map(baseId).filter(id=> IDS.includes(id));
  function setup(f, seed0){ G.NODE_MAP_HINT.set(f.n, f.map); swap(OLD); const a = G.referenceFightSetup(f.map, f.n, {seed0});
    swap(NEW); let b; try{ b = G.referenceFightSetup(f.map, f.n, {seed0}); } finally { swap(OLD); }
    return {a, b, enemy: [...new Set(holds(a.enemyDeck))], mine: [...new Set(holds(a.mine))]}; }
  const stat = (base, plan)=>{ const n = base.length; if(!n) return null; let sb = 0, sp = 0, sd = 0, sd2 = 0;
    for(let i = 0; i < n; i++){ const a = +base[i], b = +plan[i], d = b - a; sb += a; sp += b; sd += d; sd2 += d * d; }
    const md = sd / n, varD = n > 1 ? (sd2 - n * md * md) / (n - 1) : 0;
    return {n, base: 100 * sb / n, plan: 100 * sp / n, diff: 100 * md, se: 100 * Math.sqrt(Math.max(0, varD) / n)}; };
  const FIRST_WINS = argv.includes('--first');
  function merge(tags){ const by = {};
    for(const t of tags) for(const r of readJsonl(path.join(OUTDIR, t + '.jsonl'))){ const k = r.map + ':' + r.key;
      if(!by[k]) by[k] = Object.assign({}, r, {base: r.base || '', plan: r.plan || '', g0s: [r.g0]});
      else if(!by[k].g0s.includes(r.g0) && !FIRST_WINS){ by[k].base += r.base; by[k].plan += r.plan; by[k].g0s.push(r.g0); } }
    return by; }
  const SUB = argv[1];
  if(SUB === 'run'){
    const N = nums[0] || 100, SHARD = nums[1] || 0, NSH = nums[2] || 1, G0 = +opt('g0', 0), SEED = +opt('seed', 9100), tag = opt('tag', 'run');
    const OUT = path.join(OUTDIR, tag + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
    let todo = ALL;
    if(opt('pick')){ const sig = +opt('sig', 2), rows = merge(opt('pick').split(','));
      todo = todo.filter(f=>{ const r = rows[f.map + ':' + f.key]; if(!r) return false; const s = stat(r.base, r.plan); return s && s.se > 0 && Math.abs(s.diff) > sig * s.se; }); }
    todo = todo.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
    console.log('fights', ALL.length, 'to check', todo.length, 'games', N, 'from g', G0);
    let ran = 0;
    for(const f of todo){ const t = Date.now(); let s0;
      try{ s0 = setup(f, SEED); }catch(e){ console.log(f.code, 'setup failed:', e.message); continue; }
      if(!s0.enemy.length && !s0.mine.length) continue; // neither deck holds one of the 11: difference 0 by construction
      let base = '', plan = '';
      for(let g = G0; g < G0 + N; g++){ base += G.playReferenceGame(s0.a, g).win ? '1' : '0'; plan += G.playReferenceGame(s0.b, g).win ? '1' : '0'; }
      const s = stat(base, plan); ran++;
      fs.appendFileSync(OUT, JSON.stringify({map: f.map, key: f.key, code: f.code, kind: f.kind, mapNo: f.mapNo, side: f.side, endless: f.endless, cpu: s0.a.cpu, enemyHolds: s0.enemy, mineHolds: s0.mine,
        seed0: SEED, g0: G0, games: N, ms: Date.now() - t, base, plan}) + '\n');
      console.log(f.code, `[${s0.enemy.join(' ')}${s0.mine.length ? ' | ref ' + s0.mine.join(' ') : ''}]`, `${s.base.toFixed(0)} -> ${s.plan.toFixed(0)} (${s.diff >= 0 ? '+' : ''}${s.diff.toFixed(1)} +/- ${s.se.toFixed(1)})`, ((Date.now() - t) / 1000).toFixed(0) + 's'); }
    console.log('done', ran);
  } else if(SUB === 'report'){
    const tags = opt('tags', '').split(',').filter(Boolean), rows = merge(tags), out = [];
    for(const f of ALL){ const r = rows[f.map + ':' + f.key]; if(!r) continue; const b = fightBand(f), s = stat(r.base, r.plan);
      const inB = w=> w >= b.lo * 100 - 1e-9 && w <= b.hi * 100 + 1e-9;
      out.push({code: f.code, map: f.map, mapNo: f.mapNo, kind: f.kind, side: f.side, cpu: r.cpu, enemyHolds: r.enemyHolds, mineHolds: r.mineHolds, curve: !!b.curve,
        target: Math.round(b.t * 1000) / 10, lo: Math.round(b.lo * 1000) / 10, hi: Math.round(b.hi * 1000) / 10, n: s.n, base: s.base, plan: s.plan, diff: s.diff, se: s.se,
        gapBase: s.base - b.t * 100, gapPlan: s.plan - b.t * 100, inBase: inB(s.base), inPlan: inB(s.plan)}); }
    const mean = a=> a.length ? a.reduce((x, y)=> x + y, 0) / a.length : 0, curve = out.filter(r=> r.curve);
    const leave = curve.filter(r=> r.inBase && !r.inPlan), enter = curve.filter(r=> !r.inBase && r.inPlan);
    const sum = {tags, fights: out.length, games: out.reduce((t, r)=> t + r.n, 0), meanDiff: mean(out.map(r=> r.diff)), meanSe: Math.sqrt(out.reduce((t, r)=> t + r.se * r.se, 0)) / Math.max(1, out.length),
      medianSe: out.map(r=> r.se).sort((a, b)=> a - b)[Math.floor(out.length / 2)], beyond2se: out.filter(r=> r.se > 0 && Math.abs(r.diff) > 2 * r.se).map(r=> r.code),
      meanAbsGapBase: mean(curve.map(r=> Math.abs(r.gapBase))), meanAbsGapPlan: mean(curve.map(r=> Math.abs(r.gapPlan))),
      curveFights: curve.length, bandBase: curve.filter(r=> r.inBase).length, bandPlan: curve.filter(r=> r.inPlan).length, leave: leave.map(r=> r.code), enter: enter.map(r=> r.code),
      top10: out.slice().sort((a, b)=> Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 10).map(r=> ({code: r.code, kind: r.kind, holds: r.enemyHolds.concat(r.mineHolds.map(x=> 'ref:' + x)), n: r.n, base: r.base, plan: r.plan, diff: r.diff, se: r.se, target: r.target}))};
    fs.writeFileSync(path.join(OUTDIR, tags[0] + '-summary.json'), JSON.stringify({summary: sum, rows: out}, null, 1) + '\n');
    console.log(`fights ${sum.fights}, paired games ${sum.games}; mean player win change ${f1(sum.meanDiff)} +/- ${f1(sum.meanSe)} SE; median fight SE ${f1(sum.medianSe)}; beyond 2 SE ${sum.beyond2se.length} [${sum.beyond2se.join(' ')}]`);
    console.log(`curve fights in band (${sum.curveFights}): ${sum.bandBase} -> ${sum.bandPlan}; mean |gap| ${f1(sum.meanAbsGapBase)} -> ${f1(sum.meanAbsGapPlan)}; leave ${leave.length} [${sum.leave.join(' ')}], enter ${enter.length} [${sum.enter.join(' ')}]`);
    sum.top10.forEach(r=> console.log(`  ${r.code} ${r.kind} [${r.holds.join(' ')}] n=${r.n}: ${f1(r.base)} -> ${f1(r.plan)} (${r.diff >= 0 ? '+' : ''}${f1(r.diff)} +/- ${f1(r.se)}) target ${r.target}`));
  } else console.log('usage: road run <games> [shard nshards] --tag=<t> | road report --tags=a,b');
} else console.log('usage: verify | power --variant=base|cd2 | power-report | road run|report (see the header)');
