// 2026-11-16 (package LAB1): the run queue and the run kinds. Each run pulls first, then starts the repo's own tools from that commit's
// snapshot (all cores: shards or the tool's --workers), and saves one record in the store. One run at a time; queue.json survives a restart
// (a road measure resumes from its tag file).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const P = require('./pull.js'), S = require('./store.js'), I = require('./importer.js');
const HOOK = path.join(__dirname, 'hook.js'), KIT = path.join(__dirname, 'kit.js');
const qFile = () => path.join(P.home(), 'queue.json');
const newId = () => new Date().toISOString().replace(/[-:T]/g, '').slice(2, 14) + Math.random().toString(36).slice(2, 5);
const cores = () => Math.max(1, (os.availableParallelism ? os.availableParallelism() : os.cpus().length));
const freshSeed = () => 1000000 + Math.floor(Math.random() * 2e9); // seeds base + 37g: a fresh base never repeats another run's games
const num = (v, d) => (v === '' || v == null || !isFinite(+v) ? d : +v);

// The repo's simulation tools the Tools tab can run as they are (in a private copy of the snapshot; new files under docs/balance are kept).
const PRESETS = {
  contribution: { label: 'Card contribution (random decks, BAL6)', cmd: 'tools/balance/contribution.js --games {games} --workers {workers}', defaults: { games: 2000 } },
  'bench-contrib': { label: 'Card contribution vs Blanks (TOOLS1 T1)', cmd: 'tools/bench/bench.js contrib --cards {cards}', defaults: { cards: 'owl-nightwatch' } },
  'bench-skill': { label: 'Skill worth vs price (TOOLS1 T2)', cmd: 'tools/bench/bench.js skill {skill}', defaults: { skill: 'arrow' } },
  'bench-deck': { label: 'Focused decks from a list (TOOLS1 T3)', cmd: 'tools/bench/bench.js deck --map {map} --budget {budget}', defaults: { map: 3, budget: 3000 } },
  'skill-canon': { label: 'Skill against the canon (BUDGET2)', cmd: 'tools/skill_canon_2026_10_31.js measure --skill {skill}', defaults: { skill: 'fork' } },
  'skill-worth': { label: 'Skill worth (older standard test)', cmd: 'tools/skill_worth.js', defaults: {} },
  'pro-ease': { label: 'PRO / BPRO fights vs reference decks', cmd: 'tools/opt/pro_ease.js --maps {maps} --games {games} --tag lab-{id}', defaults: { maps: '0-3', games: 40 } },
  'ref6-measure': { label: '100 reference players vs the road (REF6)', cmd: 'tools/ref6/measure.js --maps {maps} --tag lab-{id}', defaults: { maps: '0-3' } },
  'bal13-summary': { label: 'Balance summary (BAL13)', cmd: 'tools/bal13/summary_2026_11_02.js --workers {workers}', defaults: {} },
  'ref5-tournament': { label: 'Progression decks vs the road (REF5)', cmd: 'tools/opt/ref5_prog.js measure --maps {maps} --games {games} --tag lab-{id}', defaults: { maps: '0-20', games: 24 } },
  'raid-sim': { label: 'Raid full sim', cmd: 'tools/raid_full_sim.js', defaults: {} },
  'resources-week': { label: 'Resources in a week', cmd: 'tools/resources_week_2026_10_23.js', defaults: {} },
  'progression-plan': { label: 'Progression plan', cmd: 'tools/progression_plan_2026_10_23.js', defaults: {} },
  'card-balance': { label: 'Win rate per card', cmd: 'tools/card_balance.js {games}', defaults: { games: 100 } },
  'difficulty-curve': { label: 'Starter / Mid-road / Strong curve', cmd: 'tools/difficulty_curve.js {games}', defaults: { games: 40 } },
};

