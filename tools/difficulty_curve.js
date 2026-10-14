#!/usr/bin/env node
// Difficulty curve (2026-10-11, user: "design a strong enough deck, then fight against EVERY single Skirmish in all
// types, and publish the win rate ... Roughly it should look like it goes up in difficulty, the win rate drops. Of
// course, a strong deck would have 100% win rate against lousier decks, so we would need another measure").
//
// Three reference decks play every fight on the road (skirmishes, elites, bosses, side maps; raid bosses are left to
// the Raid editor):
//   Starter  - the deck a new Otter player actually starts with (shared basics + Otter basics + the tutorial's rewards)
//   Mid-road - built from Base + every map reward up to Map 10 (maps count from 1)
//   Strong   - built from everything obtainable (Base, all map rewards, all packs)
// Mid-road and Strong are built, not guessed: cards are ranked by their measured win rate from the card-balance run
// (docs/balance/card-balance.json), three Lumber makers go in if the deck has 2+ Lumber cards, and then a hill-climb
// swaps cards one at a time, keeping a swap only if the deck wins more across a spread of fights.
//
// Each fight records, per deck: win rate, rounds to win (on wins) and the castle Health the deck loses (all games;
// a loss counts as all of it). A fight's difficulty index (0-100) averages four things: how often the Starter, the
// Mid-road and the Strong deck lose, and the share of its castle Health the Strong deck loses. So a fight every deck
// beats still reads harder when it costs the Strong deck more.
//
//   node tools/difficulty_curve.js [games=60]     writes docs/balance/difficulty-curve.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const N = +(process.argv.find(a=> /^\d+$/.test(a)) || 60);
const MY_HP = 30;

const score = id=>{ const d = defs[id]; return ((d.attack||0)*1.6 + (d.health||0)*0.6 + Object.keys(d.effects||{}).length*2) / (1 + (d.cost||0)*0.9 + (d.devilryCost||0)*1.2 + (d.prayerReq||0)*0.4 + (d.wait||0)*0.5) * ((d.effects||{}).ritual ? 0.35 : 1); };
const CAP = {devlegendary:1, devancient:1, eventlegendary:1, legendary:1, mythic:1, ancient:1, unique:1, questunique:1, epic:2, heroic:2, veryrare:3, superrare:3, rare:4, uncommon:5};
const EXCLUDE = new Set(['missingno']); // the secret #0 card
const playable = c=> !EXCLUDE.has(c.id) && !(c.source && c.source.kind==='secret') && !c.token && !c.test && !c.hallOfFame && c.cardType!=='materia' && c.cardType!=='equipment' && c.id!=='wandering-traveller' && !(c.effects||{}).leader && !(c.archetypes||[]).includes('Leader');
const isBase = c=> playable(c) && !(c.source && c.source.kind) && (c.rarity==='starter' || c.basic || !c.locked);
const isLumber = id=>{ const e = defs[id].effects||{}; return e.onSpawnGold || e.onReadyGold || (e.triggers||[]).some(t=> t.do==='gain' && (t.resource||'lumber')==='lumber'); };
function fill(ids, start){ const deck = Object.assign({}, start||{}); let n = Object.values(deck).reduce((a,b)=>a+b,0);
  for(const id of ids){ if(deck[id]) continue; const k = Math.min(4, CAP[defs[id].rarity] || 10, 20-n); if(k<=0) break; deck[id] = k; n += k; } return deck; }
