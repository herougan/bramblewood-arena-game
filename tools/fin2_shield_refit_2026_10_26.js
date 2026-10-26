#!/usr/bin/env node
// Package FIN2-c (2026-10-26, owner 23:46 #3: "Shield should be valued less than health. E.g. maybe 0.8. So tide pool crab is heavily
// undertuned (though its a beginner card, so it should be weaker)"): re-fit after a unit's own Shield N became 0.8 x N Health in the caps'
// stat terms (bramblewood-budget.js shieldHealthOf) instead of a skill in S at scale 'half'. The fit is BAL2's (tools/bal2_refit_2026_10_24.js):
// the card's Attack:Health shape kept, the largest line holding both caps at Level 1 and its start level, use <= 100% of N; band cards only.
//   - over its new budget: down to its new line;
//   - on its old line (its stats were the old best fit, or it was over the old budget): up to its new line when Shield's new price gave room;
//   - room below its old line already: kept (this pass is not a retune).
// BEGINNER (the owner's "beginner card ... should be weaker"): the smallest step up its shape that the new room allows, not the whole line.
// The old pricing is Shield at scale 'half', value 1 (canonical/skill-costs.json before FIN2-c) and no Shield in the stat terms (sh 0).
// Skirmish decks are not touched. Writes docs/balance/fin2-shield-refit-2026-10-26.json with every move.
//   node tools/fin2_shield_refit_2026_10_26.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const oldTable = Object.assign({}, table, {budget: Object.assign({}, table.budget, {shieldPerHealth: 0}),
  skills: table.skills.map(s=> s.id === 'shield' && !s.scale ? s : s.id === 'shield' ? Object.assign({}, s, {scale: 'half', value: 1}) : s)});
const Tn = SC.make(table), To = SC.make(oldTable);
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const NOTE = '2026-10-26 FIN2-c re-fit (Shield priced as 0.8 Health)', BEGINNER = new Set(['tide-pool-crab']);
function use(T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function lines(T, c){ const sA = c.attack || 0, sH = Math.max(1, c.health), out = []; const seen = new Set();
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), key = A + '/' + H; if(seen.has(key)) continue; seen.add(key);
    const u = use(T, c, A, H); if(u) out.push({A, H, u}); }
  return out; }
const best = (T, c)=> lines(T, c).reduce((b, x)=> (!b || x.u > b.u || (x.u === b.u && x.A + x.H > b.A + b.H)) ? x : b, null);
const moves = [], kept = [], flagged = [];
// The cards Shield's price moves: their S or either cap's left side changed
for(const c of cards){
  if(!c.effects || c.health == null) continue;
  const a = To.budget(c), b = Tn.budget(c); if(a.S === b.S && a.x1 === b.x1 && a.x2 === b.x2) continue;
  const row = {id: c.id, name: c.name, stats: `${c.attack || 0}/${c.health}`, old: {S: a.S, x1: a.x1, x2: a.x2, N: a.N, N2: a.N2, ok: a.ok}, now: {S: b.S, x1: b.x1, x2: b.x2, N: b.N, N2: b.N2, ok: b.ok}};
  if((kindOf.has(c.id) && kindOf.get(c.id) !== 'band') || c.token || c.test || c.cardType || c.easterEgg){ kept.push(Object.assign(row, {why: 'not a band card'})); continue; }
  const A0 = c.attack || 0, H0 = c.health, nowOk = use(Tn, c, A0, H0) > 0, bn = best(Tn, c);
  if(!bn){ flagged.push(c.id); continue; }
  const w0 = 2 * A0 + H0, w = x=> 2 * x.A + x.H;
  let to = null, why = '';
  if(!nowOk){ to = bn; why = 'over'; }
  else { const bo = best(To, c), onLine = !bo || (bo.A === A0 && bo.H === H0) || use(To, c, A0, H0) === 0;
    if(onLine && w(bn) > w0){ why = 'room';
      to = BEGINNER.has(c.id) ? lines(Tn, c).filter(x=> w(x) > w0).sort((p, q)=> w(p) - w(q) || q.u - p.u)[0] : bn; } }
  if(to && (to.A !== A0 || to.H !== H0)) moves.push(Object.assign(row, {from: `${A0}/${H0}`, to: `${to.A}/${to.H}`, A: to.A, H: to.H, why, use: Math.round(to.u * 100), beginner: BEGINNER.has(c.id)}));
  else kept.push(Object.assign(row, {why: nowOk ? 'room below its line already, or no room gained' : 'no move'}));
}
console.log(`${moves.length} move, ${kept.length} kept, ${flagged.length} with no legal line`);
moves.forEach(m=> console.log(`  ${m.why.padEnd(4)} ${m.id.padEnd(22)} ${m.from.padStart(5)} -> ${m.to.padEnd(5)} ${m.use}% of N${m.beginner ? ' (beginner: smallest step up)' : ''}  S ${m.old.S} -> ${m.now.S}`));
kept.forEach(k=> console.log(`  kept ${k.id.padEnd(22)} ${k.stats.padStart(5)}  S ${k.old.S} -> ${k.now.S}, x1 ${k.old.x1} -> ${k.now.x1} / ${k.now.N}, x2 ${k.old.x2} -> ${k.now.x2} / ${k.now.N2} (${k.why})`));
if(flagged.length) console.log('  no line: ' + flagged.join(', '));
if(process.argv.includes('apply')){
  for(const m of moves){ const c = cards.find(x=> x.id === m.id); c.attack = c.attack == null && m.A === 0 ? c.attack : m.A; c.health = m.H; c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${NOTE}: ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'fin2-shield-refit-2026-10-26.json'), JSON.stringify({_about: 'Package FIN2-c (2026-10-26): Shield N priced as 0.8 x N Health in the caps (was a skill in S, scale half). node tools/fin2_shield_refit_2026_10_26.js. room: on its old line, the new price gave room (a beginner card takes the smallest step); over: over the new budget; kept: its stats stay.', moves: moves.map(m=> ({id: m.id, from: m.from, to: m.to, why: m.why, use: m.use, old: m.old, now: m.now})), kept, noLine: flagged}, null, 1) + '\n');
  console.log('applied');
}
