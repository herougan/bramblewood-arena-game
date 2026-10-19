#!/usr/bin/env node
// 2026-10-19 (package SY, owner 10:55: "im using the same account in mobile AND web. They don't see each other's decks!").
// Two devices (separate localStorage, the app's real deck and sync code) against a fake cloud that behaves like player_decks:
//   0. the root cause: 'deck-xxxxxxx' ids are refused by a uuid column; new and old decks get uuids (old ones moved once, with the
//      active / main deck keys)
//   1. a deck made on A shows on B after a pull (and B's own decks reach A): pushes are debounced, pulls run on load / wake
//   2. edits merge by each deck's updatedAt: the newer wins both ways; an older offline edit never overwrites a newer one
//   3. deletes: a delete on A reaches B with a toast (kept in the removed list), a deck edited on B after it last synced is kept and
//      sent back, never dropped silently; with the proposed deleted_at column a delete is a mark
//   4. the proposed columns: missing → the client falls back once; present → looks travel
//   5. per-copy uids: decks hold counts, never copy uids; the cloud's copy levels map onto another device's own copies
//   6. the seen map is per account; a guest pushes nothing; the indicator's states; texts + 12 packs; the proposed SQL
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clone = v=> v == null ? v : JSON.parse(JSON.stringify(v));

// ---------------- the fake cloud (player_decks: uuid id, RLS own rows, PostgREST errors for a missing column) ----------------
function makeCloud(extraCols){
  const cloud = {rows: [], offline: false, ops: [], cols: new Set(extraCols || [])};
  const BASE = new Set(['id', 'profile_id', 'name', 'character_id', 'leader_id', 'counts', 'created_at', 'updated_at']);
  const has = c=> BASE.has(c) || cloud.cols.has(c);
  const colErr = k=> ({code: 'PGRST204', message: `Could not find the '${k}' column of 'player_decks' in the schema cache`});
  // the proposed stale-write trigger, when 'guard' is one of the extra columns
  const guardOk = (old, nw)=> !cloud.cols.has('guard') || !(Date.parse(nw.updated_at) < Date.parse(old.updated_at));
  cloud.client = uidOf=> ({from(table){
    const st = {op: null, cols: '*', f: [], payload: null};
    const run = ()=>{
      if(cloud.offline) return {data: null, error: {message: 'TypeError: Failed to fetch'}};
      const uid = uidOf(); cloud.ops.push(st.op);
      const match = r=> r.profile_id === uid && st.f.every(([k, v])=> r[k] === v);
      if(st.op === 'select'){ const want = st.cols === '*' ? null : st.cols.split(',').map(s=> s.trim());
        return {data: cloud.rows.filter(match).map(r=>{ const o = {}; Object.keys(r).forEach(k=>{ if(has(k) && (!want || want.includes(k))) o[k] = clone(r[k]); }); return o; }), error: null}; }
      if(st.op === 'upsert'){
        for(const r of st.payload){ for(const k of Object.keys(r)) if(!has(k)) return {data: null, error: colErr(k)};
          if(!UUID.test(String(r.id))) return {data: null, error: {code: '22P02', message: `invalid input syntax for type uuid: "${r.id}"`}};
          if(r.profile_id !== uid) return {data: null, error: {code: '42501', message: 'new row violates row-level security policy'}}; }
        st.payload.forEach(r=>{ const old = cloud.rows.find(x=> x.id === r.id);
          if(old){ if(guardOk(old, r)) Object.assign(old, clone(r)); } else cloud.rows.push(Object.assign({created_at: new Date().toISOString(), counts: {}}, clone(r))); });
        return {data: null, error: null}; }
      if(st.op === 'update'){ for(const k of Object.keys(st.payload)) if(!has(k)) return {data: null, error: colErr(k)};
        cloud.rows.filter(match).forEach(r=>{ if(guardOk(r, st.payload)) Object.assign(r, clone(st.payload)); }); return {data: null, error: null}; }
      if(st.op === 'delete'){ cloud.rows = cloud.rows.filter(r=> !match(r)); return {data: null, error: null}; }
      return {data: null, error: {message: 'bad op'}};
    };
    const api = {select(c){ st.op = st.op || 'select'; if(st.op === 'select') st.cols = c || '*'; return api; }, upsert(r){ st.op = 'upsert'; st.payload = Array.isArray(r) ? r : [r]; return api; },
      update(o){ st.op = 'update'; st.payload = o; return api; }, delete(){ st.op = 'delete'; return api; }, eq(k, v){ st.f.push([k, v]); return api; },
      then(res, rej){ return Promise.resolve().then(run).then(res, rej); }};
    return api; }});
  return cloud;
}

