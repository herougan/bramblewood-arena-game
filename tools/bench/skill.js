// 2026-10-28 (package TOOLS1, T2, owner 10-28 21:40: "2) a good way to quickly measure skills impact to a card's contribution and therefore
// indirectly its strength - in a fair and balanced way"; step 3: "this will assume the skills are recosted well already. so far this seems
// hard to do."): a skill's worth in budget points, measured on the cards that carry it.
//   - Carriers: up to --carriers (3) cards of the context that carry skill X (cards already picked for another skill first, then cards with
//     fewer other skills). A skill on fewer than --min-real (2) cards also gets vanilla carriers: two plain cards of the pool (a Common and
//     an Uncommon / Rare, the ones nearest their full budget) given X as its real carrier has it (--no-synthetic skips such skills instead).
//   - Per carrier, paired swaps on the same fights (tools/bench/lib.js): the card with X and without X at the same stats (Δ_X), and the card
//     as it is with +1 Attack and with +1 Health (the yardstick). The bumps are pooled over every carrier of the run into one rate: win-rate
//     points per budget point (Attack 2 points, Health 1, as in the budget's 2A + H); an Archer's Attack bump is left out (it never swings).
//   - Worth = Δ_X / that rate, in budget points ("X is worth about k Attack-equivalents": k = worth / 2). Price = the cap-1 left side
//     (2A + H) x m + S of the carrier with X minus without X (bramblewood-budget.js via tools/skill_costs.js), as printed. Net = worth -
//     price (+ under-priced, - over-priced), z = net / its standard error (fights resampled through the per-fight mean over carriers).
//   - Per N: the carriers grouped by the skill's number, each group's worth against the table's price at that N.
// Nothing is written to canonical/skill-costs.json: --all writes a suggested-price file for the owner to review.
'use strict';
const path = require('path'), fs = require('fs');
const L = require('./lib.js');

const PARAM_RE = /(Hp|Grant|Uses)$/;
function isParam(gm, k) { return (gm.Budget.PARAMS || []).includes(k) || PARAM_RE.test(k); }
// the skills of a card: its keyword keys (not parameters) and its trigger entries as T:<on>><do>
function skillsOf(gm, d) {
  const e = d.effects || {}, out = Object.keys(e).filter(k => k !== 'triggers' && !isParam(gm, k));
  (Array.isArray(e.triggers) ? e.triggers : []).forEach(t => { if (t && t.on && t.do) out.push('T:' + t.on + '>' + t.do); });
  return [...new Set(out)];
}
const isTrig = s => s.startsWith('T:');
const withoutV = (card, s) => isTrig(s) ? { base: card, rmTrig: s.slice(2) } : { base: card, rm: [s] };
function addOf(gm, from, s) { // what giving skill s to a vanilla card adds, copied from a real carrier
  const e = gm.D[from].effects || {};
  if (isTrig(s)) return { addTrig: e.triggers.filter(t => t && (t.on + '>' + t.do) === s.slice(2)) };
  const add = { [s]: e[s] }; L.paramKeysOf(gm, e, s).forEach(p => { add[p] = e[p]; }); return { add };
}
function nOf(gm, d, s) { const e = d.effects || {}; if (isTrig(s)) { const t = (e.triggers || []).find(t => t && (t.on + '>' + t.do) === s.slice(2)); return t ? (+t.amount || +t.count || 1) : null; }
  const v = e[s]; return v === true ? 1 : typeof v === 'number' ? v : Array.isArray(v) ? L.numOf(v) : (v && typeof v === 'object' ? 'braces' : v == null ? null : String(v)); }

