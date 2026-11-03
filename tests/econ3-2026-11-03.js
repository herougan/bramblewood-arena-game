#!/usr/bin/env node
// Package ECON3 (2026-11-03, owner 20:34: "ECON2-6 OK. ECON2-10 OK, ECON2-5 OK, ... ECON2-2 OK, ECON2-1 OK - not so critical atm. It can stay
// in the current map but just be unlocked later on. When clicking swap (quest) - the paper falls away, revealing the 'previous quest'
// underneath. (It's just a new roll)"; 21:10: "ECON2-3: a", "ECON2-8: a"):
//   1. ECON2-1  Murgle Mayhem is open to players, still on Sable Swampmire behind 6-8, from Map 11 (Map 10 cleared); its pay unchanged
//   2. ECON2-2  the weekly board says "each" after a quest's reward
//   3. ECON2-5  a skirmish won again pays 4 Leaves and 1 Dust a point of Energy (after the half); overrides and other kinds keep theirs
//   4. ECON2-6  errands pay x2.5 and are offered after 15% of wins
//   5. ECON2-3  every weekly tier holds only quests its feature allows: tiers 1-2 from Map 4, PvP and raids in tier 3
//   6. ECON2-8  Iron Shard on a repeat win 5%; the Forge's tier steps take Metal
//   7. ECON2-10 the title panel folds to a chip after the first look; the node moves (code and the proposed layout SQL)
//   8. the quest swap: the board is drawn with the new roll, the old paper's copy falls over it
//   9. texts in 12 packs; decisions marked DONE
// Browser: tests/e2e/econ3_2026_11_03.py (the maps measured, the chip at 1366 / 390, the swap mid-fall).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k)}; };

// ---------- 1. Murgle Mayhem ----------
ok(/^const MURGLE_RELEASED = true, MURGLE_OPENS_AFTER_MAP = 'm7';/m.test(src), '1. Murgle Mayhem is released and opens after Map 10 (m7) is cleared');
ok(/id:'mm', code:'MM', mapNumber:6, parent:'m8', preview: !MURGLE_RELEASED && DAILY_DUNGEONS_HIDDEN, entry:\{x:88, y:16, after:'6-8', afterMapCleared: MURGLE_OPENS_AFTER_MAP,/.test(src), '1. it stays on Sable Swampmire (m8) behind 6-8, gated on the map');
ok(/^const DAILY_DUNGEONS_HIDDEN = true;/m.test(src) && /id:'muc'[^\n]*preview: DAILY_DUNGEONS_HIDDEN/.test(src) && /id:'mlb'[^\n]*\|\| DAILY_DUNGEONS_HIDDEN/.test(src), '1. the Undercroft and the Long Burrow stay hidden');
ok(/const DAILY_DUNGEON_PAY = \{mm: \{dust: 69, gold: 46\}, muc: \{blossoms: 63\}\};/.test(src), '1. its pay is unchanged (69 Dust, 46 Leaves a won floor)');
{ const iu = fnSrc('isMapUnlocked'); ok(/map\.entry && map\.entry\.afterMapCleared && !conquestMapCleared\(map\.entry\.afterMapCleared\)\) return false/.test(iu), '1. isMapUnlocked honours afterMapCleared');
  ok(/afterMapCleared/.test(fnSrc('mapLockReason')), '1. its lock names the map to clear'); }

