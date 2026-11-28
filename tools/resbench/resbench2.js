#!/usr/bin/env node
// 2026-11-28 (package RESBENCH2): the re-checks behind RES1-1..4 (docs/decisions.json), with RESBENCH1's decks, test creatures and paired method
// (tools/resbench/resbench.js). Measurement only: no card, deck, price or budget edit.
//   RES1-1 / RES1-2: On Attack: gain 1 and On Attacked: gain 1 on their home maps (the maps whose lists hold Gull Thief / Driftwood Crab:
//     Maps 0, 2, 3 and 2, 8, 9), the map's field and weather on (its first fight's rules), against that map's reference deck.
//   RES1-4: the worth of one Lumber of cost (0-Lumber minus 1-Lumber variant of each every-turn skill at n = 1, as RESBENCH1) against two more
//     Map reference decks that A-0 meets at 30-70% (picked by `scan`), no field as RESBENCH1; every other context reads it too.
//   Giant Clam: its Tide on (Map 10's field, its home; and the A-0 mirror with only the Tide).
// Each context: A-0, the calibration bumps (1, 2, 4 copies of +1 Attack / +2 Health), the placebo, the five every-turn skills at 0 and 1
// Lumber, the 0-Lumber vanilla at 1 Lumber (the Lumber tax read alone), the carriers vs their budget twins. Variants are played tier by tier
// across all contexts, so an interrupted run has the key readings first.
//   node tools/resbench/resbench2.js scan --games 120 --shard 0/2     # A-0 against each candidate reference deck, with / without its field
//   node tools/resbench/resbench2.js run --games 800 --shard 0/2      # resumable; progress saved every minute
//   node tools/resbench/resbench2.js report [--md <file>]             # -> docs/balance/resbench/resbench2-<date>.json
'use strict';
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const R1 = require('./resbench.js');
const O = require(path.join(__dirname, '..', 'opt', 'deckopt.js'));
const BL = require(path.join(__dirname, '..', 'bench', 'lib.js'));
const OUT = R1.OUT, VERSION = '2.0.0 (2026-11-28, RESBENCH2)';
const gm = R1.gm, G = () => gm().G;

// ---------------------------------------------------------------- contexts: {id, opp: 'mirror' | map number (its reference deck), field: null | map number (its first fight's rules) | 'tide'}
const SCAN = [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14].flatMap(m => [{ id: 'ref' + m, opp: m, field: null }, { id: 'ref' + m + 'f', opp: m, field: m }]);
// the run's contexts (RES1-4's two extra decks picked from the scan: A-0 at 30-70% with no field, as RESBENCH1's Map 8)
const CTX = [
  { id: 'ref0f', opp: 0, field: 0, why: 'home of Gull Thief / Forager Ant (Map 0 list); A-0 wins 99% here, so the readings sit at the ceiling' },
  { id: 'mirror0f', opp: 'mirror', field: 0, why: 'the A-0 mirror under Map 0\'s field (room to read, where the Map 0 deck is at the ceiling)' },
  { id: 'ref2f', opp: 2, field: 2, why: 'home of Gull Thief and Driftwood Crab (Map 2 list and fights)' },
  { id: 'ref3f', opp: 3, field: 3, why: 'home of Gull Thief (Map 3 list and fights)' },
  { id: 'ref8f', opp: 8, field: 8, why: 'home of Driftwood Crab (Map 8 list)' },
  { id: 'ref9f', opp: 9, field: 9, why: 'home of Driftwood Crab (Map 9 list); A-0 wins 6% here, so the readings sit at the floor' },
  { id: 'mirror9f', opp: 'mirror', field: 9, why: 'the A-0 mirror under Map 9\'s field (room to read, where the Map 9 deck is at the floor)' },
  { id: 'ref10f', opp: 10, field: 10, why: 'home of Giant Clam (Map 10 list and fights), Tide on' },
  { id: 'mirrorTide', opp: 'mirror', field: 'tide', why: 'the A-0 mirror with only the Tide on (Giant Clam)' },
  ...(process.env.RB2_LUMBER || 'ref2,ref4' /* the scan: A-0 48% / 33% with no field (ref3 71%, ref1 25%) */).split(',').map(id => ({ id, opp: +id.replace('ref', ''), field: null, why: 'RES1-4: one more reference deck, no field' })),
];
const CARDS2 = ['gull-thief', 'forager-ant', 'driftwood-crab', 'giant-clam', 'muskrat-lodgekeeper', 'coral-polyp-colony'];
const EVERY = R1.SKILLS.filter(s => s.every).map(s => s.id);

