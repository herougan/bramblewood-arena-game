#!/usr/bin/env node
// Package FG (2026-10-19, owner 23:43, + the owner's 2026-10-21 additions):
//   5. "Extras are defined as cards beyond the max deck limit for that rarity. So for commons, having 5 is not considered 'extra'." —
//      copiesBeyondCap / disenchantableCopies / fuseAllCountFor / meltCardValue: never below the deck limit (Common 10)
//   2. the Fuse tab: fusePreview / fuseCreditReach / fuseCopies (what a fuse gives, the extras only for Fuse all)
//   3. Reinforce: reinforcePreview (current → next, the cost after credit, the gate, the same answer as castleCanTemper)
//   A. (10-21) "forge forges ALL cards of a particular suite" made every copy share the card's level; RW3 (10-23, owner: "go back to
//      card-based") puts each copy's level back (version 3 move: no level lost) and keeps the card's Forge credit
//   B. (10-21) the cost curve: +10% overall, Lv 0→7 a little less than 8→10, the limit break 2× the road
//   C. (10-21) Reset Forge progress: every card to its starting level, tutorial / hatched cards to Level 0, credit and Prestige gone
//   6. the foil-upgrade name is one TX key; 1. the hatch egg sits on its rays' centre; TX keys in all 12 packs
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const MAXC = vm.runInNewContext(between('const RARITY_MAX_COPIES = {', '};') + '; RARITY_MAX_COPIES');
const copyBlock = between('// CARD_COPIES_NF:BEGIN', '// CARD_COPIES_NF:END'), resetBlock = between('// FORGE_RESET_FG:BEGIN', '// FORGE_RESET_FG:END');
const refine = between('const REFINE_LADDER = [', '];') + '\n' + fnSrc('copyRefineRank');
ok(copyBlock.length > 2000 && resetBlock.length > 500, 'the CARD_COPIES_NF and FORGE_RESET_FG blocks are there');
const forgeFns = ['disenchantableCopies', 'disenchantSummary', 'meltCardValue', 'meltCard', 'forgeCreditOf', 'addForgeCredit', 'spareCopyIndex', 'feedDuplicate', 'spendForgeCredit',
  'forgeSetCopyLevel', 'forgeCopyLevel', 'spareDuplicatesTotal', 'fuseAllPlan', 'fuseAllDuplicates', 'fuseSpareCount', 'fuseCreditReach', 'fusePreview', 'fuseCopies', 'levelUpCostRaw', 'forgeSpentOn', 'limitBreakCost'];
