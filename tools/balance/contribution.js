#!/usr/bin/env node
// 2026-10-27 (package BAL6, K5, owner 10-27 11:22: "In the Master hub, also show the general 'contribution' of each card with our myriad
// testing. For example Owl Nightwatch is TOO strong. I have run it in game but i assume its local only. maybe test w 30 hp brambles w random
// effects"): each card's contribution to winning, measured over many random CPU-vs-CPU fights. Measurement only: no card, deck or game
// code changes.
//
//   node tools/balance/contribution.js --games 100000 --workers 2      the full run (resumable: --resume)
//   node tools/balance/contribution.js --quick                         2,000 fights, a smoke check of the pipeline (tag "quick")
//   node tools/balance/contribution.js --analyze --resume              re-run only the analysis on the finished fights
//   node tools/balance/contribution.js --check                         self-checks (no games): deck legality, determinism, the solver
//
// One fight (fight i is a pure function of --seed and i, so any worker count gives the same results):
//   - two random legal 20-card decks from the fieldable cards (randomDeck: 6-14 different cards, copies within the rarity's copy cap and the
//     budget's top-rank caps, deckopt.canAdd); fieldable = every card with stats that can sit in a deck, whatever its source (owner 10-28 09:48:
//     "Cards like Owl Nightwatch somehow is not included in the testlab testing"; the first run left out the 93 source-"unsorted" cards),
//     not a token, test, hero, Hall of Fame, leader, spell, Materia, equipment or Easter egg (the stale `unattainable` flag is not read);
//   - both brambles a plain 30 Health (in-engine Health, no abilities; the road's plain bramble is 30 halved by BRAMBLE_SCALE = 15);
//   - one field picked at random from the maps' rule pool: every road fight's fightRules (all maps, raids and the tutorial left out), each
//     fight one entry, so a common field (day / night cycle, Mist, a terrain) comes up as often as the maps use it;
//   - the Smart CPU (skill 1) on both sides, both decks at Level 1, no leaders, seats swapped every other fight (deckopt.playOne's fair mirror).
// The measures (per card):
//   - raw: the win rate of the decks holding it minus the win rate of the decks without it (draws count 1/2);
//   - per copy: a ridge regression of the result on the copy-count difference (deck A minus deck B, one column per card, plus the seat),
//     beta = win-rate points one copy adds against an average copy of the pool (decks are always 20 cards, so the betas are relative: they
//     sum to 0). This controls for the rest of the deck. Standard errors: the sandwich form sigma^2 A^-1 M A^-1;
//   - contribution = beta x the mean copies a deck holds when it has the card: what including it at its usual count is worth;
//   - against its rarity band: contribution minus the band's median (bands: starter, common, uncommon, rare, very rare and up), z = that
//     over its standard error. The top 20 each way are the too-strong / too-weak lists.
//   - confidence: split-half reliability (the betas fitted on even and odd fights, their correlation, Spearman-Brown) and each card's 95% interval.
// Output: docs/balance/contribution-<tag>.json (+ .md). The fights' results are kept in the JSON (`outcomes`, one character a fight), so the
// analysis can be re-run (--analyze) without playing again.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const VERSION = '1.0.0 (2026-10-27, BAL6)';
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));

const BRAMBLE = 30, LEVEL = 1, AI = 1, DECK = 20;
const BANDS = { starter: 'starter', common: 'common', uncommon: 'uncommon', rare: 'rare' }; // everything rarer: 'veryrare+'
const bandOf = r => BANDS[r] || 'veryrare+';
const BAND_ORDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare+'];
// 2026-10-28 (owner 09:48): cards the owner has called out, flagged as outliers whatever their rank ("owner"), with his note
const WATCH = { 'owl-nightwatch': 'Owner 10-28 09:48: "clearly too strong": Nocturnal +4/+0 makes it 5 Attack at night; the editor prices its Nocturnal at 2.5, and canonical/skill-costs.json prices nocturnal at a fixed 1 (scale "fixed") whatever its N, so +4 costs what +1 does.' };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const r4 = v => v == null || !isFinite(v) ? null : Math.round(v * 10000) / 10000;

