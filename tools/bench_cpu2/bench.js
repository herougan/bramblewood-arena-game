#!/usr/bin/env node
// BENCH-CPU2 (2026-11-28, docs/design/cpu2-2026-11-28.md fix #1, owner decision CPU2-1): how much stronger is the road CPU if the Basic
// level (aiLevel 0) also runs the turn planner (aiPlanPlay)? No game code changes: only inside this process, the engine's
// `const planOn = aiSmart() && slotMode;` gets a switch (globalThis.__CPU2_BASIC_PLAN) that turns the planner on at aiLevel 0 too, its
// noise kept. Each game is played twice on the same seed (arena_app.js playReferenceGame, seed0 + 37g): baseline, then planner.
// Fights whose CPU is already Smart (elite / boss from Map 5) are skipped: the switch does not touch them (difference 0 by construction).
//   node tools/bench_cpu2/bench.js run <games> [shard nshards] --tag=<t> [--g0=0] [--seed=9100] [--maxmap=20] [--only=code,code] [--pick=<tags> --sig=2]
//        one JSON line per fight to docs/balance/bench-cpu2/<t>.jsonl (resumable). --pick: only fights whose paired difference in those
//        tags' rows is beyond sig x SE. --g0: first game index (games g0 .. g0+games-1), so a follow-up extends the same seed sequence.
//   node tools/bench_cpu2/bench.js report --tags=a,b[,c] [--first]   merges rows by fight (games added; --first: the first tag's row wins),
//        prints the summary, writes docs/balance/bench-cpu2/<first tag>-summary.json
// Run 2026-11-28: run 100 --tag=p100 (shards 0/1 of 2), then run 400 --g0=100 --pick=p100 --sig=2 --tag=p400, report --tags=p400,p100 --first
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const ROOT = path.join(__dirname, '..', '..');
const ENG = path.join(ROOT, 'bramblewood-engine.js');
{ // the in-process patch: compile the engine with the switch and seed require's cache, so lib_bramble.js gets this copy
  const NEEDLE = 'const planOn = aiSmart() && slotMode;';
  let s = fs.readFileSync(ENG, 'utf8');
  if(s.split(NEEDLE).length !== 2) throw new Error('bench_cpu2: the planOn line is not found exactly once in bramblewood-engine.js');
  s = s.replace(NEEDLE, 'const planOn = (aiSmart() || (aiAim && aiLevel === 0 && globalThis.__CPU2_BASIC_PLAN === true)) && slotMode;');
  const m = new Module(ENG, module); m.filename = ENG; m.paths = Module._nodeModulePaths(ROOT); m._compile(s, ENG); m.loaded = true; require.cache[ENG] = m;
}
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const argv = process.argv.slice(2), CMD = argv[0] || 'help';
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const FIRST_WINS = argv.includes('--first');
const nums = argv.slice(1).filter(a=> /^\d+$/.test(a)).map(Number);
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bench-cpu2');
const readJsonl = f=> fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)) : [];

// the fights, as tools/skirmish_pass.js lists them (fights() and its --maxmap filter)
const DUNGEON_FLOORS = [1, 10, 25, 50];
function fights(){
  const out = [], MAPS = G.CONQUEST_MAPS;
  for(const m of MAPS){
    if(m.reserved || m.tower) continue;
    const no = G.mapNumberOf(m.id); if(no == null) continue;
    const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
    m.nodes.forEach((n, i)=>{
      if(!n.deck || !Object.keys(n.deck).length) return;
      const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
      if(m.endless && !DUNGEON_FLOORS.includes(n.floor)) return;
      const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
      out.push({map: m.id, mapNo: no, side: !!m.sub, endless: !!m.endless, key: n.key, code, kind: k, n});
    });
  }
  return out;
}
// the band, as tools/skirmish_pass.js fightBand (the game's skirmishTargetBand; a challenge skirmish 10 points lower, +/- 8)
const fightBand = f=>{ const b = G.skirmishTargetBand(f.map, f.n); if(!f.n.challenge || !b.curve) return b; const t = b.t - 0.10;
  return Object.assign({}, b, {t, lo: t - 0.08, hi: t + 0.08, role: 'challenge'}); };
