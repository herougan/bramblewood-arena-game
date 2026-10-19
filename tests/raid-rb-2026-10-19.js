#!/usr/bin/env node
// Package RB (2026-10-19, raid balance; owner 12:23): raid damage = bramble damage x the rank (no x15), a win 1,000 x the rank; the
// Goliath at 200,000 x3 + 500,000; the elders' ceiling 50; the boss's weakening (one curve, RaidM.bossWeakening); instances of 250;
// the rescaled participation tiers, quest and medals; saved edits brought onto the new scale; raid numbers in the game's language;
// no damage formula for players; the paged live rows; the texts in the 12 packs; the completion model's doc.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const texts = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8'), fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')).find(r=> r.id === 'goliath');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const part = id=> goliath.parts.find(p=> p.id === id);

// ---- C3 / C8: the scale
{ const c = (d, rank, ow, p)=> R.contributionFor(goliath, d, !!ow, part(p || 'left'), rank);
  ok(goliath.scoring.perInFightHp === 1 && goliath.scoring.cap === 1000 && goliath.scoring.overwhelmCap === 1000, 'C3. scoring: x1, cap 1,000, a win 1,000');
  ok(c(130, 'B') === 131 && c(130) === 130 && c(100, 'A') === 110 && c(100, 'S') === 120 && c(100, 'SS') === 150 && c(100, 'SSS') === 200, 'C3. "130 * 1.01 (B) = 131": bramble x the rank');
  ok(c(140, 'B', false, 'core') === 141 && !part('core').scoring, 'C3. the Core too: no x140 of its own any more');
  ok(c(5, null, true) === 1000 && c(5, 'B', true) === 1010 && c(5, 'SSS', true) === 2000, 'C8. a win: 1,000 x the rank (SSS 2,000)');
  ok(c(9999, 'SSS') === 2000 && c(9999) === 1000, 'C3. a fight\'s bramble damage is capped at 1,000 before the rank');
  ok(R.contributionFor({}, 50, false) === 50 && R.contributionFor({}, 1, true) === 1000, 'C3. a raid without scoring gets the new defaults (SCORING_DEFAULTS)'); }

// ---- C4: the Health
ok(['left', 'right', 'tail'].every(id=> R.partTotal(part(id)) === 200000) && R.partTotal(part('core')) === 500000, 'C4. the arms and tail 200,000 each, the Core 500,000');
ok(goliath.parts.reduce((t, p)=> t + R.partTotal(p), 0) === 1100000, 'C4. 1,100,000 in all');

// ---- B: the elders
{ const fresh = R.raidState(goliath, [], 0, {cycle: 0});
  // 2026-10-19 (package RB2, owner 16:28 "make the raid very slightly harder"): the ceiling 50 -> 55
  ok(goliath.bossHpBonusMax === 55 && R.bossHpBonus(goliath, fresh, 18).health === 55 && R.bossHpBonus(goliath, {total: 10, remaining: 5}, 18).health === 37 && R.bossHpBonus(goliath, {total: 10, remaining: 0}, 18).health === 18, 'B. the elders: basic + (55 - basic) x the raid\'s share (RB2: was 50)');
  ok(R.bossHpBonus(goliath, fresh, 55).health === 55 && R.bossHpBonus(goliath, fresh, 64).health === 64 && R.bossHpBonus(goliath, fresh, 64).bonus === 0, 'B. basic at or above 55: its basic'); }

