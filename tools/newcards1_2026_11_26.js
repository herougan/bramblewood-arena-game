#!/usr/bin/env node
// 2026-11-26 (package NEWCARDS1): the 14 ART16 species as cards (docs/design/newcards1-2026-11-26.md), plus the two ART16 re-arts.
// Each card: Level 1 fit by the budget at Map 0 (what the tools see while it is unplaced), cap 1 use held in 85-100% at its home map too.
//   node tools/newcards1_2026_11_26.js --fit      prints the fit for every spec (writes nothing)
//   node tools/newcards1_2026_11_26.js            appends the cards (awaitingSource, unattainable), imports art; then run tools/lvl10/gen_2026_11_18.js --card <id>
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const FILE = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const NAMES = JSON.parse(fs.readFileSync(path.join(__dirname, 'newcards1_2026_11_26.json'), 'utf8'));
const FIT = process.argv.includes('--fit');
const use = (d, m)=>{ const b = T.budget(Object.assign({}, d, {obtainMap: m}), {level: 1}); return {u1: b.x1 / b.N, u2: b.x2 / b.N2, b}; };
function fit(s){ let best = null;
  for(let A = Math.max(1, s.a - 1); A <= s.a + 1; A++) for(let H = 1; H <= 60; H++){
    const d = Object.assign({}, s.def, {attack: A, health: H}), r = use(d, 0);
    if(r.u1 <= 1 && r.u2 <= 1){ const shape = Math.abs(A - s.a); if(!best || shape < best.shape || (shape === best.shape && H > best.H)) best = {A, H, shape}; } }
  return best; }
const out = [];
NAMES.forEach(s=>{
  s.def = {id: s.id, cost: s.cost, wait: s.wait, rarity: s.rarity, effects: s.effects};
  const f = fit(s), d = Object.assign({}, s.def, {attack: f.A, health: f.H}), r0 = use(d, 0), rh = use(d, s.home);
  console.log(s.id.padEnd(17), s.rarity.padEnd(9), `${f.A}/${f.H}`.padEnd(6), 'map0', Math.round(100 * r0.u1) + '%', 'cap2', Math.round(100 * r0.u2) + '%', `home ${s.home}`, Math.round(100 * rh.u1) + '%');
  out.push({s, f});
});
if(FIT) process.exit(0);
const maxId = Math.max(...cards.map(c=> c.numericId || 0)), have = new Set(cards.map(c=> c.id));
const uri = f=> 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const prompts = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'art/staging/art16/new/prompts.json'), 'utf8')).map(p=> [p.id, p]));
const REART = JSON.parse(fs.readFileSync(path.join(ROOT, 'art/staging/art16/manifest.json'), 'utf8')).filter(p=> p.group === 'cards');
let n = 0;
out.forEach(({s, f})=>{
  if(have.has(s.id)) return; n++;
  const png = path.join(ROOT, 'art/staging/art16/new', s.id + '.png'), dst = path.join(ROOT, 'art/cards', s.id + '.png');
  fs.copyFileSync(png, dst);
  fs.writeFileSync(path.join(ROOT, 'art/cards', s.id + '.prompt.txt'), '# ART16 2026-11-24, variant ' + (prompts[s.id].variant || 'A') + ' picked (package NEWCARDS1 imported it 2026-11-26)\n' + prompts[s.id].prompt + '\n');
  const uuid = (()=>{ const h = crypto.createHash('sha1').update('newcards1:' + s.id).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`; })();
  cards.push({id: s.id, name: s.name, icon: s.icon, cost: s.cost, wait: s.wait, attack: f.A, health: f.H, rarity: s.rarity, locked: true, test: false,
    archetypes: s.archetypes, species: s.species, animal: s.animal, dmgType: 'physical', resist: [], tags: [], effects: s.effects, flavor: s.flavor,
    numericId: maxId + n, uuid, awaitingSource: true, unattainable: true,
    creatorNote: `2026-11-26 (package NEWCARDS1, docs/design/newcards1-2026-11-26.md): new ART16 species. ${s.why} Level 1 fit by the budget at Map 0 (rarity ${s.rarity}); proposed home Map ${s.home}.`,
    art: uri(dst)});
});
REART.forEach(p=>{ const c = cards.find(x=> x.id === p.id); if(!c) throw new Error('no card ' + p.id);
  const src = path.join(ROOT, 'art/staging/art16', p.file), dst = path.join(ROOT, 'art/cards', p.id + '.png');
  fs.copyFileSync(src, dst); c.art = uri(dst); delete c.artReview;
  fs.writeFileSync(path.join(ROOT, 'art/cards', p.id + '.prompt.txt'), '# ART16 2026-11-24, variant ' + p.variant + ' picked (re-art of a rejected card; NEWCARDS1 imported it 2026-11-26)\n' + p.prompt + '\n'); });
fs.writeFileSync(FILE, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
console.log('appended', n, 'cards; re-art', REART.map(p=> p.id).join(', '));
