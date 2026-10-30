#!/usr/bin/env node
// 2026-10-30 (package TUT2). Owner decisions 10-30 10:34: SKL0-1 "yes definitely" (every T-1 / T-2 card fights at Level 0), "T-1/T-2 won't have
// swarm or flying. Same for all the Map 0 to T1-T2 base cards. All start at lvl 0 and have no skills till lvl 1. Map 0 slowly introduces them at
// lvl 1."; ENG13-3 "just use logic and reduce it, no need to remeasure." (Canopy Cover); ENG13-2 "maybe just sloth titan, old-growth tortoise and
// garden snail (if garden snail is T1-T2 card, then it only gets it at lvl 1). The price should be *0.85 instead. So it has more budget!".
// Covers: the mtut12 cards have no skill at Level 0 and theirs at Level 1 (levelSkills), within budget at both; every T-1 / T-2 copy is Level 0
// on both sides (tutorialLevel0Def / tutorialPlainDeck on the real arena_app.js code), no Flying exception in the mask; the built-in rival
// decks and the proposed SQL; Canopy Cover's price and note; Slow on the three cards and its x0.85 in the budget.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a + 1, i + 1); }
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/map-pools.json'), 'utf8')).maps;
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8'));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(table), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const skillsAt = (c, lv)=>{ const fx = Object.assign({}, c.effects || {}); const ls = c.levelSkills || {};
  if(lv === 0) Object.keys(ls).filter(k=> +k > 0).forEach(k=> Object.keys(ls[k]).forEach(x=> delete fx[x]));
  else Object.keys(ls).filter(k=> +k <= lv).forEach(k=> Object.assign(fx, ls[k])); return fx; };

// ---- 1. the mtut12 cards: no skill at Level 0, theirs at Level 1, within budget at both
const T12 = pools.m1.submaps.mtut12;
ok(JSON.stringify(T12) === JSON.stringify(['bee-knight', 'earthworm', 'pond-trout', 'silver-minnow', 'duckling', 'cottontail', 'crossed-eyes']), '1. mtut12 is the seven T-1 / T-2 cards');
T12.forEach(id=>{ const c = byId[id]; ok(!!c, '1. ' + id + ' exists'); if(!c) return;
  const e = Object.keys(c.effects || {}), ls1 = Object.keys((c.levelSkills || {})[1] || {});
  ok(e.every(k=> ls1.includes(k)), `1. ${id}: every skill arrives at Level 1 (effects ${e.join(',') || '-'}; levelSkills 1 ${ls1.join(',') || '-'})`);
  ok(Object.keys(skillsAt(c, 0)).length === 0, `1. ${id}: no skill at Level 0`);
  ok(e.every(k=> k in skillsAt(c, 1)), `1. ${id}: its skills at Level 1`);
  [0, 1].forEach(lv=>{ const st = G.statsAtLevel(c, lv), b = T.budget(Object.assign({}, c, {attack: st.attack, health: st.health, effects: skillsAt(c, lv)}), {level: lv});
    ok(b.ok, `1. ${id} Level ${lv} ${st.attack}/${st.health} within budget (2A+H+S ${b.x1} <= N ${b.N}; cap 2 ${b.x2} <= ${b.N2})`); }); });
{ const bee = byId['bee-knight']; ok(JSON.stringify(bee.levelSkills) === '{"1":{"swarm":true,"flying":true}}' && bee.effects.flying && bee.effects.swarm, '1. Bee Knight: Flying and Swarm both at Level 1; its printed Level 1 card keeps both'); }