const mapOf = n => G().CONQUEST_MAPS.find(x => !x.sub && !x.reserved && G().mapNumberOf(x.id) === n);
function rulesOf(c) {
  if (c.field == null) return {};
  if (c.field === 'tide') return { tide: true };
  const m = mapOf(c.field), f = O.fightsOf(m)[0]; return JSON.parse(JSON.stringify(G().fightRules(m.id, f) || {}));
}
function refOf(n) { return G().referenceDeckFor(mapOf(n).id); }

// ---------------------------------------------------------------- definitions (RESBENCH1's, plus the taxed vanilla)
let DEFS = null;
function defs() {
  if (DEFS) return DEFS; const d = R1.ctxDefs().defs;
  d['rb-v0-tax'] = Object.assign({}, d['rb-v0'], { id: 'rb-v0-tax', name: 'rb-v0-tax', cost: 1 }); // the 0-Lumber vanilla's 2/7 body at 1 Lumber
  DEFS = d; return d;
}
const CARD_L = Object.fromEntries(R1.CARDS.map(([id, , L]) => [id, L]));

// ---------------------------------------------------------------- variants, tier by tier
function variants(ctxs) {
  const out = [], D = defs(); const tiers = [[], [], [], [], [], []];
  ctxs.forEach(c => {
    const add = (t, label, slots, info) => tiers[t].push(Object.assign({ key: c.id + '|' + R1.slotKey(slots), ctx: c.id, label, slots }, info || {}));
    add(0, 'A-0', R1.deckA(0, null), { group: 'base' });
    [['rb-v0-a1', 3], ['rb-v0-h2', 2]].forEach(([id, pts]) => [1, 2, 4].forEach(k => add(0, id + ' x' + k, R1.deckA(0, null, { at: 'v0', id, k }), { group: 'calib', bump: id, k, pts: pts * k })));
    add(1, 'placebo-0 n1', R1.deckA(1, 'rb-placebo-0'), { group: 'skill', skill: 'placebo', cost: 0 });
    ['onAttackGain1', 'onAttackedGain1'].forEach(s => [0, 1].forEach(cost => add(1, s + '-' + cost + ' n1', R1.deckA(1, 'rb-' + s + '-' + cost), { group: 'skill', skill: s, cost })));
    ['gull-thief', 'driftwood-crab', 'giant-clam'].forEach(id => addCard(add, 2, id));
    EVERY.filter(s => !/^onAttack/.test(s)).forEach(s => [0, 1].forEach(cost => add(3, s + '-' + cost + ' n1', R1.deckA(1, 'rb-' + s + '-' + cost), { group: 'skill', skill: s, cost })));
    add(3, 'tax n1', R1.deckA(1, 'rb-v0-tax'), { group: 'tax' });
    ['forager-ant', 'muskrat-lodgekeeper', 'coral-polyp-colony'].forEach(id => addCard(add, 4, id));
  });
  function addCard(add, t, id) { const R = R1.realOf(defs(), id, CARD_L[id]); [[R.did, 'real'], [R.twin, 'twin']].forEach(([did, kind]) => add(t, id + ' ' + kind, R1.deckA(0, null, { at: 'v0', id: did, k: 1 }), { group: 'card', card: id, kind, level: CARD_L[id] })); }
  return tiers.flat();
}

