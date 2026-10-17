#!/usr/bin/env node
// 2026-10-18 (WP4, progression gates and dead code): static checks that
//   1. mapIsCharted(n) is true only for a main map that exists, isn't Reserved and has fights;
//   2. every player-facing lock that names a map number for a gate (nests, Forge tiers, level gates, limit breaks, dungeon slots,
//      Strange Materia) goes through mapIsCharted / mapLockText, so a gate on an uncharted map reads "Unlocks beyond the charted maps";
//   3. the gates that sit on uncharted maps today really do show that text (nests 6 and 7, Forge tiers 4 and 5, Lv 9 / 10, limit
//      breaks, dungeon slot 3), and the Long Burrow's slot says "Coming soon" behind a one-line switch;
//   4. grantMap20FactionCrown and the dead element lookups removed with it are gone.
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`function ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const constLine = name=>{ const m = src.match(new RegExp(`^const ${name} = [^\\n]*$`, 'm')); return m ? m[0] : ''; };
const block = (start, end)=>{ const a = src.indexOf(start), b = src.indexOf(end, a); return a >= 0 && b > a ? src.slice(a, b + end.length) : ''; };

// --- the maps (the same slices tests/node-ids-2026-10-14.js evaluates)
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
const H = new Function('CONQUEST_MAPS', [fn('mainConquestMaps'), constLine('UNCHARTED_LOCK'), fn('mapIsCharted'), fn('mapLockText')].join('\n') +
  '\nreturn {mainConquestMaps, mapIsCharted, mapLockText, UNCHARTED_LOCK};')(CONQUEST_MAPS);
const main = H.mainConquestMaps();
ok(H.UNCHARTED_LOCK === 'Unlocks beyond the charted maps', `the uncharted lock text (${H.UNCHARTED_LOCK})`);
main.forEach((m, n)=> ok(H.mapIsCharted(n) === (!m.reserved && m.nodes.length > 0), `Map ${n} (${m.id}) charted = ${H.mapIsCharted(n)}`));
ok(H.mapIsCharted(0) && H.mapIsCharted(22) && H.mapIsCharted(24), 'Maps 0, 22 (the Rimefire Caldera) and 24 are charted');
[25, 26, 27, 30, 31, 40, 50, -1].forEach(n=> ok(!H.mapIsCharted(n), `Map ${n} is not charted`));
ok(H.mapLockText(3, 'Map 3') === 'Map 3' && H.mapLockText(30, 'Map 30') === H.UNCHARTED_LOCK, 'mapLockText swaps only an uncharted map');
const charted = n=> H.mapIsCharted(n);

// --- 2. every map-number lock goes through the helper
const GATE_EXPRS = ['next.map', 'u.map', 'nx.map', 'levelGateNeed(L+1)', 'lb.need', 'dd.mapNumber'];
src.split('\n').forEach((l, i)=>{
  if(/^\s*\/\//.test(l)) return;
  const hits = [...l.matchAll(/Map \$\{([^}]*)\}/g)].map(m=> m[1].trim()).filter(e=> GATE_EXPRS.includes(e));
  hits.forEach(e=>{
    // the World/Dungeons card's "Map 22 · The Rimefire Caldera" heading only shows for a dungeon that exists
    if(e === 'dd.mapNumber' && /dg-where/.test(l)) return;
    ok(/mapIsCharted\(|mapLockText\(/.test(l) || /mapIsCharted\(/.test(src.split('\n')[i - 1] || ''), `line ${i + 1}: the lock "Map \${${e}}" goes through mapIsCharted / mapLockText`);
  });
});

// --- 3. the gates on uncharted maps
const NEST_UNLOCKS = new Function(block('const NEST_UNLOCKS = [', '\n];') + '\nreturn NEST_UNLOCKS;')();
const nestOff = NEST_UNLOCKS.filter(u=> !charted(u.map)).map(u=> u.map);
ok(nestOff.includes(25) && nestOff.includes(30), `nests on uncharted maps: ${nestOff.join(', ')}`);
const nestHTML = fn('nestKeeperHTML');
ok(/if\(!mapIsCharted\(u\.map\)\) return `[^\n]*\$\{UNCHARTED_LOCK\}/.test(nestHTML), 'an unbuilt nest on an uncharted map shows the uncharted lock, no map number');
ok(/mapIsCharted\(nx\.map\) \? ` The next one opens on Map \$\{nx\.map\}\.` : ` The next one \$\{UNCHARTED_LOCK\.toLowerCase\(\)\}\.`/.test(nestHTML), 'the nest count line too');

