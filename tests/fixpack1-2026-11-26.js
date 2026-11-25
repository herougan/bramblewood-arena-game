#!/usr/bin/env node
// 2026-11-26 (package FIXPACK1, owner 11-24 22:29 list #1, #7, #10, #12, #13, #15, #20 and 11-25 00:16):
//   1. the progress blob's merged lists (seen, discovered ...) never shrink on a push or a pull (the cloud's entries are read and folded in
//      first); the Codex filters, sort and toggles ride the blob; admins can turn the advancement grouping off (All together)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('no block ' + a); return src.slice(i, j); };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const sleep = ms=> new Promise(r=> setTimeout(r, ms));
const set = s=> new Set(JSON.parse(s || '[]'));

// ======================================================================= 1. Codex sync
// a player_progress table with PostgREST's "alias:data->>key" select; reads can be made to fail
function world(opts){
  const ls = fakeStorage(); Object.entries(opts.local || {}).forEach(([k, v])=> ls.setItem(k, v));
  const row = {data: Object.assign({}, opts.cloud || {}), updated_at: opts.cloudAt || new Date(Date.now() - 86400e3).toISOString()};
  const log = [];
  const from = ()=>{ const st = {}; const api = {
    select(c){ st.op = 'select'; st.cols = c; return api; }, eq(){ return api; },
    maybeSingle: async ()=>{ await sleep(5); log.push('select'); if(opts.failRead) return {data: null, error: {message: 'network down', code: ''}};
      if(!st.cols || st.cols === 'data, updated_at') return {data: JSON.parse(JSON.stringify(row)), error: null};
      const out = {}; st.cols.split(',').forEach(c=>{ const m = /^(\w+):data->>(\w+)$/.exec(c.trim()); if(m) out[m[1]] = row.data[m[2]] == null ? null : row.data[m[2]]; });
      return {data: out, error: null}; },
    upsert(r){ return {then: (res, rej)=> sleep(5).then(()=>{ log.push('upsert'); row.data = JSON.parse(JSON.stringify(r.data)); row.updated_at = r.updated_at; return {error: null}; }).then(res, rej)}; } }; return api; };
  const ctx = {console: {log(){}, warn(){}, error(){}}, localStorage: ls, Date, JSON, Math, Promise, Object, Array, Set, Number, String, Map,
    sbClient: {from}, LiveData: {available: true, progressPushedHash: null}, cloudUserId: 'u1', SEEN_KEY: 'bramblewood_arena_seen', DISCOVERED_KEY: 'bramblewood_arena_discovered',
    UI_FILTERS_KEY: 'bramblewood_ui_filters_v1', CODEX_LEVEL_KEY: 'bramblewood_codex_level_v1', myDiscoveredCardIds: new Set(), mySeenCardIds: null,
    cardStatsTrim: r=> r, hashStr: s=>{ let h = 0; for(let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; },
    liveCanWrite: ()=> true, cloudSyncSettled: ()=> true, liveTableMissing: e=> !!(e && e.code === '42P01'), migrateStoredNodeValue: (k, v)=> v,
    reloadCardSockets(){}, invalidateCardDefs(){}, codexReloadSticky(){ ctx._reloaded = true; }, renderHome(){}, renderPlay(){}, matchState: null, currentTab: 'home', ui12ProgressRepullAt: 0};
  vm.runInNewContext(between('const PROGRESS_KEYS = [', 'const PROGRESS_LOCAL_AT_KEY').replace(/^const /gm, 'var ') + `\nvar PROGRESS_LOCAL_AT_KEY = 'bramblewood_progress_local_at';\n`
    + ['progressSnapshot', 'snapshotHash', 'progressShrinkOk'].map(fnSrc).join('\n') + '\n' + between('// SAVE_GUARD_UI12:BEGIN', '// SAVE_GUARD_UI12:END') + `\nvar PROGRESS_SHRINK_OK_KEY = 'bw_progress_shrink_ok';\n`
    + fnSrc('livePullProgress') + '\n' + fnSrc('livePushProgress') + '\nthis.$ = {progressUnionCloud, livePullProgress, livePushProgress, PROGRESS_KEYS};', ctx);
  return {ctx, ls, row, log, $: ctx.$};
}
const cq = n=> JSON.stringify({completed: Array.from({length: n}, (_, i)=> 'm1:0-' + i)});
(async ()=>{
  // the helper: union both ways, "ahead" only when this device holds entries the cloud lacks
  { const w = world({local: {bramblewood_arena_seen: '["a","b","x"]'}});
    ok(w.$.progressUnionCloud({bramblewood_arena_seen: '["a","b","c"]'}) === true && [...'abxc'].every(id=> set(w.ls.getItem('bramblewood_arena_seen')).has(id)), '1. union: the cloud\'s c joins; x is ahead of the cloud');
    ok(w.$.progressUnionCloud({bramblewood_arena_seen: w.ls.getItem('bramblewood_arena_seen')}) === false, '1. union: nothing ahead when the cloud holds the same list');
    ok(w.ctx.mySeenCardIds === null, '1. union: the seen set is read back from storage'); }
  // a push after another device added c: the cloud keeps c, and this device gains it
  { const w = world({local: {bramblewood_conquest_progress_v1: cq(3), bramblewood_arena_seen: '["a","b","x"]'}, cloud: {bramblewood_conquest_progress_v1: cq(3), bramblewood_arena_seen: '["a","b","c"]', bramblewood_arena_discovered: '["h1"]'}});
    w.$.livePushProgress(true); await sleep(60);
    ok(w.log.join() === 'select,upsert', '1. push: reads the merged keys, then writes (' + w.log.join() + ')');
    ok([...'abcx'].every(id=> set(w.row.data.bramblewood_arena_seen).has(id)) && set(w.row.data.bramblewood_arena_discovered).has('h1'), '1. push: the cloud keeps another device\'s seen and discovered cards');
    ok(set(w.ls.getItem('bramblewood_arena_seen')).has('c') && w.ctx.myDiscoveredCardIds.has('h1'), '1. push: this device gains them'); }
  // a failed read writes nothing
  { const w = world({failRead: true, local: {bramblewood_arena_seen: '["x"]'}, cloud: {bramblewood_arena_seen: '["c"]'}});
    w.$.livePushProgress(true); await sleep(40);
    ok(!w.log.includes('upsert') && w.row.data.bramblewood_arena_seen === '["c"]' && w.ctx.LiveData.progressPushedHash === null, '1. push: a failed read sends nothing and retries later'); }
  // sign-in pull, "push" branch (this device has more progress): the cloud's seen cards are kept
  { const w = world({local: {bramblewood_conquest_progress_v1: cq(5), bramblewood_arena_seen: '["x"]'}, cloud: {bramblewood_conquest_progress_v1: cq(2), bramblewood_arena_seen: '["c"]'}});
    await w.$.livePullProgress(); await sleep(60);
    ok(['c', 'x'].every(id=> set(w.row.data.bramblewood_arena_seen).has(id)) && JSON.parse(w.row.data.bramblewood_conquest_progress_v1).completed.length === 5, '1. pull (push branch): the richer device goes up with the union'); }
  // sign-in pull, "pull" branch: local entries the cloud lacks are not marked as sent, so the next tick sends them
  { const w = world({local: {bramblewood_conquest_progress_v1: cq(2), bramblewood_arena_seen: '["x"]'}, cloud: {bramblewood_conquest_progress_v1: cq(5), bramblewood_arena_seen: '["c"]'}});
    await w.$.livePullProgress();
    ok(['c', 'x'].every(id=> set(w.ls.getItem('bramblewood_arena_seen')).has(id)) && w.ctx._reloaded, '1. pull: the union lands here and the Codex state is read back');
    ok(w.ctx.LiveData.progressPushedHash === null, '1. pull: the device\'s extra entries are not marked as sent');
    w.$.livePushProgress(false); await sleep(60);
    ok(['c', 'x'].every(id=> set(w.row.data.bramblewood_arena_seen).has(id)), '1. pull: the next push sends them'); }
  { const w = world({});
    ok(['bramblewood_ui_filters_v1', 'bramblewood_codex_separate', 'bramblewood_codex_flat_v1', 'bramblewood_codex_level_v1', 'bramblewood_arena_seen'].every(k=> w.$.PROGRESS_KEYS.includes(k)), '1. the Codex filters, sort, toggles and seen list ride the progress blob'); }
  ok(/function codexReloadSticky\(\)\{ try\{ const o = uiSticky\('codex'\)/.test(src), '1. a pulled save\'s Codex filters are read back');
  // the grouping toggle: admins too, grouped by default; All together = one list in the chosen sort
  { const G = {localStorage: fakeStorage(), adminModeEnabled: true}; vm.runInNewContext(fnSrc('codexSeparateStored') + fnSrc('codexGrouped') + '\nvar codexSeparate = codexSeparateStored(); this.g = ()=> codexGrouped(); this.set = v=>{ codexSeparate = v; };', G);
    ok(G.g() === true, '1. admin: grouped by advancement by default'); G.set(false); ok(G.g() === false, '1. admin: All together turns the grouping off');
    G.adminModeEnabled = false; G.set(null); ok(G.g() === false, '1. player: All together by default (unchanged)'); }
  ok(/\$\{codexSeparateAllowed\(\) \? `<button type="button" class="btn small \$\{codexGrouped\(\)/.test(src), '1. the Separated / All together button shows for admins too');
  ok(/const view = !\(codexGrouped\(\) && codexSeparateAllowed\(\)\) \? 'all' : adminModeEnabled \? \(codexFilter\.groupBy \|\| 'advance'\) : 'bands';/.test(src), '1. All together draws one list in the chosen sort');

  // ======================================================================= 2. Achievements: Claim all (Map 15), every card shown
  { const f = src.slice(src.indexOf('function achievementsPanelHTML'), src.indexOf('function wireAchievementsPanel'));
    ok(/const ACHV_CLAIM_ALL_MAP = 15;/.test(src) && /const claimAllOpen = adminModeEnabled \|\| playerMapReach\(\) >= ACHV_CLAIM_ALL_MAP;/.test(f), '2. Claim all opens on Map 15 (admins always)');
    ok(/id="achvClaimAll" \$\{claimAllOpen && ready \? '' : 'disabled'\}/.test(f) && /TX\('ui\.pg-map-n', \{n: ACHV_CLAIM_ALL_MAP\}\)/.test(f), '2. locked or nothing ready: disabled; locked names Map 15');
    ok((f.match(/achvClaimAll/g) || []).length === 1 && !/Claim all \$\{ready\}/.test(f), '2. one Claim all button (the header copy is gone)');
    const spots = src.slice(src.indexOf('const FEATURE_SPOTS = ['), src.indexOf('\n];', src.indexOf('const FEATURE_SPOTS = [')));
    ok(!/mapNumber:15\b/.test(spots), '2. Map 15 is quiet: no other feature opens there');
    const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
    ok(/"ui\.ui36-card-rewards": "Claim all"/.test(texts) && !/ui\.ui36-n-ready|ui\.ui36-none/.test(texts + src), '2. the label is "Claim all"; the filter\'s texts are gone');
    ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); ok(d['Claim all'] && d['Claim all'] !== 'Claim all' && !('Card Rewards' in d), '2. ' + c + ' translates Claim all'); });
    // a tap skips the won-card reveal: the still window then shows every card; a reveal played to the end shows nothing more
    for(const full of [false, true]){
      const C = {getCardDefs: ()=> ({a: {}, b: {}, c: {}}), fxAtLeast: ()=> true, reducedMotion: ()=> false, hasGsap: ()=> true, still: null, showToast(){}, TX: k=> k, Promise, Set,
        playRewardReveal: ()=> Promise.resolve(full)};
      vm.runInNewContext('const ui27AchvCardsPending = ["a", "b", "c"];\nfunction ui27StillCardsReveal(ids){ still = ids; return Promise.resolve(); }\n' + fnSrc('ui27RevealAchvCards') + '\nthis.go = ui27RevealAchvCards;', C);
      const nGot = await C.go();
      ok(nGot === 3 && (full ? C.still === null : (C.still || []).join() === 'a,b,c'), `2. multi-card claim, reveal ${full ? 'played out: no extra window' : 'skipped: all 3 cards shown together'}`);
    }
    ok(/setTimeout\(\(\)=> resolve\(natural === true\), 120\)/.test(fnSrc('playRewardReveal')) && /resolve\(true\); gsap\.to\(stage/.test(fnSrc('playRewardReveal')), '2. playRewardReveal tells a skip from a full play'); }

  // ======================================================================= 3. Conquest: back where you were, on any device, after a loss too
  { const w = world({}); ok(w.$.PROGRESS_KEYS.includes('bramblewood_last_map_v1'), '3. the last map and fight ride the progress blob'); }
  ok(/if\(c13Test\) matchState\.adminTest = true;[^\n]*\n  else \{ conquestSelectedMap = mapId; conquestSelectedNodeKey = nodeKey; rememberLastMap\(mapId, nodeKey\); \}/.test(fnSrc('startConquestMatch')), '3. a conquest fight, however it was started, selects and records its fight (the pawn stands there after a loss)');
  { const R = {localStorage: fakeStorage(), CONQUEST_MAPS: [{id: 'm1'}, {id: 'mf'}, {id: 'mb'}], isMapUnlocked: m=> m.id !== 'mb', loadConquestProgress: ()=> ({}), dungeonHiddenFromPlayer: ()=> false, healMapProgress: ()=> ({id: 'mf'}), JSON};
    vm.runInNewContext(`const LAST_MAP_KEY = 'bramblewood_last_map_v1'; var mapResumeTried = false, conquestSelectedMap = 'm1', conquestSelectedNodeKey = null;\n${fnSrc('loadLastMap')}\n${fnSrc('resumeLastMap')}\nthis.go = ()=> [resumeLastMap(), conquestSelectedMap];`, R);
    const r = R.go(); ok(r[0] === true && r[1] === 'mf', '3. no record: the furthest open map (healMapProgress), not Map 0'); }

  console.log(fail ? `fixpack1: ${fail} of ${n} checks failed` : `fixpack1: all ${n} checks passed`);
  process.exit(fail ? 1 : 0);
})();