// ---------------------------------------------------------------- one game (RESBENCH1's play(), the context's rules and reference deck)
const base = new Map();
function ctxBase(c) {
  let b = base.get(c.id); if (b) return b; const D = defs();
  let oppMine, level = null;
  if (c.opp === 'mirror') oppMine = R1.mineOf(R1.deckA(0, null)); else { const r = refOf(c.opp); level = r.level; oppMine = O.mineFor(gm(), D, r.deck, r.level); }
  b = { oppMine, level, rules: rulesOf(c), seedBase: BL.fnv('resbench2|' + c.id) }; base.set(c.id, b); return b;
}
function play(c, v, g) {
  const D = defs(), b = ctxBase(c), mine = R1.mineOf(v.slots), castle = { id: 'castle', name: 'Bramble', icon: '🏰', health: R1.BRAMBLE, rarity: 'common', archetypes: ['Castle'], effects: {} };
  const ctx = { en: { kind: 'mirror' }, defs: D, rules: b.rules, mode: 'open', cpu: R1.AI, myCastle: castle, mineCache: new Map([[O.deckKey(mine), mine]]), oppMine: b.oppMine, seedBase: b.seedBase };
  const s = O.playOne(gm(), { level: R1.LEVEL, ai: R1.AI, beeTank: false }, ctx, mine, g);
  return s === 1 ? '1' : s === 0 ? '0' : 'h';
}

// ---------------------------------------------------------------- saved games
function fingerprint(ctxs) {
  const h = crypto.createHash('sha1'); h.update(VERSION); h.update(R1.fingerprint());
  // the data the games read: every scanned map's first-fight rules and reference deck (fixed list, so adding a context keeps the games)
  const D = gm().D, used = new Set(CARDS2);
  [...new Set(SCAN.map(c => c.opp))].sort((a, b) => a - b).forEach(m => { const r = refOf(m); h.update(m + JSON.stringify(rulesOf({ field: m })) + JSON.stringify(r)); Object.keys(r.deck).forEach(id => used.add(id)); });
  [...used].sort().forEach(id => h.update(JSON.stringify(D[id] || null)));
  return h.digest('hex').slice(0, 10);
}
const ALLCTX = () => { const m = new Map(); SCAN.concat(CTX).forEach(c => m.set(c.id, c)); return [...m.values()]; };
const gamesFile = (fp, shard) => path.join(OUT, 'rb2-games-' + fp + '-' + shard.replace('/', 'of') + '.json');
function loadAll(fp) { const all = {}; fs.readdirSync(OUT).filter(f => f.startsWith('rb2-games-' + fp + '-') && f.endsWith('.json')).forEach(f => {
  Object.entries(JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).games).forEach(([k, s]) => { if (s.length > (all[k] || '').length) all[k] = s; }); }); return all; }
function saveShard(fp, shard, games) { const f = gamesFile(fp, shard), t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify({ tool: 'tools/resbench/resbench2.js ' + VERSION, fingerprint: fp, games })); fs.renameSync(t, f); }

function parse(argv) { const o = { cmd: argv[0] || 'plan', games: 800, shard: '0/1', boot: 400 };
  for (let i = 1; i < argv.length; i++) { const a = argv[i], v = () => argv[++i]; if (a === '--games') o.games = +v(); else if (a === '--shard') o.shard = v(); else if (a === '--boot') o.boot = +v(); else if (a === '--md') o.md = path.resolve(v()); }
  return o; }

