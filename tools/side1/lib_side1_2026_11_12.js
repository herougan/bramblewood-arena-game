// 2026-11-12 (package SIDE1, owner 23:50: "Help me do "yes/no" for the submaps like the maps ... I want to be strict with 1-3 skills per map"):
// the shared reading for the side-map picks tool, the card power report and tests/side1-2026-11-12.js.
//   skillsOf(card)       the card's skills: bramblewood-budget.js abilitiesOf (the two-skill rule's list), the fused parts folded into their skill,
//                        light ones (plain Flying, Tide, Diurnal, Nocturnal ...: TWO_SKILL_LIGHT) marked; triggers as 'trigger:<on>'
//   label(key)           the skill's name as the game shows it (SKILL_DEFS / PASSIVE_DEFS labels in arena_app.js, TX names through bramblewood-texts.js)
//   SIDES, unlockOf(s)   the side maps of Maps 0-21 and the main map number each opens after (the game's mapUnlockNumberOf)
//   carriedIndex(un)     card -> the first main map number (0..un) whose list holds it: the side map's Carried, as the Map cards window splits it (ui44Split)
//   ownerCuts(s)         the owner's cuts on a side map (his 11-01 export: cut + cutNow)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const SIDES = ['mo', 'mq', 'mp', 'mg', 'ms', 'mz', 'mn', 'mj', 'mv', 'my', 'mi', 'mpd', 'm9', 'me', 'mx'];
const MAIN = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11', 'm21'];
const SIDE_LIMIT = { own: 3, carried: 8 }; // the game's ui37Targets for a side map (UI48 #4)
const CARDS = J('canonical/cards.json'), C = {}; CARDS.forEach(c => { C[c.id] = c; });
// labels
const APP = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), TXT = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const LBL = {};
{ const re = /key:\s*'(\w+)'[^\n]*?label:\s*(?:'([^']+)'|TX\('([^']+)'\))/g; let m;
  while ((m = re.exec(APP))) { if (LBL[m[1]]) continue; let l = m[2]; if (!l && m[3]) { const t = TXT.match(new RegExp('"' + m[3].replace(/[.]/g, '\\.') + '":\\s*"([^"]+)"')); l = t && t[1]; } if (l) LBL[m[1]] = l; } }
const TRIG = { onSpawn: 'On Spawn', onDeath: 'On Death', onReady: 'On Ready', onTurnStart: 'On Turn Start', onAllyPlayed: 'On Ally Played', onHit: 'On Hit', onKill: 'On Kill', onAllyDeath: 'On Ally Death', onPlay: 'On Play' };
function label(k) { if (/^trigger:/.test(k)) { const on = k.slice(8); return TRIG[on] || LBL[on] || on.replace(/^on/, 'On ').replace(/([A-Z])/g, ' $1').replace(/\s+/g, ' ').trim(); }
  return LBL[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()); }
// fused parts (ENG35: diurnalGrant, nocturnalHp, arrowPoison ...) count as their skill; the budget's braces (k + 'Grant') too
const FUSE = { arrowPoison: 'arrow', arrowBleed: 'arrow', fireArrowPoison: 'fireArrow', fireArrowBleed: 'fireArrow', fireBoltPoison: 'fireBolt', fireBoltBleed: 'fireBolt' };
function baseKey(k) { if (FUSE[k]) return FUSE[k]; const g = /^(\w+?)Grant$/.exec(k); if (g) return g[1]; return k; }
function skillsOf(d) {
  const e = (d && d.effects) || {}, out = [], seen = new Set();
  BB.abilitiesOf(e).forEach(k0 => { const k = baseKey(k0); if (seen.has(k)) return; seen.add(k); out.push({ key: k, label: label(k), light: false }); });
  // light: plain form only (beside braces it counts 1, as the two-skill rule)
  out.forEach(s => { s.light = ['flying', 'tide', 'diurnal', 'nocturnal', 'crepuscular', 'sunshy', 'nightblind', 'purblind'].includes(s.key) && !(e[s.key + 'Grant'] && typeof e[s.key + 'Grant'] === 'object'); });
  return out;
}
// the game's map numbers
let LB = null; const lb = () => LB || (LB = require('../lib_bramble.js'));
function unlockOf(s) { const G = lb().G, m = G.CONQUEST_MAPS.find(x => x.id === s), a = m && m.entry && m.entry.afterMapCleared; return a ? G.mapUnlockNumberOf(a) : G.mapNumberOf(s); }
function mapName(id) { const m = lb().G.CONQUEST_MAPS.find(x => x.id === id); return m ? m.name : id; }
function pools() { return J('canonical/map-pools.json').maps; }
function parentOf(s, P) { P = P || pools(); return Object.keys(P).find(t => (P[t].submaps || {})[s]); }
// every main map (Maps 22+ too: Basalt Foundry opens after Map 23) by number, as ui37MapsData reads them
function mainByNo() { const G = lb().G; return G.CONQUEST_MAPS.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) != null).map(m => ({ id: m.id, n: G.mapNumberOf(m.id) })).sort((a, b) => a.n - b.n); }
function carriedIndex(un, P) { P = P || pools(); const idx = new Map(); mainByNo().forEach(({ id, n }) => { if (n <= un && P[id]) (P[id].cards || []).forEach(c => { if (!idx.has(c)) idx.set(c, n); }); });
  if (un <= 0) (P.m1.submaps.mtut12 || []).forEach(id => { if (!idx.has(id)) idx.set(id, -1); }); // the game carries the T-1 / T-2 cards on Map 0 / 1 only (ui37CarriedIndex)
  return idx; }
const baby = id => !!(C[id] && C[id].kind === 'baby');
let EX = null;
function ownerCuts(s) { EX = EX || J('docs/balance/owner-map-cards-export-2026-11-01.json'); const l = EX.lists.find(x => x.listKey === 'sub:' + s); if (!l) return [];
  return [...new Set((l.cut || []).map(x => typeof x === 'string' ? x : x.id).concat(l.cutNow || []))]; }
// every card the owner cut from any list on 11-01 (main maps too), with where
function allOwnerCuts() { EX = EX || J('docs/balance/owner-map-cards-export-2026-11-01.json'); const out = {};
  EX.lists.forEach(l => { const k = l.listKey === 'cards' ? l.mapId : l.listKey.replace(/^sub:/, ''); (l.cut || []).map(x => typeof x === 'string' ? x : x.id).concat(l.cutNow || []).forEach(id => { (out[id] = out[id] || []).push(k); }); });
  return out; }
module.exports = { mainByNo, ROOT, J, BB, SIDES, MAIN, SIDE_LIMIT, CARDS, C, label, skillsOf, unlockOf, mapName, pools, parentOf, carriedIndex, baby, ownerCuts, allOwnerCuts, lb };
