#!/usr/bin/env node
// 2026-10-19 (package BR, owner 08:18: "The raid's BR is being calculated wrongly. It should be the same way we calculate, but with the
// total of their 3 20-card decks and any other bonus. If the card is played straight away, it gets x2 bonus. On the ally side, our total
// BR = sum of total BR with leaders contributing 2x."): the boss's BR is its three rows' 20-card decks + the cards on its board at the
// start once more (a guard 2x) + its boss units (with the super whales' Health bonus) + its Commons; your side's is your BR + each
// ally's, each leader 2x; the VS screen and the raid page show both; normal fights' BR is unchanged.
'use strict';
const fs = require('fs'), path = require('path');
const B = require('../tools/lib_bramble.js');
const {E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS} = B;
const RaidM = require('../bramblewood-raid.js'), TrenchM = require('../bramblewood-trench.js');
const texts = require('../bramblewood-texts.js');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const near = (a, b)=> Math.abs(a - b) <= 1;
const src = B.src, TEXT = texts.TEXT || {};

const NAMES = ['RARITY_DEFS', 'RATING_WEIGHT', 'ratingWeightOf', 'ratingLevelFactor', 'deckLevelFrom', 'RARITY_TIER_BANDS', 'canLeadDef', 'RAID_BOSS_ATK', 'raidAllyOf', 'raidAllyLeaderOf',
  'RAID_BOSS_UNIT_ROUNDS', 'RAID_BOSS_UNIT_NAMES', 'raidBossUnitName', 'raidFieldRulesOf', 'mergeRaidCastles', 'RAID_TUNE_DEFAULTS', 'raidTune', 'guildScaledBramble', 'BRAMBLE_SCALE', 'brambleHp', 'brambleChar', 'raidDefScaled', /* BF5 */ 'buildRaidFullFight', 'seededRng',
  'raidCardBR', 'raidBossBR', 'raidAllyBR', 'raidSideBR'];
const body = [
  'let matchDefsOverlay = {}; const makeSimEngine = E.makeSimEngine; function getCardDefs(){ return Object.assign({}, CARD_DEFS_BASELINE, matchDefsOverlay); }',
  'const cardBaseLevel = G.cardBaseLevel, DECK_SIZE = 20;',
  ...NAMES.map(B.grab),
  'return {' + NAMES.filter(x=> !/^[A-Z_]+$/.test(x)).join(', ') + ', RAID_BOSS_UNIT_ROUNDS, getCardDefs};',
].join('\n');
const A = new Function('E', 'G', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', 'RaidM', 'TrenchM', body)(E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS, RaidM, TrenchM);
const defs = A.getCardDefs();
const rate = id=>{ const d = defs[id]; return A.ratingWeightOf(d) * A.ratingLevelFactor(G.cardBaseLevel(d)); };

const RAIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), def = RAIDS.find(r=> r.id === 'goliath');
const fresh = ()=> RaidM.raidState(def, [], 0, {cycle:0});
function build(partId, st, allies){ const f = RaidM.fightFor(def, st, partId, {});
  const b = A.buildRaidFullFight(def, partId, f, st, {rng: A.seededRng(1), rand: A.seededRng(7), recordEvents:false, allies: allies || [], myDeck: {}, myCastle: CHARACTER_DEFS.castle});
  return {f, b}; }

