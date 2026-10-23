#!/usr/bin/env node
// 2026-10-18 (package X3, owner 15:05: "For shields, lower the amount of shields in all skirmishes. About Shield = Map. For Elites,
// Map * 1.5, up to 3x for bosses. HP of brambles in Tutorial and Map 0 Skirmishes should be unnaturally low"): checks that
//   1. an enemy bramble's Shield follows the rule (skirmish = map number, elite / champion / dungeon = round(map x 1.5),
//      mini-boss / sub-boss = map x 2, boss / campaign / world / raid boss = map x 3), on every node, whatever its old hqHp;
//   2. node.shieldOverride (number or layers) wins, the old node.armour / node.armourLayers no longer do;
//   3. Health is the bramble's own and hqHp can only lower it; Map 0's road fights the Lv 0 base bramble at 10-20 Health;
//      the tutorial's rival keeps the tutorial config's 6 (then 8) Health;
//   4. the Shield is what the VS screen / node tooltip / panel / editor read (all through skirmishCastle), and a fight's build
//      (applySkirmishSetup, the dungeon's last castle) uses it.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('missing ' + name); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i + 1, j + 1); };
const constLine = name=>{ const m = src.match(new RegExp(`^const ${name} = [^\\n]*$`, 'm')); if(!m) throw new Error('missing const ' + name); return m[0]; };

