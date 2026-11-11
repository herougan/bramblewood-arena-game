// 2026-11-02 (package CONTENT8, owner 21:12 on CONTENT7-1 / CONTENT7-3): Bright Night Algae is Dinoflagellates (algae, flora) in cards.json, the animal tags
// and 12 language packs; seven sea cards sit on the map lists of maps under their card cap, in budget at their list's term; Bobbit Worm and
// Dinoflagellates stay unlisted; both decisions are DONE with the owner's words.
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const rd = p=> fs.readFileSync(path.join(ROOT, p), 'utf8'); let checks = 0, fail = 0;
const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('FAIL ' + m); } };
const cards = JSON.parse(rd('canonical/cards.json')), by = id=> cards.find(c=> c.id === id), pools = JSON.parse(rd('canonical/map-pools.json')).maps;
const R = require(path.join(ROOT, 'tools', 'skill2_refit_2026_10_31.js')), LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
// coordinator, same day: held to the owner's 8-11 own rule, so only the three jellyfish are placed; Bloodworm, Pistol Shrimp, Man o' War and Nautiloid are unlisted again
const PLACE = {mb:['moon-jelly'], m2:['lions-mane-jelly'], m7:['supernova-jelly']};
const BACK = {bloodworm:[2, 6], 'pistol-shrimp':[4, 4], 'man-o-war':[3, 13], nautiloid:[3, 14]};
const listed = id=> Object.entries(pools).filter(([k, m])=> m.cards.includes(id)).map(([k])=> k);
// 1. the rename (the test header's "seven" is now three: see PLACE)
const d = by('night-algae');
ok(d.name === 'Dinoflagellates' && d.animal === 'algae' && d.subtype === 'plant' && (d.species || []).join() === by('pond-algae').species.join(), 'night-algae is Dinoflagellates: animal algae, plant, species as Pond Algae');
ok(d.awaitingSource && d.unattainable && !listed('night-algae').length, 'Dinoflagellates stays unlisted');
ok(by('bobbit-worm').awaitingSource && by('bobbit-worm').unattainable && !listed('bobbit-worm').length, 'Bobbit Worm stays unlisted');
ok(/algae/.test(rd('tools/animal_tags.py').split('\n').find(l=> l.includes("'night-algae'"))), 'animal_tags.py override says algae');
const tags = JSON.parse(rd('canonical/animal-tags.json')), row = JSON.stringify(tags).includes('"id": "night-algae"') ? null : null;
const trow = (function find(o){ if(Array.isArray(o)){ for(const x of o){ const r = find(x); if(r) return r; } } else if(o && typeof o === 'object'){ if(o.id === 'night-algae' && o.animal) return o; for(const k of Object.keys(o)){ const r = find(o[k]); if(r) return r; } } return null; })(tags);
ok(trow && trow.name === 'Dinoflagellates' && trow.animal === 'algae', 'animal-tags.json row: Dinoflagellates, algae');
// 2. the lists: each placed card on exactly its map, no map over 16 cards, flags cleared, a basic-pack source, inside the budget band at the list's term
// 2026-11-11 (LISTFIX3): the lists are the owner's 11-11 picks (SKIR1): no 16-card / 8-11 own cap, and a jellyfish sits where those lists put it; one
// they left on no list is out of play and waits for the owner's answer (draft LISTFIX3-2, docs/balance/listfix3/decisions-2026-11-11.json)
const allListed = id=> Object.values(pools).some(e=> (e.cards || []).includes(id) || (e.special || []).includes(id) || Object.values(e.submaps || {}).some(l=> (Array.isArray(l) ? l : l.cards || []).includes(id)));
const LF3 = JSON.parse(rd('docs/balance/listfix3/decisions-2026-11-11.json')).items.find(x=> x.id === 'LISTFIX3-2') || {};
for(const [m, ids] of Object.entries(PLACE)){
  for(const id of ids){ const c = by(id); ok(c, id + ' exists'); if(!c) continue;
    if(!allListed(id)){ ok((LF3.body || '').includes(c.name), `${id}: on no 11-11 list, named in draft LISTFIX3-2`); continue; }
    ok(listed(id).length >= 1, `${id} on a map list (${listed(id).join()})`);
    ok(!c.awaitingSource && !c.unattainable, id + ' not awaitingSource / unattainable');
    ok(c.source && c.source.kind === 'pack' && c.source.map === m, id + ' source is a pack card of ' + m);
    const v = R.verdict(R.NEW, c); ok(v.ok, `${id} inside the budget band at its list's term (${v.use} of N ${v.N})`);
    ok(!G.isUnattainable || !G.isUnattainable(LB.CARD_DEFS_BASELINE[id]), id + ' obtainable in the game'); } }
