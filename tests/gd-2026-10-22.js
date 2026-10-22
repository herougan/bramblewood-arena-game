#!/usr/bin/env node
// 2026-10-22 (package GD, owner N22-12: "Guardian now blocks for all adjacent allies in the 4 cardinal directions"):
//   - on the raid board (3 rows, reserveActs) a Guardian directly behind / in front of the target (same column) takes the hit;
//   - several Guardians: left, right, in front, behind (first that is alive takes it);
//   - a Guardian never guards itself; a waiting reserve (rows that don't fight) neither guards nor is guarded;
//   - a real swing at a front-row unit lands on the Guardian behind it, and a swing at a middle-row unit (its column's front empty)
//     lands on the Guardian behind it in the back row.
// + the crit mark is 💥 (owner DN2-3), and the skirmish card drop (owner RW2-1): every skirmish win rolls the 7% pack-card drop; a repeat win of
//   a skirmish with a first-clear reward card rolls 21%, and a drop there is that card at its rarity's share (Common 60%, Rare 40% ...), else a
//   pack card; the rank gate holds (10,000 seeded wins for a Common and a Rare reward card).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'gd-hit': U('gd-hit', {}, {attack:4}), 'gd-wall': U('gd-wall', {}), 'gd-guard': U('gd-guard', {guardian:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);

// ---- direct: who steps in for a target in each row
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 1, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'front target: the Guardian behind it (middle row, same column) steps in'); }
{ const {e, P} = mk(); const g = place(e, P, 2, 0, 'gd-guard', 0), t = place(e, P, 2, 1, 'gd-wall', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'middle target: the Guardian in front of it (front row) steps in'); }
{ const {e, P} = mk(); const t = place(e, P, 2, 1, 'gd-wall', 0), g = place(e, P, 2, 2, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'middle target: the Guardian behind it (back row) steps in'); }
{ const {e, P} = mk(); const g = place(e, P, 2, 1, 'gd-guard', 0), t = place(e, P, 2, 2, 'gd-wall', 0);
  ok(e.redirectToGuardian(P[2], t) === g, 'back target: the Guardian in front of it (middle row) steps in'); }
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0); place(e, P, 2, 1, 'gd-guard', 1); place(e, P, 2, 2, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === t, 'not adjacent (diagonal, two rows back): nobody steps in'); }
// order: left, right, in front, behind
{ const {e, P} = mk(); const t = place(e, P, 2, 1, 'gd-wall', 0), f = place(e, P, 2, 0, 'gd-guard', 0), b = place(e, P, 2, 2, 'gd-guard', 0), r = place(e, P, 2, 1, 'gd-guard', 1);
  ok(e.redirectToGuardian(P[2], t) === r, 'right beats in front and behind');
  r.hp = 0; ok(e.redirectToGuardian(P[2], t) === f, 'in front beats behind'); f.hp = 0; ok(e.redirectToGuardian(P[2], t) === b, 'behind when the others are down');
  const l = place(e, P, 2, 1, 'gd-guard', -1); r.hp = 500; ok(e.redirectToGuardian(P[2], t) === l, 'left beats right'); }
// a Guardian is not its own guard; a Guardian target is guarded by a neighbouring Guardian
{ const {e, P} = mk(); const g = place(e, P, 2, 0, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], g) === g, 'a lone Guardian takes its own hit (no self-guard)');
  const g2 = place(e, P, 2, 1, 'gd-guard', 0); ok(e.redirectToGuardian(P[2], g) === g2, 'a Guardian target: the Guardian behind it steps in'); }
// reserve rows that don't fight: no front / behind
{ const {e, P} = mk({reserveActs:false}); const t = place(e, P, 2, 0, 'gd-wall', 0); place(e, P, 2, 1, 'gd-guard', 0);
  ok(e.redirectToGuardian(P[2], t) === t, 'a waiting reserve (no reserveActs) does not guard the unit in front of it'); }
// left / right still work in the front row
{ const {e, P} = mk(); const t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 0, 'gd-guard', 1);
  ok(e.redirectToGuardian(P[2], t) === g, 'front row: the Guardian to its right steps in (unchanged)'); }

// ---- real swings
{ const {e, P} = mk(); const a = place(e, P, 1, 0, 'gd-hit', 0), t = place(e, P, 2, 0, 'gd-wall', 0), g = place(e, P, 2, 1, 'gd-guard', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp === 500 && g.hp === 496, `swing at a front unit lands on the Guardian behind it (target -${500 - t.hp}, guard -${500 - g.hp})`);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === g.uid && x.guardianRedirect), 'the hit event names the Guardian and carries guardianRedirect'); }
{ const {e, P} = mk(); place(e, P, 1, 0, 'gd-hit', 0); const t = place(e, P, 2, 1, 'gd-wall', 0), g = place(e, P, 2, 2, 'gd-guard', 0);
  e.resolveCombat(P, so, {}, [], 1);
  ok(t.hp === 500 && g.hp === 496, `swing at a middle unit (front empty) lands on the Guardian behind it (target -${500 - t.hp}, guard -${500 - g.hp})`); }

