#!/usr/bin/env node
// 2026-11-18 (package LVL10, owner 21:11 "define the lvl 10 form ... 25% only stat increase, 25% 10/90, 25% 25/75, 25% 50/50"; 21:22 "If it has
// more than 1 skill, DEFINITELY make the other skills unlock at later levels"): each card's growth from Level 1 to 10 in canonical/cards.json.
//   levelBonus {"L": {attack, health, skills}}: stats at Level L = base-level stats + the deltas of levels k <= L; skills = new values (absolute,
//   the stored form). levelSkills {"L": {key: value}}: a skill that arrives at L (bramblewood-budget.js levelBonusAt / levelEffectsAt read both).
// Per card (creatures with stats that level to 10; not tokens, castles, equipment, spells, Materia, hazards, world bosses, eggs):
//   1. Skill unlocks (base Level 1 cards, two or more priced non-light skills, no levelSkills yet, not owner-edited): the core skill stays (the
//      one the card's name names, else the priciest); the others leave Level 1 and arrive later, cheapest first, each at the first free
//      level from 2 whose growth covers it. The Level 1 stats re-fit to the full card's fill (inside 85-100%) for the skills that left.
//   2. Level 10 form: x1 = fill x N(10), fill = the full card's Level 1 fill held inside 85-100%. Growth G = that - x1(Level 1).
//   3. Style (skill share of G): A 0 / B 10% / C 25% / D 50%. A card with unlocks takes the style its unlocks' share is nearest to; a card
//      with no growable number and no unlock is A; the rest by the skill share of their Level 1 budget fill each style up to a quarter
//      of the in-play cards (A, then B, C, D).
//   4. Skill growth beyond the unlocks: +1 steps of the priciest growable skill (a second one when it no longer fits), at the first of
//      Levels 4 / 7 / 10 whose share of the growth covers it. Stats: the rest, spread over Levels 2-10 in the shape of today's curve,
//      Attack following the card's own Attack : Health.
//   5. Both caps at N(L) on every level; a step that breaks one moves a level later.
// Usage: node tools/lvl10/gen_2026_11_18.js [--dry] [--force] [--card <id>]
//   default: only cards without levelBonus (owner edits kept; a re-run changes nothing); --force: every card; --dry: writes nothing.
// Report: docs/balance/lvl10-2026-11-18.json (styles, realized shares, fill by level, unlocks, movers against today's curve).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SPL = BB.SPL;
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const T = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(TABLE), TABLE_SK = {}; TABLE.skills.forEach(s=> TABLE_SK[s.id] = s);
const FILE = path.join(ROOT, 'canonical', 'cards.json');
const args = process.argv.slice(2), DRY = args.includes('--dry'), FORCE = args.includes('--force');
const ONLY = args.includes('--card') ? args[args.indexOf('--card') + 1] : null;
const SHARE = {A: 0, B: 0.1, C: 0.25, D: 0.5}, MILESTONES = [4, 7, 10], TOP = 10, MIN_STEP = 0.3, FILL_LO = 0.85, FILL_HI = 1;
// owner-edited cards keep their skills where they are (21:22 #5): a folded live edit in the note, or today's live rows (coordinator 21:30)
const OWNER_RE = /owner'?s? (live )?edit|owner live edit/i, OWNER_1118 = ['soldier-ant', 'duck-paddler', 'bee-forager', 'bee-sentry', 'house-cat', 'hedgerow-shrew', 'field-vole'];
const r2 = v=> Math.round(v * 100) / 100, clone = o=> JSON.parse(JSON.stringify(o));
const isOwner = d=> OWNER_1118.includes(d.id) || OWNER_RE.test(d.creatorNote || '');

function baseLevel(d){ // arena_app.js cardBaseLevel, inline
  if(d.kind === 'baby' && !d.token) return 0; if(d.baseLevel != null && Number.isFinite(Number(d.baseLevel))) return Number(d.baseLevel);
  const qs = d.source && (d.source.kind === 'quest' || d.source.kind === 'errand' || d.source.kind === 'base');
  if(d.faction || d.id === 'wandering-traveller') return 1; if(['bee-knight', 'forager-ant'].includes(d.id)) return 1;
  return (d.basic || d.rarity === 'starter' || d.tutorial || d.quest || qs) ? 0 : 1; }
