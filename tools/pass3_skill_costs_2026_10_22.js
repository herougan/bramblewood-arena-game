#!/usr/bin/env node
// Skill costs pass III proposal (2026-10-22): after the owner's pass I prices and Claude's pass II caps, 130 band cards have no legal
// line under the two caps. This works out which prices push them out, what a few price cuts would free, and dry-runs the re-fit of every
// card under the proposed prices. Read-only: canonical/skill-costs.json and canonical/cards.json are never written; the proposed prices
// are loaded into an in-memory copy of the table.
//   node tools/pass3_skill_costs_2026_10_22.js analyse [proposal.json]   the no-fit cards, why, and what each single cut would free
//   node tools/pass3_skill_costs_2026_10_22.js refit [proposal.json]     dry-run re-fit of every card (tools/refit_pass_2026_10_21.js's rule)
//   node tools/pass3_skill_costs_2026_10_22.js fragile [proposal.json]   the Fragile cards' lines with the -8, without it, without the x0.75
//   node tools/pass3_skill_costs_2026_10_22.js json [proposal.json]      everything above as JSON on stdout
//   node tools/pass3_skill_costs_2026_10_22.js report docs/balance/pass-3-skill-costs-2026-10-22.json   -> docs/balance/pass-3-dryrun-2026-10-22.json
// proposal.json: {rows: [{kind, id, before, proposed, value}]} or a bare array (docs/balance/pass-3-skill-costs-2026-10-22.json); each row's
// `value` is its `proposed` price, so tools/hub/apply_skill_costs.js can take the file as it is.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js');
const KIND = {skill: 'skills', trigger: 'triggers', action: 'actions', modifier: 'modifiers'};
const BASE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const r2 = v=> Math.round(v * 100) / 100;
const clone = o=> JSON.parse(JSON.stringify(o));

// a copy of the table with some prices changed: rows [{kind, id, proposed | value}]
function tableWith(rows, extra){ const t = clone(BASE); (rows || []).forEach(r=>{ const e = (t[KIND[r.kind]] || []).find(x=> x.id === r.id);
  if(!e) throw new Error('not in the table: ' + r.kind + ':' + r.id); e.value = r.proposed != null ? r.proposed : r.value; });
  if(extra) extra(t); return t; }

// The band cards the re-fit looks at (tools/refit_pass_2026_10_21.js: BF6 plan kind 'band', with Health, not an Easter egg).
const BAND = CARDS.filter(c=> kindOf.get(c.id) === 'band' && c.health != null && !c.easterEgg);

// tools/refit_pass_2026_10_21.js's rule, against table T: the largest line on the card's A:H shape that holds both caps at Level 1 and at
// its start level, with use <= 100% of N. Returns {A, H, u} or null (no legal line).
function okWith(T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function fit(T, c){ const sA = c.attack || 0, sH = Math.max(1, c.health); let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k));
    const u = okWith(T, c, A, H); if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u}; }
  return best; }
// Fast test: both caps only grow with Attack and Health, so a card has a legal line exactly when fit()'s smallest line (k = 0.05) is legal.
function fits(T, c){ const sA = c.attack || 0, sH = Math.max(1, c.health);
  return !!okWith(T, c, sA === 0 ? 0 : Math.max(1, Math.round(sA * 0.05)), Math.max(1, Math.round(sH * 0.05))); }
function refitAll(T){ const out = {}; BAND.forEach(c=> out[c.id] = fit(T, c)); return out; }

// The skill room: the largest S the card's smallest line (Attack 0 or 1, Health 1) leaves under both caps at L1 and its start level.
function room(T, c){ const lv = SC.levelOf(c), A = (c.attack || 0) === 0 ? 0 : 1, H = 1, d = Object.assign({}, c, {attack: A, health: H});
  const e = c.effects || {}, Aeff = (e.archer && !(Number(e.archer) < 0)) ? 0 : A; let best = Infinity, bind = '';
  [...new Set([1, lv])].forEach(L=>{ const b = T.budget(d, {level: L}), m = b.m, N = b.N;
    const s1 = N / m - 2 * Aeff - H, s2 = Math.sqrt(Math.max(0, (N / 3) * (N / 3) / m - Aeff * H));
    if(s1 < best){ best = s1; bind = 'cap 1 at L' + L; } if(s2 < best){ best = s2; bind = 'cap 2 at L' + L; } });
  return {S: r2(best), bind}; }

