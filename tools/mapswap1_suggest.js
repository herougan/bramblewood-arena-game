#!/usr/bin/env node
// 2026-11-22 (package MAPSWAP1, owner 23:08: "I look forward to your new card suggestions and swapping that meets our agreed criteria"):
// writes canonical/map-swap-suggestions.json (rerunnable: node tools/mapswap1_suggest.js; needs a fresh index.html). Like tools/hub/map_skill_table.js it reads the
// built game in Playwright: per main map 0-20 the table row's skills no list card carries ("To add") and the skills New! on the map that are not in its row nor its
// Special / Faction column ("To remove", the game's own is-focus-remove tiles). Then, in Node:
//   add     2-4 existing cards that carry the skill, fit the map's theme (habitat / animal family of its list, unit-themes.json) and its rarity cap (roadRevealedCap), and
//           would not make the skill appear earlier (not on an earlier main list); preferred: on no list, then a later map's list (moved earlier), then a side map's list.
//           None fits: one new-card concept (CONCEPTS below; name, animal, rarity, one-line idea, no stats).
//   remove  per carrier: "move X from Map A to Map B" (B's row has the skill, B >= A where B has one, the move shows no new unlisted skill there), or "drop X from Map A
//           (also on Map C)"; plus a same-theme replacement for A when the list would go under its target (ui37Targets). A skill no row has cannot be fixed by a move.
// Each suggestion carries `yes` / `no` = [mapId, cardId] pairs the Map cards window sends through ui37SetFlag. Never touches cards.json or map-pools.json.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'canonical', 'map-swap-suggestions.json');
const U = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')), units = {}; U.units.forEach(u => { units[u.id] = u; });
const KIN = {}; U.vocab.biomes.forEach(b => { KIN[b.id] = b.kin || []; });
const biomeOfMap = {}; U.maps.forEach(m => { biomeOfMap[m.id] = m.biome; });
// new-card concepts where no existing card fits: "<map no>:<skill key>" -> {name, animal, family, element, rarity, role}
const CONCEPTS = {
  '2:shield': { name: 'Tideline Chiton', animal: 'chiton', family: 'mollusc', element: 'physical', rarity: 'common', role: 'A plated chiton clamped to a tide rock: a small body with Shield and no other skill (only the Armadillo Guard, a desert card from Map 18, carries Shield now).' },
  '17:momentum': { name: 'Floe Wolverine', animal: 'wolverine', family: 'mustelid', element: 'physical', rarity: 'rare', role: 'A tundra scrapper that finishes what the cold started: Momentum, no other skill (no card carries Momentum yet).' } };
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
(async () => {
  const pw = require('playwright'), b = await pw.chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(ROOT, 'index.html')); await p.waitForFunction(() => typeof MAP_FOCUS_SKILLS !== 'undefined' && typeof mpEntry === 'function', null, { timeout: 60000 });
  const G = await p.evaluate(() => {
    const defs = getCardDefs(), all = mainConquestMaps(), carry = (d, k) => { const e = (d && d.effects) || {}; return e[k] != null && e[k] !== false && e[k] !== 0; };
    const lists = all.map((m, n) => ({ n, id: m.id, ids: (mpEntry(m.id).cards || []).filter(i => defs[i]), sub: [].concat(...Object.values(mpEntry(m.id).submaps || {}).map(l => l || [])) }));
    const cards = {}; Object.keys(defs).forEach(id => { const d = defs[id]; const bad = !!(d.token || d.test || d.pool || (d.unattainable && !d.awaitingSource) || d.hero || d.derivedFrom || d.cardType || (d.faction && d.faction !== 'base') || cardKindOf(d) === 'baby' || isEasterEgg(d));
      cards[id] = { bad, awaiting: !!d.awaitingSource, name: d.name, rarity: d.rarity || 'common', step: roadRarityStep(d.rarity), keys: Object.keys(d.effects || {}).filter(k => k !== 'triggers' && carry(d, k)) }; });
    const maps = lists.slice(0, 21).map(r => { const row = (MAP_FOCUS_SKILLS[r.n] || []), tg = ui37Targets(r.id);
      const add = row.filter(k => !r.ids.some(i => carry(defs[i], k)) && skillDefOf(k)).map(k => ({ key: k, name: codexSkillName(k) }));
      pk1OpenMapCards(r.id); const rm = [...document.querySelectorAll('#ui19McSkills .is-focus-remove')].map(li => li.dataset.ui19Skill); const o = document.getElementById('pk1MapCardsOverlay'); if (o) o.remove();
      return { n: r.n, id: r.id, name: r.name = all[r.n].name, cap: roadRevealedCap(r.n), capStep: roadRarityStep(roadRevealedCap(r.n)), row, list: r.ids, target: tg.n || 0,
        add, rm: rm.map(k => ({ key: k, name: codexSkillName(k), carriers: r.ids.filter(i => carry(defs[i], k)) })) }; });
    const names = {}; Object.keys(defs).forEach(i => { names[i] = defs[i].name; });
    const skillNames = {}; [].concat(...maps.map(m => m.row)).concat(...maps.map(m => m.rm.map(x => x.key))).forEach(k => { skillNames[k] = codexSkillName(k); });
    return { maps, lists: lists.map(r => ({ n: r.n, id: r.id, capStep: roadRarityStep(roadRevealedCap(r.n)), ids: r.ids, sub: r.sub })), cards, skillNames, special: MAP_SPECIAL_SKILL_NAMES };
  });
  await b.close();
  const N = G.maps.length, nm = id => G.cards[id] ? G.cards[id].name : id, mapName = n => 'Map ' + n + ' ' + G.maps[n].name;
  const mainOf = {}; G.lists.forEach(l => l.ids.forEach(i => { (mainOf[i] = mainOf[i] || []).push(l.n); })); const sideOf = {}; G.lists.forEach(l => l.sub.forEach(i => { (sideOf[i] = sideOf[i] || []).push(l.n); }));
  const first = {}; G.lists.forEach(l => l.ids.forEach(i => ((G.cards[i] || {}).keys || []).forEach(k => { if (first[k] == null || l.n < first[k]) first[k] = l.n; })));
  const rowMaps = k => G.maps.filter(m => m.row.includes(k)).map(m => m.n);
  const fam = n => { const s = new Set(); G.lists[n].ids.forEach(i => { const u = units[i]; if (u) s.add(u.animalGroup || u.animal); }); return s; };
  // would the card, listed on Map n, show a skill that is New! there and in no row / Special column? (the skills it brings must be in n's row, shown earlier, or on n's list already)
  const clean = (id, n) => G.cards[id].keys.every(k => G.maps[n].row.includes(k) || (first[k] != null && first[k] < n) || G.lists[n].ids.some(i => i !== id && G.cards[i] && G.cards[i].keys.includes(k)));
  const theme = (id, n) => { const u = units[id] || {}, bio = u.biomes || [], mb = biomeOfMap[G.lists[n].id]; let s = 0; const why = [];
    if (bio.includes(mb)) { s += 6; why.push('a ' + String(mb).replace(/-/g, ' ') + ' creature'); } else if (bio.some(x => (KIN[mb] || []).includes(x) || (KIN[x] || []).includes(mb))) { s += 2; why.push('near ' + String(mb).replace(/-/g, ' ')); }
    const ag = u.animalGroup || u.animal; if (ag && fam(n).has(ag)) { s += 3; why.push('the ' + ag + ' family of the map\'s list'); } return { s, why: why.join(', ') }; };
  const usable = (id, n) => G.cards[id] && !G.cards[id].bad && G.cards[id].step <= G.maps[n].capStep && id !== 'moonlit-hare';
  // candidates for Map n that carry skill k
  const addCands = (n, k) => Object.keys(G.cards).filter(id => G.cards[id].keys.includes(k) && usable(id, n) && !(mainOf[id] || []).some(x => x < n) && !(mainOf[id] || []).includes(n)).map(id => { const t = theme(id, n), m = mainOf[id] || [], later = m.filter(x => x > n), side = sideOf[id] || [];
    const src = G.cards[id].awaiting ? 'new card awaiting placement' : m.length ? 'moves from Map ' + later[0] + ' (carried there)' : side.length ? 'from the side maps of Map ' + side[0] : 'on no list';
    const pri = G.cards[id].awaiting || !m.length && !side.length ? 3 : m.length ? 1 : 2, bad = clean(id, n) ? 0 : 1;
    return { id, s: t.s - bad * 8 + pri * 0.5 - Math.abs(G.cards[id].step - G.maps[n].capStep) * 0.3, t, src, bad, why: [t.why, G.cards[id].rarity, src].filter(Boolean).join(' · ') }; }).filter(x => x.t.s >= 2 && !x.bad).sort((a, b) => b.s - a.s || a.id.localeCompare(b.id));
  const replace = (n, gone) => { const k = new Set(gone), m = G.maps[n]; return Object.keys(G.cards).filter(id => !G.cards[id].bad && G.cards[id].step <= m.capStep && !m.list.includes(id) && !(mainOf[id] || []).length && clean(id, n) && id !== 'moonlit-hare' && !(sideOf[id] || []).length)
    .map(id => ({ id, t: theme(id, n) })).filter(x => x.t.s >= 5).sort((a, b) => b.t.s - a.t.s || a.id.localeCompare(b.id)).slice(0, 2).map(x => ({ id: x.id, why: x.t.why + ' · ' + G.cards[x.id].rarity + ' · on no list' })); };
  const own = m => m.list.filter(i => Math.min(...mainOf[i]) === m.n && !(G.maps[m.n].rmGone || []).includes(i)).length, maps = [], out0 = n => maps[n], tot = { add: 0, addCards: 0, addConcept: 0, rm: 0, rmMove: 0, rmKeep: 0, rmDrop: 0, rmStuck: 0 };
  G.maps.forEach(m => {
    const out = { n: m.n, id: m.id, name: m.name, cap: m.cap, list: m.list.length, newHere: own(m), target: m.target, add: [], remove: [] };
    m.add.forEach(a => { tot.add++; const c = addCands(m.n, a.key).slice(0, 4);
      if (c.length >= 1) { tot.addCards++; out.add.push({ key: a.key, skill: a.name, cards: c.map(x => ({ id: x.id, name: nm(x.id), rarity: G.cards[x.id].rarity, why: x.why })), yes: c.map(x => [m.id, x.id]), why: a.name + ' is in Map ' + m.n + '\'s table row and no card on the list carries it' }); }
      else { const cc = CONCEPTS[m.n + ':' + a.key]; tot.addConcept++; out.add.push({ key: a.key, skill: a.name, cards: [], concept: cc ? Object.assign({ id: 'concept-' + slug(cc.name), mapId: m.id, mapNo: m.n, skill: a.key }, cc) : null, why: 'no existing card carries ' + a.name + ' and fits Map ' + m.n + '\'s theme and rarity cap' }); } });
    const left = new Set(); // cards leaving this map
    m.rm.forEach(r => { r.carriers.forEach(id => { tot.rm++; const rows = rowMaps(r.key), sc = G.cards[id].step;
      let B = rows.filter(x => x > m.n)[0]; if (B == null) B = rows.filter(x => x < m.n).pop();
      const other = (G.lists.filter(l => l.n !== m.n && l.ids.some(i => i !== id && G.cards[i] && G.cards[i].keys.includes(r.key))).map(l => l.n)), atB = B != null ? G.lists[B].ids.filter(i => G.cards[i] && G.cards[i].keys.includes(r.key)) : [];
      let kind, why, to = null, also = null, late = false, self = false;
      const bAdd = B != null && B < m.n && out0(B).add.some(a => a.key === r.key && (a.cards.length || a.concept));
      if (bAdd) { kind = 'keep'; to = B; }
      else if ((mainOf[id] || []).some(x => x > m.n && (B != null ? x >= B : x > 20))) { kind = 'drop'; also = mainOf[id].find(x => x > m.n && (B != null ? x >= B : x > 20)); self = true; } // another list that is not itself a To remove (the row's map or later; no row: outside the table)
      else if (B != null && sc <= G.maps[B].capStep && clean(id, B) && theme(id, B).s >= 2) { kind = 'move'; to = B; }
      else { const L = G.lists.filter(l => l.n > 20 && biomeOfMap[l.id] && sc <= l.capStep && theme(id, l.n).s >= 2).sort((a, b) => theme(id, b.n).s - theme(id, a.n).s || a.n - b.n)[0]; if (L) { kind = 'move'; to = L.n; late = true; } else if (other.length) { kind = 'drop'; also = other.find(x => x > m.n) != null ? other.find(x => x > m.n) : other[0]; } else kind = 'stuck'; }
      if (kind === 'keep') { tot.rmKeep++; why = r.name + ' is New! here only because no card on Map ' + to + ' (whose row has it) carries it yet; the Map ' + to + ' add of ' + r.name + ' shows it first, so ' + nm(id) + ' stays'; }
      else if (kind === 'move') { tot.rmMove++; why = id && (nm(id) + ' carries ' + r.name + '; Map ' + to + '\'s table row has it, so it shows there as intended'); }
      else if (kind === 'drop') { tot.rmDrop++; why = self ? nm(id) + ' is already on Map ' + also + '\'s list, so it is not lost; ' + r.name + ' is not meant to be New! on Map ' + m.n : nm(id) + ' carries ' + r.name + ', which Map ' + also + '\'s list shows too; here it is New! outside the table row, so the card leaves the list (no later map fits it)'; }
      else { tot.rmStuck++; why = r.name + ' is in no map\'s table row and no other list shows it, so any list holding ' + nm(id) + ' marks it To remove; dropping it is the only fix from the cards'; }
      left.add(id);
      out.remove.push({ key: r.key, skill: r.name, card: id, cardName: nm(id), kind, to, also, text: kind === 'keep' ? 'keep ' + nm(id) + ' on Map ' + m.n + ' (Map ' + to + ' adds ' + r.name + ' first)' : kind === 'move' ? 'move ' + nm(id) + ' from Map ' + m.n + ' to Map ' + to + ' (' + (rows.includes(to) ? 'its row has ' + r.name : 'a later map, outside the table, that fits ' + nm(id)) + ')' : kind === 'drop' ? 'drop ' + nm(id) + ' from Map ' + m.n + (self ? ' (also on Map ' + also + ')' : ' (Map ' + also + ' shows ' + r.name + ' too)') : 'drop ' + nm(id) + ' from Map ' + m.n + ' (no row has ' + r.name + ')', why,
        yes: kind === 'move' ? [[G.lists[to].id, id]] : [], no: kind === 'keep' ? [] : [[m.id, id]] }); }); });
    const seen = {}; out.remove = out.remove.filter(x => { const o = seen[x.card]; x.keys = [x.key]; if (!o) { seen[x.card] = x; return true; } o.keys.push(x.key); o.skill += ', ' + x.skill; return false; }); // one row per card; its skills joined
    const lost = new Set(out.remove.map(x => x.card)).size, rep = lost && own(m) - out.remove.filter(x => x.kind !== 'keep' && Math.min(...mainOf[x.card]) === m.n).length < m.target ? replace(m.n, [...left]) : [];
    if (rep.length) out.replace = { for: [...new Set(out.remove.map(x => x.card))], cards: rep.map(x => ({ id: x.id, name: nm(x.id), why: x.why })), yes: rep.map(x => [m.id, x.id]), why: 'Map ' + m.n + '\'s New! cards would fall below its target of ' + m.target + ' after the removals; same theme, no new unlisted skill' };
    maps.push(out); });
  const stuckCards = maps.flatMap(o => o.remove.filter(x => x.kind === 'stuck').map(x => ({ n: o.n, card: x.cardName, skill: x.skill })));
  const file = { _about: 'MAPSWAP1 (2026-11-22): Claude\'s suggestions to cover the To add tiles and resolve the To remove tiles of the Map cards window, Maps 0-20. Regenerate: node tools/mapswap1_suggest.js. yes / no = [mapId, cardId] pairs sent through ui37SetFlag when the owner clicks Yes.',
    generated: new Date().toISOString().slice(0, 10), totals: tot, stuck: stuckCards, maps };
  fs.writeFileSync(OUT, JSON.stringify(file, null, 1) + '\n'); console.log('->', path.relative(ROOT, OUT), tot);
})().catch(e => { console.error(e); process.exit(1); });
