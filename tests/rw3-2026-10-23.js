#!/usr/bin/env node
// 2026-10-23 (package RW3, the owner's answers of 00:10: items 5, 6, 8, 19, 23, 25, 42, 44, 48, 53, 68, 69, 86). Runs the game's own
// functions (read out of arena_app.js) and the shipped data, and checks:
//   19. card drops: 1% per Energy tier + the shield bonus (elite / champion / miniboss / dungeon +1, sub-boss +2, boss +3, world / raid
//       boss, megaraid, final boss +4), no cap; a reward-card skirmish's repeat win 3x (3%) then the card's rarity share; the ticketed
//       (daily) dungeons keep 7% per tier capped at 25%. 10,000 seeded wins of each kind.
//   44. Raid Ticket notices: S 40%, SS 40%, SSS 40%; 10,000 simulated weeks / months of 6 completed notices a day: S tickets 0.5-0.7 a
//       week, SS + SSS tickets once every 1-2 months.
//   69. pack foils: at most 2% a card, no guaranteed foil; 10,000 card rolls for each pack.
//   42. the Shop's Raid Ticket: in stock on 25% of days (10,000 days), stock 1, sold out once bought, the Buy button only with stock.
//   53. packs are not gated by map or rarity and keep no memory (no recent-pull weight, no new-card guarantee); the drop and the base
//       track keep the gate.
//    8. a Mystery Booster card is an Easter egg 0.05% of the time, granted through the 'mysteryEgg' source.
//   68. disenchant Dust by rarity: 5 / 10 / 25 / 45 / 65 / 100 / 150 / 250 / 400 / 700 / 1,200 / 2,000 (+ Void 3,000, Daemonic 4,500).
//   86. the Nurse speeds hatching and never touches the Shiny chance.
//   5, 6, 48. every main-map skirmish pays something on its first clear; the maps that had no exclusive have 1-2; the Quarry Mole is 8-1's.
//   23. Standard PvP and Collection PvP draw from different pools; Standard keeps foils.
//   25. per-copy Forge levels (tests/fg-2026-10-19.js and nf-2026-10-19.js test the model; here only the version).
//   Texts: the RW3 TX keys in all 12 packs.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) throw new Error('no function ' + name);
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const constSrc = name=>{ const m = src.match(new RegExp('\\nconst ' + name + ' = [^\\n]*')); if(!m) throw new Error('no const ' + name); return m[0]; };
const seeded = seed=>{ let a = seed >>> 0; return ()=>{ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const N = 10000, pct = x=> (x * 100).toFixed(2) + '%';

// ======================= 19. card drops =======================
const KIND_BASE = {champion:'elite', miniboss:'elite', subboss:'boss', dungeon:'elite', worldboss:'raidboss', megaraid:'raidboss'};
let rnd = seeded(1023); const granted = [];
const RARITY_DEFS = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient'].map(key=> ({key}));
let dailyDungeon = false;
const sbx = {getCardDefs: ()=> defs, RARITY_DEFS, RANK_ORDER: ['E','D','C','B','A','S','SS','SSS'], baseKind: k=> KIND_BASE[k] || k,
  mapNumberOf: id=> ({m15: 15})[id] != null ? 15 : 0, rankAtLeast: (h, n)=> sbx.RANK_ORDER.indexOf(h) >= sbx.RANK_ORDER.indexOf(n),
  nodeRewardCardIds: ()=> [], nodeFirstClearPacks: ()=> [], nodeFirstClearCardIds: (mid, key)=> key === 'own' ? ['terrier-pup'] : [],
  CONQUEST_MAPS: [{id: 'dg', endless: true}], isDailyDungeonMap: m=> dailyDungeon && !!m && m.id === 'dg',
  packCardPool: ()=> cards.filter(c=> c.source && c.source.kind === 'pack' && !c.token && !c.test).map(c=> c.id), isEquipmentDef: d=> d.cardType === 'equipment', isEasterEgg: d=> !!d.easterEgg,
  unlockCardForPlayer: id=>{ granted.push(id); return true; }, Math: Object.assign(Object.create(Math), {random: ()=> rnd()}), Object, String, Number, Array, Set, JSON, out: {}};
vm.createContext(sbx);
vm.runInContext([constSrc('ENERGY_COST'), constSrc('SKIRMISH_DROP_CHANCE'), constSrc('SKIRMISH_DROP_RARITY'), constSrc('SKIRMISH_DROP_SHIFT'), constSrc('DROP_CHANCE_PER_ENERGY'),
  constSrc('DROP_PER_ENERGY_RW3'), constSrc('DROP_SHIELD_BONUS'), constSrc('SKIRMISH_OWN_DROP_MULT'), constSrc('SKIRMISH_OWN_DROP_BY_RARITY'), constSrc('CARD_RANK_STEP_MAPS'), constSrc('CARD_RANK_CAP'),
  ...['rarityAtLeastRare', 'nodeIsEliteForRank', 'cardRewardIsChallenge', 'cardRewardRankFor', 'dropRankOk', 'skirmishDropApplies', 'skirmishDropRarityRoll', 'skirmishDropPick', 'skirmishDropRoll',
    'rollSkirmishCardDrop', 'fightDropEnergy', 'dropShieldBonus', 'fightCardDropChance', 'ticketedDungeonDropChance', 'isTicketedDungeonFight', 'skirmishOwnDropShare', 'skirmishOwnDropIds',
    'nodeCardDropChance', 'skirmishOwnDropOdds', 'rollCardDrop'].map(fnSrc)].join('\n') +
  '\nout.f = {fightCardDropChance, nodeCardDropChance, rollCardDrop, skirmishOwnDropOdds};', sbx);
const F = sbx.out.f;
const WANT = {skirmish: 0.01, elite: 0.03, champion: 0.03, miniboss: 0.03, dungeon: 0.03, subboss: 0.05, boss: 0.06, worldboss: 0.08, raidboss: 0.08, megaraid: 0.09, finalboss: 0.09};
Object.entries(WANT).forEach(([k, p])=> ok(F.fightCardDropChance(k) === p, `19. ${k}: ${p * 100}% (got ${F.fightCardDropChance(k)})`));
ok(F.fightCardDropChance('tutorial') === 0, '19. no drop in a tutorial');
for(const kind of Object.keys(WANT)){
  rnd = seeded(kind.length * 131 + 7); granted.length = 0; let got = 0;
  for(let i = 0; i < N; i++){ if(F.rollCardDrop({key: 'x', kind, deck: {}}, 'm15', {})) got++; }
  console.log(`  ${kind.padEnd(9)} ${N} wins: ${pct(got / N)} dropped a card (want ${WANT[kind] * 100}%)`);
  ok(Math.abs(got / N - WANT[kind]) < 0.006, `19. ${kind}: ${pct(got / N)} of ${N} wins`);
}
{ // a reward-card skirmish: 1% on its first clear, 3% (3x) on repeats, the card at its rarity's share (Common 60%)
  const node = {key: 'own', kind: 'skirmish', deck: {}};
  ok(F.nodeCardDropChance('m15', node) === 0.01 && F.nodeCardDropChance('m15', node, {repeat: true}) === 0.03, '19. a reward-card skirmish: 1% first clear, 3% on repeats');
  rnd = seeded(77); let any = 0, own = 0; for(let i = 0; i < N; i++){ const id = F.rollCardDrop(node, 'm15', {rank: 'S', firstClear: false}); if(id){ any++; if(id === 'terrier-pup') own++; } }
  console.log(`  repeat wins of a skirmish paying a Common, ${N} rolls: ${pct(any / N)} (want 3%), the card itself ${pct(own / N)} (want 1.80%)`);
  ok(Math.abs(any / N - 0.03) < 0.005 && Math.abs(own / N - 0.018) < 0.004, '19. the repeat roll: 3%, then the card at 60%');
  const o = F.skirmishOwnDropOdds('m15', node); ok(o && Math.abs(o.own[0].p - 0.018) < 1e-9 && Math.abs(o.pack - 0.012) < 1e-9, '19. the panel shows 1.8% + 🃏 1.2%'); }
{ // the ticketed (daily) dungeons keep their higher rate
  dailyDungeon = true;
  ok(F.nodeCardDropChance('dg', {key: 'f1', kind: 'skirmish'}) === 0.07 && F.nodeCardDropChance('dg', {key: 'f10', kind: 'miniboss'}) === 0.14, '19. a daily-dungeon floor keeps 7%, a mini-boss floor 14%');
  rnd = seeded(9); let got = 0; for(let i = 0; i < N; i++){ if(F.rollCardDrop({key: 'f1', kind: 'skirmish', deck: {}}, 'dg', {})) got++; }
  console.log(`  daily-dungeon floor, ${N} wins: ${pct(got / N)} (want 7%)`);
  ok(Math.abs(got / N - 0.07) < 0.008, '19. a ticketed dungeon floor drops at 7% (10,000 wins)');
  dailyDungeon = false; }
ok(/DROP_CHANCE_CAP/.test(fnSrc('ticketedDungeonDropChance')) && !/DROP_CHANCE_CAP/.test(fnSrc('fightCardDropChance')), '19. no cap on the fight drop; the cap only on the ticketed dungeons');

// ======================= 44. Raid Ticket notices =======================
{ const W = vm.runInNewContext('(' + constSrc('QUEST_RANK_WEIGHT').replace(/^\nconst QUEST_RANK_WEIGHT = /, '').replace(/;.*$/, '') + ')');
  const T = vm.runInNewContext('(' + constSrc('QUEST_RAID_TICKET_CHANCE').replace(/^\nconst QUEST_RAID_TICKET_CHANCE = /, '').replace(/;.*$/, '') + ')');
  ok(T.S === 0.4 && T.SS === 0.4 && T.SSS === 0.4, `44. a notice's Raid Ticket: S 40%, SS 40%, SSS 40% (${JSON.stringify(T)})`);
  const ranks = Object.keys(W), tot = ranks.reduce((t, k)=> t + W[k], 0);
  const roll = r=>{ let x = r() * tot; for(const k of ranks){ x -= W[k]; if(x <= 0) return k; } return ranks[ranks.length - 1]; };
  const r = seeded(44); let s = 0, high = 0;
  for(let w = 0; w < N; w++) for(let i = 0; i < 42; i++){ const k = roll(r); if(T[k] && r() < T[k]){ if(k === 'S') s++; else high++; } }
  const perWeekS = s / N, perMonthHigh = high / N * 30.44 / 7;
  console.log(`  notices, ${N} simulated weeks of 6 a day: S tickets ${perWeekS.toFixed(3)} a week (want 0.5-0.7), SS + SSS tickets ${perMonthHigh.toFixed(3)} a month (want 0.5-1: once every 1-2 months)`);
  ok(perWeekS >= 0.5 && perWeekS <= 0.7, `44. S notices bring 0.5-0.7 Raid Tickets a week (${perWeekS.toFixed(3)})`);
  ok(perMonthHigh >= 0.5 && perMonthHigh <= 1, `44. SS and SSS notices together bring one every 1-2 months (${perMonthHigh.toFixed(3)} a month)`);
  const exact = 42 * W.S / 100 * T.S, exactHigh = 6 * 30.44 * (W.SS + W.SSS) / 100 * T.SS;
  ok(Math.abs(exact - 0.588) < 0.001 && Math.abs(exactHigh - 0.7306) < 0.001, `44. the math: 42 x 3.5% x 40% = ${exact.toFixed(3)} a week; 182.6 x 1.0% x 40% = ${exactHigh.toFixed(3)} a month`); }

// ======================= 69. pack foils =======================
{ const block = src.slice(src.indexOf('const SHOP_PACKS_DEFAULT = ['), src.indexOf('];', src.indexOf('const SHOP_PACKS_DEFAULT = [')) + 2);
  const packs = vm.runInNewContext(block.replace('const SHOP_PACKS_DEFAULT = ', '(') .replace(/\];$/, '])'));
  const want = {bronze: 0.01, silver: 0.015, mystery: 0.02, gold: 0.02};
  packs.forEach(p=> ok(p.foilChance === want[p.id] && p.foilChance <= 0.02 && !p.foilGuaranteed, `69. ${p.name}: ${p.foilChance * 100}% foil a card, none guaranteed`));
  ok(/const FACTION_PACK_FOIL = 0\.01;/.test(src) && /foilChance:FACTION_PACK_FOIL/.test(src), '69. faction packs 1% a card');
  ok(/Object\.assign\(\{pool:1, foilChance:0\.01, foilGuaranteed:false\}, p\)/.test(src), '69. a pack with no foil chance of its own: 1%');
  const fx = {Math: Object.assign(Object.create(Math), {random: null}), PACK_FOIL_FINISHES_DEFAULT: {auto: 1}, Object, Array, out: {}};
  vm.createContext(fx); vm.runInContext(fnSrc('pickFoilFinish') + '\n' + fnSrc('rollPackFoils') + '\nout.f = rollPackFoils;', fx);
  packs.forEach(p=>{ const r = seeded(p.id.length * 17); fx.Math.random = r; let foils = 0; for(let i = 0; i < N; i++) foils += fx.out.f(p, 1).filter(Boolean).length;
    console.log(`  ${p.name.padEnd(16)} ${N} cards: ${pct(foils / N)} foil (set ${pct(p.foilChance)})`);
    ok(Math.abs(foils / N - p.foilChance) < 0.004, `69. ${p.name}: ${pct(foils / N)} of ${N} cards foil`); });
  const g = packs.find(p=> p.id === 'gold'); fx.Math.random = seeded(5); let perPack = 0; for(let i = 0; i < N; i++) perPack += fx.out.f(g, g.cards).filter(Boolean).length;
  console.log(`  Highcrest Case, ${N} packs of ${g.cards}: ${(perPack / N).toFixed(3)} foils a pack (was about 1.3 with 12% + one guaranteed)`);
  ok(perPack / N < 0.2, '69. a Highcrest Case averages under 0.2 foils (was about 1.3)'); }

// ======================= 42. the Shop's Raid Ticket =======================
{ const st = {}; let day = 20000;
  const sx = {Math, localStorage: {getItem: k=> k in st ? st[k] : null, setItem: (k, v)=>{ st[k] = String(v); }}, itemDay: ()=> day, adminModeEnabled: false, tabOpen: ()=> true,
    raidTicketItems: ()=> 0, RAID_TICKET_ITEM_CAP: 9, PROGRESS_KEYS: [], Number, String, out: {}};
  vm.createContext(sx);
  vm.runInContext([fnSrc('hashStr'), fnSrc('shopRaidTicketDayRoll'), constSrc('RAID_TICKET_SHOP_CHANCE').replace(/^\n/, ''), 'PROGRESS_KEYS.push(RAID_TICKET_SHOP_KEY);',
    ...['shopRaidTicketInStockDay', 'shopRaidTicketSoldDay', 'shopRaidTicketStock', 'shopRaidTicketSoldOut', 'shopRaidTicketOnShelf', 'shopRaidTicketFull'].map(fnSrc)].join('\n') +
    '\nout.f = {shopRaidTicketInStockDay, shopRaidTicketStock, shopRaidTicketSoldOut, shopRaidTicketOnShelf, shopRaidTicketFull, RAID_TICKET_SHOP_KEY};', sx);
  const S = sx.out.f; let on = 0; for(let d = 0; d < N; d++) if(S.shopRaidTicketInStockDay(30000 + d)) on++;
  console.log(`  the Shop's Raid Ticket, ${N} days: in stock on ${pct(on / N)} (want 25%: about 1.75 days a week)`);
  ok(Math.abs(on / N - 0.25) < 0.015, `42. in stock on about a quarter of the days (${pct(on / N)})`);
  while(!S.shopRaidTicketInStockDay(day)) day++;
  ok(S.shopRaidTicketStock() === 1 && S.shopRaidTicketOnShelf() && !S.shopRaidTicketFull(), '42. a stocked day: 1 in stock, on the shelf, buyable');
  st[S.RAID_TICKET_SHOP_KEY] = String(day);
  ok(S.shopRaidTicketStock() === 0 && S.shopRaidTicketSoldOut() && S.shopRaidTicketFull() && S.shopRaidTicketOnShelf(), '42. bought: sold out (stock 0), shown as sold out, no Buy');
  day++; while(S.shopRaidTicketInStockDay(day)) day++;
  ok(!S.shopRaidTicketOnShelf() && S.shopRaidTicketStock() === 0, '42. a day without one: not on the shelf');
  ok(sx.PROGRESS_KEYS.includes(S.RAID_TICKET_SHOP_KEY), '42. the sold-out day travels with the progress');
  ok(/localStorage\.setItem\(RAID_TICKET_SHOP_KEY, String\(itemDay\(\)\)\)/.test(fnSrc('shopRaidTicketCounter')) && /full \? '' : `<button class="btn primary" id="shopBuyRaidTicket"/.test(fnSrc('shopRaidTicketCounter')), '42. buying writes the sold-out day; no Buy button when out of stock'); }

// ======================= 53. packs completely random =======================
{ const pcp = fnSrc('packCardPool'), rpc = fnSrc('rollPackCards');
  ok(/const reach = !gated \|\| adminModeEnabled \? Infinity/.test(pcp) && /const early = gated &&/.test(pcp), '53. a pack draws from its whole pool (no map / rarity / pitching gate unless a caller asks for it)');
  ok(!/newGuaranteed && unowned/.test(rpc) && !/recent\[id\] \*= 0\.6/.test(rpc) && /const recent = \{\};/.test(rpc), '53. no memory: no new-card guarantee, no recent-pull weight');
  // 2026-10-23 (package RW5): each pack has its own tier now, so the drop and the base track read every tier (pool 'basic'), still gated
  ok(/packCardPool\(defs, (1|'basic'), false, true/.test(fnSrc('skirmishDropPick')) && /packCardPool\(getCardDefs\(\), (1|'basic'), true, true\)/.test(fnSrc('baseTrackPool')), '53. the card drop and the base track keep the gate (they are not packs)');
  ok(!/1 new guaranteed/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), '53. the Shop no longer promises a new card'); }

// ======================= 8. Easter eggs in Mystery Boosters =======================
{ ok(/const MYSTERY_EGG_CHANCE = 0\.0005;/.test(src) && /'mysteryEgg'\]\);/.test(constSrc('EASTER_EGG_GRANT_SOURCES')), '8. 0.05% a Mystery Booster card, granted as mysteryEgg');
  const pp = fnSrc('purchasePackOnce');
  ok(/\(pack\.baseId \|\| pack\.id\) === MYSTERY_PACK_ID/.test(pp) && /MYSTERY_EGG_CHANCE/.test(pp) && /eggAt\.has\(i\) \? 'mysteryEgg' : 'shopPack'/.test(pp), '8. only the Mystery Booster rolls it, card by card');
  ok(/source === 'mysteryEgg' && isEasterEgg\(ud\)/.test(fnSrc('unlockCardForPlayer')), '8. the grant gets past "not obtainable" for an Easter egg only');
  const r = seeded(8); let hit = 0; const M = 200000; for(let i = 0; i < M; i++) if(r() < 0.0005) hit++;
  console.log(`  Mystery Booster cards, ${M} rolls: ${hit} Easter eggs (${(hit / M * 100).toFixed(3)}%, want 0.05%)`);
  ok(hit > 60 && hit < 140, '8. about 1 card in 2,000'); }

// ======================= 68. disenchant =======================
{ const D = vm.runInNewContext('(' + constSrc('DISENCHANT_DUST').replace(/^\nconst DISENCHANT_DUST = /, '').replace(/;.*$/, '') + ')', {Object, UPGRADE_COSTS: JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'))}); // 2026-10-23 (HUB2): the table is canonical/upgrade-costs.json
  const want = {common: 5, uncommon: 10, rare: 25, veryrare: 45, superrare: 65, epic: 100, heroic: 150, unique: 250, legendary: 400, mythic: 700, ancient: 1200, divine: 2000, void: 3000, daemonic: 4500};
  Object.entries(want).forEach(([k, v])=> ok(D[k] === v, `68. ${k}: ${v} Magic Dust (got ${D[k]})`));
  ok(/DISENCHANT_DUST\[cardRarityTier\(d\)\]/.test(fnSrc('disenchantValue')) && /1 \+ copyTreatmentBonus\(d, copy\)/.test(fnSrc('disenchantValue')), '68. by rarity tier (special rarities as their tier), treatments still multiply'); }

// ======================= 86. the Nurse =======================
{ const nt = fnSrc('nurseTimeFactor'), gc = fnSrc('grantCardCopy');
  ok(/NURSE_SPEED_PER_POINT/.test(nt) && !/nurse/i.test(gc.replace(/\/\/.*$/gm, '')) && /Math\.random\(\) < SHINY_CHANCE/.test(gc), '86. the Nurse speeds the Nest (2.5% a mastery point, at most half); the Shiny roll never reads it'); }

// ======================= 5, 6, 48. first-clear rewards =======================
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
  const tab = {}; src.slice(src.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), src.indexOf('/* GD5-TABLE-END */')).replace(/'([^']+)': '([^']+)'/g, (m, k, v)=>{ tab[k] = v; });
  const packTab = src.slice(src.indexOf('const SKIRMISH_FIRST_PACKS = {'), src.indexOf('/* RW3-PACKS-END */'));
  let total = 0, nothing = []; const noExcl = [];
  mains.forEach((m, mi)=>{ const sk = m.nodes.filter(n=> (n.kind || 'skirmish') === 'skirmish' && !n.tower && !n.virtual); let ex = 0;
    sk.forEach(n=>{ total++; const excl = cards.some(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key && !c.easterEgg && !c.awaitingSource); if(excl) ex++;
      const pays = excl || tab[m.id + ':' + n.key] || n.firstPack || n.firstFactionPack || (n.rewardTokens || []).length || packTab.includes(`'${m.id}:${n.key}'`); if(!pays) nothing.push(m.id + ':' + n.key);
      const pc = tab[m.id + ':' + n.key]; if(pc) ok(defs[pc] && defs[pc].source && defs[pc].source.kind === 'pack', `6. ${m.id}:${n.key}'s first-clear pack card ${pc} is a pack card`); });
    if(!ex) noExcl.push('Map ' + mi); });
  ok(!nothing.length, `6. every one of the ${total} main-map skirmishes pays something on its first clear (${nothing.join(', ')})`);
  ok(!noExcl.length, `5. every main map has a skirmish-exclusive card (${noExcl.join(', ')})`);
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'rw3-first-rewards-2026-10-23.json'), 'utf8'));
  plan.moves.forEach(x=> ok(defs[x.id] && JSON.stringify(defs[x.id].source) === JSON.stringify(x.to), `5. ${x.id} is ${x.node}'s exclusive now (${JSON.stringify(defs[x.id] && defs[x.id].source)})`));
  const perMap = {}; plan.moves.filter(x=> /GD2-3/.test(x.why)).forEach(x=> perMap[x.map] = (perMap[x.map] || 0) + 1);
  ok(Object.values(perMap).every(n=> n >= 1 && n <= 2), `5. 1-2 cards moved out of the packs on each map that had no exclusive (${JSON.stringify(perMap)})`);
  // 48 (RP3): the Quarry Mole
  const qm = defs['quarry-mole'];
  ok(qm && qm.source && qm.source.kind === 'map' && qm.source.id === 'm4' && qm.source.node === '8-1', '48. the Quarry Mole is the first-clear card of 8-1 (Caves & Alcoves), not Base');
  ok(pools.m4.cards.includes('quarry-mole') && !pools.mf.cards.includes('quarry-mole'), '48. it moved from Thistlewood\'s pool to Caves & Alcoves\'');
  const m4 = G.CONQUEST_MAPS.find(m=> m.id === 'm4'), n81 = m4.nodes.find(n=> n.key === '8-1'), mf = G.CONQUEST_MAPS.find(m=> m.id === 'mf');
  ok(n81.deck['quarry-mole'] > 0 && !mf.nodes.some(n=> (n.deck || {})['quarry-mole']), '48. 8-1 fights with it; Thistlewood\'s decks no longer do');
  ok(/const TUTORIAL_REWARD_RETIRED = new Set\(\['quarry-mole'\]\);/.test(src) && /!TUTORIAL_REWARD_RETIRED\.has\(id\)/.test(fnSrc('tutorialRewardIds')) && !/'quarry-mole'/.test(constSrc('TUTORIAL_REWARD_IDS')), '48. T-1 no longer pays it, whatever the live tutorial config says'); }

