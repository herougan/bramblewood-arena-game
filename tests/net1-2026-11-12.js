#!/usr/bin/env node
// 2026-11-12 (package NET1, owner 00:43: "network optimisation ... support infra that supports 10,000 concurrent players"). The client's network
// code against fakes (no network):
//   1. card_overrides: this device's copy (NET1_OVR), a load reads id + updated_at and then only the changed rows; a gone row is dropped; another
//      build, an old copy or many changes read everything; players poll every 5 minutes, admins every 30 s
//   2. raid bars (NET1_RAID): after one full read only newer rows are read; the merged list equals a full read (random inserts, late commits)
//   3. card rows (NET1_CARDS + cloudPushCardLevels): only changed rows go up, a failed write goes again, a burst becomes one more write, writes
//      never overlap, the missing-copies fallback still works
//   4. social: no 'bw-online' presence channel; one channel for friend requests + invites; online = seen in the last 5 minutes; the heartbeat
//      only while the game is on screen
//   5. the timers: hidden-tab backoff of the 3-minute world check, the world_events cut-off to the hour, the progress tick, the ranked queue
//   6. vercel.json (hashed assets immutable), the proposed SQL + README, the plan doc (under 600 words), the CHANGELOG entry
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('no block ' + a); return src.slice(i, j + b.length); };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const sleep = ms=> new Promise(r=> setTimeout(r, ms));

// a tiny PostgREST stand-in: from(table).select(cols).in/eq/gt(...) (thenable), upsert(rows); every request is logged
function fakeDb(tables, opts){
  opts = opts || {}; const log = [];
  const from = table=>{ const st = {table, f: []};
    const api = {
      select(c){ st.op = 'select'; st.cols = c; return api; }, in(k, v){ st.f.push(['in', k, v]); return api; }, eq(k, v){ st.f.push(['eq', k, v]); return api; },
      gt(k, v){ st.f.push(['gt', k, v]); return api; }, gte(k, v){ st.f.push(['gte', k, v]); return api; },
      upsert(rows){ st.op = 'upsert'; st.rows = rows; return api; }, then(res, rej){ return run().then(res, rej); },
    };
    async function run(){
      await sleep(opts.delay != null ? opts.delay : 2);
      const entry = {table, op: st.op, cols: st.cols, f: st.f, rows: st.rows && JSON.parse(JSON.stringify(st.rows))}; log.push(entry);
      const err = opts.fail && opts.fail(entry); if(err) return {data: null, error: err};
      if(st.op === 'upsert'){ (Array.isArray(st.rows) ? st.rows : [st.rows]).forEach(r=>{ const t = tables[table], i = t.findIndex(x=> x.card_id === r.card_id); if(i >= 0) t[i] = Object.assign({}, t[i], r); else t.push(r); }); return {data: null, error: null}; }
      let rows = (tables[table] || []).slice();
      st.f.forEach(([op, k, v])=>{ rows = rows.filter(r=> op === 'in' ? v.includes(r[k]) : op === 'eq' ? r[k] === v : op === 'gt' ? r[k] > v : r[k] >= v); });
      const cols = String(st.cols || '*').split(',').map(s=> s.trim());
      if(cols[0] !== '*') rows = rows.map(r=>{ const o = {}; cols.forEach(c=> o[c] = r[c] === undefined ? null : r[c]); return o; });
      return {data: JSON.parse(JSON.stringify(rows)), error: null};
    }
    return api; };
  return {from, log};
}

