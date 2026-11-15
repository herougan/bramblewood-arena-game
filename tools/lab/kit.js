#!/usr/bin/env node
// 2026-11-16 (package LAB1): the Lab's game-side helper, run with a snapshot's root so it requires that commit's own tools:
//   node kit.js <root> meta                      cards, maps and fights for the UI's pickers
//   node kit.js <root> affected <cardId>         fights whose enemy deck or reference deck holds the card
//   node kit.js <root> journey <params.json> <out.json> <seed,seed,...>
// The journey: tools/opt/ref5_prog.js walk (the game's first clears, packs, faction and level tracks, seeded pack draws) to Map N, a deck
// at every arrival built by tools/ref6/ladder.js's library rule (no games), then the farming days (packs bought from repeat income).
'use strict';
const fs = require('fs'), path = require('path');
const [ROOT, CMD, ...ARGS] = process.argv.slice(2);
const T = rel => require(path.join(ROOT, rel));
const out = o => process.stdout.write(JSON.stringify(o) + '\n');
const tot = d => Object.values(d).reduce((t, k) => t + k, 0);

function meta() {
  const O = T('tools/opt/deckopt.js'), gm = O.loadGame(ROOT), G = gm.G;
  const cards = Object.keys(gm.D).filter(id => O.deckable(gm, id)).sort().map(id => { const d = gm.D[id]; return { id, name: d.name || id, rarity: d.rarity || 'common', cost: d.cost, attack: d.attack, health: d.health, wait: d.wait }; });
  const own = m => [...new Set(((gm.pools[m.id] || {}).cards || []).concat(...(m.nodes || []).filter(n => n.deck && n.kind !== 'tutorial').map(n => Object.keys(n.deck))))].filter(id => O.deckable(gm, id)).sort();
  const maps = G.CONQUEST_MAPS.filter(m => !m.reserved && G.mapNumberOf(m.id) != null).map(m => ({ id: m.id, no: G.mapNumberOf(m.id), name: m.name, side: !!m.sub, cards: m.sub ? undefined : own(m) }));
  const fights = []; G.CONQUEST_MAPS.forEach(m => { const no = G.mapNumberOf(m.id); (m.nodes || []).filter(n => n.deck && n.kind !== 'tutorial').forEach(n => fights.push({ id: m.id + ':' + n.key, map: m.id, key: n.key, code: n.code || n.key, mapNo: no, side: !!m.sub, kind: n.kind || 'skirmish', name: n.name || '' })); });
  out({ cards, maps, fights });
}

function affected(card) {
  const B = T('tools/lib_bramble.js'), G = B.G, keys = [];
  G.CONQUEST_MAPS.forEach(m => (m.nodes || []).filter(n => n.deck && n.kind !== 'tutorial').forEach(n => {
    let ref = {}; try { ref = G.referenceDeckFor(m.id, n).deck || {}; } catch (e) { /* no reference deck */ }
    if ((n.deck || {})[card] || ref[card]) keys.push(m.id + ':' + n.key);
  }));
  out({ card, fights: keys });
}

// tools/ref6/ladder.js keeps library / buildDeck private; read them out of its source (the lib_bramble way) rather than copy them.
function ladderFns() {
  const src = fs.readFileSync(path.join(ROOT, 'tools/ref6/ladder.js'), 'utf8');
  const grab = n => { const m = new RegExp('^function ' + n + '\\([\\s\\S]*?^\\}', 'm').exec(src); if (!m) throw new Error('ladder.js: no ' + n); return m[0]; };
  const R5 = () => T('tools/opt/ref5_prog.js'), O = () => T('tools/opt/deckopt.js'), B24 = () => T('tools/bal24/ladder_sim_2026_11_07.js');
  return new Function('fs', 'path', 'ROOT', 'R5', 'O', 'B24', 'tot', grab('library') + '\n' + grab('buildDeck') + '\nreturn {library, buildDeck};')(fs, path, ROOT, R5, O, B24, tot);
}

