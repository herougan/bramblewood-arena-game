#!/usr/bin/env node
// ENG36 (2026-11-08, owner 11-07 item 1: "Resistance for all tokens/statuses ... Price them in the budget by reasoning"): the prices of a
// status Resist / Weakness / Immune entry ('status:<key>' in effects.resist / weakness / immune), written to canonical/skill-costs.json
// "statusResist" (tools/skill_costs.js cardS reads it). By reasoning, not measured (no card carries one yet):
//   S       the worth a carrier pays for the status: the mean price (this table's skillCost) of the skills that deal it, over the
//           fieldable cards that carry them; a status with no priced carrier skill has a reasoned S (FIXED_S, the note says why).
//   odds    the chance a foe deck of 6 different cards brings at least one carrier: 1 - (1 - share)^6, share = carriers / fieldable cards,
//           at least ODDS_FLOOR (0.15): statuses gather on their maps (a swamp's venom, a tundra's frost), so a card made against them meets
//           them about 1 fight in 6 even when the whole pool holds few carriers (and a status on no card yet keeps a price).
//   Immune  odds x S (what the foe's skill would have done to this unit is gone).
//   Resist  damage over time: x 0.5 (half the ticks); a chance status (rolled on a hit, mostly 50% or less): x 0.9 (Resist's -50 points
//           stops nearly all of it); a sure status: x 0.5 (it lands 1 in 2).
//   Weakness damage over time: x -1 (double ticks); a chance status: x -1 (+50 points at least doubles it); a sure status: 0 (it can't land
//           more surely).
//   node tools/eng36_status_prices_2026_11_08.js           print the table
//   node tools/eng36_status_prices_2026_11_08.js --write   write it into canonical/skill-costs.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), P = path.join(ROOT, 'canonical/skill-costs.json');
const table = JSON.parse(fs.readFileSync(P, 'utf8')), SC = require('./skill_costs.js').make(table);
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')).filter(c=> !c.pool && !c.token && !c.test && c.cardType !== 'materia' && c.cardType !== 'equipment');
const KIND = {dot: ['venom', 'toxin', 'bleed', 'burn', 'decay', 'strangle', 'wither'], chance: ['freeze', 'sleep', 'paralyze', 'stun', 'blind', 'tipsy', 'confuse', 'shock', 'stagger'],
  sure: ['silence', 'stymie', 'exhaust', 'petrify', 'stench', 'web', 'brittle', 'daunt', 'scar', 'corrode', 'tangle', 'bound', 'constrict', 'soak']};
const KEYS = {venom: ['poison', 'greaterPoison', 'poisonGas'], toxin: ['toxin'], bleed: ['bleed', 'hemorrhage'], burn: ['fireArrow', 'fireBolt'], decay: ['decay'], strangle: ['strangle', 'constrict'],
  wither: ['wither'], freeze: ['freeze', 'iceArrow', 'absoluteZero'], sleep: ['sleep'], paralyze: ['paralyze'], stun: ['stunOnHit'], blind: ['blind'], tipsy: ['tipsy'], confuse: ['confuse'],
  shock: [], stagger: ['stagger'], silence: ['silence'], stymie: ['stymie'], exhaust: ['exhaust'], petrify: ['petrify'], stench: ['stench'], web: ['web'], brittle: ['brittle'], daunt: ['daunt'],
  scar: ['scar'], corrode: ['corrode'], tangle: ['tangle'], bound: ['strangle'], constrict: ['constrict'], soak: []};
const ACT = {stun: ['stun'], silence: ['silence'], stymie: ['stymie'], exhaust: ['exhaust'], petrify: ['petrify'], stench: ['stench'], venom: ['poison'], bleed: ['bleed'], shock: ['vulnerable'], strangle: ['strangle', 'constrict'], bound: ['strangle'], constrict: ['constrict']};
// statuses dealt by a damage type rather than a skill: the carriers are the cards of that type, S reasoned
const BY_TYPE = {burn: 'heat', freeze: 'cold', soak: 'water'};
const FIXED_S = {burn: [2, 'a fire hit lays 1 Burn (1 fire at the next round start): about 2 points over a carrier\'s fight'], soak: [0.5, 'Wet only adds lightning damage and puts out Burn: about 0.5'],
  shock: [1, 'Vulnerable / Shock on hit: +50% damage taken for a round, about 1 point (Shock\'s 4-round price at Attack 2 is 0.93)'], freeze: [null, ''], constrict: [8, 'Constrict\'s own price (ENG36)'], stench: [1, 'a Stench token: -1 Attack a token, about 1']};
