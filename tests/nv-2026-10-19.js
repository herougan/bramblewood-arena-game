#!/usr/bin/env node
// 2026-10-19 (package NV, owner 10:55 on an iPhone, ~390x844):
//   1. "There should be a home button somewhere on mobile. The top bar of the conquest screen is not used - remove this. Then add the
//      bramble acorn symbol OR home symbol in the map/arena." -> a 🌰 Home at the left end of the floating tab bar (map, Arena, Raid,
//      Dungeons; phones and desktop); the map strip is gone on phones (maps change on the 🧭 World atlas and the map edges).
//   2. "Improve the pre-battle A v B screen ... I want to know how i contribute, then our total BR." -> showVsScreen v2.
//   3. "Raid complete: Still use our victory emblems - S, A, B etc. ... abit more special looking" -> raidRankEmblemHTML.
//   4. The raid results: (a) the turn-1 "Rank SSS, Overwhelm! 10,000" with 0 dealt was the Admin 👑 Win (adminAutoWin) scored as a real
//      overwhelm; a raid no longer scores an admin win, and its Play again builds a fresh raid fight (it built a Quick Battle). (b) the raid
//      damage, the "dealt" stat and the "Full reward from" chip now say what each counts; "dealt" no longer loses hits to the 200-line log.
// Static and function checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are there.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('../tools/lib_bramble.js');
const RaidM = require('../bramblewood-raid.js');
const {TEXT, TX} = require('../bramblewood-texts.js');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), goliath = raids[0];
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const escapeHtml = s=> (s==null || s===false ? '' : String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escapeAttr = s=> (s==null || s===false ? '' : String(s)).replace(/"/g,'&quot;');
// 2026-10-19 (package RB): raid numbers go through raidLocale() / raidNum() (the game's language; English here)
const fn = (names, ret, extra)=>{ extra = Object.assign({raidLocale: ()=> 'en', raidNum: n=> Math.round(Number(n) || 0).toLocaleString('en')}, extra || {});
  return new Function('TX', 'escapeHtml', 'escapeAttr', 'RaidM', ...Object.keys(extra), names.map(nm=> B.grab(nm)).join('\n') + '\nreturn ' + ret + ';')(TX, escapeHtml, escapeAttr, RaidM, ...Object.values(extra)); };

// ======================= 1. Home and the map strip =======================
// 2026-10-19 (package U3, owner 13:41: "the home button shouldnt be on the btm bar but as an icon beside the fullscreen button and arena
// button"; 13:42: "the map tab on the top is okay ... can be just number + emoji"): NV's 🌰 left the tab bar for the top-right cluster
// (#homeNavBtnPlay, an acorn), and the phone map strip is back (compact chips, tests/e2e/u3_2026_10_19.py). NV's iOS fix stays.
const rp = B.grab('renderPlay');
ok(!/playHomeTabBtn|play-home-tab/.test(rp), '1. (U3) no Home in the floating tab bar any more');
ok(/<button class="home-nav-btn" id="homeNavBtnPlay" type="button" title="\$\{escapeAttr\(TX\('ui\.back-to-home'\)\)\}" aria-label="\$\{escapeAttr\(TX\('ui\.back-to-home'\)\)\}"><span class="tab-emoji" aria-hidden="true">🌰<\/span> \$\{escapeHtml\(TX\('ui\.nv-home'\)\)\}<\/button>/.test(rp),
  '1. (U3) the top-right cluster starts with the 🌰 Home (TX label, aria-label)');
ok(/getElementById\('homeNavBtnPlay'\);\s*if\(backBtn\) backBtn\.addEventListener\('click', \(\)=>\{ try\{ SoundKit\.woodKnock\(\); \}catch\(e\)\{\} exitConquestImmersive\(\); switchTab\('home'\); \}\);/.test(rp), '1. it goes Home the way every Home does (switchTab(\'home\'))');
const nv = (tpl.match(/<style id="nvStyles">([^]*?)<\/style>/) || [])[1] || '';
ok(nv.length > 0, '1. the NV style block is there');
ok(!/play-home-tab/.test(nv) && !/#homeNavBtnPlay\{display:none/.test(nv), '1. (U3) the cluster\'s Home is not hidden');
ok(/\.play-subtabs-row\{overflow:visible !important;/.test(nv) && /\.play-subtabs-row \.play-subtabs\{min-width:0; flex:0 1 auto; overflow-x:auto;/.test(nv), '1. the tab strip scrolls inside the bar, not the bar (a fixed child of a scrolling row is clipped on iOS Safari)');
ok(/bottom:calc\(14px \+ env\(safe-area-inset-bottom, 0px\)\)/.test(nv), '1. the bar keeps clear of the iPhone home indicator');
ok(!/#conquestMapList\{display:none !important;\}/.test(nv), '1. (U3) phones keep the map strip');
ok(/class="conquest-world-btn" id="conquestWorldBtn"/.test(src) && /class="world-edge world-edge-\$\{side\}/.test(src), '1. maps still change: the 🧭 World atlas button and the map edges stay');
ok(TEXT['ui.nv-home'] === 'Home', '1. TX ui.nv-home');

// ======================= 2. the pre-battle screen =======================
const vs = B.grab('showVsScreen');
ok(!/<div class="vs-skip">Tap to start<\/div>/.test(vs) &&/<button type="button" class="vs-start">[^`]*TX\('ui\.nv-vs-start'\)/.test(vs), '2. a real Start button (TX), no "Tap to start" line over the art');
ok(/const waitMs = raid \? 9000 : 2800;/.test(vs) && /timer = setTimeout\(finish, waitMs\);/.test(vs) && /el\.addEventListener\('click', finish\);/.test(vs), '2. a tap anywhere still starts; a raid waits longer before starting by itself');
ok(/vs2-sb-total/.test(vs) && /TX\('ui\.nv-vs-side-total'\)/.test(vs) && /TX\('ui\.nv-vs-leaders-x2'\)/.test(vs) && /sideBR\.allies\[i\]/.test(vs) && /br\(mine\)/.test(vs), '2. the raid\'s side panel: you, each ally (its own BR), the side total, leaders x2');
ok(/TX\('ui\.nv-vs-your-br'\)/.test(vs) && /br\(sideBR\.mine\)/.test(vs) && /rowName\(0\)/.test(vs), '2. your card says what you bring: your BR and your row');
ok(/class="vs2-boss-frame"><img class="vs-boss-art"/.test(vs) && /raid \? TX\('ui\.nv-vs-raid-boss'\) : TX\('ui\.nv-vs-boss'\)/.test(vs), '2. the boss gets a framed portrait card with its name, line and BR');
ok(/: `<div class="vs-lvl \$\{cls\}" title="\$\{who\} battle rating"><small>\$\{who\} BR<\/small><b>⚔ \$\{n\}<\/b><\/div>`/.test(vs) && /deckLevelGapClass\(theirs, mine\)/.test(vs), '2. a normal fight: you vs them, both BRs, theirs coloured by the gap');
ok(/me\.raidSide = sideBR;/.test(B.grab('startRaidFullBattle')), '2. the full raid hands the screen its side BR parts (raidSideBR)');
ok(/\.vs2 \.vs2-sb-txt small\{[^}]*white-space:normal;/.test(nv) && /\.vs2 \.vs-name\{white-space:normal; overflow:visible; text-overflow:clip;/.test(nv), '2. names and rows wrap instead of being cut off');
ok(/\.vs2 \.vs-start\{grid-column:1 \/ -1;/.test(nv) && /@media \(prefers-reduced-motion: reduce\)\{ \.vs2 \.vs-start-fill\{animation:none;/.test(nv), '2. the button has its own row; its countdown bar stops under reduced motion');
['ui.nv-vs-start', 'ui.nv-vs-you', 'ui.nv-vs-your-br', 'ui.nv-vs-you-tip', 'ui.nv-vs-side', 'ui.nv-vs-side-total', 'ui.nv-vs-leaders-x2', 'ui.nv-vs-row-front', 'ui.nv-vs-row-middle', 'ui.nv-vs-row-back',
 'ui.nv-vs-ally-leader', 'ui.nv-vs-ally-bramble', 'ui.nv-vs-raid-boss', 'ui.nv-vs-boss'].forEach(k=> ok(typeof TEXT[k] === 'string' && TEXT[k] && src.includes(`'${k}'`), `2. TX ${k} is in the table and used`));

// ======================= 3. the raid's rank emblem =======================
{ const E = fn(['raidRankEmblemHTML'], 'raidRankEmblemHTML', {window: {}});
  const ranks = ['B', 'A', 'S', 'SS', 'SSS'];
  ranks.forEach(r=>{ const h = E(r, false, 'lg');
    ok(new RegExp(`<span class="rank-hex re-hex rank-${r}" aria-hidden="true"><i></i><b>${r}</b></span>`).test(h), `3. Rank ${r}: the victory screens' hexagon inside`);
    ok(/<svg class="re-ring"/.test(h) && (h.match(/<path transform="rotate\(/g) || []).length === 8 && /class="re-glow"/.test(h), `3. Rank ${r}: the abyssal ring, 8 tentacle curls and a glow`);
    ok(/^<div class="re-row">/.test(h) && /aria-label="Rank /.test(h), `3. Rank ${r}: its own row on the results, with an aria-label`);
    ok(/re-shock/.test(h) === ['S', 'SS', 'SSS'].includes(r) && /is-high/.test(h) === ['S', 'SS', 'SSS'].includes(r), `3. Rank ${r}: ${['S', 'SS', 'SSS'].includes(r) ? 'a shockwave and the stronger stamp' : 'the plain stamp'}`); });
  ok(/re-crest/.test(E('B', true, 'lg')) && !/re-crest/.test(E('B', false, 'lg')), '3. a won fight wears the crest');
  ok(E(null, true) === '' && !/re-row/.test(E('S', true, 'md')) && /re-md/.test(E('S', true, 'md')), '3. no rank, no emblem; the claim screen\'s size has no row'); }
ok(/\$\{raidRankEmblemHTML\(m\.raidRank, m\.raidOverwhelmed, 'lg'\)/.test(src), '3. the raid results show it (every rank; the crest for a win)');
ok(/window\.bwRaidRankEmblemHTML\(spec\.rank\.letter, !!spec\.rank\.emblem, 'md'\)/.test(fxf), '3. the raid claim screen (RV2\'s emblemed rank) shows the same emblem');
ok(/@keyframes reStamp\{/.test(nv) && /@keyframes reShock\{/.test(nv) && /@media \(prefers-reduced-motion: reduce\)\{ \.raid-emblem, \.raid-emblem \*\{animation:none !important;\}/.test(nv), '3. stamped in, harder for S+; still under reduced motion');

// ======================= 4a. the turn-1 SSS: an admin win; Play again =======================
ok(/m\.players\[2\]\.hq\.shield = 0; m\.players\[2\]\.hq\.hp = 0; m\.forcedWinner = 1; m\.endReason = null;[^\n]*\n  m\.adminWin = true;/.test(B.grab('adminAutoWin')), '4a. the Admin 👑 Win marks the fight');
{ const calls = [];
  const settle = fn(['settleRaidPartAfterMatch'], 'settleRaidPartAfterMatch', {
    raidFightRank: m=> m._rank || null, recordRaidAttempt: (def, part, cycle, dealt, over, rank)=>{ calls.push({dealt, over, rank}); return {contribution: RaidM.contributionFor(def, dealt, over, (def.parts||[]).find(p=> p.id===part), rank), gold:1, dust:1, ink:1, below: dealt < (def.minDamage||120), minDamage: def.minDamage || 120, remainingAfter: 5}; },
    raidFightCardDrop: ()=> null, rollEggDrop: ()=> null, currentRaidStateFor: ()=> ({byId:{tail:{remaining: 99}}}) });
  const mk = (bossHp, extra)=> Object.assign({raidDef: goliath, raidPart:'tail', raidCycle: 1, raidFull: true, raidCastleStart: 420, winner: bossHp <= 0 ? 1 : 0, players:{1:{hq:{hp:150, maxHp:150}}, 2:{hq:{hp:bossHp, maxHp:420}}}, raidBoss:{deck:{}}}, extra || {});
  const a = mk(0, {adminWin: true, _rank: 'SSS'}); settle(a);
  // 2026-10-19 (package RB, owner 12:23: "deal 1,000 instead of 10,000, counting in the bonus damage"): a win is 1,000 x the rank (SSS: 2,000)
  ok(calls.length === 0 && a.raidAdminTest === true && a.raidDamageDealt === 2000 && a.raidRemainingAfter === 99 && !a.raidRewardEarned, `4a. an admin win: shown (${a.raidDamageDealt}), not recorded, pushed or paid (${calls.length} attempts)`);
  const w = mk(0, {_rank: 'SSS'}); settle(w);
  ok(calls.length === 1 && calls[0].over === true && w.raidDamageDealt === 2000 && !w.raidAdminTest, '4a. a real win still scores its overwhelm (1,000 x SSS 2.0)');
  const b = mk(392, {_rank: 'B'}); settle(b);
  const tail = goliath.parts.find(p=> p.id==='tail'), per = Object.assign({}, goliath.scoring || {}, tail.scoring || {}).perInFightHp;
  ok(b.raidBrambleDealt === 28 && b.raidPerHp === per && b.raidRankMult === RaidM.raidRankMult('B') && b.raidDamageDealt === RaidM.contributionFor(goliath, 28, false, tail, 'B'),
    `4b. the settle keeps the breakdown: 28 bramble x ${b.raidPerHp} x ${b.raidRankMult} -> ${b.raidDamageDealt}`);
  ok(per === 1 && b.raidDamageDealt === 28 && b.raidDamageDealt === Math.round(Math.round(28 * per) * RaidM.raidRankMult('B')), `4b. no x15 now (2026-10-19, RB): 28 x 1.01 = ${b.raidDamageDealt} (the screenshot's 424 before)`);
  // the breakdown line agrees with the headline number
  const calc = fn(['raidDamageCalcHTML'], 'raidDamageCalcHTML');
  const line = calc(b);
  ok(line.includes(`28 bramble damage × ${per} × 1.01 for Rank B = ${b.raidDamageDealt.toLocaleString()} raid damage`), `4b. the breakdown: "${line.replace(/<[^>]+>/g, '')}"`);
  ok(/The boss's bramble fell: a win scores 2,000 raid damage/.test(calc(w).replace(/&#39;|&apos;/g, "'")), '4b. a win says it scores the overwhelm figure (admins only since 2026-10-19, RB)');
  const big = mk(20, {_rank: 'SSS'}); settle(big); // 400 bramble damage: over the per-fight cap
  ok(/\(one fight scores at most /.test(calc(big)) === (Math.round(Math.round(400 * per) * 2) > big.raidDamageDealt), '4b. a capped fight says so');
  ok(calc({}) === '', '4b. no breakdown without a raid'); }
{ const started = [];
  const R = fn(['raidReplayPart'], 'raidReplayPart', {liveRaidDefs: ()=> [Object.assign({}, goliath, {fresh: true})], startRaidPartMatch: (def, part)=> started.push({def, part})});
  const again = R({mode:'raidOffline', raidDef: goliath, raidPart:'tail'});
  ok(typeof again === 'function', '4a. a raid part\'s Play again has a fresh fight to start');
  again(); ok(started.length === 1 && started[0].part === 'tail' && started[0].def.fresh === true, '4a. ...on the same part, with the raid as it is now (startRaidPartMatch builds rows, decks, allies and castle anew)');
  ok(R({mode:'raidOffline', raidBoss:{id:'x'}}) === null && R({mode:'ai'}) === null, '4a. an Online Raid boss / another mode: nothing to replay here'); }
{ const h = src.slice(src.indexOf("document.getElementById('wlPrimaryBtn').addEventListener('click'"), src.indexOf("const wlBackBtn = document.getElementById('wlBackBtn')"));
  const iRaid = h.indexOf("if(mode==='raidOffline'){ const again = raidReplayPart(m); playSubTab = 'raid'; endMatch(); if(again){ holdPacksForReplay(); again(); } return; }"), iGeneric = h.indexOf("startMatch(mode);");
  ok(iRaid > 0 && iGeneric > iRaid, '4a. Play again on a raid no longer falls through to startMatch(\'raidOffline\') (a Quick Battle)'); }

// ======================= 4b. the stats: the running tally =======================
{ const S = fn(['tallyMatchStat', 'computeMatchStats', 'computeMatchStatsFromLog', 'addMatchStatHit'], '{tallyMatchStat, computeMatchStats}');
  const m = {log: []}; let dealtA = 0;
  for(let i = 0; i < 600; i++){ const ev = {type: i % 3 ? 'hit' : 'hitHQ', side: i % 2 ? 'A' : 'B', dmg: 1 + (i % 4), attUid: i % 7, _round: Math.floor(i / 30)}; if(ev.side === 'A') dealtA += ev.dmg;
    S.tallyMatchStat(m, ev); m.log.push(ev); if(m.log.length > 200) m.log.shift(); }
  const t = S.computeMatchStats(m);
  ok(t.A.dealt === dealtA && t.B.taken === dealtA, `4b. a long fight's "dealt" counts every hit (${t.A.dealt} of ${dealtA}), not the last 200 lines`);
  const r = {log: m.log.slice(-60)}; const seed = S.computeMatchStats(r).A.dealt; S.tallyMatchStat(r, {type:'hit', side:'A', dmg:5, attUid:1, _round:99});
  ok(S.computeMatchStats(r).A.dealt === seed + 5, '4b. a resumed fight (log only) seeds the tally from its log');
  ok(/try\{ tallyMatchStat\(matchState, ev\); \}catch\(e\)\{\}[^\n]*matchState\.log\.push\(ev\); if\(matchState\.log\.length>200\) matchState\.log\.shift\(\);/.test(B.grab('pushLog')), '4b. pushLog tallies each hit before the log drops old lines'); }
ok(/TX\('results\.nv-bramble-dealt', \{n: m\.raidBrambleDealt\}\)/.test(src) && /m\.mode==='raidOffline' \? TX\('results\.nv-dealt-side-tip'/.test(src), '4b. the stats row: "dealt" is your side\'s all-in damage, "to the bramble" is what the raid scores');
ok(/TX\('results\.nv-full-reward-from', \{min: m\.raidMinDamage, dealt:/.test(src), '4b. the reward chip says bramble damage, and this fight\'s');
['results.nv-raid-damage', 'results.nv-raid-overwhelm', 'results.nv-raid-admin-damage', 'results.nv-raid-calc', 'results.nv-raid-calc-rank', 'results.nv-raid-calc-win', 'results.nv-raid-capped', 'results.nv-raid-calc-tip',
 'results.nv-full-reward-from', 'results.nv-full-reward-tip', 'results.nv-admin-win', 'results.nv-bramble-dealt', 'results.nv-bramble-dealt-tip', 'results.nv-dealt-side-tip'].forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `4. TX ${k} is in the table and used`));
ok(/^## 2026-10-19 \(NV: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

// ======================= browser: phones and desktop =======================
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  const vis = id=> `(()=>{ const e = document.getElementById('${id}'); if(!e) return null; const cs = getComputedStyle(e); if(cs.display === 'none' || cs.visibility === 'hidden') return null; const r = e.getBoundingClientRect(); return r.width && r.height ? {l:r.left, t:r.top, r:r.right, b:r.bottom} : null; })()`;
  try{
    for(const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]){
      const ctx = await b.newContext({viewport:{width:w, height:h}, isMobile:mobile, hasTouch:mobile}); const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2500);
      await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1");
      for(const tab of ['conquest', 'arena', 'raid']){
        await pg.evaluate(`(()=>{ playSubTab = '${tab}'; switchTab('play'); return 1; })()`); await pg.waitForTimeout(500);
        const home = await pg.evaluate(vis('homeNavBtnPlay')), list = await pg.evaluate(vis('conquestMapList')), bar = await pg.evaluate(vis('playHomeTabBtn'));
        ok(home && home.l >= 0 && home.r <= w + 1 && home.t >= 0 && home.b <= 80, `B1. ${w}x${h} ${tab}: the 🌰 Home is on screen, top right (${JSON.stringify(home)})`);
        ok(!bar, `B1. ${w}x${h} ${tab}: one Home (none in the tab bar, U3)`);
        if(tab === 'conquest'){ ok(!!list, `B1. ${w}x${h}: the map list is there (the phone strip is back, U3)`);
          ok(!!(await pg.evaluate(vis('conquestWorldBtn'))), `B1. ${w}x${h}: the 🧭 World button is there to change maps`); }
      }
      await pg.evaluate("(()=>{ playSubTab = 'conquest'; switchTab('play'); return 1; })()"); await pg.waitForTimeout(400);
      await pg.click('#homeNavBtnPlay'); await pg.waitForTimeout(500);
      ok(await pg.evaluate("currentTab === 'home' && !document.getElementById('view-home').hidden"), `B1. ${w}x${h}: the 🌰 goes Home`);
      // the raid's VS screen: you, your side's parts and total, the boss; the button below the art; nothing cut off
      await pg.evaluate("(()=>{ playSubTab='raid'; switchTab('play'); window.payRaidAttempt = ()=> true; window.raidLeaderCapCheck = ()=> ({ok:true}); startRaidPartMatch(activeRaidDef(), 'tail'); return 1; })()"); await pg.waitForTimeout(1200);
      const v = await pg.evaluate(`(()=>{ const el = document.querySelector('.vs-screen.vs2.is-raid'); if(!el) return null; const q = s=> el.querySelector(s), rc = e=> e && e.getBoundingClientRect();
        const rows = [...el.querySelectorAll('.vs2-sb-row')].map(r=> r.querySelector('.vs2-sb-br').textContent);
        const cut = [...el.querySelectorAll('.vs2-sb-txt b, .vs2-sb-txt small, .vs-name')].filter(e=> e.scrollWidth > e.clientWidth + 1).length;
        const art = rc(q('.vs-boss-art')), btn = rc(q('.vs-start'));
        const m = matchState; return {rows, total: q('.vs2-sb-total b').textContent, side: m.raidSideBR, boss: m.raidBossBR && m.raidBossBR.total, bossChip: q('.vs-right .vs-lvl b').textContent, cut, below: btn.top >= art.bottom - 1, inView: btn.bottom <= innerHeight + 1}; })()`);
      ok(v && v.rows.length === 3 && v.side && v.rows[0].replace(/\D/g, '') === String(v.side.mine) && v.rows.slice(1).map(x=> x.replace(/\D/g, '')).join() === v.side.allies.join() && v.total.replace(/\D/g, '') === String(v.side.total),
        `B2. ${w}x${h}: you first, then each ally, then the side's total (${v && v.rows.join(' + ')} = ${v && v.total})`);
      ok(v && v.side.total === v.side.mine + v.side.allies.reduce((a, c)=> a + c, 0) && v.bossChip.replace(/\D/g, '') === String(v.boss), `B2. ${w}x${h}: the parts add up; the boss card shows its BR (${v && v.bossChip})`);
      ok(v && v.cut === 0 && v.below && v.inView, `B2. ${w}x${h}: no name or row cut off (${v && v.cut}), the Start button under the art and on screen`);
      await pg.evaluate("document.querySelector('.vs-screen').click(); 1"); await pg.waitForTimeout(800);
      // a raid ended by the clock -> Play again builds a fresh raid fight on the same part
      await pg.evaluate("(()=>{ const m = matchState; m.raidRoundCap = m.round; resolveRound(); return 1; })()"); await pg.waitForTimeout(9000);
      const before = await pg.evaluate("({over: matchState && matchState.over, n: loadRaidPartAttempts().length})");
      await pg.evaluate("document.getElementById('wlPrimaryBtn').click(); 1"); await pg.waitForTimeout(1500);
      const after = await pg.evaluate("(()=>{ const m = matchState; return m && {mode: m.mode, part: m.raidPart, round: m.round, over: m.over, hp: m.players[2].hq.hp, max: m.players[2].hq.maxHp, full: !!m.raidFull}; })()");
      ok(before.over && after && after.mode === 'raidOffline' && after.part === 'tail' && after.full && after.round === 1 && !after.over && after.hp === after.max && after.max > 0, `B4. ${w}x${h}: Play again is a fresh raid fight (${JSON.stringify(after)})`);
      // the Admin win: shown, not recorded
      await pg.evaluate("document.querySelectorAll('.vs-screen').forEach(e=> e.click()); adminModeEnabled = true; adminAutoWin(); 1"); await pg.waitForTimeout(9000);
      const aw = await pg.evaluate("({over: matchState.over, test: matchState.raidAdminTest, n: loadRaidPartAttempts().length, note: !!document.querySelector('.nv-admin-test'), emblem: !!document.querySelector('.raid-results .raid-emblem.is-won')})");
      ok(aw.over && aw.test && aw.n === before.n && aw.note && aw.emblem, `B4. ${w}x${h}: an Admin win shows the emblem and the test note, and records nothing (${JSON.stringify(aw)}, before ${before.n})`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(!errs.length, `B. no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{
  console.log(`nv-2026-10-19: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
});
