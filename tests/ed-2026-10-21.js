#!/usr/bin/env node
// 2026-10-21 (package ED, the owner's Oct 21 list): editor tools and fixes.
//   #14 card editing from the skirmish editor's deck list and a skirmish's deck preview (✏️, admins), and "Art rejected" with a reason,
//       saved on the card as artReview {status:'rejected', reason, at} by saveCard (the card editor's own save: a card_overrides row for a
//       cloud admin; never SQL), an admin 🚫 corner on the tile, Admin's Manage Cards' Art rejected filter
//   #26 the Codex's admin Create card
//   #7  a skirmish's preview shows the enemy's cards at the fight's own enemy level (road curve / the editor's Enemy level / a card
//       level), never at your Forge level; the editor's Enemy level is what the fight uses (roadEnemyLevelExact -> levelledEnemyDeck)
//   #28 the node kind in the skirmish editor's header
//   #10 the deck editors (the skirmish popup, the Camp) rewrite the counts on a +1 / −1 and redraw only on 0 -> 1 / 1 -> 0
//   #9  one result per match: the result is written down the moment it is decided and its resume save dropped; a decided match's
//       resume save is never offered or loaded; a stale copy pays nothing; Quit / Forfeit / Auto-win and the results' buttons wait
//       for the rewards (the admin auto-win + quit + Continue loop, and the non-admin last-blow + quit + Continue loop)
//   #5  Tutorial II's showcase is part 2's lesson card (the Wandering Traveller), not part 1's
// Static and VM checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are
// there, at 1366 (and 390 for the previews), screenshots in docs/screens/ed/. Network requests are blocked (nothing reaches the database).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const re = new RegExp('\\n(?:async )?function ' + name + '\\('); const mm = re.exec(src); if(!mm) return ''; const i = mm.index;
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = start=>{ const i = src.indexOf(start); if(i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };

// ---- #9 one result per match (VM: the real helpers on a fake localStorage)
{ const store = {}; const ls = {getItem: k=> k in store ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const ctx = {localStorage: ls, matchState: null, console, Date, JSON, Math};
  vm.createContext(ctx);
  vm.runInContext([lineOf('const RESUME_KEY'), lineOf('const RESUMABLE_MODES'), lineOf('const RESUME_FIELDS'), lineOf('const RESOLVED_MATCH_KEY'),
    ...['matchUidOf', 'resolvedMatchIds', 'matchAlreadyResolved', 'noteMatchResultDecided', 'matchRewardSettled', 'matchResultPending', 'saveResumeSnapshot', 'clearResumeSnapshot', 'loadResumeSnapshot', 'clearAsyncMatchState'].map(fnSrc),
    'const ASYNC_MATCH_KEY = "x_async"; this.F = {matchUidOf, noteMatchResultDecided, matchAlreadyResolved, saveResumeSnapshot, loadResumeSnapshot, matchRewardSettled, matchResultPending, setM: m=>{ matchState = m; }};'].join('\n'), ctx);
  const F = ctx.F, mk = ()=> ({mode:'conquest', players:{1:{hq:{hp:5}}, 2:{hq:{hp:1}}}, round:4, stats:{}, conquestNode:{mapId:'m1', nodeId:'1-1'}, resolving:false, over:false});
  const m = mk(); F.setM(m); F.saveResumeSnapshot();
  const snap = store['bramblewood_resume_match_v1'];
  ok(snap && JSON.parse(snap).matchUid && JSON.parse(snap).matchUid === m.matchUid, '#9 the resume save carries the match id');
  ok(F.loadResumeSnapshot() && F.loadResumeSnapshot().matchUid === m.matchUid, '#9 before the result, Continue would bring it back');
  ok(F.noteMatchResultDecided(m) === true && m.resultDecided && !m.rewardDuplicate, '#9 the first decision is fresh');
  ok(!store['bramblewood_resume_match_v1'], '#9 the decided match\'s resume save (from before the round) is gone at once');
  ok(F.matchAlreadyResolved(m.matchUid), '#9 the match is written down as decided');
  store['bramblewood_resume_match_v1'] = snap; // the stale save put back (another tab, an old copy)
  ok(F.loadResumeSnapshot() === null && !store['bramblewood_resume_match_v1'], '#9 a decided match\'s resume save is refused (and dropped)');
  const stale = Object.assign(mk(), {matchUid: m.matchUid});
  ok(F.noteMatchResultDecided(stale) === false && stale.rewardDuplicate === true, '#9 a stale copy deciding again is a duplicate: pays nothing');
  F.setM(stale); F.saveResumeSnapshot(); ok(!store['bramblewood_resume_match_v1'], '#9 a decided match is never saved to come back to');
  const other = mk(); F.setM(other); F.saveResumeSnapshot(); const keep = store['bramblewood_resume_match_v1'];
  const m4 = mk(); F.noteMatchResultDecided(m4); ok(store['bramblewood_resume_match_v1'] === keep, '#9 another match\'s resume save is left alone');
  ok(!F.matchRewardSettled({resultDecided:true}) && F.matchResultPending({resultDecided:true}), '#9 decided, rewards not recorded: pending');
  ok(F.matchRewardSettled({resultDecided:true, rewardRecorded:true}) && !F.matchRewardSettled({resultDecided:true, rewardRecorded:true, fightReward:{settled:false}}), '#9 recorded = the local rewards in and the server share settled');
  for(let i = 0; i < 70; i++) F.noteMatchResultDecided(mk()); ok(JSON.parse(store['bramblewood_resolved_matches_v1']).length === 60, '#9 the ledger keeps the last 60'); }
// ---- #9 the wiring (static)
{ const rr = fnSrc('resolveRoundCore'), ov = rr.indexOf('noteMatchResultDecided(m)'), sign = rr.indexOf('await showEndSign(m)');
  ok(ov > 0 && sign > ov, '#9 the result is written down before the end sign plays (the window Quit used)');
  ok(/if\(m\.rewardDuplicate\)\{[^}]*\}\s*else if\(m\.mode==='conquest' && m\.winner===1/.test(rr), '#9 a duplicate skips the whole reward chain (conquest, raids, gauntlet, dungeon …)');
  ok(/!m\.towerReplay && !m\.rewardDuplicate\) heroAwardBattle/.test(rr) && /QUEST_COUNTING_MODES\.has\(m\.mode\) && !m\.towerReplay && !m\.rewardDuplicate/.test(rr) && /!m\.towerRefunded && !m\.rewardDuplicate/.test(rr), '#9 nor XP, quests, the Hero or a Spire refund twice');
  ok(/m\.rewardRecorded = true;[^\n]*\n  \} else if\(!\(opts && opts\.manual\)\)/.test(rr), '#9 rewardRecorded once the result block is done');
  ok(/if\(m && m\.resultDecided\)\{ if\(matchResultPending\(m\)\)\{ showToast\(TX\('toast\.ed-result-saving'\)\); return; \} endMatch\(\); return; \}/.test(fnSrc('leaveMatchResumable')), '#9 Quit after the decision: waits for the rewards, then leaves without a resume save');
  ok(/m\.resultDecided \|\| !FORFEIT_MODES/.test(fnSrc('forfeitMatch')) && /m\.over \|\| m\.resultDecided \|\| !adminModeEnabled/.test(fnSrc('adminAutoWin')), '#9 Forfeit and Auto-win do nothing once the result is decided');
  ok(/matchResultPending\(matchState\)/.test(fnSrc('saveAndExitAsyncMatch')) && /matchState\.resultDecided\) return/.test(fnSrc('saveAsyncMatchState')), '#9 the Async Arena\'s Save & Exit can\'t keep a decided match either');
  ok(/if\(showWinModal\) lockResultButtonsUntilRecorded\(m\)/.test(src), '#9 the results\' buttons are locked until the rewards are recorded');
  ok(/'matchUid'/.test(lineOf('const RESUME_FIELDS')), '#9 RESUME_FIELDS has matchUid'); }

