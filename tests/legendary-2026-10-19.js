#!/usr/bin/env node
// 2026-10-18 (package LG, the owner's 23:05 notes). Covers:
//   1. True Strike still ignores every plain miss and dodge: Evasive, Swift, Flying, Shadow in the dark, Smoke, Illusory (a raid
//      boss's 2 in 3), Slippery, Ashy and Sandstorm, in melee; Evasive for its shots (dodgeCheck).
//   2. A Legendary dodge still dodges True Strike: a defender whose effect value carries legendary:true (evasive {legendary:true},
//      illusory {chance, legendary:true}) or a source listed in the engine's LEGENDARY_DODGES; a plain attacker is dodged by it as
//      by the plain one. No dodge in the game is Legendary yet (Illusory stays plain).
//   3. The Legendary ability tier: legendary:true on True Strike, Supreme and Supreme Tide (PASSIVE_DEFS, SKILL_DEFS, skill-costs);
//      the gold tag on the White Dragon's True Strike line, the card glossary's "Legendary ability" line, the Skills Codex tag;
//      the TX keys, under 20 words, in all 12 packs.
//   4. docs/decisions.json (and the generated decisions.md): the Shadow of the Valley of Death is a far-future map, the Pall Wraith
//      stays in the Eye of the Volcano (20-A); the Legendary rules.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100000, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, base, {
  'lg-true': U('lg-true', {trueStrike:true}),
  'lg-true-shot': U('lg-true-shot', {trueStrike:true, arrow:1}, {attack:0}),
  'lg-plain': U('lg-plain', {}),
  'lg-plain-shot': U('lg-plain-shot', {arrow:1}, {attack:0}),
  'lg-dodger': U('lg-dodger', {evasive:true, swift:true, flying:true, shadow:true, illusory:0.9}, {attack:0}),
  'lg-evasive': U('lg-evasive', {evasive:true}, {attack:0}),
  'lg-leg-evasive': U('lg-leg-evasive', {evasive:{legendary:true}}, {attack:0}),
  'lg-leg-illusory': U('lg-leg-illusory', {illusory:{chance:1, legendary:true}}, {attack:0}),
  'lg-swift': U('lg-swift', {swift:true}, {attack:0}),
});
function mk(rules, seed){
  const engine = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, rules: rules || {}});
  return {engine, P: {1: engine.newPlayer(1, {}), 2: engine.newPlayer(2, {})}};
}
const liveOf = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && !c.gap);
function spawn(k, pid, id){ const ev = []; ok(k.engine.debugSpawnCard(k.P, so, pid, id, 'left', {}, ev), `spawn ${id}`); return liveOf(k.P[pid]).find(c=> c.defId === id); }
function tally(k, att, rounds, prep){ const t = {hit:0, evaded:0, reasons:{}, ranged:0};
  for(let r = 0; r < rounds; r++){ if(prep) prep(); const ev = []; k.engine.resolveCombat(k.P, so, {}, ev, r % 2 ? 1 : 2);
    ev.forEach(e=>{ if(e.attUid !== att.uid) return; if(e.type === 'hit') t.hit++; if(e.type === 'evaded' || e.type === 'blindMiss'){ t.evaded++; t.reasons[e.reason || e.type] = (t.reasons[e.reason || e.type] || 0) + 1; if(e.ranged) t.ranged++; } }); }
  return t; }

// ---- 1. True Strike ignores the plain dodges (Illusory included)
for(const [label, rules] of [['plain field', {}], ['Night (Shadow)', {dark:'dark'}], ['Slippery', {slippery:true}], ['Ashy', {ashy:true}], ['Sandstorm', {sandstorm:true}]]){
  const k = mk(rules, 31), t = spawn(k, 1, 'lg-true'), d = spawn(k, 2, 'lg-dodger');
  const r = tally(k, t, 40, ()=>{ d.smoke = 2; });
  ok(r.hit >= 38 && r.evaded === 0, `${label}: True Strike never misses a Smoky Evasive Swift Flying Shadow Illusory unit (${r.hit} hits, ${r.evaded} misses)`);
}
{ const k = mk({}, 33), t = spawn(k, 1, 'lg-plain'), d = spawn(k, 2, 'lg-dodger'); const r = tally(k, t, 40);
  ok(r.evaded > 20, `a plain attacker misses that unit most of the time (${r.evaded} of ${r.hit + r.evaded})`); }
{ const k = mk({}, 35), t = spawn(k, 1, 'lg-true-shot'); spawn(k, 2, 'lg-evasive'); const r = tally(k, t, 40);
  ok(r.hit >= 20 && r.evaded === 0, `True Strike's shots never miss an Evasive unit (${r.hit} hits, ${r.evaded} misses)`); }