// ======================= the boss: 3 rows x a 20-card deck, + set-up x2, + boss units, + Commons =======================
const before = [];
for(const partId of ['left', 'right', 'tail', 'core']){
  const st = fresh(), {f, b} = build(partId, st), br = A.raidBossBR(def, f, b), deck = f.part.fight.deck, cards = Object.values(deck).reduce((a, c)=> a + c, 0);
  const perDeck = Object.keys(deck).reduce((t, id)=> t + deck[id] * rate(id), 0) * 20 / cards;
  ok(br.rows === 3 && near(br.perDeck, perDeck) && near(br.decks, 3 * perDeck), `${partId}: three rows, each its ${cards}-card deck rated as 20 cards (${br.perDeck} x 3 = ${br.decks}, want ${Math.round(3 * perDeck)})`);
  // set-up: every card on the boss's board at the start, a deck card once more (its x2), a guard (not in the deck) 2x
  const P2 = b.players[2], start = P2.row.left.concat(P2.row.center, P2.row.right, ...P2.reserve.map(r=> Object.values(r)));
  const want = start.reduce((t, c)=>{ const k = String(c.defId).split('~')[0]; return t + (deck[k] ? 1 : 2) * A.raidCardBR(c.defId, Object.assign({}, defs, b.overlay)); }, 0);
  ok(start.length >= 3 && br.setUpCards === start.length && near(br.setUp, want), `${partId}: ${start.length} cards on its board at the start count x2 (+${br.setUp}, want ${Math.round(want)})`);
  if(partId === 'core') ok(start.filter(c=> /^raid-ent-/.test(c.defId)).length === 3 && br.setUp >= 6, `core: its 3 stumps (guards, not in its deck) count 2x each (+${br.setUp})`);
  // boss units: one per boss-unit round in 20 turns (3, 7, 11, 15, 19), an Epic x (Health + bonus) / Health
  const u = b.overlay[b.bossUnitId], uw = A.ratingWeightOf(u) * A.ratingLevelFactor(G.cardBaseLevel(defs[u.bossUnitOf])) * (1 + b.bossHpBonus / u.health);
  // 2026-10-19 (package RV2): a fresh raid's boss unit has 100 Health in all (its basic Health + the bonus), not +100 on top
  // 2026-10-19 (package RB): the ceiling is the raid's bossHpBonusMax, 50 now (was 100)
  const top = def.bossHpBonusMax;
  ok(top === 55 /* RB2 (was 50) */ && br.bossUnitN === 5 && b.bossHpBonus === Math.max(0, top - u.health) && u.health + b.bossHpBonus === top && near(br.bossUnits, 5 * uw), `${partId}: 5 boss units at the fresh raid's ${top} Health (${u.health} + ${b.bossHpBonus}; +${br.bossUnits}, want ${Math.round(5 * uw)})`);
  // Commons: tuning.reinforce {max, every 3, from 3} over 20 turns = rounds 3, 6, 9, 12, 15, 18 -> 6 x max (2026-10-19, package RV2: max 0,
  // the boss's row plays took the call-ins' place)
  { const rf = def.tuning.reinforce, want = 6 * rf.max; ok(br.commonN === want && (want ? br.commons >= want : br.commons === 0), `${partId}: ${want} Commons called in over the fight (+${br.commons})`); }
  ok(br.total === Math.round(br.decks + br.setUp + br.bossUnits + br.commons) || near(br.total, br.decks + br.setUp + br.bossUnits + br.commons) || Math.abs(br.total - (br.decks + br.setUp + br.bossUnits + br.commons)) <= 2,
    `${partId}: total = decks + set-up + boss units + Commons (${br.total})`);
  // the old number: the VS screen's deckLevelFrom over the deck + hand left after the set-up and draws, at base levels
  const counts = {}; P2.deck.concat(P2.hand).forEach(c=>{ const id = typeof c === 'string' ? c : c && c.defId; if(id) counts[id] = (counts[id]||0) + 1; });
  const old = A.deckLevelFrom(counts, id=> G.cardBaseLevel(CARD_DEFS_BASELINE[id] || defs[id]), []);
  ok(br.total > 3 * old, `${partId}: the new boss BR (${br.total}) is well above the old one (${old})`);
  before.push(`${partId}: boss ${old} -> ${br.total} (decks ${br.decks} + set-up ${br.setUp} + boss units ${br.bossUnits} + Commons ${br.commons})`);
}
// a nearly-dead raid: the boss units' Health bonus shrinks with it, so their part of the BR does too
{ const st = fresh(); st.remaining = Math.round(st.total * 0.1); const a = A.raidBossBR(def, ...Object.values(build('left', fresh())).slice(0, 2)), bb = build('left', st), c = A.raidBossBR(def, bb.f, bb.b);
  ok(bb.b.bossHpBonus === Math.round((def.bossHpBonusMax - bb.b.overlay[bb.b.bossUnitId].health) * 0.1) && c.bossUnits < a.bossUnits, `a nearly-dead raid's boss units weigh less (bonus ${bb.b.bossHpBonus}: ${a.bossUnits} -> ${c.bossUnits})`); }
// no tuning.reinforce: the default call-ins (1 + 1 from round 2) over 20 turns
{ const d2 = JSON.parse(JSON.stringify(def)); delete d2.tuning.reinforce; const st = fresh(), f = RaidM.fightFor(d2, st, 'left', {}), b = A.buildRaidFullFight(d2, 'left', f, st, {rng: A.seededRng(1), rand: A.seededRng(7), recordEvents:false, allies: [], myDeck: {}});
  ok(A.raidBossBR(d2, f, b).commonN === 38, `the default reinforce (2 a round from round 2) is 38 Commons over 20 turns (${A.raidBossBR(d2, f, b).commonN})`); }

