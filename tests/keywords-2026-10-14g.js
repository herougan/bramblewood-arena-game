#!/usr/bin/env node
// 2026-10-14, seventh pass: crabs Fork (user: "Ignore Crab claws. Crabs have fork - thematically. And the symbol can be a Crab
// claw."), Psychic (user: "Psychic Damage: it's a skill rather than a type like Normal and Magic."), Smoke Bomb (user: "Throws a
// smoke bomb at an ally or enemy (random). If ally, then the ally has smoke-evade. If enemy, the enemy has blind. This is an
// evergreen skill. It happens 50% of the time every turn. (The banana and bananarang and boomerang ones are all Evergreen)"), and
// the ingested-poison insect (user: "On Death: Attacking unit gets 5 Poison. - it's as if it got ingested!").
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, base, {
  'kg-wall':   U('kg-wall', {}),
  'kg-psy':    U('kg-psy', {psychic:3}, {attack:2}),
  'kg-psyF':   U('kg-psyF', {psychic:2, fork:true}, {attack:1}),
  'kg-armor':  U('kg-armor', {armor:10}),
  'kg-ghost':  U('kg-ghost', {ghost:true}),
  'kg-shell':  U('kg-shell', {shield:20}),
  'kg-elem':   U('kg-elem', {}, {species:['Elemental']}),
  'kg-plant':  U('kg-plant', {}, {species:['Plant']}),
  'kg-flora':  U('kg-flora', {}, {archetypes:['Flora']}),
  'kg-smoke':  U('kg-smoke', {smokeBomb:true}, {health:500}),
  'kg-hit':    U('kg-hit', {}, {attack:1, health:5000}),
  'kg-keen':   U('kg-keen', {keenSense:true}),
  'kg-beetle': U('kg-beetle', {triggers:[{on:'onDeath', do:'poison', amount:5, who:'killer'}]}, {health:3}),
  'kg-biter':  U('kg-biter', {}, {attack:5}),
  'kg-psyK':   U('kg-psyK', {psychic:5}, {attack:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, mode, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);
  if(slot != null){ c.slot = slot; const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); }
  return c; }

