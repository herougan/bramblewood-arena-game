#!/usr/bin/env node
// Package BAL7 (2026-10-28, decision FIN2-2: "price Give Shield N and Bulwark from Shield = 0.8 Health too"). FIN2-c priced a unit's own
// Shield N as 0.8 x N Health (budget.shieldPerHealth). This re-prices the two ways a card hands Shield out, from the same 0.8:
//   - Give Shield N (the 'shield' action): shieldPerHealth x the price of +1 Health given by an action (buff.amount2, 0.5) = 0.40 a point
//     (was 0.35, its 10-19 measured worth);
//   - Bulwark N (two 0/4N Structure shields): the owner set 9 a point (EN3) when the shields' 8 Health a point counted at 1.0; at 0.8 that is
//     9 x 0.8 = 7.2 a point (the owner's premium over 8 kept).
// Then the re-fit, FIN2-c's rule (tools/fin2_shield_refit_2026_10_26.js): the card's Attack:Health shape kept, the largest line holding both
// caps at Level 1 and its start level, use <= 100% of N; band cards only.
//   - over its new budget: down to its new line;
//   - on its old line (its stats were the old best fit, or it was over the old budget): up to its new line when the new price gave room;
//   - room below its old line already: kept (this pass is not a retune); a move up adds at most 30% to 2A + H.
// Skirmish decks are not touched. Writes docs/balance/bal7-shield-refit-2026-10-28.json with every move.
//   node tools/bal7_shield_refit_2026_10_28.js [apply]     (apply also writes the two prices into canonical/skill-costs.json)
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js');
const SCF = path.join(ROOT, 'canonical', 'skill-costs.json');
const table = JSON.parse(fs.readFileSync(SCF, 'utf8'));
const SPH = +table.budget.shieldPerHealth || 0.8, HP_ACT = +(table.actions.find(a=> a.id === 'buff.amount2') || {}).value || 0.5;
const curShield = table.actions.find(a=> a.id === 'shield'), curBul = table.skills.find(s=> s.id === 'bulwark');
const done = curShield.logic === 'shieldPerHealth';
const OLD_SHIELD = done ? curShield.prevValueBAL7 : curShield.value, OLD_BUL = done ? curBul.prevValueBAL7 : curBul.value;
const NEW_SHIELD = Math.round(SPH * HP_ACT * 100) / 100, NEW_BUL = Math.round((curBul.prevValueEN3 != null && done ? OLD_BUL : OLD_BUL) * SPH * 100) / 100;
const withPrices = (s, b)=> Object.assign({}, table, {actions: table.actions.map(a=> a.id === 'shield' ? Object.assign({}, a, {value: s}) : a), skills: table.skills.map(x=> x.id === 'bulwark' ? Object.assign({}, x, {value: b}) : x)});
const To = SC.make(withPrices(OLD_SHIELD, OLD_BUL)), Tn = SC.make(withPrices(NEW_SHIELD, NEW_BUL));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const NOTE = '2026-10-28 BAL7 re-fit (FIN2-2: Give Shield and Bulwark priced from Shield = 0.8 Health)';
function use(T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function lines(T, c){ const sA = c.attack || 0, sH = Math.max(1, c.health), out = []; const seen = new Set();
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), key = A + '/' + H; if(seen.has(key)) continue; seen.add(key);
    const u = use(T, c, A, H); if(u) out.push({A, H, u}); }
  return out; }
