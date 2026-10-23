#!/usr/bin/env node
// 2026-10-23 (package HUB3, owner 19:27 #17: "In the masterhub, there should be a tab called resources - shows you what resources exist in
// the game like fragments and materia - then estimations of how much a dedicated player can earn in a week."): the 🪙 Resources tab's data.
//   node tools/resources_week_2026_10_23.js [--out docs/balance/resources-2026-10-23.json] [--quiet]
// 1. RESOURCES: every currency, material and token the game keeps, where it comes from and what spends it (read off arena_app.js; each row
//    names the constants it was read from, so a rerun after a change shows where to look).
// 2. The week: the game's own numbers (CONQUEST_NODE_REWARDS, RANK_MULT, mapEnergyBase / nodeEnergyCost, ENERGY_*, QUEST_TIERS,
//    QUEST_RANK_REWARD / _WEIGHT, DAILY_QUEST_SLOTS, KIBBLE_FIRST, PvP pay, RAID_POINTS_*, BEER_CAP ...) evaluated here (tools/lib_bramble.js
//    grab), under the ASSUMPTIONS below, for a player farming repeat wins at Map 3, 10 and 20, plus the first-clear road totals and the
//    sessions it takes to clear Gannet Cliffs and reach the Gatorback Swamp's packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const args = process.argv.slice(2), opt = k=>{ const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('out') || path.join(ROOT, 'docs', 'balance', 'resources-2026-10-23.json');
// eslint-disable-next-line no-eval
const ev = name=>{ const s = B.grab(name); const TX = (k, o)=> k + (o ? ' ' + JSON.stringify(o) : ''); void TX; return eval('(' + s.slice(s.indexOf('=') + 1).trim().replace(/;\s*$/, '') + ')'); };
const evMulti = (line, names)=>{ const m = new RegExp('^const ' + line + '.*$', 'm').exec(B.src); if(!m) return {}; return new Function(m[0] + '\nreturn {' + names.join(',') + '};')(); };
const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));

// ---------- the game's numbers ----------
const N = {
  CONQUEST_NODE_REWARDS: ev('CONQUEST_NODE_REWARDS'), RANK_MULT: ev('RANK_MULT'), ENERGY_MAX_BASE: ev('ENERGY_MAX_BASE'), ENERGY_REGEN_MS: 5 * 60 * 1000,
  STAMINA_PLACES: ev('STAMINA_PLACES'), QUEST_TIERS: ev('QUEST_TIERS'), QUEST_RANK_REWARD: ev('QUEST_RANK_REWARD'), QUEST_RANK_WEIGHT: ev('QUEST_RANK_WEIGHT'),
  DAILY_QUEST_SLOTS: ev('DAILY_QUEST_SLOTS'), QUEST_RAID_TICKET_CHANCE: ev('QUEST_RAID_TICKET_CHANCE'), QUEST_KIT_ITEMS: ev('QUEST_KIT_ITEMS'), KIBBLE_FIRST: ev('KIBBLE_FIRST'),
  PVP_TICKETS_PER_DAY: ev('PVP_TICKETS_PER_DAY'), RAID_POINTS_MAX: ev('RAID_POINTS_MAX'), RAID_ATTEMPT_PAY: ev('RAID_ATTEMPT_PAY'), EGG_FIRST_CHANCE: ev('EGG_FIRST_CHANCE'), EGG_REPEAT_MULT: ev('EGG_REPEAT_MULT'),
  NEST_UNLOCKS: ev('NEST_UNLOCKS'), MAP_FREE_PACKS: ev('MAP_FREE_PACKS'), PACK_MATERIA_PCT: ev('PACK_MATERIA_PCT'), STRANGE_MATERIA_DROPS: ev('STRANGE_MATERIA_DROPS'),
  TAVERN_RECRUIT_COST: ev('TAVERN_RECRUIT_COST'), REFINE_LADDER: ev('REFINE_LADDER'), DUNGEON_KEY_CAP_STEPS: ev('DUNGEON_KEY_CAP_STEPS'),
  ...evMulti('RAID_TICKET_ITEM_PRICE', ['RAID_TICKET_ITEM_PRICE', 'RAID_TICKET_ITEM_CAP']), ...evMulti('RENAME_TICKET_PRICE', ['RENAME_TICKET_PRICE', 'RENAME_TICKET_CAP']),
};
Object.assign(N, evMulti('NURTURE_HOURS', ['NURTURE_HOURS', 'NURTURE_COST']), evMulti('FREE_ENERGY_KEY', ['FREE_ENERGY_AMOUNT']), evMulti('BEER_CAP', ['BEER_CAP']), evMulti('SKIRMISH_KIT_PER_DAY', ['SKIRMISH_KIT_PER_DAY', 'KIT_DROP_PER_ENERGY']), evMulti('BABY_GROW_HOURS', ['BABY_GROW_HOURS', 'NEST_SLOTS']));
const PACKS = ev('SHOP_PACKS_DEFAULT').map(p=> ({id: p.id, name: p.name, cards: p.cards, gold: p.cost.gold, gems: p.cost.gems, metal: p.metal || 0}));
const MAIN = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
const nodeEnergyCost = new Function('CONQUEST_MAPS', 'mainConquestMaps', 'baseKind', B.grab('mapEnergyBase') + '\n' + B.grab('nodeEnergyCost') + '\nreturn nodeEnergyCost;')(G.CONQUEST_MAPS, ()=> MAIN, G.baseKind);
const nodeRewardTier = new Function('CONQUEST_NODE_REWARDS', 'baseKind', B.grab('nodeRewardTier') + '\nreturn nodeRewardTier;')(N.CONQUEST_NODE_REWARDS, G.baseKind);

