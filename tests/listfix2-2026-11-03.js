#!/usr/bin/env node
// 2026-11-03 (package LISTFIX2, owner 22:02: "cut cards still stay, but are just flagged as cut"): checks, without a browser:
//   1. the lists: every cut of the owner's 11-01 export (docs/balance/owner-map-cards-export-2026-11-01.json) is off its MAP / submap list,
//      except the two first-clear cards CARD5 put back (Snapper Hatchling 5-1, Weaver Bird 14-3: owner call LISTFIX2-1)
//   2. the review (canonical/map-review.json): a cut card still on its own list or on the map's SPECIAL has a statusWhy; a cut on SPECIAL
//      is that map's boss / reward card (source kind map on that map) or one of its first-clear cards (SKIRMISH_FIRST_PACK_CARDS)
//   3. the panel: lf2CutStatus gives listed / special / removed (with the other lists) on stub lists; a Cut tile carries the pill;
//      no "Apply my cuts" (a list change is a live card_overrides write); the note under Copy my picks
//   4. the texts: 8 ui.lf2-* keys, each English text in the 12 language packs; decisions LISTFIX2-1 and -2
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const J = p=> JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0; const j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };

const pools = J('canonical/map-pools.json').maps, review = J('canonical/map-review.json').maps;
const cards = {}; J('canonical/cards.json').forEach(c=> cards[c.id] = c);
const topOf = {}; Object.entries(pools).forEach(([t, e])=>{ topOf[t] = t; Object.keys(e.submaps || {}).forEach(s=> topOf[s] = t); });
const ownList = k=>{ const t = topOf[k], e = pools[t] || {}; return k === t ? (e.cards || []) : ((e.submaps || {})[k] || []); };
const specialOf = k=> (pools[topOf[k]] || {}).special || [];
// 2026-11-05 (CONTENT10): LISTFIX2-1 b and LISTFIX2-2 b are applied: each fight got another card of its map's list and the cut card left that map's
// MAP and SPECIAL lists (CARD5's two first-clear cards too); only Wolfsbane Alpha stays on SPECIAL as 17-8's boss (LISTFIX2-2 a). Was: CARD5's two back.
const RESTORED = new Set([]);
// 2026-11-11 (LISTFIX3): a cut the owner picked Yes again on that map's list in his 11-11 picks is listed by his newer choice (mk Fishing Cat, mw Alley Cat, mw Marsh-mallow Hare)
const REPICKED = new Set(); Object.entries(J('docs/design/map-picks-owner-2026-11-11.json').maps).forEach(([k, p])=> (p.yes || []).forEach(id=> REPICKED.add(k + '|' + id)));
// 2026-11-12 (TESTFIX1): the owner's 11-12 Yes picks (the lists SKIR3 built) re-pick a cut card as the 11-11 ones did; SKIR3's own top-ups of cut cards (mo house-cat, mpd armadillo-guard) are NOT re-picks and stay flagged by the last check
Object.entries(J('docs/design/map-picks-owner-2026-11-12.json').maps).forEach(([k, p])=> (p.yes || []).forEach(id=> REPICKED.add(k + '|' + id)));
const LF2 = {mb: ['fiddler-crab-swarm', 'grey-seal-bull', 'tidepool-trapper-crab'], m2: ['old-sturgeon', 'stone-turtle-warden'], mw: ['venomlord-serpent', 'snapper-hatchling'], m8: ['marsh-wisp'], m5: ['weaver-bird'], m11: ['woodland-brawler'], mc: ['the-gannet-queen'], m3: ['yeti-chieftain']};

// ---------------------------------------------------------------- 1. the 11-01 export's cuts
const ex = J('docs/balance/owner-map-cards-export-2026-11-01.json');
let nCut = 0;
ex.lists.forEach(L=>{ const k = L.mapId && L.listKey === 'cards' ? L.mapId : L.listKey.slice(4);
  L.cutNow.forEach(id=>{ nCut++; const on = ownList(k).includes(id);
    if(REPICKED.has(k + '|' + id) && on){ pass++; return; }
    ok(RESTORED.has(k + '|' + id) ? on : !on, `${k}: the owner's 11-01 cut of ${id} ${RESTORED.has(k + '|' + id) ? 'is back by CARD5 (LISTFIX2-1 open)' : 'is applied'}`); }); });