// ---------------------------------------------------------------- a running job's context
function context(job, onChange) {
  const kids = new Set(); let cancelled = false;
  const ctx = {
    job, log(t) { job.log.push(new Date().toTimeString().slice(0, 8) + ' ' + t); if (job.log.length > 300) job.log.splice(0, job.log.length - 300); onChange(); },
    progress(done, total, text) { job.progress = { done, total, text: text || '' }; onChange(); },
    get cancelled() { return cancelled; },
    cancel() { cancelled = true; kids.forEach(k => { try { process.kill(-k.pid, 'SIGTERM'); } catch (e) { try { k.kill('SIGTERM'); } catch (e2) { /* gone */ } } }); },
    // a repo tool from the run's root, with the fetch hook and this node on PATH (tools that start `node` get the same one)
    spawn(root, args, opts) {
      opts = opts || {};
      const env = Object.assign({}, process.env, { LAB_RUN_ROOT: root, LAB_SNAP_META: path.join(ctx.snap.root, '.lab.json'), NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ` --require "${HOOK}"`).trim(),
        PATH: path.dirname(process.execPath) + path.delimiter + (process.env.PATH || '') }, opts.env || {});
      return new Promise((res, rej) => {
        if (cancelled) return rej(new Error('cancelled'));
        const k = cp.spawn(process.execPath, args, { cwd: root, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] }); kids.add(k);
        let out = '', err = ''; k.stdout.on('data', d => { out += d; if (out.length > 4e6) out = out.slice(-2e6); if (opts.onOut) opts.onOut(String(d)); });
        k.stderr.on('data', d => { err += d; if (err.length > 1e6) err = err.slice(-5e5); });
        k.on('close', c => { kids.delete(k); if (cancelled) return rej(new Error('cancelled')); if (c && !opts.allowFail) return rej(new Error(path.basename(args[0]) + ' exited ' + c + ': ' + (err || out).trim().split('\n').slice(-4).join(' | '))); res({ code: c, out, err }); });
      });
    },
  };
  return ctx;
}
async function kit(ctx, root, args) { const r = await ctx.spawn(root, [KIT, root].concat(args)); return JSON.parse(r.out.trim().split('\n').pop()); }
function metaOf(ctx, root) { const f = path.join(root, '.lab-meta.json'); const c = P.readJ(f); if (c) return Promise.resolve(c); return kit(ctx, root, ['meta']).then(m => { P.writeJ(f, m); return m; }); }

// pull, then the root to run in: the snapshot, or a private copy with live card_overrides laid over cards.json
async function prepare(ctx, params, needCopy) {
  ctx.log('pulling the latest game data');
  const snap = ctx.snap = await P.pull({ local: params.local, log: t => ctx.log(t) });
  snap.warnings && snap.warnings.forEach(w => ctx.log('warning: ' + w));
  ctx.log(`game ${String(snap.sha).slice(0, 7)} (${snap.date || ''}), data ${snap.dataHash}, ${snap.fetched} file(s) downloaded`);
  let root = snap.root, dataHash = snap.dataHash, live = null;
  if (params.live || needCopy) { root = P.workspace(snap, ctx.job.id); ctx.wsRoot = root; }
  if (params.live) { const rows = await P.liveOverrides(snap.root); live = P.applyOverrides(root, rows); dataHash = P.dataHash(root, 'live:' + live.hash); ctx.log(`live card_overrides: ${live.applied} card(s) laid over cards.json`); }
  return { snap, root, dataHash, live };
}
const base = (ctx, env, extra) => Object.assign({ id: ctx.job.id, sha: env.snap.sha, shaDate: env.snap.date, dataHash: env.dataHash, live: env.live, created: new Date().toISOString(), params: ctx.job.params, source: 'lab' }, extra);

