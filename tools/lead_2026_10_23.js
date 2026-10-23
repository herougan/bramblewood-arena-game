#!/usr/bin/env node
// Package LEAD (2026-10-23, owner 01:03 #12: "Elites & above should have leaders. Normal skirmishes past Map 10 should have leaders. (While
// keeping BR roughly - they can use any card as leader btw). Typically the 'boss unit' is the leader. For special bosses - e.g. twin-headed,
// they can have 2 leaders."). arena_app.js's skirmishLeadersOf gives every elite and above its showcase card as its leader (LEADER_KINDS);
// this tool sets the data around it, on Maps 0-24 (main and side maps; not the Tutorial, the endless floors or the Tower):
//   1. BOSS: the fight's boss unit as its showcase where the highest-ranked card is not it (the card the fight is named after);
//      PAIRS: the paired bosses, two leaders each (node.leaders).
//   2. The move: the leader's own copy leaves the deck (a card with 2+ copies; a paired leader's single copy too, unless it is the reward).
//      PG's copy ladder (RARITY_MAX_COPIES) on every deck it touches.
//   3. Candidates that hold the battle rating within +-5% of the fight with no leader. The rating counts a leader twice at the enemy's
//      level (it fights at its printed level), so the BR side alone over-corrects: a BR-only pass moved the DF ant deck's win rate by 14
//      points on average; the move alone (BR +5..+50%) made the fights about 6 points harder. Each candidate edits one copy (or two) at a
//      time, under the ladder, at most 20 copies, the reward cards and the leaders kept, at least 4 different cards:
//        keep    the edit that brings the BR furthest back for the least change in the deck's mean power (Attack + Health/2 + 1.5 a skill);
//        br      the edit that brings the BR furthest back;
//        boss    the leader's other copies leave the deck first, then as keep;
//        level   node.enemyLevel a quarter step lower at a time (the BR reads the nearest whole level) until keep lands in the band;
//        level2  one quarter step lower again.
//   4. tune: the DF ant deck at DF's afforded level (docs/balance/df-2026-10-23.json) plays the fight with no leader and each candidate
//      (400 games each); the candidate nearest the old win rate wins, then the enemy bramble (Health + Shield, which the BR does not read)
//      moves 6% a step, at most 4 steps, while that brings it nearer (within 3 points stops).
//   node tools/lead_2026_10_23.js plan [--save]          steps 1-3 (and saves them to docs/balance/lead-2026-10-23.json)
//   node tools/lead_2026_10_23.js tune [i/k]             step 4 (resumable: docs/balance/lead-2026-10-23-tune.jsonl; LEAD_KEYS=a,b for some)
//   node tools/lead_2026_10_23.js alt                    the far ones: another deck card as the leader (ALT; LEAD_KEYS=a,b for some)
//   node tools/lead_2026_10_23.js apply                  writes the picks into arena_app.js's CONQUEST_MAPS lines
//   node tools/lead_2026_10_23.js check                  every elite+ fight has its leader(s), BR within 5% of the saved "before", the ladder
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G;
const OUT = path.join(ROOT, 'docs/balance/lead-2026-10-23.json'), TUNE_LOG = path.join(ROOT, 'docs/balance/lead-2026-10-23-tune.jsonl');
const TOL = 0.05, MAX_COPIES_TOTAL = 20, MAX_EDITS = 12, MIN_CARDS = 4;
const TUNE = {games: 400, brambleStep: 0.06, brambleSteps: 4, close: 3};
// The DF study's ant deck and its afforded level by map (docs/balance/df-2026-10-23.json, econ.rows.typical antLevel)
const ANT = {'tunnel-ant': 4, 'soldier-ant': 6, 'ant-scout': 6, 'worker-ant': 2, 'forager-ant': 2};
const ANT_LEVEL = {0: 0, 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 3, 12: 3, 13: 4, 14: 4, 15: 4, 16: 8, 17: 8, 18: 8, 19: 8, 20: 8, 21: 8, 22: 8, 23: 8, 24: 8};
// The fights the 5% cannot hold, by a point or two of rounding (call LEAD-2).
const BR_EXCEPT = {'20-R': 'an all-Common deck at its printed level: any leader adds 2 points to a BR of 20 (+10%)',
  '20-A-3': 'an all-Common deck: the BR moves by whole enemy levels, 38 -> 36 or 42 (36 kept, -5.3%)', '1-5': 'a BR of 19: one point is 5.3% (19 -> 20)'};

