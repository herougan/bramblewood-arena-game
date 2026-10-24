#!/usr/bin/env node
// 2026-10-24 (package BAL2, the balance pass). Runs the game's own functions (tools/lib_bramble.js reads them out of arena_app.js) on the live
// data and checks:
//   1. enemy levels (owner 10-23 20:44 / 22:23 #1): a level is introduced on its map (Lv 5 Map 20, 7 Map 40, 8 Map 60, 9 Map 80, 10 Map 100)
//      in the map's hardest fights only, earlier maps never reach it, it spreads to every fight a few maps on; Maps 0-1 keep EARLY_ENEMY_LEVEL,
//      Maps 2-4 Lv 1; the mega boss limit-breaks (Lv 11); the editor overrides LEAD set were re-based (none sits on the old schedule's number);
//   2. enemy decks inside the copy ladder (every road, side-map and endless deck), and the ambush deck 16-20 cards;
//   3. Rares (22:23 #2): on Map 5 only the boss holds a Rare (its leader); no normal main-road skirmish holds a Rare before Map 10 or a Very
//      Rare before Map 15;
//   4. DF-1: the budget's Map term 0.2 a map (bramblewood-budget.js and canonical/skill-costs.json agree), a basic-pack card's map is the first
//      main-line map it can be had on (Pack 1 from Map 0, 2 from 7, 3 from 14, its pool map if earlier, never before its rarity), and
//      canonical/card-obtain-maps.json is current;
//   5. DF-2: Base cards stop at Lv 4 and pay x1; a skirmish's own first-clear card drops 10% a repeat (any rarity), the pack card keeps 1%;
//   6. RW3-2: SS notices about monthly, SSS every 2-3 months for a full-clearing player, a passive player's first after about 6-8 months;
//      the ticket cut does not stack (SS 60%, SSS 100%, S 40%);
//   7. T21-2: the Caldera Wyrm has a source (the 20-B-4 leader, paid on its clear) and fits the budget; its Health went to the bramble;
//   8. N22-10: Bounty is priced from its robust re-measure (docs/balance/skill-test-robust-bounty-2026-10-24.json).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = G.getCardDefs();
const src = B.src;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const evalConst = name=>{ const s = B.grab(name); return eval('(' + s.slice(s.indexOf('=') + 1).trim().replace(/;\s*(\/\/.*)?$/, '') + ')'); };

// ---- 1. levels
const S = G.ROAD_LEVEL_CURVE.enemySchedule;
ok(S.intro[5] === 20 && S.intro[7] === 40 && S.intro[8] === 60 && S.intro[9] === 80 && S.intro[10] === 100, '1. the owner\'s intro maps: Lv 5 Map 20, 7 Map 40, 8 Map 60, 9 Map 80, 10 Map 100');
for(const [L, at] of G.roadLevelIntroSteps()){
  ok(G.roadEnemyScheduleLevel(at, 1) === L, `1. Lv ${L} is introduced on Map ${at} in its hardest fight (got ${G.roadEnemyScheduleLevel(at, 1)})`);
  ok(G.roadEnemyScheduleLevel(at, 0) === L - 1, `1. Map ${at}'s first skirmish is still Lv ${L - 1} (got ${G.roadEnemyScheduleLevel(at, 0)})`);
  ok(G.roadEnemyScheduleLevel(at - 1, 1) <= L - 1, `1. no fight before Map ${at} reaches Lv ${L}`);
  ok(G.roadEnemyScheduleLevel(at + S.spreadMax, 0) >= L, `1. by Map ${at + S.spreadMax} every fight has Lv ${L}`);
}
for(let no = 2; no <= 4; no++) [0, 0.5, 1].forEach(h=> ok(G.roadEnemyScheduleLevel(no, h) === 1, `1. Map ${no} stays Lv 1 (owner's Maps 0-2 and the early road)`));
ok(JSON.stringify(G.EARLY_ENEMY_LEVEL) === JSON.stringify({0: [0], 1: [0, 0.25, 0.25, 0.5, 0.5]}), '1. Maps 0-1 keep EARLY_ENEMY_LEVEL as the owner set it');
// the long wait: Lv 7 (Map 40, 10 maps after Lv 6) reaches the last 1-2 skirmishes on its first map, Lv 5 (5 maps after Lv 4) only elites and the boss
ok(G.roadEnemyScheduleLevel(40, 0.85) === 7 && G.roadEnemyScheduleLevel(20, 0.85) === 4 && G.roadEnemyScheduleLevel(20, 0.9) === 5, '1. after a long wait the next level reaches the last skirmish too (Map 40), else elites and the boss only (Map 20)');
// on the live maps: every main fight of Maps 0-24, the map's hardest fight at the intro map, nothing past the schedule
const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved && !m.tower && !m.endless);
const m20 = mains[20], boss20 = m20 && G.roadCurveFights(m20).find(n=> n.kind === 'boss'); if(boss20) G.NODE_MAP_HINT.set(boss20, m20.id);
ok(boss20 && G.roadEnemyLevelExact(boss20) === 5, `1. the Map 20 boss fights at Lv 5 (got ${boss20 && G.roadEnemyLevelExact(boss20)})`);
let past = [];
mains.forEach((m, no)=> G.roadCurveFights(m).forEach(n=>{ G.NODE_MAP_HINT.set(n, m.id); const L = G.roadEnemyLevelExact(n); if(no < 20 && L > 4 + 1e-9) past.push(n.key + ' ' + L); }));
ok(!past.length, '1. no main fight before Map 20 fights above Lv 4: ' + past.join(', '));
{ const mega = {key: 'bal2-mega', kind: 'finalboss', deck: {}}; const m = mains[mains.length - 1]; const save = G.fightMapNumber; void save;
  // a final boss counted at Map 100 limit-breaks: read the rule off the source (no Map 100 yet)
  ok(/no >= ROAD_LEVEL_CURVE\.enemySchedule\.intro\[10\]/.test(src) && S.megaBoss === 11, '1. the mega boss (a final or world boss from Map 100) limit-breaks to Lv 11'); void mega; void m; }
