#!/usr/bin/env node
// Package MX (2026-10-19, owner notes 22:47):
//   1. "Add a shield value of 50 to the Raid. As the HP% goes down, this 50 goes down proportionally. (This value is togglable in the)
//      beside 'Energy'." — the boss's bramble in a raid fight opens with a Shield of round(50 x the part's remaining share) (RaidM.raidShield,
//      the share the weakening uses), the raid editor's "Shield" field beside "Energy" (raid and part; 0 = off; unset = 50), and the
//      player's line "Shield N (falls as the raid weakens)" on the raid screen and the VS boss card, through TX keys in all 12 packs.
//   2. "If Daily dungeon has 0 keys, the shortcut symbol on the top right will not display the '0'." — the 🗝️ shortcut's badge says 0,
//      greyed (.is-empty), with the refill time in its tip (dungeonKeyBadge).
//   3. "Swap: For Map 0-1, there are some card swap popups. Don't recommend cards that are lousier than what i have in my deck." — a swap
//      is offered only for a deck card the new card is clearly better than (swapClearlyBetter: the budget score 2A+H+S x the half-miss
//      multiplier, the same cost bracket or cheaper, no more Wait); weaker or equal: never; nothing weaker in the deck: no window.
// With Playwright and a built index.html, the browser part checks the raid Shield (raid screen, VS card, the board's 🔷) and the key
// badge at 0, at 390x844 and 1366x768. MX_SHOTS=1 saves the screenshots to docs/screens/mx/.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')).find(r=> r.id === 'goliath');
const SHOTS = !!process.env.MX_SHOTS;
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---- 1. the raid Shield
// the raid as it stands with each outer part at `share` of its Health (the Core whole), as tools/raid_full_sim.js's stateAtShare
function stateAt(def, share){
  const atts = []; (def.parts || []).forEach(p=>{ if((p.lockedUntil || []).length) return; const n = Math.round(R.partTotal(p) * (1 - share)); if(n > 0) atts.push({raidId: def.id, part: p.id, cycle: 0, owner: 'sim', contribution: n, at: 0}); });
  return R.raidState(def, atts, 0, {cycle: 0});
}
ok(R.RAID_SHIELD_DEFAULT === 50 && goliath.shield === 50, 'the Goliath\'s Shield is 50 (the default too)');
{ const at = s=> R.raidShield(goliath, stateAt(goliath, s), 'left').shield;
  ok(at(1) === 50 && at(0.5) === 25 && at(0.1) === 5 && at(0) === 0, `50 fresh, 25 at half, 5 at 10%, 0 at the end (${[1, 0.5, 0.1, 0].map(at).join(' / ')})`);
  const st = stateAt(goliath, 0.5); ok(R.raidShield(goliath, st, 'left').share === R.weakenShare(st, 'left'), 'the same share as the boss\'s weakening'); }
{ const noShield = Object.assign({}, goliath); delete noShield.shield;
  ok(R.raidShieldMax(noShield, 'left') === 50, 'a saved raid edit without a Shield gets 50');
  ok(R.raidShield(Object.assign({}, goliath, {shield: 0}), stateAt(goliath, 1), 'left').shield === 0, 'Shield 0 turns it off');
  const parts = goliath.parts.map(p=> p.id === 'tail' ? Object.assign({}, p, {shield: 80}) : p), d2 = Object.assign({}, goliath, {parts});
  ok(R.raidShieldMax(d2, 'tail') === 80 && R.raidShieldMax(d2, 'left') === 50, 'a part\'s own Shield over the raid\'s');
  ok(R.raidShieldMax(Object.assign({}, goliath, {shield: '' }), 'left') === 50 && R.raidShieldMax(Object.assign({}, goliath, {shield: 5000}), 'left') === 999, 'blank = 50; at most 999'); }
{ const A = require(path.join(ROOT, 'tools', 'raid_full_sim.js')).A;
  for(const s of [1, 0.5]){ const st = stateAt(goliath, s), f = R.fightFor(goliath, st, 'left', {});
    const b = A.buildRaidFullFight(goliath, 'left', f, st, {rng: A.seededRng(1), rand: A.seededRng(2), allies: [], myDeck: {}, recordEvents: false}), q = b.players[2].hq;
    const want = Math.round(25 * s); // 2026-10-21 (BF5): the raid's Shield at BRAMBLE_SCALE 0.5 (raids.json keeps 50)
    ok(q.shield === want && q.maxShield === want && JSON.stringify(q.shieldLayers) === JSON.stringify([want]) && b.raidShield.shield === want, `the built fight's boss bramble at ${s * 100}%: Shield ${q.shield}/${q.maxShield} (want ${want})`);
    ok(q.hp === 175, 'its Health is untouched (350, at BRAMBLE_SCALE 175)'); }
  // the Shield soaks hits first, as on any bramble
  const st = stateAt(goliath, 1), f = R.fightFor(goliath, st, 'left', {});
  const b = A.buildRaidFullFight(goliath, 'left', f, st, {rng: A.seededRng(1), rand: A.seededRng(2), allies: [], myDeck: {}, recordEvents: false});
  ok(/pl\.hq\.shield > 0 && toHp > 0\)\{ const soak = Math\.min\(pl\.hq\.shield, toHp\)/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'the engine spends a bramble\'s Shield before its Health');
  ok(b.players[2].hq.hp === 175 && b.players[2].hq.shield === 25, 'fresh: 350 Health behind 50 Shield (BF5: halved, 175 behind 25)'); }
