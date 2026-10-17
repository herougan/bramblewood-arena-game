#!/usr/bin/env node
// 2026-10-18 (package C, Steam achievements): static checks that
//   1. every id in arena_app.js's STEAM_ACHIEVEMENTS is unique, passes electron/steam.js's own id check (ACH_ID) and is
//      unlocked somewhere (a steamUnlock('<id>') outside the list itself);
//   2. every steamUnlock('<id>') names a listed id, and the list is in docs/platform-roadmap-2026-10-17.md (Steamworks set-up);
//   3. the maps and the Spire the ids name exist (Maps 5 / 10 / 20 charted, the Babel Spire has 50 floors);
//   4. steamUnlock does nothing without window.bwDesktop, calls unlock once per id, saves what Steam took and skips it next time,
//      and swallows a throwing or rejecting unlock.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const steamSrc = fs.readFileSync(path.join(ROOT, 'electron', 'steam.js'), 'utf8');
const preload = fs.readFileSync(path.join(ROOT, 'electron', 'preload.js'), 'utf8');
const roadmap = fs.readFileSync(path.join(ROOT, 'docs', 'platform-roadmap-2026-10-17.md'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// --- the list and steam.js's check
const a = src.indexOf('var STEAM_ACHIEVEMENTS = ['), b = src.indexOf('\n];', a);
ok(a > 0 && b > a, 'arena_app.js defines var STEAM_ACHIEVEMENTS = [...]');
const listSrc = src.slice(a, b + 3);
const LIST = new Function(listSrc + '\nreturn STEAM_ACHIEVEMENTS;')();
const ids = LIST.map(x=> x.id);
ok(ids.length >= 13, `at least 13 achievements (${ids.length})`);
ok(new Set(ids).size === ids.length, 'ids are unique');
const m = steamSrc.match(/const ACH_ID = (\/.+\/);/);
ok(!!m, 'electron/steam.js has its ACH_ID check');
const ACH_ID = m ? new Function('return ' + m[1])() : /^$/;
ok(/unlock\(id\)\{[^\n]*ACH_ID\.test/.test(steamSrc), 'steam.js unlock() runs the ACH_ID check');
ok(/unlock:\s*id\s*=>\s*call\('steam:unlock'/.test(preload), 'preload.js exposes bwDesktop.steam.unlock(id)');
LIST.forEach(x=> ok(x.name && x.desc, `${x.id} has a name and a description`));

// --- every id is unlocked somewhere, every call names a listed id
const rest = src.slice(0, a) + src.slice(b + 3);
const calls = [...rest.matchAll(/steamUnlock\('([^']*)'\)/g)].map(c=> c[1]);
ids.forEach(id=>{
  ok(ACH_ID.test(id), `${id} passes steam.js's id check`);
  ok(calls.includes(id), `${id} is unlocked somewhere (steamUnlock('${id}'))`);
  ok(roadmap.includes('`' + id + '`'), `${id} is listed in docs/platform-roadmap-2026-10-17.md`);
});
calls.forEach(id=> ok(ids.includes(id), `steamUnlock('${id}') names a listed id`));
ok(!/steamUnlock\((?!'|id\))/.test(rest.replace(/function steamUnlock\(id\)/, '')), 'every steamUnlock call passes a literal id');
ok(/window\.bwDesktop/.test(src.slice(src.indexOf('function steamUnlock('), src.indexOf('function steamCheckProgress('))), 'steamUnlock checks window.bwDesktop first');
// the places that call it
[['bumpQuestCounter', /steamCheckProgress\(\)/], ['completeConquestNode', /steamCheckProgress\(\)/], ['claimScaleTrailFinale', /steamUnlock\('SCALE_TRAIL_COMPLETE'\)/],
 ['openPackAnimation', /steamUnlock\('FIRST_LEGENDARY'\)/]].forEach(([fn, re])=>{
  const i = src.indexOf(`function ${fn}(`), j = src.indexOf('\nfunction ', i + 10);
  ok(i > 0 && re.test(src.slice(i, j)), `${fn} calls ${re.source.replace(/\\/g, '')}`);
});
ok(/ev\.type==='hatch'[^\n]*egg-red-dragon[^\n]*steamUnlock\('RED_DRAGON_HATCHED'\)/.test(src), 'the round\'s hatch events unlock RED_DRAGON_HATCHED');

// --- the maps and the Spire exist
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const fnSrc = name=>{ const i = src.indexOf(`function ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
try{
  const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
  const H = new Function('CONQUEST_MAPS', [fnSrc('mainConquestMaps'), fnSrc('mapIsCharted')].join('\n') + '\nreturn {mainConquestMaps, mapIsCharted};')(CONQUEST_MAPS);
  [5, 10, 20].forEach(n=> ok(H.mapIsCharted(n), `Map ${n} is charted (MAP_${n}_CLEARED can be earned)`));
  const tw = CONQUEST_MAPS.find(x=> x.id === 'tw');
  ok(tw && tw.nodes.length >= 50, `the Babel Spire has 50 floors (${tw ? tw.nodes.length : 'none'})`);
}catch(e){ ok(false, 'could not evaluate the maps: ' + e.message); }

// --- steamUnlock's behaviour
const helperSrc = src.slice(a, src.indexOf('function steamCheckProgress('));
const run = async ()=>{
  const store = {}; const localStorage = {getItem:k=> (k in store ? store[k] : null), setItem:(k, v)=>{ store[k] = String(v); }};
  const make = win=> new Function('window', 'localStorage', helperSrc + '\nreturn {steamUnlock, STEAM_ACH_KEY};')(win, localStorage);
  const off = make({}); off.steamUnlock('FIRST_WIN'); ok(Object.keys(store).length === 0, 'no bwDesktop: nothing saved, nothing thrown');
  const sent = []; let answer = true;
  const H1 = make({bwDesktop:{steam:{unlock:id=>{ sent.push(id); return Promise.resolve(answer); }}}});
  H1.steamUnlock('FIRST_WIN'); H1.steamUnlock('FIRST_WIN'); H1.steamUnlock('NOT_AN_ACHIEVEMENT');
  await new Promise(r=> setTimeout(r, 10));
  ok(sent.join() === 'FIRST_WIN', `one call per id, unknown ids skipped (${sent.join()})`);
  ok(JSON.parse(store[H1.STEAM_ACH_KEY] || '[]').includes('FIRST_WIN'), 'an id Steam took is saved');
  const H2 = make({bwDesktop:{steam:{unlock:id=>{ sent.push(id); return Promise.resolve(answer); }}}}); // a new session
  H2.steamUnlock('FIRST_WIN'); answer = false; H2.steamUnlock('WINS_100');
  await new Promise(r=> setTimeout(r, 10));
  ok(sent.join() === 'FIRST_WIN,WINS_100', `a saved id is not sent again (${sent.join()})`);
  ok(!JSON.parse(store[H2.STEAM_ACH_KEY]).includes('WINS_100'), 'an id Steam refused (Steam off) is not saved');
  const H3 = make({bwDesktop:{steam:{unlock:()=>{ throw new Error('boom'); }}}}); H3.steamUnlock('WINS_100');
  const H4 = make({bwDesktop:{steam:{unlock:()=> Promise.reject(new Error('boom'))}}}); H4.steamUnlock('WINS_100');
  await new Promise(r=> setTimeout(r, 10));
  ok(true, 'a throwing / rejecting unlock is swallowed');
};
run().then(()=>{
  console.log(`steam-ach: ${checks - fail}/${checks} checks passed`);
  process.exit(fail ? 1 : 0);
}).catch(e=>{ console.log('  ✗', e); process.exit(1); });