// The boss unit, where the fight is named after a card of its deck that is not its showcase today.
const BOSS = {
  '3-5': 'golden-eagle-diver', '6-5': 'venomlord-serpent', '7-5': 'hollow-oath-keeper', '8-8': 'stalactite-golem', '10-7': 'riptide-eel',
  '10-9': 'orca-vanguard', '13-6': 'grizzly-vanguard', '16-7': 'alpha-howler', '17-8': 'glacial-ape-king', '18-5': 'obsidian-scorpion',
  '18-7': 'sand-widow', '19-6': 'yeti', '20-5': 'cave-warlord', '20-9': 'ancient-sloth-titan', '20-10': 'cave-warlord', '20-R': 'deep-cave-troll',
  '24-6': 'gilded-swan-knight', '2-A-5': 'poison-dart-croaker', '2-A-6': 'lodge-engineer',
};
// Paired bosses (two leaders). No fight in the data is a twin- or two-headed boss (the Two-Headed Calf is in no enemy deck); these two are a
// named boss with its named second (call LEAD-1).
const PAIRS = {
  '24-8': ['magnate-duck', 'iron-warden'],      // the Magnate and the Iron Warden of 24-6 / 24-7
  '23-8': ['marshal-tuskwell', 'war-elephant'], // the Magnate's marshal and the War Elephant of 23-6 / 23-7
};

const defs = G.getCardDefs();
const mapsInScope = B.MAPS.filter(m=> !m.endless && !m.tower && !m.reserved && m.id !== 'mtut');
function fightsInScope(){
  const out = [];
  for(const m of mapsInScope) for(const n of m.nodes || []){ if(n.deck && G.LEADER_KINDS.includes(G.baseKind(n.kind || 'skirmish'))) out.push({m, n}); }
  return out;
}
const total = d=> Object.values(d).reduce((a, b)=> a + (b || 0), 0);
const cap = id=> G.maxCopiesForRarity((defs[id] || {}).rarity);
const power = d=> (d.attack || 0) + 0.5 * (d.health || 0) + 1.5 * Object.keys(d.effects || {}).length;
const meanPower = dk=>{ let t = 0, c = 0; Object.keys(dk).forEach(id=>{ if(defs[id] && dk[id] > 0){ t += dk[id] * power(defs[id]); c += dk[id]; } }); return c ? t / c : 0; };
const FIELDS = ['deck', 'showcase', 'leaders', 'enemyLevel', 'hqHp', 'shieldOverride'];
// The real node patched for a moment (BR, a sim), then restored.
function withPatch(n, patch, fn){
  const keep = {}; FIELDS.forEach(k=>{ keep[k] = Object.prototype.hasOwnProperty.call(n, k) ? n[k] : undefined; });
  Object.keys(patch).forEach(k=>{ if(patch[k] === undefined) delete n[k]; else n[k] = patch[k]; });
  try{ return fn(n); } finally { FIELDS.forEach(k=>{ if(keep[k] === undefined) delete n[k]; else n[k] = keep[k]; }); }
}
const brWith = (n, patch)=> withPatch(n, patch, x=> G.enemyDeckLevel(x));
const clean = d=>{ const o = {}; Object.keys(d).forEach(id=>{ if(d[id] > 0) o[id] = d[id]; }); return o; };