ok(/\{ const r = \(RaidM && RaidM\.raidShield\) \? RaidM\.raidShield\(raidDefScaled\(def\), st, partId\) : null; if\(r\)\{ const q = players\[2\]\.hq; q\.shield = r\.shield;/.test(src), 'the one-row raid fight (startRaidPartMatch) gets the Shield too');
// the editor: "Shield" beside "Energy", raid and part, saved
ok(/value="\$\{draft\.cost\.energy\|\|4\}"><\/label>\n\s*<label title="[^"]*">Shield<input id="reShield" type="number" min="0" max="999"/.test(src), 'the raid editor: a Shield field right after "Energy per fight"');
ok(/value="\$\{\(P\.cost\|\|\{\}\)\.energy\|\|''\}"><\/label>\n\s*<label title="[^"]*">Shield \(blank = raid\)<input data-pf="shield"/.test(src), 'each part: a Shield field right after its Energy');
ok(/draft\.shield = Math\.max\(0, Math\.min\(999, Math\.round\(num\(v\('reShield'\), 50\)\)\)\)/.test(src) && /k==='shield'\)\{ if\(el\.value===''\) delete P\.shield; else P\.shield = /.test(src), 'both are saved (blank part = the raid\'s)');
// the player's line
ok(TX('ui.mx-raid-shield', {n: 50}) === 'Shield 50 (falls as the raid weakens)', 'the line reads "Shield 50 (falls as the raid weakens)"');
ok(/\$\{raidShieldLineHTML\(def, st\)/.test(src) && /shield: b\.raidShield && b\.raidShield\.shield > 0 \? TX\('ui\.mx-raid-shield'/.test(src) && /p\.bramble\.shield \? `<div class="u3-bramble-line mx-raid-shield"/.test(src), 'on the raid screen and the VS boss card');
{ const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'], keys = ['ui.mx-raid-shield', 'ui.mx-raid-shield-tip'];
  CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); const miss = keys.filter(k=> !pack[TEXT[k]] || !/\{n\}/.test(pack[TEXT['ui.mx-raid-shield']] || '')); ok(!miss.length, `pack ${c} has the Shield texts (${miss.join(', ')})`); }); }

// ---- 2. the key badge at 0
{ const body = ['dungeonKeyBadge'].map(B.grab).join('\n') + '\nreturn {dungeonKeyBadge};';
  const K = new Function('dungeonTabLabel', 'TX', 'dungeonKeyCap', 'dungeonNoKeysText', body)(()=> 'Daily Dungeons', TX, ()=> 5, ()=> TX('ui.dungeon-no-keys', {cap: 5, h: 3}));
  const z = K.dungeonKeyBadge(0), t = K.dungeonKeyBadge(3);
  ok(z.text === '0' && z.empty === true, 'at 0 keys the badge says "0" and is the empty state');
  ok(/No Dungeon keys left/.test(z.tip) && /3h/.test(z.tip), `its tip says when they refill (${z.tip})`);
  ok(t.text === '3' && !t.empty && /3\/5/.test(t.tip), `3 keys: "3", not empty (${t.tip})`);
  ok(K.dungeonKeyBadge(-2).text === '0' && K.dungeonKeyBadge(undefined).text === '0', 'never blank or negative'); }
ok(/\$\{k\.empty \? ' is-empty' : ''\}/.test(src) && /b\.classList\.toggle\('is-empty', k\.empty\)/.test(src), 'both 🗝️ buttons (the Play cluster and the topbar) take .is-empty');
ok(/\.dungeon-key-btn\.is-empty \.dk-n\{/.test(tpl) && /\.dungeon-key-btn\.is-empty \.tab-emoji\{filter:grayscale/.test(tpl), 'the greyed key and the empty badge (CSS)');
ok(/<span class="r3-chip r3-tickets\$\{tickets <= 0 \? ' is-empty' : ''\}"[^]*?<b>\$\{tickets\}\/\$\{RAID_POINTS_MAX\}/.test(src), 'the raid tickets chip says 0/10 at 0 (checked; no change needed)');
ok(/const html = `\$\{s\.current\}\/\$\{energyMax\(\)\}/.test(src), 'the Energy pill says 0/N at 0 (checked; no change needed)');

// ---- 3. swaps: only a clearly better card
const SWAP_NAMES = ['SB_DEFAULT_SKILLS', 'SB_HALF_MISS', 'SB_PAY_DEF', 'sbSkillCost', 'sbMissMult', 'cardSkillCount', 'strictlyDominates', 'SWAP_CLEAR_MARGIN', 'swapStrength', 'swapCostBracket', 'swapClearlyBetter', 'swapOptsFor', 'weakestDeckCard', 'dominatedDeckCard'];
const world = {defs: {}, deck: {}};
const S = new Function('getCardDefs', 'swapEligibleDef', 'swapOutAllowed', 'myDeckCounts',
  SWAP_NAMES.map(B.grab).join('\n') + '\nreturn {' + SWAP_NAMES.filter(n=> !/^[A-Z_]+$/.test(n)).join(', ') + '};')(
  ()=> world.defs, d=> !!(d && typeof d.attack === 'number' && (d.health || 0) > 0), ()=> true, new Proxy({}, {get: (t, k)=> world.deck[k], ownKeys: ()=> Reflect.ownKeys(world.deck), getOwnPropertyDescriptor: (t, k)=> k in world.deck ? {value: world.deck[k], enumerable: true, configurable: true} : undefined}));
const card = (id, a, h, x)=> Object.assign({id, attack: a, health: h, cost: 0, wait: 0, effects: {}}, x || {});
{ const deckCard = card('deck-22', 2, 2);
  ok(!S.swapClearlyBetter(card('weak-11', 1, 1), deckCard), 'weaker (1/1 for a 2/2): never');
  ok(!S.swapClearlyBetter(card('same-22', 2, 2), deckCard), 'equal (2/2 for a 2/2): never');
  ok(!S.swapClearlyBetter(card('swap-13', 1, 3), card('deck-21', 2, 1)) && !S.swapClearlyBetter(card('swap-31', 3, 1), card('deck-23', 2, 3)), 'a sidestep of the same score or less: never');
  ok(S.swapClearlyBetter(card('strong-33', 3, 3), card('deck-12', 1, 2)), 'stronger (3/3 for a 1/2): yes');
  ok(S.swapClearlyBetter(card('dom-23', 2, 3), deckCard), 'one more Health, all else equal (dominates): yes');
  ok(!S.swapClearlyBetter(card('cheap-skill', 2, 2, {effects: {crabClaws: 1}}), card('deck-poison', 2, 2, {effects: {poison: 3}})), 'same stats, a cheaper skill for a dearer one (dominates on the old rule, scores lower): never');
  ok(S.swapClearlyBetter(card('fly-22', 2, 2, {effects: {flying: 1}}), deckCard), 'a Flying 2/2 for a plain 2/2 (the half-miss x1.5): yes');
  ok(!S.swapClearlyBetter(card('close', 1, 12), card('deck-37', 3, 7)), 'a different shape only a point ahead (14 vs 13): not clearly better');
  ok(S.swapClearlyBetter(card('ahead', 1, 7), card('deck-23', 2, 3)), 'a different shape well ahead (9 vs 7): yes');
  const lumber = card('lumber-44', 4, 4, {cost: 3}), base = card('deck-12', 1, 2);
  ok(!S.swapClearlyBetter(lumber, base), 'a 3-Lumber 4/4 for a free 1/2: a dearer bracket, not offered');
  ok(S.swapClearlyBetter(lumber, base, S.swapOptsFor({teach: 'lumber'})), '...except as the Lumber lesson (anyCost)');
  ok(!S.swapClearlyBetter(card('lumber-11', 1, 1, {cost: 3}), base, {anyCost: true}), 'the Lumber lesson still never offers a weaker card');
  ok(!S.swapClearlyBetter(card('slow-44', 4, 4, {wait: 1}), base), 'more Wait: not offered');
  ok(S.swapClearlyBetter(card('same-bracket', 3, 3, {cost: 2}), card('deck-c1', 1, 2, {cost: 1})), 'the same bracket (1 and 2 Lumber): yes'); }
// the deck: the window's pick is the weakest card it beats; none: no window
{ world.defs = {}; world.deck = {};
  const put = (c, n)=>{ world.defs[c.id] = c; if(n) world.deck[c.id] = n; };
  put(card('bee-12', 1, 2), 3); put(card('trout-33', 3, 3), 2); put(card('frog-23', 2, 3), 1); put(card('new-22', 2, 2)); put(card('new-11', 1, 1)); put(card('new-44', 4, 4));
  ok(S.weakestDeckCard('new-22') === 'bee-12', `a 2/2 coming in: the 1/2 goes (${S.weakestDeckCard('new-22')})`);
  ok(S.weakestDeckCard('new-11') === null, 'a 1/1 coming in: nothing in the deck is weaker, no window');
  ok(S.weakestDeckCard('new-44') === 'bee-12', 'a 4/4 coming in: still the weakest, the 1/2');
  world.deck = {'trout-33': 2, 'frog-23': 1}; ok(S.weakestDeckCard('new-22') === null, 'a deck of 3/3s and 2/3s: no swap for a 2/2');
  ok(S.dominatedDeckCard('new-11') === null && S.dominatedDeckCard('new-44') === 'frog-23', 'the natural offer: the weakest card it dominates and outscores'); }
// the real Map 0-1 swaps: every keyword-teaching card against the starter deck's cards, at their shipped stats
{ const defs = {}; cards.forEach(c=> defs[c.id] = c); world.defs = defs;
  const starter = ['duck-paddler', 'pond-trout', 'meadow-frog', 'otter-kit', 'otter-centurion', 'fleetfootd', 'crimson-wing-recruit', 'mosswing-laborer', 'honey-bee', 'silver-minnow', 'sparrow-chick'].filter(id=> defs[id]);
  world.deck = Object.fromEntries(starter.map(id=> [id, 1]));
  const teach = cards.filter(d=> ['flying', 'swimmer', 'diurnal'].some(k=> d.effects && d.effects[k] != null) && !d.token && !d.test && !(d.cost > 0) && ['common', 'starter', 'basic'].includes(d.rarity || 'common') && (d.attack || 0) + (d.health || 0) <= 9);
  let offers = 0, bad = [];
  teach.forEach(d=>{ const out = S.weakestDeckCard(d.id); if(!out) return; offers++; if(!(S.swapStrength(d) > S.swapStrength(defs[out]))) bad.push(d.id + '->' + out); });
  ok(teach.length > 0 && !bad.length, `${teach.length} teaching cards: ${offers} would be offered, none for a stronger deck card (${bad.join(', ')})`);
  console.log(`  (Map 0-1 teaching swaps against the starter deck: ${offers} of ${teach.length} keyword cards are clearly better than a starter card and get the window)`);
  starter.forEach(id=>{ const out = S.weakestDeckCard(id); ok(!out || S.swapStrength(defs[id]) > S.swapStrength(defs[out]), `${id}: never for a card as strong or stronger (${out})`); }); }
// the window's wiring
{ const f = B.grab('maybeOfferDeckSwap');
  ok(/const sOpts = swapOptsFor\(item\);/.test(f) && /const out = item\.forced \? weakestDeckCard\(id, sOpts\) : dominatedDeckCard\(id\); if\(!out\)\{ setTimeout\(maybeOfferDeckSwap, 50\); return; \}/.test(f), 'the window: a forced swap only for a card it beats; none = no window');
  ok(/deckIds\.some\(o=> swapOutAllowed\(o, k\) && swapClearlyBetter\(defs\[k\], defs\[o\]\)\)/.test(f), 'the right column only lists cards that beat a deck card');
  ok(/swapOutAllowed\(k, inId\) && swapClearlyBetter\(defs\[inId\], defs\[k\], o2\)\)/.test(f), 'the left column only lists deck cards the chosen card beats');
  ok(/better = from0\.filter\(id=> weakestDeckCard\(id\)\)/.test(B.grab('teachingCardPick')), 'the Map 0-1 teaching card is picked among those that beat a deck card, when any do (so the lesson still shows)'); }
// ---- 4. the Tentacle Smack's target (owner: "The raids tentacles should be hitting a random column or row and not my row everytime
// btw!"): a row smack picks the front, middle or back row 1 in 3 each (it was the front, your own row, 2 times in 3); a column smack
// any column with your units (weighted by them: on a full board, evenly). 200 seeded rolls each, over fights (seeds) and over rounds.
{ const seedSrc = src.slice(src.indexOf('function seededRng(seed){'), src.indexOf('let currentMatchSeed'));
  const F = new Function(seedSrc + ['raidSmackRoll', 'raidAtkRange', 'raidSmackDmg', 'RAID_SMACK_BACK_CHANCE', 'raidSmackBack', 'raidSmackKind', 'raidPickColumn', 'raidSmackRow', 'raidSmackTarget'].map(B.grab).join('\n') + '; return {raidSmackTarget, raidSmackRow, raidPickColumn, raidSmackKind};')();
  const COLS = [-2, -1, 0, 1, 2], unit = sl=> ({slot: sl, hp: 5});
  const row = ()=> Object.fromEntries(COLS.map(c=> [c, unit(c)]));
  const m = seed=> ({raidSeed: seed, players: {1: {reserve: [row(), row()]}}, engine: {allBoardCards: ()=> COLS.map(unit)}});
  const a = {pattern: 'column', every: 3};
  const tally = (pick)=>{ const rows = [0, 0, 0], cols = {}; for(let k = 0; k < 200; k++){ const r = pick(k); rows[r.row]++; cols[r.col] = (cols[r.col] || 0) + 1; } return {rows, cols}; };
  // over 200 fights (seeds), the round-6 row smack and the round-3 column smack
  const rng = (s=> ()=>{ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s; })(0xA5A5);
  const seeds = Array.from({length: 200}, ()=> rng());
  ok(F.raidSmackKind(3, a) === 'column' && F.raidSmackKind(6, a) === 'row', 'every 3 turns: a column smack, then a row smack');
  const byFight = tally(k=> ({row: F.raidSmackTarget(m(seeds[k]), 6, 0, a).row, col: F.raidSmackTarget(m(seeds[k]), 3, 0, a).col}));
  const byRound = tally(k=> ({row: F.raidSmackRow(m(seeds[0]), 2 + 2 * k, 0), col: F.raidPickColumn(m(seeds[0]), 1 + 2 * k, 0)}));
  for(const [what, t] of [['200 fights', byFight], ['200 rounds of one fight', byRound]]){
    console.log(`  (Tentacle Smack, ${what}: rows front/middle/back ${t.rows.join(' / ')}; columns ${COLS.map(c=> t.cols[c] || 0).join(' / ')})`);
    ok(t.rows.every(n=> n >= 45 && n <= 90), `${what}: row smacks spread over the front / middle / back rows (${t.rows.join(' / ')}; about 67 each)`);
    ok(t.rows[0] <= 90, `${what}: the front row (yours) is not hit every time (${t.rows[0]} of 200)`);
    ok(COLS.every(c=> (t.cols[c] || 0) >= 22 && (t.cols[c] || 0) <= 60), `${what}: column smacks spread over the five columns (${COLS.map(c=> t.cols[c] || 0).join(' / ')}; about 40 each)`); }
  ok(/const RAID_SMACK_BACK_CHANCE = 2\/3;/.test(src), 'the row smack leaves the front row 2 times in 3 (each row 1 in 3)'); }

ok(/^## 2026-10-19 \(package MX/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

async function browser(){ if(process.env.MX_NO_BROWSER) return;
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require('/home/claude/.npm-global/lib/node_modules/playwright'); }catch(e2){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html'), OUT = path.join(ROOT, 'docs', 'screens', 'mx');
  if(SHOTS) fs.mkdirSync(OUT, {recursive: true});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const QUIET = '[class^="coach-"], .coach-tip, .coach-pointer, .coach-spotlight, .coach-shield, .dlg-overlay, .dialogue-overlay, .toast{display:none !important;}';
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]){
      const tag = String(w);
      const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1}); const pg = await ctx.newPage();
      pg.on('pageerror', e=> errs.push(tag + ': ' + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: QUIET});
      const shot = async name=>{ if(SHOTS) await pg.screenshot({path: path.join(OUT, `${name}-${tag}.png`)}); };
      await pg.evaluate("(()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); adminModeEnabled = true; window.playDialogue = ()=> null; const s = loadDungeonTickets(); s.n = 0; saveDungeonTickets(s); return 1; })()");
      // 2. the key badge at 0: the Play cluster, then the topbar on another tab
      await pg.evaluate("(()=>{ conquestWorldView = false; playSubTab = 'conquest'; switchTab('play'); try{ renderPlay(); }catch(e){} return 1; })()"); await pg.waitForTimeout(1200);
      const kp = await pg.evaluate("(()=>{ const b = document.getElementById('dungeonKeyBtnPlay'); if(!b) return null; const c = b.querySelector('.dk-n'), r = c.getBoundingClientRect(); return {text: c.textContent, empty: b.classList.contains('is-empty'), tip: b.title, shown: r.width > 0 && getComputedStyle(c).display !== 'none', bg: getComputedStyle(c).backgroundColor}; })()");
      ok(kp && kp.text === '0' && kp.empty && kp.shown && /No Dungeon keys/.test(kp.tip), `${tag} 2. the Play 🗝️ says 0, greyed, with the refill tip (${JSON.stringify(kp)})`);
      await shot('key-badge-0-play');
      await pg.evaluate("(()=>{ switchTab('codex'); return 1; })()"); await pg.waitForTimeout(900);
      const kt = await pg.evaluate("(()=>{ const b = document.getElementById('dungeonKeyBtnTop'); if(!b || b.hidden) return null; const c = b.querySelector('.dk-n'); return {text: c.textContent, empty: b.classList.contains('is-empty')}; })()");
      ok(kt && kt.text === '0' && kt.empty, `${tag} 2. the topbar 🗝️ says 0, greyed (${JSON.stringify(kt)})`);
      await shot('key-badge-0-topbar');
      // 1. the raid screen's line. Offline, the stand-ins wear the raid down through the week (standIns.perDayPct), so the Shield the page
      // shows is 50 x what is left; first that, then the raid frozen fresh (no stand-ins) for the pictures: 50.
      const live = await pg.evaluate("(()=>{ const def = liveRaidDefs().find(d=> d.id === 'goliath'), st = currentRaidStateFor(def); return {want: raidShieldNow(def, st), left: RaidM.raidShield(raidDefScaled(def), st, 'left').shield, share: RaidM.weakenShare(st, 'left')}; })()");
      ok(live && live.want === live.left && live.want === Math.round(25 * live.share), `${tag} 1. the page's raid as it stands: Shield ${live && live.want} = 25 (BF5: 50 halved) x ${live && live.share.toFixed(2)}`);
      await pg.evaluate("(()=>{ const orig = currentRaidStateFor; currentRaidStateFor = (def, now, opts)=> orig(Object.assign({}, def, {standIns: {perDayPct: 0}}), now, opts); return 1; })()");
      await pg.evaluate("(()=>{ playSubTab = 'raid'; raidView = 'raid'; switchTab('play'); try{ renderPlay(); }catch(e){} return 1; })()"); await pg.waitForTimeout(1500);
      const line = await pg.evaluate("(()=>{ const p = document.querySelector('.mx-raid-shield'); if(!p) return null; const d = p.closest('details'); if(d) d.open = true; p.scrollIntoView({block: 'center'}); return p.textContent.trim(); })()");
      ok(line && /Shield 25 \(falls as the raid weakens\)/.test(line) /* BF5: halved */, `${tag} 1. the raid screen: "${line}"`);
      await pg.waitForTimeout(300); await shot('raid-shield-line');
      // 1. a raid fight: the VS card's line, then the boss bramble's 🔷 50 on the board
      await pg.evaluate("(()=>{ const def = liveRaidDefs().find(d=> d.id === 'goliath') || allRaidDefs()[0]; window.__mxDef = def; startRaidPartMatch(def, 'left'); return 1; })()");
      await pg.waitForTimeout(1800);
      const vs = await pg.evaluate("(()=>{ const l = document.querySelector('.vs-screen .mx-raid-shield'); if(!l) return null; l.scrollIntoView({block: 'center'}); let sc = null; for(let e = l.parentElement; e; e = e.parentElement){ const o = getComputedStyle(e).overflowY; if(e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(o)){ sc = e; break; } } if(sc){ const r = l.getBoundingClientRect(); sc.scrollTop += r.top - innerHeight / 2; } window.__mxVsScroll = sc ? sc.className : 'none'; return l.textContent.trim(); })()");
      const vsSeen = await pg.evaluate("(()=>{ const l = document.querySelector('.vs-screen .mx-raid-shield'), r = l && l.getBoundingClientRect(); return r ? {top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight, sc: window.__mxVsScroll} : null; })()");
      ok(vsSeen && vsSeen.top >= 0 && vsSeen.bottom <= vsSeen.h, `${tag} 1. the VS card's Shield line can be scrolled into view (${JSON.stringify(vsSeen)})`);
      await pg.waitForTimeout(250);
      ok(vs && /Shield 25/.test(vs) /* BF5 */, `${tag} 1. the VS boss card: "${vs}"`);
      await shot('raid-shield-vs');
      await pg.waitForFunction("typeof matchState !== 'undefined' && matchState && matchState.raidFull && document.querySelector('#appWrap.in-match')", null, {timeout: 20000}).catch(()=>{});
      await pg.waitForTimeout(2500);
      const hq = await pg.evaluate("(()=>{ const m = matchState; if(!m) return null; const badges = [...document.querySelectorAll('.castle-shield')].filter(e=> /^\\D*25$/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0).map(e=> e.className + ':' + e.textContent.trim()); return {shield: m.players[2].hq.shield, max: m.players[2].hq.maxShield, hp: m.players[2].hq.hp, badges}; })()");
      ok(hq && hq.shield === 25 && hq.max === 25 && hq.hp === 175, `${tag} 1. in the fight: the boss bramble 175 Health + 25 Shield (BF5: 350 + 50 halved) (${JSON.stringify(hq && {shield: hq.shield, max: hq.max, hp: hq.hp})})`);
      ok(hq && hq.badges.length > 0, `${tag} 1. the board shows 🔷25 on the boss bramble (${hq && hq.badges.join(' | ')})`);
      // the Shield badge and the Health number both readable on the boss's bramble tile (they overlapped on phones at 🔷50 / 350)
      const lap = await pg.evaluate("(()=>{ const s = [...document.querySelectorAll('.castle-shield')].find(e=> e.getBoundingClientRect().width > 0 && /25$/.test(e.textContent.trim())); /* BF5 */ if(!s) return null; const t = s.closest('.card-tile'), hp = t && t.querySelector('.hp'); if(!hp) return {noHp: true}; const a = s.getBoundingClientRect(), b = hp.getBoundingClientRect(); return {tile: Math.round(t.getBoundingClientRect().width), overlap: !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top), hp: hp.textContent.trim()}; })()");
      ok(lap && !lap.overlap, `${tag} 1. the 🔷 badge and the Health (${lap && lap.hp}) don't overlap (${JSON.stringify(lap)})`);
      await shot('raid-shield-board');
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
}
browser().catch(e=>{ fail++; console.log('  FAIL browser: ' + (e && e.stack || e)); }).then(()=>{
  console.log(`mx-2026-10-19: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
});
