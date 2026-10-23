#!/usr/bin/env node
// 2026-10-24 (package NE, owner notes 2026-10-23 11:15, 11:26, 13:16 #26, 17:01 #9-13, 17:34 #17 #19 #21, 19:27 #12 #13 and the codex note,
// plus EN5's Guardian find):
//   #9   the "You have" wallet where currency is spent (Nest, its subwindow, Tavern, the Camp's deck slots)
//   #10  a locked nest says only "Locked for now" (no map); tapped, it shakes and says "Locked for now — progress further"
//   #11  the Nest's tabs are Hatchery | Upgrades; an open nest's subwindow has Eggs | Younglings
//   #26  a Nurse swap never changes what is already growing (placement fixes the time); the Nest says so
//   11:15 / #17  the Camp pool: the Shift-only count chip with its visible hint, the leader counted (1/3), a full card greyed, one stack per
//        card with the copy fan (best copy on a click, exactly the copy clicked in the fan, picks fight at their own level)
//   #19  the editor's Main deck tag has its subtitle; the deck card's type emojis, large, on the right
//   #13  open deck slots are empty leather deck cases in the Camp's deck grid
//   #21  the Conquest map leads the places bar; Home is an icon
//   #12  the Codex card detail shows every copy you own as a card, by treatment; a tapped copy shows its level
//   11:26 the fight panel's field pills sit in the head under the BR
//   19:27 #12 the shop counter scrolls into view; #13 the pack's card viewer: card left, details right, flying in from the tapped card
//   19:27 codex: every filter resets when you enter a page (sort and view stay)
//   EN5  the Guardian's step-in is a GSAP tween of the card itself, at least 200 ms
//   + TX keys for every new text, in all 12 packs
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };

// ---- #9 wallet
ok(/function neWalletHTML\(kinds\)/.test(src) && /currencyPillHTML\(k, 'forge-cur-' \+ k\)/.test(fnSrc('neWalletHTML')), '#9 neWalletHTML draws the currency pills');
ok(/neWalletHTML\(\['gold', 'dust', 'kibble'\]\)/.test(fnSrc('renderNest')), '#9 the Nest shows Maple Leaves, Dust and Kibble');
ok(/neWalletHTML\(\['kibble', 'dust', 'gold'\]\)/.test(fnSrc('openNestPicker')), '#9 the nest subwindow shows them too');
ok(/neWalletHTML\(\['gold', 'dust', 'beer'\]\)/.test(fnSrc('openTavern')), '#9 the Tavern shows Maple Leaves, Dust and Beer');
ok(/where === 'camp' && st && !gate \? neWalletHTML\(\['dust', 'gold'\]\)/.test(fnSrc('deckSlotPanelHTML')), '#9 the Camp\'s deck slots show Dust and Maple Leaves');
// ---- #10 locked nests
{ const k = fnSrc('nestKeeperHTML'), b = fnSrc('nestBuildRowHTML');
  ok(!/Opens on Map|nest-time">Map \$\{u\.map\}|opens on Map/.test(k) && /data-nest-locked="\$\{i\}"/.test(k) && /TX\('ui\.ne-nest-next-locked'\)/.test(k), '#10 no map number on a locked nest or in the side text; locked nests are buttons');
  ok(/TX\('ui\.ne-nest-locked'\)/.test(b) && !/nest-upg-next-map/.test(b), '#10 the Upgrades row says "Locked for now"');
  ok(/denyShake\(b\)/.test(fnSrc('nestLockedPing')) && /ui\.ne-nest-locked-progress/.test(fnSrc('nestLockedPing')) && /data-nest-locked\]'\)\.forEach\(b=> b\.onclick = \(\)=> nestLockedPing\(b\)\)/.test(fnSrc('renderNest')), '#10 a tapped locked nest shakes and shows "Locked for now — progress further"');
  ok(TEXT['ui.ne-nest-locked-progress'] === 'Locked for now — progress further' && TEXT['ui.ne-nest-locked'] === 'Locked for now', '#10 the owner\'s words'); }
// ---- #11 tabs
{ const r = fnSrc('renderNest'), p = fnSrc('openNestPicker');
  ok(/\[\['eggs', '🪺 ' \+ TX\('ui\.ne-nest-tab-hatchery'\)\], \['upgrades', '⬆️ ' \+ TX\('ui\.upgrades-tab'\)\]\]/.test(r) && !/tu2-nest-tab-recruits/.test(r), '#11 the Nest\'s tabs are Hatchery | Upgrades (no Level 0 tab)');
  ok(/nestTab === 'recruits'\)\{ nestTab = 'eggs'; nestOpenYoungOnce = true; \}/.test(r) && /openNestPicker\(null, 'young'\)/.test(r), '#11 an old "recruits" jump opens the Hatchery with Younglings');
  ok(/data-np-tab="eggs"/.test(p) && /data-np-tab="young"/.test(p) && /ui\.ne-pick-tab-young/.test(p) && /data-np-pane="young"/.test(p), '#11 the nest subwindow has Eggs | Younglings');
  ok(TEXT['ui.ne-pick-tab-young'] === 'Younglings' && TEXT['ui.ne-nest-tab-hatchery'] === 'Hatchery', '#11 named Younglings and Hatchery'); }
