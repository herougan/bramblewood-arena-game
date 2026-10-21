#!/usr/bin/env node
// 2026-10-17 (lightning). The user's note (23:25):
//   "Voltaic Eel should have chain lighting as well. Anyway, all its lighting attacks should not throw a generic ball at the enemy. When
//   the lightning arcs, the enemies take the lightning damage straight away. Elemental damage has the respective elemental emoji
//   attached. For the skill "Electricity", I think maybe the effect can look a little more cyan (10%) than chain lighting to
//   differentiate them. Then remove Electricity from Voltaic Eel.
//   Remove the wet unit description from electricity. Wet units just take +N damage by default, for every wet counter. Can see this in
//   codex instead."
// Covers: the general Wet rule (+1 lightning damage per Wet counter: Swimmer/Tide unit, Rain, the Tide in), Electricity without its own
// wet bonus, the new Chain Lightning N, Shock Bolt and Lightning as lightning (shock) damage, Voltaic Eel's skills, and the board side
// (every lightning hit is its own bolt, never a thrown projectile; element emoji on numbers and log lines; Electricity's cyan bolt).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const {TEXT: TEXT_D, TX: TX_D} = require(path.join(__dirname, '..', 'bramblewood-texts.js')); // 2026-10-18 (package D): the terse texts are TX keys
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, base, {
  'lt-wall':  U('lt-wall'),
  'lt-swim':  U('lt-swim', {swimmer:true}),
  'lt-tide':  U('lt-tide', {tide:true}),
  'lt-elec':  U('lt-elec', {electricity:2}, {attack:1}),
  'lt-chain': U('lt-chain', {chainLightning:2}, {attack:1}),
  'lt-chain1': U('lt-chain1', {chainLightning:true}, {attack:1}),
  'lt-sb':    U('lt-sb', {shockBolt:2}),
  'lt-sky':   U('lt-sky', {lightning:2}),
  'lt-dl':    U('lt-dl', {dragonLightning:3}, {attack:2}),
  'lt-shockA': U('lt-shockA', {}, {attack:3, dmgType:'shock'}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);
  if(slot != null){ c.slot = slot; const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); if(e.syncSlots) e.syncSlots(pl); }
  return c; }
// One Electricity 2 swing: the target (a plain wall, so the melee hit can't be a Tide dodge) and the unit beside it (`side`).
function elec(side, rules, field){ const {e, P} = mk(4, rules); if(field) e.setField(field, 3); const T = put(e, P, 2, 'lt-wall', 0), N = put(e, P, 2, side, 1); const X = put(e, P, 1, 'lt-elec', 0);
  const ev = []; e.debugAttack(P, so, X.uid, {}, ev); return {T, N, ev}; }