// ---- #7 the enemy level (static)
ok(/const ov = nodeEnemyLevelOverride\(node\); if\(ov != null\) return ov;/.test(fnSrc('roadEnemyLevelExact')), '#7 roadEnemyLevelExact reads the node\'s Enemy level first (the fight: levelledEnemyDeck)');
// 2026-10-30 CS-B: the squad card is the Compact size now ({inPlay:true, size:'compact'})
ok(/cardTileHTML\(edEnemyShownDef\(sumNode, id\), \{inPlay:true(, size:'compact'[^}]*)?\}\)/.test(src) && /data-shown-level="\$\{edShownLevel\(sumNode, id\)\}"/.test(src), '#7 the deck preview draws each enemy card at its shown level, data-shown-level for the hover / details');
ok(/openCardDetail\(b\.dataset\.sqdef, \{shownLevel: \+b\.dataset\.shownLevel\}\)/.test(src) && /defAtShownLevel\(defId, shownLv\)/.test(fnSrc('openCardDetail')) && /opts\.shownLevel != null && isFinite\(opts\.shownLevel\) \? defAtShownLevel/.test(fnSrc('fullCardHTML')), '#7 the details and the hover card read the shown level');
ok(/id="seEnemyLevel"/.test(fnSrc('openSkirmishEditor')) && /'ai','enemyLevel'\]/.test(fnSrc('openSkirmishEditor')), '#7 the skirmish editor has Enemy level (blank = the curve) and a cleared one is saved as null');
ok(!/myCardLevels/.test(fnSrc('defAtShownLevel')) && /statsBeyondLevel\(b0, lvl\)/.test(fnSrc('defAtShownLevel')), '#7 the shown card comes from the shared card, never your Forge levels');
// ---- #28, #26, #14, #10, #5 (static)
ok(/<h2>🛠️ \$\{edNodeKindChipHTML\(draft\)/.test(fnSrc('openSkirmishEditor')), '#28 the kind chip leads the skirmish editor\'s header');
ok(/edCodexCreateBtn\(body\)/.test(fnSrc('renderCodex')) && /if\(!body \|\| !adminModeEnabled/.test(fnSrc('edCodexCreateBtn')), '#26 the Codex has the admin Create card');
ok(/await saveCard\(raw\)/.test(fnSrc('saveArtReview')) && !/\.rpc\(|execute_sql|\.from\(/.test(fnSrc('saveArtReview') + fnSrc('applyArtReview')), '#14 the art review saves through saveCard (card_overrides), no SQL');
ok(/artReviewBadgeHTML\(d\)/.test(fnSrc('cardTileHTML')) && /adminArtRejectedGridHTML\(\)/.test(fnSrc('adminManageCardsGridHTML')) && /artReviewEditorHTML\(c\)/.test(fnSrc('mountEditorSide')), '#14 the 🚫 corner, the Manage Cards filter, the editor\'s field');
ok(/data-ed-edit/.test(fnSrc('edEditCardBtnHTML')) && /edOpenCardEditor\(b\.dataset\.edEdit, overlay/.test(fnSrc('openSkirmishEditor')) && /edOpenCardEditor\(b\.dataset\.edEdit, null/.test(src), '#14 ✏️ in the skirmish editor\'s deck list and the deck preview');
ok(/quick\(id, before\)/.test(fnSrc('openDeckBuilderPopup')) && !/refresh\(\); \}\n/.test(fnSrc('openDeckBuilderPopup').split("ov.addEventListener('click'")[1].split("ov.querySelector('#dbpSearch')")[0]), '#10 the popup\'s clicks no longer redraw the pool');
ok(/fast\(id\), true\)/.test(fnSrc('renderMyDeckPanels')) && /if\(!tentQuickCount\(id, prev\)\) renderMyDeckPanels\(\)/.test(fnSrc('renderMyDeckPanels')), '#10 the Camp\'s plain clicks go through tentQuickCount');
ok(/node\.tutShowcase && defs\[node\.tutShowcase\]/.test(fnSrc('nodeShowcaseId')) && /tutorialShowcaseId\(node\)/.test(fnSrc('tutorialSummaryNode')), '#5 Tutorial II\'s summary carries its own showcase');
// ---- texts in 12 packs
{ const keys = Object.keys(TEXT).filter(k=> /\.ed-/.test(k)); ok(keys.length >= 24, `TX keys (${keys.length})`);
  keys.forEach(k=> ok(new RegExp("TX\\('" + k.replace(/[.-]/g, m=> '\\' + m) + "'").test(src), `TX('${k}') is used`));
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    const miss = keys.filter(k=> !pack[TEXT[k]]); ok(!miss.length, `lang/${c}.json has every ED text (${miss.slice(0, 3).join(', ')})`);
    keys.forEach(k=>{ const ph = (TEXT[k].match(/\{\w+\}/g) || []).sort().join(), tr = ((pack[TEXT[k]] || '').match(/\{\w+\}/g) || []).sort().join(); if(ph !== tr) ok(false, `lang/${c}.json keeps the placeholders of ${k}`); }); }); }
ok(/\.ed-edit-card\{/.test(tpl) && /\.card-tile \.ed-art-badge\{/.test(tpl) && /\.ed-kind-chip\{/.test(tpl), 'the CSS');
ok(/^## 2026-10-21 \(package ED/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

// ---- browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const SHOTS = path.join(ROOT, 'docs', 'screens', 'ed'); fs.mkdirSync(SHOTS, {recursive: true});
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async (w, admin)=>{ const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, hasTouch: w < 500});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort()); // nothing leaves the page
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
    await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
    await pg.evaluate(`FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); adminModeEnabled = ${admin ? 'true' : 'false'}; document.body.classList.toggle('is-admin', adminModeEnabled); 1`); return [ctx, pg]; };
  const startFight = async pg=>{ // Map 0's first plain skirmish, no Energy
    const ok1 = await pg.evaluate(`(()=>{ const m1 = CONQUEST_MAPS.find(m=> m.id === 'm1'); const nd = m1.nodes.find(n=> n.kind === 'skirmish' && !n.dialogue); window.__edNode = nd.key;
      playSubTab = 'conquest'; switchTab('play'); return startConquestMatch('m1', nd.key, {skipEnergyCost:true, noAmbush:true}); })()`);
    for(let i = 0; i < 30; i++){ const st = await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return !!(matchState && matchState.mode === 'conquest' && document.getElementById('rowMine')); })()"); if(st) break; await pg.waitForTimeout(300); }
    await pg.waitForTimeout(1200); return ok1; };
  const gold = pg=> pg.evaluate('Math.round(myCurrencies.gold || 0)');
  try{
    // ===== #9 (non-admin): the last blow lands, Quit during the end sign, Continue
    { const [ctx, pg] = await open(1366, false);
      ok(await startFight(pg), 'B#9 a Map 0 skirmish started');
      await pg.evaluate("saveResumeSnapshot(); window.__edStale = localStorage.getItem(RESUME_KEY); 1");
      ok(await pg.evaluate("!!window.__edStale && JSON.parse(window.__edStale).matchUid === matchState.matchUid"), 'B#9 a resume save of this match exists before the last round (as Quit keeps)');
      const g0 = await gold(pg);
      await pg.evaluate("window.__edM = matchState; matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; resolveRound(); 1"); // the enemy bramble at 0: a real last blow
      let decided = false; for(let i = 0; i < 40 && !decided; i++){ decided = await pg.evaluate("!!(window.__edM.resultDecided)"); if(!decided) await pg.waitForTimeout(100); }
      ok(decided, 'B#9 the result is decided');
      const mid = await pg.evaluate("(()=>{ const m = window.__edM; const was = matchState; leaveMatchResumable(); return {over: m.over, stays: matchState === was, snap: localStorage.getItem(RESUME_KEY), cont: !!loadResumeSnapshot(), recorded: !!m.rewardRecorded}; })()");
      ok(mid.stays && mid.snap === null && !mid.cont, `B#9 Quit while the result is recorded: the fight stays, no resume save, no Continue (${JSON.stringify(mid)})`);
      await pg.evaluate("forfeitMatch(); 1");
      for(let i = 0; i < 80; i++){ if(await pg.evaluate("!!(window.__edM.rewardRecorded)")) break; await pg.waitForTimeout(250); }
      const g1 = await gold(pg);
      ok(await pg.evaluate("window.__edM.over && window.__edM.winner === 1 && window.__edM.endReason !== 'forfeit'"), 'B#9 the win stands (Forfeit did nothing once decided)');
      ok(g1 > g0, `B#9 the win paid (Leaves ${g0} -> ${g1})`);
      await pg.evaluate("localStorage.setItem(RESUME_KEY, window.__edStale); 1"); // the stale save back: Continue?
      const cont = await pg.evaluate("(()=>{ const s = loadResumeSnapshot(); return {snap: !!s, left: localStorage.getItem(RESUME_KEY)}; })()");
      ok(!cont.snap && cont.left === null, 'B#9 the pre-win save is refused: no Continue back into the won fight');
      ok(await pg.evaluate("resumeAbandonedMatchNow() === false"), 'B#9 resumeAbandonedMatchNow refuses it');
      // a stale copy of the same match resolving again pays nothing
      const dup = await pg.evaluate(`(async ()=>{ const g = myCurrencies.gold || 0; endMatch(); const snap = JSON.parse(window.__edStale);
        const engine = makeSimEngine(getCardDefs(), nextMatchRng(), {recordEvents:true, battleMode: snap.battleMode || 'open'});
        matchState = Object.assign({engine, sideOf:id=> id===1?'A':'B', over:false, winner:0, log:[], resolving:false, active:1, turnDone:{1:false,2:false}, awaitingPass:false, speedMult:1}, snap);
        const m = matchState; m.players[2].hq.shield = 0; m.players[2].hq.hp = 0; await resolveRound(); for(let i = 0; i < 60 && !m.rewardRecorded; i++) await sleep(200);
        return {dup: !!m.rewardDuplicate, gain: Math.round((myCurrencies.gold || 0) - g), earned: m.conquestRewardEarned || null}; })()`);
      ok(dup.dup && dup.gain === 0 && !dup.earned, `B#9 a stale copy of the won match pays nothing again (${JSON.stringify(dup)})`);
      // the results' buttons wait for the server's share
      for(let i = 0; i < 40; i++){ const st = await pg.evaluate("(()=>{ const rr = document.querySelector('.rr-stage'); if(rr){ rr.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); return 'rr'; } return document.querySelector('.winloss-card') ? 'done' : ''; })()"); if(st === 'done') break; await pg.waitForTimeout(250); }
      const lock = await pg.evaluate(`(async ()=>{ const m = matchState; m.fightReward = {local:{}, settled:false}; m.winModalDismissed = false; renderMatchUI(); await sleep(100);
        const btns = [...document.querySelectorAll('.winloss-card .winloss-actions button')]; const locked = btns.length > 0 && btns.every(b=> b.disabled);
        const saying = !!document.querySelector('.winloss-card .ed-saving');
        return {n: btns.length, locked, saying}; })()`);
      ok(lock.locked && lock.saying, `B#9 the results' buttons are locked, "Saving your rewards…" (${JSON.stringify(lock)})`);
      await pg.waitForTimeout(1800); // the results card's entrance
      { const st = await pg.evaluate("[...document.querySelectorAll('.winloss-card .winloss-actions button')].map(b=> [b.id, b.disabled, !!b.dataset.edLocked, b.isConnected])");
        ok(st.length && st.every(x=> x[1]), `B#9 still locked while the server's share is out (${JSON.stringify(st)})`); }
      await pg.screenshot({path: path.join(SHOTS, 'results-locked-1366.png')});
      const unlock = await pg.evaluate(`(async ()=>{ matchState.fightReward.settled = true; await sleep(450); const btns = [...document.querySelectorAll('.winloss-card .winloss-actions button')]; return {open: btns.every(b=> !b.disabled), saying: !!document.querySelector('.winloss-card .ed-saving')}; })()`);
      ok(unlock.open && !unlock.saying, `B#9 they open once the reward is recorded (${JSON.stringify(unlock)})`);
      await ctx.close(); }
    // ===== #9 (admin): Auto-win, Quit at once, Continue, Auto-win again
    { const [ctx, pg] = await open(1366, true);
      ok(await startFight(pg), 'B#9a the fight started (admin)');
      await pg.evaluate("saveResumeSnapshot(); window.__edStale = localStorage.getItem(RESUME_KEY); window.__edM = matchState; adminAutoWin(); 1");
      await pg.waitForTimeout(150);
      const q = await pg.evaluate("(()=>{ const was = matchState; leaveMatchResumable(); return {stays: matchState === was, snap: localStorage.getItem(RESUME_KEY), decided: !!window.__edM.resultDecided}; })()");
      ok(q.decided && q.stays && q.snap === null, `B#9a Auto-win then Quit: the fight waits for its rewards, no resume save (${JSON.stringify(q)})`);
      for(let i = 0; i < 80; i++){ if(await pg.evaluate("!!window.__edM.rewardRecorded")) break; await pg.waitForTimeout(250); }
      const g1 = await gold(pg);
      await pg.evaluate("adminAutoWin(); 1"); await pg.waitForTimeout(400);
      ok(await gold(pg) === g1, 'B#9a Auto-win again on the decided fight pays nothing');
      await pg.evaluate("localStorage.setItem(RESUME_KEY, window.__edStale); endMatch(); 1");
      ok(await pg.evaluate("!loadResumeSnapshot() && resumeAbandonedMatchNow() === false"), 'B#9a Continue: no way back into the auto-won fight');
      await ctx.close(); }

    // ===== #7 the enemy level on the preview, #14 ✏️ / art review, #28 the kind chip, #26 Create card, #5 Tutorial II
    for(const w of [1366, 390]){
      const [ctx, pg] = await open(w, true);
      const pick = await pg.evaluate(`(()=>{ // a fight whose road level is over a deck card's own level
        for(const mp of mainConquestMaps()){ for(const nd of mp.nodes){ if(!nd.deck || baseKind(nd.kind||'') === 'tutorial' || nd.cardLevels && Object.keys(nd.cardLevels).length) continue; const L = roadEnemyLevel(nd); if(L < 3) continue;
          const id = Object.keys(nd.deck).find(id=> CARD_DEFS_BASELINE[id] && CARD_DEFS_BASELINE[id].attack > 0 && cardBaseLevel(CARD_DEFS_BASELINE[id]) < L && !CARD_DEFS_BASELINE[id].levelStats);
          if(id) return {map: mp.id, key: nd.key, id, L, kind: nd.kind}; } } return null; })()`);
      ok(!!pick, `B#7@${w} found a fight with a road level over its card's level (${JSON.stringify(pick)})`);
      if(!pick){ await ctx.close(); continue; }
      const sel = `[data-sqdef="${pick.id}"]`;
      const show = async ()=> pg.evaluate(`(()=>{ conquestSelectedMap = '${pick.map}'; conquestSelectedNodeKey = '${pick.key}'; playSubTab = 'conquest'; switchTab('play'); return 1; })()`);
      await pg.evaluate(`(()=>{ adminCompleteNodes('${pick.map}', ['${pick.key}']); myCardLevels['${pick.id}'] = 9; invalidateCardDefs(); return 1; })()`); // Forge: Lv 9, deck revealed
      await show(); await pg.waitForTimeout(900);
      const read = ()=> pg.evaluate(`(()=>{ const b = document.querySelector('${sel}'); if(!b) return null; const t = b.querySelector('.card-tile'); const atk = t.querySelector('.stats .atk'), hp = t.querySelector('.stats .hp');
        const L = +b.dataset.shownLevel, want = statsBeyondLevel(CARD_DEFS_BASELINE['${pick.id}'], Math.max(cardBaseLevel(CARD_DEFS_BASELINE['${pick.id}']), L)), forge = getCardDefs()['${pick.id}'];
        return {L, atk: parseInt((atk||{}).textContent), hp: parseInt((hp||{}).textContent), want, forge: {attack: forge.attack, health: forge.health}, edit: !!b.parentElement.querySelector('[data-ed-edit]')}; })()`);
      let r = await read();
      ok(r && r.L === pick.L && r.atk === r.want.attack && r.hp === r.want.health, `B#7@${w} the preview shows the card at the enemy's Lv ${pick.L} (${JSON.stringify(r)})`);
      ok(r && (r.forge.attack !== r.atk || r.forge.health !== r.hp), `B#7@${w} not at your Forge level (Lv 9: ${r && JSON.stringify(r.forge)})`);
      ok(r && r.edit, `B#14@${w} the deck preview has ✏️ for admins`);
      const hov = await pg.evaluate(`(()=>{ const b = document.querySelector('${sel}'); const h = fullCardHTML('${pick.id}', null, {shownLevel: +b.dataset.shownLevel}); const f = fullCardHTML('${pick.id}', null, {}); return {same: h === f, ok: h.length > 0}; })()`);
      ok(hov.ok && !hov.same, `B#7@${w} the hover card reads the shown level`);
      await pg.evaluate(`document.querySelector('${sel}').click()`); await pg.waitForTimeout(500);
      const det = await pg.evaluate("(()=>{ const o = document.getElementById('cardDetailOverlay'); return {open: !o.hidden, atk: parseInt((o.querySelector('.card-pop-visual-tile .stats .atk')||{}).textContent), art: !!o.querySelector('#edArtReject')}; })()");
      ok(det.open && det.atk === r.want.attack, `B#7@${w} the details show the enemy's stats (${JSON.stringify(det)})`);
      ok(det.art, `B#14@${w} the details have Art rejected for admins`);
      if(w === 1366) await pg.screenshot({path: path.join(SHOTS, `preview-detail-${w}.png`)});
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
      await pg.evaluate("(()=>{ document.querySelectorAll('.toast, .bw-toast').forEach(t=> t.remove()); const p = document.getElementById('conquestNodePanel'); if(p){ p.scrollTop = p.scrollHeight; const s = p.querySelector('.cnp-squad'); if(s) s.scrollIntoView({block:'nearest'}); } return 1; })()"); await pg.waitForTimeout(200);
      await pg.screenshot({path: path.join(SHOTS, `preview-${w}.png`)});
      // the editor's Enemy level: the preview and the fight follow it
      const nodeSet = async v=> pg.evaluate(`(()=>{ const nd = findConquestNode('${pick.map}', '${pick.key}').node; if(${v === null}) delete nd.enemyLevel; else nd.enemyLevel = ${v}; invalidateCardDefs(); return 1; })()`);
      await nodeSet(6); await show(); await pg.waitForTimeout(700); r = await read();
      ok(r && r.L === 6 && r.atk === r.want.attack, `B#7@${w} an Enemy level of 6 shows Lv 6 (${JSON.stringify(r)})`);
      const fight = await pg.evaluate(`(()=>{ const nd = findConquestNode('${pick.map}', '${pick.key}').node; const out = levelledEnemyDeck(nd, nd.deck); return {ids: Object.keys(out), L: roadEnemyLevelExact(nd), br: enemyDeckLevel(nd)}; })()`);
      ok(fight.L === 6 && fight.ids.filter(id=> id.startsWith('${pick.id}')).every(id=> id === '${pick.id}@lv6'), `B#7@${w} the fight deals the same level (${JSON.stringify(fight)})`);
      await nodeSet(null);
      if(w === 1366){
        // #28 + #7 in the skirmish editor; ✏️ opens the card editor over it and closing brings it back
        await pg.evaluate(`openSkirmishEditor('${pick.map}', '${pick.key}'); 1`); await pg.waitForTimeout(600);
        const se = await pg.evaluate(`(()=>{ const ov = document.getElementById('skirmishEditorOverlay'); const chip = ov.querySelector('.modal-head-row h2 .ed-kind-chip'); const el = ov.querySelector('#seEnemyLevel');
          return {chip: chip && chip.textContent, label: KIND_LABEL['${pick.kind}'], ph: el && el.placeholder, val: el && el.value, curve: roadEnemyLevelExact(findConquestNode('${pick.map}', '${pick.key}').node), edits: ov.querySelectorAll('.se-deck [data-ed-edit]').length}; })()`);
        ok(se.chip === se.label, `B#28 the header's kind chip says "${se.label}" (${se.chip})`);
        ok(se.ph === String(se.curve) && se.val === '' && se.edits > 0, `B#7 Enemy level: blank, the curve as its placeholder; ✏️ on the deck (${JSON.stringify(se)})`);
        await pg.evaluate("(()=>{ const el = document.getElementById('seEnemyLevel'); el.value = '6'; el.dispatchEvent(new Event('change')); return 1; })()"); await pg.waitForTimeout(300);
        const se2 = await pg.evaluate(`(()=>{ const s = document.querySelector('#skirmishEditorOverlay .se-deck .se-stack[data-defid="${pick.id}"]'); return {L: s && +s.dataset.shownLevel, note: (document.querySelector('.ed-enemy-level-note')||{}).textContent, br: document.getElementById('seRatingShow').value}; })()`);
        ok(se2.L === 6 && /6/.test(se2.note || ''), `B#7 the editor's deck follows the Enemy level at once (${JSON.stringify(se2)})`);
        await pg.screenshot({path: path.join(SHOTS, 'skirmish-editor-1366.png')});
        await pg.evaluate(`document.querySelector('#skirmishEditorOverlay .se-deck .se-stack[data-defid="${pick.id}"] [data-ed-edit]').click()`); await pg.waitForTimeout(600);
        const ce = await pg.evaluate("({editor: !document.getElementById('editorOverlay').hidden, id: editingCard && editingCard.id, seHidden: document.getElementById('skirmishEditorOverlay').hidden})");
        ok(ce.editor && ce.id === pick.id && ce.seHidden, `B#14 ✏️ opens the card editor on that card (${JSON.stringify(ce)})`);
        await pg.evaluate("closeCardEditor(); 1"); await pg.waitForTimeout(300);
        ok(await pg.evaluate(`!document.getElementById('skirmishEditorOverlay').hidden && document.getElementById('seEnemyLevel').value === '6'`), 'B#14 closing it brings the skirmish editor back, the draft kept');
        await pg.evaluate("document.getElementById('seSave').click(); 1"); await pg.waitForTimeout(800);
        ok(await pg.evaluate(`(()=>{ const p = ((nodeEdits['${pick.map}']||{}).patches||{})['${pick.key}'] || {}; return p.enemyLevel === 6 && findConquestNode('${pick.map}', '${pick.key}').node.enemyLevel === 6 && roadEnemyLevelExact(findConquestNode('${pick.map}', '${pick.key}').node) === 6; })()`), 'B#7 Save keeps it as the node\'s enemyLevel, and the fight reads it');
        await pg.evaluate(`openSkirmishEditor('${pick.map}', '${pick.key}'); 1`); await pg.waitForTimeout(500);
        await pg.evaluate("(()=>{ const el = document.getElementById('seEnemyLevel'); el.value = ''; el.dispatchEvent(new Event('change')); document.getElementById('seSave').click(); return 1; })()"); await pg.waitForTimeout(800);
        ok(await pg.evaluate(`(()=>{ const nd = findConquestNode('${pick.map}', '${pick.key}').node; return nd.enemyLevel == null && Math.round(roadEnemyLevelExact(nd)) === ${pick.L}; })()`), 'B#7 a blank Enemy level goes back to the curve');
        // #14 art review through the card editor's Save
        await pg.evaluate(`openCardEditor('${pick.id}'); 1`); await pg.waitForTimeout(500);
        await pg.evaluate("(()=>{ const c = document.getElementById('edArtRejectedChk'); c.checked = true; c.dispatchEvent(new Event('change')); const r = document.getElementById('edArtReason'); r.value = 'The paws are cut off'; r.dispatchEvent(new Event('input')); return 1; })()");
        await pg.screenshot({path: path.join(SHOTS, 'card-editor-art-1366.png')});
        await pg.evaluate("document.getElementById('btnSave').click(); 1"); await pg.waitForTimeout(900);
        const ar = await pg.evaluate(`(()=>{ const c = liveCards['${pick.id}'] || {}; const t = document.createElement('div'); t.innerHTML = cardTileHTML(getCardDefs()['${pick.id}'], {}); const adminBadge = !!t.querySelector('.ed-art-badge');
          adminModeEnabled = false; t.innerHTML = cardTileHTML(getCardDefs()['${pick.id}'], {}); const playerBadge = !!t.querySelector('.ed-art-badge'); adminModeEnabled = true; return {rv: c.artReview || null, adminBadge, playerBadge, listed: artRejectedIds().includes('${pick.id}')}; })()`);
        ok(ar.rv && ar.rv.status === 'rejected' && ar.rv.reason === 'The paws are cut off' && !isNaN(Date.parse(ar.rv.at)), `B#14 Save stores artReview {status, reason, at} on the card (${JSON.stringify(ar.rv)})`);
        ok(ar.adminBadge && !ar.playerBadge && ar.listed, `B#14 admins see the 🚫 corner, players don't; the filter lists it (${JSON.stringify(ar)})`);
        await pg.evaluate("(()=>{ adminArtRejectedOnly = true; currentTab !== 'admin' && switchTab('admin'); return 1; })()"); await pg.waitForTimeout(800);
        const flt = await pg.evaluate(`(()=>{ const c = document.getElementById('edArtRejectedOnly'); const g = document.getElementById('adminManageGrid'); return {box: !!c, checked: c && c.checked, shown: !!(g && g.querySelector('.card-tile[data-defid="${pick.id}"]')), why: g && (g.querySelector('.ed-art-why')||{}).textContent}; })()`);
        ok(flt.box && flt.shown && /paws/.test(flt.why || ''), `B#14 Manage Cards' Art rejected filter shows it with its reason (${JSON.stringify(flt)})`);
        if(flt.box){ await pg.evaluate("document.getElementById('edArtRejectedOnly').scrollIntoView({block:'start'}); 1"); await pg.screenshot({path: path.join(SHOTS, 'admin-art-filter-1366.png')}); }
        await pg.evaluate(`saveArtReview('${pick.id}', false)`); await pg.waitForTimeout(200);
        ok(await pg.evaluate(`!(liveCards['${pick.id}']||{}).artReview && !artRejectedIds().includes('${pick.id}')`), 'B#14 Clear takes the mark off');
        // #26 the Codex's Create card
        await pg.evaluate("adminArtRejectedOnly = false; codexSubTab = 'browse'; switchTab('codex'); 1"); await pg.waitForTimeout(1200);
        const cx = await pg.evaluate("(()=>{ const b = document.getElementById('edCodexCreateCard'); return {btn: !!b, vis: !!(b && b.offsetParent)}; })()");
        ok(cx.btn && cx.vis, `B#26 the Codex shows Create card for admins (${JSON.stringify(cx)})`);
        await pg.screenshot({path: path.join(SHOTS, 'codex-create-1366.png')});
        await pg.evaluate("document.getElementById('edCodexCreateCard').click(); 1"); await pg.waitForTimeout(500);
        ok(await pg.evaluate("!document.getElementById('editorOverlay').hidden && editingCard && !editingCard.id"), 'B#26 it opens the card editor on a new card');
        await pg.evaluate("closeCardEditor(); adminModeEnabled = false; renderCodex(); 1"); await pg.waitForTimeout(400);
        ok(await pg.evaluate("!document.getElementById('edCodexCreateCard')"), 'B#26 players don\'t see it');
        await pg.evaluate("adminModeEnabled = true; 1");
      }
      // #5 Tutorial II's showcase
      const t2 = await pg.evaluate(`(()=>{ const tm = CONQUEST_MAPS.find(m=> m.nodes.some(n=> n.key === 'tutorial2')), a = tm.nodes.find(n=> n.key === 'tutorial'), b2 = tm.nodes.find(n=> n.key === 'tutorial2'); window.__edTutMap = tm.id;
        return {one: nodeShowcaseId(tutorialSummaryNode(a)), two: nodeShowcaseId(tutorialSummaryNode(b2)), hl: tutorialHighlightId(2, loadFactionChoice() || 'both')}; })()`);
      ok(t2.two && t2.two !== t2.one && t2.two === t2.hl, `B#5@${w} Tutorial II shows its own lesson card (${JSON.stringify(t2)})`);
      await pg.evaluate("(()=>{ conquestSelectedMap = window.__edTutMap; conquestSelectedNodeKey = 'tutorial2'; playSubTab = 'conquest'; switchTab('play'); return 1; })()"); await pg.waitForTimeout(800);
      ok(await pg.evaluate(`(()=>{ const s = document.querySelector('#conquestNodePanel .cnp-showcase'); return !!s && s.dataset.defid === '${t2.two}'; })()`), `B#5@${w} the panel's showcase is ${t2.two}`);
      await pg.screenshot({path: path.join(SHOTS, `tutorial2-showcase-${w}.png`)});
      await ctx.close();
    }

    // ===== #10 the deck editors: counts in place; 0 -> 1 / 1 -> 0 redraw
    { const [ctx, pg] = await open(1366, true);
      const pop = await pg.evaluate(`(()=>{ const counts = {}; openDeckBuilderPopup({title:'ED', counts, unlimited:true}); let ov = document.querySelector('.deck-popup-overlay');
        const ids = [...ov.querySelectorAll('#dbpPool [data-add]')].slice(0, 6).map(e=> e.dataset.add); ov.remove(); ids.forEach(id=> counts[id] = 2);
        openDeckBuilderPopup({title:'ED', counts, unlimited:true}); ov = document.querySelector('.deck-popup-overlay');
        const id = ids[0], dk = ()=> ov.querySelector('#dbpDeck [data-rm="' + id + '"]'), pl = ()=> ov.querySelector('#dbpPool [data-add="' + id + '"]');
        const d0 = dk(), p0 = pl(), row0 = ov.querySelector('#dbpDeck').firstElementChild, t = [];
        let t0 = performance.now(); d0.dispatchEvent(new MouseEvent('click', {bubbles:true})); t.push(performance.now() - t0);
        const a = {same: dk() === d0 && pl() === p0 && ov.querySelector('#dbpDeck').firstElementChild === row0, badge: dk().querySelector('.ps-count').textContent, pool: pl().querySelector('.ps-count').textContent, total: ov.querySelector('#dbpTotal').textContent, n: counts[id]};
        t0 = performance.now(); dk().dispatchEvent(new MouseEvent('click', {bubbles:true, shiftKey:true})); t.push(performance.now() - t0);
        t0 = performance.now(); p0.dispatchEvent(new MouseEvent('click', {bubbles:true})); t.push(performance.now() - t0);
        const b = {same: dk() === d0, badge: dk().querySelector('.ps-count').textContent, n: counts[id]};
        // 1 -> 0 and 0 -> 1
        const id2 = ids[1]; counts[id2] = 1; ov.remove(); openDeckBuilderPopup({title:'ED', counts, unlimited:true}); ov = document.querySelector('.deck-popup-overlay');
        ov.querySelector('#dbpDeck [data-rm="' + id2 + '"]').dispatchEvent(new MouseEvent('click', {bubbles:true, shiftKey:true}));
        const gone = !ov.querySelector('#dbpDeck [data-rm="' + id2 + '"]') && !ov.querySelector('#dbpPool [data-add="' + id2 + '"] .ps-count');
        ov.querySelector('#dbpPool [data-add="' + id2 + '"]').dispatchEvent(new MouseEvent('click', {bubbles:true}));
        const back = !!ov.querySelector('#dbpDeck [data-rm="' + id2 + '"]') && ov.querySelector('#dbpPool [data-add="' + id2 + '"] .ps-count').textContent;
        ov.remove(); return {a, b, gone, back, ms: t.map(x=> Math.round(x))}; })()`);
      ok(pop.a.same && pop.a.badge === '×3' && pop.a.pool === 'in deck ×3' && pop.a.n === 3 && /^\d+$/.test(pop.a.total), `B#10 popup: +1 rewrites the counts, the same elements stay (${JSON.stringify(pop.a)})`);
      ok(pop.b.same && pop.b.badge === '×3' && pop.b.n === 3, `B#10 popup: −1 then +1 from the pool (${JSON.stringify(pop.b)})`);
      ok(pop.gone && pop.back === 'in deck ×1', `B#10 popup: 1 -> 0 takes the stack out, 0 -> 1 puts it back (${JSON.stringify([pop.gone, pop.back])})`);
      ok(pop.ms.every(x=> x < 600), `B#10 popup clicks ${JSON.stringify(pop.ms)} ms (was ~1,000-2,600 ms)`);
      // the Camp
      const tent = await pg.evaluate(`(async ()=>{ switchTab('deck'); await sleep(600); deckEditingId = activeDeckId || (myDecks[0]||{}).id; renderDeckSection();
        const defs = getCardDefs(), all = getDraftableIds(true), ids = all.filter(id=> defs[id] && !defs[id].locked && cardSourceOf(defs[id]).kind === 'base' && !lookStock(id).shiny && !Object.keys(lookStock(id).skins).length).slice(0, 4);
        Object.keys(myDeckCounts).forEach(k=> delete myDeckCounts[k]); ids.forEach(id=> myDeckCounts[id] = 2); try{ noteSighted(ids); }catch(e){} invalidateCardDefs(); renderMyDeckPanels();
        const id = ids[0], chip = ()=> document.querySelector('#myDeckList .dchip[data-defid="' + id + '"]:not([data-look])'), list0 = document.getElementById('myDeckList').firstElementChild;
        const c0 = chip(); if(!c0) return {err: 'no chip'}; const pool0 = document.querySelector('#myDeckPool .card-tile');
        const t = []; let t0 = performance.now(); c0.dispatchEvent(new MouseEvent('click', {bubbles:true})); t.push(performance.now() - t0);
        const a = {same: chip() === c0 && document.querySelector('#myDeckPool .card-tile') === pool0 && document.getElementById('myDeckList').firstElementChild === list0, badge: chip().querySelector('.ps-count').textContent, n: myDeckCounts[id], size: document.getElementById('myDeckSizeBadge').textContent};
        t0 = performance.now(); chip().dispatchEvent(new MouseEvent('click', {bubbles:true, shiftKey:true})); t.push(performance.now() - t0);
        const b = {same: chip() === c0, badge: chip().querySelector('.ps-count').textContent, n: myDeckCounts[id]};
        myDeckCounts[ids[1]] = 1; renderMyDeckPanels(); const c1 = document.querySelector('#myDeckList .dchip[data-defid="' + ids[1] + '"]'); c1.dispatchEvent(new MouseEvent('click', {bubbles:true, shiftKey:true}));
        const gone = !document.querySelector('#myDeckList .dchip[data-defid="' + ids[1] + '"]');
        return {a, b, gone, ms: t.map(x=> Math.round(x))}; })()`);
      ok(tent.a && tent.a.same && tent.a.badge === '×3' && tent.a.n === 3 && /\b9\/20/.test(tent.a.size), `B#10 Camp: +1 rewrites the count and the deck size, nothing redrawn (${JSON.stringify(tent.a)})`);
      ok(tent.b && tent.b.same && tent.b.badge === '×2' && tent.b.n === 2, `B#10 Camp: −1 the same (${JSON.stringify(tent.b)})`);
      ok(tent.gone, 'B#10 Camp: 1 -> 0 redraws (the card leaves the deck)');
      ok(tent.ms && tent.ms.every(x=> x < 300), `B#10 Camp clicks ${JSON.stringify(tent.ms)} ms (was ~320 ms on a 126-card pool)`);
      await ctx.close(); }
  }finally{ await b.close(); }
  ok(!errs.length, 'B. no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(`ed-2026-10-21: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
