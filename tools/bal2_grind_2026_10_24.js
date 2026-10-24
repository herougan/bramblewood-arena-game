#!/usr/bin/env node
// Package BAL2 (2026-10-24, DF-2, owner 10-23 17:34: "don't look down on the grind they have to do to level up their cards to that tier's gate"):
// the Dust and Maple Leaves it takes to bring a deck's copies up to each Forge tier's cap, from canonical/upgrade-costs.json (the game's
// UPGRADE_COSTS): a step L -> L+1 is forgeStepDust[L] Dust x the rarity's levelCostMult x the card's modifier, Leaves two thirds of that; the
// copies level one at a time (per-copy levels, NF), so a deck pays it 20 times. Modifiers: a map reward or quest card x questBase (0.5), a Base
// card x base (1, BAL2) and it stops at Lv 4, a pack card x1. Income: the daily notices, about 3,450 Dust a week at six a day (the arena_app.js
// QUEST_RANK_REWARD note), Leaves about the same. Prints the markdown table for docs/progression-plan.md ("The grind to each gate").
//   node tools/bal2_grind_2026_10_24.js
'use strict';
const fs = require('fs'), path = require('path');
const U = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'upgrade-costs.json'), 'utf8'));
const STEP = U.forgeStepDust, MULT = U.levelCostMult, MOD = {map: U.modifiers.questBase, base: U.modifiers.base != null ? U.modifiers.base : 1, pack: 1};
const tiers = U.forgeTiers.map(t=> ({name: t.name, cap: t.cap, map: t.map || 11, gold: t.gold || 0, dust: t.dust || 0}));
const perCopy = (rar, mod, from, to)=>{ let d = 0; for(let L = Math.max(1, from); L < to; L++) d += STEP[L] * MULT[rar] * MOD[mod]; return {dust: Math.round(d), gold: Math.round(d * 2 / 3)}; };
const WEEK_DUST = 3450;
// a typical deck by the map: 20 copies; on the road's own cards 12 Common, 6 Uncommon, 2 Rare (Rare from Map 10)
const deckOf = mod=> mod === 'base' ? [['common', 20]] : [['common', 12], ['uncommon', 6], ['rare', 2]];
const rows = []; let prevCap = 1;
rows.push('| Forge tier (opens) | Cap | One Common copy: map card / Base card / pack card (Dust) | A 20-copy road deck (12 C, 6 U, 2 R): map cards / pack cards (Dust) | The same Base deck (20 Commons, Lv 4 at most) | Tier upgrade | Weeks of notices (map deck, from the last cap) |', '|---|---|---|---|---|---|---|');
tiers.forEach(t=>{
  const c = m=> perCopy('common', m, prevCap, t.cap).dust;
  const deck = m=> deckOf(m).reduce((s, [r, k])=> s + k * perCopy(r, m, prevCap, t.cap).dust, 0);
  const baseTo = Math.min(4, t.cap), baseDeck = prevCap >= 4 ? 0 : 20 * perCopy('common', 'base', prevCap, baseTo).dust;
  const wk = (deck('map') + t.dust) / WEEK_DUST;
  rows.push(`| ${t.name} (Map ${t.map}) | Lv ${t.cap} | ${c('map')} / ${prevCap >= 4 ? '- (stops at 4)' : perCopy('common', 'base', prevCap, baseTo).dust} / ${c('pack')} | ${deck('map')} / ${deck('pack')} | ${prevCap >= 4 ? '- (stops at 4)' : baseDeck} | ${t.dust ? t.dust + ' Dust, ' + t.gold + ' Leaves' : '-'} | ${wk.toFixed(1)} |`);
  prevCap = t.cap;
});
const all = m=> deckOf(m).reduce((s, [r, k])=> s + k * perCopy(r, m, 1, 10).dust, 0);
console.log(rows.join('\n'));
console.log(`\nIn all, Lv 1 -> 10: one Common map card ${perCopy('common', 'map', 1, 10).dust} Dust, a pack card ${perCopy('common', 'pack', 1, 10).dust}; the 20-copy map deck ${all('map')} Dust (${(all('map') / WEEK_DUST).toFixed(1)} weeks of notices), the pack deck ${all('pack')}. A Base deck to Lv 4: ${20 * perCopy('common', 'base', 1, 4).dust} Dust (was ${20 * Math.round((STEP[1] + STEP[2] + STEP[3]) * 0.5)} at x0.5).`);