const BAL = {}; try{ (JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-balance.json'), 'utf8')).rows||[]).forEach(r=> BAL[r.id] = r.winRate); }catch(e){}
const strength = id=> BAL[id]!=null ? BAL[id] : 40 + score(id)*2; // measured win rate where we have one
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const order = []; mains.forEach(m=>{ order.push(m); MAPS.filter(s=> s.sub && s.parent===m.id && !s.reserved).forEach(s=> order.push(s)); });
const mapIdx = m=> mains.indexOf(m.sub ? MAPS.find(x=> x.id===m.parent) : m);
const mapLabel = m=> m.sub ? `${mapIdx(m)+1}-A` : String(mapIdx(m)+1); // Map N as on the world screen (from 1)
const fightCode = (m, n)=>{ const fights = m.nodes.filter(x=> x.kind!=='tutorial' && x.kind!=='raidboss'); const k = fights.indexOf(n) + 1; return m.sub ? `${mapIdx(m)+1}-A-${k}` : `${mapIdx(m)+1}-${k}`; };
const fights = [];
order.forEach(m=> m.nodes.forEach(n=>{ if(n.deck && n.kind!=='tutorial' && n.kind!=='raidboss') fights.push({m, n}); }));

let CURRENT_RULES = null, CURRENT_FIELD = null;
function play(A, B, charB, hpB, mode, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {battleMode: mode || 'open', rules: CURRENT_RULES || undefined}); const so = p=> p===1 ? 'A' : 'B';
  if(CURRENT_FIELD) e.setField(CURRENT_FIELD, null, 'map');
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health: MY_HP})), 2: e.newPlayer(2, B, Object.assign({}, charB || charById.castle, {health: hpB}))}; const st = {};
  P[2].loopCards = [];
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r=1; r<=E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1); [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) e.roundStart(P, r, so, st, null);
    e.aiTakeTurn(P, so, 1, st, null); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r%2===0 ? 1 : 2)){ const a = P[1].hq.hp<=0, b = P[2].hq.hp<=0; return {w: a&&b ? 0 : a ? 2 : 1, r, hp: Math.max(0, P[1].hq.hp)}; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return {w: 0, r: E.DRAW_ROUND_CAP, hp: Math.max(0, P[1].hq.hp)};
}
function measure(deck, f, games){
  CURRENT_RULES = f.n.rules || null; CURRENT_FIELD = f.m.id==='m6' ? 'frozen' : null;
  const ch = f.n.characterId && charById[f.n.characterId];
  let wins = 0, rounds = 0, lost = 0;
  for(let k=0; k<games; k++){ const g = play(deck, f.n.deck, ch, f.n.hqHp, f.n.battleMode || 'open', 500 + k*31);
    if(g.w===1){ wins++; rounds += g.r; lost += (MY_HP - g.hp)/MY_HP; } else lost += 1; }
  return {win: Math.round(wins/games*1000)/10, rounds: wins ? Math.round(rounds/wins*10)/10 : null, hpLost: Math.round(lost/games*1000)/10};
}

// Pools
const baseIds = cards.filter(isBase).map(c=> c.id);
const rewardIds = upTo=> cards.filter(c=> playable(c) && c.source && c.source.kind==='map' && (()=>{ const m = MAPS.find(x=> x.id===c.source.id); return m && !m.reserved && (upTo==null || mapIdx(m) <= upTo); })()).map(c=> c.id);
const packIds = cards.filter(c=> playable(c) && c.source && c.source.kind==='pack').map(c=> c.id);
const POOLS = {starter: baseIds, mid: [...baseIds, ...rewardIds(9)], strong: [...baseIds, ...rewardIds(null), ...packIds]};

