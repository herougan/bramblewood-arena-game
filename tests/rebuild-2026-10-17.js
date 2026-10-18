#!/usr/bin/env node
// 2026-10-17 (rebuild). The user's note (23:52):
//   "A new skill: Rebuild N: The unit regenerates the castle for N on ready. As an action, then on the trigger, it regenerates the
//   castle for N."
// Covers: the passive Rebuild N (every upkeep while Ready, the same rule as the On Ready income onReadyGold: from the upkeep its Wait
// runs out; never above the castle's max; nothing for a full castle), the trigger action Rebuild castle N (any trigger; its Attack /
// Health with the amount picker), Herbalist not adding to it, the event, and the app side (card text, chip, editor row, the trigger
// badge and its sentence, the stat budget, the log line, the look and the castle bar during the replay, the Effects library setups,
// the Effects Lab entry and inventory id, the CHANGELOG).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, base, {
  'rb-wall':  U('rb-wall'),
  'rb-2':     U('rb-2', {rebuild:2}),
  'rb-true':  U('rb-true', {rebuild:true}),
  'rb-both':  U('rb-both', {rebuild:3, onReadyGold:1}),
  'rb-herb':  U('rb-herb', {herbalist:2}),
  'rb-spawn': U('rb-spawn', {triggers:[{on:'onSpawn', do:'rebuild', amount:4}]}),
  'rb-atk':   U('rb-atk', {triggers:[{on:'onSpawn', do:'rebuild', amount:'attack'}]}, {attack:3}),
  'rb-hp':    U('rb-hp', {triggers:[{on:'onSpawn', do:'rebuild', amount:'health'}]}, {health:7}),
  'rb-onatk': U('rb-onatk', {triggers:[{on:'onAttack', do:'rebuild', amount:2}]}, {attack:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const hurt = (P, k)=>{ P[1].hq.hp = P[1].hq.maxHp - k; return P[1].hq.hp; };
const round = (e, P, ev)=> e.resolveCombat(P, so, {}, ev || [], 1);

// ---- 1. Rebuild N: every upkeep while Ready
{ const {e, P} = mk(); const B = put(e, P, 1, 'rb-2'); const h0 = hurt(P, 10); const ev = []; round(e, P, ev);
  ok(P[1].hq.hp === h0 + 2, `Rebuild 2: the castle gets 2 back at the upkeep (${h0} → ${P[1].hq.hp})`);
  const r = ev.find(x=> x.type === 'rebuild'); ok(r && r.side === 'A' && r.uid === B.uid && r.defId === 'rb-2' && r.amount === 2 && r.n === 2 && !r.trigger && r.hp === P[1].hq.hp && r.maxHp === P[1].hq.maxHp, 'the rebuild event: side, uid, amount, n, not a trigger, the castle after');
  round(e, P, []); round(e, P, []); ok(P[1].hq.hp === h0 + 6, `every round it is Ready (${P[1].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rb-true'); const h0 = hurt(P, 10); round(e, P, []); ok(P[1].hq.hp === h0 + 2, `Rebuild stored as true: 2 (${P[1].hq.hp - h0})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rb-2'); hurt(P, 1); const ev = []; round(e, P, ev); const r = ev.find(x=> x.type === 'rebuild');
  ok(P[1].hq.hp === P[1].hq.maxHp && r && r.amount === 1 && r.n === 2, `never above max: 1 of 2 (${r && r.amount})`);
  const ev2 = []; round(e, P, ev2); ok(!ev2.some(x=> x.type === 'rebuild') && P[1].hq.hp === P[1].hq.maxHp, 'a full castle: nothing, and no event'); }
// "On Ready" as the On Ready income: a unit on Wait pays from the upkeep its Wait runs out, the same rounds as onReadyGold.
{ const {e, P} = mk(); const B = put(e, P, 1, 'rb-both'); B.wait = 2; const h0 = hurt(P, 20), l0 = P[1].lumber || 0;
  const ev1 = []; round(e, P, ev1); ok(P[1].hq.hp === h0 && (P[1].lumber||0) === l0 && !ev1.some(x=> x.type === 'rebuild'), `Wait 2 → 1: no rebuild (and no lumber) yet (${P[1].hq.hp - h0})`);
  const ev2 = []; round(e, P, ev2); ok(B.wait === 0 && P[1].hq.hp === h0 + 3 && (P[1].lumber||0) === l0 + 1, `the upkeep its Wait runs out: +3 castle, +1 lumber, together (${P[1].hq.hp - h0}, ${(P[1].lumber||0) - l0})`);
  round(e, P, []); ok(P[1].hq.hp === h0 + 6 && (P[1].lumber||0) === l0 + 2, 'and every round after'); }
// Only its own castle; the enemy's isn't touched.
{ const {e, P} = mk(); put(e, P, 2, 'rb-2'); P[2].hq.hp = P[2].hq.maxHp - 10; hurt(P, 10); round(e, P, []);
  ok(P[2].hq.hp === P[2].hq.maxHp - 8 && P[1].hq.hp === P[1].hq.maxHp - 10, `the enemy's builder mends the enemy's castle only (${P[2].hq.maxHp - P[2].hq.hp}, ${P[1].hq.maxHp - P[1].hq.hp})`); }
// Not a unit heal: Herbalist doesn't add to it.
{ const {e, P} = mk(); put(e, P, 1, 'rb-2'); put(e, P, 1, 'rb-herb'); const h0 = hurt(P, 10); round(e, P, []); ok(P[1].hq.hp === h0 + 2, `Herbalist 2 beside it: still 2 (${P[1].hq.hp - h0})`); }
// A fallen castle isn't mended.
{ const {e, P} = mk(); const B = put(e, P, 1, 'rb-onatk'); P[1].hq.hp = 0; const ev = []; e.debugFireTrigger(P, so, B.uid, 'onAttack', {}, ev); ok(P[1].hq.hp === 0 && !ev.some(x=> x.type === 'rebuild'), 'a castle at 0 stays at 0'); }
// The stat: castleRebuilt.
{ const {e, P} = mk(); put(e, P, 1, 'rb-2'); hurt(P, 10); const st = {}; e.resolveCombat(P, so, st, [], 1); const k = Object.keys(st).find(x=> st[x].defId === 'rb-2'); ok(k && st[k].castleRebuilt === 2, 'stats: castleRebuilt 2'); }

// ---- 2. Rebuild castle N: the trigger action
ok(E.ACTION_KEYS.includes('rebuild'), "ACTION_KEYS has 'rebuild'");
{ const {e, P} = mk(); const h0 = hurt(P, 10); const ev = []; const B = put(e, P, 1, 'rb-spawn', ev); const r = ev.find(x=> x.type === 'rebuild');
  ok(P[1].hq.hp === h0 + 4 && r && r.trigger === true && r.uid === B.uid && r.amount === 4 && r.n === 4, `On Spawn, Rebuild castle 4: +4 (${P[1].hq.hp - h0})`);
  ok(ev.some(x=> x.type === 'triggerFired' && x.action === 'rebuild'), 'the trigger announces itself (triggerFired, action rebuild)'); }
{ const {e, P} = mk(); const h0 = hurt(P, 10); put(e, P, 1, 'rb-atk'); ok(P[1].hq.hp === h0 + 3, `= My Attack: +3 (${P[1].hq.hp - h0})`); }
{ const {e, P} = mk(); const h0 = hurt(P, 10); put(e, P, 1, 'rb-hp'); ok(P[1].hq.hp === h0 + 7, `= My Health: +7 (${P[1].hq.hp - h0})`); }
{ const {e, P} = mk(); hurt(P, 2); put(e, P, 1, 'rb-spawn'); ok(P[1].hq.hp === P[1].hq.maxHp, 'the action is capped at max too'); }
{ const {e, P} = mk(); const B = put(e, P, 1, 'rb-onatk'); put(e, P, 2, 'rb-wall'); const h0 = hurt(P, 10); e.debugAttack(P, so, B.uid, {}, []); ok(P[1].hq.hp === h0 + 2, `On Attack, Rebuild castle 2: +2 on its swing (${P[1].hq.hp - h0})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rb-spawn'); put(e, P, 1, 'rb-herb'); const h0 = hurt(P, 10); put(e, P, 1, 'rb-spawn'); ok(P[1].hq.hp === h0 + 4, `Herbalist doesn't add to the action either (${P[1].hq.hp - h0})`); }

// ---- 3. The app: text, chip, editor, budget, log, look
const src = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8');
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const line = k=> (src.match(new RegExp(`\\n  \\{key:'${k}', [^\\n]*`)) || [''])[0];
{ const pd = line('rebuild'); ok(/category:'passive', label:'Rebuild', kind:'number', min:1, defaultValue:2/.test(pd) && /While Ready, it restores/.test(pd) && /every upkeep/.test(pd) && /never above the castle's max/.test(pd), 'PASSIVE_DEFS: Rebuild (number, default 2), the editor help');
  ok(/codexNote:'Its action form, Rebuild castle N/.test(src), 'the Codex note names the action form'); }
{ const m = src.match(/\n  rebuild: v=> `[^`]*`,/); let t = ''; try{ const ctx = {out:{}}; vm.runInNewContext(fnSrc('numOr') + '\nout.f = ' + m[0].trim().replace(/^rebuild: /, '').replace(/,$/, ''), ctx); t = ctx.out.f(3); }catch(e){}
  ok(t === 'While Ready, restore 3 Health to your castle every upkeep.', `SKILL_TEXT: "${t}"`); }
ok(/SKILL_ICON\.rebuild = '🔨🏰';/.test(src), 'SKILL_ICON: 🔨🏰 (🧱 is Bulwark\'s)');
ok(/const CHIP_FALLBACK_SKILLS = \[[^\]]*'rebuild'\]/.test(src), 'the chip on the skill strip (CHIP_FALLBACK_SKILLS)');
{ const ad = line('rebuild').length ? (src.match(/\n  \{key:'rebuild', label:'Rebuild castle', fields:\['amount'\][^\n]*/) || [''])[0] : ''; ok(ad && /Any trigger/.test(ad), 'ACTION_DEFS: Rebuild castle, one amount field'); }
ok(/case 'rebuild': return '🔨';/.test(fnSrc('triggerActionEmoji')), 'the trigger badge: ⚡ → 🔨');
ok(/case 'rebuild': doText = `restore \$\{amt\} Health to your castle`;/.test(fnSrc('triggerPreviewText')), 'the trigger sentence: "…, restore N Health to your castle."');
ok(/aDef\.key==='damage' \|\| aDef\.key==='heal' \|\| aDef\.key==='rebuild'/.test(fnSrc('actionFieldsHTML')), 'the editor row offers = My Attack / = My Health');
// The stat budget: like a heal (its value).
{ const ctx = {out:{}}; vm.runInNewContext((src.match(/const SB_DEFAULT_SKILLS = \{[^\n]*/) || [''])[0] + '\nconst SB_PAY_DEF = {};\n' + fnSrc('sbSkillCost') + '\nout.c = sbSkillCost({rebuild:3}, {skills:{}}); out.h = sbSkillCost({heal:3}, {skills:{}});', ctx);
  ok(ctx.out.c === 3 && ctx.out.c === ctx.out.h, `stat budget: Rebuild 3 costs 3, as Heal 3 (${ctx.out.c}, ${ctx.out.h})`); }
// The log line.
{ const ctx = {matchState:{mode:'conquest'}, out:{}}; vm.runInNewContext(fnSrc('rebuildLogText') + '\nout.f = rebuildLogText;', ctx); const nm = id=> '🦫 ' + id;
  const a = ctx.out.f({type:'rebuild', side:'A', defId:'Beaver', amount:2, n:2}, nm), b = ctx.out.f({type:'rebuild', side:'B', defId:'Beaver', amount:1, n:2}, nm);
  ok(a.cls === 'heal' && a.text === '🔨🏰 🦫 Beaver rebuilds your castle: +2 Health.', `log: "${a.text}"`);
  ok(b.text === "🔨🏰 🦫 Beaver rebuilds the enemy's castle: +1 Health (1 of 2: it is back to full).", `log, capped: "${b.text}"`); }
ok(/if\(ev\.type === 'rebuild'\) return rebuildLogText\(ev, nm\);/.test(fnSrc('logText')), 'logText hands the rebuild event to rebuildLogText');
ok(/try\{ rebuildVfx\(ev\); \}catch\(e\)\{\}/.test(fnSrc('renderVfxForEvent')), 'renderVfxForEvent plays rebuildVfx');
ok(/else if\(ev\.type==='rebuild'\) base = 560;/.test(fnSrc('delayForEvent')), 'delayForEvent gives the planks their beat');
// The look: the castle bar's running number goes up during the replay (capped), the planks fly, "+N" on the HP bar.
{ const calls = [], timers = [];
  const ctx = {out:{}, matchState:{resolving:true, displayHqHp:{A:40, B:30}, players:{1:{hq:{hp:44, maxHp:44}}, 2:{hq:{hp:30, maxHp:60}}}},
    SoundKit:{woodKnock(){ calls.push('knock'); }, healTone(){ calls.push('heal'); }}, w2Later:(ms, fn)=> fn(), setTimeout:(fn, ms)=>{ timers.push(ms); fn(); },
    hqTileEl:s=> ({side:s, classList:{contains:()=> true}, animate(){ calls.push('thunk'); }}), boardCardEl:u=> ({uid:u}), reducedMotion:()=> false, fxLevel:()=> 'high',
    floatGlyphs:(a, b, g)=>{ calls.push('glyphs:' + g.join('')); }, updateHqHpDisplay:s=> calls.push('bar:' + s), floatText:(el, t, c)=> calls.push('float:' + t + ':' + c), hqRibbonFloatAnchor:s=> ({anchor:s})};
  vm.runInNewContext(fnSrc('rebuildVfx') + '\nout.f = rebuildVfx;', ctx);
  ctx.out.f({type:'rebuild', side:'A', uid:5, amount:6, n:6}); ok(ctx.matchState.displayHqHp.A === 44, `during the replay the bar's number goes up, capped at max (${ctx.matchState.displayHqHp.A})`);
  ok(calls.includes('glyphs:🪵🧱🪨🪵') && calls.includes('bar:A') && calls.includes('float:🔨 +6:heal hq-big') && calls.includes('thunk') && calls.includes('knock') && calls.includes('heal'), 'planks and stones fly in, the bar fills, a green "+N" on the HP bar, the castle thunks: ' + calls.join(' '));
  ctx.out.f({type:'rebuild', side:'B', uid:6, amount:3, n:3}); ok(ctx.matchState.displayHqHp.B === 33, 'the enemy castle too');
  const before = calls.length; ctx.out.f({type:'rebuild', side:'A', amount:0}); ok(calls.length === before, 'nothing restored: no look'); }
// On Discard (from the hand) mends the castle too.
ok(/rebuild/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'bramblewood-engine.js'), 'utf8').match(/function pitchCard[\s\S]{0,4000}/)[0]) && /onDiscardRebuild\.forEach\(ev=>\{ try\{ pushLog\(ev\); renderVfxForEvent\(ev\); \}catch\(e\)\{\} \}\);/.test(src), 'On Discard, Rebuild castle: the hand path mends, logs and plays it');

// ---- 4. Effects library, Effects Lab, inventory, CHANGELOG
{ const sk = src.slice(src.indexOf('const FXL_SKILL_SETUPS'), src.indexOf('const FXL_TRIGGER_SETUPS')), ac = src.slice(src.indexOf('const FXL_ACTION_SETUPS'), src.indexOf('const FXL_CHANCE_TWO'));
  ok(/\n  rebuild: \{hqHurt:12, steps:\['round', 'round'\]/.test(sk), 'Effects library: the Rebuild skill setup (a wounded castle, two rounds)');
  ok(/\n  rebuild: \{t:\{amount:4\}, hqHurt:12/.test(ac), 'Effects library: the Rebuild castle action setup');
  ok(/rebuild:2/.test((src.match(/const FXL_NUMBER_DEFAULTS = \{[^\n]*/) || [''])[0]), 'FXL_NUMBER_DEFAULTS: Rebuild 2'); }
{ const ctx = {out:{}}; vm.runInNewContext(fnSrc('fxlHqFill') + '\nout.f = fxlHqFill;', ctx); const P = {1:{hq:{hp:30, maxHp:50}}, 2:{hq:{hp:10, maxHp:50}}};
  ctx.out.f(P, {hqHurt:12}); ok(P[1].hq.hp === 30 && P[2].hq.hp === 50, 'fxlHqFill: with hqHurt your castle keeps what it has (the mend stays on the bar); the other is refilled');
  P[1].hq.hp = 0; ctx.out.f(P, {hqHurt:12}); ok(P[1].hq.hp === 1, 'and never falls');
  ctx.out.f(P, {}); ok(P[1].hq.hp === 50, 'no hqHurt: both refilled, as before'); }
ok((src.match(/fxlHqFill\(/g) || []).length >= 4 && !/\[1,\s?2\]\.forEach\(pid=>\{ P\[pid\]\.hq\.hp = P\[pid\]\.hq\.maxHp; \}\);/.test(fnSrc('fxlStepSilent') + fnSrc('fxlBuildStage')), 'the library refills its castles through fxlHqFill');
ok(/if\(sc\.hqHurt > 0\) P\[1\]\.hq\.hp = Math\.max\(1, P\[1\]\.hq\.maxHp - sc\.hqHurt\);/.test(fnSrc('fxlPopulate')), 'fxlPopulate wounds your castle for an hqHurt setup');
{ const lab = fs.readFileSync(path.join(H.ROOT, 'tools/effects-lab/manifest/rebuild17.js'), 'utf8'); ok(/R\(\{id:'sk-rebuild'/.test(lab) && /G\.fire\('rebuildVfx'/.test(lab), 'Effects Lab manifest: sk-rebuild plays the game\'s rebuildVfx');
  const extra = fs.readFileSync(path.join(H.ROOT, 'tools/effects-lab/fx-src-extra.txt'), 'utf8'); ok(/\nrebuildVfx\n?/.test(extra), 'fx-src-extra.txt lists rebuildVfx');
  const inv = JSON.parse(fs.readFileSync(path.join(H.ROOT, 'docs/effects-inventory-2026-10-15.json'), 'utf8')); const it = inv.filter(x=> x.id === 'sk-rebuild');
  ok(it.length === 1 && ['built', 'live'].includes(it[0].status) && it[0].added === '2026-10-17', 'inventory: one sk-rebuild entry, built'); } // 'live' since 2026-10-18 (refresh_inventory.py)
{ const cl = fs.readFileSync(path.join(H.ROOT, 'docs/CHANGELOG.md'), 'utf8'); const i = cl.indexOf('## 2026-10-17 (rebuild)'); ok(i >= 0 && /Rebuild N/.test(cl.slice(i, i + 3000)), 'CHANGELOG: the 2026-10-17 (rebuild) section'); }

console.log(`rebuild-2026-10-17: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