function parseArgs(argv) {
  const o = { games: 100000, workers: Math.max(1, Math.min(os.cpus().length, 8)), seed: 'bal6', tag: null, resume: false, quick: false, analyze: false, check: false, chunk: 200, lambda: 2,
    out: path.join(ROOT, 'docs', 'balance'), ckptDir: path.join(os.tmpdir(), 'contribution'), quiet: false };
  const a = argv.slice();
  while (a.length) { const k = a.shift();
    switch (k) {
      case '--games': o.games = +a.shift(); break; case '--workers': case '-j': o.workers = +a.shift(); break; case '--seed': o.seed = a.shift(); break;
      case '--tag': o.tag = a.shift(); break; case '--resume': o.resume = true; break; case '--quick': o.quick = true; break; case '--analyze': o.analyze = true; break;
      case '--check': o.check = true; break; case '--chunk': o.chunk = +a.shift(); break; case '--lambda': o.lambda = +a.shift(); break;
      case '--out': o.out = path.resolve(a.shift()); break; case '--ckpt-dir': o.ckptDir = a.shift(); break; case '--quiet': o.quiet = true; break;
      case '--help': case '-h': o.help = true; break; default: throw new Error('unknown option ' + k);
    } }
  if (o.quick) { o.games = Math.min(o.games, 2000); o.tag = o.tag || 'quick'; }
  o.tag = o.tag || new Date().toISOString().slice(0, 10);
  return o;
}

// ---------------------------------------------------------------- the setup (the same in the main thread and every worker)
function fieldable(gm, id) {
  const d = gm.D[id], G = gm.G; if (!d) return false;
  if (d.token || d.test || d.hero || d.hallOfFame || d.pool || d.easterEgg || id === 'wandering-traveller' || id === 'missingno') return false;
  if (d.cardType === 'materia' || d.cardType === 'equipment' || d.cardType === 'spell' || d.equip) return false;
  if ((d.effects || {}).leader || (d.archetypes || []).includes('Leader')) return false;
  if (d.attack == null && d.health == null) return false;
  return !!G.cardSourceOf(d); // 2026-10-28 (BAL6, owner 09:48): any source; was base / pack / map / raid / nest / smith / secret / quest
}
function setupOf(gm) {
  const G = gm.G, cards = Object.keys(gm.D).filter(id => fieldable(gm, id)).sort(), fields = [];
  G.CONQUEST_MAPS.filter(m => !m.reserved && m.id !== 'mtut').forEach(m => O.fightsOf(m).forEach(n => fields.push({ at: m.id + ':' + n.key, rules: G.fightRules(m.id, n) || {} })));
  return { cards, fields };
}
// a random legal deck: k different cards (6-14), then copies dealt among them within the caps; more cards when they cannot fill 20
function randomDeck(gm, cards, rng) {
  const d = {}, pick = [], k = 6 + Math.floor(rng.next() * 9); let guard = 0;
  while (pick.length < k && guard++ < 400) { const id = cards[Math.floor(rng.next() * cards.length)]; if (!pick.includes(id) && O.canAdd(gm, d, id)) { pick.push(id); d[id] = 1; } }
  let n = pick.length; guard = 0;
  while (n < DECK && guard++ < 2000) {
    const open = pick.filter(id => O.canAdd(gm, d, id));
    if (!open.length) { const id = cards[Math.floor(rng.next() * cards.length)]; if (!d[id] && O.canAdd(gm, d, id)) { pick.push(id); d[id] = 1; n++; } continue; }
    const id = open[Math.floor(rng.next() * open.length)]; d[id] = (d[id] || 0) + 1; n++;
  }
  if (n !== DECK) throw new Error('randomDeck: could not build a legal deck');
  return d;
}
function fightOf(gm, S, seed, i) {
  const rng = O.mulberry(fnv(seed + '|fight|' + i));
  const a = randomDeck(gm, S.cards, rng), b = randomDeck(gm, S.cards, rng), f = Math.floor(rng.next() * S.fields.length);
  return { a, b, f };
}
// the game, ready to play: the fair mirror of deckopt.playOne with a plain 30-Health bramble on both sides
function makePlayer(gm, S, seed) {
  const G = gm.G, defs = G.referenceBaseDefs(), castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: BRAMBLE, rarity: 'common', archetypes: ['Castle'], effects: {} };
  const spec = { level: LEVEL, ai: AI, beeTank: false }, mode = G.CONQUEST_DEFAULT_MODE || 'open';
  return function play(i) {
    const fx = fightOf(gm, S, seed, i);
    const ctx = { en: { kind: 'mirror' }, defs, rules: S.fields[fx.f].rules, mode, cpu: AI, myCastle: castle, mineCache: new Map(), oppMine: O.mineFor(gm, defs, fx.b, LEVEL), seedBase: fnv(seed + '|game|' + i) };
    const s = O.playOne(gm, spec, ctx, fx.a, i); // the score of deck A (1 win, 1/2 draw, 0 loss); A sits first on even fights
    return s === 1 ? '1' : s === 0 ? '0' : 'h';
  };
}