// ---- 1. Wet: +1 lightning damage per Wet counter, Electricity's own +1s gone (nothing counts twice)
{ const r = elec('lt-wall'); ok(r.T.hp === 49 && r.N.hp === 48, `dry: the swing 1, the arc 2 (${r.T.hp}, ${r.N.hp})`); }
{ const r = elec('lt-swim'); ok(r.N.hp === 47, `a Swimmer has 1 Wet counter: the arc deals 2 + 1 (${r.N.hp})`);
  const arcHit = r.ev.find(x=> x.type === 'hit' && x.electricity); ok(arcHit && arcHit.dmgType === 'shock' && arcHit.wet === 1 && arcHit.arc, 'the arc hit is shock damage and says wet 1');
  ok(r.ev.filter(x=> x.type === 'hit' && x.electricity).length === 1, 'no extra zap on the target any more (one Electricity hit per swing)'); }
{ const r = elec('lt-tide'); ok(r.N.hp === 47, `a Tide unit has 1 Wet counter (${r.N.hp})`); }
{ const r = elec('lt-wall', {}, 'rain'); ok(r.T.hp === 49 && r.N.hp === 47, `the Rain: everyone 1 counter; the target's melee hit (physical) gets nothing (${r.T.hp}, ${r.N.hp})`); }
{ const r = elec('lt-swim', {}, 'rain'); ok(r.N.hp === 46, `a Swimmer in the Rain: 2 counters, 2 + 2 (${r.N.hp})`); }
{ const r = elec('lt-swim', {permaTide:true}, 'rain'); ok(r.N.hp === 46, `a Swimmer in the Rain with the Tide in: 2 counters (in the water, Rain; 2026-10-18 owner 15:05), 2 + 2 (${r.N.hp})`); }
{ const r = elec('lt-wall', {permaTide:true}); ok(r.N.hp === 47, `the Tide in (Flood) wets everyone: 1 counter (${r.N.hp})`); }
{ const r = elec('lt-wall'); const el = r.ev.find(x=> x.type === 'electricity'); ok(el && !('wetTarget' in el) && !el.wetArc, 'the electricity event no longer carries wetTarget'); }
// A melee attacker whose damage type is shock: the Wet rule reads computeHitDamage too.
{ const {e, P} = mk(2); const T = put(e, P, 2, 'lt-swim', 0); const X = put(e, P, 1, 'lt-shockA', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev);
  const h = ev.find(x=> x.type === 'hit'); ok(!h || T.hp === 50 - h.dmg, 'shock melee hit lands'); ok(!h || h.dmg === 4, `a shock melee hit on a Swimmer: 3 + 1 (${h && h.dmg})`); }
// Not lightning: a physical hit on a wet unit gets nothing.
{ const {e, P} = mk(2); e.setField('rain', 3); const T = put(e, P, 2, 'lt-wall', 0); const X = put(e, P, 1, 'lt-elec', 0); e.debugAttack(P, so, X.uid, {}, []); ok(T.hp === 49, `the Rain doesn't add to a physical hit (${T.hp})`); }

// ---- 2. Chain Lightning N
{ const {e, P} = mk(3); const L = put(e, P, 2, 'lt-wall', -1), C = put(e, P, 2, 'lt-wall', 0), R = put(e, P, 2, 'lt-wall', 1); const X = put(e, P, 1, 'lt-chain', 0);
  const ev = []; e.debugAttack(P, so, X.uid, {}, ev); const cl = ev.find(x=> x.type === 'chainLightning');
  ok(cl && cl.uids.length === 2 && cl.uids.includes(L.uid) && cl.uids.includes(R.uid) && cl.n === 2, 'Chain Lightning 2: from the target it jumps to both of its neighbours');
  ok(C.hp === 49 && L.hp === 48 && R.hp === 48, `the target takes the swing, each jump 2 (${L.hp}, ${C.hp}, ${R.hp})`);
  const hs = ev.filter(x=> x.type === 'hit' && x.chainLightning);
  ok(hs.length === 2 && hs.every(h=> h.dmgType === 'shock' && h.ranged) && hs[0].jump === 0 && hs[1].jump === 1, 'one shock hit per jump, numbered');
  ok(hs[0].viaUid === C.uid && hs[1].viaUid === C.uid, 'both jumps leave from the target (it is beside both)'); }
{ const {e, P} = mk(5); const ws = [0, 1, 2, 3].map(s=> put(e, P, 2, 'lt-wall', s)); const X = put(e, P, 1, 'lt-chain', 0);
  const ev = []; e.debugAttack(P, so, X.uid, {}, ev); const cl = ev.find(x=> x.type === 'chainLightning');
  ok(cl && cl.uids.join() === [ws[1].uid, ws[2].uid].join() && ws[3].hp === 50, `a row going one way: target -> next -> the one after; never more than 2 jumps (${ws.map(c=> c.hp)})`);
  const hs = ev.filter(x=> x.type === 'hit' && x.chainLightning); ok(hs[1] && hs[1].viaUid === ws[1].uid, 'the 2nd jump leaves from the 1st jumped unit'); }
{ const {e, P} = mk(5); const T = put(e, P, 2, 'lt-wall', 0); const X = put(e, P, 1, 'lt-chain', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev);
  const cl = ev.find(x=> x.type === 'chainLightning'); ok(cl && cl.uids.length === 0 && T.hp === 49 && !ev.some(x=> x.type === 'hit' && x.chainLightning), 'a lone target: nothing to jump to'); }
{ const {e, P} = mk(5); e.setField('rain', 3); const T = put(e, P, 2, 'lt-wall', 0), N = put(e, P, 2, 'lt-swim', 1); const X = put(e, P, 1, 'lt-chain1', 0); e.debugAttack(P, so, X.uid, {}, []);
  ok(N.hp === 46, `Chain Lightning (true = 2) on a Swimmer in the Rain: 2 + 2 (${N.hp})`); }
{ let seen = new Set(); for(let s = 1; s <= 12; s++){ const {e, P} = mk(s); const ws = [-2, -1, 0, 1, 2].map(x=> put(e, P, 2, 'lt-wall', x)); const X = put(e, P, 1, 'lt-chain', 0); const ev = []; e.debugAttack(P, so, X.uid, {}, ev);
    const cl = ev.find(x=> x.type === 'chainLightning'); if(cl){ ok(new Set(cl.uids).size === cl.uids.length && !cl.uids.includes(ws[2].uid), 'never the same unit twice, never back to the target'); seen.add(cl.uids.map(u=> ws.find(w=> w.uid === u).slot).join()); } }
  ok(seen.size > 1, `the jumps are a seeded pick (${[...seen].join(' | ')})`); }

