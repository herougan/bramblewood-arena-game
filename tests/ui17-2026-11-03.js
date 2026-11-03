#!/usr/bin/env node
// 2026-11-03 (package UI17, owner 18:37 + 18:40): checks, without a browser:
//   1. UI17_FULL_RESET: the local wipe (a seeded new-player-to-be save: progress, tutorials, coach tips, faction, decks, currencies, Codex,
//      name, looks, Energy upgrades go; Admin Mode, device settings, language, editor content and the sign-in token stay; infinite Energy on)
//      and the cloud reset against a fake Supabase (unlocks, decks, match history deleted; currencies, name and the progress blob replaced,
//      the blob with the admin-reset marker)
//   2. infinite Energy: only with Admin Mode and adminAllowed(); nothing spent or saved; every reset keeps the switch
//   3. UI17_OVERVIEW: the cut-off times, the tiles (needs SQL until admin_overview exists), the counting fetch
//   4. Buy again and the first set's map (Map 8, was 9); the texts in 12 packs; the proposed SQL; the CSS
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('no block ' + a); return src.slice(i, j + b.length); };
const fn = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = re=>{ const m = re.exec(src); if(!m) throw new Error('no line ' + re); return m[0]; };
const storage = init=>{ const m = new Map(Object.entries(init || {})); return {get length(){ return m.size; }, key: i=> [...m.keys()][i] ?? null, getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), clear: ()=> m.clear(), _m: m}; };

// ---------------------------------------------------------------- 1. the full reset
const ctx = {};
vm.runInNewContext([lineOf(/const DEVICE_SETTING_KEYS = .*;/), lineOf(/const PROGRESS_SHRINK_OK_KEY = '[^']+';/), lineOf(/const ADMIN_MODE_KEY = '[^']+';/),
  lineOf(/const UI17_INF_ENERGY_KEY = .*;/), between('// UI17_FULL_RESET:BEGIN', '// UI17_FULL_RESET:END'),
  'this.ui17LocalReset = ui17LocalReset; this.ui17CloudReset = ui17CloudReset; this.ui17ResetKeys = ui17ResetKeys; this.NEW = UI17_NEW_CURRENCIES;'].join('\n'), ctx);
const GONE = {
  'bramblewood_conquest_progress_v1': '{"completed":["m1:1-1"]}', 'bramblewood_arena_tutorial_done': '1', 'bramblewood_arena_tutorial_stage': '6', 'bramblewood_tutorial2_done_v1': '1',
  'bramblewood_tutorial_progress_v1': '{}', 'bramblewood_coach_seen': '["swap"]', 'bramblewood_arena_faction': 'otters', 'bramblewood_arena_decks': '[]', 'bramblewood_arena_currencies': '{"gold":9999}',
  'bramblewood_arena_seen': '["a"]', 'bramblewood_arena_discovered': '["a"]', 'bramblewood_arena_profile': '{"name":"Hero"}', 'bramblewood_name_chosen_v1': '1', 'bramblewood_avatar': '{}',
  'bramblewood_arena_energy_v1': '{"current":3}', 'bramblewood_energy_nest_v2': '2', 'bramblewood_player_xp_v1': '{"xp":900}', 'bramblewood_unlocks_v1': '{}', 'bramblewood_tut_map_opened_v1': '1', 'bw_pending_map_reset': '{}'};
const KEPT = {
  'bramblewood_arena_adminmode': '1', 'bramblewood_arena_devmode': '1', 'bw_musicVolume': '0.4', 'bw_sfxVolume': '0.5', 'bramblewood_fx_level': 'high', 'bramblewood_lang_v1': 'fr',
  'bramblewood_arena_card_overlay': '{}', 'bramblewood_node_edits_v1': '{}', 'bramblewood_dialogue_edits_v1': '{}', 'bramblewood_tutorial_cfg_v2': '{}', 'bramblewood_test_rules_v1': '{}',
  'sb-xjctfwobcsyiztecutrb-auth-token': '{"t":1}', 'other_site_key': 'x'};