// ======================================================================= 1. card_overrides
{
  const B = {}; vm.runInNewContext(between('// NET1_OVR:BEGIN', '// NET1_OVR:END') + '\nthis.plan = net1OvrPlan; this.slim = net1OvrSlim; this.MAX = NET1_OVR_DELTA_MAX; this.POLL = NET1_OVR_POLL_PLAYER_MS;', B);
  const now = Date.now(), rows = {a: {id: 'a', updated_at: 't1', data: {x: 1}}, b: {id: 'b', updated_at: 't2', data: {x: 2}}};
  const cache = {build: 'B1', at: now - 1000, rows};
  ok(B.plan(null, [], 'B1', now) === null && B.plan(cache, [], 'B2', now) === null, '1. no copy, or a copy from another build: read everything');
  ok(B.plan(Object.assign({}, cache, {at: now - 13 * 3600e3}), [{id: 'a', updated_at: 't1'}], 'B1', now) === null, '1. a copy older than 12 h: read everything');
  let p = B.plan(cache, [{id: 'a', updated_at: 't1'}, {id: 'b', updated_at: 't2'}], 'B1', now);
  ok(p && p.keep.length === 2 && p.fetch.length === 0, '1. nothing changed: keep both, read none');
  p = B.plan(cache, [{id: 'a', updated_at: 't1'}, {id: 'b', updated_at: 't3'}, {id: 'c', updated_at: 't1'}], 'B1', now);
  ok(p && p.keep.map(r=> r.id).join() === 'a' && p.fetch.join() === 'b,c', '1. a changed row and a new row are read again');
  p = B.plan(cache, [{id: 'b', updated_at: 't2'}], 'B1', now);
  ok(p && p.keep.map(r=> r.id).join() === 'b' && !p.fetch.length, '1. a row gone from the server is dropped');
  const many = Array.from({length: B.MAX + 1}, (_, i)=> ({id: 'n' + i, updated_at: 't'}));
  ok(B.plan(cache, many, 'B1', now) === null, `1. more than ${B.MAX} changes: read everything`);
  ok(B.slim({id: 'a', data: {}, deleted: false, deleted_snapshot: {big: 1}, updated_at: 't'}).deleted_snapshot === null && B.slim({id: 'a', deleted: true, deleted_snapshot: {s: 1}}).deleted_snapshot.s === 1,
    '1. a live row is kept without its snapshot; a deleted row keeps it (the Deleted tab restores from it)');
  ok(B.POLL === 5 * 60e3, '1. players poll every 5 minutes');

  // the load against a fake table
  const table = Array.from({length: 30}, (_, i)=> ({id: i < 5 ? '__cfg:map-layout:m' + i : 'card-' + i, data: {v: i}, deleted: i === 7, deleted_snapshot: {snap: i}, updated_at: '2026-11-0' + (1 + i % 9) + 'T00:00:00Z'}));
  const db = fakeDb({card_overrides: table}), ls = fakeStorage();
  const ctx = {localStorage: ls, JSON, Date, Object, Array, Number, String, Error, BUILD_ID: 'B1', sbClient: db, console};
  vm.runInNewContext(between('// NET1_OVR:BEGIN', '// NET1_OVR:END') + '\n' + fnSrc('net1OvrCacheWrite') + '\n' + fnSrc('net1OvrLoadRows') + '\nthis.load = net1OvrLoadRows; this.write = net1OvrCacheWrite;', ctx);
  const byId = rows=> JSON.stringify(rows.slice().sort((a, b)=> a.id < b.id ? -1 : 1).map(r=> [r.id, r.data, r.deleted, r.deleted ? r.deleted_snapshot : null, r.updated_at]));
  (async ()=>{
    let r = await ctx.load();
    ok(db.log.length === 1 && db.log[0].cols.includes('deleted_snapshot') && r.length === 30, '1. first load: one full read');
    const c = JSON.parse(ls.getItem('bw_net1_ovr_cache_v1'));
    ok(c && c.build === 'B1' && Object.keys(c.rows).length === 30 && c.rows['card-8'].deleted_snapshot === null && c.rows['card-7'].deleted_snapshot.snap === 7, '1. the copy is kept (live rows without snapshots)');
    db.log.length = 0; r = await ctx.load();
    ok(db.log.length === 1 && db.log[0].cols === 'id, updated_at' && byId(r) === byId(table), '1. second load: only ids + times are read; the rows applied are the same');
    table[12] = Object.assign({}, table[12], {data: {v: 'new'}, updated_at: '2026-11-12T00:00:00Z'}); table.splice(20, 1); table.push({id: 'card-new', data: {v: 99}, deleted: false, deleted_snapshot: null, updated_at: '2026-11-12T01:00:00Z'});
    db.log.length = 0; r = await ctx.load();
    const inQ = db.log[1] && db.log[1].f.find(f=> f[0] === 'in');
    ok(db.log.length === 2 && inQ && inQ[2].slice().sort().join() === 'card-12,card-new' && byId(r) === byId(table), '1. one row changed, one gone, one new: just those two are read; the result equals a full read');
    db.log.length = 0; r = await ctx.load();
    ok(db.log.length === 1 && byId(r) === byId(table), '1. the updated copy serves the next load');
    ctx.BUILD_ID = 'B2'; db.log.length = 0; r = await ctx.load();
    ok(db.log.length === 1 && db.log[0].cols.includes('deleted_snapshot') && byId(r) === byId(table), '1. a new build reads everything');
    const db2 = fakeDb({card_overrides: table}, {fail: e=> e.cols === 'id, updated_at' ? {message: 'net'} : null}); ctx.sbClient = db2; r = await ctx.load();
    ok(db2.log.length === 2 && byId(r) === byId(table), '1. a failed id read falls back to the full read');
    const bad = {getItem: ()=> null, setItem(){ throw new Error('QuotaExceededError'); }, removeItem(){}}; ctx.localStorage = bad; ctx.sbClient = fakeDb({card_overrides: table}); r = await ctx.load();
    ok(Array.isArray(r) && r.length === table.length, '1. full storage: no copy, the rows still load');
  })().catch(e=>{ ok(false, '1. load threw ' + e.stack); });

  const poll = fnSrc('pollCloudOverrides'), load = fnSrc('loadCloudCardOverrides');
  ok(/if\(!cloudCardAdmin && Date\.now\(\) - net1OvrPolledAt < NET1_OVR_POLL_PLAYER_MS\) return;/.test(poll) && /document\.hidden/.test(poll), '1. the poll: hidden tab never, players every 5 minutes, admins every 30 s');
  ok(/net1OvrCacheWrite\(data, 0, true\)/.test(poll), '1. a poll keeps this device\'s copy up to date');
  ok(/await net1OvrLoadRows\(\)/.test(load) && !/from\('card_overrides'\)/.test(load), '1. the load goes through the copy');
  ok(/setInterval\(pollCloudOverrides, 30000\)/.test(src), '1. the 30 s timer is kept (the admin cadence)');
}

