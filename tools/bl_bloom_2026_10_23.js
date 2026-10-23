#!/usr/bin/env node
// Package BL (2026-10-23): Bloom – {conditions} on the fungi and the algae, Nectar Vintner's Heal, and the re-fit.
// Owner 11:23: "Bloom is meant to represent fungal bloom, algae bloom etc. ... Bloom - {Conditions}. Let's just define bloom as +1/+1, then
// make a copy of this card ... Conditions? Like 'Wet' & 'Sunny' + 1 Lumber Cost. For Algae, just 'Wet' & 'Sunny' is sufficient. For another
// Fungi, 'Wet' & Killed an enemy is sufficient." and "Nectar Vincter - change to Heal."; 17:34 #3: "Bloom hasn't changed".
// 19:30: "I think bloom only gives the new one +1/+1, not itself." (the engine's bloomCopyPass; the budget prices 3p).
//   node tools/bl_bloom_2026_10_23.js cards     the card edits in canonical/cards.json (idempotent)
//   node tools/bl_bloom_2026_10_23.js refit     tools/refit_pass_2026_10_21.js on the changed band cards, then: a card the re-fit would
//                                               cut down keeps its stats (held for review, as BF11-1 did; docs/balance/bl-held-2026-10-23.json),
//                                               and docs/balance/human-pass-1-flagged-2026-10-21.json is merged (old ids kept), not overwritten.
//   node tools/bl_bloom_2026_10_23.js check     prints each card's budget line
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.join(__dirname, '..');
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), FLAGGED = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json');
const HELD = path.join(ROOT, 'docs', 'balance', 'bl-held-2026-10-23.json');
const NOTE = '2026-10-23 (package BL)';
const readCards = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const writeCards = cards=> fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const note = (c, t)=>{ if(!(c.creatorNote || '').includes(t)) c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + t; };
const REFIT = ['fungal-colossus', 'puffball-bombardier', 'lotus-frog', 'nectar-vintner'];
const ALGAE = {id: 'pond-algae', name: 'Pond Algae', icon: '🌿', cost: 0, wait: 1, attack: 1, health: 6, rarity: 'common', locked: true, test: false,
  archetypes: ['Flora', 'Pond'], species: ['Plant'], subtype: 'plant', animal: 'algae', dmgType: 'physical', resist: [], tags: [],
  effects: {bloomCopy: {when: ['wet', 'sunny'], mode: 'and'}},
  flavor: 'A green film on still water. Give it sun and a wet day, and by evening there are two.',
  numericId: 9126, uuid: 'b1c0a1ae-0b1d-5a19-9c3e-7a2c6f0d1e26', awaitingSource: true};
function cardsStep(){
  const cards = readCards(), by = id=> cards.find(c=> c.id === id);
  const fc = by('fungal-colossus'), pb = by('puffball-bombardier'), lf = by('lotus-frog'), nv = by('nectar-vintner'), tb = by('test-skill-bloom');
  fc.effects = Object.assign({}, fc.effects, {bloomCopy: {when: ['wet', 'sunny'], mode: 'and', lumber: 1}});
  note(fc, `${NOTE}: Bloom (Wet & Sunny + 1 Lumber), the owner's first example (11:23).`);
  pb.effects = Object.assign({}, pb.effects, {bloomCopy: {when: ['wet', 'kill'], mode: 'and'}});
  note(pb, `${NOTE}: Bloom (Wet & Killed an enemy), the owner's "another Fungi" (11:23); a third skill beside Arrow and Poison, a thematic exception (call BL-4).`);
  if(lf.effects && lf.effects.bloomWhen){ delete lf.effects.bloomWhen; }
  lf.effects = Object.assign({}, lf.effects, {bloomCopy: {when: ['tide', 'night'], mode: 'and'}});
  note(lf, `${NOTE}: Bloom (Tide & Night) replaces Bloom When +2/+2 (the old Bloom (conditions)); the same conditions.`);
  if(nv.effects && nv.effects.bloom != null) delete nv.effects.bloom;
  nv.effects = Object.assign({}, nv.effects, {healing: 1});
  note(nv, `${NOTE}: Healing 1 replaces the old Bloom 1 heal (owner 11:23: "Nectar Vincter - change to Heal.").`);
  if(tb){ tb.effects = {bloomCopy: {when: ['wet'], mode: 'and'}};
    tb.flavor = 'Carries only Bloom (Wet) -- +1/+1 and a copy of itself beside it, once, the first round it is Wet -- and nothing else, for testing this one mechanic in isolation. Not for balance.'; }
  if(!by(ALGAE.id)){ if(cards.some(c=> c.numericId === ALGAE.numericId)) throw new Error('numericId ' + ALGAE.numericId + ' taken'); cards.push(Object.assign({}, ALGAE)); }
  note(by(ALGAE.id), `${NOTE} (owner 11:23: "For Algae, just 'Wet' & 'Sunny' is sufficient."): no algae card existed, so this one carries Bloom (Wet & Sunny). Stats by the budget (fit below). Art: placeholder (the emoji). Awaiting a source (call BL-3).`);
  writeCards(cards); console.log('cards: Fungal Colossus, Puffball Bombardier, Lotus Frog, Nectar Vintner, Test: Bloom, Pond Algae');
}
// the budget line at Level 1 on the card's own A:H shape (the re-fit's search), for the new card (not a BF6 band card)
function fitShape(c, T, SC){ const sA = c.attack || 0, sH = Math.max(1, c.health || 1); let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), d = Object.assign({}, c, {attack: A, health: H}), b = T.budget(d, {level: 1});
    const u = b.ok && b.x1 / b.N <= 1 ? b.x1 / b.N : 0; if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u}; }
  return best; }
