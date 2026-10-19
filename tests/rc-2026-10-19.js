#!/usr/bin/env node
// 2026-10-19 (package RC, owner 09:53: "Raids almost never give raid cards. only maybe pack cards or faction cards (maybe), raid cards
// must be crafted in the Forge. Under a special tab."):
//   1. one place holds the raid-card chance (RaidM.RAID_CARD_DROP_CHANCE, 1-2%); seeded, 2,000 claims and 2,000 won raid fights each
//      give a raid card in fewer than 3% of runs; the rest are pack / faction cards at the level's rarity floor
//   2. trophy shards scale with the participation level and the standing; a held raid pays a share
//   3. the Forge's Raid tab: recipes by rarity; a craft deducts exactly and grants one Level-1 copy; short / unseen: nothing paid
//   4. shards stored with the currencies (load, cloud pull, cloud push with the missing-column fallback); the proposed SQL
//   5. the reward and rules texts no longer promise raid cards; TX keys + 12 packs
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const raidSrc = fs.readFileSync(path.join(ROOT, 'bramblewood-raid.js'), 'utf8');
const EGG_SRC = (src.match(/\nconst EASTER_EGG_IDS = [^\n]*/) || [''])[0] + '\n';   // 2026-10-19 (EE merge): raidCardIds leaves Easter eggs out
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'))[0];
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const seeded = seed=>{ let a = seed >>> 0; return ()=>{ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// ---- fake pools: 20 pack cards over the rarities, 5 faction cards, the Goliath's 7
const RAR = ['common', 'common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'uncommon', 'uncommon', 'rare', 'rare', 'rare', 'veryrare', 'veryrare', 'superrare', 'epic', 'epic', 'heroic', 'legendary', 'mythic'];
const defs = {};
RAR.forEach((r, i)=> defs['pk' + i] = {id: 'pk' + i, name: 'Pack ' + i, rarity: r, source: {kind: 'pack', tier: 1}});
['common', 'uncommon', 'rare', 'rare', 'epic'].forEach((r, i)=> defs['fc' + i] = {id: 'fc' + i, name: 'Faction ' + i, rarity: r, source: {kind: 'pack', tier: 11}});
[['inkcloud-squid', 'common'], ['abyss-lantern-squid', 'uncommon'], ['glass-octopus', 'rare'], ['vampire-squid', 'rare'], ['goliath-tentacle', 'epic'], ['goliath-broodmother', 'legendary'], ['fathom-leviathan', 'legendary']]
  .forEach(([id, r])=> defs[id] = {id, name: id, rarity: r, source: {kind: 'raid', id: 'goliath'}});
const W = {common: 6, uncommon: 3, rare: 1.5, veryrare: 1, superrare: 0.8, epic: 0.6, heroic: 0.4, legendary: 0.25, mythic: 0.1};
const pools = {pack: Object.keys(defs).filter(id=> /^pk/.test(id)), faction: Object.keys(defs).filter(id=> /^fc/.test(id)), raid: Object.keys(defs).filter(id=> defs[id].source.kind === 'raid'),
  rarityOf: id=> defs[id].rarity, weight: id=> W[defs[id].rarity] || 1};

// ======================= 1. raid cards almost never =======================
ok(R.RAID_CARD_DROP_CHANCE >= 0.01 && R.RAID_CARD_DROP_CHANCE <= 0.02, `1. the raid-card chance is tiny (${R.RAID_CARD_DROP_CHANCE})`);
ok((raidSrc.match(/const RAID_CARD_DROP_CHANCE = /g) || []).length === 1 && /almost never/.test(raidSrc.slice(Math.max(0, raidSrc.indexOf('const RAID_CARD_DROP_CHANCE') - 600), raidSrc.indexOf('const RAID_CARD_DROP_CHANCE'))), '1. stated once, with the owner\'s "almost never"');
ok(!/RAID_CARD_DROP_CHANCE\s*=/.test(src) && (src.match(/RaidM\.RAID_CARD_DROP_CHANCE/g) || []).length >= 1, '1. the page reads it from the raid module (no second number)');
const st = (fights, dmg, extra)=> Object.assign({defeated: true, fraction: 0, fightsBy: {me: fights}, contributors: Object.assign({me: dmg}, Object.fromEntries(Array.from({length: 30}, (_, i)=> ['o' + i, 20000 + i])))}, extra || {});
const LEVELS = [[3, 2000], [4, 12000], [5, 60000]];
{ const rnd = seeded(20261019); let withRaid = 0, noCards = 0, total = 0; const floorsOk = {participant: true, competent: true, leading: true};
  for(let i = 0; i < 2000; i++){
    const [f, d] = LEVELS[i % 3], rw = R.raidReward(goliath, st(f, d), 'me', {});
    const got = R.rollRaidRewardCards(rw, pools, rnd); total++;
    if(got.raid.length) withRaid++;
    if(!got.pack.length && !got.faction.length) noCards++;
    const floor = R.raidRarityRank(rw.packFloor); got.pack.concat(got.faction).forEach(id=>{ if(R.raidRarityRank(defs[id].rarity) < floor) floorsOk[rw.level] = false; });
  }
  console.log(`  claims with a raid card: ${withRaid}/${total}`); ok(withRaid / total < 0.03, `1. seeded: ${withRaid} of ${total} claims had a raid card (${(withRaid / total * 100).toFixed(2)}%, under 3%)`);
  ok(noCards === 0, `1. every fall's claim has a pack or faction card (${noCards} without)`);
  ok(floorsOk.participant && floorsOk.competent && floorsOk.leading, `1. the rarity floor holds: Competent uncommon+, Leading rare+ (${JSON.stringify(floorsOk)})`); }
{ let fac = 0, cards = 0; const rnd = seeded(7); const rw = R.raidReward(goliath, st(3, 2000), 'me', {});
  for(let i = 0; i < 2000; i++){ const g = R.rollRaidRewardCards(rw, pools, rnd); fac += g.faction.length; cards += g.pack.length + g.faction.length; }
  ok(fac / cards > 0.05 && fac / cards < 0.16, `1. "maybe" faction cards: ${(fac / cards * 100).toFixed(1)}% of a participant's cards (factionChance ${rw.factionChance})`); }
{ const held = R.raidReward(goliath, st(3, 2000, {defeated: false, fraction: 0.4}), 'me', {over: true});
  ok(held.raidCardChance === 0, '1. a held raid\'s claim never rolls a raid card');
  ok([0, 1, 2].map(i=> R.raidReward(goliath, st(...LEVELS[i]), 'me', {}).raidCardChance).every(c=> c === R.RAID_CARD_DROP_CHANCE), '1. a fall rolls it once, whatever the level'); }
// the won raid fight's drop (raidFightCardDrop), run for real over the fake pools
{ const got = []; let rnd = seeded(99);
  const ctx = {RaidM: R, Math: Object.assign(Object.create(Math), {random: ()=> rnd()}), Object, String, Number, getCardDefs: ()=> defs,
    legendaryHeldBack: ()=> false, PACK_RARITY_WEIGHT: W, factionTrackPool: ()=> pools.faction, packCardPool: ()=> pools.pack.slice(),
    cardDropRarity: ()=> ctx.Math.random() < 0.3 ? 'uncommon' : 'common', unlockCardForPlayer: (id, s)=>{ got.push([id, s]); return true; }};
  vm.createContext(ctx); vm.runInContext(EGG_SRC + ['isEasterEgg', 'raidCardIds', 'raidRewardPools', 'raidFightCardDrop'].map(fnSrc).join('\n') + '\nthis.drop = raidFightCardDrop;', ctx);
  let raid = 0; for(let i = 0; i < 2000; i++){ const id = ctx.drop(goliath); if(id && defs[id].source.kind === 'raid') raid++; }
  console.log(`  raid fights with a raid card: ${raid}/2000`); ok(got.length === 2000 && raid / 2000 < 0.03, `1. seeded: ${raid} of 2,000 won raid fights dropped a raid card (${(raid / 20).toFixed(2)}%); the rest a pack card`);
  ok(got.filter(g=> defs[g[0]].source.kind === 'pack').every(g=> g[1] === 'raidReward'), '1. a pack card from a raid fight is a raid reward (not a card drop)'); }
const settle = fnSrc('settleRaidPartAfterMatch');
ok(/raidFightCardDrop\(def\)/.test(settle) && !/rollCardDrop\(\{kind:'raidWin'/.test(settle), '1. a won raid fight no longer rolls a card of the boss\'s deck');
const claim = fnSrc('claimRaidReward');
ok(/grantRaidRewardCards\(def, rwc\)/.test(claim) && /grantRaidShards\(def\.id, rw\.shards \|\| 0\)/.test(claim) && !/grantRaidCards\(/.test(src), '1. a claim grants reward cards + shards; grantRaidCards is gone');

// ======================= 2. shards by tier =======================
{ const [p, c, l] = LEVELS.map(x=> R.raidReward(goliath, st(...x), 'me', {}));
  ok(p.level === 'participant' && c.level === 'competent' && l.level === 'leading', '2. the three levels');
  ok(p.shards > 0 && c.shards > p.shards && l.shards > c.shards, `2. shards scale with the level (${p.shards} / ${c.shards} / ${l.shards})`);
  const bottom = (f, d)=> R.raidReward(goliath, {defeated: true, fraction: 0, fightsBy: {me: f, a: 5, b: 5}, contributors: {me: d, a: 9e5, b: 8e5}}, 'me', {}); // same standing for all three
  const [bp, bc, bl] = LEVELS.map(x=> bottom(...x));
  ok(bc.cardChance === 0.2 && bc.cards === bp.cards && bl.cards === bp.cards + 1 && bl.cardChance === 0, `2. Competent: a 20% chance of an extra pack card; Leading: one more for certain (${bp.cards}/${bc.cardChance}/${bl.cards})`);
  const T = R.RAID_REWARD_TABLE;
  // a lone raider is the top 1%: +RAID_TIER_SHARDS.top1 on top
  const solo = R.raidReward(goliath, {defeated: true, fraction: 0, fightsBy: {me: 3}, contributors: Object.assign({me: 9e6}, Object.fromEntries(Array.from({length: 199}, (_, i)=> ['o' + i, 1000 + i])))}, 'me', {});
  ok(solo.tier === 'top1' && solo.shards === Math.round(T.participant.shards * 1) + T.participant.extraShards + R.RAID_TIER_SHARDS.top1, `2. the top 1% get ${R.RAID_TIER_SHARDS.top1} more (${solo.shards})`);
  const low = R.raidReward(goliath, {defeated: true, fraction: 0, fightsBy: {me: 3, a: 5, b: 5}, contributors: {me: 1500, a: 9e4, b: 8e4}}, 'me', {});
  ok(low.tier === 'participant' && low.shards === T.participant.shards, `2. a plain participant at the bottom: ${low.shards}`);
  const lowLead = R.raidReward(goliath, {defeated: true, fraction: 0, fightsBy: {me: 5, a: 5, b: 5}, contributors: {me: 50000, a: 9e4, b: 8e4}}, 'me', {});
  ok(lowLead.shards === Math.round(T.leading.shards * 1.4) + T.leading.extraShards, `2. a Leading participant at the bottom: ${lowLead.shards}`);
  const held = R.raidReward(goliath, st(3, 2000, {defeated: false, fraction: 0.4}), 'me', {over: true}), held0 = R.raidReward(goliath, st(3, 2000, {defeated: false, fraction: 1}), 'me', {over: true});
  ok(held.kind === 'compensation' && held.shards === Math.floor(p.shards * 0.5 * 0.6) && held.shards < p.shards && held0.shards === 0, `2. a held raid: its share by Health taken (${held.shards} of ${p.shards}; nothing taken: ${held0.shards})`);
  const tuned = R.raidReward(Object.assign({}, goliath, {rewards: Object.assign({}, goliath.rewards, {shards: 10})}), {defeated: true, fraction: 0, fightsBy: {me: 3, a: 5, b: 5}, contributors: {me: 1500, a: 9e4, b: 8e4}}, 'me', {});
  ok(tuned.shards === 10, `2. a raid's rewards.shards replaces the base (${tuned.shards})`); }

// ======================= 3. the Forge's Raid tab =======================
{ const order = ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'legendary', 'mythic', 'ancient'];
  const costs = order.map(r=> R.raidRecipeFor(goliath, 'x', r));
  ok(costs.every((c, i)=> !i || (c.shards > costs[i - 1].shards && c.dust > costs[i - 1].dust && c.gold > costs[i - 1].gold)), '3. recipes rise with rarity (shards, Dust, Leaves)');
  ok(R.raidRecipeFor({recipes: {foo: {shards: 3}}}, 'foo', 'legendary').shards === 3 && R.raidRecipeFor({recipeCost: {rare: {dust: 1}}}, 'x', 'rare').dust === 1, '3. a raid can override a recipe or a rarity\'s cost');
  const w = {gold: 100, dust: 100, raidShards: {goliath: 5}}, c = {shards: 8, dust: 40, gold: 80};
  ok(R.raidRecipeShort(w, 'goliath', c).map(x=> x.kind).join() === 'shards' && R.payRaidRecipe(w, 'goliath', c) === false && w.raidShards.goliath === 5 && w.dust === 100, '3. short of shards: nothing taken'); }
function forgeCtx(o){
  o = o || {};
  const raidDefs = [Object.assign({}, goliath)], copies = {}, saved = {n: 0}, logs = [];
  const ctx = {RaidM: R, Object, String, Number, Math, isFinite, adminModeEnabled: false, getCardDefs: ()=> defs, allRaidDefs: ()=> raidDefs,
    myCurrencies: Object.assign({gold: 5000, dust: 5000, raidShards: {goliath: 200}}, o.wallet || {}), myCardCopies: copies,
    isCardHiddenForPlayer: d=> !(o.seen || []).includes(d.id), codexRevealedForPlayer: id=> (o.seen || []).includes(id), isUnattainable: ()=> false,
    saveCurrencies: ()=>{ saved.n++; }, logTxn: e=>{ logs.push(e); }, CARD_UNLOCK_SOURCES: {raidCraft: 'Forge: raid recipe'},
    unlockCardForPlayer: (id, s, opts)=>{ (copies[id] = copies[id] || []).push({uid: 'u' + Math.random(), level: 1, shiny: !!(opts && opts.shiny), src: s}); return true; },
    copyLevel: (id, c)=> c.level, copyBaseLevelOf: ()=> 1, saved, logs};
  vm.createContext(ctx);
  vm.runInContext(EGG_SRC + ['isEasterEgg', 'raidCardIds', 'raidCardRevealed', 'raidRecipeOf', 'raidRecipeReady', 'craftRaidCard'].map(fnSrc).join('\n') + '\nthis.craft = craftRaidCard; this.ready = raidRecipeReady;', ctx);
  return ctx;
}
{ const ctx = forgeCtx({seen: ['glass-octopus']}), cost = R.raidRecipeFor(goliath, 'glass-octopus', 'rare'), w0 = JSON.parse(JSON.stringify(ctx.myCurrencies));
  const v = ctx.craft('goliath', 'glass-octopus');
  ok(v && ctx.myCurrencies.raidShards.goliath === w0.raidShards.goliath - cost.shards && ctx.myCurrencies.dust === w0.dust - cost.dust && ctx.myCurrencies.gold === w0.gold - cost.gold,
    `3. a craft deducts exactly ${JSON.stringify(cost)} (shards ${w0.raidShards.goliath} -> ${ctx.myCurrencies.raidShards.goliath})`);
  ok(ctx.myCardCopies['glass-octopus'].length === 1 && v.level === 1 && ctx.myCardCopies['glass-octopus'][0].src === 'raidCraft' && !ctx.myCardCopies['glass-octopus'][0].shiny && ctx.saved.n === 1 && ctx.logs.length === 1,
    '3. ... and grants one plain Level-1 copy (saved, logged)');
  const before = JSON.stringify(ctx.myCurrencies);
  ok(ctx.craft('goliath', 'goliath-broodmother') === null && JSON.stringify(ctx.myCurrencies) === before && !ctx.myCardCopies['goliath-broodmother'], '3. a card not met yet: no craft, nothing paid');
  ok(ctx.craft('goliath', 'pk0') === null && ctx.craft('nope', 'glass-octopus') === null && JSON.stringify(ctx.myCurrencies) === before, '3. not that raid\'s card / no such raid: nothing paid'); }
{ const ctx = forgeCtx({seen: ['fathom-leviathan'], wallet: {raidShards: {goliath: 159}}});
  ok(!ctx.ready(goliath, 'fathom-leviathan') && ctx.craft('goliath', 'fathom-leviathan') === null && ctx.myCurrencies.raidShards.goliath === 159 && ctx.myCurrencies.dust === 5000, '3. one shard short of a Legendary: nothing paid');
  ctx.myCurrencies.raidShards.goliath = 160;
  ok(ctx.ready(goliath, 'fathom-leviathan') && ctx.craft('goliath', 'fathom-leviathan') && ctx.myCurrencies.raidShards.goliath === 0, '3. with exactly enough: crafted, 0 left'); }
{ const modes = src.slice(src.indexOf('const FORGE_MODES = {'), src.indexOf('};', src.indexOf('const FORGE_MODES = {')));
  ok(/raid: \{icon:'🐙', get label\(\)\{ return TX\('ui\.rc-forge-tab'\); \}/.test(modes), '3. the Forge has a 🐙 Raid tab');
  const rf = fnSrc('renderForge');
  ok(/forgeMode==='raid' \? forgeRaidHTML\(\)/.test(rf) && /forgeMode==='facility' \|\| forgeMode==='raid' \? 'hidden'/.test(rf) && /wireForgeRaid\(root\)/.test(rf), '3. renderForge shows it (the card pool hidden) and wires Craft');
  const fh = fnSrc('forgeRaidHTML');
  ok(/raidCardRevealed\(id, d\)/.test(fh) && /ui\.rc-forge-unseen/.test(fh) && /ui\.rc-forge-unknown/.test(fh) && /data-rc-craft/.test(fh), '3. an unseen card is a face-down "?" with its cost; a seen one has Craft');
  ok(/isCardHiddenForPlayer\(d\) && codexRevealedForPlayer\(id, d\)/.test(fnSrc('raidCardRevealed')), '3. the Codex\'s hidden-until-seen rule'); }

// ======================= 4. storage and sync =======================
{ const lc = fnSrc('loadCurrencies'); ok(/raidShards: raidShardsClean\(parsed\.raidShards\)/.test(lc), '4. loadCurrencies keeps the shards');
  const ctx = {Object, Array, Math, Number, String, isFinite}; vm.createContext(ctx); vm.runInContext(fnSrc('raidShardsClean') + '\nthis.c = raidShardsClean;', ctx);
  ok(JSON.stringify(ctx.c({goliath: 12.7, bad: -3, x: 'a', '': 4})) === '{"goliath":12}' && JSON.stringify(ctx.c([1])) === '{}' && JSON.stringify(ctx.c(null)) === '{}', '4. a shard map is cleaned');
  const pull = src.slice(src.indexOf('async function cloudPullState('), src.indexOf('\n}', src.indexOf('async function cloudPullState('))); ok(/raidShards: cur\.raid_shards && typeof cur\.raid_shards === 'object'/.test(pull), '4. a cloud pull reads raid_shards, else keeps this browser\'s');
  const push = fnSrc('cloudPushCurrencies'); ok(/if\(cloudShardsColumn !== false\) row\.raid_shards = /.test(push) && /cloudShardsColumnMissing\(error\)\)\{ cloudShardsColumn = false; delete row\.raid_shards;/.test(push), '4. a cloud push sends raid_shards, and again without it when the column is missing');
  const sqlP = path.join(ROOT, 'supabase', 'proposed', '20261019_raid_shards.sql'), sql = fs.existsSync(sqlP) ? fs.readFileSync(sqlP, 'utf8') : '';
  ok(/PROPOSED, NOT APPLIED/.test(sql) && /add column if not exists raid_shards jsonb/.test(sql) && /guard_raid_shards/.test(sql), '4. supabase/proposed/20261019_raid_shards.sql (not applied)');
  ok(!fs.existsSync(path.join(ROOT, 'supabase', 'migrations', '20261019_raid_shards.sql')), '4. nothing in migrations/'); }

// ======================= 5. texts =======================
{ const KEYS = Object.keys(TEXT).filter(k=> /\.rc-/.test(k));
  ok(KEYS.length >= 20, `5. ${KEYS.length} rc TX keys`);
  KEYS.forEach(k=> ok(src.includes(`'${k}'`), `5. ${k} is used`));
  ok(!('toast.raid-cards' in TEXT), '5. the old "Raid cards: ..." toast is retired');
  ['ui.raid-part-rules-lead', 'ui.raid-rw-leading-what', 'ui.raid-rw-strong-what', 'ui.raid-rw-held-what'].forEach(k=> ok(!/raid card/i.test(TEXT[k]) && /pack card/.test(TEXT[k]) && /trophy shards/.test(TEXT[k]), `5. ${k} promises pack cards and shards, not raid cards`));
  ok(/Forge's Raid tab/.test(TEXT['ui.rc-source-raid']) && /TX\('ui\.rc-source-raid'/.test(src) && !/drops its cards when it falls/.test(src), '5. the Codex source line says crafted in the Forge');
  const panel = src.slice(src.indexOf('<section class="r3-rewards">'), src.indexOf('</section>', src.indexOf('<section class="r3-rewards">')));
  ok(!/one of its own cards|a second card/.test(panel) && /ui\.rc-rw-participant-what/.test(panel) && /ui\.rc-rw-craft/.test(panel), '5. the raid screen\'s "If it falls" lists pack cards, shards and the Forge recipe');
  ok(TX('ui.rc-shard-name', {name: 'Goliath'}) === 'Goliath trophy shards', '5. "Goliath trophy shards"');
  const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u, core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
  const PLACEHOLDER_ONLY = k=> /^[\s+{}\w]*$/.test(TEXT[k].replace(/[a-z]/g, '')) && !/[A-Za-z]{3,}/.test(TEXT[k].replace(/\{\w+\}/g, ''));
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    const miss = KEYS.concat(['ui.raid-part-rules-lead', 'ui.raid-rw-leading-what', 'ui.raid-rw-strong-what', 'ui.raid-rw-held-what']).filter(k=> !PLACEHOLDER_ONLY(k) && !pack[core(TEXT[k])]);
    ok(!miss.length, `5. lang/${c}.json has every new text (missing: ${miss.join(', ')})`); }); }
ok(/^## 2026-10-19 \(package RC: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

setTimeout(()=>{ console.log(fail ? `rc: ${fail} of ${n} checks failed` : `rc: all ${n} checks pass`); process.exit(fail ? 1 : 0); }, 50);
