#!/usr/bin/env node
// 2026-10-31 (package UI12, GG2, owner: signed out, signed in again with Google in an incognito tab: progress back to the tutorial, asked for a
// name again; the old progress was overwritten). The app's real sign-in / cloud load / save code (applySessionIdentity, cloudPullState,
// livePullProgress, livePushProgress, cloudPush*, fix3AfterSignIn, gsiHandleCredential) runs against a fake Supabase with network delays:
//   1. SAVE_GUARD_UI12: progressScore / progressPullDecision / progressPushAllowed
//   2. UI10's Google button on a fresh device (no local save): the onDone sync and the 20 s tick fire at once; the richer cloud save is
//      loaded, nothing lower is ever written, the account's name comes back (no name prompt)
//   3. the redirect path with a stale "local is newer" stamp: the richer cloud blob still wins
//   4. a failed profiles read / progress read: nothing is written (it used to seed the cloud from the fresh save), a retry is scheduled
//   5. a brand-new account seeds the cloud; normal play pushes; a later emptier blob is refused; an admin reset may shrink once
//   6. front screens: the lock function, the guards in the entrance and the TX key; the proposed SQL is filed
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('no block ' + a); return src.slice(i, j + b.length); };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const sleep = ms=> new Promise(r=> setTimeout(r, ms));

// ---------------------------------------------------------------- 1. the pure guard
const guard = between('// SAVE_GUARD_UI12:BEGIN', '// SAVE_GUARD_UI12:END');
const G = {}; vm.runInNewContext(guard + '\nthis.progressScore = progressScore; this.progressPullDecision = progressPullDecision; this.progressPushAllowed = progressPushAllowed;', G);
const RICH = {'bramblewood_conquest_progress_v1': JSON.stringify({completed: ['mtut:tutorial', 'mtut:tutorial2', 'm1:0-1', 'm1:0-2', 'm1:0-3', 'mf:1-1', 'mf:1-2'], ranks: {}}),
  'bramblewood_arena_tutorial_done': '1', 'bramblewood_tutorial2_done_v1': '1', 'bramblewood_arena_tutorial_stage': '2', 'bramblewood_player_xp_v1': JSON.stringify({xp: 2400, milestones: []})};
const FRESH = {'bramblewood_arena_tutorial_stage': '1'};
const TUT1 = {'bramblewood_conquest_progress_v1': JSON.stringify({completed: ['mtut:tutorial'], ranks: {}}), 'bramblewood_arena_tutorial_stage': '2'};
ok(G.progressScore(FRESH) === 0, 'a fresh save scores 0');
ok(G.progressScore(RICH) === 70 + 10 + 1 + 48, `the rich save scores cleared fights, flags, stage and XP (${G.progressScore(RICH)})`);
ok(G.progressScore(TUT1) > 0 && G.progressScore(TUT1) < G.progressScore(RICH), 'one tutorial fight scores between');
ok(G.progressScore({'bramblewood_conquest_progress_v1': '{bad json'}) === 0, 'a broken blob scores 0, no throw');
ok(G.progressScore({'bramblewood_conquest_progress_v1': JSON.stringify({completed: ['a', 'a', 'a']})}) === 10, 'duplicate ids count once');
ok(G.progressPullDecision({hasRow: true, cloudScore: 129, localScore: 0, cloudAt: 1, localAt: Date.now()}) === 'pull', 'richer cloud wins even when the local stamp is newer (the old bug)');
ok(G.progressPullDecision({hasRow: true, cloudScore: 10, localScore: 30, cloudAt: Date.now(), localAt: 1}) === 'push', 'richer local is sent even when the cloud stamp is newer');
ok(G.progressPullDecision({hasRow: true, cloudScore: 10, localScore: 10, cloudAt: 5, localAt: 1}) === 'pull' && G.progressPullDecision({hasRow: true, cloudScore: 10, localScore: 10, cloudAt: 1, localAt: 5}) === 'push', 'equal progress: the newer stamp wins');
ok(G.progressPullDecision({hasRow: false, cloudScore: 0, localScore: 0}) === 'push', 'no cloud row: push');
ok(G.progressPullDecision({hasRow: true, cloudScore: 129, localScore: 0, shrinkOk: true}) === 'push', 'an admin reset is sent');
ok(!G.progressPushAllowed(0, 129, false) && G.progressPushAllowed(129, 129, false) && G.progressPushAllowed(130, 129, false) && G.progressPushAllowed(0, 129, true), 'push allowed only when not emptier (or an admin reset)');