const MULT = {dot: {resist: 0.5, weak: -1}, chance: {resist: 0.9, weak: -1}, sure: {resist: 0.5, weak: 0}};
const ODDS_FLOOR = 0.15;
const r2 = v=> Math.round(v * 100) / 100, kindOf = k=> Object.keys(KIND).find(x=> KIND[x].includes(k));
const out = {};
Object.keys(KEYS).forEach(k=>{
  const ks = KEYS[k], acts = ACT[k] || [], ty = BY_TYPE[k]; let n = 0; const prices = [];
  cards.forEach(c=>{ const e = c.effects || {}; let hit = false;
    ks.forEach(x=>{ if(e[x]){ hit = true; const p = SC.skillCost(x, e[x]); if(p != null && p > 0) prices.push(p); } });
    (e.triggers || []).forEach(t=>{ if(t && acts.includes(t.do)){ hit = true; const tc = SC.triggerCost(t, c); if(tc.cost > 0) prices.push(tc.cost); } });
    if(ty && c.dmgType === ty) hit = true; if(hit) n++; });
  const share = n / cards.length, odds = Math.max(ODDS_FLOOR, 1 - Math.pow(1 - share, 6));
  const fx = FIXED_S[k] && FIXED_S[k][0] != null ? FIXED_S[k] : null;
  const S = fx ? fx[0] : prices.length ? prices.reduce((a, b)=> a + b, 0) / prices.length : 1;
  const kind = kindOf(k), m = MULT[kind], imm = r2(odds * S);
  out[k] = {kind, carriers: n, share: r2(share), odds: r2(odds), S: r2(S), immune: imm, resist: r2(imm * m.resist), weak: r2(imm * m.weak), why: fx ? fx[1] : (prices.length ? 'mean price of ' + prices.length + ' carrier skills' : 'no priced carrier: 1')};
});
if(process.argv.includes('--write')){
  table.statusResist = Object.assign({_about: 'ENG36 (2026-11-08): the price of a status Resist / Weakness / Immune entry (\'status:<key>\' in effects.resist / weakness / immune), by reasoning: Immune = odds x S, odds = max(0.15, 1 - (1 - share)^6) (a foe deck of 6 different cards brings a carrier; at least 1 fight in 6, statuses gather on their maps), S = the mean price of the carrier skills; Resist x 0.5 (damage over time, sure statuses) or x 0.9 (chance statuses: Resist takes 50 points off); Weakness x -1 (damage over time, chance statuses) or 0 (sure statuses). Written by tools/eng36_status_prices_2026_11_08.js --write; not measured.'}, out);
  // keep the file's one-entry-per-line layout: rewrite only this section
  const src = fs.readFileSync(P, 'utf8'), body = JSON.stringify(table.statusResist).replace(/\},"/g, '},\n  "');
  const at = src.indexOf('\n "statusResist":');
  let next;
  if(at >= 0){ const end = src.indexOf('\n }', at); next = src.slice(0, at) + '\n "statusResist": ' + body.replace(/^\{/, '{\n  ').replace(/\}$/, '\n }') + src.slice(end + 3); }
  else { const last = src.lastIndexOf('\n}'); next = src.slice(0, last) + ',\n "statusResist": ' + body.replace(/^\{/, '{\n  ').replace(/\}$/, '\n }') + src.slice(last); }
  JSON.parse(next); fs.writeFileSync(P, next); console.log('written: canonical/skill-costs.json statusResist (' + Object.keys(out).length + ' statuses)');
} else console.table(out);