const FORGE_TIERS = new Function(block('const FORGE_TIERS = [', '\n];') + '\nreturn FORGE_TIERS;')();
ok(FORGE_TIERS.filter(t=> t.map && !charted(t.map)).length >= 2, 'Forge tiers 4 and 5 wait on uncharted maps (26, 31)');
ok(/mapLockText\(next\.map, `Opens at Map \$\{next\.map\}`\)/.test(fn('forgeUpgradeHTML')), 'the Forge upgrade gate uses mapLockText');
const levelGateMap = new Function(fn('levelGateMap') + '\nreturn levelGateMap;')();
ok(!charted(levelGateMap(9)) && !charted(levelGateMap(10)) && !charted(levelGateMap(11)) && charted(levelGateMap(5)), 'Lv 9, 10 and the limit break wait on uncharted maps; Lv 5 on a charted one');
ok(/mapIsCharted\(levelGateNeed\(L\+1\)\) \? `Level \$\{L\+1\} opens once you reach Map/.test(src), 'the level gate note goes through mapIsCharted');
ok(/mapIsCharted\(lb\.need\) \? `Limit breaks open once you reach Map/.test(src), 'the limit-break note goes through mapIsCharted');

const STRANGE_MATERIA_DROPS = new Function(constLine('STRANGE_MATERIA_DROPS') + '\nreturn STRANGE_MATERIA_DROPS;')();
const smText = new Function('STRANGE_MATERIA_DROPS', 'mapIsCharted', fn('strangeMateriaSourceText') + '\nreturn strangeMateriaSourceText();')(STRANGE_MATERIA_DROPS, charted);
ok(/Maps 12 and 15/.test(smText) && !/\b25\b|\b30\b/.test(smText) && /beyond the charted maps/.test(smText), `Strange Materia tooltip names only charted maps (${smText})`);

const DAILY_DUNGEONS = new Function(block('const DAILY_DUNGEONS = [', '\n];') + '\nreturn DAILY_DUNGEONS;')();
const slot3 = DAILY_DUNGEONS.find(d=> d.slot === 3);
ok(slot3 && !slot3.mapId && !charted(slot3.mapNumber), 'dungeon slot 3 has no dungeon and an uncharted map');
const dgHTML = fn('renderDungeonsSubTab');
ok(/\$\{map \? '🚧 Coming soon\.[^']*' : mapIsCharted\(dd\.mapNumber\) \? `🔒 Opens around Map \$\{dd\.mapNumber\}` : `🧭 \$\{UNCHARTED_LOCK\}`\}/.test(dgHTML), 'a held-back dungeon reads "Coming soon", an uncharted slot the uncharted lock');
ok(!/Map 22 is not charted/.test(src), 'no text still calls Map 22 uncharted');
ok(!/Map 22 is still a Reserved map/.test(src), 'the Long Burrow comment no longer calls Map 22 Reserved');
ok(/^const LONG_BURROW_RELEASED = false;$/m.test(src), 'the Long Burrow release is one switch (LONG_BURROW_RELEASED), still off');
const mlb = CONQUEST_MAPS.find(m=> m.id === 'mlb');
ok(mlb && mlb.preview === true && mlb.parent === 'm22' && charted(main.indexOf(CONQUEST_MAPS.find(m=> m.id === 'm22'))), 'the Long Burrow is a preview on the charted Map 22');
ok(/preview:!LONG_BURROW_RELEASED/.test(src), 'the switch drives the Long Burrow\'s preview flag');

// the Flea Market sits on Map 31: nothing shows a lock for it
const market = src.match(/\{key:'market'[^\n]*mapNumber:(\d+)/);
ok(market && !charted(+market[1]), 'the Flea Market is on an uncharted map');
ok(!/Flea Market[^\n]{0,80}Map \$\{|Map \$\{[^}]*market/.test(src), 'no lock names the Flea Market\'s map');

// --- 4. dead code
ok(!/grantMap20FactionCrown\s*\(/.test(src.replace(/\/\/[^\n]*/g, '')) && !/map20Crown/.test(src), 'grantMap20FactionCrown is gone');
['cloudSyncPill', 'homeProfileBtn', 'leaderSlotWrap', 'terrainPill', 'startAsyncBtn', 'cnpSweepBtn', 'cnpSweepN', 'cnpIdleSweep', 'cnpAdminClearMap',
 'homeContinueTutorialBtn', 'deckToCodexBtn', 'deckHeroBtn', 'dropLeft', 'dropRight'].forEach(id=>{
  ok(!new RegExp(`getElementById\\('${id}'\\)|querySelector(All)?\\('#${id}\\b|\\['${id}'`).test(src), `no lookup of the never-drawn #${id}`);
});
['homeProfileBtnInner', 'leaderSlotHTML', 'wireLeaderSlot', 'continueTutorialFromHome'].forEach(f=> ok(!fn(f), `${f}() is gone`));
// kept on purpose: built dynamically, so not dead
ok(/id="admin\$\{r\.key\[0\]\.toUpperCase\(\) \+ r\.key\.slice\(1\)\}Chk"/.test(src) && /getElementById\('adminTideEvadeChk'\)/.test(src), 'adminTideEvadeChk is drawn by testRulesPanelHTML and still wired');

console.log(`gates-2026-10-18: ${checks} checks, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