// road rows over all cores: skirmish_pass.js measure shards, progress from the tag file
async function measureRows(ctx, root, o) {
  const W = num(o.workers, cores()), tag = o.tag, file = path.join(root, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), mine = [];
  const args = i => [path.join(root, 'tools', 'skirmish_pass.js'), 'measure', String(o.games), String(i), String(W), '--tag=' + tag]
    .concat(o.only ? ['--only=' + o.only] : [], o.seed != null ? ['--seed=' + o.seed] : [], o.maxmap != null && o.maxmap !== '' ? ['--maxmap=' + o.maxmap] : [], o.main ? ['--main'] : [], o.ref ? ['--ref=' + o.ref] : []);
  const lines = () => { try { return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).length; } catch (e) { return 0; } };
  const start = lines(), tick = setInterval(() => { const t = mine.reduce((a, b) => a + b, 0); ctx.progress(lines() - start, t || null, (o.label || 'measure') + ': fights done'); }, 2000);
  try { await Promise.all(Array.from({ length: W }, (_, i) => ctx.spawn(root, args(i), { onOut: s => { const m = /fights \d+ mine (\d+)/.exec(s); if (m) mine[i] = +m[1]; } }))); } finally { clearInterval(tick); }
  const byFight = {}; fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).forEach(l => { try { const r = JSON.parse(l); if (S.isRoadRow(r)) byFight[S.fightId(r)] = S.roadRow(Object.assign(r, o.ref ? { ref: o.ref } : {})); } catch (e) { /* torn line */ } });
  return Object.values(byFight);
}

// ---------------------------------------------------------------- the run kinds
const RUN = {};
RUN.measure = async (ctx, p) => {
  const env = await prepare(ctx, p), seed = p.seed === '' || p.seed == null ? freshSeed() : +p.seed, games = num(p.games, 40);
  const rows = await measureRows(ctx, env.root, { games, seed, only: p.only, maxmap: num(p.maxmap, 20), main: !!p.main, ref: p.ref || null, tag: 'lab-' + ctx.job.id, workers: p.workers });
  return base(ctx, env, { kind: 'road', tool: 'tools/skirmish_pass.js measure', label: p.label || `road ${games} games`, seed, games, rows, headline: S.rowsStatus(rows, 20) });
};

// "id", "id x3", "3x id", "id @4", "id x3 @4", separated by commas or new lines
function parseCards(text, known) {
  const out = []; String(text || '').split(/[\n,;]+/).map(s => s.trim()).filter(Boolean).forEach(s => {
    let m = /^(\d+)\s*x\s+(.+)$/i.exec(s), id = s, copies = null, level = null; if (m) { copies = +m[1]; id = m[2]; }
    m = /@\s*(\d+)\s*$/.exec(id); if (m) { level = +m[1]; id = id.slice(0, m.index).trim(); }
    m = /^(.+?)\s*[x×]\s*(\d+)$/i.exec(id); if (m) { id = m[1].trim(); copies = +m[2]; }
    id = id.toLowerCase().replace(/\s+/g, '-'); if (known && !known.has(id)) throw new Error('unknown card: ' + id);
    out.push({ id, copies, level });
  });
  return out;
}
async function optimiseDeck(ctx, root, o) {
  const meta = await metaOf(ctx, root), map = meta.maps.find(m => !m.side && m.no === +o.map); if (!map) throw new Error('no main map ' + o.map);
  const dirOut = path.join(root, 'docs', 'balance', 'lab', 'opt-' + o.tag), poolF = path.join(dirOut, 'pool.json');
  const copies = {}, levels = {}; o.cards.forEach(c => { copies[c.id] = c.copies; if (c.level != null) levels[c.id] = c.level; });
  P.writeJ(poolF, { maps: { [map.no]: { mapId: map.id, seeds: { lab: { pool: o.cards.map(c => c.id), copies, levels } } } } });
  const args = [path.join(root, 'tools', 'opt', 'deckopt.js'), '--map', String(map.no), '--mode', 'prog', '--prog-seed', 'lab', '--pool-file', poolF, '--budget', String(num(o.budget, 2000)),
    '--workers', String(num(o.workers, cores())), '--ladder', 'none', '--level', 'ref', '--out', dirOut, '--tag', o.tag, '--ckpt-dir', path.join(P.dir('runs'), ctx.job.id, 'ckpt'), '--seed', String(o.seed || 'bramble'), '--no-summary']
    .concat(o.leader ? ['--leader', o.leader] : [], String(o.extra || '').split(/\s+/).filter(Boolean)); // extra: any other deckopt option (deckopt --help)
  await ctx.spawn(root, args, { onOut: s => { const l = s.trim().split('\n').pop(); if (l) ctx.progress(null, null, 'Map ' + map.no + ': ' + l.slice(0, 140)); } });
  const f = fs.readdirSync(dirOut).find(x => /^deckopt-map.*\.json$/.test(x)); if (!f) throw new Error('deckopt wrote no result');
  const j = JSON.parse(fs.readFileSync(path.join(dirOut, f), 'utf8')), best = (j.optima && j.optima[0]) || (j.optimum && j.optimum.deck ? j.optimum : null) || (j.phase1 && j.phase1.best) || {};
  return { map, deck: best.deck || null, score: best.score != null ? best.score : best.fitness, road: j.road || [], optima: (j.optima || []).map(x => ({ deck: x.deck, score: x.score })), reproduce: j.reproduce, throughput: j.throughput };
}
RUN.optimise = async (ctx, p) => {
  const env = await prepare(ctx, p), meta = await metaOf(ctx, env.root), cards = parseCards(p.cards, new Set(meta.cards.map(c => c.id)));
  if (cards.length < 2) throw new Error('give at least two cards');
  const r = await optimiseDeck(ctx, env.root, { map: p.map, cards, budget: p.budget, workers: p.workers, seed: p.seed, leader: p.leader, extra: p.extra, tag: 'lab-' + ctx.job.id });
  return base(ctx, env, { kind: 'optimise', tool: 'tools/opt/deckopt.js --mode prog', label: `deck for Map ${p.map} from ${cards.length} cards`, cards, result: r,
    headline: { map: r.map.no, score: r.score, deck: r.deck } });
};

