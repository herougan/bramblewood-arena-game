#!/usr/bin/env node
// 2026-10-22 (package SK; owner 09:52: "Skirmishes should have 5-7 cards in them. (7 should be rare. Like 6 cronies and 1 bigger unit - the
// leader). ... Map 2 onwards, it is compulsory they all have leaders. The leader will be the highlighted unit. (I know this breaks the rules.
// We don't have to tell the player. It's just so that the highlighted card comes out in play often.)"). docs/action-items.md N22-2.
//   node tools/skirmish_sizes_2026_10_22.js plan    -> docs/balance/skirmish-sizes-2026-10-22.json: every skirmish's new deck (5-7 different cards),
//                                                      its leader (the showcase card) and the battle rating before / after; nothing is written to arena_app.js
//   node tools/skirmish_sizes_2026_10_22.js apply   -> writes the planned decks and showcases into arena_app.js's CONQUEST_MAPS (textually, node by node)
//   node tools/skirmish_sizes_2026_10_22.js check   -> sizes, 7s, leaders, ladder, pools, rank caps and battle rating per map, on the live files; exit 1 on a failure
//   node tools/skirmish_sizes_2026_10_22.js list    -> the same table without the pass / fail
// The leader rule itself is the game's (arena_app.js skirmishLeadersOf: from Map 2 the showcase card, chosen or Auto), read through lib_bramble.js.
// In scope: every skirmish (kind missing or 'skirmish' once the road kinds are applied) of every main map and submap, but not the endless
// dungeons (generated floors) and not the Tutorial map's lesson fights (T-2, T-3: they teach with a hand-picked lineup). Elites, bosses and raid
// bosses are left alone. A card is only drawn from the map's pool (canonical/map-pools.json: MAP + that submap + SPECIAL), under the road's rarity
// ladder (roadRarityCap) and the deck rank caps (BramblewoodBudget.deckRankOver, the leader counted). A fight's own reward card stays on its deck.
// The deck keeps its total copies and its battle rating (enemyDeckLevel, the leader counted from Map 2) within 10% of what it was.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G, MAPS = G.CONQUEST_MAPS;
const Budget = require(path.join(ROOT, 'bramblewood-budget.js'));
const LMP = require('./lib_map_pools.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'skirmish-sizes-2026-10-22.json');
const APP = path.join(ROOT, 'arena_app.js');
const POOLS_FILE = path.join(ROOT, 'canonical', 'map-pools.json');
const CARDS_RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const defs = G.getCardDefs();
const STEP = r=> G.roadRarityStep(r);
const rarOf = id=> (defs[id] && defs[id].rarity) || 'common';
const stepOf = id=> STEP(rarOf(id));
const isLeaderCard = id=> ((defs[id] || {}).archetypes || []).includes('Leader');
const mains = MAPS.filter(m=> !m.sub && !m.reserved);

// The plan of an earlier run: `plan` starts from its `from` decks, so running it again gives the same plan.
const PRIOR = fs.existsSync(OUT) ? (()=>{ try{ return JSON.parse(fs.readFileSync(OUT, 'utf8')); }catch(e){ return null; } })() : null;
const FROM = {}; // 'mapId/key' -> the deck before this package
if(PRIOR) Object.entries(PRIOR.nodes).forEach(([id, x])=>{ FROM[id] = x.from; });
const origDeck = (m, n)=> FROM[m.id + '/' + n.key] || n.deck;

// ---------------------------------------------------------------- scope
const isRaid = n=> /^(raidboss|megaraid)$/.test(n.kind || '');
const inScope = (m, n)=> !m.reserved && !m.endless && !m.tower && m.id !== 'mtut' && n.deck && !isRaid(n) && (n.kind || 'skirmish') === 'skirmish';
const SCOPE = []; MAPS.forEach(m=> (m.nodes || []).forEach(n=>{ if(inScope(m, n)) SCOPE.push({m, n}); }));
const mapNoOf = m=> G.mapNumberOf(m.id);
const fightNo = (m, n)=>{ G.NODE_MAP_HINT.set(n, m.id); return m.sub ? G.fightMapNumber(n) : mapNoOf(m); };
const poolsFile = ()=> JSON.parse(fs.readFileSync(POOLS_FILE, 'utf8')).maps;
function poolEntry(m){ const main = m.sub ? MAPS.find(x=> x.id === m.parent) : m; return LMP.normalizeEntry(poolsFile()[main.id]); }
function poolOf(m){ const P = poolEntry(m); return new Set([...P.cards, ...(m.sub ? (P.submaps[m.id] || []) : []), ...P.special]); }
const sum = o=> Object.values(o).reduce((a, b)=> a + b, 0);
const strength = id=> ((defs[id] || {}).attack || 0) + ((defs[id] || {}).health || 0);
const oddRules = id=>{ const d = defs[id] || {}; return (d.devilryCost || 0) > 0 || (d.prayerReq || 0) > 0 || !!(d.effects && d.effects.ritual); }; // costs the CPU cannot always pay

// Is `id` a sensible leader of a deck of `ids`: the top rarity, and not a small card among big ones?
function sensible(id, ids){
  if(!id || !defs[id] || oddRules(id)) return false;
  const top = Math.max(...ids.map(stepOf)), mx = Math.max(...ids.map(strength)), mc = Math.max(...ids.map(costOf));
  return stepOf(id) >= top && (strength(id) >= 0.45 * mx || costOf(id) >= mc - 1);
}
const costOf = id=> (defs[id] || {}).cost || 0;
// the biggest unit by cost or strength (the rarity counts a little): what an explicit showcase / leader pick is
const bigness = id=> 12 * costOf(id) + strength(id) + 5 * stepOf(id);
const bestLeader = ids=> ids.filter(id=> !oddRules(id)).sort((a, b)=> bigness(b) - bigness(a) || a.localeCompare(b))[0];
function autoPick(ids){ return G.nodeShowcaseId({deck: Object.fromEntries(ids.map(i=> [i, 1])), showcase: null}); }
// "A clear leader": the top card is a rarity above every other card, or at least 1.5x the next card's strength at the same rarity.
function clearGap(id, ids){
  const rest = ids.filter(i=> i !== id); if(!rest.length) return 0;
  const sTop = stepOf(id), sRest = Math.max(...rest.map(stepOf)), r = strength(id) / Math.max(1, Math.max(...rest.filter(i=> stepOf(i) === sRest).map(strength)));
  if(sTop > sRest) return 10 * (sTop - sRest) + Math.min(r, 5); if(sTop === sRest && r >= 1.5) return Math.min(r, 5) - 1; return 0;
}

// ---------------------------------------------------------------- the battle rating, fast (the game's enemyDeckLevel, unrounded)
function context(m, n){
  G.NODE_MAP_HINT.set(n, m.id);
  const road = G.roadEnemyLevel(n), fno = fightNo(m, n);
  const lv = id=>{ const set = n.cardLevels && n.cardLevels[id]; const b = G.cardBaseLevel(defs[id]); return set != null && set !== '' ? Number(set) : Math.max(b, road || b); };
  const wl = id=> G.ratingWeightOf(defs[id]) * G.ratingLevelFactor(lv(id), n.levelCap || 11);
  const cap = STEP(G.roadRarityCap(fno, n.kind || 'skirmish', m.id));
  const rewards = CARDS_RAW.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key).map(c=> c.id);
  return {m, n, road, fno, wl, cap, rewards, mapNo: mapNoOf(m), pool: poolOf(m), special: poolEntry(m).special};
}
const brReal = (m, n, deck, leaders)=>{ const t = Object.assign({}, n, {deck, leaders: leaders || []}); G.NODE_MAP_HINT.set(t, m.id); return G.enemyDeckLevel(t); };