// ======================================================================= 2. raid bars
{
  const R = {}; vm.runInNewContext(between('// NET1_RAID:BEGIN', '// NET1_RAID:END') + '\nthis.since = net1RaidSince; this.merge = net1RaidMerge;', R);
  const now = Date.parse('2026-11-12T10:00:00Z');
  ok(R.since(null, 1, now) === '' && R.since({inst: 2, full: now, maxAt: now, rows: []}, 1, now) === '' && R.since({inst: 1, full: now - 61 * 60e3, maxAt: now, rows: []}, 1, now) === '', '2. nothing held, another instance or an hour-old full read: full read');
  ok(R.since({inst: 1, full: now - 60e3, maxAt: Date.parse('2026-11-12T09:59:31.250Z'), rows: []}, 1, now) === '2026-11-12T09:57:00.000Z', '2. otherwise from 2 minutes before the newest held row, to the minute');
  // property: incremental merges equal a full read, with rows committed late (an older time seen after a newer one)
  let seed = 7; const rnd = ()=>{ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const hex = ()=> Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, '0');
  const table = []; let t = Date.parse('2026-11-12T08:00:00Z'), held = null, okAll = true;
  const fullRead = ()=> table.filter(r=> r.visible).slice().sort((a, b)=> (a.at - b.at) || (a.sid < b.sid ? -1 : 1)).map(r=> ({sid: r.sid, at: r.at, contribution: r.d}));
  for(let step = 0; step < 60; step++){
    const k = Math.floor(rnd() * 5); for(let i = 0; i < k; i++){ t += Math.floor(rnd() * 20e3); table.push({sid: hex() + '-' + step + '-' + i, at: t - (rnd() < 0.2 ? 50e3 : 0), d: i, visible: rnd() > 0.15}); }
    table.forEach(r=>{ if(!r.visible && rnd() < 0.5) r.visible = true; }); // a late commit shows up a step later (within the 2-minute overlap)
    const inc = held ? R.since(held, 1, held.full + 60e3) : '';
    const got = fullRead().filter(r=> !inc || r.at >= Date.parse(inc));
    const local = held && rnd() < 0.3 ? [{at: t, contribution: 5}] : []; // this tab's own unsent copy (no id)
    const rows = inc ? R.merge(held.rows.concat(local), got) : got;
    held = {inst: 1, full: inc ? held.full : t, rows, maxAt: rows.reduce((m, r)=> r.sid && r.at > m ? r.at : m, 0)};
    if(JSON.stringify(rows) !== JSON.stringify(fullRead())){ okAll = false; break; }
  }
  ok(okAll, '2. 60 rounds of random writes (some committed late, some local copies): the merged rows always equal a full read');
  const lr = fnSrc('liveRefreshRaidParts');
  ok(/select\('id, boss_id, owner_id, display_name, damage, fought_at'\)/.test(lr) && /if\(since\) q = q\.gte\('fought_at', since\)/.test(lr) && /net1RaidMerge\(cur\.rows, got\)/.test(lr), '2. liveRefreshRaidParts reads only newer rows after a full read');
  ok(/\.range\(from, from \+ RAID_LIVE_PAGE - 1\)/.test(lr), '2. still paged (RB)');
}

