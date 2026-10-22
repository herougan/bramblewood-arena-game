#!/usr/bin/env node
// 2026-10-18 (package BP, owner 21:54 / 21:56).
//   1+6  wind on the Flyers: under a strong wind a Flyer's wing is lit like a Tide unit's wave (.wind-live shares the .tide-live rule);
//        a Tailwind also lights a Quick boot (wing + quick), a Headwind marks the wing ×2 (skills twice) — the engine's rules
//        (rollWind / headwindDouble / the Tailwind pass); calm, no wind or Ashy: no marks; the marks follow the 'wind' event mid-replay.
//   2    the leader's "joins the fight!" callout runs ×0.8 (LEADER_CALLOUT_MS), the queue waits ×0.75 (LEADER_THRONE_WAIT_MS).
//   3    night hover lines: nothing night-specific hides them, and the hover retries a card that is still landing (tryFacingHover).
//   4    Stampede (Trample): its bramble number pops on the field's HP bar (hqRibbonFloatAnchor), and its preview line runs on from
//        the blocker to the HP bar, faint always, lit with 💥 +N when the swing would carry over (stampedeExpected).
//   5    the battle log opens on the newest line and stays pinned unless the player scrolls up (battleLogPinned).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const src = R('arena_app.js'), tpl = R('arena_template.html'), texts = R('bramblewood-texts.js'), eng = R('bramblewood-engine.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
// a top-level function's source, by brace matching from "function name("
function fnSrc(name, from){ const s = from || src, i = s.indexOf('\nfunction ' + name + '('); if(i < 0) return null; let d = 0, j = s.indexOf('{', i);
  for(let k = j; k < s.length; k++){ const ch = s[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return s.slice(i + 1, k + 1); } } return null; }
const constLine = name=>{ const m = src.match(new RegExp('^const ' + name + ' = [^\\n]*$', 'm')); return m ? m[0] : null; };

// ---- 1 + 6. wind
{ const f = fnSrc('liveWindState'); ok(!!f, 'liveWindState exists');
  const ctx = {matchState:null}; vm.createContext(ctx); vm.runInContext(f, ctx);
  const eng0 = o=> Object.assign({isAshy: ()=> false, isWindy: ()=> false, windSideOf: ()=> null}, o || {});
  ctx.matchState = {engine: eng0(), _windNow: {windy:true, mine:true}};
  ok(ctx.liveWindState(1) && ctx.liveWindState(1).k === 'tail', 'the wind from your side: your Flyers have a Tailwind');
  ok(ctx.liveWindState(2) && ctx.liveWindState(2).k === 'head', '... and the other side\'s a Headwind');
  ctx.matchState._windNow = {windy:true, mine:false};
  ok(ctx.liveWindState(1).k === 'head' && ctx.liveWindState(2).k === 'tail', 'the other way round when it blows from their side');
  ctx.matchState._windNow = {windy:false, mine:true}; ok(ctx.liveWindState(1) === null && ctx.liveWindState(2) === null, 'a calm round: no marks');
  ctx.matchState = {engine: eng0({isAshy: ()=> true}), _windNow: {windy:true, mine:true}}; ok(ctx.liveWindState(1) === null, 'Ashy grounds the Flyers: no marks');
  ctx.matchState = {engine: eng0({isWindy: ()=> true, windSideOf: p=> p === 2 ? 'tail' : 'head'})}; ok(ctx.liveWindState(2).k === 'tail' && ctx.liveWindState(1).k === 'head', 'before any wind event: the engine\'s own windSideOf');
  ctx.matchState = {engine: eng0(), over: true, _windNow: {windy:true, mine:true}}; ok(ctx.liveWindState(1) === null, 'a finished match: no marks');
  ok(ctx.liveWindState(0) === null && ctx.liveWindState(undefined) === null, 'no side (a hand card, the Codex): no marks'); }
