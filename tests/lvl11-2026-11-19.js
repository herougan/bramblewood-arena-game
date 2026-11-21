#!/usr/bin/env node
// 2026-11-19 (package LVL11; owner 11-18 21:29 "In the codex, let players move a small bar at the bottom to discover the stats at different levels ... at
// most to their highest unlocked level for that card + 1"; 21:29 "future skills showing up at ? ... it says the creature will learn more as it grows";
// 21:31 "Tokens should also grow in strength ... the Bee Swarmling is a flying 1/1. Maybe this becomes a 2/3 at level 10").
// Covers: 1. token tables (data, 1/1 -> 2/3, idempotent tool); 2. the engine: a summon at its summoner's level by its own table (trigger spawn, On Death,
// Sprout; a token the app stamped with level 1 still grows; no level: as printed); 3. the price: Spawn / On Death Spawn at level L x the token's growth;
// 4. the Codex level bar's range and read-out, the "?" chip's tooltip on card / hover / Codex, texts in 12 packs.
'use strict';
const H = require('./lib/harness.js'), E = H.Engine;
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const cards = JSON.parse(rd('canonical/cards.json')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));

// ---- 1. token tables
const toks = cards.filter(c=> c.token);
ok(toks.filter(c=> c.id !== 'summoned-shield').every(c=> c.levelBonus) && !byId['summoned-shield'].levelBonus, '1. every token carries levelBonus but the Summoned Shield (Shield Call\'s own +1 Health a level)');
const at10 = id=> BB.forgeCurve(Object.assign({}, byId[id], {obtainMap: 0}), 1, 10).rows[10];
ok(at10('bee-swarmling').attack === 2 && at10('bee-swarmling').health === 3, `1. Bee Swarmling 1/1 -> 2/3 at Level 10 (${at10('bee-swarmling').attack}/${at10('bee-swarmling').health})`);
ok(toks.filter(c=> c.levelBonus).every(c=>{ const r = at10(c.id), g = 3 * (r.attack - c.attack) + r.health - c.health; return g >= 3 && g <= 8; }), '1. each token gains 3-8 stat points (3A + H) by Level 10, as stats-only cards of its size do');
ok(toks.filter(c=> c.levelBonus).every(c=> Object.values(c.levelBonus).every(o=> !o.skills)), '1. token tables are stats only');
{ const out = cp.execFileSync('node', [path.join(ROOT, 'tools', 'lvl10', 'tokens_2026_11_19.js'), '--dry'], {encoding: 'utf8'}); ok(/nothing to fill/.test(out), '1. the token tool is idempotent'); }

