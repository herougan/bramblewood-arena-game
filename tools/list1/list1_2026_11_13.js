#!/usr/bin/env node
// 2026-11-13 (package LIST1, owner 11:08 #10 / #12 / #14), run after tools/list1/fold_picks_2026_11_13.js:
//   #10 LIST1_NEW_TARGETS (arena_app.js): a map whose NEW! count on the folded picks is over its default target keeps that count as its target.
//   #12 LIST1_SIDE_FIT (arena_app.js): per side map, the live cards that fit it as Carried: its biome (canonical/unit-themes.json), Claude's
//       side-map fits / adds (docs/design/side-map-cards-2026-11-10.json; its "off" cards never), an animal of one of its own cards
//       (canonical/animal-tags.json), its keyword skill (canonical/map-keywords.json), its main map's own NEW! cards (its home; SIDE1 leaned on them).
//   #14 the NEW! gaps (count under the target) and Claude's picks for them -> canonical/claude-new-cards.json `list1` (shown as "Claude's pick" in
//       the Map cards window; never a Yes). PICKS below: existing unused cards first, then concepts (existing skills only, no stats).
// NEW! counts follow the window: a main map's NEW! = its Yes cards (and Claude's admin adds) not Yes on an earlier main map (Maps 0-1: not a T-1 / T-2
// card) and not a side map's own card whose side map opens earlier; a side map's NEW! = its Yes cards not Yes on a main map up to the one it opens
// after. Baby cards never count. Record: docs/balance/list1/list1-2026-11-13.json.
//   node tools/list1/list1_2026_11_13.js [--dry]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DRY = process.argv.includes('--dry');
const L = require('../side1/lib_side1_2026_11_12.js'), { MAIN, SIDES, C, CARDS } = L, G = L.lb().G;
const PK = J('docs/design/map-picks-owner-2026-11-13.json').maps, P = L.pools();
const APP = path.join(ROOT, 'arena_app.js'); let src = fs.readFileSync(APP, 'utf8');
const ADM = JSON.parse(src.match(/const UI47_ADMIN_ADD = (\{.*?\});\n/)[1]);
const th6 = n => { const own = n <= 20 ? Math.round(10 - 2 * Math.max(0, n - 2) / 18) : n <= 40 ? Math.round(7 - (n - 21) / 19) : 5; return own; }; // the game's th6Targets own
const SIDE_OWN = 3; // ui37Targets, a side map
const uniq = a => [...new Set(a)];
const yesOf = k => uniq(((PK[k] || {}).yes || []).concat((ADM[k] || []).filter(id => !((PK[k] || {}).no || []).includes(id)))).filter(id => C[id]);
const tut = P.m1.submaps.mtut12;
const mainIdx = n => { const idx = new Map(); if (n <= 1) tut.forEach(id => idx.set(id, -1)); MAIN.forEach((k, i) => { if (i < n) yesOf(k).forEach(id => { if (!idx.has(id)) idx.set(id, i); }); }); return idx; };
const parentOf = s => Object.keys(P).find(t => (P[t].submaps || {})[s]);
const sideOwn = {}; SIDES.forEach(s => { const un = L.unlockOf(s), idx = mainIdx(un + 1); sideOwn[s] = { un, ids: uniq(yesOf(s).concat(P[parentOf(s)].submaps[s])).filter(id => !idx.has(id)) }; });
function counts(extra) { // extra: {mapId: [ids counted as Yes too]} (the picks, to check they close the gap)
  const out = {};
  MAIN.forEach((k, n) => { const idx = mainIdx(n), side = new Map(); SIDES.forEach(s => { if (sideOwn[s].un < n) sideOwn[s].ids.forEach(id => { if (!side.has(id)) side.set(id, s); }); });
    const y = uniq(yesOf(k).concat((extra[k] || []).filter(id => C[id]))), neu = y.filter(id => !idx.has(id) && !side.has(id) && !L.baby(id));
    out[k] = { mapNo: n, own: neu, sideCarried: y.filter(id => !idx.has(id) && side.has(id)).map(id => ({ id, from: side.get(id) })), dflt: th6(n) }; });
  SIDES.forEach(s => { const idx = mainIdx(sideOwn[s].un + 1), y = uniq(yesOf(s).concat((extra[s] || []).filter(id => C[id])));
    out[s] = { sub: true, unlockAfterNo: sideOwn[s].un, own: y.filter(id => !idx.has(id) && !L.baby(id)), dflt: SIDE_OWN,
      sharedWith: SIDES.filter(t => t !== s && y.some(id => !idx.has(id) && sideOwn[t].ids.includes(id))) }; });
  return out;
}
// Claude's picks for the gaps (#14). kind: lumber (gatherer) / payoff / basic / theme; skill: the existing skill it uses (none = vanilla)
const PICKS = {
  m21: { picks: [{ id: 'talus-pika', role: 'lumber', why: 'Lumber gatherer (Delivery 1): the summit has no Lumber maker of its own; a pika haying on the talus. On no list today.' }],
    concepts: [{ name: 'Summit Tahr', animal: 'tahr', family: 'goat', element: 'physical', rarity: 'uncommon', role: 'Lumber payoff: costs 2 Lumber, a big plain body, Mountain Climber (the map\'s own skill; no new skill)', skill: 'mountainClimber', why: 'payoff for the Lumber gatherers; a rested mountain grazer above the clouds' }] },
  mv: { concepts: [{ name: 'Old Aerie Nest', animal: 'swift', family: 'bird', element: 'physical', rarity: 'rare', role: 'Lumber gatherer and wall: no attack, a tall nest of a thousand springs\' twigs, Delivery (twigs into Lumber)', skill: 'delivery', why: 'the oldest nests themselves; the side map has no Lumber maker; could be 11-A-4\'s themed reward (decision SIDE1-2)' }] },
  m9: { picks: [{ id: 'malachite-golem', role: 'basic', why: 'only if Granite Ox Golem stays Volcano Lair\'s own (decision LIST1-1): a foundry golem, Shell (Stalactite Golem\'s skill, already Carried here). On no list today.' }] },
};
const cid = name => 'concept-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const extra = {}; Object.entries(PICKS).forEach(([k, v]) => { extra[k] = (v.picks || []).map(p => p.id); });
const now = counts({}), after = counts(extra);
// #10 targets
const TARGETS = {}; Object.entries(now).forEach(([k, r]) => { if (r.own.length > r.dflt) TARGETS[k] = r.own.length; });
// #12 fit
const UT = J('canonical/unit-themes.json'), UB = {}; UT.units.forEach(u => { if (u.status === 'live') UB[u.id] = u.biomes || []; });
const SB = {}; UT.maps.forEach(m => { SB[m.id] = m.biome; });
const AT = {}; J('canonical/animal-tags.json').cards.forEach(r => { if (r.animal) AT[r.id] = r.animal; });
const KW = J('canonical/map-keywords.json').keywords, SMC = J('docs/design/side-map-cards-2026-11-10.json');
const live = CARDS.filter(c => UB[c.id] && !c.token && !c.test && !c.pool && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && !(c.faction && c.faction !== 'base'));
const FIT = {}, WHY = {};
SIDES.forEach(s => { const m = SMC[s] || {}, prop = new Set((m.fits || []).concat((m.add || []).map(e => e.id))), off = new Set((m.off || []).map(e => e.id)), B = SB[s];
  const animals = new Set(sideOwn[s].ids.map(id => AT[id]).filter(Boolean)), kw = KW[s], par = parentOf(s), home = new Set(now[par].own);
  const why = c => prop.has(c.id) ? 'proposal' : off.has(c.id) ? '' : (UB[c.id] || []).includes(B) ? 'biome' : home.has(c.id) ? 'home' : animals.has(AT[c.id]) ? 'animal' : kw && (c.effects || {})[kw] != null ? 'keyword' : '';
  FIT[s] = live.filter(c => why(c)).map(c => c.id).sort(); WHY[s] = { biome: B, home: par, animals: [...animals].sort(), keyword: kw || null, off: [...off] }; });
