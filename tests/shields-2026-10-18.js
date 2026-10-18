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
  fn('shieldRuleMult'), fn('ruleShieldOf'), fn('shieldOverrideOf'), constLine('BASE_BRAMBLE_HP'), fn('baseBrambleHp'), fn('castleLeveled'),
  constLine('ARMOUR_LAYER_MAX'), fn('armourLayersOf'), fn('skirmishCastle'), constLine('DUNGEON_DEFAULTS'), fn('dungeonConfig'), fn('dungeonWaves'),
  'const _t = s=> s;', fn('castleLineText'),
].join('\n') + '\nreturn {mapNumberOf, nodeMapNumber, ruleShieldOf, skirmishCastle, baseBrambleHp, nodeCastleLevel, dungeonWaves, castleLineText, NODE_MAP_HINT, SHIELD_RULE_MULT};')(CONQUEST_MAPS, CHARACTER_DEFS);

const MULT = {skirmish:1, elite:1.5, champion:1.5, dungeon:1.5, miniboss:2, subboss:2, boss:3, finalboss:3, worldboss:3, raidboss:3, megaraid:3, tutorial:0};
ok(JSON.stringify(H.SHIELD_RULE_MULT) === JSON.stringify(MULT), 'the multipliers per kind');

// --- 1. every node follows the rule; the come-back-later fights on Map 0's side maps count as the map that opens them
// (coordinator 2026-10-18): T-2 / T-3 / T-4 as Maps 1 / 8 / 18 (TUT_SIDE_GATE), the Old Bramble as Map 17 (shieldMap)
const EFFECTIVE = {'T-2':1, 'T-3':8, 'T-4':18, '0-B-1':17, '0-B-2':17, '0-B-3':17, '0-B-4':17};
let n = 0, nOverride = 0; const seen = {};
for(const m of CONQUEST_MAPS){ const no = H.mapNumberOf(m.id); for(const node of m.nodes || []){
  const eff = EFFECTIVE[node.key] != null ? EFFECTIVE[node.key] : (m.shieldMap != null ? m.shieldMap : (no || 0)), /* + a map's own shieldMap (Lilypad Reach counts as Map 6, 2026-10-18) */ k = node.kind || 'skirmish', want = Math.round(eff * MULT[k]), sc = H.skirmishCastle(node); n++;
  ok(H.nodeMapNumber(node) === eff, `${node.key}: the rule counts Map ${H.nodeMapNumber(node)} (want ${eff})`);
  // 2026-10-18 (skirmish pass SKB): a fight the pass tuned carries its own shieldOverride; the rule still stands under it
  const ovr = node.shieldOverride != null ? [].concat(node.shieldOverride).reduce((a, b)=> a + Math.max(0, Math.round(+b || 0)), 0) : null;
  if(ovr != null){ nOverride++; ok(sc.shield === ovr && sc.rule === want && sc.overridden, `${m.id} ${node.key} (${k}, Map ${no}): override Shield ${sc.shield} (want ${ovr}; rule ${sc.rule}, want ${want})`); }
  else ok(sc.shield === want && sc.rule === want, `${m.id} ${node.key} (${k}, Map ${no}): Shield ${sc.shield} (want ${want})`);
  ok(sc.hp > 0 && sc.total === sc.hp + sc.shield, `${node.key}: Health ${sc.hp} + Shield ${sc.shield} = ${sc.total}`);
  if(!seen[k]) seen[k] = `${node.key}=${sc.shield}`; } }