// the vanilla carriers: a Common and an Uncommon / Rare with no skill, Attack >= 1, Health >= 3, nearest their full budget
function vanillaOf(gm, X) {
  const pick = rs => X.pool.filter(id => { const d = gm.D[id]; return rs.includes(d.rarity) && !Object.keys(d.effects || {}).length && d.attack >= 1 && d.health >= 3; })
    .map(id => { const b = L.budgetOf(gm.D[id], X.level); return { id, u: Math.abs(1 - b.x1 / b.N) }; }).sort((a, b) => a.u - b.u || (a.id < b.id ? -1 : 1))[0];
  return [pick(['common']), pick(['uncommon', 'rare'])].filter(Boolean).map(x => x.id);
}
// the plan: for each skill, its carriers; skills ascending by how many cards carry them, cards reused across skills
function plan(gm, X, o, only) {
  const by = {}; X.pool.forEach(id => skillsOf(gm, gm.D[id]).forEach(s => (by[s] = by[s] || []).push(id)));
  const skills = (only || Object.keys(by)).filter(s => by[s] || o.synthetic !== false).sort((a, b) => (by[a] || []).length - (by[b] || []).length || (a < b ? -1 : 1));
  const used = new Set(), van = vanillaOf(gm, X), out = [], skipped = [];
  skills.forEach(s => {
    const real = (by[s] || []).slice().sort((a, b) => (used.has(b) - used.has(a)) || skillsOf(gm, gm.D[a]).length - skillsOf(gm, gm.D[b]).length || (a < b ? -1 : 1)).slice(0, o.carriers || 3);
    const cs = real.map(id => ({ card: id, synthetic: false, with: { base: id }, without: withoutV(id, s), n: nOf(gm, gm.D[id], s) }));
    if (real.length < (o.minReal || 2)) {
      if (o.synthetic === false || !real.length) { skipped.push({ skill: s, cards: real.length, why: real.length ? 'on fewer than ' + (o.minReal || 2) + ' cards (--no-synthetic)' : 'on no card of the pool' }); return; }
      van.forEach(v => { const a = addOf(gm, real[0], s); cs.push({ card: v, synthetic: true, from: real[0], with: Object.assign({ base: v }, a), without: { base: v }, n: nOf(gm, gm.D[real[0]], s) }); });
    }
    cs.forEach(c => used.add(c.card)); out.push({ skill: s, realCarriers: (by[s] || []).length, carriers: cs });
  });
  return { skills: out, skipped, vanilla: van };
}
function itemsOf(P) {
  const it = new Map(), add = v => it.set(L.vKey(v), { v });
  P.skills.forEach(s => s.carriers.forEach(c => { add(c.with); add(c.without); add({ base: c.card }); add({ base: c.card, dA: 1 }); add({ base: c.card, dH: 1 }); }));
  return [...it.values()];
}

