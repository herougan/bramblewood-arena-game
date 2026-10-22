#!/usr/bin/env node
// Package EB (2026-10-23, owner 01:57 note 1: "Map 1 was extremely difficult to beat ... our real deck must be actually stronger"):
// the early road (T-1, T-2, Map 0, Map 1) for a fresh player's real deck, every side.
//   node tools/eb_early_road_2026_10_23.js [games=40] [--canon] [--lv1] [--fights=<regex>] [--sides=otters,hummingbirds,both] [--deck=<json>]
//        [--before] [--out=<file.json>] [--decks] [--patch=<json: {fightKey: node fields}>]
// Reads the game's own fight build through tools/lib_bramble.js (referenceFightSetup / playReferenceGame), so the enemy levels, brambles,
// Shields, rules and CPU levels are what the game builds. Your side:
//   - the starting deck the game builds after T-2 (ebStarterDeck: starterDeckParts + T-1's and T-2's rewards), from the live __cfg:tutorial
//     lists of 2026-10-22 (LIVE_CFG below; the live row wins over STARTER_CFG_DEFAULT in the game);
//   - every copy at Level 0 (tutorialStarterCopiesLevel0), so a card whose own level is 1 plays at its Level 0 stats (--lv1: printed stats);
//   - your bramble as the game builds it (ebPlayerBrambleHp: the early lead) on the road, the tutorial's own Health in T-1 / T-2;
//   - the owner's live stat edits of the weak Base cards (LIVE, card_overrides of 2026-10-22; --canon leaves them out).
// --before: the pre-EB rules (the old starting deck build, no bramble lead, the old tutorial brambles), for the before / after table.
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools/lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const args = process.argv.slice(2), opt = k=>{ const a = args.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const GAMES = +(args.find(a=> /^\d+$/.test(a)) || 40), BEFORE = args.includes('--before');
const LIVE = {'duckling':[1,5], 'harvest-mouse':[1,6], 'earthworm':[0,6], 'meadow-rabbit':[4,2], 'otter-kit':[2,5], 'silver-minnow':[2,4]};
if(!args.includes('--canon')) Object.entries(LIVE).forEach(([id, [a, h]])=>{ if(D[id]) Object.assign(D[id], {attack: a, health: h}); });
const ev = name=>{ const s = B.grab(name); return eval('(' + s.slice(s.indexOf('=') + 1).trim().replace(/;\s*$/, '') + ')'); };
const LIVE_CFG = {starterShared:{'pond-trout':3,'meadow-frog':2,'crossed-eyes':1,'duck-paddler':2}, starterOtters:{'otter-kit':2,'fleetfootd':1,'otter-centurion':2},
  starterHummingbirds:{'mosswing-laborer':1,'crimson-wing-recruit':2,'cobalt-talon-fledgling':2}, starterBoth:{'dormouse':1,'otter-kit':2,'otter-paddler':2},
  starterFiller:{'honey-bee':3,'silver-minnow':3,'sparrow-chick':3}, rewards:['quarry-mole'],
  rewards2:{both:['riverwing-envoy','sunspire-envoy'], otters:['river-warden','otter-centurion'], hummingbirds:['sunspire-envoy','crimson-wing-recruit']},
  myHp:8, rivalHp:12, myDeck:{"duckling":1,"pond-duck":1,"cottontail":1,"pond-trout":1,"silver-minnow":1,"acorn-chipmunk":1,"chipmunk-forager":1},
  myDeck2:{"duckling":1,"honey-bee":1,"pond-duck":2,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2},
  rivalDeck:{"duckling":3,"earthworm":3,"harvest-mouse":3,"silver-minnow":3}, rivalDeck2:{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}};
const SD = ev('STARTER_CFG_DEFAULT'), cfg = Object.assign({}, SD, LIVE_CFG);
// the pre-EB build (PG's starterDeckParts + the rewards), kept here for --before and for a build without EB
function oldStarterDeck(pick){
  const side = pick === 'otters' ? cfg.starterOtters : pick === 'hummingbirds' ? cfg.starterHummingbirds : cfg.starterBoth, other = pick === 'otters' ? 'hummingbirds' : pick === 'hummingbirds' ? 'otters' : null;
  const ids = [], seen = new Set(), take = id=>{ if(!D[id] || seen.has(id) || D[id].token) return; if(other && D[id].faction === other) return; seen.add(id); ids.push(id); };
  [side || {}, cfg.starterShared, cfg.starterFiller || {}].forEach(l=> Object.keys(l).forEach(id=>{ if((l[id] | 0) > 0) take(id); }));
  ['pond-duck', 'acorn-chipmunk', 'cottontail', 'chipmunk-forager', 'river-carp', 'burrow-rabbit', 'meadow-rabbit', 'duckling', 'harvest-mouse', 'sheep', 'garden-snail', 'earthworm', 'guppy'].forEach(take);
  const r2 = (LIVE_CFG.rewards2[pick] || []).filter(id=> D[id]), target = Math.max(8, 20 - r2.length), deck = {};
  ids.slice(0, target).forEach(id=> deck[id] = 1); r2.forEach(id=> deck[id] = (deck[id] || 0) + 1);
  return deck;
}
// the game's own starterDeckParts (+ starterTopUpList, starterDeckTarget) run on the live lists, with the T-2 rewards added
function newStarterDeck(pick){
  const f = new Function('getCardDefs', 'tutorialCfg', 'STARTER_CFG_DEFAULT', 'STARTER_SHOWN', 'DECK_SIZE', 'tutorialRewardIds', 'tutorialRewards2',
    [B.grab('PG_STARTER_TOP_UP'), B.grab('starterTopUpList'), B.grab('starterDeckTarget'), B.grab('starterDeckParts'), 'return starterDeckParts;'].join('\n'))(
    ()=> D, cfg, SD, 8, 20, ()=> [], p=> (LIVE_CFG.rewards2[p] || []).filter(id=> D[id]));
  const deck = Object.assign({}, f(pick).all); (LIVE_CFG.rewards2[pick] || []).forEach(id=> deck[id] = (deck[id] || 0) + 1); return deck;
}
const starterDeck = pick=> BEFORE ? oldStarterDeck(pick) : newStarterDeck(pick);
function lv0(deck){ const out = {}; Object.entries(deck).forEach(([id, k])=>{ const d = D[id]; if(!d) throw new Error('unknown card ' + id);
  if(G.cardBaseLevel(d) <= 0 || args.includes('--lv1')){ out[id] = (out[id] || 0) + k; return; }
  const did = id + '@eb0'; if(!D[did]){ const st = G.statsAtLevel(d, 0); D[did] = Object.assign({}, d, {id: did, derivedFrom: id, attack: st.attack, health: st.health, level: 0}); }
  out[did] = (out[did] || 0) + k; }); return out; }
const byMap = id=> G.CONQUEST_MAPS.find(m=> m.id === id);
const pct = v=> Math.round(v * 1000) / 10;
function runFight(mapId, node, deck, games){
  // --before: Map 0's 0-2 / 0-3 defended the Outskirts Watchtower (+1 Attack to the first unit), your bramble had no lead
  if(BEFORE && mapId === 'm1' && /^0-[23]$/.test(node.key)){ node = Object.assign({}, node, {characterId: 'outskirts-watchtower'}); G.NODE_MAP_HINT.set(node, mapId); }
  const ctx = G.referenceFightSetup(mapId, node, {deck: lv0(deck), level: 0});
  if(BEFORE) ctx.myCastle = Object.assign({}, ctx.myCastle, {health: 15});
  let w = 0, rounds = 0; for(let g = 0; g < games; g++){ const r = G.playReferenceGame(ctx, g); if(r.win){ w++; rounds += r.rounds; } }
  return {win: pct(w / games), hp: ctx.sc.hp, shield: ctx.sc.shield, my: ctx.myCastle.health, castle: ctx.sc.character.id, fx: Object.keys(ctx.sc.character.effects || {}).join(',') || '-', rounds: w ? Math.round(rounds / w * 10) / 10 : null};
}
// T-1 / T-2: their own decks (cfg.myDeck / myDeck2 against rivalDeck / rivalDeck2), the CPU at level 0, open mode, no field
function runTutorial(st, games){
  const node = byMap('mtut').nodes.find(n=> n.kind === 'tutorial' && (n.stage === 2 ? 2 : 1) === st), base = byMap('m1').nodes[0];
  const ctx = G.referenceFightSetup('m1', base, {deck: st === 2 ? cfg.myDeck2 : cfg.myDeck, level: 0});
  ctx.enemyDeck = Object.assign({}, st === 2 ? cfg.rivalDeck2 : cfg.rivalDeck); ctx.rules = {}; ctx.mode = 'open'; ctx.cpu = 0; ctx.setup = {hq: {}};
  const half = v=> Math.max(1, Math.round(v * 0.5)), rivalRaw = Number(node.tutHp) || (cfg.rivalHp + (st >= 2 ? 2 : 0));
  const myOwn = half(Math.min(8, cfg.myHp || 8)), my = BEFORE ? myOwn : G.earlyBrambleHp(myOwn, half(rivalRaw));
  const watch = BEFORE && st >= 2; // EB: both tutorial rivals defend a plain bramble (before: part 2's was the Outskirts Watchtower)
  ctx.sc = Object.assign({}, ctx.sc, {character: {id: watch ? 'outskirts-watchtower' : 'tutorial-rival', name: 'rival', health: half(rivalRaw), effects: watch ? {firstUnitAtkBonus: 1} : {}}, hp: half(rivalRaw), shield: 0});
  ctx.myCastle = Object.assign({}, ctx.myCastle, {health: my});
  let w = 0; for(let g = 0; g < games; g++){ if(G.playReferenceGame(ctx, g).win) w++; }
  return {win: pct(w / games), hp: half(rivalRaw), my, castle: ctx.sc.character.id, fx: watch ? 'firstUnitAtkBonus' : '-'};
}
function main(){
  const PATCH = opt('patch') ? JSON.parse(opt('patch')) : {};
  const sides = (opt('sides') || 'otters,hummingbirds,both').split(','), deckOverride = opt('deck') ? JSON.parse(opt('deck')) : null, re = new RegExp(opt('fights') || '.');
  const out = {about: 'Package EB early road: ' + (BEFORE ? 'before (pre-EB rules)' : 'after'), games: GAMES, liveStats: !args.includes('--canon'), copiesAt: args.includes('--lv1') ? 'printed' : 'Level 0', decks: {}, fights: []};
  sides.forEach(s=> out.decks[s] = deckOverride || starterDeck(s));
  [1, 2].forEach(st=>{ if(re.test('T-' + st)) out.fights.push(Object.assign({code: 'T-' + st, target: null}, runTutorial(st, GAMES))); });
  ['m1', 'mf'].forEach(mid=> byMap(mid).nodes.filter(n=> n.deck && n.kind !== 'tutorial').forEach(n=>{
    if(!re.test(n.key)) return;
    if(PATCH[n.key]){ n = Object.assign({}, n, PATCH[n.key]); G.NODE_MAP_HINT.set(n, mid); } // --patch: a trial edit of the fight (nothing is written)
    const row = {code: n.key, kind: n.kind || 'skirmish', target: Math.round(G.roadCurveTarget(mid, n).t * 100), enemyLevel: G.roadEnemyLevelExact(n), res: {}};
    sides.forEach(s=>{ row.res[s] = runFight(mid, n, out.decks[s], GAMES); });
    row.mean = pct(sides.reduce((a, s)=> a + row.res[s].win / 100, 0) / sides.length);
    out.fights.push(row);
  }));
  if(opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(out, null, 1));
  out.fights.forEach(f=> console.log(f.code.padEnd(5), f.target != null ? ('t' + f.target).padEnd(5) : '     ', f.res
    ? sides.map(s=> s.slice(0, 2) + ' ' + String(f.res[s].win).padStart(5)).join('  ') + '  mean ' + f.mean + '  enemy ' + f.res[sides[0]].hp + '+' + f.res[sides[0]].shield + ' (' + f.res[sides[0]].fx + ') vs ' + f.res[sides[0]].my + '  Lv ' + f.enemyLevel
    : 'win ' + f.win + '  rival ' + f.hp + ' (' + f.fx + ') vs ' + f.my));
  if(args.includes('--decks')) console.log(JSON.stringify(out.decks));
}
if(require.main === module) main();
module.exports = {G, D, cfg, starterDeck, runFight, runTutorial, byMap};
