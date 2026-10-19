#!/usr/bin/env node
// 2026-10-18 (package PD, owner 20:55: "Add the submap that we and codex suggested, the pale desert. Locked till Map 18 is complete."):
//   1. the Pale Desert (mpd) is side map 18-A of the Glass Dunes: 7 skirmishes, an elite and a boss, codes 18-A-1 ... 18-A-9;
//   2. it is locked (the standard locked emblem, "Clear The Glass Dunes (Map 18) to open") until every Map 18 fight is won, then opens;
//   3. every fight is valid: its cards exist and are fieldable, inside the road's rarity cap for Map 18, it gives a card reward, the
//      boss defends and gives its bramble (The Last Oasis), the rules are existing field rules;
//   4. the three new cards fit budget v3 (canonical/skill-costs.json) and keep their skills "?" until Map 18 is cleared (revealAfter);
//   5. win rates: the stored 120-game measure (docs/balance/pale-desert-2026-10-19.json) is current and on the owner's curve, and a quick
//      live run lands near it;
//   6. its words are TX keys, used by applyPaleDesertTexts, and every one (plus the cards' and bramble's texts) is in all 12 packs;
//   7. the balance tools know it (tools/skirmish_pass.js lists 18-A-*, the reference deck is Map 18's) and its look is wired (art,
//      battlefield class, theme, music, ambience, emblem).
//   node tests/pale-desert-2026-10-19.js            the checks (~40 s)
//   node tests/pale-desert-2026-10-19.js --measure  re-measures every fight (120 games, seeds 9100 and 5100) into the stored file
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), {execFileSync} = require('child_process');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), defs = {}; cards.forEach(c=> defs[c.id] = c);
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const STORE = path.join(ROOT, 'docs', 'balance', 'pale-desert-2026-10-19.json');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`function ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const constLine = name=>{ const m = src.match(new RegExp(`^const ${name} = [^\\n]*$`, 'm')); return m ? m[0] : ''; };
const NEW = ['sandfish', 'pale-oryx', 'quicksand-queen'];
const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i=> '18-A-' + i);
// The owner's curve (2026-10-18): the skirmishes in trail order from 90% down to 60%, the elite on that line, the boss ~40%; green = +-8.
// (2026-10-19, BF: a map's step lower, as a side map; below)
// 2026-10-19 (BF): a side map counts a map past its parent, so its targets sit one map's step lower (the game's roadCurveTarget: 88% -> 55%,
// the boss 26-44%); was the main curve's 90% -> 60%, boss 30-49%
const rct = node=>{ G.NODE_MAP_HINT.set(node, 'mpd'); return G.roadCurveTarget('mpd', node); };
const target = (node, i, n)=> rct(node).t;
const band = (node, t)=>{ const r = rct(node); return [r.lo, r.hi]; };

const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const map = B.MAPS.find(m=> m.id === 'mpd'), md = B.MAPS.find(m=> m.id === 'md');
const fightsOf = m=> m.nodes.filter(n=> n.kind !== 'tutorial' && n.kind !== 'raidboss');
// What the stored measure was taken on: the fight, its enemy cards' printed stats, the reference deck and its level.
function sigOf(node){
  const ref = G.referenceDeckFor('mpd', node), ids = [...new Set(Object.keys(node.deck || {}).concat(Object.keys(ref.deck)))].sort();
  return JSON.stringify([node.key, node.kind, node.deck, node.rules || null, node.hqHp || null, node.shieldOverride != null ? node.shieldOverride : null, node.characterId || null,
    ids.map(id=>{ const d = defs[id] || {}; return [id, d.cost, d.wait, d.attack, d.health, d.effects]; }), ref.deckMap, ref.level]);
}

if(process.argv.includes('--measure')){
  const out = {note: 'The Pale Desert (side map 18-A) against the Map 18 reference deck: simulateReferenceFight, 120 games on seeds 9100 + 37g (the skirmish pass\'s and the win-rate panel\'s) and on fresh seeds 5100 + 37g. Written by node tests/pale-desert-2026-10-19.js --measure.', generated: new Date().toISOString().slice(0, 10), fights: []};
  const list = fightsOf(map), nonBoss = list.filter(n=> n.kind !== 'boss');
  list.forEach(n=>{ const t = target(n, nonBoss.indexOf(n), nonBoss.length), a = G.simulateReferenceFight('mpd', n, 120), b = G.simulateReferenceFight('mpd', n, 120, {seed0: 5100});
    out.fights.push({key: n.key, kind: n.kind, name: n.name, target: +t.toFixed(3), win: a.win, fresh: b.win, shield: a.shield, hp: a.hp, avgRounds: a.avgRounds && +a.avgRounds.toFixed(1), sig: sigOf(n)});
    console.log(n.key, n.kind.padEnd(8), 'target', (t * 100).toFixed(1), 'win', (a.win * 100).toFixed(1), 'fresh', (b.win * 100).toFixed(1)); });
  fs.writeFileSync(STORE, JSON.stringify(out, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, STORE)); process.exit(0);
}

// --- 1. the map
ok(map && map.sub && map.parent === 'md' && map.name === 'The Pale Desert' && md && md.name === 'The Glass Dunes', '1. the Pale Desert is a side map of Map 18, the Glass Dunes');
ok(G.mapNumberOf('mpd') === 18 && G.mapNumberOf('md') === 18, `1. it counts as Map 18 (${G.mapNumberOf('mpd')})`);
const mdLast = fightsOf(md).slice(-1)[0];
ok(map.entry && map.entry.after === mdLast.key && map.entry.afterMapCleared === 'md', `1. its entrance follows Map 18's last fight (${map.entry && map.entry.after} = ${mdLast.key}) and waits on the whole map`);
ok(JSON.stringify(map.nodes.map(n=> n.key)) === JSON.stringify(KEYS), '1. nine fights 18-A-1 ... 18-A-9');
ok(map.nodes.filter(n=> n.kind === 'skirmish').length === 7 && map.nodes[7].kind === 'elite' && map.nodes[8].kind === 'boss', '1. 7 skirmishes, then the elite, then the boss');
ok(B.MAPS.filter(m=> m.sub && m.parent === 'md')[0] === map, '1. it is the Glass Dunes\' first side map, so its codes are 18-A-*');
map.nodes.forEach((n, i)=> ok(i === 0 ? !n.requires.length : n.requires.length && n.requires.every(k=> KEYS.indexOf(k) >= 0 && KEYS.indexOf(k) < i), `1. ${n.key} follows the trail (${n.requires})`));