// ======================= your side: your BR + each ally's, leaders 2x =======================
{ const allies = def.allyDecks.slice(0, 2).map((d, i)=> A.raidAllyOf({name: d.name, deck: d.deck}, i));
  const {b} = build('left', fresh(), allies);
  ok(allies.every(a=> a.leaderId), 'the build gave each ally its leader');
  const each = allies.map(a=> a.deck.reduce((t, id)=> t + rate(id), 0) + 2 * rate(a.leaderId));
  allies.forEach((a, i)=> ok(near(A.raidAllyBR(a), each[i]), `${a.name}: its ${a.deck.length} cards + its leader ${a.leaderId} 2x = ${Math.round(each[i])} (${A.raidAllyBR(a)})`));
  const side = A.raidSideBR(321, allies);
  ok(side.total === 321 + side.allies[0] + side.allies[1] && side.mine === 321, `your side = yours (321) + the two allies' (${side.allies.join(' + ')}) = ${side.total}`);
  const leaderOnBoard = b.engine.allBoardCards(b.players[1]).concat(...b.players[1].reserve.map(r=> Object.values(r))).filter(c=> c.isLeader).length;
  ok(leaderOnBoard === 2, `the allies' leaders stand on the board at the start (${leaderOnBoard}), counted 2x once (not 4x)`);
  // an ally deck given as counts (a cloud raider's) rates the same as its card list
  const counts = {}; allies[0].deck.forEach(id=>{ counts[id] = (counts[id]||0) + 1; });
  ok(A.raidAllyBR({deck: counts, leaderId: allies[0].leaderId}) === A.raidAllyBR(allies[0]), 'an ally deck as counts rates the same as its card list');
  before.push(`allies: ${allies.map((a, i)=> `${a.name} ${a.level ? a.level : 0} (old simpleDeckLevel) -> ${side.allies[i]}`).join(', ')}`); }

// ======================= normal fights' BR is unchanged =======================
{ const lead = Object.keys(defs).find(id=> defs[id].rarity === 'heroic' && !defs[id].token), c1 = Object.keys(defs).find(id=> defs[id].rarity === 'rare' && !defs[id].token);
  const v = A.deckLevelFrom({[c1]: 3}, ()=> 5, [lead]), want = Math.round(3 * 4 * (1 + 4 * 0.31) + 2 * 14 * (1 + 4 * 0.31));
  ok(v === want, `deckLevelFrom: 3 Rares at Lv 5 + a Heroic leader 2x = ${want} (${v})`);
  ok(A.ratingLevelFactor(1) === 1 && Math.abs(A.ratingLevelFactor(10) - 3.79) < 1e-9 && A.ratingLevelFactor(0) === 0.7, 'the level factor: 1 at Lv 1, 3.79 at Lv 10, 0.7 at Lv 0');
  ok(/function mainDeckLevel\(counts, leaderId\)\{\n  \/\/ 2026-10-18 \(package NF\)/.test(src) && /if\(leaderId && defs\[leaderId\]\) t \+= 2 \* ratingWeightOf\(defs\[leaderId\]\) \* ratingLevelFactor\(getCardLevel\(leaderId\)\);/.test(src), 'mainDeckLevel (NF copies, leader 2x) is as it was');
  ok(/const body = deckLevelFrom\(node\.deck, lv, \[\], cap\) \* \(DECK_SIZE \/ n\), lead = deckLevelFrom\(\{\}, lv, leaders, cap\);/.test(src), 'enemyDeckLevel (an enemy deck scaled to 20 + its leaders) is as it was');
  ok(/: `<div class="vs-lvl \$\{cls\}" title="\$\{who\} battle rating"><small>\$\{who\} BR<\/small><b>⚔ \$\{n\}<\/b><\/div>`/.test(src), 'a normal fight\'s VS chips still say "Your BR" / "Their BR"'); }

// ======================= the page: VS screen and the raid page =======================
const sfb = B.grab('startRaidFullBattle');
ok(/raidBossBR\(def, f, b\)/.test(sfb) && /raidSideBR\(mainDeckLevel\(myDeckCounts, matchLeaderId\(\)\), allies\)/.test(sfb) && /a\.level = sideBR\.allies\[i\]/.test(sfb), 'the full raid rates both sides from the built fight; each ally chip shows its real BR');
ok(/brLabel: TX\('ui\.raid-br-side'\)/.test(sfb) && /brLabel: TX\('ui\.raid-br-boss'\)/.test(sfb), 'the VS screen shows "Your side\'s BR" and "Boss BR"');
ok(/deckLevelGapClass\(theirs, mine\)/.test(B.grab('showVsScreen')), 'the VS screen colours the boss\'s chip by the gap to your side\'s');
ok(/raidPartBRLine\(def, p\.id, st\)/.test(B.grab('raidPanelHTML')) && /deckLevelGapClass\(r\.boss\.total, side\)/.test(B.grab('raidPartBRLine')), 'the raid page shows each open part\'s boss BR and your side\'s, coloured by the gap');

// ======================= texts and packs =======================
const KEYS = ['ui.raid-br-boss', 'ui.raid-br-side', 'ui.raid-br-line', 'ui.raid-br-boss-tip', 'ui.raid-br-side-tip'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `${k} is a TX key the code uses`));
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `lang/${c}.json has every new text (missing: ${miss.join(', ')})`); });

before.forEach(l=> console.log('  ·', l));
console.log(fail ? `raid-br-2026-10-19: ${fail} of ${n} checks failed` : `raid-br-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
