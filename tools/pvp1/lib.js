// 2026-11-06 (package PVP1, owner 20:28 #5: "PVP: Create more varied decks (Slightly optimised) for my experimentation"): the shared core of
// tools/pvp1/pvp1.js. A PvP game played headless by the real engine, both seats piloted by the CPU (skill 1), as Standard PvP deals it:
// every card at Level 1, the Standard arena ruleset (day / night cycle), both brambles the plain castle at BRAMBLE_SCALE (15 Health), +1
// Shield for the seat that plays second, seats swapped every other game, and each side's leader dealt the way the game deals an engine-played
// seat its leader (G.dealPlayerLeader, FIX6). Deck rules: bramblewood-ghosts.js validateDeck (20 cards, rarity copy caps, top-rank caps with
// the leader counted), the rule every recorded PvP deck is checked against.
'use strict';
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const C = require(path.join(ROOT, 'tools', 'balance', 'contribution.js'));
const Ghosts = require(path.join(ROOT, 'bramblewood-ghosts.js'));
const LEVEL = 1, AI = 1, RULES = { phase: 'cycle' };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

let GM = null, DEFS = null, CASTLE = null;
function game() {
  if (!GM) { GM = O.loadGame(ROOT); DEFS = GM.G.referenceBaseDefs();
    const brambleChar = new Function(['BRAMBLE_SCALE', 'brambleHp', 'brambleChar'].map(n => GM.B.grab(n)).join('\n') + '\nreturn brambleChar;')(); // the harness evaluates these but does not export them
    CASTLE = brambleChar(GM.B.CHARACTER_DEFS.castle); }
  return GM;
}
function defs() { game(); return DEFS; }

// in-play cards: BAL6's playable cards (no tokens, tests, heroes, leaders, spells, Materia, equipment, Easter eggs) that are not hidden and
// that something gives out (the game's dynamic isUnattainable)
function pool() { const gm = game(), D = gm.D; return Object.keys(D).filter(id => C.fieldable(gm, id) && !D[id].hidden && !gm.G.isUnattainable(D[id])).sort(); }
// the valid leaders: arena_app.js canLeadDef (a Leader / Dictator skill, or Heroic and up), in play, a creature (no equipment, egg or the
// Wandering Traveller, the game's no-leader stand-in)
function canLead(gm, d) { const B = gm.Budget; return !!d && !d.token && !d.test && !d.hero && (!!(d.effects && (d.effects.leader || d.effects.dictator)) || B.rankOf(d.rarity || 'common') >= B.rankOf('heroic')); }
function leaders() {
  const gm = game(), D = gm.D;
  return Object.keys(D).filter(id => { const d = D[id]; return canLead(gm, d) && id !== 'wandering-traveller' && !d.hidden && !d.pool && !d.easterEgg && !d.eggKind && !d.equip
    && !['equipment', 'materia', 'spell'].includes(d.cardType) && d.attack != null && !gm.G.isUnattainable(d); }).sort();
}
const validate = (deck, leader) => Ghosts.validateDeck(game().D, deck, leader ? [leader] : []);

// one game: the score of side a (1 win, 0.5 draw, 0 loss); a sits first on even g
function playOne(a, b, seedKey, g) {
  const gm = game(), E = gm.E, G = gm.G, D = defs();
  const engine = E.makeSimEngine(D, gm.seededRng((fnv(seedKey) + Math.imul(g + 1, 2654435761)) >>> 0), { recordEvents: false, battleMode: G.CONQUEST_DEFAULT_MODE || 'open', rules: RULES, aiAim: true, aiLevel: AI });
  const castle = CASTLE, first = g % 2 === 0 ? a : b, second = first === a ? b : a, sideOf = id => id === 1 ? 'A' : 'B', st = {};
  const P = { 1: engine.newPlayer(1, O.mineFor(gm, D, first.deck, LEVEL), castle), 2: engine.newPlayer(2, O.mineFor(gm, D, second.deck, LEVEL), castle) };
  P[1].loopCards = []; P[2].loopCards = [];
  if (first.leader) G.dealPlayerLeader(P[1], first.leader, D); if (second.leader) G.dealPlayerLeader(P[2], second.leader, D);
  engine.draw(P[1], 3, 'A', st, null); engine.draw(P[2], 3, 'B', st, null);
  engine.applySecondPlayerBonus(P[2], 'B', st, null); // the Standard ruleset's secondDraw: +1 Shield on the second seat's bramble
  let over = false, lastSig = null, stalled = 0;
  for (let r = 1; r <= E.DRAW_ROUND_CAP && !over; r++) {
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p => { P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if (r > 1) engine.roundStart(P, r, sideOf, st, null);
    engine.aiTakeTurn(P, sideOf, 1, st, null); engine.aiTakeTurn(P, sideOf, 2, st, null);
    over = engine.resolveCombat(P, sideOf, st, null, r % 2 === 0 ? 1 : 2); if (over) break;
    const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if (stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', st, null); engine.draw(P[2], 1, 'B', st, null);
  }
  const me = first === a ? 1 : 2, aDead = P[me].hq.hp <= 0, bDead = P[3 - me].hq.hp <= 0;
  return aDead && !bDead ? 0 : bDead && !aDead ? 1 : 0.5;
}
function playRange(a, b, seedKey, from, to) { let s = 0; for (let g = from; g < to; g++) s += playOne(a, b, seedKey, g); return s; }

if (!isMainThread && workerData && workerData.pvp1) parentPort.on('message', m => {
  try { parentPort.postMessage({ id: m.id, s: m.jobs.map(j => playRange(j.a, j.b, j.key, j.from, j.to)) }); }
  catch (e) { parentPort.postMessage({ id: m.id, err: String(e && e.stack || e) }); }
});

// a worker pool: run(jobs) -> the score sum of each job ({a, b, key, from, to}); workers 0 plays inline
class Pool {
  constructor(n) { this.n = n; this.ws = []; this.q = []; this.cb = new Map(); this.seq = 0; this.games = 0;
    for (let k = 0; k < n; k++) { const w = new Worker(__filename, { workerData: { pvp1: true } }); w.idle = true;
      w.on('message', m => { w.idle = true; const c = this.cb.get(m.id); this.cb.delete(m.id); if (m.err) { console.error(m.err); process.exit(2); } c(m.s); this.pump(); });
      w.on('error', e => { console.error(e); process.exit(2); }); this.ws.push(w); } }
  pump() { for (const w of this.ws) { if (!w.idle || !this.q.length) continue; const t = this.q.shift(); w.idle = false; const id = ++this.seq; this.cb.set(id, t.done); w.postMessage({ id, jobs: t.jobs }); } }
  async run(jobs) {
    jobs.forEach(j => this.games += j.to - j.from);
    if (!this.n) return jobs.map(j => playRange(j.a, j.b, j.key, j.from, j.to));
    const per = Math.max(1, Math.ceil(jobs.length / (this.n * 4))), parts = [];
    for (let i = 0; i < jobs.length; i += per) parts.push(jobs.slice(i, i + per));
    const res = await Promise.all(parts.map(p => new Promise(done => { this.q.push({ jobs: p, done }); this.pump(); })));
    return [].concat(...res);
  }
  close() { this.ws.forEach(w => w.terminate()); }
}

module.exports = { ROOT, O, Ghosts, fnv, game, defs, pool, leaders, canLead, validate, playOne, playRange, Pool, LEVEL };