forgeFns.forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
const STEP = between('const FORGE_STEP_DUST = ', ';') + '\n' + between('const LIMIT_BREAK_COST_MULT = ', ';');
function make(o){
  o = o || {};
  const BASE = Object.assign({
    c: {id:'c', name:'Common C', attack:10, health:10, rarity:'common'}, u: {id:'u', name:'Uncommon U', attack:5, health:5, rarity:'uncommon'},
    r: {id:'r', name:'Rare R', attack:5, health:5, rarity:'rare'}, l: {id:'l', name:'Legend L', attack:9, health:9, rarity:'legendary'},
    b: {id:'b', name:'Base B', attack:4, health:6, rarity:'common', src:'base', base:1}, t: {id:'t', name:'Tut T', attack:4, health:6, rarity:'common'},
  }, o.defs || {});
  const ctx = {localStorage: fakeStorage(), Date, Math, JSON, Number, String, Object, Array, Set, Map, TX, console,
    CARD_DEFS_BASELINE: BASE, liveCards: {}, LIMIT_BREAK_LEVEL: 11, HERO_ID: 'hero', standardMatchActive: false, MATERIA_MOTE: {dust: 15, gold: 10},
    myCardCopies: o.copies || {}, myCardLevels: o.levels || {}, myForgeCredit: o.credit || {}, myDecks: [], myDeckCounts: {}, myCardPrestige: o.prestige || {},
    myCurrencies: {dust: 0, gold: 0}, matchDefsOverlay: {}, toasts: [], hatch: new Set(),
    setTimeout: (f)=>{ try{ f(); }catch(e){} return 0; }, showToast: (m)=> ctx.toasts.push(m), saveCardCopies: ()=>{}, saveCardLevels: ()=>{}, saveForgeCredit: ()=>{}, saveCardPrestige: ()=>{}, saveHatchlings: ()=>{}, invalidateCardDefs: ()=>{},
    hatchlingIds: ()=> ctx.hatch, cardBaseLevel: d=> d ? (d.base != null ? d.base : 1) : 1, cardSourceOf: d=> ({kind: d.src || 'pack'}), statsAtLevel: (d, L)=> ({attack: d.attack + L, health: d.health + L}),
    getCardLevel: id=> { if(ctx.hatch.has(id) && !(ctx.myCardLevels[id] > 0)) return 0; const d = BASE[id]; const b = d ? (d.base != null ? d.base : 1) : 1; return Math.max(b, Math.min(11, ctx.myCardLevels[id] || 0)); },
    forgeBaseDef: id=> BASE[id], noteDuplicateFed: ()=>{}, maxCopiesForRarity: r=> MAXC[r || 'common'] || 10, levelCostMult: ()=> 1, levelUpMats: ()=> ({}),
    canDisenchantCard: d=> !!d && d.src !== 'base', disenchantValue: ()=> 7, grantCurrency: (k, v)=>{ ctx.myCurrencies[k] += v; }, saveCurrencies: ()=>{},
    cardRarityTier: d=> (d && d.rarity) || 'common', DUPLICATE_DIVISOR: {common: 18.75, uncommon: 18.75, rare: 18.75, legendary: 15}};
  ctx.getCardDefs = ()=>{ const out = {}; Object.keys(BASE).forEach(id=>{ out[id] = Object.assign({}, BASE[id], {level: ctx.getCardLevel(id)}); }); return out; };
  ctx.duplicateValue = id=>{ const full = ctx.F.forgeSpentOn(id, 10), k = ctx.DUPLICATE_DIVISOR[(BASE[id] || {}).rarity] || 18.75; return {dust: Math.round(full.dust / k), gold: Math.round(full.gold / k)}; };
  ctx.localStorage.setItem('bramblewood_card_copy_model_v', o.version != null ? String(o.version) : '3'); // before the block's own 0 ms move (3 since RW3: per-copy levels again)
  vm.createContext(ctx);
  vm.runInContext(refine + '\n' + STEP + '\n' + copyBlock + '\n' + resetBlock + '\n' + forgeFns.map(fnSrc).join('\n') +
    '\nthis.F = {ensureCopyModel, copyModelSync, copyLevel, copyOrder, bestCopyIdx, copySpareIdx, setCopyLevel, cloudCopiesOf, cloudApplyCopyLevels, copiesBeyondCap, fuseAllCountFor, resetForgeProgress, FORGE_STEP_DUST, LIMIT_BREAK_COST_MULT, ' + forgeFns.join(', ') + '};', ctx);
  return ctx;
}
const plain = (k, L, extra)=> Array.from({length: k}, (_, i)=> Object.assign({uid: 'p' + i + Math.random().toString(36).slice(2, 6), level: L == null ? 1 : L, foil: false}, extra || {}));