// ---- C7: the weakening, one curve
{ ok(R.WEAKEN_FLOOR_DEFAULT === 0.6 && goliath.tuning.weakenFloor === 0.6, 'C7. the floor: 60%');
  ok(R.bossWeakening(goliath, 1) === 1 && Math.abs(R.bossWeakening(goliath, 0.5) - 0.8) < 1e-9 && Math.abs(R.bossWeakening(goliath, 0) - 0.6) < 1e-9, 'C7. 100% fresh, 80% at half, 60% at 0');
  ok(Math.abs(R.bossWeakening({tuning: {weakenFloor: 0.4}}, 0) - 0.4) < 1e-9 && R.weakenFloor({tuning: {weakenFloor: 5}}) === 1, 'C7. tuning.weakenFloor, kept to 0.1..1');
  ok(R.weakenShare({byId: {a: {remaining: 50, total: 100}}, remaining: 900, total: 1000}, 'a') === 0.5 && R.weakenShare({byId: {a: {remaining: 100, total: 100}}, remaining: 450, total: 1000}, 'a') === 0.45, 'C7. the share: the part\'s, or the raid\'s when lower (the Core)');
  const w = R.weakenCard({attack: 5, health: 10}, 0.6); ok(w.attack === 3 && w.health === 6 && R.weakenCard({attack: 1, health: 1}, 0.6).attack === 1 && R.weakenCard({attack: 0, health: 3}, 0.6).attack === 0, 'C7. weakenCard: Attack never below 1 if it had any, Health never below 1');
  const bf = B.grab('buildRaidFullFight');
  ok(/const weaken = RaidM\.bossWeakening \? RaidM\.bossWeakening\(def, partShare\) : 1, wk = d=> RaidM\.weakenCard/.test(bf) && (bf.match(/wk\(RaidM\.stageCard\(/g) || []).length === 3, 'C7. the fight build weakens the deck, the guards and the Commons, after the stage');
  const sim = require(path.join(ROOT, 'tools', 'raid_full_sim.js')), A = sim.A;
  const mk = share=>{ const atts = share < 1 ? ['left', 'right', 'tail'].map(id=> ({raidId: 'goliath', part: id, cycle: 0, owner: 'x', contribution: Math.round(200000 * (1 - share)), at: 0})) : [];
    const st = R.raidState(goliath, atts, 0, {cycle: 0}), f = R.fightFor(goliath, st, 'left', {});
    return A.buildRaidFullFight(goliath, 'left', f, st, {rng: A.seededRng(1), rand: A.seededRng(2), allies: [], myDeck: {}, recordEvents: false}); };
  const a = mk(1), z = mk(0.02), hp = b=> Object.keys(b.overlay).filter(id=> /~raid$/.test(id)).reduce((t, id)=> t + b.overlay[id].health, 0);
  ok(a.weaken === 1 && Math.abs(z.weaken - (0.6 + 0.4 * 0.02)) < 1e-9 && hp(z) < hp(a) * 0.75, `C7. a part nearly down fights at ${(z.weaken * 100).toFixed(0)}% (its cards' Health ${hp(a)} -> ${hp(z)})`); }

// ---- C5: instances of 250
ok(goliath.instanceCap === 250 && R.instanceCap({}) === 250 && R.INSTANCE_CAP_DEFAULT === 250, 'C5. 250 players an instance');
{ const m = Array.from({length: 250}, (_, i)=> ({owner: 'p' + i, instance: 1})); ok(R.assignInstance(m.slice(0, 249), 'x') === 1 && R.assignInstance(m, 'x') === 2, 'C5. assignInstance fills 250 before the next'); }
{ const sql = fs.readFileSync(path.join(ROOT, 'supabase', 'proposed', '20261019_raid_cap_250.sql'), 'utf8'), live = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261019_raid_ops.sql'), 'utf8');
  ok(/NOT APPLIED/.test(sql) && /v_cap   integer := 250;/.test(sql) && /create or replace function public\.join_raid_instance/.test(sql) && /v_cap   integer := 100;/.test(live), 'C5. the server change is a proposal (join_raid_instance default 250); the applied migration is untouched'); }

// ---- C9: the tiers, the quest, the medals, the pay
{ const pr = R.participationRules(goliath);
  ok(pr.damage === 500 && pr.strongDamage === 2000 && pr.leadDamage === 12500 && R.PARTICIPATION_DEFAULTS.damage === 500 && R.PARTICIPATION_DEFAULTS.leadDamage === 12500, 'C9. the tiers: 500 / 2,000 / 12,500 (were 1,000 / 10,000 / 50,000)');
  ok(/\{id:'w2-raiddmg', counter:'raidDamage', goal:4000, label:'Deal 4,000 Raid damage'\}/.test(src) && /counter:'raidDamage', label:'Raid damage dealt', icon:'🐲', steps:\[2000, 20000, 100000, 500000\]/.test(src), 'C9. the weekly quest (4,000) and the medals (2,000 .. 500,000)');
  ok(/const RAID_ATTEMPT_PAY = \{goldPer: 48, dustPer: 190\};/.test(src) && /contribution\/RAID_ATTEMPT_PAY\.goldPer/.test(src), 'C9. a fight pays about what it did'); }

// ---- saved edits on the old scale
{ const old = {id: 'goliath', scoring: {perInFightHp: 15, cap: 5000, overwhelmCap: 10000}, bossHpBonusMax: 100, instanceCap: 100, participation: {fights: 3, damage: 1000},
    parts: [{id: 'left', bars: 3, barHp: 80000, fight: {castleHp: 333}}, {id: 'core', bars: 8, barHp: 80000, scoring: {perInFightHp: 140}}], blurb: 'kept'};
  const m = R.migrateRaidScale(old, goliath);
  ok(m.scaleV === R.RAID_SCALE_V && m.scoring.perInFightHp === 1 && m.bossHpBonusMax === goliath.bossHpBonusMax /* RB2: scale 3, 55 */ && m.instanceCap === 250 && m.participation.damage === 500 && m.blurb === 'kept', 'a pre-RB edit of the Goliath takes the new scale and keeps the rest');
  ok(m.parts[0].barHp === 50000 && m.parts[0].bars === 4 && m.parts[0].fight.castleHp === 333 && !m.parts[1].scoring && R.partTotal(m.parts[1]) === 500000, '...its parts\' Health bars, its own fight kept, the Core\'s x140 gone');
  ok(R.migrateRaidScale(m, goliath) === m && R.migrateRaidScale(Object.assign({}, old, {scaleV: 2}), goliath).scoring.perInFightHp === 15, 'an edit saved on the new scale is left alone');
  const own = R.migrateRaidScale({id: 'x', parts: [{id: 'a', bars: 2, barHp: 100000}], scoring: {perInFightHp: 15}}, null);
  ok(own.scoring.perInFightHp === 1 && R.partTotal(own.parts[0]) === 160000, 'a raid made in the editor is scaled like the Goliath (200,000 -> 160,000)');
  ok(/const e = raidEditScaled\(e0, d\);/.test(src) && /base\.push\(raidEditScaled\(raidDefEdits\[id\], null\)\)/.test(src) && /draft\.scaleV = /.test(src), 'allRaidDefs brings edits onto the scale; the editor stamps scaleV'); }

// ---- C1 / C2: numbers and the formula
{ const lo = src.indexOf('const liveRaidParts = {};'), hi = src.indexOf('function renderRaidSubTab(body){');
  ok(lo > 0 && hi > lo && !/\.toLocaleString\(\)/.test(src.slice(lo, hi)), 'C1. every raid number in the raid code takes the game\'s language');
  ok(/function raidLocale\(\)\{/.test(src) && /function raidNum\(n\)\{ return Math\.round\(Number\(n\) \|\| 0\)\.toLocaleString\(raidLocale\(\)\); \}/.test(src), 'C1. raidLocale / raidNum');
  ok((1100000).toLocaleString('en') === '1,100,000' && (1100000).toLocaleString('de') === '1.100.000', 'C1. 1,100,000 / 1.100.000 (Intl)');
  ok(/TX\('results\.hp-left', \{raidRemainingAfter: raidNum\(m\.raidRemainingAfter\)/.test(src) && /n: raidNum\(m\.raidDamageDealt\)/.test(src) && /<b>\$\{raidNum\(st\.remaining\)\}<\/b> \/ \$\{raidNum\(st\.max\)\} HP/.test(src), 'C1. the results and the Online Raid\'s HP');
  ok(/locale: raidLocale\(\)/.test(src) && /toLocaleString\(opts\.locale \|\| undefined\)/.test(fxf), 'C1. the claim screen counts in the game\'s language');
  ok(/\$\{adminModeEnabled \? raidDamageCalcHTML\(m\) : ''/.test(src) && /TX\('results\.nv-raid-damage', \{n: raidNum/.test(src), 'C2. the breakdown line is for admins only; the headline stays');
  ok(!/scores up to <b>\$\{\(sc\.cap/.test(src) && /TX\('ui\.rb-fight-note', \{turns: RaidM\.fightRounds\(def\)\}\)/.test(src), 'C2. the raid tab no longer states the per-fight cap / rate'); }

// ---- A: the allies hold their rows (the seeded 200 plays: tests/raid-ally-rows-2026-10-19.js)
ok(/if\(c\.holdRow\) return;/.test(eng) && /placed\.holdRow = true;/.test(src), 'A. ally units hold their row');

// ---- the live rows, paged
ok(/const RAID_LIVE_PAGE = 1000, RAID_LIVE_MAX_ROWS = 20000;/.test(src) && /\.range\(from, from \+ RAID_LIVE_PAGE - 1\)/.test(B.grab('liveRefreshRaidParts')), 'the raid\'s rows are read a page at a time, your instance only');

// ---- the texts
{ const KEYS = ['ui.rb-rule-weaken', 'ui.rb-fight-note', 'ui.rb-ally-row-mid', 'ui.raid-rule-win'];
  KEYS.forEach(k=> ok(typeof texts.TEXT[k] === 'string' && src.includes(`'${k}'`) && !/×|[0-9]\.[0-9]/.test(texts.TEXT[k]), `${k}: in the table, used, no formula`));
  ok(/higher rank/.test(texts.TEXT['ui.raid-rule-win']), 'the win rule says a higher rank counts more');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    const miss = KEYS.filter(k=> !pack[texts.TEXT[k]]); ok(!miss.length, `lang/${c}.json has the RB texts (missing: ${miss.join(', ')})`); }); }

// ---- the docs
{ const doc = path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19.md'), j = path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19-fights.json');
  ok(fs.existsSync(doc) && /completed/i.test(fs.readFileSync(doc, 'utf8')) && /weaken/i.test(fs.readFileSync(doc, 'utf8')), 'docs/balance/raid-balance-2026-10-19.md: the completion tables and the curve');
  ok(fs.existsSync(j) && Object.keys(JSON.parse(fs.readFileSync(j, 'utf8')).cells).length === 72, 'the measured fights (72 cells)');
  ok(/^## 2026-10-19 \(package RB: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry'); }

console.log(`raid-rb-2026-10-19: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