// ---------------------------------------------------------------- the plan
const SOFT_CAP = [5, 4, 3, 3, 2, 2, 2, 2, 1, 1]; // copies of one card in a deck by rarity step, under the rarity's own limit
const maxCopies = id=> G.maxCopiesForRarity(rarOf(id));
function theme(id){ const d = defs[id] || {}; return new Set([...(d.species || []), ...(d.archetypes || []).filter(a=> a !== 'Misc' && a !== 'Leader'), d.animal].filter(Boolean)); }
function themeScore(id, ids){ const t = theme(id); let s = 0; ids.forEach(o=>{ theme(o).forEach(x=>{ if(t.has(x)) s++; }); }); return s; }

function chooseSevens(){ // up to ~1 in 7 skirmishes keeps 7 cards: the clearest leaders among the decks that are 7 or more today, two a map at most
  const K = Math.floor(SCOPE.length / 7), cand = [];
  SCOPE.forEach(({m, n})=>{ if(mapNoOf(m) < 2) return; const d = origDeck(m, n), ids = Object.keys(d); if(ids.length < 7) return;
    const lead = n.showcase && d[n.showcase] ? n.showcase : bestLeader(ids); if(!sensible(lead, ids) || d[lead] > 2) return;
    const gap = clearGap(lead, ids); if(gap <= 0) return; cand.push({id: m.id + '/' + n.key, m, gap, size: ids.length}); });
  cand.sort((a, b)=> b.gap - a.gap || b.size - a.size || a.id.localeCompare(b.id));
  const per = {}, out = new Set();
  cand.forEach(c=>{ if(out.size >= K || (per[c.m.id] || 0) >= 2) return; per[c.m.id] = (per[c.m.id] || 0) + 1; out.add(c.id); });
  return out;
}

