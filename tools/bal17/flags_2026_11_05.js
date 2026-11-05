#!/usr/bin/env node
// 2026-11-05 (package BAL17, decision BAL16-1 option a): which enemy cards wall the fights no deck of their own list can fix. FLAGS ONLY:
// nothing is written to canonical/cards.json or to any deck; the owner re-tunes cards himself (BAL-ROLES).
//
//   node tools/bal17/flags_2026_11_05.js run [--games 60] [--workers 2]     the swaps -> docs/balance/bal17/state/ (resumable)
//   node tools/bal17/flags_2026_11_05.js steps [--games 60] [--workers 2]   one 3A + H step on each map's top 3 cards (after run)
//   node tools/bal17/flags_2026_11_05.js report                              -> docs/balance/bal17/flags-2026-11-05.json (+ the tables for the md)
//
// The fights: BAL16-1's walled list (FIGHTS below), each played as the road measure builds it (arena_app.js referenceFightSetup /
// playReferenceGame: the Map reference at referencePlayerLevel, no leader for your seat, the enemy's own leader, bramble, Shield, field
// and CPU level), on the retune seeds (7300 + 37g), --games a variant (default 60).
// The variants of a fight:
//   - base: the fight as it is;
//   - filler <card>: every copy of that enemy card (its deck copies and, when it leads, its leader) becomes a NEUTRAL SAME-COST FILLER: the
//     same card (cost, Wait, rarity, types, level) with no skill and vanilla stats of a typical road card: 2A + H = 0.886 N (the road's median
//     budget use; tools/skill_costs.js budget N at its printed level), its printed shape kept (A's share of 2A + H; at least 1 Attack), cap 2 respected; a levelled copy keeps the
//     printed -> levelled stat gain. A leader keeps its leader flag. "moves" = filler win - base win (+ = the card makes the fight harder);
//   - all fillers: every enemy card at once (what the cards carry together);
//   - no Shield (the bramble's Shield layers off) and plain bramble (the enemy castle's ability off, same Health): what the bramble carries;
//   - extra: the enemy castle's ability numbers 2 lower (ENG24's +2 undone on a castle marked eng24Plus2; top-level numbers), and plain + no Shield.
// The budget column: the printed card's cap 1 use (x1 / N, tools/skill_costs.js budget, the game's sbCheck rule) and cap 2 (x2 / N2);
// "over" = either above 100%.
// steps: per map, its top 3 cards by mean "moves" get one 3A + H step weaker (-1 Attack; -3 Health on a card with 1 Attack or less) on every
// copy in every walled fight of the map that holds them: the win-rate change one step buys, for the suggested re-tune line.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2), CMD = argv[0] || 'help', arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const GAMES = +arg('--games', 60), W = +arg('--workers', 2), SEED = 7300, DATE = '2026-11-05';
const ONLY = arg('--only', null) ? arg('--only').split(',') : null; // a quick check: --only 14-1
const OUT = path.join(ROOT, 'docs', 'balance', 'bal17'), STATE = path.join(OUT, 'state');
// BAL16-1's list (docs/decisions.json), by fight code
const FIGHTS = ['14-1', '14-2', '14-3', '14-4', '14-5', '14-6', '14-7', '14-8', '14-A-1', '14-A-2', '14-A-3', '14-A-4', '14-A-5',
  '19-A-1', '19-A-2', '19-A-3', '19-A-4', '19-A-5', '19-A-6', '19-A-7', '19-A-8', '19-A-9', '19-A-10', '17-4', '17-5', '17-6', '17-7', '17-8',
  '0-B-1', '0-B-2', '0-B-3', '0-B-4', '8-2', '8-5', '8-7', '10-1', '10-A-4', '10-A-5'];
