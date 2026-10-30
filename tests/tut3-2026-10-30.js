#!/usr/bin/env node
// 2026-10-30 (package TUT3). Owner decisions TUT2-2 / TUT2-3 (10:34: "T-1/T-2 won't have swarm or flying. Same for all the Map 0 to T1-T2 base cards.
// All start at lvl 0 and have no skills till lvl 1."): (1) a Level 0 copy never has a skill that arrives at Level 1 (levelSkills), from every builder of
// a levelled copy: effectsAtLevel (the one helper), the Nest's hatchling def and a card at its own Level 0 (getCardDefs), copyDefAt, refPartsDeck,
// defAtShownLevel, levelledEnemyDeck (EB's Level 0 enemy copies), tutorialLevel0Def; (2) the tutorial decks (TUTORIAL_CFG_DEFAULT, either side,
// T-1 and T-2) hold no card with a skill at Level 0, and the proposed SQL changes your T-2 deck the same way, guarded, with its rollback.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a + 1, i + 1); }
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const lsCards = cards.filter(c=> c.levelSkills && Object.keys(c.levelSkills).some(k=> +k > 0));
const lvSkillKeys = c=> { const s = new Set(); Object.keys(c.levelSkills || {}).filter(k=> +k > 0).forEach(k=> Object.keys(c.levelSkills[k]).forEach(x=> s.add(x))); return [...s]; };
const hasLv1Fx = (fx, c)=> lvSkillKeys(c).filter(k=> fx && fx[k] !== undefined && fx[k] !== false && k !== 'stem');
ok(byId['bee-knight'] && byId['bee-knight'].effects.flying && byId['bee-knight'].effects.swarm, '0. fixture: the Bee Knight holds Flying + Swarm in `effects` (the full set), which arrive at Level 1');

// ---- 1. the builders, on the real code
const overlay = {}, base = L.CARD_DEFS_BASELINE;
const ctx = {Object, Number, Math, Array, matchDefsOverlay: overlay, CARD_DEFS_BASELINE: base, liveCards: {}, LIMIT_BREAK_LEVEL: 30, BASE_CARD_LEVEL_CAP: 4,
  cardBaseLevel: G.cardBaseLevel, statsAtLevel: G.statsAtLevel, statsBeyondLevel: G.statsAtLevel, isBaseLevelCapped: ()=> false, invalidateCardDefs(){},
  roadEnemyLevelExact: ()=> null, nodeEnemyLevelOverride: ()=> 5, earlyEnemyLevel: ()=> null, levelMixDeck: ()=> [], getCardDefs: ()=> Object.assign({}, base, overlay),
  copyBaseDef: id=> base[id] || null, edShownLevel: ()=> 0, CARD_DEFS_BASELINE_: base};
vm.createContext(ctx);
vm.runInContext(['effectsAtLevel', 'refPartsDeck', 'defAtShownLevel', 'levelledEnemyDeck', 'tutorialLevel0Def', 'tutorialPlainDeck'].map(fnSrc).join('\n') + '\n;this.R = {effectsAtLevel, refPartsDeck, defAtShownLevel, levelledEnemyDeck, tutorialLevel0Def, tutorialPlainDeck};', ctx);
const R = ctx.R;
ok(lsCards.length > 0, '1. cards with a level skill exist: ' + lsCards.map(c=> c.id).join(', '));
lsCards.forEach(c=>{ const b = base[c.id], keys = lvSkillKeys(c);
  // the helper
  const f0 = R.effectsAtLevel(b, 0), f1 = R.effectsAtLevel(b, 1);
  ok(!hasLv1Fx(f0, c).length, `1. effectsAtLevel(${c.id}, 0) has none of ${keys.join(',')} (${JSON.stringify(f0)})`);
  ok(keys.filter(k=> k !== 'stem').every(k=> !(k in (b.effects || {})) || f1[k] === b.effects[k] || f1[k] === c.levelSkills[1][k]), `1. effectsAtLevel(${c.id}, 1) has them back (${JSON.stringify(f1)})`);
  // a reference-deck copy at Level 0, an editor def at Level 0, an EB / editor Level 0 enemy copy, the tutorial's copy
  const rp = R.refPartsDeck([[c.id, 1, 0]], base, {}), ro = {}; R.refPartsDeck([[c.id, 1, 0]], base, ro);
  // refPartsDeck keeps a card as it is when its own level is >= the asked one; only a card whose base level is above 0 gets a copy, so check the ones it builds
  Object.values(ro).forEach(d=> ok(!hasLv1Fx(d.effects, c).length, `1. refPartsDeck ${c.id}@p0 has no Level 1 skill`));
  ctx.edShownLevel = ()=> 0; const sd = R.defAtShownLevel(c.id, 0);
  ok(!sd || !hasLv1Fx(sd.effects, c).length, `1. defAtShownLevel(${c.id}, 0) has no Level 1 skill (${JSON.stringify(sd && sd.effects)})`);
  Object.keys(overlay).forEach(k=> delete overlay[k]);
  const out = R.levelledEnemyDeck({cardLevels: {[c.id]: 0}}, {[c.id]: 2}), ek = Object.keys(out);
  ok(ek.length === 1 && ek[0] === c.id + '@lv0' && !hasLv1Fx(overlay[ek[0]].effects, c).length, `1. levelledEnemyDeck: the Level 0 enemy copy of ${c.id} (${ek.join(',')}) has no Level 1 skill (${JSON.stringify(overlay[ek[0]] && overlay[ek[0]].effects)})`);
  const out1 = R.levelledEnemyDeck({cardLevels: {[c.id]: 1}}, {[c.id]: 2}); const k1 = Object.keys(out1)[0];
  ok(hasLv1Fx(overlay[k1].effects, c).length === keys.filter(k=> k !== 'stem' && (c.effects || {})[k] !== undefined).length, `1. levelledEnemyDeck: the Level 1 enemy copy of ${c.id} keeps them`);
  Object.keys(overlay).forEach(k=> delete overlay[k]);
  const t0 = R.tutorialLevel0Def(c.id); if(t0) ok(!hasLv1Fx(t0.effects, c).length, `1. tutorialLevel0Def(${c.id}) has no Level 1 skill`); });
