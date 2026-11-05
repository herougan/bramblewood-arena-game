#!/usr/bin/env node
// 2026-11-06 (package CONTENT12, decision DELIV-1 a): canonical/skill-costs.json lumberHome again for every Lumber maker, Delivery's carriers
// included. tools/bal12/lumber_homes_2026_11_02.js's rule (a maker's homes: the map lists that hold it; each home's mean Lumber cost: the mean
// cost of that map's bench pool, deckopt's bpro pool; the card's value: the mean over its homes), with Delivery / Delivery every turn as
// makers while they deliver Lumber (canonical/skill-costs.json lumberHomeKeys). Since ENG22 (11-03) renamed the Lumber-when-Ready skills to
// Delivery, the carriers on no BAL12 row (Beaver Lumberjack, Otter Angler ...) had no home value, and the table's existing rows were not read.
//   node tools/deliv1_lumber_homes_2026_11_06.js [--write]   -> docs/balance/deliv1-lumber-homes-2026-11-06.json (+ the table with --write)
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./bench/lib.js'), BB = require('../bramblewood-budget.js');
const ROOT = L.ROOT, gm = L.O.loadGame(ROOT), r3 = v => Math.round(v * 1000) / 1000;
const SCF = path.join(ROOT, 'canonical', 'skill-costs.json'), table = JSON.parse(fs.readFileSync(SCF, 'utf8'));
const KEYS = [...(BB.LUMBER_MAKER_KEYS || ['onReadyGold']), ...((table.lumberHomeKeys && table.lumberHomeKeys.keys) || [])];
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const homeOf = id => { const out = new Set();
  Object.entries(pools).forEach(([mid, e]) => { if ((e.cards || []).includes(id) || (e.special || []).includes(id)) out.add(mid);
    Object.entries(e.submaps || {}).forEach(([sid, l]) => { const list = Array.isArray(l) ? l : (l && l.cards) || []; if (list.includes(id)) out.add(sid); }); });
  return [...out]; };
const lumberDelivery = e => !e.deliveryRes || e.deliveryRes === 'lumber';
const isMaker = c => { const e = c.effects || {}; return KEYS.some(k => e[k] && (k === 'onReadyGold' || lumberDelivery(e))) || (e.triggers || []).some(t => t && t.do === 'gain' && t.resource === 'lumber'); };
const meanOfCtx = {}, ctxMean = id => { if (meanOfCtx[id] !== undefined) return meanOfCtx[id];
  try { const X = L.contextOf(gm, { kind: 'map', map: id, k: 6, mode: 'bpro' }); meanOfCtx[id] = X.pool.length ? r3(X.pool.reduce((t, c) => t + (+(gm.D[c] && gm.D[c].cost) || 0), 0) / X.pool.length) : null; }
  catch (e) { meanOfCtx[id] = null; } return meanOfCtx[id]; };
const lumberHome = {}, rows = [], old = Object.assign({}, table.lumberHome || {}); delete old._about;
cards.filter(c => c.health != null && !c.token && !c.test && isMaker(c)).forEach(c => {
  const homes = homeOf(c.id).map(m => ({ map: m, mean: ctxMean(m) })).filter(h => h.mean != null); if (!homes.length) { rows.push({ id: c.id, homes: [], mean: null, was: old[c.id] ?? null }); return; }
  const mean = r3(homes.reduce((t, h) => t + h.mean, 0) / homes.length); lumberHome[c.id] = mean;
  rows.push({ id: c.id, homes, mean, mult: BB.lumberHomeMult ? BB.lumberHomeMult(mean) : null, was: old[c.id] ?? null }); });
rows.forEach(r => console.log(`${r.id.padEnd(26)} ${r.mean == null ? 'no list' : r.mean + (r.mult != null ? ' x' + r.mult : '')}${r.was != null && r.was !== r.mean ? ' (was ' + r.was + ')' : r.was == null && r.mean != null ? ' (new)' : ''}  ${r.homes.map(h => h.map + ' ' + h.mean).join(', ')}`));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'deliv1-lumber-homes-2026-11-06.json'), JSON.stringify({ tool: 'tools/deliv1_lumber_homes_2026_11_06.js', generated: '2026-11-06', keys: KEYS, rows }, null, 1) + '\n');
if (process.argv.includes('--write')) { let s = fs.readFileSync(SCF, 'utf8');
  const v = Object.assign({ _about: '2026-11-02 (package BAL12, owner BAL11-4 a): each Lumber maker\'s home lists\' mean Lumber cost (their bench pools); bramblewood-budget.js lumberHomeMult prices its Lumber skill by it. 2026-11-06 (CONTENT12, DELIV-1 a): re-read with Delivery\'s carriers (tools/deliv1_lumber_homes_2026_11_06.js, docs/balance/deliv1-lumber-homes-2026-11-06.json).' }, lumberHome);
  s = s.replace(/\n "lumberHome": .*\n/, '\n "lumberHome": ' + JSON.stringify(v) + (/\n "lumberHome": .*,\n/.test(s) ? ',' : '') + '\n');
  JSON.parse(s); fs.writeFileSync(SCF, s); console.log('-> canonical/skill-costs.json lumberHome (' + Object.keys(lumberHome).length + ' cards)'); }
