#!/usr/bin/env node
// 2026-11-11 (package SKIR2): deck steps after SKIR2's list adds (tools/skir2/lists_2026_11_11.js), on SKIR1's deck rules
// (tools/skir1/lib_fight_2026_11_11.js) and tools:
//   restore           a fight whose leader SKIR1's repair took out because its card was on no list gets its pre-repair deck back now that the card
//                     is listed again (15-1 Cataphract Destrier, 10-A-2 Coral Reef Shark: the item-8 reward adds), with the Shield the repair's
//                     own follow-up fit had changed; tests/skir1 "its leaders are kept"
//   rebuild --maps mr SKIR1's build (tools/skir1/build_2026_11_11.js planMap, THEME5 plan) again on the amended list, its peak strategies from
//                     SKIR2's BPRO search (docs/balance/skir2/refdecks/bpro) -> docs/balance/skir2/build-plan-2026-11-11.json, applied
//   seed              BAL9 JJ28: each map's new Guardian card (1 copy: a carried card, K14) into the fight of that map that reads most over its
//                     target, for the weakest copy it may replace (the fit then re-tunes that fight)
//   cuts [--apply]    BAL9 JJ24 / the PRO map rule on decks outside Maps 0-20 that SKIR1's lists broke: each card on no list (bal9's isCut) or
//                     not obtainable by its map (the PRO map-true rule) swapped for the nearest card of that map's own list (bal9's swapDeck:
//                     Lumber, Wait, 2A+H, rarity; PRO decks keep the 6/4 rule; a challenge deck keeps its boon); not re-searched
//   fitapply --dir D  the kept picks of tools/skir1/fit_2026_11_11.js runs in docs/balance/skir2/<D> written with a SKIR2 comment
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js'), OUT = path.join(ROOT, 'docs', 'balance', 'skir2');
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const sorted = d => Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
const lineRe = code => new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm');
const write = s => { fs.writeFileSync(APP + '.skir2tmp', s); fs.renameSync(APP + '.skir2tmp', APP); }; // whole file, then renamed (a sim may be starting)
fs.mkdirSync(OUT, { recursive: true });

if (CMD === 'restore') {
  const L = require('../skir1/lib_fight_2026_11_11.js');
  // code -> the deck before SKIR1's repair (its comment's "was"), and the Shield before the follow-up fit (null = back on the rule)
  const R = { '15-1': { deck: { 'cataphract-destrier': 4, 'land-tiller': 4, 'mallard-halberdier': 3, 'pronghorn-racer': 3, 'thorn-shrike': 1 }, shield: null, card: 'cataphract-destrier', note: '91% at 200 games on the road seeds (SKIR1 fit) before the repair' },
    '10-A-2': { deck: { 'coral-reef-shark': 2, 'giant-clam': 1, 'hagfish-silencer': 1, 'kraken-spawnling': 5, 'orca-vanguard': 3 }, shield: 2, card: 'coral-reef-shark', note: '69% at 200 games on the road seeds (SKIR1 fit) before the repair' } };
  let s = fs.readFileSync(APP, 'utf8');
  for (const [code, r] of Object.entries(R)) {
    const m = L.maps().find(x => L.fightsOf(x).some(n => n.key === code)), n = L.fightsOf(m).find(x => x.key === code), f = L.fight(m, Object.assign({}, n, { deck: r.deck }));
    G0(m, n); const mm = s.match(lineRe(code)); if (!mm) throw new Error('no line ' + code);
    if (keyOf(n.deck) === keyOf(r.deck)) { console.log(code, 'already restored'); continue; }
    if (!f.legal(r.deck)) throw new Error(code + ': ' + f.problems(r.deck).join('; '));
    let line = mm[1];
    if (r.shield == null) line = line.replace(/shieldOverride:\d+, /, ''); else if (!/shieldOverride:\d+/.test(line.split('deck:')[0])) line = line.replace('deck:', `shieldOverride:${r.shield}, deck:`);
    line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(r.deck)) + ` /* 2026-11-11 (SKIR2): ${r.card} is on a list again (its fight's first-clear reward, SKIR2 item 8), so SKIR1's repair is undone: its leader and the deck it had (${r.note})${r.shield == null ? ', Shield back on the rule' : ''}; deck (was ${JSON.stringify(n.deck)}) */`);
    s = s.replace(mm[1], line); console.log('restored', code, JSON.stringify(r.deck));
  }
  write(s);
}
function G0(m, n) { require('../skir1/lib_fight_2026_11_11.js').G.NODE_MAP_HINT.set(n, m.id); }