ok(n > 400, `${n} nodes checked`);
const byKey = (mapId, key)=> CONQUEST_MAPS.find(m=> m.id === mapId).nodes.find(x=> x.key === key);
const sh = (mapId, key)=> H.skirmishCastle(byKey(mapId, key)).rule; // the rule's value (a node the skirmish pass tuned shows its override, checked above)
ok(sh('m1', '0-2') === 0 && sh('m1', '0-4') === 0, 'Map 0: no Shield (skirmish, boss)');
ok(sh('m21', '21-1') === 21 && sh('m21', '21-4') === 32 && sh('m21', '21-6') === 63, 'Map 21: skirmish 21, elite round(31.5) = 32, boss 63');
ok(sh('mc', '3-1') === 3 && sh('mc', '3-5') === 5 && sh('mc', '3-7') === 9, 'Map 3: skirmish 3, elite round(4.5) = 5, boss 9');
ok(sh('mm', '6-MM-10') === 12, 'a mini-boss on a Map 6 side map: 12');
ok(sh('me', '20-A-4') === 30 && sh('mx', '20-B-4') === 60 && sh('m11', '20-10') === 60 && sh('m11', '20-R') === 60, 'Map 20: dungeon 30, world boss 60, campaign boss 60, raid 60');
{ const tot = (m, k)=> H.skirmishCastle(byKey(m, k)).total, shv = (m, k)=> H.skirmishCastle(byKey(m, k)).rule;
  ok(shv('mtut', 'T-2') === 1 && shv('mtut', 'T-3') === 8 && shv('mtut', 'T-4') === 27, `T-2 / T-3 / T-4 Shield ${shv('mtut', 'T-2')} / ${shv('mtut', 'T-3')} / ${shv('mtut', 'T-4')}`);
  ok(shv('mo', '0-B-1') === 17 && shv('mo', '0-B-4') === 51, `the Old Bramble: skirmish 17, boss 51`);
  console.log(`  come-back-later totals: T-2 ${tot('mtut', 'T-2')}, T-3 ${tot('mtut', 'T-3')}, T-4 ${tot('mtut', 'T-4')}, 0-B-1 ${tot('mo', '0-B-1')}, 0-B-2 ${tot('mo', '0-B-2')}, 0-B-3 ${tot('mo', '0-B-3')}, 0-B-4 ${tot('mo', '0-B-4')}`); }
{ const old = byKey('m21', '21-1'); ok(old.hqHp === 180 && H.skirmishCastle(old).total < 60, `an old hqHp no longer turns into Shield (21-1: hqHp ${old.hqHp} -> ${H.skirmishCastle(old).total})`); }

// --- 2. overrides
{ const base = Object.assign({}, byKey('mc', '3-2')); delete base.shieldOverride; // 2026-10-19 (TH): 3-2 has its own override now; the probes start from the rule
  const t = Object.assign({}, base, {shieldOverride: 7}); H.NODE_MAP_HINT.set(t, 'mc');
  ok(H.skirmishCastle(t).shield === 7 && H.skirmishCastle(t).overridden, 'shieldOverride 7 wins over the rule (3)');
  const L = Object.assign({}, base, {shieldOverride: [5, 4, 0, 2]}); H.NODE_MAP_HINT.set(L, 'mc');
  ok(JSON.stringify(H.skirmishCastle(L).layers) === '[5,4]' && H.skirmishCastle(L).shield === 9, 'override layers stop at the first 0');
  const z = Object.assign({}, base, {shieldOverride: 0}); H.NODE_MAP_HINT.set(z, 'mc');
  ok(H.skirmishCastle(z).shield === 0 && H.skirmishCastle(z).overridden, 'an override of 0 means no Shield');
  const legacy = Object.assign({}, base, {armour: 140, armourLayers: [100, 40]}); H.NODE_MAP_HINT.set(legacy, 'mc');
  ok(H.skirmishCastle(legacy).shield === 3 && !H.skirmishCastle(legacy).overridden, 'old armour / armourLayers are ignored (the rule stands)'); }