// ---- 3. Shock Bolt and Lightning are lightning damage (the Wet rule reads them); Dragon Lightning's hits know their path
{ const {e, P} = mk(7); const w = put(e, P, 2, 'lt-swim', 0); put(e, P, 1, 'lt-sb', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const h = ev.find(x=> x.type === 'hit' && x.ranged); ok(h && h.dmgType === 'shock', 'Shock Bolt: its hit is shock damage');
  ok(h && h.dmg === 3 && w.shocked === 1, `Shock Bolt 2 on a Swimmer: 2 + 1 Wet (${h && h.dmg}), and Shocked`); }
{ const {e, P} = mk(7); const w = put(e, P, 2, 'lt-tide', 0); const ev = []; put(e, P, 1, 'lt-sky', 0, ev);
  const st = ev.find(x=> x.type === 'statusFx' && x.kind === 'lightning'), h = ev.find(x=> x.type === 'hit' && x.skyBolt);
  ok(st && st.targetUid === w.uid && st.targetSide === 'B', 'Lightning: the statusFx names the unit it strikes');
  ok(h && h.dmgType === 'shock' && h.dmg === 3 && w.hp === 47, `Lightning 2 on a Tide unit: shock, 2 + 1 Wet (${h && h.dmg})`); }
{ const {e, P} = mk(7); const ev = []; put(e, P, 1, 'lt-sky', 0, ev); const h = ev.find(x=> x.type === 'hitHQ' && x.skyBolt), g = ev.find(x=> x.type === 'grounded'); ok(h && h.dmg > 0 && !g && !(P[2].hq.shocked > 0), 'Lightning at the bramble lands, but the bramble is never Shocked (2026-10-18 owner 15:05: "No Shocked status on Brambles.")'); }
{ const {e, P} = mk(9); const T = put(e, P, 2, 'lt-wall', 0), N = put(e, P, 2, 'lt-wall', 1); const D = put(e, P, 1, 'lt-dl', 0); const ev = []; e.debugAttack(P, so, D.uid, {}, ev);
  const hs = ev.filter(x=> x.type === 'hit' && x.dragonLightning); ok(hs.length === 2 && hs[0].jump === 0 && hs[1].jump === 1 && hs[1].viaUid === T.uid && hs.every(h=> h.dmgType === 'magic'), 'Dragon Lightning: strike 0 on the target, strike 1 from the target to the unit beside it (still magic)'); }

// ---- 4. Voltaic Eel
{ const d = base['voltaic-eel']; ok(d && d.effects.chainLightning === 2 && !('electricity' in d.effects), 'Voltaic Eel: Chain Lightning 2, no Electricity');
  // 2026-10-21 (package TT2): BF5's two-skill cut kept Shock + Chain Lightning and dropped Tide and the on-spawn trigger (docs/balance/two-skills-2026-10-21.json)
  // 2026-10-21 (package TR, owner HB2-1): plain Tide doesn't count toward two skills, so the Eel has it back
  ok(d.effects.shock && d.effects.tide === true && d.rarity === 'rare', 'the rest of the Eel: Shock kept, Tide back (TR, HB2-1)'); }

// ---- 5. The text: no wet sentence on Electricity's line; Wet is a keyword with its gloss; the Codex carries the note
const src = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8');
const line = k=> (src.match(new RegExp(`\\n  \\{key:'${k}', [^\\n]*`)) || [''])[0];
ok(/label:'Electricity'/.test(line('electricity')) && !/wet/i.test(line('electricity').replace(/codexNote:'[^']*'/, '')), 'Electricity: the card line has no wet sentence');
ok(/codexNote:'A Wet unit takes 1 more lightning damage from it for every Wet counter it has\.'/.test(line('electricity')), 'Electricity: the Wet note is Codex-only (codexNote)');
ok(/label:'Chain Lightning'/.test(line('chainLightning')) && /codexNote:'A Wet unit/.test(line('chainLightning')), 'Chain Lightning: a skill (PASSIVE_DEFS) with the Codex Wet note');
ok(/\n  electricity: v=> `Its hits arc to a unit beside the target for \$\{numOr\(v, 1\)\} lightning damage\.`/.test(src), 'Electricity SKILL_TEXT: no "wet units take +1"');
ok(/\n  chainLightning: v=> `/.test(src) && /chainLightning:'🌩️'/.test(src) && /if\(e\.chainLightning\) out\.push/.test(src), 'Chain Lightning: card text, icon and chip');
ok(/\n  chainLightning: \{foes:FXL_FOES3/.test(src.slice(src.indexOf('const FXL_SKILL_SETUPS'))), 'Chain Lightning: an Effects library setup');
ok(/case 'chainLightning':/.test(src) && /ev\.type==='chainLightning'/.test(src), 'chainLightning: a log line and a look');
ok(/lightning damage/.test(line('shockBolt')) && /lightning damage/.test(line('lightning')), 'Shock Bolt and Lightning say lightning damage');
{ const kws = (src.match(/const STATUS_KEYWORDS = \[[\s\S]*?\n\];/) || [''])[0]; const wet = (kws.match(/\{k:'wet'[^\n]*/) || [''])[0];
  ok(/name:'Wet'/.test(wet) && /cs:true/.test(wet) && /text:TX\('ui\.st-wet'\), codex:TX\('ui\.stx-wet'\)/.test(wet) && /Wet counter/.test(TEXT_D['ui.st-wet']) && /Rain/.test(TEXT_D['ui.st-wet']) && /Swimmer or Tide unit/.test(TEXT_D['ui.stx-wet']) && /Tide is in/.test(TEXT_D['ui.stx-wet']), 'Wet: a status keyword whose gloss explains the counters (2026-10-18, package D: the water rule in the Codex)'); }
ok(/if\(p\.codexNote\) txt \+= ' ' \+ p\.codexNote;/.test(src), 'the Skills Codex adds the codexNote');

// ---- 6. The board: element emoji, and every lightning hit is its own bolt (nothing thrown)
{ const icon = {}; vm.runInNewContext((src.match(/const DMG_ICON = \{[^\n]*/) || [''])[0].replace('const DMG_ICON', 'DMG') + '\n' + (src.match(/Object\.assign\(DMG_ICON, \{[^\n]*/) || [''])[0].replace('DMG_ICON', 'DMG') + '\nout.v = DMG;', {out: icon});
  const D = icon.v || {}; ok(D.shock[0] === '⚡' && D.heat[0] === '🔥' && D.cold[0] === '❄️' && D.water[0] === '💧' && D.acid[0] === '🧪' && D.poison[0] === '☠️' && D.magic[0] === '🪄' && D.psychic[0] === '💭', 'DMG_ICON: every element has its emoji'); }
ok(/function dmgLogText\(dmg, dmgType\)/.test(src) && /hit \$\{nm\(ev\.targetDefId\)\} for \$\{dmgLogText\(ev\.dmg, ev\.dmgType\)\}/.test(src), 'the battle log names the element with its emoji ("for 3 ⚡ lightning damage")');
ok(/'👊' \+ di\[0\]/.test(src), 'an elemental crit keeps its emoji');
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
{ const els = {}; const el = u=> (els[u] = els[u] || {id:u, classList:{add(){}, remove(){}}});
  const ctx = {matchState:{pendingBolt:null, pendingStrike:null, pendingElectric:null}, boardCardEl: el, hqTileEl: s=> el('hq' + s), out:{}};
  vm.runInNewContext(fnSrc('electricChain') + '\n' + fnSrc('lightningBoltOf') + '\nout.f = lightningBoltOf;', ctx); const f = ctx.out.f;
  const ids = b=> b ? b.chain.map(x=> x.id).join('>') : null;
  const ec = f({type:'hit', ranged:true, electricity:true, arc:true, attUid:1, targetUid:3, viaUid:2, dmgType:'shock'});
  ok(ec && ids(ec) === '1>2>3' && ec.cls === 'sfx-bolt-electric' && ec.ms === 222, `Electricity: attacker > struck unit > arc, the cyan bolt, the number at 222 ms (${ids(ec)}, ${ec && ec.ms})`);
  ctx.matchState.pendingStrike = {kind:'chainLightning', attUid:1, n:2};
  const c0 = f({type:'hit', ranged:true, chainLightning:true, jump:0, attUid:1, targetUid:3, viaUid:2, dmgType:'shock'}), c1 = f({type:'hit', ranged:true, chainLightning:true, jump:1, attUid:1, targetUid:4, viaUid:3, dmgType:'shock'});
  ok(ids(c0) === '1>2>3' && c0.cls === '' && c0.more && ids(c1) === '3>4' && c1.ms === 70 && !c1.more, 'Chain Lightning: the plain bolt, jump 0 runs through the target, jump 1 from the last unit; the chain hands over');
  const d1 = f({type:'hit', ranged:true, dragonLightning:true, jump:1, attUid:1, targetUid:5, viaUid:2, dmgType:'magic'}); ok(ids(d1) === '2>5' && d1.cls === 'sfx-bolt-red', 'Dragon Lightning: its red jump from the target to the unit beside it');
  ok(f({type:'hit', ranged:true, skyBolt:true, attUid:1, targetUid:6, dmgType:'shock'}).sky, 'Lightning: a sky bolt onto the unit');
  ctx.matchState.pendingBolt = {uid:7, element:'shock'}; const sb = f({type:'hit', ranged:true, attUid:7, targetUid:8, dmgType:'shock'}); ok(ids(sb) === '7>8' && sb.ms === 70, 'Shock Bolt: a straight bolt, the number at 70 ms');
  ctx.matchState.pendingBolt = {uid:7, element:'fire'}; ok(f({type:'hit', ranged:true, attUid:7, targetUid:8, dmgType:'heat'}) === null, 'a Fire Bolt is not lightning (its glob flies)');
  ok(f({type:'hit', ranged:true, attUid:9, targetUid:8, dmgType:'shock'}).kind === 'shock', 'any other ranged shock hit is a bolt too');
  ok(f({type:'hit', attUid:9, targetUid:8, dmgType:'shock'}) === null, 'a melee swing is not'); }
ok(/const bolt = lightningBoltOf\(ev\);/.test(src) && /: bolt \? bolt\.ms :/.test(src) && /else if\(bolt\) drawLightningBolt\(ev\);/.test(src), 'the hit: its number pops as its bolt lands, and the bolt is drawn instead of a projectile');
ok(src.indexOf('else if(bolt) drawLightningBolt(ev);') < src.indexOf("else setTimeout(()=> spawnProjectile(boardCardEl(ev.attUid) || hqTileEl(ev.side), targetEl, dmgGlyph(ev.dmgType)), windup);"), 'the bolt branch comes before the generic projectile');
ok(/\{ const lb = lightningBoltOf\(ev\); if\(lb\) return lb\.ms; \}/.test(fnSrc('eighthHitAtMs')), 'eighthHitAtMs (and FX env.hitAtMs) reads the bolt');
ok(/ev\._bolt\) base = ev\._bolt\.more \? ev\._bolt\.ms \+ 30 : 640;/.test(fnSrc('delayForEvent')), 'delayForEvent: a lightning hit is quick; a chain hands over to its next jump');
ok(/try\{ lightningBoltOf\(ev\); \}catch\(e\)\{\}/.test(fnSrc('renderVfxForEvent').split('\n').slice(0, 5).join('\n')), 'renderVfxForEvent works the bolt out first');
ok(/if\(ev\.element === 'shock'\) return;/.test(fnSrc('ninthPassVfx')), 'a Shock Bolt lobs no glob');
ok(!/F\.lightning\(att, ts/.test(src), 'the Dragon Lightning event no longer flashes its own bolt ahead of the hits');
{ const fxa = fs.readFileSync(path.join(H.ROOT, 'bramblewood-fx-a.js'), 'utf8');
  ok(/else if\(ev\._bolt \|\| ev\.electricity \|\| ev\.chainLightning \|\| ev\.dragonLightning \|\| ev\.skyBolt \|\| ev\.dmgType === 'shock'\)\{ \/\* the bolt is drawn by the game \*\/ \}\n\s*else if\(!isBolt\)\{/.test(fxa), 'FX.A throws no missile for a lightning hit');
  ok(/k === 'lightning' && self && ev\.targetSide == null/.test(fxa), 'FX.A: Lightning no longer strikes the caster'); }
{ const sk = fs.readFileSync(path.join(H.ROOT, 'bramblewood-skillfx.js'), 'utf8'); ok(/'sfx sfx-bolt' \+ \(o\.cls \? ' ' \+ o\.cls : ''\)/.test(sk), 'SkillFX.lightning takes a colour class'); }
{ const tpl = fs.readFileSync(path.join(H.ROOT, 'arena_template.html'), 'utf8');
  // 10% toward cyan (#00ffff) from the plain bolt (core #f2f6ff, glow rgb(150,180,255))
  const mix = (c, t)=> Math.round(c*0.9 + t*0.1), core = [mix(0xf2, 0), mix(0xf6, 255), mix(0xff, 255)], glow = [mix(150, 0), mix(180, 255), mix(255, 255)];
  const hex = '#' + core.map(v=> v.toString(16).padStart(2, '0')).join('');
  ok(/\.sfx-bolt path\{fill:none; stroke:#f2f6ff;/.test(tpl) && /\.sfx-bolt path\.glow\{stroke:rgba\(150,180,255,\.65\)/.test(tpl), 'the plain (chain lightning) bolt is unchanged');
  ok(tpl.includes(`.sfx-bolt.sfx-bolt-electric path{stroke:${hex};}`) && tpl.includes(`.sfx-bolt.sfx-bolt-electric path.glow{stroke:rgba(${glow.join(',')},.65);}`), `Electricity's bolt is the plain one 10% toward cyan (${hex}, rgb ${glow})`); }
{ const lab = fs.readFileSync(path.join(H.ROOT, 'tools/effects-lab/manifest/x17.js'), 'utf8'); ok(["sk-chain-lightning", "sk-shock-bolt"].every(id=> lab.includes(`R({id:'${id}'`)), 'Effects Lab manifest: Chain Lightning and Shock Bolt entries'); }

console.log(fail ? `lightning-2026-10-17: ${fail} of ${n} failed` : `lightning-2026-10-17: all ${n} passed`);
process.exit(fail ? 1 : 0);
