#!/usr/bin/env node
// The hand-pass list (2026-10-22, package BF7): every band card still without a legal line after the BF7 re-fit (the flagged list
// docs/balance/human-pass-1-flagged-2026-10-21.json, plus the owner's folded cards that have none), with the cheapest single change that
// gives it one: shrink one skill's number or drop one skill or trigger, never a half-miss skill (Flying ...), the least S removed, a line
// above A+H 3 first (tools/pass3_skill_costs_2026_10_22.js fixes(), under the current canonical/skill-costs.json and bramblewood-budget.js).
// Proposals only: nothing is applied.
//   node tools/hand_pass_2026_10_22.js <before.json> <after.json>   -> docs/balance/hand-pass-2026-10-22.md + .json
// before / after: {id: {name, now, line}} snapshots of every band card (the refit's rule) before BF7 and after it, for the counts.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const P = require('./pass3_skill_costs_2026_10_22.js');
const OWNER = ['conch-crawler', 'tide-pool-crab', 'ford-kingfisher', 'glacial-ape-king', 'ember-tetra-3caj']; // the owner's 10-21 live edits (BF7 fold)
const [bf, af] = process.argv.slice(2); if(!bf || !af){ console.log('usage: node tools/hand_pass_2026_10_22.js before.json after.json'); process.exit(2); }
const before = JSON.parse(fs.readFileSync(bf, 'utf8')), after = JSON.parse(fs.readFileSync(af, 'utf8'));
const flagged = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'), 'utf8'));
const ids = flagged.concat(OWNER.filter(id=> after[id] && !after[id].line && !flagged.includes(id)));
const T = P.SC.make(P.tableWith([])), fixes = P.fixes([], ids), {out: parts} = P.contributions([], ids.map(id=> P.BAND.find(c=> c.id === id)));
const sum = s=> s.split('/').reduce((a, b)=> a + +b, 0);
// the two biggest prices; a trigger's action carries the same S as its trigger (weight × value), so it is listed once, under the trigger
function topOf(list){ const kept = []; list.forEach(p=>{ if(p.kind === 'action' && kept.some(q=> q.kind === 'trigger' && q.S === p.S)) return; kept.push(p); }); return kept.slice(0, 2).map(p=> `${p.id} ${p.S}`).join(', '); }
const nb = Object.keys(before).filter(k=> !before[k].line), na = Object.keys(after).filter(k=> !after[k].line);
const moved = Object.keys(after).filter(k=> before[k] && after[k].now !== before[k].now), movedRefit = moved.filter(k=> !OWNER.includes(k));
const tiny = Object.keys(after).filter(k=> after[k].line && sum(after[k].line) <= 3);
const rows = fixes.map(f=> Object.assign(f, {owner: OWNER.includes(f.id), top: topOf(parts[f.id] || [])})).sort((a, b)=> a.name.localeCompare(b.name));
const fixText = f=> f.fix ? `${f.fix.what} → **${f.fix.line}**` : f.pair ? `two changes: ${f.pair.what} → **${f.pair.line}**` : 'none found';
const may = after['mayfly-dancer'];
const md = ['# Hand-pass list (2026-10-22, package BF7)', '',
  'After the formula fix (the half-miss ×1.5 on Attack and Health only, not on skills; Fragile ×0.7 on both caps), the duplicates zeroed, the four cuts (On Attack, Add Wait, Twin Strike, Octolash; Bounty stays 3) and the re-fit of every band card. **Nothing below is applied:** each row is the cheapest single change that would give the card a legal line.', '',
  '## The counts', '',
  '| | Before BF7 | After |', '|---|---|---|',
  `| Band cards with no legal line | ${nb.length} | **${na.length}** |`,
  `| Cards fitted at a tiny line (A+H ≤ 3) | ${Object.keys(before).filter(k=> before[k].line && sum(before[k].line) <= 3).length} | ${tiny.length} |`,
  `| Cards whose stats moved | | ${movedRefit.length} by the re-fit (+ ${moved.length - movedRefit.length} of your own edits folded) |`, '',
  `- ${nb.filter(k=> !na.includes(k)).length} cards found a line; ${na.filter(k=> !nb.includes(k)).length ? na.filter(k=> !nb.includes(k)).map(k=> after[k].name).join(', ') + ' lost one (your 10-21 edit added a skill)' : 'none lost one'}.`,
  `- Mayfly Dancer (Flying, Fragile): ${before['mayfly-dancer'].now} → **${may.now}**. Without Fragile the same card would get 2/4 on its 3/7 shape, so Fragile now buys it stats (before BF7 Fragile shrank N instead).`,
  `- The tiny lines: ${tiny.map(k=> `${after[k].name} ${after[k].line}`).join(', ')}.`,
  `- Cards that came down (most had no line before and now fit): ${movedRefit.filter(k=>{ const x = after[k].now.split('/').map(Number), y = before[k].now.split('/').map(Number); return x[0] <= y[0] && x[1] <= y[1]; }).map(k=> `${after[k].name} ${before[k].now} → ${after[k].now}`).join(', ')}.`,
  `- Your five folded edits are left as you printed them (not re-fitted). ${OWNER.filter(id=> after[id] && !after[id].line).map(id=> after[id].name).join(' and ')} have no legal line and are in the table.`, '',
  `## The ${rows.length} cards still without a line`, '',
  '"S / room": the card\'s skill worth against the most S its smallest line allows. A half-miss skill is never dropped; where dropping it alone would do, the last column says so.', '',
  '| Card | Stats | S / room | Biggest prices | Cheapest change → line | Or drop a half-miss skill |', '|---|---|---|---|---|---|',
  ...rows.map(f=> `| ${f.name}${f.owner ? ' (your 10-21 edit)' : ''} | ${f.stats} | ${f.S} / ${f.room} | ${f.top || '–'} | ${fixText(f)} | ${(f.dropHalfMiss || []).join('; ') || '–'} |`), '',
  'Data: `docs/balance/hand-pass-2026-10-22.json` (`node tools/hand_pass_2026_10_22.js before.json after.json`); the no-fit list is `docs/balance/human-pass-1-flagged-2026-10-21.json`.', ''];
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'hand-pass-2026-10-22.md'), md.join('\n'));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'hand-pass-2026-10-22.json'), JSON.stringify({generated: '2026-10-22', counts: {noFitBefore: nb.length, noFitAfter: na.length, tinyAfter: tiny.length, movedByRefit: movedRefit.length, ownerFolded: moved.length - movedRefit.length}, rows}, null, 1) + '\n');
console.log(`wrote docs/balance/hand-pass-2026-10-22.md: ${rows.length} cards; no-fit ${nb.length} -> ${na.length}, ${movedRefit.length} moved, ${tiny.length} tiny`);