// 2026-11-11 (LISTFIX3): the 8-11 own-card check of mb / m2 / mk / m7 is gone with the cap (the owner's 11-11 picks set the lists); a BACK card an 11-11
// admin add lists (Bloodworm, Map 2) keeps its CONTENT7 line and no source (enemy-only until the owner places it)
const ADMIN = JSON.parse((rd('arena_app.js').match(/const UI47_ADMIN_ADD = (\{.*?\});\n/) || [0, '{}'])[1]), admin = id=> Object.values(ADMIN).some(l=> l.includes(id));
for(const [id, [a, h]] of Object.entries(BACK)){ const c = by(id); ok(c.awaitingSource && c.unattainable && (!listed(id).length || admin(id)) && !c.source && c.attack === a && c.health === h, `${id} unlisted again (or an 11-11 admin add) with its CONTENT7 line ${a}/${h}`); }
// rarity caps: no card above its map's boss cap
const capMap = {mb:2, m2:4, m7:10};
for(const [m, ids] of Object.entries(PLACE)) for(const id of ids){ const cap = G.roadRarityCap(capMap[m], 'miniboss', m); ok(G.roadRarityOk(by(id).rarity, capMap[m], 'worldboss', m) || !cap, `${id} (${by(id).rarity}) within the rarity cap of ${m}`); }
// re-fit stays within 2 of the CONTENT7 line
const WAS = {'moon-jelly':[3, 3], 'lions-mane-jelly':[1, 16], 'supernova-jelly':[2, 9]};
for(const [id, [a, h]] of Object.entries(WAS)){ const c = by(id); ok(Math.abs(c.attack - a) <= 2 && Math.abs(c.health - h) <= 2, `${id} ${c.attack}/${c.health} within 2 a stat of ${a}/${h}`); }
// 3. the packs
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
for(const code of CODES){ const cp = JSON.parse(rd(`lang/cards/${code}.json`)), ui = JSON.parse(rd(`lang/ui/${code}.json`)), root = JSON.parse(rd(`lang/${code}.json`));
  ok(cp['Dinoflagellates'], code + ': name of Dinoflagellates'); ok(ui[d.flavor], code + ': flavour of Dinoflagellates');
  ok(!('Bright Night Algae' in cp) && !('Bright Night Algae' in ui) && !('Bright Night Algae' in root), code + ': old name gone');
  ok(!('A glowing bacterium, blown up to the size of a barrel. Come dark, the bay lights up and there are two.' in ui), code + ': old flavour gone'); }
// 4. decisions
const dec = {}; rd('docs/decisions.json').split('\n').forEach(l=>{ const m = /\{"id": "([A-Z0-9-]+)"/.exec(l); if(m){ try{ dec[m[1]] = JSON.parse(l.trim().replace(/,$/, '')); }catch(e){} } });
for(const id of ['CONTENT7-1', 'CONTENT7-3']) ok(dec[id] && dec[id].status === 'DONE' && /Owner 2026-11-02 21:12/.test(dec[id].answer || '') && dec[id].group === 'game', id + ' DONE with the owner\'s words');
console.log(`content8: ${checks - fail}/${checks} passed`); process.exit(fail ? 1 : 0);