ok(nCut === 37, `the 11-01 export holds 37 cuts (got ${nCut})`);

// ---------------------------------------------------------------- 2. the review's cut entries
const first = {}; { const i = src.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), j = src.indexOf('\n};', i);
  const re = /'([a-z0-9]+):([0-9A-Z-]+)'\s*:\s*'([a-z0-9-]+)'/g; let m; while((m = re.exec(src.slice(i, j)))) (first[m[1]] = first[m[1]] || new Set()).add(m[3]); }
ok(Object.keys(first).length > 10, 'SKIRMISH_FIRST_PACK_CARDS parsed');
let still = [], spec = []; const repicked = new Set();
const cutArc = (J('canonical/map-review.json').cutArchive || {}).maps || {}; // 2026-11-05 22:49 (owner: reset the Map cards cut lists): the cut entries moved to map-review.json cutArchive
Object.entries(review).forEach(([k, r])=>{ if(!topOf[k]) return; ((r.cut || []).concat(cutArc[k] || [])).forEach(e=>{
  if(ownList(k).includes(e.id) && REPICKED.has(k + '|' + e.id)) repicked.add(k + '|' + e.id);
  else if(ownList(k).includes(e.id)){ still.push(k + '|' + e.id); ok(!!e.statusWhy, `${k}: cut ${e.id} is still listed and says why (statusWhy)`); }
  else if(k === topOf[k] && specialOf(k).includes(e.id)){ spec.push(k + '|' + e.id);
    const s = (cards[e.id] || {}).source || {}, why = (s.kind === 'map' && s.id === k) || (first[k] && first[k].has(e.id));
    ok(why, `${k}: cut ${e.id} on SPECIAL is a fight's card of that map (boss / reward / first clear)`);
    ok(!!e.statusWhy, `${k}: cut ${e.id} on SPECIAL says why (statusWhy)`); } }); });
ok(still.sort().join() === [...RESTORED].sort().join(), `no cut card is still on its list (got ${still.join(', ')})`); // 2026-11-05 (CONTENT10): was the two CARD5 cards
// 2026-11-12 (TESTFIX1): was the three 11-11 picks by name; SKIR3's lists re-list more cuts (his 11-12 picks), so the rule is read generically: every cut listed again is one of his Yes picks (11-11 or 11-12)
ok([...repicked].length > 0 && [...repicked].every(x=> REPICKED.has(x)), `the cuts listed again are the owner's Yes picks (got ${[...repicked].sort().join(', ')})`); // 2026-11-11 (LISTFIX3)
ok(spec.join() === 'm6|wolfsbane-alpha', `only Wolfsbane Alpha is kept on SPECIAL for its fight (got ${spec.length}: ${spec.join(', ')})`); // 2026-11-05 (CONTENT10): was 11
Object.entries(LF2).forEach(([k, ids])=> ids.forEach(id=> ok(!(pools[k].cards || []).includes(id) && !(pools[k].special || []).includes(id), `CONTENT10: ${id} is off ${k}'s MAP and SPECIAL lists (LISTFIX2)`)));

// ---------------------------------------------------------------- 3. the panel
const ctx = {TX: (k, p)=> k + (p ? JSON.stringify(p) : ''), escapeAttr: s=> String(s), escapeHtml: s=> String(s), MP_EXTRA_LISTS: {mtut12: {map: 'mtut'}},
  MAP_POOLS_BASE: {maps: {ma: {}, mb: {}}}, mapPoolEdits: {}, mpMapById: id=> ({ma: {name: 'Alpha'}, mb: {name: 'Beta'}, ms: {name: 'Sub'}, mtut: {name: 'Tut'}})[id] || null, rvFlipTop: 'ma'};