const FP = crypto.createHash('sha1').update(['arena_app.js', 'bramblewood-engine.js', 'canonical/cards.json', 'bramblewood-budget.js', 'canonical/skill-costs.json'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).concat(['bal17-flags 1.0.0 fill ' + 0.886]).join('\n')).digest('hex').slice(0, 10);
// the filler's size: the road's median card. Every enemy card of every Conquest fight (312 cards, 2026-11-05) uses a median 88.6% of its cap 1
// budget (quartiles 79.8% / 93.7%), so a filler at 2A + H = 0.886 N is a typical road card of that cost, not a full-budget one
const FILL_USE = +arg('--fill-use', 0.886);
const baseOf = (defs, k) => (defs[k] && defs[k].derivedFrom) || String(k).split('@')[0];
const r1 = x => Math.round(x * 10) / 10;

let _gm = null; const game = () => _gm || (_gm = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')).loadGame(ROOT));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), COST = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
function fightList(G) {
  const out = [];
  for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower) continue; const no = G.mapNumberOf(m.id); if (no == null) continue;
    const sibs = G.CONQUEST_MAPS.filter(x => x.sub && x.parent === m.parent && !x.endless);
    (m.nodes || []).forEach((n, i) => { if (!n.deck || !Object.keys(n.deck).length) return;
      const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i + 1}` : `${no}-${i + 1}`);
      if (FIGHTS.includes(code) && (!ONLY || ONLY.includes(code))) out.push({ code, map: m.id, mapNo: no, side: !!m.sub, mapName: m.name, key: n.key, name: n.name || n.key, node: n }); }); }
  return out.sort((a, b) => FIGHTS.indexOf(a.code) - FIGHTS.indexOf(b.code));
}
// the budget of a printed card: cap 1 and cap 2 use
function budgetOf(D, id) { const d = D[id]; if (!d) return null; try { const b = COST.budget(d); return { N: b.N, x1: b.x1, N2: b.N2, x2: b.x2, use1: r1(b.x1 / b.N * 100), use2: r1(b.x2 / b.N2 * 100), over: !b.ok, S: b.S }; } catch (e) { return null; } }
// the neutral same-cost filler's printed stats
function fillerStats(D, id) {
  const d = D[id], b = COST.budget(Object.assign({}, d, { effects: {} })), N = b.N, A0 = Math.max(0, +d.attack || 0), H0 = Math.max(1, +d.health || 1);
  const T = N * FILL_USE, share = A0 / (2 * A0 + H0); let A = Math.max(1, Math.round(T * share)), H = Math.max(1, Math.round(T - 2 * A));
  while (A > 1 && A * H > b.N2) { A--; H = Math.max(1, Math.round(T - 2 * A)); }
  return { attack: A, health: H, N };
}
function ctxOf(G, f) { G.NODE_MAP_HINT.set(f.node, f.map); return G.referenceFightSetup(f.map, f.node, { seed0: SEED, noLeader: true }); }
function enemyKeys(ctx) { return Object.keys(ctx.enemyDeck).concat((ctx.setup.reserveLeaders || []).filter(k => ctx.defs[k])); }
function enemyCards(ctx) { return [...new Set(enemyKeys(ctx).map(k => baseOf(ctx.defs, k)))]; }
function copiesOf(ctx, id) { return Object.keys(ctx.enemyDeck).filter(k => baseOf(ctx.defs, k) === id).reduce((t, k) => t + ctx.enemyDeck[k], 0); }
// a variant: {fill: [ids]} | {step: {id, dA, dH}} | {noShield} | {plainBramble}
function play(G, D, f, v) {
  const ctx = ctxOf(G, f);
  if (v.fill || v.step) { ctx.defs = Object.assign({}, ctx.defs);
    enemyKeys(ctx).forEach(k => { const id = baseOf(ctx.defs, k), d = ctx.defs[k], P = D[id] || d;
      if (v.fill && v.fill.includes(id)) { const s = fillerStats(D, id), gA = (+d.attack || 0) - (+P.attack || 0), gH = (+d.health || 0) - (+P.health || 0), lead = (d.effects || {}).leader;
        ctx.defs[k] = Object.assign({}, d, { effects: lead ? { leader: lead } : {}, attack: Math.max(0, s.attack + gA), health: Math.max(1, s.health + gH), triggers: undefined }); }
      if (v.step && v.step.id === id) ctx.defs[k] = Object.assign({}, d, { attack: Math.max(0, (+d.attack || 0) + v.step.dA), health: Math.max(1, (+d.health || 0) + v.step.dH) }); }); }
  if (v.noShield) ctx.setup = Object.assign({}, ctx.setup, { hq: Object.assign({}, ctx.setup.hq, { shield: 0, maxShield: 0, shieldLayers: [] }) });
  if (v.minus2) { const c = ctx.sc.character, e = Object.assign({}, c.effects || {}); if (c.eng24Plus2) Object.keys(e).forEach(k => { if (typeof e[k] === 'number' && e[k] > 0) e[k] = Math.max(0, e[k] - 2); });
    ctx.sc = Object.assign({}, ctx.sc, { character: Object.assign({}, c, { effects: e }) }); }
  if (v.plainBramble) { const c = ctx.sc.character, plain = Object.assign({}, ctx.myCastle, { health: c.health, maxHealth: c.maxHealth }); ctx.sc = Object.assign({}, ctx.sc, { character: plain }); }
  let w = 0; for (let g = 0; g < GAMES; g++) if (G.playReferenceGame(ctx, g).win) w++; return r1(w / GAMES * 100);
}
const stepOf = (D, id) => { const a = +(D[id] || {}).attack || 0; return a >= 2 ? { dA: -1, dH: 0 } : { dA: 0, dH: -3 }; };
function runFight(f) {
  const gm = game(), G = gm.G, D = gm.D, t0 = Date.now(), ctx = ctxOf(G, f), cards = enemyCards(ctx), leaders = (ctx.setup.reserveLeaders || []).map(k => baseOf(ctx.defs, k));
  const base = play(G, D, f, {}), swaps = cards.map(id => ({ id, copies: copiesOf(ctx, id), leader: leaders.includes(id), filler: fillerStats(D, id), win: play(G, D, f, { fill: [id] }) }));
  swaps.forEach(s => { s.moves = r1(s.win - base); });
  return { code: f.code, map: f.map, mapNo: f.mapNo, side: f.side, mapName: f.mapName, key: f.key, name: f.name, kind: f.node.kind || 'skirmish', games: GAMES, seed0: SEED,
    level: ctx.ref.level, cpu: ctx.cpu, bramble: { id: ctx.sc.character.id, health: ctx.sc.character.health, shield: (ctx.setup.hq || {}).shield || 0 }, leaders,
    base, allFillers: play(G, D, f, { fill: cards }), noShield: play(G, D, f, { noShield: true }), plainBramble: play(G, D, f, { plainBramble: true }), swaps, ms: Date.now() - t0 };
}
const stateFile = (kind, code) => path.join(STATE, `${kind}-${FP}-${GAMES}-${code}.json`);
function shard(kind, i, n) {
  fs.mkdirSync(STATE, { recursive: true }); const gm = game(), list = fightList(gm.G);
  if (kind === 'run') list.filter((f, k) => k % n === i).forEach(f => { const fl = stateFile('fight', f.code); if (fs.existsSync(fl)) return; const x = runFight(f); fs.writeFileSync(fl, JSON.stringify(x) + '\n');
    console.log(f.code, 'base', x.base, 'all fillers', x.allFillers, 'no Shield', x.noShield, '| top', x.swaps.slice().sort((a, b) => b.moves - a.moves).slice(0, 2).map(s => s.id + ' ' + s.moves).join(', '), Math.round(x.ms / 1000) + 's'); });
  if (kind === 'extra') list.filter((f, k) => k % n === i).forEach(f => { const fl = stateFile('extra', f.code); if (fs.existsSync(fl)) return; const ctx = ctxOf(gm.G, f), c = ctx.sc.character;
    const x = { code: f.code, bramble: c.id, effects: c.effects || {}, eng24Plus2: !!c.eng24Plus2, minus2: play(gm.G, gm.D, f, { minus2: true }), plainNoShield: play(gm.G, gm.D, f, { plainBramble: true, noShield: true }) };
    fs.writeFileSync(fl, JSON.stringify(x) + '\n'); console.log('extra', f.code, x.bramble, JSON.stringify(x.effects), 'minus2', x.minus2, 'plain+no Shield', x.plainNoShield); });
  if (kind === 'steps') { const top = topByMap(); const jobs = [];
    Object.values(top).forEach(m => m.top.forEach(c => c.fights.forEach(code => jobs.push({ id: c.id, code }))));
    jobs.filter((j, k) => k % n === i).forEach(j => { const fl = stateFile('step-' + j.id, j.code); if (fs.existsSync(fl)) return; const f = list.find(x => x.code === j.code), s = stepOf(gm.D, j.id);
      const win = play(gm.G, gm.D, f, { step: Object.assign({ id: j.id }, s) }); fs.writeFileSync(fl, JSON.stringify({ id: j.id, code: j.code, step: s, win }) + '\n'); console.log('step', j.id, j.code, win); }); }
}
function loadFights() { return FIGHTS.map(c => stateFile('fight', c)).filter(f => fs.existsSync(f)).map(f => JSON.parse(fs.readFileSync(f, 'utf8'))); }
// per map: every enemy card's mean move over the map's walled fights that hold it (a card absent from a fight counts there as 0, so a card in
// one fight of eight does not outrank one in all eight: "map move" = the sum over the map's fights / the map's walled fights)
function topByMap() {
  const by = {}; loadFights().forEach(x => { const m = by[x.map] = by[x.map] || { map: x.map, mapNo: x.mapNo, side: x.side, mapName: x.mapName, fights: [], cards: {} }; m.fights.push(x.code);
    x.swaps.forEach(s => { const c = m.cards[s.id] = m.cards[s.id] || { id: s.id, fights: [], moves: [], copies: 0, leader: false }; c.fights.push(x.code); c.moves.push(s.moves); c.copies += s.copies; c.leader = c.leader || s.leader; }); });
  Object.values(by).forEach(m => { m.ranked = Object.values(m.cards).map(c => Object.assign(c, { mapMove: r1(c.moves.reduce((t, v) => t + v, 0) / m.fights.length), meanMove: r1(c.moves.reduce((t, v) => t + v, 0) / c.moves.length) }))
    .sort((a, b) => b.mapMove - a.mapMove || b.meanMove - a.meanMove); m.top = m.ranked.filter(c => c.mapMove >= 3).slice(0, 3); });
  return by;
}
function report() {
  const D = game().D, by = topByMap(), fights = loadFights(), nm = id => (D[id] || {}).name || id;
  const stepRes = (id, code) => { const f = stateFile('step-' + id, code); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
  const maps = Object.values(by).sort((a, b) => a.mapNo - b.mapNo || (a.side ? 1 : 0) - (b.side ? 1 : 0)).map(m => {
    const fx = fights.filter(x => x.map === m.map), meanBase = r1(fx.reduce((t, x) => t + x.base, 0) / fx.length);
    const ranked = m.ranked.map(c => { const b = budgetOf(D, c.id), steps = c.fights.map(code => stepRes(c.id, code)).filter(Boolean), base = c.fights.map(code => fx.find(x => x.code === code).base);
      const step = steps.length === c.fights.length ? { change: stepOf(D, c.id), moves: r1(steps.reduce((t, s, i) => t + s.win - base[i], 0) / steps.length) } : null;
      return { id: c.id, name: nm(c.id), stats: `${(D[c.id] || {}).attack}/${(D[c.id] || {}).health}`, cost: (D[c.id] || {}).cost || 0, rarity: (D[c.id] || {}).rarity, copies: c.copies, leader: c.leader, fights: c.fights, mapMove: c.mapMove, meanMove: c.meanMove, perFight: c.moves, budget: b, step, suggestion: suggest(D, c, b, step) }; });
    const ex = code => { const f = stateFile('extra', code); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; }, mean = k => r1(fx.reduce((t, x) => t + (ex(x.code)[k] || 0), 0) / fx.length);
    return { map: m.map, mapNo: m.mapNo, side: m.side, mapName: m.mapName, meanMinus2: mean('minus2'), meanPlainNoShield: mean('plainNoShield'), brambles: [...new Set(fx.map(x => ex(x.code).bramble + ' ' + JSON.stringify(ex(x.code).effects || {})))], fights: fx.map(x => ({ minus2: ex(x.code).minus2, plainNoShield: ex(x.code).plainNoShield, code: x.code, name: x.name, kind: x.kind, base: x.base, allFillers: x.allFillers, noShield: x.noShield, plainBramble: x.plainBramble, bramble: x.bramble, leaders: x.leaders, level: x.level })),
      meanBase, meanAllFillers: r1(fx.reduce((t, x) => t + x.allFillers, 0) / fx.length), meanNoShield: r1(fx.reduce((t, x) => t + x.noShield, 0) / fx.length), meanPlainBramble: r1(fx.reduce((t, x) => t + x.plainBramble, 0) / fx.length), ranked };
  });
  const j = { about: 'BAL17 card flags on BAL16-1\'s walled fights (tools/bal17/flags_2026_11_05.js). Flags only: no card or deck changed.', date: DATE, games: GAMES, seed0: SEED, fingerprint: FP, fights: FIGHTS, maps };
  fs.writeFileSync(path.join(OUT, `flags-${DATE}.json`), JSON.stringify(j, null, 1) + '\n'); console.log(`-> docs/balance/bal17/flags-${DATE}.json (${fights.length} fights, ${maps.length} maps)`);
  maps.forEach(m => { console.log(`${m.mapNo}${m.side ? ' ' + m.map : ''} ${m.mapName}: base ${m.meanBase}, all fillers ${m.meanAllFillers}, no Shield ${m.meanNoShield}, plain bramble ${m.meanPlainBramble}, ENG24 +2 undone ${m.meanMinus2}, plain + no Shield ${m.meanPlainNoShield} | ${m.brambles.join('; ')}`);
    m.ranked.slice(0, 5).forEach(c => console.log(`   ${c.name} x${c.copies}${c.leader ? ' (leads)' : ''} ${c.stats} map ${c.mapMove} (in-fight ${c.meanMove}) budget ${c.budget ? c.budget.use1 + '%/' + c.budget.use2 + '%' : '-'} step ${c.step ? c.step.moves : '-'} | ${c.suggestion}`)); });
}
function suggest(D, c, b, step) {
  const d = D[c.id] || {}, a = +d.attack || 0, h = +d.health || 0, s = step ? step.change : stepOf(D, c.id), line = `${a}/${h} -> ${Math.max(0, a + s.dA)}/${Math.max(1, h + s.dH)}`;
  if (c.mapMove < 3) return 'not a driver here (a neutral card in its place moves the map less than 3 points)';
  const over = b && b.over, use = b ? Math.max(b.use1, b.use2) : null, stepTxt = step ? ` (one step moved its fights ${step.moves > 0 ? '+' : ''}${step.moves})` : '';
  if (over) return `over budget (${use}%): trim to budget, e.g. ${line}${stepTxt}`;
  if (use != null && use >= 90) return `at budget (${use}%) but plays above it: ${line}${stepTxt}, or re-price its skill`;
  return `under budget (${use}%) yet carries the map: its skill reads cheap here (check its price on this map); ${line}${stepTxt}`;
}
if (CMD === '--shard') { const [k, s] = [argv[1], argv[2]]; const [i, n] = s.split('/').map(Number); shard(k, i, n); }
else if (CMD === 'run' || CMD === 'steps' || CMD === 'extra') { const base = argv.slice(1); Promise.all(Array.from({ length: Math.max(1, W) }, (x, i) => new Promise(res => cp.fork(__filename, ['--shard', CMD, `${i}/${Math.max(1, W)}`].concat(base), { stdio: 'inherit' }).on('exit', res)))).then(() => console.log('done ' + CMD)); }
else if (CMD === 'report') report();
else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 25).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