// --- 2. locked until Map 18 is cleared
{ const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
  const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
  const MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
  const KIND_BASE = new Function(constLine('KIND_BASE') + '\nreturn KIND_BASE;')();
  let progress = {completed: [], clearedAt: {}}, flags = {};
  const H = new Function('CONQUEST_MAPS', 'KIND_BASE', 'getP', 'getFlags', [fn('conquestNodeId'), fn('baseKind'), fn('isMapUnlocked'),
    fn('conquestMapCleared').replace('loadConquestProgress()', 'getP()'), 'function loadDialogueFlags(){ return getFlags(); }', 'function loadConquestProgress(){ return getP(); }'].join('\n') +
    '\nreturn {isMapUnlocked, conquestMapCleared, conquestNodeId};')(MAPS, KIND_BASE, ()=> progress, ()=> flags);
  const byId = id=> MAPS.find(m=> m.id === id), mpd = byId('mpd'), dunes = byId('md');
  const mains = MAPS.filter(m=> !m.sub && !m.reserved), i18 = mains.indexOf(dunes);
  ok(i18 === 18, `2. the Glass Dunes are Map 18 by play order (${i18})`);
  const clear = (p, m, but)=> fightsOf(m).slice(0, but ? -but : undefined).forEach(n=> p.completed.push(H.conquestNodeId(m.id, n.key)));
  const before = {completed: [], clearedAt: {}}; mains.slice(0, i18).forEach(m=> clear(before, m));
  progress = JSON.parse(JSON.stringify(before));
  ok(H.isMapUnlocked(dunes, progress) && !H.isMapUnlocked(mpd, progress), '2. Map 18 open, the Pale Desert locked');
  progress = JSON.parse(JSON.stringify(before)); clear(progress, dunes, 1);
  ok(!H.isMapUnlocked(mpd, progress), '2. still locked with Map 18\'s last fight to go');
  progress = JSON.parse(JSON.stringify(before)); clear(progress, dunes);
  ok(H.conquestMapCleared('md') && H.isMapUnlocked(mpd, progress), '2. opens once every Map 18 fight is won');
  progress = {completed: [], clearedAt: {}}; ok(!H.isMapUnlocked(mpd, progress), '2. a fresh save has it locked');
  // the entrance on the Glass Dunes
  const SUBMAP_CAVES = new Function(constLine('SUBMAP_CAVES') + '\nreturn SUBMAP_CAVES;')();
  const entrances = new Function('CONQUEST_MAPS', 'H', 'SUBMAP_CAVES', 'getFlags', [fn('escapeAttr'), fn('escapeHtml'),
    'const SUBMAP_EMBLEM_SVG = {}; let conquestLayoutEdit = false;', fn('mainConquestMaps'), fn('mapNumberOf'), 'function decorPos(id, key, fb){ return fb; }', 'function loadDialogueFlags(){ return getFlags(); }',
    'const isMapUnlocked = H.isMapUnlocked, conquestMapCleared = H.conquestMapCleared, conquestNodeId = H.conquestNodeId;', fn('subMapEntrancesHTML')].join('\n') +
    '\nreturn subMapEntrancesHTML;')(MAPS, H, SUBMAP_CAVES, ()=> flags);
  progress = JSON.parse(JSON.stringify(before)); clear(progress, dunes, 1);
  const btn = (entrances(dunes, progress).match(/<button[^>]*data-lkey="~sub:mpd"[\s\S]*?<\/button>/) || [''])[0];
  ok(/class="map-cave map-subcave map-subemblem is-locked/.test(btn) && /\sdisabled\s/.test(btn) && /mse-lock/.test(btn) && !/data-submap=/.test(btn), '2. the locked entrance is the standard locked emblem (padlock, no way in)');
  ok(/title="The pale sands — Clear The Glass Dunes \(Map 18\) to open"/.test(btn), '2. it reads "Clear The Glass Dunes (Map 18) to open"');
  progress = JSON.parse(JSON.stringify(before)); clear(progress, dunes);
  const open = (entrances(dunes, progress).match(/<button[^>]*data-lkey="~sub:mpd"[\s\S]*?<\/button>/) || [''])[0];
  ok(/data-submap="mpd"/.test(open) && !/is-locked/.test(open) && /The Pale Desert — 0\/9 cleared/.test(open), '2. once Map 18 is cleared the entrance opens: "The Pale Desert — 0/9 cleared"');
}

// --- 3. the fights
const RR = new Function(src.slice(src.indexOf('// ROAD_RARITY:BEGIN'), src.indexOf('// ROAD_RARITY:END')) + '\nreturn {roadRarityOk, roadRarityCap};')();
const FIELD_KEYS = new Set(['field', 'heatLevel', 'sandstorm', 'mirage']);
map.nodes.forEach(n=>{
  const ids = Object.keys(n.deck || {}), size = Object.values(n.deck || {}).reduce((a, b)=> a + b, 0);
  ok(ids.length && ids.every(id=> defs[id] && !defs[id].test && !defs[id].token && defs[id].cardType !== 'equipment'), `3. ${n.key}: every card exists and is fieldable (${ids.filter(id=> !defs[id])})`);
  ok(size >= 10 && size <= 20, `3. ${n.key}: ${size} cards`);
  ok(ids.every(id=> RR.roadRarityOk(defs[id].rarity, 18, n.kind)), `3. ${n.key}: inside Map 18's ${n.kind} rarity cap (${RR.roadRarityCap(18, n.kind)})`);
  ok(!ids.some(id=> /obsidian|glass/.test(id)), `3. ${n.key}: no glass or obsidian (the Glass Dunes' identity)`);
  ok(n.rules && Object.keys(n.rules).every(k=> FIELD_KEYS.has(k)) && (!n.rules.field || n.rules.field === 'heatwave'), `3. ${n.key}: only the existing desert field rules (Scorching, Sandstorm, Mirage): ${JSON.stringify(n.rules)}`);
  const rw = G.nodeRewardCardIds('mpd', n.key);
  ok(rw.length >= 1 && rw.every(id=> RR.roadRarityOk(defs[id].rarity, 18, n.kind)), `3. ${n.key}: a card reward inside the cap (${rw})`);
  ok(n.rewards && n.rewards.first && n.rewards.first.gold > 0 && n.rewards.first.dust > 0, `3. ${n.key}: first-clear Gold and Dust`);
  ok(!n.shieldOverride && !n.hqHp, `3. ${n.key}: the bramble by rule (Shield = Map 18 x kind, its own Health)`);
});
const boss = map.nodes[8], oasis = chars.find(c=> c.id === 'last-oasis');
ok(boss.characterId === 'last-oasis' && oasis && oasis.unlockMap === 'mpd' && /^data:image\/png;base64,/.test(oasis.art || '') && oasis.effects && oasis.effects.castleRegen === 1, '3. the boss defends The Last Oasis, the bramble its first win gives (unlockMap mpd, art, Regen 1)');
ok(G.skirmishCastle(boss).character.id === 'last-oasis', '3. the fight builds that bramble');
ok(Object.keys(boss.deck).includes('quicksand-queen') && boss.deck['quicksand-queen'] === 1, '3. the Quicksand Queen leads her own fight');
ok(new Set(map.nodes.map(n=> n.icon)).size >= 8 && map.nodes.every(n=> n.flavor && n.name), '3. every fight has its own icon, name and flavour');

// --- 4. the new cards
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
NEW.forEach(id=>{ const d = defs[id], b = d && T.budget(d);
  ok(d && b.ok && !b.missing.length, `4. ${id} fits the stat budget (2A+H+S ${b && b.x1} < N ${b && b.N}, A*H+S ${b && b.x2} < ${b && b.N2})`);
  ok(d && d.locked && d.source && d.source.kind === 'map' && d.source.id === 'mpd' && KEYS.includes(d.source.node), `4. ${id} is a Pale Desert reward (${JSON.stringify(d && d.source)})`);
  ok(d && JSON.stringify(d.revealAfter) === JSON.stringify({map: 'md'}), `4. ${id}'s skills stay "?" until Map 18 is cleared`);
  ok(d && d.icon && d.flavor && (d.archetypes || []).includes('Desert') && /NightCafe/.test(d.creatorNote || ''), `4. ${id}: emoji, flavour, Desert, and the art brief in its note`);
  ok(d && map.nodes.some(n=> n.deck[id]), `4. ${id} turns up in a Pale Desert fight`);
});
{ const a = src.indexOf('[SKILL_REVEAL_BEGIN]'), b = src.indexOf('/* [SKILL_REVEAL_END] */');
  const block = src.slice(src.lastIndexOf('/*', a), b), store = {}, cleared = new Set();
  const ctx = {localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }}, loadConquestProgress: ()=> ({completed: []}),
    mapNumberOf: id=> ({md: 18, mpd: 18}[id] ?? null), conquestMapCleared: id=> cleared.has(id), CARD_DEFS_BASELINE: defs, escapeAttr: s=> String(s), adminModeEnabled: false,
    Date, JSON, Number, Object, Array, Set, String};
  vm.createContext(ctx); vm.runInContext(block + '\n;this.R = {maskHiddenSkills};', ctx);
  const q = defs['quicksand-queen'], m0 = ctx.R.maskHiddenSkills(q);
  ok(m0 !== q && m0.name === q.name && !Object.keys(m0.effects).length && m0._revealGated, '4. before Map 18 is cleared the Codex shows the Queen\'s name and one "?"');
  cleared.add('md'); ok(ctx.R.maskHiddenSkills(q) === q, '4. Map 18 cleared: she reads in full');
}
['rabid-jackal', 'dust-devil-kestrel', 'meerkat-burrower', 'stonedrop-vulture', 'glowing-gecko', 'dust-hyena'].forEach(id=>
  ok(defs[id].source && defs[id].source.id === 'mpd' && T.budget(defs[id]).ok, `4. ${id} (it had no source) is a Pale Desert reward now, within budget`));