// ---------------------------------------------------------------- the analysis
function rate(B, X, cards, M) { // the yardstick: win-rate points per budget point from the +1 Attack and +1 Health bumps on `cards`
  const gm = B.gm, fa = new Float64Array(M), fh = new Float64Array(M); let na = 0, nh = 0;
  cards.forEach(id => { const d = gm.D[id], base = B.scores(X, { base: id }, id, M), h = L.diff(B.scores(X, { base: id, dH: 1 }, id, M), base);
    for (let i = 0; i < M; i++) fh[i] += h[i]; nh++;
    if (d.attack != null && !(d.effects || {}).archer && !(d.effects || {}).hibernate) { const a = L.diff(B.scores(X, { base: id, dA: 1 }, id, M), base); for (let i = 0; i < M; i++) fa[i] += a[i]; na++; } });
  // per fight: the bumps' gain per budget point, (sum of Attack gains + sum of Health gains) / (2 na + nh)
  const per = new Float64Array(M); for (let i = 0; i < M; i++) per[i] = (fa[i] + fh[i]) / Math.max(1, 2 * na + nh);
  const ms = L.meanSE(per), A = L.meanSE(Array.from(fa).map(x => x / Math.max(1, na))), H = L.meanSE(Array.from(fh).map(x => x / Math.max(1, nh)));
  return { perPoint: ms.m, se: ms.se, attack: A.m, attackSE: A.se, health: H.m, healthSE: H.se, cards: cards.length, attackCards: na, attackInHealth: H.m ? L.r4(A.m / H.m) : null };
}
function skillRow(B, X, s, M, yard, tableEntry) {
  const gm = B.gm, { T } = L.costs(), cs = s.carriers, per = new Float64Array(M);
  const rows = cs.map(c => { const d = L.diff(B.scores(X, c.with, c.card, M), B.scores(X, c.without, c.card, M)); for (let i = 0; i < M; i++) per[i] += d[i] / cs.length;
    const pw = L.budgetOf(L.printedDef(gm, c.with), X.level), po = L.budgetOf(L.printedDef(gm, c.without), X.level), ms = L.meanSE(d);
    const own = rate(B, X, [c.card], M);
    return { card: c.card, name: gm.D[c.card].name, rarity: gm.D[c.card].rarity, synthetic: c.synthetic, from: c.from, n: c.n, delta: L.r4(ms.m), se: L.r4(ms.se), price: L.r4(pw.x1 - po.x1), Nwith: pw.N, Nwithout: po.N, ownRate: L.r4(own.perPoint), d };
  });
  const ms = L.meanSE(per), r = yard.perPoint, worth = ms.m / r, seW = Math.sqrt((ms.se / r) ** 2 + (ms.m * yard.se / (r * r)) ** 2);
  const price = rows.reduce((t, x) => t + x.price, 0) / rows.length, net = worth - price, z = seW ? net / seW : null;
  const ownR = rows.reduce((t, x) => t + (x.ownRate || 0), 0) / rows.length;
  // per N: carriers grouped by the skill's number
  const groups = {}; rows.forEach(x => { const k = String(x.n); (groups[k] = groups[k] || []).push(x); });
  const perN = Object.keys(groups).map(k => { const g = groups[k], pf = new Float64Array(M); g.forEach(x => { for (let i = 0; i < M; i++) pf[i] += x.d[i] / g.length; });
    const m = L.meanSE(pf), n = isNaN(+k) ? k : +k, tp = !isTrig(s.skill) && typeof n === 'number' ? T.skillCost(s.skill, n) : null;
    return { n, carriers: g.length, delta: L.r4(m.m), worth: L.r4(m.m / r), worthCI: L.r4(1.96 * m.se / r), price: L.r4(g.reduce((t, x) => t + x.price, 0) / g.length), tablePrice: tp == null ? null : L.r4(tp) }; })
    .sort((a, b) => (typeof a.n === 'number' ? a.n : 99) - (typeof b.n === 'number' ? b.n : 99));
  const conf = z == null ? 'low' : Math.abs(z) >= 2.5 ? 'high' : Math.abs(z) >= 1.5 ? 'medium' : 'low';
  rows.forEach(x => delete x.d);
  return { skill: s.skill, kind: isTrig(s.skill) ? 'trigger' : 'keyword', realCarriers: s.realCarriers, synthetic: rows.some(x => x.synthetic),
    table: tableEntry ? { value: tableEntry.value, scale: tableEntry.scale, pow: tableEntry.pow, logic: tableEntry.logic } : null,
    delta: L.r4(ms.m), deltaSE: L.r4(ms.se), worth: L.r4(worth), worthCI: L.r4(1.96 * seW), attackEq: L.r4(worth / 2), price: L.r4(price), net: L.r4(net), z: z == null ? null : Math.round(z * 100) / 100,
    verdict: conf === 'low' ? 'within noise' : net > 0 ? 'under-priced' : 'over-priced', confidence: conf, ownRateWorth: ownR > 0 ? L.r4(ms.m / ownR) : null, perN, carriers: rows };
}
// a suggested table price from the measured worth (scale n: value x N^pow; fixed: the worth; half: worth / (1 + floor(N/2))); logic-priced
// and trigger entries get the points only
function suggest(row, gm, X) {
  const e = row.table, ns = row.carriers.map(c => typeof c.n === 'number' ? Math.max(1, c.n) : 1), mean = f => ns.reduce((t, n) => t + f(n), 0) / ns.length;
  const base = { skill: row.skill, verdict: row.verdict, confidence: row.confidence, measuredWorth: row.worth, worthCI: row.worthCI, price: row.price, net: row.net, perN: row.perN.map(p => ({ n: p.n, worth: p.worth, ci: p.worthCI, price: p.price })) };
  if (row.kind === 'trigger') return Object.assign(base, { current: null, suggested: null, note: 'a trigger entry: priced as trigger weight x action value (canonical/skill-costs.json triggers / actions); the measured worth is for the entry as these cards carry it' });
  if (!e) return Object.assign(base, { current: null, suggested: null, note: 'no entry in canonical/skill-costs.json (priced by a rule in bramblewood-budget.js or the 1 + floor(N/2) default)' });
  if (e.logic) return Object.assign(base, { current: e, suggested: null, note: 'priced by the 4-round rule in bramblewood-budget.js (logic ' + e.logic + '): change the rule, not the value' });
  let v = null; const p = e.pow != null ? +e.pow : 1;
  if (e.scale === 'n') v = row.worth / mean(n => Math.pow(n, p)); else if (e.scale === 'half') v = row.worth / mean(n => 1 + (n > 1 ? Math.floor(n / 2) : 0)); else v = row.worth;
  return Object.assign(base, { current: e, suggested: { value: L.r4(Math.max(0, v)), scale: e.scale, pow: e.pow }, note: v < 0 ? 'measured worth below zero: the skill hurts these carriers; floor 0' : '' });
}

