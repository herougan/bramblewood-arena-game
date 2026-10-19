// tools/road_gaps_2026_10_19.js (2026-10-19, package BF3; owner 16:22: "Where honest levers can't reach the target, LEAVE it and list
// the gap ... how many fights land on target and how many would need a future 'cheat' field")
//
// Reads the final road measure (docs/balance/skirmish-pass-bf-after.jsonl, 120 games on the measure seeds) and, when present, the
// fresh-seed check (skirmish-pass-bf-fresh.jsonl) and the Shield-override measure (skirmish-pass-bf5-dropov.jsonl: the 26 fights whose
// override is above the rule, played on the rule), and writes docs/balance/road-gaps-2026-10-19.json:
//   counts   main / side fights on the curve: green, easy, hard
//   gaps     every curve fight outside its green band after the honest-lever retune (enemy decks only; levels on the owner's schedule):
//            map, code, kind, measured win %, target %, band, how far out, and which way (easy: would need a harder "cheat" field;
//            hard: the honest levers already took the deck as low as the map's own cards allow)
//   dropov   the Shield overrides above the rule: each fight's win % with its override and on the rule (an owner call; not removed)
//
//   node tools/road_gaps_2026_10_19.js          writes the JSON and prints a summary
//   node tools/road_gaps_2026_10_19.js --check  exits 1 if the JSON is not what the measures say
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), BAL = path.join(ROOT, 'docs', 'balance'), OUT = path.join(BAL, 'road-gaps-2026-10-19.json');
const rd = tag=>{ try{ return fs.readFileSync(path.join(BAL, 'skirmish-pass-' + tag + '.jsonl'), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const r1 = v=> Math.round(v * 10) / 10;
const after = rd('bf-after'), fresh = rd('bf-fresh'), drop = rd('bf5-dropov');
if(!after.length){ console.error('no docs/balance/skirmish-pass-bf-after.jsonl'); process.exit(1); }
const group = r=> r.side ? 'side' : r.endless ? 'endless' : 'main';
const counts = {};
after.filter(r=> r.curve).forEach(r=>{ const g = group(r), c = counts[g] = counts[g] || {fights: 0, green: 0, easy: 0, hard: 0}; c.fights++; c[r.green]++; });
const freshCounts = {};
fresh.filter(r=> r.curve).forEach(r=>{ const g = group(r), c = freshCounts[g] = freshCounts[g] || {fights: 0, green: 0, easy: 0, hard: 0}; c.fights++; c[r.green]++; });
const gaps = after.filter(r=> r.curve && r.green !== 'green').map(r=> ({map: r.map, mapNo: r.mapNo, group: group(r), code: r.code, kind: r.kind, name: r.name,
  win: r.win, target: r1(r.target), lo: r1(r.lo), hi: r1(r.hi), out: r1(r.green === 'easy' ? r.win - r.hi : r.lo - r.win), way: r.green,
  needs: r.green === 'easy' ? 'a harder fight than its decks allow: a future "cheat" field' : 'an easier fight than the map\'s own cards allow (deck already at its weakest honest build)',
  shield: r.shield, overridden: !!r.overridden}))
  .sort((a, b)=> (a.group === b.group ? 0 : a.group === 'main' ? -1 : 1) || a.mapNo - b.mapNo || a.code.localeCompare(b.code, 'en', {numeric: true}));
const byCode = Object.fromEntries(after.map(r=> [r.map + ':' + r.key, r]));
const dropov = drop.map(r=>{ const a = byCode[r.map + ':' + r.key] || {}; return {map: r.map, code: r.code, kind: r.kind, shieldWith: a.shield, shieldRule: r.shield,
  winWith: a.win, winRule: r.win, target: r1(r.target), lo: r1(r.lo), hi: r1(r.hi), greenWith: a.green, greenRule: r.green}; })
  .sort((a, b)=> a.code.localeCompare(b.code, 'en', {numeric: true}));
const out = {generated: '2026-10-19', tool: 'tools/road_gaps_2026_10_19.js', from: 'docs/balance/skirmish-pass-bf-after.jsonl (120 games, measure seeds 9100)',
  levers: 'honest only (owner 16:22): enemy decks built for synergy inside the map theme and the rarity cap (Very Rare from Map 10); enemy levels on the owner\'s schedule (Maps 1-4 Lv 1, Maps 5-9 Lv 1-2, Map 10+ Lv 2 rising 0.2 a map); no new Shield overrides, no lower Health, no field buffs',
  counts, freshCounts, gaps: {total: gaps.length, easy: gaps.filter(g=> g.way === 'easy').length, hard: gaps.filter(g=> g.way === 'hard').length, list: gaps},
  dropov: {fights: dropov.length, note: 'Shield overrides above the rule (an owner call: kept). winRule = the same fight with its override dropped (Shield on the rule, hqHp kept)', list: dropov}};
const text = JSON.stringify(out, null, 1) + '\n';
if(process.argv.includes('--check')){ let cur = ''; try{ cur = fs.readFileSync(OUT, 'utf8'); }catch(e){}
  const strip = s=> s.replace(/"generated": "[^"]*",?/, ''); if(strip(cur) !== strip(text)){ console.error('road-gaps-2026-10-19.json is stale: re-run node tools/road_gaps_2026_10_19.js'); process.exit(1); }
  console.log('road-gaps: current'); process.exit(0); }
fs.writeFileSync(OUT, text);
console.log('counts', JSON.stringify(counts), '\nfresh', JSON.stringify(freshCounts));
console.log('gaps', gaps.length, '(easy', out.gaps.easy + ', hard', out.gaps.hard + ')');
gaps.forEach(g=> console.log(' ', g.group.padEnd(5), g.code.padEnd(8), g.kind.padEnd(9), `${g.win}% target ${g.target} (${g.lo}-${g.hi})`, g.way, '+' + g.out));
if(dropov.length){ console.log('Shield overrides above the rule:', dropov.length); dropov.forEach(d=> console.log(' ', d.code.padEnd(8), `Shield ${d.shieldWith} -> rule ${d.shieldRule}: ${d.winWith}% -> ${d.winRule}% (target ${d.target}; ${d.greenWith} -> ${d.greenRule})`)); }
