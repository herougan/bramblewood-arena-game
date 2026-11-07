#!/usr/bin/env node
// Package BAL9 (2026-11-02, owner 11-02 00:17 JJ5 JJ7 JJ12 JJ21 JJ22 JJ24, 00:18 JJ28): reference / skirmish decks against the THEME4 lists,
// rarities against the ladder, the budget band, Grey Seal Bull, defenders, the Map 40+ deck-fill rule.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const run = (args) => { const r = cp.spawnSync('node', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); return (r.stdout || '') + (r.stderr || ''); };
const cards = J('canonical/cards.json'), C = {}; cards.forEach(c => { C[c.id] = c; });

// ---- JJ24: no cut card in any road, endless or PRO / BPRO deck -------------------------------------------------------------------
{ const out = run(['tools/bal9/decks_2026_11_02.js', 'cuts', '--check']).split('\n')[0];
  ok(/^decks with cut cards: 0 /.test(out), `JJ24 no deck holds a cut card (${out})`);
  ok(/reference decks: clean/.test(out), 'JJ24 the Map reference decks hold no cut card');
  const plan = J('docs/balance/bal9/cuts-2026-11-02.json');
  ok(plan.rows.length > 100 && plan.cutCards.includes('minnow-skitter'), `JJ24 the applied swap is on record (${plan.rows.length} decks, ${plan.cutCards.length} cut cards, Minnow Skitter among them)`);
  ok(plan.rows.filter(r => !r.pro).every(r => Object.values(r.before).reduce((a, b) => a + b, 0) === Object.values(r.after).reduce((a, b) => a + b, 0)), 'JJ24 every swapped road deck kept its size');
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ok(!/'mk:9-2': 'minnow-skitter'/.test(src) && !/"minnow-skitter":\d/.test(src.slice(src.indexOf('const CONQUEST_MAPS'), src.indexOf('const CONQUEST_MAPS') + 3e6)), 'JJ24 Minnow Skitter is out of the Kelp Mangroves fights and their first-clear table'); }

// ---- JJ12: reward slots and rarities --------------------------------------------------------------------------------------------
{ const r = run(['tools/bal9/cards_2026_11_02.js', 'rewards', '--check']).split('\n')[0];
  ok(/^reward slots re-filled: 0 /.test(r), `JJ12 every reward slot holds a new card of its map (${r})`);
  const q = run(['tools/bal9/cards_2026_11_02.js', 'rarity', '--check']).split('\n')[0];
  // 2026-11-03 (DEC1, BAL12-6 a): Echidna Quillshot keeps RAR-1's Super Rare (owner 11-02 20:19) as a pack card of Map 19, held like Dolphin Knight (HH6)
  const low = run(['tools/bal9/cards_2026_11_02.js', 'rarity', '--check']).split('\n').filter(l => /^\s+\S+\s+\S+\s+->/.test(l)).map(l => l.trim().split(/\s+/)[0]);
  ok(/^rarity lowered: \d+;/.test(q) && low.every(id => id === 'echidna-quillshot'), `JJ12 every listed card is at or below its first list's cap (${q}; held by RAR-1: ${low.join(', ') || 'none'})`);
  ok(C['old-shell'].rarity === 'uncommon' && C['old-shell'].effects.leader === true, `JJ12 Old Shell (Map 2) is Uncommon and still leads (${C['old-shell'].rarity}, leader ${C['old-shell'].effects.leader})`);
  ok(C['dolphin-knight'].rarity === 'rare', 'JJ12 Dolphin Knight stays Rare (owner HH6: limits ignored)');
  ok(C['hedgehog-scout'].unattainable === true && C['lyrebird-mimic'].source.kind === 'map' && C['lyrebird-mimic'].source.node === '12-5', 'JJ12 Hedgehog Scout (cut) is out of play; Lyrebird Mimic holds the 12-5 reward slot');
  const applied = J('docs/balance/bal9/applied-2026-11-02.json'); ok(applied.passes.some(p => p.step === 'rarity' && p.edits.length >= 15), 'JJ12 the rarity pass is on record'); }