// ---------- 2. "each" on the weekly board ----------
{ const q = fnSrc('questsModalHTML');
  ok(/kind === 'weekly' \? `<span class="qn-rw-each" title="\$\{escapeAttr\(TX\('ui\.econ3-each-tip'\)\)\}">\$\{escapeHtml\(TX\('ui\.econ3-each'\)\)\}<\/span>`/.test(q), '2. a weekly note says "each" after its reward');
  ok(/claimed\.push\(id\); saveQuestState\(q\);\s*Object\.entries\(tier\.reward\)\.forEach/.test(fnSrc('claimQuest')), '2. the pay stays per quest');
  ok(/\.qn-rw-each\{/.test(tpl), '2. its style'); }

// ---------- 3. the repeat pay by Energy ----------
{ const E = (()=>{ const c = {Math, Object, Number, Array}; vm.createContext(c); vm.runInContext(between('// ECON1_INCOME:BEGIN', '// ECON1_INCOME:END') + '\nthis.E = {econScale};', c); return c.E; })();
  const mk = cost=>{ const c = {CONQUEST_NODE_REWARDS: null, baseKind: k=> ({miniboss:'elite'})[k] || k, econScale: E.econScale, nodeEnergyCost: cost, Math, Number, Object};
    vm.createContext(c); vm.runInContext(between('const CONQUEST_NODE_REWARDS = {', '};') + '\n' + fnSrc('nodeRewardTier') + '\n' + between('const DAILY_DUNGEON_PAY = ', ';') + '\n' + fnSrc('dailyDungeonPay') + '\nthis.R = nodeRewardTier;', c); return c.R; };
  let seen = null; const R9 = mk((m, n)=>{ seen = m; return 9; }), R1 = mk(()=> 1), R0 = mk(()=> 0);
  const s9 = R9({kind:'skirmish', key:'20-4'}, {id:'m11'}), s1 = R1({kind:'skirmish'});
  ok(s9.repeat.gold === 36 && s9.repeat.dust === 9 && s9.repeatEnergy === 9 && seen && seen.id === 'm11', `3. a 9-Energy skirmish pays 36 Leaves and 9 Dust again (${s9.repeat.gold} / ${s9.repeat.dust}), the map passed through`);
  ok(s1.repeat.gold === 4 && s1.repeat.dust === 1, `3. Map 0's 1-Energy skirmish: 4 Leaves (as before) and 1 Dust (${s1.repeat.gold} / ${s1.repeat.dust})`);
  ok(R0({kind:'skirmish'}).repeat.gold === 4, '3. a cost read as 0 counts as 1');
  ok(s9.first.gold === 40 && s9.first.dust === 20, '3. the first clear is unchanged');
  const ov = R9({kind:'skirmish', rewards:{repeat:{gold: 30}}}); ok(ov.repeat.gold === 15 && ov.repeat.dust === 0 && !ov.repeatEnergy, '3. an admin\'s repeat override still wins (halved)');
  const el = R9({kind:'elite'}); ok(el.repeat.gold === E.econScale('conquestRepeat', 'gold', 14) && !el.repeatEnergy, '3. elites keep their table');
  ok(R9({kind:'skirmish', tower:true}).repeat.gold === 0, '3. a Spire floor still pays 0 again');
  ok(R9({kind:'skirmish', dungeonId:'mm'}).dungeonPay, '3. a Murgle floor keeps its dungeon pay');
  ok(/nodeRewardTier\(node, map\), first = firstTime\.has\(k\)/.test(src) && /const tier = nodeRewardTier\(node, map\), dg = isDailyDungeonMap\(map\)/.test(src), '3. Clear map and the Sweep pass the map'); }

// ---------- 4. errands ----------
ok(/ERRAND_OFFER_CHANCE = 0\.15, ERRAND_PAY_MULT = 2\.5;/.test(src), '4. errands: offered after 15% of wins, pay x2.5');
{ const c = {econScale: (s, k, v)=> Math.round(v * 0.5), MATERIA_UNIT: {dust: 675, gold: 450}, Math}; c.MU = f=> Math.round(f * c.MATERIA_UNIT.dust);
  vm.createContext(c); vm.runInContext('const ERRAND_PAY_MULT = 2.5;\n' + fnSrc('errandReward') + '\nthis.F = errandReward;', c);
  const lo = c.F({mu: 0.04}), hi = c.F({mu: 0.08});
  ok(lo.dust >= 33 && lo.dust <= 36 && hi.dust >= 66 && hi.dust <= 69, `4. errand Dust ${lo.dust}-${hi.dust} (about one notice; was 14-27)`); }

// ---------- 5. weekly tiers by feature ----------
{ const blk = between('const QUEST_TIERS = {', '\n};'); const c = {TX}; vm.createContext(c); const QT = vm.runInContext(blk.replace('const QUEST_TIERS =', '(') .replace(/\n\};$/, '\n})'), c);
  const ids = QT.weekly.map(t=> t.quests.map(q=> q.id));
  ok(JSON.stringify(ids) === JSON.stringify([['w1-energy', 'w3-conquest', 'w1-units'], ['w2-wins'], ['w1-pvp', 'w3-pvp', 'w2-raid', 'w2-raiddmg']]), `5. tiers: ${JSON.stringify(ids)}`);
  const lateCounters = new Set(['pvpTickets', 'pvpWins', 'raidsJoined', 'raidDamage']);
  ok(QT.weekly.slice(0, 2).every(t=> t.quests.every(q=> !lateCounters.has(q.counter))), '5. tiers 1-2: nothing needs the Arena or a Raid');
  ok(QT.weekly[0].reward.gold === 340 && QT.weekly[1].reward.gold === 225 && QT.weekly[2].reward.gold === 110, '5. the tiers\' pay is unchanged'); }