// ======================= 5. extras: beyond the deck limit =======================
console.log(`  the deck limits (RARITY_MAX_COPIES): Common ${MAXC.common}, Uncommon ${MAXC.uncommon}, Rare ${MAXC.rare}, Very Rare ${MAXC.veryrare}, Epic ${MAXC.epic}, Legendary ${MAXC.legendary}`);
ok(MAXC.common === 10 && MAXC.uncommon === 5 && MAXC.rare === 4 && MAXC.legendary === 1, '5. the limits the owner asked about: a Common deck holds 10, so 5 Commons are not extras');
{ const F = make().F;
  ok(F.copiesBeyondCap(5, 10) === 0 && F.copiesBeyondCap(10, 10) === 0 && F.copiesBeyondCap(11, 10) === 1 && F.copiesBeyondCap(13, 10) === 3, '5. copiesBeyondCap: 5 / 10 / 11 / 13 Commons → 0 / 0 / 1 / 3 extras');
  ok(F.copiesBeyondCap(5, 5) === 0 && F.copiesBeyondCap(6, 5) === 1 && F.copiesBeyondCap(2, 1) === 1 && F.copiesBeyondCap(1, 0) === 0, '5. … Uncommons at 5 / 6 → 0 / 1; a one-of keeps 1'); }
{ const ctx = make({copies: {c: plain(5), u: plain(6), r: plain(4), l: plain(3), b: plain(14)}}), F = ctx.F; F.ensureCopyModel();
  ok(F.disenchantableCopies('c').length === 0, '5. 5 Commons: nothing to disenchant (the limit is 10)');
  ok(F.disenchantableCopies('u').length === 1 && F.disenchantableCopies('r').length === 0 && F.disenchantableCopies('l').length === 2, '5. 6 Uncommons → 1, 4 Rares → 0, 3 Legendaries → 2');
  ok(F.disenchantableCopies('b').length === 0, '5. Base cards never melt, however many');
  const sum = F.disenchantSummary(); ok(sum.copies === 3 && sum.per.length === 2, `5. Disenchant extras: 3 copies of 2 cards (${JSON.stringify(sum.per)})`);
  ok(F.fuseAllPlan().copies === 7 && F.spareDuplicatesTotal() === 7, '5. Fuse all extras: the same rule (1 + 2, and the Base card\'s 4 beyond 10, which fuse but never melt)');
  ctx.myCardCopies.c.push(...plain(8)); // 13 Commons
  ok(F.disenchantableCopies('c').length === 3 && F.fuseAllCountFor('c', 10) === 3, '5. 13 Commons: 3 extras for both');
  ctx.myCardCopies.c[1].foil = true; ctx.myCardCopies.c[2].shiny = true;
  ok(F.disenchantableCopies('c').length === 3, '5. foil and Shiny copies are kept; still 3 plain extras melt');
  const mv = F.meltCardValue('c', null); ok(mv && mv.copies === 3, `5. melting the card melts its 3 extras, no more (${mv && mv.copies})`); }