// ---- JJ21: the budget band -----------------------------------------------------------------------------------------------------
{ const r = run(['tools/bal9/cards_2026_11_02.js', 'refit', '--check']);
  // 2026-11-03 (DEC1, BAL14-2 a): Echo Matriarch at cap-1 use 1.00 once Flying went to x1.19, held for the owner's card pass (no re-fit, owner 11-03 09:39)
  const fits = r.split('\n').filter(l => /^\s{2}\S/.test(l) && !/^\s+listed /.test(l)).map(l => l.trim().split(/\s+/)[0]);
  ok(/^re-fit: \d+;/.test(r.split('\n')[0]) && fits.every(id => id === 'echo-matriarch'), `JJ21 no in-play card outside the band but the listed ones (${r.split('\n')[0]}; DEC1 holds: ${fits.join(', ') || 'none'})`);
  // 2026-11-02 (BAL11): + the cards BAL11's budget fit held for the owner (decision BAL11-2, docs/balance/bal11/refit-2026-11-02.json)
  // 2026-11-02 (BAL12): + the cards BAL12's budget fit held (docs/balance/bal12/refit-2026-11-02.json)
  // 2026-11-03 (BAL14): + the cards BAL14's re-fit held (docs/balance/bal14/refit-2026-11-03.json, decision BAL14-1)
  const listed = r.split('\n').filter(l => /^\s+listed /.test(l)), why = l => /egg \/ equipment|named owner card|held for the owner by BAL1[124]/.test(l);
  ok(listed.length > 0 && listed.every(why), `JJ21 the cards left outside are eggs, equipment and the owner's named cards (${listed.filter(l => !why(l)).map(l => l.trim().split(' ')[1]).join(', ') || listed.length})`);
  const obtain = run(['tools/forge_curve_2026_10_19.js', 'maps', '--check']); ok(/current/.test(obtain), 'JJ21 canonical/card-obtain-maps.json is current'); }

// ---- JJ5: Grey Seal Bull and the urchin ---------------------------------------------------------------------------------------
ok(C['grey-seal-bull'].attack === 3 && C['grey-seal-bull'].health === 12, `JJ5 Grey Seal Bull 3/12 (${C['grey-seal-bull'].attack}/${C['grey-seal-bull'].health})`);
// 2026-11-02 (release 11-02a): BAL9's 2/3 was reverted to the owner-set 2/4 (BAL-ROLES: Claude does not re-tune owner-set cards)
ok(C['pincushion-urchin'].attack === 0 && C['pincushion-urchin'].health === 6, 'JJ5 Pincushion Urchin 0/6 (owner-set, BAL-ROLES; his live edit of 2026-11-05 folded in by CONTENT12)');
ok(fs.existsSync(path.join(ROOT, 'docs/balance/bench-contrib-map02-mb-bpro-2026-11-02-bal9.json')), 'JJ5 the Map 2 contribution run is on file');

// ---- JJ28: a defender on every main map 1-19 -----------------------------------------------------------------------------------
{ const DK = require(path.join(ROOT, 'tools', 'bal9', 'decks_2026_11_02.js')), o = DK.cmdDefenders(false);
  const mains = o.lists.filter(l => l.map >= 1 && l.map <= 19 && !/^m(tut|o)/.test(l.loc) && !l.loc.includes('_')).filter(l => J('canonical/map-pools.json').maps[l.loc]);
  ok(mains.every(l => l.defenders.length > 0), `JJ28 every main map 1-19 has a defender on its list (${mains.filter(l => !l.defenders.length).map(l => l.loc).join(', ') || mains.length + ' maps'})`);
  const plan = J('docs/balance/bal9/defenders-plan-2026-11-02.json'); ok(plan.edits.length >= 8 && plan.edits.every(e => C[e.id].effects.guardian === true), `JJ28 the Guardian walls are applied (${plan.edits.length})`);
  const sk = J('canonical/skill-costs.json').skills.find(x => x.id === 'bulwark'); ok(sk && ((sk.pow > 0 && sk.pow < 1) || (sk.eng33Was && sk.eng33Was.pow > 0 && sk.eng33Was.pow < 1 && sk.pow === 1)), /* 2026-11-07 (ENG33): N Log Walls, linear by reasoning; the measured curve kept in eng33Was */ `JJ28 Bulwark is priced by its measured curve, or linear since ENG33 (v x N^${sk && sk.pow})`); }

