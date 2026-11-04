#!/usr/bin/env node
// 2026-11-04 (package UI19, owner 2026-11-03 23:01 / 23:12 and 11-04 07:42): static checks, no browser:
//   1 Swarm N is a number field again and a row's own N is not carried over from the old effects on Save
//   2 the Card editor layout: one flag row, Cost / Pitch / Reward in one row, Resistances / From / Stats by level after the abilities, no budget explanations
//   3 the name scroll: fixed end width (--nm-cap), the text shrinks (nmFitScale) before it wraps; the helper behaves
//   4 Art height (artPosY): editor field, save, render
//   5 the Map cards window's skills and NEW! (ui19McSkillRows on stubs)
//   6 every new text is a TX key with a row in the 12 language packs
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const grab = (name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };

// 1
ok(/data-sk="valN" data-i="\$\{i\}" aria-label/.test(src) && /<input type="number" min="1" max="9" step="1" class="w-52" data-sk="valN"/.test(src), '1. Swarm N is a visible number input');
ok(!/<input type="hidden" data-sk="valN"/.test(src), '1. the hidden N field is gone');
ok(/SKILL_DEFS\.some\(s=> s\.numberKey === k\)\) return;/.test(src), '1. Save does not bring back an old swarmN');
// 2
const form = src.slice(src.indexOf('function renderEditorInner'), src.indexOf('function renderEditorInner') + 60000);
const at = s=> form.indexOf(s);
ok(at('id="fLocked"') > 0 && at('id="fLocked"') < at('data-rflag="${f}"') && at('data-rflag="${f}"') < at('<div class="editor-h2">Stats</div>') && !/<label>Availability<\/label>/.test(form), '2. Locked, Hidden and the source flags share one row, above Stats');
ok(at("box('fCost'") > 0 && at("box('fCost'") < at("box('fPitchValueDisplay'") && at("box('fPitchValueDisplay'") < at("box('fBounty'"), '2. Cost, Pitch, Reward in that order');
ok(/editorPitchColsOf/.test(src) && /lumber: 0, stone: 0, metal: 0/.test(src), '2. Pitch has Lumber, Stone and Metal columns');
ok(at('id="skillRows"') > 0 && at('id="skillRows"') < at('id="resistPills"') && at('id="triggerRows"') < at('id="resistPills"') && at('id="resistPills"') < at('id="cdPlacement"') || at('codexPlacementHTML(c)') > at('id="resistPills"'), '2. Resistances, From and Stats by level come after the abilities');
ok(at('levelStatsEditorHTML(c)') > at('id="triggerRows"'), '2. Stats by level after the abilities');
const bud = grab('ceBudgetHTML');
ok(bud && !/ui\.budget-base-line|sbContextLine|sbFormulaText|ui\.budget-miss/.test(bud) && /statsLine/.test(bud) && /productLine/.test(bud) && /head/.test(bud), '2. the budget keeps head, Stats and Product and drops the explanation lines');
ok(/\.ed-econ\{display:flex; flex-wrap:wrap/.test(css) && /#editorOverlay \.editor-h2\{margin:8px 0 3px/.test(css), '2. compact editor CSS');
// 3
ok(/--nm-cap:clamp\(5px, 5\.6cqw, 14px\)/.test(css) && /left center \/ var\(--nm-cap\) 100%/.test(css) && /right center \/ var\(--nm-cap\) 100%/.test(css), '3. the rolled ends take their width from the card (--nm-cap), not the line count');
ok(/<pattern id='fib'|%3Cpattern%20id='fib'/.test(css), '3. the paper has a fibre / fleck texture');
const ctx = {escapeHtml: s=> String(s)}; vm.createContext(ctx);
vm.runInContext(grab('nmWidthEm') + grab('nmFitScale') + grab('nmPartsEm') + grab('nmWaitEm') + grab('nmHTML') + '\nthis.NM_ROOM_EM = 9.2; this.NM_MIN_SCALE = 0.72;', ctx);
vm.runInContext('var NM_ROOM_EM = 6.8, NM_MIN_SCALE = 0.7, NM_W_CACHE = new Map(), nmCtx = null; this.api = {nmFitScale, nmHTML};', ctx);
const A = ctx.api;
ok(A.nmFitScale('Bee') === 1 && A.nmFitScale('Wolf Pup') === 1, '3. short names keep full size');
const g = A.nmFitScale('Glacial Ape-King'); ok(g < 1 && g >= 0.72, '3. Glacial Ape-King shrinks a little (' + g + ')');
ok(A.nmFitScale('The Extremely Long Named Beast of the Deep Marsh') === 0.7, '3. the shrink stops at the floor');
ok(/class="nmt" style="--nm-s:/.test(A.nmHTML('Glacial Ape-King')) && !/--nm-s/.test(A.nmHTML('Bee')), '3. the scale rides on the name text only when needed');
ok((src.match(/\$\{nmHTML\(/g) || []).length >= 4, '3. every card face uses nmHTML');
// 4
ok(/function artPosStyle/.test(src) && /id="fArtPosY"/.test(src) && /c\.artPosY = Math\.max\(0, Math\.min\(100, n\)\); else delete c\.artPosY/.test(src), '4. Art height: field, save and render');
ok((src.match(/\$\{artPosStyle\(d\)\}/g) || []).length === 2, '4. both art <img> variants carry it');
// 5
const mc = ['ui19McSkillRows', 'ui19McEarlierSkillKeys', 'ui19McSkillText', 'ui19McSkillsHTML'].map(grab).join('\n');
const defs = {a: {id:'a', effects:{swarm:true, flying:true}}, b: {id:'b', effects:{flying:true}, levelSkills:{3:{venom:true}}}, c: {id:'c', effects:{}}};
const S = {swarm:{key:'swarm', label:'Swarm', desc:()=>'swarm text'}, flying:{key:'flying', label:'Flying', desc:()=>'fly text'}, venom:{key:'venom', label:'Venom', desc:()=>'venom text'}};
const c5 = {ui18CardSkillKeys: d=> [...Object.keys(d.effects).map(k=> ({key:k, lvl:0})), ...Object.entries(d.levelSkills || {}).flatMap(([L, o])=> Object.keys(o).map(k=> ({key:k, lvl:+L})))],
  skillDefOf: k=> S[k], skillText: (p, v)=> p.desc(v), SKILL_ICON: {}, escapeHtml: s=> String(s), escapeAttr: s=> String(s), TX: (k, v)=> k === 'ui.ui19-mc-count' ? `${v.n} of ${v.total} cards` : k === 'ui.ui19-mc-new' ? 'NEW!' : k,
  mapNumberOf: id=> ({m0:0, m1:1, m2:2})[id], mainConquestMaps: ()=> [{id:'m0'}, {id:'m1'}, {id:'m2'}], mapPoolSections: id=> [{key:'cards', ids: id === 'm0' ? ['a'] : []}]};
vm.createContext(c5); vm.runInContext(mc + '\nthis.api = {ui19McSkillRows, ui19McEarlierSkillKeys, ui19McSkillsHTML};', c5);
const rows = c5.api.ui19McSkillRows(['a', 'b', 'c'], defs);
ok(rows.length === 3 && rows.find(r=> r.key === 'flying').ids.length === 2 && rows.find(r=> r.key === 'venom').lvl === 3, '5. skills counted per card, a later-level skill included');
ok([...c5.api.ui19McEarlierSkillKeys('m1', defs, ()=> true)].sort().join() === 'flying,swarm', '5. earlier maps: the skills of lower-numbered maps');
const html = c5.api.ui19McSkillsHTML('m1', ['a', 'b', 'c'], defs, ()=> true);
ok(/data-ui19-skill="venom"[^>]*>[\s\S]*?NEW!/.test(html) && !/data-ui19-skill="swarm"[^>]*>[^]*?NEW![^]*?data-ui19-skill/.test(html.replace(/data-ui19-skill="venom"[\s\S]*$/, '')) && /2 of 3 cards/.test(html), '5. NEW! only on a skill no earlier map has; "2 of 3 cards"');
ok(c5.api.ui19McSkillsHTML('m0', ['a'], defs, ()=> true).split('NEW!').length - 1 === 2, '5. the first map: every skill is NEW!');
ok(/\$\{\(\(\)=>\{ try\{ return ui19McSkillsHTML\(top/.test(src), '5. the Map cards window draws the block');
// 6
const keys = ['swarm-n', 'swarm-n-tip', 'swarm-per', 'art-y', 'art-y-tip', 'mc-skills', 'mc-new', 'mc-new-tip', 'mc-count', 'mc-none'].map(k=> 'ui.ui19-' + k);
ok(keys.every(k=> TEXT[k]), '6. the ten TX keys exist');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  ok(keys.every(k=> pack[TEXT[k]] !== undefined), '6. ' + code + ' has all the rows');
}
console.log(`ui19: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