// Build each reference deck
const sample = fights.filter((f, i)=> i % 6 === 0);
const evalDeck = deck=> sample.reduce((t, f)=> t + measure(deck, f, 10).win + (100 - measure(deck, f, 4).hpLost)*0.25, 0);
function rngOf(seed){ return E.mulberry32(seed); }
function build(pool, seed){
  const ids = [...new Set(pool)].filter(id=> defs[id] && playable(defs[id])).sort((a,b)=> strength(b)-strength(a) || (a<b?-1:1));
  let deck = fill(ids);
  if(Object.keys(deck).some(id=> (defs[id].cost||0) >= 2)){ const lum = ids.filter(isLumber).slice(0, 2); deck = fill(ids, Object.fromEntries(lum.map(id=> [id, Math.min(3, CAP[defs[id].rarity] || 3)]))); }
  let best = evalDeck(deck); const rnd = rngOf(seed); const top = ids.slice(0, 70);
  for(let it=0; it<40; it++){
    const cur = Object.keys(deck); const out = cur[Math.floor(rnd()*cur.length)];
    const inn = top.filter(id=> !deck[id])[Math.floor(rnd()*Math.min(30, top.length))]; if(!inn) continue;
    const trial = Object.assign({}, deck); const k = trial[out]; delete trial[out]; trial[inn] = Math.min(k, 4, CAP[defs[inn].rarity] || 10);
    let n = Object.values(trial).reduce((a,b)=>a+b,0); if(n < 20){ const filled = fill(ids, trial); Object.assign(trial, filled); }
    const sc = evalDeck(trial); if(sc > best){ best = sc; deck = trial; }
  }
  return deck;
}
const decks = {};
const starterDeck = (()=>{ const m = /const STARTER_CFG_DEFAULT = \{([\s\S]*?)\n\};/.exec(src); const cfg = eval('({' + m[1] + '})');
  const d = Object.assign({}, cfg.starterShared); Object.entries(cfg.starterOtters).forEach(([id,n])=> d[id] = (d[id]||0) + n);
  // 2026-10-15: the baby filler tops the base deck up to 17 (see starterDeckParts in arena_app.js)
  { let n = Object.values(d).reduce((a, b)=> a + b, 0); Object.entries(cfg.starterFiller || {}).forEach(([id, k])=>{ for(let i = 0; i < k && n < 17; i++, n++) d[id] = (d[id]||0) + 1; }); }
  cfg.rewards.forEach(id=> d[id] = (d[id]||0) + 1); return d; })();
decks.starter = {variant: 'Otter starter', deck: starterDeck};
// --reuse-decks keeps the Mid-road and Strong decks from the last run (tools/curve_tune.js tunes against those).
const prev = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8')).decks; }catch(e){ return null; } })();
const reuse = process.argv.includes('--reuse-decks') && prev;
const fromPrev = k=> Object.fromEntries(prev[k].cards.map(c=> [c.id, c.n]));
decks.mid = {variant: 'built', deck: reuse ? fromPrev('mid') : build(POOLS.mid, 11)};
decks.strong = {variant: 'built', deck: reuse ? fromPrev('strong') : build(POOLS.strong, 23)};
for(const [name, v] of Object.entries(decks)) console.log(`${name.padEnd(7)} ${Object.entries(v.deck).map(([id,n])=> `${n}× ${defs[id].name}`).join(', ')}`);

const out = [];
for(const f of fights){
  const res = {}; for(const name of Object.keys(decks)) res[name] = measure(decks[name].deck, f, N);
  const index = Math.round(((100-res.starter.win) + (100-res.mid.win) + (100-res.strong.win) + res.strong.hpLost)/4*10)/10;
  out.push({map: f.m.id, mapNo: mapLabel(f.m), mapName: f.m.name, side: !!f.m.sub, key: fightCode(f.m, f.n), nodeKey: f.n.key, kind: f.n.kind, name: f.n.name || f.n.key, hp: f.n.hqHp, res, index});
  console.log(`${mapLabel(f.m).padEnd(5)} ${fightCode(f.m, f.n).padEnd(7)} ${f.n.kind.padEnd(9)} S ${String(res.starter.win).padStart(5)}  M ${String(res.mid.win).padStart(5)}  X ${String(res.strong.win).padStart(5)} (${res.strong.rounds ?? '-'} rds, ${res.strong.hpLost}% lost)  index ${index}`);
}
const deckList = Object.fromEntries(Object.entries(decks).map(([k, v])=> [k, {variant: v.variant, cards: Object.entries(v.deck).map(([id, n])=> ({id, name: defs[id].name, n}))}]));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'difficulty-curve.json'), JSON.stringify({generated: new Date().toISOString().slice(0,10), games: N, myCastleHp: MY_HP, decks: deckList, fights: out}, null, 1) + '\n');
console.log('wrote docs/balance/difficulty-curve.json,', out.length, 'fights');
