#!/usr/bin/env node
// 2026-11-10 (package ENG42, owner 11-10 11:31: "Thematic wise - don't care about the skills first ... just focus on art description and
// name. We can retroactively change the skills."; docs/project-state.md section 7). Checks:
//   1. no selfish boon's theme reads a skill: Rising Tide, Wild Rage, Siege Train and Sky Ambush count taxonomy Types, each a known node;
//      `who` (the units the effect lands on) is as it was (Tide, Rage, Siege, Flying);
//   2. the themes follow name and art: a bird with no Flying counts for Sky Ambush, a Flying fish does not; a snapping turtle and a nutria
//      count for Rising Tide, a leech does not; a boar and a Tasmanian devil count for Wild Rage, a fox does not; a rhino and a badger
//      count for Siege Train, a mouse does not;
//   3. the texts name the creatures, not the skill (bramblewood-texts.js and the 12 language packs);
//   4. the before / after measure is written (docs/balance/eng42/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js')), T = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), D = {};
(Array.isArray(cards) ? cards : Object.values(cards)).forEach(c=>{ D[c.id] = c; });
const DX = JSON.parse(JSON.stringify(D)); if(E.SKILL_PARAMS_LIB) E.SKILL_PARAMS_LIB.expandDefsInPlace(DX);
const SB = E.SELFISH_BOONS, FOUR = {risingTide: 'tide', wildRage: 'rage', siegeTrain: 'siege', skyAmbush: 'flying'};

// ---- 1. themes by Type
Object.keys(SB).forEach(id=> ok(!((SB[id].theme || {}).skills || []).length, `1. ${id}: its theme reads no skill`));
Object.keys(FOUR).forEach(id=>{ const t = SB[id].theme.types || [];
  ok(t.length > 0, `1. ${id}: its theme is a list of Types`);
  const unknown = t.filter(x=> !T.NAMES[T.key(x)]); ok(!unknown.length, `1. ${id}: every Type is a taxonomy node (${unknown.join(', ')})`);
  ok(JSON.stringify(SB[id].who) === JSON.stringify({skills: [FOUR[id]]}), `1. ${id}: who is still the ${FOUR[id]} units`); });

// ---- 2. name and art
const th = (id, b)=> !!E.selfishBoonThemeOf(DX[id], SB[b]);
[['vigil-owl', 'skyAmbush', true], ['eyrie-warden', 'skyAmbush', true], ['sulfur-cinder-moth', 'skyAmbush', true], ['echo-screecher', 'skyAmbush', true], ['cave-olm', 'skyAmbush', false],
 ['snapper-hatchling', 'risingTide', true], ['nutria-reedcutter', 'risingTide', true], ['reef-shark', 'risingTide', true], ['horseshoe-crab', 'risingTide', true], ['bog-leech', 'risingTide', false],
 ['berserker-boar', 'wildRage', true], ['tasmanian-devil', 'wildRage', true], ['swift-fox', 'wildRage', false], ['fawn-scout', 'wildRage', false],
 ['siege-rhino', 'siegeTrain', true], ['badger-sapper', 'siegeTrain', true], ['trebuchet-crew', 'siegeTrain', true], ['mouse-sapper', 'siegeTrain', false]]
  .forEach(([id, b, want])=> ok(DX[id] && th(id, b) === want, `2. ${id} ${want ? 'counts' : 'does not count'} for ${b}`));
ok(!E.selfishBoonThemeOf({archetypes: ['Fish'], species: ['Fish'], effects: {flying: true}}, SB.skyAmbush), '2. a Flying fish is not winged (the skill does not count)');
ok(!E.selfishBoonThemeOf({archetypes: ['Mouse'], species: ['Rodent'], effects: {tide: true, rage: true, siege: 1}}, SB.risingTide)
  && !E.selfishBoonThemeOf({archetypes: ['Mouse'], species: ['Rodent'], effects: {rage: true}}, SB.wildRage)
  && !E.selfishBoonThemeOf({archetypes: ['Mouse'], species: ['Rodent'], effects: {siege: 1}}, SB.siegeTrain), '2. Tide, Rage and Siege on a mouse do not count');
{ const st = E.selfishBoonCount(DX, {'snapper-hatchling': 3, 'nutria-reedcutter': 5, 'bog-leech': 4, 'mangrove-mudskipper': 1, 'venomlord-serpent': 1}, 'risingTide');
  ok(st.have === 9 && st.on, `2. a Gator Hollow deck counts 9 of 14 for Rising Tide (${st.have}/${st.total})`); }

// ---- 3. texts
const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'), val = k=> { const m = tx.match(new RegExp('"' + k.replace(/[.-]/g, '\\$&') + '":\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m ? JSON.parse('"' + m[1] + '"') : null; };
const EN = {};
Object.keys(FOUR).forEach(id=>{ const long = val('ui.df3-' + id), short = val('ui.pl1-boon-theme-' + id); EN[id] = [long, short];
  ok(long && !/deck has /.test(long) && /deck are /.test(long), `3. ui.df3-${id} names the creatures: ${long}`);
  ok(short && !/^(Tide|Siege|Flying|Rage or Berserk)$/.test(short), `3. ui.pl1-boon-theme-${id} is not the skill: ${short}`); });
ok(/Quick and have \+1 Attack while the tide is in/.test(EN.risingTide[0]), '3. Rising Tide still names its +1 Attack (tests/bal3-2026-10-24.js 4)');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = [].concat(...Object.values(EN)).filter(s=> !p[s]); ok(!miss.length, `3. lang/${c}.json translates the new boon texts (${miss.length} missing)`); });

// ---- 4. the measure
['before', 'after'].forEach(l=>{ let j = null; try{ j = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'eng42', l + '-2026-11-10.json'), 'utf8')); }catch(e){}
  ok(j && j.rows && j.rows.some(r=> r.code === '5-A-2') && j.rows.some(r=> r.code === '8-A-3'), `4. docs/balance/eng42/${l}-2026-11-10.json has the boon fights`); });

console.log(`eng42-2026-11-10: ${checks - fail}/${checks} passed${fail ? `, ${fail} failed` : ''}`);
process.exit(fail ? 1 : 0);