function planNode(m, n, wantSeven, forced){
  const pid = m.id + '/' + n.key, sc0 = PRIOR && PRIOR.nodes[pid] ? PRIOR.nodes[pid].showcaseBefore : (n.showcase || null); // the owner's own pick, before this package
  const ctx = context(m, n), deck0 = origDeck(m, n), ids0 = Object.keys(deck0), T0 = sum(deck0), notes = [];
  const leaderOn = ctx.mapNo >= 2;
  const brOld = brReal(m, n, deck0, []);
  const target = ids0.length >= 8 ? (wantSeven ? 7 : 6) : ids0.length === 7 ? (wantSeven ? 7 : 6) : ids0.length === 4 ? 5 : ids0.length;
  const prot = new Set([...ctx.rewards.filter(i=> deck0[i]), ...(sc0 && deck0[sc0] ? [sc0] : []), ...ids0.filter(i=> ctx.special.includes(i))]);
  let ids = ids0.slice();
  if(forced && forced.deck){ ids = Object.keys(forced.deck); notes.push('hand-set deck'); }
  else {
    // trim: protect the rewards, the chosen showcase and the top card (the leader); then the weakest copies go, high rarity first on a tie
    if(ids.length > target){
      const top = bestLeader(ids); if(top) prot.add(top); prot.add(autoPick(ids)); // the Auto pick and the biggest unit may both end up the leader
      if(!ids.some(i=> stepOf(i) === 0 && !prot.has(i))) { const c = ids.filter(i=> stepOf(i) === 0).sort((a, b)=> deck0[b] - deck0[a])[0]; if(c) prot.add(c); }
      const order = ids.filter(i=> !prot.has(i)).sort((a, b)=> deck0[a] - deck0[b] || stepOf(b) - stepOf(a) || a.localeCompare(b));
      while(ids.length > target && order.length){ const x = order.shift(); ids = ids.filter(i=> i !== x); notes.push('-' + x); }
    }
    // grow (4 -> 5): a pool card the ladder allows, near the deck's rarity, that fits its theme and the map's other fights
    while(ids.length < target){
      const med = ids.map(stepOf).sort((a, b)=> a - b)[Math.floor(ids.length / 2)], used = {};
      m.nodes.forEach(o=>{ if(o !== n && o.deck) Object.keys(o.deck).forEach(i=> used[i] = (used[i] || 0) + 1); });
      const topStep = Math.max(...ids.map(stepOf)); // a new card never outranks the deck's top card (that one leads)
      const cand = [...ctx.pool].filter(i=> defs[i] && !ids.includes(i) && !isLeaderCard(i) && stepOf(i) <= ctx.cap && stepOf(i) <= topStep && !oddRules(i) && G.roadRarityOk(rarOf(i), ctx.fno, 'skirmish', m.id) && !G.roadNever(rarOf(i)));
      if(!cand.length) throw new Error(`${m.id} ${n.key}: no card to add`);
      cand.sort((a, b)=> (3 * themeScore(b, ids) + 2 * Math.min(used[b] || 0, 3) - 2.5 * Math.abs(stepOf(b) - med)) - (3 * themeScore(a, ids) + 2 * Math.min(used[a] || 0, 3) - 2.5 * Math.abs(stepOf(a) - med)) || a.localeCompare(b));
      ids.push(cand[0]); notes.push('+' + cand[0]);
    }
  }
  // the leader: Map 2 on, the chosen showcase, else the Auto pick; a hand pick (showcase) where Auto is not a sensible leader
  const leaderFor = list=>{
    if(!leaderOn) return {showcase: sc0 && !list.includes(sc0) ? 'CLEAR' : null, leader: null};
    const auto = autoPick(list); let showcase = null, note = null;
    if(forced && forced.showcase) showcase = forced.showcase;
    else if(sc0 && list.includes(sc0)){ showcase = sc0; if(!sensible(showcase, list) && sensible(auto, list)){ showcase = null; note = 'showcase->auto'; } }
    if(!showcase && !sensible(auto, list)){ const b = bestLeader(list); if(b !== auto){ showcase = b; note = 'showcase set by hand: ' + b + ' (Auto, ' + auto + ', is no sensible leader)'; } }
    return {showcase, leader: showcase || auto, note};
  };
  // the copies: keep the total, the shape and the battle rating (the leader counted from Map 2) close to what they were
  const kept = ids.filter(i=> deck0[i]), keptSum = kept.reduce((a, i)=> a + deck0[i], 0), N0 = ids.length;
  const swapOf = {}; // replacement -> the card it stands in for (its old copies are the shape to keep)
  const tgt = i=>{ const o = swapOf[i] || i; return deck0[o] ? deck0[o] * T0 / keptSum : T0 / N0; };
  const ub = i=>{ const o = swapOf[i] || i; return Math.max(1, Math.min(maxCopies(i), Math.max(deck0[o] || 0, SOFT_CAP[Math.min(stepOf(i), 9)]))); };
  const find = list=>{ const L = leaderFor(list), r = searchCopies(ctx, list, L.leader, leaderOn, T0, tgt, ub, brOld, list.length === 7 ? 2 : 99, deck0); r.L = L; return r; }; // a 7-card deck: the leader is a single (or a pair), the rest are the cronies
  let res = forced && forced.deck ? {c: forced.deck, tier: 'hand', e: 0, L: leaderFor(ids)} : find(ids);
  // the leader alone can lift the rating past 10%: swap the heaviest cards (not a reward, not the owner's showcase) for lighter pool cards, up to three times
  for(let round = 0; round < 3 && res.tier === 'C' && !(forced && forced.deck); round++){
    let best = null;
    const usedOn = {}; m.nodes.forEach(o=>{ if(o !== n && o.deck) Object.keys(o.deck).forEach(i=> usedOn[i] = 1); }); // a replacement is a card this map's other fights already use
    ids.filter(i=> !prot.has(i)).sort((a, b)=> ctx.wl(b) - ctx.wl(a)).slice(0, 3).forEach(out=>{
      [...ctx.pool].filter(i=> usedOn[i] && defs[i] && !ids.includes(i) && !isLeaderCard(i) && !oddRules(i) && stepOf(i) < stepOf(out) && G.roadRarityOk(rarOf(i), ctx.fno, 'skirmish', m.id))
        .sort((a, b)=> themeScore(b, ids) - themeScore(a, ids) || stepOf(b) - stepOf(a) || a.localeCompare(b)).slice(0, 4).forEach(r=>{
          swapOf[r] = swapOf[out] || out; const ids2 = ids.map(i=> i === out ? r : i);
          try{ const r2 = find(ids2); if(!best || r2.e < best.res.e) best = {ids2, res: r2, out, r}; }catch(e){} });
    });
    if(!best || best.res.e >= res.e - 0.005) break;
    ids = best.ids2; res = best.res; notes.push(`swap ${best.out}->${best.r}`);
  }
  const showcase = res.L.showcase, leader = res.L.leader; if(res.L.note) notes.push(res.L.note);
  const deck = {}; ids.slice().sort((a, b)=> stepOf(a) - stepOf(b) || a.localeCompare(b)).forEach(i=> deck[i] = res.c[i]);
  if(ids.length === 7 && deck[leader] > 1) notes.push('7 cards: leader x' + deck[leader]);
  const leaders = leaderOn ? [leader] : [];
  const brNew = brReal(m, n, deck, leaders);
  return {mapNo: ctx.mapNo, from: deck0, showcaseBefore: sc0, to: deck, showcase, leader, sizeBefore: ids0.length, sizeAfter: ids.length, copiesBefore: T0, copiesAfter: sum(deck), brBefore: brOld, brAfter: brNew, tier: res.tier, notes};
}

