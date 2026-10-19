#!/usr/bin/env node
// Skirmish rough balance pass (2026-10-18, package SKB, owner 15:56: "Have you done a card balance pass for all cards, then a
// skirmish rough balancing pass. as long it's not auto winnable or always loseable.").
//
// Plays every Conquest fight the way the game builds it today, not the way the older tools approximated it:
//   - the enemy bramble from arena_app.js itself (skirmishCastle: the map's castle and its passive, its level by kind, Map 0's base
//     bramble, Health = the bramble's own (hqHp only lowers it), the Shield by rule (ruleShieldOf) or the node's shieldOverride);
//   - the fight's rules from fightRules (day / night, Mist, Tide, wind, darkness, volcano, terrain) and its leaders / leader grants;
//   - the enemy deck at its road level (levelledEnemyDeck: Lv 2 from Map 5, +1 every 5 maps, bosses +1), endless-dungeon floors'
//     +4% a floor;
//   - aiAim on, the CPU at its real level (cpuAiLevelForNode: Map 21+ Smartest, Map 5+ elite / boss Smart, else Basic), your seat
//     at Smart, as simulateSkirmishVsDeck(…, {level}) does in the skirmish editor.
// The functions are read out of arena_app.js (by tools/lib_bramble.js), so a rule change there is measured here without a copy to keep
// in step. Since 2026-10-19 (W2) one fight is simulateReferenceFight in arena_app.js itself: the skirmish editor's "This map, new-player
// win rate" panel plays the very same games (the same seeds, 9100 + 37g), so the panel's 30 games are this tool's first 30.
//
// Your deck is the reference deck for that point of the road (arena_app.js referenceDeckFor / WINRATE_REF_DECKS,
// docs/winrate-reference-decks-2026-10-19.md):
//   Map 0                 the Otter starter (+ tutorial rewards)
//   Map N (1-24)          the Road deck built for Map N by `decks` from Base + every earlier main map's rewards (no packs); a side map
//                         plays its parent's deck; past the last built map, the last deck
// A come-back-later fight uses the deck of the map it counts as (nodeMapNumber: T-2/T-3/T-4 = 1/8/18, the Old Bramble = 17).
// (The 2026-10-18 pass used the curve's Mid-road deck on Maps 10-17 and its Strong deck, with pack cards and a Map 19 reward in it,
// on Maps 18-24.) Your cards play at referencePlayerLevel(map): the road CPU's own skirmish level (Lv 1 to Map 4, Lv 2 from Map 5,
// +1 every 5 maps) inside the Forge's level gates (the 2026-10-18 pass: Lv 1 everywhere). Your bramble is the plain 30 Health castle.
//
//   node tools/skirmish_pass.js decks [--from=1] [--to=24] [--keep]   (--keep, 2026-10-19 CB: the map's current deck is a candidate too)
//        builds the Road decks for those maps (each starts from the one before) and
//        writes them into arena_app.js (WINRATE_REF_DECKS) and docs/balance/skirmish-pass-decks.json (the report); rebuild index.html after
//   node tools/skirmish_pass.js measure [games=40] [shard nshards] [--tag=before] [--only=a,b] [--seed=K]
//        appends one JSON line per fight to docs/balance/skirmish-pass-<tag>.jsonl (resumable; delete a fight's line to re-measure
//        it). Seeds 9100 + 37g, or K + 37g with --seed (the pass's "fresh seeds" check used 5100).
//   node tools/skirmish_pass.js tune [games=40] [--from=before] [--only=a,b] [--seed=7300] [--fixes=skirmish-pass-fixes] [shard nshards]
//        for each outlier (> 92% or < 12%) in the --from file tries, in order: CPU deck moves of up to 2 copies (swap / more copies /
//        add / remove, inside the road's rarity cap and the map's theme, a fight's namesake kept), then a shieldOverride, then a lower
//        bramble Health; appends to docs/balance/<fixes>.jsonl
//   node tools/skirmish_pass.js order [games] [--from=after] [--fixes=skirmish-pass-order]
//        the same tune for an elite / boss that the stage deck beats more often than its map's skirmishes (ceiling: their mean - 5)
//   node tools/skirmish_pass.js curve [games=60] [--from=r2-before] [--fixes=road-curve-fixes] [--main]   (2026-10-19, R2) tunes each fight
//        outside its road-curve green band (arena_app.js skirmishTargetBand) toward its target: deck moves, then Shield, then Health
//   node tools/skirmish_pass.js snapshot [--out=road-curve-nodes-after]   every fight's deck / overrides / bramble to docs/balance/<out>.json
//   (measure --main: Maps 0-24's own fights only; each measured row carries its curve target, band and green / easy / hard)
//   node tools/skirmish_pass.js apply [--fixes=skirmish-pass-fixes]   writes those fixes into arena_app.js
//   node tools/skirmish_pass.js list           prints the fights and their stage decks
// The 2026-10-18 pass: docs/skirmish-pass-2026-10-18.md; its rounds are in docs/balance/skirmish-pass-tune-log.jsonl.
// Babel Spire floors are not covered (their decks are rated, levelled to 11-20 and rebuilt at load; tune them with TOWER_* instead).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const APP = path.join(ROOT, 'arena_app.js');
const src = fs.readFileSync(APP, 'utf8');
const argv = process.argv.slice(2), CMD = argv[0] || 'list';
const nums = argv.filter(a=> /^\d+$/.test(a)).map(Number);
const N = nums[0] || 40, SHARD = nums[1] || 0, NSH = nums[2] || 1;
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ONLY = opt('only', '').split(',').filter(Boolean);
const LO = 0.12, HI = 0.92; // the pass's band: not always losable, not auto-winnable
const KEEP_CURRENT = argv.includes('--keep'); // decks: the map's current deck is a candidate (2026-10-19, package CB)
const TUNE_SEED = +opt('seed', 7300); // tune's trials play other seeds than measure's (9100), so a fix isn't fitted to the seeds it is reported on

// ---- the game's own functions, read out of arena_app.js by tools/lib_bramble.js (2026-10-19, W2: this file had its own copy of the
// reader; one copy now, and it carries the map win-rate panel's reference player, so this tool and the panel play the same fight)
const B = require('./lib_bramble.js'), G = B.G, CARD_DEFS_BASELINE = B.CARD_DEFS_BASELINE, CHARACTER_DEFS = B.CHARACTER_DEFS;
const MAPS = G.CONQUEST_MAPS;