// --- 5. win rates
let stored = null; try{ stored = JSON.parse(fs.readFileSync(STORE, 'utf8')); }catch(e){}
const PD_GAPS = (()=>{ try{ return new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'road-gaps-2026-10-19.json'), 'utf8')).gaps.list.map(g=> g.map + ':' + g.code)); }catch(e){ return new Set(); } })(); // BF3
ok(stored && stored.fights && stored.fights.length === 9, '5. the stored measure is there (node tests/pale-desert-2026-10-19.js --measure)');
const nonBoss = map.nodes.filter(n=> n.kind !== 'boss');
(stored ? stored.fights : []).forEach(f=>{ const n = map.nodes.find(x=> x.key === f.key); if(!n) return ok(false, '5. stored ' + f.key + ' is not a fight');
  const t = target(n, nonBoss.indexOf(n), nonBoss.length), [lo, hi] = band(n, t);
  ok(f.sig === sigOf(n), `5. ${f.key}: the stored measure is current (re-run with --measure after changing the fight, its cards or the reference deck)`);
  // 2026-10-19 (BF3, owner 16:22): honest levers only; a fight off its band must be a listed gap (docs/balance/road-gaps-2026-10-19.json)
  const gap = PD_GAPS.has('mpd:' + f.key);
  ok(Math.abs(f.target - t) < 0.001 && (gap || f.win >= lo - 1e-9 && f.win <= hi + 1e-9), `5. ${f.key} (${n.kind}): ${(f.win * 100).toFixed(1)}% over 120 games, target ${(t * 100).toFixed(0)}% (${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)})${gap ? ', a listed honest gap' : ''}`);
  ok(gap || f.fresh >= lo - 0.04 && f.fresh <= hi + 0.04, `5. ${f.key}: ${(f.fresh * 100).toFixed(1)}% on fresh seeds, near the band${gap ? ' (a listed gap)' : ''}`); });