function runList(fp, V, M, shard) {
  const [si, sn] = shard.split('/').map(Number), all = loadAll(fp), own = fs.existsSync(gamesFile(fp, shard)) ? JSON.parse(fs.readFileSync(gamesFile(fp, shard), 'utf8')).games : {};
  const mineV = V.filter((v, i) => i % sn === si), cmap = new Map(ALLCTX().map(c => [c.id, c])); let todo = 0; mineV.forEach(v => { todo += Math.max(0, M - (all[v.key] || '').length); });
  console.log(`resbench2 shard ${shard}: ${mineV.length} variants, ${todo} games to play (fp ${fp})`);
  const t0 = Date.now(); let done = 0, last = Date.now();
  for (const v of mineV) { let s = all[v.key] || ''; const c = cmap.get(v.ctx);
    while (s.length < M) { s += play(c, v, s.length); done++;
      if (Date.now() - last > 60000) { last = Date.now(); own[v.key] = s; saveShard(fp, shard, own); const r = done / ((Date.now() - t0) / 1000); console.log(`  ${done}/${todo} games, ${r.toFixed(1)}/s, ~${Math.round((todo - done) / r / 60)} min left`); } }
    own[v.key] = s; }
  saveShard(fp, shard, own); console.log(`done: ${done} games in ${Math.round((Date.now() - t0) / 1000)} s`);
}
function cmdScan(o) { const fp = fingerprint(ALLCTX()); runList(fp, variants(SCAN).filter(v => v.group === 'base'), o.games, o.shard); }
function cmdRun(o) { const fp = fingerprint(ALLCTX()); runList(fp, variants(CTX), o.games, o.shard); }
function cmdPlan() {
  CTX.forEach(c => { const b = ctxBase(c); console.log(c.id, '| opp', c.opp, 'level', b.level, '| rules', JSON.stringify(b.rules).slice(0, 160), '|', c.why); });
  console.log(variants(CTX).length, 'variants; fp', fingerprint(ALLCTX()));
}