// ---- 2. the engine
const U = (id, effects, o)=> Object.assign({id, name: id, attack: 1, health: 30, wait: 0, cost: 0, rarity: 'common', effects: effects || {}}, o || {});
const spawnFx = {triggers: [{on: 'onSpawn', do: 'spawnCard', defId: 'bee-swarmling', count: 1}]};
const defs = Object.assign({}, H.loadCardDefs(), {
  'bee-swarmling': Object.assign({}, H.loadCardDefs()['bee-swarmling'], {level: 1, baseLevel: 1}), // as the app's buildCardDefs stamps a token at its base level
  'l11-sp10': U('l11-sp10', spawnFx, {level: 10, baseLevel: 1}), 'l11-sp4': U('l11-sp4', spawnFx, {level: 4, baseLevel: 1}),
  'l11-sp1': U('l11-sp1', spawnFx, {level: 1, baseLevel: 1}), 'l11-sp': U('l11-sp', spawnFx),
  'l11-roost10': Object.assign({}, H.loadCardDefs()['vampire-roost'], {id: 'l11-roost10', derivedFrom: 'vampire-roost', level: 10, baseLevel: 1}),
  'l11-sprout10': U('l11-sprout10', {sprout: 1}, {level: 10, baseLevel: 1}),
});
const so = id=> id === 1 ? 'A' : 'B', all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(){ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}, {health: 200}), 2: e.newPlayer(2, {}, {health: 200})}}; }
const root = (e, c)=> (e.derivedDefs[c.defId] || defs[c.defId] || {}).derivedFrom || c.defId;
function play(id){ const {e, P} = mk(), h = {uid: 9700, defId: id}; P[1].hand.push(h); P[1].lumber = 9; e.placeCard(P, so, 1, h.uid, 0, {}, []); return {e, P}; }
function swarmlingOf(id){ const {e, P} = play(id); const t = all(P[1]).find(c=> root(e, c) === 'bee-swarmling'); return t ? t.atk + '/' + t.hp : 'none'; }
ok(swarmlingOf('l11-sp10') === '2/3', `2. a Level 10 summoner's Bee Swarmling is 2/3 (${swarmlingOf('l11-sp10')})`);
ok(swarmlingOf('l11-sp4') === '1/2', `2. at Level 4: 1/2 (${swarmlingOf('l11-sp4')})`);
ok(swarmlingOf('l11-sp1') === '1/1' && swarmlingOf('l11-sp') === '1/1', '2. a Level 1 summoner, and one with no level: 1/1 as printed');
{ const st = mk().e.eng36StatsAt(defs['bee-swarmling'], 10); ok(st.attack === 2 && st.health === 3, '2. eng36StatsAt reads the token\'s own table in full (ENG40\'s half rate only for a summon with no table)'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'l11-roost10', 'left', {}, []); const r = all(P[1])[0]; const ev = []; e.debugDamage(P, so, r.uid, 999, {}, ev); e.removeDeadCards && e.removeDeadCards(P, so, {}, ev);
  const bats = all(P[1]).filter(c=> root(e, c) === 'bat-swarmling'); ok(bats.length >= 1 && bats.every(b=> b.atk === 2 && b.hp === 3), `2. a Level 10 Vampire Roost's On Death bats are 2/3 (${bats.map(b=> b.atk + '/' + b.hp)})`); }
{ const {e, P} = play('l11-sprout10'); const s = all(P[1]).find(c=> root(e, c) === 'growth-sprout'); ok(s && s.atk === 2 && s.hp === 4, `2. a Level 10 Sprout's Growth Sprout is 2/4 (${s && s.atk + '/' + s.hp})`); }

// ---- 3. the price
const T = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(rd('canonical/skill-costs.json')));
{ const d = U('l11-p', spawnFx), s1 = T.budgetAt(d, 1, 1).S, s10 = T.budgetAt(d, 10, 1).S;
  ok(s1 > 0 && Math.abs(s10 / s1 - 2.25) < 0.01, `3. Spawn a Bee Swarmling at Level 10 costs x 9/4 its Level 1 price (the 2/3's stat points over the 1/1's) (${s1}, ${s10})`);
  ok(T.budget(d).S === s1, '3. a card priced without a level (budget) is unchanged'); }
{ const r = T.budgetAt(byId['vampire-roost'], 10, 1); ok(r.parts.some(p=> p[1] === 'onDeathSpawn' && /LVL11/.test(p[3])), '3. On Death Spawn at Level 10 is priced with the grown token'); }
{ const T2 = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(rd('canonical/skill-costs.json')), {tokenDef: ()=> null}); ok(T2.budgetAt(U('l11-p', spawnFx), 10, 1).S === T2.budgetAt(U('l11-p', spawnFx), 1, 1).S, '3. no token defs (the hub): x1'); }

// ---- 4. the app
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js'), css = rd('arena_template.html');
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const rangeOf = (o)=> new Function('copyBaseDef', 'cardBaseLevel', 'cardMaxLevel', 'LIMIT_BREAK_LEVEL', 'adminModeEnabled', 'ownedCopiesOf', 'getCardLevel', LB.grab('lvl11SliderRange') + '\nreturn lvl11SliderRange;')(
  ()=> ({attack: 2, health: 3, token: o.token}), ()=> (o.base == null ? 1 : o.base), ()=> 10, 11, !!o.admin, ()=> o.owned || 0, ()=> o.best)('x');