// source guards for the builders the vm cannot run whole: every one goes through effectsAtLevel
ok(/hatchling: true\}\); if\(base\.levelSkills\) out\[id\]\.effects = effectsAtLevel\(base, 0\)/.test(app), '1. getCardDefs: the Nest\'s Level 0 (hatchling) def goes through effectsAtLevel');
ok(/if\(lvl === b\)\{[^\n]*base\.levelSkills && lvl < 1\) out\[id\] = Object\.assign\(\{\}, out\[id\] \|\| base, \{effects: effectsAtLevel\(base, lvl\)\}\)/.test(app), '1. getCardDefs: a card at its own Level 0 goes through effectsAtLevel');
ok(/if\(base\.levelSkills\) out\[id\]\.effects = effectsAtLevel\(base, lvl\)/.test(app), '1. getCardDefs: a raised copy goes through effectsAtLevel');
ok(/if\(b\.levelSkills\) o\.effects = effectsAtLevel\(b, L\)/.test(fnSrc('copyDefAt')), '1. copyDefAt goes through effectsAtLevel');
ok(!/Object\.assign\(fx, (b|b0|base)\.levelSkills\[/.test(app.replace(fnSrc('effectsAtLevel'), '')), '1. no builder lays levelSkills on b.effects by itself any more');

// ---- 2. the tutorial decks: no skill at Level 0, either side, T-1 and T-2
const m = /const TUTORIAL_CFG_DEFAULT = \{[^\n]*?myDeck:(\{[^}]*\})[^\n]*?rivalDeck:(\{[^}]*\})[^\n]*?myDeck2:(\{[^}]*\})[^\n]*?rivalDeck2:(\{[^}]*\})/.exec(app);
ok(!!m, '2. TUTORIAL_CFG_DEFAULT has its four decks');
if(m){ const [my1, rv1, my2, rv2] = m.slice(1).map(x=> JSON.parse(x));
  [[my1, 'your T-1'], [rv1, 'rival T-1'], [my2, 'your T-2'], [rv2, 'rival T-2']].forEach(([dk, nm])=>{
    const bad = Object.keys(dk).filter(id=>{ const c = byId[id]; if(!c) return true; const fx = Object.assign({}, c.effects || {}); lvSkillKeys(c).forEach(k=> delete fx[k]); return Object.keys(fx).some(k=> fx[k] !== undefined && fx[k] !== false); });
    ok(!bad.length, `2. ${nm}: no card has a skill at Level 0 (${bad.join(', ') || 'none'})`);
    Object.keys(R.tutorialPlainDeck(dk, 1)).forEach(id=>{ const d = overlay[id] || base[id]; ok(d && Object.keys(d.effects || {}).filter(k=> d.effects[k] !== false).length === 0, `2. ${nm}: ${id} fights with no skill`); }); });
  ok(!('honey-bee' in my2) && Object.values(my2).reduce((a, b)=> a + b, 0) === 15, '2. your T-2 deck lost the Honey Bee and kept its 15 cards');
  ok(JSON.stringify(my2) === '{"duckling":1,"pond-duck":3,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2}', '2. your T-2 deck: the Honey Bee became a Pond Duck');
  const sql = fs.readFileSync(path.join(ROOT, 'supabase/proposed/20261030_tutorial_t1t2_decks.sql'), 'utf8');
  const upd = (sql.match(/^update card_overrides[\s\S]*?;$/gm) || []);
  ok(upd.length === 2 && upd.every(u=> /where id = '__cfg:tutorial'/.test(u) && /and deleted = false/.test(u) && /and data #> '\{cfg,(rivalDeck2|myDeck2)\}' = /.test(u)), '2. SQL: two guarded updates on __cfg:tutorial (rivalDeck2, myDeck2)');
  const mine = upd.find(u=> /\{cfg,myDeck2\}',\s*'/.test(u));
  ok(mine && mine.includes(JSON.stringify(my2)) && mine.includes('"honey-bee":1') && /guard|still holds/.test(sql), '2. SQL: the myDeck2 update sets the built-in deck, only while the row holds the 10-22 deck (with the Honey Bee)');
  ok(/"apply it"/.test(sql) && /Rollback \(both decks\)/.test(sql) && /\{cfg,myDeck2\}[\s\S]*honey-bee/.test(sql.slice(sql.indexOf('Rollback'))), '2. SQL: "apply it" note and a rollback of both decks'); }

console.log(`tut3-2026-10-30: ${n - fail}/${n} passed, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