if (CMD === 'rebuild') {
  // SKIR1's planMap reads its peak strategies from docs/balance/skir1/refdecks/bpro; SKIR2's search of the amended list is read in its place
  const real = { e: fs.existsSync, r: fs.readFileSync }, redirect = p => { const q = String(p).replace(/([\\/])skir1\1refdecks\1bpro\1/, '$1skir2$1refdecks$1bpro$1'); return q !== String(p) && real.e(q) ? q : p; };
  fs.existsSync = p => real.e(redirect(p)); fs.readFileSync = (p, ...o) => real.r(redirect(p), ...o);
  const B = require('../skir1/build_2026_11_11.js'), L = require('../skir1/lib_fight_2026_11_11.js');
  fs.existsSync = real.e; fs.readFileSync = real.r;
  const want = new Set(String(arg('--maps', '')).split(',').filter(Boolean)), plan = { about: 'SKIR2 rebuild (tools/skir2/decks_2026_11_11.js rebuild: SKIR1\'s planMap on the amended list, SKIR2\'s BPRO decks as the peak strategies)', built: '2026-11-11', maps: [] };
  fs.existsSync = p => real.e(redirect(p)); fs.readFileSync = (p, ...o) => real.r(redirect(p), ...o);
  for (const m of L.maps().filter(x => want.has(x.id))) plan.maps.push(B.planMap(m));
  fs.existsSync = real.e; fs.readFileSync = real.r;
  let s = fs.readFileSync(APP, 'utf8'), k = 0;
  for (const p of plan.maps) {
    console.log(`Map ${p.mapNo} ${p.id}: peaks ${p.peaks.join('/')} <- ${p.strategies.map(x => x.id + ' ' + x.focus).reverse().join(', ')}; repairs ${p.repairs.length}`);
    for (const x of p.fights) {
      if (x.problems && x.problems.length) { console.log('  skip', x.code, x.problems.join('; ')); continue; }
      if (keyOf(x.deck) === keyOf(x.old)) continue;
      const mm = s.match(lineRe(x.code)); if (!mm) throw new Error('no line ' + x.code);
      const why = x.role === 'peak' ? `peak strategy ${x.strategy} (${x.focus}), slightly down-tuned` : x.role === 'boss' ? "a blend of the list's cards (boss / ender; leader kept)" : "a blend of the list's cards";
      s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(x.deck)) + ` /* 2026-11-11 (SKIR2): rebuilt from the amended list (SKIR1-7: + Swift Fox, Tasmanian Devil, Bramblewood Lynx), SKIR1's THEME5 plan: ${why}; deck (was ${JSON.stringify(x.old)}) */`));
      k++; console.log('  ', x.code, x.role, JSON.stringify(sorted(x.deck)));
    }
  }
  fs.writeFileSync(path.join(OUT, 'build-plan-2026-11-11.json'), JSON.stringify(plan, null, 1) + '\n'); write(s); console.log('rebuilt', k, 'decks');
}

