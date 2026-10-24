#!/usr/bin/env node
// Package DF3 (2026-10-24): the selfish boons' challenge skirmishes (DF-3, owner 10-23 17:34; narrowed by his 22:23 note 6: "Selfish boons -
// only in challenge skirmishes (elites are already strong enough, so maybe here and there, 1 per 2 maps, or 1 per submap.) They can be reused
// in similar biomes again and again or raids. But in general, yea i prefer using strong decks with synergy with the field's effects.").
//
// PLACEMENTS below: one skirmish every two maps on the main road from Map 5 (not Maps 7, 11 and 14, which DF-4 retunes without boons) and one
// skirmish on each side map from Map 5 that has skirmishes, each with the boon its deck and field suit (bramblewood-engine.js SELFISH_BOONS).
// Never an elite, mini-boss or boss, never a normal skirmish: the fight becomes a challenge skirmish (node.challenge) with node.rules.boon.
//
//   node tools/df3_boons_2026_10_24.js list                 the placements, the boon's count on today's deck and the challenge target
//   node tools/df3_boons_2026_10_24.js search [games=40] [--only=8-5,...]
//        per placement, a deck search (1-2 copy swaps / adds / removes, best first) toward the challenge target WITH the boon on, inside the
//        rules a skirmish deck keeps: 5-7 different cards, the copy ladder, the road's rarity cap for the map, the map's theme (the thematic
//        pass), its leaders kept, no other fight's reward card, at least half the deck on the boon's theme (so the boon is on), 12-20 cards, and
//        Maps 21-40 a quarter Rare or better. A move must close the gap by 2 points. Appends to docs/balance/df3-boon-search-2026-10-24.jsonl.
//   node tools/df3_boons_2026_10_24.js apply                writes each search row's deck, rules.boon and challenge:true into arena_app.js
//   node tools/df3_boons_2026_10_24.js measure [games=200]  every placement as the game builds it, with its boon and with it switched off
//        (the same seeds, 9100 + 37g): docs/balance/df3-boons-2026-10-24.json
// The challenge target: the fight's road-curve target minus CHALLENGE_DROP (10 points), band +/- 8 (owner call DF3-1).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G, E = B.E, D = B.CARD_DEFS_BASELINE, MAPS = G.CONQUEST_MAPS;
let TH = null; try{ TH = require('./thematic_pass_2026_10_19.js'); }catch(e){}
const argv = process.argv.slice(2), CMD = argv[0] || 'list';
const nums = argv.filter(a=> /^\d+$/.test(a)).map(Number);
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ONLY = opt('only', '').split(',').filter(Boolean);
const CHALLENGE_DROP = 0.10, BAND = 0.08;
const SEARCH_OUT = path.join(ROOT, 'docs', 'balance', 'df3-boon-search-2026-10-24.jsonl');
const MEASURE_OUT = path.join(ROOT, 'docs', 'balance', 'df3-boons-2026-10-24.json');

// code, boon, why (the deck's synergy and the field it plays on)
const PLACEMENTS = [
  // the main road, one every two maps from Map 5
  {code:'5-3',   boon:'venomGlands',  why:'Gatorback Swamp: Reptiles with Poison under Swamp Fever'},
  {code:'8-5',   boon:'blindFury',    why:'Caves & Alcoves: a Cave deck in the Darkness, where most of it fights blind'},
  {code:'9-4',   boon:'risingTide',   why:'The Kelp Mangroves: Tide units on a tidal map'},
  {code:'12-3',  boon:'secondBurrow', why:'The Briar Maze: hedgehogs and mice'},
  {code:'13-4',  boon:'wildRage',     why:'The Redwood Deep: boars and bears with Rage and Berserk'},
  {code:'16-3',  boon:'snowVeil',     why:'The Pinewood Taiga: Evasive taiga runners'},
  {code:'18-4',  boon:'sandVeil',     why:'The Glass Dunes: a Desert deck in its own Sandstorm'},
  {code:'20-4',  boon:'restlessDead', why:'The Sundered Peak: Undead with Revive'},
  {code:'22-5',  boon:'emberBorn',    why:'The Rimefire Caldera: Volcanic units on the lava spouts and the volcano'},
  {code:'23-5',  boon:'siegeTrain',   why:'The Goldfeather Siege: the siege engines under the walls'},
  // one on each side map from Map 5 that has skirmishes; not the Eye of the Volcano (elites only) or the Canopy (no skill family in its pool runs
  // half a deck: its cards are Armor, Stem and Savanna stragglers)
  {code:'5-A-2', boon:'risingTide',   why:'The Sunken Grove: Tide swampers'},
  {code:'7-A-2', boon:'hiveChorus',   why:'The Mycelium Deep: an Insect swarm'},
  {code:'8-A-3', boon:'skyAmbush',    why:'The Glimmer Depths: bats and moths, all Flying'},
  {code:'10-A-2',boon:'risingTide',   why:'The Sunken Depths: Tide fish under the Crushing Depths'},
  {code:'11-A-1',boon:'skyAmbush',    why:'The Aerie Vault: flyers and archers in the gale'},
  {code:'17-A-1',boon:'snowVeil',     why:'The Ice Hollow: Evasive frost runners'},
  {code:'18-A-3',boon:'sandVeil',     why:'The Pale Desert: a Desert deck in the Sandstorm'},
  {code:'19-A-3',boon:'emberBorn',    why:'The Basalt Foundry: Volcanic imps by the slag'},
  {code:'20-B-1',boon:'emberBorn',    why:'The Volcano Lair: Volcanic units under the volcano'},
];