function planFight(m, n, alt){ // alt: another deck card as the leader ("they can use any card as leader"), the showcase kept
  const key = n.key, rewards = new Set(G.nodeRewardCardIds(m.id, key)), minCards = Math.min(MIN_CARDS, Object.keys(n.deck).length);
  const before = brWith(n, {leaders: []}), notes = [], L0 = Math.round(G.roadEnemyLevelExact(n) * 100) / 100;
  const deck0 = Object.assign({}, n.deck);
  Object.keys(deck0).forEach(id=>{ if(deck0[id] > cap(id)){ notes.push(`${id} ${deck0[id]} -> ${cap(id)} (copy ladder)`); deck0[id] = cap(id); } });
  const pair = PAIRS[key] || null;
  let showcase = n.showcase, leaders;
  if(pair){ leaders = pair.slice(); if(deck0[pair[0]]) showcase = pair[0]; }
  else { if(BOSS[key] && deck0[BOSS[key]]) showcase = BOSS[key]; leaders = alt ? [alt] : withPatch(n, {deck: deck0, showcase}, x=> [G.nodeShowcaseId(x)].filter(Boolean)); }
  // the move
  for(const id of leaders){ if((deck0[id] || 0) >= 2 || (pair && deck0[id] === 1 && !rewards.has(id) && Object.keys(deck0).length > minCards)){ deck0[id]--; if(!deck0[id]) delete deck0[id]; } }
  if(showcase && !deck0[showcase]) showcase = n.showcase; // a showcase must stay in the deck (nodeShowcaseId)
  const P0 = meanPower(n.deck), out = v=> Math.max(0, Math.abs(v / before - 1) - TOL - 1e-9);
  const patchOf = (dk, L)=> ({deck: clean(dk), showcase, leaders: pair || alt ? leaders : undefined, enemyLevel: L == null ? undefined : L});
  const keepOk = (dk)=> Object.keys(clean(dk)).length >= minCards && total(dk) <= MAX_COPIES_TOTAL && [...rewards].every(id=> !n.deck[id] || dk[id] > 0) && Object.keys(dk).every(id=> (dk[id] || 0) <= cap(id))
    && (!showcase || dk[showcase] > 0 || showcase === n.showcase && !n.deck[showcase]);
  // one copy (or two) at a time; score(gain, powerMove) picks the edit
  function greedy(deck, L, mode){
    deck = Object.assign({}, deck); let now = brWith(n, patchOf(deck, L)), guard = 0;
    while(out(now) > 0 && guard++ < MAX_EDITS){
      const singles = [];
      Object.keys(deck).forEach(id=>{ if(!(deck[id] > 0)) return;
        if(deck[id] >= 2 || (!leaders.includes(id) && !rewards.has(id) && id !== showcase)) singles.push({op: -1, id});
        if(deck[id] < cap(id)) singles.push({op: +1, id}); });
      const cand = singles.map(c=> [c]); for(let i = 0; i < singles.length; i++) for(let j = i; j < singles.length; j++){ const a = singles[i], b = singles[j]; if(a.id === b.id && a.op !== b.op) continue; cand.push([a, b]); }
      let best = null;
      for(const cs of cand){ const dk = Object.assign({}, deck); cs.forEach(c=>{ dk[c.id] = (dk[c.id] || 0) + c.op; }); if(cs.some(c=> dk[c.id] < 0) || !keepOk(dk)) continue;
        const v = brWith(n, patchOf(dk, L)), gain = out(now) - out(v); if(gain <= 1e-9) continue;
        const pm = Math.abs(meanPower(dk) / P0 - 1), score = (mode === 'br' ? gain : gain / (pm + 0.01)) / cs.length;
        if(!best || score > best.score) best = {dk, v, score}; }
      if(!best) break; deck = best.dk; now = best.v;
    }
    return {deck: clean(deck), L, br: now};
  }
  const cands = [];
  const add = (name, c)=>{ const sig = JSON.stringify([c.deck, c.L]); if(cands.some(x=> x.sig === sig)) return; cands.push(Object.assign({name, sig, ok: out(c.br) === 0, pct: Math.round((c.br / before - 1) * 1000) / 10, power: Math.round((meanPower(c.deck) / P0 - 1) * 1000) / 10}, c)); };
  add('keep', greedy(deck0, null, 'keep'));
  add('br', greedy(deck0, null, 'br'));
  { const d = Object.assign({}, deck0); leaders.forEach(id=>{ if(d[id] > 1) d[id] = 1; }); add('boss', greedy(d, null, 'keep')); }
  const move1 = !pair && !alt && leaders.length === 1 && deck0[leaders[0]] === 1 && !rewards.has(leaders[0]) && Object.keys(deck0).length > minCards;
  let found = 0, nearest = null;
  for(let k = 1; k <= 12 && found < 2; k++){ const L = Math.round((L0 - 0.25 * k) * 100) / 100; if(L < 0) break;
    if(brWith(n, patchOf(deck0, L)) >= brWith(n, patchOf(deck0, null)) && found === 0) continue; // the level must move the BR
    const c = greedy(deck0, L, 'keep'); if(out(c.br) === 0){ add(found ? 'level2' : 'level', c); found++; } else if(!nearest || out(c.br) < out(nearest.br)) nearest = c; }
  if(!found && nearest) add('level', nearest);
  if(move1){ const d = Object.assign({}, deck0); delete d[leaders[0]]; const sc = showcase; showcase = undefined; // its one copy to the leader slot: an explicit leader
    const keepAlt = alt; alt = leaders[0]; const c = greedy(d, null, 'keep'); alt = keepAlt; showcase = sc; c.leaders = leaders.slice(); add('move1', c); }
  // the BR band first; among those (or, when none holds it, the nearest) the tune picks by win rate
  const inBand = cands.filter(c=> c.ok);
  const pool = inBand.length ? inBand : cands.slice().sort((a, b)=> out(a.br) - out(b.br)).slice(0, 1);
  pool.forEach(c=>{ if(alt){ c.name = 'alt ' + alt + ' ' + c.name; c.leaders = leaders.slice(); } c.net = [...new Set(Object.keys(n.deck).concat(Object.keys(c.deck)))].map(id=> [id, (c.deck[id] || 0) - (n.deck[id] || 0)]).filter(x=> x[1]).map(([id, d])=> `${d > 0 ? '+' : ''}${d} ${id}`); delete c.sig; });
  return {map: G.mapNumberOf(m.id), mapId: m.id, key, kind: n.kind || 'skirmish', name: n.name, side: !!m.sub, leaders, showcase: showcase || null, showcaseWas: n.showcase || null,
    before, levelWas: L0, except: BR_EXCEPT[key] || null, notes, deckWas: Object.assign({}, n.deck), cands: pool, ok: !!inBand.length};
}