// ---- 2. a Legendary dodge still dodges True Strike
{ const k = mk({}, 37), t = spawn(k, 1, 'lg-true'); spawn(k, 2, 'lg-leg-evasive'); const r = tally(k, t, 120);
  ok(r.evaded > 35 && r.hit > 35 && r.reasons.evasive === r.evaded, `a Legendary Evasive dodges True Strike about half the time (${r.evaded} of ${r.hit + r.evaded})`); }
{ const k = mk({}, 39), t = spawn(k, 1, 'lg-plain'); spawn(k, 2, 'lg-leg-evasive'); const r = tally(k, t, 120);
  ok(r.evaded > 35 && r.hit > 35, `and a plain attacker, as plain Evasive would (${r.evaded} of ${r.hit + r.evaded})`); }
{ const k = mk({}, 41), t = spawn(k, 1, 'lg-true'); spawn(k, 2, 'lg-leg-illusory'); const r = tally(k, t, 30);
  ok(r.hit === 0 && r.evaded >= 28 && r.reasons.illusory === r.evaded, `a Legendary Illusory {chance:1} dodges every True Strike swing (${r.evaded} dodged, ${r.hit} hits)`); }
{ const k = mk({}, 43), t = spawn(k, 1, 'lg-true-shot'); spawn(k, 2, 'lg-leg-evasive'); const r = tally(k, t, 120);
  ok(r.evaded > 15 && r.hit > 15 && r.ranged === r.evaded, `True Strike's shots (dodgeCheck): a Legendary Evasive dodges them (${r.evaded} of ${r.hit + r.evaded})`); }
{ const k = mk({}, 45), t = spawn(k, 1, 'lg-true'); spawn(k, 2, 'lg-swift');
  ok(k.engine.LEGENDARY_DODGES && typeof k.engine.legendaryDodge === 'function', 'the engine exports the hook (LEGENDARY_DODGES, legendaryDodge)');
  ok(Object.keys(k.engine.LEGENDARY_DODGES).length === 0, 'no dodge source is Legendary yet');
  ok(!k.engine.legendaryDodge('illusory', 0.667) && !k.engine.legendaryDodge('evasive', true), 'Illusory and plain Evasive are not Legendary');
  ok(tally(k, t, 20).evaded === 0, 'True Strike ignores Swift');
  k.engine.LEGENDARY_DODGES.swift = true; const r = tally(k, t, 120); delete k.engine.LEGENDARY_DODGES.swift;
  ok(r.evaded > 35 && r.reasons.swift === r.evaded, `a whole source listed in LEGENDARY_DODGES (Swift, for the test) dodges True Strike (${r.evaded} of ${r.hit + r.evaded})`); }

// ---- 3. the Legendary ability tier
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
for(const key of ['trueStrike', 'supreme', 'supremeTide']) ok(new RegExp(`\\{key:'${key}', category:'passive', label:'[^']+', kind:'boolean', legendary:true\\b`).test(src), `PASSIVE_DEFS: ${key} is Legendary`);
ok(((src.match(/^  \{key:'\w+'[^\n]*\blegendary:true\b/gm) || []).length) === 3, 'exactly three Legendary abilities in PASSIVE_DEFS');
ok(/legendary:p\.legendary,/.test(src), 'SKILL_DEFS carries the marker');
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const leg = sc.skills.filter(s=> s.legendary).map(s=> s.id).sort();
  ok(JSON.stringify(leg) === '["supreme","supremeTide","trueStrike"]', `canonical/skill-costs.json marks the same three (${leg})`);
  ok(sc.skills.find(s=> s.id === 'trueStrike').value === 2, 'True Strike still costs 2'); }