if(stored){ const trail = stored.fights.slice(0, 8).filter(f=> !PD_GAPS.has('mpd:' + f.key));
  ok(trail.every((f, i, a)=> i === 0 || f.win <= a[i - 1].win + 0.05), '5. the curve falls along the trail (no fight more than 5 points easier than the one before; listed gaps aside)'); }
// a quick live run: the first and last fights, 30 games each, land near the stored numbers
[map.nodes[0], boss].forEach(n=>{ const s = stored && stored.fights.find(f=> f.key === n.key); const r = G.simulateReferenceFight('mpd', n, 30);
  ok(s && Math.abs(r.win - s.win) <= 0.2, `5. ${n.key} live (30 games): ${(r.win * 100).toFixed(0)}% vs stored ${s && (s.win * 100).toFixed(0)}%`);
  ok(r.deckMap === 18 && r.stage === 'road', `5. ${n.key} plays the Map 18 reference deck (a side map plays its parent's)`); });

// --- 6. texts
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const apply = fn('applyPaleDesertTexts'), used = [...apply.matchAll(/TX\('(map\.mpd-[\w-]+)'\)/g)].map(m=> m[1]);
ok(used.length === 21 && used.every(k=> k in TEXT), `6. 21 TX keys, all in the text table (${used.filter(k=> !(k in TEXT))})`);
ok(Object.keys(TEXT).filter(k=> k.startsWith('map.mpd-')).every(k=> used.includes(k)), '6. no map.mpd-* key goes unused');
ok(/\napplyPaleDesertTexts\(\);/.test(src) && src.indexOf('\napplyPaleDesertTexts();') < src.indexOf('const CONQUEST_MAPS_BASELINE'), '6. applied before the baseline copy');
KEYS.forEach((k, i)=> ok(new RegExp(`'${k}': \\[TX\\('map\\.mpd-${i + 1}-name'\\), TX\\('map\\.mpd-${i + 1}-flavor'\\)\\]`).test(apply), `6. ${k}'s name and flavour come from the table`));
{ const sandbox = {CONQUEST_MAPS: JSON.parse(JSON.stringify(B.MAPS.filter(m=> m.id === 'mpd'))), TX: k=> 'T:' + k}; vm.createContext(sandbox); vm.runInContext(apply + '\napplyPaleDesertTexts();', sandbox);
  const m = sandbox.CONQUEST_MAPS[0]; ok(m.name === 'T:map.mpd-name' && m.entry.label === 'T:map.mpd-entry' && m.nodes.every((n, i)=> n.name === `T:map.mpd-${i + 1}-name` && n.flavor === `T:map.mpd-${i + 1}-flavor`), '6. the overlay sets every name, flavour and the entrance label'); }
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const texts = used.map(k=> TEXT[k]).concat(NEW.map(id=> defs[id].flavor), [oasis.name, oasis.flavor]);
CODES.forEach(code=>{ const main = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), cp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', code + '.json'), 'utf8'));
  const miss = texts.filter(t=> !main[t] || main[t] === t), missNames = NEW.map(id=> defs[id].name).filter(n=> !cp[n] && !main[n]);
  ok(!miss.length && !missNames.length, `6. ${code}: every Pale Desert text and card name is translated (${miss.concat(missNames).slice(0, 3).join(' | ')})`); });