// the engine's rules the marks describe
ok(/function windSideOf\(pid\)\{ return !windNow \? null : \(pid === windFrom \? 'tail' : 'head'\); \}/.test(eng), 'engine: the side the wind blows from is the Tailwind side');
ok(/function headwindDouble\(card, pid\)\{ return windNow && isFlyingCard\(card\) && !ashyNow\(\) && windSideOf\(pid\) === 'head'; \}/.test(eng), 'engine: a Headwind doubles a Flyer\'s skills and triggers (not while Ashy)');
ok(/\(wind && e\.flying && !ashyNow\(\) && windSideOf\(pid\) === 'tail'\) \? 'tailwind'/.test(eng) && /c\.ffCounters = \(c\.ffCounters\|\|0\) \+ 1;/.test(eng), 'engine: a Tailwind gives a Flyer an extra (Fast Forward) turn');
{ const ab = fnSrc('abilityBadges'); ok(!!ab, 'abilityBadges exists');
  ok(/const lw = e\.flying && bopts && bopts\.live \? liveWindState\(bopts\.live\.pid\) : null;/.test(ab), 'a board Flyer asks liveWindState for its side');
  ok(/class="ab-wing wind-live wind-\$\{lw\.k\}"/.test(ab) && /<b class="wind-x2">×2<\/b>/.test(ab), 'the wing gets .wind-live (and ×2 on a Headwind)');
  ok(/if\(e\.quick \|\| \(lw && lw\.k === 'tail'\)\)/.test(ab) && /class="ab-quick ab-wind-quick wind-live wind-tail"/.test(ab), 'a Tailwind adds a lit Quick boot (or lights its own)');
  ok(/TX\('ui\.wind-tail-wing'\)/.test(ab) && /TX\('ui\.wind-head-wing'\)/.test(ab) && /TX\('ui\.wind-tail-quick'\)/.test(ab), 'the marks\' titles are TX keys'); }