const MAXMAP = +opt('maxmap', 20);
const ALL = fights().filter(f=> Math.max(f.mapNo, G.mapUnlockNumberOf ? (G.mapUnlockNumberOf(f.map) || 0) : 0) <= MAXMAP);

function playPair(f, games, g0, seed0){
  G.NODE_MAP_HINT.set(f.n, f.map);
  const ctx = G.referenceFightSetup(f.map, f.n, {seed0});
  if(ctx.cpu !== 0) return {cpu: ctx.cpu, skipped: true};
  let base = '', plan = '';
  for(let g = g0; g < g0 + games; g++){
    globalThis.__CPU2_BASIC_PLAN = false; const a = G.playReferenceGame(ctx, g);
    globalThis.__CPU2_BASIC_PLAN = true; const b = G.playReferenceGame(ctx, g);
    globalThis.__CPU2_BASIC_PLAN = false;
    base += a.win ? '1' : '0'; plan += b.win ? '1' : '0';
  }
  return {cpu: ctx.cpu, base, plan};
}
const stat = (base, plan)=>{ const n = base.length; if(!n) return null; let sb = 0, sp = 0, sd = 0, sd2 = 0;
  for(let i = 0; i < n; i++){ const a = +base[i], b = +plan[i], d = b - a; sb += a; sp += b; sd += d; sd2 += d * d; }
  const md = sd / n, varD = n > 1 ? (sd2 - n * md * md) / (n - 1) : 0;
  return {n, base: 100 * sb / n, plan: 100 * sp / n, diff: 100 * md, se: 100 * Math.sqrt(Math.max(0, varD) / n)}; };

