#!/usr/bin/env node
// 2026-11-22 (package PACKSET1): writes canonical/pack-bonus-suggestions.json (rerunnable: node tools/packset1_suggest.js)
//   bonus    3 per map (Maps 0-24): cards on no map list, in no fight deck / reward (every node of every map), not the owner's Yes picks, not an Easter egg, token,
//            faction, Baby, equipment or raid card; chosen by the map's biome (unit-themes), the animals already on the map's lists, and the map's budget step.
//            The owner picks YES / NO and the map in the Pack Editor's "All cards" panels; 2 per map is the ask, the third is the spare.
//   tutorial dozens per faction (otters, hummingbirds): low-rarity cards (base, faction, unlisted or listed commons) that fit the faction's animals.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const LB = require(path.join(__dirname, 'lib_bramble.js')), G = LB.G, LP = require(path.join(__dirname, 'lib_map_pools.js')), D = LB.CARD_DEFS_BASELINE;
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
const pools = J('canonical/map-pools.json'), U = J('canonical/unit-themes.json'), picks = J('docs/design/map-picks-owner-2026-11-13.json').maps, units = {};
U.units.forEach(u => { units[u.id] = u; });
const RAR = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'legendary', 'mythic', 'divine', 'ancient', 'unique'], rar = d => Math.max(0, RAR.indexOf(d.rarity || 'common'));
const nodeBlob = JSON.stringify(G.CONQUEST_MAPS.map(m => m.nodes)), listed = LP.listedIds(pools), yes = new Set();
Object.values(picks).forEach(e => (e.yes || []).forEach(i => yes.add(i)));
// decks the game builds or keeps outside CONQUEST_MAPS nodes: the Babel Spire's pools, the ambush and tutorial decks (they count as fights too)
const appSrc = rd('arena_app.js'), builtIn = new Set(); ['TOWER_POOLS', 'TOWER_LUMBER_POOL', 'AMBUSH_DECKS', 'TUTORIAL_FIXED_DECKS', 'TUTORIAL_RIVAL_DECKS'].forEach(n => { const i = appSrc.indexOf('const ' + n + ' ='); if (i < 0) return; (appSrc.slice(i, appSrc.indexOf(';\n', i)).match(/['"][a-z0-9][a-z0-9-]*['"]/g) || []).forEach(x => builtIn.add(x.slice(1, -1))); });
const inFight = id => builtIn.has(id) || nodeBlob.includes('"' + id + '"');
const plain = d => !d.token && !d.test && !d.hero && !d.derivedFrom && !d.cardType && d.kind !== 'baby' && d.rarity !== 'starter' && !(d.source && d.source.kind === 'easteregg');
const cand = Object.values(D).filter(d => { const k = (d.source || {}).kind; if (!plain(d) || d.faction || d.basicSet) return false; if (k && k !== 'pack') return false;
  if (k === 'pack' && !(parseInt(d.source.tier, 10) >= 1 && parseInt(d.source.tier, 10) <= 10)) return false;
  return !listed.has(d.id) && !inFight(d.id); }); // 2026-11-24 (CARDS1, owner 2026-11-23 23:39 #12): a card taken out of the map lists (a Yes pick no longer listed, e.g. the Camouflage Frog) may be a bonus card; was: not a Yes pick at all
const KIN = {}; U.vocab.biomes.forEach(b => { KIN[b.id] = b.kin || []; });
const maps = U.maps.filter(m => !m.sub && m.no <= 24).sort((a, b) => a.no - b.no);
const mapAnimals = m => { const e = pools.maps[m.id] || {}, s = new Set(); [].concat(e.cards || [], ...Object.values(e.submaps || {})).forEach(id => { const u = units[id]; if (u) s.add(u.animalGroup || u.animal); }); return s; };
const score = (d, m, an) => { const u = units[d.id] || {}, bio = u.biomes || []; let s = 0; const why = [];
  if (bio.includes(m.biome)) { s += 6; why.push('a ' + m.biome.replace(/-/g, ' ') + ' creature'); } else if (bio.some(b => (KIN[m.biome] || []).includes(b) || (KIN[b] || []).includes(m.biome))) { s += 2; why.push('near ' + m.biome.replace(/-/g, ' ')); }
  const ag = u.animalGroup || u.animal || d.animal; if (an.has(ag)) { s += 3; why.push('the ' + ag + ' family of the map\'s lists'); }
  if (u.firstMap != null) { const gap = u.firstMap - m.no; if (gap > 1) s -= 2 * gap; else if (Math.abs(gap) <= 2) { s += 1; why.push('budget fits Map ' + u.firstMap); } }
  s -= Math.abs(rar(d) - (1 + m.no / 5)) * 1.2; return {s, why: why.join(', ') + (why.length ? ' · ' : '') + (d.rarity || 'common')}; };
// 2026-11-24 (CARDS1, owner #12): a bonus card may carry a skill first introduced on a later map only when it is placed in the pack holding that later map (it then belongs to that
// pack); an earlier pack's card never carries a later pack's skill. Skill -> first map = MAP_FOCUS_SKILLS (arena_app.js); pack = the zone of canonical/pack-plan.json.
const FOCUS = eval('(' + (appSrc.match(/const MAP_FOCUS_SKILLS = (\{[^\n]*?\});/) || [0, '{}'])[1] + ')'), firstMapOf = {};
Object.keys(FOCUS).map(Number).sort((a, b) => a - b).forEach(n => FOCUS[n].forEach(k => { if (firstMapOf[k] == null) firstMapOf[k] = n; }));
const ZONES = J('canonical/pack-plan.json').zones, zoneOf = n => { const z = ZONES.find(z => n >= z.maps[0] && n <= z.maps[1]); return z ? z.id : 'D'; };
const RAW = Object.fromEntries(J('canonical/cards.json').map(c => [c.id, c]));
const skillKeys = id => { const c = RAW[id] || {}, ks = new Set(Object.keys(c.effects || {})); Object.values(c.levelSkills || {}).forEach(o => Object.keys(o).forEach(k => ks.add(k))); Object.values(c.levelBonus || {}).forEach(o => Object.keys(o.skills || {}).forEach(k => ks.add(k))); return [...ks]; };
const skillMap = id => Math.max(-1, ...skillKeys(id).map(k => firstMapOf[k] == null ? -1 : firstMapOf[k]));
const gated = (d, m) => { const sm = skillMap(d.id); return sm >= 0 && zoneOf(m.no) < zoneOf(sm); };
const take = new Set(), out = [], ranked = {};
maps.forEach(m => { const an = mapAnimals(m); ranked[m.id] = cand.filter(d => !gated(d, m)).map(d => Object.assign({d}, score(d, m, an))).filter(x => x.s > -4).sort((a, b) => b.s - a.s || a.d.id.localeCompare(b.d.id)); });
for (let r = 0; r < 3; r++) maps.slice().sort((a, b) => ranked[a.id].length - ranked[b.id].length).forEach(m => { const x = ranked[m.id].find(y => !take.has(y.d.id)); if (!x) return; take.add(x.d.id); out.push({id: x.d.id, map: m.id, mapNo: m.no, why: x.why}); });
out.sort((a, b) => a.mapNo - b.mapNo || a.id.localeCompare(b.id));
// tutorial: per faction
const TUT_FAC = {otters: {other: 'hummingbirds', animals: ['otter', 'beaver', 'duck', 'fish', 'frog', 'turtle', 'heron', 'crab', 'rabbit', 'mouse', 'vole', 'shrew', 'salamander', 'seal'], biomes: ['river', 'coast', 'swamp', 'meadow-forest'], own: c => c.basicSet === 'otters'},
  hummingbirds: {other: 'otters', animals: ['hummingbird', 'bee', 'songbird', 'swift', 'moth', 'butterfly', 'hoopoe', 'wasp', 'pigeon', 'lovebird', 'toucan', 'crow', 'ant', 'beetle'], biomes: ['meadow-forest', 'jungle', 'long-grass', 'savanna'], own: c => c.faction === 'hummingbirds'}};
const cfg = (rd('arena_app.js').match(/const STARTER_CFG_DEFAULT = \{[\s\S]*?\n\};/) || [''])[0];
const m12 = JSON.parse((rd('canonical/map-pools.json').match(/"mtut12": (\[[^\]]*\])/) || [0, '[]'])[1]);
const current = new Set(m12.concat((cfg.match(/'[a-z0-9-]+'(?=\s*:)/g) || []).map(s => s.slice(1, -1))));
const isOther = (d, o) => d.faction === o || (o === 'otters' && d.basicSet === 'otters');
const tutorial = {};
Object.keys(TUT_FAC).forEach(f => { const T = TUT_FAC[f];
  const rows = Object.values(D).filter(d => plain(d) && !current.has(d.id) && rar(d) <= 2 && (d.cost || 0) <= 3 && !isOther(d, T.other) && !['easteregg', 'raid', 'nest', 'smith', 'materia', 'secret', 'quest', 'starpath', 'map'].includes((d.source || {}).kind))
    .map(d => { const u = units[d.id] || {}, ag = u.animalGroup || u.animal || d.animal, w = []; let s = 0;
      if (T.own(d)) { s += 8; w.push(f + ' card'); } else if (d.faction === 'base' || d.basicSet === 'shared') { s += 5; w.push('base card'); }
      if (T.animals.includes(ag)) { s += 4 - T.animals.indexOf(ag) * 0.1; w.push(ag + ' fits the ' + f); }
      if ((u.biomes || []).some(b => T.biomes.includes(b))) { s += 2; w.push((u.biomes[0] || '').replace(/-/g, ' ')); }
      s -= rar(d) * 0.6 + (d.cost || 0) * 0.3; if (listed.has(d.id)) s -= 0.5; return {id: d.id, s, why: w.concat([d.rarity || 'common', 'cost ' + (d.cost || 0)]).join(' · ')}; })
    .filter(x => x.s >= 4).sort((a, b) => b.s - a.s || a.id.localeCompare(b.id)).slice(0, 40);
  tutorial[f] = rows.map(({id, why}) => ({id, why})); });
const file = {_about: 'PACKSET1 (2026-11-22): Claude suggestions for the Pack Editor "All cards" panels. Regenerate: node tools/packset1_suggest.js. bonus = pack-only cards on no map list, in no fight deck or reward (3 per map, 2 asked); tutorial = per-faction starters for the owner\'s 16.',
  generated: new Date().toISOString().slice(0, 10), bonus: out, tutorial};
fs.writeFileSync(path.join(ROOT, 'canonical/pack-bonus-suggestions.json'), JSON.stringify(file, null, 1) + '\n');
const per = {}; out.forEach(o => { per[o.mapNo] = (per[o.mapNo] || 0) + 1; });
console.log('bonus', out.length, 'maps', Object.keys(per).length, 'min per map', Math.min(...Object.values(per)), 'tutorial', Object.entries(tutorial).map(([k, v]) => k + ' ' + v.length).join(', '), 'candidates', cand.length, 'current', current.size);
