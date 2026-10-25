#!/usr/bin/env node
// 2026-10-25 (package FIX3, owner notes 10-25 17:53 F1-F6 and 22:36 G1-G22). The functions are cut out of arena_app.js and run against
// the real map data (CONQUEST_MAPS) or small stand-ins; tests/e2e/fix3_2026_10_25.py drives the real page at 390 and 1366.
//   F1. a win opens every fight it links to: over every map, each drawn link opens its fight on its own; every fight can be reached;
//       the live edit that linked 6-3 to 6-6 (6-6 needs 6-5 and 6-3) opens 6-6 after 6-3. "all of these" stays as an opt-in.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) a = src.indexOf('\nasync function ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', src.indexOf(')', a)), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
function literal(decl){ const a = src.indexOf('\n' + decl); let i = src.indexOf('[', a), d = 0;
  for(; i < src.length; i++){ const c = src[i]; if(c === '[') d++; else if(c === ']'){ d--; if(!d) break; } }
  return src.slice(src.indexOf('[', a), i + 1); }

// ---------------- F1: links ----------------
{ const MAPS = vm.runInNewContext('(' + literal('const CONQUEST_MAPS = [') + ')', {});
  ok(MAPS.length > 30, 'F1. the map list is read from arena_app.js (' + MAPS.length + ' maps)');
  const vis = new Function('adminModeEnabled', 'loadTutorialDone', 'loadTutorial2Done',
    `function ambushLocksNode(){ return false; } function tutSideNodeGated(){ return false; } function conquestNodeId(m, k){ return m + ':' + k; }
     ${fnSrc('nodeNeedsAllLinks')}\n${fnSrc('isNodeVisible')}\nreturn isNodeVisible;`)(false, ()=> true, ()=> true);
  const id = (m, k)=> m.id + ':' + k;
  let links = 0, shut = [], unreached = [];
  MAPS.forEach(map=>{
    if(!map.sequential || !Array.isArray(map.nodes)) return;
    const real = map.nodes.filter(nd=> nd.kind !== 'tutorial' && !(nd.chance > 0));
    // each drawn link (the trail draws one line per entry of requires) opens its fight on its own (a chance fight once its roll found it)
    map.nodes.forEach((nd, i)=>{ if(!Array.isArray(nd.requires) || nd.requiresAll) return;
      nd.requires.forEach(from=>{ const fn = map.nodes.find(x=> x.key === from); if(!fn || fn.kind === 'tutorial') return; links++;
        if(!vis(map, nd, i, {completed: [id(map, from)], found: nd.chance > 0 ? [id(map, nd.key)] : []})) shut.push(`${map.id} ${from}->${nd.key}`); }); });
    // every fight is reachable by winning what is open
    const done = new Set(); let grew = true;
    while(grew){ grew = false; map.nodes.forEach((nd, i)=>{ if(done.has(nd.key)) return; if(vis(map, nd, i, {completed: [...done].map(k=> id(map, k)), found: map.nodes.filter(x=> x.chance > 0).map(x=> id(map, x.key))})){ done.add(nd.key); grew = true; } }); }
    real.forEach(nd=>{ if(!done.has(nd.key)) unreached.push(`${map.id} ${nd.key}`); });
  });
  ok(links > 150, `F1. links checked over every map (${links})`);
  ok(!shut.length, 'F1. every link opens its fight on its own win ' + shut.slice(0, 8).join(', '));
  ok(!unreached.length, 'F1. every fight on every map can be reached ' + unreached.slice(0, 8).join(', '));
  // the live edit the owner played (card_overrides __cfg:map-nodes:m8, 8-6 = 6-6 needs 8-5 and 8-3)
  const m8 = JSON.parse(JSON.stringify(MAPS.find(m=> m.id === 'm8'))), six = m8.nodes.findIndex(x=> x.key === '6-6');
  m8.nodes[six].requires = ['6-5', '6-3'];
  ok(vis(m8, m8.nodes[six], six, {completed: ['m8:6-1', 'm8:6-2', 'm8:6-3'], found: []}), 'F1. 6-3 won: 6-6 (linked from 6-3 and 6-5) opens');
  ok(vis(m8, m8.nodes[six - 2], six - 2, {completed: ['m8:6-1', 'm8:6-2', 'm8:6-3'], found: []}), 'F1. 6-3 won: 6-4 opens too (both links from 6-3)');
  m8.nodes[six].requiresAll = true;
  ok(!vis(m8, m8.nodes[six], six, {completed: ['m8:6-3'], found: []}) && vis(m8, m8.nodes[six], six, {completed: ['m8:6-3', 'm8:6-5'], found: []}), 'F1. a fight set to "all of these" waits for every link');
  ok(/nodeNeedsAllLinks\(n\) && reqs\.length > 1 \? 'is-all'/.test(src) && /\.map-trail-svg \.is-all\{stroke-dasharray/.test(tpl), 'F1. only an "all of these" fight\'s links are dotted');
  ok(/opt\('all', nodeNeedsAllLinks\(draft\)/.test(src) && /draft\.requiresAll = true/.test(src), 'F1. the skirmish editor offers "all of these" as the opt-in');
  ok(/rq\[nodeNeedsAllLinks\(n\) \? 'every' : 'some'\]/.test(src), 'F1. chance fights roll on the same rule');
}

// ---------------- F2: the map load token ----------------
{ const f = fnSrc('conquestPanTo');
  ok(/const tok = \+\+conquestPanToken; conquestPanTarget = mapId;/.test(f) && /if\(tok !== conquestPanToken\) return;/.test(f), 'F2. each pan takes a token; only the newest pan swaps the map');
  ok(/if\(mapId===conquestSelectedMap && !conquestPanTarget\)/.test(f), 'F2. a pan back to the map on screen cancels the one in flight (it used to be ignored)');
  ok(/getAnimations\(\)\.forEach\(a=> a\.cancel\(\)\)/.test(f), 'F2. fades never stack');
  const r = fnSrc('renderConquestSubTab');
  ok(/const loadTok = \+\+conquestMapLoadToken, loadAlive/.test(r) && (r.match(/loadAlive\(\)/g) || []).length >= 4, 'F2. the map\'s own timers (first-visit zoom and drop, Spire scroll) stop once another map is drawn');
  ok(/if\(!lay\.isConnected \|\| !cv\.isConnected\) return;/.test(fnSrc('tutBgZoom')), 'F2. a late art zoom never lands on the next map'); }

// ---------------- F3 + G26: the round-end lag ----------------
{ const rl = fnSrc('renderLogLine'), soon = fnSrc('fix3PinLogSoon');
  ok(!/battleLogSync\(log\)/.test(rl) && /fix3PinLogSoon\(log\);\n\}$/.test(rl) && /requestAnimationFrame\(run\)/.test(soon), 'F3. a burst of log lines reads and pins the log once a frame, not once a line');
  // the pin itself on a fake box: three lines, one read-and-pin
  let raf = null, reads = 0; const box = {isConnected: true, get scrollHeight(){ reads++; return 900; }, clientHeight: 200, scrollTop: 0, _setTop: 0};
  const ctx = {requestAnimationFrame: f=>{ raf = f; return 1; }, setTimeout: f=>{ raf = f; return 1; }, document: {hidden: false}, battleLogPinned: true};
  vm.createContext(ctx);
  vm.runInContext('var battleLogPinned = true; function battleLogSync(){} function pinBattleLog(l){ if(battleLogPinned){ l.scrollTop = l.scrollHeight; l._setTop = l.scrollTop; } }\n' + src.match(/let fix3LogPinRaf = 0, fix3LogPinEl = null;/)[0] + '\n' + soon, ctx);
  ctx.box = box; vm.runInContext('fix3PinLogSoon(box); fix3PinLogSoon(box); fix3PinLogSoon(box);', ctx);
  ok(reads === 0 && typeof raf === 'function', 'F3. three lines: nothing read yet');
  raf(); ok(reads === 1 && box.scrollTop === 900, 'F3. ... then one read, pinned to the newest line');
  const ft = fnSrc('floatText'), pb = fnSrc('poisonBubbleBurstVfx');
  ok(/if\(f\.animate\)\{/.test(ft) && /a\.onfinish = \(\)=> f\.remove\(\)/.test(ft), 'F3. damage numbers move on the Web Animations API (no style read per number)');
  ok(/if\(b\.animate\)\{/.test(pb) && /a\.onfinish = \(\)=> b\.remove\(\)/.test(pb), 'F3. poison bubbles too');
  ok(/fix3GsapPrime\(ps\);/.test(fnSrc('leafPuff')), 'F3. leaf puffs: all twelve read together, then moved');
  ok(/const plan = \[\.\.\.pools\]\.map\(/.test(fnSrc('clipLightsToBoard')) && /plan\.forEach\(x=>\{ if\(x && x\[0\]\.style\.clipPath !== x\[1\]\)/.test(fnSrc('clipLightsToBoard')), 'F3. light pools: measured first, written after');
  ok(fs.existsSync(path.join(ROOT, 'tools', 'perf', 'fight_profile_2026_10_25.py')), 'F3. the whole-fight profiler is kept (tools/perf/fight_profile_2026_10_25.py)'); }

// ---------------- F4: a loss or draw gives 1 XP ----------------
{ ok(/if\(m\.winner!==1 && QUEST_COUNTING_MODES\.has\(m\.mode\) && !m\.towerReplay && !m\.rewardDuplicate && !m\.proFight && !m\.adminTest\) awardXp\(1\);/.test(src), 'F4. a lost or drawn fight gives 1 XP, never on a free replay, a paid-out fight, a PRO fight or an admin test');
  ok(/if\(res\.winner===1\)\{ bumpQuestCounter\('wins', 1\); awardXp\(3\); \} else awardXp\(1\);/.test(fnSrc('abFight')), 'F4. the auto-battler too'); }

// ---------------- F6 / texts ----------------
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  const get = k=> (TEXT && (TEXT[k] != null ? TEXT[k] : null));
  ok(get('ui.pl1-all-packs') === 'View all', 'F6. the pack opener\'s last button says "View all"');
  const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
  ['ui.pl1-all-packs', 'ui.fix3-overall-raid-rank', 'ui.fix3-old-well', 'results.fix3-rescued-baby', 'ui.fix3-confirm-email'].forEach(k=>{
    const en = get(k); ok(!!en && packs.every(p=> typeof p[en] === 'string' && p[en].length), `texts: "${k}" is in all 12 packs`); });
  ok(packs.every(p=> !('All {n} packs' in p)), 'texts: the old "All {n} packs" row is gone from the packs'); }

// ---------------- G1: a second tap opens a feature at once ----------------
{ const FEATURE_SPOTS = [{key:'codex', go(){ this.went = (this.went||0) + 1; }}, {key:'forge', needs:'codex', go(){ this.went = (this.went||0) + 1; }}];
  let unlocked = {codex: true};
  const again = new Function('FEATURE_SPOTS', 'featureUnlocked', 'Date', `const FIX3_AGAIN_MS = 20000;\n${fnSrc('fix3SpotAgain')}\nreturn fix3SpotAgain;`)(FEATURE_SPOTS, k=> !!unlocked[k], {now: ()=> clock});
  let clock = 1000; const b = {dataset: {spot: 'codex'}};
  ok(again(b) === false && !FEATURE_SPOTS[0].went, 'G1. the first tap goes the usual way (its talk, the gate)');
  clock += 3000; ok(again(b) === true && FEATURE_SPOTS[0].went === 1, 'G1. a second tap within 20 s opens the feature at once, dialogue or not');
  clock += 1000; ok(again(b) === false, 'G1. the next tap starts over');
  clock += 30000; ok(again(b) === false, 'G1. a tap 30 s later is a first tap again');
  const fb = {dataset: {spot: 'forge'}}; again(fb); ok(again(fb) === false && !FEATURE_SPOTS[1].went, 'G1. a spot still waiting on another feature never opens early');
  ok(/if\(fix3SpotAgain\(b\)\) return; if\(!mapTapGate\(b, 1200\)\) return;/.test(src), 'G1. the map spots ask fix3SpotAgain before the tap gate and the NPC shake'); }

// ---------------- G7: sign-up and sign-in ----------------
{ const li = fnSrc('cloudLinkEmail');
  ok(/if\(data && data\.user && !data\.session && !\(cloudUserId && cloudIsAnonymous\)\)\{ fix3SetSignupPending\(data\.user\.id\); fix3RememberAuthReturn\(\); return data; \}/.test(li), 'G7. a sign-up waiting for its email is not taken as signed in (nothing applied, nothing pushed into the void)');
  ok(/emailRedirectTo: fix3AuthRedirectUrl\(\)/.test(li), 'G7. the confirmation link leads back to the game');
  ok(/livePushProgress\(true\)/.test(li), 'G7. a linked account sends the map progress up too');
  const ap = fnSrc('applySessionIdentity');
  ok(/if\(isSignedIn\(\) && fix3SignupPending\(user\.id\)\)\{ try\{ await Promise\.all\(\[cloudPushCurrencies\(\), cloudPushCardLevels\(\), cloudPushDecks\(true\)\]\)/.test(ap) && /else if\(isSignedIn\(\)\) await cloudPullState\(\);/.test(ap), 'G7. the new account\'s first sign-in sends this device\'s progress up instead of loading its empty rows');
  const mem = {}; const ls = {getItem: k=> k in mem ? mem[k] : null, setItem: (k, v)=>{ mem[k] = String(v); }, removeItem: k=>{ delete mem[k]; }};
  const P = new Function('localStorage', `const FIX3_SIGNUP_PENDING_KEY = 'k';\n${fnSrc('fix3SignupPending')}\n${fnSrc('fix3SetSignupPending')}\nreturn {fix3SignupPending, fix3SetSignupPending};`)(ls);
  P.fix3SetSignupPending('u-new'); ok(P.fix3SignupPending('u-new') && !P.fix3SignupPending('u-old') && !P.fix3SignupPending(null), 'G7. only that new account counts as pending (another account signing in here is loaded as before)');
  P.fix3SetSignupPending(null); ok(!P.fix3SignupPending('u-new'), 'G7. cleared after its first push');
  const af = fnSrc('fix3AfterSignIn');
  ok(/cloudPushDecks\(true\)/.test(af) && /livePushProgress\(true\)/.test(af) && /switchTab\(sp\.tab\)/.test(af), 'G7. after a sign-in: one sync, then back to the screen you were on');
  ok(/fix3AfterSignIn\(\); \/\/ FIX3 \(G7\): back to where you were/.test(src) && /refreshCloudCardAdmin\(\); socialInit\(\); fix3AfterSignIn\(\);/.test(src) && /fix3RememberAuthReturn\(\); \/\/ 2026-10-25 \(package FIX3, G7\): back to this screen after Google/.test(src), 'G7. the Profile form, the auth events and Google all come back'); }

// ---------------- G13: one source for the baby ----------------
{ const NEST_TYPES = {woodland: {name:'Woodland', icon:'🍂'}, bug: {name:'Bug', icon:'🐞'}};
  const bi = new Function('NEST_TYPES', fnSrc('babyRewardInfo') + '\nreturn babyRewardInfo;')(NEST_TYPES);
  ok(bi('bug').icon === '🐞' && bi('bug').name === 'Bug' && bi('nope').type === 'woodland', 'G13. babyRewardInfo gives the type, its icon and name');
  ok(/const bi = babyRewardInfo\(t\); showToast\(TX\('toast\.you-rescued-a-little-baby-it', \{v1: bi\.icon/.test(fnSrc('rescueBaby')), 'G13. the toast reads it');
  ok(/const bi = babyRewardInfo\(m\.conquestBabyEarned\);[^\n]*escapeHtml\(bi\.icon\)[^\n]*results\.fix3-rescued-baby/.test(src) && !/TX\('results\.rescued-a-baby'\)/.test(src), 'G13. the results pill reads it too (no more 🐣 there)'); }

// ---------------- G14 / G17: layout rules ----------------
{ ok(/\.nest-picker \[data-np-pane="young"\] \.np-grid\{max-height:min\(50vh, 520px\); overflow-y:auto;/.test(tpl) && /\.nest-picker \[data-np-pane="young"\] \.np-confirm\{position:static;/.test(tpl), 'G14. the younglings scroll in their own box; the Train bar is its own band');
  ok(/\.card-inspect\.ci-split \.ci-bar\{contain:inline-size; justify-self:stretch; min-width:0;\}/.test(tpl), 'G17. the finish buttons no longer widen the card\'s column'); }

// ---------------- G20: Map 0's spots after Map 10 ----------------
{ let passed = 9; const q = new Function('mapsPassed', fnSrc('fix3MapZeroQuiet') + '\nreturn fix3MapZeroQuiet;')(()=> passed);
  ok(!q('m1'), 'G20. before Map 10 is cleared, Map 0 talks as before'); passed = 10; ok(q('m1') && !q('mf'), 'G20. after Map 10, Map 0 (only) answers with a tip');
  ok(/if\(fix3MapZeroQuiet\(c\.map\)\)\{[^\n]*fix3QuietTip\(el, c\.icon, c\.name, 'seen:' \+ c\.dialogue\); return; \}/.test(fnSrc('visitCuriosity')) && /if\(fix3MapZeroQuiet\('m1'\)\)\{ fix3QuietTip\(el, '🪣', TX\('ui\.fix3-old-well'\), 'seen:well_m1'\); return; \}/.test(fnSrc('visitOldWell')), 'G20. the signpost and the old well give the tip, never the conversation'); }

// ---------------- G21: the overall raid rank ----------------
{ ok(/totalRankHTML: `<small class="fix3-rcs-total-lbl">\$\{escapeHtml\(TX\('ui\.fix3-overall-raid-rank'\)\)\}<\/small>\$\{raidTotalRankBadgeHTML\(claim\.mine \|\| 0, \{none: true\}\)\}`/.test(fnSrc('raidClaimScreenSpec')), 'G21. the raid reward screen always shows the overall raid rank, captioned');
  ok(/m\.raidTotalAfter = Math\.round\(\(currentRaidStateFor\(def\)\.contributors/.test(src), 'G21. an admin test fight\'s results show it too'); }

// ---------------- G22: PvP auto-play ----------------
{ let admin = false, passed = 0;
  const allowed = new Function('mapsPassed', 'raidAutoOpen', 'nodeBestRankS', 'autoTier', 'adminModeEnabledRef', `const FIX3_PVP_AUTO_MAP = 25; let adminModeEnabled; return m=>{ adminModeEnabled = adminModeEnabledRef(); return (${fnSrc('autoplayAllowed').replace(/^function autoplayAllowed/, 'function')})(m); };`)(()=> passed, ()=> false, ()=> false, ()=> false, ()=> admin);
  ok(!allowed({mode:'pvp'}), 'G22. a player before Map 25 has no PvP auto-play');
  passed = 25; ok(allowed({mode:'pvp'}), 'G22. past Map 25 a player may auto-play PvP');
  passed = 0; admin = true; ok(allowed({mode:'pvp'}), 'G22. Admin Mode may auto-play PvP');
  ok(!allowed({mode:'liveRanked'}) && !allowed({mode:'pvp', testKit:{}}), 'G22. never a live two-player match or a test kit'); }

console.log(`fix3: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