// ---------------------------------------------------------------- reports
const f1 = v => v == null ? '-' : (v >= 0 ? '+' : '') + v.toFixed(1);
function md(res) {
  const c = res.context, y = res.yardstick;
  const head = '| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |\n|---|---|---|---|---|---|---|---|---|---|---|';
  const line = (r, i) => `| ${i + 1} | ${r.skill} | ${r.verdict} | ${r.confidence} | ${f1(r.worth)} ± ${r.worthCI.toFixed(1)} | ${f1(r.attackEq)} | ${f1(r.price)} | ${f1(r.net)} | ${r.z} | ${r.carriers.map(x => x.name + (x.synthetic ? ' (vanilla)' : '')).join(', ')} | ${r.perN.length > 1 || typeof r.perN[0].n === 'number' ? r.perN.map(p => p.n + ': ' + f1(p.worth) + ' / ' + f1(p.price)).join('; ') : '-'} |`;
  return [`# Skill worth vs price (${c.name}, ${res.generated.slice(0, 10)})`, '',
    `Package TOOLS1 (T2). \`node tools/bench/bench.js skill --all --games ${c.fights}\` (${res.tool}); game fingerprint \`${res.fingerprint}\`. Suggested prices: \`${res.pricesFile}\` (nothing written to canonical/skill-costs.json).`, '',
    '## How it is measured', '',
    `- Per skill, up to ${res.settings.carriers} cards that carry it; a skill on fewer than ${res.settings.minReal} cards also gets vanilla carriers (${res.vanilla.join(', ')}) given the skill as its card has it. Each carrier plays ${c.fights} paired fights (the bench's slot of ${c.copies} copies, Level ${c.level}, the global field pool, Smart CPU both sides, 30-Health brambles): with the skill, without it at the same stats, and as printed with +1 Attack and with +1 Health.`,
    `- **The yardstick** (pooled over ${y.cards} carriers): +1 Attack on ${c.copies} copies = ${f1(y.attack * 100)} points, +1 Health = ${f1(y.health * 100)} points (1 Attack = ${y.attackInHealth} Health measured; the budget says 2). One budget point (2A + H) = **${(y.perPoint * 100).toFixed(2)} ± ${(y.se * 196).toFixed(2)} win-rate points**.`,
    '- **Measured worth** = the skill\'s paired gain / the yardstick, in budget points; **Attack-eq** = worth / 2. **Price now** = the carrier\'s cap-1 left side (2A + H) x m + S with the skill minus without it, as printed (`bramblewood-budget.js`). **Net** = worth - price: + under-priced (it gives more than it costs), - over-priced. z = net / its standard error; confidence high |z| >= 2.5, medium >= 1.5.',
    '- Read a low-confidence row as "not measurably mispriced at this many fights", not as "fair". Random decks: a skill that needs partners (a tribe, Lumber makers, a field) reads low.', '',
    `## The ${Math.min(15, res.ranked.length)} most mispriced (medium or high confidence first, by |net|)`, '', head, ...res.ranked.slice(0, 15).map(line), '',
    '## Every skill', '', head, ...res.ranked.map(line), '',
    res.skipped.length ? '## Skipped\n\n' + res.skipped.map(s => `- ${s.skill}: ${s.why}`).join('\n') + '\n' : ''].join('\n');
}
function rank(rows) { const w = r => r.confidence === 'high' ? 2 : r.confidence === 'medium' ? 1 : 0; return rows.slice().sort((a, b) => w(b) - w(a) || Math.abs(b.net) - Math.abs(a.net)); }
function latestYardstick(o) { const dir = o.out; if (!fs.existsSync(dir)) return null; const f = fs.readdirSync(dir).filter(x => /^bench-skills-.*\.json$/.test(x)).sort().pop(); if (!f) return null;
  try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); return j.fingerprint === L.fingerprint() && j.context && j.context.copies === o.k ? Object.assign(j.yardstick, { from: f }) : null; } catch (e) { return null; } }