const rs = o=>{ const r = rangeOf(o); return r.lo + '-' + r.hi; };
ok(rs({owned: 0}) === '1-1' && rangeOf({owned: 0}).unowned, '4. not owned: its base level only (the bar locked)');
ok(rs({owned: 1, best: 1}) === '1-2' && rs({owned: 2, best: 4}) === '1-5', '4. owned: base to its best level + 1');
ok(rs({owned: 1, best: 10}) === '1-10' && rs({owned: 1, best: 11}) === '1-11', '4. Level 10 tops at 10; a limit-broken card (11) reaches 11');
ok(rs({owned: 1, best: 0, base: 0}) === '0-1', '4. a Level 0 card: 0 to 1');
ok(rs({admin: true}) === '1-11', '4. Admin Mode: every level to 11');
ok(/fromCodex \? lvl11SliderHTML\(defId, d\) : ''/.test(app) && /querySelector\('#lvl11Range'\)[^\n]*addEventListener\('input'/.test(app), '4. the Codex card view carries the bar; moving it redraws the read-out');
ok(/function lvl11ReadHTML\(id, L\)\{[\s\S]{0,200}defAtShownLevel\(id, L\)[\s\S]{0,500}eng28LaterSkillsHTML\(d\)/.test(app), '4. the read-out: Attack, Health and skills at that level, later skills as "?"');
ok(/function eng28LaterSkillsHTML\(d\)\{\s*try\{ const tip = TX\('ui\.lvl11-grows'\)/.test(app), '4. the hover\'s "?" chips read "Will learn another skill as it grows"');
ok(!/lvl11GrowsChipHTML/.test(app), '4. no "?" chip on the card face (UIQ2 2026-11-21, owner: no mystery-skill context pip; the hover line says it)');
ok(/<h3>Abilities<\/h3>\$\{abilityHTML\}\$\{eng28LaterSkillsHTML\(d\)/.test(app), '4. the Codex card view lists them under Abilities');
ok(/tokenDef: id=> \(typeof liveCards/.test(app), '4. the card editor\'s budget sees the grown token (sbCanon tokenDef)');
{ const rows = new Function('copyBaseDef', 'cardBaseLevel', 'ui18CardSkillKeys', LB.grab('lvl11LaterRows') + '\nreturn lvl11LaterRows;')(()=> null, ()=> 1, d=> Object.keys(d.levelSkills).flatMap(L=> Object.keys(d.levelSkills[L]).map(k=> ({key: k, lvl: +L}))));
  ok(rows({id: 'x', level: 1, levelSkills: {3: {armor: 1}}}).length === 1 && rows({id: 'x', level: 3, levelSkills: {3: {armor: 1}}}).length === 0, '4. a skill shows as "?" below its level and normally from it'); }
const keys = ['ui.lvl11-grows', 'ui.lvl11-slider', 'ui.lvl11-slider-tip', 'ui.lvl11-own'];
ok(keys.every(k=> texts.includes(`"${k}":`) && app.includes(`'${k}'`)), '4. TX keys');
{ const en = keys.map(k=> (new RegExp(`"${k.replace('.', '\\.')}": "([^"]+)"`).exec(texts) || [])[1]);
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'], miss = [];
  codes.forEach(c=>{ const pk = JSON.parse(rd(`lang/${c}.json`)); en.forEach(t=>{ if(!t || !pk[t]) miss.push(c + ':' + t); }); });
  ok(!miss.length, '4. 12 packs: ' + miss.slice(0, 4).join(', ')); }
ok(/\.lvl11-bar\{/.test(css) && /\.lvl11-lab input\[type=range\]\{[^}]*width:100%/.test(css), '4. the bar\'s styles');
console.log(`lvl11-2026-11-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