if (CMD === 'seed') {
  const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, LISTS = require('./lists_2026_11_11.js').ADDS;
  const rows = {}; const tag = arg('--from', 'skir1w400'); fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${tag}.jsonl`), 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); rows[r.code] = r; });
  const score = id => G.skirmishCardScore(D[id] || {});
  const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
  const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
  const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
  let s = fs.readFileSync(APP, 'utf8'); const out = [];
  for (const [mid, adds] of Object.entries(LISTS)) for (const [card, x] of Object.entries(adds)) {
    if (!/JJ28/.test(x.why)) continue;
    const m = L.maps().find(y => y.id === mid), fl = L.fightsOf(m), F = fl.map(n => L.fight(m, n)), ucap = L.ucapOf(m), use = {};
    F.forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
    if (F.some(f => f.n.deck[card])) { console.log(mid, card, 'already in a deck'); continue; }
    const listAll = [...new Set([].concat(...F.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
    const pairBad = (f, d) => Object.keys(d).some(id => !f.keep.has(id) && fam[family(id)] === 2 && Object.keys(d).some(y => y !== id && family(y) === family(id)));
    const cands = [];
    for (const f of F) { const r = rows[f.code]; if (!r || !f.pool.includes(card) || /boss/.test(f.kind) || (use[card] || 0) + 1 > ucap) continue;
      const over = r.win - r.target; // the fight that reads most over its target takes the defender (it makes the enemy deck sturdier)
      Object.keys(f.n.deck).filter(id => !f.keep.has(id) || f.n.deck[id] > f.keep.get(id)).sort((p, q) => score(p) - score(q)).some(o => {
        const d = Object.assign({}, f.n.deck); d[o]--; if (!d[o]) delete d[o]; d[card] = 1;
        if (!f.legal(d) || pairBad(f, d)) return false; cands.push({ f, over, out: o, d }); return true; }); }
    const best = cands.sort((p, q) => q.over - p.over)[0]; if (!best) { console.log(mid, card, 'no fight can take it'); continue; }
    const mm = s.match(lineRe(best.f.code));
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(best.d)) + ` /* 2026-11-11 (SKIR2): BAL9 JJ28, the map's new Guardian defender ${card} (1 copy: carried, K14) for one ${best.out} (the fight read ${rows[best.f.code].win}%, target ${+rows[best.f.code].target.toFixed(1)}; re-fitted after); deck (was ${JSON.stringify(best.f.n.deck)}) */`));
    out.push({ map: mid, card, fight: best.f.code, out: best.out, over: best.over }); console.log(mid, card, '->', best.f.code, 'for one', best.out, `(over ${best.over.toFixed(1)})`);
  }
  write(s); fs.writeFileSync(path.join(OUT, 'seed-2026-11-11.json'), JSON.stringify({ about: 'SKIR2 BAL9 JJ28 seeds (tools/skir2/decks_2026_11_11.js seed)', seeds: out }, null, 1) + '\n');
}

if (CMD === 'cuts') {
  const L9 = require('../bal9/lib_bal9.js'), { G, D, LP, pools } = L9.game();
  const O = require('../opt/deckopt.js'), P = require('../opt/pro_skirmishes.js'), gm = O.loadGame(ROOT), ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
  const DX = JSON.parse(JSON.stringify(D)); if (ENG.SKILL_PARAMS_LIB) ENG.SKILL_PARAMS_LIB.expandDefsInPlace(DX);
  const APPLY = a.includes('--apply'), proFile = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), pro = JSON.parse(fs.readFileSync(proFile, 'utf8'));
  const poolFor = m => [...(LP.fightPool(pools, m.id, m.sub ? m.parent : null) || [])];
  // bal9's cut test as its cuts run reads it on a real map (a card out of play: on no list, no pack extra, no other source; never Base / starter)
  const isCut = id => { const d = D[id]; return !!d && !d.token && !d.test && G.cardSourceOf(d).kind !== 'base' && d.rarity !== 'starter' && LP.isOutOfPlay(G, d); };
  // bal9's swap (tools/bal9/decks_2026_11_02.js swapDeck) with the bad-card test passed in (bal9's own reads its isCut with no map set): each bad
  // card's copies to the nearest card of the list (dist below; a card the deck holds first at equal distance), inside the rarity cap, the copy
  // cap (and 6/4 for a PRO deck), not another fight's reward unless kept, and the check (a challenge boon); the rest to the deck's own cards
  const swap = (deck, bad, cand, cap, o) => { const out = Object.assign({}, deck), moves = [], capR = c => Math.min(G.maxCopiesForRarity((D[c] || {}).rarity), o.maxCopies || 99);
    const roomNew = c => out[c] || !o.maxUnique || Object.keys(out).length < o.maxUnique, keep = o.keep || new Set();
    for (const id of Object.keys(deck).filter(bad)) { let k = out[id]; delete out[id]; const got = {};
      const opts = cand.filter(c => D[c] && !bad(c) && !D[c].token && L9.step(D[c].rarity) <= L9.step(cap) && c !== id && !(D[c].source && D[c].source.kind === 'map' && !keep.has(c)))
        .sort((p, q) => dist(D, id, p, L9) - dist(D, id, q, L9) || ((out[q] ? 1 : 0) - (out[p] ? 1 : 0)) || (p < q ? -1 : 1));
      for (const c of opts) { if (!k) break; while (k && (out[c] || 0) < capR(c) && roomNew(c)) { out[c] = (out[c] || 0) + 1; if (o.check && !o.check(out)) { out[c]--; if (!out[c]) delete out[c]; break; } k--; got[c] = (got[c] || 0) + 1; } }
      if (k) Object.keys(out).sort((p, q) => out[q] - out[p]).forEach(c => { while (k && out[c] < capR(c)) { out[c]++; if (o.check && !o.check(out)) { out[c]--; break; } k--; got[c] = (got[c] || 0) + 1; } });
      moves.push({ cut: id, copies: deck[id], to: got, left: k }); }
    return { deck: out, moves }; };
  const rows = []; let s = fs.readFileSync(APP, 'utf8');
  // road and endless decks outside SKIR1's maps: a card on no list (bal9's isCut, the rule tests/bal9 JJ24 checks)
  for (const m of G.CONQUEST_MAPS) {
    if (m.tower || m.reserved) continue; const no = G.mapNumberOf(m.id); if (!m.endless && (no == null || no <= 20)) continue;
    const nodes = m.endless ? [{ key: '(base deck)', deck: m.deck || (m.nodes && m.nodes[0] && m.nodes[0].deck) || {}, endless: true }] : (m.nodes || []);
    for (const n of nodes) { if (!n.deck || !Object.keys(n.deck).some(isCut)) continue;
      const keep = new Set(); try { (G.skirmishLeadersOf(n, m.id) || []).forEach(id => keep.add(id)); } catch (e) {}
      const boonOk = d => !(n.rules && n.rules.boon) || ENG.selfishBoonCount(DX, d, n.rules.boon).on;
      const cap = G.roadRarityCap(no, n.kind || 'skirmish', m.id) || 'mythic', r = swap(n.deck, isCut, poolFor(m), cap, { check: boonOk, keep });
      rows.push({ where: m.endless ? `endless ${m.id}` : `node ${m.id}:${n.key}`, map: no, loc: m.id, key: n.key, before: n.deck, after: r.deck, moves: r.moves, boon: n.rules && n.rules.boon ? boonOk(r.deck) : null });
      if (APPLY) { const re = m.endless ? new RegExp(`endlessDungeon\\(\\{id:'${m.id}'`) : new RegExp(`key:\\s*['"]${n.key.replace(/-/g, '\\-')}['"]`), mm = re.exec(s), i = s.indexOf('deck:{', mm.index), j = s.indexOf('}', i);
        const dbl = s.slice(i, j).includes('"'), lit = dbl ? JSON.stringify(sorted(r.deck)) : JSON.stringify(sorted(r.deck)).replace(/"/g, "'");
        s = s.slice(0, i) + 'deck:' + lit + ` /* 2026-11-11 (SKIR2): BAL9 JJ24, ${r.moves.map(v => v.cut).join(', ')} on no list since SKIR1's lists, swapped for the list's nearest (Lumber, Wait, 2A+H); not retuned */` + s.slice(j + 1); } } }
  // PRO / BPRO / WPRO decks: a cut card (JJ24) or a card the map rule says no player holds by then (the pro test)
  for (const [mid, e] of Object.entries(pro.maps)) {
    const m = G.CONQUEST_MAPS.find(x => x.id === mid), no = G.mapNumberOf(mid); if (!m || no <= 20) continue;
    for (const [kind, mode] of [['pro', 'map-true'], ['bpro', 'bpro'], ['wpro', 'bpro']]) for (const x of (e[kind] || [])) {
      const bad = id => isCut(id) || (kind === 'pro' && O.mapRuleProblems(gm, m, { [id]: 1 }, mode).some(p => p.startsWith(id + ':')));
      if (!Object.keys(x.deck).some(bad)) continue;
      const cap = (x.source && x.source.cap) || G.roadRarityCap(no, 'boss', mid) || 'mythic', r0 = swap(x.deck, bad, poolFor(m), cap, { maxCopies: 4, maxUnique: 6 });
      const probs = P.deckProblems(gm, r0.deck, P.leadersFor(gm, m, r0.deck)).concat(O.mapRuleProblems(gm, m, r0.deck, mode), P.limitProblems(r0.deck, { maxUnique: 6, maxCopies: 4 }));
      rows.push({ where: `${kind} ${x.id}`, map: no, loc: mid, pro: { kind, id: x.id }, before: x.deck, after: r0.deck, moves: r0.moves, problems: probs, leaders: P.leadersFor(gm, m, r0.deck) });
      if (APPLY && !probs.length) { x.deck = sorted(r0.deck); x.leaders = kind === 'wpro' ? [] : P.leadersFor(gm, m, x.deck);
        x.skir2 = `2026-11-11 (SKIR2): ${r0.moves.map(v => v.cut + ' x' + v.copies).join(', ')} ${r0.moves.some(v => isCut(v.cut)) ? 'on no list since SKIR1\'s lists (BAL9 JJ24)' : 'not held by this map since SKIR1\'s lists (the map-true rule)'}, swapped for the map list's nearest (Lumber, Wait, 2A+H); not re-searched`; }
    }
  }
  rows.forEach(r => console.log(`${r.where.padEnd(18)} ${r.moves.map(v => `${v.cut} x${v.copies} -> ${Object.entries(v.to).map(([c, k]) => c + ' x' + k).join(' + ')}${v.left ? ' (' + v.left + ' left)' : ''}`).join('; ')}${r.boon != null ? ' | boon ' + (r.boon ? 'on' : 'OFF') : ''}${r.problems && r.problems.length ? ' | PROBLEMS ' + r.problems.join('; ') : ''}${r.leaders ? ' | leaders ' + r.leaders.join(',') : ''}`));
  if (APPLY) { write(s); fs.writeFileSync(proFile, JSON.stringify(pro, null, 1) + '\n'); fs.writeFileSync(path.join(OUT, 'cuts-2026-11-11.json'), JSON.stringify({ about: 'SKIR2: BAL9 JJ24 / PRO map-rule swaps outside Maps 0-20 (tools/skir2/decks_2026_11_11.js cuts)', rows }, null, 1) + '\n'); console.log('applied', rows.length); }
}
// bal9's swap distance (tools/bal9/decks_2026_11_02.js dist): Lumber x3, Wait, 2A+H / 3, rarity steps x4 (+2 when the new card is rarer)
function dist(D, a, b, L9) { const x = D[a] || {}, y = D[b] || {}, st = d => 2 * (+d.attack || 0) + (+d.health || 0);
  return 3 * Math.abs((+x.cost || 0) - (+y.cost || 0)) + Math.abs((+x.wait || 0) - (+y.wait || 0)) + Math.abs(st(x) - st(y)) / 3 + 4 * Math.abs(L9.step(x.rarity) - L9.step(y.rarity)) + (L9.step(y.rarity) > L9.step(x.rarity) ? 2 : 0); }

if (CMD === 'set') {
  // one fight's deck by hand (a start for the fit), checked against SKIR1's deck rules and the map's (usage line, two-card families):
  //   set --code 7-6 --deck '{"dung-beetle":4,...}' --why "..."
  const L = require('../skir1/lib_fight_2026_11_11.js'), code = arg('--code'), deck = JSON.parse(arg('--deck')), why = arg('--why');
  const m = L.maps().find(x => L.fightsOf(x).some(n => n.key === code)), fl = L.fightsOf(m), n = fl.find(x => x.key === code), f = L.fight(m, n);
  const ucap = L.ucapOf(m), use = {}; fl.filter(x => x !== n).forEach(x => { const fx = L.fight(m, x); Object.keys(x.deck).forEach(id => { if (!fx.keep.has(id)) use[id] = (use[id] || 0) + 1; }); });
  const over = Object.keys(deck).filter(id => !f.keep.has(id) && (use[id] || 0) + 1 > ucap), probs = f.problems(deck).concat(over.map(id => `${id} would be in ${use[id] + 1} fights (line ${ucap})`));
  if (probs.length || !why) { console.log(code, 'not written:', probs.join('; ') || 'no --why'); process.exit(1); }
  let s = fs.readFileSync(APP, 'utf8'); const mm = s.match(lineRe(code));
  s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(deck)) + ` /* 2026-11-11 (SKIR2): ${why}; deck (was ${JSON.stringify(n.deck)}) */`)); write(s); console.log('set', code, JSON.stringify(sorted(deck)));
}

