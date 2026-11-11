#!/usr/bin/env node
// 2026-11-12 (package SKIR3): the maps whose decks now put a card in one more fight than SKIR1's usage line (half the map's fights, 2 at least; one more
// on a SKIR1 slack map): each kept SKIR3 search / jump pick run with --slack 1 that did so, named with its reason. Read by tests/skir1 (usage line).
// Each map: how many fights over (extra), whether its list is too thin for the line at all, and why.   node tools/skir3/slack_2026_11_12.js   -> docs/balance/skir3/slack-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), L = require('../skir1/lib_fight_2026_11_11.js');
const picks = {}; ['jump', 'search'].forEach(dir => { const D = path.join(ROOT, 'docs', 'balance', 'skir3', dir); if (!fs.existsSync(D)) return;
  fs.readdirSync(D).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); if (x.keep && x.slack) picks[x.code] = x; }); });
const out = { about: 'SKIR3: maps where a kept search / jump pick (run with --slack 1) puts a card in one more fight than the usage line (tools/skir3/slack_2026_11_12.js)', built: '2026-11-12', maps: {} }, problems = [];
for (const m of L.maps()) {
  const fl = L.fightsOf(m), F = fl.map(n => L.fight(m, n)), ucap = L.ucapOf(m), use = {}, where = {};
  F.forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) { use[id] = (use[id] || 0) + 1; (where[id] = where[id] || []).push(f.code); } }));
  const over = Object.entries(use).filter(([, k]) => k > ucap); if (!over.length) continue;
  const extra = Math.max(...over.map(([, k]) => k - ucap)), list = [...new Set([].concat(...F.map(f => f.pool)))], thin = list.length * ucap < fl.length * 5;
  const by = over.map(([id, k]) => `${id} ${k}/${ucap} (${where[id].join(', ')})`), from = fl.map(n => n.key).filter(c => picks[c] && over.some(([id]) => (picks[c].pick.deck || {})[id]));
  out.maps[m.id] = { extra, thin, why: `${by.join('; ')}: ` + (thin ? `a thin list (${list.length} cards in its fights' pools for ${fl.length} fights of 5+ different cards: the line cannot hold)` : `the 11-12 list's own cards were all at the line when SKIR3 refilled / searched its fights` + (from.length ? ` (${from.join(', ')})` : '')) };
}
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'slack-2026-11-12.json'), JSON.stringify(out, null, 1) + '\n');
Object.entries(out.maps).forEach(([k, v]) => console.log(k, '+' + v.extra, v.thin ? 'thin' : '', v.why.slice(0, 160)));
