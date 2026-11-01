#!/usr/bin/env node
// 2026-11-02 (package BAL9; owner JJ7: "Report per map: packs opened and level reached by then", "can I get a sensing"): per main map 0-20,
// what a player holds arriving there under the road economy of tools/opt/ref5_prog.js (REF5's player: first clears, fight cards, the end-of-map
// and free packs, the faction track, the level track, the Trail's free lane at a map a day, 1.0x of the Leaves spent on the map's packs; x1.5
// for the repeatable income ECON1 halved), averaged over its five seeded players: packs opened by then (bought, and given by the road), cards and
// distinct cards owned, the player (XP) level, the Forge levels the 0.5x Forge share could buy on a typical deck, and the card level the reference
// decks play at (referencePlayerLevel, rounded: BAL9's "map's average").
//   node tools/bal9/econ_2026_11_02.js [--to 20]   -> docs/balance/bal9/econ-2026-11-02.json + .md
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const R5 = require(path.join(ROOT, 'tools', 'opt', 'ref5_prog.js'));
const to = +(process.argv[process.argv.indexOf('--to') + 1] || 20) || 20;
const gm = R5.game(), set = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, R5.SET), 'utf8')); } catch (e) { return null; } })();
const rows = [];
const acc = {};
for (const s of R5.SEEDS) {
  // the decks the earlier maps chose (the Forge levels the chosen deck); without one the Forge spends on nothing
  const st = R5.walk(s, to, n => { const l = set && set.decks && set.decks[n]; const e = l && l.find(x => x.seed === s); return e ? e.counts : null; }, { finish: true });
  let packs = 0, bought = 0, cards = 0, forge = 0;
  st.log.concat([st.arrival]).forEach(r => {
    const a = acc[r.map] = acc[r.map] || { packsBefore: [], boughtBefore: [], cardsBefore: [], forgeBefore: [], packsHere: [], plLevel: [] };
    // everything logged up to and including the arrival's purchases at map r.map
    const p = Object.values(r.packs || {}).reduce((t, k) => t + k, 0), b = Object.values(r.bought || {}).reduce((t, k) => t + k, 0);
    // a map's log entry holds its arrival purchases and then its own fights' rewards: "by then" = the earlier maps' entries + this arrival's packs
    const boughtCards = Object.entries(r.why || {}).filter(([k]) => /^bought /.test(k)).reduce((t, [, k]) => t + k, 0);
    a.packsBefore.push(packs + b); a.boughtBefore.push(bought + b); a.cardsBefore.push(cards + boughtCards); a.forgeBefore.push(forge + (r.forgeLevels || 0)); a.packsHere.push(p);
    packs += p; bought += b; cards += (r.cards || []).length; forge += r.forgeLevels || 0;
  });
}
// the player level at arrival: walk again per map (xp is only kept at the end)
const plAt = {}; for (const s of R5.SEEDS) for (let m = 0; m <= to; m++) { const st = R5.walk(s, m, () => null); (plAt[m] = plAt[m] || []).push(st.plLevel); }
const mean = a => a.reduce((t, x) => t + x, 0) / Math.max(1, a.length), r1 = v => Math.round(v * 10) / 10;
const mains = R5.mainMaps(gm.G);
for (let m = 0; m <= to; m++) { const a = acc[m]; if (!a) continue;
  rows.push({ map: m, id: mains[m].id, name: mains[m].name, packsOpened: r1(mean(a.packsBefore)), packsBought: r1(mean(a.boughtBefore)), cardsOwnedCopies: r1(mean(a.cardsBefore)), playerLevel: r1(mean(plAt[m])), forgeLevelsBought: r1(mean(a.forgeBefore)), deckLevel: Math.round(gm.G.referencePlayerLevel(m)), refLevelExact: gm.G.referencePlayerLevel(m) }); }
const out = { _about: 'BAL9 (2026-11-02, owner JJ7): per main map, at arrival, averaged over REF5\'s five seeded players (tools/bal9/econ_2026_11_02.js over tools/opt/ref5_prog.js walk). packsOpened counts every pack opened by then (bought + the road\'s end-of-map, free, Trail, level-track and fight packs); packsBought the shop packs alone; cardsOwnedCopies every copy the road and the packs gave (the starting Base and starter cards not counted); playerLevel the XP level; forgeLevelsBought the card levels the 0.5x Forge share bought on the chosen decks (from Map 11); deckLevel the level the reference decks play at.', built: '2026-11-02', mult: R5.MULT, pace: R5.TRAIL_PACE, rows };
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal9'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal9', 'econ-2026-11-02.json'), JSON.stringify(out, null, 1) + '\n');
const md = ['# Packs and levels by map (BAL9, 2026-11-02)', '', out._about, '', '| Map | Name | Packs opened by then | of them bought | Copies received | Player level | Card level of the reference decks |', '|---|---|---|---|---|---|---|']
  .concat(rows.map(r => `| ${r.map} | ${r.name} | ${r.packsOpened} | ${r.packsBought} | ${r.cardsOwnedCopies} | ${r.playerLevel} | ${r.deckLevel}${r.refLevelExact !== r.deckLevel ? ' (' + r.refLevelExact + ')' : ''} |`));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal9', 'econ-2026-11-02.md'), md.join('\n') + '\n');
rows.forEach(r => console.log(`Map ${String(r.map).padStart(2)} ${r.name.padEnd(24)} packs ${String(r.packsOpened).padStart(5)} (bought ${String(r.packsBought).padStart(5)})  copies ${String(r.cardsOwnedCopies).padStart(5)}  player Lv ${r.playerLevel}  deck Lv ${r.deckLevel}`));