// ---------- 1. every resource ----------
const R = (key, name, icon, kind, from, spent, notes, refs)=> ({key, name, icon, kind, from, spent, notes: notes || '', refs: refs || []});
const RESOURCES = [
  R('gold', 'Maple Leaves', '🍁', 'currency', 'First clears (skirmish 40, elite 70, boss 120 ...) and repeat wins (8 / 14 / 24, x the rank multiplier); daily notices (40-1,100) and the daily / weekly quest tiers; PvP (4 a win); raids (damage / 48); achievements; the Gauntlet, Async and dungeon runs.', 'Packs (50 / 120 / 250, Advanced x12), levelling and the Forge, prestige, finishes (Refine), Nest building and training, Tavern recruits, Energy upgrades (150 a step), dungeon key ring, Raid Tickets (300), Rename Tickets (250).', '', ['CONQUEST_NODE_REWARDS', 'QUEST_TIERS', 'QUEST_RANK_REWARD']),
  R('gems', 'Gold Leaves', '🍂', 'currency', 'S / SS / SSS daily notices (6 / 15 / 30); daily dungeon floors (hidden today, DAILY_DUNGEONS_HIDDEN); raid claims.', 'The Tidemire Chest (10) and Highcrest Case (30), the Prism finish (5), Advanced packs.', 'The rarest everyday currency: a dedicated player sees well under 1 S notice a day.', ['QUEST_RANK_REWARD', 'SHOP_PACKS_DEFAULT']),
  R('dust', 'Magic Dust', '✨', 'currency', 'First clears (20 / 68 / 169); daily notices (the main faucet, ~50-1,200) and quest tiers; raids; elite / boss repeats (5 / 10); melting (disenchanting) cards.', 'Levelling and limit breaks (the Forge road), prestige, finishes, crafting cards, Materia crystals (bench), Nest building and training, Tavern recruits, Max Energy steps, the key ring.', '', ['CONQUEST_NODE_REWARDS', 'DISENCHANT_DUST', 'FORGE_STEP_DUST']),
  R('metal', 'Metal', '🔩', 'currency', 'Weekly quest tiers (3 + 1), a raid win (1), Gauntlet / Async / dungeon runs (2), SSS notices (3), the Tidemire Chest (1), achievements.', 'Nothing spends it today (no cost lists Metal); raid claims weigh it.', 'Earned, never spent: a candidate for the Forge tiers or the Blacksmith.', ['grantCurrency(\'metal\')']),
  R('kibble', 'Kibble', '🦴', 'currency', 'Conquest first clears (1 / 2 / 3 / 5 by kind); repeat wins 15% for 1; a grown baby +2.', 'Training a Level-0 card to Level 1 in the Nest (2, +1 per card of that species already raised, up to 8).', '', ['KIBBLE_FIRST', 'NURTURE_COST']),
  R('beer', 'Beer', '🍺', 'currency', '1 every Monday once the Tavern is open, +1 for each of the first two weekly quest tiers; you hold at most 3.', 'Tavern recruits (1 each, with Dust and Maple Leaves; a Rare also an Iron Shard).', '', ['BEER_CAP', 'TAVERN_RECRUIT_COST']),
  R('laurels', 'Laurels', '🌿', 'currency', 'PvP only: 3 a win, 2 a draw, 1 a loss.', 'Nothing yet (planned: a Laurel shelf, cosmetics, Arena cards).', 'Earned, never spent.', ['settlePvpAfterMatch']),
  R('kroon', 'Krooni', '👑', 'retired', 'Retired (TU2, 2026-10-23); the Highcrest Case no longer gives them.', 'Nothing.', 'Admin Mode only.', ['KROONI_RETIRED']),
  R('food', 'Food tokens', '🍯', 'retired', 'Retired 2026-10-11.', 'Nothing.', 'Old saves only.', []),
  R('energy', 'Energy', '⚡', 'stamina', `1 every 5 minutes (288 a day) up to the cap: ${N.ENERGY_MAX_BASE}, raised to 30 (Nest), 50 (Forge), 60 (Tavern) with Dust and Materia; +${N.FREE_ENERGY_AMOUNT} free a day; Energy capsules (+8, from rewards).`, 'Conquest fights: 1-2 a fight on Maps 0-1, 4 on Map 3, 7 on Map 10, 2x for bosses (mapEnergyBase); Sweeps.', '', ['ENERGY_MAX_BASE', 'ENERGY_REGEN_MS', 'STAMINA_PLACES', 'mapEnergyBase']),
  R('capsule', 'Energy capsule', '🔋', 'item', 'Reward tokens on some fights and achievements; the Map 2 capsule.', 'Opened for +8 Energy.', '', ['ENERGY_CAPSULE_AMOUNT']),
  R('pvpTickets', 'PvP tickets', '🎟️', 'ticket', `${N.PVP_TICKETS_PER_DAY} a day (1 an hour).`, 'A PvP match each.', '', ['PVP_TICKETS_PER_DAY']),
  R('raidPoints', 'Raid points', '🐙', 'ticket', `1 a day, held up to ${N.RAID_POINTS_MAX}.`, 'A raid attempt each.', '', ['RAID_POINTS_MAX', 'RAID_POINTS_REGEN_MS']),
  R('raidTicket', 'Raid Ticket', '🎫', 'item', 'S notices or better at 40% (~0.6 a week); the shop (300 Maple Leaves, sometimes in stock); quests.', 'An extra raid attempt.', 'Owner 19:27 #16: should cost more and need some advanced resources.', ['QUEST_RAID_TICKET_CHANCE', 'RAID_TICKET_ITEM_PRICE']),
  R('dungeonKey', 'Dungeon keys / tickets', '🗝️', 'ticket', 'A daily dungeon ticket each day (hold 3); the key ring holds 3-5 (upgrade 800 / 2,000 Maple Leaves + Strange Materia).', 'Entering a daily dungeon (hidden today).', '', ['DUNGEON_TICKETS_CAP', 'DUNGEON_KEY_CAP_STEPS']),
  R('renameTicket', 'Rename Ticket', '🎫', 'item', 'The shop (250 Maple Leaves); a gift before 2026-10-26.', 'Renaming your guild.', '', ['RENAME_TICKET_PRICE']),
  R('kitItems', 'Field-kit items', '🎒', 'item', 'Conquest wins (2% per Energy used, at most 3 a day), A+ notices (1-3), weekly tiers (3 / 2 / 1), item bosses (from Map 12), the shop.', 'Used in a fight (Draught, Kindling, Scout map, Firepot, Honeycake, Whetstone, Caltrops); hold 5 each.', '', ['SKIRMISH_KIT_PER_DAY', 'KIT_DROP_PER_ENERGY', 'ITEM_CAP']),
  R('ironShard', 'Iron Shard (Materia)', '⛓️', 'materia', 'Elite first clear 1, boss 2, raid / final boss 3; any repeat win 15%.', 'Max Energy steps, Rare Tavern recruits, Blacksmith equipment.', 'Materia are collection cards (cardType materia).', ['rollMateriaDrops']),
  R('riverPearl', 'River Pearl (Materia)', '🦪', 'materia', 'Boss first clear 1.', 'Max Energy steps, Blacksmith.', '', ['rollMateriaDrops']),
  R('temperingStone', 'Tempering Stone (Materia)', '🪨', 'materia', 'Boss first clear 1, raid / final boss 2; elite / boss repeats 5%.', 'Max Energy (Forge, Tavern steps).', '', ['rollMateriaDrops']),
  R('emberCore', 'Ember Core (Materia)', '🔥', 'materia', 'Raid / final boss first clear 1; an SS / SSS win 10%.', 'Blacksmith (Siege Hammer, Dragonscale Mail, Lava Waders).', '', ['rollMateriaDrops']),
  R('dragonScale', 'Dragon Scale (Materia)', '🐉', 'materia', 'The Scale Trail.', 'Dragonscale Mail.', '', []),
  R('abyssalInk', 'Abyssal Ink (Materia)', '🦑', 'materia', 'The raid.', 'Blacksmith.', '', []),
  R('strangeMateria', 'Strange Materia', '🌀', 'materia', `Map bosses' first clears (Maps ${Object.keys(N.STRANGE_MATERIA_DROPS).join(', ')}: ${Object.values(N.STRANGE_MATERIA_DROPS).join(' / ')}).`, 'Forge tier upgrades, the key ring.', '', ['STRANGE_MATERIA_DROPS', 'FORGE_TIERS']),
  R('materiaCrystal', 'Materia crystals (Ember, Tide, Grove, Stone)', '💎', 'materia', 'Crafted on the Forge bench from Magic Dust.', 'Enchanting a card (one socket).', '', ['MATERIA_KINDS', 'MATERIA_DUST_COST']),
  R('materiaUnit', 'Materia Unit / Mote', '⚖️', 'unit', 'A unit of account, not held: a Unit = ' + JSON.stringify(UC.materiaUnit) + ', a Mote = the Unit / ' + UC.moteDivisor + '.', 'Prices the Forge road (Lv 0 to 1 costs a Mote).', '', ['MATERIA_UNIT', 'MATERIA_MOTE']),
  R('trophyShards', 'Trophy shards (per raid)', '🏆', 'shard', 'Raid attempts and claims.', 'Crafting that raid\'s cards in the Forge\'s Raid tab.', '', ['raidShardName', 'RaidM.raidRecipeFor']),
  R('cloudShards', 'Cloud shards (raid)', '☁️', 'shard', 'The online raid.', 'Raid claims.', 'Server-side column.', ['cloudShardsColumnMissing']),
  R('forgeCredit', 'Forge credit', '🔨', 'credit', 'Fusing duplicates (a share of the card\'s road, by rarity: duplicateDivisor).', 'Levelling that card.', '', ['DUPLICATE_DIVISOR', 'forgeCreditOf']),
  R('castleSpares', 'Bramble spares', '🏰', 'credit', 'A map boss beaten again at S+; bramble drops.', 'Fused into that bramble\'s road (Reinforce).', '', ['addCastleDuplicate']),
  R('fragments', 'Upgrade fragments (finishes)', '🌈', 'planned', 'Not in the game yet (owner 19:27 #14: "Foil treatment upgrade fragments needed / bars need 10% more").', 'Finishes are paid in Dust, Maple Leaves and Gold Leaves today (REFINE_LADDER).', 'Planned.', ['REFINE_LADDER']),
  R('eggs', 'Eggs', '🥚', 'nest', 'First clears 2-20% by kind, repeats 0.1% per Energy x kind, raids 1%; guaranteed on Map 1 (1-3) and Map 3.', 'Set in a nest: hatch in 6-10 h into a random Common-Rare card of the egg\'s type at Level 0.', '', ['EGG_FIRST_CHANCE', 'EGG_REPEAT_MULT', 'EGG_KINDS']),
  R('babies', 'Rescued babies', '🍼', 'nest', 'A 6% rescue after any won Conquest fight.', 'Grow in a nest in 4 h into a random card of its type at Level 0 (+2 Kibble).', '', ['rollBabyRescue', 'BABY_GROW_HOURS']),
  R('freePacks', 'Free / faction packs', '🎁', 'pack', 'Map bosses (MAP_FREE_PACKS: Maps ' + Object.keys(N.MAP_FREE_PACKS).join(', ') + '), Map 0\'s 0-2 faction pack, first-clear pack cards.', 'Opened at once.', '', ['MAP_FREE_PACKS', 'FACTION_PACKS']),
  R('xp', 'Player XP / Hero XP', '⭐', 'progress', 'Wins and notices (25-750 XP).', 'Levels and milestones.', '', ['QUEST_RANK_REWARD', 'heroGainXp']),
  R('inFight', 'In-fight resources (Lumber, Stone, Metal ore, Grace, Devilry, Acorns, fight Gold)', '🪵', 'in-fight', 'Cards and brambles during a fight.', 'Card costs during that fight; nothing carries over.', 'Listed for completeness; not saved.', ['KEYWORD_RESOURCES']),
];