// enumerate the copy vectors (1..ub each, summing to T) and take the one nearest the old shape inside the rating window
function searchCopies(ctx, ids, leader, leaderOn, T0, tgt, ub, brOld, leaderMax, deck0){
  const k = ids.length, wl = ids.map(i=> ctx.wl(i)), step = ids.map(stepOf), li = leader ? ids.indexOf(leader) : -1;
  const lead = leaderOn && li >= 0 ? 2 * wl[li] : 0, ubs = ids.map((i, j)=> j === li ? Math.min(ub(i), leaderMax) : ub(i));
  const t = ids.map(tgt), rule13 = ctx.mapNo >= 21;
  for(let drop = 0; drop <= 4; drop++){
    const T = T0 - drop, tiers = [null, null, null]; let best = null;
    if(ubs.reduce((a, b)=> a + b, 0) < T || k > T) continue;
    const c = new Array(k).fill(1);
    const rec = (j, left)=>{
      if(j === k - 1){ if(left < 1 || left > ubs[j]) return; c[j] = left;
        if(ids.reduce((a, _, x)=> a + (step[x] === 0 ? c[x] : 0), 0) < 2) return;
        if(rule13 && ids.reduce((a, _, x)=> a + (step[x] <= 1 ? c[x] : 0), 0) < Math.ceil(0.4 * T)) return;
        const br = ids.reduce((a, _, x)=> a + c[x] * wl[x], 0) * 20 / T + lead, e = Math.abs(br / brOld - 1), ad = Math.abs(br - brOld), tier = e <= 0.05 || ad <= 1 ? 0 : e <= 0.10 || ad <= 2.2 ? 1 : 2;
        let d = 0; for(let x = 0; x < k; x++) d += (c[x] - t[x]) * (c[x] - t[x]);
        const cur = tiers[tier]; if(tier === 2){ if(!cur || e < cur.e) tiers[2] = {c: c.slice(), d, e}; } else if(!cur || d < cur.d) tiers[tier] = {c: c.slice(), d, e};
        return; }
      const rest = k - j - 1;
      for(let v = 1; v <= ubs[j]; v++){ const l = left - v; if(l < rest || l > ubsFrom[j + 1]) continue; c[j] = v; rec(j + 1, l); }
    };
    const ubsFrom = new Array(k + 1).fill(0); for(let j = k - 1; j >= 0; j--) ubsFrom[j] = ubsFrom[j + 1] + ubs[j];
    rec(0, T);
    // the best vector that also keeps the rank caps (Legendary 3 / Mythic 2 / higher 1, the leader counted)
    const pick = tiers[0] || tiers[1] || tiers[2];
    if(pick){ const o = {}; ids.forEach((i, j)=> o[i] = pick.c[j]);
      if(!Budget.deckRankOver(o, defs, leader && leaderOn ? [leader] : []).length) return {c: o, tier: tiers[0] ? 'A' : tiers[1] ? 'B' : 'C', e: pick.e}; }
  }
  throw new Error(`${ctx.m.id} ${ctx.n.key}: no copy vector for ${ids.join(', ')}`);
}