['ui.wind-tail-wing', 'ui.wind-head-wing', 'ui.wind-tail-quick'].forEach(k=> ok(texts.includes('"' + k + '": '), 'TX key ' + k));
ok(/\.ab-tide\.tide-live, \.wind-live\{/.test(tpl), '.wind-live shares the .tide-live highlight rule');
ok(/pid: live\.pid/.test(src) && /packChainBonus: c\.packChainBonus\|\|0, pid: opts\.pid, atkLabel/.test(src), 'the board card passes its side (pid) down to the badges');
ok(/syncWindField\(matchState\); syncWindBadges\(\);/.test(src) && !!fnSrc('syncWindBadges'), 'the wind event re-marks the Flyers on the board at once (syncWindBadges)');

// ---- 2. the leader's moment
{ const ctx = {}; vm.createContext(ctx);
  ['LEADER_THRONE_FX_MS', 'LEADER_CALLOUT_BASE_MS', 'LEADER_QUEUE_WAIT'].forEach(k=>{ const l = constLine(k); ok(!!l, k + ' is declared'); if(l) vm.runInContext(l.replace(/^const /, 'var '), ctx); });
  ok(ctx.LEADER_CALLOUT_BASE_MS === 2400 && ctx.LEADER_CALLOUT_FADE === 0.8 && ctx.LEADER_CALLOUT_MS === Math.round(2400 * 0.8), `the callout runs ×0.8 of 2.4 s (${ctx.LEADER_CALLOUT_MS} ms)`);
  ok(ctx.LEADER_QUEUE_WAIT === 0.75 && ctx.LEADER_THRONE_WAIT_MS === Math.round(ctx.LEADER_THRONE_FX_MS * 0.75), `the queue waits ×0.75 of the throne moment (${ctx.LEADER_THRONE_WAIT_MS} of ${ctx.LEADER_THRONE_FX_MS} ms)`); }
ok(!/noteMatchFx\([^\n]*LEADER_THRONE_FX_MS/.test(src) && (src.match(/noteMatchFx\([^\n]*LEADER_THRONE_WAIT_MS/g) || []).length === 3, 'all three leader waits use LEADER_THRONE_WAIT_MS');
ok(/b\.style\.animationDuration = LEADER_CALLOUT_MS \+ 'ms'; document\.body\.appendChild\(b\); setTimeout\(\(\)=> b\.remove\(\), LEADER_CALLOUT_MS\);/.test(src), 'the callout\'s animation and removal use LEADER_CALLOUT_MS');
ok(/\.leader-callout\{position:fixed; z-index:1103; animation-duration:1\.92s;/.test(tpl), 'the callout CSS says 1.92 s');

// ---- 3. night hover lines
{ const sf = fnSrc('showFacing'), wf = fnSrc('wireFacingHover'), busy = fnSrc('facingCardBusy');
  ok(!!sf && !!wf && !!busy, 'showFacing / wireFacingHover / facingCardBusy exist');
  const code = (sf + wf + busy).replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, ''); // the code, not its comments
  ok(!/night|getPhase|nightDim|sightMiss|isDark|dark-scene/i.test(code), 'nothing in the hover path checks night or darkness');
  ok(/bf\.addEventListener\('pointermove'/.test(wf) && /tryFacingHover\(c, 0\)/.test(wf), 'a move inside a card redraws its lines');
  // the night layers never cover or hide the lines
  ok(!/(night|dark-scene|bf-lantern|phase="night")[^{\n]*\.facing-svg[^{]*\{[^}]*(display:\s*none|opacity:\s*0|visibility:\s*hidden)/.test(tpl), 'no night / dark rule hides .facing-svg');
  ok(/#battlefieldEl > \.night-veil\{position:absolute; inset:0; z-index:0; pointer-events:none;/.test(tpl) && /\.battlefield \.night-cursor-light\{position:absolute; inset:0; z-index:6; pointer-events:none;/.test(tpl), 'the night veil and the night light never take the pointer');
  // tryFacingHover: a busy (landing) card is retried until it settles
  const ctx = {calls:[], timers:[], facingHoverUid:null, facingRetryT:0, FACING_RETRY_MS:120, FACING_RETRY_MAX:33};
  vm.createContext(ctx);
  vm.runInContext(fnSrc('tryFacingHover') + `
    function clearTimeout(){}
    function setTimeout(f){ timers.push(f); return timers.length; }
    var busyLeft = 3; function facingCardBusy(c){ return busyLeft-- > 0; }
    function showFacing(u){ calls.push(u); }
    var card = {isConnected:true, dataset:{uid:'7'}, matches: ()=> true};
    function boardCardEl(){ return card; }`, ctx);
  ctx.facingHoverUid = '7'; vm.runInContext('tryFacingHover(card, 0)', ctx);
  let guard = 0; while(ctx.timers.length && guard++ < 50){ const t = ctx.timers.shift(); t(); }
  ok(ctx.calls.length === 1 && ctx.calls[0] === '7', `a card still landing gets its lines once it settles (${ctx.calls.length} draw after 3 busy checks)`);
  ctx.calls.length = 0; ctx.timers.length = 0; vm.runInContext('busyLeft = 99; card.matches = ()=> false; tryFacingHover(card, 0)', ctx); guard = 0; while(ctx.timers.length && guard++ < 50){ ctx.timers.shift()(); }
  ok(ctx.calls.length === 0, 'the pointer left it: no retry draws'); }

// ---- 4. Stampede
{ const ctx = {}; vm.createContext(ctx); const f = fnSrc('stampedeExpected'); ok(!!f, 'stampedeExpected exists'); vm.runInContext(f, ctx);
  ok(ctx.stampedeExpected(6, 1, 0) === 5, '6 Attack into a 1 Health unit carries 5 on');
  ok(ctx.stampedeExpected(6, 3, 2) === 1, 'Armor 2 soaks first: 6 - 2 - 3 = 1');
  ok(ctx.stampedeExpected(3, 5, 0) === 0 && ctx.stampedeExpected(5, 5, 0) === 0, 'no kill, or an exact kill: nothing carries on'); }
{ const sh = fnSrc('stampedeFacingHTML');
  ok(!!sh && /class="facing-stampede\$\{over > 0 \? ' is-over' : ''\}"/.test(sh) && /🐘 \+\$\{over\}/.test(sh), 'the second segment: faint, lit with 🐘 +N when it carries over'); // 🐘 since 2026-10-22 (GD: 💥 is the crit mark)
  ok(/\.effects\|\|\{\}\)\.overwhelm/.test(sh) && /f\.foes\.length !== 1/.test(sh) && /data-hpribbon="\$\{f\.pid===1 \? 'B' : 'A'\}"/.test(sh), 'only a Stampede unit with one blocker, aimed at the enemy HP bar');
  ok(/html \+= stampedeFacingHTML\(m, uid, f, src, sr, cx, cy\);/.test(fnSrc('showFacing')), 'showFacing adds it after the line to the blocker');
  ok(/\.facing-svg line\.facing-stampede\{stroke:#ff8a4c; opacity:\.28;\}/.test(tpl) && /\.facing-svg line\.facing-stampede\.is-over\{stroke:#ff6a2a; opacity:\.95;\}/.test(tpl), 'its CSS: faint / lit'); }
{ const i = src.indexOf("if(ev.type==='overwhelmHQ'){\n    const el = hqTileEl(ev.targetSide);"), blk = i < 0 ? '' : src.slice(i, src.indexOf('\n  }', i));
  ok(!!blk && /hqRibbonFloatAnchor\(ev\.targetSide\) \|\| el/.test(blk) && /dnFloat\(at, ev\.dmg, \{addCls:'hq-big', fit:false\}\)/.test(blk) /* DN2 (2026-10-22): <number>, no minus (was '💥 -N') */ && !/floatText\(el,/.test(blk), 'Stampede\'s number pops on the field\'s HP bar, like a hitHQ\'s');
  const j = src.indexOf("if(ev.type==='pierceHQ'){\n    const el = hqTileEl(ev.targetSide);"), pb = j < 0 ? '' : src.slice(j, src.indexOf('\n  }', j));
  ok(/hqRibbonFloatAnchor\(ev\.targetSide\) \|\| el/.test(pb), '... and so does Puncture\'s'); }

// ---- 5. the battle log
{ const rl = fnSrc('renderLogLine'); ok(/battleLogSync\(log\);/.test(rl) && /pinBattleLog\(log\);\n\}$/.test(rl) && !/userScrolled/.test(rl), 'new lines follow the bottom while the log is pinned');
  const ti = src.indexOf("if(panel) panel.classList.toggle('collapsed', !battleLogOpen);"), pi = src.indexOf('if(battleLogOpen) pinBattleLog(null, true);');
  ok(ti > 0 && pi > ti && pi - ti < 600, 'opening the log pins it AFTER the panel is shown (it used to scroll while display:none)');
  ok(/\{ const pin0 = battleLogPinned; m\.log\.forEach\(renderLogLine\); battleLogPinned = pin0; \}[^\n]*\n  try\{ if\(!m\._logPinInit\)\{ m\._logPinInit = true; battleLogPinned = true; \} wireBattleLogScroll\(\);/.test(src), 'a full render keeps the place (and a new match starts pinned)');
  ok(/logEl\.hidden = false; logEl\.scrollTop = logEl\.scrollHeight;/.test(src), 'a past match\'s log opens on its last line');
  ok(/\$\{lines\.reverse\(\)\.join\(''\)\}/.test(fnSrc('cardActionLogHTML')), 'a card\'s own log lines read oldest first, newest at the bottom');
  // the pin logic on a fake scroll box
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(constLine('BATTLE_LOG_PIN_PX').replace(/^const /, 'var ') + '\nvar battleLogPinned = true, battleLogScrollTop = 0;\n' + fnSrc('battleLogAtBottom') + '\n' + fnSrc('pinBattleLog') + '\n' + fnSrc('battleLogSync') + '\n' + fnSrc('wireBattleLogScroll') + `
    var handlers = {}; var box = {scrollHeight:1000, clientHeight:200, scrollTop:800, isConnected:true, dataset:{}, addEventListener:(t, f)=>{ handlers[t] = f; }};
    var document = {getElementById: ()=> box};`, ctx);
  vm.runInContext('wireBattleLogScroll(); box.scrollTop = 300; handlers.scroll();', ctx);
  ok(ctx.battleLogPinned === false, 'scrolling up to read unpins it');
  vm.runInContext('box.scrollHeight = 1200; pinBattleLog(box);', ctx); ok(ctx.box.scrollTop === 300, '... so a new line doesn\'t yank the reader down');
  vm.runInContext('box.scrollTop = 990; handlers.scroll();', ctx); ok(ctx.battleLogPinned === true, 'back at the bottom: pinned again');
  vm.runInContext('box.scrollTop = 0; battleLogPinned = false; pinBattleLog(null, true);', ctx); ok(ctx.box.scrollTop === 1200 && ctx.battleLogPinned, 'opening the log goes to the newest line');
  // a scroll event can lag behind a burst of lines: battleLogSync reads the box itself before each line
  vm.runInContext('pinBattleLog(box); box.scrollTop = 400; battleLogSync(box);', ctx); ok(ctx.battleLogPinned === false, 'scrolled up, no scroll event yet: the next line still sees it and unpins');
  vm.runInContext('box.scrollTop = 995; battleLogSync(box);', ctx); ok(ctx.battleLogPinned === true, 'scrolled back down, no event yet: pinned again');
  vm.runInContext('var fresh = {scrollHeight:300, clientHeight:200, scrollTop:0, dataset:{}}; battleLogSync(fresh);', ctx); ok(ctx.battleLogPinned === true, 'a fresh (re-rendered) log at 0 doesn\'t read as scrolling up'); }

console.log(`bp-2026-10-19: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
