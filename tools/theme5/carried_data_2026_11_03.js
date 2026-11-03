#!/usr/bin/env node
// 2026-11-03 (package THEME5, owner 11-03 09:39: "open Map 11+ to have +1 carried ... Map 21+ has -1 unique, they will have +2 carried ...
// Submaps will have +1 carried as well"): READ-ONLY helper for the carried-card proposal (docs/balance/theme5/carried-proposal-2026-11-03.md).
// Writes nothing outside docs/balance/theme5/. Per map list (main maps and side maps; not the tutorial lists, endless dungeons or tower):
// own / carried counts (own = the first list in road order that holds the card, THEME3's rule: lists ordered by the map a player reaches them
// on, mapUnlockNumberOf, a main map before its side maps; T-3 to T-5 is never a source; SPECIAL counts on a main map; Baby cards not counted),
// the THEME5 targets, the rarity cap (deckopt's mapRarityCap), the fights with their road targets (BAL13 summary 2026-11-03), the PRO / BPRO
// decks, and the carried candidates: on an earlier list, not on this one, deckable, not Baby, not a faction card, within the cap, obtainable by
// the map, not out of play; each with its theme fit (unit-themes biomes) and the skills it adds that the map's list and PRO / BPRO decks lack.
// Run: node tools/theme5/carried_data_2026_11_03.js [--print]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const opt = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const gm = opt.loadGame(ROOT), G = gm.G, D = gm.D;
const rd = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const pools = rd('canonical/map-pools.json').maps, pro = rd('canonical/pro-skirmishes.json').maps;
const review = rd('canonical/map-review.json').maps, summ = rd('docs/balance/bal13/summary-2026-11-03.json');
const ut = gm.themes, units = {}; (ut.units || []).forEach(u => { units[u.id] = u; });
const umap = {}; (ut.maps || []).forEach(m => { umap[m.id] = m; });
const bkin = {}; ut.vocab.biomes.forEach(b => { bkin[b.id] = new Set(b.kin || []); });
const more = ut.vocab.mapBiomesMore || {};
const SKIP = new Set(['mtut12', 'mtut', 'mm', 'muc', 'mlb']);
const step = r => G.roadRarityStep(r);
const isBaby = id => (D[id] || {}).kind === 'baby';
const effKeys = id => { const e = (D[id] || {}).effects || {}; return Object.keys(e).filter(k => e[k] !== false && e[k] != null && k !== 'triggers').concat((e.triggers || []).map(t => 'trig:' + (t.on || t.when || '?') + '/' + (t.do || '?'))); };
const desc = id => { const d = D[id]; if (!d) return id; const e = d.effects || {};
  const sk = Object.keys(e).filter(k => k !== 'triggers' && e[k] !== false && e[k] != null).map(k => e[k] === true ? k : k + ' ' + (typeof e[k] === 'object' ? JSON.stringify(e[k]) : e[k]));
  (e.triggers || []).forEach(t => sk.push('trig ' + [t.on || t.when, t.do, t.resource, t.amount || t.n].filter(x => x != null).join(':')));
  const cost = (d.cost || 0) + 'L' + (d.stoneCost ? '+' + d.stoneCost + 'S' : '') + (d.metalCost ? '+' + d.metalCost + 'M' : '');
  return `${d.name} (${d.rarity}, ${cost} W${d.wait == null ? '?' : d.wait} ${d.attack}/${d.health}${sk.length ? '; ' + sk.join(', ') : ''})`; };
const SUMLAB = {}; // filled below from the BAL13 summary
const label = (map) => { if (SUMLAB[map.id]) return SUMLAB[map.id]; const code = ((map.nodes || []).find(n => n.code) || {}).code || ''; return map.sub && /^\d+-[A-Z]+-/.test(code) ? code.replace(/-\d+$/, '') : String(G.mapNumberOf(map.id)); };

(summ.maps || []).forEach(p => { SUMLAB[p.id] = p.label; });
// ---- the lists in road order ----
const maps = G.CONQUEST_MAPS.filter(m => !m.reserved && !m.endless && !m.tower && !SKIP.has(m.id) && (m.sub ? (pools[m.parent] && (pools[m.parent].submaps || {})[m.id]) : pools[m.id]));
const L = maps.map((m, i) => { const side = !!m.sub; const ids = side ? pools[m.parent].submaps[m.id] : pools[m.id].cards;
  const unlock = side ? G.mapUnlockNumberOf(m.id) : G.mapNumberOf(m.id);
  return { id: m.id, map: m, side, parent: side ? m.parent : null, no: G.mapNumberOf(m.id), unlock, label: label(m), name: m.name, ids: ids.slice(), special: side ? [] : (pools[m.id].special || []), order: [unlock, side ? 1 : 0, i] }; });
