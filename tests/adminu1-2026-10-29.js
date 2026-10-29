#!/usr/bin/env node
// Package ADMINU1 (2026-10-29; owner 10-28 23:35 "view users and their levels / has anyone played" and 10-29 19:14 "Do we have the admin tab to view the user list?").
// Static checks: the proposed SQL (security definer, the app_admins check, revoke from anon / public, no email or auth columns, never applied by this package),
// the UI entry is admin-mode only, the overlay code, the texts are TX keys with a row in all 12 packs. The browser run (overlay rows from a stubbed rpc, sort, search,
// the missing-function / not-admin / offline messages, shots at 1366 and 390) is tests/e2e/adminu1_2026_10_29.py, started from here.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const sql = rd('supabase/proposed/20261029_admin_user_list.sql'), code = sql.split('\n').filter(l=> !/^\s*--/.test(l)).join('\n');
ok(fs.existsSync(path.join(ROOT, 'supabase/proposed/20261029_admin_user_list.sql')), '1. the SQL is in supabase/proposed/');
ok(!fs.existsSync(path.join(ROOT, 'supabase/migrations/20261029_admin_user_list.sql')), '1. it is not among the applied migrations');
ok(/create or replace function public\.admin_user_list\(\)/i.test(code), '1. defines public.admin_user_list()');
ok(/security definer/i.test(code) && /set search_path\s*=\s*public/i.test(code), '1. security definer with search_path = public');
ok(/from public\.app_admins a where a\.user_id = \(select auth\.uid\(\)\)/i.test(code) && /raise exception 'not allowed' using errcode = '42501'/i.test(code), '1. raises unless the caller is in app_admins');
ok(/revoke all on function public\.admin_user_list\(\) from public, anon;/i.test(code) && /grant execute on function public\.admin_user_list\(\) to authenticated;/i.test(code), '1. revoked from public and anon, granted to authenticated');
ok(/drop function public\.admin_user_list\(\)/i.test(sql.split('\n').slice(0, 14).join('\n')) && /^-- PROPOSED, NOT APPLIED \(2026-10-29/.test(sql), '1. header: date, purpose, rollback (drop function)');
ok(!/\bemail\b|auth\.users|raw_user_meta|phone|encrypted_password|\bidentities\b/i.test(code), '1. no email or auth columns are read');
{ const ret = code.slice(code.indexOf('returns table('), code.indexOf(')\nlanguage')); const cols = ['id', 'display_name', 'created_at', 'last_seen_at', 'rating', 'is_admin', 'cards', 'fights', 'last_fight_at', 'matches'];
  ok(cols.every(c=> new RegExp('\\b' + c + '\\b').test(ret)), '1. returns the listed columns (id, display_name, created_at, last_seen_at, rating, is_admin, cards, fights, last_fight_at, matches)');
  ok(/xp numeric/.test(ret) && /maps_cleared text\[\]/.test(ret) && /gold numeric/.test(ret), '1. plus xp, maps_cleared and gold from the progress blob'); }
ok(/pp\.data->>'bramblewood_player_xp_v1'/.test(code) && /pp\.data->>'bramblewood_conquest_progress_v1'/.test(code) && /_admin_safe_jsonb/.test(code), '1. progress keys read defensively (->> and a safe jsonb cast)');
ok(!/\b(insert|update|delete|truncate|alter|drop)\b\s+(into|table|from)?/i.test(code.replace(/-- .*/g, '').replace(/exception when others then return null;/i, '')) || !/\b(insert into|update public|delete from|truncate|alter table|drop table)\b/i.test(code), '1. the function only reads');
// the keys the game saves in the blob
const app = rd('arena_app.js');
ok(/const PROGRESS_KEYS = \[[^\]]*'bramblewood_player_xp_v1'[^\]]*'bramblewood_conquest_progress_v1'|const PROGRESS_KEYS = \[[^\]]*'bramblewood_conquest_progress_v1'[^\]]*'bramblewood_player_xp_v1'/s.test(app), '2. the two blob keys the SQL reads are in PROGRESS_KEYS');
// UI entry
ok(/\$\{adminModeEnabled \? `<button type="button" class="btn small primary" id="adminUserListBtn">/.test(app), '3. the Players button is rendered only with Admin Mode on');
ok(/function openAdminUserList\(\)\{\s*if\(!adminAllowed\(\) \|\| !adminModeEnabled\) return null;/.test(app.replace(/async function/, 'function')), '3. openAdminUserList() refuses unless adminAllowed() and Admin Mode');
ok(/sbClient\.rpc\('admin_user_list'\)/.test(app) && /ADMINU1_COLS/.test(app) && /data-k=/.test(app) && /adminu1-search/.test(app) && /ui\.adminu1-count/.test(app), '3. calls rpc admin_user_list; sortable columns, search and a count');
// the pure helpers, run on the real source
{ const g = n=>{ const i = app.indexOf('function ' + n + '('); return app.slice(i, app.indexOf('\nfunction ', i + 10)); };
  const env = new Function('levelFromXp', 'CONQUEST_MAPS', 'TX', g('adminu1Level') + '\n' + g('adminu1Map') + '\n' + g('adminu1ErrorText') + '\nreturn {adminu1Level, adminu1Map, adminu1ErrorText};');
  const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  const f = env(xp=> ({level: 1 + Math.floor(xp/100)}), [{id: 'm1', name: 'A', icon: 'x'}, {id: 'm2', name: 'B', icon: 'y'}, {id: 'mx', name: 'Side', icon: 'z'}], (k, p)=> k + JSON.stringify(p || {}));
  ok(f.adminu1Level({tutorial_done: false, xp: 900}) === 0 && f.adminu1Level({tutorial_done: true, xp: 250}) === 3 && f.adminu1Level({xp: null}) === null, '4. level: 0 before the tutorial, from xp after, null when unknown');
  ok(f.adminu1Map({maps_cleared: ['m1', 'm2']}).label === 'y B' && f.adminu1Map({maps_cleared: null}).idx === -1, '4. highest map is the last cleared one in the game\'s map order');
  ok(/missing/.test(f.adminu1ErrorText({code: 'PGRST202', message: 'Could not find the function'})) && /denied/.test(f.adminu1ErrorText({code: '42501', message: 'not allowed'})) && /error/.test(f.adminu1ErrorText(new Error('Failed to fetch'))), '4. error text: missing function, not admin, anything else'); }
// texts
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  const keys = [...new Set([...app.matchAll(/'(ui\.adminu1-[a-z-]+)'/g)].map(m=> m[1]).concat(['c-name', 'c-level', 'c-map', 'c-cards', 'c-fights', 'c-seen', 'c-created'].map(k=> 'ui.adminu1-' + k)))];
  ok(keys.length >= 24 && keys.every(k=> T[k]), '5. every ui.adminu1-* key used exists in bramblewood-texts.js (' + keys.length + ')');
  ok(/supabase\/proposed\/20261029_admin_user_list\.sql/.test(T['ui.adminu1-missing']) && /apply it/.test(T['ui.adminu1-missing']), '5. the missing-function text names the SQL file and "apply it"');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const ph = s=> (String(s).match(/\{\w+\}/g) || []).sort().join();
  ok(codes.every(c=>{ const p = JSON.parse(rd('lang/' + c + '.json')); return keys.every(k=> p[T[k]] && ph(p[T[k]]) === ph(T[k])); }), '5. each key has a row in all 12 language packs, placeholders kept'); }
ok(/tests\/adminu1-2026-10-29\.js|adminu1-2026-10-29\.js/.test(rd('tests/run-all.sh')), '6. registered in tests/run-all.sh');
// browser run
if(!process.argv.includes('--no-browser')){
  const r = cp.spawnSync('python3', [path.join(__dirname, 'e2e', 'adminu1_2026_10_29.py')], {cwd: ROOT, encoding: 'utf8', timeout: 240000});
  const out = (r.stdout || '') + (r.stderr || '');
  ok(r.status === 0 && /all passed/.test(out), '7. browser run (stubbed rpc, 1366 and 390): ' + (r.status === 0 ? 'all passed' : out.split('\n').filter(l=> /FAIL|Error/.test(l)).slice(0, 4).join(' | ')));
}
console.log(`adminu1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
