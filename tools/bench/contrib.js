// 2026-10-28 (package TOOLS1, T1, owner 10-28 21:40: "1) a good way to measure cards contribution"): each card's contribution by paired
// swaps (tools/bench/lib.js): the same fights with k copies of the card in the slot and with k Blanks. Built on BAL6's contribution tool
// (its fieldable cards, its field pool, its fair mirror, Level 1, 30-Health brambles); BAL6's regression stays the all-cards-at-once view.
// Per card: the contribution of k copies (± 95%), per copy, against the average card measured, and value per budget point:
// per-copy contribution / N at the level played (bramblewood-budget.js). Fair cards sit near the line every card's points fit.
'use strict';
const path = require('path'), fs = require('fs');
const L = require('./lib.js');

async function run(B, o) {
  const X = B.context(L.csOf(o)), gm = B.gm, M = o.games;
  let cards = o.all || (!o.cards && o.map != null) ? X.pool.slice() : (o.cards || []);
  const bad = cards.filter(id => !gm.D[id] || !L.C.fieldable(gm, id)); if (bad.length) throw new Error('not fieldable: ' + bad.join(', '));
  if (!cards.length) throw new Error('contrib: name cards (--cards a,b), --all, or --map N');
  B.log(`contrib (${X.name}, Level ${X.level}, ${X.k} copies, ${M} fights a card, seed ${X.seed}): ${cards.length} card(s), pool ${X.pool.length}, ${X.fields.length} fields`);
  await B.need(X, cards.map(id => ({ v: { base: id } })).concat(cards.map(id => ({ v: null, card: id }))), M);
  return analyse(B, X, cards, M);
}
function analyse(B, X, cards, M) {
  const gm = B.gm, rows = cards.map(id => {
    const d = L.diff(B.scores(X, { base: id }, id, M), B.scores(X, null, id, M)), ms = L.meanSE(d), def = gm.D[id], b = L.budgetOf(def, X.level);
    const perCopy = ms.m / X.k;
    return { id, name: def.name || id, rarity: def.rarity || 'common', cost: def.cost || 0, wait: def.wait || 0, attack: def.attack, health: def.health, skills: Object.keys(def.effects || {}).sort(),
      contribution: L.r4(ms.m), se: L.r4(ms.se), perCopy: L.r4(perCopy), N: b.N, x1: b.x1, use: L.r4(b.x1 / b.N), vpb: L.r4(perCopy / b.N) };
  });
  // the fair line: per copy = a + b N over the measured cards (least squares), each card's distance from it; the index = vpb / the median vpb
  const n = rows.length, mx = rows.reduce((t, r) => t + r.N, 0) / n, my = rows.reduce((t, r) => t + r.perCopy, 0) / n;
  let sxy = 0, sxx = 0; rows.forEach(r => { sxy += (r.N - mx) * (r.perCopy - my); sxx += (r.N - mx) ** 2; });
  const slope = n > 2 && sxx ? sxy / sxx : 0, icpt = my - slope * mx, medV = L.median(rows.map(r => r.vpb)), meanC = rows.reduce((t, r) => t + r.contribution, 0) / n;
  rows.forEach(r => { r.vsAverage = L.r4(r.contribution - meanC); r.fair = L.r4(icpt + slope * r.N); r.vsFair = L.r4(r.perCopy - (icpt + slope * r.N)); r.z = r.se ? Math.round(r.vsFair / (r.se / X.k) * 100) / 100 : null; r.index = medV ? L.r4(r.vpb / medV) : null; });
  rows.sort((a, b) => b.vsFair - a.vsFair);
  return { tool: 'tools/bench/bench.js contrib ' + L.VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(),
    context: { name: X.name, kind: X.cs.kind, map: X.mapId, mode: X.cs.kind === 'map' ? X.cs.mode : null, level: X.level, copies: X.k, seed: X.seed, fights: M, pool: X.pool.length, fields: X.fields.length },
    fairLine: { intercept: L.r4(icpt), perN: L.r4(slope), medianVpb: L.r4(medV), meanContribution: L.r4(meanC) },
    medianCI: L.r4(1.96 * L.median(rows.map(r => r.se))), cards: rows };
}
function md(res) {
  const c = res.context, f = res.fairLine, line = r => `| ${r.name} | ${r.rarity} | ${r.cost} | ${r.attack}/${r.health} | ${r.skills.join(', ') || '-'} | ${r.N} | ${L.pp(r.contribution)} ± ${(r.se * 196).toFixed(1)} | ${L.pp(r.perCopy)} | ${(r.vpb * 100).toFixed(2)} | ${r.index} | ${L.pp(r.vsFair)} | ${r.z} |`;
  const head = '| Card | Rarity | Lumber | A/H | Skills | N | Contribution (95%) | Per copy | Value / budget pt | Index | vs fair line | z |\n|---|---|---|---|---|---|---|---|---|---|---|---|';
  const R = res.cards, top = R.slice(0, 20), bot = R.slice(-20).reverse();
  return [`# Card value per budget point (${c.name}, ${res.generated.slice(0, 10)})`, '',
    `Package TOOLS1 (T1). \`node tools/bench/bench.js contrib${c.kind === 'map' ? ' --map ' + c.map : ''} --all --games ${c.fights}\` (${res.tool}); game fingerprint \`${res.fingerprint}\`.`, '',
    '## How it is measured', '',
    `- ${c.fights} fights a card. Fight i: an opponent deck and a rest of ${20 - c.copies} cards, both random and legal from the ${c.pool}-card pool, and one of ${c.fields} fields. The slot (${c.copies} copies) completes the rest into 20 cards: once with the card, once with ${c.copies} Blanks (0/1, 0 Lumber, no skill). Same fights, same engine seeds, the same deck order: a paired difference.`,
    `- Level ${c.level}, both brambles a plain 30 Health, the Smart CPU on both sides, seats swapped every other fight (BAL6's fair mirror).`,
    '- **Contribution**: win-rate points the copies add over Blanks. **Per copy**: / ' + c.copies + '. **Value per budget point**: per copy / N (N at the level played, `bramblewood-budget.js`), in hundredths of a point. **Index**: value per budget point / the median (1.00 = a typical card).',
    `- **Fair line**: per copy = ${L.pp(f.intercept)} + ${(f.perN * 100).toFixed(3)} x N points, fitted over these cards. **vs fair line**: a card's per-copy contribution minus the line at its N; z = that over its standard error. Positive: stronger than its budget buys; negative: weaker.`,
    `- Median 95% interval of a contribution: ±${(res.medianCI * 100).toFixed(1)} points. Random decks: a card that needs partners reads low.`, '',
    '## Most value per budget point (above the fair line)', '', head, ...top.map(line), '',
    '## Least value per budget point (below the fair line)', '', head, ...bot.map(line), '',
    '## Every card', '', 'Sorted by distance from the fair line.', '', head, ...R.map(line), ''].join('\n');
}
function print(res, log) {
  log(`fair line: per copy ${L.pp(res.fairLine.intercept)} + ${(res.fairLine.perN * 100).toFixed(3)} x N points; median value / budget pt ${(res.fairLine.medianVpb * 100).toFixed(3)}`);
  log('card                          N    contribution     per copy  value/pt  index  vs fair   z');
  res.cards.forEach(r => log(`${(r.name + ' (' + r.rarity + ')').slice(0, 28).padEnd(28)} ${String(r.N).padStart(5)}  ${L.pp(r.contribution).padStart(6)} ±${(r.se * 196).toFixed(1).padStart(4)}  ${L.pp(r.perCopy).padStart(8)}  ${(r.vpb * 100).toFixed(3).padStart(7)}  ${String(r.index).padStart(5)}  ${L.pp(r.vsFair).padStart(6)}  ${r.z}`));
}
function save(res, o) {
  const f = path.join(o.out, `bench-contrib-${res.context.name}-${o.tag}.json`); fs.mkdirSync(o.out, { recursive: true });
  fs.writeFileSync(f, JSON.stringify(res, null, 0).replace(/,"cards":\[/, ',\n"cards":[\n').replace(/\},\{"id"/g, '},\n{"id"') + '\n');
  fs.writeFileSync(f.replace(/\.json$/, '.md'), md(res)); return f;
}
module.exports = { run, analyse, md, print, save };