if(CMD === 'run'){
  const N = nums[0] || 100, SHARD = nums[1] || 0, NSH = nums[2] || 1, G0 = +opt('g0', 0), SEED = +opt('seed', 9100), tag = opt('tag', 'run');
  fs.mkdirSync(OUTDIR, {recursive: true});
  const OUT = path.join(OUTDIR, tag + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const ONLY = opt('only', '').split(',').filter(Boolean);
  let todo = ALL.filter(f=> !ONLY.length || ONLY.includes(f.code));
  if(opt('pick')){ const sig = +opt('sig', 2), rows = merge(opt('pick').split(','));
    todo = todo.filter(f=>{ const r = rows[f.map + ':' + f.key]; if(!r || r.skipped) return false; const s = stat(r.base, r.plan); return s && s.se > 0 && Math.abs(s.diff) > sig * s.se; }); }
  todo = todo.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights', ALL.length, 'mine', todo.length, 'games', N, 'from g', G0);
  for(const f of todo){ const t = Date.now(), r = playPair(f, N, G0, SEED), s = r.skipped ? null : stat(r.base, r.plan);
    fs.appendFileSync(OUT, JSON.stringify(Object.assign({map: f.map, key: f.key, code: f.code, kind: f.kind, mapNo: f.mapNo, side: f.side, endless: f.endless, seed0: SEED, g0: G0, games: r.skipped ? 0 : N, ms: Date.now() - t}, r)) + '\n');
    console.log(f.code, r.skipped ? 'cpu ' + r.cpu + ' skipped' : `${s.base.toFixed(0)} -> ${s.plan.toFixed(0)} (${s.diff >= 0 ? '+' : ''}${s.diff.toFixed(1)} +/- ${s.se.toFixed(1)})`, ((Date.now() - t) / 1000).toFixed(0) + 's'); }
  console.log('done');
} else if(CMD === 'report'){
  const tags = opt('tags', '').split(',').filter(Boolean), rows = merge(tags), out = [];
  for(const f of ALL){ const r = rows[f.map + ':' + f.key]; if(!r) continue; const b = fightBand(f);
    const s = r.skipped ? {n: 0, base: null, plan: null, diff: 0, se: 0} : stat(r.base, r.plan);
    const inB = w=> w == null ? null : w >= b.lo * 100 - 1e-9 && w <= b.hi * 100 + 1e-9;
    out.push({code: f.code, map: f.map, kind: f.kind, side: f.side, endless: f.endless, cpu: r.cpu, curve: !!b.curve, target: Math.round(b.t * 1000) / 10, lo: Math.round(b.lo * 1000) / 10, hi: Math.round(b.hi * 1000) / 10,
      n: s.n, base: s.base, plan: s.plan, diff: s.diff, se: s.se, inBase: r.skipped ? null : inB(s.base), inPlan: r.skipped ? null : inB(s.plan)}); }
  const basic = out.filter(r=> r.cpu === 0), mean = a=> a.length ? a.reduce((x, y)=> x + y, 0) / a.length : 0;
  const curve = basic.filter(r=> r.curve), leave = curve.filter(r=> r.inBase && !r.inPlan), enter = curve.filter(r=> !r.inBase && r.inPlan);
  // the mean's paired SE: per-fight SEs combined (fights independent), over the Basic fights
  const meanSe = Math.sqrt(basic.reduce((t, r)=> t + r.se * r.se, 0)) / Math.max(1, basic.length);
  const sum = {tags, fights: out.length, basicFights: basic.length, smartSkipped: out.length - basic.length, games: basic.reduce((t, r)=> t + r.n, 0),
    meanDiffBasic: mean(basic.map(r=> r.diff)), meanSeBasic: meanSe, meanDiffAll: mean(out.map(r=> r.diff)), medianSe: basic.map(r=> r.se).sort((a, b)=> a - b)[Math.floor(basic.length / 2)],
    beyond2se: basic.filter(r=> r.se > 0 && Math.abs(r.diff) > 2 * r.se).length, curveBasic: curve.length,
    bandBase: curve.filter(r=> r.inBase).length, bandPlan: curve.filter(r=> r.inPlan).length, leave: leave.map(r=> r.code), enter: enter.map(r=> r.code),
    top10: basic.slice().sort((a, b)=> Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 10).map(r=> ({code: r.code, kind: r.kind, n: r.n, base: r.base, plan: r.plan, diff: r.diff, se: r.se, target: r.target}))};
  fs.writeFileSync(path.join(OUTDIR, tags[0] + '-summary.json'), JSON.stringify({summary: sum, rows: out}, null, 1) + '\n');
  const f1 = x=> x == null ? '-' : (Math.round(x * 10) / 10).toFixed(1);
  console.log(`fights ${sum.fights} (Basic ${sum.basicFights}, Smart skipped ${sum.smartSkipped}), paired games ${sum.games}`);
  console.log(`mean player win change (Basic fights) ${f1(sum.meanDiffBasic)} +/- ${f1(sum.meanSeBasic)} SE; all fights ${f1(sum.meanDiffAll)}; median fight SE ${f1(sum.medianSe)}; beyond 2 SE ${sum.beyond2se}`);
  console.log(`curve fights in band (Basic ${sum.curveBasic}): ${sum.bandBase} -> ${sum.bandPlan}; leave ${leave.length} [${sum.leave.join(' ')}], enter ${enter.length} [${sum.enter.join(' ')}]`);
  sum.top10.forEach(r=> console.log(`  ${r.code} ${r.kind} n=${r.n}: ${f1(r.base)} -> ${f1(r.plan)} (${r.diff >= 0 ? '+' : ''}${f1(r.diff)} +/- ${f1(r.se)}) target ${r.target}`));
} else console.log('usage: run <games> [shard nshards] --tag=<t> | report --tags=a,b');

// rows of several tags merged by fight: outcome strings appended (each tag must cover other game indices)
function merge(tags){ const by = {};
  for(const t of tags) for(const r of readJsonl(path.join(OUTDIR, t + '.jsonl'))){ const k = r.map + ':' + r.key;
    if(!by[k]) by[k] = Object.assign({}, r, {base: r.base || '', plan: r.plan || '', g0s: [r.g0]});
    else if(!r.skipped && !by[k].g0s.includes(r.g0) && !FIRST_WINS){ by[k].base += r.base; by[k].plan += r.plan; by[k].g0s.push(r.g0); } }
  return by; }
// --first: a fight in the first tag keeps only that tag's games (the 400-game follow-up on fresh seeds replaces the 100-game screen)