const words = s=> String(s).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w=> /[\p{L}\p{N}]/u.test(w)).length;
ok(TEXT['ui.legendary-tag'] === 'Legendary' && TEXT['ui.legendary-ability'] === 'Legendary ability', 'the tag and glossary name');
ok(TEXT['ui.legendary-ability-desc'] === 'A legendary power. Rarely found on cards you can own — dragons are the exception.' && words(TEXT['ui.legendary-ability-desc']) < 20, 'the Legendary ability line, under 20 words');
ok(/only a Legendary dodge can/.test(TEXT['ui.sk-true-strike-codex']) && /Illusory/.test(TEXT['ui.sk-true-strike-codex']), 'the True Strike Codex note names the Legendary exception');
for(const code of ['de', 'fr', 'es', 'ja', 'zh-Hans', 'it', 'pt', 'ko', 'zh-Hant', 'id', 'tl', 'ta']){
  const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  ok(['ui.legendary-tag', 'ui.legendary-ability', 'ui.legendary-ability-desc', 'ui.sk-true-strike-codex'].every(k=> typeof pk[TEXT[k]] === 'string' && pk[TEXT[k]] && pk[TEXT[k]] !== TEXT[k] || k === 'ui.legendary-tag' && pk[TEXT[k]]), `${code}: the Legendary texts are translated`);
  ok(!("No Darkness, Blind or dodge stops it (Evasive, Flying, Smoke, Illusory…). It still can't hit what is Invisible." in pk), `${code}: the old True Strike note is gone`);
}
// the White Dragon's card lines (the description tables in a sandbox, as tests/d-2026-10-19.js loads them)
{ const L = src.split('\n'), lineOf = (re, from)=> L.findIndex((l, i)=> i >= (from || 0) && re.test(l));
  const stub = new Proxy(function(){ return ''; }, {get:(t, k)=> k === Symbol.toPrimitive ? ()=> '' : stub, apply:()=> ''});
  const cardDefs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; cardDefs[c.id] = d; });
  const g0 = {TX, console, Math, JSON, Object, Array, String, Number, Set, Map, RegExp, Date, Symbol, Boolean, Error, parseInt, parseFloat, isNaN, Infinity, NaN, undefined,
    getCardDefs: ()=> cardDefs, escapeHtml: s=> String(s), escapeAttr: s=> String(s), i18nHtmlText: s=> s, adminModeEnabled: false, EXILE_ZONE_NAME: 'Removal Zone'};
  // 2026-10-21 (package TT, after TX): the real type hierarchy, not the catch-all stub (speciesLine calls TAXO.ancestors(x).has), as tests/d-2026-10-19.js
  g0.BramblewoodTaxonomy = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
  const ctx = vm.createContext(new Proxy(g0, {has: ()=> true, get: (t, k)=> k in t ? t[k] : (typeof k === 'string' && /^[A-Z_]+$/.test(k) ? {} : stub), set: (t, k, v)=>{ t[k] = v; return true; }}));
  const a1 = lineOf(/^const SKILL_ICON = /), b1 = lineOf(/^function cardName\(/, a1);
  const code = L.slice(a1, b1).join('\n').replace(/\/\* ---- Skill reveal[\s\S]*?\[SKILL_REVEAL_END\] \*\//, 'function maskHiddenSkills(d){ return d; } function hiddenSkillsOf(){ return []; } function skillHiddenNow(){ return false; }')
    + '\n;this.__X = {describeEffects, keywordizeLines, legendaryTagHTML, SKILL_DEFS};';
  let X = null; try{ vm.runInContext(code, ctx); X = ctx.__X; }catch(e){ ok(false, 'the card text tables load in a sandbox: ' + e.message); }
  if(X){
    const wl = X.describeEffects(cardDefs['white-dragon']) || [], ts = wl.find(l=> /True Strike/.test(l)) || '';
    ok(/True Strike <b class="kw kw-legendary" title="A legendary power\. Rarely found on cards you can own — dragons are the exception\.">Legendary<\/b> — Its attacks never miss\./.test(ts), `the White Dragon's True Strike line has the gold Legendary tag (${ts.slice(0, 160)})`);
    ok(wl.some(l=> /Supreme <b class="kw kw-legendary"/.test(l)), 'its Supreme line too');
    ok(!wl.some(l=> /Flying <b class="kw kw-legendary"|Scare[^—]*kw-legendary/.test(l)), 'its plain skills have no tag');
    const bl = X.describeEffects(cardDefs['blue-dragon']) || [];
    ok(bl.some(l=> /Supreme Tide<\/span> <b class="kw kw-legendary"/.test(l)), 'the Blue Dragon\'s Supreme Tide line has it');
    const pw = X.describeEffects(cardDefs['pall-wraith']) || []; ok(pw.length && !pw.some(l=> /kw-legendary/.test(l)), 'a card without a Legendary ability shows no tag');
    const kz = X.keywordizeLines(wl), g = kz.gloss.find(x=> x.name === 'Legendary ability');
    ok(!!g && g.text === TEXT['ui.legendary-ability-desc'], 'the card\'s glossary explains "Legendary ability"');
    ok(kz.lines.some(l=> /<b class="kw kw-legendary"[^>]*>Legendary<\/b>/.test(l)), 'the keyword marks leave the tag whole');
    ok(!X.keywordizeLines(pw).gloss.some(x=> x.name === 'Legendary ability'), 'no Legendary gloss without the tag');
    ok(X.SKILL_DEFS.filter(s=> s.legendary).map(s=> s.key).sort().join() === 'supreme,supremeTide,trueStrike', 'SKILL_DEFS: the three Legendary abilities');
    ok(X.legendaryTagHTML({}) === '' && X.legendaryTagHTML({legendary:true}).includes('kw-legendary'), 'legendaryTagHTML');
  }
}
// the Codex's skills book (package C, 2026-10-18): each skill entry carries legendary, and its heading shows the tag
ok(/return \{ch:'sk', key:p\.key, icon:SKILL_ICON\[p\.key\] \|\| '✨', name:p\.label, legendary:!!p\.legendary\b/.test(src), 'the skills book entry carries the Legendary marker');
ok(/<h4>\$\{escapeHtml\(e\.name\)\}\$\{legendaryTagHTML\(e\)/.test(src), 'the Skills Codex shows the tag after the skill name');
ok(/find:\(p\.label \+ ' ' \+ p\.key \+ ' ' \+ \(p\.legendary \? TX\('ui\.legendary-ability'\) \+ ' ' : ''\)/.test(src), 'the Codex filter finds "legendary"');
ok(/\.kw\.kw-legendary\{[^}]*background:linear-gradient\(180deg,#f7dc7e,#c99a22\)/.test(fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8')), 'the tag is gold');

// ---- 4. the decisions
{ const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8')), md = fs.readFileSync(path.join(ROOT, 'docs', 'decisions.md'), 'utf8');
  const r = (D.rules || []).find(x=> /\(23:05\)/.test(x.intro || ''));
  ok(!!r && r.date === '2026-10-18', 'a dated rules section for the owner\'s 23:05 notes');
  const all = r ? r.items.join('\n') : '';
  ok(/Shadow of the Valley of Death is a very far future map/.test(all) && /Pall Wraith \(`pall-wraith`[^)]*\) lives in the Eye of the Volcano \(20-A/.test(all), 'the far-future map, and the Pall Wraith in the Eye of the Volcano until then');
  ok(/True Strike is affected by Legendary dodges/.test(all) && /Illusory is not Legendary/.test(all), 'the Legendary dodge rules');
  ok(md.includes('**Shadow of the Valley of Death is a very far future map.**') && md.includes('## Stated rules · 2026-10-18'), 'decisions.md is regenerated with it');
  // 2026-10-21 (package TT): package RP ("submaps get 1 unique card each") moved it to 20-5 (docs/balance/rewards-pass-2026-10-21.md), as tests/d-2026-10-19.js
  const pwc = cards.find(c=> c.id === 'pall-wraith'); ok(pwc && pwc.source && pwc.source.kind === 'map' && pwc.source.id === 'm11' && pwc.source.node === '20-5', 'the Pall Wraith\'s card reward is 20-5 (moved off 20-A-2 by package RP)'); }

console.log(`legendary-2026-10-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
