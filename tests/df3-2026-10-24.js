#!/usr/bin/env node
// 2026-10-24 (package DF3: the selfish boons, DF-3 and the owner's 22:23 #6; DF-4's retune of Maps 7, 11 and 14). Checks:
//   1. the library: 12 boons, each with a theme, a `who`, its TX name and text, in all 12 language packs; the count rule (at least half the
//      deck as dealt; off below it) and the engine's boonState;
//   2. every boon does something, on the boon's side only (side B, the CPU), and nothing when its theme count falls short: Blind Fury's 2x
//      in the dark, Hive Chorus's doubled Swarm, Rising Tide's Quick at Flood, Second Burrow's way back to the hand (once), Wild Rage at 3/4,
//      Snow Veil's 2 in 3 dodge, Sand Veil's 1 in 2 in the Sandstorm, Restless Dead's full-Health Revive, Ember-born's heat immunity, Siege
//      Train's and Venom Glands' doubled numbers, Sky Ambush's Quick; a boonFire event; no boon = no change (the same seed, the same fight);
//   3. the placements: only challenge skirmishes carry a boon (never a normal skirmish, an elite or a boss); the main road from Map 5 has one
//      every two maps at most (none on Maps 7, 11, 14), a side map at most one; each challenge deck turns its boon on and keeps the deck rules
//      (5-7 cards, the copy ladder, the road's rarity cap, its leader);
//   4. DF-4: Maps 7, 11 and 14 keep the deck rules and their leaders after the retune, and their measured means rose toward the curve
//      (docs/balance/skirmish-pass-df3-before / -after-2026-10-24.jsonl);
//   5. the measured challenge fights (docs/balance/df3-boons-2026-10-24.json): every placement measured with and without its boon;
//   6. the page: fieldConditionRows names the boon, the Environment card is red-framed with "Theirs" and the count, the panel's Challenge pill,
//      the editor's boon group, the log line and the boonFire VFX hook (source checks; the browser test is tests/e2e/df3_2026_10_24.py).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, src = B.src;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const D0 = H.loadCardDefs();
const sideOf = id=> id === 1 ? 'A' : 'B';
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const TXT = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const txOf = k=>{ const m = new RegExp('"' + k.replace(/[.]/g, '\\.') + '": ("(?:[^"\\\\]|\\\\.)*")').exec(TXT); return m ? JSON.parse(m[1]) : null; };