// ======================================================================= 3. card rows
(async ()=>{
  const C = {}; vm.runInNewContext('var cloudUserId = "u1";\n' + between('// NET1_CARDS:BEGIN', '// NET1_CARDS:END') + '\nthis.key = net1CardRowKey; this.serial = net1Serial; this.sent = net1CardSent; this.seed = net1CardSeed; this.setUid = u=> { cloudUserId = u; };', C);
  ok(C.key({level: 2, copies: [{u: 'a', l: 2}]}) === C.key({copies: [{l: 2, u: 'a'}], level: 2}), '3. a row key ignores key order (jsonb sorts keys)');
  ok(C.key({level: 2}) !== C.key({level: 2, copies: null}), '3. a row without the copies column never matches one with it');
  C.seed([{card_id: 'x', level: 1}]); ok(C.sent().get('x') === C.key({level: 1}), '3. the sign-in read seeds what the server holds'); C.setUid('u2'); ok(C.sent().size === 0, '3. another account starts empty');
  // net1Serial: no overlap, a burst becomes at most one more job
  let running = 0, maxRun = 0, jobs = 0; const job = async ()=>{ jobs++; running++; maxRun = Math.max(maxRun, running); await sleep(15); running--; };
  await Promise.all([1, 2, 3, 4, 5, 6].map(()=> C.serial('t', job)));
  ok(jobs === 1, `3. six saves in a burst: one write (${jobs})`);
  jobs = 0; const first = C.serial('t', job); await sleep(5); await Promise.all([first].concat([1, 2, 3].map(()=> C.serial('t', job))));
  ok(jobs === 2 && maxRun === 1, `3. saves while one is on its way: one more write after it (${jobs}), never two at once`);

  // cloudPushCardLevels with the delta, against a fake table
  const mk = (failFirst)=>{
    const tables = {player_card_unlocks: []}; let fails = failFirst || 0;
    const db = fakeDb(tables, {fail: e=> e.op === 'upsert' && fails > 0 ? (fails--, {message: 'network', code: ''}) : null});
    const ctx = {sbClient: db, console, Promise, Set, Map, Array, Object, JSON, Number,
      isSignedIn: ()=> true, cloudSyncSettled: ()=> true, cloudCopiesOf: id=> [{u: id + '-1', l: ctx.myCardLevels[id] || 0}], cloudCopiesColumnMissing: e=> /copies/.test(e.message || ''),
      myUnlockedCardIds: new Set(Array.from({length: 300}, (_, i)=> 'c' + i)), myCardLevels: {}, copyModelReady: true};
    vm.runInNewContext('var cloudUserId = "u1", cloudCopiesColumn = null;\n' + between('// NET1_CARDS:BEGIN', '// NET1_CARDS:END') + '\n' + fnSrc('cloudPushCardLevels') + '\nthis.push = cloudPushCardLevels; this.sent = net1CardSent; this.seed = net1CardSeed; this.col = ()=> cloudCopiesColumn;', ctx);
    return {ctx, db, tables};
  };
  { const {ctx, db} = mk();
    await ctx.push(); const ups = ()=> db.log.filter(e=> e.op === 'upsert');
    ok(ups().length === 1 && ups()[0].rows.length === 300, '3. the first save sends the collection (nothing known yet)');
    ctx.myCardLevels.c7 = 3; await ctx.push();
    ok(ups().length === 2 && ups()[1].rows.length === 1 && ups()[1].rows[0].card_id === 'c7' && ups()[1].rows[0].level === 3, '3. a level-up sends that one row (was the whole collection)');
    await ctx.push(); ok(ups().length === 2, '3. nothing changed: nothing sent');
    ctx.myCardLevels.c1 = 2; ctx.myUnlockedCardIds.add('c-new');
    await Promise.all([ctx.push(), ctx.push(), ctx.push(), ctx.push()]);
    ok(ups().length === 3 && ups()[2].rows.map(r=> r.card_id).sort().join() === 'c-new,c1', '3. a burst of four saves: one write with both changes'); }
  { const {ctx, db} = mk(1);
    ctx.seed(Array.from({length: 300}, (_, i)=> ({card_id: 'c' + i, level: 0, copies: [{u: 'c' + i + '-1', l: 0}]})));
    ctx.myCardLevels.c3 = 2; await ctx.push(); ctx.myCardLevels.c4 = 2; await ctx.push();
    const ups = db.log.filter(e=> e.op === 'upsert');
    ok(ups.length === 2 && ups[0].rows.length === 1 && ups[1].rows.map(r=> r.card_id).sort().join() === 'c3,c4', '3. seeded from the sign-in read: a failed write is sent again with the next one'); }
  { const {ctx, db} = mk(); const orig = db.from; let first = true;
    ctx.sbClient = {from: t=>{ const q = orig(t); const up = q.upsert; q.upsert = rows=>{ if(first && rows[0] && 'copies' in rows[0]){ first = false; return {then: r=> Promise.resolve({error: {message: 'column copies does not exist'}}).then(r)}; } return up(rows); }; return q; }};
    await ctx.push();
    const ups = db.log.filter(e=> e.op === 'upsert');
    ok(ctx.col() === false && ups.length === 1 && ups[0].rows.length === 300 && !('copies' in ups[0].rows[0]), '3. no copies column yet: the rows go again without it (NF fallback kept, no deadlock)'); }
  const push = fnSrc('cloudPushCardLevels'), pull = fnSrc('cloudPullState');
  ok(/typeof net1Serial === 'function'/.test(push) && /typeof net1CardSent === 'function'/.test(push), '3. the push still runs alone (tests that load it without NET1 get the old full write)');
  ok(/net1CardSeed\(unlocks\)/.test(pull), '3. the sign-in read seeds what the server holds');
  ok(/net1CardSent\(\)\.delete\(id\); \/\* NET1/.test(src), '3. the market\'s "you do not own this card" retry sends that row again');
})().catch(e=> ok(false, '3. threw ' + e.stack));