function eligible(d){
  return !d.token && !d.test && !d.pool && !d.hallOfFame && !d.worldBoss && !d.hazard && !d.field && !d.equip && !d.spell && !d.cardType && !d.eggKind && !d.hatchInto
    && d.id !== 'hero' && !d.isCastle && !(d.archetypes || []).includes('Castle') && typeof d.attack === 'number' && typeof d.health === 'number' && (d.attack > 0 || d.health > 0); }
const at = (d, L, lb)=> T.budgetAt(Object.assign({}, d, {levelBonus: lb}), L, baseLevel(d));
const fillOf = (d, L, lb)=>{ const b = at(d, L, lb); return {x1: b.x1, x2: b.x2, N: b.N, N2: b.N2, fill: b.N > 0 ? b.x1 / b.N : 0}; };

// a skill value one step up, or null: a whole number >= 1, {v: whole number >= 1}, or true on a skill priced by its number
function bumped(k, v){
  if(k === 'triggers' || (BB.PARAMS || []).includes(k)) return null;
  if(typeof v === 'number') return v >= 1 && Number.isInteger(v) ? v + 1 : null;
  if(v && typeof v === 'object' && !Array.isArray(v)) return typeof v.v === 'number' && v.v >= 1 && Number.isInteger(v.v) ? Object.assign({}, v, {v: v.v + 1}) : null;
  if(v === true){ const s = TABLE_SK[k]; return s && s.scale === 'n' && +s.value > 0 && !(+s.pow < 0) ? 2 : null; }
  return null; }
// a stored effects key and the old flat parameter keys that belong to it (deliveryRes with delivery ...)
const keysOfUnit = (fx, k)=> [k, ...Object.keys(fx).filter(x=> x !== k && SPL && SPL.rootOf && SPL.rootOf(x) === k)];
function without(d, keys){ const fx = Object.assign({}, d.effects || {}); keys.forEach(k=>{ delete fx[k]; }); return Object.assign({}, d, {effects: fx}); }
// health-point price of +1 Health and the Attack weight at level 1
function statCosts(d){ const x = at(d, 1, null).x1, cH = Math.max(0.01, at(Object.assign({}, d, {health: d.health + 1}), 1, null).x1 - x), cA = at(Object.assign({}, d, {attack: d.attack + 1}), 1, null).x1 - x;
  return {cH, aw: cA > 0.01 ? Math.max(1, Math.round(cA / cH)) : 0}; }
// pp health points split toward the card's Attack : Health (a0 / h0), given what was added so far (A attack, P points)
function split(pp, a0, h0, aw, A, P){ if(!aw || a0 <= 0) return {da: 0, dh: pp}; const w0 = Math.max(1, aw * a0 + h0), At = Math.round(a0 * (w0 + P + pp) / w0) - a0;
  const da = Math.max(0, Math.min(Math.floor(pp / aw), At - A)); return {da, dh: pp - aw * da}; }

// 1. unlocks: which skills leave Level 1, and the Level 1 re-fit
function stagger(d, fillT){
  const fx = d.effects || {}, b0 = at(d, 1, null), LIGHT = BB.TWO_SKILL_LIGHT || [];
  const units = Object.keys(fx).filter(k=> fx[k] != null && fx[k] !== false && fx[k] !== 0 && !(BB.PARAMS || []).includes(k) && !LIGHT.includes(k) && !(SPL && SPL.rootOf && SPL.rootOf(k) !== k && fx[SPL.rootOf(k)] != null))
    .map(k=>{ const keys = keysOfUnit(fx, k); return {k, keys, price: r2(b0.x1 - at(without(d, keys), 1, null).x1)}; }).filter(u=> u.price > MIN_STEP);
  if(units.length < 2) return null;
  const words = String(d.id).split('-').filter(w=> w.length >= 4), named = units.find(u=> words.some(w=> w.slice(0, 5) === u.k.toLowerCase().slice(0, 5)));
  const core = named || units.slice().sort((x, y)=> y.price - x.price || (x.k < y.k ? -1 : 1))[0];
  const moves = units.filter(u=> u !== core).sort((x, y)=> x.price - y.price || (x.k < y.k ? -1 : 1));
  let c = without(d, moves.flatMap(u=> u.keys));
  const target = fillT * at(c, 1, null).N, {cH, aw} = statCosts(c), P = Math.max(0, Math.floor((target - at(c, 1, null).x1) / cH + 1e-9)), s = split(P, c.attack, c.health, aw, 0, 0);
  c = Object.assign({}, c, {attack: c.attack + s.da, health: c.health + s.dh});
  for(let g = 0; g < 40; g++){ const b = at(c, 1, null); if(b.x1 <= Math.max(b.N, b0.x1 * b.N / b0.N) + 1e-9 && b.x2 <= Math.max(b.N2, b0.x2) + 1e-9) break; if(c.health > d.health) c.health--; else if(c.attack > d.attack) c.attack--; else break; }
  return {core: core.k, moves, card: c}; }

