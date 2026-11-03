#!/usr/bin/env node
// Package DEC1 (2026-11-03, owner 11-03 09:39: "Balance items you can choose. Like ENG and FIX and UI." and "BAL14-3: Okay. But if we're
// already further along the roadmap, don't have to rebalance for now. Just change the budget."): the coordinator's open calls taken at
// their defaults (docs/decisions.json), and what each chosen option needs:
//   1. decisions: the 35 calls DONE, decided 2026-11-03, "Claude's call (owner 11-03 09:39 ...)"; the owner's own left YET;
//   2. budget: Flying x1.19 / Evasive x1.18 (BAL14-2 a); an On Ready / On Spawn Lumber gain = onReadyGold x 0.39 x N^0.71 (BAL14-3);
//      the tempo term stays on cap 2 (BAL12-3);
//   3. cards: Royal Guard On Play +3 Shield to every ally at 3/6 (ENG19-2), Oyster Bank / Giant Clam Pearl 1 (ENG19-3), Glass Octopus 4/7
//      (BAL12-2 a), 19-6's reward Anvilwhisker Otter and Echidna Quillshot a pack card, out of the 19-6 deck (BAL12-6 a / BAL13-2 a);
//      each named card within the budget band but Giant Clam (out of play, flagged);
//   4. engine: a middle- / back-row Spawner spawns into its own row (ENG18-5 b); a front-row one into the front row; a Spawner card plays
//      a one-row fight as before.
//   node tests/dec1-2026-11-03.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const cards = J('canonical/cards.json'), C = {}; cards.forEach(c => { C[c.id] = c; });

