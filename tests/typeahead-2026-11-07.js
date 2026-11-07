#!/usr/bin/env node
// 2026-11-07 (owner 21:15: "When I type a letter while in the choose-a-skill dropdown(s), jump to that section! E.g. N brings me to the section
// that contains Nocturnal. DONT SPLIT THE DROPDOWN"): the in-page select menu (inPageSelects) jumps to the next option starting with the typed
// letter (leading emoji skipped), cycles on a repeat, takes a quick run of letters as a prefix, and Enter picks it. Runs the built index.html.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  x', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/owner 21:15: "When I type a letter/.test(app) && /let typed = '', typedAt = 0;/.test(app), 'type-ahead lives in inPageSelects');
(async()=>{
  const {chromium} = require('playwright'); const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1200, height:800}});
  await p.addInitScript(()=> localStorage.setItem('bramblewood_arena_tutorial_done', '1'));
  await p.goto('file://' + path.join(ROOT, 'index.html')); await p.waitForTimeout(2500);
  await p.evaluate(()=>{ const sel = document.createElement('select'); sel.id = 'tsel';
    // the card editor's skill key picker: one alphabetical list, an emoji before each name (skillRowHTML)
    sel.innerHTML = SKILL_DEFS.filter(x=> !x.hidden && x.category !== 'evergreen').sort((a,b)=> a.label.localeCompare(b.label)).map(x=> `<option value="${x.key}">${SKILL_ICON[x.key] || '•'} ${x.label}</option>`).join('');
    sel.style.cssText = 'position:fixed;top:20px;left:20px;z-index:99999'; document.body.appendChild(sel); });
  await p.mouse.click(40, 30); await p.waitForTimeout(200);
  const focus = ()=> p.evaluate(()=>{ const m = document.querySelector('.bw-sel-menu'), a = document.activeElement, r = m.getBoundingClientRect(), q = a.getBoundingClientRect();
    return {name: a.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim(), visible: q.top >= r.top && q.bottom <= r.bottom}; });
  await p.keyboard.press('n'); let f = await focus(); ok(/^n/i.test(f.name) && f.visible, 'N jumps to an N skill, in view: ' + f.name);
  const first = f.name; await p.waitForTimeout(800); await p.keyboard.press('n'); f = await focus(); ok(/^n/i.test(f.name) && f.name !== first, 'N again cycles: ' + f.name);
  await p.waitForTimeout(800); await p.keyboard.press('t'); f = await focus(); ok(/^t/i.test(f.name) && f.visible, 'T jumps: ' + f.name);
  await p.waitForTimeout(800); await p.keyboard.type('noc', {delay:40}); f = await focus(); ok(/^noc/i.test(f.name), 'a quick run "noc" finds Nocturnal: ' + f.name);
  await p.keyboard.press('Enter'); const v = await p.evaluate(()=> document.getElementById('tsel').value); ok(/^nocturnal/i.test(v), 'Enter picks it: ' + v);
  await b.close(); console.log(`typeahead: ${checks - fail}/${checks} checks passed`); process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  x', e.message); process.exit(1); });