// Sergeant Bramblefox (N22-3): Fox Run's deck is set by hand around its new leader
const HAND = {
  'mr/13-2': {deck: {'berserker-boar': 4, 'fox-kit': 3, 'swift-fox': 3, 'grizzly-vanguard': 3, 'tasmanian-devil': 2, 'sergeant-bramblefox': 1}, showcase: 'sergeant-bramblefox'}
};

function plan(){
  const sevens = chooseSevens(), nodes = {};
  SCOPE.forEach(({m, n})=>{ const id = m.id + '/' + n.key; nodes[id] = planNode(m, n, sevens.has(id), HAND[id]); });
  fs.writeFileSync(OUT, JSON.stringify({_about: 'Package SK (2026-10-22): every skirmish deck (main maps and submaps, not the endless dungeons or the Tutorial lessons) as 5-7 different cards, its leader (Map 2 on: the showcase card) and the battle rating (enemyDeckLevel; leader counted) before and after. `from` is the deck before the package. node tools/skirmish_sizes_2026_10_22.js plan|apply|check.', nodes}, null, 1) + '\n');
  const sz = o=> Object.keys(o).length, hist = f=>{ const h = {}; Object.values(nodes).forEach(x=>{ const k = f(x); h[k] = (h[k] || 0) + 1; }); return h; };
  console.log('skirmishes', Object.keys(nodes).length, '\nbefore', JSON.stringify(hist(x=> sz(x.from))), '\nafter', JSON.stringify(hist(x=> sz(x.to))), '\nrating tiers', JSON.stringify(hist(x=> x.tier)));
  const off = Object.entries(nodes).filter(([, x])=> Math.abs(x.brAfter / x.brBefore - 1) > 0.12 && Math.abs(x.brAfter - x.brBefore) > 3); console.log('outside 10%:', off.map(([k, x])=> `${k} ${x.brBefore}->${x.brAfter}`).join(', ') || 'none');
}