// Every price entry a card's S depends on, with the S it carries (S now minus S with that entry at 0).
const ENTRIES = []; Object.entries(KIND).forEach(([k, key])=> (BASE[key] || []).forEach(e=> ENTRIES.push({kind: k, id: e.id, value: +e.value || 0})));
function contributions(rows, cards){ const T0 = SC.make(tableWith(rows)), S0 = {}; cards.forEach(c=> S0[c.id] = T0.cardS(c.effects, c).S);
  const out = {}; cards.forEach(c=> out[c.id] = []);
  ENTRIES.forEach(en=>{ if(!en.value) return; const T = SC.make(tableWith(rows, t=>{ const e = t[KIND[en.kind]].find(x=> x.id === en.id); e.value = 0; }));
    cards.forEach(c=>{ const d = r2(S0[c.id] - T.cardS(c.effects, c).S); if(Math.abs(d) >= 0.01) out[c.id].push({kind: en.kind, id: en.id, S: d}); }); });
  Object.values(out).forEach(l=> l.sort((a, b)=> b.S - a.S)); return {S0, out}; }

// Measurements per entry: measuredS in canonical/skill-costs.json (the SW runs, mostly the full-size world, per point) and the halved-world
// runs (docs/balance/skill-worth-bf6-partial.jsonl + skill-worth-bf6-new.jsonl, the BF6 standard test): each record's measured S over the
// S today's prices give the same effects, times the entry's price = the price that record implies (median over records).
function halvedMeasures(T){ const L = f=>{ try{ return fs.readFileSync(path.join(ROOT, 'docs', 'balance', f), 'utf8').trim().split('\n').filter(Boolean).map(x=> JSON.parse(x)); }catch(e){ return []; } };
  const recs = L('skill-worth-bf6-partial.jsonl').concat(L('skill-worth-bf6-new.jsonl')), by = {};
  recs.forEach(r=>{ if(!r.S || r.S.all == null || r.ctx !== 'plain') return;
    const kind = r.kind === 'shorthand' ? (BASE.shorthands[r.id] ? 'trigger' : null) : r.kind, id = r.kind === 'shorthand' ? (BASE.shorthands[r.id] || {}).trigger : (r.kind === 'trigger' ? (r.effects.triggers && r.effects.triggers[0] || {}).on : r.id);
    if(!kind || !id) return; const e = (BASE[KIND[kind]] || []).find(x=> x.id === id); if(!e || !e.value) return;
    const priced = T.cardS(r.effects, {attack: 1, health: 4}).S; if(!(Math.abs(priced) > 0.05)) return;
    (by[kind + ':' + id] = by[kind + ':' + id] || []).push({v: r2(e.value * r.S.all / priced), clamp: !!(r.ref && r.ref.clamp) || !!(r.h2h && r.h2h.clamp)}); });
  const med = a=>{ const s = a.slice().sort((x, y)=> x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const out = {}; Object.entries(by).forEach(([k, a])=> out[k] = {implied: r2(med(a.map(x=> x.v))), n: a.length, clamped: a.filter(x=> x.clamp).length}); return out; }
function measureOf(kind, id, H){ const e = (BASE[KIND[kind]] || []).find(x=> x.id === id) || {}, h = H[kind + ':' + id];
  return {price: e.value, measuredS: e.measuredS, conf: e.measuredConf || null, halved: h ? h.implied : null, halvedN: h ? h.n : 0, halvedClamped: h ? h.clamped : 0}; }

function load(argv){ const f = argv.find((a, i)=> i > 0 && !a.startsWith('--') && a.endsWith('.json')); if(!f) return []; const j = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(j) ? j : (j.rows || []); }

function analyse(rows){
  const T = SC.make(tableWith(rows)), lines = refitAll(T), noFit = BAND.filter(c=> !lines[c.id]);
  const {S0, out: parts} = contributions(rows, noFit), H = halvedMeasures(SC.make(tableWith([])));
  const cards = noFit.map(c=>{ const rm = room(T, c); return {id: c.id, name: c.name, rarity: c.rarity || 'common', level: SC.levelOf(c), stats: `${c.attack || 0}/${c.health}`,
    S: S0[c.id], room: rm.S, bind: rm.bind, over: r2(S0[c.id] - rm.S), parts: parts[c.id]}; });
  // which entries appear, how many no-fit cards carry each, and what cutting each alone to 0 / to its measurement frees
  const tally = {}; cards.forEach(c=> c.parts.forEach(p=>{ const k = p.kind + ':' + p.id; (tally[k] = tally[k] || {kind: p.kind, id: p.id, cards: 0, S: 0}).cards++; tally[k].S = r2(tally[k].S + p.S); }));
  return {lines, cards, tally: Object.values(tally).sort((a, b)=> b.cards - a.cards).map(t=> Object.assign(t, measureOf(t.kind, t.id, H))), H};
}
// How many of `ids` fit (have a legal line) under rows
const BY_ID = new Map(CARDS.map(c=> [c.id, c]));
function freedIds(rows, ids){ const T = SC.make(tableWith(rows)); return ids.filter(id=> fits(T, BY_ID.get(id))); }
function freed(rows, ids){ return freedIds(rows, ids).length; }

function refitReport(rows){
  const T0 = SC.make(tableWith([])), T1 = SC.make(tableWith(rows)), a = refitAll(T0), b = refitAll(T1);
  const st = c=> `${c.attack || 0}/${c.health}`, ln = l=> l ? `${l.A}/${l.H}` : null;
  const summary = L=>{ const noFit = BAND.filter(c=> !L[c.id]), fitted = BAND.filter(c=> L[c.id]);
    return {band: BAND.length, noFit: noFit.length, noFitTiny: noFit.filter(c=> (c.attack || 0) + c.health <= 3).length,
      tinyAfter: fitted.filter(c=> L[c.id].A + L[c.id].H <= 3).length, moves: fitted.filter(c=> ln(L[c.id]) !== st(c)).length}; };
  const drifted = BAND.filter(c=> a[c.id] && ln(a[c.id]) !== st(c)).map(c=> ({id: c.id, now: st(c), before: ln(a[c.id]), after: ln(b[c.id])}));
  const freedCards = BAND.filter(c=> !a[c.id] && b[c.id]).map(c=> ({id: c.id, now: st(c), after: ln(b[c.id]), u: r2(b[c.id].u)}));
  const stillNo = BAND.filter(c=> !b[c.id]).map(c=> c.id);
  const lost = BAND.filter(c=> a[c.id] && !b[c.id]).map(c=> c.id);
  const otherMoves = BAND.filter(c=> a[c.id] && b[c.id] && ln(a[c.id]) === st(c) && ln(b[c.id]) !== st(c)).map(c=> ({id: c.id, now: st(c), after: ln(b[c.id])}));
  return {before: summary(a), after: summary(b), drifted, freed: freedCards, stillNo, lost, otherMoves};
}

// The cheapest single change that gives a still-no-fit card a legal line: shrink one skill's number (or one trigger's amount / count) by
// whole steps, or drop one skill or trigger (a plain flag goes with its braces: Tide with tideGrant ...). Cheapest = the least S removed;
// a shrink beats a drop at the same S. Returns per card {id, S, fix: {what, S removed, line} | null, best two-change fix when no single one does}.
const COMPANION = {tide: ['tideGrant'], diurnal: ['diurnalGrant', 'diurnalHp'], nocturnal: ['nocturnalGrant', 'nocturnalHp'], crepuscular: ['crepuscularGrant', 'crepuscularHp'],
  esprit: ['espritHp', 'espritWho'], swarm: ['swarmN'], arrow: ['arrowCount'], king: ['kinglyGrant'], fullMoon: ['fullMoonGrant'], defiance: ['defianceN'], stem: ['stemGrant']};
// The half-miss skills (Flying, Evasive ...) cost 0 S but x1.5 on both scores; dropping one is a different card, so it is not offered as the
// cheapest fix (fixes() reports separately whether dropping it alone would do).
const HALF = BASE.halfMiss || ['evasive', 'swift', 'flying', 'shadow', 'blind'];
function variants(c, withHalf){ const e = c.effects || {}, out = [];
  Object.keys(e).forEach(k=>{ const v = e[k]; if(!withHalf && HALF.includes(k)) return;
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach((t, i)=>{ if(!t) return; const lab = `trigger ${t.on} → ${t.do}`;
        ['amount', 'count'].forEach(f=>{ const n = +t[f]; if(n > 1) for(let m = n - 1; m >= 1; m--) out.push({what: `${lab}: ${f} ${n} → ${m}`, shrink: true, e: Object.assign({}, e, {triggers: v.map((x, j)=> j === i ? Object.assign({}, x, {[f]: m}) : x)})}); });
        out.push({what: `drop ${lab}`, shrink: false, e: Object.assign({}, e, {triggers: v.filter((x, j)=> j !== i)})}); }); return; }
    if(typeof v === 'number' && v > 1) for(let m = Math.ceil(v) - 1; m >= 1; m--) out.push({what: `${k} ${v} → ${m}`, shrink: true, e: Object.assign({}, e, {[k]: m})});
    const d = Object.assign({}, e); delete d[k]; (COMPANION[k] || []).forEach(x=> delete d[x]); out.push({what: `drop ${k}${(COMPANION[k] || []).filter(x=> e[x] != null).map(x=> ' + ' + x).join('')}`, shrink: false, e: d}); });
  return out; }
function fixes(rows, ids){ const T = SC.make(tableWith(rows));
  return ids.map(id=>{ const c = BY_ID.get(id), S0 = T.cardS(c.effects, c).S, vs = variants(c).map(v=> Object.assign(v, {dS: r2(S0 - T.cardS(v.e, c).S)}));
    const ok = v=>{ const d = Object.assign({}, c, {effects: v.e}); return fits(T, d) ? fit(T, d) : null; };
    // cheapest first; a fix that leaves a line above A+H 3 beats one that only reaches a tiny line
    const rank = (a, b)=> ((a.line.A + a.line.H <= 3) - (b.line.A + b.line.H <= 3)) || a.dS - b.dS || (b.shrink - a.shrink);
    const one = vs.map(v=> Object.assign(v, {line: ok(v)})).filter(v=> v.line).sort(rank)[0];
    const o = {id, name: c.name, stats: `${c.attack || 0}/${c.health}`, S: S0, room: room(T, c).S};
    const half = HALF.filter(k=> (c.effects || {})[k]).map(k=>{ const d = Object.assign({}, c.effects); delete d[k]; const l = ok({e: d}); return l ? `drop ${k} -> ${l.A}/${l.H}` : null; }).filter(Boolean);
    if(half.length) o.dropHalfMiss = half;
    if(one){ o.fix = {what: one.what, dS: one.dS, line: `${one.line.A}/${one.line.H}`, kind: one.shrink ? 'shrink' : 'drop', tiny: one.line.A + one.line.H <= 3}; return o; }
    // no single change: the cheapest pair (one change on top of another)
    let best = null; vs.forEach(v=> variants(Object.assign({}, c, {effects: v.e})).forEach(w=>{ const dS = r2(S0 - T.cardS(w.e, c).S); if(best && dS >= best.dS) return;
      const d = Object.assign({}, c, {effects: w.e}); if(fits(T, d)){ const l = fit(T, d); best = {what: v.what + '; ' + w.what, dS, line: `${l.A}/${l.H}`}; } }));
    o.fix = null; o.pair = best; return o; }); }

// A structural what-if (not a price): the half-miss x1.5 on the stats only (2A + H and A·H), not on S. Which of `ids` would fit then.
function halfMissStatsOnly(rows, ids){ const T = SC.make(tableWith(rows));
  const okAt = (c, A, H, L)=>{ const d = Object.assign({}, c, {attack: A, health: H}), b = T.budget(d, {level: L}), e = c.effects || {}, Ae = (e.archer && !(Number(e.archer) < 0)) ? 0 : A;
    return (2 * Ae + H) * b.m + b.S <= b.N && Ae * H * b.m + b.S * Math.abs(b.S) <= b.N2; };
  return ids.filter(id=>{ const c = BY_ID.get(id), sA = c.attack || 0, A = sA === 0 ? 0 : Math.max(1, Math.round(sA * 0.05)), H = Math.max(1, Math.round(Math.max(1, c.health) * 0.05));
    return [...new Set([1, SC.levelOf(c)])].every(L=> okAt(c, A, H, L)); }); }

// The Fragile cards under three readings: as now (-8 as a skill and x0.75 on N), without the -8 (Fragile priced 0), without the x0.75 (fragileMult 1).
function fragileReport(rows){
  const Ts = {now: SC.make(tableWith(rows)), noMinus8: SC.make(tableWith(rows, t=>{ t.skills.find(x=> x.id === 'fragile').value = 0; })),
    noMult: SC.make(tableWith(rows, t=>{ t.budget.fragileMult = 1; })),
    neither: SC.make(tableWith(rows, t=>{ t.skills.find(x=> x.id === 'fragile').value = 0; t.budget.fragileMult = 1; })), // the same card as if it were not Fragile
    measured: SC.make(tableWith(rows, t=>{ const f = t.skills.find(x=> x.id === 'fragile'); f.value = -1.76; }))}; // Fragile at its halved-world measure (1/4 baseline), x0.75 kept
  return BAND.filter(c=> (c.effects || {}).fragile).map(c=>{ const o = {id: c.id, name: c.name, stats: `${c.attack || 0}/${c.health}`};
    Object.entries(Ts).forEach(([k, T])=>{ const l = fit(T, c), b = T.budget(c, {level: 1}); o[k] = {line: l ? `${l.A}/${l.H}` : 'no line', N: b.N, S: b.S}; }); return o; });
}

// The owner's options beyond the proposal (not in the proposal file), each at its halved-world measure, in the order they were tried:
//   floor      the halved-world measure is saturated (the skill side won about every game), so it is a floor, not the worth
//   ownerCut   the owner's own pass I price, still above the halved-world measure (pass III keeps the owner's cuts)
//   unmeasured the standard test cannot see the skill (its units have no type, no mountain, no armor to pierce ...): a value to choose
const OPTIONS = {
  floor: [['skill', 'onReadyGold', 2.6], ['skill', 'rage', 2.72], ['skill', 'swipe', 2.72], ['skill', 'meteor', 1.32]],
  ownerCut: [['skill', 'quick', 2.35], ['skill', 'sweep', 1.91], ['action', 'drawCard', 2.28], ['skill', 'pounce', 1.05], ['skill', 'bleed', 2.1], ['skill', 'shell', 1], ['skill', 'sturdy', 0.7],
    ['skill', 'poison', 2.19], ['skill', 'venomous', 2.41], ['skill', 'proliferate', 3.71], ['skill', 'nursing', 2.73], ['skill', 'electricity', 1.92], ['skill', 'perforate', 2.45], ['skill', 'desecrate', 2.99],
    ['skill', 'sleep', 1.74], ['action', 'poison', 0.93], ['skill', 'ambush', 1.09], ['skill', 'fastForward', 1.74], ['skill', 'freeze', 0.8], ['skill', 'fork', 1.69]],
  unmeasured: [['skill', 'swarm', 1], ['skill', 'mountainClimber', 2], ['skill', 'pierce', 0], ['skill', 'taunt', 1], ['skill', 'counterattack', 1], ['skill', 'sacrifice', 1], ['skill', 'immolation', 2], ['skill', 'esprit', 1], ['skill', 'hoard', 0]]};
// The whole dry run behind docs/balance/pass-3-proposal-2026-10-22.md, written to docs/balance/pass-3-dryrun-2026-10-22.json.
function report(rows){
  const row = ([kind, id, proposed])=> ({kind, id, proposed}), H = halvedMeasures(SC.make(tableWith([])));
  const a0 = analyse([]), ids = a0.cards.map(c=> c.id), out = {generated: '2026-10-22', proposal: rows};
  out.noFitNow = a0.cards.map(c=> ({id: c.id, stats: c.stats, S: c.S, room: c.room, over: c.over, parts: c.parts.slice(0, 4)}));
  out.proposalRows = rows.map(r=> Object.assign({}, r, measureOf(r.kind, r.id, H), {freesAlone: freed([r], ids)}));
  out.proposalFrees = freed(rows, ids);
  let cur = rows.slice(), f0 = out.proposalFrees; out.options = {};
  Object.entries(OPTIONS).forEach(([tier, list])=>{ out.options[tier] = list.map(x=>{ const r = row(x), alone = freed(rows.concat([r]), ids) - out.proposalFrees;
    cur = cur.concat([r]); const f = freed(cur, ids), o = Object.assign({kind: x[0], id: x[1], proposed: x[2]}, measureOf(x[0], x[1], H), {aloneOnTopOfProposal: alone, marginal: f - f0, cumulative: f}); f0 = f; return o; }); });
  out.refit = refitReport(rows); out.allOptions = refitReport(cur).after;
  const still = out.refit.stillNo, freedBy = {};
  Object.values(OPTIONS).flat().forEach(x=> freedIds(rows.concat([row(x)]), still).forEach(id=> (freedBy[id] = freedBy[id] || []).push(x[1] + ' ' + x[2])));
  out.fixes = fixes(rows, still).map(f=> Object.assign(f, {optionThatFreesIt: freedBy[f.id] || []}));
  out.halfMissOnStatsOnly = {noFitFlyersNow: ids.filter(id=> (BY_ID.get(id).effects || {}).flying).length, freedNow: halfMissStatsOnly([], ids).length, freedOnTopOfProposal: halfMissStatsOnly(rows, still).length};
  out.fragile = fragileReport(rows);
  return out; }

if(require.main === module){
  const cmd = process.argv[2] || 'analyse', rows = load(process.argv.slice(2));
  if(cmd === 'analyse'){ const r = analyse(rows);
    console.log(`${r.cards.length} band cards with no legal line${rows.length ? ' under the proposal' : ''}`);
    r.tally.slice(0, 45).forEach(t=> console.log(`  ${(t.kind + ':' + t.id).padEnd(28)} on ${String(t.cards).padStart(3)} no-fit cards, S ${String(t.S).padStart(7)}  price ${t.price}  measuredS ${t.measuredS} (${t.conf})  halved ${t.halved} (${t.halvedN})`));
  } else if(cmd === 'refit'){ const r = refitReport(rows);
    console.log('before', JSON.stringify(r.before)); console.log('after ', JSON.stringify(r.after));
    console.log(`freed ${r.freed.length}, still no line ${r.stillNo.length}, newly no line ${r.lost.length}`);
  } else if(cmd === 'fragile'){ fragileReport(rows).forEach(o=> console.log(JSON.stringify(o))); }
  else if(cmd === 'json'){ console.log(JSON.stringify({analyse: analyse(rows), refit: refitReport(rows), fragile: fragileReport(rows)}, null, 1)); }
  else if(cmd === 'report'){ const out = path.join(ROOT, 'docs', 'balance', 'pass-3-dryrun-2026-10-22.json'), r = report(rows);
    fs.writeFileSync(out, JSON.stringify(r, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, out), JSON.stringify({before: r.refit.before, after: r.refit.after, allOptions: r.allOptions})); }
  else console.log('usage: node tools/pass3_skill_costs_2026_10_22.js analyse|refit|fragile|json|report [proposal.json]');
}
module.exports = {OPTIONS, report,tableWith, refitAll, fit, fits, freedIds, fixes, variants, halfMissStatsOnly, room, contributions, halvedMeasures, measureOf, analyse, freed, refitReport, fragileReport, BAND, CARDS, BASE, SC};
