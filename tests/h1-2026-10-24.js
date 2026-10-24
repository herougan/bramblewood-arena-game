#!/usr/bin/env node
// 2026-10-24 (package H1, owner decision H1: "Maybe all uniques and above are also liable for materia (gem) socketing - but only 1. Costs
// to apply, costs to remove."). Runs the game's own socket block (MATERIA_SOCKET_H1 in arena_app.js) and copyDefAt / deckCopyEntries with
// small stubs, and checks:
//   1. who has a socket: Unique rank and above (a flagged rarity counts as its rank), cards with stats, not tokens / heroes / Materia / fields;
//   2. one gem per COPY: apply takes one crystal and the apply cost of the card's rank, refuses a filled socket, a missing crystal, a short
//      wallet, a card without a socket; another copy of the same card has its own socket;
//   3. remove: the remove cost, the crystal comes back (SOCKET_REMOVE_RETURNS, owner call H1-a), refuses an empty socket or a short wallet;
//   4. a socket whose copy is gone moves to the best empty copy (never lost, never doubled); the old per-card enchantment moves once onto
//      the best copy, or back into the bag when the card has no socket;
//   5. what the gem does: the card's def wears its best copy's gem; copyDefAt(id, L, gem) gives another copy its own gem (id "~cp<L>g<gem>")
//      and takes the def's gem off; the fight overlay regex knows those ids; deckCopyEntries carries each copy's gem;
//   6. costs: canonical/upgrade-costs.json materiaSocket (apply / remove, Dust + Leaves, the 7 ranks), every number editable in the hub's
//      💰 tab (tools/upgrade_costs_lib.js group "socket"), the game reads UPGRADE_COSTS.materiaSocket;
//   7. data: the sockets and the crystals ride the progress blob (PROGRESS_KEYS) and are read back after a pull; a socketed copy is never
//      a spare (copyIsPlain);
//   8. UI: the Forge's 💎 Socket tab (TX label / blurb, remove button, per-copy picker and copies sheet, pool = cards with a socket), the
//      socket slot on the card tile, the card detail's socket line;
//   9. texts: the H1 TX keys exist and each English text is in all 12 language packs; balance.md notes the gem is outside the budget.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));
const U = require(path.join(ROOT, 'tools', 'upgrade_costs_lib.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) throw new Error('no function ' + name);
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const a0 = src.indexOf('const ENCHANTS = {'), a1 = src.indexOf('// MATERIA_SOCKET_H1:END');
ok(a0 > 0 && a1 > a0 && src.indexOf('// MATERIA_SOCKET_H1:BEGIN') > a0, 'the MATERIA_SOCKET_H1 block is in arena_app.js after ENCHANTS');
const BLOCK = src.slice(a0, a1);

// ---- a sandbox: two cards with sockets (a Unique with three copies, a Dev-Legendary with one), a Rare without, a Unique token, a Unique spell
const RANKS = ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic'];
function makeBox(store){
  const LS = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const box = {localStorage: LS, JSON, Math, Object, Array, Set, Number, String,
    MATERIA_KINDS: [{id:'ember', icon:'🔥', name:'Ember'}, {id:'tide', icon:'💧', name:'Tide'}, {id:'grove', icon:'🌿', name:'Grove'}, {id:'stone', icon:'🪨', name:'Stone'}],
    UPGRADE_COSTS: T, myCurrencies: {dust: 10000, gold: 10000}, saveCurrencies(){ box.saved.cur++; }, saved: {cur: 0},
    myMateria: {ember: 2, tide: 0, grove: 1, stone: 0}, materiaStore(){ return box.myMateria; }, saveMateria(){},
    canAffordCost: c=> (box.myCurrencies.dust||0) >= (c.dust||0) && (box.myCurrencies.gold||0) >= (c.gold||0), invalidateCardDefs(){ box.inval++; }, inval: 0,
    rarityPartsOf: r=>{ const m = /^(quest|event|dev|special)(.+)$/.exec(r); if(r === 'questunique') return {flag:'quest', rank:'unique'}; if(m && RANKS.includes(m[2])) return {flag:m[1], rank:m[2]}; return {flag:null, rank:r}; },
    DEFS: {
      owl: {id:'owl', rarity:'unique', attack:4, health:6, level:3},
      wyrm: {id:'wyrm', rarity:'devlegendary', attack:7, health:9},
      fox: {id:'fox', rarity:'rare', attack:2, health:3},
      imp: {id:'imp', rarity:'unique', attack:1, health:1, token:true},
      rite: {id:'rite', rarity:'mythic', cardType:'spell'},
      qu: {id:'qu', rarity:'questunique', attack:2, health:2},
    },
    myCardCopies: {owl: [{uid:'o1', level:3}, {uid:'o2', level:5}, {uid:'o3', level:1}], wyrm: [{uid:'w1', level:1}], fox: [{uid:'f1', level:1}]},
  };
  box.getCardDefs = ()=> box.DEFS;
  box.copyBaseDef = id=> box.DEFS[id];
  box.copyOrder = id=>{ const a = box.myCardCopies[id] || []; return a.map((c, i)=> i).sort((x, y)=> (a[y].level||0) - (a[x].level||0) || x - y); };
  box.bestCopyIdx = id=>{ const o = box.copyOrder(id); return o.length ? o[0] : -1; };
  vm.createContext(box);
  vm.runInContext(BLOCK + '\n;this.__h1 = {ENCHANTS, SOCKET_RANKS, SOCKET_REMOVE_RETURNS, SOCKETS_KEY, get myCardSockets(){ return myCardSockets; }, set myCardEnchants(v){ myCardEnchants = v; }, cardHasSocket, socketCost, socketApply, socketRemove, socketApplyProblem, socketRemoveProblem, socketGemOfBest, socketGemOfCopy, copySocketGem, socketGemByUid, socketsNormalize, socketedCopies, migrateEnchantsToSockets, enchantCard, reloadCardSockets, socketGemStats};', box);
  return box;
}
const store = {}, B = makeBox(store), H = B.__h1;

// 1. who has a socket
ok(JSON.stringify(H.SOCKET_RANKS) === JSON.stringify(['unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']), '1. socket ranks: Unique and above');
ok(H.cardHasSocket(B.DEFS.owl) && H.cardHasSocket(B.DEFS.wyrm) && H.cardHasSocket(B.DEFS.qu), '1. Unique, Dev-Legendary and Quest-Unique cards have a socket');
ok(!H.cardHasSocket(B.DEFS.fox), '1. a Rare card has none');
ok(!H.cardHasSocket(B.DEFS.imp) && !H.cardHasSocket(B.DEFS.rite) && !H.cardHasSocket({rarity:'legendary', attack:1, health:1, cardType:'equipment'}) && !H.cardHasSocket({rarity:'unique', attack:1, health:1, hero:true}) && !H.cardHasSocket({rarity:'unique', cardType:'materia', health:1}), '1. not tokens, spells, equipment, heroes or Materia');
['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic'].forEach(r=> ok(!H.cardHasSocket({rarity:r, attack:1, health:1}), `1. ${r}: no socket`));

// 2. apply
const c0 = {dust: B.myCurrencies.dust, gold: B.myCurrencies.gold}, ap = H.socketCost(B.DEFS.owl, 'apply');
ok(ap.dust === T.materiaSocket.unique.apply.dust && ap.gold === T.materiaSocket.unique.apply.gold, '2. a Unique pays materiaSocket.unique.apply');
ok(JSON.stringify(H.socketCost(B.DEFS.wyrm, 'apply')) === JSON.stringify(T.materiaSocket.legendary.apply), '2. a Dev-Legendary pays the Legendary price');
const r1 = H.socketApply('owl', null, 'ember');
ok(r1 && r1.uid === 'o2' && r1.kind === 'ember', '2. no copy named: the gem goes into the best copy (Lv 5)');
ok(B.myMateria.ember === 1 && B.myCurrencies.dust === c0.dust - ap.dust && B.myCurrencies.gold === c0.gold - ap.gold, '2. one crystal and the apply cost are spent');
ok(H.socketGemOfBest('owl') === 'ember' && H.copySocketGem('owl', 'o1') === null, '2. only that copy wears it');
ok(H.socketApplyProblem('owl', 'o2', 'grove') === 'full' && H.socketApply('owl', 'o2', 'grove') === null && B.myMateria.grove === 1, '2. a filled socket refuses a second gem (nothing spent)');
ok(H.socketApplyProblem('owl', 'o1', 'tide') === 'no-gem', '2. no crystal of that kind: refused');
ok(H.socketApplyProblem('fox', 'f1', 'ember') === 'no-socket', '2. a Rare card: refused');
ok(H.socketApplyProblem('owl', 'nope', 'ember') === 'no-copy', '2. an unknown copy: refused');
const r2 = H.socketApply('owl', 'o1', 'grove'); ok(r2 && H.copySocketGem('owl', 'o1') === 'grove' && H.copySocketGem('owl', 'o2') === 'ember', '2. another copy of the same card has its own socket');
B.myCurrencies.dust = 5; ok(H.socketApplyProblem('owl', 'o3', 'ember') === 'short' && H.socketApply('owl', 'o3', 'ember') === null && B.myMateria.ember === 1, '2. short of Dust: refused, nothing spent');
B.myCurrencies.dust = 10000; B.myCurrencies.gold = 10000;
ok(JSON.parse(store[H.SOCKETS_KEY]).owl.o2 === 'ember', '2. saved to ' + H.SOCKETS_KEY + ' as {defId: {copyUid: gem}}');
ok(H.socketGemByUid('o1') === 'grove' && H.socketedCopies('owl').length === 2, '2. socketGemByUid / socketedCopies');

// 3. remove
const rm = H.socketCost(B.DEFS.owl, 'remove'), before = {dust: B.myCurrencies.dust, gold: B.myCurrencies.gold, ember: B.myMateria.ember};
ok(H.SOCKET_REMOVE_RETURNS === true, '3. the friendlier default: the gem comes back (owner call H1-a)');
const r3 = H.socketRemove('owl', 'o2');
ok(r3 && r3.kind === 'ember' && r3.returned && B.myMateria.ember === before.ember + 1, '3. remove gives the crystal back');
ok(B.myCurrencies.dust === before.dust - rm.dust && B.myCurrencies.gold === before.gold - rm.gold && rm.dust === T.materiaSocket.unique.remove.dust, '3. remove pays materiaSocket.unique.remove');
ok(H.copySocketGem('owl', 'o2') === null && H.socketRemoveProblem('owl', 'o2') === 'empty' && H.socketRemove('owl', 'o2') === null, '3. an empty socket: nothing to remove');
B.myCurrencies.gold = 0; ok(H.socketRemoveProblem('owl', 'o1') === 'short' && H.socketRemove('owl', 'o1') === null && H.copySocketGem('owl', 'o1') === 'grove', '3. short of Leaves: refused, the gem stays');
B.myCurrencies.gold = 10000;
ok(H.enchantCard('owl', 'ember', 'o2') === true && H.copySocketGem('owl', 'o2') === 'ember', '3. enchantCard (older callers) goes through socketApply');

// 4. orphans and the migration
B.myCardCopies.owl = B.myCardCopies.owl.filter(c=> c.uid !== 'o2'); // the Lv 5 copy is gone (melted, or another device)
H.socketsNormalize('owl');
ok(H.copySocketGem('owl', 'o2') === null && H.copySocketGem('owl', 'o3') === 'ember' && H.copySocketGem('owl', 'o1') === 'grove', '4. a gem whose copy is gone moves to the best empty copy');
B.myCardCopies.owl = B.myCardCopies.owl.filter(c=> c.uid !== 'o3'); H.socketsNormalize('owl');
ok(H.myCardSockets.owl.o3 === 'ember' && Object.keys(H.myCardSockets.owl).length === 2, '4. no empty copy: the gem waits (never lost, never doubled)');
B.myCardCopies.owl.push({uid:'o4', level:1}); H.socketsNormalize('owl');
ok(H.copySocketGem('owl', 'o4') === 'ember' && !('o3' in H.myCardSockets.owl), '4. ... and moves once a copy with an empty socket arrives');
{ const st2 = {'bramblewood_enchants_v1': JSON.stringify({owl:'stone', fox:'tide', ghost:'grove'})}, B2 = makeBox(st2), H2 = B2.__h1, m0 = Object.assign({}, B2.myMateria);
  const n = H2.migrateEnchantsToSockets();
  ok(n === 1 && H2.copySocketGem('owl', 'o2') === 'stone', '4. migration: the old enchantment goes into the best copy of a socketed card');
  ok(B2.myMateria.tide === m0.tide + 1 && B2.myMateria.grove === m0.grove + 1, '4. migration: a card without a socket (or not owned) gives its crystal back');
  ok(st2['bramblewood_enchants_v1'] === '{}' && st2['bramblewood_card_sockets_migrated_v1'] === '1' && B2.myCurrencies.dust === 10000, '4. migration: the old table is emptied, flagged once, nothing charged');
  ok(H2.migrateEnchantsToSockets() === 0 && B2.myMateria.tide === m0.tide + 1, '4. migration runs once'); }

// 5. what the gem does
{ const box = {ENCHANTS: H.ENCHANTS, cardHasSocket: H.cardHasSocket, socketGemStats: H.socketGemStats, cardBaseLevel: d=> d.baseLevel || 1,
    statsAtLevel: (b, L)=> ({attack: b.attack + (L - 1), health: b.health + 2 * (L - 1)}), Object, Math};
  const base = {id:'owl', rarity:'unique', attack:4, health:6, baseLevel:1};
  const full = Object.assign({}, base, {level:5}, {attack: 8, health: 14}); // Lv 5: 8 / 14
  Object.assign(full, H.socketGemStats(full, 'ember')); // the best copy wears Ember (+1 attack)
  box.getCardDefs = ()=> ({owl: full}); box.copyBaseDef = ()=> base;
  vm.createContext(box); vm.runInContext(fnSrc('copyDefAt') + ';this.copyDefAt = copyDefAt;', box);
  ok(full.attack === 9 && full.socketGem === 'ember', '5. the card def wears its best copy\'s gem on top of the level');
  ok(box.copyDefAt('owl', 5) === null && box.copyDefAt('owl', 5, 'ember') === null, '5. the best copy itself is the card def');
  const g = box.copyDefAt('owl', 5, null); ok(g && g.id === 'owl~cp5gx' && g.attack === 8 && g.health === 14 && !g.socketGem, '5. a same-level copy with an empty socket: its own def without the gem');
  const s = box.copyDefAt('owl', 3, 'stone'); ok(s && s.id === 'owl~cp3gstone' && s.attack === 6 && s.health === 10 + 3 && s.socketGem === 'stone', '5. a Lv 3 copy with Stone: Lv 3 stats + 3 Health, no Ember');
  const e = box.copyDefAt('owl', 3); ok(e && e.id === 'owl~cp3' && e.attack === 7 && e.socketGem === 'ember', '5. no gem given: the def\'s gem (older callers unchanged)');
  const re = /~(raid|exposed|illusory|boss|cp\d+(?:g[a-z]+)?)$/; ok(src.includes('cp\\d+(?:g[a-z]+)?)$/.test(id)') && re.test('owl~cp3gstone') && re.test('owl~cp3'), '5. the fight overlay keeps "~cp<L>g<gem>" copies'); }
ok(/function deckCopyEntries\(id, n\)/.test(src) && /socketGemOfCopy\(id, c\)/.test(fnSrc('deckCopyEntries')), '5. deckCopyEntries carries each copy\'s gem');
ok(/deckCopyEntries\(id, n\)/.test(fnSrc('ownedDeckForMatch')) && /copyDefAt\(id, L, gem\)/.test(fnSrc('ownedDeckForMatch')) && /gem === bestGem/.test(fnSrc('ownedDeckForMatch')), '5. a fight deck: each copy fights with its own gem');
ok(/socketGemOfBest\(id\)/.test(src.slice(src.indexOf('function getCardDefs'), src.indexOf('function getCardDefs') + 20000)) && !/myCardEnchants\[id\]\]/.test(src), '5. getCardDefs reads the best copy\'s socket, not the old per-card table');

// 6. costs
const MS = T.materiaSocket; ok(MS && JSON.stringify(Object.keys(MS)) === JSON.stringify(H.SOCKET_RANKS), '6. upgrade-costs.json materiaSocket has the 7 socket ranks');
Object.keys(MS || {}).forEach(k=> ['apply', 'remove'].forEach(w=> ['dust', 'gold'].forEach(c=> ok(typeof MS[k][w][c] === 'number' && MS[k][w][c] >= 0, `6. materiaSocket.${k}.${w}.${c} is a number`))));
const ent = U.build(T), sock = ent.filter(e=> e.group === 'socket');
ok(U.GROUPS.some(g=> g[0] === 'socket') && sock.length === 7 * 4, '6. the hub tab lists every socket cost (group "socket", 28 numbers)');
ok(sock.every(e=> U.get(T, e.path) === U.get(T, e.path) && typeof U.get(T, e.path) === 'number'), '6. each socket path resolves');
{ const r = U.apply(T, [{path:'materiaSocket.mythic.remove.gold', value: 123}]); ok(r.changed.length === 1 && r.table.materiaSocket.mythic.remove.gold === 123 && T.materiaSocket.mythic.remove.gold !== 123, '6. a hub edit folds into the file (fold tool path)'); }
ok(/UPGRADE_COSTS\.materiaSocket/.test(src), '6. the game reads UPGRADE_COSTS.materiaSocket');

// 7. data
ok(/PROGRESS_KEYS\.push\('bramblewood_card_sockets_v1', 'bramblewood_materia_v1'\)/.test(src), '7. sockets and crystals ride the progress blob');
ok(/reloadCardSockets\(\); myMateria = JSON\.parse/.test(src.slice(src.indexOf('async function livePullProgress'), src.indexOf('function livePushProgress'))),'7. a cloud pull reads both back');
ok(/socketGemByUid\(c\.uid\)/.test(fnSrc('copyIsPlain')), '7. a socketed copy is never a spare (copyIsPlain)');

// 8. UI
ok(/enchant: \{icon:'💎', get label\(\)\{ return TX\('ui\.h1-socket-tab'\); \}/.test(src), '8. the Forge tab is 💎 Socket (TX)');
const anv = fnSrc('enchantAnvilHTML');
ok(/forgeCopyPickerHTML\(id\)/.test(anv) && /forgeSocketRemoveBtn/.test(anv) && /data-enchant/.test(anv) && /socketCost\(base, 'apply'\)/.test(anv) && /socketCost\(base, 'remove'\)/.test(anv), '8. the anvil: copy picker, gem buttons, apply and remove costs, the remove button');
ok(/forgeMode !== 'enchant'/.test(fnSrc('forgeCopyPickerHTML')) && /forgeMode === 'enchant'/.test(fnSrc('forgeCopiesWorthASheet')), '8. the Socket tab works on one copy (picker, copies sheet)');
ok(/if\(forgeMode==='enchant'\) ids = ids\.filter\(id=> cardHasSocket\(defs\[id\]\)/.test(src), '8. the Socket tab\'s pool: cards with a socket');
ok(/socketSlotHTML\(d\)/.test(fnSrc('cardTileHTML')) && /h1-slot/.test(fnSrc('socketSlotHTML')), '8. the card tile shows the socket slot');
ok(/cardSocketDetailHTML\(defId, d\)/.test(fnSrc('openCardDetail')), '8. the card detail has the socket line');
ok(/forgeSocketRemove\(sr\)/.test(src), '8. the remove button is wired');

// 9. texts
const KEYS = ['ui.h1-socket-tab', 'ui.h1-socket-blurb', 'ui.h1-gem-ember', 'ui.h1-gem-tide', 'ui.h1-gem-grove', 'ui.h1-gem-stone', 'ui.h1-gem-fx-ember', 'ui.h1-gem-fx-tide', 'ui.h1-gem-fx-grove', 'ui.h1-gem-fx-stone',
  'ui.h1-socket-empty', 'ui.h1-socket-filled', 'ui.h1-socket-pick', 'ui.h1-socket-full-note', 'ui.h1-remove', 'ui.h1-remove-tip', 'ui.h1-remove-tip-lost', 'ui.h1-cost-apply', 'ui.h1-no-socket',
  'ui.h1-slot-empty', 'ui.h1-slot-full', 'ui.h1-detail-socket', 'ui.h1-detail-empty-n', 'ui.h1-detail-how', 'toast.h1-socket-set', 'toast.h1-socket-removed', 'toast.h1-socket-removed-lost'];
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && TEXT[k].length, `9. ${k} exists`));
Object.keys(H.ENCHANTS).forEach(k=> ok(TEXT['ui.h1-gem-fx-' + k] === H.ENCHANTS[k].label, `9. ui.h1-gem-fx-${k} says what ENCHANTS.${k} does`));
CODES.forEach(c=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); const miss = KEYS.filter(k=> !(TEXT[k].replace(/^💎 /, '') in p)); /* a toast's leading emoji stays outside the pack */ ok(!miss.length, `9. lang/${c}.json has every H1 text (${miss.join(', ')})`); });
ok(/H1/.test(fs.readFileSync(path.join(ROOT, 'docs', 'workflows', 'balance.md'), 'utf8')) && /outside the card's printed budget|outside the printed budget/.test(fs.readFileSync(path.join(ROOT, 'docs', 'workflows', 'balance.md'), 'utf8')), '9. balance.md: a socketed gem is outside the printed budget');

console.log(`h1-2026-10-24: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
