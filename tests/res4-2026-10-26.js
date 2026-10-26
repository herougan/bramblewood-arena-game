#!/usr/bin/env node
// 2026-10-26 (package RES4): the Trail Mix Trek (PROP1-2, the monthly pass, built as proposed in docs/proposals-2026-10-26.md section 2), the
// level track thinned to a pack every fifth level, the Forge tabs spread over Maps 11-34 (RES3-3) and the first group dungeon's aqua name
// (RES3-4). The functions are cut out of arena_app.js and run on small stand-ins; tests/e2e/res4_2026_10_26.py drives the real page at 390 and 1366.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', src.indexOf(')', a)), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
function constSrc(name){ const a = src.indexOf('\nconst ' + name + ' = '); if(a < 0) return ''; let i = src.indexOf('= ', a) + 2, d = 0;
  for(; i < src.length; i++){ const c = src[i]; if(c === '[' || c === '{') d++; else if(c === ']' || c === '}'){ d--; if(!d) break; } }
  return src.slice(a + 1, i + 1) + ';'; }

// ---------------- the level track (PROP1-2's level change) ----------------
{ const ctx = {}; vm.createContext(ctx); vm.runInContext(constSrc('RES3_LEVEL_TRACK') + '\n' + fnSrc('res3LevelRewardsAt') + '\nthis.f = res3LevelRewardsAt;', ctx);
  const row = L=> ctx.f(L).join('+');
  ok([1, 2, 3, 4].every(L=> row(L) === 'card') && row(5) === 'card+faction', 'levels: single cards to Level 5, the first (faction) pack at 5');
  const packs = []; for(let L = 1; L <= 25; L++) if(/packT|faction|pack1|pack2/.test(row(L))) packs.push(L);
  ok(JSON.stringify(packs) === '[5,10,15,20,25]', 'levels: a pack only at 5, 10, 15, 20 and 25 (' + packs + ')');
  ok(row(10) === 'packT' && row(20) === 'packT' && row(15) === 'faction' && row(25) === 'faction', 'levels: your pack tier at 10 and 20, a faction pack at 15 and 25');
  ok([6, 7, 8, 9, 11, 14, 16, 19, 21, 24].every(L=> row(L) === 'leaves'), 'levels: 100 Maple Leaves + 50 Dust on the other levels');
  ok(row(30) === 'packT' && row(35) === 'faction' && row(31) === 'leaves', 'levels: past 25 the same five-level rhythm');
  ok(/const RES4_LEVEL_LEAVES = \{gold:100, dust:50\};/.test(src) && /if\(k === 'leaves'\)\{ Object\.entries\(RES4_LEVEL_LEAVES\)\.forEach\(\(\[c, v\]\)=> grantCurrency\(c, v\)\)/.test(fnSrc('res3GrantLevelReward')), 'levels: "leaves" pays 100 + 50, never held for the Armoury'); }

// ---------------- the Trail Mix Trek: numbers ----------------
{ const ctx = {}; vm.createContext(ctx);
  vm.runInContext(['TRAIL_TIER_COST', 'TRAIL_NOTICE_PTS', 'TRAIL_DAY_TIERS', 'TRAIL_WEEK_TIER_PTS', 'TRAIL_CHALLENGES', 'TRAIL_FREE', 'TRAIL_PREMIUM'].map(k=> {
    if(k === 'TRAIL_TIER_COST'){ const m = /const TRAIL_TIER_COST = [^\n]+/.exec(src); return m[0].replace(/^const /, 'var '); } return constSrc(k).replace(/^const /, 'var '); }).join('\n')
    + '\n' + fnSrc('res4TrailTier') + '\n' + fnSrc('res4TrailChestsReached') + '\n' + fnSrc('res4MonthKey') + '\n' + fnSrc('res4TrailDaysLeft')
    + '\nthis.X = {TRAIL_TIER_COST, TRAIL_TIERS, TRAIL_CHEST_EVERY, TRAIL_CHEST_MAX, TRAIL_CH_POINTS, TRAIL_CH_PER_WEEK, TRAIL_FIRST_WIN, TRAIL_NOTICE_PTS, TRAIL_DAY_TIERS, TRAIL_WEEK_TIER_PTS, TRAIL_CHALLENGES, TRAIL_FREE, TRAIL_PREMIUM, res4TrailTier, res4TrailChestsReached, res4MonthKey, res4TrailDaysLeft};', ctx);
  const X = ctx.X;
  ok(X.TRAIL_TIERS === 30 && X.TRAIL_TIER_COST === 150 && X.TRAIL_FREE.length === 30 && X.TRAIL_PREMIUM.length === 30, '30 tiers at 150 Stickers, a free and a premium cell each');
  ok(JSON.stringify(X.TRAIL_NOTICE_PTS) === JSON.stringify({D:10, C:10, B:10, A:20, S:40, SS:60, SSS:100}), 'notices: D-B 10, A 20, S 40, SS 60, SSS 100');
  ok(X.TRAIL_DAY_TIERS.map(t=> t.pts).join() === '20,10,10' && X.TRAIL_WEEK_TIER_PTS.join() === '100,60,40' && X.TRAIL_FIRST_WIN === 10, 'daily tiers 20/10/10, weekly tiers 100/60/40, first win 10');
  ok(X.TRAIL_CH_PER_WEEK === 3 && X.TRAIL_CH_POINTS === 50, 'three Trail challenges a week, 50 each');
  ok(X.TRAIL_CHEST_EVERY === 600 && X.TRAIL_CHEST_MAX === 3 && X.res4TrailChestsReached(4500 + 1799) === 2 && X.res4TrailChestsReached(99999) === 3 && X.res4TrailChestsReached(4499) === 0, 'past tier 30: a Trail Chest every 600, 3 a month');
  ok(X.res4TrailTier(0) === 0 && X.res4TrailTier(149) === 0 && X.res4TrailTier(150) === 1 && X.res4TrailTier(1000) === 6 && X.res4TrailTier(1e6) === 30, 'a tier every 150 Stickers, capped at 30');
  const sum = k=> X.TRAIL_FREE.reduce((t, r)=> t + (r[k] || 0), 0);
  ok(sum('pack') === 3 && sum('faction') === 2 && sum('chest') === 1, 'free lane: 6 packs (3 of your tier, 2 faction, a Tidemire Chest)');
  ok(sum('capsule') === 2 && sum('ticket') === 1 && sum('kit') === 4 && sum('title') === 1 && sum('kibble') === 40 && sum('metal') === 4, 'free lane: 2 capsules, a Raid Ticket, 4 kit items, Kibble, Metal and the title');
  ok(sum('gold') === 880 && sum('dust') === 900, 'free lane: about 900 Maple Leaves and 900 Dust (' + sum('gold') + ' / ' + sum('dust') + ')');
  ok([5, 15, 25].every(t=> X.TRAIL_FREE[t - 1].pack) && [10, 20].every(t=> X.TRAIL_FREE[t - 1].faction) && X.TRAIL_FREE[29].chest && X.TRAIL_FREE[18].ticket && X.TRAIL_FREE[8].capsule && X.TRAIL_FREE[27].capsule, 'the proposal\'s table: packs at 5 / 15 / 25, faction 10 / 20, the chest and title at 30, ticket 19, capsules 9 / 28');
  const ids = X.TRAIL_CHALLENGES.map(c=> c.counter);
  ok(['unitsDefeated', 'conquestWins', 'energyConquest', 'wins', 'raidsJoined', 'pvpWins'].every(c=> ids.includes(c)), 'challenges: the existing counters');
  ok(['challengeClears', 'bossWins', 'forgeLevels', 'decksWon'].every(c=> ids.includes(c)), 'challenges: the four new counters');
  ok(X.TRAIL_CHALLENGES.find(c=> c.counter === 'raidsJoined').needs === 'raid' && X.TRAIL_CHALLENGES.find(c=> c.counter === 'pvpWins').needs === 'arena' && X.TRAIL_CHALLENGES.find(c=> c.counter === 'forgeLevels').needs === 'forge', 'challenges: raids, PvP and the Forge only once opened');
  ok(X.res4MonthKey(new Date(2026, 9, 26)) === '2026-10' && X.res4TrailDaysLeft(new Date(2026, 9, 31, 12)) === 1 && X.res4TrailDaysLeft(new Date(2026, 9, 1, 0, 0, 1)) === 31, 'the month: resets on the 1st, days left counted to local midnight'); }

// ---------------- the Trail: the draw, the reset, the hooks ----------------
{ const f = fnSrc('res4TrailDrawChallenges');
  const ctx = {featureUnlockedSafe: k=> k !== 'raid', seededRng: s=>{ let x = s >>> 0; return ()=>{ x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }, hashStr: s=>{ let h = 0; for(const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }};
  vm.createContext(ctx); vm.runInContext(constSrc('TRAIL_CHALLENGES') + '\nconst TRAIL_CH_PER_WEEK = 3;\n' + f + '\nthis.d = res4TrailDrawChallenges;', ctx);
  const a = ctx.d('W2026-10-26'), b = ctx.d('W2026-10-26'), c = ctx.d('W2026-11-02');
  ok(a.length === 3 && new Set(a).size === 3 && JSON.stringify(a) === JSON.stringify(b), 'three different challenges, the same for a week');
  let raid = false; for(let w = 1; w < 60; w++){ if(ctx.d('W' + w).includes('raids')) raid = true; } ok(!raid, 'a feature not opened is never drawn');
  let differ = 0; for(let w = 1; w < 20; w++){ if(JSON.stringify(ctx.d('W' + w)) !== JSON.stringify(a)) differ++; } ok(differ > 10, 'other weeks draw other challenges'); void c; }
{ const st = fnSrc('res4TrailState');
  ok(/if\(st\.month !== month\)\{ const old = st; st = res4TrailFresh\(month, old\); res4TrailSave\(st\); res4TrailPayLeftovers\(old, st\);/.test(st), 'a new month: the new road is saved first, then last month\'s reached tiers are paid');
  ok(/for\(let t = 1; t <= reached; t\+\+\) if\(!got\.has\(t\)\)\{ res4TrailGrantTier/.test(fnSrc('res4TrailPayLeftovers')) && /res4TrailGrantPack\('bonus'\)/.test(fnSrc('res4TrailPayLeftovers')), '...every unclaimed tier and Trail Chest');
  ok(/pts:0/.test(fnSrc('res4TrailFresh')) && /titles:\(old && old\.titles\) \|\| \[\]/.test(fnSrc('res4TrailFresh')), 'Stickers don\'t carry over; titles do');
  ok(/if\(!armouryOpen\(\)\)\{ holdPackForArmoury\(\{kind:'res4trail', id: kind\}\); return; \}/.test(fnSrc('res4TrailGrantPack')) && /ref\.kind === 'res4trail'\) res4TrailGrantPack\(ref\.id\)/.test(fnSrc('releaseHeldPacks')), 'a trail pack before the Armoury waits with the held packs');
  ok(/res4TrailOnNotice\(x\.rank, q\.claimedDaily\.length\)/.test(fnSrc('claimQuest')) && /res4TrailOnWeeklyTier\(tierIdx\)/.test(fnSrc('claimQuest')), 'claimQuest feeds notices, the day\'s notice tiers and weekly tiers');
  ok(/res4TrailOnCounter\(counter, q\)/.test(fnSrc('bumpQuestCounter')) && /counter === 'wins' && st\.winDay !== st\.day/.test(fnSrc('res4TrailOnCounter')), 'bumpQuestCounter feeds the first win of the day and the challenges');
  ok(/if\(nd && nd\.challenge\) bumpQuestCounter\('challengeClears', 1\);/.test(src) && /if\(bk === 'elite' \|\| bk === 'boss' \|\| bk === 'finalboss'\) bumpQuestCounter\('bossWins', 1\);/.test(src) && /res4TrailNoteDeckWin\(activeDeckId\)/.test(src), 'new counters at the win: challengeClears, bossWins, decksWon');
  ok(/forgeSetCopyLevel\(id, uid, L\+1\);[^\n]*\n  try\{ bumpQuestCounter\('forgeLevels', 1\); \}/.test(src), 'new counter in the Forge: forgeLevels');
  ok(/if\(st\.decks\.includes\(deckId\)\) return;/.test(fnSrc('res4TrailNoteDeckWin')), 'decksWon counts a deck once a week'); }

// ---------------- the page: reachable, no price ----------------
{ const page = fnSrc('renderTrailPage'), block = src.slice(src.indexOf('// ==== Package RES4 (2026-10-26), PROP1-2'), src.indexOf('\nfunction profileHeroHTML('));
  ok(/<div id="view-trail" hidden><\/div>/.test(tpl) && /if\(tab==='trail'\) safeRender\('Trail', renderTrailPage\);/.test(src), 'its own page (view-trail)');
  ok(/\$\{res4TrailHomeNoteHTML\(\)/.test(fnSrc('renderHome')) && /id="trailNavBtnPlay"/.test(src) && /switchTab\('trail'\)/.test(src), 'reachable from Home (a note) and the map (the corner cluster)');
  ok(/class="tr-road"/.test(page) && /id="trVan"/.test(page) && /res4TrailStopHTML\(i \+ 1/.test(page) && /\.tr-van\{position:absolute;[^}]*left:calc\(var\(--k\)/.test(tpl), 'a horizontal road of tiers with the camper van on it');
  ok(/class="tr-ch-list"/.test(page) && /res4TrailDaysLeft\(\)/.test(page), 'this week\'s challenges with progress, and days left');
  ok(!/\$\s*\d|USD|€|\bprice\b|4\.99/i.test(block.replace(/\/\/[^\n]*/g, '')), 'the premium lane is locked with no price');
  ok(/\.tr-road-wrap\{overflow-x:auto;/.test(tpl) && /--trail-van:#[0-9a-f]{6}/.test(tpl.slice(0, tpl.indexOf('@media (prefers-color-scheme: dark)'))) && (tpl.match(/--trail-van:#/g) || []).length === 3, 'the road scrolls on its own; its colours are tokens in all three theme blocks'); }

// ---------------- RES3-3 and RES3-4 ----------------
{ const m = vm.runInNewContext('(' + /const RES3_FORGE_TAB_MAP = (\{[^}]+\})/.exec(src)[1] + ')');
  const maps = Object.values(m);
  ok(Math.min(...maps) === 11 && Math.max(...maps) <= 40 && new Set(maps).size === maps.length, 'Forge tabs: spread over Maps 11-40, one tab a map (' + JSON.stringify(m) + ')');
  ok(m.upgrade === 11 && m.facility === 13 && m.enchant >= 30, 'Forge tabs: Upgrade with the Forge (11), Upgrades with the Iron Forge (13), Socket after Unique cards reach the road (30)');
  ok(texts.TEXT['ui.res4-gd-hollow'] === 'The Tidelock Vault' && /const GD_THEMED_NAME = \{hollow: 'ui\.res4-gd-hollow'\};/.test(src), 'the first group dungeon: The Tidelock Vault'); }

// ---------------- texts in 12 packs ----------------
{ const keys = Object.keys(texts.TEXT).filter(k=> /\.res4-/.test(k));
  ok(keys.length >= 50, 'texts: ' + keys.length + ' RES4 keys');
  ok(keys.every(k=> new RegExp("'" + k.replace(/[.-]/g, m=> '\\' + m) + "'").test(src)), 'texts: every RES4 key is used');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    const miss = keys.map(k=> texts.TEXT[k]).filter(en=> !(en in pack)); ok(!miss.length, `texts: ${code} has every RES4 text ${miss.slice(0, 3)}`); }); }

console.log(`res4: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