function analyse(d0){
  const d = Object.assign({}, d0, {levelBonus: undefined}), base = baseLevel(d), lb = {};
  const old = BB.forgeCurve(Object.assign({}, d, {obtainMap: T.obtainMapOf(d)}), base, 11).rows;
  if(base === 0 && old[1]){ const da = (old[1].attack || 0) - d.attack, dh = (old[1].health || 0) - d.health; if(da || dh) lb[1] = Object.assign({}, da ? {attack: da} : {}, dh ? {health: dh} : {}); }
  const b1full = at(d, 1, lb), fill1 = b1full.N > 0 ? b1full.x1 / b1full.N : 1, fill = Math.min(FILL_HI, Math.max(FILL_LO, fill1));
  const owner = isOwner(d), st = base === 1 && !d.levelSkills && !owner ? stagger(d, fill) : null, card = st ? st.card : d;
  const b1 = at(card, 1, lb), Ns = {}; for(let L = 1; L <= TOP; L++) Ns[L] = at(card, L, lb).N;
  const G = L=> fill * Ns[L] - b1.x1, G10 = G(TOP);
  const f10 = T.formAt(Object.assign({}, card, {levelBonus: lb}), TOP, base), x10 = at(card, TOP, lb).x1, cands = [];
  Object.keys(card.effects || {}).forEach(k=>{ const nv = bumped(k, card.effects[k]); if(nv == null) return;
    const step = at(Object.assign({}, card, {effects: Object.assign({}, card.effects, {[k]: nv})}), TOP, lb).x1 - x10;
    if(step >= MIN_STEP){ const part = (b1.parts || []).filter(p=> p[1] === k).reduce((t, p)=> t + (+p[2] || 0), 0); cands.push({k, step: r2(step), part}); } });
  cands.sort((a, b)=> b.part - a.part || a.step - b.step || (a.k < b.k ? -1 : 1));
  // unlock levels: cheapest first, each at the first free level from 2 whose growth covers the unlocks so far
  const unlocks = []; let cum = 0, last = 1;
  (st ? st.moves : []).forEach(u=>{ cum += u.price; let L = last + 1; while(L < TOP && G(L) + 1e-9 < cum) L++; L = Math.min(TOP, L); unlocks.push({k: u.k, keys: u.keys, price: u.price, L}); last = L; });
  const oldPts = {}; let acc = 0; for(let L = 2; L <= TOP; L++){ acc += (old[L] && old[L].points) || 0; oldPts[L] = acc; }
  const score = b1full.x1 > 0 ? (b1full.f || 1) * b1full.S / b1full.x1 : 0, u = G10 > 0 ? cum / G10 : 0;
  void f10;
  return {d, card, base, lb, old, b1, fill1, fill, Ns, G10, cands, score, oldPts, owner, stagger: st, unlocks, unlockShare: r2(u)};
}