// ======================================================================= 4. social
{
  ok(!/channel\('bw-online'/.test(src) && !/\.track\(\{at:/.test(src), '4. no global presence channel (its messages grew with the square of the players online)');
  const init = fnSrc('socialInit');
  ok(/channel\('bw-me-'\+cloudUserId\)/.test(init) && (init.match(/\.on\('postgres_changes'/g) || []).length === 5 && !/bw-invites-/.test(init) && !/bw-friends-/.test(init), '4. one channel carries friend requests and invites (5 listeners)');
  ok(/document\.hidden\) return; Social\.beatAt = Date\.now\(\)/.test(init) && /setInterval\(beat, 120000\)/.test(init), '4. the heartbeat only while the game is on screen, every 2 minutes');
  ok(/Social\.beat\(\)/.test(src) && /Date\.now\(\) - \(Social\.beatAt \|\| 0\) >= 120000/.test(src), '4. coming back to the tab sends a heartbeat when one is due');
  const S = {UI17_ONLINE_MIN: 5}; vm.runInNewContext(fnSrc('net1OnlineFromSeen') + '\nthis.f = net1OnlineFromSeen;', S);
  const now = Date.parse('2026-11-12T10:00:00Z');
  const on = S.f([{id: 'a', last_seen_at: '2026-11-12T09:56:00Z'}, {id: 'b', last_seen_at: '2026-11-12T09:54:00Z'}, {id: 'c', last_seen_at: null}, null], now);
  ok(on.has('a') && !on.has('b') && !on.has('c') && on.size === 1, '4. online = seen in the last 5 minutes');
  const rf = fnSrc('net1RefreshFriendsSeen');
  ok(/Date\.now\(\) - \(Social\.seenAt \|\| 0\) < 60000/.test(rf) && /select\('id, last_seen_at'\)\.in\('id', ids\.slice\(i, i \+ 100\)\)/.test(rf), '4. friends\' last seen: at most once a minute, 100 ids a request');
  ok(/Social\.online = net1OnlineFromSeen/.test(fnSrc('socialRefresh')), '4. the friends list works out who is online from what it read');
}

// ======================================================================= 5. timers
{
  ok(/document\.hidden && Date\.now\(\) - net1WorldCheckAt < 9\*60\*1000\) return;/.test(fnSrc('net1WorldCheck')) && /setInterval\(net1WorldCheck, 3\*60\*1000\)/.test(src), '5. the 3-minute world check runs every 9 minutes in a hidden tab (inside the 10-minute "there when it fell")');
  ok(/Math\.floor\(\(Date\.now\(\) - 24\*3600\*1000\) \/ 3600e3\) \* 3600e3/.test(fnSrc('checkWorldEvents')), '5. the world_events cut-off is to the hour (the same request repeats)');
  ok(/if\(Date\.now\(\) - \(LiveData\.progressPushAt \|\| 0\) < 60000\) return; livePushProgress\(false\)/.test(src) && /LiveData\.progressPushAt = now/.test(fnSrc('livePushProgress')), '5. the progress tick sends at most once a minute');
  ok(/if\(document\.hidden\) livePushProgress\(false\)/.test(src) && /addEventListener\('pagehide', \(\)=>\{ try\{ livePushProgress\(false\)/.test(src), '5. hiding or closing the tab sends at once');
  ok(/Date\.now\(\) - \(pollLiveQueue\.startedAt \|\| 0\) > 30000 \? 4000 : 2200/.test(fnSrc('pollLiveQueue')), '5. the ranked queue asks every 2.2 s, then every 4 s after 30 s');
}

// ======================================================================= 6. config, SQL, docs
{
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const a = v.headers.filter(h=> h.source === '/assets/(.*)');
  const imm = a.find(h=> (h.has || []).some(x=> x.type === 'query' && x.key === 'v')), week = a.find(h=> (h.missing || []).some(x=> x.type === 'query' && x.key === 'v'));
  ok(imm && /max-age=31536000, immutable/.test(imm.headers[0].value) && week && /max-age=604800/.test(week.headers[0].value) && a.length === 2, '6. vercel.json: hashed assets (?v=) a year immutable; the rest 7 days');
  ok(/connect-src 'self' https:\/\/xjctfwobcsyiztecutrb\.supabase\.co wss:\/\/xjctfwobcsyiztecutrb\.supabase\.co/.test(JSON.stringify(v)), '6. the CSP is unchanged (no new origin)');
  const sqlP = path.join(ROOT, 'supabase', 'proposed', '20261112_net1_scale.sql'), sql = fs.existsSync(sqlP) ? fs.readFileSync(sqlP, 'utf8') : '';
  // 2026-11-13: the owner said "NET1-1: Apply it" (11-12 23:22) and it was applied; the file records that and stays idempotent
  ok(/APPLIED 2026-11-12 .*"NET1-1: Apply it"/.test(sql) && /Idempotent/.test(sql), '6. the SQL was applied on the owner\'s "apply it" (recorded in the file)');
  ['card_overrides_updated_at_idx', 'raid_week_attempts_cycle_time', 'friendships_requester_idx', 'card_overrides_touch', 'set search_path = \'\''].forEach(k=> ok(sql.includes(k), '6. the SQL has ' + k));
  const alters = (sql.match(/^alter policy/gm) || []).length; ok(alters >= 19 && !/^alter policy[^\n]*[^(]auth\.uid\(\)/m.test(sql.replace(/\(select auth\.uid\(\)\)/g, '')), `6. ${alters} policies call auth.uid() once per query`);
  ok(!/^\s*(delete|update|insert|truncate)\b/im.test(sql), '6. the SQL changes no rows');
  ok(fs.existsSync(path.join(ROOT, 'supabase', 'proposed', '20261112_net1_README.md')), '6. the README');
  const docP = path.join(ROOT, 'docs', 'network-scale-plan-2026-11-12.md'), doc = fs.existsSync(docP) ? fs.readFileSync(docP, 'utf8') : '';
  const words = doc.split(/\s+/).filter(Boolean).length;
  ok(doc && words < 600, `6. the plan doc is under 600 words (${words})`);
  ok(/10,000/.test(doc) && /first limit/i.test(doc) && /apply it/.test(doc), '6. the plan names the 10,000 model, the first limit and the owner\'s calls');
  // 2026-11-12: later packages of the batch push the entry down, so the check reads the newest 20k characters
  ok(/NET1/.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8').slice(0, 60000)), '6. a CHANGELOG entry near the top'); // 2026-11-13 (PERF5): the night's entries sit above it (it was at 33 kB)
}

setTimeout(()=>{ console.log(`net1-2026-11-12: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, 1500);