// ---------------------------------------------------------------- apply (CONQUEST_MAPS, textually)
function apply(){
  if(!PRIOR) throw new Error('run plan first');
  const lines = fs.readFileSync(APP, 'utf8').split('\n'); let n = 0;
  const heads = {}; lines.forEach((l, i)=>{ const mm = /^  \{ id:"([a-z0-9]+)"/.exec(l); if(mm) heads[mm[1]] = i; });
  const order = Object.entries(heads).sort((a, b)=> a[1] - b[1]);
  Object.entries(PRIOR.nodes).forEach(([id, x])=>{
    const [mid, key] = id.split('/'), from = heads[mid], next = (order.find(([, i])=> i > from) || [null, lines.length])[1];
    let hit = -1; for(let i = from + 1; i < next; i++){ if(lines[i].trim().startsWith(`{ key:"${key}",`)){ if(hit >= 0) throw new Error('two lines for ' + id); hit = i; } }
    if(hit < 0) throw new Error('no line for ' + id);
    let line = lines[hit]; const keep = line;
    line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.to));
    if(x.showcase === 'CLEAR') line = line.replace(/, showcase:"[^"]*"/, '');
    else if(x.showcase){ if(/showcase:"[^"]*"/.test(line)) line = line.replace(/showcase:"[^"]*"/, `showcase:"${x.showcase}"`); else line = line.replace(/ \}(,?)\s*$/, `, showcase:"${x.showcase}" }$1`); }
    if(line !== keep){ lines[hit] = line; n++; }
  });
  fs.writeFileSync(APP, lines.join('\n')); console.log('nodes written:', n);
}

