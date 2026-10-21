#!/usr/bin/env node
// 2026-10-18 (package NF, owner 23:37):
//   1. "Nest: when you insert an egg, it should go into the slot you chose." — the tapped nest gets it; a taken / unbuilt nest says why
//      and nothing moves elsewhere; items keep their nest when another one hatches
//   2. "Forging your energy should have an amazing energy and animation." — FX.D.energyForge (full + calm), SoundKit.energySurge, the
//      Forge's Max Energy step plays it, the lab entry and the inventory row
//   3. "Each card is unique. Forging one card doesn't mean all copies become stronger!" — per-copy levels and credit, the one-time
//      move of an old save (never lowering anything), decks fight with their strongest copies at their own levels (a real engine),
//      the cloud row's copies (client side + the proposed SQL)
//   4. "Fuse all extras should go into the highest level card first, then if draw, into the highest foil treatment." (then the oldest)
//   + TX keys for every new text, in all 12 packs
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const fxd = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-d.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const {makeSimEngine} = require(path.join(ROOT, 'bramblewood-engine.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };

// ======================= 1. the Nest's chosen slot =======================
const nestBlock = between('// NEST_SLOTS_NF:BEGIN', '// NEST_SLOTS_NF:END');
ok(nestBlock.length > 500, '1. the NEST_SLOTS_NF block is there');
function makeNest(open, eggs){
  const st = {eggs: eggs || [], built: open - 1};
  const ctx = {NEST_SLOTS: 7, Date, Math, Number, TX, EGG_KINDS: {woodland: {hatchHours: 4}}, st,
    nestState: ()=> st, saveNestState: ()=>{}, nestSlotsOpen: ()=> open, nurseTimeFactor: ()=> 1, grantEggCardFor: ()=>{},
    nestPlaced: n=> (n || st).eggs.filter(e=> e.placed !== false)};
  vm.createContext(ctx); vm.runInContext(nestBlock + '\nthis.N = {nestSlotLayout, nestSlotFor, placeEggInNest, nestRefusalText, nestPinSlots};', ctx); return ctx;
}
{ const egg = id=> ({id, kind:'woodland', placed:false});
  const ctx = makeNest(4, [egg('e1'), egg('e2'), egg('e3')]), N = ctx.N, st = ctx.st, at = id=> st.eggs.find(e=> e.id === id);
  ok(N.placeEggInNest('e1', 3) === true && at('e1').slot === 3 && at('e1').placed === true, '1. an egg set from nest 4 goes into nest 4 (not the first empty one)');
  ok(N.nestSlotLayout().slots[3] === at('e1') && N.nestSlotLayout().slots[0] === null, '1. the layout draws it in nest 4; nest 1 stays empty');
  ok(N.placeEggInNest('e2', 3) === 'taken' && at('e2').placed === false && at('e2').slot == null, '1. a taken nest says "taken" and the egg stays in the pack (never moved elsewhere)');
  ok(N.placeEggInNest('e2', 5) === 'locked' && at('e2').placed === false, '1. a nest not built yet says "locked"');
  ok(/taken/.test(N.nestRefusalText('taken')) && /built/.test(N.nestRefusalText('locked')) && /full/.test(N.nestRefusalText('full')), '1. each refusal has its own line');
  ok(N.placeEggInNest('e2', 1) === true && at('e2').slot === 1 && at('e1').slot === 3, '1. a second egg in nest 2 leaves the first in nest 4');
  ok(N.placeEggInNest('e3') === true && at('e3').slot === 0, '1. with no nest named (a nurture prefill) it takes the first free one');
  // something hatches: the others keep their nests
  st.eggs = st.eggs.filter(e=> e.id !== 'e2');
  const L = N.nestSlotLayout(); ok(L.slots[3] && L.slots[3].id === 'e1' && L.slots[0] && L.slots[0].id === 'e3' && L.slots[1] === null, '1. when one hatches nobody moves up a nest');
  st.eggs.push({id:'baby', kind:'baby'}); // a rescued baby has no nest yet: the first free one (nest 2), kept from then on
  ok(N.nestSlotLayout().slots[1].id === 'baby', '1. an item with no nest yet takes the first free one');
  ok(N.nestSlotFor(st, 2).ok && !N.nestSlotFor(st, 1).ok && N.nestSlotFor(st, 1).why === 'taken', '1. nestSlotFor reports each nest');
  st.eggs.push(egg('e4'));
  ok(N.placeEggInNest('e4', 2) === true && N.placeEggInNest('nope', 2) === false, '1. the last free nest; an unknown egg is refused');
  st.eggs.push(egg('e5')); ok(N.placeEggInNest('e5') === 'full' && st.eggs.find(e=> e.id === 'e5').placed === false, '1. all four full: "full", the egg waits in the pack');
  ok(st.eggs.filter(e=> e.placed !== false).every(e=> Number.isInteger(e.slot)), '1. every placed item has its nest pinned'); }
{ // an older save: eggs placed in order with no slot, more than the nests (the basket)
  const ctx = makeNest(2, [{id:'a', kind:'woodland'}, {id:'b', kind:'woodland'}, {id:'c', kind:'woodland'}]), L = ctx.N.nestSlotLayout();
  ok(L.slots.map(e=> e.id).join() === 'a,b' && L.waiting.map(e=> e.id).join() === 'c', '1. an older save: the first items fill the nests in order, the rest wait in the basket'); }
{ const keeper = fnSrc('nestKeeperHTML'), picker = fnSrc('openNestPicker'), render = fnSrc('renderNest'), nur = fnSrc('startNurture');
  ok(/nestSlotLayout\(n\)/.test(keeper) && /data-nest-empty="\$\{i\}"/.test(keeper) && !/placed\.slice\(0, open\)/.test(keeper), '1. the hatchery draws each item in its own nest, and each empty nest names itself');
  ok(/openNestPicker\(\+b\.dataset\.nestEmpty\)/.test(render), '1. tapping an empty nest opens the picker for that nest');
  ok(/placeEggInNest\(eg\.dataset\.npEgg, slot\)/.test(picker) && /startNurture\(id, slot\)/.test(picker) && /nestRefusalText/.test(picker), '1. the picker sets the egg / the training in that nest, or says why not');
  ok(/nestSlotFor\(n, slot\)/.test(nur) && /slot: at\.slot/.test(nur), '1. a card in training goes into the tapped nest too'); }

// ======================= 3 + 4. per-copy levels =======================
const copyBlock = between('// CARD_COPIES_NF:BEGIN', '// CARD_COPIES_NF:END');
ok(copyBlock.length > 2000, '3. the CARD_COPIES_NF block is there');
const refine = between('const REFINE_LADDER = [', '];') + '\n' + fnSrc('copyRefineRank');
const forgeFns = ['forgeCreditOf', 'spareCopyIndex', 'feedDuplicate', 'levelUpCost', 'spendForgeCredit', 'forgeSetCopyLevel', 'forgeCopyLevel', 'disenchantableCopies', 'addForgeCredit',
  'meltCardValue', 'meltCard', 'spareDuplicatesTotal', 'fuseAllPlan', 'fuseAllDuplicates', 'mainDeckLevel'];
forgeFns.forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
const statsAt = (d, L)=> ({attack: d.attack + 2 * (L - 1), health: d.health + 3 * (L - 1)});
function makeCopies(o){
  o = o || {};
  const BASE = Object.assign({
    x: {id:'x', name:'X', attack:10, health:10, rarity:'common'},
    y: {id:'y', name:'Y', attack:5, health:5, rarity:'common'}, z: {id:'z', name:'Z', attack:5, health:5, rarity:'common'}, w: {id:'w', name:'W', attack:5, health:5, rarity:'common'},
    b: {id:'b', name:'Base B', attack:4, health:6, rarity:'starter', src:'base', base:0},
  }, o.extraDefs || {});
  const ctx = {localStorage: fakeStorage(), Date, Math, JSON, Number, String, Object, Array, Set, TX, console,
    CARD_DEFS_BASELINE: BASE, liveCards: {}, LIMIT_BREAK_LEVEL: 11, HERO_ID: 'hero', standardMatchActive: false,
    myCardCopies: o.copies || {}, myCardLevels: o.levels || {}, myForgeCredit: o.credit || {}, myDecks: o.decks || [], myDeckCounts: o.deck || {},
    myCardPrestige: {}, myCurrencies: {dust: 0, gold: 0}, matchDefsOverlay: {}, toasts: [], saves: 0,
    setTimeout: ()=> 0, showToast: (m)=> ctx.toasts.push(m), saveCardCopies: ()=>{ ctx.saves++; }, saveCardLevels: ()=>{}, saveForgeCredit: ()=>{}, invalidateCardDefs: ()=>{},
    cardBaseLevel: d=> d ? (d.base != null ? d.base : 1) : 1, cardSourceOf: d=> ({kind: d.src || 'pack'}), statsAtLevel: statsAt,
    getCardLevel: id=> { const d = BASE[id]; const b = d ? (d.base != null ? d.base : 1) : 1; return Math.max(b, Math.min(11, ctx.myCardLevels[id] || 0)); },
    forgeBaseDef: id=> BASE[id], duplicateValue: ()=> ({dust: 10, gold: 5}), noteDuplicateFed: ()=>{}, maxCopiesForRarity: ()=> 3,
    forgeSpentOn: (id, L)=> ({dust: 100 * L, gold: 50 * L}), levelUpCostRaw: ()=> ({dust: 100, gold: 50}), levelUpMats: ()=> ({}),
    canDisenchantCard: d=> !!d && d.src !== 'base', disenchantValue: ()=> 7, grantCurrency: (k, v)=>{ ctx.myCurrencies[k] += v; }, saveCurrencies: ()=>{},
    ratingWeightOf: ()=> 1, ratingLevelFactor: L=> L, deckLevelFrom: ()=> -1};
  ctx.getCardDefs = ()=>{ const out = {}; Object.keys(BASE).forEach(id=>{ const d = BASE[id], L = ctx.getCardLevel(id), st = statsAt(d, L); out[id] = Object.assign({}, d, st, {level: L}); }); return Object.assign(out, ctx.matchDefsOverlay); };
  vm.createContext(ctx);
  vm.runInContext(refine + '\n' + copyBlock + '\n' + forgeFns.map(fnSrc).join('\n') + '\nthis.C = {ensureCopyModel, copyModelSync, copyOrder, bestCopyIdx, copyLevel, deckCopyLevels, ownedDeckForMatch, copySpareIdx, cloudCopiesOf, cloudApplyCopyLevels, setCopyLevel, ' + forgeFns.join(', ') + ', COPY_MODEL_KEY, get ready(){ return copyModelReady; }};', ctx);
  return ctx;
}
// ---- the move of an old save
// 2026-10-21 (package FG, owner: "Huge change: I think forge forges ALL cards of a particular suite."): NF's per-copy levels were
// reversed: every copy sits at the card's level, and the credit is the card's (tests/fg-2026-10-19.js covers the move from per-copy
// levels). What NF built stays and is checked here: every copy's uid, no deck weaker after the move, a deck's Base copies, the deck
// fighting with your copies, the cloud row's copies.
{ const copies = {x: [{foil:false}, {foil:true, finish:'hex'}, {foil:false, shiny:true}, {foil:false}], y: [{foil:false}]};
  const ctx = makeCopies({copies, levels: {x: 5, b: 3}, credit: {x: {dust: 30, gold: 10}}, deck: {x: 3, b: 2}}), C = ctx.C; let a = ctx.myCardCopies.x;
  ok(!C.ready && ctx.localStorage.getItem(C.COPY_MODEL_KEY) == null, '3. before the move: no version flag');
  ok(C.ensureCopyModel() === true && C.ready && ctx.localStorage.getItem(C.COPY_MODEL_KEY) === '2', '3. the move runs once and sets the version flag (2 since FG)');
  a = ctx.myCardCopies.x;
  ok(a.every(c=> c.level === 5 && typeof c.uid === 'string' && c.uid.length > 4), '3. an old save: every copy keeps the card\'s level 5 (no deck gets weaker) and gets its own uid');
  ok(new Set(a.map(c=> c.uid)).size === 4, '3. the uids are unique');
  const best = a[C.bestCopyIdx('x')];
  ok(best.finish === 'hex', '3. the best copy on a level tie is the finest foil (hex over a Shiny over plain)');
  ok(ctx.myForgeCredit.x && ctx.myForgeCredit.x.dust === 30 && !a.some(c=> c.cr || c.free), '3. (FG) the card keeps its Forge credit; no copy carries credit or inherited levels');
  ok(ctx.getCardLevel('x') === 5 && ctx.myCardLevels.x === 5, '3. the card\'s level is never lowered');
  ok(ctx.myCardCopies.y[0].level === 1, '3. an unlevelled card\'s copy starts at its starting level');
  ok((ctx.myCardCopies.b || []).length === 2 && ctx.myCardCopies.b.every(c=> c.level === 3 && c.m === 1), '3. a levelled Base card with no copy on record gets the 2 copies its deck held, at its level');
  ok(/every copy of a card together/.test(TX('toast.fg-card-levels')), '3. (FG) the note for a save whose copies differed');
  const before = JSON.stringify(ctx.myCardCopies); ctx.C.copyModelSync('x'); ok(JSON.stringify(ctx.myCardCopies) === before, '3. a second sync changes nothing');
  const ctx2 = makeCopies({copies: JSON.parse(before), levels: {x: 5}}); ctx2.localStorage.setItem(ctx2.C.COPY_MODEL_KEY, '2');
  ctx2.C.ensureCopyModel(); ok(JSON.stringify(ctx2.myCardCopies.x) === JSON.stringify(JSON.parse(before).x), '3. with the flag set the move doesn\'t run again');
  // ---- (FG) forging any copy raises every copy
  const plain = a.find(c=> !c.foil && !c.shiny);
  C.forgeSetCopyLevel('x', plain.uid, 6);
  ok(a.every(c=> c.level === 6) && ctx.myCardLevels.x === 6, '3. (FG) forging the card to Lv 6 raises every copy');
  ok(C.forgeCopyLevel('x', best.uid) === 6 && C.forgeCopyLevel('x', null) === 6, '3. every copy reads the card\'s level');
  ok(C.levelUpCost(6, 'x', best.uid).credit.dust === 30 && C.levelUpCost(6, 'x', plain.uid).credit.dust === 30, '3. (FG) the credit is the card\'s, whichever copy is asked');
  C.spendForgeCredit('x', {dust: 30, gold: 10}, best.uid); ok(!ctx.myForgeCredit.x, '3. spending the credit clears it');
  // ---- the deck fights with its copies, all at the card's level
  const out = C.ownedDeckForMatch({x: 3});
  ok(out.x === 3 && Object.keys(out).length === 1, `3. (FG) a deck of 3: three copies of "x" at Lv 6, no weaker copies (${JSON.stringify(out)})`);
  const defs = ctx.getCardDefs(), eng = makeSimEngine(defs, ()=> .5, {}), P = eng.newPlayer(1, out, {id:'c', name:'c', health:30, effects:{}});
  const atks = P.deck.map(id=> eng.makeBoardCard(id).atk), X0 = ctx.CARD_DEFS_BASELINE.x;
  ok(atks.length === 3 && atks.every(v=> v === statsAt(X0, 6).attack), `3. in a real fight every copy comes down at Lv 6's Attack (${atks})`);
  ok(JSON.stringify(C.ownedDeckForMatch({x: 1})) === '{"x":1}', '3. one copy in the deck: the card itself');
  a.push({foil:false}); C.copyModelSync('x');
  ok(a[4].level === 6 && JSON.stringify(C.deckCopyLevels('x', 5)) === '[6,6,6,6,6]', '3. (FG) a new copy joins at the card\'s level');
  ok(C.mainDeckLevel({x: 5}, null) === 30, '3. the deck\'s battle rating counts each copy at the card\'s level');
  const ob = C.ownedDeckForMatch({b: 3}); ok(ctx.myCardCopies.b.length === 3 && ob.b === 3, '3. a Base card gets a real third copy for the deck, at the card\'s level');
  ok(C.ownedDeckForMatch(null) === null && (ctx.standardMatchActive = true, JSON.stringify(C.ownedDeckForMatch({x: 3})) === '{"x":3}'), '3. a Standard match (every card Lv 1) is left alone'); ctx.standardMatchActive = false;
  // ---- the cloud row's copies
  const row = C.cloudCopiesOf('x'); ok(row.length === 5 && row[0].u === a[C.bestCopyIdx('x')].uid && row.every(r=> r.l === 6 && typeof r.u === 'string'), '3. the cloud row carries each copy\'s uid and level (the card\'s), best first');
  C.cloudApplyCopyLevels([{card_id:'x', copies:[{u: plain.uid, l: 3}]}]);
  ok(a.every(c=> c.level === 6), '3. a pulled lower level never lowers the card');
  C.cloudApplyCopyLevels([{card_id:'x', copies:[{u: plain.uid, l: 3}, {u:'from-another-device', l: 8}]}]);
  ok(a.every(c=> c.level === 8) && ctx.myCardLevels.x === 8, '3. (FG) another device\'s Lv 8 lifts the whole card');
  // ---- melting: the card as one; its extras (beyond the deck limit, 3 here) melt with it
  const mv = C.meltCardValue('x', null);
  ok(mv && mv.copies === 2 && mv.level === 8, `3. melting: the card's levels and its 2 extras (5 copies, limit 3) (${JSON.stringify(mv)})`); }
// ---- 4. Fuse all extras: the highest level first, then the finest foil, then the oldest
{ const mk = (uid, level, extra)=> Object.assign({uid, level, foil:false}, extra || {});
  const copies = {
    y: [mk('a', 3), mk('b', 3, {foil:true, finish:'etched'}), mk('c', 3, {foil:true, finish:'hex'}), mk('d', 1), mk('e', 1), mk('f', 1)],
    z: [mk('p', 2), mk('q', 2), mk('r', 1), mk('s', 1), mk('t', 1)],
    w: [mk('g', 2, {foil:true, finish:'gold'}), mk('h', 4), mk('i', 1), mk('j', 1)],
  };
  const ctx = makeCopies({copies, levels: {y: 3, z: 2, w: 4}}); ctx.localStorage.setItem('bramblewood_card_copy_model_v', '1');
  const C = ctx.C; C.ensureCopyModel();
  const plan = C.fuseAllPlan(), byId = Object.fromEntries(plan.per.map(p=> [p.id, p]));
  ok(byId.y && byId.y.n === 3 && byId.y.toUid === 'b' && byId.y.to === 3, `4. y: a level tie at 3 goes to the finest foil (Etched over Hex) (${JSON.stringify(byId.y)})`);
  ok(byId.z && byId.z.n === 2 && byId.z.toUid === 'p', '4. z: a full tie goes to the oldest copy');
  ok(byId.w && byId.w.n === 1 && byId.w.toUid === 'g' && byId.w.to === 4, '4. w: (FG) every copy is at the card\'s Lv 4, so the finest foil (Gold leaf) is its best copy');
  ok(C.spareDuplicatesTotal() === plan.copies && plan.copies === 6, '4. the button\'s count is the plan\'s');
  const r = C.fuseAllDuplicates();
  ok(r.count === 6 && r.cards === 3, '4. Fuse all fed 6 copies of 3 cards');
  const cr = id=> ctx.myForgeCredit[id] || {};
  ok(cr('y').dust === 30 && cr('z').dust === 20 && cr('w').dust === 10 && !ctx.myCardCopies.y.some(c=> c.cr), '4. (FG) the credit lands on each card (30 / 20 / 10), not on a copy');
  ok(ctx.myCardCopies.y.map(c=> c.uid).join() === 'a,b,c' && ctx.myCardCopies.z.map(c=> c.uid).join() === 'p,q,r' && ctx.myCardCopies.w.map(c=> c.uid).join() === 'g,h,i', '4. the weakest spares went, a deck\'s worth stays');
  ok(C.copySpareIdx('y').length === 1, '4. (FG) levels are the card\'s, so y\'s plain Lv 3 copy is a spare too');
  ok(C.feedDuplicate('z', 'q') && cr('z').dust === 30 && ctx.myCardCopies.z.length === 2, '4. Feed a duplicate banks on the card'); }

// ======================= the rest of the game reads the copies =======================
{ const t = fnSrc('forgeTemper'); ok(/forgeUid\(id\)/.test(t) && /forgeSetCopyLevel\(id, uid, L\+1\)/.test(t) && !/myCardLevels\[id\] = L\+1/.test(t), '3. tempering raises only the copy on the anvil');
  ok(/forgeCopyPickerHTML\(id\)/.test(fnSrc('forgeAnvilHTML')) && /forgeCopyPickerHTML\(id\)/.test(fnSrc('refineAnvilHTML')), '3. the anvil shows the copy picker (Upgrade and Refine)');
  ok(/data-forge-copy/.test(fnSrc('forgeCopyPickerHTML')) && /data-forge-copy/.test(fnSrc('renderForge')), '3. picking a chip puts that copy on the anvil');
  ok(/forgeSetCopyLevel\(id, uid, 0\)/.test(fnSrc('forgePromote')) && !/myCardLevels\[id\] = 0/.test(fnSrc('forgePromote')), '3. promoting a card resets only the promoted copy');
  ok(/forgeSetCopyLevel\(defId, uid, LIMIT_BREAK_LEVEL\)/.test(fnSrc('limitBreakCard')), '3. a limit break breaks one copy');
  ok(/copyLevel\(e\.cardId, c\) === 0/.test(fnSrc('finishNurture')), '3. the Nest trains one Level-0 copy');
  const sites = (src.match(/ownedDeckForMatch\(myDeckCounts/g) || []).length;
  ok(sites >= 6, `3. every fight that uses your collection deck builds it from your copies (${sites} places: Conquest, Arena / AI / Gauntlet / PvP, raids)`);
  ok(/myOwnedDeck = ownedDeckForMatch\(myDeckCounts\)/.test(fnSrc('startConquestMatch')) && /let myDeck = myOwnedDeck/.test(fnSrc('startConquestMatch')), '3. Conquest fights with your copies (the CPU keeps its own "@lv" cards)');
  ok(/standardDeck \? myDeckCounts : ownedDeckForMatch/.test(fnSrc('startMatchInner')), '3. Standard (every card Lv 1) keeps its plain deck');
  ok(/cp\\d\+/.test(fnSrc('buildRaidFullFight')), '3. the full raid keeps your copies on its board overlay');
  ok(/!defs\[id\]\.derivedFrom/.test(fnSrc('getDraftableIds')), '3. a fight-only copy never shows in a card pool');
  const push = fnSrc('cloudPushCardLevels'), pull = fnSrc('cloudPullState');
  ok(/copies: cloudCopiesOf\(id\)/.test(push) && /cloudCopiesColumnMissing/.test(push) && /level: myCardLevels\[id\]/.test(push), '3. the push sends each card\'s best level and its copies, and drops the copies if the column is missing');
  ok(/'card_id, level, copies'/.test(pull) && /cloudApplyCopyLevels\(unlocks\)/.test(pull) && /copyModelSyncAll\(\)/.test(pull), '3. the pull reads the copies and never lowers one'); }
{ const sql = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261019_card_copy_levels.sql'), 'utf8');
  ok(/APPLIED 2026-10-19/.test(sql) && /alter table public\.player_card_unlocks add column if not exists copies jsonb/.test(sql) && /check \(public\.card_copies_ok\(copies\)\)/.test(sql), '3. the proposed SQL adds player_card_unlocks.copies with a shape check');
  ok(!fs.readdirSync(path.join(ROOT, 'supabase', 'proposed')).some(f=> /card_copy/.test(f)), '3. applied: moved out of supabase/proposed'); }

// ======================= 2. forging Max Energy =======================
{ const fx = fxd.slice(fxd.indexOf('M.energyForge = function'), fxd.indexOf('// ======================= HOOKS'));
  ok(fx.length > 3000, '2. FX.D.energyForge is in bramblewood-fx-d.js');
  ok(/opts\.calm \|\| !g/.test(fx) && /fxd-ef-calm/.test(fx) && /energySurge', 'calm'/.test(fx), '2. the calm version: a glow, the new pip brightens, a soft chime');
  ['charge', 'overflow', 'boom'].forEach(s=> ok(fx.includes(`'energySurge', '${s}'`), `2. the full version plays the ${s} sound`));
  ok(/fxd-ef-bar/.test(fx) && /fxd-ef-fill/.test(fx) && /fxd-ef-drop/.test(fx) && /ringAt\(/.test(fx) && /burstAt\(/.test(fx) && /polyline/.test(fx) && /shake\(el/.test(fx), '2. the bar charges and overflows, drops spill, lightning, a shockwave and sparks, the panel jolts');
  ok(/made\.forEach\(e=>\{ try\{ e\.remove\(\)/.test(fx) && /num\.textContent = numText/.test(fx) && /clearProps:'boxShadow'/.test(fx), '2. everything it adds is removed and the panel is left as it was');
  const sk = between('    energySurge(stage){', '\n    },'); ok(/'charge'/.test(sk) && /'overflow'/.test(sk) && /'boom'/.test(sk) && /sweep\(/.test(sk) && /fnoise\(/.test(sk), '2. SoundKit.energySurge layers its beats');
  const w = fnSrc('wireStamina'), cel = fnSrc('energyForgeCelebrate');
  ok(/where === 'forge'\) energyForgeCelebrate\(from, energyMax\(\)\)/.test(w), '2. a Forge Max Energy step plays it (from the old max to the new)');
  ok(/reducedMotion\(\) \|\| !fxAtLeast\('med'\) \|\| !hasGsap\(\)/.test(cel) && /FX\.D\.energyForge\(panel/.test(cel) && /calm/.test(cel), '2. reduced motion or Effects Off / Low: the calm version');
  const man = fs.readFileSync(path.join(ROOT, 'tools', 'effects-lab', 'manifest', 'nf.js'), 'utf8');
  ok(/id:'meta-forge-energy'/.test(man) && /energyForge\(/.test(man) && /calm/.test(man), '2. the Effects Lab entry (full and calm)');
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'effects-inventory-2026-10-15.json'), 'utf8'));
  ok(inv.some(e=> e.id === 'meta-forge-energy' && e.lab === 'nf.js' && e.status === 'live'), '2. the inventory row'); }
ok(/\.forge-copy-picker\{/.test(tpl) && /\.fcp-chip\{/.test(tpl), '3. the copy picker CSS');

// ======================= texts and packs =======================
// 2026-10-21 (package FG): the per-copy texts (own levels, the copy's credit, the fuse into the best copy, Refines this copy) went with
// the per-copy levels; package FG's own texts replace them (tests/fg-2026-10-19.js)
const KEYS = ['ui.nf-copy-level', 'ui.nf-copy-shiny', 'ui.nf-copy-plain', 'ui.nf-copy-deck',
  'ui.nf-copies-title', 'ui.nf-nest-taken', 'ui.nf-nest-locked', 'ui.nf-nest-full', 'ui.nf-energy-forged'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `${k} is a TX key the code uses`));
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `lang/${c}.json has every new text (missing: ${miss.join(', ')})`); });
ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_19_nf.py')), 'tools/i18n_2026_10_19_nf.py');

console.log(fail ? `nf-2026-10-19: ${fail} of ${n} checks failed` : `nf-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