async function econ(ctx, root) {
  const f = path.join(root, 'docs', 'balance', 'lab', 'econ.json'); if (fs.existsSync(f)) return P.readJ(f); fs.mkdirSync(path.dirname(f), { recursive: true });
  await ctx.spawn(root, [path.join(root, 'tools', 'econ2', 'econ_sim_2026_11_03.js'), '--out', f, '--quiet']); return P.readJ(f);
}
const REPEAT_SOURCES = s => !['firstClear', 'mapPack', 'wins'].includes(s);
function profileDays(e, profile) {
  const sim = e.sim[profile] || e.sim.casual, dom = sim.daysOnMap || {}, days = {}; let acc = 0;
  for (let i = 0; i <= 21; i++) { days[i] = acc; acc += dom[i] || 0; }
  const inc = { gold: 0, gems: 0, dust: 0 }; Object.entries(sim.income || {}).filter(([s]) => REPEAT_SOURCES(s)).forEach(([, v]) => { ['gold', 'gems', 'dust'].forEach(k => { inc[k] += (v[k] || 0) / Math.max(1, sim.day); }); });
  return { days, farmIncome: inc, label: sim.label };
}
RUN.econ = async (ctx, p) => {
  const env = await prepare(ctx, p), e = await econ(ctx, env.root), prof = {};
  Object.keys(e.sim).forEach(k => { const s = e.sim[k]; prof[k] = { label: s.label, stages: s.stages, daysOnMap: s.daysOnMap, snaps: s.snaps, income: s.income, spent: s.spent, finished: s.finished, day: s.day }; });
  return base(ctx, env, { kind: 'econ', tool: 'tools/econ2/econ_sim_2026_11_03.js', label: 'economy (ECON2 players)', profiles: prof, road: e.road, assumptions: e.assumptions,
    headline: Object.fromEntries(Object.entries(prof).map(([k, v]) => [k, v.snaps && v.snaps[20] ? 'Map 20 on day ' + v.snaps[20].day : 'Map 20 not reached'])) });
};