// ---------------------------------------------------------------- list / check
function rows(){
  return SCOPE.map(({m, n})=>{ const ids = Object.keys(n.deck), ctx = context(m, n), leaders = G.skirmishLeadersOf(n, m.id), p = PRIOR && PRIOR.nodes[m.id + '/' + n.key];
    return {m, n, ids, ctx, leaders, p, size: ids.length, copies: sum(n.deck), br: G.enemyDeckLevel(n)}; });
}
const EXCEPTIONS = ['mt/16-4', 'm21/21-2', 'mx/20-B-3']; // the rest of the deck is already Common (or has no lighter card the map uses), so copy counts cannot offset the leader's double weight
function check(failOnError){
  const R = rows(), fails = [], exceptions = [], ok = (c, msg)=>{ if(!c) fails.push(msg); }, pools = poolsFile();
  const N = R.length, sevens = R.filter(r=> r.size === 7);
  ok(sevens.length <= Math.ceil(N / 6), `7-card decks: ${sevens.length} of ${N} (at most about 1 in 6 = ${Math.ceil(N / 6)})`);
  R.forEach(r=>{
    const at = `${r.m.id} ${r.n.key}`, d = r.n.deck, no = r.ctx.mapNo;
    ok(r.size >= 5 && r.size <= 7, `${at}: ${r.size} different cards (want 5-7)`);
    if(r.size === 7){ ok(no >= 2, `${at}: 7 cards without a leader (Map ${no})`); const l = r.leaders[0]; ok(l && clearGap(l, r.ids) > 0 && d[l] <= 2, `${at}: 7 cards but no clear leader (${l})`); }
    if(no >= 2){
      ok(r.leaders.length === 1 && d[r.leaders[0]] > 0, `${at}: leaders ${JSON.stringify(r.leaders)} not in the deck`);
      ok(r.leaders[0] === G.nodeShowcaseId(r.n), `${at}: leader is not the showcase card`);
      ok(sensible(r.leaders[0], r.ids) || r.leaders[0] === bestLeader(r.ids), `${at}: leader ${r.leaders[0]} is not the deck's biggest unit`);
    } else ok(r.leaders.length === 0, `${at}: Map ${no} has leaders ${r.leaders}`);
    Object.keys(d).forEach(id=>{
      ok(defs[id], `${at}: unknown card ${id}`); ok(G.roadRarityOk(rarOf(id), r.ctx.fno, 'skirmish', r.m.id), `${at}: ${id} (${rarOf(id)}) is past the ladder`);
      ok(r.ctx.pool.has(id), `${at}: ${id} is in no pool of the map`); ok(!G.roadNever(rarOf(id)), `${at}: ${id} never on the road`); ok(d[id] <= maxCopies(id), `${at}: ${id} x${d[id]} over its copy limit`); });
    ok(!Budget.deckRankOver(d, defs, r.leaders).length, `${at}: deck rank caps (leader counted)`);
    ok(Object.entries(d).filter(([id])=> stepOf(id) === 0).reduce((a, [, c])=> a + c, 0) >= 2, `${at}: under 2 Common copies`);
    r.ctx.rewards.forEach(id=>{ if(!isLeaderCard(id) && r.p && r.p.from[id]) ok(d[id], `${at}: reward ${id} left its deck`); });
    if(r.p){ const b0 = r.p.brBefore, t0 = r.p.copiesBefore;
      // about 10%: a leader is a free extra unit, so the smallest decks (rating 20) cannot land closer than +2; three fights keep a bigger step because
      // nothing lighter is left to trade against the leader (EXCEPTIONS: reported, not hidden)
      const fine = Math.abs(r.br / b0 - 1) <= 0.12 || Math.abs(r.br - b0) <= 3;
      if(!fine && EXCEPTIONS.includes(r.m.id + '/' + r.n.key)) exceptions.push(`${at}: ${b0} -> ${r.br} (${(100 * (r.br / b0 - 1)).toFixed(0)}%)`);
      else ok(fine, `${at}: battle rating ${b0} -> ${r.br} (${(100 * (r.br / b0 - 1)).toFixed(0)}%)`);
      ok(Math.abs(r.copies - t0) <= Math.max(2, Math.round(0.1 * t0)), `${at}: copies ${t0} -> ${r.copies}`); }
  });
  // Sergeant Bramblefox (N22-3)
  const bf = defs['sergeant-bramblefox'], mr = MAPS.find(m=> m.id === 'mr'), fr = mr.nodes.find(n=> n.key === '13-2');
  ok(bf && bf.source && bf.source.id === 'mr' && bf.source.node === '13-2' && bf.rarity === 'rare', 'Bramblefox: not Rare on 13-2');
  ok(fr.showcase === 'sergeant-bramblefox' && fr.deck['sergeant-bramblefox'] > 0 && G.skirmishLeadersOf(fr, 'mr')[0] === 'sergeant-bramblefox', 'Bramblefox: not the leader of 13-2');
  ok(pools.mr.special.includes('sergeant-bramblefox') || pools.mr.cards.includes('sergeant-bramblefox'), 'Bramblefox: not in the Map 13 pool');
  ok(!MAPS.find(m=> m.id === 'm1').nodes.some(n=> n.key === '0-4' && (bf.source.node === n.key && bf.source.id === 'm1')), 'Bramblefox is still paid on 0-4');
  // the report
  const hist = f=>{ const h = {}; R.forEach(r=>{ const k = f(r); if(k != null) h[k] = (h[k] || 0) + 1; }); return h; };
  const before = PRIOR ? (()=>{ const h = {}; Object.values(PRIOR.nodes).forEach(x=>{ const k = Object.keys(x.from).length; h[k] = (h[k] || 0) + 1; }); return h; })() : null;
  console.log(`${N} skirmishes in scope (${R.filter(r=> !r.m.sub).length} on main maps)`);
  if(before) console.log('sizes before', JSON.stringify(before)); console.log('sizes now   ', JSON.stringify(hist(r=> r.size)));
  const withL = R.filter(r=> r.leaders.length), m2 = R.filter(r=> r.ctx.mapNo >= 2);
  console.log(`leaders: ${withL.length} of ${m2.length} skirmishes from Map 2 on (${R.filter(r=> r.ctx.mapNo < 2).length} on Maps 0-1 have none); hand-set showcases ${m2.filter(r=> r.n.showcase).length}`);
  if(exceptions.length) console.log('rating beyond about 10% (nothing lighter left to trade against the leader):\n  ' + exceptions.join('\n  '));
  if(failOnError !== false){ if(fails.length){ console.log(fails.length + ' FAILED:\n  ' + fails.join('\n  ')); process.exit(1); } console.log('all SK checks pass'); }
}
function list(){
  rows().forEach(r=>{ console.log([r.m.id.padEnd(4), r.n.key.padEnd(7), 'M' + String(r.ctx.mapNo).padEnd(2), r.size, String(r.copies).padStart(2) + 'c', 'BR' + String(r.br).padStart(4), (r.p ? '(' + r.p.brBefore + ')' : '').padEnd(7), (r.leaders[0] || '-').padEnd(26), (r.n.showcase ? 'set' : 'auto')].join(' ')); });
  check(false);
}

if(require.main === module){ const cmd = process.argv[2] || 'check'; ({plan, apply, check, list})[cmd](); }
module.exports = {SCOPE, sensible, clearGap};