// ---- 1. Crabs Fork
{ const crabs = Object.values(base).filter(d=> (d.species||[]).includes('Crustacean') || /crab/i.test(d.name||''));
  ok(!crabs.some(d=> d.effects && d.effects.crabClaws), 'no crab keeps Crab Claws');
  ['sulfur-vent-crab', 'open-ocean-hermit-crab'].forEach(id=> ok(base[id].effects.fork === true && !base[id].effects.crabClaws, `${id}: Fork instead of Crab Claws`)); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  ok(/\{key:'crabClaws', category:'passive', hidden:true/.test(src), 'Crab Claws is hidden from "+ Add Skill" (its code stays)');
  ok(/const gateOk = x => row\.key===x\.key \|\| \(!x\.hidden/.test(src), 'the editor picker leaves hidden skills out');
  ok(/function skillIconFor\(k, d\)\{ return \(k === 'fork' && isCrabDef\(d\)\) \? '🦞'/.test(src), 'Fork on a crab: the crab claw icon');
  ok(/isCrabDef\(d\) \? `<span class="ab-fork ab-crab"[^`]*>🦞<\/span>` : `<span class="ab-fork"[^`]*>⇔<\/span>`/.test(src), 'the card chip: 🦞 on crabs, ⇔ elsewhere');
  ok(/const ic = k=>\{ const g = skillIconFor\(k, def\)/.test(src), 'the skill lines use the crab claw too');
  // isCrabDef, run on the real cards
  const m = src.match(/function isCrabDef\(d\)\{[^\n]*\}/); const isCrabDef = new Function(m[0] + '; return isCrabDef;')();
  ok(isCrabDef(base['fiddler-crab-swarm']) && isCrabDef(base['sulfur-vent-crab']) && !isCrabDef(base['otter-centurion']), 'isCrabDef: crabs yes, an otter no'); }

// ---- 2. Psychic
{ const hitWith = (foe, seed)=>{ const {e, P} = mk(seed || 3); const T = put(e, P, 2, foe, 0); const A = put(e, P, 1, 'kg-psy', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev); return {T, ev}; };
  { const {T, ev} = hitWith('kg-wall'); const ps = ev.find(x=> x.type === 'psychic'); ok(ps && ps.dmg === 3 && T.hp === 45, `Psychic 3: 2 from the hit + 3 psychic (${T.hp})`); }
  { const {T} = hitWith('kg-armor'); ok(T.hp === 47, `Armor 10 stops the hit, not the psychic damage (${T.hp})`); }
  { const {T} = hitWith('kg-ghost'); ok(T.hp === 47, `a Ghost takes the psychic damage in full (${T.hp})`); }
  { const {T} = hitWith('kg-shell'); ok(T.hp === 47 && T.shield === 18, `a Shield soaks the hit, not the psychic damage (${T.hp}, shield ${T.shield})`); }
  ['kg-elem', 'kg-plant', 'kg-flora'].forEach(id=>{ const {T, ev} = hitWith(id); const ps = ev.find(x=> x.type === 'psychic');
    ok(T.hp === 48 && ps && ps.immune && ps.dmg === 0, `${id}: no mind, no psychic damage (${T.hp})`); });
  ok(['ent', 'heartwood-treant', 'fungal-colossus'].every(id=> base[id]), 'the real Elementals/Plants exist');
  { const {e, P} = mk(5); const L = put(e, P, 2, 'kg-wall', -1), R = put(e, P, 2, 'kg-wall', 1); const A = put(e, P, 1, 'kg-psyF', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
    ok(L.hp === 47 && R.hp === 47 && ev.filter(x=> x.type === 'psychic').length === 2, `each Fork prong carries it (${L.hp}, ${R.hp})`); }
  { const {e, P} = mk(5); const T = put(e, P, 2, 'kg-wall', 0); T.hp = 4; const A = put(e, P, 1, 'kg-psyK', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
    ok(!all(P[2]).includes(T) && ev.some(x=> x.type === 'death' && x.uid === T.uid), 'psychic damage can kill'); } }

// ---- 3. Smoke Bomb
{ let rolls = 0, smokes = 0, blinds = 0, self = 0, noKeen = true;
  for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const S = put(e, P, 1, 'kg-smoke', 0), A = put(e, P, 1, 'kg-wall', 1); const F = put(e, P, 2, 'kg-wall', 0), K = put(e, P, 2, 'kg-keen', 1);
    const ev = []; e.resolveCombat(P, so, {}, ev, 1); const sb = ev.filter(x=> x.type === 'smokeBomb'); if(sb.length > 1) ok(false, 'one bomb a round at most');
    if(!sb.length) continue; rolls++; const b = sb[0];
    if(b.targetUid === S.uid) self++;
    if(b.ally){ smokes++; ok(A.smoke === 1 && b.effect === 'smoke', 'an ally gets Smoke'); }
    else if(b.targetUid === K.uid){ if(K.blind > 0 || b.effect !== 'none') noKeen = false; }
    else { blinds++; ok(F.blind === 1 && b.effect === 'blind', 'an enemy gets Blind'); }
    const iB = ev.findIndex(x=> x.type === 'smokeBomb'), iHit = ev.map(x=> x.type === 'hit').lastIndexOf(true); ok(iHit < iB, 'the bomb comes after the swings (Banana time)'); }
  ok(rolls > 10 && rolls < 30, `a 1 in 2 chance a round (${rolls}/40)`);
  ok(smokes > 0 && blinds > 0 && self === 0, `ally or enemy at random, never itself (${smokes} smoke, ${blinds} blind)`);
  ok(noKeen, 'Keen Sense shrugs off the Blind'); }
{ // Smoke makes attacks at it miss 1 in 2, through the end of the next round, then clears.
  const {e, P} = mk(9); const A = put(e, P, 1, 'kg-wall', 0); A.smoke = 1; A._smokeJustSet = true; const H2 = put(e, P, 2, 'kg-hit', 0);
  let miss = 0; for(let i = 0; i < 40; i++){ const ev = []; e.debugAttack(P, so, H2.uid, {}, ev); if(ev.some(x=> x.type === 'evaded' && x.reason === 'smoke')) miss++; }
  ok(miss > 8 && miss < 32, `attacks at a smoked unit miss about 1 in 2 (${miss}/40)`);
  e.resolveCombat(P, so, {}, [], 1); ok(A.smoke === 1, 'still smoked through the next round');
  e.resolveCombat(P, so, {}, [], 2); ok(!(A.smoke > 0), 'gone after the next round'); }
{ const {e, P} = mk(1); const S = put(e, P, 1, 'kg-smoke', 0); S.wait = 2; put(e, P, 2, 'kg-wall', 0); let any = false;
  for(let r = 0; r < 1; r++){ const ev = []; e.resolveCombat(P, so, {}, ev, 1); if(ev.some(x=> x.type === 'smokeBomb')) any = true; } ok(!any, 'a unit still on Wait holds its bomb'); }
{ const run = seed=>{ const {e, P} = mk(seed); put(e, P, 1, 'kg-smoke', 0); put(e, P, 1, 'kg-wall', 1); put(e, P, 2, 'kg-hit', 0); put(e, P, 2, 'kg-hit', 1); const ev = [];
    for(let r = 0; r < 6; r++) e.resolveCombat(P, so, {}, ev, r % 2 ? 1 : 2); return JSON.stringify(ev.map(x=> [x.type, x.uid, x.targetUid, x.dmg, x.effect])); };
  ok(run(17) === run(17), 'Smoke Bomb is seeded'); }
{ const r = base['smoke-raccoon']; ok(r && r.name === 'Smokescreen Raccoon' && r.effects.smokeBomb === true && (r.species||[]).includes('Procyonid') && ['common','uncommon'].includes(r.rarity) && !r.art && r.flavor, 'Smokescreen Raccoon: a raccoon with Smoke Bomb, no art'); }

// ---- 4. On Death: the killer gets 5 Poison
{ const {e, P} = mk(4); const B = put(e, P, 1, 'kg-beetle', 0); const K = put(e, P, 2, 'kg-biter', 0); const O = put(e, P, 2, 'kg-wall', 1); const ev = [];
  e.debugAttack(P, so, K.uid, {}, ev);
  ok(!all(P[1]).includes(B), 'the beetle dies'); ok(K.poison === 5 && !(O.poison > 0), `the unit that killed it gets 5 Poison, nobody else (${K.poison})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'poison' && x.targetUid === K.uid && x.amount === 5), 'a poison statusFx on the killer'); }
{ const {e, P} = mk(4); const B = put(e, P, 1, 'kg-beetle', 0); const K = put(e, P, 2, 'kg-wall', 0); B.poison = 10; const ev = [];
  e.resolveCombat(P, so, {}, ev, 1); e.roundStart && e.roundStart(P, 2, so, {}, ev);
  ok(!all(P[1]).includes(B) && !(K.poison > 0), 'it dies of poison: no killer, nobody poisoned'); }
{ const {e, P} = mk(4); const B = put(e, P, 1, 'kg-beetle', 0); const K = put(e, P, 2, 'kg-psyK', 0); const ev = []; e.debugAttack(P, so, K.uid, {}, ev);
  ok(!all(P[1]).includes(B) && K.poison === 5, 'killed by psychic damage: the psychic is the killer'); }
{ const d = base['blister-beetle']; const t = d && (d.effects.triggers||[])[0];
  ok(d && (d.species||[]).includes('Insect') && t && t.on === 'onDeath' && t.do === 'poison' && t.amount === 5 && t.who === 'killer' && !d.art && /regret/i.test(d.flavor||''), 'Blister Beetle: an insect, On Death: its killer gets 5 Poison'); }

// ---- 5. App: icons, skill defs, evergreens, text, chips, log, VFX, Effects library, editor
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  ok(/\{key:'psychic', category:'passive'/.test(src) && /\{key:'smokeBomb', category:'evergreen'/.test(src), 'Psychic (a skill) and Smoke Bomb (Evergreen) are skill defs');
  ['banana', 'bananarang', 'boomerang'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'evergreen'`).test(src), `${k} is Evergreen`));
  ok(/Object\.assign\(SKILL_ICON, \{psychic:'💭', smokeBomb:'💣💨'\}\)/.test(src) && /hiveMind:'🧠'/.test(src), 'icons: Psychic 💭 (Hive Mind has 🧠), Smoke Bomb 💣💨 as text');
  ok(/smokeBomb:'<i class="ico-smokebomb"/.test(src), 'Smoke Bomb has a drawn icon');
  ['psychic', 'smokeBomb'].forEach(k=>{ ok(new RegExp(`\\n  ${k}: v=> `).test(src), `${k}: short text`); ok(src.includes(`if(e.${k}) out.push(`), `${k}: a chip`);
    ok(src.includes(`case '${k}': return`) && src.includes(`ev.type==='${k}'`), `${k}: a log line and a VFX handler`);
    ok(new RegExp(`\\n  ${k}: \\{`).test(src.slice(src.indexOf('const FXL_SKILL_SETUPS'))), `${k}: an Effects library setup`); });
  ok(/smoke:\s*\{text:'Miss', icon:'🌫️'\}/.test(src) && /ev\.reason === 'smoke'/.test(src), 'a Smoke miss callout and log line');
  ok(/smoke-overlay/.test(src) && /smoke:rc\.smoke\|\|0/.test(src) && /smoke:c\.smoke\|\|0/.test(src), 'the board shows Smoke (overlay, badge, replay)');
  ok(/onDeathKiller: \{t:\{on:'onDeath', do:'poison', amount:5, who:'killer'\}/.test(src), 'Effects library: On Death → the killer');
  ok(/whoOptions0\.concat\('killer'\)/.test(src) && /if\(t\.who==='killer'\) return 'the unit that killed it'/.test(src), 'the editor offers Killer for On Death'); }
{ const fx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8'); ok(/Object\.assign\(root\.SkillFX, \{smokeBomb, smokePuff, mindWave\}\)/.test(fx), 'SkillFX: smokeBomb, mindWave'); }
{ const css = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8'); ok(/\.ico-smokebomb\{/.test(css) && /\.smoke-overlay\{/.test(css), 'CSS: the Smoke Bomb icon and the smoke cloud'); }
{ const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8'); ok(/Toxin \(planned, 2026-10-14/.test(eng), 'Toxin: a placeholder note, no behaviour'); }

console.log(`keywords-2026-10-14g: ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