RUN.journey = async (ctx, p) => {
  const env = await prepare(ctx, p), N = Math.min(24, num(p.to, 10)), seeds = Array.from({ length: Math.max(1, num(p.seeds, 5)) }, (_, i) => String(num(p.seedFrom, 1) + i));
  const e = await econ(ctx, env.root), prof = profileDays(e, p.profile || 'casual'), farmDays = num(p.farmDays, 30), W = Math.min(seeds.length, num(p.workers, cores()));
  ctx.log(`${seeds.length} players to Map ${N}, then ${farmDays} farming days (${prof.label}: ${Math.round(prof.farmIncome.gold)} Leaves, ${Math.round(prof.farmIncome.dust)} Dust a day)`);
  const tmp = path.join(P.dir('runs'), ctx.job.id), pf = path.join(tmp, 'journey-params.json'); P.writeJ(pf, { to: N, farmDays, farmIncome: prof.farmIncome });
  let done = 0; ctx.progress(0, seeds.length, 'players walked');
  const chunks = Array.from({ length: W }, (_, i) => seeds.filter((_, k) => k % W === i));
  const parts = await Promise.all(chunks.map(async (c, i) => { const o = path.join(tmp, 'journey-' + i + '.json'); await ctx.spawn(env.root, [KIT, env.root, 'journey', pf, o, c.join(',')]); done += c.length; ctx.progress(done, seeds.length, 'players walked'); return P.readJ(o, {}); }));
  const players = Object.assign({}, ...parts);
  // optional: the optimiser's deck at every K-th map (and Map N), from each player's own collection at its own levels
  if (p.deck === 'optimise') {
    const every = Math.max(1, num(p.optEvery, 5)), maps = [...new Set(Array.from({ length: N + 1 }, (_, i) => i).filter(i => i % every === 0).concat([N]))];
    let k = 0; for (const s of seeds) for (const i of maps) {
      const st = players[s].maps[i]; if (!st || !st.pool) continue; ctx.progress(k++, seeds.length * maps.length, `optimising player ${s} Map ${i}`);
      const cards = st.pool.pool.map(id => ({ id, copies: st.pool.copies[id], level: st.pool.levels[id] != null ? st.pool.levels[id] : null }));
      try { const r = await optimiseDeck(ctx, env.root, { map: i, cards, budget: num(p.budget, 1000), seed: 'lab-' + s, extra: p.extra, tag: `lab-${ctx.job.id}-s${s}-m${i}` }); if (r.deck) { st.deck = r.deck; st.optimised = true; st.optScore = r.score; } } catch (err) { ctx.log(`player ${s} Map ${i}: ${err.message}`); }
    }
  }
  // win rate vs every road fight of Maps 0..N with each player's deck of that map (a per-map reference set, tools/opt/ref_pool.js), then the farmed deck at Map N
  const seed = freshSeed(), refDir = path.join(env.root, 'docs', 'balance', 'ref'), games = num(p.games, 10), made = [];
  const meta = await metaOf(ctx, env.root), mapN = meta.maps.find(m => !m.side && m.no === N);
  try {
    for (const s of seeds) {
      const pl = players[s], decks = {}; Object.values(pl.maps).forEach(m => { if (m.deck) decks[m.map] = m.deck; });
      const id = `lab-${ctx.job.id}-s${s}`, f = path.join(refDir, id + '.json'); P.writeJ(f, { id, label: 'Lab journey player ' + s, decks }); made.push(f);
      ctx.log(`player ${s}: road fights of Maps 0-${N}`);
      pl.rows = await measureRows(ctx, env.root, { games, seed, maxmap: N, main: !p.side, ref: id, tag: id, label: 'player ' + s });
      const last = pl.farm[pl.farm.length - 1];
      if (last && last.deck && mapN) { const fid = id + '-farm', ff = path.join(refDir, fid + '.json'); P.writeJ(ff, { id: fid, label: 'Lab journey player ' + s + ' after farming', decks: { [N]: last.deck } }); made.push(ff);
        pl.farmRows = await measureRows(ctx, env.root, { games, seed, only: mapN.id, main: !p.side, ref: fid, tag: fid, label: 'player ' + s + ' farmed' }); }
      Object.values(pl.maps).forEach(m => { delete m.pool; });
    }
  } finally { made.forEach(f => fs.rmSync(f, { force: true })); }
  // per map: the players' mean win rate over the map's fights, against the mean band
  const summary = []; for (let i = 0; i <= N; i++) {
    const per = seeds.map(s => { const r = (players[s].rows || []).filter(x => x.mapNo === i && !x.side && !x.endless); return r.length ? { win: r.reduce((t, x) => t + x.win, 0) / r.length, lo: r.reduce((t, x) => t + x.lo, 0) / r.length, hi: r.reduce((t, x) => t + x.hi, 0) / r.length, target: r.reduce((t, x) => t + x.target, 0) / r.length } : null; }).filter(Boolean);
    const m = k => per.length ? per.reduce((t, x) => t + x[k], 0) / per.length : null, at = seeds.map(s => players[s].maps[i]).filter(Boolean);
    summary.push({ map: i, day: prof.days[i] != null && i <= 21 ? prof.days[i] : null, win: m('win'), lo: m('lo'), hi: m('hi'), target: m('target'), distinct: at.reduce((t, x) => t + x.distinct, 0) / Math.max(1, at.length), power: at.reduce((t, x) => t + (x.power || 0), 0) / Math.max(1, at.length), packBank: at.reduce((t, x) => t + x.packBank, 0) / Math.max(1, at.length), dust: at.reduce((t, x) => t + x.dust, 0) / Math.max(1, at.length) });
  }
  const farmWin = seeds.map(s => players[s].farmRows || []).flat(), mw = farmWin.length ? farmWin.reduce((t, x) => t + x.win, 0) / farmWin.length : null;
  return base(ctx, env, { kind: 'journey', tool: 'tools/lab/kit.js journey (ref5_prog walk + ref6 ladder deck) + skirmish_pass measure --ref', label: `F2P journey to Map ${N} + ${farmDays} days, ${seeds.length} players`, seed, games,
    profile: prof, players, summary, headline: { to: N, players: seeds.length, farmDays, winAtN: summary[N] && summary[N].win, winAtNFarmed: mw, dayAtN: prof.days[N] } });
};