const leadLeft = (src.match(/enemyLevel:[0-9.]+ \/\* 2026-10-23 \(LEAD\)[^*]*\*\//g) || []);
// 2026-10-24 (package BAL3, owner BAL2-1 12:02): LEAD's Enemy levels are dropped (the schedule decides); was: all 57 kept and re-based by BAL2
ok(leadLeft.length === 0, `1. no LEAD Enemy level is left (BAL3, BAL2-1) (${leadLeft.length})`);
ok((src.match(/LEAD's Enemy level [0-9.]+ dropped, the level schedule decides/g) || []).length === 57, '1. the 57 LEAD Enemy levels dropped by BAL3, each with its note');

// ---- 2. copies and the ambush
const over = [];
G.CONQUEST_MAPS.forEach(m=>{ if(m.tower) return; (m.nodes || []).forEach(n=> Object.entries(n.deck || {}).forEach(([id, k])=>{ const d = D[id]; if(d && n.kind !== 'tutorial' && k > G.maxCopiesForRarity(d.rarity)) over.push(`${n.key} ${id} x${k}`); })); });
ok(!over.length, '2. every enemy deck (road, side maps, endless floors) follows the copy ladder: ' + over.slice(0, 6).join('; '));
{ const AMB = eval('(' + B.grab('ambushDeckSize') + ')')(); ok(AMB.min === 16 && AMB.max === 20 && AMB.target >= 16 && AMB.target <= 20, '2. the ambush deck holds 16-20 cards');
  const body = B.grab('ambushDeck');
  ['otters', 'hummingbirds'].forEach(foe=>{ const f = new Function('getCardDefs', 'cardSourceOf', 'maxCopiesForRarity', 'tutorialDecksFor', 'ambushDeckSize', body + '\nreturn ambushDeck;')(G.getCardDefs, G.cardSourceOf, G.maxCopiesForRarity, ()=> ({mine: {}}), ()=> AMB);
    const deck = f(foe), tot = Object.values(deck).reduce((a, b)=> a + b, 0);
    ok(tot >= 16 && tot <= 20, `2. the ${foe}' ambush deck has ${tot} cards (16-20)`);
    ok(Object.entries(deck).every(([id, k])=> k <= G.maxCopiesForRarity((D[id] || {}).rarity)), `2. the ${foe}' ambush deck follows the copy ladder`); }); }

// ---- 3. Rares
const step = id=> G.roadRarityStep((D[id] || {}).rarity);
mains.forEach((m, no)=> G.roadCurveFights(m).forEach(n=>{ const ids = Object.keys(n.deck || {}).filter(id=> D[id]);
  if(no === 5 && n.kind !== 'boss') ok(ids.every(id=> step(id) < 2), `3. Map 5: ${n.key} (${n.kind}) holds no Rare (only the boss's leader is)`);
  if(n.kind === 'skirmish' && no < 10) ok(ids.every(id=> step(id) < 2), `3. ${n.key}: no Rare in a normal skirmish before Map 10`);
  if(n.kind === 'skirmish' && no < 15) ok(ids.every(id=> step(id) < 3), `3. ${n.key}: no Very Rare in a normal skirmish before Map 15`); }));
{ const b5 = G.roadCurveFights(mains[5]).find(n=> n.kind === 'boss'); G.NODE_MAP_HINT.set(b5, mains[5].id); const rares = Object.keys(b5.deck).filter(id=> step(id) >= 2);
  ok(rares.length === 1 && (G.skirmishLeadersOf(b5) || []).includes(rares[0]), `3. Map 5's boss holds one Rare and it leads (${rares})`); }
ok(G.roadRarityCap(9, 'skirmish', 'mk') === 'uncommon' && G.roadRarityCap(10, 'skirmish', 'm7') === 'rare' && G.roadRarityCap(15, 'skirmish', 'ml') === 'veryrare' && G.roadRarityCap(5, 'elite', 'mw') === 'uncommon' && G.roadRarityCap(6, 'elite', 'm8') === 'rare', '3. roadRarityCap: skirmish Uncommon to 9, Rare 10, Very Rare 15; Map 5 elites Uncommon, Map 6 elites Rare');

// ---- 4. DF-1
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SCT = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
ok(BB.baseOf({rarity: 'common', obtainMap: 20}) - BB.baseOf({rarity: 'common', obtainMap: 0}) === 4 && SCT.budget.perMap === 0.2, '4. the Map term: 0.2 a map (a Map 20 card +4 N), the budget and skill-costs.json agree');
const obt = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps;
const want = {}; Object.values(D).forEach(d=>{ const m = G.cardObtainMap(d); if(m) want[d.id] = m; });
const stale = Object.keys(Object.assign({}, want, obt)).filter(id=> (want[id] || 0) !== (obt[id] || 0) && D[id]);
ok(!stale.length, '4. canonical/card-obtain-maps.json is current: ' + stale.slice(0, 6).join(', '));
const TIER = {1: 0, 2: 7, 3: 14}; let packBad = [];
Object.values(D).forEach(d=>{ const s = d.source; if(!s || s.kind !== 'pack' || !TIER[+s.tier] || d.easterEgg) return; const pool = s.map ? G.mapUnlockNumberOf(s.map) : null;
  const exp = Math.max(Math.min(TIER[+s.tier], pool != null ? pool : 99), G.rarityIntroMap(d.rarity)); if(G.cardObtainMap(d) !== exp) packBad.push(`${d.id} ${G.cardObtainMap(d)} != ${exp}`); });
ok(!packBad.length, '4. a basic-pack card\'s map is the first main-line map it can be had on: ' + packBad.slice(0, 5).join('; '));
ok(G.rarityIntroMap('epic') === 22 && G.rarityIntroMap('heroic') === 25 && G.RARITY_INTRO.epic === 21, '4. rarityIntroMap reads the main-line reveal (Epic 22, Heroic 25); RARITY_INTRO keeps the side maps\' 21');
const refit = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal2-refit-2026-10-24.json'), 'utf8'));
ok(refit.moves.length > 100 && refit.held.every(h=> h.cut > 25), `4. the re-fit is on record (${refit.moves.length} moves, ${refit.held.length} held over 25%)`);
const flagged = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'), 'utf8')));
ok(refit.held.every(h=> flagged.has(h.id)) && refit.noLine.every(id=> flagged.has(id)), '4. the held and no-line cards are merged into the flagged list');
refit.moves.slice(0, 40).filter(mv=> !/N22-10: Bounty|2026-10-24 EN6 re-fit/.test((D[mv.id] || {}).creatorNote || "")).forEach(/* 2026-10-24 (package EN6): a card EN6 re-fitted after taking a new skill carries EN6's line */mv=>{ const [A, H] = mv.to.split('/').map(Number); ok(D[mv.id] && (D[mv.id].attack || 0) === A && D[mv.id].health === H, `4. ${mv.id} carries its re-fit ${mv.to}`); });

// ---- 5. DF-2
const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));
ok(UC.modifiers.base === 1 && UC.modifiers.questBase === 0.5, '5. Base cards pay the full Forge cost (x1); quest and map cards keep x0.5');
ok(evalConst('BASE_CARD_LEVEL_CAP') === 4 && /if\(\(currentLevel\|\|0\) >= playerLevelCap\(defId\)\) return false;/.test(src), '5. Base cards stop at Lv 4 (canAffordLevelUp)');
ok(/isBaseLevelCapped\(b\) && level > BASE_CARD_LEVEL_CAP/.test(B.grab('referencePlayerDeck')), '5. the reference player\'s Base cards stop at Lv 4 too');
ok(evalConst('SKIRMISH_OWN_REPEAT_DROP') === 0.10, '5. a skirmish\'s own first-clear card drops 10% a repeat win');
ok(/rng\(\) < SKIRMISH_OWN_REPEAT_DROP/.test(B.grab('rollCardDrop')) && !/skirmishOwnDropShare/.test(B.grab('rollCardDrop')), '5. any rarity: the rarity share no longer cuts it');
ok(fs.readFileSync(path.join(ROOT, 'docs', 'progression-plan.md'), 'utf8').includes('## The grind to each gate (BAL2, DF-2)'), '5. the grind to each gate is in docs/progression-plan.md');
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js')), en = TEXT['ui.bal2-base-cap'];
  ok(en && /Lv 4/.test(en) && /TX\('ui\.bal2-base-cap'\)/.test(src) && /baseTop \? /.test(src), '5. the Forge says a Base card stops at Lv 4 (no Prestige or limit break there)');
  ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); ok(pk[en] && /4/.test(pk[en]), `5. ${c} translates it`); }); }