// ---- the fights
const mains = MAPS.filter(m=> !m.sub);
const DUNGEON_FLOORS = [1, 10, 25, 50]; // endless dungeons: two plain floors and two Kings (every 10th floor is a mini-boss)
function fights(){
  const out = [];
  for(const m of MAPS){
    if(m.reserved || m.tower) continue;
    const no = G.mapNumberOf(m.id); if(no == null) continue;
    const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
    m.nodes.forEach((n, i)=>{
      if(!n.deck || !Object.keys(n.deck).length) return;
      const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
      if(m.endless && !DUNGEON_FLOORS.includes(n.floor)) return;
      const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
      const stageMap = G.nodeMapNumber(n);
      out.push({map: m.id, mapNo: no, side: !!m.sub, endless: !!m.endless, mapName: m.name, key: n.key, code, kind: k, name: n.name || n.key, stageMap, m, n});
    });
  }
  return out;
}
// The stage deck (2026-10-19, W2): the game's referenceDeckFor (arena_app.js), the same one the skirmish editor's win-rate panel plays.
const stageOf = f=>{ const r = G.referenceDeckFor(f.map, f.n); return r.stage === 'starter' ? 'starter' : 'road ' + r.deckMap; };
// ---- decks
// The Road decks: built the way tools/difficulty_curve.js builds Mid-road and Strong, from what the game says you own
// arriving at that map (expectedPlayerDeck's pool: Base + every earlier map's rewards, no packs): cards ranked by their measured
// win rate (docs/balance/card-balance.json), Lumber makers in when the deck has 2+ Lumber cards, then a hill-climb that keeps a
// one-card swap only if the deck wins more across that map's own fights. (expectedPlayerDeck's own top 20 by stat score is all
// 0-Lumber chaff, 0% from Map 5 on, so it doesn't stand in for a player.) A trial deck plays at that map's reference card level.
// 2026-10-19 (W2): the decks live in arena_app.js (WINRATE_REF_DECKS, read by the panel and by measure / tune here); `decks` writes them
// there and keeps docs/balance/skirmish-pass-decks.json as the report (pool size, score on the map's own fights, card names).
const DECKS_FILE = path.join(ROOT, 'docs', 'balance', 'skirmish-pass-decks.json');
const stageDeck = f=>{ const r = G.referenceDeckFor(f.map, f.n); return {stage: r.stage, deck: r.deck, deckMap: r.deckMap, level: r.level}; };
const BAL = {}; try{ (JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-balance.json'), 'utf8')).rows || []).forEach(r=> BAL[r.id] = r.winRate); }catch(e){}
// 2026-10-19 (package TH): the pool cards placed by the thematic pass are live now but not in the card pass's report yet: their own
// measures (package AN's pool report, the GI examples' tune) on the same yardstick
try{ JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-pool-2026-10-19.json'), 'utf8')).forEach(r=>{ if(BAL[r.id] == null) BAL[r.id] = r.winRate; }); }catch(e){}
try{ JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/thematic-gi-tune-2026-10-19.json'), 'utf8')).forEach(r=>{ if(BAL[r.id] == null) BAL[r.id] = r.winRate; }); }catch(e){}
const DCAP = {devlegendary:1, devancient:1, eventlegendary:1, legendary:1, mythic:1, ancient:1, unique:1, questunique:1, epic:2, heroic:2, veryrare:3, superrare:3, rare:4, uncommon:5};
const playableCard = c=> c && !c.token && !c.test && !c.hallOfFame && !c.hero && c.cardType !== 'materia' && c.cardType !== 'equipment' && c.id !== 'wandering-traveller' && c.id !== 'missingno' && !(c.effects||{}).leader && !(c.archetypes||[]).includes('Leader') && !(c.source && c.source.kind === 'secret');
const isLumberMaker = id=>{ const e = (CARD_DEFS_BASELINE[id]||{}).effects || {}; return !!(e.onSpawnGold || e.onReadyGold || e.bounty || (e.triggers||[]).some(t=> t && (t.do === 'gainGold' || t.do === 'gainLumber' || (t.do === 'gain' && (t.resource||'lumber') === 'lumber')))); };
function ownedAt(mapNo){ // expectedPlayerDeck's pool arriving at main map mapNo
  const owned = new Set(); G.resetOverlay(); const defs = G.getCardDefs();
  Object.keys(defs).forEach(id=>{ const d = defs[id]; if(playableCard(d) && (G.cardSourceOf ? G.cardSourceOf(d).kind : 'base') === 'base') owned.add(id); });
  for(const m of mains.slice(0, mapNo)) m.nodes.forEach(n=> G.nodeRewardCardIds(m.id, n.key).forEach(id=> owned.add(id)));
  return [...owned].filter(id=> playableCard(defs[id]));
}
function buildRoadDeck(mapNo, fightsOfMap, seed, prev){
  const strength = id=> BAL[id] != null ? BAL[id] : 40 + power(id) * 2;
  const ids = ownedAt(mapNo).sort((a, b)=> strength(b) - strength(a) || (a < b ? -1 : 1));
  const cap = id=> Math.min(4, DCAP[CARD_DEFS_BASELINE[id].rarity] || 10);
  const fill = start=>{ const deck = Object.assign({}, start||{}); let n = deckSize(deck); for(const id of ids){ if(deck[id]) continue; const k = Math.min(cap(id), 20 - n); if(k <= 0) break; deck[id] = k; n += k; } return deck; };
  let deck = fill();
  if(Object.keys(deck).filter(id=> (CARD_DEFS_BASELINE[id].cost||0) >= 2).length >= 2){ const lum = ids.filter(isLumberMaker).slice(0, 2); deck = fill(Object.fromEntries(lum.map(id=> [id, Math.min(3, cap(id))]))); }
  const score = d=> fightsOfMap.reduce((t, f)=> t + measure(f, null, 12, 4100, d).win, 0);
  let best = score(deck); if(prev){ const p = Object.fromEntries(prev.cards.map(c=> [c.id, c.n])), ps = score(p); if(ps > best){ best = ps; deck = p; } } /* the pool only grows, so last map's deck is a candidate */
  // 2026-10-19 (package CB, --keep): the map's current deck is a candidate too (when every card of it is still owned there), so a rebuild
  // after a card pass keeps a deck unless the search finds a better one, instead of reshuffling every map
  if(KEEP_CURRENT && G.WINRATE_REF_DECKS.road[mapNo]){ const cur = Object.assign({}, G.WINRATE_REF_DECKS.road[mapNo]), own = new Set(ids);
    if(Object.keys(cur).every(id=> own.has(id)) && deckSize(cur) === 20){ const cs = score(cur); if(cs >= best){ best = cs; deck = cur; } } }
  const rnd = E.mulberry32(seed), top = ids.slice(0, 40);
  for(let it = 0; it < 40; it++){
    const cur = Object.keys(deck), out = cur[Math.floor(rnd() * cur.length)];
    const inn = top.filter(id=> !deck[id])[Math.floor(rnd() * Math.min(25, top.length))]; if(!inn) continue;
    const trial = Object.assign({}, deck), k = trial[out]; delete trial[out]; trial[inn] = Math.min(k, cap(inn));
    const filled = deckSize(trial) < 20 ? fill(trial) : trial;
    const sc = score(filled); if(sc > best){ best = sc; deck = filled; }
  }
  return {pool: ids.length, score: Math.round(best / fightsOfMap.length * 10) / 10, cards: Object.entries(deck).map(([id, n])=> ({id, name: CARD_DEFS_BASELINE[id].name, n}))};
}

// ---- one fight, as startConquestMatch builds it, played by the game's own simulateReferenceFight (2026-10-19, W2: the same function
// as the skirmish editor's win-rate panel; it also gives the fight its leader grants, which this tool's copy had commented out)
function measure(f, node, games, seed0, deckOverride){
  node = node || f.n; G.NODE_MAP_HINT.set(node, f.map);
  const r = G.simulateReferenceFight(f.map, node, games, {seed0: seed0 || 9100, deck: deckOverride || null});
  return {win: Math.round(r.wins / games * 1000) / 10, loss: Math.round(r.losses / games * 1000) / 10, rounds: r.avgRounds == null ? null : Math.round(r.avgRounds * 10) / 10,
    hpLost: Math.round(r.hpLost * 1000) / 10, cpu: r.cpu, stage: r.stage === 'road' ? 'road ' + r.deckMap : r.stage, level: r.level, hp: r.hp, shield: r.shield, overridden: r.overridden};
}
const verdict = w=> w > HI * 100 ? 'easy' : w < LO * 100 ? 'hard' : 'ok';

// ---- fixes: CPU deck tweak, then shieldOverride, then bramble Health
const typesOf = id=> [...((CARD_DEFS_BASELINE[id]||{}).archetypes||[]), ...((CARD_DEFS_BASELINE[id]||{}).species||[])];
const power = id=> G.skirmishCardScore(CARD_DEFS_BASELINE[id] || {});
const KEEP = new Set(['dromedary']); // the owner's new card walks in a Glass Dunes skirmish (tests/decisions-2026-10-18.js 8)
const RARE_UP = new Set(['epic','heroic','unique','questunique','legendary','mythic','ancient','devlegendary','devancient','eventlegendary']);
// How strong a card is: its measured win rate from the card pass (docs/balance/card-balance.json), else the stat score.
const strengthOf = id=> BAL[id] != null ? BAL[id] : 40 + power(id) * 2;
const MAP_BIOME = (()=>{ try{ return eval('(' + src.slice(src.indexOf('const MAP_BIOME_OF = ') + 'const MAP_BIOME_OF = '.length, src.indexOf('};', src.indexOf('const MAP_BIOME_OF = ')) + 1) + ')'); }catch(e){ return {}; } })();
const mainOf = m=> m.sub ? MAPS.find(x=> x.id === m.parent) : m;
// The cards a fight may take in, keeping the theme: the cards of this map's own fights (and its parent's / side maps'), the cards of
// same-biome maps two either side of it, and cards of the map's three main types from maps two back to one ahead. All within the
// road's rarity cap for the map the fight is on (tests/road-rarity-2026-10-16.js); never a token.
function themedPool(f){
  const m = f.m, main = mainOf(m), i = mains.indexOf(main), tally = {};
  const family = MAPS.filter(mm=> !mm.reserved && !mm.tower && (mm === m || mm === main || (mm.sub && mm.parent === main.id)));
  family.forEach(mm=> mm.nodes.forEach(x=> Object.entries(x.deck||{}).forEach(([id, c])=> typesOf(id).forEach(t=> tally[t] = (tally[t]||0) + c))));
  const top = new Set(Object.entries(tally).filter(([t])=> !['Structure','Leader','Bird','Beast','Mammal'].includes(t)).sort((a,b)=> b[1]-a[1]).slice(0, 3).map(([t])=> t));
  const near = (mm, lo, hi)=>{ const j = mains.indexOf(mainOf(mm)); return j >= i - lo && j <= i + hi; };
  const cardsOf = list=> list.flatMap(mm=> mm.nodes.filter(x=> x.kind !== 'raidboss' && x.kind !== 'tutorial').flatMap(x=> Object.keys(x.deck||{})));
  const own = cardsOf(family);
  const biome = MAP_BIOME[m.id] || MAP_BIOME[main.id];
  const sameBiome = cardsOf(MAPS.filter(mm=> !mm.reserved && !mm.tower && biome && (MAP_BIOME[mm.id] || MAP_BIOME[mainOf(mm).id]) === biome && near(mm, 2, 2)));
  const typed = cardsOf(MAPS.filter(mm=> !mm.reserved && !mm.tower && near(mm, 2, 1))).filter(id=> typesOf(id).some(t=> top.has(t)));
  return [...new Set([...own, ...sameBiome, ...typed])]
    .filter(id=> CARD_DEFS_BASELINE[id] && !CARD_DEFS_BASELINE[id].token && G.roadRarityOk(CARD_DEFS_BASELINE[id].rarity, f.mapNo, f.kind)) // the cap counts the map the fight is on
    .filter(id=> !TH || !TH.offThemeFor(f.map, f.n, id)); // 2026-10-19 (package TH): never a card off the map's theme (tools/thematic_pass_2026_10_19.js THEMES)
}
// 2026-10-19 (package TH, the thematic pass): the map identities, so the tuner's moves stay on theme (the R2 retune had brought in e.g.
// Badger Berserkers on nine maps and Pelican Divers in every Gannet Cliffs fight)
let TH = null; try{ TH = require('./thematic_pass_2026_10_19.js'); }catch(e){ console.log('no thematic pass:', e.message); }
const deckSize = d=> Object.values(d).reduce((a, b)=> a + b, 0);
// Candidate moves of up to two copies, most promising first. A fight's namesake (Epic and up, or its showcase card) is never taken out.
// Too easy: the deck's weakest card makes way for a stronger themed one, or the strongest card it has gets more copies, or (under 20
// cards) a strong themed card is added. Too hard: the strongest card makes way for a weaker one from the map's own fights, or loses
// copies.
function deckMoves(f, deck, easy){
  const defs = CARD_DEFS_BASELINE, cap = id=> Math.min(4, G.maxCopiesForRarity(defs[id].rarity));
  const ids = Object.keys(deck).filter(id=> defs[id]).sort((a, b)=> strengthOf(b) - strengthOf(a));
  const movable = ids.filter(id=> !RARE_UP.has(defs[id].rarity) && id !== f.n.showcase && !KEEP.has(id));
  const pool = themedPool(f).filter(id=> !RARE_UP.has(defs[id].rarity) || deck[id]);
  const moves = [];
  if(easy){
    const weak = movable.slice(-2).reverse();
    const strong = pool.filter(id=> (deck[id]||0) < cap(id) && !weak.includes(id)).sort((a, b)=> strengthOf(b) - strengthOf(a)).slice(0, 3);
    strong.forEach(inn=> weak.forEach(out=> moves.push({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn) - (deck[inn]||0))})));
    ids.filter(id=> deck[id] < cap(id)).slice(0, 2).forEach(inn=> weak.filter(out=> out !== inn).slice(0, 1).forEach(out=> moves.push({type:'more', out, inn, k: Math.min(2, deck[out], cap(inn) - deck[inn])})));
    // a small deck runs dry (the CPU gets no loop cards on the road), so a deck under 16 cards grows first
    const adds = deckSize(deck) <= 18 ? strong.slice(0, 2).concat(ids.filter(id=> deck[id] < cap(id)).slice(0, 1)).map(inn=> ({type:'add', inn, k: Math.min(2, cap(inn) - (deck[inn]||0))})) : [];
    if(deckSize(deck) < 16) moves.unshift(...adds); else moves.push(...adds);
  } else {
    const strongest = movable.slice(0, 2);
    const ownIds = new Set(MAPS.filter(mm=> mm === f.m || mm === mainOf(f.m) || (mm.sub && mm.parent === mainOf(f.m).id)).flatMap(mm=> mm.nodes.flatMap(x=> Object.keys(x.deck||{}))));
    const weak = pool.filter(id=> ownIds.has(id) && !strongest.includes(id) && (deck[id]||0) < cap(id)).sort((a, b)=> strengthOf(a) - strengthOf(b)).slice(0, 3);
    weak.forEach(inn=> strongest.forEach(out=> moves.push({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn) - (deck[inn]||0))})));
    if(deckSize(deck) > 8) strongest.forEach(out=> moves.push({type:'remove', out, k: Math.min(2, deck[out])}));
  }
  return moves.filter(mv=> mv.k > 0);
}
// Maps 21-40: a quarter or more of a skirmish deck is Rare or better (tests/road-rarity-2026-10-16.js)
const rareStep = id=> ['common','uncommon','starter','quest'].indexOf(CARD_DEFS_BASELINE[id].rarity || 'common') < 0;
function rareQuarterOk(f, deck){ if(f.mapNo < 21 || f.mapNo > 40 || f.kind !== 'skirmish' || f.endless) return true;
  const tot = deckSize(deck), r = Object.entries(deck).reduce((a, [id, k])=> a + (rareStep(id) ? k : 0), 0); return tot > 0 && r / tot >= 0.25; }