function journey(params, outFile, seeds) {
  const R5 = T('tools/opt/ref5_prog.js'), O = T('tools/opt/deckopt.js'), LA = T('tools/ref6/ladder.js'), L = ladderFns();
  const gm = O.loadGame(ROOT), g5 = R5.game(), G = gm.G, P5 = g5.P, N = +params.to, farm = +params.farmDays || 0, inc = params.farmIncome || { gold: 0, gems: 0, dust: 0 };
  const mains = R5.mainMaps(G), legal = LA.legalFilter(gm), libs = {};
  const lib = i => libs[i] || (libs[i] = L.library(gm, mains[i], { id: mains[i].id }));
  const power = d => Object.keys(d).reduce((t, id) => t + d[id] * G.skirmishCardScore(gm.D[id]), 0) / Math.max(1, tot(d));
  const deckAt = (coll, unlimited, i) => { try { return L.buildDeck(gm, g5, lib(i), legal, coll, unlimited, i); } catch (e) { return { counts: null, error: e.message }; } };
  const result = {};
  for (const seed of seeds) {
    const label = 'lab-' + seed, at = {};
    const st = R5.walk(label, N, () => null, { arrive: (i, s) => {
      const coll = Object.assign({}, s.owned), d = deckAt(coll, s.unlimited, i), sum = R5.stateSummary(g5, s, i);
      at[i] = { map: i, distinct: Object.keys(coll).length, copies: tot(coll), deck: d.counts, leader: d.leader || null, power: d.counts ? power(d.counts) : null, error: d.error,
        packBank: Math.round(s.packBank.gold), gems: Math.round(s.packBank.gems), forgeGold: Math.round(s.forgeBank.gold), forgeDust: Math.round(s.forgeBank.dust), dust: Math.round(s.idleDust), xp: s.xp,
        pool: { pool: sum.pool, copies: sum.copies, levels: sum.levels } };
    } });
    // the farming days at Map N: repeat income buys the map's pack series (walk's buyPacks rule), opened by the game's rollPackCards
    const rt = g5.rt, shop = id => P5.SHOP_PACKS_DEFAULT.find(p => p.id === id), SALE = { bronze: 5, silver: 8, gold: 13 }, series = ['gold', 'silver', 'bronze'];
    const order = series.slice(series.indexOf(P5.mapEndPackId(N))).filter(id => SALE[id] <= N); rt.reach = N;
    const bank = { gold: 0, gems: 0, dust: at[N] ? at[N].dust : 0 }, farmLog = []; let packs = 0;
    for (let day = 1; day <= farm; day++) {
      bank.gold += inc.gold; bank.gems += inc.gems; bank.dust += inc.dust;
      for (const id of order) { const p = shop(id); while (p && bank.gold >= (p.cost.gold || 0) && bank.gems >= (p.cost.gems || 0)) { bank.gold -= p.cost.gold || 0; bank.gems -= p.cost.gems || 0; packs++;
        P5.rollPackCards(Object.assign({}, p, { metal: 0, kroon: 0 }), null).forEach(id2 => { const k = O.deckable(gm, id2) && !O.isFactionCard(gm, id2) ? (rt.rnd() < P5.bonusCopyChance((gm.D[id2] || {}).rarity) ? 2 : 1) : 0; if (k) { st.owned[id2] = (st.owned[id2] || 0) + k; rt.owned[id2] = st.owned[id2]; } }); } }
      if (day === farm || day % 5 === 0) { const d = deckAt(Object.assign({}, st.owned), st.unlimited, N); farmLog.push({ day, distinct: Object.keys(st.owned).length, copies: tot(st.owned), packs, gold: Math.round(bank.gold), dust: Math.round(bank.dust), deck: d.counts, power: d.counts ? power(d.counts) : null }); }
    }
    result[seed] = { seed: label, maps: at, farm: farmLog, log: st.log.map(r => ({ map: r.map, earned: r.earned, packs: r.packs, bought: r.bought, newCards: r.cards.length })) };
  }
  fs.writeFileSync(outFile, JSON.stringify(result));
}

if (CMD === 'meta') meta();
else if (CMD === 'affected') affected(ARGS[0]);
else if (CMD === 'journey') journey(JSON.parse(fs.readFileSync(ARGS[0], 'utf8')), ARGS[1], ARGS[2].split(',').filter(Boolean));
else { console.error('kit.js <root> meta | affected <card> | journey <params> <out> <seeds>'); process.exit(2); }