// ======================= A. per-copy levels again (RW3, 2026-10-23) =======================
// FG (10-21) made every copy share the card's level; RW3 (owner, 10-23 item 25: "Maybe we should go back to card-based since everything is
// based on that") puts each copy's level back (NF's model) and keeps FG's card-level Forge credit. The move, version 3.
{ // the move from a version-2 save (FG: one level for every copy): every copy keeps it; only the best copy counts as paid for
  const copies = {c: [{uid:'a', level:5, foil:false}, {uid:'b', level:5, foil:true, finish:'hex'}, {uid:'d', level:5, foil:false}],
    u: [{uid:'e', level:2, foil:false}, {uid:'f', level:2, foil:false}], t: [{uid:'g', level:0, hatch:1, tut:1, foil:false}]};
  const ctx = make({copies, levels: {c: 5, u: 2}, credit: {c: {dust: 47, gold: 14}}, version: 2}), F = ctx.F;
  ok(F.ensureCopyModel() === true && ctx.localStorage.getItem('bramblewood_card_copy_model_v') === '3', 'A. the move runs once and sets version 3');
  ok(ctx.myCardCopies.c.every(x=> x.level === 5), 'A. no level is lost: every copy keeps the card\'s Lv 5');
  const best = ctx.myCardCopies.c[F.bestCopyIdx('c')];
  ok(best.uid === 'b' && !best.free && ctx.myCardCopies.c.filter(x=> x !== best).every(x=> x.free === 5), 'A. the best copy (the Hex foil) counts as paid for; the others\' levels are inherited (free)');
  ok(ctx.myForgeCredit.c.dust === 47 && ctx.myForgeCredit.c.gold === 14 && !ctx.myCardCopies.c.some(x=> x.cr), 'A. the Forge credit stays on the card');
  ok(ctx.myCardCopies.t[0].level === 0 && ctx.myCardCopies.t[0].hatch === 1, 'A. a Level 0 hatchling stays Level 0');
  ok(ctx.toasts.length === 1 && /own level again/.test(ctx.toasts[0]), 'A. a save with levelled spare copies hears about it once');
  // forging moves one copy
  F.forgeSetCopyLevel('c', 'd', 6); ok(ctx.myCardCopies.c.find(x=> x.uid === 'd').level === 6 && ctx.myCardCopies.c.filter(x=> x.uid !== 'd').every(x=> x.level === 5) && ctx.myCardLevels.c === 6, 'A. tempering one copy raises only that copy (6; the others stay 5); the card shows its best copy');
  ok(F.forgeCopyLevel('c', 'b') === 5 && F.forgeCopyLevel('c', null) === 6, 'A. the Forge reads the picked copy\'s level (the best by default)');
  ok(F.forgeCreditOf('c', 'b').dust === 47 && F.forgeCreditOf('c', null).dust === 47, 'A. the credit is the card\'s, whichever copy is asked');
  // spares: a copy with levels paid for on it is never a spare; one that only inherited its levels is
  const before = ctx.myCardCopies.c.length; ctx.myCardCopies.c.push({uid:'n1', level:1, foil:false}, {uid:'n2', level:1, foil:false});
  ok(F.copySpareIdx('c').length === 3 && !F.copySpareIdx('c').map(i=> ctx.myCardCopies.c[i].uid).includes('d'), 'A. spares: the plain copies with no paid levels (a, n1, n2), not d (paid Lv 6) nor the best');
  const v = F.feedDuplicate('c', null); ok(v && ctx.myCardCopies.c.length === before + 1 && ctx.myForgeCredit.c.dust === 47 + v.dust, 'A. Feed a duplicate banks on the card');
  // a sync lifts only the best copy to myCardLevels (a reward that levels a card)
  ctx.myCardLevels.u = 4; F.copyModelSync('u'); ok(ctx.myCardCopies.u.filter(x=> x.level === 4).length === 1 && ctx.myCardCopies.u.filter(x=> x.level === 2).length === 1, 'A. a reward that levels the card lifts its best copy only');
  // the cloud row round-trips per copy
  const row = F.cloudCopiesOf('c'); ok(row.length === ctx.myCardCopies.c.length && row[0].l === 6 && row.some(x=> x.l === 1), 'A. the cloud row: each copy\'s own level, best first');
  F.cloudApplyCopyLevels([{card_id:'c', level: 3, copies: row.map(x=> ({u: x.u, l: Math.min(3, x.l)}))}]); ok(ctx.myCardCopies.c.find(x=> x.uid === 'd').level === 6, 'A. a lower pulled level never lowers a copy');
  F.cloudApplyCopyLevels([{card_id:'c', level: 6, copies: [{u: 'other-device', l: 8}]}]); ok(ctx.myCardCopies.c.filter(x=> x.level === 8).length === 1 && ctx.myCardLevels.c === 8, 'A. another device\'s Lv 8 copy lifts one copy here (the strongest), not all');
  F.cloudApplyCopyLevels([{card_id:'u', level: 7, copies: null}]); ok(ctx.myCardCopies.u.filter(x=> x.level === 7).length === 1, 'A. a row with no copies (the column missing) lifts the best copy by its level');
  ctx.myCardCopies.c.push(...plain(230, 1)); ok(F.cloudCopiesOf('c').length === 200, 'A. at most 200 copies a row (the column\'s check)');
  // melting: one copy's paid levels (inherited ones give nothing), the card's credit, and the extras
  const mctx = make({copies: {c: plain(12, 4)}, levels: {c: 4}, credit: {c: {dust: 20, gold: 0}}, version: 2}); mctx.F.ensureCopyModel();
  const mv = mctx.F.meltCardValue('c', null), spent = mctx.F.forgeSpentOn('c', 4);
  ok(mv && mv.copies === 2 && mv.dust === 2 * 7 + Math.round((spent.dust + 20) * 0.97), `A. melting the best copy refunds its levels (97%) + the card's credit, and 2 extras (${JSON.stringify(mv)})`);
  mctx.F.meltCard('c', null); ok(mctx.myCardCopies.c.length === 10 && mctx.myCardCopies.c.filter(x=> x.level === 1).length === 1 && !mctx.myForgeCredit.c, 'A. after the melt: 10 copies, the melted one at Lv 1, the others keep Lv 4, no credit');
  const mv2 = mctx.F.meltCardValue('c', mctx.myCardCopies.c.find(x=> x.level === 4).uid); ok(!mv2 || mv2.dust === 0 || mv2.dust === (mv2.copies * 7), 'A. a copy whose levels were only inherited refunds no levels'); }
{ // an older save (one level per card): every copy at that level, the card keeps its credit
  const ctx = make({copies: {c: [{foil:false}, {foil:true}]}, levels: {c: 3}, credit: {c: {dust: 9, gold: 1}}, version: 0}); ctx.F.ensureCopyModel();
  ok(ctx.myCardCopies.c.every(x=> x.level === 3 && x.uid) && ctx.myForgeCredit.c.dust === 9, 'A. a pre-copy save: every copy at the card\'s Lv 3, its credit stays on the card'); }
{ // a version-1 save (NF per-copy levels): its levels stand; per-copy credit goes onto the card
  const ctx = make({copies: {c: [{uid:'a', level:5, foil:false, cr:{dust:30, gold:10}}, {uid:'b', level:3, foil:true, finish:'hex', free:3, cr:{dust:12, gold:4}}, {uid:'d', level:1, foil:false}]}, levels: {c: 5}, credit: {c: {dust: 5, gold: 0}}, version: 1}); ctx.F.ensureCopyModel();
  ok(ctx.myCardCopies.c.map(x=> x.level).join(',') === '5,3,1' && ctx.myCardCopies.c[1].free === 3 && !ctx.myCardCopies.c.some(x=> x.cr) && ctx.myForgeCredit.c.dust === 47, 'A. a version-1 save: per-copy levels stand, inherited marks stay, the copies\' credit adds onto the card (47)'); }
{ const nf = fnSrc('finishNurture'), gc = fnSrc('grantCardCopy');
  ok(/a\[i\]\.level = 1/.test(nf) && !/setCopyLevel\(e\.cardId, null, 1\)/.test(nf), 'A. the Nest trains one Level-0 copy to Level 1 (not the whole card)');
  ok(/copy\.level = copyBaseLevelOf\(id\)/.test(gc), 'A. a new copy comes at the card\'s starting level');
  ok(/\(forgeMode === 'upgrade' \|\| forgeMode === 'refine'\) && copyModelOn\(\)/.test(fnSrc('forgeCopiesWorthASheet')), 'A. the copies window opens in Upgrade and Refine (the modes that work on one copy)'); }

