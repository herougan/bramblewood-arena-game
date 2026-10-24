#!/usr/bin/env node
// Package BAL2 (2026-10-24, DF-1): re-fit after the budget's Map term went back to 0.2 a map and a card's map became the first main-line map
// it can be obtained on (arena_app.js cardObtainMap -> canonical/card-obtain-maps.json). Same fit as tools/refit_pass_2026_10_21.js (the card's
// Attack:Health shape kept, the largest line holding both caps at Level 1 and its start level, use <= 100% of N; band cards only), with two
// rules so the pass moves what the Map term moved and nothing else:
//   - a card now OVER its budget goes down to its line; a cut of more than HOLD (25%) of its 2A+H is held at its stats and listed (owner's
//     brief: "hold extreme down-moves");
//   - a card that was ON its line under the old budget (its old best fit is its stats) goes up to its new line when the Map term gave it room;
//     a card that already had room below its old line keeps its stats (the room was there before; this pass is not a retune).
// The flagged list (no legal line at all) and the held list are merged into docs/balance/human-pass-1-flagged-2026-10-21.json (kept, not
// overwritten) and written to docs/balance/bal2-refit-2026-10-24.json with every move.
//   node tools/bal2_refit_2026_10_24.js <old-obtain-maps.json> [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const SC = require('./card_retune_2026_10_19.js').SC;
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const Tn = SC.make(table), To = SC.make(Object.assign({}, table, {budget: Object.assign({}, table.budget, {perMap: 0.1})}));
const OLD = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).maps || {}, NEW = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps || {};
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const HOLD = 0.25, NOTE = '2026-10-24 BAL2 re-fit (DF-1: Map term 0.2 a map, first main-line map)';
function use(T, c, A, H, map){ const d = Object.assign({}, c, {attack: A, health: H, obtainMap: map}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function best(T, c, map){ const sA = c.attack || 0, sH = Math.max(1, c.health); let b = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), u = use(T, c, A, H, map);
    if(u && (!b || u > b.u || (u === b.u && A + H > b.A + b.H))) b = {A, H, u}; }
  return b; }
const moves = [], held = [], flagged = [];
for(const c of cards){
  const om = OLD[c.id] || 0, nm = NEW[c.id] || 0;
  if(Math.abs(0.2 * nm - 0.1 * om) < 1e-9 || (kindOf.has(c.id) && kindOf.get(c.id) !== 'band') || c.pool || c.token || c.test || c.cardType === 'equipment' || c.cardType === 'materia' || c.hatchInto || c.cardType === 'spell' || (!c.attack && !c.health) || c.health == null || c.easterEgg) continue; // a card newer than the BF6 plan counts as a band card
  const A0 = c.attack || 0, H0 = c.health, nowOk = use(Tn, c, A0, H0, nm) > 0, bn = best(Tn, c, nm);
  if(!bn){ flagged.push(c.id); continue; }
  const w0 = 2 * A0 + H0, w1 = 2 * bn.A + bn.H;
  if(!nowOk){ const cut = (w0 - w1) / w0; if(cut > HOLD){ held.push({id: c.id, stats: `${A0}/${H0}`, line: `${bn.A}/${bn.H}`, cut: Math.round(cut * 100), map: `${om} -> ${nm}`}); continue; }
    moves.push({c, from: `${A0}/${H0}`, to: `${bn.A}/${bn.H}`, A: bn.A, H: bn.H, why: 'over', map: `${om} -> ${nm}`}); continue; }
  const bo = best(To, c, om); const onLine = bo && bo.A === A0 && bo.H === H0;
  if(onLine && w1 > w0) moves.push({c, from: `${A0}/${H0}`, to: `${bn.A}/${bn.H}`, A: bn.A, H: bn.H, why: 'room', map: `${om} -> ${nm}`});
}
const up = moves.filter(m=> m.why === 'room'), dn = moves.filter(m=> m.why === 'over');
console.log(`${up.length} up (on their old line, the Map term gave room), ${dn.length} down (over the new budget), ${held.length} held (cut > ${HOLD * 100}%), ${flagged.length} with no legal line`);
moves.forEach(m=> console.log(`  ${m.why.padEnd(4)} ${m.c.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} map ${m.map}`));
held.forEach(h=> console.log(`  held ${h.id.padEnd(28)} ${h.stats} (line ${h.line}, -${h.cut}%) map ${h.map}`));
if(flagged.length) console.log('  no line: ' + flagged.join(', '));
if(process.argv.includes('apply')){
  for(const m of moves){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H; m.c.creatorNote = (m.c.creatorNote ? m.c.creatorNote + ' ' : '') + `${NOTE}: ${m.from} -> ${m.to}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  const FL = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'); let prev = []; try{ prev = JSON.parse(fs.readFileSync(FL, 'utf8')); }catch(e){}
  const merged = [...new Set(prev.concat(flagged, held.map(h=> h.id)))]; fs.writeFileSync(FL, JSON.stringify(merged, null, 1) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal2-refit-2026-10-24.json'), JSON.stringify({_about: 'Package BAL2 (2026-10-24): the DF-1 re-fit (node tools/bal2_refit_2026_10_24.js). up: on its old line, the new Map term gave room; down: over the new budget; held: the cut would be over 25% of 2A+H, kept at its stats; noLine: no legal line at all, kept (flagged).',
    moves: (()=>{ let prior = []; try{ prior = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal2-refit-2026-10-24.json'), 'utf8')).moves || []; }catch(e){} const now = moves.map(m=> ({id: m.c.id, from: m.from, to: m.to, why: m.why, map: m.map})); return prior.filter(p=> !now.some(x=> x.id === p.id)).concat(now); })(), held, noLine: flagged}, null, 1) + '\n'); // a second run adds its moves to the first's
  console.log('applied; flagged list now', merged.length);
}