// ---------- 2. assumptions ----------
const A = {
  awakeHours: 16, // the player checks in often enough while awake that Energy never sits at the cap
  winShare: 1, // repeat farming of a fight already cleared: every fight won
  rank: 'S', // repeat wins at S (x RANK_MULT)
  noticesPerDay: 6, // every notice taken and finished (3 at midnight, 6 AM, 12 PM, 6 PM)
  dailyTiers: 3, weeklyTiers: 3, // all quest tiers finished
  pvpPerDay: N.PVP_TICKETS_PER_DAY, pvpWin: 0.55,
  raidsPerDay: 1, raidDamage: 600, // 1 raid point a day; ~600 damage a fight (weekly goal 4,000 over ~7 fights)
  farmKind: 'skirmish', // the cheapest repeat: a skirmish of the reach map (not its first fight, which can be cheaper)
  energyCapAt: {0: 20, 3: 30, 10: 50, 20: 60}, // Max Energy bought as soon as each place opens (Nest Map 3, Forge Map 11, Tavern later)
  session: {minutes: 45, minutesPerFight: 3, winRate: 0.75}, // a play session: 45 min, ~3 min a fight with the speed-up, 75% of first tries won
};
const capAt = m=>{ let c = A.energyCapAt[0]; Object.keys(A.energyCapAt).map(Number).sort((a, b)=> a - b).forEach(k=>{ if(m >= k) c = A.energyCapAt[k]; }); return c; };
const energyPerDay = m=> A.awakeHours * 12 + capAt(m) + N.FREE_ENERGY_AMOUNT;
const noticeEV = (()=>{ const o = {gold: 0, dust: 0, gems: 0, metal: 0, xp: 0}; let raidT = 0, kit = 0; Object.entries(N.QUEST_RANK_WEIGHT).forEach(([r, w])=>{ const p = w / 100, rw = N.QUEST_RANK_REWARD[r] || {}; Object.keys(o).forEach(k=> o[k] += p * (rw[k] || 0)); raidT += p * (N.QUEST_RAID_TICKET_CHANCE[r] || 0); kit += p * ((N.QUEST_KIT_ITEMS.daily || {})[r] || 0); }); return Object.assign(o, {raidTickets: raidT, kit}); })();
const tierSum = (list, n)=> list.slice(0, n).reduce((a, t)=>{ Object.entries(t.reward).forEach(([k, v])=> a[k] = (a[k] || 0) + v); return a; }, {});
const dailyT = tierSum(N.QUEST_TIERS.daily, A.dailyTiers), weeklyT = tierSum(N.QUEST_TIERS.weekly, A.weeklyTiers);
function farmNode(mapNo){ const m = MAIN[mapNo]; const ns = m.nodes.filter(n=> n.kind !== 'tutorial' && n.deck && G.baseKind(n.kind || 'skirmish') === A.farmKind); return {map: m, node: ns[1] || ns[0]}; }
function week(mapNo){
  const {map, node} = farmNode(mapNo), cost = nodeEnergyCost(map, node), tier = nodeRewardTier(node), mult = N.RANK_MULT[A.rank] || 1;
  const E = energyPerDay(mapNo), fights = Math.floor(E / cost), d = 7;
  const w = {
    gold: d * (fights * tier.repeat.gold * mult + A.noticesPerDay * noticeEV.gold + (dailyT.gold || 0) + A.pvpPerDay * (A.pvpWin * 4 + (1 - A.pvpWin) * 1) + A.raidsPerDay * A.raidDamage / N.RAID_ATTEMPT_PAY.goldPer) + (weeklyT.gold || 0),
    dust: d * (fights * tier.repeat.dust * mult + A.noticesPerDay * noticeEV.dust + (dailyT.dust || 0) + A.pvpPerDay * A.pvpWin * 0.25 + A.raidsPerDay * A.raidDamage / N.RAID_ATTEMPT_PAY.dustPer * 3) + (weeklyT.dust || 0),
    gems: d * A.noticesPerDay * noticeEV.gems,
    metal: d * (A.noticesPerDay * noticeEV.metal + A.raidsPerDay * 0.5) + (weeklyT.metal || 0),
    kibble: d * fights * 0.15, laurels: d * A.pvpPerDay * (A.pvpWin * 3 + (1 - A.pvpWin) * 1), beer: Math.min(N.BEER_CAP, 1 + Math.min(2, A.weeklyTiers)),
    ironShard: d * fights * 0.15, temperingStone: 0, raidTickets: d * A.noticesPerDay * noticeEV.raidTickets,
    kitItems: d * Math.min(N.SKIRMISH_KIT_PER_DAY, fights * cost * N.KIT_DROP_PER_ENERGY) + d * A.noticesPerDay * noticeEV.kit + [3, 2, 1].slice(0, A.weeklyTiers).reduce((a, b)=> a + b, 0),
    eggs: d * fights * Math.min(1, 0.001 * cost * (N.EGG_REPEAT_MULT[A.farmKind] || 1)), babies: d * fights * 0.06, cardDrops: d * fights * 0.01,
    energy: d * E, fights: d * fights, xp: d * A.noticesPerDay * noticeEV.xp,
  };
  Object.keys(w).forEach(k=> w[k] = Math.round(w[k] * 10) / 10);
  const packs = {bronze: Math.floor(w.gold / PACKS.find(p=> p.id === 'bronze').gold)};
  return {map: mapNo, mapName: map.name, farm: node.key, energyPerFight: cost, energyPerDay: E, fightsPerDay: fights, repeatPay: tier.repeat, week: w, hedgerowPouchesAffordable: packs.bronze,
    split: {conquestGold: Math.round(d * fights * tier.repeat.gold * mult), noticeGold: Math.round(d * A.noticesPerDay * noticeEV.gold), questTierGold: Math.round(d * (dailyT.gold || 0) + (weeklyT.gold || 0)), noticeDust: Math.round(d * A.noticesPerDay * noticeEV.dust), questTierDust: Math.round(d * (dailyT.dust || 0) + (weeklyT.dust || 0))}};
}
// first clears along the road (main maps), and the sessions to reach Map 3's end and Map 5 (the Hedgerow Pouch goes on sale at Map 5)
const road = []; let accG = 0, accD = 0, accE = 0, accF = 0;
MAIN.forEach((m, i)=>{ m.nodes.filter(n=> n.kind !== 'tutorial' && n.deck).forEach(n=>{ const t = nodeRewardTier(n); if(t){ accG += t.first.gold; accD += t.first.dust; } accE += nodeEnergyCost(m, n); accF++; });
  road.push({map: i, name: m.name, fights: accF, energy: accE, gold: accG, dust: accD}); });