// ---------------------------------------------------------------- worker side
if (!isMainThread && workerData && workerData.contribution) {
  const gm = O.loadGame(workerData.root), S = setupOf(gm), play = makePlayer(gm, S, workerData.seed);
  parentPort.on('message', m => {
    try { let s = ''; for (let i = m.from; i < m.to; i++) s += play(i); parentPort.postMessage({ id: m.id, from: m.from, s }); }
    catch (e) { parentPort.postMessage({ id: m.id, err: String(e && e.stack || e) }); }
  });
}

// ---------------------------------------------------------------- playing (a worker pool; fights in chunks; checkpoint after each chunk)
async function playAll(o, gm, S, log) {
  const key = fnv(JSON.stringify([VERSION, o.seed, S.cards, S.fields.map(f => f.at)])).toString(36);
  fs.mkdirSync(o.ckptDir, { recursive: true });
  const ck = path.join(o.ckptDir, `contribution-${o.tag}-${key}.json`);
  let state = { key, chunk: o.chunk, done: {} };
  if (o.resume && fs.existsSync(ck)) { const s = JSON.parse(fs.readFileSync(ck, 'utf8')); if (s.chunk === o.chunk) state = s; }
  const todo = []; for (let a = 0; a < o.games; a += o.chunk) if (!state.done[a]) todo.push([a, Math.min(o.games, a + o.chunk)]);
  const already = Object.keys(state.done).filter(a => +a < o.games).reduce((t, a) => t + state.done[a].length, 0);
  log(`contribution ${VERSION}: ${o.games} fights (${already} done), ${S.cards.length} cards, ${S.fields.length} field entries, ${o.workers} workers, seed ${o.seed}`);
  const t0 = Date.now(); let played = 0, lastSave = Date.now(), lastLog = Date.now();
  const save = () => { const tmp = ck + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(state)); fs.renameSync(tmp, ck); };
  if (todo.length) {
    if (!o.workers) { const play = makePlayer(gm, S, o.seed); for (const [a, b] of todo) { let s = ''; for (let i = a; i < b; i++) s += play(i); state.done[a] = s; played += b - a; } save(); }
    else await new Promise((resolve, reject) => {
      let next = 0, busy = 0; const ws = [];
      const feed = w => { if (next >= todo.length) { if (!busy) { ws.forEach(x => x.terminate()); resolve(); } return; } const [a, b] = todo[next++]; busy++; w.postMessage({ id: a, from: a, to: b }); };
      for (let k = 0; k < o.workers; k++) {
        const w = new Worker(__filename, { workerData: { contribution: true, root: ROOT, seed: o.seed } }); ws.push(w);
        w.on('message', m => { busy--; if (m.err) { ws.forEach(x => x.terminate()); reject(new Error(m.err)); return; }
          state.done[m.from] = m.s; played += m.s.length;
          if (Date.now() - lastSave > 20000) { save(); lastSave = Date.now(); }
          if (Date.now() - lastLog > 60000) { lastLog = Date.now(); const rate = played / ((Date.now() - t0) / 1000), left = o.games - already - played; log(`  ${already + played}/${o.games} fights, ${rate.toFixed(1)}/s, about ${Math.round(left / rate / 60)} min left`); }
          feed(w); });
        w.on('error', e => { ws.forEach(x => x.terminate()); reject(e); });
        feed(w);
      }
    });
    save();
  }
  let out = ''; for (let a = 0; a < o.games; a += o.chunk) { const s = state.done[a]; if (!s) throw new Error('missing chunk ' + a); out += s.slice(0, Math.min(o.games, a + o.chunk) - a); }
  return { outcomes: out, seconds: Math.round((Date.now() - t0) / 1000), played, checkpoint: ck };
}

