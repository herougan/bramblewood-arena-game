#!/usr/bin/env node
// Re-fit after a skill-price change (2026-10-21, owner 23:58: the hub Skill costs edits, "consider this a human pass I").
// For each card whose skill worth S moved (the list in argv[2], a JSON array of ids), keep its current Attack:Health shape and take the
// largest line on that shape that holds BOTH caps (2A+H+S <= N, A*H + S*|S| <= (N/3)^2, half-miss x1.5) at Level 1 and at its start
// level, with use <= 100% of N. Attack 0 stays 0; a non-zero Attack stays >= 1; Health >= 1. No fit at all: the floor, flagged.
// Only band cards (BF6 plan kind 'band'): tokens, eggs, equipment and Easter eggs are priced their own way and are left alone.
//   node tools/refit_pass_2026_10_21.js ids.json          dry run      ... apply    writes canonical/cards.json
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./card_retune_2026_10_19.js').SC;
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const ids = new Set(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function ok(c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
const moves = [], flagged = [];
for(const c of cards){
  if(!ids.has(c.id) || kindOf.get(c.id) !== 'band' || c.health == null || c.easterEgg) continue;
  const A0 = c.attack || 0, H0 = c.health, sA = A0, sH = Math.max(1, H0);
  let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){
    const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k));
    const u = ok(c, A, H); if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u};
  }
  if(!best){ const A = sA === 0 ? 0 : 1; best = {A, H: 1, u: 0}; flagged.push(c.id); }
  if(best.A !== A0 || best.H !== H0) moves.push({c, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, A: best.A, H: best.H, u: best.u});
}
console.log(`${moves.length} cards move; ${flagged.length} have no legal line at all (floor, flagged)`);
moves.slice(0, 30).forEach(m=> console.log(`  ${m.c.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} ${(m.u * 100).toFixed(0)}%`));
if(process.argv.includes('apply')){
  for(const m of moves){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H;
    m.c.creatorNote = (m.c.creatorNote ? m.c.creatorNote + ' ' : '') + `2026-10-21 human pass I (owner's hub skill costs): ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'), JSON.stringify(flagged, null, 1) + '\n');
  console.log('applied');
}