function realize(a, style){
  const s = SHARE[style], G10 = Math.max(0, a.G10), lb = clone(a.lb);
  // the card with its unlocks in levelSkills (the moved keys leave effects; one level each)
  let card = a.card;
  if(a.unlocks.length){ const ls = Object.assign({}, card.levelSkills || {}); a.unlocks.forEach(u=>{ const o = ls[u.L] = Object.assign({}, ls[u.L] || {}); u.keys.forEach(k=>{ o[k] = a.d.effects[k]; }); }); card = Object.assign({}, card, {levelSkills: ls}); }
  const unlockCost = a.unlocks.reduce((t, u)=> t + u.price, 0), K = Math.max(0, s * G10 - unlockCost);
  // skill steps, priced at Level 10 one after another
  const bumps = []; let spent = 0;
  if(K > 0 && a.cands.length){
    const fx = Object.assign({}, card.effects); const used = [];
    const stepOf = k=>{ const nv = bumped(k, fx[k]); if(nv == null) return null; const p0 = at(Object.assign({}, card, {effects: fx}), TOP, lb).x1;
      return {nv, step: at(Object.assign({}, card, {effects: Object.assign({}, fx, {[k]: nv})}), TOP, lb).x1 - p0}; };
    for(let guard = 0; guard < 12; guard++){ let took = false;
      for(const c of a.cands){ if(used.length >= 2 && !used.includes(c.k)) continue; const st = stepOf(c.k); if(!st || st.step < MIN_STEP) continue;
        if(spent + st.step <= K + 0.5 * st.step){ fx[c.k] = st.nv; spent += st.step; bumps.push({k: c.k, v: st.nv, step: st.step}); if(!used.includes(c.k)) used.push(c.k); took = true; break; } }
      if(!took) break; }
    if(!bumps.length && !a.unlocks.length){ const c = a.cands.slice().sort((x, y)=> x.step - y.step)[0], st = stepOf(c.k); // one step even past the share, up to 60% of the growth
      if(st && st.step <= 0.6 * G10){ spent = st.step; bumps.push({k: c.k, v: st.nv, step: st.step}); } }
  }
  const wN = L=> (a.Ns[L] - a.Ns[1]) / Math.max(1e-9, a.Ns[TOP] - a.Ns[1]);
  const where = {}; let cum = 0;
  bumps.forEach(b=>{ cum += b.step; let L = MILESTONES.find(M=> cum <= spent * wN(M) + 0.5 * b.step + 1e-9) || TOP; while(where[L] && where[L].k !== b.k && L < TOP) L++; where[L] = {k: b.k, v: b.v}; });
  Object.keys(where).map(Number).forEach(L=>{ lb[L] = Object.assign(lb[L] || {}, {skills: {[where[L].k]: where[L].v}}); });
  // stats: the rest of the growth on today's curve's shape
  const f1 = T.formAt(Object.assign({}, card, {levelBonus: lb}), 1, a.base), {cH, aw} = statCosts(Object.assign({}, f1, {levelSkills: undefined}));
  const P10 = Math.max(0, Math.floor((G10 - unlockCost - spent) / cH + 0.5)), w = L=> a.oldPts[TOP] > 0 ? a.oldPts[L] / a.oldPts[TOP] : wN(L);
  let A = 0, P = 0;
  for(let L = 2; L <= TOP; L++){ const want = Math.round(P10 * w(L)), pp = want - P; if(pp <= 0) continue;
    const sp = split(pp, f1.attack, f1.health, aw, A, P); A += sp.da; P = want;
    const o = lb[L] || {}; if(sp.da) o.attack = (o.attack || 0) + sp.da; if(sp.dh) o.health = (o.health || 0) + sp.dh; lb[L] = o; }
  // both caps on every level (never worse than the card's Level 1 use): a step that breaks one moves a level later, at Level 10 it goes
  const f1b = fillOf(card, 1, lb), cap1 = r=> Math.max(r.N, r.N * f1b.fill), cap2 = r=> Math.max(r.N2, r.N2 * (f1b.N2 > 0 ? f1b.x2 / f1b.N2 : 0));
  for(let guard = 0; guard < 120; guard++){
    let bad = null; for(let L = 2; L <= TOP; L++){ const r = fillOf(card, L, lb); if(r.x1 > cap1(r) + 1e-9 || r.x2 > cap2(r) + 1e-9){ bad = L; break; } }
    if(bad == null) break; const o = lb[bad] = lb[bad] || {};
    const move = key=>{ o[key]--; if(!o[key]) delete o[key]; if(bad < TOP){ const nx = lb[bad + 1] = lb[bad + 1] || {}; nx[key] = (nx[key] || 0) + 1; } };
    const lsAt = card.levelSkills && card.levelSkills[bad], ul = a.unlocks.find(u=> u.L === bad);
    if(ul && bad < TOP && !(card.levelSkills[bad + 1])){ const ls = Object.assign({}, card.levelSkills); ls[bad + 1] = ls[bad]; delete ls[bad]; card = Object.assign({}, card, {levelSkills: ls}); ul.L = bad + 1; }
    else if(o.skills && bad < TOP && !(lb[bad + 1] && lb[bad + 1].skills)){ lb[bad + 1] = Object.assign(lb[bad + 1] || {}, {skills: o.skills}); delete o.skills; }
    else if(o.health) move('health'); else if(o.attack) move('attack');
    else if(o.skills && bad === TOP) delete o.skills;
    else { let L = bad; while(L > 1 && !(lb[L] && (lb[L].health || lb[L].attack))) L--; if(L <= 1) break; const q = lb[L]; if(q.health) q.health--; else q.attack--; if(!q.health) delete q.health; if(!q.attack) delete q.attack; }
    void lsAt; }
  const out = {}; Object.keys(lb).map(Number).sort((x, y)=> x - y).forEach(L=>{ const o = lb[L] || {}, c = {}; if(o.attack) c.attack = o.attack; if(o.health) c.health = o.health; if(o.skills) c.skills = o.skills; if(Object.keys(c).length) out[String(L)] = c; });
  const rows = {}; for(let L = 1; L <= TOP; L++) rows[L] = fillOf(card, L, out);
  const growth = rows[TOP].x1 - rows[1].x1;
  return {card, levelBonus: out, spent: r2(spent + unlockCost), share: growth > 0 ? r2((spent + unlockCost) / growth) : 0, rows};
}