// ---- 1. the library
const BOONS = E.SELFISH_BOONS, IDS = Object.keys(BOONS);
ok(IDS.length === 12, `1. twelve boons (got ${IDS.length})`);
const packs = CODES.map(c=> Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'))));
const generic = ['ui.df3-theirs', 'ui.df3-on', 'ui.df3-off', 'ui.df3-challenge', 'ui.df3-challenge-tip', 'ui.df3-log'];
for(const id of IDS){ const b = BOONS[id];
  ok(b.icon && b.theme && ((b.theme.types || []).length || (b.theme.skills || []).length) && b.who, `1. ${id}: an icon, a theme and a who`);
  for(const k of ['ui.df3-' + id + '-name', 'ui.df3-' + id]){ const en = txOf(k); ok(!!en, `1. ${k} is a TX text`);
    if(en) CODES.forEach((c, i)=> ok(!!packs[i][en], `1. ${c} translates "${en.slice(0, 40)}"`)); } }
for(const k of generic){ const en = txOf(k); ok(!!en, `1. ${k} is a TX text`); if(en) CODES.forEach((c, i)=> ok(!!packs[i][en], `1. ${c} translates "${en.slice(0, 40)}"`)); }
ok(!/\/\*|\/\/ /.test(TXT.slice(TXT.indexOf('"ui.df3-blindFury-name"'), TXT.indexOf('/*TEXT-TABLE-END*/'))), '1. no comments inside the TEXT table');
{ const st = E.selfishBoonCount(D0, {'cave-cricket': 4, 'beaver-builder': 4}, 'blindFury'), st2 = E.selfishBoonCount(D0, {'cave-cricket': 4, 'beaver-builder': 5}, 'blindFury');
  ok(st.have === 4 && st.total === 8 && st.need === 4 && st.on, '1. at least half: 4 of 8 Cave is on');
  ok(st2.have === 4 && st2.total === 9 && st2.need === 5 && !st2.on, '1. 4 of 9 is off (needs 5)');
  ok(E.selfishBoonCount(D0, {}, 'blindFury').on === false && E.selfishBoonCount(D0, {'cave-cricket': 1}, 'nope') === null, '1. an empty deck is off; an unknown boon has no count'); }

// ---- 2. the engine
// One scene: rules (+ boon), deck counts for each side (the boon counts B's), units placed on lanes, N rounds of combat.
function scene(o){
  const defs = Object.assign({}, D0), engine = E.makeSimEngine(defs, H.seededRng(o.seed || 1), {recordEvents: true, rules: o.rules || {}});
  const players = {1: engine.newPlayer(1, o.deckA || {}), 2: engine.newPlayer(2, o.deckB || {})}; const stats = {}, events = [];
  if(o.hqHp){ players[1].hq.hp = players[1].hq.maxHp = o.hqHp; players[2].hq.hp = players[2].hq.maxHp = o.hqHp; }
  const put = (pid, list)=> (list || []).forEach(c=>{ const had = new Set(H.boardCards(players[pid]).map(x=> x.uid)); engine.debugSpawnCard(players, sideOf, pid, c.id, c.side || 'center', stats, events);
    const bc = H.boardCards(players[pid]).find(x=> !had.has(x.uid)); if(c.hp != null){ bc.hp = c.hp; if(c.maxHp != null) bc.maxHp = c.maxHp; } if(c.attack != null) bc.atk = bc.baseAtk = c.attack; if(c.wait != null) bc.wait = c.wait; });
  put(1, o.A); put(2, o.B);
  for(let r = 1; r <= (o.rounds || 1); r++){ if(r > 1) engine.roundStart(players, r, sideOf, stats, events); if(engine.resolveCombat(players, sideOf, stats, events, o.first || 2)) break; }
  return {engine, players, events, defs};
}
const firstHit = (s, side)=> s.events.find(e=> e.type === 'hit' && e.side === side && !e.counter);
const fired = (s, id)=> s.events.some(e=> e.type === 'boonFire' && e.boon === id && e.side === 'B');
const mark = (s, pid)=> H.boardCards(s.players[pid]).map(c=> c.boon || null);

// Blind Fury: a Cave unit without Darksight swings blind in the Darkness: 2x, for side B only
{ let pair = null;
  for(let seed = 1; seed < 40 && !pair; seed++){
    const base = {seed, deckB: {'cave-cricket': 10}, A: [{id: 'beaver-builder', attack: 0, hp: 40, maxHp: 40}], B: [{id: 'cave-cricket', wait: 0}]};
    const on = scene(Object.assign({}, base, {rules: {dark: 'dark', boon: 'blindFury'}})), off = scene(Object.assign({}, base, {rules: {dark: 'dark'}}));
    const h1 = firstHit(on, 'B'), h0 = firstHit(off, 'B'); if(h1 && h0 && h0.dmg > 0) pair = {h1, h0, on}; }
  ok(pair && pair.h1.dmg === 2 * pair.h0.dmg, `2. Blind Fury: a blind Cave unit hits 2x in the dark (${pair && pair.h0.dmg} -> ${pair && pair.h1.dmg})`);
  ok(pair && fired(pair.on, 'blindFury'), '2. Blind Fury sends a boonFire event');
  const mirror = scene({seed: 3, rules: {dark: 'dark', boon: 'blindFury'}, deckA: {'cave-cricket': 10}, deckB: {'cave-cricket': 10}, A: [{id: 'cave-cricket', wait: 0}], B: [{id: 'beaver-builder', attack: 0}]});
  ok(mark(mirror, 1).every(x=> !x), '2. Blind Fury never marks side A, whatever its deck (selfish)');
  const short = scene({seed: 3, rules: {dark: 'dark', boon: 'blindFury'}, deckB: {'cave-cricket': 4, 'beaver-builder': 6}, B: [{id: 'cave-cricket', wait: 0}]});
  ok(mark(short, 2).every(x=> !x) && short.engine.boonState(short.players).on === false, '2. Blind Fury is off when under half the deck is Cave');
  ok(scene({seed: 3, rules: {dark: 'dark', boon: 'blindFury'}, deckB: {'cave-cricket': 10}, B: [{id: 'cave-cricket'}]}).engine.boonState === undefined ? false : true, '2. the engine reports boonState'); }
// Hive Chorus: Swarm counts each ally twice
{ const base = {deckB: {'ant-scout': 6, 'ant-warrior': 6}, B: [{id: 'ant-warrior', side: 'center'}, {id: 'ant-scout', side: 'left'}, {id: 'ant-scout', side: 'right'}]};
  const on = scene(Object.assign({}, base, {rules: {boon: 'hiveChorus'}, rounds: 0})), off = scene(Object.assign({}, base, {rules: {}, rounds: 0}));
  const w1 = H.boardCards(on.players[2]).find(c=> /ant-warrior/.test(c.defId)), w0 = H.boardCards(off.players[2]).find(c=> /ant-warrior/.test(c.defId));
  const s1 = on.engine.swarmBonusOf(on.players, w1), s0 = off.engine.swarmBonusOf(off.players, w0);
  ok(s0 > 0 && s1 === 2 * s0, `2. Hive Chorus: Swarm counts each ally twice (${s0} -> ${s1})`); }
// Rising Tide: Quick while the tide is in (River Rapids: always Flood)
{ const s = scene({rules: {permaTide: true, boon: 'risingTide'}, deckB: {'guppy': 10}, B: [{id: 'guppy', wait: 0}], A: [{id: 'beaver-builder', attack: 0}]});
  const g = H.boardCards(s.players[2])[0], s0 = scene({rules: {permaTide: true}, deckB: {'guppy': 10}, B: [{id: 'guppy', wait: 0}], A: [{id: 'beaver-builder', attack: 0}]}), g0 = H.boardCards(s0.players[2])[0];
  ok(g.boon === 'risingTide' && !!s.defs[g.defId].effects.quick && !s0.defs[g0.defId].effects.quick, '2. Rising Tide: a Tide unit is Quick at Flood (and not without the boon)');
  const dry = scene({rules: {boon: 'risingTide'}, deckB: {'guppy': 10}, B: [{id: 'guppy', wait: 0}], A: [{id: 'beaver-builder', attack: 0}]}), gd = H.boardCards(dry.players[2])[0];
  ok(!dry.defs[gd.defId].effects.quick, '2. Rising Tide: no Quick while the tide is out'); }
// Second Burrow: the first death goes back to the hand (once)
{ const s = scene({rules: {boon: 'secondBurrow'}, deckB: {'chipmunk-forager': 10}, B: [{id: 'chipmunk-forager', hp: 1, wait: 0, attack: 0}], A: [{id: 'beaver-builder', attack: 9, wait: 0}]});
  const back = s.players[2].hand.find(h=> h.boonBack); ok(!!back && /chipmunk-forager/.test(back.defId) && !s.players[2].graveyard.some(g=> /chipmunk-forager/.test(g.defId)), '2. Second Burrow: a burrower that dies goes back to its owner\'s hand, not the graveyard');
  ok(fired(s, 'secondBurrow') && s.events.some(e=> e.type === 'death' && e.burrowed), '2. Second Burrow: its death event says so, and a boonFire');
  // played again, it dies for good
  s.engine.debugSpawnCard(s.players, sideOf, 2, back.defId, 'left', {}, s.events); const again = H.boardCards(s.players[2]).find(c=> /chipmunk-forager/.test(c.defId)); again.boonBack = true; again.hp = 1; again.atk = 0;
  s.engine.resolveCombat(s.players, sideOf, {}, s.events, 2);
  ok(!s.players[2].hand.some(h=> h.boonBack && h !== back) && s.players[2].graveyard.some(g=> /chipmunk-forager/.test(g.defId)), '2. Second Burrow: once only (the second death is final)');
  const s0 = scene({rules: {}, deckB: {'chipmunk-forager': 10}, B: [{id: 'chipmunk-forager', hp: 1, wait: 0, attack: 0}], A: [{id: 'beaver-builder', attack: 9, wait: 0}]});
  ok(!s0.players[2].hand.some(h=> h.boonBack), '2. without the boon it stays dead'); }
// Wild Rage: Rage at 3/4 Health
{ const mk = rules=> scene({rules, deckB: {'berserker-boar': 10}, B: [{id: 'berserker-boar', wait: 0, hp: 6, maxHp: 9}], A: [{id: 'beaver-builder', attack: 0, hp: 60, maxHp: 60}]});
  const on = mk({boon: 'wildRage'}), off = mk({}), h1 = firstHit(on, 'B'), h0 = firstHit(off, 'B');
  ok(h1 && h0 && h0.dmg > 0 && h1.dmg === 2 * h0.dmg, `2. Wild Rage: a Rage unit at 2/3 Health rages (${h0 && h0.dmg} -> ${h1 && h1.dmg})`); }
// Snow Veil / Sand Veil: the dodge odds, over many seeds
{ const rate = (rules, deckB, defId, n)=>{ let miss = 0, swings = 0; for(let seed = 1; seed <= n; seed++){
      const s = scene({seed, rules, deckB, B: [{id: defId, attack: 0, hp: 99, maxHp: 99}], A: [{id: 'beaver-builder', attack: 1, wait: 0}]});
      s.events.forEach(e=>{ if(e.side === 'A' && (e.type === 'hit' || e.type === 'miss' || e.type === 'evaded')){ swings++; if(e.type !== 'hit') miss++; } }); } return swings ? miss / swings : 0; };
  const sv1 = rate({boon: 'snowVeil'}, {'snow-ermine': 10}, 'snow-ermine', 300), sv0 = rate({}, {'snow-ermine': 10}, 'snow-ermine', 300);
  ok(sv0 > 0.4 && sv0 < 0.6 && sv1 > 0.58 && sv1 < 0.76, `2. Snow Veil: an Evasive unit dodges 2 in 3, not 1 in 2 (${sv0.toFixed(2)} -> ${sv1.toFixed(2)})`);
  const sd1 = rate({sandstorm: true, boon: 'sandVeil'}, {'dromedary': 10}, 'dromedary', 300), sd0 = rate({sandstorm: true}, {'dromedary': 10}, 'dromedary', 300);
  ok(sd0 > 0.15 && sd0 < 0.35 && sd1 > 0.4 && sd1 < 0.6, `2. Sand Veil: in a Sandstorm attacks at a Desert unit miss 1 in 2, not 1 in 4 (${sd0.toFixed(2)} -> ${sd1.toFixed(2)})`); }
// Restless Dead: Revive at full Health
{ const mk = rules=> scene({rules, deckB: {'cinder-skeleton': 10}, B: [{id: 'cinder-skeleton', hp: 1, wait: 0, attack: 0}], A: [{id: 'beaver-builder', attack: 3, wait: 0}]});
  const on = mk({boon: 'restlessDead'}), off = mk({}); const c1 = H.boardCards(on.players[2])[0], c0 = H.boardCards(off.players[2])[0];
  ok(c1 && c0 && c0.hp === 1 && c1.hp === c1.maxHp && c1.maxHp > 1 && fired(on, 'restlessDead'), `2. Restless Dead: Revive brings it back at full Health (${c0 && c0.hp} -> ${c1 && c1.hp})`); }
// Ember-born: a Volcanic unit is immune to heat (a Lava Spout column)
{ const mk = rules=> scene({rules, deckB: {'cinder-stoker': 10}, B: [{id: 'cinder-stoker', attack: 0}], A: [{id: 'beaver-builder', attack: 0}], rounds: 3});
  const taken = s=> s.events.filter(e=> e.type === 'fieldTick' && e.side === 'B' && e.dmg != null).reduce((a, e)=> a + e.dmg, 0);
  const on = mk({lavaSpout: true, boon: 'emberBorn'}), off = mk({lavaSpout: true});
  ok(taken(off) > 0 && taken(on) === 0, `2. Ember-born: a Volcanic unit takes no heat from the field (${taken(off)} -> ${taken(on)})`); }
// Siege Train and Venom Glands: the skill number doubles on the unit's card; Sky Ambush: a Flyer is Quick
{ const s = scene({rules: {boon: 'siegeTrain'}, deckB: {'mouse-sapper': 10}, B: [{id: 'mouse-sapper'}], rounds: 0}), c = H.boardCards(s.players[2])[0];
  ok(s.defs[c.defId].effects.siege === 2 * D0['mouse-sapper'].effects.siege, `2. Siege Train: Siege ${D0['mouse-sapper'].effects.siege} -> ${s.defs[c.defId].effects.siege}`);
  const v = scene({rules: {boon: 'venomGlands'}, deckB: {'grass-viper': 10}, B: [{id: 'grass-viper'}], rounds: 0}), cv = H.boardCards(v.players[2])[0];
  ok(v.defs[cv.defId].effects.poison === 2 * D0['grass-viper'].effects.poison, `2. Venom Glands: Poison ${D0['grass-viper'].effects.poison} -> ${v.defs[cv.defId].effects.poison}`);
  const k = scene({rules: {boon: 'skyAmbush'}, deckB: {'cave-flitter': 10}, B: [{id: 'cave-flitter'}], rounds: 0}), ck = H.boardCards(k.players[2])[0];
  ok(!!k.defs[ck.defId].effects.quick && !D0['cave-flitter'].effects.quick, '2. Sky Ambush: a Flyer is Quick');
  const kA = scene({rules: {boon: 'skyAmbush'}, deckA: {'cave-flitter': 10}, deckB: {'cave-flitter': 10}, A: [{id: 'cave-flitter'}], rounds: 0}), cA = H.boardCards(kA.players[1])[0];
  ok(!kA.defs[cA.defId].effects.quick, '2. Sky Ambush never helps side A'); }
// no boon, no change: a whole match on the same seed plays the same with an unknown / absent boon
{ const play = rules=>{ const r = E.simulateOneMatch(Object.assign({}, D0), {'cave-cricket': 8, 'beaver-builder': 6}, {'cave-cricket': 8, 'beaver-builder': 6}, {rnd: H.seededRng(11), rules}); return r.winner + ':' + r.rounds; };
  ok(play({}) === play({boon: 'notABoon'}), '2. an unknown boon id changes nothing'); }

// ---- 3. the placements
const MAPS = G.CONQUEST_MAPS, D = G.getCardDefs();
const challenge = [], wrong = [];
for(const m of MAPS){ if(m.reserved || m.tower) continue; const no = G.mapNumberOf(m.id);
  m.nodes.forEach(n=>{ const b = n.rules && n.rules.boon; G.NODE_MAP_HINT.set(n, m.id);
    if(b && !(n.challenge && (n.kind || 'skirmish') === 'skirmish')) wrong.push((n.code || n.key) + ' ' + n.kind);
    if(n.challenge) challenge.push({m, n, no, b}); }); }
ok(!wrong.length, `3. only challenge skirmishes carry a boon (${wrong.join(', ') || 'none'})`);
ok(challenge.length >= 16, `3. challenge skirmishes placed (${challenge.length})`);
for(const {m, n, no, b} of challenge){ const code = n.code || n.key;
  ok(!!BOONS[b], `3. ${code} names a boon (${b})`);
  ok(no >= 5, `3. ${code} is on Map 5 or later`);
  const st = E.selfishBoonCount(D, n.deck, b); ok(st && st.on, `3. ${code}: its deck turns ${b} on (${st && st.have}/${st && st.total})`);
  const ids = Object.keys(n.deck); ok(ids.length >= 5 && ids.length <= 7, `3. ${code}: 5-7 different cards (${ids.length})`);
  ids.forEach(id=> ok(n.deck[id] <= G.maxCopiesForRarity(D[id].rarity), `3. ${code}: ${id} inside the copy ladder`));
  ids.forEach(id=> ok(G.roadRarityOk(D[id].rarity, no, 'skirmish', m.id), `3. ${code}: ${id} (${D[id].rarity}) inside the road's rarity cap`));
  ok(G.skirmishLeadersOf(n, m.id).every(id=> n.deck[id]), `3. ${code}: it leads with a card of its deck`); }
const mainCh = challenge.filter(c=> !c.m.sub), byPair = {};
mainCh.forEach(c=>{ const k = Math.floor((c.no - 5) / 2); byPair[k] = (byPair[k] || 0) + 1; });
ok(Object.values(byPair).every(v=> v <= 1), `3. the main road: at most one challenge skirmish every two maps (${JSON.stringify(byPair)})`);
ok(!mainCh.some(c=> [7, 11, 14].includes(c.no)), '3. none on Maps 7, 11 and 14 (DF-4 retunes them without boons)');
const bySide = {}; challenge.filter(c=> c.m.sub).forEach(c=> bySide[c.m.id] = (bySide[c.m.id] || 0) + 1);
ok(Object.values(bySide).every(v=> v === 1), `3. a side map holds one at most (${JSON.stringify(bySide)})`);
ok(new Set(challenge.map(c=> c.b)).size >= 10, '3. the boons are reused, and most of the library is in use');

// ---- 4. DF-4
const readJsonl = f=>{ try{ return fs.readFileSync(path.join(ROOT, 'docs', 'balance', f), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const bef = readJsonl('skirmish-pass-df3-before-2026-10-24.jsonl'), aft = readJsonl('skirmish-pass-df3-after-2026-10-24.jsonl');
for(const mapNo of [7, 11, 14]){
  const m = MAPS.find(x=> !x.sub && G.mapNumberOf(x.id) === mapNo);
  m.nodes.forEach(n=>{ if(!n.deck || n.kind === 'raidboss') return; const ids = Object.keys(n.deck); G.NODE_MAP_HINT.set(n, m.id);
    if((n.kind || 'skirmish') === 'skirmish') ok(ids.length >= 5 && ids.length <= 7, `4. ${n.key}: 5-7 different cards (${ids.length})`);
    ids.forEach(id=> ok(n.deck[id] <= G.maxCopiesForRarity(D[id].rarity), `4. ${n.key}: ${id} inside the copy ladder`));
    ok(!(n.rules && n.rules.boon), `4. ${n.key}: no boon (DF-4 uses decks and levels)`); });
  const mean = rows=>{ const r = rows.filter(x=> x.mapNo === mapNo); return r.length ? r.reduce((a, x)=> a + x.win, 0) / r.length : null; };
  const b0 = mean(bef), a0 = mean(aft), t0 = (rows=>{ const r = rows.filter(x=> x.mapNo === mapNo); return r.reduce((a, x)=> a + x.target, 0) / r.length; })(aft);
  ok(b0 != null && a0 != null && a0 > b0 && Math.abs(a0 - t0) < Math.abs(b0 - t0) && Math.abs(a0 - t0) <= 8, `4. Map ${mapNo}: mean ${b0 && b0.toFixed(1)} -> ${a0 && a0.toFixed(1)}, target ${t0.toFixed(1)}`); }

// ---- 5. the measurements
{ let j = null; try{ j = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'df3-boons-2026-10-24.json'), 'utf8')); }catch(e){}
  ok(j && Array.isArray(j.rows) && j.rows.length === challenge.length, '5. every challenge skirmish is measured (docs/balance/df3-boons-2026-10-24.json)');
  (j && j.rows || []).forEach(r=> ok(r.withBoon != null && r.withoutBoon != null && r.count && r.count.on, `5. ${r.code}: measured with and without ${r.boon}`)); }

// ---- 6. the page (source)
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
ok(/function boonRowWithCount\(/.test(src) && /row\.selfish \? ' is-selfish '/.test(src) && /TX\('ui\.df3-theirs'\)/.test(src), '6. the Environment card: red frame class, "Theirs" ribbon, the count line');
ok(/\.card-tile\.env-card\.is-selfish\{/.test(tpl) && /\.cnp-fpill\.is-challenge\{/.test(tpl), '6. the red frame and the Challenge pill are styled');
ok(/node\.challenge \? `<li class="cnp-fpill is-challenge"/.test(src), '6. the fight panel shows the Challenge pill');
ok(/case 'boonFire': return \{cls:'', text:TX\('ui\.df3-log'/.test(src) && /ev\.type === 'boonFire'\)\{ try\{ boonFireVfx\(ev\)/.test(src), '6. the log line and the boonFire VFX');
ok(/grp\('Selfish boons \(the enemy only\)', by\(\['boon'\]\)\)/.test(src), '6. Edit skirmish offers the boons in their own group');

console.log(`df3-2026-10-24: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
