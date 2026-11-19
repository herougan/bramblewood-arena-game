#!/usr/bin/env node
// 2026-11-19 (package RAIDGATE, owner 00:02, decision OWN-1119-1): The Deep Dark, a side map inside The Sunken Depths, opens after Map 21;
// its boss clear opens the first raid. Checks: the map's data and decks (existing cards on its own list, Map 21 strength), the gate as
// isMapUnlocked reads it (lifted from arena_app.js), the raid spot and its auto-open, the Home note, texts in 12 packs, the decision.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), txt = rd('bramblewood-texts.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const { G } = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const MAPS = G.CONQUEST_MAPS, byId = id=> MAPS.find(m=> m.id === id);
const cards = new Set(JSON.parse(rd('canonical/cards.json')).map(c=> c.id));
const pools = JSON.parse(rd('canonical/map-pools.json')).maps;

// 1. the map
const dd = byId('mjd'), m21 = G.mapNumberOf('m21') === 21 ? byId('m21') : null;
ok(dd && dd.sub && dd.parent === 'm7' && dd.entry && dd.entry.host === 'mj', '1. The Deep Dark is a side map of Map 10 drawn inside The Sunken Depths');
ok(dd && dd.entry.afterMapCleared === 'm21' && m21, '1. it opens once Map 21 is cleared');
ok(dd && !dd.entry.after, '1. no fight of The Sunken Depths gates it (only Map 21 and the Depths being open)');
ok(G.mapNumberOf('mjd') === 10 && G.mapUnlockNumberOf('mjd') === 21, '1. it counts as Map 10 for its codes and opens at Map 21');
const fights = dd ? dd.nodes : [];
ok(fights.length >= 3 && fights.length <= 4 && /boss/.test(fights[fights.length - 1].kind), '1. 3-4 fights, the last a boss');
ok(fights.every((f, i)=> f.key === `10-B-${i + 1}`), '1. keys 10-B-1 ... (10-A is The Sunken Depths)');
ok(dd && dd.shieldMap === 21 && fights.every(f=>{ try{ if(G.NODE_MAP_HINT) G.NODE_MAP_HINT.set(f, 'mjd'); }catch(e){} return G.nodeMapNumber(f) === 21; }), '1. its fights count as Map 21 (level and Shield)');
// 2. decks: existing cards only, all on the map's own list, Map 21-sized
const list = new Set(((pools.m7 || {}).submaps || {}).mjd || []);
ok(list.size >= 8, '2. its list is in canonical/map-pools.json (m7 submaps.mjd)');
const sizes21 = m21.nodes.filter(x=> x.deck).map(x=> Object.values(x.deck).reduce((a, b)=> a + b, 0));
fights.forEach(f=>{ const ids = Object.keys(f.deck || {}), size = ids.reduce((a, id)=> a + f.deck[id], 0);
  ok(ids.length && ids.every(id=> cards.has(id)), `2. ${f.key}: every card exists (no new cards)`);
  ok(ids.every(id=> list.has(id)), `2. ${f.key}: every card is on The Deep Dark's list`);
  ok(size >= Math.min(...sizes21) - 2 && size <= Math.max(...sizes21), `2. ${f.key}: ${size} cards, Map 21 size (${Math.min(...sizes21)}-${Math.max(...sizes21)})`); });

// 3. the gate, as the game reads it: isMapUnlocked lifted from arena_app.js (it must stay self-contained: other tests lift it alone)
const lift = name=>{ const i = app.indexOf('function ' + name + '('); let j = app.indexOf('{', i), d = 0;
  for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}' && !--d) return app.slice(i, k + 1); } return ''; };
const cleared = new Set(); let flags = {};
const gate = new Function('CONQUEST_MAPS', 'conquestMapCleared', 'loadDialogueFlags', 'conquestNodeId', 'baseKind',
  lift('isMapUnlocked') + '\nreturn {isMapUnlocked};')(MAPS, id=> cleared.has(id), ()=> flags, (m, k)=> m + ':' + k, k=> String(k || '').replace(/-.*/, ''));