function assignStyles(an){
  const live = a=> !a.d.unattainable && !a.d.awaitingSource, inPlay = an.filter(live), quarter = Math.round(inPlay.length / 4);
  const forced = a=> a.unlocks.length ? (a.unlockShare <= 0.175 ? 'B' : a.unlockShare <= 0.375 ? 'C' : 'D') : null;
  const ranked = inPlay.filter(a=> !forced(a) && a.cands.length).sort((x, y)=> x.score - y.score || (x.d.id < y.d.id ? -1 : 1));
  const n = {A: inPlay.filter(a=> !forced(a) && !a.cands.length).length, B: 0, C: 0, D: 0}; inPlay.forEach(a=>{ const f = forced(a); if(f) n[f]++; });
  const style = new Map(); let i = 0;
  while(i < ranked.length && n.A < quarter){ style.set(ranked[i], 'A'); n.A++; i++; }
  const third = (inPlay.length - n.A) / 3; // A holds every card with nothing to grow, so B, C and D share the rest evenly
  ['B', 'C'].forEach(s=>{ while(i < ranked.length && n[s] < third - 0.5){ style.set(ranked[i], s); n[s]++; i++; } });
  for(; i < ranked.length; i++) style.set(ranked[i], 'D');
  const top = s=>{ const l = ranked.filter(a=> style.get(a) === s); return l.length ? l[l.length - 1].score : -Infinity; };
  const tA = top('A'), tB = top('B'), tC = top('C');
  return a=> forced(a) || (!a.cands.length ? 'A' : style.get(a) || (a.score <= tA ? 'A' : a.score <= tB ? 'B' : a.score <= tC ? 'C' : 'D'));
}