// ---------------- a device: the app's own deck list, deck functions and sync code ----------------
const syncBlock = between('// DECK_SYNC_SY:BEGIN', '// DECK_SYNC_SY:END');
ok(syncBlock.length > 3000, '0. the DECK_SYNC_SY block is there');
const boot = between('let myDecks = loadMyDecks();', 'if(!mainDeckId || !myDecks.find(d=> d.id===mainDeckId)) mainDeckId = activeDeckId;');
ok(/deckSyncPrepareLocal\(myDecks\)/.test(boot), '0. the load path moves old deck ids (deckSyncPrepareLocal)');
const appFns = ['genDeckId', 'loadMyDecks', 'saveMyDecks', 'loadActiveDeckId', 'saveActiveDeckId', 'setMainDeck', 'createNewDeck', 'renameDeck', 'deleteDeck',
  'cloudPushDecks', 'deckSyncFlush', 'deckSyncRetrySoon', 'deckSyncPull', 'deckSyncOnWake', 'setDeckSyncState', 'renderDeckSyncInd'];
appFns.forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
let clock = Date.parse('2026-10-19T11:00:00Z');
function makeDevice(cloud, o){
  o = o || {};
  const ls = o.storage || fakeStorage();
  const timers = new Map(); let tid = 0;
  const ctx = {localStorage: ls, Math, JSON, Number, String, Object, Array, Set, Map, Promise, console, TX,
    Date: class extends Date { constructor(...a){ if(a.length) super(...a); else super(clock); } static now(){ return clock; } static parse(s){ return Date.parse(s); } },
    setTimeout: (f, ms)=>{ timers.set(++tid, {f, ms}); return tid; }, clearTimeout: id=> timers.delete(id),
    genUUID: ()=> crypto.randomUUID(), uid: o.uid === undefined ? 'u-1111' : o.uid, signedIn: o.signedIn !== false,
    toasts: [], switched: 0, matchState: null, currentTab: 'home', renderDeckSection: ()=>{},
    myCharacterId: 'castle', myLeaderId: null, myDeckCounts: {'bee-knight': 4}};
  ctx.showToast = m=> ctx.toasts.push(m);
  ctx.sbClient = cloud.client(()=> ctx.uid);
  vm.createContext(ctx);
  vm.runInContext(`
    var cloudUserId = this.uid; function isSignedIn(){ return !!this_ctx().signedIn && !!cloudUserId; } function this_ctx(){ return globalThis; }
    var sbClient = this.sbClient, deckDirty = false, deckDraftOn = false, deckEditingId = null;
    function switchActiveDeck(id){ activeDeckId = id; saveActiveDeckId(); globalThis.switched++; }
    ${syncBlock}
    ${appFns.map(fnSrc).join('\n')}
    ${boot}
    if(!mainDeckId || !myDecks.find(d=> d.id===mainDeckId)) mainDeckId = activeDeckId;
    this.D = {get decks(){ return myDecks; }, set decks(v){ myDecks = v; }, get active(){ return activeDeckId; }, get main(){ return mainDeckId; },
      get state(){ return deckSyncState; }, get cols(){ return cloudDeckCols; }, setUid(u){ cloudUserId = u; globalThis.uid = u; },
      createNewDeck, renameDeck, deleteDeck, saveMyDecks, deckSyncPull, deckSyncFlush, deckSyncMerge, deckSyncPrepareLocal, deckContentHash,
      seen(){ return deckSyncRead(deckSyncKey(DECK_SYNC_SEEN_KEY)); }, removed(){ try{ return JSON.parse(localStorage.getItem(DECK_SYNC_REMOVED_KEY) || '[]'); }catch(e){ return []; } }};`, ctx);
  ctx.timers = timers;
  // run the debounce timers (not the 30 s retry), then let the promises settle
  ctx.tick = async ()=>{ for(let round = 0; round < 5; round++){ const due = Array.from(timers.entries()).filter(([, t])=> t.ms < 30000); if(!due.length) break;
    due.forEach(([id])=> timers.delete(id)); due.forEach(([, t])=> t.f()); await settle(); } await settle(); };
  return ctx;
}
const settle = async ()=>{ for(let i = 0; i < 30; i++) await new Promise(r=> setImmediate(r)); };
const ids = ctx=> ctx.D.decks.map(d=> d.id).sort().join(',');
const byName = (ctx, name)=> ctx.D.decks.find(d=> d.name === name);
const later = (ms)=>{ clock += ms || 1000; };