// ---- #26 the nurse: placement fixes the time
{ const nb = between('// NEST_SLOTS_NF:BEGIN', '// NEST_SLOTS_NF:END'); let factor = 1;
  const st = {eggs: [{id:'e1', kind:'woodland', placed:false}], built: 3, nurse: null};
  const ctx = {NEST_SLOTS: 7, Date, Math, Number, TX, EGG_KINDS: {woodland: {hatchHours: 8}}, nestState: ()=> st, saveNestState: ()=>{}, nestSlotsOpen: ()=> 4,
    nurseTimeFactor: ()=> factor, grantEggCardFor: ()=>{}, nestPlaced: n=> (n || st).eggs.filter(e=> e.placed !== false)};
  vm.createContext(ctx); vm.runInContext(nb + '\nthis.N = {placeEggInNest};', ctx);
  ctx.N.placeEggInNest('e1', 0); const at0 = st.eggs[0].hatchAt; factor = 0.5; st.nurse = 'x';
  ok(at0 > 0 && st.eggs[0].hatchAt === at0, '#26 a Nurse swap leaves an egg already in a nest at its time');
  ok(!/hatchAt\s*=/.test(fnSrc('openNursePicker')) && /ne-nurse-note/.test(fnSrc('nestKeeperHTML')), '#26 swapping the Nurse writes no egg time; the Nest says what a new Nurse speeds'); }
// ---- 11:15 / #17 the Camp pool (NE_DECK block in a sandbox)
const deckBlock = between('// NE_DECK:BEGIN', '// NE_DECK:END');
ok(deckBlock.length > 2000, 'the NE_DECK block is there');
{ const copies = {duck: [{uid:'a', level:4}, {uid:'b', level:2, shiny:true}, {uid:'c', level:1, foil:true}, {uid:'d', level:3}], wt: [{uid:'w', level:1}]};
  const looks = {}; const defs = {duck: {id:'duck', name:'Duck', rarity:'common'}, wt: {id:'wt', name:'WT', rarity:'common'}};
  const ctx = {myDeckCounts: {duck: 0}, myLeaderId: 'wt', HERO_ID: 'hero', myCardCopies: copies, getCardDefs: ()=> defs, TX, escapeAttr: s=> String(s), escapeHtml: s=> String(s),
    ownedCopiesOf: id=> (copies[id] || []).length, editionCapReached: (c, id)=> (c[id] | 0) >= 5, deckRankBlockFor: ()=> null, deckLeaderIds: ()=> ['wt'],
    deckLooksAll: ()=> looks, copyOrder: id=> (copies[id] || []).map((c, i)=> i).sort((x, y)=> copies[id][y].level - copies[id][x].level),
    maxCopiesForRarity: ()=> 5, rarityDef: ()=> ({label:'Common'}), _t: s=> s, document: undefined, window: undefined};
  vm.createContext(ctx);
  vm.runInContext(fnSrc('deckLimitChipHTML') + '\n' + deckBlock + '\nthis.D = {neDeckUsed, neDeckFull, deckCopyUidsFor, deckCopyPicks, setDeckCopyPicks, deckLimitChipHTML};', ctx);
  const D = ctx.D;
  ok(D.neDeckUsed('wt') === 1 && /1\/5/.test(D.deckLimitChipHTML('wt', D.neDeckUsed('wt'))), '11:15 the leader counts as a copy (Wandering Traveller as leader: 1/N)');
  ok(D.neDeckFull('wt') === true, '11:15 the leader\'s card is greyed (it can\'t go in the deck too)');
  ctx.myDeckCounts.duck = 4; ok(D.neDeckFull('duck') === true, '#17 all copies in: greyed'); ctx.myDeckCounts.duck = 2; ok(D.neDeckFull('duck') === false, '#17 copies left: not greyed');
  ok(JSON.stringify(D.deckCopyUidsFor('duck', 2)) === '["a","d"]', '11:15 a plain click fills with your best copies, highest level first');
  D.setDeckCopyPicks('duck', ['c']); ok(JSON.stringify(D.deckCopyUidsFor('duck', 2)) === '["c","a"]', '11:15 a copy picked in the fan is in the deck, then the best');
  ok(JSON.stringify(D.deckCopyPicks('duck')) === '["c"]' && looks['~picks'] && looks['~picks'].duck, '11:15 picks ride with the deck\'s looks (~picks)');
  D.setDeckCopyPicks('duck', []); ok(!looks['~picks'], '11:15 no picks: the key goes'); }
