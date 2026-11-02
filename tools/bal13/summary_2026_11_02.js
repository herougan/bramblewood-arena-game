#!/usr/bin/env node
// 2026-11-02 (package BAL13, owner 19:56): the balance summary that goes into every owner report. Per map (every entry of the reference ladder,
// docs/balance/ref/ref-ladder.json: Maps 0-20 and their side maps):
//   (a) the mean win rate of the 10 ladder decks against the map's weakest decks (its WPRO decks) and against its strongest decks (its BPRO
//       decks), each pairing played as the game builds that PRO fight (tools/opt/pro_ease.js gameProNode: the PRO deck at Level 1, its showcase
//       leader, the map's castle, the entry's average field, the Smart CPU), the ladder deck at the Map reference's level, no leader;
//   (b) the weakest (rank 1) and the strongest (rank 10) ladder deck's win rate against the map's road fights (the road measure's fights, its
//       seeds 9100 + 37g), beside the Map reference's and the mean road target, map by map, so the spread over the road shows;
//   (c) the road totals from the road measure (the Map reference, 40 games a fight): fights in the green band (target +/- 8), within 10
//       points, beyond 20 points, out of all, and the list of fights more than 20 points off.
//
//   + the Map reference against the map's strongest deck (BPRO-1, --strong-games 40) and the owner's flag (20:19): above 15% is "OVER";
//   node tools/bal13/summary_2026_11_02.js [--road <tag>] [--games 12] [--road-games 20] [--strong-games 40] [--workers 2] [--maps 0-20] [--date YYYY-MM-DD]
//
// --road <tag>: read docs/balance/skirmish-pass-<tag>.jsonl (tools/skirmish_pass.js measure 40 ... --tag=<tag> --maxmap=20). Without it the tool
// runs that measure itself (tag summary-<date>, --workers shards; resumable: a fight already in the file is not played again) and reads it.
// Output: docs/balance/bal13/summary-<date>.md (the tables) and summary-<date>.json beside it. The per-map games are cached in
// docs/balance/bal13/state/ by the inputs' fingerprint (the app, engine, cards, budget, PRO decks, ladder, settings), so a re-run with nothing
// changed plays nothing, and a stopped run resumes. Seeds: (a) fnv("bal13|<PRO id>|rank<r>") + 37g; (b) 9100 + 37g.
// Cost at the defaults: (a) 10 decks x (WPRO + BPRO decks, 3-6) x 12 games, (b) 2 decks x the map's fights x 20 games: about 600-900 games a map,
// 36 maps, plus the road measure (241 fights x 40 games); about 15 minutes on 2 free cores.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('../opt/deckopt.js'), PE = require('../opt/pro_ease.js');
const VERSION = '1.1.0 (2026-11-02, BAL13: with leaders)';
const LL = require('./lib_leader_2026_11_02.js'); // owner 21:37: every reference deck plays with a leader
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const DATE = arg('--date', new Date().toISOString().slice(0, 10)), GAMES = +arg('--games', 12), RGAMES = +arg('--road-games', 20), SGAMES = +arg('--strong-games', 40), W = +arg('--workers', 2);
// 2026-11-02 (coordinator 20:19, owner): the Map reference should win at most 15% against the map's strongest deck (its BPRO-1); a map above it is flagged
const STRONG_CAP = 0.15;
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal13'), STATE = path.join(OUTDIR, 'state');
const LADDER = path.join(ROOT, 'docs', 'balance', 'ref', 'ref-ladder.json'), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const pc = x => x == null ? null : Math.round(x * 1000) / 10;
const mean = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : null;
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(/^\d+$/.test(p) ? +p : p); }); return out; }
const ROAD_TAG = arg('--road', 'summary-' + DATE), ROAD_FILE = path.join(ROOT, 'docs', 'balance', `skirmish-pass-${ROAD_TAG}.jsonl`);
function roadRows() { const by = {}; if (!fs.existsSync(ROAD_FILE)) return [];
  fs.readFileSync(ROAD_FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && r.curve !== false); }
