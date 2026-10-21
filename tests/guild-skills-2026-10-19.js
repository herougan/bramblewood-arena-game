#!/usr/bin/env node
// 2026-10-19 (package G, owner 20:45: "Guild skills. Starting with +raid HP to your bramble."): checks that
//   1. the skill math (bramblewood-guild.js): Rooted Walls is 5 levels of +4% bramble Health for 30/60/100/150/220 Seeds, the locked
//      skills do nothing, levels clamp, the stage's % and the guild's % add, Seeds per raid damage, who may upgrade, "not applied";
//   2. raid fights use it: the single-row raid, the three-row raid (raidFull) and the classic trench all build your bramble's Health
//      through guildScaledBramble, and with a live Rooted Walls 3 it is +12% (with the stage's −10%: +2%); the pre-fight panel says
//      "Guild: +12% bramble Health"; the admin's local preview counts only in Admin mode;
//   3. no bonus while the table is missing: loadGuildSkills on "relation does not exist" (PGRST205 / 42P01) is 'missing', the bonus
//      is 0, the Guild tab shows the list as a preview with no upgrade button, and an upgrade says skills aren't switched on;
//   4. supabase/migrations/20261019_guild_skills.sql: RLS on every new table, member-only reads, no write policies, writes revoked,
//      upgrade_guild_skill is SECURITY DEFINER with a pinned search_path, checks owner + creator, locks and spends atomically, the
//      Seeds trigger has a weekly cap and never blocks a raid attempt, costs match bramblewood-guild.js; it is only proposed;
//   5. every new text is a TX key with a translation in all 12 packs;
//   6. the trench tuning at max level (+20% wall): prints the shift against tests/trench.js's population.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const G = require(path.join(ROOT, 'bramblewood-guild.js'));
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) a = src.indexOf('\nasync function ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const constLine = name=> (src.match(new RegExp('^const ' + name + ' = [^\\n]*', 'm')) || [''])[0];

// --- 1. the math
const RW = G.byId('rooted_walls');
ok(RW && !RW.soon && RW.maxLevel === 5 && RW.perLevel === 4 && RW.costs.join() === '30,60,100,150,220', 'Rooted Walls: 5 levels, +4% each, 30/60/100/150/220 Seeds');
ok(G.totalCost('rooted_walls') === 560, 'Rooted Walls costs 560 Seeds in all');
ok(G.nextCost('rooted_walls', 0) === 30 && G.nextCost('rooted_walls', 4) === 220 && G.nextCost('rooted_walls', 5) === null, 'next level costs, none past the top');
ok([0, 1, 3, 5, 9].map(n=> G.effectAt('rooted_walls', n)).join() === '0,4,12,20,20', 'effect per level, clamped at the top');
const soon = G.SKILLS.filter(s=> s.soon);
ok(soon.length >= 4 && soon.length <= 6, `4–6 locked "coming soon" skills (${soon.length})`);
ok(soon.every(s=> G.nextCost(s.id, 0) === null && G.effectAt(s.id, 3) === 0 && !s.costs), 'locked skills cost nothing and do nothing');
ok(G.brambleHpPct({rooted_walls: 3}) === 12 && G.brambleHpPct([{skill: 'rooted_walls', level: 5}]) === 20 && G.brambleHpPct({}) === 0 && G.brambleHpPct(null) === 0, 'bramble Health % from levels (object or rows)');
ok(G.brambleHpPct({rooted_walls: 99}) === 20 && G.brambleHpPct({rooted_walls: -2}) === 0 && G.brambleHpPct({rooted_walls: 'x'}) === 0, 'bad levels clamp');
ok(JSON.stringify(G.normaliseLevels([{skill: 'rooted_walls', level: 2}, {skill: 'sharp_thorns', level: 3}, {skill: 'nope', level: 1}])) === '{"rooted_walls":2}', 'only live, known skills are kept');
ok(G.scaleBramble(100, 0, 20) === 120 && G.scaleBramble(100, -10, 20) === 110 && G.scaleBramble(100, 0, 0) === 100 && G.scaleBramble(97, 0, 12) === 109, 'stage % and guild % add, rounded');
ok(G.scaleBramble(100, -10, 0) === R.scaleCastle(100, -10) && G.scaleBramble(45, 25, 0) === R.scaleCastle(45, 25) && G.scaleBramble(10, -200, 0) === 1, 'without a guild it is exactly RaidM.scaleCastle (floor 1)');
ok(G.seedsForDamage(4200) === 8 && G.seedsForDamage(499) === 0 && G.seedsForDamage(10000) === 20 && G.seedsForDamage(99999) === 20 && G.seedsForDamage(-5) === 0, 'Seeds: 1 per 500 raid damage, at most 20 a fight');
ok(G.SEEDS_PER_DAMAGE === 500 && G.SEED_WEEK_CAP === 250, 'Seed rates');
const guild = {id: 'g1', created_by: 'u-a'};
ok(G.canUpgrade(guild, {profile_id: 'u-a', role: 'owner'}, 'u-a'), 'the founding owner can upgrade');
ok(!G.canUpgrade(guild, {profile_id: 'u-c', role: 'owner'}, 'u-c'), 'an "owner" row that isn\'t the creator (the join hole) cannot');
ok(!G.canUpgrade(guild, {profile_id: 'u-b', role: 'member'}, 'u-b') && !G.canUpgrade(guild, null, 'u-a') && !G.canUpgrade(guild, {profile_id: 'u-a', role: 'owner'}, null), 'members and signed-out players cannot');
ok(G.notAppliedError({code: 'PGRST205', message: "Could not find the table 'public.guild_skill_levels' in the schema cache"}) && G.notAppliedError({code: '42P01', message: 'relation "public.guild_skill_levels" does not exist'})
  && G.notAppliedError({code: 'PGRST202'}) && G.notAppliedError({code: '42883'}), '"not applied" errors');
ok(!G.notAppliedError({code: '42501', message: 'not_owner'}) && !G.notAppliedError(null) && !G.notAppliedError({message: 'network down'}), 'other errors are not "not applied"');

// --- 2 + 3. the app's helpers, with stubs
const store = {};
const mkEnv = (opts)=>{
  opts = opts || {};
  const ls = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const calls = [];
  const sb = opts.sb === null ? null : {
    from: t=> ({select: ()=> ({eq: ()=>{ calls.push(['from', t]); const r = (opts.tables || {})[t] || {data: [], error: null};
      const p = Promise.resolve(r); p.maybeSingle = ()=> Promise.resolve(r); return p; }})}),
    rpc: async (fn, args)=>{ calls.push(['rpc', fn, args]); return opts.rpc ? opts.rpc(fn, args) : {data: null, error: null}; }};
  const body = [constLine('GuildM'), constLine('GUILD_SKILLS_SHOW_SOON'), constLine('GUILD_SKILL_PREVIEW_KEY'), constLine('GUILD_SKILLS_STALE_MS'),
    "let guildSkills = {guildId: null, status: 'idle', levels: {}, seeds: 0, at: 0};",
    ...['resetGuildSkills', 'loadGuildSkills', 'guildSkillPreview', 'setGuildSkillPreview', 'guildRaidLevels', 'guildBrambleHpPct', 'guildRaidBonusText',
      'guildSkillText', 'upgradeGuildSkill', 'guildSkillsPanelHTML', 'guildScaledBramble'].map(fnSrc),
    'return {get state(){ return guildSkills; }, set state(v){ guildSkills = v; }, resetGuildSkills, loadGuildSkills, guildSkillPreview, setGuildSkillPreview, guildRaidLevels, guildBrambleHpPct, guildRaidBonusText, upgradeGuildSkill, guildSkillsPanelHTML, guildScaledBramble};'].join('\n');
  const esc = s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const env = new Function('BramblewoodGuild', 'RaidM', 'localStorage', 'sbClient', 'cloudUserId', 'adminModeEnabled', 'TX', 'escapeHtml', 'escapeAttr', 'netErrorHTML', 'netErrText', 'currentTab', 'renderGuild', body)(
    G, R, ls, sb, opts.uid === undefined ? 'u-a' : opts.uid, !!opts.admin, TX, esc, esc, (what)=> `<div class="net-error">${esc(what)}</div>`, e=> String((e && e.message) || 'oops'), 'guild', ()=>{});
  env.calls = calls; return env;
};
ok(fnSrc('guildScaledBramble') && fnSrc('guildSkillsPanelHTML') && fnSrc('loadGuildSkills') && fnSrc('upgradeGuildSkill'), 'the app has the guild skill helpers');

(async ()=>{
  // live: Rooted Walls 3 -> +12%
  const live = mkEnv({tables: {guild_skill_levels: {data: [{skill: 'rooted_walls', level: 3}], error: null}, guild_seeds: {data: {seeds: 75}, error: null}}});
  await live.loadGuildSkills('g1');
  ok(live.state.status === 'live' && live.state.levels.rooted_walls === 3 && live.state.seeds === 75, 'live: levels and Seeds read from the server tables');
  ok(live.calls.some(c=> c[1] === 'guild_skill_levels') && live.calls.some(c=> c[1] === 'guild_seeds'), 'reads guild_skill_levels and guild_seeds');
  ok(live.guildBrambleHpPct() === 12, `live Rooted Walls 3: +12% (${live.guildBrambleHpPct()})`);
  ok(live.guildScaledBramble(100, 0) === 112 && live.guildScaledBramble(100, -10) === 102 && live.guildScaledBramble(150, 0) === 168, 'raid bramble Health with the bonus (and with the stage\'s −10%)');
  ok(live.guildRaidBonusText() === 'Guild: +12% bramble Health', `pre-fight line (${live.guildRaidBonusText()})`);
  const ownerHTML = live.guildSkillsPanelHTML({id: 'g1', created_by: 'u-a'}, [{profile_id: 'u-a', role: 'owner'}]);
  ok(/data-gskill-up="rooted_walls" data-gskill-from="3"/.test(ownerHTML) && /Upgrade for 150 🌱/.test(ownerHTML), 'the owner sees the upgrade button with the next cost');
  ok(/aria-disabled="true"/.test(ownerHTML.match(/<button[^>]*data-gskill-up[^>]*>/)[0]), 'too few Seeds: the button is marked disabled');
  ok(/75 Guild Seeds/.test(ownerHTML) && /Level 3 of 5/.test(ownerHTML) && /Now: \+12% bramble Health/.test(ownerHTML), 'it shows the Seeds, the level and the effect now');
  ok((ownerHTML.match(/class="gsk is-soon"/g) || []).length === soon.length && /Coming soon/.test(ownerHTML) && !/data-gskill-up="(?!rooted_walls)/.test(ownerHTML), 'the locked skills show as coming soon, with no button');
  const memberHTML = live.guildSkillsPanelHTML({id: 'g1', created_by: 'u-x'}, [{profile_id: 'u-a', role: 'member'}]);
  ok(!/data-gskill-up/.test(memberHTML) && /Next level: 150 🌱/.test(memberHTML) && /Only the guild's owner can buy levels\./.test(memberHTML), 'a member sees the cost but no button');
  ok(!/gsk-admin/.test(memberHTML), 'no admin preview controls outside Admin mode');

  // upgrade paths
  const okUp = mkEnv({rpc: async ()=> ({data: [{level: 4, seeds: 25}], error: null})});
  let r = await okUp.upgradeGuildSkill('g1', 'rooted_walls', 3);
  ok(r.ok && r.level === 4 && r.seeds === 25 && okUp.calls.some(c=> c[0] === 'rpc' && c[1] === 'upgrade_guild_skill' && c[2].p_guild === 'g1' && c[2].p_skill === 'rooted_walls' && c[2].p_from_level === 3), 'upgrade calls upgrade_guild_skill(p_guild, p_skill, p_from_level)');
  r = await mkEnv({rpc: async ()=> ({data: null, error: {code: 'PGRST202', message: 'Could not find the function public.upgrade_guild_skill'}})}).upgradeGuildSkill('g1', 'rooted_walls', 0);
  ok(r.notOn && r.error === TX('net.gskill-not-on'), 'RPC missing: "Guild skills aren\'t switched on yet"');
  r = await mkEnv({rpc: async ()=> ({data: null, error: {code: '42501', message: 'not_owner'}})}).upgradeGuildSkill('g1', 'rooted_walls', 0);
  ok(r.error === TX('net.gskill-not-owner'), 'not the owner');
  r = await mkEnv({rpc: async ()=> ({data: null, error: {code: '22023', message: 'not_enough_seeds'}})}).upgradeGuildSkill('g1', 'rooted_walls', 1);
  ok(r.error === TX('net.gskill-no-seeds', {cost: 60, n: 0}), 'not enough Seeds');
  r = await mkEnv({rpc: async ()=> ({data: null, error: {code: '22023', message: 'level_changed'}})}).upgradeGuildSkill('g1', 'rooted_walls', 1);
  ok(r.stale && r.error === TX('net.gskill-changed'), 'a stale level (double click) is refused');
  r = await mkEnv({sb: null}).upgradeGuildSkill('g1', 'rooted_walls', 1);
  ok(r.error === TX('net.gskill-sign-in'), 'signed out: asked to sign in');

  // 3. not applied: no bonus, a preview
  for(const err of [{code: 'PGRST205', message: "Could not find the table 'public.guild_skill_levels' in the schema cache"}, {code: '42P01', message: 'relation "public.guild_skill_levels" does not exist'}]){
    const miss = mkEnv({tables: {guild_skill_levels: {data: null, error: err}}});
    await miss.loadGuildSkills('g1');
    ok(miss.state.status === 'missing', `${err.code}: status missing`);
    ok(miss.guildBrambleHpPct() === 0 && miss.guildScaledBramble(100, 0) === 100 && miss.guildScaledBramble(100, -10) === 90 && miss.guildRaidBonusText() === '', `${err.code}: raid fights get no guild bonus`);
    const html = miss.guildSkillsPanelHTML({id: 'g1', created_by: 'u-a'}, [{profile_id: 'u-a', role: 'owner'}]);
    ok(html.includes(TX('ui.gskill-preview-note')) && !/data-gskill-up/.test(html) && /Rooted Walls/.test(html) && /Level 0 of 5/.test(html), `${err.code}: the Guild tab shows the list as a preview, no upgrade button`);
  }
  const broken = mkEnv({tables: {guild_skill_levels: {data: null, error: {code: '500', message: 'timeout'}}}});
  await broken.loadGuildSkills('g1');
  ok(broken.state.status === 'error' && broken.guildBrambleHpPct() === 0 && /net-error/.test(broken.guildSkillsPanelHTML({id: 'g1', created_by: 'u-a'}, [])), 'a failed read: an error with Retry, no bonus');
  const out = mkEnv({sb: null}); await out.loadGuildSkills('g1');
  ok(out.guildBrambleHpPct() === 0, 'offline / signed out: no bonus');

  // admin preview: only in Admin mode, instead of the server's levels
  const adm = mkEnv({admin: true}); adm.setGuildSkillPreview({rooted_walls: 5});
  ok(adm.guildBrambleHpPct() === 20 && adm.guildRaidLevels().preview && /admin preview/.test(adm.guildRaidBonusText()), 'Admin mode: the local preview level applies, marked as a preview');
  ok(/gsk-admin/.test(adm.guildSkillsPanelHTML({id: 'g1', created_by: 'u-a'}, [])), 'Admin mode: the preview stepper shows');
  ok(mkEnv({admin: false}).guildBrambleHpPct() === 0, 'the same stored preview does nothing outside Admin mode');
  adm.setGuildSkillPreview(null); ok(adm.guildBrambleHpPct() === 0, 'clearing the preview');

  // the fights build your bramble through guildScaledBramble
  ok(/myCharacter\.health = guildScaledBramble\(myCharacter\.health \|\| 30, f\.castleHpPct\)/.test(fnSrc('startRaidPartMatch')), 'single-row raid: bramble Health with the guild bonus');
  ok(/const myHp = guildScaledBramble\(Math\.max\(merged\.health \|\| brambleHp\(30\), brambleHp\(cfg\.wallHp \|\| 45\) \* 2\), f\.castleHpPct\)/.test( /* BF5: at BRAMBLE_SCALE */fnSrc('buildRaidFullFight') /* 2026-10-19 (package RX): the fight is built there now */), 'raidFull: bramble Health with the guild bonus');
  ok(/cfg\.wallHp = brambleHp\(guildScaledBramble\(cfg\.wallHp, 0\)\)/.test(fnSrc('openTrenchSetup')) /* BF5 */ && /guildRaidBonusText\(\)/.test(fnSrc('openTrenchSetup')), 'classic trench: the wall with the guild bonus, and the line in its setup');
  const panel = fnSrc('raidPanelHTML');
  ok(/guildRaidBonusText\(\)/.test(panel) && /ensureGuildSkillsForRaid\(\)/.test(panel), 'the raid pre-fight panel shows the guild line and fetches the skills');
  ok(/guildSkillsPanelHTML\(myGuild, myGuildMembers\|\|\[\]\)/.test(fnSrc('renderGuild')) && /wireGuildSkills\(root\)/.test(fnSrc('renderGuild')), 'the Guild tab has the Guild skills section');
  ok(/loadGuildSkills\(guild\.id\)/.test(fnSrc('loadMyGuild')) && /resetGuildSkills\(\)/.test(fnSrc('loadMyGuild')), 'loading your guild loads its skills; no guild resets them');
  ok(/bramblewood-guild\.js/.test(fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8')), 'the build includes bramblewood-guild.js');
  const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : '';
  ok(/root\.BramblewoodGuild = api/.test(html), 'the built index.html carries BramblewoodGuild');

  // --- 4. the proposed SQL
  const sqlPath = path.join(ROOT, 'supabase', 'migrations', '20261019_guild_skills.sql');
  const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : '';
  ok(/^-- APPLIED 2026-10-19/.test(sql), 'the SQL is marked APPLIED (owner "apply it", 2026-10-19)');
  ok(!fs.existsSync(path.join(ROOT, 'supabase', 'proposed', '20261019_guild_skills.sql')), 'it moved out of supabase/proposed');
  const tables = ['guild_skill_defs', 'guild_skill_levels', 'guild_seeds', 'guild_seed_earnings'];
  tables.forEach(t=>{
    ok(new RegExp(`create table if not exists public\\.${t} \\(`).test(sql), `${t}: created`);
    ok(new RegExp(`alter table public\\.${t} enable row level security;`).test(sql), `${t}: RLS on`);
    ok(new RegExp(`revoke insert, update, delete, truncate on public\\.${t} from anon, authenticated;`).test(sql), `${t}: client writes revoked`);
    ok(!new RegExp(`create policy [^;]* on public\\.${t} for (insert|update|delete|all)`).test(sql), `${t}: no write policy`);
  });
  ok(/create policy "guild skill levels read by members" on public\.guild_skill_levels for select to authenticated\s+using \(exists \(select 1 from public\.guild_members m where m\.guild_id = guild_skill_levels\.guild_id and m\.profile_id = \(select auth\.uid\(\)\)\)\);/.test(sql), 'members read their guild\'s levels');
  ok(/create policy "guild seeds read by members" on public\.guild_seeds for select to authenticated\s+using \(exists \(select 1 from public\.guild_members m where m\.guild_id = guild_seeds\.guild_id and m\.profile_id = \(select auth\.uid\(\)\)\)\);/.test(sql), 'members read their guild\'s Seeds');
  const up = (sql.match(/create or replace function public\.upgrade_guild_skill\(p_guild uuid, p_skill text, p_from_level integer\)[\s\S]*?\n\$\$;/) || [''])[0];
  ok(up && /security definer/.test(up) && /set search_path = ''/.test(up), 'upgrade_guild_skill is SECURITY DEFINER with a pinned search_path');
  ok(/v_uid\s+uuid := auth\.uid\(\)/.test(up) && /m\.role = 'owner'/.test(up) && /g\.created_by = v_uid/.test(up) && /raise exception 'not_owner' using errcode = '42501'/.test(up), 'role check: the owner (role and creator)');
  ok(/from public\.guild_seeds s where s\.guild_id = p_guild for update/.test(up) && /set seeds = s\.seeds - v_cost/.test(up) && /s\.seeds >= v_cost/.test(up) && /not_enough_seeds/.test(up), 'atomic spend: the Seeds row locked, spent only if enough');
  ok(/p_from_level is distinct from v_cur/.test(up) && /level_changed/.test(up) && /v_cur >= v_max/.test(up), 'the level the client saw, and the top level, are checked');
  ok(up.indexOf('set seeds = s.seeds - v_cost') < up.indexOf('insert into public.guild_skill_levels'), 'the level rises only after the Seeds came off');
  ok(/revoke all on function public\.upgrade_guild_skill\(uuid, text, integer\) from public, anon;/.test(sql) && /grant execute on function public\.upgrade_guild_skill\(uuid, text, integer\) to authenticated;/.test(sql), 'only signed-in players can call it');
  const cr = (sql.match(/create or replace function public\.credit_guild_seeds\(\)[\s\S]*?\n\$\$;/) || [''])[0];
  ok(cr && /security definer/.test(cr) && /set search_path = ''/.test(cr) && /exception when others then/.test(cr) && /250 - coalesce\(v_had, 0\)/.test(cr) && /\/ 500\)/.test(cr), 'the Seeds trigger: definer, 1 per 500, 250 a week, never blocks the attempt');
  ok(/new\.deck = '\{\}'::jsonb/.test(cr) && /extract\(epoch from now\(\)\) \/ 604800/.test(cr), 'admin rows (no deck) earn nothing; the week is the server\'s');
  ok(/revoke all on function public\.credit_guild_seeds\(\) from public, anon, authenticated;/.test(sql) && /create trigger credit_guild_seeds after insert on public\.raid_week_attempts/.test(sql), 'the trigger function can\'t be called directly');
  const defRow = sql.match(/values \('rooted_walls', (\d+), array\[([\d, ]+)\], (\d+)\)/);
  ok(defRow && +defRow[1] === RW.maxLevel && defRow[2].replace(/\s/g, '') === RW.costs.join() && +defRow[3] === RW.perLevel, 'the SQL catalogue matches bramblewood-guild.js');
  const dropped = [...sql.matchAll(/^\s*drop (policy|trigger) if exists "?[\w ]+"? on public\.(\w+)/gm)].map(m=> m[2]);
  ok(dropped.length && dropped.every(t=> tables.includes(t) || t === 'raid_week_attempts') && /drop trigger if exists credit_guild_seeds on public\.raid_week_attempts/.test(sql), 'it drops only its own policies and trigger');
  ok(!/^\s*(alter policy|drop table|drop function|alter table public\.(guilds|guild_members|raid_week_attempts))/m.test(sql) && !/on public\.(guilds|guild_members|raid_week_attempts) for /.test(sql), 'no existing table, policy or function is changed');

  // --- 5. texts: TX keys, translated in all 12 packs
  const keys = Object.keys(TEXT).filter(k=> /gskill/.test(k));
  ok(keys.length >= 30, `the guild skill texts are TX keys (${keys.length})`);
  ok(keys.every(k=> new RegExp(`TX\\('${k.replace(/[.-]/g, m=> '\\' + m)}'`).test(src)), 'every guild skill key is used');
  const LEAD = /^[\s\p{Extended_Pictographic}️‍]*/u;
  const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
  CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    const miss = keys.map(k=> TEXT[k].replace(LEAD, '')).filter(en=> !pack[en]); ok(!miss.length, `${c}: every guild skill text is translated (missing: ${miss.slice(0, 3).join(' | ')})`); });

  // --- 6. trench tuning at max level (+20% on the shared wall), tests/trench.js's population
  if(!process.argv.includes('--fast')){
    const T = require(path.join(ROOT, 'bramblewood-trench.js')), Gh = require(path.join(ROOT, 'bramblewood-ghosts.js')), H = require('./lib/harness.js');
    const raid = require(path.join(ROOT, 'canonical', 'raids.json'))[0], defs = H.loadCardDefs(), part = id=> raid.parts.find(p=> p.id === id);
    const rowsFor = i=> [0, 1, 2].map(k=> ({deck: Gh.generateGhostDeck(defs, (i + k) % 7, 900 + i * 13 + k), name: 'r' + k}));
    const batch = (pid, pct)=>{ let tot = 0, ow = 0; const n = 30;
      for(let i = 0; i < n; i++){ const cfg = T.trenchConfig(raid, part(pid), null); cfg.wallHp = G.scaleBramble(cfg.wallHp, 0, pct);
        const r = T.runTrench({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 4000 + i, rows: rowsFor(i), cfg, bossName: pid}); ow += r.overwhelmed; tot += R.contributionFor(raid, r.dealt, r.overwhelmed, part(pid)); }
      return {avg: Math.round(tot / n), ow: Math.round(ow / n * 100)}; };
    const lines = [];
    ['left', 'core'].forEach(pid=>{ const a = batch(pid, 0), b = batch(pid, 20); lines.push(`${pid}: ${a.avg} → ${b.avg} avg, ${a.ow}% → ${b.ow}% overwhelm`);
      ok(b.avg >= a.avg * 0.9, `${pid}: a stronger wall never costs much damage (${a.avg} → ${b.avg})`);
      if(pid === 'core') ok(b.ow <= 10, `core at +20%: still rarely overwhelmed (${b.ow}%; 10% since 2026-10-19, package RB: the stumps have 14 Health, was 20)`); });
    console.log('  trench, Rooted Walls 5 (+20% wall): ' + lines.join(' · '));
  }

  console.log(fail ? `guild-skills-2026-10-19: ${fail} of ${checks} checks FAILED` : `guild-skills-2026-10-19: all ${checks} checks passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  ✗ crashed:', e && e.stack || e); process.exit(1); });
