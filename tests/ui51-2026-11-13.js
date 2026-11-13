#!/usr/bin/env node
// 2026-11-13 (package UI51, owner notes 11-13 11:08 / 11:22 / 11:25):
//   1. new art drops the art rejection (card editor; tools/art set_art), and importers replace only art rejected with a reason (--force otherwise)
//   2. no pull-to-refresh (overscroll-behavior-y on html / body); the back gesture closes the top panel, asks in a fight or the deck editor, leaves from a plain screen
//   4. the travel beat is off (BramblewoodWorld.travelBeat false; the Effects Lab still calls travel())
//   5. a card picture that fails loads again (online / page shown / backoff) instead of staying on its icon
//   6. Blind's swing has no blindfold band
//   7-9. Map cards window: the Prospects list is not drawn twice, tiles skip off-screen layout, side-map shortcut, the card opens the editor (no pencil)
//   13. review marks (Maybe / Unlikely) are thin solid rings, not a token's dashed edge
//   15. Delete deck in the deck editor: tap twice; never the only deck
//   --no-browser skips the browser part (the real page at 1366 and 390).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('arena_app.js'), css = rd('arena_template.html');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && !--d) return src.slice(i, k + 1); } return ''; };

ok(/^## 2026-11-13 Package UI51/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui51-2026-11-13\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
// 1
ok(/const newArt = v=>\{[^\n]*applyArtReview\(editingCard, false\)[^\n]*rs\.value = ''/.test(src) && (src.match(/newArt\(/g) || []).length >= 2, '1 the editor\'s URL and upload go through newArt, which drops the review and empties the reason');
{ const py = `import sys, json; sys.path.insert(0, 'tools/art'); import art2_import_2026_10_29 as a2
t = open('canonical/cards.json', encoding='utf-8').read(); cid = json.loads(t)[3]['id']; k = '"id": "%s",' % cid
r = t.replace(k, k + '\\n    "artReview": {\\n      "status": "rejected",\\n      "reason": "blurry"\\n    },', 1)
c = [x for x in json.loads(a2.set_art(r, cid, 'n.png')) if x['id'] == cid][0]
print(json.dumps({'gone': 'artReview' not in c, 'art': c['art'], 'may': a2.may_replace(r, cid), 'mayNo': a2.may_replace(t, cid), 'force': a2.may_replace(t, cid, True)}))`;
  let o = null; try{ o = JSON.parse(cp.execFileSync('python3', ['-c', py], {cwd: ROOT, encoding: 'utf8'}).trim().split('\n').pop()); }catch(e){ console.log('  (python check failed: ' + e.message.slice(0, 120) + ')'); }
  ok(o && o.gone && o.art === 'n.png', '1 set_art writes the art and drops artReview ' + JSON.stringify(o));
  ok(o && o.may === true && o.mayNo === false && o.force === true, '1 may_replace: only art rejected with a reason, or --force');
  ['art2_import_2026_10_29', 'art7_import_2026_11_03', 'art8_import_2026_11_03', 'art9_import_2026_11_05', 'art12_import_2026_11_12'].forEach(f=>{ const t = rd('tools/art/' + f + '.py');
    ok(/'--force'/.test(t) && /may_replace\(text, cid, a\.force\)/.test(t), `1 ${f}: --force and the may_replace skip before the picture is written`); }); }
// 2
ok(/html, body\{overscroll-behavior-y:contain;\}/.test(css), '2 no pull-to-refresh');
ok(/addEventListener\('popstate', ui51Back\.onPop\)/.test(src) && /addEventListener\('pointerdown', ui51Back\.push, true\)/.test(src), '2 the back guard is wired (pushed on a tap)');
ok((src.match(/addEventListener\('beforeunload'/g) || []).length === 1 && /beforeunload', e=>\{ if\(deckDirty\)/.test(src), '2 no new beforeunload nag (only unsaved deck edits)');
// 4
ok(/travelBeat: false/.test(rd('bramblewood-ui-world.js')) && /if\(moved && root\.BramblewoodWorld\.travelBeat\) return travel/.test(rd('bramblewood-ui-world.js')), '4 travel beat off by one flag; travel() kept for the Lab');
// 5
ok((src.match(/onerror="bwArtFail\(this\)"/g) || []).length === 2 && !/onerror="this\.style\.display='none'/.test(src), '5 both card-art templates go through bwArtFail');
ok(/addEventListener\('online', bwArtRetryAll\)/.test(src) && /visibilitychange/.test(fnSrc('bwArtRetryAll') + src.slice(src.indexOf('function bwArtRetryAll'), src.indexOf('function bwArtRetryAll') + 1200)), '5 retried on online and visibility');
// 6
ok(!/fxa-band/.test(rd('bramblewood-fx-a.js')) && /M\.blindSwing = function/.test(rd('bramblewood-fx-a.js')), '6 Blind swing without the blindfold band');
// 7-9
ok(/prosKey/.test(fnSrc('pk1OpenMapCards')) && /let nmFontOk = false/.test(src), '7 the replaced list is drawn without tiles; the font check is cached');
ok(/\.pk1-mc-body \.ui37-tile, \.pk1-mc-body \.rv1-part \.rv1-tile\{content-visibility:auto;/.test(css), '7 off-screen tiles skip layout and paint');
ok(!/ui13EditBtnHTML|data-ui13-edit/.test(src) && !/\.ui13-edit\{/.test(css), '9 no pencil button');
ok(/closest\('\.rv1-tile \.vis4-mc-card'\)/.test(fnSrc('pk1OpenMapCards')), '9 the card opens the editor');
ok(/ui51MapLinksHTML\(mapId, top\)/.test(fnSrc('pk1OpenMapCards')) && /mpSubsOf\(top\)/.test(fnSrc('ui51MapLinksHTML')), '8 side-map shortcut');
// 13
ok(!/vis4-mc-card(\.is-large)?\{outline:2px dashed/.test(css), '13 no dashed review outlines on map-card tiles');
// 15
ok(/id="deckDeleteBtn"/.test(src) && /ui\.ui51-deck-delete-again/.test(src) && /deleteDeck\(deckEditingId\)/.test(src), '15 Delete deck in the editor, tap twice');
ok(!/confirm\(TX\('dialog\.delete-this-deck/.test(src), '15 no browser confirm for decks');
const texts = rd('bramblewood-texts.js');
['ui.ui51-deck-delete', 'ui.ui51-deck-delete-tip', 'ui.ui51-deck-delete-only', 'ui.ui51-deck-delete-again', 'ui.ui51-deck-deleted', 'ui.ui51-side-maps', 'ui.ui51-main-map'].forEach(k=> ok(texts.includes(`"${k}"`), 'text ' + k));

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const http = require('http'), mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml'};
  const srv = http.createServer((q, r)=>{ const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'Content-Type': mime[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r=> srv.listen(0, '127.0.0.1', r)); const URL = `http://127.0.0.1:${srv.address().port}/index.html`;
  const INIT = "try{ localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); }catch(e){}"; // about:blank has no storage
  const UNLOCK = "(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} try{ saveTutorialDone(true); saveTutorial2Done(true); }catch(e){} adminModeEnabled = true; return 1; })()";
  const b = await pw.chromium.launch({executablePath: EXE, args: ['--no-sandbox']}); const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 860}});
      let cut = true; await ctx.route('**/assets/cards/**', r=> cut ? r.abort('connectionreset') : r.continue());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(w + ' ' + String(e))); pg.setDefaultTimeout(120000);
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 180000}); await pg.waitForTimeout(2500); await pg.evaluate(UNLOCK);
      // 5: art cut mid-load, then the network is back
      await pg.evaluate("switchTab('codex')"); await pg.waitForTimeout(2000);
      const art = "(()=>{ const im = [...document.querySelectorAll('#view-codex .card-tile img.card-art-img')].filter(i=> i.getBoundingClientRect().top < innerHeight); return {n: im.length, shown: im.filter(i=> i.style.display !== 'none' && i.complete && i.naturalWidth > 0).length, failed: im.filter(i=> i.style.display === 'none').length}; })()";
      const a0 = await pg.evaluate(art); cut = false;
      await pg.evaluate("dispatchEvent(new Event('online'))"); await pg.waitForTimeout(2500);
      const a1 = await pg.evaluate(art);
      ok(a0.n > 0 && a0.failed === a0.n && a1.shown === a1.n, `@${w} 5 art cut: ${a0.failed}/${a0.n} on their icon; back online: ${a1.shown}/${a1.n} pictures`);
      // 2: back closes the panel, then leaves from a plain screen
      await pg.mouse.click(5, w < 700 ? 400 : 300); await pg.waitForTimeout(200);
      ok(await pg.evaluate("!!(history.state && history.state.bwBack)"), `@${w} 2 a tap pushes the back guard`);
      await pg.evaluate("pk1OpenMapCards('m1')"); await pg.waitForTimeout(1500);
      // 7-9 on the open window
      const mc = await pg.evaluate("(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'); return {pencil: ov.querySelectorAll('[data-ui13-edit], .ui13-edit').length, links: [...ov.querySelectorAll('.ui51-maps [data-ui51-go]')].map(b=> b.dataset.ui51Go), title: ov.querySelector('#pk1McTitle').textContent, cards: ov.querySelectorAll('.rv1-tile .vis4-mc-card').length, prosTiles: ov.querySelectorAll('#ui37Pros .ui37-tile').length, cv: getComputedStyle(ov.querySelector('#ui37Pros .ui37-tile') || ov).contentVisibility}; })()");
      ok(mc.pencil === 0 && mc.cards > 0 && mc.prosTiles > 0 && mc.cv === 'auto', `@${w} 9/7 no pencil, ${mc.cards} cards, Prospects tiles content-visibility ${mc.cv}`);
      ok(mc.links.length > 0, `@${w} 8 Map 0 lists its side maps ${JSON.stringify(mc.links)}`);
      if(mc.links.length){ await pg.click(`#pk1MapCardsOverlay [data-ui51-go="${mc.links[0]}"]`); await pg.waitForTimeout(1500);
        const back = await pg.evaluate("[...document.querySelectorAll('#pk1MapCardsOverlay .ui51-maps [data-ui51-go]')].map(b=> b.dataset.ui51Go)");
        ok(back.length === 1 && back[0] === 'm1', `@${w} 8 the side map links back to its main map ${JSON.stringify(back)}`);
        await pg.click('#pk1MapCardsOverlay [data-ui51-go="m1"]'); await pg.waitForTimeout(1500); }
      await pg.click('#pk1MapCardsOverlay .rv1-tile .vis4-mc-card'); await pg.waitForTimeout(1200);
      ok(await pg.evaluate("!document.getElementById('editorOverlay').hidden && !!editingCard"), `@${w} 9 a click on the card opens the card editor`);
      // 1: a new picture in the editor drops the rejection and its reason
      const ed = await pg.evaluate("(()=>{ applyArtReview(editingCard, true, 'too dark'); const chk = document.getElementById('edArtRejectedChk'), rs = document.getElementById('edArtReason'); if(chk){ chk.checked = true; rs.hidden = false; rs.value = 'too dark'; } const u = document.getElementById('ceArtUrl'); u.value = 'assets/cards/new-pic.webp'; u.dispatchEvent(new Event('change', {bubbles: true})); return {review: editingCard.artReview || null, chk: chk ? chk.checked : null, reason: rs ? rs.value : null, art: editingCard.art}; })()");
      ok(!ed.review && ed.chk === false && ed.reason === '' && ed.art === 'assets/cards/new-pic.webp', `@${w} 1 editor: new art drops the review and its reason ${JSON.stringify(ed)}`);
      await pg.evaluate("closeCardEditor()"); await pg.waitForTimeout(800);
      await pg.goBack().catch(()=>{}); await pg.waitForTimeout(800);
      const s1 = await pg.evaluate("({url: location.href, open: !document.getElementById('pk1MapCardsOverlay').hidden, guard: !!(history.state && history.state.bwBack)})");
      ok(!s1.open && /index\.html/.test(s1.url) && s1.guard, `@${w} 2 back closes the Map cards window and stays ${JSON.stringify(s1)}`);
      // 15: delete a deck from the editor (tap twice); the only deck cannot go
      const d0 = await pg.evaluate("(()=>{ adminModeEnabled = false; while(myDecks.length > 1) deleteDeck(myDecks[myDecks.length - 1].id); switchTab('deck'); const d = createNewDeck(); deckEditingId = d.id; deckShowList = false; renderDeckSection(); return {n: myDecks.length, id: d.id}; })()");
      await pg.waitForTimeout(600);
      await pg.click('#deckDeleteBtn'); const armed = await pg.evaluate("document.getElementById('deckDeleteBtn').textContent");
      await pg.click('#deckDeleteBtn'); await pg.waitForTimeout(600);
      const d1 = await pg.evaluate(`({n: myDecks.length, gone: !myDecks.some(d=> d.id === '${d0.id}'), active: myDecks.some(d=> d.id === activeDeckId), main: myDecks.some(d=> d.id === mainDeckId), editing: deckEditingId, tomb: !!deckSyncRead(deckSyncKey(DECK_SYNC_TOMBS_KEY))['${d0.id}']})`);
      ok(d0.n === 2 && /again/i.test(armed) && d1.n === 1 && d1.gone && d1.active && d1.main && d1.tomb, `@${w} 15 two taps delete the deck (cloud tomb), another stays active ${JSON.stringify({armed, d1})}`);
      await pg.evaluate("deckEditingId = activeDeckId; deckShowList = false; renderDeckSection()"); await pg.waitForTimeout(500);
      const only = await pg.evaluate("(()=>{ const b = document.getElementById('deckDeleteBtn'); b.click(); b.click(); return {dis: b.getAttribute('aria-disabled'), n: myDecks.length, tip: b.title}; })()");
      ok(only.dis === 'true' && only.n === 1, `@${w} 15 the only deck: Delete is off ${JSON.stringify(only)}`);
      // 2: back in the deck editor goes to the deck list; back in a fight asks
      await pg.mouse.click(5, 200).catch(()=>{}); await pg.goBack().catch(()=>{}); await pg.waitForTimeout(800);
      ok(await pg.evaluate("!deckEditingId && /index\\.html/.test(location.href)"), `@${w} 2 back leaves the deck editor for the list`);
      await pg.evaluate("(()=>{ try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){} deckSizeOkOrWarn = ()=> true; /* a fresh profile owns no starter copies */ switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); })()"); await pg.waitForTimeout(4000);
      await pg.mouse.click(5, 5).catch(()=>{}); await pg.waitForTimeout(200); await pg.goBack().catch(()=>{}); await pg.waitForTimeout(1200);
      const f = /index\.html/.test(pg.url()) ? await pg.evaluate("({dlg: !!document.querySelector('.bw-text-dialog'), inMatch: !!matchState && !matchState.over, url: location.href})") : {url: pg.url()};
      if(!f.inMatch){ ok(false, `@${w} 2 back in a fight ${JSON.stringify(f)}`); await ctx.close(); continue; }
      ok(f.dlg && f.inMatch && /index\.html/.test(f.url), `@${w} 2 back in a fight asks (forfeit dialog) and stays ${JSON.stringify(f)}`);
      await pg.evaluate("document.querySelectorAll('.bw-text-dialog').forEach(d=> d.remove()); matchState.over = true; switchTab('home')"); await pg.waitForTimeout(800);
      await pg.goBack().catch(()=>{}); await pg.waitForTimeout(1500);
      ok(!/index\.html/.test(pg.url()), `@${w} 2 from a plain screen back leaves the page (${pg.url()})`);
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 2).join(' | ') + ')');
}

(process.argv.includes('--no-browser') ? Promise.resolve() : browser()).then(()=>{
  console.log(`ui51: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
}).catch(e=>{ console.log('  x', e && e.stack || e); console.log(`ui51: ${n - fail}/${n + 1} passed`); process.exit(1); });