async function main(B, o) {
  const X = B.context(L.csOf(o)), gm = B.gm, M = o.games;
  if (!o.all && !(o.skills || []).length) throw new Error('skill: name a skill (bench.js skill arrow) or --all');
  const P = plan(gm, X, o, o.all ? null : o.skills), items = itemsOf(P);
  B.log(`skill (${X.name}, Level ${X.level}, ${X.k} copies, ${M} fights a variant): ${P.skills.length} skill(s), ${new Set(P.skills.flatMap(s => s.carriers.map(c => c.card))).size} carrier cards, ${items.length} variants; skipped ${P.skipped.length}`);
  if (o.planOnly) return P;
  // a long run plays in skill order, so a stop leaves whole skills measured (re-run the same command to resume)
  await B.need(X, items, M);
  const table = {}; (L.costs().table.skills || []).forEach(e => table[e.id] = e);
  const carriers = [...new Set(P.skills.flatMap(s => s.carriers.map(c => c.card)))];
  // the yardstick: pooled over this run's carriers; a run of one or two skills borrows the last --all run's (same game) when it has one
  let yard = rate(B, X, carriers, M); yard.from = 'this run';
  const prev = !o.all ? latestYardstick(o) : null; if (prev && prev.cards > yard.cards) yard = prev;
  const rows = P.skills.map(s => skillRow(B, X, s, M, yard, table[s.skill]));
  const res = { tool: 'tools/bench/bench.js skill ' + L.VERSION, generated: new Date().toISOString(), fingerprint: L.fingerprint(),
    context: { name: X.name, kind: X.cs.kind, map: X.mapId, level: X.level, copies: X.k, seed: X.seed, fights: M, pool: X.pool.length, fields: X.fields.length },
    settings: { carriers: o.carriers || 3, minReal: o.minReal || 2, synthetic: o.synthetic !== false }, vanilla: P.vanilla,
    yardstick: Object.assign({}, yard, { perPoint: L.r4(yard.perPoint), se: L.r4(yard.se), attack: L.r4(yard.attack), health: L.r4(yard.health), attackSE: L.r4(yard.attackSE), healthSE: L.r4(yard.healthSE) }),
    skipped: P.skipped, ranked: rank(rows) };
  printRows(res, B.log);
  if (o.all || o.save) {
    fs.mkdirSync(o.out, { recursive: true }); const f = path.join(o.out, `bench-skills-${o.tag}.json`), pf = path.join(o.out, `bench-skill-prices-${o.tag}.json`);
    res.pricesFile = path.relative(L.ROOT, pf);
    fs.writeFileSync(f, JSON.stringify(res, null, 0).replace(/,"ranked":\[/, ',\n"ranked":[\n').replace(/\},\{"skill"/g, '},\n{"skill"') + '\n');
    fs.writeFileSync(f.replace(/\.json$/, '.md'), md(res));
    const sug = res.ranked.filter(r => r.confidence !== 'low').map(r => suggest(r, gm, X));
    fs.writeFileSync(pf, JSON.stringify({ about: 'Package TOOLS1 (T2): suggested skill prices from the workbench\'s measured worth (tools/bench/bench.js skill --all), for the owner to review. Nothing here is applied: canonical/skill-costs.json is unchanged. Only skills mispriced at medium or high confidence are listed. worth / price / net in budget points (2A + H + S).',
      source: path.relative(L.ROOT, f), generated: res.generated, fingerprint: res.fingerprint, yardstick: res.yardstick, skills: sug }, null, 1) + '\n');
    B.log('-> ' + path.relative(L.ROOT, f) + ' (+ .md), ' + res.pricesFile);
  }
  return res;
}
function printRows(res, log) {
  const y = res.yardstick; log(`yardstick (${y.from}, ${y.cards} cards): one budget point = ${(y.perPoint * 100).toFixed(2)} ± ${(y.se * 196).toFixed(2)} win-rate points; +1 Attack ${f1(y.attack * 100)}, +1 Health ${f1(y.health * 100)}`);
  log('skill                       worth (95%)     A-eq   price    net     z     verdict');
  res.ranked.forEach(r => log(`${r.skill.slice(0, 26).padEnd(26)} ${f1(r.worth).padStart(6)} ±${r.worthCI.toFixed(1).padStart(5)}  ${f1(r.attackEq).padStart(6)} ${f1(r.price).padStart(6)} ${f1(r.net).padStart(6)} ${String(r.z).padStart(6)}  ${r.verdict} (${r.confidence})` + (r.perN.length > 1 ? '  per N: ' + r.perN.map(p => p.n + ' ' + f1(p.worth) + '/' + f1(p.price)).join(', ') : '')));
}
module.exports = { main, plan, itemsOf, skillsOf, rate, skillRow, suggest, md, rank };
