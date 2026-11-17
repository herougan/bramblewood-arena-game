// REDESIGN3 generator (2026-11-17): node gen.js <ranks.json> <out.json>
// Applies plan.js to today's Maps 0-20 cards, checks the budget (tools/skill_costs.js budget().ok at Level 1), the owner's focus New! rule and the rank rules.
const fs = require('fs');
const L = require('./lib3.js');
const P = require('./plan.js');
const RANKS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OBTAIN = require(L.ROOT + '/canonical/card-obtain-maps.json').maps;
const MAPNAMES = ['Bramblewood Outskirts', 'Thistlewood', 'Pebble Beach', 'Gannet Cliffs', 'Sunken Hollow', 'Gatorback Swamp', 'Sable Swampmire', 'The Morel Hollow', 'Caves & Alcoves', 'The Kelp Mangroves', 'Coral Current', 'Eyrie Heights', 'The Briar Maze', 'The Redwood Deep', 'Savanna Reaches', 'The Long Grass', 'The Pinewood Taiga', 'Wolfsbane Tundra', 'The Glass Dunes', 'Ashen Spurn', 'The Sundered Peak'];
const FOCUS = Object.assign({}, L.FOCUS, P.FOCUS_OVERRIDE);
const LIGHT = new Set(['flying', 'tide', 'diurnal', 'nocturnal']);
const KEEP = new Set(['triggers', 'onDeathSpawn', 'injured', 'purblind', 'bounty']);
// skills the owner named outside the focus column (Special/Faction, More ideas): allowed where named
const NAMED = new Set([].concat(...Object.values(L.SPECIAL), ...Object.values(L.MORE)));
const rankOf = id => { const r = RANKS[id] || RANKS[{arrowFlaming: 'arrow', darksight: 'darksight', bloomCopy: 'bloomCopy'}[id]] || null; return r ? r.ii : null; };
// budget: new mechanics priced by a proxy until they have a price
const PROXY = eff => { const e = Object.assign({}, eff); if (e.paralysisPowder != null) { e.sleepPowder = (Number(e.paralysisPowder) || 1) + 1; delete e.paralysisPowder; } return e; };
const r1 = v => Math.round(v * 10) / 10;
function bud(c, eff, A, H, om) {
  const b = L.T.budget(Object.assign({}, c, {effects: PROXY(eff), attack: A, health: H, obtainMap: om}), {level: 1});
  return {ok: b.ok, fill: r1(100 * Math.max(b.x1 / b.N, b.x2 / b.N2)), N: b.N, x1: r1(b.x1), x2: r1(b.x2), N2: b.N2, missing: b.missing};
}
// closest legal stats (fewest 3A + H moved, then least Attack moved); never below half; a 0-Attack card stays 0
function fit(c, eff, om) {
  const A0 = c.attack || 0, H0 = c.health || 0; let best = null;
  for (let A = A0 === 0 ? 0 : Math.max(Math.ceil(A0 / 2), 1); A <= A0; A++) for (let H = Math.ceil(H0 / 2); H <= H0; H++) {
    const b = bud(c, eff, A, H, om); if (!b.ok) continue;
    const key = 3 * (A0 - A) + (H0 - H), k2 = A0 - A;
    if (!best || key < best.key || (key === best.key && k2 < best.k2)) best = {A, H, b, key, k2};
  }
  return best;
}
const same = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});
const label = eff => { const p = []; Object.entries(eff || {}).forEach(([k, v]) => {
  if (k === 'triggers') { (v || []).forEach(t => p.push(({onKill: 'On Kill', onSpawn: 'On Spawn', onHit: 'On Hit', onAttack: 'On Attack', onAttacked: 'On Attacked', onReady: 'On Ready', onDeath: 'On Death', onAction: 'On Action', onAllyDie: 'On Ally Death'}[t.on] || t.on) + ': ' + (t.do === 'gain' ? 'Deliver ' + (t.amount || 1) + ' ' + t.resource : t.do))); return; }
  if (k === 'onDeathSpawn') { p.push('On Death: spawn ' + (v.count || 1) + ' ' + v.defId); return; }
  const id = L.skillId(k, v); let n = L.nameOf(id);
  const num = typeof v === 'number' ? v : (v && typeof v === 'object' && !Array.isArray(v) && v.v != null && !Array.isArray(v.v) ? v.v : (Array.isArray(v) && v.every(x => typeof x === 'number') ? v.join('/') : null));
  if (id === 'swarm' && Array.isArray(v)) n += ' (' + v.join(', ') + ')';
  if (id === 'fortify' && v && v.armor) n += ' (Armor ' + v.armor + ')';
  p.push(n + (num != null && id !== 'darksight' ? ' ' + num : ''));
}); return p.length ? p.join(', ') : 'vanilla'; };
const counted = eff => Object.keys(eff || {}).filter(k => !LIGHT.has(k) && !KEEP.has(k)).length;
// --- the cards after the plan
const road = L.roadCards();
const finalMap = {}; road.forEach(r => finalMap[r.id] = r.map);
Object.entries(P.MOVES).forEach(([id, m]) => finalMap[id] = m.to);
const ids = Object.keys(finalMap).sort((a, b) => finalMap[a] - finalMap[b] || road.findIndex(r => r.id === a) - road.findIndex(r => r.id === b));
const cards = [];
ids.forEach(id => {
  const c = L.BYID[id]; if (!c) throw new Error('no card ' + id);
  const map = finalMap[id], mv = P.MOVES[id], before = c.effects || {}, pr = P.PROPOSED[id], eff = pr ? pr[0] : before;
  const today = road.find(r => r.id === id);
  const omNow = OBTAIN[id] != null ? OBTAIN[id] : 0, om = mv ? map : omNow;
  const b0 = bud(c, before, c.attack, c.health, omNow);
  let A = c.attack, H = c.health, b = bud(c, eff, A, H, om), flags = [];
  const changed = !same(before, eff) || !!mv;
  if (changed && !b.ok) { const f = fit(c, eff, om); if (f) { A = f.A; H = f.H; b = f.b; } else flags.push('no legal stats'); }
  if (!changed && !b.ok) flags.push('over budget today, unchanged');
  if (counted(eff) > 2) flags.push('three counted skills');
  if (b.missing && b.missing.length) flags.push('unpriced: ' + b.missing.join(', '));
  if (id === 'worker-ant' && L.baseLevel(c) !== 0) flags.push('Worker Ant not Level 0');
  cards.push({id, name: c.name, map, mapName: MAPNAMES[map], from: mv ? mv.from : today.map, moved: !!mv, moveWhy: mv ? mv.why : '', rarity: c.rarity, kind: c.kind || '', baseLevel: L.baseLevel(c),
    owner: L.OWNER.has(id), wait: c.wait || 0, cost: c.cost || 0, skillsChanged: !same(before, eff), changed, statsMoved: A !== c.attack || H !== c.health,
    before: {effects: before, attack: c.attack, health: c.health, fill: b0.fill, ok: b0.ok, obtainMap: omNow}, effects: eff, attack: A, health: H, fill: b.fill, ok: b.ok, N: b.N, obtainMap: om,
    skillsNow: label(before), skillsProposed: label(eff), why: pr ? pr[1] : (mv ? 'unchanged skills' : ''), flags});
});
const BY = {}; cards.forEach(c => BY[c.id] = c);
// --- focus New! and carriers
const met = c => L.metSkills(L.BYID[c.id], c.effects);
const focus = Object.keys(FOCUS).map(Number).map(m => ({map: m, name: MAPNAMES[m], skills: FOCUS[m].map(s => {
  const carriers = cards.filter(c => c.map === m && met(c).has(s)).map(c => c.id);
  const earlier = cards.filter(c => c.map < m && met(c).has(s)).map(c => c.id + ' (Map ' + c.map + ')');
  const built = !P.MECHANICS.some(x => x[1] === 'missing' && x[0].toLowerCase().startsWith(L.nameOf(s).toLowerCase()));
  return {key: s, name: L.nameOf(s), carriers, earlier, isNew: !earlier.length && carriers.length > 0, felt: carriers.length >= 2, built, ii: rankOf(s)};
}), special: (L.SPECIAL[m] || []).map(L.nameOf), more: (L.MORE[m] || []).map(L.nameOf), field: L.FIELDS[m] || ''}));
// --- rank rules on the final main cards
const focusMapOf = {}; Object.entries(FOCUS).forEach(([m, ks]) => ks.forEach(k => { if (focusMapOf[k] == null) focusMapOf[k] = +m; }));
const allCarriers = {}; cards.forEach(c => met(c).forEach(s => (allCarriers[s] = allCarriers[s] || []).push(c.id)));
const violations = [];
cards.forEach(c => Object.entries(c.effects).forEach(([k, v]) => {
  if (KEEP.has(k)) return; const s = L.skillId(k, v);
  if (P.NOT_FEATURED[s]) { violations.push(c.id + ': ' + s + ' not featured'); return; }
  if (s === 'leader' || s === 'bolt') { violations.push(c.id + ': ' + s + ' pushed out'); return; }
  if (focusMapOf[s] != null) { if (c.map < focusMapOf[s] && met(c).has(s)) violations.push(c.id + ': ' + s + ' before its focus map ' + focusMapOf[s]); return; }
  if (NAMED.has(s)) return;
  const ii = rankOf(s);
  if (ii == null) { violations.push(c.id + ': ' + s + ' unranked'); return; }
  if (ii >= 4 && (allCarriers[s] || []).length > 1) violations.push(c.id + ': ' + s + ' II ' + ii + ' on ' + allCarriers[s].length + ' cards');
}));
// --- special / faction carriers
const special = Object.entries(P.SPECIAL).map(([key, s]) => ({key, name: L.nameOf(key), map: s.map, carriers: s.carriers.map(x => {
  const c = L.BYID[x.id]; if (!c) throw new Error('no card ' + x.id);
  const main = BY[x.id]; const eff = main ? main.effects : (x.eff || c.effects || {}); const om = OBTAIN[x.id] != null ? OBTAIN[x.id] : 0;
  let A = main ? main.attack : c.attack, H = main ? main.health : c.health, b = main ? {fill: main.fill, ok: main.ok} : bud(c, eff, A, H, om);
  if (!main && x.eff && !b.ok) { const f = fit(c, eff, om); if (f) { A = f.A; H = f.H; b = f.b; } }
  return {id: x.id, name: c.name, where: x.where, why: x.why, changed: !!x.eff && !main, skillsNow: label(c.effects || {}), skillsProposed: label(eff), effects: eff, before: {attack: c.attack, health: c.health}, attack: A, health: H, fill: b.fill, ok: b.ok, rarity: c.rarity};
})}));
// --- per map counts and rarity mix
const mix = (list) => { const o = {}; list.forEach(c => o[c.rarity] = (o[c.rarity] || 0) + 1); return o; };
const maps = MAPNAMES.map((nm, m) => ({map: m, name: nm, before: road.filter(r => r.map === m).length, after: cards.filter(c => c.map === m).length,
  mixBefore: mix(road.filter(r => r.map === m).map(r => L.BYID[r.id])), mixAfter: mix(cards.filter(c => c.map === m))}));