// ---------------------------------------------------------------- the app's sync code against a fake cloud
const FNS = ['isSignedIn', 'cloudSyncSettled', 'cloudPendingNow', 'cloudAuthBusyAdd', 'cloudPendingChanged', 'ui12ScheduleCloudRetry', 'applySessionIdentity', 'applySessionIdentityInner',
  'cloudPullState', 'cloudShardsColumnMissing', 'cloudBlossomsColumnMissing', 'cloudPushCurrencies', 'cloudPushCardLevels', 'cloudCopiesColumnMissing', 'cloudPushDecks', 'cloudPushRating',
  'liveCanWrite', 'liveTableMissing', 'progressSnapshot', 'snapshotHash', 'progressShrinkOk', 'livePullProgress', 'livePushProgress', 'fix3AfterSignIn', 'gsiHandleCredential',
  'fix3SignupPending', 'fix3SetSignupPending', 'hasChosenName', 'markNameChosen'];
function makeWorld(opts){
  opts = opts || {};
  const ls = fakeStorage(); Object.entries(opts.local || {}).forEach(([k, v])=> ls.setItem(k, v));
  const uid = 'u-owner';
  const db = { profiles: opts.noProfile ? {} : {[uid]: {id: uid, rating: 1100, display_name: opts.name || 'Bramble Owner'}},
    player_currencies: opts.noProfile ? {} : {[uid]: {profile_id: uid, gold: 5000, gems: 40, dust: 300, metal: 12, raid_points: 3}},
    player_card_unlocks: opts.noProfile ? [] : [{profile_id: uid, card_id: 'otter-scout', level: 4}, {profile_id: uid, card_id: 'river-warden', level: 2}],
    player_progress: opts.noProfile ? {} : {[uid]: {profile_id: uid, data: Object.assign({}, opts.cloudBlob || RICH), updated_at: new Date(Date.now() - 2 * 86400e3).toISOString()}} };
  const log = []; // every read and write, in order
  const failRead = opts.failRead || {};
  const delay = t=> sleep(opts.delays && opts.delays[t] != null ? opts.delays[t] : 25);
  const q = table=>{ const st = {table, filters: {}};
    const api = {
      select(){ st.op = 'select'; return api; }, eq(k, v){ st.filters[k] = v; return api; },
      maybeSingle(){ return run(); }, then(res, rej){ return run().then(res, rej); },
      upsert(row){ st.op = 'upsert'; st.row = row; return {then: (res, rej)=> run().then(res, rej)}; },
      update(row){ st.op = 'update'; st.row = row; return api; },
    };
    async function run(){
      await delay(st.op === 'select' ? 'read' : 'write');
      log.push({op: st.op, table, row: st.row && JSON.parse(JSON.stringify(st.row))});
      if(st.op === 'select'){
        if(failRead[table]) return {data: null, error: {message: 'network down', code: ''}};
        if(table === 'player_card_unlocks') return {data: db.player_card_unlocks.filter(r=> r.profile_id === st.filters.profile_id), error: null};
        const id = st.filters.id || st.filters.profile_id; const r = db[table] && db[table][id];
        return {data: r ? JSON.parse(JSON.stringify(r)) : null, error: null};
      }
      if(st.op === 'upsert'){
        const rows = Array.isArray(st.row) ? st.row : [st.row];
        rows.forEach(r=>{ if(table === 'player_card_unlocks'){ const i = db.player_card_unlocks.findIndex(x=> x.card_id === r.card_id); if(i >= 0) db.player_card_unlocks[i] = r; else db.player_card_unlocks.push(r); }
          else { const id = r.id || r.profile_id; db[table][id] = Object.assign({}, db[table][id] || {}, r); } });
        return {error: null};
      }
      if(st.op === 'update'){ const id = st.filters.id; if(db[table][id]) Object.assign(db[table][id], st.row); return {error: null}; }
      return {error: null};
    }
    return api; };
  const later = []; // long timers (the retry) are recorded, not run
  const ctx = {
    console: {log(){}, warn: (...a)=> ctx._warns.push(a.join(' ')), error(){}}, _warns: [],
    localStorage: ls, sessionStorage: fakeStorage(), Date, JSON, Math, Promise, Object, Array, Set, Number, String, Map,
    setTimeout: (f, ms)=>{ if(ms >= 10000){ later.push({f, ms}); return 0; } return setTimeout(f, ms); }, clearTimeout,
    setInterval, clearInterval,
    sbClient: null, LiveData: {available: null, progressPushedHash: null},
    PROGRESS_KEYS: Object.keys(RICH).concat(['bramblewood_quests_v1']), PROGRESS_MERGE_KEYS: {}, PROGRESS_LOCAL_AT_KEY: 'bramblewood_progress_local_at',
    PROGRESS_SHRINK_OK_KEY: 'bw_progress_shrink_ok', NAME_CHOSEN_KEY: 'bramblewood_name_chosen_v1', FIX3_SIGNUP_PENDING_KEY: 'bramblewood_signup_pending_v1', FIX3_AUTH_RETURN_KEY: 'x',
    DISCOVERED_KEY: 'bramblewood_arena_discovered', DECK_SYNC_DEBOUNCE_MS: 1200,
    hashStr: s=>{ let h = 0; for(let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; },
    migrateStoredNodeValue: (k, v)=> v, reloadCardSockets(){}, invalidateCardDefs(){}, refreshPremiumFlag(){}, liveRefreshGhosts(){}, saveRatingLocal(){}, settleRaidPoints(){},
    raidShardsClean: x=> x || {}, copyModelSyncAll(){}, cloudApplyCopyLevels(){}, saveUnlockedCardIds(){}, saveCardLevels(){}, saveCurrencies(){}, cloudCopiesOf: ()=> [],
    deckSyncPull: async ()=>{ log.push({op: 'select', table: 'player_decks'}); return true; }, deckSyncFlush: async ()=>{ log.push({op: 'upsert', table: 'player_decks'}); }, setDeckSyncState(){},
    renderHome(){}, renderPlay(){}, switchTab(){}, CONQUEST_MAPS: [], matchState: null, currentTab: 'home',
    saveMyProfile: p=>{ ctx.myProfile = p; ls.setItem('bramblewood_arena_profile', JSON.stringify(p)); },
    openNamePrompt: ()=>{ ctx._namePrompts++; }, _namePrompts: 0, ui12RefreshFrontLock(){},
  };
  ctx.myProfile = JSON.parse(ls.getItem('bramblewood_arena_profile') || 'null');
  const pre = `var cloudUserId = null, cloudReady = false, cloudIsAnonymous = true, cloudUserEmail = null, cloudUserLabel = null, cloudUserAvatar = null, cloudSessionUser = null;
    var cloudSyncSettledUid = null, cloudIdentityJob = null, cloudIdentityJobUid = null, cloudAuthBusy = 0, cloudAuthBusyAt = 0, ui12CloudRetryN = 0, ui12ProgressRepullAt = 0;
    var cloudCurPushInFlight = null, cloudCurPushQueued = null, cloudShardsColumn = null, cloudBlossomsColumn = null, cloudCopiesColumn = null, copyModelReady = false;
    var deckSyncDirty = false, deckSyncTimer = null, fix3AfterSignInBusy = false, fix3AuthReturn = null, playSubTab = null, conquestSelectedMap = null;
    var myRating = 1000, myCurrencies = {gold: 100, gems: 0, dust: 0, metal: 0}, myUnlockedCardIds = new Set(['otter-scout', 'basic-a']), myCardLevels = {}, myDiscoveredCardIds = new Set(), mySeenCardIds = null, myMateria = null;`;
  vm.runInNewContext(pre + '\n' + guard + '\n' + FNS.map(fnSrc).join('\n') + `\nthis.$ = {applySessionIdentity, fix3AfterSignIn, gsiHandleCredential, livePushProgress, livePullProgress, cloudPushCurrencies, cloudSyncSettled,
    get uid(){ return cloudUserId; }, get settledUid(){ return cloudSyncSettledUid; }, get cur(){ return myCurrencies; }, get levels(){ return myCardLevels; }, get job(){ return cloudIdentityJob; }, get busy(){ return cloudAuthBusy; } };`, ctx);
  const user = {id: uid, email: 'player@example.test', is_anonymous: false, user_metadata: {full_name: 'Test Player'}};
  ctx.sbClient = { from: q, auth: { async signInWithIdToken(){ await delay('auth');
    // supabase-js fires onAuthStateChange(SIGNED_IN) before signInWithIdToken resolves; initCloudSync's listener does this:
    ctx.$.applySessionIdentity(user).then(()=>{ ctx.$.fix3AfterSignIn(); });
    return {data: {user, session: {user}}, error: null}; } } };
  return {ctx, ls, db, log, user, later, $: ctx.$};
}
const progressWrites = w=> w.log.filter(e=> e.op === 'upsert' && e.table === 'player_progress');
const settle = async w=>{ for(let i = 0; i < 40; i++){ await sleep(30); if(!w.$.job) break; } await sleep(150); };

(async ()=>{
  // ---------------------------------------------------------------- 2. UI10's Google button, fresh incognito device
  {
    const w = makeWorld({});
    const richScore = G.progressScore(RICH);
    // the 20 s tick and a pagehide-style push fire while the sign-in is on its way
    const p = w.$.gsiHandleCredential({credential: 'id-token'}, 'nonce').then(()=> w.$.fix3AfterSignIn(true)); // gsiMountButton's onDone → onSuccess → fix3AfterSignIn(true)
    await sleep(30); ok(w.$.busy > 0, 'the front screens are locked while Google\'s answer is checked');
    w.$.livePushProgress(false); w.$.livePushProgress(true); w.$.cloudPushCurrencies();
    await p; await settle(w);
    ok(w.$.busy === 0, 'unlocked after the load');
    ok(w.$.settledUid === 'u-owner', 'the account settles after its cloud save is read');
    const pw = progressWrites(w);
    ok(pw.every(e=> G.progressScore(e.row.data) >= richScore), `no progress write is emptier than the cloud's (${pw.map(e=> G.progressScore(e.row.data)).join(',') || 'none'} vs ${richScore})`);
    ok(G.progressScore(w.db.player_progress['u-owner'].data) === richScore, 'the cloud blob keeps every cleared fight');
    ok(w.ls.getItem('bramblewood_arena_tutorial_done') === '1' && JSON.parse(w.ls.getItem('bramblewood_conquest_progress_v1')).completed.length === 7, 'the device now holds the cloud progress (no tutorial)');
    const firstCurRead = w.log.findIndex(e=> e.op === 'select' && e.table === 'player_currencies'), firstCurWrite = w.log.findIndex(e=> e.op === 'upsert' && e.table === 'player_currencies');
    ok(firstCurWrite < 0 || firstCurWrite > firstCurRead, 'currencies are read before any are written');
    ok(w.log.filter(e=> e.op === 'upsert' && e.table === 'player_currencies').every(e=> e.row.gold === 5000), `no currency write carries the fresh 100 gold (${w.log.filter(e=> e.table === 'player_currencies' && e.op === 'upsert').map(e=> e.row.gold)})`);
    ok(w.db.player_currencies['u-owner'].gold === 5000 && w.$.cur.gold === 5000, 'the cloud gold is kept and loaded');
    const firstProgRead = w.log.findIndex(e=> e.op === 'select' && e.table === 'player_progress'), firstLevelWrite = w.log.findIndex(e=> e.op === 'upsert' && e.table === 'player_card_unlocks');
    ok(firstLevelWrite < 0 || firstLevelWrite > firstProgRead, 'card levels are written only after the whole save was read');
    ok(w.db.player_card_unlocks.find(r=> r.card_id === 'otter-scout').level === 4, 'a card level is never lowered by the fresh save');
    ok(w.ctx.myProfile && w.ctx.myProfile.name === 'Bramble Owner' && w.ls.getItem('bramblewood_name_chosen_v1') === '1', 'the account\'s name comes back');
    await sleep(700); ok(w.ctx._namePrompts === 0, 'no name prompt for an account that has a name');
  }
  // the old order (sync before the load) is now harmless: fix3AfterSignIn called with no job and an unsettled account sends nothing
  {
    const w = makeWorld({});
    w.ctx.sbClient.auth.signInWithIdToken = async ()=> ({data: {user: w.user}, error: null});
    const job = w.$.applySessionIdentity(w.user); const f = w.$.fix3AfterSignIn(true); w.$.livePushProgress(true);
    await job; await f; await settle(w);
    ok(progressWrites(w).every(e=> G.progressScore(e.row.data) >= G.progressScore(RICH)), 'sync fired with the load: still no emptier write');
  }
  // ---------------------------------------------------------------- 3. redirect path: stale "local is newer" stamp, a tutorial fight already won here
  {
    const w = makeWorld({local: Object.assign({}, TUT1, {'bramblewood_progress_local_at': String(Date.now())})});
    await w.$.applySessionIdentity(w.user); await w.$.fix3AfterSignIn(); await settle(w);
    ok(G.progressScore(w.db.player_progress['u-owner'].data) === G.progressScore(RICH), 'redirect: the richer cloud blob is kept although the local stamp is newer');
    ok(w.ls.getItem('bramblewood_arena_tutorial_done') === '1', 'redirect: the device loads it');
  }
  // ---------------------------------------------------------------- 4. failed reads
  {
    const w = makeWorld({failRead: {profiles: true}});
    await w.$.applySessionIdentity(w.user); await w.$.fix3AfterSignIn(true); w.$.livePushProgress(true); await settle(w);
    ok(!w.log.some(e=> e.op !== 'select'), `a failed profiles read writes nothing (was: seeded the cloud from the fresh save) ${w.log.filter(e=> e.op !== 'select').map(e=> e.table)}`);
    ok(!w.$.cloudSyncSettled() && w.later.some(t=> t.ms >= 15000), 'unsettled, a retry is scheduled');
  }
  {
    const w = makeWorld({failRead: {player_progress: true}});
    await w.$.applySessionIdentity(w.user); await w.$.fix3AfterSignIn(true); w.$.livePushProgress(true); await settle(w);
    ok(!w.log.some(e=> e.op !== 'select'), 'a failed progress read writes nothing');
    ok(!w.$.cloudSyncSettled(), 'and the account stays unsettled');
  }
  {
    const w = makeWorld({failRead: {player_currencies: true}});
    await w.$.applySessionIdentity(w.user); await settle(w);
    ok(!w.$.cloudSyncSettled() && !w.log.some(e=> e.op === 'upsert'), 'a failed currencies read writes nothing');
  }
  // ---------------------------------------------------------------- 5. brand-new account, normal play, emptier blob, admin reset
  {
    const w = makeWorld({noProfile: true, local: TUT1});
    w.ctx.myProfile = {name: 'Newbie'};
    await w.$.applySessionIdentity(w.user); await settle(w);
    ok(w.$.cloudSyncSettled() && w.db.profiles['u-owner'] && w.db.profiles['u-owner'].display_name === 'Newbie', 'a brand-new account settles and gets this device\'s name');
    ok(w.db.player_progress['u-owner'] && G.progressScore(w.db.player_progress['u-owner'].data) === G.progressScore(TUT1), 'and is seeded from this device');
  }
  {
    const w = makeWorld({});
    await w.$.applySessionIdentity(w.user); await settle(w);
    // play: one more fight cleared
    const cq = JSON.parse(w.ls.getItem('bramblewood_conquest_progress_v1')); cq.completed.push('mf:1-3'); w.ls.setItem('bramblewood_conquest_progress_v1', JSON.stringify(cq));
    w.$.livePushProgress(false); await sleep(80);
    ok(JSON.parse(w.db.player_progress['u-owner'].data['bramblewood_conquest_progress_v1']).completed.includes('mf:1-3'), 'normal play is pushed');
    // something wipes the device's progress (a bug, another tab): the push is refused
    const before = G.progressScore(w.db.player_progress['u-owner'].data);
    w.ls.removeItem('bramblewood_conquest_progress_v1'); w.ls.removeItem('bramblewood_arena_tutorial_done');
    w.$.livePushProgress(true); await sleep(80);
    ok(G.progressScore(w.db.player_progress['u-owner'].data) === before, 'an emptier blob is refused');
    ok(w.ctx._warns.some(s=> /progress push refused/.test(s)), 'and the refusal is logged');
    await sleep(120);
    ok(w.ls.getItem('bramblewood_arena_tutorial_done') === '1', 'the refusal reloads the cloud blob');
    // an admin reset may shrink it, once
    w.ls.removeItem('bramblewood_conquest_progress_v1'); w.ls.removeItem('bramblewood_arena_tutorial_done'); w.ls.removeItem('bramblewood_tutorial2_done_v1'); w.ls.removeItem('bramblewood_player_xp_v1');
    w.ls.setItem('bw_progress_shrink_ok', '1'); w.$.livePushProgress(true); await sleep(80);
    ok(G.progressScore(w.db.player_progress['u-owner'].data) < before && w.ls.getItem('bw_progress_shrink_ok') === null, 'an admin reset goes up once and clears its mark');
  }

  // ---------------------------------------------------------------- 6. front screens, texts, SQL
  ok(/function ui12RefreshFrontLock\(\)/.test(src) && /\['startBtn', 'loginSubmitBtn', 'loginNameInput', 'entranceSignInBtn'\]/.test(src), 'Start, Enter the Grove, the name field and Sign in lock');
  ok(/function handleLoginSubmit\(e\)\{\s*if\(e\) e\.preventDefault\(\);\s*if\(ui12CloudLoading\(\)\) return;/.test(src), 'Enter the Grove refuses while the cloud loads');
  ok(/requireSignIn\('to sync your progress', ui12EnterAfterSignIn\)/.test(src), 'the entrance sign-in goes straight in afterwards (GG3)');
  ok(/needsFactionPick \|\| needsTutorialResume\) && ui12CloudLoading\(\)/.test(src), 'the tutorial waits for the cloud load');
  ok(/if\(ui12OauthReturning\) cloudAuthBusyAdd\(-1\)/.test(src) && /ui12OauthReturning && isSignedIn\(\)\) try\{ ui12EnterAfterSignIn\(\)/.test(src), 'the redirect return unlocks and goes in');
  ok(!!TEXT['ui.ui12-loading-save'], 'TX ui.ui12-loading-save');
  ok(fs.existsSync(path.join(ROOT, 'supabase/proposed/20261031_progress_shrink_guard.sql')), 'the server-side guard is filed in supabase/proposed (not applied)');

  console.log(fail ? `ui12-save-guard: ${fail} of ${n} checks failed` : `ui12-save-guard: all ${n} checks passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