function plan(){
  const rows = [];
  for(const {m, n} of fightsInScope()){
    if(Array.isArray(n.leaders) && !PAIRS[n.key]){ rows.push({map: G.mapNumberOf(m.id), mapId: m.id, key: n.key, kind: n.kind, name: n.name, kept: true, leaders: n.leaders.slice(), before: G.enemyDeckLevel(n)}); continue; }
    rows.push(planFight(m, n));
  }
  return rows;
}
const loadSaved = ()=> JSON.parse(fs.readFileSync(OUT, 'utf8'));
const nodeOf = r=> B.byKey(r.mapId, r.key);
const candPatch = (r, c, edit)=> Object.assign({deck: c.deck, showcase: r.showcase || undefined, leaders: c.leaders || (PAIRS[r.key] ? r.leaders : undefined), enemyLevel: c.L == null ? undefined : c.L}, edit || {});
const winOf = (r, n, patch, games)=> withPatch(n, patch, x=>{ G.NODE_MAP_HINT.set(x, r.mapId); const s = G.simulateReferenceFight(r.mapId, x, games, {deck: ANT, level: ANT_LEVEL[r.map]}); return Math.round(s.win * 1000) / 10; });
// The enemy bramble's total (Health + Shield, as the fight shows it, BRAMBLE_SCALE) as a node edit: the Shield moves (shieldOverride is
// stored at full size), below the bramble's own Health the Health (hqHp) with no Shield. The battle rating does not read the bramble.
function brambleEdit(n, patch, T){
  const sc = withPatch(n, Object.assign({}, patch, {shieldOverride: undefined}), x=> G.skirmishCastle(x)); T = Math.max(1, Math.round(T));
  return T >= sc.hp ? {shieldOverride: 2 * (T - sc.hp)} : {hqHp: 2 * T, shieldOverride: 0};
}
function tune(part){
  const saved = loadSaved(), done = {};
  try{ fs.readFileSync(TUNE_LOG, 'utf8').split('\n').filter(Boolean).forEach(l=>{ const o = JSON.parse(l); done[o.mapId + ':' + o.key] = o; }); }catch(e){}
  const only = process.env.LEAD_KEYS ? process.env.LEAD_KEYS.split(',') : null;
  const rows = saved.fights.filter(r=> !r.kept && (!only || only.includes(r.key))).filter((r, i)=> !part || i % part[1] === part[0]);
  for(const r of rows){ if(done[r.mapId + ':' + r.key] && !process.env.LEAD_FORCE) continue; const n = nodeOf(r), t0 = Date.now();
    const base = winOf(r, n, {leaders: []}, TUNE.games), far = t=> Math.abs(t.win - base);
    const tries = r.cands.map((c, i)=> ({cand: i, name: c.name, win: winOf(r, n, candPatch(r, c), TUNE.games)}));
    let best = tries.slice().sort((a, b)=> far(a) - far(b))[0];
    const saturated = (base >= 97 && best.win >= 92) || (base <= 3 && best.win <= 8);
    const layered = Array.isArray(n.shieldOverride) && n.shieldOverride.length > 1;
    if(!saturated && !layered && far(best) > TUNE.close){
      const c = r.cands[best.cand], p = candPatch(r, c), Tb = withPatch(n, p, x=> G.skirmishCastle(x)).total, dir = best.win < base ? -1 : +1, step = Math.max(1, Math.round(Tb * TUNE.brambleStep));
      for(let k = 1; k <= TUNE.brambleSteps; k++){
        const T = Tb + dir * k * step; if(T < 2) break;
        const edit = brambleEdit(n, p, T), t = {cand: best.cand, name: c.name + '+bramble', T0: Tb, T, edit, win: winOf(r, n, Object.assign({}, p, edit), TUNE.games)}; tries.push(t);
        if(far(t) < far(best) - 1e-9) best = t; else break; // no nearer: stop
        if(far(t) <= TUNE.close) break;
      }
    }
    const o = {mapId: r.mapId, key: r.key, base, saturated, layered, tries, pick: best, ms: Date.now() - t0};
    fs.appendFileSync(TUNE_LOG, JSON.stringify(o) + '\n');
    console.log(r.key, 'base', base, '->', tries.map(t=> `${t.name}${t.T ? ' ' + t.T0 + '>' + t.T : ''}:${t.win}`).join(' '), '| pick', best.name, best.win, saturated ? '(saturated)' : '');
  }
}