const ls = storage(Object.assign({}, GONE, KEPT)), ss = storage({'bramblewood_seen_splash': '1'});
const gone = ctx.ui17LocalReset(ls, ss, {adminMode: true, note: 'ok'});
Object.keys(GONE).forEach(k=> ok(ls.getItem(k) === null, `the full reset clears ${k}`));
Object.keys(KEPT).forEach(k=> ok(ls.getItem(k) === KEPT[k], `the full reset keeps ${k}`));
ok(gone.length === Object.keys(GONE).length, `it removed exactly the progress keys (${gone.length})`);
ok(ss._m.size === 0, 'this tab\'s session flags go too (the splash and faction picker come back)');
ok(ls.getItem('bw_progress_shrink_ok') === '1', 'the emptier blob may replace the cloud once');
ok(ls.getItem('bramblewood_arena_admin_infenergy') === '1', 'infinite Energy is on after it');
ok(ls.getItem('bramblewood_arena_adminmode') === '1' && ls.getItem('bw_ui17_reset_note') === 'ok', 'Admin Mode stays on; the note for the toast is left');
// a second reset keeps the switch (it was a kept key)
const ls2 = storage({'bramblewood_arena_admin_infenergy': '1', 'bramblewood_arena_faction': 'birds'}); ctx.ui17LocalReset(ls2, null, {});
ok(ls2.getItem('bramblewood_arena_admin_infenergy') === '1' && ls2.getItem('bramblewood_arena_faction') === null, 'the switch survives a reset; the faction does not');
// the existing resets keep the switch too
const RK = new RegExp(/const RESET_KEEP = (\/.*\/);/.exec(src)[1].slice(1, -1));
ok(RK.test('bramblewood_arena_admin_infenergy') && RK.test('bramblewood_arena_adminmode'), 'Reset all / Reset to Map keep infinite Energy (RESET_KEEP)');
ok(!/'bramblewood_arena_admin_infenergy'/.test(/const ADMIN_RESET_LOCAL_KEYS = \[[\s\S]*?\];/.exec(src)[0]), '"Reset my progress" does not list it');