const best = (T, c)=> lines(T, c).reduce((b, x)=> (!b || x.u > b.u || (x.u === b.u && x.A + x.H > b.A + b.H)) ? x : b, null);
const moves = [], kept = [], flagged = [];
for(const c of cards){
  if(!c.effects || c.health == null) continue;
  const a = To.budget(c), b = Tn.budget(c); if(a.S === b.S && a.x1 === b.x1 && a.x2 === b.x2) continue;
  const row = {id: c.id, name: c.name, stats: `${c.attack || 0}/${c.health}`, old: {S: a.S, x1: a.x1, x2: a.x2, N: a.N, N2: a.N2, ok: a.ok}, now: {S: b.S, x1: b.x1, x2: b.x2, N: b.N, N2: b.N2, ok: b.ok}};
  if((kindOf.has(c.id) && kindOf.get(c.id) !== 'band') || c.token || c.test || c.cardType || c.easterEgg){ kept.push(Object.assign(row, {why: 'not a band card'})); continue; }
  const A0 = c.attack || 0, H0 = c.health, nowOk = use(Tn, c, A0, H0) > 0, bn = best(Tn, c);
  if(!bn){ flagged.push(c.id); kept.push(Object.assign(row, {why: 'no legal line'})); continue; }
  const w0 = 2 * A0 + H0, w = x=> 2 * x.A + x.H;
  let to = null, why = '';
  if(!nowOk){ to = bn; why = 'over'; }
  else { const bo = best(To, c), onLine = !bo || (bo.A === A0 && bo.H === H0) || use(To, c, A0, H0) === 0;
    // a move up is capped at +30% of the card's 2A + H (not a retune: Muskrat Lodgekeeper's full line was 1/5 -> 2/10)
    if(onLine && w(bn) > w0){ why = 'room'; const up = lines(Tn, c).filter(x=> w(x) > w0 && w(x) <= 1.3 * w0); to = w(bn) <= 1.3 * w0 ? bn : up.reduce((b, x)=> (!b || w(x) > w(b) || (w(x) === w(b) && x.u > b.u)) ? x : b, null); } }
  if(to && (to.A !== A0 || to.H !== H0)) moves.push(Object.assign(row, {from: `${A0}/${H0}`, to: `${to.A}/${to.H}`, A: to.A, H: to.H, why, use: Math.round(to.u * 100)}));
  else kept.push(Object.assign(row, {why: nowOk ? 'room below its line already, or no room gained' : 'no move'}));
}
console.log(`prices: Give Shield ${OLD_SHIELD} -> ${NEW_SHIELD} a point, Bulwark ${OLD_BUL} -> ${NEW_BUL} a point`);
console.log(`${moves.length} move, ${kept.length} kept, ${flagged.length} with no legal line`);
moves.forEach(m=> console.log(`  ${m.why.padEnd(4)} ${m.id.padEnd(24)} ${m.from.padStart(5)} -> ${m.to.padEnd(5)} ${m.use}% of N  S ${m.old.S} -> ${m.now.S}`));
kept.forEach(k=> console.log(`  kept ${k.id.padEnd(24)} ${k.stats.padStart(5)}  S ${k.old.S} -> ${k.now.S}, x1 ${k.old.x1} -> ${k.now.x1} / ${k.now.N}, x2 ${k.old.x2} -> ${k.now.x2} / ${k.now.N2} (${k.why})`));
if(process.argv.includes('apply')){
  if(!done){
    Object.assign(curShield, {value: NEW_SHIELD, prevValueBAL7: OLD_SHIELD, logic: 'shieldPerHealth', bal7Note: `2026-10-28 (package BAL7, decision FIN2-2): priced from Shield = 0.8 Health: shieldPerHealth ${SPH} x buff.amount2 ${HP_ACT} (+1 Health given by an action) = ${NEW_SHIELD} a point (was ${OLD_SHIELD})`});
    Object.assign(curBul, {value: NEW_BUL, prevValueBAL7: OLD_BUL, bal7Note: `2026-10-28 (package BAL7, decision FIN2-2): the shields' Health at 0.8 (shieldPerHealth): the owner's ${OLD_BUL} (EN3, when 8 Health a point counted at 1.0) x ${SPH} = ${NEW_BUL} a point`});
    // the file keeps one entry a line: rewrite only those two lines
    const txt = fs.readFileSync(SCF, 'utf8').split('\n');
    const at = (id, sec)=> txt.findIndex(l=> l.startsWith(`  {"id":"${id}",`) && (sec === 'actions' ? l.includes('"per":"amount"') : l.includes('"scale":"n"')));
    const i1 = at('shield', 'actions'), i2 = at('bulwark', 'skills'); if(i1 < 0 || i2 < 0) throw new Error('entry line not found');
    txt[i1] = '  ' + JSON.stringify(curShield) + (txt[i1].trimEnd().endsWith(',') ? ',' : '');
    txt[i2] = '  ' + JSON.stringify(curBul) + (txt[i2].trimEnd().endsWith(',') ? ',' : '');
    fs.writeFileSync(SCF, txt.join('\n')); JSON.parse(fs.readFileSync(SCF, 'utf8'));
  }
  for(const m of moves){ const c = cards.find(x=> x.id === m.id); c.attack = c.attack == null && m.A === 0 ? c.attack : m.A; c.health = m.H; c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${NOTE}: ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal7-shield-refit-2026-10-28.json'), JSON.stringify({_about: 'Package BAL7 (2026-10-28, FIN2-2): Give Shield N and Bulwark N priced from Shield = 0.8 Health. node tools/bal7_shield_refit_2026_10_28.js. room: on its old line, the new price gave room; over: over the new budget; kept: its stats stay.', prices: {giveShield: [OLD_SHIELD, NEW_SHIELD], bulwark: [OLD_BUL, NEW_BUL]}, moves: moves.map(m=> ({id: m.id, from: m.from, to: m.to, why: m.why, use: m.use, old: m.old, now: m.now})), kept, noLine: flagged}, null, 1) + '\n');
  console.log('applied');
}