function refitStep(){
  const before = readCards(), old = new Map(before.map(c=> [c.id, {attack: c.attack, health: c.health, creatorNote: c.creatorNote}]));
  const flagged0 = JSON.parse(fs.readFileSync(FLAGGED, 'utf8'));
  const ids = path.join(require('os').tmpdir(), 'bl-refit-ids.json'); fs.writeFileSync(ids, JSON.stringify(REFIT));
  console.log(cp.execFileSync('node', [path.join(ROOT, 'tools', 'refit_pass_2026_10_21.js'), ids, 'apply', '--list-all', `--note=${NOTE} re-fit (Bloom priced by the budget; Nectar Vintner's Healing)`], {cwd: ROOT, encoding: 'utf8'}));
  const cards = readCards(), held = [];
  cards.forEach(c=>{ const o = old.get(c.id); if(!o || !REFIT.includes(c.id)) return; const w0 = 2 * (o.attack || 0) + (o.health || 0), w1 = 2 * (c.attack || 0) + (c.health || 0);
    if(w1 < w0){ held.push({id: c.id, at: `${o.attack}/${o.health}`, refit: `${c.attack}/${c.health}`}); c.attack = o.attack; c.health = o.health; c.creatorNote = o.creatorNote;
      note(c, `${NOTE}: the re-fit would cut it ${o.attack}/${o.health} -> ${held[held.length - 1].refit}; held at its stats for review (call BL-5).`); } });
  // the new algae card: fit on its 1:6 shape
  const SC = require('./card_retune_2026_10_19.js').SC, T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const al = cards.find(c=> c.id === ALGAE.id), fit = fitShape(al, T, SC);
  if(fit && (fit.A !== al.attack || fit.H !== al.health)){ note(al, `Fit: ${al.attack}/${al.health} -> ${fit.A}/${fit.H} (${Math.round(fit.u * 100)}% of N).`); al.attack = fit.A; al.health = fit.H; }
  writeCards(cards);
  const now = JSON.parse(fs.readFileSync(FLAGGED, 'utf8')), merged = [...new Set(flagged0.concat(now))].sort();
  fs.writeFileSync(FLAGGED, JSON.stringify(merged, null, 1) + '\n');
  fs.writeFileSync(HELD, JSON.stringify({_about: 'Package BL (2026-10-23): band cards whose Bloom / Healing re-fit would have cut their stats; held at their stats for the owner (call BL-5).', held}, null, 1) + '\n');
  console.log(`held ${held.length}: ${held.map(h=> h.id + ' ' + h.at + ' (re-fit ' + h.refit + ')').join(', ') || 'none'}; flagged list ${flagged0.length} -> ${merged.length}`);
}
function checkStep(){
  const SC = require('./card_retune_2026_10_19.js').SC, T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  readCards().filter(c=> REFIT.concat([ALGAE.id]).includes(c.id)).forEach(c=>{ const b = T.budget(c, {level: 1});
    console.log(`${c.id.padEnd(22)} ${c.attack}/${c.health}  S ${b.S}  N ${b.N}  x1 ${b.x1} (${Math.round(b.x1 / b.N * 100)}%)  x2 ${b.x2} / ${b.N2}  ${b.ok ? 'ok' : 'OVER'}`); });
}
const step = process.argv[2];
if(step === 'cards') cardsStep(); else if(step === 'refit') refitStep(); else if(step === 'check') checkStep(); else console.log('usage: cards | refit | check');