ok(/body\.ne-shift #myDeckPool \.pool-stack \.pg-limit, #myDeckPool\.ne-show-limits \.pool-stack \.pg-limit\{opacity:1/.test(tpl) && /#myDeckPool \.pool-stack \.pg-limit\{opacity:0/.test(tpl), '11:15 the count chip shows only while Shift is held (or the ⇧ button is on)');
ok(/e\.key === 'Shift'\) neShift\(true\)/.test(deckBlock) && /neShiftHintHTML\(\)/.test(src) && /<kbd>⇧<\/kbd>/.test(fnSrc('neShiftHintHTML')), '11:15 Shift held sets body.ne-shift; the pool shows the ⇧ Shift hint');
ok(/return neDeckPoolStackHTML\(id, defs\)/.test(fnSrc('renderMyDeckPanels')) && /neWirePoolFan\(pool\)/.test(fnSrc('renderMyDeckPanels')), '11:15 one stack per card, with the fan wired');
ok(/pointerType !== 'mouse'\) return; if\(neFanState/.test(deckBlock) && /setTimeout\(\(\)=>\{ lp = null; host\._neLP = Date\.now\(\); neFanOpen\(id, host\)/.test(deckBlock) && /neFanLater\(\)/.test(deckBlock), '11:15 the fan opens on hover (desktop) or a long press (phone) and stays while the pointer is over it');
ok(/class="ne-fan-card \$\{on \? 'is-in' : ''\}"/.test(fnSrc('neFanHTML')) && /deckCopyUidsFor\(id, myDeckCounts\[id\] \| 0\)/.test(fnSrc('neFanHTML')), '11:15 copies in the deck show greyed in the fan');
ok(/neFanAddCopy = \(id, uid, btn\)=>/.test(src) && /p\.push\(uid\); setDeckCopyPicks/.test(src), '11:15 a fanned copy goes in as exactly that copy');
ok(/picks\.length\)\{ const uids = deckCopyUidsFor\(id, n\)/.test(fnSrc('deckCopyLevels')) && /top === best \? null : copyDefAt\(id, L\)/.test(fnSrc('ownedDeckForMatch')), '11:15 a picked copy fights at its own level');
ok(/stack\.classList\.toggle\('ne-full', full\)/.test(fnSrc('tentQuickCount')) && /deckLimitChipHTML\(id, used\)/.test(fnSrc('tentQuickCount')), '#17 a +1 / −1 in place keeps the chip (leader counted) and the greyed state');
ok(/#myDeckPool \.pool-stack\.ne-full \.card-tile\{filter:grayscale/.test(tpl), '#17 a full card is greyed in the pool');
// ---- #19
ok(/ne-main-tag/.test(src) && /<small>\$\{escapeHtml\(TX\('ui\.ui4-main-deck-sub'\)\)\}<\/small><\/span>/.test(src), '#19 the editor\'s Main deck tag has "You play with this one"');
ok(/deckTypeEmojisHTML\(d, sig\)/.test(fnSrc('deckMediumPreviewHTML')) && /dmp-type-emo/.test(fnSrc('deckTypeEmojisHTML')) && /\.dmp-types\{position:absolute; right:12px/.test(tpl), '#19 the type emojis, large, on the right of the deck card');
// ---- #13
ok(/\+ neEmptySlotsHTML\(\)/.test(src) && /deckSlotsOwned\(\) - myDecks\.length/.test(fnSrc('neEmptySlotsHTML')) && /\.dmp-btn\.ne-slot\{position:relative; height:150px/.test(tpl), '#13 every open slot is a leather deck case the size of a deck preview');
ok(/neSlotJustOpened = Date\.now\(\)/.test(fnSrc('wireDeckSlots')) && /@keyframes neSlotIn/.test(tpl), '#13 the slot just opened appears with a stitch-in');
// ---- #21
ok(/\{key:'map', icon:'🗺️', name:'Conquest map'/.test(src) && /playSubTab = 'conquest'; switchTab\('play'\)/.test(src), '#21 the Conquest map leads the places bar');
ok(/id="homeNavBtn" type="button" title="Home" aria-label="Home" hidden><span class="tab-emoji" aria-hidden="true">🏠<\/span><\/button>/.test(tpl), '#21 Home is just the icon');
// ---- #12
ok(/fromCodex \? neCodexCopiesHTML\(defId\)/.test(fnSrc('openCardDetail')) && /forgeCopyTreatment\(c\)/.test(fnSrc('neCodexCopiesHTML')) && /ne-cx-lv/.test(fnSrc('neCodexCopiesHTML')), '#12 the Codex detail shows each copy as a card, by treatment, with its level');
ok(/classList\.add\('is-shown'\)/.test(fnSrc('openCardDetail')) && /\.ne-cx-copy\.is-shown \.ne-cx-lv\{opacity:1/.test(tpl), '#12 tapping a copy shows its level');
// ---- 11:26
{ const f = fnSrc('skirmishFieldHTML');
  ok(/cnp-field cnp-field-pills/.test(f) && !/cnp-field-k">Field</.test(f), '11:26 the field is a row of pills, no "Field" heading');
  ok(/⚔ \$\{ev\}<\/span>`; \}\)\(\)\}<\/div>\$\{isTut \? '' : skirmishFieldHTML\(map\.id, selectedNode\)/.test(src), '11:26 the field sits in the panel\'s head, under the BR'); }
// ---- 19:27 #12 / #13
ok(/shopCounterIntoView\(c\)/.test(fnSrc('renderShopShelves')) && /scrollIntoView/.test(fnSrc('shopCounterIntoView')), '19:27 #12 the shop counter scrolls into view');
ok(/const split = !!opts\.pull/.test(fnSrc('openCardInspector')) && /neInspectFlyIn\(ov, opts\.returnFocus\)/.test(fnSrc('openCardInspector')) && /grid-template-areas:"stage detail" "bar detail"/.test(tpl), '19:27 #13 the pack viewer: card left, details right, flying in');
// ---- filters reset
{ const s = fnSrc('syncTextFilterPage'), r = fnSrc('resetPageFilters');
  ok(/if\(k !== textFilterPage\)\{ if\(neKeepFiltersOnce\) neKeepFiltersOnce = false; else resetPageFilters\(\); \}/.test(s), '19:27 entering a page resets its filters');
  ok(/archetype:'', animal:'', phylum:'', rarity:'', mechLine:'', kind:'', skills:\[\]/.test(r) && /forgeFilter = 'all'/.test(r) && /localStorage\.setItem\(UI_FILTERS_KEY/.test(r) && !/sort/.test(r.replace(/\/\/.*$/mg, '')), '19:27 every filter (in memory and saved), not the sort');
  ok(/neKeepFiltersOnce = true/.test(fnSrc('codexShowCardsWithSkill')), '19:27 "Show cards with this skill" keeps its pick'); }
// ---- EN5 Guardian
{ const g = fnSrc('en2GuardStepIn');
  ok(/gsap\.to\(g, \{left: \(dx\/sc\) \+ 'px', top: \(dy\/sc\) \+ 'px'/.test(g) && /Math\.max\(200, hitAt \* \.6\)/.test(g) && !/onUpdate:put/.test(g), 'EN5 the Guardian\'s step-in tweens the card itself over 200 ms or more'); }
// ---- texts
const KEYS = Object.keys(TEXT).filter(k=> k.startsWith('ui.ne-'));
ok(KEYS.length >= 22, `the NE texts are TX keys (${KEYS.length})`);
ok(KEYS.every(k=> src.includes(`'${k}'`)), 'every NE key is used: ' + KEYS.filter(k=> !src.includes(`'${k}'`)).join(', '));
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[TEXT[k]]); ok(!miss.length, `lang/${code}.json translates every NE text (${miss.join(', ')})`); }
console.log(`ne-2026-10-24: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