function main(){
  const cards = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const pick = c=> eligible(c) && (!ONLY || c.id === ONLY) && (FORCE || ONLY || !c.levelBonus);
  const an = cards.filter(pick).map(analyse);
  // the styles rank against every eligible card in play, so one card or a re-run gets the style it would get in the full run
  const all = ONLY || !FORCE ? cards.filter(c=> eligible(c)).map(c=> an.find(a=> a.d.id === c.id) || analyse(c)) : an;
  const styleOf = assignStyles(all);
  const res = an.map(a=>{ const st = styleOf(a); return Object.assign({a, style: st}, realize(a, st)); });
  const live = r=> !r.a.d.unattainable && !r.a.d.awaitingSource;
  const cnt = f=>{ const o = {A: 0, B: 0, C: 0, D: 0}; res.forEach(r=>{ if(f(r)) o[r.style]++; }); return o; };
  const share = {}; ['A', 'B', 'C', 'D'].forEach(s=>{ const l = res.filter(r=> r.style === s && live(r)); share[s] = l.length ? r2(l.reduce((t, r)=> t + r.share, 0) / l.length) : 0; });
  const fills = {}; for(let L = 1; L <= TOP; L++){ const v = res.filter(live).map(r=> r.rows[L].fill); if(v.length) fills[L] = {mean: r2(v.reduce((t, x)=> t + x, 0) / v.length), min: r2(Math.min(...v)), max: r2(Math.max(...v)), over: v.filter(x=> x > 1 + 1e-9).length}; }
  const movers = [];
  res.filter(live).forEach(r=>{ const d = r.a.d, c = r.card, old = r.a.old; for(let L = 2; L <= TOP; L++){ const b = BB.levelBonusAt(Object.assign({}, c, {levelBonus: r.levelBonus}), L, r.a.base) || {attack: 0, health: 0};
    const na = c.attack + b.attack, nh = c.health + b.health, oa = old[L] ? old[L].attack : d.attack, oh = old[L] ? old[L].health : d.health; movers.push({id: d.id, style: r.style, L, d: 3 * (na - oa) + nh - oh, was: oa + '/' + oh, now: na + '/' + nh}); } });
  const meanMove = {}; for(let L = 2; L <= TOP; L++){ const v = movers.filter(m=> m.L === L).map(m=> m.d); meanMove[L] = v.length ? r2(v.reduce((t, x)=> t + x, 0) / v.length) : 0; }
  const unlocks = res.filter(r=> r.a.unlocks.length).map(r=> ({id: r.a.d.id, style: r.style, core: r.a.stagger.core, unlocks: r.a.unlocks.map(u=> u.k + '@' + u.L).join(' '), level1: r.a.d.attack + '/' + r.a.d.health + ' -> ' + r.card.attack + '/' + r.card.health, live: live(r)}));
  const ownerKept = res.filter(r=> r.a.owner && r.a.base === 1 && !r.a.d.levelSkills && (BB.abilitiesOf(r.a.d.effects || {}).filter(k=> !(BB.TWO_SKILL_LIGHT || []).includes(k)).length >= 2)).map(r=> r.a.d.id);
  const ul = unlocks.filter(u=> u.live), lvHist = {}; ul.forEach(u=> u.unlocks.split(' ').forEach(x=>{ const L = x.split('@')[1]; lvHist[L] = (lvHist[L] || 0) + 1; }));
  const report = {generated: '2026-11-18', package: 'LVL10', cards: res.length, styles: {all: cnt(()=> true), inPlay: cnt(live)}, realizedSkillShare: share, fillByLevel: fills,
    meanStatPointMoveByLevel: meanMove, biggestMoversL10: movers.filter(m=> m.L === TOP).sort((x, y)=> Math.abs(y.d) - Math.abs(x.d)).slice(0, 15),
    unlockCards: {all: unlocks.length, inPlay: ul.length, byLevel: lvHist}, unlocks, ownerMultiSkillKept: ownerKept};
  if(ONLY){ const r = res[0]; if(r) console.log(r.style, JSON.stringify({attack: r.card.attack, health: r.card.health, levelSkills: r.card.levelSkills, levelBonus: r.levelBonus}), Object.keys(r.rows).map(L=> L + ':' + r2(r.rows[L].fill)).join(' ')); }
  else console.log(JSON.stringify(Object.assign({}, report, {unlocks: undefined, ownerMultiSkillKept: ownerKept.length}), null, 1));
  if(process.env.LVL10_DUMP) fs.writeFileSync(process.env.LVL10_DUMP, JSON.stringify(report, null, 1));
  if(DRY) return;
  const by = new Map(res.map(r=> [r.a.d.id, r]));
  cards.forEach(c=>{ const r = by.get(c.id); if(!r) return;
    if(r.a.unlocks.length){ const was = c.attack + '/' + c.health; c.attack = r.card.attack; c.health = r.card.health; c.effects = r.card.effects; c.levelSkills = r.card.levelSkills;
      c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-11-18 LVL10 (owner 21:22): ${r.a.unlocks.map(u=> u.k + ' from Level ' + u.L).join(', ')}; Level 1 re-fit ${was} -> ${c.attack}/${c.health}.`; }
    if(Object.keys(r.levelBonus).length) c.levelBonus = r.levelBonus; else delete c.levelBonus; });
  fs.writeFileSync(FILE, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n'); // the file's own escaping
  if(!ONLY && res.length) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'lvl10-2026-11-18.json'), JSON.stringify(report, null, 1) + '\n');
}
if(require.main === module) main();
module.exports = {baseLevel, eligible, bumped, analyse, realize, isOwner};