// the Carried group before / after (#12): main-map Yes cards up to the unlock map, as suggestions (not on the side list, not flagged)
const shrink = {}; SIDES.forEach(s => { const idx = mainIdx(sideOwn[s].un + 1), listed = new Set(uniq(P[parentOf(s)].submaps[s].concat(yesOf(s)))), fit = new Set(FIT[s]);
  const sug = [...idx.keys()].filter(id => C[id] && !listed.has(id)); shrink[s] = { before: sug.length, after: sug.filter(id => fit.has(id)).length, dropped: sug.filter(id => !fit.has(id)).length }; });
// report
const rows = MAIN.concat(SIDES).map(k => { const r = now[k], a = after[k], target = Math.max(r.dflt, TARGETS[k] || 0), gap = Math.max(0, target - r.own.length), p = PICKS[k] || {};
  return { id: k, name: L.mapName(k), mapNo: r.mapNo, sub: !!r.sub, unlockAfterNo: r.unlockAfterNo, newNow: r.own.length, dflt: r.dflt, target, gap, newAfterPicks: a.own.length + (p.concepts || []).length,
    sideCarried: r.sideCarried || [], sharedWith: r.sharedWith || [], picks: (p.picks || []).map(x => x.id), concepts: (p.concepts || []).map(x => x.name) }; });