function applyMove(deck, mv){
  const d = Object.assign({}, deck), k = mv.k || 1;
  if(mv.out){ d[mv.out] -= k; if(d[mv.out] <= 0) delete d[mv.out]; }
  if(mv.inn) d[mv.inn] = (d[mv.inn]||0) + k;
  return d;
}
// a little margin, so a fix doesn't sit on the edge; `top` lowers the ceiling (the `order` pass: an elite or boss under its map's skirmishes)
let TOP = HI * 100 - 4;
const inBand = w=> w >= LO * 100 + 3 && w <= TOP;
function tune(f, before, top){
  TOP = top != null ? top : HI * 100 - 4;
  const easy = before.win > TOP, trail = [];
  let node = f.n, cur = measure(f, null, N, TUNE_SEED); trail.push({what: "start", win: cur.win}); // the same seeds as every trial below
  const tryNode = (nn, what)=>{ const r = measure(f, nn, N, TUNE_SEED); trail.push({what, win: r.win}); return r; };
  // 1. CPU deck: up to four (too easy) or three (too hard) moves, each kept only if it moves the win rate the right way
  for(let step = 0; step < (easy ? 4 : 3) && !inBand(cur.win); step++){
    let best = null;
    for(const mv of deckMoves(f, node.deck, easy).slice(0, 7)){
      const nd = applyMove(node.deck, mv); if(!rareQuarterOk(f, nd)) continue; const nn = Object.assign({}, node, {deck: nd}); const r = tryNode(nn, mv);
      const gain = easy ? cur.win - r.win : r.win - cur.win;
      const over = easy ? r.win < (TOP < HI * 100 - 4 ? Math.max(LO * 100 + 3, TOP - 25) : 50) : r.win > 65; // a light touch: don't swing a fight to the far side of the road's curve
      if(gain > 2 && !over && (!best || Math.abs(r.win - (easy ? 80 : 30)) < Math.abs(best.r.win - (easy ? 80 : 30)))) best = {mv, nn, r};
      if(best && inBand(best.r.win)) break;
    }
    if(!best) break; node = best.nn; cur = best.r; (node._moves = (node._moves || []).concat([best.mv]));
  }
  const moves = node._moves || [];
  // 2. Shield: an override searched between 0 and the rule x 4 (at least 40)
  let shield = null;
  if(!inBand(cur.win) && (easy || cur.shield > 0)){
    const rule = G.ruleShieldOf(node), base = cur.shield;
    let lo = easy ? base + 1 : 0, hi = easy ? Math.max(60, rule * 5, base + 40) : Math.max(0, base - 1), best = null;
    for(let it = 0; it < 7 && lo <= hi; it++){
      const s = Math.floor((lo + hi) / 2), nn = Object.assign({}, node, {shieldOverride: s}); const r = tryNode(nn, {shield: s});
      if(inBand(r.win) && (!best || Math.abs(s - base) < Math.abs(best.s - base))) best = {s, r, nn};
      if(r.win > TOP) lo = s + 1; else if(r.win < LO * 100 + 3) hi = s - 1; else { if(easy) hi = s - 1; else lo = s + 1; } // in band: look for a lighter touch
    }
    if(!best && !easy){ const nn = Object.assign({}, node, {shieldOverride: 0}); const r = tryNode(nn, {shield: 0}); best = {s: 0, r, nn}; }
    if(best && (inBand(best.r.win) || !easy)){ node = best.nn; cur = best.r; shield = best.s; }
  }
  // 3. Health (only lower: hqHp can't raise a bramble past its own Health)
  let hqHp = null;
  if(!inBand(cur.win) && !easy){
    let lo = 6, hi = cur.hp - 1, best = null;
    for(let it = 0; it < 6 && lo <= hi; it++){
      const h = Math.floor((lo + hi) / 2), nn = Object.assign({}, node, {hqHp: h}); const r = tryNode(nn, {hqHp: h});
      if(inBand(r.win) && (!best || h > best.h)) best = {h, r, nn};
      if(r.win < LO * 100 + 3) hi = h - 1; else lo = h + 1;
    }
    if(best){ node = best.nn; cur = best.r; hqHp = best.h; }
  }
  return {moves, deck: moves.length ? node.deck : null, shieldOverride: shield, hqHp, after: cur, trail};
}

