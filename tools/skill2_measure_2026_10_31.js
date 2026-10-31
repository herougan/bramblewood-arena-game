#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decisions BUDGET2-1 / BUDGET2-2 / DECK1-1): every skill on an in-play card measured against the canon
// anchors with one shared measure (tools/skill_canon_2026_10_31.js: the same six vanilla carriers, the same fights, the same seed), so the
// prices it gives agree with each other and with the 3A + H stats.
//
//   node tools/skill2_measure_2026_10_31.js plan                   the list: each in-play skill, its N, its cards, what is measured and why not
//   node tools/skill2_measure_2026_10_31.js run [--minutes 9]      measures the plan's items not yet in the results file, most-used first;
//                                                                  stops starting new items after --minutes (re-run to go on: games are cached)
//   node tools/skill2_measure_2026_10_31.js run --only armor=3,brood=2   only these items (plan keys)
//   node tools/skill2_measure_2026_10_31.js show                   the results table
// Options: --cache-dir D (the bench cache; default tests/out/skill2-cache), --games-top M (1000), --games M (400), --games-one M (300), --workers N.
// Output: docs/balance/skill2-measures-2026-10-31.json (one entry per plan key: the canon tool's test result; written after each item).
// Games: an item on 4+ in-play cards, or named by DECK1-1, plays --games-top paired fights a variant; on 2-3 cards --games; on one --games-one.
// What is not measured (kind 'skip'): parameters of another skill (bramblewood-budget.js PARAMS: swarmN, hunterVs, arrowCount ...), Slow
// (a multiplier on S), the canon points themselves (fixed: tools/skill_canon_2026_10_31.js check measures them).
// What is measured for the record only (kind 'report'; tools/skill2_apply_2026_10_31.js does not write it): the half-miss skills (Flying,
// Evasive: priced by missMult on the stats, a budget constant), the time-of-day skills (zeit: priced by the 4-round rule at their uptime, in
// 3A + H already), the context and threshold skills (braces x a measured share).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'balance', 'skill2-measures-2026-10-31.json');
const DECK1_1 = ['brood', 'fletcher', 'remember', 'executioner']; // DECK1-1: re-price these (and Remember's On Death → Exile self trigger)
const numOf = v => typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b) => a + (+b || 0), 0) : 0);

