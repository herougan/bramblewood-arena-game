#!/usr/bin/env node
// 2026-10-22 (package RW2, the owner's answers to RW-1, RW-2, RW-3 and the raid drops at 12:13). Runs the game's own functions (read out
// of arena_app.js and bramblewood-raid.js) and checks:
//   1. the rank gate never asks above S (elites and bosses included, every map); a challenge card (source.challenge) asks SS; the six
//      challenge cards picked by tools/challenge_cards_2026_10_22.js are flagged, one per four-map band from Map 4, on elite-kind fights;
//      the fight panel marks them (ribbon + TX key, 12 packs);
//   2. the skirmish drop shares: Maps 10-29 Common 80 / Uncommon 20, Maps 30+ 70 / 25 / 5 (10,000 rolls each, before the shift);
//   3. one drop for every fight: since RW3 (2026-10-23) 1% per Energy tier (ENERGY_COST) + the shield bonus (elite 1, sub-boss 2, boss 3, world / final 4), no cap (was 7% a tier, capped at 25%); the old CARD_DROP_CHANCE table is gone; 10,000 seeded
//      wins of each kind land on those numbers;
//   4. raid fights: survived 1%, the enemy bramble killed 12%, killed at S+ 25% (10,000 seeded fights each); the raid's own card stays
//      RAID_CARD_DROP_CHANCE of the cards that drop;
//   5. texts and docs: the TX keys in 12 packs, decisions RW-1..3 DONE, the CHANGELOG entry.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) throw new Error('no function ' + name);
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const constSrc = name=>{ const m = src.match(new RegExp('\\nconst ' + name + ' = [^\\n]*')); if(!m) throw new Error('no const ' + name); return m[0]; };
const seeded = seed=>{ let a = seed >>> 0; return ()=>{ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pct = (n, N)=> (100 * n / N).toFixed(1) + '%';

// the game's pieces in one sandbox
const KIND_BASE = {champion:'elite', miniboss:'elite', subboss:'boss', dungeon:'elite', worldboss:'raidboss', megaraid:'raidboss'};
let rnd = seeded(1022); const granted = [];
const RARITY_DEFS = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic'].map(key=> ({key}));
const ctx = {getCardDefs: ()=> defs, RARITY_DEFS, RANK_ORDER: ['E','D','C','B','A','S','SS','SSS'], baseKind: k=> KIND_BASE[k] || k,
  mapNumberOf: id=> ({m0: 0, m5: 5, m15: 15, m25: 25, m35: 35, m45: 45})[id] != null ? ({m0: 0, m5: 5, m15: 15, m25: 25, m35: 35, m45: 45})[id] : null,
  rankAtLeast: (h, n)=> ctx.RANK_ORDER.indexOf(h) >= ctx.RANK_ORDER.indexOf(n), nodeRewardCardIds: ()=> [], nodeFirstClearPacks: ()=> [],
  packCardPool: ()=> cards.filter(c=> c.source && c.source.kind === 'pack' && !c.token && !c.test).map(c=> c.id), isEquipmentDef: d=> d.cardType === 'equipment', isEasterEgg: d=> !!d.easterEgg,
  unlockCardForPlayer: id=>{ granted.push(id); return true; }, Math: Object.assign(Object.create(Math), {random: ()=> rnd()}), Object, String, Number, Array, Set, JSON, out: {}};
vm.createContext(ctx);
vm.runInContext([constSrc('ENERGY_COST'), constSrc('SKIRMISH_DROP_CHANCE'), constSrc('SKIRMISH_DROP_RARITY'), constSrc('SKIRMISH_DROP_SHIFT'), constSrc('DROP_CHANCE_PER_ENERGY'), constSrc('DROP_PER_ENERGY_RW3'), constSrc('DROP_SHIELD_BONUS'), /* RW3 */
  constSrc('CARD_RANK_STEP_MAPS'), constSrc('CARD_RANK_CAP'),
  ...['rarityAtLeastRare', 'nodeIsEliteForRank', 'cardRewardIsChallenge', 'cardRewardRankFor', 'dropRankOk', 'skirmishDropApplies', 'skirmishDropRarityRoll', 'skirmishDropPick', 'skirmishDropRoll',
    'rollSkirmishCardDrop', 'fightDropEnergy', 'dropShieldBonus', 'ticketedDungeonDropChance', 'isTicketedDungeonFight', 'fightCardDropChance', 'nodeCardDropChance', 'rollCardDrop'].map(fnSrc)].join('\n') +
  '\nout.f = {cardRewardRankFor, cardRewardIsChallenge, skirmishDropRarityRoll, fightCardDropChance, nodeCardDropChance, rollCardDrop};', ctx);
const F = ctx.out.f;

// ---- 1. the rank gate
const KINDS = ['skirmish', 'elite', 'champion', 'miniboss', 'dungeon', 'subboss', 'boss', 'finalboss', 'worldboss', 'raidboss', 'megaraid'];
const anyCommon = cards.find(c=> c.rarity === 'common').id, anyRare = cards.find(c=> c.rarity === 'rare').id, anyHeroic = cards.find(c=> c.rarity === 'heroic').id;
let above = [];
['m0', 'm5', 'm15', 'm25', 'm35', 'm45'].forEach(map=> KINDS.forEach(kind=> [null, anyCommon, anyRare, anyHeroic].forEach(id=>{
  const r = F.cardRewardRankFor(map, {key: 'x', kind}, id); if(['SS', 'SSS'].includes(r)) above.push(`${map} ${kind} ${id}: ${r}`); })));
ok(!above.length, '1. no reward or drop ever asks above S without a challenge flag: ' + above.slice(0, 4).join('; '));
ok(F.cardRewardRankFor('m5', {key: 'x', kind: 'skirmish'}, anyCommon) === 'B' && F.cardRewardRankFor('m5', {key: 'x', kind: 'skirmish'}, anyRare) === 'S', '1. base: B for a Common, S for a Rare (Maps 0-19)');
ok(F.cardRewardRankFor('m5', {key: 'x', kind: 'elite'}, anyCommon) === 'S' && F.cardRewardRankFor('m5', {key: 'x', kind: 'boss'}, anyCommon) === 'S', '1. an elite or boss asks S (was SS)');
ok(F.cardRewardRankFor('m25', {key: 'x', kind: 'skirmish'}, anyCommon) === 'A' && F.cardRewardRankFor('m45', {key: 'x', kind: 'skirmish'}, anyCommon) === 'S', '1. the 20-map step still lifts B to A (20-39) and S (40+)');
ok(F.cardRewardRankFor('m5', {key: 'x', kind: 'skirmish', cardRank: 'SSS'}, anyCommon) === 'S', "1. a fight's own cardRank is capped at S too");
ok(F.cardRewardRankFor('m5', {key: 'x', kind: 'tutorial'}, anyCommon) === null, '1. a tutorial fight asks nothing');
const CH = require(path.join(ROOT, 'tools', 'challenge_cards_2026_10_22.js')).picks();
const flagged = cards.filter(c=> c.source && c.source.challenge).map(c=> c.id).sort();
ok(CH.length === 6 && JSON.stringify(CH.map(p=> p.id).sort()) === JSON.stringify(flagged), `1. the six picks are the flagged cards (${flagged.join(', ')})`);
ok(flagged.every(id=> defs[id].source.kind === 'map' && !['pack'].includes(defs[id].source.kind) && ['heroic', 'unique', 'epic'].includes(defs[id].rarity)), '1. challenge cards are map rewards (never pack cards) of high rarity');
ok(CH.every(p=> ['elite', 'champion', 'miniboss', 'dungeon'].includes(p.kind)) && new Set(CH.map(p=> p.band)).size === CH.length && CH.every(p=> p.map >= 4), '1. one per four-map band from Map 4, on elite-kind fights');
{ const c = defs[flagged[0]], s = c.source; defs[c.id] = Object.assign({}, c, {source: Object.assign({}, s, {id: 'm5'})});
  ok(F.cardRewardIsChallenge('m5', {key: s.node, kind: 'miniboss'}, c.id) && F.cardRewardRankFor('m5', {key: s.node, kind: 'miniboss'}, c.id) === 'SS', '1. a challenge card asks SS');
  ok(!F.cardRewardIsChallenge('m5', {key: 'other', kind: 'miniboss'}, c.id), '1. only on its own fight'); defs[c.id] = c; }
ok(/cardRewardIsChallenge\(mapId, node, id\)/.test(fnSrc('cnpRewardStripHTML')) && /TX\('ui\.rw2-challenge'\)/.test(src) && /\.cnp-rw-card\.is-challenge\{/.test(tpl), '1. the fight panel marks a challenge card (ribbon, gold frame, its SS hex)');
ok(/was\.challenge === true/.test(src), "1. the card editor's placement Save keeps the flag while the card stays on its fight");

// ---- 2. the skirmish drop shares (before the 5% shift)
const N = 10000;
for(const [map, want] of [[15, {common: 0.80, uncommon: 0.20}], [35, {common: 0.70, uncommon: 0.25, rare: 0.05}], [5, {common: 1}]]){
  rnd = seeded(map * 7); const n = {}; for(let i = 0; i < N; i++){ const b = F.skirmishDropRarityRoll(map, rnd).base; n[b] = (n[b] || 0) + 1; }
  const line = Object.entries(n).map(([k, v])=> `${k} ${pct(v, N)}`).join(' / '); console.log(`  Map ${map} base rarity, ${N} rolls: ${line}`);
  ok(Object.entries(want).every(([k, p])=> Math.abs((n[k] || 0) / N - p) < 0.015) && Object.keys(n).every(k=> want[k]), `2. Map ${map}: ${line}`);
}
ok(/\[10, \[\['common', 0\.80\], \['uncommon', 0\.20\]\]\]/.test(constSrc('SKIRMISH_DROP_RARITY')), '2. the table says 80 / 20 from Map 10');

// ---- 3. one drop for every fight: 1% per Energy tier + the shield bonus (RW3, owner RW2-3), no cap
ok(!/\nconst CARD_DROP_CHANCE = /.test(src), '3. the old table by fight kind is gone');
const WANT = {skirmish: 0.01, elite: 0.03, champion: 0.03, miniboss: 0.03, dungeon: 0.03, subboss: 0.05, boss: 0.06, worldboss: 0.08, raidboss: 0.08, megaraid: 0.09, finalboss: 0.09}; // RW3
Object.entries(WANT).forEach(([k, p])=> ok(F.fightCardDropChance(k) === p, `3. ${k}: ${p * 100}% (got ${F.fightCardDropChance(k)})`));
ok(F.nodeCardDropChance('m5', {key: 'x', kind: 'tutorial'}) === 0, '3. no drop in a tutorial fight');
for(const kind of ['skirmish', 'elite', 'boss', 'raidboss']){
  rnd = seeded(kind.length * 31); granted.length = 0; let got = 0;
  for(let i = 0; i < N; i++){ if(F.rollCardDrop({key: 'x', kind, deck: {}}, 'm15', {})) got++; }
  console.log(`  ${kind} wins on Map 15, ${N} rolls: ${pct(got, N)} dropped a card (want ${+(WANT[kind] * 100).toFixed(1)}%)`);
  ok(Math.abs(got / N - WANT[kind]) < 0.006 && granted.every(id=> defs[id].source && defs[id].source.kind === 'pack'), `3. ${kind}: ${pct(got, N)} of ${N} wins drop a pack card`);
}
{ rnd = seeded(5); let got = 0; for(let i = 0; i < N; i++){ if(F.rollCardDrop({key: 'x', kind: 'elite', deck: {}}, 'm15', {rank: 'A'})) got++; }
  ok(got === 0, `3. the rank gate holds: an A win in an elite (asks S) drops nothing (${got})`); }
ok(/rollCardDrop\(\(findConquestNode/.test(src), '3. a conquest win still rolls it (every fight kind)');

// ---- 4. raid fights
const RW = {survived: [{survived: true}, 0.01], killed: [{killed: true, rank: 'A'}, 0.12], killedS: [{killed: true, rank: 'S'}, 0.25]};
for(const [k, [o, p]] of Object.entries(RW)){
  rnd = seeded(p * 1000); let got = 0; for(let i = 0; i < N; i++){ if(rnd() < R.raidFightDropChance(o)) got++; }
  console.log(`  raid fight ${k}, ${N} rolls: ${pct(got, N)} drop a card (want ${+(p * 100).toFixed(1)}%)`);
  ok(R.raidFightDropChance(o) === p && Math.abs(got / N - p) < (p < 0.05 ? 0.004 : 0.012), `4. raid ${k}: ${pct(got, N)}`);
}
ok(R.raidFightDropChance({killed: true, rank: 'SSS'}) === 0.25 && R.raidFightDropChance({}) === 0, '4. SSS is S+; a loss drops nothing');
ok(R.RAID_CARD_DROP_CHANCE === 0.015, "4. the raid's own card: 1.5% of the cards that drop (at most 0.375% a fight)");
const rfd = fnSrc('raidFightCardDrop'), settle = fnSrc('settleRaidPartAfterMatch');
ok(/raidFightDropChance\(o \|\| \{killed: true\}\)/.test(rfd) && /if\(!\(Math\.random\(\) < chance\)\) return null;/.test(rfd), '4. raidFightCardDrop rolls the chance first');
ok(/survived: m\.winner !== 2 && mine/.test(settle) && /if\(o\.killed \|\| o\.survived\)/.test(settle), '4. a survived fight rolls too (it rolled nothing before)');

// ---- 5. texts and docs
['ui.rw2-challenge', 'ui.rw2-challenge-card', 'results.rw2-raid-card-survived'].forEach(k=> ok(typeof TEXT[k] === 'string', '5. TX ' + k));
for(const c of ['de','es','fr','id','it','ja','ko','pt','ta','tl','zh-Hans','zh-Hant']){
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  ok(['ui.rw2-challenge', 'ui.rw2-challenge-card', 'results.rw2-raid-card-survived'].every(k=> d[TEXT[k]]), `5. ${c} translates the three lines`);
}
const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8')).items;
ok(['RW-1', 'RW-2', 'RW-3'].every(id=>{ const d = dec.find(x=> x.id === id); return d && d.status === 'DONE' && d.decided && /Owner/.test(d.outcome || ''); }), '5. RW-1..3 answered (DONE, decided, outcome)');
ok(/^## 2026-10-22 \(package RW2/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), '5. the CHANGELOG entry');

console.log(fail ? `rw2: ${checks} checks, ${fail} failure(s)` : `rw2: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