// ======================= B. the cost curve =======================
{ const F = make().F, step = L=> F.levelUpCostRaw(L, 'c');
  const sum = (a, b)=> { let d = 0, g = 0; for(let L = a; L < b; L++){ const c = step(L); d += c.dust; g += c.gold; } return {d, g}; };
  const low = sum(0, 7), high = sum(7, 10), road = sum(1, 10), lb = F.limitBreakCost('c', null).raw;
  console.log(`  Common road: 0→7 ✨${low.d} / 🍁${low.g}, 7→10 ✨${high.d} / 🍁${high.g}, 1→10 ✨${road.d} / 🍁${road.g}, limit break ✨${lb.dust} / 🍁${lb.gold}`);
  ok(Math.abs(road.d / 675 - 1.1) < 0.01 && Math.abs(road.g / 450 - 1.1) < 0.01, `B. +10% overall: Lv 1→10 is 1.1 Materia Units (✨${road.d} of 675, 🍁${road.g} of 450)`);
  ok(low.d < high.d && low.d > high.d * 0.85, `B. Lv 0→7 (✨${low.d}) is a little less than 8→10 (✨${high.d})`);
  ok([1, 2, 3, 4, 5, 6, 7, 8].every(L=> step(L + 1).dust > step(L).dust), 'B. every step costs more than the one before');
  ok(lb.dust === 2 * F.forgeSpentOn('c', 10).dust && lb.dust > 10 * step(9).dust, `B. the limit break is 2× the road (✨${lb.dust}), over 10× the 9→10 step`);
  ok(F.forgeSpentOn('c', 11).dust === F.forgeSpentOn('c', 10).dust * 3, 'B. what a limit-broken card cost in all: the road + 2× the road'); }