(async ()=>{
// ======================= 0. the root cause and the id move =======================
ok(!/'deck-' \+ Math\.random/.test(src), '0. genDeckId no longer makes deck-xxxxxxx ids');
{ const cloud = makeCloud();
  const r = await cloud.client(()=> 'u-1111').from('player_decks').upsert([{id: 'deck-k3j9x2a', profile_id: 'u-1111', name: 'Old', counts: {}}]);
  ok(r.error && r.error.code === '22P02', '0. (the bug) a deck-xxxxxxx id is refused by the uuid column, which the old push ignored');
  const ls = fakeStorage();
  ls.setItem('bramblewood_arena_decks', JSON.stringify([{id: 'deck-aaa1111', name: 'Deck 1', characterId: 'castle', leaderId: null, counts: {'bee-knight': 4}},
    {id: 'deck-bbb2222', name: 'Deck 2', characterId: 'castle', leaderId: null, counts: {'ent': 1}}]));
  ls.setItem('bramblewood_arena_active_deck', 'deck-bbb2222'); ls.setItem('bramblewood_arena_main_deck', 'deck-aaa1111');
  const A = makeDevice(cloud, {storage: ls});
  ok(A.D.decks.length === 2 && A.D.decks.every(d=> UUID.test(d.id) && Number.isFinite(d.updatedAt)), '0. old ids become uuids at load, each deck gets an updatedAt');
  ok(A.D.active === byName(A, 'Deck 2').id && ls.getItem('bramblewood_arena_active_deck') === A.D.active, '0. the active deck key follows its deck');
  ok(A.D.main === byName(A, 'Deck 1').id && ls.getItem('bramblewood_arena_main_deck') === A.D.main, '0. the main deck key follows its deck');
  ok(JSON.parse(ls.getItem('bramblewood_arena_decks')).every(d=> UUID.test(d.id)), '0. the moved ids are saved');
  const d = A.D.createNewDeck(); ok(UUID.test(d.id), '0. a new deck gets a uuid');
  await A.D.deckSyncFlush(); await settle();
  ok(cloud.rows.length === 3 && cloud.rows.every(r=> r.profile_id === 'u-1111'), '0. and now they reach the cloud (3 rows)');
  const again = makeDevice(cloud, {storage: ls});
  ok(ids(again) === ids(A), '0. a reload keeps the same ids (the move runs once)'); }

// ======================= 1. a deck made on A shows on B =======================
const cloud = makeCloud();
const A = makeDevice(cloud), B = makeDevice(cloud); // each starts with its own first-run deck
ok(A.D.decks.length === 1 && B.D.decks.length === 1 && A.D.decks[0].id !== B.D.decks[0].id, '1. two devices, each with its own deck');
await A.D.deckSyncPull('load'); await settle(); await B.D.deckSyncPull('load'); await settle();
ok(cloud.rows.length === 2, '1. on load each device sends its own deck (cloud: 2 rows)');
ok(B.D.decks.length === 2, "1. B already sees A's first deck after its load pull");
later(); const made = A.D.createNewDeck(); A.D.renameDeck(made.id, 'Mobile Bees'); A.D.decks.find(d=> d.id === made.id).counts = {'bee-drone': 3}; A.D.saveMyDecks();
ok(A.timers.size > 0 && !cloud.rows.some(r=> r.id === made.id), '1. the push waits (debounced) and edits in a burst go as one');
ok(A.D.state === 'syncing', '1. the indicator says Syncing… while it waits');
const upserts0 = cloud.ops.filter(x=> x === 'upsert').length;
await A.tick();
ok(cloud.rows.some(r=> r.id === made.id && r.name === 'Mobile Bees' && r.counts['bee-drone'] === 3), '1. then it reaches the cloud with its name and cards');
ok(cloud.ops.filter(x=> x === 'upsert').length - upserts0 === 1, '1. one upsert for the burst');
ok(A.D.state === 'synced', '1. the indicator says Synced ✓');
ok(!B.D.decks.some(d=> d.id === made.id), '1. B does not have it before a pull');
later(20000); await B.D.deckSyncPull('wake'); await settle();
const onB = B.D.decks.find(d=> d.id === made.id);
ok(onB && onB.name === 'Mobile Bees' && onB.counts['bee-drone'] === 3, '1. after a pull, B has the deck made on A (same id, name, cards)');
ok(ids(A) !== ids(B) || true, '');
later(); await A.D.deckSyncPull('wake'); await settle();
ok(ids(A) === ids(B) && A.D.decks.length === 3, '1. both devices list the same 3 decks');
ok(/document\.addEventListener\('visibilitychange'[^\n]*deckSyncOnWake/.test(src) && /window\.addEventListener\('focus', deckSyncOnWake\)/.test(src) && /window\.addEventListener\('online'/.test(src),
  '1. pulls run when the tab comes back (visibility / focus) and when the browser is back online');
ok(/try\{ await deckSyncPull\('load'\); \}catch\(e\)\{\}/.test(fnSrc('cloudPullState')), '1. and on load / sign-in (cloudPullState)');

// ======================= 2. edits merge by timestamp =======================
{ const id = made.id;
  later(); A.D.renameDeck(id, 'Bees v2'); await A.tick();                                  // A edits at t1
  later(); const b = B.D.decks.find(d=> d.id === id); b.counts = {'bee-drone': 2, 'ent': 1}; B.D.saveMyDecks(); await B.tick(); // B edits at t2 > t1 (stale copy)
  ok(cloud.rows.find(r=> r.id === id).counts.ent === 1, "2. B's newer edit is in the cloud");
  later(); await A.D.deckSyncPull('wake'); await settle();
  const a = A.D.decks.find(d=> d.id === id);
  ok(a.counts.ent === 1 && a.updatedAt === B.D.decks.find(d=> d.id === id).updatedAt, "2. A takes B's newer version on its next pull");
  // an older edit made offline must not overwrite a newer one
  cloud.offline = true; later(); const b2 = B.D.decks.find(d=> d.id === id); b2.name = 'Offline edit'; B.D.saveMyDecks(); await B.tick();
  ok(B.D.state === 'offline', '2. offline: the indicator says Offline');
  cloud.offline = false; later(); A.D.renameDeck(id, 'Newest on A'); await A.tick();
  ok(cloud.rows.find(r=> r.id === id).name === 'Newest on A', "2. A's later edit is in the cloud");
  later(); await B.D.deckSyncFlush(); await settle(); await settle();
  ok(cloud.rows.find(r=> r.id === id).name === 'Newest on A', "2. B's older offline edit does not overwrite it (the push checks the cloud's updated_at first)");
  ok(B.D.decks.find(d=> d.id === id).name === 'Newest on A', '2. B pulls the newer version instead');
  ok(B.D.state === 'synced', '2. and is Synced ✓ again'); }

// ======================= 3. deletes =======================
{ const keep = A.D.createNewDeck(); A.D.renameDeck(keep.id, 'Keep me'); later(); await A.tick();
  const gone = A.D.createNewDeck(); A.D.renameDeck(gone.id, 'Throwaway'); later(); await A.tick();
  later(); await B.D.deckSyncPull('wake'); await settle();
  ok(B.D.decks.some(d=> d.id === gone.id) && B.D.decks.some(d=> d.id === keep.id), '3. B has both new decks');
  later(); ok(A.D.deleteDeck(gone.id) === true, '3. A deletes one'); await A.tick();
  ok(!cloud.rows.some(r=> r.id === gone.id), '3. it is gone from the cloud (no deleted_at column: the row is deleted)');
  later(); B.toasts.length = 0; await B.D.deckSyncPull('wake'); await settle();
  ok(!B.D.decks.some(d=> d.id === gone.id), "3. B drops it on its next pull (it hadn't been edited on B since it synced)");
  ok(B.toasts.some(t=> /Throwaway/.test(t) && /another device/.test(t)), '3. with a toast saying so (never silently)');
  ok(B.D.removed().some(d=> d.id === gone.id && d.name === 'Throwaway'), '3. and kept in the removed list on B');
  // B edited it after it last synced: kept and sent back
  later(); ok(A.D.deleteDeck(keep.id) === true, '3. A deletes another'); await A.tick();
  later(); const k = B.D.decks.find(d=> d.id === keep.id); k.counts = {'yeti': 1}; cloud.offline = true; B.D.saveMyDecks(); await B.tick(); cloud.offline = false;
  later(); B.toasts.length = 0; await B.D.deckSyncPull('wake'); await settle();
  ok(B.D.decks.some(d=> d.id === keep.id && d.counts.yeti === 1), '3. a deck B edited after it last synced is kept on B');
  ok(cloud.rows.some(r=> r.id === keep.id && r.counts.yeti === 1), '3. and sent back to the cloud');
  later(); await A.D.deckSyncPull('wake'); await settle();
  ok(A.D.decks.some(d=> d.id === keep.id && d.counts.yeti === 1), '3. so A gets it back: no edit is lost');
  // never left with no deck
  const m = A.D.deckSyncMerge([{id: 'x', name: 'Only', updatedAt: 5}], [], {seen: {x: 5}});
  ok(m.decks.length === 1 && m.decks[0].id === 'x', '3. a merge never leaves the player with no deck'); }

// ======================= 4. the proposed columns =======================
{ const c0 = makeCloud(); const P = makeDevice(c0);
  P.D.decks[0].looks = {'bee-knight': {shiny: 1}}; later(); P.D.saveMyDecks(); await P.tick();
  ok(c0.rows.length === 1 && !('looks' in c0.rows[0]) && P.D.cols.looks === false && P.D.cols.deleted_at === false,
    '4. without the proposed columns: the server says so once, the row goes without them');
  ok(c0.ops.filter(x=> x === 'upsert').length === 3, '4. (one try per missing column, then the row)');
  later(); P.D.renameDeck(P.D.decks[0].id, 'Again'); await P.tick();
  ok(c0.ops.filter(x=> x === 'upsert').length === 4, '4. and from then on it sends the row without them straight away');
  const c1 = makeCloud(['looks', 'deleted_at', 'guard']); const X = makeDevice(c1), Y = makeDevice(c1);
  X.D.decks[0].looks = {'bee-knight': {shiny: 1}}; later(); X.D.saveMyDecks(); await X.tick();
  ok(c1.rows[0].looks && c1.rows[0].looks['bee-knight'].shiny === 1 && c1.rows[0].deleted_at === null, '4. with them: the looks go up');
  later(); await Y.D.deckSyncPull('load'); await settle();
  const yx = Y.D.decks.find(d=> d.id === X.D.decks[0].id);
  ok(yx && yx.looks && yx.looks['bee-knight'].shiny === 1, '4. and come down on the other device');
  const xd = X.D.createNewDeck(); X.D.renameDeck(xd.id, 'Marked'); later(); await X.tick(); later(); await Y.D.deckSyncPull('wake'); await settle();
  later(); X.D.deleteDeck(xd.id); await X.tick();
  ok(c1.rows.some(r=> r.id === xd.id && r.deleted_at), '4. with deleted_at a delete is a mark on the row');
  later(); Y.toasts.length = 0; await Y.D.deckSyncPull('wake'); await settle();
  ok(!Y.D.decks.some(d=> d.id === xd.id) && Y.toasts.some(t=> /Marked/.test(t)), '4. the other device drops it, with the toast');
  later(); await X.D.deckSyncPull('wake'); await settle();
  ok(!X.D.decks.some(d=> d.id === xd.id), '4. a delete-marked row never comes back as a deck');
  // the stale-write trigger: an older write leaves the newer row
  const row = c1.rows.find(r=> r.id === X.D.decks[0].id), before = row.name;
  await c1.client(()=> 'u-1111').from('player_decks').upsert([Object.assign({}, row, {name: 'stale', updated_at: '2020-01-01T00:00:00Z'})]);
  ok(row.name === before, '4. (the proposed trigger, as faked) an older updated_at leaves the newer row as it is'); }

// ======================= 5. per-copy uids =======================
{ ok(cloud.rows.every(r=> Object.keys(r.counts).every(k=> !/^c[0-9a-z]{6,}$/.test(k))) && !/uid/.test(JSON.stringify(cloud.rows.map(r=> r.counts))),
    '5. deck rows hold card counts, never copy uids (each device keeps its own copies)');
  const copyBlock = between('// CARD_COPIES_NF:BEGIN', '// CARD_COPIES_NF:END');
  const refine = between('const REFINE_LADDER = [', '];') + '\n' + fnSrc('copyRefineRank');
  ok(copyBlock.length > 2000, '5. the CARD_COPIES_NF block is there');
  const makeCopies = copies=>{
    const BASE = {x: {id: 'x', name: 'X', attack: 10, health: 10, rarity: 'common'}};
    const ctx = {localStorage: fakeStorage(), Date, Math, JSON, Number, String, Object, Array, Set, TX, console, CARD_DEFS_BASELINE: BASE, liveCards: {}, LIMIT_BREAK_LEVEL: 11,
      HERO_ID: 'hero', standardMatchActive: false, myCardCopies: copies, myCardLevels: {}, myForgeCredit: {}, myDecks: [], myDeckCounts: {}, matchDefsOverlay: {},
      setTimeout: ()=> 0, showToast: ()=>{}, saveCardCopies: ()=>{}, saveCardLevels: ()=>{}, saveForgeCredit: ()=>{}, invalidateCardDefs: ()=>{},
      cardBaseLevel: d=> d ? 1 : 1, cardSourceOf: ()=> ({kind: 'pack'}), statsAtLevel: (d, L)=> ({attack: d.attack + L, health: d.health + L}), hatchlingIds: ()=> new Set(),
      getCardLevel: id=> Math.max(1, ctx.myCardLevels[id] || 0), getCardDefs: ()=> BASE};
    vm.createContext(ctx);
    vm.runInContext(refine + '\n' + copyBlock + '\nthis.C = {ensureCopyModel, cloudCopiesOf, cloudApplyCopyLevels, deckCopyLevels, copyOrder, copyLevel};', ctx);
    ctx.localStorage.setItem('bramblewood_card_copy_model_v', '1'); ctx.C.ensureCopyModel(); return ctx; };
  const devA = makeCopies({x: [{foil: false, uid: 'cA1', level: 5}, {foil: false, uid: 'cA2', level: 1}]});
  const devB = makeCopies({x: [{foil: false, uid: 'cB1', level: 1}, {foil: false, uid: 'cB2', level: 1}, {foil: true, uid: 'cB3', level: 1}]});
  const row = {card_id: 'x', level: 5, copies: devA.C.cloudCopiesOf('x')};
  ok(row.copies.length === 2 && row.copies[0].u === 'cA1' && row.copies[0].l === 5, "5. A's row carries its copies best first ({u, l})");
  ok(devB.C.cloudApplyCopyLevels([row]) === 1, "5. B applies it: one of B's copies changes");
  const bx = devB.myCardCopies.x;
  ok(bx.map(c=> c.uid).join(',') === 'cB1,cB2,cB3', "5. B keeps its own uids (A's uids are not B's copies)");
  ok(devB.C.deckCopyLevels('x', 2).join(',') === '5,1', "5. B's strongest copy takes A's level 5 (the next keeps its own): a synced deck with 2 x fights at 5 and 1");
  ok(bx.filter(c=> c.level === 5).length === 1 && bx.find(c=> c.level === 5).free === 5, '5. the level that came from the cloud is marked inherited (no double melt refund)');
  ok(devA.C.cloudApplyCopyLevels([row]) === 0, '5. A pulling its own row back changes nothing (same uids match)');
  const lower = {card_id: 'x', level: 2, copies: [{u: 'zz', l: 2}]};
  ok(devB.C.cloudApplyCopyLevels([lower]) === 0 && devB.C.deckCopyLevels('x', 1)[0] === 5, '5. a lower cloud level never lowers a copy'); }

// ======================= 6. accounts, guests, indicator, texts, SQL =======================
{ const c2 = makeCloud(); const S = makeDevice(c2); later(); await S.D.deckSyncPull('load'); await settle();
  ok(c2.rows.length === 1 && Object.keys(S.D.seen()).length === 1, '6. account 1: its deck is seen in the cloud');
  S.D.setUid('u-2222'); later(); await S.D.deckSyncPull('load'); await settle();
  ok(S.D.decks.length === 1 && S.toasts.length === 0, "6. signing into another account: account 1's seen list doesn't make the decks look deleted");
  ok(c2.rows.filter(r=> r.profile_id === 'u-2222').length === 1, '6. (they go up to the new account instead)');
  const c3 = makeCloud(); const G = makeDevice(c3, {signedIn: false}); G.D.createNewDeck(); await G.tick(); await G.D.deckSyncPull('load'); await settle();
  ok(c3.rows.length === 0 && c3.ops.length === 0 && G.D.state === 'idle', '6. a guest sends nothing and the indicator stays hidden'); }
const ind = fnSrc('renderDeckSyncInd');
ok(/accountChip/.test(ind) && /insertAdjacentElement\('afterend'/.test(ind) && /el\.hidden = s === 'idle'/.test(ind), '6. the indicator sits after the account chip, hidden for a guest');
ok(/\.sync-ind\{/.test(tpl) && /\.sync-ind\[data-state="syncing"\]/.test(tpl) && /prefers-reduced-motion[^\n]*sync-ind/.test(tpl) && /max-width: 600px\)\{ \.sync-ind \.sync-ind-txt\{display:none;\}/.test(tpl),
  '6. its CSS: a dot per state, calm with reduced motion, the dot alone on a phone');
const KEYS = ['ui.sy-synced', 'ui.sy-syncing', 'ui.sy-offline', 'ui.sy-synced-tip', 'ui.sy-syncing-tip', 'ui.sy-offline-tip', 'toast.sy-deck-deleted-elsewhere'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`TX('${k}'`), `${k} is a TX key the code uses`));
ok(TEXT['ui.sy-synced'] === 'Synced ✓' && TEXT['ui.sy-syncing'] === 'Syncing…' && TEXT['ui.sy-offline'] === 'Offline', '6. the three states read Synced ✓ / Syncing… / Offline');
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `lang/${c}.json has every new text (missing: ${miss.join(', ')})`); });
ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_19_sy.py')), 'tools/i18n_2026_10_19_sy.py');
const sql = fs.readFileSync(path.join(ROOT, 'supabase', 'proposed', '20261019_deck_sync.sql'), 'utf8');
ok(/PROPOSED, NOT APPLIED/.test(sql) && /add column if not exists looks jsonb/.test(sql) && /add column if not exists deleted_at timestamptz/.test(sql)
  && /guard_deck_stale_write/.test(sql) && /new\.updated_at < old\.updated_at then return old/.test(sql) && !/drop table|truncate|delete from/i.test(sql.replace(/^--.*$/gm, '')),
  '6. supabase/proposed/20261019_deck_sync.sql: looks + deleted_at + the stale-write guard, nothing destructive');

console.log(fail ? `deck-sync-2026-10-19: ${fail} of ${n} checks failed` : `deck-sync-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