// ---- the road curve (2026-10-19, package R2; owner 20:39: "The balance should be such that the constructed deck wins in the green zone
// for every map it's in. Maybe if there are 10 skirmishes, it starts at 90%, and drops to 60%. Then at the boss fight, <50%."). The
// target and its green band are the game's own (arena_app.js roadCurveTarget / skirmishTargetBand, the win-rate panel's colours): 90%
// for a map's first fight down to 60% before its boss, elites on the line, a mini-boss that isn't the map's last fight 50%, the
// boss fight 40% (green 30-49%; Map 0's 45%), green ±8 points.
const bandOf = (f, win)=>{ const b = G.skirmishTargetBand(f.map, f.n), pc = x=> Math.round(x * 1000) / 10;
  return {target: pc(b.t), lo: pc(b.lo), hi: pc(b.hi), role: b.role, curve: !!b.curve, pos: b.pos || null, of: b.of || null,
    green: win == null ? null : win > b.hi * 100 + 1e-9 ? 'easy' : win < b.lo * 100 - 1e-9 ? 'hard' : 'green'}; };
// One fight toward its curve target: CPU deck moves first (each of up to 2 copies, inside the map's theme and the road's rarity cap,
// a fight's Epic+ namesake / showcase card kept; deckMoves above) while the fight is more than 6 points off, then the Shield
// (shieldOverride, searched between 0 and the rule x 5 / +40), then (too hard with no Shield left) a lower bramble Health, then a
// second, shorter round of deck moves if it is still outside its band. Trials play N games on the tune seeds (TUNE_SEED + 37g).
// The curve's moves: too easy, deckMoves' own (a weak card makes way for a stronger themed one, more copies of the strongest, adds);
// too hard, every movable card in turn (strongest first, not only the top two: the card that walls this deck is often not the one with
// the best card-pass score) gives up to 2 copies to the weakest card of the map's own fights, then the top two lose copies.
function curveMoves(f, deck, easy){
  const defs = CARD_DEFS_BASELINE, cap = id=> Math.min(4, G.maxCopiesForRarity(defs[id].rarity));
  if(easy){ // + a small deck (the Quiet Summit's 12-13 card flocks) grows with any of the six strongest themed cards, not only the top three
    const base = deckMoves(f, deck, true).slice(0, 8);
    // + (2026-10-19, R2 round 4) the map's own cards that the deck lacks, by stat score, swapped in for its most-copied cards: the
    // card pass ranks the Quiet Summit's birds over its goats, but a flock of birds there barely scratches your bramble (21-3: 100%
    // with birds, 70% with Map 22's goat deck), so the trials get to try the map's other half too
    const fam = new Set(MAPS.filter(mm=> mm === f.m || mm === mainOf(f.m) || (mm.sub && mm.parent === mainOf(f.m).id)).flatMap(mm=> mm.nodes.filter(x=> x.kind !== 'raidboss').flatMap(x=> Object.keys(x.deck||{}))));
    const pool = themedPool(f), ownNew = pool.filter(id=> fam.has(id) && !deck[id] && !RARE_UP.has(defs[id].rarity)).sort((a, b)=> power(b) - power(a)).slice(0, 4);
    const most = Object.keys(deck).filter(id=> defs[id] && !RARE_UP.has(defs[id].rarity) && id !== f.n.showcase && !KEEP.has(id)).sort((a, b)=> deck[b] - deck[a] || strengthOf(b) - strengthOf(a)).slice(0, 2);
    const own = ownNew.flatMap(inn=> most.map(out=> ({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn))})));
    if(deckSize(deck) >= 20) return base.slice(0, 6).concat(own).filter(mv=> mv.k > 0).slice(0, 14);
    const seen = new Set(base.filter(m=> m.type === 'add').map(m=> m.inn));
    const extra = pool.filter(id=> !RARE_UP.has(defs[id].rarity) && (deck[id]||0) < cap(id) && !seen.has(id)).sort((a, b)=> strengthOf(b) - strengthOf(a)).slice(0, 6)
      .map(inn=> ({type:'add', inn, k: Math.min(2, cap(inn) - (deck[inn]||0), 20 - deckSize(deck))}));
    const ownAdd = ownNew.map(inn=> ({type:'add', inn, k: Math.min(2, cap(inn), 20 - deckSize(deck))}));
    return base.slice(0, 6).concat(ownAdd, own, extra).filter(mv=> mv.k > 0).slice(0, 16); }
  const ids = Object.keys(deck).filter(id=> defs[id]).sort((a, b)=> strengthOf(b) - strengthOf(a));
  const movable = ids.filter(id=> !RARE_UP.has(defs[id].rarity) && id !== f.n.showcase && !KEEP.has(id));
  const ownIds = new Set(MAPS.filter(mm=> mm === f.m || mm === mainOf(f.m) || (mm.sub && mm.parent === mainOf(f.m).id)).flatMap(mm=> mm.nodes.flatMap(x=> Object.keys(x.deck||{}))));
  const pool = themedPool(f).filter(id=> !RARE_UP.has(defs[id].rarity) && ownIds.has(id)).sort((a, b)=> strengthOf(a) - strengthOf(b));
  const moves = [];
  movable.slice(0, 7).forEach(out=>{ const inn = pool.find(id=> id !== out && (deck[id]||0) < cap(id)); if(inn) moves.push({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn) - (deck[inn]||0))}); });
  if(deckSize(deck) > 12) movable.slice(0, 2).forEach(out=> moves.push({type:'remove', out, k: Math.min(2, deck[out])}));
  return moves.filter(mv=> mv.k > 0).slice(0, 9);
}
const SHIELD_CAP = +opt('shieldcap', 0); // --shieldcap=K: an easy fight's Shield goes no higher than the rule x K (at least 40); round 2 used 4
// 2026-10-19 (package LV, the level curve): --rule starts every fight from its bramble on the rule (no shieldOverride, no hqHp), so the
// level curves and the deck carry the difficulty; --shieldx=K then caps a Shield override at the rule x K (2: "none over ~2x the rule"),
// and a lower Health goes no further than --hpfloor (a share of the bramble's own Health, 0.6)
const DECKS_ONLY = argv.includes('--decks-only'); // 2026-10-19 (BF3): deck moves only (the enemy's level is the owner's schedule)
const RULE_START = argv.includes('--rule'), SHIELD_X = +opt('shieldx', 0), HP_FLOOR = +opt('hpfloor', 0);
const stripRule = n=>{ const c = Object.assign({}, n); delete c.shieldOverride; delete c.hqHp; return c; };
function curveTune(f, band, steps){
  const want = band.t * 100, lo = band.lo * 100, hi = band.hi * 100, AIM = Math.min(4, (hi - lo) / 2 - 1), trail = [];
  const off = w=> Math.abs(w - want), good = w=> off(w) <= AIM && w >= lo && w <= hi;
  // progress: the gap to the target, plus (10 points a whole bramble) how much your bramble is hurt, so a fight stuck at 100% (or 0%)
  // still has a way down (up): a move that makes the CPU hit harder counts before it costs you a game
  const P = (r, easy)=> off(r.win) + 10 * (easy ? 1 - r.hpLost / 100 : r.hpLost / 100);
  const T = (nn, what)=>{ const r = measure(f, nn, N, TUNE_SEED); trail.push({what, win: r.win}); return r; };
  let node = RULE_START ? stripRule(f.n) : f.n, cur = T(node, 'start'); const moves = [];
  const deckRound = (maxSteps, coarse)=>{
    for(let step = 0; step < maxSteps && (coarse ? off(cur.win) > 6 : !good(cur.win)); step++){
      const easy = cur.win > want; let best = null;
      for(const mv of curveMoves(f, node.deck, easy)){
        if(f.code === '18-A-9' && mv.inn === 'quicksand-queen') continue; // 2026-10-19 (BF3): one Queen leads her own fight (tests/pale-desert-2026-10-19.js 3)
        if(mv.inn && TH && TH.offThemeFor(f.map, f.n, mv.inn)) continue; // 2026-10-19 (TH): "more copies" of a capped card (Gannet Cliffs' Pelican Divers) too
        const nd = applyMove(node.deck, mv); if(!rareQuarterOk(f, nd) || deckSize(nd) < Math.min(12, deckSize(node.deck))) continue; // never shrink a deck under 12 (a smaller one stays its size)
        const nn = Object.assign({}, node, {deck: nd}), r = T(nn, mv);
        if(!best || P(r, easy) < P(best.r, easy)) best = {mv, nn, r};
        if(good(best.r.win)) break;
      }
      if(!best || P(best.r, easy) > P(cur, easy) - 2) break; // each move must close the gap by 2+ points (a saturated fight: by your bramble's damage, P)
      node = best.nn; cur = best.r; moves.push(best.mv);
    }
  };
  let shield = null, hqHp = null;
  const shieldRound = ()=>{
    if(DECKS_ONLY) return; // 2026-10-19 (BF3, owner 16:22): honest levers only, no Shield above the rule
    if(f.map === 'mpd') return; // 2026-10-19 (BF3): the Pale Desert keeps the bramble by rule (tests/pale-desert-2026-10-19.js 3)
    if(good(cur.win)) return;
    const base = cur.shield, easy = cur.win > want, rule = G.ruleShieldOf(node);
    if(!easy && base <= 0) return;
    let a = easy ? base + 1 : 0, b = easy ? (SHIELD_X ? Math.max(base, Math.round(rule * SHIELD_X)) : SHIELD_CAP ? Math.max(base, 40, rule * SHIELD_CAP) : Math.max(40, rule * 5, base + 40)) : base - 1, best = null;
    for(let it = 0; it < 8 && a <= b; it++){
      const sv = Math.floor((a + b) / 2), nn = Object.assign({}, node, {shieldOverride: sv}), r = T(nn, {shield: sv});
      if(!best || off(r.win) < off(best.r.win) || (off(r.win) === off(best.r.win) && Math.abs(sv - base) < Math.abs(best.sv - base))) best = {sv, r, nn};
      if(r.win > want) a = sv + 1; else b = sv - 1;
    }
    if(best && off(best.r.win) < off(cur.win) - 1){ node = best.nn; cur = best.r; shield = best.sv; }
  };
  const hpRound = ()=>{
    if(DECKS_ONLY) return;
    if(good(cur.win) || cur.win > want || cur.shield > 0) return;
    let a = HP_FLOOR ? Math.max(6, Math.round(cur.hp * HP_FLOOR)) : 6, b = cur.hp - 1, best = null;
    for(let it = 0; it < 6 && a <= b; it++){
      const h = Math.floor((a + b) / 2), nn = Object.assign({}, node, {hqHp: h}), r = T(nn, {hqHp: h});
      if(!best || off(r.win) < off(best.r.win)) best = {h, r, nn};
      if(r.win < want) b = h - 1; else a = h + 1;
    }
    if(best && off(best.r.win) < off(cur.win) - 1){ node = best.nn; cur = best.r; hqHp = best.h; }
  };
  deckRound(steps || 6, true); shieldRound(); hpRound();
  if(!good(cur.win)){ deckRound(3, false); shieldRound(); }
  return {moves, deck: moves.length ? node.deck : null, shieldOverride: shield, hqHp, after: cur, good: good(cur.win), trail, rule: RULE_START || undefined};
}

