#!/usr/bin/env node
// EN5 cards (2026-10-24, owner 02:59 / 03:12 notes; brief: "1-2 thematic cards ... 1 unit ... 1 card each where thematic (optional)").
//   node tools/en5_cards_2026_10_24.js skills                         the new skills on existing thematic cards (below), idempotent
//   node tools/en5_cards_2026_10_24.js refit <skill-costs-before.json> [apply]
//       Re-fit every card whose S or Bloom multiplier moved (Bleed / Poison re-priced, Bloom's chain, the six cards' new skills), the way
//       tools/en3_refit_2026_10_23.js does it (same A:H shape, the largest line inside both caps at Level 1 and the start level; band cards
//       only), with the brief's rules: down-moves are applied too, unless EXTREME (2A + H falls by more than EXTREME_CUT): those are held at
//       their stats and listed (not a Bloom card: BL's held cards are re-fitted, owner 03:12 "Balance if overbudget"); a tie on use keeps the
//       card's Attack; the no-legal-line list is merged into docs/balance/human-pass-1-flagged-2026-10-21.json. Bloom cards may sit
//       slightly over (owner 03:12: "Balance if overbudget, err on slightly overbudget (14.6>14.5)"): both caps up to BLOOM_OVER (+1%).
//       Writes docs/balance/en5-refit-2026-10-24.json.
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const CARDS = path.join(ROOT, 'canonical', 'cards.json');
const NOTE = '2026-10-24 EN5';
const EXTREME_CUT = 0.25, BLOOM_OVER = 1.01;
// card -> the skill it gains (owner: thematic): why
const SKILLS = {
  'beetle-battering-ram': [{breach: 2}, 'Breach 2: the battering ram of the Fortified Castle (Map 23), it breaks through to the bramble behind the gate'],
  'badger-sapper': [{breach: 1}, 'Breach 1: a sapper digs under the walls (Map 13)'],
  'fawn-scout': [{canopyCover: true}, 'Canopy Cover: a fawn lies still under the ferns (Map 13, a forest map)'],
  'lodge-engineer': [{timbered: true}, 'Timbered: a beaver with a lodge of stored wood (it makes 1 Lumber each Ready round)'],
  'quarry-mole': [{bedrock: true}, 'Bedrock: a mole that quarries stone, stronger on a pile of it'],
  'badger-trench-digger': [{lastStand: true}, 'Last Stand: the trench\'s last defender when the walls are falling (Map 23)'],
};
const step = process.argv[2];
const load = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const save = cards=> fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const note = (c, t)=>{ if(!(c.creatorNote || '').includes(t)) c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + t; };
if(step === 'skills'){
  const cards = load(); let n = 0;
  Object.entries(SKILLS).forEach(([id, [fx, why]])=>{ const c = cards.find(x=> x.id === id); if(!c){ console.log('missing ' + id); return; }
    const k = Object.keys(fx)[0]; if(c.effects && c.effects[k] != null){ console.log('has it already: ' + id); return; }
    c.effects = Object.assign({}, c.effects || {}, fx); note(c, `${NOTE} (owner 02:59 / 03:12, a thematic card for the new skill): ${why}.`); n++;
    console.log(`  ${id.padEnd(24)} + ${JSON.stringify(fx)}  (${BB.skillCountOf(c.effects)} skills)`); });
  save(cards); console.log(`${n} cards gained a skill`);
} else if(step === 'refit'){
  const before = SC.make(JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
  const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
  const cards = load();
  // the Bloom chain changed the bloom multiplier (cap 1's stat terms): those cards moved even when S did not; so did the six new-skill cards
  const bloomOld = e=> e && e.bloomCopy ? 1 + BB.bloomOdds(e.bloomCopy) : 1;
  const moved = cards.filter(c=> c.health != null && (Math.abs((T.budget(c, {level: 1}).S || 0) - (before.budget(c, {level: 1}).S || 0)) > 1e-9 || (c.effects && c.effects.bloomCopy) || SKILLS[c.id]));
  function fit(c){ const A0 = c.attack || 0, H0 = c.health, sH = Math.max(1, H0), bloom = !!(c.effects && c.effects.bloomCopy), tol = bloom ? BLOOM_OVER : 1; let best = null;
    const ok = (A, H)=>{ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
      const pass = b=> b.x1 <= b.N * tol + 1e-9 && b.x2 <= b.N2 * tol + 1e-9; return pass(b1) && pass(bs) ? b1.x1 / b1.N : 0; };
    const lines = []; for(let k = 0.05; k <= 6; k += 0.01) lines.push([A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), Math.max(1, Math.round(sH * k))]);
    if(A0 > 0 && bloom) for(let h = 1; h <= sH * 3; h++) lines.push([A0, h]); // a Bloom card: + its own Attack with any Health (off the shape grid; a Colossus stays 2 Attack)
    for(const [A, H] of lines){ const u = ok(A, H);
      // a tie on use keeps the Attack nearest the card's own (a Colossus stays 2 Attack), then the bigger line
      if(u && u <= tol + 1e-9 && (!best || u > best.u + 1e-9 || (Math.abs(u - best.u) <= 1e-9 && (Math.abs(A - A0) < Math.abs(best.A - A0) || (Math.abs(A - A0) === Math.abs(best.A - A0) && A + H > best.A + best.H))))) best = {A, H, u}; }
    return best; }
  const ups = [], downs = [], held = [], flagged = [], skipped = [], same = [];
  for(const c of moved){
    const isBloom = !!(c.effects && c.effects.bloomCopy) && !/^test-/.test(c.id) && !c.test; // a placed Bloom card is re-fitted even off the band list (Pond Algae, a Pack 1 card of Map 4)
    if((kindOf.get(c.id) !== 'band' && !isBloom) || c.easterEgg){ skipped.push(c.id); continue; }
    const A0 = c.attack || 0, H0 = c.health, best = fit(c), sOld = before.budget(c, {level: 1}).S, sNew = T.budget(c, {level: 1}).S;
    if(!best){ flagged.push(c.id); continue; }
    if(best.A === A0 && best.H === H0){ same.push(c.id); continue; }
    const p0 = 2 * A0 + H0, p1 = 2 * best.A + best.H;
    const row = {id: c.id, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, S: `${+(+sOld).toFixed(2)} -> ${+(+sNew).toFixed(2)}`, use: Math.round(best.u * 100), bloom: !!(c.effects && c.effects.bloomCopy) || undefined, newSkill: SKILLS[c.id] ? Object.keys(SKILLS[c.id][0])[0] : undefined};
    if(p1 >= p0) ups.push(Object.assign(row, {c, A: best.A, H: best.H}));
    else if((p0 - p1) / p0 > EXTREME_CUT && !row.bloom) held.push(Object.assign(row, {cut: Math.round(100 * (p0 - p1) / p0) + '%'})); // Bloom cards: the owner asked for them balanced (03:12), never held
    else downs.push(Object.assign(row, {c, A: best.A, H: best.H}));
  }
  console.log(`${moved.length} cards moved (${skipped.length} not band cards, left alone; ${same.length} already fit); ${ups.length} up, ${downs.length} down, ${held.length} held (cut > ${EXTREME_CUT * 100}%), ${flagged.length} no legal line`);
  ups.forEach(m=> console.log(`  up    ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}${m.bloom ? ' (bloom)' : ''}`));
  downs.forEach(m=> console.log(`  down  ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}${m.bloom ? ' (bloom)' : ''}${m.newSkill ? ' (+' + m.newSkill + ')' : ''}`));
  held.forEach(m=> console.log(`  held  ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S} (cut ${m.cut})`));
  if(flagged.length) console.log('  flagged: ' + flagged.join(', '));
  if(process.argv.includes('apply')){
    for(const m of ups.concat(downs)){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H;
      note(m.c, `${NOTE} re-fit (Bleed / Poison by the measured curve, Bloom's chain, new skills): ${m.from} -> ${m.to}.`); }
    save(cards);
    const FP = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'); let prev = []; try{ prev = JSON.parse(fs.readFileSync(FP, 'utf8')); }catch(e){}
    fs.writeFileSync(FP, JSON.stringify([...new Set(prev.concat(flagged))], null, 1) + '\n');
    const strip = ({c, A, H, ...r})=> r;
    fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'en5-refit-2026-10-24.json'), JSON.stringify({about: 'EN5 re-fit (2026-10-24): Bleed 3.6 x N^0.6 and Poison 3.0 x N^0.7 (were 2.6 x N), Bloom priced with its chain (the copy can bloom), Hemorrhage N, the six cards\' new skills. Ups and downs applied; a cut of more than ' + (EXTREME_CUT * 100) + '% of 2A+H held at its stats (call EN5-6); Bloom cards up to 1% over N (owner 03:12); no-legal-line cards merged into human-pass-1-flagged-2026-10-21.json.',
      moved: moved.map(c=> c.id), notBand: skipped, alreadyFit: same, up: ups.map(strip), down: downs.map(strip), held, flagged}, null, 1) + '\n');
    console.log('applied');
  }
} else console.log('usage: skills | refit <skill-costs-before.json> [apply]');
