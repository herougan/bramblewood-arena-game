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

  // ======================================================================= 4. the card's first-map chip: its list's own map number
  { const f = fnSrc('cardFirstMapHTML');
    ok(/const n = f\.n;/.test(f) && !/cardObtainMap/.test(f), '4. the chip names its list\'s own map number (was cardObtainMap: Fumarole Ibex "Map 14 · Eye of the Volcano", a Map 20 side map)');
    const C = {TX: (k, o)=> k === 'ui.pg-map-n' ? 'Map ' + o.n : k, escapeHtml: s=> String(s), escapeAttr: s=> String(s), cardObtainMap: ()=> 14, cardOtherMapsHTML: ()=> '',
      cardMapListsOf: ()=> [{loc: 'me', kind: 'side', n: 20}], mpMapById: id=> ({id, name: 'Eye of the Volcano', icon: ''})};
    vm.runInNewContext(f + '\nthis.h = cardFirstMapHTML({id: "fumarole-ibex"});', C);
    ok(/Map 20 · Eye of the Volcano/.test(C.h) && !/Map 14/.test(C.h), '4. Fumarole Ibex reads "Map 20 · Eye of the Volcano (side)" (' + C.h.replace(/<[^>]+>/g, '').trim() + ')'); }

  // ======================================================================= 5. sign-in window: closes at once, loading circle, inert while working
  for(const outcome of ['ok', 'wrong']){
    const el = id=>{ const e = {id, hidden: false, inert: false, disabled: false, value: '', textContent: '', _h: {}, classList: {s: new Set(), toggle(c, on){ on ? this.s.add(c) : this.s.delete(c); }, contains(c){ return this.s.has(c); }},
      addEventListener(t, f){ this._h[t] = f; }, closest: ()=> null}; return e; };
    const overlay = el('authGateOverlay'), form = el('authGateAuthForm'); form.closest = sel=> sel === '#authGateOverlay' ? overlay : null;
    const els = {authGateOverlay: overlay, authGateAuthForm: form, authGateMsg: el('authGateMsg'), authGateEmailForm: el('authGateEmailForm'), authGateEmail: Object.assign(el('e'), {value: 'a@b.c'}), authGatePassword: Object.assign(el('p'), {value: 'pw123456'}), authGateCreateBtn: el('c'), splashScreen: Object.assign(el('splashScreen'), {hidden: false})};
    let release; const C = {document: {getElementById: id=> els[id] || null}, TX: k=> k, confirm: ()=> true, busy: 0, cloudAuthBusyAdd(d){ C.busy = Math.max(0, C.busy + d); }, showToast(){},
      authErrorText: ()=> 'Wrong email or password.', matchHistoryList: 1, cloudSignIn: ()=> new Promise((res, rej)=>{ release = ()=> outcome === 'ok' ? res({}) : rej(new Error('invalid login credentials')); }), done: null, Promise};
    vm.runInNewContext(fnSrc('wireAuthForm') + '\nwireAuthForm("authGate", m=>{ done = m; });', C);
    const p = els.authGateEmailForm._h.submit({preventDefault(){}});
    ok(overlay.hidden === true && form.inert === true && C.busy === 1, `5. ${outcome}: on submit the window closes at once, the loading circle runs (busy ${C.busy}) and the form is inert`);
    release(); await p;
    if(outcome === 'ok') ok(C.done === 'login' && C.busy === 0 && form.inert === false, '5. signed in: the caller takes over (the gate closes for good), nothing left busy');
    else ok(C.done === null && overlay.hidden === false && form.inert === false && C.busy === 0 && els.authGateMsg.textContent === 'Wrong email or password.' && els.authGateMsg.classList.contains('error'), '5. wrong password: the window comes back with the message');
  }
  ok(/callback: async resp=>\{ onStart && onStart\(\);/.test(fnSrc('gsiMountButton')) && /\(\)=> working\(true\)\)\.then/.test(fnSrc('wireAuthForm')), '5. Google\'s button: the window closes as soon as Google answers');

  // ======================================================================= 6. vault How it works: Dungeon Rules, then Multiplayer Rules; 7. no vault on More ways to play
  { const lob = fnSrc('gdLobbyHTML'), i = lob.indexOf("TX('ui.fp1-dungeon-rules')"), j = lob.indexOf("TX('ui.fp1-multiplayer-rules')"), k = lob.indexOf("TX('ui.coop2-how')"), c = lob.indexOf("TX('ui.dungeon1-carry')");
    ok(i > 0 && c > i && j > c && k > j && lob.indexOf('</details>', k) > k, '6. How it works: Dungeon Rules (carry, arrive, rows, deck, rewards), then Multiplayer Rules (rows per player)');
    const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
    ok(/"ui\.fp1-dungeon-rules": "Dungeon Rules"/.test(texts) && /"ui\.fp1-multiplayer-rules": "Multiplayer Rules"/.test(texts), '6. the two headings are TX keys');
    ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(cd=>{ const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', cd + '.json'), 'utf8'));
      ok(d['Dungeon Rules'] && d['Multiplayer Rules'] && !('Team up with friends in a dungeon' in d), '6/7. ' + cd + ' translates both headings; the vault tile\'s text is gone'); });
    const ai = src.indexOf('\nfunction renderArenaSubTabInner('), arena = src.slice(ai, src.indexOf('\nfunction ', ai + 10)); // its template strings defeat fnSrc's brace count
    ok(!/openCoopBtn|gdThemedName/.test(arena) && !/function arenaCoopOpen/.test(src) && /pl2ArenaTabsHTML\(\)/.test(arena), '7. The Tidelock Vault is off "More ways to play" (the Co-op tab still opens it)'); }

  // ======================================================================= 8. Map cards: blue tiles split into Suggest New! (on no earlier map) and Suggested (carried)
  { const grab = name=> fnSrc(name);
    const mc = ['ui19McSkillRows', 'ui19McEarlierSkillKeys', 'ui19McSkillText', 'ui19McSkillsHTML', 'ui28SugPillHTML', 'ui30SuggPillHTML', 'ui30SuggTilesHTML'].map(grab).join('\n');
    const defs = {a: {id: 'a', effects: {swarm: true, flying: true}}, c: {id: 'c', effects: {}}};
    const S = {swarm: {label: 'Swarm', desc: ()=> 's'}, flying: {label: 'Flying', desc: ()=> 'f'}, thorns: {label: 'Thorns', desc: ()=> 't'}, regen: {label: 'Regen', desc: ()=> 'r'}};
    const C = {ui18CardSkillKeys: d=> Object.keys(d.effects).map(k=> ({key: k, lvl: 0})), skillDefOf: k=> S[k], skillText: (p, v)=> p.desc(v), SKILL_ICON: {}, escapeHtml: s=> String(s), escapeAttr: s=> String(s),
      TX: (k, v)=> ({'ui.fp1-sug-new': 'Suggest New!', 'ui.ui28-suggested': 'Suggested'})[k] || k, mapNumberOf: id=> ({m0: 0, m1: 1})[id], mainConquestMaps: ()=> [{id: 'm0'}, {id: 'm1'}],
      mapPoolSections: id=> [{key: 'cards', ids: id === 'm0' ? ['a'] : []}],
      ui24McRecs: ()=> [{key: 'swarm', p: S.swarm, card: 'X', why: ''}, {key: 'thorns', p: S.thorns, card: 'Y', why: ''}], ui30McSugg: ()=> new Map([['flying', ''], ['regen', '']])};
    vm.createContext(C); vm.runInContext(mc + '\nthis.html = ui19McSkillsHTML("m1", ["c"], ' + JSON.stringify(defs) + ', ()=> true, "m1", []);', C);
    const tile = k=> (C.html.match(new RegExp('<li class="([^"]*)"[^>]*data-(?:ui24-rec|ui19-skill)="' + k + '"[\\s\\S]*?</li>')) || []);
    const t = k=> tile(k)[0] || '', cls = k=> tile(k)[1] || '';
    ok(/is-sug-new/.test(cls('thorns')) && /Suggest New!/.test(t('thorns')) && /is-sug-new/.test(cls('regen')) && /Suggest New!/.test(t('regen')), '8. a recommendation and an intro pick on no earlier map: red-edged tile, "Suggest New!" pill');
    ok(!/is-sug-new/.test(cls('swarm')) && />Suggested</.test(t('swarm')) && !/is-sug-new/.test(cls('flying')) && />Suggested</.test(t('flying')), '8. ones already met on an earlier map: plain blue "Suggested" (carried)');
    ok(/is-sugnew/.test(C.html) && /ui\.fp1-leg-sug-new/.test(C.html), '8. the legend names Suggest New!');
    ok(/is-claude-pick\$\{sugCls\(r\.key\)\}/.test(fnSrc('ui19McSkillsHTML')) && /sugPill\(TX\('ui\.ui34-pick-tip'[^)]*\), r\.key\)/.test(fnSrc('ui19McSkillsHTML')), '8. Claude\'s picks (ui34ClaudePicks) follow the same rule'); }

  console.log(fail ? `fixpack1: ${fail} of ${n} checks failed` : `fixpack1: all ${n} checks passed`);
  process.exit(fail ? 1 : 0);
})();
