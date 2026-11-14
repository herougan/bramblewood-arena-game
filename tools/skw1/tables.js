#!/usr/bin/env node
// 2026-11-14 (package SKW1, owner 11-14 11:25, after a launch-Hearthstone reference: "about 12 triggers x 12 primitive actions gives 120+
// distinct skills from two small tables"): Bramblewood's own two tables, as the engine has them, counted. Measurement only (reads the engine
// source, canonical/cards.json, canonical/skill-costs.json; writes docs/balance/skw1/tables-engine.json and prints markdown).
//   node tools/skw1/tables.js
// - Triggers: the engine's TRIGGER_KEYS, plus every hook name passed to runCustomTriggers / runCustomTriggersAt (perTurn, onAction, onHit ...).
// - Actions: the `case` labels of runAction (inside runCustomTriggersAt) and of sk3RunAction / sk2RunAction, its default fall-throughs.
// - Each counted on the in-play cards of Maps 0-20 (fieldable, canonical/card-obtain-maps.json map <= 20, unlisted = 0) by the engine's own
//   trigsOf(def): explicit triggers and the keywords that expand into a trigger (Archer, Delivery, Felling, Kin Rally ...).
// - Each effect key of those cards classed: "pair" (expands into exactly one trigger x action), "multi-pair" (two or more), "passive" (no
//   trigger: a combat, aura, stat or field rule the engine applies elsewhere), "context" (braces: a skill set that switches on with a condition).
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const C = require(path.join(ROOT, 'tools', 'balance', 'contribution.js'));
const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
const gm = O.loadGame(ROOT), costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const lines = src.split('\n');
// ---- triggers
const tk = (src.match(/const TRIGGER_KEYS = \[([\s\S]*?)\];/) || [])[1] || '';
const triggerKeys = [...tk.matchAll(/'([A-Za-z]+)'/g)].map(m => m[1]);
const hooks = new Set(); for (const m of src.matchAll(/runCustomTriggers(?:At)?\([^;]*?'((?:on[A-Z][A-Za-z]*)|perTurn)'/g)) hooks.add(m[1]);
for (const m of src.matchAll(/hook\s*===?\s*'((?:on[A-Z][A-Za-z]*)|perTurn)'/g)) hooks.add(m[1]);
const triggers = [...new Set(triggerKeys.concat([...hooks]))].sort();
// ---- actions
const body = (startRe, endRe) => { const a = lines.findIndex(l => startRe.test(l)); if (a < 0) return ''; let b = a + 1; while (b < lines.length && !endRe.test(lines[b])) b++; return lines.slice(a, b).join('\n'); };
const ra = body(/const runAction = t=>/, /default: if\(!sk3RunAction/), s3 = body(/function sk3RunAction\(/, /^  function /), s2 = body(/function sk2RunAction\(/, /^  function /);
const caseOf = s => [...s.matchAll(/case '([A-Za-z.]+)'/g)].map(m => m[1]);
const actions = [...new Set(caseOf(ra).concat(caseOf(s3), caseOf(s2)))].sort();
// ---- cards in play on Maps 0-20
const E = gm.E.makeSimEngine(gm.D, gm.seededRng(1), { recordEvents: false });
const inPlay = Object.keys(gm.D).filter(id => C.fieldable(gm, id) && (gm.obtain[id] == null ? 0 : gm.obtain[id]) <= 20);
const tCount = {}, aCount = {}, pairCount = {};
const BB = gm.Budget, CONTEXT = Object.keys(BB.CONTEXT || {}), PARAMS = BB.PARAMS || [];
inPlay.forEach(id => { const ts = E.trigsOf(gm.D[id]) || []; const seenT = new Set(), seenA = new Set(), seenP = new Set();
  ts.forEach(t => { if (!t) return; seenT.add(t.on); seenA.add(t.do); seenP.add(t.on + '>' + t.do); });
  seenT.forEach(x => tCount[x] = (tCount[x] || 0) + 1); seenA.forEach(x => aCount[x] = (aCount[x] || 0) + 1); seenP.forEach(x => pairCount[x] = (pairCount[x] || 0) + 1); });
// ---- each skill key classed
const keyClass = {}, keyCards = {};
inPlay.forEach(id => { const e = gm.D[id].effects || {}; Object.keys(e).forEach(k => {
  if (PARAMS.includes(k)) return; keyCards[k] = (keyCards[k] || 0) + 1; if (keyClass[k]) return;
  if (k === 'triggers') { keyClass[k] = { kind: 'pair', how: 'explicit trigger entries (each one trigger x one action)' }; return; }
  if (CONTEXT.includes(k) || /Grant$/.test(k)) { keyClass[k] = { kind: 'context', how: 'braces switched on by a condition' }; return; }
  const ts = (E.trigsOf({ id: 'skw1-probe', wait: gm.D[id].wait, effects: { [k]: e[k] } }) || []).filter(Boolean);
  keyClass[k] = ts.length === 1 ? { kind: 'pair', how: ts[0].on + ' x ' + ts[0].do } : ts.length > 1 ? { kind: 'multi-pair', how: ts.map(t => t.on + ' x ' + t.do).join(' + ') } : { kind: 'passive', how: '' };
}); });
const priced = new Set(costs.triggers.map(t => t.id)), pricedA = new Set(costs.actions.map(a => a.id.split('.')[0])), alias = costs.aliases || {};
const out = { tool: 'tools/skw1/tables.js 1.0.0 (2026-11-14, SKW1)', generated: new Date().toISOString(), inPlayCards: inPlay.length,
  triggers: triggers.map(t => ({ id: t, cards: tCount[t] || 0, priced: priced.has(t), weight: (costs.triggers.find(x => x.id === t) || {}).value })),
  actions: actions.map(a => ({ id: a, cards: aCount[a] || 0, priced: pricedA.has(alias[a] || a), value: (costs.actions.find(x => x.id === (alias[a] || a)) || {}).value })),
  pairs: Object.entries(pairCount).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ pair: k, cards: n })),
  skills: Object.keys(keyClass).sort((a, b) => keyCards[b] - keyCards[a]).map(k => Object.assign({ key: k, cards: keyCards[k] }, keyClass[k])) };
const kinds = {}; out.skills.forEach(s => { kinds[s.kind] = kinds[s.kind] || { keys: 0, cardUses: 0 }; kinds[s.kind].keys++; kinds[s.kind].cardUses += s.cards; });
out.kinds = kinds;
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'skw1'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skw1', 'tables-engine.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`${inPlay.length} in-play cards (Maps 0-20). Triggers: ${triggers.length} (${out.triggers.filter(t => t.cards).length} on a card; ${out.triggers.filter(t => t.priced).length} priced). Actions: ${actions.length} (${out.actions.filter(a => a.cards).length} on a card; ${out.actions.filter(a => a.priced).length} priced). Pairs on cards: ${out.pairs.length}.`);
console.log('Triggers (cards): ' + out.triggers.map(t => `${t.id} ${t.cards}${t.priced ? '' : '*'}`).join(', '));
console.log('Actions (cards): ' + out.actions.map(a => `${a.id} ${a.cards}${a.priced ? '' : '*'}`).join(', '));
console.log('Skill keys by kind: ' + Object.entries(kinds).map(([k, v]) => `${k} ${v.keys} keys / ${v.cardUses} card uses`).join('; '));
console.log('Pair keywords: ' + out.skills.filter(s => s.kind === 'pair').map(s => `${s.key} (${s.how}, ${s.cards})`).join('; '));
console.log('Multi-pair: ' + out.skills.filter(s => s.kind === 'multi-pair').map(s => `${s.key} (${s.how}, ${s.cards})`).join('; '));
console.log('Top pairs: ' + out.pairs.slice(0, 25).map(p => `${p.pair} ${p.cards}`).join(', '));
