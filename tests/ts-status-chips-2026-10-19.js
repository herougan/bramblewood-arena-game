#!/usr/bin/env node
// 2026-10-19 (package TS, owner 13:37: "In small mode, the status icon is wrongly sized and not fitting the contents! When in mini mode,
// should poison and status symbols be on the top boundary instead?" Yes): a board card's live statuses (Poison, Bleed, Sleep, ...)
// are a strip of small round chips (icon + number) straddling the card's TOP edge, as the skill strip straddles the bottom edge, at
// every card size. The chips never cover the Attack or Health numbers, stay inside the card's width, and past what fits the strip
// condenses into a "+N" chip. Browser check at 390x844 (a raid's small cards and a normal fight) and 1366x768, with a unit holding
// Poison 3, Frozen, Sleep 2 and Bleed 1. TS_SHOTS=before|after saves the screenshots to docs/screens/ts/ (before: no assertions).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SHOTS = process.env.TS_SHOTS || '';
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
if(!SHOTS || SHOTS === 'after'){
  ok(/badges-bottom status-chips/.test(src) && (src.match(/statusChipsHTML\(/g) || []).length >= 3, 'one helper builds the chip strip (fresh render and the live patch)');
  ok(/\.card-tile \.badges-bottom\.status-chips\{/.test(tpl) && /<style id="tsStyles">/.test(tpl), 'the strip has its own CSS');
  ok(/^## 2026-10-19 \(package TS/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
}
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html'), OUT = path.join(ROOT, 'docs', 'screens', 'ts');
  if(SHOTS) fs.mkdirSync(OUT, {recursive:true});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  // put units on the board (front row, and in a raid the middle / back rows), give some the four statuses, redraw
  const SETUP = `(()=>{ const m = matchState, E = m.engine, defs = getCardDefs();
    const ids = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].hidden && (defs[id].attack||0) >= 2 && (defs[id].health||0) >= 4 && defs[id].art && !defs[id].cardType && !defs[id].leader).slice(0, 40);
    const pick = i=> ids[i % ids.length]; let k = 0;
    const st = c=>{ c.poison = 3; c.frozen = 1; c.asleep = 2; c.bleed = 1; };
    [1, 2].forEach(pid=>{ const P = m.players[pid]; E.allBoardCards(P).slice().forEach(c=>{ c.hp = 0; }); E.removeDeadCards(m.players, m.sideOf, {}, m.stats, []);
      [0, -1, 1, -2, 2].forEach(sl=>{ E.debugSpawnCard(m.players, m.sideOf, pid, pick(k++), sl, m.stats, []); });
      if(P.reserve) [1, 2].forEach(r=> [0, -1, 1].forEach(sl=>{ if(!P.reserve[r-1][sl]) E.fillReserve(P, r, sl, pick(k++)); })); });
    const mine = E.allBoardCards(m.players[1]), foe = E.allBoardCards(m.players[2]);
    [mine[0], mine[2], foe[0]].forEach(c=>{ if(c){ st(c); c.wait = 0; } });
    if(mine[1]){ mine[1].poison = 12; mine[1].bleed = 3; mine[1].asleep = 2; mine[1].frozen = 1; mine[1].scar = 2; mine[1].exposed = 2; mine[1].corrode = 1; mine[1].shocked = 1; } // a crowded one: "+N"
    [1, 2].forEach(pid=>{ const P = m.players[pid]; if(P.reserve) [0, 1].forEach(r=>{ const c = P.reserve[r][0]; if(c) st(c); }); });
    if(!m.raidFull){ E.setField(null); try{ renderPlay(); }catch(e){} } // a clear sky for the picture (no fog over the board)
    try{ renderBoard(); }catch(e){}
    return {front: mine.length, reserve: !!m.players[1].reserve}; })()`;
  // where each status strip sits on its card, and whether it covers the Attack / Health numbers
  const MEASURE = `(()=>{ const out = []; const R = e=> e && e.getBoundingClientRect();
    document.querySelectorAll('.board-card').forEach(bc=>{ const tile = bc.querySelector('.card-tile'); if(!tile) return;
      const strip = tile.querySelector('.status-chips') || tile.querySelector('.badges-bottom'); if(!strip) return;
      const t = R(tile), s = R(strip), a = R(tile.querySelector('.atk')), h = R(tile.querySelector('.hp'));
      const hit = (x, y)=> x && y && x.left < y.right - 0.5 && y.left < x.right - 0.5 && x.top < y.bottom - 0.5 && y.top < x.bottom - 0.5;
      const shown = [...strip.children].filter(ch=> getComputedStyle(ch).display !== 'none'), chips = shown.map(ch=> R(ch));
      // what a chip reads: its icon (an emoji picture: its alt) and number; the "+N" chip's number is its ::after
      const said = ch=> ch.classList.contains('sc-more') ? getComputedStyle(ch, '::after').content.replace(/"/g, '') : [...ch.childNodes].map(nd=> nd.nodeType === 3 ? nd.textContent : (nd.alt || nd.textContent || '')).join('');
      out.push({w: Math.round(t.width), cls: strip.className, onTop: s.top < t.top + 2 && s.bottom > t.top - 2, inside: s.left >= t.left - 1 && s.right <= t.right + 1,
        stripH: Math.round(s.height), chipH: chips.length ? Math.round(Math.max(...chips.map(c=> c.height))) : 0, chips: chips.length,
        coversNumbers: chips.some(c=> hit(c, a) || hit(c, h)), more: shown.some(ch=> ch.classList.contains('sc-more')), text: shown.map(said).join(' ') }); });
    return out; })()`;
  try{
    for(const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]){
      for(const kind of ['raid', 'fight']){
        const ctx = await b.newContext({viewport:{width:w, height:h}, isMobile:mobile, hasTouch:mobile, deviceScaleFactor: mobile ? 2 : 1}); const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
        await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2500);
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1");
        if(kind === 'raid') await pg.evaluate("(()=>{ playSubTab='raid'; switchTab('play'); window.payRaidAttempt = ()=> true; window.raidLeaderCapCheck = ()=> ({ok:true}); startRaidPartMatch(activeRaidDef(), 'tail'); return 1; })()");
        else await pg.evaluate("(()=>{ playSubTab='arena'; switchTab('play'); startMatch('ai'); return 1; })()");
        await pg.waitForTimeout(1500); await pg.evaluate("document.querySelectorAll('.vs-screen').forEach(e=> e.click()); 1"); await pg.waitForTimeout(1500);
        await pg.evaluate(SETUP); await pg.waitForTimeout(900);
        await pg.addStyleTag({content: '[class^="coach-"], .coach-tip, .coach-pointer, .coach-spotlight, .coach-shield{display:none !important;}'}); await pg.waitForTimeout(200); // no tutorial tips over the board
        const tag = `${kind}-${w}`;
        if(SHOTS){ await pg.screenshot({path: path.join(OUT, `${SHOTS}-${tag}.png`)});
          // a close-up of the busiest visible stretch: the first visible card with statuses and its neighbours
          const bb = await pg.evaluate(`(()=>{ const vis = [...document.querySelectorAll('.board-card.is-poisoned')].map(e=> e.getBoundingClientRect()).filter(r=> r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth);
            if(!vis.length) return null; const r = vis[0]; return {x: r.left, y: r.top, w: r.width, h: r.height}; })()`);
          if(bb){ const x = Math.max(0, bb.x - bb.w * 1.2), y = Math.max(0, bb.y - 40); await pg.screenshot({path: path.join(OUT, `${SHOTS}-${tag}-zoom.png`), clip:{x, y, width: Math.min(w - x, bb.w * 3.4), height: Math.min(h - y, bb.h + 80)}}); } }
        const ms = await pg.evaluate(MEASURE);
        if(SHOTS === 'before'){ console.log(`  ${tag}: ${ms.slice(0, 4).map(x=> `${x.w}px "${x.text}" h${x.stripH}`).join(' | ')}`); await ctx.close(); continue; }
        ok(ms.length >= 3, `${tag}: units with statuses on the board (${ms.length})`);
        ok(ms.every(x=> /status-chips/.test(x.cls)), `${tag}: every status strip is the chip strip`);
        ok(ms.every(x=> x.onTop), `${tag}: every strip straddles its card's top edge (${ms.filter(x=> !x.onTop).map(x=> x.w).join(',')})`);
        ok(ms.every(x=> x.inside), `${tag}: no strip runs past its card's sides`);
        ok(ms.every(x=> !x.coversNumbers), `${tag}: no chip covers the Attack or Health number`);
        ok(ms.every(x=> x.chipH > 0 && x.chipH <= Math.max(14, x.w * 0.24)), `${tag}: chips scale with the card (chip ${ms.map(x=> x.chipH + '/' + x.w).join(' ')})`);
        ok(ms.some(x=> x.more && /\+\d/.test(x.text)), `${tag}: a crowded strip condenses into "+N" (${ms.filter(x=> x.more).map(x=> x.text).join(' | ')})`);
        // Poison 3, Bleed 1, Sleep 2: a chip each where the card has 3 slots or more; on a 2-slot card, Poison 3 and "+2"
        const three = x=> x.text === '☠3 🩸1 💤2', two = x=> x.text === '☠3 +2';
        ok(ms.some(x=> three(x) || two(x)) && ms.filter(x=> /^☠3 /.test(x.text)).every(x=> three(x) || two(x)), `${tag}: Poison 3, Bleed 1, Sleep 2 read (${ms.slice(0, 3).map(x=> x.text).join(' | ')})`);
        await ctx.close();
      }
    }
  } finally { await b.close(); }
  ok(!errs.length, `no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{
  console.log(fail ? `ts-status-chips-2026-10-19: ${fail} FAILED of ${n}` : `ts-status-chips-2026-10-19: all ${n} passed`);
  process.exit(fail ? 1 : 0);
});