// --- 3. Health; the base bramble on Map 0's road; the tutorial
{ const m1 = CONQUEST_MAPS.find(m=> m.id === 'm1');
  const hp = m1.nodes.map(x=> [x.key, H.skirmishCastle(x).hp]);
  ok(JSON.stringify(hp) === JSON.stringify([['0-1', 10], ['0-2', 12], ['0-3', 14], ['0-4', 20]]), `Map 0's road: ${JSON.stringify(hp)}`);
  m1.nodes.forEach(x=> ok(H.nodeCastleLevel(x) === 0, `${x.key}: the base bramble is Lv 0`));
  ok(H.skirmishCastle(byKey('m1', '0-4')).character.id === 'plains-terrace', 'the Map 0 boss keeps its own bramble (and passive)');
  const tut = CONQUEST_MAPS.find(m=> m.id === 'mtut'), old = CONQUEST_MAPS.find(m=> m.id === 'mo');
  [...tut.nodes, ...old.nodes].forEach(x=> ok(H.baseBrambleHp(x) == null, `${x.key}: the side maps' come-back-later fights keep their bramble's Health`));
  ok(TUT && +TUT[2] <= 8 && +TUT[1] === 8 && TUT_MAX && +TUT_MAX[1] === 8, `the tutorial's rival bramble starts at ${TUT && TUT[2]} Health (+2 in part 2); yours at ${TUT && TUT[1]} (owner 15:37: "D. Tutorial only")`);
  ok(/health: Math\.min\(TUTORIAL_MY_HP_MAX, cfg\.myHp \|\| TUTORIAL_MY_HP_MAX\)/.test(fn('startTutorialMatch')), 'your tutorial bramble is capped at TUTORIAL_MY_HP_MAX even if a saved config says more');
  ok(!/TUTORIAL_MY_HP_MAX/.test(fn('startConquestMatch')), 'Map 0 skirmishes keep your own bramble');
  ok(/cfg\.rivalHp \? \{health: \(cfg\.rivalHp \+ \(st >= 2 \? 2 : 0\)\)\}/.test(fn('startTutorialMatch')), 'the tutorial fight still takes the rival Health from the tutorial config'); }
{ const t = Object.assign({}, byKey('mc', '3-1'), {hqHp: 9}); H.NODE_MAP_HINT.set(t, 'mc');
  ok(H.skirmishCastle(t).hp === 9, 'a hqHp below the bramble\'s Health lowers it');
  const u = Object.assign({}, byKey('mc', '3-1'), {hqHp: 900}); H.NODE_MAP_HINT.set(u, 'mc');
  ok(H.skirmishCastle(u).hp === 30, 'a hqHp above it does not raise it (Tidewall-less Map 3: the plain 30 HP castle)'); }

// --- 4. where it is shown and used
ok(/players\[2\]\.hq\.shield = sc\.shield; players\[2\]\.hq\.maxShield = sc\.shield; players\[2\]\.hq\.shieldLayers = sc\.layers;/.test(fn('applySkirmishSetup')), 'the fight build puts the Shield on the enemy bramble');
{ const d = byKey('me', '20-A-4'), w = H.dungeonWaves(d); ok(w[w.length - 1].shield === 30 && w[0].shield === Math.round(30 * 0.25), `the dungeon's castles: first ${w[0].shield}, last ${w[w.length - 1].shield}`); }
ok(H.castleLineText(byKey('mc', '3-7')) === `🏰 ${H.skirmishCastle(byKey('mc', '3-7')).hp} HP · 🔷 ${H.skirmishCastle(byKey('mc', '3-7')).shield} Armour`, 'the VS / tooltip line shows the fight\'s Shield (the rule, or the skirmish pass\'s override)');
ok(/castleLineText\(node\)/.test(fn('showVersusOpener')), 'the VS screen reads castleLineText');
ok(/castleLineText\(node\)/.test(src.slice(src.indexOf('ctt-kind') - 200, src.indexOf('ctt-kind') + 200)), 'the node tooltip reads castleLineText');
ok(/scD = skirmishCastle\(draft\), L = scD\.layers/.test(src) && /Rule: Map \$\{nodeMapNumber\(draft\)\}/.test(src), 'the skirmish editor shows the rule and its value');
ok(/draft\.shieldOverride = ls\.length > 1 \? ls : \(ls\[0\] \|\| 0\)/.test(src) && !/draft\.armour = ls\.reduce/.test(src), 'the editor saves a changed Shield as shieldOverride, not armour');

console.log(`shields-2026-10-18: ${checks - fail}/${checks} checks passed, ${nOverride} fights with a shieldOverride  (first per kind: ${Object.entries(seen).map(([k, v])=> k + ' ' + v).join(', ')})`);
process.exit(fail ? 1 : 0);