// A session starts with a full cap (sessions are hours apart) and regains 1 Energy per 5 minutes while it lasts; a lost fight costs its
// Energy too. Sessions = the larger of (attempts / fights a session) and (Energy needed / Energy a session); the tutorials are free.
function sessionsTo(mapNo){ const r = road[mapNo], attempts = r.fights / A.session.winRate, energy = r.energy / A.session.winRate;
  const perFights = Math.floor(A.session.minutes / A.session.minutesPerFight), perEnergy = capAt(0) + A.session.minutes / 5;
  return {sessions: Math.round(Math.max(attempts / perFights, energy / perEnergy) * 10) / 10, byTime: Math.round(attempts / perFights * 10) / 10, byEnergy: Math.round(energy / perEnergy * 10) / 10,
    attempts: Math.round(attempts), energy: Math.round(energy), energyPerSession: perEnergy, fightsPerSession: perFights}; }
const sessions = {gannetCleared: Object.assign({map: 3}, sessionsTo(3)), gatorReached: Object.assign({map: 5, note: 'Maps 0-4 cleared: Map 5 (Gatorback Swamp) opens the Hedgerow Pouch (50 Maple Leaves)'}, sessionsTo(4)), goldAtMap4: road[4].gold};

const out = {generated: new Date().toISOString().slice(0, 10), tool: 'node tools/resources_week_2026_10_23.js', assumptions: A, numbers: {noticeEV, dailyTiers: dailyT, weeklyTiers: weeklyT, packs: PACKS, energyCapAt: A.energyCapAt},
  resources: RESOURCES, weeks: [3, 10, 20].map(week), road: road.filter(r=> [0, 1, 2, 3, 4, 5, 7, 10, 13, 15, 20].includes(r.map)), sessions};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
if(!args.includes('--quiet')){
  out.weeks.forEach(w=> console.log(`Map ${w.map} (${w.mapName}, farm ${w.farm}, ${w.energyPerFight}⚡ a fight, ${w.energyPerDay}⚡/day, ${w.fightsPerDay} fights/day):`, JSON.stringify(w.week), 'split', JSON.stringify(w.split)));
  console.log('notice EV', JSON.stringify(noticeEV)); console.log('road', JSON.stringify(out.road)); console.log('sessions', JSON.stringify(sessions));
  console.log('->', path.relative(ROOT, OUT));
}