// ---------------------------------------------------------------- the analysis
// Gauss-Jordan inverse of a symmetric positive definite matrix (n x n, Float64Array row-major)
function invert(A, n) {
  const M = new Float64Array(A), I = new Float64Array(n * n); for (let i = 0; i < n; i++) I[i * n + i] = 1;
  for (let c = 0; c < n; c++) {
    let p = c, best = Math.abs(M[c * n + c]); for (let r = c + 1; r < n; r++) { const v = Math.abs(M[r * n + c]); if (v > best) { best = v; p = r; } }
    if (best < 1e-12) throw new Error('singular matrix');
    if (p !== c) for (let k = 0; k < n; k++) { let t = M[c * n + k]; M[c * n + k] = M[p * n + k]; M[p * n + k] = t; t = I[c * n + k]; I[c * n + k] = I[p * n + k]; I[p * n + k] = t; }
    const inv = 1 / M[c * n + c]; for (let k = 0; k < n; k++) { M[c * n + k] *= inv; I[c * n + k] *= inv; }
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r * n + c]; if (!f) continue; for (let k = 0; k < n; k++) { M[r * n + k] -= f * M[c * n + k]; I[r * n + k] -= f * I[c * n + k]; } }
  }
  return I;
}
// one row of the design: [[col, value], ...] for fight (A minus B copies, + the seat), y = A's score - 1/2
function rowOf(fx, idx, i, nC) { const x = new Map(); Object.keys(fx.a).forEach(id => x.set(idx[id], (x.get(idx[id]) || 0) + fx.a[id])); Object.keys(fx.b).forEach(id => x.set(idx[id], (x.get(idx[id]) || 0) - fx.b[id])); x.set(nC, i % 2 === 0 ? 1 : -1); return [...x.entries()].filter(e => e[1]); }
function ridge(rows, ys, n, lambda) {
  const M = new Float64Array(n * n), b = new Float64Array(n);
  rows.forEach((r, k) => { const y = ys[k]; for (const [i, v] of r) { b[i] += v * y; for (const [j, w] of r) M[i * n + j] += v * w; } });
  const A = new Float64Array(M); for (let i = 0; i < n; i++) A[i * n + i] += lambda;
  const Ai = invert(A, n), beta = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < n; j++) s += Ai[i * n + j] * b[j]; beta[i] = s; }
  return { M, Ai, beta };
}
function analyse(o, gm, S, outcomes, log) {
  const nC = S.cards.length, n = nC + 1, idx = {}; S.cards.forEach((id, i) => idx[id] = i);
  const N = outcomes.length, val = ch => ch === '1' ? 1 : ch === '0' ? 0 : 0.5;
  const rows = new Array(N), ys = new Float64Array(N);
  const has = new Float64Array(nC), hasW = new Float64Array(nC), copies = new Float64Array(nC);
  const phaseOf = f => { const p = (S.fields[f].rules || {}).phase || 'day'; return p === 'cycle' ? 'cycle' : p === 'night' ? 'night' : 'day/off'; };
  const PH = ['cycle', 'night', 'day/off'], ph = PH.map(() => ({ has: new Float64Array(nC), hasW: new Float64Array(nC), decks: 0, wins: 0 }));
  let draws = 0, seatWins = 0;
  for (let i = 0; i < N; i++) {
    const fx = fightOf(gm, S, o.seed, i), y = val(outcomes[i]); rows[i] = rowOf(fx, idx, i, nC); ys[i] = y - 0.5; if (outcomes[i] === 'h') draws++;
    seatWins += i % 2 === 0 ? y : 1 - y;
    const g = ph[PH.indexOf(phaseOf(fx.f))]; g.decks += 2; g.wins += 1;
    [[fx.a, y], [fx.b, 1 - y]].forEach(([d, s]) => Object.keys(d).forEach(id => { const c = idx[id]; has[c]++; hasW[c] += s; copies[c] += d[id]; g.has[c]++; g.hasW[c] += s; }));
  }
  log(`analysis: ${N} fights, ${nC} cards; ridge lambda ${o.lambda}`);
  const full = ridge(rows, ys, n, o.lambda), beta = full.beta;
  let sse = 0; for (let k = 0; k < N; k++) { let p = 0; for (const [i, v] of rows[k]) p += beta[i] * v; sse += (ys[k] - p) ** 2; }
  const sigma2 = sse / Math.max(1, N - n);
  // the sandwich: V = sigma^2 Ai M Ai, its diagonal
  const T = new Float64Array(n * n); // T = M Ai
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) { const m = full.M[i * n + k]; if (!m) continue; for (let j = 0; j < n; j++) T[i * n + j] += m * full.Ai[k * n + j]; }
  const se = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < n; j++) s += full.Ai[i * n + j] * T[j * n + i]; se[i] = Math.sqrt(Math.max(0, sigma2 * s)); }
  // split half: even and odd fights
  const half = par => { const R = [], Y = []; for (let k = par; k < N; k += 2) { R.push(rows[k]); Y.push(ys[k]); } return ridge(R, Y, n, o.lambda).beta; };
  const bE = half(0), bO = half(1), seen = S.cards.map((c, i) => i).filter(i => has[i] >= 30);
  const corr = (x, y) => { const m = a => a.reduce((t, v) => t + v, 0) / a.length, xs = seen.map(i => x[i]), ys2 = seen.map(i => y[i]), mx = m(xs), my = m(ys2); let sxy = 0, sxx = 0, syy = 0; xs.forEach((v, k) => { sxy += (v - mx) * (ys2[k] - my); sxx += (v - mx) ** 2; syy += (ys2[k] - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };
  const rHalf = corr(bE, bO), reliability = 2 * rHalf / (1 + rHalf);
  const totDecks = 2 * N, totW = N; // every fight: two decks, one win between them (a draw: 1/2 each)
  const rows2 = S.cards.map((id, c) => {
    const d = gm.D[id], hc = has[c], w = hc ? hasW[c] / hc : null, wo = (totDecks - hc) ? (totW - hasW[c]) / (totDecks - hc) : null, mc = hc ? copies[c] / hc : 0;
    const byPhase = {}; PH.forEach((p, k) => { const g = ph[k], h = g.has[c]; byPhase[p] = h >= 20 ? r4(g.hasW[c] / h - (g.wins - g.hasW[c]) / Math.max(1, g.decks - h)) : null; });
    return { id, name: d.name || id, rarity: d.rarity || 'common', band: bandOf(d.rarity), cost: d.cost || 0, attack: d.attack, health: d.health, skills: Object.keys(d.effects || {}).sort(),
      decks: hc, meanCopies: r4(mc), rawWin: r4(w), rawWithout: r4(wo), rawDelta: w == null ? null : r4(w - wo),
      perCopy: r4(beta[c]), perCopySE: r4(se[c]), contribution: r4(beta[c] * mc), contributionSE: r4(se[c] * mc), byPhase };
  });
  // the rarity bands: median contribution; residual and z against it
  const bands = {};
  BAND_ORDER.forEach(b => { const v = rows2.filter(r => r.band === b && r.decks >= 30).map(r => r.contribution).sort((x, y) => x - y);
    const med = v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : 0;
    const mean = v.length ? v.reduce((t, x) => t + x, 0) / v.length : 0, sd = v.length > 1 ? Math.sqrt(v.reduce((t, x) => t + (x - mean) ** 2, 0) / (v.length - 1)) : 0;
    bands[b] = { cards: v.length, median: r4(med), mean: r4(mean), sd: r4(sd) }; });
  rows2.forEach(r => { const b = bands[r.band]; r.vsBand = r4(r.contribution - b.median); r.z = r.contributionSE ? Math.round((r.contribution - b.median) / r.contributionSE * 100) / 100 : null; r.significant = r.z != null && Math.abs(r.z) >= 1.96; });
  const ranked = rows2.filter(r => r.decks >= 30).sort((x, y) => y.contribution - x.contribution);
  ranked.forEach((r, k) => { r.rank = k + 1; });
  const bandRank = {}; BAND_ORDER.forEach(b => ranked.filter(r => r.band === b).forEach((r, k) => { r.bandRank = k + 1; r.bandSize = bands[b].cards; }));
  const byVs = rows2.filter(r => r.decks >= 30).slice().sort((x, y) => y.vsBand - x.vsBand);
  const tooStrong = byVs.slice(0, 20).map(r => r.id), tooWeak = byVs.slice(-20).reverse().map(r => r.id);
  rows2.forEach(r => { r.flag = tooStrong.includes(r.id) ? 'strong' : tooWeak.includes(r.id) ? 'weak' : null; if (WATCH[r.id]) r.watch = WATCH[r.id]; });
  const watch = Object.keys(WATCH).filter(id => rows2.some(r => r.id === id));
  return { fights: N, draws, drawRate: r4(draws / N), seatFirstWin: r4(seatWins / N), seatBeta: r4(beta[nC]), seatSE: r4(se[nC]), sigma: r4(Math.sqrt(sigma2)), splitHalfR: r4(rHalf), reliability: r4(reliability),
    medianSE: r4(rows2.map(r => r.contributionSE).filter(v => v != null).sort((a, b) => a - b)[Math.floor(rows2.length / 2)]),
    minDecks: Math.min(...rows2.map(r => r.decks)), medianDecks: rows2.map(r => r.decks).sort((a, b) => a - b)[Math.floor(rows2.length / 2)], bands, tooStrong, tooWeak, watch, cards: rows2 };
}

// ---------------------------------------------------------------- the report
const pp = v => v == null ? '-' : (v >= 0 ? '+' : '') + (v * 100).toFixed(1);
function md(res, o) {
  const A = res.analysis, by = {}; A.cards.forEach(r => by[r.id] = r);
  const line = r => `| ${r.rank} | ${r.name} | ${r.rarity} | ${r.cost} | ${r.attack}/${r.health} | ${r.skills.join(', ') || '-'} | ${r.decks} | ${pp(r.rawDelta)} | ${pp(r.perCopy)} ± ${(r.perCopySE * 196).toFixed(1)} | ${pp(r.contribution)} ± ${(r.contributionSE * 196).toFixed(1)} | ${pp(r.vsBand)} | ${r.z} |`;
  const head = '| Rank | Card | Rarity | Lumber | A/H | Skills | Decks | Raw Δ | Per copy (95%) | Contribution (95%) | vs band median | z |\n|---|---|---|---|---|---|---|---|---|---|---|---|';
  const owl = by['owl-nightwatch'];
  const L = [`# Card contribution (${o.tag})`, '',
    `Package BAL6 (K5). Generated by \`tools/balance/contribution.js\` ${VERSION}; data: \`docs/balance/contribution-${o.tag}.json\`. Owner 10-27 11:22: "show the general 'contribution' of each card with our myriad testing ... maybe test w 30 hp brambles w random effects".`, '',
    '## Setup', '',
    `- ${A.fights.toLocaleString('en')} CPU-vs-CPU fights, seed \`${o.seed}\`. Each fight: two random legal 20-card decks (6-14 different cards, copies within the rarity and top-rank caps) drawn from ${res.settings.cards} fieldable cards; both brambles a plain ${BRAMBLE} Health (in-engine, no abilities); one field drawn from the maps' rule pool (${res.settings.fields} road fights, each one entry); the Smart CPU on both sides; both decks at Level ${LEVEL}; no leaders; seats swapped every other fight.`,
    `- Draws: ${(A.drawRate * 100).toFixed(1)}%. The seat that acts first scores ${pp(A.seatFirstWin - 0.5)} points over 50%.`,
    '- **Raw Δ**: the win rate of decks holding the card minus that of decks without it.',
    '- **Per copy**: a ridge regression of the result on the copy-count difference of the two decks (every card a column, plus the seat). Win-rate points one copy adds in place of an average copy of the pool (the decks are always 20 cards, so the numbers are relative and sum to 0). It controls for the rest of the deck.',
    '- **Contribution**: per copy x the mean copies a deck holds when it has the card. This is the number the hub sorts by.',
    '- **vs band median**: the contribution minus the median of its rarity band (starter, common, uncommon, rare, very rare and up); z = that over its standard error. The flags are the top 20 each way.',
    '',
    '## Confidence', '',
    `- Split-half: betas fitted on even and on odd fights correlate r = ${A.splitHalfR} (Spearman-Brown reliability of the full run ${A.reliability}).`,
    `- Median 95% interval of a card's contribution: ±${(A.medianSE * 196).toFixed(1)} points. Each card was in ${A.minDecks}-${Math.max(...A.cards.map(r => r.decks))} decks (median ${A.medianDecks}).`,
    '- Random decks are not tuned decks: a card that needs a partner (a tribe, Lumber makers) reads low here and may be fine in a built deck. A card that is strong on its own reads high. Read it as "strength on its own", the owner\'s "general contribution".', '',
    '## Rarity bands', '', '| Band | Cards | Median contribution | Mean | SD |', '|---|---|---|---|---|',
    ...BAND_ORDER.map(b => { const x = A.bands[b]; return `| ${b} | ${x.cards} | ${pp(x.median)} | ${pp(x.mean)} | ${pp(x.sd)} |`; }), '',
    '## Owl Nightwatch', '',
    owl ? `${owl.name} (${owl.rarity}, ${owl.cost} Lumber, ${owl.attack}/${owl.health}, ${owl.skills.join(', ')}): contribution ${pp(owl.contribution)} ± ${(owl.contributionSE * 196).toFixed(1)} points, rank ${owl.rank} of ${A.cards.filter(r => r.rank).length} overall and ${owl.bandRank} of ${owl.bandSize} in its band (${owl.band}, median ${pp(A.bands[owl.band].median)}); ${pp(owl.vsBand)} over the band median, z = ${owl.z}${owl.flag ? ', flagged too ' + owl.flag : ''}. Raw Δ ${pp(owl.rawDelta)}; per copy ${pp(owl.perCopy)} (mean ${owl.meanCopies.toFixed(1)} copies). Raw Δ by the field's day / night: ${Object.entries(owl.byPhase).map(([k, v]) => k + ' ' + pp(v)).join(', ')}.` : 'Not in the fieldable pool.', '',
    '## Owner-flagged outliers', '', 'Cards the owner called out, flagged whatever their rank.', '', head, ...(A.watch || []).map(id => line(by[id])), '', ...(A.watch || []).map(id => '- ' + by[id].name + ': ' + by[id].watch), '',
    '## Top 20 too strong for their band', '', head, ...A.tooStrong.map(id => line(by[id])), '',
    '## Top 20 too weak for their band', '', head, ...A.tooWeak.map(id => line(by[id])), '',
    '## Every card', '', 'Sorted by contribution. Cards in fewer than 30 decks are left out of the ranks.', '', head, ...A.cards.filter(r => r.rank).sort((x, y) => x.rank - y.rank).map(line), ''];
  return L.join('\n');
}

// ---------------------------------------------------------------- self-checks (no games beyond a handful)
function selfCheck(gm, S) {
  const problems = [], seed = 'check';
  for (let i = 0; i < 300; i++) { const fx = fightOf(gm, S, seed, i);
    [fx.a, fx.b].forEach(d => { const n = Object.values(d).reduce((t, k) => t + k, 0); if (n !== DECK) problems.push(`fight ${i}: ${n} cards`);
      const chk = {}; Object.keys(d).forEach(id => { if (!S.cards.includes(id)) problems.push(id + ' not fieldable'); for (let k = 0; k < d[id]; k++) { if (!O.canAdd(gm, chk, id)) problems.push(`fight ${i}: ${id} x${d[id]} breaks a cap`); chk[id] = (chk[id] || 0) + 1; } }); }); }
  const a = JSON.stringify(fightOf(gm, S, seed, 7)), b = JSON.stringify(fightOf(gm, S, seed, 7)); if (a !== b) problems.push('fightOf is not deterministic');
  const play = makePlayer(gm, S, seed), p1 = [0, 1, 2, 3].map(play).join(''), p2 = [0, 1, 2, 3].map(makePlayer(gm, S, seed)).join(''); if (p1 !== p2) problems.push('play is not deterministic: ' + p1 + ' vs ' + p2);
  // the solver: a planted model is recovered
  const n = 4, rng = O.mulberry(3), rows = [], ys = [], truth = [0.05, -0.05, 0.02, -0.02];
  for (let k = 0; k < 4000; k++) { const x = [0, 1, 2, 3].map(() => Math.floor(rng.next() * 5) - 2); x[3] = -(x[0] + x[1] + x[2]); const r = x.map((v, i) => [i, v]).filter(e => e[1]); rows.push(r); ys.push(r.reduce((t, [i, v]) => t + truth[i] * v, 0) + (rng.next() - 0.5) * 0.2); }
  const fit = ridge(rows, ys, n, 0.01).beta; truth.forEach((t, i) => { if (Math.abs(fit[i] - t) > 0.01) problems.push(`solver: beta ${i} ${fit[i].toFixed(4)} vs ${t}`); });
  return problems;
}

async function main(argv) {
  const o = parseArgs(argv), log = o.quiet ? () => {} : s => console.log(s);
  if (o.help) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 31).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const gm = O.loadGame(ROOT), S = setupOf(gm);
  if (o.check) { const p = selfCheck(gm, S); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : `ok: ${S.cards.length} fieldable cards, ${S.fields.length} field entries, 600 random decks legal, fights deterministic, solver recovers a planted model`); if (p.length) process.exit(1); return; }
  const jf = path.join(o.out, `contribution-${o.tag}.json`);
  let outcomes, run;
  if (o.analyze) { const prev = JSON.parse(fs.readFileSync(jf, 'utf8')); outcomes = prev.outcomes; run = prev.run; if (prev.settings.seed !== o.seed) throw new Error('--analyze: the file was played with seed ' + prev.settings.seed); }
  else { const p = await playAll(o, gm, S, log); outcomes = p.outcomes; run = { seconds: p.seconds, playedThisSession: p.played, workers: o.workers, checkpoint: p.checkpoint }; }
  const res = { about: 'Package BAL6 (K5): each card\'s contribution to winning over random CPU-vs-CPU fights (tools/balance/contribution.js). Values are win-rate fractions (0.05 = 5 points).',
    tool: 'tools/balance/contribution.js ' + VERSION, generated: new Date().toISOString(),
    settings: { seed: o.seed, games: outcomes.length, bramble: BRAMBLE, level: LEVEL, ai: AI, deck: DECK, lambda: o.lambda, cards: S.cards.length, fields: S.fields.length, deckRule: '6-14 different cards, copies within maxCopiesForRarity and the budget\'s top-rank caps (deckopt.canAdd)' },
    reproduce: `node tools/balance/contribution.js --games ${outcomes.length} --seed ${o.seed} --tag ${o.tag}`, run };
  res.analysis = analyse(o, gm, S, outcomes, log);
  res.outcomes = outcomes;
  fs.mkdirSync(o.out, { recursive: true });
  fs.writeFileSync(jf, JSON.stringify(res, null, 0).replace(/,"cards":\[/, ',\n"cards":[\n').replace(/\},\{"id"/g, '},\n{"id"') + '\n');
  fs.writeFileSync(jf.replace(/\.json$/, '.md'), md(res, o));
  const A = res.analysis, owl = A.cards.find(r => r.id === 'owl-nightwatch');
  log(`-> ${path.relative(ROOT, jf)} (+ .md): reliability ${A.reliability}, median 95% ±${(A.medianSE * 196).toFixed(1)} pts` + (owl ? `; Owl Nightwatch ${pp(owl.contribution)} rank ${owl.rank}, band ${owl.bandRank}/${owl.bandSize}` : ''));
}
if (isMainThread && require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { VERSION, fieldable, setupOf, randomDeck, fightOf, makePlayer, ridge, invert, analyse, selfCheck, bandOf };