// ---- 1. decisions
{ const d = J('docs/decisions.json'), by = {}; d.items.forEach(x => { by[x.id] = x; });
  const ids = ['BAL12-1', 'BAL12-2', 'BAL12-3', 'BAL12-4', 'BAL12-5', 'BAL12-6', 'BAL13-1', 'BAL13-2', 'BAL13-3', 'BAL13-4', 'BAL14-1', 'BAL14-2', 'BAL14-3', 'BAL14-4',
    'ENG18-1', 'ENG18-2', 'ENG18-3', 'ENG18-4', 'ENG18-5', 'ENG19-1', 'ENG19-2', 'ENG19-3', 'ENG19-4', 'ENG19-5', 'ENG20-1', 'ENG20-3', 'ENG20-4', 'ENG20-5',
    'FIX6-1', 'FIX6-2', 'FIX6-3', 'UI16-1', 'UI16-2', 'UI16-3', 'UI16-4'];
  const bad = ids.filter(id => !(by[id] && by[id].status === 'DONE' && by[id].decided === '2026-11-03' && /^Claude's call \(owner 11-03 09:39: 'Balance items you can choose\. Like ENG and FIX and UI\.'\): \S/.test(by[id].outcome || '') && by[id].group === 'game'));
  ok(!bad.length, `the ${ids.length} calls are DONE, decided 2026-11-03, Claude's call with the owner's words (${bad.join(', ') || 'all'})`);
  ok(['ENG20-2', 'RELICT-1', 'LEAD-NAT-1'].every(id => by[id] && by[id].status === 'YET') && !d.items.some(x => /^IDEA-/.test(x.id) && /Claude's call \(owner 11-03 09:39/.test(x.outcome || '')), 'the owner\'s own calls stay with him (ENG20-2, RELICT-1, LEAD-NAT-1 YET; no IDEA-* decided by DEC1)');
  const lines = fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8').split('\n');
  ok(ids.every(id => lines.some(l => l.startsWith('    {"id": "' + id + '", '))), 'one item a line, id first'); }

// ---- 2. budget
{ const B = require(path.join(ROOT, 'bramblewood-budget.js'));
  ok(B.MISS_MULT_BY.flying === 1.19 && B.MISS_MULT_BY.evasive === 1.18 && B.MISS_MULT_BY.shadow === 1.1, 'BAL14-2 a: Flying x1.19, Evasive x1.18 (Shadow x1.1 kept)');
  const g = a => B.lumberGainS(6.65, { on: 'onReady', do: 'gain', resource: 'lumber', amount: a });
  ok(B.LUMBER_GAIN_MULT === 0.39 && B.LUMBER_GAIN_POW === 0.71 && g(1) === 2.59 && g(2) === 4.24 && g(3) === 5.66, `BAL14-3: On Ready gain 1 / 2 / 3 Lumber at onReadyGold 6.65: ${g(1)} / ${g(2)} / ${g(3)} (measured 2.65 / 4.40 / 5.53; was 6.65 / 7.51 / 8.06)`);
  ok(B.lumberGainS(6.65, { on: 'onSpawn', do: 'gain', resource: 'lumber', amount: 1 }) === 2.59 && B.lumberGainS(6.65, { on: 'onKill', do: 'gain', resource: 'lumber', amount: 1 }) === null, 'BAL14-3: On Spawn priced the same; an On Kill gain keeps its pair price');
  ok(B.TEMPO_CAP2_MULT === 0.85, 'BAL12-3 a: the tempo term stays on cap 2 (x0.85)'); }

// ---- 3. cards
{ process.env.SKILL2_MISSMULT = process.env.SKILL2_MISSMULT || '1'; process.env.SKILL2_NO_NAMED = '1';
  const R = require(path.join(ROOT, 'tools', 'skill2_refit_2026_10_31.js')), v = id => R.verdict(R.NEW, C[id]);
  const rg = C['otter-royal-guard'];
  ok(rg.attack === 3 && rg.health === 6 && JSON.stringify(rg.effects) === JSON.stringify({ triggers: [{ on: 'onSpawn', do: 'grantShield', allies: 3 }] }) && v('otter-royal-guard').ok, `ENG19-2: Royal Guard 3/6, On Play +3 Shield to every ally, in band (use ${v('otter-royal-guard').use})`);
  ok(C['oyster-bank'].effects.pearl === 1 && !C['oyster-bank'].effects.pearlBed && C['giant-clam'].effects.pearl === 1 && !C['giant-clam'].effects.pearlBed && C['oyster-bank'].health === 13 && C['giant-clam'].attack === 5 && C['giant-clam'].health === 5, 'ENG19-3: Oyster Bank and Giant Clam Pearl 1 (not Pearl Bed), stats kept');
  ok(v('oyster-bank').ok && v('giant-clam').over, `ENG19-3: Oyster Bank in band (${v('oyster-bank').use}); Giant Clam reads over (${v('giant-clam').use}, out of play: flagged)`);
  ok(C['glass-octopus'].attack === 4 && C['glass-octopus'].health === 7 && v('glass-octopus').ok, `BAL12-2 a: Glass Octopus 4/7, in band (${v('glass-octopus').use})`);
  const ap = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), i0 = ap.indexOf('const CONQUEST_MAPS = ['), j0 = ap.indexOf('\n];', i0);
  // eslint-disable-next-line no-eval
  const MAPS = eval(ap.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2)), m3 = MAPS.find(m => m.id === 'm3'), n6 = m3.nodes.find(x => x.key === '19-6');
  ok(JSON.stringify(C['anvilwhisker-otter'].source) === JSON.stringify({ kind: 'map', id: 'm3', node: '19-6' }) && JSON.stringify(C['echidna-quillshot'].source) === JSON.stringify({ kind: 'pack', tier: 3 }) && C['echidna-quillshot'].rarity === 'superrare',
    'BAL12-6 a: 19-6\'s exclusive reward is Anvilwhisker Otter; Echidna Quillshot a tier-3 pack card, still Super Rare (RAR-1)');
  const size = d => Object.values(d).reduce((a, b) => a + b, 0);
  ok(!n6.deck['echidna-quillshot'] && n6.deck['pit-glutton'] === 1 && n6.deck['yeti-chieftain'] === 1 && size(n6.deck) === 18, `BAL12-6 a / BAL13-2 a: the 19-6 deck swaps Echidna Quillshot for Pit Glutton, size kept (${size(n6.deck)})`);
  const oc = cp.spawnSync('node', ['tools/bal13/decks_2026_11_02.js', 'overcap'], { cwd: ROOT, encoding: 'utf8' }).stdout || '';
  ok(/: 0 to swap, 0 kept and flagged/.test(oc), 'BAL13-2 a: no road fight fields a card over its rarity cap (overcap: 0 to swap, 0 flagged)');
  ok(['echidna-quillshot', 'anvilwhisker-otter'].every(id => v(id).ok), 'the moved reward cards stay in band');
  const obt = J('canonical/card-obtain-maps.json'); ok(obt.maps['anvilwhisker-otter'] === 19, 'card-obtain-maps: Anvilwhisker Otter obtainable on Map 19'); }

// ---- 4. engine: a Spawner's row (ENG18-5 b)
{ const H = require('./lib/harness.js'), E = H.Engine, so = id => id === 1 ? 'A' : 'B';
  const U = (id, effects, o) => Object.assign({ id, name: id, attack: 0, health: 500, wait: 0, cost: 0, effects: effects || {} }, o || {});
  const defs = Object.assign({}, H.loadCardDefs(), { 'dc-tok': U('dc-tok', {}, { health: 3 }), 'dc-spawner': U('dc-spawner', { spawner: 'dc-tok' }) });
  const all = pl => [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const rowsOf = pl => [all(pl)].concat((pl.reserve || []).map(rw => Object.values(rw)));
  const mk = o => { const e = E.makeSimEngine(defs, E.mulberry32(7), Object.assign({ recordEvents: true, battleMode: 'open' }, o || {})); return { e, P: { 1: e.newPlayer(1, {}, { health: 200 }), 2: e.newPlayer(2, {}, { health: 200 }) } }; };
  const front = (e, P, id) => { e.debugSpawnCard(P, so, 1, id, 'left', {}, []); const c = all(P[1]).reduce((a, x) => (!a || x.uid > a.uid) ? x : a, null); c.slot = 0; P[1].row.left = []; P[1].row.right = []; P[1].row.center = [c]; e.syncSlots(P[1]); return c; };
  const ROWS = ['front', 'middle', 'back'];
  [0, 1, 2].forEach(ar => { const { e, P } = mk({ reserveRows: 2, reserveActs: true }); const s = ar === 0 ? front(e, P, 'dc-spawner') : e.fillReserve(P[1], ar, 0, 'dc-spawner'); s.wait = 0;
    const ev = []; e.resolveCombat(P, so, {}, ev, 1); e.resolveCombat(P, so, {}, ev, 1); const rows = rowsOf(P[1]);
    const where = rows.map((rw, i) => rw.filter(c => c.defId === 'dc-tok').length);
    const spEv = ev.filter(x => x.type === 'spawn' && x.kind === 'spawner');
    ok(where[ar] >= 1 && where.every((k, i) => i === ar || !k) && spEv.length >= 1 && spEv.every(x => ar ? x.row === ar : x.row == null),
      `[${ROWS[ar]}] a Spawner's unit comes up in its own row, the event names the row (tokens a row: ${where.join('/')})`); });
  { const { e, P } = mk(); const s = front(e, P, 'dc-spawner'); s.wait = 0; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
    const toks = all(P[1]).filter(c => c.defId === 'dc-tok'); ok(toks.length >= 1 && toks.every(c => Math.abs(c.slot) === 1), `one-row fight: the token beside it, as before (slots ${toks.map(c => c.slot).join(',')})`); }
}

console.log(`dec1-2026-11-03: ${fail ? fail + ' of ' + n + ' failed' : 'all ' + n + ' passed'}`);
process.exit(fail ? 1 : 0);