RUN.whatif = async (ctx, p) => {
  const env = await prepare(ctx, p, true), card = String(p.card || '').trim(); if (!card) throw new Error('pick a card');
  const f = path.join(env.root, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(f, 'utf8')), c = cards.find(x => x.id === card); if (!c) throw new Error('no card ' + card);
  const before = {}, set = {}; ['cost', 'wait', 'attack', 'health', 'rarity'].forEach(k => { if (p[k] !== '' && p[k] != null) { before[k] = c[k]; set[k] = k === 'rarity' ? p[k] : +p[k]; } });
  if (p.effects) { before.effects = c.effects; set.effects = typeof p.effects === 'string' ? JSON.parse(p.effects) : p.effects; }
  if (!Object.keys(set).length) throw new Error('change at least one stat');
  Object.assign(c, set); fs.writeFileSync(f, JSON.stringify(cards));
  const editedHash = P.dataHash(env.root, 'whatif'), meta = await metaOf(ctx, env.snap.root);
  const aff = (await kit(ctx, env.snap.root, ['affected', card])).fights.filter(id => { const ff = meta.fights.find(x => x.id === id); return !ff || ff.mapNo == null || ff.mapNo <= num(p.maxmap, 20); });
  if (!aff.length) throw new Error(card + ' is in no road fight\'s deck and no reference deck up to Map ' + num(p.maxmap, 20));
  const only = [...new Set(aff.map(x => x.split(':')[1]))].join(','), seed = p.seed === '' || p.seed == null ? freshSeed() : +p.seed, games = num(p.games, 40);
  ctx.log(`${aff.length} fight(s) hold ${card}; measuring before and after on the same seeds`);
  const was = await measureRows(ctx, env.snap.root, { games, seed, only, tag: 'lab-' + ctx.job.id + '-before', label: 'before' });
  const now = await measureRows(ctx, env.root, { games, seed, only, tag: 'lab-' + ctx.job.id + '-after', label: 'after' });
  S.save(base(ctx, env, { id: ctx.job.id + '-base', kind: 'road', dataHash: env.snap.dataHash, tool: 'tools/skirmish_pass.js measure (what-if baseline)', label: 'what-if baseline ' + card, seed, games, rows: was.filter(r => aff.includes(S.fightId(r))) }));
  const rows = now.filter(r => aff.includes(S.fightId(r))).map(r => { const b = was.find(x => S.fightId(x) === S.fightId(r)) || {}; return { id: S.fightId(r), code: r.code || r.key, name: r.name, mapNo: r.mapNo, target: r.target, lo: r.lo, hi: r.hi, before: b.win, after: r.win, delta: r.win - b.win, games }; });
  return base(ctx, env, { kind: 'whatif', dataHash: editedHash, tool: 'tools/skirmish_pass.js measure on an edited cards.json (never written back)', label: `what-if ${card} ${JSON.stringify(set)}`, card, before, set, seed, games, rows,
    headline: { fights: rows.length, meanDelta: rows.reduce((t, r) => t + r.delta, 0) / Math.max(1, rows.length) } });
};

