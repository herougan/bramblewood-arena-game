#!/usr/bin/env node
// Package ENG11 (2026-10-27, owner K2: "Coffee N - Double Actions every N turns. Stunned after."): re-fit the Coffee cards after Coffee
// became the new skill (acts twice every Nth round it acts, then Stunned a round), priced by the 4-round rule at 1.5 / N (scale n, pow -1,
// canonical/skill-costs.json) instead of the old Coffee's measured 0.22 (scale half). The fit is FIN2's (tools/fin2_shield_refit_2026_10_26.js):
// the card's Attack:Health shape kept, the largest line holding both caps at Level 1 and its start level, use <= 100% of N.
//   - over its new budget: down to its new line;
//   - on its old line (or over the old budget): to its new line, up or down;
//   - room below its old line already: kept (this pass is not a retune).
// Skirmish decks are not touched. Writes docs/balance/eng11-coffee-refit-2026-10-27.json with every move.
//   node tools/eng11_coffee_refit_2026_10_27.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js');
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const OLD_COFFEE = {id: 'coffee', scale: 'half', value: 0.22};
const oldTable = Object.assign({}, table, {skills: table.skills.map(s=> s.id === 'coffee' ? OLD_COFFEE : s)});
const Tn = SC.make(table), To = SC.make(oldTable);
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const NOTE = '2026-10-27 ENG11 re-fit (Coffee N is the new skill: acts twice every Nth turn, then Stunned)';
function use(T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function lines(T, c){ const sA = c.attack || 0, sH = Math.max(1, c.health), out = []; const seen = new Set();
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), key = A + '/' + H; if(seen.has(key)) continue; seen.add(key);
    const u = use(T, c, A, H); if(u) out.push({A, H, u}); }
  return out; }
const best = (T, c)=> lines(T, c).reduce((b, x)=> (!b || x.u > b.u || (x.u === b.u && x.A + x.H > b.A + b.H)) ? x : b, null);
const moves = [], kept = [], flagged = [];
for(const c of cards){
  if(!c.effects || !c.effects.coffee || c.health == null) continue;
  const a = To.budget(c), b = Tn.budget(c);
  const row = {id: c.id, name: c.name, coffee: c.effects.coffee, stats: `${c.attack || 0}/${c.health}`, old: {S: a.S, x1: a.x1, x2: a.x2, N: a.N, N2: a.N2, ok: a.ok}, now: {S: b.S, x1: b.x1, x2: b.x2, N: b.N, N2: b.N2, ok: b.ok}};
  const A0 = c.attack || 0, H0 = c.health, nowOk = use(Tn, c, A0, H0) > 0, bn = best(Tn, c);
  if(!bn){ flagged.push(c.id); continue; }
  let to = null, why = '';
  if(!nowOk){ to = bn; why = 'over'; }
  else { const bo = best(To, c), onLine = !bo || (bo.A === A0 && bo.H === H0) || use(To, c, A0, H0) === 0; if(onLine){ to = bn; why = 'line'; } }
  if(to && (to.A !== A0 || to.H !== H0)) moves.push(Object.assign(row, {from: `${A0}/${H0}`, to: `${to.A}/${to.H}`, A: to.A, H: to.H, why, use: Math.round(to.u * 100)}));
  else kept.push(Object.assign(row, {why: nowOk ? 'its line holds, or room below its line already' : 'no move'}));
}
console.log(`${moves.length} move, ${kept.length} kept, ${flagged.length} with no legal line`);
moves.forEach(m=> console.log(`  ${m.why.padEnd(4)} ${m.id.padEnd(22)} Coffee ${m.coffee}  ${m.from.padStart(5)} -> ${m.to.padEnd(5)} ${m.use}% of N  S ${m.old.S} -> ${m.now.S}`));
kept.forEach(k=> console.log(`  kept ${k.id.padEnd(22)} Coffee ${k.coffee}  ${k.stats.padStart(5)}  S ${k.old.S} -> ${k.now.S}, x1 ${k.old.x1} -> ${k.now.x1} / ${k.now.N}, x2 ${k.old.x2} -> ${k.now.x2} / ${k.now.N2} (${k.why})`));
if(flagged.length) console.log('  no line: ' + flagged.join(', '));
if(process.argv.includes('apply')){
  for(const m of moves){ const c = cards.find(x=> x.id === m.id); c.attack = m.A; c.health = m.H; c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${NOTE}: ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng11-coffee-refit-2026-10-27.json'), JSON.stringify({_about: 'Package ENG11 (2026-10-27, K2): Coffee N re-priced 1.5 / N (was 0.22, scale half) as the new skill. node tools/eng11_coffee_refit_2026_10_27.js. line: on its old line, moved to its new one; over: over the new budget; kept: its stats stay.', moves: moves.map(m=> ({id: m.id, coffee: m.coffee, from: m.from, to: m.to, why: m.why, use: m.use, old: m.old, now: m.now})), kept, noLine: flagged}, null, 1) + '\n');
  console.log('applied');
}