rows.forEach(r => console.log(`${(r.sub ? 'side ' + r.id : 'Map ' + r.mapNo).padEnd(9)} ${r.name.slice(0, 22).padEnd(22)} NEW! ${r.newNow}/${r.target}${r.target > r.dflt ? ' (was ' + r.dflt + ')' : ''}${r.gap ? ' GAP ' + r.gap + ' -> ' + r.newAfterPicks : ''}${r.picks.length + r.concepts.length && !r.gap ? ' (picks: ' + r.picks.concat(r.concepts).join(', ') + ')' : ''}${r.sideCarried.length ? ' | side cards Carried: ' + r.sideCarried.map(x => x.id + '<' + x.from).join(' ') : ''}${r.sharedWith.length ? ' | shares NEW! with ' + r.sharedWith : ''}`));
SIDES.forEach(s => console.log(`fit ${s}: ${FIT[s].length} cards; Carried suggestions ${shrink[s].before} -> ${shrink[s].after}`));
if (DRY) { console.log('dry run'); process.exit(0); }
// write
const put = (name, obj) => { const re = new RegExp('^const ' + name + ' = \\{.*?\\};$', 'm'); if (!re.test(src)) throw new Error(name + ' not found'); src = src.replace(re, () => 'const ' + name + ' = ' + JSON.stringify(obj).replace(/","/g, '", "').replace(/":\[/g, '": [').replace(/\],"/g, '], "').replace(/,"/g, ', "') + ';'); };
put('LIST1_NEW_TARGETS', TARGETS); put('LIST1_SIDE_FIT', FIT);
fs.writeFileSync(APP + '.list1tmp', src); fs.renameSync(APP + '.list1tmp', APP);
// claude-new-cards.json: the `list1` key is written as text at the end (JSON.stringify would move the skillrec map's number keys first)
const CN = path.join(ROOT, 'canonical', 'claude-new-cards.json'), cn = {};
cn.list1 = { _about: 'LIST1 (2026-11-13, owner 11:08 #14): Claude\'s picks for each map\'s NEW! gap after his side-map picks (target: the default, or the count where it was over, #10). Shown as "Claude\'s pick" in the admin Map cards window, never as his Yes. picks: existing cards (on no list); concepts: no stats, existing skills only (he designs them). Built by tools/list1/list1_2026_11_13.js; doc docs/balance/list1-2026-11-13.md.' };
Object.entries(PICKS).forEach(([k, v]) => { const r = rows.find(x => x.id === k);
  cn.list1[k] = { name: r.name, gap: r.gap, target: r.target, picks: (v.picks || []).map(p => ({ id: p.id, role: p.role, why: p.why })), concepts: (v.concepts || []).map(c => Object.assign({ id: cid(c.name) }, c)) }; });
{ let t = fs.readFileSync(CN, 'utf8'); const at = t.indexOf(',\n "list1": '); t = at >= 0 ? t.slice(0, at) + '\n}\n' : t;
  fs.writeFileSync(CN, t.replace(/\n\}\n$/, ',\n "list1": ' + JSON.stringify(cn.list1, null, 1).replace(/\n/g, '\n ') + '\n}\n')); }
const RECF = path.join(ROOT, 'docs', 'balance', 'list1', 'list1-2026-11-13.json');
fs.writeFileSync(RECF, JSON.stringify({ about: 'LIST1 gaps, targets (#10), side-map Carried fit (#12), picks (#14); tools/list1/list1_2026_11_13.js', built: '2026-11-13', targets: TARGETS, maps: rows, sideFit: WHY, carriedShrink: shrink }, null, 1) + '\n');
console.log('-> arena_app.js LIST1_NEW_TARGETS / LIST1_SIDE_FIT, canonical/claude-new-cards.json list1, ' + path.relative(ROOT, RECF));
