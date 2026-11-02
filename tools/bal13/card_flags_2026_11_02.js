#!/usr/bin/env node
// 2026-11-02 (package BAL13, coordinator 20:19 for the owner: "There's nothing to do but change the cards! ... The only thing that should change
// is the card. But we shouldn't choose new cards."): for every road fight more than 20 points off its road-curve target, the card(s) driving it
// and a suggested stat line. FLAGS ONLY: nothing is written to canonical/cards.json or to any deck; the owner changes cards.
//
//   node tools/bal13/card_flags_2026_11_02.js --road <tag> [--games 40] [--workers 2] [--gap 20]   -> docs/balance/bal13/card-flags-2026-11-02.md / .json
//
// The fights: the road measure's rows (docs/balance/skirmish-pass-<tag>.jsonl, the Map reference, 40 games) more than --gap points off.
// One step per card, on both sides of the fight (the fight as the game builds it, simulateReferenceFight's setup + your leader (owner 21:37), the tune seeds 7300 + 37g):
//   - too hard: each enemy card one 3A + H step weaker (-1 Attack, or -3 Health when it has 1 Attack or less), each card of the Map
//     reference's deck one step stronger (+1 Attack);
//   - too easy: each enemy card one step stronger (+1 Attack), each Map reference card one step weaker.
// The step is applied to every copy at the level it plays (the levelled copy's own stats). The driver: the card whose step moves the win rate
// furthest toward the target; it is then tried at 2 and 3 steps, and the smallest that lands within 8 points (the green band) is the
// suggestion (else the 3-step reading, "not enough alone"). A player-deck card's step moves every fight that deck plays, so it is listed
// beside the enemy's and marked. Reading: a card with a large step effect in a fight is what the fight hangs on; a fight no card moves much is
// carried by its bramble, level or field (the step effect column says so).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const TAG = arg('--road', null), GAMES = +arg('--games', 40), GAP = +arg('--gap', 20), W = +arg('--workers', 2), SEED = 7300;
// the game's fingerprint (app, engine, cards, budget, the leader picker): a cached fight is replayed when any of them changes
const FP = require('crypto').createHash('sha1').update(['arena_app.js', 'bramblewood-engine.js', 'canonical/cards.json', 'bramblewood-budget.js', 'tools/bal13/lib_leader_2026_11_02.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n')).digest('hex').slice(0, 10);
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal13'), STATE = path.join(OUTDIR, 'state'), DATE = '2026-11-02';
if (!TAG) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(1); }
const rows = (() => { const by = {}; fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${TAG}.jsonl`), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(r => { by[r.map + ':' + r.key] = r; });
  return Object.values(by).filter(r => r.target != null && r.curve !== false && Math.abs(r.win - r.target) > GAP).sort((a, b) => a.mapNo - b.mapNo || (a.code < b.code ? -1 : 1)); })();
const LL = require('./lib_leader_2026_11_02.js'); // owner 21:37: your seat plays with its leader (tools/bal13/lib_leader_2026_11_02.js)
const baseOf = (defs, k) => (defs[k] && defs[k].derivedFrom) || k.split('@')[0];
function play(gm, r, mod) {
  const G = gm.G, m = G.CONQUEST_MAPS.find(x => x.id === r.map), n = m.nodes.find(x => x.key === r.key); G.NODE_MAP_HINT.set(n, r.map);
  const ctx = LL.setupLed(gm, r.map, n, { seed0: SEED }, LL.leaderFor(gm, m));
  if (mod) { ctx.defs = Object.assign({}, ctx.defs); const side = mod.side === 'enemy' ? ctx.enemyDeck : ctx.mine;
    Object.keys(side).filter(k => baseOf(ctx.defs, k) === mod.id).forEach(k => { const d = ctx.defs[k]; ctx.defs[k] = Object.assign({}, d, { attack: Math.max(0, (+d.attack || 0) + mod.dA), health: Math.max(1, (+d.health || 0) + mod.dH) }); }); }
  let w = 0; for (let g = 0; g < GAMES; g++) if (LL.playLed(gm, ctx, g).win) w++; return Math.round(w / GAMES * 1000) / 10;
}
function stepOf(D, id, dir, k) { const d = D[id] || {}, a = +d.attack || 0; // dir -1 weaker, +1 stronger; k steps
  if (dir > 0) return { dA: k, dH: 0 }; return a - k >= 1 ? { dA: -k, dH: 0 } : { dA: -Math.max(0, a - 1), dH: -3 * (k - Math.max(0, a - 1)) }; }
function fightFlags(gm, r) {
  const G = gm.G, D = gm.D, t0 = Date.now(), m = G.CONQUEST_MAPS.find(x => x.id === r.map), n = m.nodes.find(x => x.key === r.key); G.NODE_MAP_HINT.set(n, r.map);
  const ctx = LL.setupLed(gm, r.map, n, { seed0: SEED }, LL.leaderFor(gm, m)), easy = r.win > r.target, want = r.target;
  const enemy = [...new Set(Object.keys(ctx.enemyDeck).map(k => baseOf(ctx.defs, k)))], mine = [...new Set(Object.keys(ctx.mine).map(k => baseOf(ctx.defs, k)))];
  const base = play(gm, r, null), tries = [];
  enemy.forEach(id => { const s = stepOf(D, id, easy ? 1 : -1, 1); tries.push({ side: 'enemy', id, step: 1, ...s, win: play(gm, r, { side: 'enemy', id, ...s }) }); });
  mine.forEach(id => { const s = stepOf(D, id, easy ? -1 : 1, 1); tries.push({ side: 'player', id, step: 1, ...s, win: play(gm, r, { side: 'player', id, ...s }) }); });
  const toward = x => easy ? base - x.win : x.win - base; tries.sort((a, b) => toward(b) - toward(a));
  const pick = side => tries.find(x => x.side === side), out = {};
  for (const side of ['enemy', 'player']) { const top = pick(side); if (!top) continue; const ladder = [top];
    for (let k = 2; k <= 3 && Math.abs(ladder[ladder.length - 1].win - want) > 8; k++) { const s = stepOf(D, top.id, (side === 'enemy') === easy ? 1 : -1, k); ladder.push({ side, id: top.id, step: k, ...s, win: play(gm, r, { side, id: top.id, ...s }) }); }
    const best = ladder.find(x => Math.abs(x.win - want) <= 8) || ladder[ladder.length - 1]; out[side] = { driver: top, ladder, suggestion: best, enough: Math.abs(best.win - want) <= 8 }; }
  return { leader: LL.leaderFor(gm, m), code: r.code, map: r.map, mapNo: r.mapNo, side: r.side, mapName: r.mapName, key: r.key, name: r.name, kind: r.kind, measured: r.win, target: want, easy, base, tries: tries.slice(0, 6), ...out, ms: Date.now() - t0 };
}
function runShard(i, n) {
  const gm = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')).loadGame(ROOT); fs.mkdirSync(STATE, { recursive: true });
  rows.filter((r, k) => k % n === i).forEach(r => { const f = path.join(STATE, `flags-${FP}-${GAMES}-${r.win > r.target ? "easy" : "hard"}-${r.map}-${r.key}.json`); if (fs.existsSync(f)) return;
    const x = fightFlags(gm, r); fs.writeFileSync(f, JSON.stringify(x) + '\n'); console.log(r.code, r.win, '->', x.enemy && x.enemy.driver.id, x.enemy && x.enemy.suggestion.win, '|', x.player && x.player.driver.id, x.player && x.player.suggestion.win, Math.round(x.ms / 1000) + 's'); });
}
function report() {
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), D = B.CARD_DEFS_BASELINE, nm = id => (D[id] || {}).name || id;
  const line = (id, s) => { const d = D[id] || {}, a = +d.attack || 0, h = +d.health || 0; return `${a}/${h} -> ${Math.max(0, a + s.dA)}/${Math.max(1, h + s.dH)}`; };
  const all = rows.map(r => { const f = path.join(STATE, `flags-${FP}-${GAMES}-${r.win > r.target ? "easy" : "hard"}-${r.map}-${r.key}.json`); return fs.existsSync(f) ? Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { measured: r.win, target: r.target, easy: r.win > r.target }) : null; }).filter(Boolean); // a fight's flags do not depend on the road file: its reading and band come from this one
  const L = [`# Card flags for the fights more than ${GAP} points off, ${DATE}`, '', 'Package BAL13 (owner 2026-11-02 20:19: "The only thing that should change is the card. But we shouldn\'t choose new cards."). **Flags only**: no card or deck was changed. The owner changes cards.', '',
    `Tool: \`node tools/bal13/card_flags_2026_11_02.js --road ${TAG} --games ${GAMES}\`. The fights: the road measure \`docs/balance/skirmish-pass-${TAG}.jsonl\` (the Map reference, 40 games a fight). Each card of the fight, on both sides, one 3A + H step (1 Attack, or 3 Health on a 1-Attack card) in the direction that closes the gap, ${GAMES} games on the tune seeds (7300 + 37g); the driver (the card whose step moves the fight most) then at 2 and 3 steps; the suggestion is the smallest that lands in the green band (target +/- 8). Stat lines are the card as printed (the fight plays the levelled copy with the same step). A player-deck card is in the Map reference's deck: changing it moves every fight that deck plays. **With leaders** (owner 21:37): the enemy keeps its own; your seat plays the leader a player holds at the map (tools/bal13/lib_leader_2026_11_02.js; column "Your leader").`, '',
    '| Fight | Your leader | Win / target | Enemy driver | Suggested line (enemy) | Reaches | Player-deck driver | Suggested line (player) | Reaches |', '|---|---|---|---|---|---|---|---|---|'];
  all.forEach(x => { const e = x.enemy, p = x.player, cell = (s) => s ? `${nm(s.driver.id)} (one step: ${x.base} -> ${s.driver.win})` : '-', sug = s => s ? `${line(s.suggestion.id, s.suggestion)} (${s.suggestion.step} step${s.suggestion.step > 1 ? 's' : ''})` : '-', reach = s => { if (!s) return '-'; const w = s.suggestion.win, over = x.easy ? w < x.target - 8 : w > x.target + 8; return `${w}${s.enough ? '' : over ? ' (overshoots: a smaller change, e.g. Health only)' : ' (not enough alone)'}`; };
    L.push(`| ${x.code} ${x.name} (${x.mapNo}${x.side ? ' ' + x.map : ''} ${x.mapName}, ${x.easy ? 'too easy' : 'too hard'}) | ${nm(x.leader)} | ${x.measured} / ${Math.round(x.target * 10) / 10} | ${cell(e)} | ${sug(e)} | ${reach(e)} | ${cell(p)} | ${sug(p)} | ${reach(p)} |`); });
  // cards that drive more than one fight
  const tally = {}; all.forEach(x => ['enemy', 'player'].forEach(s => { if (!x[s]) return; const id = x[s].driver.id, k = s + ':' + id; (tally[k] = tally[k] || { side: s, id, fights: [] }).fights.push(x.code + (x.easy ? ' (easy)' : ' (hard)')); }));
  const multi = Object.values(tally).filter(t => t.fights.length > 1).sort((a, b) => b.fights.length - a.fights.length);
  L.push('', '## Cards that drive more than one of these fights', '', '| Card | Side | Fights |', '|---|---|---|'); multi.forEach(t => L.push(`| ${nm(t.id)} (${t.id}) | ${t.side} | ${t.fights.join(', ')} |`));
  const missing = rows.filter(r => !all.some(x => x.map === r.map && x.key === r.key)).map(r => r.code); if (missing.length) L.push('', 'Not measured: ' + missing.join(', '));
  fs.writeFileSync(path.join(OUTDIR, `card-flags-${DATE}.md`), L.join('\n') + '\n');
  fs.writeFileSync(path.join(OUTDIR, `card-flags-${DATE}.json`), JSON.stringify({ about: 'BAL13 card flags (tools/bal13/card_flags_2026_11_02.js); flags only', road: TAG, games: GAMES, gap: GAP, fights: all, multi }, null, 1) + '\n');
  console.log(`-> docs/balance/bal13/card-flags-${DATE}.md (${all.length} fights)`);
}
const sh = arg('--shard', null);
if (sh) { const [i, n] = sh.split('/').map(Number); runShard(i, n); }
else { console.log(rows.length + ' fights more than ' + GAP + ' off'); const base = argv.filter((a, i) => a !== '--workers' && argv[i - 1] !== '--workers');
  Promise.all(Array.from({ length: Math.max(1, W) }, (x, i) => new Promise(res => cp.fork(__filename, base.concat(['--shard', `${i}/${Math.max(1, W)}`]), { stdio: 'inherit' }).on('exit', res)))).then(report); }
