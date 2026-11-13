#!/usr/bin/env node
// 2026-11-13 (package SIDE2): a second PRO search for a side map whose PRO search left only one deck after apply's overlap rule (The Ice Hollow:
// its open / cold / evasion decks each share 11 copies with PRO-1, so tests/deck1's "2-4 PRO decks" failed). The same focused search
// (tools/bench/deck.js, the plan's pool / anchor / level / 6-4 rule, budget 6000), this time keeping 10 copies apart from the kept PRO-1 and the
// map's BPRO decks (o.avoid); its decks are appended to the map's PRO result file (marked `extra`), then `refdecks apply --maps <map>` re-picks.
//   node tools/side2/pro_extra_2026_11_13.js <map id> [budget=6000]
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const ROOT = path.resolve(__dirname, '..', '..'), DIR = path.join(ROOT, 'docs', 'balance', 'side2', 'refdecks');
const mid = process.argv[2], budget = +process.argv[3] || 6000;
const DECK = path.join(ROOT, 'tools', 'bench', 'deck.js');
const T3 = require(DECK), O = require('../opt/deckopt.js');
(async () => {
  const gm = O.loadGame(ROOT), m = gm.G.CONQUEST_MAPS.find(x => x.id === mid), no2 = String(gm.G.mapNumberOf(mid)).padStart(2, '0');
  const plan = JSON.parse(fs.readFileSync(path.join(DIR, 'refdecks-plan-2026-11-11.json'), 'utf8')).maps[mid].pro;
  const PRO = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps[mid];
  const avoid = (PRO.pro || []).slice(0, 1).concat(PRO.bpro || []).map(d => d.deck);
  const tmp = path.join(DIR, 'pro-extra');
  const res = await T3.main({ map: mid, mode: 'map-true', pool: plan.pool, anchor: plan.anchor.length ? plan.anchor : null, anchorMin: plan.anchorMin, focus: plan.focuses.filter(f => f !== 'swarm'), level: 1,
    budget, finalGames: 24, maxUnique: 6, maxCopies: 4, size: 20, seed: 'side2-pro-extra', workers: 2, out: tmp, tag: '2026-11-13', quiet: true, apart: 10, avoid });
  const far = d => avoid.every(a => O.dist(d, a) >= 10), got = res.decks.filter(d => far(d.deck));
  const pf = path.join(DIR, 'pro', `bench-deck-map${no2}-${mid}-2026-11-11.json`), j = JSON.parse(fs.readFileSync(pf, 'utf8'));
  j.decks = j.decks.filter(d => !d.extra).concat(got.map(d => Object.assign({}, d, { extra: 'SIDE2 second search 10 copies apart from PRO-1 / BPRO (tools/side2/pro_extra_2026_11_13.js, ' + path.relative(ROOT, tmp) + ')' })));
  j.decks.sort((a, b) => b.score - a.score); fs.writeFileSync(pf, JSON.stringify(j, null, 1) + '\n');
  console.log(mid, 'extra PRO decks 10+ copies apart:', got.map(d => d.focus + ' ' + d.score + ' ' + JSON.stringify(d.deck)).join(' | ') || 'none');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
