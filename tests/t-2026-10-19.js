#!/usr/bin/env node
// 2026-10-18 (package T, owner requests 2026-10-19 list): checks that
//   1. the tutorial's combat step (g-combat: "Cards hit the card in front of them. No card in front? They hit the Bramble.") waits for
//      a board with two of your units, one facing an enemy unit and one facing an open lane (tutLessonBoard); the CPU's play for that
//      turn is scripted (tutorialScriptedCpuPlay): with one lane blocked it plays away from your open lane, with none it blocks one.
//      Run here on the real engine (open battle mode, the tutorial's cards). While the step is up, both units' attack lines are drawn
//      (tutCombatLines -> showFacingAll; showFacing's keep option), and they go with it;
//   2. after tutorial part 2, the Outskirts (with their title card) only load once the "Add to deck" window has closed;
//   3. the "You're ready for bigger cards" toast (Quarry Mole, held until pitching opens) is gone; each card that waited comes up in
//      the central swap window instead, with the Lumber line (ui.swap-teach-lumber);
//   4. a bramble won is a card tile among the cards won (cardTileHTML isCastle), not a "New bramble: X" pill with the Forge tooltip;
//      a spare wears SPARE and only it says that a spare is fused in the Forge.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const Engine = require(path.join(ROOT, 'bramblewood-engine.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
// a token outside comments: every line that has it has it after a // only
const inCode = (text, re)=> text.split('\n').some(l=>{ const i = l.search(re); if(i < 0) return false; const c = l.indexOf('//'); return c < 0 || c > i; });
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// --- 1. the scripted CPU play and the lesson board, on the real engine
const defs = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const names = ['allCardsOnBoard', 'isSlotMatch', 'boardOrderOf', 'facingOf', 'tutLessonBoard', 'tutorialScriptedCpuPlay'];
names.forEach(n=> ok(fnSrc(n).length > 40, `${n} exists`));
const seen = new Set();
const lib = new Function('getCardDefs', 'coachSeen', names.map(fnSrc).join('\n') + '\nreturn {' + names.join(', ') + '};')(()=> defs, seen);
const sideOf = id=> id === 1 ? 'A' : 'B';
function newMatch(seed, myDeck, rivalDeck){
  const engine = Engine.makeSimEngine(defs, Engine.mulberry32(seed), {recordEvents:true, battleMode:'open'});
  const players = {1: engine.newPlayer(1, myDeck), 2: engine.newPlayer(2, rivalDeck)};
  const stats = {}; engine.draw(players[1], 3, 'A', stats, []); engine.draw(players[2], 3, 'B', stats, []);
  return {engine, players, sideOf, stats, mode:'tutorial', tutorialStage:1, round:1, battleMode:'open', _aiActedRound:0};
}
const unitsAt = (m, pid)=> lib.allCardsOnBoard(m.players[pid]).filter(c=> c.hp > 0).map(c=> c.slot).sort((a, b)=> a - b);
const playMine = (m, slot)=>{ const p = m.players[1], h = p.hand.find(x=> m.engine.canPlay(p, x.defId, x.uid)); return !!(h && m.engine.placeCard(m.players, sideOf, 1, h.uid, slot, m.stats, [])); };
const newTurn = m=>{ [1, 2].forEach(p=>{ m.players[p].playedThisTurn = false; m.players[p].playsThisTurn = 0; m.players[p].discardUsedThisTurn = false; }); m.round++; };
const cpuTurn = m=>{ m._aiActedRound = m.round; const ev = []; const scripted = lib.tutorialScriptedCpuPlay(m, ev); if(!scripted) m.engine.aiTakeTurn(m.players, sideOf, 2, m.stats, ev); return {scripted, ev}; };
const MY = {'pond-trout':6, 'pond-duck':6}, RIVAL = {'otter-kit':12}; // sturdy cards, so no one dies before the lesson
// The tutorial's own flow: round 1 you play (centre), the CPU plays; round 2 you play beside it, the CPU's play is scripted.
for(const side of [1, -1]){
  const m = newMatch(20261005, MY, RIVAL);
  ok(playMine(m, 0), 'round 1: your first card goes in the centre');
  let t = cpuTurn(m);
  ok(!t.scripted, 'round 1: with one unit of yours the CPU plays as usual');
  ok(JSON.stringify(unitsAt(m, 2)) === '[0]', `round 1: the CPU's first card faces yours (${unitsAt(m, 2)})`);
  ok(!lib.tutLessonBoard(m), 'round 1: no lesson board yet');
  newTurn(m);
  ok(playMine(m, side), `round 2: your second card goes to slot ${side}`);
  m._aiActedRound = m.round - 1; ok(!lib.tutLessonBoard(m), 'the lesson waits for the CPU\'s turn this round');
  t = cpuTurn(m);
  ok(t.scripted, `round 2 (you at ${side}): the CPU's play is scripted`);
  ok(t.ev.some(e=> e.type === 'play' && e.side === 'B'), 'it is a real play (a play event)');
  ok(JSON.stringify(unitsAt(m, 2)) === JSON.stringify([0, -side].sort((a, b)=> a - b)), `it plays in the opposite direction, slot ${-side} (${unitsAt(m, 2)})`);
  const fA = lib.facingOf(m, lib.allCardsOnBoard(m.players[1]).find(c=> c.slot === 0).uid), fB = lib.facingOf(m, lib.allCardsOnBoard(m.players[1]).find(c=> c.slot === side).uid);
  ok(fA.foes.length === 1 && fB.foes.length === 0, 'one of your units faces an enemy unit, the other an open lane (the bramble)');
  ok(lib.tutLessonBoard(m), 'the lesson board is up');
  ok(m.players[2].playedThisTurn, 'the CPU has used its play');
}
{ // no enemy unit yet: it blocks exactly one of your two lanes (the centre one)
  const m = newMatch(7, MY, RIVAL);
  m.engine.debugSpawnCard(m.players, sideOf, 1, 'pond-trout', 'left', m.stats, []); m.engine.debugSpawnCard(m.players, sideOf, 1, 'pond-duck', 'right', m.stats, []);
  const mine = unitsAt(m, 1); ok(mine.length === 2, `two units of yours (${mine})`);
  const t = cpuTurn(m);
  ok(t.scripted && unitsAt(m, 2).length === 1 && mine.includes(unitsAt(m, 2)[0]), `with an empty enemy row it blocks one lane (${unitsAt(m, 2)})`);
  ok(lib.tutLessonBoard(m), 'and the lesson board is up');
}
{ // every lane blocked already: nothing to script
  const m = newMatch(9, MY, RIVAL);
  ['left', 'right'].forEach(s=> m.engine.debugSpawnCard(m.players, sideOf, 1, 'pond-trout', s, m.stats, []));
  unitsAt(m, 1).forEach(sl=> m.engine.debugSpawnCard(m.players, sideOf, 2, 'otter-kit', sl, m.stats, []));
  ok(!lib.tutorialScriptedCpuPlay(m, []), 'both lanes blocked: no scripted play');
}
{ // only in tutorial part 1, and only until the step has been seen
  const m = newMatch(11, MY, RIVAL); ['left', 'right'].forEach(s=> m.engine.debugSpawnCard(m.players, sideOf, 1, 'pond-trout', s, m.stats, []));
  m.tutorialStage = 2; ok(!lib.tutorialScriptedCpuPlay(m, []), 'part 2: the CPU plays as usual');
  m.tutorialStage = 1; m.mode = 'conquest'; ok(!lib.tutorialScriptedCpuPlay(m, []), 'outside the tutorial: the CPU plays as usual');
  m.mode = 'tutorial'; seen.add('g-combat'); ok(!lib.tutorialScriptedCpuPlay(m, []), 'once the step has been seen: the CPU plays as usual'); seen.delete('g-combat');
}
// wiring
ok(/if\(!\(\(\)=>\{ try\{ return tutorialScriptedCpuPlay\(m, events\); \}catch\(e\)\{ return false; \} \}\)\(\)\) m\.engine\.aiTakeTurn\(m\.players, m\.sideOf, 2, m\.stats, events\);/.test(fnSrc('aiActNow')), 'aiActNow runs the scripted play first and skips the CPU\'s own turn when it played');
ok(/\{id:'g-combat', stage:1, block:true, when:m=> tutLessonBoard\(m\) \|\| m\.round>=5,/.test(src), 'g-combat waits for the lesson board (round 5 fallback)');
ok(/if\(tip\.id === 'g-combat'\) tutCombatLines\(\);/.test(fnSrc('showCoachTip')), 'the step draws the lines while it is up');
ok(/coachOpen\.tip\.id === 'g-combat'\)\{ tutCombatLinesSig = ''; try\{ clearFacing\(\); \}/.test(fnSrc('hideCoachTip')), 'and clears them when it goes');
const tcl = fnSrc('tutCombatLines');
ok(/allCardsOnBoard\(m\.players\[1\]\)/.test(tcl) && /showFacingAll\(uids\)/.test(tcl), 'tutCombatLines draws every one of your units\' lines');
ok(/clearFacing\(\); \(uids \|\| \[\]\)\.forEach\(u=> showFacing\(u, \{keep:true\}\)\)/.test(fnSrc('showFacingAll')), 'showFacingAll keeps adding lines');
{ const sf = fnSrc('showFacing'); ok(/if\(!keep\) clearFacing\(\);/.test(sf) && /svg\.innerHTML = \(keep \? svg\.innerHTML : ''\) \+ html;/.test(sf), 'showFacing({keep}) adds to the lines already drawn'); }
ok(/async function resolveRoundCore\(opts\)\{[\s\S]{0,1200}if\(!retry\) await waitForBlockingCoach\(m\);/.test(src), 'the round waits for the blocking step before its fight');

// --- 2. the Outskirts wait for the "Add to deck" window
ok(/const onToMap = \(\)=>\{ toMap\(null\); after\(\); \};/.test(src) && /if\(first\) popTutorialRewardStep\(\(\)=> openDeckTopUpStep\(tutorialRewards2\(pick(, true[^)]*\*\/)?\), onToMap\), onToMap\); else onToMap\(\);/ /* 2026-10-23 (RW5): the grant passes forGrant */.test(src), 'part 2: the map loads from the window\'s close (or at once on a replay)');
ok(!/toMap\(null\); \/\/ the training-wheels dialogue says it \(2026-10-12: fewer toasts\)\n\s*\/\/ 2026-10-16: out of the fight and onto the map first/.test(src), 'the map no longer loads before the window');
{ const pt = fnSrc('popTutorialRewardStep'); ok(/function popTutorialRewardStep\(open, onFail\)/.test(pt) && /if\(onFail\) try\{ onFail\(\); \}/.test(pt), 'a window that fails to open still loads the map'); }
ok(/tutRewardClose\(ov, onDone\)/.test(fnSrc('openDeckTopUpStep')), 'the window calls back once it has faded out');
{ // the stand-in map under the window has no title: the Tutorial map's title waits for a visit after the Outskirts
  ok(/const tutTitleWait = map\.id === 'mtut' && \(!loadTutorial2Done\(\) \|\| /.test(src), 'the Tutorial map keeps its title back');
}

// --- 3. the Quarry Mole toast
const mop = fnSrc('maybeOpenPitching');
ok(mop && !/showToast/.test(mop), 'maybeOpenPitching shows no toast');
ok(/queueDeckSwap\(\{id:h\.id, forced:true, teach:'lumber'\}\)/.test(mop) && /unlockCardForPlayer\(h\.id, h\.source \|\| 'reward'\)/.test(mop), 'each card that waited is unlocked and comes up in the central swap window');
ok(!inCode(src, /you-re-ready-for-bigger-cards/) && !/you-re-ready-for-bigger-cards/.test(texts), 'the toast text is gone from the code and the TEXT table');
ok(/item\.teach === 'lumber' \? TX\('ui\.swap-teach-lumber'\)/.test(fnSrc('maybeOfferDeckSwap')), 'the swap window says what Lumber is for');
ok(/"ui\.swap-teach-lumber": "It costs 🪵 Lumber: pitch a card you don't need to the Graveyard for Lumber, then play it\."/.test(texts), 'ui.swap-teach-lumber is in the TEXT table');
{ // run it: a held card is unlocked and queued, no toast
  const q = [], unl = [], toasts = [];
  let held = [{id:'quarry-mole', source:'conquestCardDrop'}];
  const f = new Function('loadPitchHeld', 'pitchingUnlocked', 'localStorage', 'PITCH_HELD_KEY', 'unlockCardForPlayer', 'getCardDefs', 'swapEligibleDef', 'queueDeckSwap', 'showToast', mop + '\nreturn maybeOpenPitching;')(
    ()=> held, ()=> true, {removeItem:()=>{ held = []; }}, 'k', (id, s)=> unl.push([id, s]), ()=> defs, d=> !!d && typeof d.attack === 'number', it=> q.push(it), t=> toasts.push(t));
  f();
  ok(unl.length === 1 && unl[0][0] === 'quarry-mole' && q.length === 1 && q[0].id === 'quarry-mole' && q[0].forced && q[0].teach === 'lumber' && !toasts.length, 'Quarry Mole: unlocked, queued for the swap window, no toast');
  f(); ok(unl.length === 1 && q.length === 1, 'nothing more once the held list is empty');
}
{ const ld = fnSrc('maybeOfferDeckSwap'); ok(/const out = item\.forced \? weakestDeckCard\(id\b/.test(ld) && /if\(item\.forced\) setDialogueFlag/.test(ld) && /dsCancel/.test(ld), 'a forced swap trades the weakest card and can be cancelled'); }

// --- 4. a bramble won is a card
const rp = fnSrc('rewardsPanelHTML'), rc = fnSrc('rewardCastleCardHTML');
ok(!inCode(src, /conquestCastleSpare/), 'no more m.conquestCastleSpare text');
ok(!/fuse-it-in-the-forge-castles/.test(src) && !/fuse-it-in-the-forge-castles/.test(texts), 'the old Forge tooltip is gone');
ok(/const castles = rewardCastleDrops\(m\);/.test(rp) && /if\(cards\.length \|\| castles\.length(?: \|\| baseCopyIds\.length)?(?: \|\| eggCards\.length \|\| pl2Mat\.length)?\)/.test(rp) /* 2026-10-24 (RW6): + Base cards as card tiles; 2026-10-25 (PL2): + eggs and card-form materia */ && /\$\{castles\.map\(rewardCastleCardHTML\)\.join\(''\)\}|castles\.forEach\(c=> tiles\.push\(rewardCastleCardHTML\(c\)\)\)/.test(rp) /* 2026-10-25 (PL2): tiles stack */, 'brambles join the cards won');
ok(!/rw-act rw-castle/.test(rp), 'no bramble chip in the Rewards block');
ok(/m\.conquestCastleDrops = \(m\.conquestCastleDrops\|\|\[\]\)\.concat\(\[\{id:cd\.id, kind:cd\.kind === 'new' \? 'new' : 'spare'\}\]\)/.test(src), 'a dropped bramble is recorded as {id, kind}');
ok(/m\.conquestCastleDrops = \(m\.conquestCastleDrops\|\|\[\]\)\.concat\(cs\.map\(ch=> \(\{id:ch\.id, kind:'spare'\}\)\)\)/.test(src), 'a boss\'s spare bramble too');
{ // render it
  const CHARACTER_DEFS = {farmstead:{id:'farmstead', name:'Farmstead', icon:'🏡', health:10, rarity:'common'}};
  const TXT = {'results.spare-bramble-tip':'{name}: you already have this bramble. Fuse the spare in the Forge to level it up.', 'results.now-in-your-collection':'{v1} — now in your collection', 'results.spare':'SPARE', 'results.new':'NEW!'};
  const TX = (k, v)=> (TXT[k] || k).replace(/\{(\w+)\}/g, (_, n)=> v && v[n] != null ? v[n] : '');
  const calls = [];
  const cardTileHTML = (d, o)=>{ calls.push([d, o]); return `<div class="card-tile${o && o.isCastle ? ' is-castle' : ''}">${d.name}</div>`; };
  const esc = s=> String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const R = new Function('CHARACTER_DEFS', 'TX', 'cardTileHTML', 'escapeAttr', fnSrc('rewardCastleDrops') + '\n' + rc + '\nreturn {rewardCastleDrops, rewardCastleCardHTML};')(CHARACTER_DEFS, TX, cardTileHTML, esc);
  const fresh = R.rewardCastleCardHTML({id:'farmstead', kind:'new'}), spare = R.rewardCastleCardHTML({id:'farmstead', kind:'spare'});
  ok(/^<div class="rw-card is-unlock rw-castle is-first-seen"/.test(fresh) && /class="card-tile is-castle"/.test(fresh) && calls[0][1].isCastle && calls[0][1].inPlay, 'a new bramble: a card tile drawn as a bramble card');
  ok(/data-tip="Farmstead — now in your collection"/.test(fresh) && /<span class="rw-new" aria-hidden="true">NEW!<\/span>/.test(fresh) && !/Forge/.test(fresh), 'a new bramble: NEW!, "now in your collection", no Forge line');
  ok(/rw-castle is-first-seen is-spare"/.test(spare) && /rw-new rw-spare" aria-hidden="true">SPARE</.test(spare) && /data-tip="Farmstead: you already have this bramble\. Fuse the spare in the Forge to level it up\."/.test(spare), 'a spare: SPARE, and the plain Forge line only there');
  ok(R.rewardCastleDrops({conquestCastleDrops:[{id:'farmstead', kind:'new'}, {id:'gone', kind:'new'}, null]}).length === 1 && R.rewardCastleDrops({}).length === 0, 'unknown brambles are skipped');
}
ok(/\.rw-new\.rw-spare\{background:linear-gradient/.test(tpl), 'the SPARE tag has its own colours');
ok(/c\.querySelector\('\.rw-card\.rw-castle, \.rw-act\.rw-castle'\)/.test(fxf) && /el\.classList\.contains\('is-spare'\)/.test(fxf), 'the results fx finds the bramble card (New bramble! / Spare bramble)');
ok(/"results\.spare-bramble-tip": "\{name\}: you already have this bramble\./.test(texts) && /"results\.spare": "SPARE"/.test(texts), 'the new texts are TX keys');
{ // every pack has the new texts
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const want = ["It costs 🪵 Lumber: pitch a card you don't need to the Graveyard for Lumber, then play it.", '{name}: you already have this bramble. Fuse the spare in the Forge to level it up.', 'SPARE'];
  const miss = []; codes.forEach(c=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); want.forEach(w=>{ if(!p[w] || (/\{name\}/.test(w) && !/\{name\}/.test(p[w]))) miss.push(c + ': ' + w.slice(0, 20)); }); });
  ok(!miss.length, 'all 12 packs translate the new texts' + (miss.length ? ' (missing ' + miss.join(', ') + ')' : ''));
}

// --- the build carries it
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok(['function tutorialScriptedCpuPlay(', 'function tutLessonBoard(', 'function tutCombatLines(', 'function rewardCastleCardHTML(', '.rw-new.rw-spare{'].every(s=> idx.includes(s)), 'index.html is rebuilt with the changes');

console.log(fail ? `t-2026-10-19: ${fail} of ${checks} checks failed` : `t-2026-10-19: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
