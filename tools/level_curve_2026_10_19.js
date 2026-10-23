#!/usr/bin/env node
// The level curve (2026-10-19, package LV; owner 00:19, the overnight plan's last step: "balance level to balance with the overall
// linear increase in difficulty over time"). Measures how hard every fight is in ABSOLUTE terms (not against that map's own reference
// player), so the road's difficulty can be seen as one line over the maps:
//   - four FIXED yardstick decks (frozen here, so a later reference-deck rebuild or level-curve change never moves them) play every
//     fight: the Otter starter (printed stats), the Map 8 road deck at Lv 1, the Map 16 road deck at Lv 3 and the Map 24 road deck
//     at Lv 6. Each plays the fight exactly as the game builds it (arena_app.js simulateReferenceFight with opts.deck / opts.level);
//   - `fit` puts every fight and every yardstick on one logistic scale (Bradley-Terry: P(yardstick y beats fight f) = 1 / (1 +
//     e^(D_f - R_y)), maximum likelihood over all the games, the Map 8 yardstick's R fixed at 0). D_f is the fight's Difficulty
//     Rating (DR): +1 DR is about the step from a 73% fight to a 50% fight for the same deck. The reference player's own rating per map
//     (R_ref) comes from the curve measure (skirmish-pass-<tag>.jsonl) the same way, with every D_f held fixed.
//   node tools/level_curve_2026_10_19.js abs [games=48] [shard nshards] [--tag=lv-abs-before] [--only=a,b] [--main]
//        appends one JSON line per fight (all four yardsticks) to docs/balance/<tag>.jsonl (resumable)
//   node tools/level_curve_2026_10_19.js fit [--tag=lv-abs-before] [--ref=cb-after] [--out=level-curve-fit-before]
//        writes docs/balance/<out>.json: D per fight, R per yardstick, R_ref per map, the per-map trend and the fights off it
//   node tools/level_curve_2026_10_19.js econ   the Forge economy: the card level a player can afford for their reference deck by map
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUTDIR = path.join(ROOT, 'docs', 'balance');
const argv = process.argv.slice(2), CMD = argv[0] || 'abs';
const nums = argv.filter(a=> /^\d+$/.test(a)).map(Number);
const N = nums[0] || 48, SHARD = nums[1] || 0, NSH = nums[2] || 1;
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
let G = null; // the game's functions (lib_bramble), loaded by the commands that need them
const readJsonl = file=>{ try{ return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };

// The yardsticks, frozen 2026-10-19 from WINRATE_REF_DECKS after the card pass (CB). Never edit them: the before / after tables compare
// fights by these exact decks and levels.
const YARDSTICKS = [
  {id: 'Y0', name: 'Otter starter, printed', level: 0, deck: {"duck-paddler":2,"pond-trout":2,"meadow-frog":1,"otter-kit":1,"otter-centurion":1,"fleetfootd":1,"honey-bee":3,"silver-minnow":3,"sparrow-chick":3,"rabbit-kit":1}},
  {id: 'Y8', name: 'Map 8 road deck, Lv 1', level: 1, deck: {"burrow-rabbit":4,"otter-centurion":4,"pelican-diver":4,"hedgehog-scout":4,"bog-leech":4}},
  {id: 'Y16', name: 'Map 16 road deck, Lv 3', level: 3, deck: {"bramblewood-lynx":4,"nautilus-drifter":4,"mangrove-manatee":4,"raccoon-bandit":4,"fawn-scout":4}},
  {id: 'Y24', name: 'Map 24 road deck, Lv 6', level: 6, deck: {"boar-rampager":4,"cinder-imp":4,"mangrove-manatee":4,"raccoon-bandit":3,"fawn-scout":1,"snow-owl-sentinel":3,"burrow-rabbit":1}},
];
const SEED0 = 6100; // the yardsticks' own seeds (6100 + 37g): neither the curve's measure seeds (9100) nor its fresh ones (5100)

function fightsList(G){
  const MAPS = G.CONQUEST_MAPS, out = [];
  for(const m of MAPS){
    if(m.reserved || m.tower) continue;
    const no = G.mapNumberOf(m.id); if(no == null) continue;
    const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
    m.nodes.forEach((n, i)=>{
      if(!n.deck || !Object.keys(n.deck).length) return;
      const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
      if(m.endless && ![1, 5, 10, 20, 25, 30, 40, 50].includes(n.floor)) return;
      const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
      out.push({map: m.id, mapNo: no, side: !!m.sub, endless: !!m.endless, floor: n.floor || null, key: n.key, code, kind: k, name: n.name || n.key, stageMap: G.nodeMapNumber(n), m, n});
    });
  }
  return out;
}

const MAIN_MODULE = require.main === module;
if(!MAIN_MODULE){ /* required by a test or a doc tool: no command */ }
else if(CMD === 'floors'){
  // node tools/level_curve_2026_10_19.js floors [games=40] [--floor={"floorMaps":0.5,"floorPct":0.01}] [--maps=mm,mlb]
  // each endless dungeon's floors 1, 5, 10 ... 50 against (a) its parent map's reference player and (b) the reference player of the map
  // the floor counts as (parent + (f - 1) x floorMaps, the last built deck past Map 24, at that map's level): a floor should feel to (b)
  // like a fight of the road's middle, its every-10th-floor King like a map's boss
  G = require('./lib_bramble.js').G; Object.assign(G.ENDLESS_FLOOR_CURVE, JSON.parse(opt('floor', '{}')));
  const maps = opt('maps', 'mm,mlb').split(','), FL = [1, 2, 5, 9, 10, 15, 19, 20, 25, 30, 39, 40, 50], out = [];
  for(const id of maps){ const m = G.CONQUEST_MAPS.find(x=> x.id === id), parent = G.mapNumberOf(id);
    for(const fl of FL){ const n = m.nodes.find(x=> x.floor === fl); if(!n) continue; G.NODE_MAP_HINT.set(n, id);
      const a = G.simulateReferenceFight(id, n, N, {seed0: 9100}), at = Math.min(24, Math.floor(parent + (fl - 1) * G.ENDLESS_FLOOR_CURVE.floorMaps));
      const deck = G.WINRATE_REF_DECKS.road[at] || G.WINRATE_REF_DECKS.road[24], b = G.simulateReferenceFight(id, n, N, {seed0: 9100, deck, level: G.referencePlayerLevel(parent + (fl - 1) * G.ENDLESS_FLOOR_CURVE.floorMaps)});
      const row = {map: id, floor: fl, kind: n.kind, enemy: G.roadEnemyLevelExact(n), shield: a.shield, hp: a.hp, parentWin: Math.round(a.win * 1000) / 10, countsAs: Math.round((parent + (fl - 1) * G.ENDLESS_FLOOR_CURVE.floorMaps) * 10) / 10, atWin: Math.round(b.win * 1000) / 10};
      out.push(row); console.log(JSON.stringify(row)); } }
  fs.writeFileSync(path.join(OUTDIR, opt('out', 'level-curve-floors') + '.json'), JSON.stringify({curve: G.ENDLESS_FLOOR_CURVE, rows: out}, null, 1) + '\n');
} else if(CMD === 'abs'){
  G = require('./lib_bramble.js').G;
  const ONLY = opt('only', '').split(',').filter(Boolean), MAIN = argv.includes('--main');
  const all = fightsList(G).filter(f=> !ONLY.length || ONLY.includes(f.map) || ONLY.includes(f.key) || ONLY.includes(f.code)).filter(f=> !MAIN || (!f.side && !f.endless));
  const OUT = path.join(OUTDIR, opt('tag', 'lv-abs-before') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const mine = all.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights', all.length, 'mine', mine.length);
  for(const f of mine){
    const t = Date.now(), y = {}; let sc = null;
    G.NODE_MAP_HINT.set(f.n, f.map);
    for(const Y of YARDSTICKS){ const r = G.simulateReferenceFight(f.map, f.n, N, {seed0: SEED0, deck: Y.deck, level: Y.level}); y[Y.id] = r.wins; sc = sc || r; }
    const {m, n, ...row} = f;
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(row, {games: N, wins: y, lv: G.roadEnemyLevel(f.n), cpu: sc.cpu, hp: sc.hp, shield: sc.shield, rule: G.ruleShieldOf(f.n), overridden: sc.overridden, ms: Date.now() - t})) + '\n');
  }
  console.log('done');
} else if(CMD === 'fit'){
  const rows = readJsonl(path.join(OUTDIR, opt('tag', 'lv-abs-before') + '.jsonl'));
  const ref = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('ref', 'cb-after')}.jsonl`));
  G = require('./lib_bramble.js').G;
  const fit = fitRatings(rows, ref);
  fs.writeFileSync(path.join(OUTDIR, opt('out', 'level-curve-fit-before') + '.json'), JSON.stringify(fit, null, 1) + '\n');
  const main = fit.fights.filter(f=> !f.side && !f.endless);
  console.log('yardsticks', JSON.stringify(fit.R));
  console.log('trend (main maps, map level ML): ML = %s + %s x map, r2 %s, rms %s', fit.trend.a, fit.trend.b, fit.trend.r2, fit.trend.rms);
  console.log('the road from Map 1: ML = %s + %s x map, r2 %s, rms %s; off: %s', fit.road.a, fit.road.b, fit.road.r2, fit.road.rms, JSON.stringify(fit.road.off));
  for(const mp of fit.maps) console.log(String(mp.mapNo).padStart(2), 'ML', String(mp.ML).padStart(6), 'trend', String(mp.trend).padStart(6), 'off', String(mp.off).padStart(6), 'R_ref', mp.Rref == null ? '-' : mp.Rref, ' mean D', mp.meanD, ' first', mp.first, 'boss', mp.boss);
  console.log('side / endless:', fit.fights.filter(f=> f.side || f.endless).map(f=> `${f.code} D${f.D}`).join(', '));
  console.log('fights off the per-place trend by > 0.75 DR:', main.filter(f=> Math.abs(f.offPlace) > 0.75).map(f=> `${f.code} ${f.offPlace > 0 ? '+' : ''}${f.offPlace}`).join(', '));
} else if(CMD === 'rule'){
  // node tools/level_curve_2026_10_19.js rule [games=60] [shard nshards] [--tag=lv-rule] [--curve={"enemyGainPerMap":0.015}] [--floor={...}] [--main] [--only=]
  // the reference player on every fight with its bramble back on the rule (no shieldOverride, no hqHp: the castle's own Health and the
  // rule's Shield), at today's level curves (or --curve's / --floor's fields over them): how far each fight is from its curve target
  // without the overrides. need = logit(win) - logit(target), in DR: + too easy, - too hard.
  G = require('./lib_bramble.js').G;
  Object.assign(G.ROAD_LEVEL_CURVE, JSON.parse(opt('curve', '{}'))); Object.assign(G.ENDLESS_FLOOR_CURVE, JSON.parse(opt('floor', '{}')));
  const ONLY = opt('only', '').split(',').filter(Boolean), MAIN = argv.includes('--main'), KEEP = argv.includes('--keep');
  const all = fightsList(G).filter(f=> !ONLY.length || ONLY.includes(f.map) || ONLY.includes(f.key) || ONLY.includes(f.code)).filter(f=> !MAIN || (!f.side && !f.endless));
  const OUT = path.join(OUTDIR, opt('tag', 'lv-rule') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const mine = all.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights', all.length, 'mine', mine.length);
  const lg = p=> Math.log(p / (1 - p)), cl = p=> Math.min(0.985, Math.max(0.015, p));
  for(const f of mine){
    const t = Date.now(), node = Object.assign({}, f.n); if(!KEEP){ delete node.shieldOverride; delete node.hqHp; } G.NODE_MAP_HINT.set(node, f.map);
    const r = G.simulateReferenceFight(f.map, node, N, {seed0: +opt('seed', 9100)}), b = G.skirmishTargetBand(f.map, f.n), win = r.wins / N;
    const {m, n, ...row} = f;
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(row, {games: N, win: Math.round(win * 1000) / 10, target: Math.round(b.t * 1000) / 10, lo: Math.round(b.lo * 1000) / 10, hi: Math.round(b.hi * 1000) / 10, curve: !!b.curve,
      need: Math.round((lg(cl(win)) - lg(cl(b.t))) * 100) / 100, level: r.level, enemy: G.roadEnemyLevelExact(node), cpu: r.cpu, hp: r.hp, shield: r.shield, ms: Date.now() - t})) + '\n');
  }
  console.log('done');
} else if(CMD === 'strip' || CMD === 'apply'){
  // node tools/level_curve_2026_10_19.js strip [--write]   every road fight's bramble back on the rule: shieldOverride removed, and an
  //      hqHp that lowers the bramble's own Health removed (one at or over it does nothing, so it stays); the Babel Spire, the Tutorial's
  //      two lessons and raids untouched. Writes docs/balance/level-curve-overrides-before.json (what was there).
  // node tools/level_curve_2026_10_19.js apply --fixes=a,b [--write]   the tune rounds' fixes (skirmish_pass.js curve --rule): their
  //      deck, their Shield (or none: the rule) and their Health (or none: the bramble's own); a later file wins
  const Bm = require('./lib_bramble.js'); G = Bm.G;
  const edits = [];
  if(CMD === 'strip'){
    const before = [];
    for(const f of fightsList(G)){ if(f.endless && f.floor) {} const n = f.n; G.NODE_MAP_HINT.set(n, f.map);
      const sc = G.skirmishCastle(n), bare = Object.assign({}, n); delete bare.hqHp; delete bare.shieldOverride; G.NODE_MAP_HINT.set(bare, f.map); const own = G.skirmishCastle(bare);
      const e = {key: n.key}; let any = false;
      if(n.shieldOverride != null){ e.shieldOverride = null; any = true; }
      if(n.hqHp != null && sc.hp < own.hp){ e.hqHp = null; any = true; }
      if(any){ edits.push(e); before.push({map: f.map, key: f.key, code: f.code, mapNo: f.mapNo, kind: f.kind, side: f.side, rule: own.rule, shield: sc.shield, overridden: sc.overridden, hp: sc.hp, ownHp: own.hp, hqHp: n.hqHp != null ? n.hqHp : null}); } }
    if(before.length && argv.includes('--write')) fs.writeFileSync(path.join(OUTDIR, 'level-curve-overrides-before.json'), JSON.stringify(before, null, 1) + '\n');
    console.log(before.length, 'fights with an override:', before.filter(b=> b.overridden).length, 'Shield,', before.filter(b=> b.hp < b.ownHp).length, 'Health');
  } else {
    const byKey = {};
    for(const file of opt('fixes', '').split(',').filter(Boolean)) readJsonl(path.join(OUTDIR, file + '.jsonl')).forEach(x=>{ if(x.apply === false) return;
      const e = byKey[x.key] = byKey[x.key] || {key: x.key}; if(x.deck) e.deck = x.deck; e.shieldOverride = x.shieldOverride != null ? x.shieldOverride : null; e.hqHp = x.hqHp != null ? x.hqHp : null; });
    Object.values(byKey).forEach(e=> edits.push(e));
  }
  const n = writeEdits(edits, argv.includes('--write'));
  console.log(n, 'node lines', argv.includes('--write') ? 'written' : 'would change (dry run; --write to write)');
} else if(CMD === 'curves'){
  // node tools/level_curve_2026_10_19.js curves   the curves per map, as the game builds them (docs/balance/level-curve-curves.json), and
  //      every fight's override as it stands (docs/balance/level-curve-overrides-after.json)
  G = require('./lib_bramble.js').G;
  const gainAt = L=>{ const mx = G.levelMix(L), g = l=> l <= 1 ? 0 : l < 3 ? 0 : l < 6 ? 0.10 : l < 9 ? 0.20 : l < 10 ? 0.30 : l < 11 ? 0.35 : 0.45; return g(mx.lo) + mx.frac * (g(mx.hi) - g(mx.lo)); };
  const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved), maps = [];
  mains.forEach((m, no)=>{ const nodes = m.nodes.filter(n=> n.deck && n.kind !== 'tutorial'); if(!nodes.length) return;
    const of = kind=> nodes.find(n=> (n.kind || 'skirmish') === kind), probe = kind=>{ const n = Object.assign({}, nodes[0], {kind, key: '__probe'}); G.NODE_MAP_HINT.set(n, m.id); return n; };
    const hpOf = kind=>{ const n = of(kind); if(!n) return null; G.NODE_MAP_HINT.set(n, m.id); const c = Object.assign({}, n); delete c.hqHp; G.NODE_MAP_HINT.set(c, m.id); return G.skirmishCastle(c).hp; };
    const pl = G.referencePlayerLevel(no), en = G.roadEnemyLevelExact(probe('skirmish')), eb = G.roadEnemyLevelExact(probe('boss'));
    maps.push({map: no, id: m.id, enemy: en, enemyBoss: eb, enemyGain: Math.round(Math.max(0, no - G.ROAD_LEVEL_CURVE.enemyFrom) * G.ROAD_LEVEL_CURVE.enemyGainPerMap * 1000) / 10, player: pl, playerGain: Math.round(gainAt(pl) * 1000) / 10,
      shield: {skirmish: G.ruleShieldOf(probe('skirmish')), elite: G.ruleShieldOf(probe('elite')), miniboss: G.ruleShieldOf(probe('miniboss')), boss: G.ruleShieldOf(probe('boss'))},
      hp: {skirmish: hpOf('skirmish'), elite: hpOf('elite'), boss: hpOf('boss') || hpOf('miniboss')}, cpu: ['Basic', 'Smart', 'Smartest'][G.cpuAiLevelForNode(m.id, probe('skirmish'))] + ' / ' + ['Basic', 'Smart', 'Smartest'][G.cpuAiLevelForNode(m.id, probe('elite'))]}); });
  fs.writeFileSync(path.join(OUTDIR, 'level-curve-curves.json'), JSON.stringify({curve: G.ROAD_LEVEL_CURVE, floors: G.ENDLESS_FLOOR_CURVE, maps}, null, 1) + '\n');
  const after = [];
  for(const f of fightsList(G)){ const n = f.n; G.NODE_MAP_HINT.set(n, f.map); const sc = G.skirmishCastle(n), bare = Object.assign({}, n); delete bare.hqHp; delete bare.shieldOverride; G.NODE_MAP_HINT.set(bare, f.map); const own = G.skirmishCastle(bare);
    if(sc.overridden || sc.hp < own.hp) after.push({map: f.map, key: f.key, code: f.code, mapNo: f.mapNo, kind: f.kind, side: f.side, rule: own.rule, shield: sc.shield, overridden: sc.overridden, hp: sc.hp, ownHp: own.hp, hqHp: n.hqHp != null ? n.hqHp : null}); }
  fs.writeFileSync(path.join(OUTDIR, 'level-curve-overrides-after.json'), JSON.stringify(after, null, 1) + '\n');
  maps.forEach(m=> console.log(JSON.stringify(m)));
  console.log(after.length, 'fights with an override now:', after.filter(o=> o.overridden).length, 'Shield,', after.filter(o=> o.hp < o.ownHp).length, 'Health; over 2x the rule:', after.filter(o=> o.overridden && o.shield > 2 * Math.max(1, o.rule)).map(o=> o.code).join(', ') || 'none');
} else if(CMD === 'decks'){
  // node tools/level_curve_2026_10_19.js decks [games=24] [--levels=1,3,6] [--fit=level-curve-fit-before] [--out=level-curve-decks]
  // every road deck (and the starter) at the given levels, on a fixed panel of every third main-map fight, rated against those fights'
  // D (from the --fit file): how much stronger the decks get map by map on their own, and what a card level step is worth in DR
  G = require('./lib_bramble.js').G;
  const fit = JSON.parse(fs.readFileSync(path.join(OUTDIR, opt('fit', 'level-curve-fit-before') + '.json'), 'utf8'));
  const Dof = {}; fit.fights.forEach(f=> Dof[f.map + ':' + f.key] = f.D);
  const panel = fightsList(G).filter(f=> !f.side && !f.endless && f.mapNo >= 1).filter((f, i)=> i % 3 === 0 && Dof[f.map + ':' + f.key] != null);
  const levels = opt('levels', '1,3,6').split(',').map(Number), out = [], OUT = path.join(OUTDIR, opt('out', 'level-curve-decks') + '.json');
  const decks = [['starter', G.WINRATE_REF_DECKS.starter]].concat(Object.entries(G.WINRATE_REF_DECKS.road));
  const only = opt('maps', '').split(',').filter(Boolean);
  for(const [no, deck] of decks){ if(only.length && !only.includes(String(no))) continue;
    for(const L of levels){ const t = Date.now(), res = panel.map(f=>{ G.NODE_MAP_HINT.set(f.n, f.map); const r = G.simulateReferenceFight(f.map, f.n, N, {seed0: SEED0, deck, level: L}); return {d: Dof[f.map + ':' + f.key], w: r.wins, n: N}; });
      let x = 0; for(let it = 0; it < 100; it++){ let g = 0, h = 1e-6; res.forEach(o=>{ const p = sig(x - o.d); g += o.w - o.n * p; h += o.n * p * (1 - p); }); x += Math.max(-2, Math.min(2, g / h)); }
      out.push({deck: no, level: L, R: Math.round(x * 100) / 100, panel: panel.length, games: N}); console.log('deck', no, 'Lv', L, 'R', Math.round(x * 100) / 100, ((Date.now() - t) / 1000).toFixed(0) + 's');
      fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); } }
} else if(CMD === 'econ'){
  const ec = economy(require('./lib_bramble.js'));
  fs.writeFileSync(path.join(OUTDIR, 'level-curve-economy.json'), JSON.stringify(ec, null, 1) + '\n');
  for(const k of ['threeQuarters', 'dayPerMapLight', 'dayPerMap']){ console.log(k); ec[k].forEach(r=> console.log(' ', String(r.map).padStart(2), 'earned', String(r.earned).padStart(5), 'bank', String(r.bank).padStart(5), 'deck +' + r.meanGain + '%', r.levels)); }
}

// Node edits into arena_app.js's CONQUEST_MAPS lines: deck, shieldOverride (null: removed, back on the rule), hqHp (null: removed).
function writeEdits(edits, write){
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of edits){
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`), mm = s.match(re); if(!mm){ console.log('not found', x.key); continue; }
    let line = mm[1];
    if(x.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.deck));
    if('hqHp' in x){ if(x.hqHp == null) line = line.replace(/,? ?hqHp:\d+/, ''); else line = /hqHp:\d+/.test(line) ? line.replace(/hqHp:\d+/, 'hqHp:' + x.hqHp) : line.replace(/deck:/, `hqHp:${x.hqHp}, deck:`); }
    if('shieldOverride' in x){ if(x.shieldOverride == null) line = line.replace(/,? ?shieldOverride:(\d+|\[[^\]]*\])/, ''); else line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.shieldOverride) : line.replace(/deck:/, `shieldOverride:${x.shieldOverride}, deck:`); }
    if(line !== mm[1]){ s = s.replace(mm[1], ()=> line); n++; }
  }
  if(write) fs.writeFileSync(APP, s);
  return n;
}
// ---- the rating fit (Bradley-Terry, Newton steps on each side in turn; a light prior keeps an all-win or all-loss fight finite)
function sig(x){ return 1 / (1 + Math.exp(-x)); }
function fitRatings(rows, refRows){
  const R = {Y0: -2, Y8: 0, Y16: 2, Y24: 4}, D = {};
  const keyOf = r=> r.map + ':' + r.key;
  rows.forEach(r=> D[keyOf(r)] = 0);
  const PRIOR = 0.02; // a weak pull to the yardstick middle, ~ half a game either way
  for(let it = 0; it < 200; it++){
    rows.forEach(r=>{ const k = keyOf(r); let g = 0, h = PRIOR; g -= PRIOR * (D[k] - 1);
      for(const Y of YARDSTICKS){ const w = r.wins[Y.id], n = r.games, p = sig(R[Y.id] - D[k]); g += -(w - n * p); h += n * p * (1 - p); } // d logL / dD = -(w - n p)
      D[k] += Math.max(-2, Math.min(2, g / h)); });
    for(const Y of YARDSTICKS){ if(Y.id === 'Y8') continue; let g = 0, h = 1e-6;
      rows.forEach(r=>{ const w = r.wins[Y.id], n = r.games, p = sig(R[Y.id] - D[keyOf(r)]); g += (w - n * p); h += n * p * (1 - p); });
      R[Y.id] += Math.max(-2, Math.min(2, g / h)); }
  }
  // the reference player per map, every D held fixed (R_ref(map) from that map's own fights' curve measure)
  const Rref = {};
  const byMapRef = {}; refRows.forEach(r=>{ if(r.side || r.endless) return; const d = D[keyOf(r)]; if(d == null) return; (byMapRef[r.mapNo] = byMapRef[r.mapNo] || []).push({d, w: Math.round(r.win / 100 * r.games), n: r.games}); });
  Object.entries(byMapRef).forEach(([no, list])=>{ let x = 0; for(let it = 0; it < 100; it++){ let g = 0, h = 1e-6; list.forEach(o=>{ const p = sig(x - o.d); g += o.w - o.n * p; h += o.n * p * (1 - p); }); x += Math.max(-2, Math.min(2, g / h)); } Rref[no] = Math.round(x * 100) / 100; });
  // The map's level ML(N): the rating a player needs for that map's fights to land exactly on their curve targets, the mean over its
  // fights of D_f + logit(target_f) (a 90% fight's D sits 2.2 under it, a 40% boss 0.4 over it). On a map tuned to the curve
  // ML(N) = R_ref(N). The road's absolute difficulty is ML(N) over N; its least-squares line is the trend, and a fight's bump is
  // D_f + logit(target_f) - trend(N) (so the within-map 90% -> 60% -> boss shape is never called a bump).
  const r2 = x=> Math.round(x * 100) / 100, lg = p=> Math.log(p / (1 - p));
  const fights = rows.map(r=> Object.assign({}, r, {D: r2(D[keyOf(r)])}));
  if(G) fights.forEach(f=>{ const m = G.CONQUEST_MAPS.find(x=> x.id === f.map), n = m && m.nodes.find(x=> x.key === f.key); if(!n) return; const b = G.skirmishTargetBand(f.map, n); f.target = Math.round(b.t * 1000) / 1000; f.curve = !!b.curve; f.lvl = r2(f.D + lg(Math.min(.97, Math.max(.03, b.t)))); });
  const main = fights.filter(f=> !f.side && !f.endless && f.lvl != null);
  const maps = [...new Set(main.map(f=> f.mapNo))].sort((a, b)=> a - b).map(no=>{ const fs_ = main.filter(f=> f.mapNo === no); return {mapNo: no, n: fs_.length, meanD: fs_.reduce((a, f)=> a + f.D, 0) / fs_.length, ML: fs_.reduce((a, f)=> a + f.lvl, 0) / fs_.length, first: fs_[0].D, boss: fs_[fs_.length - 1].D}; });
  const xs = maps.map(m=> m.mapNo), ys = maps.map(m=> m.ML), mx = xs.reduce((a, b)=> a + b, 0) / xs.length, my = ys.reduce((a, b)=> a + b, 0) / ys.length;
  const b = xs.reduce((a, x, i)=> a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x)=> a + (x - mx) * (x - mx), 0), a = my - b * mx;
  const ssr = ys.reduce((s, y, i)=> s + (y - (a + b * xs[i])) ** 2, 0), sst = ys.reduce((s, y)=> s + (y - my) ** 2, 0);
  maps.forEach(m=>{ m.trend = r2(a + b * m.mapNo); m.off = r2(m.ML - (a + b * m.mapNo)); m.meanD = r2(m.meanD); m.ML = r2(m.ML); m.Rref = Rref[m.mapNo] != null ? Rref[m.mapNo] : null; });
  main.forEach(f=>{ f.offPlace = r2(f.lvl - (a + b * f.mapNo)); });
  // the road from Map 1 (Map 0 is the starter deck's own world, 3+ DR under Map 1: a line through it says little about Maps 1-24)
  const lineOf = list=>{ const X = list.map(m=> m.mapNo), Y = list.map(m=> m.ML), mX = X.reduce((p, q)=> p + q, 0) / X.length, mY = Y.reduce((p, q)=> p + q, 0) / Y.length;
    const bb = X.reduce((t, x, i)=> t + (x - mX) * (Y[i] - mY), 0) / X.reduce((t, x)=> t + (x - mX) ** 2, 0), aa = mY - bb * mX;
    const res = Y.map((y, i)=> y - (aa + bb * X[i])), sr = res.reduce((t, e)=> t + e * e, 0), st = Y.reduce((t, y)=> t + (y - mY) ** 2, 0);
    return {a: r2(aa), b: Math.round(bb * 1000) / 1000, r2: st ? r2(1 - sr / st) : null, rms: r2(Math.sqrt(sr / Y.length)), off: Object.fromEntries(list.map((m, i)=> [m.mapNo, r2(res[i])]))}; };
  const road = lineOf(maps.filter(m=> m.mapNo >= 1));
  return {R: Object.fromEntries(Object.entries(R).map(([k, v])=> [k, r2(v)])), trend: {a: r2(a), b: Math.round(b * 1000) / 1000, r2: sst ? r2(1 - ssr / sst) : null, rms: r2(Math.sqrt(ssr / ys.length))}, road, maps, Rref, fights};
}