// ---- commands
// --main (2026-10-19, R2): the main maps' fights only (Maps 0-24, no side map, no endless floor, no come-back-later fight)
const MAIN_ONLY = argv.includes('--main');
const all = fights().filter(f=> !ONLY.length || ONLY.includes(f.map) || ONLY.includes(f.key) || ONLY.includes(f.code)).filter(f=> !MAIN_ONLY || (!f.side && !f.endless));
const OUTDIR = path.join(ROOT, 'docs', 'balance');
const readJsonl = file=>{ try{ return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const rowOf = (f, extra)=>{ const {m, n, ...row} = f; return Object.assign(row, extra); };
if(CMD === 'list'){
  all.forEach(f=>{ const sd = stageDeck(f); console.log(`${f.code.padEnd(9)} ${f.map.padEnd(4)} ${f.kind.padEnd(9)} deck ${stageOf(f).padEnd(8)} Lv ${sd.level} cpu ${G.cpuAiLevelForNode(f.map, f.n)}  ${f.name}`); });
  console.log(all.length, 'fights'); console.log('road deck at Map 1:', JSON.stringify(stageDeck(all.find(f=> f.mapNo === 1)).deck));
} else if(CMD === 'decks'){
  // 2026-10-19 (W2): any range of maps (each map's search starts from the deck before it); the result goes into arena_app.js
  const FROM = +opt('from', 1), TO = +opt('to', 24), F = fights(), road = JSON.parse(JSON.stringify(G.WINRATE_REF_DECKS.road));
  let rep = {}; try{ rep = JSON.parse(fs.readFileSync(DECKS_FILE, 'utf8')); }catch(e){}
  rep.road = rep.road || {}; rep.note = 'Road decks (tools/skirmish_pass.js decks); the game reads them from arena_app.js WINRATE_REF_DECKS. Map 0 plays the Otter starter.';
  const asCards = d=> ({cards: Object.entries(d).map(([id, n])=> ({id, name: (CARD_DEFS_BASELINE[id]||{}).name || id, n}))});
  for(let no = FROM; no <= TO; no++){ const t = Date.now(), fm = F.filter(f=> f.mapNo === no && !f.side); if(!fm.length){ console.log('Map', no, 'has no fights'); continue; }
    const prev = rep.road[no - 1] || (road[no - 1] ? asCards(road[no - 1]) : null);
    const built = buildRoadDeck(no, fm, 900 + no, prev); built.level = G.referencePlayerLevel(no); built.generated = new Date().toISOString().slice(0, 10);
    rep.road[no] = built; road[no] = Object.fromEntries(built.cards.map(c=> [c.id, c.n]));
    console.log(`Map ${no}: ${built.score}% on its own fights at Lv ${built.level}, pool ${built.pool}, ${((Date.now()-t)/1000).toFixed(0)}s:`, built.cards.map(c=> `${c.n}x ${c.name}`).join(', '));
    fs.writeFileSync(DECKS_FILE, JSON.stringify(rep, null, 1) + '\n');
    const app = fs.readFileSync(APP, 'utf8'), line = 'const WINRATE_REF_DECKS = ' + JSON.stringify({starter: G.WINRATE_REF_DECKS.starter, road}) + ';';
    if(!/^const WINRATE_REF_DECKS = .*;$/m.test(app)) throw new Error('arena_app.js: no WINRATE_REF_DECKS line');
    fs.writeFileSync(APP, app.replace(/^const WINRATE_REF_DECKS = .*;$/m, ()=> line)); }
} else if(CMD === 'measure'){
  const OUT = path.join(OUTDIR, `skirmish-pass-${opt('tag', 'before')}.jsonl`), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  let mine = all.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights', all.length, 'mine', mine.length);
  const NO_OV = argv.includes('--no-overrides'); // 2026-10-19 (BF3): the bramble by rule everywhere (shieldOverride / hqHp dropped)
  // 2026-10-19 (BF3, owner 16:22: "measure what removing them would do"): --drop-above-rule drops only a Shield override above the rule
  // (hqHp, which only lowers Health, and an override below the rule stay)
  const DROP_ABOVE = argv.includes('--drop-above-rule'), sumOv = v=> Array.isArray(v) ? v.reduce((a, b)=> a + (+b || 0), 0) : (+v || 0);
  const aboveRule = n=>{ if(n.shieldOverride == null || n.shieldOverride === '') return false; const c = Object.assign({}, n); delete c.shieldOverride; return sumOv(n.shieldOverride) > G.ruleShieldOf(c); };
  if(DROP_ABOVE) mine = mine.filter(f=> aboveRule(f.n));
  for(const f of mine){ const t = Date.now(), nn = NO_OV || DROP_ABOVE ? Object.assign({}, f.n) : null; if(nn){ delete nn.shieldOverride; if(NO_OV) delete nn.hqHp; }
    const r = measure(f, nn, N, opt('seed') ? TUNE_SEED : undefined); /* --seed=K: a fresh seed set (the verify run) */ fs.appendFileSync(OUT, JSON.stringify(rowOf(f, Object.assign(r, {verdict: verdict(r.win), games: N, ms: Date.now() - t}, bandOf(f, r.win), {deck: f.n.deck /* 2026-10-19 (TH): which deck was measured */}))) + '\n'); }
  console.log('done');
} else if(CMD === 'tune'){
  const before = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('from', 'before')}.jsonl`));
  const OUT = path.join(OUTDIR, opt('fixes', 'skirmish-pass-fixes') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const todo = all.filter(f=>{ const b = before.find(r=> r.map === f.map && r.key === f.key); return b && b.verdict !== 'ok' && !f.endless; }).filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key)); // shard first, so two shards started apart never overlap
  console.log('outliers to tune', todo.length);
  for(const f of todo){ const b = before.find(r=> r.map === f.map && r.key === f.key), t = Date.now(), fx = tune(f, b);
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(rowOf(f, {}), {before: b.win, verdict: b.verdict, ms: Date.now() - t}, fx)) + '\n');
    console.log(f.code, b.win, '->', fx.after.win, JSON.stringify(fx.moves), fx.shieldOverride, fx.hqHp); }
} else if(CMD === 'order'){
  // Elites and bosses should sit harder than their map's skirmishes (docs/difficulty-curve-2026-10-03.md): an elite or boss that the
  // stage deck beats more often than the map's skirmishes on average gets the same light-touch tune with its ceiling at that average
  // minus 5 (and never below 40%). Endless dungeon floors are left out.
  const now = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('from', 'after')}.jsonl`));
  const OUT = path.join(OUTDIR, opt('fixes', 'skirmish-pass-order') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const skMean = {}; now.filter(r=> r.kind === 'skirmish' && !r.endless).forEach(r=>{ (skMean[r.map] = skMean[r.map] || []).push(r.win); });
  const mean = a=> a && a.length ? a.reduce((x, y)=> x + y, 0) / a.length : null;
  const todo = all.filter(f=>{ if(f.endless || f.kind === 'skirmish') return false; const r = now.find(x=> x.map === f.map && x.key === f.key), m = mean(skMean[f.map]);
    return r && m != null && r.win > Math.max(40, m - 5) && r.win >= LO * 100; }).filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('elites / bosses over their skirmishes', todo.length);
  for(const f of todo){ const r = now.find(x=> x.map === f.map && x.key === f.key), top = Math.max(40, Math.round(mean(skMean[f.map]) - 5)), t = Date.now(), fx = tune(f, r, top);
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(rowOf(f, {}), {before: r.win, verdict: 'order', top, ms: Date.now() - t}, fx)) + '\n');
    console.log(f.code, r.win, 'top', top, '->', fx.after.win, JSON.stringify(fx.moves), fx.shieldOverride, fx.hqHp); }
} else if(CMD === 'curve'){
  // node tools/skirmish_pass.js curve [games=60] --from=r2-before [--fixes=road-curve-fixes] [--steps=6] [--main] [shard nshards]
  // (2026-10-19, R2): tunes every fight of the --from file that is outside its road-curve band toward its target (curveTune);
  // `apply --fixes=road-curve-fixes` writes the fixes into arena_app.js.
  const before = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('from', 'r2-before')}.jsonl`));
  const OUT = path.join(OUTDIR, opt('fixes', 'road-curve-fixes') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const todo = all.filter(f=>{ const b = before.find(r=> r.map === f.map && r.key === f.key); if(!b) return false; const bd = bandOf(f, b.win); return (bd.curve || argv.includes('--any')) && bd.green !== 'green' && !f.endless; }) // --any (2026-10-19, LV): the fights off the curve too, toward their older targets
    .filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights off the road curve to tune', todo.length);
  for(const f of todo){ const b = before.find(r=> r.map === f.map && r.key === f.key), t = Date.now(), band = G.skirmishTargetBand(f.map, f.n), fx = curveTune(f, band, +opt('steps', 6));
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(rowOf(f, {}), {before: b.win, target: band.t * 100, lo: band.lo * 100, hi: band.hi * 100, role: band.role, ms: Date.now() - t}, fx)) + '\n');
    console.log(f.code, b.win, '-> target', Math.round(band.t * 100), ':', fx.after.win, fx.good ? 'green' : 'OFF', JSON.stringify(fx.moves), fx.shieldOverride, fx.hqHp); }
} else if(CMD === 'snapshot'){
  // node tools/skirmish_pass.js snapshot --out=road-curve-nodes-after (2026-10-19, R2): every fight's CPU deck, overrides and bramble as
  // the game builds it, to docs/balance/<out>.json (tools/road_curve_xlsx.py diffs two of them for "what changed")
  const out = {};
  for(const m of MAPS){ if(m.reserved || m.tower) continue; for(const n of m.nodes){ if(!n.deck) continue; G.NODE_MAP_HINT.set(n, m.id); let sc = {}; try{ sc = G.skirmishCastle(n); }catch(e){}
    out[m.id + ':' + n.key] = {deck: n.deck, shieldOverride: n.shieldOverride, hqHp: n.hqHp, hp: sc.hp, shield: sc.shield}; } }
  fs.writeFileSync(path.join(OUTDIR, opt('out', 'road-curve-nodes-after') + '.json'), JSON.stringify(out) + '\n'); console.log(Object.keys(out).length, 'fights');
} else if(CMD === 'apply'){
  const fixes = readJsonl(path.join(OUTDIR, opt('fixes', 'skirmish-pass-fixes') + '.jsonl')).filter(x=> x.apply !== false && (x.deck || x.shieldOverride != null || x.hqHp != null));
  let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of fixes){
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', x.key); continue; }
    let line = mm[1];
    if(x.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.deck));
    if(x.hqHp != null) line = /hqHp:\d+/.test(line) ? line.replace(/hqHp:\d+/, 'hqHp:' + x.hqHp) : line.replace(/deck:/, `hqHp:${x.hqHp}, deck:`);
    if(x.shieldOverride != null) line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.shieldOverride) : line.replace(/deck:/, `shieldOverride:${x.shieldOverride}, deck:`);
    s = s.replace(mm[1], line); n++;
  }
  fs.writeFileSync(APP, s); console.log('applied', n, 'fixes to arena_app.js');
}