RUN.tool = async (ctx, p) => {
  const pr = PRESETS[p.preset]; if (!pr) throw new Error('unknown tool ' + p.preset);
  const env = await prepare(ctx, p, true), vals = Object.assign({ workers: cores(), id: ctx.job.id }, pr.defaults, p.args || {});
  const args = pr.cmd.replace(/\{(\w+)\}/g, (_, k) => String(vals[k] != null ? vals[k] : '')).split(/\s+/).filter(Boolean);
  const bal = path.join(env.root, 'docs', 'balance'), before = {};
  const each = (d, fn) => { if (fs.existsSync(d)) fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const q = path.join(d, e.name); if (e.isDirectory()) each(q, fn); else fn(q); }); };
  each(bal, q => { before[q] = fs.statSync(q).mtimeMs; });
  ctx.log('node ' + args.join(' ')); let lines = 0;
  const r = await ctx.spawn(env.root, [path.join(env.root, args[0])].concat(args.slice(1)), { allowFail: true, onOut: s => { lines += s.split('\n').length - 1; ctx.progress(null, null, s.trim().split('\n').pop().slice(0, 140)); } });
  const outDir = path.join(P.dir('runs'), ctx.job.id, 'out'), files = [];
  each(bal, q => { if (before[q] === fs.statSync(q).mtimeMs) return; const rel = path.relative(bal, q); fs.mkdirSync(path.dirname(path.join(outDir, rel)), { recursive: true }); fs.copyFileSync(q, path.join(outDir, rel)); files.push(rel); });
  const roadFiles = files.filter(f => /\.jsonl$/.test(f)); let rows = [];
  roadFiles.forEach(f => fs.readFileSync(path.join(outDir, f), 'utf8').split('\n').forEach(l => { try { const x = JSON.parse(l); if (S.isRoadRow(x) && x.target != null) rows.push(S.roadRow(x)); } catch (e) { /* not a row */ } }));
  return base(ctx, env, { kind: 'tool', tool: 'node ' + args.join(' '), label: pr.label, exit: r.code, outDir, files, tail: (r.out + (r.code ? '\n' + r.err : '')).trim().split('\n').slice(-60), rows: rows.length ? rows : undefined,
    headline: { exit: r.code, files: files.length, last: (r.out.trim().split('\n').pop() || '').slice(0, 160) } });
};

RUN.import = async (ctx, p) => {
  const snap = ctx.snap = await P.pull({ local: p.local, log: t => ctx.log(t) });
  const r = await I.importRoad(snap, { log: t => { ctx.log(t); }, maxDates: p.maxDates });
  ctx.log(`road history: ${r.added} new file(s), ${r.skipped} already in, ${r.files} .jsonl files`); return null;
};

// a finished run keeps only what a tool wrote (out/); its working files go
function tidy(id) { const d = path.join(P.dir('runs'), id); if (fs.existsSync(d)) fs.readdirSync(d).filter(x => x !== 'out').forEach(x => fs.rmSync(path.join(d, x), { recursive: true, force: true })); }

