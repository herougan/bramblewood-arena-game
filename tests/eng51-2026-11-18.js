#!/usr/bin/env node
// 2026-11-18 (package ENG51): two items.
// 1. A fight is a function of its seed, not of the page's timer phase: the raid's allies make their opening play before your Turn 1
//    (Auto-play used to take it under the VS screen, so e5det's raid game path gave two fights for one seed); the three fight ticks
//    (autoplayStep, fightWatchdog, playAnimWatchdog) now sleep outside a match (bwLoop, POLL1's helper). The browser proof is
//    tests/e5det-2026-11-16.js (the raid's game path, same seed twice); here: the guards in the source.
// 2. Water Bolt N (owner 11-17 17:32: "Archer Fish's Water Bolt is in Map 21+"): a bolt (Speed 2, one skill with the other bolts) of N water
//    damage; water damage's Soak leaves Wet counters and puts Burn out. Archerfish carries it instead of Acid Bolt.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e51-dummy': U('e51-dummy'), 'e51-wb1': U('e51-wb1', {waterBolt:1}), 'e51-wb2': U('e51-wb2', {waterBolt:2}),
  'e51-wbFused': U('e51-wbFused', {arrow:{v:2, type:'water', form:'bolt'}}), 'e51-arrow': U('e51-arrow', {arrow:2}),
  'e51-quick': U('e51-quick', {quick:true}, {attack:1}), 'e51-slow': U('e51-slow', {}, {attack:1}),
  'e51-shock': U('e51-shock', {shockBolt:1}), 'e51-fireBolt': U('e51-fireBolt', {fireBolt:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), {recordEvents:true, battleMode:'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).filter(x=> x.defId === id || (e.derivedDefs && e.derivedDefs[x.defId] && e.derivedDefs[x.defId].derivedFrom === id)).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P, r)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, r || 1); return ev; };
const boltOf = uid=> x=> x.type === 'bolt' && x.uid === uid;

// ================= 1. the fight does not wait on the page's timers =================
{ const app = rd('arena_app.js');
  ok(/bwLoop\(\(\)=>\{ try\{ autoplayStep\(\); \}catch\(e\)\{\} \}, 900, \(\)=> !!matchState\)/.test(app), 'autoplayStep runs on bwLoop, only while a match exists');
  ok(/bwLoop\(\(\)=>\{ try\{ fightWatchdog\(\); \}catch\(e\)\{\} \}, 1000, \(\)=> !!matchState\)/.test(app), 'fightWatchdog runs on bwLoop, only while a match exists');
  ok(/bwLoop\(\(\)=>\{ try\{ playAnimWatchdog\(\); \}catch\(e\)\{\} \}, 200, \(\)=> !!matchState\)/.test(app), 'playAnimWatchdog runs on bwLoop, only while a match exists');
  ok(!/setInterval\(\(\)=>\{ try\{ (autoplayStep|fightWatchdog|playAnimWatchdog)\(\)/.test(app), 'none of the three is a free-running setInterval any more');
  ok(/if\(allies\.length\) matchState\._alliesOpening = true;/.test(app), 'a raid with allies starts with their opening play due');
  ok(/m\.awaitingPass \|\| m\._alliesOpening\) return;/.test(app), 'Auto-play waits for the allies\' opening play');
  ok((app.match(/m\._committing \|\| m\._upkeep \|\| m\._alliesOpening\)\{ denyShake\(/g) || []).length === 2, 'a hand play and a pitch wait for it too');
  ok(/const m = matchState; if\(!m\) return;\n  if\(m\._alliesOpening\) try\{ raidAlliesTurn\(m, null, true\); \}catch\(e\)\{\}/.test(app), 'an End turn in that moment lets the allies open first');
  ok(/if\(m && first\)\{ if\(m\._alliesOpening === false\) return; m\._alliesOpening = false; \}/.test(app), 'the opening play happens once (the VS screen\'s timer after an End turn does nothing)');
  // the opening play's once-only rule, run on the app's own function (lib_bramble's grab) with a stub ally play
  try{ const B = require('../tools/lib_bramble.js'); const src = B.grab('raidAlliesTurn');
    let plays = 0; const f = new Function('raidTune', 'raidAllyPlays', src + '\nreturn raidAlliesTurn;')(()=> 1, ()=>{ plays++; });
    const m = {raidFull:true, over:false, round:1, raidAllies:[{}, {}], raidDef:{}, _alliesOpening:true};
    f(m, null, true); f(m, null, true); ok(plays === 1 && m._alliesOpening === false, `the opening play runs once (${plays})`);
    const t = {raidFull:true, over:false, round:1, raidAllies:[{}], raidDef:{}}; plays = 0; f(t, [], true); ok(plays === 1, 'the tools\' raid (no flag) still opens with the allies (tools/raid_full_sim.js)');
    m.round = 2; plays = 0; f(m, null); ok(plays === 1, 'each later round the allies play as before'); }
  catch(e){ ok(false, 'raidAlliesTurn could not be run: ' + e.message); }
}

// ================= 2. Water Bolt N =================
{ const {e, P} = mk(); const w = put(e, P, 1, 'e51-wb1', 0), t = put(e, P, 2, 'e51-dummy', 0);
  ok(e.shotSpeedOf(w, 'bolt') === 2, 'Water Bolt is a Speed 2 shot, as the other bolts');
  const ev = fight(e, P, 1), b = ev.find(boltOf(w.uid));
  ok(b && b.element === 'water' && b.key === 'waterBolt' && b.targetUid === t.uid && b.amount === 1, 'a bolt event, element water, key waterBolt, at the unit facing it');
  const h = ev.find(x=> x.type === 'hit' && x.attUid === w.uid && x.targetUid === t.uid);
  ok(h && h.dmgType === 'water' && h.dmg === 1 && t.hp === 499, `Water Bolt 1: 1 water damage (${h && h.dmgType} ${h && h.dmg}, hp ${t.hp})`);
  ok(t.water === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'en20Soak' && x.targetUid === t.uid), 'its rider: water damage soaks the target (1 water counter, the Soak event)'); }
{ const {e, P} = mk(); const w = put(e, P, 1, 'e51-wb2', 0), t = put(e, P, 2, 'e51-dummy', 0); t.burn = 2;
  // 2026-11-27 (SKILLS3-B, SKILLS3-7 a): Wet is yes / no (no counters, no cap, no drain)
  fight(e, P, 1); ok(t.water === 1 && !(t.burn > 0), `Water Bolt 2: Wet, Burn put out (water ${t.water}, burn ${t.burn})`);
  fight(e, P, 2); ok(t.water === 1, `still just Wet (${t.water})`); }
{ const {e, P} = mk(); const w = put(e, P, 1, 'e51-wb1', 0); const ev = fight(e, P, 1);
  ok(ev.some(boltOf(w.uid)) && ev.some(x=> x.type === 'hitHQ' && x.attUid === w.uid), 'with no enemy unit it spits at the bramble'); }
{ const {e, P} = mk(); const w = put(e, P, 1, 'e51-wb1', 0), s = put(e, P, 1, 'e51-shock', 1), t = put(e, P, 2, 'e51-dummy', 0), t2 = put(e, P, 2, 'e51-dummy', 1);
  const ev = fight(e, P, 1), sh = ev.filter(x=> x.type === 'hit' && x.attUid === s.uid && x.targetUid === t2.uid);
  ok(sh.length === 1, 'the Shock Bolt beside it fires'); }
{ // the fused form (canonical/skill-params.json kindSets) reads as waterBolt
  const {e, P} = mk(); const w = put(e, P, 1, 'e51-wbFused', 0), t = put(e, P, 2, 'e51-dummy', 0); const ev = fight(e, P, 1), b = ev.find(boltOf(w.uid));
  ok(b && b.key === 'waterBolt' && b.amount === 2 && t.water === 1 /* SKILLS3-7: Wet yes / no */, `"arrow": {"v": 2, "type": "water", "form": "bolt"} is Water Bolt 2 (${b && b.key} ${b && b.amount})`); }
{ // proves it does something: the same fight without it leaves the dummy whole and dry
  const run = id=>{ const {e, P} = mk(5); put(e, P, 1, id, 0); const t = put(e, P, 2, 'e51-dummy', 0); for(let r = 1; r <= 3; r++) fight(e, P, r); return {hp: t.hp, water: t.water || 0}; };
  const a = run('e51-wb1'), z = run('e51-dummy'); ok(a.hp < z.hp && a.water > 0 && z.water === 0, `3 rounds: ${JSON.stringify(a)} vs none ${JSON.stringify(z)}`); }
{ // seeded: the same fight twice is the same
  const run = ()=>{ const {e, P} = mk(77); put(e, P, 1, 'archerfish', 0); put(e, P, 2, 'e51-quick', 0); let s = ''; for(let r = 1; r <= 4; r++) s += JSON.stringify(fight(e, P, r).map(x=> x.type + (x.dmg || '') + (x.element || ''))); return s; };
  ok(run() === run(), 'seeded: the Archerfish fight twice gives one log'); }

// ================= 3. Archerfish, data, price =================
{ const cards = J('canonical/cards.json'), af = cards.find(c=> c.id === 'archerfish');
  ok(af && JSON.stringify(af.effects) === JSON.stringify({arrow:{v:1, type:'water', form:'bolt'}}), 'Archerfish carries Water Bolt 1 (the fused form), not Acid Bolt');
  const {e, P} = mk(); const a = put(e, P, 1, 'archerfish', 0), t = put(e, P, 2, 'e51-dummy', 0); a.wait = 0; const ev = fight(e, P, 1), b = ev.find(boltOf(a.uid)); // (it comes in with Wait 1)
  ok(b && b.element === 'water' && t.water === 1, 'the real Archerfish spits water in a fight');
  const K = require('../tools/skill_costs.js').make(J('canonical/skill-costs.json')), r = K.budget(af);
  ok(r.ok && !r.wellUnder, `Archerfish is within budget (S ${r.S}, x1 ${r.x1} of N ${r.N})`);
  const S = n=> K.budget({id:'x', attack:1, health:3, effects:{waterBolt:n}, rarity:'common', level:1}).S, A = n=> K.budget({id:'x', attack:1, health:3, effects:{arrow:n}, rarity:'common', level:1}).S;
  ok(Math.abs(S(1) - (A(1) + 0.5)) < 0.02 && Math.abs(S(2) - (A(2) + 0.5)) < 0.02, `priced as Arrow N's shot + 0.5 for the Soak (Water Bolt 1 ${S(1)}, 2 ${S(2)}; Arrow ${A(1)}, ${A(2)})`);
  const row = J('canonical/skill-costs.json').skills.find(x=> x.id === 'waterBolt');
  ok(row && row.kindOf === 'arrow.type=water,form=bolt' && row.plus === 'arrow' && /4-round rule/.test(row.note), 'its price row names the 4-round rule');
  const BB = require('../bramblewood-budget.js');
  ok(BB.BOLT_FAMILY.includes('waterBolt'), 'Water Bolt is in the bolt family (counts as one skill with the other bolts)');
  ok(J('canonical/skill-delivery.json').delivery.waterBolt === 'ranged', 'delivery: ranged');
  ok(J('canonical/skill-params.json').families.arrow.kindSets.some(k=> k.key === 'waterBolt' && k.match.type === 'water' && k.match.form === 'bolt'), 'skill-params: type water + form bolt = waterBolt');
  ok(J('canonical/skill-counters.json').counters.waterBolt, 'the counter table answers it'); }

// ================= 4. app, texts, effect, docs =================
{ const app = rd('arena_app.js'), eng = rd('bramblewood-engine.js');
  ok(/waterBolt:  \{element:'water',  dmgType:'water'\}/.test(eng) && /BOLT_SHOT_KEYS = Object\.keys\(BOLT_ELEMENTS\)/.test(eng), 'engine: BOLT_ELEMENTS row (so BOLT_SHOT_KEYS has it)');
  ok(/\{key:'waterBolt', category:'evergreen', label:TX\('ui\.skn-water-bolt'\)/.test(app) && /SKILL_ICON, \{waterBolt:'💧'\}/.test(app), 'registry: PASSIVE_DEFS and its icon');
  ok(/water:'a water bolt 💧'/.test(app), 'the battle log names it');
  const TX = require('../bramblewood-texts.js'); const T = TX.TEXT || TX;
  const KEYS = ['ui.skn-water-bolt', 'ui.sk-water-bolt', 'ui.sk-water-bolt-codex'];
  ok(KEYS.every(k=> T[k]), 'TX keys exist');
  ok(T['ui.sk-water-bolt'].split(/\s+/).length <= 20, 'the card line is under 20 words');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(l=>{ const p = J('lang/' + l + '.json'); ok(KEYS.every(k=> p[T[k]]), `${l}: the three texts are translated`); });
  const fx = rd('bramblewood-fx-h.js');
  ok(/water:\{parts:\['tl', 'co'\], cue:'splash'/.test(fx) && /  water\(x, y, ux, uy, to\)\{/.test(fx) && /\.fxh-pj\.water > \.co\{/.test(fx), 'the blue bolt (FX.H.boltShot water) and its splash, cued with SoundKit.splash');
  ok(/water: +\{core:'#ffffff', mid:'#7cc8ff'/.test(rd('bramblewood-skillfx.js')), 'the reduced-motion glob in blue');
  ok(/id:'atk-bolt-water'/.test(rd('tools/effects-lab/manifest/h.js')) && J('docs/effects-inventory-2026-10-15.json').some(x=> x.id === 'atk-bolt-water'), 'Effects Lab entry and its inventory row');
  ok(/package ENG51/.test(rd('docs/effects-catalogue.md')), 'the effects catalogue');
  ok(/^## 2026-11-18 \(package ENG51\)/m.test(rd('docs/CHANGELOG.md')) /* 2026-11-19 (TESTFIX6): its own heading, wherever later entries put it */ && /eng51-2026-11-18/.test(rd('tests/run-all.sh')), 'CHANGELOG entry and run-all.sh'); }

console.log(fail ? `eng51: ${fail} of ${fail + pass} checks FAILED` : `eng51: ${pass} checks passed`);
process.exit(fail ? 1 : 0);