const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
const CHARACTER_DEFS = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'characters.json'), 'utf8')).forEach(c=> CHARACTER_DEFS[c.id] = c);
const TUT = src.match(/^const TUTORIAL_CFG_DEFAULT = \{\.\.\.STARTER_CFG_DEFAULT, myHp:(\d+), rivalHp:(\d+),/m), TUT_MAX = src.match(/^const TUTORIAL_MY_HP_MAX = (\d+);/m);

const H = new Function('CONQUEST_MAPS', 'CHARACTER_DEFS', [
  constLine('KIND_BASE'), fn('baseKind'), fn('mainConquestMaps'), fn('mapNumberOf'), constLine('MAP_CASTLE'), constLine('KIND_CASTLE_LEVEL'),
  constLine('NODE_MAP_HINT'), fn('mapOfNode'), constLine('TUT_SIDE_GATE'), fn('nodeCastleId'), fn('nodeCastleLevel'), constLine('SHIELD_RULE_MULT'), fn('nodeMapNumber'),
  constLine('ENDLESS_FLOOR_CURVE'), constLine('SIDE_MAP_AHEAD'), fn('sideMapAhead'), fn('fightMapNumber'), /* 2026-10-19 (BF): a side map counts a map ahead */ fn('shieldMapOf'), /* 2026-10-19 (LV): an endless floor counts half a map a floor further on */ fn('shieldRuleMult'), fn('ruleShieldOf'), fn('shieldOverrideOf'), constLine('BASE_BRAMBLE_HP'), fn('baseBrambleHp'), fn('castleLeveled'),
  constLine('ARMOUR_LAYER_MAX'), fn('armourLayersOf'), constLine('BRAMBLE_SCALE'), fn('brambleHp'), fn('brambleChar'), /* BF5 */ fn('skirmishCastle'), constLine('DUNGEON_DEFAULTS'), fn('dungeonConfig'), fn('dungeonWaves'),
  'const _t = s=> s;', fn('castleLineText'),
].join('\n') + '\nreturn {mapNumberOf, nodeMapNumber, ruleShieldOf, skirmishCastle, baseBrambleHp, nodeCastleLevel, dungeonWaves, castleLineText, NODE_MAP_HINT, SHIELD_RULE_MULT};')(CONQUEST_MAPS, CHARACTER_DEFS);

const MULT = {skirmish:1, elite:1.5, champion:1.5, dungeon:1.5, miniboss:2, subboss:2, boss:3, finalboss:3, worldboss:3, raidboss:3, megaraid:3, tutorial:0};
ok(JSON.stringify(H.SHIELD_RULE_MULT) === JSON.stringify(MULT), 'the multipliers per kind');

// --- 1. every node follows the rule; the come-back-later fights on Map 0's side maps count as the map that opens them
// (coordinator 2026-10-18): T-2 / T-3 / T-4 as Maps 1 / 8 / 18 (TUT_SIDE_GATE), the Old Bramble as Map 17 (shieldMap)
const EFFECTIVE = {'T-2':1, 'T-3':8, 'T-4':18, '0-B-1':17, '0-B-2':17, '0-B-3':17, '0-B-4':17};
let n = 0, nOverride = 0; const seen = {};
// 2026-10-19 (BF5, owner 21:36: "HALF everything"): a fight's bramble and its Shield are built at BRAMBLE_SCALE 0.5 (the stored numbers stay)
const BS = v=> v > 0 ? Math.max(1, Math.round(v * 0.5)) : v;
for(const m of CONQUEST_MAPS){ const no = H.mapNumberOf(m.id); for(const node of m.nodes || []){
  const eff = EFFECTIVE[node.key] != null ? EFFECTIVE[node.key] : (m.shieldMap != null ? m.shieldMap : (no || 0)), /* + a map's own shieldMap (Lilypad Reach counts as Map 6, 2026-10-18) */ k = node.kind || 'skirmish', parNo = m.sub && !m.tower ? H.mapNumberOf(m.parent) : null,
    /* 2026-10-19 (BF): a side map counts at least a map past its parent (fightMapNumber, aheadMaps or 1) */ effF = parNo != null ? Math.max(eff, parNo + Math.max(1, m.aheadMaps != null && Number.isFinite(+m.aheadMaps) ? Math.round(+m.aheadMaps) : 1)) : eff,
    want = BS(Math.round((effF + (m.endless && !m.tower && node.floor > 1 ? (node.floor - 1) * 0.5 : 0)) * MULT[k])) /* 2026-10-19 (LV): + half a map a floor; BF5: halved */, sc = H.skirmishCastle(node); n++;
  ok(H.nodeMapNumber(node) === eff, `${node.key}: the rule counts Map ${H.nodeMapNumber(node)} (want ${eff})`);
  // 2026-10-18 (skirmish pass SKB): a fight the pass tuned carries its own shieldOverride; the rule still stands under it
  const ovr = node.shieldOverride != null ? (()=>{ let t = 0; for(const b of [].concat(node.shieldOverride).slice(0, 4)){ const v = Math.max(0, Math.round(+b || 0)); if(!(v > 0)) break; t += BS(v); } return t; })() : null; // BF5: each layer halved
  if(ovr != null){ nOverride++; ok(sc.shield === ovr && sc.rule === want && sc.overridden, `${m.id} ${node.key} (${k}, Map ${no}): override Shield ${sc.shield} (want ${ovr}; rule ${sc.rule}, want ${want})`); }
  else ok(sc.shield === want && sc.rule === want, `${m.id} ${node.key} (${k}, Map ${no}): Shield ${sc.shield} (want ${want})`);
  ok(sc.hp > 0 && sc.total === sc.hp + sc.shield, `${node.key}: Health ${sc.hp} + Shield ${sc.shield} = ${sc.total}`);
  if(!seen[k]) seen[k] = `${node.key}=${sc.shield}`; } }
ok(n > 400, `${n} nodes checked`);
const byKey = (mapId, key)=> CONQUEST_MAPS.find(m=> m.id === mapId).nodes.find(x=> x.key === key);
const sh = (mapId, key)=> H.skirmishCastle(byKey(mapId, key)).rule; // the rule's value (a node the skirmish pass tuned shows its override, checked above)
ok(sh('m1', '0-2') === 0 && sh('m1', '0-4') === 0, 'Map 0: no Shield (skirmish, boss)');
ok(sh('m21', '21-1') === BS(21) && sh('m21', '21-4') === BS(32) && sh('m21', '21-6') === BS(63), 'Map 21: skirmish 21, elite round(31.5) = 32, boss 63 (halved: 11, 16, 32)');
ok(sh('mc', '3-1') === BS(3) && sh('mc', '3-5') === BS(5) && sh('mc', '3-7') === BS(9), 'Map 3: skirmish 3, elite round(4.5) = 5, boss 9 (halved: 2, 3, 5)');
// 2026-10-19 (BF): a side map counts a map past its parent, so Murgle Mayhem (off Map 6) is Map 7 and its floor 10 Map 11.5
ok(sh('mm', '6-MM-10') === BS(23), 'a mini-boss on a Map 6 endless floor 10: 23 (BF: the side map counts as Map 7, the floor as Map 11.5; LV 21, was 12)');
ok(sh('me', '20-A-4') === BS(32) && sh('mx', '20-B-4') === BS(63) && sh('m11', '20-10') === BS(60) && sh('m11', '20-R') === BS(60), 'Map 20: dungeon 32 and world boss 63 (BF: its side maps count as Map 21), campaign boss 60, raid 60');
{ const tot = (m, k)=> H.skirmishCastle(byKey(m, k)).total, shv = (m, k)=> H.skirmishCastle(byKey(m, k)).rule;
  ok(shv('mtut', 'T-2') === BS(1) && shv('mtut', 'T-3') === BS(8) && shv('mtut', 'T-4') === BS(27), `T-2 / T-3 / T-4 Shield ${shv('mtut', 'T-2')} / ${shv('mtut', 'T-3')} / ${shv('mtut', 'T-4')}`);
  ok(shv('mo', '0-B-1') === BS(17) && shv('mo', '0-B-4') === BS(51), `the Old Bramble: skirmish 17, boss 51 (halved: 9, 26)`);
  console.log(`  come-back-later totals: T-2 ${tot('mtut', 'T-2')}, T-3 ${tot('mtut', 'T-3')}, T-4 ${tot('mtut', 'T-4')}, 0-B-1 ${tot('mo', '0-B-1')}, 0-B-2 ${tot('mo', '0-B-2')}, 0-B-3 ${tot('mo', '0-B-3')}, 0-B-4 ${tot('mo', '0-B-4')}`); }
// 2026-10-19 (package CB): the card pass's curve retune gave 21-1 a Shield of its own (shieldOverride 63), so the canary reads the fight
// without it: its old hqHp 180 still must not turn into Shield
{ const old = byKey('m21', '21-1'), bare = Object.assign({}, old); delete bare.shieldOverride; ok(old.hqHp === 180 && H.skirmishCastle(bare).total < 60, `an old hqHp no longer turns into Shield (21-1: hqHp ${old.hqHp} -> ${H.skirmishCastle(bare).total})`); }

// --- 2. overrides
{ const base = Object.assign({}, byKey('mc', '3-2')); delete base.shieldOverride; // 2026-10-19 (TH): 3-2 has its own override now; the probes start from the rule
  const t = Object.assign({}, base, {shieldOverride: 7}); H.NODE_MAP_HINT.set(t, 'mc');
  ok(H.skirmishCastle(t).shield === BS(7) && H.skirmishCastle(t).overridden, 'shieldOverride 7 wins over the rule (3) (both halved in the fight)');
  const L = Object.assign({}, base, {shieldOverride: [5, 4, 0, 2]}); H.NODE_MAP_HINT.set(L, 'mc');
  ok(JSON.stringify(H.skirmishCastle(L).layers) === JSON.stringify([BS(5), BS(4)]) && H.skirmishCastle(L).shield === BS(5) + BS(4), 'override layers stop at the first 0 (each halved)');
  const z = Object.assign({}, base, {shieldOverride: 0}); H.NODE_MAP_HINT.set(z, 'mc');
  ok(H.skirmishCastle(z).shield === 0 && H.skirmishCastle(z).overridden, 'an override of 0 means no Shield');
  const legacy = Object.assign({}, base, {armour: 140, armourLayers: [100, 40]}); H.NODE_MAP_HINT.set(legacy, 'mc');
  ok(H.skirmishCastle(legacy).shield === BS(3) && !H.skirmishCastle(legacy).overridden, 'old armour / armourLayers are ignored (the rule stands)'); }

// --- 3. Health; the base bramble on Map 0's road; the tutorial
{ const m1 = CONQUEST_MAPS.find(m=> m.id === 'm1');
  const hp = m1.nodes.map(x=> [x.key, H.skirmishCastle(x).hp]);
  // 2026-10-19 (BF4): 0-4's hqHp is the owner's 25 (the live node edit of 10-18, folded in; was 52), so its base bramble is 15 (was 20)
  ok(JSON.stringify(hp) === JSON.stringify([['0-1', BS(10)], ['0-2', BS(12)], ['0-3', BS(24)], ['0-4', BS(10)]]), `Map 0's road: ${JSON.stringify(hp)} (BF5: 10 / 12 / 14 / 15 halved; 2026-10-23, EB: 0-3 24, 0-4's hqHp 10)`);
  m1.nodes.forEach(x=> ok(H.nodeCastleLevel(x) === 0, `${x.key}: the base bramble is Lv 0`));
  ok(H.skirmishCastle(byKey('m1', '0-4')).character.id === 'plains-terrace', 'the Map 0 boss keeps its own bramble (and passive)');
  const tut = CONQUEST_MAPS.find(m=> m.id === 'mtut'), old = CONQUEST_MAPS.find(m=> m.id === 'mo');
  [...tut.nodes, ...old.nodes].forEach(x=> ok(H.baseBrambleHp(x) == null, `${x.key}: the side maps' come-back-later fights keep their bramble's Health`));
  ok(TUT && +TUT[2] <= 8 && +TUT[1] === 8 && TUT_MAX && +TUT_MAX[1] === 8, `the tutorial's rival bramble starts at ${TUT && TUT[2]} Health (+2 in part 2); yours at ${TUT && TUT[1]} (owner 15:37: "D. Tutorial only")`);
  ok(/health: brambleHp\(Math\.min\(TUTORIAL_MY_HP_MAX, cfg\.myHp \|\| TUTORIAL_MY_HP_MAX\)\)/.test(fn('startTutorialMatch')) /* BF5: then halved */, 'your tutorial bramble is capped at TUTORIAL_MY_HP_MAX even if a saved config says more');
  ok(!/TUTORIAL_MY_HP_MAX/.test(fn('startConquestMatch')), 'Map 0 skirmishes keep your own bramble');
  ok(/cfg\.rivalHp \? \{health: \(cfg\.rivalHp \+ \(st >= 2 \? 2 : 0\)\)\}/.test(fn('startTutorialMatch')), 'the tutorial fight still takes the rival Health from the tutorial config'); }
{ const t = Object.assign({}, byKey('mc', '3-1'), {hqHp: 9}); H.NODE_MAP_HINT.set(t, 'mc');
  ok(H.skirmishCastle(t).hp === BS(9), 'a hqHp below the bramble\'s Health lowers it (halved in the fight)');
  const u = Object.assign({}, byKey('mc', '3-1'), {hqHp: 900}); H.NODE_MAP_HINT.set(u, 'mc');
  ok(H.skirmishCastle(u).hp === BS(30), 'a hqHp above it does not raise it (Tidewall-less Map 3: the plain 30 HP castle)'); }

// --- 4. where it is shown and used
ok(/players\[2\]\.hq\.shield = sc\.shield; players\[2\]\.hq\.maxShield = sc\.shield; players\[2\]\.hq\.shieldLayers = sc\.layers;/.test(fn('applySkirmishSetup')), 'the fight build puts the Shield on the enemy bramble');
{ const d = byKey('me', '20-A-4'), w = H.dungeonWaves(d); ok(w[w.length - 1].shield === BS(36) && w[0].shield === Math.round(BS(36) * 0.25), /* BF: Map 21's 32; BF5: halved; LEAD (2026-10-23): 36 with its new leader */ `the dungeon's castles: first ${w[0].shield}, last ${w[w.length - 1].shield}`); }
ok(H.castleLineText(byKey('mc', '3-7')) === `🏰 ${H.skirmishCastle(byKey('mc', '3-7')).hp} HP · 🔷 ${H.skirmishCastle(byKey('mc', '3-7')).shield} Armour`, 'the VS / tooltip line shows the fight\'s Shield (the rule, or the skirmish pass\'s override)');
ok(/castleLineText\(node\)/.test(fn('showVersusOpener')), 'the VS screen reads castleLineText');
// 2026-10-21 (package TT): since package UX (2026-10-19) the tutorial node's tooltip reads its summary node (tutorialSummaryNode)
ok(/castleLineText\(node\.kind === 'tutorial' \? tutorialSummaryNode\(node\) : node\)/.test(src.slice(src.indexOf('ctt-kind') - 200, src.indexOf('ctt-kind') + 200)), 'the node tooltip reads castleLineText');
ok(/scD = skirmishCastle\(draft\), L = scD\.layers/.test(src) && /Rule: Map \$\{nodeMapNumber\(draft\)\}/.test(src), 'the skirmish editor shows the rule and its value');
ok(/draft\.shieldOverride = ls\.length > 1 \? ls : \(ls\[0\] \|\| 0\)/.test(src) && !/draft\.armour = ls\.reduce/.test(src), 'the editor saves a changed Shield as shieldOverride, not armour');

console.log(`shields-2026-10-18: ${checks - fail}/${checks} checks passed, ${nOverride} fights with a shieldOverride  (first per kind: ${Object.entries(seen).map(([k, v])=> k + ' ' + v).join(', ')})`);
process.exit(fail ? 1 : 0);
