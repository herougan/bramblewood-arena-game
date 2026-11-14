#!/usr/bin/env node
// 2026-11-14 (package SKW1, owner 11-14 11:31: "too many named skills have surfaced ... maybe 25-30 named skills max for Maps 0-20"): how
// many distinct named skills a player meets on Maps 0-20, by map. Reads canonical/map-pools.json (each main map's list and its side maps'
// lists; the tutorial lists left out), canonical/cards.json (effects and levelSkills) and canonical/skill-costs.json (prices). Writes
// docs/balance/skw1/named-skills.json and prints a table. A named skill = an effects key that is not a parameter of another skill
// (bramblewood-budget.js PARAMS, *Grant braces) and not the raw `triggers` list (custom triggers carry no name; counted apart).
//   node tools/skw1/named_skills.js
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..');
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const gm = O.loadGame(ROOT), BB = gm.Budget, PARAMS = new Set(BB.PARAMS || []);
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), price = Object.fromEntries(costs.skills.map(s => [s.id, s.value]));
const named = eff => Object.keys(eff || {}).filter(k => k !== 'triggers' && !PARAMS.has(k) && !/Grant$/.test(k));
const byMap = [];
Object.keys(pools).forEach(id => { let n; try { n = gm.G.mapNumberOf(id); } catch (e) { return; } if (n == null || n > 20) return;
  const p = pools[id], ids = new Set(p.cards || []); Object.entries(p.submaps || {}).forEach(([s, l]) => { if (!/^mtut/.test(s)) l.forEach(x => ids.add(x)); });
  const skills = {}, lvl = {}; let custom = 0;
  ids.forEach(cid => { const d = gm.D[cid]; if (!d) return; named(d.effects).forEach(k => { (skills[k] = skills[k] || []).push(cid); });
    if ((d.effects || {}).triggers) custom++;
    Object.values(d.levelSkills || {}).forEach(e => named(e).forEach(k => { (lvl[k] = lvl[k] || []).push(cid); })); });
  byMap.push({ map: n, id, cards: ids.size, skills, levelOnly: Object.keys(lvl).filter(k => !skills[k]), lvl, customTriggerCards: custom }); });
byMap.sort((a, b) => a.map - b.map || (a.id < b.id ? -1 : 1));
const seen = new Map(), rows = [];
const maps = [...new Set(byMap.map(m => m.map))];
maps.forEach(n => { const here = byMap.filter(m => m.map === n), set = new Set(), cards = new Set(); let custom = 0;
  here.forEach(m => { Object.keys(m.skills).concat(m.levelOnly).forEach(k => set.add(k)); custom += m.customTriggerCards; });
  const fresh = [...set].filter(k => !seen.has(k)); fresh.forEach(k => seen.set(k, n));
  rows.push({ map: n, lists: here.map(m => m.id), onMap: set.size, newHere: fresh.sort(), cumulative: seen.size, customTriggerCards: custom }); });
// every named skill met by Map 20: first map, cards carrying it (Maps 0-20 lists), price
const carriers = {}; byMap.forEach(m => { Object.entries(m.skills).forEach(([k, l]) => l.forEach(c => (carriers[k] = carriers[k] || new Set()).add(c))); Object.entries(m.lvl).forEach(([k, l]) => l.forEach(c => (carriers[k] = carriers[k] || new Set()).add(c + '@lvl'))); });
const all = [...seen.keys()].map(k => ({ key: k, firstMap: seen.get(k), cards: carriers[k] ? carriers[k].size : 0, price: price[k] != null ? price[k] : null })).sort((a, b) => a.firstMap - b.firstMap || b.cards - a.cards);
const out = { tool: 'tools/skw1/named_skills.js 1.0.0 (2026-11-14, SKW1)', generated: new Date().toISOString(), byMap: rows, skills: all };
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skw1', 'named-skills.json'), JSON.stringify(out, null, 1) + '\n');
console.log('| Map | Named skills on its lists | New here | Met so far |'); console.log('|---|---|---|---|');
rows.forEach(r => console.log(`| ${r.map} | ${r.onMap} | ${r.newHere.length}: ${r.newHere.join(', ')} | ${r.cumulative} |`));
console.log('\nskills met by Map 20 (first map, carriers):'); console.log(all.map(s => `${s.key} m${s.firstMap} x${s.cards}${s.price != null ? ' $' + s.price : ''}`).join('; '));
