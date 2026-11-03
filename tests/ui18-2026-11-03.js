#!/usr/bin/env node
// 2026-11-03 (package UI18, owner 22:04 + 22:08): the Codex skill filter, without a browser:
//   1. the helpers (seen skills only, the "mystery" pick, later-level skills) behave on stubbed data
//   2. the filter, the album and the chip row use them; the mystery chip is hidden when no card is a mystery card
//   3. the texts are TX keys with a row in each of the 12 language packs; the CSS exists
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const i = src.indexOf('// UI18_CODEX_SKILLS:BEGIN'), j = src.indexOf('// UI18_CODEX_SKILLS:END');
ok(i > 0 && j > i, 'the UI18 block exists');
const block = src.slice(i, j);

// ---- 1. the helpers on stubs
const DEFS = {swarm: {key:'swarm', label:'Swarm'}, flying: {key:'flying', label:'Flying'}, venom: {key:'venom', label:'Venom'}, stem: {key:'stem', label:'Stem'}};
const bee = {id:'bee-knight', effects:{swarm:true, flying:true}, levelSkills:{1:{swarm:true, flying:true}}};
const grub = {id:'grub', effects:{}, levelSkills:{0:{hatchling:true}}};
const late = {id:'late', effects:{venom:true}, levelSkills:{3:{stem:true}}};
let seen = new Set(['swarm', 'flying']);
const ctx = {adminModeEnabled: false, skillBookEntries: ()=> [...seen].map(k=> ({ch:'sk', key:k})), skillDefOf: k=> DEFS[k] || null, skillValOn: v=> v !== undefined && v !== null && v !== false && v !== 0,
  getCardDefs: ()=> ({bee, grub, late}), easterEggMasked: ()=> false, maskHiddenSkills: d=> d, cardMatchesSkillPick: (d, k)=> !!(d.effects && d.effects[k]), skillHiddenNow: ()=> false,
  copyBaseDef: id=> ({bee, 'bee-knight': bee, late})[id] || null, codexLevelMode: ()=> 'base', cardRevealAfter: ()=> null, revealAfterMet: ()=> true, SKILL_ICON: {swarm:'S', flying:'F'},
  TX: (k, v)=> k === 'ui.codex-skill-lvl' ? `[Lvl ${v.n}]` : `lvl ${v.n}`, escapeAttr: s=> String(s), escapeHtml: s=> String(s)};
vm.createContext(ctx); vm.runInContext(block + '\nthis.api = {ui18SeenSkillKeys, ui18CardSkillKeys, ui18CardHasMystery, ui18MysteryCount, ui18CardMatchesPick, ui18LateSkillFlags};', ctx);
const A = ctx.api;
ok(A.ui18SeenSkillKeys().has('swarm') && !A.ui18SeenSkillKeys().has('venom'), 'the seen set is the skill book entries');
ok(JSON.stringify(A.ui18CardSkillKeys(late).map(x=> x.key + ':' + x.lvl)) === '["venom:0","stem:3"]', 'a card\'s skills include the ones from a later level, with their level');
ok(A.ui18CardSkillKeys(grub).length === 0, 'hatchling is not a skill');
ok(!A.ui18CardHasMystery(bee) && A.ui18CardHasMystery(late), 'a card with a skill you have not seen is a mystery card; Bee Knight is not');
ok(A.ui18MysteryCount() === 1, 'one mystery card in the stub');
ok(A.ui18CardMatchesPick(late, 'mystery') && !A.ui18CardMatchesPick(bee, 'mystery'), 'the mystery pick filters to the mystery cards');
ok(A.ui18CardMatchesPick(late, 'stem') && !A.ui18CardMatchesPick(late, 'flying'), 'a skill a card only gets at Level 3 still finds it');
ok(A.ui18CardMatchesPick(bee, 'swarm'), 'a plain skill still matches');
let f = A.ui18LateSkillFlags('bee-knight', bee);
ok(f.includes('Swarm [Lvl 1]') && f.includes('Flying [Lvl 1]'), 'Bee Knight: Swarm [Lvl 1], Flying [Lvl 1]');
f = A.ui18LateSkillFlags('late', late);
ok(f.includes('? [Lvl 3]') && !f.includes('Stem'), 'a skill you have not seen reads "?" in its flag');
seen = new Set(['swarm', 'flying', 'stem']); f = A.ui18LateSkillFlags('late', late);
ok(f.includes('Stem [Lvl 3]'), 'once seen it is named');
ok(A.ui18LateSkillFlags('grub', grub) === '', 'a card with no later skill has no flag');
seen = new Set(); ctx.adminModeEnabled = true;
ok(A.ui18MysteryCount() === 0 && !A.ui18CardHasMystery(late), 'Admin Mode: no mystery cards');
ok(A.ui18LateSkillFlags('late', late).includes('Venom') === false && A.ui18LateSkillFlags('late', late).includes('Stem [Lvl 3]'), 'Admin Mode names every flagged skill');

// ---- 2. wiring
ok(/want\.every\(k=> ui18CardMatchesPick\(defs\[id\], k\)\)/.test(src), 'the Codex grid filters with ui18CardMatchesPick');
ok(/sk\.every\(k=> ui18CardMatchesPick\(d, k\)\)/.test(src), 'the album filters with it too');
ok(/ui18MysteryCount\(\) \|\| on\.has\(UI18_MYSTERY\)/.test(src), 'the chip is shown only while some card is a mystery card (or while it is picked)');
ok(/ui18LateSkillFlags\(id, d\)/.test(src) && /\$\{tags\.join\(''\)\}\$\{src\}\$\{lateFlags\}/.test(src), 'the Codex tile carries the flags (not the hand or the board)');
ok(src.split('ui18LateSkillFlags(').length - 1 === 3, 'the flags are drawn only by the Codex tile (definition + cache key + tile)');
ok(/function skillPickName\(k\)\{ if\(k === UI18_MYSTERY\)/.test(src), 'the active chip names the mystery pick');
ok(/\.cx-lvlsk\b/.test(css) && /\.cx-sk-chip\.is-mystery/.test(css), 'CSS for the flag and the chip');

// ---- 3. texts
const KEYS = {'ui.codex-skill-mystery': 'Mystery skills', 'ui.codex-skill-mystery-tip': 'Cards with a skill you have not seen yet.', 'ui.codex-skill-lvl': '[Lvl {n}]', 'ui.codex-skill-lvl-tip': 'Gets this skill at Level {n}.'};
Object.keys(KEYS).forEach(k=> ok(TEXT[k] === KEYS[k], 'TX key ' + k));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  Object.values(KEYS).forEach(en=>{ const t = pack[en]; ok(typeof t === 'string' && t.length > 0, `${c}: "${en}" is translated`);
    if(t) ok((en.match(/\{\w+\}/g) || []).join() === (t.match(/\{\w+\}/g) || []).join(), `${c}: "${en}" keeps its placeholders`); }); });
console.log(fail ? `ui18: ${fail} FAILED, ${pass} passed` : `ui18: all ${pass} checks passed`);
process.exit(fail ? 1 : 0);