const ENT = {ma: {cards: ['a1'], special: ['s1'], submaps: {ms: ['b1', 'x1']}}, mb: {cards: ['x1'], special: [], submaps: {mtut12: ['x2']}}};
ctx.mpEntry = t=> ENT[t];
vm.runInNewContext([fn('lf2ListOf'), fn('lf2CutStatus'), fn('lf2CutPillHTML'), 'this.st = lf2CutStatus; this.pill = lf2CutPillHTML;'].join('\n'), ctx);
ok(ctx.st('ma', 'cards', 'a1').k === 'listed', 'a cut on the MAP list reads listed');
ok(ctx.st('ma', 'sub:ms', 'b1').k === 'listed', 'a cut on its submap list reads listed');
ok(ctx.st('ma', 'cards', 's1').k === 'special', 'a cut off MAP but on SPECIAL reads special');
const r1 = ctx.st('ma', 'cards', 'x1'); ok(r1.k === 'removed' && r1.where.join() === 'Sub,Beta', `a removed cut names the lists still holding it (got ${r1.where})`);
const r2 = ctx.st('ma', 'cards', 'x2'); ok(r2.k === 'removed' && r2.where.join() === 'Tut', 'an extra list (T-1 / T-2) is named by its map');
ok(ctx.st('ma', 'cards', 'zz').where.length === 0, 'a cut on no list: removed, nowhere else');
ok(/ui\.lf2-listed/.test(ctx.pill({id: 'a1'}, 'cards')) && /ui\.lf2-special/.test(ctx.pill({id: 's1'}, 'cards')) && /ui\.lf2-removed-elsewhere-tip/.test(ctx.pill({id: 'x1'}, 'cards')) && /ui\.lf2-removed-tip/.test(ctx.pill({id: 'zz'}, 'cards')), 'the pill per status');
ok(ctx.pill({id: 'a1', statusWhy: 'WHY'}, 'cards').includes('WHY'), 'the entry\'s statusWhy joins the tooltip');
ok(/kind === 'cut' \? lf2CutPillHTML\(e, secKey\)/.test(fn('rv1TileHTML')), 'a Cut tile carries the status pill');
ok(/TX\('ui\.lf2-picks-note'\)/.test(fn('rv1TileHTML')) && !/TX\('ui\.lf2-picks-note'\)/.test(fn('pk1OpenMapCards')), 'the picks note is the Cut / Keep buttons\' tooltip, no standing text (2026-11-07, UI28 #2; was: the note under Copy my picks)');
ok(!/Apply my cuts/i.test(src), 'no "Apply my cuts" action (a live card_overrides write waits for "apply it")');

// ---------------------------------------------------------------- 4. texts and decisions
const KEYS = ['ui.lf2-listed', 'ui.lf2-listed-tip', 'ui.lf2-special', 'ui.lf2-special-tip', 'ui.lf2-removed', 'ui.lf2-removed-tip', 'ui.lf2-removed-elsewhere-tip', 'ui.lf2-picks-note'];
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const packs = {}; CODES.forEach(c=> packs[c] = J('lang/' + c + '.json'));
KEYS.forEach(k=>{ ok(typeof TEXT[k] === 'string' && TEXT[k], `${k} is a text`); CODES.forEach(c=> ok(typeof packs[c][TEXT[k]] === 'string' && packs[c][TEXT[k]], `${k} in ${c}`)); });
ok(/\{lists\}/.test(TEXT['ui.lf2-removed-elsewhere-tip'] || '') && CODES.every(c=> /\{lists\}/.test(packs[c][TEXT['ui.lf2-removed-elsewhere-tip']] || '')), '{lists} kept in every pack');
const dec = J('docs/decisions.json').items, ids = dec.map(x=> x.id);
ok(ids.includes('LISTFIX2-1') && ids.includes('LISTFIX2-2'), 'decisions LISTFIX2-1 and LISTFIX2-2');
ok(new Set(ids).size === ids.length, 'decision ids are unique');

console.log(fail ? `listfix2: ${fail} failed, ${pass} passed` : `listfix2: all ${pass} passed`);
process.exit(fail ? 1 : 0);