// ---------------------------------------------------------------- report
function cmdReport(o) {
  const fp = fingerprint(ALLCTX()), all = loadAll(fp), res = { tool: VERSION, fingerprint: fp, date: new Date().toISOString().slice(0, 10), scan: [], ctx: {} };
  const p = v => (v >= 0 ? '+' : '') + v.toFixed(1);
  SCAN.forEach(c => { const v = variants([c]).find(x => x.group === 'base'), s = all[v.key] || ''; if (!s.length) return; const a = R1.arr(s, s.length); res.scan.push({ ctx: c.id, opp: c.opp, field: c.field, wr: R1.mean(a), se: R1.se(a), games: s.length }); });
  const Rg = O.mulberry(BL.fnv('resbench2-boot'));
  for (const c of CTX) {
    const V = variants([c]), b = V.find(v => v.group === 'base'); const M = Math.min(...V.filter(v => v.group !== 'card' || true).map(v => (all[v.key] || '').length).filter(n => n > 0)); if (!all[b.key] || !M) continue;
    const has = v => (all[v.key] || '').length >= M, A = v => R1.arr(all[v.key], M), a0 = A(b);
    const cal = V.filter(v => v.group === 'calib' && has(v)); if (cal.length < 2) continue;
    const boots = Array.from({ length: o.boot }, () => Array.from({ length: M }, () => Math.floor(Rg.next() * M)));
    const id0 = Array.from({ length: M }, (_, i) => i), mI = (x, idx) => { let t = 0; idx.forEach(i => { t += x[i]; }); return t / idx.length; };
    const calA = cal.map(v => ({ pts: v.pts, d: R1.dif(A(v), a0) }));
    const slopeOf = idx => { let sxy = 0, sxx = 0; calA.forEach(q => { sxy += q.pts * mI(q.d, idx); sxx += q.pts * q.pts; }); return sxy / sxx; };
    const slope = slopeOf(id0), slopeB = boots.map(slopeOf);
    const r = res.ctx[c.id] = { why: c.why, opp: c.opp, field: c.field, rules: ctxBase(c).rules, refLevel: ctxBase(c).level, games: M, a0: { wr: R1.mean(a0), se: R1.se(a0) }, slope, slopeLo: R1.quant(slopeB, 0.025), slopeHi: R1.quant(slopeB, 0.975), skills: {}, lumber: null, tax: null, cards: {} };
    // a reading in budget points: ΔWR (paired) / slope; ± from the ΔWR alone (as RESBENCH1) and a bootstrap that carries the slope too
    const pts = d => { const m = R1.mean(d), bs = boots.map((ix, j) => mI(d, ix) / slopeB[j]); return { d: m, dse: R1.se(d), pts: m / slope, ptsSe: R1.se(d) / slope, lo: R1.quant(bs, 0.025), hi: R1.quant(bs, 0.975) }; };
    const sk = (s, cost) => V.find(v => v.group === 'skill' && v.skill === s && v.cost === cost), pl = sk('placebo', 0);
    R1.SKILLS.filter(s => s.every).forEach(s => [0, 1].forEach(cost => { const v = sk(s.id, cost); if (!v || !has(v) || !has(pl)) return; r.skills[s.id + '-' + cost] = pts(R1.dif(A(v), A(pl))); }));
    // one Lumber of cost: per game, the mean over the five every-turn skills of (0-Lumber minus 1-Lumber) at n = 1
    const pairs = EVERY.map(s => [sk(s, 0), sk(s, 1)]).filter(([x, y]) => x && y && has(x) && has(y));
    if (pairs.length) { const ds = pairs.map(([x, y]) => R1.dif(A(x), A(y))); const d = id0.map(i => ds.reduce((t, q) => t + q[i], 0) / ds.length);
      r.lumber = Object.assign(pts(d), { skills: pairs.length, per: Object.fromEntries(pairs.map(([x], j) => [x.skill, R1.mean(ds[j]) / slope])) }); }
    const tx = V.find(v => v.group === 'tax'); if (tx && has(tx)) r.tax = pts(R1.dif(a0, A(tx))); // + = what the 1 Lumber costs the 2/7
    CARDS2.forEach(id => { const re = V.find(v => v.card === id && v.kind === 'real'), tw = V.find(v => v.card === id && v.kind === 'twin'); if (!re || !tw || !has(re) || !has(tw)) return;
      r.cards[id] = Object.assign(pts(R1.dif(A(re), A(tw))), { level: re.level, vsSlot: R1.mean(R1.dif(A(re), a0)) }); });
  }
  const f = path.join(OUT, 'resbench2-' + res.date + '.json'); fs.writeFileSync(f, JSON.stringify(res, null, 1));
  res.scan.forEach(s => console.log(`scan ${s.ctx.padEnd(6)} A-0 ${(s.wr * 100).toFixed(1)}% ± ${(196 * s.se).toFixed(1)} (${s.games})`));
  Object.entries(res.ctx).forEach(([id, r]) => { console.log(`\n${id} (${r.games} games): A-0 ${(r.a0.wr * 100).toFixed(1)}%, slope ${(r.slope * 100).toFixed(2)} [${(r.slopeLo * 100).toFixed(2)}, ${(r.slopeHi * 100).toFixed(2)}]`);
    Object.entries(r.skills).forEach(([k, x]) => console.log(`  ${k.padEnd(18)} ${p(x.pts)} ± ${(1.96 * x.ptsSe).toFixed(1)} pts [${p(x.lo)}, ${p(x.hi)}]`));
    if (r.lumber) console.log(`  1 Lumber (${r.lumber.skills} skills) ${p(r.lumber.pts)} ± ${(1.96 * r.lumber.ptsSe).toFixed(1)} [${p(r.lumber.lo)}, ${p(r.lumber.hi)}]`);
    if (r.tax) console.log(`  tax (2/7 at 1 L)   ${p(r.tax.pts)} ± ${(1.96 * r.tax.ptsSe).toFixed(1)}`);
    Object.entries(r.cards).forEach(([k, x]) => console.log(`  ${k.padEnd(20)} vs twin ${p(x.pts)} ± ${(1.96 * x.ptsSe).toFixed(1)} [${p(x.lo)}, ${p(x.hi)}]`)); });
  console.log('\nwrote', path.relative(path.join(__dirname, '..', '..'), f));
}

if (require.main === module) { const o = parse(process.argv.slice(2)); ({ plan: cmdPlan, scan: cmdScan, run: cmdRun, report: cmdReport })[o.cmd](o); }
module.exports = { CTX, SCAN, variants };