function buildPlan() {
  const LB = require('./lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LMP = require('./lib_map_pools.js'), SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
  const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(table);
  const SK = {}; table.skills.forEach(e => { SK[e.id] = e; });
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  const PARAMS = new Set(BB.PARAMS || []), HALF = new Set(table.halfMiss || []), SH = table.shorthands || {};
  const canonAt = {}; table.skills.filter(e => e.canon).forEach(e => { canonAt[e.id] = (e.canonAt || [true]).map(n => JSON.stringify(n)); });
  const items = {};
  const add = (key, o, cardId) => { const it = items[key] = items[key] || Object.assign({ key, cards: [] }, o); if (!it.cards.includes(cardId)) it.cards.push(cardId); };
  cards.forEach(c => {
    const d = D[c.id]; if (!d || c.pool || c.token || c.test || !SC.measured(c) || c.health == null || LMP.isOutOfPlay(G, d)) return;
    const e = c.effects || {};
    Object.keys(e).forEach(k => {
      if (k === 'triggers') { (Array.isArray(e.triggers) ? e.triggers : []).forEach(t => { if (!t) return; const sig = JSON.stringify(t);
        add('T:' + t.on + '>' + t.do + (Object.keys(t).length > 2 ? ' ' + sig : ''), { kind: 'measure', class: 'trigger', id: t.on + '>' + t.do, test: { triggers: [t] } }, c.id); });
        return; }
      const v = e[k], key = k + (v === true ? '' : '=' + JSON.stringify(v));
      // the test: the key at its value + its parameters on this card (Hunter + Hunter vs, Esprit + Esprit Hp, Swarm + Swarm N ...)
      const test = { [k]: v }; Object.keys(e).filter(p => p !== k && p.startsWith(k) && (PARAMS.has(p) || /(Hp|Grant|N|Uses|Count|Vs|Bramble|Poison|Bleed)$/.test(p))).forEach(p => { test[p] = e[p]; });
      const se = SK[k];
      let kind = 'measure', why = '', cls = SH[k] ? 'shorthand' : 'keyword';
      if (PARAMS.has(k)) { kind = 'skip'; why = 'a parameter of another skill'; }
      else if (se && se.scale === 'mult') { kind = 'skip'; why = 'a multiplier on the card\'s S (Slow)'; }
      else if (canonAt[k] && canonAt[k].includes(JSON.stringify(v))) { kind = 'skip'; why = 'a canon point (tools/skill_canon_2026_10_31.js check)'; cls = 'canon'; }
      else if (HALF.has(k)) { kind = 'report'; why = 'half-miss: priced by missMult (x' + (table.budget.missMult || 1.5) + ' on the stat terms), a budget constant'; }
      else if (se && se.logic) { kind = 'report'; why = 'priced by the 4-round rule (' + se.logic + ') in 3A + H points'; }
      else if (BB.zeitS && BB.zeitS(k, e)) { kind = 'report'; why = 'the time of day at its uptime (zeitS), in 3A + H points'; }
      else if (BB.thrS && BB.thrS(k, v, e, () => 1)) { kind = 'report'; why = 'a threshold skill: braces x the measured share (thrS)'; }
      else if (BB.contextS && BB.contextS(k, v, () => 1)) { kind = 'report'; why = 'a context skill: braces x CONTEXT_MULT (contextS)'; }
      else if (!se && !SH[k]) { kind = 'skip'; why = 'no entry in canonical/skill-costs.json'; }
      add(key, { kind, why, class: cls, id: k, n: v, test }, c.id);
    });
  });
  // DECK1-1's same-card pairs, measured as the card carries them: Remember N with its On Death → Exile self (Remember acts only from the
  // Exile zone, so either half alone reads nothing), and Fletcher beside the card's own Arrow 1 (the Quartermaster; its worth = the pair
  // minus Arrow 1 alone)
  const xd = { triggers: [{ on: 'onDeath', do: 'exileSelf' }] };
  [1, 2].forEach(n => add('remember=' + n + '+T:onDeath>exileSelf', { kind: 'measure', class: 'combo', id: 'remember', n, test: Object.assign({ remember: n }, xd), pair: true }, n === 1 ? 'ashbone-ghoul' : 'marsh-wisp'));
  add('arrow=1+fletcher=1', { kind: 'measure', class: 'combo', id: 'fletcher', n: 1, test: { arrow: 1, fletcher: 1 }, pair: true, minus: 'arrow=1' }, 'eagle-owl-quartermaster');
  // the placebo: a key the engine does not know. The CPU values a card by its number of effect keys (bramblewood-engine.js cardValue,
  // + 1.5 a key: it pitches the card later), so any added key reads a small gain on its own; that reading is the measure's zero for a skill
  add('placebo', { kind: 'measure', class: 'placebo', id: 'skill2Placebo', n: true, test: { skill2Placebo: true }, pair: true }, '(none)');
  Object.values(items).forEach(it => { if (it.id === 'remember' && !it.pair || it.id === 'onDeath>exileSelf') { it.kind = 'skip'; it.why = 'measured as the pair Remember N + On Death → Exile self'; } });
  const list = Object.values(items).map(it => Object.assign(it, { nCards: it.cards.length, deck1: DECK1_1.includes(it.id) || it.id === 'onDeath>exileSelf' || it.key === 'arrow=1' || it.key === 'placebo' }))
    .sort((a, b) => (b.deck1 - a.deck1) || b.nCards - a.nCards || (a.key < b.key ? -1 : 1));
  return list;
}
function readOut() { return fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { _about: null, results: {} }; }
function writeOut(j) { fs.writeFileSync(OUT, JSON.stringify(j, null, 1) + '\n'); }
const ABOUT = 'SKILL2 (2026-10-31): every skill on an in-play card measured against the canon anchors (tools/skill_canon_2026_10_31.js measure, global context, six vanilla carriers, paired fights). Built by node tools/skill2_measure_2026_10_31.js run; read by tools/skill2_apply_2026_10_31.js. worthRuler = the verdict (canon points = 3A + H stat points since SKILL2); price = the table price on the carriers when measured.';

async function main(argv) {
  const cmd = argv[0] || 'help', a = argv.slice(1), o = { cacheDir: path.join(ROOT, 'tests', 'out', 'skill2-cache'), gamesTop: 1000, games: 400, gamesOne: 300, minutes: 9, workers: 2 };
  while (a.length) { const k = a.shift();
    if (k === '--cache-dir') o.cacheDir = a.shift(); else if (k === '--games-top') o.gamesTop = +a.shift(); else if (k === '--games') o.games = +a.shift();
    else if (k === '--games-one') o.gamesOne = +a.shift(); else if (k === '--minutes') o.minutes = +a.shift(); else if (k === '--only') o.only = a.shift().split(','); else if (k === '--workers') o.workers = +a.shift();
    else if (k === '--report') o.report = true; else throw new Error('unknown option ' + k); }
  if (cmd === 'help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
  const plan = buildPlan();
  const gamesOf = it => (it.nCards >= 4 || it.deck1) ? o.gamesTop : it.nCards >= 2 ? o.games : o.gamesOne;
  if (cmd === 'plan') {
    const by = k => plan.filter(it => it.kind === k);
    console.log(`in-play skills: ${plan.length} (measure ${by('measure').length}, report ${by('report').length}, skip ${by('skip').length})`);
    plan.forEach(it => console.log(`${it.kind.padEnd(7)} ${String(it.nCards).padStart(3)} ${it.key.slice(0, 60).padEnd(60)} ${it.kind === 'skip' ? it.why : gamesOf(it) + ' fights' + (it.why ? '; ' + it.why : '')}`));
    return;
  }
  if (cmd === 'run') {
    const C = require('./skill_canon_2026_10_31.js'), L = require('./bench/lib.js'), j = readOut(); j._about = ABOUT;
    const t0 = Date.now(); let done = 0;
    const todo = plan.filter(it => (it.kind === 'measure' || (it.kind === 'report' && (o.report || it.nCards >= 2))) && (!o.only || o.only.includes(it.key))
      && !(j.results[it.key] && j.results[it.key].fights >= gamesOf(it) && j.results[it.key].fingerprint === L.fingerprint()));
    console.log(`${todo.length} item(s) to measure`);
    for (const it of todo) {
      if ((Date.now() - t0) / 60000 > o.minutes) { console.log(`stopping after ${o.minutes} minutes: re-run to go on`); break; }
      const M = gamesOf(it), s = Date.now();
      const res = await C.run(Object.assign(L.defaults(), { cmd: 'measure', test: it.test, games: M, cacheDir: o.cacheDir, workers: o.workers, quiet: true }));
      j.results[it.key] = { key: it.key, id: it.id, class: it.class, kind: it.kind, n: it.n, nCards: it.nCards, cards: it.cards, fights: M, fingerprint: res.fingerprint,
        canonRate: res.canonRate, statRate: res.statRate, kappa: res.kappa, placebo: res.placebo || null /* set: the test's reading is already less the placebo's (canon tool 1.1.0) */, test: res.test };
      writeOut(j); done++;
      const t = res.test; console.log(`${it.key.slice(0, 50).padEnd(50)} ${String(M).padStart(5)}  gain ${(t.gain * 100).toFixed(1).padStart(5)}  worth ${t.worthRuler.m} [${t.worthRuler.lo}, ${t.worthRuler.hi}]  price ${t.price}  ${Math.round((Date.now() - s) / 1000)} s`);
    }
    console.log(`measured ${done}; ${Object.keys(j.results).length} in ${path.relative(ROOT, OUT)}`);
    return;
  }
  if (cmd === 'show') { const j = readOut(); plan.forEach(it => { const r = j.results[it.key]; if (!r) return; const t = r.test;
    console.log(`${it.kind.padEnd(7)} ${String(it.nCards).padStart(3)} ${it.key.slice(0, 50).padEnd(50)} ${String(r.fights).padStart(5)} worth ${String(t.worthRuler.m).padStart(7)} [${t.worthRuler.lo}, ${t.worthRuler.hi}] price ${t.price}`); }); return; }
  throw new Error('unknown command ' + cmd);
}
module.exports = { buildPlan, OUT };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
