// ============================================================================
// Bramblewood guild skills (2026-10-19, package G; owner 20:45: "Guild skills. Starting with +raid HP to your bramble.").
// DOM-free: inlined into the page (global `BramblewoodGuild`) and require()'d by tests/guild-skills-2026-10-19.js.
// See docs/guild-skills-2026-10-19.md.
//
// A guild holds a list of skills, each with a level (0 = not bought). Levels are bought by the guild's owner with
// 🌱 Guild Seeds, a guild-wide resource its members earn in raid fights (SEEDS_PER_DAMAGE raid damage = 1 Seed, at most
// SEED_WEEK_CAP a member a week). The server keeps the levels and the Seeds (supabase/proposed/20261019_guild_skills.sql): the
// numbers here are the client's copy of guild_skill_defs, and the test checks the two agree.
//
// Live today: Rooted Walls (+4% bramble Health in raid fights a level, 5 levels). The rest are `soon`: shown locked, they do
// nothing and can't be bought (the server's catalogue doesn't list them).
// ============================================================================
(function(root){
'use strict';
const SEEDS_PER_DAMAGE = 500;   // 1 Seed per 500 raid damage in one fight (a fight scores at most 10,000, so 20 Seeds)
const SEED_WEEK_CAP = 250;      // Seeds one player can earn a week, whichever guild they are in
const SKILLS = [
  {id:'rooted_walls', key:'rooted-walls', icon:'🌳', maxLevel:5, perLevel:4, costs:[30, 60, 100, 150, 220], effect:'raidBrambleHpPct'},
  {id:'sharp_thorns', key:'sharp-thorns', icon:'🌵', soon:true},
  {id:'second_wind',  key:'second-wind',  icon:'🍃', soon:true},
  {id:'sap_return',   key:'sap-return',   icon:'🍯', soon:true},
  {id:'guild_chest',  key:'guild-chest',  icon:'🧰', soon:true},
  {id:'ally_banners', key:'ally-banners', icon:'🚩', soon:true},
  {id:'seed_satchel', key:'seed-satchel', icon:'🌰', soon:true},
];
const byId = id=> SKILLS.find(s=> s.id === id) || null;
const clampLevel = (s, n)=> Math.max(0, Math.min(s && !s.soon ? s.maxLevel : 0, Math.floor(Number(n) || 0)));
// Rows from guild_skill_levels ([{skill, level}]) or a plain {skill: level} object -> {skill: level}, live skills only, clamped.
function normaliseLevels(rows){
  const out = {};
  const put = (id, n)=>{ const s = byId(id); if(s && !s.soon){ const v = clampLevel(s, n); if(v) out[id] = v; } };
  if(Array.isArray(rows)) rows.forEach(r=>{ if(r) put(r.skill, r.level); });
  else if(rows && typeof rows === 'object') Object.keys(rows).forEach(id=> put(id, rows[id]));
  return out;
}
// Seeds the next level costs (null at the top level, or for a skill that isn't live).
function nextCost(id, level){ const s = byId(id); if(!s || s.soon) return null; const l = clampLevel(s, level); return l >= s.maxLevel ? null : s.costs[l]; }
function totalCost(id){ const s = byId(id); return s && !s.soon ? s.costs.reduce((t, c)=> t + c, 0) : 0; }
// What a skill does at a level (Rooted Walls: the % of bramble Health).
function effectAt(id, level){ const s = byId(id); return s && !s.soon ? clampLevel(s, level) * s.perLevel : 0; }
// Rooted Walls: +% Health on your bramble in raid fights, from a {skill: level} object.
function brambleHpPct(levels){ return effectAt('rooted_walls', (normaliseLevels(levels || {}))['rooted_walls'] || 0); }
// A raid castle's Health with the stage's castleHpPct and the guild's % added together (+20 guild and −10 stage = +10%).
// Same rounding and floor as BramblewoodRaid.scaleCastle.
function scaleBramble(hp, stagePct, guildPct){ hp = Number(hp) || 0; const pct = (Number(stagePct) || 0) + (Number(guildPct) || 0); return pct ? Math.max(1, Math.round(hp * (1 + pct / 100))) : hp; }
// Seeds one raid fight earns (the server's trigger does the same sum; the weekly cap is the server's).
function seedsForDamage(damage){ return Math.floor(Math.max(0, Math.min(10000, Number(damage) || 0)) / SEEDS_PER_DAMAGE); }
// The upgrade is allowed for the guild's owner: role 'owner' AND the guild's creator (the server's rule; see the SQL for why).
function canUpgrade(guild, member, uid){ return !!(guild && member && uid && member.role === 'owner' && member.profile_id === uid && guild.created_by === uid); }
// PostgREST / Postgres errors that mean "the table or function isn't there yet" (the SQL isn't applied).
function notAppliedError(err){
  if(!err) return false;
  const c = String(err.code || ''), m = String(err.message || err.details || err.hint || '');
  return c === 'PGRST205' || c === 'PGRST202' || c === '42P01' || c === '42883' || /does not exist|schema cache|could not find the (table|function)/i.test(m);
}
const api = {SKILLS, SEEDS_PER_DAMAGE, SEED_WEEK_CAP, byId, normaliseLevels, nextCost, totalCost, effectAt, brambleHpPct, scaleBramble, seedsForDamage, canUpgrade, notAppliedError};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodGuild = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