// ---- 6. RW3-2
const W = evalConst('QUEST_RANK_WEIGHT'), TK = evalConst('QUEST_RAID_TICKET_CHANCE');
ok(Math.abs(Object.values(W).reduce((a, b)=> a + b, 0) - 100) < 1e-9, '6. the notice weights add up to 100%');
const month = 30.44, fullLo = 6 * month, fullHi = 7 * month; // six a day, plus the free swap's redraw
ok(W.SS / 100 * fullLo >= 0.8 && W.SS / 100 * fullHi <= 1.2, `6. a full-clearing player meets an SS notice about once a month (${(W.SS / 100 * fullLo).toFixed(2)}-${(W.SS / 100 * fullHi).toFixed(2)})`);
ok(1 / (W.SSS / 100 * fullHi) >= 2 && 1 / (W.SSS / 100 * fullLo) <= 3, `6. an SSS notice every 2-3 months (${(1 / (W.SSS / 100 * fullHi)).toFixed(1)}-${(1 / (W.SSS / 100 * fullLo)).toFixed(1)})`);
{ const perMonthPassive = 0.7 * month, first = 1 / ((W.SS + W.SSS) / 100) / perMonthPassive; ok(first >= 6 && first <= 8, `6. a passive player (0.7 notices a day) meets the first SS / SSS after ${first.toFixed(1)} months (6-8)`); }
ok(TK.S === 0.4 && TK.SS === 0.6 && TK.SSS === 1, '6. the ticket cut does not stack on the rarer notices (S 40%, SS 60%, SSS 100%)');
{ const sWeek = W.S / 100 * 42 * TK.S; ok(sWeek >= 0.5 && sWeek <= 0.7, `6. S tickets ${sWeek.toFixed(2)} a week (0.5-0.7)`); }