// ======================= 23. PvP pools =======================
{ const pc = fnSrc('pvpCandidates'), rec = fnSrc('recordMyPvpDeck');
  ok(/pvpGhostIsStd\(g\) === !!std/.test(pc) && /std \? loadPvpStdDecks\(\) : loadPvpDecks\(\)/.test(pc), '23. Standard and Collection PvP read different pools');
  ok(/livePushGhost\('pvp', PVP_STD_STAGE \+ tier/.test(rec) && /PVP_STD_DECKS_KEY/.test(rec), '23. a Standard deck is recorded into the Standard pool (stage 100 + tier live; its own key here)');
  const g = {out: {}}; vm.createContext(g); vm.runInContext(constSrc('PVP_STD_STAGE').replace(/^\n/, '') + '\n' + fnSrc('pvpGhostIsStd') + '\nout.f = pvpGhostIsStd;', g);
  ok(g.out.f({stage: 103}) && g.out.f({format: 'standard', stage: 2}) && !g.out.f({stage: 3}), '23. a stage-100+ or standard-format ghost is a Standard one');
  const bsd = fnSrc('buildStandardDefs'); ok(!/'foil','shiny'/.test(bsd) && /'prestigeTier'/.test(bsd), '23. Standard keeps foils and Shinies (prestige, Materia and levels still go)'); }

// ======================= 25. the Forge =======================
ok(/COPY_MODEL_VERSION = 3/.test(src) && /copy\.level = copyBaseLevelOf\(id\)/.test(fnSrc('grantCardCopy')), '25. per-copy levels again (move version 3; a new copy at its starting level)');

// ======================= texts =======================
{ const keys = Object.keys(TEXT).filter(k=> /^(ui\.rw3-rt-|toast\.rw3-copy-)/.test(k)); /* results.rw3-card-open is an older package's */ const LEAD = /^[^\p{L}\p{N}{(\[+]+/u;
  const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> [c, Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), fs.existsSync(path.join(ROOT, 'lang', 'ui', c + '.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')) : {})]);
  const miss = []; keys.forEach(k=>{ const en = TEXT[k].replace(LEAD, ''); packs.forEach(([c, p])=>{ if(!(en in p) && !(TEXT[k] in p)) miss.push(c + ':' + k); }); });
  ok(keys.length === 6 && !miss.length, `texts: the ${keys.length} RW3 keys are in all 12 packs (${miss.slice(0, 6).join(', ')})`);
  const used = new Set([...src.matchAll(/'((?:ui|toast)\.rw3-[\w-]+)'/g)].map(m=> m[1])); ok(keys.every(k=> used.has(k)), 'texts: every RW3 key is used'); }

console.log(`rw3-2026-10-23: ${checks - fail}/${checks} ${fail ? fail + ' failed' : 'all passed'}`);
process.exit(fail ? 1 : 0);