// The far ones (owner: "they can use any card as leader"): where the boss unit's leader leaves the win rate more than ALT.far points off, each
// other card of the deck is tried as the leader (its candidates as above, 400 games each); one that lands at least ALT.gain points nearer
// replaces the pick (an explicit node.leaders, the boss unit stays the showcase).
const ALT = {far: 8, gain: 4};
function altPass(){
  const saved = loadSaved(), tuned = tunedMap(), only = process.env.LEAD_KEYS ? process.env.LEAD_KEYS.split(',') : null;
  for(const r of saved.fights){ if(r.kept || PAIRS[r.key]) continue; const t = tuned[r.mapId + ':' + r.key]; if(!t) continue;
    if(only ? !only.includes(r.key) : Math.abs(t.pick.win - t.base) <= ALT.far) continue;
    const m = B.MAPS.find(x=> x.id === r.mapId), n = nodeOf(r), far = w=> Math.abs(w - t.base); let best = null; const tries = [];
    for(const id of Object.keys(r.deckWas)){ if(r.leaders.includes(id) || !defs[id]) continue;
      const f = planFight(m, n, id); if(!f.ok) continue;
      for(const c of f.cands){ const w = winOf(r, n, candPatch(r, c), TUNE.games); tries.push({name: c.name, win: w}); if(!best || far(w) < far(best.win)) best = {c, win: w}; } }
    const line = `${r.key} base ${t.base} pick ${t.pick.name} ${t.pick.win} | ` + tries.map(x=> `${x.name}:${x.win}`).join(' ');
    if(best && far(best.win) <= far(t.pick.win) - ALT.gain){
      r.cands.push(best.c); const o = {mapId: r.mapId, key: r.key, base: t.base, alt: true, tries: t.tries.concat(tries), pick: {cand: r.cands.length - 1, name: best.c.name, win: best.win}, was: t.pick};
      fs.appendFileSync(TUNE_LOG, JSON.stringify(o) + '\n'); console.log(line, '=> ', best.c.name, best.win);
    } else console.log(line, '=> kept');
  }
  fs.writeFileSync(OUT, JSON.stringify(saved, null, 1) + '\n');
}
function tunedMap(){ const t = {}; try{ fs.readFileSync(TUNE_LOG, 'utf8').split('\n').filter(Boolean).forEach(l=>{ const o = JSON.parse(l); t[o.mapId + ':' + o.key] = o; }); }catch(e){} return t; }
// Hand fixes on a pick: Map 1's decks hold 20 cards (EB), so 1-5 gets a Field Mouse back (BR 19, the ant deck 70.1% against 70.4% before,
// 1000 games each).
const FIXUPS = {'mf:1-5': {'field-mouse': +1}};
function pickOf(r, tuned){ const t = tuned[r.mapId + ':' + r.key]; let c = r.cands[t && t.pick ? t.pick.cand : 0]; const fx = FIXUPS[r.mapId + ':' + r.key];
  if(fx){ const deck = Object.assign({}, c.deck); Object.keys(fx).forEach(id=>{ deck[id] = (deck[id] || 0) + fx[id]; }); c = Object.assign({}, c, {deck, fixup: fx}); }
  return {c, edit: t && t.pick && t.pick.edit || null, t}; }