const cmp = (a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.order[2] - b.order[2];
L.sort(cmp);
const t12 = pools.m1.submaps.mtut12 || [];
function firstListBefore(id, me) { if (t12.includes(id)) return 'mtut12'; for (const x of L) { if (x === me) return null; if (cmp(x, me) >= 0) return null; if (x.ids.includes(id) || x.special.includes(id)) return x.id; } return null; }

// ---- the rule ----
function rule(x) {
  if (x.side) return { tier: 'side', own: [1, 3], carriedNow: 10, carriedNew: 11, note: 'side map: +1 carried over today\'s 10+' };
  if (x.no <= 10) return { tier: '0-10', own: [8, 11], carriedNow: [4, 5], carriedNew: [4, 5], add: 0 };
  if (x.no <= 20) return { tier: '11-20', own: [8, 11], carriedNow: [4, 5], carriedNew: [5, 6], add: 1 };
  return { tier: '21+', own: [7, 10], carriedNow: [4, 5], carriedNew: [6, 7], add: 2 };
}
const fitOf = (id, x) => { const cb = new Set((units[id] || {}).biomes || []); const mk = x.id; const prim = new Set([(umap[mk] || {}).biome].filter(Boolean)), oth = new Set(more[mk] || []);
  const kin = new Set(); [...prim, ...oth].forEach(b => { (bkin[b] || new Set()).forEach(k => kin.add(k)); Object.keys(bkin).forEach(k => { if (bkin[k].has(b)) kin.add(k); }); });
  if ([...cb].some(b => prim.has(b))) return 4; if ([...cb].some(b => oth.has(b))) return 3; if ([...cb].some(b => kin.has(b))) return 1; return cb.size ? -3 : 0; };

const roadOf = {}; (summ.maps || []).forEach(p => { roadOf[p.id] = (p.roadLed || []).map(r => ({ code: r.code, kind: r.kind, name: r.name, target: r.target, win: r.win })); });
const out = [];
for (const x of L) {
  const own = [], carried = [], baby = [];
  x.ids.forEach(id => { if (isBaby(id)) baby.push(id); else (firstListBefore(id, x) ? carried : own).push(id); });
  const cap = opt.mapRarityCap(gm, x.map, 'map'), capStep = step(cap);
  const P = pro[x.id] || {}; const decks = [].concat((P.bpro || []).map(d => Object.assign({ kind: 'bpro' }, d)), (P.pro || []).map(d => Object.assign({ kind: 'pro' }, d)));
  const deckCards = new Set(); decks.forEach(d => Object.keys(d.deck).forEach(k => deckCards.add(k)));
  const haveSk = new Set(); x.ids.concat([...deckCards]).forEach(id => effKeys(id).forEach(k => haveSk.add(k)));
  const seen = new Set(), cands = [];
  for (const y of L) { if (cmp(y, x) >= 0) break; y.ids.concat(y.special).forEach(id => { if (seen.has(id) || x.ids.includes(id)) return; seen.add(id);
    const d = D[id]; if (!d || d.token || d.test || d.hidden || d.easterEgg || d.unattainable || d.cardType === 'spell' || d.cardType === 'equipment' || d.spell || d.equip || d.hero || d.pool) return;
    if (isBaby(id) || step(d.rarity) > capStep || id === 'wandering-traveller') return;
    let ob = 0; try { ob = (gm.obtain[id] == null ? 0 : gm.obtain[id]); } catch (e) {}
    if (ob > x.unlock) return;
    const cut = ((review[x.id] || {}).cut || []).find(c => c.id === id && c.by === 'owner');
    cands.push({ id, from: y.id, fromLabel: y.label, fit: fitOf(id, x), newSkills: effKeys(id).filter(k => !haveSk.has(k)), ownerCutHere: !!cut, desc: desc(id) }); }); }
  cands.sort((a, b) => (b.fit - a.fit) || (b.newSkills.length - a.newSkills.length) || a.id.localeCompare(b.id));
  out.push({ id: x.id, label: x.label, name: x.name, side: x.side, parent: x.parent, no: x.no, unlock: x.unlock, cap, rule: rule(x),
    counts: { total: x.ids.length, own: own.length, carried: carried.length, baby: baby.length }, own, carried, baby,
    list: x.ids.map(id => ({ id, desc: desc(id) })), fights: opt.fightsOf(x.map).map(n => { let t = null; try { t = G.skirmishTargetBand(x.id, n); } catch (e) {} const m = (roadOf[x.id] || []).find(r => r.code === (n.code || n.key));
      return { code: n.code || n.key, kind: n.kind, name: n.name, target: t && t.t != null ? Math.round(t.t * 1000) / 10 : null, curve: !!(t && t.curve), mapRefWin: m ? m.win : null }; }), // targets: arena_app.js skirmishTargetBand; mapRefWin: BAL13 summary 2026-11-03 (with leaders)
    decks: decks.map(d => ({ id: d.id, kind: d.kind, focus: d.focus, labels: d.labels, leaders: d.leaders, deck: d.deck })), candidates: cands });
}
const file = path.join(ROOT, 'docs', 'balance', 'theme5', 'carried-data-2026-11-03.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ about: 'THEME5 helper data (read-only): tools/theme5/carried_data_2026_11_03.js', built: '2026-11-03', lists: out.map(r => Object.assign({}, r, { candidates: r.candidates.map(({ desc, ...c }) => c) })) })); // candidates without their text (size); --print shows it
if (process.argv.includes('--print')) out.forEach(r => {
  console.log(`\n## ${r.label} ${r.name} [${r.id}] unlock ${r.unlock} cap ${r.cap} total ${r.counts.total} own ${r.counts.own} carried ${r.counts.carried} baby ${r.counts.baby}`);
  console.log('LIST: ' + r.list.map(c => (r.own.includes(c.id) ? '*' : '') + c.desc).join(' | '));
  console.log('DECKS: ' + r.decks.map(d => `${d.id}[${d.focus}; ${(d.labels || []).join('/')}] ${Object.entries(d.deck).map(([k, v]) => k + 'x' + v).join(',')}`).join(' || '));
  console.log('FIGHTS: ' + r.fights.map(f => `${f.code}:${f.kind}${f.target != null ? '@' + f.target : ''}`).join(' '));
  console.log('CANDS: ' + r.candidates.filter(c => c.fit >= 0).slice(0, 18).map(c => `[f${c.fit} ${c.fromLabel}${c.ownerCutHere ? ' OWNERCUT' : ''}] ${c.desc}${c.newSkills.length ? ' NEW:' + c.newSkills.join('/') : ''}`).join(' | '));
});
console.log('lists', out.length, '->', path.relative(ROOT, file));