// ---------------------------------------------------------------- the queue
class Queue {
  constructor() { this.jobs = P.readJ(qFile(), []); this.jobs.forEach(j => { if (j.status === 'running') j.status = 'queued'; }); this.ctx = null; this.listeners = []; }
  // jobs another process added (lab queue add) are merged in, never overwritten
  merge() { const known = new Set(this.jobs.map(j => j.id)); P.readJ(qFile(), []).forEach(j => { if (!known.has(j.id)) this.jobs.push(j); }); }
  save() { this.merge(); P.writeJ(qFile(), this.jobs.slice(-200)); this.listeners.forEach(f => f()); }
  add(type, params) { if (!RUN[type]) throw new Error('unknown run kind ' + type); const j = { id: newId(), type, params: params || {}, status: 'queued', created: new Date().toISOString(), log: [], progress: null }; this.jobs.push(j); this.save(); this.kick(); return j; }
  cancel(id) { const j = this.jobs.find(x => x.id === id); if (!j) return false; if (j.status === 'queued') { j.status = 'cancelled'; this.save(); } else if (j.status === 'running' && this.ctx && this.ctx.job === j) this.ctx.cancel(); return true; }
  // one queue runner per machine (the UI or `lab queue run`): queue.lock holds its pid
  lock() { const f = path.join(P.home(), 'queue.lock'), pid = +(fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : 0); if (pid && pid !== process.pid) { try { process.kill(pid, 0); return false; } catch (e) { /* stale */ } } fs.writeFileSync(f, String(process.pid)); return true; }
  kick() { if (this.running || this.paused) return; this.merge(); const j = this.jobs.find(x => x.status === 'queued'); if (!j) { if (this.onIdle) this.onIdle(); return; } if (!this.lock()) { setTimeout(() => this.kick(), 30000); return; } this.run(j).then(() => this.kick()); }
  async run(j) {
    this.running = true; j.status = 'running'; j.started = new Date().toISOString(); let last = 0;
    const ctx = this.ctx = context(j, () => { if (Date.now() - last > 500) { last = Date.now(); this.save(); } });
    try { const rec = await RUN[j.type](ctx, j.params); if (rec) { rec.ms = Date.now() - Date.parse(j.started); S.save(rec); j.record = rec.id; } j.status = 'done'; ctx.log('done'); tidy(j.id); }
    catch (e) { j.status = ctx.cancelled ? 'cancelled' : 'failed'; j.error = e.message; ctx.log((ctx.cancelled ? 'cancelled' : 'failed: ') + (ctx.cancelled ? '' : e.message)); }
    finally { if (ctx.wsRoot) fs.rmSync(ctx.wsRoot, { recursive: true, force: true }); j.ended = new Date().toISOString(); this.running = false; this.ctx = null; this.save(); }
  }
}
// run one job now, in this process (the CLI); prints its log
async function runNow(type, params, print) {
  const j = { id: newId(), type, params, status: 'running', log: [], started: new Date().toISOString() }; let shown = 0, lastP = '';
  const ctx = context(j, () => { while (shown < j.log.length) print(j.log[shown++]); const pr = j.progress; const t = pr ? `${pr.text} ${pr.done != null ? pr.done : ''}${pr.total ? '/' + pr.total : ''}` : ''; if (t && t !== lastP && process.stderr.isTTY) { process.stderr.write('\r' + t.slice(0, 100).padEnd(100)); lastP = t; } });
  process.on('SIGINT', () => { ctx.cancel(); });
  try { const rec = await RUN[type](ctx, params); if (rec) { rec.ms = Date.now() - Date.parse(j.started); S.save(rec); } tidy(j.id); while (shown < j.log.length) print(j.log[shown++]); return rec; }
  finally { if (ctx.wsRoot) fs.rmSync(ctx.wsRoot, { recursive: true, force: true }); }
}
module.exports = { Queue, runNow, RUN, PRESETS, parseCards, freshSeed, cores, metaOf, context };