// ---- the crit mark (DN2-3)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/\nconst DN_CRIT_MARK = '💥';/.test(app) && /const FLOAT_ICON = \{crit:DN_CRIT_MARK,/.test(app), 'crit: DN_CRIT_MARK is 💥 and the floating numbers use it');
ok(!/'👊'/.test(app.split('\n').filter(l=> !/^\s*\/\//.test(l) && !/attack:\s+\[/.test(l)).join('\n')), "crit: no '👊' left in code (the emote list aside)");
ok(/\(none for a plain hit, 💥 first on a crit\)/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8')), "crit: the Codex's damage-number key says 💥");
['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const k = Object.keys(pk).find(x=> x.startsWith('❄️14🦴: the damage type')); ok(k && k.includes('💥') && pk[k].includes('💥') && !pk[k].includes('👊'), `crit: ${c} Codex line has 💥`); });
ok(/fuse ran out — 💣 /.test(app) && /bramble\. 🐘`\}/.test(app), "crit: Explode's and Stampede's log lines no longer use 💥");

// ---- the skirmish card drop (RW2-1)
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) throw new Error('no function ' + name);
  let i = app.indexOf('{', a), depth = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } } return app.slice(a + 1, i + 1); }
const constSrc = name=>{ const m = app.match(new RegExp('\\nconst ' + name + ' = [^\\n]*')); if(!m) throw new Error('no const ' + name); return m[0]; };
const seeded = seed=>{ let a = seed >>> 0; return ()=>{ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), cdefs = Object.fromEntries(cards.map(c=> [c.id, c]));
const RARITY_DEFS = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic'].map(key=> ({key}))
  .concat([{key:'quest', special:true, as:'uncommon'}, {key:'special', special:true, as:'rare'}]);
let rnd = seeded(2210); const granted = [];
const sbx = {getCardDefs: ()=> cdefs, RARITY_DEFS, RANK_ORDER: ['E','D','C','B','A','S','SS','SSS'], baseKind: k=> ({champion:'elite', miniboss:'elite', subboss:'boss'})[k] || k,
  mapNumberOf: id=> ({m5: 5, m15: 15})[id] != null ? ({m5: 5, m15: 15})[id] : null, rankAtLeast: (h, n)=> sbx.RANK_ORDER.indexOf(h) >= sbx.RANK_ORDER.indexOf(n),
  nodeRewardCardIds: (mapId, key)=> key === 'own-common' ? ['terrier-pup'] : key === 'own-rare' ? ['quillguard'] : [], nodeFirstClearPacks: ()=> [],
  packCardPool: ()=> cards.filter(c=> c.source && c.source.kind === 'pack' && !c.token && !c.test).map(c=> c.id), isEquipmentDef: d=> d.cardType === 'equipment', isEasterEgg: d=> !!d.easterEgg,
  unlockCardForPlayer: id=>{ granted.push(id); return true; }, Math: Object.assign(Object.create(Math), {random: ()=> rnd()}), Object, String, Number, Array, Set, JSON, out: {}};
vm.createContext(sbx);
vm.runInContext([constSrc('ENERGY_COST'), constSrc('SKIRMISH_DROP_CHANCE'), constSrc('SKIRMISH_DROP_RARITY'), constSrc('SKIRMISH_DROP_SHIFT'), constSrc('DROP_CHANCE_PER_ENERGY'),
  constSrc('CARD_RANK_STEP_MAPS'), constSrc('CARD_RANK_CAP'), constSrc('SKIRMISH_OWN_DROP_MULT'), constSrc('SKIRMISH_OWN_DROP_BY_RARITY'),
  ...['rarityAtLeastRare', 'nodeIsEliteForRank', 'cardRewardIsChallenge', 'cardRewardRankFor', 'dropRankOk', 'skirmishDropApplies', 'skirmishDropRarityRoll', 'skirmishDropPick', 'skirmishDropRoll',
    'rollSkirmishCardDrop', 'fightDropEnergy', 'fightCardDropChance', 'skirmishOwnDropShare', 'skirmishOwnDropIds', 'nodeCardDropChance', 'skirmishOwnDropOdds', 'rollCardDrop'].map(fnSrc)].join('\n') +
  '\nout.f = {nodeCardDropChance, rollCardDrop, skirmishOwnDropShare, skirmishOwnDropOdds};', sbx);
const F = sbx.out.f;
const WANT_SHARE = {common: .60, uncommon: .50, rare: .40, veryrare: .25, superrare: .20, epic: .10, heroic: .05, unique: .04, legendary: .03, mythic: .02, ancient: .01, divine: .01, daemonic: .01, quest: .50, special: .40, starter: .60};
Object.entries(WANT_SHARE).forEach(([r, p])=> ok(F.skirmishOwnDropShare(r) === p, `drop: ${r} reward card share ${p * 100}% (got ${F.skirmishOwnDropShare(r)})`));
const nodeC = {key: 'own-common', kind: 'skirmish', deck: {}}, nodeR = {key: 'own-rare', kind: 'skirmish', deck: {}}, nodeP = {key: 'plain', kind: 'skirmish', deck: {}};
ok(F.nodeCardDropChance('m15', nodeC) === 0.07 && F.nodeCardDropChance('m15', nodeC, {repeat: true}) === 0.21, 'drop: a reward-card skirmish shows 7% before its clear, 21% after');
ok(F.nodeCardDropChance('m15', nodeP, {repeat: true}) === 0.07, 'drop: a skirmish with no reward card stays 7% on repeats');
ok(F.nodeCardDropChance('m15', Object.assign({rewardTokens: ['factionReward']}, nodeP), {repeat: true}) === 0.07, 'drop: a skirmish whose first clear pays a token now drops too (7%; was 0)');
ok(F.nodeCardDropChance('m15', {key: 'own-common', kind: 'elite', deck: {}}, {repeat: true}) === 0.14, 'drop: an elite keeps its tier chance (14%)');
const N = 10000;
const run = (node, opts, seed)=>{ rnd = seeded(seed); granted.length = 0; let any = 0, own = 0, pack = 0; const ownId = (sbx.nodeRewardCardIds('m15', node.key) || [])[0];
  for(let i = 0; i < N; i++){ const id = F.rollCardDrop(node, 'm15', opts); if(id){ any++; if(id === ownId) own++; else pack++; } } return {any: any / N, own: own / N, pack: pack / N}; };
const pc = x=> (x * 100).toFixed(2) + '%';
for(const [nm, node, share] of [['Common (terrier-pup)', nodeC, .60], ['Rare (quillguard)', nodeR, .40]]){
  const r = run(node, {rank: 'S', firstClear: false}, nm.length * 97);
  console.log(`  repeat wins of a skirmish paying a ${nm}, ${N} seeded rolls: any card ${pc(r.any)} (want 21%), its own card ${pc(r.own)} (want ${pc(.21 * share)}), a pack card ${pc(r.pack)} (want ${pc(.21 * (1 - share))})`);
  ok(Math.abs(r.any - .21) < .012 && Math.abs(r.own - .21 * share) < .01 && Math.abs(r.pack - .21 * (1 - share)) < .01, `drop: ${nm} repeat wins: ${pc(r.any)} any, ${pc(r.own)} own, ${pc(r.pack)} pack`);
  const f = run(node, {rank: 'S', firstClear: true}, nm.length * 13);
  console.log(`  first clears of the same skirmish, ${N} rolls: any card ${pc(f.any)} (want 7%), its own card ${pc(f.own)} (want 0)`);
  ok(Math.abs(f.any - .07) < .008 && f.own === 0, `drop: ${nm} first clear: 7% pack only (${pc(f.any)}, own ${pc(f.own)})`);
  const o = F.skirmishOwnDropOdds('m15', node); ok(o && Math.abs(o.own[0].p - .21 * share) < 1e-9 && Math.abs(o.pack - .21 * (1 - share)) < 1e-9, `drop: the panel's odds for a ${nm} match (${o && pc(o.own[0].p)} + ${o && pc(o.pack)})`);
}
{ const r = run(nodeR, {rank: 'B', firstClear: false}, 77); ok(r.own === 0, `drop: the rank gate holds: a B win never drops the Rare reward card (asks S): ${pc(r.own)}`); }
ok(/rollCardDrop\([^\n]*\{rank, firstClear: !!isFirstClear\}\)/.test(app), 'drop: the win tells rollCardDrop whether it was the first clear');
ok(/skirmishOwnDropOdds\(mapId, node\)/.test(fnSrc('cnpDropsLineHTML')) && /TX\('ui\.gd-drop-own'/.test(app), "drop: the fight panel's drop line shows the reward card and its chance");
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js')); const en = TEXT['ui.gd-drop-own'];
  ok(en === '{name} drop chance: {p}', 'drop: TX key ui.gd-drop-own');
  ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); ok(pk[en] && /\{name\}/.test(pk[en]) && /\{p\}/.test(pk[en]), `drop: ${c} translates it`); }); }

console.log(`gd-2026-10-22: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