// ---- JJ22: the Map 40+ deck-fill rule ------------------------------------------------------------------------------------------
{ const L = require(path.join(ROOT, 'tools', 'bal9', 'lib_bal9.js')), step = r => ['common', 'uncommon', 'rare', 'veryrare'].indexOf(r);
  const r1 = L.fillDeckToSize({ a: 2 }, { size: 20, capOf: id => 4, own: ['a', 'b', 'c'], carried: [{ id: 'x', rarity: 'rare' }, { id: 'y', rarity: 'common' }, { id: 'z', rarity: 'common' }], rarityStep: step });
  ok(r1.added.join(',') === 'y,z' && r1.short === 0 && r1.deck.a === 4 && r1.deck.y === 4 && r1.deck.z === 4, `JJ22 own cards first, then one carried card at a time, lower rarity first (${JSON.stringify(r1)})`);
  const r2 = L.fillDeckToSize({}, { size: 20, capOf: id => 5, own: ['a', 'b', 'c', 'd'], carried: [{ id: 'x', rarity: 'common' }], rarityStep: step });
  ok(r2.added.length === 0, 'JJ22 no carried card when the own cards fill the deck');
  const B = require(path.join(ROOT, 'tools', 'opt', 'bpro2_2026_10_31.js')); ok(B.CARRY_FROM === 40 && typeof B.carriedFor === 'function', 'JJ22 the BPRO build carries from Map 40'); }

// ---- JJ7: the progression reference decks and the economy table ----------------------------------------------------------------
{ const set = J('docs/balance/ref/ref5-prog.json'), R5 = require(path.join(ROOT, 'tools', 'opt', 'ref5_prog.js')), gm = R5.game();
  const DK = require(path.join(ROOT, 'tools', 'bal9', 'decks_2026_11_02.js'));
  const maps = Object.keys(set.decks).map(Number).filter(m => m <= 20), bad = [];
  maps.forEach(m => (set.decks[m] || []).forEach(e => { const tot = Object.values(e.counts).reduce((a, b) => a + b, 0);
    if (tot !== 20) bad.push(`${m}/${e.seed}: ${tot} cards`); if (!e.leader || !e.bramble) bad.push(`${m}/${e.seed}: no leader or bramble`);
    Object.keys(e.counts).filter(DK.isCut).forEach(id => bad.push(`${m}/${e.seed}: cut ${id}`));
    (e.parts || []).forEach(p => { if (p[2] !== R5.mapLevelOf(gm, p[0], m)) bad.push(`${m}/${e.seed}: ${p[0]} Lv ${p[2]} (map level ${R5.mapLevelOf(gm, p[0], m)})`); }); }));
  ok(maps.length === 21 && set.runs[20] && /bal9/.test(set.runs[20].tag) && !bad.length, `JJ7 21 maps x 5 decks rebuilt (tag ${set.runs[20] && set.runs[20].tag}): 20 cards, a leader and a bramble, no cut card, the map's level (${bad.slice(0, 6).join('; ') || 'all'})`);
  const chk = run(['tools/opt/ref_decks.js', '--check']); ok(/up to date/.test(chk), 'JJ7 the decks are baked into arena_app.js (ref_decks --check)');
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'); ok(/leader: e\.leader \|\| null, bramble: e\.bramble \|\| null/.test(src), 'JJ7 refSetFor deals the deck\'s leader and bramble');
  const econ = J('docs/balance/bal9/econ-2026-11-02.json'); ok(econ.rows.length === 21 && econ.rows.every((r, i) => !i || r.packsOpened >= econ.rows[i - 1].packsOpened) && econ.rows[11].deckLevel === 3, 'JJ7 the packs / levels table covers Maps 0-20 (Lv 3 at Map 11)'); }

// ---- records -------------------------------------------------------------------------------------------------------------------
{ const d = J('docs/decisions.json'); ok(['BAL9-1', 'BAL9-2', 'BAL9-3', 'BAL9-4'].every(id => d.items.some(x => x.id === id)), 'decisions BAL9-1..4 recorded');
  const ch = fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8'); /* 2026-11-02 (coordinator): whole file, later entries push it down */ ok(/BAL9/.test(ch), 'a BAL9 entry near the top of the CHANGELOG'); }

console.log(`bal9-2026-11-02: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
