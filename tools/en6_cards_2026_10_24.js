#!/usr/bin/env node
// EN6 cards (2026-10-24, owner 03:17 + 12:02 #5 / #11; brief: "1 thematic card each where it fits ... Bounty cleanup").
//   node tools/en6_cards_2026_10_24.js skills          the new skills on existing thematic cards, the Bounty clean-up (idempotent)
//   node tools/en6_cards_2026_10_24.js refit <skill-costs-before.json> [apply]
//       Re-fit the cards whose S moved (the new skills, Beaver Lumberjack's On Ready Lumber, Hibernate's sleeping Attack) the way
//       tools/en5_cards_2026_10_24.js does it: the same A:H shape, the largest line inside both caps at Level 1 and the start level, a tie on
//       use keeps the card's Attack; a cut of more than a quarter of 2A + H is held and listed. Every card named here is re-fitted (placed or
//       not); other cards only when they are band cards. Writes docs/balance/en6-refit-2026-10-24.json.
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const CARDS = path.join(ROOT, 'canonical', 'cards.json');
const NOTE = '2026-10-24 EN6';
const EXTREME_CUT = 0.25;
// card -> the skill it gains (owner: thematic), why; null value = remove that key
const SKILLS = {
  'polar-bear':          [{hibernate: true}, 'Hibernate: the tundra bear dens up in the cold (Map 6, the tundra: Frigid fights and the tundra nights)'],
  'snow-ermine':         [{frost: true}, 'Frost: the ermine in its winter coat (Map 6, the tundra)'],
  'cinder-stoker':       [{heat: true}, 'Heat: a salamander that feeds the forge fires (Map 3, the volcano)'],
  'dromedary':           [{drought: true}, 'Drought: the camel outlasts the dry spell (the savanna, a weather map)'],
  'fulmar-spitter':      [{storm: true}, 'Storm: a storm-riding seabird (the windy cliffs)'],
  'horseshoe-crab':      [{salt: true}, 'Salt: a crab of the salt flats as the tide draws back (the reef)'],
  'puddle-hopper':       [{rain: true}, 'Rain: a frog that comes out in the rain (Rainmaker cards and Spring Rain bring it)'],
  'ent':                 [{fog: true}, 'Fog: the old tree lost in the Old Bramble\'s mist'],
  'seed-cache-squirrel': [{plenty: true}, 'Plenty: a squirrel with a full cache'],
  'ravenous-wolverine':  [{scarcity: true}, 'Scarcity: the ravenous wolverine fights hardest when the larder is bare'],
  // Full Hand / Lean (and the Foe's): no card. At 3.0 / 7.5 a point the commons that fit (Dormouse, the Chipmunk Stockpiler) lose a quarter
  // to a third of their stats (call EN6-5).
  'gull-thief':          [{foePlenty: true}, "Foe's Plenty: a thief eyes the full basket"],
  'stoat-cutthroat':     [{foeScarcity: true}, "Foe's Scarcity: the cutthroat strikes when the foe has nothing left"],
  'balloon-archer':      [{arrowBramble: true}, 'Arrow - bramble: the balloon floats over the lines and shoots at the bramble'],
  // owner 12:02 #5: "I'll take away bounty from creatures that dont make sense such as Beaver. That lumberjack should have something like On
  // Ready, 1 lumber instead.": the On Ready trigger (once, when its Wait first runs out) with Gain 1 Lumber, priced 0.9 x 1 = 0.9 (Bounty 2 was
  // 5.0). The every-round income (On Ready gold, 6.24) would cut it from 4/4 to 2/2 (call EN6-6).
  'beaver-lumberjack':   [{bounty: null, triggers: [{on: 'onReady', do: 'gain', resource: 'lumber', amount: 1}]}, 'Bounty off (owner 12:02 #5); On Ready: gain 1 Lumber'],
};
const step = process.argv[2];
const load = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const save = cards=> fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const note = (c, t)=>{ if(!(c.creatorNote || '').includes(t)) c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + t; };
if(step === 'skills'){
  const cards = load(); let n = 0;
  Object.entries(SKILLS).forEach(([id, [fx, why]])=>{ const c = cards.find(x=> x.id === id); if(!c){ console.log('missing ' + id); return; }
    const e = Object.assign({}, c.effects || {}); let changed = false;
    Object.entries(fx).forEach(([k, v])=>{ if(v === null){ if(k in e){ delete e[k]; changed = true; } } else if(e[k] == null){ e[k] = v; changed = true; } });
    if(!changed){ console.log('already: ' + id); return; }
    c.effects = e; note(c, `${NOTE} (owner 03:17 / 12:02): ${why}.`); n++;
    console.log(`  ${id.padEnd(22)} ${JSON.stringify(fx)}  (${BB.skillCountOf(c.effects)} skills)`); });
  save(cards); console.log(`${n} cards changed`);
} else if(step === 'refit'){
  const before = SC.make(JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
  const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
  const cards = load();
  const moved = cards.filter(c=> c.health != null && (SKILLS[c.id] || Math.abs((T.budget(c, {level: 1}).S || 0) - (before.budget(c, {level: 1}).S || 0)) > 1e-9 || (c.effects && c.effects.hibernate)));
  function fit(c){ const A0 = c.attack || 0, H0 = c.health, sH = Math.max(1, H0); let best = null;
    const ok = (A, H)=>{ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
      const pass = b=> b.x1 <= b.N + 1e-9 && b.x2 <= b.N2 + 1e-9; return pass(b1) && pass(bs) ? b1.x1 / b1.N : 0; };
    const lines = []; for(let k = 0.05; k <= 6; k += 0.01) lines.push([A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), Math.max(1, Math.round(sH * k))]);
    for(const [A, H] of lines){ const u = ok(A, H);
      if(u && u <= 1 + 1e-9 && (!best || u > best.u + 1e-9 || (Math.abs(u - best.u) <= 1e-9 && (Math.abs(A - A0) < Math.abs(best.A - A0) || (Math.abs(A - A0) === Math.abs(best.A - A0) && A + H > best.A + best.H))))) best = {A, H, u}; }
    return best; }
  const ups = [], downs = [], held = [], flagged = [], skipped = [], same = [];
  for(const c of moved){
    if((!SKILLS[c.id] && kindOf.get(c.id) !== 'band') || c.easterEgg || c.test){ skipped.push(c.id); continue; }
    const A0 = c.attack || 0, H0 = c.health, best = fit(c), sOld = before.budget(c, {level: 1}).S, sNew = T.budget(c, {level: 1}).S;
    if(!best){ flagged.push(c.id); continue; }
    if(best.A === A0 && best.H === H0){ same.push(c.id); continue; }
    const p0 = 2 * A0 + H0, p1 = 2 * best.A + best.H;
    const row = {id: c.id, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, S: `${+(+sOld).toFixed(2)} -> ${+(+sNew).toFixed(2)}`, use: Math.round(best.u * 100), newSkill: SKILLS[c.id] ? Object.keys(SKILLS[c.id][0]).filter(k=> SKILLS[c.id][0][k] !== null).join('+') : undefined};
    if(p1 >= p0) ups.push(Object.assign(row, {c, A: best.A, H: best.H}));
    else if((p0 - p1) / p0 > EXTREME_CUT) held.push(Object.assign(row, {cut: Math.round(100 * (p0 - p1) / p0) + '%'}));
    else downs.push(Object.assign(row, {c, A: best.A, H: best.H}));
  }
  console.log(`${moved.length} cards moved (${skipped.length} not band cards, left alone; ${same.length} already fit); ${ups.length} up, ${downs.length} down, ${held.length} held (cut > ${EXTREME_CUT * 100}%), ${flagged.length} no legal line`);
  ups.forEach(m=> console.log(`  up    ${m.id.padEnd(24)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}${m.newSkill ? ' (+' + m.newSkill + ')' : ''}`));
  downs.forEach(m=> console.log(`  down  ${m.id.padEnd(24)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}${m.newSkill ? ' (+' + m.newSkill + ')' : ''}`));
  held.forEach(m=> console.log(`  held  ${m.id.padEnd(24)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S} (cut ${m.cut})`));
  if(flagged.length) console.log('  flagged: ' + flagged.join(', '));
  if(same.length) console.log('  already fit: ' + same.join(', '));
  if(process.argv.includes('apply')){
    for(const m of ups.concat(downs)){ m.c.attack = m.A; m.c.health = m.H; note(m.c, `${NOTE} re-fit (the new skill priced by the 4-round rule x uptime): ${m.from} -> ${m.to}.`); }
    save(cards);
    const strip = ({c, A, H, ...r})=> r;
    fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'en6-refit-2026-10-24.json'), JSON.stringify({about: 'EN6 re-fit (2026-10-24): the cards that took an EN6 skill (and Beaver Lumberjack: Bounty 2 -> On Ready +1 Lumber), fitted to the largest line in both caps with the same A:H shape (tools/en6_cards_2026_10_24.js). A cut of more than ' + (EXTREME_CUT * 100) + '% of 2A+H is held at its stats (call EN6-5).',
      moved: moved.map(c=> c.id), notBand: skipped, alreadyFit: same, up: ups.map(strip), down: downs.map(strip), held, flagged}, null, 1) + '\n');
    console.log('applied');
  }
} else console.log('usage: skills | refit <skill-costs-before.json> [apply]');