// the cloud part, against a fake client
(async ()=>{
  const calls = [];
  const client = {from: t=>{ const q = {t, op: null, body: null, eq: []};
    const api = {delete(){ q.op = 'delete'; return api; }, update(b){ q.op = 'update'; q.body = b; return api; }, eq(c, v){ q.eq.push([c, v]); return api; },
      then(res, rej){ calls.push(q); const err = q.t === 'player_currencies' && q.body && ('blossoms' in q.body || 'raid_shards' in q.body) ? {code: 'PGRST204', message: 'no column'} : null; return Promise.resolve({error: err}).then(res, rej); }};
    return api; }};
  const failed = await ctx.ui17CloudReset(client, 'u1');
  const find = (t, op)=> calls.find(c=> c.t === t && c.op === op);
  ok(failed.length === 0, `no core row refused (${failed})`);
  ['player_card_unlocks', 'player_decks', 'match_history'].forEach(t=> ok(find(t, 'delete') && find(t, 'delete').eq[0][1] === 'u1', `${t} rows of this account are deleted`));
  const cur = find('player_currencies', 'update'); ok(cur && cur.body.gold === 200 && cur.body.gems === 20 && cur.body.dust === 60 && cur.body.metal === 0 && cur.body.raid_points === 5, 'currencies go back to a new player\'s (no delete policy on that table)');
  const pr = find('profiles', 'update'); ok(pr && pr.body.display_name === 'Woodland Warrior' && pr.eq[0][0] === 'id', 'the name goes back to the placeholder (the name prompt comes back)');
  const pp = find('player_progress', 'update'); ok(pp && JSON.stringify(pp.body.data) === '{"bw_progress_shrink_ok":"1"}', 'the progress blob is replaced by an empty one with the admin-reset marker (the server guard backs up the old one)');
  ok(!calls.some(c=> c.op === 'delete' && c.t === 'profiles'), 'profiles is never deleted (no delete policy; it would cascade to friends and guilds)');
  const bad = {from: t=>{ const api = {delete(){ return api; }, update(){ return api; }, eq(){ return api; }, then(res){ return Promise.resolve({error: t === 'player_decks' ? {message: 'nope'} : null}).then(res); }}; return api; }};
  ok(JSON.stringify(await ctx.ui17CloudReset(bad, 'u1')) === '["player_decks"]', 'a refused row is named (the toast lists it)');
  ok(JSON.stringify(await ctx.ui17CloudReset(null, 'u1')) === '[]', 'a guest has nothing in the cloud to reset');

  // ---------------------------------------------------------------- 2. infinite Energy
  const E = {adminModeEnabled: false, allowed: false, store: storage({'bramblewood_arena_energy_v1': JSON.stringify({current: 4, lastRegenAt: Date.now()})}), hud: 0};
  vm.runInNewContext(['var localStorage = E.store; var adminModeEnabled; function adminAllowed(){ return E.allowed; } const ENERGY_KEY = "bramblewood_arena_energy_v1"; const ENERGY_REGEN_MS = 300000;',
    'function energyMax(){ return 20; } function refreshEnergyHud(){ E.hud++; } function refreshEnergyButtons(){} function fxHook(){} function idleSweepTarget(){ return null; } function autoTier(){ return false; } function TX(k){ return k; } function escapeAttr(s){ return s; }',
    fn('loadEnergyState'), fn('saveEnergyState'), lineOf(/const UI17_INF_ENERGY_KEY = .*;/), fn('ui17InfEnergyStored'), fn('ui17InfiniteEnergy'), fn('ui17SetInfiniteEnergy'), fn('settleEnergy'), fn('currentEnergy'), fn('spendEnergy'),
    'this.go = { set: (a, b)=>{ adminModeEnabled = a; E.allowed = b; }, cur: currentEnergy, spend: spendEnergy, setInf: ui17SetInfiniteEnergy, inf: ui17InfiniteEnergy, settle: settleEnergy, save: saveEnergyState };'].join('\n'), Object.assign(E, {E}));
  const g = E.go;
  g.set(false, false); ok(g.setInf(true) === false && !g.inf(), 'a non-admin cannot switch it on');
  E.store.setItem('bramblewood_arena_admin_infenergy', '1');
  ok(!g.inf() && g.cur() === 4, 'a key set by hand does nothing without an admin account and Admin Mode');
  g.set(false, true); ok(!g.inf(), 'an admin account with Admin Mode off: no infinite Energy');
  g.set(true, true); ok(g.inf() && g.cur() >= 999, 'Admin Mode on, admin account: infinite');
  ok(g.spend(50) === true && g.spend(500) === true, 'any fight can be paid');
  g.save(g.settle()); ok(JSON.parse(E.store.getItem('bramblewood_arena_energy_v1')).current === 4, 'nothing is spent or saved while it is on');
  g.setInf(false); ok(!g.inf() && g.cur() === 4 && g.spend(3) && g.cur() === 1, 'off again: the stored Energy is as it was and spends normally');
  const hud = fn('refreshEnergyHud'); ok(/s\.ui17Inf \?/.test(hud) && /∞/.test(hud), 'the Energy pill shows ∞');
  ok(/id="epInfinite"/.test(fn('openEnergyPanel')) && /id="ui17InfEnergyChk"/.test(fn('renderAdmin')), 'the switch is in the Energy panel and in Admin -> Energy');

  // ---------------------------------------------------------------- 3. the overview
  const O = {};
  vm.runInNewContext(['function TX(k, v){ return O.realTX(k, v); } function escapeHtml(s){ return String(s); } function escapeAttr(s){ return String(s); }',
    between('// UI17_OVERVIEW:BEGIN', '// UI17_OVERVIEW:END'),
    'this.since = ui17OverviewSince; this.tiles = ui17OverviewTiles; this.html = ui17OverviewHTML; this.needs = ui17NeedsSql; this.net = ui17Net; this.cfetch = ui17CountingFetch; this.load = ui17LoadOverview;'].join('\n'),
    Object.assign(O, {O, realTX: TX, fetch: async u=> ({status: /bad/.test(u) ? 500 : 200, ok: !/bad/.test(u), headers: {get: ()=> 'sin1::abc'}, json: async ()=> ({build: 'live123'})}), performance: {now: ()=> Date.now()}, URL, BUILD_ID: 'abc123', globalThis: {}}));
  const now = Date.parse('2026-11-03T12:00:00Z'), s = O.since(now);
  ok(Date.parse(s.online) === now - 5 * 60000 && Date.parse(s.hour) === now - 3600e3 && Date.parse(s.week) === now - 7 * 86400e3, 'online is the last 5 min; hour, day and week cut-offs');
  ok(new Date(s.today).getHours() === 0 && Date.parse(s.today) <= now, 'new today counts from local midnight');
  const t1 = O.tiles({online: 2, hour: 3, day: 4, week: 5, total: 9, today: 1, raids: 0, server: 'sql'});
  ok(t1.length === 10 && t1.map(x=> x[0]).join() === 'online,hour,day,week,total,today,fights,matches,raids,conns', 'ten tiles, in order');
  ok(t1.filter(x=> x[2] === 'sql').map(x=> x[0]).join() === 'fights,matches,conns', 'fights, matches and connections say "needs SQL" until admin_overview exists');
  const t2 = O.tiles({online: 2, server: {fights_1h: 7, matches_1h: 1, db_connections: 10, db_size_mb: 32}});
  ok(t2.find(x=> x[0] === 'fights')[2] === 7 && t2.find(x=> x[0] === 'conns')[2] === 10 && /32/.test(t2.find(x=> x[0] === 'conns')[3]), 'once applied, the server numbers fill them');
  ok(O.needs({code: 'PGRST202', message: 'Could not find the function'}) && !O.needs({code: '42501', message: 'not allowed'}), 'a missing function reads as "needs SQL", a refusal does not');
  const h = O.html({online: 1, server: 'sql', ping: 120, site: 80, edge: 'sin1', build: 'abc123', liveBuild: 'def456', net: {req: 10, err: 2, last: {status: 500, path: '/rest/v1/profiles'}}, at: now});
  ok(/needs SQL/.test(h) && /Supabase 120 ms/.test(h) && /2 request errors of 10/.test(h) && /500 profiles/.test(h) && /Site 80 ms · sin1/.test(h) && /live is def456/.test(h) && /is-bad/.test(h) && /data-ov-refresh/.test(h), 'the health line: ping, errors with the last one, site and edge, build vs live, a refresh button');
  ok(/is-ok/.test(O.html({ping: 50, net: {req: 3, err: 0}})), 'no errors and a ping: healthy');
  const n0 = O.net().err; await O.cfetch('https://x.supabase.co/rest/v1/bad'); await O.cfetch('https://x.supabase.co/rest/v1/good');
  ok(O.net().err === n0 + 1 && O.net().req >= 2 && O.net().last.status === 500, 'the counting fetch counts errors and keeps the last');
  // the loader, with a fake client whose rpc is missing
  const cnt = {profiles: 4, raid_week_attempts: 0};
  const client2 = {from: t=>{ const q = {t, filters: []}; const api = {select(){ return api; }, gte(c, v){ q.filters.push(c); return api; }, limit(){ return api; },
      then(res){ return Promise.resolve({error: null, count: cnt[t] - q.filters.length, data: []}).then(res); }}; return api; },
    rpc: async ()=> ({error: {code: 'PGRST202', message: 'Could not find the function public.admin_overview'}})};
  const d = await O.load(client2);
  ok(d.total === 4 && d.online === 3 && d.week === 3 && d.raids === -1, 'the counts come from head counts on profiles / raid_week_attempts (the fake counts one less per filter)');
  ok(d.server === 'sql' && d.ping >= 0 && d.site >= 0 && d.liveBuild === 'live123' && d.edge === 'sin1' && d.build === 'abc123', 'server "needs SQL"; ping, site, edge and live build read');
  const ua = fn('openAdminUserList'); ok(/class="ui17-ov"/.test(ua) && /ui17StartOverview\(ov\)/.test(ua), 'the overview sits at the top of Admin -> Players');
  const so = fn('ui17StartOverview'); ok(/setInterval/.test(so) && /UI17_OV_REFRESH_MS/.test(so) && /isConnected/.test(so) && /document\.hidden/.test(so), 'auto-refresh while open (stops when closed, waits while hidden)');
  ok(/createClient\(SUPABASE_URL, SUPABASE_ANON_KEY, \{global: \{fetch: \(\.\.\.a\)=> ui17CountingFetch\(\.\.\.a\)\}\}\)/.test(src), 'the Supabase client counts its requests');

  // ---------------------------------------------------------------- 4. Buy again, the first set, texts, SQL, CSS
  const bp = fn('buyPack'); ok(/buyAgain: wander \|\| !opened\.length \? null : \{packId: pack\.id, qty\}/.test(bp), 'a bought pack (not the merchant\'s deal) offers Buy again');
  const st = fn('ui17BuyAgainState'); ok(/canAffordPacks\(pack, qty\)/.test(st) && /packOnSale\(pack\)/.test(st) && /mysteryPacksLeft\(\)/.test(st), 'Buy again checks the price, the sale and the Mystery limit');
  const bh = fn('ui17BuyAgainHTML'); ok(/btnCostHTML/.test(bh) && /disabled aria-disabled="true"/.test(bh), 'it shows the price, and is disabled when you can\'t pay');
  const po = fn('openPackAnimation'); ok(/ui17BuyAgainHTML\(opts\.buyAgain\)/.test(po) && /close\(\); buyPack\(st\.pack\.id, null, st\.qty\)/.test(po), 'the last summary has it; it closes and runs the normal purchase');
  ok(/const PACK_QTY_TIERS = \[\[10, 8\], \[25, 14\]/.test(src) && /playerMapReach\(\) >= PACK_QTY_TIERS\[0\]\[1\]/.test(fn('shopBundlesOpen')), 'the first set (×10) opens at Map 8 (was 9), the shelves with it');
  const keys = Object.keys(TEXT).filter(k=> k.startsWith('ui.ui17-'));
  ok(keys.length === 49, `49 UI17 texts (${keys.length})`);
  const used = [...src.matchAll(/TX\('(ui\.ui17-[a-z0-9-]+)'/g)].map(m=> m[1]); const miss = [...new Set(used)].filter(k=> !TEXT[k]); ok(!miss.length, `every UI17 key the app reads exists ${miss}`);
  ok(/RESET/.test(TX('ui.ui17-fr-type', {word: 'RESET'})), 'the typed word is filled in');
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
    const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')); const m = keys.map(k=> TEXT[k]).filter(e=> !(e in pack)); ok(!m.length, `${code}: every UI17 text translated ${m.slice(0, 2)}`); }
  const fr = fn('ui17OpenFullReset'); ok(/role="alertdialog"/.test(fr) && /inp\.value\.trim\(\) === 'RESET'/.test(fr) && /disabled aria-disabled="true"/.test(fr) && !/confirm\(/.test(fr), 'the danger modal needs RESET typed (no browser confirm)');
  ok(/id="pfFullReset"/.test(fn('adminProfileToolsHTML')) && /id="ui17FullResetBtn"/.test(fn('renderAdmin')), 'the button is in Profile -> Admin resets and in the Admin tab');
  const sql = fs.readFileSync(path.join(ROOT, 'supabase/proposed/20261103_admin_overview.sql'), 'utf8');
  ok(/PROPOSED, NOT APPLIED/.test(sql) && /is_app_admin\(\)/.test(sql) && /security definer/.test(sql) && /revoke all on function public\.admin_overview\(\) from public, anon/.test(sql) && !/\b(insert|update|delete)\b\s+(into|public\.|from)/i.test(sql), 'admin_overview is proposed, admin-only, read-only');
  ['.ui17-ov{', '.ui17-tiles{', '.ui17-fr-modal{', '#ui17FrGo:not([disabled])', '.ui17-buy-again'].forEach(sel=> ok(css.includes(sel), `CSS has ${sel}`));
  console.log(`ui17: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
