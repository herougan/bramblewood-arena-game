// 2026-11-02 (package CONTENT7, owner 19:56, IDEA-11-02 + CONTENT6-2 b): nine new unlisted cards inside the budget with an animal each, the three Mythics
// marked for Map 56+, the two renames in cards.json and all 12 language packs, the decisions, and the art prompts' banned words.
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const rd = p=> fs.readFileSync(path.join(ROOT, p), 'utf8'); let checks = 0, fail = 0;
const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('FAIL ' + m); } };
const cards = JSON.parse(rd('canonical/cards.json')), by = id=> cards.find(c=> c.id === id);
const T = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(rd('canonical/skill-costs.json')));
const IDS = {bloodworm:['common', 2], 'night-algae':['common', 9], 'bobbit-worm':['uncommon', 9], 'man-o-war':['rare', 9], nautiloid:['rare', 10], 'pistol-shrimp':['uncommon', 10], unicorn:['mythic', 56], sphinx:['mythic', 56], griffin:['mythic', 56]};
const nums = new Set(), pools = JSON.parse(rd('canonical/map-pools.json')).maps;
for(const [id, [rar, map]] of Object.entries(IDS)){ const c = by(id); ok(c, id + ' exists'); if(!c) continue;
  ok(c.rarity === rar, id + ' rarity ' + rar); ok(c.animal && c.species && c.species.length, id + ' has an animal and species');
  const b = T.budget(Object.assign({}, c, {obtainMap:map}), {level:1}); ok(b.ok && b.x1 <= b.N, `${id} inside the budget at Map ${map} (${b.x1} / ${b.N})`);
  ok(Object.keys(c.effects).filter(k=> !['flying', 'tide'].includes(k)).length <= 2, id + ' two skills at most');
  // 2026-11-02 (package CONTENT8): the four sea cards stay unlisted (the coordinator held the maps to the 8-11 own rule); only the three jellyfish are placed
  { ok(c.awaitingSource && c.unattainable, id + ' unlisted (awaitingSource + unattainable)');
    ok(!Object.values(pools).some(m=> (m.cards || m).includes(id) || Object.values(m.submaps || {}).some(l=> l.includes(id)) || (m.special || []).includes(id)), id + ' on no map list'); }
  ok(!nums.has(c.numericId) && cards.filter(x=> x.numericId === c.numericId).length === 1, id + ' numericId unique'); nums.add(c.numericId);
  if(rar === 'mythic') ok(/MARKED FOR MAP 56\+/.test(c.creatorNote), id + ' marked for Map 56+'); }
ok(by('night-algae').effects.bloomCopy.when.join() === 'night', 'Bright Night Algae blooms at night');
ok(by('gale-sprite').name === 'Whirlwind Swift' && by('alpine-avalanche').name === 'Avalanche Bear', 'renames in cards.json (ids unchanged)');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
for(const code of CODES){ const cp = JSON.parse(rd(`lang/cards/${code}.json`)), ui = JSON.parse(rd(`lang/ui/${code}.json`)), root = JSON.parse(rd(`lang/${code}.json`));
  for(const id of Object.keys(IDS).concat(['gale-sprite', 'alpine-avalanche'])){ const c = by(id); ok(cp[c.name] && cp[c.name] !== '', `${code}: name of ${id}`); ok(ui[c.flavor], `${code}: flavour of ${id}`); }
  for(const k of ['Gale Sprite', 'Alpine Avalanche']) ok(!(k in cp) && !(k in root) && !(k in ui), `${code}: old key ${k} gone`); }
const dec = JSON.parse(rd('docs/decisions.json')), ds = JSON.stringify(dec);
for(const d of ['CONTENT7-1', 'CONTENT7-2', 'CONTENT7-3']) ok(ds.includes('"id":"' + d + '"') || ds.includes('"id": "' + d + '"'), d + ' in decisions.json');
const brief = rd('docs/art/content7-2026-11-02-briefs.md'); const prompts = [...brief.matchAll(/```\n([^`]+)\n```/g)].map(m=> m[1]);
ok(prompts.length === 9, 'nine art prompts'); prompts.forEach(p=>{ ok(/full background/.test(p), 'prompt has a background'); ok(!/no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|dagger|axe|bow\b|gun|weapon/i.test(p), 'prompt has no banned word: ' + p.slice(0, 30)); });
console.log(`content7: ${checks - fail}/${checks} passed`); process.exit(fail ? 1 : 0);