const counts = {cards: cards.length, today: road.length, changed: cards.filter(c => c.changed).length, skillsChanged: cards.filter(c => c.skillsChanged).length, moved: cards.filter(c => c.moved).length,
  unchanged: cards.filter(c => !c.changed).length, statsMoved: cards.filter(c => c.statsMoved).length, changedOk: cards.filter(c => c.changed && c.ok).length, ownerChanged: cards.filter(c => c.changed && c.owner).length,
  specialChanged: special.reduce((n, s) => n + s.carriers.filter(x => x.changed).length, 0),
  focusSkills: focus.reduce((n, f) => n + f.skills.length, 0), focusNew: focus.reduce((n, f) => n + f.skills.filter(s => s.isNew).length, 0), focusFelt: focus.reduce((n, f) => n + f.skills.filter(s => s.isNew && s.felt).length, 0)};
const out = {package: 'REDESIGN3', date: '2026-11-17', status: 'proposal (owner ticks or edits; not folded)',
  source: {proposal: 'docs/design/owner-proposal-2026-11-17.xlsx, sheet Proposal (owner 11-17 23:05); ranks: its Skills sheet, column II', rules: 'OWN-1117-2 (owner 11-17 23:14): Rend and Enfeeble not featured; Sturdy and Mighty card passives only',
    cards: 'canonical/cards.json', lists: 'canonical/map-pools.json (main maps 0-20; a card counts on the first list that holds it)', budget: 'tools/skill_costs.js budget(card).ok at Level 1; obtain map = canonical/card-obtain-maps.json (0 when absent), the new map for a moved card; Paralysis Powder N priced as Sleeping Powder N+1'},
  counts, notFeatured: P.NOT_FEATURED, focus, special, upgraders: P.UPGRADERS, mechanics: P.MECHANICS.map(([name, state, spec]) => ({name, state, spec})), maps, violations, cards};
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(JSON.stringify(counts));
console.log('violations', violations.join(' | '));
focus.forEach(f => console.log(f.map, f.skills.map(s => s.name + (s.isNew ? '' : '!NOTNEW[' + s.earlier.join(',') + ']') + ':' + s.carriers.length).join(' ; ')));
console.log('flags', cards.filter(c => c.flags.length).map(c => c.id + ' ' + c.flags.join('; ')).join('\n'));
console.log('not ok changed', cards.filter(c => c.changed && !c.ok).map(c => c.id));
console.log('special not ok', special.flatMap(s => s.carriers.filter(x => !x.ok).map(x => x.id + ' ' + x.fill)));
console.log(maps.map(m => m.map + ':' + m.before + '->' + m.after).join(' '));