function writeLines(rows, tuned){
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const r of rows){ if(r.kept) continue;
    const re = new RegExp(`(\\{ ?key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', r.key); continue; }
    const {c, edit} = pickOf(r, tuned); let line = mm[1]; const add = [];
    line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(c.deck));
    if(r.showcase && r.showcase !== r.showcaseWas){ if(/showcase:"[^"]*"/.test(line)) line = line.replace(/showcase:"[^"]*"/, `showcase:${JSON.stringify(r.showcase)}`); else add.push(`showcase:${JSON.stringify(r.showcase)}`); }
    if(c.leaders || PAIRS[r.key]) add.push('leaders:' + JSON.stringify(c.leaders || r.leaders));
    if(c.L != null){ if(/enemyLevel:[\d.]+/.test(line)) line = line.replace(/enemyLevel:[\d.]+/, 'enemyLevel:' + c.L); else add.push('enemyLevel:' + c.L); }
    if(edit) for(const f of ['hqHp', 'shieldOverride']){ if(edit[f] == null) continue; const re2 = new RegExp(f + ':\\d+'); if(re2.test(line)) line = line.replace(re2, f + ':' + edit[f]); else add.unshift(f + ':' + edit[f]); }
    line = line.replace(/(deck:\{[^}]*\})/, `$1${add.length ? ', ' + add.join(', ') : ''} /* 2026-10-23 (LEAD): leader${PAIRS[r.key] ? 's' : ''}, BR and win rate kept */`);
    if(line !== mm[1]){ s = s.replace(mm[1], line); n++; }
  }
  fs.writeFileSync(APP, s); return n;
}

function check(){
  const saved = loadSaved(), by = {}; saved.fights.forEach(f=>{ by[f.mapId + ':' + f.key] = f; });
  let bad = 0, n = 0; const say = (...a)=>{ bad++; console.log('FAIL', ...a); };
  for(const {m, n: x} of fightsInScope()){ n++;
    const L = G.skirmishLeadersOf(x, m.id); if(!L.length) say(x.key, 'no leader');
    if(PAIRS[x.key] && L.length !== 2) say(x.key, 'paired boss without 2 leaders');
    const f = by[m.id + ':' + x.key]; if(!f){ say(x.key, 'not in the saved plan'); continue; }
    if(f.kept) continue;
    const v = G.enemyDeckLevel(x); if(Math.abs(v / f.before - 1) > TOL + 1e-9 && !BR_EXCEPT[x.key]) say(x.key, 'BR', f.before, '->', v);
    Object.keys(x.deck).forEach(id=>{ if(x.deck[id] > cap(id)) say(x.key, id, 'x' + x.deck[id], 'over the copy ladder', cap(id)); });
  }
  console.log(bad ? bad + ' failures' : `ok: ${n} fights (elite and above, Maps 0-24) lead; BR within ${TOL * 100}% (except ${Object.keys(BR_EXCEPT).join(', ')}); copy ladder`);
  process.exit(bad ? 1 : 0);
}
// The report: before / after BR and win rate per fight, from the saved plan and the tune log
function report(){
  const saved = loadSaved(), tuned = tunedMap(), rows = [];
  for(const r of saved.fights){ if(r.kept){ rows.push({key: r.key, kept: true}); continue; }
    const {c, edit, t} = pickOf(r, tuned), n = nodeOf(r);
    const brAfter = brWith(n, candPatch(r, c, edit));
    const net = [...new Set(Object.keys(r.deckWas).concat(Object.keys(c.deck)))].map(id=> [id, (c.deck[id] || 0) - (r.deckWas[id] || 0)]).filter(x=> x[1]).map(([id, d])=> `${d > 0 ? '+' : ''}${d} ${id}`);
    rows.push({map: r.map, key: r.key, kind: r.kind, leaders: c.leaders || r.leaders, before: r.before, after: brAfter, pct: Math.round((brAfter / r.before - 1) * 1000) / 10,
      base: t ? t.base : null, win: t ? t.pick.win : null, d: t ? Math.round((t.pick.win - t.base) * 10) / 10 : null, how: t ? t.pick.name : c.name, net, L: c.L, levelWas: r.levelWas, bramble: edit ? [t.pick.T0, t.pick.T] : null, fixup: c.fixup || null,
      showcase: r.showcase || null});
  }
  return rows;
}

const cmd = process.argv[2] || 'plan';
if(cmd === 'check') check();
else if(cmd === 'alt') altPass();
else if(cmd === 'replan'){ const saved = loadSaved(), keys = process.argv.slice(3); for(const r of saved.fights){ if(!keys.includes(r.key)) continue; const m = B.MAPS.find(x=> x.id === r.mapId); const f = planFight(m, nodeOf(r)); Object.assign(r, f); console.log(r.key, f.cands.map(c=> `${c.name} ${c.br} (${c.pct}%)`).join(' · ')); } fs.writeFileSync(OUT, JSON.stringify(saved, null, 1) + '\n'); }
else if(cmd === 'tune'){ const p = (process.argv.find(a=> /^\d+\/\d+$/.test(a)) || '').split('/').map(Number); tune(p.length === 2 ? p : null); }
else if(cmd === 'apply'){ const saved = loadSaved(); console.log('lines written:', writeLines(saved.fights, tunedMap())); }
else if(cmd === 'report'){ const rows = report(); rows.forEach(x=> console.log(x.kept ? `${x.key} kept` : `${String(x.map).padStart(2)} ${x.key.padEnd(8)} ${x.kind.padEnd(9)} BR ${x.before} -> ${x.after} (${x.pct > 0 ? '+' : ''}${x.pct}%) win ${x.base} -> ${x.win} (${x.d > 0 ? '+' : ''}${x.d}) ${x.how}${x.L != null ? ' Lv ' + x.levelWas + '->' + x.L : ''}${x.bramble ? ' bramble ' + x.bramble.join('->') : ''} | ${x.leaders.join('+')} | ${(x.net || []).join(', ')}`));
  if(process.argv.includes('--save')){ const s = loadSaved(); s.result = rows; fs.writeFileSync(OUT, JSON.stringify(s, null, 1) + '\n'); } }
else {
  const rows = plan();
  for(const r of rows) console.log(r.kept ? `${r.key} kept (${r.leaders.join('+')})` : `${String(r.map).padStart(2)} ${r.key.padEnd(8)} ${String(r.kind).padEnd(9)} ${r.ok ? 'ok ' : 'OUT'} BR ${r.before} lead ${r.leaders.join('+')} | ` + r.cands.map(c=> `${c.name} ${c.br} (${c.pct > 0 ? '+' : ''}${c.pct}%, power ${c.power > 0 ? '+' : ''}${c.power}%${c.L != null ? ', Lv ' + r.levelWas + '->' + c.L : ''})`).join(' · '));
  if(process.argv.includes('--save')) fs.writeFileSync(OUT, JSON.stringify({_about: 'Package LEAD (2026-10-23, owner 01:03 #12): a leader for every elite and above on Maps 0-24, the battle rating kept within 5% and the DF ant deck\'s win rate as near the old one as the candidates allow (tools/lead_2026_10_23.js; the tune runs are in lead-2026-10-23-tune.jsonl; "result" is the applied pick per fight). before = BR with no leader (the build before LEAD).',
    generated: '2026-10-23', tolerance: TOL, tune: TUNE, boss: BOSS, pairs: PAIRS, brExcept: BR_EXCEPT, fights: rows}, null, 1) + '\n');
  console.log(rows.length, 'fights;', rows.filter(r=> !r.kept && !r.ok).length, 'with no candidate inside 5%');
}
