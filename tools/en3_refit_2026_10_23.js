#!/usr/bin/env node
// EN3 re-fit (2026-10-23, owner 19:27 #6 / #9): after the Bleed / Poison-family prices went up a tenth and Bulwark went 6 -> 9
// (tools/en3_skill_costs_2026_10_23.py), the cards whose skill worth S moved are re-fitted the way tools/refit_pass_2026_10_21.js does it
// (same shape, the largest line inside both caps at Level 1 and the start level, use <= 100% of N; band cards only), with two changes the
// brief asks for:
//   - a card the re-fit would LOWER is held at its stats and listed for the owner (as BF11-1: hold, trim a skill per card later);
//     the list goes to docs/balance/en3-refit-2026-10-23.json and the owner call EN3-6;
//   - the no-legal-line list is MERGED into docs/balance/human-pass-1-flagged-2026-10-21.json (union), not overwritten.
//   node tools/en3_refit_2026_10_23.js <skill-costs-before.json>          dry run
//   node tools/en3_refit_2026_10_23.js <skill-costs-before.json> apply    writes canonical/cards.json (raises only)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js');
const NOTE = '2026-10-23 EN3 re-fit (Bleed / Poison family +0.1, Bulwark 9)';
const before = SC.make(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function ok(c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
const moved = cards.filter(c=> c.health != null && Math.abs((T.budget(c, {level: 1}).S || 0) - (before.budget(c, {level: 1}).S || 0)) > 1e-9);
const raises = [], held = [], flagged = [], skipped = [];
for(const c of moved){
  if(kindOf.get(c.id) !== 'band' || c.easterEgg){ skipped.push(c.id); continue; }
  const A0 = c.attack || 0, H0 = c.health, sH = Math.max(1, H0); let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), H = Math.max(1, Math.round(sH * k));
    const u = ok(c, A, H); if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u}; }
  const sOld = before.budget(c, {level: 1}).S, sNew = T.budget(c, {level: 1}).S;
  if(!best){ flagged.push(c.id); continue; }
  if(best.A === A0 && best.H === H0) continue;
  const row = {id: c.id, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, S: `${+sOld.toFixed(2)} -> ${+sNew.toFixed(2)}`, use: Math.round(best.u * 100)};
  if(2 * best.A + best.H >= 2 * A0 + H0) raises.push(Object.assign(row, {c, A: best.A, H: best.H})); else held.push(row);
}
console.log(`${moved.length} cards' S moved (${skipped.length} not band cards, left alone); ${raises.length} raise, ${held.length} would drop (held), ${flagged.length} no legal line (flagged)`);
raises.forEach(m=> console.log(`  raise ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
held.forEach(m=> console.log(`  held  ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
if(flagged.length) console.log('  flagged: ' + flagged.join(', '));
if(process.argv.includes('apply')){
  for(const m of raises){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H; m.c.creatorNote = (m.c.creatorNote ? m.c.creatorNote + ' ' : '') + `${NOTE}: ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  const FP = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'); let prev = []; try{ prev = JSON.parse(fs.readFileSync(FP, 'utf8')); }catch(e){}
  fs.writeFileSync(FP, JSON.stringify([...new Set(prev.concat(flagged))], null, 1) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'en3-refit-2026-10-23.json'), JSON.stringify({about: 'EN3 re-fit (2026-10-23): ' + NOTE + '. Raises applied; drops held at their stats for the owner (call EN3-6, as BF11-1); no-legal-line cards merged into human-pass-1-flagged-2026-10-21.json.', moved: moved.map(c=> c.id), notBand: skipped,
    raised: raises.map(({c, A, H, ...r})=> r), held, flagged}, null, 1) + '\n');
  console.log('applied');
}