// ---- the Forge economy (what a player can afford): the cumulative first-clear Dust and Maple Leaves of every main map before map N
// (CONQUEST_NODE_REWARDS by kind, a node's own rewards first), against what levelling that map's 20-card reference deck costs
// (levelUpCostRaw: (15 + 12 L) Dust and (10 + 8 L) Leaves x the rarity multiplier, x0.5 for Base / Quest cards; a Level 0 card's
// first level is a mote). The Forge opens on Map 11; levels 5-8 from Map 16, 9 from 26, 10 from 31.
function economy(Bm){
  const src = Bm.src, G = Bm.G;
  const grabObj = name=>{ const i = src.indexOf('const ' + name + ' = '); const j = src.indexOf('};', i); return eval('(' + src.slice(src.indexOf('{', i), j + 1) + ')'); };
  const REW = grabObj('CONQUEST_NODE_REWARDS'), MULT = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'canonical', 'upgrade-costs.json'), 'utf8')).levelCostMult; // 2026-10-23 (HUB2): canonical/upgrade-costs.json
  const KB = {champion:'elite', miniboss:'elite', subboss:'boss', dungeon:'elite', worldboss:'raidboss', megaraid:'raidboss'};
  const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
  const cum = []; let dust = 0, gold = 0;
  mains.forEach((m, i)=>{ cum[i] = {dust, gold}; m.nodes.forEach(n=>{ const k = n.kind || 'skirmish'; if(k === 'tutorial') return; const base = REW[k] || REW[KB[k]] || REW.skirmish; const o = (n.rewards || {}).first || {};
    dust += o.dust != null ? +o.dust : base.first.dust; gold += o.gold != null ? +o.gold : base.first.gold; }); });
  const defs = Bm.CARD_DEFS_BASELINE;
  const costTo = (id, L)=>{ const d = defs[id]; if(!d) return {dust: 0, gold: 0}; const from = G.cardBaseLevel(d); let k = MULT[d.rarity] || 1; const src0 = G.cardSourceOf ? G.cardSourceOf(d).kind : (d.source || {}).kind;
    if(d.rarity === 'starter' || d.rarity === 'quest' || d.basic || src0 === 'base' || src0 === 'quest' || src0 === 'map') k *= 0.5; // isQuestOrBaseCard
    let du = 0, go = 0; for(let l = from; l < L; l++){ if(l <= 0){ du += 15; go += 10; continue; } du += Math.round((15 + l * 12) * k); go += Math.round((10 + l * 8) * k); } return {dust: du, gold: go}; };
  // + the side maps' and the endless floors' first clears, counted on the map that opens them
  const sideDust = {}; G.CONQUEST_MAPS.filter(m=> m.sub && !m.reserved && !m.tower).forEach(m=>{ const p = mains.findIndex(x=> x.id === m.parent); if(p < 0) return;
    m.nodes.forEach(n=>{ const k = n.kind || 'skirmish'; if(k === 'tutorial') return; const base = REW[k] || REW[KB[k]] || REW.skirmish; const o = (n.rewards || {}).first || {};
      sideDust[p] = sideDust[p] || {dust: 0, gold: 0}; sideDust[p].dust += o.dust != null ? +o.dust : base.first.dust; sideDust[p].gold += o.gold != null ? +o.gold : base.first.gold; }); });
  const deckAt = no=> G.WINRATE_REF_DECKS.road[no] || G.WINRATE_REF_DECKS.road[Object.keys(G.WINRATE_REF_DECKS.road).map(Number).filter(x=> x <= no).pop()];
  const gateOf = L=> L >= 11 ? 50 : L >= 10 ? 31 : L >= 9 ? 26 : L >= 5 ? 16 : 0, FORGE_MAP = 11, STEPS = [1, 3, 6, 9];
  const gainOf = (id, L)=>{ const d = defs[id]; if(!d) return 0; const from = G.cardBaseLevel(d); let g = 0; for(let l = from + 1; l <= L; l++){ if(l === 1 || l === 3 || l === 6 || l === 9) g += 0.10; else if(l === 10) g += 0.05; } return g; };
  // a player who puts `share` of every Dust and Leaf they earn into their road deck: from the Forge's map on, each map's arrival spends
  // the bank on the cheapest copy's next stat step (Lv 1, 3, 6, 9) that the level gates allow; levels stay with the cards (per copy)
  // timeDust: the Dust of the time spent on a map (daily notices and weeklies, docs/forge-economy-v2-2026-10-11.md: ~4,480 a week, so
  // ~640 a day; the Notices open on Map 4), counted from Map 5's arrival; the Leaves alongside at the same 2:3 ratio as a level costs
  const sim = (share, timeDust)=>{ const lv = {}; let bank = {dust: 0, gold: 0}; const rows = []; timeDust = timeDust || 0;
    for(let no = 1; no < mains.length; no++){
      const prev = mains[no - 1]; let du = 0, go = 0; prev.nodes.forEach(n=>{ const k = n.kind || 'skirmish'; if(k === 'tutorial') return; const base = REW[k] || REW[KB[k]] || REW.skirmish; const o = (n.rewards || {}).first || {}; du += o.dust != null ? +o.dust : base.first.dust; go += o.gold != null ? +o.gold : base.first.gold; });
      if(sideDust[no - 1]){ du += sideDust[no - 1].dust; go += sideDust[no - 1].gold; }
      if(no >= 5){ du += timeDust; go += timeDust * 2 / 3; }
      bank.dust += du * share; bank.gold += go * share;
      const deck = deckAt(no), copies = [];
      Object.entries(deck).forEach(([id, c])=>{ lv[id] = lv[id] || []; for(let i = 0; i < c; i++){ if(lv[id][i] == null) lv[id][i] = G.cardBaseLevel(defs[id]); copies.push([id, i]); } });
      if(no >= FORGE_MAP) for(;;){ let best = null;
        copies.forEach(([id, i])=>{ const cur = lv[id][i], nxt = STEPS.find(s=> s > cur); if(nxt == null || gateOf(nxt) > no) return; const a = costTo(id, nxt), b = costTo(id, cur), c = {dust: a.dust - b.dust, gold: a.gold - b.gold};
          if(!best || c.dust < best.c.dust) best = {id, i, nxt, c}; });
        if(!best || best.c.dust > bank.dust || best.c.gold > bank.gold) break;
        bank.dust -= best.c.dust; bank.gold -= best.c.gold; lv[best.id][best.i] = best.nxt; }
      const gains = copies.map(([id, i])=> gainOf(id, lv[id][i])), ls = copies.map(([id, i])=> lv[id][i]);
      rows.push({map: no, earned: Math.round(du), bank: Math.round(bank.dust), meanGain: Math.round(gains.reduce((a, b)=> a + b, 0) / gains.length * 1000) / 10,
        levels: Object.entries(ls.reduce((t, l)=> (t[l] = (t[l] || 0) + 1, t), {})).map(([l, k])=> `${k}xL${l}`).join(' ')}); }
    return rows; };
  const out = [];
  for(let no = 1; no < mains.length; no++){
    const deck = deckAt(no);
    const row = {map: no, dustSoFar: cum[no].dust, goldSoFar: cum[no].gold, cost: {}};
    [1, 3, 6].forEach(L=>{ let du = 0, go = 0; Object.entries(deck).forEach(([id, c])=>{ const x = costTo(id, L); du += x.dust * c; go += x.gold * c; }); row.cost['L' + L] = {dust: du, gold: go}; });
    out.push(row);
  }
  // the pace: one map a day, 640 Dust a day of notices and weeklies (half of it for a lighter player)
  return {costs: out, all: sim(1), threeQuarters: sim(0.75), half: sim(0.5), dayPerMap: sim(0.75, 640), dayPerMapLight: sim(0.75, 320)};
}
module.exports = {YARDSTICKS, fitRatings, economy, fightsList};
