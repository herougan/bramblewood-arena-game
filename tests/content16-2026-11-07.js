#!/usr/bin/env node
// 2026-11-07 (package CONTENT16, owner 09:10 on where cards are earned; ENG27-9): canonical/pack-plan.json, a proposal (nothing in the game reads
// it yet). Checks: its schema; every live card has a valid source (today and proposed); no skirmish-unique card is listed in any pack, today or
// proposed; at most 20 adds per pack, each with a reason and in budget; the Drumcaller is in the Sunfeather (hummingbird) faction list; the
// achievement cards are each only an achievement's; the plan agrees with the game (a fresh run of the tool gives the same sources).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const plan = JSON.parse(rd('canonical/pack-plan.json'));
const cards = JSON.parse(rd('canonical/cards.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);
const isLive = c=> !!c && !c.pool && !c.token && !c.test && !c.field && c.cardType !== 'spell' && c.cardType !== 'materia' && !c.easterEgg && !(c.source && c.source.kind === 'easteregg');
const SOURCES = ['pack', 'pack-unique', 'skirmish-unique', 'achievement', 'starter', 'base', 'faction', 'reward', 'special', 'none'];
const SHOP = ['bronze', 'silver', 'gold', 'mystery', 'pack4'], ALLPACKS = SHOP.concat(['otters', 'hummingbirds', 'shared', 'starter', 'base']);

// ---- 1. schema
['_about', 'zones', 'zoneSplitWhy', 'packs', 'achievements', 'sources', 'issues', 'summary'].forEach(k=> ok(plan[k] != null, `1. pack-plan.json has ${k}`));
['zones', 'packs', 'achievements', 'sources'].forEach(k=> ok(typeof (plan._about || {})[k] === 'string' && plan._about[k].length > 40, `1. _about documents ${k}`));
ok(Array.isArray(plan.zones) && plan.zones.length === 3, '1. three zones for Maps 0-20');
{ let next = 0; (plan.zones || []).forEach(z=>{ ok(Array.isArray(z.maps) && z.maps[0] === next && z.maps[1] >= z.maps[0], `1. zone ${z.id} starts at Map ${next}`); next = (z.maps || [0, 0])[1] + 1;
  ok(SHOP.includes(z.pack), `1. zone ${z.id} names a shop pack`); ok(typeof z.theme === 'string' && z.theme, `1. zone ${z.id} has a theme`); }); ok(next === 21, '1. the zones end at Map 20'); }
ALLPACKS.forEach(k=>{ const p = (plan.packs || {})[k]; ok(!!p, `1. packs.${k}`); if(!p) return;
  ok(p.current && Array.isArray(p.current.cards) && p.current.count === p.current.cards.length, `1. packs.${k}.current`);
  ok(p.proposal && Array.isArray(p.proposal.add) && Array.isArray(p.proposal.remove), `1. packs.${k}.proposal`);
  ok(typeof p.proposedCount === 'number', `1. packs.${k}.proposedCount`);
  (p.proposal ? p.proposal.add.concat(p.proposal.remove, p.proposal.movedIn || []) : []).forEach(x=>{ ok(!!byId[x.id], `1. ${k}: ${x.id} is a card`); ok(typeof x.why === 'string' && x.why.length > 10, `1. ${k}: ${x.id} has a reason`); });
  (p.proposal ? p.proposal.remove : []).forEach(r=> ok(!r.moveTo || ALLPACKS.includes(r.moveTo), `1. ${k}: ${r.id} moves to a known pack`)); });

// ---- 2. every live card has a source
const live = cards.filter(isLive).map(c=> c.id);
ok(live.length === plan.summary.liveCards, `2. the plan covers the ${live.length} live cards (plan says ${plan.summary.liveCards})`);
live.forEach(id=>{ const s = plan.sources[id]; ok(!!s, `2. ${id} has a source`); if(!s) return;
  ok(SOURCES.includes(s.source), `2. ${id}: source "${s.source}" is valid`); ok(Array.isArray(s.where), `2. ${id}: where is a list`);
  if(s.proposed) ok(SOURCES.includes(s.proposed.source) && Array.isArray(s.proposed.where), `2. ${id}: proposed source valid`);
  if(s.source === 'none') ok(!!s.flag, `2. ${id}: an unobtainable card is flagged`);
  else ok(s.where.length > 0, `2. ${id}: a source says where`); });
Object.keys(plan.sources).forEach(id=> ok(isLive(byId[id]), `2. ${id} in sources is a live card`));

// ---- 3. no skirmish-unique card in a pack (today or proposed)
const inPack = (id, when)=> SHOP.some(k=> when === 'now' ? plan.packs[k].current.cards.includes(id) : (plan.sources[id].proposed || plan.sources[id]).where.includes('pack:' + k));
live.forEach(id=>{ const s = plan.sources[id]; if(!s) return;
  if(s.source === 'skirmish-unique') ok(!inPack(id, 'now'), `3. skirmish-unique ${id} is in no pack today`);
  if((s.proposed || s).source === 'skirmish-unique' || s.source === 'skirmish-unique') ok(!inPack(id, 'proposed'), `3. skirmish-unique ${id} is in no proposed pack`);
  if(byId[id].source && byId[id].source.kind === 'map') SHOP.forEach(k=> ok(!plan.packs[k].proposal.add.some(a=> a.id === id), `3. ${id} (a skirmish reward) is not added to ${k}`)); });
ok(plan.issues.skirmishUniqueInPack.today.length === 0 && plan.issues.skirmishUniqueInPack.proposed.length === 0, '3. issues.skirmishUniqueInPack is empty');

// ---- 4. the proposal's rules
['bronze', 'silver', 'gold'].forEach(k=>{ const a = plan.packs[k].proposal.add; ok(a.length <= 20, `4. ${k}: at most 20 adds (${a.length})`);
  a.forEach(x=>{ ok(x.budget && x.budget.verdict !== 'OVER', `4. ${k}: ${x.id} fits the budget at Map ${x.budget && x.budget.map}`);
    ok(['common', 'uncommon'].includes(byId[x.id].rarity), `4. ${k}: ${x.id} is a basic rarity (${byId[x.id].rarity})`); }); });
{ const seen = {}; ALLPACKS.forEach(k=> plan.packs[k].proposal.add.forEach(a=>{ ok(!seen[a.id], `4. ${a.id} is added once (${seen[a.id] || ''} ${k})`); seen[a.id] = k; }));
  Object.values(plan.achievements).forEach(a=>{ ok(!seen[a.card], `4. achievement card ${a.card} is in no pack add`); seen[a.card] = 'achievement'; }); }
ok(plan.packs.hummingbirds.proposal.add.some(a=> a.id === 'crimson-wing-drumcaller'), '4. ENG27-9: the Drumcaller is added to the Sunfeather (hummingbird) faction list');
ok((plan.sources['crimson-wing-drumcaller'].proposed || {}).source === 'faction', '4. the Drumcaller\'s proposed source is faction');
Object.entries(plan.achievements).forEach(([a, v])=>{ ok(!!byId[v.card], `4. achievement ${a}: ${v.card} is a card`); const s = plan.sources[v.card] || {};
  ok((s.proposed || s).source === 'achievement', `4. ${v.card} is achievement-only under the proposal`); ok(v.budget && v.budget.verdict !== 'OVER', `4. ${v.card} fits the budget at Map ${v.budget && v.budget.map}`); });
ok(Object.keys(plan.achievements).length === 17, '4. one card for each of the 17 achievements');

// ---- 5. the plan agrees with the game: a fresh run (no write) gives the same summary
{ const { execFileSync } = require('child_process'); let outp = '';
  try{ outp = execFileSync(process.execPath, [path.join(ROOT, 'tools', 'content16_pack_plan_2026_11_07.js'), '--check'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}); }catch(e){ outp = String(e.stdout || ''); }
  const m = /sources today\s+(\{.*\})/.exec(outp), p = /sources proposed\s+(\{.*\})/.exec(outp);
  ok(!!m && JSON.stringify(JSON.parse(m[1])) === JSON.stringify(plan.summary.sourcesToday), '5. a fresh run gives the same sources today (re-run tools/content16_pack_plan_2026_11_07.js)');
  ok(!!p && JSON.stringify(JSON.parse(p[1])) === JSON.stringify(plan.summary.sourcesProposed), '5. a fresh run gives the same proposed sources'); }

// ---- 6. paperwork
ok(fs.existsSync(path.join(ROOT, 'docs', 'pack-plan-2026-11-07.md')), '6. docs/pack-plan-2026-11-07.md');
ok(/^## 2026-11-07 Package CONTENT16/m.test(rd('docs/CHANGELOG.md')), '6. CHANGELOG entry');
{ const dec = JSON.parse(rd('docs/decisions.json')).items; ok(dec.some(d=> d.id === 'CONTENT16-1'), '6. CONTENT16-1 in decisions.json');
  dec.filter(d=> /^CONTENT16-/.test(d.id)).forEach(d=> ok((d.body + ' ' + (d.options || []).join(' ')).split(/\s+/).length < 100, `6. ${d.id} under 100 words`)); }

console.log(`content16-2026-11-07: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
