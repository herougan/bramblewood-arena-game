#!/usr/bin/env node
// 2026-11-28 (package UIORDER1, owner 03:07): every list of a card's skills reads in one order: zeitgebers (Tide, Flying, Diurnal ...) first, then the passives
// (On Play kinds, then permanent, then per-turn), then the triggers. One comparator (skillOrderRank / skillOrderSort); ties keep today's order.
// Surfaces checked: describeEffects (hover, detail, Codex), abilityBadges (card face), cardTileHTML (list tile), fullCardHTML (detail card).
// Static checks always run; the browser part runs when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

ok(/function skillOrderRank\(/.test(app) && /function skillOrderSort\(/.test(app), 'one shared comparator exists');
ok(/skillOrderSort\(uo1R/.test(app) && /skillOrderSortChips\(out, kOf\)/.test(app), 'describeEffects and abilityBadges both use it');
// the comparator on its own (no browser)
{ const i = app.indexOf('const SKILL_ORDER_SETS'), j = app.indexOf('// a strip of chips (abilityBadges)');
  const { skillOrderRank, skillOrderSort } = new Function(app.slice(i, j) + '\nreturn {skillOrderRank, skillOrderSort};')();
  const g = k=> skillOrderRank(k);
  ok(['tide', 'flying', 'diurnal', 'nocturnal', 'fullMoon', 'rainrunner', 'crepuscular'].every(k=> g(k) === 0), 'zeitgebers are group 0');
  ok(['pounce', 'trap', 'bulwark', 'gash', 'offspring'].every(k=> g(k) === 1), 'On Play kinds are group 1');
  ok(['thorns', 'armor', 'guardian', 'poison', 'someNewSkill'].every(k=> g(k) === 2), 'permanent (and unnamed) are group 2');
  ok(['arrow', 'snipe', 'regen', 'forestry', 'sleepPowder', 'fireBolt'].every(k=> g(k) === 3), 'per-turn are group 3');
  ok(['onTrigger', 'onDeathSpawn', 'meiosis'].every(k=> g(k) === 4), 'triggers are group 4');
  ok(g('diurnalGrant') === 0 && g('tideGrant') === 0, 'a Grant twin ranks as its base');
  const out = skillOrderSort(['arrow', 'thorns', 'pounce', 'flying', 'armor', 'regen'], k=> k);
  ok(out.join() === 'flying,pounce,thorns,armor,arrow,regen', 'sorted: ' + out.join() + ' (ties keep their order)'); }

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({executablePath: EXE}), errs = [];
  try{
    const pg = await b.newPage({viewport:{width:1366, height:900}}); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil:'domcontentloaded', timeout:90000});
    await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout:90000});
    const r = await pg.evaluate(()=>{
      const mk = (id, effects)=> ({id, name:id, attack:2, health:3, cost:1, rarity:'common', cardType:'creature', effects});
      const A = mk('uo-a', {arrow:1, thorns:2, pounce:1, flying:true, diurnal:1, armor:1, triggers:[{on:'onDeath', do:'drawCard', count:1}]});
      const B = mk('uo-b', {arrow:1, thorns:2, flying:true, pounce:1});
      const defs = getCardDefs(); defs['uo-a'] = A; defs['uo-b'] = B;
      const strip = h=> [...(h.match(/data-ik="[^"]+"/g) || [])].map(x=> x.slice(9, -1));
      const rk = k=> skillOrderRank(k);
      const lines = describeEffects(A, null, {terse:true}).map(l=> l.replace(/<[^>]+>/g, ''));
      const tile = cardTileHTML(B), full = fullCardHTML('uo-b', null);
      const row = h=>{ const box = document.createElement('div'); box.innerHTML = h; return strip(box.querySelector('.badges') ? box.querySelector('.badges').outerHTML : ''); };
      return {lines, face: strip(abilityBadges(B, {})), tile: row(tile), full: row(full), hover: describeEffects(B, null, {terse:true}).map(l=> l.replace(/<[^>]+>/g, '')), rk: ['flying', 'pounce', 'thorns', 'arrow'].map(rk)};
    });
    const first = (arr, ...w)=> w.map(x=> arr.findIndex(l=> l.indexOf(x) >= 0));
    const asc = a=> a.every((v, i)=> v >= 0 && (i === 0 || v > a[i - 1]));
    ok(asc(first(r.lines, 'Diurnal', 'Flying', 'Pounce', 'Thorns', 'Arrow', 'On Death')), 'describeEffects (hover / detail / Codex): Diurnal, Flying, Pounce, Thorns, Arrow, then the trigger: ' + JSON.stringify(r.lines.map(l=> l.slice(0, 14))));
    ok(r.face.join() === 'flying,pounce,thorns,arrow', 'card face strip: ' + r.face.join());
    ok(r.tile.join() === 'flying,pounce,thorns,arrow', 'list tile strip: ' + r.tile.join());
    ok(r.full.join() === 'flying,pounce,thorns,arrow', 'detail card strip: ' + r.full.join());
    ok(asc(first(r.hover, 'Flying', 'Pounce', 'Thorns', 'Arrow')), 'hover lines: ' + JSON.stringify(r.hover.map(l=> l.slice(0, 12))));
    ok(r.rk.join() === '0,1,2,3', 'ranks 0,1,2,3 in the page too');
    ok(!errs.length, 'no page errors: ' + errs.join(' | '));
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(fail ? `uiorder1: ${fail} FAILED of ${n}` : `uiorder1: all ${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