const HOST = id=>{ const m = byId(id); return (m.entry && m.entry.host) || m.parent; };
const all = id=> byId(id).nodes.filter(x=> x.kind !== 'tutorial').map(x=> id + ':' + x.key);
const prog = done=> ({completed: done, ranks: {}});
const mains = MAPS.filter(m=> !m.sub), upTo = k=> [].concat(...mains.slice(0, k + 1).map(m=> all(m.id)));
const tut = [].concat(...MAPS.map(m=> m.nodes.filter(x=> x.kind === 'tutorial').map(x=> m.id + ':' + x.key)));
mains.slice(0, 21).forEach(m=> cleared.add(m.id));
ok(!gate.isMapUnlocked(dd, prog(tut.concat(upTo(20), all('mj')))), '3. locked with Maps 0-20 and The Sunken Depths cleared');
cleared.add('m21');
ok(gate.isMapUnlocked(dd, prog(tut.concat(upTo(21), all('mj')))), '3. open once Map 21 is cleared too');
const mjKey = byId('mj').entry.after;
ok(mjKey && !gate.isMapUnlocked(dd, prog(tut.concat(upTo(21).filter(id=> id !== 'm7:' + mjKey)))), '3. still locked while The Sunken Depths is (its entrance fight on Coral Current not won)');
ok(gate.isMapUnlocked(dd, prog(tut.concat(upTo(21)))), '3. open with Map 21 cleared, before any Sunken Depths fight');
ok(HOST('mjd') === 'mj' && HOST('mj') === 'm7' && MAPS.filter(m=> m.sub && m.entry && m.entry.host).every(m=> m.id === 'mjd'), '3. host: The Sunken Depths for The Deep Dark, the parent for every other side map');
ok(app.includes("CONQUEST_MAPS.filter(m=> m.sub && ((m.entry && m.entry.host) || m.parent)===map.id && m.entry"), '3. the entrance is drawn on its host map');
ok(app.includes('conquestSelectedMap = (sm.entry && sm.entry.host) || sm.parent;') && app.includes("m.id === ((map.entry && map.entry.host) || map.parent)); if(!parent) return '';"), '3. its exit leads back to The Sunken Depths');
ok(lift('mapLockReason').includes('m.id === ((map.entry && map.entry.host) || map.parent)'), '3. the lock reason reads the host too');

// 4. the first raid: its spot hangs off The Deep Dark's boss, and that clear opens it by itself
ok(/\{key:'raid', icon:'🐲', name:'Raid Banner', mapNumber:13, map:'mjd', after:'10-B-4', pos:/.test(app), '4. the Raid Banner sits after 10-B-4 (was Map 13, after nothing)');
ok(fights.length && fights[fights.length - 1].key === '10-B-4', '4. 10-B-4 is The Deep Dark\'s boss');
const ro = lift('raidgateOpen');
ok(/featureUnlocked\('raid'\)/.test(ro) && /spotAvailable\(sp, loadConquestProgress\(\)\)/.test(ro) && /unlockFeature\('raid'\)/.test(ro) && /TX\('ui\.raidgate-open'/.test(ro) && /setDialogueFlag\('raidgate_note', true\)/.test(ro), '4. raidgateOpen: once, when the spot is reached; toast and Home note');
ok(app.includes('setTimeout(raidgateOpen, 1000); // 2026-11-19 (RAIDGATE)') && app.includes("if(currentTab === 'home' && raidgateOpen()) renderHome();"), '4. it runs on the map and on Home');
ok(app.includes('id="homeRaidgateBtn"') && app.includes("rg.addEventListener('click', ()=> homeGo('play', 'raid'))"), '4. the Home note opens the raid');
ok(/function renderRaidSubTab\(body\)\{\n  try\{ if\(loadDialogueFlags\(\)\['raidgate_note'\]\) setDialogueFlag\('raidgate_note', false\)/.test(app), '4. the note goes once the raid page is opened');
ok(/FEATURE_SPOTS\.forEach\(sp=>\{ if\(sp\.mapNumber != null && sp\.mapNumber < job\.n\) unlockFeature\(sp\.key\); \}\);/.test(app), '4. Admin "start of Map N" still unlocks the raid by its mapNumber');

// 5. art, dark, music
ok(/const MAP_ART_ALIAS = \{mjd: 'mabyss'\};/.test(app) && /mjd:'map-mabyss'/.test(app), '5. abyss art and the raid\'s ground');
fights.forEach(f=> ok(G.fightRules('mjd', f).dark === 'pitch' && G.fightRules('mjd', f).crushingDepths, `5. ${f.key}: Pitch Black and Crushing Depths`));
ok(/\.map-theme-mjd\{--mt-a:/.test(rd('arena_template.html')), '5. its palette');

// 6. texts
const keys = [...txt.matchAll(/"(ui\.raidgate-[a-z-]+)": "([^"]*)"/g)];
ok(keys.length === 2, '6. two raidgate texts');
const lits = [dd.name, dd.entry.label, dd.blurb].concat(fights.map(f=> f.name));
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(rd('lang/' + code + '.json')), ui = JSON.parse(rd('lang/ui/' + code + '.json'));
  const miss = keys.filter(k=> !pack[k[2].replace(/^[^\p{L}\p{N}{]+/u, '')] && !pack[k[2]]).map(k=> k[1]).concat(lits.filter(s=> !ui[s] && !pack[s]));
  ok(!miss.length, '6. ' + code + ' misses ' + miss.join(', '));
}
// 7. the decision and the docs
const dec = (JSON.parse(rd('docs/decisions.json')).items || []).find(x=> x.id === 'OWN-1119-1');
const words = s=> String(s || '').split(/\s+/).filter(Boolean).length;
ok(dec && dec.status === 'YET' && dec.default === 'a' && dec.options.length === 3 && words(dec.body) < 100, '7. OWN-1119-1 filed: YET, default a, three options, under 100 words');
ok(rd('docs/lore-bible.md').includes('The Deep Dark') && rd('docs/project-state.md').includes('OWN-1119-1'), '7. lore bible and project state');
console.log(fail ? `raidgate: ${fail} FAILED of ${n}` : `raidgate: ${n} checks passed`);
process.exit(fail ? 1 : 0);