function fingerprint() {
  const files = ['arena_app.js', 'bramblewood-engine.js', 'canonical/cards.json', 'bramblewood-budget.js', 'canonical/pro-skirmishes.json', 'docs/balance/ref/ref-ladder.json'].map(f => sha(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return sha(JSON.stringify([VERSION, files, sha(fs.readFileSync(path.join(__dirname, 'lib_leader_2026_11_02.js'), 'utf8')), ROAD_TAG, GAMES, RGAMES, SGAMES]));
}
// one map: (a) and (b)
function mapRow(gm, id, L, ent, rows, ai) {
  const G = gm.G, map = G.CONQUEST_MAPS.find(m => m.id === id), decks = L.decks.slice().sort((a, b) => a.rank - b.rank), t0 = Date.now();
  const leader = LL.leaderFor(gm, map); // every reference deck here (the ladder's and the Map reference) plays the leader a player holds at this map
  const vs = kind => { const out = []; (ent && ent[kind] || []).forEach(e => { const node = PE.gameProNode(gm, map, e, ent, ai);
    decks.forEach(d => { const seed0 = fnv('bal13|' + e.id + '|rank' + d.rank), ctx = LL.setupLed(gm, map.id, node, { deck: d.counts, seed0 }, d.leader || leader); let w = 0;
      for (let g = 0; g < GAMES; g++) if (LL.playLed(gm, ctx, g).win) w++; out.push({ opp: e.id, rank: d.rank, win: w / GAMES }); }); }); return out; };
  const wpro = vs('wpro'), bpro = vs('bpro');
  // the Map reference (the road measure's player: the road deck at referencePlayerLevel) against the map's strongest deck, BPRO-1
  let mapRefStrong = null; const b1 = ent && (ent.bpro || [])[0];
  if (b1) { const node = PE.gameProNode(gm, map, b1, ent, ai), ctx = LL.setupLed(gm, map.id, node, { seed0: fnv('bal13|mapref|' + b1.id) }, leader); let w = 0;
    for (let g = 0; g < SGAMES; g++) if (LL.playLed(gm, ctx, g).win) w++; mapRefStrong = { opp: b1.id, win: w / SGAMES, games: SGAMES }; }
  const mine = rows.filter(r => r.map === id), road = (deck) => mine.map(r => { const node = map.nodes.find(n => n.key === r.key); G.NODE_MAP_HINT.set(node, id);
    const x = LL.simulateLed(gm, id, node, RGAMES, { seed0: 9100, deck }, leader); return { key: r.key, code: r.code, win: x.win, target: r.target / 100 }; });
  const weak = road(decks[0].counts), strong = road(decks[decks.length - 1].counts);
  // (c) the Map reference against the road WITH its leader: the road measure's fights, 40 games, its seeds (9100 + 37g)
  const roadLed = mine.map(r => { const node = map.nodes.find(n => n.key === r.key); G.NODE_MAP_HINT.set(node, id); const x = LL.simulateLed(gm, id, node, 40, { seed0: 9100 }, leader);
    const win = Math.round(x.win * 1000) / 10; return Object.assign({}, r, { win, noLeaderWin: r.win, leader, leaderPlayed: x.leaderPlayed, green: win > r.hi + 1e-9 ? 'easy' : win < r.lo - 1e-9 ? 'hard' : 'green', ms: undefined, deck: undefined }); });
  const code = ((map.nodes || []).find(n => n.code) || {}).code || mine.map(r => r.code)[0] || '', label = map.sub && /^\d+-[A-Z]+-/.test(code) ? code.replace(/-\d+$/, '') : String(L.map);
  return { id, map: L.map, label, side: L.side, name: L.name, fights: mine.length, leader, mapRefStrong, roadLed,
    wpro: { n: wpro.length, opps: [...new Set(wpro.map(x => x.opp))], mean: mean(wpro.map(x => x.win)), byRank: decks.map(d => mean(wpro.filter(x => x.rank === d.rank).map(x => x.win))) },
    bpro: { n: bpro.length, opps: [...new Set(bpro.map(x => x.opp))], mean: mean(bpro.map(x => x.win)), byRank: decks.map(d => mean(bpro.filter(x => x.rank === d.rank).map(x => x.win))) },
    road: { target: mean(mine.map(r => r.target / 100)), mapRef: mean(roadLed.map(r => r.win / 100)), mapRefNoLeader: mean(mine.map(r => r.win / 100)), weakest: mean(weak.map(x => x.win)), strongest: mean(strong.map(x => x.win)), weakFights: weak, strongFights: strong },
    ms: Date.now() - t0 };
}
function runShard(list, fp) {
  const gm = O.loadGame(ROOT), lad = JSON.parse(fs.readFileSync(LADDER, 'utf8')).ladder, pro = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), ai = (pro.rule || {}).ai != null ? pro.rule.ai : 1, rows = roadRows();
  fs.mkdirSync(STATE, { recursive: true });
  for (const id of list) { const f = path.join(STATE, `${fp}-${id}.json`); if (fs.existsSync(f)) continue;
    const r = mapRow(gm, id, lad[id], pro.maps[id], rows, ai); fs.writeFileSync(f, JSON.stringify(r) + '\n'); console.log(`${id} vs WPRO ${pc(r.wpro.mean)} vs BPRO ${pc(r.bpro.mean)} road weakest ${pc(r.road.weakest)} strongest ${pc(r.road.strongest)} (${Math.round(r.ms / 1000)} s)`); }
}
function forkAll(args, n) { return Promise.all(Array.from({ length: n }, (x, i) => new Promise(res => { const c = cp.fork(__filename, args(i), { stdio: 'inherit' }); c.on('exit', code => res(code)); }))); }
function spawnRoad(n) { return Promise.all(Array.from({ length: n }, (x, i) => new Promise(res => { const c = cp.spawn(process.execPath, [path.join(ROOT, 'tools', 'skirmish_pass.js'), 'measure', '40', String(i), String(n), '--tag=' + ROAD_TAG, '--maxmap=20'], { stdio: ['ignore', 'ignore', 'inherit'] }); c.on('exit', code => res(code)); }))); }
function report(fp, ids) {
  const gm = { D: require(path.join(ROOT, 'tools', 'lib_bramble.js')).CARD_DEFS_BASELINE };
  const lad = JSON.parse(fs.readFileSync(LADDER, 'utf8')), rows0 = roadRows(), per = ids.map(id => { const f = path.join(STATE, `${fp}-${id}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; }).filter(Boolean);
  per.sort((a, b) => a.map - b.map || (a.side ? 1 : 0) - (b.side ? 1 : 0) || (a.id < b.id ? -1 : 1));
  // (c) with leaders: the ladder maps' fights measured with the leader; a road fight of a map with no ladder entry keeps its no-leader reading
  const led = {}; per.forEach(p => (p.roadLed || []).forEach(r => { led[r.map + ':' + r.key] = r; }));
  const rows = rows0.map(r => led[r.map + ':' + r.key] || Object.assign({}, r, { noLeader: true }));
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${ROAD_TAG}-led.jsonl`), rows.map(r => JSON.stringify(r)).join('\n') + '\n'); // tools/bal13/card_flags_2026_11_02.js --road <tag>-led
  const gap0 = r => r.win - r.target, nl = { green: rows0.filter(r => r.green === 'green').length, w10: rows0.filter(r => Math.abs(gap0(r)) <= 10).length, o20: rows0.filter(r => Math.abs(gap0(r)) > 20).length };
  const gap = r => r.win - r.target, all = rows.length, green = rows.filter(r => r.green === 'green').length, w10 = rows.filter(r => Math.abs(gap(r)) <= 10).length, o20 = rows.filter(r => Math.abs(gap(r)) > 20);
  const f = x => x == null ? '-' : String(pc(x)), g = (x, t) => x == null ? '-' : `${pc(x)} (${x - t >= 0 ? '+' : ''}${Math.round((x - t) * 100)})`;
  const L = [`# Balance summary, ${DATE}`, '', `Tool: \`node tools/bal13/summary_2026_11_02.js --road ${ROAD_TAG} --games ${GAMES} --road-games ${RGAMES}\` (${VERSION}). Reference ladder: \`docs/balance/ref/ref-ladder.json\` (${lad.built}, 10 decks a map, rank 1 weakest .. rank 10 strongest). Road measure: \`docs/balance/skirmish-pass-${ROAD_TAG}.jsonl\` (the Map reference, 40 games a fight, seeds 9100 + 37g). Procedure: \`docs/evaluation-protocol.md\` section 4a.`, '',
    `**Leaders:** every number here is played WITH leaders (owner 2026-11-02 21:37). The enemy decks keep their own (the game's skirmish / PRO leaders). Your seat plays the leader a player holds at the map (tools/bal13/lib_leader_2026_11_02.js leaderFor: the strongest card that may lead in the map-true pool, else the Wandering Traveller), summoned by your seat's AI as the CPU summons its own; the per-map leader is in the table. This stands in for FIX6's leader-dealing helper.`, '',
    `## Road totals (the Map reference, with its leader)`, '', `${all} road fights: **${green} in the green band** (target +/- 8), ${w10} within 10 points, **${o20.length} beyond 20 points**. Without a leader (the standard road measure, \`skirmish-pass-${ROAD_TAG}.jsonl\`): ${nl.green} green, ${nl.w10} within 10, ${nl.o20} beyond 20.${rows.some(r => r.noLeader) ? ' (' + rows.filter(r => r.noLeader).length + ' fights of maps with no ladder entry keep their no-leader reading.)' : ''}`, '',
    `## Per map`, '', `(a) the ladder's mean win rate against the map's WPRO decks (its weakest decks) and its BPRO decks (its strongest), ${GAMES} games a pairing (10 decks x each WPRO / BPRO deck). (b) the weakest (rank 1) and strongest (rank 10) ladder deck against the map's road fights, ${RGAMES} games a fight (the gap to the mean road target in points), beside the Map reference (40 games a fight).`, '',
    `Flag (owner 2026-11-02 20:19): the Map reference should win at most ${pc(STRONG_CAP)}% against the map's strongest deck (BPRO-1, ${SGAMES} games); "OVER" marks a map above it.`, '',
    '| Map | Your leader | (a) vs WPRO | (a) vs BPRO | Map ref vs BPRO-1 | Flag | (b) weakest ref vs road | (b) strongest ref vs road | Map reference vs road | Road target | Green / fights |', '|---|---|---|---|---|---|---|---|---|---|---|'];
  per.forEach(p => { const mine = rows.filter(r => r.map === p.id), gr = mine.filter(r => r.green === 'green').length, ms = p.mapRefStrong;
    L.push(`| ${p.label || p.map} ${p.name} | ${(gm.D[p.leader] || {}).name || p.leader} | ${f(p.wpro.mean)} | ${f(p.bpro.mean)} | ${ms ? f(ms.win) : '-'} | ${ms && ms.win > STRONG_CAP + 1e-9 ? 'OVER' : ''} | ${mine.length ? g(p.road.weakest, p.road.target) : '-'} | ${mine.length ? g(p.road.strongest, p.road.target) : '-'} | ${mine.length ? g(p.road.mapRef, p.road.target) : '-'} | ${f(p.road.target)} | ${gr} / ${mine.length} |`); });
  const mm = k => mean(per.map(p => p[k].mean).filter(x => x != null)), mr = k => mean(per.map(p => p.road[k]).filter(x => x != null));
  const over = per.filter(p => p.mapRefStrong && p.mapRefStrong.win > STRONG_CAP + 1e-9);
  L.push(`| **All maps (mean)** | | ${f(mm('wpro'))} | ${f(mm('bpro'))} | ${f(mean(per.filter(p => p.mapRefStrong).map(p => p.mapRefStrong.win)))} | ${over.length} OVER | ${f(mr('weakest'))} | ${f(mr('strongest'))} | ${f(mr('mapRef'))} | ${f(mr('target'))} | ${green} / ${all} |`);
  L.push('', `## Fights more than 20 points off (${o20.length})`, '', '| Fight | Map | Kind | Win | Target | Gap |', '|---|---|---|---|---|---|');
  o20.sort((a, b) => Math.abs(gap(b)) - Math.abs(gap(a))).forEach(r => L.push(`| ${r.code} ${r.name} | ${r.mapNo}${r.side ? ' ' + r.map : ''} ${r.mapName} | ${r.kind} | ${r.win} | ${Math.round(r.target * 10) / 10} | ${gap(r) > 0 ? '+' : ''}${Math.round(gap(r))} (${gap(r) > 0 ? 'too easy' : 'too hard'}) |`));
  const missing = ids.filter(id => !per.some(p => p.id === id)); if (missing.length) L.push('', 'Not measured (no state): ' + missing.join(', '));
  const md = L.join('\n') + '\n', base = path.join(OUTDIR, `summary-${DATE}`);
  fs.mkdirSync(OUTDIR, { recursive: true }); fs.writeFileSync(base + '.md', md);
  fs.writeFileSync(base + '.json', JSON.stringify({ about: 'BAL13 balance summary (tools/bal13/summary_2026_11_02.js)', tool: VERSION, date: DATE, fingerprint: fp, settings: { leaders: true, road: ROAD_TAG, games: GAMES, roadGames: RGAMES, strongGames: SGAMES, roadMeasureGames: 40 },
    strongCap: STRONG_CAP, overStrongCap: over.map(p => ({ id: p.id, label: p.label, name: p.name, win: p.mapRefStrong.win })),
    totalsNoLeader: nl, totals: { fights: all, green, within10: w10, beyond20: o20.length, beyond20Fights: o20.map(r => ({ code: r.code, map: r.map, win: r.win, target: r.target })) }, maps: per }, null, 1) + '\n');
  console.log(md); console.log('-> ' + path.relative(ROOT, base) + '.md / .json');
}
async function main() {
  const shard = arg('--shard', null), fp = arg('--fp', null) || fingerprint(), want = mapRange(arg('--maps', null));
  const lad = JSON.parse(fs.readFileSync(LADDER, 'utf8')).ladder, ids = Object.keys(lad).filter(id => !want || want.has(lad[id].map) || want.has(id));
  if (shard) { const [i, n] = shard.split('/').map(Number); return runShard(ids.filter((x, k) => k % n === i), fp); }
  if (!arg('--road', null)) { console.log('road measure -> ' + path.relative(ROOT, ROAD_FILE)); await spawnRoad(Math.max(1, W)); }
  if (!fs.existsSync(ROAD_FILE)) throw new Error('no road measure ' + ROAD_FILE);
  const base = argv.filter((a, i) => !['--workers', '--shard', '--fp'].includes(a) && !['--workers', '--shard', '--fp'].includes(argv[i - 1]));
  if (W > 1) await forkAll(i => base.concat(['--shard', `${i}/${W}`, '--fp', fp]), W); else runShard(ids, fp);
  report(fp, ids);
}
if (require.main === module) main().catch(e => { console.error(e.stack || e); process.exit(1); });
module.exports = { mapRow, VERSION };