// ---- 2. every T-1 / T-2 copy is Level 0, both sides (the real tutorialLevel0Def / tutorialPlainDeck)
{ const overlay = {}, base = Object.assign({}, L.CARD_DEFS_BASELINE);
  // a first T-1: no copies yet, so every card is at its own level (Base cards Level 1); the defs as getCardDefs gives them
  const defs = Object.fromEntries(Object.entries(base).map(([id, d])=> [id, Object.assign({}, d, {level: G.cardBaseLevel(d)})]));
  const c = {getCardDefs: ()=> defs, copyBaseDef: id=> L.CARD_DEFS_BASELINE[id] || null, cardBaseLevel: G.cardBaseLevel, statsAtLevel: G.statsAtLevel, matchDefsOverlay: overlay, Number, Object};
  vm.createContext(c); vm.runInContext(fnSrc('tutorialLevel0Def') + '\n' + fnSrc('tutorialPlainDeck') + '\n;this.R = {tutorialLevel0Def, tutorialPlainDeck};', c);
  const R = c.R;
  T12.forEach(id=>{ const z = R.tutorialLevel0Def(id), d = defs[id], fx = z ? z.effects : d.effects;
    const lv = z ? z.level : d.level; ok(lv === 0 && Object.keys(fx || {}).length === 0, `2. ${id}: dealt at Level 0 with no skill (${z ? z.id : 'as is'}, L${lv}, ${JSON.stringify(fx)})`); });
  const pt = R.tutorialLevel0Def('pond-trout'), s0 = G.statsAtLevel(byId['pond-trout'], 0);
  ok(pt && pt.id === 'pond-trout~tut0' && pt.attack === s0.attack && pt.health === s0.health && pt.hatchling, `2. a Base card (own level 1) gets its Level 0 copy: Pond Trout ${pt && pt.attack}/${pt && pt.health}`);
  ok(R.tutorialLevel0Def('earthworm') === null && R.tutorialLevel0Def('crossed-eyes') === null, '2. a card already at Level 0 with no later skill is dealt as it is');
  // the decks the tutorial deals, both sides (TUTORIAL_CFG_DEFAULT's own)
  const m = /const TUTORIAL_CFG_DEFAULT = \{[^\n]*?myDeck:(\{[^}]*\})[^\n]*?rivalDeck:(\{[^}]*\})[^\n]*?myDeck2:(\{[^}]*\})[^\n]*?rivalDeck2:(\{[^}]*\})/.exec(app);
  ok(!!m, '2. TUTORIAL_CFG_DEFAULT has its four decks');
  if(m){ const [my1, rv1, my2, rv2] = m.slice(1).map(x=> JSON.parse(x));
    [[my1, 'your T-1'], [rv1, 'rival T-1'], [my2, 'your T-2'], [rv2, 'rival T-2']].forEach(([dk, nm])=>{ const out = R.tutorialPlainDeck(dk, 1);
      const bad = Object.keys(out).filter(id=>{ const d = overlay[id] || defs[id]; return !d || d.level !== 0; });
      ok(!bad.length, `2. ${nm}: every copy Level 0 (${bad.join(', ') || 'all'})`); });
    // 3. the built-in rival decks follow TUT2's measure (200 seeds, all Level 0: T-1 93% / 100%, T-2 76% / 95%)
    ok(JSON.stringify(rv1) === '{"duckling":3,"earthworm":3,"harvest-mouse":3,"silver-minnow":3}', '3. built-in T-1 rival deck = the live row\'s T-1 deck');
    ok(JSON.stringify(rv2) === '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"meadow-rabbit":1,"silver-minnow":2}', '3. built-in T-2 rival deck (no Flying Honey Bees)');
    ok(Object.keys(rv1).concat(Object.keys(rv2)).every(id=> !Object.keys((byId[id] || {}).effects || {}).length), '3. the rival decks hold no card with a skill');
    // 2026-10-30 TUT3: the SQL now also updates cfg.myDeck2, and its rollback block is laid out as "Before, for rollback" with both decks
    const sql = fs.readFileSync(path.join(ROOT, 'supabase/proposed/20261030_tutorial_t1t2_decks.sql'), 'utf8');
    ok(sql.includes(JSON.stringify(rv2)) && /"apply it"/.test(sql) && /cfg\.rivalDeck2 \{"duckling":3[^\n]*\n--   cfg\.myDeck2/.test(sql) && /where id = '__cfg:tutorial'/.test(sql), '3. the proposed SQL sets the same T-2 deck on __cfg:tutorial, with the before value for rollback'); } }
ok(/rivalCounts = tutorialPlainDeck\(tutDecks\.rival, st\)/.test(app) && /deckCounts = tutorialPlainDeck\(tutDecks\.mine, st\)/.test(app), '2. both T-1 / T-2 decks go through tutorialPlainDeck');
ok(/const TUT12_SHOWN = new Set\(\[\]\);/.test(app), '2. the T-1 / T-2 mask has no Flying exception (TUT12_SHOWN empty)');

// ---- 4. Canopy Cover
{ const row = table.skills.find(r=> r.id === 'canopyCover'), S = require(path.join(ROOT, 'tools', 'tut2_canopy_share_2026_10_30.js')).share();
  ok(BB.CANOPY_SHARE === 0.22 && row && row.attackShare === BB.CANOPY_SHARE, `4. Canopy Cover's attack share 0.22 in the budget and the table (${BB.CANOPY_SHARE}, ${row && row.attackShare})`);
  ok(Math.abs(S.share - BB.CANOPY_SHARE) < 0.01, `4. the share still matches the map lists (${S.covered} / ${S.attacks} = ${S.share})`);
  ok(Math.abs(BB.canopyMultOf({canopyCover: true}) - (1 + 0.37 * 0.4 * 0.22)) < 1e-9 && BB.canopyMultOf({canopyCover: true}) < 1.148, `4. multiplier x${BB.canopyMultOf({canopyCover: true})} (was x1.148)`);
  ok(row && /2026-10-30/.test(row.note) && row.note.includes('just use logic and reduce it, no need to remeasure.') && /162 of 739/.test(row.note), '4. the entry\'s note: date, owner quote, the count'); }

// ---- 5. Slow
{ const row = table.skills.find(r=> r.id === 'slow');
  ok(row && row.scale === 'mult' && row.value === 0.85 && row.note.includes('The price should be *0.85 instead'), '5. Slow is a x0.85 multiplier in canonical/skill-costs.json (was fixed -0.8)');
  ok(BB.SLOW_S_MULT === 0.85 && BB.slowSMultOf({slow: true}, row) === 0.85 && BB.slowSMultOf({}, row) === 1, '5. bramblewood-budget.js slowSMultOf');
  ok(T.cardS({slow: true}).S === 0 && Math.abs(T.cardS({armor: 1, slow: true}).S - T.cardS({armor: 1}).S * 0.85) < 0.011, `5. Slow alone costs 0; with Armor 1 the S is x0.85 (${T.cardS({armor: 1}).S} -> ${T.cardS({armor: 1, slow: true}).S})`);
  ['ancient-sloth-titan', 'old-growth-tortoise', 'garden-snail'].forEach(id=>{ const c = byId[id]; ok(c && c.effects.slow === true, `5. ${id} has Slow`);
    const lv = SC.levelOf(c), b = T.budget(c), raw = T.cardS(Object.fromEntries(Object.entries(c.effects).filter(([k])=> k !== 'slow')), c).S;
    ok(b.ok && Math.abs(b.S - raw * 0.85) < 0.011, `5. ${id} (Level ${lv}): S ${raw} -> ${b.S}, 2A+H+S ${b.x1} <= N ${b.N}; cap 2 ${b.x2} <= ${b.N2}`); });
  ok(!T12.includes('garden-snail') && !(byId['garden-snail'].levelSkills), '5. the Garden Snail is not on mtut12: Slow from Level 0'); }

console.log(`tut2-2026-10-30: ${n - fail}/${n} passed, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
