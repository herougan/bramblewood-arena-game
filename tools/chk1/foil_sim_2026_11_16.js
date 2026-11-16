#!/usr/bin/env node
// 2026-11-16 (package CHK1, alpha checklist C7 "Foil (shiny) distribution"): opens N packs of each pack type through the game's own
// pack code and compares the observed rates with the settled ones (project-state "Shiny": 0.5% a card received [E6]; pack foils
// 1 / 1.5 / 2%, faction packs 1% [RW3-4]; Easter eggs 0.05% a Mystery Booster card [RW3-10]), each with a 95% Wilson interval.
//   node tools/chk1/foil_sim_2026_11_16.js [--packs 100000] [--seed chk1] [--out docs/balance/checklist/chk1-foil-sim-2026-11-16.json]
// The code is arena_app.js's, read the way tools/lib_bramble.js and tools/opt/ref5_prog.js read it (B.grab), not copied: purchasePackOnce
// (rollPackCards, rollPackFoils, pickFoilFinish, the Mystery Booster's Easter egg roll, rollBonusCopy), creditFactionPack, normalizePack /
// advancedPackOf, and every copy credited through unlockCardForPlayer -> grantCardCopy (the Shiny roll). Math.random is a seeded generator
// inside that scope. Stubbed (no bearing on the rates): storage, toasts, currency grants, the pack glow, the free level-up pick, and the
// faction pack's card draw (rollFactionPackCards: three cards of the Hedgerow Pouch; its foil and Shiny rolls are the real ones).
// The game reads a published pack table (card_overrides `__cfg:shop-packs`) before SHOP_PACKS_DEFAULT; this sim reads the shipped default.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const PACKS = +opt('packs', 100000), SEED = opt('seed', 'chk1');
const OUT = path.resolve(ROOT, opt('out', 'docs/balance/checklist/chk1-foil-sim-2026-11-16.json'));
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function mulberry(seed) { let s = seed >>> 0; return () => { let t = (s = (s + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const NAMES = ['SPELLS_SHELVED', 'isHofVariant', 'hofBlocked', 'RARITY_INTRO', 'SIDE_RARITY_INTRO', 'ROAD_MAIN_FROM', 'ROAD_EPIC_HEROIC_FROM', 'ROAD_NEVER', 'roadNever', 'ROAD_RARITY_STEPS', 'ROAD_RARITY_ALIAS', 'roadRarityStep',
  'rarityRevealedForPlayer', 'packCardReached', 'isBasicPackSource', 'packPoolOf', 'BASIC_PACK_POOLS', 'BASIC_PACK_TIERS', 'packCardPool', 'PACK_RARITY_WEIGHT', 'PACK_NUMBER_OF', 'PACK_COMMON_SHARE', 'PACK_UPPER_SHARE',
  'packNumberOf', 'packCommonShare', 'packRarityClass', 'packRarityShares', 'rollPackCards', 'BONUS_COPY_LADDER', 'BONUS_COPY_ALIAS', 'bonusCopyChance', 'RARITY_TIER_BANDS', 'RARITY_DEFS', 'copiesOwned',
  'SHOP_PACKS_DEFAULT', 'PACK_TIER_POOL', 'SHOP_PACKS_COMING_SOON', 'PACK_FOIL_FINISHES_DEFAULT', 'normalizePack', 'RES3_COLLECTOR_CARDS', 'advancedPackOf',
  'SHINY_CHANCE', 'grantCardCopy', 'EASTER_EGG_IDS', 'EASTER_EGG_GRANT_SOURCES', 'UNATTAINABLE_ADMIN_SOURCES', 'isTutorialCopySource', 'isEasterEgg', 'mysteryEggPick', 'MYSTERY_EGG_CHANCE', 'MYSTERY_PACK_ID',
  'pickFoilFinish', 'rollPackFoils', 'rollBonusCopy', 'PACK_JACKPOT_CHANCE', 'PACK_MATERIA_PCT', 'unlockCardForPlayer', 'purchasePackOnce', 'FACTION_PACKS', 'FACTION_PACK_OWN', 'FACTION_PACK_FOIL', 'creditFactionPack'];
const parts = [...new Set(NAMES.map(B.grab))];
// the derived-rarity fill that runs at load (PACK_RARITY_WEIGHT / BONUS_COPY_ALIAS / ROAD_RARITY_ALIAS rows for 'questrare' ...), as the source has it
{ const a = B.src.indexOf('RARITY_DEFS.filter(r=> r.derived).forEach('), b = B.src.indexOf('});', B.src.indexOf('ROAD_RARITY_ALIAS[k] == null', a)) + 3; if (a > 0 && b > a) parts.push(B.src.slice(a, b)); }
const stubs = [
  'const Math = __M; const setTimeout = ()=>0; let adminModeEnabled = false; const liveCards = {}, CARD_DEFS_BASELINE = __D;',
  'const LIMIT_BREAK_DUPS = {}, SPARK_STEP = {}, RATING_WEIGHT = {}, LEVEL_COST_MULT = {}, CC_BANDS = {}, RARITY_MAX_COPIES = {};',
  'let myUnlockedCardIds = new Set(), myCardCopies = {}, myCardDupsLifetime = {}, myCardLevels = {}, copyModelReady = false; const myCurrencies = {gold: 1e15, gems: 1e15};',
  'function __reset(){ myUnlockedCardIds = new Set(); myCardCopies = {}; myCardDupsLifetime = {}; myCardLevels = {}; }',
  'function pitchingUnlocked(){ return true; } function trackMapReached(){ return __rt.reach; } function conquestMapCleared(){ return false; } function econScaleTable(s, t){ return t; }',
  'function lifetimeDuplicates(id){ return myCardDupsLifetime[id] | 0; } function ensureCopyModel(){} function saveCardCopies(){} function hatchlingIds(){ return new Set(); } function showToast(){} const SoundKit = {};',
  'function loadPitchHeld(){ return []; } function tutorialCopyLevel0(){} function factionCopyLevel0(){} function babyCopyLevel0(){} function eggChoiceForNewCopy(){} function noteSighted(){} function noteGainedForSwap(){}',
  'function saveUnlockedCardIds(){} function logTxn(){} const CARD_UNLOCK_SOURCES = {}; function canLeadDef(){ return false; } function loadDialogueFlags(){ return {}; }',
  'function grantCurrency(){} function econPay(a, b, v){ return v; } function MU(x){ return x; } function seenCardIds(){ return new Set(); } function ui9PackLevelPick(){ return null; } function getCardLevel(){ return 1; } function rollPackGlow(){ return null; }',
  'function factionPackPool(){ return ["x"]; } function rollFactionPackCards(fp){ return {pulls: rollPackCards(normalizePack(SHOP_PACKS_DEFAULT[0])).map(id=> ({id, from:"own"})), bonus: null}; }',
  'function noteFactionReceived(){} function queueMultiDeckSwap(){} function bumpQuestCounter(){}',
].join('\n');
const env = { getCardDefs: () => D, isUnattainable: G.isUnattainable, isEquipmentDef: d => !!(d && (d.cardType === 'equipment' || d.equip)), cardSourceOf: G.cardSourceOf, basicPackTierOf: G.basicPackTierOf,
  cardFirstMapList: G.cardFirstMapList, maxCopiesForRarity: G.maxCopiesForRarity, cardBaseLevel: G.cardBaseLevel, statsAtLevel: G.statsAtLevel, TX: (k, o) => k, antiqueCheck: () => ({ ok: false }) };
const rt = { rnd: Math.random, reach: 20 };
const MathS = Object.create(Math); MathS.random = () => rt.rnd();
const keys = Object.keys(env);
const ret = '\nreturn {purchasePackOnce, creditFactionPack, normalizePack, advancedPackOf, SHOP_PACKS_DEFAULT, FACTION_PACKS, FACTION_PACK_FOIL, SHINY_CHANCE, MYSTERY_EGG_CHANCE, MYSTERY_PACK_ID, EASTER_EGG_IDS, packCardPool, copies: ()=> myCardCopies, reset: __reset};';
const P = new Function('__M', '__rt', '__D', ...keys, stubs + '\n' + parts.join('\n') + ret)(MathS, rt, D, ...keys.map(k => env[k]));

// Wilson 95% interval
function wilson(k, n) { if (!n) return [0, 0]; const z = 1.96, p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [c - h, c + h]; }
const pct = x => Math.round(x * 1e5) / 1e3; // as a percentage, 3 decimals
function rate(name, k, n, settled) { const ci = wilson(k, n); return { name, k, n, observed: pct(k / n), ci95: [pct(ci[0]), pct(ci[1])], settled: settled == null ? null : pct(settled), pass: settled == null ? null : settled >= ci[0] && settled <= ci[1] }; }

const eggSet = new Set(P.EASTER_EGG_IDS);
function run(label, pack, settledFoil, open) {
  P.reset(); rt.rnd = mulberry(fnv(SEED + '|' + label));
  let cards = 0, foil = 0, shinyRes = 0, bonus = 0, eggs = 0, mysteryCards = 0;
  const t0 = Date.now();
  for (let i = 0; i < PACKS; i++) {
    const o = open(); if (!o) continue; o.results.forEach(r => { cards++; if (r.foil) foil++; if (r.shiny) shinyRes++; if (r.bonusCopy) bonus++; if (eggSet.has(r.id)) eggs++; });
  }
  // every copy credited (the pulls and their bonus copies), read back from the collection: the Shiny rate a card received, the eggs credited
  let copies = 0, shinyCopies = 0, eggCopies = 0; Object.entries(P.copies()).forEach(([id, a]) => { copies += a.length; shinyCopies += a.filter(c => c.shiny).length; if (eggSet.has(id)) eggCopies += a.length; });
  const out = { label, pack: { id: pack.id, name: pack.name, cards: pack.cards, foilChance: pack.foilChance, mainFoilChance: pack.mainFoilChance || null }, packs: PACKS, ms: Date.now() - t0,
    rates: [rate('foil per card', foil, cards, settledFoil), rate('Shiny per card pulled', shinyRes, cards, 0.005), rate('Shiny per copy credited (info; a bonus copy matches its card)', shinyCopies, copies, null), rate('bonus copies per card (info)', bonus, cards, null)] };
  if ((pack.baseId || pack.id) === P.MYSTERY_PACK_ID) out.rates.push(rate('Easter egg per card (credited)', eggCopies - 0, cards, 0.0005), rate('Easter egg per card (rolled, info)', eggs, cards, null));
  out.copies = copies; out.eggCopies = eggCopies;
  return out;
}
const packs = P.SHOP_PACKS_DEFAULT.map(P.normalizePack), byId = Object.fromEntries(packs.map(p => [p.id, p]));
const SETTLED = { bronze: 0.01, silver: 0.015, gold: 0.02, mystery: 0.02 };
const res = [];
for (const id of ['bronze', 'silver', 'gold', 'mystery']) { const p = byId[id]; res.push(run(id, p, SETTLED[id], () => P.purchasePackOnce(p, true))); }
res.push(run('faction-otter', { id: 'fp-otter', name: P.FACTION_PACKS.otter.name, cards: 3, foilChance: P.FACTION_PACK_FOIL }, 0.01, () => { const c = P.creditFactionPack('otter'); return c && c.o; }));
// Collector packs (Map 30+, outside Maps 0-20; RW3-4: 10x on their cards): info rows
for (const id of ['bronze', 'silver', 'gold']) { const a = P.advancedPackOf(byId[id]); res.push(run(id + '-collector', a, SETTLED[id] * 10, () => P.purchasePackOnce(a, true))); }
const out = { tool: 'node tools/chk1/foil_sim_2026_11_16.js', generated: new Date().toISOString(), packsPerType: PACKS, seed: SEED,
  constants: { SHINY_CHANCE: P.SHINY_CHANCE, MYSTERY_EGG_CHANCE: P.MYSTERY_EGG_CHANCE, FACTION_PACK_FOIL: P.FACTION_PACK_FOIL, foilChance: Object.fromEntries(packs.map(p => [p.id, p.foilChance])) }, results: res };
fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
res.forEach(r => r.rates.forEach(x => console.log(`${r.label.padEnd(18)} ${x.name.padEnd(48)} ${String(x.k).padStart(7)}/${x.n} = ${x.observed}% [${x.ci95[0]}, ${x.ci95[1]}] settled ${x.settled == null ? '-' : x.settled + '%'} ${x.pass == null ? '' : x.pass ? 'PASS' : 'FAIL'}`)));
console.log('->', path.relative(ROOT, OUT));