if (CMD === 'fitapply') {
  // tools/skir1/fit_2026_11_11.js apply, with SKIR2's label (its own apply writes "(SKIR1 fit)")
  const dir = path.join(OUT, arg('--dir', 'fit')), only = String(arg('--codes', '')).split(',').filter(Boolean);
  let s = fs.readFileSync(APP, 'utf8'), k = 0;
  for (const x of fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))).filter(x => x.keep && (!only.length || only.includes(x.code)))) {
    const mm = s.match(lineRe(x.code)); if (!mm) throw new Error('no line ' + x.code); let line = mm[1];
    const cur = JSON.parse((line.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]); if (keyOf(cur) !== keyOf(x.before.deck)) { console.log('skip', x.code, '(the deck moved since the fit)'); continue; }
    const deck = sorted(x.pick.deck), what = [];
    if (keyOf(deck) !== keyOf(x.before.deck)) { line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck)); what.push('deck (was ' + JSON.stringify(x.before.deck) + ')'); }
    if (x.pick.shield != null) { what.push('Shield override ' + (x.shieldOverride == null ? 'rule ' + x.shieldRule : x.shieldOverride) + ' -> ' + x.pick.shield);
      line = /shieldOverride:\d+/.test(line.split('deck:')[0]) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.pick.shield) : line.replace(/deck:/, `shieldOverride:${x.pick.shield}, deck:`); }
    line = line.replace(/(deck:\{[^}]*\})/, `$1 /* 2026-11-11 (SKIR2 fit): toward the road curve (target ${Math.round(x.band.t * 10) / 10}), ${x.before.win}% -> ${x.pick.win}% at ${x.games} games on the road seeds; ${what.join('; ')} */`);
    s = s.replace(mm[1], line); k++; console.log('applied', x.code, x.before.win, '->', x.pick.win);
  }
  write(s); console.log('applied', k);
}
