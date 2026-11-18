#!/usr/bin/env node
// 2026-11-19 (package LVL11, owner 11-18 21:31: "Tokens should also grow in strength. E.g. the Bee Swarmling is a flying 1/1. Maybe this becomes a 2/3
// at level 10."): each token's growth table (levelBonus, stats only) in canonical/cards.json. A summoned token comes out at its summoner's level
// (bramblewood-engine.js eng36StatsAt) and grows by this table.
//   Level 10 gain, in stat points (3A + H): the median gain of the stats-only cards of its size (in-play base Level 1 cards with no skill growth and
//   no later skill, Level 1 points within 3 of the token's; widened until 5 peers). A 1/1 (4 points): +5 -> 2/3.
//   Spread over Levels 2-10 in the shape of the token's old curve (its Levels 4 / 7 / 10 steps), Attack toward its own Attack : Health (LVL10's split).
// Not here: the Summoned Shield (Shield Call's own rule: +1 Health a level, owner 2026-10-10), and engine-made tokens (Log Wall: its own levelStats).
// Usage: node tools/lvl10/tokens_2026_11_19.js [--dry] [--force]   (default: only tokens without levelBonus, so a re-run changes nothing)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), GEN = require(path.join(__dirname, 'gen_2026_11_18.js'));
const AW = (BB.DEFAULTS && BB.DEFAULTS.attackWeight) || 3, TOP = 10, SKIP = ['summoned-shield'];
const args = process.argv.slice(2), DRY = args.includes('--dry'), FORCE = args.includes('--force');
const pts = (a, h)=> AW * (a || 0) + (h || 0);
function peersGain(cards){ // [Level 1 points, Level 10 gain] of the stats-only cards
  return cards.filter(d=> GEN.eligible(d) && d.levelBonus && !d.unattainable && !d.awaitingSource && GEN.baseLevel(d) === 1 && !d.levelSkills)
    .map(d=>{ const b = BB.levelBonusAt(d, TOP, 1); return Object.keys(b.skills).length ? null : [pts(d.attack, d.health), pts(b.attack, b.health)]; }).filter(Boolean); }
function gainFor(p1, peers){ for(let w = 3; w < 40; w++){ const g = peers.filter(x=> Math.abs(x[0] - p1) <= w).map(x=> x[1]).sort((a, b)=> a - b); if(g.length >= 5) return g[Math.floor(g.length / 2)]; } return 0; }
function tableFor(t, peers){
  const base = GEN.baseLevel(t), old = BB.forgeCurve(Object.assign({}, t, {levelBonus: undefined, obtainMap: 0}), base, TOP).rows;
  const P10 = gainFor(pts(t.attack, t.health), peers), oldP = L=>{ let s = 0; for(let k = base + 1; k <= L; k++) s += (old[k] && old[k].points) || 0; return s; }, W = oldP(TOP) || 1;
  const fin = GEN.split(P10, t.attack, t.health, t.attack > 0 ? AW : 0, 0, 0), lb = {}; let A = 0, H = 0; // the Level 10 form, then each stat on the old curve's shape
  for(let L = base + 1; L <= TOP; L++){ const w = oldP(L) / W, a = Math.round(fin.da * w), h = Math.round(fin.dh * w), o = {};
    if(a > A) o.attack = a - A; if(h > H) o.health = h - H; A = a; H = h; if(Object.keys(o).length) lb[String(L)] = o; }
  return lb; }
function main(){
  const cards = JSON.parse(fs.readFileSync(FILE, 'utf8')), peers = peersGain(cards), out = [];
  cards.forEach(t=>{ if(!t.token || SKIP.includes(t.id) || typeof t.attack !== 'number' || typeof t.health !== 'number' || (t.levelBonus && !FORCE)) return;
    const lb = tableFor(t, peers), b = BB.levelBonusAt(Object.assign({}, t, {levelBonus: lb}), TOP, GEN.baseLevel(t));
    out.push(`${t.id} ${t.attack}/${t.health} -> ${t.attack + b.attack}/${t.health + b.health} at Level ${TOP}`); if(!DRY) t.levelBonus = lb; });
  console.log(out.join('\n') || 'nothing to fill');
  if(!DRY && out.length) fs.writeFileSync(FILE, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n'); // the file's own escaping
}
if(require.main === module) main();
module.exports = {tableFor, peersGain, gainFor};