// ---- the fights (codes as skirmish_pass.js names them)
const mains = MAPS.filter(m=> !m.sub);
function fightOf(code){
  for(const m of MAPS){ if(m.reserved || m.tower || m.endless) continue; const no = G.mapNumberOf(m.id); if(no == null) continue;
    const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
    for(let i = 0; i < m.nodes.length; i++){ const n = m.nodes[i];
      const c = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
      if(c === code){ G.NODE_MAP_HINT.set(n, m.id); return {m, n, code, mapNo: no, side: !!m.sub}; } } }
  return null;
}
const mainOf = m=> m.sub ? MAPS.find(x=> x.id === m.parent) : m;
const total = d=> Object.values(d).reduce((a, b)=> a + b, 0);
const RARE_UP = new Set(['epic','heroic','unique','questunique','legendary','mythic','ancient','devlegendary','devancient','eventlegendary']);
const POOLS = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {}; }catch(e){ return {}; } })();
function otherFightsReward(f, id){ const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === f.m.id && s.node === f.n.key)); }
// The cards this fight may take in: its map family's fights (the main map, its side maps) and the map's pool tiers (MAP + this side map's
// own), within the road's rarity cap, on the map's theme, not a token, not another fight's reward card, nothing above Very Rare.
function poolOf(f){
  const main = mainOf(f.m), fam = MAPS.filter(mm=> !mm.reserved && !mm.tower && !mm.endless && (mm === main || (mm.sub && mm.parent === main.id)));
  const ids = new Set(); fam.forEach(mm=> mm.nodes.forEach(x=>{ if(x.kind !== 'raidboss' && x.kind !== 'tutorial') Object.keys(x.deck || {}).forEach(id=> ids.add(id)); }));
  const mp = POOLS[main.id] || {}; (mp.cards || []).forEach(id=> ids.add(id)); if(f.m.sub && mp.submaps && Array.isArray(mp.submaps[f.m.id])) mp.submaps[f.m.id].forEach(id=> ids.add(id));
  return [...ids].filter(id=> D[id] && !D[id].token && !RARE_UP.has(D[id].rarity) && G.roadRarityOk(D[id].rarity, f.mapNo, 'skirmish', f.m.id)
    && !otherFightsReward(f, id) && !(TH && TH.offThemeFor(f.m.id, f.n, id)));
}
const capOf = id=> G.maxCopiesForRarity((D[id] || {}).rarity);
// a card's strength: its win rate from the card pass (docs/balance/card-balance.json), else its stat score (as tools/skirmish_pass.js)
const BAL = {}; try{ (JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-balance.json'), 'utf8')).rows || []).forEach(r=> BAL[r.id] = r.winRate); }catch(e){}
const strengthOf = id=> BAL[id] != null ? BAL[id] : 40 + G.skirmishCardScore(D[id] || {}) * 2;
const rareStep = id=> ['common','uncommon','starter','quest'].indexOf((D[id] || {}).rarity || 'common') < 0;
function legal(f, deck, leaders, boon){
  const ids = Object.keys(deck), n = total(deck);
  if(ids.length < 5 || ids.length > 7 || n < 12 || n > 20) return false;
  if(ids.some(id=> deck[id] > capOf(id))) return false;
  if(leaders.some(id=> !deck[id])) return false;
  if(f.mapNo >= 21 && f.mapNo <= 40 && ids.reduce((a, id)=> a + (rareStep(id) ? deck[id] : 0), 0) / n < 0.25) return false;
  const st = E.selfishBoonCount(D, deck, boon); return !!(st && st.on) && whoOk(deck, boon);
}
// the boon must have units to work on: where `who` names skills (Swarm, Tide, Rage ...), at least half the deck has them too (the first
// search, theme only, built 7-A-2's Insect deck with no Swarm unit and 9-4's with Tide units the CPU seldom played: 0 points either way)
const whoCopies = (deck, boon)=> Object.keys(deck).reduce((a, id)=> a + (E.selfishBoonWho(D[id], E.SELFISH_BOONS[boon]) ? deck[id] : 0), 0);
const whoOk = (deck, boon)=>{ const w = E.SELFISH_BOONS[boon].who; return w === 'all' || w === 'theme' || whoCopies(deck, boon) >= Math.ceil(total(deck) / 2); };
function measure(f, deck, boon, games, seed0, lvl){
  const node = Object.assign({}, f.n, {deck}); if(lvl != null) node.enemyLevel = lvl; if(boon) node.rules = Object.assign({}, f.n.rules || {}, {boon}); else if(node.rules && node.rules.boon){ node.rules = Object.assign({}, node.rules); delete node.rules.boon; }
  G.NODE_MAP_HINT.set(node, f.m.id);
  const r = G.simulateReferenceFight(f.m.id, node, games, {seed0: seed0 || 9100});
  return {win: Math.round(r.wins / games * 1000) / 10, hpLost: Math.round(r.hpLost * 1000) / 10};
}
function targetOf(f){ const b = G.skirmishTargetBand(f.m.id, f.n); const t = Math.max(0.2, b.t - CHALLENGE_DROP); return {t, lo: t - BAND, hi: t + BAND, curve: b.t}; }
const themed = (id, boon)=> E.selfishBoonThemeOf(D[id], E.SELFISH_BOONS[boon]) || E.selfishBoonWho(D[id], E.SELFISH_BOONS[boon]);
function moves(f, deck, pool, leaders, boon, easy){
  const out = [], ids = Object.keys(deck), movable = ids.filter(id=> !leaders.includes(id));
  const str = id=> strengthOf(id) + (themed(id, boon) ? 6 : 0);
  if(easy){ // stronger: more copies of its strongest, the strongest themed / pool cards added or in for the weakest, the weakest out
    const weak = movable.slice().sort((a, b)=> str(a) - str(b)).slice(0, 3), strong = pool.filter(id=> (deck[id] || 0) < capOf(id)).sort((a, b)=> str(b) - str(a)).slice(0, 6);
    ids.filter(id=> deck[id] < capOf(id)).sort((a, b)=> str(b) - str(a)).slice(0, 3).forEach(inn=> out.push({inn, k: Math.min(2, capOf(inn) - deck[inn])}));
    strong.forEach(inn=> out.push({inn, k: Math.min(2, capOf(inn) - (deck[inn] || 0))}));
    strong.forEach(inn=> weak.forEach(out_=>{ if(inn !== out_) out.push({out: out_, inn, k: Math.min(2, deck[out_], capOf(inn) - (deck[inn] || 0))}); }));
    weak.forEach(out_=> out.push({out: out_, k: Math.min(2, deck[out_])}));
  } else { // weaker: the strongest non-leader loses copies, or makes way for a weaker themed card
    const strong = movable.slice().sort((a, b)=> str(b) - str(a)).slice(0, 3), weak = pool.filter(id=> themed(id, boon) && (deck[id] || 0) < capOf(id)).sort((a, b)=> str(a) - str(b)).slice(0, 4);
    strong.forEach(out_=> out.push({out: out_, k: Math.min(2, deck[out_])}));
    weak.forEach(inn=> strong.forEach(out_=>{ if(inn !== out_) out.push({out: out_, inn, k: Math.min(2, deck[out_], capOf(inn) - (deck[inn] || 0))}); }));
  }
  return out.filter(m=> m.k > 0);
}
const apply1 = (deck, mv)=>{ const d = Object.assign({}, deck); if(mv.out){ d[mv.out] -= mv.k; if(d[mv.out] <= 0) delete d[mv.out]; } if(mv.inn) d[mv.inn] = (d[mv.inn] || 0) + mv.k; return d; };
// a deck that is short of the theme first takes themed cards in (for the least themed ones), until the boon is on
function themeUp(f, deck, pool, leaders, boon){
  let d = Object.assign({}, deck);
  const both = id=> E.selfishBoonThemeOf(D[id], E.SELFISH_BOONS[boon]) && E.selfishBoonWho(D[id], E.SELFISH_BOONS[boon]);
  for(let i = 0; i < 16 && !((E.selfishBoonCount(D, d, boon) || {}).on && whoOk(d, boon)); i++){
    const out = Object.keys(d).filter(id=> !leaders.includes(id) && !both(id)).sort((a, b)=> (themed(a, boon) - themed(b, boon)) || G.skirmishCardScore(D[a]) - G.skirmishCardScore(D[b]))[0];
    const on = (E.selfishBoonCount(D, d, boon) || {}).on, wok = whoOk(d, boon);
    const inn = pool.filter(id=> (both(id) || (!on && E.selfishBoonThemeOf(D[id], E.SELFISH_BOONS[boon])) || (!wok && E.selfishBoonWho(D[id], E.SELFISH_BOONS[boon]))) && (d[id] || 0) < capOf(id))
      .sort((a, b)=> (both(b) - both(a)) || strengthOf(b) - strengthOf(a))[0];
    if(!inn) break;
    if(out && total(d) >= 16) d = apply1(d, {out, inn, k: Math.min(2, d[out], capOf(inn) - (d[inn] || 0))}); else d = apply1(d, {inn, k: Math.min(2, capOf(inn) - (d[inn] || 0), 20 - total(d))});
    if(Object.keys(d).length > 7 && out){ d = apply1(d, {out, k: d[out]}); }
  }
  return d;
}
// The search: deck moves first; a fight still above its band after them gets its Enemy level one up (the skirmish editor's enemyLevel, as
// LEAD and BAL2 set it on elites; owner call DF3-2), then the deck moves again in either direction.
function search(f, boon, games){
  const tg = targetOf(f), want = tg.t * 100, pool = poolOf(f), leaders = G.skirmishLeadersOf(f.n, f.m.id).filter(id=> f.n.deck[id]);
  const sched = G.roadEnemyLevelExact(f.n, f.m.id); let lvl = null;
  let deck = themeUp(f, f.n.deck, pool, leaders, boon), cur = measure(f, deck, boon, games, 7300, lvl), trail = [{what:'start', win: cur.win}];
  const off = w=> Math.abs(w - want), P = (r, easy)=> off(r.win) + 10 * (easy ? 1 - r.hpLost / 100 : r.hpLost / 100);
  const deckRound = steps=>{
    for(let step = 0; step < steps && off(cur.win) > 4; step++){
      const easy = cur.win > want; let best = null;
      for(const mv of moves(f, deck, pool, leaders, boon, easy).slice(0, 30)){
        const nd = apply1(deck, mv); if(!legal(f, nd, leaders, boon)) continue;
        const r = measure(f, nd, boon, games, 7300, lvl); if(!best || P(r, easy) < P(best.r, easy)) best = {mv, nd, r};
        if(off(best.r.win) <= 4) break;
      }
      if(!best || P(best.r, easy) > P(cur, easy) - 2) break;
      deck = best.nd; cur = best.r; trail.push({what: best.mv, win: cur.win});
    } };
  deckRound(16);
  if(cur.win > tg.hi * 100){ const L = Math.floor(sched) + 1, r = measure(f, deck, boon, games, 7300, L);
    if(off(r.win) < off(cur.win)){ lvl = L; cur = r; trail.push({what: {enemyLevel: L, was: sched}, win: cur.win}); deckRound(8); } }
  return {deck, enemyLevel: lvl, schedLevel: sched, legal: legal(f, deck, leaders, boon), withBoon: cur.win, target: tg, trail, count: E.selfishBoonCount(D, deck, boon), poolSize: pool.length};
}
// ---- writing the fights into arena_app.js (one line a node)
function writeNodes(rows){
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of rows){
    const re = new RegExp(`(\\{ ?key:\\s*["']${x.key.replace(/[-]/g, '\\-')}["'],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', x.key); continue; }
    let line = mm[1];
    if(x.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.deck));
    if(!/challenge:true/.test(line)) line = line.replace(/(kind:"skirmish",)/, '$1 challenge:true,');
    if(x.showcase){ if(/showcase:"[^"]*"/.test(line)) line = line.replace(/showcase:"[^"]*"/, `showcase:"${x.showcase}"`); else line = line.replace(/(challenge:true,)/, `$1 showcase:"${x.showcase}",`); } // the fight keeps the leader it pays
    if(x.enemyLevel != null){ if(/enemyLevel:[\d.]+/.test(line)) line = line.replace(/enemyLevel:[\d.]+/, 'enemyLevel:' + x.enemyLevel); else line = line.replace(/(challenge:true,)/, '$1 enemyLevel:' + x.enemyLevel + ','); }
    if(/rules:\{/.test(line)){ if(!/"boon":/.test(line)) line = line.replace(/rules:\{/, `rules:{"boon":"${x.boon}",`).replace(/,\}/, '}'); else line = line.replace(/"boon":"\w+"/, `"boon":"${x.boon}"`); }
    else line = line.replace(/(deck:\{[^}]*\})/, `$1, rules:{"boon":"${x.boon}"}`);
    line = line.replace(/(deck:\{[^}]*\})( \/\*[^*]*\*\/)?/, (all, d, c)=> d + (c || '') + (all.includes('DF3') ? '' : ' /* 2026-10-24 (DF3): a challenge skirmish, its selfish boon and its synergy deck */'));
    if(line !== mm[1]){ s = s.replace(mm[1], line); n++; }
  }
  fs.writeFileSync(APP, s); return n;
}
const readJsonl = file=>{ try{ return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const todo = PLACEMENTS.filter(p=> !ONLY.length || ONLY.includes(p.code));
if(CMD === 'list'){
  for(const p of todo){ const f = fightOf(p.code); if(!f){ console.log(p.code, 'not found'); continue; }
    const st = E.selfishBoonCount(D, f.n.deck, p.boon), tg = targetOf(f);
    console.log(`${p.code.padEnd(7)} ${f.n.kind} ${f.n.name.padEnd(24)} ${p.boon.padEnd(13)} ${st.have}/${st.total} ${st.on ? 'on ' : 'off'} target ${Math.round(tg.t * 100)} (curve ${Math.round(tg.curve * 100)}) pool ${poolOf(f).length}${f.n.challenge ? ' [challenge]' : ''}`); }
} else if(CMD === 'search'){
  const games = nums[0] || 40, done = new Set(readJsonl(SEARCH_OUT).map(r=> r.code));
  for(const p of todo){ if(done.has(p.code)) continue; const f = fightOf(p.code); if(!f || (f.n.kind || 'skirmish') !== 'skirmish'){ console.log(p.code, 'not a skirmish'); continue; }
    const t0 = Date.now(), r = search(f, p.boon, games);
    const row = {code: p.code, map: f.m.id, key: f.n.key, name: f.n.name, boon: p.boon, why: p.why, before: f.n.deck, deck: r.deck, enemyLevel: r.enemyLevel, schedLevel: r.schedLevel, legal: r.legal, withBoon: r.withBoon, target: Math.round(r.target.t * 1000) / 10, curve: Math.round(r.target.curve * 1000) / 10, count: r.count, trail: r.trail, poolSize: r.poolSize, ms: Date.now() - t0};
    fs.appendFileSync(SEARCH_OUT, JSON.stringify(row) + '\n');
    console.log(p.code, p.boon, `${r.count.have}/${r.count.total}`, 'with boon', r.withBoon, 'target', row.target, r.legal ? '' : 'ILLEGAL', JSON.stringify(r.deck)); }
} else if(CMD === 'apply'){
  const rows = readJsonl(SEARCH_OUT).filter(r=> r.legal && r.apply !== false && todo.some(p=> p.code === r.code));
  console.log('wrote', writeNodes(rows), 'fights into arena_app.js');
} else if(CMD === 'measure'){
  const games = nums[0] || 200, out = [];
  for(const p of todo){ const f = fightOf(p.code); if(!f) continue; const boon = (f.n.rules || {}).boon || p.boon;
    const on = measure(f, f.n.deck, boon, games), off = measure(f, f.n.deck, null, games), tg = targetOf(f), st = E.selfishBoonCount(D, f.n.deck, boon);
    const row = {code: p.code, map: f.m.id, key: f.n.key, name: f.n.name, boon, challenge: !!f.n.challenge, deck: f.n.deck, count: st, withBoon: on.win, withoutBoon: off.win, boonPoints: Math.round((off.win - on.win) * 10) / 10,
      target: Math.round(tg.t * 1000) / 10, lo: Math.round(tg.lo * 1000) / 10, hi: Math.round(tg.hi * 1000) / 10, curveTarget: Math.round(tg.curve * 1000) / 10, inBand: on.win >= tg.lo * 100 && on.win <= tg.hi * 100, games};
    out.push(row); console.log(`${p.code.padEnd(7)} ${boon.padEnd(13)} ${st.have}/${st.total} with ${on.win} without ${off.win} (boon ${row.boonPoints} pts) target ${row.target} ${row.inBand ? 'in band' : 'OFF'}`); }
  if(!ONLY.length) fs.writeFileSync(MEASURE_OUT, JSON.stringify({about: 'Package DF3 (2026-10-24): the challenge skirmishes with their selfish boons, each measured with its boon on and switched off (the reference deck, the same seeds 9100 + 37g). tools/df3_boons_2026_10_24.js measure ' + games, games, rows: out}, null, 1) + '\n');
}
module.exports = {PLACEMENTS, fightOf, poolOf, targetOf};