// ---------- 6. Iron Shards and Metal ----------
ok(/else \{ if\(Math\.random\(\) < 0\.05 \/\*[^*]*\*\/\) add\('iron-shard', 1\);/.test(fnSrc('rollMateriaDrops')), '6. a repeat win drops an Iron Shard 5% of the time (was 15%)');
ok(/^const FORGE_TIER_METAL = \{2: 5, 3: 10, 4: 15, 5: 20\};/m.test(src) && /o\.metal = FORGE_TIER_METAL\[t\.tier\] \|\| 0;/.test(src), '6. the Forge tier steps take 5 / 10 / 15 / 20 Metal');
ok(/\(myCurrencies\.metal\|\|0\) < \(next\.metal\|\|0\)\) return \{ok:false, why:'cost', next\}/.test(fnSrc('canUpgradeForge')), '6. not enough Metal: the upgrade waits');
ok(/myCurrencies\.metal = Math\.max\(0, \(myCurrencies\.metal\|\|0\) - \(c\.next\.metal\|\|0\)\)/.test(fnSrc('upgradeForge')), '6. the upgrade spends it');
ok(/next\.metal \? \{metal: next\.metal\} : \{\}/.test(fnSrc('forgeUpgradeHTML')) && /part\(CURRENCY_META\.metal\.glyph, cost\.metal/.test(fnSrc('btnCostHTML')), '6. the button shows its price');

// ---------- 7. the title chip and the moves ----------
{ const blk = between('const MAP_HEAD_SEEN_KEY', "\ndocument.addEventListener('click', e=>{");
  const c = {localStorage: fakeStorage(), JSON, Array, TX, escapeAttr: s=> String(s), isDailyDungeonMap: ()=> false, dungeonTicketLineHTML: ()=> ''};
  vm.createContext(c); vm.runInContext(blk.replace(/\ndocument\.addEventListener\('click', e=>\{$/, '') + '\nthis.F = {mapHeadlineHTML, mapHeadFolded};', c);
  const A = {id:'mc', icon:'🪶', name:'Gannet Cliffs', blurb:'Cliffs.'}, B = {id:'mw', icon:'🐊', name:'Gatorback Swamp', blurb:'Swamp.'};
  const h1 = c.F.mapHeadlineHTML(A), h1b = c.F.mapHeadlineHTML(A);
  ok(!/is-chip/.test(h1) && !/is-chip/.test(h1b) && /<h3>🪶 Gannet Cliffs<\/h3><p class="panel-sub">Cliffs\.<\/p>/.test(h1), '7. the first look: the whole panel, through re-renders');
  c.F.mapHeadlineHTML(B); const h2 = c.F.mapHeadlineHTML(A);
  ok(/conquest-headline is-chip /.test(h2) && /class="cqh-chip" aria-expanded="false"/.test(h2) && /<p class="panel-sub">Cliffs\.<\/p>/.test(h2), '7. the next visit: a chip (blurb kept, folded by CSS)');
  ok(/\.conquest-headline\.is-chip > \.panel-sub\{display:none;/.test(tpl) && /\.conquest-headline\.is-chip\.is-open > \.panel-sub\{display:block;\}/.test(tpl) && /\.cqh-chip\{pointer-events:auto;/.test(tpl), '7. CSS: folded, opened, and the chip takes the tap');
  ok(/if\(b\.classList\.contains\('is-chip'\)\) return;/.test(src), '7. the chip does not fade away under the pointer');
  ok(/\$\{mapHeadlineHTML\(map\)/.test(src), '7. the map draws its headline through mapHeadlineHTML'); }
ok(/key:"20-B-2"[^\n]*fixedPos:\{x:36, y:62\}/.test(src) && /key:"20-B-3"[^\n]*fixedPos:\{x:64, y:30\}/.test(src), '7. the Volcano Lair: 20-B-2 / 20-B-3 apart');
ok(/key:"1-A-1"[^\n]*fixedPos:\{x:10, y:44\}/.test(src), '7. Clovermead: 1-A-1 out from under the panel');
ok(/\{map:'m4', near:'8-6', dx:-13, dy:-25/.test(src) && /\{map:'mr', after:'13-4', before:'13-5', entrance:'ghost', offset:0/.test(src), '7. 8-H and 13-J off their neighbours');
ok(/\{key:'anvil', map:'m9', icon:'⚒️', name:'The old anvil', x:20, y:56/.test(src) && /\{key:'mapcodex'[^\n]*pos:\{x:6, y:74\}/.test(src) && /\{key:'arena'[^\n]*pos:\{x:17, y:72\}/.test(src), '7. the anvil, the Map Codex and the Arena off the fights');
{ const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase', 'proposed', '20261103_econ3_map_layout.json'), 'utf8')), sql = fs.readFileSync(path.join(ROOT, 'supabase', 'proposed', '20261103_econ3_map_layout.sql'), 'utf8');
  const LIVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'econ3-live-map-layout-2026-11-03.json'), 'utf8')).positions;
  ok(J.moves.length === 4, '7. four moves wait on the live layout rows');
  J.moves.forEach(mv=>{ const row = (LIVE[mv.map] || {})[mv.rowKey];
    ok(row && row.x === mv.from.x && row.y === mv.from.y, `7. ${mv.map} ${mv.key}: the row holds it at ${mv.from.x} / ${mv.from.y} under ${mv.rowKey}`);
    ok(sql.includes(`'{positions,${mv.rowKey}}'`) && sql.includes(`'{"x": ${mv.to.x}, "y": ${mv.to.y}}'`) && sql.includes(`'__cfg:map-layout:${mv.map}'`), `7. the SQL moves ${mv.map} ${mv.rowKey} to ${mv.to.x} / ${mv.to.y}`); });
  ok(/^begin;$/m.test(sql) && /^commit;$/m.test(sql) && !/delete from/i.test(sql), '7. one transaction, nothing deleted'); }

// ---------- 8. the quest swap ----------
{ const o = fnSrc('openQuestsModal');
  ok(/const old = b\.closest\('\.qn-note'\), ghost = questNoteGhost\(old\);\s*if\(!swapDailyNotice\(b\.dataset\.swapId\)\)\{ if\(ghost\) ghost\.remove\(\); return; \}\s*openQuestsModal\(\); if\(ghost\) questNoteFall\(ghost\);/.test(o), '8. copy the old paper, roll, redraw the board, then let the copy fall');
  ok(!/fxHook\('noticeSwap'/.test(o), '8. the blank-paper flip is gone');
  ok(/reducedMotion\(\)/.test(fnSrc('questNoteGhost')) && /cloneNode\(true\)/.test(fnSrc('questNoteGhost')), '8. a copy of the note, none with reduced motion');
  ok(/opacity:0, offset:1/.test(fnSrc('questNoteFall')) && /g\.remove\(\)/.test(fnSrc('questNoteFall')), '8. it falls, fades and is removed'); }

// ---------- 9. texts and decisions ----------
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const keys = Object.keys(TEXT).filter(k=> /^ui\.econ3-/.test(k));
ok(keys.length === 5, `9. five ECON3 keys (${keys.length})`);
for(const k of keys){ ok(src.includes(`'${k}'`), `9. ${k} is used`);
  for(const c of CODES){ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); ok(pack[TEXT[k]], `9. ${c} translates "${TEXT[k]}"`); } }
{ const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8')).items, by = id=> D.find(x=> x.id === id) || {};
  ['ECON2-1', 'ECON2-2', 'ECON2-3', 'ECON2-5', 'ECON2-6', 'ECON2-8', 'ECON2-10'].forEach(id=> ok(by(id).status === 'DONE', `9. ${id} is DONE`));
  ['ECON2-4', 'ECON2-7', 'ECON2-9', 'ECON2-11', 'ECON2-12'].forEach(id=> ok(!/ECON3/.test(by(id).answer || ''), `9. ${id} is not answered by ECON3`)); }

console.log(fail ? `econ3-2026-11-03: ${fail} of ${n} checks failed` : `econ3-2026-11-03: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
