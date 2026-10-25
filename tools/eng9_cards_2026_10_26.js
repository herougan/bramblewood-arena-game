#!/usr/bin/env node
// Package ENG9 (2026-10-26): the card edits the rules ask for, then the re-fit of every card whose price moved.
//   edits: E1 the five cards with the old self-Revive (true) carry Undead (the self-return as a token); the test card's Revive is the action;
//          E13 the Beaver Lumberjack's On Ready: +1 Lumber trigger becomes the named keyword Stockpile 1 (same price, 0.9);
//          G9 the Fungi: the Fungal Colossus and the Puffball Bombardier are Fungi (archetype and species; the Codex kingdom beside Flora).
//   re-fit: as tools/en3_refit_2026_10_23.js (the largest line on the card's own Attack : Health shape inside both caps at Level 1 and its
//          start level, use <= 100% of N; band cards only). A card the re-fit would RAISE is raised; one it would LOWER is held at its stats
//          and listed (BF11-1 / EN3-6: hold, trim a skill later). Moved = its S or its N multiplier changed (Chained is an N multiplier now).
//   node tools/eng9_cards_2026_10_26.js <skill-costs-before.json> <cards-before.json>          dry run
//   node tools/eng9_cards_2026_10_26.js <skill-costs-before.json> <cards-before.json> apply    writes canonical/cards.json + docs/balance/eng9-refit-2026-10-26.json
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const NOTE = '2026-10-26 (package ENG9)';
const before = SC.make(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const beforeCards = new Map(JSON.parse(fs.readFileSync(process.argv[3], 'utf8')).map(c=> [c.id, c]));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const byId = new Map(cards.map(c=> [c.id, c])), note = (c, s)=>{ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${NOTE}: ${s}`; };
// ---- edits ------------------------------------------------------------------------------------------------------------------------
const edits = [];
['sea-turtle-elder', 'cinder-skeleton', 'ember-revenant', 'grass-snake', 'slow-worm'].forEach(id=>{ const c = byId.get(id); if(!c || !c.effects || c.effects.revive !== true) return;
  const e = {}; Object.keys(c.effects).forEach(k=>{ if(k === 'revive') e.undead = true; else e[k] = c.effects[k]; }); c.effects = e;
  note(c, 'Revive -> Undead (owner #20: Undead brings the unit itself back once, as a token; Revive is the graveyard action now).'); edits.push(id + ': Revive -> Undead'); });
{ const c = byId.get('test-skill-revive'); if(c && c.effects && c.effects.revive === true){ c.effects = {revive: 1}; edits.push('test-skill-revive: Revive 1 (the action)'); } }
{ const c = byId.get('beaver-lumberjack'); const t = c && c.effects && c.effects.triggers;
  if(t && t.length === 1 && t[0].on === 'onReady' && t[0].do === 'gain' && t[0].resource === 'lumber' && Number(t[0].amount) === 1){ const e = Object.assign({}, c.effects); delete e.triggers; e.stockpile = 1; c.effects = e;
    note(c, 'On Ready: +1 Lumber -> Stockpile 1 (owner EN6-6: "We need a named skill for this"; same price, 0.9).'); edits.push('beaver-lumberjack: On Ready +1 Lumber -> Stockpile 1'); } }
[['fungal-colossus', ['Fungi'], ['Fungi']], ['puffball-bombardier', ['Fungi', 'Cave'], ['Fungi']]].forEach(([id, arch, sp])=>{ const c = byId.get(id); if(!c || (c.archetypes || []).includes('Fungi')) return;
  const was = `${(c.archetypes || []).join('/')} (${(c.species || []).join('/')})`; c.archetypes = arch; c.species = sp;
  note(c, `Fungi (owner G9: "There's no Funghi type"): ${was} -> ${arch.join('/')} (${sp.join('/')}); Fungi is a kingdom beside Flora (call ENG9-5).`); edits.push(`${id}: ${was} -> ${arch.join('/')} (${sp.join('/')})`); });
// ---- re-fit -----------------------------------------------------------------------------------------------------------------------
function okWith(TT, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = TT.budget(d, {level: 1}), bs = lv === 1 ? b1 : TT.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
const ok = (c, A, H)=> okWith(T, c, A, H);
// the formula's line on the card's own shape under a table (null: none)
function lineOf(TT, c){ const A0 = c.attack || 0, sH = Math.max(1, c.health); let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), H = Math.max(1, Math.round(sH * k));
    const u = okWith(TT, c, A, H); if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u}; }
  return best; }
const sOld = c=>{ const b = beforeCards.get(c.id) || c; return before.budget(b, {level: 1}).S || 0; };
const moved = cards.filter(c=> c.health != null && (Math.abs((T.budget(c, {level: 1}).S || 0) - sOld(c)) > 1e-9 || BB.chainedMult(c.effects) !== 1));
const raises = [], held = [], flagged = [], skipped = [], same = [], offLine = [];
for(const c of moved){
  if(kindOf.get(c.id) !== 'band' || c.easterEgg || c.test){ skipped.push(c.id); continue; }
  const A0 = c.attack || 0, H0 = c.health;
  // Only a card that sat on the old formula line moves with the price (its stats were the formula's); a card set below or above it by hand
  // (a design call, a held drop) is left where it is and listed as off the line.
  // (A Chained card's old line was priced with the -3 skill credit and no N multiplier, which this budget file no longer has: it moves.)
  const was = BB.chainedMult(c.effects) !== 1 ? {A: A0, H: H0} : lineOf(before, beforeCards.get(c.id) || c); if(!was || was.A !== A0 || was.H !== H0){ offLine.push({id: c.id, at: `${A0}/${H0}`, oldLine: was ? `${was.A}/${was.H}` : 'none'}); continue; }
  const best = lineOf(T, c);
  const s0 = sOld(c), s1 = T.budget(c, {level: 1}).S;
  if(!best){ flagged.push(c.id); continue; }
  const row = {id: c.id, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, S: `${+s0.toFixed(2)} -> ${+s1.toFixed(2)}`, nMult: BB.nMultOf(c.effects), use: Math.round(best.u * 100)};
  if(best.A === A0 && best.H === H0){ same.push(row); continue; }
  if(2 * best.A + best.H >= 2 * A0 + H0) raises.push(Object.assign(row, {c, A: best.A, H: best.H})); else held.push(row);
}
console.log('edits:\n  ' + edits.join('\n  '));
console.log(`${moved.length} cards' price moved (${skipped.length} not band cards / test cards, ${offLine.length} off the old formula line: left alone); ${raises.length} raise, ${held.length} would drop (held), ${same.length} stay, ${flagged.length} no legal line (flagged)`);
raises.forEach(m=> console.log(`  raise ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
held.forEach(m=> console.log(`  held  ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
same.forEach(m=> console.log(`  same  ${m.id.padEnd(28)} ${m.from.padStart(6)}          S ${m.S}`));
if(flagged.length) console.log('  flagged: ' + flagged.join(', '));
offLine.forEach(m=> console.log(`  off   ${m.id.padEnd(28)} ${m.at.padStart(6)}  (old line ${m.oldLine})`));
if(process.argv.includes('apply')){
  for(const m of raises){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H; note(m.c, `re-fit ${m.from} -> ${m.to} (S ${m.S}${m.nMult !== 1 ? ', N x' + m.nMult : ''}).`); }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng9-refit-2026-10-26.json'), JSON.stringify({about: `ENG9 re-fit (${NOTE}): prices from tools/eng9_skill_costs_2026_10_26.py and bramblewood-budget.js (Chained x N, Cleave's statuses). Raises applied; drops held at their stats for the owner (as BF11-1 / EN3-6); no-legal-line cards listed.`,
    edits, moved: moved.map(c=> c.id), notBand: skipped, offLine, raised: raises.map(({c, A, H, ...r})=> r), held, same, flagged}, null, 1) + '\n');
  const FP = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'); let prev = []; try{ prev = JSON.parse(fs.readFileSync(FP, 'utf8')); }catch(e){}
  fs.writeFileSync(FP, JSON.stringify([...new Set(prev.concat(held.map(h=> h.id), flagged))], null, 1) + '\n'); // the held drops join the cards held on record (as EN3)
  console.log('applied');
}
