'use strict';
// LOOKAHEAD1 (2026-11-22, owner on PILOT: what is "a card only good in a good player's hands"?): a look-ahead pilot for the measured deck's
// seat in the bench / pipeline only (spec.aiMine 'look' or 'look<R>'). Not the game's CPU, no engine rule changed.
// On its turn it lists its choices (the CPU's own turn, pass, each playable unit card x each legal slot, each pitch; at most CAP), and
// for each replays the game from its start (the engine has no state clone: same seed, same earlier choices, so the same state), applies
// the choice, then lets the CPU (spec.ai) play both seats through this round's combat and R more rounds on one fixed RNG per decision
// (the same for every choice; K such RNGs, summed), and scores the end: HQ (Health + Shield) difference + W x the board ((Attack + Health) / 2) difference, +-1000
// for a win / loss. The best choice is played for real (ties: the CPU's own turn, listed first). A played unit or a pitch is followed by
// the CPU finishing the turn (its pitch, Dark Summon ...), so only the unit plays and the pitch are steered.
const DEF_R = 2, DEF_CAP = 12, DEF_K = 2, DEF_W = 1;
// Tuned 2026-11-22 against a level-2 seat. 60 starter-deck mirrors, bramble 30 (level 2: 0.47): R1 K3 0.58, R2 K1 0.65, R2 K2 0.77, R3 K1 0.70,
// R4 K1 0.67. 100 mirrors of a random bench deck, bramble 15 (level 2: 0.51): R2 K2 0.60, R2 K4 0.60, R3 K2 0.60, R5 K2 0.60, to the end
// (R30) K2 0.62, W2 0.59, cap 20 0.60: a plateau near +10 points there (short games, the deal decides many).
const stats = { decisions: 0, replays: 0, diverged: 0, picks: { cpu: 0, pass: 0, play: 0, pitch: 0 } }; // diverged: a replay that did not reach the real state (must stay 0)
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function optsOf(spec) { const m = /^look(\d+)?$/.exec(String(spec.aiMine)); return { R: spec.lookR != null ? spec.lookR : (m && m[1] ? +m[1] : DEF_R), cap: spec.lookCap || DEF_CAP, K: spec.lookK || DEF_K, W: spec.lookW != null ? spec.lookW : DEF_W }; } // (lookR / lookCap / lookK / lookW: tests and probes only, not in the bench cache key)
const units = pl => [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c => c && !c.gap && c.hp > 0 && !c.cageOf);
function stateSig(E, P) { return E.boardSignature(P) + '|' + [1, 2].map(p => [P[p].hq.hp, P[p].hq.shield || 0, P[p].lumber || 0, P[p].hand.map(h => h.uid).join('.'), P[p].deck.length].join(',')).join('|'); }
function score(g, me, W) {
  const a = g.P[me], b = g.P[3 - me], hq = x => Math.max(0, x.hq.hp) + Math.max(0, x.hq.shield || 0), board = x => units(x).reduce((t, c) => t + (Math.max(0, c.atk || 0) + c.hp) / 2, 0);
  const aDead = a.hq.hp <= 0, bDead = b.hq.hp <= 0;
  return (bDead && !aDead ? 1000 : aDead && !bDead ? -1000 : 0) + hq(a) - hq(b) + W * (board(a) - board(b));
}
function candidates(g, p, defs, cap) {
  const { engine, P } = g, pl = P[p];
  if ((pl.skipTurns || 0) > 0 || !pl.hand.length) return [{ kind: 'cpu' }];
  const legal = engine.legalSlots(pl), slots = legal.length ? legal.slice().sort((x, y) => Math.abs(x) - Math.abs(y) || x - y) : ['left', 'right'];
  const seen = new Set(), cards = [], pitches = [];
  pl.hand.forEach(hc => { const d = defs[hc.defId]; if (!d || seen.has(hc.defId)) return; seen.add(hc.defId);
    if (!pl.discardUsedThisTurn) pitches.push({ kind: 'pitch', uid: hc.uid, defId: hc.defId });
    if (d.cardType || d.field || d.darkSummon || engine.isEvoluteDef(hc.defId) || (d.effects && d.effects.parasite) || !engine.canPlay(pl, hc.defId, hc.uid)) return;
    cards.push(hc); });
  const plays = []; slots.forEach(sl => cards.forEach(hc => plays.push({ kind: 'play', uid: hc.uid, defId: hc.defId, slot: sl }))); // round robin: every card at its nearest slots first
  return [{ kind: 'cpu' }, { kind: 'pass' }].concat(plays.slice(0, Math.max(0, cap - 2 - Math.min(2, pitches.length))), pitches).slice(0, cap);
}
function apply(g, p, ch, ai) {
  const { engine, P, sideOf, st } = g; if (ch.kind === 'pass') return;
  if (ch.kind === 'play') engine.placeCard(P, sideOf, p, ch.uid, ch.slot, st, null);
  else if (ch.kind === 'pitch') { const hc = P[p].hand.find(h => h.uid === ch.uid); if (hc) engine.pitchCard(P, sideOf, p, hc, st, null); }
  engine.setAiLevel(ai); engine.aiTakeTurn(P, sideOf, p, st, null);
}
// playGame: tools/opt/deckopt.js's (passed in: no circular require). Returns the real game (g).
function playLook(gm, spec, ctx, mine, aFirst, seed, playGame) {
  const o = optsOf(spec), me = aFirst ? 1 : 2, choices = [];
  function rollout(ch, sig, rollSeed) {
    stats.replays++; let cur = gm.seededRng(seed), k = 0, endR = Infinity;
    const g2 = playGame(gm, spec, ctx, mine, aFirst, seed, () => cur(), {
      turn(p, g) { if (p !== me || k > choices.length) return false;
        if (k < choices.length) { apply(g, p, choices[k++], spec.ai); return true; }
        if (stateSig(gm.E, g.P) !== sig) stats.diverged++;
        apply(g, p, ch, spec.ai); k++; cur = gm.seededRng(rollSeed); endR = g.r + o.R; return true; },
      stop: g => g.r >= endR });
    return score(g2, me, o.W);
  }
  return playGame(gm, spec, ctx, mine, aFirst, seed, null, { turn(p, g) {
    if (p !== me) return false;
    const cands = candidates(g, p, ctx.defs, o.cap); let best = cands[0];
    if (cands.length > 1) { stats.decisions++; const sig = stateSig(gm.E, g.P), rollSeed = seed + '|look|' + choices.length; let bv = -Infinity;
      cands.forEach(ch => { let v = 0; for (let j = 0; j < o.K; j++) v += rollout(ch, sig, fnv(rollSeed + '|' + j)); if (v > bv) { bv = v; best = ch; } }); stats.picks[best.kind]++; }
    apply(g, p, best, spec.ai); choices.push(best); return true; } });
}
module.exports = { playLook, candidates, score, stateSig, stats, DEF_R, DEF_CAP, DEF_K, DEF_W };
