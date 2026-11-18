#!/usr/bin/env node
// 2026-11-18 (package CARDPOW2): docs/balance/cardpow2-2026-11-18.md from changes-2026-11-18.json (the proposer's rows, power before = the
// ratings of this session's 62-card run or the 11-16 run) and docs/balance/bal25/card-power.json as it stands (power after, for the cards
// re-rated after the change: the "after" ids in after-ids.txt).   node docs/balance/cardpow2/report_2026_11_18.js
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const rows = J('docs/balance/cardpow2/changes-2026-11-18.json'), CP = J('docs/balance/bal25/card-power.json');
const med = (() => { const v = CP.rows.filter(r => r.winRate != null && r.scope !== 'extra').map(r => r.winRate).sort((a, b) => a - b); return v.length % 2 ? v[v.length >> 1] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; })();
const cp = {}; CP.rows.forEach(r => { cp[r.id] = r; });
const afterIds = fs.existsSync(path.join(__dirname, 'after-ids.txt')) ? new Set(fs.readFileSync(path.join(__dirname, 'after-ids.txt'), 'utf8').trim().split(',')) : new Set();
const pw = id => { const r = cp[id]; return r && r.winRate != null ? Math.round(r.winRate - med) : null; }, fb = id => cp[id] && cp[id].forBudget != null ? cp[id].forBudget : null;
const sg = v => v == null ? 'n/a' : (v > 0 ? '+' : '') + v;
const ch = rows.filter(r => r.action === 'change'), fl = a => rows.filter(r => r.action.startsWith(a));
const md = ['# CARDPOW2: Maps 0-20 cards brought into their budget band by power rating (2026-11-18)', '',
  'Owner 11-17 23:41 overnight plan ("after rebalancing after finding out the power ratings"). Scope: every in-play card whose first map is 0-20 and that is on a Maps 0-20 main or side list. Band: budget fill 85-100% (B / N, `tools/skill_costs.js` budget(card) at its printed level, the CARDPOW1 band); power = the card power test (`tools/card_balance.js --v3 --scope=all`, 400 games a card), win % minus the median Maps 0-20 card, "for its budget" (fb) = power minus what its N predicts.', '',
  '## Rule', '',
  '- **Over budget** (fill over 100% or budget not ok): trimmed, unless the power test says it is already weak (fb -10 or less): then flagged (the budget over-prices it).',
  '- **Under 85%** and weak by power (fb -10 or less): raised into the band. Under 85% but not weak: left alone; strong ones (fb +10 or more) flagged (the budget misses them).',
  '- Least change: one skill N step first (a drawback such as Recoil steps down to buff), then the smallest stat step (Attack counts 1.5, Health 1); a 0-Attack wall stays at 0 Attack; no skill added or removed, so every card keeps its REDESIGN3 skill set; every result `K.budget(card).ok` and in band at Level 1 in the card editor\'s reading (CARDPOW1 tool). More than 3 stat points: proposal only.',
  '- Never: owner-set cards (`tools/pipeline/config.json` refit.ownerCards), Level 0 cards whose Level 1 reading is off (decision CARDPOW1-1, the budget file, not this package).', '',
  `## Changed (${ch.length})`, '', `Power before: this session's rating (62 cards re-rated; the others from 11-16, cached). Power after: re-rated after the change (400 games) where shown.`, '',
  '| Card | Map | Rarity | Change | Fill before -> after | Power before (fb) | Power after (fb) |', '|---|---|---|---|---|---|---|'];
ch.forEach(r => md.push(`| ${r.name} | ${r.map} | ${r.rarity} | ${r.how} | ${r.fill}% -> ${r.after.fill}% | ${sg(r.power)} (${sg(r.forBudget)}) | ${afterIds.has(r.id) ? `${sg(pw(r.id))} (${sg(fb(r.id))})` : 'not re-rated'} |`));
const list = (t, a, f) => { if (!a.length) return; md.push('', `## ${t} (${a.length})`, ''); a.forEach(r => md.push(`- ${r.name} (Map ${r.map}, ${r.stats}, ${r.skills || 'no skills'}): fill ${r.fill}%, power ${sg(r.power)}, fb ${sg(r.forBudget)}${f ? f(r) : ''}`)); };
list('Flagged: over budget but weak (the budget over-prices them; not trimmed)', fl('flag: over budget but weak'));
list('Flagged: under budget but strong (the budget misses them)', fl('flag: under budget but strong'));
list('Flagged: needs more than 3 stat points (proposal only)', fl('flag: needs more'), r => `; proposal ${r.how} (${r.after.fill}%)`);
list('Flagged: Level 0 cards (CARDPOW1-1)', fl('flag: Level 0'));
list('Owner-set, outside the band (not retuned)', fl('flag: owner-set'));
md.push('', `Left alone (under 85%, power near its band): ${fl('leave').map(r => r.name).join(', ')}.`, '',
  'Also: FOLD5-1 a (default): Lion\'s Mane Jelly resists Poison (`resist: ["poison"]`).', '',
  'Files: `docs/balance/cardpow2/changes-2026-11-18.json` (every row), `docs/balance/bal25/card-power.json`, `docs/balance/cardpow1/cardpow1-2026-11-16.{json,csv,md}` (re-run after the change). Tools: `docs/balance/cardpow2/write_cards_2026_11_18.py`, this report script.');
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'cardpow2-2026-11-18.md'), md.join('\n') + '\n'); console.log('written', ch.length, 'changes');