// ======================= 2. the Fuse tab =======================
{ const ctx = make({copies: {c: plain(13, 3)}, levels: {c: 3}, version: 2 /* RW3: a save from FG, so the copies above the best inherited their level */}), F = ctx.F; F.ensureCopyModel();
  const one = F.fusePreview('c', 1), all = F.fusePreview('c', null), dv = ctx.duplicateValue('c');
  ok(one.spares === 12 && all.extras === 3 && all.n === 3 && one.n === 1 && all.cap === 10, `2. 13 Commons: 12 spares, 3 extras; Fuse all takes 3 (${JSON.stringify({s: one.spares, e: all.extras})})`);
  ok(one.creditAfter.dust === dv.dust && all.creditAfter.dust === 3 * dv.dust && all.level === 3 && all.keeps === 10, '2. the preview: the credit each adds, the level kept, 10 copies left');
  const reach = F.fuseCreditReach('c', 3, {dust: 53 + 62 + 10, gold: 35 + 41 + 5}); ok(reach.to === 5 && reach.pct > 0 && reach.pct < 1, `2. credit for two steps and a bit: Lv 3 → 5 and part of 6 (${JSON.stringify(reach)})`);
  ok(F.fuseCreditReach('c', 0, {dust: 9999, gold: 9999}).to === 0, '2. a Level 0 card is the Nest\'s: credit doesn\'t level it');
  const r = F.fuseCopies('c', all.n); ok(r && r.n === 3 && ctx.myCardCopies.c.length === 10 && ctx.myForgeCredit.c.dust === 3 * dv.dust, '2. Fuse all: 3 go, 10 stay, the credit lands on the card');
  ok(F.fusePreview('c', null).extras === 0 && F.fusePreview('c', 1).spares === 9, '2. after it: no extras, 9 spares a Fuse 1 may still take'); }
{ const anvil = fnSrc('fuseAnvilHTML'), rf = fnSrc('renderForge'), modes = between('const FORGE_MODES = {', '};');
  ok(/fuse:\s+\{icon:'🧩', get label\(\)\{ return TX\('ui\.fg-fuse-tab'\)/.test(modes) && /forgeMode==='fuse' \? fuseAnvilHTML/.test(rf), '2. Fuse is its own Forge tab with its own anvil');
  ok(/forgeCopyPickerHTML\(id\)/.test(anvil) && /fgFuseOneBtn/.test(anvil) && /fgFuseAllBtn/.test(anvil) && /ui\.fg-fuse-result/.test(anvil), '2. it shows the copies window, the result and Fuse / Fuse all');
  ok(/forgeCentreStage\(\(\)=> fuseStageAnimation/.test(fnSrc('forgeFuse')), '2. fusing plays on the centre stage');
  ok(/id="forgeFuseAllBtn"/.test(rf) && /forgeMode==='fuse' \? \(\(\)=>\{ const n = spareDuplicatesTotal\(\)/.test(rf), '2. the global Fuse all extras moved to the Fuse tab');
  ok(!/forgeFeedDupBtn/.test(src) && /forgeGoFuseBtn/.test(fnSrc('forgeDupMeltHTML')), '2. the Upgrade anvil sends you to Fuse instead of feeding there'); }

// ======================= 3. Reinforce =======================
{ const block = between('// FORGE_FG:BEGIN', '// FORGE_FG:END');
  const CH = {castle: {id:'castle', name:'Bramble', health:30, rarity:'common'}, mine: {id:'mine', name:'Mine', health:20, rarity:'common'}};
  const cs = {levels: {castle: 3, mine: 20}, credit: {castle: {dust: 10, gold: 0}}, dups: {castle: 2}};
  const ctx = {CHARACTER_DEFS: CH, myCurrencies: {dust: 200, gold: 200}, CASTLE_MAX_LEVEL: 20, CASTLE_LIMIT_MAX: 25, LIMIT_BREAK_LEVEL: 11, Math, Object, Number, gate: 50,
    castleLevelOf: id=> cs.levels[id] | 0, castleLeveled: (b, L)=> Object.assign({}, b, {health: b.health + L, level: L}), castleDupsOf: id=> cs.dups[id] | 0,
    levelGateNeed: ()=> ctx.gate, ownedCount: ()=> 0,
    castleLevelUpCost: (L)=> ({dust: 15 + L * 12, gold: 10 + L * 8, mats: L >= 20 ? {'ember-core': 1} : undefined}),
    castleCreditOf: id=> cs.credit[id] || {dust: 0, gold: 0}};
  vm.createContext(ctx);
  vm.runInContext(['castleNetCost', 'castleCanTemper'].map(fnSrc).join('\n') + '\n' + block.slice(block.indexOf('function reinforcePreview('), block.indexOf('function reinforcePickId(')) + '\nthis.R = {reinforcePreview, castleCanTemper};', ctx);
  const p = ctx.R.reinforcePreview('castle');
  ok(p.L === 3 && p.health.now === 33 && p.health.next === 34 && p.cap === 20 && !p.atMax && !p.breaking, '3. Bramble Lv 3: 33 → 34 starting Health, of 20');
  ok(p.cost.dust === 15 + 36 - 10 && p.credit.dust === 10 && p.ok === true && p.ok === ctx.R.castleCanTemper('castle'), `3. the cost after its credit (✨${p.cost.dust}) and Reinforce is on, as castleCanTemper says`);
  ctx.myCurrencies.dust = 5; const q = ctx.R.reinforcePreview('castle');
  ok(!q.ok && q.short.some(s=> s.kind === 'dust' && s.need === 41 && s.have === 5) && q.ok === ctx.R.castleCanTemper('castle'), '3. short of Dust: off, and it says by how much');
  const m = ctx.R.reinforcePreview('mine'); ok(m.breaking && m.cap === 25 && m.gate === 50 && !m.ok && m.ok === ctx.R.castleCanTemper('mine'), '3. Lv 20: a limit break, waiting for Map 50');
  ctx.gate = 0; ctx.myCurrencies.dust = 9999; ctx.myCurrencies.gold = 9999; const m2 = ctx.R.reinforcePreview('mine');
  ok(!m2.ok && m2.short.some(s=> s.kind === 'ember-core') && m2.ok === ctx.R.castleCanTemper('mine'), '3. … and an Ember Core it doesn\'t have');
  cs.levels.castle = 25; ok(ctx.R.reinforcePreview('castle').atMax && ctx.R.reinforcePreview('castle').cost === null, '3. Lv 25: fully reinforced');
  ok(ctx.R.reinforcePreview('nope') === null, '3. an unknown bramble: null');
  const modes = between('const FORGE_MODES = {', '};'), rh = fnSrc('forgeReinforceHTML');
  ok(/castles: \{icon:'🏰', get label\(\)\{ return TX\('ui\.fg-reinforce-tab'\)/.test(modes) && TEXT['ui.fg-reinforce-tab'] === 'Reinforce', '3. the Brambles tab is "Reinforce" (TX key)');
  ok(/forgeReinforceHTML\(\)/.test(fnSrc('forgeCastlesHTML')) && /fg-rf-grid/.test(rh) && /id="rfStage"/.test(rh) && /fgReinforceBtn/.test(rh) && /→/.test(rh), '3. its own screen: the big preview, current → next, Reinforce, the grid');
  ok(/\.fg-rf\{[^}]*url\("data:image\/svg\+xml/.test(tpl), '3. a stonework background');
  ok(/forgeCentreStage\(\(\)=> reinforceStageAnimation/.test(fnSrc('forgeReinforce')), '3. Reinforce plays on the centre stage');
  ok(/data-lp-reinforce/.test(src) && /ui\.fg-rf-go-forge/.test(src), '3. the deck builder\'s bramble picker links to it'); }

// ======================= C. Reset Forge =======================
{ const copies = {c: plain(3, 6), t: [{uid:'t1', level:1, tut:1, foil:false}], u: [{uid:'u1', level:1, lv0:1, foil:true}], b: plain(2, 4)};
  const ctx = make({copies, levels: {c: 6, t: 1, u: 1, b: 4}, credit: {c: {dust: 50, gold: 5}}, prestige: {c: 2}}), F = ctx.F; F.ensureCopyModel();
  const r = F.resetForgeProgress();
  ok(ctx.myCardCopies.c.every(x=> x.level === 1) && ctx.getCardLevel('c') === 1 && !ctx.myForgeCredit.c && !ctx.myCardPrestige.c, 'C. a Lv 6 card goes back to its starting level, credit and Prestige gone');
  ok(ctx.myCardCopies.t[0].level === 0 && ctx.myCardCopies.t[0].hatch === 1 && ctx.hatch.has('t') && ctx.getCardLevel('t') === 0, 'C. a tutorial copy trained to Lv 1 is Level 0 again (a hatchling)');
  ok(ctx.myCardCopies.u[0].level === 0 && ctx.hatch.has('u') && ctx.myCardCopies.u[0].foil, 'C. a hatched card too, and its foil stays');
  ok(r.cards === 4 && r.zero === 2, `C. it reports the cards it moved (${JSON.stringify(r)})`);
  const pr = fnSrc('adminProfileToolsHTML'), w = fnSrc('wireAdminProfileTools');
  ok(/pfResetForge/.test(pr) && /arm\(document\.getElementById\('pfResetForge'\)/.test(w) && !/confirm\(/.test(w.replace(/\/\/[^\n]*/g, '')), 'C. Admin → Profile has Reset Forge, with the two-tap in-page confirm (no confirm())');
  ok(/c\.lv0 = 1/.test(fnSrc('hatchEgg')), 'C. a hatched copy is marked lv0 so the reset finds it'); }

// ======================= 6, 4, 1 and the texts =======================
{ const modes = between('const FORGE_MODES = {', '};');
  ok(/refine:\s+\{icon:'✨', get label\(\)\{ return TX\('ui\.fg-refine-name'\); \}/.test(modes) && TEXT['ui.fg-refine-name'] === 'Refine', '6. the foil upgrade\'s name is one key (ui.fg-refine-name), still "Refine"');
  ok((src.match(/TX\('ui\.fg-refine-name'\)/g) || []).length >= 2 && !/'Refine to \{finish\}'/.test(src) && !/'Refines your only copy\.'/.test(src), '6. the tab and the button read it; no other "Refine" text in the Forge');
  const rh = fnSrc('forgeRaidHTML'), wv = fnSrc('wireRaidViewer');
  ok(/raidCardRevealed\(id, d\)/.test(rh) && /id="raidViewer"/.test(rh) && /fg-recipe/.test(rh) && /fg-rstrip/.test(rh) && /data-rc-craft/.test(rh) && /fg-owned/.test(rh), '4. the raid tab: the strip, the big card, the recipe, Craft, the owned copies; the seen rule kept');
  ok(/pointermove/.test(wv) && /pointerdown/.test(wv) && /reducedMotion\(\)/.test(wv) && /ArrowLeft/.test(wv) && !/deviceorientation/.test(wv), '4. it tilts and turns with the pointer and a drag (no gyro), keys too, and respects reduced motion');
  ok(/\.fg-rv\{[^}]*touch-action:pan-y/.test(tpl) && /@media \(max-width:760px\)\{ \.fg-raid-main\{grid-template-columns:1fr;\}/.test(tpl), '4. a touch drag turns it; phones stack the card over the recipe');
  ok(/\.hatch-egg\{position:absolute; left:50%; top:42%; translate:-50% -54%;\}/.test(tpl) && /\.hatch-rays\{[^}]*top:42%/.test(tpl), '1. the hatch egg sits at the rays\' centre (42%), a few % higher than before');
  const LEAD = /^[^\p{L}\p{N}{(\[+]+/u, packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> [c, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'))]);
  const keys = Object.keys(TEXT).filter(k=> /^(ui|toast)\.fg-/.test(k)); const miss = [];
  keys.forEach(k=>{ const en = TEXT[k].replace(LEAD, ''); packs.forEach(([c, p])=>{ if(!(en in p)) miss.push(c + ':' + k); }); });
  ok(keys.length >= 60 && !miss.length, `every FG text (${keys.length}) is in all 12 packs (${miss.slice(0, 6).join(', ')})`);
  const used = new Set([...src.matchAll(/\bTX\(\s*'([^']+)'/g)].map(m=> m[1])); ok(keys.every(k=> used.has(k)), 'every FG text is used'); }

console.log(`fg-2026-10-19: ${n - fail}/${n} ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