// --- 7. tools and look
const list = execFileSync('node', [path.join(ROOT, 'tools', 'skirmish_pass.js'), 'list'], {cwd: ROOT, encoding: 'utf8', timeout: 120000});
KEYS.forEach(k=> ok(new RegExp(`^${k}\\s+mpd\\s+\\w+\\s+deck road 18 `, 'm').test(list), `7. tools/skirmish_pass.js lists ${k} with the Map 18 road deck`));
ok(/mpd:'map-mpd'/.test(src) && /"mpd"\]\);/.test(constLine('MAP_ART_IDS')) && fs.existsSync(path.join(ROOT, 'art', 'maps', 'mpd.png')), '7. battlefield class, map art id and art/maps/mpd.png');
ok(/def mpd\(rng\):/.test(fs.readFileSync(path.join(ROOT, 'tools', 'make_map_backgrounds.py'), 'utf8')) && /"abyss", "pd"\]/.test(fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8')), '7. the art is painted by make_map_backgrounds.py and baked in by the build');
ok(/\.battlefield\.map-mpd\{/.test(tpl) && /\.map-theme-mpd\{/.test(tpl) && /\.scene-paledesert \.pd-sun\{/.test(tpl) && /'paledesert'/.test(fn('syncSceneFx')), '7. the pale sand scene: floor gradient, map theme, white-sun glare and heat haze');
ok(/mpd:'map_sand'/.test(src) && /mpd:\{arrive:\[[^\]]*\][^\n]*gusts:true/.test(src) /* 2026-10-19 (CX): the arrive hiss became intermittent sand gusts */ && /mpd:'paledesert'/.test(constLine('MAP_BIOME_OF')) && /paledesert:\{trees:/.test(src), '7. music, ambient sound, map decor');
ok(/\n  mpd: `<svg/.test(src), '7. its own emblem on the Glass Dunes');
ok(/mpd:'paledesert'\}/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-fx-e.js'), 'utf8')) && /mpd:'desert'/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-fx-g.js'), 'utf8')) && /mpd:4/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-shaders.js'), 'utf8')), '7. map ambience, title theme and heat-shimmer shader');

console.log(fail ? `pale-desert-2026-10-19: ${fail} of ${checks} failed` : `pale-desert-2026-10-19: all ${checks} passed`);
process.exit(fail ? 1 : 0);