// ---- 7. the Caldera Wyrm
const wy = D['caldera-wyrm'];
ok(wy && wy.source && wy.source.kind === 'map' && wy.source.id === 'mx' && wy.source.node === '20-B-4' && (wy.archetypes || []).includes('Leader'), '7. the Caldera Wyrm is the 20-B-4 leader paid on its clear (grantClearedBossLeaders)');
{ process.argv.push('--world=half'); const SC = require(path.join(ROOT, 'tools', 'card_retune_2026_10_19.js')).SC, T = SC.make(SCT);
  ok(T.budget(wy, {level: 1}).ok, `7. it fits the budget at Level 1 with its map term (${wy.attack}/${wy.health})`); }
ok(/\{ key:"20-B-4"[^\n]*hqHp:269/.test(src), '7. its 29 Health went onto the 20-B-4 bramble (240 -> 269)');

// ---- 8. Bounty
const bres = path.join(ROOT, 'docs', 'balance', 'skill-test-robust-bounty-2026-10-24.json');
ok(fs.existsSync(bres), '8. the robust Bounty re-measure is saved');
const bnt = (SCT.triggers || []).concat(SCT.skills || []).find(s=> s.id === 'bounty'); // Bounty N is a trigger weight x Gain x N
ok(bnt && bnt.value === 2.5 && /2026-10-24 \(BAL2, N22-10/.test(bnt.note || ''), '8. Bounty\'s price carries the re-measure\'s note');

console.log(fail ? `bal2-2026-10-24: ${fail} of ${checks} failed` : `bal2-2026-10-24: all ${checks} passed`);
process.exit(fail ? 1 : 0);
