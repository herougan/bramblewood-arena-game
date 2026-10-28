// 2026-10-28 (package TOOLS1): the workbench's self-checks (node tools/bench/bench.js check; tests/tools1-2026-10-28.js runs them).
// About a minute on 2 cores: legal random decks and rests, deterministic fights, the slot and its variants, the cache, the skill plan,
// and T3's deck rule (6 different cards, 4 copies) on a small search.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const L = require('./lib.js');

async function run(o) {
  const problems = [], P = s => problems.push(s), gm = L.O.loadGame(L.ROOT), cache = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-check-'));
  try {
    // ---- contexts, decks, rests
    const X = L.contextOf(gm, { kind: 'global', seed: 'check', k: 6 });
    for (let i = 0; i < 200; i++) { const f = L.fightOf(gm, X, i), tot = d => Object.values(d).reduce((a, b) => a + b, 0);
      if (tot(f.B) !== 20) P(`fight ${i}: B has ${tot(f.B)} cards`); if (tot(f.R) !== 14) P(`fight ${i}: the rest has ${tot(f.R)} cards`);
      [f.B, f.R].forEach(d => { const chk = {}; Object.keys(d).forEach(id => { if (!X.pool.includes(id)) P(id + ' not in the pool'); for (let k = 0; k < d[id]; k++) { if (!L.O.canAdd(gm, chk, id)) P(`fight ${i}: ${id} x${d[id]} breaks a cap`); chk[id] = (chk[id] || 0) + 1; } }); });
      const c = Object.keys(f.R)[0], r = L.restFor(gm, X, i, c); if (r[c] || tot(r) !== 14) P(`fight ${i}: the rest without ${c} still holds it or lost its size`); }
    const Y = L.contextOf(gm, { kind: 'global', seed: 'check', k: 6 }); if (JSON.stringify(L.fightOf(gm, Y, 17)) !== JSON.stringify(L.fightOf(gm, X, 17))) P('fights are not deterministic');
    if (L.contextOf(gm, { kind: 'global', seed: 'other', k: 6 }).key === X.key) P('the context key ignores the seed');
    const M3 = L.contextOf(gm, { kind: 'map', map: '3', seed: 'check', k: 6 }); if (!M3.pool.length || M3.pool.length > 60 || !M3.fields.length) P('Map 3 context: pool ' + M3.pool.length + ', fields ' + M3.fields.length);
    // ---- variants: removing a skill takes its parameters; adding copies them; keys are canonical
    const arrowCard = X.pool.find(id => (gm.D[id].effects || {}).arrow && Object.keys(gm.D[id].effects).some(k => k.startsWith('arrow') && k !== 'arrow'));
    if (arrowCard) { const e = L.variantEffects(gm, gm.D[arrowCard].effects, { base: arrowCard, rm: ['arrow'] }); if (Object.keys(e).some(k => k.startsWith('arrow'))) P('removing arrow left ' + Object.keys(e).filter(k => k.startsWith('arrow')).join(', ')); }
    if (L.vKey({ base: 'x', dH: 1, rm: ['b', 'a'] }) !== L.vKey({ rm: ['a', 'b'], base: 'x', dH: 1 })) P('variant keys are not canonical');
    const defs = gm.G.referenceBaseDefs(), card = X.pool.find(id => gm.D[id].attack >= 1 && gm.D[id].health >= 3), plain = L.slotMine(gm, defs, { base: card }, 1, 6), bump = L.slotMine(gm, defs, { base: card, dH: 1 }, 1, 6);
    const pd = defs[Object.keys(plain)[0]], bd = defs[Object.keys(bump)[0]]; if (!pd || !bd || bd.health !== pd.health + 1 || bd.attack !== pd.attack) P('+1 Health variant: ' + (pd && pd.health) + ' -> ' + (bd && bd.health));
    // ---- games: deterministic, a no-op variant plays the very same games as the card (the engine does not read the variant's id)
    const play = L.makeGame(gm, X), play2 = L.makeGame(gm, L.contextOf(gm, { kind: 'global', seed: 'check', k: 6 }));
    const a = [0, 1, 2, 3, 4, 5].map(i => play(i, { base: card }, card)).join(''), b = [0, 1, 2, 3, 4, 5].map(i => play2(i, { base: card }, card)).join(''); if (a !== b) P('games are not deterministic: ' + a + ' vs ' + b);
    const noop = [0, 1, 2, 3, 4, 5].map(i => play(i, { base: card, rm: ['noSuchSkill'] }, card)).join(''); if (noop !== a) P('a no-op variant plays other games than its card: ' + a + ' vs ' + noop);
    // ---- the cache: a second ask plays nothing; scores read back
    const B = new L.Bench({ cacheDir: cache, workers: 0, quiet: true, chunk: 5 }), BX = B.context({ kind: 'global', seed: 'check', k: 6 });
    const n1 = await B.need(BX, [{ v: { base: card } }, { v: null, card }], 6), n2 = await B.need(B.context({ kind: 'global', seed: 'check', k: 6 }), [{ v: { base: card } }, { v: null, card }], 6);
    if (n1 < 7 || n2 !== 0) P(`cache: first ask played ${n1}, the second ${n2} (want >= 7, then 0)`);
    if (B.scores(BX, { base: card }, card, 6).map(x => x === 1 ? '1' : x === 0 ? '0' : 'h').join('') !== a) P('cached scores differ from the games');
    // ---- the skill plan
    const S = require('./skill.js'), plan = S.plan(gm, X, { carriers: 3, minReal: 2 }), byS = {}; plan.skills.forEach(s => byS[s.skill] = s);
    if (!byS.flying || byS.flying.carriers.length !== 3 || byS.flying.carriers.some(c => c.synthetic)) P('plan: flying should have 3 real carriers');
    const lone = plan.skills.find(s => s.realCarriers === 1); if (!lone || lone.carriers.filter(c => c.synthetic).length !== plan.vanilla.length || plan.vanilla.length !== 2) P('plan: a one-card skill gets the two vanilla carriers');
    if (lone) { const sy = lone.carriers.find(c => c.synthetic), pdef = L.printedDef(gm, sy.with); if (!S.skillsOf(gm, pdef).includes(lone.skill)) P('plan: a vanilla carrier does not carry ' + lone.skill); }
    if (plan.skills.some(s => /(Hp|Grant)$/.test(s.skill))) P('plan: a parameter key is measured as a skill');
    // ---- T3: the deck rule holds on every deck a small search makes
    if (!fs.existsSync(path.join(__dirname, 'deck.js'))) return problems;
    const D = require('./deck.js'), r = await D.main({ map: '1', maxUnique: 6, maxCopies: 4, size: 20, budget: 240, finalGames: 4, workers: 0, quiet: true, seed: 'check', noSave: true, focus: ['open', 'swarm'] });
    if (!r.decks.length) P('deck: no decks');
    r.decks.forEach(d => { const ids = Object.keys(d.deck), tot = ids.reduce((t, id) => t + d.deck[id], 0);
      if (ids.length > 6 || ids.some(id => d.deck[id] > 4) || tot !== 20) P(`deck ${d.focus}: ${ids.length} different, max ${Math.max(...ids.map(id => d.deck[id]))} copies, ${tot} cards`);
      if (ids.some(id => !r.pool.includes(id))) P(`deck ${d.focus}: a card outside the list`); if (!d.labels.length) P(`deck ${d.focus}: no label`); });
  } finally { fs.rmSync(cache, { recursive: true, force: true }); }
  return problems;
}
module.exports = { run };
